/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module pricing/test/pricingRowPublicationContract @description Qualifies exact individual row capture, canonical managed persistence, Product compatibility and isolated delivery without native writes or approval bypass. @layer test @owner pricing */
const test = require('node:test');
const assert = require('node:assert/strict');
const owner = require('../src/service/defaultPricingPublicationService');
const schemas = require('../src/schemas/schemas').pricing;
const selection = require('../src/service/defaultPriceSelectionService');
const exact = require('../src/service/defaultExactAmountService');
const foundation = '../../../../../../nodics.foundation/modules/';
const concurrency = require(foundation + 'nDatabase/database/src/service/schema/defaultModelConcurrencyService');
const writer = { ...require(foundation + 'nDatabase/database/src/service/procs/save/defaultModelSaveInitializerService'),
    ...require(foundation + 'nService/vService/src/service/procs/save/defaultModelSaveInitializerService') };
const updater = { ...require(foundation + 'nDatabase/database/src/service/procs/update/defaultModelsUpdateInitializerService'),
    ...require(foundation + 'nService/vService/src/service/procs/update/defaultModelsUpdateInitializerService') };

/** Uses real managed save/update persistence over an independent atomic in-memory driver port. */
function store(schema) {
    const rows = new Map(), calls = [];
    const match = (row, query) => Object.entries(query || {}).every(([key, value]) => row[key] === value);
    const get = async ({ query }) => {
        const result = [...rows.values()].filter(row => match(row, query)).map(row => structuredClone(row));
        return { code: 'SUC_GET_00000', count: result.length, result };
    };
    const model = { rawSchema: schemas[schema], versioned: false, primaryKey: 'code', getItems: get,
        compareAndSetItem: async command => {
            const current = rows.get(command.model?.code || command.query?.code);
            if (command.operation === 'create' ? !!current : !current || !match(current, command.query)) return null;
            const saved = structuredClone({ ...(current || {}), ...command.model });
            rows.set(saved.code, saved); calls.push(structuredClone(command)); return saved;
        } };
    return { rows, calls, get,
        save: input => writer.persistModel({ ...input, schemaModel: model }),
        update: input => updater.persistUpdates({ ...input, schemaModel: model }),
    };
}

/** Creates disjoint Staged/Online repositories and existing owner evidence, never a live runtime. */
function fixture() {
    global.CLASSES = { NodicsError: class extends Error {
        constructor(code, message) { super(message || code); this.code = code; }
    } };
    const scope = { tenant: 'tenant-a', enterpriseCode: 'issuer-a' };
    const request = { ...scope, actorId: 'employee-a', authData: { tenant: scope.tenant, entCode: scope.enterpriseCode,
        tokenType: 'access', principalType: 'human', principalId: 'employee-a',
        permissions: ['publish.lifecycle.create', 'commerce.product.publish'] } };
    const settings = { runtimeRole: 'ONLINE', maxDependencies: 10,
        delivery: { enabled: true, rowReleases: true, rootCodesByStore: { 'store-a': ['book-a'] }, storeCodes: ['store-a'] } };
    global.CONFIG = { get: key => key === 'pricing' ? { publication: settings } : key === 'publish' ?
        { setup: { permissions: { pricing: 'publish.lifecycle.create' } } } : key === 'runtimeRole' ? { publication: 'STAGED' } : undefined };
    global.UTILS = { createModelName: schema => schema };
    global.NODICS = { getModels: () => Object.fromEntries(['priceBook', 'priceRow'].map(schema =>
        [schema, { versioned: true, rawSchema: { versionedReadMode: 'CURRENT' } }])) };
    const ports = () => ({ release: store('pricingPolicyRelease'), pointer: store('pricingPolicyPointer'), receipt: store('pricingPolicyReceipt') });
    const staged = ports(), online = ports();
    const target = { ...owner, publicationSettings: () => settings, targetServices: () => online };
    const runtime = { ...scope, authData: { tenant: scope.tenant, entCode: scope.enterpriseCode, principalType: 'service', isSystem: true } };
    const transport = { getTargetStatus: (publication, context) => target.getTargetStatus(publication, context),
        prepareTarget: release => target.prepareTarget(release, runtime), switchTarget: command => target.switchTarget(command, runtime) };
    const source = { ...owner, publicationSettings: () => ({ ...settings, runtimeRole: 'STAGED', sourceVersioningQualified: true }),
        targetServices: () => staged, transport: () => transport };
    const book = { ...scope, code: 'book-a', versionId: 0, revision: 1, active: true, currency: 'PTS', status: 'ACTIVE' };
    const row = { ...scope, code: 'row-a', versionId: 0, revision: 1, active: true, priceBookCode: book.code,
        productCode: 'product-a', currency: book.currency, unitAmount: '6', minQuantity: '1' };
    const unrelated = { ...row, code: 'row-other', productCode: 'product-other', unitAmount: '90' };
    const sources = { priceBook: new Map([[book.code, book]]), priceRow: new Map([[row.code, row], [unrelated.code, unrelated]]) };
    const reference = { publicationCode: 'product-publication', productCode: row.productCode, storeCode: 'store-a', sourceVersion: '1', targetVersion: 'a'.repeat(64) };
    const productScope = { tenant: scope.tenant, productCode: row.productCode, storeCode: 'store-a' };
    const product = { code: reference.publicationCode, domain: 'product', rootType: 'product', rootCode: row.productCode,
        tenantCode: scope.tenant, enterpriseCode: scope.enterpriseCode, sourceVersion: '1', targetVersion: reference.targetVersion,
        state: 'ONLINE', activationOperation: { key: 'product-original-activation' }, auditTrail: [{ toState: 'APPROVED' }] };
    const status = { version: reference.targetVersion, revision: 2, scope: productScope,
        receipt: { committed: true, scope: productScope, operationKey: product.activationOperation.key,
            publicationCode: product.code, sourceVersion: '1', targetVersion: reference.targetVersion } };
    const productReads = [];
    const readProductStatus = async (input, context) => { productReads.push({ input: structuredClone(input), authData: structuredClone(context.authData) }); return structuredClone(status); };
    global.SERVICE = {
        DefaultModelConcurrencyService: concurrency,
        DefaultRecordOwnershipPolicyService: { enforce: async () => true },
        DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ isSystem: true }) },
        DefaultSecuredRequestPipelineService: { getGrantedPermissions: r => r.authData.permissions || [], isPermissionGranted: (p, granted) => granted.includes(p) },
        DefaultProductPublicationVersionProviderService: {
            getVersion: async () => ({ version: reference.targetVersion, scope: productScope,
                root: { ...scope, code: row.productCode, versionId: 1 } }),
            transport: () => ({ getStatus: readProductStatus }),
        },
        DefaultProductPublicationTargetService: { getStatus: readProductStatus },
        DefaultPublicationLifecycleService: { get: async input => { assert.equal(input.authData.principalType, 'human'); return structuredClone(product); },
            create: async input => ({ ...input.publication, state: 'STAGED' }) },
    };
    for (const [schema, name] of [['priceBook', 'DefaultPriceBookService'], ['priceRow', 'DefaultPriceRowService']])
        SERVICE[name] = { get: async input => {
            assert.equal(input.query.tenant, scope.tenant); assert.equal(input.query.enterpriseCode, scope.enterpriseCode);
            const value = sources[schema].get(input.query.code);
            return { result: value?.versionId === input.query.versionId ? [structuredClone(value)] : [] };
        } };
    const input = { publicationCode: 'row-publication', rootType: 'priceRow', rootCode: row.code,
        references: [{ schema: 'priceBook', code: book.code, versionId: 0 }, { schema: 'priceRow', code: row.code, versionId: 0 }],
        productReference: reference };
    const consumer = { ...request, storeCode: 'store-a', productCodes: [row.productCode, unrelated.productCode], currency: 'PTS',
        productReferences: [{ productCode: row.productCode, storeCode: 'store-a', targetVersion: reference.targetVersion }] };
    const base = { rootType: 'priceBook', rootCode: book.code, references: [...input.references, { schema: 'priceRow', code: unrelated.code, versionId: 0 }] };
    async function activate(intent, code) {
        const release = await source.capture(request, intent), before = await target.getTargetStatus(intent, request);
        const publication = { domain: 'pricing', rootType: intent.rootType, rootCode: intent.rootCode, code,
            sourceVersion: release.code, state: 'ACTIVATING', activationOperation: { key: code + ':activate', previousOnlineVersion: before.version, previousOnlineRevision: before.revision } };
        const result = await source.activate(publication, request);
        return { publication, release, result };
    }
    return { scope, request, runtime, settings, source, target, staged, online, book, row, unrelated, sources, reference, product, status, productReads, input, base, consumer, activate };
}

