/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module checkoutCore/src/service/defaultCheckoutPlacementPortsService @description Binds placement orchestration to generated domain repositories and owner services. @layer service @owner checkoutCore */
module.exports = {
    unwrap: response => response && Object.prototype.hasOwnProperty.call(response, 'result') ? response.result : response,
    /**
     * Executes `serviceAuthData` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    serviceAuthData: function (request) {
        return Object.assign({}, request.authData || {}, {
            principalId: 'commerceCheckoutPlacementService',
            code: 'commerceCheckoutPlacementService',
            loginId: 'commerceCheckoutPlacementService',
            principalType: 'service',
            userGroups: ['serviceAccountUserGroup'],
            groups: ['serviceAccountUserGroup']
        });
    },
    /**
     * Executes `persistenceModel` as a loader-visible operation owned by this module.
     * @param {*} model Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    persistenceModel: function (model) {
        const now = new Date();
        return Object.assign({}, model, {
            active: model.active !== undefined ? model.active : true,
            created: model.created instanceof Date ? model.created : now,
            updated: now,
            occurredAt: model.occurredAt instanceof Date ? model.occurredAt : now
        });
    },
    /** Reads a bounded generated projection. @param {Object} service Service. @param {string} tenant Tenant. @param {Object} query Query. @param {Object} authData Auth context. @param {number} limit Limit. @returns {Promise<Array>} Records. */
    get: function (service, tenant, query, authData, limit) { return service.get({ tenant, authData, query: Object.assign({ tenant }, query), pageSize: limit || 20 }).then(this.unwrap).then(value => Array.isArray(value) ? value : value ? [value] : []); },
    /** Persists an owner model. @param {Object} service Service. @param {string} tenant Tenant. @param {Object} model Model. @param {Object} authData Auth context. @returns {Promise<Object>} Stored model. */
    save: function (service, tenant, model, authData) { return service.save({ tenant, authData, model: this.persistenceModel(model) }).then(this.unwrap); },
    /** Applies an optimistic owner update. @param {Object} service Service. @param {string} tenant Tenant. @param {Object} model Current model. @param {Object} patch Patch. @param {Object} authData Auth context. @returns {Promise<Object>} Updated model. */
    update: function (service, tenant, model, patch, authData) { return service.update({ tenant, authData, query: { tenant, code: model.code, revision: model.revision }, model: { $set: patch } }).then(this.unwrap); },
    /** Selects a Payment-owned customer payment method service. @param {Object} request Checkout request. @param {Object} calculation Cart calculation. @returns {Object} Prepared method. */
    preparePaymentMethod: function (request, calculation) {
        const base = { tenant: request.tenant, providerToken: request.payload.providerToken, amount: calculation.totalAmount, currency: calculation.currency, idempotencyKey: request.idempotencyKey + ':payment', correlationId: request.correlationId };
        if (request.payload.paymentMethod === 'WALLET') return SERVICE.DefaultWalletPaymentMethodService.prepare(base);
        if (request.payload.paymentMethod === 'CASH_ON_DELIVERY') return SERVICE.DefaultCashOnDeliveryPaymentMethodService.prepare(Object.assign({}, base, { acceptTerms: true }));
        return SERVICE.DefaultCardPaymentMethodService.prepare(base);
    },
    /** Records a non-provider payment authorization for methods that do not expose external credentials. @param {Object} request Checkout request. @param {Object} method Prepared method. @returns {Promise<Object>} Transaction entry. */
    recordOfflineAuthorization: function (request, method) {
        return this.save(SERVICE.DefaultPaymentTransactionEntryService, request.tenant, {
            code: request.payload.orderCode + ':authorization',
            tenant: request.tenant,
            ownerId: request.ownerId,
            orderCode: request.payload.orderCode,
            cartCode: request.payload.cartCode,
            status: 'AUTHORIZED',
            revision: 0,
            operation: 'AUTHORIZE',
            amount: method.amount,
            currency: method.currency,
            idempotencyKey: method.idempotencyKey,
            correlationId: method.correlationId,
            evidence: { methodCode: method.methodCode, providerRequired: false }
        }, this.serviceAuthData(request));
    },
    /** Creates placement and compensation ports. @returns {Object} Owner-delegating placement ports. */
    create: function () {
        const self = this;
        return {
            findPlacement: async request => (await self.get(SERVICE.DefaultCheckoutCheckpointService, request.tenant, { ownerId: request.ownerId, idempotencyKey: request.idempotencyKey, status: 'COMPLETED' }, request.authData, 1))[0],
            calculateCart: request => SERVICE.DefaultCartApiService.calculate(Object.assign({}, request, { internalUse: true, cartCode: request.payload.cartCode, ownerId: request.ownerId, payload: { expectedRevision: request.payload.expectedCartRevision, calculationCode: request.payload.calculationCode } })),
            reserveInventory: async (request, calculation) => {
                const reservations = [];
                for (const entry of calculation.entries) {
                    const candidate = (entry.availability.candidates || [])[0]; if (!candidate) throw new Error('No warehouse candidate');
                    const model = SERVICE.DefaultInventoryReservationPolicyService.prepare({ tenant: request.tenant, quantity: entry.quantity, ownerType: 'ORDER', ownerCode: request.payload.orderCode, idempotencyKey: request.idempotencyKey + ':inventory:' + entry.code, correlationId: request.correlationId }, { tenant: request.tenant, warehouseCode: candidate.warehouseCode, sku: entry.sku, revision: candidate.revision }, SERVICE.DefaultExactAmountService);
                    reservations.push(await self.save(SERVICE.DefaultInventoryReservationService, request.tenant, Object.assign({ code: request.payload.orderCode + ':' + entry.code, revision: 0 }, model), self.serviceAuthData(request)));
                }
                return reservations;
            },
            authorizePayment: async (request, calculation) => {
                const method = self.preparePaymentMethod(request, calculation);
                if (method.methodCode === 'CASH_ON_DELIVERY') return self.recordOfflineAuthorization(request, method);
                if (!(CONFIG.get('stripeProvider') || {}).enabled) throw new Error('Reference payment sandbox is disabled');
                return SERVICE.DefaultPaymentExecutionService.execute(Object.assign({ operation: 'AUTHORIZE' }, method), SERVICE.DefaultStripeSandboxAdapterService, {
                    find: async (tenant, key) => (await self.get(SERVICE.DefaultPaymentTransactionEntryService, tenant, { idempotencyKey: key }, self.serviceAuthData(request), 1))[0],
                    record: model => self.save(SERVICE.DefaultPaymentTransactionEntryService, request.tenant, Object.assign({ code: request.payload.orderCode + ':authorization', ownerId: request.ownerId, orderCode: request.payload.orderCode, revision: 0 }, model), self.serviceAuthData(request))
                });
            },
            createOrder: async (request, calculation, reservations, authorization) => {
                const model = { code: request.payload.orderCode, tenant: request.tenant, ownerId: request.ownerId, cartCode: request.payload.cartCode, status: 'PLACED', revision: 0, idempotencyKey: request.idempotencyKey, correlationId: request.correlationId, currency: calculation.currency, totalAmount: calculation.totalAmount, evidence: { calculationCode: calculation.code, reservationCodes: reservations.map(value => value.code), paymentReference: authorization.providerReference } };
                const serviceAuthData = self.serviceAuthData(request);
                const order = await self.save(SERVICE.DefaultCommerceOrderService, request.tenant, model, serviceAuthData);
                for (const entry of calculation.entries) {
                    await self.save(SERVICE.DefaultCommerceOrderEntryService, request.tenant, { code: order.code + ':' + entry.code, tenant: request.tenant, ownerId: request.ownerId, orderCode: order.code, cartCode: request.payload.cartCode, status: 'PLACED', revision: 0, idempotencyKey: request.idempotencyKey + ':order-entry:' + entry.code, correlationId: request.correlationId, productCode: entry.productCode, sku: entry.sku, quantity: entry.quantity, unitAmount: entry.unitAmount, evidence: { lineAmount: entry.lineAmount, pricingDecisionCode: entry.pricingDecisionCode, promotionDecisionCode: entry.promotionDecisionCode, taxDecisionCode: entry.taxDecisionCode } }, serviceAuthData);
                }
                return order;
            },
            releaseFulfillment: (request, order) => self.save(SERVICE.DefaultConsignmentService, request.tenant, { code: order.code + ':1', tenant: request.tenant, orderCode: order.code, ownerId: request.ownerId, status: 'READY', revision: 0, idempotencyKey: request.idempotencyKey + ':fulfillment', correlationId: request.correlationId, currency: order.currency, totalAmount: order.totalAmount }, self.serviceAuthData(request)),
            complete: (checkpoint, result) => self.save(SERVICE.DefaultCheckoutCheckpointService, checkpoint.tenant, { code: result.order.code, tenant: checkpoint.tenant, ownerId: checkpoint.ownerId, cartCode: result.order.cartCode, status: 'COMPLETED', revision: 0, idempotencyKey: checkpoint.idempotencyKey, correlationId: checkpoint.correlationId, evidence: { completed: checkpoint.completed, orderCode: result.order.code } }, checkpoint.authData),
            compensate: async (checkpoint, error, request) => {
                const outcomes = [];
                for (const reservation of checkpoint.results.reservation || []) {
                    try { await self.update(SERVICE.DefaultInventoryReservationService, checkpoint.tenant, reservation, { status: 'RELEASED' }, checkpoint.authData); outcomes.push({ type: 'INVENTORY_RELEASE', code: reservation.code, status: 'COMPLETED' }); } catch (releaseError) { outcomes.push({ type: 'INVENTORY_RELEASE', code: reservation.code, status: 'FAILED', errorCode: releaseError.code || 'RELEASE_FAILED' }); }
                }
                if (checkpoint.results.authorization && request && request.payload && request.payload.providerToken) {
                    try {
                        await SERVICE.DefaultPaymentExecutionService.execute({ tenant: checkpoint.tenant, operation: 'VOID', providerToken: request.payload.providerToken, amount: checkpoint.results.authorization.amount, currency: checkpoint.results.authorization.currency, idempotencyKey: checkpoint.idempotencyKey + ':payment:void', correlationId: checkpoint.correlationId }, SERVICE.DefaultStripeSandboxAdapterService, { find: async (tenant, key) => (await self.get(SERVICE.DefaultPaymentTransactionEntryService, tenant, { idempotencyKey: key }, checkpoint.authData, 1))[0], record: model => self.save(SERVICE.DefaultPaymentTransactionEntryService, checkpoint.tenant, Object.assign({ code: checkpoint.idempotencyKey + ':void', orderCode: request.payload.orderCode, revision: 0 }, model), checkpoint.authData) });
                        outcomes.push({ type: 'PAYMENT_VOID', status: 'COMPLETED' });
                    } catch (voidError) { outcomes.push({ type: 'PAYMENT_VOID', status: 'FAILED', errorCode: voidError.code || 'VOID_FAILED' }); }
                }
                return self.save(SERVICE.DefaultCheckoutCheckpointService, checkpoint.tenant, { code: checkpoint.idempotencyKey, tenant: checkpoint.tenant, ownerId: checkpoint.ownerId, status: outcomes.every(value => value.status === 'COMPLETED') ? 'COMPENSATED' : 'COMPENSATION_REQUIRED', revision: 0, idempotencyKey: checkpoint.idempotencyKey, correlationId: checkpoint.correlationId, evidence: { completed: checkpoint.completed, compensation: outcomes, errorCode: error.code || 'PLACEMENT_FAILED' } }, checkpoint.authData);
            }
        };
    }
};
