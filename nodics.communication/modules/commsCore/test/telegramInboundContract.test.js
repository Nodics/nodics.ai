/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module commsCore/test/telegramInboundContract @description Proves native secret authentication, receipt binding, race/isolation and durable generated persistence without network or installed stores. @owner commsCore @layer test @override Keep negative and rotated-secret coverage. */
const test = require("node:test");
const assert = require("node:assert/strict");
const fixture = require("./helpers/telegramInboundFixture");

test("private /start returns one HTTPS web_app method with majority insert/readback and no identity/content storage", async (t) => {
  const f = fixture(t);
  const reply = await f.owner.receive(f.http(f.update()));
  assert.equal(reply.method, "sendMessage");
  assert.equal(reply.chat_id, 123);
  assert.deepEqual(reply.reply_markup.inline_keyboard[0][0].web_app, { url: "https://mini.example.test/app" });
  assert.deepEqual(await f.owner.receive(f.http(f.update())), {});
  assert.equal(f.rows.size, 1);
  const row = [...f.rows.values()][0];
  assert.equal(row.disposition, "LAUNCH_REPLY_RESERVED");
  assert.equal(Object.hasOwn(row, "message"), false);
  assert.equal(Object.hasOwn(row, "subject"), false);
  for (const call of f.calls) {
    if (call.kind === "insert") assert.deepEqual(call.options.writeConcern, { w: "majority", j: true });
    else { assert.equal(call.options.readPreference, "primary"); assert.deepEqual(call.options.readConcern, { level: "majority" }); }
  }
});

test("authentication and capture refusal precede body getters and all persistence", async (t) => {
  const f = fixture(t);
  for (const change of [
    (h) => { h.headers["x-telegram-bot-api-secret-token"] = "wrong"; },
    (h) => { delete h.headers["x-telegram-bot-api-secret-token"]; },
    (h) => { h.headers["x-telegram-bot-api-secret-token"] = [f.secret]; },
    (h) => { h.headers["x-telegram-bot-api-secret-token"] = "x".repeat(257); },
    (h) => { h.rawHeaders = ["X-Telegram-Bot-Api-Secret-Token", f.secret, "X-Telegram-Bot-Api-Secret-Token", f.secret]; },
    (h) => { h.params.receiverCode = "__proto__"; },
    (h) => { h.headers["x-enterprise-code"] = "tenant-b"; },
    (h) => { h.headers.authorization = "Bearer claimed"; },
    (h) => { h.headers["content-type"] = "application/x-www-form-urlencoded"; },
    (h) => { h.originalUrl += "?tenant=tenant-b"; },
    () => { f.policy.enabled = false; },
    () => { f.exposure.categories.communicationTelegramInbound.enabled = false; },
    () => { f.policy.receivers.first.tenant = "uninstalled"; },
    () => { f.policy.receivers.first.miniAppUrl = "http://mini.example.test"; },
    () => { f.policy.receivers.first.miniAppUrl = "https://user:password@mini.example.test"; },
    () => { f.policy.receivers.first.miniAppUrl = "https://mini.example.test/#token"; },
  ]) {
    f.policy.enabled = true;
    f.exposure.categories.communicationTelegramInbound.enabled = true;
    f.policy.receivers.first.tenant = "tenant-a";
    f.policy.receivers.first.miniAppUrl = "https://mini.example.test/app";
    const http = f.http();
    Object.defineProperty(http, "body", { get: () => assert.fail("unauthenticated body read") });
    change(http);
    await assert.rejects(f.owner.receive(http), { code: "ERR_COMMS_TELEGRAM_CONTEXT" });
  }
  const unadmitted = { ...f.http(), requestPrivacy: { sensitive: true }, captureProtectionQualified: true };
  Object.defineProperty(unadmitted, "body", { get: () => assert.fail("unadmitted body read") });
  await assert.rejects(f.owner.receive(unadmitted), { code: "ERR_COMMS_TELEGRAM_CONTEXT" });
  assert.equal(f.calls.length, 0);
});

test("rotation and receiver aliases preserve the bot update key; revoked secrets refuse before body", async (t) => {
  const f = fixture(t);
  f.policy.receivers.first.webhookSecretReferences.push("telegram.test.previous");
  await f.owner.receive(f.http(f.update(), "first", f.credentials["telegram.test.previous"].value));
  assert.deepEqual(await f.owner.receive(f.http(f.update())), {});
  f.policy.receivers.alias = structuredClone(f.policy.receivers.first);
  assert.deepEqual(await f.owner.receive(f.http(f.update(), "alias")), {});
  f.policy.receivers.first.webhookSecretReferences = ["telegram.test.current"];
  await assert.rejects(f.owner.receive(f.http(f.update(), "first", f.credentials["telegram.test.previous"].value)), { code: "ERR_COMMS_TELEGRAM_CONTEXT" });
  assert.equal(f.rows.size, 1);
});

test("full payload binding rejects changed identity or ignored data but permits reordered object keys", async (t) => {
  const f = fixture(t);
  await f.owner.receive(f.http(f.update()));
  const reordered = { message: f.update().message, update_id: 1 };
  assert.deepEqual(await f.owner.receive(f.http(reordered)), {});
  for (const mutate of [
    (u) => { u.message.text = "/start abc"; },
    (u) => { u.message.from.id = u.message.chat.id = 456; },
    (u) => { u.extra = "ignored-but-bound"; },
  ]) {
    const update = f.update(); mutate(update);
    await assert.rejects(f.owner.receive(f.http(update)), { code: "ERR_COMMS_TELEGRAM_CONFLICT" });
  }
  assert.equal(f.rows.size, 1);
});

