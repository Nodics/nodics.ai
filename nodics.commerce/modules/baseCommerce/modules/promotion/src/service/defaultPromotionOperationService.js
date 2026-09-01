/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const crypto = require('node:crypto');

/** @module promotion/src/service/defaultPromotionOperationService @description Provides bounded promotion eligibility, preview, redemption, reversal, lifecycle, coupon, budget, and analytics operations across caller contexts. @layer service @owner promotion */
module.exports = {
    unwrap: response => response && Object.prototype.hasOwnProperty.call(response, 'result') ? response.result : response,
    /**
     * Builds service-account authorization context for Promotion-owned internal reads and mutations.
     * Customer and BackOffice route permissions guard entry into this operation service; generated schema
     * services remain protected from caller-scoped tokens that should not directly read/write Promotion rows.
     * @param {Object} request Operation request.
     * @returns {Object} Service authorization data.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    serviceAuthData: function (request) {
        return Object.assign({}, request.authData || {}, {
            tenant: request.tenant,
            enterpriseCode: request.enterpriseCode,
            principalId: 'promotionOperationService',
            code: 'promotionOperationService',
            loginId: 'promotionOperationService',
            principalType: 'service',
            userGroups: ['serviceAccountUserGroup'],
            groups: ['serviceAccountUserGroup']
        });
    },
    /**
     * Converts operation timestamps into the BSON date shape expected by generated Mongo schema validators.
     * @param {*} value Candidate timestamp.
     * @returns {Date} Date instance.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    schemaDate: function (value) {
        if (value instanceof Date) return value;
        return value ? new Date(value) : new Date();
    },
    /**
     * Applies generated-schema base fields for Promotion-owned persistence records.
     * @param {Object} model Persistence model.
     * @param {Object} request Operation request.
     * @returns {Object} Model with base fields.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    withSchemaBase: function (model, request) {
        const now = this.schemaDate(request && request.now);
        const created = model.created ? this.schemaDate(model.created) : now;
        return Object.assign({}, model, {
            enterpriseCode: model.enterpriseCode || request && request.enterpriseCode,
            active: model.active !== undefined ? model.active : true,
            created,
            updated: now
        });
    },
    /**
     * Executes `hashToken` as a loader-visible operation owned by this module.
     * @param {*} tenant Value defined by the owning module contract.
     * @param {*} couponCode Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    hashToken: function (tenant, couponCode) {
        return crypto.createHash('sha256').update([tenant, String(couponCode || '').trim().toUpperCase()].join('|')).digest('hex');
    },
    /**
     * Executes `exact` as a loader-visible operation owned by this module.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    exact: function () {
        return SERVICE.DefaultExactAmountService || { normalize: value => Number(value || 0).toFixed(2) };
    },
    /**
     * Executes `enterpriseQuery` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @param {*} query Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    enterpriseQuery: function (request, query) {
        const scoped = Object.assign({}, query);
        if (request.enterpriseCode) scoped.enterpriseCode = request.enterpriseCode;
        return scoped;
    },
    /**
     * Executes `generatedCouponCodes` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    generatedCouponCodes: function (request) {
        const payload = request.payload || {};
        if (Array.isArray(payload.couponCodes) && payload.couponCodes.length) return payload.couponCodes;
        const quantity = Number(payload.quantity || payload.count || 0);
        if (!Number.isInteger(quantity) || quantity < 0 || quantity > Number(payload.maximumGenerationQuantity || 10000)) throw new Error('Coupon generation quantity is invalid');
        const prefix = String(payload.prefix || payload.promotionCode || 'COUPON').replace(/[^A-Za-z0-9]/gu, '').toUpperCase().slice(0, 12) || 'COUPON';
        const width = Number(payload.sequenceWidth || 5);
        const seed = String(payload.seed || request.idempotencyKey || request.requestId || payload.batchCode || Date.now());
        const tokens = [];
        for (let index = 1; index <= quantity; index += 1) {
            const sequence = String(index).padStart(width, '0');
            const check = crypto.createHash('sha1').update([request.tenant, request.enterpriseCode, prefix, seed, sequence].join('|')).digest('hex').slice(0, 6).toUpperCase();
            tokens.push([prefix, sequence, check].join('-'));
        }
        return tokens;
    },
    /**
     * Executes `promotions` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    promotions: async function (request) {
        const response = await SERVICE.DefaultPromotionService.get({ tenant: request.tenant, authData: this.serviceAuthData(request), query: this.enterpriseQuery(request, { tenant: request.tenant, status: 'ACTIVE' }), pageSize: 100 });
        const result = this.unwrap(response);
        return Array.isArray(result) ? result : result ? [result] : [];
    },
    /**
     * Executes `context` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    context: function (request) {
        const payload = request.payload || {};
        return {
            customerId: request.ownerId,
            customerGroup: payload.customerGroup,
            subtotal: payload.subtotal || payload.cartSubtotal || '0.00',
            productCodes: payload.productCodes || [],
            currency: payload.currency,
            couponCode: payload.couponCode,
            cartCode: payload.cartCode
        };
    },
    /**
     * Executes `getOne` as a loader-visible operation owned by this module.
     * @param {*} service Value defined by the owning module contract.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    getOne: async function (service, request) {
        if (!service || !service.get) return undefined;
        const result = this.unwrap(await service.get(request));
        return Array.isArray(result) ? result[0] : result;
    },
    /**
     * Executes `updateOrSave` as a loader-visible operation owned by this module.
     * @param {*} service Value defined by the owning module contract.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    updateOrSave: async function (service, request) {
        if (!service) return undefined;
        if (service.update && request.query) return this.unwrap(await service.update(request));
        if (service.save) return this.unwrap(await service.save(request));
        return undefined;
    },
    /**
     * Executes `persistedModel` as a loader-visible operation owned by this module.
     * @param {*} persisted Value returned by generated CRUD.
     * @param {*} fallback Model built by the operation.
     * @returns {*} Concrete model evidence for downstream checkout and promotion flows.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    persistedModel: function (persisted, fallback) {
        const candidate = Array.isArray(persisted) ? persisted[0] : persisted;
        return candidate && candidate.code ? candidate : fallback;
    },
    /**
     * Executes `idempotencyKey` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @param {*} promotion Value defined by the owning module contract.
     * @param {*} targetCode Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    idempotencyKey: function (request, promotion, targetCode) {
        return request.idempotencyKey || request.payload && request.payload.idempotencyKey || [request.tenant, request.ownerId, promotion.code, targetCode].join(':');
    },
    /**
     * Executes `redemptionCode` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @param {*} promotion Value defined by the owning module contract.
     * @param {*} targetCode Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    redemptionCode: function (request, promotion, targetCode) {
        return ['promotionRedemption', crypto.createHash('sha1').update(this.idempotencyKey(request, promotion, targetCode)).digest('hex')].join(':');
    },
    /**
     * Executes `couponBatchCode` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    couponBatchCode: function (request) {
        return request.payload && request.payload.batchCode || ['couponBatch', crypto.createHash('sha1').update([request.tenant, request.payload && request.payload.promotionCode, request.idempotencyKey || request.requestId || Date.now()].join(':')).digest('hex')].join(':');
    },
    /**
     * Executes `persistBudgetLedger` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @param {*} input Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    persistBudgetLedger: async function (request, input) {
        if (!SERVICE.DefaultPromotionBudgetLedgerService || !SERVICE.DefaultPromotionBudgetLedgerService.save) return undefined;
        const model = this.withSchemaBase({
            code: ['promotionBudgetLedger', crypto.createHash('sha1').update([request.tenant, input.promotionCode, input.mutationType, input.idempotencyKey, input.afterSpent].join(':')).digest('hex')].join(':'),
            tenant: request.tenant,
            promotionCode: input.promotionCode,
            mutationType: input.mutationType,
            amount: input.amount,
            beforeSpent: input.beforeSpent,
            afterSpent: input.afterSpent,
            targetCode: input.targetCode,
            idempotencyKey: input.idempotencyKey,
            actorId: request.actorId || request.ownerId || request.authData && (request.authData.principalId || request.authData.loginId),
            correlationId: request.correlationId || request.requestId,
            occurredAt: this.schemaDate(request.now)
        }, request);
        return this.unwrap(await SERVICE.DefaultPromotionBudgetLedgerService.save({ tenant: request.tenant, authData: this.serviceAuthData(request), model }));
    },
    /**
     * Executes `createCouponBatch` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    createCouponBatch: async function (request) {
        const payload = request.payload || {};
        if (!payload.promotionCode) throw new Error('Promotion code is required for coupon batch');
        const tokens = this.generatedCouponCodes(request);
        const batch = {
            code: this.couponBatchCode(request),
            tenant: request.tenant,
            enterpriseCode: request.enterpriseCode || payload.enterpriseCode,
            promotionCode: payload.promotionCode,
            status: 'GENERATED',
            issuedCount: tokens.length,
            reservedCount: 0,
            tokenHashPolicy: payload.tokenHashPolicy || 'TENANT_UPPERCASE_SHA256',
            sourceReference: payload.sourceReference,
            revision: 0
        };
        if (SERVICE.DefaultCouponBatchService && SERVICE.DefaultCouponBatchService.save) {
            await SERVICE.DefaultCouponBatchService.save({ tenant: request.tenant, authData: this.serviceAuthData(request), model: this.withSchemaBase(batch, request) });
        }
        const coupons = [];
        for (const token of tokens) {
            const model = {
                code: [batch.code, crypto.createHash('sha1').update(String(token)).digest('hex')].join(':'),
                tenant: request.tenant,
                enterpriseCode: request.enterpriseCode || payload.enterpriseCode,
                promotionCode: payload.promotionCode,
                batchCode: batch.code,
                tokenHash: this.hashToken(request.tenant, token),
                status: 'ACTIVE',
                maxUses: Number(payload.maxUses || 1),
                usedCount: 0,
                revision: 0
            };
            const couponModel = this.withSchemaBase(model, request);
            coupons.push(couponModel);
            if (SERVICE.DefaultCouponService && SERVICE.DefaultCouponService.save) {
                await SERVICE.DefaultCouponService.save({ tenant: request.tenant, authData: this.serviceAuthData(request), model: couponModel });
            }
        }
        return { batch: this.withSchemaBase(batch, request), coupons };
    },
    /**
     * Executes `saveDraft` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    saveDraft: async function (request) {
        const payload = request.payload || {};
        if (!payload.code && !request.promotionCode) throw new Error('Promotion code is required for draft save');
        const code = request.promotionCode || payload.code;
        const now = request.now ? new Date(request.now) : new Date();
        const existing = await this.getOne(SERVICE.DefaultPromotionService, { tenant: request.tenant, authData: this.serviceAuthData(request), query: this.enterpriseQuery(request, { tenant: request.tenant, code }), pageSize: 1 });
        const model = this.withSchemaBase(Object.assign({}, existing || {}, payload, {
            code,
            tenant: request.tenant,
            enterpriseCode: request.enterpriseCode || payload.enterpriseCode,
            active: payload.active !== undefined ? payload.active : existing && existing.active !== undefined ? existing.active : true,
            created: existing && existing.created || payload.created && new Date(payload.created) || now,
            updated: now,
            status: payload.status || existing && existing.status || 'DRAFT',
            priority: Number(payload.priority !== undefined ? payload.priority : existing && existing.priority || 0),
            conditions: payload.conditions || existing && existing.conditions || {},
            actions: payload.actions || existing && existing.actions || {},
            budget: payload.budget || existing && existing.budget,
            approval: Object.assign({}, existing && existing.approval, payload.approval, {
                lastEditedBy: request.actorId,
                lastEditedAt: now.toISOString()
            }),
            revision: Number(existing && existing.revision || payload.revision || 0) + (existing ? 1 : 0)
        }), request);
        const saved = await this.updateOrSave(SERVICE.DefaultPromotionService, {
            tenant: request.tenant,
            authData: this.serviceAuthData(request),
            query: existing ? this.enterpriseQuery(request, { tenant: request.tenant, code }) : undefined,
            model
        }) || model;
        return { promotion: saved, builderState: 'DRAFT_SAVED' };
    },
    /**
     * Executes `loadPromotion` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    loadPromotion: async function (request) {
        const code = request.promotionCode || request.payload && request.payload.promotionCode || request.payload && request.payload.code;
        if (!code) throw new Error('Promotion code is required');
        const promotion = await this.getOne(SERVICE.DefaultPromotionService, { tenant: request.tenant, authData: this.serviceAuthData(request), query: this.enterpriseQuery(request, { tenant: request.tenant, code }), pageSize: 1 });
        if (!promotion) throw new Error('Promotion was not found');
        return promotion;
    },
    /**
     * Executes `transitionPromotion` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    transitionPromotion: async function (request) {
        const payload = request.payload || {};
        const promotion = await this.loadPromotion(request);
        if (request.actionCode === 'APPROVE' && promotion.approval && promotion.approval.submittedBy && promotion.approval.submittedBy === request.actorId) {
            throw new Error('Maker-checker separation is required for promotion approval');
        }
        const now = request.now || new Date().toISOString();
        const approvalPatch = Object.assign({}, promotion.approval, {
            lastAction: request.actionCode,
            lastActionBy: request.actorId,
            lastActionAt: now,
            reasonCode: payload.reasonCode || promotion.approval && promotion.approval.reasonCode,
            conflictCheck: payload.conflictCheck || promotion.approval && promotion.approval.conflictCheck || 'NOT_RUN'
        });
        if (request.actionCode === 'SUBMIT') {
            approvalPatch.submittedBy = request.actorId;
            approvalPatch.submittedAt = now;
        }
        if (request.actionCode === 'APPROVE') {
            approvalPatch.approvedBy = request.actorId;
            approvalPatch.approvedAt = now;
            approvalPatch.checklist = payload.checklist || approvalPatch.checklist || ['eligibility reviewed', 'budget reviewed', 'coupon policy reviewed'];
        }
        const model = this.withSchemaBase(Object.assign({}, promotion, {
            status: request.targetStatus,
            validFrom: payload.validFrom || promotion.validFrom,
            validTo: payload.validTo || promotion.validTo,
            approval: approvalPatch,
            revision: Number(promotion.revision || 0) + 1
        }), request);
        const updated = await this.updateOrSave(SERVICE.DefaultPromotionService, {
            tenant: request.tenant,
            authData: this.serviceAuthData(request),
            query: this.enterpriseQuery(request, { tenant: request.tenant, code: promotion.code }),
            model
        }) || model;
        return { promotion: updated, actionCode: request.actionCode, builderState: [request.actionCode, 'COMPLETE'].join('_') };
    },
    /**
     * Executes `listFromService` as a loader-visible operation owned by this module.
     * @param {*} service Value defined by the owning module contract.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    listFromService: async function (service, request) {
        if (!service || !service.get) return [];
        const result = this.unwrap(await service.get(request));
        return Array.isArray(result) ? result : result ? [result] : [];
    },
    /**
     * Executes `budgetLedger` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    budgetLedger: async function (request) {
        const promotionCode = request.promotionCode || request.payload && request.payload.promotionCode;
        if (!promotionCode) throw new Error('Promotion code is required for budget ledger');
        const entries = await this.listFromService(SERVICE.DefaultPromotionBudgetLedgerService, { tenant: request.tenant, authData: this.serviceAuthData(request), query: this.enterpriseQuery(request, { tenant: request.tenant, promotionCode }), pageSize: Number(request.query && request.query.pageSize || 100) });
        return { promotionCode, entries };
    },
    /**
     * Executes `analytics` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    analytics: async function (request) {
        const promotionCode = request.promotionCode || request.payload && request.payload.promotionCode;
        if (!promotionCode) throw new Error('Promotion code is required for analytics');
        const redemptions = await this.listFromService(SERVICE.DefaultPromotionRedemptionService, { tenant: request.tenant, authData: this.serviceAuthData(request), query: this.enterpriseQuery(request, { tenant: request.tenant, promotionCode }), pageSize: 1000 });
        const ledger = await this.listFromService(SERVICE.DefaultPromotionBudgetLedgerService, { tenant: request.tenant, authData: this.serviceAuthData(request), query: this.enterpriseQuery(request, { tenant: request.tenant, promotionCode }), pageSize: 1000 });
        const coupons = await this.listFromService(SERVICE.DefaultCouponService, { tenant: request.tenant, authData: this.serviceAuthData(request), query: this.enterpriseQuery(request, { tenant: request.tenant, promotionCode }), pageSize: 1000 });
        const applied = redemptions.filter(item => item.status === 'APPLIED').length;
        const reversed = redemptions.filter(item => item.status === 'REVERSED').length;
        const committedAmount = ledger.filter(item => item.mutationType === 'COMMIT').reduce((sum, item) => sum + Number(item.amount || 0), 0);
        const releasedAmount = ledger.filter(item => item.mutationType === 'RELEASE').reduce((sum, item) => sum + Number(item.amount || 0), 0);
        return {
            promotionCode,
            redemptionCount: redemptions.length,
            appliedCount: applied,
            reversedCount: reversed,
            couponIssuedCount: coupons.length,
            couponReservedCount: coupons.filter(item => item.status === 'RESERVED').length,
            couponRedeemedCount: coupons.filter(item => item.status === 'REDEEMED').length,
            budgetCommitted: this.exact().normalize(String(committedAmount)),
            budgetReleased: this.exact().normalize(String(releasedAmount)),
            budgetExposure: this.exact().normalize(String(committedAmount - releasedAmount))
        };
    },
    /**
     * Executes `couponRequired` as a loader-visible operation owned by this module.
     * @param {*} promotion Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    couponRequired: function (promotion) {
        return Boolean(promotion && promotion.conditions && promotion.conditions.couponRequired === true);
    },
    /**
     * Executes `couponOwnershipRequired` as a loader-visible operation owned by this module.
     * @param {*} promotion Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    couponOwnershipRequired: function (promotion) {
        return Boolean(promotion && promotion.conditions && promotion.conditions.customerOwnsCouponCode === true);
    },
    /**
     * Resolves configured promotion action amount against the request context.
     * @param {Object} request Promotion request.
     * @param {Object} action Promotion action.
     * @returns {string} Discount amount.
     */
    discountAmount: function (request, action) {
        const exact = this.exact();
        const discountType = String(action.discountType || '').toUpperCase();
        if (discountType === 'PERCENT') {
            const subtotal = exact.normalize(String(request.subtotal || request.payload && request.payload.subtotal || '0'));
            const value = exact.normalize(String(action.discountValue || action.percent || '0'));
            return exact.multiply(exact.multiply(subtotal, value), '0.01');
        }
        return action.discountAmount || '0.00';
    },
    /**
     * Executes `couponUsable` as a loader-visible operation owned by this module.
     * @param {*} coupon Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    couponUsable: function (coupon) {
        const activeStatuses = { ACTIVE: true, AVAILABLE: true, CLAIMED: true, DELIVERED: true };
        return Boolean(coupon && activeStatuses[coupon.status] && coupon.benefitStatus !== 'REDEEMED' && Number(coupon.usedCount || 0) < Number(coupon.maxUses || 1));
    },
    /**
     * Executes `couponSaleAvailable` as a loader-visible operation owned by this module.
     * @param {*} coupon Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    couponSaleAvailable: function (coupon) {
        const status = coupon && coupon.status;
        return Boolean(coupon && (status === 'ACTIVE' || status === 'AVAILABLE') && !coupon.soldTo && !coupon.reservedFor && Number(coupon.usedCount || 0) < Number(coupon.maxUses || 1));
    },
    /**
     * Executes `loadCouponPool` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    loadCouponPool: async function (request) {
        const payload = request.payload || {};
        const query = this.enterpriseQuery(request, { tenant: request.tenant });
        if (payload.batchCode || request.batchCode) query.batchCode = payload.batchCode || request.batchCode;
        if (payload.promotionCode || request.promotionCode) query.promotionCode = payload.promotionCode || request.promotionCode;
        const coupons = await this.listFromService(SERVICE.DefaultCouponService, { tenant: request.tenant, authData: this.serviceAuthData(request), query, pageSize: Number(payload.pageSize || request.pageSize || 1000) });
        return coupons.sort((a, b) => String(a.code).localeCompare(String(b.code)));
    },
    /**
     * Executes `couponPoolAvailability` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    couponPoolAvailability: async function (request) {
        const coupons = await this.loadCouponPool(request);
        const available = coupons.filter(coupon => this.couponSaleAvailable(coupon));
        return {
            available: available.length >= Number(request.quantity || request.payload && request.payload.quantity || 1),
            availableQuantity: String(available.length),
            issuedQuantity: String(coupons.length),
            inventoryStrategy: 'COUPON_CODE_POOL',
            strategy: 'COUPON_CODE_POOL',
            reservableAt: 'CHECKOUT_BEFORE_PAYMENT',
            guaranteed: false
        };
    },
    /**
     * Executes `findCouponByIdempotency` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    findCouponByIdempotency: async function (request) {
        if (!request.idempotencyKey) return undefined;
        return this.getOne(SERVICE.DefaultCouponService, {
            tenant: request.tenant,
            authData: this.serviceAuthData(request),
            query: this.enterpriseQuery(request, { tenant: request.tenant, idempotencyKey: request.idempotencyKey }),
            pageSize: 1
        });
    },
    /**
     * Executes `reserveCouponCodeForCheckout` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    reserveCouponCodeForCheckout: async function (request) {
        const existing = await this.findCouponByIdempotency(request);
        if (existing) return existing;
        const payload = request.payload || {};
        const coupons = await this.loadCouponPool(request);
        const coupon = coupons.find(item => this.couponSaleAvailable(item));
        if (!coupon) throw new Error('Coupon code stock unavailable');
        const reservedAt = this.schemaDate(request.now);
        const reservedUntil = payload.reservedUntil ? this.schemaDate(payload.reservedUntil) : new Date(reservedAt.getTime() + Number(payload.ttlSeconds || 900) * 1000);
        const model = this.withSchemaBase(Object.assign({}, coupon, {
            status: 'RESERVED',
            saleStatus: 'RESERVED',
            benefitStatus: coupon.benefitStatus || 'UNCLAIMED',
            reservedFor: request.ownerId,
            orderCode: payload.orderCode,
            cartCode: payload.cartCode,
            entryCode: payload.entryCode,
            productCode: payload.productCode,
            sku: payload.sku,
            idempotencyKey: request.idempotencyKey,
            reservedAt,
            reservedUntil,
            revision: Number(coupon.revision || 0) + 1
        }), request);
        return this.persistedModel(await this.updateOrSave(SERVICE.DefaultCouponService, { tenant: request.tenant, authData: this.serviceAuthData(request), query: this.enterpriseQuery(request, { tenant: request.tenant, code: coupon.code, revision: coupon.revision, status: coupon.status }), model }), model);
    },
    /**
     * Executes `transitionReservedCouponSale` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @param {*} targetStatus Value defined by the owning module contract.
     * @param {*} patch Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    transitionReservedCouponSale: async function (request, targetStatus, patch) {
        const payload = request.payload || {};
        const couponCode = payload.couponCode || request.couponCode;
        if (!couponCode) throw new Error('Coupon code is required');
        const coupon = await this.getOne(SERVICE.DefaultCouponService, { tenant: request.tenant, authData: this.serviceAuthData(request), query: this.enterpriseQuery(request, { tenant: request.tenant, code: couponCode }), pageSize: 1 });
        if (!coupon) throw new Error('Coupon was not found');
        const ownerId = request.ownerId || coupon.reservedFor || coupon.soldTo;
        if (coupon.reservedFor && request.ownerId && coupon.reservedFor !== request.ownerId) throw new Error('Coupon is reserved for another customer');
        if (coupon.soldTo && request.ownerId && coupon.soldTo !== request.ownerId) throw new Error('Coupon is owned by another customer');
        const model = this.withSchemaBase(Object.assign({}, coupon, patch || {}, {
            status: targetStatus,
            soldTo: targetStatus === 'SOLD' || targetStatus === 'DELIVERED' || targetStatus === 'CLAIMED' || targetStatus === 'REDEEMED' ? ownerId : coupon.soldTo,
            revision: Number(coupon.revision || 0) + 1
        }), request);
        return this.persistedModel(await this.updateOrSave(SERVICE.DefaultCouponService, { tenant: request.tenant, authData: this.serviceAuthData(request), query: this.enterpriseQuery(request, { tenant: request.tenant, code: coupon.code }), model }), model);
    },
    /**
     * Executes `confirmCouponCodeSale` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    confirmCouponCodeSale: async function (request) {
        return this.transitionReservedCouponSale(request, 'SOLD', {
            saleStatus: 'SOLD',
            benefitStatus: 'UNCLAIMED',
            orderCode: request.payload && request.payload.orderCode,
            soldAt: this.schemaDate(request.now)
        });
    },
    /**
     * Executes `deliverCouponCodeSale` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    deliverCouponCodeSale: async function (request) {
        return this.transitionReservedCouponSale(request, 'DELIVERED', {
            saleStatus: 'DELIVERED',
            benefitStatus: 'UNCLAIMED',
            orderCode: request.payload && request.payload.orderCode,
            deliveredAt: this.schemaDate(request.now)
        });
    },
    /**
     * Executes `releaseCouponCodeReservation` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    releaseCouponCodeReservation: async function (request) {
        const payload = request.payload || {};
        const couponCode = payload.couponCode || request.couponCode;
        if (!couponCode) throw new Error('Coupon code is required');
        const coupon = await this.getOne(SERVICE.DefaultCouponService, { tenant: request.tenant, authData: this.serviceAuthData(request), query: this.enterpriseQuery(request, { tenant: request.tenant, code: couponCode }), pageSize: 1 });
        if (!coupon) return undefined;
        if (coupon.status !== 'RESERVED') return coupon;
        if (coupon.reservedFor && request.ownerId && coupon.reservedFor !== request.ownerId) throw new Error('Coupon is reserved for another customer');
        const model = this.withSchemaBase(Object.assign({}, coupon, {
            status: 'ACTIVE',
            saleStatus: 'AVAILABLE',
            benefitStatus: undefined,
            reservedFor: undefined,
            reservedAt: undefined,
            reservedUntil: undefined,
            idempotencyKey: undefined,
            orderCode: undefined,
            cartCode: undefined,
            entryCode: undefined,
            productCode: undefined,
            sku: undefined,
            revision: Number(coupon.revision || 0) + 1
        }), request);
        return this.persistedModel(await this.updateOrSave(SERVICE.DefaultCouponService, { tenant: request.tenant, authData: this.serviceAuthData(request), query: this.enterpriseQuery(request, { tenant: request.tenant, code: coupon.code }), model }), model);
    },
    /**
     * Executes `claimPurchasedCouponCode` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    claimPurchasedCouponCode: async function (request) {
        return this.transitionReservedCouponSale(request, 'CLAIMED', {
            saleStatus: 'DELIVERED',
            benefitStatus: 'CLAIMED',
            claimedAt: this.schemaDate(request.now)
        });
    },
    /**
     * Executes `redeemClaimedCouponCode` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    redeemClaimedCouponCode: async function (request) {
        const payload = request.payload || {};
        const coupon = await this.transitionReservedCouponSale(request, 'REDEEMED', {
            saleStatus: 'DELIVERED',
            benefitStatus: 'REDEEMED',
            usedCount: Number(payload.usedCount || 1),
            redeemedAt: this.schemaDate(request.now)
        });
        return coupon;
    },
    /**
     * Executes `loadCouponCandidates` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    loadCouponCandidates: async function (request) {
        const couponCode = request.payload && request.payload.couponCode || request.couponCode;
        if (!couponCode) return [];
        const result = await this.listFromService(SERVICE.DefaultCouponService, {
            tenant: request.tenant,
            authData: this.serviceAuthData(request),
            query: this.enterpriseQuery(request, { tenant: request.tenant, tokenHash: this.hashToken(request.tenant, couponCode) }),
            pageSize: 20
        });
        return result.filter(coupon => this.couponUsable(coupon) && (!coupon.soldTo || !request.ownerId || coupon.soldTo === request.ownerId));
    },
    /**
     * Executes `selectPromotionForRequest` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @param {*} preview Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    selectPromotionForRequest: async function (request, preview) {
        const selected = preview && Array.isArray(preview.selected) ? preview.selected : [];
        const couponCode = request.payload && request.payload.couponCode || request.couponCode;
        if (!couponCode) {
            return { promotion: selected.find(promotion => !this.couponRequired(promotion)) };
        }
        const coupons = await this.loadCouponCandidates(request);
        for (const promotion of selected) {
            const coupon = coupons.find(item => item.promotionCode === promotion.code);
            if (coupon && (!this.couponOwnershipRequired(promotion) || coupon.soldTo === request.ownerId)) return { promotion, coupon };
        }
        throw new Error('Coupon is invalid for eligible promotions');
    },
    /**
     * Executes `setCouponBatchReservation` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @param {*} status Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    setCouponBatchReservation: async function (request, status) {
        const payload = request.payload || {};
        const batchCode = payload.batchCode || request.batchCode;
        if (!batchCode) throw new Error('Coupon batch code is required');
        const batch = await this.getOne(SERVICE.DefaultCouponBatchService, { tenant: request.tenant, authData: this.serviceAuthData(request), query: this.enterpriseQuery(request, { tenant: request.tenant, code: batchCode }), pageSize: 1 });
        if (!batch) throw new Error('Coupon batch was not found');
        const coupons = this.unwrap(await SERVICE.DefaultCouponService.get({ tenant: request.tenant, authData: this.serviceAuthData(request), query: this.enterpriseQuery(request, { tenant: request.tenant, batchCode }), pageSize: 1000 })) || [];
        const couponRows = Array.isArray(coupons) ? coupons : [coupons];
        let reservedCount = 0;
        for (const coupon of couponRows) {
            const model = Object.assign({}, coupon, {
                status,
                reservedFor: status === 'RESERVED' ? payload.reservedFor || request.ownerId : undefined,
                revision: Number(coupon.revision || 0) + 1
            });
            if (status === 'RESERVED') reservedCount += 1;
            await this.updateOrSave(SERVICE.DefaultCouponService, { tenant: request.tenant, authData: this.serviceAuthData(request), query: this.enterpriseQuery(request, { tenant: request.tenant, code: coupon.code }), model: this.withSchemaBase(model, request) });
        }
        const updatedBatch = this.withSchemaBase(Object.assign({}, batch, { status: status === 'RESERVED' ? 'RESERVED' : 'RELEASED', reservedCount, revision: Number(batch.revision || 0) + 1 }), request);
        await this.updateOrSave(SERVICE.DefaultCouponBatchService, { tenant: request.tenant, authData: this.serviceAuthData(request), query: this.enterpriseQuery(request, { tenant: request.tenant, code: batch.code }), model: updatedBatch });
        return { batch: updatedBatch, coupons: couponRows.map(coupon => Object.assign({}, coupon, { status })) };
    },
    /**
     * Executes `loadCoupon` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @param {*} promotion Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    loadCoupon: async function (request, promotion) {
        const couponCode = request.payload && request.payload.couponCode;
        if (!couponCode) {
            if (this.couponRequired(promotion)) throw new Error('Coupon code is required for selected promotion');
            return undefined;
        }
        const coupon = await this.getOne(SERVICE.DefaultCouponService, {
            tenant: request.tenant,
            authData: this.serviceAuthData(request),
            query: this.enterpriseQuery(request, { tenant: request.tenant, promotionCode: promotion.code, tokenHash: this.hashToken(request.tenant, couponCode) }),
            pageSize: 1
        });
        if (!coupon) throw new Error('Coupon is invalid for selected promotion');
        if (!this.couponUsable(coupon)) throw new Error('Coupon is not usable');
        if (this.couponOwnershipRequired(promotion) && coupon.soldTo !== request.ownerId) throw new Error('Coupon is not owned by customer');
        return coupon;
    },
    /**
     * Executes `consumeCoupon` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @param {*} coupon Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    consumeCoupon: async function (request, coupon) {
        if (!coupon) return undefined;
        const usedCount = Number(coupon.usedCount || 0) + 1;
        const model = this.withSchemaBase(Object.assign({}, coupon, {
            usedCount,
            status: usedCount >= Number(coupon.maxUses || 1) ? 'REDEEMED' : 'ACTIVE',
            benefitStatus: usedCount >= Number(coupon.maxUses || 1) ? 'REDEEMED' : 'CLAIMED',
            revision: Number(coupon.revision || 0) + 1
        }), request);
        return this.updateOrSave(SERVICE.DefaultCouponService, {
            tenant: request.tenant,
            authData: this.serviceAuthData(request),
            query: this.enterpriseQuery(request, { tenant: request.tenant, code: coupon.code }),
            model
        });
    },
    /**
     * Executes `consumeBudget` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @param {*} promotion Value defined by the owning module contract.
     * @param {*} amount Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    consumeBudget: async function (request, promotion, amount) {
        if (!promotion.budget) return promotion;
        const exact = this.exact();
        const spent = exact.normalize(String(promotion.budget.spent || '0.00'));
        const limit = exact.normalize(String(promotion.budget.limit || '0.00'));
        const nextSpent = exact.add ? exact.add(spent, amount) : String(Number(spent) + Number(amount));
        if (exact.compare ? exact.compare(nextSpent, limit) > 0 : Number(nextSpent) > Number(limit)) throw new Error('Promotion budget exhausted');
        const model = this.withSchemaBase(Object.assign({}, promotion, { budget: Object.assign({}, promotion.budget, { spent: nextSpent }), revision: Number(promotion.revision || 0) + 1 }), request);
        const updated = await this.updateOrSave(SERVICE.DefaultPromotionService, {
            tenant: request.tenant,
            authData: this.serviceAuthData(request),
            query: this.enterpriseQuery(request, { tenant: request.tenant, code: promotion.code }),
            model
        }) || model;
        await this.persistBudgetLedger(request, { promotionCode: promotion.code, mutationType: 'COMMIT', amount, beforeSpent: spent, afterSpent: nextSpent, targetCode: request.payload && request.payload.cartCode || request.ownerId, idempotencyKey: this.idempotencyKey(request, promotion, request.payload && request.payload.cartCode || request.ownerId) });
        return updated;
    },
    /**
     * Executes `releaseCoupon` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @param {*} redemption Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    releaseCoupon: async function (request, redemption) {
        if (!redemption.couponCode) return undefined;
        const coupon = await this.getOne(SERVICE.DefaultCouponService, {
            tenant: request.tenant,
            authData: this.serviceAuthData(request),
            query: this.enterpriseQuery(request, { tenant: request.tenant, code: redemption.couponCode }),
            pageSize: 1
        });
        if (!coupon) return undefined;
        const usedCount = Math.max(0, Number(coupon.usedCount || 0) - 1);
        const model = this.withSchemaBase(Object.assign({}, coupon, {
            usedCount,
            status: coupon.status === 'REDEEMED' && usedCount < Number(coupon.maxUses || 1) ? coupon.soldTo ? 'DELIVERED' : 'ACTIVE' : coupon.status,
            benefitStatus: usedCount <= 0 ? 'UNCLAIMED' : coupon.benefitStatus,
            revision: Number(coupon.revision || 0) + 1
        }), request);
        return this.updateOrSave(SERVICE.DefaultCouponService, {
            tenant: request.tenant,
            authData: this.serviceAuthData(request),
            query: this.enterpriseQuery(request, { tenant: request.tenant, code: coupon.code }),
            model
        }) || model;
    },
    /**
     * Executes `releaseBudget` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @param {*} redemption Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    releaseBudget: async function (request, redemption) {
        const promotion = await this.getOne(SERVICE.DefaultPromotionService, {
            tenant: request.tenant,
            authData: this.serviceAuthData(request),
            query: this.enterpriseQuery(request, { tenant: request.tenant, code: redemption.promotionCode }),
            pageSize: 1
        });
        if (!promotion || !promotion.budget) return undefined;
        const exact = this.exact();
        const spent = exact.normalize(String(promotion.budget.spent || '0.00'));
        const discountAmount = exact.normalize(String(redemption.discountAmount || '0.00'));
        let nextSpent = exact.add ? exact.add(spent, discountAmount.startsWith('-') ? discountAmount.slice(1) : `-${discountAmount}`) : String(Number(spent) - Number(discountAmount));
        if (exact.compare ? exact.compare(nextSpent, '0') < 0 : Number(nextSpent) < 0) nextSpent = '0';
        const model = this.withSchemaBase(Object.assign({}, promotion, {
            budget: Object.assign({}, promotion.budget, { spent: nextSpent }),
            revision: Number(promotion.revision || 0) + 1
        }), request);
        const updated = await this.updateOrSave(SERVICE.DefaultPromotionService, {
            tenant: request.tenant,
            authData: this.serviceAuthData(request),
            query: this.enterpriseQuery(request, { tenant: request.tenant, code: promotion.code }),
            model
        }) || model;
        await this.persistBudgetLedger(request, { promotionCode: promotion.code, mutationType: 'RELEASE', amount: discountAmount, beforeSpent: spent, afterSpent: nextSpent, targetCode: redemption.targetCode, idempotencyKey: redemption.idempotencyKey || [redemption.code, 'release'].join(':') });
        return updated;
    },
    /**
     * Executes `persistDecision` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @param {*} decision Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    persistDecision: async function (request, decision) {
        const decidedAt = this.schemaDate(request.now);
        const model = this.withSchemaBase(Object.assign({ code: ['discountDecision', decision.promotionCode, decision.targetCode].join(':'), decidedAt }, decision), request);
        if (SERVICE.DefaultDiscountDecisionService && SERVICE.DefaultDiscountDecisionService.save) {
            await SERVICE.DefaultDiscountDecisionService.save({ tenant: request.tenant, authData: this.serviceAuthData(request), model });
        }
        return model;
    },
    /**
     * Executes `persistRedemption` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @param {*} promotion Value defined by the owning module contract.
     * @param {*} coupon Value defined by the owning module contract.
     * @param {*} decision Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    persistRedemption: async function (request, promotion, coupon, decision) {
        const targetCode = decision.targetCode;
        const appliedAt = this.schemaDate(request.now);
        const model = this.withSchemaBase({
            code: this.redemptionCode(request, promotion, targetCode),
            tenant: request.tenant,
            enterpriseCode: request.enterpriseCode || promotion.enterpriseCode || decision.enterpriseCode,
            promotionCode: promotion.code,
            couponCode: coupon && coupon.code,
            orderCode: request.payload && request.payload.orderCode,
            cartCode: request.payload && request.payload.cartCode || request.cartCode,
            ownerId: request.ownerId,
            targetType: decision.targetType,
            targetCode,
            discountAmount: decision.discountAmount,
            currency: decision.currency,
            status: 'APPLIED',
            decisionCode: decision.code,
            idempotencyKey: this.idempotencyKey(request, promotion, targetCode),
            correlationId: request.correlationId || request.requestId || decision.correlationId,
            revision: 0,
            appliedAt
        }, request);
        if (SERVICE.DefaultPromotionRedemptionService && SERVICE.DefaultPromotionRedemptionService.save) {
            return this.unwrap(await SERVICE.DefaultPromotionRedemptionService.save({ tenant: request.tenant, authData: this.serviceAuthData(request), model }));
        }
        return model;
    },
    /**
     * Executes `preview` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    preview: async function (request) {
        const promotions = await this.promotions(request);
        const simulation = SERVICE.DefaultPromotionSimulationService.simulate({ tenant: request.tenant, context: this.context(request), now: request.now }, promotions);
        return Object.assign({}, simulation, {
            ownerId: request.ownerId,
            cartCode: request.payload && request.payload.cartCode,
            redemptionStateMutation: 'NONE'
        });
    },
    /**
     * Executes `quote` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    quote: async function (request) {
        const preview = await this.preview(Object.assign({}, request, { payload: Object.assign({}, request.payload, {
            cartCode: request.payload && request.payload.cartCode || request.cartCode,
            couponCode: request.payload && request.payload.couponCode || request.couponCode,
            subtotal: request.payload && request.payload.subtotal || request.subtotal,
            productCodes: request.payload && request.payload.productCodes || request.productCodes || [],
            customerGroup: request.payload && request.payload.customerGroup || request.customerGroup,
            currency: request.payload && request.payload.currency || request.currency
        }) }));
        const selection = await this.selectPromotionForRequest(request, preview);
        if (!selection.promotion) return { discountAmount: '0', reasonCode: 'NO_APPLICABLE_PROMOTION', sourceHash: 'none', mutationPerformed: false };
        const action = selection.promotion.actions || {};
        const decision = SERVICE.DefaultPromotionDecisionService.decide({
            tenant: request.tenant,
            promotionCode: selection.promotion.code,
            targetType: request.targetType || (request.cartCode ? 'CART' : 'CUSTOMER_CONTEXT'),
            targetCode: request.cartCode || request.ownerId,
            discountAmount: this.discountAmount(request, action),
            currency: request.currency || request.payload && request.payload.currency,
            reasonCode: action.reasonCode || 'APPLIED',
            correlationId: request.correlationId || request.requestId
        }, selection.promotion, this.exact());
        return Object.freeze(Object.assign({}, decision, {
            couponCode: selection.coupon && selection.coupon.code,
            mode: 'QUOTE',
            mutationPerformed: false
        }));
    },
    /**
     * Executes `apply` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    apply: async function (request) {
        const preview = await this.preview(request);
        const selection = await this.selectPromotionForRequest(request, preview);
        const selected = selection.promotion;
        if (!selected) {
            return Object.assign({}, preview, { applied: false, reasonCode: 'NO_ELIGIBLE_PROMOTION', decisions: [] });
        }
        const action = selected.actions || {};
        const coupon = selection.coupon || await this.loadCoupon(request, selected);
        const decision = SERVICE.DefaultPromotionDecisionService.decide({
            tenant: request.tenant,
            promotionCode: selected.code,
            targetType: request.payload && request.payload.targetType || (request.payload && request.payload.cartCode ? 'CART' : 'CUSTOMER_CONTEXT'),
            targetCode: request.payload && request.payload.cartCode || request.ownerId,
            discountAmount: this.discountAmount(request, action),
            currency: request.payload && request.payload.currency,
            reasonCode: action.reasonCode || 'APPLIED',
            correlationId: request.correlationId || request.requestId
        }, selected, this.exact());
        const persistedDecision = await this.persistDecision(request, decision);
        await this.consumeBudget(request, selected, persistedDecision.discountAmount);
        await this.consumeCoupon(request, coupon);
        const redemption = await this.persistRedemption(request, selected, coupon, persistedDecision);
        return Object.assign({}, preview, {
            applied: true,
            decisions: [persistedDecision],
            redemption,
            redemptionStateMutation: 'COMMITTED'
        });
    },
    /**
     * Executes `reverse` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    reverse: async function (request) {
        const code = request.redemptionCode || request.payload && request.payload.redemptionCode;
        if (!code) throw new Error('Promotion redemption code is required for reversal');
        const redemption = await this.getOne(SERVICE.DefaultPromotionRedemptionService, { tenant: request.tenant, authData: this.serviceAuthData(request), query: this.enterpriseQuery(request, { tenant: request.tenant, code }), pageSize: 1 });
        if (!redemption) throw new Error('Promotion redemption was not found');
        if (redemption.status === 'REVERSED') return { reversed: true, redemption, idempotent: true };
        const releasedCoupon = await this.releaseCoupon(request, redemption);
        const releasedPromotion = await this.releaseBudget(request, redemption);
        const model = this.withSchemaBase(Object.assign({}, redemption, {
            status: 'REVERSED',
            reversalReasonCode: request.payload && request.payload.reasonCode || 'REVERSAL_REQUESTED',
            reversedAt: this.schemaDate(request.now),
            revision: Number(redemption.revision || 0) + 1
        }), request);
        const updated = await this.updateOrSave(SERVICE.DefaultPromotionRedemptionService, {
            tenant: request.tenant,
            authData: this.serviceAuthData(request),
            query: this.enterpriseQuery(request, { tenant: request.tenant, code }),
            model
        });
        return {
            reversed: true,
            redemption: updated || model,
            idempotent: false,
            compensation: {
                couponReleased: Boolean(releasedCoupon),
                budgetReleased: Boolean(releasedPromotion),
                couponCode: releasedCoupon && releasedCoupon.code,
                promotionCode: releasedPromotion && releasedPromotion.code,
                budgetSpent: releasedPromotion && releasedPromotion.budget && releasedPromotion.budget.spent
            }
        };
    }
};
