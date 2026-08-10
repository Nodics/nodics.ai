/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';

/**
 * @module promotion/src/service/defaultPromotionSimulationService
 * @description Simulates deterministic promotion priority, exclusion, stacking, coupon, and budget eligibility without mutating redemption state.
 * @layer service
 * @owner promotion
 * @override Customer modules may extend condition evaluators while retaining non-mutating simulation and reason evidence.
 */
module.exports = {
    /** Evaluates configured conditions against a bounded commerce context. */
    eligible: function (promotion, context, now) {
        let conditions = promotion.conditions || {};
        let time = (now || new Date()).getTime();
        if (promotion.status !== 'ACTIVE') return 'INACTIVE';
        if (promotion.validFrom && new Date(promotion.validFrom).getTime() > time) return 'NOT_STARTED';
        if (promotion.validTo && new Date(promotion.validTo).getTime() <= time) return 'EXPIRED';
        if (conditions.minimumSubtotal !== undefined && Number(context.subtotal) < Number(conditions.minimumSubtotal)) return 'MINIMUM_SUBTOTAL';
        if (Array.isArray(conditions.customerGroups) && !conditions.customerGroups.includes(context.customerGroup)) return 'CUSTOMER_GROUP';
        if (Array.isArray(conditions.productCodes) && !(context.productCodes || []).some(code => conditions.productCodes.includes(code))) return 'PRODUCT';
        if (promotion.budget && Number(promotion.budget.spent || 0) >= Number(promotion.budget.limit || 0)) return 'BUDGET_EXHAUSTED';
        return 'ELIGIBLE';
    },

    /** Returns selected promotions and full explainability without redemption side effects. */
    simulate: function (request, promotions) {
        if (!request || !request.tenant) throw new Error('Tenant-scoped promotion simulation is required');
        let candidates = (promotions || []).filter(item => item.tenant === request.tenant).sort((left, right) => Number(right.priority || 0) - Number(left.priority || 0) || String(left.code).localeCompare(String(right.code)));
        let selected = [];
        let excludedGroups = new Set();
        let explanation = candidates.map(promotion => {
            let reason = this.eligible(promotion, request.context || {}, request.now);
            let exclusionGroup = promotion.actions && promotion.actions.exclusionGroup;
            if (reason === 'ELIGIBLE' && exclusionGroup && excludedGroups.has(exclusionGroup)) reason = 'EXCLUDED_BY_HIGHER_PRIORITY';
            if (reason === 'ELIGIBLE') {
                selected.push(promotion);
                if (exclusionGroup) excludedGroups.add(exclusionGroup);
                if (promotion.actions && promotion.actions.exclusive === true) excludedGroups.add('*');
            }
            return { promotionCode: promotion.code, eligible: reason === 'ELIGIBLE', reason: reason, priority: promotion.priority };
        });
        if (excludedGroups.has('*') && selected.length > 1) {
            let exclusive = selected.find(item => item.actions && item.actions.exclusive === true);
            selected = exclusive ? [exclusive] : selected;
            explanation.forEach(item => { if (exclusive && item.promotionCode !== exclusive.code && item.eligible) { item.eligible = false; item.reason = 'EXCLUDED_BY_EXCLUSIVE_PROMOTION'; } });
        }
        return { mode: 'SIMULATION', mutationPerformed: false, selected: selected, explanation: explanation };
    }
};
