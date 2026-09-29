/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
test('eWaste owns the Waste core-reference destination and data classification', () => {
    const section = require('../data/manifest.json').sections['core-reference'];
    assert.equal(section.destinationRole, 'WASTE');
    assert.equal(section.dataType, 'core');
});
