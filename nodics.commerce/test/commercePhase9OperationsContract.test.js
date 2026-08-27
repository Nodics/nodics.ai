/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
const assert = require('node:assert/strict'); const path = require('node:path');
const operations = require(path.resolve(__dirname, '../modules/checkout/modules/checkoutCore/src/service/defaultCommerceOperationsService'));
const exact = require(path.resolve(__dirname, '../modules/baseCommerce/modules/pricing/src/service/defaultExactAmountService'));
const paymentExecution = require(path.resolve(__dirname, '../modules/payment/modules/paymentCore/src/service/defaultPaymentExecutionService'));
const stripeSandbox = require(path.resolve(__dirname, '../modules/payment/modules/paymentProviders/modules/stripeProvider/src/service/defaultStripeSandboxAdapterService'));
async function run() {
assert.equal(operations.pageSize(1000, 100), 100); assert.equal(operations.pageSize(0, 100), 50);
assert.deepEqual(operations.retry(5, { maximumAttempts: 5 }), { attempt: 5, retryable: false, delayMs: undefined });
assert.equal(operations.retry(3, { maximumAttempts: 5, baseDelayMs: 100, maximumDelayMs: 1000 }).delayMs, 400);
const checkpoint = operations.checkpoint({ tenant: 't1', workload: 'projection', partitionKey: 'p1', cursor: '50', processedCount: 50, failedCount: 0, correlationId: 'x' });
assert.equal(checkpoint.status, 'CURRENT'); assert.equal(checkpoint.sourceHash.length, 64);
assert.equal(operations.compatibility({ contractType: 'API', contractCode: 'cart', version: '0.0.0', major: 1 }, { contractCode: 'cart', version: '0.0.0', major: 2 }).compatibility, 'BREAKING');
const migration = operations.migration({ tenant: 't1', sourceModule: 'legacyCommerce', sourceSchema: 'Order', targetModule: 'order', targetSchema: 'commerceOrder', mappingVersion: '1' }, { code: 'o1', total: '10.00' });
assert.equal(migration.strategy, 'DRY_RUN'); assert.equal(migration.status, 'VALIDATED');
assert.equal(operations.migration({ tenant: 't1', sourceModule: 'legacyCommerce', sourceSchema: 'Order', targetModule: 'order', targetSchema: 'commerceOrder', mappingVersion: '1', errors: ['INVALID_STATUS'] }, { code: 'o2' }).status, 'QUARANTINED');
assert.equal(operations.migration({ tenant: 't1', sourceModule: 'legacyCommerce', sourceSchema: 'Order', targetModule: 'order', targetSchema: 'commerceOrder', mappingVersion: '1', strategy: 'CUTOVER' }, { code: 'o1', total: '10.00' }).status, 'MIGRATED');
const manifest = { tenant: 't1', counts: { orders: 5, payments: 5, shipments: 3, lifecycleRequests: 2, history: 10 }, checksum: 'abc', checkpoint: 'c1' };
assert.equal(operations.restore(manifest, Object.assign({}, manifest, { checkpoint: 'c2' })).status, 'VERIFIED');
assert.equal(operations.restore(manifest, Object.assign({}, manifest, { checksum: 'drift' })).status, 'DRIFTED');
let providerCalls = 0; const adapter = Object.assign({}, stripeSandbox, { execute: async request => { providerCalls += 1; await new Promise(resolve => setTimeout(resolve, 5)); return stripeSandbox.execute(request); } });
let recorded; const repository = { find: async () => recorded, record: async model => (recorded = model) };
const request = { tenant: 't1', operation: 'AUTHORIZE', amount: '10.00', currency: 'USD', providerToken: 'tok_test_qualification', idempotencyKey: 'payment-contention-1', correlationId: 'phase9' };
const concurrent = await Promise.all(Array.from({ length: 32 }, () => paymentExecution.execute(request, adapter, repository)));
assert.equal(providerCalls, 1, 'Concurrent retries must collapse to one provider invocation per process');
assert(concurrent.every(result => result.providerReference === concurrent[0].providerReference));
const started = process.hrtime.bigint(); let total = '0';
for (let index = 0; index < 50000; index += 1) total = exact.add(total, '0.01');
const durationMs = Number(process.hrtime.bigint() - started) / 1000000;
assert.equal(total, '500'); assert(durationMs < 5000, 'Reference exact-arithmetic capacity harness exceeded 5 seconds');
console.log('Commerce operations contract validated in ' + durationMs.toFixed(2) + 'ms');
}
run().catch(error => { console.error(error); process.exitCode = 1; });
