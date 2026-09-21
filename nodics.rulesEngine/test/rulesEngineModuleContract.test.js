/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const assert = require('assert');
const path = require('path');

const root = path.resolve(__dirname, '..');
const group = require(path.join(root, 'package.json'));

assert.strictEqual(group.name, 'nodics.rulesEngine');
assert.strictEqual(group.nodics.kind, 'group');
assert.strictEqual(group.nodics.functionalModule.identity, 'nodics.rulesEngine');
assert.deepStrictEqual(group.requiredModules, ['rulesCore','rulesDefinition','rulesEvaluation','rulesApi']);
assert.strictEqual(group.nodics.runtime.router, false);

const expected = {
    rulesCore: false,
    rulesDefinition: false,
    rulesEvaluation: false,
    rulesApi: true
};
Object.entries(expected).forEach(([name, router]) => {
    const pkg = require(path.join(root, 'modules', name, 'package.json'));
    assert.strictEqual(pkg.nodics.kind, 'capability', name + ' must be a capability');
    assert.strictEqual(pkg.nodics.runtime.router, router, name + ' router ownership mismatch');
});
console.log('Rules Engine functional module composition contract validated');
