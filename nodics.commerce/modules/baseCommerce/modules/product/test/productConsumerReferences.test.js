/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module product/test/productConsumerReferences @description Exercises exact activated transaction pins with the real Product discovery and retained identity readers. @layer test @owner product */
const test = require('node:test'), assert = require('node:assert/strict');
const discovery = require('../src/service/defaultProductDiscoveryService');
const enrichment = require('../src/service/defaultProductSearchEnrichmentService');

/** Installs isolated owner projections, never native storage or activation. @param {Object} t Test lifecycle. @returns {Object} Owner scope and projections. */
function fixture(t) {
    const previous = { CONFIG: global.CONFIG, SERVICE: global.SERVICE };
    t.after(() => Object.assign(global, previous));
    const request = { tenant: 'tenant', enterpriseCode: 'enterprise', storeCode: 'store', locale: 'en',
        authData: { tenant: 'tenant', enterpriseCode: 'enterprise', principalType: 'service' } };
    const row = { ...request, authData: undefined, code: 'projection', productCode: 'product', status: 'STALE',
        publicationVersion: 'a'.repeat(64), sourceHash: 'source',
        payload: { variantCodes: ['variant'], variantSkuMap: { variant: 'sku' } } };
    const indexed = structuredClone(row), calls = [];
    const owner = { ...discovery, publicationSelections: new WeakMap(),
        searchSelected: async (scope, query) => { calls.push({ scope, query }); return [structuredClone(indexed)]; } };
    global.CONFIG = { get: name => name === 'product' ? { discovery: { activationService: 'Activation' } } : {} };
    global.SERVICE = { Activation: { activeVersions: async () => [row.publicationVersion] },
        DefaultProductSearchEnrichmentService: enrichment,
        DefaultProductSearchProjectionService: { get: async () => ({ result: [structuredClone(row)] }) } };
    return { owner, request, row, indexed, calls };
}

test('transaction pins come from the exact retained activated Product and deduplicate identities', async t => {
    const f = fixture(t), input = structuredClone(f.request);
    assert.deepEqual(await f.owner.consumerReferences(f.request, [
        { productCode: 'product', sku: 'sku', variantCode: 'variant' }, { productCode: 'product', sku: 'sku' }
    ]), [{ productCode: 'product', storeCode: 'store', targetVersion: 'a'.repeat(64) }]);
    assert.equal(f.calls.length, 1);
    assert.equal(f.calls[0].query.status, 'STALE');
    assert.deepEqual(f.calls[0].query.publicationVersion, ['a'.repeat(64)]);
    assert.deepEqual(f.request, input);
});

test('inert activation never reads CURRENT or guesses the Product version', async t => {
    const f = fixture(t);
    CONFIG.get = () => ({});
    await assert.rejects(f.owner.consumerReferences(f.request, [{ productCode: 'product' }]), /Consumed Product/);
    assert.equal(f.calls.length, 0);
});

test('foreign retained scope, malformed versions and SKU mismatch fail closed', async t => {
    for (const field of ['tenant', 'enterpriseCode', 'storeCode', 'locale', 'productCode', 'publicationVersion', 'status', 'sourceHash']) {
        const f = fixture(t);
        f.row[field] = 'foreign';
        await assert.rejects(f.owner.consumerReferences(f.request, [{ productCode: 'product', sku: 'sku' }]));
    }
    const f = fixture(t);
    for (const item of [{ productCode: 'product', sku: 'foreign' }, { productCode: 'product', variantCode: 'foreign' },
        { productCode: 'product', sku: 'foreign', variantCode: 'variant' }]) {
        await assert.rejects(f.owner.consumerReferences(f.request, [item]), /Consumed Product/);
    }
});

test('foreign signed aliases and canonical persistence auth cannot become Product admission', async t => {
    const f = fixture(t);
    for (const auth of [{ ...f.request.authData, entCode: 'foreign' },
        { ...f.request.authData, tenantCode: 'foreign' }, { isSystem: true }]) {
        await assert.rejects(f.owner.consumerReferences({ ...f.request, authData: auth }, [{ productCode: 'product' }]), /Consumed Product/);
    }
    assert.equal(f.calls.length, 0);
});

test('incomplete retained identities, oversized selectors and original context drift reject', async t => {
    const f = fixture(t);
    await assert.rejects(f.owner.consumerReferences(f.request, Array(101).fill({ productCode: 'product' })), /Consumed Product/);
    assert.equal(f.calls.length, 0);
    SERVICE.DefaultProductSearchProjectionService.get = async () => ({ result: [] });
    await assert.rejects(f.owner.consumerReferences(f.request, [{ productCode: 'product' }]), /incomplete/);
    SERVICE.DefaultProductSearchProjectionService.get = async () => {
        f.request.authData.enterpriseCode = 'foreign';
        return { result: [structuredClone(f.row)] };
    };
    await assert.rejects(f.owner.consumerReferences(f.request, [{ productCode: 'product' }]), /Consumed Product/);
});

test('simultaneous callers and recovery retain independent request-local activation reads', async t => {
    const f = fixture(t), actors = [];
    SERVICE.Activation.activeVersions = async request => {
        actors.push(request.authData.principalId);
        return [f.row.publicationVersion];
    };
    const contexts = ['actor-a', 'actor-b'].map(principalId => ({ ...structuredClone(f.request),
        authData: { ...f.request.authData, principalId } }));
    const refs = await Promise.all(contexts.map(request => f.owner.consumerReferences(request, [{ productCode: 'product' }])));
    assert.equal(refs.length, 2); assert.deepEqual(actors.sort(), ['actor-a', 'actor-b']);
    const read = SERVICE.DefaultProductSearchProjectionService.get;
    SERVICE.DefaultProductSearchProjectionService.get = async () => { throw new Error('Owner read failed'); };
    await assert.rejects(f.owner.consumerReferences(contexts[0], [{ productCode: 'product' }]), /Owner read failed/);
    SERVICE.DefaultProductSearchProjectionService.get = read;
    assert.equal((await f.owner.consumerReferences(contexts[0], [{ productCode: 'product' }]))[0].targetVersion, f.row.publicationVersion);
    assert.equal(actors.length, 4, 'Failures cannot leave a reusable authority or version cache');
});
