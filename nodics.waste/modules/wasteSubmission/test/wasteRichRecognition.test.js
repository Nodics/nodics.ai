/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by root LICENSE. */
/** @module wasteSubmission/test/wasteRichRecognition @description Checks advisory recognition, unknown measurement provenance and unsupported image rejection. @layer test @owner wasteSubmission */
const assert=require('node:assert/strict');
const service=require('../src/service/defaultWasteMetadataAnalysisService.js');
let output, saved;
global.CONFIG={get:key=>key==='wasteSubmission'?{metadataSuggestion:{enabled:true,adapter:'vision',profile:'image',sizePolicy:{version:'v1',itemTypes:{PHONE:'SMALL'}}}}:{providers:{}}};
global.SERVICE={DefaultWasteItemDescriptorService:require("../../wasteMaterial/src/service/defaultWasteItemDescriptorService"),DefaultWasteSubmissionOperationService:{read:async()=>({code:'D',revision:2,submissionStatus:'MEDIA_STAGED',metadata:{photo:{code:'P'}}})},DefaultWastePersistenceService:{revision(){},fail(code,message){throw Object.assign(new Error(message),{code})},list:async(schema)=>schema==='wasteItemType'?[{code:'PHONE',categoryCode:'ELECTRONICS',name:{en:'Phone'},allowedConditionGrades:['UNKNOWN']}]:[{code:'PLASTIC',name:{en:'Plastic'}}],create:async()=>{},update:async(_s,_r,current,patch)=>saved={...current,...patch}},DefaultCopilotProviderService:{invoke:async()=>({content:JSON.stringify(output),provider:'vision',model:'test'})}};
SERVICE.DefaultWastePersistenceService.page=async(schema)=>{const items=await SERVICE.DefaultWastePersistenceService.list(schema);return {items,total:items.length};};
(async()=>{output={contractVersion:1,imageEvidence:{sourceType:'ITEM_PHOTOGRAPH',confidence:.95,reason:'Direct item photo'},assessment:'SUPPORTED',itemTypeCode:'PHONE',name:'Phone',materials:[{code:'PLASTIC',basis:'OBSERVED',confidence:.7},{code:'SECRET',basis:'OBSERVED'}],weight:100,carbon:999};await service.suggest({expectedRevision:2,photo:{code:'P',contentBase64:'image'}});assert.equal(saved.metadata.suggestion.recognition.weight.value,null);assert.equal(saved.metadata.suggestion.facts.sizeClass,'SMALL');assert.equal(saved.metadata.suggestion.recognition.materials.length,1);assert.equal(saved.metadata.suggestion.facts.carbon,undefined);output.assessment='UNSUPPORTED';await assert.rejects(service.suggest({photo:{contentBase64:'image'}}),{code:'ERR_WASTE_RECOGNITION_INVALID'});output.assessment='SUPPORTED';output.qualityFlags=['MULTIPLE_ITEMS'];await assert.rejects(service.suggest({photo:{contentBase64:'image'}}),{code:'ERR_WASTE_RECOGNITION_INVALID'});console.log('Rich recognition validation passed')})().catch(e=>{console.error(e);process.exit(1)});
