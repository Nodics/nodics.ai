/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module digitalCore/src/service/defaultDigitalCommerceCheckoutService @description Coordinates checkout-time digital unit reservation, sale, release, and delivery with domain owners. @layer service @owner digitalCore */
module.exports = {
    /** Returns true when a calculated entry is backed by a coupon-code pool. @param {Object} entry Calculated entry. @returns {boolean} Whether the entry is a coupon digital unit. */
    isCouponCodePoolEntry: function (entry) {
        const availability = (entry && entry.availability) || {};
        return (
            availability.inventoryStrategy === 'COUPON_CODE_POOL' ||
            availability.strategy === 'COUPON_CODE_POOL' ||
            availability.digitalDeliveryType === 'COUPON_CODE'
        );
    },
    /** Expands a calculation into one digital unit per purchased coupon-code quantity. @param {Object} calculation Cart calculation. @returns {Array} Digital purchase units. */
    couponUnits: function (calculation) {
        const units = [];
        let maximum;
        for (const entry of (calculation && calculation.entries) || []) {
            if (!this.isCouponCodePoolEntry(entry)) continue;
            maximum ??= this.maximumCouponUnits();
            const quantity = Number(entry.quantity);
            if (
                !Number.isSafeInteger(quantity) ||
                quantity < 1 ||
                quantity > maximum
            )
                throw new Error(
                    'Coupon quantity must be a bounded positive integer',
                );
            if (units.length + quantity > maximum)
                throw new Error('Coupon checkout exceeds its unit bound');
            for (let index = 0; index < quantity; index += 1) {
                units.push({
                    entryCode: entry.code,
                    productCode: entry.productCode,
                    sku: entry.sku,
                    couponBatchCode:
                        entry.availability &&
                        (entry.availability.couponBatchCode ||
                            entry.availability.batchCode),
                    promotionCode:
                        entry.availability && entry.availability.promotionCode,
                    unitIndex: index,
                });
            }
        }
        return units;
    },
    /** Resolves the later-layer checkout expansion bound. @returns {number} Qualified shape limit. */
    maximumCouponUnits: function () {
        const limit = CONFIG.get('digitalCore').maximumCouponUnitsPerCheckout;
        if (!Number.isSafeInteger(limit) || limit < 1 || limit > 10000)
            throw new Error('Coupon checkout bound is invalid');
        return limit;
    },
    /** Reserves checkout digital units from Promotion-owned coupon pools. @param {Object} request Checkout request. @param {Object} calculation Cart calculation. @returns {Promise<Array>} Reservation evidence. */
    reserveForCheckout: async function (request, calculation) {
        const promotionService = SERVICE.DefaultPromotionOperationService;
        const units = this.couponUnits(calculation);
        if (!units.length) return [];
        if (units.length > this.maximumCouponUnits())
            throw new Error('Coupon checkout exceeds its unit bound');
        if (
            !request.idempotencyKey ||
            !request.ownerId ||
            !request.payload?.orderCode
        )
            throw new Error('Stable coupon purchase identity is required');
        if (
            !promotionService ||
            typeof promotionService.reserveCouponCodeForCheckout !== 'function'
        )
            throw new Error('Coupon reservation owner is required');
        if (units.some((unit) => !unit.couponBatchCode))
            throw new Error(
                'Coupon batch code is required for coupon digital product',
            );
        const reservations = [];
        let attemptedKey;
        try {
            for (const unit of units) {
                attemptedKey = [
                    request.idempotencyKey,
                    'digital',
                    unit.entryCode,
                    unit.unitIndex,
                ].join(':');
                if (!unit.couponBatchCode)
                    throw new Error(
                        'Coupon batch code is required for coupon digital product',
                    );
                reservations.push(
                    await promotionService.reserveCouponCodeForCheckout({
                        tenant: request.tenant,
                        ownerId: request.ownerId,
                        authData: request.authData,
                        correlationId: request.correlationId,
                        idempotencyKey: [
                            request.idempotencyKey,
                            'digital',
                            unit.entryCode,
                            unit.unitIndex,
                        ].join(':'),
                        enterpriseCode: request.enterpriseCode,
                        payload: {
                            orderCode:
                                request.payload && request.payload.orderCode,
                            cartCode:
                                request.payload && request.payload.cartCode,
                            entryCode: unit.entryCode,
                            productCode: unit.productCode,
                            sku: unit.sku,
                            batchCode: unit.couponBatchCode,
                            promotionCode: unit.promotionCode,
                        },
                    }),
                );
            }
        } catch (error) {
            // Keep confirmed acquisitions available to Checkout compensation; the failing unit may be ambiguous.
            error.digitalReservations = reservations;
            error.digitalReservationRecoveryRequired = true;
            error.digitalReservationUncertainKey = attemptedKey;
            throw error;
        }
        return reservations;
    },
    /** Confirms sold digital coupon units after payment authorization. @param {Object} request Checkout request. @param {Object} order Order. @param {Array} reservations Reservation evidence. @returns {Promise<Array>} Sale evidence. */
    confirmSale: async function (request, order, reservations) {
        if (!(reservations || []).length) return [];
        const promotionService = SERVICE.DefaultPromotionOperationService;
        if (
            !promotionService ||
            typeof promotionService.confirmCouponCodeSale !== 'function'
        )
            throw new Error('Coupon sale owner is required');
        if (
            !SERVICE.DefaultDigitalCommerceEntitlementService
                ?.createFromCouponSales
        )
            throw new Error('Coupon entitlement owner is required');
        const sales = [];
        for (const reservation of reservations || []) {
            sales.push(
                await promotionService.confirmCouponCodeSale({
                    tenant: request.tenant,
                    enterpriseCode: request.enterpriseCode,
                    storeCode: request.storeCode,
                    ownerId: request.ownerId,
                    authData: request.authData,
                    correlationId: request.correlationId,
                    idempotencyKey:
                        reservation.idempotencyKey || request.idempotencyKey,
                    payload: {
                        couponCode: reservation.code,
                        orderCode:
                            (order && order.code) ||
                            (request.payload && request.payload.orderCode),
                    },
                }),
            );
        }
        if (
            SERVICE.DefaultDigitalCommerceEntitlementService &&
            typeof SERVICE.DefaultDigitalCommerceEntitlementService
                .createFromCouponSales === 'function'
        ) {
            const entitlements =
                await SERVICE.DefaultDigitalCommerceEntitlementService.createFromCouponSales(
                    request,
                    order,
                    sales,
                );
            return sales.map((sale) =>
                Object.assign({}, sale, {
                    entitlementCode:
                        entitlements.find(
                            (entitlement) =>
                                entitlement.providerCode === sale.code,
                        ) &&
                        entitlements.find(
                            (entitlement) =>
                                entitlement.providerCode === sale.code,
                        ).code,
                }),
            );
        }
        return sales;
    },
    /** Marks sold digital coupon units delivered after fulfillment release. @param {Object} request Checkout request. @param {Object} order Order. @param {Array} sales Sale evidence. @returns {Promise<Array>} Delivery evidence. */
    deliver: async function (request, order, sales) {
        if (!(sales || []).length) return [];
        const promotionService = SERVICE.DefaultPromotionOperationService;
        if (
            !promotionService ||
            typeof promotionService.deliverCouponCodeSale !== 'function'
        )
            throw new Error('Coupon delivery owner is required');
        if (!SERVICE.DefaultDigitalCommerceEntitlementService?.recordDeliveries)
            throw new Error('Coupon delivery evidence owner is required');
        const deliveries = [];
        for (const sale of sales || []) {
            deliveries.push(
                await promotionService.deliverCouponCodeSale({
                    tenant: request.tenant,
                    enterpriseCode: request.enterpriseCode,
                    ownerId: request.ownerId,
                    authData: request.authData,
                    correlationId: request.correlationId,
                    idempotencyKey:
                        sale.idempotencyKey || request.idempotencyKey,
                    payload: {
                        couponCode: sale.code,
                        orderCode:
                            (order && order.code) ||
                            (request.payload && request.payload.orderCode),
                    },
                }),
            );
        }
        if (
            SERVICE.DefaultDigitalCommerceEntitlementService &&
            typeof SERVICE.DefaultDigitalCommerceEntitlementService
                .recordDeliveries === 'function'
        ) {
            await SERVICE.DefaultDigitalCommerceEntitlementService.recordDeliveries(
                request,
                order,
                deliveries,
            );
        }
        return deliveries;
    },
    /** Releases checkout digital reservations during compensation. @param {Object} request Checkout request. @param {Array} reservations Reservation evidence. @returns {Promise<Array>} Release outcomes. */
    releaseReservations: async function (request, reservations) {
        const promotionService = SERVICE.DefaultPromotionOperationService;
        if (
            !promotionService ||
            typeof promotionService.releaseCouponCodeReservation !== 'function'
        )
            return (reservations || []).map((reservation) => ({
                type: 'DIGITAL_COUPON_RELEASE',
                code: reservation.code,
                status: 'FAILED',
                errorCode: 'DIGITAL_RELEASE_FAILED',
            }));
        const outcomes = [];
        for (const reservation of reservations || []) {
            try {
                const released =
                    await promotionService.releaseCouponCodeReservation({
                        tenant: request.tenant,
                        enterpriseCode: request.enterpriseCode,
                        ownerId: request.ownerId,
                        authData: request.authData,
                        correlationId: request.correlationId,
                        idempotencyKey:
                            reservation.idempotencyKey ||
                            request.idempotencyKey,
                        payload: { couponCode: reservation.code },
                    });
                if (
                    !released ||
                    released.code !== reservation.code ||
                    !['ACTIVE', 'AVAILABLE'].includes(released.status) ||
                    released.reservedFor ||
                    released.soldTo
                )
                    throw new Error(
                        'Coupon reservation release was not evidenced',
                    );
                outcomes.push({
                    type: 'DIGITAL_COUPON_RELEASE',
                    code: released.code,
                    status: 'COMPLETED',
                });
            } catch (error) {
                outcomes.push({
                    type: 'DIGITAL_COUPON_RELEASE',
                    code: reservation.code,
                    status: 'FAILED',
                    errorCode: error.code || 'DIGITAL_RELEASE_FAILED',
                });
            }
        }
        return outcomes;
    },
};
