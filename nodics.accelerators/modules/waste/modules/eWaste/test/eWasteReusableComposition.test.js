/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module eWaste/test/eWasteReusableComposition @description Independent marketplace, advisory guidance and weight valuation extension contracts. @owner eWaste @layer test */
const test = require("node:test");
const assert = require("node:assert/strict");
const marketplace = require("../src/service/defaultEWasteMarketplaceService");
const conversation = require("../src/service/defaultEWasteConversationService");
const valuation = require("../src/service/defaultEWasteWeightRewardValuationService");

test.afterEach(() => {
  delete global.SERVICE;
  delete global.CONFIG;
  delete global.CLASSES;
});

test("published discovery uses configured store and trusted limits with original context", async () => {
  const request = {
    tenant: "tenant",
    authorization: "Bearer customer",
    query: { storeCode: "injected" },
  };
  const calls = [];
  const service = {
    ...marketplace,
    experience: () => ({
      settings: () => ({ marketplace: { storeCode: "configured" } }),
      remote: async (context, module, connection, path, method) => {
        assert.equal(context, request);
        assert.equal(module, "product");
        assert.equal(connection, "commerce");
        assert.equal(method, "GET");
        const query = new URL(path, "https://owner").searchParams;
        calls.push(query);
        return {
          products: query.get("page") === "1" ? [{ productCode: "A" }] : [],
        };
      },
    }),
  };
  assert.deepEqual(
    await service.published(request, {
      discoveryBatchSize: 1,
      maximumProducts: 2,
    }),
    [{ productCode: "A" }],
  );
  assert.equal(calls.length, 2);
  assert(
    calls.every(
      (query) =>
        query.get("storeCode") === "configured" &&
        query.get("pageSize") === "1",
    ),
  );
  await assert.rejects(
    service.published(
      { isCancelled: () => true },
      { discoveryBatchSize: 1, maximumProducts: 2 },
    ),
    { statusCode: 499 },
  );
  assert.equal(calls.length, 2);
  await assert.rejects(
    service.published(
      request,
      { discoveryBatchSize: 1, maximumProducts: 2 },
      async () => ({ products: [{ productCode: "A" }] }),
    ),
    /changed while loading/,
  );
  await assert.rejects(
    service.published(
      request,
      { discoveryBatchSize: 1, maximumProducts: 2 },
      async () => ({}),
    ),
    { statusCode: 503 },
  );
});

test("shared offer composition excludes private evidence and rejects stale asset bindings", async () => {
  const request = { tenant: "tenant" };
  const asset = {
    code: "ASSET",
    revision: 7,
    assetStatus: "LISTED",
    ownerRef: { code: "seller" },
    metadata: { marketProductCode: "PRODUCT", secret: "private" },
  };
  const product = {
    productCode: "PRODUCT",
    name: "Published",
    version: "v2",
    price: { currency: "POINTS", unitAmount: 3 },
    localizedAttributes: {
      kind: "ASSET",
      assetCode: "ASSET",
      internalNotes: "private",
      ownerRef: { module: "profile", schema: "customer", code: "seller" },
      sourceRef: { module: "wasteCore", schema: "wasteAsset", code: "ASSET" },
    },
    media: {
      primary: { url: "javascript:alert(1)" },
      gallery: [{ url: "/published.png" }],
    },
  };
  global.SERVICE = {
    DefaultWasteItemDescriptorService: {
      catalogue: async () => ({}),
      describe: () => ({
        identity: { name: "Item" },
        photo: { url: "/private.png" },
      }),
    },
  };
  const service = {
    ...marketplace,
    experience: () => ({
      settings: () => ({ marketplace: { currency: "POINTS" } }),
      store: () => ({
        one: async (schema, context, code) => {
          assert.equal(schema, "wasteAsset");
          assert.equal(context, request);
          assert.equal(code, "ASSET");
          return asset;
        },
      }),
    }),
  };
  const result = await service.offer(request, product, {});
  assert.equal(result.revision, 7);
  assert.equal(result.ownerCode, "seller");
  assert.equal(result.biddingAvailable, true);
  assert.equal(result.descriptor.photo, null);
  assert.equal(result.imageUrl, "/published.png");
  assert(!JSON.stringify(result).includes("private"));
  const custom = await service.catalogueOffers(
    request,
    [product],
    async (...args) => ({ ...(await service.offer(...args)), label: "Custom" }),
  );
  assert.equal(custom.assets[0].label, "Custom");
  asset.metadata.marketProductCode = "OTHER";
  assert.equal(await service.offer(request, product, {}), null);
  asset.metadata.marketProductCode = "PRODUCT";
  asset.assetStatus = "OWNED";
  assert.equal(await service.offer(request, product, {}), null);
});

