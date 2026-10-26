/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module product/test/productAdministrativeAuthoring @description Native proof, bounded graph and generated version-zero writer regressions with isolated I/O; not live qualification. @layer test @owner product */
const test = require('node:test'),
    assert = require('node:assert/strict');
const fs = require('node:fs'),
    Module = require('node:module'),
    _ = require('lodash');
const owner = require('../src/service/defaultProductBusinessAuthoringService');
const native = require('../src/service/defaultProductAdministrativeAuthoringService');
const graph = require('../src/service/defaultProductAdministrativeCatalogueService');
const controller = require('../src/controller/defaultProductBusinessAuthoringController');
const properties = require('../config/properties');
const schemas = require('../src/schemas/schemas').product;
const foundation = '../../../../../../nodics.foundation/modules/';
const db = foundation + 'nDatabase/database/';
const baseSchemas = require(db + 'src/schemas/schemas');
const defaults = require(db + 'config/properties');
const baseWriter = require(db + 'src/service/procs/save/defaultModelSaveInitializerService');
const versionWriter = require(
    foundation + 'nService/vService/src/service/procs/save/defaultModelSaveInitializerService',
);
const baseModel = require(foundation + 'nDatabase/mongodb/src/schemas/model').default;
const versionModel = require(foundation + 'nDatabase/mongodb/vMongodb/src/schemas/model').default;
const names = ['product', 'productVariant', 'productLocalization', 'productVariantLocalization'];
const clone = (value) => structuredClone(value);

