/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const assert = require('node:assert/strict');
const schemas = require('../src/schemas/schemas');
const registry = require('../src/service/defaultDiscoverySourceRegistryService');

/** @module discoverySource/test/discoverySourceContract @description Verifies Discovery source provider registration. @layer test @owner discoverySource */

assert(schemas.discoverySource.discoverySourceProvider);
assert.equal(registry.register('PRODUCT', 'productSearchProjection', { list: async () => [] }), true);
assert(registry.resolve('PRODUCT', 'productSearchProjection'));

console.log('Discovery source contract validated');
