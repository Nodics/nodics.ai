/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module product/test/productGovernedPublicationContract @description Exercises exact Product closure, hidden target CAS and activated discovery without runtime or database mutations. @layer test @owner product */
const test = require('node:test');
const assert = require('node:assert/strict');
const graph = require('../src/service/defaultProductPublicationGraphService');
const target = require('../src/service/defaultProductPublicationTargetService');
const provider = require('../src/service/defaultProductPublicationVersionProviderService');
const adapter = require('../src/service/defaultProductPublicationAdapterService');
const localization = require('../src/service/defaultProductLocalizationPolicyService');
const builder = require('../src/service/defaultProductLocalizedProjectionBuilderService');
const discovery = require('../src/service/defaultProductDiscoveryService');
const schemas = require('../src/schemas/schemas').product;
const concurrency = require('../../../../../../nodics.foundation/modules/nDatabase/database/src/service/schema/defaultModelConcurrencyService');
const lifecycle = require('../../../../../../nodics.foundation/modules/nPublish/src/service/defaultPublicationLifecycleService');
const governed = require('../src/service/defaultProductGovernedPublicationService');
const transport = require('../src/service/defaultProductPublicationTransportService');
const facade = require('../src/facade/defaultProductPublicationFacade');

function fixture() {
    const request = { tenant: 'tenant-a', authData: { identity: 'operator' }, storeCode: 'store-a', locale: 'en' };
    const rows = {
        product: [{ code: 'p', tenant: request.tenant, versionId: 0, status: 'ACTIVE', revision: 1, catalogVersion: 'catalog', name: 'Shared' }],
        productLocalization: [{ code: 'p-en', tenant: request.tenant, productCode: 'p', locale: 'en', versionId: 0, status: 'READY', name: 'First', classificationValues: { categoryCodes: ['leaf'] } }],
        productVariant: [{ code: 'v', tenant: request.tenant, productCode: 'p', versionId: 0, status: 'ACTIVE', sku: 'SKU' }],
        productVariantLocalization: [{ code: 'v-en', tenant: request.tenant, productCode: 'p', variantCode: 'v', locale: 'en', versionId: 0, status: 'READY', attributes: {} }],
        category: [{ code: 'leaf', tenant: request.tenant, versionId: 0, status: 'ACTIVE', parentCode: 'parent' },
            { code: 'parent', tenant: request.tenant, versionId: 0, status: 'ACTIVE' }],
        categoryLocalization: ['leaf', 'parent'].map(code => ({ code: code + '-en', categoryCode: code, tenant: request.tenant,
            versionId: 0, locale: 'en', status: 'READY', name: code }))
    };
    const configuration = { product: { publication: { target: { runtimeRole: 'COMMERCE' }, maximumDependencies: 20, maximumActiveProducts: 20, maximumActivationReceipts: 20 },
        localization: { supportedLocales: ['en'], requiredLocales: ['en'] }, discovery: {} }, runtimeRole: { publication: 'STAGED' } };
    global.CONFIG = { get: name => configuration[name] };
    global.UTILS = { createModelName: name => name[0].toUpperCase() + name.slice(1) + 'Model' };
    global.NODICS = { getModels: () => Object.fromEntries(Object.keys(rows).map(name => [UTILS.createModelName(name), { versioned: true, rawSchema: { versionedReadMode: 'CURRENT' } }])) };
    const calls = [];
    global.SERVICE = { DefaultProductPublicationTargetService: target, DefaultProductPublicationGraphService: graph, DefaultProductLocalizationPolicyService: localization,
        DefaultProductLocalizedProjectionBuilderService: builder };
    for (const [schema, name] of Object.entries(graph.services())) SERVICE[name] = { get: async input => {
        calls.push(input);
        const result = rows[schema].filter(row => Object.entries(input.query).every(([key, value]) =>
            value && value.$in ? value.$in.includes(row[key]) : row[key] === value));
        return { result: structuredClone(result), count: result.length };
    } };
    const publication = { code: 'publication-a', domain: 'product', rootType: 'product', rootCode: 'p', sourceVersion: '0' };
    return { request, rows, calls, configuration, publication };
}

async function captured(f) {
    f.rows.product[0].publicationReferences = await graph.captureReferences(f.request, 'p', 'store-a');
    return graph.resolve(f.publication, f.request);
}

function stores(f) {
    const collections = new Map(), writes = [], indexed = [];
    for (const name of ['DefaultProductPublicationManifestService', 'DefaultProductPublicationPointerService', 'DefaultProductSearchProjectionService']) {
        const records = new Map(); collections.set(name, records);
        SERVICE[name] = {
            get: async input => {
                const result = [...records.values()].filter(row => Object.entries(input.query).every(([key, value]) => row[key] === value));
                return { result: structuredClone(result), count: result.length };
            },
            save: async input => {
                const current = records.get(input.model.code), managed = name !== 'DefaultProductSearchProjectionService';
                if (managed && input.model.revision !== (current ? current.revision : 0)) throw new Error('CAS conflict');
                const model = structuredClone(input.model);
                if (managed) model.revision += 1;
                records.set(model.code, model); writes.push({ name, model });
                return { result: model };
            }
        };
    }
    SERVICE.DefaultProductSearchPublicationService = {
        persistenceModel: (request, row) => row,
        policy: () => ({ searchIndexName: 'productLocalized' }),
        searchService: () => ({ doSave: async input => { indexed.push(input.model); return {}; } }),
        assertSearchSaveSucceeded: () => {}, refreshPublishedIndex: async () => {}
    };
    f.configuration.runtimeRole = { code: 'COMMERCE', publication: 'OPERATIONAL' };
    return { collections, writes, indexed };
}

test('capture seals all six schemas and category ancestors; activation never reloads latest', async () => {
    const f = fixture(), manifest = await captured(f);
    assert.equal(manifest.references.length, 8);
    f.rows.productLocalization.push({ ...f.rows.productLocalization[0], versionId: 1, name: 'Later' });
    f.calls.length = 0;
    const retained = await graph.resolve(f.publication, f.request);
    assert.equal(retained.version, manifest.version);
    assert.equal(retained.records.productLocalization[0].name, 'First');
    assert(f.calls.every(call => Number.isSafeInteger(call.query.versionId) && call.authData === f.request.authData));
    assert.equal(graph.projections(manifest, f.request)[0].status, 'STALE');
    assert.equal(graph.projections(manifest, f.request)[0].payload.price, undefined);
});

