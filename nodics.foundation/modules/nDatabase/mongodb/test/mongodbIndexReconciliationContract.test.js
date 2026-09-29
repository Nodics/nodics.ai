/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module mongodb/test/mongodbIndexReconciliationContract
 * @description Verifies MongoDB index reconciliation compares index options as
 * well as fields so stale unique indexes can be replaced by configuration.
 * @layer test
 * @owner mongodb
 * @override Database provider modules may customize reconciliation, but must not
 * treat different index options as an equivalent live index.
 */

const assert = require('assert');

global.CLASSES = {
    NodicsError: class NodicsError extends Error {
        constructor(code, message) {
            super(message || code);
            this.code = code;
        }
    }
};

const service = require('../src/service/model/defaultMongodbDatabaseModelHandlerService');

let staleUniqueIndexes = [{
    name: 'tenant_1',
    key: { tenant: 1 },
    unique: true
}];
let plan = service.finalizeIndexes([{
    fields: { tenant: 1 },
    options: {}
}], staleUniqueIndexes, true);
assert.deepStrictEqual(plan.create, [{
    fields: { tenant: 1 },
    options: {}
}]);
assert.deepStrictEqual(plan.drop, ['tenant_1']);

let matchingNonUniqueIndexes = [{
    name: 'tenant_1',
    key: { tenant: 1 }
}];
plan = service.finalizeIndexes([{
    fields: { tenant: 1 },
    options: {}
}], matchingNonUniqueIndexes, true);
assert.deepStrictEqual(plan.create, []);
assert.deepStrictEqual(plan.drop || [], []);

let desiredUniqueIndexes = [{
    name: 'loginId_1',
    key: { loginId: 1 }
}];
plan = service.finalizeIndexes([{
    fields: { loginId: 1 },
    options: { unique: true }
}], desiredUniqueIndexes, true);
assert.deepStrictEqual(plan.create, [{
    fields: { loginId: 1 },
    options: { unique: true }
}]);
assert.deepStrictEqual(plan.drop, ['loginId_1']);

let staleCompoundUniqueIndexes = [{
    name: 'providerCode_1_enterpriseCode_1',
    key: { providerCode: 1, enterpriseCode: 1 },
    unique: true
}, {
    name: 'unrelated_1',
    key: { unrelated: 1 }
}];
plan = service.finalizeIndexes([{
    fields: { providerCode: 1, enterpriseCode: 1 },
    options: {}
}], staleCompoundUniqueIndexes, false);
assert.deepStrictEqual(plan.create, [{
    fields: { providerCode: 1, enterpriseCode: 1 },
    options: {}
}]);
assert.deepStrictEqual(plan.drop, ['providerCode_1_enterpriseCode_1']);

global.SERVICE = {
    DefaultNodicsPromiseService: {
        all: function (promises) {
            return Promise.all(promises);
        }
    }
};

async function verifyStaleIndexIsDroppedBeforeReplacementCreate() {
    const operations = [];
    const originalDropIndex = service.dropIndex;
    const originalCreateIndex = service.createIndex;
    service.dropIndex = function (model, name) {
        operations.push('drop:' + name);
        return Promise.resolve(name);
    };
    service.createIndex = function (model, indexData) {
        operations.push('create:' + Object.keys(indexData.fields).join(','));
        return Promise.resolve(indexData.fields);
    };
    try {
        await service.executeIndexPlan({ modelName: 'TestModel' }, {
            drop: ['tenant_1'],
            create: [{ fields: { tenant: 1 }, options: {} }]
        });
    } finally {
        service.dropIndex = originalDropIndex;
        service.createIndex = originalCreateIndex;
    }
    assert.deepStrictEqual(operations, ['drop:tenant_1', 'create:tenant'],
        'Stale indexes must be dropped before replacement indexes are created');
}

