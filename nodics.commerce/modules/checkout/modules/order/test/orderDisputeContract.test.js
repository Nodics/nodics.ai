/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module order/test/orderDisputeContract @description Verifies manual order review ownership, confirmation, idempotency, scope, immutable decisions and absence of downstream financial side effects. @layer test @owner order */
const test = require("node:test"),
  assert = require("node:assert/strict"),
  service = require("../src/service/defaultOrderDisputeService"),
  lifecycle = require("../src/service/defaultOrderLifecycleOperationService");
const accessFixture = require("./helpers/orderBusinessAccessFixture");
let rows, scope;
function match(r, q) {
  return Object.entries(q).every(([k, v]) => r[k] === v);
}
function input(extra = {}) {
  return {
    tenant: "runtime",
    code: "ORDER_1",
    authData: {
      principalType: "customer",
      code: "buyer",
      loginId: "buyer@local",
      entCode: "enterprise",
    },
    payload: {
      confirmed: true,
      requestedResolution: "REFUND",
      comment: "Please review this purchased asset.",
    },
    idempotencyKey: "review-request-key",
    ...extra,
  };
}
function staff(extra = {}) {
  return input({
    authData: {
      principalType: "human",
      loginId: "moderator",
      entCode: "enterprise",
    },
    authorization: "Bearer example",
    ...extra,
  });
}
test.beforeEach(() => {
  rows = new Map();
  scope = {
    principalCode: "moderator",
    scopes: [{ scopeType: "ENTERPRISE", scopeCode: "enterprise" }],
    deniedScopes: [],
  };
  global.CONFIG = {
    get: () => ({ disputes: { enabled: true, orderCodePrefixes: ["ORDER_"] } }),
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
    DefaultDigitalCommerceEntitlementService: {
      listEntitlements: async () => [],
      revocationPolicy: require("../../../../digitalCommerce/modules/digitalCore/src/service/defaultDigitalCommerceEntitlementService").revocationPolicy,
    },
    DefaultOrderLifecycleOperationService: lifecycle,
    DefaultOrderOperationService: {
      read: async (r) => {
        if (r.ownerId !== "buyer" || r.orderCode !== "ORDER_1")
          throw Error("not found");
        return { order: { code: "ORDER_1", ownerId: "buyer", enterpriseCode: "enterprise" } };
      },
    },
    DefaultOrderLifecycleRequestService: {
      get: async (r) => ({
        code: "SUC_GET",
        result: [...rows.values()]
          .filter((x) => match(x, r.query))
          .map((value) => structuredClone(value)),
      }),
      save: async (r) => {
        if (rows.has(r.model.code)) throw Error("duplicate");
        rows.set(r.model.code, structuredClone(r.model));
        return { result: r.model };
      },
      update: async (r) => {
        const row = rows.get(r.query.code);
        if (!row || !match(row, r.query)) throw Error("conflict");
        rows.set(row.code, {
          ...row,
          ...structuredClone(r.model),
          revision: row.revision + 1,
        });
        return { result: rows.get(row.code) };
      },
    },
    DefaultModuleService: { invokeModule: async () => ({ data: scope }) },
    DefaultSecuredRequestPipelineService: {
      getGrantedPermissions: () => ["commerce.dispute.review"],
      isPermissionGranted: (p, grants) => grants.includes(p),
    },
  };
});
test("final coupon owner policy hides review and refuses new cases without changing history", async () => {
  const existing = await service.create(input());
  SERVICE.DefaultDigitalCommerceEntitlementService.listEntitlements = async () => [{
    tenant: "runtime", enterpriseCode: "enterprise", ownerId: "buyer", orderCode: "ORDER_1",
    digitalDeliveryType: "COUPON_CODE", claimStatus: "REDEEMED", purchasePolicy: { version: 2 },
  }];
  const before = structuredClone([...rows.values()]);
  const history = await service.listOwn(input());
  assert.deepEqual(history.reviewEligibility, { eligible: false, resolutions: [], reasonCode: "DIGITAL_COUPON_PURCHASE_FINAL" });
  assert.equal(history.cases[0].code, existing.code);
  await assert.rejects(service.create(input({ idempotencyKey: "new-review-key" })), /not eligible/);
  assert.equal((await service.create(input())).code, existing.code);
  assert.deepEqual([...rows.values()], before);
});
test("missing, failed and foreign Digital owner evidence never enables review", async () => {
  for (const read of [async () => { throw Error("unavailable"); }, async () => [{ tenant: "foreign" }]]) {
    SERVICE.DefaultDigitalCommerceEntitlementService.listEntitlements = read;
    assert.equal((await service.listOwn(input())).reviewEligibility.eligible, false);
  }
  delete SERVICE.DefaultDigitalCommerceEntitlementService;
  assert.equal((await service.listOwn(input())).reviewEligibility.eligible, false);
});
test("Order history projects the current owner decision without changing persisted orders", async () => {
  const operation = require('../src/service/defaultOrderOperationService');
  const row = { tenant: 'runtime', enterpriseCode: 'enterprise', ownerId: 'buyer', code: 'ORDER_1', status: 'COMPLETED' };
  const original = structuredClone(row);
  SERVICE.DefaultCommerceOrderService = { get: async () => ({ result: [row] }) };
  SERVICE.DefaultOrderDisputeService = service;
  SERVICE.DefaultDigitalCommerceEntitlementService.listEntitlements = async (request, query) => {
    assert.equal(request.enterpriseCode, row.enterpriseCode);
    assert.deepEqual(query, { ownerId: row.ownerId, orderCode: row.code });
    return [{ ...row, orderCode: row.code, digitalDeliveryType: 'COUPON_CODE', purchasePolicy: { version: 2 }, claimStatus: 'REDEEMED' }];
  };
  const projected = await operation.listOwn(service.context(input()));
  assert.equal(projected[0].reviewEligibility.eligible, false);
  assert.deepEqual(row, original);
  assert.equal(rows.size, 0);
});
test("redeemed legacy coupon review offers dispute only, not refund intent", async () => {
  SERVICE.DefaultDigitalCommerceEntitlementService.listEntitlements = async () => [{
    tenant: 'runtime', enterpriseCode: 'enterprise', ownerId: 'buyer', orderCode: 'ORDER_1',
    digitalDeliveryType: 'COUPON_CODE', claimStatus: 'REDEEMED',
  }];
  assert.deepEqual((await service.listOwn(input())).reviewEligibility.resolutions, ['DISPUTE']);
  await assert.rejects(service.create(input()), /not eligible/);
  assert.equal(rows.size, 0);
});
test("unadmitted purchase-prefix history reports Digital finality without granting manual review", async () => {
  const operation = require('../src/service/defaultOrderOperationService');
  const order = { tenant: 'runtime', enterpriseCode: 'merchant', ownerId: 'buyer',
    code: 'purchase-11111111-1111-4111-8111-111111111111', cartCode: 'fixture-cart',
    evidence: { storeCode: 'circaMainStore' } };
  const policy = { enabled: true, orderCodePrefixes: ['CIRCA_ORDER_'], storeCodes: {} };
  const original = structuredClone({ order, policy });
  CONFIG.get = () => ({ disputes: policy });
  SERVICE.DefaultOrderDisputeService = service;
  SERVICE.DefaultCommerceOrderService = { get: async () => ({ result: [order] }) };
  SERVICE.DefaultOrderOperationService.read = async () => ({ order });
  SERVICE.DefaultCartService = { get: async () => ({ code: 'SUC_GET', result: [{
    code: order.cartCode, tenant: order.tenant, enterpriseCode: order.enterpriseCode,
    ownerId: order.ownerId, storeCode: order.evidence.storeCode,
  }] }) };
  const item = { tenant: order.tenant, enterpriseCode: order.enterpriseCode,
    ownerId: order.ownerId, orderCode: order.code, digitalDeliveryType: 'COUPON_CODE',
    claimStatus: 'REDEEMED', purchasePolicy: { version: 2 } };
  let reads = 0;
  SERVICE.DefaultDigitalCommerceEntitlementService.listEntitlements = async (request, query) => {
    reads++;
    assert.equal(request.enterpriseCode, order.enterpriseCode);
    assert.deepEqual(query, { ownerId: order.ownerId, orderCode: order.code });
    return [item];
  };
  for (const enterpriseCode of ['default', 'merchant']) {
    const request = { tenant: order.tenant, ownerId: order.ownerId,
      enterpriseCode, authData: { principalType: 'customer' } };
    const result = await operation.listOwn(request);
    assert.deepEqual(result[0].reviewEligibility,
      { eligible: false, resolutions: [], reasonCode: 'DIGITAL_COUPON_PURCHASE_FINAL' });
  }
  assert.equal(reads, 2);
  const command = input({ code: order.code,
    authData: { principalType: 'customer', code: 'buyer', entCode: 'merchant' } });
  await assert.rejects(service.create(command), /outside the review policy/);
  item.purchasePolicy = { version: 1 };
  item.claimStatus = 'UNCLAIMED';
  const request = { tenant: order.tenant, ownerId: order.ownerId,
    enterpriseCode: 'default', authData: { principalType: 'customer' } };
  assert.deepEqual((await operation.listOwn(request))[0].reviewEligibility,
    { eligible: false, resolutions: [], reasonCode: 'ORDER_REVIEW_UNAVAILABLE' });
  await assert.rejects(service.create(command), /outside the review policy/);
  assert.equal(rows.size, 0);
  assert.deepEqual({ order, policy }, original);
});
test("manual request and moderator outcome preserve one case without invoking payment or ownership services", async () => {
  const first = await service.create(input());
  assert.equal(first.status, "SUBMITTED");
  assert.equal(first.automaticReversal, false);
  assert.equal((await service.create(input())).code, first.code);
  const command = staff({
    code: first.code,
    idempotencyKey: "review-decision-key",
    payload: {
      confirmed: true,
      expectedRevision: first.revision,
      outcome: "RESOLVED",
      reason: "Reviewed with the customer; no refund was requested.",
    },
  });
  const final = await service.resolve(command);
  assert.equal(final.status, "RESOLVED");
  assert.equal((await service.resolve(command)).revision, final.revision);
  assert.equal(rows.size, 1);
  assert.equal(
    (await service.listOwn(input())).cases[0].decision.reason,
    command.payload.reason,
  );
});
test("unconfirmed requests, changed idempotent content and another customer order are rejected", async () => {
  await assert.rejects(
    service.create(input({ payload: { confirmed: false } })),
  );
  await service.create(input());
  await assert.rejects(
    service.create(
      input({
        payload: {
          ...input().payload,
          comment: "Changed details using the same identity",
        },
      }),
    ),
    /different details/,
  );
  await assert.rejects(
    service.create(
      input({
        authData: {
          principalType: "customer",
          code: "other",
          loginId: "other@local",
          entCode: "enterprise",
        },
      }),
    ),
    /not found/,
  );
  assert.equal(rows.size, 1);
});
test("scope denial and customer identities cannot enter moderator operations", async () => {
  await service.create(input());
  await assert.rejects(service.queue(input()), /not permitted/);
  scope.deniedScopes = [{ scopeType: "ENTERPRISE", scopeCode: "enterprise" }];
  await assert.rejects(service.queue(staff()), /outside/);
  scope.deniedScopes = [];
  scope.scopes = [{ scopeType: "ENTERPRISE", scopeCode: "another" }];
  await assert.rejects(service.queue(staff()), /outside/);
});
test("a stale outcome cannot overwrite a resolved request and generic lifecycle actions cannot bypass manual review", async () => {
  const first = await service.create(input());
  await assert.rejects(
    service.resolve(
      staff({
        code: first.code,
        idempotencyKey: "review-decision-key",
        payload: {
          confirmed: true,
          expectedRevision: 99,
          outcome: "REJECTED",
          reason: "The request needs further supporting evidence.",
        },
      }),
    ),
    /changed/,
  );
  SERVICE.DefaultOrderLifecycleRepositoryService = {
    ...accessFixture.repository,
    get: async () => rows.get(first.code),
  };
  accessFixture.install();
  await assert.rejects(
    lifecycle.action({
      tenant: "runtime",
      authData: accessFixture.employeeAuth({ tenant: "runtime", enterpriseCode: "enterprise", actorId: "moderator" }),
      requestCode: first.code,
      actorId: "moderator",
      actionCode: "APPROVE",
      payload: { refundAmount: "99" },
    }),
    /scoped manual/,
  );
});
