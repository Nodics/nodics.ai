/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module nConfig/test/runtimeRoleComposition @owner nConfig @layer test @description Verifies ordinary capability configuration and explicit ownership/publication separation. */
const { test } = require("node:test");
const assert = require("node:assert/strict");
global._ = require("lodash");
const service = require("../src/service/DefaultFrameworkInitializerService");
test("ordinary capability defaults are independent of role names and retired selectors reject", () => {
  assert.doesNotThrow(()=>service.validateCapabilityConfiguration({runtimeRole:{code:"PARTNER",publication:"OPERATIONAL"},feature:{enabled:true}}));
  assert.throws(()=>service.validateCapabilityConfiguration({runtimeRole:{roles:["COMMERCE"]}}),/retired/);
  assert.throws(()=>service.validateCapabilityConfiguration({feature:{runtimeRoleProfiles:{COMMERCE:{enabled:true}}}}),/Retired/);
});

test("functional ownership is unique per publication context", () => {
  const runtime=(server,publication)=>({projectCode:"project",environment:"local",server,runtimeRole:{publication},registrations:[{moduleName:"cms",clientCallable:true,authorityClaims:[],schemaEvidenceComplete:true}]});
  assert.equal(service.validateRuntimeModuleOwnership([runtime("author","STAGED"),runtime("delivery","ONLINE")]),true);
  for(const context of ["STAGED","ONLINE","OPERATIONAL"]) {
    assert.throws(()=>service.validateRuntimeModuleOwnership([runtime("one",context),runtime("two",context)]),/Duplicate module owner/);
  }
});

test("ownership scopes projects and environments, permits replicas and excludes proven source-only modules", () => {
  const entry={projectCode:"one",environment:"local",server:"a",runtimeRole:{publication:"OPERATIONAL"},
    registrations:[{moduleName:"owner",clientCallable:false,authorityClaims:[{kind:"service"}],schemaEvidenceComplete:true}]};
  assert.equal(service.validateRuntimeModuleOwnership([entry,{...entry,projectCode:"two",server:"b"},{...entry,environment:"qa",server:"c"},{...entry}],()=>({metaData:{nodics:{runtime:{ownership:"functional"}}}})),true);
  const source={...entry,registrations:[{moduleName:"plumbing",clientCallable:false,authorityClaims:[],schemaEvidenceComplete:true}]};
  assert.equal(service.validateRuntimeModuleOwnership([source,{...source,server:"b"}]),true);
  assert.throws(()=>service.validateRuntimeModuleOwnership([{...source,registrations:[{...source.registrations[0],schemaEvidenceComplete:false}]}]),/Incomplete/);
});

test("registration evidence uses real callable metadata and materialized claims", () => {
  const agent=require("../../nService/src/service/module/defaultModuleRegistrationAgentService");
  const configured={...agent,getAuthorityContext:(module,schema)=>module+"."+schema};
  const source=configured.buildOwnershipEvidence("nConfig",{metaData:{nodics:{runtime:{router:false}}},rawSchema:{}});
  assert.equal(agent.isOwningRegistration(source),false);
  assert.equal(source.schemaEvidenceComplete,true);
  const owner=configured.buildOwnershipEvidence("foundationOwner",{metaData:{nodics:{runtime:{router:false}}},rawSchema:{entry:{model:true,service:{enabled:true}}}});
  assert.throws(()=>agent.isOwningRegistration(owner),/explicit installed ownership/);
  assert.equal(agent.isOwningRegistration(owner,{metaData:{nodics:{runtime:{ownership:"functional"}}}}),true);
  assert.equal(owner.authorityClaims.length,2);
  assert.equal(configured.buildOwnershipEvidence("unknown",{metaData:{}}).schemaEvidenceComplete,false);
});


