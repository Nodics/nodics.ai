/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module profile/controller/enterprise/DefaultEnterpriseManagementController
 * @description Maps permissioned employee enterprise-search requests to the Profile facade.
 * @layer controller
 * @owner profile
 * @override Later modules may replace response mapping while preserving the Profile-owned projection and authorization boundary.
 */
module.exports = {
    /** Searches enterprises through the bounded management facade. */
    search: function (request, callback) {
        request.query = request.httpRequest && request.httpRequest.query || request.query || {};
        let promise = FACADE.DefaultEnterpriseManagementFacade.search(request)
            .then(data => ({ code: 'SUC_PRFL_00000', data: data }));
        return callback ? promise.then(value => callback(null, value)).catch(callback) : promise;
    },
    /** Creates one enterprise through the Profile-owned management facade. */
    create: function (request, callback) {
        let promise = Promise.resolve().then(() => {
            request.body = request.httpRequest && request.httpRequest.body || request.body || {};
            request.payload = request.body;
            const utility = SERVICE.DefaultSchemaUtilityService;
            if (!utility || typeof utility.getIdempotencyKey !== 'function') throw new CLASSES.NodicsError('ERR_DBS_00004', 'Schema utility service is unavailable');
            request.idempotencyKey = utility.getIdempotencyKey(request);
            return FACADE.DefaultEnterpriseManagementFacade.create(request);
        }).then(data => ({ code: 'SUC_PRFL_00000', data: data }));
        return callback ? promise.then(value => callback(null, value)).catch(callback) : promise;
    },
    /** Lists pre-assigned enterprise access records through the Profile-owned management facade. */
    searchAccessAssignments: function (request, callback) {
        request.query = request.httpRequest && request.httpRequest.query || request.query || {};
        let promise = FACADE.DefaultEnterpriseManagementFacade.searchAccessAssignments(request)
            .then(data => ({ code: 'SUC_PRFL_00000', data: data }));
        return callback ? promise.then(value => callback(null, value)).catch(callback) : promise;
    },
    /** Creates one enterprise user pre-assignment through the Profile-owned management facade. */
    preAssignAccess: function (request, callback) {
        request.body = request.httpRequest && request.httpRequest.body || request.body || {};
        request.params = request.httpRequest && request.httpRequest.params || request.params || {};
        let promise = FACADE.DefaultEnterpriseManagementFacade.preAssignAccess(request)
            .then(data => ({ code: 'SUC_PRFL_00000', data: data }));
        return callback ? promise.then(value => callback(null, value)).catch(callback) : promise;
    },
    /** Resolves a public pre-assignment for Axis registration. */
    resolvePreAssignedAccess: function (request, callback) {
        request.query = request.httpRequest && request.httpRequest.query || request.query || {};
        let promise = FACADE.DefaultEnterpriseManagementFacade.resolvePreAssignedAccess(request)
            .then(data => ({ code: 'SUC_PRFL_00000', data: data }));
        return callback ? promise.then(value => callback(null, value)).catch(callback) : promise;
    },
    /** Completes pre-approved enterprise employee registration. */
    registerPreAssignedEmployee: function (request, callback) {
        request.body = request.httpRequest && request.httpRequest.body || request.body || {};
        let promise = FACADE.DefaultEnterpriseManagementFacade.registerPreAssignedEmployee(request)
            .then(data => ({ code: 'SUC_PRFL_00000', data: data }));
        return callback ? promise.then(value => callback(null, value)).catch(callback) : promise;
    },
    /** Returns the public backend-driven registration workspace contract. */
    getPublicAccessWorkspace: function (request, callback) {
        request.publicOnly = true;
        let promise = FACADE.DefaultEnterpriseManagementFacade.getAccessWorkspace(request)
            .then(data => ({ code: 'SUC_PRFL_00000', data: data }));
        return callback ? promise.then(value => callback(null, value)).catch(callback) : promise;
    }
};
