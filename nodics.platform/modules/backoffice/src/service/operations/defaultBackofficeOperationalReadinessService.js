/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module backoffice/service/operations/DefaultBackofficeOperationalReadinessService
 * @description Validates layered BackOffice deployment policy and derives low-disclosure operational readiness and alert codes from owning diagnostics.
 * @layer service
 * @owner backoffice
 * @override Environments may tighten requirements and thresholds while preserving source authority and stable alert semantics.
 */
module.exports = {
    _lastPublishedSignature: null,
    _findingAcknowledgements: Object.create(null),
    /** Registers configuration validity as a required readiness contributor. */
    init: function () {
        if (SERVICE.DefaultHealthService) SERVICE.DefaultHealthService.registerReadinessContributor('backofficeOperationalConfiguration', {
            required: true, order: 391, description: 'BackOffice operational configuration is valid',
            check: () => this.validateConfiguration().valid
        });
        return Promise.resolve(true);
    },
    /** Completes operational readiness initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns layered operations policy. */
    getConfiguration: function () { return (CONFIG.get('backofficeRegistry') || {}).operations || {}; },
    /** Safely resolves a layered configuration path without exposing the value to clients. */
    resolveConfigurationPath: function (path) {
        let segments = String(path || '').split('.').filter(Boolean);
        if (segments.length === 0) return undefined;
        let value = CONFIG.get(segments.shift());
        while (segments.length > 0 && value !== undefined && value !== null) {
            value = value[segments.shift()];
        }
        return value;
    },
    /** Returns true when a configured value looks like a sample/local bootstrap secret. */
    isSampleOrLocalValue: function (value) {
        if (typeof value !== 'string') return false;
        let normalized = value.trim().toLowerCase();
        if (!normalized) return false;
        if (normalized === 'adminpassword') return true;
        return ['sample', 'local', 'test', 'default', 'change-me', 'changeme', 'placeholder']
            .some(fragment => normalized.includes(fragment));
    },
    /** Creates one client-safe startup finding. */
    startupFinding: function (code, severity, owner, message, action, options) {
        options = options || {};
        let finding = {
            code: String(code),
            severity: ['ERROR', 'WARNING', 'INFO'].includes(String(severity)) ? String(severity) : 'WARNING',
            owner: String(owner || 'backoffice'),
            ownerType: String(options.ownerType || 'CONFIGURATION'),
            propertyPath: options.propertyPath ? String(options.propertyPath) : undefined,
            message: String(message),
            action: String(action),
            dismissible: options.dismissible === true,
            auditRequired: options.auditRequired === true,
            repair: this.startupRepair(options.repair, options),
        };
        if (options.acknowledgement) finding.acknowledgement = options.acknowledgement;
        return finding;
    },
    /** Returns the authenticated human/service principal for audit-safe evidence. */
    principal: function (request) {
        let auth = request && request.authData || {};
        return String(auth.loginId || auth.userId || auth.principalId || auth.clientId || 'unknown');
    },
    /** Creates a stable acknowledgement key without storing property values. */
    acknowledgementKey: function (tenant, code, propertyPath) {
        return [tenant || 'default', code || 'UNKNOWN', propertyPath || ''].map(value => String(value)).join('|');
    },
    /** Returns current bounded acknowledgement evidence for one startup finding. */
    findAcknowledgement: function (request, code, propertyPath) {
        let record = this._findingAcknowledgements[this.acknowledgementKey(request && request.tenant, code, propertyPath)];
        if (!record) return undefined;
        return {
            acknowledged: true,
            acknowledgedAt: record.acknowledgedAt,
            acknowledgedBy: record.acknowledgedBy,
            reasonCode: record.reasonCode,
        };
    },
    /** Creates bounded repair metadata for startup/configuration findings. */
    startupRepair: function (repair, options) {
        options = options || {};
        repair = repair || {};
        let available = repair.available === true;
        let metadata = {
            available: available,
            operation: String(repair.operation || options.repairOperation || (available ? 'runtimeConfiguration.update' : 'manual.review')),
            actionCode: String(repair.actionCode || options.repairActionCode || (available ? 'UPDATE_CONFIGURATION' : 'REVIEW_OWNER')),
            eligibility: ['AUTOMATIC', 'MANUAL', 'NOT_AVAILABLE'].includes(String(repair.eligibility)) ?
                String(repair.eligibility) : (available ? 'MANUAL' : 'NOT_AVAILABLE'),
            label: String(repair.label || options.repairLabel || (available ? 'Update configuration' : 'Review owning configuration')),
            idempotent: repair.idempotent === undefined ? true : repair.idempotent === true,
            requiresConfirmation: repair.requiresConfirmation === undefined ? available : repair.requiresConfirmation === true,
        };
        if (!available) metadata.unavailableReason = String(repair.unavailableReason || options.repairUnavailableReason ||
            'No governed automatic repair is available for this finding. Use the owning configuration or runtime capability.');
        return metadata;
    },
    /** Validates mandatory non-secret property presence declared by owning modules. */
    collectMandatoryPropertyFindings: function (policy, request) {
        return [].concat(policy.requiredProperties || []).map(rule => {
            let value = this.resolveConfigurationPath(rule.path);
            if (value !== undefined && value !== null && String(value).trim() !== '') return undefined;
            let code = rule.code || 'MANDATORY_CONFIGURATION_MISSING';
            return this.startupFinding(
                code,
                rule.severity || 'ERROR',
                rule.owner || 'backoffice',
                rule.message || 'A mandatory runtime configuration value is missing.',
                rule.action || 'Add the value in the owning module, server, tenant, or external configuration layer.',
                { ownerType: rule.ownerType, propertyPath: rule.path, dismissible: rule.dismissible, auditRequired: rule.auditRequired,
                    acknowledgement: this.findAcknowledgement(request, code, rule.path),
                    repair: rule.repair || { available: true, operation: 'runtimeConfiguration.update',
                        actionCode: 'UPDATE_REQUIRED_CONFIGURATION', eligibility: 'MANUAL',
                        label: 'Add required configuration', idempotent: true, requiresConfirmation: true } }
            );
        }).filter(Boolean);
    },
    /** Flags configured default/sample values without returning the sensitive value. */
    collectDefaultValueRiskFindings: function (policy, request) {
        return [].concat(policy.defaultValueRisks || []).map(rule => {
            let value = this.resolveConfigurationPath(rule.path);
            if (value === undefined || value === null || String(value).trim() === '') return undefined;
            let risky = rule.match === 'SAMPLE_OR_LOCAL_STRING' ? this.isSampleOrLocalValue(value) : false;
            if (!risky) return undefined;
            let code = rule.code || 'DEFAULT_CONFIGURATION_VALUE_ACTIVE';
            return this.startupFinding(
                code,
                rule.severity || 'WARNING',
                rule.owner || 'backoffice',
                rule.message || 'A sample/default runtime configuration value is active.',
                rule.action || 'Replace the value through the owning configuration layer before non-local use.',
                { ownerType: rule.ownerType, propertyPath: rule.path, dismissible: rule.dismissible !== false,
                    acknowledgement: this.findAcknowledgement(request, code, rule.path),
                    auditRequired: rule.auditRequired !== false, repair: rule.repair || { available: true,
                        operation: 'runtimeConfiguration.update', actionCode: 'ROTATE_DEFAULT_CONFIGURATION',
                        eligibility: 'MANUAL', label: 'Rotate default value', idempotent: true,
                        requiresConfirmation: true } }
            );
        }).filter(Boolean);
    },
    /** Reports bootstrap repair/self-healing prerequisites without exposing values. */
    collectBootstrapChecks: function (policy) {
        return [].concat(policy.bootstrapChecks || []).map(rule => {
            let value = this.resolveConfigurationPath(rule.path);
            let ready = value !== undefined && value !== null && String(value).trim() !== '';
            return {
                code: String(rule.code || 'BOOTSTRAP_CHECK'),
                state: ready ? 'READY' : 'MISSING',
                owner: String(rule.owner || 'backoffice'),
                ownerType: String(rule.ownerType || 'CONFIGURATION'),
                propertyPath: rule.path ? String(rule.path) : undefined,
                message: String(rule.message || (ready ? 'Bootstrap prerequisite is resolved.' : 'Bootstrap prerequisite is missing.')),
                action: String(rule.action || 'Repair the owning layered configuration and restart the affected runtime.'),
                auditRequired: rule.auditRequired === true
            };
        });
    },
    /** Maps operational configuration failures to startup findings with repair guidance. */
    collectConfigurationFailureFindings: function (request) {
        let messages = {
            LEASE_TTL_NOT_GREATER_THAN_SWEEP: 'Registry lease timing is invalid.',
            DISTRIBUTED_STORE_REQUIRED: 'A distributed registry store is required by policy.',
            DISTRIBUTED_STORE_COORDINATES_INVALID: 'Distributed registry store coordinates are incomplete.',
            AVAILABILITY_PRESSURE_LIMIT_INVALID: 'Runtime availability pressure limits are invalid.',
            AVAILABILITY_FRESHNESS_INVALID: 'Availability freshness timing is invalid.',
            OPERATION_THRESHOLD_INVALID: 'Operational readiness thresholds are invalid.',
            OPERATION_SAMPLE_LIMIT_INVALID: 'Operational sample limits are invalid.',
            PRODUCTION_DISTRIBUTED_STORE_REQUIRED: 'Production mode requires a distributed registry store.',
            PRODUCTION_HTTPS_REQUIRED: 'Production mode requires HTTPS-only runtime registration.',
            PRODUCTION_HOST_ALLOWLIST_REQUIRED: 'Production mode requires runtime host allowlists.',
            PRODUCTION_AUDIT_DELIVERY_REQUIRED: 'Production mode requires strict audit delivery.',
            PRODUCTION_AUDIT_PUBLISHER_UNAVAILABLE: 'The configured production audit publisher is unavailable.',
            PRODUCTION_ALERT_DELIVERY_REQUIRED: 'Production mode requires strict alert delivery.',
            PRODUCTION_ALERT_PUBLISHER_UNAVAILABLE: 'The configured production alert publisher is unavailable.',
            PRODUCTION_HUMAN_ADMIN_REQUIRED: 'Production mode requires human administrator actions.'
        };
        return this.validateConfiguration().failures.map(code => this.startupFinding(
            code,
            'ERROR',
            'backoffice',
            messages[code] || 'BackOffice operational configuration is invalid.',
            'Repair the owning BackOffice operations configuration and restart the affected runtime.',
            { ownerType: 'BACKOFFICE_OPERATIONS', dismissible: false, auditRequired: true,
                acknowledgement: this.findAcknowledgement(request, code),
                repair: { available: false, operation: 'backoffice.operations.configure',
                    actionCode: 'REPAIR_BACKOFFICE_OPERATIONS_CONFIGURATION', eligibility: 'NOT_AVAILABLE',
                    label: 'Repair BackOffice operations configuration', idempotent: true,
                    requiresConfirmation: false,
                    unavailableReason: 'BackOffice operations policy is source/layer owned and must be repaired in the owning configuration before restart.' } }
        ));
    },
    /** Produces a sanitized startup/configuration validation report for Axis and operators. */
    startupValidationReport: function (request) {
        let operations = this.getConfiguration();
        let policy = operations.startupValidation || {};
        if (policy.enabled === false) {
            return { state: 'READY', checkedAt: new Date().toISOString(), source: 'backoffice.operationalReadiness',
                summary: { total: 0, errors: 0, warnings: 0, info: 0, dismissible: 0, acknowledged: 0 },
                bootstrapChecks: { total: 0, ready: 0, missing: 0, needsAttention: 0, checks: [] }, findings: [] };
        }
        let findings = []
            .concat(this.collectConfigurationFailureFindings(request))
            .concat(this.collectMandatoryPropertyFindings(policy, request))
            .concat(this.collectDefaultValueRiskFindings(policy, request))
            .filter(Boolean)
            .sort((left, right) => {
                let order = { ERROR: 0, WARNING: 1, INFO: 2 };
                return order[left.severity] - order[right.severity] || left.code.localeCompare(right.code);
            });
        let summary = findings.reduce((result, finding) => {
            result.total++;
            if (finding.severity === 'ERROR') result.errors++;
            else if (finding.severity === 'WARNING') result.warnings++;
            else result.info++;
            if (finding.dismissible === true) result.dismissible++;
            if (finding.acknowledgement && finding.acknowledgement.acknowledged === true) result.acknowledged++;
            return result;
        }, { total: 0, errors: 0, warnings: 0, info: 0, dismissible: 0, acknowledged: 0 });
        let bootstrapCheckItems = this.collectBootstrapChecks(policy);
        let bootstrapChecks = bootstrapCheckItems.reduce((result, check) => {
            result.total++;
            if (check.state === 'READY') result.ready++;
            else if (check.state === 'MISSING') result.missing++;
            else result.needsAttention++;
            return result;
        }, { total: 0, ready: 0, missing: 0, needsAttention: 0, checks: bootstrapCheckItems });
        return {
            state: summary.errors > 0 ? 'NOT_READY' : summary.warnings > 0 ? 'NEEDS_ATTENTION' : 'READY',
            checkedAt: new Date().toISOString(),
            source: 'backoffice.operationalReadiness',
            summary: summary,
            bootstrapChecks: bootstrapChecks,
            findings: findings
        };
    },
    /** Creates one shared readiness blocker with stable business/user recovery fields. */
    readinessBlocker: function (code, severity, ownerType, source, action, message, options) {
        options = options || {};
        return {
            blockerCode: String(code),
            code: String(code),
            severity: String(severity || 'NEEDS_ATTENTION'),
            ownerType: String(ownerType || 'BACKOFFICE'),
            source: String(source || 'BACKOFFICE_OPERATIONAL_READINESS'),
            action: String(action || 'Review readiness'),
            message: String(message || 'Readiness needs review.'),
            disabledReason: String(options.disabledReason || message || 'Readiness needs review.'),
            repair: {
                available: options.repairAvailable === true,
                operation: String(options.repairOperation || 'readiness.review'),
                action: String(options.repairAction || 'REVIEW_READINESS'),
                eligibility: String(options.repairEligibility || (options.repairAvailable === true ? 'MANUAL' : 'NOT_AVAILABLE')),
                label: String(options.repairLabel || action || 'Review readiness'),
            },
            suggestedAction: String(options.suggestedAction || action || 'Review readiness'),
        };
    },
    /** Maps module availability into a compact support-safe readiness section. */
    moduleRuntimeSection: function (modules, availability) {
        modules = modules || {};
        availability = availability || {};
        let entries = Object.entries(modules).reduce((result, entry) => result.concat(entry[1] || []), []);
        let runtimeCount = entries.length;
        let unavailable = Object.entries(availability).filter(entry => !['UP', 'UNKNOWN'].includes(String((entry[1] || {}).state || 'UNKNOWN')));
        let blocker = unavailable[0] ? this.readinessBlocker(
            'RUNTIME_UNAVAILABLE',
            'BLOCKED',
            'RUNTIME',
            'BACKOFFICE_AVAILABILITY',
            'Open Module Registry',
            'One or more registered runtimes are degraded or unavailable.',
            { repairOperation: 'moduleRegistry.refreshRuntime', repairAction: 'REFRESH_RUNTIME', suggestedAction: 'Refresh Module Registry and inspect stale runtime observations.' }
        ) : undefined;
        return {
            key: 'runtimeCommunication',
            title: 'Runtime internal communication',
            businessStatus: unavailable.length > 0 ? 'NEEDS_ATTENTION' : runtimeCount > 0 ? 'READY' : 'NOT_CONFIGURED',
            ownerModule: 'nService',
            source: 'BACKOFFICE_BOOTSTRAP',
            route: '/system/modules',
            summary: { runtimeCount: runtimeCount, unavailableCount: unavailable.length },
            blockers: blocker ? [blocker] : [],
            nextAction: unavailable.length > 0 ? 'Open Module Registry and repair unavailable runtime communication.' :
                runtimeCount > 0 ? 'Runtime communication has active bootstrap evidence.' : 'Register runtime modules before validating communication.',
        };
    },
    /** Summarizes application initialization capability readiness profiles. */
    applicationSection: function (profiles) {
        profiles = [].concat(profiles || []);
        let blockers = profiles.length === 0 ? [this.readinessBlocker(
            'APPLICATION_PROFILES_MISSING',
            'NEEDS_ATTENTION',
            'APPLICATION_INITIALIZATION',
            'BACKOFFICE_APPLICATION_INITIALIZATION',
            'Open Setup & Accelerators',
            'No application initialization profiles are visible to this operator.',
            { repairOperation: 'applicationInitialization.reviewProfiles', repairAction: 'REVIEW_APPLICATION_PROFILES' }
        )] : [];
        return {
            key: 'applications',
            title: 'Customer application readiness',
            businessStatus: blockers.length ? 'NEEDS_ATTENTION' : 'READY',
            ownerModule: 'backoffice',
            source: 'BACKOFFICE_APPLICATION_INITIALIZATION',
            route: '/publishing',
            summary: { profileCount: profiles.length },
            blockers: blockers,
            nextAction: blockers.length ? 'Open Setup & Accelerators and initialize required profiles.' : 'Application profiles are available for Setup & Accelerators.',
        };
    },
    /** Summarizes documentation source visibility and publication guidance. */
    documentationSection: function (sources, publicationState) {
        sources = [].concat(sources || []);
        let bySource = (publicationState || {}).bySourceId || {};
        let pending = sources.filter(source => {
            if (!source || !source.id) return false;
            let state = bySource[String(source.id)];
            return source.type === 'CMS' && (!state || state.ready !== true);
        });
        let blockers = [];
        if (sources.length === 0) blockers.push(this.readinessBlocker(
            'DOCUMENTATION_SOURCES_MISSING',
            'NEEDS_ATTENTION',
            'DOCUMENTATION',
            'BACKOFFICE_DOCUMENTATION',
            'Open Documentation Dashboard',
            'No documentation sources are visible to this operator.',
            { repairOperation: 'documentation.installSources', repairAction: 'INSTALL_DOCUMENTATION_SOURCES' }
        ));
        pending.forEach(source => {
            let state = bySource[String(source.id)] || {};
            let blocker = this.readinessBlocker(
                'DOCUMENTATION_PUBLICATION_PENDING',
                'NEEDS_ATTENTION',
                'PUBLICATION',
                'DOCUMENTATION_PUBLICATION',
                'Open Documentation Dashboard',
                'Documentation pack is not Online-ready: ' + String(source.label || source.id),
                { repairOperation: 'documentation.publish', repairAction: 'PUBLISH_DOCUMENTATION',
                    suggestedAction: 'Install staged content, request approval, approve, and publish the documentation pack Online.' }
            );
            blocker.sourceId = String(source.id);
            blocker.route = source.route ? String(source.route) : undefined;
            blocker.readiness = state.readiness ? String(state.readiness) : 'UNKNOWN';
            blockers.push(blocker);
        });
        return {
            key: 'documentation',
            title: 'Documentation publishing and indexing',
            businessStatus: blockers.length ? 'NEEDS_ATTENTION' : 'READY',
            ownerModule: 'documentation',
            source: 'BACKOFFICE_DOCUMENTATION',
            route: '/docs/dashboard',
            summary: {
                sourceCount: sources.length,
                cmsSourceCount: sources.filter(source => source && source.type === 'CMS').length,
                pendingPublicationCount: pending.length,
                openApiSourceCount: sources.filter(source => source && source.type === 'OPENAPI').length,
            },
            blockers: blockers,
            nextAction: blockers.length ? 'Install, approve, publish, and index documentation packs from Documentation Dashboard.' :
                'Documentation sources are visible and publication blockers were not detected.',
        };
    },
    /** Builds a placeholder section when a domain capability has not yet exposed canonical readiness. */
    ownerPendingSection: function (key, title, ownerModule, route, source, nextAction) {
        return {
            key: key,
            title: title,
            businessStatus: 'NOT_EXPOSED',
            ownerModule: ownerModule,
            source: source,
            route: route,
            summary: { exposed: false },
            blockers: [this.readinessBlocker(
                key.toUpperCase() + '_READINESS_NOT_EXPOSED',
                'NEEDS_ATTENTION',
                ownerModule,
                source,
                nextAction,
                title + ' does not yet expose a canonical BackOffice readiness section.',
                { repairOperation: ownerModule + '.exposeReadiness', repairAction: 'EXPOSE_READINESS_CONTRACT' }
            )],
            nextAction: nextAction,
        };
    },
    /** Returns the operator authorization header for owner runtime readiness reads. */
    authorizationHeader: function (request) {
        let header = request && (request.header || request.headers || (request.httpRequest && request.httpRequest.headers)) || {};
        let value = header.Authorization || header.authorization;
        if (value && /^Bearer\s+/i.test(String(value))) return String(value);
        if (request && request.authToken) return 'Bearer ' + request.authToken;
        return undefined;
    },
    /** Extracts unique nImport catalogue targets from application preparation profiles. */
    importReadinessTargets: function (profiles) {
        let targets = {};
        [].concat(profiles || []).forEach(profile => {
            [].concat((profile || {}).dataPackages || []).forEach(step => {
                if (!step || !step.dataType || !step.targetServer) return;
                let dataType = String(step.dataType);
                let key = [step.targetServer, step.targetRuntimeRole || '', dataType].join(':');
                targets[key] = {
                    dataType: dataType,
                    targetServer: String(step.targetServer),
                    targetRuntimeRole: step.targetRuntimeRole ? String(step.targetRuntimeRole) : undefined,
                };
            });
        });
        return Object.values(targets).sort((left, right) =>
            [left.targetServer, left.targetRuntimeRole || '', left.dataType].join(':')
                .localeCompare([right.targetServer, right.targetRuntimeRole || '', right.dataType].join(':')));
    },
    /** Calls the owner nImport catalogue route for one target runtime. */
    invokeImportCatalogue: async function (target, request) {
        if (!SERVICE.DefaultModuleService || typeof SERVICE.DefaultModuleService.invokeModule !== 'function') {
            throw new CLASSES.NodicsError('ERR_BOF_00000', 'Module communication service is unavailable');
        }
        let authorization = this.authorizationHeader(request);
        return SERVICE.DefaultModuleService.invokeModule({
            moduleName: 'import',
            local: false,
            connectionName: target.targetServer,
            connectionType: 'abstract',
            targetAuthority: {
                server: target.targetServer,
                runtimeRole: target.targetRuntimeRole ? { code: target.targetRuntimeRole } : undefined,
            },
            methodName: 'GET',
            apiName: '/' + target.dataType,
            timeoutMs: 30000,
            maxAttempts: 1,
            header: authorization ? { Authorization: authorization } : {},
            responseSelector: response => response && (response.data || response.result || response) || [],
        });
    },
    /** Normalizes an nImport release blocker into the shared BackOffice readiness shape. */
    normalizeImportBlocker: function (blocker, release, target) {
        blocker = blocker || {};
        let action = blocker.action || (release.readiness || {}).nextAction || 'Open Data Releases';
        let repair = Object.assign({}, blocker.repair || {});
        if (!repair.operation) repair.operation = 'dataRelease.install';
        if (!repair.action) repair.action = repair.actionCode || 'REPAIR_DATA_RELEASE';
        if (!repair.eligibility) repair.eligibility = repair.available === true ? 'MANUAL' : 'NOT_AVAILABLE';
        if (!repair.label) repair.label = action;
        return {
            blockerCode: String(blocker.blockerCode || blocker.code || 'DATA_RELEASE_NOT_READY'),
            code: String(blocker.code || blocker.blockerCode || 'DATA_RELEASE_NOT_READY'),
            severity: String(blocker.severity || 'NEEDS_ATTENTION'),
            ownerType: String(blocker.ownerType || 'DATA_RELEASE'),
            source: String(blocker.source || 'IMPORT_RELEASE_CATALOGUE'),
            action: String(action),
            message: String(blocker.message || (release.displayName || release.releaseCode || 'Data release') + ' is not ready.'),
            disabledReason: String(blocker.disabledReason || blocker.message || 'Data release is not ready.'),
            repair: repair,
            suggestedAction: String(blocker.suggestedAction || action),
            ownerModule: release.moduleName || (release.readiness || {}).owningModule,
            releaseCode: release.releaseCode,
            dataType: target.dataType,
            targetServer: target.targetServer,
            targetRuntimeRole: target.targetRuntimeRole,
        };
    },
    /** Builds the owner-backed import release readiness section from nImport catalogue projections. */
    importReadinessSection: async function (request, profiles) {
        let targets = this.importReadinessTargets(profiles);
        if (targets.length === 0) {
            return {
                key: 'imports',
                title: 'Data import releases',
                businessStatus: 'NOT_CONFIGURED',
                ownerModule: 'import',
                source: 'IMPORT_RELEASE_CATALOGUE',
                route: '/operations/imports-exports',
                summary: { targetCount: 0, releaseCount: 0, blockerCount: 0 },
                blockers: [this.readinessBlocker(
                    'IMPORT_READINESS_TARGETS_MISSING',
                    'NEEDS_ATTENTION',
                    'DATA_RELEASE',
                    'IMPORT_RELEASE_CATALOGUE',
                    'Open Setup & Accelerators',
                    'No application preparation data targets are visible for import readiness.',
                    { repairOperation: 'applicationInitialization.configureProfiles', repairAction: 'CONFIGURE_PREPARATION_TARGETS',
                        suggestedAction: 'Define application preparation data targets in the owning application initialization profiles.' }
                )],
                nextAction: 'Define application preparation data targets in the owning application initialization profiles.',
            };
        }
        let releases = [];
        let providerErrors = [];
        for (let target of targets) {
            try {
                let response = await this.invokeImportCatalogue(target, request);
                [].concat(response || []).forEach(release => releases.push(Object.assign({}, release, { _target: target })));
            } catch (error) {
                providerErrors.push({ target: target, error: error });
            }
        }
        let blockers = releases.reduce((result, release) => {
            let readiness = release.readiness || {};
            return result.concat([].concat(readiness.blockers || []).map(blocker =>
                this.normalizeImportBlocker(blocker, release, release._target || {})));
        }, []);
        providerErrors.forEach(item => {
            let diagnostic = item.error && item.error.metadata && item.error.metadata.runtimeInvocationDiagnostic;
            blockers.push(this.readinessBlocker(
                'IMPORT_READINESS_PROVIDER_UNAVAILABLE',
                'NEEDS_ATTENTION',
                'DATA_RELEASE',
                'IMPORT_RELEASE_CATALOGUE',
                'Refresh Module Registry',
                'nImport catalogue readiness could not be read from the target runtime.',
                { repairOperation: 'moduleRegistry.refreshRuntime', repairAction: 'REFRESH_IMPORT_RUNTIME',
                    suggestedAction: 'Start the target runtime, refresh Module Registry, then retry import readiness.',
                    repairAvailable: true, repairEligibility: 'MANUAL', repairLabel: 'Refresh runtime' }
            ));
            blockers[blockers.length - 1].targetServer = item.target.targetServer;
            blockers[blockers.length - 1].targetRuntimeRole = item.target.targetRuntimeRole;
            blockers[blockers.length - 1].dataType = item.target.dataType;
            if (diagnostic) blockers[blockers.length - 1].runtimeDiagnostic = diagnostic;
        });
        let statusCounts = releases.reduce((result, release) => {
            let status = (release.readiness || {}).businessStatus || 'UNKNOWN';
            result[status] = (result[status] || 0) + 1;
            return result;
        }, {});
        let businessStatus = providerErrors.length || blockers.length ? 'NEEDS_ATTENTION' : releases.length ? 'READY' : 'NOT_CONFIGURED';
        return {
            key: 'imports',
            title: 'Data import releases',
            businessStatus: businessStatus,
            ownerModule: 'import',
            source: 'IMPORT_RELEASE_CATALOGUE',
            route: '/operations/imports-exports',
            summary: Object.assign({
                targetCount: targets.length,
                releaseCount: releases.length,
                blockerCount: blockers.length,
                providerErrorCount: providerErrors.length,
            }, statusCounts),
            blockers: blockers,
            nextAction: blockers.length ? 'Open Data Releases and repair blocked release groups.' :
                releases.length ? 'Data releases are prepared in the owning import catalogues.' :
                    'Install required data release catalogues for the active preparation targets.',
        };
    },
    /** Reads owner application profile readiness projections once for publishing and approval aggregate sections. */
    applicationProfileStatusEntries: async function (request, profiles) {
        let service = SERVICE.DefaultBackofficeApplicationInitializationService;
        if (!service || typeof service.status !== 'function') return { statuses: [], errors: [] };
        let statuses = [];
        let errors = [];
        for (let profile of [].concat(profiles || [])) {
            if (!profile || !profile.code) continue;
            try {
                let status = await service.status(String(profile.code), request);
                statuses.push(status);
            } catch (error) {
                errors.push({ profile: profile, error: error });
            }
        }
        return { statuses: statuses, errors: errors };
    },
    /** Normalizes application capability blockers into shared readiness blockers. */
    normalizeCapabilityBlocker: function (blocker, status, ownerTypeOverride) {
        blocker = blocker || {};
        let repair = Object.assign({}, blocker.repair || {});
        if (!repair.operation) repair.operation = 'applicationInitialization.status';
        if (!repair.action) repair.action = repair.actionCode || blocker.code || 'REVIEW_CAPABILITY';
        if (!repair.eligibility) repair.eligibility = repair.available === true ? 'MANUAL' : 'NOT_AVAILABLE';
        if (!repair.label) repair.label = blocker.action || 'Review capability';
        return {
            blockerCode: String(blocker.blockerCode || blocker.code || 'CAPABILITY_NOT_READY'),
            code: String(blocker.code || blocker.blockerCode || 'CAPABILITY_NOT_READY'),
            severity: String(blocker.severity || 'NEEDS_ATTENTION'),
            ownerType: String(ownerTypeOverride || blocker.ownerType || 'APPLICATION_CAPABILITY'),
            source: String(blocker.source || 'BACKOFFICE_APPLICATION_INITIALIZATION'),
            action: String(blocker.action || 'Open Setup & Accelerators'),
            message: String(blocker.message || 'Application capability needs attention.'),
            disabledReason: String(blocker.disabledReason || blocker.message || 'Application capability needs attention.'),
            repair: repair,
            suggestedAction: String(blocker.suggestedAction || blocker.action || (status && status.capability && status.capability.nextAction) || 'Open Setup & Accelerators'),
            profileCode: status && status.profileCode ? String(status.profileCode) : undefined,
            applicationCode: status && status.applicationCode ? String(status.applicationCode) : undefined,
            siteCode: status && status.siteCode ? String(status.siteCode) : undefined,
            releaseCode: status && status.releaseCode ? String(status.releaseCode) : undefined,
            approvalDiagnostic: blocker.approvalDiagnostic,
            runtimeDiagnostic: blocker.runtimeDiagnostic,
        };
    },
    /** Builds owner-backed publication readiness from application initialization/CMS projections. */
    publishingSection: function (profileStatusReport) {
        let statuses = [].concat((profileStatusReport || {}).statuses || []);
        let errors = [].concat((profileStatusReport || {}).errors || []);
        let blockers = statuses.reduce((result, status) => {
            let capability = status && status.capability || {};
            let capabilityBlockers = [].concat(capability.blockers || [])
                .filter(blocker => blocker.source !== 'PUBLICATION_APPROVAL');
            return result.concat(capabilityBlockers.map(blocker => this.normalizeCapabilityBlocker(blocker, status, 'PUBLICATION')));
        }, []);
        errors.forEach(item => {
            let blocker = this.readinessBlocker(
                'PUBLICATION_PROVIDER_UNAVAILABLE',
                'NEEDS_ATTENTION',
                'PUBLICATION',
                'BACKOFFICE_APPLICATION_INITIALIZATION',
                'Open Setup & Accelerators',
                'Publication readiness could not be read from the owning application profile.',
                { repairOperation: 'applicationInitialization.refreshStatus', repairAction: 'REFRESH_PUBLICATION_STATUS',
                    suggestedAction: 'Refresh Setup & Accelerators and verify the target publication runtime is registered.' }
            );
            blocker.profileCode = item.profile && item.profile.code ? String(item.profile.code) : undefined;
            blockers.push(blocker);
        });
        let online = statuses.filter(status => status && status.capability && status.capability.businessStatus === 'ONLINE').length;
        let pending = statuses.length - online;
        return {
            key: 'publishing',
            title: 'Publication readiness',
            businessStatus: errors.length || blockers.length || pending > 0 ? 'NEEDS_ATTENTION' : statuses.length ? 'READY' : 'NOT_CONFIGURED',
            ownerModule: 'cms',
            source: 'BACKOFFICE_APPLICATION_INITIALIZATION',
            route: '/publishing/setup',
            summary: { profileCount: statuses.length, onlineCount: online, pendingCount: Math.max(0, pending), blockerCount: blockers.length, providerErrorCount: errors.length },
            blockers: blockers,
            nextAction: blockers.length || pending > 0 ? 'Open Setup & Accelerators and resolve publication readiness blockers.' :
                statuses.length ? 'Publication profiles are Online-ready.' : 'Configure application publication profiles.',
        };
    },
    /** Builds owner-backed approval readiness from Process evidence carried by CMS/application projections. */
    approvalSection: function (profileStatusReport) {
        let statuses = [].concat((profileStatusReport || {}).statuses || []);
        let errors = [].concat((profileStatusReport || {}).errors || []);
        let blockers = [];
        statuses.forEach(status => {
            let capability = status && status.capability || {};
            let diagnostic = capability.approvalDiagnostic || {};
            if (['APPROVED', 'NOT_STARTED'].includes(String(diagnostic.status || ''))) return;
            let approvalBlockers = [].concat(capability.blockers || [])
                .filter(blocker => blocker.source === 'PUBLICATION_APPROVAL');
            if (approvalBlockers.length) {
                blockers = blockers.concat(approvalBlockers.map(blocker => this.normalizeCapabilityBlocker(blocker, status, 'PROCESS_WORKFLOW')));
                return;
            }
            let blocker = this.readinessBlocker(
                'APPROVAL_IN_PROGRESS',
                'NEEDS_ATTENTION',
                'PROCESS_WORKFLOW',
                'PUBLICATION_APPROVAL',
                diagnostic.suggestedAction || 'Open Approval Queue',
                diagnostic.message || 'Publication approval needs reviewer action.',
                { repairOperation: 'process.approval.review', repairAction: 'REVIEW_APPROVAL_TASK',
                    suggestedAction: diagnostic.suggestedAction || 'Open Approval Queue and review the governed task.' }
            );
            blocker.profileCode = status.profileCode ? String(status.profileCode) : undefined;
            blocker.publicationCode = diagnostic.publicationCode;
            blocker.publicationState = diagnostic.publicationState;
            blocker.taskCode = diagnostic.taskCode;
            blocker.taskStatus = diagnostic.taskStatus;
            blockers.push(blocker);
        });
        errors.forEach(item => {
            let blocker = this.readinessBlocker(
                'APPROVAL_PROVIDER_UNAVAILABLE',
                'NEEDS_ATTENTION',
                'PROCESS_WORKFLOW',
                'PUBLICATION_APPROVAL',
                'Refresh publication status',
                'Approval readiness could not be read because publication status is unavailable.',
                { repairOperation: 'applicationInitialization.refreshStatus', repairAction: 'REFRESH_APPROVAL_STATUS',
                    suggestedAction: 'Refresh Setup & Accelerators and verify CMS/Process runtimes are registered.' }
            );
            blocker.profileCode = item.profile && item.profile.code ? String(item.profile.code) : undefined;
            blockers.push(blocker);
        });
        let pending = statuses.filter(status => {
            let diagnostic = status && status.capability && status.capability.approvalDiagnostic || {};
            return !['APPROVED', 'NOT_STARTED'].includes(String(diagnostic.status || ''));
        }).length;
        return {
            key: 'approval',
            title: 'Process approval tasks',
            businessStatus: blockers.length ? 'NEEDS_ATTENTION' : 'READY',
            ownerModule: 'workflow',
            source: 'PUBLICATION_APPROVAL',
            route: '/process/approval-queue',
            summary: { profileCount: statuses.length, pendingApprovalCount: pending, blockerCount: blockers.length, providerErrorCount: errors.length },
            blockers: blockers,
            nextAction: blockers.length ? 'Open Approval Queue and reconcile governed publication approval tasks.' :
                'No actionable publication approval blockers were detected.',
        };
    },
    /** Builds owner-backed media readiness from media-manifest evidence in application/CMS projections. */
    mediaSection: function (profileStatusReport) {
        let statuses = [].concat((profileStatusReport || {}).statuses || []);
        let errors = [].concat((profileStatusReport || {}).errors || []);
        let blockers = statuses.reduce((result, status) => {
            let capability = status && status.capability || {};
            let mediaBlockers = [].concat(capability.blockers || [])
                .filter(blocker => blocker.source === 'MEDIA_MANIFEST' || String(blocker.code || '').startsWith('MEDIA_'));
            return result.concat(mediaBlockers.map(blocker => this.normalizeCapabilityBlocker(blocker, status, 'MEDIA_MODULE')));
        }, []);
        errors.forEach(item => {
            let blocker = this.readinessBlocker(
                'MEDIA_PROVIDER_UNAVAILABLE',
                'NEEDS_ATTENTION',
                'MEDIA_MODULE',
                'BACKOFFICE_APPLICATION_INITIALIZATION',
                'Open Media Management',
                'Media readiness could not be read because the owning application/media status is unavailable.',
                { repairOperation: 'applicationInitialization.refreshStatus', repairAction: 'REFRESH_MEDIA_STATUS',
                    suggestedAction: 'Refresh Setup & Accelerators and verify the target media/CMS runtimes are registered.' }
            );
            blocker.profileCode = item.profile && item.profile.code ? String(item.profile.code) : undefined;
            blockers.push(blocker);
        });
        let mediaStates = statuses.map(status => {
            let summary = status && status.capability && status.capability.publicationSummary || {};
            return summary.media ? String(summary.media) : 'UNKNOWN';
        });
        let ready = mediaStates.filter(state => state === 'READY_OR_NOT_REQUIRED').length;
        let needsRepair = mediaStates.filter(state => state === 'NEEDS_REPAIR').length;
        return {
            key: 'media',
            title: 'Media objects and references',
            businessStatus: blockers.length || errors.length || needsRepair > 0 ? 'NEEDS_ATTENTION' : statuses.length ? 'READY' : 'NOT_CONFIGURED',
            ownerModule: 'media',
            source: 'MEDIA_MANIFEST',
            route: '/media',
            summary: {
                profileCount: statuses.length,
                readyOrNotRequiredCount: ready,
                needsRepairCount: needsRepair,
                blockerCount: blockers.length,
                providerErrorCount: errors.length,
                cleanupReviewRoute: '/media/cleanup-candidates',
                replicationRoute: '/media/replication',
            },
            blockers: blockers,
            nextAction: blockers.length ? 'Open Media Management or Setup & Accelerators and repair missing media references/assets.' :
                statuses.length ? 'Media references and required publication assets are ready or not required.' :
                    'Configure application/media preparation profiles before validating media readiness.',
        };
    },
    /** Summarizes nSearch/read-source configuration without requiring custom-project runtime settings. */
    searchConfigurationSummary: function () {
        let search = CONFIG.get('search') || {};
        let defaultOptions = (search.default || {}).options || {};
        let runtimeRoleConfig = CONFIG.get('runtimeRole') || {};
        let runtimeRole = runtimeRoleConfig.code || runtimeRoleConfig.name || runtimeRoleConfig.roleCode || undefined;
        let runtimeProfile = runtimeRole && search.runtimeRoleProfiles ? search.runtimeRoleProfiles[String(runtimeRole)] : undefined;
        let profileEntries = Object.entries(runtimeProfile || {}).filter(entry => {
            let value = entry[1] || {};
            return value.options && value.options.enabled === true;
        });
        let defaultEnabled = defaultOptions.enabled === true;
        let fallbackEnabled = defaultOptions.fallback === true;
        let engine = defaultOptions.engine || 'database';
        return {
            runtimeRole: runtimeRole ? String(runtimeRole) : 'UNKNOWN',
            engine: String(engine),
            defaultSearchEnabled: defaultEnabled,
            defaultFallbackEnabled: fallbackEnabled,
            runtimeProfileCount: profileEntries.length,
            runtimeProfileCodes: profileEntries.map(entry => String(entry[0])),
            readSourcePolicy: fallbackEnabled ? 'SEARCH_WITH_DATABASE_FALLBACK' :
                defaultEnabled || profileEntries.length > 0 ? 'SEARCH_ENGINE' : 'DATABASE_OR_OWNER_DEFAULT',
        };
    },
    /** Returns bounded discovery/search diagnostics from owner services. */
    searchReadinessEvidence: function (context) {
        context = context || {};
        let diagnostics = SERVICE.DefaultBackofficeDiscoveryService &&
            typeof SERVICE.DefaultBackofficeDiscoveryService.getDiagnostics === 'function' ?
                SERVICE.DefaultBackofficeDiscoveryService.getDiagnostics() : {};
        let searchReady;
        if (SERVICE.DefaultSearchConfigurationService &&
            typeof SERVICE.DefaultSearchConfigurationService.getSearchReadiness === 'function') {
            try {
                searchReady = SERVICE.DefaultSearchConfigurationService.getSearchReadiness();
            } catch (error) {
                searchReady = false;
            }
        }
        let moduleEntries = Object.entries(context.modules || {}).reduce((result, entry) => result.concat((entry[1] || [])
            .map(item => Object.assign({ moduleName: entry[0] }, item))), []);
        let activeSearchModules = moduleEntries.filter(item => /search/i.test(String(item.moduleName || item.module || item.name || '')));
        let activeDiscoveryModules = moduleEntries.filter(item => /discovery/i.test(String(item.moduleName || item.module || item.name || '')));
        return {
            diagnostics: diagnostics || {},
            searchReady: searchReady,
            activeSearchModuleCount: activeSearchModules.length,
            activeDiscoveryModuleCount: activeDiscoveryModules.length,
        };
    },
    /** Builds owner-backed readiness for search indexes and database/search read-source policy. */
    searchSection: function (context) {
        let configuration = this.searchConfigurationSummary();
        let evidence = this.searchReadinessEvidence(context);
        let diagnostics = evidence.diagnostics || {};
        let blockers = [];
        if (evidence.searchReady === false) blockers.push(this.readinessBlocker(
            'SEARCH_ENGINE_UNAVAILABLE',
            'NEEDS_ATTENTION',
            'SEARCH',
            'NSEARCH_RUNTIME',
            'Open Search controls',
            'One or more initialized search engine clients are unavailable.',
            { repairOperation: 'search.refreshEngines', repairAction: 'REFRESH_SEARCH_ENGINE',
                suggestedAction: 'Open Search controls, verify the active read-source policy, and repair the unavailable engine.' }
        ));
        if ((diagnostics.failures || 0) > 0 || diagnostics.lastFailureCode) {
            let blocker = this.readinessBlocker(
                'DISCOVERY_CONTRACT_SYNC_FAILED',
                'NEEDS_ATTENTION',
                'DISCOVERY',
                'BACKOFFICE_DISCOVERY',
                'Open Discovery controls',
                'BackOffice discovery has recent contract synchronization failures.',
                { repairOperation: 'discovery.refreshContracts', repairAction: 'REFRESH_DISCOVERY_CONTRACTS',
                    suggestedAction: 'Open Discovery controls, refresh owner module contracts, and inspect the latest failure code.' }
            );
            blocker.lastFailureCode = diagnostics.lastFailureCode ? String(diagnostics.lastFailureCode) : undefined;
            blocker.lastFailureAt = diagnostics.lastFailureAt;
            blockers.push(blocker);
        }
        let hasConfiguredSearch = configuration.defaultSearchEnabled || configuration.runtimeProfileCount > 0 ||
            evidence.activeSearchModuleCount > 0 || evidence.activeDiscoveryModuleCount > 0 ||
            (diagnostics.attempts || 0) > 0 || (diagnostics.activeSnapshots || 0) > 0;
        return {
            key: 'search',
            title: 'Search indexes and read-source policy',
            businessStatus: blockers.length ? 'NEEDS_ATTENTION' : hasConfiguredSearch ? 'READY' : 'NOT_CONFIGURED',
            ownerModule: 'search',
            source: 'NSEARCH_CONFIGURATION',
            route: '/discovery',
            summary: {
                runtimeRole: configuration.runtimeRole,
                engine: configuration.engine,
                readSourcePolicy: configuration.readSourcePolicy,
                defaultSearchEnabled: configuration.defaultSearchEnabled,
                defaultFallbackEnabled: configuration.defaultFallbackEnabled,
                runtimeProfileCount: configuration.runtimeProfileCount,
                activeSearchModuleCount: evidence.activeSearchModuleCount,
                activeDiscoveryModuleCount: evidence.activeDiscoveryModuleCount,
                discoveryAttempts: diagnostics.attempts || 0,
                discoveryFailures: diagnostics.failures || 0,
                discoveryLastSuccessAt: diagnostics.lastSuccessAt,
                discoveryLastFailureAt: diagnostics.lastFailureAt,
            },
            blockers: blockers,
            nextAction: blockers.length ? 'Open Discovery/Search controls and reconcile search engine or contract synchronization failures.' :
                hasConfiguredSearch ? 'Search/read-source readiness evidence is available.' :
                    'Enable an owner search/read-source profile when the runtime must render from search indexes.',
        };
    },
    /** Builds the canonical post-reset operational readiness aggregate for Axis and tooling. */
    operationalReadinessReport: async function (request, context) {
        context = context || {};
        let startupValidation = context.startupValidation || this.startupValidationReport(request);
        let startupBlockers = []
            .concat((startupValidation.findings || []).map(finding => this.readinessBlocker(
                finding.code,
                finding.severity === 'ERROR' ? 'BLOCKED' : 'NEEDS_ATTENTION',
                finding.ownerType,
                'BACKOFFICE_STARTUP_VALIDATION',
                finding.action,
                finding.message,
                { repairOperation: (finding.repair || {}).operation, repairAction: (finding.repair || {}).actionCode,
                    repairAvailable: (finding.repair || {}).available === true, repairEligibility: (finding.repair || {}).eligibility,
                    repairLabel: (finding.repair || {}).label }
            )))
            .concat((startupValidation.bootstrapChecks || {}).missing > 0 ? [this.readinessBlocker(
                'BOOTSTRAP_CHECKS_MISSING',
                'BLOCKED',
                'CONFIGURATION',
                'BACKOFFICE_STARTUP_VALIDATION',
                'Repair bootstrap configuration',
                'One or more bootstrap checks are missing.',
                { repairOperation: 'runtimeConfiguration.update', repairAction: 'REPAIR_BOOTSTRAP_CONFIGURATION' }
            )] : []);
        let importSection = await this.importReadinessSection(request, context.applicationInitializationProfiles);
        let profileStatusReport = await this.applicationProfileStatusEntries(request, context.applicationInitializationProfiles);
        let sections = [
            {
                key: 'bootstrap',
                title: 'Bootstrap and admin access',
                businessStatus: startupValidation.state === 'READY' ? 'READY' : startupValidation.state,
                ownerModule: 'backoffice',
                source: 'BACKOFFICE_STARTUP_VALIDATION',
                route: '/dashboard',
                summary: {
                    findingCount: (startupValidation.summary || {}).total || 0,
                    missingBootstrapChecks: ((startupValidation.bootstrapChecks || {}).missing || 0),
                    acknowledged: (startupValidation.summary || {}).acknowledged || 0,
                },
                blockers: startupBlockers,
                nextAction: startupBlockers.length ? 'Resolve startup validation findings on the Axis dashboard.' : 'Startup validation is clear.',
            },
            this.moduleRuntimeSection(context.modules, context.availability),
            importSection,
            this.publishingSection(profileStatusReport),
            this.approvalSection(profileStatusReport),
            this.documentationSection(context.documentationSources, context.documentationPublication),
            this.mediaSection(profileStatusReport),
            this.searchSection(context),
            this.ownerPendingSection('assistant', 'Assistant knowledge sources', 'assistant', '/assistant', 'ASSISTANT_KNOWLEDGE_READINESS', 'Install/publish/index authorized knowledge sources.'),
            this.applicationSection(context.applicationInitializationProfiles),
        ];
        let summary = sections.reduce((result, section) => {
            result.total++;
            result[section.businessStatus] = (result[section.businessStatus] || 0) + 1;
            result.blockers += (section.blockers || []).length;
            return result;
        }, { total: 0, blockers: 0 });
        return {
            contractVersion: 1,
            state: summary.BLOCKED || summary.NOT_READY ? 'NOT_READY' : summary.NEEDS_ATTENTION || summary.NOT_EXPOSED ? 'NEEDS_ATTENTION' : 'READY',
            checkedAt: new Date().toISOString(),
            source: 'backoffice.operationalReadiness',
            summary: summary,
            sections: sections,
        };
    },
    /** Records auditable acknowledgement for one active startup finding. */
    acknowledgeFinding: function (request) {
        let input = request && request.startupFindingAcknowledgement || {};
        let code = String(input.code || '').trim();
        let reason = String(input.reason || '').trim();
        let propertyPath = input.propertyPath ? String(input.propertyPath) : undefined;
        if (!code || reason.length < 8) {
            throw new CLASSES.NodicsError('ERR_BOF_00000', 'Startup finding acknowledgement requires code and reason');
        }
        let report = this.startupValidationReport(request);
        let finding = report.findings.find(item => item.code === code && (!propertyPath || item.propertyPath === propertyPath));
        if (!finding) {
            throw new CLASSES.NodicsError('ERR_BOF_00000', 'Startup finding is not active or cannot be acknowledged');
        }
        if (finding.dismissible !== true || finding.auditRequired !== true) {
            throw new CLASSES.NodicsError('ERR_BOF_00000', 'Startup finding is not auditable/dismissible');
        }
        let acknowledgedAt = new Date().toISOString();
        let record = {
            acknowledged: true,
            code: finding.code,
            severity: finding.severity,
            owner: finding.owner,
            ownerType: finding.ownerType,
            propertyPath: finding.propertyPath,
            reason: reason,
            reasonCode: input.reasonCode ? String(input.reasonCode) : 'OPERATOR_REVIEWED',
            acknowledgedBy: this.principal(request),
            acknowledgedAt: acknowledgedAt,
            tenant: request && request.tenant,
            correlationId: request && request.correlationId,
        };
        this._findingAcknowledgements[this.acknowledgementKey(record.tenant, record.code, record.propertyPath)] = record;
        if (SERVICE.DefaultBackofficeAuditService && typeof SERVICE.DefaultBackofficeAuditService.record === 'function') {
            Promise.resolve(SERVICE.DefaultBackofficeAuditService.record({
                eventType: 'backoffice.startupFinding.acknowledge',
                outcome: 'acknowledged',
                findingCode: record.code,
                propertyPath: record.propertyPath,
                principalId: record.acknowledgedBy,
                tenant: record.tenant,
                correlationId: record.correlationId,
                reasonCode: record.reasonCode,
            })).catch(() => false);
        }
        return Promise.resolve(record);
    },
    /** Validates cross-setting invariants without reading or returning secrets. */
    validateConfiguration: function () {
        let registry = CONFIG.get('backofficeRegistry') || {};
        let operations = registry.operations || {};
        let availability = registry.availability || {};
        let failures = [];
        if (Number(registry.leaseTtlMs || 0) <= Number(registry.sweepIntervalMs || 0)) failures.push('LEASE_TTL_NOT_GREATER_THAN_SWEEP');
        if (operations.requireDistributedStore === true && (!registry.store || registry.store.mode !== 'distributed')) failures.push('DISTRIBUTED_STORE_REQUIRED');
        if (registry.store && registry.store.mode === 'distributed' && (!registry.store.moduleName || !registry.store.engineName || !registry.store.keyPrefix)) {
            failures.push('DISTRIBUTED_STORE_COORDINATES_INVALID');
        }
        if (Number(availability.maxConcurrentObservations || 0) < 1 || Number(availability.maxQueuedObservations || 0) < 1) {
            failures.push('AVAILABILITY_PRESSURE_LIMIT_INVALID');
        }
        if (Number(availability.staleAfterMs || 0) <= Number(availability.timeoutMs || 0)) failures.push('AVAILABILITY_FRESHNESS_INVALID');
        let thresholds = operations.thresholds || {};
        ['availabilityFailurePercent', 'availabilityQueuePercent', 'discoveryFailurePercent'].forEach(name => {
            let value = Number(thresholds[name]);
            if (!Number.isFinite(value) || value < 0 || value > 100) failures.push('OPERATION_THRESHOLD_INVALID');
        });
        if (Number(operations.minimumSamples || 0) < 1) failures.push('OPERATION_SAMPLE_LIMIT_INVALID');
        let production = operations.production || {};
        if (production.enabled === true) {
            let audit = registry.audit || {};
            let alerts = operations.alerts || {};
            if (!registry.store || registry.store.mode !== 'distributed') failures.push('PRODUCTION_DISTRIBUTED_STORE_REQUIRED');
            if (production.requireHttpsOnly !== false &&
                ((registry.allowedSchemes || []).length !== 1 || registry.allowedSchemes[0] !== 'https')) failures.push('PRODUCTION_HTTPS_REQUIRED');
            if (production.requireHostAllowlists !== false &&
                (!Array.isArray((registry.discovery || {}).allowedHosts) || registry.discovery.allowedHosts.length === 0 ||
                    !Array.isArray(availability.allowedHosts) || availability.allowedHosts.length === 0)) failures.push('PRODUCTION_HOST_ALLOWLIST_REQUIRED');
            if (production.requireStrictAudit !== false &&
                (audit.enabled !== true || audit.failClosed !== true || audit.requireAcknowledgement !== true || !audit.publisherService)) {
                failures.push('PRODUCTION_AUDIT_DELIVERY_REQUIRED');
            }
            if (production.requireStrictAudit !== false && audit.publisherService &&
                (!SERVICE[audit.publisherService] || typeof SERVICE[audit.publisherService].record !== 'function')) {
                failures.push('PRODUCTION_AUDIT_PUBLISHER_UNAVAILABLE');
            }
            if (production.requireStrictAlerts !== false &&
                (alerts.enabled !== true || alerts.failClosed !== true || alerts.requireAcknowledgement !== true || !alerts.publisherService)) {
                failures.push('PRODUCTION_ALERT_DELIVERY_REQUIRED');
            }
            if (production.requireStrictAlerts !== false && alerts.publisherService &&
                (!SERVICE[alerts.publisherService] || typeof SERVICE[alerts.publisherService].record !== 'function')) {
                failures.push('PRODUCTION_ALERT_PUBLISHER_UNAVAILABLE');
            }
            let administration = registry.administration || {};
            if (administration.rejectServiceTokens !== true || administration.requirePrincipal !== true) failures.push('PRODUCTION_HUMAN_ADMIN_REQUIRED');
        }
        return { valid: failures.length === 0, failures: failures };
    },
    /** Derives stable alerts from sanitized counters already owned by registry subsystems. */
    assess: function (diagnostics) {
        diagnostics = diagnostics || {};
        let configuration = this.validateConfiguration();
        let policy = this.getConfiguration();
        let threshold = policy.thresholds || {};
        let minimum = Number(policy.minimumSamples || 10);
        let alerts = configuration.failures.slice();
        let store = diagnostics.store || {};
        let storeMetrics = store.metrics || {};
        if (store.available === false) alerts.push('REGISTRY_STORE_UNAVAILABLE');
        let storeErrorLimit = Number(threshold.storeErrors === undefined ? 1 : threshold.storeErrors);
        let conflictLimit = Number(threshold.conditionalDeleteConflicts === undefined ? 10 : threshold.conditionalDeleteConflicts);
        if (Number(storeMetrics.errors || 0) >= storeErrorLimit) alerts.push('REGISTRY_STORE_ERRORS');
        if (Number(storeMetrics.conditionalDeleteConflicts || 0) >= conflictLimit) alerts.push('LEASE_RENEWAL_CONFLICTS');
        let availability = diagnostics.availability || {};
        let availabilityMetrics = availability.metrics || {};
        if (Number(availabilityMetrics.attempts || 0) >= minimum && Number(availabilityMetrics.failures || 0) * 100 /
            Number(availabilityMetrics.attempts || 1) >= Number(threshold.availabilityFailurePercent === undefined ? 25 : threshold.availabilityFailurePercent)) alerts.push('AVAILABILITY_FAILURE_RATE');
        let queueLimit = Number(((CONFIG.get('backofficeRegistry') || {}).availability || {}).maxQueuedObservations || 1);
        if (Number(availability.queued || 0) * 100 / queueLimit >= Number(threshold.availabilityQueuePercent === undefined ? 80 : threshold.availabilityQueuePercent)) alerts.push('AVAILABILITY_QUEUE_SATURATED');
        let discovery = diagnostics.discovery || {};
        if (Number(discovery.attempts || 0) >= minimum && Number(discovery.failures || 0) * 100 /
            Number(discovery.attempts || 1) >= Number(threshold.discoveryFailurePercent === undefined ? 25 : threshold.discoveryFailurePercent)) alerts.push('DISCOVERY_FAILURE_RATE');
        if (Number((diagnostics.security || {}).throttled || 0) >= Number(threshold.refreshThrottles === undefined ? 1 : threshold.refreshThrottles)) alerts.push('ADMIN_REFRESH_THROTTLED');
        alerts = Array.from(new Set(alerts)).sort();
        let state = configuration.valid && store.available !== false ? alerts.length > 0 ? 'DEGRADED' : 'READY' : 'NOT_READY';
        return { state: state, alerts: alerts, checkedAt: new Date().toISOString() };
    },
    /** Publishes one sanitized changed operational assessment through the configured environment adapter. */
    publishAssessment: function (assessment) {
        let configuration = this.getConfiguration().alerts || {};
        if (configuration.enabled !== true) return Promise.resolve(false);
        let payload = { eventType: 'backoffice.operational.assessment', state: assessment.state,
            alerts: [].concat(assessment.alerts || []).map(String).sort(), checkedAt: assessment.checkedAt };
        let signature = payload.state + ':' + payload.alerts.join(',');
        if (signature === this._lastPublishedSignature) return Promise.resolve(false);
        let publisher = configuration.publisherService && SERVICE[configuration.publisherService];
        if (!publisher || typeof publisher.record !== 'function') {
            let unavailable = new Error('BackOffice operational alert publisher is unavailable');
            unavailable.code = 'ALERT_PUBLISHER_UNAVAILABLE';
            return configuration.failClosed === true ? Promise.reject(unavailable) : Promise.resolve(false);
        }
        return Promise.resolve(publisher.record(payload)).then(acknowledgement => {
            if (configuration.requireAcknowledgement === true && !acknowledgement) {
                let error = new Error('BackOffice operational alert publisher did not acknowledge delivery');
                error.code = 'ALERT_DELIVERY_UNACKNOWLEDGED';
                throw error;
            }
            this._lastPublishedSignature = signature;
            return acknowledgement;
        }).catch(error => {
            if (configuration.failClosed === true) throw error;
            return false;
        });
    }
};
