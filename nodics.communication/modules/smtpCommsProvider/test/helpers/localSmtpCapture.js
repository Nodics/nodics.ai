/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/**
 * @module smtpCommsProvider/test/helpers/localSmtpCapture
 * @description Bounded authenticated loopback SMTP capture fixture. Never relays,
 * sends notifications, creates identities or grants deployment qualification.
 * @owner smtpCommsProvider
 * @layer test
 */
const net = require("node:net");
const crypto = require("node:crypto");
const email = require("email-validator");

/** Admits literal reserved test mailboxes only, never headers or routing syntax. */
function mailbox(value) {
  if (typeof value !== "string" || value.length > 254 || value !== value.toLowerCase() ||
      /[\s<>;,\r\n]/.test(value) || !value.endsWith(".test") || !email.validate(value))
    throw new Error("CAPTURE_SELECTION_REFUSED");
  return value;
}

/** Starts one explicitly selected fixture. onMessage is synchronous private storage, not delivery. */
async function createCapture({ port = 0, sender, recipients, password, onMessage,
  maximumMessages = 20, maximumBytes = 131072, idleMilliseconds = 10000 }) {
  mailbox(sender);
  if (!Array.isArray(recipients) || recipients.length < 1 || recipients.length > 10 ||
      new Set(recipients).size !== recipients.length ||
      typeof password !== "string" || !/^[A-Za-z0-9_-]{32,128}$/.test(password) ||
      !Number.isInteger(port) || port < 0 || port > 65535 || typeof onMessage !== "function" ||
      !Number.isInteger(maximumMessages) || maximumMessages < 1 || maximumMessages > 100 ||
      !Number.isInteger(maximumBytes) || maximumBytes < 1024 || maximumBytes > 262144 ||
      !Number.isInteger(idleMilliseconds) || idleMilliseconds < 100 || idleMilliseconds > 30000)
    throw new Error("CAPTURE_SELECTION_REFUSED");
  recipients.forEach(mailbox);
  const allowed = new Set(recipients), sockets = new Set();
  let accepted = 0, rejected = 0;
  const same = (actual, expected) => {
    const a = Buffer.from(actual), b = Buffer.from(expected);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  };
  const server = net.createServer(socket => {
    if (sockets.size >= 4) { socket.end("421 Capture busy\r\n"); return; }
    sockets.add(socket);
    socket.on("close", () => sockets.delete(socket));
    socket.on("error", () => {});
    let terminal = false;
    socket.setTimeout(idleMilliseconds, () => { terminal = true; socket.destroy(); });
    let pending = Buffer.alloc(0), greeted = false, authenticated = false;
    let awaitingAuth = false, authFailures = 0, from = false, recipient, data = false, bytes = 0;
    let message = [];
    const reset = () => { from = false; recipient = undefined; data = false; bytes = 0; message = []; };
    const terminate = value => {
      terminal = true;
      pending = Buffer.alloc(0);
      authenticated = false;
      awaitingAuth = false;
      reset();
      socket.pause();
      socket.end(value + "\r\n");
      socket.destroySoon();
    };
    const reply = value => socket.write(value + "\r\n");
    const deny = value => { rejected++; reply(value); };
    const authenticate = encoded => {
      awaitingAuth = false;
      let parts = [];
      if (/^[A-Za-z0-9+/]+={0,2}$/.test(encoded) && encoded.length <= 512) {
        const decoded = Buffer.from(encoded, "base64");
        if (decoded.toString("base64") === encoded) parts = decoded.toString("utf8").split("\0");
      }
      authenticated = parts.length === 3 && (parts[0] === "" || same(parts[0], sender)) &&
        same(parts[1], sender) && same(parts[2], password);
      if (authenticated) reply("235 Capture authenticated");
      else {
        if (++authFailures >= 3) { rejected++; terminate("535 Authentication refused"); }
        else deny("535 Authentication refused");
      }
    };
    reply("220 localhost restricted capture");
    socket.on("data", chunk => {
      if (terminal) return;
      if (pending.length + chunk.length > maximumBytes + 1024) {
        rejected++; terminate("552 Capture bound exceeded"); return;
      }
      pending = Buffer.concat([pending, chunk]);
      let boundary;
      while (!terminal && !socket.destroyed && (boundary = pending.indexOf("\r\n")) >= 0) {
        const line = pending.subarray(0, boundary);
        pending = pending.subarray(boundary + 2);
        if (line.length > (data ? maximumBytes : 512)) {
          rejected++; terminate("552 Capture line bound exceeded"); return;
        }
        const command = line.toString("utf8");
        if (data) {
          if (command === ".") {
            if (accepted >= maximumMessages) { deny("452 Capture capacity reached"); reset(); continue; }
            try {
              const result = onMessage(Buffer.concat(message), { sender, recipient, sequence: accepted + 1 });
              if (result && typeof result.then === "function") throw new Error();
              accepted++; reply("250 Accepted for private local capture");
            } catch { deny("451 Capture storage unavailable"); }
            reset();
          } else {
            const content = line[0] === 46 ? line.subarray(1) : line;
            bytes += content.length + 2;
            if (bytes > maximumBytes) { rejected++; terminate("552 Capture message bound exceeded"); return; }
            message.push(content, Buffer.from("\r\n"));
          }
          continue;
        }
        if (awaitingAuth) { authenticate(command); continue; }
        if (/^(EHLO|HELO) [!-~]{1,200}$/.test(command)) {
          greeted = true; reset();
          reply("250-localhost\r\n250-SIZE " + maximumBytes + "\r\n250 AUTH PLAIN");
        } else if (command === "QUIT") { terminate("221 Capture closed"); return; }
        else if (command === "RSET") { reset(); reply("250 Reset"); }
        else if (command === "NOOP") reply("250 Capture ready");
        else if (/^AUTH PLAIN(?: |$)/.test(command)) {
          if (!greeted || authenticated || from) deny("503 Invalid authentication sequence");
          else if (command === "AUTH PLAIN") { awaitingAuth = true; reply("334 "); }
          else authenticate(command.slice(11));
        } else if (!greeted || !authenticated) deny("530 Authentication required");
        else if (/^MAIL FROM:</.test(command)) {
          reset();
          if (command !== "MAIL FROM:<" + sender + ">") deny("550 Sender refused");
          else { from = true; reply("250 Sender accepted"); }
        } else if (/^RCPT TO:</.test(command)) {
          const match = command.match(/^RCPT TO:<([^<>]+)>$/);
          if (!from) deny("503 Sender required");
          else if (recipient) deny("452 Exactly one recipient permitted");
          else if (!match || !allowed.has(match[1])) deny("550 Recipient refused");
          else { recipient = match[1]; reply("250 Recipient accepted"); }
        } else if (command === "DATA") {
          if (!from || !recipient) deny("503 Approved envelope required");
          else if (accepted >= maximumMessages) deny("452 Capture capacity reached");
          else { data = true; reply("354 Send bounded capture content"); }
        } else deny("502 Command unsupported");
      }
      if (!terminal && !data && pending.length > 512) { rejected++; terminate("552 Capture line bound exceeded"); }
    });
  });
  try {
    await new Promise((resolve, reject) => {
      server.once("error", reject);
      server.listen({ host: "127.0.0.1", port, exclusive: true }, resolve);
    });
  } catch { server.close(); throw new Error("CAPTURE_BIND_REFUSED"); }
  server.on("error", () => {});
  return {
    port: server.address().port,
    /** Content-free observations only. */
    status: () => ({ accepted, rejected, connections: sockets.size, relay: false }),
    /** Closes only this fixture and its owned connections. */
    close: async () => {
      for (const socket of sockets) socket.destroy();
      await new Promise(resolve => server.close(resolve));
    },
  };
}
module.exports = { createCapture, mailbox };
