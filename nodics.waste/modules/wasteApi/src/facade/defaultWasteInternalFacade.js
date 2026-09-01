/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const acceptanceService = require('../../../wasteCollection/src/service/defaultWasteAcceptancePolicyService');
const lifecycleService = require('../../../wasteSubmission/src/service/defaultWasteSubmissionLifecycleService');
const impactService = require('../../../wasteImpact/src/service/defaultWasteImpactCalculationService');
const assetCreationService = require('../../../wasteCore/src/service/defaultWasteAssetCreationService');
const marketplaceProjectionService = require('../../../wasteCore/src/service/defaultWasteAssetMarketplaceProjectionService');
const saleTransferService = require('../../../wasteCore/src/service/defaultWasteAssetSaleTransferService');
const giftTransferService = require('../../../wasteCore/src/service/defaultWasteAssetGiftTransferService');
const couponRedemptionService = require('../../../wasteCore/src/service/defaultWasteAssetCouponRedemptionService');
const donationTransferService = require('../../../wasteCore/src/service/defaultWasteAssetDonationTransferService');

/** @module wasteApi/src/facade/defaultWasteInternalFacade @description Coordinates generic Waste internal API operations with owner services. @layer facade @owner wasteApi @override Later modules may route to generated persistence services while preserving capability ownership. */
module.exports = {
    /** Throws a Nodics-compatible error when available. */
    fail: function (code, message) {
        let error = typeof CLASSES !== 'undefined' && CLASSES.NodicsError ? new CLASSES.NodicsError(code, message) : new Error(message);
        error.code = code;
        throw error;
    },

    /** Resolves a request idempotency key. */
    idempotencyKey: function (request) {
        return request.idempotencyKey || request.payload && request.payload.idempotencyKey || request.requestId;
    },

    /** Checks collection acceptance using Waste Collection rules. */
    collectionAcceptanceCheck: function (request) {
        request = request || {};
        let payload = request.payload || {};
        let collectionPoint = Object.assign({}, payload.collectionPoint || {}, { code: request.params && request.params.collectionPointCode || payload.collectionPointCode || payload.collectionPoint && payload.collectionPoint.code });
        return Promise.resolve(acceptanceService.evaluate({ collectionPoint: collectionPoint, rules: payload.rules || [], facts: payload.facts || payload.submission || {} }));
    },

    /** Returns a sanitized generic submission payload for persistence by an owning generated service. */
    submitWaste: function (request) {
        request = request || {};
        let payload = Object.assign({}, request.payload || {});
        payload.idempotencyKey = this.idempotencyKey(request);
        payload.correlationId = request.correlationId || payload.correlationId;
        payload.submissionStatus = payload.submissionStatus || 'SUBMITTED';
        return Promise.resolve(payload);
    },

    /** Applies a generic submission lifecycle transition. */
    transitionSubmission: function (request) {
        request = request || {};
        let payload = request.payload || {};
        if (!payload.submission) this.fail('ERR_WASTE_SUBMISSION_REQUIRED', 'submission is required');
        if (!payload.targetStatus) this.fail('ERR_WASTE_TARGET_STATUS_REQUIRED', 'targetStatus is required');
        return Promise.resolve(lifecycleService.transition(payload.submission, payload.targetStatus, {
            idempotencyKey: this.idempotencyKey(request),
            correlationId: request.correlationId || payload.correlationId,
            now: payload.now
        }));
    },

    /** Calculates an impact result through the Waste Impact service. */
    calculateImpact: function (request) {
        request = request || {};
        let payload = request.payload || {};
        return Promise.resolve(impactService.calculate(Object.assign({}, payload, {
            idempotencyKey: this.idempotencyKey(request),
            correlationId: request.correlationId || payload.correlationId
        })));
    },

    /** Builds an approved-submission asset creation contract without wallet or commerce side effects. */
    createAssetFromApprovedSubmission: function (request) {
        request = request || {};
        let payload = request.payload || {};
        return Promise.resolve(assetCreationService.createFromApprovedSubmission(Object.assign({}, payload, {
            idempotencyKey: this.idempotencyKey(request),
            correlationId: request.correlationId || payload.correlationId,
            principalRef: request.authData && request.authData.principalRef
        })));
    },

    /** Returns owner-scoped asset records from already-loaded persistence results. */
    ownedAssets: function (request) {
        request = request || {};
        let payload = request.payload || {};
        return Promise.resolve(assetCreationService.ownedAssets({
            ownerRef: payload.ownerRef,
            authOwnerRef: request.authData && request.authData.ownerRef,
            assets: payload.assets || []
        }));
    },

    /** Requests a Commerce/Product projection for a Waste asset. */
    requestMarketplaceProjection: function (request) {
        request = request || {};
        let payload = request.payload || {};
        return Promise.resolve(marketplaceProjectionService.requestProjection(Object.assign({}, payload, {
            asset: Object.assign({}, payload.asset || {}, { code: request.params && request.params.assetCode || payload.asset && payload.asset.code }),
            authOwnerRef: request.authData && request.authData.ownerRef,
            idempotencyKey: this.idempotencyKey(request),
            correlationId: request.correlationId || payload.correlationId,
            principalRef: request.authData && request.authData.principalRef
        })));
    },

    /** Completes a Waste asset to Commerce/Product projection after Commerce creates the listing. */
    completeMarketplaceProjection: function (request) {
        request = request || {};
        let payload = request.payload || {};
        return Promise.resolve(marketplaceProjectionService.completeProjection(Object.assign({}, payload, {
            asset: Object.assign({}, payload.asset || {}, { code: request.params && request.params.assetCode || payload.asset && payload.asset.code }),
            projection: Object.assign({}, payload.projection || {}, { code: request.params && request.params.projectionCode || payload.projection && payload.projection.code }),
            idempotencyKey: this.idempotencyKey(request),
            correlationId: request.correlationId || payload.correlationId,
            principalRef: request.authData && request.authData.principalRef
        })));
    },

    /** Closes a Waste asset marketplace projection after Commerce cancellation, failure, or expiry. */
    closeMarketplaceProjection: function (request) {
        request = request || {};
        let payload = request.payload || {};
        return Promise.resolve(marketplaceProjectionService.closeProjection(Object.assign({}, payload, {
            asset: Object.assign({}, payload.asset || {}, { code: request.params && request.params.assetCode || payload.asset && payload.asset.code }),
            projection: Object.assign({}, payload.projection || {}, { code: request.params && request.params.projectionCode || payload.projection && payload.projection.code }),
            idempotencyKey: this.idempotencyKey(request),
            correlationId: request.correlationId || payload.correlationId,
            principalRef: request.authData && request.authData.principalRef
        })));
    },

    /** Reserves a Waste asset sale after Commerce accepts a buyer/order event. */
    reserveAssetSale: function (request) {
        request = request || {};
        let payload = request.payload || {};
        return Promise.resolve(saleTransferService.reserveSale(Object.assign({}, payload, {
            asset: Object.assign({}, payload.asset || {}, { code: request.params && request.params.assetCode || payload.asset && payload.asset.code }),
            idempotencyKey: this.idempotencyKey(request),
            correlationId: request.correlationId || payload.correlationId,
            principalRef: request.authData && request.authData.principalRef
        })));
    },

    /** Completes a Waste asset sale after Commerce confirms order/payment completion. */
    completeAssetSale: function (request) {
        request = request || {};
        let payload = request.payload || {};
        return Promise.resolve(saleTransferService.completeSale(Object.assign({}, payload, {
            asset: Object.assign({}, payload.asset || {}, { code: request.params && request.params.assetCode || payload.asset && payload.asset.code }),
            idempotencyKey: this.idempotencyKey(request),
            correlationId: request.correlationId || payload.correlationId,
            principalRef: request.authData && request.authData.principalRef
        })));
    },

    /** Cancels a pending Waste asset sale after Commerce cancellation or failure. */
    cancelAssetSale: function (request) {
        request = request || {};
        let payload = request.payload || {};
        return Promise.resolve(saleTransferService.cancelSale(Object.assign({}, payload, {
            asset: Object.assign({}, payload.asset || {}, { code: request.params && request.params.assetCode || payload.asset && payload.asset.code }),
            idempotencyKey: this.idempotencyKey(request),
            correlationId: request.correlationId || payload.correlationId,
            principalRef: request.authData && request.authData.principalRef
        })));
    },

    /** Reverses a completed Waste asset sale after Commerce reversal/refund workflow. */
    reverseAssetSale: function (request) {
        request = request || {};
        let payload = request.payload || {};
        return Promise.resolve(saleTransferService.reverseSale(Object.assign({}, payload, {
            asset: Object.assign({}, payload.asset || {}, { code: request.params && request.params.assetCode || payload.asset && payload.asset.code }),
            idempotencyKey: this.idempotencyKey(request),
            correlationId: request.correlationId || payload.correlationId,
            principalRef: request.authData && request.authData.principalRef
        })));
    },

    /** Requests a customer-to-customer Waste asset gift. */
    requestAssetGift: function (request) {
        request = request || {};
        let payload = request.payload || {};
        return Promise.resolve(giftTransferService.requestGift(Object.assign({}, payload, {
            asset: Object.assign({}, payload.asset || {}, { code: request.params && request.params.assetCode || payload.asset && payload.asset.code }),
            authOwnerRef: request.authData && request.authData.ownerRef,
            idempotencyKey: this.idempotencyKey(request),
            correlationId: request.correlationId || payload.correlationId,
            principalRef: request.authData && request.authData.principalRef
        })));
    },

    /** Accepts a pending customer-to-customer Waste asset gift. */
    acceptAssetGift: function (request) {
        request = request || {};
        let payload = request.payload || {};
        return Promise.resolve(giftTransferService.acceptGift(Object.assign({}, payload, {
            asset: Object.assign({}, payload.asset || {}, { code: request.params && request.params.assetCode || payload.asset && payload.asset.code }),
            authOwnerRef: request.authData && request.authData.ownerRef,
            idempotencyKey: this.idempotencyKey(request),
            correlationId: request.correlationId || payload.correlationId,
            principalRef: request.authData && request.authData.principalRef
        })));
    },

    /** Cancels a pending customer-to-customer Waste asset gift. */
    cancelAssetGift: function (request) {
        request = request || {};
        let payload = request.payload || {};
        return Promise.resolve(giftTransferService.cancelGift(Object.assign({}, payload, {
            asset: Object.assign({}, payload.asset || {}, { code: request.params && request.params.assetCode || payload.asset && payload.asset.code }),
            authOwnerRef: request.authData && request.authData.ownerRef,
            idempotencyKey: this.idempotencyKey(request),
            correlationId: request.correlationId || payload.correlationId,
            principalRef: request.authData && request.authData.principalRef
        })));
    },

    /** Requests a Waste asset coupon redemption through Promotion/Coupon and Wallet/Loyalty intent references. */
    requestAssetCouponRedemption: function (request) {
        request = request || {};
        let payload = request.payload || {};
        return Promise.resolve(couponRedemptionService.requestRedemption(Object.assign({}, payload, {
            asset: Object.assign({}, payload.asset || {}, { code: request.params && request.params.assetCode || payload.asset && payload.asset.code }),
            authOwnerRef: request.authData && request.authData.ownerRef,
            idempotencyKey: this.idempotencyKey(request),
            correlationId: request.correlationId || payload.correlationId,
            principalRef: request.authData && request.authData.principalRef
        })));
    },

    /** Completes a Waste asset coupon redemption after Promotion/Coupon creates the entitlement. */
    completeAssetCouponRedemption: function (request) {
        request = request || {};
        let payload = request.payload || {};
        return Promise.resolve(couponRedemptionService.completeRedemption(Object.assign({}, payload, {
            asset: Object.assign({}, payload.asset || {}, { code: request.params && request.params.assetCode || payload.asset && payload.asset.code }),
            authOwnerRef: request.authData && request.authData.ownerRef,
            idempotencyKey: this.idempotencyKey(request),
            correlationId: request.correlationId || payload.correlationId,
            principalRef: request.authData && request.authData.principalRef
        })));
    },

    /** Cancels a pending Waste asset coupon redemption. */
    cancelAssetCouponRedemption: function (request) {
        request = request || {};
        let payload = request.payload || {};
        return Promise.resolve(couponRedemptionService.cancelRedemption(Object.assign({}, payload, {
            asset: Object.assign({}, payload.asset || {}, { code: request.params && request.params.assetCode || payload.asset && payload.asset.code }),
            authOwnerRef: request.authData && request.authData.ownerRef,
            idempotencyKey: this.idempotencyKey(request),
            correlationId: request.correlationId || payload.correlationId,
            principalRef: request.authData && request.authData.principalRef
        })));
    },

    /** Requests a Waste asset donation or recycling transfer. */
    requestAssetDonation: function (request) {
        request = request || {};
        let payload = request.payload || {};
        return Promise.resolve(donationTransferService.requestDonation(Object.assign({}, payload, {
            asset: Object.assign({}, payload.asset || {}, { code: request.params && request.params.assetCode || payload.asset && payload.asset.code }),
            authOwnerRef: request.authData && request.authData.ownerRef,
            idempotencyKey: this.idempotencyKey(request),
            correlationId: request.correlationId || payload.correlationId,
            principalRef: request.authData && request.authData.principalRef
        })));
    },

    /** Completes a Waste asset donation or recycling transfer after operational confirmation. */
    completeAssetDonation: function (request) {
        request = request || {};
        let payload = request.payload || {};
        return Promise.resolve(donationTransferService.completeDonation(Object.assign({}, payload, {
            asset: Object.assign({}, payload.asset || {}, { code: request.params && request.params.assetCode || payload.asset && payload.asset.code }),
            authOwnerRef: request.authData && request.authData.ownerRef,
            idempotencyKey: this.idempotencyKey(request),
            correlationId: request.correlationId || payload.correlationId,
            principalRef: request.authData && request.authData.principalRef
        })));
    },

    /** Cancels a pending Waste asset donation or recycling transfer. */
    cancelAssetDonation: function (request) {
        request = request || {};
        let payload = request.payload || {};
        return Promise.resolve(donationTransferService.cancelDonation(Object.assign({}, payload, {
            asset: Object.assign({}, payload.asset || {}, { code: request.params && request.params.assetCode || payload.asset && payload.asset.code }),
            authOwnerRef: request.authData && request.authData.ownerRef,
            idempotencyKey: this.idempotencyKey(request),
            correlationId: request.correlationId || payload.correlationId,
            principalRef: request.authData && request.authData.principalRef
        })));
    }
};
