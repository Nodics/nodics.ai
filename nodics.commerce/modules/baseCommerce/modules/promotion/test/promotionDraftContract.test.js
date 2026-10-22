/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module promotion/test/promotionDraftContract @description Actual access records, generated service, base/vService steps, owner interceptors and vMongodb over isolated driver I/O. Not installed qualification. @layer test @owner promotion */
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), Module = require('node:module');
const _ = require('lodash');
const owner = require('../src/service/defaultPromotionDraftService');
const controller = require('../src/controller/defaultPromotionBusinessWorkbenchController');
const properties = require('../config/properties'), schemas = require('../src/schemas/schemas').promotion;
const groups = require('../data/init-v001/records/identity/promotionBusinessAccessGroupData');
const roles = require('../data/init-v001/records/identity/promotionBusinessAccessRoleData');
const permissions = require('../data/init-v001/records/identity/promotionPermissionData');
const routes = require('../src/router/routers').promotion.business;
const capability = require('../src/service/defaultPromotionBackofficeCapabilityService');
const workbench = require('../src/service/defaultPromotionBusinessWorkbenchService');
const facade = require('../src/facade/defaultPromotionFacade');
const nativeController = require('../src/controller/defaultPromotionController');
const operation = require('../src/service/defaultPromotionOperationService');
const hooks = require('../src/interceptors/interceptors');
const foundation = '../../../../../../nodics.foundation/modules/';
const db = foundation + 'nDatabase/database/';
const security = require(foundation + 'nRouter/src/service/request/defaultSecuredRequestPipelineService');
const access = require(db + 'src/service/schema/defaultSchemaAccessHandlerService');
const identity = require(foundation + 'nAuth/src/service/identity/defaultIdentityGovernanceService');
const utility = require(db + 'src/service/schema/defaultSchemaUtilityService');
const authoring = require(db + 'src/service/schema/defaultSchemaAuthoringPolicyService');
const safeQuery = require(db + 'src/service/schema/defaultSchemaSafeQueryService');
const schemaDefaults = require(db + 'config/properties');
const baseSchemas = require(db + 'src/schemas/schemas');
const commonUtils = require(foundation + 'nCommon/src/utils/utils');
const mongodb = require(foundation + 'nDatabase/mongodb/src/schemas/model').default;
const versioned = require(foundation + 'nDatabase/mongodb/vMongodb/src/schemas/model').default;
const saveBase = require(db + 'src/service/procs/save/defaultModelSaveInitializerService');
const updateBase = require(db + 'src/service/procs/update/defaultModelsUpdateInitializerService');
const getBase = require(db + 'src/service/procs/get/defaultModelsGetInitializerService');
const saveVersion = require(foundation + 'nService/vService/src/service/procs/save/defaultModelSaveInitializerService');
const updateVersion = require(foundation + 'nService/vService/src/service/procs/update/defaultModelsUpdateInitializerService');
const getVersion = require(foundation + 'nService/vService/src/service/procs/get/defaultModelsGetInitializerService');

function generatedService() {
    const filename = require.resolve(foundation + 'nService/src/service/common.js');
    let source = fs.readFileSync(filename, 'utf8');
    for (const [key, value] of Object.entries({ schmanm: 'promotion', mdulnm: 'promotion', mdlnm: 'PromotionModel',
        srvcName: 'DefaultPromotionService', dsdName: 'DefaultPromotionFacade' })) source = source.replaceAll(key, value);
    const compiled = new Module(filename, module); compiled.paths = module.paths; compiled._compile(source, filename);
    return compiled.exports;
}

function matches(row, query) {
    return Object.entries(query).every(([key, value]) => key === '$and' ? value.every(part => matches(row, part)) :
        key === '$or' ? value.some(part => matches(row, part)) : value && typeof value === 'object' ?
            value.$regex !== undefined ? new RegExp(value.$regex, value.$options).test(row[key]) :
                value.$in ? value.$in.includes(row[key]) : value.$ne !== undefined ? row[key] !== value.$ne : false : row[key] === value);
}

