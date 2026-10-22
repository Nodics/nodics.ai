/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module digitalCore/service/defaultDigitalCommerceCheckoutService
 * @description Coordinates normal Checkout with Digital unit reservation, irreversible input direction, sale
 * and delivery.
 * Inputs: Original Checkout participant/merchant scope, retained calculation/order/unit receipts and stable
 * keys.
 * Outputs: Owner reservation/sale/delivery/recovery receipts, bounded availability and compensation
 * outcomes.
 * Effects: Calls Promotion, certificate/ownership and entitlement owners; never implements Payment or
 * certificate persistence.
 * Failure behavior: Uncertain reservation carries confirmed receipts/key for recovery; coupon release
 * failures remain FAILED, not assumed released.
 * Exported members: uncertainCouponReservationScope, recoverUncertainCouponReservation, availability,
 * availabilityFromProjection, isCouponCodePoolEntry, couponUnits, maximumCouponUnits, reserveForCheckout,
 * resolveCouponForwardRecovery, couponCompensationDisposition, confirmSale, deliver, releaseReservations.
 * @owner digitalCore
 * @layer service
 * @override Override effective members while preserving original-command identity, COMMIT/RELEASE fences and
 * source owner proof.
 * @see ../../llm/contracts/coupon-acquisition-source.md
 */
