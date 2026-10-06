/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module copilotWorkbench/test/copilotActionExecution @description Verifies atomic action claims, immutable related rows, enterprise isolation and no replay after uncertain domain outcomes. @layer test @owner copilotWorkbench */
const test = require("node:test");
const assert = require("node:assert/strict");
const execution = require("../src/service/defaultCopilotActionExecutionService");
const workbench = require("../src/service/defaultCopilotWorkbenchService");
const policy = require("../../copilotPolicy/src/service/defaultCopilotPolicyService");
const core = require("../../copilotCore/src/service/defaultCopilotOrchestrationService");

test("explicitly unacknowledged domain or action-journal responses cannot authorize completion", async (t) => {
  assert.equal(
    execution.persisted(
      { code: "SUC_TEST", acknowledged: false, result: { code: "item" } },
      "item",
    ),
    false,
  );
  assert.equal(
    execution.persisted(
      { code: "SUC_TEST", result: { code: "item", acknowledged: false } },
      "item",
    ),
    false,
  );
  const f = fixture(t);
  for (const response of [
    { code: "SUC_TEST", acknowledged: false, result: { matchedCount: 1 } },
    { code: "SUC_TEST", result: { matchedCount: 1, acknowledged: false } },
  ]) {
    SERVICE.DefaultCopilotActionService.update = async () => response;
    await assert.rejects(
      execution.transition(f.stored(), "EXECUTING", {}, f.request),
    );
  }
});

test("invalid related prices return indexed validation without saving an approval", async (t) => {
  const f = fixture(t);
  global.SERVICE.DefaultCopilotPolicyService = policy;
  global.SERVICE.DefaultCopilotWorkbenchService = workbench;
  let saved = 0;
  global.SERVICE.DefaultCopilotActionService.save = async () => {
    saved++;
  };
  const service = {
    ...core,
    configuration: () => ({}),
    assertEnabled: () => true,
    securityContext: () => f.context,
  };
  SERVICE.DefaultCopilotOrchestrationService = service;
  const result = await service.prepareProductPlan({
    ...f.request,
    body: {
      count: 2,
      name: "Product",
      codePrefix: "P",
      catalogVersion: "staged",
      priceBookCode: "retail",
      currency: "AED",
      price: "-1",
    },
  });
  assert.equal(result.plan.state, "INVALID");
  assert.deepEqual(
    result.plan.errors,
    [0, 1].map((index) => ({
      schema: "priceRow",
      index,
      error: "unitAmount",
    })),
  );
  assert.equal(saved, 0);
});

for (const change of ["target", "permission", "enabled"]) {
  test(
    "Product rechecks " + change + " before each native dispatch",
    async (t) => {
      const f = fixture(t);
      const configuration = {
        core: {},
        api: { enabled: true },
        workbench: {
          target: {
            productModule: "product",
            pricingModule: "pricing",
            connectionName: "owner",
          },
        },
      };
      const target = core.actionTarget(configuration);
      f.action.audit.plan.executionTarget = target;
      f.action.audit.challenge = {
        ...policy.createConfirmation(f.action.audit.plan, f.context),
        confirmed: true,
      };
      let dispatched = 0;
      const service = {
        ...core,
        configuration: () => configuration,
        securityContext: () => f.context,
        getOwnedAction: async () => f.action,
        employeeExecutionHeaders: () => ({ Authorization: "Bearer employee" }),
        createOwnedSchemaRecord: async () => {
          dispatched++;
          if (change === "target")
            configuration.workbench.target.connectionName = "changed";
          if (change === "permission") f.context.permissions = [];
          if (change === "enabled") configuration.api.enabled = false;
          return { code: "SUC_DB", result: { code: "P-001" } };
        },
      };
      SERVICE.DefaultCopilotPolicyService = policy;
      SERVICE.DefaultCopilotActionExecutionService = {
        execute: async (_action, _input, _context, _request, submit) => {
          const rows = execution.rows(f.action.audit.plan);
          await submit(rows[0], "first");
          await submit(rows[1], "second");
        },
      };
      await assert.rejects(service.executeProductPlan(f.request));
      assert.equal(dispatched, 1);
    },
  );
}

test("contradictory successful claim envelopes cannot authorize a domain write", async (t) => {
  const f = fixture(t);
  for (const response of [
    { code: "SUC_DB", result: { matchedCount: 1 }, success: false },
    { code: "SUC_DB", result: { matchedCount: 1 }, errors: ["failed"] },
    { code: "SUC_DB", result: { matchedCount: 1, error: "failed" } },
    { code: "SUC_DB", result: { matchedCount: 1, errors: {} } },
  ]) {
    SERVICE.DefaultCopilotActionService.update = async () => response;
    await assert.rejects(
      execution.execute(
        f.action,
        f.input,
        f.context,
        f.request,
        async () => {
          assert.fail("An uncertain claim must never submit");
        },
        policy,
      ),
    );
  }
});

