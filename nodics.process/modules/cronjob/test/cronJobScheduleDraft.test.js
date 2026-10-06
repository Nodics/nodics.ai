/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const service = require("../src/service/cronjob/defaultCronJobScheduleDraftService");
const controller = require("../src/controller/defaultCronJobScheduleDraftController");
const facade = require("../src/facade/defaultCronJobFacade");
const activator = require("../src/service/interceptor/defaultJobActivatorInterceptorService");
const defaults = require("../config/properties");

/**
 * @module cronjob/test/cronJobScheduleDraft
 * @description Exercises draft admission, reviewed configuration, generated acknowledgements and no-scheduler behavior with isolated persistence doubles.
 * @layer test
 * @owner cronjob
 * @override Add deployment tests without substituting fixtures for live unique-index qualification.
 */
let config, calls, rows, request;
test("source association is optional, exact, context-bound and included in review identity", async () => {
  const target = config.scheduleDrafts.targets[0];
  const unbound = service.review(request).data;
  target.sourceBinding = {
    moduleName: "copilotApi",
    sourceCode: "docs",
    policyDigest: "a".repeat(64),
  };
  const capability = await service.capabilities(request);
  assert.deepEqual(
    capability.data.targets[0].sourceBinding,
    target.sourceBinding,
  );
  assert.equal(capability.data.targets[0].context, undefined);
  const bound = service.review(request).data;
  assert.notEqual(bound.reviewDigest, unbound.reviewDigest);
  assert.deepEqual(bound.sourceBinding, target.sourceBinding);
  const original = structuredClone(target.sourceBinding);
  for (const patch of [
    { policyDigest: "b".repeat(64) },
    { sourceCode: "other" },
    { moduleName: "../bad" },
    { permissions: ["*"] },
  ]) {
    target.sourceBinding = { ...original, ...patch };
    assert.throws(() => service.review(request));
  }
  assert.equal(calls.length, 0);
});
beforeEach(() => {
  config = structuredClone(defaults.cronjob);
  config.scheduleDrafts.enabled = true;
  config.scheduleDrafts.targets = [
    {
      code: "refresh",
      label: "Knowledge refresh",
      tenantCode: "tenantA",
      enterpriseCode: "enterpriseA",
      runOnNode: "nodeA",
      triggerCode: "knowledgeRefresh",
      expressions: ["0 0 * * * *"],
      context: { sourceCode: "docs", expectedPolicyDigest: "a".repeat(64) },
    },
  ];
  calls = [];
  rows = [];
  request = {
    tenant: "tenantA",
    authData: {
      tokenType: "access",
      principalType: "human",
      tenant: "tenantA",
      entCode: "enterpriseA",
      loginId: "operator",
      permissions: ["cronjob.lifecycle.manage"],
    },
    body: {
      code: "refreshDocs",
      name: "Refresh documentation",
      targetCode: "refresh",
      expression: "0 0 * * * *",
    },
  };
  global.CONFIG = { get: () => config };
  global.CLASSES = {
    CronJobError: class extends Error {
      constructor(code) {
        super(code);
        this.code = code;
      }
    },
  };
  global.SERVICE = {
    DefaultSecuredRequestPipelineService: {
      getGrantedPermissions: (input) => input.authData.permissions,
      getRouteActionAuthorizationConfig: () => ({}),
      isPermissionGranted: (permission, grants) => grants.includes(permission),
    },
    DefaultCronJobScheduleDraftService: service,
    DefaultCronJobService: {
      save: async (input) => {
        calls.push(input);
        rows.push(structuredClone(input.model));
        return { code: "SUC_SAVE", result: structuredClone(input.model) };
      },
      get: async (input) => {
        calls.push(input);
        return { code: "SUC_READ", result: structuredClone(rows) };
      },
      getCronJobRuntimeService: () => {
        throw new Error("Scheduler must not be accessed");
      },
    },
  };
  global.FACADE = { DefaultCronJobFacade: facade };
});

/** Reviews once and prepares explicit confirmation. @returns {Promise<Object>} Review. */
async function review() {
  const { data } = await service.preview(request);
  request.body.reviewDigest = data.reviewDigest;
  request.body.confirmed = true;
  return data;
}

