/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module customerReview/src/service/defaultCustomerReviewPublicExperienceService @description Reconciles public review projections and target aggregates after lifecycle changes. @layer service @owner customerReview @override Later modules may replace persistence, cache, or search adapters while preserving source-led rebuild semantics. */
module.exports = {
    /** Returns the public aggregate scope for one review. */
    scope: function (review) { return { tenant: review.tenant, targetType: review.targetType, targetCode: review.targetCode, variantCode: review.variantCode, site: review.site, locale: review.locale }; },
    /** Reconciles the public projection for one authoritative review state. */
    projection: async function (review, options) { options = options || {}; let repository = SERVICE.DefaultCustomerReviewRepositoryService; let existing = await repository.list('customerReviewProjection', review.tenant, { reviewCode: review.code }, undefined, 1); let current = existing[0]; if (review.status !== 'APPROVED') { if (!current || current.status !== 'PUBLISHED') return current; return repository.save('customerReviewProjection', review.tenant, Object.assign(SERVICE.DefaultCustomerReviewProjectionService.hide(current, review.status === 'WITHDRAWN' ? 'WITHDRAWN' : 'HIDDEN', options.now), { code: current.code })); } let versions = await repository.list('customerReviewVersion', review.tenant, { reviewCode: review.code, status: 'CURRENT' }, undefined, 1); if (!versions[0]) throw SERVICE.DefaultCustomerReviewGovernanceService.error('ERR_REVIEW_00014', 'current review version is unavailable'); let authenticity = await repository.list('customerReviewAuthenticityEvidence', review.tenant, { reviewCode: review.code }, undefined, 1); let responses = await repository.list('customerReviewResponse', review.tenant, { reviewCode: review.code, status: 'PUBLISHED' }, undefined, 1); let policy = (CONFIG.get('customerReview') || {}).publicExperience || {}; let projection = SERVICE.DefaultCustomerReviewProjectionService.publish(review, versions[0], authenticity[0], responses[0], Object.assign({}, policy, options)); if (current) projection.code = current.code; return repository.save('customerReviewProjection', review.tenant, projection); },
    /** Rebuilds one aggregate and persists only source-derived evidence. */
    aggregate: async function (review, options) { options = options || {}; let repository = SERVICE.DefaultCustomerReviewRepositoryService; let scope = this.scope(review); let projections = await repository.list('customerReviewProjection', review.tenant, { targetType: review.targetType, targetCode: review.targetCode, site: review.site }, undefined, 100); let existing = await repository.list('customerReviewAggregate', review.tenant, Object.assign({}, scope, { status: 'CURRENT' }), undefined, 1); let policy = (CONFIG.get('customerReview') || {}).publicExperience || {}; let aggregate = SERVICE.DefaultCustomerReviewAggregateService.rebuild(scope, projections, { policyVersion: policy.aggregatePolicyVersion, calculationVersion: policy.calculationVersion, correlationId: review.correlationId, now: options.now }); if (existing[0]) aggregate.code = existing[0].code; return repository.save('customerReviewAggregate', review.tenant, aggregate); },
    /** Runs retry-safe projection, aggregate, cache, and search reconciliation. */
    reconcile: async function (review, options) { let projection = await this.projection(review, options); let aggregate = await this.aggregate(review, options); let invalidation = { cache: 'customerReview:' + review.tenant + ':' + review.targetType + ':' + review.targetCode, search: projection && projection.code, sourceHash: aggregate.sourceHash }; return { projection: projection, aggregate: aggregate, invalidation: invalidation }; }
};
