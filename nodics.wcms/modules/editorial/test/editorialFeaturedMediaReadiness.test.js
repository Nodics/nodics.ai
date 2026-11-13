/*
    Nodics - Enterprice Micro-Services Management Framework
    Copyright (c) 2026 Nodics All rights reserved.
    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.
 */
/** @module editorial/test/featuredMediaReadiness @description Exercises the actual Editorial-to-Media dependency consumer without publication or storage writes. @layer test @owner editorial */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const featured = require('../src/service/defaultEditorialFeaturedMediaService');
const readiness = require('../src/service/defaultEditorialReadinessService');
const validation = require('../src/service/defaultEditorialValidationService');
const publication = require('../src/service/defaultEditorialPublicationService');
const media = require('../../media/src/service/publication/defaultMediaDependencyReadinessService');
const library = require('../../media/src/service/defaultMediaLibraryService');
const defaults = require('../config/properties').editorial;

/** Controlled owner ports retain real dependency, scope and content-readiness implementations. */
function fixture(change = {}) {
    const state = { pointer: true, intact: true, drift: false, metadataReads: 0, pointerReads: 0, writes: 0, ...change };
    const asset = { code: 'image-a', active: true, status: 'READY', versionId: 2, enterpriseCode: 'business-a',
        checksum: 'a'.repeat(64), checksumAlgorithm: 'sha256', sizeBytes: 42, mimeType: 'image/png',
        access: 'PUBLIC', legalHold: false, ...change.asset };
    const request = { tenant: 'tenant-a', authData: { entCode: 'business-a' }, editorial: { article: { code: 'article-a', revision: 1 } } };
    const article = { code: 'article-a', revision: 1, status: 'APPROVED', featuredMediaCode: asset.code,
        contentTypeCode: 'BLOG', internalName: 'Article', slug: 'article-a', siteCodes: ['site-a'], authorCodes: ['author-a'] };
    global.CONFIG = { get: key => key === 'editorial' ? defaults : key === 'media'
        ? { publication: { versionProviderEnabled: true, maximumAssets: 1 } } : undefined };
    global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };
    global.SERVICE = {
        DefaultEditorialFeaturedMediaService: featured,
        DefaultEditorialValidationService: validation,
        DefaultMediaDependencyReadinessService: media,
        DefaultMediaLibraryService: library,
        DefaultMediaPublicationReviewService: { handoff: code => ({ handoff: { owner: 'media', query: { mediaCode: code }, automaticExecution: false } }) },
        DefaultMediaService: { get: async input => {
            assert.equal(input.tenant, request.tenant); assert.equal(input.authData, request.authData);
            state.metadataReads++;
            return { code: 'SUC_FIND_00000', result: [{ ...asset, ...(state.drift && state.metadataReads > 1 ? { versionId: 3 } : {}) }] };
        } },
        DefaultMediaPublicationVersionProviderService: {
            getOnlineVersions: async codes => {
                state.pointerReads++;
                return { statuses: codes.map(mediaCode => ({ mediaCode, status: !state.pointer ? null : {
                    version: state.pointerChanged && state.pointerReads > 1 ? 'c'.repeat(64) : 'b'.repeat(64), revision: 1 } })) };
            },
            getVersion: async () => ({ code: 'b'.repeat(64), artifacts: { asset: { ...asset, ...(state.oldVersion ? { versionId: 1 } : {}) } } }),
            reconcileVersions: async selection => ({ results: selection.map(item => ({ ...item, intact: state.intact,
                active: true, protected: true, repaired: false, deleted: false })) }),
        },
        DefaultEditorialArticleService: { update: () => { state.writes++; throw Error('No source write is allowed'); } },
        DefaultPublicationLifecycleService: { publishApproved: () => { state.writes++; throw Error('No publication is allowed'); } },
    };
    return { state, asset, request, article };
}

test('an exact public image requires retained metadata, verified bytes and an unchanged activation pointer', async () => {
    const x = fixture(), result = await featured.evaluate(x.request, x.article);
    assert.equal(result.ready, true); assert.equal(result.dependency.status, 'ACTIVE');
    assert.equal(result.dependency.storedBytesVerified, true); assert.equal(x.state.metadataReads, 2);
    assert.equal(x.state.pointerReads, 2); assert.equal(x.state.writes, 0);
});

test('unapproved Media provides an inert exact inspection handoff and blocks article publication before its intent claim', async () => {
    const x = fixture({ pointer: false }), result = await featured.evaluate(x.request, x.article);
    assert.equal(result.ready, false); assert.equal(result.dependency.status, 'NOT_ACTIVATED');
    assert.equal(result.dependency.handoff.query.mediaCode, x.asset.code);
    assert.equal(result.dependency.handoff.automaticExecution, false);
    const owner = { ...publication, savedSource: async () => x.article };
    await assert.rejects(owner.publishApproved(x.request), { code: 'ERR_EDT_00002' });
    assert.equal(x.state.writes, 0);
});

for (const [name, change] of [['retired', { asset: { status: 'RETIRED' } }], ['inactive', { asset: { active: false } }],
    ['private', { asset: { access: 'PRIVATE' } }], ['foreign enterprise', { asset: { enterpriseCode: 'business-b' } }],
    ['older published version', { oldVersion: true }], ['missing bytes', { intact: false }],
    ['changed activation', { pointerChanged: true }], ['changed source version', { drift: true }]]) {
    test('unqualified featured Media remains blocked without mutation: ' + name, async () => {
        const x = fixture(change), result = await featured.evaluate(x.request, x.article);
        assert.equal(result.ready, false); assert.equal(x.state.writes, 0);
    });
}

test('content readiness cannot mark a featured image ready without Media proof, while legal hold is never released by inspection', async () => {
    const x = fixture({ asset: { legalHold: true } });
    const locales = [{ articleCode: x.article.code, localeCode: 'en', status: 'READY', title: 'Title', slug: 'slug', body: 'Story' }];
    assert.equal(readiness.evaluate(x.article, locales, {}).ready, false);
    assert.equal(readiness.evaluate(x.article, locales, {}, { ready: true }).ready, true);
    await featured.evaluate(x.request, x.article);
    assert.equal(x.asset.legalHold, true); assert.equal(x.state.writes, 0);
});
