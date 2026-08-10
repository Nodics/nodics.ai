/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module engagementCore/src/utils/utils
 * @description Provides bounded, side-effect-free Engagement Core value helpers shared by replaceable services.
 * @layer utility
 * @owner engagementCore
 * @override Later modules may override business services; shared sanitization invariants must not be weakened.
 */
module.exports = {
    /** Returns a non-empty trimmed string or an empty value. */
    normalizeString: function (value) {
        return value === undefined || value === null ? '' : String(value).trim();
    },
    /** Returns a bounded numeric confidence between zero and one. */
    normalizeConfidence: function (value) {
        let number = Number(value);
        return Number.isFinite(number) ? Math.max(0, Math.min(1, number)) : 0;
    },
    /** Produces a stable owner identity without storing an authentication payload. */
    resolvePrincipalId: function (request) {
        let auth = request && request.authData || {};
        return this.normalizeString(auth.principalId || auth.customerCode || auth.code || auth.loginId);
    },
    /** Produces an ISO timestamp through an injectable clock. */
    now: function (request) {
        let clock = request && request.clock;
        return (clock && clock.now ? clock.now() : new Date()).toISOString();
    }
};