test('withdrawal hides content and repeated activation/rollback cycles use distinct retained operation keys', async () => {
    const f = fixture(), manifest = await captured(f); stores(f);
    const deploy = key => target.deploy({ manifest, projections: graph.projections(manifest, f.request), operationKey: key,
        publicationCode: 'pub', sourceVersion: '0', expectedVersion: null }, f.request);
    await deploy('cycle1');
    const withdrawn = await target.withdraw({ scope: manifest.scope, expectedVersion: manifest.version,
        publicationCode: 'pub', sourceVersion: '0', operationKey: 'withdraw1' }, f.request);
    assert.equal(withdrawn.activeVersion, null);
    assert.deepEqual(await target.activeVersions(f.request), []);
    assert.equal((await target.getStatus({ scope: manifest.scope }, f.request)).version, null);
    await deploy('cycle2');
    const pub = { ...f.publication, activationOperation: { key: 'cycle1' } };
    const previous = provider.operationKey(pub, 'rollback', manifest.version);
    pub.activationOperation.key = 'cycle2';
    assert.notEqual(provider.operationKey(pub, 'rollback', manifest.version), previous);
    assert.deepEqual(await target.activeVersions(f.request), [manifest.version]);
});

test('governed root capture saves through versioned owner then requests normal approval and recovers interrupted creation', async () => {
    const f = fixture();
    SERVICE.DefaultProductPublicationVersionProviderService = provider;
    let publication, writes = 0, failCreate = true;
    const effective = { ...graph, current: async (request, schema, query) => schema === 'product'
        ? [structuredClone(f.rows.product.at(-1))] : graph.current(request, schema, query) };
    SERVICE.DefaultProductPublicationGraphService = effective;
    SERVICE.DefaultProductService.update = async input => {
        assert.equal(input.query.versionId, 0); writes++;
        f.rows.product.push({ ...structuredClone(f.rows.product[0]), ...input.model, versionId: 1 });
    };
    SERVICE.DefaultPublicationLifecycleService = {
        getRepository: () => ({ get: async () => publication }),
        get: async () => publication,
        create: async input => {
            if (failCreate) { failCreate = false; throw new Error('lost create'); }
            return publication = { ...input.publication, state: 'STAGED', revision: 0 };
        },
        validate: async () => publication = { ...publication, state: 'VALIDATED', revision: 2 },
        requestApproval: async () => publication = { ...publication, state: 'PENDING_APPROVAL', revision: 3 }
    };
    const input = { publicationCode: 'pub', productCode: 'p', storeCode: 'store-a', versionId: 0 };
    await assert.rejects(governed.create(f.request, input), /lost create/);
    assert.equal((await governed.create(f.request, input)).state, 'PENDING_APPROVAL');
    assert.equal((await governed.create(f.request, input)).sourceVersion, '1');
    assert.equal(writes, 1);
});

test('target facade rejects token-only publication authority and callback domain is fixed', async () => {
    const f = fixture(), manifest = await captured(f); stores(f);
    f.request.authData.tenant = f.request.tenant;
    SERVICE.DefaultServiceTokenService = { requireRuntimePrincipal: () => ({}) };
    SERVICE.DefaultProductPublicationTargetService = target;
    SERVICE.DefaultProductPublicationTransportService = { authorize: async () => ({ authorized: true, fingerprint: 'forged' }) };
    f.request.payload = { manifest, projections: graph.projections(manifest, f.request), operationKey: 'op',
        publicationCode: 'pub', sourceVersion: '0', expectedVersion: null };
    await assert.rejects(facade.targetDeploy(f.request), /authorization mismatch/);
    SERVICE.DefaultPublicationApprovalCallbackService = { applyDecision: async (request, scope) => scope };
    f.request.payload.domain = 'media';
    assert.deepEqual(await facade.applyPublicationDecision(f.request), { domain: 'product', actionKey: 'product.applyPublicationDecision' });
});

test('transport uses explicit nModule authorities and runtime token, never caller bearer or local fallback', async () => {
    const f = fixture();
    f.configuration.product.publication.target = { moduleName: 'product', connectionName: 'online', connectionType: 'abstract', runtimeRole: 'COMMERCE' };
    global.NODICS.getInternalAuthToken = () => 'runtime-token';
    let call;
    SERVICE.DefaultModuleService = { invokeModule: async input => { call = input; return {}; } };
    f.request.httpRequest = { headers: { authorization: 'Bearer caller-token' } };
    await transport.deploy({ operationKey: 'op' }, f.request);
    assert.equal(call.local, false); assert.equal(call.header.Authorization, 'Bearer runtime-token');
    assert.equal(call.targetAuthority.runtimeRole, 'COMMERCE');
    f.configuration.product.publication.target.connectionName = 'default';
    assert.throws(() => transport.deploy({}, f.request), /authority/);
});

test('canonical operational Commerce serves Product while Staged and wrong authorities reject', async () => {
    const f = fixture();
    f.configuration.runtimeRole = { code: 'COMMERCE', publication: 'OPERATIONAL' };
    assert.doesNotThrow(() => target.assertOnline());
    f.configuration.product.publication.source = { moduleName: 'product', connectionName: 'staged', connectionType: 'abstract', runtimeRole: 'COMMERCE_STAGED' };
    NODICS.getInternalAuthToken = () => 'runtime-token';
    let call;
    SERVICE.DefaultModuleService = { invokeModule: async input => { call = input; return {}; } };
    await transport.authorize({ operationKey: 'op' }, f.request);
    assert.equal(call.targetAuthority.runtimeRole, 'COMMERCE_STAGED');
    assert.equal(f.configuration.runtimeRole.publication, 'OPERATIONAL');
    assert.throws(() => transport.getStatus({}, f.request), /authority/);
    f.configuration.runtimeRole.publication = 'STAGED';
    assert.throws(() => target.assertOnline(), /authority/);
    f.configuration.runtimeRole = { code: 'OTHER', publication: 'OPERATIONAL' };
    assert.throws(() => target.assertOnline(), /authority/);
    f.configuration.product.publication.target.runtimeRole = 'OTHER';
    assert.doesNotThrow(() => target.assertOnline());
    f.configuration.product.publication.target.runtimeRole = '';
    assert.throws(() => target.assertOnline(), /authority/);
});

