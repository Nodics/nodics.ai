/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** Validates after-commit delivery, ordering, duplicate suppression, lease recovery, and startup reconciliation. */
const assert = require('assert');
const events = [];
const matches = (model, query) => Object.keys(query || {}).every(key => {
    let expected = query[key];
    if (expected && expected.$in) return expected.$in.includes(model[key]);
    return model[key] === expected;
});
const generated = {
    get: async request => ({ result: events.filter(item => matches(item, request.query)) }),
    save: async request => { events.push(Object.assign({}, request.model)); return { result: [request.model] }; },
    update: async request => {
        let item = events.find(model => matches(model, request.query));
        if (!item) return { result: { modifiedCount: 0 } };
        Object.assign(item, request.model); return { result: { modifiedCount: 1 } };
    }
};
let role = 'ONLINE';
let invalidations = [];
let transactionOpen = false;
global.CONFIG = { get: key => key === 'cms' ? { publication: { runtimeRole: role,
    outbox: { batchSize: 100, maximumAttempts: 10, leaseMs: 100, startupReconciliation: true } } } :
    key === 'defaultTenant' ? 'default' : undefined };
global.NODICS = { getActiveTenants: () => ['default'] };
global.SERVICE = {
    DefaultCmsPublicationEventOutboxService: generated,
    DefaultCmsDeliveryCacheInvalidationService: { invalidate: async request => {
        assert.strictEqual(transactionOpen, false, 'outbox side effects must run only after the target transaction commits');
        invalidations.push(request.publicationEvent.code);
    } }
};
const service = require('../src/service/publication/defaultCmsPublicationOutboxService');
const manifest = { code: 'manifest-v2', publicationCode: 'publication-v2' };
const request = { tenant: 'default', correlationId: 'correlation-v2', publicationOperationKey: 'publication-v2:activate:7' };

(async () => {
    transactionOpen = true;
    const committed = await service.enqueue('DEPLOY', manifest, request);
    assert.strictEqual(committed.status, 'PENDING');
    assert.strictEqual(committed.sequence, 7);
    assert.strictEqual(invalidations.length, 0);
    transactionOpen = false;
    await service.deliver(committed, request);
    assert.strictEqual(invalidations.length, 1);

    const duplicate = Object.assign({}, committed, { code: 'duplicate', status: 'PENDING', sequence: 8 });
    events.push(duplicate);
    await Promise.all([service.deliver(Object.assign({}, duplicate), request),
        service.deliver(Object.assign({}, duplicate), request)]);
    assert.strictEqual(invalidations.filter(code => code === 'duplicate').length, 1,
        'concurrent consumers must produce one cache invalidation');

    events.push({ code: 'later', publicationCode: 'publication-v2', manifestCode: 'manifest-v2', operation: 'ROLLBACK',
        status: 'PENDING', attempts: 0, sequence: 10 });
    events.push({ code: 'earlier', publicationCode: 'publication-v2', manifestCode: 'manifest-v2', operation: 'WITHDRAW',
        status: 'PENDING', attempts: 0, sequence: 9 });
    invalidations = [];
    await service.reconcile({ tenant: 'default' });
    assert.deepStrictEqual(invalidations, ['earlier', 'later'], 'reconciliation must preserve operation revision ordering');

    events.push({ code: 'expired-lease', publicationCode: 'publication-v2', manifestCode: 'manifest-v2', operation: 'DEPLOY',
        status: 'PROCESSING', attempts: 1, sequence: 11, leaseToken: 'old', leaseUntil: new Date(Date.now() - 1000).toISOString() });
    invalidations = [];
    await service.postInit();
    assert.deepStrictEqual(invalidations, ['expired-lease'], 'Online startup must reclaim and redeliver expired work');
    assert.strictEqual(events.find(item => item.code === 'expired-lease').status, 'DELIVERED');

    role = 'STAGED';
    events.push({ code: 'staged-pending', status: 'PENDING', attempts: 0, sequence: 12 });
    invalidations = [];
    await service.postInit();
    assert.deepStrictEqual(invalidations, [], 'Staged runtime must not consume the Online target outbox');
    console.log('CMS publication outbox reliability validated');
})().catch(error => { console.error(error); process.exit(1); });
