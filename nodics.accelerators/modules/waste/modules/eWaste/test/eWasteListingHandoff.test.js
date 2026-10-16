/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module eWaste/test/eWasteListingHandoff @description Tests actual proof, privacy, runtime admission and generated read boundaries through isolated owner transport; no installed services or writes. @layer test @owner eWaste */
const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  lodash = require("lodash");
const root = "../../../../../../";
const handoff = require("../src/service/defaultEWasteListingHandoffService");
const listing = require("../src/service/defaultEWasteListingService");
const controller = require("../src/controller/defaultEWasteListingHandoffController");
const sale = require("../src/service/defaultEWasteDigitalSaleService");
const persistence = require(
  root +
    "nodics.waste/modules/wasteCore/src/service/defaultWastePersistenceService",
);
const inspection = require(
  root +
    "nodics.waste/modules/wasteCore/src/service/defaultWasteInstalledDataInspectionService",
);
const access = require(
  root +
    "nodics.waste/modules/wasteCore/src/service/defaultWasteOperationalAccessService",
);
const runtime = require(
  root +
    "nodics.foundation/modules/nAuth/src/service/identity/defaultServiceTokenService",
);
const security = require(
  root +
    "nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService",
);
const requestHandler = require(
  root +
    "nodics.foundation/modules/nRouter/src/service/request/defaultRequestHandlerPipelineService",
);
const logger = require(
  root + "nodics.foundation/modules/nConfig/src/service/DefaultLoggerService",
);
const permission = "waste.asset.listing.intent.read";

function matches(row, query) {
  return Object.entries(query).every(([key, v]) => {
    if (key === "$and") return v.every((q) => matches(row, q));
    if (key === "$or") return v.some((q) => matches(row, q));
    if (key === "$nor") return !v.some((q) => matches(row, q));
    const actual = lodash.get(row, key);
    if (v && typeof v === "object")
      return Object.entries(v).every(([op, x]) => {
        if (op === "$in") return x.includes(actual);
        if (op === "$exists") return x === (actual !== undefined);
        assert.fail("Unsupported fixture operator");
      });
    return v === null ? actual === null || actual === undefined : actual === v;
  });
}
function fixture(t) {
  const previous = Object.fromEntries(
    ["CONFIG", "SERVICE", "NODICS", "CLASSES", "_", "UTILS"].map((k) => [k, global[k]]),
  );
  t.after(() => {
    for (const [k, v] of Object.entries(previous))
      if (v === undefined) delete global[k];
      else global[k] = v;
  });
  global._ = lodash;
  global.UTILS = { isBlank: lodash.isEmpty };
  const config = {
    applicationCode: "partner",
    marketplace: {
      storeCode: "store",
      listingHandoff: {
        enabled: true,
        pageSize: 25,
        maximumPageSize: 100,
        maximumInspectorSources: 1000,
      },
      digitalOwnership: {
        allowedServicePrincipals: ["staged"],
        businessCallers: [
          {
            tenant: "t",
            principalEnterpriseCode: "default",
            enterpriseCode: "seller-store",
            serviceId: "staged",
            projectCode: "partner",
            environmentCode: "test",
            serverCode: "staged",
            instanceCode: "instance",
            assignmentCode: "assignment",
            permissions: [permission],
          },
        ],
      },
    },
    targetAuthorities: { commerceStaged: { runtimeRole: "COMMERCE_STAGED" } },
  };
  global.CONFIG = {
    get: (key) =>
      key === 'identityGovernance' ? require('../../../../../../nodics.foundation/modules/nAuth/config/properties').identityGovernance : key === "eWaste"
        ? config
        : key === "waste"
          ? { operations: { requireScopes: true, maximumScopePoints: 1000 } }
          : {},
  };
  global.SERVICE = {
    DefaultEWasteExperienceService: { settings: () => config },
    DefaultWasteInstalledDataInspectionService: inspection,
  };
  global.NODICS = { getSelectedEnvironmentName: () => "test" };
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code, message) {
        super(message || code);
        this.code = code;
      }
    },
  };
  const authData = {
    tenant: "t",
    entCode: "default",
    principalType: "service",
    tokenType: "service",
    serviceId: "staged",
    modules: ["eWaste"],
    permissions: [permission],
    runtimeInstanceId: "instance",
    runtimeScope: {
      projectCode: "partner",
      environmentCode: "test",
      serverCode: "staged",
      instanceCode: "instance",
      assignmentCode: "assignment",
    },
  };
  const ownerRef = { module: "profile", schema: "customer", code: "customer" };
  const asset = {
    code: "asset",
    active: true,
    revision: 5,
    assetStatus: "LISTING_REQUESTED",
    ownerRef,
    digitalOwnerRef: structuredClone(ownerRef),
    sourceSubmissionCode: "submission",
    metadata: {
      facts: { name: "Seller approved item" },
      privateVerification: { notes: "PRIVATE_SENTINEL" },
      listingCommand: "a".repeat(64),
      listingIdempotencyKey: "original",
      listingRewardPrice: 6,
    },
  };
  const context = {
    storeContext: {
      code: "store",
      enterpriseCode: "seller-store",
      revision: 2,
    },
    authoringContext: { catalogVersion: "catalog", locales: ["en"] },
  };
  asset.metadata.listingIntent = listing.intent(
    {
      tenant: "t",
      authData: { entCode: "customer-enterprise" },
      idempotencyKey: "original",
      payload: { rewardPrice: 6 },
    },
    { ...asset, revision: 4 },
    ownerRef,
    "a".repeat(64),
    {
      storeCode: "store",
      catalogVersion: "catalog",
      priceBookCode: "book",
      currency: "POINTS",
      transferPolicyCode: "transfer",
      rewardSettlementPolicyCode: "reward",
      carbonSettlementPolicyCode: "carbon",
    },
    context,
  );
  asset.metadata.listingIntent.policyPins = Object.fromEntries(
    Object.entries(require("./helpers/listingPolicyFixtures").rows()).map(
      ([schema, row]) => [
        schema === "wasteAssetTransferPolicy"
          ? "transfer"
          : schema === "wasteRewardSettlementPolicy"
            ? "reward"
            : "carbon",
        handoff.digest(row),
      ],
    ),
  );
  const digest = handoff.digest(asset.metadata.listingIntent);
  asset.metadata.listingIntentDigest = digest;
  const selectors = {
    contractVersion: 1,
    assetCode: "asset",
    listingKey: "a".repeat(64),
    expectedRevision: 5,
    intentDigest: digest,
    storeCode: "store",
  };
  const request = {
    tenant: "t",
    authData,
    httpRequest: { body: structuredClone(selectors), headers: {}, query: {} },
    query: {},
  };
  const state = {
    reads: [],
    calls: [],
    hook: () => {},
    readHook: () => {},
    scopeCalls: 0,
    tables: {
      wasteAsset: [asset],
      wasteSubmission: [
        {
          code: "submission",
          preferredCollectionPointCode: "centre",
          sourceContext: { applicationCode: "partner" },
        },
      ],
      wasteCollectionPoint: [
        { code: "centre", operatorEnterpriseRef: { code: "review-centre" } },
      ],
    },
    scopeReply: {
      principalCode: "operator",
      scopes: [
        { scopeType: "BUSINESS_UNIT", scopeCode: "centre", tenantCode: "t" },
      ],
      deniedScopes: [],
    },
    response: {
      contractVersion: 1,
      tenant: "t",
      store: { ...context.storeContext, active: true, status: "ACTIVE" },
      authoring: context.authoringContext,
    },
    evidence: {
      contractVersion: 1,
      tenant: "t",
      assetCode: "asset",
      listingKey: selectors.listingKey,
      intentDigest: digest,
      storeCode: "store",
      product: null,
      productReference: null,
      publicationReferences: [],
    },
  };
  const privateLogger = { ...logger, isRequestPrivacyQualified: () => true };
  global.SERVICE = {
    DefaultEWasteListingHandoffService: handoff,
    DefaultEWasteDigitalSaleService: sale,
    DefaultEWasteExperienceService: { settings: () => config },
    DefaultWastePersistenceService: persistence,
    DefaultIdentityGovernanceService: require('../../../../../../nodics.foundation/modules/nAuth/src/service/identity/defaultIdentityGovernanceService'),
    DefaultWasteInstalledDataInspectionService: inspection,
    DefaultServiceTokenService: runtime,
    DefaultSecuredRequestPipelineService: security,
    DefaultLoggerService: privateLogger,
    DefaultWasteOperationalAccessService: access,
    DefaultModuleService: {
      invokeModule: async (input) => {
        state.calls.push(structuredClone(input));
        if (input.apiName === "/identity/scopes/me") {
          state.scopeCalls++;
          assert.equal(input.header.Authorization, "Bearer isolated-operator");
          return { data: state.scopeReply };
        }
        assert.equal(input.header, undefined);
        assert.deepEqual(input.request, { tenant: "t" });
        assert.equal(input.maxAttempts, 1);
        await state.hook(input);
        return {
          code: "SUC_API_00000",
          data: {
            data: input.apiName.endsWith("store-context")
              ? state.response
              : state.evidence,
          },
        };
      },
    },
  };
  for (const schema of [
    "wasteAsset",
    "wasteSubmission",
    "wasteCollectionPoint",
  ])
    SERVICE["Default" + schema[0].toUpperCase() + schema.slice(1) + "Service"] =
      {
        get: async (input) => {
          state.reads.push(structuredClone(input));
          assert.equal(input.tenant, "t");
          assert.equal(input.options.skipItemCache, true);
          const rows = state.tables[schema]
            .filter((row) => matches(row, input.query))
            .sort((a, b) => a.code.localeCompare(b.code));
          const start =
            (input.searchOptions.pageNumber - 1) * input.searchOptions.pageSize;
          const response = {
            code: "SUC_FIND_00000",
            count: rows.length,
            result: structuredClone(
              rows.slice(start, start + input.searchOptions.pageSize),
            ),
          };
          await state.readHook(input, response);
          return response;
        },
        save: () => assert.fail("No writes"),
        update: () => assert.fail("No writes"),
        remove: () => assert.fail("No writes"),
      };
  return {
    request,
    asset,
    selectors,
    config,
    state,
    context,
    run: (r) =>
      privateLogger.runSensitiveOperation(r || request, () =>
        handoff.proof(r || request),
      ),
    human: (enterprise = "seller-store") => ({
      tenant: "t",
      authData: {
        tenant: "t",
        entCode: enterprise,
        principalType: "human",
        tokenType: "access",
        code: "operator",
        loginId: "operator",
        permissions: [
          "waste.marketplace.moderate",
          "commerce.product.publish",
          "waste.review.queue.read",
        ],
      },
      authorization: "Bearer isolated-operator",
      query: {},
      code: "asset",
      httpRequest: { query: {}, headers: {} },
    }),
  };
}

