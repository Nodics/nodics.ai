/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const assert = require('node:assert/strict');
const planner = require('../src/service/defaultDiscoveryPublicationPlannerService');

/** @module discoveryPublication/test/discoveryPublicationContract @description Verifies generic Discovery publication planning. @layer test @owner discoveryPublication */

global.CONFIG = { get: key => key === 'discovery' ? { publication: { defaultBatchSize: 25 } } : undefined };
let plan = planner.plan({ tenant: 'default', ownerType: 'PRODUCT', indexConfiguration: { code: 'productDiscovery', indexName: 'productlocalized' } });
assert.equal(plan.batchSize, 25);
assert.equal(plan.aliasSwitch, true);

console.log('Discovery publication contract validated');
