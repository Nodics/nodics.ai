/*
    Nodics - Enterprice Micro-Services Management Framework
    Copyright (c) 2026 Nodics All rights reserved.
    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.
 */
/** @module export/test/exportSelectionBounds @description Exercises authoritative source paging, configured limits and fail-closed artifact generation. @layer test @owner export */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const definition = require('../src/service/DataExportService');
const defaults = require('../config/properties').dataExport;

/** Supplies independent pages while leaving the actual normalizer and collector active. */
function runtime(pages) {
    global.CONFIG = { get: key => key === 'dataExport' ? { ...defaults, maximumRecords: 3, pageSize: 2 } : undefined };
    global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };
    const reads = [];
    global.SERVICE = { DefaultSchemaSafeQueryService: { searchGenerated: async request => {
        reads.push(request); return pages[reads.length - 1];
    } } };
    return { service: { ...definition }, reads };
}
const descriptor = { queryCapabilities: { maximumPageSize: 2, allowedPageSizes: [2], defaultPageSize: 2 } };
const request = { tenant: 'tenant-a', enterpriseCode: 'enterprise-a', authData: { loginId: 'reader' } };
const payload = { moduleName: 'business', schemaName: 'record', pageSize: 2, maximumRecords: 3,
    query: { search: 'chosen', sort: { field: 'code', direction: 'ASC' } } };

test('configured bounds cannot be widened by a caller and paging preserves the original selection', async () => {
    const x = runtime([{ data: { records: [{ code: 'a' }, { code: 'b' }], totalCount: 4 } },
        { data: { records: [{ code: 'c' }, { code: 'd' }], totalCount: 4 } }]);
    const normalized = x.service.normalizeRequest({ ...request, export: { moduleName: 'business', schemaName: 'record',
        format: 'json', maximumRecords: 999999, pageSize: 999999, query: payload.query } });
    assert.equal(normalized.maximumRecords, 3); assert.equal(normalized.pageSize, 2);
    const records = await x.service.collectRecords(request, normalized, descriptor);
    assert.deepEqual(Array.from(records, row => row.code), ['a', 'b', 'c']);
    assert.equal(records.totalCount, 4); assert.equal(records.truncated, true);
    assert.deepEqual(x.reads.map(read => read.browserQuery.pageNumber), [1, 2]);
    assert.ok(x.reads.every(read => read.authData === request.authData && read.browserQuery.search === 'chosen'));
});

test('an acknowledged empty selection is valid; failed or malformed source evidence cannot become an empty export', async () => {
    const empty = runtime([{ data: { records: [], totalCount: 0 } }]);
    const records = await empty.service.collectRecords(request, payload, descriptor);
    assert.equal(records.length, 0); assert.equal(records.truncated, false);
    for (const bad of [{}, { status: 'FAILED', data: { records: [], totalCount: 0 } },
        { code: 'ERR_SOURCE_00001', data: { records: [], totalCount: 0 } },
        { data: { records: [], totalCount: 5 } }, { data: { records: [], totalCount: '0' } },
        { data: { records: [{ code: 'a' }], totalCount: 0 } }]) {
        const x = runtime([bad]);
        await assert.rejects(x.service.collectRecords(request, payload, descriptor), { code: 'ERR_EXP_00001' });
    }
});

test('changed totals or a response from another page stop before artifact creation', async () => {
    for (const second of [{ data: { records: [{ code: 'c' }], totalCount: 3 } },
        { data: { records: [{ code: 'c' }], totalCount: 4, pageNumber: 1 } }]) {
        const x = runtime([{ data: { records: [{ code: 'a' }, { code: 'b' }], totalCount: 4 } }, second]);
        await assert.rejects(x.service.collectRecords(request, payload, descriptor), { code: 'ERR_EXP_00001' });
    }
});


test('simultaneous identical exports receive independent governed Media identities despite equal display names and bytes', async () => {
    const x = runtime([]), calls = [];
    global.SERVICE.DefaultMediaUploadService = { upload: async request => { calls.push(request); return { code: request.mediaCode }; } };
    const rendered = { fileName: 'record-export-20261106062402.csv', originalFileName: 'record-export-20261106062402.csv', mimeType: 'text/csv', buffer: Buffer.from('code\na\n') };
    const results = await Promise.all([1, 2].map(() => x.service.storeMedia(request, { ...payload, enterpriseCode: 'enterprise-a' }, rendered)));
    assert.notEqual(results[0].code, results[1].code);
    assert.ok(results.every(row => /^data-export-[a-f0-9-]{36}$/.test(row.code)));
    assert.ok(calls.every(call => call.tenant === request.tenant && call.authData === request.authData && call.enterpriseCode === 'enterprise-a' && call.files[0].buffer === rendered.buffer));
    assert.equal(calls[0].name, calls[1].name);
});
