/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** Validates exact-version CMS dependency, immutable manifest, Online pointer, delivery, and rollback contracts. */
const assert = require('assert');
const schemas = require('../src/schemas/schemas').cms;
const properties = require('../config/properties');
const routes = require('../src/router/routers').cms;

class NodicsError extends Error {
    constructor(code, message) { super(message || code); this.code = code; }
}
global.CLASSES = { NodicsError: NodicsError };
global._ = require('lodash');
global.CONFIG = { get: key => {
    if (key === 'cms') return properties.cms;
} };

['cmsPageRoute', 'cmsPage', 'cmsComponentDetail', 'cmsComponent', 'cmsComponentLocalization', 'cmsComponentMedia',
    'cmsPageTemplate', 'cmsSlotDefinition'].forEach(name => {
    assert.strictEqual(schemas[name].isVersionedEnabled, false, name + ' must remain disabled until an active versioned deployment layer opts in');
});
assert.strictEqual(schemas.cmsPublicationManifest.isVersionedEnabled, false);
assert.strictEqual(schemas.cmsOnlinePublicationPointer.isVersionedEnabled, false);
assert.deepStrictEqual(schemas.cmsOnlinePublicationPointer.cache, { enabled: false });
assert.deepStrictEqual(schemas.cmsPublicationManifest.transaction, { enabled: true, sideEffects: 'none' });
assert.deepStrictEqual(schemas.cmsOnlinePublicationPointer.transaction, { enabled: true, sideEffects: 'none' });
assert.deepStrictEqual(schemas.cmsPublicationDeploymentReceipt.transaction, { enabled: true, sideEffects: 'none' });
assert.deepStrictEqual(schemas.cmsPublicationEventOutbox.transaction, { enabled: true, sideEffects: 'none' });
assert.strictEqual(properties.publish.providers.domainAdapters.cms, 'DefaultCmsPublicationAdapterService');
assert.strictEqual(properties.publish.providers.versionProviders.cms, 'DefaultCmsPublicationVersionProviderService');
assert.strictEqual(properties.cms.publication.maximumDeploymentRequestBytes, '64mb');
assert.strictEqual(properties.cms.publication.target.maxManifestBytes, 67108864);
assert.strictEqual(properties.cms.publication.siteBundleChunkThresholdBytes, 50331648);
assert.strictEqual(properties.cms.publication.maxDependencies, 500);
assert.strictEqual(properties.cms.publication.maxBundleDependencies, 10000);
assert.strictEqual(properties.bodyParserHandler.cmsPublicationBodyParserHandler,
    'DefaultCmsPublicationBodyParserHandlerService');
assert.strictEqual(routes.cmsPublicationTarget.deployPublication.bodyParserHandler,
    'cmsPublicationBodyParserHandler');
['deployPublication', 'getPublicationStatus', 'verifyPublicationOnline', 'detectPublicationCollisions',
    'getPublicationSupportBundle', 'reconcilePublicationEvidence', 'rollbackPublication'].forEach(operation => {
    assert.strictEqual(routes.cmsPublicationTarget[operation].secured, true);
    assert.deepStrictEqual(routes.cmsPublicationTarget[operation].authTokenTypes, ['service']);
    assert.strictEqual(routes.cmsPublicationTarget[operation].permissionConfig, 'authSecurity.internalToken.routePermission');
});

