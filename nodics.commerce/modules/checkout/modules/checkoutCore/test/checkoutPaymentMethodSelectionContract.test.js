/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");

/**
 * @module checkoutCore/test/checkoutPaymentMethodSelectionContract
 * @description Verifies Checkout placement delegates payment method validation to Payment-owned services.
 * @layer test
 * @owner checkoutCore
 */

const ports = require("../src/service/defaultCheckoutPlacementPortsService");

test.beforeEach(() => {
  global.SERVICE = {
      DefaultPaymentProviderSelectionService: { resolve: (...args) => require('../../../../payment/modules/paymentCore/src/service/defaultPaymentProviderSelectionService').resolve.call({ configuration: () => require('../../../../payment/modules/paymentCore/config/properties').paymentCore }, ...args) }, DefaultModuleService: { isLocalModuleActive: moduleName => ["checkoutCore"].includes(moduleName), },
    DefaultCardPaymentMethodService: {
      prepare: (request) => Object.assign({ methodCode: "CARD" }, request),
    },
    DefaultWalletPaymentMethodService: {
      prepare: (request) => Object.assign({ methodCode: "WALLET" }, request),
    },
    DefaultLoyaltyRewardPaymentMethodService: {
      prepare: (request) =>
        Object.assign({}, request, {
          methodCode: "LOYALTY_REWARD",
          providerCode: "loyalty-reward-points",
          providerToken: undefined,
          currency: request.rewardCurrency || "POINTS",
          amount: request.rewardAmount || request.amount,
        }),
    },
    DefaultCashOnDeliveryPaymentMethodService: {
      prepare: (request) =>
        Object.assign({}, request, {
          methodCode: "CASH_ON_DELIVERY",
          providerToken: undefined,
        }),
    },
    DefaultPaymentTransactionEntryService: {
      save: async (request) => ({ result: request.model }),
    },
  };
});

test("Checkout payment selection supports card, wallet, and cash-on-delivery methods without raw credentials", async () => {
  const calculation = { totalAmount: "141.00", currency: "USD" };
  const base = {
    tenant: "default",
    ownerId: "customer-1",
    idempotencyKey: "checkout-1",
    correlationId: "corr-1",
    authData: {},
    payload: {
      orderCode: "order-1",
      cartCode: "cart-1",
      providerToken: "tok_test_storefront_4242",
    },
  };

  assert.equal(
    ports.preparePaymentMethod(
      Object.assign({}, base, {
        payload: Object.assign({}, base.payload, { paymentMethod: "CARD" }),
      }),
      calculation,
    ).methodCode,
    "CARD",
  );
  assert.equal(
    ports.preparePaymentMethod(
      Object.assign({}, base, {
        payload: Object.assign({}, base.payload, { paymentMethod: "WALLET" }),
      }),
      calculation,
    ).methodCode,
    "WALLET",
  );
  const loyaltyReward = ports.preparePaymentMethod(
    Object.assign({}, base, {
      payload: Object.assign({}, base.payload, {
        paymentMethod: "LOYALTY_REWARD",
        walletCode: "wallet-1",
        rewardAmount: "25.00",
      }),
    }),
    calculation,
  );
  assert.equal(loyaltyReward.methodCode, "LOYALTY_REWARD");
  assert.equal(loyaltyReward.providerCode, "loyalty-reward-points");
  assert.equal(loyaltyReward.providerToken, undefined);
  assert.equal(loyaltyReward.walletCode, "wallet-1");
  assert.equal(loyaltyReward.amount, "25.00");
  assert.equal(loyaltyReward.currency, "POINTS");

  const cod = ports.preparePaymentMethod(
    Object.assign({}, base, {
      payload: Object.assign({}, base.payload, {
        paymentMethod: "CASH_ON_DELIVERY",
      }),
    }),
    calculation,
  );
  assert.equal(cod.methodCode, "CASH_ON_DELIVERY");
  assert.equal(cod.providerToken, undefined);

  const recorded = await ports.recordOfflineAuthorization(base, cod);
  assert.equal(recorded.status, "AUTHORIZED");
  assert.equal(recorded.evidence.providerRequired, false);
});

