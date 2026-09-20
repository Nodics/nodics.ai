/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module nRouter/test/runtimeScopeRouteAdmissionContract @description Verifies scoped runtime routing without permission widening from groups or permissive legacy configuration. @layer test @owner nRouter */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const owner = require('../src/service/request/defaultSecuredRequestPipelineService');
global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message || code); } } };
global.UTILS = { getUserGroupPermissions: () => ['*'], getUserGroupCodes: groups => groups };
const authDefaults = require('../../nAuth/config/properties').authSecurity;
global.CONFIG = { get: key => key === 'authSecurity' ? authDefaults : undefined };
const route = { accessGroups: ['userGroup'], permission: 'jobs.execute' };
const scope = { assignmentCode: 'deployment-1' };
const service = { ...owner, getRouteActionAuthorizationConfig: () => ({ enabled: false, strict: false }), getGroupPermissions: () => ['*'] };
function admit(changes = {}) {
    const request = { moduleName: 'cronjob', router: route, authData: { tokenType: 'service', modules: ['cronjob'], runtimeScope: scope, permissions: ['jobs.execute'], userGroups: ['adminGroup'] }, ...changes };
    let outcome;
    service.checkAccess(request, {}, { nextSuccess: () => { outcome = true; }, error: (_request, _response, error) => { outcome = error; } });
    return outcome;
}
test('runtime module and explicit action scope authorize a base-group route without expanding identity groups', () => {
    assert.equal(admit(), true);
    assert.match(admit({ moduleName: 'inventory' }).message, /requested module/);
    const authData = { tokenType: 'service', modules: ['cronjob'], runtimeScope: scope, permissions: [], userGroups: [{ code: 'adminGroup', permissions: ['*'] }] };
    assert.notEqual(admit({ authData }), true);
    assert.deepEqual(service.getGrantedPermissions({ authData }), []);
});
test('human-only routes and restricted access groups retain their independent boundaries', () => {
    assert.notEqual(admit({ router: { ...route, authTokenTypes: ['access'] } }), true);
    assert.notEqual(admit({ router: { ...route, accessGroups: ['adminGroup'] } }), true);
    assert.equal(admit({ router: { accessGroups: ['userGroup'] } }), true);
});

test('canonical service-only routes admit exact runtime scope without group-derived authority', () => {
    const router = { accessGroups: ['serviceAccountUserGroup'], authTokenTypes: ['service'], permission: 'jobs.execute' };
    assert.equal(admit({ router }), true);
    assert.notEqual(admit({ router, moduleName: 'inventory' }), true);
    assert.notEqual(admit({ router, authData: { tokenType: 'service', modules: ['cronjob'], runtimeScope: scope, permissions: [], userGroups: ['serviceAccountUserGroup'] } }), true);
    assert.notEqual(admit({ router: { ...router, authTokenTypes: ['access'] } }), true);
    const original = CONFIG.get;
    CONFIG.get = key => key === 'authSecurity' ? { internalToken: { runtimeAccessGroups: ['userGroup'] } } : undefined;
    try { assert.notEqual(admit({ router }), true); } finally { CONFIG.get = original; }
});
