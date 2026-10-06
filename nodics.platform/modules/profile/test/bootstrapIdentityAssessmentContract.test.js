/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/**
 * @module profile/test/bootstrapIdentityAssessmentContract
 * @description Source-backed read-only assessment review fixtures; not installed qualification or browser acceptance.
 * @layer test
 * @owner profile
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const path = require("node:path");
const source = require("../src/service/identity/defaultProfileBootstrapIdentityAssessmentService");
const migration = require("../src/service/identity/defaultIdentityGovernanceMigrationService");
const management = require("../src/service/enterprise/defaultEnterpriseManagementService");
const foundation = "../../../../nodics.foundation/modules/";
const releases = require(
  foundation +
    "nData/nImport/import/src/service/release/defaultDataReleaseService",
);
const importUtility = require(
  foundation +
    "nData/nImport/import/src/service/import/defaultImportUtilityService",
);
const initializer = require(
  foundation +
    "nData/nImport/import/src/service/system/defaultSystemDataImportInitializerService",
);
const jsOwner = require(
  foundation +
    "nData/nImport/jsImport/src/service/init/defaultJsFileDataProcessService",
);
const security = require(
  foundation + "nAuth/src/service/security/defaultAuthSecurityService",
);
const properties = require("../config/properties");

/** Installs source owners plus isolated read-only provider doubles; actual Init files are never modified. @returns {Promise<Object>} Fixture. */
async function fixture() {
  const configuration = {
    defaultTenant: "default",
    defaultEnterprise: "platform",
    runtimeRole: "PLATFORM",
    environment: { class: "LOCAL" },
    enterpriseManagement: {},
    authSecurity: structuredClone(
      require(foundation + "nAuth/config/properties").authSecurity,
    ),
    bootstrapIdentity: {
      source: "environment",
      adminPassword: crypto.randomBytes(32).toString("hex"),
      servicePassword: crypto.randomBytes(32).toString("hex"),
      serviceApiKey: crypto.randomBytes(32).toString("hex"),
    },
    identityGovernance: {
      migration: {
        assessment: {
          ...properties.identityGovernance.migration.assessment,
          enabled: true,
          bootstrapReview: {
            ...structuredClone(
              properties.identityGovernance.migration.assessment
                .bootstrapReview,
            ),
            enabled: true,
          },
        },
      },
    },
    data: { dataReleases: { destinationEnforced: true } },
  };
  configuration.authSecurity.jwt.secret = crypto
    .randomBytes(64)
    .toString("hex");
  global.CONFIG = { get: (key) => configuration[key] };
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code) {
        super(code);
        this.code = code;
      }
    },
  };
  global.UTILS = {
    ...require(foundation + "nCommon/src/utils/utils"),
    isBlank: (value) => !value,
  };
  const moduleOwner = {
    name: "profile",
    path: path.resolve(__dirname, ".."),
    index: 1,
  };
  global.NODICS = {
    getActiveModules: () => ["profile"],
    getActiveTenants: () => ["default"],
    getRawModule: (name) => (name === "profile" ? moduleOwner : undefined),
    getSelectedEnvironmentName: () => "fixtureLocal",
    getEnvironmentName: () => "fixture.project",
    getServerName: () => "platformServer",
    isModuleActive: (name) => name === "profile",
  };
  const owner = { ...source },
    migrationOwner = { ...migration };
  const installations = new Map();
  const writes = () =>
    assert.fail(
      "Assessment/review must never mutate identities, credentials, indexes or import data; explicit audit is separate",
    );
  global.SERVICE = {
    DefaultIdentityGovernanceMigrationService: migrationOwner,
    DefaultProfileBootstrapIdentityAssessmentService: owner,
    DefaultEnterpriseManagementService: { ...management },
    DefaultIdentityGovernanceService: {
      getSystemAuthData: () => ({ isSystem: true }),
    },
    DefaultDataReleaseService: { ...releases },
    DefaultImportUtilityService: { ...importUtility },
    DefaultSystemDataImportInitializerService: {
      ...initializer,
      LOG: { debug() {} },
    },
    DefaultJsFileDataProcessService: { ...jsOwner },
    DefaultFileDataImportProcessService: {
      ...require(
        foundation +
          "nData/nImport/import/src/service/process/file/defaultFileDataImportProcessService",
      ),
      LOG: { warn() {} },
    },
    DefaultAuthSecurityService: security,
    DefaultPrincipalSecurityStampService: { validate: async () => true },
    DefaultUserStateService: { findUserState: async () => ({ locked: false }) },
    DefaultAuthAuditService: {
      record: async (event) => structuredClone(event),
    },
    DefaultDataInstallationService: {
      get: async (request) => ({
        code: "SUC_DBS_00000",
        result: installations.has(request.query.code)
          ? [structuredClone(installations.get(request.query.code))]
          : [],
      }),
      save: writes,
      update: writes,
      delete: writes,
    },
    DefaultPipelineService: { start: writes },
  };
  const release = SERVICE.DefaultDataReleaseService.discoverReleases(
    "init",
  ).find((r) => r.releaseCode === "profile:init-v001");
  assert.equal(release.invalidManifest, undefined);
  const code = SERVICE.DefaultDataReleaseService.installationCode(
    "default",
    release,
  );
  installations.set(code, {
    code,
    active: true,
    status: "CURRENT",
    version: release.version,
    checksum: release.checksum,
    releaseCode: release.releaseCode,
    environment: "fixtureLocal",
  });
  const expected = await owner.sources("default");
  const partition = {
    tenant: "default",
    employees: [],
    customers: [],
    passwords: [],
    groups: [],
  };
  for (const [index, row] of expected.expected.entries()) {
    const credential = "fixture-password-" + index;
    partition[row.kind].push({
      ...row,
      _id: "fixture-principal-" + index,
      authVersion: 1,
      password: credential,
    });
    partition.passwords.push({
      _id: credential,
      loginId: row.loginId,
      active: true,
    });
  }
  const state = {
    partitions: [partition],
    assignments: [],
    enterprises: [
      {
        _id: "fixture-enterprise",
        code: "platform",
        active: true,
        tenant: "default",
      },
    ],
  };
  migrationOwner.assessmentState = async () => structuredClone(state);
  const report = {
    findings: expected.expected.map(() => ({
      code: "RSN_PROFILE_IDENTITY_NON_EMAIL_LOGIN_REVIEW",
      references: ["a".repeat(64)],
    })),
    reviewRequired: true,
  };
  const actor = partition.employees.find((r) => r.active === true);
  const request = {
    tenant: "default",
    identityMigration: {},
    authData: {
      tokenType: "access",
      principalType: "human",
      authenticationMethod: "PASSWORD",
      authVersion: 1,
      loginId: actor.loginId,
      tenant: "default",
      entCode: "platform",
      userGroups: actor.userGroups,
      permissions: ["identity.migration.preview"],
    },
  };
  return {
    owner,
    migrationOwner,
    configuration,
    state,
    report,
    request,
    expected,
    installations,
  };
}

