/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module cronjob/test/cronJobBusinessNavigation @description Existing scheduler transports retain independent permission filtering. @layer test @owner cronjob */
const test = require('node:test'), assert = require('node:assert/strict');
const provider = require('../src/service/defaultCronjobBackofficeCapabilityService');
const registry = require('../../../../nodics.platform/modules/backoffice/src/service/registry/defaultBackofficeCapabilityRegistryService');
const contract = require('../../../../nodics.platform/modules/backoffice/src/service/contract/defaultBackofficeContractService');
test('Cron business navigation exposes only existing permission-filtered lifecycle routes', () => {
    const capability = provider.getCapability(), nav = capability.navigation.find(item => item.id === 'cronjob');
    assert.equal(contract.validateNavigationLifecycleActions(nav.lifecycleActions), true);
    const projected = permissions => registry.authorizeNavigation(capability.navigation, permissions).find(item => item.id === nav.id);
    assert.deepEqual(projected(['cronjob.backoffice.view']).lifecycleActions, []);
    assert.equal(projected(['cronjob.lifecycle.manage']), undefined);
    const actions = projected(['cronjob.backoffice.view', 'cronjob.lifecycle.manage']).lifecycleActions;
    assert.deepEqual(actions.map(item => item.id), ['create', 'run', 'start', 'stop', 'pause', 'resume']);
    const routes = [];
    const collect = value => { if (!value || typeof value !== 'object') return; if (value.key && value.method) routes.push(value); else Object.values(value).forEach(collect); };
    collect(require('../src/router/routers'));
    for (const action of actions) {
        const route = routes.find(item => item.key === action.operationRoute && item.method === action.httpMethod);
        assert.ok(route, action.id); assert.equal(route.permission, action.permission); assert.equal(route.secured, true);
        assert.deepEqual(route.accessGroups, ['userGroup']); assert.equal(action.ownerModule, 'cronjob');
    }
    actions[0].label = 'Caller-local change';
    assert.equal(provider.getCapability().navigation.find(item => item.id === nav.id).lifecycleActions[0].label, 'Create in scheduler');
});
