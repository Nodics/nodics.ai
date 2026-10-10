/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module eWaste/test/eWasteDigitalListing
 * @description Source-only publication/policy/admission and Waste relationship orchestration coverage. Injected provider rows and transport are not native Digital binding or financial proof.
 * @layer test @owner eWaste
 */
const test = require("node:test"), assert = require("node:assert/strict");
const listing = require("../src/service/defaultEWasteDigitalListingService");
const sale = require("../src/service/defaultEWasteDigitalSaleService");
const controller = require("../src/controller/defaultEWasteDigitalListingController");
const routes = require("../src/router/routers");
const wasteRoot = "../../../../../../nodics.waste/modules/wasteCore/";
const waste = require(wasteRoot + "src/service/defaultWasteAssetTransferOperationService");
const projection = require(wasteRoot + "src/service/defaultWasteAssetMarketplaceProjectionService");
const operation = require(wasteRoot + "src/service/defaultWasteDigitalListingOperationService");
const persistence = require(wasteRoot + "src/service/defaultWastePersistenceService");
const inspection = require(wasteRoot + "src/service/defaultWasteInstalledDataInspectionService");
const schemas = require(wasteRoot + "src/schemas/schemas").wasteCore;
const assetSchema = schemas.wasteAsset;
const concurrency = require("../../../../../../nodics.foundation/modules/nDatabase/database/src/service/schema/defaultModelConcurrencyService");

