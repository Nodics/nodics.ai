/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/** @module profile/test/customerEligibilityOwnerContract @description Authored fail-closed decision-owner fixtures for ordinary registration and linked participation; execution reserved for joint acceptance. @layer test @owner profile */
const test = require("node:test");
const assert = require("node:assert/strict");
const source = require("../src/service/customer/defaultCustomerRegistrationService");
test("missing owner never authorizes creation", async () => {
  global.CLASSES = { NodicsError: Error };
  global.CONFIG = {
    get: () => ({ eligibilityService: "DefaultKycDecisionEnforcementService" }),
  };
  global.SERVICE = {};
  await assert.rejects(
    source.enforceCustomerEligibility(
      { tenant: "t" },
      {
        subjectType: "CUSTOMER",
        subjectCode: "person@example.invalid",
        enterpriseCode: "business",
      },
    ),
    /UNAVAILABLE/,
  );
  let saved = false,
    failure;
  const owner = {
    ...source,
    enforceCustomerEligibility: async () => {
      throw Error("missing owner");
    },
  };
  await new Promise((resolve) =>
    owner.createCustomer(
      {
        tenant: "t",
        model: { loginId: "person@example.invalid" },
        authData: { entCode: "business" },
        defaultCustomerService: {
          save: async () => {
            saved = true;
          },
        },
      },
      {},
      {
        nextSuccess: resolve,
        error: (req, res, error) => {
          failure = error;
          resolve();
        },
      },
    ),
  );
  assert.equal(saved, false);
  assert.ok(failure);
});
test("only an explicit referenced owner approval in current enterprise placement is accepted", async () => {
  global.CLASSES = { NodicsError: Error };
  global.CONFIG = {
    get: () => ({ eligibilityService: "DefaultCustomerDecisionService" }),
  };
  let decision = { eligible: true, decisionId: "approved-decision" };
  global.SERVICE = {
    DefaultCustomerDecisionService: {
      enforce: async (request, action, subject) => {
        assert.equal(request.body, undefined);
        assert.equal(request.model, undefined);
        assert.equal(request.httpRequest, undefined);
        assert.equal(action, "ONBOARDING");
        assert.equal(subject.enterpriseCode, "business");
        return decision;
      },
    },
    DefaultEnterpriseManagementService: {
      retrieveEnterpriseForAccess: async () => ({
        tenantCode: "t",
        enterprise: { code: "business", active: true },
      }),
    },
  };
  const request = {
      tenant: "t",
      body: { canonicalPassword: "private" },
      model: { password: "private" },
      httpRequest: { body: { password: "private" } },
    },
    subject = {
      subjectType: "CUSTOMER",
      subjectCode: "person@example.invalid",
      enterpriseCode: "business",
    };
  assert.deepEqual(
    await source.enforceCustomerEligibility(request, subject),
    decision,
  );
  for (const invalid of [
    null,
    { eligible: true },
    { eligible: false, decisionId: "denied" },
    { eligible: true, decisionId: "approved", error: "failure" },
  ]) {
    decision = invalid;
    await assert.rejects(
      source.enforceCustomerEligibility(request, subject),
      /FORBIDDEN/,
    );
  }
  await assert.rejects(
    source.enforceCustomerEligibility({ tenant: "other" }, subject),
    /FORBIDDEN/,
  );
});

