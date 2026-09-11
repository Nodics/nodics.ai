/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module backoffice/test/functionalModuleLifecyclePagination @description Verifies complete lifecycle reads, replica membership and fail-closed reconciliation. @layer test @owner backoffice */
const assert = require('node:assert/strict');
const definition = require('../src/service/registry/defaultFunctionalModuleCatalogueService');
const paging = Object.assign({}, require('../../../../nodics.foundation/modules/nDatabase/database/src/service/procs/get/defaultModelsGetInitializerService'),
    { LOG: { debug() {} } });
global.CONFIG = { get: key => key === 'defaultPageSize' ? 10 : key === 'defaultPageNumber' ? 1 : undefined };
global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };
let records = [];
let failedPage;
let updates = [];
const authData = { principalId: 'system' };
const service = Object.assign({}, definition, {
    getPersistenceAuthData: () => authData,
    getRecords: async request => {
        assert.equal(request.tenant, 'tenant-one');
        assert.equal(request.authData, authData);
        assert.equal(request.query.projectCode, 'project-one');
        if (request.searchOptions.pageNumber === failedPage) throw new Error('page unavailable');
        paging.buildOptions(request, {}, { nextSuccess() {} });
        const filtered = records.filter(record => Object.entries(request.query).every(([key, value]) => record[key] === value));
        return { result: filtered.slice(request.searchOptions.skip, request.searchOptions.skip + request.searchOptions.limit) };
    },
    projectClientSafeWithReceipts: async record => record,
    updateRecord: async request => { updates.push(request); return { result: { modifiedCount: 1 } }; }
});
service.getReceiptRecords = service.getRecords;
const request = { project: 'project-one', tenant: 'tenant-one', authData };

async function run() {
    for (const size of [0, 10, 11, 257, 513]) {
        records = Array.from({ length: size }, (_, i) => ({ code: `record-${i}`, projectCode: 'project-one',
            functionalModule: `module-${i}`, registrationState: 'AVAILABLE', runtimeState: 'ACTIVE', observedServers: ['old'] }));
        assert.equal((await service.listAvailable(request)).data.items.length, size);
        records.forEach(record => { record.registrationState = 'REGISTERED'; });
        assert.equal((await service.listRegistrations(request)).data.items.length, size);
        updates = [];
        assert.equal(await service.reconcileActiveRuntimeLeases([], ['project-one'], request), size);
        assert(updates.every(update => update.model.runtimeState === 'OFFLINE'));
        records.forEach(record => { record.functionalModule = 'module-one'; record.packageCode = record.code; });
        assert.equal((await service.getActivationReceipts('project-one', 'module-one', request)).length, size);
    }
    failedPage = 2;
    updates = [];
    await assert.rejects(service.listRegistrations(request), /page unavailable/);
    await assert.rejects(service.reconcileActiveRuntimeLeases([], ['project-one'], request), /page unavailable/);
    assert.equal(updates.length, 0, 'an unread later page must not partially mark a project offline');
    failedPage = undefined;
    records = [{ code: 'one', projectCode: 'project-one', functionalModule: 'module-one',
        technicalModules: ['obsolete'], runtimeState: 'ACTIVE', observedServers: ['local:a:default'] }];
    const leases = ['leaf-one', 'leaf-two'].map((moduleName, i) => ({ projectCode: 'project-one',
        functionalModuleIdentity: 'module-one', moduleName, environment: 'local', server: i ? 'b' : 'a' }));
    updates = [];
    await service.reconcileActiveRuntimeLeases(leases, [], request);
    assert.deepEqual(updates[0].model.technicalModules, ['leaf-one', 'leaf-two']);
    Object.assign(records[0], updates[0].model);
    updates = [];
    await service.reconcileActiveRuntimeLeases(leases.slice(1), [], request);
    assert.deepEqual(updates[0].model.technicalModules, ['leaf-two']);
    console.log('Functional-module lifecycle paging and replica membership validated');
}
run().catch(error => { console.error(error); process.exitCode = 1; });