test('governed routes and provider selections are disabled pending migration; fixed workflow is explicitly installable', () => {
    const routes = require('../src/router/routers').product.operator, properties = require('../config/properties');
    for (const key of ['createGoverned', 'applyPublicationDecision', 'targetDeploy', 'targetStatus', 'targetRollback', 'targetWithdraw', 'authorizeTarget']) {
        assert.equal(routes[key].active, true); assert.equal(routes[key].secured, true);
        assert.equal(properties.apiExposure.categories[routes[key].apiExposure].enabled, false);
    }
    assert.equal(properties.publish.providers.domainAdapters.product, null);
    assert.equal(properties.product.discovery.activationService, null);
    const release = require('../data/manifest.json').sections.productPublicationWorkflow;
    assert.equal(release.selectionPolicy, 'EXPLICIT');
    assert.equal(release.sourceRoot, 'init-v002');
    assert.equal(release.version, '2.0.0');
    const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
    for (const [file, checksum] of Object.entries(release.files)) {
        assert.ok(file.startsWith('init-v002/'));
        assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname, '../data', file))).digest('hex'), checksum);
    }
});

test('version qualification uses generated model registry names, not raw schema keys', () => {
    const f = fixture();
    assert.ok(NODICS.getModels().ProductModel);
    assert.equal(NODICS.getModels().product, undefined);
    assert.doesNotThrow(() => graph.assertVersioned(f.request, 'product'));
    global.NODICS.getModels = () => ({ product: { versioned: true, rawSchema: { versionedReadMode: 'CURRENT' } } });
    assert.throws(() => graph.assertVersioned(f.request, 'product'), /qualified/);
});

test('unqualified schemas, truncated membership, duplicate and corrupt references reject', async () => {
    const f = fixture(); await captured(f);
    global.NODICS.getModels = () => ({});
    await assert.rejects(graph.resolve(f.publication, f.request), /qualified/);
    const g = fixture(); await captured(g);
    g.rows.product[0].publicationReferences.records.push(g.rows.product[0].publicationReferences.records[0]);
    await assert.rejects(graph.resolve(g.publication, g.request), /Duplicate/);
    const h = fixture(); await captured(h); h.rows.productLocalization[0].name = 'Mutated history';
    await assert.rejects(graph.resolve(h.publication, h.request), /changed/);
    const j = fixture(); SERVICE.DefaultProductLocalizationService.get = async () => ({ result: [], count: 30 });
    await assert.rejects(graph.captureReferences(j.request, 'p', 'store-a'), /incomplete/);
});

test('missing parent, cycles and foreign variant localization reject before publication', async () => {
    const f = fixture(); f.rows.category[1].parentCode = 'leaf';
    await assert.rejects(captured(f), /cycle/);
    const g = fixture(); g.rows.productVariantLocalization[0].variantCode = 'unrelated';
    await assert.rejects(captured(g), /locale is not ready/);
    const h = fixture(); h.rows.category.pop();
    await assert.rejects(captured(h), /missing/);
});

test('hidden preparation does not activate; CAS receipt retry and retained rollback preserve content', async () => {
    const f = fixture(), manifest = await captured(f), db = stores(f);
    const input = { manifest, projections: graph.projections(manifest, f.request), operationKey: 'op1', publicationCode: 'publication-a', sourceVersion: '0', expectedVersion: null };
    await target.prepare(input, f.request);
    assert.equal((await target.getStatus({ scope: manifest.scope }, f.request)).version, null);
    assert(db.indexed.every(row => row.status === 'STALE'));
    const first = await target.deploy(input, f.request);
    assert.equal(first.previousOnlineVersion, null); assert.equal(first.receipt.committed, true);
    assert.equal((await target.deploy(input, f.request)).replayed, true);
    assert.deepEqual(await target.activeVersions(f.request), [manifest.version]);
    f.configuration.product.discovery.activationService = 'DefaultProductPublicationTargetService';
    f.configuration.product.discovery.activationScopes = [{ tenant: f.request.tenant, storeCode: f.request.storeCode }];
    const reader = { ...discovery, publicationSelections: new WeakMap(), searchSelected: async (request, query) =>
        [...db.collections.get('DefaultProductSearchProjectionService').values()].filter(row =>
            row.tenant === request.tenant && row.storeCode === request.storeCode && query.publicationVersion.includes(row.publicationVersion)) };
    assert.equal((await reader.search({ ...f.request }, {}, {}))[0].payload.name, 'First');
    const g = fixture(); g.rows.productLocalization[0].name = 'Second';
    const second = await captured(g);
    // Reinstall the same target stores without losing retained state.
    for (const [name, records] of db.collections) SERVICE[name] = {
        get: async input => ({ result: structuredClone([...records.values()].filter(row => Object.entries(input.query).every(([k, v]) => row[k] === v))) }),
        save: async input => {
            const prior = records.get(input.model.code);
            if (name !== 'DefaultProductSearchProjectionService' && input.model.revision !== (prior ? prior.revision : 0)) throw new Error('CAS conflict');
            records.set(input.model.code, { ...structuredClone(input.model), revision: (prior ? prior.revision : 0) + 1 }); return {};
        }
    };
    SERVICE.DefaultProductSearchPublicationService = { persistenceModel: (r, m) => m, policy: () => ({}),
        searchService: () => ({ doSave: async () => ({}) }), assertSearchSaveSucceeded: () => {}, refreshPublishedIndex: async () => {} };
    g.configuration.runtimeRole = { code: 'COMMERCE', publication: 'OPERATIONAL' };
    g.configuration.product.discovery.activationService = 'DefaultProductPublicationTargetService';
    g.configuration.product.discovery.activationScopes = [{ tenant: g.request.tenant, storeCode: g.request.storeCode }];
    const activated = await target.deploy({ manifest: second, projections: graph.projections(second, g.request), operationKey: 'op2', publicationCode: 'publication-b', sourceVersion: '0', expectedVersion: manifest.version }, g.request);
    assert.equal(activated.previousOnlineVersion, manifest.version);
    assert.equal((await reader.search({ ...g.request }, {}, {}))[0].payload.name, 'Second');
    const restored = await target.rollback({ scope: second.scope, version: manifest.version, expectedVersion: second.version,
        operationKey: 'rollback', publicationCode: 'publication-b', sourceVersion: '0' }, g.request);
    assert.equal(restored.version, manifest.version);
    assert.equal((await reader.search({ ...g.request }, {}, {}))[0].payload.name, 'First');
    assert.equal(db.collections.get('DefaultProductSearchProjectionService').size, 2);
    await assert.rejects(target.rollback({ scope: second.scope, version: second.version, expectedVersion: 'stale',
        operationKey: 'bad', publicationCode: 'publication-b', sourceVersion: '0' }, g.request), /conflict/);
});

