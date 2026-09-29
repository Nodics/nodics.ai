/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module editorial/test/editorialWorkflowEndpoint @description Verifies explicit Process connection selection and legacy URL overrides without network calls. @owner editorial */
const assert = require("node:assert/strict");
const test = require("node:test");
const adapter = require("../src/service/defaultEditorialWorkflowAdapterService");
const router = require("../../../../nodics.foundation/modules/nRouter/src/service/router/defaultRouterService");

test("Editorial resolves the selected internal endpoint and preserves explicit URL overrides", () => {
  const previous = { CONFIG: global.CONFIG, SERVICE: global.SERVICE };
  let settings = { processConnectionName: "workflowPeer" };
  let host = "workflow.internal", port = 8123;
  const endpoint = { getHttpHost: () => host, getHttpPort: () => port };
  const pool = {
    isAvailableModuleConfig: name => name === "workflowPeer",
    getModule: () => ({ getAbstractEndpoint: () => endpoint,
      getBrowserEndpoint: () => { throw new Error("Published endpoint must not route internal calls"); } }),
  };
  try {
    global.CONFIG = { get: () => ({ workflow: settings }) };
    global.SERVICE = { DefaultRouterService: { ...router, serversConfigPool: pool } };
    assert.equal(adapter.processBaseUrl(), "http://workflow.internal:8123");
    host = "changed.internal";
    port = 9234;
    assert.equal(adapter.processBaseUrl(), "http://changed.internal:9234");
    settings.processBaseUrl = "https://explicit.example/process///";
    assert.equal(adapter.processBaseUrl(), "https://explicit.example/process");
    settings = { processConnectionName: "unselected" };
    assert.equal(adapter.processBaseUrl(), "", "Missing peers must not fall back to the local listener");
    settings = {};
    assert.equal(adapter.processBaseUrl(), "");
  } finally {
    global.CONFIG = previous.CONFIG;
    global.SERVICE = previous.SERVICE;
  }
});