function fixture(t) {
    const keys = ['CONFIG', 'SERVICE', 'NODICS', 'UTILS', 'CLASSES'];
    const prior = keys.map((key) => [key, Object.getOwnPropertyDescriptor(global, key)]);
    t.after(() => prior.forEach(([key, d]) => (d ? Object.defineProperty(global, key, d) : delete global[key])));
    const config = {
        ...clone(defaults),
        product: clone(properties.product),
        runtimeRole: { publication: 'STAGED' },
        identityGovernance: { systemAccessGroups: ['serviceAccountUserGroup'] },
    };
    const rows = Object.fromEntries(names.map((name) => [name, []])),
        models = {},
        raw = {};
    const state = {
        proofs: [],
        writes: [],
        calls: [],
        denied: new Set(),
        beforeSave: () => {},
        afterRead: () => {},
        afterProof: () => {},
    };
    global.CONFIG = { get: (key) => config[key] };
    global.CLASSES = {
        NodicsError: class extends Error {
            constructor(code) {
                super(code);
                this.code = code;
            }
        },
    };
    global.UTILS = {
        ...require(foundation + 'nCommon/src/utils/utils'),
        isArray: Array.isArray,
        isBlank: (v) => v == null || (typeof v === 'object' && !Object.keys(v).length),
        isObject: (v) => v !== null && typeof v === 'object',
    };
    const writer = { ...baseWriter, ...versionWriter, LOG: { debug() {}, error() {} } };
    global.SERVICE = {
        DefaultProductBusinessAuthoringService: owner,
        DefaultProductAdministrativeAuthoringService: native,
        DefaultProductAdministrativeCatalogueService: graph,
        DefaultIdentityGovernanceService: require(
            foundation + 'nAuth/src/service/identity/defaultIdentityGovernanceService',
        ),
        DefaultSchemaAccessHandlerService: require(db + 'src/service/schema/defaultSchemaAccessHandlerService'),
        DefaultRecordOwnershipPolicyService: require(db + 'src/service/access/defaultRecordOwnershipPolicyService'),
        DefaultSchemaUtilityService: require(db + 'src/service/schema/defaultSchemaUtilityService'),
        DefaultSchemaAuthoringPolicyService: require(db + 'src/service/schema/defaultSchemaAuthoringPolicyService'),
        DefaultSecuredRequestPipelineService: require(
            foundation + 'nRouter/src/service/request/defaultSecuredRequestPipelineService',
        ),
        DefaultModelSaveInitializerService: writer,
        DefaultModelsGetInitializerService: { resolveReadMethod: () => 'getCurrentVersionItems' },
        DefaultModelsUpdateInitializerService: { resolveUpdateMethod: () => 'updateVersionedItems' },
    };
    global.NODICS = {
        getModule: () => ({ rawSchema: raw }),
        getModels: () => models,
        isModuleActive: () => true,
        getServerState: () => 'started',
    };
    const body = { targetEnterpriseCode: 'MARKET', command: sample() };
    const request = {
        tenant: 'tenant-a',
        authorization: 'Bearer native-proof',
        authData: {
            tenant: 'tenant-a',
            entCode: 'PLATFORM',
            principalType: 'human',
            tokenType: 'access',
            authenticationMethod: 'PASSWORD',
            authVersion: 7,
            loginId: 'admin',
            permissions: ['*'],
            userGroups: [
                { code: 'platformAdministratorUserGroup', active: true, permissions: ['*'], parentGroups: [] },
            ],
        },
        httpRequest: { body, headers: { authorization: 'Bearer native-proof', 'x-enterprise-code': 'PLATFORM' } },
    };
    SERVICE.DefaultModuleService = {
        invokeModule: async (call) => {
            assert.equal(call.header.Authorization, request.authorization);
            assert.equal(call.header['X-Enterprise-Code'], 'PLATFORM');
            assert.equal(call.tenant, 'tenant-a');
            assert.equal(call.maxAttempts, 1);
            state.calls.push(clone(call));
            if (call.apiName === config.product.administrativeAuthoring.evidencePath) {
                const { nonce, permission } = call.requestBody;
                state.proofs.push(permission);
                if (state.denied.has(permission)) throw Error('denied');
                const proof = {
                    contractVersion: 1,
                    nonce,
                    permission,
                    tenant: 'tenant-a',
                    enterpriseCode: 'PLATFORM',
                    actorCode: 'admin',
                    authVersion: 7,
                    principalType: 'human',
                    platformAdministrator: true,
                };
                state.afterProof(proof);
                return { data: proof };
            }
            return {
                data: {
                    contractVersion: 1,
                    tenant: state.targetTenant || 'tenant-a',
                    recipient: { ownerType: 'ENTERPRISE', ownerCode: 'MARKET' },
                },
            };
        },
    };
    for (const name of names) {
        const title = name[0].toUpperCase() + name.slice(1);
        raw[name] = _.merge({}, baseSchemas.default.super, baseSchemas.default.base, schemas[name], {
            accessGroups: properties.schemaPolicies.product.tenantOwned.accessGroups,
            versionedReadMode: 'CURRENT',
        });
        models[title + 'Model'] = {
            ...baseModel,
            ...versionModel,
            rawSchema: raw[name],
            versioned: true,
            primaryKey: 'code',
            schemaName: name,
            find(query, options = {}) {
                let found = rows[name].filter((row) => Object.entries(query).every(([k, v]) => row[k] === v));
                return {
                    sort(sort) {
                        const [key, direction] = Object.entries(sort)[0];
                        found.sort((a, b) => direction * (a[key] - b[key]));
                        return this;
                    },
                    count: async () => found.length,
                    toArray: async () => clone(found.slice(0, options.limit || found.length)),
                };
            },
            insertOne: async (model) => {
                if (
                    rows[name].some(
                        (r) => r.code === model.code && r.tenant === model.tenant && r.versionId === model.versionId,
                    )
                )
                    throw Error('duplicate');
                // Match MongoDB driver behavior: insertOne mutates the supplied document with a BSON identity.
                model._id = new (require('mongodb').ObjectId)();
                rows[name].push(clone(model));
                return { acknowledged: true, insertedId: model.code };
            },
        };
        const filename = require.resolve(foundation + 'nService/src/service/common.js');
        let source = fs.readFileSync(filename, 'utf8');
        for (const [key, value] of Object.entries({
            schmanm: name,
            mdulnm: 'product',
            mdlnm: title + 'Model',
            srvcName: 'Default' + title + 'Service',
            dsdName: 'Default' + title + 'Facade',
        }))
            source = source.replaceAll(key, value);
        const compiled = new Module(filename, module);
        compiled.paths = module.paths;
        compiled._compile(source, filename);
        SERVICE['Default' + title + 'Service'] = {
            ...compiled.exports,
            get: async (r) => {
                const result = clone(
                    rows[name].filter((row) => Object.entries(r.query).every(([k, v]) => row[k] === v)),
                );
                const response = { code: 'SUC_FIND_00000', count: result.length, result };
                state.afterRead(name, response);
                return response;
            },
        };
    }
    SERVICE.DefaultPipelineService = {
        start: async (pipeline, input) => {
            assert.equal(pipeline, 'modelSaveInitializerPipeline');
            state.beforeSave(input);
            state.writes.push(clone(input.model));
            const response = {};
            for (const step of [
                'validateModel',
                'checkAccess',
                'applyDefaultValues',
                'removeVirtualProperties',
                'saveModel',
            ])
                await new Promise((resolve, reject) =>
                    writer[step](input, response, { nextSuccess: resolve, error: (_i, _r, e) => reject(e) }),
                );
            return response.success;
        },
    };
    const run = async (operation = 'GraphCreate', command = body.command) => {
        request.httpRequest.body = {
            targetEnterpriseCode: 'MARKET',
            ...(operation === 'Capabilities' ? {} : { command }),
        };
        return (await controller['administrative' + operation](request)).data;
    };
    return { config, rows, raw, models, state, request, run };
}
function sample() {
    const classification = {
        productType: 'DIGITAL',
        fulfillmentStrategy: 'DIGITAL_COMMERCE',
        digitalDeliveryType: 'COUPON_CODE',
    };
    return {
        product: { code: 'coupon-a', name: 'Coupon', catalogVersion: 'catalog-a', status: 'ACTIVE', ...classification },
        variants: [
            {
                code: 'variant-a',
                productCode: 'coupon-a',
                sku: 'sku-a',
                status: 'ACTIVE',
                ...classification,
                attributes: {
                    ...classification,
                    kind: 'COUPON',
                    inventoryStrategy: 'COUPON_CODE_POOL',
                    promotionCode: 'offer-a',
                    couponBatchCode: 'batch-a',
                },
            },
        ],
        localizations: [
            {
                code: 'localized-a',
                productCode: 'coupon-a',
                locale: 'en',
                name: 'Coupon',
                status: 'READY',
                media: { primaryMediaCode: 'media-a' },
                classificationValues: { categoryCodes: ['category-a'] },
            },
        ],
        variantLocalizations: [
            {
                code: 'variant-en',
                productCode: 'coupon-a',
                variantCode: 'variant-a',
                locale: 'en',
                attributes: {},
                status: 'READY',
            },
        ],
    };
}