function reconciliationFixture(t) {
  const f = fixture(t);
  delete f.asset.metadata.listingIntent;
  f.config.marketplace.listingHandoff.reconciliation = { enabled: true };
  f.state.writes = 0;
  const core = root + "nodics.waste/modules/wasteCore/";
  SERVICE.DefaultWasteDigitalListingOperationService = require(core + "src/service/defaultWasteDigitalListingOperationService");
  SERVICE.DefaultWasteAssetTransferOperationService = require(core + "src/service/defaultWasteAssetTransferOperationService");
  SERVICE.DefaultModelConcurrencyService = require(root + "nodics.foundation/modules/nDatabase/database/src/service/schema/defaultModelConcurrencyService");
  SERVICE.DefaultDatabaseModelHandlerService = { inspectIndexes: async () => ({ versioned: false, indexes: [{ unique: true, key: { code: 1 } }] }) };
  UTILS.createModelName = value => value;
  NODICS.getModels = () => ({ wasteAsset: { primaryKey: "code", versioned: false, compareAndSetItem() {},
    rawSchema: require(core + "src/schemas/schemas").wasteCore.wasteAsset } });
  SERVICE.DefaultWasteAssetService.update = async input => {
    f.state.writes++;
    assert.equal(input.tenant, "t");
    if (f.state.beforeWrite) await f.state.beforeWrite(input);
    if (input.query.code !== f.asset.code || input.query.revision !== f.asset.revision)
      return { code: "SUC_UPDATE", result: { matchedCount: 0 } };
    assert.deepEqual(Object.keys(input.model).sort(), ["code", "metadata", "revision"]);
    Object.assign(f.asset, structuredClone(input.model), { revision: f.asset.revision + 1 });
    if (f.state.loseReply) throw Error("Lost response");
    return { code: "SUC_UPDATE", result: { matchedCount: 1 } };
  };
  f.http = (body) => {
    const r = f.human("review-centre");
    r.httpRequest.params = { assetCode: f.asset.code };
    r.httpRequest.headers.authorization = "Bearer isolated-operator";
    r.httpRequest.body = body || {};
    return r;
  };
  f.inspect = () => {
    const r = f.http();
    return SERVICE.DefaultLoggerService.runSensitiveOperation(r, () => controller.reconciliation(r));
  };
  f.submit = (body) => {
    const r = f.http(body);
    return SERVICE.DefaultLoggerService.runSensitiveOperation(r, () => controller.reconcile(r));
  };
  f.command = () => ({ contractVersion: 1, expectedRevision: f.asset.revision,
    snapshotDigest: handoff.digest(f.asset), idempotencyKey: "withdraw-original-request",
    reason: "Original request evidence is unavailable; retain hold for owner review", confirmed: true });
  return f;
}

