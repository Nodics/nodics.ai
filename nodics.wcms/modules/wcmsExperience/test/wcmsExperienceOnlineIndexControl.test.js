/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
const test=require('node:test'),assert=require('node:assert/strict');
const control=require('../src/service/defaultWcmsExperienceOnlineIndexControlService');
test('scoped operator uses the configured distinct Online connection and exactly one attempt',async()=>{
 global.CONFIG={get:key=>key==='cms'?{publication:{target:{connectionName:'cmsOnline'}}}:undefined};
 let authorization=0,scoped=0;global.SERVICE={DefaultCmsDesignerAccessService:{authorize:()=>authorization++,records:async()=>[{catalog:'catalog'}],scope:async(request,permission)=>{scoped++;assert.equal(permission,'WCMS_EXPERIENCE_PUBLISH_STATUS');assert.deepEqual(request.body,{site:'site',catalogCode:'catalog'});}},DefaultModuleService:{invokeModule:async c=>{assert.equal(c.connectionName,'cmsOnline');assert.equal(c.moduleName,'wcmsExperience');assert.equal(c.targetAuthority.publication,'ONLINE');assert.equal(c.local,false);assert.equal(c.maxAttempts,1);assert.deepEqual(c.requestBody,{site:'site',tenant:'tenant',operation:'inspect'});return {state:'CURRENT'};}}};
 const r=await control.invoke('inspect',{tenant:'tenant',body:{site:'site'},authData:{tokenType:'access'}});assert.equal(r.state,'CURRENT');assert.equal(authorization,1);assert.equal(scoped,1);
});
test('operator commands refuse stale receipts, unsupported dispatch and supplied identity before writes',async()=>{
 global.CLASSES={NodicsError:class extends Error{constructor(code){super(code);this.code=code}}};let writes=0;
 global.SERVICE={DefaultServiceTokenService:{requireRuntimePrincipal:r=>{if(r.authData?.tokenType!=='service')throw Error('DENIED');return r.authData;}},DefaultIdentityGovernanceService:{getSystemAuthData:()=>({isSystem:true,userGroups:['privateOwner']})},DefaultWcmsExperienceOnlinePublicationService:{inspect:async()=>({revision:3,pendingGeneration:'pending'}),publish:async()=>writes++,retire:async()=>writes++}};
 await assert.rejects(control.execute({tenant:'tenant',authData:{tokenType:'access'},body:{tenant:'tenant',site:'site',operation:'inspect'}}));
 await assert.rejects(control.execute({tenant:'tenant',authData:{tokenType:'service'},body:{tenant:'tenant',site:'site',operation:'retire',revision:2,pendingGeneration:'pending'}}));
 await assert.rejects(control.execute({tenant:'tenant',authData:{tokenType:'service'},body:{tenant:'tenant',site:'site',operation:'rebuild',revision:3}}));
 await assert.rejects(control.invoke('inspect',{body:{site:'site',authData:{}}}));assert.equal(writes,0);
});


test('remote recovery conflict retains its stable status definition and never exposes upstream internals',async()=>{
 const controller=require('../src/controller/defaultWcmsExperienceAuthoringController');
 global.SERVICE={DefaultWcmsExperienceOnlineIndexControlService:{invoke:async()=>{const e=new CLASSES.NodicsError('ERR_WCMS_EXPERIENCE_ONLINE_INSPECTION_REQUIRED');e.message='private upstream material';e.responseCode=500;throw e;}}};
 await assert.rejects(controller.onlineIndex({}),e=>e instanceof CLASSES.NodicsError&&e.code==='ERR_WCMS_EXPERIENCE_ONLINE_INSPECTION_REQUIRED'&&!e.message.includes('private upstream'));
});
