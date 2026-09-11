/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module bidding/test/biddingContract @description Exercises real negotiation, quote and pricing services across participant isolation, duplicate commands, concurrent writes, acceptance recovery and private checkout bindings. @layer test @owner bidding */
const test = require("node:test"),
  assert = require("node:assert/strict");
const negotiations = require("../src/service/defaultBiddingService");
const quote = require("../../baseCommerce/modules/pricing/src/service/defaultNegotiatedPriceService");
const exact = require("../../baseCommerce/modules/pricing/src/service/defaultExactAmountService");
const pricing = require("../../baseCommerce/modules/pricing/src/service/defaultPricingDecisionService");
const ports = require("../../checkout/modules/checkoutCore/src/service/defaultCheckoutPlacementPortsService");
let bids, quotes, checkpoints, writes, failAcceptance, policy;
const identities = require("../src/service/defaultBiddingIdentityService"),
  offers = require("../src/service/defaultBiddingOfferService");
function matches(record, query) {
  return Object.entries(query).every(([key, value]) => {
    if (key === "$or") return value.some((q) => matches(record, q));
    const actual = key.split(".").reduce((v, k) => v?.[k], record);
    if (value && typeof value === "object") {
      if ("$in" in value) return value.$in.includes(actual);
      if ("$exists" in value) return (actual !== undefined) === value.$exists;
    }
    return actual === value;
  });
}
function repository(rows) {
  return {
    get: async (request) => ({
      result: [...rows.values()].filter((row) => matches(row, request.query)),
    }),
    save: async (request) => {
      if (rows.has(request.model.code)) throw Error("duplicate");
      const model = {
        ...structuredClone(request.model),
        tenant: request.tenant,
      };
      rows.set(model.code, model);
      writes.push(["create", model.code]);
      return { result: model };
    },
    update: async (request) => {
      const current = rows.get(request.query.code);
      if (!current || !matches(current, request.query))
        throw Error("revision conflict");
      if (failAcceptance && request.model.status === "ACCEPTED") {
        failAcceptance = false;
        throw Error("interrupted acceptance");
      }
      const model = {
        ...current,
        ...structuredClone(request.model),
        revision: current.revision + 1,
      };
      rows.set(model.code, model);
      writes.push(["update", model.code]);
      return { result: model };
    },
  };
}
function request(owner, payload = {}, extra = {}) {
  return {
    tenant: "runtime",
    authData: {
      principalType: "customer",
      loginId: owner + "@test.local",
      code: owner,
      entCode: "enterprise",
    },
    payload: { confirmed: true, ...payload },
    idempotencyKey: "command-" + owner,
    ...extra,
  };
}
function terms(amount = "4") {
  return {
    productCode: "DEVICE",
    variantCode: "DEVICE_UNIT",
    storeCode: "store",
    amount,
  };
}
async function accepted() {
  const bid = await negotiations.create(request("buyer", terms()));
  return negotiations.decide(
    request(
      "seller",
      { action: "ACCEPT", expectedRevision: bid.revision },
      { code: bid.code },
    ),
  );
}
function quotedRequest(bid, patch = {}) {
  return {
    tenant: "runtime",
    enterpriseCode: "enterprise",
    ownerId: "buyer",
    priceQuoteCode: bid.priceQuoteCode,
    variantCode: "DEVICE_UNIT",
    productCode: "DEVICE",
    storeCode: "store",
    currency: "POINTS",
    quantity: "1",
    cartCode: bid.cartCode,
    correlationId: "quote-test",
    ...patch,
  };
}
test.beforeEach(() => {
  bids = new Map();
  quotes = new Map();
  checkpoints = new Map();
  writes = [];
  failAcceptance = false;
  policy = {
    enabled: true,
    policyVersion: "test-v1",
    holdTiming: "CHECKOUT_AFTER_ACCEPTANCE",
    validitySeconds: 86400,
    amountScale: 0,
    maximumAmount: "100",
    stores: {
      store: {
        enterpriseCode: "enterprise",
        currency: "POINTS",
        orderCodePrefix: "ORDER_",
      },
    },
  };
  global.CONFIG = {
    get: (key) =>
      key === "bidding"
        ? policy
        : key === "runtimeRole"
          ? { code: "COMMERCE" }
          : undefined,
  };
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code, message) {
        super(message);
        this.code = code;
      }
    },
  };
  global.SERVICE = {
    DefaultModuleService: {
      invokeModule: async (r) => ({
        data: [
          {
            code: r.requestBody.query.loginId.split("@")[0],
            loginId: r.requestBody.query.loginId,
          },
        ],
      }),
    },
    DefaultBiddingService: negotiations,
    DefaultBiddingIdentityService: identities,
    DefaultBiddingOfferService: offers,
    DefaultCheckoutBidService: repository(bids),
    DefaultPriceQuoteService: repository(quotes),
    DefaultCheckoutCheckpointService: repository(checkpoints),
    DefaultNegotiatedPriceService: quote,
    DefaultPricingDecisionService: pricing,
    DefaultExactAmountService: exact,
    DefaultProductDiscoveryService: {
      detail: async () => ({
        product: {
          productCode: "DEVICE",
          variantCodes: ["DEVICE_UNIT"],
          price: { currency: "POINTS", unitAmount: "10" },
          localizedAttributes: {
            kind: "PHYSICAL_PRODUCT",
            commerceBidding: {
              enabled: true,
              sellerRef: {
                module: "profile",
                schema: "customer",
                code: "seller",
              },
            },
            ownerRef: { module: "profile", schema: "customer", code: "seller" },
            sourceRef: {
              module: "product",
              schema: "product",
              code: "asset",
            },
          },
        },
      }),
    },
  };
});
test("a seller accepts an exact private price without modifying public price or reserving funds", async () => {
  const bid = await accepted();
  assert.equal(bid.status, "ACCEPTED");
  assert.equal(quotes.size, 1);
  assert.equal(bids.size, 1);
  const decision = await quote.decide(quotedRequest(bid));
  assert.equal(decision.unitAmount, "4");
  assert.equal(decision.totalAmount, "4");
  assert.equal(decision.quoteOrderCode, bid.orderCode);
  assert.deepEqual(
    writes.map((w) => w[0]),
    ["create", "update", "create", "update"],
  );
  assert.equal(
    (await SERVICE.DefaultProductDiscoveryService.detail({})).product.price
      .unitAmount,
    "10",
  );
});
test("another customer cannot view, accept, withdraw or redeem the private quote", async () => {
  const bid = await accepted();
  await assert.rejects(
    negotiations.read(request("outsider", {}, { code: bid.code })),
    /not found/,
  );
  await assert.rejects(
    negotiations.decide(
      request(
        "buyer",
        { action: "REJECT", expectedRevision: bid.revision },
        { code: bid.code },
      ),
    ),
    /other participant/,
  );
  await assert.rejects(
    quote.decide(quotedRequest(bid, { ownerId: "outsider" })),
    /different customer/,
  );
  assert.equal((await negotiations.list(request("outsider"))).bids.length, 0);
});
test("quote bindings reject another cart, product, currency, quantity, enterprise and order before reservation", async () => {
  const bid = await accepted();
  for (const patch of [
    { cartCode: "other" },
    { productCode: "other" },
    { currency: "USD" },
    { quantity: "2" },
    { enterpriseCode: "other" },
  ])
    await assert.rejects(quote.decide(quotedRequest(bid, patch)));
  const q = quotedRequest(bid),
    cart = {
      code: bid.cartCode,
      storeCode: "store",
      currency: "POINTS",
      entries: [
        {
          productCode: "DEVICE",
          variantCode: "DEVICE_UNIT",
          quantity: "1",
          priceQuoteCode: bid.priceQuoteCode,
        },
      ],
    };
  await quote.validateCheckout(
    { ...q, payload: { orderCode: bid.orderCode } },
    cart,
  );
  await assert.rejects(
    quote.validateCheckout(
      { ...q, payload: { orderCode: "another-order" } },
      cart,
    ),
    /checkout reference/,
  );
  let validationCalled = false;
  SERVICE.DefaultCartOperationService = {
    cartSnapshot: async () => cart,
    validateDirect: async () => {
      validationCalled = true;
      return { status: "VALID" };
    },
  };
  await assert.rejects(
    ports.create().validateCart({
      ...q,
      payload: { cartCode: cart.code, orderCode: "another-order" },
    }),
  );
  assert.equal(validationCalled, false);
});
test("parallel replay creates one bid and conflicting terms cannot replace its amount", async () => {
  const [first, second] = await Promise.all([
    negotiations.create(request("buyer", terms())),
    negotiations.create(request("buyer", terms())),
  ]);
  assert.equal(first.code, second.code);
  assert.equal(bids.size, 1);
  await assert.rejects(
    negotiations.create(request("buyer", terms("5"))),
    /different terms/,
  );
  assert.equal([...bids.values()][0].amount, "4");
});
test("interrupted seller acceptance resumes the same quote without accepting altered terms", async () => {
  const bid = await negotiations.create(request("buyer", terms()));
  failAcceptance = true;
  const command = request(
    "seller",
    { action: "ACCEPT", expectedRevision: bid.revision },
    { code: bid.code },
  );
  await assert.rejects(negotiations.decide(command), /interrupted/);
  assert.equal(bids.get(bid.code).status, "ACCEPTING");
  assert.equal(quotes.size, 1);
  const result = await negotiations.decide(command);
  assert.equal(result.status, "ACCEPTED");
  assert.equal(quotes.size, 1);
  assert.equal((await negotiations.decide(command)).revision, result.revision);
});
test("withdrawal is allowed only before acceptance; expiry and stale decisions cannot create a quote", async () => {
  let bid = await negotiations.create(request("buyer", terms()));
  await assert.rejects(
    negotiations.decide(
      request(
        "seller",
        { action: "ACCEPT", expectedRevision: 99 },
        { code: bid.code },
      ),
    ),
    /changed/,
  );
  bid = await negotiations.decide(
    request(
      "buyer",
      { action: "WITHDRAW", expectedRevision: bid.revision },
      { code: bid.code, idempotencyKey: "withdraw-buyer" },
    ),
  );
  assert.equal(bid.status, "WITHDRAWN");
  assert.equal(quotes.size, 0);
  bids.clear();
  const acceptedBid = await accepted();
  await assert.rejects(
    negotiations.decide(
      request(
        "buyer",
        { action: "WITHDRAW", expectedRevision: acceptedBid.revision },
        { code: acceptedBid.code, idempotencyKey: "withdraw-later" },
      ),
    ),
    /changed/,
  );
});
test("expired private prices and customer-issued quote attempts fail closed", async () => {
  const bid = await accepted();
  quotes.get(bid.priceQuoteCode).expiresAt = new Date(Date.now() - 1);
  await assert.rejects(quote.decide(quotedRequest(bid)), /expired/);
  await assert.rejects(
    quote.issue(
      { ...quotedRequest(bid), authData: { principalType: "customer" } },
      {},
    ),
    /trusted Commerce/,
  );
});
test("completed checkout is visible to both participants without enabling a second checkout identity", async () => {
  const bid = await accepted();
  checkpoints.set(bid.orderCode, {
    code: bid.orderCode,
    ownerId: "buyer",
    enterpriseCode: "enterprise",
    status: "COMPLETED",
  });
  assert.equal(
    (await negotiations.read(request("seller", {}, { code: bid.code })))
      .purchaseStatus,
    "COMPLETED",
  );
  assert.equal(
    (await negotiations.read(request("buyer", {}, { code: bid.code })))
      .purchaseStatus,
    "COMPLETED",
  );
});
test("unsupported hold policy, zero/fractional amounts and self-bids cannot persist a negotiation", async () => {
  for (const amount of ["0", "-1", "1.5", "101", "Infinity"])
    await assert.rejects(negotiations.create(request("buyer", terms(amount))));
  await assert.rejects(
    negotiations.create(request("seller", terms())),
    /own product/,
  );
  policy.holdTiming = "AT_BID";
  await assert.rejects(
    negotiations.create(request("buyer", terms())),
    /installed provider/,
  );
  assert.equal(bids.size, 0);
  assert.equal(quotes.size, 0);
});

