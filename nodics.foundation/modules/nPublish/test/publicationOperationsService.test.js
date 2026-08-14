/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nPublish/test/PublicationOperationsService */
const assert = require('assert');
const service = require('../src/service/defaultPublicationOperationsService');
class NodicsError extends Error { constructor(code, message) { super(message || code); this.code = code; } }
const now = Date.now();
const rows = [
    { code: 'online', state: 'ONLINE', revision: 4, correlationId: 'corr-a', targetVersion: 'm4', updatedAt: new Date(now).toISOString(), secret: 'hidden' },
    { code: 'stuck', state: 'ACTIVATING', revision: 3, correlationId: 'corr-a', updatedAt: new Date(now - 10000).toISOString() },
    { code: 'failed', state: 'FAILED', revision: 2, correlationId: 'corr-b', failureCode: 'SAFE_FAILURE', updatedAt: new Date(now).toISOString() }
];
let retried;
global.CLASSES = { NodicsError };
global.CONFIG = { get: key => key === 'publish' ? { reconciliation: {
    correlationSearchLimit: 10, stuckAfterMs: 1000, alertFailureCount: 1
} } : undefined };
global.SERVICE = {
    DefaultPublicationAuditReconciliationService: {
        getRepository: () => ({ list: async () => rows }),
        reconcile: async () => ({ scanned: 3, restored: 1 })
    },
    DefaultCmsPublicationOutboxService: { reconcile: async () => ({ delivered: 1 }) },
    DefaultPublicationLifecycleService: {
        getVersionProvider: () => ({ reconcile: async publication => ({ status: 'CONSISTENT', manifestCode: publication.targetVersion }) }),
        get: async request => rows.find(item => item.code === request.publicationCode),
        retry: async request => { retried = request; return { state: 'VALIDATING' }; }
    }
};

(async function () {
    let diagnostics = await service.diagnostics({ tenant: 'tenant-a' });
    assert.strictEqual(diagnostics.readiness, 'DEGRADED');
    assert.deepStrictEqual(diagnostics.metrics, { publicationTotal: 3, failedTotal: 1, stuckTotal: 1 });
    assert.strictEqual(diagnostics.stuck[0].code, 'stuck');
    assert.strictEqual(Object.prototype.hasOwnProperty.call(diagnostics.stuck[0], 'secret'), false);
    assert.deepStrictEqual(diagnostics.alerts, [{ code: 'PUBLICATION_FAILURES_PRESENT', severity: 'WARNING', count: 1 }]);
    let correlation = await service.correlation({ params: { correlationId: 'corr-a' } });
    assert.deepStrictEqual(correlation.publications.map(item => item.code), ['online', 'stuck']);
    await assert.rejects(service.correlation({ params: { correlationId: '../unsafe' } }), error => error.code === 'ERR_PUB_00001');
    let reconciliation = await service.reconcile({ tenant: 'tenant-a' });
    assert.deepStrictEqual(reconciliation.projection, { scanned: 3, restored: 1 });
    assert.deepStrictEqual(reconciliation.outbox, { delivered: 1 });
    assert.deepStrictEqual(reconciliation.target, [{ publicationCode: 'online',
        result: { status: 'CONSISTENT', manifestCode: 'm4' } }]);
    let recovered = await service.recover({ publicationCode: 'failed', reason: 'operator repair' });
    assert.strictEqual(recovered.state, 'VALIDATING');
    assert.strictEqual(retried.expectedRevision, 2);
    await assert.rejects(service.recover({ publicationCode: 'online' }), error => error.code === 'ERR_PUB_00003');
    console.log('publication operations service validated');
})().catch(error => { console.error(error); process.exit(1); });
