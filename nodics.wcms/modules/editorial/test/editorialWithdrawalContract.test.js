/* @module editorial/test/editorialWithdrawalContract @description Protects exact Editorial withdrawal correlation and owner revision authority. @layer test @owner editorial */
const assert = require('node:assert/strict');
const { test, beforeEach } = require('node:test');
const service = require('../src/service/defaultEditorialPublicationService');
class NodicsError extends Error { constructor(code, message) { super(message); this.code = code; } }
let article, publication, calls, request;
beforeEach(() => {
    global.CLASSES = { NodicsError };
    article = { code: 'article-a', revision: 1, status: 'PUBLISHED', publicationCode: 'publication-a' };
    publication = { code: 'publication-a', domain: 'editorial', rootType: 'article', rootCode: 'article-a', sourceVersion: '1', state: 'ONLINE', revision: 5 };
    calls = [];
    request = { tenant: 'tenant-a', authData: { loginId: 'author-a' }, httpRequest: { params: { articleCode: 'article-a' } }, editorial: { publicationCode: 'publication-a', expectedRevision: 5 } };
    global.SERVICE = {
        DefaultEditorialArticleService: {
            get: async input => { calls.push(['article', input]); return { code: 'SUC_FIND_00000', result: [{ ...article }] }; },
            update: async input => { calls.push(['update', input]); article = { ...article, ...input.model }; return { code: 'SUC_UPD_00000', modified: 1 }; }
        },
        DefaultModelsUpdateInitializerService: { getAffectedCount: result => result.modified },
        DefaultPublicationLifecycleService: {
            get: async input => { calls.push(['publication', input]); return { ...publication }; },
            withdraw: async input => { calls.push(['withdraw', input]); if (Number(input.expectedRevision) !== publication.revision) throw new NodicsError('ERR_PUB_00004', 'Publication revision conflict'); return { ...publication, state: 'WITHDRAWN', revision: 7 }; }
        }
    };
});
test('exact native route and lifecycle evidence precede a scoped article state update', async () => {
    const result = await service.withdraw(request);
    assert.equal(result.state, 'WITHDRAWN'); assert.equal(result.article.status, 'WITHDRAWN');
    assert.equal(result.article.publicationCode, 'publication-a');
    assert.deepEqual(calls.map(x => x[0]), ['article', 'publication', 'withdraw', 'update', 'article']);
    for (const [, input] of calls) { assert.equal(input.tenant, request.tenant); assert.equal(input.authData, request.authData); }
    assert.equal(calls[2][1].expectedRevision, 5);
    assert.deepEqual(calls[3][1].query, { code: 'article-a', revision: 1, publicationCode: 'publication-a', status: 'PUBLISHED' });
});
test('generic Axis model uses the actual article reference and accepts zero publication revision', async () => {
    publication.revision = 0; request.editorial = { model: { code: 'article-a', revision: 1 }, publicationCode: 'publication-a', expectedRevision: '0' };
    await service.withdraw(request); assert.equal(calls[2][1].expectedRevision, 0);
});
test('missing and malformed expected revisions fail before owner mutation', async () => {
    for (const revision of [undefined, null, false, '', '1.5', -1, Number.MAX_SAFE_INTEGER + 1]) {
        request.editorial.expectedRevision = revision;
        await assert.rejects(service.withdraw(request));
    }
    assert.equal(calls.filter(x => x[0] === 'withdraw' || x[0] === 'update').length, 0);
});
test('route, supplied model and publication reference cannot select another article', async () => {
    request.editorial.model = { code: 'article-b', revision: 1 };
    await assert.rejects(service.withdraw(request));
    request.editorial.model = { code: 'article-a', revision: 2 };
    await assert.rejects(service.withdraw(request));
    delete request.editorial.model; request.editorial.publicationCode = 'other-publication';
    await assert.rejects(service.withdraw(request));
    assert.equal(calls.filter(x => x[0] === 'withdraw' || x[0] === 'update').length, 0);
});
test('domain, root, source revision and pointer must match actual owner records', async () => {
    for (const patch of [{ code: 'other' }, { domain: 'cms' }, { rootType: 'page' }, { rootCode: 'other' }, { sourceVersion: '2' }, { state: 'FAILED' }]) {
        const original = { ...publication }; Object.assign(publication, patch);
        await assert.rejects(service.withdraw(request)); publication = original;
    }
    assert.equal(calls.filter(x => x[0] === 'withdraw' || x[0] === 'update').length, 0);
});
test('stale publication concurrency and owner denial never alter article state', async () => {
    request.editorial.expectedRevision = 4;
    await assert.rejects(service.withdraw(request), /publication changed/);
    assert.equal(calls.filter(x => x[0] === 'update').length, 0);
    SERVICE.DefaultEditorialArticleService.get = async () => { throw new Error('Access denied'); };
    await assert.rejects(service.withdraw(request), /Access denied/);
});
test('already withdrawn owner evidence can reconcile only the same article without another lifecycle write', async () => {
    publication.state = 'WITHDRAWN'; publication.revision = 7; request.editorial.expectedRevision = 7;
    const result = await service.withdraw(request);
    assert.equal(result.state, 'WITHDRAWN'); assert.equal(result.article.status, 'WITHDRAWN');
    assert.equal(calls.filter(x => x[0] === 'withdraw').length, 0);
});
test('a changed article after lifecycle completion is an explicit reconciliation failure', async () => {
    SERVICE.DefaultEditorialArticleService.update = async () => ({ modified: 0 });
    await assert.rejects(service.withdraw(request), /article changed/i);
});
test('withdrawing a retained older copy preserves the current draft and its review revision', async () => {
    article.status = 'DRAFT'; article.revision = 2; article.publicationSourceRevision = 1;
    request.editorial.article = { code: 'article-a', revision: 2 };
    const result = await service.withdraw(request);
    assert.equal(result.state, 'WITHDRAWN');
    assert.equal(result.article.status, 'DRAFT'); assert.equal(result.article.revision, 2);
    assert.equal(result.article.publicationSourceRevision, 1);
    assert.equal(calls.filter(row => row[0] === 'update').length, 0);
    assert.equal(calls.filter(row => row[0] === 'article').length, 2);
});

