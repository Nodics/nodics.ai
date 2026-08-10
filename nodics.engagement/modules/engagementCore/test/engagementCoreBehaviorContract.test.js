/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
const assert = require('assert');
const schemas = require('../src/schemas/schemas').engagementCore;
const properties = require('../config/properties').engagementCore;
const validation = require('../src/service/defaultEngagementValidationService');
const protection = require('../src/service/defaultEngagementProtectionService');
const lifecycle = require('../src/service/defaultEngagementLifecycleService');
const consent = require('../src/service/defaultEngagementConsentService');
const triage = require('../src/service/defaultEngagementTriageService');
const integration = require('../src/service/defaultEngagementIntegrationService');
const intake = require('../src/service/defaultEngagementIntakeService');

async function run() {
    assert.strictEqual(Object.keys(schemas).length, 21);
    Object.values(schemas).forEach(schema => {
        assert.strictEqual(schema.router.enabled, false);
        assert.strictEqual(schema.cache.enabled, false);
        assert.strictEqual(schema.event.enabled, false);
        assert.strictEqual(schema.search.enabled, false);
        assert(schema.definition.tenant && schema.definition.correlationId);
    });

    assert.throws(() => validation.validate({}, properties), error => error.code === 'ERR_ENG_00001');
    let request = { tenant: 't1', correlationId: 'c1', idempotencyKey: 'i1', submissionType: 'GENERIC', channel: 'web', retentionPolicyCode: 'R1', payload: { email: ' a@b.test ', accessToken: 'secret' }, authData: { principalId: 'customer-1' }, clock: { now: () => new Date('2026-08-09T00:00:00.000Z') } };
    let protectedResult = await protection.protect(validation.validate(request, properties), properties.protection);
    assert.strictEqual(protectedResult.request.payload.accessToken, '[REDACTED]');

    let stored;
    let repository = { findByIdempotencyKey: async () => stored, create: async value => (stored = Object.assign({ code: 'S1' }, value)) };
    let first = await intake.submit(request, { validationService: validation, protectionService: protection, configuration: properties, repository: repository });
    assert.strictEqual(first.submission.processingStatus, 'RECEIVED');
    assert.strictEqual(first.submission.ownerId, 'customer-1');
    let replay = await intake.submit(request, { validationService: validation, protectionService: protection, configuration: properties, repository: repository });
    assert.strictEqual(replay.duplicate, true);
    await assert.rejects(() => intake.submit(Object.assign({}, request, { payload: { changed: true } }), { validationService: validation, protectionService: protection, configuration: properties, repository: repository }), error => error.code === 'ERR_ENG_00003');

    let changed = lifecycle.transition(first.submission, { toStatus: 'VALIDATING', expectedRevision: 0, correlationId: 'c1', clock: request.clock }, properties.lifecycle);
    assert.strictEqual(changed.submission.revision, 1);
    assert.throws(() => lifecycle.transition(changed.submission, { toStatus: 'CLOSED', expectedRevision: 1 }, properties.lifecycle), error => error.code === 'ERR_ENG_00004');
    assert.throws(() => lifecycle.transition(changed.submission, { toStatus: 'ACCEPTED', expectedRevision: 0 }, properties.lifecycle), error => error.code === 'ERR_ENG_00005');

    let consentRecord = consent.record({ tenant: 't1', purposeCode: 'PUBLICATION', policyVersion: '1', evidence: { source: 'FORM' }, clock: request.clock });
    assert.strictEqual(consent.withdraw(consentRecord, { clock: request.clock }).status, 'WITHDRAWN');
    assert.strictEqual(triage.assign(first.submission, { queueCode: 'SUPPORT', clock: request.clock }).status, 'ASSIGNED');
    assert.strictEqual(triage.calculateDueAt({ startAt: '2026-08-09T00:00:00.000Z', durationMinutes: 60 }), '2026-08-09T01:00:00.000Z');
    let classification = await triage.classify(first.submission, { correlationId: 'c1' }, { classify: async () => ({ categoryCode: 'SERVICE', confidence: 1.8, source: 'AI', modelReference: 'policy/model-version', explanation: 'bounded evidence' }) });
    assert.strictEqual(classification.confidence, 1);
    assert.strictEqual((await integration.startProcess(first.submission, {}, null)).deferred, true);
    let processReference = await integration.startProcess(first.submission, { processDefinitionCode: 'engagement-resolution' }, { start: async command => ({ provider: 'PROCESS', processInstanceCode: 'PI1', status: 'IN_PROGRESS', command: command }) });
    assert.strictEqual(processReference.externalReference, 'PI1');
    assert.strictEqual((await integration.evaluatePublication(first.submission, { eligible: true, policyCode: 'P1', clock: request.clock }, null)).eligibility, 'ELIGIBLE');
    assert.strictEqual(integration.reconcile({ attempts: 2 }, { success: false, maximumAttempts: 3 }).status, 'DEAD_LETTER');
    let overrideTransitions = Object.assign({}, properties.lifecycle, { transitions: Object.assign({}, properties.lifecycle.transitions, { RECEIVED: ['ACCEPTED'] }) });
    assert.strictEqual(lifecycle.transition(first.submission, { toStatus: 'ACCEPTED', expectedRevision: 0 }, overrideTransitions).submission.processingStatus, 'ACCEPTED');
    console.log('EngagementCore Phase 2 behavior contract validated');
}

run().catch(error => { console.error(error); process.exitCode = 1; });