test("Checkout authorization routes Loyalty reward payment through the Loyalty reward provider", async t => {
  const calls = [];
  global.CONFIG = { get: () => ({ enabled: true }) };
  global.SERVICE.DefaultPaymentExecutionService = {
    execute: async (request, adapter, repository) => {
      calls.push({ request, adapter });
      const response = await adapter.execute(request);
      return repository.record({
        tenant: request.tenant,
        status: response.status,
        methodCode: request.methodCode,
        providerCode: adapter.code,
        providerReference: response.reference,
        amount: request.amount,
        currency: request.currency,
        idempotencyKey: request.idempotencyKey,
        correlationId: request.correlationId,
        evidence: { walletCode: request.walletCode },
      });
    },
  };
  global.SERVICE.DefaultLoyaltyRewardPaymentProviderService = {
    code: "loyalty-reward-points",
    execute: async (request) => ({
      status: "AUTHORIZED",
      reference: "reservation-1",
      walletCode: request.walletCode,
    }),
  };
  global.SERVICE.DefaultPaymentTransactionEntryService.get = async () => ({
    result: [],
  });

  const previous = { NODICS: global.NODICS, UTILS: global.UTILS };
  t.after(() => Object.assign(global, previous));
  const rows = [];
  global.UTILS = { createModelName: name => name };
  global.NODICS = { getModels: () => ({ checkoutCheckpoint: { primaryKey: "code",
    rawSchema: { definition: { revision: { type: "int" } } }, compareAndSetItem() {}, updateItems() {} } }) };
  SERVICE.DefaultModelConcurrencyService = { getField: () => undefined };
  SERVICE.DefaultDatabaseModelHandlerService = { inspectIndexes: async () => ({ versioned: false,
    indexes: [{ unique: true, key: { code: 1 } }] }) };
  SERVICE.DefaultCheckoutCheckpointService = {
    save: async r => {
      assert.equal(r.options.insertOnly, true);
      if (rows.some(row => row.code === r.model.code)) throw new Error("duplicate journal");
      rows.push(structuredClone(r.model));
      return { code: "SUC_SAVE", result: { acknowledged: true } };
    },
    get: async r => {
      const result = rows.filter(row => Object.entries(r.query).every(([key, value]) => row[key] === value));
      return { code: "SUC_READ", count: result.length, result: structuredClone(result) };
    },
  };
  SERVICE.DefaultCheckoutPlacementPortsService = ports;
  SERVICE.DefaultCheckoutCompensationRecoveryService = require("../src/service/defaultCheckoutCompensationRecoveryService");
  const created = ports.create();
  const request = {
    tenant: "default", enterpriseCode: "merchant", ownerId: "customer-1",
    ownerRef: { module: "profile", schema: "customer", code: "customer-1" },
    actorRef: { principalType: "customer", code: "customer-1" }, participantEnterpriseCode: "participant",
    idempotencyKey: "checkout-1", correlationId: "corr-1",
    authData: { tenant: "default", enterpriseCode: "participant" },
    payload: { orderCode: "order-1", cartCode: "cart-1", paymentMethod: "LOYALTY_REWARD",
      walletCode: "wallet-1", programCode: "rewards", rewardTypeCode: "points", rewardAmount: "25.00" },
  };
  const checkpoint = { ...structuredClone(request), completed: ["VALIDATED", "CALCULATED", "RESERVED", "DIGITAL_RESERVED"],
    results: { reservation: [] } };
  const calculation = { totalAmount: "141.00", currency: "USD" };
  await assert.rejects(created.authorizePayment(request, calculation), /Original Payment checkpoint/);
  assert.equal(calls.length, 0); assert.equal(rows.length, 0);
  const execute = SERVICE.DefaultPaymentExecutionService.execute;
  SERVICE.DefaultPaymentExecutionService.execute = async (...args) => {
    assert.equal(rows.length, 1, "original journal must precede provider dispatch");
    assert.equal(rows[0].evidence.originalPaymentDispatch.paymentKey, "checkout-1:payment");
    assert.deepEqual(rows[0].evidence.ownerRef, request.ownerRef);
    assert.deepEqual(rows[0].evidence.actorRef, request.actorRef);
    assert.equal(rows[0].evidence.originalAuthorization.amount, "25.00");
    return execute(...args);
  };
  const authorization = await created.authorizePayment(request, calculation, [], checkpoint);
  await assert.rejects(created.authorizePayment(request, calculation, [], checkpoint), /duplicate journal/);
  assert.equal(calls.length, 1, "a duplicate journal cannot redispatch Payment");

  assert.equal(calls[0].adapter.code, "loyalty-reward-points");
  assert.equal(calls[0].request.methodCode, "LOYALTY_REWARD");
  assert.equal(calls[0].request.walletCode, "wallet-1");
  assert.equal(authorization.providerReference, "reservation-1");
  delete global.CONFIG;
});