test("default marketplace list retains its existing asset and coupon DTO shapes", async () => {
  const coupon = {
    productCode: "COUPON",
    name: "Coupon",
    summary: "Summary",
    description: "Long description",
    version: "v3",
    localizedAttributes: {
      kind: "COUPON",
      issuer: "Issuer",
      imageUrl: "/coupon.png",
      terms: ["Terms"],
    },
    price: { currency: "POINTS", unitAmount: 8 },
    variantCodes: ["variant"],
  };
  const asset = {
    ...coupon,
    productCode: "PRODUCT",
    localizedAttributes: { kind: "ASSET", assetCode: "ASSET" },
  };
  const descriptor = { identity: { name: "Verified" }, photo: null };
  global.SERVICE = {
    DefaultWasteItemDescriptorService: {
      catalogue: async () => ({}),
      describe: () => descriptor,
    },
  };
  const service = {
    ...marketplace,
    experience: () => ({
      settings: () => ({
        marketplace: { storeCode: "store", currency: "POINTS" },
      }),
      remote: async () => ({ products: [coupon, asset] }),
      store: () => ({
        one: async () => ({
          code: "ASSET",
          revision: 4,
          assetStatus: "LISTED",
          ownerRef: { code: "seller" },
          metadata: { illustrativeCarbonUnits: 2 },
        }),
      }),
    }),
  };
  const result = await service.list({});
  const expected = {
    code: "COUPON",
    name: "Coupon",
    description: "Summary",
    kind: "COUPON",
    issuer: "Issuer",
    imageUrl: "/coupon.png",
    rewardPrice: 8,
    biddingAvailable: false,
    currency: "POINTS",
    revision: "v3",
    variantCode: "variant",
    expiresAt: undefined,
  };
  assert.deepEqual(result.coupons, [expected]);
  assert.deepEqual(result.assets, [
    {
      ...expected,
      code: "PRODUCT",
      kind: "ASSET",
      issuer: undefined,
      imageUrl: undefined,
      revision: 4,
      assetCode: "ASSET",
      descriptor,
      ownerCode: "seller",
      carbonUnits: 2,
    },
  ]);
});

test("weight valuation supports later policy and original evidence without mutating assessments", () => {
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code, message) {
        super(message);
        this.code = code;
      }
    },
  };
  const policy = {
    version: "v1",
    pointsPerKg: 4,
    carbonUnitsPerEstimatedKg: 2,
    programCode: "PROGRAM",
    pointsRewardTypeCode: "POINTS",
    carbonRewardTypeCode: "CARBON",
  };
  const request = {
    asset: { metadata: { facts: { weight: 90 } } },
    impact: {
      calculationStatus: "ESTIMATED",
      metadata: {
        impactProvider: { input: { weightKg: 2, weightSource: "APPROVAL" } },
      },
      metrics: [
        {
          metricCode: "ESTIMATED_CO2E_SAVED_KG",
          unitOfMeasure: "KG_CO2E",
          value: "1.2345",
        },
      ],
    },
  };
  const before = JSON.stringify(request);
  const first = valuation.assess(request, policy);
  assert.deepEqual(
    first.rewards.map((entry) => entry.amount),
    ["8.00", "2.469"],
  );
  assert.equal(first.weightSource, "APPROVAL");
  assert.equal(first.illustrative, true);
  assert.equal(
    valuation.assess(request, { ...policy, pointsPerKg: 7 }).rewards[0].amount,
    "14.00",
  );
  assert.equal(JSON.stringify(request), before);
  request.impact.calculationStatus = "FAILED";
  assert.equal(valuation.assess(request, policy).rewards[1].amount, "0.000");
  delete request.impact.metadata;
  request.asset.metadata.facts = {
    quantity: 2,
    weightEstimate: { min: 1, max: 3 },
  };
  assert.equal(valuation.assess(request, policy).weightKg, 4);
  assert.equal(valuation.assess({}, policy).weightSource, "UNAVAILABLE");
  assert.throws(() => valuation.assess({}, { ...policy, pointsPerKg: -1 }), {
    code: "ERR_EWASTE_VALUATION_UNAVAILABLE",
  });
  request.asset.metadata.facts = { weight: -1 };
  assert.throws(() => valuation.assess(request, policy), {
    code: "ERR_WASTE_INPUT_INVALID",
  });
});

