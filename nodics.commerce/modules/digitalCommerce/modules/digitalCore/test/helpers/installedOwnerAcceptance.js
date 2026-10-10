/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
'use strict';
/** @module digitalCore/test/helpers/installedOwnerAcceptance
 * @description Runs reviewed original merchant confirmation/replay and original delivered ownership recovery in the actual LOCAL runtime. No provider/caller double, configuration writes, new financial key or used-benefit inverse.
 * @layer test @owner digitalCore
 */
const native = require('../../../../../baseCommerce/modules/promotion/test/helpers/installedOwnerAcceptance');

/** Confirms only the main workflow's already validated, reviewed staff command through the genuine merchant owner. */
async function confirmMerchant(request) {
    await native.assertNativeLocal(request?.tenant, 'digitalCore', ['digitalEntitlement', 'digitalDelivery']);
    await native.assertNativeLocal(request.tenant, 'promotion', ['promotion', 'coupon', 'couponBatch']);
    native.requireEvidence(request.authData?.principalType === 'human' && request.payload?.confirmed === true &&
        typeof request.idempotencyKey === 'string' && request.idempotencyKey.length >= 8 &&
        typeof request.payload.validationCode === 'string' && typeof request.payload.validationExpiresAt === 'string',
        'original validated reviewed human merchant command required');
    await native.assertLocalTarget({ moduleName: 'profile', connectionName: 'profile', tenant: request.tenant,
        targetAuthority: { runtimeRole: 'PLATFORM' } });
    const benefits = CONFIG.get('promotion')?.merchantBenefits;
    const simulated = /^SIM:/.test(request.payload.merchantReceiptReference || '');
    native.requireEvidence(simulated || /^CART:/.test(request.payload.merchantReceiptReference || ''), 'original native CART or SIM source required');
    if (simulated)
        native.requireEvidence(SERVICE.DefaultFulfillmentItemSimulationService?.assertSelected() === true, 'real selected LOCAL simulator required');
    else await native.assertLocalTarget({ moduleName: 'pricing', connectionName: benefits?.pricedSource?.connectionName,
        tenant: request.tenant, targetAuthority: { runtimeRole: 'COMMERCE' } });
    const owner = SERVICE.DefaultDigitalCommerceMerchantService;
    native.requireEvidence(owner?.confirm && owner.inspectReceipt, 'native merchant owner required');
    return SERVICE.DefaultCouponSecureIssuanceService.privateOperation(request, async () => {
    const result = await owner.confirm(request);
    const receipt = await owner.inspectReceipt(request);
    native.requireEvidence(result.claimStatus === 'REDEEMED' && receipt.state === 'COMPLETED' &&
        receipt.confirmationKey === request.idempotencyKey && receipt.receiptCode === result.receiptCode,
        'original completed native merchant receipt unconfirmed');
    await owner.confirm(request);
    const replay = await owner.inspectReceipt(request);
    native.requireEvidence(native.fingerprint(receipt) === native.fingerprint(replay), 'merchant replay changed original receipt');
    let denied = false;
    try { await owner.confirm({ ...request, idempotencyKey: request.idempotencyKey + ':foreign' }); } catch (_) { denied = true; }
    native.requireEvidence(denied, 'new confirmation key admitted for used original coupon');
    if (simulated)
        native.requireEvidence(receipt.simulated === true && receipt.deliveryVerified === false &&
            receipt.evidenceMode === 'LOCAL_SIMULATION', 'simulation evidence was promoted to verified delivery');
    else native.requireEvidence(receipt.simulated !== true, 'priced receipt changed evidence mode');
    return { contractVersion: 1, acceptance: 'INSTALLED_ORIGINAL_MERCHANT_CONFIRMATION',
        entitlementCode: receipt.entitlementCode, receiptCode: receipt.receiptCode, storeCode: receipt.storeCode,
        originalReceiptPreserved: true, changedKeyDenied: true,
        evidenceMode: receipt.evidenceMode || 'PRICED_CART', deliveryVerified: false, usedBenefitInverseEnabled: false };
    });
}

/** Reconciles only an already delivered original ownership command through secured domain readback and Digital records. */
async function recoverDeliveredOwnership(request, order, unit) {
    await native.assertNativeLocal(request?.tenant, 'digitalCore', ['digitalEntitlement', 'digitalDelivery', 'digitalProductBinding']);
    native.requireEvidence(unit?.status === 'DELIVERED' && unit.providerOwner === 'wasteCore' &&
        unit.digitalDeliveryType === 'DIGITAL_OWNERSHIP' && unit.orderCode === order?.code &&
        unit.evidence?.physicalCustodyTransferred === false, 'original delivered ownership unit required');
    const owner = SERVICE.DefaultDigitalCommerceOwnershipService;
    const settings = owner.settings();
    await native.assertLocalTarget({ moduleName: settings.owner.moduleName, connectionName: settings.owner.connectionName,
        tenant: request.tenant, targetAuthority: settings.owner.targetAuthority });
    return SERVICE.DefaultCouponSecureIssuanceService.privateOperation(request, async () => {
    const original = await owner.phase(request, order, unit, 'deliver');
    const entitlement = await owner.record(request, order, original, true);
    const replay = await owner.phase(request, order, unit, 'deliver');
    const saved = await owner.record(request, order, replay, true);
    native.requireEvidence(native.fingerprint(original) === native.fingerprint(replay) &&
        native.fingerprint(entitlement) === native.fingerprint(saved), 'original domain or Digital ownership evidence changed');
    return { contractVersion: 1, acceptance: 'INSTALLED_ORIGINAL_OWNERSHIP_DELIVERY_RECOVERY',
        orderCode: order.code, entitlementCode: saved.code, providerCode: original.code,
        originalOwnershipPreserved: true, physicalCustodyTransferred: false, newBuyerDebitRequested: false };
    });
}
module.exports = { confirmMerchant, recoverDeliveredOwnership };
