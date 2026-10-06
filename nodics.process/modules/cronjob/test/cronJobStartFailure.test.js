/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
/** @module cronjob/test/cronJobStartFailure @description Real Cron wrapper cannot advertise activation after pipeline failure. @layer test @owner cronjob */
"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const CronJob = require("../src/lib/cronJob");
test("failed start pipeline resets active state and leaves the actual timer stopped", async () => {
  global.CLASSES = { CronJobError: class extends Error {} };
  global.SERVICE = {
    DefaultPipelineService: {
      start: async () => {
        throw new Error("unavailable");
      },
    },
  };
  const job = new CronJob(
    { tenant: "test", code: "fixture", runOnInit: false, jobDetail: {} },
    { expression: "0 0 0 1 1 *" },
    {},
    "UTC",
  );
  job.LOG = { info() {}, warn() {}, debug() {}, error() {} };
  job.init(false);
  await assert.rejects(job.startJob());
  assert.equal(job.isActive(), false);
  assert.notEqual(job.getCronJob().running, true);
  assert.notEqual(job.getCronJob().isActive, true);
});
