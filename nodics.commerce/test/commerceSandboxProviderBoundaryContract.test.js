/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
const assert = require('assert');
const carrier = require('../modules/fulfillment/modules/fulfillmentCore/src/service/defaultCarrierSandboxAdapterService');
(async () => {
    const carrierConfiguration = { enabled: true, sandboxOnly: true, liveQualified: false, endpoint: 'https://sandbox.invalid/carrier', credentialReference: 'secret://carrier/test', accountReference: 'account://test' };
    let shipment = await carrier.execute({ tenant: 't1', operation: 'CREATE_SHIPMENT', shipmentCode: 'S1', idempotencyKey: 'K1' }, { resolveCredential: async () => 'opaque', send: async () => ({ reference: 'ship-1', status: 'CREATED' }) }, carrierConfiguration); assert.strictEqual(shipment.sandbox, true);
    await assert.rejects(carrier.execute({ tenant: 't1', operation: 'TRACK', idempotencyKey: 'K2' }, {}, Object.assign({}, carrierConfiguration, { enabled: false })), error => error.code === 'CARRIER_DISABLED');
    console.log('Commerce carrier sandbox boundary validated');
})().catch(error => { console.error(error); process.exitCode = 1; });
