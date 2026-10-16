/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module nRouter/test/platformAdministratorAccess
 * @description Tests the real Rules route and independent group/token boundaries for explicit human Platform full access.
 * @owner nRouter @layer test
 */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const router = require("../src/service/request/defaultSecuredRequestPipelineService");
const rules = require("../../../../nodics.rulesEngine/modules/rulesApi/src/router/routers");
const auth = {
  tenant: "authority",
  entCode: "PLATFORM",
  tokenType: "access",
  principalType: "human",
  authenticationMethod: "PASSWORD",
  userGroups: ["platformAdministratorUserGroup"],
  permissions: ["*"],
};
global.CONFIG = {
  get: (key) =>
    ({
      defaultTenant: "authority",
      defaultEnterprise: "PLATFORM",
      identityGovernance: {
        principalPolicy: { serviceGroup: "serviceAccountUserGroup" },
      },
      routeActionAuthorization: { enabled: true, strict: true },
    })[key],
};
global.CLASSES = {
  NodicsError: class extends Error {
    constructor(code, message) {
      super(message || code);
      this.code = code;
    }
  },
};
function check(definition, claims = auth) {
  let allowed = false;
  router.checkAccess(
    { authData: claims, router: definition, moduleName: "rulesApi" },
    {},
    {
      nextSuccess: () => {
        allowed = true;
      },
      error: () => {},
    },
  );
  return allowed;
}
function routes(object) {
  return Object.values(object).flatMap((value) =>
    value && typeof value === "object"
      ? value.key
        ? [value]
        : routes(value)
      : [],
  );
}
test("actual Rules definitions route admits Platform admin but rejects enterprise admin and service wildcard", () => {
  const definition = routes(rules).find(
    (route) =>
      route.key === "/definitions" &&
      route.permission === "rules.definition.read",
  );
  assert.ok(definition);
  assert.equal(check(definition), true);
  for (const override of [
    { userGroups: ["adminGroup", "userGroup"], permissions: [] },
    { userGroups: ["adminGroup", "userGroup"], permissions: ["*"] },
    { entCode: "BUSINESS", userGroups: ["adminGroup", "userGroup"] },
    { tenant: "business" },
    {
      principalType: "service",
      userGroups: ["serviceAccountUserGroup", "userGroup"],
    },
    { tokenType: "service" },
    { authenticationMethod: "API_KEY" },
    { isSystem: true },
    { sessionContext: {} },
    { permissions: [] },
    { userGroups: ["userGroup"], platformAdministrator: true },
  ])
    assert.equal(
      check(definition, { ...auth, ...override }),
      false,
      JSON.stringify(override),
    );
});
test("full access satisfies domain operating groups but never service-only token or runtime module constraints", () => {
  const definition = {
    accessGroups: ["unrelatedDomainOperator"],
    authTokenTypes: ["access"],
    permission: "new.domain.action",
  };
  assert.equal(check(definition), true);
  assert.equal(check({ ...definition, authTokenTypes: ["service"] }), false);
  assert.equal(
    check(definition, {
      ...auth,
      runtimeScope: {},
      tokenType: "service",
      modules: ["other"],
    }),
    false,
  );
  assert.equal(
    router.hasPlatformFullAccess({
      authData: { ...auth, principalType: "service" },
    }),
    false,
  );
  assert.equal(
    router.hasPlatformFullAccess({ authData: { ...auth, userGroups: [] } }),
    false,
  );
});
test("full access rejects configured service-group membership and missing principal policy", () => {
  const previous = global.CONFIG;
  try {
    for (const serviceGroup of ["customServiceGroup", null, ""]) {
      global.CONFIG = {
        get: (key) =>
          key === "identityGovernance"
            ? { principalPolicy: { serviceGroup } }
            : previous.get(key),
      };
      assert.equal(
        router.hasPlatformFullAccessContext({
          ...auth,
          userGroups: [...auth.userGroups, "customServiceGroup"],
        }),
        false,
      );
      assert.equal(
        router.hasPlatformFullAccessContext(auth),
        serviceGroup === "customServiceGroup",
      );
    }
  } finally {
    global.CONFIG = previous;
  }
});
