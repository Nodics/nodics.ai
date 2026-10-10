/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
'use strict';
/** @module promotion/test/helpers/runInstalledOwnerAcceptance
 * @description Runs explicitly selected native acceptance inside the existing reviewed LOCAL bootstrap. Never boots a second server, builds artifacts, selects qualification flags, logs credentials or manufactures an identity.
 * @layer test @owner promotion
 */
const { isDeepStrictEqual } = require('node:util');
const native = require('./installedOwnerAcceptance');

/** Pins the exact immutable original selection before a first-use owner mutation. */
function assertReviewedPayload(payload, reviewed, contribution) {
    native.requireEvidence(reviewed?.confirmed === true && reviewed.releaseCode === contribution?.releaseCode &&
        reviewed.checksum === contribution?.checksum && Array.isArray(reviewed.campaignCodes) &&
        Array.isArray(reviewed.batchCodes) && reviewed.quantityPerBatch === 100, 'reviewed immutable original selection required');
    native.requireEvidence(payload.campaigns.length > 0 && payload.campaigns.length <= 38 &&
        payload.couponBatches.length > 0 && payload.couponBatches.length <= 38 &&
        payload.couponBatches.every(batch => batch.quantity === 100) &&
        isDeepStrictEqual(payload.campaigns.map(value => value.promotionCode).sort(), [...reviewed.campaignCodes].sort()) &&
        isDeepStrictEqual(payload.couponBatches.map(value => value.batchCode).sort(), [...reviewed.batchCodes].sort()),
        'original campaign/batch/quantity selection differs');
}

/** Reauthorizes the original bearer with the actual installed owner; supplied authData is discarded. */
async function signedRequest(input) {
    await native.assertNativeLocal(input?.tenant, 'promotion', ['promotion', 'coupon', 'couponBatch']);
    native.requireEvidence(/^Bearer [^\s]{1,16384}$/i.test(input.authorization || ''), 'original bearer required');
    await native.assertLocalTarget({ moduleName: 'profile', connectionName: 'profile', tenant: input.tenant,
        targetAuthority: { runtimeRole: 'PLATFORM' } });
    const { authData: ignoredIdentity, authToken: ignoredToken, ...request } = input;
    const authorization = await SERVICE.DefaultAuthorizationProviderService.authorizeToken({
        ...request, authToken: request.authorization.slice(7),
    });
    const authData = authorization?.result;
    native.requireEvidence(authData?.tenant === request.tenant && authData.tokenType === 'access' &&
        ['human', 'customer'].includes(authData.principalType), 'native signed access identity required');
    return { ...request, authData };
}

/** Dispatches only bounded original owner commands; returned success is evidence, never a config mutation. */
async function run(selection) {
    native.requireEvidence(['manageSellerConsent', 'installContribution', 'replayContribution', 'confirmMerchant', 'recoverDeliveredOwnership']
        .includes(selection?.action), 'explicit supported acceptance action required');
    await native.assertNativeLocal(selection.request?.tenant, 'promotion', ['promotion', 'coupon', 'couponBatch']);
    try {
        return await SERVICE.DefaultCouponSecureIssuanceService.privateOperation(selection.request, () => dispatch(selection));
    } catch (error) {
        const code = /^[A-Z][A-Z0-9_]{0,95}$/.test(error?.code || '') ? error.code : 'UNCONFIRMED';
        throw new Error('Native owner acceptance: selected native action refused (' + code + ')');
    }
}

async function dispatch(selection) {
    const request = await signedRequest(selection.request);
    if (selection.action === 'manageSellerConsent') return native.manageSellerConsent(request, selection.reviewed);
    if (selection.action === 'replayContribution') return native.replayContribution(request);
    if (selection.action === 'installContribution') {
        native.requireEvidence(request.authData.principalType === 'human', 'signed human installer required');
        const setup = SERVICE.DefaultPromotionSetupContributionService;
        return SERVICE.DefaultCouponSecureIssuanceService.privateOperation(request, async () => {
            const payload = await setup.payload(request);
            assertReviewedPayload(payload, selection.reviewed, request.contribution);
            const result = await setup.installContribution(request);
            native.requireEvidence(result?.code === 'SUC_PROMOTION_SETUP_00001' &&
                result.data.couponBatches.length === payload.couponBatches.length, 'native original installation unconfirmed');
            const replay = await native.replayContribution(request);
            return { ...replay, acceptance: 'INSTALLED_ORIGINAL_ISSUANCE_AND_REPLAY',
                firstIssuanceRaceQualified: false, deploymentQualified: false };
        });
    }
    const digital = require('../../../../../digitalCommerce/modules/digitalCore/test/helpers/installedOwnerAcceptance');
    if (selection.action === 'confirmMerchant') return digital.confirmMerchant(request);
    return digital.recoverDeliveredOwnership(request, selection.order, selection.unit);
}

module.exports = { run, signedRequest, assertReviewedPayload };

if (require.main === module) {
    process.stderr.write('Use run(selection) in the existing reviewed LOCAL runtime after foundation.start; standalone bootstrap is intentionally disabled.\n');
    process.exitCode = 1;
}
