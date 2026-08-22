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
     * Executes `promotions` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    promotions: async function (request) {
        const response = await SERVICE.DefaultPromotionService.get({ tenant: request.tenant, authData: this.serviceAuthData(request), query: { tenant: request.tenant, status: 'ACTIVE' }, pageSize: 100 });
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
        const tokens = Array.isArray(payload.couponCodes) ? payload.couponCodes : [];
        const batch = {
            code: this.couponBatchCode(request),
            tenant: request.tenant,
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
        const existing = await this.getOne(SERVICE.DefaultPromotionService, { tenant: request.tenant, authData: this.serviceAuthData(request), query: { tenant: request.tenant, code }, pageSize: 1 });
        const model = this.withSchemaBase(Object.assign({}, existing || {}, payload, {
            code,
            tenant: request.tenant,
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
            query: existing ? { tenant: request.tenant, code } : undefined,
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
        const promotion = await this.getOne(SERVICE.DefaultPromotionService, { tenant: request.tenant, authData: this.serviceAuthData(request), query: { tenant: request.tenant, code }, pageSize: 1 });
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
            query: { tenant: request.tenant, code: promotion.code },
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
        const entries = await this.listFromService(SERVICE.DefaultPromotionBudgetLedgerService, { tenant: request.tenant, authData: this.serviceAuthData(request), query: { tenant: request.tenant, promotionCode }, pageSize: Number(request.query && request.query.pageSize || 100) });
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
        const redemptions = await this.listFromService(SERVICE.DefaultPromotionRedemptionService, { tenant: request.tenant, authData: this.serviceAuthData(request), query: { tenant: request.tenant, promotionCode }, pageSize: 1000 });
        const ledger = await this.listFromService(SERVICE.DefaultPromotionBudgetLedgerService, { tenant: request.tenant, authData: this.serviceAuthData(request), query: { tenant: request.tenant, promotionCode }, pageSize: 1000 });
        const coupons = await this.listFromService(SERVICE.DefaultCouponService, { tenant: request.tenant, authData: this.serviceAuthData(request), query: { tenant: request.tenant, promotionCode }, pageSize: 1000 });
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
        const batch = await this.getOne(SERVICE.DefaultCouponBatchService, { tenant: request.tenant, authData: this.serviceAuthData(request), query: { tenant: request.tenant, code: batchCode }, pageSize: 1 });
        if (!batch) throw new Error('Coupon batch was not found');
        const coupons = this.unwrap(await SERVICE.DefaultCouponService.get({ tenant: request.tenant, authData: this.serviceAuthData(request), query: { tenant: request.tenant, batchCode }, pageSize: 1000 })) || [];
        const couponRows = Array.isArray(coupons) ? coupons : [coupons];
        let reservedCount = 0;
        for (const coupon of couponRows) {
            const model = Object.assign({}, coupon, {
                status,
                reservedFor: status === 'RESERVED' ? payload.reservedFor || request.ownerId : undefined,
                revision: Number(coupon.revision || 0) + 1
            });
            if (status === 'RESERVED') reservedCount += 1;
            await this.updateOrSave(SERVICE.DefaultCouponService, { tenant: request.tenant, authData: this.serviceAuthData(request), query: { tenant: request.tenant, code: coupon.code }, model: this.withSchemaBase(model, request) });
        }
        const updatedBatch = this.withSchemaBase(Object.assign({}, batch, { status: status === 'RESERVED' ? 'RESERVED' : 'RELEASED', reservedCount, revision: Number(batch.revision || 0) + 1 }), request);
        await this.updateOrSave(SERVICE.DefaultCouponBatchService, { tenant: request.tenant, authData: this.serviceAuthData(request), query: { tenant: request.tenant, code: batch.code }, model: updatedBatch });
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
        if (!couponCode) return undefined;
        const coupon = await this.getOne(SERVICE.DefaultCouponService, {
            tenant: request.tenant,
            authData: this.serviceAuthData(request),
            query: { tenant: request.tenant, promotionCode: promotion.code, tokenHash: this.hashToken(request.tenant, couponCode) },
            pageSize: 1
        });
        if (!coupon) throw new Error('Coupon is invalid for selected promotion');
        if (coupon.status !== 'ACTIVE') throw new Error('Coupon is not active');
        if (Number(coupon.usedCount || 0) >= Number(coupon.maxUses || 1)) throw new Error('Coupon usage limit exceeded');
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
            revision: Number(coupon.revision || 0) + 1
        }), request);
        return this.updateOrSave(SERVICE.DefaultCouponService, {
            tenant: request.tenant,
            authData: this.serviceAuthData(request),
            query: { tenant: request.tenant, code: coupon.code },
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
            query: { tenant: request.tenant, code: promotion.code },
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
            query: { tenant: request.tenant, code: redemption.couponCode },
            pageSize: 1
        });
        if (!coupon) return undefined;
        const usedCount = Math.max(0, Number(coupon.usedCount || 0) - 1);
        const model = this.withSchemaBase(Object.assign({}, coupon, {
            usedCount,
            status: coupon.status === 'REDEEMED' && usedCount < Number(coupon.maxUses || 1) ? 'ACTIVE' : coupon.status,
            revision: Number(coupon.revision || 0) + 1
        }), request);
        return this.updateOrSave(SERVICE.DefaultCouponService, {
            tenant: request.tenant,
            authData: this.serviceAuthData(request),
            query: { tenant: request.tenant, code: coupon.code },
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
            query: { tenant: request.tenant, code: redemption.promotionCode },
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
            query: { tenant: request.tenant, code: promotion.code },
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
            promotionCode: promotion.code,
            couponCode: coupon && coupon.code,
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
     * Executes `apply` as a loader-visible operation owned by this module.
     * @param {*} request Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    apply: async function (request) {
        const preview = await this.preview(request);
        const selected = preview.selected[0];
        if (!selected) {
            return Object.assign({}, preview, { applied: false, reasonCode: 'NO_ELIGIBLE_PROMOTION', decisions: [] });
        }
        const action = selected.actions || {};
        const coupon = await this.loadCoupon(request, selected);
        const decision = SERVICE.DefaultPromotionDecisionService.decide({
            tenant: request.tenant,
            promotionCode: selected.code,
            targetType: request.payload && request.payload.targetType || (request.payload && request.payload.cartCode ? 'CART' : 'CUSTOMER_CONTEXT'),
            targetCode: request.payload && request.payload.cartCode || request.ownerId,
            discountAmount: action.discountAmount || '0.00',
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
        const redemption = await this.getOne(SERVICE.DefaultPromotionRedemptionService, { tenant: request.tenant, authData: this.serviceAuthData(request), query: { tenant: request.tenant, code }, pageSize: 1 });
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
            query: { tenant: request.tenant, code },
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
