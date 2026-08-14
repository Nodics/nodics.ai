/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const assert = require('node:assert/strict');
const manifest = require('../package.json');
const platform = require('../nodics');

assert.equal(manifest.nodics.code, 'nodics.platform');
assert.equal(manifest.nodics.type, 'runtime-group');
assert.equal(manifest.nodics.extends, 'nodics.foundation');
assert.deepEqual(manifest.nodics.modules, ['nodics.platform.api']);
assert.equal(platform.descriptor.code, manifest.nodics.code);
assert.equal(platform.descriptor.type, manifest.nodics.type);
assert.equal(platform.descriptor.extends, manifest.nodics.extends);
assert.deepEqual(platform.descriptor.modules.map(item => item.code), manifest.nodics.modules);

console.log('nodics.platform contract validated');
