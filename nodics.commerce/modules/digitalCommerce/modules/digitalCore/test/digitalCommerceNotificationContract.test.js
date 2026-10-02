/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/** @module digitalCore/test/digitalCommerceNotificationContract @description Authored disabled-policy, original-intent retry and post-commit financial-isolation fixtures; not executed during source delivery. @layer test @owner digitalCore */
const test = require("node:test");
const assert = require("node:assert/strict");
const owner = require("../src/service/defaultDigitalCommerceNotificationService");
const defaults = require("../config/properties").digitalCore;
const placement = require("../../../../checkout/modules/checkoutCore/src/service/defaultOrderPlacementService");
/** Installs bounded isolated source doubles. @param {Object} t Test context. @returns {Object} Mergeable service. */
function fixture(t) {
  const previous = {
    CONFIG: global.CONFIG,
    SERVICE: global.SERVICE,
    CLASSES: global.CLASSES,
    FACADE: global.FACADE,
  };
  t.after(() => Object.assign(global, previous));
  global.CLASSES = { NodicsError: class extends Error {} };
  const privateEntries = new WeakSet();
  global.SERVICE = {
    DefaultLoggerService: {
      runSensitiveOperation: async (request, operation) => {
        privateEntries.add(request);
        return operation();
      },
      assertSensitiveRequest: (request) => assert(privateEntries.has(request)),
    },
  };
  global.CONFIG = { get: () => defaults };
  return { ...owner };
}
test("inert notification defaults do not read owners or send", async (t) => {
  const service = fixture(t);
  service.evidence = async () => {
    throw new Error("unexpected owner read");
  };
  assert.deepEqual(await service.request({}, "PURCHASED"), {
    status: "NOT_REQUESTED",
  });
});
test("original intent retry never reconstructs recipients or presentation and preserves its stable event key", async (t) => {
  const service = fixture(t),
    r = {
      tenant: "t",
      enterpriseCode: "seller",
      ownerId: "buyer",
      orderCode: "purchase",
    },
    item = { code: "entitlement" },
    event = { kind: "PURCHASED", order: { code: "purchase" }, items: [item] };
  global.CONFIG.get = () => ({
    notifications: {
      enabled: true,
      qualified: true,
      connectionName: "communication",
      timeoutMilliseconds: 10000,
      recipientService: "ApprovedRecipientOwner",
      events: {
        PURCHASED: [
          {
            channel: "EMAIL",
            purpose: "DIGITAL_COUPON_PURCHASED",
            templateCode: "DIGITAL_COUPON_PURCHASED_EMAIL",
            locale: "en",
            nextStep: "Review your purchase",
          },
        ],
      },
    },
  });
  global.SERVICE.ApprovedRecipientOwner = {
    resolve: async () => {
      throw new Error("retry cannot resolve a new recipient");
    },
  };
  service.evidence = async () => event;
  const key = service.key(r, event, item, "EMAIL");
  assert.equal(
    key,
    service.key(
      { ...r, correlationId: "different", now: new Date(0) },
      event,
      item,
      "EMAIL",
    ),
  );
  service.invoke = async (_r, _p, path, body) => {
    assert.deepEqual(body, {});
    assert.match(
      path,
      /^\/internal\/communications\/COMM_[a-f0-9]{64}\/retry$/,
    );
    return { intentCode: path.split("/")[3], status: "RETRY_PENDING" };
  };
  assert.equal(
    (await service.request(r, "PURCHASED", true)).status,
    "REQUESTED",
  );
});
test("notification failures cannot compensate an existing financially committed placement", async () => {
  const committed = { code: "purchase", status: "COMPLETED" };
  let compensations = 0;
  const result = await placement.place(
    { tenant: "t", idempotencyKey: "purchase-key" },
    {
      findPlacement: async () => committed,
      notifyCommitted: async () => {
        throw new Error("transport unavailable");
      },
      compensate: async () => {
        compensations++;
      },
    },
  );
  assert.equal(result, committed);
  assert.equal(compensations, 0);
});
test("rejected fresh owner evidence does not request an intent", async (t) => {
  const service = fixture(t);
  service.policy = () => ({});
  service.evidence = async () => {
    throw new Error("refund remains pending");
  };
  service.invoke = async () => {
    throw new Error("must not send");
  };
  assert.deepEqual(await service.request({}, "REFUNDED"), {
    status: "UNCONFIRMED",
  });
});
test("durable Communication terminal states are preserved and unknown states fail closed", async (t) => {
  const service = fixture(t),
    intentCode = "COMM_" + "a".repeat(64),
    p = { connectionName: "communication", timeoutMilliseconds: 10000 };
  for (const status of [
    "ACCEPTED",
    "DELIVERING",
    "DELIVERED",
    "RETRY_PENDING",
    "UNCERTAIN",
    "SUPPRESSED",
    "FAILED",
    "UNCONFIGURED",
    "DEAD_LETTER",
    "CANCELLED",
  ]) {
    global.SERVICE.DefaultModuleService = {
      invokeModule: async () => ({
        result: { intentCode, status, revision: 0 },
      }),
    };
    assert.deepEqual(
      await service.invoke(
        { tenant: "t", enterpriseCode: "seller" },
        p,
        "/internal/communications/" + intentCode + "/inspect",
        {},
      ),
      { intentCode, status, revision: 0 },
    );
  }
  global.SERVICE.DefaultModuleService.invokeModule = async () => ({
    result: { intentCode, status: "QUEUED", revision: 0 },
  });
  await assert.rejects(
    service.invoke(
      { tenant: "t" },
      p,
      "/internal/communications/" + intentCode + "/inspect",
      {},
    ),
  );
  global.SERVICE.DefaultModuleService.invokeModule = async () => ({
    result: { intentCode, status: "DELIVERED" },
  });
  await assert.rejects(
    service.invoke(
      { tenant: "t" },
      p,
      "/internal/communications/" + intentCode + "/inspect",
      {},
    ),
  );
});
test("operator inspection reads original intent state even after financial state changes and never creates/retries", async (t) => {
  const service = fixture(t),
    item = { code: "original-entitlement" },
    event = { kind: "PURCHASED", order: { code: "purchase" }, items: [item] },
    calls = [];
  global.CONFIG.get = () => ({
    notifications: {
      enabled: true,
      qualified: true,
      connectionName: "communication",
      timeoutMilliseconds: 10000,
      recipientService: null,
      events: { PURCHASED: [] },
    },
  });
  global.SERVICE.DefaultSecuredRequestPipelineService = {
    getGrantedPermissions: () => [],
    isPermissionGranted: () => true,
  };
  global.SERVICE.DefaultOrderDisputeService = {
    staff: async (input) => ({ ...input, enterpriseCode: "seller" }),
  };
  service.one = async () => ({
    code: "purchase",
    tenant: "t",
    enterpriseCode: "seller",
    ownerId: "buyer",
    revision: 7,
    status: "REFUNDED",
  });
  service.inspectionSources = async (r) => {
    assert.equal(r.ownerId, "buyer");
    return event;
  };
  service.evidence = service.request = async () => {
    throw new Error(
      "inspection must not execute financial/new-intent/retry paths",
    );
  };
  service.invoke = async (_r, _p, path, body) => {
    assert.deepEqual(body, {});
    assert.match(
      path,
      /^\/internal\/communications\/COMM_[a-f0-9]{64}\/inspect$/,
    );
    calls.push(path);
    if (calls.length === 2) throw new Error("absent or denied intent");
    return { intentCode: path.split("/")[3], status: "CANCELLED", revision: 4 };
  };
  const result = await service.operate({
    tenant: "t",
    code: "purchase",
    authData: {
      tokenType: "access",
      principalType: "human",
      tenant: "t",
      enterpriseCode: "seller",
    },
    payload: { kind: "PURCHASED" },
    query: {},
  });
  assert.equal(result.status, "PARTIALLY_INSPECTED");
  assert.equal(result.orderRevision, 7);
  assert.equal(result.outcomes[0].status, "CANCELLED");
  assert.equal(result.outcomes[0].revision, 4);
  assert.equal(result.outcomes[1].status, "UNCONFIRMED");
  assert.equal(result.outcomes[1].observed, false);
  assert.equal(Object.hasOwn(result, "committed"), false);
  assert.equal(calls.length, 2);
});

