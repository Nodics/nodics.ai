/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module commsCore/test/communicationTemplateResources @description Exercises real resource resolution, layering, typed rendering and hostile inputs with disposable filesystem fixtures. @owner commsCore @layer test */
const { test, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const owner = require("../src/service/defaultCommunicationTemplateService");
const defaults = require("../config/properties").communication;
let root, layers, policy, previous;
const command = {
  templateCode: "example.verify",
  channel: "EMAIL",
  locale: "en",
};
const manifest = {
  formatVersion: 1,
  code: command.templateCode,
  ownerModule: "example",
  version: 1,
  status: "ACTIVE",
  purpose: "VERIFY",
  channel: "EMAIL",
  sourceModules: ["example"],
  defaultLocale: "en",
  parameters: {
    code: { type: "string", required: true, maximumLength: 100 },
    brand: {
      type: "string",
      required: false,
      maximumLength: 100,
      default: "Example",
    },
  },
};

function write(
  layer,
  file,
  content,
  name = "verification",
  channel = "email",
) {
  const target = path.join(
    layers[layer].path,
    "src/templates",
    channel,
    name,
    file,
  );
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
  return target;
}
beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "nodics-template-"));
  layers = Object.fromEntries(
    [
      "example",
      "project",
      "environment",
      "server",
      "node",
      "inactive",
    ].map((name) => {
      const directory = path.join(root, name);
      fs.mkdirSync(directory);
      return [name, { name, path: directory }];
    }),
  );
  previous = global.NODICS;
  global.NODICS = {
    getIndexedModules: () =>
      new Map([
        ["server", layers.server],
        ["example", layers.example],
        ["project", layers.project],
      ]),
    getRawModule: (name) => layers[name],
    getEnvironmentName: () => "environment",
    getServerRootName: () => "environment",
    getServerName: () => "server",
    getNodeName: () => "node",
  };
  policy = structuredClone(defaults);
  write("example", "template.json", JSON.stringify(manifest));
  write("example", "en/subject.txt", "{{brand}} verification\n");
  write("example", "en/email.txt", "Code: {{code}}");
  write("example", "en/email.html", "<p>Code: {{code}}</p>");
});
afterEach(() => {
  global.NODICS = previous;
  fs.rmSync(root, { recursive: true, force: true });
});

test("default resources render escaped HTML and literal text with private provenance", () => {
  const template = owner.resolve(command, policy);
  const result = owner.render(
    template,
    { code: "<img src=x onerror=alert(1)>" },
    policy,
  );
  assert.equal(result.subject, "Example verification");
  assert.match(result.html, /&lt;img/);
  assert.ok(!result.html.includes("<img"));
  assert.match(result.body, /<img/);
  assert.match(result.templateIdentity.checksum, /^[a-f0-9]{64}$/);
  assert.equal(
    result.templateIdentity.provenance["email.html"].module,
    "example",
  );
  assert.ok(!JSON.stringify(result.templateIdentity).includes("onerror"));
});
test("project and runtime override individual files despite module index order; missing files inherit", () => {
  write("project", "en/subject.txt", "Project {{brand}}");
  write("server", "en/subject.txt", "Server {{brand}}");
  write("environment", "en/email.txt", "Environment code: {{code}}");
  write("node", "en/email.html", "<strong>{{code}}</strong>");
  write("inactive", "en/subject.txt", "Must not participate");
  const template = owner.resolve(command, policy);
  assert.equal(
    owner.render(template, { code: "123456" }, policy).subject,
    "Server Example",
  );
  assert.equal(
    template.resourceIdentity.provenance["email.txt"].module,
    "environment",
  );
  assert.equal(
    template.resourceIdentity.provenance["email.html"].module,
    "node",
  );
  fs.unlinkSync(
    path.join(
      layers.server.path,
      "src/templates/email/verification/en/subject.txt",
    ),
  );
  assert.equal(
    owner.resolve(command, policy).subjectTemplate,
    "Project {{brand}}",
  );
});
test("requested locale outranks default locale, with per-file default fallback", () => {
  write("example", "fr/subject.txt", "Verification FR");
  write("server", "en/subject.txt", "Server EN");
  const template = owner.resolve({ ...command, locale: "fr" }, policy);
  assert.equal(template.subjectTemplate, "Verification FR");
  assert.equal(
    template.resourceIdentity.provenance["email.txt"].locale,
    "en",
  );
});
test("non-active resources require explicit known-owner selection and do not activate services", () => {
  NODICS.getIndexedModules = () => new Map([["project", layers.project]]);
  assert.equal(owner.resolve(command, policy), undefined);
  policy.templateResources.modules.example = true;
  assert.equal(owner.resolve(command, policy).ownerModule, "example");
  policy.templateResources.modules.missing = true;
  assert.throws(
    () => owner.resolve(command, policy),
    /owner is unavailable/,
  );
});
test("disabled resources and unrelated channels do not read files", () => {
  policy.templateResources.enabled = false;
  assert.equal(owner.resolve(command, policy), undefined);
  assert.equal(
    owner.resolve({ ...command, channel: "IN_APP" }, defaults),
    undefined,
  );
});

