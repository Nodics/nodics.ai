/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module profile/test/profileVerifiedContactTransport @description Deferred private self-route and withheld-secret transport fixtures; behavioral execution NOT RUN. @layer test @owner profile */
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const controller = require("../src/controller/customer/defaultProfileVerifiedContactController");
const facade = require("../src/facade/customer/defaultProfileVerifiedContactFacade");

function fixture() {
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code) {
        super(code);
        this.code = code;
      }
    },
  };
  global.SERVICE = {
    DefaultLoggerService: { assertSensitiveRequest: () => {} },
    DefaultProfileVerifiedContactService: {
      verifyAndConfirm: async () => ({
        revision: 2,
        status: "VERIFIED",
        verified: true,
      }),
    },
  };
  global.FACADE = { DefaultProfileVerifiedContactFacade: facade };
  const headers = {};
  const request = {
    body: { secret: "abcdefabcdef" },
    httpResponse: {
      setHeader: (key, value) => {
        headers[key] = value;
      },
    },
  };
  return { request, headers };
}

test("fixed verification returns no proof/secret and scrubs the transient submitted code", async () => {
  const { request, headers } = fixture();
  const result = await controller.verify(request);
  assert.deepEqual(result.data, {
    revision: 2,
    status: "VERIFIED",
    verified: true,
  });
  assert.deepEqual(request.body, {});
  assert.equal(headers["Cache-Control"], "no-store");
});

test("raw private fields and structured results reject rather than leaking", async () => {
  for (const extra of [
    { proof: "private" },
    { status: { password: "private" } },
    { commandId: "address@example.invalid" },
  ]) {
    const { request } = fixture();
    SERVICE.DefaultProfileVerifiedContactService.verifyAndConfirm =
      async () => ({ revision: 2, status: "VERIFIED", ...extra });
    await assert.rejects(controller.verify(request), {
      code: "ERR_AUTH_00003",
    });
    assert.deepEqual(request.body, {});
  }
});

test("private admission precedes mapping and dispatch", async () => {
  const { request } = fixture();
  let calls = 0;
  SERVICE.DefaultLoggerService.assertSensitiveRequest = () => {
    throw new Error("capture unqualified");
  };
  SERVICE.DefaultProfileVerifiedContactService.verifyAndConfirm = async () => {
    calls++;
  };
  await assert.rejects(controller.verify(request), { code: "ERR_AUTH_00003" });
  assert.equal(calls, 0);
});

test("consent transport requires reviewed purposeVersion and returns only the matching version", async () => {
  const { request } = fixture();
  request.body = {
    ownerId: "customer1",
    channel: "EMAIL",
    expectedRevision: 1,
    purpose: "RECEIPT",
    purposeVersion: 2,
    granted: true,
    operationReference: "choice1",
  };
  let calls = 0;
  SERVICE.DefaultProfileVerifiedContactService.setNotificationConsent = async (
    _,
    body,
  ) => {
    calls++;
    return {
      revision: 2,
      purpose: body.purpose,
      purposeVersion: body.purposeVersion,
      granted: body.granted,
    };
  };
  const valid = await controller.consent(request);
  assert.equal(valid.data.purposeVersion, 2);
  delete request.body.purposeVersion;
  await assert.rejects(controller.consent(request), { code: "ERR_AUTH_00003" });
  assert.equal(calls, 1);
  request.body.purposeVersion = 2;
  SERVICE.DefaultProfileVerifiedContactService.setNotificationConsent =
    async () => ({
      revision: 2,
      purpose: "RECEIPT",
      purposeVersion: 3,
      granted: true,
    });
  await assert.rejects(controller.consent(request), { code: "ERR_AUTH_00003" });
});

test("facade rejects arbitrary method selection and routes retain exact private customer admission", () => {
  const { request } = fixture();
  assert.throws(() => facade.execute("resolveCanonicalContact", request), {
    code: "ERR_AUTH_00003",
  });
  const routes = require("../src/router/routers").profile.verifiedContacts;
  const consentSchema =
    routes.consent.requestBody.content["application/json"].schema;
  assert.equal(consentSchema.additionalProperties, false);
  assert.deepEqual(consentSchema.required, [
    "ownerId",
    "channel",
    "expectedRevision",
    "purpose",
    "purposeVersion",
    "granted",
    "operationReference",
  ]);
  assert.deepEqual(consentSchema.properties.purposeVersion, {
    type: "integer",
    minimum: 1,
    maximum: 2147483647,
  });
  assert.deepEqual(Object.keys(routes).sort(), [
    "begin",
    "consent",
    "inspect",
    "suppression",
    "verify",
  ]);
  for (const route of Object.values(routes)) {
    assert.deepEqual(route.requestPrivacy, { sensitive: true });
    assert.deepEqual(route.accessGroups, ["customerUserGroup"]);
    assert.deepEqual(route.authTokenTypes, ["access"]);
    assert.equal(route.apiExposure, "profileVerifiedContacts");
  }
});
