/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module nodics.process/test/processPermissionCatalogContract
 * @description Ensures every secured Process route permission is defined by Workflow's Profile-managed permission pack.
 * @layer test
 * @owner nodics.process
 * @override Later Process routes must extend owner permission data; group and principal grants remain separate governed decisions.
 */
const assert = require('assert');

const permissionRecords = Object.values(require('../modules/workflow/data/init-v001/records/identity/workflowPermissionData'));
const permissionHeader = require('../modules/workflow/data/init-v001/headers/identity/workflowPermissionHeader');
const permissionPack = require('../modules/workflow/data/manifest.json').sections.permissionCatalogue;
const profileInit = require('../../nodics.platform/modules/profile/data/manifest.json').sections['init-v001'];
const routers = require('../modules/workflow/src/router/routers');

const permissionCatalog = new Set(permissionRecords.map(row => row.code));
assert.strictEqual(permissionCatalog.size, permissionRecords.length, 'Process permission definitions must be unique');
assert.deepStrictEqual([...permissionCatalog].sort(), [
    'process.backoffice.view', 'process.definition.read', 'process.definition.create', 'process.definition.update',
    'process.definition.validate', 'process.definition.publish', 'process.definition.delete',
    'process.instance.start', 'process.instance.start.internal', 'process.instance.cancel', 'process.instance.retry',
    'process.instance.compensate', 'process.incident.read', 'process.task.claim', 'process.task.assign',
    'process.task.complete', 'process.task.cancel', 'process.trigger.manage', 'process.trigger.execute',
].sort());
permissionRecords.forEach(row => {
    assert.strictEqual(row.ownerModule, 'workflow');
    assert.strictEqual(row.active, true);
    assert.deepStrictEqual(Object.keys(row).sort(), ['active', 'code', 'name', 'ownerModule'],
        'Permission definitions must not assign groups or principals');
});
assert.strictEqual(permissionPack.owningDomain, 'workflow');
assert.strictEqual(permissionPack.selectionPolicy, 'EXPLICIT');
assert.strictEqual(permissionPack.destinationRole, 'PLATFORM');
assert(Object.hasOwn(permissionPack.files, 'init-v001/records/identity/workflowPermissionData.js'));
assert(Object.hasOwn(permissionPack.files, 'init-v001/headers/identity/workflowPermissionHeader.js'));
assert.deepStrictEqual(Object.keys(permissionHeader), ['profile']);
assert.strictEqual(permissionHeader.profile.workflowPermission.options.schemaName, 'permission');
assert.strictEqual(permissionHeader.profile.workflowPermission.options.operation, 'ensureReferenceAll');
assert(profileInit.prerequisites.some(ref => ref.moduleName === 'workflow' &&
    ref.sectionCode === 'permissionCatalogue' && ref.partition === 'DEFAULT'));
const routeGroups = [routers.workflow.processDefinitions, routers.workflow.processOperations];
const missing = [];

routeGroups.forEach(group => {
    Object.entries(group).forEach(([routeName, route]) => {
        assert.strictEqual(route.secured, true, `${routeName} must stay secured`);
        assert(route.permission || route.permissionConfig, `${routeName} must declare a specific permission or governed permission configuration`);
        if (route.permission && !permissionCatalog.has(route.permission)) missing.push(`${routeName}:${route.permission}`);
        if (route.permissionConfig) {
            assert.deepStrictEqual(route.authTokenTypes, ['service'], `${routeName} may use configured internal permission only for service tokens`);
            assert.strictEqual(route.permissionConfig, 'authSecurity.internalToken.routePermission',
                `${routeName} must use the governed internal-token route permission`);
        }
    });
});

assert.deepStrictEqual(missing, [], `Process route permissions missing from identity catalog: ${missing.join(', ')}`);
console.log('Process permission catalog contract passed');
