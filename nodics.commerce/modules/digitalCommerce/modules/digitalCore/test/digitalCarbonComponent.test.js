/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module digitalCore/test/digitalCarbonComponent @description Exercises Digital's transport DTO against the real Carbon owner and Waste persistence adapter with isolated generated repositories. @layer test @owner digitalCore */
const test = require("node:test"), assert = require("node:assert/strict");
const port = require("../src/service/defaultDigitalCarbonComponentService");
const carbon = require("../../../../../../nodics.waste/modules/wasteCarbon/src/service/defaultWasteCarbonHoldingService");
const carbonReadAccess = require("../../../../../../nodics.waste/modules/wasteCarbon/src/service/defaultWasteCarbonReadAccessService");
const repositories = require("../../../../../../nodics.waste/modules/wasteCarbon/test/repositoryFixture");
const exact = require("../../../../../../nodics.foundation/modules/nCommon/src/utils/exactAmount");
const owner = code => ({ module: "profile", schema: "customer", code });

test("multiple Carbon lots keep independent destination holds and exact finalization identities", async t => {
  const { f, r, input } = fixture(t), second = { ...input, operationKey: "second-component",
    component: { ...input.component, reference: { ...input.component.reference, code: "second-lot" } } };
  f.put("wasteCarbonLot", { ...f.get("wasteCarbonLot", "lot"), code: "second-lot" });
  for (const selected of [input, second]) {
    await port.reserve(r, selected); await port.transfer(r, selected);
    assert.equal((await port.inspect(r, { ...selected, ownerRef: selected.recipientRef })).available, false);
  }
  await port.finalize(r, input);
  assert.equal((await port.inspect(r, { ...input, ownerRef: input.recipientRef })).available, true);
  assert.equal((await port.inspect(r, { ...second, ownerRef: second.recipientRef })).available, false);
  await port.finalize(r, second);
  assert.equal((await port.inspect(r, { ...second, ownerRef: second.recipientRef })).available, true);
  for (const code of ["lot", "second-lot"]) assert.equal(f.get("wasteCarbonLot", code).operations.length, 1);
});


