/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/** @module cms/test/publicationHistoryCapacity @description Verifies bounded publication reads across repeated versioned imports. @layer test @owner cms */
const test = require('node:test');
const assert = require('node:assert/strict');
const adapter = require('../src/service/publication/defaultCmsPublicationAdapterService');

function matches(item, query) {
    return Object.entries(query).every(([key, value]) => key === '$and'
        ? value.every(child => matches(item, child))
        : value && typeof value === 'object' && '$nin' in value
            ? !value.$nin.includes(item[key]) : item[key] === value);
}

function fixture(rows, maximum = 3) {
    const calls = [];
    const owner = Object.assign({}, adapter, {
        settings: () => ({ maxDependencies: maximum }),
        error: (code, message) => Object.assign(new Error(message), { code }),
        service: () => ({ get: async request => {
            calls.push(request);
            return { result: rows.filter(item => matches(item, request.query))
                .sort((left, right) => right.versionId - left.versionId).slice(0, request.searchOptions.limit) };
        } }),
    });
    return { owner, calls };
}

test('repeated shared identities cannot hide lower-version capability records', async () => {
    const rows = Array.from({ length: 40 }, (_, index) => ({ code: 'shared', versionId: index + 1, active: true, site: 'selected' }));
    rows.push({ code: 'capability', versionId: 2, active: true, site: 'selected' },
        { code: 'capability', versionId: 1, active: true, site: 'selected' },
        { code: 'other-site', versionId: 100, active: true, site: 'other' });
    const { owner, calls } = fixture(rows);
    const authData = { principalId: 'original-employee' };
    const query = { site: 'selected' };
    const result = await owner.loadLatest('owner', { tenant: 'selected-tenant', authData }, query);
    assert.deepEqual(result.map(item => [item.code, item.versionId]), [['shared', 40], ['capability', 2]]);
    assert.equal(calls.length, 2);
    assert(calls.every(call => call.authData === authData && call.tenant === 'selected-tenant'));
    assert(calls.every(call => call.searchOptions.limit === 3));
    assert.deepEqual(calls[1].query, { $and: [{ active: true, site: 'selected' }, { code: { $nin: ['shared'] } }] });
    assert.deepEqual(query, { site: 'selected' });
});

test('the dependency boundary counts distinct identities, not retained history rows', async () => {
    const rows = ['a', 'b', 'c', 'd'].map(code => ({ code, versionId: 1, active: true }));
    const { owner, calls } = fixture(rows);
    await assert.rejects(owner.loadLatest('owner', {}, {}), { code: 'CMS_PUBLICATION_DEPENDENCY_EXCEEDED' });
    assert.equal(calls.length, 2);
});

test('non-advancing provider evidence rejects instead of looping or truncating', async () => {
    const { owner } = fixture([]);
    owner.service = () => ({ get: async () => ({ result: [1, 2, 3].map(versionId => ({ code: 'same', versionId })) }) });
    await assert.rejects(owner.loadLatest('owner', {}, {}), { code: 'CMS_PUBLICATION_DEPENDENCY_IDENTITY_INVALID' });
});
