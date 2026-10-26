/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module profile/test/currentPrincipalEnterpriseDisplay
 * @description Exercises the actual self-read controller, actor, Enterprise/Tenant reads,
 * scope resolver and native binding owner with isolated storage/stamp fixtures.
 * @owner profile @layer test No runtime, credentials, grants or data are mutated.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const source = require("../src/service/identity/defaultPrincipalScopeGovernanceService");
const controller = require("../src/controller/identity/defaultPrincipalScopeController");
const membershipSource = require("../src/service/enterprise/defaultEnterpriseMembershipService");
const enterpriseSource = require("../src/service/enterprise/defaultEnterpriseService");
const managementSource = require("../src/service/enterprise/defaultEnterpriseManagementService");
const authenticationSource = require("../src/service/authentication/defaultAuthenticationProviderService");
const properties = require("../config/properties");
function setup() {
  const tenant = "sharedTenant", code = "native-private-920001", calls = [];
  const person = { code: "employee", loginId: "staff@example.test", active: true, principalType: "human", authVersion: 1,
    enterpriseCode: code, password: "private", userGroups: ["retail"] };
  const enterprise = { code, name: "GreenPerks Retail", active: true, tenant, properties: { secret: "hidden" }, contacts: ["private"] };
  const request = { tenant, authData: { tenant, entCode: code, tokenType: "access", principalType: "human", loginId: person.loginId,
    authVersion: 1, userGroups: ["retail"] }, headers: { "x-enterprise-code": code }, httpRequest: { header() {} } };
  global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message || code); this.code = code; } } };
  global.CONFIG = { get: key => key === "principalAuthorizationScopes" ? properties.principalAuthorizationScopes :
    key === "enterpriseManagement" ? properties.enterpriseManagement :
    key === "defaultTenant" ? "authority" : key === "defaultEnterprise" ? "default" : undefined };
  const owner = { ...enterpriseSource, get: async read => {
    calls.push(["enterprise", structuredClone(read)]);
    return { code: "SUC_DBS_00000", result: [enterprise] };
  } };
  const membership = { ...membershipSource, read: async () => person,
    anchor: async () => ({ person }), locator: () => ({}) };
  global.SERVICE = {
    DefaultPrincipalScopeGovernanceService: { ...source }, DefaultEnterpriseMembershipService: membership,
    DefaultEnterpriseService: owner, DefaultEnterpriseManagementService: { ...managementSource },
    DefaultTenantService: { get: async read => { calls.push(["tenant", structuredClone(read)]);
      return { code: "SUC_DBS_00000", result: [{ code: tenant, active: true, properties: { secret: "hidden" } }] }; } },
    DefaultPrincipalSecurityStampService: { validate: async () => { calls.push(["actor"]); } },
    DefaultAuthenticationProviderService: { ...authenticationSource },
    DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ isSystem: true }) },
    DefaultPrincipalScopeAssignmentService: { get: async read => { calls.push(["scopes", structuredClone(read)]);
      return { code: "SUC_DBS_00000", result: [] }; } },
  };
  return { request, person, enterprise, calls, owner, membership };
}
const refused = async request => assert.rejects(controller.mine(request), error => error.code === "ERR_AUTH_00003" && error.message === "ERR_AUTH_00003");
test("Retail human self-read projects only canonical signed Enterprise code/name without directory grants", async () => {
  const f = setup(), response = await controller.mine(f.request);
  assert.deepEqual(response, { code: "SUC_PRFL_00000", data: { principalCode: f.person.loginId, principalType: "human",
    scopeCount: 0, scopes: [], deniedScopes: [], enterprise: { code: f.enterprise.code, displayName: f.enterprise.name } } });
  for (const [kind, read] of f.calls.filter(([kind]) => ["enterprise", "tenant"].includes(kind))) {
    assert.equal(read.tenant, "authority"); assert.equal(read.options.skipItemCache, true);
    assert.equal(read.searchOptions.pageSize, 2);
    assert.deepEqual(read.query, { code: kind === "enterprise" ? f.enterprise.code : f.request.tenant });
  }
  assert.equal(f.calls.filter(([kind]) => kind === "actor").length, 2);
});
for (const name of [undefined, null, "", "   ", { en: "Never guess" }, "private\nname", "x".repeat(properties.enterpriseManagement.search.maximumNameLength + 1)]) {
  test("unavailable canonical name stays null: " + JSON.stringify(name), async () => {
    const f = setup(); f.enterprise.name = name;
    assert.deepEqual((await controller.mine(f.request)).data.enterprise, { code: f.enterprise.code, displayName: null });
  });
}
for (const mutate of [
  f => { f.request.query = { enterpriseCode: "foreign" }; },
  f => { f.request.httpRequest.query = { tenant: "foreign" }; },
  f => { f.request.body = { code: f.enterprise.code }; },
  f => { f.request.headers["x-enterprise-code"] = "foreign"; },
  f => { f.request.enterpriseCode = "foreign"; },
  f => { f.request.tenant = "foreign"; },
  f => { f.request.authData.isSystem = true; },
  f => { f.person.enterpriseCode = "sameTenantForeign"; },
  f => { f.person.metadata = { enterpriseCode: "foreign" }; },
  f => { delete f.person.enterpriseCode; },
  f => { f.person.authVersion = 2; },
  f => { f.enterprise.tenant = "foreignTenant"; },
  f => { f.enterprise.code = "foreign"; },
  f => { f.enterprise.active = false; },
  f => { f.enterprise.disabled = true; },
]) test("refuses selectors, stale identity or foreign placement " + mutate.toString(), async () => {
  const f = setup(); mutate(f); await refused(f.request);
});
test("unbound native principal is allowed only in configured default Enterprise", async () => {
  const f = setup(); delete f.person.enterpriseCode; f.enterprise.code = "default";
  f.request.authData.entCode = "default"; f.request.headers["x-enterprise-code"] = "default";
  assert.equal((await controller.mine(f.request)).data.enterprise.code, "default");
});
test("registered native principal uses existing registration gate", async () => {
  const f = setup(); f.person.registrationAssignmentCode = "registered"; let calls = 0;
  SERVICE.DefaultEnterpriseRegistrationService = { assertSessionEligible: async ({ person, enterprise }) => {
    calls++; assert.equal(person, f.person); assert.equal(enterprise.code, f.enterprise.code);
  } };
  await controller.mine(f.request); assert.equal(calls, 2);
  SERVICE.DefaultEnterpriseRegistrationService.assertSessionEligible = async () => { throw Error("private assignment"); };
  await refused(f.request);
});
test("linked context reuses current membership and never checks canonical native Enterprise placement", async () => {
  const f = setup(); f.request.authData.sessionContext = { owner: "profile", code: "membership" };
  f.person.enterpriseCode = "canonicalHome"; f.membership.policy = () => ({}); let calls = 0;
  f.membership.validateContext = async () => { calls++; return { person: f.person }; };
  await controller.mine(f.request); assert.equal(calls, 2);
  f.membership.validateContext = async () => { throw Error("private revoked membership"); };
  await refused(f.request);
});
test("late actor revocation and request context drift cannot return private display", async () => {
  for (const mode of ["revoked", "auth", "header", "selector", "binding"]) {
    const f = setup(); let reads = 0;
    SERVICE.DefaultPrincipalSecurityStampService.validate = async () => {
      if (++reads === 2) {
        if (mode === "revoked") throw Error("private credential");
        if (mode === "binding") f.person.enterpriseCode = "foreign";
        if (mode === "auth") f.request.authData.entCode = "foreign";
        if (mode === "header") f.request.headers = { "x-enterprise-code": "foreign" };
        if (mode === "selector") f.request.query = { code: "foreign" };
      }
    };
    await refused(f.request);
  }
});
for (const response of [undefined, { code: "ERR_DBS_00000", result: [] }, { code: "SUC_DBS_00000", result: [] }]) {
  test("uncertain Enterprise lookup is redacted: " + JSON.stringify(response), async () => {
    const f = setup(); f.owner.get = async () => response; await refused(f.request);
  });
}
test("controller callback returns the same allowlisted result", async () => {
  const f = setup(); const result = await new Promise((resolve, reject) => controller.mine(f.request, (error, value) => error ? reject(error) : resolve(value)));
  assert.equal(result.data.enterprise.displayName, f.enterprise.name);
});
test("later Profile owner display customization stays behind exact binding validation", async () => {
  const f = setup(); const get = f.membership.enterprise;
  f.membership.enterprise = async function (code) { const row = await get.call(this, code); row.enterprise.name = "Customized canonical business name"; return row; };
  assert.equal((await controller.mine(f.request)).data.enterprise.displayName, "Customized canonical business name");
  f.person.enterpriseCode = "foreign"; await refused(f.request);
});

