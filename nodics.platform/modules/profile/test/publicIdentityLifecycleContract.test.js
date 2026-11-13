/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module profile/test/publicIdentityLifecycleContract
 * @description Verifies bounded public lifecycle guards, domain-owned compare tokens, protected actors and native-only deactivation preflight with isolated owner ports.
 * @layer test @owner profile
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const definition = require('../src/service/enterprise/defaultEnterpriseManagementService');
const teamDefinition = require('../src/service/enterprise/defaultEnterpriseTeamAdministrationService');
function fixture(t, kind = 'employee') {
  const saved = Object.fromEntries(['CONFIG','SERVICE','CLASSES'].map(k => [k,global[k]]));
  t.after(() => { for (const [k,v] of Object.entries(saved)) { if(v===undefined) delete global[k]; else global[k]=v; } });
  const policy = { employeeFields: ['name','description','active','addresses','contacts'], enterpriseFields: ['name','description','active','addresses','contacts'], maximumPrincipals: 4, maximumGroups: 8 };
  const protection = { maximumRecords: 8, nativeSuperAdministratorGroupCodes: ['full-admin'], superAdministratorRoleCodes: ['FULL'] };
  global.CONFIG = { get: k => ({ defaultTenant:'authority',defaultEnterprise:'platform',enterpriseManagement:{ lifecycle:policy,teamAdministration:{genericMutationGuard:protection} } })[k] };
  global.CLASSES = { NodicsError: class extends Error { constructor(code,message){super(message||code);this.code=code;} } };
  const person={code:'staff',_id:'staff-id',loginId:'staff@example.test',principalType:'human',active:true,authVersion:4,userGroups:['editor'],name:{firstName:'Before'}};
  const enterprise={code:'BUSINESS',active:true,tenant:'business-tenant',updated:new Date('2026-11-06T00:00:00Z'),name:'Business'};
  const groups={ editor:{code:'editor',active:true,parentGroups:[]},'full-admin':{code:'full-admin',active:true,parentGroups:[]}, inherited:{code:'inherited',active:true,parentGroups:['full-admin']} };
  const effects=[]; let enterprises=[enterprise], customers=[]; let drift;
  const ok=rows=>({code:'SUC_DBS_00000',result:rows,count:rows.length});
  const actor={principalType:'human',tokenType:'access',authenticationMethod:'PASSWORD',tenant:kind==='enterprise'?'authority':'business-tenant',entCode:kind==='enterprise'?'platform':'BUSINESS',loginId:'admin@example.test',authVersion:9,userGroups:['adminGroup']};
  const request={tenant:actor.tenant,authData:actor,httpRequest:{method:'PATCH',body:{}},query:kind==='employee'?{code:'staff',authVersion:4}:{code:'BUSINESS',updated:enterprise.updated.toISOString()},model:kind==='employee'?{name:{firstName:'After'}}:{description:'Lifecycle review'},options:{}};
  const store=(rows,name)=>({ get:async r=>{const result=typeof rows==='function'?rows():rows; if(drift)drift(name,r);return ok(result.filter(x=>!r.query?.code||x.code===r.query.code));},update:async r=>{effects.push({name,tenant:r.tenant,query:r.query,model:r.model,authData:r.authData});return {code:'SUC_DBS_00000',result:{acknowledged:true,matchedCount:1,modifiedCount:1}};} });
  global.SERVICE={ DefaultIdentityGovernanceService:{getSystemAuthData:()=>({isSystem:true})},DefaultEmployeeService:store([person],'employee'),DefaultCustomerService:store(()=>customers,'customer'),DefaultEnterpriseService:store(()=>enterprises,'enterprise'),DefaultEnterpriseMembershipService:{verifyAuthenticatedActor:async()=>({person:{loginId:request.authData.loginId}}),permission:()=>true,read:async(name,tenant,q)=>name==='DefaultEmployeeService'?person:customers.find(x=>x.code===q.code)},DefaultIdentityCatalogueService:{roles:async()=>({FULL:{groupCodes:['full-admin']}})}};
  SERVICE.DefaultEnterpriseTeamAdministrationService={...teamDefinition,genericAdministratorRows:async(name,tenant,q)=>Object.values(groups).filter(x=>x.code===q.code)};
  const owner={...definition};SERVICE.DefaultEnterpriseManagementService=owner;SERVICE.DefaultEmployeeGetInterceptorService={restrictEnterpriseRead:async read=>{assert.equal(read.httpRequest,request.httpRequest);assert.equal(read.authData.entCode,request.authData.entCode);}};
  return {owner,request,person,enterprise,effects,policy,protection,setEnterprises:v=>enterprises=v,setCustomers:v=>customers=v,setDrift:v=>drift=v};
}
test('public employee edits use the original stamp and authenticated actor, with no command replay',async t=>{
 const f=fixture(t);await f.owner.prepareLifecycleUpdate(f.request,'employee');assert.equal(f.request.model.updatedBy,'admin@example.test');assert.deepEqual(f.request.model.name,{firstName:'After'});assert.match(JSON.stringify(f.request.query),/authVersion/);assert.equal(f.effects.length,0);
});
test('private owner writes keep their existing guards and are not reclassified as browser commands',async t=>{
 const f=fixture(t);delete f.request.httpRequest;f.request.model={userGroups:['custom']};await f.owner.prepareLifecycleUpdate(f.request,'employee');assert.deepEqual(f.request.model,{userGroups:['custom']});assert.equal(f.effects.length,0);
});
for(const patch of [{authVersion:1},{principalType:'service'},{userGroups:['full-admin']},{loginId:'another@example.test'},{updatedBy:'forged'},{code:'another'}])test('public employee refuses protected input '+Object.keys(patch)[0],async t=>{
 const f=fixture(t);f.request.model=patch;await assert.rejects(()=>f.owner.prepareLifecycleUpdate(f.request,'employee'));assert.equal(f.effects.length,0);
});
test('stale employee stamp is a conflict before persistence',async t=>{
 const f=fixture(t);f.request.query.authVersion=3;await assert.rejects(()=>f.owner.prepareLifecycleUpdate(f.request,'employee'),{code:'ERR_CONCURRENCY_00001'});assert.equal(f.effects.length,0);
});
for(const group of ['full-admin','inherited'])test('native administrator status requires its lifecycle owner: '+group,async t=>{
 const f=fixture(t);f.person.userGroups=[group];f.request.model={active:false};await assert.rejects(()=>f.owner.prepareLifecycleUpdate(f.request,'employee'));assert.equal(f.effects.length,0);
});
test('self-disable is refused without changing authority',async t=>{
 const f=fixture(t);f.request.authData.loginId=f.person.loginId;f.request.model={active:false};await assert.rejects(()=>f.owner.prepareLifecycleUpdate(f.request,'employee'));assert.equal(f.effects.length,0);
});
test('enterprise display edit retains original actor and timestamp comparison',async t=>{
 const f=fixture(t,'enterprise');await f.owner.prepareLifecycleUpdate(f.request,'enterprise');assert.equal(f.request.model.updatedBy,'admin@example.test');assert.match(JSON.stringify(f.request.query),/updated/);assert.equal(f.effects.length,0);
});
test('exclusive native enterprise deactivation invalidates principal sessions through generated owners first',async t=>{
 const f=fixture(t,'enterprise');f.request.model={active:false};await f.owner.prepareLifecycleUpdate(f.request,'enterprise');assert.equal(f.effects.length,1);assert.equal(f.effects[0].name,'employee');assert.equal(f.effects[0].tenant,'business-tenant');assert.equal(f.effects[0].authData.isSystem,true);assert.deepEqual(Object.keys(f.effects[0].model),['authVersion']);assert.equal(f.person.active,true);
});
for(const mode of ['shared','default','linked','overflow','actor drift'])test('deactivation refuses '+mode+' before all session effects',async t=>{
 const f=fixture(t,'enterprise');f.request.model={active:false};
 if(mode==='shared')f.setEnterprises([f.enterprise,{...f.enterprise,code:'OTHER'}]);
 if(mode==='default')f.enterprise.tenant='authority';
 if(mode==='linked')f.person.authenticationIdentity={tenantCode:'elsewhere',recordKind:'EMPLOYEE',recordId:'anchor'};
 if(mode==='overflow')f.policy.maximumPrincipals=0;
 if(mode==='actor drift')f.setDrift(name=>{if(name==='customer')f.request.authData.loginId='replaced-actor';});
 await assert.rejects(()=>f.owner.prepareLifecycleUpdate(f.request,'enterprise'));assert.equal(f.effects.length,0);
});
test('schema declares owner counters and makes security stamps noneditable',t=>{
 const old=global.ENUMS; t.after(()=>{if(old===undefined)delete global.ENUMS;else global.ENUMS=old;}); global.ENUMS={ContactType:Object.fromEntries(['EMAIL','PHONE','FAX','PAGER'].map(key=>[key,{key}]))};
 const s=require('../src/schemas/schemas').profile;assert.equal(s.user.definition.authVersion.readOnly,true);assert.equal(s.employee.backoffice.concurrency.field,'authVersion');assert.equal(s.enterprise.backoffice.concurrency.field,'updated');assert.equal(s.employee.commandReceipt.journalSchema,'profileCommandReceipt');
});

