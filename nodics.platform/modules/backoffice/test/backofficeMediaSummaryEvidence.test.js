/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics — Copyright (c) 2026. Governed by the root LICENSE. */
/**
 * @module backoffice/test/backofficeMediaSummaryEvidence
 * @description Keeps absent aggregate Media evidence distinct from measured zero.
 * @layer test
 * @owner backoffice
 */
const assert = require('node:assert/strict');
const test = require('node:test');
const service = require('../src/service/operations/defaultBackofficeOperationalReadinessService');
const counters = ['mediaObjectCount', 'incompleteMetadataCount', 'missingPhysicalCount',
    'referenceCount', 'brokenReferenceCount', 'cleanupCandidateCount'];
const ownerCounters = ['mediaCount', 'incompleteMetadataCount', 'missingPhysicalCount',
    'referenceCount', 'brokenReferenceCount', 'cleanupCandidateCount'];
const summary = value => Object.assign({ providerAvailable: true,
    referenceProviderAvailable: true, cleanupProviderAvailable: true },
    Object.fromEntries(ownerCounters.map(key => [key, value])));
async function inspect(provider, report = {}) {
    const previous = global.SERVICE;
    let foreignReads = 0;
    try {
        global.SERVICE = {
            ...(provider === undefined ? {} : { DefaultMediaReadinessService: { readiness: provider } }),
            DefaultModuleService: { invoke: () => { foreignReads++; throw new Error('No aggregate authority'); } },
        };
        const result = await service.mediaSection(report, {});
        assert.equal(foreignReads, 0, 'Missing aggregate evidence never creates a foreign read');
        return result;
    } finally { global.SERVICE = previous; }
}
function expectUnavailable(result) {
    for (const key of counters) assert.equal(result.summary[key], null, key);
}
test('absent Media owner does not invent zero inventory from application manifests', async () => {
    const result = await inspect(undefined, { statuses: [{ capability: {
        publicationSummary: { media: 'READY' },
    } }] });
    assert.equal(result.summary.ownerProviderAvailable, false);
    expectUnavailable(result);
});
test('failed Media owner retains its failure and unknown counters', async () => {
    const result = await inspect(async () => { throw Object.assign(new Error('Owner unavailable'), { code: 'MEDIA_TEST_UNAVAILABLE' }); });
    expectUnavailable(result);
    assert.equal(result.summary.ownerProviderAvailable, false);
    assert.equal(result.businessStatus, 'NEEDS_ATTENTION');
    assert.equal(result.blockers[0].code, 'MEDIA_READINESS_PROVIDER_FAILED');
    assert.equal(result.blockers[0].failureCode, 'MEDIA_TEST_UNAVAILABLE');
});
test('explicitly unavailable subproviders cannot turn their placeholder zeros into inventory', async () => {
    const result = await inspect(async () => ({ summary: { ...summary(0),
        providerAvailable: false, referenceProviderAvailable: false, cleanupProviderAvailable: false } }));
    assert.equal(result.summary.ownerProviderAvailable, true);
    expectUnavailable(result);
});
test('partial Media owner keeps independently measured references without inventing object or cleanup counts', async () => {
    const result = await inspect(async () => ({ summary: { ...summary(7),
        providerAvailable: false, cleanupProviderAvailable: false } }));
    assert.equal(result.summary.referenceCount, 7);
    assert.equal(result.summary.brokenReferenceCount, 7);
    for (const key of ['mediaObjectCount', 'incompleteMetadataCount', 'missingPhysicalCount', 'cleanupCandidateCount'])
        assert.equal(result.summary[key], null, key);
});
for (const value of [undefined, null, -1, 1.5, NaN, Infinity, '3', Number.MAX_SAFE_INTEGER + 1]) {
    test(`unmeasured or invalid counters stay unavailable: ${String(value)}`, async () => {
        expectUnavailable(await inspect(async () => ({ summary: summary(value) })));
    });
}
for (const value of [0, 92]) {
    test(`explicitly measured valid inventory is preserved: ${value}`, async () => {
        const result = await inspect(async () => ({ summary: summary(value) }));
        for (const key of counters) assert.equal(result.summary[key], value, key);
    });
}
test('counts the current owner READY and NOT_REQUIRED states as well as the retained combined state', async () => {
    const states = ['READY', 'NOT_REQUIRED', 'READY_OR_NOT_REQUIRED', 'NEEDS_REPAIR', 'UNKNOWN'];
    const result = await inspect(undefined, { statuses: states.map(media => ({ capability: { publicationSummary: { media } } })) });
    assert.equal(result.summary.profileCount, 5);
    assert.equal(result.summary.readyOrNotRequiredCount, 3);
    assert.equal(result.summary.needsRepairCount, 1);
    assert.deepEqual(result.summary.mediaStateCounts, Object.fromEntries(states.map(state => [state, 1])));
    expectUnavailable(result);
});