test("explicit runtime-local owners retain claims while functional owners remain unique", () => {
  const runtime=(server,scope,moduleName='system')=>({projectCode:'p',environment:'local',server,runtimeRole:{publication:'OPERATIONAL'},
    registrations:[{moduleName,ownershipScope:scope,clientCallable:true,authorityClaims:[{kind:'schema'}],schemaEvidenceComplete:true}]});
  const resolveSource = name => ({metaData:{nodics:{runtime:{ownership:name==='system'?'runtimeLocal':'functional'}}}});
  assert.equal(service.validateRuntimeModuleOwnership([runtime('a','runtimeLocal'),runtime('b','runtimeLocal')],resolveSource),true);
  assert.throws(()=>service.validateRuntimeModuleOwnership([runtime('a','runtimeLocal')]),/differs from installed/);
  assert.throws(()=>service.validateRuntimeModuleOwnership([runtime('a','functional','discovery'),runtime('b','functional','discovery')]),/Duplicate/);
  assert.throws(()=>service.validateRuntimeModuleOwnership([runtime('a','EXEMPT')]),/differs from installed/);
  const agent=require('../../nService/src/service/module/defaultModuleRegistrationAgentService');
  assert.equal(agent.getModuleOwnershipScope('unknown', {metaData:{nodics:{kind:'foundation'}}}), 'functional');
  const coordinates={projectCode:'p',environment:'local',runtimeRole:{publication:'ONLINE'}};
  assert.throws(()=>agent.getModuleOwnershipKey(coordinates,{moduleName:'system'}, {metaData:{nodics:{runtime:{ownership:'runtimeLocal'}}}}),/logical server/);
  assert.equal(agent.isOwningRegistration({clientCallable:true,ownershipScope:'runtimeLocal'}),true);
});

test('offline environment admission independently verifies installed owner scope', t => {
  const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
  const projection=require('../src/service/defaultDeploymentConfigurationProjectionService');
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'nodics-owner-scope-'));
  t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
  const framework=path.join(root,'framework'),project=path.join(root,'project');
  const write=(directory,metadata)=>{fs.mkdirSync(directory,{recursive:true});fs.writeFileSync(path.join(directory,'package.json'),JSON.stringify(metadata));};
  write(framework,{name:'framework',nodics:{kind:'framework'}});
  write(project,{name:'project',nodics:{kind:'application',runtimeModule:true}});
  const owner=path.join(framework,'mechanics');
  write(owner,{name:'mechanics',nodics:{kind:'capability',runtimeModule:true,runtime:{ownership:'runtimeLocal'}}});
  for(const server of ['a','b'])write(path.join(project,'envs','local',server),{name:server,nodics:{kind:'server',runtimeModule:true}});
  const previous=projection.read;
  t.after(()=>{projection.read=previous;});
  projection.read=options=>({ownershipEvidence:{projectCode:'project',environment:'local',server:options.server,runtimeRole:{publication:'OPERATIONAL'},registrations:[{
    moduleName:'mechanics',ownershipScope:'runtimeLocal',clientCallable:true,authorityClaims:[{kind:'schema'}],schemaEvidenceComplete:true,
  }]}});
  const options={projectRoot:project,frameworkRoot:framework,environment:'local'};
  assert.equal(projection.validateEnvironmentOwnership(options).length,2);
  write(owner,{name:'mechanics',nodics:{kind:'capability',runtimeModule:true}});
  assert.throws(()=>projection.validateEnvironmentOwnership(options),/differs from installed source/);
});


test('explicit functional service authority cannot escape uniqueness without HTTP or schemas', () => {
  const agent=require('../../nService/src/service/module/defaultModuleRegistrationAgentService');
  const source={metaData:{nodics:{runtime:{ownership:'functional'}}}};
  const helper={metaData:require('../../../../nodics.discovery/modules/discoveryQuery/package.json')};
  const registration={moduleName:'serviceOnlyOwner',ownershipScope:'functional',clientCallable:false,authorityClaims:[],schemaEvidenceComplete:true};
  assert.equal(agent.isOwningRegistration(registration,source),true);
  const runtime=server=>({projectCode:'p',environment:'local',server,runtimeRole:{publication:'OPERATIONAL'},registrations:[registration]});
  assert.throws(()=>service.validateRuntimeModuleOwnership([runtime('a'),runtime('b')],()=>source),/Duplicate module owner/);
  assert.equal(agent.isOwningRegistration({...registration,moduleName:'discoveryQuery'},helper),false);
  assert.throws(()=>agent.isOwningRegistration({...registration,clientCallable:true},helper),/Source-only helper/);
  assert.throws(()=>agent.isOwningRegistration({...registration,authorityClaims:[{kind:'service'}]},helper),/Source-only helper/);
});