test('ordinary employee status remains an explicit supported edit',async t=>{ const f=fixture(t);f.request.model={active:false};await f.owner.prepareLifecycleUpdate(f.request,'employee');assert.equal(f.request.model.active,false);assert.equal(f.effects.length,0); });
test('provider failure is redacted and cannot start session retirement',async t=>{ const f=fixture(t,'enterprise');f.request.model={active:false};f.setDrift(name=>{if(name==='customer')throw new Error('private-provider-sentinel');});await assert.rejects(()=>f.owner.prepareLifecycleUpdate(f.request,'enterprise'),error=>!error.message.includes('private-provider-sentinel'));assert.equal(f.effects.length,0); });

test('foreign enterprise display changes require Platform context',async t=>{const f=fixture(t,'enterprise');f.request.authData.entCode='OTHER';await assert.rejects(()=>f.owner.prepareLifecycleUpdate(f.request,'enterprise'));assert.equal(f.effects.length,0);});
test('external and linked proof cannot use native lifecycle editing',async t=>{const f=fixture(t);f.request.authData.authenticationMethod='EXTERNAL';await assert.rejects(()=>f.owner.prepareLifecycleUpdate(f.request,'employee'));assert.equal(f.effects.length,0);});
test('public identity records retain creation and removal with their named owners',t=>{const f=fixture(t);const hooks=require('../src/service/interceptors/defaultEmployeeUpdateInterceptorService');f.request.httpRequest.method='PUT';assert.throws(()=>hooks.guardPublicCreation(f.request),{code:'ERR_AUTH_00003'});f.request.httpRequest.method='DELETE';assert.throws(()=>hooks.guardPublicRemoval(f.request),{code:'ERR_AUTH_00003'});delete f.request.httpRequest;assert.equal(hooks.guardPublicCreation(f.request),true);assert.equal(hooks.guardPublicRemoval(f.request),true);});

