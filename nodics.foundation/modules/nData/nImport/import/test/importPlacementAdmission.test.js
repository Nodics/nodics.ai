/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module import/test/importPlacementAdmission @description Offline source-provenance, owner revalidation and exact awaited request lifetime contracts. @layer test @owner import */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const crypto = require("node:crypto");
const releasePorts = require("./helpers/releaseExecution");
const model = require("../src/service/process/model/defaultModelImportProcessService");
const initializer = require("../src/service/system/defaultSystemDataImportInitializerService");

/** Uses real release discovery with synthetic local source and no persistence. */
function fixture(t, enterpriseCode = "approved-enterprise", admit = true) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "nodics-placement-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const file = "sample-v001/headers/customerHeader.js";
  const header = {
    options: {
      enabled: true,
      schemaName: "customer",
      operation: "signUpAll",
      dataFilePrefix: "customers",
      ...(enterpriseCode === undefined ? {} : { enterpriseCode }),
    },
  };
  fs.mkdirSync(path.dirname(path.join(root, "data", file)), {
    recursive: true,
  });
  const content =
    "module.exports = " +
    JSON.stringify({ profile: { customers: header } }) +
    ";\n";
  fs.writeFileSync(path.join(root, "data", file), content);
  fs.writeFileSync(
    path.join(root, "data/manifest.json"),
    JSON.stringify({
      contractVersion: 2,
      module: "example",
      sections: {
        customers: {
          kind: "DATA_RELEASE",
          dataType: "sample",
          sourceRoot: "sample-v001",
          version: "1.0.0",
          displayName: "Example",
          description: "Synthetic fixture",
          owningDomain: "profile",
          lifecycle: "REFERENCE",
          destinationRole: "PLATFORM",
          environmentScope: ["LOCAL"],
          sensitivity: "INTERNAL",
          versioningPolicy: "NONE",
          publicationPolicy: "NONE",
          initialPublicationPolicy: "NONE",
          removalPolicy: "RETAIN",
          files: {
            [file]: crypto.createHash("sha256").update(content).digest("hex"),
          },
        },
      },
    }),
  );
  const ports = releasePorts({
    modules: { example: { name: "example", path: root } },
    runtimeRole: "PLATFORM",
  });
  global.CLASSES = {
    DataImportError: class extends Error {
      constructor(code, message) {
        super(message);
        this.code = code;
      }
    },
  };
  global.UTILS = { generateUniqueCode: () => "synthetic" };
  CONFIG.get("data").dataReleases.targetValidators = {
    profile: "PlacementOwner",
  };
  SERVICE.PlacementOwner = { validateImportTarget: async () => true };
  SERVICE.DefaultDataReleaseService = ports.service;
  const release = ports.service.discoverReleases("sample")[0];
  assert.equal(release.invalidManifest, undefined);
  const plan = {
    tenant: "fixture-tenant",
    dataType: "sample",
    releases: [release],
  };
  const request = admit
    ? ports.service.createImportRequest({}, plan, false)
    : undefined;
  if (request) initializer.initImportRun(request);
  const dispatch = {
    tenant: plan.tenant,
    importRun: request?.importRun,
    header: { options: { ...header.options, moduleName: "profile" } },
  };
  return { ...ports, root, release, plan, request, dispatch };
}

test("exact awaited schema request sees frozen metadata, clones/body markers do not; scope clears on success", async (t) => {
  const f = fixture(t);
  const operation = {
    tenant: f.plan.tenant,
    authData: { userGroups: [] },
    models: [],
  };
  let finish;
  const pending = model.executeAdmittedSchemaOperation(f.dispatch, operation, {
    signUpAll: async (exact) => {
      assert.equal(exact, operation);
      const metadata = model.readAdmittedOperationMetadata(exact);
      assert(Object.isFrozen(metadata));
      assert.deepEqual(metadata, {
        moduleName: "profile",
        schemaName: "customer",
        operation: "signUpAll",
        tenant: "fixture-tenant",
        enterpriseCode: "approved-enterprise",
      });
      assert.equal(
        model.readAdmittedOperationMetadata({ ...exact }),
        undefined,
      );
      assert.equal(
        model.readAdmittedOperationMetadata({ body: metadata, IMPORT: true }),
        undefined,
      );
      await new Promise((resolve) => {
        finish = resolve;
      });
      return { result: [] };
    },
  });
  await new Promise((resolve) => setImmediate(resolve));
  assert(model.readAdmittedOperationMetadata(operation));
  finish();
  await pending;
  assert.equal(model.readAdmittedOperationMetadata(operation), undefined);
});