test("legacy HTTP withdrawal persists one qualified audit hold, preserves evidence and never claims economic cancellation", async t => {
  const f = reconciliationFixture(t), original = structuredClone(f.asset), command = f.command();
  const preview = (await f.inspect()).data;
  assert.equal(preview.canWithdraw, true);
  assert.equal(preview.snapshotDigest, command.snapshotDigest);
  assert.equal(f.state.writes, 0);
  const result = (await f.submit(command)).data;
  assert.equal(result.state, "RECONCILING");
  assert.equal(result.requestDisposition, "WITHDRAWN");
  assert.equal(result.economicEffects, "UNKNOWN");
  assert.equal(result.relistAllowed, false);
  assert.equal(result.canWithdraw, false);
  assert.equal(result.requiredOwnerChecks.length, 5);
  assert.equal(f.state.writes, 1);
  const receipt = f.asset.metadata.listingReconciliation;
  assert.equal(receipt.command.actor.code, "operator");
  assert.equal(receipt.evidence.originalIntent, "ABSENT");
  assert.equal(receipt.evidence.sourceSnapshotDigest, command.snapshotDigest);
  assert.equal(receipt.evidence.retainedListing.listingRewardPrice, 6);
  const preserved = structuredClone(f.asset);
  delete preserved.metadata.listingReconciliation;
  preserved.revision = original.revision;
  assert.deepEqual(preserved, original);
  assert.equal(f.asset.assetStatus, "LISTING_REQUESTED");
  assert.deepEqual((await f.submit(command)).data, result);
  assert.equal(f.state.writes, 1);
  assert.deepEqual((await f.inspect()).data, result);
  assert(!JSON.stringify(result).includes("PRIVATE_SENTINEL"));
  assert(!JSON.stringify(result).includes(command.reason));
  assert(f.state.calls.every(call => call.apiName === "/identity/scopes/me"));
});

test("lost withdrawal reply recovers only the exact durable CAS receipt without retrying a write", async t => {
  const f = reconciliationFixture(t), command = f.command();
  f.state.loseReply = true;
  const result = await f.submit(command);
  assert.equal(result.data.state, "RECONCILING");
  assert.equal(f.state.writes, 1);
  assert.deepEqual(await f.submit(command), result);
  assert.equal(f.state.writes, 1);
});

test("held request refuses intent proof and malformed hold receipts never claim a completed withdrawal", async t => {
  const f = reconciliationFixture(t);
  await f.submit(f.command());
  assert.throws(() => handoff.intent(f.asset), { code: "ERR_EWASTE_LISTING_RECONCILIATION_REQUIRED" });
  f.asset.metadata.listingReconciliation.relistAllowed = true;
  await assert.rejects(f.inspect());
  assert.equal(f.state.writes, 1);
});

test("withdrawal HTTP boundary preserves original staff scope and denies read-only runtime callers", async t => {
  for (const change of [
    r => { r.authData.principalType = "service"; },
    r => { r.authData.permissions = ["waste.asset.listing.intent.read"]; },
    r => { r.authData.entCode = "foreign"; r.enterpriseCode = "review-centre"; },
    r => { delete r.httpRequest.headers.authorization; r.authorization = "Bearer isolated-operator"; },
  ]) {
    const f = reconciliationFixture(t), r = f.http(f.command());
    SERVICE.DefaultAuthAuditService = { record: async () => {} };
    change(r);
    await assert.rejects(SERVICE.DefaultLoggerService.runSensitiveOperation(r, () => controller.reconcile(r)));
    assert.equal(f.state.writes, 0);
  }
});

test("legacy withdrawal refuses changed selectors, policy, owner scope and known active commands before writes", async t => {
  for (const change of [
    (f, c) => { c.expectedRevision--; },
    (f, c) => { c.snapshotDigest = "f".repeat(64); },
    (f, c) => { c.confirmed = false; },
    (f, c) => { c.reason = ""; },
    (f, c) => { c.ownerProof = {}; },
    f => { f.config.marketplace.listingHandoff.reconciliation.enabled = false; },
    f => { f.asset.metadata.listingIntent = { contractVersion: 2 }; },
    f => { f.asset.metadata.pendingTransferCode = "transfer"; },
    f => { f.asset.metadata.pendingRefundCode = "refund"; },
    f => { f.asset.digitalOwnerRef.code = "foreign"; },
    f => { f.asset.tenant = "foreign"; },
    f => { f.state.scopeReply.deniedScopes = [{ scopeType: "BUSINESS_UNIT", scopeCode: "centre", tenantCode: "t" }]; },
    f => { SERVICE.DefaultDatabaseModelHandlerService.inspectIndexes = async () => ({ versioned: false, indexes: [] }); },
  ]) {
    const f = reconciliationFixture(t), command = f.command();
    change(f, command);
    const before = structuredClone(f.asset);
    await assert.rejects(f.submit(command));
    assert.equal(f.state.writes, 0);
    assert.deepEqual(f.asset, before);
  }
});

test("withdrawal race and altered replay never clear a hold or mutate completed demo state", async t => {
  const f = reconciliationFixture(t), command = f.command();
  await f.submit(command);
  const before = structuredClone(f.asset);
  for (const change of [c => { c.idempotencyKey = "replacement"; }, c => { c.reason = "different reason"; },
    c => { c.snapshotDigest = handoff.digest(f.asset); c.expectedRevision = f.asset.revision; }]) {
    const changed = structuredClone(command); change(changed);
    await assert.rejects(f.submit(changed));
    assert.deepEqual(f.asset, before);
  }
  assert.equal(f.state.writes, 1);
  const other = reconciliationFixture(t), concurrent = other.command();
  other.state.beforeWrite = () => { other.asset.revision++; };
  await assert.rejects(other.submit(concurrent));
  assert.equal(other.asset.metadata.listingReconciliation, undefined);
});

test("readonly permission is recognized once, never a default grant or completion permission", () => {
  const permissions = Object.values(require("../data/init-v001/records/identity/eWastePermissionData"));
  const groups = Object.values(require(root + "nodics.platform/modules/profile/data/init-v001/records/identity/profileUserGroupData"));
  const definitions = permissions.filter(record => record.code === permission);
  assert.equal(definitions.length, 1);
  assert.equal(definitions[0].ownerModule, "eWaste");
  assert.equal(definitions[0].active, true);
  assert(groups.every(group => !(group.permissions || []).includes(permission)));
  const r = require("../src/router/routers").eWaste.listingHandoff
    .listingRequestProof;
  assert.equal(r.permission, permission);
  assert.equal(r.requestPrivacy.sensitive, true);
  assert.equal(r.cache.enabled, false);
});

test("real runtime, router and private logger admit exact readonly proof without complete grant or private data", async (t) => {
  const f = fixture(t),
    before = structuredClone(f.asset),
    result = await f.run();
  assert.equal(result.tenant, "t");
  assert.equal(result.assetRevision, 5);
  assert.equal(result.requestRevision, 5);
  assert.equal(result.listingKey, f.selectors.listingKey);
  assert.equal(Object.hasOwn(result, "priceRowIntent"), false);
  assert.equal(Object.hasOwn(result, "policyRefs"), false);
  const productOwner = require(root + "nodics.commerce/modules/baseCommerce/modules/product/src/service/defaultProductListingAuthoringService");
  assert.deepEqual(productOwner.validateIntentProof(result, f.selectors, "t"), result);
  assert.equal(f.asset.metadata.listingIntent.priceRowIntent.unitAmount, "6");
  assert(!JSON.stringify(result).includes("PRIVATE_SENTINEL"));
  assert.deepEqual(f.asset, before);
  assert.equal(f.state.calls.length, 1);
  assert.deepEqual(f.request.authData.permissions, [permission]);
});

