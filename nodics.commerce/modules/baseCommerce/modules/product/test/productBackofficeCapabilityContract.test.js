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

const root = path.resolve(__dirname, '../../../../../..');

global.SERVICE = {
    DefaultBackofficeCapabilityDefinitionService: require(path.join(
        root,
        'nodics.foundation/modules/nService/src/service/module/defaultBackofficeCapabilityDefinitionService.js'
    ))
};

const capability = require('../src/service/defaultProductBackofficeCapabilityService').getCapability();
const readiness = capability.navigation.find(item => item.id === 'make-product-sellable');
const readinessParent = capability.navigation.find(item => item.id === 'product-readiness');

assert(readiness, 'Product capability must publish Make Product Sellable navigation');
assert(readinessParent, 'Product capability must publish Product Readiness parent navigation');
assert.strictEqual(readiness.parentId, 'product-readiness');
assert.strictEqual(readiness.route, '/commerce/catalog/readiness');
assert.strictEqual(readiness.workbenchTarget.moduleName, 'product');
assert.strictEqual(readiness.workbenchTarget.schemaName, 'product');
assert.strictEqual(readinessParent.group.id, 'products-merchandising');
assert.strictEqual(readiness.featureState, 'ACTIVE');
assert(
    readiness.help.summary.includes('without moving domain ownership into Axis'),
    'Readiness summary must preserve backend ownership principle'
);

console.log('Product BackOffice capability contract passed');
