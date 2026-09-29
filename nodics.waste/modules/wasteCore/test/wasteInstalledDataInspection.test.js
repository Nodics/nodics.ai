/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module wasteCore/test/wasteInstalledDataInspection @description Proves bounded generated reads, independent permission enforcement, tenant isolation, policy conflict and transaction redaction. @layer test @owner wasteCore */
const assert = require('node:assert/strict');
const test = require('node:test');
const inspection = require('../src/service/defaultWasteInstalledDataInspectionService');
const persistence = require('../src/service/defaultWastePersistenceService');
const router = require('../../../../nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService');
const defaults = require('../config/properties').waste;
const controller = require('../../wasteApi/src/controller/defaultWasteInternalController');
const facade = require('../../wasteApi/src/facade/defaultWasteInternalFacade');
const route = require('../../wasteApi/src/router/routers').wasteApi.internal.inspectInstalledData;

test('installed inspection remains read-only and fails closed', async (t) => {
    const saved = { SERVICE: global.SERVICE, CONFIG: global.CONFIG, FACADE: global.FACADE };
    t.after(() => { for (const [key, value] of Object.entries(saved)) { if (value === undefined) delete global[key]; else global[key] = value; } });
    let settings = structuredClone(defaults);
    let records = [{ code: 'CUSTOM_POLICY', active: true, manualApprovalRequired: true }];
    let total = 1;
    const reads = [];
    const repository = { get: async (request) => { reads.push(request); return { result: records, count: total }; } };
    global.CONFIG = { get: (key) => key === 'waste' ? settings : {} };
    global.SERVICE = {
        DefaultWasteInstalledDataInspectionService: inspection,
        DefaultWastePersistenceService: persistence,
        DefaultSecuredRequestPipelineService: router,
        DefaultWasteAssetCreationPolicyService: repository,
        DefaultWasteSubmissionService: repository
    };
    global.FACADE = { DefaultWasteInternalFacade: facade };
    const authData = { principalType: 'human', loginId: 'operator', tenant: 'tenant-a', userGroups: ['adminGroup'], permissions: ['waste.audit.read'] };
    const request = (payload = {}, auth = authData) => ({ authData: auth, payload: { resource: 'wasteAssetCreationPolicy', ...payload } });

    await t.test('secured route resolves the effective service and trusted controller tenant', async () => {
        assert.equal(route.permission, 'waste.audit.read');
        assert.deepEqual(route.authTokenTypes, ['access']);
        assert.deepEqual(route.accessGroups, ['adminGroup']);
        assert.equal(route.secured, true);
        const value = await controller.inspectInstalledData({ authData, tenant: 'wrong', httpRequest: { body: { resource: 'wasteAssetCreationPolicy' } } });
        assert.equal(reads.at(-1).tenant, 'tenant-a');
        assert.deepEqual(reads.at(-1).query, {});
        assert.equal(reads.at(-1).options.skipItemCache, true);
        assert.deepEqual(reads.at(-1).searchOptions, { pageSize: 100, pageNumber: 1, sort: { code: 1 } });
        assert.deepEqual(value.data.items[0].record, records[0]);
        assert.equal(value.data.migrationAuthorized, false);
        assert.equal(value.data.nextPage, null);
    });
    await t.test('missing authority, customer and service principals cause zero reads', async () => {
        const count = reads.length;
        for (const auth of [{}, { ...authData, permissions: [] }, { ...authData, userGroups: [] }, { ...authData, tenant: '' }, { ...authData, principalType: 'customer' }, { ...authData, principalType: 'service' }]) {
            await assert.rejects(inspection.inspect(request({}, auth)), { code: 'ERR_WASTE_INSPECTION_FORBIDDEN' });
        }
        assert.equal(reads.length, count);
    });
    await t.test('queries, source roots, body grants and unknown schemas are prohibited', async () => {
        const count = reads.length;
        for (const payload of [{ tenant: 'other' }, { query: { active: true } }, { permissions: ['*'] }, { releaseCodes: ['sample'] }, { resource: 'constructor' }, { resource: 'customer' }, { page: 0 }, { page: 1.2 }, { page: Number.MAX_SAFE_INTEGER }, { expectedPageChecksum: 'invalid' }]) {
            await assert.rejects(inspection.inspect(request(payload)), { code: 'ERR_WASTE_INSPECTION_INVALID' });
        }
        assert.equal(reads.length, count);
    });
    await t.test('ordered page fingerprint detects policy drift without accepting new policy', async () => {
        const before = await inspection.inspect(request());
        await inspection.inspect(request({ expectedPageChecksum: before.pageChecksum }));
        records = [{ ...records[0], manualApprovalRequired: false }];
        await assert.rejects(inspection.inspect(request({ expectedPageChecksum: before.pageChecksum })), { code: 'ERR_WASTE_INSPECTION_CONFLICT' });
        assert.throws(() => inspection.assertReferenceFields(records[0], before.items[0].record), { code: 'ERR_WASTE_INSPECTION_CONFLICT' });
        assert.equal(inspection.assertReferenceFields({ ...before.items[0].record, created: 'metadata' }, before.items[0].record), true);
        assert.throws(() => inspection.assertReferenceFields(undefined, before.items[0].record), { code: 'ERR_WASTE_INSPECTION_CONFLICT' });
    });
    await t.test('malformed envelopes and non-string checksums reject without reads', async () => {
        const count = reads.length;
        for (const payload of [null, [], false, 7, 'wasteSubmission']) {
            await assert.rejects(inspection.inspect({ authData, payload }), { code: 'ERR_WASTE_INSPECTION_INVALID' });
        }
        await assert.rejects(inspection.inspect(request({ expectedPageChecksum: ['a'.repeat(64)] })), { code: 'ERR_WASTE_INSPECTION_INVALID' });
        assert.equal(reads.length, count);
    });
    await t.test('later configuration cannot disclose transaction bodies or introduce arbitrary schemas', async () => {
        const count = reads.length;
        settings.installedDataInspection.resources.wasteSubmission = 'REFERENCE';
        settings.installedDataInspection.resources.wasteUnknown = 'REFERENCE';
        for (const resource of ['wasteSubmission', 'wasteUnknown']) {
            await assert.rejects(inspection.inspect(request({ resource })), { code: 'ERR_WASTE_INSPECTION_INVALID' });
        }
        assert.equal(reads.length, count);
        settings = structuredClone(defaults);
        settings.installedDataInspection.resources.wasteAssetCreationPolicy = 'FINGERPRINT';
        const narrowed = await inspection.inspect(request());
        assert.deepEqual(Object.keys(narrowed.items[0]).sort(), ['checksum', 'code']);
        settings = structuredClone(defaults);
    });
    await t.test('transaction bodies are never returned; every nested field affects their fingerprints', async () => {
        records = [{ code: 'SUB_1', customer: { private: 'hidden' }, historicalProfile: 'CUSTOM_PROFILE', revision: 7 }];
        const before = await inspection.inspect(request({ resource: 'wasteSubmission' }));
        assert.deepEqual(Object.keys(before.items[0]).sort(), ['checksum', 'code']);
        assert(!JSON.stringify(before).includes('hidden'));
        records[0].customer.private = 'changed';
        await assert.rejects(inspection.inspect(request({ resource: 'wasteSubmission', expectedPageChecksum: before.pageChecksum })), { code: 'ERR_WASTE_INSPECTION_CONFLICT' });
        const otherTenant = await inspection.inspect(request({ resource: 'wasteSubmission' }, { ...authData, tenant: 'tenant-b' }));
        const originalTenant = await inspection.inspect(request({ resource: 'wasteSubmission' }));
        assert.notEqual(otherTenant.pageChecksum, originalTenant.pageChecksum);
    });
    await t.test('later layer can narrow resources and pagination, but incomplete evidence fails', async () => {
        settings.installedDataInspection.resources.wasteAssetCreationPolicy = false;
        await assert.rejects(inspection.inspect(request()), { code: 'ERR_WASTE_INSPECTION_INVALID' });
        settings.installedDataInspection.pageSize = 1;
        total = 2;
        const first = await inspection.inspect(request({ resource: 'wasteSubmission' }));
        assert.equal(first.nextPage, 2);
        assert.equal(first.total, 2);
        records = [];
        await assert.rejects(inspection.inspect(request({ resource: 'wasteSubmission', page: 2 })), { code: 'ERR_WASTE_RUNTIME_UNAVAILABLE' });
        settings.installedDataInspection.pageSize = 501;
        await assert.rejects(inspection.inspect(request({ resource: 'wasteSubmission' })), { code: 'ERR_WASTE_INSPECTION_INVALID' });
    });
    await t.test('canonical hashes are independent of object field order, not array order', () => {
        assert.equal(inspection.checksum({ a: 1, b: [2, 3] }), inspection.checksum({ b: [2, 3], a: 1 }));
        assert.notEqual(inspection.checksum([2, 3]), inspection.checksum([3, 2]));
    });
    await t.test('all transaction pages include inactive records and detect later-page or count drift', async () => {
        settings = structuredClone(defaults);
        const originalGet = repository.get;
        const rows = Array.from({ length: 205 }, (_, index) => ({
            code: 'SUB_' + String(index).padStart(3, '0'), active: index % 2 === 0,
            privateEvidence: { revision: index }
        }));
        repository.get = async (input) => {
            assert.equal(input.tenant, 'tenant-a');
            assert.deepEqual(input.query, {});
            assert.equal(input.options.recursive, false);
            assert.equal(input.options.skipItemCache, true);
            const { pageSize, pageNumber, sort } = input.searchOptions;
            assert.deepEqual(sort, { code: 1 });
            return { count: rows.length, result: rows.slice((pageNumber - 1) * pageSize, pageNumber * pageSize) };
        };
        try {
            const pages = [];
            for (let page = 1; page !== null;) {
                const evidence = await inspection.inspect(request({ resource: 'wasteSubmission', page }));
                pages.push(evidence);
                page = evidence.nextPage;
            }
            assert.deepEqual(pages.map(page => page.items.length), [100, 100, 5]);
            assert.equal(new Set(pages.flatMap(page => page.items.map(item => item.code))).size, 205);
            assert(!JSON.stringify(pages).includes('privateEvidence'));
            for (const page of pages) await inspection.inspect(request({ resource: 'wasteSubmission', page: page.page, expectedPageChecksum: page.pageChecksum }));
            rows[204].privateEvidence.revision++;
            await assert.rejects(inspection.inspect(request({ resource: 'wasteSubmission', page: 3, expectedPageChecksum: pages[2].pageChecksum })), { code: 'ERR_WASTE_INSPECTION_CONFLICT' });
            rows.push({ code: 'SUB_205', active: false });
            await assert.rejects(inspection.inspect(request({ resource: 'wasteSubmission', page: 1, expectedPageChecksum: pages[0].pageChecksum })), { code: 'ERR_WASTE_INSPECTION_CONFLICT' });
        } finally {
            repository.get = originalGet;
        }
    });
    await t.test('missing count, duplicate identities and unavailable services cannot look like valid empty evidence', async () => {
        settings = structuredClone(defaults);
        total = undefined;
        records = [];
        await assert.rejects(inspection.inspect(request()), { code: 'ERR_WASTE_RUNTIME_UNAVAILABLE' });
        total = 2;
        records = [{ code: 'DUPLICATE' }, { code: 'DUPLICATE' }];
        await assert.rejects(inspection.inspect(request()), { code: 'ERR_WASTE_RUNTIME_UNAVAILABLE' });
        delete global.SERVICE.DefaultWasteAssetCreationPolicyService;
        await assert.rejects(inspection.inspect(request()), { code: 'ERR_WASTE_RUNTIME_UNAVAILABLE' });
        global.SERVICE.DefaultWasteAssetCreationPolicyService = repository;
        total = 0;
        records = [];
        const empty = await inspection.inspect(request());
        assert.equal(empty.total, 0);
        assert.equal(empty.migrationAuthorized, false);
        assert.deepEqual(empty.items, []);
    });
    await t.test('facade honors later-layer service selection and controller callback rejection', async () => {
        global.SERVICE.DefaultWasteInstalledDataInspectionService = { inspect: async () => ({ effectiveOwner: true }) };
        assert.deepEqual(await facade.inspectInstalledData(request()), { effectiveOwner: true });
        delete global.SERVICE.DefaultWasteInstalledDataInspectionService;
        await assert.rejects(new Promise((resolve, reject) => controller.inspectInstalledData({ authData }, (error, value) => error ? reject(error) : resolve(value))), { code: 'ERR_WASTE_RUNTIME_UNAVAILABLE' });
    });
    await t.test('reference inspection does not enable generated CRUD routers', () => {
        for (const owner of ['wasteCore', 'wasteMaterial', 'wasteSubmission', 'wasteImpact']) {
            assert.equal(require('../../' + owner + '/package.json').nodics.runtime.router, false);
        }
    });
});
