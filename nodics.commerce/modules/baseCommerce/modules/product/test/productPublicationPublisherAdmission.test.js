/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
'use strict';
/** @module product/test/productPublicationPublisherAdmission @description Source regression with independent generated-persistence doubles and real permission/schema-access/identity owners. Not signed runtime qualification. @layer test @owner product */
const test = require('node:test');
const assert = require('node:assert/strict');
const graph = require('../src/service/defaultProductPublicationGraphService');
const governed = require('../src/service/defaultProductGovernedPublicationService');
const provider = require('../src/service/defaultProductPublicationVersionProviderService');
const properties = require('../config/properties');
const foundation = '../../../../../../nodics.foundation/modules/';
const identity = require(foundation + 'nAuth/src/service/identity/defaultIdentityGovernanceService');
const security = require(foundation + 'nRouter/src/service/request/defaultSecuredRequestPipelineService');
const access = require(foundation + 'nDatabase/database/src/service/schema/defaultSchemaAccessHandlerService');

function matches(row, query) {
    return Object.entries(query).every(([key, value]) => key === '$or' ? value.some(branch => matches(row, branch)) :
        value && Object.hasOwn(value, '$exists') ? Object.hasOwn(row, key) === value.$exists :
            value?.$in ? value.$in.includes(row[key]) : row[key] === value);
}

function fixture() {
    const request = { tenant: 'tenant-a', enterpriseCode: 'enterprise-a', authData: { tenant: 'tenant-a', entCode: 'enterprise-a',
        principalType: 'human', tokenType: 'access', principalId: 'publisher', userGroups: ['setupPublisher'],
        permissions: ['commerce.product.publish', 'publish.lifecycle.create'] } };
    const configuration = { product: { publication: { maximumDependencies: 20 }, localization: { supportedLocales: ['en'], requiredLocales: ['en'] } },
        runtimeRole: { publication: 'STAGED' }, identityGovernance: { systemAccessGroups: ['serviceAccountUserGroup'] },
        accessPoints: { readAccessPoint: 1, fullAccessPoint: 10 } };
    global.CONFIG = { get: name => configuration[name] };
    global.UTILS = { createModelName: name => name, isBlank: value => !value || !Object.keys(value).length };
    const base = { tenant: request.tenant, enterpriseCode: request.enterpriseCode, versionId: 0 };
    const rows = {
        product: [{ ...base, code: 'p', status: 'ACTIVE', catalogVersion: 'catalog' }],
        productLocalization: [{ ...base, code: 'p-en', productCode: 'p', locale: 'en', status: 'READY', name: 'Product', classificationValues: { categoryCodes: ['category'] } }],
        productVariant: [{ ...base, code: 'variant', productCode: 'p', status: 'ACTIVE', sku: 'sku' }],
        productVariantLocalization: [{ ...base, code: 'variant-en', productCode: 'p', variantCode: 'variant', locale: 'en', status: 'READY' }],
        category: [{ ...base, code: 'category', status: 'ACTIVE' }],
        categoryLocalization: [{ ...base, code: 'category-en', categoryCode: 'category', locale: 'en', status: 'READY', name: 'Category' }],
    };
    global.NODICS = { getServerState: () => 'started', getModels: () => Object.fromEntries(Object.keys(rows).map(name =>
        [name, { versioned: true, rawSchema: { versionedReadMode: 'CURRENT' } }])) };
    const reads = [], writes = [], lifecycleCalls = [];
    global.SERVICE = { DefaultProductPublicationGraphService: graph, DefaultProductPublicationVersionProviderService: provider,
        DefaultProductLocalizationPolicyService: require('../src/service/defaultProductLocalizationPolicyService'),
        DefaultSecuredRequestPipelineService: security, DefaultIdentityGovernanceService: identity };
    const check = input => assert(access.getAccessPoint(input.authData, properties.schemaPolicies.product.tenantOwned.accessGroups) >= 1,
        'generated schema access denied');
    for (const [schema, name] of Object.entries(graph.services())) SERVICE[name] = { get: async input => {
        check(input); reads.push({ schema, ...input });
        const result = rows[schema].filter(row => matches(row, input.query));
        return { result: structuredClone(input.query.versionId === undefined && schema === 'product' ? result.slice(-1) : result), count: result.length };
    } };
    SERVICE.DefaultProductService.update = async input => {
        check(input); writes.push(input);
        const original = rows.product.find(row => Object.entries(input.query).every(([key, value]) => row[key] === value));
        assert(original, 'scoped original root required');
        rows.product.push({ ...structuredClone(original), ...structuredClone(input.model), versionId: original.versionId + 1 });
    };
    let publication;
    SERVICE.DefaultPublicationLifecycleService = {
        getRepository: () => ({ get: async () => publication }),
        create: async input => { lifecycleCalls.push(input); return publication = { ...input.publication, state: 'STAGED', revision: 0 }; },
        validate: async input => { lifecycleCalls.push(input); return publication = { ...publication, state: 'VALIDATED', revision: 1 }; },
        requestApproval: async input => { lifecycleCalls.push(input); return publication = { ...publication, state: 'PENDING_APPROVAL', revision: 2 }; },
    };
    const input = { publicationCode: 'publication', productCode: 'p', storeCode: 'store-a', versionId: 0 };
    return { request, configuration, rows, reads, writes, lifecycleCalls, input };
}