test("ordinary authenticated Customer eligibility consumer uses fresh generated inventory and rejects revocation", async () => {
  const stamp = require("../src/service/identity/defaultPrincipalSecurityStampGovernanceService");
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code) {
        super(code);
        this.code = code;
      }
    },
  };
  global.CONFIG = {
    get: (key) =>
      key === "profileCustomerEligibility"
        ? { nativeSessionQualified: true }
        : undefined,
  };
  let eligible = true,
    calls = 0;
  const person = {
    _id: "original",
    code: "native-customer",
    loginId: "person@example.invalid",
    principalType: "customer",
    active: true,
    authVersion: 3,
    password: "original-password",
  };
  let passwords = [
      {
        _id: "original-password",
        loginId: person.loginId,
        active: true,
        provider: "PASSWORD",
        password: "fixture-only-not-a-real-hash",
      },
    ],
    states = [],
    credentialReads = 0,
    stateReads = 0;
  global.SERVICE = {
    DefaultEnterpriseMembershipService: { recordId: (value) => String(value) },
    DefaultPrincipalSecurityStampService: {
      validateBindings: async (bindings) => {
        assert.deepEqual(bindings, [
          { tenant: "t", principalId: person.loginId, authVersion: 3 },
          {
            tenant: "t",
            principalId: "identity:CUSTOMER:original",
            authVersion: 3,
          },
        ]);
      },
    },
    DefaultIdentityGovernanceService: {
      getSystemAuthData: () => ({ system: true }),
    },
    DefaultPrincipalSecurityStampGovernanceService: stamp,
    DefaultPasswordService: {
      get: async (request) => {
        credentialReads++;
        assert.equal(request.tenant, "t");
        assert.deepEqual(request.query, {
          _id: "original-password",
          identityLinkRetirement: { $exists: false },
        });
        assert.deepEqual(request.options, {
          recursive: false,
          skipItemCache: true,
        });
        const retained = passwords.filter(
          (password) => !Object.hasOwn(password, "identityLinkRetirement"),
        );
        return {
          code: "SUC_DBS_00000",
          count: retained.length,
          result: retained,
        };
      },
    },
    DefaultUserStateService: {
      get: async (request) => {
        stateReads++;
        assert.equal(request.tenant, "t");
        assert.deepEqual(request.query, {
          $and: [{ loginId: person.loginId }, { personId: person._id }],
        });
        assert.deepEqual(request.options, {
          recursive: false,
          skipItemCache: true,
        });
        return { code: "SUC_DBS_00000", count: states.length, result: states };
      },
    },
    DefaultCustomerService: {
      get: async (request) => {
        assert.equal(request.tenant, "t");
        assert.deepEqual(
          request.query,
          request.query._id
            ? { _id: person._id, identityLinkRetirement: { $exists: false } }
            : {
                loginId: person.loginId,
                identityLinkRetirement: { $exists: false },
              },
        );
        assert.deepEqual(request.options, {
          recursive: false,
          skipItemCache: true,
        });
        return { code: "SUC_DBS_00000", count: 1, result: [person] };
      },
    },
  };
  const owner = {
    ...source,
    enforceCustomerEligibility: async (request, subject) => {
      calls++;
      assert.equal(subject.enterpriseCode, "business");
      assert.equal(subject.subjectCode, person.loginId);
      if (!eligible) throw Error("FORBIDDEN");
      return { eligible: true, decisionId: "current-owner-reference" };
    },
  };
  const session = {
    type: "Customer",
    principalType: "customer",
    tenant: "t",
    entCode: "business",
    loginId: person.loginId,
    authVersion: 3,
    sessionContext: {
      owner: "profile.customerEligibility",
      code: person.code,
      version: 3,
    },
    securityBindings: [
      { tenant: "t", principalId: person.loginId, authVersion: 3 },
      {
        tenant: "t",
        principalId: "identity:CUSTOMER:original",
        authVersion: 3,
      },
    ],
  };
  const prepared = await owner.prepareCustomerEligibilityContext(person, {
    code: "business",
    tenant: { code: "t" },
  });
  assert.deepEqual(prepared.sessionContext, session.sessionContext);
  assert.deepEqual(prepared.securityBindings, session.securityBindings);
  const anchor = await owner.validateCustomerEligibilityContext(session);
  assert.equal(anchor.person, person);
  assert.deepEqual(anchor.identity, {
    tenantCode: "t",
    recordKind: "CUSTOMER",
    recordId: "original",
  });
  assert.equal(
    anchor.decisionId,
    undefined,
    "The context validator must return the original anchor, not a decision DTO",
  );
  assert.equal(anchor.password, undefined);
  assert.equal(anchor.state, undefined);
  assert.equal(credentialReads, 2);
  assert.equal(stateReads, 2);
  const approvedPassword = passwords[0];
  for (const patch of [
    { active: false },
    { active: undefined },
    { loginId: "other" },
    { provider: "EXTERNAL" },
    { password: "" },
    { identityLinkRetirement: { handle: "private-fixture" } },
  ]) {
    passwords = [{ ...approvedPassword, ...patch }];
    const prior = calls;
    await assert.rejects(
      owner.validateCustomerEligibilityContext(session),
      /FORBIDDEN/,
    );
    assert.equal(
      calls,
      prior,
      "Credential retirement/invalidity must reject before eligibility approval",
    );
  }
  passwords = [];
  await assert.rejects(
    owner.validateCustomerEligibilityContext(session),
    /FORBIDDEN/,
  );
  passwords = [approvedPassword];
  const passwordOwner = SERVICE.DefaultPasswordService;
  delete SERVICE.DefaultPasswordService;
  await assert.rejects(
    owner.validateCustomerEligibilityContext(session),
    /UNAVAILABLE/,
  );
  SERVICE.DefaultPasswordService = passwordOwner;
  passwords = [
    approvedPassword,
    { ...approvedPassword, _id: "ambiguous-password" },
  ];
  await assert.rejects(
    owner.validateCustomerEligibilityContext(session),
    /FORBIDDEN/,
  );
  passwords = [approvedPassword];
  states = [
    {
      _id: "state-original",
      loginId: person.loginId,
      personId: person._id,
      active: true,
      locked: true,
    },
  ];
  const beforeLockout = calls;
  await assert.rejects(
    owner.validateCustomerEligibilityContext(session),
    /FORBIDDEN/,
  );
  assert.equal(calls, beforeLockout);
  states[0].locked = false;
  await owner.validateCustomerEligibilityContext(session);
  const unlocked = { ...states[0] };
  for (const patch of [
    { personId: "wrong-original" },
    { loginId: "other" },
    { locked: "false" },
    { active: false },
  ]) {
    states = [{ ...unlocked, ...patch }];
    await assert.rejects(
      owner.validateCustomerEligibilityContext(session),
      /FORBIDDEN/,
    );
  }
  states = [unlocked];
  states = [states[0], { ...states[0], _id: "duplicate-state" }];
  await assert.rejects(
    owner.validateCustomerEligibilityContext(session),
    /FORBIDDEN/,
  );
  states = [];
  await assert.rejects(
    owner.validateCustomerEligibilityContext({
      ...session,
      sessionContext: undefined,
    }),
    /FORBIDDEN/,
  );
  for (const sessionContext of [
    { ...session.sessionContext, owner: "profile" },
    { ...session.sessionContext, version: 2 },
    { ...session.sessionContext, code: "other" },
    { ...session.sessionContext, eligible: true },
  ])
    await assert.rejects(
      owner.validateCustomerEligibilityContext({ ...session, sessionContext }),
      /FORBIDDEN/,
    );
  for (const patch of [
    { principalId: "identity:EMPLOYEE:original" },
    { tenant: "other" },
    { authVersion: 2 },
  ]) {
    await assert.rejects(
      owner.validateCustomerEligibilityContext({
        ...session,
        securityBindings: [
          session.securityBindings[0],
          { ...session.securityBindings[1], ...patch },
        ],
      }),
      /FORBIDDEN/,
    );
  }
  const beforeRevocation = calls;
  eligible = false;
  await assert.rejects(
    owner.validateCustomerEligibilityContext(session),
    /FORBIDDEN/,
  );
  assert.equal(calls, beforeRevocation + 1);
  person.authenticationIdentity = { recordKind: "EMPLOYEE" };
  await assert.rejects(
    owner.validateCustomerEligibilityContext(session),
    /FORBIDDEN/,
  );
  assert.equal(
    calls,
    beforeRevocation + 1,
    "A linked customer cannot bypass its consent owner as an ordinary account",
  );
  CONFIG.get = () => ({ nativeSessionQualified: false });
  await assert.rejects(
    owner.validateCustomerEligibilityContext(session),
    /UNAVAILABLE/,
  );
  await assert.rejects(
    owner.prepareCustomerEligibilityContext(person, {
      code: "business",
      tenant: { code: "t" },
    }),
    /UNAVAILABLE/,
  );
});
