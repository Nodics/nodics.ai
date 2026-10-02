/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
global.SERVICE = {};

global.CLASSES = {
    NodicsError: class NodicsError extends Error {
        constructor(error, message, code) {
            super(message || (error && error.message) || String(error));
            this.code = code || (typeof error === 'string' ? error : undefined);
        }
    }
};

global.UTILS = {
    isBlank: function (value) {
        return value === undefined || value === null ||
            (typeof value === 'string' && value.length === 0) ||
            (Array.isArray(value) && value.length === 0) ||
            (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0);
    }
};

const baseModel = require('../../src/schemas/model').default;
const versionedModel = require('../src/schemas/model').default;

function modelWithItems(items, modernInsertResult) {
    return Object.assign({}, baseModel, versionedModel, {
        primaryKey: 'code',
        find: function () {
            return {
                sort: function () {
                    return this;
                },
                count: function () {
                    return Promise.resolve(items.length);
                },
                toArray: function (callback) {
                    callback(null, items.map(item => Object.assign({}, item)));
                }
            };
        },
        insertOne: function (model) {
            this.inserted = model;
            return Promise.resolve(modernInsertResult ? {
                acknowledged: true,
                insertedId: 'mongo-id-' + model.code
            } : {
                ops: [model]
            });
        },
        insertMany: function (models) {
            this.insertedMany = models;
            return Promise.resolve({
                insertedCount: models.length,
                ops: models
            });
        }
    });
}

async function validateVersionedSaveSupportsCurrentMongoInsertResult() {
    const schemaModel = modelWithItems([], true);
    const saved = await schemaModel.saveVersionedItems({
        query: { code: 'item-modern' },
        searchOptions: {},
        model: { code: 'item-modern', name: 'Modern', versionId: 0 }
    });
    assert.strictEqual(saved.code, 'item-modern');
    assert.strictEqual(saved.versionId, 0);
    assert.strictEqual(saved._id, 'mongo-id-item-modern');
}

async function validateVersionedSaveUsesGetItemsEnvelope() {
    const schemaModel = modelWithItems([{ code: 'item-1', name: 'Old', versionId: 2 }]);
    const saved = await schemaModel.saveVersionedItems({
        query: { code: 'item-1' },
        searchOptions: {},
        model: { code: 'item-1', name: 'New', versionId: 3 }
    });
    assert.strictEqual(saved.versionId, 3);
    assert.strictEqual(saved.name, 'New');
    assert.strictEqual(schemaModel.inserted.versionId, 3);
}

async function validateVersionedSaveAcceptsIdenticalReplay() {
    const existing = {
        code: 'item-replay',
        name: 'Existing',
        versionId: 0,
        created: new Date('2026-01-01T00:00:00.000Z'),
        updated: new Date('2026-01-01T00:00:00.000Z')
    };
    const schemaModel = modelWithItems([existing]);
    const saved = await schemaModel.saveVersionedItems({
        query: { code: 'item-replay' },
        searchOptions: {},
        model: Object.assign({}, existing, {
            created: new Date('2026-08-13T00:00:00.000Z'),
            updated: new Date('2026-08-13T00:00:00.000Z')
        })
    });
    assert.strictEqual(saved.code, 'item-replay');
    assert.strictEqual(saved.versionId, 0);
    assert.strictEqual(schemaModel.inserted, undefined, 'an identical replay must not create another version');
}

async function validateVersionedSaveRejectsChangedStaleReplay() {
    const schemaModel = modelWithItems([{ code: 'item-stale', name: 'Existing', versionId: 0 }]);
    await assert.rejects(schemaModel.saveVersionedItems({
        query: { code: 'item-stale' },
        searchOptions: {},
        model: { code: 'item-stale', name: 'Changed', versionId: 0 }
    }), /it should be: 1/);
}