function restoredDeployment() {
    article = { ...article, revision: 3, status: 'DRAFT', publicationCode: 'newest-request', publicationSourceRevision: 2 };
    publication.targetVersion = 'older-en-1'; publication.activationOperation = { key: 'older-activation' };
    SERVICE.DefaultEditorialOnlineProjectionService = { getDeployment: async input => {
        assert.equal(input, article.code);
        return { status: 'DEPLOYED', code: publication.code, sourceRevision: 1, version: publication.targetVersion, activationKey: 'older-activation', revision: 3 };
    } };
}
test('owner-proven restored deployment can be withdrawn while the newer source and latest request are preserved', async () => {
    restoredDeployment();
    const result = await service.withdraw(request);
    assert.equal(result.state, 'WITHDRAWN'); assert.deepEqual(result.article, article);
    assert.equal(calls.filter(row => row[0] === 'withdraw').length, 1);
    assert.equal(calls.filter(row => row[0] === 'update').length, 0);
});
for (const change of [{ status: 'UNKNOWN' }, { code: 'other' }, { sourceRevision: 2 }, { version: 'other' }, { activationKey: 'other' }]) {
    test('restored withdrawal holds unverified or changed deployment ' + JSON.stringify(change), async () => {
        restoredDeployment();
        const read = SERVICE.DefaultEditorialOnlineProjectionService.getDeployment;
        SERVICE.DefaultEditorialOnlineProjectionService.getDeployment = async input => ({ ...await read(input), ...change });
        await assert.rejects(service.withdraw(request), /deployment changed or is unverified/);
        assert.equal(calls.filter(row => ['withdraw', 'update'].includes(row[0])).length, 0);
    });
}
test('a lost restored-withdrawal response reconciles exact terminal owner evidence without rewriting the newer source', async () => {
    restoredDeployment(); publication.state = 'WITHDRAWN'; publication.revision = 7; request.editorial.expectedRevision = 7;
    delete SERVICE.DefaultEditorialOnlineProjectionService;
    assert.deepEqual((await service.withdraw(request)).article, article);
    assert.equal(calls.filter(row => ['withdraw', 'update'].includes(row[0])).length, 0);
});
test('negative or ambiguous source envelopes cannot authorize withdrawal', async () => {
    for (const response of [{ code: 'ERR_FIND_00001', result: [article] }, { code: 'SUC_FIND_00000', acknowledged: false, result: [article] },
        { code: 'SUC_FIND_00000', result: [article, article] }]) {
        SERVICE.DefaultEditorialArticleService.get = async () => response;
        await assert.rejects(service.withdraw(request));
    }
    assert.equal(calls.length, 0);
});
