/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module wasteApi/test/wasteApiRouteContract @description Verifies Waste API routes remain secured, generic, and resource-oriented. @layer test @owner wasteApi */
const assert = require('assert');
const routes = require('../src/router/routers').wasteApi.internal;
const controller = require('../src/controller/defaultWasteInternalController');

Object.values(routes).forEach(function (route) {
    assert.strictEqual(route.secured, true);
    assert.strictEqual(route.apiExposure, 'wasteInternal');
    assert(!route.key.includes('/i2e'), 'Waste API must not expose partner-prefixed routes');
    assert(!route.key.includes('/customer/'), 'Waste API route keys must not use customer audience prefixes');
    assert(!route.key.includes('/admin/'), 'Waste API route keys must not use role prefixes');
    assert(!route.key.includes('/loyalty'), 'Waste API must not own Loyalty routes');
    assert(!route.key.includes('/coupons'), 'Waste API must not own Commerce coupon routes');
});

assert.strictEqual(routes.collectionAcceptanceCheck.key, '/waste/collection-points/:collectionPointCode/acceptance-check');
assert.strictEqual(routes.submitWaste.key, '/waste/submissions');
assert.strictEqual(routes.transitionSubmission.key, '/waste/submissions/:submissionCode/transitions');
assert.strictEqual(routes.calculateImpact.key, '/waste/impact-results');
assert.strictEqual(routes.createAssetFromApprovedSubmission.key, '/waste/assets/from-approved-submission');
assert.strictEqual(routes.createAssetFromApprovedSubmission.permission, 'waste.asset.create');
assert.strictEqual(routes.ownedAssets.key, '/waste/assets/owned');
assert.strictEqual(routes.ownedAssets.permission, 'waste.asset.own.read');
assert.strictEqual(routes.requestMarketplaceProjection.key, '/waste/assets/:assetCode/marketplace-projections');
assert.strictEqual(routes.requestMarketplaceProjection.permission, 'waste.asset.marketplace.project');
assert.strictEqual(routes.completeMarketplaceProjection.key, '/waste/assets/:assetCode/marketplace-projections/:projectionCode/complete');
assert.strictEqual(routes.closeMarketplaceProjection.key, '/waste/assets/:assetCode/marketplace-projections/:projectionCode/close');
assert.strictEqual(routes.reserveAssetSale.key, '/waste/assets/:assetCode/sale/reserve');
assert.strictEqual(routes.reserveAssetSale.permission, 'waste.asset.sale.transfer');
assert.strictEqual(routes.completeAssetSale.key, '/waste/assets/:assetCode/sale/complete');
assert.strictEqual(routes.completeAssetSale.permission, 'waste.asset.sale.transfer');
assert.strictEqual(routes.cancelAssetSale.key, '/waste/assets/:assetCode/sale/cancel');
assert.strictEqual(routes.cancelAssetSale.permission, 'waste.asset.sale.transfer');
assert.strictEqual(routes.reverseAssetSale.key, '/waste/assets/:assetCode/sale/reverse');
assert.strictEqual(routes.reverseAssetSale.permission, 'waste.asset.sale.transfer');
assert.strictEqual(routes.requestAssetGift.key, '/waste/assets/:assetCode/gift/request');
assert.strictEqual(routes.requestAssetGift.permission, 'waste.asset.gift.transfer');
assert.strictEqual(routes.acceptAssetGift.key, '/waste/assets/:assetCode/gift/accept');
assert.strictEqual(routes.acceptAssetGift.permission, 'waste.asset.gift.transfer');
assert.strictEqual(routes.cancelAssetGift.key, '/waste/assets/:assetCode/gift/cancel');
assert.strictEqual(routes.cancelAssetGift.permission, 'waste.asset.gift.transfer');
assert.strictEqual(routes.requestAssetCouponRedemption.key, '/waste/assets/:assetCode/coupon-redemptions/request');
assert.strictEqual(routes.requestAssetCouponRedemption.permission, 'waste.asset.coupon.redeem');
assert.strictEqual(routes.completeAssetCouponRedemption.key, '/waste/assets/:assetCode/coupon-redemptions/complete');
assert.strictEqual(routes.completeAssetCouponRedemption.permission, 'waste.asset.coupon.redeem');
assert.strictEqual(routes.cancelAssetCouponRedemption.key, '/waste/assets/:assetCode/coupon-redemptions/cancel');
assert.strictEqual(routes.cancelAssetCouponRedemption.permission, 'waste.asset.coupon.redeem');
assert.strictEqual(routes.requestAssetDonation.key, '/waste/assets/:assetCode/donations/request');
assert.strictEqual(routes.requestAssetDonation.permission, 'waste.asset.donation.transfer');
assert.strictEqual(routes.completeAssetDonation.key, '/waste/assets/:assetCode/donations/complete');
assert.strictEqual(routes.completeAssetDonation.permission, 'waste.asset.donation.transfer');
assert.strictEqual(routes.cancelAssetDonation.key, '/waste/assets/:assetCode/donations/cancel');
assert.strictEqual(routes.cancelAssetDonation.permission, 'waste.asset.donation.transfer');
assert.deepStrictEqual(routes.calculateImpact.authTokenTypes, ['service']);

