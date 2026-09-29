/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('node:assert/strict');
const test = require('node:test');
const router = require('../src/service/router/defaultRouterService');
const definitions = require('../src/router/routers');
/** @module nRouter/test/schemaRouteGroupContract @description Verifies selective group configuration fails closed without enabling broad CRUD. @layer test @owner nRouter */
global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };

test('explicit schema route groups replace broad defaults and allow keyed disablement', () => {
    assert.deepEqual(router.selectDefaultRouterGroups({ router: { groups: { schemaOperations: true } } }, definitions), ['schemaOperations']);
    assert.deepEqual(router.selectDefaultRouterGroups({ router: { groups: { schemaOperations: false } } }, definitions), []);
    assert.deepEqual(router.selectDefaultRouterGroups({ router: { groups: {} } }, definitions), []);
    assert(router.selectDefaultRouterGroups({ router: {} }, definitions).includes('commonGetterOperation'));
    for (const groups of [null, [], 'schemaOperations', { schemaOperations: 'true' }, { unknown: true }]) {
        assert.throws(() => router.selectDefaultRouterGroups({ router: { groups } }, definitions), { code: 'ERR_RTR_00003' });
    }
});

test('schema exposure harness is inert and restores caller state after success and assertion failure', () => {
    const globals = ['CONFIG', 'NODICS', 'SERVICE', 'UTILS', 'CLASSES'];
    const capture = () => globals.map(key => Object.getOwnPropertyDescriptor(global, key));
    const before = capture();
    const strings = Object.getOwnPropertyDescriptors(String.prototype);
    const verify = require('./helpers/schemaExposure.cjs');
    assert.deepEqual(capture(), before, 'import must be inert');
    const schema = { service: { enabled: true }, router: { enabled: true, groups: { schemaOperations: true } } };
    const fixture = { moduleName: 'independentOwner', schemaName: 'independentRecord', schema, exposed: true };
    verify([fixture, { ...fixture, schema: { ...schema, router: { enabled: false } }, exposed: false }]);
    assert.deepEqual(capture(), before);
    assert.deepEqual(Object.getOwnPropertyDescriptors(String.prototype), strings);
    assert.throws(() => verify([]), /Explicit owner schema fixtures/);
    assert.throws(() => verify([{ ...fixture, exposed: false }]), /remains service-only/);
    assert.deepEqual(capture(), before, 'failed fixture must restore globals');
    assert.deepEqual(Object.getOwnPropertyDescriptors(String.prototype), strings);
    assert.deepEqual(schema.router, { enabled: true, groups: { schemaOperations: true } }, 'caller schema stays unchanged');
});
