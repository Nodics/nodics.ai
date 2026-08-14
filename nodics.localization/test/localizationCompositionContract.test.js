/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const groupRoot = path.resolve(__dirname, '..');
const group = require('../package.json');
const core = require('../modules/localizationCore/package.json');
const api = require('../modules/localizationApi/package.json');

assert.strictEqual(group.nodics.kind, 'group');
assert.deepStrictEqual(group.nodics.extends, ['nodics.foundation']);
assert.deepStrictEqual(group.requiredModules, ['localizationCore', 'localizationApi']);
assert.strictEqual(group.nodics.functionalModule.identity, 'nodics.localization');
assert.strictEqual(group.nodics.functionalModule.protected, true);
assert.strictEqual(core.index, '40.10');
assert.strictEqual(api.index, '40.20');
assert.strictEqual(fs.existsSync(path.join(groupRoot, 'src')), false);

console.log('localizationCompositionContract.test.js passed');