test("Product confirmation requires an exact persisted private action acknowledgement", async (t) => {
  const f = fixture(t);
  SERVICE.DefaultCopilotPolicyService = policy;
  SERVICE.DefaultCopilotWorkbenchService = workbench;
  SERVICE.DefaultCopilotActionExecutionService = execution;
  const service = {
    ...core,
    configuration: () => ({}),
    assertEnabled: () => true,
    securityContext: () => f.context,
  };
  SERVICE.DefaultCopilotOrchestrationService = service;
  const request = {
    ...f.request,
    body: {
      count: 1,
      name: "Product",
      codePrefix: "P",
      catalogVersion: "staged",
      priceBookCode: "retail",
      currency: "AED",
      price: "2",
    },
  };
  for (const response of [
    undefined,
    { code: "SUC_DB" },
    { code: "ERR_DB", result: {} },
  ]) {
    SERVICE.DefaultCopilotActionService.save = async () => response;
    await assert.rejects(service.prepareProductPlan(request), {
      code: "ERR_CPW_00003",
    });
  }
  SERVICE.DefaultCopilotActionService.save = async (r) => ({
    code: "SUC_DB",
    result: r.model,
  });
  assert.equal(
    (await service.prepareProductPlan(request)).state,
    "AWAITING_CONFIRMATION",
  );
});

test("loss of row-journal acknowledgement after domain success never permits replay", async (t) => {
  const f = fixture(t);
  const update = global.SERVICE.DefaultCopilotActionService.update;
  global.SERVICE.DefaultCopilotActionService.update = async (input) => {
    if (input.model.audit.rows[0].state === "COMPLETED")
      throw new Error("storage unavailable");
    return update(input);
  };
  let submitted = 0;
  await assert.rejects(
    execution.execute(
      f.action,
      f.input,
      f.context,
      f.request,
      async (row) => {
        submitted++;
        return {
          code: "SUC_DBS_00000",
          result: { code: row.record.code },
        };
      },
      policy,
    ),
    { code: "ERR_CPW_00003" },
  );
  assert.equal(submitted, 1);
  assert.equal(f.stored().audit.rows[0].state, "RUNNING");
  await assert.rejects(
    execution.execute(
      f.stored(),
      { ...f.input, expectedRevision: f.stored().audit.revision },
      f.context,
      f.request,
      async () => {
        submitted++;
      },
      policy,
    ),
  );
  assert.equal(submitted, 1);
});

/** Installs a CAS-capable generated-service fixture with isolated global dependencies. @param {Object} t Test context. @returns {Object} Action fixture. */
function fixture(t) {
  const previous = { SERVICE: global.SERVICE, CLASSES: global.CLASSES };
  t.after(() => {
    global.SERVICE = previous.SERVICE;
    global.CLASSES = previous.CLASSES;
  });
  const context = {
    tenant: "tenant",
    actor: "employee",
    enterprise: "enterprise",
    permissions: ["copilot.mutation.prepare", "copilot.mutation.execute"],
  };
  const plan = workbench.validate(
    workbench.prepareProducts({
      count: 2,
      name: "Product",
      codePrefix: "P",
      catalogVersion: "staged",
      priceBookCode: "retail",
      currency: "AED",
      price: "5.25",
      planId: "plan",
    }),
    () => [],
  );
  const challenge = {
    ...policy.createConfirmation(plan, context),
    confirmed: true,
  };
  let stored = {
    code: "plan",
    tenantCode: "tenant",
    enterpriseCode: "enterprise",
    principalCode: "employee",
    state: "APPROVED",
    audit: { plan, challenge, revision: 1 },
  };
  const action = structuredClone(stored);
  const request = {
    tenant: "tenant",
    authData: { loginId: "employee", enterpriseCode: "enterprise" },
  };
  const calls = [];
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code) {
        super(code);
        this.code = code;
      }
    },
  };
  global.SERVICE = {
    DefaultCopilotActionService: {
      update: async (input) => {
        calls.push(input);
        const matches = Object.entries(input.query).every(
          ([key, value]) =>
            (key === "audit.revision" ? stored.audit.revision : stored[key]) ===
            value,
        );
        if (matches) stored = { ...stored, ...structuredClone(input.model) };
        return {
          code: "SUC_DBS_00000",
          result: { matchedCount: matches ? 1 : 0 },
        };
      },
    },
  };
  return {
    action,
    context,
    request,
    input: { expectedRevision: 1, argumentsDigest: challenge.planDigest },
    calls,
    stored: () => stored,
  };
}

test("one concurrent claimant executes each row once and retains final outcomes", async (t) => {
  const f = fixture(t);
  const submitted = [];
  const submit = async (row) => {
    submitted.push(row.record.code);
    return { code: "SUC_DBS_00000", result: [{ code: row.record.code }] };
  };
  const results = await Promise.allSettled(
    [1, 2].map(() =>
      execution.execute(
        structuredClone(f.action),
        f.input,
        f.context,
        f.request,
        submit,
        policy,
      ),
    ),
  );
  assert.equal(
    results.filter((result) => result.status === "fulfilled").length,
    1,
  );
  assert.equal(submitted.length, 4);
  assert.equal(new Set(submitted).size, 4);
  assert.equal(f.stored().state, "EXECUTED");
  assert.ok(f.stored().audit.rows.every((row) => row.state === "COMPLETED"));
});

