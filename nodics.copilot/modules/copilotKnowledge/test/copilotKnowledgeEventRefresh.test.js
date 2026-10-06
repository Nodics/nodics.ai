/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @file Proves scoped event admission and canonical Process start/replay without provisioning grants, schedules or real sources. */
"use strict";
const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const events = require("../src/service/defaultCopilotKnowledgeEventRefreshService");
const manual = require("../src/service/defaultCopilotKnowledgeManualRefreshService");
const runtime = require("../src/service/defaultCopilotKnowledgeRuntimeService");
const process = require("../../../../nodics.process/modules/workflow/src/service/operation/defaultProcessRuntimeLifecycleService");
let configuration, request, calls, instances, entries, lifecycle;
beforeEach(() => {
  configuration = structuredClone(require("../config/properties").copilot);
  configuration.api = { enabled: true };
  configuration.policy = structuredClone(
    require("../../copilotPolicy/config/properties").copilot.policy,
  );
  configuration.knowledge.sourceRegistry.definitions = [
    {
      code: "runtime-docs",
      repository: "repo",
      project: "project",
      module: "module",
      owner: "owner",
      version: "v1",
      sourceType: "README",
      classification: "INTERNAL",
      paths: ["README.md"],
      secretScanPolicy: "REQUIRED",
      allowedChannels: ["SYSTEM", "EMPLOYEE"],
      requiredPermissions: ["copilot.knowledge.internal.read"],
      tenantScopes: ["tenant"],
      enterpriseScopes: ["enterprise"],
      customerProjectScopes: ["project"],
      environmentScopes: ["test"],
      enabled: true,
    },
  ];
  const assignment = {
    tenantCode: "tenant",
    enterpriseCode: "enterprise",
    projectCode: "project",
    environmentCode: "test",
    definitionCode: "copilotKnowledgeRefresh",
    version: 2,
    sourceCode: "runtime-docs",
  };
  configuration.knowledge.workflowRefresh = {
    enabled: true,
    actionAuthority: {
      connectionName: "process-owner",
      runtimeRole: "PROCESS",
      timeoutMs: 1000,
    },
    assignments: [assignment],
  };
  configuration.knowledge.eventRefresh = {
    enabled: true,
    publishers: [{ ...assignment, publisherId: "deployment-publisher" }],
  };
  request = {
    tenant: "tenant",
    authData: {
      tokenType: "service",
      principalType: "service",
      tenant: "tenant",
      serviceId: "deployment-publisher",
      entCode: "enterprise",
      runtimeInstanceId: "instance",
      modules: ["copilotApi"],
      permissions: [
        "copilot.knowledge.source.notify",
        "copilot.knowledge.source.manage",
        "copilot.knowledge.internal.read",
      ],
      runtimeScope: {
        instanceCode: "instance",
        projectCode: "project",
        environmentCode: "test",
        serverCode: "publisher",
        assignmentCode: "assignment",
      },
    },
    body: {},
  };
  calls = [];
  instances = new Map();
  entries = 0;
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code) {
        super(code);
        this.code = code;
      }
    },
  };
  global.CONFIG = {
    get: (key) =>
      key === "process"
        ? {
            runtime: {
              internalStarts: {
                enabled: true,
                allowedDefinitions: ["copilotKnowledgeRefresh"],
                permission: "process.instance.start.internal",
                maximumContextBytes: 16384,
              },
            },
          }
        : configuration,
  };
  global.SERVICE = {
    DefaultCopilotKnowledgeProcessStartService: require("../src/service/defaultCopilotKnowledgeProcessStartService"),
    DefaultCopilotKnowledgeHistoryService: require("../src/service/defaultCopilotKnowledgeHistoryService"),
    DefaultServiceTokenService: require("../../../../nodics.foundation/modules/nAuth/src/service/identity/defaultServiceTokenService"),
    DefaultCopilotPolicyService: require("../../copilotPolicy/src/service/defaultCopilotPolicyService"),
    DefaultCopilotKnowledgeSourceRegistryService: require("../src/service/defaultCopilotKnowledgeSourceRegistryService"),
    DefaultCopilotKnowledgeRuntimeService: runtime,
    DefaultCopilotKnowledgeWorkflowService: require("../src/service/defaultCopilotKnowledgeWorkflowService"),
    DefaultModuleRegistrationAgentService: {
      assertModuleOperational: async () => {},
    },
  };
  const instanceService = {
    get: async (r) => ({
      code: "SUC_DB",
      result: instances.has(r.query.code)
        ? [structuredClone(instances.get(r.query.code))]
        : [],
    }),
    save: async (r) => {
      if (instances.has(r.model.code)) throw new Error("duplicate");
      instances.set(r.model.code, structuredClone(r.model));
      return { code: "SUC_DB", result: r.model };
    },
    update: async (r) => {
      const current = instances.get(r.query.code);
      const matched =
        current &&
        current.startFingerprint === r.query.startFingerprint &&
        current.startCompleted === false;
      if (matched) Object.assign(current, r.model.$set);
      return { code: "SUC_DB", result: { modifiedCount: matched ? 1 : 0 } };
    },
  };
  lifecycle = {
    ...process,
    instanceService: () => instanceService,
    audit: async () => {},
    definitionService: () => ({
      get: async () => ({
        code: "SUC_DB",
        result: [
          {
            code: "copilotKnowledgeRefresh",
            ownerModule: "copilotApi",
            status: "PUBLISHED",
          },
        ],
      }),
    }),
    versionService: () => ({
      get: async (r) => ({
        code: "SUC_DB",
        result: [
          {
            definitionCode: "copilotKnowledgeRefresh",
            version: r.query.version,
            status: "PUBLISHED",
            policy: {
              contextAllowlist: ["sourceCode", "expectedPolicyDigest"],
            },
          },
        ],
      }),
    }),
    resolveStartVersion: async (_r, body) => ({
      definitionCode: body.definitionCode,
      version: body.version,
      graph: {},
    }),
    firstRuntimeNode: () => ({}),
    enterNode: async (_r, instance) => {
      entries++;
      return { instance };
    },
  };
  const runtimeAuth = structuredClone(request.authData);
  SERVICE.DefaultModuleService = {
    invokeModule: async (input) => {
      calls.push(input);
      assert.equal(input.requestBody.sourceModule, "copilotApi");
      return lifecycle.startOwnedInstance({
        tenant: input.tenant,
        authData: {
          ...runtimeAuth,
          serviceId: "copilot-runtime",
          modules: ["workflow", "copilotApi"],
          permissions: ["process.instance.start.internal"],
        },
        runtimeOperation: input.requestBody,
      });
    },
  };
  request.body = {
    eventId: "deployment-change-123",
    sourceCode: "runtime-docs",
    expectedPolicyDigest:
      runtime.registry(configuration).sources[0].sourcePolicyDigest,
  };
});
test("exact duplicate event uses Process replay; stable identity cannot re-enter after definition version changes", async () => {
  const first = await events.notify(request);
  const second = await events.notify(request);
  assert.equal(first.instanceCode, second.instanceCode);
  assert.equal(entries, 1);
  assert.equal(first.state, "START_ACKNOWLEDGED");
  assert.equal(first.evidence, "PROCESS_INSTANCE");
  assert.equal(calls[0].apiName, "/internal/instances");
  assert.equal(calls[0].local, false);
  assert.equal(calls[0].maxAttempts, 1);
  assert.equal(calls[0].header.authorization, undefined);
  assert.deepEqual(Object.keys(calls[0].requestBody.context).sort(), [
    "expectedPolicyDigest",
    "sourceCode",
  ]);
  configuration.knowledge.eventRefresh.publishers[0].version = 3;
  configuration.knowledge.workflowRefresh.assignments[0].version = 3;
  await assert.rejects(events.notify(request));
  assert.equal(entries, 1);
  assert.equal(calls[2].requestBody.instanceCode, first.instanceCode);
});
test("disabled bridge, wrong publisher scope, invalid payload and absent independent grants never dispatch", async () => {
  const original = structuredClone(request.authData);
  for (const patch of [
    { tokenType: "access" },
    { tenant: "foreign" },
    { entCode: "foreign" },
    { serviceId: "foreign" },
    { modules: ["workflow"] },
    {
      permissions: [
        "copilot.knowledge.source.manage",
        "copilot.knowledge.internal.read",
      ],
    },
    { permissions: ["copilot.knowledge.source.notify"] },
  ]) {
    request.authData = { ...original, ...patch };
    await assert.rejects(events.notify(request));
  }
  request.authData = original;
  const body = structuredClone(request.body);
  for (const patch of [
    { eventId: 123 },
    { eventId: "../bad" },
    { sourceCode: "foreign" },
    { expectedPolicyDigest: "a".repeat(64) },
    { sourcePath: "/private" },
  ]) {
    request.body = { ...body, ...patch };
    await assert.rejects(events.notify(request));
  }
  request.body = body;
  configuration.knowledge.eventRefresh.enabled = false;
  await assert.rejects(events.notify(request));
  assert.equal(calls.length, 0);
});
test("source exclusion, inactive group and ambiguous publisher assignment fail before Process", async () => {
  configuration.knowledge.sourceRegistry.definitions[0].enabled = false;
  await assert.rejects(events.notify(request));
  configuration.knowledge.sourceRegistry.definitions[0].enabled = true;
  configuration.knowledge.eventRefresh.publishers.push(
    configuration.knowledge.eventRefresh.publishers[0],
  );
  await assert.rejects(events.notify(request));
  configuration.knowledge.eventRefresh.publishers.pop();
  configuration.knowledge.groups = {
    enabled: true,
    definitions: [],
    assignments: [],
  };
  SERVICE.DefaultCopilotKnowledgeGroupService = require("../src/service/defaultCopilotKnowledgeGroupService");
  await assert.rejects(events.notify(request));
  assert.equal(calls.length, 0);
});
test("lost response is unconfirmed and explicit same-event delivery inspects the existing completed start", async () => {
  const invoke = SERVICE.DefaultModuleService.invokeModule;
  SERVICE.DefaultModuleService.invokeModule = async (input) => {
    await invoke(input);
    throw new Error("private host");
  };
  await assert.rejects(events.notify(request), /ERR_CPK_00021/);
  assert.equal(entries, 1);
  assert.equal(calls.length, 1);
  SERVICE.DefaultModuleService.invokeModule = invoke;
  await events.notify(request);
  assert.equal(entries, 1);
  instances.values().next().value.startCompleted = false;
  await assert.rejects(events.notify(request));
  assert.equal(entries, 1);
});
test("failed, foreign and partially acknowledged owner responses never fabricate accepted events", async () => {
  const invoke = SERVICE.DefaultModuleService.invokeModule;
  for (const alter of [
    (r) => { r.acknowledged = false; },
    (r) => { r.data.acknowledged = false; },
    (r) => {
      r.errors = ["partial"];
    },
    (r) => {
      r.data.instance.code = "foreign";
    },
    (r) => {
      r.data.instance.version = 99;
    },
    (r) => {
      r.data.instance.startCompleted = false;
    },
    (r) => {
      r.data.instance.context.sourceCode = "foreign";
    },
  ]) {
    SERVICE.DefaultModuleService.invokeModule = async (input) => {
      const response = await invoke(input);
      alter(response);
      return response;
    };
    await assert.rejects(events.notify(request));
  }
  assert.equal(entries, 1);
});

