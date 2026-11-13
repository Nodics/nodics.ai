/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const indexing=require('../src/service/defaultWcmsExperiencePublicationIndexingService');
test('committed events delegate guarded Online generation publication and never read mutable placements',async()=>{
 global.CONFIG={get:key=>key==='wcmsExperience'?{enabled:true,projection:{provider:'DISCOVERY'}}:{}};
 const calls=[];global.SERVICE={DefaultCmsPublicationManifestOrchestrationService:{getManifest:async code=>({code,snapshot:{site:'site'}})},
  DefaultCmsExperiencePlacementService:{get:()=>{throw new Error('mutable read');}},DefaultWcmsExperienceOnlinePublicationService:{publish:async(site,request)=>{calls.push([site,request.tenant]);return{state:'CURRENT',generation:'exact',documentCount:2};}}};
 for(const operation of ['DEPLOY','ROLLBACK','WITHDRAW']){const result=await indexing.handlePublicationEvent({code:'event',eventType:'CMS_ONLINE_CHANGED',manifestCode:'manifest',operation},{tenant:'tenant'});assert.equal(result.generation,'exact');assert.equal(result.operation,operation);}
 assert.deepEqual(calls,[['site','tenant'],['site','tenant'],['site','tenant']]);
 assert.deepEqual(await indexing.loadPlacements({manifest:{}} ,{cmsExperiencePlacements:[{code:'forged'}]}),[]);
 SERVICE.DefaultWcmsExperienceOnlinePublicationService.publish=async()=>{throw new Error('unacknowledged');};
 await assert.rejects(indexing.handlePublicationEvent({eventType:'CMS_ONLINE_CHANGED',manifestCode:'manifest',operation:'DEPLOY'},{tenant:'tenant'}),/unacknowledged/);
 assert.equal((await indexing.handlePublicationEvent({eventType:'OTHER'},{})).skipped,true);
});
