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
    enterpriseCode: "partner",
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
    DefaultIdentityCatalogueService: require("./helpers/identityCatalogueFixture").catalogue(() => CONFIG.get("enterpriseManagement")?.accessAssignments?.roles),
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
test("bound native identity retains its session path without a registration association", async () => {
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
test("native issuance rejects a foreign Enterprise before issuing either token", async () => {
  const f = setup();
  delete f.person.registrationAssignmentCode;
  f.enterprise.code = "foreign";
  await assert.rejects(
    f.service.issueSession(f.options, { locked: false }, "password.authentication"),
    { code: "ERR_AUTH_00001" },
  );
  assert.deepEqual(f.calls, []);
});
test("native metadata binding is enforced and contradictory bindings fail closed", async () => {
  const f = setup();
  delete f.person.registrationAssignmentCode;
  delete f.person.enterpriseCode;
  f.person.metadata = { enterpriseCode: "partner" };
  await f.service.assertEmployeeRegistrationSession(f.person, f.enterprise);
  f.person.enterpriseCode = "foreign";
  await assert.rejects(
    f.service.assertEmployeeRegistrationSession(f.person, f.enterprise),
    { code: "ERR_AUTH_00001" },
  );
});
test("unbound native principal is restricted to the configured default Enterprise", async () => {
  const f = setup();
  delete f.person.registrationAssignmentCode;
  delete f.person.enterpriseCode;
  global.CONFIG = {
    get: (key) => key === "defaultEnterprise" ? "authority" : undefined,
  };
  await assert.rejects(
    f.service.assertEmployeeRegistrationSession(f.person, f.enterprise),
    { code: "ERR_AUTH_00001" },
  );
  await f.service.assertEmployeeRegistrationSession(f.person, { code: "authority" });
});
test("native refresh rejects a changed Enterprise binding without replacement tokens", async () => {
  const f = setup();
  delete f.person.registrationAssignmentCode;
  f.person.enterpriseCode = "foreign";
  await assert.rejects(
    f.service.rotateRefreshToken({
      refreshToken: "fixture-refresh",
      entCode: "partner",
      type: "Employee",
    }),
    { code: "ERR_AUTH_00001" },
  );
  assert.equal(f.calls.includes("refresh"), false);
  assert.equal(f.calls.includes("access"), false);
});
test("native binding checks resolve through the effective service override", async () => {
  const f = setup();
  delete f.person.registrationAssignmentCode;
  f.service.assertNativeEmployeeEnterprise = () => {
    throw new Error("custom admission refused");
  };
  await assert.rejects(
    f.service.assertEmployeeRegistrationSession(f.person, f.enterprise),
    /custom admission refused/,
  );
});
test("malformed native bindings never fall back to the default Enterprise", async () => {
  for (const value of [null, "", " ", {}, ["partner"]]) {
    const f = setup();
    delete f.person.registrationAssignmentCode;
    f.person.enterpriseCode = value;
    global.CONFIG = { get: () => "partner" };
    await assert.rejects(
      f.service.assertEmployeeRegistrationSession(f.person, f.enterprise),
      { code: "ERR_AUTH_00001" },
    );
  }
});
test("accepted parent and sibling contexts supersede native binding and retain only target roles through refresh", async () => {
  for (const target of ["parent", "sibling"]) {
    const f = setup();
    delete f.person.registrationAssignmentCode;
    f.person.enterpriseCode = "home";
    f.person.userGroupPermissions = ["home.only"];
    f.enterprise.code = target;
    const context = {
      anchor: {
        identity: { tenantCode: "partnerTenant" },
        state: { locked: false },
      },
      person: {
        ...f.person,
        userGroups: ["targetReader"],
        userGroupPermissions: ["target.read"],
      },
      sessionContext: {
        owner: "profile",
        code: target + "Assignment",
        version: 2,
      },
      securityBindings: [
        {
          tenant: "partnerTenant",
          principalId: "person-1",
          authVersion: 1,
        },
      ],
    };
    SERVICE.DefaultEnterpriseMembershipService = {
      enabled: () => true,
      sessionContext: async (person, enterprise, type) => {
        assert.equal(person, f.person);
        assert.equal(enterprise.code, target);
        assert.equal(type, "Employee");
        return context;
      },
      digest: JSON.stringify,
      validateContext: async () => {
        f.calls.push("membership");
      },
      credential: async () => ({ active: true }),
    };
    f.options.membershipContext = context;
    f.service.assertNativeEmployeeEnterprise = () => {
      assert.fail("Accepted owner context must not use native fallback admission");
    };
    f.service.resolveSessionUserGroups = (person) => person.userGroups;
    const issued = [];
    f.service.createRefreshToken = async (session) => {
      issued.push(structuredClone(session));
      return "fixture-refresh";
    };
    await f.service.issueSession(
      f.options,
      { locked: false },
      "password.authentication",
    );
    f.service.consumeToken = async () => structuredClone(issued[0]);
    await f.service.rotateRefreshToken({
      refreshToken: "fixture-refresh",
      entCode: target,
      type: "Employee",
    });
    assert.equal(issued.length, 2);
    for (const session of issued) {
      assert.equal(session.entCode, target);
      assert.deepEqual(session.userGroups, ["targetReader"]);
      assert.deepEqual(session.permissions, ["target.read"]);
      assert.deepEqual(session.sessionContext, context.sessionContext);
    }
    assert.ok(f.calls.filter((call) => call === "membership").length >= 4);
    SERVICE.DefaultEnterpriseMembershipService.validateContext = async () => {
      throw new CLASSES.NodicsError("ERR_AUTH_00001");
    };
    await assert.rejects(
      f.service.rotateRefreshToken({
        refreshToken: "fixture-refresh",
        entCode: target,
        type: "Employee",
      }),
      { code: "ERR_AUTH_00001" },
    );
    assert.equal(issued.length, 2);
  }
});
test("binding drift during issuance withholds the session and removes its refresh token", async () => {
  const f = setup();
  delete f.person.registrationAssignmentCode;
  f.service.recordAuthEvent = async () => {
    f.calls.push("audit");
    f.person.enterpriseCode = "foreign";
  };
  await assert.rejects(
    f.service.issueSession(f.options, { locked: false }, "password.authentication"),
    { code: "ERR_AUTH_00001" },
  );
  assert.equal(f.calls.at(-1), "remove");
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
