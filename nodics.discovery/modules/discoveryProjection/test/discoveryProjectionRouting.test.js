/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module discoveryProjection/test/discoveryProjectionRouting @description Exercises actual DMS owner selection and fixed projection APIs without servers or provider writes. @layer test @owner discoveryProjection */
const test = require('node:test');
const assert = require('node:assert/strict');
const facade = require('../src/service/defaultDiscoveryDocumentProjectionService');
const owner = require('../src/service/defaultDiscoveryProjectionOwnerService');
const boundary = require('../src/service/defaultDiscoveryProjectionTransportService');
const controller = require('../src/controller/defaultDiscoveryProjectionController');
const dms = require('../../../../nodics.foundation/modules/nService/src/service/module/defaultModuleService');
const routes = require('../src/router/routers').discoveryProjection.projection;
const query = () => ({bool: {filter: [
    {term: {'tenant.keyword': 'tenant'}}, {term: {ownerType: 'KNOWLEDGE'}},
    {term: {indexConfigurationCode: 'index'}}, {term: {'payload.publicationOwner.keyword': 'source'}},
    {term: {'payload.publicationGeneration.keyword': '12345678-1234-1234-1234-123456789abc'}}
]}});
for (const scenario of ['local', 'remoteOnly', 'inactive', 'otherPublication']) {
    test('all projection operations use canonical DMS: ' + scenario, async t => {
        const saved = {NODICS: global.NODICS, CONFIG: global.CONFIG, SERVICE: global.SERVICE, CLASSES: global.CLASSES};
        t.after(() => Object.assign(global, saved));
        let local = 0, remote = 0;
        global.CLASSES = {SearchError: Error};
        global.CONFIG = {get: key => key === 'runtimeRole' ? {publication: scenario === 'otherPublication' ? 'STAGED' : 'OPERATIONAL'} :
            key === 'discovery' ? {projection: {targetAuthority: {publication: 'OPERATIONAL', server: null, environment: null}}} : undefined};
        global.NODICS = {isModuleActive: () => scenario !== 'inactive', getServerName: () => 'owner', getSelectedEnvironmentName: () => 'fixture',
            getModels: () => ({DiscoveryDocumentProjectionModel: {typeName: 'logical'}}), getSearchModel: () => ({indexName: 'customPhysical'})};
        global.SERVICE = {DefaultDiscoveryDocumentProjectionService: facade, DefaultDiscoveryProjectionOwnerService: owner,
            DefaultDiscoveryProjectionTransportService: boundary,
            DefaultRouterService: {getModuleServerConfig: () => ({getOptions: () => ({remoteOnly: scenario === 'remoteOnly'})})},
            DefaultPipelineService: {start: async (_name, request) => {
                local++; assert.equal(request.searchModel.indexName, 'customPhysical');
                assert.equal(request.tenant, 'tenant'); return {code: 'SUC_SEARCH'};
            }}};
        SERVICE.DefaultModuleService = {...dms, invokeRemoteModule: async call => {
            remote++; assert.equal(call.moduleName, 'discoveryProjection'); assert.equal(call.targetAuthority.publication, 'OPERATIONAL');
            assert.equal(call.requestBody.authData, undefined); assert.equal(call.requestBody.searchModel, undefined);
            assert.match(call.apiName, /^\/internal\/projection\//); return {code: 'SUC_SEARCH'};
        }};
        const request = {tenant: 'tenant', authData: {actor: 'domain'}};
        await facade.doSave({...request, model: {tenant: 'tenant', code: 'doc', projectedAt: new Date()}});
        await facade.doSearch({...request, query: {match_all: {}}});
        await facade.doRefresh(request);
        await facade.doRemoveByQuery({...request, query: query()});
        assert.equal(local, scenario === 'local' ? 4 : 0); assert.equal(remote, scenario === 'local' ? 0 : 4);
        if (scenario !== 'local') assert.throws(() => owner.getSearchModel(request), /owner is unavailable/);
    });
}
test('boundary denies cross-tenant writes, broad cleanup, executable payloads and unsupported dispatch', () => {
    assert.throws(() => boundary.body('doSave', {tenant: 'tenant', model: {tenant: 'other'}}), /tenant mismatch/);
    assert.throws(() => boundary.body('doRemoveByQuery', {tenant: 'tenant', query: {match_all: {}}}), /Exact/);
    assert.throws(() => boundary.body('doSearch', {tenant: 'tenant', query: {guard: () => true}}), /JSON/);
    assert.throws(() => boundary.body('doSearch', {tenant: 'tenant', moduleName: 'other'}), /module/);
    const wrong = query(); wrong.bool.filter[0].term['tenant.keyword'] = 'other';
    assert.throws(() => boundary.body('doRemoveByQuery', {tenant: 'tenant', query: wrong}), /scope/);
    const analyzed = query(); analyzed.bool.filter[0].term = {tenant: 'tenant'};
    assert.throws(() => boundary.body('doRemoveByQuery', {tenant: 'tenant', query: analyzed}), /Exact/);
    assert.throws(() => boundary.body('dropIndex', {tenant: 'tenant'}), /Invalid/);
});
test('controller preserves middleware identity and denies payload tenant substitution', async t => {
    const saved = global.SERVICE; t.after(() => {global.SERVICE = saved;});
    const actor = {actor: 'trusted'};
    global.SERVICE = {DefaultDiscoveryProjectionTransportService: {doSearch: async request => {assert.equal(request.authData, actor); return [];}}};
    await controller.search({tenant: 'tenant', authData: actor, body: {authData: {actor: 'forged'}}});
    await assert.rejects(controller.search({tenant: 'tenant', authData: actor, body: {tenant: 'other'}}), /mismatch/);
});
test('only fixed internal service-token APIs are exposed; generated CRUD stays closed', () => {
    assert.equal(Object.keys(routes).length, 5);
    assert.equal(require('../src/schemas/schemas').discoveryProjection.discoveryDocumentProjection.router.enabled, false);
    for (const route of Object.values(routes)) {
        assert.equal(route.secured, true); assert.deepEqual(route.authTokenTypes, ['service']);
        assert.equal(route.apiExposure, 'moduleInternal'); assert.match(route.permission, /^discovery.projection\./);
    }
});
test('transport denial propagates without executing a local fallback', async t => {
    const saved = {CONFIG: global.CONFIG, SERVICE: global.SERVICE}; t.after(() => Object.assign(global, saved));
    global.CONFIG = {get: () => ({projection: {targetAuthority: {publication: 'ONLINE'}}})};
    global.SERVICE = {DefaultDiscoveryProjectionTransportService: boundary, DefaultModuleService: {invokeModule: async () => {throw new Error('denied');}},
        DefaultDiscoveryProjectionOwnerService: {doSearch: () => assert.fail('fallback')}};
    await assert.rejects(facade.doSearch({tenant: 'tenant'}), /denied/);
});
test('canonical document builder values cross transport without losing tenant or dates', () => {
    const document = require('../src/service/defaultDiscoveryDocumentBuilderService').build({tenant: 'tenant', ownerType: 'PRODUCT', ownerCode: 'p1', indexConfigurationCode: 'index', payload: {name: 'Product'}});
    const body = boundary.body('doSave', {tenant: 'tenant', model: document});
    assert.equal(body.model.tenant, 'tenant');
    assert.equal(body.model.projectedAt, document.projectedAt.toISOString());
    assert.deepEqual(JSON.parse(JSON.stringify(body)), body);
});
test('trusted domain publication overrides local defaults without accepting role selectors', async t => {
    const saved = {CONFIG: global.CONFIG, SERVICE: global.SERVICE}; t.after(() => Object.assign(global, saved));
    global.CONFIG = {get: () => ({projection: {targetAuthority: {publication: 'STAGED'}}})};
    global.SERVICE = {DefaultDiscoveryProjectionTransportService: boundary, DefaultModuleService: {invokeModule: async call => {
        assert.deepEqual(call.targetAuthority, {publication: 'ONLINE'});
        assert.equal(call.requestBody.targetAuthority, undefined); return {code: 'SUC_SEARCH'};
    }}};
    await facade.doSearch({tenant: 'tenant', targetAuthority: {publication: 'ONLINE'}});
    await assert.rejects(facade.doSearch({tenant: 'tenant', targetAuthority: {runtimeRole: 'ONLINE'}}));
});
test('real route admission denies missing permission, wrong module and access tokens for every new internal API', t => {
    const saved = {CONFIG: global.CONFIG, UTILS: global.UTILS, CLASSES: global.CLASSES}; t.after(() => Object.assign(global, saved));
    const guard = require('../../../../nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService');
    global.CLASSES = {NodicsError: class extends Error {constructor(code, message) {super(message || code);}}};
    global.UTILS = {getUserGroupPermissions: () => ['*'], getUserGroupCodes: groups => groups};
    global.CONFIG = {get: key => key === 'authSecurity' ? require('../../../../nodics.foundation/modules/nAuth/config/properties').authSecurity : undefined};
    const service = {...guard, getRouteActionAuthorizationConfig: () => ({enabled: true, strict: true}), getGroupPermissions: () => ['*']};
    const generationRoutes = require('../../discoveryPublication/src/router/routers').discoveryPublication.generation;
    for (const [moduleName, collection] of [['discoveryProjection', routes], ['discoveryPublication', generationRoutes],
        ['discoveryProjection',require('../src/router/routers').discoveryProjection.physicalRetirement],
        ['discoveryPublication',require('../../discoveryPublication/src/router/routers').discoveryPublication.retirementReceipt],
        ['copilotKnowledge',require('../../../../nodics.copilot/modules/copilotKnowledge/src/router/routers').copilotKnowledge.retirementAuthority]]) {
        for (const route of Object.values(collection)) {
            const auth = {tokenType: 'service', modules: [moduleName], permissions: [route.permission], runtimeScope: {assignmentCode: 'existing'}, userGroups: ['adminGroup']};
            const admit = authData => {let result; service.checkAccess({moduleName, router: route, authData}, {}, {nextSuccess: () => {result = true;}, error: (_a, _b, error) => {result = error;}}); return result;};
            assert.equal(admit(auth), true); assert.notEqual(admit({...auth, permissions: []}), true);
            assert.notEqual(admit({...auth, modules: ['other']}), true); assert.notEqual(admit({...auth, tokenType: 'access'}), true);
        }
    }
});
test('model descriptors preserve opaque object identity and explicit replica pins without exporting provider handles',t=>{
    const saved={SERVICE:global.SERVICE,CONFIG:global.CONFIG,NODICS:global.NODICS};t.after(()=>Object.assign(global,saved));
    let model={indexDef:{indexName:'physical'}};
    global.CONFIG={get:()=>({projection:{targetAuthority:{publication:'ONLINE'}}})};
    global.NODICS={getModels:()=>({DiscoveryDocumentProjectionModel:{typeName:'logical'}}),getSearchModel:()=>model};
    global.SERVICE={DefaultDiscoveryDocumentProjectionService:facade,DefaultModuleService:{
        isLocalModuleActive:()=>true,isCurrentRuntimeAuthority:()=>true,normalizeTargetAuthority:dms.normalizeTargetAuthority,
        getCurrentRuntimeAuthority:()=>({environment:'local',server:'owner',node:'replica1',runtimeRole:{publication:'ONLINE'}})}};
    const first=owner.doDescribeIndex({tenant:'tenant'});
    assert.equal(owner.doDescribeIndex({tenant:'tenant'}).bindingId,first.bindingId);
    assert.deepEqual(first.targetAuthority,{publication:'ONLINE',environment:'local',server:'owner',node:'replica1'});
    model={indexDef:{indexName:'physical'}};
    assert.notEqual(owner.doDescribeIndex({tenant:'tenant'}).bindingId,first.bindingId);
    assert.deepEqual(Object.keys(first).sort(),['bindingId','indexName','targetAuthority']);
});

test('actorless domain operations use authenticated DMS transport even on a local owner', async t => {
 const saved = {CONFIG: global.CONFIG, SERVICE: global.SERVICE, NODICS: global.NODICS};
 t.after(() => Object.assign(global, saved));
 global.CONFIG = {get: key => key === 'runtimeRole' ? {publication: 'ONLINE'} : key === 'discovery' ? {projection: {targetAuthority: {publication: 'ONLINE'}}} : undefined};
 global.NODICS = {isModuleActive: () => true, getServerName: () => 'owner', getSelectedEnvironmentName: () => 'fixture'};
 let calls = 0;
 global.SERVICE = {DefaultDiscoveryProjectionTransportService: boundary,
  DefaultRouterService: {getModuleServerConfig: () => ({getOptions: () => ({})})},
  DefaultModuleService: {...dms,
   invokeLocalModule: () => assert.fail('Actorless requests must not use local owner admission'),
   invokeRemoteModule: async call => {calls++; assert.equal(call.local, false); assert.equal(call.requestBody.authData, undefined); assert.equal(call.request.authData, undefined); assert.equal(call.apiName, '/internal/projection/search'); return {code: 'SUC_SEARCH'};}
  }};
 await facade.doSearch({tenant: 'tenant', query: {site: 'site-a'}}); assert.equal(calls, 1);
 SERVICE.DefaultModuleService.invokeRemoteModule = async () => {throw new Error('service grant denied');};
 await assert.rejects(facade.doSearch({tenant: 'tenant'}), /service grant denied/);
});
