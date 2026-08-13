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
 * @description Ensures every secured Process route permission is present in the identity governance permission catalog.
 * @layer test
 * @owner nodics.process
 * @override Later Process routes may add permissions only when the identity catalog and bootstrap groups are updated in the same change.
 */
const assert = require('assert');

const authProperties = require('../../nodics.core/modules/nAuth/config/properties');
const routers = require('../modules/workflow/modules/flowApi/src/router/routers');

const permissionCatalog = new Set(authProperties.identityGovernance.permissionCatalog);
const routeGroups = [routers.flowApi.processDefinitions, routers.flowApi.processOperations];
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
