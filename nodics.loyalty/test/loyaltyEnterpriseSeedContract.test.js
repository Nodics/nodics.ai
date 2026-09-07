/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module nodics.loyalty/test/loyaltyEnterpriseSeedContract @description Verifies Loyalty contributes its rewards marketplace enterprise from Loyalty Core data into Profile. @layer test @owner nodics.loyalty */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const loyaltyCoreRoot = path.resolve(__dirname, '../modules/loyaltyCore');
const packageJson = JSON.parse(fs.readFileSync(path.join(loyaltyCoreRoot, 'package.json'), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.join(loyaltyCoreRoot, 'data/manifest.json'), 'utf8'));
const header = require('../modules/loyaltyCore/data/core-v001/headers/profile/loyaltyCoreEnterpriseCoreHeader');
const records = require('../modules/loyaltyCore/data/core-v001/records/profile/loyaltyCoreEnterpriseCoreData');

assert(packageJson.nodics.owns.includes('data'), 'loyaltyCore must own Loyalty enterprise contribution data');
assert.equal(manifest.sections['core-enterprise-reference'].destinationRole, 'PLATFORM');
assert.equal(manifest.sections['core-enterprise-reference'].owningDomain, 'loyalty');
assert.equal(header.profile.loyaltyCoreEnterpriseCoreData.options.moduleName, 'profile');
assert.equal(header.profile.loyaltyCoreEnterpriseCoreData.options.schemaName, 'enterprise');
assert.equal(Object.keys(records).length, 2);
assert.equal(records.record0.code, 'NODICS_REWARDS_MARKETPLACE_CO');
assert.equal(records.record0.tenant, 'default:true');
assert.equal(records.record0.enterpriseCode, undefined);
assert.deepEqual(records.record0.roleCodes, ['MARKETPLACE_VENDOR', 'ISSUER']);
assert.deepEqual(records.record0.capabilityScopes.map(item => item.moduleName), ['loyaltyCore', 'loyaltyCore']);
assert.deepEqual(records.record0.capabilityScopes.map(item => item.scopeCode), ['REWARDS_MARKETPLACE', 'LOYALTY_REWARD_ISSUANCE']);
assert.equal(records.record1.code, 'NODICS_REWARDS_REDEMPTION_VENDOR_CO');
assert.equal(records.record1.tenant, 'default:true');
assert.equal(records.record1.enterpriseCode, undefined);
assert.deepEqual(records.record1.roleCodes, ['MARKETPLACE_VENDOR', 'BUSINESS_PARTNER']);
assert.deepEqual(records.record1.capabilityScopes.map(item => item.scopeCode), ['COUPON_REDEMPTION', 'LOYALTY_MARKETPLACE_PARTNERSHIP']);

console.log('Loyalty enterprise seed contract validated');
