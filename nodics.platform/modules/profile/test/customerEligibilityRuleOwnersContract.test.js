/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/** @module profile/test/customerEligibilityRuleOwnersContract @description Isolated fixtures for current generated Profile facts, real Rules registries, transient lifetime and declarative outcomes; synthetic records are never runtime policy or KYC evidence. @layer test @owner profile */
const test = require("node:test");
const assert = require("node:assert/strict");
const source = require("../src/service/customer/defaultCustomerEligibilityRulePropertyService");
const outcomeSource = require("../src/service/customer/defaultCustomerEligibilityRuleOutcomeService");
const membership = require("../src/service/enterprise/defaultEnterpriseMembershipService");
const core = "../../../../nodics.rulesEngine/modules/rulesCore/src/service/";

/** Builds exact uncached generated-owner envelopes in fixture memory only. @returns {Object} Mutable retained fixture state. */
function fixture() {
  const state = {
    customer: {
      _id: "customer-1",
      code: "customer",
      loginId: "fixture@example.invalid",
      principalType: "customer",
      active: true,
      password: "private-reference",
      contacts: ["contact-1"],
    },
    employee: {
      _id: "employee-1",
      loginId: "fixture@example.invalid",
      principalType: "human",
      active: true,
    },
    contact: {
      _id: "contact-id",
      code: "contact-1",
      active: true,
      type: "EMAIL",
      value: "fixture@example.invalid",
    },
    reads: [],
    failure: null,
    terms: {
      version: "v1",
      digest: "a".repeat(64),
      documentCode: "fixture-terms",
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
  global.CONFIG = { get: () => undefined };
  const get = (kind) => async (request) => {
    state.reads.push({ kind, request });
    assert.deepEqual(request.options, {
      recursive: false,
      skipItemCache: true,
    });
    assert.deepEqual(request.searchOptions.sort, { _id: 1 });
    assert.deepEqual(request.authData, { fixtureSystem: true });
    const row = state[kind];
    const matches =
      row &&
      Object.entries(request.query).every(([key, value]) => row[key] === value);
    return (
      state.failure || {
        code: "SUC_DBS_00000",
        result: matches ? [row] : [],
        count: matches ? 1 : 0,
      }
    );
  };
  global.SERVICE = {
    DefaultIdentityGovernanceService: {
      getSystemAuthData: () => ({ fixtureSystem: true }),
    },
    DefaultPrincipalSecurityStampGovernanceService: require("../src/service/identity/defaultPrincipalSecurityStampGovernanceService"),
    DefaultEnterpriseMembershipService: membership,
    DefaultEnterpriseManagementService: {
      retrieveEnterpriseForAccess: async () => ({
        enterprise: { code: "business", active: true },
        tenantCode: "target",
      }),
    },
    DefaultCustomerService: { get: get("customer") },
    DefaultEmployeeService: { get: get("employee") },
    DefaultContactService: { get: get("contact") },
    DefaultCustomerRegistrationService: {
      participationPolicy: () => ({ terms: state.terms }),
    },
    DefaultRulePropertyCatalogueRegistryService: {
      ...require(core + "defaultRulePropertyCatalogueRegistryService"),
      providers: {},
    },
    DefaultRuleOutcomeRegistryService: {
      ...require(core + "defaultRuleOutcomeRegistryService"),
      definitions: {},
    },
  };
  const provider = { ...source },
    outcomes = { ...outcomeSource, definitions: undefined };
  const context = {
    tenant: "target",
    action: "ONBOARDING",
    subjectType: "CUSTOMER",
    subjectCode: "fixture@example.invalid",
    enterpriseCode: "business",
  };
  return { state, provider, outcomes, context };
}

test("effective services register in real registries idempotently; conflicts never replace another owner", async () => {
  const f = fixture();
  await f.provider.init();
  await f.provider.postInit();
  await f.outcomes.init();
  await f.outcomes.postInit();
  assert.equal(
    SERVICE.DefaultRulePropertyCatalogueRegistryService.getProvider(
      "profile.customerEligibility",
    ),
    f.provider,
  );
  assert.equal(f.provider.getCatalogue().version, "1");
  await assert.rejects({ ...source }.init());
  for (const code of [
    "PROFILE_CUSTOMER_ELIGIBILITY_ALLOW",
    "PROFILE_CUSTOMER_ELIGIBILITY_DENY",
  ]) {
    const definition = SERVICE.DefaultRuleOutcomeRegistryService.get(code);
    assert.equal(definition.ownerModule, "profile");
    assert.equal(definition.validate({ outcomeType: code }).valid, true);
    assert.equal(
      definition.validate({ outcomeType: code, parameters: {} }).valid,
      true,
    );
    for (const outcome of [
      { outcomeType: code, parameters: { eligible: true } },
      { outcomeType: code, identity: {} },
      { outcomeType: code, parameters: [] },
      { outcomeType: "OTHER" },
    ])
      assert.equal(definition.validate(outcome).valid, false);
  }
  await assert.rejects({ ...outcomeSource, definitions: undefined }.init());
});

test("fresh generated facts retain false state; email presence never claims verified contact", async () => {
  const f = fixture();
  let retained;
  await f.provider.withContext(f.context, async (context) => {
    retained = context;
    const property = (propertyCode) =>
      f.provider.resolveProperty({ context, propertyCode });
    assert.equal(property("customer.active").value, true);
    assert.equal(property("customer.disabled").value, false);
    assert.equal(property("canonical.recordKind").value, "CUSTOMER");
    assert.equal(property("contact.emailPresent").value, true);
    assert.equal(property("contact.emailVerified").available, false);
    assert.equal(
      property("contact.emailVerified").source,
      "PROFILE_CONTACT_VERIFICATION_OWNER_ABSENT",
    );
    assert.equal(property("consent.currentTerms").value, false);
    assert.equal(property("password").available, false);
    assert.equal(
      f.provider.resolveProperty({
        context: { ...context },
        propertyCode: "customer.active",
      }).available,
      false,
    );
    assert.equal(
      f.provider.resolveProperty({
        context: { context },
        propertyCode: "customer.active",
      }).available,
      false,
    );
    assert.equal(context.person, undefined);
    assert.equal(context.password, undefined);
  });
  assert.equal(
    f.provider.resolveProperty({
      context: retained,
      propertyCode: "customer.active",
    }).available,
    false,
  );
  f.state.customer.active = false;
  f.state.customer.disabled = true;
  await f.provider.withContext(f.context, (context) => {
    assert.equal(
      f.provider.resolveProperty({ context, propertyCode: "customer.active" })
        .value,
      false,
    );
    assert.equal(
      f.provider.resolveProperty({
        context,
        propertyCode: "canonical.disabled",
      }).value,
      true,
    );
  });
  assert.ok(f.state.reads.length >= 6);
});

test("private snapshot lifetime ends after a deferred failing callback; body flags never admit", async () => {
  const f = fixture();
  let retained, release;
  const deferred = new Promise((resolve) => {
    release = resolve;
  });
  let started;
  const ready = new Promise((resolve) => {
    started = resolve;
  });
  const operation = f.provider.withContext(f.context, async (context) => {
    retained = context;
    started();
    await deferred;
    throw new Error("fixture-only");
  });
  await ready;
  assert.equal(
    f.provider.resolveProperty({
      context: retained,
      propertyCode: "customer.active",
    }).available,
    true,
  );
  assert.equal(
    f.provider.resolveProperty({
      context: {
        ...retained,
        properties: { "customer.active": { available: true, value: true } },
      },
      propertyCode: "customer.active",
    }).available,
    false,
  );
  release();
  await assert.rejects(operation);
  assert.equal(
    f.provider.resolveProperty({
      context: retained,
      propertyCode: "customer.active",
    }).available,
    false,
  );
  await assert.rejects(
    f.provider.withContext(
      { ...f.context, body: { eligible: true } },
      () => true,
    ),
  );
});

test("linked and pre-projection facts use exact immutable Employee owner, never a login search", async () => {
  const f = fixture();
  f.state.customer = undefined;
  const identity = {
    tenantCode: "original",
    recordKind: "EMPLOYEE",
    recordId: "employee-1",
  };
  await f.provider.withContext({ ...f.context, identity }, (context) => {
    assert.equal(
      f.provider.resolveProperty({ context, propertyCode: "customer.exists" })
        .value,
      false,
    );
    assert.equal(
      f.provider.resolveProperty({ context, propertyCode: "canonical.active" })
        .value,
      true,
    );
  });
  const read = f.state.reads.find((item) => item.kind === "employee");
  assert.equal(read.request.tenant, "original");
  assert.deepEqual(read.request.query, { _id: "employee-1" });
  f.state.customer = {
    _id: "projection",
    loginId: f.context.subjectCode,
    principalType: "customer",
    active: true,
    authenticationIdentity: identity,
  };
  await assert.rejects(
    f.provider.withContext(
      { ...f.context, identity: { ...identity, recordId: "other" } },
      () => true,
    ),
  );
  f.state.employee.authenticationIdentity = { ...identity, recordId: "chain" };
  await assert.rejects(f.provider.withContext(f.context, () => true));
});

test("retained consent matches current document, acceptance time and decision reference only", async () => {
  const f = fixture();
  f.state.customer.customerParticipation = {
    phase: "COMPLETE",
    enterpriseCode: "business",
    revision: 1,
    termsVersion: "v1",
    termsDigest: f.state.terms.digest,
    termsDocumentCode: "fixture-terms",
    acceptedAt: "2026-01-01T00:00:00Z",
    eligibilityDecisionId: "FIXTURE_ONLY",
  };
  const current = async (expected) =>
    f.provider.withContext(f.context, (context) =>
      assert.equal(
        f.provider.resolveProperty({
          context,
          propertyCode: "consent.currentTerms",
        }).value,
        expected,
      ),
    );
  await current(true);
  f.state.terms.version = "v2";
  await current(false);
  f.state.terms.version = "v1";
  f.state.customer.customerParticipation.acceptedAt = "2999-01-01";
  await current(false);
});

test("failed, malformed, duplicate and wrong-placement inventories cannot produce an admitted context", async () => {
  for (const failure of [
    { code: "ERR_DBS", result: [], count: 0 },
    { code: "SUC_DBS", result: [], count: 1 },
    { code: "SUC_DBS", result: [{ _id: "same" }, { _id: "same" }], count: 2 },
  ]) {
    const f = fixture();
    f.state.failure = failure;
    let called = false;
    await assert.rejects(
      f.provider.withContext(f.context, () => {
        called = true;
      }),
    );
    assert.equal(called, false);
  }
  const f = fixture();
  await assert.rejects(
    f.provider.withContext({ ...f.context, tenant: "other" }, () => true),
  );
  f.state.customer = undefined;
  await f.provider.withContext(f.context, (context) => {
    assert.equal(
      f.provider.resolveProperty({ context, propertyCode: "customer.exists" })
        .value,
      false,
    );
    assert.equal(
      f.provider.resolveProperty({ context, propertyCode: "canonical.active" })
        .available,
      false,
    );
  });
});

test("real Contact fact interface receives exact detached logger-private original identity, never Customer eligibility/session recursion or asserted email", async () => {
  const f = fixture();
  let selectedInput,
    qualified = true,
    verified = true;
  SERVICE.DefaultLoggerService = {
    runSensitiveOperation: async (input, operation) => {
      selectedInput = input;
      assert.deepEqual(Object.keys(input).sort(), ["channel", "identity"]);
      assert.equal(input.channel, "EMAIL");
      assert.deepEqual(input.identity, {
        tenantCode: "target",
        recordKind: "CUSTOMER",
        recordId: "customer-1",
      });
      if (!qualified) throw Error("fixture privacy qualification unavailable");
      return operation();
    },
  };
  SERVICE.DefaultProfileVerifiedContactService = {
    getCanonicalVerificationFact: async (input) => {
      assert.equal(input, selectedInput);
      return { verified };
    },
  };
  const observe = (expected) =>
    f.provider.withContext(f.context, (context) => {
      const fact = f.provider.resolveProperty({
        context,
        propertyCode: "contact.emailVerified",
      });
      assert.equal(fact.value, expected);
      assert.equal(
        fact.quality,
        expected ? "CONTACT_VERIFIED" : "REFERENCE_DEFAULT",
      );
    });
  await observe(true);
  verified = false;
  await observe(false);
  qualified = false;
  await f.provider.withContext(f.context, (context) =>
    assert.equal(
      f.provider.resolveProperty({
        context,
        propertyCode: "contact.emailVerified",
      }).available,
      false,
    ),
  );
});
