/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/** @module profile/test/profilePrivateNotificationTransport @description Exercises detached private transport and redacted errors; fixtures do not qualify a deployment. @owner profile @layer test */
const test = require("node:test");
const assert = require("node:assert/strict");
const source = require("../src/service/enterprise/defaultEnterpriseManagementService");
function fixture(t, qualified = true) {
  const previous = { SERVICE: global.SERVICE, CLASSES: global.CLASSES };
  t.after(() => Object.assign(global, previous));
  const admitted = new WeakSet(),
    calls = [];
  global.CLASSES = { NodicsError: class extends Error {} };
  global.SERVICE = {
    DefaultLoggerService: {
      runSensitiveOperation: async (request, operation) => {
        if (!qualified)
          throw new Error("private proof/address must not escape");
        admitted.add(request);
        return operation();
      },
      assertSensitiveRequest: (request) => assert(admitted.has(request)),
    },
    DefaultModuleService: {
      invokeModule: async (options) => {
        assert(admitted.has(options.request));
        calls.push(options);
        return { intentCode: "COMM_" + "a".repeat(64), status: "ACCEPTED" };
      },
    },
  };
  return { owner: { ...source }, calls };
}
const command = () => ({
  tenant: "tenant",
  moduleName: "commsApi",
  apiName: "/internal/communications",
  methodName: "POST",
  request: { browser: true },
  requestBody: {
    recipientAddressReference: "test@example.test",
    variables: { verificationCode: "private" },
  },
});
test("qualification failure precedes transport and returns only a fixed error", async (t) => {
  const f = fixture(t, false);
  await assert.rejects(
    f.owner.invokePrivateCommunication(command(), {}),
    (error) =>
      error.message === "ERR_PRFL_00003" && !error.cause && !error.errInfo,
  );
  assert.equal(f.calls.length, 0);
});
test("owner envelope is detached, exact-private and HTTPS by default; loopback is explicit", async (t) => {
  const f = fixture(t),
    input = command();
  await f.owner.invokePrivateCommunication(input, {});
  assert.notEqual(f.calls[0].request, input.request);
  assert.deepEqual(f.calls[0].request, { tenant: "tenant" });
  assert.deepEqual(f.calls[0].secureTransport, {
    required: true,
    allowInsecureLoopback: false,
  });
  assert.equal(f.calls[0].followRedirects, false);
  assert.equal(f.calls[0].maxAttempts, 1);
  assert.equal(f.calls[0].requireInternalAuth, true);
  await f.owner.invokePrivateCommunication(input, {
    allowInsecureLoopback: true,
  });
  assert.equal(f.calls[1].secureTransport.allowInsecureLoopback, true);
});
test("private provider errors and unrelated paths cannot leave the owner boundary", async (t) => {
  const f = fixture(t);
  SERVICE.DefaultModuleService.invokeModule = async () => {
    throw Object.assign(new Error("secret address provider response"), {
      errInfo: "private",
      cause: "private",
    });
  };
  await assert.rejects(
    f.owner.invokePrivateCommunication(command(), {}),
    (error) =>
      error.message === "ERR_PRFL_00003" && !error.errInfo && !error.cause,
  );
  await assert.rejects(
    f.owner.invokePrivateCommunication(
      { ...command(), apiName: "/arbitrary" },
      {},
    ),
    /ERR_PRFL_00003/,
  );
});

test("verification retry states preserve only fixed codes without private provider details", async (t) => {
  const f = fixture(t);
  CLASSES.NodicsError = class extends Error {
    constructor(code) {
      assert.equal(code, "ERR_PRFL_00003", "foreign status definitions are not loaded by Profile");
      super(code);
    }
  };
  for (const code of ["ERR_COMMS_VERIFY_RATE", "ERR_COMMS_VERIFY_STATE", "ERR_COMMS_VERIFY_CONFLICT"]) {
    SERVICE.DefaultModuleService.invokeModule = async () => {
      throw Object.assign(new Error("private proof and provider response"), { code, errInfo: "private", cause: "private" });
    };
    await assert.rejects(
      f.owner.invokePrivateCommunication({ ...command(), apiName: "/internal/verification/commands" }, {}),
      error => error.message === code && !error.errInfo && !error.cause,
    );
    await assert.rejects(f.owner.invokePrivateCommunication(command(), {}), /ERR_PRFL_00003/);
  }
});
