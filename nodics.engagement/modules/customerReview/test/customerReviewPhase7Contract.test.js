/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
const assert = require('assert');
const schemas = require('../src/schemas/schemas').customerReview;
const aggregateService = require('../src/service/defaultCustomerReviewAggregateService');
const projectionService = require('../src/service/defaultCustomerReviewProjectionService');

['customerReviewProjection', 'customerReviewAggregate', 'customerReviewHelpfulness'].forEach(name => {
    assert(schemas[name], name + ' schema must exist');
    assert.strictEqual(schemas[name].router.enabled, false);
});

const review = { code: 'r1', tenant: 't1', ownerId: 'private-customer', targetType: 'PRODUCT', targetCode: 'p1', variantCode: 'blue', recommendation: true, site: 'main', locale: 'en', channel: 'WEB', status: 'APPROVED', correlationId: 'corr-1' };
const version = { version: 2, title: 'Useful', body: 'Works well.', overallRating: 4, dimensionRatings: { quality: 5 }, contentHash: 'hash-1' };
const projection = projectionService.publish(review, version, { verificationStatus: 'VERIFIED', interactionType: 'PURCHASE', incentiveType: 'SAMPLE' }, { status: 'PUBLISHED', body: 'Thank you', publishedAt: new Date('2026-08-10T00:00:00Z') }, { now: new Date('2026-08-10T01:00:00Z'), media: [{ code: 'm1', alt: 'Blue product', type: 'IMAGE', unsafe: 'never public' }], maximumGalleryItems: 1 });
assert.strictEqual(projection.status, 'PUBLISHED');
assert.strictEqual(projection.authenticity.verified, true);
assert.strictEqual(projection.ownerId, undefined);
assert.strictEqual(projection.media[0].unsafe, undefined);
assert.throws(() => projectionService.publish(Object.assign({}, review, { status: 'HIDDEN' }), version), error => error.code === 'ERR_REVIEW_00013');

const low = Object.assign({}, projection, { reviewCode: 'r2', overallRating: 2, dimensionRatings: { quality: 2 }, authenticity: { verified: false }, helpfulCount: 8, publishedAt: new Date('2026-08-09T01:00:00Z'), sourceHash: 'hash-2' });
const hidden = Object.assign({}, projection, { reviewCode: 'r3', overallRating: 1, status: 'HIDDEN', sourceHash: 'hash-3' });
const scope = { tenant: 't1', targetType: 'PRODUCT', targetCode: 'p1', variantCode: 'blue', site: 'main', locale: 'en' };
const aggregate = aggregateService.rebuild(scope, [projection, low, hidden], { now: new Date('2026-08-10T02:00:00Z'), correlationId: 'corr-2' });
assert.strictEqual(aggregate.count, 2);
assert.strictEqual(aggregate.sum, 6);
assert.strictEqual(aggregate.average, 3);
assert.strictEqual(aggregate.distribution['1'], 0);
assert.strictEqual(aggregate.distribution['2'], 1);
assert.strictEqual(aggregate.verifiedCount, 1);
assert.deepStrictEqual(aggregateService.reconcile(aggregate, scope, [projection, low, hidden], { correlationId: 'corr-3' }).action, 'NONE');
assert.strictEqual(aggregateService.reconcile(aggregate, scope, [projection], { correlationId: 'corr-4' }).action, 'REPLACE');
const page = projectionService.page([hidden, projection, low], { targetCode: 'p1', sort: 'HELPFUL', limit: 1000 }, { maximumPageSize: 100 });
assert.strictEqual(page.total, 2);
assert.strictEqual(page.items[0].reviewCode, 'r2');
assert.strictEqual(page.limit, 100);
const schemaOrg = projectionService.schemaOrg(aggregate, [projection, hidden]);
assert.strictEqual(schemaOrg.eligible, true);
assert.strictEqual(schemaOrg.value.reviewCount, 2);
assert.strictEqual(projectionService.schemaOrg({ count: 0 }, []).eligible, false);
console.log('customerReview moderation contract validated');
