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
 * @module profile/test/enterpriseSetupContinuationContract
 * @description Composes setup continuation and Team serialization, with opt-in disposable native persistence probes. Authentication and external-effect doubles never qualify live operation.
 * @owner profile
 * @layer test
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const cloneDeep = require("lodash/cloneDeep");
const merge = require("lodash/merge");
const source = require("../src/service/enterprise/defaultEnterpriseSetupContinuationService");
const teamSource = require("../src/service/enterprise/defaultEnterpriseTeamAdministrationService");
const managementSource = require("../src/service/enterprise/defaultEnterpriseManagementService");
const membershipSource = require("../src/service/enterprise/defaultEnterpriseMembershipService");
const enterpriseHandlerSource = require("../../../../nodics.foundation/modules/nService/src/service/enterprise/defaultEnterpriseHandlerService");
const registrationSource = require("../src/service/enterprise/defaultEnterpriseRegistrationService");
const tenantGuardSource = require("../src/service/enterprise/defaultTenantProvisioningGuardService");
const { randomUUID, createHash } = require("node:crypto");
const { readFileSync } = require("node:fs");

function fixture() {
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code, message) {
        super(message || code);
        this.code = code;
      }
    },
  };
  const owner = { ...source },
    team = { ...teamSource };
  const role = {
    scopeType: "ENTERPRISE",
    delegable: true,
    groupCodes: ["enterpriseAdmin"],
  };
  const policy = {
    setupContinuation: {
      inspectionQualified: true,
      privateGuardsQualified: true,
      resumeQualified: true,
    },
    teamAdministration: { enabled: true, serializedWritesQualified: true },
  };
  const pin = { version: 1, mode: "DERIVED", tenantCode: "exampleTenant" };
  const bindings = { local: { approved: true } };
  global.CONFIG = {
    get: (key) =>
      key === "defaultTenant"
        ? "default"
        : key === "enterpriseManagement"
          ? policy
          : key === "database"
            ? { tenantNamespace: pin, tenantNamespaceBindings: bindings }
            : undefined,
  };
  let runtime = false,
    assignment;
  const effects = { activation: 0, invitation: 0, writes: 0, permissions: [] },
    reads = [],
    mutations = [];
  const identity = {
    tenantCode: "default",
    recordKind: "EMPLOYEE",
    recordId: "operator",
  };
  const request = () => ({
    params: { enterpriseCode: "example" },
    query: {},
    body: {},
    authData: {
      principalType: "human",
      authenticationMethod: "PASSWORD",
      platform: true,
    },
  });
  const memberships = {
    authority: () => "default",
    digest: managementSource.commandDigest.bind(managementSource),
    policy: () => true,
    actor: async (command) => {
      assert.equal(command.authData.principalType, "human");
      assert.equal(command.authData.authenticationMethod, "PASSWORD");
      return { identity: cloneDeep(identity) };
    },
    verifyAuthenticatedActor: async (command) => memberships.actor(command),
    permission: (command, code) => {
      effects.permissions.push(code);
      if (command.deny) throw new Error("denied");
    },
    administrator: async (command) => {
      memberships.permission(command, "profile.enterpriseAccess.assign");
      return memberships.actor(command);
    },
    rows: registrationSource.rows.bind(registrationSource),
    base: () => registrationSource,
  };
  const management = {
    ...managementSource,
    authorize: (command) => {
      if (command.authData?.principalType !== "human") owner.fail();
    },
    isPlatformAdministrator: (auth) => auth?.platform === true,
    rolePolicy: () => role,
    setupAdministratorPolicy: () => ({ roleCode: "ENTERPRISE_ADMIN" }),
    activateEnterpriseRuntime: async () => {
      effects.activation++;
      runtime = true;
    },
    prepareDefaultAdministrator: async () => {
      effects.invitation++;
      assignment = nominationRecord();
    },
  };
  const nomination = {
    email: "administrator@example.test",
    roleCode: "ENTERPRISE_ADMIN",
    assignmentCode: management.assignmentCode(
      "example",
      "administrator@example.test",
    ),
  };
  let row = {
    code: "example",
    name: "Example",
    tenant: "exampleTenant",
    active: true,
    adminEmail: nomination.email,
    defaultAdminAssignmentCode: nomination.assignmentCode,
    setupRequestKey: "a".repeat(64),
    setupRequestHash: "b".repeat(64),
  };
  function nominationRecord() {
    return {
      code: nomination.assignmentCode,
      enterpriseCode: "example",
      tenantCode: "exampleTenant",
      normalizedEmail: nomination.email,
      roleCode: nomination.roleCode,
      scopeType: "ENTERPRISE",
      scopeCode: "example",
      groupCodes: [...role.groupCodes],
      active: true,
      status: "PENDING",
      origin: "ADMIN_PRE_ENROLLED",
    };
  }
  const readPath = (value, path) =>
    path.split(".").reduce((v, key) => v?.[key], value);
  const matches = (query) =>
    Object.entries(query).every(([key, value]) => {
      const actual = readPath(row, key);
      return value &&
        typeof value === "object" &&
        Object.hasOwn(value, "$exists")
        ? (actual !== undefined) === value.$exists
        : JSON.stringify(actual) === JSON.stringify(value);
    });
  global.SERVICE = {
    DefaultEnterpriseSetupContinuationService: owner,
    DefaultLoggerService: {
      runSensitiveOperation: async (_command, execute) => execute(),
    },
    DefaultTenantProvisioningGuardService: { ...tenantGuardSource },
    DefaultEnterpriseManagementService: management,
    DefaultEnterpriseMembershipService: memberships,
    DefaultEnterpriseTeamAdministrationService: team,
    DefaultIdentityGovernanceService: {
      getSystemAuthData: () => ({ system: true }),
    },
    DefaultEnterpriseHandlerService: {
      _tenantPreparations: new Map(),
      isEnterpriseRuntimeReady:
        enterpriseHandlerSource.isEnterpriseRuntimeReady,
    },
    DefaultTenantService: {
      get: async () => ({
        code: "SUC_FIND_00000",
        count: 1,
        result: [
          {
            code: "exampleTenant",
            active: true,
            properties: {
              database: {
                tenantNamespace: cloneDeep(pin),
                tenantNamespaceBindings: cloneDeep(bindings),
              },
            },
          },
        ],
      }),
    },
    DefaultDatabaseConfigurationService: {
      assertTenantNamespaceBinding: () => true,
      getDatabaseActiveModules: () => ["profile"],
      resolveTenantDatabaseConfiguration: () => ({ db: "isolated" }),
      assertTenantDatabaseIsolation: () => true,
    },
    DefaultEnterpriseAccessAssignmentService: {
      get: async () => ({
        code: "SUC_FIND_00000",
        count: assignment ? 1 : 0,
        result: assignment ? [cloneDeep(assignment)] : [],
      }),
    },
    DefaultEnterpriseService: {
      get: async (command) => {
        reads.push(command);
        const response = {
          code: "SUC_FIND_00000",
          count: 1,
          result: [cloneDeep(row)],
        };
        team.redactEnterprise(command, response);
        owner.redactEnterprise(command, response);
        return response;
      },
      update: async (command) => {
        owner.protectMutation(command);
        assert.equal(team.ownsEnterpriseWrite(command), true);
        mutations.push(cloneDeep(command));
        if (!matches(command.query)) throw new Error("CAS conflict");
        Object.assign(row, cloneDeep(command.model));
        effects.writes++;
        if (f.loseAck?.(command)) throw new Error("acknowledgement unknown");
        return { code: "SUC_UPDATE_00000", result: { matchedCount: 1 } };
      },
    },
  };
  global.NODICS = {
    getActiveTenants: () => (runtime ? ["exampleTenant"] : []),
    getInternalAuthTokens: () => (runtime ? { exampleTenant: true } : {}),
    getTenantForEnterprise: (code) =>
      code === "example" ? "exampleTenant" : undefined,
    getRouters: () =>
      Object.fromEntries(
        ["inspectEnterpriseSetup", "resumeEnterpriseSetup"].map((operation) => [
          operation,
          {
            controller: "DefaultEnterpriseManagementController",
            operation,
            secured: true,
            permission: "profile.enterprise.create",
            authTokenTypes: ["access"],
            active: true,
            method: operation === "inspectEnterpriseSetup" ? "get" : "post",
            url:
              "/nodics/profile/v0/enterprises/:enterpriseCode/setup" +
              (operation === "resumeEnterpriseSetup" ? "/resume" : ""),
          },
        ]),
      ),
  };
  row.setupContinuation = owner.createSnapshot(row, nomination);
  const f = {
    owner,
    team,
    management,
    policy,
    role,
    nomination,
    identity,
    request,
    effects,
    reads,
    mutations,
    get row() {
      return row;
    },
    set row(value) {
      row = value;
    },
    set assignment(value) {
      assignment = value;
    },
    get assignment() {
      return assignment;
    },
    set runtime(value) {
      runtime = value;
    },
    nominationRecord,
    resume: () =>
      owner.resume({
        ...request(),
        body: { expectedRevision: row.setupContinuation.revision },
      }),
  };
  return f;
}

test("snapshot is deterministic and privately bound to original nomination without modifying input", () => {
  const f = fixture(),
    before = cloneDeep(f.row);
  assert.deepEqual(
    f.owner.createSnapshot(f.row, f.nomination),
    f.row.setupContinuation,
  );
  assert.deepEqual(f.row, before);
  assert.throws(() =>
    f.owner.createSnapshot(f.row, {
      ...f.nomination,
      roleCode: "PLATFORM_ADMIN",
    }),
  );
  assert.throws(() => f.owner.createSnapshot(f.row));
});

