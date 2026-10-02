/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/**
 * @module profile/test/profileSessionContextValidationContract
 * @description Deferred local owner-proof, unsupported context and private-error fixtures; not installed cross-runtime acceptance.
 * @layer test
 * @owner profile
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const owner = require("../src/service/authorization/defaultProfileSessionContextValidationService");
function fixture() {
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code) {
        super(code);
        this.code = code;
      }
    },
  };
  const payload = {
    tokenType: "access",
    principalType: "human",
    sessionContext: { owner: "profile", code: "assignment", version: 2 },
  };
  global.SERVICE = {
    DefaultEnterpriseMembershipService: {
      validateContext: async () => ({
        identity: { recordId: "private" },
        person: { password: "private" },
      }),
    },
  };
  return payload;
}
test("fixed local owner validation returns only the exact typed proof", async () => {
  const payload = fixture();
  assert.deepEqual(await owner.validate(payload), {
    valid: true,
    owner: "profile",
    code: "assignment",
    version: 2,
  });
});
test("unknown owners and system/service contexts fail before owner reads", async () => {
  const payload = fixture();
  let calls = 0;
  SERVICE.DefaultEnterpriseMembershipService.validateContext = async () => {
    calls++;
  };
  for (const input of [
    { ...payload, isSystem: true },
    { ...payload, principalType: "service" },
    {
      ...payload,
      sessionContext: { ...payload.sessionContext, owner: "unknown" },
    },
  ])
    await assert.rejects(owner.validate(input), { code: "ERR_AUTH_00001" });
  assert.equal(calls, 0);
});
test("false, unavailable and raw owner failures never become a valid public proof", async () => {
  const payload = fixture();
  for (const value of [false, null, undefined, {}]) {
    SERVICE.DefaultEnterpriseMembershipService.validateContext = async () =>
      value;
    await assert.rejects(owner.validate(payload), { code: "ERR_AUTH_00001" });
  }
  SERVICE.DefaultEnterpriseMembershipService.validateContext = async () => {
    throw new Error("private source record and credential");
  };
  await assert.rejects(owner.validate(payload), { message: "ERR_AUTH_00001" });
  delete SERVICE.DefaultEnterpriseMembershipService;
  await assert.rejects(owner.validate(payload), { code: "ERR_AUTH_00001" });
});
test("drift during asynchronous owner validation refuses the original proof", async () => {
  const payload = fixture();
  SERVICE.DefaultEnterpriseMembershipService.validateContext = async () => {
    payload.sessionContext.version++;
    return { identity: {}, person: {} };
  };
  await assert.rejects(owner.validate(payload), { code: "ERR_AUTH_00001" });
});
test("runtime transport requires independently verified signed subject token and exact enterprise/tenant", async () => {
  const payload = { ...fixture(), tenant: "tenant", entCode: "enterprise" };
  global.CONFIG = {
    get: (key) =>
      key === "profileModuleName"
        ? "profile"
        : {
            qualified: true,
            remoteQualified: true,
            captureProtectionQualified: true,
            permission: "profile.sessionContext.validate",
          },
  };
  let supplied;
  SERVICE.DefaultModuleService = { isLocalModuleActive: () => true };
  SERVICE.DefaultLoggerService = { assertSensitiveRequest: () => {} };
  SERVICE.DefaultServiceTokenService = {
    requireRuntimePrincipal: (r) => r.authData,
  };
  SERVICE.DefaultAuthSecurityService = {
    cloneAuthorizationClaims: (p) => ({ ...p }),
  };
  SERVICE.DefaultAuthorizationProviderService = {
    authorizeToken: async (r) => {
      supplied = r.authToken;
      return { code: "SUC_SYS_00000", result: payload };
    },
  };
  const request = {
    tenant: "tenant",
    entCode: "enterprise",
    authData: {
      principalType: "service",
      entCode: "enterprise",
      permissions: ["profile.sessionContext.validate"],
    },
    body: { authToken: "h.p.s" },
  };
  assert.deepEqual(await owner.validateRemote(request), {
    valid: true,
    ...payload.sessionContext,
  });
  assert.equal(supplied, "h.p.s");
  assert.deepEqual(request.body, {});
  payload.entCode = "different";
  request.body = { authToken: "h.p.s" };
  await assert.rejects(owner.validateRemote(request), {
    code: "ERR_AUTH_00001",
  });
  assert.deepEqual(request.body, {});
});
