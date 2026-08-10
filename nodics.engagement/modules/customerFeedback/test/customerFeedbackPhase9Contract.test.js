/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
const assert = require('assert');
const schemas = require('../src/schemas/schemas').customerFeedback;
const configuration = require('../config/properties').customerFeedback;
const governance = require('../src/service/defaultCustomerFeedbackGovernanceService');
global.SERVICE = { DefaultCustomerFeedbackGovernanceService: governance };
const lifecycle = require('../src/service/defaultCustomerFeedbackLifecycleService');
const insight = require('../src/service/defaultCustomerFeedbackInsightService');

assert.deepStrictEqual(Object.keys(schemas), ['customerFeedback', 'customerFeedbackClassification', 'customerFeedbackFollowUp', 'customerFeedbackResolution', 'customerFeedbackHandoff', 'customerFeedbackInsight']);
Object.values(schemas).forEach(schema => assert.strictEqual(schema.router.enabled, false));
const feedback = governance.validate({ code: 'f1', tenant: 't1', ownerId: 'c1', type: 'COMPLAINT', message: 'Delivery was damaged', attachmentCodes: ['m1'], correlationId: 'corr1' }, configuration.intake);
assert.strictEqual(feedback.status, 'RECEIVED');
assert.throws(() => governance.validate({ type: 'UNKNOWN', message: 'x' }, configuration.intake), error => error.code === 'ERR_FEEDBACK_00002');
assert.throws(() => governance.validate({ type: 'COMPLAINT', message: 'x', attachmentCodes: ['1', '2'] }, Object.assign({}, configuration.intake, { maximumAttachments: 1 })), error => error.code === 'ERR_FEEDBACK_00002');
let triaged = lifecycle.transition(feedback, { action: 'TRIAGE', expectedRevision: 0 }, configuration);
let assigned = lifecycle.transition(triaged, { action: 'ASSIGN', expectedRevision: 1 }, configuration);
let active = lifecycle.transition(assigned, { action: 'START', expectedRevision: 2 }, configuration);
let resolved = lifecycle.transition(active, { action: 'RESOLVE', expectedRevision: 3, now: new Date('2026-08-10T00:00:00Z') }, configuration);
let closed = lifecycle.transition(resolved, { action: 'CONFIRM', expectedRevision: 4 }, configuration);
let reopened = lifecycle.transition(closed, { action: 'REOPEN', expectedRevision: 5 }, configuration);
assert.strictEqual(reopened.status, 'IN_PROGRESS');
assert.throws(() => lifecycle.transition(feedback, { action: 'TRIAGE', expectedRevision: 9 }, configuration), error => error.code === 'ERR_FEEDBACK_00004');
const resolution = lifecycle.resolution(resolved, [], { outcomeCode: 'REPLACED', summary: 'Replacement delivered', actorId: 'operator', customerConfirmed: true });
assert.strictEqual(resolution.status, 'ACCEPTED');
const followUp = lifecycle.followUp(active, [], { channel: 'PREFERRED', status: 'CONTACTED' }, configuration.followUp);
assert.strictEqual(followUp.attempt, 1);
assert.throws(() => lifecycle.followUp(active, [{ attempt: 3 }], { channel: 'EMAIL' }, configuration.followUp), error => error.code === 'ERR_FEEDBACK_00006');
const handoff = lifecycle.handoff(active, { targetModule: 'order', targetOperation: 'createReplacementIntent', idempotencyKey: 'key1' });
assert.strictEqual(handoff.status, 'PENDING');
const proposed = insight.derive([feedback], { tenant: 't1', insightType: 'TOPIC', value: { topic: 'damaged delivery' }, confidence: 0.8, source: 'AI', modelReference: 'model-v1', promptVersion: 'p1' }, configuration.insight);
assert.strictEqual(proposed.status, 'PROPOSED');
assert.deepStrictEqual(proposed.sourceFeedbackCodes, ['f1']);
assert.strictEqual(insight.correct(proposed, { value: { topic: 'carrier damage' }, actorId: 'analyst', reason: 'manual review' }).status, 'CORRECTED');
assert.strictEqual(insight.propagateDeletion('f1', [proposed])[0].status, 'DELETED');
assert.deepStrictEqual(insight.availability(undefined), { aiAvailable: false, deterministicFallback: true, directActionAllowed: false });
console.log('customerFeedback Phase 9 contract validated');
