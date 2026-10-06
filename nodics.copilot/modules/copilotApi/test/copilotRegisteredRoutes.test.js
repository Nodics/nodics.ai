/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module copilotApi/test/copilotRegisteredRoutes
 * @description Exercises real nRouter HTTP binding and live lookup for every Copilot route; the request pipeline is a metadata-only test sink, not authentication or owner acceptance.
 * @layer test @owner copilotApi
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const { once } = require("node:events");
const routes = require("../src/router/routers").copilotApi;
const router = require("../../../../nodics.foundation/modules/nRouter/src/service/router/defaultRouterService");
const operations = require("../../../../nodics.foundation/modules/nRouter/src/service/router/defaultRouterOperationService");
const logger = require("../../../../nodics.foundation/modules/nConfig/src/service/DefaultLoggerService");

test("every Copilot URL dispatches its own live operation and permission through nRouter", async (t) => {
  const previous = Object.fromEntries(
    ["CONFIG", "SERVICE", "NODICS", "_"].map((key) => [key, global[key]]),
  );
  t.after(() => Object.assign(global, previous));
  const registry = new Map();
  global._ = require("lodash");
  global.CONFIG = {
    get: (key) =>
      ({
        servers: { options: { contextRoot: "nodics" } },
        log: { requestPrivacy: { qualified: true, captureMode: "disabled" } },
        bodyParserHandler: { jsonBodyParserHandler: "TestJsonParser" },
      })[key],
  };
  global.NODICS = {
    addRouter: (name, definition, module) =>
      registry.set(module + ":" + name, definition),
    getRouter: (name, module) => registry.get(module + ":" + name),
  };
  global.SERVICE = {
    DefaultRouterOperationService: operations,
    DefaultLoggerService: logger,
    TestJsonParser: { getBodyParser: () => express.json() },
    DefaultRequestHandlerService: {
      startRequestHandler: (req, res, definition) =>
        res.json({
          operation: definition.operation,
          permission: definition.permission ?? null,
          secured: definition.secured,
          private: logger.isSensitiveRequest(req),
        }),
    },
  };
  const app = express();
  app.use((req, res, next) => logger.runRequestPrivacy(req, next));
  const definitions = Object.values(routes).flatMap((group) =>
    Object.entries(group),
  );
  for (const [name, definition] of definitions) {
    router.prepareRouter({
      routerName: name,
      routerDef: definition,
      moduleName: "copilotApi",
      urlPrefix: "copilotApi",
      moduleRouter: app,
    });
  }
  assert.equal(
    registry.size,
    definitions.length,
    "module-wide route names must not overwrite another group",
  );
  const server = app.listen(0, "127.0.0.1");
  t.after(() => new Promise((resolve) => server.close(resolve)));
  await once(server, "listening");
  for (const [, definition] of definitions) {
    const url =
      `http://127.0.0.1:${server.address().port}/nodics/copilotApi/v0` +
      definition.key.replace(/:[A-Za-z][A-Za-z0-9]*/g, "test-record");
    const response = await fetch(url, { method: definition.method });
    assert.equal(response.status, 200, definition.key);
    assert.deepEqual(
      await response.json(),
      {
        operation: definition.operation,
        permission: definition.permission ?? null,
        secured: definition.secured,
        private: definition.requestPrivacy?.sensitive === true,
      },
      definition.key,
    );
  }
});