test("forward Init authority receives human/guest identities while dynamic tenants receive only service identities and groups", async () => {
  const f = await fixture();
  const manifest = require("../data/manifest.json");
  assert.equal(manifest.sections["init-v001"].version, "0.0.3");
  assert.equal(manifest.sections["init-v001"].sourceRoot, "init-v009");
  assert.equal(
    manifest.retainedRoots["init-v001"].sections["init-v001"].version,
    "0.0.0",
  );
  assert.equal(
    manifest.retainedRoots["init-v007"].sections["init-v001"].version,
    "0.0.1",
  );
  releases.validateRetainedRoots(path.resolve(__dirname, "../data"), manifest);
  const headerPath =
    require.resolve("../data/init-v009/headers/user/defaultUsersHeader");
  delete require.cache[headerPath];
  const headers = require(headerPath).profile;
  const selector = SERVICE.DefaultFileDataImportProcessService;
  NODICS.getActiveTenants = () => ["default", "dynamic"];
  const humans = Object.values(
    require("../data/init-v009/records/user/defaultEmployeeData"),
  );
  const services = Object.values(
    require("../data/init-v009/records/user/defaultServiceEmployeeData"),
  );
  const guests = Object.values(
    require("../data/init-v009/records/user/defaultCutomerData"),
  );
  assert.equal(humans.length, 5);
  assert(humans.every((r) => r.principalType === "human"));
  assert.equal(services.length, 1);
  assert(services.every((r) => r.principalType === "service"));
  assert.equal(guests.length, 1);
  for (const header of [headers.defaultEmployee, headers.defaultCustomer]) {
    assert.deepEqual(
      selector.resolveTargetTenants({ tenant: "default" }, header),
      ["default"],
    );
    assert.deepEqual(
      selector.resolveTargetTenants({ tenant: "dynamic" }, header),
      [],
    );
  }
  const groups =
    require("../data/init-v009/headers/groups/defaultUserGroupsHeader").profile
      .defaultUserGroups;
  for (const header of [headers.defaultServiceEmployee, groups]) {
    assert.deepEqual(
      selector.resolveTargetTenants({ tenant: "default" }, header),
      ["default"],
    );
    assert.deepEqual(
      selector.resolveTargetTenants({ tenant: "dynamic" }, header),
      ["dynamic"],
    );
  }
  assert.equal((await f.owner.sources("default")).expected.length, 6);
  f.configuration.defaultTenant = "custom-authority";
  delete require.cache[headerPath];
  const custom = require(headerPath).profile;
  assert.deepEqual(custom.defaultEmployee.options.tenants, [
    "custom-authority",
  ]);
  assert.deepEqual(custom.defaultCustomer.options.tenants, [
    "custom-authority",
  ]);
  NODICS.getActiveTenants = () => ["custom-authority", "dynamic"];
  for (const header of [custom.defaultEmployee, custom.defaultCustomer]) {
    assert.deepEqual(
      selector.resolveTargetTenants({ tenant: "custom-authority" }, header),
      ["custom-authority"],
    );
    assert.deepEqual(
      selector.resolveTargetTenants({ tenant: "dynamic" }, header),
      [],
    );
  }
});

