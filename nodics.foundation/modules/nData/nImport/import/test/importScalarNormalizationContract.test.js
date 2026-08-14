/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module import/test/importScalarNormalizationContract
 * @description Verifies finalized import payloads are normalized against the
 * effective schema before generated persistence receives them.
 * @layer test
 * @owner import
 * @override Later import format modules may add richer parsing while preserving
 * schema-aware scalar normalization before persistence.
 */

const assert = require('assert');

const service = require('../src/service/process/model/defaultModelImportProcessService');

const header = {
    rawSchema: {
        definition: {
            validatedAt: { type: 'date' },
            version: { type: 'int' },
            enabled: { type: 'bool' },
            ratio: { type: 'number' },
            name: { type: 'string' }
        }
    }
};

const [model] = service.normalizeModelsForSchema(header, [{
    validatedAt: '2026-08-11T00:00:00.000Z',
    version: '3',
    enabled: 'true',
    ratio: '1.5',
    name: 'Nexus'
}]);

assert(model.validatedAt instanceof Date);
assert.strictEqual(model.validatedAt.toISOString(), '2026-08-11T00:00:00.000Z');
assert.strictEqual(model.version, 3);
assert.strictEqual(model.enabled, true);
assert.strictEqual(model.ratio, 1.5);
assert.strictEqual(model.name, 'Nexus');

console.log('Import scalar normalization contract validated');
