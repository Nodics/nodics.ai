/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module backoffice/test/navigationCompositionLifecycle @description Verifies scoped revision fencing and module-default restoration through the real navigation lifecycle. @layer test @owner backoffice */
const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const owner = require('../src/service/registry/defaultBackofficeRegistryService');
let service, request, baseline, audits;
beforeEach(() => {
    global.NODICS = {};
    global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };
    baseline = { groups: [], navigation: [{ moduleName: 'records', id: 'list', label: 'Records', route: '/records', order: 1, availability: 'UP', featureState: 'PREVIEW' }] };
    audits = [];
    request = { tenant: 'one', _projectCode: 'project', authData: { enterpriseCode: 'business', userName: 'tester' } };
    service = { ...owner, _navigationCompositionState: {}, audit: async event => { audits.push(event); },
        effectiveNavigationComposition: async function (input) {
            const state = this.getNavigationCompositionState(input);
            const composition = structuredClone(state.published?.composition || baseline);
            return { data: { ...composition, source: state.published ? 'GOVERNED_COMPOSITION' : 'MODULE_DEFAULTS',
                checksum: this.computeNavigationCompositionChecksum(composition, input, input.authData), scope: { tenantCode: input.tenant, enterpriseCode: input.authData.enterpriseCode } } };
        } };
});
async function observed(input = request) {
    const effective = await service.effectiveNavigationComposition(input), state = service.getNavigationCompositionState(input);
    return { expectedVersion: state.version, expectedChecksum: state.draft?.checksum || effective.data.checksum,
        ...(state.draft ? { expectedDraftId: state.draft.draftId } : {}) };
}
async function command(name, extra = {}, input = request) {
    return service[name]({ ...input, body: { ...await observed(input), ...extra } });
}
test('requires fresh scope-bound preconditions and rejects malformed or stale draft commands before mutation', async () => {
    await assert.rejects(service.createNavigationCompositionDraft({ ...request, body: { candidate: baseline } }), /precondition/i);
    const token = await observed();
    const candidate = structuredClone(baseline); candidate.navigation[0].label = 'Business records';
    const results = await Promise.allSettled([1, 2].map(() => service.createNavigationCompositionDraft({ ...request, body: { ...token, candidate } })));
    assert.equal(results.filter(x => x.status === 'fulfilled').length, 1);
    assert.equal(results.filter(x => x.status === 'rejected').length, 1);
    assert.equal(service.getNavigationCompositionState(request).version, 1);
    await assert.rejects(service.submitNavigationCompositionDraft({ ...request, body: token }), /precondition/i);
    await assert.rejects(command('submitNavigationCompositionDraft', { expectedDraftId: 'foreign-draft' }), /precondition/i);
    const foreign = { ...request, tenant: 'other' };
    await assert.rejects(service.createNavigationCompositionDraft({ ...foreign, body: { ...token, candidate } }), /precondition/i);
    assert.equal(audits.length, 1);
});
test('keeps validation and stage gates, publishes only an approved draft and restores native defaults after the first publication', async () => {
    const invalid = structuredClone(baseline); invalid.navigation[0].featureState = 'ACTIVE';
    await assert.rejects(command('createNavigationCompositionDraft', { candidate: invalid }), /invalid/);
    const candidate = structuredClone(baseline); candidate.navigation[0].label = 'Business records';
    await command('createNavigationCompositionDraft', { candidate });
    await assert.rejects(command('publishNavigationCompositionDraft'), /publishable/);
    await command('submitNavigationCompositionDraft');
    await command('approveNavigationCompositionDraft');
    const old = await observed();
    await command('publishNavigationCompositionDraft');
    assert.equal((await service.effectiveNavigationComposition(request)).data.navigation[0].label, 'Business records');
    await assert.rejects(service.publishNavigationCompositionDraft({ ...request, body: old }), /precondition|publishable/i);
    const beforeRollback = await observed();
    const restored = await command('rollbackNavigationComposition');
    assert.equal(restored.data.source, 'MODULE_DEFAULTS');
    assert.equal(restored.data.lifecycleState, 'PUBLISHED');
    assert.equal(service.getNavigationCompositionState(request).published, undefined);
    assert.deepEqual((await service.effectiveNavigationComposition(request)).data.navigation, baseline.navigation);
    assert.ok(restored.data.version > beforeRollback.expectedVersion);
    await assert.rejects(service.rollbackNavigationComposition({ ...request, body: beforeRollback }), /precondition/i);
    assert.deepEqual(audits.map(x => x.eventType.split('.').at(-1)), ['draft', 'submit', 'approve', 'publish', 'rollback']);
});
test('revalidates original owner routing before publication and retains an approved draft after refusal', async () => {
    await command('createNavigationCompositionDraft', { candidate: baseline });
    await command('submitNavigationCompositionDraft'); await command('approveNavigationCompositionDraft');
    baseline.navigation[0].route = '/owner-changed-route';
    await assert.rejects(command('publishNavigationCompositionDraft'), /invalid/);
    assert.equal(service.getNavigationCompositionState(request).draft.lifecycleState, 'APPROVED');
    assert.equal(service.getNavigationCompositionState(request).published, undefined);
});

test('authoring operation hints follow current prepared route permissions and inactive declarations', () => {
    const route = (operation, permission, active = true) => ({ controller: 'DefaultBackofficeRegistryController', operation, permission, active });
    NODICS.getRouters = () => ({ read: route('getNavigationCompositionSnapshot', 'navigation.read'),
        approve: route('approveNavigationCompositionDraft', 'navigation.approve'),
        publish: route('publishNavigationCompositionDraft', 'navigation.publish', false) });
    request.authData.permissions = ['navigation.read'];
    assert.deepEqual(service.navigationCompositionAllowedOperations(request), ['export']);
    request.authData.permissions = ['*'];
    assert.deepEqual(service.navigationCompositionAllowedOperations(request), ['export', 'approve']);
});

test('navigation write stages require the existing Axis administration authority independently of bootstrap viewing', () => {
    const routers = require('../src/router/routers');
    const flattened = [];
    const walk = value => { if (!value || typeof value !== 'object') return; if (value.operation) flattened.push(value); else Object.values(value).forEach(walk); };
    walk(routers);
    for (const operation of ['createNavigationCompositionDraft', 'submitNavigationCompositionDraft', 'approveNavigationCompositionDraft', 'publishNavigationCompositionDraft', 'rollbackNavigationComposition']) {
        const route = flattened.find(value => value.operation === operation);
        assert.ok(route, operation);
        assert.equal(route.permission, 'backoffice.axis.policy.update', operation + ' must not be admitted by bootstrap viewing');
    }
    for (const operation of ['effectiveNavigationComposition', 'navigationCompositionAuthoringStatus', 'previewNavigationComposition', 'getNavigationCompositionSnapshot'])
        assert.equal(flattened.find(value => value.operation === operation).permission, 'backoffice.bootstrap.view');
});
