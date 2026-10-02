/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/** @module profile/test/customerEligibilityDecisionGovernanceContract @description Isolated fixtures for private Customer evidence, existing real stamp governance, exact generated acknowledgements and policy fences; all retained records/policies are synthetic test memory, never approved runtime data. @layer test @owner profile */
const test = require("node:test");
const assert = require("node:assert/strict");
const source = require("../src/service/customer/defaultCustomerEligibilityDecisionGovernanceService");
const stampGovernance = require("../src/service/identity/defaultPrincipalSecurityStampGovernanceService");
const membership = require("../src/service/enterprise/defaultEnterpriseMembershipService");

/** Models current generated envelopes and the existing real pre/post stamp implementation, without running a database/cache. @returns {Object} Mutable fixture state. */
function fixture() {
  const selection = {
    enabled: true,
    enforcementQualified: true,
    decisionAuditQualified: true,
    decisionInvalidationQualified: true,
    maximumDecisionHistory: 2,
    policyType: "FIXTURE_ONLY",
    propertyProviderCode: "profile.fixture",
    propertyCatalogueVersion: "1",
  };
  const policy = {
    definition: { groups: [] },
    sourceScopes: [
      {
        scopeType: "ENTERPRISE",
        scopeCode: "business",
        code: "fixture_v1",
        version: 1,
      },
    ],
    propertyProviderCode: "profile.fixture",
    propertyCatalogueVersion: "1",
  };
  const context = {
    tenant: "target",
    action: "ONBOARDING",
    subjectType: "CUSTOMER",
    subjectCode: "fixture@example.invalid",
    enterpriseCode: "business",
  };
  const state = {
    records: [
      {
        _id: "customer-1",
        loginId: context.subjectCode,
        principalType: "customer",
        active: true,
        authVersion: 3,
      },
    ],
    writes: [],
    reads: [],
    sequence: 3,
    cache: new Map(),
    failWrite: false,
    failStamp: false,
  };
  const owner = { ...source };
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
  const matches = (row, query) =>
    Object.entries(query || {}).every(([key, value]) => {
      if (key === "$or") return value.some((clause) => matches(row, clause));
      if (key === "$and") return value.every((clause) => matches(row, clause));
      const stored = key.split(".").reduce((entry, part) => entry?.[part], row);
      if (value && typeof value === "object" && Object.hasOwn(value, "$exists"))
        return (stored !== undefined) === value.$exists;
      if (value && typeof value === "object" && Array.isArray(value.$in))
        return value.$in.includes(stored);
      return JSON.stringify(stored) === JSON.stringify(value);
    });
  global.SERVICE = {
    DefaultCustomerEligibilityDecisionGovernanceService: owner,
    DefaultIdentityGovernanceService: {
      getSystemAuthData: () => ({ fixtureSystem: true }),
    },
    DefaultEnterpriseMembershipService: membership,
    DefaultCustomerRegistrationService: { ownsParticipationWrite: () => false },
    DefaultPrincipalSecurityStampGovernanceService: stampGovernance,
    DefaultPrincipalSecurityStampService: {
      getKey: (tenant, principal) => tenant + ":" + principal,
      getCacheModuleName: () => "fixture-only",
      reserveVersion: async (tenant, minimum) => {
        state.sequence = Math.max(state.sequence + 1, minimum);
        return state.sequence;
      },
      register: async (tenant, principal, authVersion) => {
        if (state.failStamp) throw Error("fixture stamp failure");
        state.cache.set(tenant + ":" + principal, { authVersion });
        return true;
      },
    },
    DefaultAuthenticationProviderService: {
      findToken: async (module, key) => state.cache.get(key),
    },
    DefaultKycDecisionEnforcementService: {
      policy: () => selection,
      owners: () => ({}),
      resolvePolicy: async () => policy,
    },
    DefaultCustomerService: {
      get: async (request) => {
        owner.protectRead(request);
        state.reads.push(request);
        assert.deepEqual(request.options, {
          recursive: false,
          skipItemCache: true,
        });
        assert.equal(request.tenant, "target");
        const rows = state.records.filter((row) => matches(row, request.query));
        const wrapper = {
          success: {
            code: "SUC_DBS_00000",
            count: rows.length,
            result: structuredClone(rows),
          },
        };
        owner.redactDecision(request, wrapper);
        return wrapper.success;
      },
      update: async (request) => {
        assert.equal(owner.ownsWrite(request), true);
        state.writes.push(request);
        await owner.protectMutation(request);
        await owner.prepareCustomerFactsChange(request);
        if (state.failWrite)
          return {
            code: "SUC_DBS_00000",
            result: { acknowledged: true, matchedCount: 0 },
          };
        request.schemaModel = { schemaName: "customer" };
        await owner.prepareCustomerSecurityStamp(request);
        const rows = state.records.filter((row) => matches(row, request.query));
        for (const row of rows)
          Object.assign(row, structuredClone(request.model.$set));
        await stampGovernance.registerPreparedPrincipalUpdate(request);
        const result = {
          code: "SUC_DBS_00000",
          result: { acknowledged: true, matchedCount: rows.length },
        };
        await owner.completeCustomerFactsChange(request, { success: result });
        return result;
      },
    },
    DefaultRuleSetVersionService: {
      get: async () => ({
        code: "SUC_DBS_00000",
        count: 1,
        result: [
          {
            _id: "policy-1",
            consumerModule: "profile",
            policyType: "FIXTURE_ONLY",
          },
        ],
      }),
    },
  };
  const decision = {
    decisionId: "FIXTURE_REFERENCE",
    outcome: "ALLOW",
    policyType: "FIXTURE_ONLY",
    propertyProviderCode: "profile.fixture",
    catalogueCode: "FIXTURE",
    catalogueVersion: "1",
    sourceHash: "a".repeat(64),
    sourceScopes: policy.sourceScopes,
    policyFingerprint: owner.policyFingerprint(policy),
  };
  const record = (decision) =>
    owner.withObservation(context, (handle) => owner.record(handle, decision));
  return { owner, state, selection, policy, context, decision, record };
}

