/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nSystem/test/runtimeConfigurationEncryptionBinding
 * @description Exercises the optional encryption binding through the real nConfig loader using synthetic environment inputs and in-memory CONFIG only.
 * @layer test
 * @owner nSystem
 */
const assert = require("node:assert/strict");
const test = require("node:test");
const path = require("node:path");
const bindings = require("../../nConfig/src/service/defaultConfigurationBindingService");
const initializer = require("../../nConfig/src/service/DefaultFrameworkInitializerService");
const schemaService = require("../src/service/config/defaultRuntimeConfigurationSchemaService");
const source = require("../config/properties");
const file = path.resolve(__dirname, "../config/properties.js");
const variable = "NODICS_RUNTIME_CONFIGURATION_ENCRYPTION_KEY";
const schema = { fields: [{ code: "credential", sensitive: true }] };

test("optional encryption input resolves through the existing load boundary and retains disabled defaults", (t) => {
  const previousConfig = global.CONFIG;
  const previousNodics = global.NODICS;
  t.after(() => {
    global.CONFIG = previousConfig;
    global.NODICS = previousNodics;
  });
  assert.deepEqual(source.runtimeConfigurationSecurity.encryptionKey, {
    $config: "env",
    name: variable,
    type: "string",
    fallback: null,
  });
  let effective;
  global.CONFIG = {
    getProperties: () => effective,
    setProperties: (properties) => {
      effective = properties;
    },
    get: (key) => effective[key],
  };
  global.NODICS = { getNodicsHome: () => path.resolve(__dirname, "../..") };
  const load = (environmentVariables) => {
    effective = { log: { redaction: { enabled: true } }, inheritedOwner: true };
    const instance = {
      ...initializer,
      LOG: { debug() {} },
      getPropertyBindingContext: () => ({ environmentVariables }),
    };
    instance.loadConfiguration(file);
    return effective;
  };
  for (const environment of [{}, { [variable]: "" }]) {
    const resolved = load(environment);
    assert.equal(resolved.runtimeConfigurationSecurity.encryptionKey, null);
    assert.deepEqual(schemaService.getSecretPersistenceReadiness(schema), {
      required: true,
      ready: false,
      reason: "ENCRYPTION_KEY_REQUIRED",
    });
    assert.equal(resolved.localResetProvider.enabled, false);
    assert.equal(resolved.apiExposure.categories.testExecution.enabled, false);
    assert.equal(resolved.inheritedOwner, true);
    assert.equal(resolved.log.redaction.enabled, true);
  }
  const synthetic = "synthetic-test-only-not-a-deployment-key";
  load({ [variable]: synthetic });
  assert.equal(effective.runtimeConfigurationSecurity.encryptionKey, synthetic);
  assert.equal(schemaService.resolveEncryptionKey().length, 32);
  assert.deepEqual(schemaService.getSecretPersistenceReadiness(schema), {
    required: true,
    ready: true,
    reason: "READY",
  });
  const descriptor = schemaService.describeSchema("example", schema);
  assert.equal(JSON.stringify(descriptor).includes(synthetic), false);
  assert.equal(
    source.runtimeConfigurationSecurity.encryptionKey.$config,
    "env",
  );

  effective = bindings.merge(
    effective,
    bindings.resolve(
      {
        runtimeConfigurationSecurity: { encryptionKey: null },
      },
      effective,
      { environmentVariables: { [variable]: synthetic } },
    ),
  );
  assert.equal(
    schemaService.getSecretPersistenceReadiness(schema).ready,
    false,
  );
  const override = bindings.resolve(
    {
      runtimeConfigurationSecurity: {
        encryptionKey: {
          $config: "env",
          name: "APPROVED_ALTERNATE_KEY",
          type: "string",
          fallback: null,
        },
      },
    },
    effective,
    { environmentVariables: { APPROVED_ALTERNATE_KEY: synthetic } },
  );
  effective = bindings.merge(effective, override);
  assert.equal(schemaService.getSecretPersistenceReadiness(schema).ready, true);
  assert.equal(effective.runtimeConfigurationSecurity.encryptionKey, synthetic);

  // Metadata must remain within nConfig's existing finite descriptor vocabulary.
  assert.throws(
    () =>
      bindings.resolve(
        {
          value: {
            ...source.runtimeConfigurationSecurity.encryptionKey,
            secret: true,
          },
        },
        {},
        { environmentVariables: {} },
      ),
    /Invalid configuration binding declaration/,
  );
});
