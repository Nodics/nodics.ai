/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/**
 * @module profile/test/enterpriseRegistrationSessionGate
 * @description Executes the actual Profile session issuer and refresh methods
 * with injected token, audit and storage owners. Proves the new registration
 * gate wiring, not real JWT/cache/runtime acceptance.
 * @layer test @owner profile
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const implementation = require("../src/service/authentication/defaultAuthenticationProviderService");
function setup() {
  const calls = [];
  const person = {
    _id: "person-1",
    code: "alex@example.test",
    loginId: "alex@example.test",
    principalType: "human",
    active: true,
    authVersion: 1,
    registrationAssignmentCode: "assignment-1",
    password: { _id: "credential-1", active: true },
  };
  const enterprise = {
    code: "partner",
    active: true,
    tenant: { code: "partnerTenant", active: true },
  };
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code, message) {
        super(message || code);
        this.code = code;
      }
    },
  };
  global.CONFIG = { get: () => undefined };
  global.UTILS = { getUserGroupPermissions: () => [] };
  global.SERVICE = {
    DefaultAuthSecurityService: {
      ...require("../../../../nodics.foundation/modules/nAuth/src/service/security/defaultAuthSecurityService"),
    },
    DefaultEnterpriseRegistrationService: {
      assertSessionEligible: async () => {
        calls.push("gate");
      },
    },
    DefaultPrincipalSecurityStampService: {
      register: async () => {
        calls.push("stamp");
      },
    },
    DefaultEnterpriseService: {
      retrieveEnterprise: async () => enterprise,
    },
    DefaultEmployeeService: { findByLoginId: async () => person },
    DefaultIdentityGovernanceService: {
      getSystemAuthData: () => ({ isSystem: true }),
    },
    DefaultPasswordSaveInterceptorService: require("../src/service/interceptors/defaultPasswordSaveInterceptorService"),
    DefaultPrincipalSecurityStampGovernanceService: require("../src/service/identity/defaultPrincipalSecurityStampGovernanceService"),
    DefaultPasswordService: {
      get: async () => ({
        code: "SUC_GET",
        count: 1,
        result: [
          {
            _id: "credential-1",
            loginId: person.loginId,
            active: true,
            password: "fixture-hash",
          },
        ],
      }),
    },
    DefaultCustomerService: {
      get: async () => ({ code: "SUC_GET", count: 0, result: [] }),
    },
    DefaultUserStateService: {
      findUserState: async () => ({ locked: false }),
    },
  };
  SERVICE.DefaultEmployeeService.get = async () => ({
    code: "SUC_GET",
    count: 1,
    result: [person],
  });
  const service = Object.assign({}, implementation, {
    resolveSessionUserGroups: () => [],
    updateAuthData: async () => {},
    createRefreshToken: async () => {
      calls.push("refresh");
      return "fixture-refresh";
    },
    generateAuthToken: () => {
      calls.push("access");
      return "fixture-access";
    },
    recordAuthEvent: async () => {
      calls.push("audit");
    },
    removeToken: async () => {
      calls.push("remove");
    },
    consumeToken: async () => ({
      type: "Employee",
      tenant: "partnerTenant",
      entCode: "partner",
      loginId: person.loginId,
      authVersion: 1,
    }),
  });
  return {
    service,
    calls,
    person,
    enterprise,
    options: { person, enterprise, type: "Employee" },
  };
}
test("new employee must pass the registration gate before any session is issued", async () => {
  const f = setup();
  SERVICE.DefaultEnterpriseRegistrationService.assertSessionEligible =
    async () => {
      throw new Error("pending");
    };
  await assert.rejects(
    f.service.issueSession(
      f.options,
      { locked: false },
      "password.authentication",
    ),
    /pending/,
  );
  assert.deepEqual(f.calls, []);
});
test("session issuer rechecks readiness after its asynchronous stamp and audit writes", async () => {
  const f = setup();
  const result = await f.service.issueSession(
    f.options,
    { locked: false },
    "password.authentication",
  );
  assert.equal(result.authToken, "fixture-access");
  assert.deepEqual(f.calls, [
    "gate",
    "refresh",
    "access",
    "stamp",
    "audit",
    "gate",
  ]);
});
test("revocation during issuance prevents the response and removes the prepared refresh token", async () => {
  const f = setup();
  let checks = 0;
  SERVICE.DefaultEnterpriseRegistrationService.assertSessionEligible =
    async () => {
      f.calls.push("gate");
      if (++checks === 2) throw new Error("revoked");
    };
  await assert.rejects(
    f.service.issueSession(
      f.options,
      { locked: false },
      "password.authentication",
    ),
    /revoked/,
  );
  assert.equal(f.calls.at(-1), "remove");
});
test("marked identity fails closed when the registration owner is unavailable", async () => {
  const f = setup();
  delete SERVICE.DefaultEnterpriseRegistrationService;
  await assert.rejects(
    f.service.issueSession(
      f.options,
      { locked: false },
      "password.authentication",
    ),
    { code: "ERR_AUTH_00001" },
  );
  assert.deepEqual(f.calls, []);
});
test("legacy identity retains its existing session path without a new registration association", async () => {
  const f = setup();
  delete f.person.registrationAssignmentCode;
  delete SERVICE.DefaultEnterpriseRegistrationService;
  await f.service.issueSession(
    f.options,
    { locked: false },
    "password.authentication",
  );
  assert.equal(f.calls.includes("gate"), false);
  assert.equal(f.calls.includes("access"), true);
});
test("actual refresh path checks registration eligibility before minting replacement credentials", async () => {
  const f = setup();
  SERVICE.DefaultEnterpriseRegistrationService.assertSessionEligible =
    async () => {
      throw new Error("suspended");
    };
  await assert.rejects(
    f.service.rotateRefreshToken({
      refreshToken: "fixture-refresh",
      entCode: "partner",
      type: "Employee",
    }),
    /suspended/,
  );
  assert.equal(f.calls.includes("refresh"), false);
  assert.equal(f.calls.includes("access"), false);
});