test("disabled qualification and non-human/non-platform callers cannot inspect", async () => {
  const f = fixture();
  f.policy.setupContinuation.inspectionQualified = false;
  await assert.rejects(f.owner.inspect(f.request()));
  f.policy.setupContinuation.inspectionQualified = true;
  for (const patch of [
    { principalType: "serviceAccount" },
    { platform: false },
    { authenticationMethod: "OTP" },
  ]) {
    const command = f.request();
    Object.assign(command.authData, patch);
    await assert.rejects(f.owner.inspect(command));
  }
  assert.equal(f.effects.writes, 0);
});

/** Composes native actor verification and setup authorization with fresh generated-owner read doubles, not installed human proof. @returns {Object} Mutable source fixture. */
function nativeAuthorizationFixture() {
  const f = fixture();
  f.policy.memberships = {
    enabled: false,
    inventoryQualified: false,
    sessionBindingQualified: false,
    assignmentClaimIndexQualified: false,
  };
  const person = {
    _id: "operator",
    loginId: "operator@example.test",
    principalType: "human",
    active: true,
    authVersion: 3,
  };
  const state = { locked: false };
  const reads = [];
  const membership = { ...membershipSource };
  SERVICE.DefaultEnterpriseMembershipService = membership;
  SERVICE.DefaultEnterpriseRegistrationService = registrationSource;
  SERVICE.DefaultProfileService = { getProfileModuleName: () => "profile" };
  NODICS.getModels = () => ({ EmployeeModel: { dataBase: {} } });
  SERVICE.DefaultDatabaseConfigurationService.toObjectId = (_model, value) =>
    value;
  SERVICE.DefaultEnterpriseManagementService.authorize =
    managementSource.authorize;
  SERVICE.DefaultEnterpriseManagementService.isPlatformAdministrator =
    managementSource.isPlatformAdministrator;
  SERVICE.DefaultEmployeeService = {
    get: async (command) => {
      reads.push(cloneDeep(command));
      assert.equal(command.tenant, "default");
      assert.deepEqual(command.options, {
        recursive: false,
        skipItemCache: true,
      });
      assert.deepEqual(
        command.query,
        reads.length % 2
          ? {
              loginId: person.loginId,
            }
          : { _id: person._id },
      );
      return { code: "SUC_FIND_00000", result: [cloneDeep(person)] };
    },
  };
  SERVICE.DefaultUserStateService = { findUserState: async () => state };
  SERVICE.DefaultPrincipalSecurityStampService = {
    validate: async (auth) => {
      assert.equal(auth.authVersion, 3);
    },
  };
  SERVICE.DefaultSecuredRequestPipelineService = {
    getGrantedPermissions: () => [
      "profile.enterprise.create",
      "profile.enterpriseAccess.assign",
    ],
    getRouteActionAuthorizationConfig: () => ({}),
    isPermissionGranted: (permission, granted) => granted.includes(permission),
  };
  const command = f.request();
  command.tenant = "default";
  command.authData = {
    tokenType: "access",
    principalType: "human",
    authenticationMethod: "PASSWORD",
    tenant: "default",
    entCode: "default",
    userGroups: ["adminGroup"],
    loginId: person.loginId,
    authVersion: 3,
  };
  return { ...f, command, person, state, reads, membership };
}

test("native setup inspection verifies canonical actor with membership gates off while membership actor remains unavailable", async () => {
  const f = nativeAuthorizationFixture();
  const result = await f.owner.inspect(f.command);
  assert.equal(result.enterprise.code, "example");
  assert.equal(f.reads.length, 2);
  assert.deepEqual((await f.owner.authorize(f.command)).identity, {
    tenantCode: "default",
    recordKind: "EMPLOYEE",
    recordId: "operator",
  });
  await assert.rejects(f.membership.actor(f.command), {
    code: "ERR_PROFILE_MEMBERSHIP_UNAVAILABLE",
  });
  assert.equal(f.effects.writes, 0);
});

test("native setup resumes through actual Team serialization with optional Team and membership features off", async () => {
  const f = nativeAuthorizationFixture();
  f.policy.teamAdministration = {
    enabled: false,
    serializedWritesQualified: false,
  };
  f.command.body = { expectedRevision: 0 };
  const result = await f.owner.resume(f.command);
  assert.equal(result.setup.state, "COMPLETE");
  assert.equal(f.effects.activation, 1);
  assert.equal(f.effects.invitation, 1);
  assert.equal(f.policy.memberships.enabled, false);
  assert.equal(f.policy.teamAdministration.enabled, false);
  const input = {
    operationId: "setup_" + "a".repeat(64),
    intentDigest: "a".repeat(64),
  };
  await assert.rejects(
    f.team.begin(f.command, "SETUP_CONTINUATION", input, "example"),
  );
  await assert.rejects(
    f.team.begin(
      { ...f.command, setupOwner: true },
      "SETUP_CONTINUATION",
      input,
      "example",
    ),
  );
  await assert.rejects(f.team.begin(f.command, "INVITE", input, "example"), {
    code: "ERR_PROFILE_MEMBERSHIP_UNAVAILABLE",
  });
});

test("private setup serialization refuses copied requests, retargeted input and stale actor without writes", async () => {
  for (const mode of [
    "request",
    "input",
    "target",
    "stale",
    "qualification",
    "permission",
  ]) {
    const f = nativeAuthorizationFixture();
    f.policy.teamAdministration = {
      enabled: false,
      serializedWritesQualified: false,
    };
    const begin = f.team.begin;
    f.team.begin = async (request, operation, input, code) => {
      if (mode === "stale") f.person.authVersion = 4;
      if (mode === "qualification")
        f.policy.setupContinuation.resumeQualified = false;
      if (mode === "permission")
        SERVICE.DefaultSecuredRequestPipelineService.getGrantedPermissions =
          () => ["profile.enterprise.create"];
      return begin.call(
        f.team,
        mode === "request" ? { ...request } : request,
        operation,
        mode === "input" ? { ...input } : input,
        mode === "target" ? "another" : code,
      );
    };
    f.command.body = { expectedRevision: 0 };
    await assert.rejects(f.owner.resume(f.command));
    assert.equal(f.effects.writes, 0);
    assert.equal(f.effects.activation, 0);
    assert.equal(f.effects.invitation, 0);
  }
});

test("setup inspect and resume reject stale or unauthorized native actors before reads or effects", async () => {
  for (const mutate of [
    (f) => {
      f.command.authData.isSystem = true;
    },
    (f) => {
      f.command.authData.principalType = "customer";
    },
    (f) => {
      f.command.authData.authenticationMethod = "OTP";
    },
    (f) => {
      f.command.authData.tokenType = "refresh";
    },
    (f) => {
      f.command.authData.tenant = "another";
    },
    (f) => {
      f.command.authData.entCode = "another";
    },
    (f) => {
      f.command.authData.userGroups = ["serviceAccountUserGroup"];
    },
    (f) => {
      f.person.authVersion = 4;
    },
    (f) => {
      f.person.active = false;
    },
    (f) => {
      f.person.disabled = true;
    },
    (f) => {
      f.person.registrationSuspended = true;
    },
    (f) => {
      f.person.authenticationIdentity = {
        tenantCode: "other",
        recordKind: "EMPLOYEE",
        recordId: "someone",
      };
    },
    (f) => {
      f.state.locked = true;
    },
    () => {
      SERVICE.DefaultPrincipalSecurityStampService.validate = async () => {
        throw new Error("stale stamp");
      };
    },
    () => {
      SERVICE.DefaultSecuredRequestPipelineService.getGrantedPermissions =
        () => [];
    },
    (f) => {
      f.command.authData.sessionContext = {
        owner: "profile",
        code: "assignment",
        version: 1,
      };
    },
  ]) {
    for (const operation of ["inspect", "resume"]) {
      const f = nativeAuthorizationFixture();
      mutate(f);
      if (operation === "resume") f.command.body = { expectedRevision: 0 };
      await assert.rejects(f.owner[operation](f.command));
      assert.equal(f.effects.writes, 0);
      assert.equal(f.effects.activation, 0);
      assert.equal(f.effects.invitation, 0);
    }
  }
});

test("native actor final canonical read refuses version drift during verification", async () => {
  const f = nativeAuthorizationFixture();
  const get = SERVICE.DefaultEmployeeService.get;
  SERVICE.DefaultEmployeeService.get = async (command) => {
    if (command.query._id) f.person.authVersion = 4;
    return get(command);
  };
  await assert.rejects(f.owner.inspect(f.command), {
    code: "ERR_PROFILE_MEMBERSHIP_IDENTITY",
  });
  assert.equal(f.effects.writes, 0);
});

test("Profile read query converts bounded ID paths through selected provider without mutating selectors or business keys", () => {
  const f = nativeAuthorizationFixture();
  const model = { dataBase: {} };
  SERVICE.DefaultProfileService.getProfileModuleName = () => "customProfile";
  NODICS.getModels = (moduleName, tenant) => {
    assert.equal(moduleName, "customProfile");
    assert.equal(tenant, "default");
    return { EmployeeModel: model };
  };
  const seen = [];
  SERVICE.DefaultDatabaseConfigurationService.toObjectId = (
    selected,
    value,
  ) => {
    assert.equal(selected, model);
    seen.push(value);
    return { providerId: value };
  };
  const query = {
    $and: [{ _id: "first" }, { loginId: "untouched" }],
    $or: [{ _id: { $in: ["second", "third"] } }, { _id: { $ne: "fourth" } }],
  };
  const before = cloneDeep(query);
  const converted = registrationSource.prepareReadQuery(
    "DefaultEmployeeService",
    "default",
    query,
  );
  assert.deepEqual(seen, ["first", "second", "third", "fourth"]);
  assert.deepEqual(converted.$and[0]._id, { providerId: "first" });
  assert.equal(converted.$and[1].loginId, "untouched");
  assert.deepEqual(query, before);
  NODICS.getModels = () => ({});
  assert.throws(() =>
    registrationSource.prepareReadQuery("DefaultEmployeeService", "default", {
      _id: "missing",
    }),
  );
  assert.equal(f.effects.writes, 0);
});

