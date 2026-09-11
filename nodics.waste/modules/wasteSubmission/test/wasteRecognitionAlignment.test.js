/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module wasteSubmission/test/wasteRecognitionAlignment @description Verifies complete catalogue/schema coverage and provider-to-suggestion-to-submission-to-descriptor property fidelity. @owner wasteSubmission @layer test */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const analysis = require('../src/service/defaultWasteMetadataAnalysisService');
const operations = require('../src/service/defaultWasteSubmissionOperationService');
const descriptor = require('../../wasteMaterial/src/service/defaultWasteItemDescriptorService');
const defaults = require('../../wasteMaterial/config/properties').wasteMaterial;
const range = (min, max, unit) => ({ min, max, unit, basis: 'INFERRED', confidence: .6 });
test('complete paged taxonomy and structured properties survive persistence, application, and projection', async () => {
 const items = Array.from({length: 501}, (_, i) => ({code:'ITEM_'+i, categoryCode:'DEVICES', allowedConditionGrades:['UNKNOWN','DAMAGED']}));
 const materials = [{code:'PLASTIC',name:{en:'Plastic'},materialKind:'MATERIAL'}];
 const catalogues = {wasteItemType:items,wasteCategory:[{code:'DEVICES',familyCode:'ELECTRONICS'}],wasteFamily:[],wasteMaterialType:materials};
 let current = {code:'D',revision:1,submissionStatus:'MEDIA_STAGED',submittedFacts:{preferredCollectionPointCode:'C'},metadata:{}}, sent, suggestion;
 const response = {contractVersion:1,imageEvidence:{sourceType:'ITEM_PHOTOGRAPH',confidence:.95,reason:'Direct item photo'},assessment:'SUPPORTED',name:'Control unit',description:'Black plastic housing',itemTypeCode:'ITEM_500',categoryCode:'WRONG',conditionGrade:'UNKNOWN',quantity:1,brand:null,model:null,confidence:.9,materials:[{code:'PLASTIC',basis:'OBSERVED',confidence:.8}],sizeClass:'LARGE',weightEstimate:range(.1,.3,'KG'),dimensionsEstimate:{length:range(10,15,'CM'),width:range(3,5,'CM'),height:range(1,3,'CM')},environment:{recyclability:{value:'POTENTIAL',basis:'INFERRED',confidence:.6},contamination:{value:'NOT_VISIBLE',basis:'OBSERVED',confidence:.7},hazards:[{code:'BATTERY_PRESENT',basis:'INFERRED',confidence:.5}],recoveryPotential:{value:'POTENTIAL',basis:'INFERRED',confidence:.6}},qualityFlags:[],unknownFields:['materials','weight','dimensions']};
 global.CONFIG={get:key=>key==='wasteMaterial'?defaults:key==='wasteSubmission'?{metadataSuggestion:{enabled:true,allowedFamilyCodes:['ELECTRONICS'],sizePolicy:{version:'v2',itemTypes:{ITEM_500:'LARGE'}}}}:{providers:{}}};
 global.SERVICE={DefaultWasteItemDescriptorService:descriptor,DefaultWasteSubmissionOperationService:{...operations,read:async()=>current},DefaultWastePersistenceService:{
  page:async(schema,_r,_q,page,limit)=>({items:catalogues[schema].slice((page-1)*limit,page*limit),total:catalogues[schema].length}),
  revision(record,expected){assert.equal(record.revision,expected);},fail(code,message){throw Object.assign(new Error(message),{code});},
  create:async(_s,_r,value)=>{suggestion=value;},update:async(_s,_r,_c,patch)=>(current={...current,...patch,revision:current.revision+1}),
 },DefaultCopilotProviderService:{invoke:async(request)=>{sent=request;return{content:JSON.stringify(response),provider:'openai',model:'configured'};}}};
 const temporary = await analysis.inspect({photo:{contentBase64:'fixture'}}, null);
 assert.equal(temporary.proposal.name, 'Control unit');
 assert.equal(temporary.recognition.draftRevision, 0);
 assert.equal(suggestion, undefined);
 assert.equal(current.revision, 1);
 await analysis.suggest({expectedRevision:1,photo:{code:'P',contentBase64:'fixture'}});
 assert(sent.responseSchema.schema.properties.itemTypeCode.enum.includes('ITEM_500'));
 assert.equal(sent.responseSchema.schema.additionalProperties,false);
 assert.equal(sent.responseSchema.schema.properties.dimensionsEstimate.properties.width.properties.unit.enum[0],'CM');
 assert.equal(current.metadata.suggestion.recognition.promptVersion,'WASTE_PHOTO_V5');
 assert.equal(current.metadata.suggestion.recognition.size.basis,'TAXONOMY_POLICY');
 assert.deepEqual(current.metadata.suggestion.recognition.unknownFields,['brand','model','conditionGrade']);
 assert.equal(JSON.parse(suggestion.rawSummary).environment.contamination.value,'NOT_VISIBLE');
 await SERVICE.DefaultWasteSubmissionOperationService.applyAnalysis({expectedRevision:2});
 const result=descriptor.describe(current,{items,materials,categories:catalogues.wasteCategory});
 assert.equal(result.classification.category.code,'DEVICES');
 assert.deepEqual(result.physical.weightEstimate,response.weightEstimate);
 assert.deepEqual(result.physical.dimensionsEstimate,response.dimensionsEstimate);
 assert.equal(result.materials[0].ref.code,'PLASTIC');assert.equal(result.materials[0].basis,'OBSERVED');
 assert.equal(result.environment.observations.hazards[0].basis,'INFERRED');
 assert.equal(result.environment.assessment,null);assert.equal(result.physical.weight.value,null);
 assert.deepEqual(result.unknownFields,['brand','model','conditionGrade']);
 response.weightEstimate=range(3,1,'KG');response.dimensionsEstimate.length=range(1,4,'M');response.materials=[{code:'GOLD',basis:'OBSERVED'}];
 await analysis.suggest({expectedRevision:3,photo:{code:'P',contentBase64:'fixture'}});
 assert(current.metadata.suggestion.recognition.unknownFields.includes('weight'));
 assert(current.metadata.suggestion.recognition.unknownFields.includes('dimensions'));
 assert(current.metadata.suggestion.recognition.unknownFields.includes('materials'));
});
