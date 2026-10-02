/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module smtpCommsProvider/test/smtpRuntimeAdapter @description Verifies provider binding, TLS, recipients, secrecy and real loopback SMTP acceptance. @owner smtpCommsProvider @layer test */
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const net = require("node:net");
const original = require("../src/service/defaultSmtpCommunicationProviderService");
const defaults = require("../config/properties").smtpCommsProvider;

function fixture() {
  const config = {
    smtpCommsProvider: {
      ...defaults,
      mode: "SMTP",
      enabled: true,
      sandboxOnly: false,
      credentialReference: "mail-secret",
      senderReference: "mail-sender",
      allowedRecipients: ["recipient@example.test"],
      smtp: {
        host: "smtp.example.test",
        port: 587,
        secure: false,
        requireTLS: true,
      },
    },
    runtimeConfiguration: {
      credentials: {
        "mail-secret": {
          user: "sender@example.test",
          pass: "test-only-not-a-live-secret",
        },
      },
    },
    communication: {
      senders: {
        "mail-sender": { address: "sender@example.test", name: "Example test" },
      },
    },
  };
  global.CONFIG = { get: (name) => config[name] };
  global.SERVICE = {};
  const calls = [];
  const owner = {
    ...original,
    createSmtpTransport: (options) => {
      const call = { options, closed: false };
      calls.push(call);
      return {
        sendMail: async (mail) => {
          call.mail = mail;
          return { accepted: ["recipient@example.test"], rejected: [] };
        },
        close: () => {
          call.closed = true;
        },
      };
    },
  };
  const input = {
    request: { tenant: "testTenant", authData: { tenant: "testTenant" } },
    policy: {
      type: "SMTP",
      code: "smtp",
      service: "DefaultSmtpCommunicationProviderService",
    },
    intent: {
      tenant: "testTenant",
      channel: "EMAIL",
      status: "DELIVERING",
      code: "COMM_test01",
      idempotencyKey: "intent-test-1",
      recipientAddressReference: "recipient@example.test",
      leaseExpiresAt: new Date(Date.now() + 60000),
      expiresAt: new Date(Date.now() + 120000),
      renderedContent: {
        subject: "Verification",
        body: "A test message, not a live OTP.",
      },
    },
  };
  return { config, calls, owner, input };
}

test("durable dispatcher envelope invokes the existing provider with TLS and bounded content", async () => {
  const f = fixture();
  const result = await f.owner.deliver(f.input);
  assert.equal(result.status, "DELIVERED");
  assert.equal(result.responseCode, "SUC_COMMS_SMTP_ACCEPTED");
  assert.equal(f.calls.length, 1);
  assert.equal(f.calls[0].closed, true);
  const options = f.calls[0].options;
  assert.equal(options.requireTLS, true);
  assert.equal(options.tls.rejectUnauthorized, true);
  assert.equal(options.disableFileAccess, true);
  assert.equal(options.disableUrlAccess, true);
  assert.equal(options.pool, false);
  assert.equal(options.logger, false);
  assert.equal(options.debug, false);
  assert.equal(options.maxRecipients, 1);
  assert.deepEqual(f.calls[0].mail.envelope.to, ["recipient@example.test"]);
  assert.equal(f.calls[0].mail.raw, undefined);
  assert.equal(f.calls[0].mail.attachments, undefined);
  for (const privateValue of [
    "test-only-not-a-live-secret",
    "sender@example.test",
    "recipient@example.test",
    "A test message",
  ])
    assert.ok(!JSON.stringify(result).includes(privateValue));
});

test("the legacy injected sandbox contract remains available", async () => {
  const f = fixture();
  const result = await f.owner.deliver(
    {
      channel: "EMAIL",
      intentCode: "I1",
      idempotencyKey: "K1",
      recipientAddressReference: "ref",
      rendered: { body: "test" },
    },
    {
      resolveCredential: async () => "fake",
      send: async () => ({ reference: "K1", code: "202" }),
    },
    {
      enabled: true,
      sandboxOnly: true,
      liveQualified: false,
      endpoint: "https://sandbox.invalid",
      credentialReference: "ref",
      senderReference: "sender",
    },
  );
  assert.deepEqual(result, {
    status: "DELIVERED",
    providerReference: "K1",
    responseCode: "202",
    sandbox: true,
  });
  assert.equal(f.calls.length, 0);
});