test(
  "installed canonical actor reads a BSON ID through generated GET and provider-owned conversion",
  { skip: !process.env.NODICS_PROFILE_INSTALLED_SETUP_MONGO_URI },
  async () => {
    const protectedFixture = nativeReadFixture();
    const protection = { ...SERVICE };
    const f = nativeAuthorizationFixture();
    for (const key of [
      "DefaultSchemaReadAccessPolicyService",
      "DefaultProfileVerifiedContactInterceptorService",
      "DefaultProfileVerifiedContactService",
      "DefaultCustomerEligibilityDecisionGovernanceService",
      "DefaultCanonicalHistoricalIdentityLinkService",
    ])
      SERVICE[key] = protection[key];
    const foundation = "../../../../nodics.foundation/modules/";
    SERVICE.DefaultModelValidatorService = {
      ...require(
        foundation +
          "nDatabase/database/src/service/model/defaultModelValidatorService",
      ),
      LOG: { debug() {}, error() {} },
    };
    SERVICE.DefaultNodicsPromiseService = {
      all: (values) => Promise.all(values),
    };
    const endpoint = new URL(
      process.env.NODICS_PROFILE_INSTALLED_SETUP_MONGO_URI,
    );
    assert.equal(endpoint.protocol, "mongodb:");
    assert(["localhost", "127.0.0.1", "[::1]"].includes(endpoint.hostname));
    const namespace =
      "nodics_profile_qualification_" + randomUUID().replaceAll("-", "");
    const connection = await {
      ...require(
        foundation +
          "nDatabase/mongodb/src/service/connection/defaultMongodbDatabaseConnectionHandlerService",
      ),
      LOG: { debug() {}, info() {}, error() {} },
    }.createConnection({
      URI: endpoint.href,
      databaseName: namespace,
      options: { serverSelectionTimeoutMS: 5000 },
    });
    let model;
    try {
      model = require(
        foundation +
          "nDatabase/mongodb/src/service/model/defaultMongodbInstalledVersionMigrationService",
      ).bindMaintenanceModel({
        connection,
        schema: protectedFixture.schemas.profile.employee,
        scope: {
          database: namespace,
          collection: "CanonicalActorFixture",
          tenant: "default",
          channel: "master",
          schemaName: "employee",
        },
        databaseOptions: {
          modelHandler: "DefaultMongodbDatabaseModelHandlerService",
          defaultIndexes: ["_id"],
        },
      });
      const person = { ...f.person };
      delete person._id;
      await model.compareAndSetItem({
        operation: "create",
        internalPersistence: "DURABLE_JOURNAL",
        model: person,
      });
      const configuration = require(
        foundation +
          "nDatabase/database/src/service/config/defaultDatabaseConfigurationService",
      );
      SERVICE.DefaultDatabaseConfigurationService.toObjectId =
        configuration.toObjectId;
      SERVICE.DefaultMongodbDatabaseModelHandlerService = require(
        foundation +
          "nDatabase/mongodb/src/service/model/defaultMongodbDatabaseModelHandlerService",
      );
      global.UTILS = {
        ...UTILS,
        isObject: (value) => value !== null && typeof value === "object",
        isObjectId: (value) => !!value?.toHexString,
      };
      NODICS.getModels = () => ({ EmployeeModel: model, mdlnm: model });
      SERVICE.DefaultPipelineService = {
        start: async (_name, command) => {
          assert.equal(command.schemaModel, model);
          assert.deepEqual(command.options, {
            recursive: false,
            skipItemCache: true,
          });
          protectedFixture.get.buildOptions.call(
            { ...protectedFixture.get, LOG: { debug() {} } },
            command,
            {},
            { nextSuccess() {} },
          );
          return { code: "SUC_FIND_00000", ...(await model.getItems(command)) };
        },
      };
      SERVICE.DefaultEmployeeService.get = require(
        foundation + "nService/src/service/common",
      ).get;
      const first = await f.membership.read(
        "DefaultEmployeeService",
        "default",
        { loginId: person.loginId },
      );
      assert.equal(typeof first._id.toHexString, "function");
      const raw = await model.getItems({
        query: { _id: String(first._id) },
        authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
        options: { recursive: false, skipItemCache: true },
        searchOptions: { limit: 2 },
        schemaModel: model,
      });
      assert.equal(raw.result.length, 0);
      const anchor = await f.owner.authorize(f.command);
      assert.equal(anchor.identity.recordId, String(first._id));
      assert.equal(anchor.person.loginId, person.loginId);
      assert.equal(f.policy.memberships.enabled, false);
    } finally {
      if (model) {
        await model.removeItems({
          query: { loginId: f.person.loginId },
          options: {},
        });
        assert.equal(await model.countDocuments({}), 0);
      }
      await connection.client.close();
    }
  },
);

test("continuation uses target-bound runtime owner readiness without truthy-token fallback", () => {
  const f = fixture();
  f.runtime = true;
  assert.equal(f.owner.runtimeReady(f.row), true);
  NODICS.getTenantForEnterprise = () => "anotherTenant";
  assert.equal(f.owner.runtimeReady(f.row), false);
  NODICS.getTenantForEnterprise = () => "exampleTenant";
  SERVICE.DefaultEnterpriseHandlerService._tenantPreparations.set(
    "exampleTenant",
    {},
  );
  assert.equal(f.owner.runtimeReady(f.row), false);
  SERVICE.DefaultEnterpriseHandlerService._tenantPreparations.clear();
  delete SERVICE.DefaultEnterpriseHandlerService.isEnterpriseRuntimeReady;
  assert.equal(f.owner.runtimeReady(f.row), false);
});

test("old failed records without original intent stay HELD with no reconstruction", async () => {
  const f = fixture();
  delete f.row.setupContinuation;
  assert.equal(
    (await f.owner.inspect(f.request())).setup.reasonCodes[0],
    "ORIGINAL_INTENT_UNAVAILABLE",
  );
  await assert.rejects(
    f.owner.resume({ ...f.request(), body: { expectedRevision: 0 } }),
  );
  assert.equal(f.effects.writes, 0);
});

test("changed policy and unsafe namespace remain HELD without provisioning", async () => {
  const f = fixture();
  f.role.groupCodes.push("newGroup");
  assert.deepEqual((await f.owner.inspect(f.request())).setup.reasonCodes, [
    "NOMINATION_POLICY_CHANGED",
  ]);
  f.role.groupCodes.pop();
  SERVICE.DefaultDatabaseConfigurationService.assertTenantNamespaceBinding =
    () => {
      throw new Error("unsafe");
    };
  assert.deepEqual((await f.owner.inspect(f.request())).setup.reasonCodes, [
    "TENANT_NAMESPACE_UNSAFE",
  ]);
  assert.equal(f.effects.activation, 0);
  assert.equal(f.effects.writes, 0);
});

test("successful continuation uses actual Team fences and exact monotonic CAS", async () => {
  const f = fixture();
  const result = await f.resume();
  assert.equal(result.setup.state, "COMPLETE");
  assert.equal(f.effects.activation, 1);
  assert.equal(f.effects.invitation, 1);
  assert.equal(f.row.setupContinuation.revision, 4);
  assert.equal(f.row.teamOperation.phase, "COMPLETE");
  assert.equal(f.team.ownsEnterpriseWrite(f.mutations[0]), false);
  for (const command of f.mutations.filter(
    (command) => command.model.setupContinuation,
  )) {
    assert.equal(
      command.query["setupContinuation.revision"],
      command.model.setupContinuation.revision - 1,
    );
    assert.equal(command.query["teamOperation.phase"], "PENDING");
  }
  assert.ok(f.effects.permissions.includes("profile.enterprise.create"));
  assert.ok(f.effects.permissions.includes("profile.enterpriseAccess.assign"));
  const serialized = JSON.stringify(result);
  for (const value of [
    f.row.setupRequestKey,
    f.row.setupRequestHash,
    f.nomination.assignmentCode,
    f.row.setupContinuation.intentDigest,
  ])
    assert.equal(serialized.includes(value), false);
  await f.resume();
  assert.equal(f.effects.activation, 1);
  assert.equal(f.effects.invitation, 1);
});

test("current matching registered assignment is never overwritten or reinvited", async () => {
  const f = fixture();
  f.runtime = true;
  f.assignment = {
    ...f.nominationRecord(),
    status: "REGISTERED",
    employeeId: "existing",
    credentialOwner: "original",
  };
  const before = cloneDeep(f.assignment);
  await f.resume();
  assert.deepEqual(f.assignment, before);
  assert.equal(f.effects.invitation, 0);
  assert.equal(f.effects.activation, 0);
});

test("uncertain activation is checkpointed and cannot be redispatched", async () => {
  const f = fixture();
  f.management.activateEnterpriseRuntime = async () => {
    f.effects.activation++;
    throw new Error("unknown");
  };
  await assert.rejects(f.resume());
  assert.equal(f.row.setupContinuation.stage, "RUNTIME_PENDING");
  assert.deepEqual((await f.owner.inspect(f.request())).setup.reasonCodes, [
    "STEP_OUTCOME_UNCONFIRMED",
  ]);
  await assert.rejects(f.resume());
  assert.equal(f.effects.activation, 1);
});

test("uncertain invitation without a fresh assignment remains held and never resends", async () => {
  const f = fixture();
  f.runtime = true;
  f.management.prepareDefaultAdministrator = async () => {
    f.effects.invitation++;
    throw new Error("unknown");
  };
  await assert.rejects(f.resume());
  assert.equal(f.row.setupContinuation.stage, "ADMIN_PENDING");
  await assert.rejects(f.resume());
  assert.equal(f.effects.invitation, 1);
});

