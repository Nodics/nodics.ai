/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module commsCore/test/telegramRuntimeConfiguration @description Exercises delivery schema ownership and customization through real nConfig contribution resolution and runtime-role projection. Synthetic in-memory fixtures only. @layer test @owner commsCore */
const assert = require("node:assert/strict");
const test = require("node:test");
const path = require("node:path");
const bindings = require("../../../../nodics.foundation/modules/nConfig/src/service/defaultConfigurationBindingService");
const initializer = require("../../../../nodics.foundation/modules/nConfig/src/service/DefaultFrameworkInitializerService");
const schemaOwner = require("../../../../nodics.foundation/modules/nSystem/src/service/config/defaultRuntimeConfigurationSchemaService");
const delivery = require("../src/service/defaultTelegramCommunicationProviderService");
const runtime = require("../src/service/defaultCommunicationRuntimeService");
const file = path.resolve(__dirname, "../config/properties.js");
const referencePath = [
  "communication",
  "runtimeRoleProfiles",
  "ENGAGEMENT",
  "providers",
  "TELEGRAM",
  "credentialReferences",
  "0",
];

/** Resolves one owner contribution and later application delta without starting a runtime. */
function compose(role, overlay = {}) {
  const context = { environmentVariables: {}, roots: {} };
  let properties = initializer.readPropertyContribution(file, {}, context);
  properties = bindings.merge(
    properties,
    bindings.resolve(overlay, properties, context),
  );
  return initializer.deriveRuntimeRoleCapabilityProfiles(
    bindings.merge(properties, { runtimeRole: { code: role } }),
  );
}

test("Communication declares an inert delivery contract only for its selected role", () => {
  const engagement = compose("ENGAGEMENT");
  const schema = engagement.runtimeConfigurationSchemas.telegramDelivery;
  assert.equal(schema.ownerModule, "commsCore");
  assert.equal(schema.fields[0].credentialReference, "telegram.bot.delivery");
  assert.deepEqual(schema.fields[0].path, [
    "credentials",
    "telegram.bot.delivery",
    "value",
  ]);
  assert.deepEqual(engagement.communication.providers, {});
  assert.equal(
    runtime.providerPolicy(engagement.communication, "TELEGRAM"),
    undefined,
  );
  assert.equal(
    engagement.communication.providerTypes.TELEGRAM.credentialReferences,
    undefined,
  );
  assert.equal(engagement.credentials, undefined);
  assert.equal(engagement.runtimeConfigurationSecurity, undefined);
  assert.equal(
    compose("PLATFORM").runtimeConfigurationSchemas.telegramDelivery,
    undefined,
  );
});

test("application binding inherits owner validation and targets the selected delivery credential", async (t) => {
  const previous = global.CONFIG;
  t.after(() => {
    global.CONFIG = previous;
  });
  for (const reference of ["first.application.bot", "second.application.bot"]) {
    const selected = { type: "TELEGRAM", credentialReferences: [reference] };
    const overlay = {
      communication: {
        runtimeRoleProfiles: {
          ENGAGEMENT: { providers: { TELEGRAM: selected } },
        },
      },
      runtimeConfigurationSchemas: {
        runtimeRoleProfiles: {
          ENGAGEMENT: {
            telegramDelivery: {
              fields: [
                {
                  credentialReference: { $config: "ref", path: referencePath },
                  path: [
                    "credentials",
                    { $config: "ref", path: referencePath },
                    "value",
                  ],
                },
              ],
            },
          },
        },
      },
    };
    const effective = compose("ENGAGEMENT", overlay);
    const field =
      effective.runtimeConfigurationSchemas.telegramDelivery.fields[0];
    assert.equal(field.code, "botToken");
    assert.equal(field.type, "string");
    assert.equal(field.sensitive, true);
    assert.equal(field.required, true);
    assert.equal(field.pattern, "^\\d+:[^\\s]+$");
    assert.equal(field.credentialReference, reference);
    assert.deepEqual(field.path, ["credentials", reference, "value"]);
    assert.equal(
      effective.runtimeConfigurationSchemas.telegramDelivery.ownerModule,
      "commsCore",
    );
    assert.deepEqual(
      runtime.providerPolicy(effective.communication, "TELEGRAM")
        .credentialReferences,
      [reference],
    );
    assert.equal(selected.service, undefined);
    effective.credentials = { [reference]: { value: null } };
    global.CONFIG = { get: (key) => effective[key] };
    const status = await schemaOwner.getEffectiveConfiguration({
      schemaCode: "telegramDelivery",
    });
    assert.equal(status.data.status, "UNCONFIGURED");
    assert.equal(status.data.secretPersistence.ready, false);
    assert.equal(delivery.configuredCredential(reference, {}), undefined);
    const synthetic = "123456:synthetic-test-only";
    effective.runtimeConfiguration = {
      credentials: { [reference]: { value: synthetic } },
    };
    assert.equal(
      (
        await schemaOwner.getEffectiveConfiguration({
          schemaCode: "telegramDelivery",
        })
      ).data.status,
      "CONFIGURED",
    );
    assert.equal(delivery.configuredCredential(reference, {}), synthetic);
    assert.equal(
      schemaOwner.getSecretPersistenceReadiness({ fields: [field] }).ready,
      false,
    );
    assert.equal(
      compose("PLATFORM", overlay).runtimeConfigurationSchemas.telegramDelivery,
      undefined,
    );
  }
});

test("a binding with no selected credential fails resolution rather than inventing one", () => {
  assert.throws(
    () =>
      compose("ENGAGEMENT", {
        runtimeConfigurationSchemas: {
          runtimeRoleProfiles: {
            ENGAGEMENT: {
              telegramDelivery: {
                fields: [
                  {
                    credentialReference: {
                      $config: "ref",
                      path: referencePath,
                    },
                  },
                ],
              },
            },
          },
        },
      }),
    /Configuration reference is unavailable/,
  );
});
