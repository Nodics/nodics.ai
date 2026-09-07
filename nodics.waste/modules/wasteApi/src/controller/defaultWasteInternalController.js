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

    /** Invokes a Waste facade operation through promise or callback transport. */
    invoke: function (operation, request, callback) {
        let promise = FACADE.DefaultWasteInternalFacade[operation](this.request(request)).then(function (data) {
            return { data: data };
        });
        if (!callback) return promise;
        promise.then(function (value) { callback(null, value); }).catch(callback);
    },

    /** Checks collection acceptance. */
    collectionAcceptanceCheck: function (request, callback) {
        return this.invoke('collectionAcceptanceCheck', request, callback);
    },

    /** Searches collection centres. */
    searchCollectionCentres: function (request, callback) {
        return this.invoke('searchCollectionCentres', request, callback);
    },

    /** Creates or submits a waste submission. */
    submitWaste: function (request, callback) {
        return this.invoke('submitWaste', request, callback);
    },

    /** Transitions a waste submission. */
    transitionSubmission: function (request, callback) {
        return this.invoke('transitionSubmission', request, callback);
    },

    /** Calculates a Waste impact result. */
    calculateImpact: function (request, callback) {
        return this.invoke('calculateImpact', request, callback);
    },

    /** Creates a Waste asset contract from an approved submission. */
    createAssetFromApprovedSubmission: function (request, callback) {
        return this.invoke('createAssetFromApprovedSubmission', request, callback);
    },

    /** Returns owner-scoped Waste asset records. */
    ownedAssets: function (request, callback) {
        return this.invoke('ownedAssets', request, callback);
    },

    /** Requests a Commerce/Product projection for a Waste asset. */
    requestMarketplaceProjection: function (request, callback) {
        return this.invoke('requestMarketplaceProjection', request, callback);
    },

    /** Completes a Waste asset marketplace projection. */
    completeMarketplaceProjection: function (request, callback) {
        return this.invoke('completeMarketplaceProjection', request, callback);
    },

    /** Closes a Waste asset marketplace projection. */
    closeMarketplaceProjection: function (request, callback) {
        return this.invoke('closeMarketplaceProjection', request, callback);
    },

    /** Reserves a Waste asset sale. */
    reserveAssetSale: function (request, callback) {
        return this.invoke('reserveAssetSale', request, callback);
    },

    /** Completes a Waste asset sale. */
    completeAssetSale: function (request, callback) {
        return this.invoke('completeAssetSale', request, callback);
    },

    /** Cancels a Waste asset sale. */
    cancelAssetSale: function (request, callback) {
        return this.invoke('cancelAssetSale', request, callback);
    },

    /** Reverses a Waste asset sale. */
    reverseAssetSale: function (request, callback) {
        return this.invoke('reverseAssetSale', request, callback);
    },

    /** Requests a Waste asset gift. */
    requestAssetGift: function (request, callback) {
        return this.invoke('requestAssetGift', request, callback);
    },

    /** Accepts a Waste asset gift. */
    acceptAssetGift: function (request, callback) {
        return this.invoke('acceptAssetGift', request, callback);
    },

    /** Cancels a Waste asset gift. */
    cancelAssetGift: function (request, callback) {
        return this.invoke('cancelAssetGift', request, callback);
    },

    /** Requests a Waste asset coupon redemption. */
    requestAssetCouponRedemption: function (request, callback) {
        return this.invoke('requestAssetCouponRedemption', request, callback);
    },

    /** Completes a Waste asset coupon redemption. */
    completeAssetCouponRedemption: function (request, callback) {
        return this.invoke('completeAssetCouponRedemption', request, callback);
    },

    /** Cancels a Waste asset coupon redemption. */
    cancelAssetCouponRedemption: function (request, callback) {
        return this.invoke('cancelAssetCouponRedemption', request, callback);
    },

    /** Requests a Waste asset donation or recycling transfer. */
    requestAssetDonation: function (request, callback) {
        return this.invoke('requestAssetDonation', request, callback);
    },

    /** Completes a Waste asset donation or recycling transfer. */
    completeAssetDonation: function (request, callback) {
        return this.invoke('completeAssetDonation', request, callback);
    },

    /** Cancels a Waste asset donation or recycling transfer. */
    cancelAssetDonation: function (request, callback) {
        return this.invoke('cancelAssetDonation', request, callback);
    }
};
