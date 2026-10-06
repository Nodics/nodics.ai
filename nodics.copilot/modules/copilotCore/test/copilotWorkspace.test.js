/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module copilotCore/test/copilotWorkspace @description Verifies bounded enterprise-isolated workspace projections and pre-access denial. @layer test @owner copilotCore */
const test = require("node:test");
const assert = require("node:assert/strict");
const conversation = require("../../copilotConversation/src/service/defaultCopilotConversationService");
const workspace = require("../src/service/defaultCopilotWorkspaceService");
const configuration = require("../config/properties").copilot;

test("personal pending usage adds a non-executing accounting attention item", async () => {
  const result = await workspace.attention(
    { authData: { permissions: [] } }, {},
    { sources: [] }, { state: "CONFIGURED" },
    { state: "AVAILABLE", pending: 12, warningPercentage: 0 }
  );
  assert.deepEqual(result.items, [{ kind: "BUDGET_RECONCILIATION" }]);
});

/** Creates an isolated owner service rather than sharing singleton test state. @returns {Object} Test service. */
function owner() {
  return Object.assign({}, conversation, {
    state: {
      conversations: new Map(),
      turns: new Map(),
      messages: new Map(),
      events: new Map(),
      idempotency: new Map(),
    },
  });
}
const storage = { storage: "VOLATILE_LOCAL", allowVolatileLocalStorage: true };
const request = {
  tenant: "tenant",
  authData: {
    loginId: "user",
    enterpriseCode: "enterprise-a",
    permissions: ["copilot.assistant.read", "copilot.assistant.use"],
  },
};

test("attention rechecks action scope and exposes uncertainty without execution payloads", async () => {
  const previous = global.SERVICE;
  const identity = conversation.identity(request);
  const scoped = {
    ...request,
    authData: {
      ...request.authData,
      permissions: ["copilot.mutation.prepare"],
    },
  };
  global.SERVICE = {
    DefaultCopilotConversationService: conversation,
    DefaultCopilotActionService: {
      get: async (input) => {
        assert.equal(input.query.enterpriseCode, identity.enterpriseCode);
        assert.equal(input.query.principalCode, identity.principalCode);
        assert.ok(input.query.state.$in.includes("AWAITING_CONFIRMATION"));
        return {
          code: "SUC_TEST",
          result: [
            {
              ...identity,
              code: "owned",
              conversationCode: "conversation",
              state: "OUTCOME_UNKNOWN",
              preview: { private: "hidden" },
            },
            {
              ...identity,
              code: "approval",
              conversationCode: "conversation",
              state: "AWAITING_CONFIRMATION",
            },
            {
              ...identity,
              enterpriseCode: "foreign",
              code: "foreign",
              state: "AWAITING_CONFIRMATION",
            },
          ],
        };
      },
    },
  };
  try {
    const result = await workspace.attention(
      scoped,
      identity,
      { sources: [{ state: "STALE" }] },
      { state: "NOT_CONFIGURED" },
      { state: "EXHAUSTED" },
    );
    assert.deepEqual(
      result.items.map((item) => item.kind),
      [
        "BUDGET_EXHAUSTED",
        "PROVIDER_UNAVAILABLE",
        "KNOWLEDGE_ATTENTION",
        "OUTCOME_UNKNOWN",
        "APPROVAL_PENDING",
      ],
    );
    assert.doesNotMatch(JSON.stringify(result), /private|foreign|hidden/);
  } finally {
    global.SERVICE = previous;
  }
});

test("conversation context exposes active authorized group names only and denies before group lookup", () => {
  const previous = { SERVICE: global.SERVICE, CLASSES: global.CLASSES };
  const core = require("../src/service/defaultCopilotOrchestrationService");
  let granted = true,
    calls = 0;
  global.CLASSES = { NodicsError: class extends Error {} };
  global.SERVICE = {
    DefaultCopilotPolicyService: { hasPermission: () => granted },
    DefaultCopilotConversationService: conversation,
    DefaultCopilotKnowledgeRuntimeService: {
      groupScope: () => {
        calls++;
        return {
          enabled: true,
          groups: [
            {
              code: "active",
              name: "Active",
              active: true,
              sourceCodes: ["private-source"],
            },
            { code: "inactive", name: "Inactive", active: false },
          ],
        };
      },
    },
  };
  const service = {
    ...core,
    configuration: () => ({ ...configuration, api: { enabled: true } }),
    securityContext: () => ({ enterprise: "enterprise" }),
  };
  try {
    const result = service.getConversationContext(request);
    assert.deepEqual(result.groups.items, [{ code: "active", name: "Active" }]);
    assert.doesNotMatch(JSON.stringify(result), /private-source|inactive/);
    granted = false;
    assert.throws(
      () => service.getConversationContext(request),
      /ERR_CPK_00014/,
    );
    assert.equal(calls, 1);
  } finally {
    global.SERVICE = previous.SERVICE;
    global.CLASSES = previous.CLASSES;
  }
});

test("authorized source metadata is bounded with explicit overflow", async () => {
  const previous = global.SERVICE;
  global.SERVICE = {
    DefaultCopilotConversationService: owner(),
    DefaultCopilotOrchestrationService: { securityContext: () => ({}) },
    DefaultCopilotKnowledgeRuntimeService: {
      status: async (input) => ({
        enabled: true,
        sources: Array.from({ length: input.statusLimit + 1 }, (_, index) => ({
          code: `source-${index}`,
          state: "PROJECTED",
          version: "v1",
          evidence: "DURABLE_GENERATION",
          inspectionRequired: true,
        })),
      }),
    },
  };
  try {
    const result = await workspace.get(
      { ...request, authData: { ...request.authData, permissions: ["*"] } },
      { ...configuration, conversation: storage },
    );
    assert.equal(result.knowledge.sources.length, 12);
    assert.equal(result.knowledge.hasMore, true);
    assert.equal(result.knowledge.sources[0].evidence, "DURABLE_GENERATION");
    assert.ok(result.attention.items.some(item => item.kind === "KNOWLEDGE_ATTENTION"));
  } finally {
    global.SERVICE = previous;
  }
});

