/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/**
 * @module profile/test/customerRegistrationPlacementContract
 * @description Isolated registration placement regressions for import-shaped requests and independent Customer subjects; no runtime records or credentials are created.
 * @layer test
 * @owner profile
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const registration = require("../src/service/customer/defaultCustomerRegistrationService");
const customer = require("../src/service/customer/defaultCustomerService");

/** Builds isolated existing-owner doubles without enabling any deployment policy. */
function fixture() {
  const calls = { placement: 0, decision: 0, save: 0 };
  let decision = { eligible: true, decisionId: "fixture-decision" };
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(error, message, fallback) {
        super(message || (error instanceof Error ? error.message : error));
        this.code = error instanceof Error ? error.code || fallback : error;
      }
    },
  };
  global.CONFIG = {
    get: (key) =>
      key === "identityGovernance"
        ? {
            customerRegistration: {
              importPlacement: {
                metadataOwnerService: "DefaultModelImportProcessService",
              },
            },
          }
        : key === "profileCustomerEligibility"
          ? { enabled: true }
          : { eligibilityService: "DefaultFixtureDecisionService" },
  };
  const admissions = new WeakMap();
  let active = true;
  global.SERVICE = {
    DefaultCustomerRegistrationService: registration,
    DefaultModelImportProcessService: {
      readAdmittedOperationMetadata: (request) => admissions.get(request),
    },
    DefaultEnterpriseManagementService: {
      retrieveEnterpriseForAccess: async (code) => {
        calls.placement++;
        assert.equal(code, "business");
        return {
          tenantCode: "t",
          enterprise: { code, active, tenant: { code: "t", active } },
        };
      },
    },
    DefaultFixtureDecisionService: {
      assertOnboardingReady: async (context) => {
        assert.deepEqual(context, { tenant: "t", enterpriseCode: "business" });
        return true;
      },
      enforce: async (request, action, subject) => {
        calls.decision++;
        assert.equal(action, "ONBOARDING");
        assert.deepEqual(subject, {
          subjectType: "CUSTOMER",
          subjectCode: "target@example.invalid",
          enterpriseCode: "business",
        });
        assert.equal(request.model, undefined);
        assert.equal(request.body, undefined);
        return decision;
      },
    },
    DefaultIdentityGovernanceService: {
      getSystemAuthData: () => ({ isSystem: true }),
    },
    DefaultCustomerEligibilityDecisionGovernanceService: {
      withRegistrationDecision: async (request, approval, operation) => {
        assert.equal(approval.eligible, true);
        assert.equal(request.model.authenticationIdentity, undefined);
        assert.equal(request.model.customerParticipation, undefined);
        return operation(request);
      },
    },
  };
  const owner = {
    ...customer,
    get: async () => ({ code: "SUC_DBS_00000", result: [] }),
    save: async () => {
      calls.save++;
      return { code: "SUC_DBS_00000", result: [{ code: "target" }] };
    },
  };
  SERVICE.DefaultPipelineService = {
    start: async (name, request) => {
      assert.equal(name, "customerRegistrationHandlerPipeline");
      // Exercise the actual placement/eligibility step; other pipeline nodes are outside this fixture.
      return new Promise((resolve, reject) =>
        registration.createCustomer(
          request,
          {},
          {
            nextSuccess: (input, response) => resolve(response.success),
            error: (input, response, error) => reject(error),
          },
        ),
      );
    },
  };
  return {
    owner,
    calls,
    admissions,
    deactivate: () => (active = false),
    deny: () => (decision = { eligible: false, decisionId: "denied" }),
  };
}

test("import-shaped customer batch fails before writes when enterprise placement is absent", async () => {
  const f = fixture();
  await assert.rejects(
    f.owner.signUpAll({
      tenant: "t",
      authData: { userGroups: ["adminGroup"] },
      models: [
        {
          code: "target",
          loginId: "target@example.invalid",
          entCode: "business",
          import: true,
        },
      ],
    }),
    { code: "ERR_PROFILE_MEMBERSHIP_FORBIDDEN" },
  );
  assert.deepEqual(f.calls, { placement: 0, decision: 0, save: 0 });
});

