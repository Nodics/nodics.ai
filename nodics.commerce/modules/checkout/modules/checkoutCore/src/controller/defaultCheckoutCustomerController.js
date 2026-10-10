/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module checkoutCore/src/controller/defaultCheckoutCustomerController @description Maps bounded placement input to Checkout facade. @layer controller @owner checkoutCore */
module.exports = {
    /** Accepts only the path original command; no body/query financial or persistence selectors. */
    commandStatus: function (request, callback) {
        const http = request.httpRequest || {};
        request.httpResponse?.setHeader?.('Cache-Control', 'no-store');
        request.httpResponse?.setHeader?.('Pragma', 'no-cache');
        const promise = Promise.resolve().then(() => {
            SERVICE.DefaultLoggerService.assertSensitiveRequest(request);
            if ([http.query, http.body].some(value => value !== undefined &&
                (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).length)))
                throw new Error('Original Checkout command path only');
            return FACADE.DefaultCheckoutCustomerFacade.commandStatus({ ...request, commandCode: http.params?.commandCode });
        }).then(data => ({ data })).catch(() => { throw new CLASSES.NodicsError('ERR_CHECKOUT_COMPENSATION_UNCONFIRMED'); });
        if (!callback) return promise;
        promise.then(value => callback(null, value)).catch(callback);
    },
    /** Maps only the original placement command; recovery accepts no replacement financial or digital selectors. */
    recoverCompensation: function (request, callback) {
        const http = request.httpRequest || {};
        request.commandCode = (http.params || {}).commandCode;
        request.payload = http.body || {};
        const promise = FACADE.DefaultCheckoutCustomerFacade.recoverCompensation(request).then(data => ({ data }));
        if (!callback) return promise;
        promise.then(value => callback(null, value)).catch(callback);
    },
    /** Maps an owned checkout reference into the recovery status read. */
    status:function(request,callback){request.orderCode=(request.httpRequest.params||{}).orderCode;const promise=FACADE.DefaultCheckoutCustomerFacade.status(request).then(data=>({data}));if(!callback)return promise;promise.then(v=>callback(null,v)).catch(callback);},
    /** Maps HTTP placement input and the idempotency header to the authenticated Checkout facade. */
    place: function (request, callback) {
    const http = request.httpRequest || {}; request.payload = http.body || request.payload || {};
    request.idempotencyKey = request.idempotencyKey || (http.headers && http.headers['idempotency-key']);
    const promise = FACADE.DefaultCheckoutCustomerFacade.place(request).then(data => ({ data }));
    if (!callback) return promise; promise.then(value => callback(null, value)).catch(callback);
} };
