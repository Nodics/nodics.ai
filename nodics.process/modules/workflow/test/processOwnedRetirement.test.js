/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/**
 * @module workflow/test/processOwnedRetirement
 * @description Deferred contract fixtures for signed-source review cancellation and exact recovery.
 * @layer test
 * @owner workflow
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const lifecycle = require("../src/service/operation/defaultProcessRuntimeLifecycleService");
const authority = require("../../../../nodics.foundation/modules/nAuth/src/service/identity/defaultServiceTokenService");

test("generic mutation cannot forge, rename, erase or delete retirement evidence", async () => {
  const f = fixture();
  for (const model of [
    { domainRetirement: {} },
    { $set: { "domainRetirement.closureCode": "forged" } },
    { $unset: { domainRetirement: "" } },
    { $rename: { ordinary: "domainRetirement" } },
  ]) {
    await assert.rejects(
      f.owner.protectTaskRetirement({
        tenant: "tenant-a",
        query: { code: f.task.code },
        model,
      }),
    );
  }
  f.task.domainRetirement = {
    sourceModule: "exampleDomain",
    closureCode: "closure-a",
  };
  await assert.rejects(
    f.owner.protectTaskRetirement({
      tenant: "tenant-a",
      query: { code: f.task.code },
    }),
  );
});

test("ordinary mutation retains an atomic no-retirement query fence", async () => {
  const f = fixture();
  const request = {
    tenant: "tenant-a",
    query: { code: f.task.code },
    model: { $set: { status: "CLAIMED" } },
  };
  await f.owner.protectTaskRetirement(request);
  assert.deepEqual(request.query.domainRetirement, { $exists: false });
});

test("generic selectors cannot hide retired identity rewrites or upserts", async () => {
  const f = fixture();
  for (const extra of [
    { options: { upsert: true }, model: { $set: { status: "OPEN" } } },
    { model: { $set: { status: "OPEN" }, $unset: { code: "" } } },
    { model: { $rename: { ordinary: "code" } } },
    { model: { $replaceWith: { $literal: { code: "other" } } } },
    { model: [{ $set: { code: "other" } }] },
    { model: { code: "other", status: "OPEN" } },
  ])
    await assert.rejects(
      f.owner.protectTaskRetirement({
        tenant: "tenant-a",
        query: { code: f.task.code },
        ...extra,
      }),
    );
});

test("advanced completed decision is inspected without cancellation or remote-action stealing", async () => {
  const f = fixture();
  f.task.status = "COMPLETED";
  f.instance.status = "COMPLETED";
  f.instance.currentNode = "end";
  f.instance.activeRemoteAction = { status: "CLAIMED" };
  assert.equal(
    (await f.owner.retireOwnedReview(f.request)).data.status,
    "DECISION_IN_PROGRESS",
  );
  assert.deepEqual(f.calls, { taskWrites: 0, instanceWrites: 0 });
});

test("only the exact owner request receives transient retirement write admission", async () => {
  const f = fixture();
  const request = {
    tenant: "tenant-a",
    query: { code: f.task.code },
    model: { $set: { domainRetirement: {} } },
  };
  const service = {
    update: async (admitted) => {
      assert.equal(await f.owner.protectTaskRetirement(admitted), true);
      await assert.rejects(f.owner.protectTaskRetirement({ ...admitted }));
      return { code: "SUC_DBS_00000" };
    },
  };
  await f.owner.writeRetirement(service, request);
  await assert.rejects(f.owner.protectTaskRetirement(request));
});

function fixture() {
  const policy = {
    enabled: true,
    allowedDefinitions: ["review"],
    permission: "process.instance.retire.internal",
  };
  const context = {
    enterpriseCode: "enterprise-a",
    requestHash: "immutable-request",
  };
  const instance = {
    code: "review-a",
    definitionCode: "review",
    version: 3,
    status: "WAITING",
    startCompleted: true,
    currentNode: "review-task",
    context,
  };
  const task = {
    code: "task-a",
    instanceCode: instance.code,
    nodeCode: instance.currentNode,
    status: "OPEN",
  };
  const definition = { code: "review", ownerModule: "exampleDomain" };
  const version = {
    definitionCode: "review",
    version: 3,
    graph: {
      nodes: [
        {
          code: "review-task",
          type: "TASK",
          policy: { actorPolicy: { permission: "review" } },
        },
      ],
    },
  };
  const faults = {},
    calls = { taskWrites: 0, instanceWrites: 0 };
  global.CONFIG = {
    get: (key) =>
      key === "process"
        ? { runtime: { internalRetirements: policy } }
        : undefined,
  };
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code) {
        super(code);
        this.code = code;
      }
    },
  };
  global.SERVICE = {
    DefaultServiceTokenService: authority,
    DefaultModelsUpdateInitializerService: {
      getAffectedCount: (response) => response.result?.modifiedCount,
    },
  };
  const reader = (row) => ({
    get: async (request) => {
      assert.equal(request.options.skipItemCache, true);
      return { code: "SUC_DBS_00000", result: [structuredClone(row)] };
    },
  });
  const taskOwner = {
    ...reader(task),
    update: async (request) => {
      calls.taskWrites++;
      assert.equal(request.query.status, task.status);
      if (faults.completionWins) {
        task.status = "COMPLETED";
        throw new Error("CAS lost");
      }
      Object.assign(task, structuredClone(request.model.$set));
      if (faults.taskLostAck) throw new Error("lost task acknowledgement");
      return {
        code: "SUC_DBS_00000",
        result: { acknowledged: true, modifiedCount: 1 },
      };
    },
  };
  const instanceOwner = {
    ...reader(instance),
    update: async (request) => {
      calls.instanceWrites++;
      assert.equal(request.query.status, instance.status);
      assert.deepEqual(request.query.context, instance.context);
      Object.assign(instance, structuredClone(request.model.$set));
      if (faults.instanceLostAck)
        throw new Error("lost instance acknowledgement");
      return {
        code: "SUC_DBS_00000",
        result: { acknowledged: true, modifiedCount: 1 },
      };
    },
  };
  const owner = {
    ...lifecycle,
    definitionService: () => reader(definition),
    versionService: () => reader(version),
    taskService: () => taskOwner,
    instanceService: () => instanceOwner,
  };
  const request = {
    tenant: "tenant-a",
    authData: {
      tokenType: "service",
      principalType: "service",
      serviceId: "owner-runtime",
      entCode: "enterprise-a",
      tenant: "tenant-a",
      runtimeInstanceId: "instance-a",
      modules: ["workflow", "exampleDomain"],
      permissions: [policy.permission],
      runtimeScope: {
        instanceCode: "instance-a",
        projectCode: "project-a",
        environmentCode: "test",
        serverCode: "owner-server",
        assignmentCode: "grant-a",
      },
    },
    runtimeOperation: {
      sourceModule: "exampleDomain",
      instanceCode: instance.code,
      closureCode: "closure-a",
      context: structuredClone(context),
    },
  };
  return {
    owner,
    request,
    policy,
    instance,
    task,
    definition,
    version,
    faults,
    calls,
    taskOwner,
  };
}
test("signed owner retires exact task and instance; identical replay performs no writes", async () => {
  const f = fixture();
  assert.equal(
    (await f.owner.retireOwnedReview(f.request)).data.status,
    "RETIRED",
  );
  assert.equal(f.task.status, "CANCELLED");
  assert.equal(f.instance.status, "CANCELLED");
  assert.equal(
    (await f.owner.retireOwnedReview(f.request)).data.status,
    "RETIRED",
  );
  assert.deepEqual(f.calls, { taskWrites: 1, instanceWrites: 1 });
});
test("exact uncached persistence evidence recovers lost acknowledgements", async () => {
  const f = fixture();
  f.faults.taskLostAck = true;
  f.faults.instanceLostAck = true;
  assert.equal(
    (await f.owner.retireOwnedReview(f.request)).data.status,
    "RETIRED",
  );
  assert.deepEqual(f.calls, { taskWrites: 1, instanceWrites: 1 });
});
test("competing completed decision never cancels its instance", async () => {
  const f = fixture();
  f.faults.completionWins = true;
  assert.equal(
    (await f.owner.retireOwnedReview(f.request)).data.status,
    "DECISION_IN_PROGRESS",
  );
  assert.equal(f.instance.status, "WAITING");
  assert.equal(f.calls.instanceWrites, 0);
});
for (const mutate of [
  (f) => {
    f.policy.enabled = false;
  },
  (f) => {
    f.policy.allowedDefinitions = [];
  },
  (f) => {
    f.request.authData.permissions = [];
  },
  (f) => {
    f.request.authData.modules = ["workflow"];
  },
  (f) => {
    f.request.runtimeOperation.context.enterpriseCode = "other";
  },
  (f) => {
    f.request.runtimeOperation.context.requestHash = "different";
  },
  (f) => {
    f.definition.ownerModule = "other";
  },
  (f) => {
    f.instance.activeRemoteAction = { status: "CLAIMED", expiresAt: 1 };
  },
  (f) => {
    f.task.status = "CANCELLED";
    f.task.domainRetirement = { closureCode: "other" };
  },
]) {
  test(
    "wrong policy, source, context or competing evidence rejects before mutation: " +
      mutate.toString(),
    async () => {
      const f = fixture();
      mutate(f);
      await assert.rejects(f.owner.retireOwnedReview(f.request));
      assert.deepEqual(f.calls, { taskWrites: 0, instanceWrites: 0 });
    },
  );
}
test("ambiguous instance tasks require inspection, not partial cancellation", async () => {
  const f = fixture();
  f.taskOwner.get = async () => ({
    code: "SUC_DBS_00000",
    result: [f.task, { ...f.task, code: "other" }],
  });
  await assert.rejects(f.owner.retireOwnedReview(f.request));
  assert.deepEqual(f.calls, { taskWrites: 0, instanceWrites: 0 });
});
