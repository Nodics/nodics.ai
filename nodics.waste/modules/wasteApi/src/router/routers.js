/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module wasteApi/src/router/routers @description Declares secured generic Waste Management framework APIs. @layer router @owner wasteApi @override Later modules may add routes while preserving resource-oriented route keys and ownership boundaries. */
module.exports = {
    wasteApi: {
        internal: {
            collectionAcceptanceCheck: {
                secured: true, authTokenTypes: ['access', 'service'], accessGroups: ['serviceAccountUserGroup', 'employeeUserGroup'],
                permission: 'waste.collectionPoint.acceptance.check', apiExposure: 'wasteInternal',
                key: '/waste/collection-points/:collectionPointCode/acceptance-check', method: 'POST',
                controller: 'DefaultWasteInternalController', operation: 'collectionAcceptanceCheck',
                help: { requestType: 'secured', message: 'Checks whether submitted waste facts match authoritative collection acceptance rules.' }
            },
            submitWaste: {
                secured: true, authTokenTypes: ['access', 'service'], accessGroups: ['serviceAccountUserGroup', 'employeeUserGroup', 'customerGroup'],
                permission: 'waste.submission.create', apiExposure: 'wasteInternal',
                key: '/waste/submissions', method: 'POST',
                controller: 'DefaultWasteInternalController', operation: 'submitWaste',
                help: { requestType: 'secured', message: 'Creates or submits a generic waste submission.' }
            },
            transitionSubmission: {
                secured: true, authTokenTypes: ['access', 'service'], accessGroups: ['serviceAccountUserGroup', 'employeeUserGroup'],
                permission: 'waste.submission.transition', apiExposure: 'wasteInternal',
                key: '/waste/submissions/:submissionCode/transitions', method: 'POST',
                controller: 'DefaultWasteInternalController', operation: 'transitionSubmission',
                help: { requestType: 'secured', message: 'Applies a generic submission lifecycle transition.' }
            },
            calculateImpact: {
                secured: true, authTokenTypes: ['service'], accessGroups: ['serviceAccountUserGroup'],
                permission: 'waste.impact.calculate', apiExposure: 'wasteInternal',
                key: '/waste/impact-results', method: 'POST',
                controller: 'DefaultWasteInternalController', operation: 'calculateImpact',
                help: { requestType: 'secured', message: 'Calculates a Waste impact result from a versioned profile and source facts.' }
            },
            createAssetFromApprovedSubmission: {
                secured: true, authTokenTypes: ['access', 'service'], accessGroups: ['serviceAccountUserGroup', 'employeeUserGroup'],
                permission: 'waste.asset.create', apiExposure: 'wasteInternal',
                key: '/waste/assets/from-approved-submission', method: 'POST',
                controller: 'DefaultWasteInternalController', operation: 'createAssetFromApprovedSubmission',
                help: { requestType: 'secured', message: 'Builds a customer-owned Waste asset contract from an approved submission.' }
            },
            ownedAssets: {
                secured: true, authTokenTypes: ['access', 'service'], accessGroups: ['serviceAccountUserGroup', 'employeeUserGroup', 'customerGroup'],
                permission: 'waste.asset.own.read', apiExposure: 'wasteInternal',
                key: '/waste/assets/owned', method: 'POST',
                controller: 'DefaultWasteInternalController', operation: 'ownedAssets',
                help: { requestType: 'secured', message: 'Returns owner-scoped Waste assets for reusable customer applications such as Circa.' }
            },
            requestMarketplaceProjection: {
                secured: true, authTokenTypes: ['access', 'service'], accessGroups: ['serviceAccountUserGroup', 'employeeUserGroup', 'customerGroup'],
                permission: 'waste.asset.marketplace.project', apiExposure: 'wasteInternal',
                key: '/waste/assets/:assetCode/marketplace-projections', method: 'POST',
                controller: 'DefaultWasteInternalController', operation: 'requestMarketplaceProjection',
                help: { requestType: 'secured', message: 'Requests Commerce/Product projection for a tradeable Waste asset.' }
            },
            completeMarketplaceProjection: {
                secured: true, authTokenTypes: ['access', 'service'], accessGroups: ['serviceAccountUserGroup', 'employeeUserGroup'],
                permission: 'waste.asset.marketplace.project', apiExposure: 'wasteInternal',
                key: '/waste/assets/:assetCode/marketplace-projections/:projectionCode/complete', method: 'POST',
                controller: 'DefaultWasteInternalController', operation: 'completeMarketplaceProjection',
                help: { requestType: 'secured', message: 'Completes the Waste side of a Commerce/Product listing relationship.' }
            },
            closeMarketplaceProjection: {
                secured: true, authTokenTypes: ['access', 'service'], accessGroups: ['serviceAccountUserGroup', 'employeeUserGroup'],
                permission: 'waste.asset.marketplace.project', apiExposure: 'wasteInternal',
                key: '/waste/assets/:assetCode/marketplace-projections/:projectionCode/close', method: 'POST',
                controller: 'DefaultWasteInternalController', operation: 'closeMarketplaceProjection',
                help: { requestType: 'secured', message: 'Closes a Waste asset marketplace projection after Commerce cancellation, failure, or expiry.' }
            },
            reserveAssetSale: {
                secured: true, authTokenTypes: ['access', 'service'], accessGroups: ['serviceAccountUserGroup', 'employeeUserGroup'],
                permission: 'waste.asset.sale.transfer', apiExposure: 'wasteInternal',
                key: '/waste/assets/:assetCode/sale/reserve', method: 'POST',
                controller: 'DefaultWasteInternalController', operation: 'reserveAssetSale',
                help: { requestType: 'secured', message: 'Reserves a Waste asset sale from a Commerce order or accepted bid event.' }
            },
            completeAssetSale: {
                secured: true, authTokenTypes: ['access', 'service'], accessGroups: ['serviceAccountUserGroup', 'employeeUserGroup'],
                permission: 'waste.asset.sale.transfer', apiExposure: 'wasteInternal',
                key: '/waste/assets/:assetCode/sale/complete', method: 'POST',
                controller: 'DefaultWasteInternalController', operation: 'completeAssetSale',
                help: { requestType: 'secured', message: 'Completes a Waste asset sale after Commerce order and payment confirmation.' }
            },
            cancelAssetSale: {
                secured: true, authTokenTypes: ['access', 'service'], accessGroups: ['serviceAccountUserGroup', 'employeeUserGroup'],
                permission: 'waste.asset.sale.transfer', apiExposure: 'wasteInternal',
                key: '/waste/assets/:assetCode/sale/cancel', method: 'POST',
                controller: 'DefaultWasteInternalController', operation: 'cancelAssetSale',
                help: { requestType: 'secured', message: 'Cancels a pending Waste asset sale after Commerce cancellation or failure.' }
            },
            reverseAssetSale: {
                secured: true, authTokenTypes: ['access', 'service'], accessGroups: ['serviceAccountUserGroup', 'employeeUserGroup'],
                permission: 'waste.asset.sale.transfer', apiExposure: 'wasteInternal',
                key: '/waste/assets/:assetCode/sale/reverse', method: 'POST',
                controller: 'DefaultWasteInternalController', operation: 'reverseAssetSale',
                help: { requestType: 'secured', message: 'Reverses a completed Waste asset sale after Commerce reversal workflow.' }
            },
            requestAssetGift: {
                secured: true, authTokenTypes: ['access', 'service'], accessGroups: ['serviceAccountUserGroup', 'employeeUserGroup', 'customerGroup'],
                permission: 'waste.asset.gift.transfer', apiExposure: 'wasteInternal',
                key: '/waste/assets/:assetCode/gift/request', method: 'POST',
                controller: 'DefaultWasteInternalController', operation: 'requestAssetGift',
                help: { requestType: 'secured', message: 'Requests a customer-to-customer Waste asset gift.' }
            },
            acceptAssetGift: {
                secured: true, authTokenTypes: ['access', 'service'], accessGroups: ['serviceAccountUserGroup', 'employeeUserGroup', 'customerGroup'],
                permission: 'waste.asset.gift.transfer', apiExposure: 'wasteInternal',
                key: '/waste/assets/:assetCode/gift/accept', method: 'POST',
                controller: 'DefaultWasteInternalController', operation: 'acceptAssetGift',
                help: { requestType: 'secured', message: 'Accepts a pending customer-to-customer Waste asset gift.' }
            },
            cancelAssetGift: {
                secured: true, authTokenTypes: ['access', 'service'], accessGroups: ['serviceAccountUserGroup', 'employeeUserGroup', 'customerGroup'],
                permission: 'waste.asset.gift.transfer', apiExposure: 'wasteInternal',
                key: '/waste/assets/:assetCode/gift/cancel', method: 'POST',
                controller: 'DefaultWasteInternalController', operation: 'cancelAssetGift',
                help: { requestType: 'secured', message: 'Cancels a pending customer-to-customer Waste asset gift.' }
            },
            requestAssetCouponRedemption: {
                secured: true, authTokenTypes: ['access', 'service'], accessGroups: ['serviceAccountUserGroup', 'employeeUserGroup', 'customerGroup'],
                permission: 'waste.asset.coupon.redeem', apiExposure: 'wasteInternal',
                key: '/waste/assets/:assetCode/coupon-redemptions/request', method: 'POST',
                controller: 'DefaultWasteInternalController', operation: 'requestAssetCouponRedemption',
                help: { requestType: 'secured', message: 'Requests coupon entitlement and settlement intents for a Waste asset.' }
            },
            completeAssetCouponRedemption: {
                secured: true, authTokenTypes: ['access', 'service'], accessGroups: ['serviceAccountUserGroup', 'employeeUserGroup'],
                permission: 'waste.asset.coupon.redeem', apiExposure: 'wasteInternal',
                key: '/waste/assets/:assetCode/coupon-redemptions/complete', method: 'POST',
                controller: 'DefaultWasteInternalController', operation: 'completeAssetCouponRedemption',
                help: { requestType: 'secured', message: 'Completes a Waste asset coupon redemption after Promotion/Coupon entitlement creation.' }
            },
            cancelAssetCouponRedemption: {
                secured: true, authTokenTypes: ['access', 'service'], accessGroups: ['serviceAccountUserGroup', 'employeeUserGroup', 'customerGroup'],
                permission: 'waste.asset.coupon.redeem', apiExposure: 'wasteInternal',
                key: '/waste/assets/:assetCode/coupon-redemptions/cancel', method: 'POST',
                controller: 'DefaultWasteInternalController', operation: 'cancelAssetCouponRedemption',
                help: { requestType: 'secured', message: 'Cancels a pending Waste asset coupon redemption.' }
            },
            requestAssetDonation: {
                secured: true, authTokenTypes: ['access', 'service'], accessGroups: ['serviceAccountUserGroup', 'employeeUserGroup', 'customerGroup'],
                permission: 'waste.asset.donation.transfer', apiExposure: 'wasteInternal',
                key: '/waste/assets/:assetCode/donations/request', method: 'POST',
                controller: 'DefaultWasteInternalController', operation: 'requestAssetDonation',
                help: { requestType: 'secured', message: 'Requests a Waste asset donation or recycling transfer.' }
            },
            completeAssetDonation: {
                secured: true, authTokenTypes: ['access', 'service'], accessGroups: ['serviceAccountUserGroup', 'employeeUserGroup'],
                permission: 'waste.asset.donation.transfer', apiExposure: 'wasteInternal',
                key: '/waste/assets/:assetCode/donations/complete', method: 'POST',
                controller: 'DefaultWasteInternalController', operation: 'completeAssetDonation',
                help: { requestType: 'secured', message: 'Completes a Waste asset donation or recycling transfer after operational confirmation.' }
            },
            cancelAssetDonation: {
                secured: true, authTokenTypes: ['access', 'service'], accessGroups: ['serviceAccountUserGroup', 'employeeUserGroup', 'customerGroup'],
                permission: 'waste.asset.donation.transfer', apiExposure: 'wasteInternal',
                key: '/waste/assets/:assetCode/donations/cancel', method: 'POST',
                controller: 'DefaultWasteInternalController', operation: 'cancelAssetDonation',
                help: { requestType: 'secured', message: 'Cancels a pending Waste asset donation or recycling transfer.' }
            }
        }
    }
};