test("actual receipts persist on Customer; identical evidence is a no-op; changed denial retains history and invalidates both native stamps", async () => {
  const f = fixture();
  await f.record(f.decision);
  const person = f.state.records[0];
  assert.equal(person.customerEligibilityDecision.current.outcome, "ALLOW");
  assert.ok(person.authVersion > 3);
  assert.equal(
    f.state.cache.get("target:identity:CUSTOMER:customer-1").authVersion,
    person.authVersion,
  );
  assert.equal(
    f.state.cache.get("target:" + f.context.subjectCode).authVersion,
    person.authVersion,
  );
  const writes = f.state.writes.length;
  await f.record(f.decision);
  assert.equal(f.state.writes.length, writes);
  const denied = await f.record({
    ...f.decision,
    outcome: "DENY",
    decisionId: "FIXTURE_DENIED",
    sourceHash: "b".repeat(64),
  });
  assert.equal(denied.eligible, false);
  assert.equal(person.customerEligibilityDecision.current.outcome, "DENY");
  assert.equal(person.customerEligibilityDecision.history.length, 1);
  assert.equal(person.customerEligibilityDecision.history[0].outcome, "ALLOW");
  assert.equal(f.owner.ownsWrite(f.state.writes[0]), false);
});

test("missing qualifications, stale principal/policy, exhausted history and failed acknowledgements never claim durable completion", async () => {
  let f = fixture();
  f.selection.decisionAuditQualified = false;
  await assert.rejects(f.record(f.decision), /UNAVAILABLE/);
  f = fixture();
  await assert.rejects(
    f.owner.withObservation(f.context, (handle) => {
      f.state.records[0].authVersion++;
      return f.owner.record(handle, f.decision);
    }),
    /CONFLICT/,
  );
  f = fixture();
  await assert.rejects(
    f.owner.withObservation(f.context, (handle) => {
      f.policy.definition = { groups: [{ code: "changed" }] };
      return f.owner.record(handle, f.decision);
    }),
    /CONFLICT/,
  );
  f = fixture();
  f.state.failWrite = true;
  await assert.rejects(f.record(f.decision), /CONFLICT/);
  assert.equal(f.owner.ownsWrite(f.state.writes[0]), false);
  f = fixture();
  f.state.failStamp = true;
  await assert.rejects(f.record(f.decision));
  f = fixture();
  f.selection.maximumDecisionHistory = 1;
  await f.record(f.decision);
  await f.record({ ...f.decision, decisionId: "SECOND" });
  await assert.rejects(
    f.record({ ...f.decision, decisionId: "THIRD" }),
    /CONFLICT/,
  );
});

