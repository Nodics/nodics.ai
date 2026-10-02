/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

/**
 * @module profile/test/mandatoryIdentityBootstrapService
 * @description Verifies idempotent, audited creation of missing configured identity groups, metadata reconciliation, and local generated runtime credential repair without exposing tenant secrets.
 * @layer test
 * @owner profile
 * @override Projects may extend group targets and bootstrap services through layered configuration.
 */

const groups = [
  { code: "userGroup", active: true, parentGroups: [] },
  { code: "adminGroup", active: true, parentGroups: ["customParent"] },
];
const employees = [
  {
    _id: "admin-id",
    code: "admin",
    loginId: "admin",
    active: true,
    principalType: "human",
    password: "original-admin-password",
    userGroups: ["adminGroup"],
  },
  {
    _id: "api-admin-id",
    code: "apiAdmin",
    loginId: "apiAdmin",
    active: true,
    apiKey: "existing-api-key",
    userGroups: ["employeeUserGroup"],
  },
];
const saved = [];
const employeeUpdates = [];
const scopeAssignments = [];
const passwordSaves = [];
const credential = {
  _id: "original-admin-password",
  loginId: "admin",
  active: true,
  password: "old-hash",
};
const userStates = [];
const userStateSaves = [];
const audits = [];

global.CLASSES = {
  NodicsError: class NodicsError extends Error {
    constructor(code, message) {
      super(message || code);
      this.code = code;
    }
  },
};
global.CONFIG = {
  /** Returns layered identity-governance test configuration. */
  get: function (key) {
    if (key === "defaultTenant") return "default";
    if (key === "defaultEnterprise") return "default";
    if (key === "defaultAuthDetail")
      return {
        apiKey:
          process.env.NODICS_PLATFORM_API_KEY ||
          process.env.NODICS_RUNTIME_API_KEY,
        entCode: "default",
      };
    if (key === "runtimeIdentity")
      return {
        instanceCode: "kickoff-local-platform-1",
        remoteModules: ["axis"],
      };
    if (key === "bootstrapIdentity") return { adminPassword: "adminPassword" };
    if (key === "identityGovernance")
      return {
        migration: {
          version: 2,
          reconcileMissingGroupsOnStartup: true,
          groupTargets: {
            childServiceGroup: {
              parentGroups: ["parentServiceGroup"],
            },
            parentServiceGroup: { parentGroups: ["userGroup"] },
            userGroup: { parentGroups: [] },
            adminGroup: { parentGroups: ["userGroup"] },
            serviceAccountUserGroup: {
              parentGroups: ["userGroup"],
              permissions: ["auth.internal.token.read"],
            },
          },
          servicePrincipalCodes: ["apiAdmin"],
          administratorCodes: ["admin"],
          servicePrincipalScopes: {
            apiAdmin: [
              "auth.internal.token.read",
              "auth.internal.token.read.anyTenant",
            ],
          },
          serviceGroup: "serviceAccountUserGroup",
        },
      };
  },
};
global.NODICS = {
  getModels: () => ({
    PasswordModel: {
      rawSchema: { credentialRetirement: { enabled: false } },
    },
  }),
};
global.SERVICE = {
  DefaultProfileService: { getProfileModuleName: () => "profile" },
  DefaultPrincipalSecurityStampGovernanceService: require("../src/service/identity/defaultPrincipalSecurityStampGovernanceService"),
  DefaultPasswordSaveInterceptorService: {
    ...require("../src/service/interceptors/defaultPasswordSaveInterceptorService"),
  },
  DefaultModelConcurrencyService: {
    ...require("../../../../nodics.foundation/modules/nDatabase/database/src/service/schema/defaultModelConcurrencyService"),
  },
  DefaultIdentityGovernanceService: {
    /** Returns system authorization for generated service calls. */
    getSystemAuthData: function () {
      return { isSystem: true };
    },
  },
  DefaultUserGroupService: {
    /** Returns mutable in-memory group fixtures. */
    get: function (request) {
      let result = groups.slice();
      let codes = request.query && request.query.code && request.query.code.$in;
      if (Array.isArray(codes)) {
        result = result.filter((group) => codes.includes(group.code));
      }
      let pageSize =
        (request.searchOptions && request.searchOptions.pageSize) || 10;
      let pageNumber =
        (request.searchOptions && request.searchOptions.pageNumber) || 1;
      let skip = pageSize * Math.max(pageNumber - 1, 0);
      return Promise.resolve({
        result: result.slice(skip, skip + pageSize),
      });
    },
    /** Saves one missing group fixture through the code-scoped upsert contract. */
    save: function (request) {
      assert.deepStrictEqual(request.query, { code: request.model.code });
      saved.push(request.model);
      let existing = groups.find((group) => group.code === request.model.code);
      if (existing) {
        Object.assign(existing, request.model);
      } else {
        groups.push(request.model);
      }
      return Promise.resolve({ result: request.model });
    },
  },
  DefaultEmployeeService: {
    /** Returns configured service-principal fixtures. */
    get: function (request) {
      let result = employees.slice();
      let codes = request.query && request.query.code && request.query.code.$in;
      if (Array.isArray(codes)) {
        result = result.filter((employee) => codes.includes(employee.code));
      }
      if (request.query?.password)
        result = result.filter(
          (employee) => employee.password === request.query.password,
        );
      return Promise.resolve({
        code: "SUC_READ",
        count: result.length,
        result,
      });
    },
    /** Applies only non-secret service-principal metadata updates. */
    update: function (request) {
      employeeUpdates.push(request);
      employees.forEach((employee) => {
        if (employee.code === request.query.code) {
          if (request.model && request.model.$set)
            Object.assign(employee, request.model.$set);
          else Object.assign(employee, request.model);
          Object.keys((request.model && request.model.$unset) || {}).forEach(
            (key) => {
              delete employee[key];
            },
          );
        }
      });
      return Promise.resolve({ result: request.model });
    },
  },
  DefaultAPIKeyCredentialService: {
    /** Returns a deterministic test digest for local credential reconciliation. */
    digest: function (apiKey) {
      return "hash:" + apiKey;
    },
    /** Returns sanitized persisted credential fields. */
    prepare: function (apiKey) {
      return { apiKeyHash: "hash:" + apiKey };
    },
  },
  DefaultPasswordService: {
    get: async (request) => ({
      code: "SUC_READ",
      count: request.query._id === credential._id ? 1 : 0,
      result: request.query._id === credential._id ? [{ ...credential }] : [],
    }),
    /** Captures local administrator password bootstrap writes without exposing the password in assertions. */
    update: function (request) {
      passwordSaves.push(request);
      assert.strictEqual(request.query._id, credential._id);
      assert.strictEqual(request.query.password, credential.password);
      credential.password = "new-hash";
      return Promise.resolve({
        code: "SUC_UPDATE",
        result: { acknowledged: true, matchedCount: 1 },
      });
    },
  },
  DefaultCustomerService: {
    get: async () => ({ code: "SUC_READ", count: 0, result: [] }),
  },
  DefaultUserStateService: {
    /** Returns mutable in-memory user-state fixtures. */
    findUserState: function (request) {
      const state = userStates.find(
        (item) =>
          item.loginId === request.loginId && item.personId === request._id,
      );
      return Promise.resolve(
        state || {
          loginId: request.loginId,
          personId: request._id,
          attempts: 0,
          active: true,
        },
      );
    },
    /** Captures local administrator state reconciliation writes. */
    save: function (request) {
      userStateSaves.push(request);
      const existing = userStates.find(
        (item) =>
          item.loginId === request.model.loginId &&
          item.personId === request.model.personId,
      );
      if (existing) Object.assign(existing, request.model);
      else userStates.push(request.model);
      return Promise.resolve({ result: request.model });
    },
  },
  DefaultIdentityMigrationAuditService: {
    /** Captures sanitized bootstrap audit fixtures. */
    save: function (request) {
      audits.push(request.model);
      return Promise.resolve({ result: request.model });
    },
  },
  DefaultPrincipalScopeAssignmentService: {
    /** Returns local runtime grant fixtures. */
    get: function (request) {
      let result = scopeAssignments.slice();
      if (request.query && request.query.code)
        result = result.filter((item) => item.code === request.query.code);
      return Promise.resolve({ code: "SUC_GET_00000", result });
    },
    /** Saves one local runtime grant fixture. */
    save: function (request) {
      scopeAssignments.push(request.model);
      return Promise.resolve({ result: request.model });
    },
    /** Updates one local runtime grant fixture. */
    update: function (request) {
      const assignment = scopeAssignments.find(
        (item) => Object.entries(request.query).every(([key, value]) =>
          JSON.stringify(item[key]) === JSON.stringify(value)),
      );
      if (assignment) Object.assign(assignment, request.model);
      return Promise.resolve({ code: "SUC_UPD_00000", result: {
        acknowledged: true, matchedCount: assignment ? 1 : 0, modifiedCount: assignment ? 1 : 0,
      } });
    },
  },
};

