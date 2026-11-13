/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module nPublish/test/publicationOperationsRouteContract @description Verifies route authorization and explicit Staged domain administration without enabling legacy global publishing. */
const assert = require('node:assert/strict');
const test = require('node:test');
const operations = require('../src/router/routers').publish.publicationOperations;

test('registered Staged domains retain scoped administration while disabled global and legacy CMS paths stay closed', async () => {
    const controller = require('../src/controller/defaultPublicationLifecycleController');
    const lifecycle = require('../src/service/defaultPublicationLifecycleService');
    const saved = { CONFIG: global.CONFIG, SERVICE: global.SERVICE, CLASSES: global.CLASSES };
    const provider = { validate() {}, getVersion() {}, activate() {}, rollback() {}, requestApproval() {} };
    const config = { publishEnabled: false, runtimeRole: { publication: 'STAGED' }, publish: { providers: {
        domainAdapters: { product: 'Provider', cms: 'Provider' }, versionProviders: { product: 'Provider', cms: 'Provider' },
        workflowProviders: { product: 'Provider' }, workflowProvider: 'Provider', versionProvider: 'Provider'
    } } };
    let reads = 0, writes = 0;
    try {
        global.CONFIG = { get: key => config[key] };
        global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };
        global.SERVICE = { Provider: provider, DefaultSecuredRequestPipelineService: { hasAccessGroup: () => true }, DefaultPublicationLifecycleService: {
            resolveProvider: lifecycle.resolveProvider, inspect: lifecycle.inspect, getVersionProvider: lifecycle.getVersionProvider, getConfiguration: lifecycle.getConfiguration,
            get: async request => { reads++; assert.equal(request.tenant, 'tenant-a'); return { domain: request.publicationCode === 'cms' ? 'cms' : 'product' }; },
            rollback: async request => { writes++; assert.equal(request.expectedRevision, 7); return { state: 'ROLLED_BACK' }; }
        }, DefaultPublicationOperationsService: { diagnostics: async () => { throw new Error('Unscoped operation escaped'); } } };
        const request = code => ({ tenant: 'tenant-a', httpRequest: { params: { publicationCode: code }, body: { expectedRevision: 7, domain: 'product' } } });
        assert.equal((await controller.get(request('product'))).domain, 'product');
        assert.deepEqual(await controller.rollback(request('product')), { state: 'ROLLED_BACK' });
        await new Promise((resolve, reject) => controller.get(request('product'), (error, result) => {
            if (error) return reject(error);
            assert.equal(result.code, 'SUC_PUB_00000'); resolve();
        }));
        await assert.rejects(controller.rollback(request('cms')), /disabled/);
        await assert.rejects(controller.diagnostics({ tenant: 'tenant-a' }), /disabled/);
        for (const map of ['domainAdapters', 'versionProviders', 'workflowProviders']) {
            config.publish.providers[map].product = null;
            await assert.rejects(controller.rollback(request('product')), /disabled/);
            config.publish.providers[map].product = 'Provider';
        }
        config.publish.providers.workflowProviders.product = {};
        await assert.rejects(controller.rollback(request('product')), /disabled/);
        config.publish.providers.workflowProviders.product = 'Provider';
        for (const role of ['ONLINE', undefined]) {
            config.runtimeRole.publication = role;
            const before = reads;
            await assert.rejects(controller.get(request('product')), /disabled/);
            assert.equal(reads, before);
        }
        assert.equal(writes, 1);
        config.publishEnabled = true;
        assert.equal((await controller.get(request('cms'))).domain, 'cms');
        config.publishEnabled = undefined;
        assert.equal((await controller.get(request('cms'))).domain, 'cms');
    } finally {
        for (const key of Object.keys(saved)) { if (saved[key] === undefined) delete global[key]; else global[key] = saved[key]; }
    }
});

test('tenant administrators must pass the source domain scope before inspection or rollback', async t => {
    const controller = require('../src/controller/defaultPublicationLifecycleController');
    const saved = { CONFIG: global.CONFIG, SERVICE: global.SERVICE, CLASSES: global.CLASSES };
    t.after(() => Object.assign(global, saved));
    global.CONFIG = { get: () => true };
    global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };
    const publication = { domain: 'cms', code: 'menu-publication' };
    const operations = [];
    global.SERVICE = {
        DefaultSecuredRequestPipelineService: { hasAccessGroup: () => false },
        DefaultPublicationLifecycleService: {
            get: async request => { assert.equal(request.tenant, 'tenant-a'); return publication; },
            getDomainAdapter: domain => domain === 'cms' ? {
                authorizeScopedOperator: async (operation, selected, request) => {
                    assert.equal(selected, publication);
                    assert.equal(request.tenant, 'tenant-a');
                    if (request.authData.entCode !== 'enterprise-a') throw new CLASSES.NodicsError('ERR_AUTH_00003');
                    operations.push(operation);
                }
            } : {},
            inspect: async () => publication,
            rollback: async () => ({ state: 'ROLLED_BACK' })
        }
    };
    const request = entCode => ({ tenant: 'tenant-a', authData: { entCode }, httpRequest: { params: { publicationCode: publication.code } } });
    assert.equal(await controller.get(request('enterprise-a')), publication);
    assert.deepEqual(await controller.rollback(request('enterprise-a')), { state: 'ROLLED_BACK' });
    await assert.rejects(controller.rollback(request('foreign')), { code: 'ERR_AUTH_00003' });
    publication.domain = 'commerce';
    await assert.rejects(controller.get(request('enterprise-a')), { code: 'ERR_AUTH_00003' });
    assert.deepEqual(operations, ['get', 'rollback']);
});

for (const [name, key, permission, method] of [
    ['diagnostics', '/publications/operations/diagnostics', 'view', 'GET'],
    ['correlation', '/publications/operations/correlations/:correlationId', 'view', 'GET'],
    ['reconcile', '/publications/operations/reconcile', 'reconcile', 'POST'],
    ['recover', '/publications/:publicationCode/recover', 'recover', 'POST'],
]) {
    test('publication operation ' + name + ' retains its explicit authorization contract', () => {
        const route = operations[name];
        assert.equal(route.key, key);
        assert.equal(route.method, method);
        assert.equal(route.permission, 'publish.operations.' + permission);
        assert.equal(route.secured, true);
        assert.deepEqual(route.authTokenTypes, ['access']);
    });
}
