/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module promotion/test/promotionIssuerAuthorityContract @description Verifies original signed issuer authority, bounded Profile evidence and immutable consent-command inputs using isolated ports; not installed acceptance. @layer test @owner promotion */
const test = require("node:test");
const assert = require("node:assert/strict");
const source = require("../src/service/defaultCouponSellerAuthorizationService");
const profileScopes = require("../../../../../../nodics.platform/modules/profile/src/service/identity/defaultPrincipalScopeGovernanceService");

function fixture(t) {
  const previous = Object.fromEntries(["CONFIG", "SERVICE", "CLASSES"].map(key => [key, global[key]]));
  t.after(() => Object.assign(global, previous));
  global.CLASSES = { NodicsError: class extends Error {
    constructor(code, message) { super(message); this.code = code; }
  } };
  const request = { tenant: "tenantA", enterpriseCode: "issuerA", authorization: "Bearer isolated-test-context",
    authData: { tenant: "tenantA", enterpriseCode: "issuerA", tokenType: "access", principalType: "human", loginId: "issuer@example.test" } };
  const scope = { scopeType: "ENTERPRISE", scopeCode: "issuerA", tenantCode: "tenantA" };
  const state = { calls: [], scope: { principalCode: request.authData.loginId, scopes: [scope], deniedScopes: [] },
    enterprises: [{ code: "sellerB", active: true, tenant: "tenantA" }] };
  global.CONFIG = { get: () => ({ sellerAuthorization: { enabled: true, qualified: true, maximumSellers: 10 } }) };
  global.SERVICE = {
    DefaultPromotionOperationService: { requireOperationalRuntime: () => true },
    DefaultPromotionDistributionAdmissionService: { ...require('../src/service/defaultPromotionDistributionAdmissionService'),
      assertInstalled: async () => true },
    DefaultSecuredRequestPipelineService: { getGrantedPermissions: () => ["commerce.coupon.seller.manage"],
      isPermissionGranted: (permission, granted) => granted.includes(permission) || granted.includes("*") },
    DefaultModuleService: { invokeModule: async command => {
      state.calls.push(command);
      if (command.apiName !== "/identity/scopes/me") {
        assert.deepEqual(command, {
          local: false, moduleName: "profile", connectionName: "profile",
          targetAuthority: { runtimeRole: "PLATFORM" },
          tenant: "tenantA", request: { tenant: "tenantA" },
          apiName: "/references/read", methodName: "POST",
          requestBody: { type: "enterprise", codes: ["sellerB"] },
          timeoutMs: 10000, maxAttempts: 1,
        });
      }
      return structuredClone(command.apiName === "/identity/scopes/me" ? state.scope : state.enterprises);
    } },
  };
  return { service: { ...source }, request, scope, state };
}
const refused = error => error.code === "ERR_PROMOTION_SELLER_UNCONFIRMED";

test("issuer uses original bearer and fresh matching human Profile authority on every admission", async t => {
  const f = fixture(t);
  await f.service.issuer(f.request, "issuerA");
  assert.deepEqual(f.state.calls[0].header, { Authorization: f.request.authorization, "X-Enterprise-Code": "issuerA" });
  f.state.scope.deniedScopes = [f.scope];
  await assert.rejects(f.service.issuer(f.request, "issuerA"), refused);
  assert.equal(f.state.calls.length, 2);
});

test("issuer rejects conflicting signed and routed aliases before any Profile lookup", async t => {
  for (const [target, key, value] of [
    ["request", "tenantCode", "foreign"], ["authData", "tenant", "foreign"], ["authData", "tenantCode", ""],
    ["request", "enterpriseCode", "foreign"], ["request", "entCode", ""],
    ["authData", "enterpriseCode", "foreign"], ["authData", "entCode", ""],
    ["authData", "tokenType", "refresh"], ["authData", "principalType", "customer"],
    ["authData", "loginId", " admin "], ["authData", "loginId", "bad\nlogin"],
    ["request", "authorization", "Bearer good\r\nInjected: true"], ["request", "authorization", "Basic context"],
  ]) await t.test(target + ":" + key + ":" + JSON.stringify(value), async t => {
    const f = fixture(t); (target === "request" ? f.request : f.request.authData)[key] = value;
    await assert.rejects(f.service.issuer(f.request, "issuerA"), refused);
    assert.equal(f.state.calls.length, 0);
  });
});

