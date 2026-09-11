/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by root LICENSE. */
/** @module wasteMaterial/test/wasteItemDescriptorContract @description Protects provenance, customer allowlists, safe projection, shared reviewed facts and later-layer descriptor policy. @owner wasteMaterial @layer test */
const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const descriptor = require('../src/service/defaultWasteItemDescriptorService');
const operations = require('../../wasteSubmission/src/service/defaultWasteSubmissionOperationService');
const defaults = require('../config/properties').wasteMaterial;
const materials = [{code:'COTTON',name:{en:'Cotton'},status:'ACTIVE',materialKind:'MATERIAL'},{code:'CIRCUIT_BOARD',name:{en:'Circuit board'},status:'ACTIVE',materialKind:'COMPONENT'}];
beforeEach(()=>{
 global.CONFIG={get:key=>key==='wasteMaterial'?defaults:{}};
 global.SERVICE={DefaultWastePersistenceService:{fail(code,message){throw Object.assign(new Error(message),{code});},page:async schema=>({items:schema==='wasteMaterialType'?materials:[],total:schema==='wasteMaterialType'?materials.length:0})}};
});
test('AI suggestions retain canonical composition without manufacturing gold, measured weight or impact',()=>{
 const result=descriptor.normalize({materials:[{code:'CIRCUIT_BOARD',basis:'INFERRED',confidence:.8},{code:'GOLD',basis:'OBSERVED',confidence:1}],weightEstimate:{min:.1,max:.3,unit:'KG',basis:'OPERATOR_MEASURED',confidence:.6},environment:{recyclability:{value:'CERTIFIED'},hazards:[{code:'SAFE'}]}},materials);
 assert.equal(result.materials.length,1);assert.equal(result.materials[0].kind,'COMPONENT');assert.equal(result.weightEstimate.basis,'INFERRED');assert.equal(result.environment.recyclability.value,'UNKNOWN');assert.deepEqual(result.environment.hazards,[]);assert.equal(result.environment.hazardAssessment,'UNVERIFIED');
});
test('operator material references and incomplete or impossible ranges are rejected',()=>{
 for(const input of [{materials:[{ref:{code:'GOLD'}}]},{weightEstimate:{min:null,max:4,unit:'KG'}},{weightEstimate:{min:2,max:1,unit:'KG'}},{weightEstimate:{min:0,max:1,unit:'KG'}},{environment:{hazards:[{code:'CERTIFIED_SAFE'}]}}]) assert.throws(()=>descriptor.normalize(input,materials,true),{code:'ERR_WASTE_DESCRIPTOR_INVALID'});
 const result=descriptor.normalize({materials:[{ref:{code:'COTTON'}}],weightEstimate:{min:null,max:null,unit:'KG'}},materials,true);
 assert.equal(result.materials[0].basis,'OPERATOR_VERIFIED');assert.equal(result.weightEstimate.basis,'UNKNOWN');
});
test('customer commands accept only name and description plus transport fields',()=>{
 assert.deepEqual(operations.customerFacts({name:' Shirt ',description:'Blue',expectedRevision:2}),{name:'Shirt',description:'Blue'});
 for(const payload of [{quantity:3},{categoryCode:'CLOTHING'},{weight:2},{materials:[]},{environment:{}},{authData:{principalType:'human'}},{preferredCollectionPointCode:'OTHER'}]) assert.throws(()=>operations.customerFacts(payload),{code:'ERR_WASTE_CUSTOMER_FIELD_READ_ONLY'});
});
test('saved analysis is applied by exact revision, not by facts supplied in the request',async()=>{
 const stored={code:'D',revision:3,submissionStatus:'METADATA_SUGGESTED',submittedFacts:{preferredCollectionPointCode:'CENTRE'},metadata:{suggestion:{facts:{name:'Remote',categoryCode:'ELECTRONICS'}}}};
 const service={...operations,read:async()=>stored,store:()=>({revision(record,expected){assert.equal(record.revision,expected);},update:async(_s,_r,current,patch)=>({...current,...patch})})};
 const result=await service.applyAnalysis({expectedRevision:3,payload:{categoryCode:'ATTACK'}});
 assert.equal(result.submittedFacts.categoryCode,'ELECTRONICS');assert.equal(result.submittedFacts.preferredCollectionPointCode,'CENTRE');
});
test('approved submission and asset resolve the same reviewed descriptor and assessment',()=>{
 const facts={name:'Reviewed shirt',categoryCode:'CLOTHING',itemTypeCode:'SHIRT',quantity:1,materials:[{ref:{code:'COTTON'},basis:'OPERATOR_VERIFIED'}]};
 const catalogue={materials,categories:[{code:'CLOTHING',familyCode:'TEXTILES',name:{en:'Clothing'}}],families:[{code:'TEXTILES',name:{en:'Clothing and textiles'}}],items:[{code:'SHIRT',name:{en:'Shirt'}}]};
 const estimate={metadata:{environmentalAssessment:{status:'ESTIMATED',indicators:[]}},metrics:[]};
 const submission=descriptor.describe({code:'D',submissionStatus:'APPROVED',confirmedFacts:{name:'Original'},metadata:{reviewedFacts:facts,approvedEstimate:estimate,publicReason:'Accepted'}},catalogue);
 const asset=descriptor.describe({code:'A',assetStatus:'OWNED',metadata:{facts,approvedEstimate:estimate,publicReason:'Accepted'}},catalogue);
 for(const key of ['identity','classification','materials','environment']) assert.deepEqual(submission[key],asset[key]);
 assert.equal(submission.identity.name,'Reviewed shirt');assert.equal(submission.classification.family.code,'TEXTILES');assert.equal(submission.review.comment,'Accepted');
});
test('customer projection removes private channel identifiers, internal notes and command data',async()=>{
 const row={code:'D',submissionStatus:'REJECTED',submittedFacts:{name:'Item'},sourceContext:{secret:'private'},idempotencyKey:'private',metadata:{publicReason:'Item incomplete',internalNote:'staff-only',origin:{channel:'TELEGRAM',subject:'private-id',allowsWrite:true},reviewPrincipal:{code:'staff'},suggestion:{facts:{name:'Item'},recognition:{materials:[]},provider:'internal-server'}}};
 const result=await descriptor.projectResponse({submission:row},{authData:{principalType:'customer'}});
 assert.equal(result.submission.descriptor.review.comment,'Item incomplete');
 assert.equal(JSON.stringify(result).includes('private-id'),false);assert.equal(JSON.stringify(result).includes('staff-only'),false);assert.equal(JSON.stringify(result).includes('internal-server'),false);assert.equal(result.submission.idempotencyKey,undefined);
});
test('later layers may tighten descriptor limits while retaining provenance and unknown values',()=>{
 const custom={...descriptor,settings:()=>({...defaults.descriptor,maximumWeightKg:5,maximumMaterials:1})};
 assert.throws(()=>custom.normalize({weightEstimate:{min:4,max:6,unit:'KG'}},materials,true),{code:'ERR_WASTE_DESCRIPTOR_INVALID'});
 assert.equal(custom.normalize({weightEstimate:{min:4,max:5,unit:'KG'}},materials,true).weightEstimate.basis,'OPERATOR_VERIFIED');
});

