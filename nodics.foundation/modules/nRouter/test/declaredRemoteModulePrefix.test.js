/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module nRouter/test/declaredRemoteModulePrefix @description Exercises canonical inactive remote source metadata through static ModuleService routing with no registry or network. @owner nRouter @layer test */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const utils=require('../../nConfig/src/utils/utils');
const routerDefinition=require('../src/service/router/defaultRouterService');
const moduleDefinition=require('../../nService/src/service/module/defaultModuleService');

test('declared inactive remote prefix uses canonical source discovery without activation, registry or configuration execution',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'nodics-remote-prefix-'));
 const saved=Object.fromEntries(['NODICS','CONFIG','UTILS','SERVICE'].map(k=>[k,global[k]]));
 const write=(dir,name,kind,extra={})=>{const p=path.join(root,dir);fs.mkdirSync(p,{recursive:true});fs.writeFileSync(path.join(p,'package.json'),JSON.stringify({name,index:'1.0',nodics:{kind,runtimeModule:kind!=='framework',...extra.nodics},...Object.fromEntries(Object.entries(extra).filter(([k])=>k!=='nodics'))}));return p};
 try{
  write('framework','fixtureFramework','framework');const foundation=write('framework/foundation','fixtureFoundation','group');
  const remote=write('framework/remote','remoteWorkflow','capability',{prefix:'process'});
  const project=write('project','fixtureProject','application');
  fs.mkdirSync(path.join(remote,'config'));fs.writeFileSync(path.join(remote,'config/properties.js'),'throw new Error("Must not load inactive configuration")');
  global.NODICS={getRawModule:()=>undefined,getNodicsHome:()=>foundation,getCustomHome:()=>project,addRawModules:()=>assert.fail('must not register source'),getInternalAuthToken:()=> 'test-only-token'};
  const identity={remoteModules:['remoteWorkflow']};
  global.CONFIG={get:k=>k==='runtimeIdentity'?identity:undefined,set:()=>assert.fail('must not mutate configuration')};
  global.UTILS=utils;
  const router={...routerDefinition,LOG:{debug(){},error(){}}};
  router.getModuleServerConfig=()=>({getOptions:()=>({contextRoot:'nodics'}),getAbstractEndpoint:()=>({getHttpHost:()=> 'process.test',getHttpPort:()=>4330})});
  global.SERVICE={DefaultRouterService:router};
  const transport={...moduleDefinition,LOG:{debug(){}}};
  const call={moduleName:'remoteWorkflow',connectionName:'remoteWorkflow',methodName:'POST',apiName:'/instances/original/actions/claim'};
  assert.equal(transport.buildRequest(call).uri,'http://process.test:4330/nodics/process/v0/instances/original/actions/claim');
  assert.equal(require.cache[path.join(remote,'config/properties.js')],undefined);
  assert.equal(NODICS.getRawModule('remoteWorkflow'),undefined);
  identity.remoteModules.push('missingRemote');
  assert.throws(()=>router.prepareUrl({moduleName:'missingRemote'}),/Missing installed source owner/);
  // Only selected remote identities trigger installed-source lookup.
  assert.equal(router.prepareUrl({moduleName:'unselected'}),'http://process.test:4330/nodics/unselected');
  write('project/modules/duplicate','remoteWorkflow','capability',{prefix:'other'});
  assert.throws(()=>transport.buildRequest(call),/Duplicate runtime module name|Ambiguous installed source owner/);
 }finally{Object.assign(global,saved);fs.rmSync(root,{recursive:true,force:true})}
});
