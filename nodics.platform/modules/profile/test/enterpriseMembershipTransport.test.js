/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics Source-Available Commercial License; see root LICENSE. */
"use strict";
/**
 * @module profile/test/enterpriseMembershipTransport
 * @description Independent fixed route/controller/facade and private-error boundary fixtures; not installed authorization acceptance.
 * @layer test
 * @owner profile
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const routes = require("../src/router/routers").profile.loadDefaults;
const properties = require("../config/properties");
const controller = require("../src/controller/enterprise/defaultEnterpriseManagementController");
const facade = require("../src/facade/enterprise/defaultEnterpriseManagementFacade");
test("committed recovery has a fixed exact DTO and independent default-off qualification", () => {
  const route = routes.reconcileTeamOperation;
  assert.equal(
    properties.enterpriseManagement.teamAdministration
      .operatorRecoveryQualified,
    false,
  );
  assert.equal(route.secured, true);
  assert.deepEqual(route.authTokenTypes, ["access"]);
  assert.equal(route.apiExposure, "profileMembership");
  assert.equal(route.permission, "profile.enterpriseAccess.assign");
  assert.equal(route.operation, "reconcileTeamOperation");
  assert.equal(route.cache.enabled, false);
  const schema = route.requestBody.content["application/json"].schema;
  assert.equal(schema.additionalProperties, false);
  assert.deepEqual(schema.required, [
    "enterpriseCode",
    "teamRevision",
    "operationId",
  ]);
  assert.equal(schema.properties.actor, undefined);
  assert.equal(schema.properties.assignmentCode, undefined);
});
test("membership exposure defaults off and team commands require explicit permission and exact DTOs", () => {
  assert.equal(
    properties.apiExposure.categories.profileMembership.enabled,
    false,
  );
  for (const name of [
    "listOwnMemberships",
    "enterpriseTeamWorkspace",
    "acceptMembership",
    "suspendMembership",
    "revokeMembership",
    "resumeMembership",
    "handoverAdministrator",
  ]) {
    const route = routes[name];
    assert.equal(route.secured, true);
    assert.deepEqual(route.authTokenTypes, ["access"]);
    assert.equal(route.apiExposure, "profileMembership");
    assert.equal(route.controller, "DefaultEnterpriseManagementController");
    assert.equal(route.operation, name);
    assert.equal(route.cache.enabled, false);
    if (name === "enterpriseTeamWorkspace") {
      assert.equal(route.permission, "profile.enterpriseAccess.assign");
    } else if (name !== "listOwnMemberships") {
      const schema = route.requestBody.content["application/json"].schema;
      assert.equal(schema.additionalProperties, false);
      assert.equal(schema.properties.password, undefined);
      assert.equal(schema.properties.tenant, undefined);
      assert.equal(schema.properties.roleCode, undefined);
      assert(schema.required.includes("revision"));
      if (name !== "acceptMembership") {
        assert.equal(route.permission, "profile.enterpriseAccess.assign");
        assert(schema.required.includes("operationId"));
      }
    }
  }
});
test("workspace facade dispatches only to the fixed Profile team owner", async () => {
  const request = { authData: { entCode: "business" } };
  global.SERVICE = {
    DefaultEnterpriseTeamAdministrationService: {
      workspace: async (value) => {
        assert.equal(value, request);
        return { owner: "profile" };
      },
    },
  };
  assert.deepEqual(await facade.membershipAction(request, "TEAM_WORKSPACE"), {
    owner: "profile",
  });
});
test("fixed facade rejects unknown commands without invoking a dynamic service operation", () => {
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code) {
        super(code);
        this.code = code;
      }
    },
  };
  assert.throws(() => facade.membershipAction({}, "UPDATE_PASSWORD"), {
    code: "ERR_PROFILE_MEMBERSHIP_FORBIDDEN",
  });
});
test("controller-owned command ignores spoofed action and redacts storage failures", async () => {
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code) {
        super(code);
        this.code = code;
      }
    },
  };
  let selected;
  global.FACADE = {
    DefaultEnterpriseManagementFacade: {
      membershipAction: async (_request, operation) => {
        selected = operation;
        throw Error("private storage or credential detail");
      },
    },
  };
  await assert.rejects(
    controller.acceptMembership({ body: { operation: "REVOKE" } }),
    { code: "ERR_PROFILE_MEMBERSHIP_STORAGE" },
  );
  assert.equal(selected, "ACCEPT");
});
