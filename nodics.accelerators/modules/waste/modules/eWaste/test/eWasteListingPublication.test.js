/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module eWaste/test/eWasteListingPublication @description Tests actual customer intent capture and generated Waste CAS using inert Store transport; never authors or publishes Commerce records. @layer test @owner eWaste */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const listing = require("../src/service/defaultEWasteListingService");
const handoff = require("../src/service/defaultEWasteListingHandoffService");
const root = "../../../../../../";
const persistence = require(
  root +
    "nodics.waste/modules/wasteCore/src/service/defaultWastePersistenceService",
);
const inspection = require(
  root +
    "nodics.waste/modules/wasteCore/src/service/defaultWasteInstalledDataInspectionService",
);
const sale = require("../src/service/defaultEWasteDigitalSaleService");
const transfer = require(
  root +
    "nodics.waste/modules/wasteCore/src/service/defaultWasteAssetTransferOperationService",
);

function fixture(t) {
  const previous = { SERVICE: global.SERVICE, CONFIG: global.CONFIG };
  t.after(() => {
    for (const [k, v] of Object.entries(previous))
      if (v === undefined) delete global[k];
      else global[k] = v;
  });
  const request = {
    tenant: "tenant-a",
    code: "asset-a",
    confirmed: true,
    expectedRevision: 4,
    idempotencyKey: "original-command",
    payload: { rewardPrice: 12 },
    authData: {
      tenant: "tenant-a",
      entCode: "customer-enterprise",
      principalType: "customer",
      loginId: "owner@example.test",
      code: "owner-a",
    },
  };
  const settings = {
    applicationCode: "partner-a",
    marketplace: {
      autoPublishListings: true,
      listingHandoff: { enabled: true },
      storeCode: "store-a",
      catalogVersion: "catalog-a",
      currency: "POINTS",
      priceBookCode: "book-a",
      transferPolicyCode: "transfer-a",
      rewardSettlementPolicyCode: "reward-a",
      carbonSettlementPolicyCode: "carbon-a",
      listingPresentation: {
        description: "Seller reviewed presentation",
        sample: false,
      },
    },
    targetAuthorities: { commerceStaged: { runtimeRole: "COMMERCE_STAGED" } },
  };
  const ownerRef = { module: "profile", schema: "customer", code: "owner-a" };
  const state = {
    asset: {
      code: "asset-a",
      revision: 4,
      active: true,
      assetStatus: "OWNED",
      ownerRef,
      digitalOwnerRef: structuredClone(ownerRef),
      metadata: {
        facts: { name: "Original item", description: "Approved description" },
        photo: { url: "private-photo-not-for-listing" },
        preservedEvidence: "kept",
      },
    },
    reads: 0,
    writes: 0,
    calls: [],
    hook: () => {},
    afterUpdate: () => {},
    response: {
      contractVersion: 1,
      tenant: "tenant-a",
      store: {
        code: "store-a",
        enterpriseCode: "store-enterprise",
        revision: 2,
        active: true,
        status: "ACTIVE",
      },
      authoring: { catalogVersion: "catalog-a", locales: ["en"] },
    },
  };
  const policies = require("./helpers/listingPolicyFixtures").rows(
    "transfer-a",
    "reward-a",
    "carbon-a",
  );
  const store = {
    ...persistence,
    repository: (schema) => {
      if (policies[schema])
        return {
          get: async () => ({
            code: "SUC_FIND_00000",
            result: [structuredClone(policies[schema])],
            count: 1,
          }),
        };
      assert.equal(schema, "wasteAsset");
      return {
        get: async (input) => {
          assert.equal(input.tenant, "tenant-a");
          state.reads++;
          return { result: [structuredClone(state.asset)] };
        },
        update: async (input) => {
          assert.deepEqual(input.query, {
            code: "asset-a",
            revision: state.asset.revision,
          });
          state.writes++;
          Object.assign(state.asset, structuredClone(input.model), {
            revision: state.asset.revision + 1,
          });
          await state.afterUpdate();
        },
      };
    },
  };
  global.CONFIG = { get: key => key === 'identityGovernance' ? require('../../../../../../nodics.foundation/modules/nAuth/config/properties').identityGovernance : key === "eWaste" ? settings : undefined };
  global.SERVICE = {
    DefaultIdentityGovernanceService: require('../../../../../../nodics.foundation/modules/nAuth/src/service/identity/defaultIdentityGovernanceService'),
    DefaultWastePersistenceService: store,
    DefaultWasteInstalledDataInspectionService: inspection,
    DefaultEWasteDigitalSaleService: sale,
    DefaultWasteAssetTransferOperationService: transfer,
    DefaultEWasteListingHandoffService: handoff,
    DefaultEWasteExperienceService: {
      settings: () => settings,
      store: () => store,
    },
    DefaultModuleService: {
      invokeModule: async (input) => {
        assert.equal(input.methodName, "POST");
        assert.equal(
          input.apiName,
          "/internal/products/listings/store-context",
        );
        assert.equal(input.maxAttempts, 1);
        assert.equal(input.header, undefined);
        state.calls.push(structuredClone(input));
        await state.hook();
        return { data: state.response };
      },
    },
  };
  return { request, settings, state };
}
const pending = { code: "ERR_EWASTE_LISTING_PUBLICATION_REQUIRED" };

