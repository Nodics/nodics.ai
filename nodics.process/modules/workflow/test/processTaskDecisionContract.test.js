/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/** @module workflow/test/processTaskDecisionContract @description Deferred isolated fixtures for pinned Process approval projection; no activation or live provider evidence. @layer test @owner workflow */
const test = require("node:test");
const assert = require("node:assert/strict");
const lifecycle = require("../src/service/operation/defaultProcessRuntimeLifecycleService");
const inspection = require("../src/service/operation/defaultProcessOperationsInspectionService");

/** Returns the approved generic descriptor, never a domain identity or grant. */
function approvalContract() {
  return {
    contractVersion: 1,
    kind: "APPROVAL",
    approveLabel: "Approve",
    rejectLabel: "Reject",
    reasonLabel: "Reason",
    rejectionReasonRequired: true,
    maximumReasonLength: 1000,
  };
}

test("real Media contribution published through the definition owner projects existing immutable review identity", async () => {
  const f = fixture();
  const publisher = require("../src/service/definition/defaultProcessDefinitionLifecycleService");
  const source =
    require("../../../../nodics.wcms/modules/media/data/init-v003/records/process/mediaPublicationWorkflowDefinitionData")
      .definitions[0];
  const definition = {
    ...source,
    status: "DRAFT",
    currentVersion: 0,
    contributionOwner: "media",
  };
  SERVICE.DefaultProcessGraphValidationService = {
    assertValidGraph: () => ({ valid: true }),
  };
  let published;
  await publisher.publishDraft.call(
    {
      ...publisher,
      requireDefinition: async () => definition,
      getActor: () => "publisher",
      serviceRequest: (_request, input) => input,
      versionService: () => ({
        save: async (input) => {
          published = input.model;
        },
      }),
      definitionService: () => ({
        update: async () => ({ result: { modifiedCount: 1 } }),
      }),
    },
    { definitionCode: definition.code },
  );
  assert.equal(published.ownerModule, undefined);
  Object.assign(f.version, published);
  f.instance.definitionCode = published.definitionCode;
  f.instance.version = published.version;
  f.task.nodeCode = "mediaReview";
  f.instance.context = {
    ownerModule: "media",
    domain: "media",
    definitionCode: published.definitionCode,
    actionKey: "media.applyPublicationDecision",
    workflowRef: f.instance.code,
    publicationCode: "publication-a",
    rootType: "media",
    rootCode: "nexusProduct-waste-home",
    sourceVersion: "a".repeat(64),
  };
  const [result] = await f.owner.projectTaskDecisions(f.request, [f.task]);
  assert.equal(result.reviewContext.owner, "media");
  assert.equal(result.reviewContext.rootCode, "nexusProduct-waste-home");
  assert.equal(result.reviewContext.sourceVersion, "a".repeat(64));
  assert.equal(result.reviewContext.versionId, undefined);
  published.graph.nodes.push({
    ...published.graph.nodes.find((node) => node.type === "ACTION"),
  });
  assert.equal(
    (await f.owner.projectTaskDecisions(f.request, [f.task]))[0].reviewContext,
    undefined,
  );
});