test("only exact staged registration result admits inline audit, and public envelope redacts it", async () => {
  const f = fixture();
  f.state.records = [];
  const decision = await f.record(f.decision);
  const command = {
    tenant: "target",
    model: { loginId: f.context.subjectCode },
  };
  await assert.rejects(
    f.owner.withRegistrationDecision(command, { ...decision }, () => true),
    /FORBIDDEN/,
  );
  const response = await f.owner.withRegistrationDecision(
    command,
    decision,
    async (request) => {
      assert.equal(f.owner.ownsWrite(request), true);
      f.state.records = [
        {
          ...request.model,
          _id: "customer-1",
          principalType: "customer",
          active: true,
          authVersion: 1,
        },
      ];
      return {
        code: "SUC_DBS_00000",
        result: structuredClone(f.state.records),
      };
    },
  );
  assert.equal(response.result[0].customerEligibilityDecision, undefined);
  assert.equal(
    f.state.records[0].customerEligibilityDecision.current.decisionId,
    f.decision.decisionId,
  );
  assert.equal(f.owner.ownsWrite(command), false);
  await assert.rejects(
    f.owner.withRegistrationDecision(command, decision, () => true),
    /FORBIDDEN/,
  );
});

test("public nested/cache metadata is removed without mutating retained objects; copied/deferred reads lose admission", async () => {
  const f = fixture();
  await f.record(f.decision);
  const privateValue = structuredClone(f.state.records[0]);
  const wrapper = { success: { result: [{ person: privateValue }] } };
  f.owner.redactDecision({}, wrapper);
  assert.equal(
    wrapper.success.result[0].person.customerEligibilityDecision,
    undefined,
  );
  assert.ok(privateValue.customerEligibilityDecision);
  for (const model of [
    { customerEligibilityDecision: {} },
    { $set: { "customerEligibilityDecision.current": {} } },
  ])
    await assert.rejects(f.owner.protectMutation({ model }), /FORBIDDEN/);
  await assert.rejects(
    f.owner.protectRemoval({ tenant: "target", query: { _id: "customer-1" } }),
    /FORBIDDEN/,
  );
  let release, started;
  const ready = new Promise((resolve) => {
      started = resolve;
    }),
    deferred = new Promise((resolve) => {
      release = resolve;
    });
  const request = { options: { recursive: false, skipItemCache: true } };
  SERVICE.DefaultCustomerService.get = async (exact) => {
    assert.equal(f.owner.ownsRead(exact), true);
    started();
    await deferred;
    throw Error("fixture failure");
  };
  const read = f.owner.generatedRead(request);
  await ready;
  assert.equal(f.owner.ownsRead({ ...request }), false);
  release();
  await assert.rejects(read);
  assert.equal(f.owner.ownsRead(request), false);
});

test("disabled eligibility preserves unmarked bulk inserts and replacements; retained proof cannot be replaced", async () => {
  const f = fixture();
  f.selection.enabled = false;
  for (const model of [{ loginId: "one" }, { loginId: "two" }]) {
    // Actual bulk initializer forwards each model to generated single save with its resolved selector.
    assert.equal(
      await f.owner.protectSave({
        tenant: "target",
        query: { loginId: model.loginId },
        model,
      }),
      true,
    );
  }
  assert.equal(
    await f.owner.protectMutation({
      tenant: "target",
      model: [{ loginId: "one" }, { loginId: "two" }],
    }),
    true,
  );
  assert.equal(
    await f.owner.protectMutation({
      tenant: "target",
      query: { _id: "customer-1" },
      options: { overwrite: true },
      model: { loginId: "replacement" },
    }),
    true,
  );
  await assert.rejects(
    f.owner.protectMutation({
      tenant: "target",
      model: [{ customerEligibilityDecision: {} }],
    }),
    /FORBIDDEN/,
  );
  f.state.records[0].customerEligibilityDecision = {
    current: { decisionId: "retained" },
  };
  await assert.rejects(
    f.owner.protectSave({
      tenant: "target",
      query: { _id: "customer-1" },
      model: { active: false },
    }),
    /FORBIDDEN/,
  );
  await assert.rejects(
    f.owner.protectMutation({
      tenant: "target",
      query: { _id: "customer-1" },
      options: { overwrite: true },
      model: { loginId: "replacement" },
    }),
    /FORBIDDEN/,
  );
  await assert.rejects(
    f.owner.protectMutation({
      tenant: "target",
      query: { _id: "customer-1" },
      model: [{ $project: { loginId: 1 } }],
    }),
    /FORBIDDEN/,
  );
  await assert.rejects(
    f.owner.protectMutation({
      model: { $rename: { loginId: "customerEligibilityDecision" } },
    }),
    /FORBIDDEN/,
  );
  for (const query of [
    { "customerEligibilityDecision.current": "retained" },
    { $where: "return true" },
  ])
    assert.throws(() => f.owner.protectRead({ query }), /FORBIDDEN/);
});