const data = {
    sites: [{ code: 'site-a', versionId: 1, active: true, name: 'Site A' }],
    routes: [{ code: 'home-route', versionId: 2, active: true, site: 'site-a', path: '/home', locale: 'en', channel: 'web',
        accessMode: 'PUBLIC', routeType: 'PAGE', page: 'home' },
    { code: 'dashboard-route', versionId: 1, active: true, site: 'site-a', path: '/dashboard', locale: 'en', channel: 'web',
        accessMode: 'AUTHENTICATED', routeType: 'PAGE', page: 'home' }],
    pages: [{ code: 'home', versionId: 3, active: true, name: 'Home', typeCode: 'homePage',
        renderer: 'page.home', rendererContractVersion: 1, rendererChannels: ['web'],
        rendererDeprecated: false, template: 'main' }],
    details: [{ code: 'home-hero', versionId: 1, active: true, source: 'home', target: 'hero', slot: 'main', index: 0 }],
    components: [{ code: 'hero', versionId: 4, active: true, typeCode: 'heroType',
        renderer: 'component.hero', rendererContractVersion: 1, rendererChannels: ['web', 'mobile-webview'],
        rendererDeprecated: true, rendererReplacement: 'component.hero-v2', properties: { analyticsId: 'hero-1' } }],
    localizations: [
        { code: 'hero-en', versionId: 1, active: true, componentCode: 'hero', locale: 'en',
            properties: { title: 'Hello' }, status: 'READY' },
        { code: 'hero-ar', versionId: 1, active: true, componentCode: 'hero', locale: 'ar',
            properties: { title: 'مرحبا' }, status: 'READY' }
    ],
    types: [{ code: 'heroType', versionId: 1, active: true, kind: 'COMPONENT', propertySchema: {
        title: { type: 'string', localized: true, requiredLocales: ['en', 'ar'] },
        analyticsId: { type: 'string', localized: false }
    } }],
    media: [
        { code: 'hero-media-en', componentMediaCode: 'hero-media-en', versionId: 1, active: true,
            componentCode: 'hero', mediaCode: 'hero-en', mediaType: 'IMAGE', role: 'background', slot: 'main',
            localeCode: 'en', position: 0, altText: 'English hero' },
        { code: 'hero-media-ar', componentMediaCode: 'hero-media-ar', versionId: 1, active: true,
            componentCode: 'hero', mediaCode: 'hero-ar', mediaType: 'IMAGE', role: 'background', slot: 'main',
            localeCode: 'ar', position: 0, altText: 'Arabic hero' }
    ],
    templates: [{ code: 'main', versionId: 1, active: true, name: 'Main', renderer: 'template.main', contractVersion: 0 }],
    slots: [{ code: 'main-main', versionId: 1, active: true, template: 'main', name: 'main' }],
    manifests: [], pointers: [], receipts: [], outbox: [],
    experiencePlacements: [
        { code: 'site-a-home-hero-experience', active: true, site: 'site-a', pageType: 'PRODUCT_LISTING',
            slot: 'hero', targetType: 'DEFAULT', targetCode: '*', component: 'hero', rendererKey: 'component.hero',
            publicationStatus: 'STAGED', deliveryStatus: 'ACTIVE', locale: 'en', channel: 'web',
            created: '2026-08-31T00:00:00.000Z', updated: '2026-08-31T00:00:00.000Z' }
    ]
};
for (let index = 1; index < 12; index += 1) {
    data.details.push({ code: 'home-section-' + index, versionId: 1, active: true,
        source: 'home', target: 'section-' + index, slot: 'main', index: index });
    data.components.push({ code: 'section-' + index, versionId: 1, active: true, typeCode: 'heroType',
        renderer: 'component.section', rendererContractVersion: 1, rendererChannels: ['web'],
        rendererDeprecated: false, properties: { title: 'Section ' + index } });
}
const matches = (model, query) => Object.keys(query || {}).every(key => {
    let expected = query[key];
    if (expected && expected.$in) return expected.$in.includes(model[key]);
    if (expected && expected.$ne !== undefined) return model[key] !== expected.$ne;
    return model[key] === expected;
});
const transactionContexts = [];
const generated = list => ({
    get: async request => {
        let matched = list.filter(item => matches(item, request.query));
        let limit = request.searchOptions && (request.searchOptions.limit || request.searchOptions.pageSize) || 10;
        return { result: matched.slice(0, Number(limit)) };
    },
    save: async request => {
        if (request.transactionContext) transactionContexts.push(request.transactionContext);
        list.push(Object.assign({}, request.model)); return { result: [request.model] };
    },
    update: async request => {
        if (request.transactionContext) transactionContexts.push(request.transactionContext);
        let item = list.find(model => matches(model, request.query));
        if (!item) return { result: { modifiedCount: 0 } };
        Object.assign(item, request.model); return { result: { modifiedCount: 1 } };
    }
});
global.SERVICE = {
    DefaultCmsSiteService: generated(data.sites),
    DefaultCmsPageRouteService: generated(data.routes),
    DefaultCmsPageService: generated(data.pages),
    DefaultCmsComponentDetailService: generated(data.details),
    DefaultCmsComponentService: generated(data.components),
    DefaultCmsTypeCodeService: generated(data.types),
    DefaultCmsComponentLocalizationService: generated(data.localizations),
    DefaultCmsComponentMediaService: generated(data.media),
    DefaultCmsPageTemplateService: generated(data.templates),
    DefaultCmsSlotDefinitionService: generated(data.slots),
    DefaultCmsPublicationManifestService: generated(data.manifests),
    DefaultCmsOnlinePublicationPointerService: generated(data.pointers),
    DefaultCmsPublicationDeploymentReceiptService: generated(data.receipts),
    DefaultCmsPublicationEventOutboxService: generated(data.outbox),
    DefaultCmsExperiencePlacementService: generated(data.experiencePlacements),
    DefaultMediaPublicationTransferService: {
        exportReferenced: async codes => codes.map(code => ({ code: code, checksum: code + '-checksum', checksumAlgorithm: 'sha256',
            sizeBytes: 1, contentBase64: 'eA==' })),
        importReferenced: async assets => assets
    },
    DefaultDatabaseTransactionService: {
        capabilities: () => ({ multiRecordAtomic: true, contextPropagation: true, contractVersion: 0 }),
        execute: async (scope, work) => {
            assert.deepStrictEqual(scope, { tenant: 'tenant-a', moduleName: 'cms' });
            return work(Object.freeze({ transactionId: 'transaction-' + (transactionContexts.length + 1) }));
        }
    },
    DefaultCmsContractValidationService: require('../src/service/validation/defaultCmsContractValidationService'),
    DefaultCmsDeliveryCacheInvalidationService: { invalidate: async () => true }
};
SERVICE.DefaultCmsContentLocalizationService = require('../src/service/localization/defaultCmsContentLocalizationService');
SERVICE.DefaultCmsPublicationOutboxService = require('../src/service/publication/defaultCmsPublicationOutboxService');
const adapter = require('../src/service/publication/defaultCmsPublicationAdapterService');
const manifests = require('../src/service/publication/defaultCmsPublicationManifestOrchestrationService');
const provider = require('../src/service/publication/defaultCmsPublicationVersionProviderService');
const target = require('../src/service/publication/defaultCmsPublicationTargetService');
SERVICE.DefaultCmsPublicationAdapterService = adapter;
SERVICE.DefaultCmsPublicationManifestOrchestrationService = manifests;
const onTarget = async operation => {
    let priorRole = properties.cms.publication.runtimeRole;
    properties.cms.publication.runtimeRole = 'ONLINE';
    try { return await operation(); } finally { properties.cms.publication.runtimeRole = priorRole; }
};
SERVICE.TestCmsTargetTransport = {
    deploy: (payload, targetRequest) => onTarget(() => target.deploy(Object.assign({}, targetRequest, { cmsPublicationTarget: payload }))),
    getStatus: (payload, targetRequest) => onTarget(() => target.getStatus(Object.assign({}, targetRequest, { cmsPublicationTarget: payload }))),
    verifyOnline: (payload, targetRequest) => onTarget(() => target.verifyOnline(Object.assign({}, targetRequest, { cmsPublicationTarget: payload }))),
    detectCollisions: (payload, targetRequest) => onTarget(() => target.detectCollisions(Object.assign({}, targetRequest, { cmsPublicationTarget: payload }))),
    supportBundle: (payload, targetRequest) => onTarget(() => target.supportBundle(Object.assign({}, targetRequest, { cmsPublicationTarget: payload }))),
    reconcile: (payload, targetRequest) => onTarget(() => target.reconcile(Object.assign({}, targetRequest, { cmsPublicationTarget: payload }))),
    rollback: (payload, targetRequest) => onTarget(() => target.rollback(Object.assign({}, targetRequest, { cmsPublicationTarget: payload }))),
    withdraw: (payload, targetRequest) => onTarget(() => target.withdraw(Object.assign({}, targetRequest, { cmsPublicationTarget: payload })))
};
properties.cms.publication.targetTransportProvider = 'TestCmsTargetTransport';
properties.cms.publication.runtimeRole = 'STAGED';

