/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/**
 * @module digitalCore/test/digitalBundleAuthority
 * @description Exercises Digital admission with real permission matching and synthetic Profile transport.
 * @owner digitalCore
 * @layer test
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const authority = require("../src/service/defaultDigitalBundleAuthorityService");
const bundles = require("../src/service/defaultDigitalBundleService");
const defaults = require("../config/properties");
const security = require("../../../../../../nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService");
let request, evidence, effective;
test.beforeEach(t => {
  request = {
    tenant: "tenant", enterpriseCode: "enterprise", authorization: "Bearer employee",
    authData: { tenant: "tenant", enterpriseCode: "enterprise", principalType: "human",
      tokenType: "access", loginId: "employee",
      permissions: ["commerce.digital.bundle.manage", "commerce.digital.bundle.configure", "commerce.checkout.place"] },
  };
  evidence = { principalCode: "employee",
    scopes: [{ scopeType: "ENTERPRISE", scopeCode: "enterprise", capabilityCode: "digitalCore" }],
    deniedScopes: [] };
  effective = { ...authority };
  global.CONFIG = { get: key => defaults[key] };
  global.SERVICE = {
    DefaultDigitalBundleService: bundles, DefaultDigitalBundleAuthorityService: effective,
    DefaultSecuredRequestPipelineService: security,
    DefaultModuleService: { invokeModule: async command => {
      assert.equal(command.header.Authorization, request.authorization);
      assert.equal(command.header["X-Enterprise-Code"], "enterprise");
      assert.equal(command.apiName, "/identity/scopes/me");
      return { data: structuredClone(evidence) };
    } },
  };
  require('./helpers/authorizationErrorFixture')(t);
});
function authorize(action = "GIFT_SEND") {
  return effective.authorize(request, {
    ownerRef: { module: "profile", schema: "enterprise", code: "enterprise" }, action,
  });
}
test("wildcard Profile denies override Digital and Checkout capability allows", async () => {
  for (const action of ["GIFT_SEND", "GIFT_RECEIVE", "BUNDLE_BUY"]) {
    evidence.scopes[0].capabilityCode = action === "BUNDLE_BUY" ? "checkoutCore" : "digitalCore";
    for (const scope of [
      { scopeType: "ENTERPRISE", scopeCode: "enterprise" },
      { scopeType: "TENANT", scopeCode: "tenant" },
      { scopeType: "GLOBAL", scopeCode: "*" },
    ]) {
      evidence.deniedScopes = [{ ...scope, tenantCode: "tenant", enterpriseCode: "enterprise",
        capabilityCode: "*", permissionCode: "commerce.*", effect: "DENY" }];
      await assert.rejects(authorize(action), { code: 'ERR_AUTH_00003', responseCode: '403', message: 'Access denied' });
    }
  }
});
test("wildcard allows preserve typed owner and actor while foreign scope qualifiers grant nothing", async () => {
  evidence.scopes = [{ scopeType: "GLOBAL", scopeCode: "*", tenantCode: "tenant",
    enterpriseCode: "enterprise", capabilityCode: "*" }];
  const result = await authorize();
  assert.deepEqual(result.ownerRef, { module: "profile", schema: "enterprise", code: "enterprise" });
  assert.deepEqual(result.actorRef, { module: "profile", schema: "employee", code: "employee" });
  evidence.scopes[0].enterpriseCode = "foreign";
  await assert.rejects(authorize(), { code: 'ERR_AUTH_00003', responseCode: '403' });
  evidence.scopes[0].enterpriseCode = "enterprise";
  evidence.scopes[0].tenantCode = "foreign";
  await assert.rejects(authorize(), { code: 'ERR_AUTH_00003', responseCode: '403' });
});
test("unrelated denies do not block a scoped allow and permissions remain independently required", async () => {
  evidence.deniedScopes = [
    { scopeType: "GLOBAL", scopeCode: "*", enterpriseCode: "foreign", capabilityCode: "*" },
    { scopeType: "TENANT", scopeCode: "foreign", capabilityCode: "*" },
    { scopeType: "ENTERPRISE", scopeCode: "enterprise", capabilityCode: "promotion" },
    { scopeType: "ENTERPRISE", scopeCode: "enterprise", capabilityCode: "*", permissionCode: "commerce.checkout.place" },
  ];
  assert.equal((await authorize()).authorized, true);
  request.authData.permissions = [];
  await assert.rejects(authorize(), { code: 'ERR_AUTH_00003', responseCode: '403' });
});
test("effective scope member runs for allows and denies without replacing Profile admission", async () => {
  let calls = 0;
  effective.matchesScope = function (...args) {
    assert.equal(this, effective);
    calls++;
    return authority.matchesScope.apply(this, args);
  };
  evidence.deniedScopes = [{ scopeType: "ENTERPRISE", scopeCode: "other", capabilityCode: "*" }];
  assert.equal((await authorize()).authorized, true);
  assert.equal(calls, 2);
  effective.matchesScope = () => false;
  await assert.rejects(authorize(), { code: 'ERR_AUTH_00003', responseCode: '403' });
  request.authData.tokenType = "service";
  await assert.rejects(authorize(), /Original Profile access authority/);
});

test('typed authorization denials do not disguise unavailable or malformed Profile evidence', async () => {
  request.authData.permissions.push('commerce.digital.own.read');
  await assert.rejects(effective.authorize(request, { ownerRef: { module: 'profile', schema: 'enterprise', code: 'foreign' },
    action: 'HOLDINGS_READ' }), { code: 'ERR_AUTH_00003', responseCode: '403', message: 'Access denied' });
  SERVICE.DefaultModuleService.invokeModule = async () => { throw new Error('Profile unavailable'); };
  await assert.rejects(authorize(), error => error.message === 'Profile unavailable' && !error.code);
  SERVICE.DefaultModuleService.invokeModule = async () => ({ data: { principalCode: 'employee' } });
  await assert.rejects(authorize(), error => /scope is unconfirmed/.test(error.message) && !error.code);
  delete SERVICE.DefaultSecuredRequestPipelineService;
  await assert.rejects(authorize(), error => /permission service is unavailable/.test(error.message) && !error.code);
});
