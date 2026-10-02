/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/** @module workflow/test/processTaskClaimConcurrency @description Injected failed-claim acknowledgement fixture, not installed Process concurrency acceptance. @layer test @owner workflow */
const test = require("node:test");
const assert = require("node:assert/strict");
const source = require("../src/service/operation/defaultProcessRuntimeLifecycleService");
test("zero-match task claim cannot audit or return fabricated success", async () => {
  global.CLASSES = { NodicsError: class extends Error {} };
  global.SERVICE = {
    DefaultModelsUpdateInitializerService: {
      getAffectedCount: (value) => value.result.matchedCount,
    },
  };
  let audited = false;
  const task = {
    code: "task",
    status: "OPEN",
    instanceCode: "instance",
    nodeCode: "review",
  };
  const owner = {
    ...source,
    requireTask: async () => task,
    requireInstance: async () => ({
      status: "WAITING",
      definitionCode: "definition",
      version: 1,
    }),
    requireVersion: async () => ({ graph: {} }),
    findNode: () => ({}),
    policyOf: () => ({}),
    taskService: () => ({
      update: async (request) => {
        assert.equal(request.query.status, "OPEN");
        assert.equal(request.query.instanceCode, "instance");
        return { code: "SUC_SYS_00000", result: { matchedCount: 0 } };
      },
    }),
    audit: async () => {
      audited = true;
    },
  };
  await assert.rejects(
    owner.claimTask({
      tenant: "tenant",
      taskCode: "task",
      authData: { loginId: "reviewer" },
      body: {},
    }),
  );
  assert.equal(audited, false);
});