/** Converts the source fixture to a verified human request; nService still supplies its own runtime identity. */
function employeeRequest() {
  configuration.knowledge.workflowRefresh.manualEnabled = true;
  request.securityContext = {
    channel: "EMPLOYEE", principalType: "EMPLOYEE", actor: "operator",
    tenant: "tenant", enterprise: "enterprise", customerProject: "project", environment: "test",
    permissions: ["copilot.knowledge.internal.read", "copilot.knowledge.source.manage"],
  };
  request.authData = { tokenType: "access", principalType: "human", tenant: "tenant", entCode: "enterprise", loginId: "operator" };
  request.sourceCode = "runtime-docs";
  request.body = { requestId: "11111111-1111-4111-8111-111111111111", expectedPolicyDigest: request.body.expectedPolicyDigest };
  return request;
}
test("manual review is non-mutating; confirmed duplicate identity uses Process replay without re-entering nodes", async () => {
  employeeRequest();
  const review = manual.preview(request);
  assert.equal(calls.length, 0);
  assert.equal(review.target, undefined);
  assert.equal(review.state, "REVIEW");
  request.body = { ...request.body, reviewDigest: review.reviewDigest, confirmed: true };
  const first = await manual.start(request);
  await manual.start(request);
  assert.equal(first.instanceCode, review.instanceCode);
  assert.equal(first.state, "START_ACKNOWLEDGED");
  assert.equal(entries, 1);
  assert.equal(calls[0].maxAttempts, 1);
  assert.equal(calls[0].header.authorization, undefined);
  assert.throws(() => runtime.refresh(request), /ERR_CPK_00023/);
});
test("manual starts reject stale review, changed assignment, missing grants, unknown input and disabled gates before dispatch", async () => {
  employeeRequest();
  const review = manual.preview(request);
  const original = structuredClone(request);
  for (const change of [
    () => { request.body.confirmed = false; },
    () => { request.body.reviewDigest = "a".repeat(64); },
    () => { request.body.connectionName = "other"; },
    () => { request.body.expectedPolicyDigest = "b".repeat(64); },
    () => { request.securityContext.permissions = ["copilot.knowledge.internal.read"]; },
    () => { request.securityContext.enterprise = "foreign"; },
    () => { request.securityContext.actor = "other"; },
  ]) {
    request = structuredClone(original);
    request.body = { ...request.body, reviewDigest: review.reviewDigest, confirmed: true };
    change();
    await assert.rejects(manual.start(request));
  }
  request = structuredClone(original);
  request.body = { ...request.body, reviewDigest: review.reviewDigest, confirmed: true };
  configuration.knowledge.workflowRefresh.assignments[0].version = 3;
  await assert.rejects(manual.start(request));
  configuration.knowledge.workflowRefresh.manualEnabled = false;
  assert.throws(() => manual.preview(original));
  assert.equal(calls.length, 0);
});
test("manual lost acknowledgement remains unknown and original inspection is read-only even with the manual gate disabled", async () => {
  employeeRequest();
  const review = manual.preview(request);
  request.body = { ...request.body, reviewDigest: review.reviewDigest, confirmed: true };
  const invoke = SERVICE.DefaultModuleService.invokeModule;
  SERVICE.DefaultModuleService.invokeModule = async (input) => {
    await invoke(input);
    throw new Error("private transport details");
  };
  await assert.rejects(manual.start(request), /ERR_CPK_00024/);
  assert.equal(entries, 1);
  assert.equal(calls.length, 1);
  configuration.knowledge.workflowRefresh.manualEnabled = false;
  request.body = { requestId: review.requestId };
  let inspection;
  SERVICE.DefaultModuleService.invokeModule = async (input) => {
    inspection = input;
    return { code: "SUC_PROCESS", data: {
      contractVersion: 2, evidence: "PROCESS_ACTION_ATTEMPTS", scope: input.requestBody.expectedScope,
      page: 1, limit: 25, hasMore: false, items: [],
    } };
  };
  const result = await manual.inspect(request);
  assert.equal(result.state, "OUTCOME_UNKNOWN");
  assert.equal(inspection.apiName, "/actions/history/query");
  assert.equal(inspection.requestBody.instanceCode, review.instanceCode);
  assert.equal(entries, 1);
  assert.equal(calls.length, 1);
});
test("manual command identity survives mutable policy/version changes but differs across employees and source scopes", () => {
  employeeRequest();
  const original = manual.select(request);
  configuration.knowledge.workflowRefresh.assignments[0].version = 3;
  const updated = manual.select(request);
  assert.equal(updated.instanceCode, original.instanceCode);
  assert.notEqual(updated.reviewDigest, original.reviewDigest);
  request.securityContext.actor = "other";
  request.authData.loginId = "other";
  assert.notEqual(manual.select(request).instanceCode, original.instanceCode);
});
test("manual inspection rejects foreign rows and permission changes without issuing a start", async () => {
  employeeRequest();
  const review = manual.preview(request);
  request.body = { requestId: review.requestId };
  let foreign = false, revoke = false, denied = false;
  SERVICE.DefaultModuleService.invokeModule = async (input) => {
    calls.push(input);
    if (revoke) request.securityContext.permissions = [];
    return { code: "SUC_PROCESS", data: {
      contractVersion: 2, evidence: "PROCESS_ACTION_ATTEMPTS", scope: input.requestBody.expectedScope,
      page: 1, limit: 25, hasMore: false, acknowledged: !denied,
      items: [{ instanceCode: foreign ? "foreign" : review.instanceCode,
        definitionCode: review.definitionCode, version: review.version,
        executionCode: "12345678-1234-4234-8234-123456789012", status: "COMPLETED",
        expiresAt: Date.now() + 1000, startedAt: "2026-10-04T00:00:00Z", completedAt: "2026-10-04T00:01:00Z",
        context: { sourceCode: request.sourceCode, expectedPolicyDigest: review.sourcePolicyDigest } }],
    } };
  };
  assert.equal((await manual.inspect(request)).state, "ATTEMPTS_AVAILABLE");
  foreign = true;
  await assert.rejects(manual.inspect(request));
  foreign = false; denied = true;
  await assert.rejects(manual.inspect(request));
  denied = false; revoke = true;
  await assert.rejects(manual.inspect(request));
  assert.equal(entries, 0);
  assert.ok(calls.every((input) => input.apiName === "/actions/history/query"));
});
test("manual acknowledgement followed by source revocation stays unconfirmed without resending", async () => {
  employeeRequest();
  const review = manual.preview(request);
  request.body = { ...request.body, confirmed: true, reviewDigest: review.reviewDigest };
  const invoke = SERVICE.DefaultModuleService.invokeModule;
  SERVICE.DefaultModuleService.invokeModule = async (input) => {
    const result = await invoke(input);
    configuration.knowledge.sourceRegistry.definitions[0].enabled = false;
    return result;
  };
  await assert.rejects(manual.start(request), /ERR_CPK_00024/);
  assert.equal(entries, 1);
  assert.equal(calls.length, 1);
});
test("manual routes are human-only and uncached; inspection has no management grant requirement", () => {
  const statuses = require("../src/utils/statusDefinitions");
  assert.equal(statuses.ERR_CPK_00023.code, "503");
  assert.equal(statuses.ERR_CPK_00024.code, "503");
  assert.match(statuses.ERR_CPK_00022.message, /maintenance/);
  const routes = require("../../copilotApi/src/router/routers").copilotApi.knowledge;
  for (const key of ["manualRefreshPreview", "manualRefreshStart", "manualRefreshInspect"]) {
    assert.deepEqual(routes[key].authTokenTypes, ["access"]);
    assert.deepEqual(routes[key].accessGroups, ["employeeUserGroup"]);
    assert.equal(routes[key].cache.enabled, false);
  }
  assert.equal(routes.manualRefreshInspect.permission, "copilot.knowledge.internal.read");
  assert.equal(require("../config/properties").copilot.knowledge.workflowRefresh.manualEnabled, false);
});
test("policy revocation during acknowledged start hides response and does not automatically resend", async () => {
  const invoke = SERVICE.DefaultModuleService.invokeModule;
  SERVICE.DefaultModuleService.invokeModule = async (input) => {
    const response = await invoke(input);
    configuration.knowledge.eventRefresh.enabled = false;
    return response;
  };
  await assert.rejects(events.notify(request));
  assert.equal(calls.length, 1);
  assert.equal(entries, 1);
});
test("source event route is independent, service-only, internal and uncached", () => {
  const route = require("../../copilotApi/src/router/routers").copilotApi
    .workflow.sourceChanged;
  assert.deepEqual(route.authTokenTypes, ["service"]);
  assert.equal(route.apiExposure, "moduleInternal");
  assert.equal(route.permission, "copilot.knowledge.source.notify");
  assert.equal(route.cache.enabled, false);
  assert.equal(
    require("../config/properties").copilot.knowledge.eventRefresh.enabled,
    false,
  );
});
