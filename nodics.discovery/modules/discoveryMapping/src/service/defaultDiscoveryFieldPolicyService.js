/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module discoveryMapping/service/defaultDiscoveryFieldPolicyService @description Applies generic field allow/deny policy to Discovery documents. @layer service @owner discoveryMapping */
module.exports = {
    /** Returns true when a field is allowed by display policy and not sensitive. @param {Object} mapping Mapping record. @param {string} field Field path. @returns {boolean} Allow decision. */
    allowsDisplayField: function (mapping, field) {
        let sensitive = new Set((mapping && mapping.sensitiveFields) || []);
        let display = (mapping && mapping.displayFields) || [];
        return !sensitive.has(field) && (display.length === 0 || display.includes(field));
    },

    /** Filters a flat document by display and sensitive-field policy. @param {Object} mapping Mapping record. @param {Object} document Candidate document. @returns {Object} Filtered document. */
    filterDisplayDocument: function (mapping, document) {
        let result = {};
        Object.keys(document || {}).forEach(key => {
            if (this.allowsDisplayField(mapping, key)) result[key] = document[key];
        });
        return result;
    }
};
