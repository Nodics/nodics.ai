/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module nService/test/moduleSessionContextBridgeContract @description Deferred topology, signed credential separation, exact owner proof and failure fixtures; not executed acceptance. @layer test @owner nService */
const test = require("node:test"),
  assert = require("node:assert/strict");
const bridge = require("../src/service/authorization/defaultModuleSessionContextValidationService");
/** Installs isolated owner and module transport doubles. @param {Object} t Fixture context. @returns {Object} Policy, claims and request observations. */
function fixture(t) {
  const previous = {
    CONFIG: global.CONFIG,
    SERVICE: global.SERVICE,
    CLASSES: global.CLASSES,
  };
  t.after(() => Object.assign(global, previous));
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code) {
        super(code);
        this.code = code;
      }
    },
  };
  const policy = {
    qualified: true,
    localValidatorService: "ProfileOwner",
    connectionName: null,
    remoteQualified: true,
    captureProtectionQualified: true,
    timeoutMs: 5000,
  };
  global.CONFIG = {
    get: (key) => (key === "profileModuleName" ? "profile" : policy),
  };
  const payload = Object.freeze({
    tokenType: "access",
    principalType: "human",
    tenant: "tenant",
    entCode: "enterprise",
    sessionContext: Object.freeze({
      owner: "profile",
      code: "assignment",
      version: 2,
    }),
  });
  const proof = { valid: true, ...payload.sessionContext },
    observations = [];
  global.SERVICE = {
    ProfileOwner: { validate: async () => proof },
    DefaultLoggerService: {
      runSensitiveOperation: (request, execute) => execute(),
    },
    DefaultModuleService: {
      isLocalModuleActive: () => false,
      invokeModule: async (options) => {
        observations.push(options);
        return { code: "SUC_SYS_00000", result: proof };
      },
    },
  };
  return { policy, payload, proof, observations };
}
test("qualified local owner bypasses remote transport without requiring a raw token", async (t) => {
  const { payload, proof } = fixture(t);
  SERVICE.DefaultModuleService.isLocalModuleActive = () => true;
  SERVICE.DefaultModuleService.invokeModule = async () =>
    assert.fail("local owner must not use transport");
  assert.deepEqual(await bridge.validate(payload), proof);
});
test("remote validation forwards only original signed token under separate runtime authentication", async (t) => {
  const { payload, proof, observations } = fixture(t);
  assert.deepEqual(
    await bridge.validate(payload, "header.payload.signature"),
    proof,
  );
  const request = observations[0];
  assert.deepEqual(request.requestBody, {
    authToken: "header.payload.signature",
  });
  assert.equal(request.header.Authorization, undefined);
  assert.equal(request.requireInternalAuth, true);
  assert.equal(request.local, false);
  assert.equal(request.apiName, "/internal/session-context/validate");
  assert.equal(request.maxAttempts, 1);
  assert.equal(request.followRedirects, false);
});
test("unsigned claims, missing qualification and capture protection cannot trigger remote reads", async (t) => {
  const { payload, policy, observations } = fixture(t);
  for (const token of [undefined, "unsigned", {}, "x".repeat(65537)])
    await assert.rejects(bridge.validate(payload, token), {
      code: "ERR_AUTH_00001",
    });
  policy.remoteQualified = false;
  await assert.rejects(bridge.validate(payload, "h.p.s"), {
    code: "ERR_AUTH_00001",
  });
  policy.remoteQualified = true;
  policy.captureProtectionQualified = false;
  await assert.rejects(bridge.validate(payload, "h.p.s"), {
    code: "ERR_AUTH_00001",
  });
  assert.equal(observations.length, 0);
});
test("wrong, private and failed owner proofs reject without fallback", async (t) => {
  const { payload, proof } = fixture(t);
  for (const result of [
    false,
    {},
    { ...proof, version: 3 },
    { ...proof, password: "secret" },
  ]) {
    SERVICE.DefaultModuleService.invokeModule = async () => ({
      code: "SUC_SYS_00000",
      result,
    });
    await assert.rejects(bridge.validate(payload, "h.p.s"), {
      message: "ERR_AUTH_00001",
    });
  }
  SERVICE.DefaultModuleService.invokeModule = async () => {
    throw new Error("private credential/body");
  };
  await assert.rejects(bridge.validate(payload, "h.p.s"), {
    message: "ERR_AUTH_00001",
  });
});