test('individual row captures only its exact book and approved Product and stays STAGED without approval', async () => {
    const f = fixture(), before = structuredClone([...f.sources.priceRow.values()]);
    const publication = await f.source.createGoverned(f.request, f.input);
    assert.equal(publication.state, 'STAGED'); assert.equal(publication.rootType, 'priceRow');
    const release = await f.source.getVersion(publication, f.request);
    assert.equal(release.payload.records.length, 2);
    assert.deepEqual(release.payload.productReference, f.reference);
    assert.equal(f.source.resolveDependencies(publication, release).at(-1).targetVersion, f.reference.targetVersion);
    assert.deepEqual([...f.sources.priceRow.values()], before);
    assert.equal(f.online.pointer.rows.size, 0);
});

test('approved row overlays only itself; book root, unrelated prices and original source stay unchanged', async () => {
    const f = fixture(); await f.activate(f.base, 'book-publication');
    const basePointer = structuredClone([...f.online.pointer.rows.values()][0]);
    f.row.unitAmount = '7'; f.row.versionId = 1; f.input.references[1].versionId = 1;
    await f.activate(f.input, 'row-publication');
    const records = await f.target.readConfigured(f.consumer);
    assert.equal(records.find(r => r.schema === 'priceRow' && r.policy.code === f.row.code).policy.unitAmount, '7');
    assert.equal(records.find(r => r.schema === 'priceRow' && r.policy.code === f.unrelated.code).policy.unitAmount, '90');
    assert.deepEqual(f.online.pointer.rows.get(basePointer.code), basePointer);
    const result = selection.select({ ...f.consumer, productCode: f.row.productCode },
        records.filter(r => r.schema === 'priceBook').map(r => r.policy), records.filter(r => r.schema === 'priceRow').map(r => r.policy), exact);
    assert.equal(result.selected.unitAmount, '7');
    assert.equal(f.row.unitAmount, '7');
});

test('prepared or incomplete row activation cannot become delivery evidence', async () => {
    const f = fixture(); await f.activate(f.base, 'book-publication');
    const release = await f.source.capture(f.request, f.input); await f.target.prepareTarget(release, f.runtime);
    assert.equal((await f.target.readConfigured(f.consumer)).filter(r => r.schema === 'priceRow').length, 2);
    await f.activate(f.input, 'row-publication');
    const pointer = [...f.online.pointer.rows.values()].find(row => row.rootType === 'priceRow');
    f.online.receipt.rows.get(pointer.receiptCode).applied = false;
    await assert.rejects(f.target.readConfigured(f.consumer), /receipt mismatch/);
});