test("durable sandbox email checks tenant/lease and projects MIME strings without private provenance", async () => {
  const f = fixture();
  f.config.smtpCommsProvider.mode = "SANDBOX";
  f.config.smtpCommsProvider.sandboxOnly = true;
  f.config.smtpCommsProvider.endpoint = "https://sandbox.invalid";
  f.config.smtpCommsProvider.sandboxTransportService = "SandboxFixture";
  let sent;
  SERVICE.SandboxFixture = {
    resolveCredential: async () => "fixture",
    send: async (value) => {
      sent = value;
      return { reference: "fixture" };
    },
  };
  f.input.intent.renderedContent.html = "<p>Fixture</p>";
  f.input.intent.renderedContent.templateIdentity = { checksum: "private" };
  assert.equal((await f.owner.deliver(f.input)).status, "DELIVERED");
  assert.equal(sent.rendered.html, "<p>Fixture</p>");
  assert.equal(sent.rendered.templateIdentity, undefined);
  sent = undefined;
  f.input.intent.tenant = "other";
  assert.equal((await f.owner.deliver(f.input)).status, "FAILED");
  assert.equal(sent, undefined);
});

test("HTML is an optional bounded MIME alternative, never a replacement for plain text", async () => {
  const f = fixture();
  f.input.intent.renderedContent.html = "<p>Safe test content</p>";
  assert.equal((await f.owner.deliver(f.input)).status, "DELIVERED");
  assert.equal(f.calls[0].mail.html, "<p>Safe test content</p>");
  assert.equal(f.calls[0].mail.text, f.input.intent.renderedContent.body);
  f.input.intent.renderedContent.html = { path: "/private/file" };
  assert.equal((await f.owner.deliver(f.input)).status, "FAILED");
  f.input.intent.renderedContent.html = "x".repeat(
    f.config.smtpCommsProvider.maximumContentBytes,
  );
  assert.equal((await f.owner.deliver(f.input)).status, "FAILED");
  assert.equal(f.calls.length, 1);
});

test("disabled or unconfigured runtime never creates an SMTP transport", async () => {
  const f = fixture();
  f.config.smtpCommsProvider.enabled = false;
  assert.equal((await f.owner.deliver(f.input)).status, "UNCONFIGURED");
  f.config.smtpCommsProvider.enabled = true;
  delete f.config.runtimeConfiguration.credentials["mail-secret"];
  assert.equal((await f.owner.deliver(f.input)).status, "UNCONFIGURED");
  assert.equal(f.calls.length, 0);
});

for (const change of [
  { secure: false, requireTLS: false },
  { host: "not-local.example.test", allowInsecureLoopback: true },
  { port: 465, secure: false },
  { tls: { rejectUnauthorized: false } },
  { ignoreTLS: true },
  { port: 0 },
]) {
  test("unsafe SMTP policy is refused: " + JSON.stringify(change), async () => {
    const f = fixture();
    Object.assign(f.config.smtpCommsProvider.smtp, change);
    assert.equal((await f.owner.deliver(f.input)).status, "UNCONFIGURED");
    assert.equal(f.calls.length, 0);
  });
}

for (const change of [
  { tenant: "other" },
  { channel: "SMS" },
  { status: "ACCEPTED" },
  { leaseExpiresAt: "2000-01-01" },
]) {
  test(
    "unclaimed or cross-tenant message is rejected: " + JSON.stringify(change),
    async () => {
      const f = fixture();
      Object.assign(f.input.intent, change);
      assert.equal((await f.owner.deliver(f.input)).status, "FAILED");
      assert.equal(f.calls.length, 0);
    },
  );
}

