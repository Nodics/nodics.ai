/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module waste/test/wasteLayeredJourneyContract @description Proves eWaste presets and partner overlays can execute a generic Waste journey. @layer test @owner waste */
const assert = require('assert');
const path = require('path');
const contributionPolicy = require('../../../../nodics.waste/modules/wasteCore/src/service/defaultWasteDataContributionPolicyService');
const acceptancePolicy = require('../../../../nodics.waste/modules/wasteCollection/src/service/defaultWasteAcceptancePolicyService');
const submissionLifecycle = require('../../../../nodics.waste/modules/wasteSubmission/src/service/defaultWasteSubmissionLifecycleService');
const impactCalculation = require('../../../../nodics.waste/modules/wasteImpact/src/service/defaultWasteImpactCalculationService');

const acceleratorRoot = path.resolve(__dirname, '..');
const eWasteRoot = path.join(acceleratorRoot, 'modules/eWaste');
const partnerDataRoot = path.join(__dirname, 'fixtures/partnerOverlay/data/project-v001/records/waste');
const fixedNow = new Date('2026-09-01T12:00:00.000Z');

const loadRecords = function (root, fileName) {
    return Object.values(require(path.join(root, fileName)));
};
const resolve = function (fileName, schemaLayer) {
    return contributionPolicy.resolveByCode([
        { moduleName: 'eWaste', layerKind: 'SCENARIO_ACCELERATOR', records: loadRecords(path.join(eWasteRoot, 'data/core-v001/records/waste'), fileName) },
        { moduleName: 'partnerWasteOverlay', layerKind: 'PROJECT', records: loadRecords(partnerDataRoot, schemaLayer || fileName) }
    ]);
};

const effectiveCategories = resolve('eWasteCategoryData.js', 'partnerWasteCategoryData.js');
const effectivePresets = resolve('eWasteCollectionPresetData.js', 'partnerWasteCollectionPresetData.js');
const effectiveImpactProfiles = resolve('eWasteImpactProfileData.js', 'partnerWasteImpactProfileData.js');
const acceptanceRules = loadRecords(path.join(eWasteRoot, 'data/core-v001/records/waste'), 'eWasteAcceptanceRuleData.js')
    .concat(loadRecords(partnerDataRoot, 'partnerWasteAcceptanceRuleData.js'));

const collectionPreset = effectivePresets.PARTNER_MALL_DROP_OFF;
const collectionPoint = {
    code: 'PARTNER_MALL_CP_001',
    name: { en: 'Partner Mall Collection Counter' },
    collectionPointType: collectionPreset.collectionPointType,
    receiptPolicyCode: collectionPreset.receiptPolicyCode,
    verificationPolicyCode: collectionPreset.verificationPolicyCode,
    serviceCapabilities: collectionPreset.serviceCapabilities,
    operatingStatus: 'ACTIVE',
    publicVisibility: 'PUBLIC',
    status: 'ACTIVE',
    revision: 0
};
const submittedFacts = {
    familyCode: effectiveCategories.SMART_HOME_DEVICE.familyCode,
    categoryCode: 'SMART_HOME_DEVICE',
    itemTypeCode: 'UNKNOWN_ELECTRONIC_ITEM',
    materialTypeCodes: ['CIRCUIT_BOARD', 'COPPER', 'PLASTIC_CASING'],
    conditionGrade: 'RECYCLABLE',
    quantity: 2,
    weight: '3.5'
};

const accepted = acceptancePolicy.evaluate({
    collectionPoint: collectionPoint,
    facts: submittedFacts,
    rules: acceptanceRules.filter(function (rule) {
        return collectionPreset.acceptanceRuleCodes.includes(rule.code);
    })
});
assert.strictEqual(accepted.accepted, true);
assert.strictEqual(accepted.requiresReceipt, true);
assert.strictEqual(accepted.matchedRules[0].code, 'PARTNER_DROP_OFF_SMART_HOME');

const rejectedLooseBattery = acceptancePolicy.evaluate({
    collectionPoint: { code: 'EWASTE_BIN_001', collectionPointType: 'E_WASTE_BIN' },
    facts: { familyCode: 'BATTERY', categoryCode: 'LITHIUM_BATTERY', itemTypeCode: 'LOOSE_LITHIUM_BATTERY', materialTypeCodes: ['LITHIUM_BATTERY'], quantity: 1 },
    rules: loadRecords(path.join(eWasteRoot, 'data/core-v001/records/waste'), 'eWasteAcceptanceRuleData.js')
});
assert.strictEqual(rejectedLooseBattery.accepted, false);
assert.strictEqual(rejectedLooseBattery.reasonCode, 'WASTE_ACCEPTANCE_REJECTED');

