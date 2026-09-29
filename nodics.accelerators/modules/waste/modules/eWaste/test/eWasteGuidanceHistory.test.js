/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const test = require("node:test"),
  assert = require("node:assert/strict");
/** @module eWaste/test/eWasteGuidanceHistory @description Independent canonical guidance history and revision contracts. @owner eWaste @layer test */
const conversation = require("../src/service/defaultEWasteConversationService");
const guidance = { message: (request) => conversation.guidance(request) };
let draft, providerCalls;
test.beforeEach(() => {
  draft = {
    code: "draft",
    revision: 4,
    submissionStatus: "AWAITING_SUBMITTER_CONFIRMATION",
    submittedFacts: { itemTypeCode: "PHONE" },
    metadata: { estimate: { carbonKg: 1 } },
  };
  providerCalls = 0;
  global.CONFIG = {
    get: () => ({ conversation: { project: "independent-project" } }),
  };
  global.SERVICE = {
    DefaultCopilotCustomerGuidanceService: {
      reply: async (request) => {
        providerCalls++;
        return {
          message: "Your progress is saved",
          conversationCode: "copilot-conversation",
          history: [
            { role: "user", text: request.message },
            { role: "assistant", text: "Your progress is saved" },
          ],
          changed: false,
          actions: [],
        };
      },
    },
    DefaultEWasteExperienceService: { readDraft: async () => draft },
    DefaultWastePersistenceService: {
      revision: (record, revision) => {
        if (record.revision !== revision)
          throw Object.assign(new Error("Reload"), {
            code: "ERR_WASTE_REVISION_CONFLICT",
          });
      },
      fail: (code, message) => {
        throw Object.assign(new Error(message), { code });
      },
      update: async (schema, request, old, patch) => {
        draft = { ...old, ...patch, revision: old.revision + 1 };
        return draft;
      },
    },
  };
});
test.afterEach(() => {
  delete global.SERVICE;
  delete global.CONFIG;
});
test("successful guidance preserves the supported journey and uses canonical history", async () => {
  const result = await guidance.message({
    code: "draft",
    expectedRevision: 4,
    payload: { message: "Can you help with this item?" },
  });
  assert.equal(providerCalls, 1);
  assert.equal(result.changed, false);
  assert.equal(result.draft.metadata.conversation.length, 2);
  assert.equal(result.draft.submittedFacts.itemTypeCode, "PHONE");
});
test("revision conflict is never hidden as provider fallback", async () => {
  await assert.rejects(
    guidance.message({
      code: "draft",
      expectedRevision: 3,
      payload: { message: "Can you help?" },
    }),
    { code: "ERR_WASTE_REVISION_CONFLICT" },
  );
  assert.equal(draft.revision, 4);
});
