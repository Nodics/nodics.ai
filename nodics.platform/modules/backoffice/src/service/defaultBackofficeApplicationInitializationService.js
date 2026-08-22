/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module backoffice/service/DefaultBackofficeApplicationInitializationService
 * @description Projects and initiates configured application/site bundles through their fixed WCMS Staged baseline contract.
 * @layer service
 * @owner backoffice
 * @override Customer projects may add profile descriptors through later configuration without replacing Platform orchestration.
 */
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
        let dataPackages = [].concat(profile.dataPackages || []).map(pack => ({
            code: String(pack.code || ''),
            kind: String(pack.kind || 'DATA'),
            required: pack.required !== false,
            trigger: String(pack.trigger || (pack.required === false ? 'USER' : 'ACTIVATION'))
        })).filter(pack => pack.code);
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
            dataPackages: dataPackages,
            activationPolicy: Object.assign({
                approvalRequiredForOnline: true,
                requiredDataTrigger: profile.type === 'DOCUMENTATION_BUNDLE' ? 'USER' : 'ACTIVATION',
                sampleDataTrigger: 'USER'
            }, presentation.activationPolicy || {})
        };
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
    /** Invokes only the profile-owned fixed Staged baseline endpoint. */
    /** Executes the documented bounded module operation. */
    invoke: function (operation, profileCode, request) {
        let profile = this.profile(profileCode);
        let principal = operation === 'status' ? undefined : this.human(request);
        let token = NODICS.getInternalAuthToken(request.tenant);
        if (!token) throw new CLASSES.NodicsError('ERR_BOF_00083', 'Application initialization service authentication is unavailable');
        let input = request.applicationInitialization || {};
        let body = operation !== 'status' ? { requestedBy: principal, reason: input.reason,
            correlationId: request.correlationId || request.requestId } : undefined;
        let suffix = operation === 'status' ? '' : '/' + operation;
        let descriptor = SERVICE.DefaultModuleService.buildRequest({ moduleName: profile.target.moduleName,
            connectionName: profile.target.connectionName, connectionType: profile.target.connectionType || 'abstract',
            methodName: operation === 'status' ? 'GET' : 'POST',
            apiName: '/publication/baselines/' + encodeURIComponent(profile.baselineCode) + suffix,
            requestBody: body, timeoutMs: profile.target.timeoutMs, maxAttempts: profile.target.maxAttempts,
            idempotencyKey: operation !== 'status' ? profile.code + ':' + operation + ':' + String(request.correlationId || request.requestId || principal) : undefined,
            header: { Authorization: 'Bearer ' + token } });
        return SERVICE.DefaultModuleService.fetch(descriptor).then(response => {
            let authority = response && (response.data || response.result || response) || {};
            return { profileCode: profile.code, type: profile.type, owner: profile.owner,
                applicationCode: profile.applicationCode, siteCode: profile.siteCode,
                profile: this.describe(profile),
                allowedActions: authority.readiness === 'READY' ?
                    [].concat(authority.publication && authority.publication.previousOnlineVersion ? ['ROLLBACK'] : [], ['RETIRE']) :
                    ['INITIALIZE'],
                readiness: authority.readiness, releaseCode: authority.releaseCode,
                releaseVersion: authority.releaseVersion, releaseStatus: authority.releaseStatus,
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
        let descriptor = SERVICE.DefaultModuleService.buildRequest({
            moduleName: 'system',
            connectionName: profile.target.connectionName,
            connectionType: profile.target.connectionType || 'abstract',
            methodName: operation === 'status' ? 'GET' : 'POST',
            apiName: '/internal/content-packs/' + encodeURIComponent(profile.contentPackCode) +
                (operation === 'install' ? '/imports' : ''),
            timeoutMs: profile.target.timeoutMs,
            maxAttempts: profile.target.maxAttempts,
            idempotencyKey: operation === 'install' ? profile.code + ':content-pack:' +
                String(request.correlationId || request.requestId || request.authData && request.authData.principalId) : undefined,
            header: { Authorization: 'Bearer ' + token }
        });
        return SERVICE.DefaultModuleService.fetch(descriptor).then(response => response && (response.data || response.result || response));
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
