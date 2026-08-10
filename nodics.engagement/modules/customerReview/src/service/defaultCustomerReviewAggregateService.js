/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
const crypto = require('crypto');
/** @module customerReview/src/service/defaultCustomerReviewAggregateService @description Builds deterministic, rebuildable rating aggregates from published review projections. @layer service @owner customerReview @override Later modules may replace grouping or storage while preserving published-only inclusion and drift evidence. */
module.exports = {
    /** Returns whether a projection contributes to public rating evidence. */
    included: function (projection) { return projection && projection.status === 'PUBLISHED' && Number.isFinite(Number(projection.overallRating)); },
    /** Produces a stable source hash for drift and retry detection. */
    sourceHash: function (projections) { let evidence = (projections || []).filter(this.included).map(item => [item.reviewCode, item.reviewVersion, Number(item.overallRating), item.sourceHash]).sort((a, b) => String(a[0]).localeCompare(String(b[0]))); return crypto.createHash('sha256').update(JSON.stringify(evidence)).digest('hex'); },
    /** Rebuilds one aggregate from its published source projections. */
    rebuild: function (scope, projections, options) { options = options || {}; let included = (projections || []).filter(this.included); let distribution = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }; let dimensions = {}; let sum = 0; let verifiedCount = 0; included.forEach(item => { let rating = Number(item.overallRating); sum += rating; distribution[String(rating)] = Number(distribution[String(rating)] || 0) + 1; if (item.authenticity && item.authenticity.verified === true) verifiedCount += 1; Object.keys(item.dimensionRatings || {}).forEach(code => { let bucket = dimensions[code] || { count: 0, sum: 0, average: 0 }; bucket.count += 1; bucket.sum += Number(item.dimensionRatings[code]); bucket.average = Number((bucket.sum / bucket.count).toFixed(4)); dimensions[code] = bucket; }); }); let count = included.length; return Object.assign({}, scope, { count: count, sum: sum, average: count ? Number((sum / count).toFixed(4)) : 0, distribution: distribution, dimensions: dimensions, verifiedCount: verifiedCount, unverifiedCount: count - verifiedCount, policyVersion: options.policyVersion || '1', calculationVersion: options.calculationVersion || '1', sourceHash: this.sourceHash(included), calculatedAt: options.now || new Date(), status: 'CURRENT', correlationId: options.correlationId }); },
    /** Compares stored aggregate evidence with a deterministic rebuild. */
    reconcile: function (stored, scope, projections, options) { let rebuilt = this.rebuild(scope, projections, options); let drifted = !stored || stored.sourceHash !== rebuilt.sourceHash || Number(stored.count) !== rebuilt.count || Number(stored.sum) !== rebuilt.sum; return { drifted: drifted, previous: stored, aggregate: rebuilt, action: drifted ? 'REPLACE' : 'NONE' }; },
    /** Applies a retry-safe projection replacement by rebuilding from source authority. */
    update: function (stored, scope, projections, options) { return this.reconcile(stored, scope, projections, options).aggregate; }
};
