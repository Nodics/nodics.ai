/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const assert = require('node:assert/strict');

/**
 * @module nodics.discovery/test/discoveryModuleStructureContract
 * @description Verifies Discovery is a generic multi-module group and not a Commerce-specific implementation bucket.
 * @layer test
 * @owner nodics.discovery
 */

const discovery = require('../package.json');

assert.equal(discovery.name, 'nodics.discovery');
assert.equal(discovery.nodics.functionalModule.identity, 'nodics.discovery');
assert.deepEqual(discovery.requiredModules, [
    'discoveryConfig',
    'discoverySource',
    'discoveryMapping',
    'discoveryProjection',
    'discoveryPublication',
    'discoveryQuery',
    'discoveryRanking',
    'discoveryRuntime'
]);
assert(!discovery.requiredModules.includes('productSearch'));
assert(!discovery.requiredModules.includes('wcmsSearch'));

console.log('Discovery module structure contract validated');
