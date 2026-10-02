/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nConfig/test/runtimeEncryptionPrivacyContract
 * @description Verifies mandatory encryption-input masking at canonical logger, configuration diagnostic and common error boundaries using synthetic values only.
 * @layer test
 * @owner nConfig
 */
const assert = require("node:assert/strict");
const test = require("node:test");
const logger = require("../src/service/DefaultLoggerService");
const Config = require("../bin/config");
const NodicsError = require("../../nCommon/src/lib/nodicsError");
const defaults = require("../config/properties");

test("encryption prerequisites remain private with absent or hostile logging configuration", (t) => {
  const previous = [global.CONFIG, global.SERVICE, global.UTILS];
  t.after(() => {
    [global.CONFIG, global.SERVICE, global.UTILS] = previous;
  });
  const keys = ["encryptionKey", "NODICS_RUNTIME_CONFIGURATION_ENCRYPTION_KEY"];
  const synthetic = "synthetic-encryption-input-not-a-deployment-key";
  const untouched = "ordinary-safe-diagnostic";
  global.SERVICE = {
    DefaultLoggerService: logger,
    DefaultStatusService: {
      get: () => ({ code: 500, message: "Synthetic diagnostic" }),
    },
  };
  global.UTILS = {
    isObject: (value) => value !== null && typeof value === "object",
    isBlank: (value) => value === undefined || value === null,
  };
  for (const key of keys)
    assert.equal(defaults.log.redaction.sensitiveKeys.includes(key), true);
  const config = new Config();
  global.CONFIG = config;
  for (const policy of [
    undefined,
    { redaction: { enabled: false, sensitiveKeys: [] } },
  ]) {
    const properties = {
      defaultErrorCodes: { NodicsError: "ERR_SYS_00000" },
      returnErrorStack: true,
      log: policy,
      runtimeConfigurationSecurity: { encryptionKey: synthetic },
      environment: { NODICS_RUNTIME_CONFIGURATION_ENCRYPTION_KEY: synthetic },
      ordinary: untouched,
    };
    config.setProperties(properties);
    const safe = (value) =>
      assert.equal(
        JSON.stringify(value).includes(synthetic),
        false,
        "Synthetic prerequisite must be absent from outward diagnostics",
      );
    assert.equal(logger.getRedactionConfig().enabled, true);
    for (const key of keys) {
      assert.equal(
        logger.getRedactionConfig().sensitiveKeys.includes(key),
        true,
      );
      for (const name of [key, key.toUpperCase(), key.toLowerCase()]) {
        const data = { nested: [{ [name]: synthetic }], ordinary: untouched };
        for (const value of [
          data,
          JSON.stringify(data),
          "diagnostic " + JSON.stringify(data),
          JSON.stringify({ serialized: JSON.stringify(data) }),
          name + "=" + synthetic,
          '"' + name + '": "' + synthetic + '"',
        ]) {
          safe(logger.redactLogValue(value));
          safe(
            logger.sanitizeRequestLogEntry({ level: "error", message: value }),
          );
          safe(
            logger.createElasticLogTransformer()({
              level: "error",
              message: value,
              meta: {},
            }),
          );
        }
        const error = new Error(name + "=" + synthetic);
        error.stack = "Synthetic stack " + name + "=" + synthetic;
        safe(logger.redactLogValue(error));
        const common = new NodicsError({
          code: "ERR_SYS_00000",
          message: error.message,
          stack: error.stack,
          metadata: data,
          contexts: [data],
          causes: [error],
          errors: [error],
        });
        safe(common.toJson(true));
        safe(NodicsError.toSafeJson(data));
      }
    }
    const outward = config.getPublicProperties();
    safe(outward);
    assert.equal(outward.ordinary, untouched);
    outward.runtimeConfigurationSecurity.encryptionKey = "changed-projection";
    assert.equal(
      config.get("runtimeConfigurationSecurity").encryptionKey,
      synthetic,
      "Diagnostic projection must not mutate internal encryption authority",
    );
    assert.equal(config.getProperties(), properties);
    config.setProperties(
      { runtimeConfigurationSecurity: { encryptionKey: synthetic } },
      "isolated",
    );
    safe(config.getPublicProperties("isolated"));
    assert.deepEqual(config.getPublicProperties("missing"), {});

    // Bootstrap fallback works before the effective logger owner is registered.
    delete global.SERVICE.DefaultLoggerService;
    safe(config.getPublicProperties());
    safe(NodicsError.toSafeJson({ encryptionKey: synthetic }));
    global.SERVICE.DefaultLoggerService = logger;
  }
  assert.deepEqual(logger.getPrivateApmOptions(), {
    active: false,
    captureBody: "off",
    captureHeaders: false,
  });
  const filters = [];
  logger.installApmPrivacyFilter({
    addFilter: (filter) => filters.push(filter),
  });
  assert.equal(filters.length, 1);
  assert.equal(
    filters[0]({ context: { custom: { encryptionKey: synthetic } } }),
    null,
  );
  assert.throws(
    () => logger.installApmPrivacyFilter({}),
    /APM privacy filter adapter is unavailable/,
  );
});