test("expired intent is suppressed before any credential or transport use", async () => {
  const f = fixture();
  f.input.intent.expiresAt = new Date(0);
  assert.equal((await f.owner.deliver(f.input)).status, "SUPPRESSED");
  assert.equal(f.calls.length, 0);
});

test("recipient allowlist and sender-account binding are enforced", async () => {
  const f = fixture();
  f.input.intent.recipientAddressReference = "other@example.test";
  assert.equal((await f.owner.deliver(f.input)).status, "SUPPRESSED");
  f.input.intent.recipientAddressReference = "recipient@example.test";
  f.config.communication.senders["mail-sender"].address = "alias@example.test";
  assert.equal((await f.owner.deliver(f.input)).status, "SUPPRESSED");
  assert.equal(f.calls.length, 0);
});

test("controlled SMTP cannot silently become unrestricted production mail", async () => {
  const f = fixture();
  f.config.smtpCommsProvider.testOnly = false;
  assert.equal((await f.owner.deliver(f.input)).status, "UNCONFIGURED");
  f.config.smtpCommsProvider.testOnly = true;
  f.config.smtpCommsProvider.allowedRecipients = [];
  assert.equal((await f.owner.deliver(f.input)).status, "UNCONFIGURED");
  assert.equal(f.calls.length, 0);
});

for (const content of [
  { subject: "unsafe\r\nBcc: someone", body: "text" },
  { subject: "test", body: { path: "/private" } },
]) {
  test("non-string or header-injecting content cannot reach the library", async () => {
    const f = fixture();
    f.input.intent.renderedContent = content;
    assert.equal((await f.owner.deliver(f.input)).status, "FAILED");
    assert.equal(f.calls.length, 0);
  });
}

test("credentials are resolved again after rotation rather than retained in a pool", async () => {
  const f = fixture();
  await f.owner.deliver(f.input);
  f.config.runtimeConfiguration.credentials["mail-secret"].pass =
    "rotated-fake-value";
  await f.owner.deliver(f.input);
  assert.notEqual(f.calls[0].options.auth.pass, f.calls[1].options.auth.pass);
});

test("runtime store takes precedence and OAuth is passed only as a credential", async () => {
  const f = fixture();
  f.config.runtimeConfiguration.credentials["mail-secret"] = {
    type: "OAuth2",
    user: "sender@example.test",
    accessToken: "fake-token",
  };
  f.config.secureConfiguration = {
    credentials: {
      "mail-secret": { user: "sender@example.test", pass: "fallback-fake" },
    },
  };
  const result = await f.owner.deliver(f.input);
  assert.equal(f.calls[0].options.auth.type, "OAuth2");
  assert.equal(f.calls[0].options.auth.accessToken, "fake-token");
  assert.ok(!JSON.stringify(result).includes("fake-token"));
});

for (const [error, expected] of [
  [{ code: "EAUTH", message: "private" }, "UNCONFIGURED"],
  [{ responseCode: 450 }, "RETRY_PENDING"],
  [{ responseCode: 550 }, "FAILED"],
  [{ code: "ETIMEDOUT", message: "private" }, "UNCERTAIN"],
]) {
  test(
    "transport failure has a safe non-replaying outcome: " + expected,
    async () => {
      const f = fixture();
      let attempts = 0;
      f.owner.createSmtpTransport = () => ({
        sendMail: async () => {
          attempts++;
          throw error;
        },
        close: () => {},
      });
      const result = await f.owner.deliver(f.input);
      assert.equal(result.status, expected);
      assert.equal(attempts, 1);
      assert.ok(!JSON.stringify(result).includes("private"));
    },
  );
}

