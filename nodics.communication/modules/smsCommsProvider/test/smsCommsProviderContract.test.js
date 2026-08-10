/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
const assert = require('assert');
const service = require('../src/service/defaultSmsCommunicationProviderService');
(async () => {
    const configuration = { enabled: true, sandboxOnly: true, liveQualified: false, endpoint: 'https://sandbox.invalid/sms', credentialReference: 'secret://sms/test', senderReference: 'sender://test' };
    const request = { channel: 'SMS', intentCode: 'I2', idempotencyKey: 'K2', recipientAddressReference: 'profile:u1:phone', rendered: { body: 'test' } };
    const result = await service.deliver(request, { resolveCredential: async () => 'opaque', send: async () => ({ reference: 'sms-1', code: '202' }) }, configuration);
    assert.strictEqual(result.providerReference, 'sms-1'); assert.strictEqual(result.sandbox, true);
    await assert.rejects(service.deliver(Object.assign({}, request, { channel: 'EMAIL' }), {}, configuration), error => error.code === 'COMMS_PROVIDER_REQUEST');
    console.log('SMS sandbox provider contract validated');
})().catch(error => { console.error(error); process.exitCode = 1; });