test("current reviewer projection rejects the requester and uses actual completion actor checks", async () => {
  const f = fixture();
  f.instance.context = {
    enterpriseCode: "enterprise-a",
    requestedBy: "maker@example.test",
  };
  f.request.authData = {
    tokenType: "access",
    principalType: "human",
    tenant: "tenant-a",
    entCode: "enterprise-a",
    loginId: "maker@example.test",
  };
  let granted = true;
  SERVICE.DefaultSecuredRequestPipelineService = {
    getGrantedPermissions: () => [],
    getRouteActionAuthorizationConfig: () => ({}),
    isPermissionGranted: () => granted,
  };
  f.task.reviewerEligibility = { eligible: true };
  let [result] = await f.owner.projectTaskDecisions(f.request, [f.task]);
  assert.equal(result.reviewerEligibility.eligible, false);
  assert.equal(
    result.reviewerEligibility.reasonCode,
    "DIFFERENT_REVIEWER_REQUIRED",
  );
  assert.throws(
    () => f.owner.assertTaskActor(f.request, f.instance, f.version.policy),
    { code: "ERR_PROCESS_00029" },
  );
  f.request.authData.loginId = "checker@example.test";
  [result] = await f.owner.projectTaskDecisions(f.request, [f.task]);
  assert.equal(result.reviewerEligibility.eligible, true);
  granted = false;
  [result] = await f.owner.projectTaskDecisions(f.request, [f.task]);
  assert.equal(
    result.reviewerEligibility.reasonCode,
    "REVIEWER_NOT_AUTHORISED",
  );
  granted = true;
  for (const status of [
    "CREATED",
    "FAILED",
    "CANCELLED",
    "COMPLETED",
    undefined,
  ]) {
    f.instance.status = status;
    [result] = await f.owner.projectTaskDecisions(f.request, [f.task]);
    assert.equal(result.reviewerEligibility.eligible, false);
    assert.equal(
      result.reviewerEligibility.reasonCode,
      "INSTANCE_NOT_ACTIONABLE",
    );
  }
  for (const status of ["RUNNING", "WAITING"]) {
    f.instance.status = status;
    assert.equal(
      (await f.owner.projectTaskDecisions(f.request, [f.task]))[0]
        .reviewerEligibility.eligible,
      true,
    );
  }
  for (const patch of [
    { tokenType: "service" },
    { tenant: "other" },
    { entCode: "other" },
    { isSystem: true },
  ]) {
    granted = true;
    const original = f.request.authData;
    f.request.authData = { ...original, ...patch };
    assert.equal(
      (await f.owner.projectTaskDecisions(f.request, [f.task]))[0]
        .reviewerEligibility.eligible,
      false,
    );
    f.request.authData = original;
  }
  f.task.status = "COMPLETED";
  assert.equal(
    (await f.owner.projectTaskDecisions(f.request, [f.task]))[0]
      .reviewerEligibility.reasonCode,
    "TASK_NOT_ACTIONABLE",
  );
});

test("review identity is bounded to the pinned owner action and never copies private context or guesses numeric Media version", async () => {
  const f = fixture();
  assert.equal(f.version.ownerModule, undefined);
  f.version.graph.nodes.push({
    type: "ACTION",
    action: { moduleName: "media", operation: "applyPublicationDecision" },
  });
  f.instance.context = {
    ownerModule: "media",
    definitionCode: f.instance.definitionCode,
    workflowRef: f.instance.code,
    actionKey: "media.applyPublicationDecision",
    publicationCode: "publication-a",
    rootType: "media",
    rootCode: "nexusProduct-waste-home",
    sourceVersion: "a".repeat(64),
    privateNomination: "must-not-project",
    versionId: 999,
  };
  f.task.reviewContext = { owner: "forged" };
  const [result] = await f.owner.projectTaskDecisions(f.request, [f.task]);
  assert.deepEqual(result.reviewContext, {
    contractVersion: 1,
    owner: "media",
    publicationCode: "publication-a",
    rootType: "media",
    rootCode: "nexusProduct-waste-home",
    sourceVersion: "a".repeat(64),
  });
  assert(!JSON.stringify(result.reviewContext).includes("must-not-project"));
  assert.equal(result.reviewContext.versionId, undefined);
  for (const [key, value] of [
    ["ownerModule", "other"],
    ["workflowRef", "other"],
    ["sourceVersion", { injected: true }],
    ["rootCode", "x".repeat(129)],
  ]) {
    const original = f.instance.context[key];
    f.instance.context[key] = value;
    assert.equal(
      (await f.owner.projectTaskDecisions(f.request, [f.task]))[0]
        .reviewContext,
      undefined,
    );
    f.instance.context[key] = original;
  }
  delete f.version.policy.actorPolicy;
  assert.equal(
    (await f.owner.projectTaskDecisions(f.request, [f.task]))[0]
      .reviewerEligibility,
    undefined,
  );
});

test("an owner-declared pinned task decision projects without manufacturing actor policy", async () => {
  const f = fixture();
  delete f.version.policy.actorPolicy;
  f.version.graph.nodes[0].policy = { decisionContract: approvalContract() };
  const [projected] = await f.owner.projectTaskDecisions(f.request, [f.task]);
  assert.deepEqual(projected.decisionContract, approvalContract());
  assert.equal(f.version.graph.nodes[0].policy.actorPolicy, undefined);
  f.owner.assertTaskActorPolicy(
    f.request,
    f.instance,
    f.owner.policyOf(f.version, f.version.graph.nodes[0]),
    { approved: true },
  );
  for (const decision of [
    { outcome: "completed-from-axis" },
    { approved: false },
    { approved: false, reason: " " },
    { approved: true, reason: "x".repeat(1001) },
    { approved: true, action: "APPROVE" },
  ])
    assert.throws(
      () =>
        f.owner.assertTaskActorPolicy(
          f.request,
          f.instance,
          f.owner.policyOf(f.version, f.version.graph.nodes[0]),
          decision,
        ),
      { code: "ERR_PROCESS_00029" },
    );
  f.owner.assertTaskActorPolicy(
    f.request,
    f.instance,
    f.owner.policyOf(f.version, f.version.graph.nodes[0]),
    { approved: false, reason: "Rejected" },
  );
});

