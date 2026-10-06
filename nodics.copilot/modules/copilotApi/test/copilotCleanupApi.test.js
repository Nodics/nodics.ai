/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @file Verifies employee cleanup routes, uncached mapping and fresh Core delegation without domain or index writes. */
"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const routes = require("../src/router/routers").copilotApi.knowledge;
const controller = require("../src/controller/defaultCopilotController");
const core = require("../../copilotCore/src/service/defaultCopilotOrchestrationService");

test("physical erasure has independent command grants, private route binding and no-store inspection", async () => {
  for (const [name, permission] of [
    ["erasureReview", "erase"],
    ["erasureExecute", "erase"],
    ["erasureInspect", "read"],
  ]) {
    const route = routes[name];
    assert.equal(route.permission, "copilot.knowledge.migration." + permission);
    assert.equal(route.secured, true);
    assert.equal(route.sensitive, true);
    assert.equal(route.cache.enabled, false);
    assert.deepEqual(route.authTokenTypes, ["access"]);
    assert.deepEqual(route.accessGroups, ["employeeUserGroup"]);
    const authData = { loginId: "employee" };
    const headers = {};
    global.FACADE = {
      DefaultCopilotFacade: {
        [route.operation]: (input) => {
          assert.equal(input.authData, authData);
          assert.equal(input.migrationCode, "configured-plan");
          return { state: "OUTCOME_UNKNOWN" };
        },
      },
    };
    await controller[route.operation]({
      tenant: "tenant",
      authData,
      httpRequest: {
        params: { migrationCode: "configured-plan" },
        body: { migrationCode: "forged", authData: {} },
      },
      httpResponse: {
        setHeader: (key, value) => {
          headers[key] = value;
        },
      },
    });
    assert.equal(headers["Cache-Control"], "no-store");
  }
});

test("maintenance history is a separately authorized uncached read with route-bound source identity", async () => {
  const route = routes.knowledgeMaintenanceHistory;
  assert.equal(route.method, "GET");
  assert.equal(route.permission, "copilot.knowledge.maintenance.read");
  assert.deepEqual(route.accessGroups, ["employeeUserGroup"]);
  assert.deepEqual(route.authTokenTypes, ["access"]);
  assert.equal(route.secured, true);
  assert.equal(route.cache.enabled, false);
  const request = {
    tenant: "tenant",
    authData: { loginId: "auditor" },
    httpRequest: { params: { sourceCode: "source" }, query: { page: "2" } },
    httpResponse: {
      setHeader: (key, value) => {
        assert.equal(key, "Cache-Control");
        assert.equal(value, "no-store");
      },
    },
  };
  global.FACADE = {
    DefaultCopilotFacade: {
      getKnowledgeMaintenanceHistory: (received) => {
        assert.equal(received.sourceCode, "source");
        assert.deepEqual(received.query, { page: "2" });
        assert.equal(received.authData, request.authData);
        return { items: [] };
      },
    },
  };
  assert.deepEqual(await controller.getKnowledgeMaintenanceHistory(request), {
    items: [],
  });
});

test("cleanup endpoints require the independent employee grant and preserve trusted HTTP identity", async () => {
  for (const [name, operation, path] of [
    ["cleanupPreview", "previewKnowledgeCleanup", "/cleanup/preview"],
    ["cleanup", "cleanupKnowledgeSource", "/cleanup"],
  ]) {
    const route = routes[name];
    assert.equal(route.secured, true);
    assert.deepEqual(route.accessGroups, ["userGroup"]);
    assert.equal(route.permission, "copilot.knowledge.cleanup.execute");
    assert.equal(route.apiExposure, "copilotApi");
    assert.equal(route.method, "POST");
    assert.equal(route.key, "/knowledge/sources/:sourceCode" + path);
    assert.equal(route.operation, operation);
    assert.equal(route.cache.enabled, false);
    const authData = { loginId: "employee" };
    const body = { confirmed: true, sourceCode: "forged", authData: {} };
    const headers = {};
    const request = {
      tenant: "tenant",
      authData,
      httpRequest: { body, params: { sourceCode: "source" } },
      httpResponse: {
        setHeader: (key, value) => {
          headers[key] = value;
        },
      },
    };
    global.FACADE = {
      DefaultCopilotFacade: {
        [operation]: (received) => {
          assert.equal(received.authData, authData);
          assert.equal(received.tenant, "tenant");
          assert.equal(received.sourceCode, "source");
          assert.equal(received.body, body);
          return { acknowledged: true };
        },
      },
    };
    assert.deepEqual(await controller[operation](request), {
      acknowledged: true,
    });
    assert.equal(headers["Cache-Control"], "no-store");
  }
});

test("writer recovery routes retain independent authorization and no-store trusted mapping", async () => {
  for (const [operation, suffix] of [
    ["previewKnowledgeWriterRecovery", "/writer-recovery/preview"],
    ["retireKnowledgeWriter", "/writer-recovery"],
  ]) {
    const route = Object.values(routes).find(
      (value) => value.operation === operation,
    );
    assert.ok(route);
    assert.equal(route.permission, "copilot.knowledge.recovery.execute");
    assert.equal(route.secured, true);
    assert.deepEqual(route.accessGroups, ["employeeUserGroup"]);
    assert.deepEqual(route.authTokenTypes, ["access"]);
    assert.equal(route.key, "/knowledge/sources/:sourceCode" + suffix);
    assert.equal(route.method, "POST");
    assert.equal(route.cache.enabled, false);
    const request = {
      tenant: "tenant",
      authData: { loginId: "employee" },
      httpRequest: {
        body: { authData: { loginId: "forged" } },
        params: { sourceCode: "source" },
      },
      httpResponse: {
        setHeader: (name, value) => {
          assert.equal(name, "Cache-Control");
          assert.equal(value, "no-store");
        },
      },
    };
    global.FACADE = {
      DefaultCopilotFacade: {
        [operation]: (received) => {
          assert.equal(received.authData, request.authData);
          assert.equal(received.sourceCode, "source");
          return { reviewed: true };
        },
      },
    };
    assert.deepEqual(await controller[operation](request), { reviewed: true });
  }
});

test("Core refreshes cleanup security context and denies disabled configuration before delegation", async () => {
  for (const [operation, method] of [
    ["previewKnowledgeCleanup", "preview"],
    ["cleanupKnowledgeSource", "execute"],
  ]) {
    let enabled = true;
    let calls = 0;
    const fresh = { actor: "employee", enterprise: "enterprise" };
    const service = {
      ...core,
      configuration: () => ({ enabled }),
      assertEnabled: (configuration) => {
        assert.equal(configuration.enabled, true);
      },
      securityContext: () => fresh,
    };
    global.SERVICE = {
      DefaultCopilotKnowledgeCleanupService: {
        [method]: (request) => {
          calls++;
          assert.equal(request.securityContext, fresh);
          return { state: method };
        },
      },
    };
    assert.deepEqual(
      await service[operation]({ securityContext: { actor: "forged" } }),
      { state: method },
    );
    enabled = false;
    assert.throws(() => service[operation]({}));
    assert.equal(calls, 1);
  }
});