test("committed invitation with lost response can finalize without another invitation", async () => {
  const f = fixture();
  f.runtime = true;
  f.management.prepareDefaultAdministrator = async () => {
    f.effects.invitation++;
    f.assignment = f.nominationRecord();
    throw new Error("unknown");
  };
  await assert.rejects(f.resume());
  assert.equal((await f.resume()).setup.state, "COMPLETE");
  assert.equal(f.effects.invitation, 1);
});

test("lost checkpoint and finish acknowledgement use actual owner readback without duplicate effects", async () => {
  const f = fixture();
  f.loseAck = () => true;
  assert.equal((await f.resume()).setup.state, "COMPLETE");
  assert.equal(f.effects.activation, 1);
  assert.equal(f.effects.invitation, 1);
});

test("completed checkpoint with unacknowledged serialization finish finalizes without replay", async () => {
  const f = fixture(),
    finish = f.team.finish;
  f.team.finish = async () => {
    throw new Error("before finish");
  };
  await assert.rejects(f.resume());
  assert.equal(f.row.setupContinuation.phase, "COMPLETE");
  assert.equal(f.row.teamOperation.phase, "PENDING");
  f.team.finish = finish;
  assert.equal((await f.resume()).setup.state, "COMPLETE");
  assert.equal(f.effects.activation, 1);
  assert.equal(f.effects.invitation, 1);
});

test("stale or augmented request is rejected before writes", async () => {
  const f = fixture();
  for (const body of [
    { expectedRevision: 1 },
    { expectedRevision: 0, email: "replacement@example.test" },
    {},
  ])
    await assert.rejects(f.owner.resume({ ...f.request(), body }));
  assert.equal(f.effects.writes, 0);
});

test("another held operation and another operator cannot take over", async () => {
  const f = fixture();
  f.row.teamOperation = { operation: "HANDOVER", phase: "PENDING" };
  assert.deepEqual((await f.owner.inspect(f.request())).setup.reasonCodes, [
    "OTHER_OPERATION_PENDING",
  ]);
  delete f.row.teamOperation;
  f.management.activateEnterpriseRuntime = async () => {
    throw new Error("unknown");
  };
  await assert.rejects(f.resume());
  f.identity.recordId = "different";
  assert.deepEqual((await f.owner.inspect(f.request())).setup.reasonCodes, [
    "ORIGINAL_OPERATOR_REQUIRED",
  ]);
});

test("creation admission is exact, immutable and transient; forged flags never admit", async () => {
  const f = fixture(),
    command = { ...f.request(), model: cloneDeep(f.row) };
  assert.throws(() => f.owner.protectMutation(command));
  await f.owner.withCreationMutation(command, f.nomination, async () => {
    assert.equal(f.owner.protectMutation(command), true);
    assert.throws(() => f.owner.protectMutation(cloneDeep(command)));
    command.model.setupContinuation.revision++;
    assert.throws(() => f.owner.protectMutation(command));
    command.model.setupContinuation.revision--;
  });
  assert.throws(() => f.owner.protectMutation(command));
  assert.equal(
    f.owner.protectMutation({
      model: [{ name: "ordinary" }],
      options: { overwrite: true },
    }),
    true,
  );
});

test("public nested/frozen envelopes redact without mutating cached rows and private read expires", async () => {
  const f = fixture(),
    date = new Date(),
    buffer = Buffer.from("public");
  const cached = Object.freeze({
    code: "SUC_FIND_00000",
    result: Object.freeze([
      Object.freeze({
        parent: Object.freeze({ ...cloneDeep(f.row), date, buffer }),
      }),
    ]),
  });
  const response = { success: cached };
  f.owner.redactEnterprise({ privateRead: true }, response);
  assert.equal(response.success.result[0].parent.setupContinuation, undefined);
  assert.ok(cached.result[0].parent.setupContinuation);
  assert.ok(response.success.result[0].parent.date instanceof Date);
  assert.ok(Buffer.isBuffer(response.success.result[0].parent.buffer));
  assert.ok((await f.owner.readEnterprise("example")).setupContinuation);
  const replay = await SERVICE.DefaultEnterpriseService.get(f.reads.at(-1));
  assert.equal(replay.result[0].setupContinuation, undefined);
});

test("concurrent resumes allow only one checkpoint winner to issue effects", async () => {
  const f = fixture();
  const results = await Promise.allSettled([f.resume(), f.resume()]);
  assert.equal(
    results.filter((result) => result.status === "fulfilled").length,
    1,
  );
  assert.equal(f.effects.activation, 1);
  assert.equal(f.effects.invitation, 1);
});

test("fresh nDatabase resolver and durable binding owner reject namespace drift without preparation", async () => {
  const f = fixture();
  const databaseSource = require("../../../../nodics.foundation/modules/nDatabase/database/src/service/config/defaultDatabaseConfigurationService");
  const provider = require("../../../../nodics.foundation/modules/nDatabase/mongodb/src/service/connection/defaultMongodbDatabaseConnectionHandlerService");
  const database = { ...databaseSource, dbs: {} };
  const base = {
    default: {
      options: { databaseType: "mongodb" },
      mongodb: {
        options: {
          connectionHandler: "DefaultMongodbDatabaseConnectionHandlerService",
        },
        master: {
          URI: "mongodb://127.0.0.1:27017",
          databaseName: "boundedPlatform",
        },
        test: {
          URI: "mongodb://127.0.0.1:27017",
          databaseName: "boundedPlatformTest",
        },
      },
    },
    profile: {},
  };
  const configs = {
    default: cloneDeep(base),
    exampleTenant: {
      ...cloneDeep(base),
      ...database.createTenantNamespaceIntent("exampleTenant").database,
    },
  };
  const originalGet = CONFIG.get;
  CONFIG.get = (key, tenant) =>
    key === "database"
      ? configs[tenant || "default"]
      : originalGet(key, tenant);
  Object.assign(NODICS, {
    getModules: () => ({ default: {}, profile: {} }),
    getModule: () => ({}),
    isModuleActive: () => true,
    getEnvironmentName: () => "test",
    getSelectedEnvironmentName: () => "Local",
    getServerName: () => "platformServer",
  });
  SERVICE.DefaultDatabaseConfigurationService = database;
  SERVICE.DefaultMongodbDatabaseConnectionHandlerService = provider;
  const candidate = database.buildTenantNamespaceBinding("exampleTenant");
  configs.exampleTenant.tenantNamespaceBindings = {
    [candidate.scopeKey]: candidate.binding,
  };
  const persisted = cloneDeep(configs.exampleTenant);
  SERVICE.DefaultTenantService.get = async () => ({
    code: "SUC_FIND_00000",
    result: [
      {
        code: "exampleTenant",
        active: true,
        properties: { database: persisted },
      },
    ],
  });
  assert.equal(await f.owner.namespaceReady(f.row), true);
  configs.exampleTenant.profile = {
    mongodb: { master: { databaseName: "relocated" } },
  };
  assert.equal(await f.owner.namespaceReady(f.row), false);
  assert.equal(f.effects.writes, 0);
  assert.equal(f.effects.activation, 0);
});

test("refused and expired assignment reads cannot become invitation absence", async () => {
  const f = fixture();
  f.runtime = true;
  f.assignment = { ...f.nominationRecord(), expiresAt: "2000-01-01T00:00:00Z" };
  assert.deepEqual((await f.owner.inspect(f.request())).setup.reasonCodes, [
    "NOMINATION_CHANGED",
  ]);
  SERVICE.DefaultEnterpriseAccessAssignmentService.get = async () => ({
    code: "ERR_FIND",
    result: [],
  });
  assert.deepEqual((await f.owner.inspect(f.request())).setup.reasonCodes, [
    "ASSIGNMENT_READ_UNAVAILABLE",
  ]);
  await assert.rejects(f.resume());
  assert.equal(f.effects.invitation, 0);
});

test("private read selector mutation and copied requests never retain continuation", async () => {
  const f = fixture(),
    get = SERVICE.DefaultEnterpriseService.get;
  SERVICE.DefaultEnterpriseService.get = async (command) => {
    const copied = cloneDeep(command);
    assert.equal((await get(copied)).result[0].setupContinuation, undefined);
    command.query = { code: "another" };
    const response = await get(command);
    assert.equal(response.result[0].setupContinuation, undefined);
    throw new Error("selector drift");
  };
  await assert.rejects(f.owner.readEnterprise("example"));
  SERVICE.DefaultEnterpriseService.get = get;
  assert.equal(
    (await get(f.reads.at(-1))).result[0].setupContinuation,
    undefined,
  );
});

test("private mutation protection remains on with qualifications off and rejects operator/dotted forgery", () => {
  const f = fixture();
  f.policy.setupContinuation = {};
  for (const model of [
    { setupContinuation: f.row.setupContinuation },
    { "setupContinuation.revision": 0 },
    { $unset: { setupContinuation: true } },
    [{ setupContinuation: f.row.setupContinuation }],
  ])
    assert.throws(() =>
      f.owner.protectMutation({
        model,
        private: true,
        options: { ownWrite: true },
      }),
    );
  assert.equal(
    f.owner.protectMutation({ model: [{ name: "plain" }, { name: "other" }] }),
    true,
  );
});

test("generated system creation requires separate fresh original human authorization", async () => {
  const f = fixture(),
    command = { model: cloneDeep(f.row), authData: { system: true } };
  await assert.rejects(
    f.owner.withCreationMutation(command, f.nomination, async () => true),
  );
  await f.owner.withCreationMutation(
    command,
    f.nomination,
    async () => {
      assert.equal(f.owner.protectMutation(command), true);
    },
    f.request(),
  );
  assert.throws(() => f.owner.protectMutation(command));
});

