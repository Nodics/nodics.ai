/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by root LICENSE. */
/** @module copilotConversation/test/copilotCustomerGuidance @description Proves customer guidance isolation, minimized provider context and safe unavailable responses over canonical conversations. @layer test @owner copilotConversation */
"use strict";
const { test, beforeEach } = require("node:test"),
  assert = require("node:assert/strict");
const guidance = require("../src/service/defaultCopilotCustomerGuidanceService"),
  conversation = require("../src/service/defaultCopilotConversationService"),
  policy = require("../../copilotPolicy/src/service/defaultCopilotPolicyService");
let retrievals, calls, evidence, seen;
const settings = {
  project: "circa",
  adapter: "mock",
  profile: "customerGuidance",
};
const request = (patch = {}) => ({
  tenant: "default",
  authData: {
    principalType: "customer",
    loginId: "login",
    code: "customer",
    entCode: "default",
  },
  message: "What happens next?",
  ...patch,
});
beforeEach(() => {
  conversation.state = {
    conversations: new Map(),
    turns: new Map(),
    messages: new Map(),
    events: new Map(),
    idempotency: new Map(),
  };
  retrievals = 0;
  calls = 0;
  evidence = {
    evidence: [
      { title: "Help", excerpt: "Explicit confirmation is required." },
    ],
    citations: [],
    insufficientEvidence: false,
  };
  global.CONFIG = {
    get: () => ({
      conversation: {
        storage: "VOLATILE_LOCAL",
        allowVolatileLocalStorage: true,
      },
      providers: {},
    }),
  };
  global.SERVICE = {
    DefaultCopilotPolicyService: policy,
    DefaultCopilotConversationService: conversation,
    DefaultCopilotKnowledgeRuntimeService: {
      search: async (input) => {
        retrievals++;
        assert.equal(input.securityContext.channel, "CUSTOMER");
        return evidence;
      },
    },
    DefaultCopilotProviderService: {
      invoke: async (input) => {
        calls++;
        seen = JSON.stringify(input);
        return {
          content: JSON.stringify({
            message: "Review and confirm.",
            correction: { name: "injected" },
            actions: [{ type: "APPROVE" }],
          }),
        };
      },
    },
  };
});
test("customer provider receives only minimized facts and no executable model tools", async () => {
  const result = await guidance.reply(
    request({
      facts: {
        name: "Phone",
        preferredCollectionPointCode: "PRIVATE-CENTRE",
        latitude: 25,
        longitude: 55,
        token: "PRIVATE-TOKEN",
      },
      stage: "DRAFT",
    }),
    settings,
  );
  assert.equal(result.changed, false);
  assert.deepEqual(result.actions, []);
  assert.ok(result.conversationCode);
  assert.equal(calls, 1);
  assert.doesNotMatch(seen, /PRIVATE-CENTRE|PRIVATE-TOKEN|latitude|longitude/);
  assert.equal(conversation.state.conversations.size, 1);
});
test("other customer, enterprise, project and employee cannot retrieve or invoke provider for owned history", async () => {
  const result = await guidance.reply(request(), settings);
  for (const altered of [
    { ...request().authData, code: "other" },
    { ...request().authData, entCode: "other" },
    { ...request().authData, principalType: "employee" },
  ])
    await assert.rejects(
      guidance.reply(
        request({
          conversationCode: result.conversationCode,
          authData: altered,
        }),
        settings,
      ),
    );
  await assert.rejects(
    guidance.reply(request({ conversationCode: result.conversationCode }), {
      ...settings,
      project: "other",
    }),
  );
  assert.equal(retrievals, 1);
  assert.equal(calls, 1);
});
test("missing evidence does not invoke model or change domain; trusted fixed answer bypasses both", async () => {
  evidence = { evidence: [], citations: [], insufficientEvidence: true };
  const result = await guidance.reply(request(), settings);
  assert.match(result.message, /do not have approved guidance/);
  assert.equal(calls, 0);
  await guidance.reply(request(), {
    ...settings,
    fixedMessage: "Use the arrival control.",
  });
  assert.equal(retrievals, 1);
  assert.equal(calls, 0);
});
test("provider failure persists an unavailable turn while preserving domain", async () => {
  SERVICE.DefaultCopilotProviderService.invoke = async () => {
    throw new Error("timeout");
  };
  const result = await guidance.reply(request(), settings);
  assert.match(result.message, /progress is saved/);
  assert.deepEqual(result.actions, []);
  assert.equal([...conversation.state.turns.values()][0].state, "COMPLETED");
});
test("replay returns canonical completed response without calling model again", async () => {
  const result = await guidance.reply(
    request({ idempotencyKey: "same" }),
    settings,
  );
  const replay = await guidance.reply(
    request({
      idempotencyKey: "same",
      conversationCode: result.conversationCode,
    }),
    settings,
  );
  assert.equal(replay.message, result.message);
  assert.equal(calls, 1);
});

test("trusted legacy history migrates once into canonical customer conversation", async () => {
  const first = await guidance.reply(
    request({
      legacyHistory: [
        { role: "user", text: "Earlier question" },
        { role: "assistant", text: "Earlier answer" },
      ],
      idempotencyKey: "migration",
    }),
    settings,
  );
  assert.equal(first.history.length, 4);
  assert.equal(first.history[0].text, "Earlier question");
  const next = await guidance.reply(
    request({
      conversationCode: first.conversationCode,
      legacyHistory: first.history,
      idempotencyKey: "next",
    }),
    settings,
  );
  assert.equal(next.history.length, 6);
  assert.equal(conversation.state.conversations.size, 1);
  await assert.rejects(
    guidance.reply(
      request({
        conversationCode: first.conversationCode,
        message: "Changed same command",
        idempotencyKey: "next",
      }),
      settings,
    ),
    /COPILOT_IDEMPOTENCY_CONFLICT/,
  );
});
