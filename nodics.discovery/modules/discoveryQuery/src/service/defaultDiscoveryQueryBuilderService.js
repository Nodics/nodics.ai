/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module discoveryQuery/service/defaultDiscoveryQueryBuilderService @description Builds provider-neutral Discovery query and options from request/profile input. @layer service @owner discoveryQuery */
module.exports = {
    /** Returns bounded integer value. @param {*} value Candidate. @param {number} fallback Fallback. @param {number} minimum Minimum. @param {number} maximum Maximum. @returns {number} Bounded integer. */
    boundedInteger: function (value, fallback, minimum, maximum) {
        let next = Number(value || fallback);
        if (!Number.isInteger(next) || next < minimum) return fallback;
        return Math.min(next, maximum);
    },

    /** Builds search options from query profile. @param {Object} request Request. @param {Object} profile Query profile. @returns {Object} Search options. */
    options: function (request, profile) {
        let defaults = ((CONFIG.get('discovery') || {}).query) || {};
        let input = request.query || {};
        let maximum = Number((profile && profile.pageSizeLimit) || defaults.maximumPageSize || 100);
        return {
            pageSize: this.boundedInteger(input.pageSize || input.limit, Number(defaults.defaultPageSize || 24), 1, maximum),
            pageNumber: this.boundedInteger(input.page, 1, 1, 10000),
            sort: this.sort(input.sort, profile)
        };
    },

    /** Resolves an allowed sort instruction. @param {string} requested Requested sort code. @param {Object} profile Query profile. @returns {Object|undefined} Sort. */
    sort: function (requested, profile) {
        let sorts = (profile && profile.sorts) || [];
        let selected = sorts.find(item => item.code === requested);
        return selected && selected.sort;
    },

    /** Builds a provider-neutral query. @param {Object} request Request. @param {Object} base Base query. @returns {Object} Query. */
    query: function (request, base) {
        let input = request.query || {};
        let query = Object.assign({}, base || {});
        if (input.q) query.text = String(input.q).trim();
        return query;
    }
};
