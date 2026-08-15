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
const policy = require('../src/service/defaultDiscoveryFieldPolicyService');

/** @module discoveryMapping/test/discoveryMappingContract @description Verifies Discovery field policy contracts. @layer test @owner discoveryMapping */

assert(schemas.discoveryMapping.discoveryFieldMapping);
assert.deepEqual(policy.filterDisplayDocument({ displayFields: ['code', 'name'], sensitiveFields: ['sku'] }, { code: 'p1', name: 'Product', sku: 'secret' }), { code: 'p1', name: 'Product' });

console.log('Discovery mapping contract validated');