function fixture(t, level = 'edit') {
    const before = Object.fromEntries(['SERVICE', 'CONFIG', 'NODICS', 'UTILS', 'CLASSES', 'FACADE'].map(key => [key, global[key]]));
    t.after(() => Object.assign(global, before));
    const config = { ...structuredClone(schemaDefaults), promotion: { ...structuredClone(properties.promotion), publication: { runtimeRole: 'STAGED', sourceVersioningQualified: true } },
        runtimeRole: { code: 'COMMERCE_STAGED', publication: 'STAGED' },
        identityGovernance: { systemAccessGroups: ['serviceAccountUserGroup'] }, defaultPageSize: 25, defaultPageNumber: 1 };
    const raw = _.merge({}, baseSchemas.default.super, baseSchemas.default.base, schemas.promotion,
        { accessGroups: properties.schemaPolicies.promotion.tenantOwned.accessGroups, versionedReadMode: 'CURRENT' });
    const history = [], calls = [], inserted = [], pipelines = [], interceptors = [];
    let afterRead = () => {}, beforeInsert = () => {}, afterWrite = () => {}, generatedResponse = response => response;
    const log = { debug() {}, error() {} };
    const reader = { ...getBase, ...getVersion, LOG: log }, writer = { ...saveBase, ...saveVersion, LOG: log },
        updater = { ...updateBase, ...updateVersion, LOG: log };
    global.CONFIG = { get: key => config[key] };
    global.UTILS = { ...commonUtils, isBlank: value => value == null || (typeof value === 'object' && !Object.keys(value).length),
        createModelName: name => name[0].toUpperCase() + name.slice(1) + 'Model',
        isArray: Array.isArray, isObject: value => value !== null && typeof value === 'object' };
    global.CLASSES = { NodicsError: class extends Error {
        constructor(error, message, code) { super(message || error?.message || String(error)); this.code = code || error?.code || error; }
    } };
    const insert = async model => {
        await beforeInsert(model);
        if (history.some(row => row.tenant === model.tenant && row.code === model.code && row.versionId === model.versionId))
            throw Object.assign(new Error('Duplicate immutable identity'), { code: 11000 });
        history.push(structuredClone(model)); inserted.push(structuredClone(model));
        return { acknowledged: true, insertedId: model.code + ':' + model.versionId };
    };
    const wrapper = { ...mongodb, ...versioned, rawSchema: raw, versioned: true, primaryKey: 'code', schemaName: 'promotion',
        find(query, options = {}) {
            let rows = history.filter(row => row.tenant === 'tenant-a' && matches(row, query)).map(row => structuredClone(row));
            return { sort(sort) { const [key, direction] = Object.entries(sort)[0]; rows.sort((a, b) => direction * (a[key] - b[key])); return this; },
                count: async () => rows.length, toArray: async () => rows.slice(0, options.limit || rows.length) };
        },
        aggregate(pipeline) {
            // Real provider constructs and validates the pipeline; this driver double executes its bounded stages.
            const newest = new Map();
            history.filter(row => row.tenant === 'tenant-a').forEach(row => {
                if (!newest.has(row.code) || newest.get(row.code).versionId < row.versionId) newest.set(row.code, row);
            });
            let rows = [...newest.values()].filter(row => matches(row, pipeline.find(stage => stage.$match).$match));
            const count = rows.length, page = pipeline.find(stage => stage.$facet).$facet.result;
            const sort = page.find(stage => stage.$sort).$sort;
            rows.sort((a, b) => { for (const [key, direction] of Object.entries(sort)) {
                if (a[key] !== b[key]) return direction * (a[key] < b[key] ? -1 : 1);
            } return 0; });
            const skip = page.find(stage => stage.$skip)?.$skip || 0, limit = page.find(stage => stage.$limit).$limit;
            return { toArray: async () => [{ metadata: [{ count }], result: structuredClone(rows.slice(skip, skip + limit)) }] };
        },
        insertOne: insert,
        insertMany: async models => { for (const model of models) await insert(model); return { acknowledged: true, insertedCount: models.length }; },
    };
    const moduleObject = { rawSchema: { promotion: raw } };
    global.NODICS = { getServerState: () => 'started', getModule: name => name === 'promotion' ? moduleObject : undefined,
        isModuleActive: () => true, getModels: () => ({ PromotionModel: wrapper }), getRouters: () => routes };
    global.SERVICE = { DefaultPromotionDraftService: owner, DefaultPromotionService: generatedService(),
        DefaultCouponOfferService: require('../src/service/defaultCouponOfferService'),
        DefaultPromotionBusinessWorkbenchService: workbench, DefaultPromotionOperationService: operation,
        DefaultPromotionPublicationService: require('../src/service/defaultPromotionPublicationService'),
        DefaultPromotionBudgetAdmissionService: require('../src/service/defaultPromotionBudgetAdmissionService'),
        DefaultCouponSellerAuthorizationService: require('../src/service/defaultCouponSellerAuthorizationService'),
        DefaultSchemaUtilityService: utility, DefaultSchemaAuthoringPolicyService: authoring,
        DefaultSchemaSafeQueryService: safeQuery, DefaultSecuredRequestPipelineService: security,
        DefaultIdentityGovernanceService: identity, DefaultSchemaAccessHandlerService: access,
        DefaultModelSaveInitializerService: writer, DefaultModelsUpdateInitializerService: updater, DefaultModelsGetInitializerService: reader,
        DefaultRecordOwnershipPolicyService: require(db + 'src/service/access/defaultRecordOwnershipPolicyService'),
        DefaultBackofficeCapabilityDefinitionService: require(foundation + 'nService/src/service/module/defaultBackofficeCapabilityDefinitionService'),
    };
    global.FACADE = { DefaultPromotionFacade: facade };
    SERVICE.DefaultPipelineService = { start: async (pipeline, input) => {
        pipelines.push(pipeline);
        calls.push({ pipeline, tenant: input.tenant, authData: structuredClone(input.authData), query: structuredClone(input.query),
            ...(input.model ? { model: structuredClone(input.model) } : {}) });
        const response = {}, steps = pipeline === 'modelsGetInitializerPipeline' ? ['checkAccess', 'buildOptions', 'executeQuery'] :
            pipeline === 'modelSaveInitializerPipeline' ? ['validateModel', 'checkAccess', 'applyDefaultValues', 'removeVirtualProperties', 'saveModel'] :
                ['checkAccess', 'executeQuery'];
        const processor = pipeline === 'modelsGetInitializerPipeline' ? reader : pipeline === 'modelSaveInitializerPipeline' ? writer : updater;
        for (const step of steps) {
            if (pipeline !== 'modelsGetInitializerPipeline' && ['saveModel', 'executeQuery'].includes(step)) {
                const trigger = pipeline === 'modelSaveInitializerPipeline' ? 'preSave' : 'preUpdate';
                for (const hook of Object.values(hooks).filter(hook => hook.item === 'promotion' && hook.trigger === trigger)
                    .sort((a, b) => a.index - b.index)) {
                    interceptors.push(hook.handler);
                    const [service, method] = hook.handler.split('.');
                    await SERVICE[service][method](input);
                }
            }
            await new Promise((resolve, reject) => processor[step](input, response,
                { nextSuccess: resolve, error: (_input, _response, error) => reject(error) }));
        }
        if (pipeline === 'modelsGetInitializerPipeline') await afterRead(response.success);
        else await afterWrite(response.success);
        return generatedResponse(response.success, pipeline);
    } };
    const role = Object.values(roles).find(row => row.accessLevel === level);
    const actualGroup = Object.values(groups).find(row => row.code === role.groupCodes[0]);
    // Hydrated persisted group shape, including the actual inherited Axis operational chain.
    const axisGroups = require('../../../../../../nodics.platform/modules/axis/data/init-v001/records/identity/axisUserGroupData');
    const axis = Object.values(axisGroups).find(row => row.code === 'axisOperationalUserGroup');
    assert(axis);
    assert.deepEqual(axis.parentGroups, ['employeeUserGroup']);
    const hydrated = { ...structuredClone(actualGroup), parentGroups: [{ ...structuredClone(axis), parentGroups: [{ code: 'employeeUserGroup', active: true }] }] };
    const request = { tenant: 'tenant-a', entCode: 'enterprise-a', moduleName: 'promotion',
        authData: { tenant: 'tenant-a', entCode: 'enterprise-a', principalId: 'employee-a', principalType: 'human', tokenType: 'access',
            userGroups: [hydrated], permissions: [] }, httpRequest: { body: {}, params: {} } };
    const seed = (changes = {}) => { const row = { tenant: 'tenant-a', enterpriseCode: 'enterprise-a', code: 'root-a', name: 'Promotion A',
        conditions: {}, actions: {}, active: false, priority: 0, status: 'DRAFT', versionId: 0, revision: 0, ...changes }; history.push(row); return row; };
    return { request, config, raw, wrapper, history, calls, inserted, pipelines, interceptors, seed, actualGroup, role,
        setAfterRead: fn => { afterRead = fn; }, setBeforeInsert: fn => { beforeInsert = fn; }, setAfterWrite: fn => { afterWrite = fn; },
        setGeneratedResponse: fn => { generatedResponse = fn; } };
}

