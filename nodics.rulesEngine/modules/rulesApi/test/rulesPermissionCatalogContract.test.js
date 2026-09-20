/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const assert = require('assert');
const routers = require('../src/router/routers');
const authProperties = require('../../../nodics.foundation/modules/nAuth/config/properties');

const catalog = new Set(authProperties.identityGovernance.permissionCatalog);
const missing = [];
Object.values(routers.rulesApi).forEach(group => {
    Object.entries(group).forEach(([name, route]) => {
        assert.strictEqual(route.secured, true, name + ' must stay secured');
        assert(route.permission || route.permissionConfig, name + ' must declare permission');
        if (route.permission && !catalog.has(route.permission)) missing.push(name + ':' + route.permission);
    });
});
assert.deepStrictEqual(missing, [], 'Rules permissions missing from identity catalogue: ' + missing.join(', '));
console.log('Rules API permission catalogue contract validated');