test("login-only access tokens retain canonical Profile seller references and existing checkout ownership", async () => {
  const buyer = request("buyer", terms(), {
    authData: {
      principalType: "customer",
      loginId: "buyer@test.local",
      entCode: "enterprise",
    },
  });
  const bid = await negotiations.create(buyer);
  assert.equal(bid.buyerId, "buyer@test.local");
  assert.equal(bid.buyerCustomerCode, "buyer");
  const seller = request(
    "seller",
    { action: "ACCEPT", expectedRevision: bid.revision },
    {
      code: bid.code,
      authData: {
        principalType: "customer",
        loginId: "seller@test.local",
        entCode: "enterprise",
      },
    },
  );
  assert.equal((await negotiations.list(seller)).bids.length, 1);
  const acceptedBid = await negotiations.decide(seller);
  assert.equal(
    (
      await quote.decide(
        quotedRequest(acceptedBid, { ownerId: "buyer@test.local" }),
      )
    ).unitAmount,
    "4",
  );
  await assert.rejects(
    quote.decide(quotedRequest(acceptedBid, { ownerId: "buyer" })),
    /different customer/,
  );
});

test("ordinary physical and service products negotiate without any asset or provenance contract", async () => {
  for (const kind of ["PHYSICAL_PRODUCT", "SERVICE", "DIGITAL_LICENSE"]) {
    SERVICE.DefaultProductDiscoveryService.detail = async () => ({
      product: {
        productCode: "DEVICE",
        variantCodes: ["DEVICE_UNIT"],
        price: { currency: "POINTS", unitAmount: "10" },
        localizedAttributes: {
          kind,
          commerceBidding: {
            enabled: true,
            sellerRef: {
              module: "profile",
              schema: "customer",
              code: "seller",
            },
          },
        },
      },
    });
    const bid = await negotiations.create(
      request("buyer", terms(), { idempotencyKey: "generic-" + kind }),
    );
    assert.equal(bid.sourceRef, undefined);
    assert.deepEqual(bid.sellerRef, {
      module: "profile",
      schema: "customer",
      code: "seller",
    });
    assert.equal(
      (
        await negotiations.decide(
          request(
            "seller",
            { action: "ACCEPT", expectedRevision: 0 },
            { code: bid.code, idempotencyKey: "accept-" + kind },
          ),
        )
      ).status,
      "ACCEPTED",
    );
  }
});
test("explicit Product ineligibility cannot be overridden by legacy owner references or caller-provided terms", async () => {
  policy.stores.store.allowOwnerReference = true;
  SERVICE.DefaultProductDiscoveryService.detail = async () => ({
    product: {
      productCode: "DEVICE",
      variantCodes: ["DEVICE_UNIT"],
      price: { currency: "POINTS" },
      localizedAttributes: {
        ownerRef: { module: "profile", schema: "customer", code: "seller" },
        commerceBidding: {
          enabled: false,
          sellerRef: { module: "profile", schema: "customer", code: "seller" },
        },
      },
    },
  });
  await assert.rejects(
    negotiations.create(
      request("buyer", {
        ...terms(),
        sellerRef: { module: "profile", schema: "customer", code: "buyer" },
        commerceBidding: { enabled: true },
      }),
    ),
    /not eligible/,
  );
  assert.equal(bids.size, 0);
});
test("enterprise sellers use Profile scopes and cannot be impersonated by a customer with the same code", async () => {
  SERVICE.DefaultProductDiscoveryService.detail = async () => ({
    product: {
      productCode: "DEVICE",
      variantCodes: ["DEVICE_UNIT"],
      price: { currency: "POINTS" },
      localizedAttributes: {
        commerceBidding: {
          enabled: true,
          sellerRef: {
            module: "profile",
            schema: "enterprise",
            code: "enterprise",
          },
        },
      },
    },
  });
  const bid = await negotiations.create(request("buyer", terms()));
  await assert.rejects(
    negotiations.read(request("enterprise", {}, { code: bid.code })),
    /not found/,
  );
  const original = SERVICE.DefaultModuleService.invokeModule;
  let scope = {
      scopeType: "ENTERPRISE",
      scopeCode: "enterprise",
      permissionCode: "commerce.bid.manage",
    },
    deny = [];
  SERVICE.DefaultSecuredRequestPipelineService = {
    getGrantedPermissions: () => ["commerce.bid.manage"],
    isPermissionGranted: (permission, grants) => grants.includes(permission),
  };
  SERVICE.DefaultModuleService.invokeModule = async (r) =>
    r.apiName === "/identity/scopes/me"
      ? {
          data: {
            principalCode: "operator@test.local",
            scopes: [scope],
            deniedScopes: deny,
          },
        }
      : original(r);
  const employee = request(
    "operator",
    { action: "ACCEPT", expectedRevision: 0 },
    {
      code: bid.code,
      authorization: "Bearer scoped-test",
      authData: {
        principalType: "human",
        loginId: "operator@test.local",
        code: "operator",
        entCode: "enterprise",
      },
    },
  );
  assert.equal((await negotiations.list(employee)).bids.length, 1);
  deny = [scope];
  assert.equal((await negotiations.list(employee)).bids.length, 0);
  await assert.rejects(negotiations.decide(employee), /not found/);
  deny = [];
  scope = { ...scope, scopeCode: "another-enterprise" };
  assert.equal((await negotiations.list(employee)).bids.length, 0);
  scope = { ...scope, scopeCode: "enterprise" };
  assert.equal((await negotiations.decide(employee)).status, "ACCEPTED");
  await assert.rejects(
    negotiations.create({
      ...employee,
      payload: { ...terms(), confirmed: true },
    }),
    /Commerce customer/,
  );
});
test("a configured identity extension authorizes another seller schema without changing bid lifecycle code", async () => {
  policy.identityService = "PartnerSellerIdentityService";
  SERVICE.PartnerSellerIdentityService = {
    resolve: async (r) => ({
      ...r,
      ownerId: r.authData.code,
      customerCode: r.authData.code,
      enterpriseCode: "enterprise",
      sellerRefs: [
        { module: "merchant", schema: "account", code: r.authData.code },
      ],
    }),
    sellerRefs: async () => [],
  };
  SERVICE.DefaultProductDiscoveryService.detail = async () => ({
    product: {
      productCode: "DEVICE",
      variantCodes: ["DEVICE_UNIT"],
      price: { currency: "POINTS" },
      localizedAttributes: {
        commerceBidding: {
          enabled: true,
          sellerRef: { module: "merchant", schema: "account", code: "seller" },
        },
      },
    },
  });
  const bid = await negotiations.create(request("buyer", terms()));
  assert.equal(
    (
      await negotiations.decide(
        request(
          "seller",
          { action: "ACCEPT", expectedRevision: 0 },
          { code: bid.code },
        ),
      )
    ).status,
    "ACCEPTED",
  );
});
test("existing checkoutBid records retain participant access and completed checkout evidence after the owner move", async () => {
  const bid = await accepted();
  const record = bids.get(bid.code);
  delete record.sellerRef;
  delete record.contractVersion;
  assert.equal(
    (await negotiations.read(request("seller", {}, { code: bid.code }))).code,
    bid.code,
  );
  assert.equal(
    (await negotiations.create(request("buyer", terms()))).code,
    bid.code,
  );
  const schema = require("../src/schemas/schemas");
  assert(schema.bidding.checkoutBid);
  assert.equal(
    require("../../checkout/modules/checkoutCore/src/schemas/schemas")
      .checkoutCore.checkoutBid,
    undefined,
  );
});

