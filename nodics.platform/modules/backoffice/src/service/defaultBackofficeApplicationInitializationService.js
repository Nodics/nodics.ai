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
                allowedActions: authority.readiness === 'READY' ?
                    [].concat(authority.publication && authority.publication.previousOnlineVersion ? ['ROLLBACK'] : [], ['RETIRE']) :
                    authority.readiness === 'RETIRED' || authority.readiness === 'ROLLED_BACK' ? [] : ['INITIALIZE'],
                readiness: authority.readiness, releaseCode: authority.releaseCode,
                releaseVersion: authority.releaseVersion, releaseStatus: authority.releaseStatus,
                publication: authority.publication, lineage: authority.lineage };
        });
    },
    /** Executes the documented bounded module operation. */
    status: function (profileCode, request) { return this.invoke('status', profileCode, request); },
    /** Executes the documented bounded module operation. */
    initiate: function (profileCode, request) { return this.invoke('initiate', profileCode, request); },
    /** Executes the documented bounded module operation. */
    rollback: function (profileCode, request) { return this.invoke('rollback', profileCode, request); },
    /** Executes the documented bounded module operation. */
    retire: function (profileCode, request) { return this.invoke('retire', profileCode, request); }
};
