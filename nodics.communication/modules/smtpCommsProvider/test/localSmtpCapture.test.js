/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module smtpCommsProvider/test/localSmtpCapture @description Isolated artificial protocol/privacy fixtures, not installed onboarding qualification. @owner smtpCommsProvider @layer test */
"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const net = require("node:net");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const nodemailer = require("nodemailer");
const { spawnSync } = require("node:child_process");
const { createCapture } = require("./helpers/localSmtpCapture");
const sender = "sender@isolated-capture.test", recipient = "first@isolated-capture.test";
const password = "isolated-fixture-binding-not-a-user-password";
const options = { sender, recipients: [recipient, "second@isolated-capture.test"], password, onMessage() {} };
const connect = async (port, allowHalfOpen = false) => {
  const socket = net.connect({ port, host: "127.0.0.1", allowHalfOpen });
  let buffer = "", resolve, reject;
  const next = () => new Promise((yes, no) => { resolve = yes; reject = no; });
  socket.on("data", chunk => {
    buffer += chunk;
    let end;
    while ((end = buffer.indexOf("\r\n")) >= 0) {
      const line = buffer.slice(0, end); buffer = buffer.slice(end + 2);
      if (/^[0-9]{3} /.test(line) && resolve) { const yes = resolve; resolve = undefined; yes(Number(line.slice(0, 3))); }
    }
  });
  socket.on("error", error => { if (reject) reject(error); });
  const ready = next();
  assert.equal(await ready, 220);
  return { socket, command: value => { const response = next(); socket.write(value + "\r\n"); return response; } };
};
const auth = client => client.command("AUTH PLAIN " + Buffer.from("\0" + sender + "\0" + password).toString("base64"));

test("test discovery cannot accidentally start the operated capture CLI", () => {
  const result = spawnSync(process.execPath, ["--test", path.join(__dirname, "localSmtpCapture.mjs")],
    { encoding: "utf8", timeout: 5000 });
  assert.equal(result.status, 0);
  assert(!result.stdout.includes("LOCAL_SMTP_CAPTURE_READY"));
  assert(!result.stderr.includes("LOCAL_SMTP_CAPTURE_REFUSED"));
});

test("real maintained SMTP client captures only the approved pair with no relay or content diagnostics", async () => {
  const messages = [];
  const server = await createCapture({ ...options, onMessage: (bytes, metadata) => messages.push({ bytes, metadata }) });
  const transport = nodemailer.createTransport({ host: "127.0.0.1", port: server.port, secure: false,
    ignoreTLS: true, auth: { user: sender, pass: password }, logger: false, debug: false });
  try {
    for (const to of options.recipients) {
      const result = await transport.sendMail({ from: sender, to, subject: "ARTIFICIAL ONLY", text: "Not an OTP or business message." });
      assert.deepEqual(result.accepted, [to]);
    }
    assert.equal(messages.length, 2);
    assert.equal(server.status().relay, false);
    assert.equal(server.status().accepted, 2);
    assert(!JSON.stringify(server.status()).includes(recipient));
    assert(!JSON.stringify(server.status()).includes(password));
    assert.match(messages[0].bytes.toString(), /Not an OTP/);
  } finally { transport.close(); await server.close(); }
});

test("authentication, exact sender, one recipient and sequence are enforced before DATA", async () => {
  let writes = 0;
  const server = await createCapture({ ...options, onMessage: () => writes++ });
  const client = await connect(server.port);
  try {
    assert.equal(await client.command("MAIL FROM:<" + sender + ">"), 530);
    assert.equal(await client.command("EHLO local.test"), 250);
    assert.equal(await client.command("AUTH PLAIN " + Buffer.from("\0" + sender + "\0wrong").toString("base64")), 535);
    assert.equal(await auth(client), 235);
    assert.equal(await client.command("MAIL FROM:<other@isolated-capture.test>"), 550);
    assert.equal(await client.command("DATA"), 503);
    assert.equal(await client.command("MAIL FROM:<" + sender + ">"), 250);
    assert.equal(await client.command("RCPT TO:<unapproved@isolated-capture.test>"), 550);
    assert.equal(await client.command("DATA"), 503);
    assert.equal(await client.command("RCPT TO:<" + recipient + ">"), 250);
    assert.equal(await client.command("RCPT TO:<second@isolated-capture.test>"), 452);
    assert.equal(await client.command("VRFY " + recipient), 502);
    assert.equal(writes, 0);
  } finally { client.socket.destroy(); await server.close(); }
});