test("private conversation persistence has no generic CRUD route bypass", () => {
  const schemas =
    require("../../copilotConversation/src/schemas/schemas").copilotConversation;
  for (const schema of Object.values(schemas)) {
    assert.equal(schema.service.enabled, true);
    assert.equal(schema.router.enabled, false);
    assert.equal(schema.router.groups.schemaOperations, false);
  }
});

test("enterprise switching cannot enumerate or resume another enterprise conversation", async () => {
  const service = owner();
  const created = await service.create(request, storage);
  const other = {
    ...request,
    authData: { ...request.authData, enterpriseCode: "enterprise-b" },
  };
  assert.equal((await service.listOwned(other, storage)).items.length, 0);
  await assert.rejects(service.getOwned(created.code, other, storage), {
    code: "COPILOT_CONVERSATION_NOT_FOUND",
  });
  assert.equal(
    (await service.workspaceActivity(other, storage, 12)).conversations.length,
    0,
  );
  delete created.enterpriseCode;
  await assert.rejects(service.getOwned(created.code, request, storage), {
    code: "COPILOT_CONVERSATION_NOT_FOUND",
  });
});

test("idempotency is bound to conversation and enterprise, not just actor", async () => {
  const service = owner();
  const first = await service.create(request, storage);
  const second = await service.create(request, storage);
  const input = { ...request, message: "hello", idempotencyKey: "same-key" };
  const turn = await service.acceptTurn(first, input, storage);
  assert.equal(
    (await service.acceptTurn(first, input, storage)).code,
    turn.code,
  );
  assert.notEqual(
    (await service.acceptTurn(second, input, storage)).code,
    turn.code,
  );
});

test("workspace omits messages, secrets, unauthorized knowledge, and invented balances", async () => {
  const service = owner();
  const created = await service.create(request, storage);
  await service.acceptTurn(
    created,
    { ...request, message: "sensitive body", idempotencyKey: "one" },
    storage,
  );
  const previous = global.SERVICE;
  global.SERVICE = {
    DefaultCopilotConversationService: service,
    DefaultCopilotKnowledgeRuntimeService: {
      status: () => {
        throw new Error("Must not access knowledge");
      },
    },
  };
  try {
    const result = await workspace.get(request, {
      ...configuration,
      conversation: storage,
      providers: {
        enabled: true,
        default: { adapter: "test" },
        adapters: {
          test: {
            enabled: true,
            model: { name: "local" },
            credential: { secretRef: "private-ref" },
            connection: { host: "private-host" },
          },
        },
      },
    });
    assert.equal(result.scope, "PERSONAL");
    assert.equal(result.knowledge.state, "NOT_AUTHORIZED");
    assert.equal(result.budget.available, null);
    assert.equal(result.provider.health, "NOT_CHECKED");
    assert.equal(result.activity.turns.length, 1);
    // Titles are intentionally visible owned metadata; bodies and credentials are not.
    delete result.activity.conversations[0].title;
    assert.doesNotMatch(
      JSON.stringify(result),
      /sensitive body|private-ref|private-host/,
    );
    const denied = {
      ...request,
      authData: { ...request.authData, permissions: [] },
    };
    service.workspaceActivity = () => {
      throw new Error("Storage accessed before permission");
    };
    await assert.rejects(workspace.get(denied, configuration), {
      code: "COPILOT_WORKSPACE_FORBIDDEN",
    });
  } finally {
    global.SERVICE = previous;
  }
});

test("bounded activity reports overflow without claiming global totals", async () => {
  const service = owner();
  await service.create(request, storage);
  await service.create(request, storage);
  const result = await service.workspaceActivity(request, storage, 1);
  assert.equal(result.conversations.length, 1);
  assert.equal(result.hasMoreConversations, true);
  assert.equal(result.total, undefined);
  await assert.rejects(service.workspaceActivity(request, storage, 1000), {
    code: "COPILOT_WORKSPACE_LIMIT_INVALID",
  });
});

test("durable projections constrain owner before reading and recheck returned records", async () => {
  const service = owner();
  const calls = [];
  const previous = global.SERVICE;
  const saved = await service.create(request, storage);
  const generated = {
    get: async (input) => {
      calls.push(input);
      return {
        result: [saved, { ...saved, code: "foreign", enterpriseCode: "other" }],
      };
    },
    save: async () => {},
  };
  global.SERVICE = {
    DefaultCopilotConversationRecordService: generated,
    DefaultCopilotTurnService: {
      ...generated,
      get: async (input) => {
        calls.push(input);
        return { result: [] };
      },
    },
    DefaultCopilotMessageService: generated,
    DefaultCopilotEventService: generated,
  };
  try {
    const result = await service.workspaceActivity(
      request,
      { storage: "GENERATED_SERVICE" },
      12,
    );
    assert.equal(result.conversations.length, 1);
    assert.equal(calls[0].query.tenantCode, "tenant");
    assert.equal(calls[0].query.principalCode, "user");
    assert.equal(calls[0].query.enterpriseCode, "enterprise-a");
    assert.equal(calls[0].searchOptions.pageSize, 13);
    assert.deepEqual(calls[1].query.conversationCode, { $in: [saved.code] });
  } finally {
    global.SERVICE = previous;
  }
});
