/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module backoffice/test/navigationCandidateInheritedAliases @description Verifies exact authorized inherited navigation aliases without admitting new routing or execution authority. @layer test @owner backoffice */
const test = require('node:test');
const assert = require('node:assert/strict');
const service = require('../src/service/registry/defaultBackofficeRegistryService');
function fixture(crossModule) {
    return { navigation: [
        { moduleName: 'owner', id: 'records', route: '/records', featureState: 'ACTIVE', availability: 'UP', requiredPermissions: ['records.read'], backendWorkspace: { renderer: 'axis.workspace.tabs', workspaceCode: 'records' } },
        { moduleName: crossModule ? 'contributor' : 'owner', id: 'records-shortcut', route: '/records', featureState: 'PREVIEW', availability: 'UP', requiredPermissions: ['records.read'] }
    ] };
}
for (const crossModule of [false, true]) {
    test('unchanged authorized inherited aliases validate: crossModule=' + crossModule, () => {
        const effective = fixture(crossModule);
        const candidate = structuredClone(effective);
        candidate.navigation.reverse();
        candidate.navigation[0].label = 'Business shortcut';
        candidate.navigation[0].order = 42;
        assert.equal(service.validateNavigationCompositionCandidate(candidate, effective).valid, true);
    });
}
for (const [key, value] of [
    ['requiredPermissions', []], ['featureState', 'ACTIVE'], ['availability', 'DEGRADED'],
    ['workbenchTarget', { moduleName: 'foreign', schemaName: 'private' }],
    ['backendWorkspace', { renderer: 'axis.workspace.native', workspaceCode: 'foreign' }],
    ['lifecycleActions', [{ id: 'write', ownerModule: 'foreign' }]],
    ['routeOwner', { ownerType: 'NATIVE_AXIS', ownerModule: 'foreign' }],
    ['parentModuleName', 'foreign']
]) {
    test('inherited aliases cannot change protected ' + key, () => {
        const effective = fixture(true), candidate = structuredClone(effective);
        candidate.navigation[1][key] = value;
        assert.equal(service.validateNavigationCompositionCandidate(candidate, effective).valid, false);
    });
}
test('new aliases and aliases absent from the current authorized scope refuse', () => {
    const effective = fixture(true), candidate = structuredClone(effective);
    candidate.navigation.push({ ...candidate.navigation[1], id: 'new-alias' });
    assert.equal(service.validateNavigationCompositionCandidate(candidate, effective).valid, false);
    assert.equal(service.validateNavigationCompositionCandidate(fixture(true), { navigation: [effective.navigation[0]] }).valid, false);
    assert.equal(service.validateNavigationCompositionCandidate(fixture(true), { navigation: [] }).valid, false);
});
test('duplicate stable identities refuse even when the route itself is unchanged', () => {
    const effective = fixture(false);
    assert.equal(service.validateNavigationCompositionCandidate({ navigation: [effective.navigation[0], effective.navigation[0]] }, effective).valid, false);
});