test("invalid selections and occupied ports refuse without broadening the bind", async () => {
  for (const change of [{ sender: "sender@example.com" }, { recipients: [recipient, recipient] },
    { password: "short" }, { port: -1 }, { recipients: ["first@isolated-capture.test\r\nDATA"] }])
    await assert.rejects(createCapture({ ...options, ...change }), /SELECTION_REFUSED/);
  const first = await createCapture(options);
  try { await assert.rejects(createCapture({ ...options, port: first.port }), /BIND_REFUSED/); }
  finally { await first.close(); }
});

test("capacity and storage failures cannot acknowledge another captured message", async () => {
  for (const failure of [false, true]) {
    const server = await createCapture({ ...options, maximumMessages: 1,
      onMessage() { if (failure) throw new Error("private-storage-detail"); } });
    const c = await connect(server.port);
    try {
      await c.command("EHLO local.test"); await auth(c);
      await c.command("MAIL FROM:<" + sender + ">"); await c.command("RCPT TO:<" + recipient + ">");
      assert.equal(await c.command("DATA"), 354);
      assert.equal(await c.command("artificial\r\n."), failure ? 451 : 250);
      assert.equal(server.status().accepted, failure ? 0 : 1);
      if (!failure) {
        await c.command("MAIL FROM:<" + sender + ">"); await c.command("RCPT TO:<" + recipient + ">");
        assert.equal(await c.command("DATA"), 452);
      }
    } finally { c.socket.destroy(); await server.close(); }
  }
});

test("message and command bounds close the connection without capture", async () => {
  let writes = 0;
  const server = await createCapture({ ...options, maximumBytes: 1024, onMessage: () => writes++ });
  const c = await connect(server.port);
  try {
    await c.command("EHLO local.test"); await auth(c);
    await c.command("MAIL FROM:<" + sender + ">"); await c.command("RCPT TO:<" + recipient + ">");
    await c.command("DATA");
    assert.equal(await c.command("x".repeat(1025)), 552);
    assert.equal(writes, 0);
  } finally { c.socket.destroy(); await server.close(); }
});

test("concurrent DATA sessions cannot exceed the total capture bound", async () => {
  let writes = 0;
  const server = await createCapture({ ...options, maximumMessages: 1, onMessage: () => writes++ });
  const first = await connect(server.port), second = await connect(server.port);
  try {
    for (const c of [first, second]) {
      await c.command("EHLO local.test"); await auth(c);
      await c.command("MAIL FROM:<" + sender + ">"); await c.command("RCPT TO:<" + recipient + ">");
      assert.equal(await c.command("DATA"), 354);
    }
    assert.equal(await first.command("artificial\r\n."), 250);
    assert.equal(await second.command("artificial\r\n."), 452);
    assert.equal(writes, 1);
  } finally { first.socket.destroy(); second.socket.destroy(); await server.close(); }
});

test("terminal 552 cannot capture buffered or later input on a half-open connection", async () => {
  for (const overflow of ["x".repeat(1025), "x".repeat(600) + "\r\n" + "y".repeat(600)]) {
    let writes = 0;
    const server = await createCapture({ ...options, maximumBytes: 1024, onMessage: () => writes++ });
    const c = await connect(server.port, true);
    try {
      await c.command("EHLO local.test"); await auth(c);
      await c.command("MAIL FROM:<" + sender + ">"); await c.command("RCPT TO:<" + recipient + ">");
      await c.command("DATA");
      assert.equal(await c.command(overflow + "\r\n."), 552);
      c.socket.write(".\r\nNOOP\r\n");
      await new Promise(resolve => setTimeout(resolve, 50));
      assert.equal(writes, 0);
      assert.equal(server.status().accepted, 0);
    } finally { c.socket.destroy(); await server.close(); }
  }
});

test("idle connections close and command framing remains bounded", async () => {
  const server = await createCapture({ ...options, idleMilliseconds: 100 });
  const idle = await connect(server.port);
  try {
    await new Promise(resolve => idle.socket.once("close", resolve));
    const c = await connect(server.port);
    try { assert.equal(await c.command("x".repeat(513)), 552); }
    finally { c.socket.destroy(); }
  } finally { idle.socket.destroy(); await server.close(); }
});

