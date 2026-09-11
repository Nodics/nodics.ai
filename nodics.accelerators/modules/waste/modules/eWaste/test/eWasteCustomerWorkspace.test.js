/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module eWaste/test/eWasteCustomerWorkspace @description Verifies customer scope, pagination, effective facts, safe projections and later-layer policy. @owner eWaste @layer test */
const { test, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const workspace = require("../src/service/defaultEWasteCustomerWorkspaceService");
const defaults = require("../config/properties").eWaste;
const persistence = require("../../../../../../nodics.waste/modules/wasteCore/src/service/defaultWastePersistenceService");
const descriptor = require("../../../../../../nodics.waste/modules/wasteMaterial/src/service/defaultWasteItemDescriptorService");
const materialDefaults = require("../../../../../../nodics.waste/modules/wasteMaterial/config/properties").wasteMaterial;
let records, calls, policy;
const request = (query = {}) => ({ tenant: "runtime-a", authData: { tenant: "runtime-a", principalType: "customer", loginId: "owner@example.test", code: "owner" }, query });
const row = (code, status = "SUBMITTED", owner = "owner") => ({ code, revision: 2, active: true, submissionStatus: status, submitterRef: { module: "profile", schema: "customer", code: owner }, submittedFacts: { name: code, categoryCode: "DEVICE" }, metadata: { submittedAt: "2026-09-10T10:00:00.000Z", privateReviewNotes: "PRIVATE", origin: { channel: "TELEGRAM", chatId: "PRIVATE" } }, updated: code });
const asset = (code, status = "OWNED", owner = "owner") => ({ code, revision: 3, active: true, assetStatus: status, ownerRef: { module: "profile", schema: "customer", code: owner }, sourceSubmissionCode: "SUB", metadata: { facts: { name: "Reviewed asset", categoryCode: "DEVICE" }, privateReviewNotes: "PRIVATE", illustrativeCarbonUnits: 0, openingReward: 0 } });
const get = (object, path) => path.split(".").reduce((value, key) => value?.[key], object);
function matches(record, query) {
 return Object.entries(query).every(([key, condition]) => {
  if (key === "$and") return condition.every(value => matches(record, value));
  if (key === "$or") return condition.some(value => matches(record, value));
  const value = get(record, key);
  if (condition === null) return value == null;
  if (typeof condition !== "object") return value === condition;
  return Object.entries(condition).every(([operator, expected]) => {
   if (operator === "$in") return expected.includes(value);
   if (operator === "$nin") return !expected.includes(value);
   if (operator === "$ne") return value !== expected;
   if (operator === "$exists") return (value !== undefined) === expected;
   if (operator === "$regex") return new RegExp(expected, condition.$options || "").test(value || "");
   if (operator === "$options") return true;
   if (operator === "$gte") return value >= expected;
   if (operator === "$lt") return value < expected;
   throw Error("Unsupported fixture operator " + operator);
  });
 });
}
beforeEach(() => {
 records = { wasteSubmission: [], wasteAsset: [], wasteCollectionPoint: [] }; calls = [];
 policy = structuredClone(defaults);
 global.CONFIG = { get: key => key === "eWaste" ? policy : key === "wasteMaterial" ? materialDefaults : undefined };
 global.SERVICE = {
  DefaultWastePersistenceService: { ...persistence, repository: schema => ({ get: async input => {
   calls.push({ schema, ...input });
   const rows = (records[schema] || []).filter(value => matches(value, input.query));
   const start = ((input.searchOptions.pageNumber || 1) - 1) * input.searchOptions.pageSize;
   return { count: rows.length, result: rows.slice(start, start + input.searchOptions.pageSize) };
  } }) },
  DefaultWasteItemDescriptorService: { ...descriptor, catalogue: async () => ({ categories: [{ code: "DEVICE", name: { en: "Devices" } }], items: [], families: [], materials: [] }) },
 };
});
afterEach(() => { delete global.CONFIG; delete global.SERVICE; });
test("owner scope and paging precede limits and preserve exact counts beyond 100", async () => {
 records.wasteSubmission = [...Array.from({length: 200}, (_, i) => row("foreign-" + i, "APPROVED", "other")), ...Array.from({length: 125}, (_, i) => row("mine-" + i))];
 const result = await workspace.search(request({ page: "11" }));
 assert.equal(result.total, 125); assert.equal(result.items.length, 5); assert.equal(result.statuses.find(s => s.code === "PENDING").count, 125);
 assert(calls.every(call => call.tenant === "runtime-a"));
 assert(result.items.every(item => item.code.startsWith("mine-")));
 assert(!JSON.stringify(result).includes("PRIVATE"));
});
test("review states never become drafts and filters follow reviewed whole-facts precedence", async () => {
 const reviewed = row("reviewed", "APPROVED"); reviewed.metadata.reviewedFacts = { name: "Corrected display", categoryCode: "REVIEWED" };
 records.wasteSubmission = [row("reviewing", "UNDER_REVIEW"), row("changes", "CHANGES_REQUESTED"), row("draft", "DRAFT"), reviewed];
 assert.equal((await workspace.search(request({view:"drafts"}))).total, 1);
 assert.equal((await workspace.search(request({status:"PENDING"}))).total, 2);
 assert.equal((await workspace.search(request({q:"Corrected"}))).total, 1);
 assert.equal((await workspace.search(request({categoryCode:"DEVICE",status:"APPROVED"}))).total, 0);
 assert.equal((await workspace.search(request({q:"reviewed",status:"APPROVED"}))).total, 1); // stable code remains searchable
 assert.equal((await workspace.search(request({q:".*"}))).total, 0);
});
test("detail is independent of list pages and never exposes another owner's related asset", async () => {
 records.wasteSubmission = [row("SUB", "APPROVED"), row("OTHER", "APPROVED", "other")];
 records.wasteAsset = [asset("ASSET", "OWNED", "other")];
 const detail = await workspace.detail({...request(), code:"SUB"});
 assert.equal(detail.item.code,"SUB"); assert.equal(detail.relatedAsset,null);
 assert(!JSON.stringify(detail).includes("PRIVATE"));
 await assert.rejects(workspace.detail({...request(), code:"OTHER"}), {code:"ERR_WASTE_RECORD_NOT_FOUND"});
 await assert.rejects(workspace.detail({...request(), code:"ABSENT"}), {code:"ERR_WASTE_RECORD_NOT_FOUND"});
 records.wasteAsset[0].ownerRef.code = "owner";
 assert.equal((await workspace.detail({...request(), code:"SUB"})).relatedAsset.code,"ASSET");
});
test("action policy is backend-owned, preserves explicit zero and resumes exact listing terms", async () => {
 const record = asset("A");
 let result = workspace.item(record,"assets",{});
 assert.deepEqual(result.actions,[]); assert.equal(result.ownership.originalReward,0); assert.equal(result.ownership.illustrativeCarbonUnits,0);
 policy.marketplace = {autoPublishListings:true, transferPolicyCode:"CUSTOM_GIFT"};
 assert.deepEqual(workspace.item(record,"assets",{}).actions.map(a=>a.code),["LIST","GIFT"]);
 record.assetStatus = "LISTING_REQUESTED"; record.metadata.listingIdempotencyKey = "same-command"; record.metadata.listingRewardPrice = 12;
 result = workspace.item(record,"assets",{});
 assert.deepEqual(result.actions[0].command,{idempotencyKey:"same-command",rewardPrice:12});
 record.assetStatus = "LISTED"; record.metadata.marketProductCode = "PRODUCT";
 assert.deepEqual(workspace.item(record,"assets",{}).actions.map(a=>a.code),["OPEN_LISTING"]);
});
test("malformed query operators, owner overrides, invalid dates and excessive pages fail closed", async () => {
 for (const query of [{owner:"other"},{view:"wasteSubmission"},{q:{$ne:null}},{page:"1e2"},{limit:1000},{page:0},{sort:"arbitrary"},{dateFrom:"2026-02-30"},{dateFrom:"2026-09-10",dateTo:"2026-09-01"}]) await assert.rejects(workspace.search(request(query)), {code:"ERR_EWASTE_CUSTOMER_QUERY"});
 await assert.rejects(workspace.search({...request(),authData:{principalType:"employee",loginId:"staff"}}),{code:"ERR_WASTE_CUSTOMER_REQUIRED"});
});
test("later-layer labels and page defaults apply without changing owner scope", async () => {
 policy.customerWorkspace.defaultPageSize=2; policy.customerWorkspace.statuses.drafts[0].label="Saved progress";
 records.wasteSubmission = [row("1","DRAFT"),row("2","DRAFT"),row("3","DRAFT")];
 const result=await workspace.search(request({view:"drafts"}));
 assert.equal(result.items.length,2); assert.equal(result.statuses[0].label,"Saved progress");
});
test("unfinished submissions are partitioned before search, counts and pagination", async () => {
 const unfinished = policy.customerWorkspace.draftStates;
 records.wasteSubmission = [
  ...Array.from({length: 17}, (_, i) => row("draft-" + i, unfinished[i % unfinished.length])),
  row("foreign-draft", "DRAFT", "other"), row("pending"), row("approved", "APPROVED"), row("rejected", "REJECTED"),
 ];
 const main = await workspace.search(request());
 assert.equal(main.total, 3); assert(main.items.every(item => !unfinished.includes(item.status.code)));
 assert.equal(main.statuses.find(item => item.code === "ALL").count, 3);
 assert(!main.statuses.some(item => item.code === "DRAFT"));
 const drafts = await workspace.search(request({view:"drafts", page:2}));
 assert.equal(drafts.total,17); assert.equal(drafts.items.length,5);
 assert(drafts.items.every(item => item.resource === "submissions" && item.actions[0].code === "CONTINUE"));
 assert.equal(drafts.statuses.find(item => item.code === "ALL").count,17);
 assert.equal((await workspace.search(request({view:"drafts",status:"DRAFT"}))).total,5);
 assert.equal((await workspace.search(request({q:"draft"}))).total,0);
 assert.equal((await workspace.search(request({view:"drafts",q:"approved"}))).total,0);
 await assert.rejects(workspace.search(request({status:"DRAFT"})),{code:"ERR_EWASTE_CUSTOMER_QUERY"});
 assert.equal((await workspace.detail({...request(),code:"draft-0"})).item.actions[0].code,"CONTINUE");
});
test("final evidence guidance preserves the recorded flag without inviting another submission", () => {
 const record=row("final","APPROVED");
 const result=SERVICE.DefaultWasteItemDescriptorService.describe(record,{});
 assert.equal(result.evidenceReview.manualApprovalRequired,true);
 assert(!result.evidenceReview.customerMessage.includes("continue submitting"));
 assert(SERVICE.DefaultWasteItemDescriptorService.describe(row("draft","DRAFT"),{}).evidenceReview.customerMessage.includes("continue submitting"));
});

test("customer assessment pagination remains behind current asset ownership", async () => {
 records.wasteAsset.push(asset('OWNED'), asset('FOREIGN', 'OWNED', 'another'));
 const seen=[];
 SERVICE.DefaultWasteImpactAssessmentService={historyForAsset: async (req, record)=>{seen.push({page:req.query.page, code:record.code});return {page:Number(req.query.page),items:[]};}};
 const result=await workspace.detail({...request({view:'assets',assessmentPage:'2'}),code:'OWNED'});
 assert.equal(result.impactHistory.page,2);
 await assert.rejects(workspace.detail({...request({view:'assets',assessmentPage:'2'}),code:'FOREIGN'}),{code:'ERR_WASTE_RECORD_NOT_FOUND'});
 for(const query of [{view:'assets',assessmentPage:'0'},{view:'assets',assessmentPage:'abc'},{view:'submissions',assessmentPage:'2'},{view:'assets',provider:'other'}])await assert.rejects(workspace.detail({...request(query),code:'OWNED'}));
 assert.deepEqual(seen,[{page:'2',code:'OWNED'}]);
});
