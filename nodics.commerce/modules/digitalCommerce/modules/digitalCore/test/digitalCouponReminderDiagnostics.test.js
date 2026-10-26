/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/**
 * @module digitalCore/test/reminderDiagnostics
 * @description Composes real reminder notification, sweep and Process audit with isolated source/transport
 * fixtures to prove fixed diagnostics without copying private failures into audit metadata.
 * @layer test
 * @owner digitalCore
 * @override Preserve stage vocabulary and generic Process projection in later layers.
 */
const test = require('node:test'), assert = require('node:assert/strict');
const delivery = require('../src/service/defaultDigitalCouponReminderDeliveryService');
const reminder = require('../src/service/defaultDigitalCommerceCouponReminderService');
const properties = require('../config/properties');
const lifecycle = require('../../../../../../nodics.process/modules/workflow/src/service/operation/defaultProcessRuntimeLifecycleService');
let saved;
test.beforeEach(() => { saved = { CONFIG: global.CONFIG, SERVICE: global.SERVICE }; });
test.afterEach(() => { Object.assign(global, saved); });

/** Keeps source selection and transport synthetic while executing the actual owner diagnostic path. */
function fixture(stage, disposition) {
    const config = structuredClone(properties.digitalCore);
    config.couponReminders.enabled = true;
    global.CONFIG = { get: name => name === 'digitalCore' ? config : undefined };
    const candidate = { sourceCode: 'entitlement', enterpriseCode: 'merchant', occurrenceKey: 'COUPON_EXPIRY_' + 'a'.repeat(64),
        ownerRef: { type: 'ENTERPRISE', code: 'owner' }, expiresAt: new Date(Date.now() + 3600000).toISOString() };
    const recipient = { recipientId: 'profile-employee:staff', recipientAddressReference: 'profile-inbox:' + 'b'.repeat(64) };
    const r = { tenant: 't' }, submissions = [], audits = [];
    let proofs = 0;
    const owner = Object.assign(Object.create(delivery), {
        settings: function () {
            if (stage === 'POLICY') throw new Error('PRIVATE_POLICY');
            return delivery.settings.call(this);
        },
        rpc: async (_r, moduleName, _path, body) => {
            if (moduleName === 'profile') {
                proofs++;
                if (stage === 'RECIPIENT_PROOF' && proofs === 1 || stage === 'RECIPIENT_RECHECK' && proofs === 2)
                    throw Object.assign(new Error('PRIVATE_PROFILE'), { code: 'REMOTE_ERROR', metadata: { secret: true } });
                return { contractVersion: 1, tenant: r.tenant, source: body.source, channel: 'IN_APP',
                    eligible: disposition !== 'ineligible', recipients: disposition === 'empty' || disposition === 'ineligible' ? [] : [recipient],
                    ownerRef: stage === 'SOURCE_BINDING' ? { type: 'ENTERPRISE', code: 'foreign' } : candidate.ownerRef,
                    expiresAt: candidate.expiresAt };
            }
            submissions.push(structuredClone(body));
            if (stage === 'SUBMISSION') throw Object.assign(new Error('PRIVATE_SEND'), { failureStage: 'INJECTED', code: 'PRIVATE_ERROR' });
            return stage === 'RECEIPT' ? { intentCode: 'PRIVATE_RECEIPT', status: 'DELIVERED' }
                : { intentCode: 'COMM_' + 'c'.repeat(64), status: 'DELIVERED' };
        }
    });
    const sweep = Object.assign(Object.create(reminder), { authority: () => r,
        candidates: async () => disposition === 'none' ? [] : [candidate] });
    global.SERVICE = { DefaultDigitalCouponReminderDeliveryService: owner,
        DefaultDigitalCommerceCouponAcquisitionService: { identifier() {} } };
    const context = { source: 'cronjob', cronJobTenant: 't', cronJobCode: 'job', firedAt: new Date().toISOString() };
    const instance = { code: 'instance', tenant: 't', definitionCode: 'definition', context };
    const node = { code: 'remind', action: { moduleName: 'digitalCore', operation: 'couponExpirySweep' } };
    const process = Object.assign(Object.create(lifecycle), {
        actionAdapterRegistryService: () => ({ execute: async () => sweep.sweep(r, { instance, node, context, payload: {} }) }),
        audit: async (_request, event) => { audits.push(structuredClone(event)); }
    });
    return { run: () => process.executeActionNode(r, instance, {}, node, {}), audits, submissions, candidate, recipient };
}

for (const stage of ['POLICY', 'RECIPIENT_PROOF', 'SOURCE_BINDING', 'RECIPIENT_RECHECK', 'SUBMISSION', 'RECEIPT']) {
    test('scheduled owner path retains only fixed ' + stage + ' failure diagnostics', async () => {
        const f = fixture(stage), result = await f.run();
        assert.equal(result.status, 'COMPLETED');
        assert.equal(result.output.sourceStatus, 'UNCONFIRMED');
        assert.deepEqual(result.output.outcomes[0], { occurrenceKey: f.candidate.occurrenceKey, status: 'UNCONFIRMED',
            deliveryAttempted: ['SUBMISSION', 'RECEIPT'].includes(stage), failureStage: stage });
        assert.equal(result.diagnosticCode, 'REMINDER_UNCONFIRMED_' + stage);
        assert.deepEqual(f.audits[0].metadata, { nodeCode: 'remind', adapter: 'digitalCore.couponExpirySweep',
            status: 'COMPLETED', diagnosticCode: result.diagnosticCode });
        assert.equal(JSON.stringify(f.audits).includes('PRIVATE'), false);
        assert.equal(JSON.stringify(f.audits).includes(f.candidate.occurrenceKey), false);
        assert.equal(JSON.stringify(f.audits).includes(f.recipient.recipientId), false);
        assert.equal(f.submissions.length, ['SUBMISSION', 'RECEIPT'].includes(stage) ? 1 : 0);
    });
}

test('empty selection, skips and confirmed receipts preserve completion semantics and original key', async () => {
    for (const disposition of ['none', 'empty', 'ineligible', 'delivered']) {
        const f = fixture(undefined, disposition), result = await f.run();
        assert.equal(result.status, 'COMPLETED');
        assert.equal(result.output.sourceStatus, 'COMPLETE');
        assert.equal(result.diagnosticCode, disposition === 'none' ? 'REMINDER_NO_CANDIDATES' : 'REMINDER_COMPLETE');
        assert.equal(f.audits[0].metadata.diagnosticCode, result.diagnosticCode);
        if (disposition === 'delivered') {
            assert.equal(result.output.outcomes[0].outcomes[0].status, 'DELIVERED');
            assert.equal(f.submissions[0].idempotencyKey, delivery.key(f.candidate, f.recipient.recipientId));
        } else assert.equal(f.submissions.length, 0);
    }
});