test("checkpoint query drift cannot weaken exact private CAS admission", async () => {
  const f = fixture(),
    update = SERVICE.DefaultEnterpriseService.update;
  SERVICE.DefaultEnterpriseService.update = async (command) => {
    if (command.model.setupContinuation)
      delete command.query["setupContinuation.revision"];
    return update(command);
  };
  await assert.rejects(f.resume());
  assert.equal(f.row.setupContinuation.revision, 0);
  assert.equal(f.effects.activation, 0);
  assert.equal(f.effects.invitation, 0);
});

function nativeReadFixture() {
  const f = fixture();
  global.ENUMS = {
    ContactType: Object.fromEntries(
      ["EMAIL", "PHONE", "FAX", "PAGER"].map((key) => [key, { key }]),
    ),
  };
  global.UTILS = { isBlank: (value) => !value || !Object.keys(value).length };
  const schemas = require("../src/schemas/schemas");
  const mongo =
    require("../../../../nodics.foundation/modules/nDatabase/mongodb/src/schemas/model").default;
  const policy = require("../../../../nodics.foundation/modules/nDatabase/database/src/service/schema/defaultSchemaReadAccessPolicyService");
  const get = require("../../../../nodics.foundation/modules/nDatabase/database/src/service/procs/get/defaultModelsGetInitializerService");
  SERVICE.DefaultEnterpriseSetupContinuationService = f.owner;
  SERVICE.DefaultSchemaReadAccessPolicyService = { ...policy };
  SERVICE.DefaultProfileVerifiedContactInterceptorService = {
    ...require("../src/service/interceptors/defaultProfileVerifiedContactInterceptorService"),
  };
  SERVICE.DefaultProfileVerifiedContactService = {
    ...require("../src/service/contact/defaultProfileVerifiedContactService"),
  };
  SERVICE.DefaultCustomerEligibilityDecisionGovernanceService = {
    ...require("../src/service/customer/defaultCustomerEligibilityDecisionGovernanceService"),
  };
  SERVICE.DefaultCanonicalHistoricalIdentityLinkService = {
    ...require("../src/service/identity/defaultCanonicalHistoricalIdentityLinkService"),
  };
  SERVICE.DefaultEnterpriseAdministrationConsentService = {
    ...require("../src/service/enterprise/defaultEnterpriseAdministrationConsentService"),
  };
  const calls = { find: 0, count: 0, cache: 0 };
  const model = {
    ...mongo,
    schemaName: "enterprise",
    moduleName: "profile",
    rawSchema: schemas.profile.enterprise,
    cache: { enabled: true },
    transactionOptions: () => ({}),
    find: () => {
      calls.find++;
      return { toArray: async () => [cloneDeep(f.row)] };
    },
    countDocuments: async () => {
      calls.count++;
      return 1;
    },
  };
  SERVICE.DefaultCacheService = {
    get: async () => {
      calls.cache++;
      throw Error("Protected cache must not run");
    },
  };
  SERVICE.DefaultEnterpriseService.get = async (command) => {
    command.schemaModel = model;
    get.buildOptions.call(
      { ...get, LOG: { debug: () => {} } },
      command,
      {},
      { nextSuccess: () => {} },
    );
    return { code: "SUC_FIND_00000", ...(await model.getItems(command)) };
  };
  const pipeline = (method, command, response = {}) =>
    new Promise((resolve, reject) => {
      get[method].call(
        { ...get, LOG: { debug: () => {} } },
        command,
        response,
        {
          nextSuccess: () => resolve(response),
          stop: () => resolve(response),
          error: (_req, _res, error) => reject(error),
        },
      );
    });
  return Object.assign(f, { schemas, model, calls, get, pipeline });
}

/** Binds source-composed setup/Team owners to disposable native persistence. Authentication and external effects remain fixture collaborators, never installed qualification. @param {Object} connection Native connection owner result. @param {string} namespace Admitted disposable database. @returns {Promise<Object>} Provider-composed fixture and exact cleanup. */
async function installedSetupFixture(connection, namespace) {
  assert.match(namespace, /^nodics_profile_qualification_[a-f0-9]{32}$/);
  assert.equal(connection.connection.databaseName, namespace);
  const f = nativeReadFixture();
  const foundation = "../../../../nodics.foundation/modules/";
  SERVICE.DefaultModelValidatorService = {
    ...require(
      foundation +
        "nDatabase/database/src/service/model/defaultModelValidatorService",
    ),
    LOG: { debug() {}, error() {} },
  };
  SERVICE.DefaultNodicsPromiseService = {
    all: (values) => Promise.all(values),
  };
  const model = require(
    foundation +
      "nDatabase/mongodb/src/service/model/defaultMongodbInstalledVersionMigrationService",
  ).bindMaintenanceModel({
    connection,
    schema: f.schemas.profile.enterprise,
    scope: {
      database: namespace,
      collection: "SetupContinuationFixture",
      tenant: "default",
      channel: "master",
      schemaName: "enterprise",
    },
    databaseOptions: {
      defaultIndexes: ["_id"],
      modelRemoveOptions: { j: true },
    },
  });
  model.moduleName = "profile";
  await model.compareAndSetItem({
    operation: "create",
    internalPersistence: "DURABLE_JOURNAL",
    model: cloneDeep(f.row),
  });
  SERVICE.DefaultEnterpriseService.get = async (command) => {
    command.schemaModel = model;
    f.get.buildOptions.call(
      { ...f.get, LOG: { debug() {} } },
      command,
      {},
      { nextSuccess() {} },
    );
    return { code: "SUC_FIND_00000", ...(await model.getItems(command)) };
  };
  SERVICE.DefaultEnterpriseService.update = async (command) => {
    assert.equal(f.team.ownsEnterpriseWrite(command), true);
    command.moduleName = "profile";
    const response = await require(
      foundation + "nService/src/service/common",
    ).update(command);
    f.updateOutputs.push(cloneDeep(response));
    if (response.result.matchedCount > 0) {
      f.effects.writes++;
      if (f.loseAck?.(command)) throw new Error("acknowledgement unknown");
    }
    return response;
  };
  installGeneratedUpdateOwners(f, model, foundation);
  f.resume = async () => {
    const observed = await f.owner.readEnterprise("example");
    return f.owner.resume({
      ...f.request(),
      body: { expectedRevision: observed.setupContinuation.revision },
    });
  };
  return {
    f,
    model,
    cleanup: async () => {
      await model.removeItems({ query: { code: "example" }, options: {} });
      assert.equal(
        (await model.getItems({ query: { code: "example" }, options: {} }))
          .count,
        0,
      );
    },
  };
}

/** Composes the unchanged generic service wrapper, native PipelineHead, all declared update nodes and actual Profile hooks. Only external effect boundaries are captured. @param {Object} f Source owner fixture. @param {Object} model Disposable native model. @param {string} foundation Relative framework root. @returns {void} */
function installGeneratedUpdateOwners(f, model, foundation) {
  require(
    foundation + "nConfig/config/prescripts",
  ).addStringCamelCaseFunction();
  CLASSES.NodicsError.enrich = (error) => error;
  CLASSES.PipelineHead = require(foundation + "nPipeline/src/lib/pipelineHead");
  CLASSES.PipelineNode = require(foundation + "nPipeline/src/lib/pipelineNode");
  Object.assign(UTILS, {
    isObject: (value) => value !== null && typeof value === "object",
    generateUniqueCode: randomUUID,
  });
  const previousConfig = CONFIG.get;
  CONFIG.get = (key) =>
    key === "accessPoints"
      ? require(foundation + "nDatabase/database/config/properties")
          .accessPoints
      : key === "identityGovernance"
        ? require(foundation + "nAuth/config/properties").identityGovernance
        : previousConfig(key);
  const log = { debug() {}, info() {}, error() {}, warn() {} };
  Object.assign(SERVICE.DefaultLoggerService, {
    inheritRequestPrivacy() {},
    createLogger: () => log,
  });
  SERVICE.DefaultIdentityGovernanceService = require(
    foundation + "nAuth/src/service/identity/defaultIdentityGovernanceService",
  );
  SERVICE.DefaultEnterpriseMembershipService.paths =
    require("../src/service/enterprise/defaultEnterpriseMembershipService").paths;
  SERVICE.DefaultModelsUpdateInitializerService = {
    ...require(
      foundation +
        "nDatabase/database/src/service/procs/update/defaultModelsUpdateInitializerService",
    ),
    LOG: log,
  };
  SERVICE.DefaultSchemaAccessHandlerService = require(
    foundation +
      "nDatabase/database/src/service/schema/defaultSchemaAccessHandlerService",
  );
  SERVICE.DefaultRecordOwnershipPolicyService = require(
    foundation +
      "nDatabase/database/src/service/access/defaultRecordOwnershipPolicyService",
  );
  SERVICE.DefaultSchemaWriteAccessPolicyService = require(
    foundation +
      "nDatabase/database/src/service/schema/defaultSchemaWriteAccessPolicyService",
  );
  SERVICE.DefaultModelConcurrencyService = require(
    foundation +
      "nDatabase/database/src/service/schema/defaultModelConcurrencyService",
  );
  SERVICE.DefaultModelService = {
    ...require(
      foundation + "nDatabase/database/src/service/model/defaultModelService",
    ),
    LOG: log,
  };
  SERVICE.DefaultEnterpriseUpdateInterceptorService = {
    ...require("../src/service/interceptors/defaultEnterpriseUpdateInterceptorService"),
    LOG: log,
  };
  SERVICE.DefaultEnterpriseTenantProvisioningService = {
    ...require("../src/service/enterprise/defaultEnterpriseTenantProvisioningService"),
  };
  SERVICE.DefaultInterceptorService = {
    ...require(
      foundation + "nCommon/src/service/interceptor/defaultInterceptorService",
    ),
    LOG: log,
  };
  SERVICE.DefaultPipelineService = {
    ...require(
      foundation + "nPipeline/src/service/pipeline/defaultPipelineService",
    ),
    LOG: log,
  };
  global.PIPELINE = merge(
    {},
    require(foundation + "nPipeline/src/pipelines/pipelines"),
    require(foundation + "nDatabase/database/src/pipelines/pipelines"),
  );
  NODICS.getModels = () => ({ mdlnm: model });
  NODICS.getServerState = () => "started";
  SERVICE.DefaultDatabaseConfigurationService.getSchemaValidators = () => ({});
  const hooks = Object.values(
    require("../src/interceptors/interceptors"),
  ).filter(
    (hook) => hook.item === "enterprise" && String(hook.active) === "true",
  );
  f.failedHooks = [];
  for (const hook of hooks.filter((item) =>
    ["preUpdate", "postUpdate"].includes(item.trigger),
  )) {
    const [service, operation] = hook.handler.split(".");
    const original = SERVICE[service]?.[operation];
    assert.equal(
      typeof original,
      "function",
      "every selected interceptor must resolve to its actual owner",
    );
    SERVICE[service][operation] = function (...args) {
      try {
        const result = original.apply(this, args);
        return result?.then
          ? result.catch((error) => {
              f.failedHooks.push(hook.handler);
              throw error;
            })
          : result;
      } catch (error) {
        f.failedHooks.push(hook.handler);
        throw error;
      }
    };
  }
  SERVICE.DefaultDatabaseConfigurationService.getSchemaInterceptors = () =>
    Object.fromEntries(
      ["preUpdate", "postUpdate"].map((trigger) => [
        trigger,
        hooks
          .filter((hook) => hook.trigger === trigger)
          .sort((a, b) => a.index - b.index),
      ]),
    );
  f.events = [];
  f.invalidations = [];
  f.updateOutputs = [];
  SERVICE.DefaultCacheService.invalidateResource = async (input) => {
    f.invalidations.push(cloneDeep(input));
    return true;
  };
  SERVICE.DefaultEventService = {
    publish: async (event) => {
      f.events.push(cloneDeep(event));
      return true;
    },
  };
  SERVICE.DefaultEnterpriseHandlerService.buildEnterprise = async () => true;
  ENUMS.TargetType = { MODULE_NODES: { key: "MODULE_NODES" } };
  const trace = [];
  for (const node of Object.values(
    PIPELINE.modelsUpdateInitializerPipeline.nodes,
  )) {
    const operation = node.handler.split(".")[1];
    const original = SERVICE.DefaultModelsUpdateInitializerService[operation];
    SERVICE.DefaultModelsUpdateInitializerService[operation] = function (
      ...args
    ) {
      trace.push(operation);
      return original.apply(this, args);
    };
  }
  f.updateTrace = trace;
}