function command(f, operation, body) {
    f.request.httpRequest.body = structuredClone(body);
    return controller[operation](f.request).then(result => result.data);
}
function admit(request, route) {
    return new Promise((resolve, reject) => security.checkAccess({ ...request, router: route }, {},
        { nextSuccess: resolve, error: (_request, _response, error) => reject(error) }));
}
const create = { code: 'root-a', name: 'Campaign A', priority: 3 };
const update = { query: { code: 'root-a', versionId: 0 }, model: { name: 'Revised', priority: 5 },
    options: { recursive: false, returnModified: true } };

for (const level of ['view', 'edit', 'fullControl']) test('actual ' + level + ' group gets owner draft transport, never legacy manage or raw CRUD', async t => {
    const f = fixture(t, level), descriptor = (await controller.schemas(f.request)).data.schemas[0];
    assert.equal(access.getAccessPoint(f.request.authData, f.raw.accessGroups, f.request), 0);
    assert.equal(f.role.scopeType, 'ENTERPRISE');
    assert(!f.actualGroup.permissions.includes('commerce.promotion.manage'));
    assert(Object.values(permissions).some(item => item.code === 'commerce.promotion.draft.write' && item.ownerModule === 'promotion'));
    assert.deepEqual(descriptor.operations, level === 'view' ? ['search', 'read'] : ['search', 'read', 'create', 'update']);
    for (const route of Object.values(routes)) {
        if (level === 'view' && route.permission === 'commerce.promotion.draft.write') await assert.rejects(admit(f.request, route));
        else await admit(f.request, route);
    }
    const legacy = require('../src/router/routers').promotion.backoffice;
    for (const name of ['submit', 'schedule', 'suspend', 'archive', 'approve', 'createCouponBatch', 'reserveCouponBatch', 'releaseCouponBatch'])
        await assert.rejects(admit(f.request, legacy[name]));
    for (const route of [legacy.inspectSellers, legacy.manageSeller]) {
        if (level === 'fullControl') await admit(f.request, route);
        else await assert.rejects(admit(f.request, route));
    }
    const publication = f.config.promotion.publication;
    f.config.promotion.publication = { runtimeRole: 'ONLINE', delivery: { enabled: true } };
    const budgetRequest = { ...f.request, authData: { ...f.request.authData, loginId: 'employee-a' }, payload: {} };
    assert.throws(() => SERVICE.DefaultPromotionBudgetAdmissionService.context(budgetRequest), { code: 'ERR_PROMOTION_BUDGET_ADMISSION_FORBIDDEN' });
    f.config.promotion.publication = publication;
    if (level === 'view') {
        await assert.rejects(command(f, 'create', create));
        await assert.rejects(command(f, 'update', update));
        assert.equal(f.calls.length, 0);
    } else {
        assert.equal(descriptor.apiOperations.create.path, '/business/promotions/drafts');
        assert.equal(descriptor.apiOperations.update.method, 'PATCH');
        assert.equal(descriptor.concurrency.field, 'versionId');
        assert.equal(descriptor.mutationPolicy.savePath, 'PROMOTION_DRAFT_OWNER_COMMAND');
        assert.equal(descriptor.apiOperations.delete.active, false);
        assert.deepEqual(descriptor.fields.filter(field => !field.readOnly).map(field => field.name).sort(), owner.writableFields().sort());
        const original = structuredClone(f.request.authData);
        const first = await command(f, 'create', create), saved = await command(f, 'update', update);
        assert.equal(first.status, 'DRAFT'); assert.equal(first.versionId, 0);
        assert.equal(saved.versionId, 1); assert.equal(saved.revision, 1); assert.equal(saved.name, 'Revised');
        assert.equal(f.history.length, 2); assert.equal(f.history[0].name, 'Campaign A');
        assert.equal(f.history[1].active, false);
        assert.deepEqual(f.history[1].actions, {}); assert.deepEqual(f.history[1].conditions, {});
        assert.equal(f.history[1].enterpriseCode, 'enterprise-a');
        assert(!Object.hasOwn(saved, 'enterpriseCode')); assert(!Object.hasOwn(saved, 'actions'));
        assert.deepEqual(f.request.authData, original);
        assert(f.calls.every(call => call.authData.isSystem === true));
        for (const handler of ['DefaultPromotionPublicationService.validateSourceAuthoring', 'DefaultPromotionOperationService.validatePolicyAuthoring',
            'DefaultPromotionBudgetAdmissionService.protectSave', 'DefaultPromotionBudgetAdmissionService.protect', 'DefaultCouponSellerAuthorizationService.protect'])
            assert(f.interceptors.includes(handler), handler);
        const write = f.calls.find(call => call.pipeline === 'modelsUpdateInitializerPipeline');
        assert.deepEqual(write.query, { tenant: 'tenant-a', enterpriseCode: 'enterprise-a', code: 'root-a', versionId: 0, revision: 0, status: 'DRAFT' });
        await assert.rejects(command(f, 'create', create));
        await assert.rejects(command(f, 'update', update));
        assert.equal(f.history.length, 2);
    }
    for (const method of ['save', 'update']) await assert.rejects(SERVICE.DefaultPromotionService[method]({
        tenant: 'tenant-a', authData: f.request.authData, query: { code: 'root-a' },
        model: { ...create, tenant: 'tenant-a', status: 'DRAFT', versionId: 0, revision: 0, conditions: {}, actions: {} },
    }));
    assert.equal(capability.getCapability().navigation.filter(item => item.featureState === 'DISABLED').length, 8);
});

