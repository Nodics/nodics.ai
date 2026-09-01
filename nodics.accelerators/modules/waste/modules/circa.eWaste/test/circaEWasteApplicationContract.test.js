/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module circa.eWaste/test/circaEWasteApplicationContract @description Verifies Circa eWaste exposes reusable journey metadata without owning underlying domain state. @layer test @owner circa.eWaste */
const assert = require('assert');
const service = require('../src/service/defaultCircaEWasteApplicationContractService');

const contract = service.applicationContract({
    now: new Date('2026-09-01T17:00:00.000Z'),
    correlationId: 'corr-circa-ewaste-001',
    idempotencyKey: 'circa-ewaste-contract-001',
    evidenceRefs: [{ module: 'media', schema: 'mediaAsset', code: 'photo-001' }],
    policyRefs: [{ module: 'wasteCore', schema: 'wasteAssetTransferPolicy', code: 'EWASTE_DONATION_TRANSFER_STANDARD' }]
});
const journeyByCode = contract.journeys.reduce(function (index, journey) {
    index[journey.code] = journey;
    return index;
}, {});

assert.strictEqual(contract.code, 'CIRCA_EWASTE');
assert.strictEqual(contract.moduleName, 'circa.eWaste');
assert.strictEqual(contract.frontendModuleName, 'nodics.circa.eWaste');
assert.strictEqual(contract.projectModuleName, 'circa.eWaste');
assert.strictEqual(contract.frameworkModuleName, 'nodics.waste');
assert.deepStrictEqual(contract.requiredScenarioModules, ['eWaste', 'wasteRecycling']);
assert.strictEqual(contract.ownershipBoundaries.wasteFactsOwner, 'nodics.waste');
assert.strictEqual(contract.ownershipBoundaries.eWastePresetOwner, 'eWaste');
assert.strictEqual(contract.ownershipBoundaries.recyclingHandoffOwner, 'wasteRecycling');
assert.strictEqual(contract.ownershipBoundaries.walletOwner, 'nodics.loyalty');
assert.strictEqual(contract.ownershipBoundaries.commerceOwner, 'nodics.commerce');
assert.strictEqual(contract.ownershipBoundaries.frontendOwner, 'nodics.circa.eWaste');
assert.strictEqual(contract.evidenceRefs[0].code, 'photo-001');
assert.strictEqual(contract.policyRefs[0].code, 'EWASTE_DONATION_TRANSFER_STANDARD');

[
    'CIRCA_EWASTE_SUBMISSION',
    'CIRCA_EWASTE_COLLECTION_ACCEPTANCE',
    'CIRCA_EWASTE_ASSETS',
    'CIRCA_EWASTE_MARKETPLACE_PROJECTION',
    'CIRCA_EWASTE_SALE_CALLBACKS',
    'CIRCA_EWASTE_GIFT',
    'CIRCA_EWASTE_DONATION',
    'CIRCA_EWASTE_COUPON_REDEMPTION',
    'CIRCA_EWASTE_RECYCLING_HANDOFF'
].forEach(function (journeyCode) {
    assert(journeyByCode[journeyCode], journeyCode + ' must be present in Circa eWaste');
});

assert.strictEqual(journeyByCode.CIRCA_EWASTE_SUBMISSION.operationRef.routeKey, '/waste/submissions');
assert.strictEqual(journeyByCode.CIRCA_EWASTE_SUBMISSION.operationRef.permission, 'waste.submission.create');
assert.strictEqual(journeyByCode.CIRCA_EWASTE_ASSETS.operationRef.routeKey, '/waste/assets/owned');
assert.strictEqual(journeyByCode.CIRCA_EWASTE_MARKETPLACE_PROJECTION.operationRef.routeKey, '/waste/assets/:assetCode/marketplace-projections');
assert.strictEqual(journeyByCode.CIRCA_EWASTE_GIFT.operationRef.routeKey, '/waste/assets/:assetCode/gift/request');
assert.strictEqual(journeyByCode.CIRCA_EWASTE_DONATION.operationRef.routeKey, '/waste/assets/:assetCode/donations/request');
assert.strictEqual(journeyByCode.CIRCA_EWASTE_COUPON_REDEMPTION.operationRef.routeKey, '/waste/assets/:assetCode/coupon-redemptions/request');
assert.strictEqual(journeyByCode.CIRCA_EWASTE_RECYCLING_HANDOFF.ownerModule, 'wasteRecycling');
assert.strictEqual(journeyByCode.CIRCA_EWASTE_RECYCLING_HANDOFF.service, 'DefaultWasteRecyclingHandoffContractService');

const enabled = service.enabledJourneys(contract, { gift: { enabled: false }, recyclingHandoff: { enabled: false } });
assert(!enabled.some(function (journey) { return journey.code === 'CIRCA_EWASTE_GIFT'; }));
assert(!enabled.some(function (journey) { return journey.code === 'CIRCA_EWASTE_RECYCLING_HANDOFF'; }));
assert(enabled.some(function (journey) { return journey.code === 'CIRCA_EWASTE_DONATION'; }));

assert.throws(function () {
    service.applicationContract({ rewardFormula: { points: 10 } });
}, /rewardFormula must stay outside/);

assert.throws(function () {
    service.applicationContract({ couponCode: 'COUPON-001' });
}, /couponCode must stay outside/);

assert.throws(function () {
    service.applicationContract({ provider: { accessToken: 'secret-token' } });
}, /accessToken must stay outside/);

assert.throws(function () {
    service.applicationContract({ productName: 'Used phone asset product' });
}, /productName must stay outside/);

console.log('Circa eWaste application contract validated');
