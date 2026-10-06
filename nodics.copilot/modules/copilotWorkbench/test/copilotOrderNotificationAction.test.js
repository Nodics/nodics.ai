/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";

/**
 * @module copilotWorkbench/test/copilotOrderNotificationAction
 * @description Verifies owner-bound notification retry preparation, fresh execution checks, denial, drift and inspection-only uncertain recovery.
 * @layer test
 * @owner copilotWorkbench
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const service = require("../src/service/defaultCopilotOrderNotificationActionService");
const defaults = require("../config/properties");
const receipt = require("../../../../nodics.foundation/modules/nDatabase/database/src/service/schema/defaultModelCommandReceiptService");

/** Creates one isolated eligible order and records owner calls. @param {Object} t Test lifetime. @returns {Object} Fixture. */
function fixture(t) {
  const previous = {
    SERVICE: global.SERVICE,
    CONFIG: global.CONFIG,
    CLASSES: global.CLASSES,
  };
  t.after(() => Object.assign(global, previous));
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code) {
        super(code);
        this.code = code;
      }
    },
  };
  const configuration = structuredClone(defaults.copilot);
  Object.assign(configuration.workbench.orderNotificationTarget, {
    enabled: true,
    connectionName: "commerce",
  });
  const request = {
    tenant: "default",
    body: {
      operation: "commerce.orderNotification.retry",
      orderCode: "order-1",
      kind: "PURCHASED",
    },
    authData: {
      loginId: "employee",
      enterpriseCode: "acme",
      permissions: [
        "copilot.mutation.prepare",
        "copilot.mutation.execute",
        "commerce.digital.notification.read",
        "commerce.digital.notification.retry",
      ],
    },
    httpRequest: { headers: { authorization: "Bearer original-employee" } },
  };
  const intentCode = "COMM_" + "a".repeat(64);
  const workspace = {
    contractVersion: 1,
    workspaceCode: "commerce.orderNotifications",
    viewCode: "orderNotifications.detail",
    featureState: "ACTIVE",
    orderCode: "order-1",
    orderRevision: 7,
    events: [
      {
        kind: "PURCHASED",
        retryEligible: true,
        outcomes: [
          {
            intentCode,
            status: "ACCEPTED",
            observed: true,
          },
        ],
      },
      { kind: "REFUNDED", retryEligible: false, outcomes: [] },
    ],
    commands: [
      {
        id: "retry",
        enabled: true,
        eligibleKinds: ["PURCHASED"],
      },
    ],
  };
  const f = { configuration, request, workspace, intentCode, calls: [] };
  const context = {
    channel: "EMPLOYEE",
    actor: "employee",
    tenant: "default",
    enterprise: "acme",
    permissions: request.authData.permissions,
  };
  global.CONFIG = { get: () => configuration };
  global.SERVICE = {
    DefaultCopilotOrchestrationService: {
      securityContext: () => context,
      employeeExecutionHeaders: () => ({
        Authorization: "Bearer original-employee",
      }),
      projectConfirmation: (action) => ({ code: action.code }),
    },
    DefaultCopilotPolicyService: {
      hasPermission: (current, grant) => current.permissions.includes(grant),
    },
    DefaultModelCommandReceiptService: receipt,
    DefaultLoggerService: { inheritRequestPrivacy: () => undefined },
    DefaultModuleService: {
      invokeModule: async (input) => {
        f.calls.push(input);
        if (input.apiName.endsWith("/workspace"))
          return { code: "SUC_DIGITAL_00000", data: f.workspace };
        if (input.apiName.endsWith("/retry"))
          return {
            code: "SUC_DIGITAL_00000",
            data: {
              status: "REQUESTED",
              outcomes: [{ intentCode, status: "RETRY_PENDING" }],
            },
          };
        return {
          code: "SUC_DIGITAL_00000",
          data: {
            orderCode: "order-1",
            orderRevision: 7,
            kind: "PURCHASED",
            status: "INSPECTED",
            outcomes: [{ intentCode, status: "RETRY_PENDING", observed: true }],
          },
        };
      },
    },
    DefaultCopilotWorkbenchService: {
      persistPrepared: async (plan, capability) => ({ plan, capability }),
    },
    DefaultCopilotActionExecutionService: {
      assertCurrent: () => undefined,
      execute: async (action, currentRequest, currentContext, _, submit) => ({
        action,
        currentRequest,
        currentContext,
        result: await submit(
          {
            schema: action.audit.plan.schema,
            record: action.audit.plan.records[0],
          },
          "native-key",
        ),
      }),
    },
  };
  return f;
}

