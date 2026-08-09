/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
const { assertRouteContracts, flattenRoutes } = require('../../../../nodics.core/modules/nRouter/test/routerContractTestUtils');
const properties = require('../config/properties');
const routerConfig = require('../src/router/routers');

/**
 * @module nodics.cron/cronjob/test/cronJobRouteContract.test
 * @description Validates cronjob route metadata for create, update, run, start, stop, remove, pause, and resume operations.
 * @layer test
 * @owner cronjob
 * @override Project modules may add route contracts for custom scheduler endpoints while preserving this base lifecycle route surface.
 */

const cronJobController = 'DefaultCronJobController';
const cronJobLifecyclePermission = 'cronjob.lifecycle.manage';
const expectedRoutes = [
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
    if (route.operation && route.operation !== 'getJob') {
        assert.notStrictEqual(route.method, 'GET', 'CronJob lifecycle mutation routes must not use GET');
        assert.strictEqual(route.permission, cronJobLifecyclePermission, 'CronJob lifecycle mutation routes must declare governed permission');
    }
});
const authProperties = require('../../../../nodics.core/modules/nAuth/config/properties');
assert(
    authProperties.identityGovernance.permissionCatalog.includes(cronJobLifecyclePermission),
    'CronJob lifecycle permission must be present in the identity catalog',
);
assert(
    authProperties.identityGovernance.migration.groupTargets.runtimeConfigAdminUserGroup.permissions.includes(cronJobLifecyclePermission),
    'Runtime configuration admins must be allowed to operate Cron lifecycle in the reference setup',
);
const capability = properties.backofficeCapabilities.cronjob;
assert.strictEqual(capability.displayName, 'Cron Jobs');
assert.deepStrictEqual(
    capability.navigation.map(item => item.label),
    ['Cron jobs', 'Scheduled triggers'],
    'Cron Axis navigation must remain compact inside automation workspace',
);
assert(
    capability.navigation.every((item) => item.route.startsWith('/cron') &&
        item.group.id === 'business-process-automation' &&
        item.group.label === 'Business Process & Automation'),
    'cron navigation must stay under /cron in the Business Process & Automation group',
);
console.log(`CronJob route contract validated: ${expectedRoutes.length} routes`);
