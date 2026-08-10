/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module commsApi/src/controller/defaultCommunicationApiController @description Maps bounded Communication HTTP inputs to its secured facade. @layer controller @owner commsApi @override Later controllers may add mappings while preserving DTO boundaries. */
module.exports = { /** Invokes one facade operation. */ invoke: function (operation, request, callback) { let http = request.httpRequest || {}; let params = http.params || {}; request.intentCode = params.intentCode || request.intentCode; request.providerCode = params.providerCode || request.providerCode; request.query = http.query || request.query || {}; request.payload = http.body || request.payload || {}; let promise = FACADE.DefaultCommunicationApiFacade[operation](request).then(data => ({ data: data })); if (!callback) return promise; promise.then(value => callback(null, value)).catch(callback); }, /** Lists customer inbox messages. */ listInbox: function (request, callback) { return this.invoke('listInbox', request, callback); }, /** Retries one delivery through policy. */ retryDelivery: function (request, callback) { return this.invoke('retryDelivery', request, callback); }, /** Receives one authenticated provider callback. */ receiveCallback: function (request, callback) { return this.invoke('receiveCallback', request, callback); } };
