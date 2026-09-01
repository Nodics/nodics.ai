/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const assert = require('node:assert/strict');

/** @module cms/test/cmsPublicationOutboxExperienceConsumerContract @description Verifies optional WCMS Experience indexing is delivered after committed CMS outbox events and remains replayable on failure. @layer test @owner cms */

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
        Object.assign(item, request.model);
        return { result: { modifiedCount: 1 } };
    }
};
let experienceCalls = [];
let experienceShouldFail = false;

global.CONFIG = { get: key => key === 'cms' ? { publication: { runtimeRole: 'ONLINE',
    outbox: { batchSize: 10, maximumAttempts: 10, leaseMs: 1000 } } } : undefined };
global.SERVICE = {
    DefaultCmsPublicationEventOutboxService: generated,
    DefaultCmsDeliveryCacheInvalidationService: { invalidate: async () => true },
    DefaultWcmsExperiencePublicationIndexingService: {
        handlePublicationEvent: async (event) => {
            experienceCalls.push(event.code);
            if (experienceShouldFail) throw new Error('experience indexing unavailable');
            return { indexed: true };
        }
    }
};

const outbox = require('../src/service/publication/defaultCmsPublicationOutboxService');
const request = { tenant: 'default', authData: { tokenType: 'service' }, publicationOperationKey: 'pub:activate:1' };

(async () => {
    const event = await outbox.enqueue('DEPLOY', { code: 'manifest-v1', publicationCode: 'pub' }, request);
    await outbox.deliver(event, request);
    assert.deepEqual(experienceCalls, [event.code]);
    assert.equal(events.find(item => item.code === event.code).status, 'DELIVERED');

    const failing = await outbox.enqueue('DEPLOY', { code: 'manifest-v2', publicationCode: 'pub' },
        Object.assign({}, request, { publicationOperationKey: 'pub:activate:2' }));
    experienceShouldFail = true;
    await assert.rejects(outbox.deliver(failing, request), /experience indexing unavailable/);
    assert.equal(events.find(item => item.code === failing.code).status, 'PENDING');

    experienceShouldFail = false;
    await outbox.reconcile(request);
    assert.equal(events.find(item => item.code === failing.code).status, 'DELIVERED');
    assert.deepEqual(experienceCalls, [event.code, failing.code, failing.code]);

    delete SERVICE.DefaultWcmsExperiencePublicationIndexingService;
    const optional = await outbox.enqueue('DEPLOY', { code: 'manifest-v3', publicationCode: 'pub' },
        Object.assign({}, request, { publicationOperationKey: 'pub:activate:3' }));
    await outbox.deliver(optional, request);
    assert.equal(events.find(item => item.code === optional.code).status, 'DELIVERED');

    console.log('CMS publication outbox WCMS Experience consumer contract validated');
})().catch(error => { console.error(error); process.exit(1); });
