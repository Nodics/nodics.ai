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
        let releases = this.discoverReleases(request && request.dataType)
            .filter(release => release.invalidManifest === true || this.isDestinationCompatible(release));
        let installations = await this.getInstallations(tenant);
        let byCode = Object.fromEntries(installations.map(item => [item.code, item]));
        return {
            code: 'SUC_IMP_00000',
            data: releases.map(release => this.toCatalogueItem(release,
                byCode[this.installationCode(tenant, release)],
                this.activeExecutions.has(tenant + ':' + release.dataType)))
        };
    },

    /** Returns configured guided initialization profiles with current release state. */
    getInitializationProfiles: async function (request) {
        let profiles = this.initializationProfiles();
        let values = [];
        for (let code of Object.keys(profiles).sort()) {
            values.push(await this.buildInitializationProfile(code, profiles[code], request));
        }
        return { code: 'SUC_IMP_00000', data: values };
    },

    /** Returns one deterministic guided initialization plan. */
    getInitializationProfile: async function (request) {
        let code = this.profileCode(request);
        let profile = this.initializationProfiles()[code];
        if (!profile) throw this.error('ERR_IMP_00004', 'Initialization profile is unavailable');
        return { code: 'SUC_IMP_00000', data: await this.buildInitializationProfile(code, profile, request) };
    },

    /** Validates or executes a configured profile in its declared step order. */
    runInitializationProfile: async function (request, execute) {
        let code = this.profileCode(request);
        let definition = this.initializationProfiles()[code];
        if (!definition) throw this.error('ERR_IMP_00004', 'Initialization profile is unavailable');
        let profile = await this.buildInitializationProfile(code, definition, request);
        if (profile.blocked) throw this.error('ERR_IMP_00003', 'Initialization profile contains blocked releases');
        if (execute) this.validateInitializationProfilePermissions(profile, request);
        let results = [];
        for (let step of profile.steps) {
            let selected = step.releases.filter(item => execute ?
                ['NOT_INSTALLED', 'UPDATE_AVAILABLE', 'FAILED'].includes(item.status) : true);
            if (selected.length === 0) {
                results.push({ dataType: step.dataType, skipped: true, releases: step.releases });
                continue;
            }
            let operationRequest = Object.assign({}, request, { releaseRequest: {
                dataType: step.dataType,
                releaseCodes: selected.map(item => item.releaseCode),
                expectedReleases: Object.fromEntries(selected.map(item => [item.releaseCode, item.version]))
            } });
            let result = execute ? await this.execute(operationRequest) : await this.preflight(operationRequest);
            results.push(result.data);
        }
        return { code: 'SUC_IMP_00000', data: {
            profileCode: code, mode: execute ? 'INSTALL' : 'VALIDATE', results: results,
            profile: await this.buildInitializationProfile(code, definition, request)
        } };
    },

    /** Enforces every type-specific execution permission represented by a profile. */
    validateInitializationProfilePermissions: function (profile, request) {
        let granted = request && request.authData && request.authData.permissions || [];
        if (!Array.isArray(granted) || profile.requiredPermissions.some(permission => !granted.includes(permission))) {
            throw this.error('ERR_AUTH_00003', 'Initialization profile execution permission is missing');
        }
        return true;
    },

    /** Validates effective profile definitions and removes disabled profiles. */
    initializationProfiles: function () {
        let profiles = this.configuration().initializationProfiles || {};
        if (!profiles || typeof profiles !== 'object' || Array.isArray(profiles)) {
            throw this.error('ERR_IMP_00003', 'Initialization profiles configuration is invalid');
        }
        let result = {};
        Object.entries(profiles).forEach(entry => {
            let code = entry[0], profile = entry[1];
            if (profile && profile.enabled === false) return;
            let validText = (value, maximum) => typeof value === 'string' && value === value.trim() &&
                value.length > 0 && value.length <= maximum && !/[<>\u0000-\u001F\u007F]/.test(value);
            let releaseCodePattern = /^[A-Za-z][A-Za-z0-9._-]{0,127}:[A-Za-z][A-Za-z0-9_-]{0,127}$/;
            let invalidStep = Array.isArray(profile && profile.steps) && profile.steps.some(step =>
                !step || !['init', 'core', 'sample'].includes(step.dataType) ||
                (step.releaseCodes !== undefined && (!Array.isArray(step.releaseCodes) || step.releaseCodes.length === 0 ||
                    step.releaseCodes.length > 256 || new Set(step.releaseCodes).size !== step.releaseCodes.length ||
                    step.releaseCodes.some(releaseCode => typeof releaseCode !== 'string' || !releaseCodePattern.test(releaseCode)))));
            if (!/^[A-Za-z][A-Za-z0-9_-]{0,127}$/.test(code) || !profile || typeof profile !== 'object' ||
                !validText(profile.label, 160) || !validText(profile.description, 600) ||
                !validText(profile.completionMessage, 600) || !Array.isArray(profile.steps) ||
                profile.steps.length === 0 || profile.steps.length > 3 || invalidStep ||
                new Set(profile.steps.map(step => step && step.dataType)).size !== profile.steps.length) {
                throw this.error('ERR_IMP_00003', 'Initialization profile configuration is invalid: ' + code);
            }
            result[code] = profile;
        });
        return result;
    },

    /** Builds a profile exclusively from the authoritative release catalogue. */
    buildInitializationProfile: async function (code, definition, request) {
        let tenant = this.resolveTenant(request);
        let installations = await this.getInstallations(tenant);
        let installedByCode = Object.fromEntries(installations.map(item => [item.code, item]));
        let steps = definition.steps.map((step, index) => {
            let releases = this.discoverReleases(step.dataType);
            if (step.releaseCodes) {
                let requested = new Set(step.releaseCodes);
                releases = releases.filter(release => requested.has(release.releaseCode));
                if (releases.length !== requested.size) throw this.error('ERR_IMP_00004', 'Initialization profile release is unavailable: ' + code);
                releases.forEach(release => this.validateDestination(release));
            } else {
                releases = releases.filter(release => this.isDestinationCompatible(release));
            }
            return { order: index + 1, dataType: step.dataType, releases: releases.map(release =>
                this.toCatalogueItem(release, installedByCode[this.installationCode(tenant, release)],
                    this.activeExecutions.has(tenant + ':' + release.dataType))) };
        });
        let releases = steps.flatMap(step => step.releases);
        let requiredPermissions = [...new Set(steps.filter(step => step.releases.length > 0)
            .map(step => 'import.' + step.dataType + '.run'))];
        return {
            profileCode: code, label: String(definition.label), description: String(definition.description),
            completionMessage: String(definition.completionMessage), destinationRole: (CONFIG.get('runtimeRole') || {}).publication,
            status: releases.length > 0 && releases.every(item => item.status === 'CURRENT') ? 'CURRENT' :
                releases.some(item => ['INVALID_RELEASE', 'DOWNGRADE_AVAILABLE'].includes(item.status)) ? 'BLOCKED' :
                    releases.some(item => item.status === 'RUNNING') ? 'RUNNING' : 'ACTION_REQUIRED',
            blocked: releases.some(item => ['INVALID_RELEASE', 'DOWNGRADE_AVAILABLE'].includes(item.status)),
            requiredPermissions: requiredPermissions,
            steps: steps
        };
    },

    /** Tests implicit profile discovery against the current semantic destination without weakening explicit validation. */
    isDestinationCompatible: function (release) {
        let policy = this.configuration();
        if (policy.destinationEnforced !== true) return true;
        let configuredRole = CONFIG.get('runtimeRole');
        let runtimeRole = typeof configuredRole === 'string' ? configuredRole : configuredRole && configuredRole.code;
        let environment = String(policy.environmentClass ||
            NODICS.getSelectedEnvironmentName && NODICS.getSelectedEnvironmentName() || '').toUpperCase();
        return Boolean(runtimeRole && release.destinationRole === runtimeRole &&
            Array.isArray(release.environmentScope) &&
            (release.environmentScope.includes('ALL') || release.environmentScope.includes(environment)));
    },

    /** Resolves a bounded route-owned profile identifier. */
    profileCode: function (request) {
        let params = request && request.httpRequest && request.httpRequest.params || request && request.params || {};
        let code = String(params.profileCode || request && request.profileCode || '');
        if (!/^[A-Za-z][A-Za-z0-9_-]{0,127}$/.test(code)) throw this.error('ERR_IMP_00003', 'Initialization profile code is invalid');
        return code;
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
        plan = this.executablePlan(plan, operationReleases, request.releaseRequest && request.releaseRequest.forceCurrent === true);
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
            requested.some(code => !/^[A-Za-z][A-Za-z0-9._-]{0,127}(?::[A-Za-z][A-Za-z0-9_-]{0,127})?$/.test(code))) {
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
    executablePlan: function (plan, operationReleases, forceCurrent) {
        let executableReleases = new Set((operationReleases || [])
            .filter(release => ['NOT_INSTALLED', 'UPDATE_AVAILABLE', 'FAILED'].includes(release.status) ||
                forceCurrent === true && release.status === 'CURRENT' && this.isDevelopmentRelease(release.version))
            .map(release => release.releaseCode));
        return Object.assign({}, plan, {
            releases: plan.releases.filter(release => executableReleases.has(release.releaseCode))
        });
    },

    /** Resolves active owners plus explicitly allowlisted inactive contribution owners without activating their runtime behavior. */
    discoveryOwners: function () {
        let active = new Set(NODICS.getActiveModules() || []);
        let configured = this.configuration().contributions || [];
        if (!Array.isArray(configured)) throw this.error('ERR_IMP_00003', 'Data release contributions configuration must be a list');
        let selectors = new Map(Array.from(active).map(moduleName => [moduleName, { moduleName: moduleName, active: true }]));
        configured.forEach(selector => {
            if (!selector || typeof selector !== 'object' || !/^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(selector.moduleName || '') ||
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
        let discoveryOrder = 0;
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
                        releases.push(Object.assign(
                            this.inspectManifest(rawModule, entry[1].dataType, aggregatePath, entry[1], entry[0], !selector.active),
                            { discoveryOrder: discoveryOrder++ }
                        ));
                    } catch (error) {
                        releases.push(Object.assign(
                            this.invalidManifestRelease(rawModule, entry[1].dataType, aggregatePath, error, entry[0]),
                            { discoveryOrder: discoveryOrder++ }
                        ));
                    }
                });
                return;
            }
            if (!selector.active) return;
            ['init', 'core', 'sample'].filter(type => !requestedType || requestedType === type).forEach(dataType => {
                let legacyPath = path.join(rawModule.path, 'data', dataType, 'manifest.json');
                if (!fs.existsSync(legacyPath)) return;
                try {
                    releases.push(Object.assign(
                        this.inspectManifest(rawModule, dataType, legacyPath, undefined, dataType),
                        { discoveryOrder: discoveryOrder++ }
                    ));
                } catch (error) {
                    releases.push(Object.assign(
                        this.invalidManifestRelease(rawModule, dataType, legacyPath, error, dataType),
                        { discoveryOrder: discoveryOrder++ }
                    ));
                }
            });
        });
        return releases.sort((first, second) =>
            first.dataType.localeCompare(second.dataType) ||
            first.discoveryOrder - second.discoveryOrder ||
            first.releaseCode.localeCompare(second.releaseCode));
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
        let allowedContracts = this.configuration().allowedContractVersions || [2];
        if (!manifest || !allowedContracts.includes(manifest.contractVersion) || manifest.module !== rawModule.name ||
            !manifest.sections || typeof manifest.sections !== 'object' || Array.isArray(manifest.sections)) {
            throw this.error('ERR_IMP_00003', 'Aggregate data manifest is incompatible for module ' + rawModule.name +
                '; verify contractVersion, module identity, and sections map');
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
        if (!manifest || (!isAggregate && !(this.configuration().allowedContractVersions || [2]).includes(manifest.contractVersion)) ||
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
        let isVersionedSourceRoot = /^(init|core|sample)-v\d{3}$/.test(sourceRoot);
        if (!isVersionedSourceRoot && !['init', 'core', 'sample', 'staged', 'operational', 'reference'].includes(sourceRoot)) {
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
            displayName: manifest.displayName ||
                rawModule.metaData && rawModule.metaData.nodics && rawModule.metaData.nodics.displayName || rawModule.name,
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
            declaredFiles: fileNames.slice(),
            publicationReview: this.validatePublicationReview(manifest.publicationReview, rawModule.name, sectionCode)
        };
    },

    /** Validates optional client-safe publication review guidance owned by an immutable release manifest. */
    validatePublicationReview: function (review, moduleName, sectionCode) {
        if (review === undefined) return undefined;
        if (!review || typeof review !== 'object' || Array.isArray(review) ||
            !String(review.title || '').trim() || !String(review.summary || '').trim() ||
            !String(review.impactMessage || '').trim() || !String(review.rollbackMessage || '').trim() ||
            !/^[A-Z][A-Z0-9_]{1,63}$/.test(String(review.sourceRole || '')) ||
            !/^[A-Z][A-Z0-9_]{1,63}$/.test(String(review.targetRole || '')) ||
            !/^[A-Za-z][A-Za-z0-9._-]{1,127}$/.test(String(review.siteCode || '')) ||
            !/^[A-Za-z][A-Za-z0-9._-]{1,127}$/.test(String(review.catalogCode || '')) ||
            !Array.isArray(review.entities) || review.entities.length === 0 || review.entities.length > 64 ||
            !Array.isArray(review.postPublicationCapabilities) || review.postPublicationCapabilities.length === 0 ||
            review.postPublicationCapabilities.length > 32) {
            throw this.error('ERR_IMP_00003', 'Publication review metadata is invalid for ' + moduleName + ':' + sectionCode);
        }
        let text = (value, maximum) => {
            let result = String(value || '').trim();
            if (!result || result.length > maximum || /[<>]/.test(result)) {
                throw this.error('ERR_IMP_00003', 'Publication review text is invalid for ' + moduleName + ':' + sectionCode);
            }
            return result;
        };
        let entities = review.entities.map(item => {
            if (!item || typeof item !== 'object' || Array.isArray(item) ||
                !/^[A-Za-z][A-Za-z0-9._-]{1,63}$/.test(String(item.type || ''))) {
                throw this.error('ERR_IMP_00003', 'Publication review entity is invalid for ' + moduleName + ':' + sectionCode);
            }
            let counts = ['total', 'added', 'updated', 'unchanged', 'removed'].reduce((result, key) => {
                let value = Number(item[key] || 0);
                if (!Number.isSafeInteger(value) || value < 0 || value > 10000000) {
                    throw this.error('ERR_IMP_00003', 'Publication review count is invalid for ' + moduleName + ':' + sectionCode);
                }
                result[key] = value;
                return result;
            }, {});
            return Object.assign({ type: String(item.type), label: text(item.label, 80) }, counts);
        });
        let capabilities = review.postPublicationCapabilities.map(item => {
            if (!item || typeof item !== 'object' || Array.isArray(item)) {
                throw this.error('ERR_IMP_00003', 'Post-publication capability is invalid for ' + moduleName + ':' + sectionCode);
            }
            return { title: text(item.title, 120), description: text(item.description, 400) };
        });
        return {
            title: text(review.title, 160), summary: text(review.summary, 600),
            sourceRole: String(review.sourceRole), targetRole: String(review.targetRole),
            siteCode: String(review.siteCode), catalogCode: String(review.catalogCode),
            impactMessage: text(review.impactMessage, 600), rollbackMessage: text(review.rollbackMessage, 600),
            entities: entities, postPublicationCapabilities: capabilities
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
            displayName: manifest.displayName ||
                rawModule.metaData && rawModule.metaData.nodics && rawModule.metaData.nodics.displayName || rawModule.name,
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
    getInstallations: async function (tenant) {
        let installationService = SERVICE.DefaultDataInstallationService;
        if (!installationService || typeof installationService.get !== 'function') return [];
        let pageSize = 500;
        let pageNumber = 1;
        let installations = [];
        while (true) {
            let result = await installationService.get({
                tenant: tenant,
                query: {},
                searchOptions: { pageSize: pageSize, pageNumber: pageNumber }
            });
            let page = result && result.result || [];
            installations = installations.concat(page);
            if (page.length < pageSize) return installations;
            pageNumber += 1;
        }
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
            let developmentBaseline = this.isDevelopmentRelease(release.version);
            status = developmentBaseline && release.checksum !== installed.checksum ? 'UPDATE_AVAILABLE' :
                comparison > 0 ? 'UPDATE_AVAILABLE' :
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
        if (this.isDevelopmentRelease(release.version)) return true;
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
            publicationReview: release.publicationReview,
            invalidReason: release.invalidReason
        };
    },

    /** Resolves trusted tenant context with the established default fallback. */
    resolveTenant: function (request) {
        return request && request.tenant || CONFIG.get('defaultTenant') || 'default';
    },

    /** Returns whether a release is the mutable pre-release development baseline. */
    isDevelopmentRelease: function (version) {
        return String(version || '') === '0.0.0';
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
