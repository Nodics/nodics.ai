/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
const { assertRouteContracts, flattenRoutes } = require('../../../../nodics.foundation/modules/nRouter/test/routerContractTestUtils');
const capabilityService = require('../src/service/defaultCronjobBackofficeCapabilityService');
const routerConfig = require('../src/router/routers');

/**
 * @module nodics.process/cronjob/test/cronJobRouteContract.test
 * @description Validates cronjob route metadata for create, update, run, start, stop, remove, pause, and resume operations.
 * @layer test
 * @owner cronjob
 * @override Project modules may add route contracts for custom scheduler endpoints while preserving this base lifecycle route surface.
 */

const cronJobController = 'DefaultCronJobController';
const cronJobLifecyclePermission = 'cronjob.lifecycle.manage';
const expectedRoutes = [
    { key: '/schedules/drafts/capabilities', method: 'GET', controller: 'DefaultCronJobScheduleDraftController', operation: 'capabilities', secured: true, permission: cronJobLifecyclePermission },
    { key: '/schedules/drafts/preview', method: 'POST', controller: 'DefaultCronJobScheduleDraftController', operation: 'preview', secured: true, permission: cronJobLifecyclePermission },
    { key: '/schedules/drafts', method: 'POST', controller: 'DefaultCronJobScheduleDraftController', operation: 'create', secured: true, permission: cronJobLifecyclePermission },
    { key: '/schedules/drafts/inspect', method: 'POST', controller: 'DefaultCronJobScheduleDraftController', operation: 'inspect', secured: true, permission: cronJobLifecyclePermission },
    { key: '/job/create', method: 'POST', controller: cronJobController, operation: 'createJob', secured: true, permission: cronJobLifecyclePermission },
    { key: '/job/create/:jobCode', method: 'POST', controller: cronJobController, operation: 'createJob', secured: true, permission: cronJobLifecyclePermission },
    { key: '/job/update', method: 'PATCH', controller: cronJobController, operation: 'updateJob', secured: true, permission: cronJobLifecyclePermission },
    { key: '/job/update/:jobCode', method: 'PATCH', controller: cronJobController, operation: 'updateJob', secured: true, permission: cronJobLifecyclePermission },
    { key: '/job/run/:jobCode', method: 'POST', controller: cronJobController, operation: 'runJob', secured: true, permission: cronJobLifecyclePermission },
    { key: '/job/start/:jobCode', method: 'POST', controller: cronJobController, operation: 'startJob', secured: true, permission: cronJobLifecyclePermission },
    { key: '/job/start', method: 'POST', controller: cronJobController, operation: 'startJob', secured: true, permission: cronJobLifecyclePermission },
    { key: '/job/stop/:jobCode', method: 'POST', controller: cronJobController, operation: 'stopJob', secured: true, permission: cronJobLifecyclePermission },
    { key: '/job/stop', method: 'POST', controller: cronJobController, operation: 'stopJob', secured: true, permission: cronJobLifecyclePermission },
    { key: '/job/remove/:jobCode', method: 'DELETE', controller: cronJobController, operation: 'removeJob', secured: true, permission: cronJobLifecyclePermission },
    { key: '/job/remove', method: 'DELETE', controller: cronJobController, operation: 'removeJob', secured: true, permission: cronJobLifecyclePermission },
    { key: '/job/pause/:jobCode', method: 'POST', controller: cronJobController, operation: 'pauseJob', secured: true, permission: cronJobLifecyclePermission },
    { key: '/job/pause', method: 'POST', controller: cronJobController, operation: 'pauseJob', secured: true, permission: cronJobLifecyclePermission },
    { key: '/job/resume/:jobCode', method: 'POST', controller: cronJobController, operation: 'resumeJob', secured: true, permission: cronJobLifecyclePermission },
    { key: '/job/resume', method: 'POST', controller: cronJobController, operation: 'resumeJob', secured: true, permission: cronJobLifecyclePermission }
];

