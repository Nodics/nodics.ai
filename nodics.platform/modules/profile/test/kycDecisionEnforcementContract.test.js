/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/** @module profile/test/kycDecisionEnforcementContract @description Isolated Profile consumer/readiness fixtures using actual Rules/inventory owners and synthetic in-memory evidence; no approved business policies or installed KYC qualification. @layer test @owner profile */
const test = require("node:test");
const assert = require("node:assert/strict");
const source = require("../src/service/customer/defaultKycDecisionEnforcementService");
const rules = "../../../../nodics.rulesEngine/modules/";

/** Supplies actual generic owner collaborators with synthetic records only in fixture memory. @returns {Object} Mutable fixture evidence and commands. */
function fixture() {
  const selection = {
    enabled: true,
    enforcementQualified: true,
    publishedPolicyQualified: true,
    evidenceProviderQualified: true,
    policyType: "FIXTURE_ONLY",
    propertyProviderCode: "profile.fixture",
    propertyCatalogueVersion: "1",
    approvalOutcomeType: "FIXTURE_APPROVAL",
    denialOutcomeTypes: ["FIXTURE_DENIAL"],
    platformScopeCode: "DEFAULT",
  };
  const state = {
    value: "reviewed",
    available: true,
    reads: [],
    properties: [],
    failure: null,
  };
  const policy = {
    _id: "policy-1",
    code: "fixture_v1",
    ruleSetCode: "fixture",
    active: true,
    version: 1,
    consumerModule: "profile",
    policyType: "FIXTURE_ONLY",
    propertyProviderCode: "profile.fixture",
    propertyCatalogueVersion: "1",
    scopeType: "ENTERPRISE",
    scopeCode: "business",
    status: "ACTIVE",
    checksum: "a".repeat(64),
    definition: {
      groups: [
        {
          code: "reviewed",
          operator: "ALL",
          conditions: [
            {
              code: "current",
              propertyCode: "review",
              operatorCode: "EQUALS",
              value: "reviewed",
              missingValueBehavior: "REQUIRED",
            },
          ],
          outcome: { outcomeType: "FIXTURE_APPROVAL" },
        },
      ],
    },
  };
  state.versions = [policy];
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
      key === "profileCustomerEligibility" ? selection : undefined,
  };
  const provider = {
    ownerModule: "profile",
    // Synthetic fixture admission only; production uses current generated Profile facts.
    withContext: async (context, operation) => operation(context),
    getCatalogue: () => ({
      code: "fixture-catalogue",
      version: "1",
      properties: [
        {
          code: "review",
          dataType: "STRING",
          allowedOperators: ["EQUALS", "IS_AVAILABLE"],
        },
      ],
    }),
    resolveProperty: (request) => {
      state.properties.push(request);
      assert.equal(request.context.tenant, "placement");
      assert.equal(request.context.enterpriseCode, "business");
      assert.equal(request.context.subjectCode, "person@example.invalid");
      assert.equal(request.context.body, undefined);
      assert.equal(request.context.password, undefined);
      return {
        available: state.available,
        value: state.value,
        quality: "OPERATOR_VERIFIED",
        confidence: 100,
        source: "FIXTURE_ONLY",
      };
    },
  };
  const outcome = {
    ownerModule: "profile",
    validate: () => ({ valid: true, issues: [] }),
  };
  global.SERVICE = {
    DefaultIdentityGovernanceService: {
      getSystemAuthData: () => ({ fixtureSystem: true }),
    },
    DefaultEnterpriseManagementService: {
      retrieveEnterpriseForAccess: async () => ({
        enterprise: { code: "business", active: true },
        tenantCode: "placement",
      }),
    },
    DefaultPrincipalSecurityStampGovernanceService: require("../src/service/identity/defaultPrincipalSecurityStampGovernanceService"),
    // This suite isolates the real Rules consumer; durable governance is exercised by its separate authored owner fixtures.
    DefaultCustomerEligibilityDecisionGovernanceService: {
      withObservation: async (context, operation) =>
        operation(Object.freeze({})),
      policyFingerprint: (policy) =>
        require("../src/service/customer/defaultCustomerEligibilityDecisionGovernanceService").policyFingerprint(
          policy,
        ),
      record: async (observation, receipt) => {
        state.receipts = [...(state.receipts || []), receipt];
        return {
          eligible: receipt.outcome === "ALLOW",
          decisionId: receipt.decisionId,
        };
      },
    },
    DefaultRuleSetVersionService: {
      get: async (request) => {
        state.reads.push(request);
        assert.equal(request.tenant, "placement");
        assert.deepEqual(request.query, {
          consumerModule: "profile",
          policyType: "FIXTURE_ONLY",
        });
        assert.deepEqual(request.options, {
          recursive: false,
          skipItemCache: true,
        });
        assert.deepEqual(request.searchOptions.sort, { _id: 1 });
        return (
          state.failure || {
            code: "SUC_DBS_00000",
            count: state.versions.length,
            result: state.versions,
          }
        );
      },
    },
    DefaultRulePolicyResolutionService: require(
      rules + "rulesDefinition/src/service/defaultRulePolicyResolutionService",
    ),
    DefaultRuleDefinitionValidationService: require(
      rules +
        "rulesDefinition/src/service/defaultRuleDefinitionValidationService",
    ),
    DefaultRulePropertyCatalogueRegistryService: {
      ...require(
        rules +
          "rulesCore/src/service/defaultRulePropertyCatalogueRegistryService",
      ),
      providers: { "profile.fixture": provider },
    },
    DefaultRuleOutcomeRegistryService: {
      ...require(
        rules + "rulesCore/src/service/defaultRuleOutcomeRegistryService",
      ),
      definitions: { FIXTURE_APPROVAL: outcome, FIXTURE_DENIAL: outcome },
    },
    DefaultRuleEvaluationService: require(
      rules + "rulesEvaluation/src/service/defaultRuleEvaluationService",
    ),
  };
  const request = {
    tenant: "placement",
    body: { password: "not-evaluation-input", eligible: true },
  };
  const subject = {
    subjectType: "CUSTOMER",
    subjectCode: "person@example.invalid",
    enterpriseCode: "business",
  };
  return { state, selection, policy, provider, request, subject };
}

