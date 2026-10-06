/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module copilotCapability/test/copilotProcessInspection
 * @description Verifies scoped Process reads, deny-before-transport, bounded projections, recording and accepted-turn replay.
 * @layer test @owner copilotCapability
 * @override Preserve native employee authority and provider exclusion when extending supported reads.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const service = require("../src/service/defaultCopilotProcessInspectionService");
const defaults = require("../config/properties");
const enums = require("../src/utils/enums");
const core = require("../../copilotCore/src/service/defaultCopilotOrchestrationService");
const policy = require("../../copilotPolicy/src/service/defaultCopilotPolicyService");
const conversation = require("../../copilotConversation/src/service/defaultCopilotConversationService");

/** Composes the actual policy and volatile conversation owners with a recording transport. @param {Object} t Test lifetime. @returns {Object} Fixture. */
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
    copilotProcessIntent: {
      INSPECT: { value: enums.copilotProcessIntent.definition.INSPECT },
    },
  };
  const configuration = structuredClone(defaults.copilot);
  Object.assign(configuration, {
    api: { enabled: true },
    core: { environment: "local" },
    conversation: {
      storage: "VOLATILE_LOCAL",
      allowVolatileLocalStorage: true,
      recording: { enabled: true, version: "1" },
    },
  });
  Object.assign(configuration.capability.processInspection, {
    enabled: true,
    connectionName: "process",
    targetAuthority: { runtimeRole: "PROCESS" },
    scopes: [
      {
        tenant: "default",
        enterprise: "acme",
        environment: "local",
        definitionCodes: ["definition-one"],
        instanceCodes: ["instance-one"],
        taskCodes: ["task-one"],
        incidentCodes: ["incident-one"],
        triggerCodes: ["trigger-one"],
      },
    ],
  });
  const request = {
    tenant: "default",
    authData: {
      loginId: "employee",
      enterpriseCode: "acme",
      permissions: [
        "copilot.data.query",
        "process.definition.read",
        "process.backoffice.view",
        "process.incident.read",
        "process.trigger.read",
      ],
    },
    httpRequest: { headers: { authorization: "Bearer original-employee" } },
  };
  const store = {
    ...conversation,
    state: {
      conversations: new Map(),
      turns: new Map(),
      messages: new Map(),
      events: new Map(),
      idempotency: new Map(),
    },
  };
  const implementation = { ...core, configuration: () => configuration };
  const f = {
    configuration,
    request,
    store,
    implementation,
    calls: [],
    command: {
      intent: "copilot.process.inspect",
      operation: "process.definition.inspect",
      code: "definition-one",
    },
    response: {
      code: "SUC_PROCESS_00000",
      data: {
        code: "definition-one",
        status: "DRAFT",
        graph: { secret: "private" },
      },
    },
  };
  global.SERVICE = {
    DefaultCopilotProcessInspectionService: service,
    DefaultCopilotOrchestrationService: implementation,
    DefaultCopilotPolicyService: policy,
    DefaultCopilotConversationService: store,
    DefaultModuleService: {
      invokeModule: async (input) => {
        f.calls.push(input);
        return f.response;
      },
    },
    DefaultCopilotProviderService: {
      invoke: () => assert.fail("Process evidence reached a provider"),
    },
    DefaultCopilotRequestService: {
      assessMutationIntent: () =>
        assert.fail("Process inspection reached mutations"),
    },
  };
  return f;
}

test("twelve fixed reads preserve native credentials and exclude execution context, task decisions and actors", async (t) => {
  const f = fixture(t);
  for (const operation of service.operations()) {
    const code =
      f.configuration.capability.processInspection.scopes[0][
        operation.codes
      ][0];
    const command = {
      intent: f.command.intent,
      operation: operation.code,
      ...(operation.requiresCode === false ? {} : { code }),
    };
    const row = {
      code,
      [operation.reference]: code,
      status: "WAITING",
      context: { private: true },
      graph: { private: true },
      assignee: "private",
      actor: "private",
      decision: { private: true },
      compensationAdapter: { private: true },
      reviewContext: { private: true },
      metadata: { private: true },
    };
    f.response = {
      code: operation.envelope || "SUC_PROCESS_00000",
      data: operation.detail
        ? {
            instance: row,
            tasks: [
              {
                code: "task-one",
                instanceCode: code,
                status: "OPEN",
                decision: { private: true },
              },
            ],
            auditEvents: [
              {
                instanceCode: code,
                eventType: "STARTED",
                actor: "private",
              },
            ],
          }
        : operation.multiple
          ? [row]
          : row,
    };
    const answer = await service.execute(command, f.request, f.configuration);
    assert.doesNotMatch(
      answer.content,
      /private|compensationAdapter|reviewContext|assignee/,
    );
    assert.match(answer.content, /No task decision or process execution/);
    const call = f.calls.at(-1);
    assert.equal(call.moduleName, "workflow");
    assert.equal(call.methodName, "GET");
    assert.equal(call.maxAttempts, 1);
    assert.equal(call.local, false);
    assert.equal(
      call.apiName,
      operation.requiresCode === false
        ? operation.path
        : operation.path + code + operation.suffix,
    );
    assert.deepEqual(call.header, {
      Authorization: "Bearer original-employee",
      "x-enterprise-code": "acme",
    });
  }
  assert.equal(f.calls.length, 12);
});

