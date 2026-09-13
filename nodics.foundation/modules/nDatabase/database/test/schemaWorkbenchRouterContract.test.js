/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module database/test/schemaApiRouterContract
 * @description Verifies that Schema Workbench discovery routes remain secured,
 * permissioned, exposure-governed, and metadata-only.
 * @layer test
 * @owner nDatabase
 * @override Later layers may add stricter route policy while retaining these
 * minimum security requirements.
 */

const assert = require('assert');
const routers = require('../src/router/routers');
const defaults = require('../config/properties');
const security = require('../../../nRouter/src/service/request/defaultSecuredRequestPipelineService');
global.CONFIG = { get: key => defaults[key] };

const routes = require('../../../nRouter/src/router/routers').default.schemaOperations;
for (const [name, route] of Object.entries(routes)) {
    assert.strictEqual(route.secured, true);
    assert.deepStrictEqual(route.accessGroups, ['userGroup']);
    assert.deepStrictEqual(security.getRoutePermissions(route), [
        ['safeSearch', 'capabilities', 'deleteImpact'].includes(name) ? 'system.schema.view' : 'system.schema.manage',
    ]);
    assert.strictEqual(route.apiExposure, 'schemaApi');
    assert.strictEqual(route.controller, 'DefaultctrlName');
    assert(!route.key.includes('workbench'));
}
assert.strictEqual(routers.common.schemaApi, undefined);
assert.deepStrictEqual(Object.keys(routes).sort(), ['bulk', 'capabilities', 'deleteImpact', 'remove', 'safeSearch', 'save', 'update']);
console.log('Canonical schema API router security contract validated');