test('native target graph uses actual generated version-zero writer and exact safe readback', async (t) => {
    const f = fixture(t),
        auth = clone(f.request.authData),
        response = await f.run();
    assert.equal(response.targetEnterpriseCode, 'MARKET');
    assert.equal(response.result.publicationRequired, true);
    assert.equal(response.result.records.length, 4);
    assert.equal(f.state.writes.length, 4);
    assert.equal(response.audit.actorCode, 'admin');
    assert.equal(response.audit.actorEnterpriseCode, 'PLATFORM');
    assert.deepEqual(f.request.authData, auth);
    for (const row of Object.values(f.rows).flat()) {
        assert.equal(row.enterpriseCode, 'MARKET');
        assert.equal(row.tenant, 'tenant-a');
        assert.equal(row.createdBy, 'admin');
        assert.equal(row.versionId, 0);
        assert.equal(row.revision, 0);
        assert.equal(row.publicationReferences, undefined);
        assert.equal(row.listingAuthoring, undefined);
    }
    const read = await f.run('GraphRead', { productCode: 'coupon-a' });
    assert.equal(read.result.variants[0].attributes.promotionCode, 'offer-a');
    assert.equal(read.result.localizations[0].media.primaryMediaCode, 'media-a');
    assert.equal(read.result.product.tenant, undefined);
    await assert.rejects(f.run('GraphCreate', sample()), /CONFLICT/);
    assert.equal(f.state.writes.length, 4);
});

