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
    /** Reads the original single-unit pre-payment Cart scope without claiming or releasing a reservation. */
    uncertainCouponReservationScope: async function (request, selector) {
        const fail = () => { throw Object.assign(new Error('Coupon compensation is unconfirmed'), { code: 'ERR_CHECKOUT_COMPENSATION_UNCONFIRMED' }); };
        const identifier = value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9_.:@|\-]{0,255}$/.test(value);
        const prefix = request.commandCode + ':digital:', key = selector?.uncertainKey;
        if (![request.tenant, request.enterpriseCode, request.ownerId, request.commandCode, key].every(identifier) ||
            !key.startsWith(prefix) || !key.endsWith(':0')) fail();
        const entryCode = key.slice(prefix.length, -2);
        if (!identifier(entryCode)) fail();
        const rows = async (service, query) => {
            if (typeof service?.get !== 'function') fail();
            const response = await service.get({ tenant: request.tenant,
                authData: SERVICE.DefaultCheckoutPlacementPortsService.serviceAuthData(request),
                query: { ...query, tenant: request.tenant }, options: { recursive: false, skipItemCache: true },
                searchOptions: { pageSize: 2, pageNumber: 1 } });
            if (!/^SUC_/.test(response?.code || '') || response.error || response.success === false ||
                response.acknowledged === false || response.errors !== undefined && (!Array.isArray(response.errors) || response.errors.length) ||
                !Array.isArray(response.result) || response.result.length !== 1 || response.count !== 1 ||
                [response.total, response.totalCount].some(n => n !== undefined && n !== 1) ||
                Object.entries({ ...query, tenant: request.tenant }).some(([k, v]) => response.result[0][k] !== v)) fail();
            return response.result[0];
        };
        const entry = await rows(SERVICE.DefaultCartEntryService, { code: entryCode, ownerId: request.ownerId });
        if (entry.enterpriseCode !== request.enterpriseCode || entry.status !== 'ACTIVE' || String(entry.quantity) !== '1' ||
            ![entry.cartCode, entry.productCode, entry.sku].every(identifier)) fail();
        const cart = await rows(SERVICE.DefaultCartService, { code: entry.cartCode, ownerId: request.ownerId });
        if (cart.enterpriseCode !== request.enterpriseCode || cart.status !== 'ACTIVE' || !identifier(cart.storeCode)) fail();
        const onlyEntry = await rows(SERVICE.DefaultCartEntryService, { cartCode: cart.code, ownerId: request.ownerId, status: 'ACTIVE' });
        if (onlyEntry.code !== entry.code || !require('node:util').isDeepStrictEqual(onlyEntry, entry)) fail();
        return { cartCode: cart.code, entryCode: entry.code, productCode: entry.productCode, sku: entry.sku, enterpriseCode: request.enterpriseCode };
    },
    /** Revalidates original Cart scope then resolves its reservation only through Promotion's existing owner. */
    recoverUncertainCouponReservation: async function (request, selector) {
        const fail = () => { throw Object.assign(new Error('Coupon compensation is unconfirmed'), { code: 'ERR_CHECKOUT_COMPENSATION_UNCONFIRMED' }); };
        const scope = await this.uncertainCouponReservationScope(request, selector), key = selector.uncertainKey;
        const promotion = SERVICE.DefaultPromotionOperationService;
        if (typeof promotion?.recoverCouponCodeReservation !== 'function') fail();
        const result = await promotion.recoverCouponCodeReservation({ tenant: request.tenant, enterpriseCode: request.enterpriseCode,
            ownerId: request.ownerId, authData: request.authData, idempotencyKey: key,
            cartCode: scope.cartCode, entryCode: scope.entryCode, productCode: scope.productCode, sku: scope.sku });
        if (result?.status !== 'COMPLETED' || result.reservationKey !== key) fail();
        return { type: 'DIGITAL_COUPON_RELEASE', status: 'COMPLETED', reservationKey: key,
            cartCode: scope.cartCode, entryCode: scope.entryCode, enterpriseCode: request.enterpriseCode };
    },
    /** Reads pinned Product classification and delegates live digital supply to Promotion without reserving units. @param {Object} request Persisted Cart scope and exact entry identity. @returns {Promise<Object|undefined>} Digital availability or undefined for a physical product. @override Preserve pinned identity, scope and owner-only pool resolution. */
    availability: async function (request, original) {
        if (typeof request.sku !== 'string' || !request.sku.trim()) throw new Error('Digital Product SKU is unavailable');
        const product = SERVICE.DefaultProductDiscoveryService;
        if (!product?.searchPinned || !product.query) throw new Error('Digital Product reader unavailable');
        const indexed = await product.searchPinned(request, product.query(request), { pageSize: 2, limit: 2, pageNumber: 1 });
        const projections = SERVICE.DefaultProductSearchEnrichmentService;
        if (!projections?.retainedProjections) throw new Error('Retained Product reader unavailable');
        const rows = await projections.retainedProjections(request, indexed);
        if (!Array.isArray(rows) || rows.length !== 1)
            throw new Error('Digital Product scope is unavailable');
        return this.availabilityFromProjection(request, rows[0], original);
    },
    /** Resolves non-reserving supply from an already pinned, retained Product projection; never calls enriched discovery. @param {Object} request Exact tenant/enterprise/Store/locale/Product scope, bounded quantity and optional Cart SKU identity. @param {Object} projection Product-owner-verified retained record, not a caller/index payload. @returns {Promise<Object|undefined>} Promotion evidence or undefined for physical products. @override Preserve scope/classification checks and Promotion-owned binding; this member serves Cart and customer enrichment. */
    availabilityFromProjection: async function (request, projection, original) {
        if (!projection || !['CURRENT', 'STALE'].includes(projection.status) ||
            ['tenant', 'enterpriseCode', 'storeCode', 'locale', 'productCode'].some(key =>
                typeof request[key] !== 'string' || !request[key].trim() || request[key] !== request[key].trim() ||
                projection[key] !== request[key])) throw new Error('Digital Product scope is unavailable');
        const payload = projection.payload || {}, map = payload.variantSkuMap || {};
        if (request.sku !== undefined || request.variantCode !== undefined) {
            if (request.variantCode ? !(payload.variantCodes || []).includes(request.variantCode) || map[request.variantCode] !== request.sku
                : !Object.values(map).includes(request.sku)) throw new Error('Digital Product SKU is unavailable');
        }
        const attributes = payload.localizedAttributes || {};
        if (attributes.digitalDeliveryType === 'DIGITAL_OWNERSHIP') {
            if (attributes.productType !== 'DIGITAL' || attributes.inventoryStrategy !== 'DIGITAL_COMMERCE')
                throw Object.assign(new Error('Unsupported digital ownership availability'), { code: 'ERR_DIGITAL_AVAILABILITY_METADATA' });
            if (!SERVICE.DefaultDigitalCommerceOwnershipService?.availability)
                throw new Error('Unsupported digital ownership availability');
            return SERVICE.DefaultDigitalCommerceOwnershipService.availability(request, projection);
        }
        if (attributes.productType !== 'DIGITAL' && attributes.inventoryStrategy !== 'COUPON_CODE_POOL') return undefined;
        if (attributes.productType !== 'DIGITAL' || attributes.digitalDeliveryType !== 'COUPON_CODE' ||
            attributes.inventoryStrategy !== 'COUPON_CODE_POOL')
            throw Object.assign(new Error('Unsupported digital availability'), { code: 'ERR_DIGITAL_AVAILABILITY_METADATA' });
        if (!(payload.variantCodes || []).some(code => Object.hasOwn(map, code) && typeof map[code] === 'string' && map[code].trim()))
            throw new Error('Digital Product SKU is unavailable');
        const quantity = Number(request.quantity);
        if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > this.maximumCouponUnits())
            throw new Error('Coupon quantity must be a bounded positive integer');
        const promotion = SERVICE.DefaultPromotionOperationService;
        if (!promotion?.couponPoolAvailability) throw new Error('Digital Promotion pool owner unavailable');
        const admission = SERVICE.DefaultPromotionDistributionAdmissionService;
        if (original && admission?.selected(request))
            return admission.trustedAvailability(original, request);
        return promotion.couponPoolAvailability({ tenant: request.tenant, enterpriseCode: request.enterpriseCode,
            storeCode: request.storeCode, productCode: request.productCode, quantity: request.quantity,
            ownerId: request.ownerId, authData: request.authData });
    },
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
        const ownership = SERVICE.DefaultDigitalCommerceOwnershipService;
        const assetEntries = ((calculation && calculation.entries) || []).filter(entry => {
            if (entry?.availability?.digitalDeliveryType !== 'DIGITAL_OWNERSHIP') return false;
            if (!ownership?.isEntry || !ownership?.reserve) throw new Error('Digital ownership reservation owner is required');
            return ownership.isEntry(entry);
        });
        const promotionService = SERVICE.DefaultPromotionOperationService;
        const units = this.couponUnits(calculation);
        if (!units.length && !assetEntries.length) return [];
        if (units.length + assetEntries.length > this.maximumCouponUnits())
            throw new Error('Coupon checkout exceeds its unit bound');
        if (
            !request.idempotencyKey ||
            !request.ownerId ||
            !request.payload?.orderCode
        )
            throw new Error('Stable coupon purchase identity is required');
        if (
            units.length && (!promotionService ||
            typeof promotionService.reserveCouponCodeForCheckout !== 'function')
        )
            throw new Error('Coupon reservation owner is required');
        if (units.some((unit) => !unit.couponBatchCode))
            throw new Error(
                'Coupon batch code is required for coupon digital product',
            );
        const reservations = [];
        let attemptedKey;
        try {
            for (const entry of assetEntries) {
                attemptedKey = request.idempotencyKey + ':digital:' + entry.code + ':0';
                reservations.push(await ownership.reserve(request, entry));
            }
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
                        storeCode: request.storeCode,
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
        if (reservations.some(unit => unit.digitalDeliveryType === 'DIGITAL_OWNERSHIP')) {
            if (!SERVICE.DefaultDigitalCommerceOwnershipService?.phase) throw new Error('Digital ownership sale owner is required');
            const results = [];
            for (const unit of reservations) results.push(unit.digitalDeliveryType === 'DIGITAL_OWNERSHIP'
                ? await SERVICE.DefaultDigitalCommerceOwnershipService.phase(request, order, unit, 'confirm')
                : (await this.confirmSale(request, order, [unit]))[0]);
            return results;
        }
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
        if (sales.some(unit => unit.digitalDeliveryType === 'DIGITAL_OWNERSHIP')) {
            if (!SERVICE.DefaultDigitalCommerceOwnershipService?.phase) throw new Error('Digital ownership delivery owner is required');
            const results = [];
            for (const unit of sales) results.push(unit.digitalDeliveryType === 'DIGITAL_OWNERSHIP'
                ? await SERVICE.DefaultDigitalCommerceOwnershipService.phase(request, order, unit, 'deliver')
                : (await this.deliver(request, order, [unit]))[0]);
            return results;
        }
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
        if ((reservations || []).some(unit => unit.digitalDeliveryType === 'DIGITAL_OWNERSHIP')) {
            const results = [];
            for (const unit of reservations) results.push(unit.digitalDeliveryType === 'DIGITAL_OWNERSHIP'
                ? SERVICE.DefaultDigitalCommerceOwnershipService?.release
                    ? await SERVICE.DefaultDigitalCommerceOwnershipService.release(request, unit)
                    : { type: 'DIGITAL_OWNERSHIP_RELEASE', code: unit.code, status: 'FAILED', errorCode: 'DIGITAL_OWNERSHIP_RECOVERY_REQUIRED' }
                : (await this.releaseReservations(request, [unit]))[0]);
            return results;
        }
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