const service = require("../src/service/identity/defaultMandatoryIdentityBootstrapService");

(async function () {
  const first = await service.reconcile({
    tenant: "default",
    correlationId: "bootstrap-test",
  });
  assert.deepStrictEqual(first, {
    status: "RECONCILED",
    createdGroups: [
      "parentServiceGroup",
      "childServiceGroup",
      "serviceAccountUserGroup",
    ],
    reconciledServicePrincipals: ["apiAdmin"],
    reconciledRuntimeDeploymentGrants: [],
    reconciledAdministrators: [],
  });
  assert.strictEqual(saved.length, 3);
  assert(
    saved.findIndex((group) => group.code === "parentServiceGroup") <
      saved.findIndex((group) => group.code === "childServiceGroup"),
  );
  assert.strictEqual(
    groups.find((group) => group.code === "adminGroup").parentGroups[0],
    "customParent",
  );
  assert.strictEqual(employeeUpdates.length, 1);
  assert.strictEqual(employeeUpdates[0].model.principalType, "service");
  assert.deepStrictEqual(employeeUpdates[0].model.userGroups, [
    "serviceAccountUserGroup",
  ]);
  assert.deepStrictEqual(employeeUpdates[0].model.apiKeyScopes, [
    "auth.internal.token.read",
    "auth.internal.token.read.anyTenant",
  ]);
  assert.strictEqual(employeeUpdates[0].model.identityMigrationVersion, 2);
  assert.strictEqual(employeeUpdates[0].model.apiKeyStatus, "active");
  assert.strictEqual(employeeUpdates[0].model.apiKey, undefined);
  assert.strictEqual(
    employees.find((employee) => employee.code === "apiAdmin").apiKey,
    "existing-api-key",
  );
  assert.strictEqual(audits.length, 1);
  assert.deepStrictEqual(audits[0].result.createdGroups, [
    "parentServiceGroup",
    "childServiceGroup",
    "serviceAccountUserGroup",
  ]);
  assert.deepStrictEqual(audits[0].result.reconciledServicePrincipals, [
    "apiAdmin",
  ]);

  employees.find((employee) => employee.code === "apiAdmin").userGroups = [
    { code: "serviceAccountUserGroup" },
  ];
  const second = await service.reconcile({ tenant: "default" });
  assert.deepStrictEqual(second, {
    status: "NO_CHANGES",
    createdGroups: [],
    reconciledServicePrincipals: [],
    reconciledRuntimeDeploymentGrants: [],
    reconciledAdministrators: [],
  });
  assert.strictEqual(saved.length, 3);
  assert.strictEqual(employeeUpdates.length, 1);
  assert.strictEqual(audits.length, 1);

  groups.unshift(
    { code: "unrelatedGroup0" },
    { code: "unrelatedGroup1" },
    { code: "unrelatedGroup2" },
    { code: "unrelatedGroup3" },
    { code: "unrelatedGroup4" },
    { code: "unrelatedGroup5" },
    { code: "unrelatedGroup6" },
    { code: "unrelatedGroup7" },
    { code: "unrelatedGroup8" },
    { code: "unrelatedGroup9" },
    { code: "unrelatedGroup10" },
  );
  const third = await service.reconcile({ tenant: "default" });
  assert.deepStrictEqual(third, {
    status: "NO_CHANGES",
    createdGroups: [],
    reconciledServicePrincipals: [],
    reconciledRuntimeDeploymentGrants: [],
    reconciledAdministrators: [],
  });
  assert.strictEqual(saved.length, 3);
  assert.strictEqual(employeeUpdates.length, 1);
  assert.strictEqual(
    groups.filter((group) => group.code === "serviceAccountUserGroup").length,
    1,
  );
  assert.strictEqual(audits.length, 1);

  const previousNodics = global.NODICS;
  const previousUtils = global.UTILS;
  const previousRuntimeApiKey = process.env.NODICS_RUNTIME_API_KEY;
  const previousPlatformApiKey = process.env.NODICS_PLATFORM_API_KEY;
  global.NODICS = {
    getModels: previousNodics.getModels,
    getEnvironmentName: () => "nodics.kickoff",
    getSelectedEnvironmentName: () => "kickoffLocal",
    getServerName: () => "platformServer",
    getActiveModules: () => ["profile", "backoffice"],
  };
  global.UTILS = { compareHash: async (_, hash) => hash === "new-hash" };
  process.env.NODICS_RUNTIME_API_KEY =
    "local-runtime-api-key-with-at-least-thirty-two-characters";
  process.env.NODICS_PLATFORM_API_KEY =
    "local-platform-api-key-with-at-least-thirty-two-characters";
  employees.find((employee) => employee.code === "apiAdmin").apiKeyHash =
    "hash:old-local-runtime-key";
  employees.find((employee) => employee.code === "admin")._id = "admin-id";
  userStates.push({
    loginId: "admin",
    personId: "admin-id",
    attempts: 5,
    locked: true,
    lockedTime: new Date(),
    active: true,
  });
  const fourth = await service.reconcile({ tenant: "default" });
  assert.deepStrictEqual(fourth, {
    status: "RECONCILED",
    createdGroups: [],
    reconciledServicePrincipals: ["apiAdmin"],
    reconciledRuntimeDeploymentGrants: [
      "kickoff-local-platform-runtime-deployment",
    ],
    reconciledAdministrators: ["admin"],
  });
  assert.strictEqual(employeeUpdates.length, 2);
  const apiAdminUpdate = employeeUpdates.find(
    (update) => update.query.code === "apiAdmin" && update.model.$set,
  );
  assert.strictEqual(
    apiAdminUpdate.model.$set.apiKeyHash,
    "hash:" + process.env.NODICS_PLATFORM_API_KEY,
  );
  assert.deepStrictEqual(apiAdminUpdate.model.$unset, { apiKey: 1 });
  assert.strictEqual(
    employees.find((employee) => employee.code === "apiAdmin").apiKey,
    undefined,
  );

  const refreshedScopeCredential = service.buildLocalRuntimeCredentialUpdate(
    {
      code: "apiAdmin",
      apiKeyHash: "hash:" + process.env.NODICS_PLATFORM_API_KEY,
      apiKeyScopes: ["auth.internal.token.read"],
      apiKeyStatus: "active",
      identityMigrationVersion: 2,
    },
    {
      version: 2,
      servicePrincipalCodes: ["apiAdmin"],
      servicePrincipalScopes: {
        apiAdmin: [
          "auth.internal.token.read",
          "profile.enterprise.reference.read",
        ],
      },
    },
  );
  assert.deepStrictEqual(refreshedScopeCredential.apiKeyScopes, [
    "auth.internal.token.read",
    "profile.enterprise.reference.read",
  ]);
  assert.strictEqual(
    service.buildLocalRuntimeCredentialUpdate(
      {
        code: "apiAdmin",
        apiKeyHash: "hash:" + process.env.NODICS_PLATFORM_API_KEY,
        apiKeyScopes: [
          "auth.internal.token.read",
          "profile.enterprise.reference.read",
        ],
        apiKeyStatus: "active",
        identityMigrationVersion: 2,
      },
      {
        version: 2,
        servicePrincipalCodes: ["apiAdmin"],
        servicePrincipalScopes: {
          apiAdmin: [
            "auth.internal.token.read",
            "profile.enterprise.reference.read",
          ],
        },
      },
    ),
    null,
  );

  assert.strictEqual(scopeAssignments.length, 1);
  assert.strictEqual(scopeAssignments[0].principalCode, "apiAdmin");
  assert.strictEqual(
    scopeAssignments[0].runtimeScope.instanceCode,
    "kickoff-local-platform-1",
  );
  assert.strictEqual(passwordSaves.length, 1);
  assert.strictEqual(passwordSaves[0].model.password, "adminPassword");
  assert(
    employeeUpdates.every((update) => update.model.password === undefined),
  );
  assert.strictEqual(
    employees.find((employee) => employee.code === "admin").password,
    "original-admin-password",
  );
  assert.strictEqual(userStateSaves.length, 1);
  assert.strictEqual(userStateSaves[0].model.loginId, "admin");
  assert.strictEqual(userStateSaves[0].model.attempts, 0);
  assert.strictEqual(userStateSaves[0].model.locked, false);

  const projectRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), "nodics-profile-runtime-grants-"),
  );
  const writeJson = (file, value) => {
    if (value.nodics) value.nodics = {
      displayName: value.name, owns: ["configuration"],
      runtime: { router: false, publish: false, web: false }, ...value.nodics,
    };
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n");
  };
  const writeProperties = (directory, value) => {
    const file = path.join(directory, "config/properties.js");
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(
      file,
      "module.exports = " + JSON.stringify(value, null, 2) + ";\n",
    );
    delete require.cache[require.resolve(file)];
  };
  writeJson(path.join(projectRoot, "package.json"), {
    name: "nodics.kickoff",
    index: "1000.00",
    nodics: { kind: "application", runtimeModule: true },
  });
  writeJson(path.join(projectRoot, "envs", "kickoffLocal", "package.json"), {
    name: "kickoffLocal",
    index: "1100.00",
    nodics: { kind: "group", runtimeModule: true, deploymentClass: "LOCAL" },
  });
  writeJson(
    path.join(
      projectRoot,
      "envs",
      "kickoffLocal",
      "platformServer",
      "package.json",
    ),
    {
      name: "platformServer",
      index: "1200.00",
      nodics: {
        kind: "server",
        runtimeModule: true,
        runtimeModuleRoots: ["nodics.platform"],
        runtimeIdentity: {
          instanceCode: "kickoff-local-platform-1",
          remoteModules: ["axis"],
        },
      },
    },
  );
  writeJson(
    path.join(
      projectRoot,
      "envs",
      "kickoffLocal",
      "wasteServer",
      "package.json",
    ),
    {
      name: "wasteServer",
      index: "1201.00",
      nodics: {
        kind: "server",
        runtimeModule: true,
        runtimeIdentity: {
          instanceCode: "kickoff-local-waste-1",
          remoteModules: ["profile", "location"],
        },
      },
    },
  );
  writeProperties(
    path.join(projectRoot, "envs", "kickoffLocal", "platformServer"),
    {
      activeModules: { groups: ["nodics.platform"], modules: ["profile", "backoffice"] },
      servers: { default: { endpoint: { httpPort: 4300 } } },
      identityGovernance: { migration: {
        servicePrincipalScopes: { apiAdmin: ["auth.internal.token.read"] },
        localRuntimeDeploymentGrantPermissions: ["profile.enterprise.search", "communication.request", "communication.verification.execute"],
      } },
    },
  );
  writeProperties(projectRoot, {});
  writeProperties(path.join(projectRoot, "envs", "kickoffLocal"), {});
  writeProperties(
    path.join(projectRoot, "envs", "kickoffLocal", "wasteServer"),
    {
      activeModules: { modules: ["waste", "rulesApi"] },
      servers: { default: { endpoint: { httpPort: 4370 } } },
      identityGovernance: { migration: {
        servicePrincipalScopes: { apiAdmin: ["auth.internal.token.read"] },
        localRuntimeDeploymentGrantPermissions: ["profile.enterprise.search", "rules.approval.callback"],
      } },
    },
  );
  global.NODICS = {
    getModels: previousNodics.getModels,
    getNodicsHome: () =>
      path.resolve(__dirname, "../../../../nodics.foundation"),
    getCustomHome: () => projectRoot,
    getEnvironmentName: () => "nodics.kickoff",
    getSelectedEnvironmentName: () => "kickoffLocal",
    getServerName: () => "platformServer",
    getActiveModules: () => ["profile", "backoffice"],
  };
  process.env.NODICS_RUNTIME_API_KEY =
    "local-runtime-api-key-with-at-least-thirty-two-characters";
  const originalDeploymentReader = service.readResolvedRuntimeDeployment;
  const selectors = ["S", "SERVER", "E", "ENV", "NODICS_NODE", "N", "NODE"];
  const originalSelectors = Object.fromEntries(selectors.map(key => [key, process.env[key]]));
  let actualComposition;
  try {
    for (const key of selectors) process.env[key] = "unrelatedSelectedRuntime";
    actualComposition = originalDeploymentReader.call(service, {
      projectRoot, environmentCode: "kickoffLocal", serverCode: "platformServer",
    });
  } finally {
    for (const key of selectors) {
      if (originalSelectors[key] === undefined) delete process.env[key];
      else process.env[key] = originalSelectors[key];
    }
  }
  assert(actualComposition.modules.includes("profile"));
  assert(actualComposition.modules.includes("nodics.foundation"));
  assert(actualComposition.modules.includes("platformServer"));
  assert(!actualComposition.modules.includes("wasteServer"), "sibling discovery cannot activate another server");
  assert(!actualComposition.modules.includes("wasteAsset"), "available inactive schemas/modules are not grants");
  assert(actualComposition.properties.identityGovernance.migration.localRuntimeDeploymentGrantPermissions.includes("communication.request"),
    "the canonical loader retains the selected server permission override");
  service.readResolvedRuntimeDeployment = (coordinates) => {
    const properties = service.getDeploymentConfigurationService().readDeploymentConfiguration(coordinates);
    return { properties, modules: properties.activeModules.modules.concat(
      coordinates.serverCode === "platformServer" ? ["platform", "identityCore"] : ["wasteCore"],
    ) };
  };
  const discovered = await service.reconcileLocalRuntimeDeploymentGrant(
    { tenant: "default" },
    {
      version: 2,
      servicePrincipalScopes: { apiAdmin: ["auth.internal.token.read"] },
      localRuntimeDeploymentGrantPermissions: [
        "profile.enterprise.search",
        "communication.request",
        "communication.verification.execute",
        "callerOnly.execute",
      ],
    },
  );
  assert(discovered.includes("kickoff-local-platform-runtime-deployment"));
  assert(discovered.includes("kickoff-local-waste-runtime-deployment"));
  const wasteGrant = scopeAssignments.find(
    (item) => item.code === "kickoff-local-waste-runtime-deployment",
  );
  assert.deepStrictEqual(wasteGrant.runtimeScope.modules, [
    "waste",
    "rulesApi",
    "wasteCore",
    "profile",
    "location",
  ]);
  assert.deepStrictEqual(wasteGrant.runtimeScope.permissions, [
    "auth.internal.token.read",
    "profile.enterprise.search",
    "rules.approval.callback",
  ]);
  const platformGrant = scopeAssignments.find(item => item.code === "kickoff-local-platform-runtime-deployment");
  assert.deepStrictEqual(platformGrant.runtimeScope.permissions, [
    "auth.internal.token.read", "profile.enterprise.search", "communication.request", "communication.verification.execute",
  ], "Platform receives its resolved policy, never extra caller permissions");
  assert(!wasteGrant.runtimeScope.permissions.includes("communication.request"), "Platform-only permissions cannot reach sibling grants");
  assert.deepStrictEqual(platformGrant.runtimeScope.modules, ["profile", "backoffice", "platform", "identityCore", "axis"]);
  assert(!platformGrant.runtimeScope.modules.includes("inactiveDiscoveredModule"));
  const unchanged = await service.reconcileLocalRuntimeDeploymentGrant({ tenant: "default" }, {
    servicePrincipalScopes: { apiAdmin: ["auth.internal.token.read"] },
    localRuntimeDeploymentGrantPermissions: ["profile.enterprise.search", "rules.approval.callback"],
  });
  assert.deepStrictEqual(unchanged, [], "retained composed grants are idempotent");
  const callerIndependent = service.discoverLocalRuntimeScopes({});
  assert.deepStrictEqual(callerIndependent.find(scope => scope.serverCode === "wasteServer").permissions,
    wasteGrant.runtimeScope.permissions, "an empty caller policy cannot suppress a configured sibling");
  const resolvedReader = service.readResolvedRuntimeDeployment;
  const originalPermissions = service.runtimeGrantPermissions;
  const policyInputs = [];
  service.runtimeGrantPermissions = function (policy) {
    policyInputs.push(policy);
    return originalPermissions.call(this, policy);
  };
  assert.strictEqual(service.discoverLocalRuntimeScopes({}).length, 2);
  assert(policyInputs.some(policy => policy.localRuntimeDeploymentGrantPermissions.includes("communication.request")));
  assert(policyInputs.some(policy => policy.localRuntimeDeploymentGrantPermissions.includes("rules.approval.callback")),
    "later-layer permission resolver receives each selected runtime policy");
  service.runtimeGrantPermissions = originalPermissions;
  for (const migration of [undefined, {}]) {
    const before = JSON.stringify(scopeAssignments);
    service.readResolvedRuntimeDeployment = coordinates => {
      const resolved = resolvedReader(coordinates);
      if (coordinates.serverCode === "wasteServer") resolved.properties.identityGovernance = { migration };
      return resolved;
    };
    assert.throws(() => service.reconcileLocalRuntimeDeploymentGrant({ tenant: "default" }, {
      servicePrincipalScopes: { apiAdmin: ["callerOnly.execute"] },
    }), error => error.code === "ERR_AUTH_00003");
    assert.strictEqual(JSON.stringify(scopeAssignments), before, "missing sibling policy fails before any assignment write, without caller fallback");
  }
  service.readResolvedRuntimeDeployment = resolvedReader;
  platformGrant.status = "REVOKED";
  await assert.rejects(service.reconcileRuntimeDeploymentGrantScope({ tenant: "default" }, platformGrant.runtimeScope),
    error => error.code === "ERR_AUTH_00003");
  assert.strictEqual(platformGrant.status, "REVOKED", "bootstrap cannot restore revoked grants");
  platformGrant.status = "ACTIVE";
  const originalGrantUpdate = SERVICE.DefaultPrincipalScopeAssignmentService.update;
  SERVICE.DefaultPrincipalScopeAssignmentService.update = (request) => {
    platformGrant.status = "REVOKED";
    return originalGrantUpdate(request);
  };
  const oldModules = platformGrant.runtimeScope.modules.slice();
  await assert.rejects(service.reconcileRuntimeDeploymentGrantScope({ tenant: "default" }, {
    ...platformGrant.runtimeScope, modules: oldModules.concat("additionalApprovedOwner"),
  }), error => error.code === "ERR_AUTH_00003");
  assert.strictEqual(platformGrant.status, "REVOKED", "late revocation must fence reconciliation");
  assert.deepStrictEqual(platformGrant.runtimeScope.modules, oldModules);
  SERVICE.DefaultPrincipalScopeAssignmentService.update = originalGrantUpdate;
  platformGrant.status = "ACTIVE";
  const snapshot = JSON.stringify(scopeAssignments);
  service.readResolvedRuntimeDeployment = () => { throw new Error("invalid composition"); };
  assert.throws(() => service.reconcileLocalRuntimeDeploymentGrant({ tenant: "default" }, {
    servicePrincipalScopes: { apiAdmin: ["auth.internal.token.read"] },
  }), error => error.code === "ERR_AUTH_00003");
  assert.strictEqual(JSON.stringify(scopeAssignments), snapshot, "all compositions resolve before any assignment write");
  service.readResolvedRuntimeDeployment = originalDeploymentReader;
  fs.rmSync(projectRoot, { recursive: true, force: true });

  if (previousRuntimeApiKey === undefined)
    delete process.env.NODICS_RUNTIME_API_KEY;
  else process.env.NODICS_RUNTIME_API_KEY = previousRuntimeApiKey;
  if (previousPlatformApiKey === undefined)
    delete process.env.NODICS_PLATFORM_API_KEY;
  else process.env.NODICS_PLATFORM_API_KEY = previousPlatformApiKey;
  global.NODICS = previousNodics;
  global.UTILS = previousUtils;

  console.log("Mandatory identity bootstrap reconciliation validated");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});

