/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
const assert = require('assert');
const schemas = require('../src/schemas/schemas').customerReview;
const configuration = require('../config/properties').customerReview;
const solicitation = require('../src/service/defaultCustomerReviewSolicitationService');
const syndication = require('../src/service/defaultCustomerReviewSyndicationService');

['customerReviewRequest', 'customerReviewSession', 'customerReviewAcquisitionEvent', 'customerReviewSyndication'].forEach(name => {
    assert(schemas[name], name + ' schema must exist');
    assert.strictEqual(schemas[name].router.enabled, false);
});
assert.strictEqual(configuration.solicitation.enabled, false);
assert.strictEqual(configuration.syndication.enabled, false);
const interaction = { code: 'o1', ownerId: 'c1', type: 'PURCHASE', sourceModule: 'order', fulfilledAt: '2026-08-01T00:00:00Z' };
assert.throws(() => solicitation.eligible(Object.assign({}, interaction, { predictedRating: 5 }), configuration.solicitation, new Date('2026-08-10T00:00:00Z')), error => error.code === 'ERR_REVIEW_00015');
assert.strictEqual(solicitation.eligible({ code: 'o2' }, configuration.solicitation).reason, 'INTERACTION_NOT_COMPLETED');
assert.strictEqual(solicitation.eligible(Object.assign({}, interaction, { reviewOptOut: true }), configuration.solicitation).reason, 'CUSTOMER_SUPPRESSED');
const request = solicitation.request(interaction, { tenant: 't1', targetCodes: ['p1', 'p2'], channel: 'EMAIL', idempotencyKey: 'key1', correlationId: 'corr1', now: new Date('2026-08-10T10:00:00Z') }, configuration.solicitation);
assert.strictEqual(request.status, 'PLANNED');
assert.strictEqual(request.targetCodes.length, 2);
assert.strictEqual(solicitation.reminder(Object.assign({ code: 'rq1' }, request, { status: 'DELIVERED' }), configuration.solicitation, new Date('2026-08-10T22:00:00Z')).reason, 'QUIET_PERIOD');
assert.strictEqual(solicitation.reminder(Object.assign({ code: 'rq1' }, request, { status: 'DELIVERED' }), configuration.solicitation, new Date('2026-08-10T12:00:00Z')).allowed, true);
const session = solicitation.session(Object.assign({ code: 'rq1' }, request, { status: 'OPENED' }), new Date('2026-08-10T12:00:00Z'));
assert.deepStrictEqual(session.targetCodes, ['p1', 'p2']);
assert.strictEqual(solicitation.funnel([{ eventType: 'OFFERED' }, { eventType: 'DELIVERED' }, { eventType: 'COMPLETED' }]).COMPLETED, 1);
const imported = syndication.receive({ externalReviewId: 'ext1', externalTargetId: 'sku1', licenseCode: 'LICENSED', disclosure: 'Originally collected by Partner', rating: 2, text: 'Not ideal' }, { tenant: 't1', providerCode: 'partner', targetType: 'PRODUCT', targetCode: 'p1', correlationId: 'corr2' }, configuration.syndication);
assert.strictEqual(imported.status, 'QUARANTINED');
assert(imported.sourceHash);
assert.strictEqual(syndication.replay(imported, imported).action, 'SKIP');
assert.strictEqual(syndication.replay(imported, Object.assign({}, imported, { sourceHash: 'changed' })).action, 'RECONCILE');
assert.throws(() => syndication.receive({ externalReviewId: 'ext2', externalTargetId: 'sku2', disclosure: 'Partner' }, { tenant: 't1', providerCode: 'partner', targetType: 'PRODUCT', targetCode: 'p2' }, configuration.syndication), error => error.code === 'ERR_REVIEW_00020');
assert.strictEqual(syndication.googleCustomerReviews(configuration.syndication.providers.googleCustomerReviews).enabled, false);
assert.strictEqual(syndication.googleCustomerReviews({ enabled: true }).ownsReviewState, false);
console.log('customerReview Phase 8 contract validated');