test("forward Init group snapshot preserves the final permissions of already-current later releases", () => {
  const baseline = require("../data/init-v001/records/groups/defaultBootstrapUserGroupsData");
  const forward = require("../data/init-v008/records/groups/defaultBootstrapUserGroupsData");
  const historical = [
    require("../data/init-v002/records/groups/runtimeConfigurationUserGroupsData"),
    require("../data/init-v003/records/groups/runtimeConfigurationUpdateUserGroupsData"),
    require("../data/init-v004/records/groups/serviceAccountCircaUserGroupsData"),
    require("../data/init-v005/records/groups/backofficeCircaUserGroupsData"),
  ];
  const installed = new Map(
    Object.values(baseline).map((group) => [group.code, group]),
  );
  for (const release of historical) {
    for (const group of Object.values(release))
      installed.set(group.code, group);
  }
  const upgraded = new Map(installed);
  for (const group of Object.values(forward)) upgraded.set(group.code, group);
  for (const [code, expected] of installed) {
    const actual = upgraded.get(code);
    assert.deepEqual(
      { ...actual, permissions: [...(actual.permissions || [])].sort() },
      { ...expected, permissions: [...(expected.permissions || [])].sort() },
      "Retained upgrade must not roll back the effective group: " + code,
    );
  }
  assert.equal(upgraded.size, installed.size);
  assert(
    !upgraded
      .get("runtimeConfigViewerUserGroup")
      .permissions.includes("backoffice.registry.view"),
  );
  assert(
    upgraded
      .get("adminGroup")
      .permissions.includes("backoffice.functionalModule.activate"),
  );
});

