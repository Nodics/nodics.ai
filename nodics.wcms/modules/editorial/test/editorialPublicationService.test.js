/*
    Nodics - Enterprise Micro-Services Management Framework
    Copyright (c) 2026 Nodics All rights reserved.
    Governed by the root LICENSE or a separate written agreement with Nodics.
 */
/** @module editorial/test/editorialPublicationService @description Qualifies persisted source ownership before lifecycle effects and exact completion after Online evidence, including uncertain acknowledgements. @layer test @owner editorial */
const assert = require('node:assert/strict');
const { test, beforeEach } = require('node:test');
const service = require('../src/service/defaultEditorialPublicationService');
const updateOwner = require('../../../../nodics.foundation/modules/nDatabase/database/src/service/procs/update/defaultModelsUpdateInitializerService');
let article, calls, output, beforeUpdate, publishHook, updateResponse, readResponse;
const request = () => ({ tenant: 'default', authData: { loginId: 'original' }, editorial: { article: { code: 'article', revision: 2, status: 'APPROVED' } } });
const pathValue = (row, path) => path.split('.').reduce((value, field) => value?.[field], row);
beforeEach(() => {
    article = { code: 'article', revision: 2, status: 'APPROVED', workflowInstanceCode: 'editorial-article-r2' };
    calls = []; output = undefined; beforeUpdate = undefined; publishHook = undefined; updateResponse = undefined; readResponse = undefined;
    global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };
    global.SERVICE = {
        DefaultModelsUpdateInitializerService: updateOwner,
        DefaultEditorialArticleService: {
            get: async input => readResponse || ({ code: 'SUC_FIND_00000', result: article.code === input.query.code && article.revision === input.query.revision ? [structuredClone(article)] : [] }),
            update: async input => {
                calls.push(['article', input]); beforeUpdate?.(input);
                const matches = Object.entries(input.query).every(([field, value]) => value && typeof value === 'object' && '$exists' in value
                    ? Object.hasOwn(article, field) === value.$exists : pathValue(article, field) === value);
                if (matches) {
                    Object.assign(article, structuredClone(input.model.$set || input.model));
                    for (const field of Object.keys(input.model.$unset || {})) delete article[field];
                }
                return updateResponse?.(input, matches) || { code: 'SUC_UPD_00000', result: { modifiedCount: matches ? 1 : 0 } };
            }
        },
        DefaultPublicationLifecycleService: { publishApproved: async input => {
            calls.push(['publish', input]); await publishHook?.(input); return output || { ...input.publication, state: 'ONLINE' };
        } }
    };
});

test('exact source request is retained before lifecycle effects and cleared only after confirmed Online/source completion', async () => {
    article.publicationCode = 'older-online'; article.publicationSourceRevision = 1;
    publishHook = async () => {
        assert.deepEqual(article.publicationIntent, { contractVersion: 1, code: 'editorial-article-r2', sourceRevision: 2 });
        assert.equal(article.publicationCode, 'older-online'); assert.equal(article.publicationSourceRevision, 1);
    };
    const result = await service.publishApproved(request());
    assert.equal(result.state, 'ONLINE'); assert.equal(result.article.status, 'PUBLISHED'); assert.equal(result.article.publicationSourceRevision, 2);
    assert.equal(result.article.publicationIntent, undefined);
    assert.deepEqual(calls.map(row => row[0]), ['article', 'publish', 'article']);
    assert.equal(calls[1][1].publication.workflowRef, 'editorial-article-r2');
    assert.equal(calls[0][1].query.publicationIntent.$exists, false);
    assert.equal(calls[2][1].query['publicationIntent.code'], 'editorial-article-r2');
    assert(calls.every(row => row[1].authData.loginId === 'original' && row[1].tenant === 'default'));
});

test('forged approval, stale source and route mismatch cannot retain an intent or publish', async () => {
    article.status = 'DRAFT'; await assert.rejects(service.publishApproved(request()));
    article.status = 'APPROVED'; article.revision = 3; await assert.rejects(service.publishApproved(request()));
    const r = request(); r.httpRequest = { params: { articleCode: 'another' } };
    await assert.rejects(service.publishApproved(r)); assert.equal(calls.length, 0);
});

