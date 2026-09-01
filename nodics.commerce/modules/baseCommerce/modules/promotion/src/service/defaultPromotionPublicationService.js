/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module promotion/src/service/defaultPromotionPublicationService @description Restores Promotion operational records into Online runtime boundaries. @layer service @owner promotion */
module.exports = {
    records: value => Array.isArray(value) ? value : value && typeof value === 'object' ? Object.values(value) : [],
    normalizeDateField: function (model, field) {
        if (!Object.prototype.hasOwnProperty.call(model, field) || model[field] instanceof Date) return;
        if (model[field] === undefined || model[field] === null || model[field] === '') {
            delete model[field];
            return;
        }
        model[field] = new Date(model[field]);
        if (Number.isNaN(model[field].getTime())) delete model[field];
    },
    persistenceModel: function (record, request) {
        const now = new Date();
        const auth = request && request.authData || {};
        const enterpriseCode = record.enterpriseCode || request && (request.enterpriseCode || request.entCode) || auth.enterpriseCode || auth.entCode;
        const model = Object.assign({}, record, {
            enterpriseCode: enterpriseCode,
            active: record.active !== undefined ? record.active : true,
            created: record.created instanceof Date ? record.created : now,
            updated: now
        });
        ['validFrom', 'validTo', 'reservedAt', 'reservedUntil', 'soldAt', 'deliveredAt', 'claimedAt', 'redeemedAt', 'revokedAt'].forEach(field => this.normalizeDateField(model, field));
        return model;
    },
    saveAll: async function (service, request, records, label) {
        const restored = [];
        for (const record of records) {
            if (!record || record.tenant !== request.tenant || !record.code) throw new Error(label + ' restoration record escaped its tenant boundary');
            const requestEnterpriseCode = request.enterpriseCode || request.entCode || request.authData && (request.authData.enterpriseCode || request.authData.entCode);
            if (record.enterpriseCode && requestEnterpriseCode && record.enterpriseCode !== requestEnterpriseCode) throw new Error(label + ' restoration record escaped its enterprise boundary');
            const model = this.persistenceModel(record, request);
            await service.save({ tenant: request.tenant, authData: request.authData, model }).then(response => response && Object.prototype.hasOwnProperty.call(response, 'result') ? response.result : response);
            restored.push(model.code);
        }
        return restored;
    },
    restoreOperational: async function (request, input) {
        const promotions = this.records(input.promotions);
        const couponBatches = this.records(input.couponBatches);
        const coupons = this.records(input.coupons);
        if (promotions.length === 0) throw new Error('Promotions are required for Promotion restoration');
        const restoredPromotions = await this.saveAll(SERVICE.DefaultPromotionService, request, promotions, 'Promotion');
        const restoredBatches = couponBatches.length ? await this.saveAll(SERVICE.DefaultCouponBatchService, request, couponBatches, 'Coupon batch') : [];
        const restoredCoupons = coupons.length ? await this.saveAll(SERVICE.DefaultCouponService, request, coupons, 'Coupon') : [];
        return {
            tenant: request.tenant,
            enterpriseCode: request.enterpriseCode || request.entCode || request.authData && (request.authData.enterpriseCode || request.authData.entCode),
            restored: restoredPromotions.length + restoredBatches.length + restoredCoupons.length,
            promotions: restoredPromotions,
            couponBatches: restoredBatches,
            coupons: restoredCoupons
        };
    }
};
