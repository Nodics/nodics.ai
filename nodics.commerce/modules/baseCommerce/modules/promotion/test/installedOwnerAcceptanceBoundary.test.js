/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
'use strict';
/** @module promotion/test/installedOwnerAcceptanceBoundary @description Tests acceptance input fences only; no signed-owner qualification or provider double. @layer test @owner promotion */
const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const entry = require('./helpers/runInstalledOwnerAcceptance');

test('native entrypoint refuses caller-selected unsupported actions before runtime access', async () => {
    await assert.rejects(entry.run({ action: 'setQualified', request: {} }), /explicit supported acceptance action required/);
});

test('native entrypoint refuses signed commands without an opted-in booted runtime', async () => {
    await assert.rejects(entry.run({ action: 'replayContribution', request: { tenant: 'default',
        authorization: 'Bearer invalid-test-only', authData: { principalType: 'human' } } }),
    /explicit opt-in required|booted owner runtime required/);
});

test('first-use review pins original bytes, campaigns, batches and 100-unit quantity', () => {
    const contribution = { releaseCode: 'original', checksum: 'a'.repeat(64) };
    const payload = { campaigns: [{ promotionCode: 'campaign' }], couponBatches: [{ batchCode: 'batch', quantity: 100 }] };
    const reviewed = { ...contribution, confirmed: true, campaignCodes: ['campaign'], batchCodes: ['batch'], quantityPerBatch: 100 };
    assert.doesNotThrow(() => entry.assertReviewedPayload(payload, reviewed, contribution));
    for (const changed of [{ ...reviewed, confirmed: false }, { ...reviewed, checksum: 'b'.repeat(64) },
        { ...reviewed, campaignCodes: ['foreign'] }, { ...reviewed, batchCodes: ['foreign'] },
        { ...reviewed, quantityPerBatch: 101 }])
        assert.throws(() => entry.assertReviewedPayload(payload, changed, contribution), /Native owner acceptance:/);
    assert.throws(() => entry.assertReviewedPayload({ ...payload, couponBatches: [{ batchCode: 'batch', quantity: 101 }] },
        reviewed, contribution), /original campaign\/batch\/quantity selection differs/);
});

test('standalone invocation does not start a runtime, acquire credentials or change selection', () => {
    const result = spawnSync(process.execPath, [require.resolve('./helpers/runInstalledOwnerAcceptance')], { encoding: 'utf8' });
    assert.equal(result.status, 1);
    assert.equal(result.stdout, '');
    assert.match(result.stderr, /standalone bootstrap is intentionally disabled/);
});