/** A loopback-only SMTP fixture, not application transport or another runtime service. */
async function smtpFixture(onMessage) {
  const sockets = new Set();
  const server = net.createServer((socket) => {
    sockets.add(socket);
    socket.on("close", () => sockets.delete(socket));
    socket.setEncoding("utf8");
    socket.write("220 localhost test SMTP\r\n");
    let pending = "",
      data = false,
      message = "";
    socket.on("data", (chunk) => {
      pending += chunk;
      let boundary;
      while ((boundary = pending.indexOf("\r\n")) >= 0) {
        const line = pending.slice(0, boundary);
        pending = pending.slice(boundary + 2);
        if (data) {
          if (line === ".") {
            data = false;
            onMessage(message);
            message = "";
            socket.write("250 Accepted for local test\r\n");
          } else message += line + "\r\n";
        } else if (/^EHLO|^HELO/.test(line))
          socket.write("250-localhost\r\n250 AUTH PLAIN\r\n");
        else if (/^AUTH /.test(line))
          socket.write("235 Authentication accepted\r\n");
        else if (/^MAIL FROM:|^RCPT TO:/.test(line)) socket.write("250 OK\r\n");
        else if (line === "DATA") {
          data = true;
          socket.write("354 Send test data\r\n");
        } else if (line === "QUIT") socket.end("221 Bye\r\n");
        else socket.write("502 Not supported\r\n");
      }
    });
    socket.on("error", () => {});
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  return {
    port: server.address().port,
    close: async () => {
      for (const socket of sockets) socket.destroy();
      await new Promise((resolve) => server.close(resolve));
    },
  };
}

test("installed Nodemailer completes a real loopback SMTP exchange without external delivery", async () => {
  const messages = [],
    server = await smtpFixture((message) => messages.push(message));
  try {
    const f = fixture();
    f.owner.createSmtpTransport = original.createSmtpTransport;
    f.input.intent.renderedContent.html =
      "<p>HTML alternative for a local fixture.</p>";
    f.config.smtpCommsProvider.smtp = {
      host: "127.0.0.1",
      port: server.port,
      secure: false,
      requireTLS: false,
      allowInsecureLoopback: true,
    };
    const result = await f.owner.deliver(f.input);
    assert.equal(result.status, "DELIVERED");
    assert.equal(messages.length, 1);
    assert.match(messages[0], /A test message, not a live OTP/);
    assert.match(messages[0], /multipart\/alternative/);
    assert.match(messages[0], /Content-Type: text\/plain/);
    assert.match(messages[0], /Content-Type: text\/html/);
    assert.match(messages[0], /HTML alternative for a local fixture/);
    assert.equal(result.responseCode, "SUC_COMMS_SMTP_ACCEPTED");
  } finally {
    await server.close();
  }
});

test("real transport refuses a server without STARTTLS when requireTLS is enabled", async () => {
  const messages = [],
    server = await smtpFixture((message) => messages.push(message));
  try {
    const f = fixture();
    f.owner.createSmtpTransport = original.createSmtpTransport;
    f.config.smtpCommsProvider.smtp = {
      host: "127.0.0.1",
      port: server.port,
      secure: false,
      requireTLS: true,
      allowInsecureLoopback: false,
    };
    const result = await f.owner.deliver(f.input);
    assert.notEqual(result.status, "DELIVERED");
    assert.equal(messages.length, 0);
  } finally {
    await server.close();
  }
});

test("a malformed accepted-recipient reply remains uncertain, not safe to resend", async () => {
  const f = fixture();
  f.owner.createSmtpTransport = () => ({
    sendMail: async () => ({ accepted: [{}], rejected: [] }),
    close: () => {},
  });
  assert.equal((await f.owner.deliver(f.input)).status, "UNCERTAIN");
});

test("cleanup cannot erase a positively acknowledged send or trigger replay", async () => {
  const f = fixture();
  let attempts = 0;
  f.owner.createSmtpTransport = () => ({
    sendMail: async () => {
      attempts++;
      return { accepted: ["recipient@example.test"], rejected: [] };
    },
    close: () => {
      throw new Error("private");
    },
  });
  assert.equal((await f.owner.deliver(f.input)).status, "DELIVERED");
  assert.equal(attempts, 1);
});

test("health distinguishes configuration from unobserved transport and mailbox readiness", async () => {
  const f = fixture();
  const state = await f.owner.health();
  assert.deepEqual(state, {
    code: "smtp",
    status: "CONFIGURED",
    liveQualified: false,
    transportVerified: false,
  });
  assert.equal(f.calls.length, 0);
});

test("the actual durable dispatcher and existing provider compose without a signature adapter at the caller", async () => {
  const f = fixture();
  const privateEntries = new WeakSet();
  global.SERVICE.DefaultLoggerService = {
    runSensitiveOperation: async (request, operation) => {
      assert.equal(
        privateEntries.has(request),
        false,
        "Worker entry is detached",
      );
      privateEntries.add(request);
      return operation();
    },
    assertSensitiveRequest: (request) =>
      assert(
        privateEntries.has(request),
        "Exact protected worker request is required",
      ),
  };
  const deliver = f.owner.deliver;
  f.owner.deliver = async function (value) {
    assert(
      privateEntries.has(value.request),
      "Provider receives the admitted worker envelope",
    );
    assert.notEqual(value.request, f.input.request);
    return deliver.call(this, value);
  };
  const runtime = {
    ...require("../../commsCore/src/service/defaultCommunicationRuntimeService"),
  };
  const core = require("../../commsCore/src/service/defaultCommunicationCoreService");
  f.config.communication = {
    ...require("../../commsCore/config/properties").communication,
    ...f.config.communication,
    trustedSourceModules: ["profile"],
    providerTypes: require("../config/properties").communication.providerTypes,
    providers: { EMAIL: { type: "SMTP" } },
    templates: {
      verificationTest: {
        code: "verificationTest",
        version: 1,
        status: "ACTIVE",
        purpose: "TEST",
        channels: ["EMAIL"],
        sourceModules: ["profile"],
        declaredVariables: ["message"],
        subjectTemplate: "Controlled test",
        bodyTemplate: "{{message}}",
      },
    },
  };
  global.SERVICE.DefaultCommunicationCoreService = core;
  global.SERVICE.DefaultSmtpCommunicationProviderService = f.owner;
  const stores = {};
  for (const name of [
    "CommsIntent",
    "CommsDeliveryAttempt",
    "CommsSuppression",
  ]) {
    stores[name] = new Map();
    global.SERVICE["Default" + name + "Service"] = {
      get: async ({ query }) => ({
        code: "SUC_DBS_00000",
        result: [...stores[name].values()].filter((row) =>
          Object.entries(query).every(([key, value]) => row[key] === value),
        ),
      }),
      save: async ({ model }) => {
        if (stores[name].has(model.code)) throw new Error("duplicate");
        stores[name].set(model.code, { ...model, revision: 1 });
        return { code: "SUC_DBS_00000", result: model };
      },
      update: async ({ query, model }) => {
        const row = stores[name].get(query.code);
        if (!row || row.revision !== query.revision)
          throw new Error("revision conflict");
        stores[name].set(row.code, {
          ...row,
          ...model,
          revision: row.revision + 1,
        });
        return {
          code: "SUC_DBS_00000",
          result: { acknowledged: true, matchedCount: 1 },
        };
      },
    };
  }
  const command = {
    sourceModule: "profile",
    sourceType: "TEST",
    sourceCode: "test-flow",
    templateCode: "verificationTest",
    recipientId: "test-recipient",
    recipientAddressReference: "recipient@example.test",
    purpose: "TEST",
    channel: "EMAIL",
    locale: "en",
    idempotencyKey: "test-dispatch-once",
    variables: { message: "Only test content." },
    expiresAt: new Date(Date.now() + 120000),
  };
  const first = await runtime.request(f.input.request, command);
  assert.equal(first.status, "DELIVERED");
  assert.equal(f.calls.length, 1);
  const second = await runtime.request(f.input.request, command);
  assert.equal(second.intentCode, first.intentCode);
  assert.equal(f.calls.length, 1);
  assert.equal(stores.CommsDeliveryAttempt.size, 1);
  await assert.rejects(
    runtime.request(f.input.request, {
      ...command,
      variables: { message: "Changed" },
    }),
    /idempotency conflict/,
  );
  assert.equal(f.calls.length, 1);
});
