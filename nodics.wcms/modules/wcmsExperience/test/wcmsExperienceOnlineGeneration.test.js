/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const online=require('../src/service/defaultWcmsExperienceOnlinePublicationService');
const frozen=require('../src/service/defaultWcmsExperiencePublicationSourceService');
const resolver=require('../src/service/defaultWcmsExperienceResolverService');
const generation=require('../../../../nodics.discovery/modules/discoveryPublication/src/service/defaultDiscoveryGenerationPublicationService');
const runtime=require('../../../../nodics.discovery/modules/discoveryRuntime/src/service/defaultDiscoveryRuntimeService');
const transport=require('../../../../nodics.discovery/modules/discoveryProjection/src/service/defaultDiscoveryProjectionTransportService');
const indexing=require('../src/service/defaultWcmsExperiencePublicationIndexingService');
const props=require('../config/properties').wcmsExperience;
const clone=value=>structuredClone(value);
function setup(){
 const journals=new Map(),documents=new Map();let failure=false;
 const placements=[{code:'chosen',site:'site',pageType:'PRODUCT_LISTING',slot:'hero',targetType:'COLLECTION',targetCode:'summer',component:'hero',rendererKey:'hero',contractVersion:1,locale:'en',channel:'web',revision:0,priority:10,deliveryStatus:'ACTIVE'}];
 const pointers=[{site:'site',path:'/',locale:'en',channel:'web',accessMode:'PUBLIC',active:true,manifestCode:'v1'}];
 const model=heading=>({site:'site',path:'/',locale:'en',channel:'web',accessMode:'PUBLIC',page:{components:[{code:'hero',renderer:'hero',rendererContractVersion:1,properties:{heading},components:[{code:'nested',renderer:'text',slot:'body',properties:{text:'Nested approved text'},components:[]}]}]}});
 const manifests={v1:{code:'v1',publicationCode:'p1',active:true,contentHash:'1',snapshot:model('first'),cmsExperiencePlacements:clone(placements)},v2:{code:'v2',publicationCode:'p2',active:true,contentHash:'2',snapshot:model('second'),cmsExperiencePlacements:clone(placements)}};
 global.CONFIG={get:key=>key==='wcmsExperience'?props:key==='runtimeRole'?{publication:'ONLINE'}:{}};
 global.SERVICE={DefaultWcmsExperienceResolverService:resolver,DefaultWcmsExperiencePublicationIndexingService:indexing,DefaultWcmsExperiencePublicationSourceService:frozen,
 DefaultDiscoveryGenerationPublicationService:generation,DefaultDiscoveryProjectionTransportService:transport,DefaultDiscoveryRuntimeService:runtime,
 DefaultCmsExperiencePlacementService:{get:async()=>({result:clone(placements)})},
 DefaultCmsOnlinePublicationPointerService:{get:async request=>{assert.equal(request.query.accessMode,'PUBLIC');return{result:clone(pointers)};}},
 DefaultCmsPublicationManifestOrchestrationService:{getManifest:async code=>clone(manifests[code])},
 DefaultDiscoveryGenerationTransportService:{get:async r=>({code:'SUC_DB',result:journals.has(r.query.code)?[clone(journals.get(r.query.code))]:[]}),
 save:async r=>{if(journals.has(r.model.code))throw new Error('duplicate');journals.set(r.model.code,clone(r.model));return{code:'SUC_DB',result:r.model};},
 update:async r=>{const row=journals.get(r.query.code),matched=row?.revision===r.query.revision;if(matched)journals.set(r.query.code,{...row,...clone(r.model)});return{code:'SUC_DB',result:{matchedCount:matched?1:0}};}},
 DefaultDiscoveryDocumentProjectionService:{doSave:async r=>{assert.equal(r.targetAuthority.publication,'ONLINE');documents.set(r.model.code,clone(r.model));if(failure)throw new Error('lost acknowledgement');return{code:'SUC_SEARCH',result:r.model};},
 doRefresh:async()=>({code:'SUC_SEARCH',result:{_shards:{failed:0,successful:1}}}),doSearch:async r=>{const terms=Object.fromEntries(r.query.bool.filter.map(f=>Object.entries(f.term)[0]));const matches=[...documents.values()].filter(d=>d.tenant===terms['tenant.keyword']&&d.ownerType===terms.ownerType&&d.indexConfigurationCode===terms.indexConfigurationCode&&d.payload.publicationOwner===terms['payload.publicationOwner.keyword']&&d.payload.publicationGeneration===terms['payload.publicationGeneration.keyword']);return{code:'SUC_SEARCH',result:{timed_out:false,_shards:{failed:0,successful:1},hits:{total:{value:matches.length,relation:'eq'},hits:matches.slice(0,r.options.size).map(d=>({_source:d}))}}};}}
 };
 return {pointers,placements,manifests,journals,documents,setFailure:v=>failure=v,request:{tenant:'tenant',authData:{tokenType:'service'}}};
}
test('failed index activation retains prior alias, explicit retirement fences it, then rollback and withdrawal resolve exactly',async()=>{
 const f=setup(),context={site:'site',tenant:'tenant',authData:{tokenType:'service'}};
 const first=await online.publish('site',f.request);assert.equal(first.documentCount,1);
 assert.equal((await online.read(context))[0].properties.heading,'first');
 assert.equal((await online.publish('site',f.request)).unchanged,true);
 f.pointers[0].manifestCode='v2';f.setFailure(true);await assert.rejects(online.publish('site',f.request),/lost acknowledgement/);
 assert.equal((await online.read(context))[0].properties.heading,'first');
 await assert.rejects(online.publish('site',f.request),/INSPECTION_REQUIRED/);
 const pending=await online.inspect('site',f.request);assert.equal(pending.generation,first.generation);
 await assert.rejects(online.retire('site',pending.revision-1,pending.pendingGeneration,f.request));
 await online.retire('site',pending.revision,pending.pendingGeneration,f.request);f.setFailure(false);
 await assert.rejects(online.publish('site',f.request,{inspectOnly:true}),/INSPECTION_REQUIRED/);
 assert.equal((await online.read(context))[0].properties.heading,'first');
 await online.publish('site',f.request);const read=await online.read(context);assert.equal(read[0].properties.heading,'second');
 const nested=resolver.toSlotComponent(read[0]);assert.equal(nested.components[0].properties.text,'Nested approved text');assert.equal(nested.components[0].slot,'body');
 assert.deepEqual(await online.read({...context,tenant:'foreign'}),[]);
 f.pointers[0].manifestCode='v1';await online.publish('site',f.request);assert.equal((await online.read(context))[0].properties.heading,'first');
 f.pointers.length=0;await online.publish('site',f.request);assert.deepEqual(await online.read(context),[]);
 assert(f.documents.size>=3,'historical generations retained, not overwritten');
});
test('reviewed placement snapshot survives mutable edits and rejects altered reviewed values',async()=>{
 const f=setup(),route={site:'site',locale:'en',channel:'web'};
 const identities=await frozen.freeze(route,[{schema:'cmsComponent',code:'hero'}],f.request);f.placements[0].priority=999;
 assert.equal(frozen.load(identities[0]).priority,10);
 assert.throws(()=>frozen.load({...identities[0],snapshot:{...identities[0].snapshot,priority:999}}),/INTEGRITY/);
});
test('unconfirmed refresh never activates the new generation and malformed public scope is refused',async()=>{
 const f=setup();await online.publish('site',f.request);f.pointers[0].manifestCode='v2';SERVICE.DefaultDiscoveryDocumentProjectionService.doRefresh=async()=>({code:'SUC_SEARCH',result:{_shards:{failed:1,successful:0}}});
 await assert.rejects(online.publish('site',f.request));assert.equal((await online.read({site:'site',...f.request}))[0].properties.heading,'first');
 await assert.rejects(online.read({site:'../other',...f.request}));
});
test('overlapping rules resolve deterministically with nested output and omit private targeting fields',()=>{
 setup();const context=resolver.normalizeContext({experience:{site:'site',pageType:'PRODUCT_LISTING',targetType:'COLLECTION',targetCode:'summer',locale:'en',channel:'web'}});
 const p={site:'site',pageType:'PRODUCT_LISTING',slot:'hero',targetType:'COLLECTION',targetCode:'summer',publicationStatus:'ONLINE',deliveryStatus:'ACTIVE',rendererKey:'hero',properties:{heading:'approved'}};
 const a={...p,code:'a',priority:20},b={...p,code:'b',priority:10};
 const one=resolver.resolveFromPlacements(context,[b,a]),two=resolver.resolveFromPlacements(context,[a,b]);assert.deepEqual(one,two);assert.equal(one.slots.hero[0].placementCode,'a');assert.equal(one.slots.hero[0].priority,undefined);
});


test('Online delivery preserves the reviewed placement renderer and zero-valued contract version',async()=>{
 const f=setup();f.manifests.v1.cmsExperiencePlacements[0].rendererKey='approved.renderer';f.manifests.v1.cmsExperiencePlacements[0].contractVersion=0;
 await online.publish('site',f.request);const placement=(await online.read({site:'site',...f.request}))[0];
 assert.equal(placement.rendererKey,'approved.renderer');assert.equal(placement.contractVersion,0);
 f.placements[0].rendererKey='';await assert.rejects(frozen.freeze({site:'site',locale:'en',channel:'web'},[{schema:'cmsComponent',code:'hero'}],f.request),/SOURCE_INVALID/);
});