test("Checkout placement requests internal Cart calculation evidence for reservation", async () => {
  let calculateRequest;
  global.SERVICE.DefaultCartOperationService = {
    calculate: async (request) => {
      calculateRequest = request;
      return { entries: [] };
    },
  };
  const created = ports.create();
  const request = {
    tenant: "default",
    ownerId: "customer-1",
    payload: {
      cartCode: "cart-1",
      expectedCartRevision: "1",
      calculationCode: "calc-1",
    },
  };
  await created.calculateCart(request);
  assert.equal(calculateRequest.internalUse, true);
  assert.equal(calculateRequest.cartCode, "cart-1");
});

test("Checkout order creation persists promotion summary evidence for backoffice views", async () => {
  const saved = [];
  const persistedCart = { code: "cart-1", tenant: "default", enterpriseCode: "enterprise-x",
    ownerId: "customer-1", storeCode: "published-store", currency: "USD", revision: 1 };
  global.SERVICE.DefaultCartOperationService = {
    cartSnapshot: async request => {
      assert.equal(request.cartCode, persistedCart.code);
      assert.equal(request.tenant, persistedCart.tenant);
      assert.equal(request.enterpriseCode, persistedCart.enterpriseCode);
      assert.equal(request.ownerId, persistedCart.ownerId);
      return { ...persistedCart };
    },
  };
  global.SERVICE.DefaultCommerceOrderService = {
    save: async (request) => {
      saved.push({ service: "order", model: request.model });
      return { result: request.model };
    },
  };
  global.SERVICE.DefaultCommerceOrderEntryService = {
    save: async (request) => {
      saved.push({ service: "entry", model: request.model });
      return { result: request.model };
    },
  };
  const created = ports.create();
  const order = await created.createOrder(
    {
      tenant: "default",
      enterpriseCode: "enterprise-x",
      ownerId: "customer-1",
      idempotencyKey: "checkout-1",
      correlationId: "corr-1",
      payload: { orderCode: "order-1", cartCode: "cart-1" },
    },
    {
      code: "calc-1",
      enterpriseCode: "enterprise-x",
      subtotal: "129.00",
      discountAmount: "6.45",
      taxAmount: "6.13",
      totalAmount: "128.68",
      currency: "USD",
      decisions: {
        discount: {
          promotionCode: "coupon5",
          couponCode: "coupon-row-1",
          discountAmount: "6.45",
        },
      },
      entries: [
        {
          code: "entry-1",
          productCode: "dress-1",
          sku: "DRESS-1",
          quantity: "1",
          unitAmount: "129.00",
        },
      ],
    },
    [],
    { providerReference: "pay-1" },
    [],
  );

  assert.equal(order.promotionDiscountAmount, "6.45");
  assert.equal(order.subtotalAmount, "129.00");
  assert.equal(order.taxAmount, "6.13");
  assert.equal(order.promotionCode, "coupon5");
  assert.equal(order.couponCode, "coupon-row-1");
  assert.equal(order.evidence.storeCode, persistedCart.storeCode);
  assert.equal(
    saved.find((item) => item.service === "order").model.enterpriseCode,
    "enterprise-x",
  );
});

