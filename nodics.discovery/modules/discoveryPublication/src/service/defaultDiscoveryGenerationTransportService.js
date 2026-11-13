/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module discoveryPublication/service/defaultDiscoveryGenerationTransportService @description Fixed manifest read, initialize and revision-CAS transport; domain callbacks remain in source-owner orchestration. @layer service @owner discoveryPublication */
module.exports = {
    /** Resolves explicit publication authority through DMS validation.
     * @returns {Object} Canonical selector.
     * @throws {Error} Missing or invalid configured context.
     */
    targetAuthority: function () {
        const configured = ((CONFIG.get('discovery') || {}).publication || {}).targetAuthority;
        if (!configured) throw new Error('Discovery publication requires explicit authority');
        return require('../../../../../nodics.foundation/modules/nService/src/service/module/defaultModuleService').normalizeTargetAuthority(
            Object.fromEntries(Object.entries(configured).filter(([key, value]) => !(['server', 'environment'].includes(key) && value === null))));
    },
    /** Dispatches one fixed manifest capability, excluding arbitrary query/option/identity forwarding.
     * @param {string} operation Fixed owner operation.
     * @param {Object} request Existing generated persistence-shaped request.
     * @returns {Promise<Object>} Owner response.
     * @throws {Error} Invalid scope or transport denial.
     */
    invoke: function (operation, request) {
        const source = operation === 'initialize' ? request.model : request.query;
        const body = {tenant: request.tenant, scope: Object.fromEntries(['indexName', 'indexConfigurationCode', 'ownerType', 'ownerCode'].map(key => [key, source[key]])),
            guardedWrites: request.internalPersistence === 'DURABLE_JOURNAL'};
        if (operation === 'advance') {
            body.expectedRevision = source.revision;
            body.patch = SERVICE.DefaultDiscoveryProjectionTransportService.data(request.model);
        }
        return SERVICE.DefaultModuleService.invokeModule({local: request.authData ? undefined : false, moduleName: 'discoveryPublication', targetAuthority: this.targetAuthority(),
            serviceName: 'DefaultDiscoveryGenerationOwnerService', operationName: operation,
            apiName: '/internal/generation/' + operation, methodName: 'POST', tenant: request.tenant,
            request: {...body, authData: request.authData}, requestBody: body});
    },
    /** Reads one manifest. @param {Object} request Exact scope. @returns {Promise<Object>} Generated envelope. @throws {Error} Owner denial. */
    get: function (request) { return this.invoke('read', request); },
    /** Inserts only the canonical empty manifest. @param {Object} request Initialization request. @returns {Promise<Object>} Generated envelope. @throws {Error} Duplicate or owner denial. */
    save: function (request) { return this.invoke('initialize', request); },
    /** Applies one exact revision transition. @param {Object} request Revision request. @returns {Promise<Object>} CAS envelope. @throws {Error} Invalid patch or owner denial. */
    update: function (request) { return this.invoke('advance', request); }
};