test('capture rejects extra rows, wrong books, foreign scope and unpublished Product before retention', async () => {
    for (const mutate of [
        f => f.input.references.push({ schema: 'priceRow', code: f.unrelated.code, versionId: 0 }),
        f => { f.row.priceBookCode = 'foreign-book'; }, f => { f.row.enterpriseCode = 'foreign'; },
        f => { f.input.productReference.targetVersion = 'b'.repeat(64); },
        f => { f.product.state = 'APPROVED'; }, f => { f.product.auditTrail = []; },
        f => { f.product.enterpriseCode = 'foreign'; }, f => { f.status.receipt.committed = false; },
    ]) {
        const f = fixture(); mutate(f);
        await assert.rejects(f.source.capture(f.request, f.input));
        assert.equal(f.staged.release.rows.size, 0); assert.equal(f.online.release.rows.size, 0);
    }
});

test('missing, malformed or mismatched consumed Product pins refuse without old-row fallback', async () => {
    for (const pins of [undefined, [], [{ productCode: 'product-a', storeCode: 'store-a', targetVersion: 'b'.repeat(64) }],
        [{ productCode: 'product-a', storeCode: 'foreign', targetVersion: 'a'.repeat(64) }],
        [{ productCode: 'product-a', storeCode: 'store-a', targetVersion: 'a'.repeat(64), available: true }]]) {
        const f = fixture(); await f.activate(f.base, 'book-publication'); await f.activate(f.input, 'row-publication');
        f.consumer.productReferences = pins;
        await assert.rejects(f.target.readConfigured(f.consumer), /Product reference|Product version/);
    }
});

test('Product drift and ABA refuse validation, activation and consumption even with matching digest', async () => {
    const f = fixture(); await f.activate(f.base, 'book-publication'); const approved = await f.activate(f.input, 'row-publication');
    f.status.revision++;
    await assert.rejects(f.source.validate(approved.publication, approved.release, f.request), /reference drift/);
    await assert.rejects(f.source.activate(approved.publication, f.request), /activation changed/);
    await assert.rejects(f.target.readConfigured(f.consumer), /activation changed/);
});

test('a changed exact book version cannot be silently substituted for a row anchor', async () => {
    const f = fixture(); await f.activate(f.base, 'book-publication'); await f.activate(f.input, 'row-publication');
    f.book.versionId = 1; f.base.references[0].versionId = 1;
    await f.activate(f.base, 'new-book-publication');
    await assert.rejects(f.target.readConfigured(f.consumer), /book version changed/);
});

test('row pointer enumeration is bounded and rejects incomplete or foreign pages', async () => {
    for (const corrupt of [response => { response.count++; }, response => { response.result.push({ code: 'foreign' }); },
        response => { response.code = 'ERR_GET_00000'; }]) {
        const f = fixture(); await f.activate(f.base, 'book-publication'); await f.activate(f.input, 'row-publication');
        const get = f.online.pointer.get;
        f.online.pointer.get = async input => { const response = await get(input); if (input.query.rootType === 'priceRow') corrupt(response); return response; };
        await assert.rejects(f.target.readConfigured(f.consumer), /incomplete or foreign/);
    }
});

test('row delivery preserves unselected Store and Product behavior and default remains inert', async () => {
    const f = fixture(); await f.activate(f.base, 'book-publication'); await f.activate(f.input, 'row-publication');
    const before = f.productReads.length;
    const records = await f.target.readConfigured({ ...f.consumer, productCodes: [f.unrelated.productCode], productReferences: undefined });
    assert.equal(f.productReads.length, before);
    assert.equal(records.find(r => r.schema === 'priceRow' && r.policy.code === f.unrelated.code).policy.unitAmount, '90');
    await assert.rejects(f.target.readConfigured({ ...f.consumer, storeCode: 'foreign' }), /delivery roots/);
    f.settings.delivery.rowReleases = false;
    assert.equal((await f.target.readConfigured({ ...f.consumer, productReferences: undefined })).length, 3);
    assert.equal(require('../config/properties').pricing.publication.delivery.rowReleases, false);
});

test('lost response and identical replay retain the original row activation receipt and counters', async () => {
    const f = fixture(); await f.activate(f.base, 'book-publication');
    const original = f.online.pointer.update; let lose = true;
    f.online.pointer.update = async input => { const result = await original(input); if (lose) { lose = false; throw Error('Lost acknowledgement'); } return result; };
    const { publication, result } = await f.activate(f.input, 'row-publication');
    const before = structuredClone([...f.online.pointer.rows.entries()]);
    assert.equal((await f.source.activate(publication, f.request)).receipt.code, result.receipt.code);
    assert.deepEqual([...f.online.pointer.rows.entries()], before);
});

test('authority and Product selection drift during an awaited row read never return prices', async () => {
    for (const mutate of [f => { f.consumer.authData.entCode = 'foreign'; },
        f => { f.consumer.productReferences[0].targetVersion = 'b'.repeat(64); },
        f => { f.settings.delivery.rowReleases = false; }]) {
        const f = fixture(); await f.activate(f.base, 'book-publication'); await f.activate(f.input, 'row-publication');
        const get = f.online.pointer.get;
        f.online.pointer.get = async input => { const result = await get(input); if (input.query.rootType === 'priceRow') mutate(f); return result; };
        await assert.rejects(f.target.readConfigured(f.consumer), /authority or selection changed/);
    }
});

