/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/** @module media/test/mediaPublicationReviewContract @description Composes actual review, retained owner, controller and content handler across private generated-service/provider ports. @layer test @owner media */
const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const review = require('../src/service/publication/defaultMediaPublicationReviewService');
const retained = require('../src/service/publication/defaultMediaRetainedPublicationService');
const library = require('../src/service/defaultMediaLibraryService');
const facade = require('../src/facade/defaultMediaLibraryFacade');
const controller = require('../src/controller/defaultMediaLibraryController');
const handler = require('../src/service/storage/defaultMediaContentResponseHandlerService');
const routes = require('../src/router/routers').media.library;
let settings, request, asset, manifest, publication, bytes, metadataReads, byteReads, ack;
const input = () => ({ publicationCode: 'image-review-077', localeCode: 'en' });
const rebind = () => { manifest.code = retained.digest(asset); manifest.artifacts = { asset }; manifest.totalBytes = asset.sizeBytes; publication.sourceVersion = manifest.code; };
beforeEach(() => {
    settings = structuredClone(require('../config/properties').media);
    settings.publication.versionProviderEnabled = true; settings.publication.runtimeRole = 'STAGED';
    bytes = Buffer.from('exact retained image'); metadataReads = []; byteReads = []; ack = {};
    asset = { code: 'captured-image', name: 'Reviewed image title', versionId: 0, mimeType: 'image/png', access: 'PRIVATE',
        sizeBytes: bytes.length, checksumAlgorithm: 'sha256', checksum: crypto.createHash('sha256').update(bytes).digest('hex'), enterpriseCode: 'acme' };
    manifest = { status: 'READY', artifactCount: 1, evidence: { retained: { providerCode: 'private', storageKey: 'private-retained-key' } } };
    publication = { code: 'image-review-077', domain: 'media', rootType: 'media', rootCode: asset.code, revision: 2, state: 'PENDING_APPROVAL' }; rebind();
    request = { tenant: 'tenant-a', authData: { tenant: 'tenant-a', entCode: 'acme', principalType: 'human', tokenType: 'access',
        permissions: ['media.storage.policy.view', 'publish.lifecycle.view', 'media.content.read'] } };
    global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };
    global.CONFIG = { get: key => key === 'media' ? settings : undefined };
    global.SERVICE = {
        DefaultMediaLibraryService: library, DefaultMediaPublicationReviewService: review, DefaultMediaRetainedPublicationService: retained,
        DefaultSecuredRequestPipelineService: { getGrantedPermissions: r => r.authData.permissions, isPermissionGranted: (p, grants) => grants.includes(p) },
        DefaultPublicationLifecycleService: { get: async r => { assert.equal(r.tenant, request.tenant); assert.equal(r.authData, request.authData); assert.equal(r.publicationCode, publication.code); return structuredClone(publication); } },
        DefaultMediaTransferManifestService: { get: async r => { metadataReads.push(r); assert.equal(r.authData, request.authData); assert.equal(r.tenant, request.tenant); return { code: 'SUC_FIND_00000', result: [structuredClone(manifest)], ...ack }; } },
        DefaultMediaStorageProviderRegistryService: { read: async r => { byteReads.push(r); assert.equal(r.tenant, request.tenant); assert.equal(r.authData, request.authData); return Buffer.from(bytes); } },
        DefaultMediaService: { get: () => { throw Error('Current Media must not replace retained review evidence'); } }
    };
    global.FACADE = { DefaultMediaLibraryFacade: facade };
});
test('captured review metadata is exact, bounded and read-only without current Media/provider reads', async () => {
    const dto = await review.review(input(), request);
    assert.equal(dto.asset.name, asset.name); assert.equal(dto.asset.versionId, 0); assert.equal(dto.sourceVersion, publication.sourceVersion);
    assert.equal(dto.previewAvailable, true); assert.equal(dto.presentation.title, 'Captured asset for review');
    assert.equal(byteReads.length, 0); assert.equal(metadataReads.length, 1); assert.equal(metadataReads[0].skipcache, true);
    for (const secret of ['private-retained-key', 'storageKey', 'providerCode', 'enterpriseCode', 'originalFileName', 'accessUrl']) assert.equal(JSON.stringify(dto).includes(secret), false);
});
test('exact retained raster bytes preserve original scope, size boundary and safe headers', async () => {
    const result = await review.image(input(), request); assert.deepEqual(result.buffer, bytes); assert.equal(byteReads.length, 1);
    assert.equal(byteReads[0].maximumBytes, asset.sizeBytes); assert.equal(result.cacheControl, 'no-store');
    const headers = {}, response = { type: value => { headers.type = value; }, set: (key, value) => { headers[key] = value; }, send: value => value };
    assert.deepEqual(handler.handleSuccess({}, response, result), bytes);
    assert.equal(headers['X-Content-Type-Options'], 'nosniff'); assert.match(headers['Content-Security-Policy'], /sandbox/);
    assert.equal(headers['Cache-Control'], 'no-store'); assert.equal(headers['Content-Disposition'].includes('private'), false);
});
for (const permission of ['media.storage.policy.view', 'publish.lifecycle.view']) test('missing ' + permission + ' cannot read retained review metadata', async () => {
    request.authData.permissions = request.authData.permissions.filter(p => p !== permission);
    await assert.rejects(review.review(input(), request)); assert.equal(metadataReads.length, 0); assert.equal(byteReads.length, 0);
});
test('metadata access cannot grant raster byte access', async () => {
    request.authData.permissions = request.authData.permissions.filter(p => p !== 'media.content.read');
    assert.equal((await review.review(input(), request)).previewAvailable, false);
    await assert.rejects(review.image(input(), request)); assert.equal(byteReads.length, 0);
});
test('another enterprise fails before provider access, including for an otherwise readable publication', async () => {
    asset.enterpriseCode = 'other'; rebind(); await assert.rejects(review.review(input(), request));
    await assert.rejects(review.image(input(), request)); assert.equal(byteReads.length, 0);
});
test('tenant mismatch, service principal and Online role cannot inspect retained review evidence', async () => {
    request.authData.tenant = 'other'; await assert.rejects(review.review(input(), request)); request.authData.tenant = request.tenant;
    request.authData.principalType = 'service'; await assert.rejects(review.review(input(), request)); request.authData.principalType = 'human';
    settings.publication.runtimeRole = 'ONLINE'; await assert.rejects(review.review(input(), request)); assert.equal(metadataReads.length, 0);
});
for (const negative of [{ code: 'ERR_FIND_00000' }, { acknowledged: false }, { confirmed: false }, { result: [] }, { errors: ['failed'] }]) test('contradictory/missing metadata owner evidence is held: ' + JSON.stringify(negative), async () => {
    ack = negative; await assert.rejects(review.review(input(), request)); assert.equal(byteReads.length, 0);
});
test('a changed retained asset cannot pass its original publication digest', async () => {
    asset.name = 'Tampered title'; await assert.rejects(review.review(input(), request)); assert.equal(byteReads.length, 0);
});
test('provider corruption cannot become a reviewed image', async () => {
    bytes = Buffer.from('changed bytes'); await assert.rejects(review.image(input(), request));
});
test('unsupported or oversized files retain metadata without enabling preview', async () => {
    asset.mimeType = 'image/svg+xml'; rebind(); assert.equal((await review.review(input(), request)).previewAvailable, false);
    await assert.rejects(review.image(input(), request)); assert.equal(byteReads.length, 0);
    asset.mimeType = 'image/png'; asset.sizeBytes = settings.library.review.maximumPreviewBytes + 1; rebind();
    assert.equal((await review.review(input(), request)).previewAvailable, false); assert.equal(byteReads.length, 0);
});
test('Arabic copy is owner-configurable and never exports arbitrary configuration', async () => {
    settings.library.review.presentation.ar.title = 'عنوان مخصص'; settings.library.review.presentation.ar.privateSecret = 'do-not-project';
    const dto = await review.review({ ...input(), localeCode: 'ar' }, request);
    assert.equal(dto.presentation.title, 'عنوان مخصص'); assert.equal(dto.presentation.privateSecret, undefined);
});
test('HTTP adapters preserve signed scope and reject caller selectors, keeping read routes private', async () => {
    const headers = {}, http = { params: { publicationCode: publication.code }, query: { localeCode: 'ar' }, body: {} };
    const result = await controller.reviewPublication({ ...request, tenant: 'tenant-a', httpRequest: http, httpResponse: { setHeader: (k, v) => { headers[k] = v; } } });
    assert.equal(result.code, 'SUC_MED_00032'); assert.equal(result.data.asset.versionId, 0); assert.equal(headers['Cache-Control'], 'no-store');
    http.body = { tenant: 'other' }; await assert.rejects(controller.reviewPublication({ ...request, httpRequest: http }));
    for (const operation of ['reviewPublication', 'reviewImage']) {
        assert.deepEqual(routes[operation].authTokenTypes, ['access']); assert.equal(routes[operation].publicAccess, undefined);
        assert.deepEqual(routes[operation].accessGroups, ['runtimeConfigAdminUserGroup', 'commerceSetupPublisherUserGroup']);
        assert.equal(routes[operation].apiExposure, 'mediaManagement'); assert.equal(routes[operation].method, 'GET');
    }
});
