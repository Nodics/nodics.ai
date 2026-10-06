/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module copilotCapability/test/copilotRulesInspection
 * @description Exercises scoped native Rules reads, admission drift, data minimization and actual conversation privacy/idempotency.
 * @layer test @owner copilotCapability
 * @override Keep original-user transport and denial assertions when adding supported reads.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const service = require("../src/service/defaultCopilotRulesInspectionService");
const defaults = require("../config/properties");
const enums = require("../src/utils/enums");
const core = require("../../copilotCore/src/service/defaultCopilotOrchestrationService");
const policy = require("../../copilotPolicy/src/service/defaultCopilotPolicyService");
const conversation = require("../../copilotConversation/src/service/defaultCopilotConversationService");

/** Composes real policy, inspection and volatile conversation owners with a recording native transport. @param {Object} t Test lifetime. @returns {Object} Isolated fixture. */
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
    copilotRulesIntent: {
      INSPECT: { value: enums.copilotRulesIntent.definition.INSPECT },
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
  Object.assign(configuration.capability.rulesInspection, {
    enabled: true,
    connectionName: "rules",
    targetAuthority: { runtimeRole: "RULES" },
    scopes: [
      {
        tenant: "default",
        enterprise: "acme",
        environment: "local",
        ruleCodes: ["rule-one"],
        bandCodes: ["band-one"],
        propertyProviderCodes: ["provider-one"],
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
        "rules.definition.read",
        "rules.definition.audit",
        "rules.band.read",
      ],
    },
    httpRequest: { headers: { authorization: "Bearer original-employee" } },
  };
  const calls = [];
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
  const command = {
    intent: "copilot.rules.inspect",
    operation: "rules.definition.inspect",
    code: "rule-one",
  };
  const f = {
    configuration,
    request,
    calls,
    command,
    implementation,
    store,
    response: {
      code: "RULE_SET_DETAIL",
      data: {
        code: "rule-one",
        status: "DRAFT",
        definition: { secret: "excluded" },
      },
    },
  };
  global.SERVICE = {
    DefaultCopilotRulesInspectionService: service,
    DefaultCopilotOrchestrationService: implementation,
    DefaultCopilotPolicyService: policy,
    DefaultCopilotConversationService: store,
    DefaultModuleService: {
      invokeModule: async (input) => {
        calls.push(input);
        return f.response;
      },
    },
    DefaultCopilotProviderService: {
      invoke: () => assert.fail("Rules evidence reached a provider"),
    },
    DefaultCopilotRequestService: {
      assessMutationIntent: () =>
        assert.fail("Rules inspection reached mutation assessment"),
    },
  };
  return f;
}

test("all eight contracts use one fixed GET, original bearer and minimal identity-bound evidence", async (t) => {
  const f = fixture(t);
  for (const operation of service.operations()) {
    const code =
      f.configuration.capability.rulesInspection.scopes[0][
        operation.scopeKey
      ][0];
    const command = {
      intent: f.command.intent,
      operation: operation.code,
      ...(operation.requiresCode === false ? {} : { code }),
    };
    const row = {
      code,
      [operation.reference || "code"]: code,
      status: "DRAFT",
      actor: "secret",
      metadata: { token: "secret" },
      definition: { groups: [] },
      eventType: "CREATED",
    };
    f.response = operation.catalogue
      ? {
          code: operation.envelope,
          data: {
            catalogue: {
              code: "CATALOGUE_ONE",
              version: "1",
              providerCode: code,
              consumerModule: "sample",
              properties: [
                {
                  code: "sample.value",
                  displayName: "Sample value",
                  dataType: "STRING",
                  allowedOperators: ["EQUALS"],
                  allowedValues: ["ONE"],
                  privateDefinition: { secret: true },
                },
              ],
            },
            operators: ["EQUALS"],
          },
        }
      : {
          code: operation.envelope,
          data: operation.multiple ? [row] : row,
        };
    const result = await service.execute(command, f.request, f.configuration);
    const call = f.calls.at(-1);
    assert.equal(call.moduleName, "rulesApi");
    assert.equal(call.methodName, "GET");
    assert.equal(call.maxAttempts, 1);
    assert.equal(call.local, false);
    assert.deepEqual(call.header, {
      Authorization: "Bearer original-employee",
      "x-enterprise-code": "acme",
    });
    assert.equal(
      call.apiName,
      operation.requiresCode === false
        ? operation.path
        : operation.path + command.code + operation.suffix,
    );
    assert.doesNotMatch(
      result.content,
      /secret|definition":|metadata":|actor":/,
    );
    assert.ok(
      result.content
        .split("\n\n")[1]
        .split("\n")
        .every((line) => line.startsWith("    ")),
    );
  }
  assert.equal(f.calls.length, 8);
});

test("catalogue is grant filtered and never projects routing or other enterprise codes", (t) => {
  const f = fixture(t);
  f.request.authData.permissions = ["copilot.data.query", "rules.band.read"];
  const result = service.catalogue(
    core.securityContext(f.request, f.configuration),
    f.configuration,
  );
  assert.equal(result.operations.length, 3);
  assert.deepEqual(result.operations[0].codes, ["band-one"]);
  assert.doesNotMatch(
    JSON.stringify(result),
    /connectionName|runtimeRole|rule-one|\/band-sets/,
  );
  f.configuration.capability.rulesInspection.enabled = false;
  assert.deepEqual(
    service.catalogue(
      core.securityContext(f.request, f.configuration),
      f.configuration,
    ).operations,
    [],
  );
});

for (const change of [
  (f) => {
    f.configuration.capability.rulesInspection.enabled = false;
  },
  (f) => {
    f.request.authData.permissions = ["rules.definition.read"];
  },
  (f) => {
    f.request.authData.permissions = ["copilot.data.query"];
  },
  (f) => {
    f.request.authData.enterpriseCode = "foreign";
  },
  (f) => {
    f.request.tenant = "foreign";
  },
  (f) => {
    f.configuration.core.environment = "foreign";
  },
  (f) => {
    f.request.authData.loginId = "";
  },
  (f) => {
    f.request.httpRequest.headers.authorization = undefined;
  },
  (f) => {
    f.configuration.capability.rulesInspection.scopes[0].ruleCodes = ["*"];
  },
  (f) => {
    f.configuration.capability.rulesInspection.scopes.push(
      f.configuration.capability.rulesInspection.scopes[0],
    );
  },
  (f) => {
    f.configuration.capability.rulesInspection.maximumRows = 26;
  },
  (f) => {
    f.configuration.capability.rulesInspection.targetAuthority = {
      runtimeRole: "RULES",
      url: "http://foreign",
    };
  },
]) {
  test(
    "invalid scope or admission prevents native invocation: " +
      change.toString(),
    async (t) => {
      const f = fixture(t);
      change(f);
      await assert.rejects(
        service.execute(f.command, f.request, f.configuration),
      );
      assert.equal(f.calls.length, 0);
    },
  );
}

test("malformed commands cannot select a path, mutation, scope or unadmitted code", async (t) => {
  const f = fixture(t);
  for (const override of [
    { operation: "rules.definition.simulate" },
    { apiName: "/definitions" },
    { tenant: "foreign" },
    { code: "../escape" },
    { code: 42 },
  ])
    assert.throws(
      () => service.parse(JSON.stringify({ ...f.command, ...override })),
      /ERR_CPT_00001/,
    );
  await assert.rejects(
    service.execute(
      { ...f.command, code: "other" },
      f.request,
      f.configuration,
    ),
    /ERR_CPT_00002/,
  );
  assert.equal(f.calls.length, 0);
  assert.equal(service.parse("Tell me about Rules"), null);
});

test("read completion rejects revoked admission, changed targets and changed identity", async (t) => {
  const f = fixture(t);
  const original = structuredClone(f.configuration);
  for (const change of [
    () => {
      f.configuration.capability.rulesInspection.enabled = false;
    },
    () => {
      f.configuration.capability.rulesInspection.connectionName = "foreign";
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
      /ERR_CPT_0000[24]/,
    );
  }
});

test("native failures, foreign rows and malformed evidence fail closed, including rows beyond the display limit", async (t) => {
  const f = fixture(t);
  for (const response of [
    { code: "ERR_RULE", data: f.response.data },
    { ...f.response, success: false },
    { ...f.response, data: { code: "foreign" } },
    { ...f.response, data: { code: "rule-one", status: {} } },
    { code: "SUC_TEST", data: { ...f.response, errors: ["failed"] } },
  ]) {
    f.response = response;
    await assert.rejects(
      service.execute(f.command, f.request, f.configuration),
      /ERR_CPT_00003/,
    );
  }
  f.command.operation = "rules.definition.versions";
  f.response = {
    code: "RULE_SET_VERSIONS",
    data: Array.from({ length: 30 }, (_, index) => ({
      ruleSetCode: index === 29 ? "foreign" : "rule-one",
      version: index,
    })),
  };
  await assert.rejects(
    service.execute(f.command, f.request, f.configuration),
    /ERR_CPT_00003/,
  );
  f.response.data[29].ruleSetCode = "rule-one";
  const answer = await service.execute(f.command, f.request, f.configuration);
  assert.match(answer.content, /"omittedForDisplay": 5/);
  SERVICE.DefaultModuleService.invokeModule = async () => {
    throw new Error("private-host:secret-token");
  };
  await assert.rejects(
    service.execute(f.command, f.request, f.configuration),
    (error) => error.message === "ERR_CPT_00003",
  );
});

for (const recording of [true, false]) {
  test(
    "actual conversation excludes Rules content from provider history and replays no native read; recording=" +
      recording,
    async (t) => {
      const f = fixture(t);
      f.configuration.conversation.recording.enabled = recording;
      const created = await f.store.create(
        f.request,
        f.configuration.conversation,
      );
      Object.assign(f.request, {
        conversationCode: created.code,
        idempotencyKey: "rules-first",
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
      if (recording) assert.match(messages[1].content, /Rules inspection/);
      else
        assert.doesNotMatch(
          JSON.stringify([...f.store.state.messages.values()]),
          /rule-one|Rules inspection/,
        );
      await f.implementation.submitTurn(f.request);
      assert.equal(f.calls.length, 1);
    },
  );
}

test("localized native names are omitted without leaking nested values or refusing an otherwise valid summary", async (t) => {
  const f = fixture(t);
  f.response.data.name = {
    en: "Localized name",
    extra: { secret: "never exposed" },
  };
  const result = await service.execute(f.command, f.request, f.configuration);
  assert.match(result.content, /rule-one/);
  assert.doesNotMatch(result.content, /Localized name|never exposed|"name"/);
});

test("invalid recognized inspection fails the accepted turn without model fallback", async (t) => {
  const f = fixture(t);
  const created = await f.store.create(f.request, f.configuration.conversation);
  Object.assign(f.request, {
    conversationCode: created.code,
    idempotencyKey: "invalid-rules",
    message: JSON.stringify({ ...f.command, endpoint: "/foreign" }),
  });
  await assert.rejects(f.implementation.submitTurn(f.request), /ERR_CPT_00001/);
  assert.equal(f.calls.length, 0);
  assert.equal([...f.store.state.turns.values()][0].state, "FAILED");
  assert.deepEqual(
    core.providerHistory(
      await f.store.messages(
        created.code,
        f.request,
        f.configuration.conversation,
      ),
    ),
    [],
  );
});