test('interrupted prepare leaves prior pointer unchanged and retry retains expected baseline', async () => {
    const f = fixture(), manifest = await captured(f), db = stores(f);
    const input = { manifest, projections: graph.projections(manifest, f.request), operationKey: 'op', publicationCode: 'pub', sourceVersion: '0', expectedVersion: null };
    SERVICE.DefaultProductSearchPublicationService.refreshPublishedIndex = async () => { throw new Error('index unavailable'); };
    await assert.rejects(target.deploy(input, f.request), /index unavailable/);
    assert.equal(db.collections.get('DefaultProductPublicationPointerService').size, 0);
    assert.equal(db.collections.get('DefaultProductPublicationManifestService').size, 1);
    SERVICE.DefaultProductSearchPublicationService.refreshPublishedIndex = async () => {};
    assert.equal((await target.deploy(input, f.request)).version, manifest.version);
    await assert.rejects(target.switchVersion({ scope: manifest.scope, version: manifest.version, expectedVersion: '',
        operationKey: 'op', operation: 'ROLLBACK', publicationCode: 'pub', sourceVersion: '0' }, f.request), /key conflict/);
});

test('tampered transported payload, foreign scope and retained content reject', async () => {
    const f = fixture(), manifest = await captured(f), db = stores(f);
    const input = { manifest, projections: structuredClone(graph.projections(manifest, f.request)), operationKey: 'op', publicationCode: 'pub', sourceVersion: '0', expectedVersion: null };
    input.projections[0].payload.name = 'Tampered';
    await assert.rejects(target.prepare(input, f.request), /checksum/);
    assert.equal(db.writes.length, 0);
    input.projections = graph.projections(manifest, f.request);
    await target.prepare(input, f.request);
    db.collections.get('DefaultProductSearchProjectionService').get(input.projections[0].code).payload.name = 'Changed';
    await assert.rejects(target.switchVersion({ scope: manifest.scope, version: manifest.version, expectedVersion: '',
        operationKey: 'op', operation: 'ACTIVATE', publicationCode: 'pub', sourceVersion: '0' }, f.request), /changed/);
    await assert.rejects(target.getStatus({ scope: { ...manifest.scope, tenant: 'other' } }, f.request), /scope/);
});

test('nPublish provider revalidates approved closure, stable operation and exact transport result', async () => {
    const f = fixture(), manifest = await captured(f), calls = [];
    f.publication.dependencies = adapter.resolveDependencies(f.publication, manifest);
    f.publication.validation = adapter.validate(f.publication, manifest, f.request, f.publication.dependencies);
    f.configuration.product.publication.targetTransportProvider = 'SelectedTransport';
    f.publication.activationOperation = { key: 'retained-nPublish-key', previousOnlineVersion: 'retained' };
    const receipt = { version: manifest.version, activeVersion: manifest.version, receipt: { committed: true,
        targetVersion: manifest.version, previousOnlineVersion: 'retained', operationKey: 'retained-nPublish-key',
        sourceVersion: '0', publicationCode: f.publication.code } };
    SERVICE.SelectedTransport = { deploy: async input => { calls.push(input); return receipt; } };
    assert.equal(await provider.activate(f.publication, f.request), receipt);
    assert.equal(lifecycle.activationReceipt(provider, f.publication, receipt), receipt.receipt);
    f.publication.revision = 100;
    await provider.activate(f.publication, f.request);
    assert.equal(calls[0].operationKey, calls[1].operationKey);
    receipt.activeVersion = 'newer-activation';
    await assert.rejects(provider.activate(f.publication, f.request), /receipt mismatch/);
    receipt.activeVersion = manifest.version;
    f.publication.validation.manifestVersion = 'wrong';
    await assert.rejects(provider.activate(f.publication, f.request), /changed/);
});

test('activated discovery pins versions across pages and never trusts request version or fallback leakage', async () => {
    const f = fixture(), version = 'a'.repeat(64), queries = [];
    let reads = 0;
    f.configuration.product.discovery.activationService = 'ActiveReader';
    SERVICE.ActiveReader = { activeVersions: async () => { reads++; return [version]; } };
    const service = { ...discovery, publicationSelections: new WeakMap(), searchSelected: async (request, query) => {
        queries.push(query); return [{ tenant: request.tenant, storeCode: request.storeCode, locale: request.locale, publicationVersion: version }];
    } };
    f.request.query = { publicationVersion: 'unapproved' };
    await service.search(f.request, { status: 'CURRENT' }, {});
    await service.search(f.request, {}, { pageNumber: 2 });
    assert.equal(reads, 1); assert.deepEqual(queries[0].publicationVersion, [version]);
    assert.deepEqual(service.projectionStoreQuery(queries[0]).publicationVersion, { $in: [version] });
    assert.equal(queries[0].status, 'STALE');
    service.searchSelected = async () => [{ publicationVersion: 'other' }];
    await assert.rejects(service.search(f.request, {}, {}), /escaped/);
    delete SERVICE.ActiveReader;
    await assert.rejects(service.search({ ...f.request }, {}, {}), /unavailable/);
});