test("Product-only proof still requires eWaste-owned Pricing and settlement evidence before projection", async (t) => {
  for (const change of [
    i => { delete i.policy.carbonSettlementPolicyCode; },
    i => { delete i.policy.rewardSettlementPolicyCode; },
    i => { delete i.policy.transferPolicyCode; },
    i => { delete i.policyPins.carbon; },
    i => { i.policyPins.reward = "unqualified"; },
    i => { delete i.priceRowIntent; },
    i => { i.priceRowIntent.unitAmount = "7"; },
  ]) {
    const f = fixture(t);
    change(f.asset.metadata.listingIntent);
    // Rehash the invalid intent so semantic validation, not only tamper detection, must refuse it.
    const digest = handoff.digest(f.asset.metadata.listingIntent);
    f.asset.metadata.listingIntentDigest = digest;
    f.request.httpRequest.body.intentDigest = digest;
    const before = structuredClone(f.asset);
    await assert.rejects(f.run());
    assert.deepEqual(f.asset, before);
    assert.equal(f.state.calls.length, 0);
  }
});

test("proof expectedRevision is current revision, independent of original requestRevision", async (t) => {
  const f = fixture(t);
  f.asset.revision = 7;
  f.request.httpRequest.body.expectedRevision = 7;
  const result = await f.run();
  assert.equal(result.assetRevision, 7);
  assert.equal(result.requestRevision, 5);
});

test("private context, literal permission, tenant, runtime identity and spoofed namespace reject", async (t) => {
  for (const change of [
    (r) => (r.authData.permissions = ["waste.asset.marketplace.project"]),
    (r) => (r.authData.permissions = ["*"]),
    (r) => (r.authData.modules = []),
    (r) => (r.authData.tokenType = "access"),
    (r) => (r.authData.isSystem = true),
    (r) => (r.authData.serviceId = "foreign"),
    (r) => (r.tenant = "foreign"),
    (r) => (r.enterpriseCode = "seller-store"),
    (r) => (r.httpRequest.headers["x-enterprise-code"] = "seller-store"),
    (r) => (r.authData.runtimeScope.instanceCode = "wrong"),
  ]) {
    const f = fixture(t);
    change(f.request);
    await assert.rejects(f.run());
    assert.equal(f.state.calls.length, 0);
  }
  const f = fixture(t);
  await assert.rejects(handoff.proof(f.request));
  assert.equal(f.state.reads.length, 0);
});

test("business delegation is exact, unique and readonly; no rewritten claims or wildcard action admission", async (t) => {
  for (const change of [
    (f) => (f.config.marketplace.digitalOwnership.businessCallers = []),
    (f) =>
      f.config.marketplace.digitalOwnership.businessCallers.push(
        structuredClone(
          f.config.marketplace.digitalOwnership.businessCallers[0],
        ),
      ),
    (f) =>
      (f.config.marketplace.digitalOwnership.businessCallers[0].permissions = [
        "waste.asset.marketplace.project",
      ]),
    (f) =>
      (f.config.marketplace.digitalOwnership.businessCallers[0].serverCode =
        "other"),
  ]) {
    const f = fixture(t);
    change(f);
    await assert.rejects(f.run());
    assert.equal(f.state.calls.length, 0);
  }
});

test("proof rejects extra authority, stale selectors, legacy and owner drift without backfill", async (t) => {
  for (const change of [
    (f) => (f.request.httpRequest.body.enterpriseCode = "seller-store"),
    (f) => (f.request.httpRequest.body.expectedRevision = 4),
    (f) => (f.request.httpRequest.body.intentDigest = "b".repeat(64)),
    (f) => (f.request.httpRequest.body.storeCode = "foreign"),
    (f) => delete f.asset.metadata.listingIntent,
    (f) => (f.asset.digitalOwnerRef.code = "foreign"),
    (f) => (f.asset.metadata.pendingTransferCode = "lock"),
  ]) {
    const f = fixture(t);
    change(f);
    const before = structuredClone(f.asset);
    await assert.rejects(f.run());
    assert.deepEqual(f.asset, before);
    assert.equal(f.state.calls.length, 0);
  }
});

test("deferred owner responses cannot survive authority, grant, config, selector or asset drift", async (t) => {
  for (const change of [
    (f) => (f.request.authData.permissions = []),
    (f) => f.request.httpRequest.body.expectedRevision++,
    (f) => (f.config.targetAuthorities.commerceStaged.runtimeRole = "OTHER"),
    (f) => f.asset.revision++,
    (f) => (f.config.marketplace.digitalOwnership.businessCallers = []),
  ]) {
    const f = fixture(t);
    f.state.hook = () => change(f);
    await assert.rejects(f.run());
    assert.equal(f.state.calls.length, 1);
  }
});

test("failed envelopes, duplicate generated identities and malformed Store evidence refuse", async (t) => {
  for (const response of [
    { success: false },
    { code: "ERR_SYNTHETIC", data: {} },
    { contractVersion: 1, tenant: "foreign" },
    {
      contractVersion: 1,
      tenant: "t",
      store: { code: "store", revision: 2 },
      authoring: {},
    },
  ]) {
    const f = fixture(t);
    f.state.response = response;
    await assert.rejects(f.run());
  }
  const f = fixture(t);
  f.state.tables.wasteAsset.push(structuredClone(f.asset));
  await assert.rejects(f.run());
  assert.equal(f.state.calls.length, 0);
});

test("Store publisher queue uses fixed retained Store scope, not collection point scope", async (t) => {
  const f = fixture(t),
    r = f.human();
  const other = structuredClone(f.asset);
  other.code = "foreign";
  other.metadata.listingIntent.storeContext.enterpriseCode = "other";
  f.state.tables.wasteAsset.push(other);
  const result = await handoff.queue(r);
  assert.equal(result.total, 1);
  assert.equal(f.state.scopeCalls, 0);
  assert.deepEqual(result.items[0].actions, ["READ_DETAILS"]);
  assert.equal(result.items[0].eligibility.canAuthor, false);
  assert(!JSON.stringify(result).includes("PRIVATE_SENTINEL"));
});

test("wrong-enterprise reviewer has only original source scope and cannot author or inspect Product", async (t) => {
  const f = fixture(t);
  const result = await handoff.detail(f.human("review-centre"));
  assert.equal(f.state.scopeCalls, 1);
  assert.equal(result.eligibility.canAuthor, false);
  assert.equal(
    result.eligibility.blockerCode,
    "ERR_EWASTE_LISTING_STORE_ENTERPRISE_REQUIRED",
  );
  assert.deepEqual(result.actions, ["READ_DETAILS"]);
  assert.equal(f.state.calls.length, 2);
});