test('draft save or archive that wins the root fence prevents all nPublish effects', async () => {
    beforeUpdate = input => { if (input.model.publicationIntent) { article.revision = 3; article.status = 'DRAFT'; } };
    await assert.rejects(service.publishApproved(request()), /inspect/i);
    assert.equal(calls.some(row => row[0] === 'publish'), false); assert.equal(article.publicationIntent, undefined);
});

test('another or malformed retained request cannot be overwritten', async () => {
    for (const intent of [null, { contractVersion: 1, code: 'other', sourceRevision: 2 }, { contractVersion: 1, code: 'editorial-article-r2', sourceRevision: 1 }]) {
        article.publicationIntent = intent;
        const r = request(); r.editorial.publicationCode = 'editorial-article-r2';
        await assert.rejects(service.publishApproved(r), /retained/);
    }
    assert.equal(calls.length, 0);
});

test('a custom original request is resumed by its retained code rather than replaced by a generated default', async () => {
    article.publicationIntent = { sourceRevision: 2, code: 'original-custom-request', contractVersion: 1 };
    const result = await service.publishApproved(request());
    assert.equal(result.code, 'original-custom-request'); assert.equal(calls[0][1].publication.code, 'original-custom-request');
    assert.equal(calls.filter(row => row[0] === 'article').length, 1, 'resumption does not claim a replacement request');
});

test('lost claim acknowledgement retains the exact inspectable request and never dispatches an uncertain claim', async () => {
    updateResponse = () => { throw new Error('Claim response lost'); };
    await assert.rejects(service.publishApproved(request()), /response lost/);
    assert.equal(article.publicationIntent.code, 'editorial-article-r2'); assert.equal(calls.some(row => row[0] === 'publish'), false);
    updateResponse = undefined;
    const result = await service.publishApproved(request());
    assert.equal(result.article.status, 'PUBLISHED'); assert.equal(calls.filter(row => row[0] === 'publish').length, 1);
});

test('lifecycle uncertainty retains intent and older Online reference; only the same request can resume', async () => {
    article.publicationCode = 'older-online'; article.publicationSourceRevision = 1;
    publishHook = async () => { throw new Error('Owner outcome unknown'); };
    await assert.rejects(service.publishApproved(request()), /outcome unknown/);
    assert.equal(article.status, 'APPROVED'); assert.equal(article.publicationIntent.code, 'editorial-article-r2'); assert.equal(article.publicationCode, 'older-online');
    const another = request(); another.editorial.publicationCode = 'new-code';
    await assert.rejects(service.publishApproved(another), /retained/);
    publishHook = undefined;
    assert.equal((await service.publishApproved(request())).article.status, 'PUBLISHED');
});

test('wrong nPublish acknowledgement cannot fabricate source completion or discard the retained request', async () => {
    for (const patch of [{ state: 'FAILED' }, { rootCode: 'other' }, { sourceVersion: '1' }, { domain: 'cms' }]) {
        output = { code: 'editorial-article-r2', domain: 'editorial', rootType: 'article', rootCode: 'article', sourceVersion: '2', state: 'ONLINE', ...patch };
        await assert.rejects(service.publishApproved(request()), error => error.code === 'ERR_EDT_00008');
        assert.equal(article.status, 'APPROVED'); assert.equal(article.publicationIntent.code, 'editorial-article-r2');
    }
    assert.equal(calls.filter(row => row[0] === 'article').length, 1);
});

test('Online target followed by a source completion conflict retains exact recovery identity', async () => {
    publishHook = async () => { article.status = 'CHANGES_REQUESTED'; };
    await assert.rejects(service.publishApproved(request()), /source completion is unconfirmed/);
    assert.equal(calls.filter(row => row[0] === 'publish').length, 1); assert.equal(article.publicationIntent.code, 'editorial-article-r2');
});

test('negative or missing saved evidence cannot claim publication authority', async () => {
    for (const response of [{ code: 'ERR_AUTH_00003', result: [article] }, { result: [article] }, { code: 'SUC_FIND_00000', success: false, result: [article] }]) {
        readResponse = response; await assert.rejects(service.publishApproved(request()));
    }
    assert.equal(calls.length, 0);
});
