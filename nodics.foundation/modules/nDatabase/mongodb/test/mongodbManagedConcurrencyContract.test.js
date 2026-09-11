/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module mongodb/test/mongodbManagedConcurrencyContract @description Verifies atomic provider writes and transaction propagation for managed counters. @layer test @owner mongodb */
'use strict';
const assert = require('node:assert/strict');
const { test } = require('node:test');
const provider = require('../src/schemas/model').default;
global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };

test('managed updates return the driver document with original selector, no upsert, and the transaction session', async () => {
    const session = {};
    const context = {};
    const persisted = { code: 'one', revision: 5, value: 'business value' };
    const adapter = { ...provider, normalizeModelForWrite: value => value,
        transactionOptions: input => { assert.equal(input.transactionContext, context); return { session }; },
        findOneAndUpdate: async (query, update, options) => {
            assert.deepEqual(query, { code: 'one', owner: 'alice', revision: 4 });
            assert.deepEqual(update, { $set: { revision: 5, value: 'business value' } });
            assert.deepEqual(options, { session, upsert: false, returnDocument: 'after', includeResultMetadata: true });
            return { value: persisted, ok: 1 };
        }
    };
    assert.equal(await adapter.compareAndSetItem({ operation: 'update', transactionContext: context,
        query: { code: 'one', owner: 'alice', revision: 4 }, model: { revision: 5, value: 'business value' } }), persisted);
    adapter.findOneAndUpdate = async () => ({ value: null, ok: 1 });
    assert.equal(await adapter.compareAndSetItem({ operation: 'update', transactionContext: context, query: {}, model: {} }), null);
});

test('managed creates validate before insert and translate duplicate identities into conflicts', async () => {
    let validated = 0;
    global.SERVICE = { DefaultModelValidatorService: {
        validateMandate: async () => { validated++; }, validateDataType: async () => { validated++; }
    } };
    const adapter = { ...provider, rawSchema: {}, transactionOptions: () => ({}), normalizeModelForWrite: value => value,
        insertOne: async model => { assert.equal(validated, 2); assert.equal(model.revision, 1); return { acknowledged: true, insertedId: 'id' }; }
    };
    assert.deepEqual(await adapter.compareAndSetItem({ operation: 'create', model: { code: 'one', revision: 1 } }),
        { code: 'one', revision: 1, _id: 'id' });
    adapter.insertOne = async () => { throw { code: 11000 }; };
    await assert.rejects(adapter.compareAndSetItem({ operation: 'create', model: {} }), { code: 'ERR_CONCURRENCY_00001' });
});

test('managed removal is one conditional provider operation and returns the removed record', async () => {
    const previous = { code: 'one', revision: 2 };
    const adapter = { ...provider, transactionOptions: () => ({}), findOneAndDelete: async (query, options) => {
        assert.deepEqual(query, previous); assert.equal(options.includeResultMetadata, true);
        return { value: previous, ok: 1 };
    } };
    assert.equal(await adapter.compareAndSetItem({ operation: 'remove', query: previous }), previous);
});