test("malformed pinned declaration fails closed and cannot weaken actor-policy bounds", async () => {
  for (const patch of [
    { purpose: "MEDIA" },
    { maximumReasonLength: 1001 },
    { rejectionReasonRequired: false },
    { approveLabel: " " },
    { kind: "COMPLETE" },
    { contractVersion: 2 },
  ]) {
    const f = fixture();
    f.version.graph.nodes[0].policy = {
      decisionContract: { ...approvalContract(), ...patch },
    };
    await assert.rejects(f.owner.projectTaskDecisions(f.request, [f.task]), {
      code: "ERR_PROCESS_00029",
    });
  }
});

test("a waiting legacy version is not upgraded by successor policy or forged task metadata", async () => {
  const f = fixture();
  delete f.version.policy.actorPolicy;
  f.task.approvalPolicy.decisionContract = approvalContract();
  const [legacy] = await f.owner.projectTaskDecisions(f.request, [f.task]);
  assert.equal(legacy.decisionContract, undefined);
  assert.equal(f.instance.version, 2);
  assert.deepEqual(
    f.reads.find((read) => read.kind === "version").input.query,
    { definitionCode: f.instance.definitionCode, version: 2 },
  );
});

test("projection rejects malformed or oversized task lists before owner reads", async () => {
  for (const tasks of [null, {}, [null], Array(101).fill({})]) {
    const f = fixture();
    await assert.rejects(f.owner.projectTaskDecisions(f.request, tasks), {
      code: "ERR_PROCESS_00028",
    });
    assert.equal(f.reads.length, 0);
  }
});

/** Builds isolated generated owners with no runtime, database or activation. */
function fixture() {
  const actorPolicy = {
    permission: "example.review",
    enterpriseContextField: "enterpriseCode",
    requesterContextField: "requestedBy",
  };
  const task = {
    code: "ordinary-task",
    instanceCode: "instance-a",
    nodeCode: "review",
    status: "OPEN",
    decisionContract: { kind: "FORGED" },
    approvalPolicy: { actorPolicy: { permission: "forged" } },
  };
  const instance = {
    code: "instance-a",
    status: "WAITING",
    definitionCode: "arbitrary-domain",
    version: 2,
  };
  const version = {
    definitionCode: instance.definitionCode,
    version: 2,
    status: "PUBLISHED",
    policy: { actorPolicy },
    graph: { nodes: [{ code: "review", type: "TASK" }] },
  };
  const request = {
    tenant: "tenant-a",
    authData: { principalId: "reader-a" },
    taskCode: task.code,
  };
  const reads = [];
  const faults = {};
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code) {
        super(code);
        this.code = code;
      }
    },
  };
  const reader = (kind, row) => ({
    get: async (input) => {
      reads.push({ kind, input });
      return faults[kind] || { code: "SUC_DBS_00000", result: [row] };
    },
  });
  const owner = {
    ...lifecycle,
    instanceService: () => reader("instance", instance),
    versionService: () => reader("version", version),
    taskService: () => reader("task", task),
    auditService: () => reader("audit", {}),
  };
  global.SERVICE = { DefaultProcessRuntimeLifecycleService: owner };
  const inspector = { ...inspection, taskService: owner.taskService };
  return { owner, inspector, task, instance, version, request, reads, faults };
}

test("task detail declares the exact generic contract from pinned actor policy", async () => {
  const f = fixture();
  const response = await f.inspector.getTask(f.request);
  assert.deepEqual(response.data.decisionContract, {
    contractVersion: 1,
    kind: "APPROVAL",
    approveLabel: "Approve",
    rejectLabel: "Reject",
    reasonLabel: "Reason",
    rejectionReasonRequired: true,
    maximumReasonLength: 1000,
  });
  assert.equal(f.task.decisionContract.kind, "FORGED");
  const pinned = f.reads.find((read) => read.kind === "version");
  assert.deepEqual(pinned.input.query, {
    definitionCode: "arbitrary-domain",
    version: 2,
  });
  for (const read of f.reads.filter((read) => read.kind !== "task")) {
    assert.equal(read.input.options.skipItemCache, true);
    assert.equal(read.input.authData, f.request.authData);
    assert.equal(read.input.tenant, "tenant-a");
  }
});