test("qualified absence alone advertises authoring; existing graph retains publication references", async (t) => {
  const f = fixture(t);
  let result = await handoff.detail(f.human());
  assert.equal(result.state, "AWAITING_AUTHORING");
  assert.equal(result.eligibility.canAuthor, true);
  assert.deepEqual(result.actions, ["READ_DETAILS", "AUTHOR_PRODUCT_SOURCE"]);
  f.state.evidence.product = {
    productCode: "product",
    variantCode: "variant",
    sku: "sku",
    catalogVersion: "catalog",
    locales: ["en"],
    versionId: 0,
  };
  f.state.evidence.publicationReferences = [
    {
      domain: "product",
      code: "publication",
      state: "SUBMITTED",
      processCode: "process",
      privateNotes: "PRIVATE_SENTINEL",
    },
  ];
  result = await handoff.detail(f.human());
  assert.equal(result.state, "AWAITING_PUBLICATION");
  assert.equal(result.eligibility.canAuthor, false);
  assert.equal(result.publicationReferences[0].processCode, "process");
  assert(!JSON.stringify(result).includes("PRIVATE_SENTINEL"));
});

test("failed or wrong-identity detail evidence never claims absence or admits authoring", async (t) => {
  for (const change of [
    (f) => (f.state.evidence.assetCode = "foreign"),
    (f) => (f.state.evidence.success = false),
    (f) => delete f.state.evidence.product,
    (f) =>
      (f.state.evidence.publicationReferences = [
        { domain: "product", code: "https://evil", state: "ACTIVE" },
      ]),
  ]) {
    const f = fixture(t);
    change(f);
    const result = await handoff.detail(f.human());
    assert.equal(result.state, "OWNER_UNAVAILABLE");
    assert.equal(result.eligibility.canAuthor, false);
    assert.deepEqual(result.actions, ["READ_DETAILS"]);
  }
});

test("legacy source inspector returns stable nullability, never current-policy adoption", async (t) => {
  const f = fixture(t);
  delete f.asset.metadata.listingIntent;
  const before = structuredClone(f.asset);
  const result = await handoff.detail(f.human("review-centre"));
  assert.equal(result.state, "RECONCILIATION_REQUIRED");
  for (const k of [
    "listingKey",
    "requestRevision",
    "intentDigest",
    "storeContext",
    "authoringContext",
    "productCommand",
    "priceRowIntent",
    "policyRefs",
    "product",
    "productReference",
  ])
    assert.equal(result[k], null, k);
  assert.deepEqual(result.actions, ["READ_DETAILS"]);
  assert.deepEqual(result.publicationReferences, []);
  assert.deepEqual(f.asset, before);
});

test("historical intent cannot gain authoring or private proof from retained Product metadata", async (t) => {
  for (const change of [
    (asset) => delete asset.metadata.listingIntent,
    (asset) => (asset.metadata.listingIntent.contractVersion = 1),
    (asset) => (asset.metadata.listingIntent.contractVersion = 3),
    (asset) => delete asset.metadata.listingIntent.policyPins,
  ]) {
    const f = fixture(t);
    change(f.asset);
    f.asset.metadata.listingProduct = { productCode: "retained-product" };
    const before = structuredClone(f.asset);
    for (const enterprise of ["seller-store", "review-centre"]) {
      if (enterprise === "seller-store" && f.asset.metadata.listingIntent?.contractVersion !== 2) {
        await assert.rejects(handoff.detail(f.human(enterprise)), {
          code: "ERR_EWASTE_LISTING_FORBIDDEN",
        });
        continue;
      }
      const dto = await handoff.detail(f.human(enterprise));
      assert.equal(dto.state, "RECONCILIATION_REQUIRED");
      assert.equal(dto.rewardPrice, 6);
      assert.equal(dto.eligibility.canAuthor, false);
      assert.equal(dto.eligibility.blockerCode, "ERR_EWASTE_LISTING_RECONCILIATION_REQUIRED");
      assert.equal(dto.intentDigest, null);
      assert.equal(dto.product, null);
      assert.deepEqual(dto.actions, ["READ_DETAILS"]);
      assert.deepEqual(dto.publicationReferences, []);
    }
    assert.equal(f.state.calls.some((call) => call.apiName.endsWith("source-evidence")), false);
    await assert.rejects(f.run(), {
      code: before.metadata.listingIntent?.contractVersion === 2
        ? "ERR_EWASTE_LISTING_PROOF_REQUIRED"
        : "ERR_EWASTE_LISTING_RECONCILIATION_REQUIRED",
    });
    assert.deepEqual(f.asset, before);
  }
});

test("human principal, namespace and moderator permission reject before owner or generated reads", async (t) => {
  for (const change of [
    (r) => (r.authData.permissions = []),
    (r) => (r.authData.principalType = "customer"),
    (r) => (r.authData.tokenType = "service"),
    (r) => (r.authData.isSystem = true),
    (r) => (r.authData.enterpriseCode = "foreign"),
    (r) => (r.httpRequest.headers["x-enterprise-code"] = "foreign"),
  ]) {
    const f = fixture(t),
      r = f.human();
    change(r);
    await assert.rejects(handoff.queue(r));
    assert.equal(f.state.calls.length, 0);
    assert.equal(f.state.reads.length, 0);
  }
});

test("actual Profile deny scope and application partition prevent inspector disclosure", async (t) => {
  const f = fixture(t);
  f.state.scopeReply.deniedScopes = [
    { scopeType: "BUSINESS_UNIT", scopeCode: "centre", tenantCode: "t" },
  ];
  let result = await handoff.queue(f.human("review-centre"));
  assert.equal(result.total, 0);
  f.state.scopeReply.deniedScopes = [];
  f.state.tables.wasteSubmission[0].sourceContext.applicationCode = "other";
  result = await handoff.queue(f.human("review-centre"));
  assert.equal(result.total, 0);
  const r = f.human("review-centre");
  r.authData.permissions = ["waste.marketplace.moderate"];
  await assert.rejects(handoff.queue(r));
});

test("bounded paging applies scope before counts and rejects caller query operators", async (t) => {
  const f = fixture(t);
  const other = structuredClone(f.asset);
  other.code = "asset-b";
  other.metadata.listingIntent.assetCode = other.code;
  f.state.tables.wasteAsset.push(other);
  const r = f.human();
  r.query = { page: "2", limit: "1" };
  const result = await handoff.queue(r);
  assert.equal(result.total, 2);
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].assetCode, "asset-b");
  for (const query of [
    { limit: 101 },
    { page: 0 },
    { page: { $gt: 0 } },
    { enterpriseCode: "other" },
    { limit: "01" },
  ]) {
    const next = f.human();
    next.query = query;
    const count = f.state.calls.length;
    await assert.rejects(handoff.queue(next));
    assert.equal(f.state.calls.length, count);
  }
});

test("source catalog/locales mismatch and asset lock cannot advertise source authoring", async (t) => {
  const f = fixture(t);
  f.state.evidence.product = {
    productCode: "product",
    variantCode: "variant",
    sku: "sku",
    catalogVersion: "other",
    locales: ["en"],
    versionId: 0,
  };
  await assert.rejects(handoff.detail(f.human()), {
    code: "ERR_EWASTE_LISTING_PROOF_REQUIRED",
  });
  f.asset.metadata.pendingRefundCode = "refund";
  const result = await handoff.detail(f.human());
  assert.equal(result.eligibility.canAuthor, false);
  assert.deepEqual(result.actions, ["READ_DETAILS"]);
});