test("guidance preserves draft state and trusted context; revisions, ownership and provider failures propagate", async () => {
  const draft = {
    revision: 3,
    submissionStatus: "MEDIA_STAGED",
    submittedFacts: { name: "Item" },
    metadata: {
      confirmationRevision: 3,
      estimate: { value: 2 },
      conversationRef: { code: "saved" },
    },
  };
  const request = {
    code: "DRAFT",
    expectedRevision: 3,
    tenant: "tenant",
    authData: { customer: "owner" },
    idempotencyKey: "command",
    payload: {
      message: "Help",
      conversationCode: "injected",
      fixedMessage: "injected",
    },
  };
  let calls = 0,
    writes = 0;
  global.CONFIG = { get: () => ({ conversation: { project: "configured" } }) };
  global.SERVICE = {
    DefaultEWasteExperienceService: {
      readDraft: async (context) => {
        assert.equal(context, request);
        return draft;
      },
    },
    DefaultWastePersistenceService: {
      revision: (record, expected) => {
        if (record.revision !== expected) throw Error("revision");
      },
      fail: (code) => {
        throw Error(code);
      },
      update: async (schema, context, current, patch) => {
        writes++;
        assert.equal(schema, "wasteSubmission");
        assert.equal(context, request);
        return { ...current, ...patch, revision: 4 };
      },
    },
    DefaultCopilotCustomerGuidanceService: {
      reply: async (context, settings) => {
        calls++;
        assert.equal(context.tenant, request.tenant);
        assert.equal(context.authData, request.authData);
        assert.equal(context.idempotencyKey, request.idempotencyKey);
        assert.equal(context.conversationCode, "saved");
        assert.equal(settings.fixedMessage, "Trusted copy");
        return {
          conversationCode: "saved",
          message: settings.fixedMessage,
          history: [],
        };
      },
    },
  };
  const result = await conversation.guidance(request, {
    fixedMessage: () => "Trusted copy",
  });
  assert.deepEqual(result.draft.submittedFacts, draft.submittedFacts);
  assert.deepEqual(result.draft.metadata.estimate, draft.metadata.estimate);
  assert.equal(result.draft.metadata.confirmationRevision, 3);
  assert.equal(result.changed, false);
  assert.deepEqual(result.actions, []);
  request.expectedRevision = 2;
  await assert.rejects(conversation.guidance(request), /revision/);
  assert.equal(calls, 1);
  request.expectedRevision = 3;
  request.payload.message = " ";
  await assert.rejects(
    conversation.guidance(request),
    /ERR_EWASTE_MESSAGE_INVALID/,
  );
  request.payload.message = "Help";
  global.SERVICE.DefaultEWasteExperienceService.readDraft = async () => {
    throw Error("owner");
  };
  await assert.rejects(conversation.guidance(request), /owner/);
  global.SERVICE.DefaultEWasteExperienceService.readDraft = async () => draft;
  global.SERVICE.DefaultCopilotCustomerGuidanceService.reply = async () => {
    throw Error("provider");
  };
  await assert.rejects(conversation.guidance(request), /provider/);
  assert.equal(writes, 1);
  request.payload.message = "It is a tablet";
  const customized = {
    ...conversation,
    message: async (context) => {
      assert.equal(context, request);
      return { canonical: true };
    },
  };
  assert.deepEqual(await customized.guidance(request), { canonical: true });
});

test("pre-draft guidance returns the Copilot contract without writing a Waste draft", async () => {
  global.CONFIG = { get: () => ({ conversation: {} }) };
  const reply = {
    conversationCode: "before",
    message: "Advice",
    changed: false,
    actions: [],
  };
  global.SERVICE = {
    DefaultWastePersistenceService: {
      update: () => {
        throw Error("unexpected write");
      },
    },
    DefaultCopilotCustomerGuidanceService: {
      reply: async (request) => {
        assert.equal(request.stage, "BEFORE_DRAFT");
        assert.equal(request.conversationCode, "before");
        return reply;
      },
    },
  };
  assert.equal(
    await conversation.guidance({
      payload: { message: "Help", conversationCode: "before" },
    }),
    reply,
  );
});