if (process.env.NODICS_PROFILE_INSTALLED_SETUP_MONGO_URI)
  test("installed setup persistence: private projection, concurrent lease, exact lost-ack readback and uncertain-effect hold", async (context) => {
    const sources = [
      __filename,
      require.resolve("../src/service/enterprise/defaultEnterpriseSetupContinuationService"),
      require.resolve("../src/service/enterprise/defaultEnterpriseTeamAdministrationService"),
      require.resolve("../src/schemas/schemas"),
      require.resolve("../../../../nodics.foundation/modules/nDatabase/mongodb/src/schemas/model"),
      require.resolve("../../../../nodics.foundation/modules/nDatabase/database/src/service/procs/get/defaultModelsGetInitializerService"),
      require.resolve("../../../../nodics.foundation/modules/nDatabase/database/src/service/procs/update/defaultModelsUpdateInitializerService"),
      require.resolve("../../../../nodics.foundation/modules/nService/src/service/common"),
      require.resolve("../../../../nodics.foundation/modules/nPipeline/src/service/pipeline/defaultPipelineService"),
      require.resolve("../../../../nodics.foundation/modules/nPipeline/src/lib/pipelineHead"),
      require.resolve("../../../../nodics.foundation/modules/nPipeline/src/lib/pipelineNode"),
      require.resolve("../../../../nodics.foundation/modules/nDatabase/database/src/pipelines/pipelines"),
      require.resolve("../../../../nodics.foundation/modules/nCommon/src/service/interceptor/defaultInterceptorService"),
      require.resolve("../src/interceptors/interceptors"),
      require.resolve("../src/service/interceptors/defaultEnterpriseUpdateInterceptorService"),
      require.resolve("../src/service/enterprise/defaultTenantProvisioningGuardService"),
    ];
    const fingerprint = () => {
      const hash = createHash("sha256");
      for (const path of sources)
        hash.update(path).update("\0").update(readFileSync(path)).update("\0");
      return hash.digest("hex");
    };
    const before = fingerprint();
    const endpoint = new URL(
      process.env.NODICS_PROFILE_INSTALLED_SETUP_MONGO_URI,
    );
    assert.equal(endpoint.protocol, "mongodb:");
    assert(["localhost", "127.0.0.1", "[::1]"].includes(endpoint.hostname));
    // No project database or approved sample identity can be selected by this harness.
    const namespace =
      "nodics_profile_qualification_" + randomUUID().replaceAll("-", "");
    const connection = await {
      ...require("../../../../nodics.foundation/modules/nDatabase/mongodb/src/service/connection/defaultMongodbDatabaseConnectionHandlerService"),
      LOG: { debug() {}, info() {}, error() {} },
    }.createConnection({
      URI: endpoint.href,
      databaseName: namespace,
      options: { serverSelectionTimeoutMS: 5000 },
    });
    try {
      for (const scenario of [
        "concurrent",
        "lostAck",
        "activationUnknown",
        "invitationUnknown",
        "invitationCommitted",
      ]) {
        const { f, model, cleanup } = await installedSetupFixture(
          connection,
          namespace,
        );
        try {
          f.policy.setupContinuation = {};
          await assert.rejects(
            model.getItems({
              query: { "setupContinuation.revision": 0 },
              options: {},
            }),
          );
          const publicRow = (
            await model.getItems({ query: { code: "example" }, options: {} })
          ).result[0];
          assert.equal(publicRow.setupContinuation, undefined);
          assert.equal(
            (await f.owner.readEnterprise("example")).setupContinuation
              .revision,
            0,
          );
          assert.throws(() =>
            f.owner.protectMutation({
              query: { code: "example" },
              model: { "setupContinuation.revision": 99 },
            }),
          );
          Object.assign(f.policy.setupContinuation, {
            inspectionQualified: true,
            privateGuardsQualified: true,
            resumeQualified: true,
          });
          if (scenario === "concurrent") {
            const results = await Promise.allSettled([f.resume(), f.resume()]);
            if (results.every((result) => result.status === "rejected"))
              context.diagnostic(
                JSON.stringify({
                  refusalCodes: results.map((result) =>
                    typeof result.reason?.code === "string"
                      ? result.reason.code
                      : "FIXTURE_REFUSED",
                  ),
                  nodes: f.updateTrace,
                  failedHooks: f.failedHooks,
                }),
              );
            assert.equal(
              results.filter((result) => result.status === "fulfilled").length,
              1,
            );
            assert.equal(f.effects.activation, 1);
            assert.equal(f.effects.invitation, 1);
          } else if (scenario === "lostAck") {
            f.loseAck = () => true;
            assert.equal((await f.resume()).setup.state, "COMPLETE");
            assert.equal(f.effects.activation, 1);
            assert.equal(f.effects.invitation, 1);
          } else {
            if (scenario === "activationUnknown") {
              f.management.activateEnterpriseRuntime = async () => {
                f.effects.activation++;
                throw new Error("unknown");
              };
            } else {
              f.runtime = true;
              f.management.prepareDefaultAdministrator = async () => {
                f.effects.invitation++;
                if (scenario === "invitationCommitted")
                  f.assignment = f.nominationRecord();
                throw new Error("unknown");
              };
            }
            await assert.rejects(f.resume());
            if (scenario === "invitationCommitted")
              assert.equal((await f.resume()).setup.state, "COMPLETE");
            else await assert.rejects(f.resume());
            assert.equal(
              scenario === "activationUnknown"
                ? f.effects.activation
                : f.effects.invitation,
              1,
            );
          }
          const declaredNodes = Object.values(
            PIPELINE.modelsUpdateInitializerPipeline.nodes,
          ).map((node) => node.handler.split(".")[1]);
          for (const operation of declaredNodes)
            assert(
              f.updateTrace.includes(operation),
              "every declared update node must execute: " + operation,
            );
          assert(
            f.events.length > 0,
            "actual enterprise event owner must produce observed identity-only events",
          );
          assert(
            f.invalidations.length > 0,
            "actual update pipeline must invalidate cache metadata",
          );
          for (const output of [...f.events, ...f.invalidations]) {
            const serialized = JSON.stringify(output);
            for (const field of [
              "setupContinuation",
              "setupRequestKey",
              "setupRequestHash",
              "defaultAdminAssignmentCode",
              "teamOperation",
              "teamRevision",
              "tenantNamespace",
              "tenantNamespaceBindings",
              "enterpriseProvisioning",
            ])
              assert.equal(
                serialized.includes('"' + field + '"'),
                false,
                "private field leaked: " + field,
              );
          }
        } finally {
          await cleanup();
        }
      }
    } finally {
      await connection.client.close();
    }
    assert.equal(
      fingerprint(),
      before,
      "selected source must remain unchanged during installed probes",
    );
    context.diagnostic(
      JSON.stringify({
        evidence: "DISPOSABLE_NATIVE_PERSISTENCE_WITH_SOURCE_SETUP_TEAM_OWNERS",
        scenarios: 5,
        sourceFingerprint: before,
        nodeVersion: process.version,
        fixtureRowsRemoved: true,
        generatedUpdateNodes: 13,
        generatedUpdateWiringPassed: true,
        updateEventCacheProjectionPassed: true,
        publicMutationProjectionQualified: false,
        installedAuthorizationQualified: false,
        runtimeEffectsQualified: false,
        deploymentPrivacyQualified: false,
        qualificationGranted: false,
        browserAccepted: false,
      }),
    );
  });

