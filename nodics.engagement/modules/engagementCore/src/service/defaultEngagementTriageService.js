/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
const UTILS = require('../utils/utils');

/** @module engagementCore/src/service/defaultEngagementTriageService @description Normalizes classification, assignment, and SLA decisions without owning domain rules. @layer service @owner engagementCore @override Domain modules supply policy or adapter decisions. */
module.exports = {
    /** Handles classify within the module-owned contract. */
    classify: async function (submission, request, adapter) {
        let decision = adapter ? await adapter.classify(submission, request) : request;
        decision = decision || {};
        return { tenant: submission.tenant, submissionCode: submission.code, categoryCode: decision.categoryCode || 'UNCLASSIFIED', priorityCode: decision.priorityCode || 'NORMAL', source: decision.source || (adapter ? 'EXTERNAL' : 'RULE'), confidence: UTILS.normalizeConfidence(decision.confidence), policyCode: decision.policyCode, modelReference: decision.modelReference, explanation: decision.explanation, correlationId: request.correlationId || submission.correlationId };
    },
    /** Handles assign within the module-owned contract. */
    assign: function (submission, request) {
        request = request || {};
        if (!request.queueCode && !request.assigneeId) { let error = new Error('queueCode or assigneeId is required'); error.code = 'ERR_ENG_00006'; throw error; }
        return { tenant: submission.tenant, submissionCode: submission.code, queueCode: request.queueCode, assigneeId: request.assigneeId, status: 'ASSIGNED', assignedAt: UTILS.now(request), dueAt: request.dueAt, correlationId: request.correlationId || submission.correlationId };
    },
    /** Handles calculate due at within the module-owned contract. */
    calculateDueAt: function (request) {
        if (!Number.isFinite(Number(request.durationMinutes)) || Number(request.durationMinutes) <= 0) return null;
        let start = request.startAt ? new Date(request.startAt) : new Date();
        return new Date(start.getTime() + Number(request.durationMinutes) * 60000).toISOString();
    }
};
