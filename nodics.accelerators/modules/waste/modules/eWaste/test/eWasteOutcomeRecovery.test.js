/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module eWaste/test/eWasteOutcomeRecovery @description Exercises partial-commit recovery through the real Communication HTTP controller, source facade and revision-fenced runtime without transport or native storage. @owner eWaste @layer test */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const outcome = require("../src/service/defaultEWasteOutcomeCommunicationService");
const root = "../../../../../../nodics.communication/modules/";
const runtime = require(root + "commsCore/src/service/defaultCommunicationRuntimeService");
const controller = require(root + "commsApi/src/controller/defaultCommunicationApiController");
const facade = require(root + "commsApi/src/facade/defaultCommunicationApiFacade");

/** Injects canonical save envelopes and CAS stores; only synthetic records are ever changed. */
function fixture(t) {
  const previous = Object.fromEntries(["SERVICE", "CONFIG", "CLASSES", "FACADE"].map(k => [k, global[k]]));
  t.after(() => Object.assign(global, previous));
  const code = "COMM_" + "a".repeat(64);
  const state = { intent: { code, tenant: "test", sourceModule: "eWaste", sourceType: "wasteSubmission",
    sourceCode: "SUB_TEST", status: "UNCERTAIN", revision: 3, attempt: 1 },
    submission: { code: "SUB_TEST", revision: 7, submissionStatus: "REJECTED",
      metadata: { outcomeDelivery: { intentCode: code, revision: 3, status: "UNCERTAIN" }, publicReason: "Original reason" } },
    commWrites: 0, sourceWrites: 0, transport: 0, allowed: true, fault: "", afterRemote: () => {},
  };
  const request = { tenant: "test", code: "SUB_TEST", authData: { principalType: "human", loginId: "reviewer" },
    payload: { action: "AUTHORIZE_RESEND", confirmed: true, reason: "Retain original uncertainty; authorize one retry", expectedDeliveryRevision: 3 } };
  global.CONFIG = { get: () => ({ trustedSourceModules: ["eWaste"], maximumAttempts: 4 }) };
  global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
  global.FACADE = { DefaultCommunicationApiFacade: facade };
  global.SERVICE = {
    DefaultLoggerService: { hasPrivateCaptureProtection: () => true, assertSensitiveRequest: () => {} },
    DefaultCommunicationRuntimeService: runtime,
    DefaultCommsIntentService: {
      get: async ({ query, tenant }) => ({ code: "SUC_TEST", result: tenant === state.intent.tenant && query.code === code ? [structuredClone(state.intent)] : [] }),
      update: async ({ query, model }) => {
        assert.equal(query.revision, state.intent.revision);
        assert.equal(query.status, state.intent.status);
        state.intent = { ...state.intent, ...structuredClone(model), revision: state.intent.revision + 1 };
        state.commWrites++;
        if (state.fault === "owner-ack") throw Error("lost owner acknowledgement");
        return { code: "SUC_TEST", result: { matchedCount: 1 } };
      },
    },
    DefaultWasteOperationalAccessService: {
      authorize: async (_r, permission) => { assert.equal(permission, "waste.review.approve"); if (!state.allowed) throw Error("denied"); },
      assertRecord: async (_r, permission, row) => { assert.equal(permission, "waste.review.approve"); assert.equal(row.code, "SUB_TEST"); },
    },
    DefaultEWasteExperienceService: {
      settings: () => ({ outcomeCommunication: { connectionName: "comms" } }),
      store: () => ({
        one: async () => structuredClone(state.submission),
        update: async (_s, _r, current, changes) => {
          if (state.fault === "source-write") throw Error("source unavailable");
          assert.equal(current.revision, state.submission.revision);
          state.submission = { ...state.submission, ...changes, revision: current.revision + 1 }; state.sourceWrites++;
          if (state.fault === "source-ack") throw Error("lost source acknowledgement");
          return structuredClone(state.submission);
        },
      }),
      remote: async (_r, module, connection, path, method, body) => {
        assert.equal(module, "commsApi"); assert.equal(connection, "comms"); assert.equal(method, "POST");
        assert.equal(path, "/internal/communications/" + code + "/resolution");
        const response = await controller.resolveDelivery({ tenant: "test", authData: {
          tokenType: "service", principalType: "service", serviceId: "waste-runtime", tenant: "test",
          modules: ["commsApi", "eWaste"], permissions: ["communication.request"],
        }, httpRequest: { params: { intentCode: code }, body } });
        state.afterRemote();
        if (state.fault === "gateway-ack") throw Error("lost gateway acknowledgement");
        return response.data;
      },
    },
    TelegramTest: { deliver: () => { state.transport++; assert.fail("resolution cannot send"); } },
  };
  return { state, request };
}