test("actual layered Init header preparation respects replacement tenant selectors without broadening request scope", async () => {
  await fixture();
  const fs = require("node:fs"),
    os = require("node:os");
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), "profile-init-selector-"),
  );
  const customPath = path.join(directory, "defaultUsersHeader.js");
  try {
    fs.writeFileSync(
      customPath,
      "module.exports = {profile:{defaultEmployee:{options:{tenants:['custom-approved']}}}};\n",
    );
    const request = {
      data: {
        headerFiles: {
          users: [
            require.resolve("../data/init-v009/headers/user/defaultUsersHeader"),
            customPath,
          ],
        },
      },
    };
    const owner = {
      ...initializer,
      LOG: { debug() {} },
      getHeaderReleaseRoot: () => "fixture-layer",
    };
    owner.buildHeaderInstances(request, {}, { nextSuccess() {} });
    const header = request.data.headers["profile:defaultEmployee"];
    assert.deepEqual(header.options.tenants, ["custom-approved"]);
    NODICS.getActiveTenants = () => ["default", "dynamic", "custom-approved"];
    const selector = SERVICE.DefaultFileDataImportProcessService;
    assert.deepEqual(
      selector.resolveTargetTenants({ tenant: "default" }, header),
      [],
    );
    assert.deepEqual(
      selector.resolveTargetTenants({ tenant: "dynamic" }, header),
      [],
    );
    assert.deepEqual(
      selector.resolveTargetTenants({ tenant: "custom-approved" }, header),
      ["custom-approved"],
    );
    assert.equal(
      request.data.headers["profile:defaultServiceEmployee"].options.tenants,
      undefined,
    );
  } finally {
    delete require.cache[customPath];
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test("bootstrap source review uses finalized header scope and refuses missing tenant selector ownership", async () => {
  const f = await fixture();
  const prepare =
    SERVICE.DefaultSystemDataImportInitializerService.buildHeaderInstances;
  SERVICE.DefaultSystemDataImportInitializerService.buildHeaderInstances =
    function (...args) {
      prepare.apply(this, args);
      for (const header of Object.values(args[0].data.headers)) {
        if (["employee", "customer"].includes(header.options.schemaName))
          header.options.tenants = ["dynamic"];
      }
    };
  await assert.rejects(f.owner.sources("default"));
  SERVICE.DefaultSystemDataImportInitializerService.buildHeaderInstances =
    prepare;
  delete SERVICE.DefaultFileDataImportProcessService;
  await assert.rejects(f.owner.sources("default"));
});

test("project logical init-v001 contributions still merge with forward framework sourceRoot and service additions use the split dataset", async () => {
  await fixture();
  const fs = require("node:fs"),
    os = require("node:os");
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), "profile-forward-layer-"),
  );
  try {
    const files = {
      "init-v001/headers/user/defaultUsersHeader.js":
        "module.exports = {profile:{defaultEmployee:{options:{tenants:['custom-approved']}},defaultServiceEmployee:{options:{enabled:true}}}};",
      "init-v001/records/user/defaultEmployeeData.js":
        "module.exports = {record6:{code:'customHuman',loginId:'customHuman',active:false,principalType:'human',userGroups:['customerUserGroup']}};",
      "init-v001/records/user/defaultServiceEmployeeData.js":
        "module.exports = {customService:{code:'customService',loginId:'customService',active:true,principalType:'service',userGroups:['serviceAccountUserGroup']}};",
    };
    for (const [name, bytes] of Object.entries(files)) {
      const file = path.join(directory, "data", name);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, bytes);
    }
    const originalModule = NODICS.getRawModule;
    NODICS.getRawModule = (name) =>
      name === "fixture.project"
        ? { name, path: directory, index: 2 }
        : originalModule(name);
    const base = SERVICE.DefaultDataReleaseService.discoverReleases(
      "init",
    ).find((r) => r.releaseCode === "profile:init-v001");
    const plan = [
      base,
      {
        moduleName: "fixture.project",
        releaseCode: "fixture.project:init-v001",
        dataType: "init",
        sourceRoot: "init-v001",
        declaredFiles: Object.keys(files),
      },
    ];
    const modules = ["profile", "fixture.project"];
    const request = {
      inputPath: { dataType: "init" },
      dataReleasePlan: plan,
      data: {
        headerFiles: await importUtility.getSystemDataHeaders(
          modules,
          "init",
          plan,
        ),
        dataFiles: await importUtility.getSystemDataFiles(
          modules,
          "init",
          plan,
        ),
      },
    };
    const prep = SERVICE.DefaultSystemDataImportInitializerService;
    const next = { nextSuccess() {} };
    prep.resolveFileType(request, {}, next);
    prep.buildHeaderInstances(request, {}, next);
    prep.assignDataFilesToHeader(request, {}, next);
    const humanHeader = request.data.headers["profile:defaultEmployee"];
    const serviceHeader =
      request.data.headers["profile:defaultServiceEmployee"];
    assert.deepEqual(humanHeader.options.tenants, ["custom-approved"]);
    const read = async (header) => {
      const dataset = Object.values(header.dataFiles);
      assert.equal(dataset.length, 1);
      return jsOwner.handleFiles({}, {}, dataset[0].list);
    };
    const humans = Object.values(await read(humanHeader));
    const services = Object.values(await read(serviceHeader));
    assert.equal(humans.length, 6);
    assert(humans.some((r) => r.code === "customHuman"));
    assert(humans.every((r) => r.principalType === "human"));
    assert.equal(services.length, 2);
    assert(services.some((r) => r.code === "customService"));
    assert(services.every((r) => r.principalType === "service"));
    NODICS.getActiveTenants = () => ["default", "dynamic", "custom-approved"];
    const selector = SERVICE.DefaultFileDataImportProcessService;
    assert.deepEqual(
      selector.resolveTargetTenants({ tenant: "custom-approved" }, humanHeader),
      ["custom-approved"],
    );
    assert.deepEqual(
      selector.resolveTargetTenants({ tenant: "dynamic" }, humanHeader),
      [],
    );
    assert.deepEqual(
      selector.resolveTargetTenants({ tenant: "dynamic" }, serviceHeader),
      ["dynamic"],
    );
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test("startup owner admits an explicit forward Init version but still rejects changed checksum at the same installed version", async () => {
  const f = await fixture();
  const release = SERVICE.DefaultDataReleaseService.discoverReleases(
    "init",
  ).find((r) => r.releaseCode === "profile:init-v001");
  let executions = 0;
  const state = {
    ...release,
    installedVersion: "0.0.0",
    installedChecksum: "retained-prior-checksum",
    status: "AVAILABLE",
  };
  const owner = {
    ...releases,
    preparePlan: async () => ({ tenant: "dynamic", releases: [release] }),
    operationReleases: async () => [state],
    executePreparedPlan: async () => {
      executions++;
      return { sourceOnly: true };
    },
  };
  assert.deepEqual(
    await owner.installStartupReleases({
      tenant: "dynamic",
      modules: ["profile"],
    }),
    { sourceOnly: true },
  );
  assert.equal(executions, 1);
  state.installedVersion = release.version;
  await assert.rejects(
    owner.installStartupReleases({ tenant: "dynamic", modules: ["profile"] }),
  );
  assert.equal(executions, 1);
  assert.equal(
    f.configuration.identityGovernance.migration.assessment.bootstrapReview
      .sources[0].version,
    "0.0.3",
  );
});