for (const [name, change] of Object.entries({
    'missing attributes': (g) => delete g.variants[0].attributes,
    'missing coupon reference': (g) => delete g.variants[0].attributes.promotionCode,
    'foreign parent': (g) => (g.variants[0].productCode = 'foreign'),
    'foreign localized variant': (g) => (g.variantLocalizations[0].variantCode = 'foreign'),
    'extra variant locale': (g) => (g.variantLocalizations[0].locale = 'fr'),
    'missing required localized variant': (g) => (g.variantLocalizations = []),
    'duplicate code': (g) => g.variants.push(clone(g.variants[0])),
    'duplicate SKU': (g) => g.variants.push({ ...clone(g.variants[0]), code: 'other' }),
    'duplicate locale': (g) => g.localizations.push({ ...clone(g.localizations[0]), code: 'other' }),
    'root proof': (g) => (g.product.publicationReferences = {}),
    'nested proof': (g) => (g.variants[0].attributes.listingAuthoring = {}),
    'asset substitution': (g) => (g.variants[0].attributes.kind = 'ASSET'),
    'relative expiry': (g) => (g.variants[0].attributes.validityDays = 30),
    'caller scope': (g) => (g.product.enterpriseCode = 'other'),
    'caller version': (g) => (g.product.versionId = 1),
    'non-coupon root': (g) => (g.product.digitalDeliveryType = 'DIGITAL_OWNERSHIP'),
}))
    test('rejects ' + name + ' before any write with owner error', async (t) => {
        const f = fixture(t),
            input = sample();
        change(input);
        await assert.rejects(f.run('GraphCreate', input), (e) => e.code === 'ERR_PRODUCT_AUTHORING_INPUT');
        assert.equal(f.state.writes.length, 0);
    });

for (const kind of ['records', 'bytes', 'depth', 'accessor', 'cycle'])
    test('bounded ' + kind + ' rejects before write', async (t) => {
        const f = fixture(t),
            input = sample(),
            p = f.config.product.administrativeAuthoring;
        if (kind === 'records') p.maximumGraphRecords = 3;
        if (kind === 'bytes') p.maximumGraphBytes = 100;
        if (kind === 'depth') p.maximumDepth = 2;
        if (kind === 'cycle') input.product.loop = input;
        if (kind === 'accessor')
            Object.defineProperty(input.variants[0].attributes, 'bad', {
                enumerable: true,
                get() {
                    assert.fail('accessor evaluated');
                },
            });
        await assert.rejects(f.run('GraphCreate', input), /INPUT/);
        assert.equal(f.state.writes.length, 0);
    });

for (const kind of ['nonce', 'actorCode', 'tenant', 'authVersion', 'platformAdministrator', 'permission'])
    test('rejects mismatched native proof ' + kind, async (t) => {
        const f = fixture(t);
        f.state.afterProof = (p) => (p[kind] = 'wrong');
        await assert.rejects(f.run(), /SCOPE/);
        assert.equal(f.state.writes.length, 0);
    });
