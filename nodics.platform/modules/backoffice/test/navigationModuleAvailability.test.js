/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module backoffice/test/navigationModuleAvailability @description Verifies feature-scoped availability for every standard functional group using existing target/action contracts. @layer test @owner backoffice */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const service = require('../src/service/registry/defaultBackofficeRegistryService');
const root = path.resolve(__dirname, '../../../..');
const groups = fs.readdirSync(root).filter(name => name.startsWith('nodics.') && fs.existsSync(path.join(root, name, 'package.json')));
for (const owner of groups) {
    const item = { id: 'records', label: 'Records', featureState: 'ACTIVE', help: { summary: 'Record administration' },
        workbenchTarget: { moduleName: 'target', schemaName: 'record' },
        lifecycleActions: [{ id: 'save', ownerModule: 'target', featureState: 'ACTIVE' },
            { id: 'publish', ownerModule: 'approval', featureState: 'ACTIVE' }] };
    const source = JSON.stringify(item);
    let result = service.applyNavigationAvailability(item, owner, { [owner]: { state: 'UP' } });
    assert.equal(result.featureState, 'DISABLED');
    assert.match(result.help.summary, /target/);
    result = service.applyNavigationAvailability(item, owner, { [owner]: { state: 'UP' }, target: { state: 'UP' } });
    assert.equal(result.featureState, 'ACTIVE');
    assert.equal(result.lifecycleActions[0].featureState, 'ACTIVE');
    assert.equal(result.lifecycleActions[1].featureState, 'DISABLED');
    for (const state of ['UNKNOWN', 'UNAVAILABLE', 'DOWN']) {
        result = service.applyNavigationAvailability(item, owner, { [owner]: { state: 'UP' }, target: { state } });
        assert.equal(result.featureState, 'DISABLED');
    }
    result = service.applyNavigationAvailability(item, owner,
        { [owner]: { state: 'UP' }, target: { state: 'DEGRADED' }, approval: { state: 'UP' } });
    assert.equal(result.availability, 'DEGRADED');
    assert.equal(result.featureState, 'ACTIVE');
    assert(result.lifecycleActions.every(action => action.featureState === 'ACTIVE'));
    assert.equal(JSON.stringify(item), source, 'an unavailable observation must not mutate provider defaults or prevent recovery');
    result = service.applyNavigationAvailability({ ...item, featureState: 'HIDDEN' }, owner, {});
    assert.equal(result.featureState, 'HIDDEN');
    result = service.applyNavigationAvailability({ id: 'independent', featureState: 'ACTIVE' }, owner,
        { [owner]: { state: 'UP' } });
    assert.equal(result.featureState, 'ACTIVE', 'an unrelated missing dependency must not disable the owner');
}
const published = { groups: [], navigation: [{ id: 'records', moduleName: 'provider', featureState: 'ACTIVE' }] };
const registry = Object.assign({}, service, {
    getNavigationCompositionState: () => ({ published: { composition: published }, history: [], version: 1 }),
    computeNavigationCompositionChecksum: () => 'test-checksum'
});
const catalogue = { provider: { navigation: [{ id: 'records', label: 'Records', requiredPermissions: ['records.read'],
    workbenchTarget: { moduleName: 'target', schemaName: 'record' } }] } };
let composition = registry.buildEffectiveNavigationComposition(catalogue, { provider: { state: 'UP' } },
    { permissions: ['records.read'] }, {}, {});
assert.equal(composition.navigation[0].featureState, 'DISABLED', 'published menus must inherit missing target metadata');
composition = registry.buildEffectiveNavigationComposition(catalogue, { provider: { state: 'UP' }, target: { state: 'UP' } },
    { permissions: [] }, {}, {});
assert.equal(composition.navigation.length, 0, 'published menus must not restore permission-filtered provider items');
composition = registry.buildEffectiveNavigationComposition({}, {}, { permissions: ['*'] }, {}, {});
assert.equal(composition.navigation.length, 0, 'saved menus cannot restore an absent provider');
composition = registry.buildEffectiveNavigationComposition(catalogue, { provider: { state: 'UP' }, target: { state: 'UP' } },
    { permissions: ['records.read'] }, {}, {});
assert.equal(composition.navigation[0].availability, 'UP');
assert.equal(composition.navigation[0].featureState, 'ACTIVE');
console.log(`Navigation absence, partial availability and recovery validated for ${groups.length} framework groups`);
