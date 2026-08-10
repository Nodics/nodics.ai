/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module customerFeedback/src/service/defaultCustomerFeedbackInsightService @description Creates advisory traceable insights with correction and deletion propagation. @layer service @owner customerFeedback @override Rules or AI adapters may propose values but cannot remove source traceability or human control. */
module.exports = {
    /** Creates one source-traceable advisory insight. */ derive: function (sourceFeedback, command, policy) { if (!sourceFeedback || sourceFeedback.length === 0) throw new Error('insight requires source feedback'); let confidence = Number(command.confidence || 0); return { tenant: command.tenant, insightType: command.insightType, sourceFeedbackCodes: sourceFeedback.map(item => item.code), value: command.value, confidence: confidence, source: command.source || 'RULE', policyVersion: (policy || {}).policyVersion || '1', modelReference: command.modelReference, promptVersion: command.promptVersion, status: confidence >= Number((policy || {}).minimumConfidence || 0.6) ? 'PROPOSED' : 'REJECTED', generatedAt: command.now || new Date(), correlationId: command.correlationId }; },
    /** Applies an auditable human correction. */ correct: function (insight, command) { return Object.assign({}, insight, { value: command.value, status: 'CORRECTED', correctedBy: command.actorId, correctionReason: command.reason }); },
    /** Marks every insight referencing deleted source evidence as deleted. */ propagateDeletion: function (feedbackCode, insights, now) { return (insights || []).filter(item => (item.sourceFeedbackCodes || []).includes(feedbackCode)).map(item => Object.assign({}, item, { status: 'DELETED', deletedAt: now || new Date() })); },
    /** Returns deterministic fallback capability when AI is unavailable. */ availability: function (adapter) { return { aiAvailable: Boolean(adapter), deterministicFallback: true, directActionAllowed: false }; }
};
