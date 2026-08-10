/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
const crypto = require('crypto');
/** @module customerReview/src/service/defaultCustomerReviewGovernanceService @description Validates review content, ratings, target policy, authenticity disclosures, and integrity constraints. @layer service @owner customerReview @override Later policy may be stricter but cannot permit sentiment-conditioned incentives or sentiment-only suppression. */
module.exports = {
    /** Creates one stable review-domain error. */
    error: function (code, message) { let error = new Error(message); error.code = code; return error; },
    /** Returns effective review policy. */
    configuration: function () { return typeof CONFIG !== 'undefined' && CONFIG.get('customerReview') || {}; },
    /** Validates and normalizes customer review input. */
    validate: function (input, configuration) { configuration = configuration || this.configuration(); let policy = configuration.review || {}; let review = Object.assign({}, input); if (!(policy.targetTypes || []).includes(review.targetType)) throw this.error('ERR_REVIEW_00002', 'unsupported review target'); let rating = Number(review.overallRating); let hasRating = review.overallRating !== undefined && review.overallRating !== null; let hasText = Boolean(String(review.body || '').trim()); if (!hasRating && !hasText) throw this.error('ERR_REVIEW_00002', 'rating or review text is required'); if (hasRating && (!Number.isFinite(rating) || rating < Number(policy.ratingMinimum || 1) || rating > Number(policy.ratingMaximum || 5))) throw this.error('ERR_REVIEW_00002', 'rating is outside policy bounds'); review.body = hasText ? String(review.body).trim() : undefined; review.title = review.title ? String(review.title).trim() : undefined; review.status = review.status || 'DRAFT'; review.moderationMode = review.moderationMode || (configuration.moderation || {}).mode || 'PRE'; review.revision = Number(review.revision || 0); return review; },
    /** Validates authenticity evidence and prohibited incentive conditions. */
    validateAuthenticity: function (evidence) { if (!evidence || !evidence.provenance || !evidence.policyVersion) throw this.error('ERR_REVIEW_00003', 'authenticity provenance and policy are required'); if (evidence.sentimentConditioned === true) throw this.error('ERR_REVIEW_00004', 'sentiment-conditioned review incentives are prohibited'); if (evidence.incentiveType && !evidence.samplingDisclosure && !evidence.materialRelationship) throw this.error('ERR_REVIEW_00003', 'incentive disclosure is required'); return evidence; },
    /** Calculates a deterministic content hash for immutable versions and migration replay. */
    hash: function (value) { return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex'); },
    /** Rejects moderation decisions based only on unfavorable sentiment. */
    assertModerationGrounds: function (command) { if (['REJECT', 'HIDE', 'MARK_SPAM', 'QUARANTINE'].includes(command.action) && command.policyViolation !== true && !command.reasonCode) throw this.error('ERR_REVIEW_00005', 'restrictive moderation requires a policy reason'); if (String(command.reasonCode || '').toUpperCase() === 'NEGATIVE_SENTIMENT') throw this.error('ERR_REVIEW_00005', 'negative sentiment alone cannot restrict a review'); return true; }
};
