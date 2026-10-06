/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module copilotWorkbench/test/copilotSchemaAction @description Verifies selected and allowlisted generated schema create, update, and delete retain native descriptor authority, complete review, exact routing, and current-source rechecks. @layer test @owner copilotWorkbench */
const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const adapter = require("../src/service/defaultCopilotSchemaActionService");
const recovery = require("../src/service/defaultCopilotActionRecoveryService");

class NodicsError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

const digest = (value) =>
  crypto
    .createHash("sha256")
    .update(JSON.stringify(value, Object.keys(value || {}).sort()))
    .digest("hex");

const configuration = {
  workbench: {
    schemaActions: {
      enabled: true,
      sources: { commerceData: ["product"] },
      timeoutMs: 30000,
    },
  },
};

const descriptor = {
  moduleName: "product",
  schemaName: "product",
  label: "Product",
  mutationMode: "GENERATED_CRUD",
  authoring: { authoringAllowed: true },
  operations: ["search", "read", "create", "update", "delete"],
  form: {},
  concurrency: {
    mode: "COMPARE_AND_SET",
    field: "revision",
    required: true,
    managed: true,
  },
  fields: [
    { name: "code", primary: true, required: true },
    { name: "name", required: true },
    { name: "status" },
    { name: "revision", readOnly: true },
    { name: "secret", sensitive: true },
  ],
  apiOperations: {
    create: {
      method: "PUT",
      path: "/product",
      apiVersion: "v0",
      active: true,
    },
    update: {
      method: "PATCH",
      path: "/product",
      apiVersion: "v0",
      active: true,
    },
    delete: {
      method: "DELETE",
      path: "/product",
      apiVersion: "v0",
      active: true,
    },
  },
};

function fixture() {
  const grants = new Set([
    "copilot.data.query",
    "copilot.mutation.prepare",
    "copilot.mutation.execute",
    "system.schema.manage",
  ]);
  const calls = [];
  const source = {
    code: "commerceData",
    module: "product",
    sourcePolicyDigest: "policy-digest",
    paths: ["product"],
    excludedPaths: [],
  };
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
    DefaultCopilotDatabaseSourceService: {
      authorize: (request) => {
        if (
          request.sourceCode !== source.code ||
          request.securityContext?.actor !== "employee" ||
          request.securityContext?.enterprise !== "acme" ||
          request.securityContext?.tenant !== "master"
        )
          throw new NodicsError("ERR_CPK_00002");
        return source;
      },
      selected: (current, schemaName) =>
        current.paths.includes(schemaName) &&
        !current.excludedPaths.includes(schemaName),
      descriptors: async () => [descriptor],
    },
    DefaultCopilotSchemaActionService: adapter,
    DefaultCopilotWorkbenchService: {
      persistPrepared: async (plan) => ({ plan, preview: plan.preview }),
    },
    DefaultModelCommandReceiptService: {
      digest,
      result: (response) => {
        if (!response || !/^SUC_/.test(response.code || "") || !response.result)
          throw new NodicsError("ERR_DBS_00003");
        return response.result;
      },
    },
    DefaultSchemaCommandReceiptService: {
      affected: (value) =>
        value.matchedCount ?? value.modifiedCount ?? value.deletedCount,
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
        return {
          code: "SUC_DBS_00000",
          result:
            invocation.methodName === "PUT"
              ? { code: "SKU-1" }
              : invocation.methodName === "PATCH"
                ? { matchedCount: 1 }
                : { deletedCount: 1 },
        };
      },
    },
  };
  return { grants, calls, source };
}

const commands = {
  "data.record.create": {
    model: { code: "SKU-1", name: "Reviewed product", status: "ACTIVE" },
  },
  "data.record.update": {
    identity: { code: "SKU-1", revision: 2 },
    changes: { name: "Reviewed product v2" },
  },
  "data.record.delete": {
    identity: { code: "SKU-1", revision: 2 },
  },
};

