/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module customerReview/src/service/defaultCustomerReviewLifecycleService @description Applies optimistic review, moderation, response, abuse, and appeal transitions with immutable evidence. @layer service @owner customerReview @override Later modules may extend configured transitions without weakening integrity rules. */
module.exports = {
    /** Returns the active governance service. */
    governance: function () { return SERVICE.DefaultCustomerReviewGovernanceService; },
    /** Creates an immutable review version. */
    version: function (review, previousVersions, reason, now) { let version = Math.max(0, ...(previousVersions || []).map(item => Number(item.version || 0))) + 1; let content = { title: review.title, body: review.body, overallRating: review.overallRating, dimensionRatings: review.dimensionRatings, mediaCodes: review.mediaCodes || [] }; return Object.assign({ tenant: review.tenant, reviewCode: review.code, version: version, changeReason: reason, status: 'CURRENT', correlationId: review.correlationId, createdAt: now || new Date(), contentHash: this.governance().hash(content) }, content); },
    /** Applies one governed review transition and returns its moderation evidence. */
    moderate: function (review, command, configuration) { if (Number(command.expectedRevision) !== Number(review.revision || 0)) throw this.governance().error('ERR_REVIEW_00006', 'review revision conflict'); this.governance().assertModerationGrounds(command); let transitions = (configuration.moderation || {}).transitions || {}; let target = ((transitions[review.status] || {})[command.action]); if (!target) throw this.governance().error('ERR_REVIEW_00007', 'invalid review transition'); let now = command.now || new Date(); let changed = Object.assign({}, review, { status: target, revision: Number(review.revision || 0) + 1 }); if (target === 'SUBMITTED' || target === 'PENDING_MODERATION') changed.submittedAt = now; if (target === 'WITHDRAWN') changed.withdrawnAt = now; return { review: changed, moderation: { tenant: review.tenant, reviewCode: review.code, reviewVersion: command.reviewVersion || 1, action: command.action, fromStatus: review.status, toStatus: target, reasonCode: command.reasonCode, policyViolation: command.policyViolation === true, sentiment: command.sentiment, internalNotes: command.internalNotes, customerReason: command.customerReason, escalationType: command.escalationType, actorId: command.actorId, evidence: command.evidence, correlationId: command.correlationId || review.correlationId, occurredAt: now } }; },
    /** Creates the next business-response version. */
    response: function (review, previous, command) { if (!['APPROVED', 'HIDDEN'].includes(review.status)) throw this.governance().error('ERR_REVIEW_00008', 'response requires a moderated review'); return { tenant: review.tenant, reviewCode: review.code, version: Math.max(0, ...(previous || []).map(item => Number(item.version || 0))) + 1, body: String(command.body || '').trim(), authorId: command.actorId, teamCode: command.teamCode, status: command.requireApproval === false ? 'APPROVED' : 'PENDING_APPROVAL', correlationId: command.correlationId || review.correlationId }; },
    /** Opens one duplicate-safe abuse report. */
    abuseReport: function (review, existing, command) { if ((existing || []).some(item => item.reporterId === command.reporterId && item.reasonCode === command.reasonCode && ['OPEN', 'UNDER_INVESTIGATION'].includes(item.status))) throw this.governance().error('ERR_REVIEW_00009', 'duplicate abuse report'); return { tenant: review.tenant, reviewCode: review.code, reporterId: command.reporterId, reasonCode: command.reasonCode, comment: command.comment, evidence: command.evidence, status: 'OPEN', correlationId: command.correlationId || review.correlationId }; },
    /** Resolves an abuse report without deleting review evidence. */
    resolveAbuse: function (report, command) { if (!['OPEN', 'UNDER_INVESTIGATION'].includes(report.status)) throw this.governance().error('ERR_REVIEW_00007', 'abuse report is terminal'); return Object.assign({}, report, { status: command.actioned ? 'ACTIONED' : 'DISMISSED', resolutionCode: command.resolutionCode, resolvedBy: command.actorId, resolvedAt: command.now || new Date() }); },
    /** Decides an appeal and records whether moderation is upheld or overturned. */
    decideAppeal: function (appeal, command) { if (!['OPEN', 'UNDER_REVIEW'].includes(appeal.status)) throw this.governance().error('ERR_REVIEW_00007', 'appeal is terminal'); return Object.assign({}, appeal, { status: command.overturn ? 'OVERTURNED' : 'UPHELD', decisionReason: command.reason, decidedBy: command.actorId, decidedAt: command.now || new Date() }); }
};