test('target tenant cannot differ from original native tenant', async (t) => {
    const f = fixture(t);
    f.state.targetTenant = 'foreign';
    await assert.rejects(f.run(), /SCOPE/);
    assert.equal(f.state.writes.length, 0);
});
test('a caller constructed scope object cannot enter catalogue persistence', async (t) => {
    fixture(t);
    await assert.rejects(
        graph.execute({ scope: () => ({ tenant: 'tenant-a', enterpriseCode: 'MARKET' }) }, 'graphCreate'),
        /INPUT|SCOPE/,
    );
});
test('fresh proof revocation after preflight prevents first persistence', async (t) => {
    const f = fixture(t);
    f.state.afterRead = () => f.state.denied.add('commerce.product.write');
    await assert.rejects(f.run(), /denied/);
    assert.equal(f.state.writes.length, 0);
});
test('partial graph stays inspectable and create collision never adopts or retries it', async (t) => {
    const f = fixture(t);
    f.state.beforeSave = () => {
        if (f.state.writes.length === 1) throw Error('second save unavailable');
    };
    const partial = (await f.run()).result;
    assert.equal(partial.outcome, 'PARTIAL');
    assert.equal(partial.code, 'ERR_PRODUCT_AUTHORING_PARTIAL');
    assert.deepEqual(partial.confirmedRecords, [
        { schemaName: 'product', code: 'coupon-a', versionId: 0, revision: 0 },
    ]);
    assert.equal(partial.uncertainAttempt.code, 'variant-a');
    assert.equal(partial.unattemptedRecords.length, 2);
    assert.equal(partial.automaticRetryAllowed, false);
    assert(!JSON.stringify(partial).includes('Bearer'));
    assert.equal(f.rows.product.length, 1);
    assert.equal(f.rows.productVariant.length, 0);
    const read = await f.run('GraphRead', { productCode: 'coupon-a' });
    assert.equal(read.result.product.code, 'coupon-a');
    assert.deepEqual(read.result.variants, []);
    await assert.rejects(f.run('GraphCreate', sample()), /CONFLICT/);
    assert.equal(f.state.writes.length, 1);
});
test('semantic SKU collision rejects even under different code and enterprise', async (t) => {
    const f = fixture(t);
    f.rows.productVariant.push({
        tenant: 'tenant-a',
        enterpriseCode: 'OTHER',
        code: 'other',
        sku: 'sku-a',
        versionId: 0,
        revision: 0,
    });
    await assert.rejects(f.run(), /CONFLICT/);
    assert.equal(f.state.writes.length, 0);
});
test('provider returned unrelated rows reject independently of query', async (t) => {
    const f = fixture(t);
    f.state.afterRead = (_n, r) => {
        r.result = [{ tenant: 'tenant-a', enterpriseCode: 'MARKET', code: 'unrelated', versionId: 0, revision: 0 }];
        r.count = 1;
    };
    await assert.rejects(f.run(), /CONFLICT/);
    assert.equal(f.state.writes.length, 0);
});
for (const field of ['listingAuthoring', 'digitalBinding', 'attributes'])
    test('graph read refuses existing asset/proof content ' + field, async (t) => {
        const f = fixture(t);
        await f.run();
        if (field === 'attributes')
            f.rows.productVariant[0].attributes.publicationReferences = { secret: 'not exposed' };
        else f.rows.productVariant[0][field] = { secret: 'not exposed' };
        await assert.rejects(f.run('GraphRead', { productCode: 'coupon-a' }), /INPUT|CONFLICT/);
    });

for (const qualification of ['write', 'Online', 'schema', 'CURRENT'])
    test('capabilities do not advertise unqualified graph create: ' + qualification, async (t) => {
        const f = fixture(t);
        if (qualification === 'write') f.state.denied.add('commerce.product.write');
        if (qualification === 'Online') f.config.runtimeRole.publication = 'ONLINE';
        if (qualification === 'schema')
            SERVICE.DefaultSchemaAuthoringPolicyService = { describe: () => ({ authoringAllowed: false }) };
        if (qualification === 'CURRENT') f.models.ProductVariantModel.rawSchema.versionedReadMode = 'HISTORY';
        const response = await f.run('Capabilities');
        assert.equal(response.result.graphOperations.create.active, false);
        assert.equal(f.state.writes.length, 0);
    });
test('capabilities advertise qualified source graph only, never publication', async (t) => {
    const f = fixture(t),
        r = await f.run('Capabilities');
    assert.equal(r.result.graphOperations.create.active, true);
    assert.equal(r.result.graphOperations.read.active, true);
    assert(f.state.proofs.includes('commerce.product.write'));
    assert.equal(r.result.graphOperations.publish, undefined);
    assert.equal(f.state.writes.length, 0);
});
test('all fixed administrative routes preserve secured permission/exposure/privacy contracts', () => {
    const routes = require('../src/router/routers').product.businessAuthoring;
    const selected = Object.values(routes).filter((r) => r.key.startsWith('/business/products/administrative/'));
    assert.equal(selected.length, 9);
    for (const r of selected) {
        assert.equal(r.method, 'POST');
        assert.equal(r.secured, true);
        assert.deepEqual(r.authTokenTypes, ['access']);
        assert.equal(r.apiExposure, 'commerceManagement');
        assert.equal(r.cache.enabled, false);
        assert.equal(r.requestPrivacy.sensitive, true);
        assert.equal(typeof controller[r.operation], 'function');
    }
});

