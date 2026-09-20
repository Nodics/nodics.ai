/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module backoffice/test/applicationTargetDefaults @description Proves shared technical targets, customer deployment selections and profile/node overrides. @layer test @owner backoffice */
const assert = require('node:assert/strict');
const test = require('node:test');
const service = require('../src/service/defaultBackofficeApplicationInitializationService');
const defaults = require('../config/properties').backofficeApplicationInitialization;
test('profile targets resolve through current deployment defaults and explicit profile differences', () => {
    let settings = {
        ...defaults,
        profiles: {
            warehouse: {
                code: 'warehouse',
                owner: 'customer.warehouse',
                applicationCode: 'warehouse',
                siteCode: 'warehouseSite',
                baselineCode: 'warehouse',
            },
        },
    };
    global.CONFIG = { get: () => settings };
    global.CLASSES = {
        NodicsError: class extends Error {
            constructor(code, message) {
                super(message);
                this.code = code;
            }
        },
    };
    assert.throws(() => service.profile('warehouse'), /unavailable/);
    settings.target = { ...defaults.target, connectionName: 'stagedContent' };
    const first = service.profile('warehouse');
    assert.equal(first.target.moduleName, 'cms');
    assert.equal(first.target.timeoutMs, 120000);
    assert.equal(first.target.connectionName, 'stagedContent');
    settings.target.connectionName = 'otherCustomerContent';
    assert.equal(service.profile('warehouse').target.connectionName, 'otherCustomerContent');
    assert.equal(first.target.connectionName, 'stagedContent');
    settings.profiles.warehouse.target = {
        connectionName: 'isolatedContent',
        timeoutMs: 20000,
    };
    assert.equal(service.profile('warehouse').target.connectionName, 'isolatedContent');
    assert.equal(service.profile('warehouse').target.timeoutMs, 20000);
    settings.profiles.warehouse.enabled = false;
    assert.throws(() => service.profile('warehouse'), /unavailable/);
    assert.throws(() => service.profile('../invalid'), /invalid/);
});

test('reset transport defaults do not select targets or relax deployment and authority boundaries', () => {
    const coordinator = require('../src/service/operations/defaultBackofficeLocalResetCoordinatorService');
    let policy = { ...require('../config/properties').backofficeLocalReset };
    global.CONFIG = { get: () => policy };
    assert.equal(policy.enabled, false);
    assert.deepEqual(coordinator.providers(), []);
    policy.providers = [
        {
            code: 'content',
            connectionName: 'contentStaged',
            targetAuthority: { server: 'contentServer' },
        },
    ];
    const providers = coordinator.providers();
    assert.equal(providers[0].moduleName, 'system');
    assert.equal(providers[0].connectionName, 'contentStaged');
    assert.deepEqual(providers[0].targetAuthority, { server: 'contentServer' });
    assert.equal(policy.providers[0].moduleName, undefined);
    policy.providers[0].connectionName = '';
    assert.throws(() => coordinator.providers(), /unavailable/);
});
