/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module rulesEvaluation/src/service/defaultRulePropertyResolutionService
 * @description Resolves consumer-owned properties and bounded fallback candidates before generic condition evaluation.
 * @layer service
 * @owner rulesEvaluation
 */
module.exports = {
    available: function (resolved) {
        return Boolean(resolved && resolved.available !== false && resolved.value !== undefined && resolved.value !== null && resolved.value !== '');
    },

    resolvePrimary: async function (provider, condition, context) {
        let result = await provider.resolveProperty({
            propertyCode: condition.propertyCode,
            condition: condition,
            context: context
        });
        return Object.assign({
            available: this.available(result),
            propertyCode: condition.propertyCode,
            fallbackUsed: false
        }, result || {});
    },

    resolveFallback: async function (provider, condition, context, previous) {
        if (typeof provider.resolveFallback !== 'function') return previous;
        let result = await provider.resolveFallback({
            propertyCode: condition.propertyCode,
            condition: condition,
            context: context,
            previous: previous
        });
        if (!result) return previous;
        return Object.assign({
            available: this.available(result),
            propertyCode: condition.propertyCode,
            fallbackUsed: true
        }, result);
    },

    resolve: async function (provider, condition, context, qualityService) {
        let resolved = await this.resolvePrimary(provider, condition, context);
        let usable = this.available(resolved) && qualityService.meets(resolved, condition);
        if (usable || condition.missingValueBehavior !== 'FALLBACK_ALLOWED') {
            return Object.assign({}, resolved, { usable: usable });
        }
        let fallback = await this.resolveFallback(provider, condition, context, resolved);
        return Object.assign({}, fallback, {
            usable: this.available(fallback) && qualityService.meets(fallback, condition)
        });
    }
};
