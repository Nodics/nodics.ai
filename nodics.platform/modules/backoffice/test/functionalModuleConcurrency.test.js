/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module backoffice/test/functionalModuleConcurrency @description Proves multi-runtime release convergence and separation of lifecycle decisions from heartbeat writes. @layer test @owner backoffice */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const definition = require('../src/service/registry/defaultFunctionalModuleCatalogueService');
global.CONFIG = { get: () => undefined };
global.SERVICE = {};
global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };

const pack = server => ({ code: 'baseCommerce:core-reference', owner: 'baseCommerce',
    targetModule: 'baseCommerce', targetServer: server, required: true, trigger: 'ACTIVATION', dataType: 'core' });
const observation = server => ({ projectCode: 'project', functionalModule: 'nodics.commerce',
    displayName: 'Commerce', registeredVersion: '0.0.0', moduleIndex: '90.99', required: false,
    technicalModules: ['baseCommerce'], activationDataPackages: [pack(server)], observedServer: 'local:' + server + ':default' });
const request = revision => ({ tenant: 'tenant-one', authData: { principalId: 'operator' },
    params: { functionalModule: 'nodics.commerce' },
    body: { project: 'project', expectedRevision: revision, reason: 'User-approved test activation' } });

function fixture() {
    let record;
    const receipts = [];
    const service = Object.assign({}, definition, {
        getPersistenceAuthData: auth => auth,
        getRecord: async () => structuredClone(record),
        getAllRecords: async () => [structuredClone(record)],
        retireDuplicateLegacyRecords: async () => 0,
        saveRecord: async ({ model }) => { record = structuredClone(model); return { result: [model] }; },
        updateRecord: async ({ query, model, tenant }) => {
            assert.equal(tenant, 'tenant-one');
            const matches = Object.entries(query).every(([key, value]) => record[key] === value);
            if (matches) Object.assign(record, structuredClone(model));
            return { result: { matchedCount: matches ? 1 : 0, modifiedCount: matches ? 1 : 0 } };
        },
        getActivationDataConfiguration: () => ({ modules: {} }),
        projectClientSafeWithReceipts: async value => value,
        assertFunctionalDependenciesSatisfied: async () => true,
        executeRequiredActivationData: async () => true,
        recordDataLeftIntact: async () => true,
        getReceiptRecords: async ({ query }) => ({ result: receipts.filter(item => item.code === query.code) }),
        saveReceiptRecord: async ({ model }) => { receipts.push(model); return { result: [model] }; }
    });
    return { service, receipts, read: () => record };
}

test('alternating runtime release targets converge instead of advancing every heartbeat', async () => {
    const { service, read } = fixture();
    const req = request(1);
    await service.reconcileObservation(observation('commerceOnline'), req);
    await service.reconcileObservation(observation('commerceStaged'), req);
    const revision = read().catalogueRevision;
    for (let index = 0; index < 12; index++) {
        await service.reconcileObservation(observation(index % 2 ? 'commerceOnline' : 'commerceStaged'), req);
    }
    assert.equal(read().catalogueRevision, revision);
    assert.equal(read().activationDataPackages.length, 2);
    assert.equal(service.normalizeActivationDataPackages([pack('commerceOnline'), pack('commerceOnline')]).length, 1);
    service.getActivationDataConfiguration = () => ({ modules: { 'nodics.commerce': { dataPackages: [pack('projectTarget')] } } });
    assert.deepEqual(service.getActivationDataPackages('nodics.commerce', read()).map(item => item.targetServer), ['projectTarget']);
});

test('heartbeat cannot restore an administrator state captured before activation', async () => {
    const { service, read } = fixture();
    await service.reconcileObservation(observation('commerceOnline'), request(1));
    await service.transition(request(1), 'register');
    const update = service.updateRecord;
    let raced = false;
    service.updateRecord = async req => {
        if (!raced && req.model.lastObservedAt) {
            raced = true;
            await service.transition(request(2), 'activate');
        }
        return update(req);
    };
    await service.reconcileObservation(observation('commerceOnline'), request(2));
    assert.equal(read().enabled, true);
    assert.equal(read().catalogueRevision, 3);
    await assert.rejects(service.transition(request(2), 'deactivate'), /revision conflict/);
});

test('membership changes during import do not invalidate activation; runtime loss still does', async () => {
    for (const online of [true, false]) {
        const { service, read } = fixture();
        await service.reconcileObservation(observation('commerceOnline'), request(1));
        await service.transition(request(1), 'register');
        service.executeRequiredActivationData = async () => {
            await service.reconcileActiveRuntimeLeases(online ? [{ projectCode: 'project',
                functionalModuleIdentity: 'nodics.commerce', moduleName: 'product',
                environment: 'local', server: 'commerceOnline' }] : [], ['project'], request(2));
        };
        if (online) {
            await service.transition(request(2), 'activate');
            assert.equal(read().enabled, true);
            assert.deepEqual(read().technicalModules, ['product']);
        } else {
            await assert.rejects(service.transition(request(2), 'activate'), /revision conflict/);
            assert.equal(read().enabled, false);
        }
    }
});

test('a conflicting administrator decision during import is not retried or overwritten', async () => {
    const { service, read } = fixture();
    await service.reconcileObservation(observation('commerceOnline'), request(1));
    await service.transition(request(1), 'register');
    let imports = 0;
    service.executeRequiredActivationData = async () => {
        imports++;
        await service.transition(request(2), 'deregister');
    };
    await assert.rejects(service.transition(request(2), 'activate'), /revision conflict/);
    assert.equal(imports, 1);
    assert.equal(read().enabled, false);
    assert.equal(read().registrationState, 'AVAILABLE');
});

test('receipt status is scoped by release target, including historical receipt keys', async () => {
    const { service, receipts, read } = fixture();
    await service.reconcileObservation(observation('commerceOnline'), request(1));
    for (const server of ['commerceOnline', 'commerceStaged']) {
        await service.upsertActivationReceipt(read(), pack(server), server === 'commerceOnline' ? 'IMPORTED' : 'FAILED',
            { request: request(1), actor: 'operator' }, {});
    }
    assert.equal(new Set(receipts.map(item => item.code)).size, 2);
    service.getActivationReceipts = async () => receipts.concat([{ ...receipts[0],
        code: service.getReceiptKey('project', 'nodics.commerce', pack('commerceOnline').code),
        lastAttemptAt: new Date(0), status: 'FAILED' }]);
    const map = await service.getActivationReceiptMap('project', 'nodics.commerce', request(1));
    assert.equal(map[service.getActivationPackageKey(pack('commerceOnline'))].status, 'IMPORTED');
    assert.equal(map[service.getActivationPackageKey(pack('commerceStaged'))].status, 'FAILED');
    assert.equal(service.getMatchedCount({ result: { matchedCount: 1, modifiedCount: 0 } }), 1);
});