test("placed registration evaluates the target Customer, not the administrative actor", async () => {
  const f = fixture();
  await f.owner.signUpAll({
    tenant: "t",
    enterprise: { code: "business" },
    authData: {
      loginId: "staff@example.invalid",
      principalType: "human",
      type: "Employee",
      entCode: "business",
    },
    models: [{ code: "target", loginId: "target@example.invalid" }],
  });
  assert.deepEqual(f.calls, { placement: 7, decision: 1, save: 1 });
});

test("placed registration still rejects cross-tenant placement before decision or writes", async () => {
  const f = fixture();
  await assert.rejects(
    f.owner.signUpAll({
      tenant: "other",
      enterprise: { code: "business" },
      models: [{ loginId: "target@example.invalid" }],
    }),
    { code: "ERR_PROFILE_MEMBERSHIP_FORBIDDEN" },
  );
  assert.deepEqual(f.calls, { placement: 1, decision: 0, save: 0 });
});

test("placed registration cannot bypass an explicit eligibility denial", async () => {
  const f = fixture();
  f.deny();
  await assert.rejects(
    f.owner.signUpAll({
      tenant: "t",
      enterprise: { code: "business" },
      models: [{ loginId: "target@example.invalid" }],
    }),
    { code: "ERR_PROFILE_MEMBERSHIP_FORBIDDEN" },
  );
  assert.deepEqual(f.calls, { placement: 6, decision: 1, save: 0 });
});

/** Returns a frozen nImport-owned metadata fixture, never a runtime approval. */
function metadata(overrides = {}) {
  return Object.freeze({
    moduleName: "profile",
    schemaName: "customer",
    operation: "signUpAll",
    tenant: "t",
    enterpriseCode: "business",
    ...overrides,
  });
}

test("preflight requires explicit active enterprise and active tenant for Customer signup only", async () => {
  const f = fixture();
  assert.equal(await registration.validateImportTarget(metadata()), true);
  for (const enterpriseCode of [undefined, "", "bad/code", "x".repeat(129)]) {
    await assert.rejects(
      registration.validateImportTarget(metadata({ enterpriseCode })),
      { code: "ERR_PROFILE_MEMBERSHIP_FORBIDDEN" },
    );
  }
  await assert.rejects(
    registration.validateImportTarget(metadata({ tenant: "other" })),
    { code: "ERR_PROFILE_MEMBERSHIP_FORBIDDEN" },
  );
  f.deactivate();
  await assert.rejects(registration.validateImportTarget(metadata()), {
    code: "ERR_PROFILE_MEMBERSHIP_FORBIDDEN",
  });
  const reads = f.calls.placement;
  for (const selection of [
    { schemaName: "address", operation: "saveAll" },
    { schemaName: "customer", operation: "updateAll" },
  ])
    assert.equal(
      await registration.validateImportTarget(metadata(selection)),
      true,
    );
  assert.equal(f.calls.placement, reads);
});

test("private admitted batch uses header placement without copying the administrative identity", async () => {
  const f = fixture();
  const request = {
    tenant: "t",
    authData: {
      loginId: "staff@example.invalid",
      entCode: "source",
      principalType: "human",
    },
    models: [{ code: "target", loginId: "target@example.invalid" }],
  };
  f.admissions.set(request, metadata());
  await f.owner.signUpAll(request);
  assert.equal(f.calls.save, 1);
  assert.equal(f.calls.decision, 1);
  assert.equal(request.enterprise, undefined);
  assert.equal(request.authData.entCode, "source");
  assert.ok(f.calls.placement >= 4);
});

test("copied request and body/header metadata cannot acquire private import placement", async () => {
  const f = fixture();
  const request = {
    tenant: "t",
    models: [{ loginId: "target@example.invalid" }],
  };
  f.admissions.set(request, metadata());
  let lookedUp = false;
  f.owner.get = async () => {
    lookedUp = true;
    return { result: [] };
  };
  await assert.rejects(
    f.owner.signUpAll({
      ...request,
      body: { enterpriseCode: "business", IMPORT: true },
      header: { options: metadata() },
    }),
    { code: "ERR_PROFILE_MEMBERSHIP_FORBIDDEN" },
  );
  assert.equal(lookedUp, false);
  assert.equal(f.calls.save, 0);
});