test("failed or ambiguous Profile wrappers cannot carry successful-looking issuer scopes or enterprises", async t => {
  for (const failure of [
    value => ({ code: "ERR_PROFILE", result: value }),
    value => ({ success: false, data: value }),
    value => ({ acknowledged: false, result: value }),
    value => ({ errors: [{}], data: value }),
    value => ({ code: "UNKNOWN", result: value }),
    value => ({ data: value, result: value }),
    value => ({ result: { acknowledged: false, data: value } }),
    value => Array.from({ length: 7 }).reduce(v => ({ result: v }), { code: "ERR_TERMINAL", data: value }),
    value => Array.from({ length: 8 }).reduce(v => ({ result: v }), value),
  ]) for (const kind of ["scope", "enterprises"]) await t.test(kind, async t => {
    const f = fixture(t); f.state[kind] = failure(f.state[kind]);
    await assert.rejects(kind === "scope" ? f.service.issuer(f.request, "issuerA") :
      f.service.activeEnterprise(f.request, "sellerB"), refused);
  });
});

test("canonical seven-wrapper Profile responses remain supported", async t => {
  const f = fixture(t);
  for (const kind of ["scope", "enterprises"]) f.state[kind] =
    Array.from({ length: 7 }).reduce(value => ({ code: "SUC_PROFILE", result: value }), f.state[kind]);
  await f.service.issuer(f.request, "issuerA");
  await f.service.activeEnterprise(f.request, "sellerB");
});

test("malformed, contradictory, oversized or inactive issuer scope evidence never discards a denial", async t => {
  for (const mutate of [
    value => { value.principalCode = "another"; }, value => { value.principalType = "service"; },
    value => { value.scopeCount = 2; }, value => { value.deniedScopes = undefined; },
    value => { value.scopes = Array.from({ length: 1001 }, () => value.scopes[0]); },
    value => { value.deniedScopes = new Array(1); }, value => { value.deniedScopes = [null]; },
    value => { value.deniedScopes = [{ scopeType: "GLOBAL", scopeCode: "" }]; },
    value => { value.scopes[0].effect = "DENY"; }, value => { value.deniedScopes = [{ ...value.scopes[0], effect: "ALLOW" }]; },
    value => { value.scopes[0].enterpriseCode = {}; }, value => { value.scopes[0].active = false; },
    value => { value.scopes[0].status = "INACTIVE"; }, value => { value.scopes[0].scopeType = " ENTERPRISE"; },
  ]) await t.test("reject malformed owner evidence", async t => {
    const f = fixture(t); mutate(f.state.scope);
    await assert.rejects(f.service.issuer(f.request, "issuerA"), refused);
  });
});

test("enterprise qualifiers and wildcard capability DENY retain canonical precedence", async t => {
  const f = fixture(t);
  f.state.scope.scopes = [{ scopeType: "GLOBAL", scopeCode: "*", enterpriseCode: "foreign" }];
  await assert.rejects(f.service.issuer(f.request, "issuerA"), refused);
  f.state.scope.scopes = [f.scope];
  f.state.scope.deniedScopes = [{ ...f.scope, capabilityCode: "*", effect: "DENY" }];
  await assert.rejects(f.service.issuer(f.request, "issuerA"), refused);
  f.state.scope.deniedScopes[0].enterpriseCode = "foreign";
  await f.service.issuer(f.request, "issuerA");
  for (const blank of [undefined, null, ""]) {
    f.state.scope.deniedScopes = [];
    f.state.scope.scopes = [{ ...f.scope, tenantCode: blank, enterpriseCode: blank, capabilityCode: blank, permissionCode: blank }];
    await f.service.issuer(f.request, "issuerA");
  }
});

