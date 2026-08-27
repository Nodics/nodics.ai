/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
const assert = require('assert');
const schemas = require('../src/schemas/schemas').contactSubmission;
const configuration = require('../config/properties').contactSubmission;
const coreConfiguration = require('../../engagementCore/config/properties').engagementCore;
const validation = require('../src/service/defaultContactValidationService');
const routing = require('../src/service/defaultContactRoutingService');
const lifecycle = require('../src/service/defaultContactLifecycleService');
const handoff = require('../src/service/defaultContactHandoffDispatchService');
const contactApi = require('../src/service/defaultContactSubmissionOperationService');
const coreIntake = require('../../engagementCore/src/service/defaultEngagementIntakeService');
const coreValidation = require('../../engagementCore/src/service/defaultEngagementValidationService');
const coreProtection = require('../../engagementCore/src/service/defaultEngagementProtectionService');

async function run() {
    assert.strictEqual(Object.keys(schemas).length, 6);
    Object.values(schemas).forEach(schema => { assert.strictEqual(schema.router.enabled, false); assert(schema.definition.tenant && schema.definition.correlationId); });
    assert.throws(() => validation.validate({ payload: {} }, configuration), error => error.code === 'ERR_CONTACT_00001');
    let request = { tenant: 't1', correlationId: 'c1', idempotencyKey: 'i1', payload: { type: 'support', subject: ' Need help ', message: 'Please call me', contactEmail: 'USER@EXAMPLE.COM', password: 'must-not-persist' }, clock: { now: () => new Date('2026-08-09T00:00:00.000Z') } };
    let engagementRecord; let contactRecord; let handoffRecord;
    let context = {
        enabled: true,
        configuration: configuration, validation: validation, routing: routing, lifecycle: lifecycle, coreIntake: coreIntake, coreValidation: coreValidation, coreProtection: coreProtection, handoff: handoff,
        engagementRepository: { findByIdempotencyKey: async () => engagementRecord, create: async model => (engagementRecord = Object.assign({ code: 'E1' }, model)) },
        contactRepository: { create: async model => (contactRecord = Object.assign({ code: 'C1' }, model)), findByEngagementSubmissionCode: async () => contactRecord }, handoffRepository: { create: async model => (handoffRecord = model) },
        processAdapter: { send: async () => { let error = new Error('down'); error.code = 'PROCESS_DOWN'; throw error; } }
    };
    global.CONFIG = { get: key => key === 'engagementCore' ? coreConfiguration : configuration };
    await assert.rejects(() => contactApi.submit(request, Object.assign({}, context, { enabled: false })), error => error.code === 'ERR_CONTACT_00006');
    let accepted = await contactApi.submit(request, context);
    assert.strictEqual(accepted.referenceCode, contactRecord.code); assert.strictEqual(engagementRecord.domainCode, contactRecord.code); assert.strictEqual(accepted.verificationRequired, true); assert.strictEqual(accepted.handoff.status, 'RETRY_PENDING');
    assert.strictEqual(contactRecord.queueCode, 'GENERAL_SUPPORT'); assert.strictEqual(contactRecord.dueAt, '2026-08-10T00:00:00.000Z');
    assert.strictEqual(contactRecord.contactEmail, 'user@example.com'); assert.strictEqual(contactRecord.password, undefined);
    assert.strictEqual(handoffRecord.contactRequestCode, contactRecord.code);
    let replay = await contactApi.submit(request, context); assert.strictEqual(replay.duplicate, true);
    await assert.rejects(() => contactApi.submit(Object.assign({}, request, { payload: Object.assign({}, request.payload, { message: 'changed' }) }), context), error => error.code === 'ERR_ENG_00003');
    let opened = Object.assign({}, contactRecord, { status: 'OPEN', revision: 0 });
    let inProgress = lifecycle.transition(opened, { toStatus: 'IN_PROGRESS', expectedRevision: 0, clock: request.clock }, configuration.lifecycle);
    assert.strictEqual(inProgress.revision, 1);
    assert.throws(() => lifecycle.transition(inProgress, { toStatus: 'CLOSED', expectedRevision: 1 }, configuration.lifecycle), error => error.code === 'ERR_CONTACT_00002');
    assert.deepStrictEqual(lifecycle.visibleCorrespondence([{ visibility: 'INTERNAL' }, { visibility: 'CUSTOMER' }], true), [{ visibility: 'CUSTOMER' }]);
    let deferred = await handoff.dispatch('CRM', contactRecord, null, request); assert.strictEqual(deferred.deferred, true);
    console.log('ContactSubmission vertical contract validated');
}
run().catch(error => { console.error(error); process.exitCode = 1; });