test("real Digital mixed bundle retains Carbon hold after partial transfer and finalizes only after all receipts", async t => {
  const { f, config, input } = fixture(t);
  const bundles = require("../src/service/defaultDigitalBundleService");
  const persistence = require("../src/service/defaultDigitalCommerceEntitlementService");
  const rows = {}, effects = [];
  config.bundles.ownerAuthorityService = "ProfileFixture";
  config.bundles.componentProviders.REALIZED_CARBON = "DefaultDigitalCarbonComponentService";
  config.bundles.componentProviders.CERTIFICATE = "CertificateFixture";
  global.UTILS = { createModelName: value => value };
  global.NODICS = { getModels: () => Object.fromEntries(["digitalBundleManifest", "digitalBundleOperation"].map(name =>
    [name, { primaryKey: "code", compareAndSetItem() {}, rawSchema: {} }])) };
  Object.assign(SERVICE, {
    DefaultDigitalBundleService: bundles, DefaultDigitalCarbonComponentService: port, DefaultDigitalCommerceEntitlementService: persistence,
    DefaultModelConcurrencyService: { getField: () => "revision" },
    DefaultDatabaseModelHandlerService: { inspectIndexes: async () => ({ versioned: false, indexes: [{ unique: true, key: { code: 1 } }] }) },
    ProfileFixture: { authorize: async (r, value) => ({ authorized: true, tenant: r.tenant, ownerRef: value.ownerRef, actorRef: owner("actor") }) }
  });
  for (const name of ["DefaultDigitalBundleManifestService", "DefaultDigitalBundleOperationService"]) {
    rows[name] = [];
    const matches = (row, query) => Object.entries(query).every(([key, value]) => row[key] === value);
    SERVICE[name] = {
      get: async r => ({ code: "SUC_TEST", result: structuredClone(rows[name].filter(row => matches(row, r.query))) }),
      save: async r => {
        assert.equal(r.options.insertOnly, undefined);
        assert.equal(r.options.recursive, false);
        if (rows[name].some(row => row.code === r.model.code)) throw Error("duplicate");
        rows[name].push(structuredClone(r.model)); return { code: "SUC_TEST", result: structuredClone(r.model) };
      },
      update: async r => {
        const row = rows[name].find(row => matches(row, r.query));
        if (row) Object.assign(row, structuredClone(r.model), { revision: r.query.revision + 1 });
        return { code: "SUC_TEST", result: { acknowledged: true, matchedCount: row ? 1 : 0 } };
      }
    };
  }
  let certificateStatus, failCertificate = true, loseFinalization = true;
  const certificateReceipt = (value, status) => ({ status, operationKey: value.operationKey, reference: value.component.reference,
    quantity: value.component.quantity, receiptCode: value.operationKey });
  SERVICE.CertificateFixture = {
    retainsTransferLock: true,
    inspect: async (_, value) => ({ available: true, ownerRef: value.ownerRef, revision: 1 }),
    reserve: async (_, value) => { certificateStatus = "RESERVED"; return certificateReceipt(value, "RESERVED"); },
    transfer: async (_, value) => {
      if (failCertificate) throw Error("certificate outcome uncertain");
      certificateStatus = "TRANSFERRED"; effects.push("certificate:transfer"); return certificateReceipt(value, "TRANSFERRED");
    },
    finalize: async (_, value) => {
      assert.equal(certificateStatus, "TRANSFERRED"); certificateStatus = "COMPLETED";
      effects.push("certificate:finalize"); return certificateReceipt(value, "COMPLETED");
    },
    release: async () => { throw Error("Never release a transferring mixed bundle"); }
  };
  const invoke = SERVICE.DefaultModuleService.invokeModule;
  SERVICE.DefaultModuleService.invokeModule = async call => {
    const result = await invoke(call);
    if (call.apiName === "/carbon/transfers/finalize") {
      assert.equal(certificateStatus, "TRANSFERRED", "Every component transferred before first unlock");
      assert.ok(Object.values(rows.DefaultDigitalBundleOperationService[0].checkpoints).every(checkpoint => checkpoint.transfer),
        "Every component transfer receipt is durably checkpointed before any unlock");
      effects.push("carbon:finalize");
      if (loseFinalization) { loseFinalization = false; throw Error("lost finalization acknowledgement"); }
    }
    return result;
  };
  const r = { tenant: "T", enterpriseCode: "market", authData: { tenant: "T" } };
  const manifest = await bundles.create(r, { ownerRef: input.ownerRef, idempotencyKey: "mixed-manifest", components: [
    input.component, { kind: "CERTIFICATE", reference: { module: "wasteCore", schema: "wasteAsset", code: "certificate" }, quantity: "1", expectedRevision: 1 }
  ] });
  let operation = await bundles.reserve(r, { manifestCode: manifest.code, manifestRevision: manifest.revision,
    purpose: "LISTING", recipientRef: input.recipientRef, idempotencyKey: "mixed-hold" });
  assert.equal(operation.status, "HELD");
  operation = await bundles.update(r, operation, { status: "TRANSFERRING" });
  await assert.rejects(bundles.transfer(r, operation.code), /certificate outcome uncertain/);
  assert.equal(effects.length, 0);
  assert.equal(f.get("wasteCarbonLot", "lot").operations[0].destinationHold, "HELD");
  assert.equal((await port.inspect(r, { ...input, ownerRef: input.recipientRef })).available, false);
  failCertificate = false;
  await assert.rejects(bundles.transfer(r, operation.code), /lost finalization acknowledgement/);
  assert.equal(rows.DefaultDigitalBundleOperationService[0].status, "TRANSFERRED");
  assert.equal(f.get("wasteCarbonLot", "lot").operations[0].status, "COMPLETED");
  assert.equal(certificateStatus, "TRANSFERRED");
  const completed = await bundles.transfer(r, operation.code);
  assert.equal(completed.status, "COMPLETED");
  assert.equal(certificateStatus, "COMPLETED");
  assert.equal((await port.inspect(r, { ...input, ownerRef: input.recipientRef })).available, true);
  assert.equal(f.get("wasteCarbonLot", "lot").operations.length, 1);
  assert.equal(effects.filter(value => value === "certificate:transfer").length, 1);
  assert.equal((await bundles.transfer(r, operation.code)).status, "COMPLETED");
});

test("Digital refuses absent destination hold or incomplete finalization evidence", async t => {
  const { r, input } = fixture(t);
  await port.reserve(r, input);
  const original = SERVICE.DefaultModuleService.invokeModule;
  SERVICE.DefaultModuleService.invokeModule = async call => {
    const result = await original(call);
    if (call.apiName === "/carbon/transfers") return { ...result, destinationHold: undefined };
    return result;
  };
  await assert.rejects(port.transfer(r, input), /unconfirmed/);
  SERVICE.DefaultModuleService.invokeModule = async call => {
    const result = await original(call);
    if (call.apiName === "/carbon/transfers/finalize") return { ...result, finalizedAt: undefined };
    return result;
  };
  await assert.rejects(port.finalize(r, input), /unconfirmed/);
  SERVICE.DefaultModuleService.invokeModule = original;
  assert.equal((await port.finalize(r, input)).status, "COMPLETED");
});

