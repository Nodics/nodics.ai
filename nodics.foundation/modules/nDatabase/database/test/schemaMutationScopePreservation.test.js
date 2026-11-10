/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module database/test/schemaMutationScopePreservation
 * @description Confirms explicit create/update normalization preserves original record placement and cannot be selected by body flags.
 * @layer test @owner database
 */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const definition=require('../src/service/schema/defaultSchemaUtilityService');
const fields=[{name:'name',readOnly:false},{name:'tenant',readOnly:true},{name:'enterpriseCode',readOnly:false}];
const descriptor={fields};
const request=Object.freeze({tenant:'acting-tenant',authData:Object.freeze({entCode:'acting-enterprise'}),httpRequest:Object.freeze({body:Object.freeze({operation:'create'})})});
test('update preserves a read-only business tenant and current enterprise instead of injecting acting context',()=>{
 const model=definition.buildMutationModel({name:'Changed',tenant:'forged',enterpriseCode:'forged'},descriptor,request,'update');
 assert.deepEqual(model,{name:'Changed'});assert.equal(request.tenant,'acting-tenant');assert.equal(request.authData.entCode,'acting-enterprise');
});
test('create retains original trusted scope and ignores submitted placement',()=>{
 assert.deepEqual(definition.buildMutationModel({name:'New',tenant:'forged',enterpriseCode:'forged'},descriptor,request,'create'),{name:'New',tenant:'acting-tenant',enterpriseCode:'acting-enterprise'});
});
test('generated normalization delegates its explicit operation through the same owner',()=>{
 const utility={...definition,resolveSchemaModule:()=>({moduleName:'independent',moduleObject:{rawSchema:{entry:{model:true,backoffice:{}}}}}),buildFields:()=>fields,buildConcurrency:()=>({mode:'NONE'})};
 assert.deepEqual(utility.buildGeneratedMutationModel({name:'Changed'},request,'entry','update'),{name:'Changed'});
});

test('a scope fixed value cannot turn an update into placement migration',()=>{
 const fixed={fields:fields.map(field=>field.name==='tenant'?{...field,fixedValue:'new-default'}:field)};
 assert.deepEqual(definition.buildMutationModel({name:'Changed'},fixed,request,'update'),{name:'Changed'});
});

test('update field policy preserves required creation input while protecting ordinary updates',t=>{
 const before={CONFIG:global.CONFIG,CLASSES:global.CLASSES};t.after(()=>{for(const [k,v]of Object.entries(before)){if(v===undefined)delete global[k];else global[k]=v;}});
 const Config=require('../../../nConfig/bin/config');global.CONFIG=new Config();global.CONFIG.setProperties({independent:{lifecycle:{fields:['title','removedProjectField']}}});global.CLASSES={NodicsError:class extends Error{constructor(code,message){super(message);this.code=code;}}};
 const owner={...definition,resolveFixedValue:()=>undefined,buildRelationship:()=>undefined,humanize:x=>x,buildEnumOptions:()=>undefined,isSafeDefault:()=>false,resolveFieldComponent:()=>undefined,buildFieldValidation:()=>undefined,buildFieldOrigin:()=>undefined};
 const schema={definition:{key:{type:'string',primary:true,required:true},mail:{type:'string',required:true},title:{type:'string'}}};
 const fields=owner.buildFields('independent',schema,{updateFields:{configurationPath:'independent.lifecycle.fields'}});
 assert.equal(fields.find(f=>f.name==='key').required,true);assert.equal(fields.find(f=>f.name==='key').readOnly,false);assert.equal(fields.find(f=>f.name==='key').readOnlyOnUpdate,true);
 assert.deepEqual(owner.buildMutationModel({key:'new',mail:'contact@example.test',title:'Title'},{fields},request,'create'),{key:'new',mail:'contact@example.test',title:'Title'});
 assert.deepEqual(owner.buildMutationModel({key:'forged',mail:'changed@example.test',title:'Changed'},{fields},request,'update'),{title:'Changed'});
 assert.throws(()=>owner.buildFields('independent',schema,{updateFields:{configurationPath:'missing.policy'}}),{code:'ERR_DBS_00004'});
});
test('a protected update-only fixed value cannot be injected into an update',()=>{const d={fields:[{name:'key',readOnly:false,readOnlyOnUpdate:true,fixedValue:'new-default'},{name:'name',readOnly:false}]};assert.deepEqual(definition.buildMutationModel({name:'Changed'},d,request,'update'),{name:'Changed'});});

test('a permitted structured root retains its inline child fields during update',t=>{const old=global.CONFIG;t.after(()=>{if(old===undefined)delete global.CONFIG;else global.CONFIG=old;});global.CONFIG={get:()=>undefined};const allowed=definition.resolveUpdateFields({definition:{name:{type:'object'},'name.firstName':{type:'string'},'name.lastName':{type:'string'},code:{type:'string'}}},{updateFields:['name']});assert.deepEqual([...allowed],['name','name.firstName','name.lastName']);});

test('declared model tenants constrain discovery before operation projection and ignore body scope',t=>{const old=global.CONFIG;t.after(()=>{if(old===undefined)delete global.CONFIG;else global.CONFIG=old;});global.CONFIG={get:()=>({defaultModelOperations:['search','read'],defaultMutationMode:'GENERATED_CRUD'})};let projected=0;const owner={...definition,isLocalActiveModule:()=>true,getAuthoringAuthority:()=>({}),getAllowedOperations:()=>{projected++;return [];}};const module={rawSchema:{entry:{model:true,tenants:['registry'],definition:{code:{type:'string',primary:true}}}}};assert.equal(owner.buildDescriptor({moduleName:'independent',tenant:'business',httpRequest:{body:{tenant:'registry'}}},module,'entry','independent'),undefined);assert.equal(projected,0);owner.buildDescriptor({moduleName:'independent',tenant:'registry'},module,'entry','independent');assert.equal(projected,1);delete module.rawSchema.entry.tenants;owner.buildDescriptor({moduleName:'independent',tenant:'business'},module,'entry','independent');assert.equal(projected,2);});

test('schema HTTP discovery and generated mutations refuse a contradictory enterprise header before processing inputs',t=>{
 const old=global.CLASSES;t.after(()=>{if(old===undefined)delete global.CLASSES;else global.CLASSES=old;});
 global.CLASSES={NodicsError:class extends Error{constructor(code,message){super(message);this.code=code;}}};
 for(const key of ['x-enterprise-code','X-Enterprise-Code','entCode']){
  const wrong={...request,httpRequest:{headers:{[key]:'foreign-enterprise'}}};
  assert.throws(()=>definition.buildDescriptor(wrong,null,'entry','independent'),{code:'ERR_AUTH_00003'});
  assert.throws(()=>definition.buildGeneratedMutationModel({},wrong,'entry','update'),{code:'ERR_AUTH_00003'});
 }
 assert.doesNotThrow(()=>definition.assertSchemaHttpEnterpriseScope({...request,httpRequest:{headers:{'x-enterprise-code':'acting-enterprise'}}}));
 assert.doesNotThrow(()=>definition.assertSchemaHttpEnterpriseScope(request));
 assert.equal(definition.getEnterpriseCode({...request,entCode:'foreign-enterprise'}),'acting-enterprise');
});