/** Installs retained owner evidence, using the real complete-unit matcher rather than bypassing historical proof. @param {Object} t Fixture context. @returns {Object} Source service, context and mutable records. */
function historicalFixture(t) {
  const service = fixture(t),
    r = {
      tenant: "t",
      enterpriseCode: "seller",
      ownerId: "buyer",
      orderCode: "purchase",
    };
  const order = {
    ...r,
    code: "purchase",
    active: true,
    revision: 7,
    status: "REFUNDED",
    currency: "AED",
    totalAmount: "10.00",
  };
  const item = {
    ...r,
    code: "unit",
    productCode: "offer",
    providerOwner: "promotion",
    providerCode: "original-provider",
    status: "REVOKED",
    purchasedAt: "2026-09-01T00:00:00Z",
    validTo: "2026-10-01T00:00:00Z",
  };
  const checkpoint = {
    status: "COMPLETED",
    evidence: {
      orderCode: "purchase",
      digitalDeliveryCodes: [item.providerCode],
    },
  };
  const delivery = {
    status: "DELIVERED",
    providerCode: item.providerCode,
    deliveredAt: item.purchasedAt,
  };
  const records = new Map();
  for (const [name, rows] of [
    ["DefaultCommerceOrderService", [order]],
    [
      "DefaultCommerceOrderEntryService",
      [{ productCode: "offer", quantity: 1 }],
    ],
    ["DefaultCheckoutCheckpointService", [checkpoint]],
    [
      "DefaultPaymentTransactionEntryService",
      [{ status: "CAPTURED", currency: "AED", totalAmount: "10.00" }],
    ],
    ["DefaultDigitalDeliveryService", [delivery]],
  ]) {
    const owner = {};
    global.SERVICE[name] = owner;
    records.set(owner, rows);
  }
  const refund = require("../src/service/defaultDigitalCommerceRefundService");
  global.SERVICE.DefaultDigitalCommerceRefundService = {
    ...refund,
    items: async () => [item],
  };
  global.SERVICE.DefaultDigitalCommerceEntitlementService = {
    readRecords: async (owner) => records.get(owner) || [],
  };
  global.SERVICE.DefaultExactAmountService = {
    compare: (a, b) => Number(a) - Number(b),
  };
  return { service, r, order, item, checkpoint, delivery, records };
}
test("historical committed purchase inspection survives redemption/refund but cannot authorize creation or retry", async (t) => {
  const { service, r, order, item } = historicalFixture(t);
  for (const status of ["REDEEMED", "REVOKED"]) {
    item.status = status;
    assert.equal(
      (await service.inspectionSources(r, "PURCHASED")).items[0].code,
      "unit",
    );
    await assert.rejects(service.evidence(r, "PURCHASED"));
    order.status = "PLACED";
    await assert.rejects(service.evidence(r, "PURCHASED"));
    order.status = "REFUNDED";
  }
  service.policy = () => ({});
  service.invoke = async () => {
    throw new Error("retry must never reach transport");
  };
  assert.deepEqual(await service.request(r, "PURCHASED", true), {
    status: "UNCONFIRMED",
  });
});
test("historical inspection rejects partial or ambiguous original commit evidence before Communication reads", async (t) => {
  const { service, r, checkpoint, delivery, records } = historicalFixture(t);
  service.policy = () => ({});
  service.invoke = async () => {
    assert.fail("unproven commit must not inspect");
  };
  checkpoint.status = "PENDING";
  assert.deepEqual(await service.inspect(r, "PURCHASED"), {
    status: "UNCONFIRMED",
    outcomes: [],
  });
  checkpoint.status = "COMPLETED";
  delivery.status = "PENDING";
  await assert.rejects(service.inspectionSources(r, "PURCHASED"));
  delivery.status = "DELIVERED";
  records.set(global.SERVICE.DefaultDigitalDeliveryService, [
    delivery,
    delivery,
  ]);
  await assert.rejects(service.inspectionSources(r, "PURCHASED"));
});
test("versioned native notification workspace remains disabled and exposes only fixed non-transport commands", async (t) => {
  const service = fixture(t);
  service.operatorContext = async () => ({
    order: { code: "purchase", revision: 7, status: "REFUNDED" },
  });
  service.inspect = service.evidence = async () => {
    assert.fail(
      "unqualified workspace cannot read communication/source evidence",
    );
  };
  global.SERVICE.DefaultSecuredRequestPipelineService = {
    isPermissionGranted: () => true,
    getGrantedPermissions: () => [],
  };
  const dto = await service.workspace({ payload: {}, query: {} });
  assert.equal(dto.contractVersion, 1);
  assert.equal(dto.workspaceCode, "commerce.orderNotifications");
  assert.equal(dto.featureState, "DISABLED");
  assert.equal(dto.financialState, "REFUNDED");
  assert.equal(dto.orderRevision, 7);
  assert.ok(
    dto.commands.every(
      (command) => !command.enabled && !command.eligibleKinds.length,
    ),
  );
  assert.deepEqual(
    dto.commands.flatMap((command) =>
      command.inputFields.map((field) => field.name),
    ),
    ["kind", "kind", "expectedRevision", "confirmed"],
  );
  await assert.rejects(
    service.workspace({ payload: { intentCode: "forged" } }),
  );
  const provider = require("../src/service/defaultDigitalCommerceBackofficeCapabilityService");
  global.SERVICE.DefaultDigitalCommerceNotificationService = service;
  global.SERVICE.DefaultBackofficeCapabilityDefinitionService = require("../../../../../../nodics.foundation/modules/nService/src/service/module/defaultBackofficeCapabilityDefinitionService");
  const navigation = provider
    .getCapability()
    .navigation.find((item) => item.id === "order-notifications");
  assert.equal(navigation.featureState, "DISABLED");
  assert.equal(navigation.backendWorkspace.workspaceCode, dto.workspaceCode);
  assert.equal(Object.hasOwn(navigation, "workbenchTarget"), false);
  assert.deepEqual(
    navigation.lifecycleActions.map((command) => command.id),
    ["inspect", "retry"],
  );
});
test("historical refund inspection requires original completed refund/payment/reversal proof", async (t) => {
  const { service, r, order, records } = historicalFixture(t),
    refundCode = "ORDER_REFUND_" + "A".repeat(32);
  order.evidence = { refundCode, refundCompletedAt: "2026-09-02T00:00:00Z" };
  const refund = {
    status: "COMPLETED",
    evidence: {
      plan: { provider: "digitalCore" },
      steps: {
        COMPLETE: { status: "COMPLETED" },
        PAYMENT: {
          status: "REFUND_SUCCEEDED",
          transactionCode: "payment-refund",
        },
      },
    },
  };
  for (const [name, rows] of [
    ["DefaultOrderLifecycleRequestService", [refund]],
    [
      "DefaultPaymentTransactionService",
      [
        {
          status: "REFUND_SUCCEEDED",
          currency: "AED",
          totalAmount: "10.00",
          idempotencyKey: "order-full-refund:purchase",
          evidence: { operation: "REFUND" },
        },
      ],
    ],
    [
      "DefaultDigitalReversalService",
      [
        {
          status: "COMPLETED",
          entitlementCode: "unit",
          evidence: { refundCode },
        },
      ],
    ],
  ]) {
    const owner = {};
    global.SERVICE[name] = owner;
    records.set(owner, rows);
  }
  assert.equal(
    (await service.inspectionSources(r, "REFUNDED")).refundCode,
    refundCode,
  );
  refund.status = "RECONCILING";
  await assert.rejects(service.inspectionSources(r, "REFUNDED"));
});
test("qualified workspace keeps terminal delivery separate from financial outcome and disables terminal retry", async (t) => {
  const service = fixture(t);
  global.CONFIG.get = (name) =>
    name === "apiExposure"
      ? { categories: { commerceNotificationManagement: { enabled: true } } }
      : {
          notifications: {
            enabled: true,
            qualified: true,
            workspaceQualified: true,
            workspace: defaults.notifications.workspace,
            events: { PURCHASED: [{ channel: "EMAIL" }] },
          },
        };
  global.SERVICE.DefaultSecuredRequestPipelineService = {
    isPermissionGranted: () => true,
    getGrantedPermissions: () => [],
  };
  service.operatorContext = async () => ({
    order: { code: "purchase", revision: 9, status: "PLACED" },
  });
  service.inspect = async (_r, kind) => ({
    status: "INSPECTED",
    outcomes: [
      { channel: "EMAIL", status: "CANCELLED", revision: 4, observed: true },
    ],
  });
  service.evidence = async () => ({ items: [{ code: "unit" }] });
  const dto = await service.workspace({ payload: {} });
  assert.equal(dto.featureState, "ACTIVE");
  assert.equal(dto.financialState, "PLACED");
  assert.equal(dto.events[0].outcomes[0].status, "CANCELLED");
  assert.equal(
    dto.commands.find((command) => command.id === "retry").enabled,
    false,
  );
  assert.equal(
    dto.commands.find((command) => command.id === "inspect").enabled,
    true,
  );
});
test("layered workspace labels change presentation but never fixed commands or authority", async (t) => {
  const service = fixture(t);
  global.CONFIG.get = () => ({
    notifications: {
      ...defaults.notifications,
      workspace: {
        title: "Delivery Evidence",
        navigationLabel: "Notification Review",
        summary: "Review retained notification evidence.",
        fields: {
          kind: "Source event",
          expectedRevision: "Current order revision",
          confirmed: "Authorize retry",
        },
        commands: { inspect: "Read Delivery", retry: "Retry Frozen Delivery" },
      },
    },
  });
  const commands = service.workspaceCommands();
  assert.equal(service.workspacePresentation().title, "Delivery Evidence");
  assert.equal(commands[0].label, "Read Delivery");
  assert.equal(commands[1].inputFields[2].label, "Authorize retry");
  assert.equal(commands[0].permission, "commerce.digital.notification.read");
  assert.equal(commands[1].operationRoute, "/orders/:code/notifications/retry");
  assert.deepEqual(commands[0].inputFields[0].options, [
    "PURCHASED",
    "REFUNDED",
  ]);
  const config = global.CONFIG.get();
  config.notifications.workspace.title = "<script>unsafe</script>";
  global.CONFIG.get = () => config;
  assert.throws(() => service.workspacePresentation());
});
test("notification HTTP requests pass through the mergeable facade before the owning service", async (t) => {
  fixture(t);
  const facade = require("../src/facade/defaultDigitalCommerceNotificationFacade"),
    controller = require("../src/controller/defaultDigitalCommerceNotificationController"),
    calls = [];
  global.FACADE = { DefaultDigitalCommerceNotificationFacade: facade };
  global.SERVICE.DefaultDigitalCommerceNotificationService = {
    workspace: async (input) => {
      calls.push(["workspace", input]);
      return { contractVersion: 1 };
    },
    operate: async (input, retry) => {
      calls.push([retry ? "retry" : "inspect", input]);
      return { status: "UNCONFIRMED" };
    },
  };
  const request = {
    tenant: "t",
    authData: {
      tokenType: "access",
      principalType: "human",
      tenant: "t",
      enterpriseCode: "seller",
    },
    httpRequest: {
      params: { code: "purchase" },
      body: {},
      headers: { authorization: "Bearer signed" },
      query: {},
    },
  };
  assert.deepEqual(await controller.workspace(request), {
    data: { contractVersion: 1 },
  });
  await controller.inspect({
    ...request,
    httpRequest: { ...request.httpRequest, body: { kind: "PURCHASED" } },
  });
  await controller.retry({
    ...request,
    httpRequest: {
      ...request.httpRequest,
      body: { kind: "PURCHASED", expectedRevision: 7, confirmed: true },
    },
  });
  assert.deepEqual(
    calls.map((call) => call[0]),
    ["workspace", "inspect", "retry"],
  );
  assert.equal(calls[0][1].authorization, "Bearer signed");
  assert.equal(calls[0][1].code, "purchase");
  assert.equal(Object.hasOwn(calls[0][1], "ownerId"), false);
  await assert.rejects(
    controller.workspace({
      ...request,
      authData: { ...request.authData, tenant: "other" },
    }),
  );
  assert.equal(calls.length, 3);
});
test("disabled inspection cannot claim absence or perform any intent read", async (t) => {
  const service = fixture(t);
  service.inspectionSources = service.invoke = async () => {
    throw new Error("must not inspect while disabled");
  };
  assert.deepEqual(await service.inspect({}, "PURCHASED"), {
    status: "POLICY_DISABLED",
    notificationPolicyEnabled: false,
    outcomes: [],
  });
});
test("notification HTTP errors are non-cacheable and discard private driver/provider error material", async (t) => {
  fixture(t);
  const controller = require("../src/controller/defaultDigitalCommerceNotificationController"),
    headers = [];
  const privateError = Object.assign(
    new Error("private-provider-address-and-driver-query"),
    {
      code: "PRIVATE_DRIVER_FAILURE",
      errInfo: { recipient: "private-address", query: "private-query" },
      cause: new Error("private-cause"),
    },
  );
  global.CLASSES.NodicsError = class extends Error {
    constructor(code) {
      super(code);
      this.code = code;
    }
  };
  global.FACADE = {
    DefaultDigitalCommerceNotificationFacade: {
      workspace: async () => {
        throw privateError;
      },
      inspect: () => {
        throw privateError;
      },
      retry: async () => {
        throw privateError;
      },
    },
  };
  const request = {
    httpResponse: { setHeader: (name, value) => headers.push([name, value]) },
  };
  const safe = (error) => {
    assert.ok(error instanceof global.CLASSES.NodicsError);
    assert.notEqual(error, privateError);
    assert.equal(error.code, "ERR_DIGITAL_NOTIFICATION_UNCONFIRMED");
    assert.equal(error.message, "ERR_DIGITAL_NOTIFICATION_UNCONFIRMED");
    assert.equal(Object.hasOwn(error, "errInfo"), false);
    assert.equal(Object.hasOwn(error, "cause"), false);
    assert.equal(JSON.stringify(error).includes("private"), false);
    return true;
  };
  for (const operation of ["workspace", "inspect", "retry"])
    await assert.rejects(controller[operation](request), safe);
  const callbackError = await new Promise((resolve) =>
    controller.retry(request, (error, data) => {
      assert.equal(data, undefined);
      resolve(error);
    }),
  );
  safe(callbackError);
  assert.deepEqual(
    headers,
    Array.from({ length: 4 }, () => ["Cache-Control", "no-store"]),
  );
});
