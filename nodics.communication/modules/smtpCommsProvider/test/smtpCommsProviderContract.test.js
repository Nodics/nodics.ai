/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
const assert = require('assert');
const service = require('../src/service/defaultSmtpCommunicationProviderService');
(async () => {
    const configuration = { enabled: true, sandboxOnly: true, liveQualified: false, endpoint: 'https://sandbox.invalid/email', credentialReference: 'secret://email/test', senderReference: 'sender://test', timeoutMilliseconds: 10 };
    const request = { channel: 'EMAIL', intentCode: 'I1', idempotencyKey: 'K1', recipientAddressReference: 'profile:u1:email', rendered: { subject: 'safe', body: 'test' } };
    let delivered = await service.deliver(request, { resolveCredential: async reference => reference === configuration.credentialReference ? 'opaque' : null, send: async value => ({ reference: value.idempotencyKey, code: '202' }) }, configuration);
    assert.deepStrictEqual(delivered, { status: 'DELIVERED', providerReference: 'K1', responseCode: '202', sandbox: true });
    await assert.rejects(service.deliver(request, {}, Object.assign({}, configuration, { enabled: false })), error => error.code === 'COMMS_PROVIDER_DISABLED');
    await assert.rejects(service.deliver(request, { resolveCredential: async () => null, send: async () => ({}) }, configuration), error => error.code === 'COMMS_PROVIDER_CREDENTIAL');
    console.log('Email sandbox provider contract validated');
})().catch(error => { console.error(error); process.exitCode = 1; });