test("published policy writes fence before/after persistence; unrelated/zero-match/overlapping operations never silently clear pending evidence", async () => {
  const f = fixture();
  await f.record(f.decision);
  const request = {
    tenant: "target",
    model: { consumerModule: "profile", policyType: "FIXTURE_ONLY" },
  };
  await f.owner.preparePolicyChange(request);
  const pendingVersion = f.state.records[0].authVersion;
  assert.equal(
    f.state.records[0].customerEligibilityDecision.invalidation.phase,
    "PENDING",
  );
  await assert.rejects(f.record(f.decision), /CONFLICT/);
  await assert.rejects(f.owner.preparePolicyChange({ ...request }), /CONFLICT/);
  await f.owner.completePolicyChange(request, {
    success: { code: "SUC_DBS_00000", result: [{ _id: "policy-1" }] },
  });
  assert.equal(
    f.state.records[0].customerEligibilityDecision.invalidation.phase,
    "COMPLETE",
  );
  assert.ok(f.state.records[0].authVersion > pendingVersion);
  const next = {
    tenant: "target",
    query: { _id: "policy-1" },
    model: { $set: { active: false } },
  };
  await f.owner.preparePolicyChange(next);
  await assert.rejects(
    f.owner.completePolicyChange(next, {
      success: {
        code: "SUC_DBS_00000",
        result: { acknowledged: true, matchedCount: 0 },
      },
    }),
    /CONFLICT/,
  );
  assert.equal(
    f.state.records[0].customerEligibilityDecision.invalidation.phase,
    "PENDING",
  );
});

test("retained native eligibility is a content-free historical dependency; copied/private response flags never hide it", async () => {
  const f = fixture();
  const identity = {
    tenantCode: "target",
    recordKind: "CUSTOMER",
    recordId: "customer-1",
  };
  assert.equal(await f.owner.hasRetainedDecision(identity), false);
  await f.record(f.decision);
  assert.equal(await f.owner.hasRetainedDecision(identity), true);
  await assert.rejects(
    f.owner.hasRetainedDecision({ ...identity, private: true }),
    /FORBIDDEN/,
  );
  f.state.records[0].customerEligibilityDecision = {
    invalidation: { phase: "PENDING" },
  };
  assert.equal(await f.owner.hasRetainedDecision(identity), true);
});

test("actual Contact revision callback fences typed original Customers, records real denial and refuses copied callback handles", async () => {
  const f = fixture();
  await f.record(f.decision);
  SERVICE.DefaultTenantService = {
    get: async () => ({
      code: "SUC_DBS_00000",
      count: 1,
      result: [{ _id: "tenant-1", code: "target" }],
    }),
  };
  SERVICE.DefaultKycDecisionEnforcementService.assess = async (request) =>
    f.owner.withObservation(
      f.context,
      (handle) =>
        f.owner.record(handle, {
          ...f.decision,
          outcome: "DENY",
          decisionId: "fixture_contact_denial",
        }),
      request,
    );
  const identity = {
    tenantCode: "target",
    recordKind: "CUSTOMER",
    recordId: "customer-1",
  };
  const handle = await f.owner.prepareCanonicalContactChange(identity, {
    contactCode: "contact-1",
    beforeRevision: 4,
    afterRevision: 5,
    beforePhase: "VERIFIED",
    afterPhase: "ISSUE_PENDING",
  });
  assert.equal(
    f.state.records[0].customerEligibilityDecision.invalidation.phase,
    "PENDING",
  );
  assert.equal(
    f.state.records[0].customerEligibilityDecision.invalidation.source.kind,
    "CANONICAL_CONTACT",
  );
  await assert.rejects(
    f.owner.completeCanonicalContactChange({ ...handle }, identity, 5),
    /FORBIDDEN/,
  );
  await f.owner.completeCanonicalContactChange(handle, identity, 5);
  assert.equal(
    f.state.records[0].customerEligibilityDecision.current.outcome,
    "DENY",
  );
  assert.equal(
    f.state.records[0].customerEligibilityDecision.invalidation.phase,
    "COMPLETE",
  );
  await assert.rejects(
    f.owner.completeCanonicalContactChange(handle, identity, 5),
    /FORBIDDEN/,
  );
});

