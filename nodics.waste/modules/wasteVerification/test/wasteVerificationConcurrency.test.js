/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module wasteVerification/test/wasteVerificationConcurrency @description Exercises real verification/rejection owners with isolated revision-CAS storage, both interleavings and frozen-command recovery. @owner wasteVerification @layer test */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const base = require("../src/service/defaultWasteVerificationOperationService");
const rejection = require("../src/service/defaultWasteEvidenceRejectionService");
const workspace = require("../src/service/defaultWasteReviewWorkspaceService");
/** Creates only synthetic storage; gates model an in-flight calculation or failed audit acknowledgement. */
function fixture(t) {
  const previous = global.SERVICE;
  t.after(() => { global.SERVICE = previous; });
  const source = { code: "SUB_TEST", revision: 3, submissionStatus: "UNDER_REVIEW",
    submittedFacts: { name: "Item", quantity: 1, preferredCollectionPointCode: "POINT" },
    metadata: { photo: { code: "PHOTO" }, reviewAssignment: { type: "EMPLOYEE", principalCode: "reviewer" } } };
  const records = new Map([["wasteSubmission:SUB_TEST", structuredClone(source)]]);
  const state = { hook: async () => {}, calculations: 0, writes: [] };
  const fail = code => { throw Object.assign(new Error(code), { code }); };
  const store = { fail,
    one: async (s, r, c) => structuredClone(records.get(s + ":" + c)),
    list: async (s, r, q, limit) => [...records.entries()].filter(([k,v]) => k.startsWith(s + ":") &&
      Object.entries(q).every(([a,b]) => v[a] === b)).map(([,v]) => structuredClone(v)).slice(0, limit),
    revision: (r, expected) => { if (r.revision !== expected) fail("ERR_WASTE_REVISION_CONFLICT"); },
    create: async (s, r, m) => { await state.hook("create", s, m); records.set(s + ":" + m.code, structuredClone(m)); state.writes.push(s); await state.hook("create-ack", s, m); return structuredClone(m); },
    update: async (s, r, current, patch) => {
      await state.hook("update", s, patch);
      store.revision(records.get(s + ":" + current.code), current.revision);
      const next = { ...current, ...patch, revision: current.revision + 1 };
      records.set(s + ":" + current.code, structuredClone(next)); state.writes.push(s); return structuredClone(next);
    },
  };
  const verification = { ...base, validateCorrections: async () => {},
    assessVerifiedFacts: async () => { state.calculations++; await state.hook("calculate"); return { calculationStatus: "ESTIMATED" }; } };
  global.SERVICE = { DefaultWastePersistenceService: store, DefaultWasteVerificationOperationService: verification,
    DefaultWasteEvidenceRejectionService: rejection, DefaultWasteReviewWorkspaceService: workspace,
    DefaultWasteOperationalAccessService: { authorize: async () => {}, assertRecord: async () => {},
      granted: () => true,
      pointCode: () => "POINT", settings: () => ({ defaultReviewQueue: "queue" }) },
    DefaultWasteItemDescriptorService: { evidenceReview: () => ({}) },
    DefaultWasteSubmissionOperationService: { facts: v => v } };
  const request = { code: source.code, tenant: "test", authData: { tenant: "test", principalType: "human", loginId: "reviewer" },
    confirmed: true, expectedRevision: 3, idempotencyKey: "verification-key", payload: { verifiedFacts: { name: "Inspected item" } } };
  return { records, store, state, request, verification,
    reject: () => rejection.reject({ ...request, idempotencyKey: "rejection-key", payload: { reason: "Unusable evidence" } }) };
}

