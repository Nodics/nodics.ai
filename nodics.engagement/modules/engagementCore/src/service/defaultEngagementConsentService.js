/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
const UTILS = require('../utils/utils');

/** @module engagementCore/src/service/defaultEngagementConsentService @description Captures purpose-bound consent evidence and withdrawal records. @layer service @owner engagementCore @override Later modules may add jurisdiction rules while retaining policy version and evidence. */
module.exports = {
    /** Handles record within the module-owned contract. */
    record: function (request) {
        request = request || {};
        if (!UTILS.normalizeString(request.tenant) || !UTILS.normalizeString(request.purposeCode) || !UTILS.normalizeString(request.policyVersion) || !request.evidence) {
            let error = new Error('consent evidence is incomplete'); error.code = 'ERR_ENG_00008'; throw error;
        }
        return Object.assign({}, request, { status: request.status || 'GRANTED', recordedAt: UTILS.now(request), ownerId: request.ownerId || UTILS.resolvePrincipalId(request) });
    },
    /** Handles withdraw within the module-owned contract. */
    withdraw: function (consent, command) {
        return Object.assign({}, consent, { status: 'WITHDRAWN', withdrawnAt: UTILS.now(command || {}), withdrawalReason: command && command.reason });
    }
};