test('native saveDraft uses signed enterprise and the same qualified versioned owner', async t => {
    const f = fixture(t);
    f.request.httpRequest.body = create;
    const created = await nativeController.saveDraft(f.request);
    assert.equal(created.data.builderState, 'DRAFT_SAVED');
    f.request.httpRequest.params.promotionCode = 'root-a';
    f.request.httpRequest.body = update;
    const saved = await nativeController.saveDraft(f.request);
    assert.equal(saved.data.promotion.versionId, 1);
    assert(f.calls.every(call => call.query.tenant === 'tenant-a' && call.query.enterpriseCode === 'enterprise-a'));
    f.request.httpRequest.params.promotionCode = 'foreign';
    const count = f.calls.length;
    await assert.rejects(nativeController.saveDraft(f.request));
    assert.equal(f.calls.length, count);
});

test('original signed scope and owner permission are mandatory before canonical persistence', async t => {
    const f = fixture(t), initial = structuredClone(f.request);
    const changes = [r => { delete r.authData.entCode; }, r => { delete r.authData.tenant; },
        r => { r.authData.principalType = 'service'; }, r => { r.authData.tokenType = 'service'; },
        r => { r.authData.isSystem = true; }, r => { r.authData.runtimeScope = true; },
        r => { r.authData.userGroups = []; }, r => { r.transactionContext = {}; },
        r => { r.authData.userGroups = [{ code: 'employeeUserGroup', permissions: ['commerce.promotion.read', 'commerce.promotion.manage'] }]; }];
    for (const where of ['root', 'authData', 'body', 'query']) for (const field of ['tenant', 'tenantCode', 'entCode', 'enterpriseCode'])
        changes.push(r => { const target = where === 'root' ? r : ['body', 'query'].includes(where) ? (r.httpRequest[where] ||= {}) : r.authData;
            target[field] = 'foreign'; });
    changes.push(r => { r.httpRequest.headers = { 'X-Enterprise-Code': 'foreign' }; });
    for (const change of changes) {
        f.request = structuredClone(initial); f.request.httpRequest.body = structuredClone(create); change(f.request);
        await assert.rejects(controller.create(f.request));
    }
    assert.equal(f.calls.length, 0); assert.equal(f.inserted.length, 0);
});

