/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * @module import/service/release/DefaultDataReleaseService
 * @description Discovers immutable active-module and explicitly allowlisted destination contributions, validates installation plans, and invokes the existing nImport execution authority.
 * @layer service
 * @owner import
 * @override Projects may extend release policy or installation persistence while preserving manifest integrity, active-module ownership, tenant isolation, and nImport execution.
 */
module.exports = {
    activeExecutions: new Map(),

    /** Initializes data-release discovery. */
    init: function () { return Promise.resolve(true); },
    /** Completes data-release service initialization. */
    postInit: function () { return Promise.resolve(true); },

    /** Returns the client-safe release catalogue for the active runtime and tenant. */
    getCatalogue: async function (request) {
        let tenant = this.resolveTenant(request);
        let releases = this.discoverReleases(request && request.dataType);
        let installations = await this.getInstallations(tenant);
        let byCode = Object.fromEntries(installations.map(item => [item.code, item]));
        return {
            code: 'SUC_IMP_00000',
            data: releases.map(release => this.toCatalogueItem(release,
                byCode[this.installationCode(tenant, release)],
                this.activeExecutions.has(tenant + ':' + release.dataType)))
        };
    },

    /** Validates a requested immutable plan without executing import handlers or persisting imported business data. */
    preflight: async function (request) {
        let plan = await this.preparePlan(request);
        let operationReleases = await this.operationReleases(plan, 'AVAILABLE');
        let executablePlan = this.executablePlan(plan, operationReleases);
        let validation = {
            validationOnly: true,
            importExecuted: false,
            skipped: executablePlan.releases.length === 0,
            reason: executablePlan.releases.length === 0 ?
                'Selected data releases are already current' :
                'Data release plan validated; no import execution was performed'
        };
        return {
            code: 'SUC_IMP_00000',
            data: {
                dataType: plan.dataType,
                tenant: plan.tenant,
                releases: operationReleases,
                validation: validation
            }
        };
    },

    /** Executes one validated plan through the authoritative init/core/sample service operation. */
    execute: async function (request) {
        let plan = await this.preparePlan(request);
        let operationReleases = await this.operationReleases(plan, 'AVAILABLE');
        plan = this.executablePlan(plan, operationReleases);
        if (plan.releases.length === 0) throw this.error('ERR_IMP_00003', 'Selected data releases are already current');
        let typePolicy = (this.configuration().types || {})[plan.dataType] || {};
        if (typePolicy.operatorExecution !== true) throw this.error('ERR_IMP_00002', 'Operator execution is disabled for this data release type');
        let executionKey = plan.tenant + ':' + plan.dataType;
        if (this.activeExecutions.has(executionKey)) throw this.error('ERR_IMP_00003', 'A data release import is already running');
        this.activeExecutions.set(executionKey, true);
        await Promise.all(plan.releases.map(release => this.recordInstallation(plan, release, undefined, 'RUNNING')));
        try {
            let importRequest = this.createImportRequest(request, plan, false);
            let result = await this.invokeImport(importRequest, plan.dataType);
            await Promise.all(plan.releases.map(release => this.recordInstallation(plan, release, importRequest.importRun, 'CURRENT')));
            let operationReleases = plan.releases.map(release => this.operationRelease(release, 'CURRENT'));
            return {
                code: 'SUC_IMP_00000',
                data: {
                    dataType: plan.dataType,
                    tenant: plan.tenant,
                    releases: operationReleases,
                    importRun: importRequest.importRun,
                    result: result
                }
            };
        } catch (error) {
            await Promise.all(plan.releases.map(release => this.recordInstallation(plan, release, undefined, 'FAILED')))
                .catch(() => false);
            throw error;
        } finally {
            this.activeExecutions.delete(executionKey);
        }
    },

    /** Resolves and validates the requested active-module release plan. */
    preparePlan: async function (request) {
        let body = request && request.releaseRequest || {};
        let dataType = String(body.dataType || '').toLowerCase();
        this.validateDataType(dataType);
        this.validateTypePolicy(dataType);
        let available = this.discoverReleases(dataType);
        let requestedCodes = Array.isArray(body.releaseCodes) && body.releaseCodes.length > 0 ? body.releaseCodes : undefined;
        let requestedModules = Array.isArray(body.modules) && body.modules.length > 0 ? body.modules : undefined;
        if (requestedCodes && requestedModules) throw this.error('ERR_IMP_00003', 'Select releases by releaseCodes or legacy modules, not both');
        let requested = requestedCodes || requestedModules || available.map(item => item.releaseCode);
        if (requested.length > Number(this.configuration().maximumModulesPerRun || 256) ||
            new Set(requested).size !== requested.length ||
            requested.some(code => !/^[A-Za-z][A-Za-z0-9_-]{0,127}(?::[A-Za-z][A-Za-z0-9_-]{0,127})?$/.test(code))) {
            throw this.error('ERR_IMP_00003', 'Requested data release modules are invalid');
        }
        let availableByCode = Object.fromEntries(available.map(item => [item.releaseCode, item]));
        let releases = requestedCodes ? requested.map(code => availableByCode[code]) : requested.map(moduleName => {
            let matches = available.filter(item => item.moduleName === moduleName);
            if (matches.length > 1) throw this.error('ERR_IMP_00003', 'Module owns multiple releases; select an explicit releaseCode');
            return matches[0];
        });
        if (releases.some(release => !release)) throw this.error('ERR_IMP_00004', 'Requested data release is unavailable');
        if (releases.some(release => release.invalidManifest === true)) {
            throw this.error('ERR_IMP_00003', 'Requested data release manifest is invalid; repair manifest before installation');
        }
        let expected = body.expectedReleases || {};
        releases.forEach(release => {
            if ((expected[release.releaseCode] || expected[release.moduleName]) &&
                (expected[release.releaseCode] || expected[release.moduleName]) !== release.version) {
                throw this.error('ERR_IMP_00003', 'Data release changed after selection; refresh and validate again');
            }
        });
        let tenant = this.resolveTenant(request);
        releases.forEach(release => this.validateDestination(release));
        let installations = await this.getInstallations(tenant);
        let installedByCode = Object.fromEntries(installations.map(item => [item.code, item]));
        releases.forEach(release => this.validateUpgradePolicy(release, installedByCode[this.installationCode(tenant, release)]));
        return { dataType: dataType, tenant: tenant, releases: releases };
    },

    /** Prevents a qualified release from being installed into a runtime role or environment outside its manifest contract. */
    validateDestination: function (release) {
        let policy = this.configuration();
        if (policy.destinationEnforced !== true) return true;
        if (!release.destinationRole) throw this.error('ERR_IMP_00003', 'Data release destination metadata is required');
        let configuredRole = CONFIG.get('runtimeRole');
        let runtimeRole = typeof configuredRole === 'string' ? configuredRole : configuredRole && configuredRole.code;
        let allowed = Array.isArray(policy.allowedDestinationRoles) ? policy.allowedDestinationRoles : runtimeRole ? [runtimeRole] : [];
        if (!runtimeRole || !allowed.includes(release.destinationRole) || release.destinationRole !== runtimeRole) {
            throw this.error('ERR_IMP_00004', 'Data release is not permitted for runtime destination ' + String(runtimeRole || 'UNDECLARED'));
        }
        let environment = String(policy.environmentClass ||
            NODICS.getSelectedEnvironmentName && NODICS.getSelectedEnvironmentName() || '').toUpperCase();
        if (!release.environmentScope.includes('ALL') && !release.environmentScope.includes(environment)) {
            throw this.error('ERR_IMP_00004', 'Data release is not permitted for environment ' + environment);
        }
        return true;
    },

    /** Projects operation responses using the same client-safe release contract as the catalogue. */
    operationReleases: async function (plan, mode) {
        if (mode === 'CURRENT') return plan.releases.map(release => this.operationRelease(release, 'CURRENT'));
        let installations = await this.getInstallations(plan.tenant);
        let byCode = Object.fromEntries(installations.map(item => [item.code, item]));
        return plan.releases.map(release => this.toCatalogueItem(release,
            byCode[this.installationCode(plan.tenant, release)],
            this.activeExecutions.has(plan.tenant + ':' + release.dataType)));
    },

    /** Adds mandatory operation status fields without exposing internal paths or executable data. */
    operationRelease: function (release, status) {
        return Object.assign(this.publicRelease(release), {
            installedVersion: status === 'CURRENT' ? release.version : undefined,
            status: status
        });
    },

    /** Keeps execution scoped to releases that can change state. */
    executablePlan: function (plan, operationReleases) {
        let executableModules = new Set((operationReleases || [])
            .filter(release => ['NOT_INSTALLED', 'UPDATE_AVAILABLE', 'FAILED'].includes(release.status))
            .map(release => release.moduleName));
        return Object.assign({}, plan, {
            releases: plan.releases.filter(release => executableModules.has(release.moduleName))
        });
    },

    /** Resolves active owners plus explicitly allowlisted inactive contribution owners without activating their runtime behavior. */
    discoveryOwners: function () {
        let active = new Set(NODICS.getActiveModules() || []);
        let configured = this.configuration().contributions || [];
        if (!Array.isArray(configured)) throw this.error('ERR_IMP_00003', 'Data release contributions configuration must be a list');
        let selectors = new Map(Array.from(active).map(moduleName => [moduleName, { moduleName: moduleName, active: true }]));
        configured.forEach(selector => {
            if (!selector || typeof selector !== 'object' || !/^[A-Za-z][A-Za-z0-9_-]{0,127}$/.test(selector.moduleName || '') ||
                !Array.isArray(selector.sections) || selector.sections.length === 0 ||
                selector.sections.some(section => !/^[A-Za-z][A-Za-z0-9_-]{0,127}$/.test(section))) {
                throw this.error('ERR_IMP_00003', 'Data release contribution selector is invalid');
            }
            let existing = selectors.get(selector.moduleName);
            selectors.set(selector.moduleName, Object.assign({}, selector, { active: existing && existing.active === true }));
        });
        return Array.from(selectors.values());
    },

    /** Discovers active loader-owned releases and explicitly selected destination-qualified contributions. */
    discoverReleases: function (requestedType) {
        if (requestedType) this.validateDataType(requestedType);
        let releases = [];
        this.discoveryOwners().forEach(selector => {
            let rawModule = NODICS.getRawModule(selector.moduleName);
            if (!rawModule || !rawModule.path) return;
            let aggregatePath = path.join(rawModule.path, 'data', 'manifest.json');
            let aggregate;
            let aggregateError;
            try {
                aggregate = this.readAggregateManifest(rawModule, aggregatePath);
            } catch (error) {
                aggregateError = error;
            }
            let sections = aggregate ? Object.entries(aggregate.sections || {}).filter(entry =>
                entry[1] && entry[1].kind === 'DATA_RELEASE' &&
                (!requestedType || entry[1].dataType === requestedType) &&
                (selector.active || selector.sections.includes(entry[0]))) : [];
            if (aggregateError) {
                let types = ['init', 'core', 'sample'].filter(type => !requestedType || requestedType === type);
                types.forEach(dataType => releases.push(this.invalidManifestRelease(rawModule, dataType, aggregatePath, aggregateError, dataType)));
                return;
            }
            if (aggregate) {
                sections.forEach(entry => {
                    try {
                        releases.push(this.inspectManifest(rawModule, entry[1].dataType, aggregatePath, entry[1], entry[0], !selector.active));
                    } catch (error) {
                        releases.push(this.invalidManifestRelease(rawModule, entry[1].dataType, aggregatePath, error, entry[0]));
                    }
                });
                return;
            }
            if (!selector.active) return;
            ['init', 'core', 'sample'].filter(type => !requestedType || requestedType === type).forEach(dataType => {
                let legacyPath = path.join(rawModule.path, 'data', dataType, 'manifest.json');
                if (!fs.existsSync(legacyPath)) return;
                try {
                    releases.push(this.inspectManifest(rawModule, dataType, legacyPath, undefined, dataType));
                } catch (error) {
                    releases.push(this.invalidManifestRelease(rawModule, dataType, legacyPath, error, dataType));
                }
            });
        });
        return releases.sort((first, second) =>
            first.dataType.localeCompare(second.dataType) || first.releaseCode.localeCompare(second.releaseCode));
    },

    /** Reads and validates the aggregate manifest envelope when a module owns a data directory. */
    readAggregateManifest: function (rawModule, manifestPath) {
        if (!fs.existsSync(manifestPath)) return undefined;
        let manifest;
        try {
            manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        } catch (error) {
            throw this.error('ERR_IMP_00003', 'Aggregate data manifest JSON is invalid for module ' + rawModule.name);
        }
        if (!manifest || manifest.contractVersion !== 2 || manifest.module !== rawModule.name ||
            !manifest.sections || typeof manifest.sections !== 'object' || Array.isArray(manifest.sections)) {
            throw this.error('ERR_IMP_00003', 'Aggregate data manifest is incompatible for module ' + rawModule.name +
                '; verify contractVersion 2, module identity, and sections map');
        }
        return manifest;
    },

    /** Validates one manifest, containment, symlink policy, and every declared checksum. */
    inspectManifest: function (rawModule, dataType, manifestPath, aggregateSection, sectionCode, lifecycleRequired) {
        let releaseRoot = path.dirname(manifestPath);
        let manifest;
        if (aggregateSection) {
            manifest = aggregateSection;
        } else {
            try {
                manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            } catch (error) {
                throw this.error('ERR_IMP_00003', 'Data release manifest JSON is invalid for module ' + rawModule.name + ' and data type ' + dataType);
            }
        }
        let isAggregate = Boolean(aggregateSection);
        if (!manifest || (!isAggregate && !(this.configuration().allowedContractVersions || [1]).includes(manifest.contractVersion)) ||
            (!isAggregate && manifest.module !== rawModule.name) ||
            (isAggregate && manifest.kind !== 'DATA_RELEASE') ||
            manifest.dataType !== dataType || !/^\d+\.\d+\.\d+$/.test(manifest.version || '') ||
            !manifest.files || typeof manifest.files !== 'object' || Array.isArray(manifest.files)) {
            throw this.error('ERR_IMP_00003', 'Data release manifest is incompatible for module ' + rawModule.name + ' and data type ' + dataType + '; verify kind, dataType, semantic version, and files map');
        }
        let lifecycle = this.validateLifecycleMetadata(manifest, rawModule.name, dataType, lifecycleRequired);
        let installer = manifest.installer;
        if (installer !== undefined && !/^[A-Z][A-Z0-9_]{1,63}$/.test(installer)) {
            throw this.error('ERR_IMP_00003', 'Data release installer code is invalid');
        }
        let sourceRoot = manifest.sourceRoot || dataType;
        if (!['init', 'core', 'sample', 'staged', 'operational', 'reference'].includes(sourceRoot)) {
            throw this.error('ERR_IMP_00003', 'Data release sourceRoot is invalid');
        }
        let fileNames = Object.keys(manifest.files).sort();
        if (fileNames.length === 0 || fileNames.length > Number(this.configuration().maximumFilesPerRelease || 1024)) {
            throw this.error('ERR_IMP_00003', 'Data release file count is invalid');
        }
        fileNames.forEach(relativeFile => {
            if (path.isAbsolute(relativeFile) || relativeFile.includes('..')) throw this.error('ERR_IMP_00003', 'Data release path is invalid: ' + relativeFile);
            let filePath = path.resolve(releaseRoot, relativeFile);
            if (!filePath.startsWith(releaseRoot + path.sep) || !fs.existsSync(filePath) ||
                fs.lstatSync(filePath).isSymbolicLink() || !fs.statSync(filePath).isFile()) {
                throw this.error('ERR_IMP_00003', 'Data release file is unavailable: ' + relativeFile);
            }
            let checksum = crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
            if (checksum !== manifest.files[relativeFile]) throw this.error('ERR_IMP_00003',
                'Data release checksum validation failed for ' + rawModule.name + '/' + dataType + '/' +
                (isAggregate && relativeFile.startsWith(dataType + '/') ? relativeFile.slice(dataType.length + 1) : relativeFile) +
                '; expected ' + String(manifest.files[relativeFile]).slice(0, 12) + '..., actual ' + checksum.slice(0, 12) + '...');
        });
        let checksum = crypto.createHash('sha256').update(fileNames.map(file => file + ':' + manifest.files[file]).join('|')).digest('hex');
        return {
            releaseCode: rawModule.name + ':' + sectionCode,
            sectionCode: sectionCode,
            moduleName: rawModule.name,
            displayName: rawModule.metaData && rawModule.metaData.nodics && rawModule.metaData.nodics.displayName || rawModule.name,
            parentModule: rawModule.parent,
            canonicalIdentity: rawModule.canonicalIdentity || rawModule.name,
            dataType: dataType,
            version: manifest.version,
            description: String(manifest.description || ''),
            checksum: checksum,
            owningDomain: lifecycle && lifecycle.owningDomain,
            lifecycle: lifecycle && lifecycle.lifecycle,
            destinationRole: lifecycle && lifecycle.destinationRole,
            environmentScope: lifecycle && lifecycle.environmentScope,
            sensitivity: lifecycle && lifecycle.sensitivity,
            versioningPolicy: lifecycle && lifecycle.versioningPolicy,
            publicationPolicy: lifecycle && lifecycle.publicationPolicy,
            initialPublicationPolicy: lifecycle && lifecycle.initialPublicationPolicy,
            removalPolicy: lifecycle && lifecycle.removalPolicy,
            installer: installer,
            sourceRoot: sourceRoot,
            declaredFiles: fileNames.slice()
        };
    },

    /** Validates optional contract-v2 lifecycle routing metadata during migration. */
    validateLifecycleMetadata: function (manifest, moduleName, dataType, lifecycleRequired) {
        let fields = ['owningDomain', 'lifecycle', 'destinationRole', 'environmentScope', 'sensitivity',
            'versioningPolicy', 'publicationPolicy', 'initialPublicationPolicy', 'removalPolicy'];
        let present = fields.filter(field => manifest[field] !== undefined);
        if (present.length === 0 && lifecycleRequired !== true && this.configuration().lifecycleMetadataRequired !== true) return undefined;
        if (present.length !== fields.length) throw this.error('ERR_IMP_00003',
            'Data lifecycle metadata is incomplete for module ' + moduleName + ' and data type ' + dataType);
        if (!/^[A-Za-z][A-Za-z0-9._-]{1,127}$/.test(manifest.owningDomain) ||
            !['PUBLISHABLE', 'OPERATIONAL_VERSIONED', 'REFERENCE'].includes(manifest.lifecycle) ||
            !/^[A-Z][A-Z0-9_]{1,63}$/.test(manifest.destinationRole) ||
            !Array.isArray(manifest.environmentScope) || manifest.environmentScope.length === 0 ||
            manifest.environmentScope.some(scope => !/^[A-Z][A-Z0-9_]{1,31}$/.test(scope)) ||
            !/^[A-Z][A-Z0-9_]{1,31}$/.test(manifest.sensitivity) ||
            !['IMMUTABLE', 'NONE'].includes(manifest.versioningPolicy) ||
            !['REQUIRED', 'NONE'].includes(manifest.publicationPolicy) ||
            !['ADMIN_INITIATED', 'NONE'].includes(manifest.initialPublicationPolicy) ||
            !['RETAIN', 'DELETE_EXPLICIT', 'UNPUBLISH_OR_RETIRE'].includes(manifest.removalPolicy)) {
            throw this.error('ERR_IMP_00003',
                'Data lifecycle metadata is invalid for module ' + moduleName + ' and data type ' + dataType);
        }
        if (manifest.lifecycle === 'PUBLISHABLE' &&
            (!/_STAGED$/.test(manifest.destinationRole) || manifest.versioningPolicy !== 'IMMUTABLE' ||
                manifest.publicationPolicy !== 'REQUIRED' || manifest.initialPublicationPolicy !== 'ADMIN_INITIATED' ||
                manifest.removalPolicy !== 'UNPUBLISH_OR_RETIRE')) {
            throw this.error('ERR_IMP_00003', 'Publishable data must target a Staged runtime with immutable, administrator-initiated publication semantics');
        }
        if (manifest.lifecycle !== 'PUBLISHABLE' &&
            (manifest.publicationPolicy !== 'NONE' || manifest.initialPublicationPolicy !== 'NONE')) {
            throw this.error('ERR_IMP_00003', 'Non-publishable data must not declare a publication lifecycle');
        }
        if (manifest.lifecycle === 'OPERATIONAL_VERSIONED' && manifest.versioningPolicy !== 'IMMUTABLE') {
            throw this.error('ERR_IMP_00003', 'Operational-versioned data must use immutable business versions');
        }
        if (manifest.lifecycle === 'REFERENCE' && manifest.versioningPolicy !== 'NONE') {
            throw this.error('ERR_IMP_00003', 'Reference data must not acquire artificial business versioning');
        }
        return Object.fromEntries(fields.map(field => [field, manifest[field]]));
    },

    /** Projects a bad manifest as a visible but non-executable release. */
    invalidManifestRelease: function (rawModule, dataType, manifestPath, error, sectionCode) {
        let manifest = {};
        try {
            manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            if (manifest.sections && manifest.sections[sectionCode]) manifest = manifest.sections[sectionCode];
        } catch (ignored) {
            manifest = {};
        }
        return {
            releaseCode: rawModule.name + ':' + sectionCode,
            sectionCode: sectionCode,
            moduleName: rawModule.name,
            displayName: rawModule.metaData && rawModule.metaData.nodics && rawModule.metaData.nodics.displayName || rawModule.name,
            parentModule: rawModule.parent,
            canonicalIdentity: rawModule.canonicalIdentity || rawModule.name,
            dataType: dataType,
            version: /^\d+\.\d+\.\d+$/.test(manifest.version || '') ? manifest.version : '0.0.0',
            description: 'This data release manifest is invalid and must be repaired before it can be validated or installed.',
            checksum: 'invalid-release',
            invalidManifest: true,
            invalidReason: error && error.message || 'Data release manifest is invalid'
        };
    },

    /** Builds the existing nImport request without exposing filesystem paths. */
    createImportRequest: function (request, plan, validationOnly) {
        let next = Object.assign({}, request, {
            tenant: plan.tenant,
            modules: [...new Set(plan.releases.map(release => release.moduleName))],
            options: Object.assign({}, request && request.options, { validateOnly: validationOnly }),
            dataReleasePlan: plan.releases.map(release => Object.assign(this.publicRelease(release), {
                sourceRoot: release.sourceRoot,
                declaredFiles: release.declaredFiles.slice()
            }))
        });
        return next;
    },

    /** Invokes the authoritative Init, Core, or Sample import operation. */
    invokeImport: async function (request, dataType) {
        let operation = { init: 'importInitData', core: 'importCoreData', sample: 'importSampleData' }[dataType];
        let selected = request.dataReleasePlan || [];
        let custom = selected.filter(release => release.installer);
        let standard = selected.filter(release => !release.installer);
        let results = [];
        for (let release of custom) {
            let providerName = (this.configuration().installers || {})[release.installer];
            let provider = providerName && SERVICE[providerName];
            if (!provider || typeof provider.installContribution !== 'function') {
                throw this.error('ERR_IMP_00004', 'Data release installer is unavailable: ' + release.installer);
            }
            results.push(await provider.installContribution(Object.assign({}, request, { contribution: release })));
        }
        if (standard.length > 0) {
            results.push(await SERVICE.DefaultImportService[operation](Object.assign(request, {
                dataReleasePlan: standard,
                modules: [...new Set(standard.map(release => release.moduleName))]
            })));
        }
        return { contributions: results };
    },

    /** Returns durable current installation projections for one tenant. */
    getInstallations: function (tenant) {
        let installationService = SERVICE.DefaultDataInstallationService;
        if (!installationService || typeof installationService.get !== 'function') return Promise.resolve([]);
        return installationService.get({ tenant: tenant, query: {}, searchOptions: { limit: 1000 } })
            .then(result => result && result.result || []);
    },

    /** Records RUNNING, CURRENT, or FAILED state through the generated model service. */
    recordInstallation: async function (plan, release, importRun, status) {
        let service = SERVICE.DefaultDataInstallationService;
        if (!service) return false;
        let code = this.installationCode(plan.tenant, release);
        let existing = await service.get({ tenant: plan.tenant, query: { code: code }, searchOptions: { limit: 1 } })
            .then(result => result && result.result && result.result[0]).catch(() => undefined);
        let model = {
            code: code, active: true, tenant: plan.tenant,
            environment: NODICS.getSelectedEnvironmentName(), moduleName: release.moduleName,
            releaseCode: release.releaseCode, sectionCode: release.sectionCode,
            dataType: release.dataType,
            version: status === 'CURRENT' ? release.version : existing && existing.version,
            checksum: status === 'CURRENT' ? release.checksum : existing && existing.checksum,
            availableVersion: release.version, availableChecksum: release.checksum,
            owningDomain: release.owningDomain, lifecycle: release.lifecycle,
            destinationRole: release.destinationRole, environmentScope: release.environmentScope,
            sensitivity: release.sensitivity, versioningPolicy: release.versioningPolicy,
            publicationPolicy: release.publicationPolicy,
            initialPublicationPolicy: release.initialPublicationPolicy,
            removalPolicy: release.removalPolicy,
            runId: importRun && importRun.runId || existing && existing.runId,
            status: status,
            installedAt: status === 'CURRENT' ? new Date().toISOString() : existing && existing.installedAt,
            lastAttemptAt: new Date().toISOString()
        };
        if (existing && typeof service.update === 'function') {
            return service.update({ tenant: plan.tenant, query: { code: code }, model: model });
        }
        return service.save({ tenant: plan.tenant, model: model });
    },

    /** Combines available and installed state into a client-safe catalogue item. */
    toCatalogueItem: function (release, installed, running) {
        if (release.invalidManifest === true) {
            return Object.assign(this.publicRelease(release), {
                installedVersion: installed && installed.version,
                installedChecksum: installed && installed.checksum,
                lastRunId: installed && installed.runId,
                installedAt: installed && installed.installedAt,
                lastAttemptAt: installed && installed.lastAttemptAt,
                status: 'INVALID_RELEASE'
            });
        }
        let status = 'NOT_INSTALLED';
        if (installed) {
            let comparison = this.compareVersions(release.version, installed.version);
            status = comparison > 0 ? 'UPDATE_AVAILABLE' :
                comparison < 0 ? 'DOWNGRADE_AVAILABLE' :
                    release.checksum === installed.checksum ? 'CURRENT' : 'INVALID_RELEASE';
            if (installed.status === 'FAILED') status = 'FAILED';
        }
        if (running || installed && installed.status === 'RUNNING') status = 'RUNNING';
        return Object.assign(this.publicRelease(release), {
            installedVersion: installed && installed.version,
            installedChecksum: installed && installed.checksum,
            lastRunId: installed && installed.runId,
            installedAt: installed && installed.installedAt,
            lastAttemptAt: installed && installed.lastAttemptAt,
            status: status
        });
    },

    /** Enforces downgrade and same-version checksum policy. */
    validateUpgradePolicy: function (release, installed) {
        if (!installed) return true;
        let comparison = this.compareVersions(release.version, installed.version);
        if (comparison < 0 && this.configuration().allowDowngrade !== true) {
            throw this.error('ERR_IMP_00003', 'Data release downgrade is not allowed');
        }
        if (comparison === 0 && release.checksum !== installed.checksum) {
            throw this.error('ERR_IMP_00003', 'Data release content changed without a version change');
        }
        return true;
    },

    /** Rejects unsupported release types. */
    validateDataType: function (dataType) {
        if (!['init', 'core', 'sample'].includes(dataType)) throw this.error('ERR_IMP_00003', 'Data release type is invalid');
    },

    /** Enforces layered enablement for a release type. */
    validateTypePolicy: function (dataType) {
        let typePolicy = (this.configuration().types || {})[dataType] || {};
        if (typePolicy.enabled === false) throw this.error('ERR_IMP_00002', 'Data release type is disabled');
    },

    /** Returns effective layered data-release configuration. */
    configuration: function () {
        return (CONFIG.get('data') && CONFIG.get('data').dataReleases) || {};
    },

    /** Creates the stable environment, tenant, module, and type projection key. */
    installationCode: function (tenant, release) {
        return [NODICS.getSelectedEnvironmentName(), tenant, release.releaseCode, release.dataType].join(':');
    },

    /** Projects release metadata without paths or executable content. */
    publicRelease: function (release) {
        return {
            releaseCode: release.releaseCode, sectionCode: release.sectionCode,
            moduleName: release.moduleName, displayName: release.displayName,
            parentModule: release.parentModule, canonicalIdentity: release.canonicalIdentity,
            dataType: release.dataType, version: release.version,
            sourceRoot: release.sourceRoot,
            description: release.description, checksum: release.checksum,
            owningDomain: release.owningDomain, lifecycle: release.lifecycle,
            destinationRole: release.destinationRole, environmentScope: release.environmentScope,
            sensitivity: release.sensitivity, versioningPolicy: release.versioningPolicy,
            publicationPolicy: release.publicationPolicy,
            initialPublicationPolicy: release.initialPublicationPolicy,
            removalPolicy: release.removalPolicy,
            installer: release.installer,
            invalidReason: release.invalidReason
        };
    },

    /** Resolves trusted tenant context with the established default fallback. */
    resolveTenant: function (request) {
        return request && request.tenant || CONFIG.get('defaultTenant') || 'default';
    },

    /** Compares strict three-part numeric release versions. */
    compareVersions: function (first, second) {
        let a = String(first || '0.0.0').split('.').map(Number);
        let b = String(second || '0.0.0').split('.').map(Number);
        for (let index = 0; index < 3; index++) {
            if (a[index] !== b[index]) return a[index] > b[index] ? 1 : -1;
        }
        return 0;
    },

    /** Creates a stable Nodics error without leaking internal details. */
    error: function (code, message) {
        if (typeof CLASSES !== 'undefined' && CLASSES.NodicsError) return new CLASSES.NodicsError(code, message);
        let error = new Error(message);
        error.code = code;
        return error;
    }
};
