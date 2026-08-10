/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
const UTILS = require('../utils/utils');

/** @module engagementCore/src/service/defaultEngagementIntegrationService @description Creates provider-neutral Process, publication, and external reconciliation references. @layer service @owner engagementCore @override Provider adapters may be replaced; external systems retain their own lifecycle authority. */
module.exports = {
    /** Handles start process within the module-owned contract. */
    startProcess: async function (submission, request, adapter) {
        if (!adapter) return { status: 'PENDING', deferred: true, reasonCode: 'ENG_DEFERRED', submissionCode: submission.code };
        let result = await adapter.start({ tenant: submission.tenant, submissionCode: submission.code, processDefinitionCode: request.processDefinitionCode, correlationId: request.correlationId || submission.correlationId });
        return { tenant: submission.tenant, submissionCode: submission.code, provider: result.provider, externalReference: result.processInstanceCode, status: result.status || 'IN_PROGRESS', authorityMode: 'EXTERNAL_CASE', correlationId: request.correlationId || submission.correlationId };
    },
    /** Handles evaluate publication within the module-owned contract. */
    evaluatePublication: async function (submission, request, adapter) {
        let eligibility = request.eligible ? 'ELIGIBLE' : 'INELIGIBLE';
        let reference = { tenant: submission.tenant, submissionCode: submission.code, eligibility: eligibility, policyCode: request.policyCode, evaluatedAt: UTILS.now(request), correlationId: request.correlationId || submission.correlationId };
        if (eligibility === 'ELIGIBLE' && adapter) reference.publishReference = await adapter.requestPublication(reference);
        return reference;
    },
    /** Handles reconcile within the module-owned contract. */
    reconcile: function (reference, result) {
        let attempts = Number(reference.attempts || 0) + 1;
        return Object.assign({}, reference, { attempts: attempts, status: result.success ? 'RECONCILED' : (attempts >= Number(result.maximumAttempts || 3) ? 'DEAD_LETTER' : 'RETRY_PENDING'), lastErrorCode: result.errorCode, reconciledAt: result.success ? UTILS.now(result) : undefined });
    }
};
