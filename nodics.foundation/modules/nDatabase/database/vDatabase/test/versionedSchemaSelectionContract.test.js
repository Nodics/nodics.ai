/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** Verifies that database versioning is selected per owning module schema. */
const assert = require('assert');

global._ = require('lodash');
global.CLASSES = {
    NodicsError: class NodicsError extends Error {
        constructor(code, message) {
            super(message || code);
            this.code = code;
        }
    }
};

const handler = require('../../src/service/schema/defaultDatabaseSchemaHandlerService');
const versionInterceptor = require('../src/service/interceptors/defaultVersionIdHandlerInterceptorService');
const databaseSchemas = require('../../src/schemas/schemas').default;
const versionedSchemas = require('../src/schemas/schemas').default;

const rawSchema = _.merge(_.merge({}, databaseSchemas), versionedSchemas);
rawSchema.user = {
    super: 'base',
    model: true,
    definition: {
        email: { type: 'string', required: true }
    }
};
rawSchema.catalog = {
    super: 'base',
    isVersionedEnabled: true,
    model: true,
    definition: {
        name: { type: 'string', required: true }
    }
};

const effective = handler.resolveModuleSchemaDependancy({
    moduleName: 'selectionContract',
    rawSchema: rawSchema
});

assert.strictEqual(effective.base.super, 'super');
assert.strictEqual(effective.user.versioned, undefined);
assert.strictEqual(effective.user.definition.versionId, undefined);
assert(effective.user.definition.code, 'ordinary schemas must still inherit base fields');
assert.strictEqual(effective.catalog.versioned, true);
assert(effective.catalog.definition.versionId, 'selected schemas must inherit the version field');
assert(effective.catalog.definition.code, 'selected schemas must retain base fields');
assert(effective.catalog.parents.includes('versioned'));

let ordinaryModel = { code: 'ordinary' };
let versionedModel = { code: 'versioned' };
const suppliedModels = [null, false, NaN, '', '0', -1, 0.5, Infinity, Number.MAX_SAFE_INTEGER + 1, 0, 1]
    .map(versionId => ({ code: 'supplied', versionId }));
const suppliedVersions = suppliedModels.map(model => model.versionId);
Promise.all([
    versionInterceptor.updateVersionId({ schemaModel: effective.user, model: ordinaryModel }, {}),
    versionInterceptor.updateVersionId({ schemaModel: effective.catalog, model: versionedModel }, {}),
    ...suppliedModels.map(model => versionInterceptor.updateVersionId({ schemaModel: effective.catalog, model }, {}))
]).then(() => {
    assert.strictEqual(ordinaryModel.versionId, undefined, 'ordinary schemas must not receive a version field from the interceptor');
    assert.strictEqual(versionedModel.versionId, 0, 'selected versioned schemas must receive their initial version');
    suppliedModels.forEach((model, index) => {
        assert(Object.is(model.versionId, suppliedVersions[index]), 'supplied versions must reach validation without coercion');
    });
});

const withoutVersionContract = _.merge({}, databaseSchemas);
withoutVersionContract.catalog = rawSchema.catalog;
assert.throws(() => handler.resolveModuleSchemaDependancy({
    moduleName: 'missingVersionContract',
    rawSchema: withoutVersionContract
}), /versioned database contract is not active/);

console.log('vDatabase per-schema version selection contract validated');