test("display bound inherits the existing Profile search default and respects later overrides", async () => {
  const f = setup(), get = CONFIG.get;
  f.enterprise.name = "N".repeat(properties.enterpriseManagement.search.maximumNameLength);
  assert.equal((await controller.mine(f.request)).data.enterprise.displayName, f.enterprise.name);
  let bound = 12;
  CONFIG.get = key => key === "enterpriseManagement" ? { search: { maximumNameLength: bound } } : get(key);
  assert.equal((await controller.mine(f.request)).data.enterprise.displayName, null);
  f.enterprise.name = "N".repeat(bound);
  assert.equal((await controller.mine(f.request)).data.enterprise.displayName, f.enterprise.name);
  for (const invalid of [undefined, null, 0, -1, 1.5, "12", NaN]) {
    bound = invalid; await refused(f.request);
  }
});
test("empty plain and null-prototype request maps are accepted while every selector is refused", async () => {
  for (const proto of [Object.prototype, null]) {
    const f = setup();
    for (const target of [f.request, f.request.httpRequest]) {
      target.query = Object.create(proto); target.body = Object.create(proto);
    }
    f.request.payload = Object.create(proto);
    assert.equal((await controller.mine(f.request)).data.enterprise.code, f.enterprise.code);
    for (const target of [f.request, f.request.httpRequest]) {
      for (const key of ["query", "body"]) {
        target[key].enterpriseCode = "foreign"; await refused(f.request); delete target[key].enterpriseCode;
      }
    }
    f.request.payload.tenant = "foreign"; await refused(f.request);
  }
});
for (const expressPath of ["express", ...(process.env.PROFILE_TEST_EXPRESS_PATH ? [process.env.PROFILE_TEST_EXPRESS_PATH] : [])]) {
  const express = require(expressPath);
  test("real Express request/parser/header self-read: " + expressPath, async t => {
    const f = setup(), app = express(); app.set("query parser", "simple");
    const observations = [];
    app.get("/identity/scopes/me", async (httpRequest, httpResponse) => {
      let proto = httpRequest, descriptor;
      while (proto && !descriptor) { descriptor = Object.getOwnPropertyDescriptor(proto, "query"); proto = Object.getPrototypeOf(proto); }
      observations.push({ nullPrototype: Object.getPrototypeOf(httpRequest.query) === null,
        getter: typeof descriptor?.get === "function", header: httpRequest.header("x-enterprise-code") });
      const request = { ...f.request, query: httpRequest.query, headers: httpRequest.headers, httpRequest };
      try { httpResponse.json(await controller.mine(request)); }
      catch (error) { httpResponse.status(403).json({ code: error.code }); }
    });
    const server = app.listen(0, "127.0.0.1");
    t.after(() => new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())));
    await new Promise((resolve, reject) => { server.once("listening", resolve); server.once("error", reject); });
    const origin = "http://127.0.0.1:" + server.address().port;
    for (const binding of ["enterprise", "metadata", "default"]) {
      delete f.person.metadata; delete f.person.enterpriseCode;
      f.enterprise.code = binding === "default" ? "default" : "native-private-920001";
      f.request.authData.entCode = f.enterprise.code;
      if (binding === "enterprise") f.person.enterpriseCode = f.enterprise.code;
      if (binding === "metadata") f.person.metadata = { enterpriseCode: f.enterprise.code };
      const headers = { "x-enterprise-code": f.enterprise.code, "x-tenant-code": f.request.tenant };
      const response = await fetch(origin + "/identity/scopes/me", { headers });
      assert.equal(response.status, 200);
      const result = await response.json();
      assert.equal(result.data.principalCode, f.person.loginId);
      assert.deepEqual(result.data.enterprise, { code: f.enterprise.code, displayName: f.enterprise.name });
      const selected = await fetch(origin + "/identity/scopes/me?enterpriseCode=" + f.enterprise.code, { headers });
      assert.equal(selected.status, 403);
    }
    assert.equal(observations.every(row => row.nullPrototype), true);
    if (expressPath !== "express") assert.equal(observations.every(row => row.getter), true);
    const foreign = await fetch(origin + "/identity/scopes/me", { headers: { "x-enterprise-code": "foreign" } });
    assert.equal(foreign.status, 403);
  });
}
test("direct native Profile scope projection still admits actual Digital and Carbon owner reads", async () => {
  const f = setup(), get = CONFIG.get;
  const digital = require("../../../../nodics.commerce/modules/digitalCommerce/modules/digitalCore/src/service/defaultDigitalBundleAuthorityService");
  const bundles = require("../../../../nodics.commerce/modules/digitalCommerce/modules/digitalCore/src/service/defaultDigitalBundleService");
  const digitalProperties = require("../../../../nodics.commerce/modules/digitalCommerce/modules/digitalCore/config/properties");
  const carbon = require("../../../../nodics.waste/modules/wasteCarbon/src/service/defaultWasteCarbonReadAccessService");
  const carbonHolding = require("../../../../nodics.waste/modules/wasteCarbon/src/service/defaultWasteCarbonHoldingService");
  const carbonProperties = require("../../../../nodics.waste/modules/wasteCarbon/config/properties");
  const security = require("../../../../nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService");
  CONFIG.get = key => key === "digitalCore" ? digitalProperties.digitalCore : key === "wasteCarbon" ? carbonProperties.wasteCarbon : get(key);
  f.request.authData.permissions = ["commerce.digital.own.read", "carbon.holdings.read"];
  f.request.query = Object.create(null);
  const scope = { code: "direct-native-scope", active: true, status: "ACTIVE", effect: "ALLOW", inheritanceMode: "DIRECT",
    principalType: "human", principalCode: f.person.loginId, scopeType: "ENTERPRISE", scopeCode: f.enterprise.code,
    enterpriseCode: f.enterprise.code, tenantCode: f.request.tenant };
  SERVICE.DefaultPrincipalScopeAssignmentService.get = async () => ({ code: "SUC_DBS_00000", result: [scope] });
  SERVICE.DefaultDigitalBundleService = bundles;
  SERVICE.DefaultSecuredRequestPipelineService = security;
  SERVICE.DefaultWasteCarbonHoldingService = carbonHolding;
  let reads = 0;
  SERVICE.DefaultModuleService = { invokeModule: async call => {
    assert.equal(call.apiName, "/identity/scopes/me");
    assert.equal(call.header["X-Enterprise-Code"], f.enterprise.code);
    assert.equal(call.header.Authorization, "Bearer fixture");
    reads++; return controller.mine(f.request);
  } };
  const ownerRef = { module: "profile", schema: "enterprise", code: f.enterprise.code };
  const request = { ...f.request, authorization: "Bearer fixture", payload: { ownerRef } };
  assert.equal((await digital.authorize(request, { ownerRef, action: "HOLDINGS_READ" })).authorized, true);
  assert.deepEqual(await carbon.resolve(request), ownerRef);
  assert.equal(reads, 2);
});
