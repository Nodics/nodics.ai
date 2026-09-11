/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteVerification/test/wasteReviewWorkspace @description Proves scope-before-pagination, accurate counts, safe literal filters and revisioned assignment. @owner wasteVerification @layer test */
const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const workspace = require("../src/service/defaultWasteReviewWorkspaceService");
const verification = require("../src/service/defaultWasteVerificationOperationService");
const accessBase = require("../../wasteCore/src/service/defaultWasteOperationalAccessService");
const defaults = require("../config/properties").waste.reviewWorkspace;
let records, points, scopes, denied, access, writes;
function value(record, path) {
  return path.split(".").reduce((v, key) => v?.[key], record);
}
function matches(record, query) {
  return Object.entries(query).every(([key, condition]) => {
    if (key === "$and") return condition.every((q) => matches(record, q));
    if (key === "$or") return condition.some((q) => matches(record, q));
    if (key === "$nor") return !condition.some((q) => matches(record, q));
    const item = value(record, key);
    if (condition === null) return item == null;
    if (condition && typeof condition === "object")
      return Object.entries(condition).every(([operator, wanted]) =>
        operator === "$in"
          ? wanted.includes(item)
          : operator === "$exists"
            ? (item !== undefined) === wanted
            : operator === "$regex"
              ? new RegExp(wanted, condition.$options || "").test(
                  String(item ?? ""),
                )
              : operator === "$gte" ? item >= wanted : operator === "$lt" ? item < wanted : operator === "$options",
      );
    return item === condition;
  });
}
function request(changes = {}) {
  return {
    tenant: "t",
    authData: { principalType: "human", loginId: "reviewer", tenant: "t" },
    query: {},
    ...changes,
  };
}
function row(code, point = "allowed", status = "SUBMITTED") {
  return {
    code,
    revision: 1,
    submissionStatus: status,
    preferredCollectionPointCode: point,
    submitterRef: { code: "customer" },
    submittedFacts: { name: code, preferredCollectionPointCode: point },
    metadata: {
      origin: { subject: "private-recipient" },
      internalNote: "private",
    },
  };
}
beforeEach(() => {
  records = [];
  points = [
    { code: "allowed", operatorEnterpriseRef: { code: "operator" } },
    { code: "hidden", operatorEnterpriseRef: { code: "operator" } },
  ];
  scopes = [{ scopeType: "BUSINESS_UNIT", scopeCode: "allowed" }];
  denied = [];
  writes = [];
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code, message) {
        super(message || code);
        this.code = code;
      }
    },
  };
  global.CONFIG = {
    get: (key) =>
      key === "waste"
        ? {
            reviewWorkspace: defaults,
            operations: {
              maximumScopePoints: 10000,
              defaultReviewQueue: "REVIEW",
            },
          }
        : undefined,
  };
  access = {
    ...accessBase,
    context: async () => ({ scopes, deniedScopes: denied }),
    granted: () => true,
  };
  global.SERVICE = {
    DefaultWasteReviewWorkspaceService: workspace,
    DefaultWasteSubmissionOperationService: { facts: (facts) => facts },
    DefaultWasteItemDescriptorService: require("../../wasteMaterial/src/service/defaultWasteItemDescriptorService"),
    DefaultWasteOperationalAccessService: access,
    DefaultSecuredRequestPipelineService: { isPermissionGranted: () => true },
    DefaultWastePersistenceService: {
      fail: (code, message) => {
        throw new CLASSES.NodicsError(code, message);
      },
      revision: (record, expected) => {
        if (record.revision !== expected)
          throw new CLASSES.NodicsError("ERR_WASTE_REVISION_CONFLICT");
      },
      page: async (schema, req, query, page, limit) => {
        const selected = (
          schema === "wasteCollectionPoint" ? points : records
        ).filter((r) => matches(r, query));
        return {
          items: structuredClone(
            selected.slice((page - 1) * limit, page * limit),
          ),
          total: selected.length,
          page,
          limit,
        };
      },
      list: async (schema, req, query) =>
        points.filter((p) => matches(p, query)),
      one: async (schema, req, code) =>
        structuredClone(records.find((r) => r.code === code)),
      update: async (schema, req, current, patch) => {
        const row = records.find((r) => r.code === current.code);
        if (row.revision !== current.revision)
          throw new CLASSES.NodicsError("ERR_WASTE_REVISION_CONFLICT");
        Object.assign(row, patch, { revision: row.revision + 1 });
        writes.push(row.code);
        return structuredClone(row);
      },
    },
  };
});
test("scope applies before pagination and counts beyond the previous 500-record cap", async () => {
  records = [
    ...Array.from({ length: 650 }, (_, i) => row("hidden-" + i, "hidden")),
    ...Array.from({ length: 75 }, (_, i) => row("visible-" + i)),
    ...Array.from({ length: 9 }, (_, i) =>
      row("approved-" + i, "allowed", "APPROVED"),
    ),
    ...Array.from({ length: 6 }, (_, i) =>
      row("rejected-" + i, "allowed", "REJECTED"),
    ),
  ];
  const result = await workspace.search(
    request({ query: { page: 2, limit: 25 } }),
  );
  assert.equal(result.total, 75);
  assert.equal(result.items.length, 25);
  assert.equal(result.items[0].code, "visible-25");
  assert.deepEqual(result.counts, {
    SUBMITTED: 75,
    UNDER_REVIEW: 0,
    APPROVED: 9,
    REJECTED: 6,
    OPEN: 75,
    ALL: 90,
  });
  assert.equal(result.items[0].metadata.origin, undefined);
  assert.equal(result.items[0].metadata.internalNote, undefined);
});
test("enterprise allow with explicit point deny filters counts as well as records", async () => {
  scopes = [{ scopeType: "ENTERPRISE", scopeCode: "operator" }];
  denied = [{ scopeType: "BUSINESS_UNIT", scopeCode: "hidden" }];
  records = [row("one"), row("two", "hidden")];
  const result = await workspace.search(request());
  assert.equal(result.total, 1);
  assert.equal(result.counts.ALL, 1);
});
test("canonical point precedence prevents stale copied facts from widening access", async () => {
  const r = row("conflict", "hidden");
  r.submittedFacts.preferredCollectionPointCode = "allowed";
  records = [r, row("valid")];
  assert.deepEqual(
    (await workspace.search(request())).items.map((r) => r.code),
    ["valid"],
  );
});
test("deleted points cannot satisfy a point-scoped employee grant", async () => {
  points = [];
  records = [row("orphan")];
  assert.equal((await workspace.search(request())).total, 0);
});
test("all records and historical outcomes are reachable; literal search cannot inject regex", async () => {
  records = [
    row("one", "allowed", "APPROVED"),
    row("special.[x]", "allowed", "REJECTED"),
  ];
  assert.equal(
    (await workspace.search(request({ query: { status: "ALL" } }))).total,
    2,
  );
  const found = await workspace.search(
    request({ query: { status: "REJECTED", q: ".[x]" } }),
  );
  assert.equal(found.total, 1);
  assert.equal(found.items[0].code, "special.[x]");
});
test("invalid scalar filters and pagination fail without writes", async () => {
  for (const query of [
    { page: 0 },
    { page: true },
    { page: "2.5" },
    { limit: 101 },
    { q: { $gt: "" } },
    { status: "DRAFT" },
    { collectionPointCode: [] },
    { assignedToMe: "maybe" },
    { tenant: "other" },
  ])
    await assert.rejects(workspace.search(request({ query })), {
      code: "ERR_WASTE_REVIEW_QUERY",
    });
  assert.equal(writes.length, 0);
});
test("authorized claim is persisted and repeated command is idempotent; other employees cannot steal it", async () => {
  records = [row("one")];
  const r = request({
    code: "one",
    confirmed: true,
    expectedRevision: 1,
    idempotencyKey: "claim-one-1",
    payload: { action: "CLAIM" },
  });
  const result = await workspace.assign(r);
  assert.equal(result.metadata.reviewAssignment.principalCode, "reviewer");
  assert.equal(result.submissionStatus, "UNDER_REVIEW");
  await workspace.assign(r);
  assert.equal(writes.length, 1);
  await assert.rejects(
    workspace.assign({
      ...r,
      authData: { ...r.authData, loginId: "other" },
      expectedRevision: 2,
      idempotencyKey: "claim-other",
    }),
    { code: "ERR_WASTE_ASSIGNMENT_CONFLICT" },
  );
});
test("release and stale assignment use the generated revision boundary", async () => {
  records = [row("one")];
  await workspace.assign(
    request({
      code: "one",
      confirmed: true,
      expectedRevision: 1,
      idempotencyKey: "claim-one",
      payload: { action: "CLAIM" },
    }),
  );
  await assert.rejects(
    workspace.assign(
      request({
        code: "one",
        confirmed: true,
        expectedRevision: 1,
        idempotencyKey: "release-old",
        payload: { action: "RELEASE" },
      }),
    ),
    { code: "ERR_WASTE_REVISION_CONFLICT" },
  );
  const released = await workspace.assign(
    request({
      code: "one",
      confirmed: true,
      expectedRevision: 2,
      idempotencyKey: "release-new",
      payload: { action: "RELEASE" },
    }),
  );
  assert.equal(released.metadata.reviewAssignment.type, "QUEUE");
});