test("private session keeps binding/content owner-only and cleans only its own files", async () => {
  const owner = await import(pathToFileURL(path.join(__dirname, "localSmtpCapture.mjs")));
  const directory = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "nodics-capture-test-")));
  fs.chmodSync(directory, 0o700);
  const reserved = net.createServer();
  await new Promise(resolve => reserved.listen(0, "127.0.0.1", resolve));
  const port = reserved.address().port;
  await new Promise(resolve => reserved.close(resolve));
  let session;
  try {
    session = await owner.startSession({ directory, port, sender, recipients: options.recipients });
    const binding = owner.readBinding(directory);
    assert.equal(binding.NODICS_EMPLOYEE_SMTP_HOST, "127.0.0.1");
    assert(!JSON.stringify(session.receipt).includes(binding.NODICS_EMPLOYEE_SMTP_PASSWORD));
    assert.equal(fs.statSync(path.join(directory, "binding.json")).mode & 0o777, 0o600);
    const bindingFile = path.join(directory, "binding.json");
    fs.chmodSync(bindingFile, 0o644);
    assert.throws(() => owner.readBinding(directory), /PRIVATE_BINDING_REFUSED/);
    fs.chmodSync(bindingFile, 0o600);
    fs.writeFileSync(bindingFile, JSON.stringify({ ...binding, AXIS_PASSWORD: "forged-fixture-field" }));
    assert.throws(() => owner.readBinding(directory), /PRIVATE_BINDING_REFUSED/);
    fs.writeFileSync(bindingFile, JSON.stringify(binding));
    const transport = nodemailer.createTransport({ host: "127.0.0.1", port, secure: false,
      ignoreTLS: true, auth: { user: sender, pass: binding.NODICS_EMPLOYEE_SMTP_PASSWORD } });
    try { await transport.sendMail({ from: sender, to: recipient, subject: "ARTIFICIAL", text: "Fixture only" }); }
    finally { transport.close(); }
    assert.equal(fs.statSync(path.join(directory, "message-1.eml")).mode & 0o777, 0o600);
    fs.writeFileSync(path.join(directory, "unowned-marker"), "preserve", { mode: 0o600 });
    await session.close(); session = undefined;
    assert.deepEqual(fs.readdirSync(directory), ["unowned-marker"]);
    fs.unlinkSync(path.join(directory, "unowned-marker"));
    fs.symlinkSync(__filename, path.join(directory, "binding.json"));
    assert.throws(() => owner.readBinding(directory));
    fs.unlinkSync(path.join(directory, "binding.json"));
  } finally { if (session) await session.close(); fs.rmdirSync(directory); }
});

test("replacement retains the private binding and refuses a changed sender or port", async () => {
  const owner = await import(pathToFileURL(path.join(__dirname, "localSmtpCapture.mjs")));
  const directories = Array.from({ length: 3 }, () => {
    const directory = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "nodics-capture-restore-test-")));
    fs.chmodSync(directory, 0o700); return directory;
  });
  const [first, backup, replacement] = directories;
  const reserved = net.createServer();
  await new Promise(resolve => reserved.listen(0, "127.0.0.1", resolve));
  const port = reserved.address().port;
  await new Promise(resolve => reserved.close(resolve));
  let session;
  try {
    session = await owner.startSession({ directory: first, port, sender, recipients: options.recipients });
    const binding = owner.readBinding(first);
    fs.writeFileSync(path.join(backup, "binding.json"), JSON.stringify(binding), { flag: "wx", mode: 0o600 });
    await session.close(); session = undefined;
    for (const change of [{ port: port === 65535 ? port - 1 : port + 1 }, { sender: "other@isolated-capture.test" }]) {
      await assert.rejects(owner.startSession({ directory: replacement, port, sender,
        recipients: options.recipients, bindingDirectory: backup, ...change }), /RESTORE_SCOPE_REFUSED/);
      assert.deepEqual(fs.readdirSync(replacement), []);
    }
    session = await owner.startSession({ directory: replacement, port, sender,
      recipients: options.recipients, bindingDirectory: backup });
    assert.deepEqual(owner.readBinding(replacement), binding);
    const transport = nodemailer.createTransport({ host: "127.0.0.1", port, secure: false, ignoreTLS: true,
      auth: { user: sender, pass: binding.NODICS_EMPLOYEE_SMTP_PASSWORD } });
    try { await transport.sendMail({ from: sender, to: recipient, subject: "ARTIFICIAL RESTORE", text: "Fixture only" }); }
    finally { transport.close(); }
    assert.equal(session.status().accepted, 1);
    assert.deepEqual(owner.readBinding(backup), binding);
  } finally {
    if (session) await session.close();
    fs.rmSync(path.join(backup, "binding.json"), { force: true });
    for (const directory of directories) fs.rmdirSync(directory);
  }
});
