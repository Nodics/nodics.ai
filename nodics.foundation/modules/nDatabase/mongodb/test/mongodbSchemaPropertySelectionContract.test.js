/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module mongodb/test/SchemaPropertySelectionContract @description Verifies keyed MongoDB property inheritance, removal and zero-valued constraints. @layer test @owner mongodb */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const _ = require('lodash');
const service = require('../src/service/model/defaultMongodbDatabaseModelHandlerService');
const defaults = require('../config/properties').database.default.mongodb.options.schemaProperties;
global.UTILS = { isBlank: value => value == null || typeof value === 'object' && Object.keys(value).length === 0 };
global.CLASSES = { NodicsError: class extends Error { constructor(error, message) { super(message, { cause: error }); } } };

function options(selection) {
    return { tntCode: 'tenant-one', schemaName: 'measurement', dataBase: { master: { getOptions: () => ({ schemaProperties: selection }) } },
        moduleObject: { rawSchema: { measurement: { model: true, definition: {
            value: { type: 'number', minimum: 0, maximum: 10, exclusiveMaximum: false },
            label: { type: 'string', pattern: '^allowed$' }
        } } } } };
}

test('later layers disable one MongoDB constraint without copying the inherited set', async () => {
    const selected = _.merge({}, defaults, { pattern: false });
    const input = options(selected);
    await service.prepareDatabaseOptions(input);
    const fields = input.moduleObject.rawSchema.measurement.schemaOptions['tenant-one'].options.validator.$jsonSchema.properties;
    assert.equal(fields.value.minimum, 0);
    assert.equal(fields.value.maximum, 10);
    assert.equal(fields.value.exclusiveMaximum, false);
    assert.equal(fields.label.pattern, undefined);
    assert.equal(defaults.pattern, true);
});

test('malformed or retired array selections fail instead of silently dropping validation', async () => {
    for (const value of [['minimum'], { minimum: 'true' }, 'minimum', null, false]) {
        await assert.rejects(service.prepareDatabaseOptions(options(value)), error => /keyed object/.test(error.cause.message));
    }
});
