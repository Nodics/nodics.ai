/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module commsApi/test/communicationPrivateTransportContract @description Deferred exact-entry, private verification context, redacted failures and unchanged callback transport fixtures. Behavioral execution is NOT RUN in this source increment. @layer test @owner commsApi */
const test = require("node:test"),
  assert = require("node:assert/strict");
const controller = require("../src/controller/defaultCommunicationApiController"),
  facade = require("../src/facade/defaultCommunicationApiFacade"),
  verification = require("../src/service/defaultCommunicationVerificationApiService"),
  routes = require("../src/router/routers").commsApi;
/** Installs an exact-object admission double, not a browser-supplied private flag. @param {Object} t Test context. @returns {WeakSet<Object>} Admitted entries. */
function fixture(t) {
  const previous = {
    SERVICE: global.SERVICE,
    FACADE: global.FACADE,
    CLASSES: global.CLASSES,
  };
  t.after(() => Object.assign(global, previous));
  const admitted = new WeakSet();
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code) {
        super(code);
        this.code = code;
      }
    },
  };
  global.SERVICE = {
    DefaultCommunicationRuntimeService: require("../../commsCore/src/service/defaultCommunicationRuntimeService"),
    DefaultLoggerService: {
      hasPrivateCaptureProtection: (request) => admitted.has(request),
      assertSensitiveRequest: (request) => {
        if (!admitted.has(request))
          throw new Error("private-capture-unavailable");
      },
      inheritRequestPrivacy: (target, source) => {
        if (admitted.has(source)) admitted.add(target);
      },
    },
  };
  global.FACADE = { DefaultCommunicationApiFacade: { ...facade } };
  return admitted;
}
test("actual internal routes declare sensitive/no-cache without changing provider callback", () => {
  assert.equal(Object.keys(routes.internal).length, 5);
  for (const route of Object.values(routes.internal)) {
    assert.deepEqual(route.requestPrivacy, { sensitive: true });
    assert.equal(route.cache.enabled, false);
  }
  assert.equal(routes.integration.receiveCallback.requestPrivacy, undefined);
});
test("unprotected entries and caller flags refuse before controller reads secret input", async (t) => {
  fixture(t);
  let reads = 0;
  for (const operation of [
    "executeVerification",
    "requestCommunication",
    "inspectDelivery",
    "retryDelivery",
    "resolveDelivery",
  ]) {
    const request = {
      requestPrivacy: { sensitive: true },
      get httpRequest() {
        reads++;
        throw new Error("PRIVATE-SECRET");
      },
    };
    await assert.rejects(
      controller[operation](request),
      (error) =>
        error.code ===
          (operation === "executeVerification"
            ? "ERR_COMMS_VERIFY_CONTEXT"
            : "ERR_COMMS_INTEGRATION_CONTEXT") &&
        !error.message.includes("PRIVATE-SECRET"),
    );
  }
  assert.equal(reads, 0);
});
test("protected controller retains exact request and rebuilds errors without private causes", async (t) => {
  const admitted = fixture(t),
    request = {
      httpRequest: { body: { secret: "PRIVATE-SECRET" } },
      httpResponse: {
        setHeader: (name, value) =>
          assert.deepEqual([name, value], ["Cache-Control", "no-store"]),
      },
    };
  admitted.add(request);
  global.FACADE.DefaultCommunicationApiFacade.executeVerification = async (
    mapped,
  ) => {
    assert.equal(mapped, request);
    assert.equal(admitted.has(mapped), true);
    throw Object.assign(new Error("PRIVATE-SECRET"), {
      code: "ERR_COMMS_VERIFY_STATE",
      causes: ["PRIVATE-CAUSE"],
      errInfo: "PRIVATE-DESTINATION",
    });
  };
  await assert.rejects(
    controller.executeVerification(request),
    (error) =>
      error.code === "ERR_COMMS_VERIFY_STATE" &&
      error.message === "ERR_COMMS_VERIFY_STATE" &&
      error.causes === undefined &&
      error.errInfo === undefined,
  );
});
test("verification child context inherits exact private admission before existing owner dispatch", async (t) => {
  const admitted = fixture(t),
    request = {
      tenant: "tenant",
      authData: {
        tokenType: "service",
        principalType: "service",
        serviceId: "runtime",
        tenant: "tenant",
        permissions: ["communication.verification.execute"],
        modules: ["commsApi", "profile"],
      },
      payload: {
        operation: "ISSUE",
        sourceModule: "profile",
        purpose: "TEST",
        subjectReference: "subject",
        channel: "EMAIL",
        destination: "private@example.test",
        bindingReference: "b".repeat(64),
      },
    };
  admitted.add(request);
  global.SERVICE.DefaultCommunicationVerificationService = {
    issueStored: async (context) => {
      assert.notEqual(context, request);
      assert.equal(admitted.has(context), true);
      return {
        challengeCode: "CV_" + "a".repeat(64),
        status: "PENDING",
        revision: 1,
        generation: 1,
        expiresAt: "2099-01-01T00:00:00Z",
        nextIssueAt: "2099-01-01T00:00:00Z",
        secret: "c".repeat(12),
        replayed: false,
      };
    },
  };
  assert.equal((await verification.execute(request)).secret, "c".repeat(12));
  await assert.rejects(
    verification.execute({ ...request, requestPrivacy: { sensitive: true } }),
    { code: "ERR_COMMS_VERIFY_CONTEXT" },
  );
});
test("ordinary provider callback does not acquire a new private-entry prerequisite", async (t) => {
  fixture(t);
  global.FACADE.DefaultCommunicationApiFacade.receiveCallback = async (r) => ({
    providerCode: r.providerCode,
    status: r.payload.status,
  });
  assert.deepEqual(
    await controller.receiveCallback({
      httpRequest: {
        params: { providerCode: "provider" },
        body: { status: "DELIVERED" },
      },
    }),
    { data: { providerCode: "provider", status: "DELIVERED" } },
  );
});
test("direct facade and verification adapter reject caller privacy flags before payload getters", async (t) => {
  fixture(t);
  let reads = 0;
  const request = {
    requestPrivacy: { sensitive: true },
    get payload() {
      reads++;
      throw new Error("PRIVATE-PROOF");
    },
  };
  for (const operation of [
    "executeVerification",
    "requestCommunication",
    "inspectDelivery",
    "retryDelivery",
    "resolveDelivery",
  ])
    await assert.rejects(
      Promise.resolve().then(() => facade[operation](request)),
      (error) =>
        error.code ===
        (operation === "executeVerification"
          ? "ERR_COMMS_VERIFY_CONTEXT"
          : "ERR_COMMS_INTEGRATION_CONTEXT"),
    );
  await assert.rejects(verification.execute(request), {
    code: "ERR_COMMS_VERIFY_CONTEXT",
  });
  assert.equal(reads, 0);
});