test("owner missing, negative, ambiguous, revoked or throwing never dispatches; rejection clears admission", async (t) => {
  const f = fixture(t);
  let writes = 0;
  const operation = {};
  const schema = {
    signUpAll: async () => {
      writes++;
      throw new Error("synthetic failure");
    },
  };
  delete SERVICE.PlacementOwner;
  await assert.rejects(
    model.executeAdmittedSchemaOperation(f.dispatch, operation, schema),
    /owner did not admit/,
  );
  for (const result of [false, undefined, { ready: true }]) {
    SERVICE.PlacementOwner = { validateImportTarget: async () => result };
    await assert.rejects(
      model.executeAdmittedSchemaOperation(f.dispatch, operation, schema),
      /owner did not admit/,
    );
  }
  SERVICE.PlacementOwner = {
    validateImportTarget: async () => {
      throw new Error("synthetic owner failure");
    },
  };
  await assert.rejects(
    model.executeAdmittedSchemaOperation(f.dispatch, operation, schema),
  );
  assert.equal(writes, 0);
  let active = true;
  SERVICE.PlacementOwner = { validateImportTarget: async () => active };
  await f.service.validateReleaseTargets(f.release, f.plan.tenant);
  active = false;
  await assert.rejects(
    model.executeAdmittedSchemaOperation(f.dispatch, operation, schema),
  );
  assert.equal(writes, 0);
  active = true;
  await assert.rejects(
    model.executeAdmittedSchemaOperation(f.dispatch, operation, schema),
    /synthetic failure/,
  );
  assert.equal(writes, 1);
  assert.equal(model.readAdmittedOperationMetadata(operation), undefined);
});

test("copied runs, modified coordinates and expired release runs never acquire placement", async (t) => {
  const f = fixture(t);
  for (const dispatch of [
    { ...f.dispatch, importRun: structuredClone(f.dispatch.importRun) },
    { ...f.dispatch, tenant: "other" },
    {
      ...f.dispatch,
      header: {
        options: { ...f.dispatch.header.options, enterpriseCode: "other" },
      },
    },
    {
      ...f.dispatch,
      importRun: { dataReleases: f.request.dataReleasePlan },
      IMPORT: true,
    },
  ])
    assert.equal(f.service.readTrustedOperationMetadata(dispatch), undefined);
  SERVICE.DefaultImportService.importSampleData = async () => {
    throw new Error("synthetic stop");
  };
  await assert.rejects(
    f.service.invokeImport(f.request, "sample"),
    /synthetic stop/,
  );
  assert.equal(f.service.readTrustedOperationMetadata(f.dispatch), undefined);
  assert.equal(f.service.bindOperationMetadataRun(f.request), false);
});

test("forged or checksum-drifted plans cannot mint source placement; ordinary unplaced operations remain unchanged", async (t) => {
  const f = fixture(t);
  const request = f.service.createImportRequest(
    {},
    { ...f.plan, releases: [{ ...f.release, checksum: "forged" }] },
    false,
  );
  initializer.initImportRun(request);
  assert.equal(
    f.service.readTrustedOperationMetadata({
      ...f.dispatch,
      importRun: request.importRun,
    }),
    undefined,
  );
  const schema = {
    saveAll: async (exact) => {
      assert.equal(model.readAdmittedOperationMetadata(exact), undefined);
      return "unchanged";
    },
  };
  assert.equal(
    await model.executeAdmittedSchemaOperation(
      { header: { options: { operation: "saveAll" } } },
      {},
      schema,
    ),
    "unchanged",
  );
  await assert.rejects(
    model.executeAdmittedSchemaOperation(
      { ...f.dispatch, importRun: request.importRun },
      {},
      { signUpAll: async () => assert.fail("must not dispatch") },
    ),
    /provenance/,
  );
});

test("invalid explicit enterprise and absent configured placement owner fail in preflight", async (t) => {
  const f = fixture(t, "bad enterprise", false);
  await assert.rejects(
    f.service.validateReleaseTargets(f.release, f.plan.tenant),
    /code is invalid/,
  );
  assert.throws(
    () => f.service.createImportRequest({}, f.plan, false),
    /code is invalid/,
  );
  const valid = fixture(t);
  CONFIG.get("data").dataReleases.targetValidators = {};
  await assert.rejects(
    valid.service.validateReleaseTargets(valid.release, valid.plan.tenant),
    /validator is unavailable/,
  );
});

test("actual local generated dispatch admits placement without actor or enterprise body fields", async (t) => {
  const f = fixture(t);
  const rows = [{ code: "synthetic-customer" }];
  const generated = {
    signUpAll: async (exact) => {
      assert.equal(exact.tenant, f.plan.tenant);
      assert.equal(exact.enterprise, undefined);
      assert.deepEqual(exact.authData, { userGroups: undefined });
      assert.equal(exact.IMPORT, undefined);
      assert.equal(
        model.readAdmittedOperationMetadata(exact).enterpriseCode,
        "approved-enterprise",
      );
      return { result: rows };
    },
  };
  const owner = {
    ...model,
    normalizeModelsForSchema: (_header, value) => value,
    ensureLocalSchemaService: async () => generated,
    reconcileContentPackVersions: async (_request, _schema, value) => value,
    reconcileManagedRevisions: async (_request, _schema, value) => value,
    isGovernedContentPackRun: () => false,
  };
  assert.deepEqual(await owner.insertLocalSchemaModel(f.dispatch, rows), rows);
});

