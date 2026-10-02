/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module commsCore/test/communicationChannelMigration @description Proves all current email/SMS adoption records select resources, source gating and legacy text use one renderer, and historical releases remain separate. @owner commsCore @layer test */
const { test, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const templates = require("../src/service/defaultCommunicationTemplateService");
const runtime = require("../src/service/defaultCommunicationRuntimeService");
const core = require("../src/service/defaultCommunicationCoreService");
const root = path.resolve(__dirname, "../../../..");
let policy, saved, modules;
beforeEach(() => {
  saved = {
    NODICS: global.NODICS,
    CONFIG: global.CONFIG,
    SERVICE: global.SERVICE,
  };
  modules = Object.fromEntries(
    [
      "commsCore",
      "contactSubmission",
      "customerFeedback",
      "customerReview",
      "testimonial",
    ].map((name) => [
      name,
      {
        name,
        path: path.join(
          root,
          name === "commsCore" ? "nodics.communication" : "nodics.engagement",
          "modules",
          name,
        ),
      },
    ]),
  );
  global.NODICS = {
    getIndexedModules: () => new Map(Object.entries(modules)),
    getRawModule: (name) => modules[name],
  };
  policy = structuredClone(require("../config/properties").communication);
  global.CONFIG = { get: () => policy };
  global.SERVICE = {
    DefaultCommunicationCoreService: core,
    DefaultCommunicationTemplateService: templates,
  };
});
afterEach(() => Object.assign(global, saved));
const manifest = require("../data/manifest.json");
for (const section of Object.values(manifest.sections)) {
  const file = Object.keys(section.files).find((name) =>
    name.endsWith("TemplateVersionData.js"),
  );
  const records = require(path.join(__dirname, "../data", file));
  for (const record of Object.values(records).filter((row) =>
    ["EMAIL", "SMS"].includes(row.channel),
  )) {
    test(
      "current release selects a complete optional resource: " + record.code,
      () => {
        assert.equal(record.subjectTemplate, undefined);
        assert.equal(record.bodyTemplate, undefined);
        assert.equal(record.resourceCode, record.templateCode);
        const command = {
          templateCode: record.templateCode,
          channel: record.channel,
          locale: record.locale,
        };
        assert.equal(
          templates.resolve(command, policy),
          undefined,
          "optional files cannot auto-activate",
        );
        policy.templateResources.selections[record.templateCode] = true;
        const template = templates.resolve(command, policy);
        assert.equal(template.version, record.version);
        assert.equal(template.resourceIdentity.checksum, record.checksum);
        const variables = Object.fromEntries(
          Object.keys(template.parameters).map((name) => [
            name,
            "FAKE <value>",
          ]),
        );
        const output = templates.render(template, variables, policy);
        assert.ok(!output.body.includes("{{"));
        if (record.channel === "EMAIL")
          assert.match(output.html, /&lt;value&gt;/);
        else assert.equal(output.html, undefined);
      },
    );
  }
}
test("published reference activation requires matching source, version and a complete resource", async () => {
  const parent =
    require("../data/sample-v002/records/communication/commsSampleTemplateData").record0;
  const version =
    require("../data/sample-v002/records/communication/commsSampleTemplateVersionData").record0;
  policy.trustedSourceModules = ["contactSubmission", "customerReview"];
  let stored,
    creates = 0;
  const owner = {
    ...runtime,
    read: async () => undefined,
    list: async (schema) =>
      schema === "CommsTemplate"
        ? [parent]
        : schema === "CommsTemplateVersion"
          ? [version]
          : [],
    create: async (schema, request, model) => {
      creates++;
      stored = model;
    },
    deliver: async () => ({ status: "ACCEPTED" }),
  };
  const command = {
    sourceModule: "contactSubmission",
    sourceType: "CONTACT",
    sourceCode: "C1",
    templateCode: parent.code,
    purpose: parent.purpose,
    channel: "EMAIL",
    locale: "en",
    recipientId: "C1",
    recipientAddressReference: "recipient@example.test",
    idempotencyKey: "C1",
    variables: { reference: "C1" },
  };
  await owner.request({ tenant: "fixture" }, command);
  assert.match(stored.renderedContent.html, /C1/);
  assert.equal(stored.templateVersion, 2);
  assert.equal(creates, 1);
  await assert.rejects(
    owner.request(
      { tenant: "fixture" },
      { ...command, sourceModule: "customerReview" },
    ),
    /unavailable/,
  );
  const wrongVersion = {
    ...owner,
    list: async (schema) =>
      schema === "CommsTemplate"
        ? [parent]
        : schema === "CommsTemplateVersion"
          ? [{ ...version, version: 99 }]
          : [],
  };
  await assert.rejects(
    wrongVersion.request({ tenant: "fixture" }, command),
    /reference is unavailable/,
  );
  assert.equal(creates, 1);
});
test("legacy compatibility delegates to the effective renderer and never upgrades markup", () => {
  let calls = 0;
  SERVICE.DefaultCommunicationTemplateService = {
    ...templates,
    render: function (...args) {
      calls++;
      return templates.render.apply(this, args);
    },
  };
  const legacy = {
    declaredVariables: ["reference"],
    subjectTemplate: "Received {{reference}}",
    bodyTemplate: "{{reference}}",
  };
  assert.deepEqual(core.render(legacy, { reference: "<b>text</b>" }, policy), {
    subject: "Received <b>text</b>",
    body: "<b>text</b>",
  });
  assert.equal(calls, 1);
  assert.throws(
    () =>
      core.render(
        { ...legacy, bodyTemplate: "{{{reference}}}" },
        { reference: "x" },
        policy,
      ),
    /prohibited/,
  );
  assert.throws(
    () =>
      core.render(
        { ...legacy, htmlTemplate: "<b>{{reference}}</b>" },
        { reference: "x" },
        policy,
      ),
    /invalid/,
  );
});
test("published records cannot bypass source ownership or mix resource and inline content", async () => {
  const parent =
    require("../data/sample-v002/records/communication/commsSampleTemplateData").record0;
  const version =
    require("../data/sample-v002/records/communication/commsSampleTemplateVersionData").record0;
  policy.trustedSourceModules = ["contactSubmission"];
  const command = {
    sourceModule: "contactSubmission",
    sourceType: "CONTACT",
    sourceCode: "C1",
    templateCode: parent.code,
    purpose: parent.purpose,
    channel: "EMAIL",
    locale: "en",
    recipientId: "C1",
    recipientAddressReference: "fake@example.test",
    idempotencyKey: "C1",
    variables: { reference: "C1" },
  };
  for (const [selectedParent, selectedVersion] of [
    [{ ...parent, sourceModules: undefined }, version],
    [parent, { ...version, bodyTemplate: "inline" }],
    [parent, { ...version, resourceCode: "OTHER" }],
  ]) {
    const owner = {
      ...runtime,
      read: async () => undefined,
      list: async (schema) =>
        schema === "CommsTemplate"
          ? [selectedParent]
          : schema === "CommsTemplateVersion"
            ? [selectedVersion]
            : [],
      create: async () => assert.fail("invalid reference must not persist"),
    };
    await assert.rejects(
      owner.request({ tenant: "fixture" }, command),
      /unavailable|inline presentation|identity is invalid/,
    );
  }
});
test("current import manifests never reference historical inline email releases", () => {
  for (const section of Object.values(manifest.sections)) {
    assert.match(section.sourceRoot, /-v002$/);
    assert.ok(
      Object.keys(section.files).every((file) =>
        file.startsWith(section.sourceRoot + "/"),
      ),
    );
  }
  assert.ok(
    fs.existsSync(
      path.join(
        __dirname,
        "../data/core-v001/records/communication/commsRuntimeDefaultTemplateVersionData.js",
      ),
    ),
  );
});
test("legacy parameter declarations and source sizes remain bounded", () => {
  for (const name of ["constructor", "__proto__", "lookup", "nested.value"]) {
    assert.throws(
      () =>
        core.render(
          { declaredVariables: [name], bodyTemplate: "text" },
          {},
          policy,
        ),
      /declaration is invalid/,
    );
  }
  assert.throws(
    () =>
      core.render(
        {
          declaredVariables: [],
          bodyTemplate: "x".repeat(policy.rendering.maximumRenderedBytes + 1),
        },
        {},
        policy,
      ),
    /exceeds limits/,
  );
});
