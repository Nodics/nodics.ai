/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module wasteVerification/test/wasteEvidenceRejection @description Proves evidence-only decision admission, immutable audit, recovery and zero physical/financial effects using isolated repositories. @layer test @owner wasteVerification */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const rejection = require("../src/service/defaultWasteEvidenceRejectionService");
const verification = require("../src/service/defaultWasteVerificationOperationService");
const workspace = require("../src/service/defaultWasteReviewWorkspaceService");

function fixture(t) {
  const previous = global.SERVICE;
  t.after(() => { if (previous === undefined) delete global.SERVICE; else global.SERVICE = previous; });
  const source = { code: "SUB_ARTWORK", revision: 3, submissionStatus: "UNDER_REVIEW",
    submittedFacts: { name: "Illustration", quantity: 1 }, confirmedFacts: { name: "Illustration", quantity: 1 },
    evidenceRefs: [{ module: "media", schema: "media", code: "ARTWORK" }],
    metadata: { photo: { code: "ARTWORK" }, evidenceReview: { manualApprovalRequired: true },
      reviewAssignment: { type: "EMPLOYEE", principalCode: "reviewer" } } };
  const records = new Map([["wasteSubmission:SUB_ARTWORK", source]]);
  const state = { writes: [], reads: [], deny: false, outOfScope: false, hook: () => {} };
  const fail = (code, message) => { const error = new Error(message); error.code = code; throw error; };
  const store = {
    fail,
    one: async (schema, _req, code) => structuredClone(records.get(schema + ":" + code)),
    list: async (schema, _req, query, limit) => {
      state.reads.push({ schema, query, limit });
      const rows = [...records.entries()].filter(([key, row]) => key.startsWith(schema + ":") &&
        Object.entries(query).every(([key, value]) => row[key] === value)).map(([, row]) => structuredClone(row)).slice(0, limit);
      await state.hook("read", schema, rows);
      return rows;
    },
    revision: (record, expected) => { if (record.revision !== expected) fail("ERR_WASTE_REVISION_CONFLICT", "Stale revision"); },
    create: async (schema, _req, model) => {
      await state.hook("create", schema, model);
      assert.equal(schema, "wasteVerification");
      assert.equal(model.verificationStatus, "REJECTED");
      records.set(schema + ":" + model.code, structuredClone(model));
      state.writes.push({ schema, model: structuredClone(model) });
      return structuredClone(model);
    },
    update: async (schema, _req, current, patch) => {
      await state.hook("update", schema, patch);
      assert.equal(schema, "wasteSubmission");
      store.revision(records.get(schema + ":" + current.code), current.revision);
      const next = { ...current, ...patch, revision: current.revision + 1 };
      records.set(schema + ":" + current.code, structuredClone(next));
      state.writes.push({ schema, model: structuredClone(next) });
      return structuredClone(next);
    },
  };
  global.SERVICE = {
    DefaultWastePersistenceService: store,
    DefaultWasteVerificationOperationService: verification,
    DefaultWasteEvidenceRejectionService: rejection,
    DefaultWasteReviewWorkspaceService: workspace,
    DefaultWasteOperationalAccessService: {
      granted: () => !state.deny,
      visible: async (_request, permission, rows) => {
        assert.equal(permission, "waste.review.approve");
        return state.outOfScope ? [] : rows;
      },
      authorize: async (_request, permission) => {
        assert.equal(permission, "waste.review.approve");
        if (state.deny) fail("ERR_WASTE_REVIEW_FORBIDDEN", "No grant");
      },
      assertRecord: async (_request, permission) => {
        assert.equal(permission, "waste.review.approve");
        if (state.outOfScope) fail("ERR_WASTE_REVIEW_FORBIDDEN", "No scope");
      },
    },
  };
  const request = { code: source.code, tenant: "test", authData: { tenant: "test", principalType: "human", loginId: "reviewer" },
    expectedRevision: 3, confirmed: true, idempotencyKey: "evidence-rejection-1",
    payload: { reason: "The artwork is not usable physical-item evidence." } };
  return { source, records, state, request, store };
}

