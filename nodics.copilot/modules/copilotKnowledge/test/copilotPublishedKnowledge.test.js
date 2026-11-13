/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module copilotKnowledge/test/copilotPublishedKnowledge @description Proves owner publication, exact pins, bounds and current retrieval denial without private source reads. @layer test @owner copilotKnowledge */
const test=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const provider=require('../src/service/defaultCopilotPublishedKnowledgeSourceProviderService');
const repository=require('../src/service/defaultCopilotRepositoryKnowledgeSourceProviderService');
const registry=require('../src/service/defaultCopilotKnowledgeSourceRegistryService');
const defaults=require('../config/properties').copilot.knowledge;
const retrieval=require('../src/service/defaultCopilotKnowledgeRetrievalService');
const policy=require('../../copilotPolicy/src/service/defaultCopilotPolicyService');
function fixture(t){
 const old=global.SERVICE,oldConfig=global.CONFIG;t.after(()=>{global.SERVICE=old;global.CONFIG=oldConfig});global.CONFIG={get:()=>({knowledge:defaults})};
 const scope={site:'guide-site',path:'/guides/customer',locale:'en',channel:'web'};
 const content={...scope,accessMode:'PUBLIC',page:{components:[{properties:{title:'Customer guide',body:'Bring an eligible item to a collection centre.',binding:{text:'private ignored'},token:'ignored'}}]}};
 const digest=crypto.createHash('sha256').update(JSON.stringify(content)).digest('hex');
 const source={code:'customer-guide',repository:'cms-online',project:'example',module:'cms',owner:'cms',version:digest,sourceType:'PUBLISHED_DOCUMENTATION',classification:'CUSTOMER',public:true,lifecycle:'ONLINE',paths:['guides/customer'],tenantScopes:['default'],enterpriseScopes:['default'],allowedChannels:['CUSTOMER'],secretScanPolicy:'REQUIRED',enabled:true,publishedContent:{site:scope.site,locale:scope.locale,channel:scope.channel,digests:{'guides/customer':digest}}};
 const normalized=registry.normalize(source,defaults.sourceRegistry,policy);
 const result={contractVersion:1,scope,publication:{state:'ONLINE',accessMode:'PUBLIC',contentDigest:digest},content};
 const calls=[];global.SERVICE={DefaultCopilotRepositoryKnowledgeSourceProviderService:repository,DefaultModuleService:{invokeModule:async input=>{calls.push(input);return {code:'SUC_CMS_00000',result:structuredClone(result)}}}};
 return {source,normalized,result,calls,service:{...provider,configuration:()=>defaults.ingestion}};
}
test('published provider uses CMS Online owner and extracts only authored copy',async t=>{
 const f=fixture(t),files=await f.service.read(f.normalized);assert.equal(files.length,1);assert.match(files[0].content,/eligible item/);assert.doesNotMatch(files[0].content,/ignored/);
 assert.equal(f.calls[0].moduleName,'cms');assert.equal(f.calls[0].connectionName,'cmsOnline');assert.deepEqual(f.calls[0].targetAuthority,{publication:'ONLINE'});assert.equal(f.calls[0].local,false);assert.ok(f.calls[0].apiName.startsWith('/delivery/knowledge?'));
});
test('registry binds exact public route digests into policy and refuses foreign or wildcard scope',t=>{
 const f=fixture(t);for(const change of [{public:false},{module:'profile'},{tenantScopes:['*']},{paths:['**/*']},{publishedContent:{...f.source.publishedContent,origin:'https://bad.invalid'}},{publishedContent:{...f.source.publishedContent,digests:{'guides/customer':'x'}}}])assert.throws(()=>registry.normalize({...f.source,...change},defaults.sourceRegistry,policy));
 const next=registry.normalize({...f.source,publishedContent:{...f.source.publishedContent,digests:{'guides/customer':'a'.repeat(64)}}},defaults.sourceRegistry,policy);assert.notEqual(next.sourcePolicyDigest,f.normalized.sourcePolicyDigest);
});
test('missing binding and invalid paths fail before owner transport',async t=>{const f=fixture(t);await assert.rejects(f.service.read({...f.normalized,publishedContent:undefined}));await assert.rejects(f.service.read({...f.normalized,paths:['../secret']}));assert.equal(f.calls.length,0)});
test('private, stale, forged and error-shaped owner evidence fails closed',async t=>{
 const f=fixture(t);for(const alter of [r=>r.publication.state='STAGED',r=>r.publication.accessMode='AUTHENTICATED',r=>r.publication.contentDigest='b'.repeat(64),r=>r.scope.site='foreign',r=>r.content.page.components[0].properties.body='changed']){
 const r=structuredClone(f.result);alter(r);SERVICE.DefaultModuleService.invokeModule=async()=>r;await assert.rejects(f.service.read(f.normalized));}
 for(const r of [{code:'ERR_CMS_00090',result:f.result},{success:false,result:f.result},{errors:['denied'],result:f.result}]){SERVICE.DefaultModuleService.invokeModule=async()=>r;await assert.rejects(f.service.read(f.normalized));}
});
test('current publication uses configured bounds and honours exclusions',async t=>{const f=fixture(t);f.service.configuration=()=>({...defaults.ingestion,maximumFileBytes:8});await assert.rejects(f.service.assertCurrent([f.normalized]),/BOUND/);assert.deepEqual(await f.service.read({...f.normalized,excludedPaths:['guides']}),[])});
test('withdrawal before search blocks Discovery; withdrawal during search blocks evidence',async t=>{
 const f=fixture(t);let reads=0,searches=0;const dependencies={registryService:{buildQueryScope:()=>({sourceCodes:[f.source.code],sourcePolicyDigests:[f.normalized.sourcePolicyDigest],classifications:['CUSTOMER'],channel:'CUSTOMER'})},policyService:policy,publishedSourceProviderService:{assertCurrent:async()=>{if(++reads===1)throw Error('withdrawn')}},discoveryRuntimeService:{search:async()=>{searches++;return []}},knowledgeService:{buildContext:()=>({evidence:[],citations:[]})}};
 const request={query:'eligible',indexTenant:'default',configuration:{...defaults.retrieval,enabled:true},registry:{sources:[f.normalized]}};
 await assert.rejects(retrieval.search(request,dependencies),/withdrawn/);assert.equal(searches,0);
 reads=0;dependencies.publishedSourceProviderService.assertCurrent=async()=>{if(++reads===2)throw Error('withdrawn')};await assert.rejects(retrieval.search(request,dependencies),/withdrawn/);assert.equal(searches,1);
});
test('unauthorized source scope causes no publication or search calls',async t=>{const f=fixture(t);const result=await retrieval.search({query:'guide',indexTenant:'default',configuration:{enabled:true},registry:{sources:[f.normalized]}},{registryService:{buildQueryScope:()=>({sourceCodes:[]})},policyService:policy});assert.equal(result.insufficientEvidence,true);assert.equal(f.calls.length,0)});

