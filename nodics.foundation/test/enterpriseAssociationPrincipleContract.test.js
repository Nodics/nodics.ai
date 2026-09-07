/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module nodics.foundation/test/enterpriseAssociationPrincipleContract @description Verifies framework guidance preserves enterprise association and map-provider boundary principles. @layer test @owner nSetup */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const foundationRoot = path.resolve(__dirname, '..');
const tenantModel = fs.readFileSync(path.join(foundationRoot, 'modules/nSetup/llm/standards/tenant-model-and-runtime-isolation.md'), 'utf8');
const modularArchitecture = fs.readFileSync(path.join(foundationRoot, 'modules/nSetup/llm/standards/modular-architecture.md'), 'utf8');
const developerContract = fs.readFileSync(path.join(foundationRoot, 'modules/nSetup/llm/contracts/developer-implementation-contract.md'), 'utf8');
const locationContract = fs.readFileSync(path.join(foundationRoot, '../nodics.location/llm/contracts/README.md'), 'utf8');
const commerceContract = fs.readFileSync(path.join(foundationRoot, '../nodics.commerce/llm/contracts/digital-commerce-and-coupon-marketplace-contract.md'), 'utf8');
const storeSchemas = require(path.join(foundationRoot, '../nodics.commerce/modules/baseCommerce/modules/store/src/schemas/schemas.js')).store;
const promotionSchemas = require(path.join(foundationRoot, '../nodics.commerce/modules/baseCommerce/modules/promotion/src/schemas/schemas.js')).promotion;
const wasteCollectionSchemas = require(path.join(foundationRoot, '../nodics.waste/modules/wasteCollection/src/schemas/schemas.js')).wasteCollection;
const locationCoreSchemas = require(path.join(foundationRoot, '../nodics.location/modules/locationCore/src/schemas/schemas.js')).locationCore;
const normalizedTenantModel = tenantModel.replace(/\s+/g, ' ');

[
    'PLATFORM_OWNER',
    'PROGRAM_OPERATOR',
    'SERVICE_PROVIDER',
    'MARKETPLACE_VENDOR',
    'ISSUER',
    'ASSET_OWNER',
    'BUSINESS_PARTNER'
].forEach(role => assert(tenantModel.includes(role), role + ' must be part of the enterprise role vocabulary'));

assert(normalizedTenantModel.includes('Do not add every possible role field to every schema'));
assert(tenantModel.includes('Tenant must not be used as the business-owner field'));
assert(modularArchitecture.includes('Business ownership must travel as enterprise association context'));
assert(developerContract.includes('Business relationships must use enterprise association fields'));
assert(commerceContract.includes('Business ownership is enterprise-associated.'));
assert(commerceContract.includes('role-aware Profile Enterprise references'));
assert(!commerceContract.includes('Use `enterpriseCode` as the business owner'));
assert(!commerceContract.includes('add or standardize `enterpriseCode` on Commerce business schemas'));
assert(locationContract.includes('Provider-specific coordinate shapes'));
assert(locationContract.includes('return domain'));

[
    storeSchemas.store,
    storeSchemas.salesChannel,
    storeSchemas.pointOfService
].forEach(schema => {
    assert(schema.schemaPolicies.includes('tenantOwned'), 'Store tenant fields must remain technical tenantOwned isolation scope');
    assert(schema.definition.tenant.required, 'Store tenant fields remain required for generated persistence isolation');
});
assert(storeSchemas.store.definition.enterpriseRef, 'Store business association must be enterpriseRef');
assert(storeSchemas.salesChannel.definition.enterpriseRef, 'Sales channel business association must be enterpriseRef');
assert(storeSchemas.pointOfService.definition.operatorEnterpriseRef, 'POS operator association must be operatorEnterpriseRef');
assert(promotionSchemas.promotion.definition.enterpriseRef, 'Promotion must expose enterpriseRef association');
assert(promotionSchemas.promotion.definition.issuerEnterpriseRef, 'Promotion must expose issuerEnterpriseRef association');
assert(promotionSchemas.promotion.definition.vendorEnterpriseRef, 'Promotion must expose vendorEnterpriseRef association');
assert(wasteCollectionSchemas.wasteCollectionPoint.definition.operatorEnterpriseRef, 'Collection point operator must be enterprise association');
assert(wasteCollectionSchemas.wasteCollectionPoint.definition.assetOwnerEnterpriseRef, 'Collection point asset owner must be enterprise association');
assert(locationCoreSchemas.location.definition.enterpriseRef, 'Location owner must be enterprise association');
assert(locationCoreSchemas.location.definition.operatorEnterpriseRef, 'Location operator must be enterprise association');

console.log('Enterprise association principle contract validated');