async function verifyDropCompletionAndFailureGateCreates() {
    let finishDrop;
    const operations = [];
    const subject = Object.assign({}, service, {
        dropIndex: function () {
            operations.push('drop-start');
            return new Promise(resolve => { finishDrop = resolve; });
        },
        createIndex: async function () { operations.push('create'); }
    });
    const pending = subject.executeIndexPlan({}, {
        drop: ['old'], create: [{ fields: { code: 1, versionId: 1 } }]
    });
    await Promise.resolve();
    assert.deepStrictEqual(operations, ['drop-start'], 'create must wait for drop completion, not just invocation');
    finishDrop('done');
    await pending;
    assert.deepStrictEqual(operations, ['drop-start', 'create']);
    operations.length = 0;
    subject.dropIndex = async function () { throw new Error('drop denied'); };
    await assert.rejects(subject.executeIndexPlan({}, {
        drop: ['old'], create: [{ fields: { code: 1 } }]
    }), /drop denied/);
    assert.deepStrictEqual(operations, [], 'failed drop must cause zero creates');
}

async function verifyDiscoveryFailureAndExplicitCleanupSelection() {
    global.CONFIG = { get: () => ({ default: { options: { cleanOrphan: true } } }) };
    global.UTILS = { isBlank: value => !value || !value.length };
    const model = {
        schemaName: 'example', tenant: 'tenant-a', channel: 'master',
        rawSchema: { schemaOptions: { 'tenant-a': { indexedFields: [{ fields: { code: 1 } }] } } },
        dataBase: { getOptions: () => ({ defaultIndexes: ['_id'] }) },
        indexes: callback => callback(null, [{ name: '_id_', key: { _id: 1 } }, { name: 'custom', key: { custom: 1 } }])
    };
    const plans = [];
    const subject = Object.assign({}, service, {
        executeIndexPlan: async function (selected, plan) { plans.push(plan); return plan; }
    });
    await subject.createIndexes(model, false);
    assert.deepStrictEqual(plans[0].drop, [], 'explicit false must override true inherited cleanup');
    await subject.createIndexes(model);
    assert.deepStrictEqual(plans[1].drop, ['custom'], 'omitted selection inherits cleanup without dropping _id');
    for (const [error, indexes] of [[new Error('index read denied'), []], [null, undefined], [null, {}]]) {
        model.indexes = callback => callback(error, indexes);
        await assert.rejects(subject.createIndexes(model, false));
    }
    assert.strictEqual(plans.length, 2, 'failed index discovery must never dispatch a plan');
}

async function verifyReadOnlyInstalledInspection() {
    const calls = [];
    const model = {
        tenant: 'tenant-a', versioned: false,
        rawSchema: { schemaOptions: { 'tenant-a': { indexedFields: [{ fields: { code: 1 }, options: { unique: true } }] } } },
        indexes: callback => callback(null, [{ name: 'code_1', key: { code: 1 }, unique: true, ns: 'private.database' }]),
        countDocuments: async query => { calls.push(query); return Object.keys(query).length ? 3 : 4; },
        dropIndex: () => { throw new Error('must not drop'); },
        insertOne: () => { throw new Error('must not insert'); }
    };
    const result = await service.inspectIndexes(model);
    assert.strictEqual(result.recordCount, 4);
    assert.strictEqual(result.missingVersionCount, 3);
    assert.strictEqual(result.indexes[0].ns, undefined);
    assert.deepStrictEqual(calls, [{}, { versionId: { $exists: false } }]);
    result.desiredIndexes[0].fields.code = -1;
    assert.strictEqual(model.rawSchema.schemaOptions['tenant-a'].indexedFields[0].fields.code, 1);
    model.indexes = callback => callback(new Error('unavailable'));
    await assert.rejects(service.inspectIndexes(model));
    assert.strictEqual(calls.length, 2, 'failed index discovery must not continue into count reads');
    model.indexes = callback => callback(null, []);
    model.countDocuments = async () => NaN;
    await assert.rejects(service.inspectIndexes(model), /inconsistent/);
}

