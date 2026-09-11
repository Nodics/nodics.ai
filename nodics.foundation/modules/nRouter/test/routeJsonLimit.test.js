/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nRouter/test/routeJsonLimit @description Verifies a server-authored route limit without widening other request parsers. @owner nRouter @layer test */
const { test } = require("node:test"), assert = require("node:assert/strict"), express = require("express");
const parser = require("../src/service/handlers/parser/defaultJsonBodyParserHandlerService");
test("a bounded photo route can accept a larger body while defaults remain restricted", async () => {
  const policy = { limit: "1kb", strict: true };
  global.SERVICE = { DefaultHttpHardeningService: { getUrlencodedParserOptions: () => ({ extended: true, limit: "1kb" }), getJsonParserOptions: () => policy } };
  const app = express();
  app.post("/ordinary", parser.getBodyParser({}), (_req, res) => res.sendStatus(200));
  app.post("/image", parser.getBodyParser({ jsonBodyLimit: "8kb" }), (_req, res) => res.sendStatus(200));
  app.use((error, _req, res, _next) => res.sendStatus(error.status || 500));
  const server = app.listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  const post = (route, length) => fetch(`http://127.0.0.1:${server.address().port}${route}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ photo: "x".repeat(length) }) });
  try {
    assert.equal((await post("/ordinary", 2048)).status, 413);
    assert.equal((await post("/image", 2048)).status, 200);
    assert.equal((await post("/image", 9000)).status, 413);
    assert.equal(policy.limit, "1kb");
  } finally { await new Promise(resolve => server.close(resolve)); delete global.SERVICE; }
});