module.exports = {
    /**
     * Reads the original single-unit pre-payment Cart scope without claiming or releasing a reservation.
     * @param {Object} request Original Checkout participant context with tenant, merchant enterpriseCode,
     * typed owner/actor, bearer and original command key.
     * @param {Object} selector uncertainKey naming the original checkout:digital:<entry>:0 reservation.
     * @returns {Promise<Object>} Exact cartCode, entryCode, productCode, sku and enterpriseCode.
     * @remarks Effects: Reads complete single-row Cart/entry evidence only; does not reserve or release.
     * Failure behavior: Rejects ERR_CHECKOUT_COMPENSATION_UNCONFIRMED for foreign, ambiguous, non-active or
     * non-single-unit scope.
     * @override Preserve exact original key and complete acknowledged reads; absence never permits
     * replacement.
     */
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
    /**
     * Revalidates original Cart scope then resolves its reservation only through Promotion's existing owner.
     * @param {Object} request Original Checkout participant context with tenant, merchant enterpriseCode,
     * typed owner/actor, bearer and original command key.
     * @param {Object} selector Original uncertainKey for the one-unit pre-payment Cart.
     * @returns {Promise<Object>} Completed DIGITAL_COUPON_RELEASE outcome bound to original reservation and
     * Cart.
     * @remarks Effects: Revalidates Cart then invokes Promotion's existing reservation recovery/release.
     * Failure behavior: Rejects when original scope or Promotion completion is unconfirmed; retains recovery
     * state.
     * @override Do not recover by allocating a new coupon or fabricating a release receipt.
     */
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
    /**
     * Reads pinned Product classification and delegates live digital supply to Promotion without reserving
     * units.
     * @param {Object} request Exact pinned tenant/Enterprise/Store/locale/product/SKU and bounded quantity.
     * @param {Object} [original] Original request used only by selected Promotion distribution admission.
     * @returns {Promise<Object|undefined>} Digital owner availability; undefined for a non-digital Product.
     * @remarks Effects: Reads pinned Product projections and delegates live supply; never reserves units.
     * Failure behavior: Rejects missing SKU, ambiguous retained Product or unavailable owner/classification.
     * @override Keep pinned identity; call availabilityFromProjection rather than enriched discovery
     * recursion.
     */
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
    /**
     * Resolves non-reserving supply from an already pinned, retained Product projection; never calls
     * enriched discovery.
     * @param {Object} request Exact Product scope, bounded quantity and optional variant/SKU selectors.
     * @param {Object} projection Product-owner-verified CURRENT/STALE retained projection with localized
     * attributes and SKU map.
     * @param {Object} [original] Original participant request for selected trusted Promotion availability.
     * @returns {Promise<Object|undefined>} Non-reserving owner supply evidence, or undefined for physical
     * goods.
     * @remarks Effects: Reads qualified Digital ownership or Promotion pool availability; no
     * inventory/coupon mutation.
     * Failure behavior: Rejects scope/SKU mismatch, unsupported metadata, invalid quantity or unavailable
     * provider.
     * @override Do not trust an index/browser payload as retained Product or use caller-selected pools.
     */
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
    /**
     * Returns true when a calculated entry is backed by a coupon-code pool.
     * @param {Object} entry Calculated entry whose availability describes inventory strategy or delivery
     * type.
     * @returns {boolean} True when one recognized coupon-pool marker is present.
     * @remarks Effects: Pure classification; does not validate eligibility or reserve supply.
     * Failure behavior: Missing entry/availability returns false; this predicate provides no admission
     * guarantee.
     * @override Keep marker recognition separate from actual Product and Promotion validation.
     */
    isCouponCodePoolEntry: function (entry) {
        const availability = (entry && entry.availability) || {};
        return (
            availability.inventoryStrategy === 'COUPON_CODE_POOL' ||
            availability.strategy === 'COUPON_CODE_POOL' ||
            availability.digitalDeliveryType === 'COUPON_CODE'
        );
    },
    /**
     * Expands a calculation into one digital unit per purchased coupon-code quantity.
     * @param {Object} calculation Calculation.entries containing quantity and owner-resolved coupon
     * availability.
     * @returns {Array<Object>} One entry/product/SKU/batch-or-promotion/unitIndex descriptor per coupon
     * quantity.
     * @remarks Effects: Builds a new array and reads the effective expansion limit; no owner writes.
     * Failure behavior: Throws for non-positive, non-integral or over-limit individual/aggregate quantity.
     * @override Preserve total bound and original entry/unit order for stable reservation keys.
     */
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
                    governedOffer: entry.availability?.purchaseRequirements !== undefined,
                    unitIndex: index,
                });
            }
        }
        return units;
    },
    /**
     * Resolves the later-layer checkout expansion bound.
     * @returns {number} Effective positive safe-integer maximumCouponUnitsPerCheckout, at most10000.
     * @remarks Effects: Reads Digital config only.
     * Failure behavior: Throws for absent/malformed/out-of-range expansion policy.
     * @override Read the implementing owner's effective value; do not add fallback or customer defaults.
     */
    maximumCouponUnits: function () {
        const limit = CONFIG.get('digitalCore').maximumCouponUnitsPerCheckout;
        if (!Number.isSafeInteger(limit) || limit < 1 || limit > 10000)
            throw new Error('Coupon checkout bound is invalid');
        return limit;
    },
    /**
     * Reserves checkout digital units from Promotion-owned coupon pools.
     * @param {Object} request Original Checkout participant context with tenant, merchant enterpriseCode,
     * typed owner/actor, bearer and original command key.
     * @param {Object} calculation Persisted calculation entries with ownership/coupon availability and exact
     * quantities.
     * @returns {Promise<Array<Object>>} Original ownership and coupon reservation receipts; empty for no
     * digital entries.
     * @remarks Effects: Records Enterprise start admission, reserves owner units, persists Promotion coupon
     * before certificate holds.
     * Failure behavior: Rejects missing identity/owners or failed holds; error carries digitalReservations,
     * uncertain key and recoveryRequired.
     * @override Keep original reservations on error and reserve only at Checkout; never convert uncertainty
     * into release.
     */
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
        if (units.some((unit) => !unit.couponBatchCode && !unit.promotionCode))
            throw new Error(
                'Coupon batch code is required for coupon digital product',
            );
        // A durable whole-start admission precedes all inputs. Replays keep this original command even after a policy change.
        if (units.length && request.authData?.principalType === 'human') {
            const acquisition = SERVICE.DefaultDigitalCommerceCouponAcquisitionService;
            const owner = acquisition.typedOwner(request.ownerRef);
            if (owner.type !== 'ENTERPRISE') throw new Error('Enterprise purchasing owner is required');
            await SERVICE.DefaultDigitalParticipationService.admit(request, { kind: 'COUPON',
                ownerRef: { module: 'profile', schema: 'enterprise', code: owner.code }, key: request.idempotencyKey,
                identity: { ownerId: request.ownerId, merchantEnterpriseCode: request.enterpriseCode,
                    cartCode: request.payload.cartCode, orderCode: request.payload.orderCode, storeCode: request.storeCode,
                    units, selections: request.payload.couponSelections || {} } });
        }
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
                const acquisition = SERVICE.DefaultDigitalCommerceCouponAcquisitionService;
                const governed = unit.governedOffer || !unit.couponBatchCode;
                if (governed && !acquisition?.prepare) throw new Error('Coupon acquisition owner is required');
                const command = governed ? await acquisition.prepare(request, unit) : {
                        ...request,
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
                    };
                const reservation = await promotionService.reserveCouponCodeForCheckout(command);
                reservations.push(reservation);
                if (reservation.offerAllocationCode) {
                    if (!acquisition?.reserveInputs) throw new Error('Coupon consideration owner is required');
                    const retained = await acquisition.commandForCoupon(command, reservation);
                    await acquisition.reserveInputs(retained);
                }
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
    /**
     * Resolves the exact retained coupon order and complete original units for Checkout's existing forward
     * recovery driver.
     * @param {Object} request Original Checkout participant context with tenant, merchant enterpriseCode,
     * typed owner/actor, bearer and original command key.
     * @param {Object} selector Exactly orderCode, cartCode and complete unique original couponCodes.
     * @returns {Promise<Object>} Retained {scope, order, units} ready for existing confirmSale/deliver.
     * @remarks Effects: Read-only reauthorization of original order, COMMIT allocation and consideration; no
     * repricing or new reserve.
     * Failure behavior: Rejects foreign/incomplete units, non-COMMIT allocation or unconfirmed
     * consideration.
     * @override Resume the original completed/partially closed Cart command without reopening intake.
     */
    resolveCouponForwardRecovery: async function (request, selector) {
        const acquisition = SERVICE.DefaultDigitalCommerceCouponAcquisitionService;
        if (!selector || Object.keys(selector).sort().join(',') !== 'cartCode,couponCodes,orderCode' ||
            !Array.isArray(selector.couponCodes) || !selector.couponCodes.length || selector.couponCodes.length > this.maximumCouponUnits() ||
            new Set(selector.couponCodes).size !== selector.couponCodes.length) throw new Error('Original coupon recovery selectors are required');
        [selector.orderCode, selector.cartCode, ...selector.couponCodes].forEach(v => acquisition.identifier(v));
        const scope = { ...request, idempotencyKey: request.commandCode || request.idempotencyKey,
            payload: { cartCode: selector.cartCode, orderCode: selector.orderCode } };
        const order = await acquisition.one('DefaultCommerceOrderService', scope, { code: selector.orderCode,
            cartCode: selector.cartCode, enterpriseCode: scope.enterpriseCode, ownerId: scope.ownerId, idempotencyKey: scope.idempotencyKey });
        const same = require('node:util').isDeepStrictEqual;
        if (!same(acquisition.typedOwner(order.evidence?.ownerRef), acquisition.typedOwner(scope.ownerRef)) ||
            !same(order.evidence?.digitalReservationCodes?.slice().sort(), selector.couponCodes.slice().sort()) ||
            order.promotionCode || order.couponCode || order.evidence?.reservationCodes?.length) throw new Error('Original coupon order is not qualified for forward recovery');
        scope.storeCode = acquisition.identifier(order.evidence.storeCode);
        const units = [];
        for (const code of selector.couponCodes) {
            const coupon = await SERVICE.DefaultPromotionOperationService.readLifecycleCoupon(scope, code);
            const command = await acquisition.commandForCoupon(scope, coupon);
            if (!command || !command.idempotencyKey.startsWith(scope.idempotencyKey + ':digital:') ||
                command.payload.orderCode !== selector.orderCode || command.payload.cartCode !== selector.cartCode) throw new Error('Original coupon recovery identity differs');
            await acquisition.authorize(command);
            const allocated = await acquisition.allocation(command);
            if (allocated.row.evidence.inputDisposition !== 'COMMIT') throw new Error('Coupon forward recovery is not selected');
            await acquisition.consideration(command, allocated);
            units.push(coupon);
        }
        return { scope, order, units };
    },
    /**
     * Fences coupon compensation before financial reversal; a persisted consume attempt requires forward
     * recovery even when its acknowledgement is lost.
     * @param {Object} request Original Checkout participant context with tenant, merchant enterpriseCode,
     * typed owner/actor, bearer and original command key.
     * @param {Array<Object>} reservations Bounded original reservation receipts, including
     * offerAllocationCode for governed coupons.
     * @returns {Promise<Object>} Whole-set {disposition, outcomes}; no governed units yields
     * RELEASE_ALLOWED.
     * @remarks Effects: Calls Promotion's transactional input-direction fence before financial compensation.
     * Failure behavior: Rejects malformed bounds or unavailable original commands/fence; callers must not
     * reverse money on uncertainty.
     * @override Any COMMIT unit forces original forward recovery; never release a subset independently.
     */
    couponCompensationDisposition: async function (request, reservations) {
        if (!Array.isArray(reservations) || reservations.length > this.maximumCouponUnits()) throw new Error('Bounded original coupon reservations are required');
        const commands = [];
        for (const unit of reservations.filter(unit => unit.offerAllocationCode)) {
            const command = await SERVICE.DefaultDigitalCommerceCouponAcquisitionService.commandForCoupon(request, unit);
            if (!command) throw new Error('Original coupon acquisition is required');
            commands.push(command);
        }
        return commands.length ? SERVICE.DefaultCouponOfferAllocationService.fenceInputSet(commands) : { disposition: 'RELEASE_ALLOWED', outcomes: [] };
    },
    /**
     * Confirms original digital sales after canonical consideration, then records entitlements.
     * @param {Object} request Original Checkout participant context with tenant, merchant enterpriseCode,
     * typed owner/actor, bearer and original command key.
     * @param {Object} order Original persisted Order supplying its stable code.
     * @param {Array<Object>} reservations Original coupon/ownership reservation receipts, not caller-created
     * replacements.
     * @returns {Promise<Array<Object>>} Owner sale receipts, with entitlementCode for coupon sales; empty
     * when no units.
     * @remarks Effects: Consumes governed inputs after required capture, commits Promotion sale and creates
     * entitlements; ownership delegates its confirm phase.
     * Failure behavior: Rejects owner/identity/consideration failure; earlier irreversible effects may
     * require forward recovery.
     * @override Preserve original allocation and completeInputs-before-sale ordering; certificate-only must
     * not invent Payment.
     */
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
            const base = { ...request, payload: { ...request.payload, orderCode: order?.code || request.payload?.orderCode } };
            const acquisition = SERVICE.DefaultDigitalCommerceCouponAcquisitionService;
            const command = reservation.offerAllocationCode ? await acquisition.commandForCoupon(base, reservation) : undefined;
            if (reservation.offerAllocationCode && !command) throw new Error('Original coupon acquisition is required');
            if (command) await acquisition.completeInputs(command);
            sales.push(
                await promotionService.confirmCouponCodeSale(command || {
                    ...request,
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
    /**
     * Marks sold digital coupon units delivered after fulfillment release.
     * @param {Object} request Original Checkout participant context with tenant, merchant enterpriseCode,
     * typed owner/actor, bearer and original command key.
     * @param {Object} order Original Order associated with the sales.
     * @param {Array<Object>} sales Original confirmed coupon or ownership sale receipts.
     * @returns {Promise<Array<Object>>} Original delivery receipts; empty when no sales.
     * @remarks Effects: Calls owner delivery and persists Digital delivery evidence; ownership dispatches
     * its deliver phase.
     * Failure behavior: Rejects missing delivery owner or invalid original acquisition; partial delivery
     * remains recoverable.
     * @override Retain original sale key/order and never infer delivery from sale acknowledgement alone.
     */
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
            const command = sale.offerAllocationCode
                ? await SERVICE.DefaultDigitalCommerceCouponAcquisitionService.commandForCoupon(
                    { ...request, payload: { ...request.payload, orderCode: order?.code || request.payload?.orderCode } }, sale)
                : undefined;
            if (sale.offerAllocationCode && !command) throw new Error('Original coupon acquisition is required');
            deliveries.push(
                await promotionService.deliverCouponCodeSale(command || {
                    ...request,
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
    /**
     * Releases checkout digital reservations during compensation.
     * @param {Object} request Original Checkout participant context with tenant, merchant enterpriseCode,
     * typed owner/actor, bearer and original command key.
     * @param {Array<Object>} reservations Original reservation receipts to reconcile during common
     * compensation.
     * @returns {Promise<Array<Object>>} Per-unit COMPLETED or FAILED release outcomes with bounded error
     * codes.
     * @remarks Effects: Reuses durable release receipts or releases unconsumed inputs before Promotion
     * allowance release; delegates ownership releases.
     * Failure behavior: Coupon errors/missing owner become FAILED outcomes; delegated ownership errors can
     * still reject.
     * @override Never report release from a timeout; preserve COMMIT fences and actual owner readback.
     */
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
                const acquisition = SERVICE.DefaultDigitalCommerceCouponAcquisitionService;
                if (reservation.offerAllocationCode && await acquisition.released(request, reservation)) {
                    outcomes.push({ type: 'DIGITAL_COUPON_RELEASE', code: reservation.code, status: 'COMPLETED' });
                    continue;
                }
                const command = reservation.offerAllocationCode ? await acquisition.commandForCoupon({ ...request,
                    payload: { ...request.payload, orderCode: reservation.orderCode || request.payload?.orderCode } }, reservation) : undefined;
                if (reservation.offerAllocationCode && !command) throw new Error('Original coupon acquisition is required');
                if (command) await acquisition.releaseInputs(command);
                const released =
                    await promotionService.releaseCouponCodeReservation(command || {
                        ...request,
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