test("unclaimed verification and approval are rejected before any record is written", async () => {
  for (const assignment of [undefined, { type: "QUEUE", queueCode: "REVIEW" }]) {
    records = [row("one")];
    records[0].metadata.reviewAssignment = assignment;
    const command = request({ code: "one", confirmed: true, expectedRevision: 1, idempotencyKey: "unclaimed-review", payload: { decision: "REJECTED", reason: "Test review" } });
    await assert.rejects(verification.verify(command), { code: "ERR_WASTE_ASSIGNMENT_REQUIRED" });
    await assert.rejects(verification.review(command), { code: "ERR_WASTE_ASSIGNMENT_REQUIRED" });
    assert.equal(records[0].submissionStatus, "SUBMITTED");
    assert.equal(writes.length, 0);
  }
});

test("only the claimed reviewer may record facts; verification hands the record back to the queue", async () => {
  records = [row("one")];
  const command = request({ code: "one", confirmed: true, expectedRevision: 1, idempotencyKey: "claim-for-verification", payload: { action: "CLAIM" } });
  await workspace.assign(command);
  const confirm = { ...command, expectedRevision: 2, idempotencyKey: "confirm-verification", payload: { verifiedFacts: { name: "Checked item" } } };
  await assert.rejects(verification.verify({ ...confirm, authData: { ...confirm.authData, loginId: "other" } }), { code: "ERR_WASTE_ASSIGNMENT_CONFLICT" });
  assert.equal(writes.length, 1);
  SERVICE.DefaultWasteSubmissionOperationService = { facts: (facts) => facts };
  const service = { ...verification, validateCorrections: async () => {}, assessVerifiedFacts: async () => ({ calculationStatus: "PENDING" }), once: async (schema, req, model) => model };
  const result = await service.verify(confirm);
  assert.equal(result.submission.metadata.verifiedFacts.name, "Checked item");
  assert.equal(result.submission.metadata.reviewAssignment.type, "QUEUE");
  assert.equal(result.submission.submissionStatus, "UNDER_REVIEW");
  await service.verify(confirm);
  assert.equal(writes.length, 2);
  await assert.rejects(service.review({ ...confirm, expectedRevision: 3, payload: { decision: "REJECTED", reason: "Review decision" } }), { code: "ERR_WASTE_ASSIGNMENT_REQUIRED" });
  assert.equal(writes.length, 2);
});

