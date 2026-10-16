/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module eWaste/test/eWasteEvidenceRejection @description Exercises HTTP-shaped evidence-rejection mapping and notification-only recovery without provider or reward effects. @layer test @owner eWaste */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const experience = require("../src/service/defaultEWasteExperienceService");
const controller = require("../src/controller/defaultEWasteExperienceController");
const mapper = require("../src/service/defaultEWasteRequestService");
const routes = require("../src/router/routers");
const rejection = require("../../../../../../nodics.waste/modules/wasteVerification/src/service/defaultWasteEvidenceRejectionService");
const verification = require("../../../../../../nodics.waste/modules/wasteVerification/src/service/defaultWasteVerificationOperationService");
const workspace = require("../../../../../../nodics.waste/modules/wasteVerification/src/service/defaultWasteReviewWorkspaceService");

function fixture(t) {
  const previous = global.SERVICE;
  t.after(() => { if (previous === undefined) delete global.SERVICE; else global.SERVICE = previous; });
  const request = { tenant: "untrusted", authData: { tenant: "test", principalType: "human", loginId: "assigned-reviewer" },
    httpRequest: { params: { code: "SUB_ARTWORK" }, headers: { authorization: "Bearer original" },
      body: { expectedRevision: 3, confirmed: true, idempotencyKey: "reject-artwork", reason: "Not usable evidence" } } };
  const state = { owner: [], notices: 0, failDelivery: false };
  const result = () => ({ decisionBasis: "EVIDENCE_ONLY", submission: {
    code: "SUB_ARTWORK", revision: 5, submissionStatus: "REJECTED",
    metadata: { reviewBasis: "EVIDENCE_ONLY", reviewKey: "reject-artwork", publicReason: "Not usable evidence" },
  } });
  const xp = { ...experience, settings: () => ({}), resolveCustomer: async input => input,
    finishReview: () => assert.fail("Reward orchestration must not run"),
    settle: () => assert.fail("Settlement must not run"),
  };
  global.SERVICE = {
    DefaultEWasteExperienceService: xp, DefaultEWasteRequestService: mapper,
    DefaultWasteVerificationOperationService: {
      rejectEvidence: async input => { state.owner.push(input); return result(); },
      recoverReview: async input => { state.owner.push(input); return result(); },
    },
    DefaultWasteItemDescriptorService: { projectResponse: async data => data },
    DefaultEWasteOutcomeCommunicationService: { notify: async (_input, submission) => {
      state.notices++; assert.equal(submission.submissionStatus, "REJECTED");
      assert.equal(submission.metadata.publicReason, "Not usable evidence");
      if (state.failDelivery) throw Error("notification unavailable");
      return submission;
    } },
  };
  return { request, state, xp };
}

test("dedicated secured route retains existing rejection permission and canonical controller mapping", async t => {
  const f = fixture(t), route = routes.eWaste.reviewWorkspace.evidenceRejection;
  assert.equal(route.key, "/review-workspace/:code/evidence-rejection");
  assert.equal(route.permission, "waste.review.approve");
  assert.equal(route.method, "POST");
  assert.equal(route.secured, true);
  assert.deepEqual(route.authTokenTypes, ["access"]);
  assert.equal(route.cache.enabled, false);
  const response = await controller.rejectEvidence(f.request);
  assert.equal(response.data.decisionBasis, "EVIDENCE_ONLY");
  assert.equal(f.state.notices, 1);
  assert.equal(f.state.owner.length, 1);
  assert.equal(f.state.owner[0].tenant, "test");
  assert.equal(f.state.owner[0].code, "SUB_ARTWORK");
  assert.equal(f.state.owner[0].authData, f.request.authData);
  assert.equal(f.state.owner[0].authorization, "Bearer original");
  assert.deepEqual(f.state.owner[0].payload, f.request.httpRequest.body);
});

test("owner refusal never invokes notification or reward orchestration", async t => {
  const f = fixture(t);
  SERVICE.DefaultWasteVerificationOperationService.rejectEvidence = async () => { throw Error("Owner denied"); };
  await assert.rejects(controller.rejectEvidence(f.request), /Owner denied/);
  assert.equal(f.state.notices, 0);
});

test("recorded evidence-only recovery remains notification-only", async t => {
  const f = fixture(t);
  const response = await controller.reviewRecovery(f.request);
  assert.equal(response.data.decisionBasis, "EVIDENCE_ONLY");
  assert.equal(f.state.notices, 1);
});

test("notification outage preserves rejection without reward recovery or an invented delivery result", async t => {
  const f = fixture(t); f.state.failDelivery = true;
  const response = await controller.rejectEvidence(f.request);
  assert.equal(response.data.submission.submissionStatus, "REJECTED");
  assert.equal(response.data.notificationStatus, "PENDING");
  assert.equal(response.data.asset, undefined);
  assert.equal(response.data.settlementStatus, undefined);
  assert.equal(f.state.notices, 1);
});