async function validateVersionedUpdateUsesGetItemsEnvelope() {
    const schemaModel = modelWithItems([{ code: 'item-1', name: 'Old', versionId: 2 }]);
    const updated = await schemaModel.updateVersionedItems({
        query: { code: 'item-1' },
        searchOptions: {},
        model: { name: 'Updated' }
    });
    assert.strictEqual(updated.insertedCount, 1);
    assert.strictEqual(schemaModel.insertedMany[0].code, 'item-1');
    assert.strictEqual(schemaModel.insertedMany[0].name, 'Updated');
    assert.strictEqual(schemaModel.insertedMany[0].versionId, 3);
}

async function validateInvalidVersionIdentityHasNoPersistenceEffects() {
    for (const versionId of [undefined, null, '0', false, -1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
        const schemaModel = modelWithItems([]);
        let reads = 0;
        schemaModel.getItems = async function () { reads++; return { result: [] }; };
        await assert.rejects(schemaModel.saveVersionedItems({
            query: { code: 'invalid' }, model: { code: 'invalid', versionId }
        }), { code: 'ERR_MDL_00004' });
        assert.strictEqual(reads, 0, 'invalid version identity must reject before reading');
        assert.strictEqual(schemaModel.inserted, undefined);
    }
    const missing = modelWithItems([]);
    missing.getItems = async function () { throw new Error('must not read without a model'); };
    await assert.rejects(missing.saveVersionedItems({}), { code: 'ERR_MDL_00001' });
}

async function validateMalformedHistoryNeverBecomesEmptyHistory() {
    for (const response of [undefined, null, {}, { result: null }, { result: {} },
        { success: false, result: [] }, { error: new Error('unavailable'), result: [] }]) {
        const schemaModel = modelWithItems([]);
        schemaModel.getItems = async function () { return response; };
        await assert.rejects(schemaModel.saveVersionedItems({
            query: { code: 'history' }, model: { code: 'history', versionId: 0 }
        }), { code: 'ERR_MDL_00000' });
        await assert.rejects(schemaModel.updateVersionedItems({
            query: { code: 'history' }, model: { name: 'Changed' }
        }), { code: 'ERR_MDL_00000' });
        assert.strictEqual(schemaModel.inserted, undefined);
        assert.strictEqual(schemaModel.insertedMany, undefined);
    }
}

async function validateDirectArrayProviderOverrideAndEmptyHistory() {
    for (const response of [[], { result: [] }]) {
        const schemaModel = modelWithItems([]);
        schemaModel.getItems = async function () { return response; };
        const saved = await schemaModel.saveVersionedItems({
            query: { code: 'fresh' }, model: { code: 'fresh', versionId: 0 }
        });
        assert.strictEqual(saved.versionId, 0);
    }
    const schemaModel = modelWithItems([]);
    schemaModel.getItems = async function () { return [{ code: 'existing', versionId: 0 }]; };
    const saved = await schemaModel.saveVersionedItems({
        query: { code: 'existing' }, model: { code: 'existing', versionId: 1 }
    });
    assert.strictEqual(saved.versionId, 1);
}

async function validatePreviousVersionFailureNeverWrites() {
    const schemaModel = modelWithItems([]);
    let reads = 0;
    schemaModel.getItems = async function () {
        reads++;
        return reads === 1 ? { result: [{ code: 'existing', versionId: 1 }] } : {};
    };
    await assert.rejects(schemaModel.updateVersionedItems({
        query: { code: 'existing' }, model: { name: 'Changed' }
    }), { code: 'ERR_MDL_00000' });
    assert.strictEqual(reads, 2);
    assert.strictEqual(schemaModel.insertedMany, undefined);
}

async function validateProviderRejectionPropagatesUnchanged() {
    const schemaModel = modelWithItems([]);
    const failure = new Error('provider unavailable');
    schemaModel.getItems = async function () { throw failure; };
    await assert.rejects(schemaModel.saveVersionedItems({
        query: { code: 'existing' }, model: { code: 'existing', versionId: 0 }
    }), error => error === failure);
    assert.strictEqual(schemaModel.inserted, undefined);
}

async function validateStoredVersionIdentityBeforeWrites() {
    for (const versionId of [undefined, null, '0', false, -1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
        const schemaModel = modelWithItems([{ code: 'installed', versionId }]);
        await assert.rejects(schemaModel.saveVersionedItems({
            query: { code: 'installed' }, model: { code: 'installed', versionId: 1 }
        }), { code: 'ERR_MDL_00004' });
        await assert.rejects(schemaModel.updateVersionedItems({
            query: { code: 'installed' }, model: { name: 'Changed', versionId: 0 }
        }), { code: 'ERR_MDL_00004' });
        assert.strictEqual(schemaModel.inserted, undefined);
        assert.strictEqual(schemaModel.insertedMany, undefined);
    }
}

async function validateUpdatesCannotChooseHistoryIdentity() {
    for (const versionId of [0, 99, '2', null]) {
        const schemaModel = modelWithItems([{ code: 'installed', versionId: 2 }]);
        await schemaModel.updateVersionedItems({
            query: { code: 'installed' }, model: { name: 'Changed', versionId }
        });
        assert.strictEqual(schemaModel.insertedMany[0].versionId, 3);
    }
    const full = modelWithItems([{ code: 'installed', versionId: Number.MAX_SAFE_INTEGER }]);
    await assert.rejects(full.updateVersionedItems({
        query: { code: 'installed' }, model: { name: 'Changed' }
    }), { code: 'ERR_MDL_00004' });
    assert.strictEqual(full.insertedMany, undefined);
    const replay = await full.saveVersionedItems({
        query: { code: 'installed' }, model: { code: 'installed', versionId: Number.MAX_SAFE_INTEGER }
    });
    assert.strictEqual(replay.versionId, Number.MAX_SAFE_INTEGER);
    assert.strictEqual(full.inserted, undefined);
}

async function validateMalformedRowsAndReadIsolation() {
    for (const row of [null, false, 'record', []]) {
        const schemaModel = modelWithItems([]);
        schemaModel.getItems = async () => ({ result: [row] });
        await assert.rejects(schemaModel.saveVersionedItems({
            query: { code: 'installed' }, model: { code: 'installed', versionId: 1 }
        }), { code: 'ERR_MDL_00000' });
        assert.strictEqual(schemaModel.inserted, undefined);
    }
    const previous = { code: 'installed', name: 'Original', versionId: 2 };
    const schemaModel = modelWithItems([]);
    schemaModel.getItems = async () => ({ result: [previous] });
    await schemaModel.updateVersionedItems({ query: { code: 'installed' }, model: { name: 'Changed' } });
    assert.deepStrictEqual(previous, { code: 'installed', name: 'Original', versionId: 2 });
    await schemaModel.saveVersionedItems({
        query: { code: 'installed' }, model: { code: 'installed', name: 'Saved', versionId: 3 }
    });
    assert.deepStrictEqual(previous, { code: 'installed', name: 'Original', versionId: 2 });
}

async function validateLaterLayerValidationAndBatchFailure() {
    const schemaModel = modelWithItems([]);
    let reads = 0;
    schemaModel.getItems = async function () {
        reads++;
        if (reads === 1) return [{ code: 'first', versionId: 0 }, { code: 'second', versionId: 0 }];
        return reads === 2 ? [{ code: 'first', versionId: 0 }] : [{ code: 'second' }];
    };
    await assert.rejects(schemaModel.updateVersionedItems({
        query: {}, model: { name: 'Changed' }
    }), { code: 'ERR_MDL_00004' });
    assert.strictEqual(schemaModel.insertedMany, undefined, 'a later invalid record prevents the complete batch insert');
    const custom = modelWithItems([{ code: 'existing', versionId: 0 }]);
    const error = new Error('later-layer validation denied');
    custom.getStoredVersionId = function () { throw error; };
    await assert.rejects(custom.saveVersionedItems({
        query: { code: 'existing' }, model: { code: 'existing', versionId: 1 }
    }), failure => failure === error);
    await assert.rejects(custom.updateVersionedItems({
        query: { code: 'existing' }, model: { name: 'Changed' }
    }), failure => failure === error);
    assert.strictEqual(custom.inserted, undefined);
    assert.strictEqual(custom.insertedMany, undefined);
}

/** Qualifies unique logical selection, stale-read rejection and identity preservation before bulk insertion. */
async function validateUpdateSelectionSafety() {
    const rows = [{ code: 'same', versionId: 0 }, { code: 'same', versionId: 1 }];
    const latestRow = rows[1];
    const model = modelWithItems([]);
    let reads = 0;
    model.getItems = async () => ++reads === 1 ? { result: rows } : { result: [latestRow] };
    await model.updateVersionedItems({ query: {}, model: { name: 'Changed' } });
    assert.strictEqual(model.insertedMany.length, 1, 'one successor per logical identity');
    assert.strictEqual(model.insertedMany[0].versionId, 2);
    assert.strictEqual(reads, 2);
    assert.strictEqual(rows.length, 2, 'selection must not consume provider arrays');

    for (const latest of [[], [{ code: 'same', versionId: 2 }], [{ code: 'other', versionId: 1 }]]) {
        const stale = modelWithItems([]);
        let calls = 0;
        stale.getItems = async () => ++calls === 1 ? [rows[1]] : latest;
        await assert.rejects(stale.updateVersionedItems({ query: {}, model: { name: 'Changed' } }));
        assert.strictEqual(stale.insertedMany, undefined, 'changed/disappeared identities must not be retargeted');
    }
    for (const patch of [{ code: 'renamed' }, { _id: 'injected' }]) {
        const invalid = modelWithItems([{ code: 'same', versionId: 1 }]);
        await assert.rejects(invalid.updateVersionedItems({ query: {}, model: patch }));
        assert.strictEqual(invalid.insertedMany, undefined);
    }
    const missing = modelWithItems([{ versionId: 1 }]);
    await assert.rejects(missing.updateVersionedItems({ query: {}, model: { name: 'Changed' } }));
    assert.strictEqual(missing.insertedMany, undefined);

    const context = {};
    const session = {};
    const scoped = modelWithItems([]);
    const original = { code: 'same', versionId: 1, _id: 'old-id' };
    const requests = [];
    scoped.getItems = async request => { requests.push(request); return [original]; };
    scoped.transactionOptions = request => {
        assert.strictEqual(request.transactionContext, context);
        return { session };
    };
    scoped.insertMany = async (models, options) => {
        assert.strictEqual(options.session, session);
        assert.strictEqual(models[0]._id, undefined);
        assert.strictEqual(original._id, 'old-id');
        return { insertedCount: models.length };
    };
    await scoped.updateVersionedItems({ query: {}, model: { code: 'same' }, transactionContext: context });
    assert.ok(requests.every(request => request.transactionContext === context));
    assert.deepStrictEqual(requests[1].searchOptions.collation, { locale: 'simple' });
    const conflict = Object.assign(new Error('unique identity conflict'), { code: 11000 });
    let inserts = 0;
    scoped.insertMany = async () => { inserts++; throw conflict; };
    await assert.rejects(scoped.updateVersionedItems({ query: {}, model: {}, transactionContext: context }), error => error === conflict);
    assert.strictEqual(inserts, 1, 'a concurrent successor must not be retried against newer history');
}

/** Successor patches replace supplied arrays recursively while retaining omitted fields and BSON values. */
async function validateSuccessorArrayReplacement() {
    const BSON = require('bson');
    const bytes = value => BSON.serialize(value).toString('hex');
    const retained = { identifier: new BSON.ObjectId(), timestamp: new Date('2026-01-02T03:04:05Z'),
        counter: BSON.Long.fromString('9007199254740993'), amount: BSON.Decimal128.fromString('3.125'),
        binary: new BSON.Binary(Buffer.from([0, 127, 255]), 128) };
    const previous = { _id: new BSON.ObjectId(), code: 'array-policy', versionId: 7,
        members: ['keep', 'remove'], policy: { rules: ['old', 'stale'], omitted: ['inherited'],
            deep: { allowed: ['obsolete'], enabled: true } },
        objects: [{ name: 'old', stale: true }, { name: 'extra' }], retained };
    const patch = { members: ['keep'], policy: { rules: [], deep: { allowed: [] } },
        objects: [{ name: 'new', value: new BSON.ObjectId() }], versionId: 999 };
    const previousBytes = bytes(previous);
    const patchBytes = bytes(patch);
    const model = modelWithItems([]);
    model.getItems = async () => ({ result: [previous] });
    const originalMerge = model.mergeNextVersion;
    let helperCalls = 0;
    model.mergeNextVersion = function (old, incoming, options) {
        helperCalls++;
        assert.strictEqual(options.replaceArraysOnVersionMerge, true);
        return originalMerge.call(this, old, incoming, options);
    };
    await model.updateVersionedItems({ query: { code: previous.code }, model: patch,
        options: { replaceArraysOnVersionMerge: false } });
    const next = model.insertedMany[0];
    assert.strictEqual(helperCalls, 1, 'updates reuse the existing overridable data-record merge helper');
    assert.deepStrictEqual(next.members, ['keep']);
    assert.deepStrictEqual(next.policy, { rules: [], omitted: ['inherited'], deep: { allowed: [], enabled: true } });
    assert.strictEqual(next.objects.length, 1);
    assert.strictEqual(next.objects[0].stale, undefined, 'array objects are replaced, not merged by index');
    assert.strictEqual(bytes({ objects: next.objects }), bytes({ objects: patch.objects }));
    assert.strictEqual(bytes(next.retained), bytes(retained), 'BSON types and values must survive inherited fields');
    assert.strictEqual(next.versionId, 8, 'the patch cannot choose successor identity');
    assert.strictEqual(next._id, undefined);
    assert.strictEqual(next.code, previous.code);
    assert.strictEqual(bytes(previous), previousBytes, 'stored history must remain unchanged');
    assert.strictEqual(bytes(patch), patchBytes, 'caller patch must remain unchanged');
    next.members.push('isolated');
    next.objects[0].name = 'isolated';
    next.policy.omitted.push('isolated');
    assert.strictEqual(bytes(previous), previousBytes, 'successor must not alias prior arrays');
    assert.strictEqual(bytes(patch), patchBytes, 'successor must not alias supplied arrays');

    const stale = modelWithItems([]);
    let reads = 0;
    stale.getItems = async () => ({ result: [++reads === 1 ? previous : { ...previous, versionId: 8 }] });
    await assert.rejects(stale.updateVersionedItems({ query: {}, model: patch }), error => error.code === 'ERR_MDL_00004');
    assert.strictEqual(stale.insertedMany, undefined, 'array replacement must not bypass stale selection rejection');
    const conflict = Object.assign(new Error('successor already exists'), { code: 11000 });
    let attempts = 0;
    model.insertMany = async () => { attempts++; throw conflict; };
    await assert.rejects(model.updateVersionedItems({ query: {}, model: patch }), error => error === conflict);
    assert.strictEqual(attempts, 1, 'array updates must not rebase or retry conflicting successors');
    assert.strictEqual(bytes(previous), previousBytes);
    assert.strictEqual(bytes(patch), patchBytes);
}

validateVersionedSaveUsesGetItemsEnvelope()
    .then(validateVersionedSaveSupportsCurrentMongoInsertResult)
    .then(validateVersionedSaveAcceptsIdenticalReplay)
    .then(validateVersionedSaveRejectsChangedStaleReplay)
    .then(validateVersionedUpdateUsesGetItemsEnvelope)
    .then(validateInvalidVersionIdentityHasNoPersistenceEffects)
    .then(validateMalformedHistoryNeverBecomesEmptyHistory)
    .then(validateDirectArrayProviderOverrideAndEmptyHistory)
    .then(validatePreviousVersionFailureNeverWrites)
    .then(validateProviderRejectionPropagatesUnchanged)
    .then(validateStoredVersionIdentityBeforeWrites)
    .then(validateUpdatesCannotChooseHistoryIdentity)
    .then(validateMalformedRowsAndReadIsolation)
    .then(validateLaterLayerValidationAndBatchFailure)
    .then(validateUpdateSelectionSafety)
    .then(validateSuccessorArrayReplacement)
    .then(() => {
        console.log('vMongodb versioned model contract validated');
    })
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
