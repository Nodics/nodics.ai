/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module commsCore/test/communicationRuntime @description Proves durable idempotency, competing claims, source isolation, suppression and safe Telegram uncertainty. @owner commsCore @layer test */
const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const runtime = require("../src/service/defaultCommunicationRuntimeService"),
  core = require("../src/service/defaultCommunicationCoreService"),
  telegram = require("../src/service/defaultTelegramCommunicationProviderService");
let db, policy, sends;
const request = {
  tenant: "t",
  authData: { tenant: "t", principalType: "service", entCode: "enterprise" },
};
const command = {
  sourceModule: "eWaste",
  sourceType: "wasteSubmission",
  sourceCode: "S1",
  templateCode: "outcome",
  recipientId: "CUSTOMER_CODE",
  recipientAddressReference: "LINK",
  purpose: "OUTCOME",
  channel: "IN_APP",
  locale: "en",
  idempotencyKey: "decision-1",
  variables: { comment: "Approved <b>literal</b>" },
};
beforeEach(() => {
  db = {};
  sends = 0;
  policy = {
    ...require("../config/properties").communication,
    trustedSourceModules: ["eWaste"],
    templates: {
      outcome: {
        code: "outcome",
        version: 1,
        status: "ACTIVE",
        purpose: "OUTCOME",
        sourceModules: ["eWaste"],
        channels: ["IN_APP", "TELEGRAM"],
        declaredVariables: ["comment"],
        bodyTemplate: "{{comment}}",
      },
    },
    providers: { TELEGRAM: { service: "TelegramTest" } },
  };
  global.CONFIG = { get: () => policy };
  global.SERVICE = {
    DefaultCommunicationCoreService: core,
    TelegramTest: {
      deliver: async () => {
        sends++;
        return { status: "DELIVERED", providerReference: "M1" };
      },
    },
  };
  for (const schema of [
    "CommsIntent",
    "CommsDeliveryAttempt",
    "CommsInboxMessage",
    "CommsSuppression",
  ]) {
    db[schema] = new Map();
    SERVICE["Default" + schema + "Service"] = {
      get: async ({ tenant, query }) => ({
        result: [...db[schema].values()]
          .filter(
            (row) =>
              row.tenant === tenant &&
              Object.entries(query).every(([key, val]) => row[key] === val),
          )
          .map((row) => structuredClone(row)),
      }),
      save: async ({ tenant, model }) => {
        const key = tenant + model.code;
        if (db[schema].has(key)) throw new Error("duplicate");
        db[schema].set(key, { ...structuredClone(model), tenant, revision: 0 });
      },
      update: async ({ tenant, query, model }) => {
        const row = db[schema].get(tenant + query.code);
        if (!row || row.revision !== query.revision)
          throw new Error("stale revision");
        Object.assign(row, structuredClone(model), {
          revision: row.revision + 1,
        });
      },
    };
  }
});
test("Web inbox and rendered reviewer comment survive replay without duplicate records", async () => {
  const first = await runtime.request(request, command),
    again = await runtime.request(request, command);
  assert.equal(first.status, "DELIVERED");
  assert.equal(first.intentCode, again.intentCode);
  assert.equal(db.CommsInboxMessage.size, 1);
  assert.equal(
    [...db.CommsInboxMessage.values()][0].body,
    command.variables.comment,
  );
  assert.equal(db.CommsDeliveryAttempt.size, 1);
});
test("changed command under same key is rejected; another tenant stays isolated", async () => {
  await runtime.request(request, command);
  await assert.rejects(
    runtime.request(request, { ...command, recipientId: "OTHER" }),
    /idempotency conflict/,
  );
  const other = await runtime.request(
    { tenant: "other", authData: { tenant: "other" } },
    command,
  );
  assert.equal(other.status, "DELIVERED");
  assert.equal(db.CommsInboxMessage.size, 2);
});
test("competing Telegram claims invoke the provider once", async () => {
  const results = await Promise.allSettled([
    runtime.request(request, { ...command, channel: "TELEGRAM" }),
    runtime.request(request, { ...command, channel: "TELEGRAM" }),
  ]);
  assert(results.some((r) => r.status === "fulfilled"));
  assert.equal(sends, 1);
  assert.equal(db.CommsIntent.size, 1);
});
test("uncertain Telegram send cannot be retried blindly", async () => {
  SERVICE.TelegramTest.deliver = async () => {
    sends++;
    return { status: "UNCERTAIN", responseCode: "TIMEOUT" };
  };
  const result = await runtime.request(request, {
    ...command,
    channel: "TELEGRAM",
  });
  assert.equal(result.status, "UNCERTAIN");
  await assert.rejects(
    runtime.retry(request, result.intentCode),
    /operator review/,
  );
  assert.equal(sends, 1);
  assert.equal([...db.CommsDeliveryAttempt.values()][0].status, "UNCERTAIN");
});
test("expired external claims become uncertain without a new provider call", async () => {
  const result = await runtime.request(request, {
    ...command,
    channel: "TELEGRAM",
  });
  const row = db.CommsIntent.get("t" + result.intentCode);
  row.status = "DELIVERING";
  row.leaseExpiresAt = new Date(0);
  assert.equal((await runtime.deliver(request, row.code)).status, "UNCERTAIN");
  assert.equal(sends, 1);
});
test("known failed sends persist bounded retry and obey its earliest time", async () => {
  SERVICE.TelegramTest.deliver = async () => {
    sends++;
    return { status: "RETRY_PENDING" };
  };
  const first = await runtime.request(request, {
    ...command,
    channel: "TELEGRAM",
  });
  assert.equal(first.status, "RETRY_PENDING");
  await runtime.retry(request, first.intentCode);
  assert.equal(sends, 1);
  db.CommsIntent.get("t" + first.intentCode).nextAttemptAt = new Date(0);
  await runtime.retry(request, first.intentCode);
  assert.equal(sends, 2);
  assert.equal(db.CommsDeliveryAttempt.size, 2);
});
test("suppression prevents initial and pending delivery; future suppression does not apply early", async () => {
  db.CommsSuppression.set("x", {
    tenant: "t",
    recipientId: command.recipientId,
    purpose: command.purpose,
    channel: "IN_APP",
    activeFrom: new Date(0),
  });
  assert.equal((await runtime.request(request, command)).status, "SUPPRESSED");
  assert.equal(db.CommsInboxMessage.size, 0);
  db.CommsSuppression.get("x").activeFrom = new Date(Date.now() + 60000);
  assert.equal(
    (await runtime.request(request, { ...command, idempotencyKey: "later" }))
      .status,
    "DELIVERED",
  );
});
test("undeclared variables, invalid channels and unauthorized sources do not persist intents", async () => {
  await assert.rejects(
    runtime.request(request, { ...command, sourceModule: "evil" }),
  );
  await assert.rejects(
    runtime.request(request, { ...command, variables: { secret: "no" } }),
  );
  await assert.rejects(
    runtime.request(request, { ...command, channel: "EMAIL" }),
  );
  assert.equal(db.CommsIntent.size, 0);
});
test("Telegram uses verified destination and plain text, handles accepted, rejected and uncertain transport", async () => {
  process.env.COMMS_TEST_TOKEN = "123:test-placeholder";
  SERVICE.DefaultModuleService = {
    invokeModule: async () => ({
      data: {
        allowed: true,
        provider: "TELEGRAM",
        subject: "42",
        applicationSubject: "123",
        credentialReference: "COMMS_TEST_TOKEN",
      },
    }),
  };
  const args = {
    request,
    intent: { ...command, renderedContent: { body: "<b>literal</b>" } },
    policy: { credentialReferences: ["COMMS_TEST_TOKEN"] },
  };
  const success = await telegram.deliver(args, async (url, options) => {
    const body = JSON.parse(options.body);
    assert.equal(body.chat_id, "42");
    assert.equal(body.parse_mode, undefined);
    assert.equal(body.text, "<b>literal</b>");
    return { json: async () => ({ ok: true, result: { message_id: 4 } }) };
  });
  assert.equal(success.status, "DELIVERED");
  assert.equal(
    (
      await telegram.deliver(args, async () => {
        throw new Error("network");
      })
    ).status,
    "UNCERTAIN",
  );
  assert.equal(
    (
      await telegram.deliver(args, async () => ({
        json: async () => ({ ok: false, error_code: 429 }),
      }))
    ).status,
    "RETRY_PENDING",
  );
  delete process.env.COMMS_TEST_TOKEN;
});
test("uncertain delivery needs a current revision, explicit decision and reason; resolution never sends", async () => {
  SERVICE.TelegramTest.deliver = async () => {
    sends++;
    return { status: "UNCERTAIN" };
  };
  const intent = await runtime.request(request, {
    ...command,
    channel: "TELEGRAM",
  });
  const decision = {
    expectedRevision: intent.revision,
    confirmed: true,
    action: "AUTHORIZE_RESEND",
    reason: "Checked chat; delivery could not be confirmed",
    operatorRef: { module: "profile", schema: "employee", code: "approver" },
    sourceModule: "eWaste",
    sourceCode: "S1",
  };
  await assert.rejects(
    runtime.resolveUncertain(request, intent.intentCode, {
      ...decision,
      confirmed: false,
    }),
  );
  await assert.rejects(
    runtime.resolveUncertain(request, intent.intentCode, {
      ...decision,
      expectedRevision: 999,
    }),
  );
  await assert.rejects(
    runtime.resolveUncertain(request, intent.intentCode, {
      ...decision,
      sourceCode: "OTHER",
    }),
  );
  const resolved = await runtime.resolveUncertain(
    request,
    intent.intentCode,
    decision,
  );
  assert.equal(resolved.status, "RETRY_PENDING");
  assert.equal(sends, 1);
  assert.equal(
    (await runtime.read(request, intent.intentCode)).reconciliation.length,
    1,
  );
  await assert.rejects(
    runtime.resolveUncertain(request, intent.intentCode, decision),
  );
  SERVICE.TelegramTest.deliver = async () => {
    sends++;
    return { status: "DELIVERED" };
  };
  await runtime.retry(request, intent.intentCode);
  assert.equal(sends, 2);
});
test("optional terminal fields remain valid typed values for Mongo validators", async () => {
  const result = await runtime.request(request, command);
  const record = await runtime.read(request, result.intentCode);
  assert.equal(record.status, "DELIVERED");
  assert.notEqual(record.nextAttemptAt, null);
  assert.notEqual(record.providerReference, null);
});
