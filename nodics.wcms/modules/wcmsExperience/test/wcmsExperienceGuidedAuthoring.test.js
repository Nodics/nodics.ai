/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module wcmsExperience/test/wcmsExperienceGuidedAuthoring @description Exact owner scope, revision and one-attempt guided placement regression. @owner wcmsExperience @layer test */
const {test}=require('node:test');const assert=require('node:assert/strict');
const service=require('../src/service/defaultWcmsExperienceAuthoringService');
const routes=require('../src/router/routers').wcmsExperience.experienceAuthoring;
function fixture(){const rows=['one','two'].map((code,index)=>({code,site:'site',pageType:'PRODUCT_LISTING',slot:'hero',targetType:'DEFAULT',targetCode:'*',component:'hero',rendererKey:'content',contractVersion:0,priority:index+1,revision:0,locale:'en',channel:'web'}));
 const calls=[];let allow=true;global.CLASSES={NodicsError:class extends Error{constructor(code){super(code);this.code=code;}}};
 const deny=()=>{throw new CLASSES.NodicsError('ERR_AUTH_00003');};
 global.CONFIG={get:key=>({runtimeRole:{publication:'STAGED'},wcmsExperience:{stagedPreview:{maximumPlacements:100},authoring:{maximumAbsolutePriority:100000}}})[key]};
 global.SERVICE={DefaultCmsDesignerAccessService:{authorize:()=>{if(!allow)deny();},deny,scope:async r=>{if(r.tenant!=='tenant'||r.body.siteCode!=='site'||r.body.catalogCode!=='catalog')deny();return {siteCode:'site',catalogCode:'catalog',enterpriseCode:'tenant'};},records:async(_name,r,q)=>{assert.equal(r.tenant,'tenant');assert.deepEqual(q,{site:'site',active:true});return structuredClone(rows);},matches:()=>true,persistenceAuth:()=>({principalType:'service'})},
 DefaultCmsDesignerReadService:{stable:JSON.stringify,getDraft:async()=>({result:{editable:true,sourceVersion:'a'.repeat(64),draft:{page:{name:'Page'},sections:[{components:[{code:'hero',properties:{title:'Hero'}}]}]}}})},
 DefaultSecuredRequestPipelineService:{getGrantedPermissions:()=>[],isPermissionGranted:()=>allow},
 DefaultCmsExperiencePlacementService:{update:async r=>{calls.push(r);const row=rows.find(row=>row.code===r.query.code&&row.revision===r.query.revision);if(row)Object.assign(row,r.model.$set);return {result:{acknowledged:true,modifiedCount:row?1:0}};}}};
 const request={tenant:'tenant',authData:{loginId:'employee'},body:{catalogCode:'catalog',siteCode:'site',pageCode:'page'}};
 return {rows,calls,request,deny:()=>{allow=false;}};}
test('new routes retain independent view/edit permissions and Staged CMS owner scope',async()=>{assert.equal(routes.inspectPlacements.permission,'WCMS_EXPERIENCE_VIEW');assert.equal(routes.savePlacement.permission,'WCMS_EXPERIENCE_EDIT');const f=fixture();await assert.rejects(service.inspect({...f.request,body:{...f.request.body,siteCode:'foreign'}}),{code:'ERR_AUTH_00003'});f.deny();await assert.rejects(service.inspect(f.request),{code:'ERR_AUTH_00003'});assert.equal(f.calls.length,0);});
test('explicit conflict correction increments only the inspected placement and changes no Online content',async()=>{const f=fixture(),view=await service.inspect(f.request);const body={...f.request.body,sourceVersion:view.sourceVersion,code:'one',expectedRevision:0,slot:'hero',targetType:'DEFAULT',targetCode:'*',priority:2};await assert.rejects(service.save({...f.request,body}),{code:'ERR_WCMS_EXPERIENCE_PRIORITY_CONFLICT'});assert.equal(f.calls.length,0);body.priority=3;const result=await service.save({...f.request,body});assert.equal(result.revision,1);assert.equal(result.onlineChanged,false);assert.equal(f.calls.length,1);assert.deepEqual(f.calls[0].query,{code:'one',site:'site',revision:0});assert.equal(f.rows[1].priority,2);await assert.rejects(service.save({...f.request,body}),{code:'ERR_WCMS_EXPERIENCE_AUTHORING_CONFLICT'});assert.equal(f.calls.length,1);});
test('concurrent source changes, scope injection and uncertain acknowledgements never trigger replay',async()=>{for(const mode of ['changed','injected','denied','lost-ack']){const f=fixture(),view=await service.inspect(f.request),body={...f.request.body,sourceVersion:view.sourceVersion,code:'one',expectedRevision:0,slot:'hero',targetType:'DEFAULT',targetCode:'*',priority:3};if(mode==='changed')f.rows[1].priority=8;if(mode==='injected')body.tenant='foreign';if(mode==='denied')f.deny();if(mode==='lost-ack'){SERVICE.DefaultCmsExperiencePlacementService.update=async request=>{f.calls.push(request);return {result:{acknowledged:false,modifiedCount:1}};};}await assert.rejects(service.save({...f.request,body}));assert.equal(f.calls.length,mode==='lost-ack'?1:0);}});

test('real CMS admission retains the original GET selection through nested scoped reads',async()=>{
 const f=fixture(),access=require('../../cms/src/service/designer/defaultCmsDesignerAccessService');
 const security=SERVICE.DefaultSecuredRequestPipelineService;
 security.getEffectiveUserGroupCodes=()=>['employeeUserGroup'];security.getGrantedPermissions=r=>r.authData.permissions;
 security.isPermissionGranted=(permission,permissions)=>permissions.includes(permission);
 SERVICE.DefaultCmsDesignerAccessService={...SERVICE.DefaultCmsDesignerAccessService,authorize:access.authorize.bind(access)};
 const originalScope=SERVICE.DefaultCmsDesignerAccessService.scope;
 SERVICE.DefaultCmsDesignerAccessService.scope=async(request,permission)=>{access.authorize(request,permission);return originalScope(request);};
 const request={tenant:'tenant',authorization:'Bearer qualification',authData:{principalType:'human',tokenType:'access',type:'Employee',loginId:'employee',tenant:'tenant',enterpriseCode:'tenant',userGroups:['employeeUserGroup'],permissions:['WCMS_EXPERIENCE_VIEW','WCMS_EXPERIENCE_EDIT','cms.backoffice.view','cms.authoring.write']},httpRequest:{query:f.request.body}};
 const value=await service.inspect(request);assert.equal(value.siteCode,'site');assert.equal(value.canEdit,true);assert.equal(value.placements.length,2);
});