test("typed dependency errors cannot disclose provider details",async t=>{const f=fixture(t,"enterprise");f.request.model={active:false};f.setDrift(name=>{if(name==="customer")throw new CLASSES.NodicsError("ERR_DBS_00001","private-typed-provider-sentinel");});await assert.rejects(()=>f.owner.prepareLifecycleUpdate(f.request,"enterprise"),error=>!error.message.includes("private-typed-provider-sentinel"));assert.equal(f.effects.length,0);});

test("configuration cannot turn security or placement fields into ordinary lifecycle fields",async t=>{const f=fixture(t);for(const field of ["userGroups","tenant","authVersion","authenticationIdentity","contacts.private"]){f.policy.employeeFields=["name",field];await assert.rejects(()=>f.owner.prepareLifecycleUpdate(f.request,"employee"));}assert.equal(f.effects.length,0);});

test("native email-shaped employee identities can edit ordinary fields",async t=>{const f=fixture(t);f.person.code="activation.operator@circa.local";f.request.query.code=f.person.code;await f.owner.prepareLifecycleUpdate(f.request,"employee");assert.equal(f.request.query.code,f.person.code);assert.equal(f.effects.length,0);});

test("Enterprise removal retains history independently of optional membership policy",t=>{const f=fixture(t,"enterprise");const hooks=require("../src/service/interceptors/defaultEnterpriseUpdateInterceptorService");f.request.httpRequest.method="DELETE";assert.throws(()=>hooks.guardPublicRemoval(f.request),{code:"ERR_AUTH_00003"});delete f.request.httpRequest;assert.equal(hooks.guardPublicRemoval(f.request),true);});

test("public lifecycle admission precedes the existing historical selector fence",t=>{const old=global.CONFIG;global.CONFIG=global.CONFIG||{get:()=>({})};t.after(()=>{if(old===undefined)delete global.CONFIG;else global.CONFIG=old;});const hooks=require("../src/interceptors/interceptors");assert(hooks.publicEmployeeLifecycleUpdate.index < hooks.protectHistoricalLink_employee_preUpdate.index);assert(hooks.publicEnterpriseLifecycleUpdate.index < hooks.enterpriseSetupContinuation_preUpdate.index);});

