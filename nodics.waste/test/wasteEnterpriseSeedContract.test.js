/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module nodics.waste/test/wasteEnterpriseSeedContract @description Verifies Waste contributes its program operator enterprise from Waste Core data into Profile. @layer test @owner nodics.waste */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const wasteCoreRoot = path.resolve(__dirname, '../modules/wasteCore');
const packageJson = JSON.parse(fs.readFileSync(path.join(wasteCoreRoot, 'package.json'), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.join(wasteCoreRoot, 'data/manifest.json'), 'utf8'));
const header = require('../modules/wasteCore/data/core-v001/headers/profile/wasteCoreEnterpriseCoreHeader');
const records = require('../modules/wasteCore/data/core-v001/records/profile/wasteCoreEnterpriseCoreData');

assert(packageJson.nodics.owns.includes('data'), 'wasteCore must own Waste enterprise contribution data');
assert.equal(manifest.sections['core-reference'].destinationRole, 'PLATFORM');
assert.equal(manifest.sections['core-reference'].owningDomain, 'waste');
assert.equal(header.profile.wasteCoreEnterpriseCoreData.options.moduleName, 'profile');
assert.equal(header.profile.wasteCoreEnterpriseCoreData.options.schemaName, 'enterprise');
assert.equal(Object.keys(records).length, 2);
assert.equal(records.record0.code, 'NODICS_WASTE_MANAGEMENT_CO');
assert.equal(records.record0.tenant, 'default:true');
assert.equal(records.record0.enterpriseCode, undefined);
assert.deepEqual(records.record0.roleCodes, ['PROGRAM_OPERATOR', 'SERVICE_PROVIDER']);
assert.deepEqual(records.record0.capabilityScopes.map(item => item.moduleName), ['wasteCore', 'wasteCore']);
assert.deepEqual(records.record0.capabilityScopes.map(item => item.scopeCode), ['WASTE_MANAGEMENT', 'COLLECTION_CENTRE_OPERATION']);
assert.equal(records.record1.code, 'BEAH_RECYCLING_SERVICES');
assert.equal(records.record1.tenant, 'default:true');
assert.equal(records.record1.enterpriseCode, undefined);
assert.deepEqual(records.record1.roleCodes, ['SERVICE_PROVIDER', 'ASSET_OWNER', 'BUSINESS_PARTNER']);
assert.deepEqual(records.record1.capabilityScopes.map(item => item.scopeCode), ['RECYCLING_SERVICE_OPERATION', 'COLLECTION_BIN_OWNERSHIP', 'WASTE_MANAGEMENT_PARTNERSHIP']);

console.log('Waste enterprise seed contract validated');
