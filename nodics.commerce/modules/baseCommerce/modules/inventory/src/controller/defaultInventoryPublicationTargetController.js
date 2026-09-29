/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module inventory/controller/defaultInventoryPublicationTargetController @description Maps internal-service policy transport to owner operations without accepting body-supplied authentication/scope. @layer controller @owner inventory */
module.exports = {
    /** Starts a governed capture; approval remains exclusively in nPublish and Process. */
    createGoverned: function (request, callback) {
        const promise = Promise.resolve().then(() => FACADE.DefaultInventoryPublicationFacade.createGoverned(request))
            .then(result => ({ code: 'SUC_SYS_00000', result }));
        if (!callback) return promise;
        promise.then(result => callback(null, result)).catch(callback);
    },
    /** Fixed owner callback; the shared bridge claims Process execution and decides transitions. */
    applyPublicationDecision: function (request, callback) {
        const promise = SERVICE.DefaultPublicationApprovalCallbackService.applyDecision(request,
            { domain: 'inventory', actionKey: 'inventory.applyPublicationDecision' });
        if (!callback) return promise;
        promise.then(result => callback(null, result)).catch(callback);
    },
    /** Dispatches one fixed route operation and preserves Promise/callback envelopes. */
    invoke: function (operation, request, callback) {
        // One detached payload is validated, authorized and executed across awaits.
        const input = structuredClone(request.httpRequest && request.httpRequest.body || {});
        const context = { ...request, tenant: request.tenant || request.authData && request.authData.tenant };
        const service = SERVICE.DefaultInventoryPublicationService;
        const promise = Promise.resolve().then(async () => {
            service.scope(context);
            const principal = SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(context, 'inventory');
            if (principal.entCode !== service.scope(context).enterpriseCode ||
                principal.tenant !== context.tenant) throw new Error('Target runtime scope mismatch');
            const persistenceAuth = structuredClone(context.authData);
            let recoveryAuthorization;
            if (operation === 'authorize') return service.authorizeTarget(input, context);
            if (!['prepare', 'status', 'activate', 'reconcile'].includes(operation)) throw new Error('Unknown policy transport operation');
            service.requireTarget();
            service.pointerCode(input.publication, context);
            const scope = service.scope(context);
            if ((input.publication.tenantCode && input.publication.tenantCode !== scope.tenant) ||
                (input.publication.enterpriseCode && input.publication.enterpriseCode !== scope.enterpriseCode)) throw new Error('Target publication scope mismatch');
            if (operation !== 'status') {
                const publication = input.publication || {};
                if (operation === 'prepare') {
                    const release = input.release;
                    if (!release || !release.payload || typeof release.code !== 'string' || !release.code ||
                        release.code !== publication.sourceVersion || release.fingerprint !== release.code ||
                        service.fingerprint(release.payload) !== release.code ||
                        (input.targetVersion !== undefined && input.targetVersion !== release.code) ||
                        release.rootType !== publication.rootType || release.rootCode !== publication.rootCode ||
                        release.payload.rootType !== publication.rootType || release.payload.rootCode !== publication.rootCode ||
                        release.tenant !== scope.tenant || release.enterpriseCode !== scope.enterpriseCode ||
                        release.payload.tenant !== scope.tenant || release.payload.enterpriseCode !== scope.enterpriseCode) {
                        throw new Error('Prepared release does not match publication authority');
                    }
                }
                const command = { operation, publicationCode: publication.code, sourceVersion: publication.sourceVersion,
                    rootType: publication.rootType, rootCode: publication.rootCode,
                    operationKey: input.operationKey || publication.activationOperation && publication.activationOperation.key,
                    targetVersion: operation === 'prepare' ? input.release.code : input.targetVersion,
                    expectedVersion: input.expectedVersion, expectedRevision: input.expectedRevision };
                const approved = await SERVICE.DefaultInventoryPublicationTransportService.authorizeTarget(command, context);
                if (!approved || approved.authorized !== true || approved.fingerprint !== service.fingerprint(command)) throw new Error('Independent publication source authority missing');
                recoveryAuthorization = approved.legacyCasRecovery;
            }
            // Router/runtime checks and independent source authority precede private persistence.
            const local = { ...context, legacyCasRecoveryAuthorization: recoveryAuthorization, authData: Object.assign({}, persistenceAuth,
                SERVICE.DefaultIdentityGovernanceService.getSystemAuthData()) };
            if (operation === 'prepare') return service.prepareTarget(input.release, local);
            if (operation === 'status') return service.getTargetStatus(input.publication, local);
            if (operation === 'activate') return service.switchTarget(input, local);
            if (operation === 'reconcile') return service.reconcileTarget(input.publication, input.operationKey, local);
            throw new Error('Unknown policy transport operation');
        });
        if (!callback) return promise.then(result => ({ code: 'SUC_SYS_00000', result }));
        promise.then(result => callback(null, { code: 'SUC_SYS_00000', result })).catch(callback);
    },
    /** Prepares hidden policy content. */
    prepare: function (request, callback) { return this.invoke('prepare', request, callback); },
    /** Returns Online pointer status. */
    status: function (request, callback) { return this.invoke('status', request, callback); },
    /** Applies an authenticated publisher target command. */
    activate: function (request, callback) { return this.invoke('activate', request, callback); },
    /** Reconciles a known operation receipt. */
    reconcile: function (request, callback) { return this.invoke('reconcile', request, callback); },
    /** Answers an Online runtime from retained Staged lifecycle evidence. */
    authorize: function (request, callback) { return this.invoke('authorize', request, callback); }
};