test("prepares a complete retry review from fresh owner eligibility", async (t) => {
  const f = fixture(t);
  const prepared = await service.prepare(f.request, f.configuration);
  assert.equal(prepared.capability, "commerce.orderNotification.retry");
  assert.equal(prepared.plan.schema, "orderNotificationRetry");
  assert.equal(prepared.plan.records[0].code, "order-1");
  assert.equal(prepared.plan.records[0].expectedRevision, 7);
  assert.equal(prepared.plan.records[0].intentCount, 1);
  assert.match(prepared.plan.records[0].intentDigest, /^[a-f0-9]{64}$/);
  assert.equal(f.calls.length, 1);
  assert.equal(f.calls[0].methodName, "GET");
  assert.equal(f.calls[0].apiName, "/orders/order-1/notifications/workspace");
  assert.equal(f.calls[0].maxAttempts, 1);
});

test("executes one exact retry only after a fresh matching workspace", async (t) => {
  const f = fixture(t);
  const prepared = await service.prepare(f.request, f.configuration);
  const action = {
    code: "action-1",
    capability: prepared.capability,
    audit: { plan: prepared.plan },
  };
  const result = await service.execute(action, f.request, f.configuration);
  assert.equal(result.result.code, "SUC_COPILOT_DOMAIN");
  assert.deepEqual(result.result.result, { code: "order-1" });
  assert.equal(f.calls.length, 3);
  assert.equal(f.calls[2].methodName, "POST");
  assert.equal(f.calls[2].apiName, "/orders/order-1/notifications/retry");
  assert.deepEqual(f.calls[2].requestBody, {
    kind: "PURCHASED",
    expectedRevision: 7,
    confirmed: true,
  });
});

test("permission and fresh revision or intent drift refuse before retry", async (t) => {
  const f = fixture(t);
  f.request.authData.permissions.splice(
    0,
    f.request.authData.permissions.length,
    "copilot.mutation.prepare",
  );
  await assert.rejects(service.prepare(f.request, f.configuration));
  assert.equal(f.calls.length, 0);

  const fresh = fixture(t);
  const prepared = await service.prepare(fresh.request, fresh.configuration);
  const action = {
    capability: prepared.capability,
    audit: { plan: prepared.plan },
  };
  fresh.workspace.orderRevision = 8;
  await assert.rejects(
    service.execute(action, fresh.request, fresh.configuration),
  );
  assert.equal(
    fresh.calls.filter((call) => call.apiName.endsWith("/retry")).length,
    0,
  );
});

test("uncertain recovery inspects once and never marks current state as completion", async (t) => {
  const f = fixture(t);
  const prepared = await service.prepare(f.request, f.configuration);
  const action = {
    code: "action-1",
    state: "OUTCOME_UNKNOWN",
    capability: prepared.capability,
    audit: { plan: prepared.plan },
  };
  const result = await service.reconcile(action, f.request, f.configuration);
  assert.equal(result.receiptState, "UNCONFIRMED");
  assert.deepEqual(result.confirmation, { code: "action-1" });
  assert.equal(result.inspection.status, "INSPECTED");
  assert.equal(result.inspection.observed, 1);
  assert.equal(f.calls.at(-1).apiName, "/orders/order-1/notifications/inspect");
  assert.equal(
    f.calls.filter((call) => call.apiName.endsWith("/retry")).length,
    0,
  );
});
