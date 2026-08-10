/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
const assert = require('assert');
const recovery = require('../src/service/defaultContactHandoffRecoveryService');
const processAdapter = require('../src/service/defaultProcessHandoffAdapterService');

async function run() {
    global.CONFIG = { get: key => key === 'contactSubmission' ? { processDefinitionCode: 'contactResolution', handoffRecovery: { batchSize: 10, leaseMs: 1000, maximumAttempts: 2, baseBackoffMs: 100, maximumBackoffMs: 500 } } : { process: { endpoint: { httpHost: '127.0.0.1', httpPort: 4330 } } } };
    let now = new Date('2026-08-09T00:00:00.000Z');
    let records = [
        { code: 'H1', tenant: 't1', contactRequestCode: 'C1', targetType: 'PROCESS', status: 'PENDING', attempts: 0, revision: 0, correlationId: 'corr-1' },
        { code: 'H2', tenant: 't1', contactRequestCode: 'C2', targetType: 'PROCESS', status: 'RETRY_PENDING', attempts: 0, revision: 0, nextRetryAt: new Date('2026-08-09T00:10:00.000Z'), correlationId: 'corr-2' }
    ];
    let completed = []; let failed = [];
    let repository = {
        listRecoverable: async () => records,
        claim: async record => record.code === 'H1',
        complete: async (record, workerId, result) => { completed.push({ record: record, workerId: workerId, result: result }); return true; },
        fail: async (record, workerId, failure) => { failed.push(failure); return true; }
    };
    let result = await recovery.run({ tenant: 't1', workerId: 'worker-1', clock: { now: () => now } }, { repository: repository, configuration: CONFIG.get('contactSubmission').handoffRecovery, adapter: { send: async () => ({ provider: 'PROCESS', reference: 'PI1', status: 'RUNNING' }) } });
    assert.strictEqual(result.examined, 1); assert.strictEqual(result.succeeded, 1); assert.strictEqual(completed[0].result.reference, 'PI1');
    repository.claim = async () => false;
    result = await recovery.run({ tenant: 't1', workerId: 'worker-2', clock: { now: () => now } }, { repository: repository, configuration: CONFIG.get('contactSubmission').handoffRecovery, adapter: { send: async () => ({ reference: 'duplicate' }) } });
    assert.strictEqual(result.skipped, 1); assert.strictEqual(completed.length, 1, 'a lost claim must never call the provider');
    repository.claim = async () => true;
    result = await recovery.run({ tenant: 't1', workerId: 'worker-3', clock: { now: () => now } }, { repository: repository, configuration: CONFIG.get('contactSubmission').handoffRecovery, adapter: { send: async () => { let error = new Error('down'); error.code = 'PROCESS_DOWN'; throw error; } } });
    assert.strictEqual(result.retryPending, 1); assert.strictEqual(failed[0].nextRetryAt.toISOString(), '2026-08-09T00:00:00.100Z');
    records[0].attempts = 1;
    result = await recovery.run({ tenant: 't1', workerId: 'worker-4', clock: { now: () => now } }, { repository: repository, configuration: CONFIG.get('contactSubmission').handoffRecovery, adapter: { send: async () => { throw Object.assign(new Error('down'), { code: 'PROCESS_DOWN' }); } } });
    assert.strictEqual(result.deadLetter, 1);
    let reset = false;
    await recovery.retry({ tenant: 't1', handoffCode: 'H1', clock: { now: () => now } }, { repository: { get: async () => ({ code: 'H1', status: 'DEAD_LETTER' }), reset: async () => (reset = true) } });
    assert.strictEqual(reset, true);
    let reconciled = false;
    let reconcile = await recovery.reconcile({ tenant: 't1', handoffCode: 'H1', clock: { now: () => now } }, { repository: { get: async () => ({ code: 'H1', targetType: 'PROCESS', externalReference: 'PI1' }), reconciled: async () => (reconciled = true) }, adapter: { lookup: async () => ({ terminal: true, status: 'COMPLETED', reference: 'PI1' }) } });
    assert.strictEqual(reconcile.reconciled, true); assert.strictEqual(reconciled, true);
    let captured;
    global.fetch = async (url, options) => { captured = { url: url, options: options }; return { ok: true, json: async () => ({ result: { code: 'PI2', status: 'RUNNING' } }) }; };
    let sent = await processAdapter.send({ definitionCode: 'contactResolution', contactRequestCode: 'C1', correlationId: 'corr-1' }, { tenant: 't1', enterprise: 'default', correlationId: 'corr-1', authorization: 'Bearer token' });
    assert.strictEqual(sent.reference, 'PI2'); assert(captured.url.endsWith('/nodics/process/v0/instances')); assert.strictEqual(captured.options.headers.Authorization, 'Bearer token'); assert(!captured.options.body.includes('token'));
    global.fetch = async () => ({ ok: true, json: async () => ({ data: { instance: { code: 'PI3', status: 'WAITING' } } }) });
    sent = await processAdapter.send({ definitionCode: 'contactResolution', contactRequestCode: 'C1', correlationId: 'corr-1' }, { tenant: 't1', enterprise: 'default', correlationId: 'corr-1', authorization: 'Bearer token' });
    assert.deepStrictEqual(sent, { provider: 'PROCESS', reference: 'PI3', status: 'WAITING' });
    global.fetch = async () => ({ ok: true, json: async () => ({ data: { instance: { status: 'WAITING' } } }) });
    await assert.rejects(() => processAdapter.send({ definitionCode: 'contactResolution', contactRequestCode: 'C1' }, { tenant: 't1', enterprise: 'default', authorization: 'Bearer token' }), error => error.code === 'PROCESS_REFERENCE_MISSING');
    console.log('Contact handoff recovery, concurrency, dead-letter, repair, reconciliation, and Process adapter validated');
}
run().catch(error => { console.error(error); process.exitCode = 1; });
