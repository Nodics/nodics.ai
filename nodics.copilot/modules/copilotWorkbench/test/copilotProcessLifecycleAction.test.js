/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module copilotWorkbench/test/copilotProcessLifecycleAction @description Verifies all fixed Process definition and instance commands retain exact review, authority, routing and result validation. @layer test @owner copilotWorkbench */
const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const adapter = require("../src/service/defaultCopilotProcessLifecycleActionService");

class NodicsError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

const digest = (value) =>
  crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
const definitions = {
  "process.definition.create": {
    definitionCode: "approval",
    name: "Approval",
    graph: { nodes: [{ code: "start", type: "START" }] },
  },
  "process.definition.update": {
    definitionCode: "approval",
    name: "Approval v2",
  },
  "process.definition.prepare": { definitionCode: "approval" },
  "process.definition.validate": { definitionCode: "approval" },
  "process.definition.publish": { definitionCode: "approval" },
  "process.definition.delete": { definitionCode: "approval" },
  "process.instance.start": {
    instanceCode: "approval-1",
    definitionCode: "approval",
    context: { enterpriseCode: "acme" },
  },
  "process.instance.cancel": {
    instanceCode: "approval-1",
    reason: "Request withdrawn",
  },
  "process.instance.retry": { instanceCode: "approval-1", expectedAttempt: 1 },
  "process.instance.compensate": {
    instanceCode: "approval-1",
    payload: { reason: "Rollback" },
  },
};

const configuration = {
  workbench: {
    processLifecycleTarget: {
      enabled: true,
      moduleName: "workflow",
      connectionName: "processServer",
      targetAuthority: { runtimeRole: "PROCESS" },
    },
    processLifecycleTimeoutMs: 30000,
  },
};

function fixture(operation) {
  const grants = new Set([
    "copilot.mutation.prepare",
    "copilot.mutation.execute",
    adapter.declaration(operation).permission,
  ]);
  const calls = [];
  global.CLASSES = { NodicsError };
  global.CONFIG = { get: () => configuration };
  global.SERVICE = {
    DefaultCopilotOrchestrationService: {
      securityContext: () => ({
        channel: "EMPLOYEE",
        actor: "employee",
        enterprise: "acme",
        tenant: "master",
      }),
      employeeExecutionHeaders: () => ({ Authorization: "Bearer original" }),
    },
    DefaultCopilotPolicyService: {
      hasPermission: (_context, grant) => grants.has(grant),
    },
    DefaultCopilotWorkbenchService: {
      persistPrepared: async (plan) => ({ plan, preview: plan.preview }),
    },
    DefaultModelCommandReceiptService: {
      digest,
      result: (response) => {
        if (
          !response ||
          response.error ||
          response.success === false ||
          response.result === undefined
        )
          throw new NodicsError("ERR_DBS_00004");
        return response.result;
      },
    },
    DefaultCopilotActionExecutionService: {
      execute: async (action, request, context, executionRequest, invoke) =>
        invoke(
          { record: action.audit.plan.records[0] },
          action.audit.plan.id + ":row",
        ),
    },
    DefaultLoggerService: { inheritRequestPrivacy: () => undefined },
    DefaultModuleService: {
      invokeModule: async (invocation) => {
        calls.push(invocation);
        const kind = adapter.declaration(operation).kind;
        if (operation === "process.definition.create")
          return {
            code: "SUC_PROCESS_00001",
            data: {
              code: "approval",
              status: "DRAFT",
              currentVersion: 0,
              draftRevision: 1,
            },
          };
        if (operation === "process.definition.update")
          return {
            code: "SUC_PROCESS_00002",
            data: { code: "approval", draftRevision: 2 },
          };
        if (operation === "process.definition.prepare")
          return {
            code: "SUC_PROCESS_00006",
            data: { code: "approval", status: "DRAFT" },
          };
        if (operation === "process.definition.validate")
          return { code: "SUC_PROCESS_00003", data: { valid: true } };
        if (operation === "process.definition.publish")
          return {
            code: "SUC_PROCESS_00004",
            data: { code: "approval", version: 1, checksum: "a".repeat(64) },
          };
        if (operation === "process.definition.delete")
          return {
            code: "SUC_PROCESS_00005",
            data: { code: "approval", status: "ARCHIVED" },
          };
        if (kind === "start")
          return {
            code: "SUC_PROCESS_00007",
            data: {
              instance: {
                code: "approval-1",
                status: "WAITING",
                startCompleted: true,
              },
            },
          };
        if (kind === "cancel")
          return {
            code: "SUC_PROCESS_00009",
            data: { code: "approval-1", status: "CANCELLED" },
          };
        if (kind === "retry")
          return {
            code: "SUC_PROCESS_00012",
            data: {
              instance: { code: "approval-1" },
              incident: { status: "RESOLVED" },
            },
          };
        return {
          code: "SUC_PROCESS_00013",
          data: { instanceCode: "approval-1", compensationStatus: "COMPLETED" },
        };
      },
    },
  };
  return { grants, calls };
}

