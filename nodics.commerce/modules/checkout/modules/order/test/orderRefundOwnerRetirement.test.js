/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module order/test/orderRefundOwnerRetirement @description Proves absent external reversal owners refuse without effects while explicit owner-port extensions remain supported. @layer test @owner order */
const test = require("node:test");
const assert = require("node:assert/strict");
const service = require("../src/service/defaultOrderRefundRecoveryService");
const defaults = require("../config/properties");
let settings;
let globals;
test.beforeEach(() => {
  globals = ["CONFIG", "SERVICE"].map(key => [key, Object.hasOwn(global, key), global[key]]);
  settings = structuredClone(defaults);
  global.CONFIG = { get: key => settings[key] };
  global.SERVICE = { DefaultModuleService: { invokeModule: async () => assert.fail("No retired-owner transport") } };
});
test.afterEach(() => {
  for (const [key, present, value] of globals) {
    if (present) global[key] = value;
    else delete global[key];
  }
});

test("retired accelerator phases fail before transport without rewriting historical evidence", async () => {
  const request = { tenant: "tenant", enterpriseCode: "merchant", orderCode: "original",
    refundCode: "retained", caseRow: { evidence: {} }, history: { provider: "eWaste" } };
  const original = structuredClone(request);
  assert.deepEqual(service.policy().ownerPorts, {});
  for (const phase of ["preview", "prepare", "settle", "complete"])
    await assert.rejects(service.owner(request, "eWaste", phase), /reversal owner is unavailable/);
  assert.deepEqual(request, original);
});

test("a non-digital order has no implicit accelerator or external fallback", async () => {
  SERVICE.DefaultDigitalCommerceRefundService = { preview: async () => ({ eligible: false, reason: "NO_DIGITAL_ENTITLEMENT" }) };
  SERVICE.DefaultPaymentRefundExecutionService = { orderCapture: async () => ({ amount: "1.00", currency: "POINTS" }) };
  const owner = { ...service, record: async () => undefined };
  const result = await owner.plan({ caseRow: { status: "SUBMITTED", evidence: {} },
    order: { status: "PLACED", evidence: {} } });
  assert.deepEqual(result, { eligible: false, reason: "NO_AUTOMATIC_REVERSAL_OWNER" });
});

test("intentional external owner-port overrides still use the existing protected phase transport", async () => {
  settings.order.refunds.ownerPorts.selected = { moduleName: "selectedOwner", connectionName: "selected",
    targetAuthority: { runtimeRole: "SELECTED" }, apiPrefix: "/qualified-reversals" };
  let sent;
  SERVICE.DefaultModuleService.invokeModule = async input => { sent = input; return { data: { status: "PREPARED" } }; };
  const result = await service.owner({ tenant: "tenant", enterpriseCode: "merchant",
    refundCode: "original", caseRow: { evidence: {} } }, "selected", "prepare");
  assert.deepEqual(result, { status: "PREPARED" });
  assert.equal(sent.moduleName, "selectedOwner");
  assert.equal(sent.apiName, "/qualified-reversals/prepare");
  assert.equal(sent.requestBody.refundCode, "original");
  assert.equal(sent.header["X-Enterprise-Code"], "merchant");
});