const publication = { code: 'publish-home', domain: 'cms', rootType: 'pageRoute', rootCode: 'home-route',
    sourceVersion: '0', mediaCodes: ['product-extra-media'] };
const request = { tenant: 'tenant-a', authData: { principalId: 'publisher-a' }, correlationId: 'correlation-a' };

(async () => {
    let root = await adapter.getVersion(publication, request);
    let dependencies = await adapter.resolveDependencies(publication, root, request);
    assert(dependencies.some(item => item.schema === 'cmsPage' && item.code === 'home' && item.version === '3'));
    assert(dependencies.some(item => item.schema === 'cmsComponent' && item.code === 'hero' && item.version === '4'));
    assert(dependencies.some(item => item.schema === 'cmsComponent' && item.code === 'section-11' && item.version === '1'),
        'publication dependency resolution must not truncate component graphs at the generated-service default page size');
    assert(dependencies.some(item => item.schema === 'cmsTypeCode' && item.code === 'heroType'));
    assert(dependencies.some(item => item.schema === 'cmsComponentLocalization' && item.code === 'hero-en'));
    assert(dependencies.some(item => item.schema === 'cmsComponentLocalization' && item.code === 'hero-ar'));
    assert(dependencies.some(item => item.schema === 'cmsComponentMedia' && item.code === 'hero-media-en'));
    assert(dependencies.some(item => item.schema === 'cmsComponentMedia' && item.code === 'hero-media-ar'));
    assert.strictEqual((await adapter.validate(publication, root, request, dependencies)).valid, true);
    data.localizations[1].status = 'DRAFT';
    assert.deepStrictEqual(await adapter.validate(publication, root, request, dependencies), {
        valid: false,
        reason: 'LOCALIZATION_NOT_READY'
    }, 'publication readiness must reject any frozen locale variant that is not READY');
    data.localizations[1].status = 'READY';
    let missingDependency = dependencies.map(item => item.schema === 'cmsComponent' ? Object.assign({}, item, { version: '0' }) : item);
    assert.strictEqual((await adapter.validate(publication, root, request, missingDependency)).valid, false,
        'validation must fail closed when a frozen dependency version disappears');
    let originalMax = properties.cms.publication.maxDependencies;
    properties.cms.publication.maxDependencies = 1;
    await assert.rejects(adapter.resolveDependencies(publication, root, request),
        error => error.code === 'CMS_PUBLICATION_DEPENDENCY_EXCEEDED');
    properties.cms.publication.maxDependencies = originalMax;
    await assert.rejects(adapter.getVersion(Object.assign({}, publication, { rootType: 'unknown' }), request),
        error => error.code === 'CMS_PUBLICATION_ROOT_UNSUPPORTED');

    publication.dependencies = dependencies;
    let manifest = await manifests.persist(publication, request);
    assert.strictEqual(manifest.snapshot.page.components.length, 12,
        'publication manifest must freeze every active component detail beyond the default generated-service page size');
    assert.strictEqual(manifest.snapshot.page.components[0].code, 'hero');
    assert.strictEqual(manifest.snapshot.page.components[0].active, true);
    assert.strictEqual(manifest.snapshot.page.components[0].properties.title, 'Hello');
    assert.strictEqual(manifest.snapshot.page.components[0].properties.analyticsId, 'hero-1');
    assert.strictEqual(manifest.snapshot.page.components[0].localization.resolvedLocale, 'en');
    assert.strictEqual(manifest.snapshot.page.components[0].localization.fallbackUsed, false);
    assert.strictEqual(manifest.snapshot.page.components[0].media[0].mediaCode, 'hero-en');
    assert.strictEqual(manifest.snapshot.page.components[0].media[0].altText, 'English hero');
    assert.deepStrictEqual(manifest.mediaAssets.map(item => item.code).sort(), ['hero-en', 'product-extra-media'],
        'application-declared media must publish with the CMS release even when it is outside the component graph');
    assert.strictEqual(manifest.mediaAssets[0].contentBase64, 'eA==',
        'deployment payload must retain media bytes for the target import call');
    assert.strictEqual(data.manifests[0].mediaAssets[0].contentBase64, undefined,
        'durable manifests must store media metadata only, not transfer bytes');
    assert.strictEqual(manifest.cmsExperiencePlacements.length, 1,
        'site-targeted experience placements must publish with the CMS release for Online indexing');
    assert.strictEqual(manifest.cmsExperiencePlacements[0].code, 'site-a-home-hero-experience');
    assert.strictEqual(manifest.cmsExperiencePlacements[0].updated, undefined,
        'durable experience placement snapshots must not carry generated-service mutation metadata');
    assert.strictEqual(data.manifests[0].cmsExperiencePlacements.length, 1,
        'durable manifests must include experience placements for target import and outbox indexing');
    assert.strictEqual(manifest.snapshot.page.rendererContractVersion, 1);
    assert.deepStrictEqual(manifest.snapshot.page.rendererChannels, ['web']);
    assert.strictEqual(manifest.snapshot.page.rendererDeprecated, false);
    assert.strictEqual(manifest.snapshot.page.components[0].rendererContractVersion, 1);
    assert.deepStrictEqual(manifest.snapshot.page.components[0].rendererChannels, ['web', 'mobile-webview']);
    assert.strictEqual(manifest.snapshot.page.components[0].rendererDeprecated, true);
    assert.strictEqual(manifest.snapshot.page.components[0].rendererReplacement, 'component.hero-v2');
    assert.deepStrictEqual(manifest.snapshot.page.templateContract, {
        code: 'main',
        renderer: 'template.main',
        contractVersion: 0
    });
    let replayManifest = await manifests.persist(publication, request);
    assert.strictEqual(replayManifest.code, manifest.code, 'manifest persistence must be idempotent');
    assert.strictEqual(replayManifest.mediaAssets[0].contentBase64, 'eA==',
        'idempotent deployment retries must reattach freshly exported media bytes');

    let importedManifest = await manifests.importManifest(manifest, request);
    assert.strictEqual(importedManifest.cmsExperiencePlacements.length, 1,
        'Online manifest import must preserve experience placements for post-commit indexing');
    await assert.rejects(manifests.importManifest(Object.assign({}, manifest, { code: 'tampered-experience-manifest',
        cmsExperiencePlacements: manifest.cmsExperiencePlacements.concat({ code: 'unexpected', active: true }) }), request),
        error => error.code === 'CMS_PUBLICATION_MANIFEST_INTEGRITY',
        'manifest integrity must include experience placements');

    let activated = await provider.activate(publication, request);
    assert.strictEqual(activated.version, manifest.code);
    assert.strictEqual(data.pointers.length, 1);
    assert.strictEqual(data.receipts.length, 1);
    assert.strictEqual(data.outbox.length, 1);
    assert.strictEqual(data.outbox[0].status, 'DELIVERED');
    let lineage = await provider.getLineage(Object.assign({}, publication, { targetVersion: manifest.code }), request);
    assert.strictEqual((await provider.reconcile(Object.assign({}, publication, { targetVersion: manifest.code, revision: 4 }), request)).status,
        'CONSISTENT', 'aligned manifest, pointer, receipt, and outbox evidence must reconcile without mutation');
    data.receipts.length = 0;
    data.outbox.length = 0;
    let diagnosed = await provider.reconcile(Object.assign({}, publication, { targetVersion: manifest.code, revision: 4 }), request);
    assert.strictEqual(diagnosed.status, 'EVIDENCE_GAP');
    assert.strictEqual(diagnosed.repaired, false);
    let repaired = await provider.reconcile(Object.assign({}, publication, { targetVersion: manifest.code, revision: 4 }),
        Object.assign({}, request, { repairEvidence: true }));
    assert.strictEqual(repaired.status, 'REPAIRED');
    assert.strictEqual(data.receipts.length, 1);
    assert.strictEqual(data.outbox.length, 1);
    let pointerManifest = data.pointers[0].manifestCode;
    data.pointers[0].manifestCode = 'unexpected-manifest';
    let refused = await provider.reconcile(Object.assign({}, publication, { targetVersion: manifest.code, revision: 5 }),
        Object.assign({}, request, { repairEvidence: true }));
    assert.strictEqual(refused.status, 'POINTER_DRIFT');
    assert.strictEqual(refused.repairRefused, true);
    assert.strictEqual(data.pointers[0].manifestCode, 'unexpected-manifest', 'reconciliation must never switch a drifted pointer');
    data.pointers[0].manifestCode = pointerManifest;
    assert.strictEqual(lineage.manifest.publicationCode, publication.code);
    assert.strictEqual(lineage.manifest.sourceVersion, publication.sourceVersion);
    assert.strictEqual(lineage.manifest.correlationId, request.correlationId);
    assert(lineage.receipts.some(receipt => receipt.operation === 'DEPLOY' && receipt.correlationId === request.correlationId));
    assert(lineage.outbox.some(event => event.operation === 'DEPLOY' && event.status === 'DELIVERED'));
    assert(transactionContexts.length >= 2, 'Online pointer and receipt writes must use a governed transaction context');
    assert.strictEqual(transactionContexts.at(-1), transactionContexts.at(-2),
        'Online pointer and receipt writes must share one transaction context');
    let verification = await SERVICE.TestCmsTargetTransport.verifyOnline({ manifestCode: manifest.code }, request);
    assert.strictEqual(verification.status, 'VERIFIED');
    assert(data.receipts.some(receipt => receipt.operation === 'VERIFY' && receipt.manifestCode === manifest.code),
        'Online verification must attach a receipt to the deployed publication evidence');
    let supportBundle = await SERVICE.TestCmsTargetTransport.supportBundle({ manifestCode: manifest.code }, request);
    assert.strictEqual(supportBundle.status, 'READY');
    assert.strictEqual(supportBundle.redacted, true);
    assert.strictEqual(supportBundle.diagnostics.verification.status, 'VERIFIED');
    assert.strictEqual(supportBundle.redaction.tokens, 'excluded');
    assert.strictEqual((await SERVICE.TestCmsTargetTransport.detectCollisions({ manifestCode: manifest.code }, request)).status, 'CLEAR');
    assert.strictEqual((await provider.getOnlineVersion(publication, request)).version, manifest.code);
    assert.strictEqual((await provider.activate(publication, request)).version, manifest.code, 'activation replay must be idempotent');

    let lossPublication = Object.assign({}, publication, { code: 'publish-home-response-loss', revision: 1 });
    let originalTransportDeploy = SERVICE.TestCmsTargetTransport.deploy;
    let loseResponse = true;
    SERVICE.TestCmsTargetTransport.deploy = async (payload, targetRequest) => {
        let committed = await originalTransportDeploy(payload, targetRequest);
        if (loseResponse) { loseResponse = false; throw new NodicsError('SIMULATED_RESPONSE_LOSS', 'Committed response was lost'); }
        return committed;
    };
    let pointerCountBeforeLoss = data.pointers.length;
    let receiptCountBeforeLoss = data.receipts.length;
    let outboxCountBeforeLoss = data.outbox.length;
    await assert.rejects(provider.activate(lossPublication, request), error => error.code === 'SIMULATED_RESPONSE_LOSS');
    let recoveredLoss = await provider.activate(lossPublication, request);
    assert.strictEqual(recoveredLoss.version, 'publish-home-response-loss_0_1');
    assert.strictEqual(data.pointers.length, pointerCountBeforeLoss, 'response-loss retry must reuse the committed pointer');
    assert.strictEqual(data.receipts.length, receiptCountBeforeLoss + 1, 'response-loss retry must reuse the committed receipt');
    assert.strictEqual(data.outbox.length, outboxCountBeforeLoss + 1, 'response-loss retry must reuse the committed outbox event');
    SERVICE.TestCmsTargetTransport.deploy = originalTransportDeploy;

    properties.cms.publication.enabled = true;
    const delivery = require('../src/service/delivery/defaultCmsDeliveryService');
    let delivered = await delivery.resolvePage({ tenant: 'tenant-a', authData: {}, router: { publicAccess: true },
        delivery: { site: 'site-a', path: '/home', locale: 'en', channel: 'web' } });
    assert.strictEqual(delivered.result.page.components[0].code, 'hero');
    await assert.rejects(delivery.resolvePage({ tenant: 'tenant-a', authData: {}, router: { publicAccess: true },
        delivery: { site: 'site-a', path: '/missing', locale: 'en', channel: 'web' } }),
    error => error.code === 'ERR_CMS_00090');
    properties.cms.publication.enabled = false;

    let previous = Object.assign({}, manifest, { code: 'publish-home_1', sourceVersion: '0', contentHash: 'previous' });
    data.manifests.push(previous);
    let rolledBack = await provider.rollback(publication, previous.code, request);
    assert.strictEqual(rolledBack.version, previous.code);
    assert.strictEqual(data.pointers[0].manifestCode, previous.code);
    assert(data.receipts.some(receipt => receipt.operation === 'ROLLBACK' && receipt.manifestCode === previous.code));
    assert(data.outbox.some(event => event.operation === 'ROLLBACK' && event.status === 'DELIVERED'));

    let withdrawn = await provider.withdraw(Object.assign({}, publication, { targetVersion: previous.code }), request);
    assert.strictEqual(withdrawn.version, previous.code);
    assert.strictEqual(data.pointers[0].active, false, 'withdrawal must remove the route from delivery without deleting its manifest');
    assert(data.receipts.some(receipt => receipt.operation === 'WITHDRAW' && receipt.manifestCode === previous.code));
    assert.strictEqual((await provider.activate(publication, request)).version, manifest.code,
        'a withdrawn immutable release must be safely reactivated through the normal deployment path');
    assert.strictEqual(data.pointers[0].active, true);

    let tampered = JSON.parse(JSON.stringify(manifest));
    tampered.snapshot.page.name = 'Tampered page';
    await assert.rejects(onTarget(() => target.deploy(Object.assign({}, request, { cmsPublicationTarget: { manifest: tampered } }))),
        error => error.code === 'CMS_PUBLICATION_MANIFEST_INTEGRITY');

    let originalMaxManifestBytes = properties.cms.publication.target.maxManifestBytes;
    properties.cms.publication.target.maxManifestBytes = 1;
    await assert.rejects(onTarget(() => target.deploy(Object.assign({}, request, { cmsPublicationTarget: { manifest: manifest } }))),
        error => error.code === 'CMS_PUBLICATION_MANIFEST_BOUNDARY');
    properties.cms.publication.target.maxManifestBytes = originalMaxManifestBytes;

    let unsupported = JSON.parse(JSON.stringify(manifest));
    unsupported.snapshot.contractVersion = 99;
    await assert.rejects(onTarget(() => target.deploy(Object.assign({}, request, { cmsPublicationTarget: { manifest: unsupported } }))),
        error => error.code === 'CMS_PUBLICATION_CONTRACT_UNSUPPORTED');

    await assert.rejects(onTarget(() => target.rollback(Object.assign({}, request,
        { cmsPublicationTarget: { manifestCode: 'missing-manifest' } }))),
    error => error.code === 'CMS_PUBLICATION_MANIFEST_MISSING');

    let originalUpdate = SERVICE.DefaultCmsOnlinePublicationPointerService.update;
    SERVICE.DefaultCmsOnlinePublicationPointerService.update = async () => ({ result: { modifiedCount: 0 } });
    await assert.rejects(manifests.activate(previous, request), error => error.code === 'CMS_PUBLICATION_POINTER_CONFLICT');
    SERVICE.DefaultCmsOnlinePublicationPointerService.update = originalUpdate;

    let originalPointerGet = SERVICE.DefaultCmsOnlinePublicationPointerService.get;
    let originalPointerSave = SERVICE.DefaultCmsOnlinePublicationPointerService.save;
    let racePointer;
    SERVICE.DefaultCmsOnlinePublicationPointerService.get = async () => ({ result: racePointer ? [racePointer] : [] });
    SERVICE.DefaultCmsOnlinePublicationPointerService.save = async saveRequest => {
        if (racePointer) throw new NodicsError('DUPLICATE_POINTER', 'Duplicate pointer');
        racePointer = Object.assign({}, saveRequest.model);
        return { result: [racePointer] };
    };
    let raceManifest = Object.assign({}, manifest, { code: 'publish-home-race',
        snapshot: Object.assign({}, manifest.snapshot, { path: '/race' }) });
    let concurrentActivation = await Promise.all([manifests.activate(raceManifest, request), manifests.activate(raceManifest, request)]);
    assert(concurrentActivation.every(result => result.version === raceManifest.code),
        'concurrent identical first activation must converge on one Online pointer');
    SERVICE.DefaultCmsOnlinePublicationPointerService.get = originalPointerGet;
    SERVICE.DefaultCmsOnlinePublicationPointerService.save = originalPointerSave;

    let originalReceiptGet = SERVICE.DefaultCmsPublicationDeploymentReceiptService.get;
    let originalReceiptSave = SERVICE.DefaultCmsPublicationDeploymentReceiptService.save;
    let raceReceipt;
    SERVICE.DefaultCmsPublicationDeploymentReceiptService.get = async () => ({ result: raceReceipt ? [raceReceipt] : [] });
    SERVICE.DefaultCmsPublicationDeploymentReceiptService.save = async saveRequest => {
        if (raceReceipt) throw new NodicsError('DUPLICATE_RECEIPT', 'Duplicate receipt');
        raceReceipt = Object.assign({}, saveRequest.model);
        return { result: [raceReceipt] };
    };
    let concurrentReceipt = await Promise.all([
        target.recordReceipt('DEPLOY', raceManifest, { version: raceManifest.code }, request),
        target.recordReceipt('DEPLOY', raceManifest, { version: raceManifest.code }, request)
    ]);
    assert(concurrentReceipt.every(receipt => receipt.code === concurrentReceipt[0].code &&
        receipt.code.startsWith('DEPLOY_' + raceManifest.code + '_')),
        'concurrent identical receipt writes must converge on one deployment receipt');
    SERVICE.DefaultCmsPublicationDeploymentReceiptService.get = originalReceiptGet;
    SERVICE.DefaultCmsPublicationDeploymentReceiptService.save = originalReceiptSave;

    data.pointers.splice(0);
    const sitePublication = { code: 'publish-site-a', domain: 'cms', rootType: 'site', rootCode: 'site-a', sourceVersion: '0' };
    const siteRoot = await adapter.getVersion(sitePublication, request);
    sitePublication.dependencies = await adapter.resolveDependencies(sitePublication, siteRoot, request);
    const siteValidation = await adapter.validate(sitePublication, siteRoot, request, sitePublication.dependencies);
    assert.strictEqual(siteValidation.valid, true);
    assert.strictEqual(siteValidation.routeCount, 2);
    const siteManifest = await manifests.persist(sitePublication, request);
    assert.strictEqual(siteManifest.snapshot.contractVersion, 2);
    assert.strictEqual(siteManifest.snapshot.bundleType, 'SITE');
    assert.deepStrictEqual(siteManifest.snapshot.routes.map(route => route.path), ['/dashboard', '/home']);
    const siteActivation = await provider.activate(sitePublication, request);
    assert.strictEqual(siteActivation.routeCount, 2);
    assert.strictEqual(data.pointers.length, 2);
    assert(data.pointers.every(pointer => pointer.manifestCode === siteManifest.code),
        'one site-bundle deployment must switch every route pointer to the same immutable manifest');
    assert.strictEqual((await provider.getOnlineVersion(sitePublication, request)).version, siteManifest.code);
    let originalMaxBundleDependencies = properties.cms.publication.maxBundleDependencies;
    properties.cms.publication.maxBundleDependencies = 1;
    await assert.rejects(adapter.resolveDependencies(sitePublication, siteRoot, request),
        error => error.code === 'CMS_PUBLICATION_DEPENDENCY_EXCEEDED');
    properties.cms.publication.maxBundleDependencies = originalMaxBundleDependencies;
    properties.cms.publication.enabled = true;
    let siteDelivery = await delivery.resolvePage({ tenant: 'tenant-a', authData: {}, router: { publicAccess: true },
        delivery: { site: 'site-a', path: '/home', locale: 'en', channel: 'web' } });
    assert.strictEqual(siteDelivery.result.path, '/home');
    properties.cms.publication.enabled = false;
    let siteWithdrawal = await provider.withdraw(Object.assign({}, sitePublication,
        { targetVersion: siteManifest.code }), request);
    assert.strictEqual(siteWithdrawal.routeCount, 2);
    assert(data.pointers.every(pointer => pointer.active === false));
    let siteRecovery = await provider.rollback(sitePublication, siteManifest.code, request);
    assert.strictEqual(siteRecovery.routeCount, 2,
        'a fully withdrawn site bundle must be recoverable when no competing active scope exists');
    assert(data.pointers.every(pointer => pointer.active === true && pointer.manifestCode === siteManifest.code));

    data.pointers.splice(0);
    const chunkedSitePublication = Object.assign({}, sitePublication, { code: 'publish-site-a-chunked', revision: 1 });
    chunkedSitePublication.dependencies = sitePublication.dependencies;
    const largeSiteManifest = await manifests.persist(chunkedSitePublication, request);
    const previewIndex = await manifests.persistChunkedSite(chunkedSitePublication, largeSiteManifest, request);
    const originalChunkThreshold = properties.cms.publication.siteBundleChunkThresholdBytes;
    properties.cms.publication.siteBundleChunkThresholdBytes = manifests.manifestBytes(largeSiteManifest) - 1;
    assert(manifests.manifestBytes(largeSiteManifest) > properties.cms.publication.siteBundleChunkThresholdBytes,
        'test fixture must force site publication to use route chunks');
    const chunkedActivation = await provider.activate(chunkedSitePublication, request);
    assert.strictEqual(chunkedActivation.version, previewIndex.code);
    assert.strictEqual(chunkedActivation.chunked, true);
    assert.strictEqual(chunkedActivation.routeCount, 2);
    assert(data.pointers.every(pointer => pointer.manifestCode !== previewIndex.code),
        'chunked site publication must activate route pointers to prepared route manifests, not the index manifest');
    assert.strictEqual((await provider.getOnlineVersion(chunkedSitePublication, request)).version, previewIndex.code);
    const chunkedVerification = await SERVICE.TestCmsTargetTransport.verifyOnline({ manifestCode: previewIndex.code }, request);
    assert.strictEqual(chunkedVerification.status, 'VERIFIED');
    const chunkedWithdrawal = await provider.withdraw(Object.assign({}, chunkedSitePublication,
        { targetVersion: previewIndex.code }), request);
    assert.strictEqual(chunkedWithdrawal.routeCount, 2);
    assert(data.pointers.every(pointer => pointer.active === false));
    const chunkedRecovery = await provider.rollback(chunkedSitePublication, previewIndex.code, request);
    assert.strictEqual(chunkedRecovery.routeCount, 2);
    assert(data.pointers.every(pointer => pointer.active === true));
    properties.cms.publication.siteBundleChunkThresholdBytes = originalChunkThreshold;

    const transport = require('../src/service/publication/defaultCmsPublicationModuleTransportService');
    properties.cms.publication.runtimeRole = 'STAGED';
    properties.cms.publication.target = Object.assign({}, properties.cms.publication.target,
        { moduleName: 'cms', connectionName: 'cmsOnline' });
    let transportDescriptor;
    SERVICE.DefaultModuleService = {
        invokeModule: async options => {
            transportDescriptor = options;
            return options.responseSelector({ result: { version: 'target-v1' } });
        }
    };
    global.NODICS = { getInternalAuthToken: () => undefined };
    assert.throws(() => transport.deploy({ manifest: manifest }, request),
        error => error.code === 'CMS_PUBLICATION_INTERNAL_AUTH_UNAVAILABLE');
    NODICS.getInternalAuthToken = tenant => tenant === 'tenant-a' ? 'service-token' : undefined;
    assert.strictEqual((await transport.deploy({ manifest: manifest }, request)).version, 'target-v1');
    assert.deepStrictEqual(transportDescriptor.targetAuthority, { runtimeRole: 'WCMS_ONLINE' });
    assert.strictEqual(transportDescriptor.connectionName, 'cmsOnline');
    assert.strictEqual(transportDescriptor.requestBody.tenant, 'tenant-a');
    assert.strictEqual(transportDescriptor.requestBody.correlationId, 'correlation-a');
    assert.strictEqual(transportDescriptor.header.Authorization, 'Bearer service-token');

    properties.cms.publication.runtimeRole = 'STAGED';
    await assert.rejects(target.deploy({ tenant: 'tenant-a', cmsPublicationTarget: { manifest: manifest } }),
        error => error.code === 'CMS_PUBLICATION_TARGET_ROLE_INVALID');
    properties.cms.publication.runtimeRole = 'ONLINE';
    global.CONFIG = { get: key => key === 'cms' ? properties.cms : key === 'publishEnabled' ? true : undefined };
    await assert.rejects(target.deploy({ tenant: 'tenant-a', cmsPublicationTarget: { manifest: manifest } }),
        error => error.code === 'CMS_PUBLICATION_TARGET_VERSIONING_INVALID');

    let replayEvent = { code: 'DEPLOY_replay_manifest', active: true, publicationCode: 'replay',
        manifestCode: 'replay_manifest', operation: 'DEPLOY', eventType: 'CMS_ONLINE_CHANGED',
        status: 'PENDING', attempts: 0, correlationId: 'replay-correlation' };
    data.outbox.push(replayEvent);
    let invalidation = SERVICE.DefaultCmsDeliveryCacheInvalidationService.invalidate;
    SERVICE.DefaultCmsDeliveryCacheInvalidationService.invalidate = async () => { throw new Error('cache unavailable'); };
    await assert.rejects(SERVICE.DefaultCmsPublicationOutboxService.deliver(replayEvent, request), /cache unavailable/);
    assert.strictEqual(replayEvent.status, 'PENDING', 'failed delivery must remain replayable');
    SERVICE.DefaultCmsDeliveryCacheInvalidationService.invalidate = invalidation;
    let reconciled = await SERVICE.DefaultCmsPublicationOutboxService.reconcile(request);
    assert.strictEqual(reconciled.delivered, 1);
    assert.strictEqual(replayEvent.status, 'DELIVERED');

    console.log('CMS publication manifest contract validated');
})().catch(error => { console.error(error); process.exit(1); });
