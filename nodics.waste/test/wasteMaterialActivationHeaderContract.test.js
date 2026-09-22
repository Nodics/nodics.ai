/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module nodics.waste/test/wasteMaterialActivationHeaderContract @description Verifies Waste Material activation imports declare a governed writer group. @layer test @owner nodics.waste */
const assert = require('node:assert/strict');

const header = require('../modules/wasteMaterial/data/core-v001/headers/material/wasteMaterialCoreHeader');

Object.entries(header.wasteMaterial).forEach(([entryCode, entry]) => {
    assert.deepEqual(
        entry.options.userGroups,
        ['adminGroup'],
        `${entryCode} must declare an import writer group for runtime-bound activation imports`
    );
});

console.log('Waste Material activation header contract validated');
