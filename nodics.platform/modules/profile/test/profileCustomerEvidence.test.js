/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module profile/test/profileCustomerEvidence @description Isolated exact runtime/customer/placement/private-read admission, not JWT issuance or native acceptance. @layer test @owner profile */
const test = require("node:test"), assert = require("node:assert/strict");
const service = require("../src/service/identity/defaultProfileCustomerEvidenceService");
const controller = require("../src/controller/identity/defaultProfileCustomerEvidenceController");
const runtime = require("../../../../nodics.foundation/modules/nAuth/src/service/identity/defaultServiceTokenService");
const route = require("../src/router/routers").profile.references.customerEvidence;
function fixture(t) {
  const previous = Object.fromEntries(["SERVICE", "CONFIG", "NODICS", "CLASSES"].map(k => [k, global[k]]));
  t.after(() => { for (const [k, v] of Object.entries(previous)) if (v === undefined) delete global[k]; else global[k] = v; });
  const grant = { tenant: "t", principalEnterpriseCode: "default", enterpriseCode: "business", serviceId: "runtime",
    projectCode: "project", environmentCode: "local", serverCode: "waste", instanceCode: "instance", assignmentCode: "assignment" };
  const config = { profileCustomerEvidence: { enabled: true, runtimeRole: "PLATFORM", callers: [grant] }, runtimeRole: { code: "PLATFORM" }, defaultTenant: "default" };
  const authData = { tokenType: "service", principalType: "service", serviceId: "runtime", tenant: "t", entCode: "default", groups: [], userGroups: [],
    permissions: ["profile.customer.reference.read"], modules: ["profile"], runtimeInstanceId: "instance", runtimeScope: { ...grant } };
  const rows = { DefaultEnterpriseService: [{ code: "business", tenant: "t", active: true, revision: 1 }],
    DefaultTenantService: [{ code: "t", active: true, revision: 1 }],
    DefaultCustomerService: [{ code: "customer", loginId: "login", active: true, password: "private", metadata: { private: true } }] };
  const state = { reads: 0, private: true, drift: false, badCount: false };
  global.CONFIG = { get: k => config[k] }; global.NODICS = { getSelectedEnvironmentName: () => "local" };
  global.CLASSES = { NodicsError: class extends Error {} };
  global.SERVICE = { DefaultServiceTokenService: runtime, DefaultProfileCustomerEvidenceService: service,
    DefaultLoggerService: { hasPrivateCaptureProtection: () => state.private }, DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ owner: true }) } };
  for (const name of Object.keys(rows)) SERVICE[name] = { get: async r => {
    state.reads++; assert.deepEqual(r.authData, { owner: true }); assert.equal(r.options.skipItemCache, true);
    assert.equal(r.searchOptions.limit, 2); assert.equal(r.tenant, name === "DefaultCustomerService" ? "t" : "default");
    if (state.drift && name === "DefaultCustomerService") config.profileCustomerEvidence.callers = [];
    return { code: "SUC_GET", result: structuredClone(rows[name]), ...(state.badCount ? { count: 9 } : {}) };
  }, save: () => assert.fail("Read evidence cannot write") };
  const request = { tenant: "t", authData, payload: { contractVersion: 1, enterpriseCode: "business", identifier: "login" } };
  return { config, authData, rows, state, request };
}
test("exact approved groupless default-enterprise deployment receives only canonical customer code/login and unchanged claims", async t => {
  const f = fixture(t), original = structuredClone(f.authData), customer = structuredClone(f.rows.DefaultCustomerService[0]);
  assert.equal(Object.hasOwn(customer, "tenant"), false);
  Object.assign(f.request, { enterpriseCode: "default", entCode: "default", httpRequest: { headers: { "x-enterprise-code": "default" } } });
  assert.deepEqual(await service.read(f.request), { contractVersion: 1, tenant: "t", enterpriseCode: "business", customer: { code: "customer", loginId: "login", active: true } });
  assert.deepEqual(f.authData, original); f.request.payload.identifier = "customer";
  assert.equal((await service.read(f.request)).customer.code, "customer");
  assert.deepEqual(f.rows.DefaultCustomerService[0], customer);
});
test("an explicit matching customer tenant is compatible but contradictory tenant values refuse", async t => {
  const f = fixture(t);
  f.rows.DefaultCustomerService[0].tenant = "t";
  assert.equal((await service.read(f.request)).tenant, "t");
  for (const tenant of ["foreign", null, "", { code: "t" }]) {
    f.rows.DefaultCustomerService[0].tenant = tenant;
    await assert.rejects(service.read(f.request), { message: "Exact authorized Profile customer evidence is unavailable" });
  }
});
test("each original generated read partition is pinned across its await", async t => {
  for (const stage of [1, 2, 3, 4, 5]) await t.test(`read ${stage}`, async t => {
    const f = fixture(t);
    // Keep legacy matching tenant so partition drift cannot be masked by the absence regression.
    f.rows.DefaultCustomerService[0].tenant = "t";
    for (const name of Object.keys(f.rows)) {
      const get = SERVICE[name].get;
      SERVICE[name].get = async r => {
        const value = await get(r);
        if (f.state.reads === stage) r.tenant = "foreign";
        return value;
      };
    }
    await assert.rejects(service.read(f.request), { message: "Exact authorized Profile customer evidence is unavailable" });
    assert.equal(f.state.reads, stage);
  });
});
test("original partition, claims, selectors, placement and capture drift across a customer await refuse", async t => {
  const mutations = {
    partition: f => { f.request.tenant = "foreign"; },
    claims: f => { f.authData.tenant = "foreign"; },
    selector: f => { f.request.payload.identifier = "other"; },
    placement: f => { f.rows.DefaultEnterpriseService[0].revision++; },
    capture: f => { f.state.private = false; },
  };
  for (const [name, mutate] of Object.entries(mutations)) await t.test(name, async t => {
    const f = fixture(t), get = SERVICE.DefaultCustomerService.get;
    f.rows.DefaultCustomerService[0].tenant = "t";
    SERVICE.DefaultCustomerService.get = async r => { const value = await get(r); mutate(f); return value; };
    await assert.rejects(service.read(f.request), { message: "Exact authorized Profile customer evidence is unavailable" });
  });
});
test("transport aliases must match the original principal, never the separately allowlisted business body selector", async t => {
  const f = fixture(t);
  for (const alias of [{ enterpriseCode: "business" }, { entCode: "business" },
    { httpRequest: { headers: { "x-enterprise-code": "business" } } },
    { httpRequest: { headers: { "x-enterprise-code": "other" } } }]) {
    await assert.rejects(service.read({ ...f.request, ...alias })); assert.equal(f.state.reads, 0);
  }
  const get = SERVICE.DefaultCustomerService.get;
  SERVICE.DefaultCustomerService.get = async r => { const value = await get(r); f.request.enterpriseCode = "business"; return value; };
  await assert.rejects(service.read(f.request));
});
test("missing, duplicate, foreign deployment grants, permission, private capture and policy refuse before reads", async t => {
  const f = fixture(t);
  for (const mutate of [() => { f.config.profileCustomerEvidence.enabled = false; },
    () => { f.config.profileCustomerEvidence.callers = []; }, () => { f.config.profileCustomerEvidence.callers.push(structuredClone(f.config.profileCustomerEvidence.callers[0])); },
    () => { f.authData.runtimeScope.serverCode = "other"; }, () => { f.authData.permissions = []; }, () => { f.state.private = false; }]) {
    const config = structuredClone(f.config), auth = structuredClone(f.authData); mutate();
    await assert.rejects(service.read(f.request)); assert.equal(f.state.reads, 0);
    Object.assign(f.config, config); Object.assign(f.authData, auth); f.state.private = true;
  }
});
test("query operators, unknown fields and conflicting scope cannot select identities or tenant persistence", async t => {
  const f = fixture(t);
  for (const extra of [{ identifier: { $ne: null } }, { query: {} }, { tenant: "foreign" }, { enterpriseCode: "other" }])
    await assert.rejects(service.read({ ...f.request, payload: { ...f.request.payload, ...extra } }));
  await assert.rejects(service.read({ ...f.request, tenant: "foreign" })); assert.equal(f.state.reads, 0);
});
test("foreign placement, inactive/ambiguous customer and read truncation never disclose a customer", async t => {
  const f = fixture(t);
  const cases = [["DefaultEnterpriseService", { tenant: "foreign" }], ["DefaultTenantService", { active: false }],
    ["DefaultCustomerService", { tenant: "foreign" }], ["DefaultCustomerService", { active: false }], ["DefaultCustomerService", { code: "other", loginId: "other" }]];
  for (const [name, patch] of cases) { const original = structuredClone(f.rows[name]); Object.assign(f.rows[name][0], patch);
    await assert.rejects(service.read(f.request)); f.rows[name] = original; }
  f.rows.DefaultCustomerService.push(structuredClone(f.rows.DefaultCustomerService[0])); await assert.rejects(service.read(f.request));
  f.rows.DefaultCustomerService.pop(); f.state.badCount = true; await assert.rejects(service.read(f.request));
});
test("mid-read policy revocation and provider failures refuse without private diagnostics", async t => {
  const f = fixture(t), grants = structuredClone(f.config.profileCustomerEvidence.callers);
  f.state.drift = true; await assert.rejects(service.read(f.request));
  f.state.drift = false; f.config.profileCustomerEvidence.callers = grants;
  SERVICE.DefaultCustomerService.get = async () => { throw Error("Bearer private credential"); };
  await assert.rejects(service.read(f.request), error => !/Bearer|credential/.test(error.message));
});
test("actual route/controller preserve private original request and noncacheable service-only contract", async t => {
  const f = fixture(t), headers = [];
  assert.equal(route.key, "/internal/customer-evidence"); assert.deepEqual(route.authTokenTypes, ["service"]);
  assert.equal(route.permission, "profile.customer.reference.read"); assert.equal(route.requestPrivacy.sensitive, true);
  const result = await controller.read({ ...f.request, httpRequest: { body: f.request.payload }, httpResponse: { setHeader: (...v) => headers.push(v) } });
  assert.equal(result.data.customer.code, "customer"); assert.deepEqual(headers, [["Cache-Control", "no-store"]]);
});
