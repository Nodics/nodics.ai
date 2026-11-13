/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module backoffice/test/backofficeSelectedRuntimeReadiness @description Checks deregistration, foreign identities and recovery against the selected deployment. @layer test @owner backoffice */
const test = require('node:test');
const assert = require('node:assert/strict');
const service = require('../src/service/operations/defaultBackofficeOperationalReadinessService');
const placements = [
  {projectCode:'test', environmentCode:'local', serverCode:'platform', instanceCode:'platform-1', modules:['backoffice']},
  {projectCode:'test', environmentCode:'local', serverCode:'process', instanceCode:'process-1', modules:['workflow']}
];
const platform = {moduleName:'backoffice', environment:'local', server:'platform', instanceId:'platform-1', state:'UP'};
const processOwner = {moduleName:'workflow', environment:'local', server:'process', instanceId:'process-1', state:'UP'};
const approved = {statuses:[{capability:{approvalDiagnostic:{status:'APPROVED'}}}], errors:[]};
const available = {backoffice:{state:'UP'}, workflow:{state:'UP'}};
test('graceful deregistration cannot disappear from readiness or reuse a retained approval as current readiness', () => {
  global.SERVICE = {DefaultDeploymentModuleOwnershipService:{runtimePlacements:()=>structuredClone(placements)}};
  const runtime = service.moduleRuntimeSection({backoffice:[platform]}, {backoffice:{state:'UP'}});
  assert.equal(runtime.businessStatus,'NOT_READY');
  assert.equal(runtime.summary.expectedRuntimeCount,2);
  assert.equal(runtime.summary.missingRuntimeCount,1);
  assert(runtime.blockers.some(item=>item.code==='RUNTIME_SELECTED_OWNER_MISSING' && item.message.includes('process-1')));
  assert.equal(runtime.summary.communicationChecks.find(item=>item.code==='RUNTIME_API_KEY_GRANT_READY').state,'NEEDS_ATTENTION');
  const approval = service.approvalSection(approved,{backoffice:[platform]},{});
  assert.equal(approval.businessStatus,'NOT_READY');
  assert(approval.blockers.some(item=>item.code==='PROCESS_OWNER_UNAVAILABLE'));
});
test('an unselected instance or another environment cannot satisfy the missing owner',()=>{
  for (const substitute of [{...processOwner,instanceId:'other-process'}, {...processOwner,environment:'foreign'}]) {
    const modules={backoffice:[platform],workflow:[substitute]};
    assert.equal(service.moduleRuntimeSection(modules,available).businessStatus,'NOT_READY');
    assert.equal(service.approvalSection(approved,modules,available).businessStatus,'NOT_READY');
  }
});
test('restored selected owner clears the dependency without altering the retained approval',()=>{
  const modules={backoffice:[platform],workflow:[processOwner]};
  assert.equal(service.moduleRuntimeSection(modules,available).businessStatus,'READY');
  assert.equal(service.approvalSection(approved,modules,available).businessStatus,'READY');
  assert.equal(approved.statuses[0].capability.approvalDiagnostic.status,'APPROVED');
  assert.equal(service.approvalSection(approved,modules,{workflow:{state:'DOWN'}}).businessStatus,'NOT_READY');
});
test('unavailable deployment graph cannot certify observed runtimes',()=>{
  global.SERVICE.DefaultDeploymentModuleOwnershipService.runtimePlacements=()=>{throw new Error('graph unavailable')};
  const result=service.moduleRuntimeSection({backoffice:[platform],workflow:[processOwner]},available);
  assert.equal(result.businessStatus,'NOT_READY');
  assert(result.blockers.some(item=>item.code==='RUNTIME_TOPOLOGY_UNAVAILABLE'));
});
