/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { EventEmitter } from "node:events";
import {
  parseAcceptanceResponse, authenticateAcceptanceEmployee,
  waitForAcceptanceReady, stopAcceptanceChildren, probeAcceptancePort,
} from "../src/service/project/defaultProjectAcceptanceService.mjs";
import {
  acceptanceMediaMimeType, uploadAcceptanceMedia,
} from "../src/service/project/defaultProjectAcceptanceMediaService.mjs";

test("maintenance port probes reject timeout and indeterminate errors", async () => {
  const probe = (event, code, strict = true) => probeAcceptancePort(12345, {
    strict,
    createConnection: () => {
      const socket = new EventEmitter();
      socket.setTimeout = () => {};
      socket.destroy = () => {};
      queueMicrotask(() => socket.emit(event, Object.assign(new Error(code || event), { code })));
      return socket;
    },
  });
  assert.equal(await probe("connect"), true);
  assert.equal(await probe("error", "ECONNREFUSED"), false);
  await assert.rejects(probe("timeout"), /timed out/);
  for (const code of ["EACCES", "EMFILE", "ENETUNREACH", "ETIMEDOUT"]) {
    await assert.rejects(probe("error", code), { code });
  }
  assert.equal(await probe("timeout", undefined, false), false);
});

test("response parsing retains empty, falsey, envelope and error policies", async () => {
  const parse = (text, policy = {}, status = 200) =>
    parseAcceptanceResponse(new Response(text, { status }), { route: "/probe", ...policy });
  assert.equal(await parse(""), undefined);
  assert.equal(await parse("false"), false);
  assert.equal(await parse('{"data":false,"result":7}', {
    unwrap: body => body?.data ?? body?.result ?? body,
  }), false);
  assert.equal(await parse('{"data":false,"result":7}', {
    unwrap: body => body?.result || body?.data || body,
  }), 7);
  await assert.rejects(parse("bad"), SyntaxError);
  await assert.rejects(parse("bad", {
    malformed: (response, text) => `invalid ${response.status}: ${text}`,
  }, 503), { message: "invalid 503: bad" });
  await assert.rejects(parse('{"error":"denied"}', { errorLimit: 5 }, 403),
    { message: '/probe returned HTTP 403: {"err' });
  await assert.rejects(parse("false", {}, 403), { message: "/probe returned HTTP 403: false" });
});

test("employee auth preserves supplied-token bypass, route order and request context", async () => {
  const calls = [];
  const options = {
    baseUrl: "https://example.invalid",
    routes: ["/browser", "/employee"],
    credentials: { loginId: "fixture", password: "fixture-only" },
    headers: { Origin: "https://ui.invalid", "x-enterprise-code": "fixture" },
    missingToken: route => `${route} missing token`,
    failureMessage: "no route",
    request: async (...args) => {
      calls.push(args);
      if (calls.length === 1) throw new Error("browser unavailable");
      return { data: { authToken: "fixture-token" } };
    },
  };
  assert.deepEqual(await authenticateAcceptanceEmployee({ ...options, suppliedToken: "external" }),
    { Authorization: "Bearer external" });
  assert.equal(calls.length, 0);
  assert.deepEqual(await authenticateAcceptanceEmployee(options), { Authorization: "Bearer fixture-token" });
  assert.deepEqual(calls.map(call => call[1]), options.routes);
  assert.deepEqual(calls[1][2], {
    method: "POST", headers: options.headers, body: JSON.stringify(options.credentials),
  });
  await assert.rejects(authenticateAcceptanceEmployee({ ...options, request: async () => ({}) }),
    { message: "/employee missing token" });
  const failure = new Error("last transport error");
  await assert.rejects(authenticateAcceptanceEmployee({ ...options, request: async () => { throw failure; } }),
    error => error === failure);
  await assert.rejects(authenticateAcceptanceEmployee({ ...options, routes: [] }), { message: "no route" });
});

test("readiness retries failures and respects the caller's predicate and deadline", async () => {
  let time = 0, probes = 0, ready = 0;
  const options = {
    now: () => time, sleep: async ms => { time += ms; },
    timeoutMs: 30, intervalMs: 10,
    probe: async () => {
      probes += 1;
      if (probes === 1) throw new Error("offline");
      return { status: probes === 3 ? "UP" : "DOWN", ready: true };
    },
    isReady: health => health.status === "UP",
    onReady: () => { ready += 1; },
    failureMessage: error => error?.message || "timeout",
  };
  await waitForAcceptanceReady(options);
  assert.equal(probes, 3);
  assert.equal(ready, 1);
  assert.equal(time, 20);
  await assert.rejects(waitForAcceptanceReady({
    ...options, probe: async () => { throw new Error("still offline"); },
  }), { message: "still offline" });
  await assert.rejects(waitForAcceptanceReady({ ...options, timeoutMs: 0 }), { message: "timeout" });
});

