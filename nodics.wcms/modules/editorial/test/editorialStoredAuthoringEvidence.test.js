/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @module editorial/test/editorialStoredAuthoringEvidence
 * @description Exercises saved Editorial validation and Process submission against forged inputs, stale reads and write conflicts.
 * @layer test
 * @owner editorial
 * @override Preserve saved-source authority, exact revision and original actor scope.
 */
const assert = require('node:assert/strict');
const { test, beforeEach } = require('node:test');
const authoring = require('../src/service/defaultEditorialArticleAuthoringService');
const workflow = require('../src/service/defaultEditorialWorkflowAdapterService');
const validation = require('../src/service/defaultEditorialValidationService');
const readiness = require('../src/service/defaultEditorialReadinessService');
const updates = require('../../../../nodics.foundation/modules/nDatabase/database/src/service/procs/update/defaultModelsUpdateInitializerService');

let article, locales, contentType, writes, starts, reads, affected;
const actor = Object.freeze({ principal: 'original-employee' });
const request = (extra = {}) => ({ tenant: 'tenant-a', authData: actor,
    editorial: { article: { code: 'story', revision: 3, status: 'READY' }, ...extra } });
beforeEach(() => {
    article = { code: 'story', revision: 3, status: 'DRAFT', contentTypeCode: 'NEWS',
        internalName: 'Saved name', slug: 'saved-story', siteCodes: ['site'], authorCodes: ['author'] };
    locales = [{ code: 'story-en', articleCode: 'story', revision: 3, localeCode: 'en',
        title: 'Saved title', slug: 'saved-story', body: { blocks: [{ type: 'paragraph', text: 'Saved article copy.' }] }, status: 'READY' }];
    contentType = { code: 'NEWS', active: true, requiredLocaleCodes: ['en'], workflowDefinitionCode: 'ownerReview' };
    writes = []; starts = []; reads = []; affected = 1;
    global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };
    global.CONFIG = { get: name => name === 'editorial' ? {
        publication: { runtimeRole: 'STAGED', maximumDependencies: 100 }, workflow: { definitionCode: 'defaultReview' }
    } : {} };
    const read = (name, value) => async r => { reads.push({ name, request: r }); return { result: structuredClone(value()) }; };
    global.SERVICE = {
        ...require('./helpers/editorialOwnerServices.js'),
        DefaultEditorialArticleAuthoringService: authoring,
        DefaultEditorialValidationService: validation,
        DefaultEditorialReadinessService: readiness,
        DefaultModelsUpdateInitializerService: updates,
        DefaultEditorialArticleService: {
            get: read('article', () => [article]),
            update: async r => { writes.push(r); return { modifiedCount: affected }; }
        },
        DefaultEditorialArticleLocalizationService: { get: read('localizations', () => locales) },
        DefaultEditorialContentTypeService: { get: read('contentType', () => [contentType]) },
        DefaultProcessRuntimeLifecycleService: { startInstance: async r => {
            starts.push(r); return { data: { instance: { code: r.runtimeOperation.instanceCode } } };
        } }
    };
});

test('caller cannot supply missing saved fields or relax required locale policy', async () => {
    article.authorCodes = [];
    contentType.requiredLocaleCodes = ['en', 'ar'];
    const r = request({ article: { ...article, authorCodes: ['forged-author'] },
        localizations: [{ ...locales[0], localeCode: 'ar' }], policy: { requiredLocaleCodes: [] } });
    const result = await authoring.validate(r);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.code === 'REQUIRED_AUTHORS'));
    assert.ok(result.errors.some(e => e.code === 'MISSING_LOCALE' && e.localeCode === 'ar'));
    assert.equal(writes.length, 0);
});

test('validation uses saved copy, preserves request and conditionally marks its exact revision READY', async () => {
    const r = request({ article: { code: 'story', revision: 3, internalName: '', status: 'APPROVED' } });
    const before = structuredClone(r.editorial);
    const result = await authoring.validate(r);
    assert.equal(result.valid, true);
    assert.equal(result.article.internalName, 'Saved name');
    assert.equal(result.article.status, 'READY');
    assert.deepEqual(writes[0].query, { code: 'story', revision: 3, status: 'DRAFT' });
    assert.deepEqual(r.editorial, before);
    for (const { request: r } of reads) { assert.equal(r.tenant, 'tenant-a'); assert.equal(r.authData, actor); }
    assert.equal(writes[0].authData, actor);
});

test('readiness reads saved evidence without writing or starting Process', async () => {
    contentType.requiredLocaleCodes.push('ar');
    const result = await authoring.evaluateReadiness(request({ policy: { requiredLocaleCodes: [] }, localizations: [] }));
    assert.equal(result.ready, false);
    assert.equal(result.workflowStarted, false);
    assert.equal(writes.length, 0); assert.equal(starts.length, 0);
});

