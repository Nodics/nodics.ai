/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module loyaltyWallet/test/loyaltyWalletOwnerContract @description Verifies wallet owner normalization. @layer test @owner loyaltyWallet */
const assert = require('assert');
const ownerService = require('../src/service/defaultLoyaltyWalletOwnerService');

assert.deepStrictEqual(ownerService.normalize({ ownerType: 'customer', ownerCode: ' cust-001 ' }), {
    ownerType: 'CUSTOMER',
    ownerCode: 'cust-001'
});

assert.throws(() => ownerService.normalize({ ownerType: 'tenant', ownerCode: 'abc' }), /wallet ownerType is invalid/);
assert.throws(() => ownerService.normalize({ ownerType: 'customer' }), /wallet ownerCode is required/);

console.log('Loyalty wallet owner contract validated');
