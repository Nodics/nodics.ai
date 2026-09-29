/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module nPublish/test/publicationWorkflowProvider @description Qualifies domain approval selection, legacy fallback and fail-closed provider resolution. @owner nPublish @layer test */
const assert = require('node:assert/strict');
const { test, after } = require('node:test');
const lifecycle = require('../src/service/defaultPublicationLifecycleService');
const previous = { CONFIG: global.CONFIG, SERVICE: global.SERVICE, CLASSES: global.CLASSES };
after(() => {
    for (const [key, value] of Object.entries(previous)) {
        if (value === undefined) delete global[key];
        else global[key] = value;
    }
});

function fixture() {
    const calls = [];
    const fallback = { requestApproval: async item => calls.push('legacy:' + item.code) };
    const selected = { reference: item => 'review-' + item.code, requestApproval: async item => calls.push('owner:' + item.code) };
    const providers = { workflowProvider: fallback, workflowProviders: { example: 'ExampleWorkflow' } };
    global.CONFIG = { get: () => ({ providers }) };
    global.SERVICE = { ExampleWorkflow: selected };
    global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };
    const publication = { code: 'release-a', domain: 'example', state: 'VALIDATED', revision: 2 };
    const service = Object.assign({}, lifecycle, {
        getRepository: () => ({ get: async () => publication }),
        transition: async (item, state, request, patch) => {
            calls.push('transition');
            Object.assign(publication, patch, { state, revision: item.revision + 1 });
            return publication;
        }
    });
    return { service, providers, fallback, selected, calls, publication };
}

test('domain selection takes precedence while unrelated and legacy-only domains preserve fallback', () => {
    const f = fixture();
    assert.equal(f.service.getWorkflowProvider('example'), f.selected);
    assert.equal(f.service.getWorkflowProvider('legacy'), f.fallback);
    delete f.providers.workflowProviders;
    assert.equal(f.service.getWorkflowProvider('example'), f.fallback);
    f.providers.workflowProvider = null;
    assert.equal(f.service.getWorkflowProvider('example'), null);
});

test('explicit missing, null and malformed workflow overrides reject before changing state', async () => {
    for (const value of ['MissingWorkflow', null, {}]) {
        const f = fixture();
        f.providers.workflowProviders.example = value;
        await assert.rejects(f.service.requestApproval({ publicationCode: 'release-a', expectedRevision: 2 }), { code: 'ERR_PUB_00001' });
        assert.deepEqual(f.calls, []);
        assert.equal(f.publication.state, 'VALIDATED');
    }
});

test('approval and pending replay use the same owning workflow without another transition', async () => {
    const f = fixture();
    const request = { publicationCode: 'release-a', expectedRevision: 2 };
    const pending = await f.service.requestApproval(request);
    assert.equal(pending.workflowRef, 'review-release-a');
    await f.service.requestApproval(request);
    assert.deepEqual(f.calls, ['transition', 'owner:release-a', 'owner:release-a']);
});