test("exact original fence reconciliation uses fresh evaluator and retained CAS; history exhaustion never truncates or timeout-clears", async () => {
  const f = fixture();
  await f.record(f.decision);
  const person = f.state.records[0];
  person.customerEligibilityDecision.invalidation = {
    phase: "PENDING",
    changeId: "fixture_original",
    reason: "APPROVED_POLICY_CHANGE",
  };
  SERVICE.DefaultKycDecisionEnforcementService.assess = async (request) =>
    f.owner.withObservation(
      f.context,
      (handle) => f.owner.record(handle, f.decision),
      request,
    );
  const actor = {
    identity: {
      tenantCode: "target",
      recordKind: "EMPLOYEE",
      recordId: "operator-1",
    },
  };
  // This isolated command fixture supplies already-authorized operator selection; source operatorCustomer separately performs real permission, credential and enterprise checks.
  f.owner.operatorCustomer = async (request) => ({
    person: structuredClone(person),
    input: request.body,
    actor,
  });
  await assert.rejects(
    f.owner.reconcile({
      tenant: "target",
      body: {
        authVersion: person.authVersion - 1,
        changeId: "fixture_original",
      },
    }),
    /CONFLICT/,
  );
  await f.owner.reconcile({
    tenant: "target",
    body: { authVersion: person.authVersion, changeId: "fixture_original" },
  });
  assert.equal(
    person.customerEligibilityDecision.invalidation.phase,
    "COMPLETE",
  );
  assert.equal(person.customerEligibilityDecision.history.length, 0);
  person.customerEligibilityDecision.history = [f.decision, f.decision];
  person.customerEligibilityDecision.invalidation = {
    phase: "PENDING",
    changeId: "fixture_exhausted",
  };
  SERVICE.DefaultKycDecisionEnforcementService.assess = async (request) =>
    f.owner.withObservation(
      f.context,
      (handle) =>
        f.owner.record(handle, {
          ...f.decision,
          outcome: "DENY",
          decisionId: "fixture_new",
        }),
      request,
    );
  const before = structuredClone(person.customerEligibilityDecision);
  await assert.rejects(
    f.owner.reconcile({
      tenant: "target",
      body: { authVersion: person.authVersion, changeId: "fixture_exhausted" },
    }),
    /CONFLICT/,
  );
  assert.deepEqual(person.customerEligibilityDecision, before);
  assert.equal(
    (await f.owner.inspect({ tenant: "target", body: {} })).capacityExhausted,
    true,
  );
});

test("scheduled current-policy fingerprints invalidate once without inventing a policy revision or accepting pending recovery", async () => {
  const f = fixture();
  await f.record(f.decision);
  assert.equal(await f.owner.invalidatePolicyBoundary("target"), 0);
  f.policy.definition = { groups: [{ code: "fixture-new-window" }] };
  const version = f.state.records[0].authVersion;
  assert.equal(await f.owner.invalidatePolicyBoundary("target"), 1);
  assert.ok(f.state.records[0].authVersion > version);
  assert.equal(await f.owner.invalidatePolicyBoundary("target"), 0);
  f.state.records[0].customerEligibilityDecision.invalidation.phase = "PENDING";
  await assert.rejects(f.owner.invalidatePolicyBoundary("target"), /CONFLICT/);
});

