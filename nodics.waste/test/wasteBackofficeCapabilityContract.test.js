/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module nodics.waste/test/wasteBackofficeCapabilityContract @description Verifies Waste-owned BackOffice capability metadata remains discoverable, bounded, and framework-generic. @layer test @owner nodics.waste */

const assert = require('node:assert/strict');
const path = require('node:path');

const repositoryRoot = path.resolve(__dirname, '../..');
const registered = [];

global.SERVICE = {
    DefaultBackofficeCapabilityDefinitionService: require(path.join(repositoryRoot, 'nodics.foundation/modules/nService/src/service/module/defaultBackofficeCapabilityDefinitionService.js')),
    DefaultModuleRegistrationAgentService: {
        registerBackofficeCapabilityProvider: function (moduleName, provider) {
            registered.push({ moduleName, provider });
        }
    }
};

const contract = require(path.join(repositoryRoot, 'nodics.platform/modules/backoffice/src/service/contract/defaultBackofficeContractService.js'));
const provider = require('../modules/wasteCore/src/service/defaultWasteBackofficeCapabilityService.js');
const capability = provider.getCapability();

const initResult = provider.init();
assert.equal(typeof initResult.then, 'function', 'init returns a Promise contract');
assert.equal(registered.length, 1);
assert.equal(registered[0].moduleName, 'wasteCore');
assert.equal(registered[0].provider, provider);
assert.equal(contract.validateBackofficeMetadata(capability), true);
assert.equal(capability.capabilityId, 'waste-management');
assert.equal(capability.displayName, 'Waste Management');
assert.equal(capability.category, 'sustainability');
assert.equal(capability.discovery.openApiPath, '/nodics/system/v0/contract/openapi/internal');
assert.deepEqual(capability.requiredPermissions, ['waste.backoffice.view']);

const byId = Object.fromEntries(capability.navigation.map(item => [item.id, item]));
[
    'waste-management',
    'waste-taxonomy',
    'waste-families',
    'waste-categories',
    'waste-materials',
    'waste-evidence-policies',
    'waste-collections',
    'waste-acceptance-rules',
    'waste-submissions',
    'waste-verification',
    'waste-receipts',
    'waste-impact',
    'waste-assets',
    'waste-asset-types',
    'waste-asset-creation-policies',
    'waste-asset-ownership-events',
    'waste-asset-marketplace-projections',
    'waste-asset-transfer-policies',
    'waste-marketplace-policies',
    'waste-reward-settlement-policies',
    'waste-carbon-settlement-policies',
    'waste-coupon-redemption-policies',
    'waste-movement',
    'waste-compliance'
].forEach(id => assert(byId[id], `${id} must be declared`));

assert.equal(byId['waste-management'].group.id, 'sustainability-operations');
assert.equal(byId['waste-submissions'].parentModuleName, 'wasteCore');
assert.equal(byId['waste-submissions'].workbenchTarget.moduleName, 'wasteSubmission');
assert.equal(byId['waste-submissions'].workbenchTarget.schemaName, 'wasteSubmission');
assert.equal(byId['waste-impact'].workbenchTarget.schemaName, 'wasteImpactProfile');
assert.equal(byId['waste-assets'].parentModuleName, 'wasteCore');
assert.equal(byId['waste-assets'].workbenchTarget.moduleName, 'wasteCore');
assert.equal(byId['waste-assets'].workbenchTarget.schemaName, 'wasteAsset');
assert.equal(byId['waste-asset-types'].workbenchTarget.schemaName, 'wasteAssetType');
assert.equal(byId['waste-asset-creation-policies'].workbenchTarget.schemaName, 'wasteAssetCreationPolicy');
assert.equal(byId['waste-asset-ownership-events'].workbenchTarget.schemaName, 'wasteAssetOwnershipEvent');
assert.equal(byId['waste-asset-marketplace-projections'].workbenchTarget.schemaName, 'wasteAssetMarketplaceProjection');
assert.equal(byId['waste-asset-transfer-policies'].workbenchTarget.schemaName, 'wasteAssetTransferPolicy');
assert.equal(byId['waste-marketplace-policies'].workbenchTarget.schemaName, 'wasteMarketplaceEligibilityPolicy');
assert.equal(byId['waste-reward-settlement-policies'].workbenchTarget.schemaName, 'wasteRewardSettlementPolicy');
assert.equal(byId['waste-carbon-settlement-policies'].workbenchTarget.schemaName, 'wasteCarbonSettlementPolicy');
assert.equal(byId['waste-coupon-redemption-policies'].workbenchTarget.schemaName, 'wasteCouponRedemptionSettlementPolicy');
assert.equal(byId['waste-movement'].featureState, 'PREVIEW');
assert.equal(byId['waste-compliance'].featureState, 'PREVIEW');
capability.navigation.forEach(item => {
    assert.equal(item.requiredPermissions.includes('waste.backoffice.view'), true, `${item.id} must be permission-filtered`);
    assert.equal(item.route.startsWith('/waste'), true, `${item.id} must stay in the Waste route namespace`);
    assert.equal(item.workbenchPresentation.forbiddenFields.includes('rewardFormula'), true, `${item.id} must not invite reward policy editing`);
    assert.equal(item.workbenchPresentation.forbiddenFields.includes('couponCode'), true, `${item.id} must not invite coupon ownership`);
    assert.equal(item.workbenchPresentation.forbiddenFields.includes('couponToken'), true, `${item.id} must not invite coupon token ownership`);
    assert.equal(item.workbenchPresentation.forbiddenFields.includes('price'), true, `${item.id} must not invite Commerce pricing ownership`);
    assert.equal(item.workbenchPresentation.forbiddenFields.includes('paymentAmount'), true, `${item.id} must not invite payment ownership`);
    assert.equal(item.workbenchPresentation.forbiddenFields.includes('bidRules'), true, `${item.id} must not invite Commerce bidding ownership`);
    assert.equal(item.workbenchPresentation.forbiddenFields.includes('ledgerEntries'), true, `${item.id} must not invite Wallet ledger ownership`);
    assert.equal(item.workbenchPresentation.forbiddenFields.includes('trackingNumber'), true, `${item.id} must not invite logistics tracking ownership`);
    assert.equal(item.workbenchPresentation.forbiddenFields.includes('certificateNumber'), true, `${item.id} must not invite certificate-number ownership`);
});

console.log('Waste BackOffice capability contract validated');
