/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module config/test/RequestCapturePrivacyContract
 * @description Deferred private request admission, async isolation, pre-buffer
 * logging, error tagging and deployment customization fixtures. No listeners,
 * providers, persistence or agents are started. NOT RUN in the source batch.
 * @layer test
 * @owner nConfig
 * @override Later layers must retain exact-object proof and upstream qualification.
 */
const assert = require("node:assert/strict");
const owner = require("../src/service/DefaultLoggerService");

/** Exercises owner exports without starting a runtime. */
async function main() {
  const prior = Object.getOwnPropertyDescriptor(global, "CONFIG");
  const policy = {
    requestPrivacy: { qualified: false, captureMode: "disabled" },
    redaction: { mask: "[CUSTOM]" },
  };
  global.CONFIG = { get: (key) => (key === "log" ? policy : undefined) };
  try {
    const forged = {
      captureProtectionQualified: true,
      requestPrivacy: { sensitive: true },
    };
    assert.equal(owner.hasPrivateCaptureProtection(forged), false);
    assert.throws(
      () => owner.assertSensitiveRequest(forged),
      /capture protection is required/,
    );
    assert.throws(
      () => owner.runSensitiveOperation({}, () => assert.fail()),
      /private entry is unavailable/,
    );
    const unqualified = {};
    owner.runRequestPrivacy(unqualified, () => {
      owner.resolveRequestPrivacy(unqualified, true);
      assert.equal(owner.admitPrivateRoute(unqualified), false);
      assert.equal(owner.hasPrivateCaptureProtection(unqualified), false);
    });
    policy.requestPrivacy.qualified = true;
    const req = {
      body: {
        authToken: "original.signed.jwt",
        historicalPassword: "private-password",
      },
      headers: { authorization: "Bearer service.jwt" },
    };
    const writes = [];
    const logger = owner.protectLoggerIngress({
      write: (info) => writes.push(info),
    });
    await owner.runRequestPrivacy(req, async () => {
      assert.equal(owner.hasPrivateCaptureProtection(req), false);
      owner.resolveRequestPrivacy(req, true);
      assert.equal(owner.admitPrivateRoute(req), true);
      owner.assertSensitiveRequest(req);
      const derived = { body: req.body, httpRequest: req };
      owner.inheritRequestPrivacy(derived, req);
      owner.assertSensitiveRequest(derived);
      assert.equal(owner.hasPrivateCaptureProtection(req.body), false);
      assert.equal(owner.hasPrivateCaptureProtection(req.headers), false);
      assert.equal(owner.hasPrivateCaptureProtection({ ...derived }), false);
      const taggedOnly = {};
      owner.inheritRequestPrivacy(taggedOnly);
      assert.equal(owner.hasPrivateCaptureProtection(taggedOnly), false);
      owner.resolveRequestPrivacy(req, false);
      assert.equal(owner.isSensitiveRequest(req), true);
      await Promise.resolve();
      logger.write({
        level: "error",
        message: "original.signed.jwt",
        metadata: req.body,
        [Symbol.for("splat")]: [req.headers],
        [Symbol.for("message")]: "private-password",
      });
      assert.equal(writes[0].message, "[SENSITIVE_REQUEST]");
      assert.deepEqual(Object.keys(writes[0]), ["level", "message"]);
      assert.equal(writes[0][Symbol.for("message")], undefined);
      assert.equal(writes[0][Symbol.for("splat")], undefined);
    });
    assert.equal(owner.formatObject(req.body), "[SENSITIVE_REQUEST]");
    await Promise.all([
      owner.runRequestPrivacy({}, async () => {
        await Promise.resolve();
        assert.equal(owner.isSensitiveRequest(), true);
      }),
      (() => {
        const ordinary = {};
        return owner.runRequestPrivacy(ordinary, async () => {
          owner.resolveRequestPrivacy(ordinary, false);
          await Promise.resolve();
          assert.equal(owner.isSensitiveRequest(), false);
          assert.equal(owner.hasPrivateCaptureProtection(ordinary), false);
          const info = owner.sanitizeRequestLogEntry({
            level: "info",
            message: "ordinary",
            authToken: "must-not-buffer",
          });
          assert.equal(info.message, "ordinary");
          assert.equal(info.authToken, "[CUSTOM]");
        });
      })(),
    ]);
    const envelope = {};
    const privateError = new Error("original.signed.jwt");
    await assert.rejects(
      owner.runSensitiveOperation(envelope, async () => {
        owner.assertSensitiveRequest(envelope);
        throw privateError;
      }),
      (error) => error === privateError,
    );
    assert.equal(owner.formatObject(privateError), "[SENSITIVE_REQUEST]");
    assert.throws(
      () => owner.runSensitiveOperation(envelope, () => {}),
      /private entry is unavailable/,
    );
    policy.requestPrivacy.captureMode = "filtered";
    assert.equal(owner.hasPrivateCaptureProtection(req), false);
    assert.deepEqual(owner.getPrivateApmOptions(), {
      active: false,
      captureBody: "off",
      captureHeaders: false,
    });
    let filter;
    owner.installApmPrivacyFilter({
      addFilter: (fn) => {
        filter = fn;
      },
    });
    assert.equal(filter({ request: req }), null);
    assert.throws(
      () => owner.installApmPrivacyFilter({}),
      /adapter is unavailable/,
    );
    assert.equal(owner.isRequestPrivacyQualified(), false);
  } finally {
    if (prior) Object.defineProperty(global, "CONFIG", prior);
    else delete global.CONFIG;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
