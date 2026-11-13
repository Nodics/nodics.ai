/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @file Unchanged catalogue heartbeats must not rewrite source metadata or erase another runtime's observations. */
const test = require('node:test'), assert = require('node:assert/strict');
const definition = require('../src/service/registry/defaultFunctionalModuleCatalogueService');
function setup(t) {
  const previous = ['CONFIG','SERVICE','CLASSES'].map(key=>[key,global[key]]);
  t.after(()=>previous.forEach(([key,value])=>value===undefined ? delete global[key] : global[key]=value));
  global.CONFIG={get:key=>key==='defaultTenant' ? 'default' : key==='moduleIdentityAliases' ? {} : undefined};
  global.SERVICE={};global.CLASSES={NodicsError:class extends Error {}};
  const observation={projectCode:'project',functionalModule:'nodics.wcms',displayName:'WCMS',registeredVersion:'0.0.1',moduleIndex:'80',required:true,
    technicalModules:['cms'],activationDataPackages:[{code:'cms:core',owner:'cms',classification:'core',required:true,targetModule:'cms',trigger:'ACTIVATION',operation:'IMPORT',dataType:'core'}],
    observedServer:'local:staged:node0'};
  const f={row:undefined,writes:[],readCount:0};
  const service=Object.assign({},definition,{
    getRecord:async()=>{f.readCount++;return f.row && structuredClone(f.row);},
    saveRecord:async r=>{f.row=structuredClone(r.model);return {result:[f.row]};},
    updateRecord:async r=>{f.writes.push(r);Object.assign(f.row,r.model);return {result:{matchedCount:1,modifiedCount:1}};},
  });
  return {...f,service,observation,state:f};
}
test('an unchanged renewal persists only its heartbeat under the original decision revision',async t=>{
  const f=setup(t),request={tenant:'default',authData:{principalId:'runtime'}};
  const first=await f.service.reconcileObservation(f.observation,request);
  const renewed=await f.service.reconcileObservation(f.observation,request);
  const write=f.state.writes[0];
  assert.deepEqual(Object.keys(write.model),['lastObservedAt']);
  assert.deepEqual(write.query,{code:first.code,catalogueRevision:first.catalogueRevision});
  assert.equal(f.state.readCount,2,'each observation still reads its current canonical owner');
  assert.equal(renewed.catalogueRevision,first.catalogueRevision);
  assert.deepEqual(renewed.activationDataPackages,first.activationDataPackages);
  assert.equal(renewed.enabled,true);
});
test('a stale unchanged renewal cannot erase membership added by a concurrent runtime',async t=>{
  const f=setup(t),request={tenant:'default',authData:{principalId:'runtime'}};
  await f.service.reconcileObservation(f.observation,request);
  f.service.updateRecord=async r=>{
    f.state.row.observedServers.push('local:online:node0');
    f.state.row.technicalModules.push('editorial');
    Object.assign(f.state.row,r.model);
    return {result:{matchedCount:1,modifiedCount:1}};
  };
  await f.service.reconcileObservation(f.observation,request);
  assert(f.state.row.observedServers.includes('local:online:node0'));
  assert(f.state.row.technicalModules.includes('editorial'));
});
test('changed owner metadata retains normal full reconciliation and decision-revision behavior',async t=>{
  const f=setup(t),request={tenant:'default',authData:{principalId:'runtime'}};
  await f.service.reconcileObservation(f.observation,request);
  const changed=await f.service.reconcileObservation({...f.observation,registeredVersion:'0.0.2',displayName:'Updated WCMS'},request);
  assert.equal(f.state.writes[0].model.registeredVersion,'0.0.2');
  assert.equal(changed.catalogueRevision,2);
  assert.equal(changed.displayName,'Updated WCMS');
});
test('an administrator revision race forces a fresh read and preserves the newer disabled decision',async t=>{
  const f=setup(t),request={tenant:'default',authData:{principalId:'runtime'}};
  const optional={...f.observation,required:false};
  await f.service.reconcileObservation(optional,request);
  f.state.row.registrationState='REGISTERED';f.state.row.enabled=true;
  let first=true;
  f.service.updateRecord=async r=>{
    f.state.writes.push(r);
    if(first) {
      first=false;f.state.row.catalogueRevision=2;f.state.row.enabled=false;
      return {result:{matchedCount:0,modifiedCount:0}};
    }
    assert.equal(r.query.catalogueRevision,2);
    Object.assign(f.state.row,r.model);return {result:{matchedCount:1,modifiedCount:1}};
  };
  const renewed=await f.service.reconcileObservation(optional,request);
  assert.equal(renewed.enabled,false);assert.equal(renewed.catalogueRevision,2);
  assert.equal(f.state.readCount,3);
  assert.deepEqual(Object.keys(f.state.writes[1].model),['lastObservedAt']);
});
