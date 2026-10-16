/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module commsApi/test/communicationInboxSource @description Verifies admitted customer bearer forwarding, strict canonical Profile identity reads and isolated inbox source selectors with injected storage/transport only. @owner commsApi @layer test @override Later facade projections must retain customer admission and recipient isolation. */
const {test,afterEach}=require('node:test');
const assert=require('node:assert/strict');
const facade=require('../src/facade/defaultCommunicationApiFacade');
const controller=require('../src/controller/defaultCommunicationApiController');
const runtime=require('../../commsCore/src/service/defaultCommunicationRuntimeService');
const defaults=require('../config/properties').communicationApi;
const request={tenant:'runtime-a',authorization:'Bearer customer-token',auth:{type:'bearer',credential:'customer-token'},authData:{principalType:'customer',tokenType:'access',tenant:'runtime-a',entCode:'business-a',loginId:'owner@example.test'}};
/** Mirrors the generated get response, not a permissive transport wrapper. @param {Array} result Canonical rows. @returns {Object} Generated success envelope. */
function profileEnvelope(result=[{code:'owner',loginId:request.authData.loginId}]) {
 return {code:'SUC_FIND_00000',responseCode:'200',cache:'item mis',query:{loginId:request.authData.loginId},options:{recursive:false},count:result.length,result};
}
/** Installs real generated-result parsing and injected owner reads, without native services. @returns {Array} Recorded inbox reads with separate Profile invocation evidence. */
function setup(){
 global.CONFIG={get:()=>defaults};
 const calls=[];
 calls.profile=[];
 global.SERVICE={DefaultModuleService:{invokeModule:async(options)=>{calls.profile.push(options);return profileEnvelope();}},DefaultCommunicationRuntimeService:{rows:runtime.rows,list:async(schema,input,query)=>{
  assert.equal(input.tenant,'runtime-a');calls.push({schema,query});
  const rows=schema==='CommsInboxMessage' ? [
   {code:'mine',intentCode:'intent-own',recipientId:'owner',body:'Recorded message'},
   {code:'bad-pointer',intentCode:'intent-other',recipientId:'owner'},
   {code:'other',intentCode:'intent-other',recipientId:'other'},
  ] : [
   {code:'intent-own',recipientId:'owner',channel:'IN_APP',sourceModule:'eWaste',sourceType:'wasteSubmission',sourceCode:'WST_1',variables:{secret:'PRIVATE'},recipientAddressReference:'PRIVATE'},
   {code:'intent-other',recipientId:'other',channel:'IN_APP',sourceModule:'eWaste',sourceType:'wasteSubmission',sourceCode:'PRIVATE'},
  ];
  return rows.filter(row=>Object.entries(query).every(([key,value])=>typeof value==='object'?value.$in.includes(row[key]):row[key]===value));
 }}};
 return calls;
}
afterEach(()=>{delete global.CONFIG;delete global.SERVICE;delete global.FACADE;delete global.NODICS;delete global.UTILS;});
test('only an owner-matched IN_APP intent supplies a safe domain source selector',async()=>{
 const calls=setup(),result=await facade.listInbox(request);
 assert.equal(result.length,2);
 assert.deepEqual(result[0].source,{module:'eWaste',type:'wasteSubmission',code:'WST_1'});
 assert.equal(result[1].source,undefined);
 assert(!JSON.stringify(result).includes('PRIVATE'));
 assert(!JSON.stringify(result).includes('recipientId'));
 assert.equal(calls[1].query.recipientId,'owner');assert.equal(calls[1].query.channel,'IN_APP');
});
test('employee callers cannot obtain a customer inbox',async()=>{
 const calls=setup();await assert.rejects(facade.listInbox({...request,authData:{...request.authData,principalType:'employee'}}),/Customer context required/);assert.equal(calls.length,0);
});
test('failed canonical Profile identity resolution never falls back to the caller code',async()=>{
 const calls=setup();SERVICE.DefaultModuleService.invokeModule=async()=>profileEnvelope([{code:'other',loginId:'other@example.test'}]);
 await assert.rejects(facade.listInbox(request),/Customer identity unavailable/);assert.equal(calls.length,0);
});