test('unqualified source or version methods refuse and discovery remains browse-only', async t => {
    const f = fixture(t);
    const changes = [() => { f.config.runtimeRole.publication = 'ONLINE'; },
        () => { f.config.promotion.publication.sourceVersioningQualified = false; },
        () => { f.config.promotion.publication.runtimeRole = 'ONLINE'; },
        () => { f.wrapper.versioned = false; }, () => { f.raw.versionedReadMode = 'HISTORY'; },
        () => { f.wrapper.primaryKey = '_id'; }, () => { f.wrapper.updateVersionedItems = undefined; },
        () => { SERVICE.DefaultModelsUpdateInitializerService.resolveUpdateMethod = () => 'updateItems'; }];
    for (const change of changes) {
        const config = structuredClone(f.config), model = { ...f.wrapper }, schema = structuredClone(f.raw);
        const updater = { ...SERVICE.DefaultModelsUpdateInitializerService };
        change();
        assert.equal((await controller.capabilities(f.request)).data.mutationMode, 'READ_ONLY');
        await assert.rejects(command(f, 'create', create));
        Object.assign(f.config, config); Object.assign(f.wrapper, model); Object.assign(f.raw, schema);
        SERVICE.DefaultModelsUpdateInitializerService = updater;
    }
    assert.equal(f.calls.length, 0);
});