if (process.env.NODICS_PROFILE_INSTALLED_SETUP_MONGO_URI)
  test("installed public generated-update projection must not expose retained setup, Team or Tenant evidence", async (context) => {
    const endpoint = new URL(
      process.env.NODICS_PROFILE_INSTALLED_SETUP_MONGO_URI,
    );
    assert.equal(endpoint.protocol, "mongodb:");
    assert(["localhost", "127.0.0.1", "[::1]"].includes(endpoint.hostname));
    const namespace =
      "nodics_profile_qualification_" + randomUUID().replaceAll("-", "");
    const connection = await {
      ...require("../../../../nodics.foundation/modules/nDatabase/mongodb/src/service/connection/defaultMongodbDatabaseConnectionHandlerService"),
      LOG: { debug() {}, info() {}, error() {} },
    }.createConnection({
      URI: endpoint.href,
      databaseName: namespace,
      options: { serverSelectionTimeoutMS: 5000 },
    });
    let cleanup;
    try {
      const installed = await installedSetupFixture(connection, namespace);
      cleanup = installed.cleanup;
      installed.f.policy.setupContinuation = {};
      const command = {
        tenant: "default",
        moduleName: "profile",
        authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
        query: { code: "example", active: true },
        model: { name: "Public update projection probe" },
        options: { recursive: false },
      };
      assert.equal(installed.f.team.ownsEnterpriseWrite(command), false);
      const response =
        await require("../../../../nodics.foundation/modules/nService/src/service/common").update(
          command,
        );
      const serialized = JSON.stringify(response);
      const fields = [
        "setupContinuation",
        "setupRequestKey",
        "setupRequestHash",
        "defaultAdminAssignmentCode",
        "teamOperation",
        "teamRevision",
        "tenantNamespace",
        "tenantNamespaceBindings",
        "enterpriseProvisioning",
      ];
      const leaked = fields.filter((field) =>
        serialized.includes('"' + field + '"'),
      );
      assert.deepEqual(
        leaked,
        [],
        "ordinary generated update must redact every private owner field",
      );
      const retained = await installed.f.owner.readEnterprise("example");
      assert.equal(retained.setupContinuation.revision, 0);
      assert.equal(
        retained.defaultAdminAssignmentCode,
        installed.f.nomination.assignmentCode,
      );
    } finally {
      try {
        if (cleanup) await cleanup();
      } finally {
        await connection.client.close();
      }
    }
    context.diagnostic(
      JSON.stringify({
        evidence: "DISPOSABLE_PUBLIC_GENERATED_UPDATE_PROJECTION",
        publicMutationProjectionPassed: true,
        qualificationFlagsOff: true,
        retainedOwnerRecordPreserved: true,
        privateTeamWriteAdmission: false,
        fixtureRowsRemoved: true,
        qualificationGranted: false,
        browserAccepted: false,
      }),
    );
  });

test("public mutation count/models projection composes Team and Tenant owners with flags off without erasing retained private rows", () => {
  const f = fixture();
  f.policy.setupContinuation = {};
  const retained = {
    ...cloneDeep(f.row),
    teamOperation: { phase: "PENDING" },
    teamRevision: 3,
    tenant: {
      code: "exampleTenant",
      properties: {
        database: {
          tenantNamespace: { mode: "DERIVED" },
          tenantNamespaceBindings: { test: {} },
        },
        enterpriseProvisioning: { version: 1 },
      },
    },
  };
  const baseline = cloneDeep(retained);
  const response = {
    success: {
      code: "SUC_UPD_00000",
      result: {
        acknowledged: true,
        matchedCount: 1,
        modifiedCount: 1,
        models: [retained],
      },
    },
  };
  assert.equal(
    f.owner.redactEnterprise(
      { query: { code: "example" }, model: { name: "ordinary" } },
      response,
    ),
    true,
  );
  const projected = response.success.result.models[0];
  for (const field of [
    "setupContinuation",
    "setupRequestKey",
    "setupRequestHash",
    "defaultAdminAssignmentCode",
    "teamOperation",
    "teamRevision",
  ])
    assert.equal(projected[field], undefined);
  assert.deepEqual(projected.tenant.properties, { database: {} });
  assert.deepEqual(retained, baseline);
  assert.equal(response.success.result.matchedCount, 1);
  assert.equal(response.success.result.modifiedCount, 1);
  const original = SERVICE.DefaultTenantProvisioningGuardService.redact;
  let composed = 0;
  SERVICE.DefaultTenantProvisioningGuardService.redact = function (...args) {
    composed++;
    return original.apply(this, args);
  };
  f.owner.redactEnterprise({}, { result: [{ code: "public" }] });
  assert.equal(composed, 1);
  SERVICE.DefaultTenantProvisioningGuardService.redact = () => false;
  assert.throws(() =>
    f.owner.redactEnterprise({}, { result: [{ code: "public" }] }),
  );
});

test("actual setup route privacy middleware requires early binding and selected logger protection before inspection", () => {
  fixture();
  const logger = require("../../../../nodics.foundation/modules/nConfig/src/service/DefaultLoggerService");
  const routing = require("../../../../nodics.foundation/modules/nRouter/src/service/router/defaultRouterOperationService");
  const route = require("../src/router/routers").profile.loadDefaults
    .inspectEnterpriseSetup;
  SERVICE.DefaultLoggerService = logger;
  let qualified = false;
  const previous = CONFIG.get;
  CONFIG.get = (key) =>
    key === "log"
      ? { requestPrivacy: { qualified, captureMode: "disabled" } }
      : previous(key);
  NODICS.getRouter = () => route;
  const observations = [];
  const response = {
    status: (status) => ({
      json: (body) => observations.push({ status, body }),
    }),
  };
  const middleware = routing.privacyMiddleware(route);
  let admitted = 0;
  const unqualified = {};
  logger.runRequestPrivacy(unqualified, () =>
    middleware(unqualified, response, () => admitted++),
  );
  assert.equal(admitted, 0);
  assert.equal(observations[0].body.code, "ERR_RTR_00005");
  qualified = true;
  middleware({ body: { private: true } }, response, () => admitted++);
  assert.equal(admitted, 0);
  const request = {};
  logger.runRequestPrivacy(request, () =>
    middleware(request, response, () => {
      assert.equal(logger.hasPrivateCaptureProtection(request), true);
      admitted++;
    }),
  );
  assert.equal(admitted, 1);
});

test("actual prepared Enterprise Mongo boundary rejects private selectors before find/count with flags OFF", async () => {
  const f = nativeReadFixture();
  f.policy.setupContinuation = {};
  for (const parts of [
    { query: { "setupContinuation.revision": 0 } },
    { query: { $expr: { $eq: ["$setupRequestHash", "guess"] } } },
    { searchOptions: { sort: { teamRevision: 1 } } },
    { searchOptions: { projection: { defaultAdminAssignmentCode: 1 } } },
    {
      query: {
        "tenant.properties.database.tenantNamespace": { $exists: true },
      },
    },
  ])
    await assert.rejects(
      f.model.getItems({ tenant: "default", options: {}, ...parts }),
    );
  assert.deepEqual(f.calls, { find: 0, count: 0, cache: 0 });
});

test("actual provider and export projection preserve ordinary fields but redact all composed evidence", async () => {
  const f = nativeReadFixture();
  Object.assign(f.row, {
    profileVerifiedContact: { revision: 1 },
    customerEligibilityDecision: { revision: 1 },
    identityLinkRetirement: { private: true },
    teamOperation: { phase: "PENDING" },
    administrationConsent: { private: true },
  });
  const response = await f.model.getItems({ query: {}, options: {} });
  for (const key of [
    "setupContinuation",
    "setupRequestKey",
    "setupRequestHash",
    "defaultAdminAssignmentCode",
    "teamOperation",
    "profileVerifiedContact",
    "customerEligibilityDecision",
    "identityLinkRetirement",
    "administrationConsent",
  ])
    assert.equal(response.result[0][key], undefined);
  assert.equal(response.result[0].name, "Example");
  assert.ok(f.row.setupContinuation);
  assert.ok(f.row.setupRequestHash);
  const exporter = require("../../../../nodics.foundation/modules/nData/nExport/export/src/service/DataExportService");
  const exported = await exporter.applyExportAccessPolicies(
    { schemaModel: f.model, query: {}, options: {} },
    [f.row],
  );
  assert.equal(exported[0].setupContinuation, undefined);
  assert.equal(exported[0].setupRequestKey, undefined);
  assert.ok(f.row.setupContinuation);
});

test("actual protected cache preflight denies private selection and ordinary reads skip cached evidence", async () => {
  const f = nativeReadFixture();
  await assert.rejects(
    f.pipeline("lookupCache", {
      schemaModel: f.model,
      query: { setupRequestKey: "guess" },
      options: {},
    }),
  );
  await f.pipeline("lookupCache", {
    schemaModel: f.model,
    query: { code: "example" },
    options: {},
  });
  assert.equal(f.calls.cache, 0);
});

test("native generated private owner read survives provider projections and exact paging decoration", async () => {
  const f = nativeReadFixture();
  const row = await f.owner.readEnterprise("example");
  assert.ok(row.setupContinuation);
  assert.equal(row.setupRequestHash, f.row.setupRequestHash);
  const original = {
    tenant: "default",
    query: { code: "example" },
    options: { recursive: false, skipItemCache: true },
    searchOptions: { pageSize: 2, pageNumber: 1 },
  };
  const inherited = await f.team.readEnterpriseEnvelope(
    SERVICE.DefaultEnterpriseService,
    original,
  );
  assert.equal(inherited.result[0].setupRequestHash, f.row.setupRequestHash);
  assert.equal(inherited.result[0].setupContinuation, undefined);
});