/** Selects only in-memory qualifications while using actual Rules registry/resolution/validation owners; any evaluation or write fails the test. */
function readinessFixture() {
  const f = fixture();
  Object.assign(f.selection, {
    decisionAuditQualified: true,
    decisionInvalidationQualified: true,
    maximumDecisionHistory: 100,
  });
  SERVICE.DefaultEnterpriseManagementService.retrieveEnterpriseForAccess =
    async (code) => ({
      tenantCode: "placement",
      enterprise: {
        code,
        active: true,
        tenant: { code: "placement", active: true },
      },
    });
  const noSideEffects = () => {
    throw new Error(
      "Readiness must not evaluate, resolve subject facts or write",
    );
  };
  SERVICE.DefaultRuleEvaluationService = { evaluate: noSideEffects };
  f.provider.resolveProperty = noSideEffects;
  f.provider.withContext = noSideEffects;
  SERVICE.DefaultCustomerService = {
    get: noSideEffects,
    update: noSideEffects,
  };
  SERVICE.DefaultPrincipalSecurityStampService = {
    reserveVersion: noSideEffects,
    getKey: noSideEffects,
    getCacheModuleName: noSideEffects,
  };
  SERVICE.DefaultAuthenticationProviderService = { findToken: noSideEffects };
  SERVICE.DefaultEnterpriseMembershipService = {
    recordId: noSideEffects,
    paths: noSideEffects,
  };
  SERVICE.DefaultCustomerEligibilityDecisionGovernanceService = {
    policy:
      require("../src/service/customer/defaultCustomerEligibilityDecisionGovernanceService")
        .policy,
    withObservation: noSideEffects,
    record: noSideEffects,
    withRegistrationDecision: noSideEffects,
    transferRegistrationDecision: noSideEffects,
  };
  f.context = { tenant: "placement", enterpriseCode: "business" };
  return f;
}

