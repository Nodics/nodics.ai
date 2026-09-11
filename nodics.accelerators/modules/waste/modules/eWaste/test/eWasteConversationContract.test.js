/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module eWaste/test/eWasteConversationContract @description Verifies explicit taxonomy corrections, side questions and immutable submissions. @layer test @owner eWaste */
const test = require("node:test"),
  assert = require("node:assert/strict");
const conversation = require("../src/service/defaultEWasteConversationService");
let draft;
test.beforeEach(() => {
  global.CONFIG = {get: () => ({})};
  draft = {
    code: "draft",
    revision: 2,
    submissionStatus: "MEDIA_STAGED",
    submittedFacts: { preferredCollectionPointCode: "centre" },
    metadata: { estimate: { carbonKg: 3 }, confirmationRevision: 2 },
  };
  global.SERVICE = {
    DefaultWasteSubmissionOperationService: {
      read: async () => draft,
      facts: (value) => value,
    },
    DefaultWastePersistenceService: {
      revision: (record, expected) => assert.equal(record.revision, expected),
      list: async () => [
        {
          code: "TABLET_DEVICE",
          categoryCode: "PORTABLE",
          name: { en: "Tablet Device" },
        },
      ],
      update: async (_schema, _request, current, patch) => ({
        ...current,
        ...patch,
        revision: current.revision + 1,
      }),
      fail: (_code, message) => {
        throw Error(message);
      },
    },
    DefaultCopilotProviderService: {
      invoke: () => {
        throw Error(
          "Explicit taxonomy and side questions must not depend on model output",
        );
      },
    },
  };
});
test.afterEach(() => {
  delete global.SERVICE;
  delete global.CONFIG;
});
test("customer classification requests preserve authoritative analysis and existing readiness", async () => {
  const result = await conversation.message({
    expectedRevision: 2,
    payload: { message: "It is a tablet" },
  });
  assert.equal(result.draft.submittedFacts.itemTypeCode, undefined);
  assert.equal(result.draft.submittedFacts.categoryCode, undefined);
  assert.equal(
    result.draft.submittedFacts.preferredCollectionPointCode,
    "centre",
  );
  assert.deepEqual(result.draft.metadata.estimate, {carbonKg:3});
  assert.equal(result.draft.metadata.confirmationRevision, 2);
  assert.equal(result.changed, false);
});
test("location side questions preserve facts and do not advance submission", async () => {
  const result = await conversation.message({
    expectedRevision: 2,
    payload: { message: "Why location?" },
  });
  assert.deepEqual(result.draft.submittedFacts, draft.submittedFacts);
  assert.equal(result.draft.submissionStatus, "MEDIA_STAGED");
  assert.equal(result.changed, false);
});
test("a submitted item cannot be corrected by conversation", async () => {
  draft.submissionStatus = "SUBMITTED";
  const result = await conversation.message({
    expectedRevision: 2,
    payload: { message: "It is a tablet" },
  });
  assert.deepEqual(result.draft.submittedFacts, draft.submittedFacts);
  assert.equal(result.changed, false);
});
