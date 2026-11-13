/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module discoveryConfig/test/discoveryReadExposure @description Verifies fixed read route scope, tenant binding and nonowner denial without live grants. @layer test @owner discoveryConfig */
const test=require('node:test');const assert=require('node:assert/strict');
const routes=require('../src/router/routers').discoveryConfig.configurationRead;
const schemas=require('../src/schemas/schemas').discoveryConfig;
const owner=require('../src/service/defaultDiscoveryConfigurationReadService');
const controller=require('../src/controller/defaultDiscoveryConfigurationReadController');
const guard=require('../../../../nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService');
test('only two fixed service-token read routes are exposed; generated CRUD stays disabled',()=>{
 assert.equal(Object.keys(routes).length,2);
 for(const schema of Object.values(schemas))assert.equal(schema.router.enabled,false);
 for(const route of Object.values(routes)){
  assert.equal(route.secured,true);assert.deepEqual(route.authTokenTypes,['service']);
  assert.equal(route.permission,'discovery.config.read');assert.equal(route.cache.enabled,false);
 }
});
test('real route admission requires exact module and permission even with privileged groups',t=>{
 const previous={CONFIG:global.CONFIG,UTILS:global.UTILS,CLASSES:global.CLASSES};t.after(()=>Object.assign(global,previous));
 global.CLASSES={NodicsError:class extends Error{constructor(code,message){super(message||code);}}};
 global.UTILS={getUserGroupPermissions:()=>['*'],getUserGroupCodes:groups=>groups};
 global.CONFIG={get:key=>key==='authSecurity'?require('../../../../nodics.foundation/modules/nAuth/config/properties').authSecurity:undefined};
 const service={...guard,getRouteActionAuthorizationConfig:()=>({enabled:true,strict:true}),getGroupPermissions:()=>['*']};
 const auth={tokenType:'service',modules:['discoveryConfig'],permissions:['discovery.config.read'],runtimeScope:{assignmentCode:'existing'},userGroups:['adminGroup']};
 const admit=authData=>{let result;service.checkAccess({moduleName:'discoveryConfig',router:routes.readIndex,authData},{},{nextSuccess:()=>result=true,error:(_a,_b,error)=>result=error});return result;};
 assert.equal(admit(auth),true);assert.notEqual(admit({...auth,permissions:[]}),true);
 assert.notEqual(admit({...auth,modules:['other']}),true);assert.notEqual(admit({...auth,tokenType:'access'}),true);
});
test('owner read fixes tenant/current/limit and rejects foreign tenant, arbitrary query and remoteOnly execution',async t=>{
 const previous={CONFIG:global.CONFIG,SERVICE:global.SERVICE};t.after(()=>Object.assign(global,previous));
 let local=true,calls=0;const actor={tokenType:'service'};
 global.CONFIG={get:()=>({config:{targetAuthority:{publication:'OPERATIONAL'}}})};
 global.SERVICE={DefaultModuleService:{isLocalModuleActive:()=>local,isCurrentRuntimeAuthority:()=>true},
  DefaultDiscoveryConfigurationReadService:owner,DefaultDiscoveryIndexConfigurationService:{get:async request=>{calls++;assert.deepEqual(request.query,{tenant:'a',status:'CURRENT',code:'chosen'});assert.equal(request.pageSize,1);assert.equal(request.authData,actor);return [];}}};
 await controller.readIndex({tenant:'a',authData:actor,body:{tenant:'a',query:{code:'chosen'},authData:{permissions:['*']},pageSize:999}});
 await assert.rejects(controller.readIndex({tenant:'a',authData:actor,body:{tenant:'b'}}),/tenant mismatch/);
 await assert.rejects(owner.readIndex({tenant:'a',authData:actor,query:{tenant:'b'}}),/tenant mismatch/);
 await assert.rejects(owner.readIndex({tenant:'a',authData:actor,query:{$where:'arbitrary'}}),/Invalid/);
 local=false;await assert.rejects(owner.readIndex({tenant:'a',authData:actor}),/owner is unavailable/);
 assert.equal(calls,1);
});