test("real layered Init owners produce six expected source principals without copying credentials", async () => {
  const f = await fixture();
  assert.equal(f.expected.expected.length, 6);
  assert.equal(
    f.expected.expected.filter((r) => r.principalType === "human").length,
    5,
  );
  assert.equal(
    f.expected.expected.filter((r) => r.principalType === "customer").length,
    1,
  );
  assert.equal(
    JSON.stringify(f.expected).includes(
      f.configuration.bootstrapIdentity.adminPassword,
    ),
    false,
  );
  const before = structuredClone(f.state);
  const challenge = await f.owner.challenge(f.request, f.state, f.report);
  f.request.identityMigration = {
    confirmed: true,
    reviewToken: challenge.reviewToken,
  };
  const reviewed = await f.owner.review(f.request, f.state, f.report);
  assert.equal(reviewed.disposition, "REVIEWED_SOURCE_MATCH");
  assert.equal(reviewed.qualificationGranted, false);
  assert.equal(reviewed.effects, false);
  assert.deepEqual(f.state, before);
  assert.equal(f.report.reviewRequired, true);
  for (const row of f.expected.expected)
    assert.equal(JSON.stringify(challenge).includes(row.loginId), false);
});

test("inventory/source/installation drift and wrong original operator reject review", async () => {
  for (const mutate of [
    (f) => {
      f.state.partitions[0].employees[0].active = false;
    },
    (f) => {
      f.state.partitions[0].employees[0].userGroups.push("unapproved");
    },
    (f) => {
      f.state.partitions[0].employees[1].loginId = "renamed";
    },
    (f) => {
      f.state.partitions[0].employees[1]["authenticationIdentity.recordId"] =
        "other";
    },
    (f) => {
      f.state.partitions[0].passwords[1].loginId = "wrong-owner";
    },
    (f) => {
      f.request.authData.loginId = "another-operator";
    },
    (f) => {
      f.request.authData.authVersion = 2;
    },
    (f) => {
      f.state.enterprises[0].active = false;
    },
    () => {
      NODICS.getEnvironmentName = () => "other.project";
    },
    () => {
      NODICS.getServerName = () => "otherServer";
    },
    (f) => {
      f.configuration.identityGovernance.migration.assessment.bootstrapReview.sources[0].version =
        "0.0.9";
    },
    (f) => {
      f.installations.values().next().value.checksum = "b".repeat(64);
    },
    (f) => {
      f.request.identityMigration.confirmed = false;
    },
    (f) => {
      f.request.identityMigration.tenant = "other";
    },
    (f) => {
      f.configuration.identityGovernance.migration.assessment.bootstrapReview.enabled = false;
    },
  ]) {
    const f = await fixture();
    const challenge = await f.owner.challenge(f.request, f.state, f.report);
    f.request.identityMigration = {
      confirmed: true,
      reviewToken: challenge.reviewToken,
    };
    mutate(f);
    await assert.rejects(f.owner.review(f.request, f.state, f.report));
  }
});

