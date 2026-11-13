/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module discoveryPublication/service/defaultDiscoveryIndexRetirementService @description Fixed physical command facade; callbacks, journals and live models never cross transport. @layer service @owner discoveryPublication */
module.exports = {
    /** Dispatches one fixed command through the Projection owner, preserving unknown outcomes.
     * @param {string} operation Fixed physical command.
     * @param {Object} request Source-authorized declaration and transient signed credential.
     * @param {string} [reviewDigest] Reviewed operation digest.
     * @returns {Promise<Object>} Minimized original result.
     * @throws {Error} Invalid declaration, denied owner or uncertain transport.
     */
    invoke: function(operation, request, reviewDigest) {
        if(!['preview','execute','inspect','previewErasure','erase','inspectErasure'].includes(operation))throw new Error('Unsupported physical command');
        const body = SERVICE.DefaultDiscoveryPhysicalRetirementBoundaryService.body(request, reviewDigest);
        return SERVICE.DefaultModuleService.invokeModule({moduleName: 'discoveryProjection',
            targetAuthority: SERVICE.DefaultDiscoveryDocumentProjectionService.targetAuthority(),
            serviceName: 'DefaultDiscoveryPhysicalRetirementBoundaryService', operationName: operation,
            apiName: '/internal/retirement/' + operation, methodName: 'POST', tenant: request.tenant,
            request: {...body, authData: request.authData}, requestBody: body,
            maxAttempts: 1});
    },
    /** Runs fixed preview command. @param {Object} request Declaration. @param {string} [reviewDigest] Reviewed digest. @returns {Promise<Object>} Public result. @throws {Error} Owner denial or unknown outcome. */
    preview: function(request, reviewDigest) {return this.invoke('preview',request,reviewDigest);},
    /** Runs fixed execute command. @param {Object} request Declaration. @param {string} [reviewDigest] Reviewed digest. @returns {Promise<Object>} Public result. @throws {Error} Owner denial or unknown outcome. */
    execute: function(request, reviewDigest) {return this.invoke('execute',request,reviewDigest);},
    /** Runs fixed inspect command. @param {Object} request Declaration. @param {string} [reviewDigest] Reviewed digest. @returns {Promise<Object>} Public result. @throws {Error} Owner denial or unknown outcome. */
    inspect: function(request, reviewDigest) {return this.invoke('inspect',request,reviewDigest);},
    /** Runs fixed previewErasure command. @param {Object} request Declaration. @param {string} [reviewDigest] Reviewed digest. @returns {Promise<Object>} Public result. @throws {Error} Owner denial or unknown outcome. */
    previewErasure: function(request, reviewDigest) {return this.invoke('previewErasure',request,reviewDigest);},
    /** Runs fixed erase command. @param {Object} request Declaration. @param {string} [reviewDigest] Reviewed digest. @returns {Promise<Object>} Public result. @throws {Error} Owner denial or unknown outcome. */
    erase: function(request, reviewDigest) {return this.invoke('erase',request,reviewDigest);},
    /** Runs fixed inspectErasure command. @param {Object} request Declaration. @param {string} [reviewDigest] Reviewed digest. @returns {Promise<Object>} Public result. @throws {Error} Owner denial or unknown outcome. */
    inspectErasure: function(request, reviewDigest) {return this.invoke('inspectErasure',request,reviewDigest);},
};
