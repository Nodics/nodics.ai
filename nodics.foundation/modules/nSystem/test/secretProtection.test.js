/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE file. */
'use strict';
const test = require('node:test'), assert = require('node:assert/strict'), crypto = require('node:crypto');
const service = require('../src/service/defaultSecretProtectionService');

/** @module nSystem/test/secretProtection @description Checks purpose-bound encryption, rotation and fail-closed private admission. @layer test @owner nSystem */
test('purpose envelopes authenticate scope, binding and key identity without exposing secrets', () => {
    const oldService = global.SERVICE, oldConfig = global.CONFIG;
    const ring = { activeKeyId: 'first', keys: { first: { encryptionKey: crypto.randomBytes(32).toString('hex') } } };
    let qualified = true;
    global.SERVICE = { DefaultLoggerService: { isRequestPrivacyQualified: () => qualified } };
    global.CONFIG = { get: () => ({ purposes: { TEST_SECRET: ring, OTHER_SECRET: ring } }) };
    const request = { tenant: 'default', purpose: 'TEST_SECRET', binding: { coupon: 'one', nested: { z: 2, a: 1 } }, value: 'private-token' };
    try {
        assert.equal(service.assertReady(request), true);
        const e = service.protect(request), again = service.protect(request);
        assert.notEqual(e.ciphertext, again.ciphertext);
        assert.equal(JSON.stringify(e).includes(request.value), false);
        assert.equal(service.unprotect({ ...request, envelope: e }), request.value);
        assert.equal(service.unprotect({ ...request, binding: { nested: { a: 1, z: 2 }, coupon: 'one' }, envelope: e }), request.value);
        ring.keys.alias = { ...ring.keys.first };
        assert.throws(() => service.unprotect({ ...request, envelope: { ...e, keyId: 'alias' } }), /REFUSED/);
        for (const change of [{ tenant: 'another' }, { purpose: 'OTHER_SECRET' }, { binding: { coupon: 'two' } },
            { envelope: { ...e, tag: '00'.repeat(16) } }, { envelope: { ...e, extra: true } },
            { envelope: { ...e, keyId: 'unknown' } }])
            assert.throws(() => service.unprotect({ ...request, envelope: e, ...change }), /^Error: SECRET_PROTECTION_REFUSED$/);
        ring.keys.second = { encryptionKey: crypto.randomBytes(32).toString('hex') }; ring.activeKeyId = 'second';
        assert.equal(service.protect(request).keyId, 'second');
        assert.equal(service.unprotect({ ...request, envelope: e }), request.value);
        delete ring.keys.first;
        assert.throws(() => service.unprotect({ ...request, envelope: e }), /REFUSED/);
        for (const invalid of [null, '', '00'.repeat(32), 'invalid', { $config: 'env' }]) {
            ring.keys.second.encryptionKey = invalid;
            assert.throws(() => service.assertReady(request), /REFUSED/);
        }
        ring.keys.second.encryptionKey = crypto.randomBytes(32).toString('hex'); qualified = false;
        assert.throws(() => service.protect(request), /REFUSED/);
        assert.throws(() => service.unprotect({ ...request, envelope: again }), /REFUSED/);
    } finally { global.SERVICE = oldService; global.CONFIG = oldConfig; }
});