test("list reads return only configured identities without leaking excluded counts", async (t) => {
  const f = fixture(t);
  const command = {
    intent: f.command.intent,
    operation: "process.definition.list",
  };
  f.response = {
    code: "SUC_PROCESS_00000",
    data: [
      { code: "definition-one", status: "DRAFT" },
      { code: "foreign-definition", status: "PUBLISHED" },
    ],
  };
  const answer = await service.execute(command, f.request, f.configuration);
  assert.match(answer.content, /definition-one/);
  assert.doesNotMatch(answer.content, /foreign-definition/);
  assert.match(answer.content, /"omittedForDisplay": 0/);
  assert.deepEqual(service.parse(JSON.stringify(command)), command);
  assert.throws(
    () => service.parse(JSON.stringify({ ...command, code: "definition-one" })),
    /ERR_CPT_00005/,
  );
});

for (const [name, change] of [
  [
    "disabled",
    (f) => {
      f.configuration.capability.processInspection.enabled = false;
    },
  ],
  [
    "data grant",
    (f) => {
      f.request.authData.permissions = ["process.definition.read"];
    },
  ],
  [
    "native grant",
    (f) => {
      f.request.authData.permissions = ["copilot.data.query"];
    },
  ],
  [
    "foreign enterprise",
    (f) => {
      f.request.authData.enterpriseCode = "foreign";
    },
  ],
  [
    "foreign tenant",
    (f) => {
      f.request.tenant = "foreign";
    },
  ],
  [
    "foreign environment",
    (f) => {
      f.configuration.core.environment = "foreign";
    },
  ],
  [
    "missing actor",
    (f) => {
      f.request.authData.loginId = "";
    },
  ],
  [
    "missing bearer",
    (f) => {
      f.request.httpRequest.headers.authorization = undefined;
    },
  ],
  [
    "empty selection",
    (f) => {
      f.configuration.capability.processInspection.scopes[0].definitionCodes =
        [];
    },
  ],
  [
    "wildcard selection",
    (f) => {
      f.configuration.capability.processInspection.scopes[0].definitionCodes = [
        "*",
      ];
    },
  ],
  [
    "duplicate scope",
    (f) => {
      f.configuration.capability.processInspection.scopes.push(
        f.configuration.capability.processInspection.scopes[0],
      );
    },
  ],
  [
    "invalid row bound",
    (f) => {
      f.configuration.capability.processInspection.maximumRows = 26;
    },
  ],
  [
    "target override",
    (f) => {
      f.configuration.capability.processInspection.targetAuthority.url =
        "http://foreign";
    },
  ],
])
  test("denies before native transport: " + name, async (t) => {
    const f = fixture(t);
    change(f);
    await assert.rejects(
      service.execute(f.command, f.request, f.configuration),
    );
    assert.equal(f.calls.length, 0);
  });

test("catalogue exposes only scoped and permitted code choices and supports narrower later-layer projection", (t) => {
  const f = fixture(t);
  f.request.authData.permissions = [
    "copilot.data.query",
    "process.definition.read",
  ];
  const context = core.securityContext(f.request, f.configuration);
  const result = service.catalogue(context, f.configuration);
  assert.equal(result.operations.length, 3);
  assert.doesNotMatch(
    JSON.stringify(result),
    /runtimeRole|connectionName|instance-one|\/definitions/,
  );
  const narrowed = {
    ...service,
    operations: () => service.operations().slice(0, 1),
  };
  assert.equal(
    narrowed.catalogue(context, f.configuration).operations.length,
    1,
  );
});

