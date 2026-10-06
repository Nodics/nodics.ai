/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module copilotApi/test/copilotConversationErrorTransport
 * @description Keeps missing and inaccessible owner history indistinguishable while retaining unrelated failures.
 * @layer test @owner copilotApi
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const facade = require("../src/facade/defaultCopilotFacade");
test("owner not-found signals become bounded 404 without leaking identifiers or storage detail", async (t) => {
  const previous = { SERVICE: global.SERVICE, CLASSES: global.CLASSES };
  t.after(() => Object.assign(global, previous));
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code) {
        super(code);
        this.code = code;
      }
    },
  };
  for (const code of [
    "COPILOT_CONVERSATION_NOT_FOUND",
    "COPILOT_TURN_NOT_FOUND",
  ]) {
    global.SERVICE = {
      DefaultCopilotOrchestrationService: {
        history: async () => {
          throw Object.assign(new Error("private record detail"), { code });
        },
      },
    };
    await assert.rejects(
      facade.execute("history", {}),
      (error) =>
        error.code === "ERR_CPA_00001" &&
        !error.message.includes("private record"),
    );
  }
  const storage = Object.assign(new Error("unavailable"), {
    code: "ERR_CPP_00001",
  });
  global.SERVICE.DefaultCopilotOrchestrationService.history = async () => {
    throw storage;
  };
  await assert.rejects(
    facade.execute("history", {}),
    (error) => error === storage,
  );
  assert.equal(
    require("../src/utils/statusDefinitions").ERR_CPA_00001.code,
    "404",
  );
});
