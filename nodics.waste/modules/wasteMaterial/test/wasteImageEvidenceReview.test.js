/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module wasteMaterial/test/wasteImageEvidenceReview @description Protects advisory image-source assessment, sticky manual-approval holds, conservative unknown handling and shared customer/asset projections. @owner wasteMaterial @layer test */
const {test,beforeEach}=require('node:test');
const assert=require('node:assert/strict');
const descriptor=require('../src/service/defaultWasteItemDescriptorService');
const defaults=require('../config/properties').wasteMaterial;
const photo=code=>({module:'media',schema:'media',code});
beforeEach(()=>{global.CONFIG={get:key=>key==='wasteMaterial'?defaults:{}};});
test('non-photographic and uncertain sources require manual approval even with high classification confidence',()=>{
 for(const sourceType of ['PROMOTIONAL_GRAPHIC','ILLUSTRATION_OR_PAINTING','SCREENSHOT_OR_REPHOTO','SUSPECTED_GENERATED','UNCERTAIN']){
  const assessment=descriptor.normalizeImageEvidence({sourceType,confidence:.99,reason:'Visual evidence requires checking'},null,photo('P'));
  const record={metadata:{photo:{code:'P'},evidenceReview:assessment}};
  assert.equal(assessment.manualApprovalRequired,true);assert.equal(descriptor.evidenceReview(record).acknowledgementRequired,true);
  assert.equal(descriptor.evidenceReview(record).manualApprovalRequired,true);assert.equal(assessment.advisory,true);
 }
});
test('missing, malformed and low-confidence image-source assessments fail into manual review',()=>{
 for(const value of [undefined,{},[],{sourceType:'FAKE'},{sourceType:'ITEM_PHOTOGRAPH',confidence:null},{sourceType:'ITEM_PHOTOGRAPH',confidence:.5}])
  assert.equal(descriptor.normalizeImageEvidence(value,null,photo('P')).manualApprovalRequired,true);
 const legacy=descriptor.evidenceReview({metadata:{photo:{code:'P'}}});
 assert.equal(legacy.manualApprovalRequired,true);assert.equal(legacy.acknowledgementRequired,false);
});
test('ordinary item photos can follow standard review but replacement and later-policy uncertainty cannot permit automation',()=>{
 const assessment=descriptor.normalizeImageEvidence({sourceType:'ITEM_PHOTOGRAPH',confidence:.95},null,photo('P'));
 assert.equal(assessment.manualApprovalRequired,false);
 assert.equal(descriptor.evidenceReview({metadata:{photo:{code:'P'},evidenceReview:assessment}}).manualApprovalRequired,false);
 assert.equal(descriptor.evidenceReview({metadata:{photo:{code:'NEW'},evidenceReview:assessment}}).manualApprovalRequired,true);
 const strict={...descriptor,settings:()=>({...defaults.descriptor,imageEvidence:{minimumPhotoConfidence:.99}})};
 assert.equal(strict.normalizeImageEvidence({sourceType:'ITEM_PHOTOGRAPH',confidence:.95},null,photo('P')).manualApprovalRequired,true);
});
test('reanalysis or replacing a flagged photo cannot clear its hold; resulting asset preserves manual approval evidence',()=>{
 const original=descriptor.normalizeImageEvidence({sourceType:'PROMOTIONAL_GRAPHIC',confidence:.98,reason:'Designed advertising layout'},null,photo('P'));
 const current=descriptor.normalizeImageEvidence({sourceType:'ITEM_PHOTOGRAPH',confidence:.99,reason:'New direct photo'},original,photo('NEW'));
 assert.equal(current.manualApprovalRequired,true);assert.deepEqual(current.reasonCodes,['PROMOTIONAL_GRAPHIC']);
 assert.deepEqual(current.flaggedEvidenceRef,photo('P'));assert.equal(current.flagReason,'Designed advertising layout');
 const metadata={photo:{code:'NEW'},evidenceReview:current,manualEvidenceApproval:{principalRef:{code:'private-staff-code'}}};
 const submission=descriptor.describe({code:'D',submissionStatus:'APPROVED',metadata});
 const asset=descriptor.describe({code:'A',assetStatus:'OWNED',metadata});
 assert.deepEqual(submission.evidenceReview,asset.evidenceReview);
 assert.equal(asset.evidenceReview.manualApprovalRequired,true);assert.equal(asset.evidenceReview.manualApprovalRecorded,true);
 assert.equal(asset.evidenceReview.label,'Approved after manual evidence review');
 assert.equal(JSON.stringify(asset.evidenceReview).includes('private-staff-code'),false);
 assert.equal(asset.evidenceReview.principalRef,undefined);
});