test("Checkout completion retires customer Cart intake and active entries", async () => {
  const updates = [];
  global.SERVICE.DefaultCartService = {
    get: async () => ({
      result: [
        {
          code: "cart-1",
          tenant: "default",
          ownerId: "customer-1",
          revision: 3,
        },
      ],
    }),
    update: async (request) => {
      updates.push({
        service: "cart",
        query: request.query,
        model: request.model,
      });
      return { result: request.model.$set };
    },
  };
  global.SERVICE.DefaultCartEntryService = {
    get: async () => ({
      result: [
        {
          code: "entry-1",
          tenant: "default",
          ownerId: "customer-1",
          cartCode: "cart-1",
          revision: 1,
        },
      ],
    }),
    update: async (request) => {
      updates.push({
        service: "entry",
        query: request.query,
        model: request.model,
      });
      return { result: request.model.$set };
    },
  };
  global.SERVICE.DefaultCheckoutCheckpointService = {
    save: async (request) => ({ result: request.model }),
  };
  const created = ports.create();
  const completed = await created.complete(
    {
      tenant: "default",
      ownerId: "customer-1",
      authData: { tenant: "default" },
      idempotencyKey: "checkout-1",
      correlationId: "corr-1",
      results: {},
      completed: [
        "CALCULATED",
        "RESERVED",
        "AUTHORIZED",
        "ORDERED",
        "RELEASED",
      ],
    },
    { order: { code: "order-1", cartCode: "cart-1" } },
  );
  assert.equal(
    updates.some(
      (update) =>
        update.service === "entry" && update.model.$set.status === "REMOVED",
    ),
    true,
  );
  assert.equal(
    updates.some(
      (update) =>
        update.service === "cart" && update.model.$set.active === false,
    ),
    true,
  );
  assert.equal(completed.evidence.cartClosure.orderedEntryCount, 1);
});

test("Checkout rejects unsuccessful authorization before order creation and compensates reservations", async () => {
  const placement = require("../src/service/defaultOrderPlacementService");
  const adapter = require("../../../../payment/modules/paymentProviders/modules/stripeProvider/src/service/defaultStripeSandboxAdapterService");
  const execution = require("../../../../payment/modules/paymentCore/src/service/defaultPaymentExecutionService");
  global.CONFIG = { get: () => ({ enabled: true }) };
  global.SERVICE.DefaultStripeSandboxAdapterService = adapter;
  global.SERVICE.DefaultPaymentExecutionService = execution;
  for (const [token, expectedStatus, errorCode] of [
    ["0002", "DECLINED", "ERR_CHECKOUT_PAYMENT_DECLINED"],
    ["0000", "CANCELLED", "ERR_CHECKOUT_PAYMENT_CANCELLED"],
  ]) {
    const entries = [];
    global.SERVICE.DefaultPaymentTransactionEntryService = {
      get: async () => ({ result: [] }),
      save: async (request) => {
        entries.push(request.model);
        return { result: request.model };
      },
    };
    const request = {
      tenant: "default",
      ownerId: "customer-1",
      idempotencyKey: `negative-${token}`,
      correlationId: `test-${token}`,
      authData: { tenant: "default" },
      payload: {
        orderCode: `order-${token}`,
        cartCode: "cart-1",
        paymentMethod: "CARD",
        providerToken: `tok_test_storefront_${token}`,
      },
    };
    const ownerPorts = ports.create();
    let created = false,
      compensated;
    await assert.rejects(
      placement.place(request, {
        findPlacement: async () => undefined,
        calculateCart: async () => ({ totalAmount: "10.00", currency: "AED" }),
        reserveInventory: async () => [{ code: "reservation-1" }],
        authorizePayment: ownerPorts.authorizePayment,
        createOrder: async () => {
          created = true;
        },
        compensate: async (checkpoint) => {
          compensated = checkpoint;
        },
      }),
      { code: errorCode },
    );
    assert.equal(created, false);
    assert.equal(entries[0].status, expectedStatus);
    assert.deepEqual(compensated.results.reservation, [
      { code: "reservation-1" },
    ]);
    assert.equal(compensated.completed.includes("AUTHORIZED"), false);
  }
  delete global.CONFIG;
});