test("release returns to read-only and duplicate release does not write again", async () => {
  records = [row("one")];
  const command = request({ code: "one", confirmed: true, expectedRevision: 1, idempotencyKey: "claim-release-guard", payload: { action: "CLAIM" } });
  await workspace.assign(command);
  const release = { ...command, expectedRevision: 2, idempotencyKey: "release-guard", payload: { action: "RELEASE" } };
  await workspace.assign(release);
  await workspace.assign(release);
  await assert.rejects(verification.verify({ ...command, expectedRevision: 3 }), { code: "ERR_WASTE_ASSIGNMENT_REQUIRED" });
  assert.equal(writes.length, 2);
});
test("customer and out-of-scope detail calls are denied", async () => {
  records = [row("one", "hidden")];
  await assert.rejects(workspace.detail(request({ code: "one" })), {
    code: "ERR_WASTE_REVIEW_FORBIDDEN",
  });
  await assert.rejects(
    workspace.search(
      request({ authData: { principalType: "customer", loginId: "customer" } }),
    ),
    { code: "ERR_WASTE_REVIEW_FORBIDDEN" },
  );
});

test("date, family, area and channel filters constrain exact counts before paging", async () => {
  const make=(code,point,at,channel,category)=>({...row(code,point),confirmedFacts:{name:code,categoryCode:category},metadata:{submittedAt:at,origin:{channel}}});
  records=[...Array.from({length:620},(_,i)=>make('in-'+i,'allowed','2026-09-10T10:00:00.000Z','TELEGRAM','CLOTHING')),make('earlier','allowed','2026-09-09T23:59:59.000Z','TELEGRAM','CLOTHING'),make('wrong-channel','allowed','2026-09-10T10:00:00.000Z','WEB','CLOTHING'),make('wrong-family','allowed','2026-09-10T10:00:00.000Z','TELEGRAM','DEVICES'),make('hidden','hidden','2026-09-10T10:00:00.000Z','TELEGRAM','CLOTHING')];
  const scoped={...workspace,choices:async()=>({centres:[{code:'allowed',city:'Dubai'}],unavailableSources:[]})};
  SERVICE.DefaultWasteItemDescriptorService={...SERVICE.DefaultWasteItemDescriptorService,catalogue:async()=>({categories:[{code:'CLOTHING',familyCode:'TEXTILES'}]})};
  const result=await scoped.search(request({query:{dateFrom:'2026-09-10',dateTo:'2026-09-10',channel:'TELEGRAM',familyCode:'TEXTILES',area:'Dubai',page:2,limit:25}}));
  assert.equal(result.total,620);assert.equal(result.counts.ALL,620);assert.equal(result.items.length,25);assert.equal(result.items[0].code,'in-25');
});
test("reviewed classification takes precedence over stale confirmed and submitted copies",async()=>{
  records=[{...row('reclassified'),confirmedFacts:{categoryCode:'CLOTHING'},metadata:{reviewedFacts:{categoryCode:'DEVICES'}}}];
  const result=await workspace.search(request({query:{categoryCode:'CLOTHING'}}));assert.equal(result.total,0);
});
test("invalid calendar dates, reversed ranges, nested filters and unknown channels fail closed",()=>{
  for(const query of [{dateFrom:'2026-02-30'},{dateFrom:'2026-10-01',dateTo:'2026-09-01'},{familyCode:{$ne:null}},{channel:'SMS'},{dashboard:'anything'}]) assert.throws(()=>workspace.filters(query),{code:'ERR_WASTE_REVIEW_QUERY'});
});
test("trend buckets count the exact scoped population without a capped client scan",async()=>{
  records=[...Array.from({length:701},(_,i)=>({...row('visible-'+i),metadata:{submittedAt:'2026-09-10T12:00:00.000Z'}})),{...row('hidden','hidden'),metadata:{submittedAt:'2026-09-10T12:00:00.000Z'}}];
  const scope=await access.scopeQuery(request(),'waste.review.queue.read');
  const trend=await workspace.trend(request(),[scope],{dateFrom:'2026-09-10',dateTo:'2026-09-10',status:'ALL'});
  assert.equal(trend.length,6);assert.equal(trend.reduce((sum,bucket)=>sum+bucket.count,0),701);
});


test('module-owned view keys bind family and queue semantics without route inference', () => {
  const settings={...defaults,views:{
    ...require('../../wasteCore/config/properties').waste.reviewWorkspace.views,
    'sample.overview':{ownerModule:'sampleWaste',mode:'OVERVIEW',familyCode:'SAMPLE'},
    'sample.queue':{ownerModule:'sampleWaste',mode:'REVIEW_QUEUE',familyCode:'SAMPLE'}
  }};
  const target={...workspace,settings:()=>settings};
  assert.equal(target.filters({viewCode:'waste.submissions'}).status,'ALL');
  assert.equal(target.filters({viewCode:'sample.overview'}).familyCode,'SAMPLE');
  assert.equal(target.filters({viewCode:'sample.queue'}).status,'OPEN');
  for(const query of [{viewCode:'missing'},{viewCode:'constructor'},{viewCode:'sample.queue',status:'APPROVED'},{viewCode:'sample.queue',familyCode:'OTHER'}]) assert.throws(()=>target.filters(query),error=>error.code==='ERR_WASTE_REVIEW_QUERY');
  assert.equal(JSON.stringify(require('../config/properties')).includes('Electronics'),false);
});
