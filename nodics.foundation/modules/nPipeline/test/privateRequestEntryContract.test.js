/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module pipeline/test/PrivateRequestEntryContract
 * @description Deferred default pipeline dispatch fixtures with exact private
 * envelope preservation and non-authorizing async-context inheritance. NOT RUN.
 * @layer test
 * @owner nPipeline
 * @override Project pipeline handlers preserve owner admission and error authority.
 */
const assert = require("node:assert/strict");
const privacy = require("../../nConfig/src/service/DefaultLoggerService");
const pipeline = require("../src/service/pipeline/defaultPipelineService");

/** Exercises pipeline entry without executing provider/domain handlers. */
async function main() {
  const keys = ["CONFIG", "SERVICE", "UTILS", "PIPELINE", "CLASSES"];
  const prior = new Map(
    keys.map((key) => [key, Object.getOwnPropertyDescriptor(global, key)]),
  );
  let expected;
  global.CONFIG = {
    get: () => ({
      requestPrivacy: { qualified: true, captureMode: "disabled" },
    }),
  };
  global.SERVICE = {
    DefaultLoggerService: { ...privacy, createLogger: () => ({}) },
  };
  global.UTILS = { generateUniqueCode: () => "private-id" };
  global.PIPELINE = { defaultPipeline: {}, privateCheck: {} };
  global.CLASSES = {
    NodicsError: Error,
    PipelineHead: class {
      buildPipeline() {}
      start(id, request, response, resolve) {
        assert.equal(request, expected);
        assert.equal(privacy.isSensitiveRequest(request), true);
        resolve(privacy.hasPrivateCaptureProtection(request));
      }
    },
  };
  try {
    const entry = {};
    await privacy.runSensitiveOperation(entry, async () => {
      expected = entry;
      assert.equal(await pipeline.start("privateCheck", entry, {}), true);
      expected = { ...entry };
      assert.equal(await pipeline.start("privateCheck", expected, {}), false);
      privacy.inheritRequestPrivacy(expected, entry);
      assert.equal(await pipeline.start("privateCheck", expected, {}), true);
    });
  } finally {
    for (const [key, descriptor] of prior) {
      if (descriptor) Object.defineProperty(global, key, descriptor);
      else delete global[key];
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
