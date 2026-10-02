/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module profile/test/canonicalHistoricalIdentityLinkTransport @description Deferred sensitive-route, fixed facade, no-store and private-error transport fixtures; not executed acceptance. @layer test @owner profile */
const test = require("node:test"),
  assert = require("node:assert/strict");
const routes = require("../src/router/routers").profile.canonicalHistoricalLink;
const controller = require("../src/controller/identity/defaultCanonicalHistoricalIdentityLinkController");
const facade = require("../src/facade/identity/defaultCanonicalHistoricalIdentityLinkFacade");
test("all historical-link routes require protected human access and exact non-cached DTOs", () => {
  for (const [name, route] of Object.entries(routes)) {
    assert.deepEqual(route.requestPrivacy, { sensitive: true });
    assert.deepEqual(route.authTokenTypes, ["access"]);
    assert.equal(route.permission, "identity.migration.apply");
    assert.equal(route.method, "POST");
    assert.equal(route.cache.enabled, false);
    assert.equal(route.operation, name);
    assert.equal(
      route.requestBody.content["application/json"].schema.additionalProperties,
      false,
    );
  }
});
test("unprotected private entry cannot reach the facade or expose submitted proofs", async (t) => {
  const previous = {
    CLASSES: global.CLASSES,
    SERVICE: global.SERVICE,
    FACADE: global.FACADE,
  };
  t.after(() => Object.assign(global, previous));
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code) {
        super(code);
        this.code = code;
      }
    },
  };
  global.SERVICE = {
    DefaultLoggerService: {
      assertSensitiveRequest: () => {
        throw new Error("private raw body");
      },
    },
  };
  global.FACADE = {
    DefaultCanonicalHistoricalIdentityLinkFacade: {
      invoke: () => assert.fail("unprotected request reached facade"),
    },
  };
  const headers = {},
    request = {
      httpRequest: { body: { canonicalPassword: "proof" } },
      httpResponse: { setHeader: (k, v) => (headers[k] = v) },
    };
  await assert.rejects(controller.prepare(request), {
    message: "ERR_PROFILE_MEMBERSHIP_UNAVAILABLE",
  });
  assert.equal(headers["Cache-Control"], "no-store");
});
test("fixed facade operations do not accept arbitrary client method names", async (t) => {
  const previous = { CLASSES: global.CLASSES, SERVICE: global.SERVICE };
  t.after(() => Object.assign(global, previous));
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code) {
        super(code);
        this.code = code;
      }
    },
  };
  global.SERVICE = {
    DefaultCanonicalHistoricalIdentityLinkService: {
      prepare: async () => ({ phase: "PREPARED" }),
      commit: async () => ({ phase: "COMPLETE" }),
      inspect: async () => ({ phase: "PREPARED" }),
    },
  };
  assert.deepEqual(await facade.invoke({}, "PREPARE"), { phase: "PREPARED" });
  assert.throws(() => facade.invoke({}, "delete"), {
    code: "ERR_PROFILE_MEMBERSHIP_UNAVAILABLE",
  });
});