test("default disabled; scoped choices expose no business context or credentials", async () => {
  assert.equal(defaults.cronjob.scheduleDrafts.enabled, false);
  const result = await service.capabilities(request);
  assert.equal(result.data.targets.length, 1);
  assert.equal(result.data.targets[0].context, undefined);
  request.authData.entCode = "other";
  assert.deepEqual((await service.capabilities(request)).data.targets, []);
  config.scheduleDrafts.enabled = false;
  assert.deepEqual((await service.capabilities(request)).data.targets, []);
});

test("preview is non-mutating; confirmed save inserts an inactive exact definition and real activator stays idle", async () => {
  const preview = await review();
  assert.equal(calls.length, 0);
  const result = await service.create(request);
  assert.equal(result.data.outcome, "SAVED_INACTIVE");
  assert.equal(result.data.reviewDigest, preview.reviewDigest);
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0].options, { insertOnly: true });
  assert.equal(calls[0].authData, request.authData);
  assert.equal(rows[0].active, false);
  assert.equal(rows[0].runOnInit, false);
  await activator.activateJob({ tenant: request.tenant, model: rows[0] }, {});
  assert.equal(rows[0].jobDetail.processTrigger.instanceCode, undefined);
});

for (const change of [
  (input) => {
    input.authData.tenant = "other";
  },
  (input) => {
    input.authData.entCode = "";
  },
  (input) => {
    input.authData.principalType = "service";
  },
  (input) => {
    input.authData.tokenType = "refresh";
  },
  (input) => {
    input.authData.isSystem = true;
  },
  (input) => {
    input.authData.permissions = [];
  },
])
  test(`denies invalid authority ${String(change)}`, async () => {
    change(request);
    await assert.rejects(service.preview(request), { code: "ERR_JOB_00010" });
    assert.equal(calls.length, 0);
  });

test("rejects arbitrary nodes, handlers, timing, selectors and unconfirmed saves", async () => {
  for (const field of [
    "authData",
    "tenant",
    "query",
    "options",
    "runOnNode",
    "active",
    "jobDetail",
  ]) {
    const input = structuredClone(request);
    input.body[field] = "forged";
    await assert.rejects(service.preview(input), { code: "ERR_JOB_00009" });
  }
  await assert.rejects(service.create(request));
  request.body.expression = "* * * * * *";
  await assert.rejects(service.preview(request));
  assert.equal(calls.length, 0);
});

test("configuration, timing, actor and enterprise drift invalidate a previous review", async () => {
  await review();
  for (const field of ["triggerCode", "runOnNode", "label"]) {
    const previous = config.scheduleDrafts.targets[0][field];
    config.scheduleDrafts.targets[0][field] = "changed";
    await assert.rejects(service.create(request));
    config.scheduleDrafts.targets[0][field] = previous;
  }
  request.authData.loginId = "other";
  await assert.rejects(service.create(request));
  request.authData.loginId = "operator";
  request.authData.entCode = "other";
  await assert.rejects(service.create(request));
  assert.equal(calls.length, 0);
});

test("malformed, duplicate, over-limit and forged-provenance targets fail closed", async () => {
  const target = structuredClone(config.scheduleDrafts.targets[0]);
  for (const invalid of [
    { expressions: ["invalid"] },
    { expressions: [] },
    { expressions: ["* * * * * *", "* * * * * *"] },
    { runOnNode: "http://host" },
    { context: { source: "forged" } },
    { context: { token: "secret" } },
    { context: { data: {} } },
    { context: { value: "a".repeat(257) } },
  ]) {
    config.scheduleDrafts.targets = [{ ...target, ...invalid }];
    await assert.rejects(service.preview(request));
  }
  config.scheduleDrafts.targets = [target, target];
  await assert.rejects(service.preview(request));
  assert.equal(calls.length, 0);
});

test("lost, negative, count-only, multiple and mutated acknowledgements remain uncertain without retry", async () => {
  await review();
  const replies = [
    undefined,
    { code: "ERR_SAVE", result: {} },
    { code: "SUC_SAVE", result: { matchedCount: 1 } },
    { code: "SUC_SAVE", acknowledged: false, result: {} },
    { code: "SUC_SAVE", result: [] },
  ];
  for (const reply of replies) {
    let writes = 0;
    SERVICE.DefaultCronJobService.save = async () => {
      writes++;
      return reply;
    };
    await assert.rejects(service.create(request), { code: "ERR_JOB_00011" });
    assert.equal(writes, 1);
  }
  for (const transform of [
    (row) => [row, row],
    (row) => ({ ...row, acknowledged: false }),
    (row) => ({ ...row, active: true }),
    (row) => {
      row.jobDetail.processTrigger.context.sourceCode = "changed";
      return row;
    },
  ]) {
    SERVICE.DefaultCronJobService.save = async (input) => ({
      code: "SUC_SAVE",
      result: transform(input.model),
    });
    await assert.rejects(service.create(request), { code: "ERR_JOB_00011" });
  }
});

