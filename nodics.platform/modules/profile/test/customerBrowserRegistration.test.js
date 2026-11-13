/*
    Nodics - Enterprice Micro-Services Management Framework
    Copyright (c) 2026 Nodics All rights reserved.
    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.
 */
/** @module profile/test/customerBrowserRegistration @description Exercises public signup admission with the real browser origin and form owners, including policy drift and zero-write refusals. @layer test @owner profile */
const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const defaults = require("../config/properties");
const registration = require("../src/service/customer/defaultCustomerRegistrationService");
const controller = require("../src/controller/authentication/defaultCustomerBrowserSessionController");
const sessions = require("../src/service/authentication/defaultBrowserSessionService");
let config, calls, saved, placement;
/** Builds only an HTTP form fixture; spoofed authority is deliberately separate. */
const request = () => ({
  tenant: "fixture", entCode: "shop", enterprise: { code: "shop" },
  httpRequest: { ip: "127.0.0.1", headers: { origin: "https://shop.example", "x-enterprise-code": "shop" },
    body: { name: "Test Visitor", email: "visitor@example.invalid", password: "Fixture-password-2026", userGroups: ["adminGroup"], emailVerified: true } },
  httpResponse: { setHeader() {} },
});
beforeEach(() => {
  config = {
    defaultTenant: "fixture", defaultEnterprise: "shop",
    profileCustomerRegistrationForm: structuredClone(defaults.profileCustomerRegistrationForm),
    profileCustomerBrowserSession: { ...defaults.profileCustomerBrowserSession, enabled: true },
    httpHardening: { cors: { enabled: true, allowCredentials: true, allowedOrigins: ["https://shop.example"] } },
  };
  config.profileCustomerRegistrationForm.browser.enabled = true;
  calls = []; saved = null;
  placement = { tenantCode: "fixture", enterprise: { code: "shop", active: true, tenant: { code: "fixture", active: true } } };
  global.CONFIG = { get: key => config[key] };
  global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
  global.SERVICE = {
    DefaultCustomerRegistrationService: registration,
    DefaultBrowserSessionService: sessions,
    DefaultHttpHardeningService: require("../../../../nodics.foundation/modules/nRouter/src/service/defaultHttpHardeningService"),
    DefaultRateLimitService: { enforce: async input => { calls.push(input); } },
    DefaultEnterpriseManagementService: { retrieveEnterpriseForAccess: async () => placement },
    DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ isSystem: true }) },
  };
  global.FACADE = { DefaultCustomerFacade: { signUp: async input => { saved = input; } } };
});
test("public signup uses bounded default placement and two distributed limits, returning no session or verification", async () => {
  const result = await controller.register(request());
  assert.equal(result.code, "SUC_PRFL_00000");
  assert.deepEqual(result.result, { registered: true });
  assert.equal(saved.tenant, "fixture"); assert.equal(saved.enterprise.code, "shop");
  assert.equal(saved.model.userGroups, undefined); assert.equal(saved.model.emailVerified, undefined);
  assert.equal(saved.httpRequest, undefined);
  assert.deepEqual(calls.map(x => [x.operation, x.requireDistributed, x.tenant]), [["request", true, "fixture"], ["identity", true, "fixture"]]);
});
test("default-off, malformed limits, browser disablement and unknown origins perform no signup", async () => {
  for (const change of [
    () => { config.profileCustomerRegistrationForm.browser.enabled = false; },
    () => { config.profileCustomerRegistrationForm.browser.rates.request.limit = 0; },
    () => { config.profileCustomerBrowserSession.enabled = false; },
    () => { config.httpHardening.cors.allowedOrigins = ["https://different.example"]; },
  ]) {
    const backup = structuredClone(config); change();
    await assert.rejects(controller.register(request())); assert.equal(saved, null);
    config = backup;
  }
});
test("foreign tenant or enterprise selectors and invalid forms cannot create an account", async () => {
  for (const change of [r => { r.tenant = "foreign"; }, r => { r.entCode = "foreign"; },
    r => { r.enterprise.code = "foreign"; }, r => { r.httpRequest.headers["x-enterprise-code"] = "foreign"; },
    r => { r.httpRequest.body.email = "invalid"; }, r => { r.httpRequest.ip = ""; }]) {
    const r = request(); change(r); await assert.rejects(controller.register(r)); assert.equal(saved, null);
  }
});
test("rate-limit refusal and unavailable rate owner never enter signup", async () => {
  SERVICE.DefaultRateLimitService.enforce = async () => { throw new Error("Rate denied"); };
  await assert.rejects(controller.register(request())); assert.equal(saved, null);
  delete SERVICE.DefaultRateLimitService;
  await assert.rejects(controller.register(request())); assert.equal(saved, null);
});
test("inactive placement and policy drift during awaited admission fail before persistence", async () => {
  placement.enterprise.active = false;
  await assert.rejects(controller.register(request())); assert.equal(saved, null);
  placement.enterprise.active = true;
  SERVICE.DefaultEnterpriseManagementService.retrieveEnterpriseForAccess = async () => {
    config.profileCustomerRegistrationForm.browser.enabled = false; return placement;
  };
  await assert.rejects(controller.register(request())); assert.equal(saved, null);
});
test("later layers may tighten rate bounds without changing origin or placement", async () => {
  config.profileCustomerRegistrationForm.browser.rates.identity.limit = 2;
  await controller.register(request()); assert.equal(calls[1].limit, 2);
});
test("public browser entry does not relax the service registration route", () => {
  const routes = require("../src/router/routers").profile;
  const service = routes.customerSignUp.registerCustomerForm;
  assert.equal(service.secured, true); assert.deepEqual(service.authTokenTypes, ["service"]);
  assert.equal(defaults.profileCustomerRegistrationForm.browser.enabled, false);
  const browser = Object.values(routes).flatMap(Object.values).find(x => x.key === "/customer/browser/register");
  assert.equal(browser.handler, "DefaultCustomerBrowserSessionController"); assert.equal(browser.operation, "register");
  assert.deepEqual(browser.requestPrivacy, { sensitive: true });
});
