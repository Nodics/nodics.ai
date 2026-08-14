/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module mongodb/test/mongodbBsonTypeMappingContract
 * @description Verifies Nodics numeric schema intent does not create an
 * over-strict MongoDB JSON-schema validator that rejects normal JavaScript
 * numeric writes from generated services and data import.
 * @layer test
 * @owner mongodb
 * @override Database provider modules may customize storage-specific scalar
 * mappings while preserving Nodics schema type semantics.
 */

const assert = require('assert');

const service = require('../src/service/model/defaultMongodbDatabaseModelHandlerService');

assert.deepStrictEqual(service.resolveBsonType('int'), ['int', 'long', 'double', 'decimal']);
assert.deepStrictEqual(service.resolveBsonType('integer'), ['int', 'long', 'double', 'decimal']);
assert.deepStrictEqual(service.resolveBsonType('number'), ['int', 'long', 'double', 'decimal']);
assert.deepStrictEqual(service.resolveBsonType('float'), ['int', 'long', 'double', 'decimal']);
assert.deepStrictEqual(service.resolveBsonType('double'), ['int', 'long', 'double', 'decimal']);
assert.strictEqual(service.resolveBsonType('boolean'), 'bool');
assert.strictEqual(service.resolveBsonType('bool'), 'bool');
assert.strictEqual(service.resolveBsonType('string'), 'string');

console.log('MongoDB BSON type mapping contract validated');
