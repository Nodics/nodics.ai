/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/**
 * @module checkoutCore/src/controller/defaultCheckoutCustomerController
 * @description Maps bounded placement input to Checkout facade.
 * @layer controller
 * @owner checkoutCore
 * @remarks Checkout HTTP recovery/status adapters preserve original access authority and exact
 * retained command selectors. Recovery accepts confirmation only, never replacement payment or storage
 * instructions.
 * Inputs and outputs are specified on each exported member below.
 * Effects and failures remain in the existing owner flow; missing evidence is never synthetic success.
 * Exported members: resumeBundle, commandStatus, recoverCompensation, status, place.
 * @override Customize through the existing loader-visible module members, preserving private
 * authority.
 */
module.exports = {
    /**
     * Requires explicit confirmation and rejects all replacement financial and persistence selectors.
     * @param {Object} request Original owner request with tenant, authData and operation selectors;
     * payload is not authority.
     * @param {function(Error|null, *=):*} [callback] Optional error-first completion callback; receives
     * the same success/error as owner dispatch.
     * @returns {Promise<Object>} Original recovery response; optional callback observes the same
     * success/error.
     * @remarks Effects: Delegates confirmed original-key continuation; never starts a replacement
     * purchase.
     * Failure behavior: Invalid confirmation/selectors or owner failure reject and are sent to the
     * optional callback.
     * @override Override through the effective module member; retain the original owner, scope and
     * evidence checks described above.
     */
    resumeBundle: function (request, callback) {
        const http = request.httpRequest || {};
        request.httpResponse?.setHeader?.('Cache-Control', 'no-store');
        request.httpResponse?.setHeader?.('Pragma', 'no-cache');
        const promise = Promise.resolve().then(() => {
            SERVICE.DefaultLoggerService.assertSensitiveRequest(request);
            if (!require('node:util').isDeepStrictEqual(http.body, { confirmed: true }) ||
                http.query !== undefined && (!http.query || typeof http.query !== 'object' || Array.isArray(http.query) || Object.keys(http.query).length) ||
                http.headers?.['idempotency-key'] || http.headers?.['Idempotency-Key']) throw new Error('Confirm the original Checkout command only');
            return FACADE.DefaultCheckoutCustomerFacade.resumeBundle({ ...request,
                commandCode: http.params?.commandCode, payload: { confirmed: true } });
        }).then(data => ({ data })).catch(() => { throw new CLASSES.NodicsError('ERR_CHECKOUT_COMPENSATION_UNCONFIRMED'); });
        if (!callback) return promise;
        promise.then(value => callback(null, value)).catch(callback);
    },
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
    /**
     * Maps an owned checkout reference into the recovery status read.
     * @param {Object} request Original owner request with tenant, authData and operation selectors;
     * payload is not authority.
     * @param {function(Error|null, *=):*} [callback] Optional error-first completion callback; receives
     * the same success/error as owner dispatch.
     * @returns {Promise<Object>} Owned checkout status response; optional callback observes the same
     * success/error.
     * @remarks Effects: Read-only owner lookup; no placement, financial execution or automatic retry.
     * Failure behavior: Foreign/missing/invalid status requests reject and are sent to the optional
     * callback.
     * @override Override through the effective module member; retain the original owner, scope and
     * evidence checks described above.
     */
    status:function(request,callback){request.httpResponse?.setHeader?.('Cache-Control','no-store');request.httpResponse?.setHeader?.('Pragma','no-cache');request.orderCode=(request.httpRequest.params||{}).orderCode;const promise=FACADE.DefaultCheckoutCustomerFacade.status(request).then(data=>({data}));if(!callback)return promise;promise.then(v=>callback(null,v)).catch(callback);},
    /** Maps HTTP placement input and the idempotency header to the authenticated Checkout facade. */
    place: function (request, callback) {
    const http = request.httpRequest || {}; request.payload = http.body || request.payload || {};
    request.idempotencyKey = request.idempotencyKey || (http.headers && http.headers['idempotency-key']);
    const promise = FACADE.DefaultCheckoutCustomerFacade.place(request).then(data => ({ data }));
    if (!callback) return promise; promise.then(value => callback(null, value)).catch(callback);
} };