test("original inspection works after disablement; absence, foreign actor or changed definition never permits replay", async () => {
  const preview = await review();
  await service.create(request);
  config.scheduleDrafts.enabled = false;
  request.body = { code: preview.code, reviewDigest: preview.reviewDigest };
  assert.equal((await service.inspect(request)).data.outcome, "SAVED_INACTIVE");
  assert.equal(
    calls.at(-1).query["jobDetail.scheduleDraft.enterpriseCode"],
    "enterpriseA",
  );
  assert.equal(calls.at(-1).searchOptions.pageSize, 2);
  request.authData.loginId = "other";
  assert.equal(
    (await service.inspect(request)).data.outcome,
    "OUTCOME_UNKNOWN",
  );
  request.authData.loginId = "operator";
  rows[0].trigger.expression = "* * * * * *";
  assert.equal(
    (await service.inspect(request)).data.outcome,
    "OUTCOME_UNKNOWN",
  );
  rows = [];
  assert.equal(
    (await service.inspect(request)).data.outcome,
    "OUTCOME_UNKNOWN",
  );
  assert.equal(calls.filter((call) => call.model).length, 1);
});

test("inspection failure exposes only the owner uncertainty status", async () => {
  const preview = await review();
  request.body = { code: preview.code, reviewDigest: preview.reviewDigest };
  SERVICE.DefaultCronJobService.get = async () => {
    throw new Error("private adapter details");
  };
  await assert.rejects(service.inspect(request), {
    code: "ERR_JOB_00011",
    message: "ERR_JOB_00011",
  });
});

test("lost insert acknowledgement is inspected without another write", async () => {
  const preview = await review();
  SERVICE.DefaultCronJobService.save = async (input) => {
    calls.push(input);
    rows.push(structuredClone(input.model));
    throw new Error("Response lost after insertion");
  };
  await assert.rejects(service.create(request), { code: "ERR_JOB_00011" });
  request.body = { code: preview.code, reviewDigest: preview.reviewDigest };
  assert.equal((await service.inspect(request)).data.outcome, "SAVED_INACTIVE");
  assert.equal(calls.filter((call) => call.model).length, 1);
});

test("concurrent same-code inserts retain the winner and never convert a conflict into an update", async () => {
  await review();
  SERVICE.DefaultCronJobService.save = async (input) => {
    calls.push(input);
    assert.equal(input.options.insertOnly, true);
    if (rows.some((row) => row.code === input.model.code))
      throw new Error("Unique identity conflict");
    rows.push(structuredClone(input.model));
    return { code: "SUC_SAVE", result: structuredClone(input.model) };
  };
  const results = await Promise.allSettled([
    service.create(request),
    service.create(request),
  ]);
  assert.equal(
    results.filter((result) => result.status === "fulfilled").length,
    1,
  );
  assert.equal(rows.length, 1);
  assert.equal(calls.length, 2);
  assert.equal(rows[0].active, false);
});

test("controller preserves verified identity, rejects body authority and sets no-store; routes are secured", async () => {
  let received, cache;
  FACADE.DefaultCronJobFacade = {
    previewScheduleDraft: async (input) => {
      received = input;
      return { ok: true };
    },
  };
  const body = {
    tenant: "forged",
    authData: { loginId: "forged" },
    options: { insertOnly: false },
  };
  await controller.preview({
    ...request,
    httpRequest: { body },
    httpResponse: {
      setHeader: (key, value) => {
        cache = [key, value];
      },
    },
  });
  assert.equal(received.authData, request.authData);
  assert.equal(received.tenant, request.tenant);
  assert.equal(received.options, undefined);
  assert.deepEqual(cache, ["Cache-Control", "no-store"]);
  await new Promise((resolve, reject) =>
    controller.preview(
      { ...request, httpRequest: { body } },
      (error, result) => (error ? reject(error) : resolve(result)),
    ),
  );
  for (const route of Object.values(
    require("../src/router/routers").cronjob.scheduleDrafts,
  )) {
    assert.equal(route.secured, true);
    assert.equal(route.permission, "cronjob.lifecycle.manage");
    assert.equal(route.controller, "DefaultCronJobScheduleDraftController");
  }
});