test("capture saves one immutable v2 intent in Store context without Product writes or private media", async (t) => {
  const f = fixture(t),
    original = structuredClone(f.request);
  await assert.rejects(listing.list(f.request), pending);
  assert.equal(f.state.calls.length, 1);
  assert.equal(f.state.writes, 1);
  const i = f.state.asset.metadata.listingIntent;
  assert.equal(i.contractVersion, 2);
  assert.equal(i.requestRevision, 5);
  assert.equal(i.enterpriseCode, "customer-enterprise");
  assert.equal(i.storeContext.enterpriseCode, "store-enterprise");
  assert.equal(i.priceRowIntent.unitAmount, "12");
  assert.equal(i.priceRowIntent.code, "WASTE_PRICE_" + i.listingKey);
  assert.equal(i.productCommand.imageUrl, undefined);
  assert(!JSON.stringify(i).includes("private-photo"));
  assert.equal(f.state.asset.assetStatus, "LISTING_REQUESTED");
  assert.equal(f.state.asset.metadata.preservedEvidence, "kept");
  assert.equal(f.state.asset.metadata.listingIntentDigest, handoff.digest(i));
  assert.deepEqual(f.request, original);
});

test("explicit replay uses current revision and saved command with no owner transport or extra writes", async (t) => {
  const f = fixture(t);
  await assert.rejects(listing.list(f.request), pending);
  f.request.expectedRevision = f.state.asset.revision;
  f.state.asset.metadata.facts.name = "Later title cannot replace saved intent";
  const before = structuredClone(f.state.asset);
  await assert.rejects(listing.list(f.request), pending);
  assert.equal(f.state.calls.length, 1);
  assert.equal(f.state.writes, 1);
  assert.deepEqual(f.state.asset, before);
});

test("lost CAS acknowledgement permits only explicit same-command recovery", async (t) => {
  const f = fixture(t);
  f.state.afterUpdate = () => {
    throw Error("Isolated lost acknowledgement");
  };
  await assert.rejects(listing.list(f.request), /lost acknowledgement/);
  f.state.afterUpdate = () => {};
  f.request.expectedRevision = f.state.asset.revision;
  const before = structuredClone(f.state.asset);
  await assert.rejects(listing.list(f.request), pending);
  assert.equal(f.state.calls.length, 1);
  assert.equal(f.state.writes, 1);
  assert.deepEqual(f.state.asset, before);
});

test("legacy pending request remains reconciliation required with no read-based backfill", async (t) => {
  const f = fixture(t);
  f.state.asset.assetStatus = "LISTING_REQUESTED";
  Object.assign(f.state.asset.metadata, {
    listingCommand: "historical",
    listingRewardPrice: 6,
  });
  // Preserve original historical key rather than qualifying a changed command.
  f.state.asset.metadata.listingCommand = require("node:crypto")
    .createHash("sha256")
    .update("owner-a:original-command")
    .digest("hex");
  const before = structuredClone(f.state.asset);
  await assert.rejects(listing.list(f.request), {
    code: "ERR_EWASTE_LISTING_RECONCILIATION_REQUIRED",
  });
  assert.equal(f.state.writes, 0);
  assert.equal(f.state.calls.length, 0);
  assert.deepEqual(f.state.asset, before);
});

test("replacement command, amount, policy or digest cannot adopt saved intent", async (t) => {
  for (const change of [
    (f) => (f.request.idempotencyKey = "replacement"),
    (f) => (f.request.payload.rewardPrice = 14),
    (f) => (f.settings.marketplace.storeCode = "foreign"),
    (f) => (f.settings.marketplace.currency = "OTHER"),
    (f) => (f.state.asset.metadata.listingIntentDigest = "a".repeat(64)),
  ]) {
    const f = fixture(t);
    await assert.rejects(listing.list(f.request), pending);
    f.request.expectedRevision = f.state.asset.revision;
    change(f);
    const before = structuredClone(f.state.asset);
    await assert.rejects(listing.list(f.request));
    assert.equal(f.state.writes, 1);
    assert.equal(f.state.calls.length, 1);
    assert.deepEqual(f.state.asset, before);
  }
});