for (const kind of ['wrong root', 'wrong child parent', 'orphan variant'])
    test('graph-read rejects ' + kind, async (t) => {
        const f = fixture(t);
        await f.run();
        f.state.afterRead = (name, response) => {
            if (kind === 'wrong root' && name === 'product') response.result[0].code = 'other';
            if (kind === 'wrong child parent' && name === 'productVariant') response.result[0].productCode = 'other';
            if (kind === 'orphan variant' && name === 'productVariantLocalization')
                response.result[0].variantCode = 'missing';
        };
        await assert.rejects(f.run('GraphRead', { productCode: 'coupon-a' }), /CONFLICT|INPUT/);
        assert.equal(f.state.writes.length, 4);
    });
test('acknowledged write with unavailable readback remains uncertain and is not auto-retried', async (t) => {
    const f = fixture(t);
    f.state.afterRead = (name, r) => {
        if (f.state.writes.length === 1) {
            r.code = 'ERR_PRIVATE_PROVIDER';
        }
    };
    const partial = (await f.run()).result;
    assert.equal(partial.outcome, 'PARTIAL');
    assert.equal(partial.confirmedRecords.length, 0);
    assert.equal(partial.uncertainAttempt.code, 'coupon-a');
    assert.equal(partial.unattemptedRecords.length, 3);
    assert.equal(f.rows.product.length, 1);
    assert.equal(f.state.writes.length, 1);
});
test('graph-read enforces total record bound across all four sources', async (t) => {
    const f = fixture(t);
    await f.run();
    f.config.product.administrativeAuthoring.maximumGraphRecords = 3;
    await assert.rejects(f.run('GraphRead', { productCode: 'coupon-a' }), /CONFLICT/);
});

async function partialFixture(t) {
    const f = fixture(t);
    f.state.beforeSave = () => {
        if (f.state.writes.length === 1) throw Error('private provider failure');
    };
    const partial = (await f.run()).result;
    assert.equal(partial.outcome, 'PARTIAL');
    f.state.beforeSave = () => {};
    return {
        f,
        command: {
            graph: sample(),
            confirmedRecords: partial.confirmedRecords,
            reason: 'Reviewed exact original partial graph',
        },
    };
}

for (const drift of ['retained root', 'SKU collision']) test('continuation rejects afterProof '+drift+' before dispatch', async t => {
    const {f,command}=await partialFixture(t);
    let proofs=0;
    f.state.afterProof=()=>{
        // Outer and catalogue admissions are first; the third proof follows inventory inspection before dispatch.
        if(++proofs!==3)return;
        if(drift==='retained root')f.rows.product[0].name='Changed during Profile proof';
        else f.rows.productVariant.push({...clone(f.rows.product[0]),code:'competing',productCode:'other',sku:'sku-a'});
    };
    await assert.rejects(f.run('GraphContinue',command),/CONFLICT/);
    assert.equal(proofs,3);assert.equal(f.state.writes.length,1);
    assert.equal(f.rows.productLocalization.length,0);
});

test('explicit continuation preserves BSON root and creates only absent children with actual provider', async (t) => {
    const { f, command } = await partialFixture(t),
        root = clone(f.rows.product[0]);
    const result = (await f.run('GraphContinue', command)).result;
    assert.equal(result.outcome, 'COMPLETE');
    assert.equal(result.createdRecords.length, 3);
    assert.equal(result.retainedRecords.length, 1);
    assert.equal(result.continuation.actorCode, 'admin');
    assert.deepEqual(f.rows.product[0], root);
    assert.equal(f.rows.product.length, 1);
    assert.equal(f.state.writes.length, 4);
    await assert.rejects(f.run('GraphContinue', command), /CONFLICT/);
    await assert.rejects(f.run('GraphContinue', { ...command, confirmedRecords: result.records }), /CONFLICT/);
    assert.equal(f.state.writes.length, 4);
});

