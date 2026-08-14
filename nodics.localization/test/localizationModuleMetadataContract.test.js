/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
const path = require('path');

const root = require(path.resolve(__dirname, '../../package.json'));
const foundation = require(path.resolve(__dirname, '../../nodics.foundation/modules/nLocalization/package.json'));

assert(root.workspaces.includes('nodics.localization'));
assert.strictEqual(foundation.name, 'nLocalization');
assert.strictEqual(foundation.index, '1.26');
assert.strictEqual(foundation.nodics.kind, 'capability');
assert.strictEqual(foundation.nodics.runtime.router, false);
assert.strictEqual(foundation.nodics.runtime.publish, false);

console.log('localizationModuleMetadataContract.test.js passed');