test("recognized commands reject extra fields, unadmitted operations and path injection", (t) => {
  const f = fixture(t);
  for (const command of [
    { ...f.command, endpoint: "/anything" },
    { ...f.command, operation: "process.task.complete" },
    { ...f.command, code: "a/../../b" },
    { ...f.command, code: "a?limit=999" },
    { ...f.command, code: "a".repeat(129) },
  ])
    assert.throws(
      () => service.parse(JSON.stringify(command)),
      /ERR_CPT_00005/,
    );
  assert.equal(service.parse("explain processes"), null);
});

test("post-read revocation, target drift and identity changes discard native evidence", async (t) => {
  const f = fixture(t);
  const original = structuredClone(f.configuration);
  for (const change of [
    () => {
      f.configuration.capability.processInspection.enabled = false;
    },
    () => {
      f.configuration.capability.processInspection.connectionName = "foreign";
    },
    () => {
      f.request.authData.loginId = "other";
    },
  ]) {
    Object.assign(f.configuration, structuredClone(original));
    f.request.authData.loginId = "employee";
    SERVICE.DefaultModuleService.invokeModule = async () => {
      change();
      return f.response;
    };
    await assert.rejects(
      service.execute(f.command, f.request, f.configuration),
      /ERR_CPT_0000[68]/,
    );
  }
});

test("negative envelopes and every foreign row fail closed even beyond display limit", async (t) => {
  const f = fixture(t);
  const valid = structuredClone(f.response);
  for (const response of [
    null,
    { ...valid, code: "ERR_PROCESS" },
    { ...valid, success: false },
    { ...valid, acknowledged: false },
    { ...valid, errors: ["private"] },
    { ...valid, data: { code: "foreign" } },
    { ...valid, data: { code: f.command.code, status: {} } },
    { code: "SUC_TEST", data: { ...valid, error: "private" } },
  ]) {
    f.response = response;
    await assert.rejects(
      service.execute(f.command, f.request, f.configuration),
      /ERR_CPT_00007/,
    );
  }
  f.command.operation = "process.definition.versions";
  f.response = {
    code: "SUC_PROCESS_00000",
    data: Array.from({ length: 30 }, (_, index) => ({
      definitionCode: index === 29 ? "foreign" : f.command.code,
      version: index,
    })),
  };
  await assert.rejects(
    service.execute(f.command, f.request, f.configuration),
    /ERR_CPT_00007/,
  );
  f.response.data[29].definitionCode = f.command.code;
  assert.match(
    (await service.execute(f.command, f.request, f.configuration)).content,
    /"omittedForDisplay": 5/,
  );
  f.response.data = [];
  assert.match(
    (await service.execute(f.command, f.request, f.configuration)).content,
    /0 metadata records/,
  );
  SERVICE.DefaultModuleService.invokeModule = async () => {
    throw Error("secret-host:credential");
  };
  await assert.rejects(
    service.execute(f.command, f.request, f.configuration),
    (error) => error.message === "ERR_CPT_00007",
  );
});

for (const recording of [true, false])
  test(
    "conversation privacy and original-turn replay, recording=" + recording,
    async (t) => {
      const f = fixture(t);
      f.configuration.conversation.recording.enabled = recording;
      const created = await f.store.create(
        f.request,
        f.configuration.conversation,
      );
      Object.assign(f.request, {
        conversationCode: created.code,
        idempotencyKey: "process-first",
        message: JSON.stringify(f.command),
      });
      const result = await f.implementation.submitTurn(f.request);
      assert.equal(result.turn.state, "COMPLETED");
      assert.equal(f.calls.length, 1);
      const messages = await f.store.messages(
        created.code,
        f.request,
        f.configuration.conversation,
      );
      assert.deepEqual(core.providerHistory(messages), []);
      if (recording) assert.match(messages[1].content, /Process inspection/);
      else
        assert.doesNotMatch(
          JSON.stringify([...f.store.state.messages.values()]),
          /definition-one|Process inspection/,
        );
      await f.implementation.submitTurn(f.request);
      assert.equal(f.calls.length, 1);
    },
  );

test("invalid reserved inspection fails the accepted turn with no model fallback", async (t) => {
  const f = fixture(t);
  const created = await f.store.create(f.request, f.configuration.conversation);
  Object.assign(f.request, {
    conversationCode: created.code,
    idempotencyKey: "invalid-process",
    message: JSON.stringify({ ...f.command, permission: "*" }),
  });
  await assert.rejects(f.implementation.submitTurn(f.request), /ERR_CPT_00005/);
  assert.equal(f.calls.length, 0);
  assert.equal([...f.store.state.turns.values()][0].state, "FAILED");
});
