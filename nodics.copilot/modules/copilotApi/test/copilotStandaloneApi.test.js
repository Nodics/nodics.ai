/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module copilotApi/test/copilotStandaloneApi @description Secured preparation routes retain original identity, privacy and non-cacheable thin delegation. @layer test @owner copilotApi */
const test = require("node:test");
const assert = require("node:assert/strict");
const routes = require("../src/router/routers").copilotApi;
const controller = require("../src/controller/defaultCopilotController");
const facade = require("../src/facade/defaultCopilotFacade");
const core = require("../../copilotCore/src/service/defaultCopilotOrchestrationService");
for (const [name, path, owner] of [
  [
    "prepareInvitationPlan",
    "/invitations/prepare",
    "DefaultCopilotInvitationActionService",
  ],
  ["preparePricePlan", "/prices/prepare", "DefaultCopilotPriceActionService"],
]) {
  test(
    name + " uses a private employee route and preserves trusted identity",
    async (t) => {
      const prior = { FACADE: global.FACADE, SERVICE: global.SERVICE };
      t.after(() => Object.assign(global, prior));
      const route = Object.values(routes)
        .flatMap((group) => Object.values(group))
        .find((item) => item.operation === name);
      assert.equal(route.secured, true);
      assert.deepEqual(route.authTokenTypes, ["access"]);
      assert.deepEqual(route.accessGroups, ["employeeUserGroup"]);
      assert.equal(route.key, path);
      assert.equal(route.permission, "copilot.mutation.prepare");
      assert.equal(route.requestPrivacy.sensitive, true);
      assert.equal(route.cache.enabled, false);
      const request = {
        tenant: "trusted",
        authData: { loginId: "employee" },
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
            assert.equal(received.tenant, "trusted");
            assert.equal(received.authData, request.authData);
            return "review";
          },
        },
      };
      assert.equal(await controller[name](request), "review");
      assert.equal(
        facade[name].call(
          {
            execute: (method, received) => {
              assert.equal(method, name);
              assert.equal(received, request);
              return "review";
            },
          },
          request,
        ),
        "review",
      );
      let enabled = true,
        calls = 0;
      const service = {
        ...core,
        configuration: () => ({ enabled }),
        assertEnabled: (config) => assert(config.enabled),
      };
      global.SERVICE = {
        [owner]: {
          prepare: (received) => {
            assert.equal(received, request);
            calls++;
            return "review";
          },
        },
      };
      assert.equal(service[name](request), "review");
      enabled = false;
      assert.throws(() => service[name](request));
      assert.equal(calls, 1);
    },
  );
}