test('protected status, policy, money, identity and malformed draft values never reach persistence', async t => {
    const f = fixture(t);
    const forbidden = ['tenant', 'enterpriseCode', 'issuerEnterpriseRef', 'vendorEnterpriseRef', 'enterpriseRef', 'status', 'active',
        'budget', 'budgetAdmission', 'approval', 'analytics', 'conditions', 'actions', 'sellerAuthorizations', 'versionId', 'revision',
        'createdBy', 'updatedBy', 'accessGroups', 'ownerId', 'publicationReferences', '$set', 'budget.limit'];
    for (const field of forbidden) for (const mode of ['create', 'update']) {
        const body = mode === 'create' ? { ...create, [field]: 'injected' } : { ...update, model: { name: 'Revised', [field]: 'injected' } };
        await assert.rejects(command(f, mode, body));
    }
    for (const patch of [{ name: '' }, { name: 'a'.repeat(257) }, { priority: '1' }, { priority: -1 },
        { validFrom: 'not-a-date' }, { validTo: null }, { code: { $ne: 'foreign' } }])
        await assert.rejects(command(f, 'create', { ...create, ...patch }));
    assert.equal(f.calls.length, 0);
    for (const versionId of [undefined, -1, '0', Number.MAX_SAFE_INTEGER])
        await assert.rejects(command(f, 'update', { ...update, query: { code: 'root-a', versionId } }));
    assert.equal(f.calls.length, 0);
});

test('foreign, missing, later-state, consent and budget-admitted roots cannot be edited or adopted', async t => {
    const f = fixture(t);
    for (const patch of [{ enterpriseCode: 'other' }, { enterpriseCode: undefined }, { tenant: 'other' },
        { issuerEnterpriseRef: { code: 'other' } },
        ...['SUBMITTED', 'APPROVED', 'SCHEDULED', 'ACTIVE', 'SUSPENDED', 'ARCHIVED'].map(status => ({ status })),
        { budgetAdmission: {} }, { sellerAuthorizations: [] }, { versionId: 1 }, { revision: Number.MAX_SAFE_INTEGER }]) {
        f.history.length = 0; f.seed(patch);
        await assert.rejects(command(f, 'update', update));
        assert.equal(f.inserted.length, 0);
    }
    f.history.length = 0; f.seed({ enterpriseCode: 'other' });
    await assert.rejects(command(f, 'create', create));
    assert.equal(f.inserted.length, 0);
});

