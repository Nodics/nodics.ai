/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteCore/src/utils/utils @description Provides shared Waste normalization helpers. @layer utility @owner wasteCore @override Later modules may extend helpers while preserving source reference semantics. */
module.exports = {
    /** Normalizes arbitrary input to a trimmed string. */
    normalizeString: function (value) {
        return value === undefined || value === null ? '' : String(value).trim();
    },

    /** Normalizes business codes to stable uppercase string form. */
    normalizeCode: function (value) {
        return this.normalizeString(value).toUpperCase();
    },

    /** Returns a shallow copy without request-only runtime fields. */
    persistenceModel: function (model) {
        let copy = Object.assign({}, model || {});
        ['tenant', 'enterpriseCode', 'authData', 'payload', 'httpRequest'].forEach(function (field) { delete copy[field]; });
        return copy;
    }
};
