/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/** @module profile/test/applicationRecoveryWorkspaceContract @description Injected read-only admission and redaction fixtures, not Process or browser acceptance. @layer test @owner profile */
const test = require("node:test");
const assert = require("node:assert/strict");
const source = require("../src/service/enterprise/defaultEnterpriseApplicationReviewService");
test("application inspection uses fresh administrator admission and exposes only the owner projection", async () => {
  const code = "enterpriseAccess_" + "a".repeat(64),
    calls = [];
  const item = {
    code,
    origin: "SELF_APPLICATION",
    enterpriseCode: "business",
    active: true,
    application: { privateProof: "secret" },
  };
  global.SERVICE = {
    DefaultEnterpriseMembershipService: {
      administrator: async (_, target) => {
        calls.push(target);
      },
    },
    DefaultSecuredRequestPipelineService: {
      isPermissionGranted: () => true,
      getGrantedPermissions: () => [],
      getRouteActionAuthorizationConfig: () => ({}),
    },
  };
  const owner = {
    ...source,
    settings: () => ({
      operatorRecoveryQualified: true,
      decisionPermission: "permission",
      recoveryPresentation: { title: "Recovery" },
    }),
    base: () => ({
      input: (value, keys) => {
        if (Object.keys(value).some((key) => !keys.includes(key)))
          throw Error("selector");
      },
    }),
    read: async () => item,
    operatorProjection: (value) => ({
      code: value.code,
      enterpriseCode: value.enterpriseCode,
    }),
    fail: () => {
      throw Error("denied");
    },
  };
  const request = { params: { applicationCode: code }, query: {}, body: {} };
  const result = await owner.inspect(request);
  assert.deepEqual(calls, ["business"]);
  assert.equal(result.application.application, undefined);
  assert.equal(result.owner, "profile");
  await assert.rejects(
    owner.inspect({ ...request, query: { tenant: "caller" } }),
    /selector/,
  );
  SERVICE.DefaultSecuredRequestPipelineService.isPermissionGranted = () =>
    false;
  await assert.rejects(owner.inspect(request), /denied/);
});