test("application roots cannot become a parallel presentation owner", () => {
  layers.project.metaData = { nodics: { kind: "application" } };
  write("project", "en/subject.txt", "Forbidden project-root override");
  assert.equal(
    owner.resolve(command, policy).subjectTemplate,
    "{{brand}} verification",
  );
  policy.templateResources.modules.project = true;
  assert.throws(
    () => owner.resolve(command, policy),
    /concrete module owner/,
  );
});
test("optional branding defaults can change but required security parameters cannot default", () => {
  const customized = structuredClone(manifest);
  customized.parameters.brand.default = "Project";
  write("project", "template.json", JSON.stringify(customized));
  assert.equal(
    owner.render(owner.resolve(command, policy), { code: "123" }, policy)
      .subject,
    "Project verification",
  );
  customized.parameters.code.default = "unsafe";
  write("project", "template.json", JSON.stringify(customized));
  assert.throws(
    () => owner.resolve(command, policy),
    /declaration is invalid/,
  );
});
for (const alteration of [
  (m) => {
    m.purpose = "OTHER";
  },
  (m) => {
    m.sourceModules = ["other"];
  },
  (m) => {
    m.ownerModule = "other";
  },
  (m) => {
    m.parameters.code.required = false;
  },
]) {
  test("presentation override cannot widen purpose/source/owner/parameter authority", () => {
    const customized = structuredClone(manifest);
    alteration(customized);
    write("project", "template.json", JSON.stringify(customized));
    assert.throws(
      () => owner.resolve(command, policy),
      /changes its contract/,
    );
  });
}
test("missing, unknown, nested and oversized values reject without revealing values", () => {
  const template = owner.resolve(command, policy);
  for (const variables of [
    {},
    { code: "x", password: "SECRET" },
    { code: {} },
    { code: "x".repeat(101) },
  ])
    assert.throws(
      () => owner.render(template, variables, policy),
      /parameter|not declared/,
    );
});
for (const source of [
  "{{{code}}}",
  '{{lookup this "code"}}',
  "{{#if code}}yes{{/if}}",
  "{{> remote}}",
  "{{constructor}}",
  "{{code.value}}",
  "{{this}}",
]) {
  test("unsupported executable expression rejects: " + source, () => {
    write("project", "en/email.html", source);
    assert.throws(
      () =>
        owner.render(
          owner.resolve(command, policy),
          { code: "x" },
          policy,
        ),
      /prohibited/,
    );
  });
}
test("subjects reject CRLF injection and URL parameters reject unsafe schemes", () => {
  const template = owner.resolve(command, policy);
  assert.throws(
    () =>
      owner.render(
        template,
        { code: "x", brand: "Hello\r\nBcc: bad" },
        policy,
      ),
    /subject is invalid/,
  );
  const url = {
    ...template,
    parameters: {
      link: {
        type: "string",
        required: true,
        maximumLength: 100,
        format: "https-url",
      },
    },
    subjectTemplate: "Continue",
    bodyTemplate: "{{link}}",
    htmlTemplate: '<a href="{{link}}">Continue</a>',
  };
  for (const link of [
    "javascript:alert(1)",
    "http://example.test",
    "https://user:pass@example.test",
  ])
    assert.throws(
      () => owner.render(url, { link }, policy),
      /URL is invalid/,
    );
  assert.match(
    owner.render(url, { link: "https://example.test/?a=1&b=2" }, policy)
      .html,
    /&amp;/,
  );
});
test("path traversal, directory symlinks and malformed manifests fail closed", () => {
  assert.throws(
    () => owner.resolve({ ...command, locale: "../en" }, policy),
    /locale is invalid/,
  );
  fs.mkdirSync(path.join(layers.project.path, "src/templates/email"), {
    recursive: true,
  });
  fs.symlinkSync(
    path.join(layers.example.path, "src/templates/email/verification"),
    path.join(layers.project.path, "src/templates/email/verification"),
  );
  assert.throws(() => owner.resolve(command, policy), /escapes its owner/);
  fs.unlinkSync(
    path.join(layers.project.path, "src/templates/email/verification"),
  );
  write("project", "template.json", "{invalid");
  assert.throws(
    () => owner.resolve(command, policy),
    /manifest is invalid/,
  );
});

