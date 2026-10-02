/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module nService/test/tenantNamespaceHandshakeContract @description Deferred proof-bound pre-provider and remote activation-race fixtures using memory only. @layer test @owner nService */
const assert = require("node:assert/strict");
const { test, beforeEach, afterEach } = require("node:test");
const handler = require("../src/service/enterprise/defaultEnterpriseHandlerService");
const listener = require("../src/service/enterprise/defaultEnterpriseUpdateListenerService");
let previous;
beforeEach(() => { previous = Object.fromEntries(["SERVICE", "CONFIG", "NODICS", "CLASSES", "UTILS", "_"].map(key => [key, global[key]])); });
afterEach(() => { for (const [key, value] of Object.entries(previous)) if (value === undefined) delete global[key]; else global[key] = value; });
function fixture() {
  global._ = require("lodash");
  global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
  const candidate = { scopeKey: "deployment_test", binding: { version: 1 } };
  const state = { order: [], opened: 0, invocation: undefined, active: [], tokens: {}, enterprises: {}, config: { tenantNamespace: {} } };
  global.CONFIG = {
    get: key => key === "defaultTenant" ? "default" : key === "database" ? state.config : key === "profileTenantProvisioning" ? { enabled: true } : undefined,
    getProperties: () => ({}), setProperties: properties => { if (properties.database) state.config = properties.database; },
  };
  global.NODICS = { isModuleActive: () => false, getActiveModules: () => [],
    addInternalAuthToken: (tenant, token) => { state.tokens[tenant] = token; },
    getInternalAuthTokens: () => state.tokens, getActiveTenants: () => state.active,
    addActiveEnterprise: (code, tenant) => { state.enterprises[code] = tenant; },
    getTenantForEnterprise: code => state.enterprises[code],
    addActiveTenant: tenant => state.active.push(tenant), removeActiveTenant: tenant => { state.active = state.active.filter(code => code !== tenant); } };
  const record = { code: "tenant-a", active: true, properties: { database: { tenantNamespace: {},
    tenantNamespaceBindings: { [candidate.scopeKey]: candidate.binding } } } };
  global.SERVICE = {
    DefaultInternalAuthenticationProviderService: { fetchInternalAuthToken: async tenant => {
      state.order.push("proof:" + tenant); return { authToken: "retained-proof" };
    } },
    DefaultDatabaseConfigurationService: { buildTenantNamespaceBinding: () => { state.order.push("candidate"); return candidate; },
      assertTenantNamespaceBinding: () => state.order.push("pin-admitted"), getDatabaseActiveModules: () => ["profile"], getDatabaseConfiguration: () => true },
    DefaultLoggerService: { runSensitiveOperation: async (context, work) => { state.order.push("private"); return work(); } },
    DefaultModuleService: { invokeModule: async invocation => { state.invocation = invocation; state.order.push("handshake"); return record; } },
    DefaultDatabaseConnectionHandlerService: { createDatabaseConnection: async () => { state.opened++; state.order.push("provider"); } },
    DefaultDatabaseModelHandlerService: { buildModelsForTenant: async () => true },
  };
  return { state, record, owner: { ...handler } };
}
test("default-tenant retained proof and fixed private module command precede target provider admission", async () => {
  const f = fixture(); await f.owner.prepareEnterpriseTenant({ code: "enterprise-a", tenant: { code: "tenant-a", properties: {} } });
  assert.ok(f.state.order.indexOf("handshake") < f.state.order.indexOf("provider"));
  assert.ok(f.state.order.indexOf("pin-admitted") < f.state.order.indexOf("provider"));
  const command = f.state.invocation;
  assert.equal(command.tenant, "default"); assert.equal(command.authToken, "retained-proof");
  assert.equal(command.serviceName, "DefaultEnterpriseTenantProvisioningService"); assert.equal(command.operationName, "bindWithProof");
  assert.equal(command.apiName, "/internal/tenants/tenant-a/namespace-bindings"); assert.equal(command.methodName, "POST");
  assert.equal(command.maxAttempts, 1); assert.deepEqual(command.secureTransport, { required: true, allowInsecureLoopback: false });
  assert.equal(command.followRedirects, false);
  assert.deepEqual(f.state.order.filter(item => item.startsWith("proof:")), ["proof:default", "proof:tenant-a"]);
  assert.deepEqual(Object.keys(f.state.tokens), ["tenant-a"]);
});

