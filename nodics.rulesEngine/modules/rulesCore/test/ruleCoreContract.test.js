/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const assert = require('assert');
const operators = require('../src/service/defaultRuleOperatorService');
const registry = require('../src/service/defaultRulePropertyCatalogueRegistryService');

assert.strictEqual(operators.evaluate('EQUALS', 'A', 'A'), true);
assert.strictEqual(operators.evaluate('IN', 'A', ['A','B']), true);
assert.strictEqual(operators.evaluate('BETWEEN', 5, 1, 10), true);
assert.strictEqual(operators.evaluate('CONTAINS_ALL', ['A','B','C'], ['A','C']), true);
assert.strictEqual(operators.evaluate('IS_NOT_AVAILABLE', undefined), true);
assert.throws(() => operators.evaluate('SCRIPT', 1, 1), /Unsupported/);

registry.reset();
const provider = {
    getCatalogue: () => ({ code: 'sample', properties: [{ code: 'sample.value' }] }),
    resolveProperty: request => ({ available: true, value: request.context.value, quality: 'CUSTOMER_CONFIRMED' })
};
assert.strictEqual(registry.registerProvider('sample', provider), true);
assert.strictEqual(registry.getCatalogue('sample').code, 'sample');
assert.strictEqual(registry.resolveProperty('sample', { context: { value: 7 } }).value, 7);
assert.throws(() => registry.registerProvider('sample', {}), /getCatalogue/);
assert.throws(() => registry.getProvider('missing'), /unavailable/);

console.log('Rules Core operator and provider registry contracts validated');
