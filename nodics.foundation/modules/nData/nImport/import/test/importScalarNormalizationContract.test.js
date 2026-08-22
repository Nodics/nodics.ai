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
    version: '0',
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

global.NODICS = {
    getModule: function () {
        return {};
    },
    getModules: function () {
        return {
            catalog: { rawSchema: {} },
            promotion: {
                rawSchema: {
                    promotion: {
                        definition: {
                            validFrom: { type: 'date' },
                            revision: { type: 'int' }
                        }
                    }
                }
            }
        };
    }
};

const resolvedSchema = service.resolveRawSchema('composedPromotionHeader', 'promotion');
assert(resolvedSchema, 'schema fallback should resolve active-module raw schema');
const [resolvedModel] = service.normalizeModelsForSchema({ rawSchema: resolvedSchema }, [{
    validFrom: '2026-01-01T00:00:00.000Z',
    revision: '0'
}]);
assert(resolvedModel.validFrom instanceof Date);
assert.strictEqual(resolvedModel.validFrom.toISOString(), '2026-01-01T00:00:00.000Z');
assert.strictEqual(resolvedModel.revision, 0);

console.log('Import scalar normalization contract validated');
