/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module media/test/MediaRetainedStorageContract @description Exercises real temporary-file exclusive retention and registry fail-closed provider dispatch. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const local = require('../src/service/storage/provider/defaultLocalMediaStorageProviderService');
const registry = require('../src/service/storage/defaultMediaStorageProviderRegistryService');
const keyService = require('../src/service/storage/defaultMediaStorageKeyService');

test('local provider retains create-only bytes; ordinary overwrite, copy and delete reject reserved placements', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'nodics-media-retained-'));
    global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };
    global.SERVICE = { DefaultMediaStorageKeyService: { ...keyService, uuid: () => 'fixed-test-id' } };
    const provider = { ...local, resolveBasePath: () => root,
        resolveLocation(request) {
            const storageKey = request.storageKey || request.schemaName + '/' + request.mediaCode + '.png';
            return { providerCode: 'local', storageKey, internalAbsolutePath: path.join(root, storageKey) };
        } };
    try {
        const buffer = Buffer.from('retained bytes');
        const descriptor = await provider.storeRetained({ buffer, storageKey: 'untrusted', trustedStorageKey: true });
        assert.equal(descriptor.storageKey, 'mediaPublicationRetention/fixed-test-id.png');
        assert.deepEqual(await provider.read({ ...descriptor, maximumBytes: 100 }), buffer);
        await assert.rejects(provider.storeRetained({ buffer: Buffer.from('replacement') }), error => error.code === 'EEXIST');
        await assert.rejects(provider.store({ ...descriptor, buffer: Buffer.from('replacement') }), /cannot be mutated/);
        await assert.rejects(provider.remove(descriptor), /cannot be mutated/);
        await assert.rejects(provider.transfer({ ...descriptor, sourceStorageKey: descriptor.storageKey }), /cannot be mutated/);
        assert.deepEqual(await provider.read({ ...descriptor, maximumBytes: 100 }), buffer);
        const custom = { ...provider, resolveLocation: () => ({ providerCode: 'local', storageKey: 'unsafe.png', internalAbsolutePath: path.join(root, 'unsafe.png') }) };
        await assert.rejects(custom.storeRetained({ buffer }), /isolation/);
    } finally { await fs.rm(root, { recursive: true, force: true }); }
});

test('registry uses qualified retained method and never falls back to mutable provider store', async () => {
    let called = false;
    const base = { ...registry, resolveProvider: () => ({ code: 'local', policy: { provider: {}, storage: {} }, service: { store() { called = true; } } }) };
    assert.throws(() => base.storeRetained({}), /does not support/);
    assert.equal(called, false);
    const custom = { ...base, resolveProvider: () => ({ code: 'partner', policy: { provider: {}, storage: {} },
        service: { storeRetained: async request => ({ providerCode: request.providerCode, retained: true }) } }) };
    assert.deepEqual(await custom.storeRetained({}), { providerCode: 'partner', retained: true });
});