test('draft edits preserve existing private policy and financial fields without exposing them', async t => {
    const f = fixture(t), original = structuredClone(f.seed({ conditions: { channel: 'private' }, actions: { discount: '1.00' },
        budget: { limit: '20.00', spent: '0.00' }, approval: { evidence: 'private' } }));
    const result = await command(f, 'update', update);
    for (const field of ['conditions', 'actions', 'budget', 'approval']) {
        assert.deepEqual(f.history[1][field], original[field]); assert(!Object.hasOwn(result, field));
    }
});

test('draft response uses shared safe projection and refuses nested provider fields before writes', async t => {
    const f = fixture(t);
    const valid = { ...create, status: 'DRAFT', revision: 0, versionId: 0, validFrom: new Date('2026-10-01T00:00:00.000Z'),
        budget: { privateEvidence: 'SECRET' } };
    const projected = owner.project(valid);
    assert.deepEqual(projected, workbench.project(valid));
    assert(!Object.hasOwn(projected, 'budget'));
    assert.notEqual(projected.validFrom, valid.validFrom, 'Dates are detached scalar values');
    for (const field of workbench.fields()) for (const value of [{ privateEvidence: 'SECRET' }, ['SECRET']]) {
        assert.throws(() => owner.project({ ...valid, [field]: value }), { code: 'ERR_PROMOTION_WORKBENCH_UNCONFIRMED' });
        f.history.length = 0; f.seed({ [field]: value });
        await assert.rejects(command(f, 'update', { ...update, model: { code: 'root-a' } }));
    }
    assert.equal(f.inserted.length, 0);
});

test('failed or malicious read responses refuse before the generated write', async t => {
    const f = fixture(t); f.seed();
    for (const change of [r => { r.acknowledged = false; }, r => { r.success = false; }, r => { r.code = 'ERR_READ'; },
        r => { r.error = 'failed'; }, r => { r.count = 0; }, r => { delete r.count; },
        r => { r.result[0].enterpriseCode = 'other'; }, r => { r.result[0].tenant = 'other'; },
        r => { r.result[0].issuerEnterpriseRef = { code: 'other' }; },
        r => { r.result[0].code = 'other'; }, r => { r.result[0].versionId = '0'; }, r => { r.result.push(r.result[0]); r.count = 2; }]) {
        f.setAfterRead(change); await assert.rejects(command(f, 'update', update));
    }
    assert.equal(f.inserted.length, 0);
});

for (const mode of ['create', 'update']) test(mode + ' refuses unsuccessful writes, dishonest readback and authority drift without fallback/retry', async t => {
    const f = fixture(t), body = mode === 'create' ? create : update;
    const changes = [r => { r.acknowledged = false; }, r => { r.success = false; }, r => { r.error = 'failed'; },
        r => { r.errors = ['failed']; }, r => { r.code = 'ERR_WRITE'; }, r => { r.result = {}; },
        r => { r.result.acknowledged = false; }, r => { r.result = { acknowledged: true, insertedCount: 0 }; },
        () => { throw new Error('Provider transport interrupted after write'); }];
    for (const change of changes) {
        f.history.length = 0; if (mode === 'update') f.seed();
        f.setAfterWrite(change); const count = f.inserted.length;
        await assert.rejects(command(f, mode, body));
        assert.equal(f.inserted.length, count + 1, 'Unconfirmed response is not retried');
    }
    f.setAfterWrite(() => {});
    for (const change of [row => { row.enterpriseCode = 'other'; }, row => { row.name = 'wrong'; },
        row => { row.status = 'ACTIVE'; }, row => { row.budget = { spent: '99.00' }; }]) {
        f.history.length = 0; if (mode === 'update') f.seed();
        let reads = 0;
        f.setAfterRead(r => { if (++reads === 2) change(r.result[0]); });
        await assert.rejects(command(f, mode, body));
    }
    f.setAfterRead(() => {}); f.history.length = 0; if (mode === 'update') f.seed();
    let reads = 0;
    f.setAfterRead(r => { if (++reads === 2) { r.result = []; r.count = 0; } });
    await assert.rejects(command(f, mode, body));
    f.setAfterRead(() => {}); f.history.length = 0; if (mode === 'update') f.seed();
    f.setAfterWrite(() => { f.request.authData.entCode = 'foreign'; });
    await assert.rejects(command(f, mode, body));
});