test("native lifecycle and historical retirement fences compose before persistence",async t=>{const f=fixture(t);f.request.schemaModel={schemaName:"employee"};await f.owner.prepareLifecycleUpdate(f.request,"employee");const historical={...require("../src/service/identity/defaultCanonicalHistoricalIdentityLinkService"),ownsWrite:()=>false,containsEvidence:()=>false,member:()=>({mutationLookup:r=>r.query})};SERVICE.DefaultPrincipalSecurityStampGovernanceService={inventory:async()=>[f.person]};await historical.protectMutation(f.request);assert.equal(f.request.query.$and[0].code,f.person.code);assert.equal(f.request.query.$and[0].authVersion,4);assert.deepEqual(f.request.query.$and[1],{identityLinkRetirement:{$exists:false}});assert.equal(f.effects.length,0);});
test("a public Employee lifecycle cannot silently lose its existing enterprise read scope",async t=>{const f=fixture(t);delete SERVICE.DefaultEmployeeGetInterceptorService;await assert.rejects(()=>f.owner.prepareLifecycleUpdate(f.request,"employee"));assert.equal(f.effects.length,0);});

test("fresh lifecycle validation composes the actual signed Enterprise Employee read owner",async t=>{const f=fixture(t);const readOwner=require("../src/service/interceptors/defaultEmployeeGetInterceptorService");SERVICE.DefaultEmployeeGetInterceptorService={...readOwner};SERVICE.DefaultSecuredRequestPipelineService={hasPlatformFullAccess:()=>false};SERVICE.DefaultEnterpriseBusinessAccessService={rows:async()=>[]};SERVICE.DefaultEnterpriseMembershipService.authority=()=>"authority";let scoped=false;SERVICE.DefaultEmployeeService.get=async read=>{assert.equal(read.httpRequest,f.request.httpRequest);assert.equal(read.query.$and[0].code,f.person.code);assert(JSON.stringify(read.query.$and[1]).includes(f.request.authData.entCode));assert.equal(readOwner.protectProviderRead(read),true);scoped=true;return {code:"SUC_DBS_00000",result:[f.person],count:1};};await f.owner.prepareLifecycleUpdate(f.request,"employee");assert(scoped);assert.equal(f.request.query.code,f.person.code);assert.equal(f.effects.length,0);});


test("credential and lockout records are inspectable without generic mutation authority", t => {
 const names=["CONFIG","NODICS","CLASSES","ENUMS"];const old=Object.fromEntries(names.map(k=>[k,global[k]]));
 t.after(()=>{for(const k of names){if(old[k]===undefined)delete global[k];else global[k]=old[k];}});
 global.ENUMS={ContactType:Object.fromEntries(["EMAIL","PHONE","FAX","PAGER"].map(key=>[key,{key}]))};
 const schemas=require("../src/schemas/schemas").profile;
 global.CONFIG={get: key=>key==="runtimeRole"?{publication:"OPERATIONAL"}:undefined};
 global.NODICS={getModule:()=>({rawSchema:schemas})};
 global.CLASSES={NodicsError:class extends Error{constructor(code,message){super(message);this.code=code;}}};
 const authoring=require("../../../../nodics.foundation/modules/nDatabase/database/src/service/schema/defaultSchemaAuthoringPolicyService");
 for(const name of ["password","userState"]){
  assert.deepEqual(schemas[name].backoffice.operations,["search","read"]);
  for(const operation of ["create","update","delete"])
   assert.throws(()=>authoring.assertMutationAllowed("profile",name,operation),{code:"ERR_AUTH_00003"});
 }
 assert.equal(schemas.password.definition.password.required,true,"native credential persistence still owns its required secret");
 assert.equal(schemas.userState.definition.locked.default,false,"native lockout initialization remains unchanged");
});

test('inspect-only account metadata advertises login ID as a searchable business identity', t => {
    const original = global.CONFIG;
    t.after(() => { global.CONFIG = original; });
    global.CONFIG = { get: () => ({}) };
    const schemas = require('../src/schemas/schemas').profile;
    const utility = require('../../../../nodics.foundation/modules/nDatabase/database/src/service/schema/defaultSchemaUtilityService');
    for (const name of ['password', 'userState']) {
        const schema = schemas[name];
        const capabilities = utility.buildQueryCapabilities(schema, schema.backoffice, schema.backoffice.displayProperty);
        assert(capabilities.searchableFields.includes('loginId'));
        assert(!capabilities.searchableFields.includes('password'));
        assert.equal(schema.backoffice.fields.loginId.label, 'Login ID');
        assert.deepEqual(schema.backoffice.operations, ['search', 'read']);
    }
});