test("actual Profile-resolved scopes preserve unrestricted qualifiers and fresh DENY at issuer admission", async t => {
  const f = fixture(t);
  const profile = { ...profileScopes, getPolicy: () => ({
    defaultEffect: "ALLOW", defaultStatus: "ACTIVE", defaultInheritanceMode: "DIRECT",
  }) };
  const assignment = { code: "issuer-scope", principalType: "human", principalCode: f.request.authData.loginId,
    scopeType: "ENTERPRISE", scopeCode: "issuerA", tenantCode: "tenantA", enterpriseCode: "issuerA",
    permissionCode: "", capabilityCode: null, effect: "ALLOW", status: "ACTIVE" };
  f.state.scope = profile.resolveAssignments(f.request.authData, [assignment]);
  await f.service.issuer(f.request, "issuerA");
  f.state.scope = profile.resolveAssignments(f.request.authData, [assignment,
    { ...assignment, code: "issuer-deny", effect: "DENY", permissionCode: null, capabilityCode: "*" }]);
  await assert.rejects(f.service.issuer(f.request, "issuerA"), refused);
});

test("active enterprise evidence requires exactly one matching active identity", async t => {
  for (const rows of [[], [{ code: "foreign", active: true }], [{ code: "sellerB", active: false }],
    [{ code: "sellerB", active: true }, { code: "sellerB", active: true }], [null]]) await t.test(JSON.stringify(rows), async t => {
    const f = fixture(t); f.state.enterprises = rows;
    await assert.rejects(f.service.activeEnterprise(f.request, "sellerB"), refused);
  });
});

test("Profile enterprise business Tenant relationship is independent of the lookup partition", async t => {
  const f = fixture(t);
  f.state.enterprises = { code: "SUC_PROFILE", result: [{ code: "sellerB", active: true, tenant: "sellerBusinessTenant" }] };
  await f.service.activeEnterprise(f.request, "sellerB");
  assert.equal(f.state.calls[0].tenant, "tenantA");
  assert.deepEqual(f.state.calls[0].request, { tenant: "tenantA" });
  assert.deepEqual(f.state.calls[0].requestBody, { type: "enterprise", codes: ["sellerB"] });
});

test("issuer scope matching is detached from caller mutations during Profile awaits", async t => {
  const f = fixture(t);
  SERVICE.DefaultModuleService.invokeModule = async () => {
    f.request.tenant = "foreign"; f.request.authData.loginId = "another";
    return structuredClone(f.state.scope);
  };
  await f.service.issuer(f.request, "issuerA");
});

test("reviewed consent command and original actor cannot change across the campaign read await", async t => {
  const f = fixture(t), r = f.request;
  r.promotionCode = "offer";
  r.payload = { action: "GRANT", sellerEnterpriseCode: "sellerB", expectedRevision: 0,
    expiresAt: "2099-01-01T00:00:00.000Z", commandReference: "reviewed-command-001" };
  let row = { code: "offer", tenant: "tenantA", active: true, revision: 0,
    issuerEnterpriseRef: { moduleName: "profile", schemaName: "enterprise", code: "issuerA" } };
  f.service.campaign = async () => {
    r.payload.sellerEnterpriseCode = "foreign"; r.payload.commandReference = "replacement-command";
    r.authData.loginId = "another";
    return structuredClone(row);
  };
  f.service.activeEnterprise = async (_context, code) => assert.equal(code, "sellerB");
  SERVICE.DefaultPromotionOperationService.serviceAuthData = context => context.authData;
  SERVICE.DefaultPromotionService = { update: async command => {
    row = { ...row, ...structuredClone(command.model) };
    return { code: "SUC_UPDATE", result: { acknowledged: true, matchedCount: 1 } };
  } };
  await f.service.manage(r);
  assert.equal(row.sellerAuthorizations[0].sellerEnterpriseCode, "sellerB");
  assert.equal(row.sellerAuthorizations[0].actorId, "issuer@example.test");
  assert.equal(row.sellerAuthorizations[0].commandReference, "reviewed-command-001");
});

test("later-layer Profile admission narrowing is honored without fallback", async t => {
  const f = fixture(t);
  f.service.profileResult = () => { throw new Error("narrowed owner"); };
  await assert.rejects(f.service.issuer(f.request, "issuerA"), /narrowed owner/);
  await assert.rejects(f.service.activeEnterprise(f.request, "sellerB"), /narrowed owner/);
});