test("captured canonical fact updates reevaluate by original ID; private audit writes do not recurse into customer/Employee events", async () => {
  const f = fixture();
  await f.record(f.decision);
  let evaluations = 0;
  SERVICE.DefaultKycDecisionEnforcementService.assess = async (
    request,
    action,
    subject,
  ) => {
    evaluations++;
    assert.equal(subject.enterpriseCode, "business");
    assert.equal(subject.subjectCode, f.context.subjectCode);
    return f.record({
      ...f.decision,
      outcome: "DENY",
      decisionId: "FIXTURE_REVOKED",
      sourceHash: "c".repeat(64),
    });
  };
  const request = {
    tenant: "target",
    query: { _id: "customer-1" },
    model: { $set: { disabled: true } },
  };
  await f.owner.prepareCustomerFactsChange(request);
  f.state.records[0].disabled = true;
  await f.owner.completeCustomerFactsChange(request, {
    success: {
      code: "SUC_DBS_00000",
      result: { acknowledged: true, matchedCount: 1 },
    },
  });
  assert.equal(evaluations, 1);
  assert.equal(
    f.state.records[0].customerEligibilityDecision.current.outcome,
    "DENY",
  );
  await f.owner.completeCustomerFactsChange(request, { success: {} });
  assert.equal(evaluations, 1);
});

test("first native audit builds issuance from its privately owned new revision, unchanged issuance is stable, and old refresh/access proof rejects", async () => {
  const f = fixture(),
    registration = require("../src/service/customer/defaultCustomerRegistrationService");
  f.selection.nativeSessionQualified = true;
  Object.assign(f.state.records[0], {
    code: "native-fixture",
    password: "password-reference",
  });
  const verified = structuredClone(f.state.records[0]); // Fixture models an existing issuer's already verified input, not authentication.
  SERVICE.DefaultPasswordService = {
    get: async (request) => {
      assert.deepEqual(request.query, {
        _id: "password-reference",
        identityLinkRetirement: { $exists: false },
      });
      assert.deepEqual(request.options, {
        recursive: false,
        skipItemCache: true,
      });
      return {
        code: "SUC_DBS_00000",
        count: 1,
        result: [
          {
            _id: "password-reference",
            loginId: f.context.subjectCode,
            active: true,
            password: "fixture-only-hash",
          },
        ],
      };
    },
  };
  SERVICE.DefaultUserStateService = {
    get: async () => ({ code: "SUC_DBS_00000", count: 0, result: [] }),
  };
  SERVICE.DefaultPrincipalSecurityStampService.validateBindings = async (
    bindings,
  ) => {
    for (const binding of bindings)
      assert.equal(
        f.state.cache.get(binding.tenant + ":" + binding.principalId)
          ?.authVersion,
        binding.authVersion,
      );
    return true;
  };
  const owner = {
    ...registration,
    enforceCustomerEligibility: () => f.record(f.decision),
  };
  const enterprise = { code: "business", tenant: { code: "target" } };
  const prepared = await owner.prepareCustomerEligibilityContext(
    verified,
    enterprise,
  );
  assert.ok(prepared.person.authVersion > verified.authVersion);
  assert.equal(prepared.sessionContext.version, f.state.records[0].authVersion);
  assert.ok(
    prepared.securityBindings.every(
      (binding) => binding.authVersion === prepared.person.authVersion,
    ),
  );
  const writes = f.state.writes.length;
  const repeated = await owner.prepareCustomerEligibilityContext(
    prepared.person,
    enterprise,
  );
  assert.equal(f.state.writes.length, writes);
  assert.deepEqual(repeated.sessionContext, prepared.sessionContext);
  const session = {
    type: "Customer",
    principalType: "customer",
    tenant: "target",
    entCode: "business",
    loginId: verified.loginId,
    authVersion: prepared.person.authVersion,
    sessionContext: prepared.sessionContext,
    securityBindings: prepared.securityBindings,
  };
  await owner.validateCustomerEligibilityContext(session);
  await assert.rejects(
    owner.validateCustomerEligibilityContext({
      ...session,
      authVersion: verified.authVersion,
      sessionContext: {
        ...session.sessionContext,
        version: verified.authVersion,
      },
    }),
  );
  await assert.rejects(
    f.owner.nativeAuditAnchor(
      {
        identity: {
          tenantCode: "target",
          recordKind: "CUSTOMER",
          recordId: verified._id,
        },
        person: verified,
      },
      { eligible: true, decisionId: f.decision.decisionId },
    ),
    /CONFLICT/,
  );
});
