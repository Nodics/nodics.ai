/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/**
 * @module profile/test/enterpriseAdministrationTransport
 * @description Deferred fixed transport, target mapping and redacted error fixtures for the qualified administration workspace.
 * @layer test
 * @owner profile
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const routes = require("../src/router/routers").profile.loadDefaults;
const properties = require("../config/properties");
const controller = require("../src/controller/enterprise/defaultEnterpriseManagementController");
const facade = require("../src/facade/enterprise/defaultEnterpriseManagementFacade");
const management = require("../src/service/enterprise/defaultEnterpriseManagementService");

test("later-layer projections cannot select private Team, consent or assignment proof", () => {
  const item = {
    code: "child",
    name: "Public Name",
    teamOperation: { hash: "private" },
    administrationConsent: { identity: "private" },
    invitationAuthority: { identity: "private" },
    defaultAdminAssignmentCode: "private",
    authenticationIdentity: { recordId: "private" },
  };
  const fields = Object.keys(item);
  assert.deepEqual(management.project(item, fields), {
    code: "child",
    name: "Public Name",
  });
  assert.deepEqual(management.projectAssignment(item, fields), {
    code: "child",
    name: "Public Name",
  });
  assert.equal(
    management.publicProjectionField("administrationConsent.identity"),
    false,
  );
  assert.equal(management.publicProjectionField("__proto__"), false);
});

test("public management never inherits internal bootstrap principal authority", () => {
  const owner = { ...management, error: (message) => new Error(message) };
  for (const authData of [
    { tokenType: "access", loginId: "service", principalType: "service" },
    {
      tokenType: "access",
      loginId: "admin",
      principalType: "human",
      isSystem: true,
    },
    {
      tokenType: "access",
      loginId: "admin",
      principalType: "human",
      userGroups: ["serviceAccountUserGroup"],
    },
  ])
    assert.throws(() => owner.authorize({ authData }), /human employee/);
  assert.doesNotThrow(() =>
    owner.authorize({
      authData: {
        tokenType: "access",
        principalType: "human",
        loginId: "admin",
      },
    }),
  );
});

test("administration transport retains independent default-off authority and explicit human permission", () => {
  const policy = properties.enterpriseManagement.administrationConsent;
  assert.equal(policy.enabled, false);
  assert.equal(policy.enforcementQualified, false);
  assert.equal(policy.creationDefault, false);
  for (const name of [
    "administrationConsentWorkspace",
    "inspectTargetAdministrationConsent",
    "changeTargetAdministrationConsent",
  ]) {
    const route = routes[name];
    assert.equal(route.secured, true);
    assert.deepEqual(route.authTokenTypes, ["access"]);
    assert.equal(
      route.permissionConfig,
      "enterpriseManagement.administrationConsent.permission",
    );
    assert.equal(route.apiExposure, "profileManagement");
    assert.equal(route.cache.enabled, false);
    assert.ok(route.key.includes(":enterpriseCode"));
    if (route.method === "POST") {
      const schema = route.requestBody.content["application/json"].schema;
      assert.equal(schema.additionalProperties, false);
      assert.equal(schema.properties.identity, undefined);
      assert.equal(schema.properties.tenant, undefined);
      assert.equal(schema.properties.authData, undefined);
      assert.equal(schema.properties.recipientAssignmentCode.maxLength, 128);
    }
  }
});

test("workspace facade cannot dispatch caller-selected methods", async () => {
  const request = { params: { enterpriseCode: "child" } };
  global.SERVICE = {
    DefaultEnterpriseAdministrationConsentService: {
      workspace: async (observed) => {
        assert.equal(observed, request);
        return { contractVersion: 1 };
      },
    },
  };
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code) {
        super(code);
        this.code = code;
      }
    },
  };
  assert.deepEqual(
    await facade.administrationConsentAction(request, "WORKSPACE"),
    { contractVersion: 1 },
  );
  assert.throws(
    () => facade.administrationConsentAction(request, "constructor"),
    { code: "ERR_PROFILE_CONSENT_FORBIDDEN" },
  );
});

test("controller retains the route target, no-store policy and redacted uncertain outcome", async () => {
  let observed;
  const headers = {};
  global.FACADE = {
    DefaultEnterpriseManagementFacade: {
      administrationConsentAction: async (request, operation) => {
        observed = { params: request.params, operation };
        throw new Error("private owner record and proof");
      },
    },
  };
  const request = {
    params: { enterpriseCode: "untrusted-shadow" },
    httpRequest: { params: { enterpriseCode: "child" }, body: {}, query: {} },
    httpResponse: {
      setHeader: (key, value) => {
        headers[key] = value;
      },
    },
  };
  await assert.rejects(controller.administrationConsentWorkspace(request), {
    code: "ERR_PROFILE_CONSENT_CONFLICT",
    message: "ERR_PROFILE_CONSENT_CONFLICT",
  });
  assert.deepEqual(observed, {
    params: { enterpriseCode: "child" },
    operation: "WORKSPACE",
  });
  assert.equal(headers["Cache-Control"], "no-store");
});
