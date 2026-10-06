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
 * @module copilotCapability/test/copilotOrderNotificationInspection
 * @description Verifies fixed Digital Core notification reads, actor-bound admission, minimized output, provider exclusion and post-read drift refusal.
 * @layer test
 * @owner copilotCapability
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const service = require("../src/service/defaultCopilotOrderNotificationInspectionService");
const defaults = require("../config/properties");
const enums = require("../src/utils/enums");

/** Creates an isolated fixed-owner inspection fixture. @param {Object} t Test lifetime. @returns {Object} Fixture. */
function fixture(t) {
  const previous = {
    SERVICE: global.SERVICE,
    CLASSES: global.CLASSES,
    ENUMS: global.ENUMS,
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
  global.ENUMS = {
    copilotOrderNotificationIntent: {
      INSPECT: {
        value: enums.copilotOrderNotificationIntent.definition.INSPECT,
      },
    },
  };
  const configuration = structuredClone(defaults.copilot);
  Object.assign(configuration.capability.orderNotificationInspection, {
    enabled: true,
    connectionName: "commerce",
    targetAuthority: { runtimeRole: "COMMERCE" },
    scopes: [
      {
        tenant: "default",
        enterprise: "acme",
        environment: "local",
        orderCodes: ["order-1"],
      },
    ],
  });
  const request = {
    tenant: "default",
    authData: {
      loginId: "employee",
      enterpriseCode: "acme",
      permissions: ["copilot.data.query", "commerce.digital.notification.read"],
    },
    httpRequest: { headers: { authorization: "Bearer original-employee" } },
  };
  const f = {
    calls: [],
    configuration,
    request,
    response: {
      code: "SUC_DIGITAL_00000",
      data: {
        contractVersion: 1,
        orderCode: "order-1",
        orderRevision: 7,
        financialState: "REFUNDED",
        featureState: "ACTIVE",
        recipient: "private@example.invalid",
        template: "private-template",
        events: ["PURCHASED", "REFUNDED"].map((kind, index) => ({
          kind,
          status: "INSPECTED",
          retryEligible: index === 0,
          outcomes: [
            {
              channel: "EMAIL",
              intentCode: "COMM_" + String(index).repeat(64),
              status: "DELIVERED",
              revision: 1,
              observed: true,
              recipient: "private@example.invalid",
            },
          ],
        })),
      },
    },
  };
  const core = {
    securityContext: (input) => ({
      channel: "EMPLOYEE",
      actor: input.authData.loginId,
      tenant: input.tenant,
      enterprise: input.authData.enterpriseCode,
      environment: "local",
      permissions: input.authData.permissions,
    }),
    employeeExecutionHeaders: () => ({
      Authorization: "Bearer original-employee",
    }),
    configuration: () => configuration,
  };
  global.SERVICE = {
    DefaultCopilotOrchestrationService: core,
    DefaultCopilotPolicyService: {
      hasPermission: (context, grant) => context.permissions.includes(grant),
    },
    DefaultModuleService: {
      invokeModule: async (input) => {
        f.calls.push(input);
        return f.response;
      },
    },
    DefaultCopilotProviderService: {
      invoke: () => assert.fail("Notification evidence reached a provider"),
    },
  };
  return f;
}

test("workspace and inspection use fixed Digital Core routes and minimized output", async (t) => {
  const f = fixture(t);
  const workspace = {
    intent: "copilot.commerce.notification.inspect",
    operation: "commerce.orderNotification.workspace",
    code: "order-1",
  };
  let answer = await service.execute(workspace, f.request, f.configuration);
  assert.equal(f.calls[0].moduleName, "digitalCore");
  assert.equal(f.calls[0].methodName, "GET");
  assert.equal(f.calls[0].apiName, "/orders/order-1/notifications/workspace");
  assert.equal(f.calls[0].maxAttempts, 1);
  assert.deepEqual(f.calls[0].header, {
    Authorization: "Bearer original-employee",
  });
  assert.doesNotMatch(answer.content, /private@example|private-template/);
  assert.match(answer.content, /not financial outcomes/i);

  f.response = {
    code: "SUC_DIGITAL_00000",
    data: {
      orderCode: "order-1",
      orderRevision: 7,
      financialState: "REFUNDED",
      kind: "PURCHASED",
      status: "PARTIALLY_INSPECTED",
      outcomes: [
        {
          channel: "SMS",
          intentCode: "COMM_" + "a".repeat(64),
          status: "UNCONFIRMED",
          observed: false,
        },
      ],
    },
  };
  answer = await service.execute(
    {
      intent: "copilot.commerce.notification.inspect",
      operation: "commerce.orderNotification.inspect",
      code: "order-1",
      kind: "PURCHASED",
    },
    f.request,
    f.configuration,
  );
  assert.equal(f.calls[1].methodName, "POST");
  assert.equal(f.calls[1].apiName, "/orders/order-1/notifications/inspect");
  assert.deepEqual(f.calls[1].requestBody, { kind: "PURCHASED" });
  assert.match(answer.content, /PARTIALLY_INSPECTED/);
});

test("permissions, exact configured order and input bounds deny before transport", async (t) => {
  const f = fixture(t);
  const command = {
    intent: "copilot.commerce.notification.inspect",
    operation: "commerce.orderNotification.workspace",
    code: "order-1",
  };
  for (const mutate of [
    () => f.request.authData.permissions.pop(),
    () => (command.code = "foreign-order"),
    () =>
      (f.configuration.capability.orderNotificationInspection.scopes[0].orderCodes =
        ["*"]),
    () =>
      f.configuration.capability.orderNotificationInspection.scopes.push(
        structuredClone(
          f.configuration.capability.orderNotificationInspection.scopes[0],
        ),
      ),
  ]) {
    const fresh = fixture(t);
    Object.assign(f, fresh);
    Object.assign(command, {
      intent: "copilot.commerce.notification.inspect",
      operation: "commerce.orderNotification.workspace",
      code: "order-1",
    });
    mutate();
    await assert.rejects(service.execute(command, f.request, f.configuration));
    assert.equal(f.calls.length, 0);
  }
  assert.throws(() =>
    service.parse(
      JSON.stringify({
        ...command,
        code: "../order-1",
        extra: true,
      }),
    ),
  );
});

test("malformed owner evidence and post-read configuration drift fail closed", async (t) => {
  const f = fixture(t);
  const command = {
    intent: "copilot.commerce.notification.inspect",
    operation: "commerce.orderNotification.workspace",
    code: "order-1",
  };
  f.response.data.events[0].outcomes[0].intentCode = "foreign";
  await assert.rejects(service.execute(command, f.request, f.configuration));
  f.response.data.events[0].outcomes[0].intentCode = "COMM_" + "0".repeat(64);
  global.SERVICE.DefaultModuleService.invokeModule = async (input) => {
    f.calls.push(input);
    f.configuration.capability.orderNotificationInspection.connectionName =
      "changed";
    return f.response;
  };
  await assert.rejects(service.execute(command, f.request, f.configuration), {
    message: "ERR_CPT_00008",
  });
  assert.equal(f.calls.length, 2);
});
