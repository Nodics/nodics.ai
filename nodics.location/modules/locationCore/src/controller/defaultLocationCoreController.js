/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module locationCore/src/controller/defaultLocationCoreController @description Maps secured Location HTTP requests to the Location facade. @layer controller @owner locationCore */
module.exports = {
    /** Maps HTTP values and authenticated context into the owning Location request; transport values do not replace identity. */
    request: function (request) {
        request = request || {};
        let httpRequest = request.httpRequest || {};
        return {
            tenant: request.authData && request.authData.tenant || request.tenant,
            authData: request.authData,
            params: httpRequest.params || request.params || {},
            query: httpRequest.query || request.query || {},
            payload: httpRequest.body || request.payload || {},
            idempotencyKey: httpRequest.headers && (httpRequest.headers['Idempotency-Key'] || httpRequest.headers['idempotency-key']),
            correlationId: httpRequest.headers && (httpRequest.headers['X-Correlation-Id'] || httpRequest.headers['x-correlation-id'])
        };
    },

    /** Invokes the owning facade and maps its promise into the supported callback or response envelope. */
    invoke: function (operation, request, callback) {
        let promise = FACADE.DefaultLocationCoreFacade[operation](this.request(request)).then(data => ({ data: data }));
        if (!callback) return promise;
        promise.then(value => callback(null, value)).catch(callback);
    },

    /** Delegates semantic-place creation to the Location owner while preserving trusted request context. */
    createLocation: function (request, callback) {
        return this.invoke('createLocation', request, callback);
    },

    /** Delegates updates to the Location owner, which validates revisions, coordinates and supported fields. */
    updateLocation: function (request, callback) {
        return this.invoke('updateLocation', request, callback);
    },

    /** Delegates the requested semantic-place read to the owning Location operation. */
    getLocation: function (request, callback) {
        return this.invoke('getLocation', request, callback);
    },

    /** Delegates bounded semantic-place search to the owning Location operation. */
    searchLocations: function (request, callback) {
        return this.invoke('searchLocations', request, callback);
    }
};
