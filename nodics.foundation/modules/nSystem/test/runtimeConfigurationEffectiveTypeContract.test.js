/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nSystem/test/runtimeConfigurationEffectiveTypeContract
 * @description Verifies that empty credential wrappers and malformed effective values cannot claim usable configuration. Synthetic metadata fixtures only.
 * @layer test
 * @owner nSystem
 */
const assert = require("node:assert/strict");
const test = require("node:test");
const owner = require("../src/service/config/defaultRuntimeConfigurationSchemaService");

test("effective credential status requires its declared scalar type, not wrapper presence", async (t) => {
  const previous = global.CONFIG;
  t.after(() => {
    global.CONFIG = previous;
  });
  const field = {
    code: "botToken",
    type: "string",
    sensitive: true,
    required: true,
    path: ["credentials", "test.telegram", "value"],
    credentialReference: "test.telegram",
    pattern: "^\\d+:[^\\s]+$",
  };
  const schema = { ownerModule: "testOwner", fields: [field] };
  const properties = {
    defaultTenant: "testTenant",
    runtimeConfigurationSchemas: { testSchema: schema },
    runtimeConfigurationSecurity: { encryptionKey: null },
  };
  global.CONFIG = { get: (key) => properties[key] };
  for (const wrapper of [
    { value: null },
    { value: undefined },
    { value: {} },
    {},
    [],
    { encryptedValue: { algorithm: "test-envelope" } },
  ]) {
    properties.credentials = { "test.telegram": wrapper };
    const resolved = owner.resolveFieldValue(field);
    assert.equal(resolved, undefined);
    assert.equal(owner.isConfigured(field, resolved), false);
    const response = await owner.getEffectiveConfiguration({
      schemaCode: "testSchema",
    });
    assert.equal(response.data.status, "UNCONFIGURED");
    assert.deepEqual(response.data.missingRequired, ["botToken"]);
    assert.equal(response.data.values.botToken.configured, false);
    assert.equal(response.data.values.botToken.value, undefined);
    assert.equal(response.data.secretPersistence.ready, false);
  }
  properties.credentials = {
    "test.telegram": { value: "123456:synthetic-test-only" },
  };
  assert.equal(
    (await owner.getEffectiveConfiguration({ schemaCode: "testSchema" })).data
      .status,
    "CONFIGURED",
  );
  assert.equal(owner.getSecretPersistenceReadiness(schema).ready, false);
  properties.runtimeConfiguration = {
    credentials: { "test.telegram": { value: {} } },
  };
  assert.equal(
    (await owner.getEffectiveConfiguration({ schemaCode: "testSchema" })).data
      .status,
    "UNCONFIGURED",
    "A malformed first-present source must not be silently replaced by another layer",
  );
  for (const value of [
    null,
    undefined,
    {},
    [],
    false,
    123,
    "placeholder",
    "not-valid",
  ]) {
    assert.equal(owner.isConfigured(field, value), false);
  }
  assert.equal(owner.isConfigured({ pattern: "^.+$" }, {}), false);
  assert.equal(owner.isConfigured({ type: "boolean" }, false), true);
  assert.equal(owner.isConfigured({ type: "boolean" }, "false"), false);
  assert.equal(owner.isConfigured({ type: "number" }, 0), true);
  assert.equal(owner.isConfigured({ type: "number" }, "0"), false);
  assert.equal(owner.isConfigured({ type: "string" }, {}), false);
  assert.equal(owner.unwrapValue({ value: false }), false);
  assert.equal(owner.unwrapValue({ value: 0 }), 0);
  assert.equal(owner.unwrapValue({ value: null }), undefined);
});
