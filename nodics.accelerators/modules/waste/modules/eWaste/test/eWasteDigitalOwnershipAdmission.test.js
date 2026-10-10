/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module eWaste/test/eWasteDigitalOwnershipAdmission
 * @description Source-only admission and canonical original-sale refund route regression tests; no native signed transport or financial acceptance is claimed.
 * @layer test @owner eWaste
 */
const test = require("node:test"), assert = require("node:assert/strict");
const defaults = require("../config/properties");
const sale = require("../src/service/defaultEWasteDigitalSaleService");
const routers = require("../src/router/routers");
const controller = require("../src/controller/defaultEWasteDigitalSaleController");
const orderRoutes = require("../../../../../../nodics.commerce/modules/checkout/modules/order/src/router/routers");

function fixture(t) {
  const previous = { CONFIG: global.CONFIG, SERVICE: global.SERVICE };
  t.after(() => { for (const [key, value] of Object.entries(previous)) if (value === undefined) delete global[key]; else global[key] = value; });
  const settings = structuredClone(defaults.eWaste), ownership = settings.marketplace.digitalOwnership;
  const request = { tenant: "test_tenant", authData: { tenant: "test_tenant", enterpriseCode: "test_enterprise",
    principalType: "service", tokenType: "service", principalId: "test_commerce_service" }, payload: {} };
  global.CONFIG = { get: key => key === "eWaste" ? settings : undefined };
  global.SERVICE = { DefaultSecuredRequestPipelineService: {
    getGrantedPermissions: () => ["waste.asset.sale.transfer"],
    isPermissionGranted: (required, granted) => granted.includes(required),
  } };
  return { settings, ownership, request };
}
test("admission flags are explicit selection, not a circular completed-sale requirement", t => {
  const f = fixture(t);
  assert.equal(f.ownership.enabled, false); assert.equal(f.ownership.qualified, false);
  f.ownership.allowedServicePrincipals = [f.request.authData.principalId];
  assert.throws(() => sale.context(f.request), /authority/);
  f.ownership.enabled = true;
  assert.throws(() => sale.context(f.request), /authority/);
  f.ownership.qualified = true;
  const context = sale.context(f.request);
  assert.equal(context.tenant, f.request.tenant);
  assert.equal(context.enterpriseCode, f.request.authData.enterpriseCode);
  assert.deepEqual(context.payload, {});
  assert.equal(Object.hasOwn(context, "payment"), false);
});
test("selected admission never bypasses signed type, allowlist, permission or conflicting scope", t => {
  const f = fixture(t);
  Object.assign(f.ownership, { enabled: true, qualified: true, allowedServicePrincipals: [f.request.authData.principalId] });
  for (const auth of [{ tokenType: "access" }, { principalType: "human" }, { principalId: "other" }, { tenantCode: "foreign" }, { entCode: "foreign" }])
    assert.throws(() => sale.context({ ...f.request, authData: { ...f.request.authData, ...auth } }), /authority/);
  SERVICE.DefaultSecuredRequestPipelineService.getGrantedPermissions = () => [];
  assert.throws(() => sale.context(f.request), /authority/);
});
test("canonical serviceId-only admission requires original nAuth runtime scope without manufacturing a principal ID", t => {
  const f = fixture(t);
  const previous = { CLASSES: global.CLASSES, NODICS: global.NODICS };
  t.after(() => { for (const [key, value] of Object.entries(previous))
    if (value === undefined) delete global[key]; else global[key] = value; });
  global.CLASSES = { NodicsError: class extends Error {} };
  global.NODICS = { getSelectedEnvironmentName: () => "local" };
  SERVICE.DefaultServiceTokenService = require("../../../../../../nodics.foundation/modules/nAuth/src/service/identity/defaultServiceTokenService");
  SERVICE.DefaultLoggerService = { hasPrivateCaptureProtection: request => request === f.request.privateRequest };
  const auth = f.request.authData;
  delete auth.principalId;
  Object.assign(auth, { entCode: auth.enterpriseCode, serviceId: "test_commerce_service", isSystem: false,
    modules: ["eWaste"], permissions: ["waste.asset.sale.transfer"], userGroups: [], groups: [],
    runtimeInstanceId: "instance", runtimeScope: { projectCode: "project", environmentCode: "local", serverCode: "commerce",
      instanceCode: "instance", assignmentCode: "assignment" } });
  f.request.privateRequest = { tenant: f.request.tenant, enterpriseCode: auth.entCode, authData: auth };
  Object.assign(f.ownership, { enabled: true, qualified: true, allowedServicePrincipals: [auth.serviceId] });
  const before = structuredClone(auth), admitted = sale.context(f.request);
  assert.equal(admitted.authData.serviceId, auth.serviceId);
  assert.equal(Object.hasOwn(admitted.authData, "principalId"), false);
  assert.deepEqual(admitted.authData, before); assert.deepEqual(auth, before);
  sale.recheckAuthority(admitted);
  for (const change of [{ principalId: "unapproved" }, { principalId: null }, { principalType: "human" },
    { tokenType: "access" }, { serviceId: "foreign" }, { modules: [] }, { runtimeInstanceId: "stale" },
    { runtimeScope: { ...auth.runtimeScope, assignmentCode: undefined } }, { permissions: [] }, { isSystem: true }]) {
    const altered = { ...auth, ...change };
    assert.throws(() => sale.context({ ...f.request, authData: altered,
      privateRequest: { ...f.request.privateRequest, authData: altered } }));
  }
  assert.throws(() => sale.context({ ...f.request, privateRequest: undefined }), /authority/);
  assert.throws(() => sale.context({ ...f.request, privateRequest: { ...f.request.privateRequest, authData: structuredClone(auth) } }), /authority/);
  SERVICE.DefaultLoggerService.hasPrivateCaptureProtection = () => false;
  assert.throws(() => sale.context(f.request), /authority/);
  SERVICE.DefaultLoggerService.hasPrivateCaptureProtection = request => request === f.request.privateRequest;
  auth.serviceId = "changed";
  assert.throws(() => sale.recheckAuthority(admitted), /authority changed/);
});
test("modern and legacy internal routes retain service-only transfer authority; staff refund remains Order-owned", () => {
  const route = routers.eWaste.internalDigitalSale.internalDigitalSaleInvoke;
  assert.equal(route.key, "/internal/digital-sales/:phase");
  assert.equal(route.secured, true);
  assert.deepEqual(route.authTokenTypes, ["service"]);
  assert.deepEqual(route.accessGroups, ["serviceAccountUserGroup"]);
  assert.equal(route.permission, "waste.asset.sale.transfer");
  assert.equal(route.apiExposure, "wasteInternal");
  assert.equal(routers.eWaste.internalOrderReversal.internalOrderReversalInvoke.permission, route.permission);
  assert.equal(orderRoutes.order.disputes.refundPreview.permission, "commerce.dispute.review");
  assert.equal(orderRoutes.order.disputes.refundExecute.permission, "commerce.refund.execute");
  assert.deepEqual(orderRoutes.order.disputes.refundExecute.authTokenTypes, ["access"]);
});
test("all original-sale refund phases preserve router-derived authority and cannot select legacy adapters", async t => {
  fixture(t);
  const calls = [];
  SERVICE.DefaultEWasteDigitalSaleService = { invoke: async (input, phase) => { calls.push({ input, phase }); return {}; } };
  for (const phase of ["refund-preview", "refund-prepare", "refund-settle", "refund-complete"])
    await controller.invoke({ tenant: "signed_tenant", authData: { principalId: "signed_service" }, requestId: "original_correlation",
      httpRequest: { params: { phase }, body: { tenant: "body_tenant", authData: { principalId: "body_actor" }, qualified: true } } });
  assert.equal(calls.length, 4);
  assert.ok(calls.every(({ input }) => input.tenant === "signed_tenant" && input.authData.principalId === "signed_service"));
  await assert.rejects(controller.invoke({ httpRequest: { params: { phase: "legacy-refund" } } }), /Unsupported/);
  assert.equal(calls.length, 4);
});