test("expired/tampered challenges and missing collaborators fail closed", async () => {
  const f = await fixture();
  const challenge = await f.owner.challenge(f.request, f.state, f.report);
  const [encoded] = challenge.reviewToken.split(".");
  const payload = JSON.parse(Buffer.from(encoded, "base64url"));
  payload.issuedAt = Date.now() - 300001;
  const stale = Buffer.from(JSON.stringify(payload)).toString("base64url");
  f.request.identityMigration = {
    confirmed: true,
    reviewToken: stale + "." + f.owner.digest(stale),
  };
  await assert.rejects(f.owner.review(f.request, f.state, f.report));
  f.request.identityMigration.reviewToken = encoded + "." + "0".repeat(64);
  await assert.rejects(f.owner.review(f.request, f.state, f.report));
  delete SERVICE.DefaultDataInstallationService;
  await assert.rejects(f.owner.sources("default"));
});

test("unexpected findings, wrong placement and source mismatch never receive a challenge", async () => {
  for (const mutate of [
    (f) => {
      f.report.findings[0].code = "RSN_PROFILE_IDENTITY_SHARED_CREDENTIAL";
    },
    (f) => {
      f.state.partitions[0].tenant = "other";
    },
    (f) => {
      f.state.partitions[0].customers[0].active = true;
    },
    (f) => {
      f.state.partitions[0].employees[0].principalType = "service";
    },
  ]) {
    const f = await fixture();
    mutate(f);
    await assert.rejects(f.owner.challenge(f.request, f.state, f.report));
  }
});

test("governed assessment retains findings and audits only after final observation, with no qualification", async () => {
  const f = await fixture();
  global.ENUMS = {
    ProfileRegistrationPhase: { COMPLETE: { key: "COMPLETE" } },
    ProfileIdentityAssessmentConsistency: {
      TWO_PASS_OBSERVED_MATCH: { key: "TWO_PASS_OBSERVED_MATCH" },
    },
  };
  f.state.tenants = [{ _id: "fixture-tenant", code: "default", active: true }];
  f.state.partitions[0].groups = [
    ...new Set(
      [
        ...f.state.partitions[0].employees,
        ...f.state.partitions[0].customers,
      ].flatMap((r) => r.userGroups),
    ),
  ].map((code) => ({ _id: code, code, active: true, parentGroups: [] }));
  let reads = 0;
  f.migrationOwner.assessmentState = async () => {
    reads++;
    return structuredClone(f.state);
  };
  const initial = await f.migrationOwner.assessIdentities(f.request);
  assert.equal(reads, 3);
  assert.equal(initial.data.findings.length, 6);
  assert.equal(initial.data.bootstrapReview.disposition, "REVIEW_REQUIRED");
  const events = [];
  SERVICE.DefaultAuthAuditService.record = async (event) => {
    events.push(event);
    return event;
  };
  const controller = require("../src/controller/identity/defaultIdentityGovernanceController");
  f.request.httpRequest = {
    body: {
      confirmed: true,
      reviewToken: initial.data.bootstrapReview.reviewToken,
    },
  };
  const headers = [];
  f.request.httpResponse = { setHeader: (...args) => headers.push(args) };
  const result = await controller.reviewBootstrapIdentities(f.request);
  assert.equal(result.data.reviewRequired, true);
  assert.equal(result.data.findings.length, 6);
  assert.equal(result.data.readyForApply, false);
  assert.equal(result.data.bootstrapReview.auditRecorded, true);
  assert.equal(result.data.bootstrapReview.qualificationGranted, false);
  assert.deepEqual(headers, [["Cache-Control", "no-store"]]);
  assert.equal(events.length, 1);
  assert.equal(
    events[0].principalId,
    result.data.bootstrapReview.reviewerDigest,
  );
  assert.equal(
    events[0].correlationId,
    result.data.bootstrapReview.evidenceDigest,
  );
  assert.equal(
    JSON.stringify(events).includes(f.request.authData.loginId),
    false,
  );
  reads = 0;
  f.migrationOwner.assessmentState = async () => {
    const state = structuredClone(f.state);
    if (++reads === 3) state.partitions[0].employees[0].authVersion++;
    return state;
  };
  await assert.rejects(
    controller.reviewBootstrapIdentities(f.request),
    /ERR_PROFILE_IDENTITY_ASSESSMENT/,
  );
  assert.equal(
    events.length,
    1,
    "final drift cannot produce an audited success",
  );
});