test("cleanup signals only owned live handles in reverse order and cancels timers", async () => {
  const signals = [], timers = [], cancelled = [];
  const children = [
    { pid: 101, exitCode: null, exitPromise: Promise.resolve() },
    { pid: 102, exitCode: null, signalCode: "SIGTERM" },
    { pid: 103, exitCode: 0 },
    { pid: undefined, exitCode: null },
    { pid: 104, exitCode: null, exitPromise: Promise.resolve() },
  ];
  await stopAcceptanceChildren(children, {
    timeoutMs: 50, kill: (...args) => signals.push(args),
    schedule: callback => { timers.push(callback); return timers.length; },
    cancel: id => cancelled.push(id),
  });
  assert.deepEqual(signals, [[-104, "SIGTERM"], [-101, "SIGTERM"]]);
  assert.deepEqual(cancelled, [1, 2]);
  assert.equal(children[0].pid, 101);
});

test("cleanup escalates a stalled child and falls back to the child handle", async () => {
  const signals = [];
  await stopAcceptanceChildren([{
    pid: 105, exitCode: null, exitPromise: new Promise(() => {}),
    kill: signal => signals.push(signal),
  }], {
    timeoutMs: 0, kill: () => { throw new Error("group unavailable"); },
  });
  assert.deepEqual(signals, ["SIGTERM", "SIGKILL"]);
  await assert.rejects(stopAcceptanceChildren([{
    pid: 106, exitCode: null, kill: () => { throw new Error("cannot signal"); },
  }], { timeoutMs: 0, kill: () => { throw new Error("missing group"); } }),
  { message: "cannot signal" });
});

test("media upload retains bytes, multipart fields, caller context and raw response", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "acceptance-media-"));
  try {
    await fs.writeFile(path.join(root, "asset.PNG"), Buffer.from([0, 1, 255]));
    const asset = { fileName: "asset.PNG", mediaCode: "fixture", ownerCode: "owner" };
    const response = new Response("duplicate", { status: 409 });
    let called = 0;
    const result = await uploadAcceptanceMedia({
      url: "https://media.invalid/upload", assetFilesRoot: root, asset,
      headers: { Authorization: "Bearer fixture", Origin: "https://ui.invalid" },
      businessPurpose: "CALLER_PURPOSE",
      fetchImpl: async (url, options) => {
        called += 1;
        assert.equal(url, "https://media.invalid/upload");
        assert.equal(options.method, "POST");
        assert.equal(options.headers["Content-Type"], undefined);
        assert.equal(options.headers.Authorization, "Bearer fixture");
        const file = options.body.get("file");
        assert.equal(file.name, "asset.PNG");
        assert.equal(file.type, "image/png");
        assert.deepEqual(Buffer.from(await file.arrayBuffer()), Buffer.from([0, 1, 255]));
        assert.deepEqual(Object.fromEntries([...options.body].filter(([key]) => key !== "file")), {
          folderCode: "cmsAssets", formatCode: "original", mediaCode: "fixture",
          name: "fixture", description: "fixture", moduleName: "media", schemaName: "media",
          businessPurpose: "CALLER_PURPOSE", ownerType: "CMS_COMPONENT", ownerReference: "owner",
        });
        return response;
      },
    });
    assert.equal(result, response);
    assert.equal(await result.text(), "duplicate");
    assert.equal(called, 1);
    await assert.rejects(uploadAcceptanceMedia({
      assetFilesRoot: root, asset: { fileName: "missing" },
      fetchImpl: () => assert.fail("missing asset must not upload"),
    }), /Asset file is missing:/);
    assert.equal(acceptanceMediaMimeType("a.JPEG"), "image/jpeg");
    assert.equal(acceptanceMediaMimeType("a.webp"), "image/webp");
    assert.equal(acceptanceMediaMimeType("a.svg"), "image/svg+xml");
    assert.equal(acceptanceMediaMimeType("a.bin"), "application/octet-stream");
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});
