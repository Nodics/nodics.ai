/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/*
 * Nodics - Enterprise Micro-Services Management Framework
 * Copyright (c) 2026 Nodics. Governed by the root LICENSE file.
 */

/**
 * @module import/test/genericImportDefaultValidation
 * @description Checks generic import requirements against owner-declared persistence defaults.
 * @layer test
 * @owner import
 * @override Extend for additional effective schema default contracts without materializing defaults in import files.
 */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const service = require('../src/service/import/defaultImportService');
const database = require('../../../../nDatabase/database/src/schemas/schemas');
const editorial = require('../../../../../../nodics.wcms/modules/editorial/src/schemas/schemas');

test('real Editorial author import asks for business fields while persistence owns declared defaults', () => {
    const definition = {
        ...database.default.super.definition,
        ...editorial.editorial.editorialAuthor.definition,
    };
    const validator = Object.assign({}, service, {
        resolveRawSchema: () => ({ definition }),
    });
    const model = { code: 'local-import-author', status: 'DRAFT' };
    const input = {
        header: {
            options: { genericSchemaImport: true, moduleName: 'editorial', schemaName: 'editorialAuthor', operation: 'saveAll' },
            query: { code: '$code' },
        },
        models: { author: model },
    };
    const errors = validator.validateFinalizedFileSchemaProperties({ tenant: 'default' }, 'author.js', input);
    assert.deepEqual(errors.map(error => error.propertyName), ['displayName']);
    assert.deepEqual(model, { code: 'local-import-author', status: 'DRAFT' });
    model.displayName = 'Local Import Review Team';
    assert.deepEqual(validator.validateFinalizedFileSchemaProperties({ tenant: 'default' }, 'author.js', input), []);
    assert.equal(Object.hasOwn(model, 'created'), false);
    assert.equal(Object.hasOwn(model, 'updated'), false);
});

test('false and zero defaults are supplied by the owner; absent or empty defaults still need input', () => {
    assert.deepEqual(service.requiredSchemaProperties({
        enabled: { required: true, default: false },
        count: { required: true, default: 0 },
        name: { required: true },
        nullDefault: { required: true, default: null },
        emptyDefault: { required: true, default: '' },
        undefinedDefault: { required: true, default: undefined },
        managed: { required: true, readOnly: true },
    }), ['name', 'nullDefault', 'emptyDefault', 'undefinedDefault']);
});
