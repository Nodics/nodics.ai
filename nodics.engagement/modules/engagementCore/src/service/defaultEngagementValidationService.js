/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const ENUMS = require('../utils/enums');
const UTILS = require('../utils/utils');

/** @module engagementCore/src/service/defaultEngagementValidationService @description Validates provider-neutral intake invariants. @layer service @owner engagementCore @override Later modules may add stricter validation but may not remove tenant, correlation, idempotency, or retention checks. */
module.exports = {
    /** Handles fail within the module-owned contract. */
    fail: function (code, message) {
        let error = typeof CLASSES !== 'undefined' && CLASSES.NodicsError ? new CLASSES.NodicsError(code, message) : new Error(message);
        error.code = code;
        throw error;
    },
    /** Handles validate within the module-owned contract. */
    validate: function (request, configuration) {
        request = request || {};
        configuration = configuration || {};
        let validation = configuration.validation || {};
        let tenant = UTILS.normalizeString(request.tenant);
        let correlationId = UTILS.normalizeString(request.correlationId);
        let idempotencyKey = UTILS.normalizeString(request.idempotencyKey);
        let channel = UTILS.normalizeString(request.channel).toUpperCase();
        if (!tenant) this.fail('ERR_ENG_00001', 'tenant is required');
        if (!correlationId) this.fail('ERR_ENG_00002', 'correlationId is required');
        if (!idempotencyKey) this.fail('ERR_ENG_00006', 'idempotencyKey is required');
        if (!UTILS.normalizeString(request.submissionType)) this.fail('ERR_ENG_00006', 'submissionType is required');
        if (!UTILS.normalizeString(request.retentionPolicyCode) && configuration.retention && configuration.retention.requireConfiguredPolicy) {
            this.fail('ERR_ENG_00011', 'retentionPolicyCode is required');
        }
        if (channel && (validation.allowedChannels || ENUMS.EngagementChannel.definition).indexOf(channel) < 0) this.fail('ERR_ENG_00006', 'channel is not allowed');
        let payloadBytes = Buffer.byteLength(JSON.stringify(request.payload || {}), 'utf8');
        if (payloadBytes > (validation.maximumPayloadBytes || 65536)) this.fail('ERR_ENG_00006', 'payload exceeds configured maximum');
        return Object.assign({}, request, { tenant: tenant, correlationId: correlationId, idempotencyKey: idempotencyKey, channel: channel || 'API' });
    },
    /** Handles assert replay within the module-owned contract. */
    assertReplay: function (existing, requestHash) {
        if (existing && existing.requestHash !== requestHash) this.fail('ERR_ENG_00003', 'idempotency key was reused with different content');
        return existing;
    }
};