async function verifyVersionedIndexTransitionRequiresMigration() {
    const desired = [{ fields: { code: 1, versionId: 1 }, options: { unique: true } }];
    const model = {
        versioned: true, schemaName: 'example', tenant: 'tenant-a', channel: 'master',
        rawSchema: { schemaOptions: { 'tenant-a': { indexedFields: desired } } },
        dataBase: { getOptions: () => ({ defaultIndexes: ['_id'] }) }
    };
    const plans = [];
    const subject = Object.assign({}, service, {
        executeIndexPlan: async function (selected, plan) { plans.push(plan); return plan; }
    });
    for (const key of [{ code: 1 }, { tenant: 1, productCode: 1, locale: 1 }]) {
        model.indexes = callback => callback(null, [{ name: 'legacy_unique', key, unique: true }]);
        await assert.rejects(subject.createIndexes(model, true), /migration/);
        await assert.rejects(subject.createIndexes(model, false), /migration/);
    }
    assert.strictEqual(plans.length, 0, 'automatic reconciliation cannot migrate installed uniqueness');
    model.indexes = callback => callback(null, [{ name: '_id_', key: { _id: 1 }, unique: true }]);
    await subject.createIndexes(model, true);
    assert.deepStrictEqual(plans[0].create, desired, 'new collections retain ordinary versioned setup');
    model.rawSchema.schemaOptions['tenant-a'].indexedFields = [{ fields: { code: 1 }, options: { unique: true } }];
    await assert.rejects(subject.createIndexes(model, true), /versionId/);
    assert.strictEqual(plans.length, 1, 'invalid desired versioned uniqueness cannot dispatch');
    model.versioned = false;
    await subject.createIndexes(model, false);
    assert.strictEqual(plans.length, 2, 'ordinary schemas keep existing reconciliation behavior');
}

async function verifyStartupDoesNotMigrateInstalledIdentity() {
    const calls = [];
    const schema = {
        versioned: true,
        schemaOptions: { 'tenant-a': { primaryKeys: ['code'], indexedFields: [
            { fields: { code: 1, versionId: 1 }, options: { unique: true } }
        ] } }
    };
    const model = { indexes: callback => callback(null, [{ name: 'code_1', key: { code: 1 }, unique: true }]) };
    const database = {
        getCollectionList: () => ['Example'],
        getConnection: () => ({ collection: () => model }),
        getOptions: () => ({ defaultIndexes: ['_id'] })
    };
    const subject = Object.assign({}, service, {
        LOG: { debug: () => {}, error: () => {} },
        executeIndexPlan: async () => { calls.push('plan'); return {}; },
        updateValidator: async () => { calls.push('validator'); }
    });
    const options = {
        modelName: 'Example', schemaName: 'example', tntCode: 'tenant-a', channel: 'master',
        moduleObject: { rawSchema: { example: schema } }
    };
    await assert.rejects(subject.retrieveModel(options, database), /Model metadata refresh failed/);
    assert.deepStrictEqual(calls, [], 'startup rejects before index changes or validator refresh');
    model.indexes = callback => callback(null, [
        { name: '_id_', key: { _id: 1 }, unique: true },
        { name: 'code_1_versionId_1', key: { code: 1, versionId: 1 }, unique: true }
    ]);
    assert.strictEqual(await subject.retrieveModel(options, database), model);
    assert.deepStrictEqual(calls, ['plan', 'validator']);
}

verifyStaleIndexIsDroppedBeforeReplacementCreate()
    .then(verifyDropCompletionAndFailureGateCreates)
    .then(verifyDiscoveryFailureAndExplicitCleanupSelection)
    .then(verifyReadOnlyInstalledInspection)
    .then(verifyVersionedIndexTransitionRequiresMigration)
    .then(verifyStartupDoesNotMigrateInstalledIdentity).then(() => {
    console.log('MongoDB index reconciliation contract validated');
}).catch(error => {
    console.error(error);
    process.exit(1);
});