test("actual Init, Profile bootstrap, API-key provider and grants issue target proof for ordinary business transport", async () => {
  const f = fixture();
  const provider = require("../src/service/authentication/defaultInternalAuthenticationProviderService");
  const authentication = require("../../../../nodics.platform/modules/profile/src/service/authentication/defaultAuthenticationProviderService");
  const issuer = require("../../../../nodics.platform/modules/profile/src/service/authentication/defaultInternalAuthenticationProviderService");
  const authorization = require("../../../../nodics.platform/modules/profile/src/service/identity/defaultRuntimeAuthorizationService");
  const bootstrap = require("../../../../nodics.platform/modules/profile/src/service/identity/defaultMandatoryIdentityBootstrapService");
  const provisioning = require("../../../../nodics.platform/modules/profile/src/service/enterprise/defaultEnterpriseTenantProvisioningService");
  const employee = require("../../../../nodics.platform/modules/profile/src/service/employee/defaultEmployeeService");
  const apiKeys = require("../../nAuth/src/service/identity/defaultAPIKeyCredentialService");
  const releases = require("../../nData/nImport/import/src/service/release/defaultDataReleaseService");
  const authProperties = require("../../nAuth/config/properties");
  const importProperties = require("../../nData/nImport/import/config/properties");
  const provisioningPolicy = require("../../../../nodics.platform/modules/profile/config/properties").profileTenantProvisioning;
  // A selected deployment must explicitly approve binding in its existing native grant policy.
  const migration = { ...authProperties.identityGovernance.migration,
    localRuntimeDeploymentGrantPermissions: [...authProperties.identityGovernance.migration.localRuntimeDeploymentGrantPermissions, provisioningPolicy.permission] };
  const key = "fictional-runtime-proof-not-for-deployment-only";
  const scope = { projectCode: "test.project", environmentCode: "testLocal", serverCode: "platformServer", instanceCode: "platform-1",
    modules: ["profile"], permissions: bootstrap.runtimeGrantPermissions(migration) };
  assert(scope.permissions.includes(provisioningPolicy.permission));
  const grant = { code: "platform-grant", principalType: "service", principalCode: "apiAdmin", scopeType: "RUNTIME_DEPLOYMENT",
    tenantCode: "default", enterpriseCode: "platform", inheritanceMode: "DIRECT", status: "ACTIVE", effect: "ALLOW", runtimeScope: scope };
  const setupKey = "a".repeat(64), setupHash = "b".repeat(64);
  const scopeKey = "deployment_" + require("node:crypto").createHash("sha256")
    .update(JSON.stringify([scope.projectCode, scope.environmentCode, scope.serverCode])).digest("hex");
  f.record.properties.enterpriseProvisioning = { version: 1, enterpriseCode: "enterprise-a", setupRequestKey: setupKey,
    setupRequestHash: setupHash, deploymentScopes: { [scopeKey]: { scope: { projectCode: scope.projectCode,
      environmentCode: scope.environmentCode, serverCode: scope.serverCode }, modules: scope.modules } } };
  const targetGrants = [];
  const tenantProperties = {};
  CONFIG.setProperties = (properties, tenant) => { tenantProperties[tenant] = properties; if (properties.database) f.state.config = properties.database; };
  const original = CONFIG.get;
  CONFIG.get = (name, tenant) => name === "defaultAuthDetail" ? { entCode: tenantProperties[tenant]?.defaultAuthDetail?.entCode || "platform", apiKey: key }
    : name === "profileTenantProvisioning" ? { ...provisioningPolicy, enabled: true }
    : name === "runtimeIdentity" ? { instanceCode: scope.instanceCode }
    : name === "authSecurity" ? { internalToken: { maximumLifetimeSeconds: 300 },
      apiKey: { pepper: "fictional-test-pepper-not-for-deployment-only", requireScopes: true } }
    : name === "identityGovernance" ? { migration }
    : name === "data" ? importProperties.data
    : name === "runtimeRole" ? { code: "PLATFORM" }
    : name === "environment" ? { class: "LOCAL" } : original(name, tenant);
  Object.assign(NODICS, { isModuleActive: () => true, getActiveModules: () => scope.modules,
    getInternalAuthToken: tenant => f.state.tokens[tenant],
    getEnvironmentName: () => scope.projectCode, getSelectedEnvironmentName: () => scope.environmentCode,
    getServerName: () => scope.serverCode,
    getRawModule: name => name === "profile" ? { name, path: require("node:path").resolve(__dirname, "../../../../nodics.platform/modules/profile") } : undefined });
  let grantActive = true;
  const proofReads = [], issuedTenants = [];
  const native = { code: "apiAdmin", loginId: "apiAdmin", active: true, principalType: "human",
    userGroups: [], apiKeyScopes: scope.permissions, apiKeyHash: apiKeys.digest(key), apiKeyStatus: "active",
    identityMigrationVersion: migration.version || 1, password: "retained-target-reference" };
  const originalNative = structuredClone(native);
  const nativeUpdates = [];
  Object.assign(SERVICE, {
    DefaultEnterpriseService: { retrieveEnterprise: async code => {
      assert(["platform", "enterprise-a"].includes(code));
      return { code, active: true, tenant: { code: code === "platform" ? "default" : "tenant-a", active: true } };
    }, get: async request => ({ code: "SUC_FIND_00000", result: request.query.code === "enterprise-a"
      ? [{ code: "enterprise-a", active: true, tenant: "tenant-a", setupRequestKey: setupKey, setupRequestHash: setupHash }] : [] }) },
    DefaultTenantService: { get: async request => {
      assert.equal(request.options.skipItemCache, true);
      return { code: "SUC_FIND_00000", result: request.query.code === "tenant-a" ? [f.record] : [] };
    } },
    DefaultEnterpriseTeamAdministrationService: { readEnterpriseEnvelope: (service, request) => service.get(request) },
    DefaultTenantProvisioningGuardService: { invoke: (operation, request) => SERVICE.DefaultTenantService[operation](request) },
    DefaultAPIKeyCredentialService: apiKeys,
    DefaultEmployeeService: Object.assign(Object.create(employee), {
      get: async request => {
        if (request.query.apiKeyHash) {
          assert.equal(request.query.apiKeyHash === apiKeys.digest(key), true);
          proofReads.push(request.tenant);
          return { code: "SUC_FIND_00000", result: request.tenant === "default"
            ? [{ loginId: "apiAdmin", principalType: "service", active: true, authVersion: 2, apiKeyStatus: "active", apiKeyScopes: scope.permissions }]
            : [structuredClone(native)] };
        }
        assert.equal(request.tenant, "tenant-a");
        if (request.query.code.$in.includes("admin")) {
          f.state.order.push("administrator-inventory");
          return { code: "SUC_FIND_00000", result: [{ code: "admin", loginId: "admin", active: true }] };
        }
        assert.deepEqual(request.query.code.$in, migration.servicePrincipalCodes);
        return { code: "SUC_FIND_00000", result: [structuredClone(native)] };
      },
      update: async request => {
        assert.equal(request.tenant, "tenant-a"); assert.deepEqual(request.query, { code: "apiAdmin" });
        assert.equal(Object.keys(request.model).some(name => /password|apiKeyHash|apiKeyPrefix|\$/.test(name)), false);
        nativeUpdates.push(request.tenant); Object.assign(native, request.model);
        return { code: "SUC_UPDATE_00000", result: { acknowledged: true, matchedCount: 1 } };
      },
    }),
    DefaultUserGroupService: { get: async request => {
      assert.equal(request.tenant, "tenant-a"); f.state.order.push("reconcile");
      return { code: "SUC_FIND_00000", result: Object.keys(migration.groupTargets).map(code => ({ code, active: true })) };
    } },
    DefaultIdentityMigrationAuditService: { save: async request => {
      assert.equal(request.tenant, "tenant-a");
      assert.equal(request.model.result.reconciledRuntimeDeploymentGrants.length, 1);
      assert.deepEqual(request.model.result.reconciledAdministrators, []);
      return { code: "SUC_SAVE_00000", result: request.model };
    } },
    DefaultAuthenticationProviderService: Object.assign(Object.create(authentication), { recordAuthEvent: async () => true }),
    DefaultRuntimeAuthorizationService: authorization,
    DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ isSystem: true }) },
    DefaultUserStateService: { findUserState: async request => {
      assert.equal(request.tenant, "tenant-a"); assert.equal(request.loginId, "admin");
      return { active: true, attempts: 0, locked: false };
    }, save: async () => { throw new Error("Current administrator state must not be rewritten"); } },
    DefaultPrincipalScopeAssignmentService: { get: async request => {
      assert.equal(request.options.skipItemCache, true);
      if (request.tenant === "default") return { code: "SUC_FIND_00000", result: [{ ...grant, status: grantActive ? "ACTIVE" : "INACTIVE" }] };
      assert.equal(request.tenant, "tenant-a");
      return { code: "SUC_FIND_00000", result: targetGrants.filter(item => Object.entries(request.query).every(([name, value]) => item[name] === value)) };
    }, save: async request => {
      authorization.validateAssignment(request.model);
      assert.equal(request.model.tenantCode, "tenant-a"); assert.equal(request.model.enterpriseCode, "enterprise-a");
      targetGrants.push(structuredClone(request.model));
      return { code: "SUC_SAVE_00000", result: request.model };
    } },
    DefaultServiceTokenService: { issue: async options => {
      assert.deepEqual(options.userGroups, []);
      assert.equal(options.entCode, options.tenant === "default" ? "platform" : "enterprise-a");
      assert.equal(options.runtimeScope.assignmentCode, options.tenant === "default" ? "platform-grant" : targetGrants[0].code);
      issuedTenants.push(options.tenant); return "fictional-issued-runtime-proof-" + options.tenant;
    } },
    DefaultEnterpriseTenantProvisioningService: Object.assign(Object.create(provisioning), {
      prepare: async enterprise => ({ ...f.record, code: enterprise.tenant.code }),
    }),
    DefaultMandatoryIdentityBootstrapService: bootstrap,
    DefaultDataReleaseService: Object.assign(Object.create(releases), {
      preparePlan: async request => {
        assert.equal(request.tenant, "tenant-a"); assert.equal(request.releaseRequest.dataType, "init");
        assert(request.releaseRequest.releaseCodes.length > 0);
        f.state.order.push("init");
        return { tenant: request.tenant, releases: request.releaseRequest.releaseCodes.map(releaseCode => ({ releaseCode })) };
      },
      operationReleases: async () => [{ status: "CURRENT", version: "0.0.1", installedVersion: "0.0.1", installedChecksum: "retained", checksum: "retained" }],
      executePreparedPlan: async () => { throw new Error("Current Init must not replay"); },
    }),
  });
  // The existing protected binding transport admits the projection before providers;
  // namespace/provenance authorization is covered by the provisioning owner fixtures.
  SERVICE.DefaultModuleService.invokeModule = async invocation => {
    assert.equal(invocation.tenant, "default"); assert.equal(invocation.operationName, "bindWithProof");
    f.state.order.push("handshake");
    return provisioning.runtimeBootstrapView(f.record);
  };
  SERVICE.DefaultInternalAuthenticationProviderService = Object.assign(Object.create(provider), { getInternalAuthToken: issuer.getInternalAuthToken });
  const enterprise = { code: "enterprise-a", active: true, tenant: { code: "tenant-a", active: true } };
  await f.owner.buildEnterprise([enterprise]);
  assert.deepEqual(proofReads, ["default", "default", "tenant-a"]);
  assert.deepEqual(issuedTenants, ["default", "tenant-a"]);
  assert.deepEqual(Object.keys(f.state.tokens), ["tenant-a"]);
  assert.equal(targetGrants.length, 1);
  const moduleTransport = require("../src/service/module/defaultModuleService");
  const headers = moduleTransport.buildInternalAuthorizationHeader({ tenant: "tenant-a", moduleName: "commsApi" });
  assert.equal(headers.Authorization, "Bearer fictional-issued-runtime-proof-tenant-a");
  assert(f.state.order.indexOf("init") > f.state.order.indexOf("provider"));
  assert(f.state.order.indexOf("reconcile") > f.state.order.indexOf("init"));
  assert(f.state.order.includes("administrator-inventory"));
  assert.deepEqual(nativeUpdates, ["tenant-a"]);
  assert.equal(native.principalType, "service");
  assert.equal(native.apiKeyHash === originalNative.apiKeyHash, true, "Target retained credentials are not rebound");
  assert.equal(native.password === originalNative.password, true, "Service reconciliation does not touch retained password references");
  assert.equal(f.owner.isEnterpriseRuntimeReady(enterprise), true);
  const originalSnapshot = structuredClone(f.record.properties.enterpriseProvisioning);
  const originalProjectRoot = bootstrap.getProjectRoot;
  const originalProjection = bootstrap.readResolvedRuntimeDeployment;
  const extension = { ...scope, modules: [...scope.modules, "commsApi"] };
  const deployment = { properties: { runtimeIdentity: { instanceCode: scope.instanceCode, remoteModules: ["commsApi"] },
    profileTenantProvisioning: { localRuntimeRemoteModuleExtensions: ["commsApi"] } }, modules: ["profile"] };
  bootstrap.getProjectRoot = () => "/fictional/project";
  bootstrap.readResolvedRuntimeDeployment = () => deployment;
  try {
    await assert.rejects(provisioning.authorizeLocalRuntimeBootstrapScope("tenant-a", extension),
      { code: "ERR_PROFILE_TENANT_PROVISIONING_HELD" }, "Configuration alone cannot replace the current authenticated grant");
    grant.runtimeScope = extension;
    assert.equal(await provisioning.authorizeLocalRuntimeBootstrapScope("tenant-a", extension), "enterprise-a");
    for (const denied of [[], ["differentModule"]]) {
      deployment.properties.profileTenantProvisioning.localRuntimeRemoteModuleExtensions = denied;
      await assert.rejects(provisioning.authorizeLocalRuntimeBootstrapScope("tenant-a", extension),
        { code: "ERR_PROFILE_TENANT_PROVISIONING_HELD" });
    }
    deployment.properties.profileTenantProvisioning.localRuntimeRemoteModuleExtensions = ["commsApi"];
    deployment.modules.push("commsApi");
    await assert.rejects(provisioning.authorizeLocalRuntimeBootstrapScope("tenant-a", extension),
      { code: "ERR_PROFILE_TENANT_PROVISIONING_HELD" }, "Active module growth is not a remote-only upgrade");
    deployment.modules.pop();
    deployment.properties.runtimeIdentity.remoteModules = [];
    await assert.rejects(provisioning.authorizeLocalRuntimeBootstrapScope("tenant-a", extension),
      { code: "ERR_PROFILE_TENANT_PROVISIONING_HELD" });
    assert.deepEqual(f.record.properties.enterpriseProvisioning, originalSnapshot);
    assert.equal(targetGrants.length, 1, "Admission alone does not persist a grant");
  } finally {
    grant.runtimeScope = scope;
    bootstrap.getProjectRoot = originalProjectRoot;
    bootstrap.readResolvedRuntimeDeployment = originalProjection;
  }
  for (const unapproved of [{ ...scope, projectCode: "other.project" },
    { ...scope, modules: ["unapproved"] }, { ...scope, permissions: ["unapproved.execute"] }]) {
    await assert.rejects(provisioning.authorizeLocalRuntimeBootstrapScope("tenant-a", unapproved), { code: "ERR_PROFILE_TENANT_PROVISIONING_HELD" });
    assert.equal(targetGrants.length, 1, "Rejected declarations cannot add target grants");
  }
  const originalSetupHash = f.record.properties.enterpriseProvisioning.setupRequestHash;
  f.record.properties.enterpriseProvisioning.setupRequestHash = "c".repeat(64);
  await assert.rejects(provisioning.authorizeLocalRuntimeBootstrapScope("tenant-a", scope), { code: "ERR_PROFILE_TENANT_PROVISIONING_HELD" });
  f.record.properties.enterpriseProvisioning.setupRequestHash = originalSetupHash;
  assert.equal(targetGrants.length, 1);
  assert.equal(f.owner.isEnterpriseRuntimeReady({ ...enterprise, code: "another-enterprise" }), false);
  f.owner._tenantPreparations.set("tenant-a", Promise.resolve());
  assert.equal(f.owner.isEnterpriseRuntimeReady(enterprise), false);
  f.owner._tenantPreparations.delete("tenant-a");
  const pinGuard = SERVICE.DefaultDatabaseConfigurationService.assertTenantNamespaceBinding;
  SERVICE.DefaultDatabaseConfigurationService.assertTenantNamespaceBinding = () => { throw new Error("drift"); };
  assert.equal(f.owner.isEnterpriseRuntimeReady(enterprise), false);
  SERVICE.DefaultDatabaseConfigurationService.assertTenantNamespaceBinding = pinGuard;
  grantActive = false;
  await assert.rejects(SERVICE.DefaultInternalAuthenticationProviderService.fetchInternalAuthToken("default"));
  assert.equal(issuedTenants.length, 2, "Revoked source grants cannot issue renewed proof");
  const opened = f.state.opened;
  await assert.rejects(provisioning.authorizeLocalRuntimeBootstrapScope("tenant-a", scope), { code: "ERR_PROFILE_TENANT_PROVISIONING_HELD" });
  await assert.rejects(f.owner.prepareEnterpriseTenant(enterprise));
  assert.equal(f.state.opened, opened, "Revoked grant refuses before another provider admission");
  assert.equal(f.owner.isEnterpriseRuntimeReady(enterprise), false);
  targetGrants[0].status = "INACTIVE";
  await assert.rejects(SERVICE.DefaultInternalAuthenticationProviderService.fetchInternalAuthToken("tenant-a"));
  assert.equal(issuedTenants.length, 2, "Revoked target grants cannot issue renewed target proof");
});