test('authored copy with an inner access restriction never becomes public evidence',()=>{for(const restriction of [{accessMode:'AUTHENTICATED'},{publiclyAvailable:false},{requiresAuthentication:true},{allowedPermissions:['private.read']}])assert.throws(()=>provider.text({components:[{properties:{body:'Restricted content',...restriction}}]}),/PRIVATE/)});

test('public proof is readable during startup before an internal token exists',async t=>{
 const f=fixture(t),before={CONFIG:global.CONFIG,NODICS:global.NODICS};t.after(()=>Object.assign(global,before));
 global.CONFIG={get:key=>key==='copilot'?{knowledge:defaults}:'default'};global.NODICS={getInternalAuthToken:()=>undefined};
 const transport=require('../../../../nodics.foundation/modules/nService/src/service/module/defaultModuleService');
 SERVICE.DefaultModuleService.invokeModule=async input=>{assert.deepEqual(transport.buildInternalAuthorizationHeader(input),{});assert.equal(input.requireInternalAuth,false);return f.result};
 assert.equal((await f.service.read(f.normalized)).length,1);
});

test('published owner alias uses the prepared routing pool without a runtime-registry snapshot',async t=>{
 const f=fixture(t);const transport=require('../../../../nodics.foundation/modules/nService/src/service/module/defaultModuleService');
 SERVICE.DefaultModulesConfigurationService={isAvailableModuleConfig:name=>name==='cmsOnline'};
 SERVICE.DefaultModuleService.invokeModule=async input=>{assert.equal(transport.isModuleEndpointAvailable(input),true);assert.equal(transport.isModuleEndpointAvailable({...input,connectionName:'cms'}),false);return f.result};
 assert.equal((await f.service.read(f.normalized)).length,1);
 global.CONFIG={get:()=>({knowledge:{...defaults,publishedContent:{connectionName:'https://foreign.invalid'}}})};
 await assert.rejects(f.service.read(f.normalized),/CONNECTION_REQUIRED/);
});
