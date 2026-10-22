/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module eWaste/test/eWasteDigitalOwnershipBridge @description Preserves private authority contracts and exercises migrated persisted common bundle settlement. @owner eWaste @layer test */
const test = require("node:test"), assert = require("node:assert/strict"), path = require("node:path");
const root = path.resolve(__dirname, "../../../../../..");
const domain = require("../src/service/defaultEWasteDigitalSaleService");
const saleEvidence = require("../src/service/defaultEWasteDigitalSaleEvidenceService");
const controller = require("../src/controller/defaultEWasteDigitalSaleController");
const runtimePrincipal = require(path.join(root, "nodics.foundation/modules/nAuth/src/service/identity/defaultServiceTokenService"));

function fixture() {
  const counters = { genericHttpReads: 0, writes: 0, earnings: 0 };
  const serviceAuth = { tokenType: "service", principalType: "service", principalId: "commerce-owner", serviceId: "commerce-owner",
    tenant: "t", enterpriseCode: "e", entCode: "e", runtimeInstanceId: "instance",
    runtimeScope: { instanceCode: "instance", projectCode: "project", environmentCode: "local", serverCode: "commerce", assignmentCode: "grant" },
    modules: ["loyaltyApi", "eWaste"], permissions: ["loyalty.wallet.read", "waste.asset.sale.transfer", "waste.asset.marketplace.project"] };
  const config = { eWaste: { marketplace: { digitalOwnership: { enabled: true, qualified: true,
    allowedServicePrincipals: ["commerce-owner"], customerEvidenceApiName: "/internal/source-test/customer-evidence",
    targets: { commerce: { runtimeRole: "COMMERCE" }, loyalty: { runtimeRole: "LOYALTY" }, profile: { runtimeRole: "PLATFORM" } } } } } };
  global.CONFIG = { get: key => key === "identityGovernance" ?
    require(path.join(root, "nodics.foundation/modules/nAuth/config/properties")).identityGovernance : config[key] };
  global.NODICS = {};
  global.UTILS = { normalizeString: value => String(value ?? "").trim() };
  global.SERVICE = {
    DefaultEWasteDigitalSaleService: domain, DefaultEWasteDigitalSaleEvidenceService: saleEvidence,
    DefaultServiceTokenService: runtimePrincipal, DefaultLoggerService: { hasPrivateCaptureProtection: () => true },
    DefaultSecuredRequestPipelineService: { getGrantedPermissions: () => ["waste.asset.sale.transfer"], isPermissionGranted: () => true },
    DefaultModuleService: { invokeModule: async () => { counters.genericHttpReads++; throw Error("Unexpected remote access"); } },
  };
  return { counters, serviceAuth, config };
}
test.afterEach(() => { for (const name of ["CONFIG", "SERVICE", "NODICS", "UTILS"]) delete global[name]; });

test("generic schema HTTP is disabled independently of module exposure and missing Profile evidence refuses before transport", async () => {
  const f = fixture(), r = domain.context({ tenant: "t", authData: f.serviceAuth, payload: {} });
  for (const module of ["profile", "store", "product", "digitalCore", "order", "paymentCore", "checkoutCore", "loyaltyWallet", "loyaltyLedger"])
    await assert.rejects(domain.rows(r, module, "commerce", "schema", { code: "record" }), /capability evidence/);
  delete f.config.eWaste.marketplace.digitalOwnership.customerEvidenceApiName;
  await assert.rejects(domain.buyer(r, "seller"), /Profile customer evidence route/);
  assert.equal(f.counters.genericHttpReads, 0); assert.equal(f.counters.writes, 0);
});

test("business-enterprise authority requires exact original groupless runtime deployment and preserves its principal enterprise", async () => {
  const f = fixture(), auth = f.serviceAuth;
  auth.entCode = "default"; auth.enterpriseCode = "default";
  NODICS.getSelectedEnvironmentName = () => "local";
  const settings = f.config.eWaste.marketplace.digitalOwnership;
  settings.businessCallers = [{ tenant: "t", principalEnterpriseCode: "default", enterpriseCode: "e", serviceId: auth.serviceId,
    ...auth.runtimeScope, permissions: ["waste.asset.sale.transfer"] }];
  const input = { tenant: "t", enterpriseCode: "e", authData: auth, privateRequest: { tenant: "t", authData: auth }, payload: {} };
  const before = structuredClone(auth), r = domain.context(input);
  assert.equal(r.enterpriseCode, "e"); assert.deepEqual(auth, before);
  settings.businessCallers.push(structuredClone(settings.businessCallers[0]));
  assert.throws(() => domain.context(input), /authority/); settings.businessCallers.pop();
  auth.runtimeScope.instanceCode = "other"; assert.throws(() => domain.context(input)); auth.runtimeScope.instanceCode = "instance";
  input.privateRequest.authData = { ...auth, entCode: "other" };
  assert.throws(() => domain.recheckAuthority(r), /changed/); assert.equal(f.counters.writes, 0);
});