for (const [operation, values] of Object.entries(commands))
  test(
    operation + " reviews and dispatches one fixed native route",
    async () => {
      const f = fixture();
      const request = {
        tenant: "master",
        authData: { loginId: "employee" },
        body: {
          operation,
          sourceCode: "commerceData",
          schemaName: "product",
          ...values,
        },
      };
      const prepared = await adapter.prepare(request, configuration);
      const labels = prepared.plan.preview.review.flatMap((section) =>
        section.fields.map((field) => field.label),
      );
      assert.ok(labels.includes("Operation"));
      assert.ok(labels.includes("Knowledge source"));
      assert.ok(labels.some((label) => label.startsWith("Command")));
      const action = { capability: operation, audit: { plan: prepared.plan } };
      assert.deepEqual(await adapter.execute(action, request, configuration), {
        code: "SUC_COPILOT_DOMAIN",
        result: { code: "SKU-1" },
      });
      assert.equal(f.calls.length, 1);
      assert.equal(f.calls[0].moduleName, "product");
      assert.equal(f.calls[0].apiName, "/product");
      assert.equal(f.calls[0].maxAttempts, 1);
      assert.equal(f.calls[0].header.Authorization, "Bearer original");
      assert.equal(
        f.calls[0].header["Idempotency-Key"],
        prepared.plan.id + ":row",
      );
    },
  );

test("selection, allowlist, native permission, business form, and sensitive fields fail closed", async () => {
  const f = fixture();
  const request = {
    tenant: "master",
    body: {
      operation: "data.record.create",
      sourceCode: "commerceData",
      schemaName: "product",
      model: { code: "SKU-1", name: "One" },
    },
  };
  f.source.excludedPaths.push("product");
  await assert.rejects(adapter.prepare(request, configuration));
  f.source.excludedPaths.length = 0;
  const disabled = structuredClone(configuration);
  disabled.workbench.schemaActions.sources.commerceData = [];
  await assert.rejects(adapter.prepare(request, disabled));
  f.grants.delete("system.schema.manage");
  await assert.rejects(
    adapter.prepare(request, configuration),
    /ERR_CPW_00002/,
  );
  f.grants.add("system.schema.manage");
  descriptor.form.createOperation = { operation: "business.setup" };
  await assert.rejects(adapter.prepare(request, configuration));
  delete descriptor.form.createOperation;
  request.body.model.secret = "not accepted";
  await assert.rejects(adapter.prepare(request, configuration));
});

test("missing values clarify and unknown fields, wildcard mutation, and drift reject", async () => {
  fixture();
  assert.deepEqual(
    adapter.command(
      {
        operation: "data.record.update",
        sourceCode: "commerceData",
        schemaName: "product",
      },
      descriptor,
    ),
    { state: "CLARIFICATION_REQUIRED", missing: ["identity", "changes"] },
  );
  assert.throws(
    () =>
      adapter.command(
        {
          operation: "data.record.delete",
          sourceCode: "commerceData",
          schemaName: "product",
          identity: { code: "SKU-1", revision: 1 },
          endpoint: "/anything",
        },
        descriptor,
      ),
    /ERR_CPW_00004/,
  );
  const wildcard = structuredClone(configuration);
  wildcard.workbench.schemaActions.sources.commerceData = ["*"];
  assert.throws(
    () => adapter.settings(wildcard, "commerceData", "product"),
    /ERR_CPW_00004/,
  );
  const typed = JSON.stringify({
    operation: "data.record.delete",
    sourceCode: "commerceData",
    schemaName: "product",
    identity: { code: "SKU-1", revision: 1 },
  });
  assert.equal(adapter.parseIntent(typed).operation, "data.record.delete");
  assert.equal(adapter.parseIntent("delete product SKU-1"), null);
});

test("original update receipt selection binds the exact source, schema input and result identity", async () => {
  fixture();
  const request = {
    tenant: "master",
    authData: { loginId: "employee" },
    body: {
      operation: "data.record.update",
      sourceCode: "commerceData",
      schemaName: "product",
      identity: { code: "SKU-1", revision: 2 },
      changes: { name: "Reviewed product v2" },
    },
  };
  const prepared = await adapter.prepare(request, configuration);
  const action = {
    capability: "data.record.update",
    audit: { plan: prepared.plan },
  };
  const selected = recovery.target(
    request,
    action,
    { schema: "governedSchemaAction", record: prepared.plan.records[0] },
    configuration,
  );
  assert.equal(selected.moduleName, "product");
  assert.equal(selected.operation, "product.update");
  assert.equal(selected.apiName, "/product/commands/inspect");
  assert.equal(selected.body.operation, "update");
  assert.deepEqual(selected.body.input, prepared.plan.records[0].receiptInput);
  assert.equal(
    selected.expectedResultIdentity,
    "update:" + digest(prepared.plan.records[0].receiptInput.query),
  );
});