for (const html of [
  "<script>alert(1)</script>",
  "<style>{{code}}</style>",
  '<p onclick="run()">Text</p>',
  '<a href="{{code}}">Unsafe untyped URL</a>',
  '<p style="{{code}}">Unsafe CSS</p>',
  '<a href="java&#115;cript:alert(1)">Unsafe URL</a>',
  '<p style="background:url(https://example.test)">External CSS</p>',
]) {
  test(
    "HTML context validation refuses active or untyped markup: " + html,
    () => {
      write("project", "en/email.html", html);
      assert.throws(
        () =>
          owner.render(
            owner.resolve(command, policy),
            { code: "x" },
            policy,
          ),
        /prohibited|URL parameter|URL is invalid/,
      );
    },
  );
}
test("file, catalogue, graph and output bounds reject before delivery", () => {
  policy.templateResources.maximumFileBytes = 8;
  assert.throws(() => owner.resolve(command, policy), /too large/);
  policy = structuredClone(defaults);
  policy.templateResources.maximumLayers = 1;
  assert.throws(() => owner.resolve(command, policy), /layer limit/);
  policy = structuredClone(defaults);
  policy.templateResources.maximumTemplatesPerModule = 1;
  write("example", "template.json", JSON.stringify(manifest), "second");
  assert.throws(() => owner.resolve(command, policy), /catalogue limit/);
  fs.rmSync(path.join(layers.example.path, "src/templates/email/second"), {
    recursive: true,
  });
  policy.rendering.maximumRenderedBytes = 1;
  assert.throws(
    () =>
      owner.render(owner.resolve(command, policy), { code: "x" }, policy),
    /too large/,
  );
});
test("content checksum changes for presentation edits; no rendered value enters identity", () => {
  const first = owner.resolve(command, policy);
  write("project", "en/email.html", "<h1>{{code}}</h1>");
  const second = owner.resolve(command, policy);
  assert.notEqual(
    first.resourceIdentity.checksum,
    second.resourceIdentity.checksum,
  );
  assert.equal(
    owner.render(second, { code: "111" }, policy).templateIdentity
      .checksum,
    owner.render(second, { code: "222" }, policy).templateIdentity
      .checksum,
  );
});
test("SMS is a text-only channel under the same resource contract", () => {
  write(
    "example",
    "template.json",
    JSON.stringify({ ...manifest, channel: "SMS" }),
    "verification",
    "sms",
  );
  write(
    "example",
    "en/message.txt",
    "Code {{code}}",
    "verification",
    "sms",
  );
  const result = owner.render(
    owner.resolve({ ...command, channel: "SMS" }, policy),
    { code: "123" },
    policy,
  );
  assert.equal(result.body, "Code 123");
  assert.equal(result.html, undefined);
});

test("incomplete bundles, duplicate identity and null manifests fail closed", () => {
  fs.unlinkSync(
    path.join(
      layers.example.path,
      "src/templates/email/verification/en/email.html",
    ),
  );
  assert.throws(
    () => owner.resolve(command, policy),
    /bundle is incomplete/,
  );
  write("example", "en/email.html", "<p>{{code}}</p>");
  write("example", "template.json", JSON.stringify(manifest), "duplicate");
  assert.throws(
    () => owner.resolve(command, policy),
    /changes its contract/,
  );
  fs.rmSync(
    path.join(layers.example.path, "src/templates/email/duplicate"),
    {
      recursive: true,
    },
  );
  write("project", "template.json", "null");
  assert.throws(
    () => owner.resolve(command, policy),
    /manifest is invalid/,
  );
});
test("later exported member overrides are honored through the effective service receiver", () => {
  let calls = 0;
  const customized = {
    ...owner,
    interpolate: function (...args) {
      calls++;
      return owner.interpolate.apply(this, args);
    },
  };
  customized.render(
    customized.resolve(command, policy),
    { code: "123" },
    policy,
  );
  assert.equal(calls, 3);
});