test("sale and listing controllers separate normalized principal namespace from the exact business body selector", async () => {
  const f = fixture(), auth = f.serviceAuth;
  auth.entCode = "default"; auth.enterpriseCode = "default";
  NODICS.getSelectedEnvironmentName = () => "local";
  const settings = f.config.eWaste.marketplace.digitalOwnership;
  settings.businessCallers = [{ tenant: "t", principalEnterpriseCode: "default", enterpriseCode: "e", serviceId: auth.serviceId,
    ...auth.runtimeScope, permissions: ["waste.asset.sale.transfer", "waste.asset.marketplace.project"] }];
  const request = { tenant: "t", enterpriseCode: "default", entCode: "default", authData: auth,
    httpRequest: { headers: { "x-enterprise-code": "default" }, params: { phase: "evidence" }, body: { enterpriseCode: "e", kind: "LISTING" } } };
  SERVICE.DefaultEWasteDigitalSaleService = { ...domain, invoke: async input => {
    const r = domain.context(input); assert.equal(r.enterpriseCode, "e"); assert.equal(r.payload.enterpriseCode, undefined);
    assert.equal(r.authData.entCode, "default"); return { checked: true };
  } };
  assert.equal((await controller.invoke(request)).data.checked, true);
  request.httpRequest.headers["x-enterprise-code"] = "e";
  await assert.rejects(controller.invoke(request), /authority/);
  request.httpRequest.headers["x-enterprise-code"] = "default"; request.httpRequest.params.phase = "plan";
  SERVICE.DefaultEWasteDigitalListingService = { plan: async input => {
    const r = domain.authority(input, "waste.asset.marketplace.project");
    assert.equal(r.enterpriseCode, "e"); assert.equal(r.payload.enterpriseCode, undefined); return { checked: true };
  } };
  const listingController = require("../src/controller/defaultEWasteDigitalListingController");
  assert.equal((await listingController.invoke(request)).data.checked, true);
  assert.equal(f.counters.writes, 0);
});

test("private sale diagnostics expose only static owner failures, not arbitrary remote details", async () => {
  fixture();
  const original = global.CLASSES;
  global.CLASSES = { NodicsError: class extends Error {
    constructor(value) { super(value.message); this.code = value.code; }
  } };
  const request = { httpRequest: { params: { phase: "evidence" }, body: {} } };
  try {
    SERVICE.DefaultEWasteDigitalSaleService = { invoke: async () => { throw new Error("Retained Product proof changed"); } };
    const statuses = require("../src/utils/statusDefinitions");
    const router = require("../../../../../../nodics.foundation/modules/nRouter/src/service/router/defaultRouterOperationService");
    SERVICE.DefaultStatusService = { get: code => statuses[code] };
    SERVICE.DefaultLoggerService.isSensitiveRequest = () => true;
    await assert.rejects(controller.invoke(request), error => {
      let response, status;
      assert.equal(router.sendPrivateError({}, { status: value => { status = value; return { json: value => { response = value; } }; } }, error), true);
      assert.equal(status, 503);
      assert.deepEqual(response, { responseCode: "503", code: "ERR_EWASTE_SALE_DIAGNOSTIC_011", message: "Retained Product proof changed" });
      return error.code === response.code;
    });
    const remote = new Error("private remote detail sentinel");
    SERVICE.DefaultEWasteDigitalSaleService.invoke = async () => { throw remote; };
    await assert.rejects(controller.invoke(request), error => error !== remote && error.code === "ERR_EWASTE_SALE_DIAGNOSTIC_041" &&
      error.message === "Digital ownership controller operation is unavailable");
  } finally { if (original === undefined) delete global.CLASSES; else global.CLASSES = original; }
});

