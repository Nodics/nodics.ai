/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module cart/test/cartParticipantScope @description Verifies original Profile purchaser scope denies and effective facade overrides without merchant or persistence effects. @layer test @owner cart */
const test = require("node:test");
const assert = require("node:assert/strict");
const facade = require("../src/facade/defaultCartCustomerFacade");
const defaults = require("../config/properties");
const security = require("../../../../../../nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService");
const permissions = ["commerce.cart.own", "commerce.checkout.place", "commerce.order.own.read", "commerce.lifecycle.own.create"];
test("each purchaser permission respects wildcard DENY at every matching scope", async t => {
  const previous = ["CONFIG", "SERVICE"].map(key => [key, Object.hasOwn(global, key), global[key]]);
  t.after(() => {
    for (const [key, present, value] of previous) {
      if (present) global[key] = value;
      else delete global[key];
    }
  });
  global.CONFIG = { get: key => defaults[key] };
  const input = { tenant: "tenant", authorization: "Bearer original",
    authData: { tenant: "tenant", entCode: "company", principalType: "human", tokenType: "access",
      loginId: "employee", permissions } };
  const evidence = { principalCode: "employee",
    scopes: [{ scopeType: "ENTERPRISE", scopeCode: "company", capabilityCode: "*" }], deniedScopes: [] };
  global.SERVICE = { DefaultSecuredRequestPipelineService: security,
    DefaultModuleService: { invokeModule: async request => {
      assert.equal(request.apiName, "/identity/scopes/me");
      assert.equal(request.header.Authorization, input.authorization);
      return { data: evidence };
    } } };
  for (const permission of permissions) {
    evidence.deniedScopes = [];
    const admitted = await facade.resolveContext(input, permission);
    assert.equal(admitted.ownerRef.code, "company");
    assert.equal(admitted.actorRef.loginId, "employee");
    assert.equal(admitted.authData, input.authData);
    for (const [scopeType, scopeCode] of [["GLOBAL", "*"], ["TENANT", "tenant"], ["ENTERPRISE", "company"]]) {
      evidence.deniedScopes = [{ scopeType, scopeCode, capabilityCode: "*", permissionCode: permission }];
      await assert.rejects(facade.resolveContext(input, permission), /scope denied/);
    }
  }
  evidence.deniedScopes = [{ scopeType: "GLOBAL", scopeCode: "*", enterpriseCode: "foreign" }];
  await facade.resolveContext(input);
  evidence.deniedScopes = [];
  evidence.scopes = [{ scopeType: "GLOBAL", scopeCode: "*", enterpriseCode: "foreign" }];
  await assert.rejects(facade.resolveContext(input), /scope denied/);
  evidence.scopes = [{ scopeType: "ENTERPRISE", scopeCode: "company" }];
  await assert.rejects(({ ...facade, matchesParticipantScope: () => false }).resolveContext(input), /scope denied/);
});