require("node:test")(
  "tenant bootstrap awaits governed Init and rejects before identity reconciliation on failure",
  async () => {
    const source = require("../src/service/identity/defaultMandatoryIdentityBootstrapService");
    const calls = [];
    let finish;
    SERVICE.DefaultDataReleaseService = {
      installStartupReleases: (request) => {
        assert.strictEqual(request.tenant, "other-tenant");
        assert.deepStrictEqual(request.modules, ["profile"]);
        assert.strictEqual(request.authData.isSystem, true);
        return new Promise((resolve) => {
          finish = resolve;
        });
      },
    };
    const instance = {
      ...source,
      reconcile: async () => {
        calls.push("reconcile");
        return { status: "NO_CHANGES" };
      },
    };
    const pending = instance.prepareTenant({
      tenant: "other-tenant",
      modules: ["profile"],
    });
    await Promise.resolve();
    assert.deepStrictEqual(calls, []);
    finish();
    await pending;
    assert.deepStrictEqual(calls, ["reconcile"]);
    SERVICE.DefaultDataReleaseService.installStartupReleases = async () => {
      throw new Error("Init is RUNNING");
    };
    await assert.rejects(
      instance.prepareTenant({ tenant: "other-tenant" }),
      /Init is RUNNING/,
    );
    assert.deepStrictEqual(calls, ["reconcile"]);
  },
);