test("onboarding readiness inspects actual published policy and registries without a subject, evaluation or writes", async () => {
  const f = readinessFixture();
  const getCatalogue = f.provider.getCatalogue;
  f.provider.getCatalogue = (context) => {
    assert.deepEqual(context, f.context);
    assert.equal(context.subjectCode, undefined);
    assert.equal(context.identity, undefined);
    return getCatalogue();
  };
  assert.equal(await source.assertOnboardingReady(f.context), true);
  assert.equal(f.state.reads.length, 1);
  assert.equal(f.state.properties.length, 0);
  assert.equal(f.state.receipts, undefined);
});

test("readiness fails closed for default-off or incomplete selection and never evaluates", async () => {
  for (const key of [
    "enabled",
    "enforcementQualified",
    "publishedPolicyQualified",
    "evidenceProviderQualified",
  ]) {
    const f = readinessFixture();
    f.selection[key] = false;
    await assert.rejects(source.assertOnboardingReady(f.context), {
      code: "ERR_PROFILE_ELIGIBILITY_CONFIGURATION",
    });
    assert.equal(f.state.reads.length, 0);
  }
  const f = readinessFixture();
  f.selection.policyType = null;
  await assert.rejects(source.assertOnboardingReady(f.context), {
    code: "ERR_PROFILE_ELIGIBILITY_CONFIGURATION",
  });
});

test("readiness rejects unavailable collaborators and unqualified decision audit/invalidation", async () => {
  let f = readinessFixture();
  delete SERVICE.DefaultRuleSetVersionService;
  await assert.rejects(source.assertOnboardingReady(f.context), {
    code: "ERR_PROFILE_ELIGIBILITY_COLLABORATORS",
  });
  for (const key of [
    "decisionAuditQualified",
    "decisionInvalidationQualified",
  ]) {
    f = readinessFixture();
    f.selection[key] = false;
    await assert.rejects(source.assertOnboardingReady(f.context), {
      code: "ERR_PROFILE_ELIGIBILITY_AUDIT",
    });
    assert.equal(f.state.reads.length, 0);
  }
  for (const name of [
    "DefaultCustomerService",
    "DefaultPrincipalSecurityStampService",
    "DefaultAuthenticationProviderService",
    "DefaultIdentityGovernanceService",
    "DefaultEnterpriseMembershipService",
  ]) {
    f = readinessFixture();
    delete SERVICE[name];
    await assert.rejects(source.assertOnboardingReady(f.context), {
      code: "ERR_PROFILE_ELIGIBILITY_AUDIT",
    });
    assert.equal(f.state.reads.length, 0);
  }
});

test("readiness rejects missing, expired or ambiguous published policy without evaluating", async () => {
  for (const mutate of [
    (f) => {
      f.state.versions = [];
    },
    (f) => {
      f.policy.effectiveTo = "2000-01-01T00:00:00Z";
    },
    (f) => {
      f.state.versions.push({ ...f.policy });
    },
  ]) {
    const f = readinessFixture();
    mutate(f);
    await assert.rejects(source.assertOnboardingReady(f.context), {
      code: "ERR_PROFILE_ELIGIBILITY_POLICY",
    });
    assert.equal(f.state.receipts, undefined);
  }
});

test("readiness validates registered property, operator and outcome compatibility", async () => {
  for (const mutate of [
    () => {
      delete SERVICE.DefaultRulePropertyCatalogueRegistryService.providers[
        "profile.fixture"
      ];
    },
    () => {
      delete SERVICE.DefaultRuleOutcomeRegistryService.definitions
        .FIXTURE_DENIAL;
    },
    (f) => {
      f.policy.definition.groups[0].conditions[0].propertyCode = "unregistered";
    },
    (f) => {
      f.policy.definition.groups[0].conditions[0].operatorCode = "UNSUPPORTED";
    },
    (f) => {
      f.provider.getCatalogue = () => ({
        code: "fixture",
        version: "2",
        properties: [],
      });
    },
  ]) {
    const f = readinessFixture();
    mutate(f);
    await assert.rejects(source.assertOnboardingReady(f.context), {
      code: "ERR_PROFILE_ELIGIBILITY_REGISTRY",
    });
  }
});

