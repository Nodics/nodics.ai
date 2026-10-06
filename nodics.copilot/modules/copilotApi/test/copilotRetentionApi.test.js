/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @file Verifies private retention routing, original employee mapping and non-cacheable command delegation. */
"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const routes = require("../src/router/routers").copilotApi.activity;
const controller = require("../src/controller/defaultCopilotController");
const core = require("../../copilotCore/src/service/defaultCopilotOrchestrationService");

test("audit retention uses independent private employee commands and trusted request identity", async (t) => {
  const old = { FACADE: global.FACADE, SERVICE: global.SERVICE };
  t.after(() => Object.assign(global, old));
  for (const method of ["preview", "execute", "inspect", "stop"]) {
    const name = method + "AuditRetention";
    const route = Object.values(routes).find((item) => item.operation === name);
    assert.equal(route.secured, true);
    assert.deepEqual(route.authTokenTypes, ["access"]);
    assert.deepEqual(route.accessGroups, ["employeeUserGroup"]);
    assert.equal(route.permission, "copilot.audit.retention.execute");
    assert.equal(route.cache.enabled, false);
    assert.equal(route.requestPrivacy.sensitive, true);
    assert.equal(route.method, "POST");
    assert.equal(route.key, "/activity/audit-retention/" + method);
    const request = {
      tenant: "tenant",
      authData: { loginId: "original" },
      httpRequest: {
        body: { tenant: "forged", authData: { loginId: "forged" } },
      },
      httpResponse: {
        setHeader: (key, value) => {
          assert.equal(key, "Cache-Control");
          assert.equal(value, "no-store");
        },
      },
    };
    global.FACADE = {
      DefaultCopilotFacade: {
        [name]: (received) => {
          assert.equal(received.tenant, request.tenant);
          assert.equal(received.authData, request.authData);
          return "private-owner";
        },
      },
    };
    assert.equal(await controller[name](request), "private-owner");
    let enabled = true,
      calls = 0;
    const owner = {
      ...core,
      configuration: () => ({ enabled }),
      assertEnabled: (value) => assert(value.enabled),
    };
    global.SERVICE = {
      DefaultCopilotAuditRetentionService: {
        [method]: (received) => {
          assert.equal(received, request);
          calls++;
          return "private-owner";
        },
      },
    };
    assert.equal(owner[name](request), "private-owner");
    enabled = false;
    assert.throws(() => owner[name](request));
    assert.equal(calls, 1);
  }
});

test("retention routes preserve separate employee execution grants, privacy and trusted route identity", async (t) => {
  const old = { FACADE: global.FACADE, SERVICE: global.SERVICE };
  t.after(() => Object.assign(global, old));
  const commands = ["preview", "begin", "inspect", "advance", "stop"].map(
    (method) => [method, method + "RetentionExecution", method],
  );
  commands.push(
    ["previewResume", "previewRetentionResume", "resume-preview"],
    ["resume", "resumeRetentionExecution", "resume"],
  );
  commands.push(
    ["previewClosure", "previewConversationClosure", "close-preview"],
    ["close", "closeConversation", "close"],
    ["inspectClosure", "inspectConversationClosure", "close-inspect"],
  );
  for (const [method, name, suffix] of commands) {
    const route = routes[name];
    assert.equal(route.secured, true);
    assert.deepEqual(route.authTokenTypes, ["access"]);
    assert.deepEqual(route.accessGroups, ["employeeUserGroup"]);
    assert.equal(route.permission, "copilot.activity.lifecycle.execute");
    assert.equal(route.cache.enabled, false);
    assert.equal(route.requestPrivacy.sensitive, true);
    assert.equal(route.method, "POST");
    assert.equal(route.key, "/activity/:conversationCode/retention/" + suffix);
    const request = {
      tenant: "tenant",
      authData: { loginId: "employee" },
      httpRequest: {
        params: { conversationCode: "original" },
        body: { conversationCode: "forged", authData: {} },
      },
      httpResponse: {
        setHeader: (key, value) => {
          assert.equal(key, "Cache-Control");
          assert.equal(value, "no-store");
        },
      },
    };
    global.FACADE = {
      DefaultCopilotFacade: {
        [name]: (received) => {
          assert.equal(received.authData, request.authData);
          assert.equal(received.conversationCode, "original");
          return { ok: true };
        },
      },
    };
    assert.deepEqual(await controller[name](request), { ok: true });
    let enabled = true,
      calls = 0;
    const owner = {
      ...core,
      configuration: () => ({ enabled }),
      assertEnabled: (config) => assert(config.enabled),
    };
    global.SERVICE = {
      DefaultCopilotRetentionExecutionService: {
        [method]: (received) => {
          calls++;
          assert.equal(received, request);
          return "owner";
        },
      },
    };
    assert.equal(owner[name](request), "owner");
    enabled = false;
    assert.throws(() => owner[name](request));
    assert.equal(calls, 1);
  }
});
