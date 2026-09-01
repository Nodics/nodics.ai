/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const WASTE_ROUTES = require('../../../../../../../nodics.waste/modules/wasteApi/src/router/routers').wasteApi.internal;
const UTILS = require('../../../../../../../nodics.waste/modules/wasteCore/src/utils/utils');

/** @module circa.eWaste/src/service/defaultCircaEWasteApplicationContractService @description Builds the reusable Circa eWaste backend application contract from existing Waste, eWaste, and wasteRecycling capabilities. @layer service @owner circa.eWaste */
module.exports = {
    /** Initializes this service. */
    init: function () { return Promise.resolve(true); },

    /** Completes this service startup. */
    postInit: function () { return Promise.resolve(true); },

    /** Throws a Nodics-compatible error when available. */
    fail: function (code, message) {
        let error = typeof CLASSES !== 'undefined' && CLASSES.NodicsError ? new CLASSES.NodicsError(code, message) : new Error(message);
        error.code = code;
        throw error;
    },

    /** Normalizes optional arrays. */
    array: function (value) {
        if (value === undefined || value === null) return [];
        return Array.isArray(value) ? value : [value];
    },

    /** Normalizes code components for deterministic app contract identifiers. */
    codePart: function (value) {
        return UTILS.normalizeCode(value).replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    },

    /** Rejects fields owned by another framework, project, provider, or frontend. */
    assertCompositionOnly: function (value, path) {
        if (!value || typeof value !== 'object') return true;
        let forbidden = [
            'tenant',
            'enterpriseCode',
            'rewardFormula',
            'walletBalance',
            'ledgerEntry',
            'ledgerEntries',
            'couponCode',
            'couponToken',
            'couponSecret',
            'productName',
            'price',
            'bidRules',
            'paymentAmount',
            'mediaUrl',
            'mapProvider',
            'apiKey',
            'accessToken',
            'clientSecret',
            'trackingNumber',
            'carrierCode',
            'certificateNumber',
            'recyclerAdapter',
            'logisticsAdapter',
            'brandTheme'
        ];
        Object.keys(value).forEach(function (key) {
            if (forbidden.indexOf(key) >= 0) {
                this.fail('ERR_CIRCA_EWASTE_COMPOSITION_FIELD_FORBIDDEN', (path || 'request') + '.' + key + ' must stay outside Circa eWaste reusable backend composition');
            }
            this.assertCompositionOnly(value[key], (path || 'request') + '.' + key);
        }, this);
        return true;
    },

    /** Returns a stable operation reference to a Waste API route. */
    routeRef: function (operation) {
        let route = WASTE_ROUTES[operation];
        if (!route) this.fail('ERR_CIRCA_EWASTE_WASTE_ROUTE_MISSING', 'Waste API route is required for ' + operation);
        return {
            module: 'wasteApi',
            controller: route.controller,
            operation: route.operation,
            routeKey: route.key,
            method: route.method,
            permission: route.permission,
            accessGroups: route.accessGroups,
            apiExposure: route.apiExposure
        };
    },

    /** Builds one reusable Circa journey entry. */
    journey: function (code, label, operation, ownerModule, extras) {
        return Object.assign({
            code: code,
            label: label,
            ownerModule: ownerModule || 'wasteApi',
            operationRef: operation ? this.routeRef(operation) : undefined,
            status: 'ACTIVE'
        }, extras || {});
    },

    /** Builds the reusable Circa eWaste backend application contract. */
    applicationContract: function (request) {
        request = request || {};
        this.assertCompositionOnly(request);
        let application = Object.assign({
            code: 'CIRCA_EWASTE',
            displayName: 'Nodics Circa eWaste',
            backendModuleName: 'circa.eWaste',
            frontendModuleName: 'nodics.circa.eWaste',
            projectModuleName: 'circa.eWaste',
            frameworkModuleName: 'nodics.waste',
            requiredScenarioModules: ['eWaste', 'wasteRecycling']
        }, request.application || {});
        let context = {
            now: request.now || new Date(),
            correlationId: request.correlationId,
            idempotencyKey: request.idempotencyKey
        };
        return {
            code: this.codePart(application.code),
            moduleName: application.backendModuleName,
            displayName: application.displayName,
            frontendModuleName: application.frontendModuleName,
            projectModuleName: application.projectModuleName,
            frameworkModuleName: application.frameworkModuleName,
            requiredScenarioModules: application.requiredScenarioModules,
            ownershipBoundaries: {
                wasteFactsOwner: 'nodics.waste',
                eWastePresetOwner: 'eWaste',
                recyclingHandoffOwner: 'wasteRecycling',
                frontendOwner: application.frontendModuleName,
                walletOwner: 'nodics.loyalty',
                commerceOwner: 'nodics.commerce',
                couponOwner: 'promotion',
                mediaOwner: 'media',
                locationOwner: 'location',
                projectCustomizationOwner: 'project'
            },
            journeys: [
                this.journey('CIRCA_EWASTE_SUBMISSION', 'Submit e-waste', 'submitWaste', 'wasteApi', { sourcePolicyOwner: 'eWaste' }),
                this.journey('CIRCA_EWASTE_COLLECTION_ACCEPTANCE', 'Check collection acceptance', 'collectionAcceptanceCheck', 'wasteApi', { sourcePolicyOwner: 'eWaste' }),
                this.journey('CIRCA_EWASTE_ASSETS', 'View approved assets', 'ownedAssets', 'wasteApi'),
                this.journey('CIRCA_EWASTE_MARKETPLACE_PROJECTION', 'List asset for marketplace', 'requestMarketplaceProjection', 'wasteApi', { externalOwner: 'nodics.commerce' }),
                this.journey('CIRCA_EWASTE_SALE_CALLBACKS', 'Receive sale lifecycle callbacks', 'completeAssetSale', 'wasteApi', { externalOwner: 'nodics.commerce' }),
                this.journey('CIRCA_EWASTE_GIFT', 'Gift asset', 'requestAssetGift', 'wasteApi', { walletSettlementOwner: 'nodics.loyalty' }),
                this.journey('CIRCA_EWASTE_DONATION', 'Donate or recycle asset', 'requestAssetDonation', 'wasteApi', { handoffOwner: 'wasteRecycling' }),
                this.journey('CIRCA_EWASTE_COUPON_REDEMPTION', 'Redeem rewards for coupon', 'requestAssetCouponRedemption', 'wasteApi', { couponOwner: 'promotion', walletSettlementOwner: 'nodics.loyalty' }),
                this.journey('CIRCA_EWASTE_RECYCLING_HANDOFF', 'Create recycling handoff', undefined, 'wasteRecycling', { service: 'DefaultWasteRecyclingHandoffContractService', operation: 'requestHandoff' })
            ],
            evidenceRefs: this.array(request.evidenceRefs),
            policyRefs: this.array(request.policyRefs),
            generatedAt: context.now,
            correlationId: context.correlationId,
            idempotencyKey: context.idempotencyKey
        };
    },

    /** Maps configurable journey keys to stable journey contract codes. */
    journeyConfigCodeMap: function () {
        return {
            submission: 'CIRCA_EWASTE_SUBMISSION',
            collectionAcceptance: 'CIRCA_EWASTE_COLLECTION_ACCEPTANCE',
            approvedAsset: 'CIRCA_EWASTE_ASSETS',
            marketplace: 'CIRCA_EWASTE_MARKETPLACE_PROJECTION',
            saleCallbacks: 'CIRCA_EWASTE_SALE_CALLBACKS',
            gift: 'CIRCA_EWASTE_GIFT',
            donation: 'CIRCA_EWASTE_DONATION',
            couponRedemption: 'CIRCA_EWASTE_COUPON_REDEMPTION',
            recyclingHandoff: 'CIRCA_EWASTE_RECYCLING_HANDOFF'
        };
    },

    /** Filters journeys by enabled journey configuration. */
    enabledJourneys: function (contract, journeyConfig) {
        contract = contract || this.applicationContract({});
        journeyConfig = journeyConfig || {};
        let codeMap = this.journeyConfigCodeMap();
        let disabledCodes = Object.keys(journeyConfig).filter(function (key) {
            return journeyConfig[key] && journeyConfig[key].enabled === false;
        }).map(function (key) {
            return codeMap[key] || this.codePart(['CIRCA_EWASTE', key].join('_'));
        }, this);
        return contract.journeys.filter(function (journey) {
            return disabledCodes.indexOf(journey.code) < 0;
        });
    }
};