test('activated consumer summaries retain store scope and variant lookup reads only selected content', async () => {
    const f = fixture(), version = 'a'.repeat(64);
    f.configuration.product.discovery.activationService = 'ActiveReader';
    SERVICE.ActiveReader = { activeVersions: async () => [version] };
    const enrichment = require('../src/service/defaultProductSearchEnrichmentService');
    SERVICE.DefaultProductSearchEnrichmentService = enrichment;
    const calls = [];
    let sellingStore = { tenant: f.request.tenant, code: f.request.storeCode,
        enterpriseRef: { code: 'enterprise-a' }, status: 'ACTIVE', defaultCurrency: 'POINTS' };
    SERVICE.DefaultStoreService = { get: async input => {
        assert.deepEqual(input.query, { tenant: f.request.tenant, code: f.request.storeCode });
        return { result: [sellingStore] };
    } };
    SERVICE.DefaultCustomerPriceSummaryService = { summarize: async input => { calls.push(input); return { p: { unitAmount: '10', currency: 'USD' } }; } };
    SERVICE.DefaultCustomerAvailabilitySummaryService = { summarize: async input => { calls.push(input); return { p: { available: true, status: 'IN_STOCK' } }; } };
    const row = { code: 'projection-p', status: 'STALE', tenant: f.request.tenant, storeCode: f.request.storeCode, locale: f.request.locale,
        productCode: 'p', enterpriseCode: 'enterprise-a', publicationVersion: version, payload: { variantCodes: ['v'], variantSkuMap: { v: 'trusted' }, price: { unitAmount: 'stale' } } };
    const original = structuredClone(row);
    let retainedRows = [structuredClone(row), { ...structuredClone(row), code: 'projection-p2', productCode: 'p2' }];
    SERVICE.DefaultProductSearchProjectionService = { get: async input => ({ result: retainedRows.filter(item => input.query.code.$in.includes(item.code)) }) };
    const service = { ...discovery, publicationSelections: new WeakMap(), searchSelected: async (request, query) => {
        assert.equal(query.status, 'STALE'); assert.deepEqual(query.publicationVersion, [version]); return [row];
    } };
    const request = { ...f.request, enterpriseCode: 'enterprise-a', productCode: 'p', variantCode: 'v' };
    const result = await service.search(request, service.query(request), {});
    assert.equal(result[0].payload.price.unitAmount, '10');
    assert.equal(result[0].payload.availability.available, true);
    assert(calls.every(call => call.storeCode === request.storeCode && call.enterpriseCode === request.enterpriseCode));
    calls.length = 0;
    await enrichment.consumerSummaries(request, [row, { ...row, code: 'projection-p2', productCode: 'p2' }, row]);
    assert.equal(calls.length, 2, 'One summary call per owner, not per row');
    assert.deepEqual(calls[0].productCodes, ['p', 'p2']);
    assert.equal(calls[0].currency, 'POINTS', 'Selling Store currency overrides the global USD summary default');
    assert.deepEqual(calls[1].products, [{ productCode: 'p', skus: ['trusted'] }, { productCode: 'p2', skus: ['trusted'] }]);
    assert.equal(calls[0].authData.tenant, request.tenant);
    assert.deepEqual(calls[0].authData.groups, ['serviceAccountUserGroup']);
    const publicRequest = { ...request, enterpriseCode: undefined, entCode: 'untrusted-header', authData: undefined,
        query: { enterpriseCode: 'untrusted-query' } };
    const publicBefore = structuredClone(publicRequest);
    calls.length = 0;
    await enrichment.consumerSummaries(publicRequest, [{ ...row, enterpriseCode: undefined }]);
    assert(calls.every(call => call.enterpriseCode === 'enterprise-a' && call.authData.enterpriseCode === 'enterprise-a'));
    assert.deepEqual(publicRequest, publicBefore);
    calls.length = 0;
    await enrichment.consumerSummaries({ ...publicRequest, currency: 'USD', query: { currency: 'USD' } }, [row]);
    assert.equal(calls[0].currency, 'POINTS', 'Caller currency must not replace Store authority');
    sellingStore = { ...sellingStore, defaultCurrency: 'AED' };
    calls.length = 0;
    await enrichment.consumerSummaries(publicRequest, [row]);
    assert.equal(calls[0].currency, 'AED', 'Other Store currencies remain independent');
    for (const invalid of [{ enterpriseRef: { code: 'foreign' } }, { tenant: 'foreign' },
        { code: 'foreign' }, { status: 'INACTIVE' }, { active: false }, { defaultCurrency: '' }]) {
        const valid = sellingStore;
        sellingStore = { ...valid, ...invalid };
        await assert.rejects(enrichment.consumerSummaries(publicRequest, [row]), /selling currency/);
        sellingStore = valid;
    }
    await assert.rejects(enrichment.consumerSummaries({ ...request, authData: { enterpriseCode: 'foreign' } }, [row]), /enterprise scope/);
    await assert.rejects(enrichment.consumerSummaries(publicRequest, [row, { ...row, enterpriseCode: 'foreign' }]), /scope mismatch/);
    await assert.rejects(enrichment.consumerSummaries(publicRequest, [{ ...row, storeCode: 'foreign' }]), /scope mismatch/);
    retainedRows[0].enterpriseCode = undefined;
    await assert.rejects(enrichment.consumerSummaries(publicRequest, [{ ...row, enterpriseCode: undefined }]), /enterprise scope/);
    retainedRows[0].enterpriseCode = 'enterprise-a';
    assert.equal(await service.resolveVariantSku(request), 'trusted');
    assert.equal(await service.resolveVariantSku({ ...request, variantCode: undefined, sku: 'trusted' }), 'trusted');
    assert.equal(await service.resolveVariantSku({ ...request, variantCode: undefined, sku: 'foreign' }), undefined);
    SERVICE.DefaultProductSearchEnrichmentService = { consumerSummaries: () => assert.fail('Identity lookup must not enrich') };
    assert.equal(await service.resolveVariantSku(request), 'trusted');
    SERVICE.DefaultProductSearchEnrichmentService = enrichment;
    assert.equal(await service.resolveVariantSku({ ...request, variantCode: 'unknown' }), undefined);
    assert.deepEqual(row, original);
    const originalAuth = structuredClone(request.authData);
    for (const [domain, ownerName, summaryName] of [
        ['pricing', 'DefaultPricingPublicationService', 'DefaultCustomerPriceSummaryService'],
        ['inventory', 'DefaultInventoryPublicationService', 'DefaultCustomerAvailabilitySummaryService']
    ]) {
        f.configuration[domain] = { publication: { delivery: { enabled: true } } };
        await assert.rejects(service.search(request, service.query(request), {}), /owner is unavailable/);
        SERVICE[ownerName] = { deliveryEnabled: input => {
            assert.equal(input.storeCode, request.storeCode);
            assert.equal(input.tenant, request.tenant);
            assert.equal(input.enterpriseCode, request.enterpriseCode);
            assert.deepEqual(input.authData, { ...originalAuth, enterpriseCode: 'enterprise-a', entCode: 'enterprise-a' }); return true;
        } };
        const summary = SERVICE[summaryName];
        delete SERVICE[summaryName];
        await assert.rejects(service.search(request, service.query(request), {}), /summary provider is unavailable/);
        SERVICE[summaryName] = { summarize: async () => { throw new Error('Owner receipt unavailable'); } };
        await assert.rejects(service.search(request, service.query(request), {}), /Owner receipt unavailable/);
        SERVICE[summaryName] = summary;
        delete SERVICE.DefaultProductSearchEnrichmentService;
        await assert.rejects(service.search(request, service.query(request), {}), /enrichment provider is unavailable/);
        SERVICE.DefaultProductSearchEnrichmentService = enrichment;
        delete f.configuration[domain];
        delete SERVICE[ownerName];
    }
    assert.deepEqual(request.authData, originalAuth);
    assert.deepEqual(row, original);
    SERVICE.ActiveReader.activeVersions = async () => [];
    assert.equal(await service.resolveVariantSku({ ...request }), undefined);
    assert.equal(await service.resolveVariantSku({ ...request, variantCode: undefined, sku: 'trusted' }), undefined);
});