test('publisher uses exact owner graph reads and membership-only seal without acquiring generic CRUD', async () => {
    const f = fixture(), original = structuredClone(f.request);
    assert.equal(access.getAccessPoint(f.request.authData, properties.schemaPolicies.product.tenantOwned.accessGroups), 0);
    assert.equal((await governed.create(f.request, f.input)).state, 'PENDING_APPROVAL');
    assert.equal(f.writes.length, 1);
    assert.deepEqual(f.writes[0].query, { tenant: 'tenant-a', enterpriseCode: 'enterprise-a', code: 'p', versionId: 0 });
    assert.deepEqual(Object.keys(f.writes[0].model), ['publicationReferences']);
    assert(f.reads.every(call => call.query.tenant === 'tenant-a' && call.authData.isSystem === true &&
        (call.schema === 'product' ? call.query.enterpriseCode === 'enterprise-a' :
            JSON.stringify(call.query.$or) === JSON.stringify([{ enterpriseCode: 'enterprise-a' }, { enterpriseCode: { $exists: false } }]))));
    assert(f.lifecycleCalls.every(call => JSON.stringify(call.authData) === JSON.stringify(f.request.authData)));
    assert.deepEqual(f.request, original);
    assert.equal(access.getAccessPoint(f.request.authData, properties.schemaPolicies.product.tenantOwned.accessGroups), 0);
});

test('foreign Product root is refused before any seal write or nPublish creation', async () => {
    const f = fixture(); f.rows.product[0].enterpriseCode = 'foreign';
    await assert.rejects(governed.create(f.request, f.input), /missing or changed/);
    assert.equal(f.writes.length, 0); assert.equal(f.lifecycleCalls.length, 0);
});

test('foreign category dependency is refused before the root seal', async () => {
    const f = fixture(); f.rows.category[0].enterpriseCode = 'foreign';
    await assert.rejects(governed.create(f.request, f.input), /category dependency is missing/);
    assert.equal(f.writes.length, 0); assert.equal(f.lifecycleCalls.length, 0);
});

test('neutral dependencies and shared Category ancestry remain exact members of the issuer root', async () => {
    const f = fixture(), original = structuredClone(f.request);
    for (const [schema, rows] of Object.entries(f.rows)) if (schema !== 'product') {
        rows.forEach(row => { delete row.enterpriseCode; });
    }
    f.rows.category[0].parentCode = 'shared-parent';
    f.rows.category.push({ tenant: 'tenant-a', code: 'shared-parent', status: 'ACTIVE', versionId: 0 });
    f.rows.categoryLocalization.push({ tenant: 'tenant-a', code: 'shared-parent-en', categoryCode: 'shared-parent',
        locale: 'en', name: 'Shared Parent', status: 'READY', versionId: 0 });
    f.rows.category.push({ tenant: 'tenant-a', code: 'unrelated', status: 'ACTIVE', versionId: 0 });
    f.rows.productLocalization.push({ tenant: 'tenant-a', code: 'other-en', productCode: 'other-product',
        locale: 'en', status: 'READY', versionId: 0 });
    assert.equal((await governed.create(f.request, f.input)).state, 'PENDING_APPROVAL');
    const sealed = f.writes[0].model.publicationReferences.records;
    assert.equal(sealed.length, 7);
    assert(sealed.some(row => row.schema === 'category' && row.code === 'shared-parent'));
    assert(!sealed.some(row => ['unrelated', 'other-en'].includes(row.code)));
    const resolved = await graph.resolve({ domain: 'product', rootType: 'product', rootCode: 'p', sourceVersion: '1' }, f.request);
    assert.equal(resolved.root.enterpriseCode, 'enterprise-a');
    assert.equal(resolved.records.category.length, 2);
    assert.deepEqual(f.request, original);
    assert.equal(access.getAccessPoint(f.request.authData, properties.schemaPolicies.product.tenantOwned.accessGroups), 0);
});