test("actual generated pre/postGet hooks invoke setup guards and redaction with prior hooks retained", async () => {
  const f = nativeReadFixture();
  const hooks = require("../src/interceptors/interceptors");
  const selected = Object.values(hooks).filter(
    (hook) =>
      hook.item === "enterprise" &&
      hook.handler?.startsWith("DefaultEnterpriseSetupContinuationService."),
  );
  assert.deepEqual(selected.map((hook) => hook.trigger).sort(), [
    "postGet",
    "postRemove",
    "postSave",
    "postUpdate",
    "preGet",
    "preRemove",
    "preSave",
    "preUpdate",
  ]);
  assert.equal(
    hooks.redactEnterpriseTeamEvidence.handler,
    "DefaultEnterpriseTeamAdministrationService.redactEnterprise",
  );
  assert.equal(
    hooks.redactEnterpriseTenantProvisioning.handler,
    "DefaultTenantProvisioningGuardService.redact",
  );
  const database = SERVICE.DefaultDatabaseConfigurationService;
  database.getSchemaInterceptors = () =>
    Object.fromEntries(
      ["preGet", "postGet"].map((trigger) => [
        trigger,
        selected.filter((hook) => hook.trigger === trigger),
      ]),
    );
  SERVICE.DefaultInterceptorService = {
    executeInterceptors: async (list, command, response) => {
      for (const hook of list.sort((a, b) => a.index - b.index))
        await f.owner[hook.handler.split(".")[1]](command, response);
      return true;
    },
  };
  await assert.rejects(
    f.pipeline("applyPreInterceptors", {
      schemaModel: f.model,
      query: { setupContinuation: { $exists: true } },
    }),
  );
  const response = {
    success: { code: "SUC_FIND_00000", result: [cloneDeep(f.row)] },
  };
  await f.pipeline(
    "applyPostInterceptors",
    { schemaModel: f.model, query: {} },
    response,
  );
  assert.equal(response.success.result[0].setupContinuation, undefined);
});

test("workspace DTO/routes/controller/facade use fixed owner metadata and safe error projection", async () => {
  const f = fixture();
  const properties = require("../config/properties");
  f.policy.setupContinuation = cloneDeep(
    properties.enterpriseManagement.setupContinuation,
  );
  assert.equal(f.owner.workspaceDescriptor().available, false);
  assert.equal(f.owner.workspaceDescriptor().actions.resume.qualified, false);
  assert.equal(
    f.owner.workspaceDescriptor().presentation.title,
    properties.enterpriseManagement.setupContinuation.workspace.presentation
      .title,
  );
  const routers = require("../src/router/routers").profile.loadDefaults;
  const privacyOwner = require("../../../../nodics.foundation/modules/nRouter/src/service/router/defaultRouterOperationService");
  for (const operation of ["inspectEnterpriseSetup", "resumeEnterpriseSetup"]) {
    assert.equal(privacyOwner.isPrivateRoute(routers[operation]), true);
    assert.deepEqual(routers[operation].requestPrivacy, { sensitive: true });
  }
  assert.equal(
    routers.inspectEnterpriseSetup.permission,
    "profile.enterprise.create",
  );
  assert.equal(
    routers.resumeEnterpriseSetup.requestBody.content["application/json"].schema
      .additionalProperties,
    false,
  );
  assert.equal(
    routers.resumeEnterpriseSetup.key,
    "/enterprises/:enterpriseCode/setup/resume",
  );
  const facade = {
    ...require("../src/facade/enterprise/defaultEnterpriseManagementFacade"),
  };
  const controller = {
    ...require("../src/controller/enterprise/defaultEnterpriseManagementController"),
  };
  global.FACADE = { DefaultEnterpriseManagementFacade: facade };
  SERVICE.DefaultEnterpriseManagementService.inspectEnterpriseSetup = async (
    command,
  ) => {
    assert.equal(command.authData, input.authData);
    throw new Error("private-provider-detail");
  };
  const input = {
    ...f.request(),
    httpResponse: {
      setHeader: (key, value) =>
        assert.deepEqual([key, value], ["Cache-Control", "no-store"]),
    },
  };
  await assert.rejects(
    controller.inspectEnterpriseSetup(input),
    (error) =>
      error.code === "ERR_PRFL_00003" &&
      !error.message.includes("private-provider-detail"),
  );
});

test("assembled HTTP inspection reports only exact owner-bound fixed failure stages", async () => {
  const controller = require("../src/controller/enterprise/defaultEnterpriseManagementController");
  const facade = require("../src/facade/enterprise/defaultEnterpriseManagementFacade");
  const statuses = require("../src/utils/statusDefinitions");
  for (const [stage, mutate] of [
    [
      "POLICY",
      (f) => {
        f.policy.setupContinuation.inspectionQualified = false;
      },
    ],
    [
      "AUTHORIZATION",
      (f) => {
        f.state.locked = true;
      },
    ],
    [
      "INPUT",
      (f) => {
        f.command.httpRequest.query = { unexpected: true };
      },
    ],
    [
      "READ",
      (f) => {
        f.owner.readEnterprise = async () => {
          throw new Error("private-selector-and-provider-secret");
        };
      },
    ],
    [
      "ASSESSMENT",
      (f) => {
        f.owner.assess = async () => {
          throw new Error("private-grant-and-token-secret");
        };
      },
    ],
  ]) {
    const f = nativeAuthorizationFixture();
    global.FACADE = { DefaultEnterpriseManagementFacade: facade };
    f.command.params = { enterpriseCode: "wrong-outer-value" };
    f.command.httpRequest = {
      params: { enterpriseCode: "example" },
      query: {},
      body: {},
    };
    f.command.httpResponse = {
      setHeader: (key, value) => {
        assert.deepEqual([key, value], ["Cache-Control", "no-store"]);
      },
    };
    mutate(f);
    const code = "ERR_PROFILE_SETUP_INSPECTION_" + stage;
    assert.equal(statuses[code].code, "400");
    await assert.rejects(
      controller.inspectEnterpriseSetup(f.command),
      (error) => {
        assert.equal(error.code, code);
        assert.equal(error.message, code);
        assert.equal(error.cause, undefined);
        assert.equal(error.metadata, undefined);
        return true;
      },
    );
    assert.equal(f.effects.writes, 0);
  }
  const f = fixture();
  global.FACADE = {
    DefaultEnterpriseManagementFacade: {
      inspectEnterpriseSetup: async () => {
        throw { code: "ERR_PROFILE_SETUP_INSPECTION_READ", message: "secret" };
      },
    },
  };
  await assert.rejects(controller.inspectEnterpriseSetup(f.request()), {
    code: "ERR_PRFL_00003",
  });
});

test("immutable creation fingerprints cannot be changed by ordinary update even with recovery disabled", () => {
  const f = fixture();
  f.policy.setupContinuation = {};
  for (const model of [
    { setupRequestKey: "changed" },
    { $set: { setupRequestHash: "changed" } },
  ])
    assert.throws(() =>
      f.owner.protectMutation({ query: { code: "example" }, model }),
    );
});

test("workspace routes honor actual nRouter prepared prefix/context/version and ambiguity fails unavailable", () => {
  const f = fixture();
  const router = require("../../../../nodics.foundation/modules/nRouter/src/service/router/defaultRouterService");
  const definitions = require("../src/router/routers").profile.loadDefaults;
  const registry = {};
  const original = CONFIG.get;
  CONFIG.get = (key, tenant) =>
    key === "servers"
      ? { options: { contextRoot: "customRoot" } }
      : original(key, tenant);
  NODICS.addRouter = (name, definition) => {
    registry[name] = definition;
  };
  NODICS.getRouters = () => registry;
  SERVICE.DefaultRouterOperationService = { get: () => {}, post: () => {} };
  for (const name of ["inspectEnterpriseSetup", "resumeEnterpriseSetup"])
    router.prepareRouter({
      routerDef: { ...definitions[name], apiVersion: "v7" },
      urlPrefix: "customProfile",
      moduleName: "profile",
      routerName: name,
      moduleRouter: {},
    });
  const descriptor = f.owner.workspaceDescriptor();
  assert.equal(
    descriptor.actions.inspect.path,
    "/customRoot/customProfile/v7/enterprises/{enterpriseCode}/setup",
  );
  assert.equal(
    descriptor.actions.resume.path,
    "/customRoot/customProfile/v7/enterprises/{enterpriseCode}/setup/resume",
  );
  assert.equal(descriptor.available, true);
  registry.duplicate = { ...Object.values(registry)[0] };
  assert.equal(f.owner.workspaceDescriptor().available, false);
  assert.equal(f.owner.workspaceDescriptor().actions.inspect, undefined);
  delete registry.duplicate;
  Object.values(registry)[0].url = "https://external.invalid/setup";
  assert.equal(f.owner.workspaceDescriptor().available, false);
});

test("actual controller/facade/management inspection retains old-record HELD and no private DTO", async () => {
  const f = fixture();
  delete f.row.setupContinuation;
  const controller = {
    ...require("../src/controller/enterprise/defaultEnterpriseManagementController"),
  };
  global.FACADE = {
    DefaultEnterpriseManagementFacade: {
      ...require("../src/facade/enterprise/defaultEnterpriseManagementFacade"),
    },
  };
  const response = await controller.inspectEnterpriseSetup(f.request());
  assert.equal(response.code, "SUC_PRFL_00000");
  assert.equal(response.data.setup.state, "HELD");
  assert.deepEqual(response.data.setup.reasonCodes, [
    "ORIGINAL_INTENT_UNAVAILABLE",
  ]);
  assert.equal(response.data.setup.revision, null);
  assert.equal(response.data.setupContinuation, undefined);
  assert.equal(f.effects.writes, 0);
});
