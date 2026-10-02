/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";

/**
 * @module commsApi/test/communicationVerificationCustomization
 * @description Proves later projection overrides preserve authorization and single dispatch.
 * @owner commsApi
 * @layer test
 */
const { test, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const api = require("../src/service/defaultCommunicationVerificationApiService");
const saved = { SERVICE: global.SERVICE, CLASSES: global.CLASSES };
afterEach(() => {
  for (const [key, value] of Object.entries(saved)) {
    if (value === undefined) delete global[key];
    else global[key] = value;
  }
});

test("effective projection override participates after real command and service authorization", async () => {
  const calls = [];
  let storageProjections = 0;
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code) {
        super(code);
        this.code = code;
      }
    },
  };
  const result = {
    challengeCode: "CV_" + "a".repeat(64),
    status: "PENDING",
    revision: 1,
    generation: 1,
    expiresAt: "2026-09-30T12:05:00.000Z",
    nextIssueAt: "2026-09-30T12:01:00.000Z",
    secret: "b".repeat(12),
    replayed: false,
  };
  global.SERVICE = {
    DefaultCommunicationRuntimeService: {
      ...require("../../commsCore/src/service/defaultCommunicationRuntimeService"),
      context: function (request) {
        storageProjections++;
        return require("../../commsCore/src/service/defaultCommunicationRuntimeService").context.call(this, request);
      },
    },
    DefaultLoggerService: {
      hasPrivateCaptureProtection: () => true,
      inheritRequestPrivacy: () => {},
    },
    DefaultCommunicationVerificationService: {
      issueStored: async (context, command) => {
        calls.push({ context, command });
        return result;
      },
    },
  };
  let projections = 0;
  const owner = {
    ...api,
    project: function (name, value, command) {
      projections++;
      return Object.freeze(api.project.call(this, name, value, command));
    },
  };
  const request = {
    tenant: "tenant-a",
    authData: {
      tokenType: "service",
      principalType: "service",
      serviceId: "profile-runtime",
      tenant: "tenant-a",
      permissions: ["communication.verification.execute"],
      modules: ["profile", "commsApi"],
    },
    payload: {
      operation: "ISSUE",
      sourceModule: "profile",
      purpose: "EMPLOYEE_EMAIL_VERIFICATION",
      subjectReference: "employee-email:fixture",
      channel: "EMAIL",
      destination: "person@example.test",
      bindingReference: "c".repeat(64),
    },
  };
  const projected = await owner.execute(request);
  assert.equal(Object.isFrozen(projected), true);
  assert.equal(projected.nextIssueAt, result.nextIssueAt);
  assert.equal(projected.secret, result.secret);
  assert.equal(result.nextIssueAt, "2026-09-30T12:01:00.000Z");
  assert.equal(calls.length, 1);
  assert.equal(calls[0].context.authData.principalId, "communicationRuntime");
  assert.deepEqual(calls[0].context.authData.userGroups, ["serviceAccountUserGroup"]);
  assert.equal(request.authData.serviceId, "profile-runtime");
  assert.equal(request.authData.userGroups, undefined);
  request.authData.modules = ["commsApi"];
  await assert.rejects(owner.execute(request), {
    code: "ERR_COMMS_VERIFY_CONTEXT",
  });
  assert.equal(calls.length, 1);
  assert.equal(projections, 1);
  assert.equal(storageProjections, 1, "Denied callers cannot project storage privileges");
  request.authData.modules = ["commsApi", "profile"];
  SERVICE.DefaultCommunicationRuntimeService.context = () => ({
    tenant: "another-tenant", authData: { tenant: "another-tenant" },
  });
  await assert.rejects(owner.execute(request), { code: "ERR_COMMS_VERIFY_CONTEXT" });
  assert.equal(calls.length, 1, "A later-layer context cannot change the authenticated tenant");
});