test("rejects evidence with immutable reason/audit and no verified facts, asset, impact or custody writes; exact replay is read-only", async t => {
  const f = fixture(t), before = structuredClone(f.source);
  const result = await verification.rejectEvidence(f.request);
  assert.equal(result.decisionBasis, "EVIDENCE_ONLY");
  assert.equal(result.submission.submissionStatus, "REJECTED");
  assert.equal(result.asset, undefined);
  for (const field of ["submittedFacts", "confirmedFacts", "evidenceRefs"])
    assert.deepEqual(result.submission[field], before[field]);
  for (const field of ["photo", "evidenceReview"])
    assert.deepEqual(result.submission.metadata[field], before.metadata[field]);
  assert.equal(result.submission.metadata.verifiedFacts, undefined);
  assert.equal(result.submission.metadata.approvedBy, undefined);
  assert.equal(result.submission.metadata.preApprovalVerificationRef, undefined);
  const audit = f.records.get("wasteVerification:SUB_ARTWORK_REVIEW");
  assert.equal(audit.verificationStatus, "REJECTED");
  assert.equal(audit.verifiedFacts, undefined);
  assert.equal(audit.publicReason, f.request.payload.reason);
  assert.equal(audit.metadata.reviewBasis, "EVIDENCE_ONLY");
  assert.equal(audit.verifiedBy.code, "reviewer");
  assert.deepEqual(f.state.writes.map(row => row.schema), ["wasteSubmission", "wasteVerification", "wasteSubmission"]);
  assert.equal((await verification.rejectEvidence(f.request)).replayed, true);
  assert.equal(f.state.writes.length, 3);
  await assert.rejects(verification.review({ ...f.request, payload: { decision: "REJECTED", reason: f.request.payload.reason } }), { code: "ERR_WASTE_REVIEW_CONFLICT" });
});

const denials = [
  ["permission", f => { f.state.deny = true; }, "ERR_WASTE_REVIEW_FORBIDDEN"],
  ["scope", f => { f.state.outOfScope = true; }, "ERR_WASTE_REVIEW_FORBIDDEN"],
  ["service actor", f => { f.request.authData.principalType = "service"; }, "ERR_WASTE_MANUAL_APPROVAL_REQUIRED"],
  ["unclaimed", f => { delete f.source.metadata.reviewAssignment; }, "ERR_WASTE_ASSIGNMENT_REQUIRED"],
  ["another assignee", f => { f.source.metadata.reviewAssignment.principalCode = "other"; }, "ERR_WASTE_ASSIGNMENT_CONFLICT"],
  ["stale revision", f => { f.request.expectedRevision = 2; }, "ERR_WASTE_REVISION_CONFLICT"],
  ["missing confirmation", f => { f.request.confirmed = false; }, "ERR_WASTE_REVIEW_CONFIRMATION_REQUIRED"],
  ["missing key", f => { delete f.request.idempotencyKey; }, "ERR_WASTE_IDEMPOTENCY_REQUIRED"],
  ["empty reason", f => { f.request.payload.reason = " "; }, "ERR_WASTE_REVIEW_REASON_REQUIRED"],
  ["oversize reason", f => { f.request.payload.reason = "a".repeat(1001); }, "ERR_WASTE_REVIEW_REASON_REQUIRED"],
  ["verified facts input", f => { f.request.payload.verifiedFacts = {}; }, "ERR_WASTE_INPUT_INVALID"],
  ["approval input", f => { f.request.payload.evidenceReviewed = true; }, "ERR_WASTE_INPUT_INVALID"],
  ["media replacement", f => { f.request.payload.photo = { code: "OTHER" }; }, "ERR_WASTE_INPUT_INVALID"],
  ["approved submission", f => { f.source.submissionStatus = "APPROVED"; }],
  ["inactive submission", f => { f.source.active = false; }],
  ["verification reference", f => { f.source.metadata.preApprovalVerificationRef = { code: "existing" }; }],
  ["verified facts", f => { f.source.metadata.verifiedFacts = {}; }],
  ["physical impact reference", f => { f.source.impactRef = { code: "PHYSICAL_IMPACT" }; }],
  ["approval acknowledgement", f => { f.source.metadata.manualEvidenceApproval = {}; }],
  ["different pending decision", f => { f.source.metadata.reviewDecision = "APPROVED"; }],
  ["no media", f => { delete f.source.metadata.photo; }],
  ["tenant mismatch", f => { f.source.tenant = "other"; }],
  ["caller tenant mismatch", f => { f.request.tenant = "other"; }],
  ["associated asset", f => { f.records.set("wasteAsset:asset", { code: "asset", sourceSubmissionCode: f.source.code }); }],
  ["inactive associated asset", f => { f.records.set("wasteAsset:asset", { code: "asset", sourceSubmissionCode: f.source.code, active: false }); }],
  ["orphan approval audit", f => { f.records.set("wasteVerification:review", { code: "review", submissionCode: f.source.code, verificationStatus: "APPROVED" }); }],
  ["orphan verification audit", f => { f.records.set("wasteVerification:review", { code: "review", submissionCode: f.source.code, verificationStatus: "VERIFIED" }); }],
];
for (const [label, change, code = "ERR_WASTE_REVIEW_CONFLICT"] of denials) {
  test("denies " + label + " without writes", async t => {
    const f = fixture(t); change(f);
    const before = structuredClone([...f.records]);
    await assert.rejects(verification.rejectEvidence(f.request), { code });
    assert.equal(f.state.writes.length, 0);
    assert.deepEqual([...f.records], before);
  });
}