async function main() {
    const calls = [];
    global.FACADE = {
        DefaultWasteInternalFacade: {
            submitWaste: function (request) {
                calls.push(request);
                return Promise.resolve({ idempotencyKey: request.idempotencyKey, correlationId: request.correlationId, tenant: request.tenant });
            },
            createAssetFromApprovedSubmission: function (request) {
                calls.push(request);
                return Promise.resolve({ idempotencyKey: request.idempotencyKey, correlationId: request.correlationId, submissionCode: request.payload.submission.code });
            },
            ownedAssets: function (request) {
                calls.push(request);
                return Promise.resolve([{ code: 'WASTE_ASSET_SUB_001', ownerRef: request.payload.ownerRef }]);
            },
            requestMarketplaceProjection: function (request) {
                calls.push(request);
                return Promise.resolve({ assetCode: request.params.assetCode, idempotencyKey: request.idempotencyKey });
            },
            completeMarketplaceProjection: function (request) {
                calls.push(request);
                return Promise.resolve({ assetCode: request.params.assetCode, projectionCode: request.params.projectionCode });
            },
            closeMarketplaceProjection: function (request) {
                calls.push(request);
                return Promise.resolve({ assetCode: request.params.assetCode, projectionCode: request.params.projectionCode });
            },
            reserveAssetSale: function (request) {
                calls.push(request);
                return Promise.resolve({ assetCode: request.params.assetCode, idempotencyKey: request.idempotencyKey });
            },
            completeAssetSale: function (request) {
                calls.push(request);
                return Promise.resolve({ assetCode: request.params.assetCode, status: 'completed' });
            },
            cancelAssetSale: function (request) {
                calls.push(request);
                return Promise.resolve({ assetCode: request.params.assetCode, status: 'cancelled' });
            },
            reverseAssetSale: function (request) {
                calls.push(request);
                return Promise.resolve({ assetCode: request.params.assetCode, status: 'reversed' });
            },
            requestAssetGift: function (request) {
                calls.push(request);
                return Promise.resolve({ assetCode: request.params.assetCode, idempotencyKey: request.idempotencyKey, ownerRef: request.authData && request.authData.ownerRef });
            },
            acceptAssetGift: function (request) {
                calls.push(request);
                return Promise.resolve({ assetCode: request.params.assetCode, status: 'accepted' });
            },
            cancelAssetGift: function (request) {
                calls.push(request);
                return Promise.resolve({ assetCode: request.params.assetCode, status: 'cancelled' });
            },
            requestAssetCouponRedemption: function (request) {
                calls.push(request);
                return Promise.resolve({ assetCode: request.params.assetCode, idempotencyKey: request.idempotencyKey, ownerRef: request.authData && request.authData.ownerRef });
            },
            completeAssetCouponRedemption: function (request) {
                calls.push(request);
                return Promise.resolve({ assetCode: request.params.assetCode, status: 'completed' });
            },
            cancelAssetCouponRedemption: function (request) {
                calls.push(request);
                return Promise.resolve({ assetCode: request.params.assetCode, status: 'cancelled' });
            },
            requestAssetDonation: function (request) {
                calls.push(request);
                return Promise.resolve({ assetCode: request.params.assetCode, idempotencyKey: request.idempotencyKey, ownerRef: request.authData && request.authData.ownerRef });
            },
            completeAssetDonation: function (request) {
                calls.push(request);
                return Promise.resolve({ assetCode: request.params.assetCode, status: 'completed' });
            },
            cancelAssetDonation: function (request) {
                calls.push(request);
                return Promise.resolve({ assetCode: request.params.assetCode, status: 'cancelled' });
            }
        }
    };
    let response = await controller.submitWaste({
        authData: { tenant: 'runtimeTenantFromToken' },
        httpRequest: {
            headers: { 'Idempotency-Key': 'submit-header-001', 'X-Correlation-Id': 'corr-header-001' },
            body: { categoryCode: 'PHONE' }
        }
    });
    assert.strictEqual(response.data.idempotencyKey, 'submit-header-001');
    assert.strictEqual(response.data.correlationId, 'corr-header-001');
    assert.strictEqual(response.data.tenant, 'runtimeTenantFromToken');
    assert.strictEqual(calls[0].payload.categoryCode, 'PHONE');

    response = await controller.createAssetFromApprovedSubmission({
        authData: { tenant: 'runtimeTenantFromToken' },
        httpRequest: {
            headers: { 'Idempotency-Key': 'asset-header-001', 'X-Correlation-Id': 'corr-asset-001' },
            body: { submission: { code: 'sub-001' } }
        }
    });
    assert.strictEqual(response.data.idempotencyKey, 'asset-header-001');
    assert.strictEqual(response.data.correlationId, 'corr-asset-001');
    assert.strictEqual(response.data.submissionCode, 'sub-001');

    response = await controller.ownedAssets({
        authData: { tenant: 'runtimeTenantFromToken' },
        httpRequest: {
            headers: { 'Idempotency-Key': 'owned-header-001' },
            body: { ownerRef: { module: 'profile', schema: 'customer', code: 'customer-001' } }
        }
    });
    assert.strictEqual(response.data[0].code, 'WASTE_ASSET_SUB_001');

    response = await controller.requestMarketplaceProjection({
        authData: { tenant: 'runtimeTenantFromToken' },
        httpRequest: {
            params: { assetCode: 'WASTE_ASSET_SUB_001' },
            headers: { 'Idempotency-Key': 'market-header-001' },
            body: { asset: { assetStatus: 'OWNED' } }
        }
    });
    assert.strictEqual(response.data.assetCode, 'WASTE_ASSET_SUB_001');
    assert.strictEqual(response.data.idempotencyKey, 'market-header-001');

    response = await controller.completeMarketplaceProjection({
        httpRequest: {
            params: { assetCode: 'WASTE_ASSET_SUB_001', projectionCode: 'projection-001' },
            headers: {},
            body: {}
        }
    });
    assert.strictEqual(response.data.projectionCode, 'projection-001');

    response = await controller.closeMarketplaceProjection({
        httpRequest: {
            params: { assetCode: 'WASTE_ASSET_SUB_001', projectionCode: 'projection-001' },
            headers: {},
            body: { closeStatus: 'CANCELLED' }
        }
    });
    assert.strictEqual(response.data.assetCode, 'WASTE_ASSET_SUB_001');

    response = await controller.reserveAssetSale({
        httpRequest: {
            params: { assetCode: 'WASTE_ASSET_SUB_001' },
            headers: { 'Idempotency-Key': 'sale-header-001' },
            body: { commerceOrderRef: { module: 'commerce', schema: 'order', code: 'order-001' } }
        }
    });
    assert.strictEqual(response.data.assetCode, 'WASTE_ASSET_SUB_001');
    assert.strictEqual(response.data.idempotencyKey, 'sale-header-001');

    response = await controller.completeAssetSale({
        httpRequest: {
            params: { assetCode: 'WASTE_ASSET_SUB_001' },
            headers: {},
            body: {}
        }
    });
    assert.strictEqual(response.data.status, 'completed');

    response = await controller.cancelAssetSale({
        httpRequest: {
            params: { assetCode: 'WASTE_ASSET_SUB_001' },
            headers: {},
            body: {}
        }
    });
    assert.strictEqual(response.data.status, 'cancelled');

    response = await controller.reverseAssetSale({
        httpRequest: {
            params: { assetCode: 'WASTE_ASSET_SUB_001' },
            headers: {},
            body: {}
        }
    });
    assert.strictEqual(response.data.status, 'reversed');

    response = await controller.requestAssetGift({
        authData: { ownerRef: { module: 'profile', schema: 'customer', code: 'customer-001' } },
        httpRequest: {
            params: { assetCode: 'WASTE_ASSET_SUB_001' },
            headers: { 'Idempotency-Key': 'gift-header-001' },
            body: { receiverRef: { module: 'profile', schema: 'customer', code: 'customer-002' } }
        }
    });
    assert.strictEqual(response.data.assetCode, 'WASTE_ASSET_SUB_001');
    assert.strictEqual(response.data.idempotencyKey, 'gift-header-001');
    assert.strictEqual(response.data.ownerRef.code, 'customer-001');

    response = await controller.acceptAssetGift({
        httpRequest: {
            params: { assetCode: 'WASTE_ASSET_SUB_001' },
            headers: {},
            body: {}
        }
    });
    assert.strictEqual(response.data.status, 'accepted');

    response = await controller.cancelAssetGift({
        httpRequest: {
            params: { assetCode: 'WASTE_ASSET_SUB_001' },
            headers: {},
            body: {}
        }
    });
    assert.strictEqual(response.data.status, 'cancelled');

    response = await controller.requestAssetCouponRedemption({
        authData: { ownerRef: { module: 'profile', schema: 'customer', code: 'customer-001' } },
        httpRequest: {
            params: { assetCode: 'WASTE_ASSET_SUB_001' },
            headers: { 'Idempotency-Key': 'coupon-header-001' },
            body: { couponListingRef: { module: 'promotion', schema: 'couponListing', code: 'coupon-listing-001' } }
        }
    });
    assert.strictEqual(response.data.assetCode, 'WASTE_ASSET_SUB_001');
    assert.strictEqual(response.data.idempotencyKey, 'coupon-header-001');
    assert.strictEqual(response.data.ownerRef.code, 'customer-001');

    response = await controller.completeAssetCouponRedemption({
        httpRequest: {
            params: { assetCode: 'WASTE_ASSET_SUB_001' },
            headers: {},
            body: { couponEntitlementRef: { module: 'promotion', schema: 'couponEntitlement', code: 'coupon-entitlement-001' } }
        }
    });
    assert.strictEqual(response.data.status, 'completed');

    response = await controller.cancelAssetCouponRedemption({
        httpRequest: {
            params: { assetCode: 'WASTE_ASSET_SUB_001' },
            headers: {},
            body: {}
        }
    });
    assert.strictEqual(response.data.status, 'cancelled');

    response = await controller.requestAssetDonation({
        authData: { ownerRef: { module: 'profile', schema: 'customer', code: 'customer-001' } },
        httpRequest: {
            params: { assetCode: 'WASTE_ASSET_SUB_001' },
            headers: { 'Idempotency-Key': 'donation-header-001' },
            body: { recyclerRef: { module: 'recycler', schema: 'partnerFacility', code: 'recycler-facility-001' } }
        }
    });
    assert.strictEqual(response.data.assetCode, 'WASTE_ASSET_SUB_001');
    assert.strictEqual(response.data.idempotencyKey, 'donation-header-001');
    assert.strictEqual(response.data.ownerRef.code, 'customer-001');

    response = await controller.completeAssetDonation({
        httpRequest: {
            params: { assetCode: 'WASTE_ASSET_SUB_001' },
            headers: {},
            body: { movementRef: { module: 'wasteMovement', schema: 'wasteMovementEvent', code: 'movement-001' } }
        }
    });
    assert.strictEqual(response.data.status, 'completed');

    response = await controller.cancelAssetDonation({
        httpRequest: {
            params: { assetCode: 'WASTE_ASSET_SUB_001' },
            headers: {},
            body: {}
        }
    });
    assert.strictEqual(response.data.status, 'cancelled');
    delete global.FACADE;
    console.log('Waste API route contract validated');
}

main().catch(function (error) {
    console.error(error);
    process.exitCode = 1;
});