test('service claims and unsigned/foreign book-owner aliases cannot capture or publish a row', async () => {
    for (const mutate of [f => { f.request.authData.principalType = 'service'; f.request.authData.tokenType = 'service'; },
        f => { f.request.authData.entCode = 'default'; }, f => { delete f.request.authData.entCode; },
        f => { f.request.authData.tenantCode = 'foreign'; }, f => { f.request.authData.isSystem = true; }]) {
        const f = fixture(); mutate(f);
        await assert.rejects(f.source.createGoverned(f.request, f.input));
        assert.equal(f.staged.release.rows.size, 0); assert.equal(f.online.pointer.rows.size, 0);
    }
});

test('existing HTTP capture controller retains the original employee and normal STAGED lifecycle', async () => {
    const f = fixture();
    global.FACADE = { DefaultPricingPublicationFacade: require('../src/facade/defaultPricingPublicationFacade') };
    SERVICE.DefaultPricingPublicationService = f.source;
    const controller = require('../src/controller/defaultPricingPublicationTargetController');
    const input = { ...f.request, httpRequest: { body: f.input } }, before = structuredClone(input);
    const response = await controller.createGoverned(input);
    assert.equal(response.result.state, 'STAGED'); assert.equal(response.result.rootType, 'priceRow');
    assert.deepEqual(input, before); assert.equal(f.online.pointer.rows.size, 0);
    const route = require('../src/router/routers').pricing.policyPublicationAuthoring.createGoverned;
    assert.deepEqual(route.authTokenTypes, ['access']); assert.equal(route.permission, 'publish.lifecycle.create');
});

test('consumer pointer or Product changes during readback fail without returning a mixed snapshot', async () => {
    for (const kind of ['book', 'row', 'product']) {
        const f = fixture(); await f.activate(f.base, 'book-publication'); await f.activate(f.input, 'row-publication');
        const get = f.online.release.get; let mutated = false;
        f.online.release.get = async input => {
            const result = await get(input);
            if (!mutated && result.result[0]?.rootType === 'priceRow') {
                mutated = true;
                if (kind === 'product') f.status.revision++;
                else [...f.online.pointer.rows.values()].find(row => row.rootType === (kind === 'book' ? 'priceBook' : 'priceRow')).revision++;
            }
            return result;
        };
        await assert.rejects(f.target.readConfigured(f.consumer));
    }
});

test('unrelated candidate count cannot be silently truncated by the row pointer bound', async () => {
    const f = fixture(); await f.activate(f.base, 'book-publication'); await f.activate(f.input, 'row-publication');
    const pointer = [...f.online.pointer.rows.values()].find(row => row.rootType === 'priceRow');
    for (let i = 0; i < 11; i++) f.online.pointer.rows.set('extra-' + i, { ...pointer, code: 'extra-' + i, productCode: 'other-' + i });
    await assert.rejects(f.target.readConfigured(f.consumer), /incomplete or foreign/);
});

test('two approved row activations preserve canonical CAS conflict and unrelated book pointer', async () => {
    const f = fixture(); await f.activate(f.base, 'book-publication');
    const book = structuredClone([...f.online.pointer.rows.values()][0]);
    const first = await f.source.capture(f.request, f.input);
    f.row.versionId = 1; f.row.unitAmount = '8'; f.input.references[1].versionId = 1;
    const second = await f.source.capture(f.request, f.input);
    const command = (release, code) => ({ domain: 'pricing', rootType: 'priceRow', rootCode: f.row.code, code,
        sourceVersion: release.code, state: 'ACTIVATING', activationOperation: { key: code, previousOnlineVersion: null, previousOnlineRevision: 0 } });
    const results = await Promise.allSettled([f.source.activate(command(first, 'first'), f.request), f.source.activate(command(second, 'second'), f.request)]);
    assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
    assert.deepEqual(f.online.pointer.rows.get(book.code), book);
    const records = await f.target.readConfigured(f.consumer);
    assert(['6', '8'].includes(records.find(item => item.schema === 'priceRow' && item.policy.code === f.row.code).policy.unitAmount));
});

test('legacy callers cannot bypass an activated individual row by omitting consumed Product identity', async () => {
    const f = fixture(); await f.activate(f.base, 'book-publication');
    f.row.versionId = 1; f.row.unitAmount = '7'; f.input.references[1].versionId = 1;
    await f.activate(f.input, 'row-publication');
    await assert.rejects(f.target.readConfigured({ ...f.consumer, productCodes: undefined }), /Consumed Product selection/);
    SERVICE.DefaultPriceSelectionService = selection; SERVICE.DefaultExactAmountService = exact;
    const selected = await f.target.selectActivated({ ...f.consumer, productCode: f.row.productCode }, f.book.code);
    assert.equal(selected.selected.unitAmount, '7');
    await assert.rejects(f.target.selectActivated(f.consumer, 'foreign-book'), /outside the selected/);
});

