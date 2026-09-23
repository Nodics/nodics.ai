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
