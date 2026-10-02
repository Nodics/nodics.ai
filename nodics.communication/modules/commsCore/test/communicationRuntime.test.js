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
  authData: {
    tenant: "t",
    principalType: "service",
    entCode: "enterprise",
  },
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
  const privateEntries = new WeakSet();
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
    DefaultLoggerService: {
      runSensitiveOperation: async (request, operation) => {
        privateEntries.add(request);
        return operation();
      },
      assertSensitiveRequest: (request) =>
        assert(privateEntries.has(request)),
    },
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
        code: "SUC_FIXTURE_READ",
        result: [...db[schema].values()]
          .filter(
            (row) =>
              row.tenant === tenant &&
              Object.entries(query).every(
                ([key, val]) => row[key] === val,
              ),
          )
          .map((row) => structuredClone(row)),
      }),
      save: async ({ tenant, model }) => {
        const key = tenant + model.code;
        if (db[schema].has(key)) throw new Error("duplicate");
        db[schema].set(key, {
          ...structuredClone(model),
          tenant,
          revision: 1,
        });
        return {
          code: "SUC_FIXTURE_SAVE",
          result: structuredClone(db[schema].get(key)),
        };
      },
      update: async ({ tenant, query, model }) => {
        const row = db[schema].get(tenant + query.code);
        if (!row || row.revision !== query.revision)
          throw new Error("stale revision");
        Object.assign(row, structuredClone(model), {
          revision: row.revision + 1,
        });
        return { code: "SUC_FIXTURE_UPDATE", result: { matchedCount: 1 } };
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

test("resource rendering is frozen for retries and replay survives resource removal", async () => {
  const templates = require("../src/service/defaultCommunicationTemplateService");
  const path = require("node:path");
  const profile = {
    name: "profile",
    path: path.resolve(
      __dirname,
      "../../../../nodics.platform/modules/profile",
    ),
  };
  const previous = global.NODICS;
  global.NODICS = {
    getIndexedModules: () => new Map([["profile", profile]]),
    getRawModule: () => profile,
  };
  try {
    policy.trustedSourceModules = ["profile"];
    policy.providers.EMAIL = { service: "EmailFixture" };
    SERVICE.DefaultCommunicationTemplateService = templates;
    const contents = [];
    SERVICE.EmailFixture = {
      deliver: async ({ intent }) => {
        contents.push(structuredClone(intent.renderedContent));
        return {
          status: contents.length === 1 ? "RETRY_PENDING" : "DELIVERED",
        };
      },
    };
    const email = {
      ...command,
      sourceModule: "profile",
      channel: "EMAIL",
      templateCode: "profile.employee.emailVerification",
      purpose: "EMPLOYEE_EMAIL_VERIFICATION",
      expiresAt: "2099-01-01T00:00:00Z",
      variables: {
        verificationCode: "123456",
        expiresAt: "2099-01-01T00:00:00Z",
      },
    };
    const result = await runtime.request(request, email);
    assert.equal(result.status, "RETRY_PENDING");
    assert.match(contents[0].html, /123456/);
    assert.match(contents[0].body, /01 Jan 2099, 00:00:00 UTC/);
    assert.equal(email.variables.expiresAt, email.expiresAt);
    assert.equal(
      db.CommsIntent.get("t" + result.intentCode).expiresAt,
      email.expiresAt,
    );
    assert.equal(
      db.CommsIntent.get("t" + result.intentCode).variablesHash,
      core.hash(email.variables),
    );
    policy.rendering = {
      ...policy.rendering,
      dateTime: { locale: "en-GB", timeZone: "Asia/Dubai" },
    };
    assert.match(contents[0].templateIdentity.checksum, /^[a-f0-9]{64}$/);
    SERVICE.DefaultCommunicationTemplateService = {
      resolve: () => {
        throw new Error("Resource removed");
      },
    };
    assert.equal(
      (await runtime.request(request, email)).intentCode,
      result.intentCode,
    );
    db.CommsIntent.get("t" + result.intentCode).nextAttemptAt = new Date(
      0,
    );
    assert.equal(
      (await runtime.retry(request, result.intentCode)).status,
      "DELIVERED",
    );
    assert.deepEqual(contents[1], contents[0]);
    assert.equal(JSON.stringify(result).includes("123456"), false);
  } finally {
    global.NODICS = previous;
  }
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

test("SMS resource flows through durable claims, sandbox text transport and replay without resending", async () => {
  const path = require("node:path");
  const sms = require("../../smsCommsProvider/src/service/defaultSmsCommunicationProviderService");
  const templates = require("../src/service/defaultCommunicationTemplateService");
  const module = {
    name: "commsCore",
    path: path.resolve(__dirname, ".."),
  };
  const previous = global.NODICS;
  global.NODICS = {
    getIndexedModules: () => new Map([["commsCore", module]]),
    getRawModule: () => module,
  };
  try {
    policy.trustedSourceModules = ["commsCore"];
    policy.templateResources = structuredClone(policy.templateResources);
    policy.templateResources.selections.COMMUNICATION_RUNTIME_NOTICE = true;
    policy.providers.SMS = {
      service: "DefaultSmsCommunicationProviderService",
      enabled: true,
      sandboxOnly: true,
      liveQualified: false,
      endpoint: "https://sandbox.invalid",
      credentialReference: "fixture-secret",
      senderReference: "fixture-sender",
      sandboxTransportService: "SmsFixture",
    };
    SERVICE.DefaultCommunicationTemplateService = templates;
    SERVICE.DefaultSmsCommunicationProviderService = sms;
    let sent;
    SERVICE.SmsFixture = {
      resolveCredential: async () => "fixture-only",
      send: async (value) => {
        sends++;
        sent = value;
        return { reference: "fixture-accepted" };
      },
    };
    const message = {
      ...command,
      channel: "SMS",
      sourceModule: "commsCore",
      templateCode: "COMMUNICATION_RUNTIME_NOTICE",
      purpose: "TRANSACTIONAL",
      variables: { reference: "N1", message: "Fixture SMS only" },
    };
    const result = await runtime.request(request, message);
    assert.equal(result.status, "DELIVERED");
    assert.equal(sends, 1);
    assert.deepEqual(sent.rendered, { body: "Fixture SMS only\n" });
    assert.ok(
      [...db.CommsIntent.values()][0].renderedContent.templateIdentity,
    );
    assert.equal(
      (await runtime.request(request, message)).intentCode,
      result.intentCode,
    );
    assert.equal(sends, 1);
    SERVICE.SmsFixture.send = async () => {
      sends++;
      throw new Error("private network detail");
    };
    const uncertain = await runtime.request(request, {
      ...message,
      idempotencyKey: "another",
    });
    assert.equal(uncertain.status, "UNCERTAIN");
    await assert.rejects(
      runtime.retry(request, uncertain.intentCode),
      /operator review/,
    );
    assert.equal(sends, 2);
  } finally {
    global.NODICS = previous;
  }
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
  assert.equal(
    [...db.CommsDeliveryAttempt.values()][0].status,
    "UNCERTAIN",
  );
});
test("expired external claims become uncertain without a new provider call", async () => {
  const result = await runtime.request(request, {
    ...command,
    channel: "TELEGRAM",
  });
  const row = db.CommsIntent.get("t" + result.intentCode);
  row.status = "DELIVERING";
  row.leaseExpiresAt = new Date(0);
  assert.equal(
    (await runtime.deliver(request, row.code)).status,
    "UNCERTAIN",
  );
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
  assert.equal(
    (await runtime.request(request, command)).status,
    "SUPPRESSED",
  );
  assert.equal(db.CommsInboxMessage.size, 0);
  db.CommsSuppression.get("x").activeFrom = new Date(Date.now() + 60000);
  assert.equal(
    (
      await runtime.request(request, {
        ...command,
        idempotencyKey: "later",
      })
    ).status,
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
  delete process.env.COMMS_TEST_TOKEN;
  SERVICE.DefaultModuleService = {
    invokeModule: async () => ({
      data: {
        allowed: true,
        provider: "TELEGRAM",
        subject: "42",
        applicationSubject: "123",
        credentialReference: "telegram.bot.circa",
      },
    }),
  };
  const args = {
    request,
    intent: { ...command, renderedContent: { body: "<b>literal</b>" } },
    policy: {
      credentialReferences: ["telegram.bot.circa"],
      credentials: {
        "telegram.bot.circa": { value: "123:source-placeholder" },
      },
    },
  };
  CONFIG.get = (key) =>
    key === "runtimeConfiguration"
      ? {
          credentials: {
            "telegram.bot.circa": { value: "123:runtime-placeholder" },
          },
        }
      : key === "communication"
        ? policy
        : undefined;
  const success = await telegram.deliver(args, async (url, options) => {
    assert.equal(
      url,
      "https://api.telegram.org/bot123:runtime-placeholder/sendMessage",
    );
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
  CONFIG.get = (key) => (key === "communication" ? policy : undefined);
  const unconfigured = await telegram.deliver(
    { ...args, policy: { credentialReferences: ["telegram.bot.circa"] } },
    async () => {
      throw new Error("must not send without configured credentials");
    },
  );
  assert.equal(unconfigured.status, "UNCONFIGURED");
  assert.equal(
    unconfigured.responseCode,
    "TELEGRAM_CONFIGURATION_REQUIRED",
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
    operatorRef: {
      module: "profile",
      schema: "employee",
      code: "approver",
    },
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

test("a failed canonical read cannot be interpreted as an absent delivery intent", async () => {
  SERVICE.DefaultCommsIntentService.get = async () => ({
    code: "ERR_STORAGE",
    result: [],
  });
  await assert.rejects(
    runtime.request(request, { ...command, channel: "TELEGRAM" }),
  );
  assert.equal(sends, 0);
  assert.equal(db.CommsIntent.size, 0);
});

test("zero-match claim acknowledgement never permits external delivery", async () => {
  const originalCreate = runtime.create;
  const owner = {
    ...runtime,
    create: async function (schema, context, model) {
      await originalCreate.call(this, schema, context, model);
      if (schema === "CommsIntent")
        SERVICE.DefaultCommsIntentService.update = async () => ({
          code: "SUC_STORAGE",
          result: { matchedCount: 0 },
        });
    },
  };
  await assert.rejects(
    owner.request(request, { ...command, channel: "TELEGRAM" }),
  );
  assert.equal(sends, 0);
});

test("a competing writer's identical claimed state is not proof that this dispatcher won", async () => {
  SERVICE.DefaultCommsIntentService.update = async ({
    tenant,
    query,
    model,
  }) => {
    const row = db.CommsIntent.get(tenant + query.code);
    const revision = row.revision + 1;
    Object.assign(row, structuredClone(model), {
      revision,
      lastMutationId: "another-writer",
    });
    return { code: "SUC_STORAGE", result: { matchedCount: 0 } };
  };
  await assert.rejects(
    runtime.request(request, { ...command, channel: "TELEGRAM" }),
  );
  assert.equal(sends, 0);
});

test("an explicit failed update does not authorize a send after a possibly committed claim", async () => {
  const update = SERVICE.DefaultCommsIntentService.update;
  SERVICE.DefaultCommsIntentService.update = async (command) => {
    await update(command);
    return { code: "ERR_STORAGE", result: { matchedCount: 1 } };
  };
  await assert.rejects(
    runtime.request(request, { ...command, channel: "TELEGRAM" }),
  );
  assert.equal(sends, 0);
});

test("sender context cannot disagree with authenticated tenant", async () => {
  await assert.rejects(
    runtime.request(
      { ...request, tenant: "other" },
      { ...command, channel: "TELEGRAM" },
    ),
  );
  assert.equal(sends, 0);
});

test("unconfigured delivery outcomes are representable by the existing intent and attempt schemas", () => {
  const schema =
    require("../../commsSchema/src/schemas/schemas").commsSchema;
  assert(
    schema.commsIntent.definition.status.enum.includes("UNCONFIGURED"),
  );
  assert(
    schema.commsDeliveryAttempt.definition.status.enum.includes(
      "UNCONFIGURED",
    ),
  );
});