test('actual Product summaries and Cart calculation consume retained version pins through individual row delivery', async () => {
    const f = fixture();
    await f.activate(f.base, 'book-publication');
    f.row.unitAmount = '7'; f.row.versionId = 1; f.input.references[1].versionId = 1;
    await f.activate(f.input, 'row-publication');
    const discovery = require('../../product/src/service/defaultProductDiscoveryService');
    const enrichment = require('../../product/src/service/defaultProductSearchEnrichmentService');
    const portsOwner = require('../../../../checkout/modules/cart/src/service/defaultCommerceCalculationPortsService');
    const engine = require('../../../../checkout/modules/cart/src/service/defaultCartCalculationEngineService');
    const projection = { ...f.scope, code: 'retained-projection', productCode: f.row.productCode,
        storeCode: 'store-a', locale: 'en', status: 'STALE', publicationVersion: f.reference.targetVersion,
        sourceHash: 'source', payload: { variantCodes: ['variant'], variantSkuMap: { variant: 'sku' } } };
    const getConfig = CONFIG.get;
    CONFIG.get = key => key === 'product' ? { discovery: { activationService: 'ProductActivation' },
        publication: { searchEnrichment: { inventory: { enabled: false } } } } : getConfig(key);
    Object.assign(SERVICE, {
        ProductActivation: { activeVersions: async () => [f.reference.targetVersion] },
        DefaultProductDiscoveryService: { ...discovery, publicationSelections: new WeakMap(),
            searchSelected: async () => [structuredClone(projection)] },
        DefaultProductSearchEnrichmentService: enrichment,
        DefaultProductSearchProjectionService: { get: async () => ({ result: [structuredClone(projection)] }) },
        DefaultStoreService: { get: async () => ({ result: [{ tenant: f.scope.tenant, code: 'store-a',
            enterpriseRef: { code: f.scope.enterpriseCode }, status: 'ACTIVE', defaultCurrency: 'PTS' }] }) },
        DefaultPricingPublicationService: f.target,
        DefaultPriceSelectionService: selection,
        DefaultCustomerPriceSummaryService: require('../src/service/defaultCustomerPriceSummaryService'),
        DefaultExactAmountService: exact,
        DefaultPricingDecisionService: require('../src/service/defaultPricingDecisionService')
    });
    const context = { ...f.consumer, locale: 'en' };
    delete context.productReferences;
    assert.equal((await enrichment.consumerSummaries(context, [projection])).prices['product-a'].unitAmount, '7');
    const cart = { ...f.scope, code: 'cart', ownerId: 'buyer', storeCode: 'store-a', locale: 'en', currency: 'PTS',
        entries: [{ code: 'entry', productCode: 'product-a', variantCode: 'variant', sku: 'sku', quantity: '2' }] };
    const ports = portsOwner.create(cart);
    const calculate = () => engine.calculate(cart, { ...ports, inventory: async () => ({ available: true }),
        promotion: async () => ({ discountAmount: '0' }), tax: async () => ({ taxAmount: '0' }) });
    assert.equal((await calculate()).totalAmount, '14');
    projection.publicationVersion = 'b'.repeat(64);
    await assert.rejects(calculate(), /activated catalogue scope/);
    projection.publicationVersion = f.reference.targetVersion;
    projection.payload.variantSkuMap.variant = 'foreign';
    await assert.rejects(calculate(), /Consumed Product/);
});

test('candidate selection uses only exact configured Store/book/Product rows and shares bounded delivery validation', async () => {
    const f = fixture(); await f.activate(f.base, 'book-publication');
    const request = { ...f.consumer, productCodes: [f.row.productCode], productReferences: undefined };
    assert.deepEqual(await f.target.rowProductCodes(request), []);
    await f.activate(f.input, 'row-publication');
    assert.deepEqual(await f.target.rowProductCodes(request), [f.row.productCode]);
    assert.deepEqual(await f.target.rowProductCodes({ ...request, productCodes: [f.unrelated.productCode] }), []);
    const pointer = [...f.online.pointer.rows.values()].find(row => row.rootType === 'priceRow');
    for (const field of ['storeCode', 'priceBookCode']) {
        const original = pointer[field]; pointer[field] = 'unrelated';
        assert.deepEqual(await f.target.rowProductCodes(request), []);
        pointer[field] = original;
    }
    const get = f.online.pointer.get;
    f.online.pointer.get = async input => {
        const response = await get(input);
        if (input.query.rootType === 'priceRow') response.count++;
        return response;
    };
    await assert.rejects(f.target.rowProductCodes(request), /incomplete or foreign/);
    f.online.pointer.get = async input => {
        const response = await get(input);
        request.authData.entCode = 'foreign';
        return response;
    };
    await assert.rejects(f.target.rowProductCodes(request), /selection authority changed/);
});

test('Cart final delivery rejects a newly activated relevant row after an empty gate, ignoring supplied pins', async () => {
    const f = fixture(); await f.activate(f.base, 'book-publication');
    SERVICE.DefaultPricingPublicationService = f.target;
    SERVICE.DefaultPriceSelectionService = selection;
    SERVICE.DefaultExactAmountService = exact;
    SERVICE.DefaultProductDiscoveryService = { consumerReferences: () => assert.fail('Empty gate must not request Product authority') };
    const select = f.target.rowProductCodes.bind(f.target);
    f.target.rowProductCodes = async request => {
        const needed = await select(request); assert.deepEqual(needed, []);
        await f.activate(f.input, 'row-publication');
        return needed;
    };
    const ports = require('../../../../checkout/modules/cart/src/service/defaultCommerceCalculationPortsService');
    const cart = { ...f.scope, storeCode: 'store-a', locale: 'en' };
    await assert.rejects(ports.price({ ...f.consumer, productCode: f.row.productCode, productCodes: undefined,
        quantity: '1' }, cart, f.runtime.authData), /Consumed immutable Product references required/);
});

/** Admits an artificial private original runtime with the real runtime principal validator. @param {Object} f Canonical retained row fixture. @returns {Object} Exact private read request. */
function rowReadRequest(f) {
    const request = { tenant: f.scope.tenant, entCode: f.scope.enterpriseCode,
        authData: { tenant: f.scope.tenant, entCode: f.scope.enterpriseCode, principalType: 'service', tokenType: 'service',
            serviceId: 'reader', runtimeInstanceId: 'instance', runtimeScope: { projectCode: 'project', environmentCode: 'projectLocal',
                serverCode: 'waste', instanceCode: 'instance', assignmentCode: 'assignment' }, modules: ['pricing'], permissions: ['internal.policy.read'] },
        payload: { contractVersion: 1, enterpriseCode: f.scope.enterpriseCode, priceRowCode: f.row.code,
            priceBookCode: f.book.code, productReference: structuredClone(f.reference) } };
    request.httpRequest = { headers: { 'x-enterprise-code': f.scope.enterpriseCode }, body: request.payload };
    const get = CONFIG.get;
    CONFIG.get = key => key === 'authSecurity' ? { internalToken: { routePermission: 'internal.policy.read' } } : get(key);
    NODICS.getServerState = () => 'started';
    SERVICE.DefaultServiceTokenService = require(foundation + 'nAuth/src/service/identity/defaultServiceTokenService');
    SERVICE.DefaultLoggerService = { hasPrivateCaptureProtection: value => value === request };
    SERVICE.DefaultPriceSelectionService = selection;
    SERVICE.DefaultExactAmountService = exact;
    SERVICE.DefaultPricingPublicationService = f.target;
    return request;
}

