/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module digitalCore/test/digitalCertificateHoldings @description Verifies safe bounded certificate selection, typed owners and fresh authority across remote reads. @owner digitalCore @layer test */
const test = require("node:test"), assert = require("node:assert/strict");
const service = require("../src/service/defaultDigitalCertificateHoldingsService");
const bundle = require("../src/service/defaultDigitalBundleService");
const controller = require("../src/controller/defaultDigitalCommerceCustomerController");
const properties = require("../config/properties");
function fixture(t, enterprise = false) {
  const prior = { SERVICE: global.SERVICE, CONFIG: global.CONFIG };
  t.after(() => Object.assign(global, prior));
  const ownerRef = { module: "profile", schema: enterprise ? "enterprise" : "customer", code: "owner" };
  const r = { tenant: "T", enterpriseCode: "owner", authData: { tenant: "T", principalType: enterprise ? "human" : "customer", enterpriseCode: "owner", loginId: "actor" } };
  let denied = false, calls = 0, revoke = false;
  const value = { contractVersion: 1, ownerRef, page: 1, limit: properties.digitalCore.bundles.certificatePageSize,
    total: 1, items: [{ code: "certificate", revision: 3, available: true, valid: true, categoryCode: "phone", privateEvidence: "hidden" }] };
  global.CONFIG = { get: key => properties[key] };
  global.SERVICE = { DefaultDigitalBundleService: { ...bundle, authorize: async (r, owner, action) => {
    calls++; assert.equal(action, "HOLDINGS_READ"); assert.deepEqual(owner, ownerRef); if (denied) throw Error("permission revoked");
  } }, DefaultDigitalBundleAuthorityService: { profile: async () => ({ contractVersion: 1, tenant: "T", customer: { code: "owner", loginId: "actor" } }) },
  DefaultDigitalCommerceOwnershipService: { remote: async (r, phase, input) => {
    assert.equal(phase, "bundle-holdings"); assert.deepEqual(input, { ownerRef, page: value.page, limit: value.limit });
    if (revoke) denied = true; return value;
  } } };
  return { r, ownerRef, value, calls: () => calls, revoke: () => { revoke = true; } };
}
test("canonical customer holdings strip remote private fields and recheck owner authority", async t => {
  const f = fixture(t); const result = await service.list(f.r);
  assert.equal(result.items[0].privateEvidence, undefined); assert.equal(f.calls(), 2);
  assert.deepEqual(result.ownerRef, f.ownerRef);
});
test("Enterprise certificate holdings retain enterprise owner separately from employee actor", async t => {
  const f = fixture(t, true); const result = await service.list(f.r);
  assert.equal(result.ownerRef.schema, "enterprise"); assert.equal(result.ownerRef.code, "owner");
});
test("invalid, foreign and duplicate responses are rejected instead of being projected", async t => {
  const f = fixture(t); f.value.ownerRef = { ...f.ownerRef, code: "foreign" };
  await assert.rejects(service.list(f.r), /unconfirmed/);
  f.value.ownerRef = f.ownerRef; f.value.items.push(f.value.items[0]); f.value.total = 2;
  await assert.rejects(service.list(f.r), /unconfirmed/);
  await assert.rejects(service.list(f.r, { page: 0 }), /page/);
  await assert.rejects(service.list(f.r, { tenant: "other" }), /selection/);
});
test("authority revoked while the owner read is in flight prevents disclosure", async t => {
  const f = fixture(t); f.revoke(); await assert.rejects(service.list(f.r), /revoked/);
});
test("malformed display facts and unsafe page offsets fail closed", async t => {
  const f = fixture(t); f.value.items[0].brandCode = { private: "not-public" };
  await assert.rejects(service.list(f.r), /unconfirmed/);
  await assert.rejects(service.list(f.r, { page: Number.MAX_SAFE_INTEGER }), /page/);
});
test("customer holdings controller pins bundle scope to signed route authority", async t => {
  const prior = global.FACADE;
  t.after(() => { global.FACADE = prior; });
  let admitted;
  global.FACADE = { DefaultDigitalCommerceCustomerFacade: { certificateHoldings: async request => {
    admitted = request;
    return { contractVersion: 1, items: [] };
  } } };
  const response = await controller.certificateHoldings({
    tenant: "caller-tenant",
    enterpriseCode: "caller-enterprise",
    authData: { tenant: "signed-tenant", entCode: "signed-enterprise" },
    httpRequest: { body: { page: 1 }, headers: { authorization: "Bearer retained" } },
    httpResponse: { setHeader: () => undefined },
  });
  assert.equal(admitted.tenant, "signed-tenant");
  assert.equal(admitted.enterpriseCode, "signed-enterprise");
  assert.equal(admitted.authorization, "Bearer retained");
  assert.deepEqual(admitted.payload, { page: 1 });
  assert.deepEqual(response, { data: { contractVersion: 1, items: [] } });
});