for (const [operation, values] of Object.entries(definitions)) {
  test(
    operation +
      " prepares every field and dispatches its fixed owner route once",
    async () => {
      const f = fixture(operation);
      const request = {
        tenant: "master",
        authData: { loginId: "employee" },
        body: { operation, ...values },
      };
      const prepared = await adapter.prepare(request, configuration);
      const reviewed = prepared.plan.preview.review.flatMap((section) =>
        section.fields.map((field) => field.label),
      );
      assert.ok(reviewed.includes("Operation"));
      assert.ok(
        reviewed.some((label) => label.startsWith("Command")) ||
          !Object.keys(prepared.plan.records[0].command).length,
      );
      const action = { capability: operation, audit: { plan: prepared.plan } };
      assert.deepEqual(await adapter.execute(action, request, configuration), {
        code: "SUC_COPILOT_DOMAIN",
        result: { code: values.instanceCode || values.definitionCode },
      });
      assert.equal(f.calls.length, 1);
      assert.equal(f.calls[0].moduleName, "workflow");
      assert.equal(f.calls[0].maxAttempts, 1);
      assert.equal(f.calls[0].header.Authorization, "Bearer original");
      assert.equal(
        f.calls[0].header["Idempotency-Key"],
        prepared.plan.id + ":row",
      );
    },
  );
}

test("missing material values clarify while unknown fields, credentials, foreign grants and target drift reject", async () => {
  const f = fixture("process.instance.start");
  const request = {
    tenant: "master",
    body: { operation: "process.instance.start", instanceCode: "one" },
  };
  assert.deepEqual(adapter.input(request.body), {
    state: "CLARIFICATION_REQUIRED",
    missing: ["definitionCode", "context"],
  });
  assert.throws(
    () =>
      adapter.input({
        ...request.body,
        definitionCode: "flow",
        context: {},
        endpoint: "/anything",
      }),
    /ERR_CPW_00004/,
  );
  assert.throws(
    () =>
      adapter.input({
        operation: "process.instance.start",
        instanceCode: "one",
        definitionCode: "flow",
        context: { apiToken: "hidden" },
      }),
    /ERR_CPW_00004/,
  );
  f.grants.delete("process.instance.start");
  assert.throws(
    () => adapter.authorize(request, configuration, "process.instance.start"),
    /ERR_CPW_00002/,
  );
  assert.throws(
    () =>
      adapter.target({
        workbench: {
          processLifecycleTarget: {
            ...configuration.workbench.processLifecycleTarget,
            connectionName: "default",
          },
        },
      }),
    /ERR_CPW_00004/,
  );
});

test("typed and exact short forms never invent lifecycle inputs", () => {
  fixture("process.definition.publish");
  assert.deepEqual(adapter.parseIntent("publish process definition approval"), {
    operation: "process.definition.publish",
    definitionCode: "approval",
  });
  assert.deepEqual(adapter.parseIntent("start process instance approval-1"), {
    operation: "process.instance.start",
    instanceCode: "approval-1",
  });
  assert.equal(adapter.parseIntent("please change everything"), null);
  assert.equal(adapter.parseIntent("execute process instance one"), null);
});