test('exact runtime row evidence uses canonical retained pointer/receipt and existing controller without mutable reads', async () => {
    const f = fixture(); await f.activate(f.base, 'book-publication'); await f.activate(f.input, 'row-publication');
    const request = rowReadRequest(f), before = structuredClone(request);
    const controller = require('../src/controller/defaultPricingPublicationTargetController');
    const result = (await controller.rowEvidence(request)).result;
    assert.deepEqual(result.row, { code: f.row.code, priceBookCode: f.book.code, productCode: f.row.productCode,
        unitAmount: '6', currency: 'PTS', minQuantity: '1', active: true });
    assert.deepEqual(result.productReference, f.reference);
    assert.equal(result.publicationCode, 'row-publication');
    assert.equal(result.pointerRevision, [...f.online.pointer.rows.values()].find(row => row.rootType === 'priceRow').revision);
    assert.equal(result.activationOperationKey, 'row-publication:activate');
    assert.deepEqual(request, before);
    await assert.rejects(f.target.rowEvidence({ ...request }), /authority/);
    const route = require('../src/router/routers').pricing.policyPublicationTarget.rowEvidence;
    assert.equal(route.permissionConfig, 'authSecurity.internalToken.routePermission');
    assert.equal(route.requestPrivacy.sensitive, true); assert.equal(route.cache.enabled, false);
    assert.equal(require(foundation + 'nRouter/src/service/tooling/defaultOpenapiContractGeneratorService').isValidRoute('rowEvidence', route), true);
});

test('row evidence rejects disabled delivery, wrong immutable reference and missing original read authority', async () => {
    for (const mutate of [
        (f, r) => { r.authData.permissions = []; }, (f, r) => { r.payload.productReference.targetVersion = 'b'.repeat(64); },
        (f, r) => { r.payload.enterpriseCode = 'foreign'; }, (f, r) => { r.payload.priceBookCode = 'foreign'; },
        (f, r) => { r.payload.authData = { isSystem: true }; }, f => { f.settings.delivery.rowReleases = false; },
        f => { SERVICE.DefaultLoggerService.hasPrivateCaptureProtection = () => false; },
        f => { [...f.online.receipt.rows.values()].find(row => row.publicationCode === 'row-publication').applied = false; }
    ]) {
        const f = fixture(); await f.activate(f.base, 'book-publication'); await f.activate(f.input, 'row-publication');
        const request = rowReadRequest(f), writes = f.online.pointer.calls.length + f.online.receipt.calls.length;
        mutate(f, request);
        await assert.rejects(f.target.rowEvidence(request));
        assert.equal(f.online.pointer.calls.length + f.online.receipt.calls.length, writes);
    }
});

test('row evidence refuses pointer, Product and original runtime drift across fresh owner reads', async () => {
    for (const mutate of [
        (f, r) => { [...f.online.pointer.rows.values()].find(row => row.rootType === 'priceRow').revision++; },
        f => { f.status.revision++; }, (f, r) => { r.authData.serviceId = 'changed-reader'; },
    ]) {
        const f = fixture(); await f.activate(f.base, 'book-publication'); await f.activate(f.input, 'row-publication');
        const request = rowReadRequest(f), get = f.online.release.get;
        let once = true;
        f.online.release.get = async input => { const response = await get(input); if (once) { once = false; mutate(f, request); } return response; };
        await assert.rejects(f.target.rowEvidence(request));
    }
});

