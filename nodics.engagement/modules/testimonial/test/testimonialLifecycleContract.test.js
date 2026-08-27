/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
const assert = require('assert');
const schemas = require('../src/schemas/schemas').testimonial;
const policy = require('../src/service/defaultTestimonialPolicyService');
global.SERVICE = { DefaultTestimonialPolicyService: policy };
const lifecycle = require('../src/service/defaultTestimonialLifecycleService');
SERVICE.DefaultTestimonialLifecycleService = lifecycle;

assert.deepStrictEqual(Object.keys(schemas), ['testimonialCandidate', 'testimonialVersion', 'testimonialConsent', 'testimonialProjection']);
Object.values(schemas).forEach(schema => assert.strictEqual(schema.router.enabled, false));
const candidate = { code: 'tc1', tenant: 't1', ownerId: 'c1', originalText: 'The original words.', materialRelationship: 'Employee relationship disclosed', revision: 0, correlationId: 'corr1' };
assert.throws(() => lifecycle.transitionCandidate(candidate, { originalText: 'Rewritten' }, 0), error => error.code === 'ERR_TESTIMONIAL_00002');
assert.throws(() => lifecycle.transitionCandidate(candidate, { status: 'EDITING' }, 1), error => error.code === 'ERR_TESTIMONIAL_00005');
const version = lifecycle.createVersion(candidate, [], { editorialText: 'A polished quote.', locale: 'en', requireCustomerConfirmation: true });
assert.strictEqual(version.version, 1); assert.strictEqual(version.status, 'PENDING_CUSTOMER_CONFIRMATION');
const confirmed = lifecycle.confirmVersion(version, { now: new Date('2026-08-09T10:00:00Z') });
const approved = lifecycle.approveVersion(confirmed, { actorId: 'legal1', now: new Date('2026-08-09T11:00:00Z') });
const consent = { status: 'GRANTED', attribution: { displayName: 'A Customer', role: 'Buyer' }, channels: ['WEB'], regions: ['AE'], mediaAllowed: false, expiresAt: '2027-01-01T00:00:00Z' };
assert.throws(() => lifecycle.prepareProjection(candidate, approved, consent, { channel: 'SOCIAL', region: 'AE' }), error => error.code === 'ERR_TESTIMONIAL_00003');
const projection = lifecycle.prepareProjection(candidate, Object.assign({ code: 'tv1' }, approved), consent, { channel: 'WEB', region: 'AE', correlationId: 'corr1' }, '2026-08-09T12:00:00Z');
assert.strictEqual(projection.publicText, 'A polished quote.'); assert(!('originalText' in projection)); assert(!('ownerId' in projection)); assert.deepStrictEqual(projection.disclosures, ['Employee relationship disclosed']);
assert.throws(() => lifecycle.publish(projection, { code: 'pub1', state: 'APPROVED' }), error => error.code === 'ERR_TESTIMONIAL_00007');
const published = lifecycle.publish(projection, { code: 'pub1', state: 'ONLINE' }, new Date('2026-08-10T00:00:00Z'));
assert.strictEqual(published.status, 'PUBLISHED'); assert.strictEqual(published.publicationRequestCode, 'pub1');
const withdrawn = lifecycle.hideAll([published], 'CONSENT_WITHDRAWN', new Date('2026-08-10T01:00:00Z'));
assert.strictEqual(withdrawn[0].status, 'WITHDRAWN');
const emergency = lifecycle.hideAll([published], 'EMERGENCY', new Date('2026-08-10T01:00:00Z'));
assert.strictEqual(emergency[0].status, 'HIDDEN');
assert.throws(() => lifecycle.restore(emergency[0], approved, Object.assign({}, consent, { status: 'WITHDRAWN' })), error => error.code === 'ERR_TESTIMONIAL_00003');
const restored = lifecycle.restore(emergency[0], approved, consent, '2026-08-10T02:00:00Z'); assert.strictEqual(restored.status, 'PREVIEW');
const reconciliation = lifecycle.reconcile([published], [{ candidateCode: 'tc1', status: 'WITHDRAWN' }], '2026-08-10T03:00:00Z');
assert.strictEqual(reconciliation.repaired, 1); assert.strictEqual(reconciliation.projections[0].status, 'WITHDRAWN');
console.log('testimonial lifecycle contract validated');