test("rejection wins during read-only calculation: losing verifier writes no physical audit", async t => {
  const f = fixture(t);
  let entered, release;
  const started = new Promise(resolve => { entered = resolve; });
  const gate = new Promise(resolve => { release = resolve; });
  f.state.hook = async stage => { if (stage === "calculate") { entered(); await gate; } };
  const pending = f.verification.verify(f.request);
  const refused = assert.rejects(pending, { code: "ERR_WASTE_REVISION_CONFLICT" });
  await started;
  assert.equal((await f.reject()).submission.submissionStatus, "REJECTED");
  release(); await refused;
  const audits = [...f.records.entries()].filter(([key]) => key.startsWith("wasteVerification:")).map(([,row]) => row);
  assert.deepEqual(audits.map(row => row.verificationStatus), ["REJECTED"]);
  assert.equal((await f.reject()).replayed, true);
});

for (const stage of ["create", "create-ack", "completion"]) test("verification checkpoint blocks rejection and resumes failed " + stage + " without recalculation", async t => {
  const f = fixture(t);
  f.state.hook = async (operation, schema, model) => {
    if (operation === stage || stage === "completion" && operation === "update" && model.metadata.verificationPending === null)
      throw Error("storage interrupted");
  };
  await assert.rejects(f.verification.verify(f.request), /storage interrupted/);
  const current = f.records.get("wasteSubmission:SUB_TEST");
  assert.equal(current.metadata.verificationPending.facts.name, "Inspected item");
  await assert.rejects(f.reject(), { code: "ERR_WASTE_REVIEW_CONFLICT" });
  await assert.rejects(workspace.assign({ ...f.request, expectedRevision: current.revision,
    payload: { action: "RELEASE" } }), { code: "ERR_WASTE_REVIEW_QUERY" });
  await assert.rejects(f.verification.review({ ...f.request, expectedRevision: current.revision,
    payload: { decision: "REJECTED", reason: "Another decision" } }), { code: "ERR_WASTE_REVIEW_CONFLICT" });
  const resume = { ...f.request, expectedRevision: current.revision, payload: { resumeVerification: true } };
  await assert.rejects(f.verification.verify({ ...resume, authData: { ...resume.authData, loginId: "other" } }), { code: "ERR_WASTE_ASSIGNMENT_CONFLICT" });
  await assert.rejects(f.verification.verify({ ...resume, payload: { resumeVerification: true, verifiedFacts: {} } }), { code: "ERR_WASTE_REVIEW_CONFLICT" });
  await assert.rejects(f.verification.verify({ ...resume, expectedRevision: 2 }), { code: "ERR_WASTE_REVISION_CONFLICT" });
  f.state.hook = async () => {};
  const result = await f.verification.verify(resume);
  assert.equal(result.submission.metadata.verificationPending, null);
  assert.equal(result.submission.metadata.verifiedFacts.name, "Inspected item");
  assert.equal(f.state.calculations, 1);
  assert.equal([...f.records.keys()].filter(key => key.startsWith("wasteVerification:")).length, 1);
  const writes = f.state.writes.length;
  await f.verification.verify(f.request);
  assert.equal(f.state.writes.length, writes);
});

test("verification wins after rejection absence checks: stale rejection cannot persist its claim or audit", async t => {
  const f = fixture(t);
  let entered, release;
  const started = new Promise(resolve => { entered = resolve; });
  const gate = new Promise(resolve => { release = resolve; });
  f.state.hook = async (stage, _schema, model) => {
    if (stage === "update" && model.metadata.reviewBasis === "EVIDENCE_ONLY") { entered(); await gate; }
  };
  const pending = f.reject();
  const refused = assert.rejects(pending, { code: "ERR_WASTE_REVISION_CONFLICT" });
  await started;
  await f.verification.verify(f.request);
  release(); await refused;
  const audits = [...f.records.entries()].filter(([key]) => key.startsWith("wasteVerification:")).map(([,row]) => row);
  assert.deepEqual(audits.map(row => row.verificationStatus), ["VERIFIED"]);
  assert.equal(f.records.get("wasteSubmission:SUB_TEST").metadata.reviewBasis, undefined);
});