/** Runs actual source/target controllers and managed writers with two exact artificial signed deployment bindings. */
function publicationRuntimeFixture(t) {
    const previous = Object.fromEntries(['CONFIG', 'SERVICE', 'NODICS', 'UTILS', 'CLASSES'].map(key => [key, global[key]]));
    t.after(() => Object.assign(global, previous));
    const f = fixture(), controller = require('../src/controller/defaultPricingPublicationTargetController');
    const principal = name => ({ tenant: f.scope.tenant, entCode: f.scope.enterpriseCode, principalType: 'service', tokenType: 'service',
        serviceId: name + '-principal', runtimeInstanceId: name + '-instance', modules: ['pricing'], permissions: ['internal.policy.read'],
        runtimeScope: { projectCode: 'project', environmentCode: 'projectLocal', serverCode: name,
            instanceCode: name + '-instance', assignmentCode: name + '-assignment' } });
    const publisher = principal('publisher'), callback = principal('target'), reader = principal('readonly');
    const binding = (auth, connectionName) => ({ moduleName: 'pricing', connectionName, runtimeRole: 'PUBLICATION_PEER',
        callers: [{ tenant: auth.tenant, principalEnterpriseCode: auth.entCode, serviceId: auth.serviceId, ...auth.runtimeScope }] });
    f.settings.sourceAuthority = binding(publisher, 'reviewed-source');
    f.settings.target = binding(callback, 'reviewed-target');
    const get = CONFIG.get;
    CONFIG.get = key => key === 'authSecurity' ? { internalToken: { routePermission: 'internal.policy.read', runtimeAccessGroups: ['userGroup'] } } : get(key);
    SERVICE.DefaultServiceTokenService = require(foundation + 'nAuth/src/service/identity/defaultServiceTokenService');
    SERVICE.DefaultSecuredRequestPipelineService = require(foundation + 'nRouter/src/service/request/defaultSecuredRequestPipelineService');
    SERVICE.DefaultPricingPublicationService = f.target;
    const publications = new Map();
    let sourceReads = 0, sourceCalls = 0, afterAuthorization = () => {}, afterSourceRead = () => {};
    SERVICE.DefaultPublicationLifecycleService.getRepository = () => ({ get: async code => {
        sourceReads++; const value = structuredClone(publications.get(code)); await afterSourceRead(); return value;
    } });
    const request = (auth, body, operation) => ({ tenant: auth.tenant, entCode: auth.entCode, authData: auth,
        router: require('../src/router/routers').pricing.policyPublicationTarget[operation], httpRequest: { body } });
    SERVICE.DefaultPricingPublicationTransportService = { authorizeTarget: async command => {
        sourceCalls++; SERVICE.DefaultPricingPublicationService = f.source;
        try {
            const result = (await controller.authorize(request(callback, structuredClone(command), 'authorize'))).result;
            await afterAuthorization(); return result;
        } finally { SERVICE.DefaultPricingPublicationService = f.target; }
    } };
    const writes = () => Object.values(f.online).reduce((total, port) => total + port.calls.length, 0);
    const prepare = async (input, code) => {
        const release = await f.source.capture(f.request, input), before = await f.target.getTargetStatus(input, f.request);
        const publication = { domain: 'pricing', rootType: input.rootType, rootCode: input.rootCode, code,
            tenantCode: f.scope.tenant, enterpriseCode: f.scope.enterpriseCode, sourceVersion: release.code,
            state: 'ACTIVATING', activationOperation: { key: code + ':activate', previousOnlineVersion: before.version,
                previousOnlineRevision: before.revision } };
        publications.set(code, publication);
        return { release, publication, operationKey: publication.activationOperation.key, targetVersion: release.code,
            expectedVersion: before.version, expectedRevision: before.revision };
    };
    const publish = async (input, code) => {
        const body = await prepare(input, code);
        await controller.prepare(request(publisher, body, 'prepare'));
        await controller.activate(request(publisher, body, 'activate'));
        return body;
    };
    return { ...f, controller, publisher, callback, reader, request, prepare, publish, writes,
        sourceReads: () => sourceReads, sourceCalls: () => sourceCalls,
        afterAuthorization: fn => { afterAuthorization = fn; }, afterSourceRead: fn => { afterSourceRead = fn; } };
}

test('qualified publication deployments create book and row through actual controllers and managed CAS; read caller cannot write', async t => {
    const f = publicationRuntimeFixture(t), body = await f.prepare(f.base, 'book-publication');
    const original = structuredClone(f.publisher);
    for (const operation of ['prepare', 'activate', 'reconcile']) {
        const request = f.request(f.reader, body, operation);
        assert.equal(SERVICE.DefaultSecuredRequestPipelineService.hasAccessGroup(request), true);
        assert.equal(SERVICE.DefaultSecuredRequestPipelineService.hasRoutePermission(request), true);
        await assert.rejects(f.controller[operation](request), /not the qualified deployment/);
        assert.equal(f.writes(), 0); assert.equal(f.sourceCalls(), 0); assert.equal(f.sourceReads(), 0);
    }
    await f.controller.prepare(f.request(f.publisher, body, 'prepare'));
    await f.controller.activate(f.request(f.publisher, body, 'activate'));
    const beforeReplay = f.writes();
    await f.controller.reconcile(f.request(f.publisher, body, 'reconcile'));
    assert.equal(f.writes(), beforeReplay);
    await f.publish(f.input, 'row-publication');
    assert.equal(f.online.pointer.rows.size, 2); assert.deepEqual(f.publisher, original);
    const read = rowReadRequest(f), beforeRead = f.writes();
    const result = await f.target.rowEvidence(read);
    assert.equal(result.row.code, f.row.code); assert.equal(f.writes(), beforeRead);
    assert.equal((await f.controller.status(f.request(f.reader, body, 'status'))).result.version, body.release.code);
    assert.equal(f.writes(), beforeRead);
    for (const operation of ['prepare', 'activate', 'reconcile']) {
        await assert.rejects(f.controller[operation](f.request(read.authData, body, operation)), /not the qualified deployment/);
        assert.equal(f.writes(), beforeRead);
    }
});

test('source authorization independently rejects the read caller even with a genuine stored operation', async t => {
    const f = publicationRuntimeFixture(t), body = await f.prepare(f.base, 'book-publication');
    const command = { operation: 'prepare', enterpriseCode: f.scope.enterpriseCode, publicationCode: body.publication.code,
        rootType: body.publication.rootType, rootCode: body.publication.rootCode, sourceVersion: body.release.code,
        operationKey: body.operationKey, targetVersion: body.targetVersion, expectedVersion: null, expectedRevision: 0 };
    SERVICE.DefaultPricingPublicationService = f.source;
    await assert.rejects(f.controller.authorize(f.request(f.reader, command, 'authorize')), /not the qualified deployment/);
    assert.equal(f.sourceReads(), 0); assert.equal(f.writes(), 0);
    assert.equal((await f.controller.authorize(f.request(f.callback, command, 'authorize'))).result.authorized, true);
    assert.equal(f.sourceReads(), 1);
    command.operationKey = 'forged-operation';
    await assert.rejects(f.controller.authorize(f.request(f.callback, command, 'authorize')), /Stored activation authority missing/);
    assert.equal(f.writes(), 0);
});