test('Profile lookup forwards exact admitted bearer and unchanged tenant/enterprise with bounded duplicate detection',async()=>{
 const calls=setup(),original=structuredClone(request);
 await facade.listInbox(request);
 assert.equal(calls.profile.length,1);
 const options=calls.profile[0];
 assert.equal(options.local,false);
 assert.equal(options.moduleName,'profile');assert.equal(options.connectionName,'profile');
 assert.equal(options.apiName,'/customer');assert.equal(options.methodName,'POST');
 assert.equal(options.tenant,request.tenant);assert.deepEqual(options.request,{tenant:request.tenant});
 assert.deepEqual(options.header,{Authorization:request.authorization,'X-Enterprise-Code':'business-a'});
 assert.deepEqual(options.requestBody,{query:{loginId:request.authData.loginId},options:{recursive:false},searchOptions:{pageSize:2,pageNumber:1}});
 assert.equal(options.maxAttempts,1);assert.equal(options.timeoutMs,10000);
 assert.deepEqual(request,original);
});

for (const authorization of [undefined,null,'','customer-token','Basic customer-token','Bearer','Bearer ','Bearer token extra','Bearer token\n','Bearer token\r\nX-Forged: value',[],{}]) {
 test(`missing or invalid bearer refuses before Profile/inbox reads: ${JSON.stringify(authorization)}`,async()=>{
  const calls=setup();
  await assert.rejects(facade.listInbox({...request,authorization}),/Customer context required/);
  assert.equal(calls.profile.length,0);assert.equal(calls.length,0);
 });
}

for (const [name,patch] of [
 ['missing identity',{authData:undefined}],
 ['service principal',{authData:{...request.authData,principalType:'service'}}],
 ['service token',{authData:{...request.authData,tokenType:'service'}}],
 ['missing signed tenant',{authData:{...request.authData,tenant:undefined}}],
 ['conflicting tenant',{tenant:'other'}],
 ['blank tenant',{tenant:''}],
 ['blank login',{authData:{...request.authData,loginId:' '}}],
 ['missing normalized auth',{auth:undefined}],
 ['API key normalized auth',{auth:{type:'apiKey',credential:'customer-token'}}],
 ['substituted bearer',{authorization:'Bearer forged-token'}],
]) {
 test(`spoofed/incomplete customer context refuses before owner reads: ${name}`,async()=>{
  const calls=setup();
  await assert.rejects(facade.listInbox({...request,...patch,payload:{authData:request.authData,authorization:request.authorization,tenant:request.tenant}}),/Customer context required/);
  assert.equal(calls.profile.length,0);assert.equal(calls.length,0);
 });
}

for (const [name,response] of [
 ['missing response',undefined],['null response',null],['raw array',profileEnvelope().result],
 ['missing success code',{result:profileEnvelope().result,count:1}],
 ['failure code',{...profileEnvelope(),code:'ERR_SYS_00000'}],
 ['false success',{...profileEnvelope(),success:false}],
 ['error with plausible data',{...profileEnvelope(),error:{message:'failed'}}],
 ['errors with plausible data',{...profileEnvelope(),errors:[{code:'ERR_TEST'}]}],
 ['malformed errors',{...profileEnvelope(),errors:{}}],
 ['failed HTTP response',{...profileEnvelope(),responseCode:'500'}],
 ['malformed HTTP status',{...profileEnvelope(),responseCode:'invalid'}],
 ['wrapped data',{code:'SUC_SYS_00000',data:profileEnvelope()}],
 ['wrapped result',{code:'SUC_SYS_00000',result:profileEnvelope()}],
 ['object result',{...profileEnvelope(),result:profileEnvelope().result[0]}],
 ['empty result',profileEnvelope([])],
 ['duplicate identity',profileEnvelope([...profileEnvelope().result,...profileEnvelope().result])],
 ['second different identity',profileEnvelope([...profileEnvelope().result,{code:'other',loginId:'other@example.test'}])],
 ['truncated duplicate count',{...profileEnvelope(),count:2}],
 ['missing count',{...profileEnvelope(),count:undefined}],
 ['string count',{...profileEnvelope(),count:'1'}],
 ['null customer',profileEnvelope([null])],
 ['missing canonical code',profileEnvelope([{loginId:request.authData.loginId}])],
 ['non-string canonical code',profileEnvelope([{code:123,loginId:request.authData.loginId}])],
 ['blank canonical code',profileEnvelope([{code:' ',loginId:request.authData.loginId}])],
 ['wrong login',profileEnvelope([{code:'other',loginId:'other@example.test'}])],
 ['explicit tenant conflict',profileEnvelope([{code:'owner',loginId:request.authData.loginId,tenant:'other'}])],
]) {
 test(`failed/malformed canonical identity never reaches inbox: ${name}`,async()=>{
  const calls=setup();SERVICE.DefaultModuleService.invokeModule=async()=>response;
  await assert.rejects(facade.listInbox({...request,authData:{...request.authData,code:'caller-forged'}}));
  assert.equal(calls.length,0);
 });
}