test("concurrent replay has one atomic winner; same key with conflicting payload has one refusal", async (t) => {
  const f = fixture(t);
  const results = await Promise.all(Array.from({ length: 16 }, () => f.owner.receive(f.http(f.update()))));
  assert.equal(results.filter((r) => r.method === "sendMessage").length, 1);
  assert.equal(f.rows.size, 1);
  const first = f.update(2), second = f.update(2); second.message.date++;
  const conflicting = await Promise.allSettled([f.owner.receive(f.http(first)), f.owner.receive(f.http(second))]);
  assert.equal(conflicting.filter((r) => r.status === "fulfilled").length, 1);
  assert.equal(conflicting.find((r) => r.status === "rejected").reason.code, "ERR_COMMS_TELEGRAM_CONFLICT");
});

test("tenant and bot partitions are independent and cross-receiver credentials cannot select storage", async (t) => {
  const f = fixture(t);
  await f.owner.receive(f.http(f.update()));
  await assert.rejects(f.owner.receive(f.http(f.update(), "second")), { code: "ERR_COMMS_TELEGRAM_CONTEXT" });
  assert.equal(f.rows.size, 1);
  const reply = await f.owner.receive(f.http(f.update(), "second", f.credentials["telegram.other.current"].value));
  assert.equal(reply.reply_markup.inline_keyboard[0][0].web_app.url, "https://other.example.test/app");
  f.policy.receivers.third = { ...f.policy.receivers.second, tenant: "tenant-a" };
  assert.equal((await f.owner.receive(f.http(f.update(), "third", f.credentials["telegram.other.current"].value))).method, "sendMessage");
  assert.equal(f.rows.size, 3);
  assert.deepEqual(new Set([...f.rows.values()].map((r) => r.tenant)), new Set(["tenant-a", "tenant-b"]));
});

test("unsupported private/group/business/callback updates are bound acknowledgments with no launch", async (t) => {
  const f = fixture(t);
  let id = 10;
  for (const mutate of [
    (u) => { u.message.chat.type = "group"; },
    (u) => { u.message.chat.id = 456; },
    (u) => { u.message.from.is_bot = true; },
    (u) => { u.message.text = "/start@WrongBot"; },
    (u) => { u.message.text = "/startx"; },
    (u) => { u.message.text = "text /start"; },
    (u) => { u.message.entities = []; },
    (u) => { u.message.business_connection_id = "business"; },
    (u) => { u.message.forward_origin = {}; },
    (u) => { u.edited_message = u.message; delete u.message; },
    (u) => { u.callback_query = {}; delete u.message; },
    (u) => { u.tenant = "tenant-b"; u.operation = "deliver"; },
  ]) {
    const update = f.update(id++); mutate(update);
    assert.deepEqual(await f.owner.receive(f.http(update)), {});
  }
  assert([...f.rows.values()].every((r) => r.disposition === "IGNORED"));
  assert.equal((await f.owner.receive(f.http({ ...f.update(100), message: { ...f.update().message, text: "/start@ExampleBot payload_1", entities: [{ type: "bot_command", offset: 0, length: 17 }] } }))).method, "sendMessage");
});

test("malformed, oversized and deeply nested payloads refuse before storage", async (t) => {
  const f = fixture(t);
  for (const body of [null, [], {}, { update_id: -1 }, { update_id: "1" }, { update_id: 1.5 }, { update_id: 2147483648 }, { ...f.update(), extra: "x".repeat(65536) }, JSON.parse('{"update_id":1,"__proto__":{}}')])
    await assert.rejects(f.owner.receive(f.http(body)), { code: "ERR_COMMS_TELEGRAM_INPUT" });
  let deep = {}; for (let i = 0; i < 18; i++) deep = { deep };
  await assert.rejects(f.owner.receive(f.http({ ...f.update(), deep })), { code: "ERR_COMMS_TELEGRAM_INPUT" });
  assert.equal(f.calls.length, 0);
});

test("lost write acknowledgment, failed readback, absent write and unsupported provider never grant a launch", async (t) => {
  const f = fixture(t);
  f.faults.lostAck = true;
  await assert.rejects(f.owner.receive(f.http(f.update())), { code: "ERR_COMMS_TELEGRAM_STORAGE" });
  f.faults.lostAck = false;
  assert.deepEqual(await f.owner.receive(f.http(f.update())), {});
  f.faults.noWrite = true;
  await assert.rejects(f.owner.receive(f.http(f.update(2))), { code: "ERR_COMMS_TELEGRAM_STORAGE" });
  f.faults.noWrite = false;
  f.faults.readError = true;
  await assert.rejects(f.owner.receive(f.http(f.update(3))), { code: "ERR_COMMS_TELEGRAM_STORAGE" });
  f.faults.readError = false;
  f.faults.unsupported = true;
  await assert.rejects(f.owner.receive(f.http(f.update(4))), { code: "ERR_COMMS_TELEGRAM_STORAGE" });
});

test("later presentation override is loader-selected and cannot widen trusted command dispatch", async (t) => {
  const f = fixture(t);
  const original = f.owner;
  SERVICE.DefaultTelegramInboundService = { ...original, launchReply(update, policy) { const reply = original.launchReply.call(this, update, policy); if (reply) reply.text = "Custom launch label"; return reply; } };
  assert.equal((await SERVICE.DefaultTelegramInboundService.receive(f.http(f.update()))).text, "Custom launch label");
  const invalid = f.update(2); invalid.message.chat.type = "group";
  assert.deepEqual(await SERVICE.DefaultTelegramInboundService.receive(f.http(invalid)), {});
});
