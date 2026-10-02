/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/** @module digitalCore/test/digitalCommercePrivateNotificationTransport @description Deferred private transport, immutable command and safe error fixtures; NOT RUN. @owner digitalCore @layer test */
const test = require("node:test"),
  assert = require("node:assert/strict");
const source = require("../src/service/defaultDigitalCommerceNotificationService");
test("Digital transport admits a detached envelope and preserves original body without retry", async (t) => {
  const previous = { SERVICE: global.SERVICE, CLASSES: global.CLASSES };
  t.after(() => Object.assign(global, previous));
  const admitted = new WeakSet(),
    body = {
      variables: { couponCode: "private" },
      recipientAddressReference: "test@example.test",
    };
  global.CLASSES = { NodicsError: class extends Error {} };
  global.SERVICE = {
    DefaultLoggerService: {
      runSensitiveOperation: async (request, operation) => {
        admitted.add(request);
        return operation();
      },
      assertSensitiveRequest: (request) => assert(admitted.has(request)),
    },
    DefaultModuleService: {
      invokeModule: async (options) => {
        assert(admitted.has(options.request));
        assert.deepEqual(options.request, { tenant: "tenant" });
        assert.equal(options.requestBody, body);
        assert.deepEqual(options.secureTransport, {
          required: true,
          allowInsecureLoopback: false,
        });
        assert.equal(options.followRedirects, false);
        assert.equal(options.maxAttempts, 1);
        return { intentCode: "COMM_" + "a".repeat(64), status: "DEAD_LETTER" };
      },
    },
  };
  const owner = { ...source },
    policy = { connectionName: "commsApi", timeoutMilliseconds: 1000 };
  assert.equal(
    (
      await owner.invoke(
        { tenant: "tenant", enterpriseCode: "enterprise" },
        policy,
        "/internal/communications",
        body,
      )
    ).status,
    "DEAD_LETTER",
  );
  SERVICE.DefaultLoggerService.runSensitiveOperation = async () => {
    throw Object.assign(new Error("private provider response"), {
      errInfo: "address",
    });
  };
  SERVICE.DefaultModuleService.invokeModule = async () =>
    assert.fail("unqualified transport must not run");
  await assert.rejects(
    owner.invoke(
      { tenant: "tenant" },
      policy,
      "/internal/communications",
      body,
    ),
    (error) =>
      error.message === "ERR_DIGITAL_NOTIFICATION_UNCONFIRMED" &&
      !error.errInfo &&
      !error.cause,
  );
});