/** Loads real Carbon owner and port with unit-only generated repositories and qualified synthetic transport. */
function fixture(t) {
  const before = { CONFIG: global.CONFIG, SERVICE: global.SERVICE, NODICS: global.NODICS, UTILS: global.UTILS, ENUMS: global.ENUMS };
  t.after(() => Object.assign(global, before));
  const f = repositories.create(["wasteCarbonLot"]), config = structuredClone(require("../config/properties").digitalCore);
  const carbonConfig = structuredClone(require("../../../../../../nodics.waste/modules/wasteCarbon/config/properties").wasteCarbon);
  carbonConfig.evidence.providerService = "EvidenceService";
  carbonConfig.evidence.qualificationRef = { module: "registry", schema: "qualification", code: "qualified" };
  global.ENUMS = f.enums;
  config.bundles.carbon.qualified = true;
  const reference = { module: "wasteCarbon", schema: "wasteCarbonLot", code: "lot" };
  f.put("wasteCarbonLot", { code: "lot", state: "REALIZED", revision: 1, unitOfMeasure: "tCO2e", scale: 3, synthetic: false,
    issuanceRef: { module: "registry", schema: "issuance", code: "issued" }, operations: [],
    allocations: [{ code: "original", ownerRef: owner("sender"), quantity: "5.000" }] });
  global.CONFIG = { get: key => key === "digitalCore" ? config : key === "wasteCarbon" ? carbonConfig : undefined };
  global.SERVICE = { ...f.services, DefaultExactAmountService: exact,
    DefaultWasteCarbonHoldingService: carbon, DefaultWasteCarbonReadAccessService: carbonReadAccess, EvidenceService: {
    eligibility: async input => ({ ...input, status: "ELIGIBLE", evidenceRef: { module: "registry", schema: "evidence", code: "eligibility" } }),
  }, DefaultModuleService: { invokeModule: async call => {
    assert.equal(call.local, false); assert.equal(call.moduleName, "wasteCarbon");
    assert.equal(call.header.Authorization, undefined);
    const phase = { "/carbon/holdings": "holdings", "/carbon/reservations": "reserve", "/carbon/transfers": "transfer",
      "/carbon/releases": "release", "/carbon/operations/lookup": "getOperation", "/carbon/transfers/finalize": "finalize" }[call.apiName];
    return carbon[phase]({ tenant: call.tenant, payload: call.requestBody, authData: { tenant: call.tenant, principalType: "service",
      loginId: "digital", permissions: ["carbon.holdings.read", "carbon.holdings.reserve", "carbon.holdings.transfer", "carbon.holdings.release", "carbon.holdings.finalize"] } });
  } } };
  const r = { tenant: "T" }, input = { component: { kind: "REALIZED_CARBON", reference, quantity: "1.25", unitOfMeasure: "tCO2e", expectedRevision: 1 },
    componentCount: 2, operationKey: "bundle-operation:original:0", bundleCode: "bundle:manifest", manifestRevision: 0,
    ownerRef: owner("sender"), recipientRef: owner("receiver") };
  return { f, config, r, input };
}
test("actual Carbon reserve transfer readback and release use exact original component bindings", async t => {
  const { f, r, input } = fixture(t);
  assert.deepEqual(await port.inspect(r, input), { available: true, ownerRef: input.ownerRef, revision: 1 });
  assert.equal((await port.reserve(r, input)).status, "RESERVED");
  assert.equal((await port.reserve(r, input)).quantity, "1.25");
  assert.equal((await port.transfer(r, input)).status, "TRANSFERRED");
  assert.equal(port.retainsTransferLock, true);
  assert.equal((await port.inspect(r, { ...input, ownerRef: input.recipientRef })).available, false);
  assert.equal((await port.finalize(r, input)).status, "COMPLETED");
  assert.equal((await port.inspect(r, { ...input, ownerRef: input.recipientRef })).available, true);
  assert.equal((await port.transfer(r, input)).status, "TRANSFERRED");
  assert.equal((await port.finalize(r, input)).status, "COMPLETED");
  await assert.rejects(port.release(r, input), /final/);
  assert.equal(f.get("wasteCarbonLot", "lot").operations.length, 1);
  assert.deepEqual(f.get("wasteCarbonLot", "lot").allocations[0].ownerRef, owner("sender"));
  assert.equal(f.get("wasteCarbonLot", "lot").operations[0].destinationHold, "RELEASED");
});