test("default configuration is inert and a later-layer reader can narrow paging without widening authorization", async (t) => {
  const f = fixture(t);
  assert.equal(
    require("../config/properties").eWaste.marketplace.listingHandoff.enabled,
    false,
  );
  f.config.marketplace.listingHandoff.enabled = false;
  await assert.rejects(f.run());
  assert.equal(f.state.reads.length, 0);
  f.config.marketplace.listingHandoff.enabled = true;
  const narrowed = {
    ...handoff,
    settings() {
      return { ...handoff.settings(), pageSize: 1, maximumPageSize: 1 };
    },
  };
  const result = await narrowed.queue(f.human());
  assert.equal(result.limit, 1);
  const r = f.human();
  r.query = { limit: 2 };
  await assert.rejects(narrowed.queue(r));
});

test("completed listing remains readonly without a false permission denial or new authoring advertisement", async (t) => {
  const f = fixture(t);
  f.asset.assetStatus = "LISTED";
  const result = await handoff.detail(f.human());
  assert.equal(result.state, "LISTED");
  assert.equal(result.eligibility.blockerCode, null);
  assert.equal(result.eligibility.canAuthor, false);
  assert.deepEqual(result.actions, ["READ_DETAILS"]);
  assert.equal(f.state.calls.length, 1);
});

test("actual Product source-evidence owner emits supported lifecycle states and real version consumed by Waste", async (t) => {
  const f = fixture(t);
  const productOwner = require(
    root +
      "nodics.commerce/modules/baseCommerce/modules/product/src/service/defaultProductListingAuthoringService",
  );
  const get = CONFIG.get;
  CONFIG.get = (key) =>
    key === "product"
      ? {
          marketplaceAuthoring: {
            enabled: true,
            catalogVersion: "catalog",
            locales: ["en"],
            storeSource: {
              moduleName: "store",
              connectionName: "commerce",
              connectionType: "abstract",
              runtimeRole: "COMMERCE",
              timeoutMs: 15000,
              allowInsecureLoopback: false,
            },
          },
        }
      : key === "runtimeRole"
        ? { publication: "STAGED" }
        : get(key);
  const graph = {
    present: true,
    productCode: "product",
    variantCode: "variant",
    sku: "sku",
    root: {
      code: "product",
      enterpriseCode: "seller-store",
      versionId: 2,
      listingAuthoring: { original: true },
      publicationReferences: {
        publicationCode: "publication",
        storeCode: "store",
      },
    },
  };
  const publication = {
    code: "publication",
    domain: "product",
    rootType: "product",
    rootCode: "product",
    tenantCode: "t",
    enterpriseCode: "seller-store",
    sourceVersion: "2",
    targetVersion: "f".repeat(64),
    state: "STAGED",
    workflow: { instanceCode: "process" },
    auditTrail: [{ toState: "APPROVED" }],
    activationOperation: { key: "activation" },
  };
  const scope = { tenant: "t", productCode: "product", storeCode: "store" };
  const status = {
    version: publication.targetVersion,
    revision: 1,
    scope,
    receipt: {
      committed: true,
      scope,
      publicationCode: "publication",
      operationKey: "activation",
      sourceVersion: "2",
      targetVersion: publication.targetVersion,
    },
  };
  const product = {
    ...productOwner,
    readIntentProof: async (r, selectors) =>
      productOwner.validateIntentProof(
        handoff.projectProof(f.asset, handoff.intent(f.asset)),
        selectors,
        r.tenant,
      ),
    create: async () => structuredClone(graph),
  };
  SERVICE.DefaultIdentityGovernanceService = {
    getSystemAuthData: () => ({ isSystem: true }),
  };
  SERVICE.DefaultStoreService = {
    get: async () => assert.fail("Product cannot fall back to a local Store"),
  };
  SERVICE.DefaultPublicationLifecycleService = {
    get: async () => structuredClone(publication),
  };
  SERVICE.DefaultProductPublicationVersionProviderService = {
    getVersion: async () => ({
      version: publication.targetVersion,
      scope,
      root: structuredClone(graph.root),
    }),
    transport: () => ({ getStatus: async () => structuredClone(status) }),
  };
  NODICS.getInternalAuthToken = () => "synthetic-staged-token";
  SERVICE.DefaultModuleService.invokeModule = async (input) => {
    if (input.apiName === "/internal/stores/placement") {
      assert.equal(input.moduleName, "store");
      assert.equal(input.connectionName, "commerce");
      assert.equal(input.header.Authorization, "Bearer synthetic-staged-token");
      assert.deepEqual(Object.keys(input.header).sort(), [
        "Authorization",
        "tenant",
      ]);
      assert.deepEqual(input.requestBody, {
        contractVersion: 1,
        storeCode: "store",
      });
      const placement = require(
        root +
          "nodics.commerce/modules/baseCommerce/modules/store/src/service/defaultStorePlacementService",
      );
      const store = placement.project(
        {
          code: "SUC_FIND_00000",
          count: 1,
          result: [
            {
              tenant: "t",
              code: "store",
              active: true,
              status: "ACTIVE",
              revision: 2,
              enterpriseRef: {
                module: "profile",
                schema: "enterprise",
                code: "seller-store",
              },
            },
          ],
        },
        "t",
        "store",
        "seller-store",
      );
      return {
        code: "SUC_SYS_00000",
        result: { data: { contractVersion: 1, tenant: "t", store } },
      };
    }
    const r = {
      tenant: "t",
      authData: {
        ...structuredClone(f.request.authData),
        entCode: "seller-store",
        modules: ["product"],
        permissions: ["commerce.product.read"],
      },
      payload: structuredClone(input.requestBody),
      httpRequest: { body: structuredClone(input.requestBody), headers: {} },
    };
    return SERVICE.DefaultLoggerService.runSensitiveOperation(r, async () => ({
      code: "SUC_SYS_00000",
      result: {
        data: input.apiName.endsWith("store-context")
          ? await product.storeContext(r)
          : await product.sourceEvidence(r),
      },
    }));
  };
  for (const state of [
    "STAGED",
    "PENDING_APPROVAL",
    "APPROVAL_PENDING",
    "ONLINE",
  ]) {
    publication.state = state;
    const result = await handoff.detail(f.human());
    assert.equal(result.state, "AWAITING_PUBLICATION");
    assert.equal(result.product.versionId, 2);
    assert.equal(result.publicationReferences[0].state, state);
    assert.equal(result.publicationReferences[0].processCode, "process");
    assert.equal(
      result.productReference?.sourceVersion ?? null,
      state === "ONLINE" ? "2" : null,
    );
    assert.equal(result.eligibility.canAuthor, false);
  }
  publication.state = "PRIVATE_UNKNOWN";
  assert.equal((await handoff.detail(f.human())).state, "OWNER_UNAVAILABLE");
});

