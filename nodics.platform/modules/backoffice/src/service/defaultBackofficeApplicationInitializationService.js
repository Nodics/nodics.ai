/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module backoffice/service/DefaultBackofficeApplicationInitializationService
 * @description Projects and initiates configured application/site bundles through complete target-runtime preparation and fixed WCMS Staged baseline publication.
 * @layer service
 * @owner backoffice
 * @override Customer projects may add profile descriptors through later configuration without replacing Platform orchestration.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

module.exports = {
    /** Executes the documented bounded module operation. */
    init: function () { return Promise.resolve(true); },
    /** Executes the documented bounded module operation. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns every configured application initialization profile as a client-safe catalogue. */
    profiles: function () {
        let profiles = ((CONFIG.get('backofficeApplicationInitialization') || {}).profiles || {});
        return Object.keys(profiles).filter(code => (profiles[code].presentation || {}).visible !== false).sort((left, right) => {
            let leftOrder = Number((profiles[left].presentation || {}).order || 1000);
            let rightOrder = Number((profiles[right].presentation || {}).order || 1000);
            return leftOrder === rightOrder ? left.localeCompare(right) : leftOrder - rightOrder;
        }).map(code => this.describe(profiles[code])).filter(Boolean);
    },
    /** Projects one configured profile without exposing transport internals or credentials. */
    describe: function (profile) {
        if (!profile || !profile.code) return undefined;
        let presentation = profile.presentation || {};
        let preparationSteps = this.preparationSteps(profile);
        let requiredFunctionalModules = this.requiredFunctionalModules(profile);
        let dataPackages = preparationSteps.map(step => ({
            code: step.code,
            kind: step.kind,
            required: step.required,
            trigger: step.trigger,
            dataType: step.dataType,
            targetServer: step.targetServer,
            targetRuntimeRole: step.targetRuntimeRole
        }));
        if (profile.contentPackCode) dataPackages.push({
            code: String(profile.contentPackCode),
            kind: 'CONTENT_PACK',
            required: true,
            trigger: 'USER'
        });
        return {
            code: String(profile.code),
            title: String(presentation.title || profile.code),
            kind: String(presentation.kind || (profile.type === 'DOCUMENTATION_BUNDLE' ? 'DOCUMENTATION' : 'PROJECT')),
            category: String(presentation.category || (profile.type === 'DOCUMENTATION_BUNDLE' ? 'documentation' : 'accelerator')),
            summary: String(presentation.summary || ''),
            order: Number(presentation.order || 1000),
            type: String(profile.type),
            owner: String(profile.owner),
            applicationCode: String(profile.applicationCode),
            siteCode: String(profile.siteCode),
            baselineCode: String(profile.baselineCode),
            contentPackCode: profile.contentPackCode ? String(profile.contentPackCode) : undefined,
            requiredServers: [].concat(presentation.requiredServers || ['Platform', 'WCMS Staged', 'WCMS Online', 'Process']),
            requiredFunctionalModules: requiredFunctionalModules.map(item => ({
                code: item.code,
                label: item.label,
                required: item.required,
                order: item.order
            })),
            dataPackages: dataPackages,
            preparationSteps: preparationSteps,
            activationPolicy: Object.assign({
                approvalRequiredForOnline: true,
                requiredDataTrigger: profile.type === 'DOCUMENTATION_BUNDLE' ? 'USER' : 'ACTIVATION',
                sampleDataTrigger: 'USER'
            }, presentation.activationPolicy || {})
        };
    },
    /** Returns a normalized application-preparation plan owned by the profile contract. */
    preparationSteps: function (profile) {
        let rawSteps = profile && profile.preparation && Array.isArray(profile.preparation.steps) ?
            profile.preparation.steps : [].concat(profile && profile.dataPackages || []).map(pack => Object.assign({
                type: 'DATA_RELEASE',
                dataType: pack.dataType || (pack.type === 'MEDIA_ASSET_MANIFEST' ? 'media' :
                    pack.kind === 'CORE_CONTENT' ? 'core' : 'sample'),
                targetServer: pack.targetServer || profile.target && profile.target.connectionName,
                targetRuntimeRole: pack.targetRuntimeRole || profile.target && (profile.target.runtimeRole || 'WCMS_STAGED')
            }, pack));
        return rawSteps.map((step, index) => this.normalizePreparationStep(step, index)).filter(Boolean);
    },
    /** Validates one client-safe preparation step. */
    normalizePreparationStep: function (step, index) {
        if (!step || step.enabled === false) return undefined;
        let type = String(step.type || 'DATA_RELEASE');
        if (!['DATA_RELEASE', 'MEDIA_ASSET_MANIFEST'].includes(type)) {
            throw new CLASSES.NodicsError('ERR_BOF_00081', 'Application preparation step type is unsupported');
        }
        let code = String(step.code || '');
        let dataType = String(step.dataType || (type === 'MEDIA_ASSET_MANIFEST' ? 'media' : '')).toLowerCase();
        let targetServer = String(step.targetServer || step.connectionName || '');
        let targetRuntimeRole = String(step.targetRuntimeRole || step.runtimeRole || (type === 'MEDIA_ASSET_MANIFEST' ? 'WCMS_STAGED' : ''));
        let manifestPath = String(step.manifestPath || '');
        if (!/^[A-Za-z][A-Za-z0-9._-]{0,127}:[A-Za-z][A-Za-z0-9_-]{0,127}$/.test(code) ||
            !['init', 'core', 'sample', 'media'].includes(dataType) ||
            !/^[A-Za-z][A-Za-z0-9_-]{0,127}$/.test(targetServer) ||
            !/^[A-Z][A-Z0-9_]{1,63}$/.test(targetRuntimeRole) ||
            (type === 'MEDIA_ASSET_MANIFEST' && (!manifestPath || path.isAbsolute(manifestPath) || manifestPath.split(/[\\/]+/).includes('..')))) {
            throw new CLASSES.NodicsError('ERR_BOF_00081', 'Application preparation step configuration is invalid');
        }
        return {
            order: Number(step.order || index + 1),
            type: type,
            code: code,
            kind: String(step.kind || 'DATA_RELEASE'),
            label: String(step.label || ''),
            required: step.required !== false,
            trigger: String(step.trigger || (step.required === false ? 'USER' : 'ACTIVATION')),
            dataType: dataType,
            targetServer: targetServer,
            targetRuntimeRole: targetRuntimeRole,
            manifestPath: type === 'MEDIA_ASSET_MANIFEST' ? manifestPath : undefined,
            folderCode: step.folderCode ? String(step.folderCode) : undefined,
            businessPurpose: step.businessPurpose ? String(step.businessPurpose) : undefined
        };
    },
    /** Returns normalized functional capabilities required before an application can be considered ready. */
    requiredFunctionalModules: function (profile) {
        let presentation = profile && profile.presentation || {};
        let rawModules = [].concat(profile && profile.requiredFunctionalModules || [],
            presentation.requiredFunctionalModules || []);
        return rawModules.map((item, index) => {
            let source = typeof item === 'string' ? { code: item } : (item || {});
            let code = String(source.code || source.functionalModule || '');
            if (!/^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(code)) {
                throw new CLASSES.NodicsError('ERR_BOF_00081', 'Application required functional module is invalid');
            }
            return {
                order: Number(source.order || index + 1),
                type: 'FUNCTIONAL_MODULE',
                code: code,
                kind: String(source.kind || 'Required capability'),
                label: String(source.label || this.businessCapabilityLabel(code)),
                required: source.required !== false,
                trigger: String(source.trigger || 'PROJECT_REGISTRATION'),
                dataType: 'capability',
                targetServer: String(source.targetServer || 'platform'),
                targetRuntimeRole: String(source.targetRuntimeRole || 'PLATFORM')
            };
        }).filter(item => item.required !== false);
    },
    /** Creates a business-facing label from a canonical functional module identity. */
    businessCapabilityLabel: function (functionalModule) {
        return String(functionalModule || '')
            .replace(/^nodics\./, '')
            .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
            .replace(/[._-]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .replace(/\b\w/g, value => value.toUpperCase()) + ' capability';
    },
    /** Resolves the customer project identity used by the functional-module registry. */
    projectCode: function (request) {
        let query = request && (request.query || request.httpRequest && request.httpRequest.query) || {};
        let configured = (CONFIG.get('backofficeApplicationInitialization') || {}).projectCode ||
            request && request.project || query.project ||
            process.env.NODICS_PROJECT_CODE ||
            (typeof NODICS !== 'undefined' && NODICS.getEnvironmentName && NODICS.getEnvironmentName());
        if (!configured) throw new CLASSES.NodicsError('ERR_BOF_00081', 'Application initialization project identity is unavailable');
        return String(configured);
    },
    /** Projects required functional-module registration readiness into the application preparation contract. */
    functionalModulePreparationStatus: async function (profile, request) {
        let requirements = this.requiredFunctionalModules(profile);
        if (!requirements.length) return [];
        let catalogue = SERVICE.DefaultFunctionalModuleCatalogueService;
        if (!catalogue || typeof catalogue.getRecord !== 'function') {
            return requirements.map(step => Object.assign({}, step, {
                status: 'UNAVAILABLE',
                message: step.label + ' cannot be checked because the module registry is unavailable.'
            }));
        }
        let project = this.projectCode(request);
        let projected = [];
        for (let step of requirements) {
            try {
                let record = await catalogue.getRecord(project, step.code, request);
                let displayName = record && record.displayName || step.label;
                let status = !record || record.registrationState === 'DEREGISTERED' ? 'NOT_REGISTERED' :
                    record.runtimeState !== 'ACTIVE' ? 'RUNTIME_OFFLINE' :
                        record.registrationState !== 'REGISTERED' ? 'NOT_REGISTERED' :
                            record.enabled !== true ? 'NOT_ACTIVE' : 'CURRENT';
                projected.push(Object.assign({}, step, {
                    status: status,
                    version: record && record.registeredVersion,
                    description: String(displayName),
                    message: status === 'CURRENT' ? String(displayName) + ' is registered and active.' :
                        status === 'NOT_ACTIVE' ? String(displayName) + ' is registered but not activated for this project.' :
                            status === 'RUNTIME_OFFLINE' ? String(displayName) + ' is registered but no compatible runtime is active.' :
                                String(displayName) + ' must be registered and activated in Module Registry before this application can go live.'
                }));
            } catch (error) {
                projected.push(Object.assign({}, step, {
                    status: 'UNAVAILABLE',
                    message: error && error.message || step.label + ' cannot be checked.'
                }));
            }
        }
        return projected;
    },
    /** Returns the immutable configured application profile. */
    /** Executes the documented bounded module operation. */
    profile: function (code) {
        if (!/^[a-z][a-z0-9_-]{0,63}$/.test(String(code || ''))) {
            throw new CLASSES.NodicsError('ERR_BOF_00080', 'Application profile code is invalid');
        }
        let profile = ((CONFIG.get('backofficeApplicationInitialization') || {}).profiles || {})[code];
        if (!profile || !profile.owner || !profile.applicationCode || !profile.siteCode || !profile.baselineCode ||
            !profile.target || !profile.target.moduleName || !profile.target.connectionName || profile.target.connectionName === 'default') {
            throw new CLASSES.NodicsError('ERR_BOF_00081', 'Application initialization profile is unavailable');
        }
        return Object.assign({}, profile);
    },
    /** Requires a human principal for initiation while allowing authenticated status reads. */
    /** Executes the documented bounded module operation. */
    human: function (request) {
        let auth = request && request.authData || {};
        let principal = String(auth.principalId || auth.loginId || auth.code || '');
        if (!principal || auth.tokenType === 'service') {
            throw new CLASSES.NodicsError('ERR_BOF_00082', 'An authenticated human administrator is required');
        }
        return principal;
    },
    /** Preserves sanitized target-side diagnostics for operators without exposing request credentials. */
    targetDiagnostic: function (error, profile) {
        let source = error && (error.data || error.result || error.response || error);
        let targetCode = String(source && (source.code || source.errorCode) || error && error.code || 'UNKNOWN_TARGET_ERROR');
        let remoteResponse = source && source.remoteResponse || error && error.remoteResponse;
        let targetMessage = String(source && (source.remoteMessage || source.message) ||
            remoteResponse && (remoteResponse.message || remoteResponse.error || remoteResponse.reason) ||
            error && (error.remoteMessage || error.message) || 'Unknown target error');
        let targetResponseCode = source && source.responseCode ? String(source.responseCode) : undefined;
        return new CLASSES.NodicsError({
            code: 'ERR_BOF_00085',
            message: 'Application initialization target failed for profile ' +
                profile.code + ' baseline ' + profile.baselineCode + ' on ' + profile.target.moduleName +
                ': ' + targetCode + ' - ' + targetMessage,
            metadata: {
                targetCode: targetCode,
                targetMessage: targetMessage,
                targetResponseCode: targetResponseCode,
                profileCode: profile.code,
                baselineCode: profile.baselineCode,
                targetModuleName: profile.target.moduleName
            },
            causes: remoteResponse ? [remoteResponse] : undefined
        });
    },
    /** Invokes one target runtime data-release operation for application preparation. */
    invokeDataReleaseOperation: function (mode, group, request) {
        let token = NODICS.getInternalAuthToken(request.tenant);
        if (!token) throw new CLASSES.NodicsError('ERR_BOF_00083', 'Application initialization service authentication is unavailable');
        let suffix = mode === 'preflight' ? 'validate' : 'install';
        return SERVICE.DefaultModuleService.invokeModule({
            moduleName: 'import',
            connectionName: group.targetServer,
            connectionType: 'abstract',
            targetAuthority: { server: group.targetServer, runtimeRole: { code: group.targetRuntimeRole } },
            methodName: 'POST',
            apiName: '/' + group.dataType + '/' + suffix,
            requestBody: {
                dataType: group.dataType,
                releaseCodes: group.steps.map(step => step.code),
                expectedReleases: group.expectedReleases
            },
            timeoutMs: group.timeoutMs || 120000,
            maxAttempts: 1,
            idempotencyKey: mode === 'execute' ? group.idempotencyKey : undefined,
            header: { Authorization: 'Bearer ' + token },
            responseSelector: response => response && (response.data || response.result || response)
        });
    },
    /** Groups required preparation steps by target runtime and release type. */
    preparationGroups: function (profile, request, steps) {
        let input = request.applicationInitialization || {};
        let correlationId = input.correlationId || request.correlationId || request.requestId;
        let groups = {};
        steps.filter(step => step.required !== false && step.type === 'DATA_RELEASE').forEach(step => {
            let key = [step.targetServer, step.targetRuntimeRole, step.dataType].join(':');
            groups[key] = groups[key] || {
                targetServer: step.targetServer,
                targetRuntimeRole: step.targetRuntimeRole,
                dataType: step.dataType,
                steps: [],
                idempotencyKey: profile.code + ':prepare:' + key + ':' + String(correlationId || request.authData && request.authData.principalId || 'operator')
            };
            groups[key].steps.push(step);
        });
        return Object.values(groups).sort((left, right) =>
            left.targetServer.localeCompare(right.targetServer) ||
            left.dataType.localeCompare(right.dataType));
    },
    /** Returns current preparation state for every declared data-release dependency. */
    preparationStatus: async function (profile, request) {
        let steps = this.preparationSteps(profile);
        let functionalModuleSteps = await this.functionalModulePreparationStatus(profile, request);
        if (!steps.length && !functionalModuleSteps.length) return { status: 'CURRENT', steps: [] };
        let projected = [];
        let groups = this.preparationGroups(profile, request, steps);
        for (let group of groups) {
            try {
                let result = await this.invokeDataReleaseOperation('preflight', group, request);
                let releases = result && result.releases || result && result.data && result.data.releases || [];
                let byCode = Object.fromEntries(releases.map(release => [release.releaseCode, release]));
                group.steps.forEach(step => {
                    let release = byCode[step.code] || {};
                    projected.push(Object.assign({}, step, {
                        status: String(release.status || 'UNKNOWN'),
                        version: release.version,
                        installedVersion: release.installedVersion,
                        description: release.description
                    }));
                });
            } catch (error) {
                group.steps.forEach(step => projected.push(Object.assign({}, step, {
                    status: 'UNAVAILABLE',
                    message: error && (error.remoteMessage || error.message) || 'Preparation target is unavailable'
                })));
            }
        }
        steps.filter(step => step.required !== false && step.type === 'MEDIA_ASSET_MANIFEST').forEach(step => {
            let count = this.mediaManifestAssetCount(step);
            projected.push(Object.assign({}, step, {
                status: count > 0 ? 'SOURCE_READY' : 'FAILED',
                version: String(count),
                description: count > 0 ? String(count) + ' media assets declared' : 'Media asset manifest is empty or unavailable'
            }));
        });
        steps.filter(step => step.required === false).forEach(step => projected.push(Object.assign({}, step, {
            status: 'OPTIONAL'
        })));
        projected = projected.concat(functionalModuleSteps);
        return {
            status: projected.some(step => ['INVALID_RELEASE', 'DOWNGRADE_AVAILABLE', 'UNAVAILABLE', 'NOT_REGISTERED', 'NOT_ACTIVE', 'RUNTIME_OFFLINE'].includes(step.status)) ? 'BLOCKED' :
                projected.some(step => step.status === 'RUNNING') ? 'RUNNING' :
                    projected.filter(step => step.required !== false).every(step => ['CURRENT', 'SOURCE_READY'].includes(step.status)) ? 'CURRENT' : 'ACTION_REQUIRED',
            steps: projected.sort((left, right) => left.order - right.order)
        };
    },
    /** Returns the configured project root used only for declared project-owned setup assets. */
    projectRoot: function () {
        let configured = (CONFIG.get('backofficeApplicationInitialization') || {}).projectRoot ||
            process.env.NODICS_PROJECT_ROOT || process.cwd();
        return path.resolve(String(configured));
    },
    /** Resolves a manifest path without allowing profile data to escape the project root. */
    safeProjectPath: function (relativePath) {
        let root = this.projectRoot();
        let resolved = path.resolve(root, String(relativePath || ''));
        if (!resolved.startsWith(root + path.sep)) {
            throw new CLASSES.NodicsError('ERR_BOF_00081', 'Application preparation asset path is outside the project root');
        }
        return resolved;
    },
    /** Counts declared media assets without exposing local file paths to the browser. */
    mediaManifestAssetCount: function (step) {
        try {
            let manifestPath = this.safeProjectPath(step.manifestPath);
            delete require.cache[require.resolve(manifestPath)];
            let assets = require(manifestPath);
            return Array.isArray(assets) ? assets.length : 0;
        } catch (error) {
            return 0;
        }
    },
    /** Reads declared media identities from project-owned asset manifests for the governed Online release. */
    mediaManifestCodes: function (profile) {
        let codes = new Set();
        this.preparationSteps(profile).filter(step => step.type === 'MEDIA_ASSET_MANIFEST' && step.required !== false).forEach(step => {
            let manifestPath = this.safeProjectPath(step.manifestPath);
            delete require.cache[require.resolve(manifestPath)];
            let assets = require(manifestPath);
            if (!Array.isArray(assets)) return;
            assets.forEach(asset => {
                let code = asset && (asset.mediaCode || asset.code);
                if (code) codes.add(String(code));
            });
        });
        return Array.from(codes).sort();
    },
    /** Returns a browser/request token when available so media-owned upload permissions stay human governed. */
    authorizationHeader: function (request) {
        let headers = request && request.httpRequest && request.httpRequest.headers || {};
        let authorization = headers.authorization || headers.Authorization;
        if (authorization) return authorization;
        let token = NODICS.getInternalAuthToken(request.tenant);
        if (!token) throw new CLASSES.NodicsError('ERR_BOF_00083', 'Application initialization service authentication is unavailable');
        return 'Bearer ' + token;
    },
    /** Resolves a configured server connection into an HTTP base URL. */
    serverBaseUrl: function (serverCode) {
        let servers = CONFIG.get('servers') || {};
        let server = servers[serverCode] || {};
        let endpoint = server.abstractEndpoint || server.endpoint || {};
        let host = endpoint.httpHost || 'localhost';
        let port = endpoint.httpPort;
        if (!port) throw new CLASSES.NodicsError('ERR_BOF_00081', 'Application preparation target server is unavailable');
        return 'http://' + host + ':' + String(port);
    },
    /** Uploads one declared media asset through the media-owned upload API. */
    uploadMediaAsset: async function (step, asset, request) {
        let manifestPath = this.safeProjectPath(step.manifestPath);
        let filePath = path.join(path.dirname(manifestPath), 'files', String(asset.fileName || ''));
        if (!filePath.startsWith(path.dirname(manifestPath) + path.sep) || !fs.existsSync(filePath)) {
            throw new CLASSES.NodicsError('ERR_BOF_00085', 'Application preparation media asset is missing');
        }
        let buffer = fs.readFileSync(filePath);
        let form = new FormData();
        let extension = path.extname(String(asset.fileName || '')).toLowerCase();
        let mimeType = asset.mimeType || (extension === '.jpg' || extension === '.jpeg' ? 'image/jpeg' :
            extension === '.png' ? 'image/png' : extension === '.webp' ? 'image/webp' :
                extension === '.svg' ? 'image/svg+xml' : 'application/octet-stream');
        form.append('file', new Blob([buffer], { type: mimeType }), String(asset.fileName));
        form.append('folderCode', String(asset.folderCode || step.folderCode || 'cmsAssets'));
        form.append('formatCode', String(asset.formatCode || 'original'));
        form.append('mediaCode', String(asset.mediaCode || asset.code));
        form.append('name', String(asset.name || asset.mediaCode || asset.code));
        form.append('description', String(asset.description || asset.name || asset.mediaCode || asset.code));
        form.append('moduleName', 'media');
        form.append('schemaName', 'media');
        form.append('businessPurpose', String(asset.businessPurpose || step.businessPurpose || 'APPLICATION_CONTENT'));
        form.append('ownerType', String(asset.ownerType || 'CMS_COMPONENT'));
        form.append('ownerReference', String(asset.ownerCode || asset.ownerReference || asset.mediaCode || asset.code));
        let response = await fetch(this.serverBaseUrl(step.targetServer) + '/nodics/media/v0/storage/upload', {
            method: 'POST',
            headers: {
                Authorization: this.authorizationHeader(request),
                'x-enterprise-code': request.enterpriseCode || request.authData && (request.authData.enterpriseCode || request.authData.entCode) ||
                    request.headers && (request.headers.enterpriseCode || request.headers['x-enterprise-code']) || CONFIG.get('defaultEnterprise') || 'default',
                Origin: request.httpRequest && request.httpRequest.headers && request.httpRequest.headers.origin || 'http://localhost:3100'
            },
            body: form
        });
        let text = await response.text();
        if (!response.ok && !/duplicate|already|exists|E11000/i.test(text)) {
            throw new CLASSES.NodicsError('ERR_BOF_00085', 'Application preparation media upload failed: HTTP ' +
                String(response.status) + ' - ' + text.slice(0, 300));
        }
        return { mediaCode: String(asset.mediaCode || asset.code), checksum: crypto.createHash('sha256').update(buffer).digest('hex') };
    },
    /** Reconciles profile-declared media manifests into the Staged media store before publication approval. */
    prepareMediaAssets: async function (profile, request) {
        let steps = this.preparationSteps(profile).filter(step => step.type === 'MEDIA_ASSET_MANIFEST' && step.required !== false);
        let uploaded = [];
        for (let step of steps) {
            let manifestPath = this.safeProjectPath(step.manifestPath);
            delete require.cache[require.resolve(manifestPath)];
            let assets = require(manifestPath);
            if (!Array.isArray(assets) || assets.length === 0) {
                throw new CLASSES.NodicsError('ERR_BOF_00085', 'Application preparation media manifest is empty');
            }
            for (let asset of assets) uploaded.push(await this.uploadMediaAsset(step, asset, request));
        }
        return uploaded;
    },
    /** Installs required preparation releases before requesting publication approval. */
    prepareApplication: async function (profile, request, currentPreparation) {
        let preparation = currentPreparation || await this.preparationStatus(profile, request);
        if (preparation.status === 'BLOCKED') {
            throw new CLASSES.NodicsError('ERR_BOF_00085', 'Application preparation is blocked; register required capabilities and repair required release targets before initialization');
        }
        await this.prepareMediaAssets(profile, request);
        let groups = this.preparationGroups(profile, request, preparation.steps)
            .map(group => Object.assign({}, group, {
                steps: group.steps.filter(step => {
                    let current = preparation.steps.find(item => item.code === step.code &&
                        item.dataType === step.dataType && item.targetServer === step.targetServer);
                    return current && ['NOT_INSTALLED', 'UPDATE_AVAILABLE', 'FAILED'].includes(current.status);
                })
            })).filter(group => group.steps.length > 0);
        for (let group of groups) {
            group.expectedReleases = Object.fromEntries(group.steps
                .map(step => {
                    let current = preparation.steps.find(item => item.code === step.code &&
                        item.dataType === step.dataType && item.targetServer === step.targetServer);
                    return [step.code, current && current.version];
                }).filter(entry => entry[1]));
            await this.invokeDataReleaseOperation('execute', group, request);
        }
        return this.preparationStatus(profile, request);
    },
    /** Invokes only the profile-owned fixed Staged baseline endpoint. */
    /** Executes the documented bounded module operation. */
    invoke: async function (operation, profileCode, request) {
        let profile = this.profile(profileCode);
        let principal = operation === 'status' ? undefined : this.human(request);
        let initialPreparation = await this.preparationStatus(profile, request);
        let preparationChanged = operation === 'initiate' && initialPreparation.status !== 'CURRENT';
        let preparation = operation === 'initiate' ? await this.prepareApplication(profile, request, initialPreparation) :
            initialPreparation;
        let token = NODICS.getInternalAuthToken(request.tenant);
        if (!token) throw new CLASSES.NodicsError('ERR_BOF_00083', 'Application initialization service authentication is unavailable');
        let input = request.applicationInitialization || {};
        let correlationId = input.correlationId || request.correlationId || request.requestId;
        let mediaCodes = operation === 'initiate' ? this.mediaManifestCodes(profile) : [];
        let body = operation !== 'status' ? { requestedBy: principal, reason: input.reason,
            correlationId: correlationId, forceRefresh: input.forceRefresh === true || preparationChanged ? true : undefined,
            mediaCodes: mediaCodes.length ? mediaCodes : undefined } : undefined;
        let suffix = operation === 'status' ? '' : '/' + operation;
        return SERVICE.DefaultModuleService.invokeModule({ moduleName: profile.target.moduleName,
            connectionName: profile.target.connectionName, connectionType: profile.target.connectionType || 'abstract',
            targetAuthority: { runtimeRole: profile.target.runtimeRole || 'WCMS_STAGED' },
            methodName: operation === 'status' ? 'GET' : 'POST',
            apiName: '/publication/baselines/' + encodeURIComponent(profile.baselineCode) + suffix,
            requestBody: body, timeoutMs: profile.target.timeoutMs, maxAttempts: profile.target.maxAttempts,
            idempotencyKey: operation !== 'status' ? profile.code + ':' + operation + ':' + String(correlationId || principal) : undefined,
            header: { Authorization: 'Bearer ' + token }
        }).catch(error => {
            throw this.targetDiagnostic(error, profile);
        }).then(response => {
            let authority = response && (response.data || response.result || response) || {};
            let readiness = preparation.status === 'BLOCKED' ? 'BLOCKED' : authority.readiness;
            let preparationUpdateAvailable = preparation.status !== 'CURRENT' && preparation.status !== 'RUNNING' && preparation.status !== 'BLOCKED';
            let releaseInvalid = authority.releaseStatus === 'INVALID_RELEASE';
            let updateAvailable = readiness === 'READY' &&
                ['UPDATE_AVAILABLE', 'FAILED'].includes(authority.releaseStatus);
            return { profileCode: profile.code, type: profile.type, owner: profile.owner,
                applicationCode: profile.applicationCode, siteCode: profile.siteCode,
                profile: this.describe(profile),
                allowedActions: preparation.status === 'BLOCKED' ? [] : readiness === 'READY' ?
                    [].concat((updateAvailable || preparationUpdateAvailable) ? ['INITIALIZE'] : [],
                        authority.publication && authority.publication.previousOnlineVersion ? ['ROLLBACK'] : [], ['RETIRE']) :
                    releaseInvalid || ['IMPORTING', 'PUBLICATION_PENDING'].includes(readiness) ? [] : ['INITIALIZE'],
                readiness: readiness, releaseCode: authority.releaseCode,
                releaseVersion: authority.releaseVersion, releaseStatus: authority.releaseStatus,
                preparation: preparation,
                publication: authority.publication, lineage: authority.lineage };
        });
    },
    /** Reads or installs the profile-owned content pack through its fixed Staged target. */
    invokeContentPack: function (operation, profileCode, request) {
        let profile = this.profile(profileCode);
        if (profile.type !== 'DOCUMENTATION_BUNDLE' || !profile.contentPackCode) {
            throw new CLASSES.NodicsError('ERR_BOF_00084', 'Application profile does not own a documentation content pack');
        }
        if (operation === 'install') this.human(request);
        let token = NODICS.getInternalAuthToken(request.tenant);
        if (!token) throw new CLASSES.NodicsError('ERR_BOF_00083', 'Application initialization service authentication is unavailable');
        return SERVICE.DefaultModuleService.invokeModule({
            moduleName: 'system',
            connectionName: profile.target.connectionName,
            connectionType: profile.target.connectionType || 'abstract',
            targetAuthority: { runtimeRole: profile.target.runtimeRole || 'WCMS_STAGED' },
            methodName: operation === 'status' ? 'GET' : 'POST',
            apiName: '/internal/content-packs/' + encodeURIComponent(profile.contentPackCode) +
                (operation === 'install' ? '/imports' : ''),
            timeoutMs: profile.target.timeoutMs,
            maxAttempts: profile.target.maxAttempts,
            idempotencyKey: operation === 'install' ? profile.code + ':content-pack:' +
                String(request.correlationId || request.requestId || request.authData && request.authData.principalId) : undefined,
            header: { Authorization: 'Bearer ' + token },
            responseSelector: response => response && (response.data || response.result || response)
        });
    },
    /** Returns the documentation content-pack status from the profile's Staged authority. */
    contentPackStatus: function (profileCode, request) { return this.invokeContentPack('status', profileCode, request); },
    /** Installs the documentation content pack through the profile's governed Staged authority. */
    installContentPack: function (profileCode, request) { return this.invokeContentPack('install', profileCode, request); },
    /** Executes the documented bounded module operation. */
    status: function (profileCode, request) { return this.invoke('status', profileCode, request); },
    /** Executes the documented bounded module operation. */
    initiate: function (profileCode, request) { return this.invoke('initiate', profileCode, request); },
    /** Executes the documented bounded module operation. */
    rollback: function (profileCode, request) { return this.invoke('rollback', profileCode, request); },
    /** Executes the documented bounded module operation. */
    retire: function (profileCode, request) { return this.invoke('retire', profileCode, request); }
};