test("malformed admitted metadata fails before inventory or claims", async () => {
  const f = fixture();
  const request = {
    tenant: "t",
    models: [{ loginId: "target@example.invalid" }],
  };
  for (const value of [
    { ...metadata() },
    metadata({ schemaName: "employee" }),
    metadata({ operation: "saveAll" }),
    metadata({ tenant: "other" }),
    metadata({ IMPORT: true }),
  ]) {
    f.admissions.set(request, value);
    await assert.rejects(f.owner.signUpAll(request), {
      code: "ERR_PROFILE_MEMBERSHIP_FORBIDDEN",
    });
  }
  assert.equal(f.calls.save, 0);
  assert.equal(f.calls.decision, 0);
});

test("batch admission loss cannot fall back to signed actor enterprise", async () => {
  const f = fixture();
  const parent = { tenant: "t", authData: { entCode: "business" } };
  const child = { ...parent, model: { loginId: "target@example.invalid" } };
  f.admissions.set(parent, metadata());
  await registration.withRegistrationBatchPlacement(parent, async () => {
    await registration.withRegistrationPlacement(parent, child, async () => {
      f.admissions.delete(parent);
      await assert.rejects(registration.resolveRegistrationPlacement(child), {
        code: "ERR_PROFILE_MEMBERSHIP_FORBIDDEN",
      });
      await assert.rejects(registration.resolveRegistrationPlacement(parent), {
        code: "ERR_PROFILE_MEMBERSHIP_FORBIDDEN",
      });
    });
  });
  // Public mapped placement remains unchanged after the private callback lifetime.
  assert.deepEqual(await registration.resolveRegistrationPlacement(parent), {
    tenant: "t",
    enterpriseCode: "business",
  });
});

test("child cleanup occurs after callback failure and cloned children remain unadmitted", async () => {
  const f = fixture();
  const parent = { tenant: "t" },
    child = { tenant: "t" };
  f.admissions.set(parent, metadata());
  await assert.rejects(
    registration.withRegistrationPlacement(parent, child, async () => {
      assert.equal(
        (await registration.resolveRegistrationPlacement(child)).enterpriseCode,
        "business",
      );
      await assert.rejects(
        registration.resolveRegistrationPlacement({ ...child }),
        { code: "ERR_PROFILE_MEMBERSHIP_FORBIDDEN" },
      );
      throw new Error("fixture callback failure");
    }),
    /fixture callback failure/,
  );
  await assert.rejects(registration.resolveRegistrationPlacement(child), {
    code: "ERR_PROFILE_MEMBERSHIP_FORBIDDEN",
  });
});

test("fresh inactive tenant rejects even when the enterprise remains active", async () => {
  fixture();
  SERVICE.DefaultEnterpriseManagementService.retrieveEnterpriseForAccess =
    async () => ({
      tenantCode: "t",
      enterprise: {
        code: "business",
        active: true,
        tenant: { code: "t", active: false },
      },
    });
  await assert.rejects(registration.validateImportTarget(metadata()), {
    code: "ERR_PROFILE_MEMBERSHIP_FORBIDDEN",
  });
});

test("admitted import retains eligibility denial without a Customer write", async () => {
  const f = fixture();
  const request = {
    tenant: "t",
    models: [{ loginId: "target@example.invalid" }],
  };
  f.admissions.set(request, metadata());
  f.deny();
  await assert.rejects(f.owner.signUpAll(request), {
    code: "ERR_PROFILE_MEMBERSHIP_FORBIDDEN",
  });
  assert.equal(f.calls.save, 0);
  assert.equal(f.calls.decision, 1);
});

test("late placement loss during eligibility rejects before persistence", async () => {
  const f = fixture();
  const request = {
    tenant: "t",
    models: [{ loginId: "target@example.invalid" }],
  };
  f.admissions.set(request, metadata());
  SERVICE.DefaultFixtureDecisionService.enforce = async () => {
    f.deactivate();
    return { eligible: true, decisionId: "fixture-decision" };
  };
  await assert.rejects(f.owner.signUpAll(request), {
    code: "ERR_PROFILE_MEMBERSHIP_FORBIDDEN",
  });
  assert.equal(f.calls.save, 0);
});

test("changed live import metadata cannot retarget a pinned batch", async () => {
  const f = fixture();
  const parent = { tenant: "t", authData: { entCode: "business" } };
  f.admissions.set(parent, metadata());
  await registration.withRegistrationBatchPlacement(parent, async () => {
    f.admissions.set(parent, metadata({ enterpriseCode: "different" }));
    await assert.rejects(registration.resolveRegistrationPlacement(parent), {
      code: "ERR_PROFILE_MEMBERSHIP_FORBIDDEN",
    });
  });
  assert.equal(f.calls.save, 0);
});