test("source versions are required safe integers and match the exact Product reference", async (t) => {
  for (const versionId of [
    undefined,
    null,
    -1,
    1.5,
    "1",
    Number.MAX_SAFE_INTEGER + 1,
  ]) {
    const f = fixture(t);
    f.state.evidence.product = {
      productCode: "product",
      variantCode: "variant",
      sku: "sku",
      catalogVersion: "catalog",
      locales: ["en"],
      versionId,
    };
    assert.equal((await handoff.detail(f.human())).state, "OWNER_UNAVAILABLE");
  }
  const f = fixture(t);
  f.state.evidence.product = {
    productCode: "product",
    variantCode: "variant",
    sku: "sku",
    catalogVersion: "catalog",
    locales: ["en"],
    versionId: 0,
  };
  f.state.evidence.productReference = {
    publicationCode: "publication",
    productCode: "product",
    storeCode: "store",
    sourceVersion: "1",
    targetVersion: "a".repeat(64),
  };
  assert.equal((await handoff.detail(f.human())).state, "OWNER_UNAVAILABLE");
});

test("runtime listing presentation is admitted and allowlisted without owner reads or command metadata", async (t) => {
  const f = fixture(t),
    defaults = require("../config/properties"),
    get = CONFIG.get;
  const view = structuredClone(
    defaults.waste.listingWorkspace.views["ewaste.listingRequests"],
  );
  view.labels.privateUnknown = "PRIVATE_SENTINEL";
  CONFIG.get = (key) =>
    key === "waste"
      ? { listingWorkspace: { views: { "ewaste.listingRequests": view } } }
      : get(key);
  const r = f.human(),
    result = await SERVICE.DefaultLoggerService.runSensitiveOperation(r, () =>
      controller.describe(r),
    );
  assert.equal(result.data.workspaceCode, "waste.listing");
  assert.equal(result.data.viewCode, "ewaste.listingRequests");
  assert.equal(
    result.data.presentation.labels.title,
    "Electronics listing requests",
  );
  assert.equal(result.data.presentation.states.LISTED, "Listed");
  assert.deepEqual(result.data.presentation.authoring, view.authoring);
  assert.deepEqual(result.data.presentation.reconciliation, view.reconciliation);
  assert(!JSON.stringify(result).includes("PRIVATE_SENTINEL"));
  assert.equal(f.state.calls.length, 0);
  assert.equal(f.state.reads.length, 0);
  r.authData.permissions = [];
  assert.throws(() => handoff.describe(r));
  r.authData.permissions = ["waste.marketplace.moderate"];
  delete view.labels.refresh;
  assert.throws(() => handoff.describe(r), {
    code: "ERR_EWASTE_LISTING_OWNER_UNAVAILABLE",
  });
});

test("optional authoring copy projects exactly seven later-layer strings without action authority", (t) => {
  const f = fixture(t),
    defaults = require("../config/properties"),
    get = CONFIG.get,
    view = structuredClone(
      defaults.waste.listingWorkspace.views["ewaste.listingRequests"],
    ),
    keys = [
      "reviewTitle",
      "confirmLabel",
      "cancelLabel",
      "workingLabel",
      "savedMessage",
      "uncertainMessage",
      "inspectLabel",
    ];
  CONFIG.get = (key) =>
    key === "waste"
      ? { listingWorkspace: { views: { "ewaste.listingRequests": view } } }
      : get(key);
  const expected = Object.fromEntries(
    keys.map((key) => [key, "Custom " + key]),
  );
  view.authoring = {
    ...expected,
    privateUnknown: "PRIVATE_SENTINEL",
    actions: ["AUTHOR_PRODUCT"],
  };
  const result = handoff.describe(f.human());
  assert.deepEqual(result.presentation.authoring, expected);
  assert.deepEqual(Object.keys(result.presentation).sort(), [
    "authoring",
    "labels",
    "reconciliation",
    "states",
  ]);
  assert(!JSON.stringify(result).includes("PRIVATE_SENTINEL"));
  assert(!JSON.stringify(result).includes("AUTHOR_PRODUCT"));
  assert.equal(f.state.calls.length, 0);
  assert.equal(f.state.reads.length, 0);
  assert.equal(defaults.eWaste.marketplace.listingHandoff.enabled, false);
  f.config.marketplace.listingHandoff.enabled = false;
  assert.throws(() => handoff.describe(f.human()), {
    code: "ERR_EWASTE_LISTING_OWNER_UNAVAILABLE",
  });
});

test("absent authoring copy preserves read-only presentation and moderator admission", (t) => {
  const f = fixture(t),
    defaults = require("../config/properties"),
    get = CONFIG.get,
    view = structuredClone(
      defaults.waste.listingWorkspace.views["ewaste.listingRequests"],
    );
  CONFIG.get = (key) =>
    key === "waste"
      ? { listingWorkspace: { views: { "ewaste.listingRequests": view } } }
      : get(key);
  const current = handoff.describe(f.human()).presentation;
  delete view.authoring;
  assert.deepEqual(handoff.describe(f.human()).presentation, {
    labels: current.labels,
    states: current.states,
    reconciliation: current.reconciliation,
  });
  const denied = f.human();
  denied.authData.permissions = [];
  assert.throws(() => handoff.describe(denied));
  assert.equal(f.state.calls.length, 0);
  assert.equal(f.state.reads.length, 0);
});

test("present authoring copy uses the same complete bounded string validation as labels and states", (t) => {
  const f = fixture(t),
    defaults = require("../config/properties"),
    get = CONFIG.get,
    view = structuredClone(
      defaults.waste.listingWorkspace.views["ewaste.listingRequests"],
    ),
    original = structuredClone(view.authoring),
    unavailable = { code: "ERR_EWASTE_LISTING_OWNER_UNAVAILABLE" };
  CONFIG.get = (key) =>
    key === "waste"
      ? { listingWorkspace: { views: { "ewaste.listingRequests": view } } }
      : get(key);
  for (const key of Object.keys(original)) {
    view.authoring = { ...original, [key]: "x".repeat(500) };
    assert.equal(
      handoff.describe(f.human()).presentation.authoring[key].length,
      500,
    );
    for (const invalid of [
      undefined,
      null,
      false,
      7,
      {},
      "",
      "  ",
      "x".repeat(501),
      "private\u0000value",
      "private\u007fvalue",
    ]) {
      view.authoring = { ...original, [key]: invalid };
      assert.throws(() => handoff.describe(f.human()), unavailable, key);
    }
    view.authoring = { ...original };
    delete view.authoring[key];
    assert.throws(() => handoff.describe(f.human()), unavailable, key);
  }
  view.authoring = null;
  assert.throws(() => handoff.describe(f.human()), unavailable);
  assert.equal(f.state.calls.length, 0);
  assert.equal(f.state.reads.length, 0);
});