test("readiness rejects inactive placement and caller subject selectors", async () => {
  let f = readinessFixture();
  await assert.rejects(
    source.assertOnboardingReady({ ...f.context, subjectCode: "invented" }),
    { code: "ERR_PROFILE_ELIGIBILITY_CONFIGURATION" },
  );
  f = readinessFixture();
  SERVICE.DefaultEnterpriseManagementService.retrieveEnterpriseForAccess =
    async () => ({
      tenantCode: "placement",
      enterprise: {
        code: "business",
        active: true,
        tenant: { code: "placement", active: false },
      },
    });
  await assert.rejects(source.assertOnboardingReady(f.context), {
    code: "ERR_PROFILE_ELIGIBILITY_CONFIGURATION",
  });
});

test("registered current Profile facts and declarative outcomes feed actual Rules evaluation and revoked state denies", async () => {
  const f = fixture();
  const provider = {
    ...require("../src/service/customer/defaultCustomerEligibilityRulePropertyService"),
  };
  const outcomes = {
    ...require("../src/service/customer/defaultCustomerEligibilityRuleOutcomeService"),
    definitions: undefined,
  };
  const person = {
    _id: "retained-customer",
    code: "fixture-customer",
    loginId: f.subject.subjectCode,
    active: true,
    principalType: "customer",
  };
  SERVICE.DefaultEnterpriseMembershipService = require("../src/service/enterprise/defaultEnterpriseMembershipService");
  SERVICE.DefaultCustomerService = {
    get: async (request) => {
      assert.deepEqual(request.options, {
        recursive: false,
        skipItemCache: true,
      });
      assert.equal(request.tenant, "placement");
      assert.ok(
        request.query.loginId === person.loginId ||
          request.query._id === person._id,
      );
      return { code: "SUC_DBS_00000", result: [person], count: 1 };
    },
  };
  await provider.init();
  await outcomes.init();
  f.selection.propertyProviderCode = provider.providerCode;
  f.selection.approvalOutcomeType = "PROFILE_CUSTOMER_ELIGIBILITY_ALLOW";
  f.selection.denialOutcomeTypes = ["PROFILE_CUSTOMER_ELIGIBILITY_DENY"];
  f.policy.propertyProviderCode = provider.providerCode;
  f.policy.definition.groups[0].conditions[0] = {
    code: "current-account",
    propertyCode: "canonical.active",
    operatorCode: "IS_TRUE",
    missingValueBehavior: "REQUIRED",
  };
  f.policy.definition.groups[0].outcome = {
    outcomeType: f.selection.approvalOutcomeType,
  };
  const result = await source.enforce(f.request, "ONBOARDING", f.subject);
  assert.deepEqual(Object.keys(result).sort(), ["decisionId", "eligible"]);
  assert.equal(result.eligible, true);
  person.active = false;
  await assert.rejects(source.enforce(f.request, "ONBOARDING", f.subject));
  person.active = true;
  f.policy.definition.groups[0].conditions[0].propertyCode =
    "contact.emailVerified";
  await assert.rejects(source.enforce(f.request, "ONBOARDING", f.subject));
});

test("configured published policy uses real Rules evaluation and returns only bounded non-secret reference", async () => {
  const f = fixture();
  const result = await source.enforce(f.request, "ONBOARDING", f.subject);
  assert.equal(result.eligible, true);
  assert.match(result.decisionId, /^KYC_[a-f0-9]{64}$/);
  assert.deepEqual(Object.keys(result).sort(), ["decisionId", "eligible"]);
  assert.equal(f.state.reads.length, 1);
  assert.equal(f.state.properties.length, 1);
});

