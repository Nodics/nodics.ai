/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/**
 * @module digitalCore/test/reminderSubmissionClassification
 * @description Verifies original nService error classification and privacy through actual RPC,
 * notify, sweep and generic Process audit with isolated transports/source selection.
 * @layer test
 * @owner digitalCore
 * @override Keep fixed reasons and never copy remote exception or envelope fields.
 */
const test = require('node:test'), assert = require('node:assert/strict');
const delivery = require('../src/service/defaultDigitalCouponReminderDeliveryService');
const reminder = require('../src/service/defaultDigitalCommerceCouponReminderService');
const properties = require('../config/properties');
const lifecycle = require('../../../../../../nodics.process/modules/workflow/src/service/operation/defaultProcessRuntimeLifecycleService');

test('submission reasons use only fixed transport evidence and exclude remote errors/envelopes from results and audit', async () => {
    const saved = { CONFIG: global.CONFIG, SERVICE: global.SERVICE };
    try {
        const cases = [
            [{ metadata: { remoteHttpFailure: { httpStatus: 401 } } }, 'AUTHORIZATION'],
            [{ metadata: { remoteHttpFailure: { httpStatus: 403 } }, responseCode: '503' }, 'AUTHORIZATION'],
            [{ status: 403 }, 'AUTHORIZATION'],
            [{ metadata: { remoteHttpFailure: { httpStatus: 404 } } }, 'ENDPOINT'],
            ...[500, 502, 503, 599].map(httpStatus => [{ metadata: { remoteHttpFailure: { httpStatus } } }, 'OWNER_RESPONSE']),
            [{ metadata: { runtimeInvocationDiagnostic: { failureCode: 'INTERNAL_TOKEN_UNAVAILABLE' } } }, 'CREDENTIAL'],
            [{ metadata: { runtimeInvocationDiagnostic: { failureCode: 'REMOTE_ENDPOINT_UNAVAILABLE' } } }, 'ENDPOINT'],
            [{ metadata: { runtimeInvocationDiagnostic: { failureCode: 'ECONNREFUSED' } } }, 'TRANSPORT'],
            [{ metadata: { transportFailure: { code: 'ETIMEDOUT' } } }, 'TRANSPORT'],
            [{ responseCode: '403', metadata: { digitalReminderDelivery: { failureReason: 'AUTHORIZATION' },
                runtimeInvocationDiagnostic: { failureCode: 'PRIVATE_REMOTE_CODE' } } }, 'TRANSPORT'],
            [{ metadata: { remoteHttpFailure: { httpStatus: '403' } } }, 'TRANSPORT'],
            [null, 'TRANSPORT'],
            [{ envelope: { code: 'ERR_PRIVATE', responseCode: '403', message: 'PRIVATE_ENVELOPE' } }, 'OWNER_RESPONSE'],
            [{ envelope: { data: { success: false, reason: 'PRIVATE_BODY' } } }, 'OWNER_RESPONSE'],
            [{ envelope: null }, 'OWNER_RESPONSE']
        ];
        for (const [fault, expected] of cases) {
            const cfg = structuredClone(properties.digitalCore); cfg.couponReminders.enabled = true;
            global.CONFIG = { get: key => key === 'digitalCore' ? cfg : undefined };
            const r = { tenant: 't' }, candidate = { enterpriseCode: 'merchant', sourceCode: 'entitlement',
                ownerRef: { type: 'ENTERPRISE', code: 'owner' }, expiresAt: new Date(Date.now() + 3600000).toISOString(),
                occurrenceKey: 'COUPON_EXPIRY_' + 'a'.repeat(64) };
            const recipient = { recipientId: 'profile-employee:staff', recipientAddressReference: 'profile-inbox:' + 'b'.repeat(64) };
            const audits = []; let attempts = 0, safeError;
            const owner = Object.assign(Object.create(delivery), {
                rpc: async function (...args) {
                    try { return await delivery.rpc.apply(this, args); }
                    catch (error) { safeError = error; throw error; }
                }
            });
            global.SERVICE = {
                DefaultDigitalCouponReminderDeliveryService: owner,
                DefaultDigitalCommerceCouponAcquisitionService: { identifier() {} },
                DefaultLoggerService: { runSensitiveOperation: async (_request, callback) => callback() },
                DefaultModuleService: { invokeModule: async call => {
                    if (call.moduleName === 'profile') return { data: { contractVersion: 1, tenant: 't',
                        source: call.requestBody.source, channel: 'IN_APP', eligible: true, recipients: [recipient],
                        ownerRef: candidate.ownerRef, expiresAt: candidate.expiresAt } };
                    attempts++;
                    if (fault && Object.hasOwn(fault, 'envelope')) return fault.envelope;
                    const original = fault || {};
                    // Reading message, stack or cause is itself a regression, even inside private code.
                    for (const key of ['message', 'stack', 'cause']) Object.defineProperty(original, key, {
                        configurable: true, get() { throw new Error('PRIVATE_FIELD_READ'); }
                    });
                    throw original;
                } }
            };
            const sweep = Object.assign(Object.create(reminder), { authority: () => r, candidates: async () => [candidate] });
            const context = { source: 'cronjob', cronJobTenant: 't', cronJobCode: 'job', firedAt: new Date().toISOString() };
            const instance = { tenant: 't', code: 'instance', definitionCode: 'definition', context };
            const node = { code: 'remind', action: { moduleName: 'digitalCore', operation: 'couponExpirySweep' } };
            const process = Object.assign(Object.create(lifecycle), {
                actionAdapterRegistryService: () => ({ execute: async () => sweep.sweep(r, { instance, context, node, payload: {} }) }),
                audit: async (_request, event) => { audits.push(event); }
            });
            const result = await process.executeActionNode(r, instance, {}, node, {});
            const outcome = result.output.outcomes[0];
            assert.equal(attempts, 1);
            assert.deepEqual(outcome, { occurrenceKey: candidate.occurrenceKey, status: 'UNCONFIRMED',
                deliveryAttempted: true, failureStage: 'SUBMISSION', failureReason: expected });
            assert.equal(result.status, 'COMPLETED'); assert.equal(result.output.sourceStatus, 'UNCONFIRMED');
            const diagnosticCode = 'REMINDER_UNCONFIRMED_SUBMISSION_' + expected;
            assert.equal(result.diagnosticCode, diagnosticCode); assert.ok(diagnosticCode.length < 64);
            assert.deepEqual(audits[0].metadata, { nodeCode: 'remind', adapter: 'digitalCore.couponExpirySweep',
                status: 'COMPLETED', diagnosticCode });
            assert.equal(safeError.message, 'Coupon reminder delivery is unconfirmed');
            assert.deepEqual(safeError.metadata, { digitalReminderDelivery: { failureReason: expected } });
            assert.equal(safeError.cause, undefined);
            assert.equal(JSON.stringify({ result, audits, error: safeError }).includes('PRIVATE'), false);
        }
    } finally { Object.assign(global, saved); }
});
