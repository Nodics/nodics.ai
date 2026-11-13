/*
    Nodics - Enterprise Micro-Services Management Framework
    Copyright (c) 2026 Nodics All rights reserved.
    Governed by the root LICENSE or a separate written agreement with Nodics.
 */
/** @module nPublish/test/publicationRecoveryInspection @description Qualifies nonpersistent operator eligibility, declared transports and independent BackOffice permission filtering without invoking lifecycle mutations or granting approval. @layer test @owner nPublish */
const test = require('node:test'), assert = require('node:assert/strict');
const lifecycle = require('../src/service/defaultPublicationLifecycleService');
function fixture(t) {
    const saved = { CONFIG: global.CONFIG, SERVICE: global.SERVICE, CLASSES: global.CLASSES }; t.after(() => Object.assign(global, saved));
    const record = { code: 'request-a', domain: 'example', rootType: 'article', rootCode: 'article-a', sourceVersion: '2', state: 'ONLINE', revision: 5,
        activationOperation: { key: 'original-activation' }, targetVersion: 'new-version', previousOnlineVersion: 'retained-version', auditTrail: [] };
    const provider = { targetCommandReceiptContract: 'v1', getOnlineVersion: async () => ({ version: record.targetVersion }), rollback() { throw Error('Read invoked mutation'); }, withdraw() { throw Error('Read invoked mutation'); } };
    global.CONFIG = { get: () => ({ providers: { repositoryProvider: 'Repository', versionProviders: { example: 'VersionProvider' } } }) };
    global.SERVICE = { Repository: { get: async () => structuredClone(record) }, VersionProvider: provider };
    global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };
    const transient = (operation, failed = false) => {
        const proof = lifecycle.captureTargetCommand(record, operation), state = operation === 'ROLLBACK' ? 'ROLLING_BACK' : 'WITHDRAWING';
        record.state = state; record.revision = 6;
        record.auditTrail = [{ publicationCode: record.code, revision: 6, fromState: 'ONLINE', toState: state, details: { targetCommandOperation: proof } }];
        if (failed) { record.state = 'FAILED'; record.revision = 7; record.auditTrail.push({ publicationCode: record.code, revision: 7, fromState: state, toState: 'FAILED', details: { targetCommandOperation: proof } }); }
    };
    return { record, provider, transient, inspect: () => lifecycle.inspect({ publicationCode: record.code, tenant: 'tenant-a' }) };
}
test('inspection offers rollback only with a retained predecessor and never persists presentation evidence', async t => {
    const f = fixture(t), before = structuredClone(f.record);
    assert.deepEqual((await f.inspect()).operatorOperations, ['rollback']); assert.deepEqual(f.record, before);
    delete f.record.previousOnlineVersion; assert.deepEqual((await f.inspect()).operatorOperations, []);
});
for (const operation of ['ROLLBACK', 'WITHDRAWAL']) for (const failed of [false, true]) test(operation + ' original journal qualifies ' + (failed ? 'retry' : 'in-flight continuation') + ' without target effects', async t => {
    const f = fixture(t); f.transient(operation, failed);
    assert.deepEqual((await f.inspect()).operatorOperations, [failed ? 'retry' : operation === 'ROLLBACK' ? 'rollback' : 'withdraw']);
    delete f.record.auditTrail[0].details.targetCommandOperation;
    const held = await f.inspect(); assert.deepEqual(held.operatorOperations, []); assert.match(held.operatorGuidance, /unverified/);
});
test('missing provider and legacy failed-command proof retain readable history without an executable recovery', async t => {
    const f = fixture(t); f.transient('ROLLBACK', true); delete f.provider.targetCommandReceiptContract;
    assert.deepEqual((await f.inspect()).operatorOperations, []);
    delete SERVICE.VersionProvider; const result = await f.inspect(); assert.equal(result.code, f.record.code); assert.deepEqual(result.operatorOperations, []);
});
test('validation and activation failures offer only ordinary retry while terminal states offer no implicit resubmit', async t => {
    const f = fixture(t);
    for (const fromState of ['VALIDATING', 'ACTIVATING']) {
        f.record.state = 'FAILED'; f.record.revision = 7; f.record.auditTrail = [{ publicationCode: f.record.code, revision: 7, fromState, toState: 'FAILED' }];
        const result = await f.inspect(); assert.deepEqual(result.operatorOperations, ['retry']); assert.match(result.operatorGuidance, /Normal review and approval/);
    }
    for (const state of ['ROLLED_BACK', 'WITHDRAWN', 'REJECTED', 'PENDING_APPROVAL', 'VALIDATED']) {
        f.record.state = state; assert.deepEqual((await f.inspect()).operatorOperations, []);
    }
});
test('real capability actions use existing secured human routes and BackOffice removes permissions independently', () => {
    const capability = require('../src/service/defaultPublishBackofficeCapabilityService').getCapability();
    const request = capability.navigation.find(item => item.id === 'publishing-requests');
    const contract = require('../../../../nodics.platform/modules/backoffice/src/service/contract/defaultBackofficeContractService');
    assert.equal(contract.validateNavigationLifecycleActions(request.lifecycleActions), true);
    const registry = require('../../../../nodics.platform/modules/backoffice/src/service/registry/defaultBackofficeCapabilityRegistryService');
    const actions = permissions => registry.authorizeNavigation(capability.navigation, ['cms.backoffice.view', ...permissions]).find(item => item.id === request.id).lifecycleActions;
    assert.equal(actions([]).length, 0); assert.deepEqual(actions(['publish.lifecycle.retry']).map(item => item.id), ['retry']);
    const routes = require('../src/router/routers').publish.publicationLifecycle;
    for (const action of request.lifecycleActions) {
        const route = routes[action.id]; assert.equal(route.key, action.operationRoute); assert.equal(route.method, action.httpMethod);
        assert.equal(route.permission, action.permission); assert.equal(route.secured, true); assert.deepEqual(route.authTokenTypes, ['access']);
        assert.deepEqual(route.accessGroups, action.id === 'rollback' ? ['adminGroup', 'runtimeConfigAdminUserGroup'] : ['runtimeConfigAdminUserGroup']);
    }
    assert.deepEqual(routes.approve.authTokenTypes, ['service']); assert.deepEqual(routes.activate.authTokenTypes, ['service']);
});

