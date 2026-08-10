/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
const UTILS = require('../utils/utils');

/** @module engagementCore/src/service/defaultEngagementProtectionService @description Sanitizes bounded evidence and applies an optional risk adapter. @layer service @owner engagementCore @override Later modules may strengthen protection; denied secret keys must remain fail-closed. */
module.exports = {
    /** Handles sanitize within the module-owned contract. */
    sanitize: function (value, configuration, depth) {
        configuration = configuration || {};
        depth = depth || 0;
        if (depth > (configuration.maximumEvidenceDepth || 8)) return '[TRUNCATED]';
        if (Array.isArray(value)) return value.slice(0, configuration.maximumCollectionItems || 100).map(item => this.sanitize(item, configuration, depth + 1));
        if (value && typeof value === 'object') {
            return Object.keys(value).reduce((output, key) => {
                let denied = (configuration.deniedEvidenceKeys || []).some(item => key.toLowerCase().includes(item));
                output[key] = denied ? '[REDACTED]' : this.sanitize(value[key], configuration, depth + 1);
                return output;
            }, {});
        }
        return typeof value === 'string' ? value.trim() : value;
    },
    /** Handles protect within the module-owned contract. */
    protect: async function (request, configuration, riskAdapter) {
        let protectedRequest = Object.assign({}, request, { payload: this.sanitize(request.payload || {}, configuration) });
        let risk = riskAdapter ? await riskAdapter.evaluate(protectedRequest) : { decision: 'ALLOW', provider: 'NONE' };
        if (!risk || ['DENY', 'REJECT', 'BLOCK'].includes(UTILS.normalizeString(risk.decision).toUpperCase())) {
            let error = new Error('protection policy rejected request'); error.code = 'ERR_ENG_00009'; throw error;
        }
        return { request: protectedRequest, risk: this.sanitize(risk, configuration) };
    }
};
