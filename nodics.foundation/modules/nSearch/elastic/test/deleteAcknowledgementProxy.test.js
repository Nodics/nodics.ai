/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module elastic/test/deleteAcknowledgementProxy
 * @description Verifies exact-target, single-use response-loss injection and owned transport cleanup independently of provider acceptance.
 * @layer test @owner elastic
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const { once } = require("node:events");
const proxy = require("./helpers/deleteAcknowledgementProxy");

test("response loss is one-shot, exact-target and only after success", async (t) => {
  const index = "erasure-00000000-0000-0000-0000-000000000000-legacy";
  let status = 200;
  let received = 0;
  const upstream = http.createServer((request, response) => {
    received++;
    request.resume();
    response.writeHead(status, { "Content-Type": "application/json" });
    response.end('{"acknowledged":true}');
  });
  upstream.listen(0, "127.0.0.1");
  await once(upstream, "listening");
  const origin = "http://127.0.0.1:" + upstream.address().port;
  t.after(async () => {
    upstream.closeAllConnections();
    await new Promise((resolve) => upstream.close(resolve));
  });
  const transport = await proxy.start(origin, index);
  t.after(() => transport.close());
  transport.arm();
  assert.throws(() => transport.arm());
  assert.equal((await fetch(transport.origin + "/" + index)).status, 200);
  assert.equal(
    (await fetch(transport.origin + "/unrelated", { method: "DELETE" })).status,
    200,
  );
  status = 403;
  assert.equal(
    (await fetch(transport.origin + "/" + index, { method: "DELETE" })).status,
    403,
  );
  status = 200;
  await assert.rejects(
    fetch(transport.origin + "/" + index, { method: "DELETE" }),
  );
  assert.equal(
    (await fetch(transport.origin + "/" + index, { method: "DELETE" })).status,
    200,
  );
  assert.equal(received, 5);
  assert.deepEqual(transport.evidence(), {
    deletedRequests: 3,
    droppedResponses: 1,
  });
  await transport.close();
  await transport.close();
});

test("fault transport rejects unowned or credential-bearing origins and targets", async () => {
  const index = "erasure-00000000-0000-0000-0000-000000000000-legacy";
  for (const node of [
    "https://example.com",
    "http://localhost:9200",
    "http://user:secret@127.0.0.1:9200",
    "http://127.0.0.1:9200/path",
  ])
    await assert.rejects(proxy.start(node, index));
  await assert.rejects(proxy.start("http://127.0.0.1:9200", "*"));
});