test('a historical Online request or unavailable current target never offers rollback while history remains readable', async t => {
    const f = fixture(t);
    f.provider.getOnlineVersion = async () => ({ version: 'a-newer-version' });
    const old = await f.inspect(); assert.deepEqual(old.operatorOperations, []); assert.match(old.operatorGuidance, /historical request/);
    for (const response of [{ version: f.record.targetVersion, acknowledged: false }, { version: f.record.targetVersion, errors: ['denied'] }, {}]) {
        f.provider.getOnlineVersion = async () => response;
        const result = await f.inspect(); assert.deepEqual(result.operatorOperations, []); assert.equal(result.code, f.record.code); assert.match(result.operatorGuidance, /unverified/);
    }
});


test('qualified first-publication history checks current delivery even without a retained predecessor', async t => {
    const f = fixture(t); delete f.record.previousOnlineVersion;
    for (const version of ['newer-version', null]) {
        f.provider.getOnlineVersion = async () => ({ version });
        const historical = await f.inspect(); assert.deepEqual(historical.operatorOperations, []); assert.match(historical.operatorGuidance, /historical request/);
    }
    f.provider.getOnlineVersion = async () => ({ version: f.record.targetVersion, acknowledged: false });
    assert.match((await f.inspect()).operatorGuidance, /unverified/);
    f.provider.getOnlineVersion = async () => ({ version: f.record.targetVersion });
    assert.match((await f.inspect()).operatorGuidance, /No previous published version/);
});