test("disabled, missing or failed existing audit owner cannot publish a reviewed receipt", async () => {
  for (const mutate of [
    () => {
      delete SERVICE.DefaultAuthAuditService;
    },
    (f) => {
      f.configuration.authSecurity.audit.enabled = false;
    },
    (f) => {
      f.configuration.authSecurity.audit.publisherService =
        "DefaultMissingAuditPublisherService";
    },
    (f) => {
      f.configuration.authSecurity.audit.publisherService = "";
    },
    () => {
      SERVICE.DefaultAuthAuditService.record = async () => ({
        code: "ERR_AUDIT_REFUSED",
      });
    },
    () => {
      SERVICE.DefaultAuthAuditService.record = async () => ({
        code: "SUC_SYS_00000",
        errors: ["private-error"],
      });
    },
    () => {
      SERVICE.DefaultAuthAuditService.record = async () => ({
        errors: "malformed",
      });
    },
    () => {
      SERVICE.DefaultAuthAuditService.record = async () => false;
    },
    () => {
      SERVICE.DefaultAuthAuditService.record = async () => {
        throw new Error("private-provider-error");
      };
    },
  ]) {
    const f = await fixture();
    const challenge = await f.owner.challenge(f.request, f.state, f.report);
    f.request.identityMigration = {
      confirmed: true,
      reviewToken: challenge.reviewToken,
    };
    const receipt = await f.owner.review(f.request, f.state, f.report);
    mutate(f);
    await assert.rejects(f.owner.recordReview(f.request, receipt));
  }
});

test("existing nAuth audit owner preserves opaque reviewer and evidence without introducing a review store", async () => {
  const f = await fixture();
  const challenge = await f.owner.challenge(f.request, f.state, f.report);
  f.request.identityMigration = {
    confirmed: true,
    reviewToken: challenge.reviewToken,
  };
  const receipt = await f.owner.review(f.request, f.state, f.report);
  const auditSource = require(
    foundation + "nAuth/src/service/audit/defaultAuthAuditService",
  );
  const events = [];
  SERVICE.DefaultAuthAuditService = {
    ...auditSource,
    LOG: { info: (_message, event) => events.push(event) },
  };
  const result = await f.owner.recordReview(f.request, receipt);
  assert.equal(result.auditRecorded, true);
  assert.equal(events.length, 1);
  assert.equal(events[0].eventType, "PROFILE_BOOTSTRAP_IDENTITY_REVIEW");
  assert.equal(events[0].principalId, result.reviewerDigest);
  assert.equal(events[0].correlationId, result.evidenceDigest);
  assert.equal(events[0].source, "profile.bootstrapIdentityAssessment");
  assert.equal(JSON.stringify(events).includes(challenge.reviewToken), false);
  assert.equal(
    JSON.stringify(events).includes(
      f.configuration.bootstrapIdentity.adminPassword,
    ),
    false,
  );
  assert.equal(
    JSON.stringify(events).includes(f.request.authData.loginId),
    false,
  );
  f.configuration.authSecurity.audit.publisherService =
    "DefaultFixtureAuditPublisherService";
  const published = [];
  SERVICE.DefaultFixtureAuditPublisherService = {
    record: async (event) => {
      published.push(event);
      return { code: "SUC_SYS_00000" };
    },
  };
  assert.equal(
    (await f.owner.recordReview(f.request, receipt)).auditRecorded,
    true,
  );
  assert.equal(published.length, 1);
  assert.equal(published[0].principalId, receipt.reviewerDigest);
  assert.equal(published[0].correlationId, receipt.evidenceDigest);
  assert.equal(
    JSON.stringify(published).includes(challenge.reviewToken),
    false,
  );
});