test("outgoing exact evidence derives namespace from the actual transport token, not the business enterprise or incoming actor", async () => {
  const f = fixture(), calls = [], r = domain.context({ tenant: "t", authData: f.serviceAuth, payload: {} });
  SERVICE.DefaultModuleService.invokeModule = async input => { calls.push(input); return { data: { acknowledged: true } }; };
  for (const [moduleName, target, route] of [["profile", "profile", "/internal/customer-evidence"],
    ["loyaltyApi", "loyalty", "/reward-ledger-evidence"], ["digitalCore", "commerce", "/internal/ownership/evidence/query"]]) {
    await domain.remote(r, moduleName, target, route, { enterpriseCode: "e" }, true);
    const sent = calls.at(-1); assert.equal(sent.header["X-Enterprise-Code"], undefined);
    assert.equal(sent.requestBody.enterpriseCode, "e"); assert.equal(sent.header.Authorization, undefined);
    assert.equal(sent.tenant, "t"); assert.equal(sent.maxAttempts, 1);
  }
  assert.equal(f.counters.writes, 0);
});

test("private evidence dependency refusal returns only its fixed owner stage", async () => {
  const f = fixture();
  const original = SERVICE.DefaultEWasteDigitalSaleService;
  SERVICE.DefaultEWasteDigitalSaleService = { ...original, binding: async () => { throw new Error("private dependency sentinel"); } };
  try {
    await assert.rejects(controller.invoke({ tenant: "t", authData: f.serviceAuth,
      httpRequest: { params: { phase: "evidence" }, body: { contractVersion: 1, kind: "LISTING", bindingCode: "binding",
        productCode: "product", sku: "SKU", storeCode: "s", locale: "en", assetCode: "asset" } } }),
    error => error.message.includes("BINDING_OWNER") && !error.message.includes("sentinel"));
    assert.equal(f.counters.writes, 0);
  } finally { SERVICE.DefaultEWasteDigitalSaleService = original; }
});

test("signed and input tenant/enterprise aliases must all agree before any owner reads or writes", async () => {
  for (const alter of [r => r.authData.entCode = "foreign", r => r.entCode = "foreign", r => r.enterpriseCode = "foreign",
    r => r.tenantCode = "foreign", r => r.authData.tenantCode = "foreign", r => r.authData.entCode = "",
    r => r.entCode = null, r => r.authData.enterpriseCode = { code: "e" }, r => r.authData.tenant = " t"]) {
    const f = fixture(), request = { tenant: "t", enterpriseCode: "e", authData: structuredClone(f.serviceAuth) };
    alter(request);
    SERVICE.DefaultModuleService.invokeModule = async () => assert.fail("Alias denial must precede owner reads");
    await assert.rejects(domain.invoke(request, "availability"), /authority is unavailable/);
    assert.equal(f.counters.writes, 0); assert.equal(f.counters.earnings, 0);
  }
  const f = fixture(), request = { tenant: "t", tenantCode: "t", enterpriseCode: "e", entCode: "e",
    authData: { ...f.serviceAuth, tenantCode: "t", entCode: "e" }, payload: { enterpriseCode: "body-ignored", qualified: true } };
  assert.equal(domain.context(request).enterpriseCode, "e");
  delete request.authData.enterpriseCode;
  assert.equal(domain.context(request).enterpriseCode, "e");
});
test("signed principal and scope identifiers are bounded even when malformed values are allowlisted", async () => {
  for (const value of ["", " service", "service\n", "x".repeat(129), { code: "commerce-owner" }]) {
    const f = fixture(), request = { tenant: "t", authData: { ...f.serviceAuth, principalId: value } };
    f.config.eWaste.marketplace.digitalOwnership.allowedServicePrincipals = [value];
    assert.throws(() => domain.context(request), /authority is unavailable/); assert.equal(f.counters.writes, 0);
  }
  for (const patch of [{ tenant: "x".repeat(129) }, { enterpriseCode: "x".repeat(129) }, { enterpriseCode: "e\n" }]) {
    const f = fixture(), authData = { ...f.serviceAuth, ...patch };
    assert.throws(() => domain.context({ tenant: authData.tenant, authData }), /authority is unavailable/);
  }
  const f = fixture(); f.config.eWaste.marketplace.digitalOwnership.allowedServicePrincipals = "commerce-owner";
  assert.throws(() => domain.context({ tenant: "t", authData: f.serviceAuth }), /authority is unavailable/);
});

require("./helpers/commonBundleJourney.cjs");
