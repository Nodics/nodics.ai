/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module eWaste/test/eWasteOutcomeDiagnostic @description Proves human-scoped exact-source diagnostic composition without delivery effects. @layer test @owner eWaste */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const experience = require("../src/service/defaultEWasteExperienceService");
const outcome = require("../src/service/defaultEWasteOutcomeCommunicationService");
const controller = require("../src/controller/defaultEWasteExperienceController");
const mapper = require("../src/service/defaultEWasteRequestService");

function fixture(t) {
  const previous = global.SERVICE;
  t.after(() => { global.SERVICE = previous; });
  const intentCode = "COMM_" + "a".repeat(64);
  const record = { code: "WST_TEST", revision: 5, submissionStatus: "REJECTED", metadata: {
    publicReason: "Unusable illustration", reviewBasis: "EVIDENCE_ONLY", outcomeDelivery: { intentCode, status: "UNCERTAIN", revision: 2 } } };
  const state = { calls: [], allowed: true, reads: 0, mutate: () => {}, response: {
    intentCode, status: "UNCERTAIN", revision: 2,
    diagnostic: { classification: "TRANSPORT_ACK_UNCONFIRMED", attempt: 1, message: "Transport acknowledgement is unconfirmed." },
  } };
  const access = {
    authorize: async (_r, permission) => { assert.equal(permission, "waste.review.queue.read"); if (!state.allowed) throw Error("denied"); },
    assertRecord: async (_r, permission, row) => { assert.equal(permission, "waste.review.queue.read"); assert.equal(row.code, record.code); },
  };
  const xp = { ...experience, settings: () => ({ outcomeCommunication: { connectionName: "communications" } }),
    resolveCustomer: async r => r,
    store: () => ({ one: async () => { state.reads++; return structuredClone(record); } }),
    remote: async (...args) => { state.calls.push(args); state.mutate(); return state.response; },
    finishReview: () => assert.fail("no settlement"), settle: () => assert.fail("no settlement"),
  };
  global.SERVICE = {
    DefaultEWasteExperienceService: xp, DefaultEWasteOutcomeCommunicationService: outcome,
    DefaultEWasteRequestService: mapper, DefaultWasteOperationalAccessService: access,
    DefaultWasteReviewWorkspaceService: { detail: async r => { await access.authorize(r, "waste.review.queue.read"); return structuredClone(record); } },
    DefaultWasteItemDescriptorService: { projectResponse: async data => data },
  };
  const request = { tenant: "test", authData: { tenant: "test", principalType: "human", loginId: "reviewer" },
    httpRequest: { params: { code: record.code }, body: { intentCode: "FORGED", sourceCode: "OTHER" } } };
  return { record, request, state };
}

test("actual human review-detail controller derives exact private source binding and exposes static diagnosis only", async t => {
  const f = fixture(t), before = structuredClone(f.record);
  const result = (await controller.reviewDetail(f.request)).data;
  assert.equal(result.notificationDiagnostic.classification, "TRANSPORT_ACK_UNCONFIRMED");
  assert.equal(f.state.calls.length, 1);
  const [input, moduleName, connection, path, method, body, authorization] = f.state.calls[0];
  assert.equal(input.authData, f.request.authData);
  assert.equal(moduleName, "commsApi"); assert.equal(connection, "communications");
  assert.equal(path, "/internal/communications/" + f.record.metadata.outcomeDelivery.intentCode + "/diagnostic");
  assert.equal(method, "POST"); assert.equal(authorization, undefined);
  assert.deepEqual(body, { sourceModule: "eWaste", sourceType: "wasteSubmission", sourceCode: "WST_TEST" });
  assert.deepEqual(f.record, before); assert.equal(f.state.reads, 2);
});

test("read denial and already-delivered state never request private diagnostics", async t => {
  const f = fixture(t); f.state.allowed = false;
  await assert.rejects(controller.reviewDetail(f.request), /denied/);
  f.state.allowed = true; f.record.metadata.outcomeDelivery.status = "DELIVERED";
  assert.equal((await controller.reviewDetail(f.request)).data.notificationDiagnostic, undefined);
  assert.equal(f.state.calls.length, 0);
});

for (const change of [
  f => { f.state.response.intentCode = "COMM_" + "b".repeat(64); },
  f => { f.state.response.revision = 1; },
  f => { f.state.response.diagnostic.classification = "PRIVATE"; },
  f => { f.state.response.diagnostic.message = "x".repeat(401); },
  f => { f.state.mutate = () => { f.record.revision++; }; },
  f => { f.state.mutate = () => { throw Error("PRIVATE provider exception"); }; },
]) test("unqualified or changing owner evidence remains unavailable without raw errors or delivery mutation", async t => {
  const f = fixture(t); change(f);
  const result = (await controller.reviewDetail(f.request)).data;
  assert.equal(result.notificationDiagnostic.classification, "DIAGNOSTIC_UNAVAILABLE");
  assert.equal(JSON.stringify(result).includes("PRIVATE"), false);
  assert.equal(result.metadata.outcomeDelivery.status, "UNCERTAIN");
  assert.equal(f.state.calls.length, 1);
});
