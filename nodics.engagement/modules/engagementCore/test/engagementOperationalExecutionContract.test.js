/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
const assert = require('assert');
const service = require('../src/service/defaultEngagementOperationsExecutionService');
(async () => {
    const preview = { preview: true, requiresApproval: true, commands: [{ domainType: 'FEEDBACK', domainCode: 'F1', action: 'TRIAGE', expectedRevision: 0 }, { domainType: 'CONTACT', domainCode: 'C1', action: 'RESOLVE', expectedRevision: 2 }] };
    let receipts = new Map(); let command = { tenant: 't1', approved: true, approvalReason: 'SLA recovery', actorId: 'operator1', idempotencyKey: 'batch-1', action: 'TRIAGE', correlationId: 'corr1' };
    let ports = { findReceipt: async (_, key) => receipts.get(key), saveReceipt: async value => (receipts.set(value.idempotencyKey, value), value), dispatch: async value => { if (value.domainCode === 'C1') throw Object.assign(new Error('conflict'), { code: 'REVISION_CONFLICT' }); return { revision: 1 }; } };
    let run = await service.executeBatch(preview, Object.assign({}, command, { continueOnError: true }), ports); assert.strictEqual(run.status, 'PARTIAL'); assert.strictEqual(run.succeeded, 1); assert.strictEqual(run.failed, 1); assert.strictEqual(run.results[1].errorCode, 'REVISION_CONFLICT');
    let replay = await service.executeBatch(preview, command, ports); assert.strictEqual(replay.duplicate, true);
    await assert.rejects(service.executeBatch(preview, Object.assign({}, command, { approved: false }), ports));
    let exported = await service.executeExport({ fields: ['domainType', 'status'], maximumRecords: 10, status: 'PREVIEWED' }, [{ domainType: 'FEEDBACK', status: 'OPEN', summary: { private: true } }], command, {}); assert.deepStrictEqual(exported.rows, [{ domainType: 'FEEDBACK', status: 'OPEN' }]); assert.strictEqual(exported.checksum.length, 64);
    let repair = await service.executeRepair({ domainType: 'FEEDBACK', domainCode: 'F1', observedSourceHash: 'h1', status: 'PREVIEWED' }, command, { dispatch: async () => ({ status: 'RECONCILED', revision: 2 }) }); assert.strictEqual(repair.status, 'REPAIRED');
    console.log('Engagement approved operational execution contract validated');
})().catch(error => { console.error(error); process.exitCode = 1; });