test("missing final target proof never marks a provisioned subject complete or substitutes a default token", async () => {
  for (const result of [undefined, {}, { authToken: "" }]) {
    const f = fixture();
    let calls = 0;
    SERVICE.DefaultInternalAuthenticationProviderService.fetchInternalAuthToken = async tenant => {
      assert.equal(tenant, calls === 0 ? "default" : "tenant-a");
      return ++calls === 1 ? { authToken: "namespace-proof" } : result;
    };
    const enterprise = { code: "enterprise-a", active: true, tenant: { code: "tenant-a", active: true } };
    await assert.rejects(f.owner.buildEnterprise([enterprise]), { code: "ERR_TNT_PROVISIONING_HELD" });
    assert.equal(f.state.opened, 1);
    assert.deepEqual(f.state.active, []);
    assert.deepEqual(f.state.tokens, {});
    assert.deepEqual(f.state.enterprises, {});
    assert.equal(f.owner.isEnterpriseRuntimeReady(enterprise), false);
  }
});

test("selected subject missing namespace evidence refuses before opening providers; legacy retains its own token realm", async () => {
  const f = fixture();
  f.state.config = {};
  await assert.rejects(f.owner.prepareEnterpriseTenant({ code: "enterprise-a", tenant: { code: "tenant-a" } }), { code: "ERR_TNT_PROVISIONING_HELD" });
  assert.equal(f.state.opened, 0); assert.deepEqual(f.state.active, []);
  const original = CONFIG.get;
  CONFIG.get = (key, tenant) => key === "profileTenantProvisioning" ? { enabled: false } : original(key, tenant);
  await f.owner.buildEnterprise([{ code: "enterprise-a", active: true, tenant: { code: "tenant-a", active: true } }]);
  assert.equal(f.state.tokens["tenant-a"], "retained-proof");
  assert.equal(f.state.tokens.default, undefined);
  assert.equal(f.owner.isEnterpriseRuntimeReady({ code: "enterprise-a", tenant: "tenant-a" }), true);
});
test("failed or mismatched binding prevents all target provider calls and removes provisional activation", async () => {
  for (const response of [undefined, { code: "tenant-a", active: true, properties: {} }]) {
    const f = fixture(); SERVICE.DefaultModuleService.invokeModule = async () => response;
    await assert.rejects(f.owner.prepareEnterpriseTenant({ tenant: { code: "tenant-a", properties: {} } }));
    assert.equal(f.state.opened, 0); assert.deepEqual(f.state.active, []);
  }
});
test("remote enterprise event joins canonical in-flight preparation despite provisional active tenant", async () => {
  const f = fixture(); let finish, acknowledged = false;
  NODICS.getActiveTenants = () => ["tenant-a"];
  const enterprise = { code: "tenant-a", active: true, tenant: { code: "tenant-a", active: true,
    properties: { database: { tenantNamespace: { version: 1, mode: "DERIVED", tenantCode: "tenant-a" } } } } };
  SERVICE.DefaultEnterpriseHandlerService = { fetchEnterprise: async () => [enterprise], buildEnterprise: input => {
    assert.deepEqual(input, [enterprise]); return new Promise(resolve => { finish = resolve; });
  } };
  const owner = { ...listener, LOG: { debug() {}, error() {} } };
  const result = new Promise((resolve, reject) => owner.handleAddEnterprise({ data: { enterprise } }, (error, value) => {
    acknowledged = true; if (error) reject(error); else resolve(value);
  }));
  while (!finish) await new Promise(resolve => setImmediate(resolve));
  assert.equal(acknowledged, false); finish(true); assert.equal((await result).success, true);
});
test("local and remote startup request the same private proof-bound approved inventory, not auth.entCode-only discovery", async () => {
  const f = fixture();
  SERVICE.DefaultModuleService.invokeModule = async invocation => {
    f.state.invocation = invocation;
    return { code: "SUC_PRFL_00000", result: [
      { code: "platform", active: true, tenant: { code: "default", active: true } },
      { code: "tenant-a", active: true, tenant: { code: "tenant-a", active: true, properties: { database: { tenantNamespace: {} } } } },
    ] };
  };
  assert.equal((await f.owner.fetchEnterprise()).length, 2);
  assert.equal(f.state.invocation.operationName, "inventoryWithProof");
  assert.equal(f.state.invocation.apiName, "/internal/tenants/bootstrap");
  assert.equal(f.state.invocation.tenant, "default"); assert.equal(f.state.invocation.methodName, "GET");
  assert.equal(f.state.invocation.followRedirects, false);
});
test("unselected/default-only deployment uses existing proof-bound enterprise lookup without bind permission or new transport gate", async () => {
  const f = fixture(); const original = CONFIG.get;
  CONFIG.get = key => key === "profileTenantProvisioning" ? { enabled: false } : original(key);
  SERVICE.DefaultAuthorizationProviderService = { authorizeToken: async () => ({ code: "SUC_AUTH_00000",
    result: { tenant: "default", entCode: "platform", permissions: ["profile.enterprise.search"] } }) };
  SERVICE.DefaultModuleService.invokeModule = async invocation => {
    f.state.invocation = invocation; return { code: "SUC_FIND_00000", result: [{ code: "platform", tenant: { code: "default", active: true } }] };
  };
  assert.equal((await f.owner.fetchEnterprise()).length, 1);
  assert.equal(f.state.invocation.operationName, "getRuntimeEnterprise");
  assert.equal(f.state.invocation.apiName, "/enterprise/get"); assert.equal(f.state.invocation.secureTransport, undefined);
  assert.equal(f.state.invocation.followRedirects, undefined);
});
test("selected inventory failure or wrong runtime grant rejects without falling back to ordinary enterprise lookup", async () => {
  const f = fixture(); const commands = [];
  SERVICE.DefaultModuleService.invokeModule = async invocation => { commands.push(invocation.operationName); throw new Error("unapproved grant"); };
  await assert.rejects(f.owner.fetchEnterprise(), { code: "ERR_TNT_PROVISIONING_HELD" });
  assert.deepEqual(commands, ["inventoryWithProof"]);
});

