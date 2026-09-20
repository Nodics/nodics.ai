/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module wasteSubmission/test/wasteRequiredImpact @description Proves required assessment enforcement at persistence and confirmation boundaries. @owner wasteSubmission @layer test */
const {test,beforeEach}=require("node:test");
const assert=require("node:assert/strict");
const operation=require("../src/service/defaultWasteSubmissionOperationService");
let required, result, writes, confirmed, current, scoped;
const valid=()=>({metadata:{environmentalAssessment:{status:"ESTIMATED",methodology:{isMock:false},indicators:[{key:"recyclingInputMass",status:"ESTIMATED",value:".5"}]}}});
beforeEach(()=>{
 required=true;result=valid();writes=0;confirmed=0;
 current={code:"D",revision:3,submissionStatus:"METADATA_SUGGESTED",submittedFacts:{},evidenceRefs:[{code:"PHOTO"}],metadata:{}};
 global.CONFIG={get:()=>({requireEnvironmentalAssessment:required})};
 global.SERVICE={DefaultWastePersistenceService:{revision:(record,revision)=>assert.equal(record.revision,revision),fail:(code,message)=>{throw Object.assign(Error(message),{code})},one:async()=>({status:"ACTIVE"}),update:async(_s,_r,old,patch)=>{writes++;return {...old,...patch}}},
 DefaultWasteImpactCalculationService:{calculate:async()=>result},
 DefaultWasteSubmissionLifecycleService:{confirmFacts:()=>{confirmed++;return {submissionStatus:"SUBMITTED"}}}};
 scoped={...operation,read:async()=>current,validateFacts:async()=>({facts:{},item:{impactProfileCode:"P"}})};
});
test("required assessment rejects missing, failed, illustrative and empty results before writing",async()=>{
 for(const env of [undefined,{status:"FAILED"},{status:"ILLUSTRATIVE"},{status:"ESTIMATED",methodology:{isMock:true},indicators:[]},{status:"ESTIMATED",methodology:{isMock:false},indicators:[]}]) {
  result={metadata:{environmentalAssessment:env}};
  await assert.rejects(scoped.estimate({expectedRevision:3}),{code:"ERR_WASTE_IMPACT_INPUT_INVALID"});
 }
 assert.equal(writes,0);
});
test("confirmation cannot bypass a required assessment for single items or bundles",async()=>{
 for(const submissionUnit of [undefined,"BUNDLE"]) {
  current.submittedFacts={submissionUnit};
  await assert.rejects(scoped.confirm({expectedRevision:3,confirmed:true}),{code:"ERR_WASTE_IMPACT_INPUT_INVALID"});
 }
 assert.equal(confirmed,0);assert.equal(writes,0);
 current.metadata.estimate=valid();
 await scoped.confirm({expectedRevision:3,confirmed:true});
 assert.equal(confirmed,1);
});
test("successful assessment clears pending marker; domains may retain optional policy",async()=>{
 current.metadata.estimatePending=true;
 const saved=await scoped.estimate({expectedRevision:3});
 assert.equal(saved.metadata.estimatePending,false);
 assert.equal(saved.metadata.estimate,result);
 required=false;
 current.metadata.estimate=null;
 await scoped.confirm({expectedRevision:3,confirmed:true});
 assert.equal(confirmed,1);
});
test("idempotent confirmation replay does not require a new assessment",async()=>{
 current.submissionStatus="SUBMITTED";current.metadata.confirmationKey="same";
 assert.equal(await scoped.confirm({idempotencyKey:"same"}),current);
 assert.equal(writes,0);
});
