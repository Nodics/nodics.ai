/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module discoveryProjection/service/defaultDiscoveryDocumentProjectionService
 * @description Routes fixed projection operations through the canonical module transport.
 * @layer service
 * @owner discoveryProjection
 */
module.exports = {
    /** Resolves the explicit owner publication and optional deployment pins.
     * @param {Object} [explicit] Trusted domain-selected publication, never accepted from a remote operation body.
     * @returns {Object} Canonical target authority.
     * @throws {Error} If the selected publication or authority fields are invalid.
     */
    targetAuthority: function (explicit) {
        const configured = explicit || ((CONFIG.get('discovery') || {}).projection || {}).targetAuthority;
        if (!configured) throw new Error('Discovery projection requires explicit publication authority');
        const authority = Object.fromEntries(Object.entries(configured).filter(([key, value]) =>
            !(['server', 'environment'].includes(key) && value === null)));
        return require('../../../../../nodics.foundation/modules/nService/src/service/module/defaultModuleService').normalizeTargetAuthority(authority);
    },
    /** Dispatches one fixed projection capability without passing executable values over transport.
     * @param {string} operation Fixed operation selected by the exported facade.
     * @param {Object} request Trusted domain request.
     * @returns {Promise<Object>} Original owner acknowledgement.
     * @throws {Error} On invalid payload, unavailable owner or transport denial; no local fallback.
     */
    invoke: async function (operation, request) {
        const paths = {doDescribeIndex: 'binding', doSave: 'save', doSearch: 'search', doRefresh: 'refresh', doRemoveByQuery: 'remove-generation'};
        if (!Object.hasOwn(paths, operation)) throw new Error('Unsupported Discovery projection operation');
        const body = SERVICE.DefaultDiscoveryProjectionTransportService.body(operation, request);
        return SERVICE.DefaultModuleService.invokeModule({
            // Actorless domain reads (for example public delivery) must enter the
            // existing service-token boundary, even when the owner is cohosted.
            // Never invent authData or retry locally after denied admission.
            local: request.authData ? undefined : false,
            moduleName: 'discoveryProjection', targetAuthority: this.targetAuthority(request.targetAuthority),
            serviceName: 'DefaultDiscoveryProjectionTransportService', operationName: operation,
            apiName: '/internal/projection/' + paths[operation], methodName: 'POST', tenant: request.tenant,
            request: {...body, authData: request.authData}, requestBody: body
        });
    },
    /** Describes a qualified model without exporting provider handles. @param {Object} request Logical index. @returns {Promise<Object>} Physical name and opaque binding identity. @throws {Error} Owner denial. */
    doDescribeIndex: function(request) { return this.invoke('doDescribeIndex', request); },
    /** Saves normalized documents on their qualified owner. @param {Object} request Projection request. @returns {Promise<Object>} Save acknowledgement. @throws {Error} Owner or transport denial. */
    doSave: function (request) { return this.invoke('doSave', request); },
    /** Searches on the qualified owner. @param {Object} request Search request. @returns {Promise<Object>} Search response. @throws {Error} Owner or transport denial. */
    doSearch: function (request) { return this.invoke('doSearch', request); },
    /** Refreshes visibility on the qualified owner. @param {Object} request Refresh request. @returns {Promise<Object>} Refresh response. @throws {Error} Owner or transport denial. */
    doRefresh: function (request) { return this.invoke('doRefresh', request); },
    /** Removes only an exact generation predicate on the qualified owner. @param {Object} request Qualified generation request. @returns {Promise<Object>} Removal acknowledgement. @throws {Error} Invalid predicate or owner denial. */
    doRemoveByQuery: function (request) { return this.invoke('doRemoveByQuery', request); },
};