test("selected metadata-owner override is supported without activating qualification flags", async () => {
  const f = fixture();
  const request = { tenant: "t" };
  f.admissions.set(request, metadata());
  const original = CONFIG.get;
  CONFIG.get = (key) =>
    key === "identityGovernance"
      ? {
          customerRegistration: {
            importPlacement: {
              metadataOwnerService: "DefaultCustomImportOwnerService",
            },
          },
        }
      : original(key);
  SERVICE.DefaultCustomImportOwnerService =
    SERVICE.DefaultModelImportProcessService;
  assert.deepEqual(await registration.resolveRegistrationPlacement(request), {
    tenant: "t",
    enterpriseCode: "business",
  });
  const defaults = require("../config/properties");
  assert.equal(
    defaults.data.dataReleases.targetValidators.profile,
    "DefaultCustomerRegistrationService",
  );
  assert.equal(defaults.profileCustomerParticipation.enabled, false);
  assert.equal(defaults.profileCustomerEligibility.enforcementQualified, false);
  assert.equal(
    defaults.enterpriseManagement.administrationConsent.enabled,
    false,
  );
});

test("preflight uses only configured eligibility readiness and requires literal true", async () => {
  const f = fixture();
  const owner = SERVICE.DefaultFixtureDecisionService;
  for (const result of [false, undefined, { ready: true }, "true"]) {
    owner.assertOnboardingReady = async () => result;
    await assert.rejects(registration.validateImportTarget(metadata()), {
      code: "ERR_PROFILE_ELIGIBILITY_OWNER",
    });
  }
  delete owner.assertOnboardingReady;
  await assert.rejects(registration.validateImportTarget(metadata()), {
    code: "ERR_PROFILE_ELIGIBILITY_OWNER",
  });
  assert.equal(f.calls.decision, 0);
  assert.equal(f.calls.save, 0);
});

test("preflight readiness errors contain only reviewed status codes, never provider details", async () => {
  fixture();
  SERVICE.DefaultFixtureDecisionService.assertOnboardingReady = async () => {
    const error = new Error("private provider configuration");
    error.code = "ERR_PROFILE_ELIGIBILITY_POLICY";
    throw error;
  };
  await assert.rejects(
    registration.validateImportTarget(metadata()),
    (error) => {
      assert.equal(error.code, "ERR_PROFILE_ELIGIBILITY_POLICY");
      assert.equal(error.message.includes("private"), false);
      return true;
    },
  );
  SERVICE.DefaultFixtureDecisionService.assertOnboardingReady = async () => {
    throw new Error("private unknown error");
  };
  await assert.rejects(registration.validateImportTarget(metadata()), {
    code: "ERR_PROFILE_ELIGIBILITY_OWNER",
  });
});

test("ordinary import preflight validates placement without optional eligibility collaborators", async () => {
  const f = fixture();
  const original = CONFIG.get;
  CONFIG.get = (key) =>
    key === "profileCustomerEligibility" ? { enabled: false } : original(key);
  delete SERVICE.DefaultFixtureDecisionService;
  assert.equal(await registration.validateImportTarget(metadata()), true);
  assert.equal(f.calls.placement, 1);
  assert.equal(f.calls.decision, 0);
  f.deactivate();
  await assert.rejects(registration.validateImportTarget(metadata()), {
    code: "ERR_PROFILE_MEMBERSHIP_FORBIDDEN",
  });
});

test("ordinary admitted import registers its target without eligibility or administrative identity copying", async () => {
  const f = fixture();
  const original = CONFIG.get;
  CONFIG.get = (key) =>
    key === "profileCustomerEligibility" ? { enabled: false } : original(key);
  delete SERVICE.DefaultFixtureDecisionService;
  delete SERVICE.DefaultCustomerEligibilityDecisionGovernanceService;
  const request = {
    tenant: "t",
    authData: { entCode: "source", principalType: "human" },
    models: [{ code: "target", loginId: "target@example.invalid" }],
  };
  f.admissions.set(request, metadata());
  await f.owner.signUpAll(request);
  assert.equal(f.calls.save, 1);
  assert.equal(f.calls.decision, 0);
  assert.equal(request.authData.entCode, "source");
});