test('catalogue reads all pages and fails explicitly when the deployment limit is exceeded',async()=>{
 const rows=Array.from({length:501},(_,i)=>({code:'M'+i}));
 SERVICE.DefaultWastePersistenceService.page=async (_schema,_request,_query,page,limit)=>({items:rows.slice((page-1)*limit,page*limit),total:rows.length});
 assert.equal((await descriptor.catalogue({})).materials.length,501);
 await assert.rejects(({...descriptor,settings:()=>({maximumCatalogueRecords:500})}).catalogue({}),{code:'ERR_WASTE_CATALOGUE_UNAVAILABLE'});
});

test('manual recovery uses only the configured fallback and leaves classification for the reviewer',async()=>{
 const current={code:'D',revision:3,submissionStatus:'MEDIA_STAGED',submittedFacts:{preferredCollectionPointCode:'C'},evidenceRefs:[{code:'P'}],metadata:{}};
 CONFIG.get=key=>key==='wasteSubmission'?{metadataSuggestion:{manualReviewFallback:true,fallbackItemTypeCode:'UNCLASSIFIED'}}:{};
 const service={...operations,read:async()=>current,store:()=>({revision(){},one:async()=>({code:'UNCLASSIFIED',categoryCode:'GENERIC',status:'ACTIVE'}),update:async(_s,_r,_c,patch)=>patch})};
 const result=await service.updateDraft({payload:{name:'My old item'},expectedRevision:3});
 assert.equal(result.submittedFacts.itemTypeCode,'UNCLASSIFIED');assert.equal(result.submittedFacts.quantity,1);assert.equal(result.metadata.manualReviewRequired,true);assert.equal(result.submittedFacts.weight,undefined);
});

