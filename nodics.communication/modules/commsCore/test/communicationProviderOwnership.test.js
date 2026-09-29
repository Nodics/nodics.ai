/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const runtime = require("../src/service/defaultCommunicationRuntimeService");
const defaults = require("../config/properties").communication;

/** @module commsCore/test/communicationProviderOwnership @description Proves inert adapter defaults and explicit deployment selection. @owner commsCore @layer test */
test("provider types do not select or credential a provider", () => {
  assert.deepEqual(defaults.providers, {});
  assert.equal(runtime.providerPolicy(defaults, "TELEGRAM"), undefined);
  assert.equal(defaults.providerTypes.TELEGRAM.credentialReferences, undefined);
});

test("independent customers inherit mechanics and replace credential scopes explicitly", () => {
  const inherited = runtime.providerPolicy({ ...defaults, providers: { TELEGRAM: { type: 'TELEGRAM', credentialReferences: ['partner.bot'] } } }, 'TELEGRAM');
  assert.equal(inherited.service, 'DefaultTelegramCommunicationProviderService');
  assert.equal(inherited.timeoutMilliseconds, 10000);
  assert.deepEqual(inherited.credentialReferences, ['partner.bot']);
  const selected = { type: "TELEGRAM", credentialReferences: ["partner.bot"], timeoutMilliseconds: 3000 };
  const result = runtime.providerPolicy({ ...defaults, providers: { TELEGRAM: selected } }, "TELEGRAM");
  assert.equal(result.service, "DefaultTelegramCommunicationProviderService");
  assert.equal(result.timeoutMilliseconds, 3000);
  assert.deepEqual(result.credentialReferences, ["partner.bot"]);
  assert.equal(selected.service, undefined);
  const legacy = { code: "custom", service: "PartnerProvider" };
  assert.equal(runtime.providerPolicy({ providers: { SMS: legacy } }, "SMS"), legacy);
});

test("invalid types and credential-bearing defaults cannot silently become providers", () => {
  assert.throws(() => runtime.providerPolicy({ ...defaults, providers: { TELEGRAM: { type: "absent" } } }, "TELEGRAM"), /TYPE_INVALID/);
  assert.throws(() => runtime.providerPolicy({
    providerTypes: { injected: { service: "Provider", credentialReferences: ["forbidden"] } },
    providers: { TELEGRAM: { type: "injected" } },
  }, "TELEGRAM"), /TYPE_INVALID/);
});