test('store-scoped activation isolates rollout, pins reads and never falls back for selected empty stores', async () => {
    const f = fixture(), version = 'a'.repeat(64);
    const policy = f.configuration.product.discovery;
    policy.activationService = 'ActiveReader';
    policy.activationScopes = [{ tenant: 'tenant-a', storeCode: 'store-a' }];
    const originalAuth = structuredClone(f.request.authData);
    let reads = 0, searches = 0;
    SERVICE.ActiveReader = { activeVersions: async request => {
        reads++; assert.deepEqual(request.authData.userGroups, ['serviceAccountUserGroup']);
        assert.equal(request.authData.tenant, 'tenant-a'); return [];
    } };
    const service = { ...discovery, publicationSelections: new WeakMap(), searchSelected: async (request, query) => {
        searches++; assert.equal(query.status, 'CURRENT'); return [{ productCode: 'legacy' }];
    } };
    assert.deepEqual(await service.search(f.request, { status: 'CURRENT' }, {}), []);
    assert.deepEqual(await service.search(f.request, { status: 'CURRENT' }, {}), []);
    assert.equal(reads, 1); assert.equal(searches, 0);
    assert.deepEqual(f.request.authData, originalAuth);
    for (const request of [{ ...f.request, storeCode: 'other' }, { ...f.request, tenant: 'other' }]) {
        request.activationScopes = policy.activationScopes;
        assert.deepEqual(await service.search(request, { status: 'CURRENT' }, {}), [{ productCode: 'legacy' }]);
    }
    assert.equal(reads, 1);
    SERVICE.ActiveReader.activeVersions = async () => [version];
    service.searchSelected = async (request, query) => [{ tenant: request.tenant, storeCode: request.storeCode,
        locale: request.locale, publicationVersion: query.publicationVersion[0] }];
    assert.equal((await service.search({ ...f.request }, {}, {}))[0].publicationVersion, version);
    policy.activationService = null;
    await assert.rejects(service.search({ ...f.request }, {}, {}), /unavailable/);
    for (const scopes of ['all', [{ tenant: '*', storeCode: 'store-a' }],
        Array(101).fill({ tenant: 'tenant-a', storeCode: 'store-a' }),
        [{ tenant: 'tenant-a', storeCode: 'store-a', productCode: 'p' }],
        [{ tenant: 'tenant-a', storeCode: 'store-a' }, { tenant: 'tenant-a', storeCode: 'store-a' }]]) {
        policy.activationScopes = scopes;
        await assert.rejects(service.search({ ...f.request }, {}, {}), /bounded exact/);
    }
});

test('target records reuse managed concurrency and only six qualified sources select versioning', () => {
    const metadata = require('../package.json');
    assert.deepEqual(metadata.requiredModules, ['vDatabase', 'vService']);
    for (const name of ['productPublicationManifest', 'productPublicationPointer']) {
        assert.equal(concurrency.getField(schemas[name]), 'revision');
        assert.equal(schemas[name].router.enabled, false);
        assert.equal(schemas[name].backoffice.mutationMode, 'READ_ONLY');
    }
    const policy = require('../config/properties').schemaPolicies.product.catalogueVersioned;
    assert.deepEqual(policy, { isVersionedEnabled: false });
    for (const name of Object.keys(graph.services())) assert(schemas[name].schemaPolicies.includes('catalogueVersioned'));
    for (const name of ['productPublication', 'productSearchProjection', 'productPublicationManifest', 'productPublicationPointer']) {
        assert(!schemas[name].schemaPolicies.includes('catalogueVersioned'));
    }
});

test('all six catalogue sources deny generic history deletion in every runtime role without changing ordinary consumers', () => {
    const f = fixture();
    const authoring = require('../../../../../../nodics.foundation/modules/nDatabase/database/src/service/schema/defaultSchemaAuthoringPolicyService');
    const oldClasses = global.CLASSES;
    global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };
    NODICS.getModule = () => ({ rawSchema: { ...schemas, ordinary: { isVersionedEnabled: false } } });
    try {
        for (const role of ['STAGED', 'ONLINE', 'OPERATIONAL', 'UNASSIGNED']) {
            f.configuration.runtimeRole.publication = role;
            for (const name of Object.keys(graph.services())) {
                assert.throws(() => authoring.assertMutationAllowed('product', name, 'remove'), error => error.code === 'ERR_AUTH_00003');
                assert(!schemas[name].backoffice.operations.includes('remove'));
                if (role === 'STAGED') {
                    for (const operation of ['create', 'update']) assert.doesNotThrow(() => authoring.assertMutationAllowed('product', name, operation));
                }
            }
            assert.doesNotThrow(() => authoring.assertMutationAllowed('product', 'ordinary', 'remove'));
        }
    } finally { global.CLASSES = oldClasses; }
});

test('missing publish runtime dependency fails clearly before source reads or writes', async () => {
    const f = fixture();
    SERVICE.DefaultProductPublicationVersionProviderService = provider;
    delete SERVICE.DefaultPublicationLifecycleService;
    await assert.rejects(governed.create(f.request, { publicationCode: 'new', productCode: 'p', storeCode: 'store-a', versionId: 0 }),
        /requires the publish module active on the Staged runtime/);
    assert.equal(f.calls.length, 0);
});

