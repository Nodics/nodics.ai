/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
const crypto = require('node:crypto');
/** @module paymentProviderCore/src/service/defaultPaymentCallbackSecurityService @description Verifies signed callbacks, freshness, and replay evidence. @layer service @owner paymentProviderCore */
module.exports = { verify: async function (request, secret, replayStore, now) {
    if (!request || !request.signature || !request.timestamp || !request.eventId) throw new Error('Signed callback evidence is required');
    if (Math.abs((now || Date.now()) - Number(request.timestamp)) > 300000) throw new Error('Callback expired');
    if (await replayStore.exists(request.eventId)) throw new Error('Callback replay');
    const expected = crypto.createHmac('sha256', secret).update(String(request.timestamp) + '.' + request.body).digest('hex');
    const actual = Buffer.from(request.signature, 'hex'); const wanted = Buffer.from(expected, 'hex');
    if (actual.length !== wanted.length || !crypto.timingSafeEqual(actual, wanted)) throw new Error('Invalid callback signature');
    await replayStore.record(request.eventId); return Object.freeze({ verified: true, eventId: request.eventId });
} };