test("current evidence denial, missing evidence and denial precedence cannot become eligible", async () => {
  const f = fixture();
  await source.enforce(f.request, "ONBOARDING", f.subject);
  f.state.value = "revoked";
  await assert.rejects(
    source.enforce(f.request, "ONBOARDING", f.subject),
    /FORBIDDEN/,
  );
  f.state.value = "reviewed";
  f.state.available = false;
  await assert.rejects(
    source.enforce(f.request, "ONBOARDING", f.subject),
    /FORBIDDEN/,
  );
  f.state.available = true;
  f.policy.definition.groups.push({
    code: "denial",
    operator: "ALL",
    conditions: [
      {
        code: "denied",
        propertyCode: "review",
        operatorCode: "IS_AVAILABLE",
        missingValueBehavior: "REQUIRED",
      },
    ],
    outcome: { outcomeType: "FIXTURE_DENIAL" },
  });
  await assert.rejects(
    source.enforce(f.request, "ONBOARDING", f.subject),
    /FORBIDDEN/,
  );
  assert.equal(
    f.state.reads.length,
    4,
    "Each admission must reread current published inventory",
  );
});

test("missing qualifications and absent actual evidence providers stay unavailable without default approval", async () => {
  const f = fixture();
  for (const key of [
    "enabled",
    "enforcementQualified",
    "publishedPolicyQualified",
    "evidenceProviderQualified",
  ]) {
    f.selection[key] = false;
    await assert.rejects(
      source.enforce(f.request, "ONBOARDING", f.subject),
      /UNAVAILABLE/,
    );
    f.selection[key] = true;
  }
  assert.equal(f.state.reads.length, 0);
  SERVICE.DefaultRulePropertyCatalogueRegistryService.providers = {};
  await assert.rejects(
    source.enforce(f.request, "ONBOARDING", f.subject),
    /UNAVAILABLE/,
  );
});

test("failed/truncated generated inventory, duplicate scope versions, expired or malformed policy never authorize", async () => {
  const f = fixture();
  for (const failure of [
    { code: "ERR_DBS_00000", count: 1, result: [f.policy] },
    { code: "SUC_DBS_00000", count: 2, result: [f.policy] },
  ]) {
    f.state.failure = failure;
    await assert.rejects(
      source.enforce(f.request, "ONBOARDING", f.subject),
      /UNAVAILABLE/,
    );
  }
  f.state.failure = null;
  f.state.versions = [f.policy, { ...f.policy, _id: "policy-2" }];
  await assert.rejects(
    source.enforce(f.request, "ONBOARDING", f.subject),
    /UNAVAILABLE/,
  );
  f.state.versions = [f.policy];
  for (const patch of [
    { status: "DISABLED" },
    { effectiveTo: "2000-01-01T00:00:00Z" },
    { effectiveFrom: "not-a-date" },
    { propertyCatalogueVersion: "unreviewed" },
    { checksum: undefined },
  ]) {
    f.state.versions = [{ ...f.policy, ...patch }];
    await assert.rejects(
      source.enforce(f.request, "ONBOARDING", f.subject),
      /UNAVAILABLE/,
    );
  }
});

test("wrong enterprise placement and extra subject selectors fail before Rules reads", async () => {
  const f = fixture();
  await assert.rejects(
    source.enforce({ tenant: "other" }, "ONBOARDING", f.subject),
    /FORBIDDEN/,
  );
  await assert.rejects(
    source.enforce(f.request, "ONBOARDING", { ...f.subject, eligible: true }),
    /FORBIDDEN/,
  );
  await assert.rejects(
    source.enforce(f.request, "OTHER", f.subject),
    /FORBIDDEN/,
  );
  assert.equal(f.state.reads.length, 0);
});

test("later effective member overrides remain mergeable without replacing decision authorities", async () => {
  const f = fixture();
  let calls = 0;
  const owner = {
    ...source,
    policy: function () {
      calls++;
      return source.policy.call(this);
    },
  };
  await owner.enforce(f.request, "ONBOARDING", f.subject);
  assert.equal(calls, 1);
});