test('target controller uses canonical local persistence authority only after runtime and scope checks without changing caller', async () => {
    const f = fixture();
    const controller = require('../src/controller/defaultProductPublicationController');
    const acl = require('../../../../../../nodics.foundation/modules/nDatabase/database/src/service/schema/defaultSchemaAccessHandlerService');
    const oldFacade = global.FACADE, oldClasses = global.CLASSES;
    global.FACADE = { DefaultProductPublicationFacade: facade };
    global.CLASSES = { NodicsError: class extends Error { constructor(message) { super(String(message)); } } };
    UTILS.isBlank = value => !value || Object.keys(value).length === 0;
    f.configuration.runtimeRole = { code: 'COMMERCE', publication: 'OPERATIONAL' };
    const auth = { tenant: 'tenant-a', serviceId: 'verified-runtime', userGroups: ['serviceAccountUserGroup'] };
    f.request.authData = auth;
    f.request.httpRequest = { body: { scope: { tenant: 'tenant-a', productCode: 'p', storeCode: 'store-a' } } };
    let calls = 0;
    let elevations = 0;
    SERVICE.DefaultIdentityGovernanceService = { getSystemAuthData: () => {
        elevations++;
        return { isSystem: true, userGroups: ['systemGroup'], permissions: [] };
    } };
    SERVICE.DefaultServiceTokenService = { requireRuntimePrincipal: request => assert.strictEqual(request.authData, auth) };
    SERVICE.DefaultProductPublicationPointerService = { get: async request => {
        calls++;
        assert.notStrictEqual(request.authData, auth);
        assert.equal(request.authData.serviceId, auth.serviceId);
        assert.equal(acl.getAccessPoint(request.authData, { systemGroup: 10 }), 10);
        return { result: [] };
    } };
    try {
        assert.equal((await controller.targetStatus(f.request)).data.version, null);
        assert.equal(calls, 1);
        assert.deepEqual(auth.userGroups, ['serviceAccountUserGroup']);
        assert.equal(auth.isSystem, undefined);
        const before = elevations;
        f.request.httpRequest.body.scope.tenant = 'foreign';
        await assert.rejects(controller.targetStatus(f.request), /scope/);
        assert.equal(elevations, before);
        f.request.httpRequest.body.scope.tenant = 'tenant-a';
        SERVICE.DefaultServiceTokenService.requireRuntimePrincipal = () => { throw new Error('invalid runtime principal'); };
        await assert.rejects(controller.targetStatus(f.request), /invalid runtime/);
        assert.equal(elevations, before);
    } finally { global.FACADE = oldFacade; global.CLASSES = oldClasses; }
});

test('target mutation retains transport caller and elevates only after exact source authorization', async () => {
    const f = fixture();
    f.configuration.runtimeRole = { code: 'COMMERCE', publication: 'OPERATIONAL' };
    const auth = { tenant: 'tenant-a', entCode: 'default', serviceId: 'runtime' };
    f.request.authData = auth;
    f.request.payload = { scope: { tenant: 'tenant-a', productCode: 'p', storeCode: 'store-a' },
        publicationCode: 'pub', sourceVersion: '1', operationKey: 'op', expectedVersion: 'digest' };
    let allowed = false, elevations = 0, writes = 0;
    SERVICE.DefaultServiceTokenService = { requireRuntimePrincipal: () => auth };
    SERVICE.DefaultIdentityGovernanceService = { getSystemAuthData: () => {
        elevations++; return { isSystem: true, userGroups: ['systemGroup'] };
    } };
    SERVICE.DefaultProductPublicationTransportService = { authorize: async (command, request) => {
        assert.deepEqual(request.authData, auth);
        assert.notStrictEqual(request.authData, auth);
        assert.equal(request.authData.isSystem, undefined);
        return { authorized: allowed, fingerprint: graph.hash(command) };
    } };
    SERVICE.DefaultProductPublicationTargetService = { ...target, withdraw: async (input, request) => {
        writes++; assert.equal(request.authData.isSystem, true); assert.equal(request.authData.entCode, 'default');
        return { withdrawn: true };
    } };
    await assert.rejects(facade.targetWithdraw(f.request), /authorization mismatch/);
    assert.equal(elevations, 0); assert.equal(writes, 0);
    allowed = true;
    await facade.targetWithdraw(f.request);
    assert.equal(elevations, 1); assert.equal(writes, 1);
    assert.strictEqual(f.request.authData, auth); assert.equal(auth.isSystem, undefined);
});

test('reverse authorization scopes local reads and still requires exact stored publication intent', async () => {
    const f = fixture(), manifest = await captured(f);
    const auth = { tenant: 'tenant-a', entCode: 'default', serviceId: 'verified-target' };
    f.request.authData = auth;
    const publication = { ...f.publication, state: 'ACTIVATING', activationOperation: { key: 'op', previousOnlineVersion: null } };
    let reads = 0, elevations = 0;
    SERVICE.DefaultServiceTokenService = { requireRuntimePrincipal: request => assert.strictEqual(request.authData, auth) };
    SERVICE.DefaultIdentityGovernanceService = { getSystemAuthData: () => { elevations++; return { isSystem: true, userGroups: ['systemGroup'] }; } };
    SERVICE.DefaultPublicationLifecycleService = { get: async request => {
        reads++; assert.equal(request.authData.isSystem, true); assert.equal(request.authData.entCode, 'default'); return publication;
    } };
    SERVICE.DefaultProductPublicationVersionProviderService = { ...provider, getVersion: async (record, request) => {
        assert.equal(request.authData.isSystem, true); return manifest;
    } };
    const input = { operation: 'deploy', publicationCode: publication.code, sourceVersion: publication.sourceVersion,
        scope: manifest.scope, operationKey: 'op', expectedVersion: null, version: manifest.version };
    assert.equal((await governed.authorizeTarget(f.request, input)).authorized, true);
    assert.equal(auth.isSystem, undefined); assert.equal(auth.userGroups, undefined);
    await assert.rejects(governed.authorizeTarget(f.request, { ...input, operationKey: 'forged' }), /not currently authorized/);
    publication.state = 'APPROVED';
    await assert.rejects(governed.authorizeTarget(f.request, input), /not currently authorized/);
    const before = { reads, elevations };
    await assert.rejects(governed.authorizeTarget(f.request, { ...input, scope: { ...input.scope, tenant: 'foreign' } }), /scope/);
    SERVICE.DefaultServiceTokenService.requireRuntimePrincipal = () => { throw new Error('invalid runtime'); };
    await assert.rejects(governed.authorizeTarget(f.request, input), /invalid runtime/);
    assert.deepEqual({ reads, elevations }, before);
});