test("historical pending metadata cannot be reconciled by a fresh key or caller-supplied intent", async (t) => {
  for (const replacementKey of [false, true]) {
    const f = fixture(t);
    await assert.rejects(listing.list(f.request), pending);
    const suppliedIntent = structuredClone(f.state.asset.metadata.listingIntent);
    delete f.state.asset.metadata.listingIntent;
    f.state.asset.metadata.listingProduct = { productCode: "retained-product" };
    f.request.expectedRevision = f.state.asset.revision;
    f.request.payload.listingIntent = suppliedIntent;
    if (replacementKey) f.request.idempotencyKey = "new-command";
    const before = structuredClone(f.state.asset);
    f.state.calls.length = 0;
    f.state.writes = 0;
    await assert.rejects(listing.list(f.request), {
      code: replacementKey
        ? "ERR_EWASTE_COMMAND_CONFLICT"
        : "ERR_EWASTE_LISTING_RECONCILIATION_REQUIRED",
    });
    assert.equal(f.state.writes, 0);
    assert.equal(f.state.calls.length, 0);
    assert.deepEqual(f.state.asset, before);
  }
});

test("a retained reconciliation hold prevents relisting even with a fresh command or otherwise eligible status", async t => {
  for (const status of ["LISTING_REQUESTED", "OWNED"]) {
    const f = fixture(t);
    f.state.asset.assetStatus = status;
    f.state.asset.metadata.listingReconciliation = { state: "RECONCILING" };
    f.request.idempotencyKey = "new-customer-command";
    const before = structuredClone(f.state.asset);
    await assert.rejects(listing.list(f.request), { code: "ERR_EWASTE_LISTING_RECONCILIATION_REQUIRED" });
    assert.deepEqual(f.state.asset, before);
    assert.equal(f.state.writes, 0);
    assert.equal(f.state.calls.length, 0);
  }
});

test("deferred Store read retires changed authority, input, policy or fresh asset without mutation", async (t) => {
  for (const change of [
    (f) => (f.request.authData.entCode = "foreign"),
    (f) => (f.request.tenant = "foreign"),
    (f) => (f.request.payload.rewardPrice = 14),
    (f) => (f.settings.marketplace.currency = "OTHER"),
    (f) => (f.settings.targetAuthorities.commerceStaged.runtimeRole = "OTHER"),
    (f) => f.state.asset.revision++,
    (f) => (f.state.asset.ownerRef.code = "foreign"),
    (f) => (f.state.asset.assetStatus = "LOCKED"),
  ]) {
    const f = fixture(t);
    f.state.hook = () => change(f);
    await assert.rejects(listing.list(f.request));
    assert.equal(f.state.writes, 0);
    assert.equal(f.state.calls.length, 1);
  }
});

test("failed, mismatched or malformed Store context never saves intent", async (t) => {
  for (const response of [
    null,
    {},
    { success: false },
    { contractVersion: 1, tenant: "foreign" },
    { contractVersion: 1, tenant: "tenant-a", store: {}, authoring: {} },
  ]) {
    const f = fixture(t);
    f.state.response = response;
    await assert.rejects(listing.list(f.request));
    assert.equal(f.state.writes, 0);
    assert.equal(f.state.calls.length, 1);
  }
});

test("all required policy selectors are explicit and missing policy fails before persistence", async (t) => {
  for (const key of [
    "priceBookCode",
    "currency",
    "transferPolicyCode",
    "rewardSettlementPolicyCode",
    "carbonSettlementPolicyCode",
  ]) {
    const f = fixture(t);
    delete f.settings.marketplace[key];
    await assert.rejects(listing.list(f.request));
    assert.equal(f.state.writes, 0);
  }
});

test("scope, ownership, confirmation, price, revision and inert selection reject unsafe capture", async (t) => {
  for (const change of [
    (f) => (f.request.authData.principalType = "service"),
    (f) => (f.request.authData.tenant = "foreign"),
    (f) => (f.request.authData.enterpriseCode = "foreign"),
    (f) => (f.state.asset.ownerRef.code = "foreign"),
    (f) => (f.request.confirmed = false),
    (f) => (f.request.payload.rewardPrice = 0),
    (f) => (f.request.expectedRevision = 3),
    (f) => (f.settings.marketplace.autoPublishListings = false),
    (f) => (f.settings.marketplace.listingHandoff.enabled = false),
  ]) {
    const f = fixture(t);
    change(f);
    await assert.rejects(listing.list(f.request));
    assert.equal(f.state.writes, 0);
    assert.equal(f.state.calls.length, 0);
  }
});

test("later-layer presentation can customize fixed command without using earlier Product identity", async (t) => {
  const f = fixture(t);
  f.state.asset.assetStatus = "SOLD";
  f.state.asset.metadata.listingProduct = { productCode: "old-product" };
  const customized = {
    ...listing,
    intent(...args) {
      const i = listing.intent(...args);
      i.productCommand.issuer = "Programme";
      return i;
    },
  };
  await assert.rejects(customized.list(f.request), pending);
  assert.equal(f.state.asset.metadata.listingProduct, undefined);
  assert.equal(
    f.state.asset.metadata.listingIntent.productCommand.issuer,
    "Programme",
  );
  assert.equal(f.state.writes, 1);
});