for (const kind of [
    'name',
    'scope',
    'actor',
    'version',
    'proof',
    'extra child',
    'pin omitted',
    'pin duplicate',
    'reason',
    'SKU collision',
])
    test('continuation rejects ' + kind + ' without writing', async (t) => {
        const { f, command } = await partialFixture(t);
        if (kind === 'name') command.graph.product.name = 'Different terms';
        if (kind === 'scope') f.rows.product[0].enterpriseCode = 'OTHER';
        if (kind === 'actor') f.rows.product[0].createdBy = 'other';
        if (kind === 'version') f.rows.product[0].versionId = 1;
        if (kind === 'proof') f.rows.product[0].publicationReferences = { code: 'published' };
        if (kind === 'extra child')
            f.rows.productVariant.push({ ...clone(f.rows.product[0]), code: 'unknown', productCode: 'coupon-a' });
        if (kind === 'pin omitted') command.confirmedRecords = [];
        if (kind === 'pin duplicate') command.confirmedRecords.push(clone(command.confirmedRecords[0]));
        if (kind === 'reason') command.reason = '';
        if (kind === 'SKU collision')
            f.rows.productVariant.push({
                ...clone(f.rows.product[0]),
                code: 'other',
                productCode: 'other',
                sku: 'sku-a',
            });
        await assert.rejects(f.run('GraphContinue', command), /CONFLICT|INPUT/);
        assert.equal(f.state.writes.length, 1);
    });

test('continuation rechecks retained content after awaits and refuses drift before first child', async (t) => {
    const { f, command } = await partialFixture(t);
    let reads = 0;
    f.state.afterRead = (name) => {
        if (name === 'product' && ++reads === 1) f.rows.product[0].name = 'Changed during review';
    };
    await assert.rejects(f.run('GraphContinue', command), /CONFLICT/);
    assert.equal(f.state.writes.length, 1);
});

test('continuation rechecks native permission before first child', async (t) => {
    const { f, command } = await partialFixture(t);
    f.state.afterRead = () => f.state.denied.add('commerce.product.write');
    await assert.rejects(f.run('GraphContinue', command), /denied/);
    assert.equal(f.state.writes.length, 1);
});

test('partial continuation is inspectable, preserves root and reports retained plus new records', async (t) => {
    const { f, command } = await partialFixture(t);
    f.state.beforeSave = () => {
        if (f.state.writes.length === 2) throw Error('later unavailable');
    };
    const partial = (await f.run('GraphContinue', command)).result;
    assert.equal(partial.outcome, 'PARTIAL');
    assert.equal(partial.confirmedRecords.length, 2);
    assert.equal(partial.uncertainAttempt.schemaName, 'productLocalization');
    assert.equal(partial.unattemptedRecords.length, 1);
    assert.equal(f.rows.product.length, 1);
    assert.equal(f.rows.productVariant.length, 1);
    f.state.beforeSave = () => {};
    const done = (await f.run('GraphContinue', { ...command, confirmedRecords: partial.confirmedRecords })).result;
    assert.equal(done.outcome, 'COMPLETE');
    assert.equal(done.createdRecords.length, 2);
});

test('actual HTTP response owner serializes safe partial DTO with 409, not hidden generic error metadata', async (t) => {
    const f = fixture(t);
    f.state.beforeSave = () => {
        if (f.state.writes.length === 1) throw Error('private diagnostic Bearer hidden');
    };
    f.request.httpRequest.body = { targetEnterpriseCode: 'MARKET', command: sample() };
    const envelope = await controller.administrativeGraphCreate(f.request);
    SERVICE.DefaultStatusService = { get: () => ({ code: 409, message: 'Explicit graph readback required' }) };
    const handler = require(foundation + 'nRouter/src/service/handlers/response/defaultJsonResponseHandlerService');
    let body, status;
    handler.handleSuccess(
        {},
        {
            status: (n) => {
                status = n;
            },
            json: (v) => {
                body = JSON.parse(JSON.stringify(v));
            },
        },
        envelope,
    );
    assert.equal(status, 409);
    assert.equal(body.code, 'ERR_PRODUCT_AUTHORING_PARTIAL');
    assert.equal(body.data.result.outcome, 'PARTIAL');
    assert.equal(body.data.result.confirmedRecords.length, 1);
    assert.equal(body.data.result.uncertainAttempt.code, 'variant-a');
    assert.equal(body.data.result.unattemptedRecords.length, 2);
    assert(!JSON.stringify(body).includes('private diagnostic'));
    assert(!JSON.stringify(body).includes('Bearer'));
});
