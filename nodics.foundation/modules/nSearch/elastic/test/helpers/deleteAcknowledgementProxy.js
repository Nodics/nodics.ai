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
 * @description Forwards one disposable loopback provider transport and can drop the successful response of one exact index delete. No payloads or credentials are retained.
 * @layer test @owner elastic
 */
const http = require("node:http");
const { once } = require("node:events");

/** Starts an owned fault transport for a generated acceptance index only. @param {string} node Owned provider origin. @param {string} index Owned target name. @returns {Promise<Object>} Origin, bounded arming, counters and close. */
async function start(node, index) {
  const upstream = new URL(node);
  if (
    upstream.protocol !== "http:" ||
    upstream.hostname !== "127.0.0.1" ||
    upstream.username ||
    upstream.password ||
    upstream.pathname !== "/" ||
    upstream.search ||
    upstream.hash ||
    !/^erasure-[a-f0-9-]{36}-legacy$/.test(index)
  )
    throw new Error("Disposable provider transport required");
  let armed = false;
  let armedOnce = false;
  let deletedRequests = 0;
  let droppedResponses = 0;
  const sockets = new Set();
  const pending = new Set();
  const server = http.createServer((request, response) => {
    const target =
      request.method === "DELETE" &&
      new URL(request.url, node).pathname === "/" + index;
    if (target) deletedRequests++;
    const outgoing = http.request(
      {
        hostname: upstream.hostname,
        port: upstream.port,
        path: request.url,
        method: request.method,
        headers: { ...request.headers, host: upstream.host },
      },
      (incoming) => {
        if (
          target &&
          armed &&
          incoming.statusCode >= 200 &&
          incoming.statusCode < 300
        ) {
          armed = false;
          incoming.resume();
          incoming.once("end", () => {
            droppedResponses++;
            response.destroy();
          });
        } else {
          response.writeHead(incoming.statusCode, incoming.headers);
          incoming.pipe(response);
        }
        incoming.once("error", () => response.destroy());
      },
    );
    pending.add(outgoing);
    outgoing.once("close", () => pending.delete(outgoing));
    outgoing.once("error", () => response.destroy());
    request.once("aborted", () => outgoing.destroy());
    request.pipe(outgoing);
  });
  server.on("connection", (socket) => {
    sockets.add(socket);
    socket.once("close", () => sockets.delete(socket));
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  return {
    origin: "http://127.0.0.1:" + server.address().port,
    /** Arms exactly once before dispatch; never changes the upstream operation. */
    arm: function () {
      if (armedOnce) throw new Error("Fault already armed");
      armed = armedOnce = true;
    },
    /** Returns numeric transport evidence only. */
    evidence: function () {
      return { deletedRequests, droppedResponses };
    },
    /** Closes only owned transport connections and listener. */
    close: async function () {
      for (const request of pending) request.destroy();
      for (const socket of sockets) socket.destroy();
      if (server.listening)
        await new Promise((resolve, reject) =>
          server.close((error) => (error ? reject(error) : resolve())),
        );
    },
  };
}
module.exports = { start };
