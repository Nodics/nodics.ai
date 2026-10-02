/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/**
 * @module profile/test/customerParticipationContract
 * @description Injected customer-consent, independent-proof and lifecycle-guard fixtures; not installed eligibility or browser acceptance.
 * @layer test
 * @owner profile
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const implementation = require("../src/service/customer/defaultCustomerRegistrationService");
const membership = require("../src/service/enterprise/defaultEnterpriseMembershipService");

/** Supplies isolated owner collaborators without runtime writes. @returns {Object} Effective owner and customer record. */
function fixture() {
  const terms = {
    version: "v1",
    documentCode: "customer-terms",
    title: "Customer participation terms",
    content: "Reviewed fixture participation terms.",
    digest: crypto
      .createHash("sha256")
      .update("Reviewed fixture participation terms.")
      .digest("hex"),
  };
  const person = {
    _id: "projection",
    code: "participation",
    loginId: "person",
    principalType: "customer",
    active: true,
    authenticationIdentity: {
      tenantCode: "source",
      recordKind: "EMPLOYEE",
      recordId: "canonical",
    },
    customerParticipation: {
      phase: "COMPLETE",
      enterpriseCode: "business",
      revision: 2,
      termsVersion: terms.version,
      termsDigest: terms.digest,
      termsDocumentCode: terms.documentCode,
      acceptedAt: "2026-09-01T00:00:00Z",
      eligibilityDecisionId: "retained-fixture-decision",
    },
  };
  global.CONFIG = {
    get: (key) =>
      key === "profileCustomerParticipation"
        ? { enabled: true, qualified: true, sessionQualified: true, terms }
        : {
            customerRegistration: {
              principalType: "customer",
              group: "customerUserGroup",
            },
          },
  };
  const registered = [];
  const eligibilityCalls = [];
  let eligible = true;
  const owner = {
    ...implementation,
    enforceParticipationEligibility: async (request, anchor, target) => {
      eligibilityCalls.push({ request, anchor, target });
      assert.equal(request.tenant, "target");
      assert.equal(anchor.person.loginId, "person");
      assert.equal(target.enterprise.code, "business");
      if (!eligible) throw Error("FORBIDDEN");
      return { eligible: true, decisionId: "current-fixture-decision" };
    },
  };
  global.SERVICE = {
    DefaultEnterpriseMembershipService: {
      ...membership,
      fail: (suffix) => {
        throw new Error(suffix);
      },
      resolve: async () => ({
        identity: person.authenticationIdentity,
        person: { authVersion: 4, loginId: "person" },
      }),
      groups: async () => [{ code: "customerUserGroup", parentGroups: [] }],
    },
    DefaultPrincipalGovernanceService: {
      validateModels: (models) =>
        assert.equal(models[0].principalType, "customer"),
    },
    DefaultAuthenticationProviderService: {
      resolveSessionUserGroups: (value) =>
        value.userGroups.map((group) => group.code),
    },
    DefaultIdentityGovernanceService: { hasAdministrativeAccess: () => false },
    DefaultPrincipalScopeGovernanceService: {
      getEffectiveScopes: async () => ({ scopes: [], deniedScopes: [] }),
    },
    DefaultPrincipalSecurityStampService: {
      register: async (...args) => registered.push(args),
    },
  };
  return {
    owner,
    person,
    registered,
    eligibilityCalls,
    revokeEligibility: () => {
      eligible = false;
    },
    enterprise: { code: "business", tenant: { code: "target" } },
  };
}
test("customer participation projects customer-only grants and distinct original/participation bindings", async () => {
  const f = fixture();
  const context = await f.owner.participationContext(f.person, f.enterprise);
  assert.equal(context.person.password, undefined);
  assert.deepEqual(context.person.userGroups, [
    { code: "customerUserGroup", parentGroups: [] },
  ]);
  assert.deepEqual(context.securityBindings, [
    {
      tenant: "source",
      principalId: "identity:EMPLOYEE:canonical",
      authVersion: 4,
    },
    {
      tenant: "target",
      principalId: "participation:CUSTOMER:projection",
      authVersion: 2,
    },
  ]);
  assert.equal(f.registered.length, 2);
  assert.equal(f.eligibilityCalls.length, 1);
});

test("current eligibility revocation denies participation before customer grants or proof registration", async () => {
  const f = fixture();
  f.revokeEligibility();
  let grants = 0;
  SERVICE.DefaultEnterpriseMembershipService.groups = async () => {
    grants++;
    return [];
  };
  await assert.rejects(
    f.owner.participationContext(f.person, f.enterprise),
    /FORBIDDEN/,
  );
  assert.equal(grants, 0);
  assert.equal(f.registered.length, 0);
  assert.equal(
    f.person.customerParticipation.phase,
    "COMPLETE",
    "Denial must not fabricate withdrawal or erase history",
  );
});

test("consent lacking retained decision evidence or acceptance time cannot become a session", async () => {
  const f = fixture();
  for (const fields of [
    { eligibilityDecisionId: undefined },
    { acceptedAt: undefined },
    { acceptedAt: "not-a-date" },
    { acceptedAt: "2999-01-01T00:00:00Z" },
  ]) {
    await assert.rejects(
      f.owner.participationContext(
        {
          ...f.person,
          customerParticipation: {
            ...f.person.customerParticipation,
            ...fields,
          },
        },
        f.enterprise,
      ),
      /IDENTITY/,
    );
  }
  assert.equal(f.registered.length, 0);
});
test("unqualified policy, changed terms and relevant scope denial reject before proof registration", async () => {
  const f = fixture();
  for (const denied of [
    { scopeType: "GLOBAL", scopeCode: "*" },
    { scopeType: "TENANT", scopeCode: "target" },
    { scopeType: "ENTERPRISE", scopeCode: "business" },
  ]) {
    SERVICE.DefaultPrincipalScopeGovernanceService.getEffectiveScopes =
      async () => ({ scopes: [], deniedScopes: [denied] });
    await assert.rejects(
      f.owner.participationContext(f.person, f.enterprise),
      /FORBIDDEN/,
    );
  }
  assert.equal(f.registered.length, 0);
  await assert.rejects(
    f.owner.participationContext(
      {
        ...f.person,
        customerParticipation: {
          ...f.person.customerParticipation,
          termsDigest: "b".repeat(64),
        },
      },
      f.enterprise,
    ),
    /IDENTITY/,
  );
  CONFIG.get = () => ({ enabled: true, qualified: false });
  assert.throws(() => f.owner.participationPolicy(), /UNAVAILABLE/);
});
test("public generated writes cannot manufacture or replace consent evidence", () => {
  const f = fixture();
  assert.throws(
    () =>
      f.owner.protectParticipation({
        model: { $set: { "customerParticipation.revision": 99 } },
      }),
    /FORBIDDEN/,
  );
  assert.equal(
    f.owner.protectParticipation({ model: { name: { firstName: "A" } } }),
    true,
  );
});
test("terms policy rejects content whose exact UTF-8 digest changed", () => {
  const f = fixture();
  const p = f.owner.participationPolicy();
  assert.doesNotThrow(() => f.owner.validateParticipationTerms(p));
  assert.throws(
    () =>
      f.owner.validateParticipationTerms({
        ...p,
        terms: { ...p.terms, content: p.terms.content + " changed" },
      }),
    /UNAVAILABLE/,
  );
});
