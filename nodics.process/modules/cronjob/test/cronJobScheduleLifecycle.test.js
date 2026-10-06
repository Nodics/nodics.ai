/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module cronjob/test/cronJobScheduleLifecycle @description Tests actor-bound CAS activation, runtime evidence and no-replay recovery. @layer test @owner cronjob */
const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const { isDeepStrictEqual } = require("node:util");
const drafts = require("../src/service/cronjob/defaultCronJobScheduleDraftService");
const lifecycle = require("../src/service/cronjob/defaultCronJobScheduleLifecycleService");
let config, row, calls, lose, runtime;
const request = (body) => ({
  tenant: "tenant",
  authData: {
    tenant: "tenant",
    entCode: "enterprise",
    loginId: "operator",
    tokenType: "access",
    principalType: "human",
    permissions: ["cronjob.lifecycle.manage"],
  },
  body,
});
beforeEach(() => {
  calls = [];
  lose = false;
  global.CLASSES = { CronJobError: class extends Error {} };
  global.NODICS = { getInternalAuthToken: () => "runtime-fixture-token" };
  config = {
    scheduleDrafts: {
      enabled: true,
      activationEnabled: true,
      targets: [
        {
          tenantCode: "tenant",
          enterpriseCode: "enterprise",
          code: "docs",
          label: "Documents",
          runOnNode: "automation",
          triggerCode: "refreshDocs",
          expressions: ["0 0 * * * *"],
          context: {},
        },
      ],
    },
  };
  global.CONFIG = { get: (key) => (key === "nodeId" ? "automation" : config) };
  runtime = {
    jobPool: {},
    async createJob(token, definition) {
      calls.push("create");
      let active = false;
      const timer = { running: false };
      this.jobPool.tenant ||= {};
      this.jobPool.tenant[definition.code] = {
        getDefinition: () => definition,
        getCronJob: () => timer,
        isActive: () => active,
        isRunning: () => false,
        start: () => {
          active = true;
          timer.running = true;
        },
        stop: () => {
          active = false;
          timer.running = false;
        },
      };
      row.state = "CREATED";
    },
    async startJob(tenant, code) {
      calls.push("start");
      this.jobPool[tenant][code].start();
      if (lose) throw new Error("lost start response");
    },
    async stopJob(tenant, code) {
      calls.push("stop");
      this.jobPool[tenant]?.[code]?.stop();
    },
    async removeJob(tenant, code) {
      calls.push("remove");
      delete this.jobPool[tenant][code];
    },
  };
  global.SERVICE = {
    DefaultCronJobScheduleDraftService: drafts,
    DefaultCronJobRuntimeService: runtime,
    DefaultSecuredRequestPipelineService: {
      getGrantedPermissions: (r) => r.authData.permissions,
      getRouteActionAuthorizationConfig: () => ({}),
      isPermissionGranted: (grant, permissions) => permissions.includes(grant),
    },
    DefaultProcessRuntimeLifecycleService: {
      inspectScheduleTrigger: async () => ({
        triggerCode: "refreshDocs",
        definitionCode: "knowledgeRefresh",
        version: 1,
        graph: { nodes: [] },
        cronJobCode: null,
      }),
    },
    DefaultCronJobService: {
      assertOperational: async () => ({}),
      get: async () => ({
        code: "SUC_JOB_00000",
        result: row ? [structuredClone(row)] : [],
      }),
      update: async (r) => {
        const matched = Object.entries(r.query).every(([key, value]) =>
          isDeepStrictEqual(row[key] ?? null, value),
        );
        if (matched) Object.assign(row, structuredClone(r.model));
        return {
          code: "SUC_JOB_00000",
          result: { matchedCount: matched ? 1 : 0 },
        };
      },
    },
  };
  row = drafts.review(
    request({
      code: "docsJob",
      name: "Documentation refresh",
      targetCode: "docs",
      expression: "0 0 * * * *",
    }),
  ).model;
});
/** Builds a reviewed command without changing business state. */
async function command(intent = "ACTIVATE", revision = 0) {
  const body = { code: row.code, intent, expectedRevision: revision };
  const preview = await lifecycle.preview(request(body));
  return request({
    ...body,
    confirmed: true,
    reviewDigest: preview.data.reviewDigest,
  });
}
test("review is inert; activation, inspection, stop and reactivation use the original Cron pool", async () => {
  const start = await command();
  assert.deepEqual(calls, []);
  assert.equal((await lifecycle.execute(start)).data.state, "ACTIVE");
  assert.deepEqual(calls, ["create", "start"]);
  config.scheduleDrafts.activationEnabled = false;
  assert.equal(
    (await lifecycle.inspect(request({ code: row.code }))).data.state,
    "ACTIVE",
  );
  assert.equal(
    (await lifecycle.execute(await command("DEACTIVATE", 1))).data.state,
    "INACTIVE",
  );
  config.scheduleDrafts.activationEnabled = true;
  assert.equal(
    (await lifecycle.execute(await command("ACTIVATE", 2))).data.state,
    "ACTIVE",
  );
  assert.deepEqual(calls, [
    "create",
    "start",
    "stop",
    "remove",
    "create",
    "start",
  ]);
});
test("lost start response stays uncertain; evidence reconciliation never invokes the runtime again", async () => {
  lose = true;
  const start = await command();
  await assert.rejects(lifecycle.execute(start));
  assert.equal(
    (await lifecycle.inspect(request({ code: row.code }))).data.state,
    "OUTCOME_UNKNOWN",
  );
  await assert.rejects(lifecycle.execute(start));
  config.scheduleDrafts.activationEnabled = false;
  assert.equal(
    (
      await lifecycle.reconcile(
        request({ code: row.code, expectedRevision: 1 }),
      )
    ).data.state,
    "ACTIVE",
  );
  assert.deepEqual(calls, ["create", "start"]);
});
test("missing pool, misleading wrapper flag or a foreign original command cannot establish activation", async () => {
  lose = true;
  await assert.rejects(lifecycle.execute(await command()));
  const job = runtime.jobPool.tenant.docsJob;
  job.getCronJob().running = false;
  assert.equal(
    (
      await lifecycle.reconcile(
        request({ code: row.code, expectedRevision: 1 }),
      )
    ).data.state,
    "OUTCOME_UNKNOWN",
  );
  job.getCronJob().running = true;
  job.getDefinition().jobDetail.scheduleLifecycle.reviewDigest = "b".repeat(64);
  assert.equal(
    (
      await lifecycle.reconcile(
        request({ code: row.code, expectedRevision: 1 }),
      )
    ).data.state,
    "OUTCOME_UNKNOWN",
  );
  delete runtime.jobPool.tenant.docsJob;
  assert.equal(
    (
      await lifecycle.reconcile(
        request({ code: row.code, expectedRevision: 1 }),
      )
    ).data.state,
    "OUTCOME_UNKNOWN",
  );
});
test("denies gate, actor, scope, changed target/version and extra body before activation", async () => {
  const start = await command();
  for (const patch of [
    { entCode: "foreign" },
    { loginId: "foreign" },
    { permissions: [] },
    { tokenType: "refresh" },
    { principalType: "service" },
  ]) {
    await assert.rejects(
      lifecycle.execute({
        ...start,
        authData: { ...start.authData, ...patch },
      }),
    );
  }
  await assert.rejects(
    lifecycle.execute({ ...start, body: { ...start.body, handler: "other" } }),
  );
  config.scheduleDrafts.targets[0].context.changed = true;
  await assert.rejects(lifecycle.execute(start));
  delete config.scheduleDrafts.targets[0].context.changed;
  SERVICE.DefaultProcessRuntimeLifecycleService.inspectScheduleTrigger =
    async () => ({ version: 2 });
  await assert.rejects(lifecycle.execute(start));
  config.scheduleDrafts.activationEnabled = false;
  await assert.rejects(command());
  assert.deepEqual(calls, []);
});
test("concurrent confirmed commands cannot both claim a draft", async () => {
  const start = await command();
  const results = await Promise.allSettled([
    lifecycle.execute(start),
    lifecycle.execute(start),
  ]);
  assert.equal(
    results.filter((value) => value.status === "fulfilled").length,
    1,
  );
  assert.deepEqual(calls, ["create", "start"]);
});
test("a stop cannot race the original activation while its timer is starting", async () => {
  let entered, release;
  const starting = new Promise((resolve) => {
    entered = resolve;
  });
  const waiting = new Promise((resolve) => {
    release = resolve;
  });
  const originalStart = runtime.startJob.bind(runtime);
  runtime.startJob = async (...args) => {
    entered();
    await waiting;
    return originalStart(...args);
  };
  const activation = lifecycle.execute(await command());
  await starting;
  try {
    await assert.rejects(lifecycle.execute(await command("DEACTIVATE", 1)));
    assert.deepEqual(calls, ["create"]);
  } finally {
    release();
  }
  assert.equal((await activation).data.state, "ACTIVE");
  assert.equal(
    (await lifecycle.execute(await command("DEACTIVATE", 1))).data.state,
    "INACTIVE",
  );
  assert.deepEqual(calls, ["create", "start", "stop"]);
});
