/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
const assert = require('assert');
const aggregate = require('../src/service/defaultCustomerReviewAggregateService');
const projection = require('../src/service/defaultCustomerReviewProjectionService');
const records = {
    customerReviewProjection: [],
    customerReviewVersion: [{ code: 'v1', tenant: 't1', reviewCode: 'r1', version: 1, status: 'CURRENT', overallRating: 5, dimensionRatings: {}, body: 'Excellent', contentHash: 'hash' }],
    customerReviewAuthenticityEvidence: [{ code: 'a1', tenant: 't1', reviewCode: 'r1', verificationStatus: 'VERIFIED', interactionType: 'PURCHASE' }],
    customerReviewResponse: [],
    customerReviewAggregate: []
};
const repository = {
    list: async (type, tenant, query) => (records[type] || []).filter(item => item.tenant === tenant && Object.keys(query || {}).every(key => query[key] === undefined || item[key] === query[key])),
    save: async (type, tenant, value) => { let list = records[type]; let index = list.findIndex(item => item.code === value.code); let saved = Object.assign({ code: value.code || type + '-' + (list.length + 1) }, value); if (index >= 0) list[index] = saved; else list.push(saved); return saved; }
};
global.CONFIG = { get: name => name === 'customerReview' ? { publicExperience: { aggregatePolicyVersion: '1', calculationVersion: '1', maximumGalleryItems: 12 } } : {} };
global.SERVICE = {
    DefaultCustomerReviewRepositoryService: repository,
    DefaultCustomerReviewProjectionService: projection,
    DefaultCustomerReviewAggregateService: aggregate,
    DefaultCustomerReviewGovernanceService: { error: (code, message) => Object.assign(new Error(message), { code }) }
};
const experience = require('../src/service/defaultCustomerReviewPublicExperienceService');

async function run() {
    const approved = { code: 'r1', tenant: 't1', targetType: 'PRODUCT', targetCode: 'p1', site: 'main', locale: 'en', channel: 'WEB', status: 'APPROVED', correlationId: 'corr' };
    let published = await experience.reconcile(approved, { now: new Date('2026-08-10T03:00:00Z') });
    assert.strictEqual(published.projection.status, 'PUBLISHED');
    assert.strictEqual(published.aggregate.count, 1);
    assert.strictEqual(published.aggregate.average, 5);
    assert(published.invalidation.cache.includes('PRODUCT:p1'));
    let hidden = await experience.reconcile(Object.assign({}, approved, { status: 'HIDDEN' }), { now: new Date('2026-08-10T04:00:00Z') });
    assert.strictEqual(hidden.projection.status, 'HIDDEN');
    assert.strictEqual(hidden.aggregate.count, 0);
    let restored = await experience.reconcile(approved, { now: new Date('2026-08-10T05:00:00Z') });
    assert.strictEqual(restored.aggregate.count, 1);
    assert.strictEqual(records.customerReviewProjection.length, 1, 'retry and restore update the projection rather than duplicating it');
    console.log('customerReview public experience reconciliation validated');
}
run().catch(error => { console.error(error); process.exitCode = 1; });