test("accepted quotes cannot be applied to another variant of the same product", async () => {
  const bid = await accepted();
  assert.equal(quotes.get(bid.priceQuoteCode).variantCode, "DEVICE_UNIT");
  await assert.rejects(
    quote.decide(quotedRequest(bid, { variantCode: "EXPENSIVE_VARIANT" })),
    /different product variant/,
  );
  await assert.rejects(
    quote.validateCheckout(
      { ...quotedRequest(bid), payload: { orderCode: bid.orderCode } },
      {
        code: bid.cartCode,
        storeCode: "store",
        currency: "POINTS",
        entries: [
          {
            priceQuoteCode: bid.priceQuoteCode,
            productCode: "DEVICE",
            variantCode: "EXPENSIVE_VARIANT",
            quantity: "1",
          },
        ],
      },
    ),
    /different product variant/,
  );
});

test("buyers can withdraw open bids after the product becomes unavailable", async () => {
  const bid = await negotiations.create(request("buyer", terms()));
  SERVICE.DefaultProductDiscoveryService.detail = async () => {
    throw Error("offer removed");
  };
  assert.equal(
    (
      await negotiations.decide(
        request(
          "buyer",
          { action: "WITHDRAW", expectedRevision: 0 },
          { code: bid.code, idempotencyKey: "withdraw-after-removal" },
        ),
      )
    ).status,
    "WITHDRAWN",
  );
  assert.equal(quotes.size, 0);
});
test("interrupted legacy acceptance resumes without replacing an existing quote with new module evidence", async () => {
  const bid = await negotiations.create(request("buyer", terms()));
  const stored = bids.get(bid.code);
  delete stored.contractVersion;
  delete stored.sellerRef;
  failAcceptance = true;
  const decision = request(
    "seller",
    { action: "ACCEPT", expectedRevision: 0 },
    { code: bid.code },
  );
  await assert.rejects(negotiations.decide(decision), /interrupted acceptance/);
  const before = structuredClone([...quotes.values()][0]);
  assert.equal(before.sourceRef.module, "checkoutCore");
  assert.equal(before.variantCode, undefined);
  const final = await negotiations.decide(decision);
  assert.equal(final.status, "ACCEPTED");
  assert.equal(quotes.size, 1);
  assert.deepEqual(quotes.get(final.priceQuoteCode), before);
});

test("Staged and unspecified runtimes cannot execute bids even when project bidding is enabled", async () => {
  for (const runtime of [{ code: "COMMERCE_STAGED" }, undefined]) {
    CONFIG.get = (key) =>
      key === "bidding" ? policy : key === "runtimeRole" ? runtime : undefined;
    await assert.rejects(
      negotiations.create(request("buyer", terms())),
      /operational Commerce runtime/,
    );
    await assert.rejects(
      negotiations.list(request("buyer")),
      /operational Commerce runtime/,
    );
  }
  assert.equal(bids.size, 0);
  assert.equal(quotes.size, 0);
});