test("non-Profile consumers resolve held startup errors through the actual layered status loader and NodicsError", async () => {
  const f = fixture();
  const path = require("node:path");
  const foundation = path.resolve(__dirname, "../../..");
  const files = require("../../nConfig/src/service/defaultFilesLoaderService");
  const statusSource = require("../src/service/status/defaultStatusService");
  const selected = ["nCommon", "nService"];
  global.NODICS = {
    ...NODICS,
    getNodicsHome: () => foundation,
    getIndexedModules: () => new Map(selected.map((name, index) => [
      index, { name, path: path.join(foundation, "modules", name) },
    ])),
  };
  global.UTILS = {
    ...require("../../nConfig/src/utils/utils"),
    ...require("../../nCommon/src/utils/utils"),
  };
  const configGet = CONFIG.get;
  CONFIG.get = (key) => key === "defaultErrorCodes"
    ? { NodicsError: "ERR_SYS_00000" } : configGet(key);
  const status = { ...statusSource, statusMap: {} };
  SERVICE.DefaultFilesLoaderService = { ...files, LOG: { debug() {} } };
  SERVICE.DefaultStatusService = status;
  global.CLASSES = { NodicsError: require("../../nCommon/src/lib/nodicsError") };
  status.loadStatusDefinitions();
  assert.equal(Object.hasOwn(status.statusMap, "ERR_PROFILE_TENANT_PROVISIONING_HELD"), false);
  assert.equal(status.get("ERR_TNT_PROVISIONING_HELD").code, "409");
  const commands = [];
  SERVICE.DefaultModuleService.invokeModule = async (invocation) => {
    commands.push(invocation.operationName);
    throw new Error("private upstream credential details must not escape");
  };
  for (const operation of [
    () => f.owner.fetchEnterprise(),
    () => f.owner.pinTenantNamespace("tenant-a"),
  ]) {
    await assert.rejects(operation(), (error) => {
      assert.equal(error.code, "ERR_TNT_PROVISIONING_HELD");
      assert.equal(error.responseCode, "409");
      assert.equal(error.message, "Tenant provisioning is held pending owner review");
      assert(!error.message.includes("Invalid error code"));
      assert(!error.message.includes("private"));
      return true;
    });
  }
  assert.deepEqual(commands, ["inventoryWithProof", "bindWithProof"]);
  assert.equal(f.state.opened, 0);
});
