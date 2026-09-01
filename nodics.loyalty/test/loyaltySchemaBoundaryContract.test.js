/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nodics.loyalty/test/loyaltySchemaBoundaryContract @description Verifies wallet ownership and tenant-context schema boundaries. @layer test @owner nodics.loyalty */
const assert = require('assert');
const path = require('path');

const moduleRoot = path.resolve(__dirname, '..');
const schemaFiles = [
    'modules/loyaltyCore/src/schemas/schemas.js',
    'modules/loyaltyProgram/src/schemas/schemas.js',
    'modules/loyaltyRewardType/src/schemas/schemas.js',
    'modules/loyaltyWallet/src/schemas/schemas.js',
    'modules/loyaltyLedger/src/schemas/schemas.js',
    'modules/loyaltyReservation/src/schemas/schemas.js',
    'modules/loyaltyRedemption/src/schemas/schemas.js'
];

const schemas = schemaFiles.flatMap(file => {
    const contributed = require(path.join(moduleRoot, file));
    return Object.keys(contributed).flatMap(namespace => Object.keys(contributed[namespace]).map(schemaCode => contributed[namespace][schemaCode]));
});

schemas.forEach(schema => {
    const definition = schema.definition || {};
    assert.strictEqual(definition.tenant, undefined, 'Loyalty data schemas must derive tenant/schema from runtime context');
    assert.strictEqual(definition.enterpriseCode, undefined, 'Loyalty data schemas must not store enterpriseCode as ordinary data');
    assert.strictEqual(schema.router.enabled, false, 'Loyalty data schemas must not expose generated CRUD routers');
});

const walletSchemas = require(path.join(moduleRoot, 'modules/loyaltyWallet/src/schemas/schemas.js')).loyaltyWallet;
const walletDefinition = walletSchemas.loyaltyWallet.definition;
assert.deepStrictEqual(walletDefinition.ownerType.enum, ['CUSTOMER', 'EMPLOYEE', 'ENTERPRISE', 'PARTNER', 'SYSTEM']);
assert.strictEqual(walletDefinition.ownerType.required, true);
assert.strictEqual(walletDefinition.ownerCode.required, true);

const balanceDefinition = walletSchemas.loyaltyWalletRewardBalance.definition;
['walletCode', 'programCode', 'rewardTypeCode', 'available', 'reserved'].forEach(field => {
    assert(balanceDefinition[field], 'wallet reward balance must expose ' + field);
});

console.log('Loyalty schema boundary contract validated');