let submission = {
    code: 'WASTE_SUB_001',
    submitterRef: { module: 'profile', schema: 'user', code: 'customer-001' },
    submissionChannel: 'PARTNER_APP',
    categoryCode: submittedFacts.categoryCode,
    itemTypeCode: submittedFacts.itemTypeCode,
    materialTypeCodes: submittedFacts.materialTypeCodes,
    conditionGrade: submittedFacts.conditionGrade,
    quantity: submittedFacts.quantity,
    weight: submittedFacts.weight,
    preferredCollectionPointCode: collectionPoint.code,
    submittedFacts: submittedFacts,
    evidenceRefs: [{ module: 'media', schema: 'mediaAsset', code: 'photo-001' }],
    submissionStatus: 'DRAFT',
    correlationId: 'corr-waste-journey-001',
    idempotencyKey: 'idem-waste-submit-001',
    revision: 0
};
submission = submissionLifecycle.confirmFacts(submission, submittedFacts, {
    now: fixedNow,
    correlationId: 'corr-waste-journey-001',
    idempotencyKey: 'idem-waste-submit-001'
});
submission = submissionLifecycle.transition(submission, 'UNDER_REVIEW', { now: fixedNow });
submission = submissionLifecycle.transition(submission, 'APPROVED', { now: fixedNow });

assert.strictEqual(submission.submissionStatus, 'APPROVED');
assert.strictEqual(submission.tenant, undefined);
assert.strictEqual(submission.enterpriseCode, undefined);
assert.strictEqual(submission.rewardEligibility, undefined);
assert.strictEqual(submission.receiptStatus, undefined);
assert.strictEqual(submission.calculationStatus, undefined);

const verification = {
    code: 'WASTE_VER_001',
    submissionCode: submission.code,
    verifiedBy: { module: 'profile', schema: 'employee', code: 'operator-001' },
    verificationStatus: 'APPROVED',
    verifiedFacts: submittedFacts,
    verifiedCategoryCode: submittedFacts.categoryCode,
    verifiedItemTypeCode: submittedFacts.itemTypeCode,
    verifiedMaterialTypeCodes: submittedFacts.materialTypeCodes,
    verifiedConditionGrade: submittedFacts.conditionGrade,
    verifiedQuantity: submittedFacts.quantity,
    verifiedWeight: submittedFacts.weight,
    verifiedAt: fixedNow,
    correlationId: submission.correlationId,
    idempotencyKey: 'idem-waste-verification-001',
    revision: 0
};
assert.strictEqual(verification.verificationStatus, 'APPROVED');
assert.strictEqual(verification.rewardFormula, undefined);
submission.verificationRef = { module: 'wasteVerification', schema: 'wasteVerification', code: verification.code };

const receipt = {
    code: 'WASTE_REC_001',
    submissionCode: submission.code,
    collectionPointCode: collectionPoint.code,
    receivedBy: { module: 'profile', schema: 'employee', code: 'operator-001' },
    receivedAt: fixedNow,
    receivedFacts: submittedFacts,
    receivedQuantity: 2,
    receivedWeight: '3.5',
    conditionAtReceipt: 'RECYCLABLE',
    receiptEvidenceRefs: [{ module: 'media', schema: 'mediaAsset', code: 'receipt-photo-001' }],
    receiptStatus: 'RECEIVED',
    correlationId: submission.correlationId,
    idempotencyKey: 'idem-waste-receipt-001',
    revision: 0
};
assert.strictEqual(receipt.receiptStatus, 'RECEIVED');
assert.strictEqual(submission.submissionStatus, 'APPROVED');
submission.receiptRef = { module: 'wasteReceipt', schema: 'wasteReceipt', code: receipt.code };

const impact = impactCalculation.calculate({
    resultCode: 'WASTE_IMPACT_001',
    sourceRef: { module: 'wasteReceipt', schema: 'wasteReceipt', code: receipt.code },
    profile: effectiveImpactProfiles.PARTNER_VERIFIED_DEVICE_RECOVERY,
    facts: receipt,
    calculationStatus: 'CONFIRMED',
    evidenceRefs: receipt.receiptEvidenceRefs,
    now: fixedNow,
    correlationId: submission.correlationId,
    idempotencyKey: 'idem-waste-impact-001'
});
assert.strictEqual(impact.profileCode, 'PARTNER_VERIFIED_DEVICE_RECOVERY');
assert.strictEqual(impact.calculationStatus, 'CONFIRMED');
assert.deepStrictEqual(impact.metrics.map(function (metric) { return metric.value; }), ['3.5', '2.52']);
assert.strictEqual(impact.rewardFormula, undefined);
submission.impactRef = { module: 'wasteImpact', schema: 'wasteImpactResult', code: impact.code };

assert.deepStrictEqual(submission.verificationRef, { module: 'wasteVerification', schema: 'wasteVerification', code: 'WASTE_VER_001' });
assert.deepStrictEqual(submission.receiptRef, { module: 'wasteReceipt', schema: 'wasteReceipt', code: 'WASTE_REC_001' });
assert.deepStrictEqual(submission.impactRef, { module: 'wasteImpact', schema: 'wasteImpactResult', code: 'WASTE_IMPACT_001' });

console.log('Waste layered journey contract validated');
