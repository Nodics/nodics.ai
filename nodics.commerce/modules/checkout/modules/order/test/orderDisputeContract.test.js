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
    DefaultOrderLifecycleOperationService: lifecycle,
    DefaultOrderOperationService: {
      read: async (r) => {
        if (r.ownerId !== "buyer" || r.orderCode !== "ORDER_1")
          throw Error("not found");
        return { order: { code: "ORDER_1", ownerId: "buyer" } };
      },
    },
    DefaultOrderLifecycleRequestService: {
      get: async (r) => ({
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
    get: async () => rows.get(first.code),
  };
  await assert.rejects(
    lifecycle.action({
      tenant: "runtime",
      requestCode: first.code,
      actorId: "moderator",
      actionCode: "APPROVE",
      payload: { refundAmount: "99" },
    }),
    /scoped manual/,
  );
});