for (const action of ["AUTHORIZE_RESEND", "MARK_DELIVERED", "CANCEL"])
  for (const fault of ["owner-ack", "gateway-ack", "source-write"])
    test(action + " recovers " + fault + " without another reconciliation or send", async t => {
      const { state, request } = fixture(t); request.payload.action = action; state.fault = fault;
      await assert.rejects(outcome.resolve(request));
      assert.equal(state.commWrites, 1); assert.equal(state.sourceWrites, 0);
      assert.equal(state.submission.metadata.outcomeDelivery.status, "UNCERTAIN");
      state.fault = "";
      for (const altered of [{ reason: "Different reason" }, { action: action === "CANCEL" ? "MARK_DELIVERED" : "CANCEL" }])
        await assert.rejects(outcome.resolve({ ...request, payload: { ...request.payload, ...altered } }), /INTEGRATION_STORAGE/);
      await assert.rejects(outcome.resolve({ ...request, authData: { ...request.authData, loginId: "other" } }), /INTEGRATION_STORAGE/);
      const result = await outcome.resolve(request);
      assert.equal(result.metadata.outcomeDelivery.status, { AUTHORIZE_RESEND: "RETRY_PENDING", MARK_DELIVERED: "DELIVERED", CANCEL: "CANCELLED" }[action]);
      assert.equal(result.metadata.publicReason, "Original reason");
      assert.equal(state.commWrites, 1); assert.equal(state.sourceWrites, 1);
      assert.equal(state.intent.reconciliation.length, 1); assert.equal(state.transport, 0);
    });

test("recovery projects later owner uncertainty without authorizing a second resend", async t => {
  const { state, request } = fixture(t); state.fault = "source-write";
  await assert.rejects(outcome.resolve(request)); state.fault = "";
  state.intent.status = "UNCERTAIN"; state.intent.revision += 2; state.intent.attempt++;
  const result = await outcome.resolve(request);
  assert.equal(result.metadata.outcomeDelivery.status, "UNCERTAIN");
  assert.equal(result.metadata.outcomeDelivery.revision, 6);
  assert.equal(state.commWrites, 1); assert.equal(state.intent.reconciliation.length, 1);
});

test("competing source reference or revision changes never overwrite newer evidence", async t => {
  const { state, request } = fixture(t);
  state.afterRemote = () => { state.submission.revision++; state.submission.metadata.publicReason = "Concurrent update"; };
  await assert.rejects(outcome.resolve(request), /reference changed/);
  assert.equal(state.sourceWrites, 0);
  state.afterRemote = () => {};
  assert.equal((await outcome.resolve(request)).metadata.publicReason, "Concurrent update");
  assert.equal(state.commWrites, 1);
});

test("owner source binding and human authorization still qualify every recovery", async t => {
  const { state, request } = fixture(t);
  state.allowed = false; await assert.rejects(outcome.resolve(request), /denied/);
  state.allowed = true; state.intent.sourceCode = "OTHER";
  await assert.rejects(outcome.resolve(request), /INTEGRATION_CONTEXT/);
  assert.equal(state.commWrites, 0); assert.equal(state.sourceWrites, 0);
});

test("caller cannot reconcile an unobserved owner revision or replace a concurrent source intent", async t => {
  const { state, request } = fixture(t);
  await assert.rejects(outcome.resolve({ ...request, payload: { ...request.payload, expectedDeliveryRevision: 4 } }), /evidence changed/);
  assert.equal(state.commWrites, 0);
  state.afterRemote = () => { state.submission.metadata.outcomeDelivery.intentCode = "COMM_other"; };
  await assert.rejects(outcome.resolve(request), /reference changed/);
  assert.equal(state.sourceWrites, 0);
});

test("lost source acknowledgement leaves the reconciled projection available on fresh read, never another decision", async t => {
  const { state, request } = fixture(t); state.fault = "source-ack";
  await assert.rejects(outcome.resolve(request), /lost source acknowledgement/);
  assert.equal(state.submission.metadata.outcomeDelivery.status, "RETRY_PENDING");
  state.fault = "";
  await assert.rejects(outcome.resolve(request), /No uncertain notification/);
  assert.equal(state.commWrites, 1); assert.equal(state.sourceWrites, 1);
  assert.equal(state.transport, 0);
});
