/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module wasteApi/src/controller/defaultWasteInternalController @description Maps secured Waste API requests into the internal Waste facade. @layer controller @owner wasteApi @override Later modules may add request mapping without changing route ownership. */
module.exports = {
    /** Builds a normalized facade request from HTTP context. */
    request: function (request) {
        request = request || {};
        let httpRequest = request.httpRequest || {};
        return {
            tenant: request.authData && request.authData.tenant,
            authData: request.authData,
            params: httpRequest.params || request.params || {},
            payload: httpRequest.body || request.payload || {},
            idempotencyKey: httpRequest.headers && (httpRequest.headers['Idempotency-Key'] || httpRequest.headers['idempotency-key']),
            correlationId: httpRequest.headers && (httpRequest.headers['X-Correlation-Id'] || httpRequest.headers['x-correlation-id'])
        };
    },

    /** Checks collection acceptance. */
    collectionAcceptanceCheck: function (request) {
        return FACADE.DefaultWasteInternalFacade.collectionAcceptanceCheck(this.request(request)).then(function (data) { return { data: data }; });
    },

    /** Creates or submits a waste submission. */
    submitWaste: function (request) {
        return FACADE.DefaultWasteInternalFacade.submitWaste(this.request(request)).then(function (data) { return { data: data }; });
    },

    /** Transitions a waste submission. */
    transitionSubmission: function (request) {
        return FACADE.DefaultWasteInternalFacade.transitionSubmission(this.request(request)).then(function (data) { return { data: data }; });
    },

    /** Calculates a Waste impact result. */
    calculateImpact: function (request) {
        return FACADE.DefaultWasteInternalFacade.calculateImpact(this.request(request)).then(function (data) { return { data: data }; });
    },

    /** Creates a Waste asset contract from an approved submission. */
    createAssetFromApprovedSubmission: function (request) {
        return FACADE.DefaultWasteInternalFacade.createAssetFromApprovedSubmission(this.request(request)).then(function (data) { return { data: data }; });
    },

    /** Returns owner-scoped Waste asset records. */
    ownedAssets: function (request) {
        return FACADE.DefaultWasteInternalFacade.ownedAssets(this.request(request)).then(function (data) { return { data: data }; });
    },

    /** Requests a Commerce/Product projection for a Waste asset. */
    requestMarketplaceProjection: function (request) {
        return FACADE.DefaultWasteInternalFacade.requestMarketplaceProjection(this.request(request)).then(function (data) { return { data: data }; });
    },

    /** Completes a Waste asset marketplace projection. */
    completeMarketplaceProjection: function (request) {
        return FACADE.DefaultWasteInternalFacade.completeMarketplaceProjection(this.request(request)).then(function (data) { return { data: data }; });
    },

    /** Closes a Waste asset marketplace projection. */
    closeMarketplaceProjection: function (request) {
        return FACADE.DefaultWasteInternalFacade.closeMarketplaceProjection(this.request(request)).then(function (data) { return { data: data }; });
    },

    /** Reserves a Waste asset sale. */
    reserveAssetSale: function (request) {
        return FACADE.DefaultWasteInternalFacade.reserveAssetSale(this.request(request)).then(function (data) { return { data: data }; });
    },

    /** Completes a Waste asset sale. */
    completeAssetSale: function (request) {
        return FACADE.DefaultWasteInternalFacade.completeAssetSale(this.request(request)).then(function (data) { return { data: data }; });
    },

    /** Cancels a Waste asset sale. */
    cancelAssetSale: function (request) {
        return FACADE.DefaultWasteInternalFacade.cancelAssetSale(this.request(request)).then(function (data) { return { data: data }; });
    },

    /** Reverses a Waste asset sale. */
    reverseAssetSale: function (request) {
        return FACADE.DefaultWasteInternalFacade.reverseAssetSale(this.request(request)).then(function (data) { return { data: data }; });
    },

    /** Requests a Waste asset gift. */
    requestAssetGift: function (request) {
        return FACADE.DefaultWasteInternalFacade.requestAssetGift(this.request(request)).then(function (data) { return { data: data }; });
    },

    /** Accepts a Waste asset gift. */
    acceptAssetGift: function (request) {
        return FACADE.DefaultWasteInternalFacade.acceptAssetGift(this.request(request)).then(function (data) { return { data: data }; });
    },

    /** Cancels a Waste asset gift. */
    cancelAssetGift: function (request) {
        return FACADE.DefaultWasteInternalFacade.cancelAssetGift(this.request(request)).then(function (data) { return { data: data }; });
    },

    /** Requests a Waste asset coupon redemption. */
    requestAssetCouponRedemption: function (request) {
        return FACADE.DefaultWasteInternalFacade.requestAssetCouponRedemption(this.request(request)).then(function (data) { return { data: data }; });
    },

    /** Completes a Waste asset coupon redemption. */
    completeAssetCouponRedemption: function (request) {
        return FACADE.DefaultWasteInternalFacade.completeAssetCouponRedemption(this.request(request)).then(function (data) { return { data: data }; });
    },

    /** Cancels a Waste asset coupon redemption. */
    cancelAssetCouponRedemption: function (request) {
        return FACADE.DefaultWasteInternalFacade.cancelAssetCouponRedemption(this.request(request)).then(function (data) { return { data: data }; });
    },

    /** Requests a Waste asset donation or recycling transfer. */
    requestAssetDonation: function (request) {
        return FACADE.DefaultWasteInternalFacade.requestAssetDonation(this.request(request)).then(function (data) { return { data: data }; });
    },

    /** Completes a Waste asset donation or recycling transfer. */
    completeAssetDonation: function (request) {
        return FACADE.DefaultWasteInternalFacade.completeAssetDonation(this.request(request)).then(function (data) { return { data: data }; });
    },

    /** Cancels a Waste asset donation or recycling transfer. */
    cancelAssetDonation: function (request) {
        return FACADE.DefaultWasteInternalFacade.cancelAssetDonation(this.request(request)).then(function (data) { return { data: data }; });
    }
};