test("advisory submission assessment remains eligible and is preserved without becoming verified impact", async t => {
  const f = fixture(t);
  f.source.metadata.estimate = { code: "ADVISORY", sourceRef: { module: "wasteSubmission", schema: "wasteSubmission", code: f.source.code }, co2eSavedKg: 1 };
  const estimate = structuredClone(f.source.metadata.estimate);
  assert.equal(await rejection.available(f.request, f.source), true);
  const result = await rejection.reject(f.request);
  assert.deepEqual(result.submission.metadata.estimate, estimate);
  assert.equal(result.submission.impactRef, undefined);
  assert.equal(result.submission.metadata.verifiedEstimate, undefined);
});

test("availability is scoped to the assigned human and fails closed on unavailable or existing owner evidence", async t => {
  const f = fixture(t);
  assert.equal(await rejection.available(f.request, f.source), true);
  assert.equal(await rejection.available({ ...f.request, authData: { ...f.request.authData, loginId: "other" } }, f.source), false);
  assert.equal(await rejection.available({ ...f.request, authData: { ...f.request.authData, principalType: "service" } }, f.source), false);
  f.state.deny = true;
  assert.equal(await rejection.available(f.request, f.source), false);
  f.state.deny = false; f.state.outOfScope = true;
  assert.equal(await rejection.available(f.request, f.source), false);
  f.state.outOfScope = false;
  f.records.set("wasteAsset:asset", { code: "asset", sourceSubmissionCode: f.source.code });
  assert.equal(await rejection.available(f.request, f.source), false);
  f.records.delete("wasteAsset:asset");
  f.state.hook = () => { throw Error("owner unavailable"); };
  assert.equal(await rejection.available(f.request, f.source), false);
  assert.equal(f.state.writes.length, 0);
});

for (const stage of ["audit", "completion"]) {
  test("recovers interrupted " + stage + " only with the original actor, key, reason and evidence", async t => {
    const f = fixture(t);
    f.state.hook = (operation, schema, model) => {
      if ((stage === "audit" && operation === "create") ||
        (stage === "completion" && operation === "update" && model.submissionStatus === "REJECTED")) throw Error("interrupted");
    };
    await assert.rejects(verification.rejectEvidence(f.request), /interrupted/);
    f.state.hook = () => {};
    const pending = f.records.get("wasteSubmission:SUB_ARTWORK");
    assert.equal(pending.metadata.reviewBasis, "EVIDENCE_ONLY");
    const writes = f.state.writes.length;
    await assert.rejects(verification.rejectEvidence({ ...f.request, payload: { reason: "Changed reason" } }), { code: "ERR_WASTE_REVIEW_CONFLICT" });
    await assert.rejects(verification.rejectEvidence({ ...f.request, authData: { ...f.request.authData, loginId: "other" } }), { code: "ERR_WASTE_ASSIGNMENT_CONFLICT" });
    assert.equal(f.state.writes.length, writes);
    const result = await verification.recoverReview({ ...f.request, expectedRevision: pending.revision });
    assert.equal(result.submission.submissionStatus, "REJECTED");
    assert.equal(result.decisionBasis, "EVIDENCE_ONLY");
    assert.equal(f.state.writes.length, 3);
  });
}

test("unavailable owner absence checks fail closed before any write", async t => {
  const f = fixture(t);
  f.state.hook = () => { throw Error("read unavailable"); };
  await assert.rejects(verification.rejectEvidence(f.request), /read unavailable/);
  assert.equal(f.state.writes.length, 0);
});

test("changed retained media blocks recovery without replacing the original decision", async t => {
  const f = fixture(t);
  f.state.hook = operation => { if (operation === "create") throw Error("interrupted"); };
  await assert.rejects(verification.rejectEvidence(f.request), /interrupted/);
  f.state.hook = () => {};
  f.records.get("wasteSubmission:SUB_ARTWORK").metadata.photo.code = "OTHER";
  const writes = f.state.writes.length;
  await assert.rejects(verification.rejectEvidence(f.request), { code: "ERR_WASTE_REVIEW_CONFLICT" });
  assert.equal(f.state.writes.length, writes);
});
