/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module commerce/test/commerceSchemaApiContract @description Verifies selective owner APIs and source authoring boundaries. @layer test @owner commerce */
'use strict';
const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const foundation = '../../nodics.foundation/modules/';
const policy = require(foundation + 'nDatabase/database/src/service/schema/defaultSchemaAuthoringPolicyService');
const utility = require(foundation + 'nDatabase/database/src/service/schema/defaultSchemaUtilityService');
const security = require(foundation + 'nRouter/src/service/request/defaultSecuredRequestPipelineService');
const defaults = require(foundation + 'nDatabase/database/config/properties').schemaApi;
const cases = [['product','product'], ['pricing','priceRow']].map(([owner, name]) => ({owner, name,
  routes: require(foundation + 'nRouter/src/router/routers').default.schemaOperations,
  schema: require('../modules/baseCommerce/modules/' + owner + '/src/schemas/schemas')[owner][name]}));
let stage, config, writes;
beforeEach(() => {
  stage = 'STAGED'; writes = [];
  config = { schemaApi: defaults, routeActionAuthorization: { enabled: true, strict: true, groupPermissions: {} },
    identityGovernance: {}, accessPoints: {readAccessPoint: 1, writeAccessPoint: 2, removeAccessPoint: 3} };
  global.CONFIG = {get: key => key === 'runtimeRole' ? {publication: stage} : config[key]};
  global._ = require('lodash');
  global.UTILS = {isBlank: value => value === undefined || value === null,
    createModelName: name => name + 'Model'};
  global.CLASSES = {NodicsError: class extends Error {constructor(code, message) {super(message); this.code = code;}}};
  global.NODICS = {isModuleActive: () => true,
    getModule: owner => ({rawSchema: Object.fromEntries(cases.filter(c => c.owner === owner).map(c => [c.name, c.schema]))})};
  global.SERVICE = {DefaultSchemaAuthoringPolicyService: policy, DefaultSchemaUtilityService: utility};
});
function controllerFor(entry) {
  const filename = path.resolve(__dirname, foundation + 'nController/src/controller/common.js');
  let source = fs.readFileSync(filename, 'utf8');
  for (const [key,value] of Object.entries({mdulnm: entry.owner, schmanm: entry.name,
    mdlnm: entry.name+'Model', dsdName: 'OwnerFacade', srvcName: 'OwnerService'})) source = source.replaceAll(key,value);
  const compiled = new Module(filename, module); compiled.paths = module.paths; compiled._compile(source,filename);
  global.FACADE = {OwnerFacade: {save: async request => {writes.push(request); return request.model;},
    update: async request => {writes.push(request); return {models: [request.model]};}}};
  return compiled.exports;
}
for (const entry of cases) {
  test(entry.owner + ' uses the shared selective schema group with canonical permission gates', () => {
    assert.equal(entry.schema.router.enabled, true);
    assert.deepEqual(entry.schema.router.groups, { schemaOperations: true });
    assert.deepEqual(entry.schema.backoffice.operations, ['search','read','create','update']);
    for (const [name, route] of Object.entries(entry.routes)) {
      const expected = ['capabilities','safeSearch','deleteImpact'].includes(name) ? 'system.schema.view' : 'system.schema.manage';
      assert.equal(route.controller, 'DefaultctrlName');
      assert.equal(route.secured, true); assert.deepEqual(route.accessGroups, ['userGroup']);
      assert.equal(route.apiExposure, 'schemaApi');
      assert.deepEqual(security.getRoutePermissions(route), [expected]);
      assert.equal(security.hasRoutePermission({router: route, authData: {permissions: []}}), false);
      assert.equal(security.hasRoutePermission({router: route, authData: {permissions: [expected]}}), true);
    }
    config.schemaApi = {...defaults, readPermission: 'owner.read', writePermission: 'owner.write'};
    assert.equal(security.hasRoutePermission({router: entry.routes.save, authData: {permissions: ['system.schema.manage']}}), false);
    assert.equal(security.hasRoutePermission({router: entry.routes.save, authData: {permissions: ['owner.write']}}), true);
  });
  test(entry.owner + ' generated controllers reject non-Staged writes and keep trusted tenant and enterprise context', async () => {
    const controller = controllerFor(entry);
    const request = () => ({moduleName: entry.owner, tenant: 'tenant-one', enterpriseCode: 'enterprise-one',
      authData: {userGroups: ['adminGroup']}, httpRequest: {headers: {}, params: {},
        body: {code: 'ONE', tenant: 'forged', enterpriseCode: 'forged', unknownInput: true}}});
    await controller.save(request());
    assert.equal(writes.length, 1);
    assert.equal(writes[0].model.tenant, 'tenant-one');
    assert.equal(writes[0].model.enterpriseCode, 'enterprise-one');
    assert.equal(writes[0].model.unknownInput, undefined);
    for (const publication of ['ONLINE','OPERATIONAL','UNASSIGNED']) {
      stage = publication;
      await assert.rejects(Promise.resolve().then(() => controller.save(request())), /Staged/);
      await assert.rejects(Promise.resolve().then(() => controller.update(request())), /Staged/);
    }
    assert.equal(writes.length, 1);
    stage = 'STAGED';
    assert.throws(() => policy.assertMutationAllowed(entry.owner,entry.name,'delete'), /does not allow/);
  });
}
