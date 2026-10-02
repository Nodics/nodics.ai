/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module nService/test/sensitiveModuleTransportContract @description Deferred credential transport policy fixtures; no network, behavioral or TLS acceptance execution. @layer test @owner nService */
const test = require("node:test"),
  assert = require("node:assert/strict");
const owner = require("../src/service/module/defaultModuleService");
test("sensitive transport requires HTTPS and rejects redirects, URL credentials and untrusted HTTP", (t) => {
  const previous = global.CLASSES;
  t.after(() => {
    global.CLASSES = previous;
  });
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code) {
        super(code);
        this.code = code;
      }
    },
  };
  const request = {
    uri: "https://authority.invalid/nodics/profile/v0/internal/session-context/validate",
    followRedirects: false,
    secureTransport: { required: true, allowInsecureLoopback: false },
  };
  const previousTls = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
  delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
  t.after(() => {
    if (previousTls === undefined)
      delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    else process.env.NODE_TLS_REJECT_UNAUTHORIZED = previousTls;
  });
  assert.doesNotThrow(() => owner.assertSecureTransport(request));
  for (const uri of [
    "http://authority.invalid/path",
    "https://user:password@authority.invalid/path",
    "https://authority.invalid/path?credential=secret",
    "https://authority.invalid/path#secret",
  ])
    assert.throws(() => owner.assertSecureTransport({ ...request, uri }), {
      code: "ERR_AUTH_00001",
    });
  assert.throws(
    () => owner.assertSecureTransport({ ...request, followRedirects: true }),
    { code: "ERR_AUTH_00001" },
  );
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  assert.throws(() => owner.assertSecureTransport(request), {
    code: "ERR_AUTH_00001",
  });
});
test("explicit loopback customization is exact and never allows near-match hosts", (t) => {
  const previous = global.CLASSES;
  t.after(() => {
    global.CLASSES = previous;
  });
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code) {
        super(code);
        this.code = code;
      }
    },
  };
  const request = {
    followRedirects: false,
    secureTransport: { required: true, allowInsecureLoopback: true },
  };
  for (const host of ["localhost", "127.0.0.1", "[::1]"])
    assert.doesNotThrow(() =>
      owner.assertSecureTransport({
        ...request,
        uri: "http://" + host + ":3000/path",
      }),
    );
  for (const host of [
    "localhost.example.invalid",
    "127.0.0.2",
    "0.0.0.0",
    "example.invalid",
  ])
    assert.throws(
      () =>
        owner.assertSecureTransport({
          ...request,
          uri: "http://" + host + "/path",
        }),
      { code: "ERR_AUTH_00001" },
    );
  assert.doesNotThrow(() =>
    owner.assertSecureTransport({ uri: "http://example.invalid" }),
  );
});