test("expiry and authority loss during awaited source inspection cannot emit audit evidence", async () => {
  for (const kind of ["expiry", "authority", "lock", "policy"]) {
    const f = await fixture();
    const challenge = await f.owner.challenge(f.request, f.state, f.report);
    f.request.identityMigration = {
      confirmed: true,
      reviewToken: challenge.reviewToken,
    };
    const originalNow = Date.now;
    let clock = originalNow();
    Date.now = () => clock;
    let audits = 0;
    SERVICE.DefaultAuthAuditService.record = async () => {
      audits++;
      return true;
    };
    const originalSources = f.owner.sources;
    f.owner.sources = async function (...args) {
      const sources = await originalSources.apply(this, args);
      if (kind === "expiry") clock += 300001;
      if (kind === "authority")
        f.state.partitions[0].employees.find((r) => r.active).active = false;
      if (kind === "lock")
        SERVICE.DefaultUserStateService.findUserState = async () => ({
          locked: true,
        });
      if (kind === "policy")
        f.configuration.identityGovernance.migration.assessment.enabled = false;
      return sources;
    };
    try {
      await assert.rejects(f.owner.review(f.request, f.state, f.report));
      assert.equal(audits, 0);
    } finally {
      Date.now = originalNow;
    }
  }
});

test("original receipt requires fresh authority and unexpired proof before and after audit acknowledgement", async () => {
  for (const phase of ["before", "acknowledgement"])
    for (const kind of ["expiry", "authority", "lock", "policy", "stamp"]) {
      const f = await fixture();
      const challenge = await f.owner.challenge(f.request, f.state, f.report);
      f.request.identityMigration = {
        confirmed: true,
        reviewToken: challenge.reviewToken,
      };
      const receipt = await f.owner.review(f.request, f.state, f.report);
      const originalNow = Date.now;
      let clock = originalNow();
      Date.now = () => clock;
      const loseProof = () => {
        if (kind === "expiry") clock += 300001;
        if (kind === "authority")
          f.state.partitions[0].employees.find((r) => r.active).active = false;
        if (kind === "lock")
          SERVICE.DefaultUserStateService.findUserState = async () => ({
            locked: true,
          });
        if (kind === "policy")
          f.configuration.identityGovernance.migration.assessment.enabled = false;
        if (kind === "stamp")
          SERVICE.DefaultPrincipalSecurityStampService.validate = async () => {
            throw new Error("stale stamp");
          };
      };
      let audits = 0;
      SERVICE.DefaultAuthAuditService.record = async () => {
        audits++;
        if (phase === "acknowledgement") loseProof();
        return true;
      };
      try {
        if (phase === "before") loseProof();
        await assert.rejects(f.owner.recordReview(f.request, receipt));
        assert.equal(audits, phase === "before" ? 0 : 1);
        assert.equal(receipt.auditRecorded, undefined);
        assert.equal(receipt.qualificationGranted, false);
      } finally {
        Date.now = originalNow;
      }
    }
});

test("expiry during the last awaited operator read and copied receipt/request fail closed", async () => {
  const f = await fixture();
  const challenge = await f.owner.challenge(f.request, f.state, f.report);
  f.request.identityMigration = {
    confirmed: true,
    reviewToken: challenge.reviewToken,
  };
  const receipt = await f.owner.review(f.request, f.state, f.report);
  await assert.rejects(f.owner.recordReview(f.request, { ...receipt }));
  await assert.rejects(f.owner.recordReview({ ...f.request }, receipt));
  const originalNow = Date.now;
  let clock = originalNow();
  Date.now = () => clock;
  let audits = 0;
  SERVICE.DefaultAuthAuditService.record = async () => {
    audits++;
    return true;
  };
  SERVICE.DefaultUserStateService.findUserState = async () => {
    clock += 300001;
    return { locked: false };
  };
  try {
    await assert.rejects(f.owner.recordReview(f.request, receipt));
    assert.equal(audits, 0);
  } finally {
    Date.now = originalNow;
  }
});