test("optional reconciliation copy is bounded, allowlisted and never grants withdrawal authority", t => {
  const f = fixture(t), defaults = require("../config/properties"), get = CONFIG.get;
  const view = structuredClone(defaults.waste.listingWorkspace.views["ewaste.listingRequests"]);
  const keys = ["inspectLabel", "withdrawLabel", "reasonLabel", "confirmLabel",
    "cancelLabel", "holdMessage", "uncertainMessage", "unavailableMessage"];
  CONFIG.get = key => key === "waste"
    ? { listingWorkspace: { views: { "ewaste.listingRequests": view } } } : get(key);
  assert.deepEqual(Object.keys(view.reconciliation).sort(), [...keys].sort());
  assert.match(view.reconciliation.holdMessage, /reconciliation pending/);
  assert.match(view.reconciliation.holdMessage, /Economic effects remain unresolved/);
  assert.match(view.reconciliation.holdMessage, /relisting is unavailable/);
  assert.equal(defaults.eWaste.marketplace.listingHandoff.reconciliation.enabled, false);
  const expected = Object.fromEntries(keys.map(key => [key, "Custom " + key]));
  view.reconciliation = { ...expected, canWithdraw: true, privateUnknown: "PRIVATE_SENTINEL" };
  const presentation = handoff.describe(f.human()).presentation;
  assert.deepEqual(presentation.reconciliation, expected);
  assert(!JSON.stringify(presentation).includes("PRIVATE_SENTINEL"));
  assert(!JSON.stringify(presentation).includes("canWithdraw"));
  delete view.reconciliation;
  const { reconciliation, ...without } = presentation;
  assert.deepEqual(handoff.describe(f.human()).presentation, without);
  const unavailable = { code: "ERR_EWASTE_LISTING_OWNER_UNAVAILABLE" };
  for (const key of keys) {
    view.reconciliation = { ...expected, [key]: "x".repeat(500) };
    assert.equal(handoff.describe(f.human()).presentation.reconciliation[key].length, 500);
    for (const invalid of [undefined, null, false, 7, {}, "", "  ", "x".repeat(501), "bad\u0000text", "bad\u007ftext"]) {
      view.reconciliation = { ...expected, [key]: invalid };
      assert.throws(() => handoff.describe(f.human()), unavailable, key);
    }
    view.reconciliation = { ...expected };
    delete view.reconciliation[key];
    assert.throws(() => handoff.describe(f.human()), unavailable, key);
  }
  for (const invalid of [null, false, [], "copy"]) {
    view.reconciliation = invalid;
    assert.throws(() => handoff.describe(f.human()), unavailable);
  }
  view.reconciliation = expected;
  const denied = f.human(); denied.authData.permissions = [];
  assert.throws(() => handoff.describe(denied));
  assert.equal(f.state.calls.length, 0);
  assert.equal(f.state.reads.length, 0);
});

test("HTTP listing inspector forwards only the original bearer for queue and legacy detail scopes", async (t) => {
  for (const operation of ["queue", "detail"])
    for (const header of ["authorization", "Authorization"])
      for (const prefilled of [false, true])
      await t.test(operation + " " + header + " prefilled=" + prefilled, async (t) => {
        const f = fixture(t),
          r = f.human("review-centre");
        delete f.asset.metadata.listingIntent;
        delete f.asset.metadata.listingIntentDigest;
        delete r.authorization;
        r.httpRequest.headers[header] = "Bearer isolated-operator";
        r.httpRequest.get = (name) =>
          r.httpRequest.headers[name.toLowerCase()] || r.httpRequest.headers[name];
        let parsed = false;
        requestHandler.parseHeader.call(
          { ...requestHandler, LOG: { debug() {}, warn() {} } }, r, {},
          {
            nextSuccess: () => { parsed = true; },
            error: (_request, _response, error) => { throw error; },
          },
        );
        assert.equal(parsed, true);
        assert.equal(r.authToken, "isolated-operator");
        assert.equal(r.authorization, undefined);
        if (prefilled) r.authorization = "Bearer spoofed-context-must-not-forward";
        r.httpRequest.params = { assetCode: f.asset.code };
        const originalAuth = structuredClone(r.authData);
        const result = await SERVICE.DefaultLoggerService.runSensitiveOperation(
          r, () => controller[operation](r),
        );
        const dto = operation === "queue" ? result.data.items[0] : result.data;
        assert.equal(dto.assetCode, f.asset.code);
        assert.equal(dto.state, "RECONCILIATION_REQUIRED");
        assert.equal(dto.eligibility.canAuthor, false);
        assert.deepEqual(dto.actions, ["READ_DETAILS"]);
        assert.equal(dto.productCommand, null);
        assert.equal(f.state.scopeCalls, 1);
        assert.deepEqual(r.authData, originalAuth);
        assert.equal(r.httpRequest.headers[header], "Bearer isolated-operator");
        assert.equal(
          f.state.calls.filter(call => call.apiName.endsWith("store-context")).length,
          1,
        );
        assert(f.state.reads.length > 0);
      });
});

test("HTTP listing inspector cannot replace missing or invalid bearer with spoofed context", async (t) => {
  for (const [name, headers] of [
    ["missing", {}],
    ["empty", { authorization: "" }],
    ["non-bearer", { authorization: "Basic isolated" }],
    ["empty-bearer", { authorization: "Bearer " }],
    ["multiple-values", { authorization: ["Bearer isolated-operator"] }],
    ["extra-token", { authorization: "Bearer isolated-operator extra" }],
    ["conflicting-aliases", {
      authorization: "Bearer isolated-operator", Authorization: "Bearer conflicting",
    }],
  ])
    await t.test(name, async (t) => {
      const f = fixture(t), r = f.human("review-centre"), denied = [];
      r.httpRequest.headers = headers;
      SERVICE.DefaultAuthAuditService = {
        record: async (event) => denied.push(event.reasonCode),
      };
      await assert.rejects(
        SERVICE.DefaultLoggerService.runSensitiveOperation(r, () => controller.queue(r)),
        (error) => error.code === "ERR_EWASTE_LISTING_OWNER_UNAVAILABLE",
      );
      assert.deepEqual(denied, ["PROFILE_SCOPE_TOKEN_REQUIRED"]);
      assert.equal(f.state.scopeCalls, 0);
      assert.equal(f.state.reads.length, 0);
    });
});

test("controller preserves canonical data envelope and no-store, never raw private errors", async (t) => {
  const f = fixture(t),
    headers = {};
  f.request.httpResponse = { setHeader: (k, v) => (headers[k] = v) };
  const result = await SERVICE.DefaultLoggerService.runSensitiveOperation(
    f.request,
    () => controller.proof(f.request),
  );
  assert.equal(result.data.intentDigest, f.selectors.intentDigest);
  assert.equal(headers["Cache-Control"], "no-store");
  const r = structuredClone({ ...f.request, httpResponse: undefined });
  f.state.hook = () => {
    throw Error("PRIVATE_SENTINEL");
  };
  await assert.rejects(
    SERVICE.DefaultLoggerService.runSensitiveOperation(r, () =>
      controller.proof(r),
    ),
    (e) =>
      e.code === "ERR_EWASTE_LISTING_OWNER_UNAVAILABLE" &&
      !e.message.includes("PRIVATE_SENTINEL"),
  );
});