test("release-created run ignores inbound run identity, binds once and clears original run even if replaced", async (t) => {
  const f = fixture(t);
  const untrustedRun = {};
  const request = f.service.createImportRequest(
    { importRun: untrustedRun },
    f.plan,
    false,
  );
  assert.equal(request.importRun, undefined);
  initializer.initImportRun(request);
  assert.notEqual(request.importRun, untrustedRun);
  assert.equal(f.service.bindOperationMetadataRun(request), false);
  const dispatch = { ...f.dispatch, importRun: request.importRun };
  SERVICE.DefaultImportService.importSampleData = async (exact) => {
    assert(f.service.readTrustedOperationMetadata(dispatch));
    exact.importRun = {};
    return {};
  };
  await f.service.invokeImport(request, "sample");
  assert.equal(f.service.readTrustedOperationMetadata(dispatch), undefined);
});

test("placement cannot cross the remote import transport by serialized header", async (t) => {
  const f = fixture(t);
  await assert.rejects(
    model.insertRemoteModel(f.dispatch, []),
    /local generated owner admission/,
  );
});

test("actual nImport and Profile registration exports compose private child placement and retain eligibility denial", async (t) => {
  const f = fixture(t);
  const registration = require("../../../../../../nodics.platform/modules/profile/src/service/customer/defaultCustomerRegistrationService");
  const customer = require("../../../../../../nodics.platform/modules/profile/src/service/customer/defaultCustomerService");
  CLASSES.NodicsError = class extends Error {
    constructor(error, message, fallback) {
      super(message || (error instanceof Error ? error.message : error));
      this.code = error instanceof Error ? error.code || fallback : error;
    }
  };
  const get = CONFIG.get;
  CONFIG.get = (key) =>
    key === "identityGovernance"
      ? {
          customerRegistration: {
            importPlacement: {
              metadataOwnerService: "DefaultModelImportProcessService",
            },
          },
        }
      : key === "profileCustomerParticipation"
        ? { eligibilityService: "DefaultFixtureEligibilityService" }
        : get(key);
  CONFIG.get("data").dataReleases.targetValidators.profile =
    "DefaultCustomerRegistrationService";
  SERVICE.DefaultModelImportProcessService = model;
  SERVICE.DefaultCustomerRegistrationService = registration;
  let active = true,
    eligible = true,
    saved = 0,
    ownerReads = 0,
    decisions = 0;
  SERVICE.DefaultEnterpriseManagementService = {
    retrieveEnterpriseForAccess: async (code) => {
      ownerReads++;
      assert.equal(code, "approved-enterprise");
      return {
        tenantCode: f.plan.tenant,
        enterprise: { code, active, tenant: { code: f.plan.tenant, active } },
      };
    },
  };
  SERVICE.DefaultFixtureEligibilityService = {
    assertOnboardingReady: async (context) => {
      assert(Object.isFrozen(context));
      assert.deepEqual(context, {
        tenant: f.plan.tenant,
        enterpriseCode: "approved-enterprise",
      });
      return true;
    },
    enforce: async (input, action, subject) => {
      decisions++;
      assert.equal(action, "ONBOARDING");
      assert.equal(input.model, undefined);
      assert.equal(subject.subjectCode, "synthetic-customer@example.invalid");
      assert.equal(subject.enterpriseCode, "approved-enterprise");
      return { eligible, decisionId: "synthetic-offline-decision" };
    },
  };
  SERVICE.DefaultIdentityGovernanceService = {
    getSystemAuthData: () => ({ isSystem: true }),
  };
  SERVICE.DefaultCustomerEligibilityDecisionGovernanceService = {
    withRegistrationDecision: async (input, decision, operation) => {
      assert.equal(decision.eligible, true);
      return operation(input);
    },
  };
  const generated = {
    ...customer,
    get: async () => ({ result: [] }),
    save: async () => {
      saved++;
      return { result: [] };
    },
  };
  let child;
  SERVICE.DefaultPipelineService = {
    start: async (name, exact) => {
      assert.equal(name, "customerRegistrationHandlerPipeline");
      child = exact;
      assert.equal(model.readAdmittedOperationMetadata(child), undefined);
      assert.deepEqual(await registration.resolveRegistrationPlacement(child), {
        tenant: f.plan.tenant,
        enterpriseCode: "approved-enterprise",
      });
      await assert.rejects(
        registration.resolveRegistrationPlacement({ ...child }),
        { code: "ERR_PROFILE_MEMBERSHIP_FORBIDDEN" },
      );
      return new Promise((resolve, reject) =>
        registration.createCustomer(
          exact,
          {},
          {
            nextSuccess: (_input, response) => resolve(response.success),
            error: (_input, _response, error) => reject(error),
          },
        ),
      );
    },
  };
  const operation = () => ({
    tenant: f.plan.tenant,
    authData: { userGroups: [] },
    models: [
      {
        code: "synthetic-customer",
        loginId: "synthetic-customer@example.invalid",
      },
    ],
  });
  await f.service.validateReleaseTargets(f.release, f.plan.tenant);
  const exact = operation();
  assert.deepEqual(
    await model.executeAdmittedSchemaOperation(f.dispatch, exact, generated),
    { result: [{ code: "synthetic-customer" }] },
  );
  assert.equal(saved, 1);
  assert(
    ownerReads >= 5,
    "Preflight, write, batch, child and registration must read fresh placement",
  );
  assert.equal(decisions, 1);
  assert.equal(model.readAdmittedOperationMetadata(exact), undefined);
  await assert.rejects(registration.resolveRegistrationPlacement(child), {
    code: "ERR_PROFILE_MEMBERSHIP_FORBIDDEN",
  });
  const ready = SERVICE.DefaultFixtureEligibilityService.assertOnboardingReady;
  SERVICE.DefaultFixtureEligibilityService.assertOnboardingReady = async () => {
    throw new CLASSES.NodicsError(
      "ERR_PROFILE_ELIGIBILITY_POLICY",
      "synthetic-private-owner-detail",
    );
  };
  await assert.rejects(
    model.executeAdmittedSchemaOperation(f.dispatch, operation(), generated),
    (error) => {
      assert.deepEqual(error.metadata, {
        targetReadinessCode: "ERR_PROFILE_ELIGIBILITY_POLICY",
      });
      assert.equal(error.code, "ERR_IMP_00003");
      assert(!error.message.includes("synthetic-private-owner-detail"));
      return true;
    },
  );
  assert.equal(saved, 1);
  assert.equal(
    decisions,
    1,
    "Unavailable policy must fail before customer eligibility execution",
  );
  SERVICE.DefaultFixtureEligibilityService.assertOnboardingReady = ready;
  eligible = false;
  await assert.rejects(
    model.executeAdmittedSchemaOperation(f.dispatch, operation(), generated),
    { code: "ERR_PROFILE_MEMBERSHIP_FORBIDDEN" },
  );
  assert.equal(
    saved,
    1,
    "Private import admission must not bypass eligibility denial",
  );
  active = false;
  await assert.rejects(
    model.executeAdmittedSchemaOperation(f.dispatch, operation(), generated),
    /not admitted for the selected tenant/,
  );
  assert.equal(saved, 1);
});

