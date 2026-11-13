/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/** @module backoffice/test/registrationGroupSnapshot @description Exercises complete project/tenant paging and serial revision guards when reconciling structural runtime declarations. @owner backoffice @layer test */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const definition = require('../src/service/registry/defaultFunctionalModuleCatalogueService');

function fixture(failPage = false, conflict = false) {
    global.CONFIG = { get: key => key === 'backofficeFunctionalModuleCatalogue' ? { eligibilityPageSize: 2 }
        : key === 'defaultTenant' ? 'tenant-a' : key === 'moduleIdentityAliases' ? {} : undefined };
    global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message || code); this.code = code; } } };
    const auth = { service: 'original-runtime' }, persistence = { service: 'catalogue-owner' };
    const reads = [], writes = [];
    const rows = [
        { code: 'project-a::group-0', projectCode: 'project-a', functionalModule: 'group-0', catalogueRevision: 4 },
        { code: 'project-a::group-1', projectCode: 'project-a', functionalModule: 'group-1', compositionOnly: true, catalogueRevision: 3 },
        { code: 'project-a::unrelated', projectCode: 'project-a', functionalModule: 'unrelated', catalogueRevision: 8 },
    ];
    const owner = { ...definition,
        getPersistenceAuthData: supplied => { assert.equal(supplied, auth); return persistence; },
        getRecords: async read => {
            assert.equal(read.tenant, 'tenant-a'); assert.equal(read.authData, persistence);
            assert.deepEqual(read.query, { projectCode: 'project-a' });
            reads.push(read.searchOptions.pageNumber);
            if (failPage && read.searchOptions.pageNumber === 2) throw new Error('later page unavailable');
            const start = (read.searchOptions.pageNumber - 1) * read.searchOptions.pageSize;
            return { result: structuredClone(rows.slice(start, start + read.searchOptions.pageSize)) };
        },
        getRecord: async () => { throw new Error('one database lookup per structural group'); },
        updateRecord: async write => {
            assert.equal(write.tenant, 'tenant-a'); assert.equal(write.authData, persistence);
            writes.push(write);
            return { result: { matchedCount: conflict ? 0 : 1, modifiedCount: conflict ? 0 : 1 } };
        },
    };
    const batch = { project: 'project-a', registrations: Array.from({ length: 60 }, (_, index) =>
        ({ moduleName: 'group-' + index, moduleKind: 'group' })) };
    return { owner, auth, batch, reads, writes, rows };
}

test('one complete scoped snapshot replaces repeated structural-group lookups', async () => {
    const f = fixture();
    assert.deepEqual(await f.owner.reconcileRuntimeBatch(f.batch, f.auth), []);
    assert.deepEqual(f.reads, [1, 2]);
    assert.equal(f.writes.length, 1);
    assert.deepEqual(f.writes[0].query, { code: 'project-a::group-0', catalogueRevision: 4 });
    assert.deepEqual(f.writes[0].model, { compositionOnly: true, catalogueRevision: 5 });
});

test('an incomplete later page causes no structural writes', async () => {
    const f = fixture(true);
    await assert.rejects(f.owner.reconcileRuntimeBatch(f.batch, f.auth), /later page unavailable/);
    assert.equal(f.writes.length, 0);
});

test('a concurrent decision rejects the structural mark without changing the revision guard', async () => {
    const f = fixture(false, true);
    await assert.rejects(f.owner.reconcileRuntimeBatch(f.batch, f.auth), /changed concurrently/);
    assert.equal(f.writes.length, 1);
    assert.equal(f.writes[0].query.catalogueRevision, 4);
});


test('legacy and canonical structural aliases mark the same confirmed row once', async () => {
    const f = fixture();
    const config = CONFIG.get;
    CONFIG.get = key => key === 'moduleIdentityAliases' ? { 'nodics.core': 'nodics.foundation' } : config(key);
    f.rows.splice(0, f.rows.length, { code: 'project-a::nodics.core', projectCode: 'project-a',
        functionalModule: 'nodics.core', catalogueRevision: 4 });
    f.batch.registrations = ['nodics.core', 'nodics.foundation'].map(moduleName => ({ moduleName, moduleKind: 'group' }));
    await f.owner.reconcileRuntimeBatch(f.batch, f.auth);
    assert.equal(f.writes.length, 1);
    assert.deepEqual(f.writes[0].query, { code: 'project-a::nodics.core', catalogueRevision: 4 });
});
