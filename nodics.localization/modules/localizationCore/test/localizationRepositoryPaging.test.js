/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
const assert = require('node:assert/strict');
const { test } = require('node:test');
const repository = require('../src/service/defaultLocalizationRepositoryService');

test('reads more than the database default page, scopes reads and rejects overflow', async (t) => {
    const previous = global.CONFIG;
    t.after(() => {
        if (previous === undefined) delete global.CONFIG;
        else global.CONFIG = previous;
    });
    let maximumKeysPerRelease = 1200;
    global.CONFIG = { get: () => ({ authority: { maximumKeysPerRelease } }) };
    const rows = Array.from({ length: 1005 }, (_, index) => ({
        code: String(index).padStart(5, '0'), tenant: 'sample-tenant'
    }));
    const pages = [];
    const service = {
        async get({ tenant, query, searchOptions }) {
            assert.equal(tenant, 'sample-tenant');
            assert.equal(query.tenant, tenant);
            assert.deepEqual(searchOptions.sort, { code: 1 });
            assert.equal(searchOptions.pageNumber, 1);
            pages.push(query.code?.$gt);
            return { result: rows.filter(row => !query.code || row.code > query.code.$gt)
                .slice(0, searchOptions.pageSize || 10) };
        }
    };
    assert.deepEqual(await repository.list(service, { tenant: 'sample-tenant' }, {}), rows);
    assert.deepEqual(pages, [undefined, '00999']);
    maximumKeysPerRelease = 12;
    await assert.rejects(
        repository.list(service, { tenant: 'sample-tenant' }, {}),
        { code: 'ERR_LOC_00005' }
    );
});