test('target execution uses detached payload and verified caller context despite mutation during authorization', async () => {
    const f = fixture();
    f.configuration.runtimeRole = { code: 'COMMERCE', publication: 'OPERATIONAL' };
    f.request.authData = { tenant: 'tenant-a', entCode: 'default', serviceId: 'verified-runtime',
        runtimeScope: { serverCode: 'verified-server' } };
    const verifiedAuth = structuredClone(f.request.authData);
    const input = { manifest: { scope: { tenant: 'tenant-a', productCode: 'p', storeCode: 'store-a' },
        version: 'original', records: { product: [{ name: 'original content' }] } },
        projections: [{ payload: { name: 'original projection' } }], publicationCode: 'pub', sourceVersion: '1',
        operationKey: 'op', expectedVersion: null };
    f.request.payload = input;
    const expected = structuredClone(input);
    SERVICE.DefaultServiceTokenService = { requireRuntimePrincipal: () => true };
    SERVICE.DefaultIdentityGovernanceService = { getSystemAuthData: () => ({ isSystem: true }) };
    SERVICE.DefaultProductPublicationTransportService = { authorize: async (command, transportRequest) => {
        const fingerprint = graph.hash(command);
        await Promise.resolve();
        input.manifest.scope.storeCode = 'foreign-store';
        input.manifest.version = 'changed';
        input.manifest.records.product[0].name = 'changed content';
        input.projections[0].payload.name = 'changed projection';
        input.operationKey = 'changed-op';
        f.request.tenant = 'foreign-tenant';
        f.request.authData.tenant = 'foreign-tenant';
        f.request.authData.entCode = 'foreign-enterprise';
        f.request.authData.serviceId = 'foreign-caller';
        f.request.authData.runtimeScope.serverCode = 'foreign-server';
        assert.equal(transportRequest.tenant, 'tenant-a');
        assert.deepEqual(transportRequest.authData, verifiedAuth);
        return { authorized: true, fingerprint };
    } };
    SERVICE.DefaultProductPublicationTargetService = { ...target, deploy: async (executed, localRequest) => {
        assert.deepEqual(executed, expected);
        assert.notStrictEqual(executed, input);
        assert.equal(localRequest.tenant, 'tenant-a');
        assert.deepEqual(localRequest.authData, { ...verifiedAuth, isSystem: true });
        return { deployed: true };
    } };
    assert.deepEqual(await facade.targetDeploy(f.request), { deployed: true });
    assert.equal(input.manifest.version, 'changed');
    assert.equal(f.request.authData.isSystem, undefined);
});

test('prepare and retained reindex send detached canonical projection documents without storage metadata', async () => {
    const f = fixture(), manifest = await captured(f), store = stores(f);
    const save = SERVICE.DefaultProductSearchProjectionService.save;
    SERVICE.DefaultProductSearchProjectionService.save = async input => save({ ...input,
        model: { ...input.model, _id: 'mongo-id', revision: 7, created: new Date(), updated: new Date(), accessGroups: ['private'] } });
    const documents = [];
    SERVICE.DefaultProductSearchPublicationService.searchService = () => ({ doSave: async input => {
        for (const field of ['_id', 'revision', 'created', 'updated', 'accessGroups']) assert.equal(Object.hasOwn(input.model, field), false);
        documents.push(structuredClone(input.model));
        input.model.payload.name = 'adapter mutation';
        return {};
    } });
    const projections = graph.projections(manifest, f.request);
    const original = structuredClone(projections);
    await target.prepare({ manifest, projections, operationKey: 'prepare', publicationCode: 'pub', sourceVersion: '0' }, f.request);
    const collection = store.collections.get('DefaultProductSearchProjectionService');
    const stored = structuredClone([...collection.values()]);
    await target.verifyRetained(manifest.version, manifest.scope, f.request);
    assert.equal(documents.length, projections.length * 2);
    assert.deepEqual(projections, original);
    assert.deepEqual([...collection.values()], stored);
    for (const document of documents) assert.deepEqual(document, target.projectionContent(stored.find(row => row.code === document.code)));
    assert.equal(stored[0]._id, 'mongo-id');
});

test('lost pointer acknowledgement reconciles only the identical durable operation receipt', async () => {
    const f = fixture(), manifest = await captured(f); stores(f);
    const save = SERVICE.DefaultProductPublicationPointerService.save;
    SERVICE.DefaultProductPublicationPointerService.save = async input => { await save(input); throw new Error('lost response'); };
    const result = await target.deploy({ manifest, projections: graph.projections(manifest, f.request),
        operationKey: 'operation', publicationCode: 'pub', sourceVersion: '0', expectedVersion: null }, f.request);
    assert.equal(result.replayed, true);
    assert.equal(result.previousOnlineVersion, null);
    assert.equal((await target.getStatus({ scope: manifest.scope, operationKey: 'operation' }, f.request)).receipt.fingerprint, result.receipt.fingerprint);
});

test('concurrent activations cannot both claim the same expected pointer and capacity fails closed', async () => {
    const f = fixture(), manifest = await captured(f); stores(f);
    const input = { manifest, projections: graph.projections(manifest, f.request), operationKey: 'prepare', publicationCode: 'pub', sourceVersion: '0', expectedVersion: null };
    await target.prepare(input, f.request);
    const settled = await Promise.allSettled(['one', 'two'].map(operationKey => target.switchVersion({ scope: manifest.scope,
        version: manifest.version, expectedVersion: '', operation: 'ACTIVATE', operationKey, publicationCode: 'pub', sourceVersion: '0' }, f.request)));
    assert.equal(settled.filter(result => result.status === 'fulfilled').length, 1);
    f.configuration.product.publication.maximumActivationReceipts = 1;
    await assert.rejects(target.switchVersion({ scope: manifest.scope, version: manifest.version, expectedVersion: manifest.version,
        operation: 'ROLLBACK', operationKey: 'third', publicationCode: 'pub', sourceVersion: '0' }, f.request), /capacity/);
});