test('unapplied analysis projects physical and environmental observations; effective values control unknown fields',()=>{
 const facts={name:'Remote',sizeClass:'SMALL',quantity:1,materials:[{code:'CIRCUIT_BOARD',basis:'INFERRED'}],weightEstimate:{min:.1,max:.2,unit:'KG',basis:'INFERRED'},dimensionsEstimate:Object.fromEntries(['length','width','height'].map(axis=>[axis,{min:1,max:2,unit:'CM',basis:'INFERRED'}])),environment:{recyclability:{value:'POTENTIAL',basis:'INFERRED'}}};
 const result=descriptor.describe({code:'D',submissionStatus:'METADATA_SUGGESTED',submittedFacts:{preferredCollectionPointCode:'C'},metadata:{suggestion:{facts,recognition:{unknownFields:['materials','weight','dimensions','sizeClass']}}}},{materials});
 assert.equal(result.identity.name,'Remote');assert.equal(result.physical.weightEstimate.min,.1);
 assert.equal(result.environment.observations.recyclability.value,'POTENTIAL');
 assert.deepEqual(result.unknownFields,['brand','model','conditionGrade']);
 const reviewed=descriptor.describe({code:'D',submissionStatus:'APPROVED',metadata:{reviewedFacts:{name:'Corrected',materials:[]},suggestion:{facts,recognition:{materials:facts.materials}}}},{materials});
 assert.deepEqual(reviewed.materials,[]);assert(reviewed.unknownFields.includes('weight'));
});

test('fresh analysis clears old unknown brand/model and photo replacement invalidates derived properties',async()=>{
 const stored={code:'D',revision:3,submissionStatus:'METADATA_SUGGESTED',submittedFacts:{name:'My item',preferredCollectionPointCode:'C',brand:'OLD',model:'OLD',materials:[{code:'COTTON'}],weight:'5',customPartnerField:'retain'},metadata:{suggestion:{facts:{name:'Remote',itemTypeCode:'REMOTE',categoryCode:'ELECTRONICS'}}}};
 const store={revision(){},update:async(_s,_r,current,patch)=>({...current,...patch}),one:async()=>({code:'EVIDENCE'})};
 const service={...operations,read:async()=>stored,store:()=>store};
 const applied=await service.applyAnalysis({expectedRevision:3});
 assert.equal(applied.submittedFacts.brand,undefined);assert.equal(applied.submittedFacts.model,undefined);assert.equal(applied.submittedFacts.weight,undefined);
 assert.equal(applied.submittedFacts.customPartnerField,'retain');assert.equal(applied.submittedFacts.preferredCollectionPointCode,'C');
 const attached=await service.attachEvidence({mediaDescriptor:{code:'NEW',mimeType:'image/png'}});
 assert.equal(attached.metadata.suggestion,null);assert.deepEqual(attached.metadataSuggestionRefs,[]);
 assert.equal(attached.submittedFacts.brand,undefined);assert.equal(attached.submittedFacts.materials,undefined);
 assert.equal(attached.submittedFacts.name,'My item');assert.equal(attached.submittedFacts.preferredCollectionPointCode,'C');
});
