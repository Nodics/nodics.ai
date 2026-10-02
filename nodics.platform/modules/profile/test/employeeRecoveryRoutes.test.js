/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics Source-Available Commercial License; see the root LICENSE. */
'use strict';
/**
 * @module profile/test/employeeRecoveryRoutes
 * @description Verifies fixed recovery HTTP metadata and disabled capability defaults without starting a runtime.
 * @owner profile
 * @layer test
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const routes = require('../src/router/routers').profile.employeeRecovery;
const config = require('../config/properties');
test('recovery routes remain separate, opt-in and fixed to the authentication controller', () => {
    assert.equal(
        config.apiExposure.categories.profileEmployeeRecovery.enabled,
        false
    );
    const operations = {
        workspace: 'employeeRecoveryWorkspace',
        start: 'startEmployeeRecovery',
        verify: 'verifyEmployeeRecovery',
        resend: 'resendEmployeeRecovery',
        status: 'employeeRecoveryStatus',
        reset: 'completeEmployeeRecovery'
    };
    assert.deepEqual(
        Object.keys(routes).sort(),
        Object.keys(operations).sort()
    );
    for (const [name, operation] of Object.entries(operations)) {
        const route = routes[name];
        assert.equal(route.apiExposure, 'profileEmployeeRecovery');
        assert.equal(
            route.controller,
            'DefaultAuthenticationProviderController'
        );
        assert.equal(route.operation, operation);
        assert.equal(route.key, '/employee-recovery/' + name);
        assert.equal(route.method, name === 'workspace' ? 'GET' : 'POST');
        assert.equal(route.secured, false);
        assert.deepEqual(route.accessGroups, ['userGroup']);
        if (name !== 'workspace') {
            const schema = route.requestBody.content['application/json'].schema;
            assert.equal(schema.additionalProperties, false);
            if (schema.properties.password)
                assert.equal(schema.properties.password.writeOnly, true);
            if (schema.properties.continuation)
                assert.equal(schema.properties.continuation.writeOnly, true);
            assert.equal(schema.properties.enterpriseCode, undefined);
            assert.equal(schema.properties.roleCode, undefined);
        }
    }
});
