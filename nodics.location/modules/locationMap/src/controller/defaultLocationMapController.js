/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module locationMap/src/controller/defaultLocationMapController @description Maps Location Map HTTP requests to the Location Map facade. @layer controller @owner locationMap */
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
        let promise = FACADE.DefaultLocationMapFacade[operation](this.request(request)).then(data => ({ data: data }));
        if (!callback) return promise;
        promise.then(value => callback(null, value)).catch(callback);
    },

    /** Delegates retrieval of the public-safe map configuration through the Location owner. */
    getPublicConfiguration: function (request, callback) {
        return this.invoke('getPublicConfiguration', request, callback);
    },

    /** Delegates effective map configuration resolution through the Location owner. */
    getEffectiveConfiguration: function (request, callback) {
        return this.invoke('getEffectiveConfiguration', request, callback);
    },

    /** Delegates the authorized map configuration read to the Location owner. */
    getConfiguration: function (request, callback) {
        return this.invoke('getConfiguration', request, callback);
    },

    /** Delegates a map configuration change to the owning validation and persistence operation. */
    saveConfiguration: function (request, callback) {
        return this.invoke('saveConfiguration', request, callback);
    },

    /** Delegates coordinate-to-address lookup through the configured Location provider. */
    reverseGeocode: function (request, callback) {
        return this.invoke('reverseGeocode', request, callback);
    }
};
