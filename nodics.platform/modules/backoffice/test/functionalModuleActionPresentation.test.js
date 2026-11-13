/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module backoffice/test/functionalModuleActionPresentation @description Uses the real router permission evaluator to check actor-bound action projection, not execution authority. @owner backoffice @layer test */
const test = require('node:test');
const assert = require('node:assert/strict');
const source = require('../src/service/registry/defaultFunctionalModuleCatalogueService');
const securedSource = require('../../../../nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService');
const routers = require('../src/router/routers').backoffice.registryDiscovery;
const clone = value => structuredClone(value);
function request(permissions, groups = ['employeeUserGroup']) {
  return { tenant: 'default', authData: { principalType: 'human', tokenType: 'access', authenticationMethod: 'PASSWORD', tenant: 'default', entCode: 'default', permissions, userGroups: groups } };
}
function fixture() {
  global.CONFIG = { get: key => ({ routeActionAuthorization: { enabled: true, strict: true }, defaultTenant: 'default', defaultEnterprise: 'default', identityGovernance: { principalPolicy: { serviceGroup: 'serviceAccountUserGroup' } } })[key] };
  global.SERVICE = { DefaultSecuredRequestPipelineService: { ...securedSource } };
  return { ...source };
}
test('registry viewers see no mutation actions; original request and canonical routers are unchanged', () => {
  const service = fixture(), original = request(['backoffice.registry.view']), before = clone(original), routeBefore = clone(routers.activateFunctionalModule);
  assert.deepEqual(service.clientActions(original), []);
  assert.deepEqual(original, before);
  assert.deepEqual(routers.activateFunctionalModule, routeBefore);
});
test('each action follows its exact canonical route permission; sample installation uses Import authority', () => {
  const service = fixture();
  for (const [action, operation] of Object.entries({ register: 'registerFunctionalModule', activate: 'activateFunctionalModule', rollback: 'rollbackFunctionalModule', deactivate: 'deactivateFunctionalModule', deregister: 'deregisterFunctionalModule' }))
    assert.deepEqual(service.clientActions(request([routers[operation].permission])), [action]);
  const sample = require('../../../../nodics.foundation/modules/nData/nImport/import/src/router/routers').import.dataReleases.executeSample;
  assert.deepEqual(service.clientActions(request([sample.permission])), ['installSampleData']);
  assert.deepEqual(service.clientActions(request(['import.run'])), []);
});
test('native Platform full access projects actions; claimed enterprise wildcards and service contexts cannot impersonate it', () => {
  const service = fixture();
  assert.equal(service.clientActions(request(['*'], ['platformAdministratorUserGroup'])).length, 6);
  assert.deepEqual(service.clientActions(request(['*'], ['adminGroup'])), []);
  assert.deepEqual(service.clientActions({ authData: { principalType: 'service', tokenType: 'service', permissions: ['*'] } }), []);
});
test('missing original auth or unavailable permission evaluator is read-only', () => {
  const service = fixture();
  assert.deepEqual(service.clientActions({ body: { authData: request(['*']).authData } }), []);
  global.SERVICE = {};
  assert.deepEqual(service.clientActions(request(['backoffice.functionalModule.activate'])), []);
});
test('client-safe list enrichment includes the original actor permission projection without persisting it', async () => {
  const service = fixture(), record = { projectCode: 'example', functionalModule: 'nodics.example' };
  service.getActivationReceiptMap = async () => ({});
  service.getFunctionalDependencyStates = async () => ({});
  service.projectClientSafe = value => ({ project: value.projectCode, functionalModule: value.functionalModule });
  const result = await service.projectClientSafeWithReceipts(record, {}, request(['backoffice.functionalModule.activate']));
  assert.deepEqual(result.allowedActions, ['activate']);
  assert.equal(record.allowedActions, undefined);
});
