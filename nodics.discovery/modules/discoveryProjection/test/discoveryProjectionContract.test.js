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
const builder = require('../src/service/defaultDiscoveryDocumentBuilderService');

/** @module discoveryProjection/test/discoveryProjectionContract @description Verifies generic Discovery document projection. @layer test @owner discoveryProjection */

assert(schemas.discoveryProjection.discoveryDocumentProjection);
let doc = builder.build({ tenant: 'default', ownerType: 'PRODUCT', ownerCode: 'p1', indexConfigurationCode: 'productDiscovery', payload: { name: 'Product' } });
assert.equal(doc.code, 'PRODUCT|p1|productDiscovery');
assert.equal(doc.status, 'CURRENT');
assert(doc.sourceHash);

console.log('Discovery projection contract validated');
