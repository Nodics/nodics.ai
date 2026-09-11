/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @module database/test/schemaWorkbenchFormContract
 * @description Protects effective-schema business forms and later-layer customization.
 * @layer test
 * @owner nDatabase
 */
const assert = require('node:assert/strict');
const test = require('node:test');
const service = require('../src/service/schema/defaultSchemaWorkbenchService');
const defaults = require('../config/properties').schemaWorkbench;

global.CONFIG = { get: name => name === 'schemaWorkbench' ? defaults : undefined };
const effective = Object.assign({}, service, {
    buildFields: (_moduleName, schema) => Object.entries(schema.definition).map(([name, field]) => ({ name, ...field })),
});

test('project fields are appended, deleted fields disappear, and required fields cannot be hidden', () => {
    const schema = { definition: { name: { required: true }, customerNumber: {}, generated: { readOnly: true } } };
    const form = effective.buildForm('example', schema, { form: {
        hiddenFields: ['name'], sections: { basic: { label: 'Business details', fields: ['name', 'removedField'] } },
    } });
    assert.deepEqual(form.sections, [
        { id: 'basic', label: 'Business details', fields: ['name'] },
        { id: 'additional', label: 'Additional details', fields: ['customerNumber'] },
    ]);
    assert.deepEqual(form.hiddenFields, []);
    assert.equal(form.copy.reviewLabel, 'Review');
});

test('only an existing CREATE aggregate may manage required input fields', () => {
    const schema = { definition: { tenant: { required: true } } };
    const config = { form: { createOperation: 'setup', managedCreateFields: ['tenant'] } };
    assert.deepEqual(effective.buildForm('example', schema, config).managedCreateFields, []);
    config.aggregateOperations = { setup: { service: 'Owner', operation: 'setup', purpose: 'CREATE' } };
    const form = effective.buildForm('example', schema, config);
    assert.equal(form.createOperation, 'setup');
    assert.deepEqual(form.managedCreateFields, ['tenant']);
    assert.equal(JSON.stringify(form).includes('Owner'), false);
});

test('completion links cannot escape Axis and project copy can override defaults', () => {
    const schema = { definition: { name: {} } };
    const config = { form: { reviewLabel: 'Check details', completionAction: { label: 'Next', path: '//external.example' } } };
    const form = effective.buildForm('example', schema, config);
    assert.equal(form.completionAction, undefined);
    assert.equal(form.copy.reviewLabel, 'Check details');
});