test('CURRENT version races and unique successor conflicts refuse without overwriting or retrying', async t => {
    const f = fixture(t); f.seed();
    f.setAfterRead(() => { f.seed({ versionId: 1, revision: 1, name: 'Concurrent owner' }); });
    await assert.rejects(command(f, 'update', update));
    assert.equal(f.inserted.length, 0);
    assert.equal(f.history[1].name, 'Concurrent owner');
    f.setAfterRead(() => {}); f.history.length = 0; f.seed();
    f.setBeforeInsert(() => { f.seed({ versionId: 1, revision: 1, name: 'Concurrent insert' }); });
    await assert.rejects(command(f, 'update', update));
    assert.equal(f.inserted.length, 0);
    assert.equal(f.history.length, 2);
});

test('draft timestamp metadata is bounded and a nonpositive effective window never writes', async t => {
    const f = fixture(t);
    await command(f, 'create', { ...create, validFrom: '2026-10-01T00:00:00.000Z', validTo: '2026-10-30T00:00:00.000Z' });
    assert(f.history[0].validFrom instanceof Date);
    const count = f.inserted.length;
    await assert.rejects(command(f, 'update', { ...update, model: { validTo: '2026-09-01T00:00:00.000Z' } }));
    assert.equal(f.inserted.length, count);
});

test('authority or installed-port drift between read and write cannot spend canonical authority', async t => {
    const f = fixture(t); f.seed();
    f.setAfterRead(() => { f.request.authData.authVersion = 2; });
    await assert.rejects(command(f, 'update', update));
    assert.equal(f.inserted.length, 0);
    f.setAfterRead(() => { f.wrapper.updateVersionedItems = () => {}; });
    await assert.rejects(command(f, 'update', update));
    assert.equal(f.inserted.length, 0);
});

test('advanced builder context derives signed enterprise and rejects conflicting aliases while legacy ledger stays unscoped', t => {
    const f = fixture(t), original = structuredClone(f.request.authData);
    const context = facade.applyOperatorContext(f.request);
    assert.equal(context.enterpriseCode, 'enterprise-a'); assert.deepEqual(context.authData, original);
    for (const change of [r => { delete r.authData.entCode; }, r => { r.enterpriseCode = 'other'; },
        r => { r.authData.enterpriseCode = 'other'; }, r => { r.httpRequest.body = { enterpriseCode: 'other' }; },
        r => { r.httpRequest.query = { tenant: 'other' }; }, r => { r.httpRequest.headers = { entCode: 'other' }; },
        r => { r.authData.principalType = 'service'; }]) {
        const request = structuredClone(f.request); change(request); assert.throws(() => facade.applyOperatorContext(request));
    }
    assert.equal(facade.applyBudgetLedgerContext({ authData: { tenant: 'tenant-a', principalId: 'legacy' } }).enterpriseCode, undefined);
});

test('Axis parser accepts the owner draft editor contract when the integration checkout is selected',
    { skip: !process.env.AXIS_WORKBENCH_CONTRACTS }, async t => {
        const source = fs.readFileSync(process.env.AXIS_WORKBENCH_CONTRACTS, 'utf8');
        const parser = await import('data:text/javascript;base64,' + Buffer.from(Module.stripTypeScriptTypes(source)).toString('base64'));
        const f = fixture(t);
        assert.equal(typeof parser.parseWorkbenchSchemaList, 'function');
        parser.parseWorkbenchSchemaList(JSON.parse(JSON.stringify((await controller.schemas(f.request)).data)));
    });
