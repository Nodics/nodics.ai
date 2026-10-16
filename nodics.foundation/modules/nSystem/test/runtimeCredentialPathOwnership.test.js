/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module nSystem/test/runtimeCredentialPathOwnership @description Proves credential selectors derive the same masked-read and persisted-write path without credential copies. @owner nSystem @layer test */
const test = require('node:test');
const assert = require('node:assert/strict');
const service = require('../src/service/config/defaultRuntimeConfigurationSchemaService');

test('logical credential names remain indivisible and independent of identity/delivery schema names', (t) => {
    const previous = { CONFIG: global.CONFIG, CLASSES: global.CLASSES };
    t.after(() => Object.assign(global, previous));
    global.CLASSES = {
        NodicsError: class extends Error {
            constructor(code, message) {
                super(message);
                this.code = code;
            }
        },
    };
    const properties = {
        credentials: { 'example.identity': { value: 'synthetic-token' } },
    };
    global.CONFIG = { get: (key) => properties[key] };
    const field = {
        code: 'botToken',
        credentialReference: 'example.identity',
        sensitive: true,
    };
    assert.deepEqual(service.resolveFieldPath(field), [
        'credentials',
        'example.identity',
        'value',
    ]);
    assert.equal(service.resolveFieldValue(field), 'synthetic-token');
    const isolated = {
        ...service,
        decryptSensitiveValue: () => 'synthetic-replacement',
    };
    const patch = isolated.createEffectiveRuntimePatch(
        {
            tenant: 'tenant-a',
            fields: { botToken: { sensitive: true, encryptedValue: {} } },
        },
        { fields: [field] },
    );
    assert.deepEqual(patch, {
        credentials: { 'example.identity': { value: 'synthetic-replacement' } },
    });
    assert.equal(field.path, undefined);
    assert.notDeepEqual(
        service.resolveFieldPath({
            ...field,
            credentialReference: 'example.delivery',
        }),
        service.resolveFieldPath(field),
    );
    assert.throws(
        () =>
            service.resolveFieldPath({
                ...field,
                path: ['credentials', 'foreign', 'value'],
            }),
        (error) => error.code === 'ERR_SYS_00002',
    );
    for (const credentialReference of [
        '',
        {},
        'constructor.secret',
        '../escape',
    ]) {
        assert.throws(() =>
            service.resolveFieldPath({ ...field, credentialReference }),
        );
    }
    assert.deepEqual(
        service.resolveFieldPath({ path: ['feature', 'enabled'] }),
        ['feature', 'enabled'],
    );
});