test('neutral or foreign roots cannot authorize dependency reads or a successor seal', async () => {
    for (const enterpriseCode of [undefined, null, '', 'foreign']) {
        const f = fixture();
        if (enterpriseCode === undefined) delete f.rows.product[0].enterpriseCode;
        else f.rows.product[0].enterpriseCode = enterpriseCode;
        await assert.rejects(governed.create(f.request, f.input), /missing or changed/);
        assert(f.reads.every(call => call.schema === 'product'));
        assert.equal(f.writes.length, 0);
    }
});

test('a caller cannot supply neutral membership or use the fixed read helpers as generic catalogue access', async () => {
    const f = fixture();
    for (const name of ['rootMembership', 'membershipAuthority', 'memberships']) assert.equal(Object.hasOwn(graph, name), false);
    await assert.rejects(graph.current(f.request, 'product', {}), /Exact publisher Product/);
    await assert.rejects(graph.current(f.request, 'category', { code: 'category' }), /Verified Product dependency/);
    await assert.rejects(graph.current(f.request, 'productLocalization', { productCode: 'p' }, {}), /Verified Product dependency/);
    await assert.rejects(graph.read(f.request, { schema: 'category', code: 'category', versionId: 0 }), /Verified Product dependency/);
    const forged = { request: f.request, productCode: 'p', categories: new Set(['category']) };
    await assert.rejects(graph.current(f.request, 'category', { code: 'category' }, forged), /Verified Product dependency/);
    assert.equal(f.reads.length, 0);
});

test('effective reference keys preserve sealed coordinates while membership tokens stay request-local', async () => {
    const f = fixture(), keys = [];
    await governed.create(f.request, f.input);
    let token;
    const effective = { ...graph,
        referenceKey: function (reference) {
            keys.push([reference.schema, reference.code, reference.versionId, reference.hash]);
            return graph.referenceKey(reference);
        },
        read: async function (request, reference, membership) {
            if (membership) token = membership;
            return graph.read.call(this, request, reference, membership);
        } };
    const resolved = await effective.resolve({ domain: 'product', rootType: 'product', rootCode: 'p', sourceVersion: '1' }, f.request);
    assert.equal(resolved.records.category.length, 1);
    assert.equal(keys.length, f.rows.product[1].publicationReferences.records.length * 2);
    assert(keys.every(key => key.length === 4 && /^[a-f0-9]{64}$/.test(key[3])));
    assert(token);
    const reference = f.rows.product[1].publicationReferences.records[0], reads = f.reads.length;
    await assert.rejects(effective.read(structuredClone(f.request), reference, token), /Verified Product dependency/);
    await assert.rejects(effective.read(f.request, { ...reference, hash: 'f'.repeat(64) }, token), /Verified Product dependency/);
    assert.equal(f.reads.length, reads);
});

test('provider-ignored selectors cannot admit unrelated neutral dependencies into the verified root', async () => {
    for (const schema of Object.keys(fixture().rows).filter(schema => schema !== 'product')) {
        const f = fixture(), row = { ...f.rows[schema][0] };
        delete row.enterpriseCode;
        if (schema === 'category') row.code = 'unrelated';
        else if (schema === 'categoryLocalization') row.categoryCode = 'unrelated';
        else row.productCode = 'foreign-product';
        SERVICE[graph.services()[schema]].get = async () => ({ result: [row], count: 1 });
        await assert.rejects(governed.create(f.request, f.input), /escaped verified membership/);
        assert.equal(f.writes.length, 0);
    }
});

