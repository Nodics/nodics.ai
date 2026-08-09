/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module nodics.process/test/processApiRouteContract
 * @description Protects Process API route ownership, permissions, exposure category, and route prefix.
 * @layer test
 * @owner flowApi
 * @override Later process APIs may add routes without weakening secured access or the /process route family.
 */
const assert = require('assert');

const flowApiPackage = require('../modules/workflow/modules/flowApi/package.json');
const routers = require('../modules/workflow/modules/flowApi/src/router/routers');
const processDefinitionRoutes = routers.flowApi.processDefinitions;
const processOperationRoutes = routers.flowApi.processOperations;

assert.strictEqual(flowApiPackage.prefix, 'process');
assert.strictEqual(flowApiPackage.nodics.runtime.router, true);

[
    ['listDefinitions', 'GET', '/definitions', 'process.definition.read'],
    ['getDefinition', 'GET', '/definitions/:definitionCode', 'process.definition.read'],
    ['createDefinition', 'POST', '/definitions', 'process.definition.create'],
    ['updateDraft', 'PATCH', '/definitions/:definitionCode/draft', 'process.definition.update'],
    ['validateDraft', 'POST', '/definitions/:definitionCode/draft/validate', 'process.definition.validate'],
    ['publishDraft', 'POST', '/definitions/:definitionCode/draft/publish', 'process.definition.publish'],
    ['deleteOrArchive', 'DELETE', '/definitions/:definitionCode', 'process.definition.delete'],
    ['listVersions', 'GET', '/definitions/:definitionCode/versions', 'process.definition.read']
].forEach(([routeName, method, key, permission]) => {
    let route = processDefinitionRoutes[routeName];
    assert(route, `Missing process route ${routeName}`);
    assert.strictEqual(route.secured, true, `${routeName} must be secured`);
    assert.deepStrictEqual(route.authTokenTypes, ['access'], `${routeName} must require access token`);
    assert.strictEqual(route.method, method, `${routeName} method drift`);
    assert.strictEqual(route.key, key, `${routeName} path drift`);
    assert.strictEqual(route.permission, permission, `${routeName} permission drift`);
    assert.strictEqual(route.apiExposure, 'processManagement', `${routeName} exposure category drift`);
    assert.strictEqual(route.controller, 'DefaultProcessDefinitionController', `${routeName} controller drift`);
});

[
    ['listInstances', 'GET', '/instances', 'process.backoffice.view'],
    ['getInstance', 'GET', '/instances/:instanceCode', 'process.backoffice.view'],
    ['listTasks', 'GET', '/tasks', 'process.backoffice.view'],
    ['getTask', 'GET', '/tasks/:taskCode', 'process.backoffice.view'],
    ['listAuditEvents', 'GET', '/audit-events', 'process.backoffice.view']
].forEach(([routeName, method, key, permission]) => {
    let route = processOperationRoutes[routeName];
    assert(route, `Missing process operation route ${routeName}`);
    assert.strictEqual(route.secured, true, `${routeName} must be secured`);
    assert.deepStrictEqual(route.authTokenTypes, ['access'], `${routeName} must require access token`);
    assert.strictEqual(route.method, method, `${routeName} method drift`);
    assert.strictEqual(route.key, key, `${routeName} path drift`);
    assert.strictEqual(route.permission, permission, `${routeName} permission drift`);
    assert.strictEqual(route.apiExposure, 'processManagement', `${routeName} exposure category drift`);
    assert.strictEqual(route.controller, 'DefaultProcessOperationsController', `${routeName} controller drift`);
});

console.log('Process API route contract passed');