assertRouteContracts(routerConfig, expectedRoutes);
flattenRoutes(routerConfig).forEach(route => {
    const draftCapabilities = route.key === '/schedules/drafts/capabilities' &&
        route.controller === 'DefaultCronJobScheduleDraftController' && route.operation === 'capabilities';
    if (route.operation && route.operation !== 'getJob' && !draftCapabilities) {
        assert.notStrictEqual(route.method, 'GET', 'CronJob lifecycle mutation routes must not use GET');
        assert.strictEqual(route.permission, cronJobLifecyclePermission, 'CronJob lifecycle mutation routes must declare governed permission');
    }
});
const permissionRecords = Object.values(require('../data/init-v001/records/identity/cronjobPermissionData'));
const permissionHeader = require('../data/init-v001/headers/identity/cronjobPermissionHeader');
const permissionPack = require('../data/manifest.json').sections.permissionCatalogue;
const configGroups = Object.values(require('../../../../nodics.foundation/modules/nConfig/data/init-v001/records/identity/configUserGroupData'));
const configGroupHeader = require('../../../../nodics.foundation/modules/nConfig/data/init-v001/headers/identity/configUserGroupHeader');
const configGroupPack = require('../../../../nodics.foundation/modules/nConfig/data/manifest.json').sections.accessGroups;
const profileInit = require('../../../../nodics.platform/modules/profile/data/manifest.json').sections['init-v001'];
assert.deepStrictEqual(permissionRecords.map(row => row.code).sort(), ['cronjob.backoffice.view', cronJobLifecyclePermission].sort());
permissionRecords.forEach(row => {
    assert.strictEqual(row.ownerModule, 'cronjob');
    assert.strictEqual(row.active, true);
    assert.deepStrictEqual(Object.keys(row).sort(), ['active', 'code', 'name', 'ownerModule'],
        'Cron vocabulary defines permissions, not assignments');
});
assert.strictEqual(permissionPack.owningDomain, 'cronjob');
assert.strictEqual(permissionPack.selectionPolicy, 'EXPLICIT');
assert.strictEqual(permissionPack.destinationRole, 'PLATFORM');
assert(Object.hasOwn(permissionPack.files, 'init-v001/records/identity/cronjobPermissionData.js'));
assert(Object.hasOwn(permissionPack.files, 'init-v001/headers/identity/cronjobPermissionHeader.js'));
assert.deepStrictEqual(Object.keys(permissionHeader), ['profile']);
assert.strictEqual(permissionHeader.profile.cronjobPermission.options.schemaName, 'permission');
assert.strictEqual(permissionHeader.profile.cronjobPermission.options.operation, 'ensureReferenceAll');
const runtimeAdmins = configGroups.filter(group => group.code === 'runtimeConfigAdminUserGroup');
assert.strictEqual(runtimeAdmins.length, 1, 'Runtime administrator definition has one canonical owner');
assert.strictEqual(runtimeAdmins[0].active, true);
assert(runtimeAdmins[0].permissions.includes(cronJobLifecyclePermission),
    'The explicit nConfig group definition retains its Cron lifecycle permission');
for (const group of configGroups.filter(group => group.code !== 'runtimeConfigAdminUserGroup')) {
    assert(!(group.permissions || []).includes(cronJobLifecyclePermission), 'Vocabulary import must not broaden sibling groups');
}
assert.strictEqual(configGroupPack.owningDomain, 'config');
assert.strictEqual(configGroupPack.selectionPolicy, 'EXPLICIT');
assert.strictEqual(configGroupPack.destinationRole, 'PLATFORM');
assert(Object.hasOwn(configGroupPack.files, 'init-v001/records/identity/configUserGroupData.js'));
assert(Object.hasOwn(configGroupPack.files, 'init-v001/headers/identity/configUserGroupHeader.js'));
assert.deepStrictEqual(Object.keys(configGroupHeader), ['profile']);
assert.strictEqual(configGroupHeader.profile.configUserGroup.options.schemaName, 'userGroup');
assert.strictEqual(configGroupHeader.profile.configUserGroup.options.operation, 'ensureReferenceAll');
assert(configGroupPack.prerequisites.some(ref => ref.moduleName === 'cronjob' &&
    ref.sectionCode === 'permissionCatalogue' && ref.partition === 'DEFAULT'));
assert(profileInit.prerequisites.some(ref => ref.moduleName === 'config' && ref.sectionCode === 'accessGroups'));
assert(profileInit.prerequisites.some(ref => ref.moduleName === 'cronjob' &&
    ref.sectionCode === 'permissionCatalogue' && ref.partition === 'DEFAULT'));
const capability = capabilityService.getCapability();
assert.strictEqual(capability.displayName, 'Cron Jobs');
assert.deepStrictEqual(
    capability.navigation.map(item => item.label),
    ['Cron jobs', 'Scheduled triggers'],
    'Cron Axis navigation must remain compact inside automation workspace',
);
assert(
    capability.navigation.every((item) => item.route.startsWith('/cron') &&
        item.group.id === 'process-and-automations' &&
        item.group.label === 'Process and Automations'),
    'cron navigation must stay under /cron in the Process and Automations group',
);
console.log(`CronJob route contract validated: ${expectedRoutes.length} routes`);