test('explicit foreign, null and empty enterprise values on dependencies are not neutral sharing', async () => {
    for (const enterpriseCode of ['foreign', null, '']) {
        const f = fixture();
        SERVICE.DefaultCategoryService.get = async () => ({ result: [{ ...f.rows.category[0], enterpriseCode }], count: 1 });
        await assert.rejects(governed.create(f.request, f.input), /escaped publisher enterprise/);
        assert.equal(f.writes.length, 0);
    }
});

test('sealed neutral records must still match exact hashes and verified root parent membership', async () => {
    for (const changed of ['hash', 'parent']) {
        const f = fixture();
        for (const rows of Object.values(f.rows).slice(1)) rows.forEach(row => { delete row.enterpriseCode; });
        await governed.create(f.request, f.input);
        const row = f.rows.productLocalization[0];
        row.productCode = 'foreign-product';
        if (changed === 'parent') {
            f.rows.product[1].publicationReferences.records.find(ref => ref.schema === 'productLocalization').hash = graph.hash(row);
        }
        await assert.rejects(graph.resolve({ domain: 'product', rootType: 'product', rootCode: 'p', sourceVersion: '1' }, f.request),
            /missing or changed|escaped verified membership/);
        assert.equal(f.writes.length, 1);
    }
});

test('provider cannot return a foreign dependency despite an enterprise-qualified query', async () => {
    const f = fixture();
    SERVICE.DefaultProductVariantService.get = async () => ({ result: [{ ...f.rows.productVariant[0], enterpriseCode: 'foreign' }], count: 1 });
    await assert.rejects(governed.create(f.request, f.input), /escaped publisher enterprise/);
    assert.equal(f.writes.length, 0); assert.equal(f.lifecycleCalls.length, 0);
});

test('conflicting signed aliases, non-access identity and wrong runtime refuse before generated reads', async () => {
    for (const change of [f => { f.request.enterpriseCode = 'foreign'; }, f => { f.request.tenant = 'foreign'; },
        f => { f.request.authData.enterpriseCode = 'foreign'; }, f => { f.request.authData.tokenType = 'service'; },
        f => { f.request.authData.isSystem = true; }, f => { f.configuration.runtimeRole.publication = 'ONLINE'; }]) {
        const f = fixture(); change(f);
        await assert.rejects(governed.create(f.request, f.input), /publisher scope|Staged runtime/);
        assert.equal(f.reads.length, 0); assert.equal(f.writes.length, 0);
    }
});

test('missing Product permission cannot borrow owner persistence or seal a root', async () => {
    const f = fixture(); f.request.authData.permissions = ['publish.lifecycle.create'];
    await assert.rejects(governed.create(f.request, f.input), /generated schema access denied/);
    assert.equal(f.writes.length, 0); assert.equal(f.lifecycleCalls.length, 0);
});

test('await-boundary caller mutation cannot replace signed publication scope or seal identity', async () => {
    const f = fixture(), original = structuredClone(f.request.authData);
    const get = SERVICE.DefaultProductService.get;
    SERVICE.DefaultProductService.get = async input => {
        f.request.enterpriseCode = 'foreign'; f.request.authData.entCode = 'foreign';
        f.input.productCode = 'foreign'; f.input.storeCode = 'foreign';
        return get(input);
    };
    await governed.create(f.request, f.input);
    assert.equal(f.writes[0].query.enterpriseCode, 'enterprise-a');
    assert.equal(f.writes[0].query.code, 'p');
    assert.equal(f.writes[0].model.publicationReferences.storeCode, 'store-a');
    assert(f.lifecycleCalls.every(call => JSON.stringify(call.authData) === JSON.stringify(original)));
});

test('service observation keeps the original service identity and does not borrow human publisher authority', () => {
    const f = fixture();
    f.request.authData = { tenant: 'tenant-a', entCode: 'default', principalType: 'service', tokenType: 'service',
        userGroups: ['serviceAccountUserGroup'], permissions: ['commerce.product.publish'] };
    assert.equal(graph.publisherScope(f.request), undefined);
    assert.equal(graph.persistenceContext(f.request).authData, f.request.authData);
    assert.equal(f.request.authData.entCode, 'default');
});