/** Uses the real command owner behind the HTTP controller; the isolated store admits only rejection writes. */
function canonicalFixture(t) {
  const f = fixture(t);
  const records = new Map([["wasteSubmission:SUB_ARTWORK", {
    code: "SUB_ARTWORK", revision: 3, submissionStatus: "SUBMITTED",
    submittedFacts: { name: "Illustration" }, evidenceRefs: [{ code: "ARTWORK" }],
    metadata: { photo: { code: "ARTWORK" }, estimate: { code: "ADVISORY" },
      reviewAssignment: { type: "EMPLOYEE", principalCode: "assigned-reviewer" } },
  }]]);
  const writes = [], reads = [];
  const fail = (code, message) => { throw Object.assign(new Error(message), { code }); };
  const store = {
    fail,
    one: async (schema, _request, code) => { reads.push(schema); return structuredClone(records.get(schema + ":" + code)); },
    list: async (schema, _request, query, limit) => [...records.entries()]
      .filter(([key, row]) => key.startsWith(schema + ":") && Object.entries(query).every(([key, value]) => row[key] === value))
      .slice(0, limit).map(([, row]) => structuredClone(row)),
    revision: (row, revision) => { if (row.revision !== revision) fail("ERR_WASTE_REVISION_CONFLICT", "Changed revision"); },
    create: async (schema, _request, row) => {
      assert.equal(schema, "wasteVerification"); assert.equal(row.verificationStatus, "REJECTED");
      writes.push(schema); records.set(schema + ":" + row.code, structuredClone(row)); return structuredClone(row);
    },
    update: async (schema, _request, current, patch) => {
      assert.equal(schema, "wasteSubmission"); store.revision(records.get(schema + ":" + current.code), current.revision);
      const row = { ...current, ...patch, revision: current.revision + 1 };
      writes.push(schema); records.set(schema + ":" + row.code, structuredClone(row)); return structuredClone(row);
    },
  };
  Object.assign(SERVICE, {
    DefaultWastePersistenceService: store, DefaultWasteEvidenceRejectionService: rejection,
    DefaultWasteReviewWorkspaceService: workspace, DefaultWasteVerificationOperationService: verification,
    DefaultWasteOperationalAccessService: {
      authorize: async (_request, permission) => assert.equal(permission, "waste.review.approve"),
      assertRecord: async (_request, permission) => assert.equal(permission, "waste.review.approve"),
    },
  });
  return { ...f, records, writes, reads };
}

test("real HTTP controller, mapper and rejection owner accept exact command controls and preserve advisory evidence", async t => {
  const f = canonicalFixture(t);
  f.request.httpRequest.headers["idempotency-key"] = f.request.httpRequest.body.idempotencyKey;
  const result = (await controller.rejectEvidence(f.request)).data;
  assert.equal(result.submission.submissionStatus, "REJECTED");
  assert.equal(result.submission.metadata.estimate.code, "ADVISORY");
  assert.equal(result.submission.impactRef, undefined);
  assert.deepEqual(f.writes, ["wasteSubmission", "wasteVerification", "wasteSubmission"]);
  assert.equal(f.state.notices, 1);
});

for (const field of ["decision", "verifiedFacts", "submittedFacts", "confirmedFacts", "photo", "evidenceRefs", "evidenceReviewed", "tenant", "authData", "reviewBasis", "approvedBy", "serviceName"]) {
  test("real HTTP rejection refuses caller-controlled " + field + " before owner reads or writes", async t => {
    const f = canonicalFixture(t);
    f.request.httpRequest.body[field] = {};
    await assert.rejects(controller.rejectEvidence(f.request), { code: "ERR_WASTE_INPUT_INVALID" });
    assert.deepEqual(f.reads, []); assert.deepEqual(f.writes, []); assert.equal(f.state.notices, 0);
  });
}

for (const [name, mutate, code] of [
  ["conflicting body and header key", http => { http.headers["idempotency-key"] = "different-command"; }, "ERR_WASTE_INPUT_INVALID"],
  ["string confirmation", http => { http.body.confirmed = "true"; }, "ERR_WASTE_REVIEW_CONFIRMATION_REQUIRED"],
  ["string revision", http => { http.body.expectedRevision = "3"; }, "ERR_WASTE_REVISION_CONFLICT"],
  ["array body", http => { http.body = []; }, "ERR_WASTE_INPUT_INVALID"],
]) {
  test("real HTTP rejection refuses " + name, async t => {
    const f = canonicalFixture(t); mutate(f.request.httpRequest);
    await assert.rejects(controller.rejectEvidence(f.request), { code });
    assert.deepEqual(f.reads, []); assert.deepEqual(f.writes, []); assert.equal(f.state.notices, 0);
  });
}