test("legacy task names and forged task policy cannot manufacture approval", async () => {
  const f = fixture();
  f.task.code = "profileEmployeeApplicationReview-task";
  delete f.version.policy.actorPolicy;
  f.version.policy.taskPermission = "profile.enterpriseAccess.assign";
  const [result] = await f.owner.projectTaskDecisions(f.request, [f.task]);
  assert.equal(Object.hasOwn(result, "decisionContract"), false);
});

test("pinned task-node policy overrides version policy", async () => {
  const f = fixture();
  f.version.policy.actorPolicy = null;
  f.version.graph.nodes[0].policy = {
    actorPolicy: {
      permission: "another.review",
      enterpriseContextField: "enterprise",
      requesterContextField: "requester",
    },
  };
  assert.equal(
    (await f.owner.projectTaskDecisions(f.request, [f.task]))[0]
      .decisionContract.kind,
    "APPROVAL",
  );
  f.version.graph.nodes[0].policy.actorPolicy = null;
  await assert.rejects(f.owner.projectTaskDecisions(f.request, [f.task]), {
    code: "ERR_PROCESS_00029",
  });
});

test("malformed actor policy rejects projection rather than advertising a decision", async () => {
  for (const actorPolicy of [
    null,
    [],
    {},
    {
      permission: "p",
      enterpriseContextField: "a",
      requesterContextField: "b",
      extra: true,
    },
  ]) {
    const f = fixture();
    f.version.policy.actorPolicy = actorPolicy;
    await assert.rejects(f.owner.projectTaskDecisions(f.request, [f.task]), {
      code: "ERR_PROCESS_00029",
    });
  }
});

test("missing, failed and ambiguous owner evidence cannot declare approval", async () => {
  for (const kind of ["instance", "version"]) {
    for (const result of [
      { code: "ERR_DBS_00000", result: [] },
      { code: "SUC_DBS_00000", result: [] },
      { code: "SUC_DBS_00000", result: [{}, {}] },
    ]) {
      const f = fixture();
      f.faults[kind] = result;
      await assert.rejects(f.owner.projectTaskDecisions(f.request, [f.task]), {
        code: "ERR_PROCESS_00028",
      });
    }
  }
});

test("wrong version identity, unpublished version and missing or ambiguous task node reject", async () => {
  for (const change of [
    (f) => {
      f.version.version = 3;
    },
    (f) => {
      f.version.definitionCode = "other";
    },
    (f) => {
      f.version.status = "DRAFT";
    },
    (f) => {
      f.instance.code = "other";
    },
    (f) => {
      f.version.graph.nodes = [];
    },
    (f) => {
      f.version.graph.nodes.push({ ...f.version.graph.nodes[0] });
    },
    (f) => {
      f.version.graph.nodes[0].type = "ACTION";
    },
  ]) {
    const f = fixture();
    change(f);
    await assert.rejects(f.owner.projectTaskDecisions(f.request, [f.task]), {
      code: "ERR_PROCESS_00028",
    });
  }
});

test("list projection reuses owner reads only within the same bounded request", async () => {
  const f = fixture();
  f.inspector.taskService = () => ({
    get: async () => ({
      code: "SUC_DBS_00000",
      result: [f.task, { ...f.task, code: "second" }],
    }),
  });
  const response = await f.inspector.listTasks(f.request);
  assert.equal(response.data.length, 2);
  assert.equal(f.reads.length, 2);
  assert.notEqual(
    response.data[0].decisionContract,
    response.data[1].decisionContract,
  );
  await f.inspector.listTasks(f.request);
  assert.equal(f.reads.length, 4);
});

test("instance detail and later-layer projection use the same exported owner helper", async () => {
  const f = fixture();
  f.owner.requireInstance = async () => f.instance;
  const inherited = f.owner.taskDecisionContract;
  f.owner.taskDecisionContract = function (policy) {
    return { ...inherited.call(this, policy), approveLabel: "Confirm" };
  };
  const result = await f.owner.getInstanceDetail({
    ...f.request,
    instanceCode: f.instance.code,
  });
  assert.equal(result.data.tasks[0].decisionContract.approveLabel, "Confirm");
  assert.equal(
    (await f.inspector.getTask(f.request)).data.decisionContract.approveLabel,
    "Confirm",
  );
});