test("related row tampering, enterprise change, stale revision and expired approval never submit", async (t) => {
  const f = fixture(t);
  let submitted = 0;
  const submit = async () => {
    submitted++;
  };
  const tampered = structuredClone(f.action);
  tampered.audit.plan.relatedRecords.pricing.records[0].unitAmount = "0";
  await assert.rejects(
    execution.execute(tampered, f.input, f.context, f.request, submit, policy),
    /PLAN_MISMATCH/,
  );
  await assert.rejects(
    execution.execute(
      f.action,
      f.input,
      { ...f.context, enterprise: "other" },
      f.request,
      submit,
      policy,
    ),
    /CONTEXT_MISMATCH/,
  );
  await assert.rejects(
    execution.execute(
      f.action,
      { ...f.input, expectedRevision: 0 },
      f.context,
      f.request,
      submit,
      policy,
    ),
  );
  f.action.audit.challenge.expiresAt = 0;
  await assert.rejects(
    execution.execute(f.action, f.input, f.context, f.request, submit, policy),
    /EXPIRED/,
  );
  assert.equal(submitted, 0);
  assert.equal(f.calls.length, 0);
});

test("response loss stops remaining rows and blocks execution replay", async (t) => {
  const f = fixture(t);
  let calls = 0;
  const result = await execution.execute(
    f.action,
    f.input,
    f.context,
    f.request,
    async (row) => {
      if (++calls === 2) throw new Error("private-provider-error");
      return { code: "SUC_DBS_00000", result: { code: row.record.code } };
    },
    policy,
  );
  assert.equal(result.state, "OUTCOME_UNKNOWN");
  assert.deepEqual(
    result.rows.map((row) => row.state),
    ["COMPLETED", "OUTCOME_UNKNOWN", "NOT_STARTED", "NOT_STARTED"],
  );
  assert.doesNotMatch(JSON.stringify(f.stored()), /private-provider-error/);
  await assert.rejects(
    execution.execute(
      f.stored(),
      { ...f.input, expectedRevision: f.stored().audit.revision },
      f.context,
      f.request,
      async () => {
        calls++;
      },
      policy,
    ),
  );
  assert.equal(calls, 2);
});

test("lost claim acknowledgement and malformed domain success never imply completion", async (t) => {
  const f = fixture(t);
  let submitted = 0;
  const update = global.SERVICE.DefaultCopilotActionService.update;
  global.SERVICE.DefaultCopilotActionService.update = async (input) => {
    await update(input);
    throw new Error("lost acknowledgement");
  };
  await assert.rejects(
    execution.execute(
      f.action,
      f.input,
      f.context,
      f.request,
      async () => {
        submitted++;
      },
      policy,
    ),
    { code: "ERR_CPW_00003" },
  );
  assert.equal(submitted, 0);
  assert.equal(f.stored().state, "EXECUTING");
  assert.equal(
    execution.persisted(
      { code: "SUC_DBS_00000", result: { matchedCount: 1 } },
      "P-001",
    ),
    false,
  );
});

test("business mutations require employee bearer and never select internal credentials", (t) => {
  fixture(t);
  let called = false;
  global.SERVICE.DefaultModuleService = {
    invokeModule: () => {
      called = true;
    },
  };
  assert.throws(
    () =>
      core.createOwnedSchemaRecord(
        {
          tenant: "tenant",
          authData: { enterpriseCode: "enterprise" },
        },
        {},
        "product",
        "product",
        {},
        "key",
      ),
    { code: "ERR_CPW_00005" },
  );
  assert.equal(called, false);
});

test("Product and PriceRow writes never inherit transport retries", (t) => {
  fixture(t);
  const calls = [];
  global.SERVICE.DefaultModuleService = {
    invokeModule: (input) => {
      calls.push(input);
    },
  };
  for (const schema of ["product", "priceRow"])
    core.createOwnedSchemaRecord(
      {
        tenant: "tenant",
        authData: { enterpriseCode: "enterprise" },
        httpRequest: { headers: { authorization: "Bearer employee" } },
      },
      {
        connectionName: "owner",
        targetAuthority: { runtimeRole: "commerce" },
      },
      schema,
      schema,
      { code: "reviewed-code" },
      "confirmed-key",
    );
  assert.equal(calls.length, 2);
  for (const call of calls) {
    assert.equal(call.maxAttempts, 1);
    assert.equal(call.local, false);
    assert.equal(call.header.Authorization, "Bearer employee");
    assert.equal(call.header["Idempotency-Key"], "confirmed-key");
  }
});