for (const [code, channel] of [
  ["profile.employee.emailVerification", "EMAIL"],
  ["profileEmployeeRecoveryCode", "EMAIL"],
  ["profile.contact.emailVerification", "EMAIL"],
  ["profile.contact.smsVerification", "SMS"],
]) {
  test(`Profile ${code} renders readable expiry without changing canonical input`, () => {
    layers.profile = {
      name: "profile",
      path: path.resolve(
        __dirname,
        "../../../../nodics.platform/modules/profile",
      ),
    };
    policy.templateResources.modules.profile = true;
    policy.templateResources.selections[code] = true;
    const template = owner.resolve(
      { templateCode: code, channel, locale: "en" },
      policy,
    );
    const variables = Object.freeze({
      verificationCode: "123456",
      expiresAt: "2026-10-02T09:40:17.000Z",
    });
    const rendered = owner.render(template, variables, policy);
    assert.match(rendered.body, /02 Oct 2026, 09:40:17 UTC/);
    if (channel === "EMAIL")
      assert.match(rendered.html, /02 Oct 2026, 09:40:17 UTC/);
    assert.equal(variables.expiresAt, "2026-10-02T09:40:17.000Z");
    assert.equal(rendered.body.includes(variables.expiresAt), false);
    assert.deepEqual(Object.keys(variables), [
      "verificationCode",
      "expiresAt",
    ]);
  });
}

test("date-time presentation uses explicit layered locale and zone, not host defaults", () => {
  const value = "2026-10-02T09:40:17.000Z";
  assert.equal(
    owner.presentDateTime(value, policy),
    "02 Oct 2026, 09:40:17 UTC",
  );
  policy.rendering.dateTime = { locale: "en-GB", timeZone: "Asia/Dubai" };
  assert.equal(
    owner.presentDateTime(value, policy),
    "02 Oct 2026, 13:40:17 GST",
  );
  policy.rendering.dateTime = { locale: "fr-FR", timeZone: "UTC" };
  assert.match(
    owner.presentDateTime(value, policy),
    /02 oct\. 2026, 09:40:17 UTC/,
  );
  assert.equal(
    owner.presentDateTime("2026-10-02T13:40:17+04:00", policy),
    owner.presentDateTime(value, policy),
  );
});

test("invalid date-time settings and offset-free timestamps fail without leaking inputs", () => {
  for (const value of [
    "PRIVATE",
    "2026-10-02T09:40:17",
    "2026-99-02T09:40:17Z",
  ]) {
    assert.throws(() => owner.presentDateTime(value, policy), {
      message: "Communication date-time presentation is invalid",
    });
  }
  for (const settings of [
    undefined,
    {},
    { locale: "en-GB", timeZone: "PRIVATE" },
    { locale: "PRIVATE_!", timeZone: "UTC" },
    { locale: "zz-ZZ", timeZone: "UTC" },
  ]) {
    policy.rendering.dateTime = settings;
    assert.throws(
      () => owner.presentDateTime("2026-10-02T09:40:17Z", policy),
      { message: "Communication date-time presentation is invalid" },
    );
  }
});

test("presentation is opt-in and existing full overrides preserve the original variable contract", () => {
  const decorated = structuredClone(manifest);
  decorated.parameters.code.presentation = "date-time";
  write("example", "template.json", JSON.stringify(decorated));
  const value = "2026-10-02T09:40:17Z";
  assert.match(
    owner.render(owner.resolve(command, policy), { code: value }, policy)
      .body,
    /09:40:17 UTC/,
  );
  write("project", "template.json", JSON.stringify(manifest));
  assert.equal(
    owner.render(owner.resolve(command, policy), { code: value }, policy)
      .body,
    `Code: ${value}`,
  );
  assert.equal(
    owner.renderLegacy(
      { declaredVariables: ["expiresAt"], bodyTemplate: "{{expiresAt}}" },
      { expiresAt: value },
      policy,
    ).body,
    value,
  );
  decorated.parameters.code.presentation = "execute";
  assert.throws(
    () => owner.validateManifest(decorated, "EMAIL"),
    /declaration is invalid/,
  );
  decorated.parameters.code.presentation = "date-time";
  decorated.parameters.code.format = "https-url";
  assert.throws(
    () => owner.validateManifest(decorated, "EMAIL"),
    /declaration is invalid/,
  );
});

test("date-time member overrides remain escaped and bounded", () => {
  const decorated = structuredClone(manifest);
  decorated.parameters.code.presentation = "date-time";
  write("example", "template.json", JSON.stringify(decorated));
  const customized = { ...owner, presentDateTime: () => "<readable>" };
  const template = customized.resolve(command, policy);
  assert.equal(
    customized.render(template, { code: "2026-10-02T09:40:17Z" }, policy)
      .html,
    "<p>Code: &lt;readable&gt;</p>",
  );
  customized.presentDateTime = () => "x".repeat(101);
  assert.throws(
    () =>
      customized.render(
        template,
        { code: "2026-10-02T09:40:17Z" },
        policy,
      ),
    /presentation exceeds/,
  );
});