test('review submission preserves the actual older publication pointer and source revision without executing publication', async () => {
    article.status = 'READY'; article.publicationCode = 'actual-online-r2'; article.publicationSourceRevision = 2;
    SERVICE.DefaultEditorialArticleService.update = async r => {
        writes.push(r);
        assert.deepEqual(r.query, { code: 'story', revision: 3, status: 'READY' });
        Object.assign(article, structuredClone(r.model.$set || r.model));
        for (const field of Object.keys(r.model.$unset || {})) delete article[field];
        return { code: 'SUC_UPD_00000', result: { modifiedCount: 1 } };
    };
    const result = await workflow.submit(request({ article: { code: 'story', revision: 3, publicationCode: 'forged-pointer', publicationSourceRevision: 3 } }));
    assert.equal(article.status, 'IN_REVIEW'); assert.equal(article.publicationCode, 'actual-online-r2'); assert.equal(article.publicationSourceRevision, 2);
    assert.equal(result.article.publicationCode, 'actual-online-r2'); assert.equal(result.article.publicationSourceRevision, 2);
    assert.equal(starts.length, 1); assert.equal(writes.length, 1); assert.equal(writes[0].authData, actor);
    assert.equal(result.workflowInstanceCode, 'editorial-story-r3');
});

test('stale, unsafe, missing and route-mismatched revisions fail before any write', async () => {
    for (const revision of [2, 0, -1, null, true, '', 1.5, Number.MAX_SAFE_INTEGER + 1]) {
        await assert.rejects(authoring.validate(request({ article: { code: 'story', revision } })));
    }
    const r = request(); r.httpRequest = { params: { articleCode: 'another-story' } };
    await assert.rejects(authoring.validate(r));
    assert.equal(writes.length, 0);
});

test('denied, missing and malformed saved reads cannot become ready evidence', async () => {
    for (const response of [{}, { result: [] }, { result: [article, article] }, { result: [{ ...article, code: 'other' }] }]) {
        SERVICE.DefaultEditorialArticleService.get = async () => response;
        await assert.rejects(authoring.validate(request()));
    }
    SERVICE.DefaultEditorialArticleService.get = async () => { throw new Error('owner denied'); };
    await assert.rejects(authoring.validate(request()), /owner denied/);
    assert.equal(writes.length, 0);
});

test('inactive/missing type and foreign/duplicate/overflow locales fail closed', async () => {
    contentType.active = false;
    await assert.rejects(authoring.validate(request()));
    contentType.active = true;
    for (const rows of [[{ ...locales[0], articleCode: 'other' }], [{ ...locales[0], revision: 2 }],
        [locales[0], { ...locales[0], code: 'duplicate' }], Array.from({ length: 101 }, (_, i) => ({ ...locales[0], localeCode: 'l' + i }))]) {
        locales = rows;
        await assert.rejects(authoring.validate(request()));
    }
    assert.equal(writes.length, 0);
});

test('validation cannot claim READY after a concurrent change or unknown write acknowledgement', async () => {
    for (const count of [0, 2, undefined]) {
        affected = count;
        await assert.rejects(authoring.validate(request()), /changed|confirm|inspect/i);
    }
});

test('an active review or published source cannot be reset by validation', async () => {
    for (const status of ['IN_REVIEW', 'APPROVED', 'PUBLISHED', 'WITHDRAWN', 'ARCHIVED']) {
        article.status = status;
        await assert.rejects(authoring.validate(request()));
    }
    assert.equal(writes.length, 0);
});

test('Online runtime cannot admit authoring evidence operations', async () => {
    CONFIG.get = () => ({ publication: { runtimeRole: 'ONLINE', maximumDependencies: 100 } });
    await assert.rejects(authoring.validate(request()));
    assert.equal(reads.length, 0);
});

test('valid withdrawn copy is not evidence that its revision can begin another review', async () => {
    article.status = 'WITHDRAWN';
    const result = await authoring.evaluateReadiness(request());
    assert.equal(result.validation.valid, true);
    assert.equal(result.ready, false);
    assert.equal(result.articleStatus, 'WITHDRAWN');
    assert.equal(result.blockers[0].code, 'ARTICLE_STATE_NOT_ELIGIBLE');
    assert.equal(writes.length, 0);
});

test('forged READY status or supplied locale policy cannot start review', async () => {
    await assert.rejects(workflow.submit(request()));
    article.status = 'READY'; contentType.requiredLocaleCodes.push('ar');
    await assert.rejects(workflow.submit(request({ policy: { requiredLocaleCodes: [] } })));
    assert.equal(starts.length, 0); assert.equal(writes.length, 0);
});

test('review uses current owner workflow and saved revision/name under original scope', async () => {
    article.status = 'READY';
    const result = await workflow.submit(request({ workflowDefinitionCode: 'untrustedWorkflow' }));
    assert.equal(starts[0].runtimeOperation.definitionCode, 'ownerReview');
    assert.equal(starts[0].runtimeOperation.instanceCode, 'editorial-story-r3');
    assert.equal(starts[0].runtimeOperation.name, 'Editorial review: Saved name');
    assert.equal(starts[0].authData, actor);
    assert.deepEqual(writes[0].query, { code: 'story', revision: 3, status: 'READY' });
    assert.equal(result.article.status, 'IN_REVIEW');
});

test('wrong Process receipt never mutates article; post-start CAS conflict reports inspection', async () => {
    article.status = 'READY';
    SERVICE.DefaultProcessRuntimeLifecycleService.startInstance = async () => ({ data: { instance: { code: 'wrong-instance' } } });
    await assert.rejects(workflow.submit(request()));
    assert.equal(writes.length, 0);
    SERVICE.DefaultProcessRuntimeLifecycleService.startInstance = async r => ({ data: { instance: { code: r.runtimeOperation.instanceCode } } });
    affected = 0;
    await assert.rejects(workflow.submit(request()), /inspect/i);
});
