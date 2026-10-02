/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module smsCommsProvider/test/smsRuntimeAdapter @description Verifies frozen text, durable tenant/lease safety, uncertainty and replaceable sandbox ports without network delivery. @owner smsCommsProvider @layer test */
const { test, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const service = require("../src/service/defaultSmsCommunicationProviderService");
let input, policy, calls, saved;
beforeEach(() => {
  saved = { CONFIG: global.CONFIG, SERVICE: global.SERVICE };
  calls = [];
  policy = {
    ...require("../config/properties").smsCommsProvider,
    enabled: true,
    sandboxTransportService: "FixtureSms",
    endpoint: "https://sandbox.invalid",
    credentialReference: "fixture-key",
    senderReference: "fixture-sender",
  };
  global.CONFIG = {
    get: (key) => (key === "smsCommsProvider" ? policy : undefined),
  };
  global.SERVICE = {
    FixtureSms: {
      marker: true,
      resolveCredential: async function () {
        assert.equal(this.marker, true);
        return "fake-secret";
      },
      send: async function (value) {
        assert.equal(this.marker, true);
        calls.push(value);
        return { reference: "accepted" };
      },
    },
  };
  input = {
    request: { tenant: "a", authData: { tenant: "a" } },
    policy: {},
    intent: {
      tenant: "a",
      channel: "SMS",
      code: "I1",
      idempotencyKey: "K1",
      status: "DELIVERING",
      leaseExpiresAt: new Date(Date.now() + 60000),
      recipientAddressReference: "fixture-phone-reference",
      renderedContent: {
        body: "FAKE code 123456",
        templateIdentity: { checksum: "private-identity" },
      },
    },
  };
});
afterEach(() => Object.assign(global, saved));
test("durable adapter sends only frozen literal text and redacted evidence", async () => {
  const result = await service.deliver(input);
  assert.equal(result.status, "DELIVERED");
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0].rendered, { body: "FAKE code 123456" });
  assert.ok(!JSON.stringify(result).includes("123456"));
  assert.ok(!JSON.stringify(result).includes("fake-secret"));
});
for (const change of [
  { tenant: "other" },
  { channel: "EMAIL" },
  { status: "ACCEPTED" },
  { leaseExpiresAt: "invalid" },
  { leaseExpiresAt: new Date(0) },
]) {
  test(
    "invalid durable scope or lease refuses transport: " +
      JSON.stringify(change),
    async () => {
      Object.assign(input.intent, change);
      assert.equal((await service.deliver(input)).status, "FAILED");
      assert.equal(calls.length, 0);
    },
  );
}
test("expiry, disabled configuration and missing ports never send", async () => {
  input.intent.expiresAt = new Date(0);
  assert.equal((await service.deliver(input)).status, "SUPPRESSED");
  delete input.intent.expiresAt;
  policy.enabled = false;
  assert.equal((await service.deliver(input)).status, "UNCONFIGURED");
  policy.enabled = true;
  delete SERVICE.FixtureSms;
  assert.equal((await service.deliver(input)).status, "UNCONFIGURED");
  assert.equal(calls.length, 0);
});
for (const content of [
  { body: {} },
  { body: "" },
  { body: "test", html: "<p>wrong channel</p>" },
  { body: "x".repeat(1601) },
]) {
  test(
    "malformed or oversized SMS is refused before ports: " +
      JSON.stringify(content).slice(0, 70),
    async () => {
      input.intent.renderedContent = content;
      assert.equal((await service.deliver(input)).status, "FAILED");
      assert.equal(calls.length, 0);
    },
  );
}
test("exception after send invocation stays uncertain and is never retried by the adapter", async () => {
  SERVICE.FixtureSms.send = async () => {
    calls.push("attempt");
    throw new Error("private provider diagnostics");
  };
  const result = await service.deliver(input);
  assert.equal(result.status, "UNCERTAIN");
  assert.equal(calls.length, 1);
  assert.ok(!JSON.stringify(result).includes("private"));
});
test("later-layer content customization uses the effective exported member", async () => {
  let called = false;
  const customized = {
    ...service,
    content: function (...args) {
      called = true;
      return service.content.apply(this, args);
    },
  };
  await customized.deliver(input);
  assert.equal(called, true);
});