test('Profile transport rejection propagates without fallback or inbox reads',async()=>{
 const calls=setup(),error=new Error('Synthetic Profile refusal');
 SERVICE.DefaultModuleService.invokeModule=async()=>{throw error;};
 await assert.rejects(facade.listInbox(request),value=>value===error);
 assert.equal(calls.length,0);
});

test('controller maps only the actual HTTP bearer and preserves authenticated context despite body/query spoofing',async()=>{
 const calls=setup();global.FACADE={DefaultCommunicationApiFacade:facade};
 const input={...structuredClone(request),authorization:'Bearer preexisting-forgery',httpRequest:{headers:{authorization:request.authorization},body:{authorization:'Bearer body-forgery',authData:{principalType:'service'},tenant:'other',entCode:'other'},query:{authorization:'Bearer query-forgery'}}};
 const auth=input.authData;
 const result=await controller.listInbox(input);
 assert.equal(result.data.length,2);assert.equal(calls.profile[0].header.Authorization,request.authorization);
 assert.equal(input.authData,auth);assert.equal(input.tenant,request.tenant);
 assert.equal(calls.profile[0].header['X-Enterprise-Code'],'business-a');
});

test('controller cannot recover missing HTTP bearer from body or preexisting authorization',async()=>{
 const calls=setup();global.FACADE={DefaultCommunicationApiFacade:facade};
 await assert.rejects(controller.listInbox({...structuredClone(request),httpRequest:{headers:{},body:{authorization:request.authorization}}}),/Customer context required/);
 assert.equal(calls.profile.length,0);assert.equal(calls.length,0);
});

test('actual generated get and JSON response handlers produce the accepted Profile success envelope',async()=>{
 setup();
 const generated=require('../../../../nodics.foundation/modules/nDatabase/database/src/service/procs/get/defaultModelsGetInitializerService');
 const json=require('../../../../nodics.foundation/modules/nRouter/src/service/handlers/response/defaultJsonResponseHandlerService');
 const response={};
 await new Promise((resolve,reject)=>generated.executeQuery.call({LOG:{debug(){}},readItems:async()=>({query:{loginId:request.authData.loginId},options:{recursive:false},count:1,result:profileEnvelope().result})},{},response,{nextSuccess:resolve,error:(_request,_response,error)=>reject(error)}));
 SERVICE.DefaultStatusService={get:()=>({code:'200',message:'Success'})};
 let envelope;
 json.handleSuccess.call(json,{}, {status:code=>assert.equal(code,200),json:value=>{envelope=JSON.parse(JSON.stringify(value));}},response.success);
 SERVICE.DefaultModuleService.invokeModule=async()=>envelope;
 assert.equal((await facade.listInbox(request)).length,2);
});

test('actual module transport preserves the customer bearer and never selects the runtime credential',async()=>{
 setup();
 const transport=require('../../../../nodics.foundation/modules/nService/src/service/module/defaultModuleService');
 let headers,tokenReads=0;
 global.NODICS={getInternalAuthToken:()=>{tokenReads++;return 'runtime-token';}};
 SERVICE.DefaultRouterService={prepareUrl:()=> 'https://profile.example.test/nodics/profile'};
 SERVICE.DefaultModuleService={...transport,LOG:{debug(){}},isLocalModuleActive:()=>false,resolveRuntimeOwner:async()=>undefined,isModuleEndpointAvailable:()=>true,recordInvocationResolution(){},fetch:async(options)=>{headers=options.headers;assert.equal(options.uri,'https://profile.example.test/nodics/profile/v0/customer');assert.equal(options.method,'POST');return profileEnvelope();}};
 await facade.listInbox(request);
 assert.equal(headers.Authorization,request.authorization);
 assert.equal(headers['x-enterprise-code'],'business-a');assert.equal(tokenReads,0);
});

test('later facade projection override preserves bearer admission and source/recipient isolation',async()=>{
 const calls=setup();
 const customized={...facade,project(value,name){return facade.project.call(this,value,name).map(item=>({...item,presentation:'custom'}));}};
 const result=await customized.listInbox(request);
 assert.equal(result[0].presentation,'custom');assert.equal(result[1].source,undefined);
 assert.equal(calls.profile[0].header.Authorization,request.authorization);
 const count=calls.length;
 await assert.rejects(customized.listInbox({...request,authorization:undefined}),/Customer context required/);
 assert.equal(calls.length,count);assert.equal(calls.profile.length,1);
});
