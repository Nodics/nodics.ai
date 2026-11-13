/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteCollection/test/collectionLocationInvocationParity @description Covers the real local module invocation envelope and remote selector parity without changing collection records. @layer test @owner wasteCollection */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const collection = require('../src/service/defaultWasteCollectionCentreService');
const modules = require('../../../../nodics.foundation/modules/nService/src/service/module/defaultModuleService');

test('local and remote Location invocation preserve identical existing collection coordinates', async () => {
    const location = { code: 'LOC_FIXTURE', status: 'ACTIVE', latitude: 25.12, longitude: 55.23 };
    const source = { code: 'WCP_FIXTURE', locationRef: { module: 'locationCore', schema: 'location', code: location.code } };
    const envelope = { code: 'SUC_FIND_00000', result: [location], count: 1 };
    global.SERVICE = { DefaultLocationOperationService: { read: async request => {
        assert.equal(request.locationCode, location.code);
        assert.equal(request.tenant, 'testTenant');
        return structuredClone(envelope);
    } } };
    const localInvoker = { ...modules, recordInvocationResolution() {} };
    const consumer = { ...collection, loadProfileRecords: async () => [] };
    try {
        consumer.invokeModule = options => localInvoker.invokeLocalModule(options);
        const local = await consumer.enrich([source], { tenant: 'testTenant' });
        consumer.invokeModule = async options => options.responseSelector({ data: structuredClone(envelope) });
        const remote = await consumer.enrich([source], { tenant: 'testTenant' });
        assert.deepEqual(local, remote);
        assert.deepEqual(local.records[0].location, location);
        assert.equal(local.records[0].latitude, location.latitude);
        assert.equal(local.sourceCounts.locations, 1);
        assert.deepEqual(source, { code: 'WCP_FIXTURE', locationRef: { module: 'locationCore', schema: 'location', code: location.code } });
    } finally { delete global.SERVICE; }
});

test('a failed Location owner remains unavailable without fabricated coordinates', async () => {
    const consumer = { ...collection, invokeModule: async () => { throw new Error('Unavailable'); }, loadProfileRecords: async () => [] };
    const result = await consumer.enrich([{ code: 'WCP_FIXTURE', locationRef: { code: 'LOC_FIXTURE' } }], { tenant: 'testTenant' });
    assert.deepEqual(result.unavailableSources, ['locationCore:location']);
    assert.equal(result.records[0].location, undefined);
    assert.equal(result.records[0].latitude, undefined);
});