test("reviewed readiness codes survive preflight and dispatch without owner text, stack or metadata", async (t) => {
  const f = fixture(t);
  for (const code of [
    "ERR_PROFILE_MEMBERSHIP_UNAVAILABLE",
    "ERR_PROFILE_MEMBERSHIP_FORBIDDEN",
    "ERR_PROFILE_ELIGIBILITY_OWNER",
    "ERR_PROFILE_ELIGIBILITY_CONFIGURATION",
    "ERR_PROFILE_ELIGIBILITY_COLLABORATORS",
    "ERR_PROFILE_ELIGIBILITY_POLICY",
    "ERR_PROFILE_ELIGIBILITY_REGISTRY",
    "ERR_PROFILE_ELIGIBILITY_AUDIT",
    "ERR_UNREVIEWED",
  ]) {
    const raw = Object.assign(new Error("synthetic-private-owner-detail"), {
      code,
      metadata: { private: "synthetic-private-owner-detail" },
    });
    SERVICE.PlacementOwner = {
      validateImportTarget: async () => {
        throw raw;
      },
    };
    for (const invoke of [
      () => f.service.validateReleaseTargets(f.release, f.plan.tenant),
      () =>
        model.executeAdmittedSchemaOperation(
          f.dispatch,
          {},
          { signUpAll: () => assert.fail("must refuse before dispatch") },
        ),
    ])
      await assert.rejects(invoke(), (error) => {
        assert.equal(error.code, "ERR_IMP_00003");
        assert(!error.message.includes("synthetic-private-owner-detail"));
        assert(!error.stack.includes("synthetic-private-owner-detail"));
        assert.deepEqual(
          error.metadata,
          code === "ERR_UNREVIEWED" ? undefined : { targetReadinessCode: code },
        );
        return true;
      });
  }
});