test('missing ambiguous foreign and wildcard publication caller bindings fail before source reads or writes', async t => {
    for (const [name, mutate] of Object.entries({ missing: f => { delete f.settings.sourceAuthority.callers; },
        empty: f => { f.settings.sourceAuthority.callers = []; },
        duplicate: f => { f.settings.sourceAuthority.callers.push(structuredClone(f.settings.sourceAuthority.callers[0])); },
        overflow: f => { f.settings.sourceAuthority.callers = Array(101).fill(f.settings.sourceAuthority.callers[0]); },
        wildcard: f => { f.settings.sourceAuthority.callers[0].instanceCode = '*'; },
        extra: f => { f.settings.sourceAuthority.callers[0].permission = '*'; },
        tenant: f => { f.settings.sourceAuthority.callers[0].tenant = 'foreign'; },
        principal: f => { f.settings.sourceAuthority.callers[0].principalEnterpriseCode = 'foreign'; },
        service: f => { f.publisher.serviceId = 'foreign'; },
        system: f => { f.publisher.isSystem = true; },
        ...Object.fromEntries(['projectCode', 'environmentCode', 'serverCode', 'instanceCode', 'assignmentCode'].map(key =>
            [key, f => { f.publisher.runtimeScope[key] = 'foreign'; }])) })) await t.test(name, async child => {
        const f = publicationRuntimeFixture(child), body = await f.prepare(f.base, 'book-publication');
        mutate(f); await assert.rejects(f.controller.prepare(f.request(f.publisher, body, 'prepare')));
        assert.equal(f.sourceCalls(), 0); assert.equal(f.sourceReads(), 0); assert.equal(f.writes(), 0);
    });
});

test('caller and binding drift across source authorization retire the target and source proof before writes', async t => {
    for (const mutate of [f => { f.publisher.runtimeScope.assignmentCode = 'changed'; },
        f => { f.publisher.permissions = []; }, f => { f.settings.sourceAuthority.callers = []; }]) {
        const f = publicationRuntimeFixture(t), body = await f.prepare(f.base, 'book-publication');
        f.afterAuthorization(() => mutate(f));
        await assert.rejects(f.controller.prepare(f.request(f.publisher, body, 'prepare')), /caller authority changed/);
        assert.equal(f.writes(), 0);
    }
    const f = publicationRuntimeFixture(t), body = await f.prepare(f.base, 'book-publication');
    f.afterSourceRead(() => { f.callback.runtimeScope.assignmentCode = 'changed'; });
    await assert.rejects(f.controller.prepare(f.request(f.publisher, body, 'prepare')), /caller authority changed/);
    assert.equal(f.writes(), 0);
});

test('original caller and binding drift during target reads prevent every subsequent managed write', async t => {
    for (const drift of ['caller', 'binding']) for (const phase of ['prepare-product', 'prepare-retain', 'activate-release',
        'activate-pointer', 'activate-receipt', 'reconcile-receipt']) await t.test(drift + ':' + phase, async child => {
        const f = publicationRuntimeFixture(child);
        const body = await f.prepare(phase === 'prepare-product' ? f.input : f.base, 'target-drift-publication');
        const mutate = () => {
            if (drift === 'caller') f.publisher.runtimeScope.assignmentCode = 'changed-after-target-read';
            else f.settings.sourceAuthority.callers = [];
        };
        let operation = 'prepare';
        if (phase.startsWith('activate') || phase.startsWith('reconcile')) {
            await f.controller.prepare(f.request(f.publisher, body, 'prepare')); operation = 'activate';
        }
        if (phase.startsWith('reconcile')) {
            const update = f.online.receipt.update;
            f.online.receipt.update = async () => { throw new Error('Artificial receipt completion outage'); };
            await assert.rejects(f.controller.activate(f.request(f.publisher, body, 'activate')), /completion outage/);
            f.online.receipt.update = update; operation = 'reconcile';
        }
        if (phase === 'prepare-product') {
            const get = SERVICE.DefaultProductPublicationTargetService.getStatus;
            SERVICE.DefaultProductPublicationTargetService.getStatus = async (...args) => {
                const value = await get(...args); mutate(); return value;
            };
        } else {
            const kind = phase.endsWith('pointer') ? 'pointer' : phase.endsWith('receipt') ? 'receipt' : 'release';
            const get = f.online[kind].get;
            f.online[kind].get = async input => { const value = await get(input); mutate(); return value; };
        }
        const before = f.writes();
        await assert.rejects(f.controller[operation](f.request(f.publisher, body, operation)), /caller authority changed/);
        assert.equal(f.writes(), before, 'No managed save or update may follow retired original authority');
    });
});

test('private target continuation cannot be copied or reused after completion and a later legitimate request recovers', async t => {
    const f = publicationRuntimeFixture(t), body = await f.prepare(f.base, 'private-target-context');
    const prepare = f.target.prepareTarget;
    let context;
    f.target.prepareTarget = async function (release, local) {
        context = local;
        await assert.rejects(this.retain(this.targetServices().release, release, { ...local }), /Copied or retired/);
        return prepare.call(this, release, local);
    };
    await f.controller.prepare(f.request(f.publisher, body, 'prepare'));
    const before = f.writes();
    await assert.rejects(f.target.retain(f.online.release, body.release, context), /Copied or retired/);
    assert.equal(f.writes(), before);
    f.target.prepareTarget = prepare;
    await f.controller.activate(f.request(f.publisher, body, 'activate'));
    assert.equal(f.online.pointer.rows.size, 1);
});
