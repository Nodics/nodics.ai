/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module customerFeedback/src/service/defaultCustomerFeedbackGovernanceService @description Validates feedback intake and stable domain errors. @layer service @owner customerFeedback @override Later policy may become stricter while preserving anonymous policy, traceability, and manual correction. */
module.exports = {
    /** Creates one stable feedback error. */ error: function (code, message) { let error = new Error(message); error.code = code; return error; },
    /** Validates and normalizes one feedback submission. */ validate: function (input, policy) { policy = policy || {}; let value = Object.assign({}, input); if (!(policy.types || []).includes(value.type)) throw this.error('ERR_FEEDBACK_00002', 'unsupported feedback type'); if (!String(value.message || '').trim() && !value.structuredAnswers) throw this.error('ERR_FEEDBACK_00002', 'feedback message or structured answers are required'); if (value.anonymous === true && policy.anonymousAllowed !== true) throw this.error('ERR_FEEDBACK_00003', 'anonymous feedback is disabled'); if ((value.attachmentCodes || []).length > Number(policy.maximumAttachments || 5)) throw this.error('ERR_FEEDBACK_00002', 'feedback attachment limit exceeded'); value.message = value.message ? String(value.message).trim() : undefined; value.status = 'RECEIVED'; value.priority = value.priority || policy.defaultPriority || 'NORMAL'; value.revision = 0; value.submittedAt = value.submittedAt || new Date(); return value; }
};
