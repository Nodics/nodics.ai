/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteSubmission/test/wasteEmptyDraftDiscard @description Verifies empty-only, owner-checked and revisioned legacy cleanup. @owner wasteSubmission @layer test */
const { test, beforeEach, afterEach } = require("node:test"), assert = require("node:assert/strict");
const operations = require("../src/service/defaultWasteSubmissionOperationService");
const persistence = require("../../wasteCore/src/service/defaultWastePersistenceService");
let draft, removed, linked;
const request = () => ({ code:"EMPTY", expectedRevision:2, tenant:"test", authData:{principalType:"customer",code:"owner",loginId:"owner@example.test"} });
beforeEach(() => {
  removed = 0; linked = false;
  draft = {code:"EMPTY",revision:2,submissionStatus:"DRAFT",submitterRef:{module:"profile",schema:"customer",code:"owner"},submittedFacts:{},evidenceRefs:[],metadata:{}};
  global.SERVICE = {DefaultWastePersistenceService:{...persistence,
    one: async()=>draft,
    list: async()=>linked?[{code:"evidence"}]:[],
    repository:()=>({remove:async input=>{
      assert.equal(input.query.revision,2);assert.equal(input.query["submitterRef.code"],"owner");
      assert.equal(input.query["metadata.photo"],null);assert.equal(input.query.submissionStatus,"DRAFT");
      removed++;draft=null;
    }}),
  }};
});
afterEach(()=>delete global.SERVICE);
test("only a truly empty owned draft is removed through generated persistence",async()=>{
  assert.equal((await operations.discardEmptyDraft(request())).discarded,true);assert.equal(removed,1);
});
test("saved text, photos, analysis, final states and orphan evidence prevent removal",async()=>{
  for(const modify of [d=>d.submittedFacts.name="My item",d=>d.metadata.photo={code:"photo"},d=>d.metadata.suggestion={},d=>d.submissionStatus="SUBMITTED",d=>d.evidenceRefs=[{code:"evidence"}]]){
    const before=structuredClone(draft);modify(draft);
    await assert.rejects(operations.discardEmptyDraft(request()),{code:"ERR_WASTE_SUBMISSION_IMMUTABLE"});draft=before;
  }
  linked=true;await assert.rejects(operations.discardEmptyDraft(request()),{code:"ERR_WASTE_SUBMISSION_IMMUTABLE"});assert.equal(removed,0);
});
test("foreign owners and stale revisions cannot discard a draft",async()=>{
  await assert.rejects(operations.discardEmptyDraft({...request(),expectedRevision:1}),{code:"ERR_WASTE_REVISION_CONFLICT"});
  draft.submitterRef.code="other";
  await assert.rejects(operations.discardEmptyDraft(request()),{code:"ERR_WASTE_RECORD_NOT_FOUND"});assert.equal(removed,0);
});