function fixture(t) {
  const previous = Object.fromEntries(["CONFIG", "SERVICE", "NODICS", "UTILS"].map(key => [key, global[key]]));
  t.after(() => { for (const [key, value] of Object.entries(previous)) if (value === undefined) delete global[key]; else global[key] = value; });
  const ref = code => ({ module: "profile", schema: "customer", code });
  const p = { assetCode: "asset", productCode: "product", variantCode: "variant", sku: "SKU", storeCode: "store",
    transferPolicyCode: "transfer", rewardSettlementPolicyCode: "reward", carbonSettlementPolicyCode: "carbon",
    expectedAssetRevision: 0, idempotencyKey: "original_listing", locales: ["en", "ar"] };
  const request = { tenant: "t", authData: { tenant: "t", enterpriseCode: "e", tokenType: "service", principalType: "service", principalId: "commerce" }, payload: p };
  const config = { marketplace: { digitalOwnership: { enabled: false, qualified: false, allowedServicePrincipals: ["commerce"],
    customerEvidenceApiName: "/internal/source-test/customer-evidence",
    targets: { commerce: { runtimeRole: "COMMERCE" }, profile: { runtimeRole: "PLATFORM" } } } } };
  const row = value => ({ tenant: "t", active: true, ...value });
  const rows = {
    wasteAsset: [row({ code: "asset", assetStatus: "LISTED", revision: 0, ownerRef: ref("seller"), digitalOwnerRef: ref("seller"),
      physicalOwnerRef: ref("custodian"), custodyStatus: "CUSTOMER_HELD", metadata: { historical: "preserved" } })],
    wasteAssetMarketplaceProjection: [],
    wasteAssetTransferPolicy: [row({ code: "transfer", status: "ACTIVE", revision: 1, transferType: "SELL", ownershipTransferMode: "TRANSFER_TO_COUNTERPARTY",
      completionAssetStatus: "SOLD", cancellationAssetStatus: "LISTED", allowSelfTransfer: false, lockRequired: true, rewardTransferMode: "RETAIN_ORIGINAL_OWNER", carbonTransferMode: "NONE",
      metadata: { digitalOwnership: { reservationSeconds: 600, refund: "ORIGINAL_TRANSFER_REVERSAL_ONLY_BEFORE_ONWARD_TRANSFER" } } })],
    wasteRewardSettlementPolicy: [row({ code: "reward", status: "ACTIVE", revision: 1, triggerType: "SALE", settlementMode: "POLICY_RESOLVED", walletCurrencyCode: "POINTS",
      metadata: { digitalOwnership: { version: 1, proceeds: "CAPTURED_TOTAL", payee: "CURRENT_SELLER", programCode: "program", rewardTypeCode: "points", scale: 2 } } })],
    wasteCarbonSettlementPolicy: [row({ code: "carbon", status: "ACTIVE", revision: 1, triggerType: "SALE", settlementMode: "NONE" })],
    customer: [row({ code: "seller", loginId: "seller-login" })],
    store: [row({ code: "store", status: "ACTIVE", revision: 1, enterpriseRef: { module: "profile", schema: "enterprise", code: "e" } })],
    productSearchProjection: ["en", "ar"].map(locale => row({ code: "retained-" + locale, enterpriseCode: "e", storeCode: "store", productCode: "product", locale,
      publicationVersion: "a".repeat(64), sourceHash: "source-" + locale, status: "STALE", payload: { variantCodes: ["variant"], variantSkuMap: { variant: "SKU" },
        localizedAttributes: { assetCode: "asset", productType: "DIGITAL", inventoryStrategy: "DIGITAL_COMMERCE", digitalDeliveryType: "DIGITAL_OWNERSHIP" } } })),
    digitalProductBinding: [],
  };
  const match = (record, query) => Object.entries(query).every(([key, value]) => key === "$or" ? value.some(branch => match(record, branch)) : record[key] === value);
  const calls = [], state = { writes: 0, version: "a".repeat(64), pointerReads: 0, drift: false };
  global.CONFIG = { get: key => key === "eWaste" ? config : undefined };
  global.UTILS = { createModelName: value => value };
  const models = Object.fromEntries(["wasteAsset", "wasteAssetMarketplaceProjection", "wasteAssetOwnershipEvent"].map(schema => [schema,
    { primaryKey: "code", versioned: false, compareAndSetItem() {}, rawSchema: schemas[schema] }]));
  global.NODICS = { getModels: () => models };
  global.SERVICE = { DefaultEWasteDigitalSaleService: sale, DefaultEWasteDigitalListingService: listing,
    DefaultWasteAssetTransferOperationService: waste, DefaultWastePersistenceService: persistence,
    DefaultWasteAssetMarketplaceProjectionService: projection, DefaultWasteDigitalListingOperationService: operation,
    DefaultWasteInstalledDataInspectionService: inspection,
    DefaultDatabaseModelHandlerService: { inspectIndexes: async () => ({ versioned: false, indexes: [{ unique: true, key: { code: 1 } }] }) },
    DefaultModelConcurrencyService: concurrency,
    DefaultSecuredRequestPipelineService: { getGrantedPermissions: () => ["waste.asset.marketplace.project"], isPermissionGranted: (key, grants) => grants.includes(key) },
    DefaultModuleService: { invokeModule: async input => {
      calls.push(input); assert.equal(input.maxAttempts, 1);
      if (input.apiName === "/internal/source-test/customer-evidence") return { data: { contractVersion: 1, tenant: "t", enterpriseCode: "e",
        customer: structuredClone(rows.customer.find(value => value.code === input.requestBody.identifier || value.loginId === input.requestBody.identifier)) } };
      if (input.apiName === "/internal/ownership/evidence/query") {
        const p = input.requestBody;
        if (p.kind === "LISTING") return { data: { contractVersion: 1, kind: p.kind, store: structuredClone(rows.store[0]), products: structuredClone(rows.productSearchProjection),
          publication: { version: state.version, revision: 1, scope: { tenant: "t", productCode: p.productCode, storeCode: p.storeCode } } } };
        assert.equal(p.kind, "BINDING");
        return { data: { contractVersion: 1, kind: p.kind, binding: structuredClone(rows.digitalProductBinding.find(value => value.code === p.bindingCode)) } };
      }
      if (input.apiName === "/internal/products/publication/status") {
        state.pointerReads++;
        return { data: { version: state.drift && state.pointerReads % 2 === 0 ? "b".repeat(64) : state.version,
          revision: 1, scope: input.requestBody.scope } };
      }
      const schema = Object.keys(rows).find(name => "/" + name.toLowerCase() === input.apiName);
      assert.ok(schema, "Only existing lowercase owner reads or authoritative Product status allowed");
      assert.equal(input.methodName, "POST");
      return { data: structuredClone(rows[schema].filter(value => match(value, input.requestBody.query))) };
    } } };
  for (const schema of Object.keys(rows).filter(name => name.startsWith("waste"))) SERVICE["Default" + schema[0].toUpperCase() + schema.slice(1) + "Service"] = {
    get: async input => ({ code: "SUC_GET", result: structuredClone(rows[schema].filter(value => match(value, input.query))) }),
    save: async input => { state.writes++; if (rows[schema].some(value => value.code === input.model.code)) throw Error("Create conflict");
      rows[schema].push({ ...structuredClone(input.model), revision: 1 }); return { code: "SUC_SAVE" }; },
    update: async input => { state.writes++; const record = rows[schema].find(value => match(value, input.query));
      if (!record) return { code: "SUC_UPDATE", result: { matchedCount: 0 } };
      Object.assign(record, structuredClone(input.model), { revision: record.revision + 1 }); return { code: "SUC_UPDATE", result: { matchedCount: 1 } }; },
  };
  return { request, p, config, rows, calls, state, models };
}
test("preview uses authoritative current Online pointers and current policies with sale flags off, without binding or writes", async t => {
  const f = fixture(t), plan = await listing.plan(f.request);
  assert.equal(plan.state, "READ_ONLY_DOMAIN_LISTING_PLAN");
  assert.match(plan.planDigest, /^[a-f0-9]{64}$/);
  assert.equal(plan.providerReference.projectionCode, "WASTE_MARKETPLACE_PROJECTION_ASSET");
  assert.deepEqual(plan.evidence.retainedProducts.map(value => value.locale), ["ar", "en"]);
  assert.deepEqual(plan.evidence.persistence, ["wasteAsset", "wasteAssetMarketplaceProjection", "wasteAssetOwnershipEvent"].map(schema => ({
    schema, compareAndSetAvailable: true, uniqueCodeIdentity: true,
    revisionOwner: schema === "wasteAssetOwnershipEvent" ? "DOMAIN" : "MANAGED",
  })));
  assert.equal(f.state.writes, 0); assert.equal(f.rows.digitalProductBinding.length, 0);
  assert.ok(f.calls.every(value => value.methodName === "POST"));
});
test("listing persistence preflight requires all fixed ownership resources without writes or changed command digest", async t => {
  const f = fixture(t), original = structuredClone(f.rows), preview = await listing.preview(f.request);
  for (const model of Object.values(f.models)) model.compareAndSetItem = () => assert.fail("Read-only preflight cannot invoke CAS");
  assert.equal((await listing.plan(f.request)).planDigest, preview.planDigest);
  const event = f.models.wasteAssetOwnershipEvent;
  delete f.models.wasteAssetOwnershipEvent;
  await assert.rejects(listing.plan(f.request), /persistence is not qualified/);
  f.models.wasteAssetOwnershipEvent = { ...event, compareAndSetItem: undefined };
  await assert.rejects(listing.plan(f.request), /persistence is not qualified/);
  f.models.wasteAssetOwnershipEvent = event;
  const inspect = SERVICE.DefaultDatabaseModelHandlerService.inspectIndexes;
  for (const index of [{ unique: false, key: { code: 1 } }, { unique: true, sparse: true, key: { code: 1 } },
    { unique: true, key: { code: 1, other: 1 } }]) {
    SERVICE.DefaultDatabaseModelHandlerService.inspectIndexes = async model => model === event
      ? { versioned: false, indexes: [index] } : inspect(model);
    await assert.rejects(listing.plan(f.request), /unique identity is unavailable/);
  }
  SERVICE.DefaultDatabaseModelHandlerService.inspectIndexes = inspect;
  assert.equal((await listing.plan(f.request)).planDigest, preview.planDigest);
  assert.deepEqual(f.rows, original);
  assert.equal(f.state.writes, 0);
});
test("canonical managed-create revision one plans with exact selectors; source revision zero refuses without writes", async t => {
  const f = fixture(t), source = structuredClone(f.rows.wasteAsset[0]);
  delete source.tenant;
  assert.equal(assetSchema.definition.revision.default, 0);
  assert.equal(source.revision, 0);
  assert.equal(concurrency.getField(assetSchema), "revision");
  let creates = 0;
  // Exercise the actual managed-create counter with an in-memory provider, not an import or database write.
  const create = { tenant: f.request.tenant, authData: f.request.authData, model: structuredClone(source), schemaModel: {
    rawSchema: assetSchema, primaryKey: "code",
    getItems: async () => ({ result: [] }),
    compareAndSetItem: async input => {
      assert.equal(input.operation, "create");
      assert.equal(input.model.revision, 1);
      creates++;
      return structuredClone(input.model);
    },
  } };
  concurrency.initializeSave(create);
  f.rows.wasteAsset[0] = await concurrency.execute(create, "save");
  assert.equal(creates, 1);
  assert.equal(source.revision, 0);
  assert.equal(f.rows.wasteAsset[0].revision, 1);
  for (const schema of ["wasteAssetTransferPolicy", "wasteRewardSettlementPolicy", "wasteCarbonSettlementPolicy"])
    for (const row of f.rows[schema]) delete row.tenant;
  const forbidWrite = () => assert.fail("A listing plan must never write");
  for (const [name, service] of Object.entries(SERVICE)) if (/^DefaultWaste.*Service$/.test(name))
    for (const method of ["save", "update", "remove"]) if (typeof service[method] === "function") service[method] = forbidWrite;
  const models = NODICS.getModels();
  for (const model of Object.values(models)) model.compareAndSetItem = forbidWrite;
  NODICS.getModels = () => models;
  const before = structuredClone(f.rows), originalRequest = structuredClone(f.request);
  await assert.rejects(listing.plan(f.request), { message: "Original listing asset revision changed" });
  const input = { ...f.request, payload: { ...f.p, expectedAssetRevision: 1 } };
  const plan = await listing.plan(input);
  assert.equal(plan.state, "READ_ONLY_DOMAIN_LISTING_PLAN");
  assert.equal(plan.expectedAssetRevision, 1);
  assert.deepEqual(plan.providerReference.sellerRef, source.ownerRef);
  for (const key of ["assetCode", "storeCode", "transferPolicyCode", "rewardSettlementPolicyCode", "carbonSettlementPolicyCode"])
    assert.equal(plan.providerReference[key], f.p[key]);
  for (const key of ["productCode", "variantCode", "sku"]) assert.equal(plan[key], f.p[key]);
  assert.deepEqual(plan.evidence.retainedProducts.map(value => value.locale), ["ar", "en"]);
  assert.deepEqual(await listing.plan(input), plan);
  assert.deepEqual(f.rows, before);
  assert.deepEqual(f.request, originalRequest);
  assert.equal(f.state.writes, 0);
  assert.equal(creates, 1);
  assert.equal(f.rows.digitalProductBinding.length, 0);
  assert.equal(f.rows.wasteAssetMarketplaceProjection.length, 0);
  assert.ok(f.calls.every(value => value.methodName === "POST" && value.requestBody.kind !== "BINDING"));
  assert.equal(f.config.marketplace.digitalOwnership.enabled, false);
  assert.equal(f.config.marketplace.digitalOwnership.qualified, false);
});
test("missing binding refuses; exact genuine-binding readback attaches only Waste relationship and replays", async t => {
  const f = fixture(t), plan = await listing.plan(f.request), original = structuredClone(f.rows.wasteAsset[0]);
  const input = { ...f.request, payload: { ...f.p, bindingCode: "binding", reviewedPlanDigest: plan.planDigest } };
  await assert.rejects(listing.complete(input), /binding/); assert.equal(f.state.writes, 0);
  f.rows.digitalProductBinding.push({ ...plan, code: "binding", tenant: "t", enterpriseCode: "e", active: true, status: "ACTIVE", revision: 1 });
  const result = await listing.complete(input), writes = f.state.writes;
  assert.equal(result.status, "LISTED"); assert.equal(result.physicalCustodyTransferred, false);
  assert.deepEqual(await listing.complete(input), result); assert.equal(f.state.writes, writes);
  const current = f.rows.wasteAsset[0];
  for (const field of ["metadata", "ownerRef", "digitalOwnerRef", "physicalOwnerRef", "custodyStatus", "assetStatus"]) assert.deepEqual(current[field], original[field]);
  assert.equal(f.rows.digitalProductBinding.length, 1);
});
test("wrong principal, permission, publication, classification, policy and revision refuse before Waste writes", async t => {
  const f = fixture(t);
  await assert.rejects(listing.plan({ ...f.request, authData: { ...f.request.authData, principalType: "human" } }), /authority/);
  await assert.rejects(listing.plan({ ...f.request, payload: { ...f.p, expectedAssetRevision: 2 } }), /revision/);
  f.state.drift = true; await assert.rejects(listing.plan(f.request), /changed/); f.state.drift = false;
  f.rows.productSearchProjection[0].payload.localizedAttributes.digitalDeliveryType = "COUPON";
  await assert.rejects(listing.plan(f.request), /Product/);
  f.rows.productSearchProjection[0].payload.localizedAttributes.digitalDeliveryType = "DIGITAL_OWNERSHIP";
  f.rows.wasteAssetTransferPolicy[0].metadata.digitalOwnership.refund = "UNREVIEWED";
  await assert.rejects(listing.plan(f.request), /refund policy/);
  assert.equal(f.state.writes, 0);
});
test("stale review digest and altered binding pins cannot attach or repair an asset", async t => {
  const f = fixture(t), plan = await listing.plan(f.request);
  const input = { ...f.request, payload: { ...f.p, bindingCode: "binding", reviewedPlanDigest: "0".repeat(64) } };
  await assert.rejects(listing.complete(input), /plan changed/);
  input.payload.reviewedPlanDigest = plan.planDigest;
  f.rows.digitalProductBinding.push({ ...plan, code: "binding", tenant: "t", enterpriseCode: "e", active: true, status: "ACTIVE", revision: 1,
    providerReference: { ...plan.providerReference, assetCode: "foreign" } });
  await assert.rejects(listing.complete(input), /binding/);
  assert.equal(f.state.writes, 0);
});
test("listing route remains service-only with existing project authority and router-derived scope", async t => {
  const f = fixture(t), route = routes.eWaste.internalDigitalListing.internalDigitalListingInvoke;
  assert.deepEqual(route.authTokenTypes, ["service"]); assert.equal(route.permission, "waste.asset.marketplace.project");
  assert.equal(route.apiExposure, "wasteInternal");
  assert.equal(route.requestPrivacy.sensitive, true);
  const headers = [];
  const planned = await controller.invoke({ tenant: f.request.tenant, authData: f.request.authData,
    httpResponse: { setHeader: (...values) => headers.push(values) },
    httpRequest: { params: { phase: "plan" }, body: f.p } });
  assert.equal(planned.data.state, "READ_ONLY_DOMAIN_LISTING_PLAN");
  assert.deepEqual(headers, [["Cache-Control", "no-store"]]);
  const result = await controller.invoke({ tenant: f.request.tenant, authData: f.request.authData,
    httpRequest: { params: { phase: "preview" }, body: f.p } });
  assert.equal(result.data.state, "READ_ONLY_DOMAIN_LISTING_PLAN");
  assert.deepEqual(result, planned);
  await assert.rejects(controller.invoke({ httpRequest: { params: { phase: "create-binding" } } }), /Unsupported/);
});
