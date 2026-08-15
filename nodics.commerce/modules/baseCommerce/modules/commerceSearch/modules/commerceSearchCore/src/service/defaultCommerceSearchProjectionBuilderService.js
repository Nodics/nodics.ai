/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const crypto = require('node:crypto');

/** @module commerceSearchCore/service/defaultCommerceSearchProjectionBuilderService @description Builds deterministic published Commerce Search rule projections. @layer service @owner commerceSearchCore */
module.exports = {
    /**
     * Initializes the Commerce Search projection builder.
     *
     * @returns {Promise<boolean>} Resolves when initialization completes.
     */
    init: function () { return Promise.resolve(true); },
    /**
     * Runs post-initialization for the projection builder.
     *
     * @returns {Promise<boolean>} Resolves when post-initialization completes.
     */
    postInit: function () { return Promise.resolve(true); },

    /**
     * Copies the persisted rule action into the published projection shape.
     *
     * @param {Object} action Rule action.
     * @returns {Object} Projection action.
     */
    action: function (action) {
        return {
            actionType: action.actionType,
            productCode: action.productCode,
            position: action.position,
            weight: action.weight,
            priority: action.priority
        };
    },

    /**
     * Builds a deterministic published rule projection for a staged rule.
     *
     * @param {Object} request Publication request.
     * @param {Object} rule Staged rule.
     * @returns {Object} Published projection.
     */
    build: function (request, rule) {
        if (!request || !request.tenant || !rule || rule.tenant !== request.tenant || !rule.storeCode) {
            throw new Error('Tenant-scoped Commerce Search rule and Store are required');
        }
        let projectedAt = request.now ? new Date(request.now) : new Date();
        let source = {
            tenant: rule.tenant,
            code: rule.code,
            storeCode: rule.storeCode,
            locale: rule.locale,
            scopeType: rule.scopeType,
            categoryCode: rule.categoryCode,
            searchTerm: rule.searchTerm,
            actions: (rule.actions || []).map(this.action),
            priority: rule.priority || 0,
            revision: rule.revision
        };
        return Object.assign({}, source, {
            code: [rule.code, rule.storeCode, rule.locale || 'all'].join('|'),
            active: true,
            created: projectedAt,
            updated: projectedAt,
            status: 'CURRENT',
            projectedAt: projectedAt,
            sourceHash: crypto.createHash('sha256').update(JSON.stringify(source)).digest('hex')
        });
    }
};
