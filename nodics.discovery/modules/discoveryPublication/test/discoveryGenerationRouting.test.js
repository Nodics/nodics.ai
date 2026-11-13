/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module discoveryPublication/test/discoveryGenerationRouting @description Verifies explicit owner routing and fixed manifest CAS admission with no external providers. @layer test @owner discoveryPublication */
const test = require('node:test');
const assert = require('node:assert/strict');
const transport = require('../src/service/defaultDiscoveryGenerationTransportService');
const owner = require('../src/service/defaultDiscoveryGenerationOwnerService');
const publication = require('../src/service/defaultDiscoveryGenerationPublicationService');
const controller = require('../src/controller/defaultDiscoveryGenerationController');
const dms = require('../../../../nodics.foundation/modules/nService/src/service/module/defaultModuleService');
const scope = {tenant: 'tenant', indexName: 'index', indexConfigurationCode: 'config', ownerType: 'KNOWLEDGE', ownerCode: 'source'};
for (const scenario of ['local', 'remoteOnly', 'inactive', 'otherPublication']) {
    test('manifest uses canonical DMS owner selection: ' + scenario, async t => {
        const saved = {NODICS: global.NODICS, CONFIG: global.CONFIG, SERVICE: global.SERVICE};
        t.after(() => Object.assign(global, saved));
        let local = 0, remote = 0;
        global.CONFIG = {get: key => key === 'runtimeRole' ? {publication: scenario === 'otherPublication' ? 'STAGED' : 'ONLINE'} :
            key === 'discovery' ? {publication: {targetAuthority: {publication: 'ONLINE', server: null, environment: null}}} : undefined};
        global.NODICS = {isModuleActive: () => scenario !== 'inactive', getServerName: () => 'owner', getSelectedEnvironmentName: () => 'fixture'};
        global.SERVICE = {DefaultDiscoveryGenerationPublicationService: publication, DefaultDiscoveryGenerationOwnerService: owner,
            DefaultDiscoveryGenerationTransportService: transport, DefaultDiscoveryProjectionTransportService: require('../../discoveryProjection/src/service/defaultDiscoveryProjectionTransportService'),
            DefaultRouterService: {getModuleServerConfig: () => ({getOptions: () => ({remoteOnly: scenario === 'remoteOnly'})})},
            DefaultDiscoveryGenerationService: {get: async request => {local++; assert.deepEqual(request.query, publication.scope(scope)); assert.equal(request.searchOptions.pageSize, 2); return {code: 'SUC_DB', result: []};}}};
        SERVICE.DefaultModuleService = {...dms, invokeRemoteModule: async call => {
            remote++; assert.equal(call.apiName, '/internal/generation/read'); assert.equal(call.targetAuthority.publication, 'ONLINE');
            assert.equal(call.requestBody.authData, undefined); assert.equal(call.requestBody.query, undefined);
            return {code: 'SUC_DB', result: []};
        }};
        assert.equal(await publication.read({...scope, authData: {actor: 'source'}}), null);
        assert.equal(local, scenario === 'local' ? 1 : 0); assert.equal(remote, scenario === 'local' ? 0 : 1);
    });
}
test('owner transition denies identity rewriting, stale revisions, protocol downgrade and lost acknowledgement', async t => {
    const saved = {SERVICE: global.SERVICE}; t.after(() => Object.assign(global, saved));
    const row = {...publication.scope(scope), active: true, revision: 1, currentGeneration: null, pendingGeneration: null, obsoleteGenerations: [], publishedObsoleteGenerations: []};
    let writes = 0;
    global.SERVICE = {DefaultDiscoveryGenerationPublicationService: publication,
        DefaultDiscoveryGenerationTransportService: {targetAuthority: () => ({publication: 'ONLINE'})},
        DefaultModuleService: {isLocalModuleActive: () => true, isCurrentRuntimeAuthority: () => true},
        DefaultDiscoveryGenerationService: {get: async () => ({code: 'SUC_DB', result: [row]}), update: async request => {writes++; assert.equal(request.query.revision, 1); return {code: 'SUC_DB', result: {matchedCount: 0}};}}};
    const request = {tenant: 'tenant', authData: {actor: 'service'}, scope: {...scope}, expectedRevision: 1, patch: {revision: 2}};
    delete request.scope.tenant;
    await assert.rejects(owner.advance({...request, patch: {revision: 2, ownerCode: 'forged'}}), /Invalid/);
    await assert.rejects(owner.advance({...request, expectedRevision: 0, patch: {revision: 1}}), /STALE/);
    row.retiredWriters = {'12345678-1234-1234-1234-123456789abc': {version: 1, state: 'IDLE', completed: 0, claim: null}};
    row.obsoleteGenerations = Object.keys(row.retiredWriters);
    await assert.rejects(owner.advance(request), /GUARDED/);
    delete row.retiredWriters; row.obsoleteGenerations = [];
    const result = await owner.advance(request);
    assert.equal(result.result.matchedCount, 0); assert.equal(writes, 1);
    await assert.rejects(controller.read({tenant: 'tenant', authData: {}, body: {tenant: 'foreign'}}), /mismatch/);
});
test('manifest routes expose no generic schema CRUD, arbitrary operation or browser token path', () => {
    const routes = require('../src/router/routers').discoveryPublication.generation;
    assert.deepEqual(Object.keys(routes), ['read', 'initialize', 'advance']);
    for (const route of Object.values(routes)) {
        assert.equal(route.secured, true); assert.deepEqual(route.authTokenTypes, ['service']);
        assert.match(route.permission, /^discovery.generation\./);
    }
    for (const schema of Object.values(require('../src/schemas/schemas').discoveryPublication)) assert.equal(schema.router.enabled, false);
});


test('actorless domain reads cross the authenticated service boundary even when the owner is cohosted', async t => {
    const saved={SERVICE:global.SERVICE,CONFIG:global.CONFIG};t.after(()=>Object.assign(global,saved));
    global.CONFIG={get:key=>key==='discovery'?{publication:{targetAuthority:{publication:'ONLINE'}}}:undefined};
    global.SERVICE={DefaultModuleService:{invokeModule:async call=>{assert.equal(call.local,false);assert.equal(call.request.authData,undefined);assert.equal(call.requestBody.tenant,'tenant');assert.equal(call.apiName,'/internal/generation/read');return {code:'SUC_DB',result:[]};}}};
    await transport.get({tenant:'tenant',query:scope});
});
