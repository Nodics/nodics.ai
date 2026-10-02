/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module profile/test/tenantNamespaceBindingAdmissionContract @description Deferred isolated pin, runtime grant, private Tenant admission and descriptor regressions. No providers or runtime writes. @layer test @owner profile */
const assert = require("node:assert/strict");
const { test, beforeEach, afterEach } = require("node:test");
const crypto = require("node:crypto");
const provisioning = require("../src/service/enterprise/defaultEnterpriseTenantProvisioningService");
const guard = require("../src/service/enterprise/defaultTenantProvisioningGuardService");
const runtime = require("../src/service/identity/defaultRuntimeAuthorizationService");
const database = require("../../../../nodics.foundation/modules/nDatabase/database/src/service/config/defaultDatabaseConfigurationService");
const tokenOwner = require("../../../../nodics.foundation/modules/nAuth/src/service/identity/defaultServiceTokenService");
const routes = require("../src/router/routers");
const interceptors = require("../src/interceptors/interceptors");
const oldEnums = global.ENUMS;
global.ENUMS = { ContactType: Object.fromEntries(["EMAIL", "PHONE", "FAX", "PAGER"].map(key => [key, { key }])) };
const schemas = require("../src/schemas/schemas");
if (oldEnums === undefined) delete global.ENUMS; else global.ENUMS = oldEnums;

/** Composes the startup release owner with actual bulk-save dispatch and the Enterprise post-save hook, without providers. */
function startupSeedFixture() {
  global.CONFIG = { get: key => key === "defaultTenant" ? "default" : undefined };
  const releaseOwner = require("../../../../nodics.foundation/modules/nData/nImport/import/src/service/release/defaultDataReleaseService");
  const bulkOwner = require("../../../../nodics.foundation/modules/nDatabase/database/src/service/procs/save/defaultModelsSaveInitializerService");
  const dispatcher = require("../../../../nodics.foundation/modules/nCommon/src/service/interceptor/defaultInterceptorService");
  const header = require("../data/init-v001/headers/enterprise/defaultEnterpriseHeader").profile.defaultEnterprise;
  const seed = require("../data/init-v001/records/enterprise/defaultEnterpriseData").record0;
  const log = { debug() {}, error() {}, warn() {} };
  const events = { ...require("../src/service/interceptors/defaultEnterpriseUpdateInterceptorService"), LOG: log };
  let notifications = 0, persisted = 0;
  events.triggerEnterpriseUpdateEvent = async () => { notifications++; throw new Error("runtime proof not yet issued"); };
  const release = { ...releaseOwner,
    configuration: () => ({ types: { init: { enabled: true } } }),
    discoverReleases: () => [{ moduleName: "profile", releaseCode: "profile:init" }],
    isDestinationCompatible: () => true,
    preparePlan: async request => ({ tenant: request.tenant }),
    operationReleases: async () => [{ status: "AVAILABLE" }],
    executePreparedPlan: async () => {
      await bulkOwner.saveSingleModel.call({ ...bulkOwner, LOG: log }, {
        tenant: "default", authData: { userGroups: header.options.userGroups },
        schemaModel: { schemaName: header.options.schemaName }, originalQuery: header.query,
        options: {},
      }, {}, { ...seed, tenant: { code: "default", active: true } });
      return { installed: true };
    },
  };
  global.SERVICE = {
    DefaultDataReleaseService: release, DefaultEnterpriseUpdateInterceptorService: events,
    DefaultPipelineService: { start: async (name, request) => {
      assert.equal(name, "modelSaveInitializerPipeline");
      persisted++;
      await dispatcher.executeInterceptors.call({ ...dispatcher, LOG: log }, [interceptors.enterpriseSaveEvent], request, {});
      return { result: request.model };
    } },
  };
  const oldUpper = String.prototype.toUpperCaseFirstChar;
  if (!oldUpper) String.prototype.toUpperCaseFirstChar = function () { return this[0].toUpperCase() + this.slice(1); };
  global.CLASSES = { NodicsError: { enrich: error => error } };
  return { release, events, counts: () => ({ notifications, persisted }), cleanup: () => {
    if (!oldUpper) delete String.prototype.toUpperCaseFirstChar;
  } };
}
let prior;
beforeEach(() => { prior = Object.fromEntries(["SERVICE", "CONFIG", "CLASSES", "NODICS", "_", "FACADE", "UTILS"].map(key => [key, global[key]])); });
afterEach(() => { for (const [key, value] of Object.entries(prior)) if (value === undefined) delete global[key]; else global[key] = value; });

test("default Init seed postSave completes before runtime proof exists through actual bulk-save/interceptor dispatch", async () => {
  const f = startupSeedFixture();
  try {
    assert.deepEqual(await f.release.installStartupReleases({ tenant: "default", modules: ["profile"] }), { installed: true });
    assert.deepEqual(f.counts(), { notifications: 0, persisted: 1 });
    assert.equal(f.release.isStartupReleaseExecution("default"), false);
  } finally { f.cleanup(); }
});

test("caller startup flags cannot suppress ordinary default Enterprise postSave errors", async () => {
  const f = startupSeedFixture();
  try {
    await assert.rejects(f.events.enterpriseSaveEvent({ tenant: "default", model: { code: "default", tenant: "default" },
      source: "tenant-startup", options: { startupReleaseExecution: true, skipEvents: true } }, {}), /runtime proof not yet issued/);
    assert.equal(f.counts().notifications, 1);
  } finally { f.cleanup(); }
});

test("ordinary postSave still awaits the owner operation and propagates publication failure", async () => {
  const f = startupSeedFixture();
  let rejectPublication;
  f.events.triggerEnterpriseUpdateEvent = () => new Promise((resolve, reject) => { rejectPublication = reject; });
  try {
    let settled = false;
    const failure = new Error("publication acknowledgement unavailable");
    const pending = f.events.enterpriseSaveEvent({ tenant: "default", model: { tenant: "default" } }, {})
      .finally(() => { settled = true; });
    await Promise.resolve(); assert.equal(settled, false);
    rejectPublication(failure);
    await assert.rejects(pending, error => error === failure);
  } finally { f.cleanup(); }
});

test("startup Init scope expires on failure and cannot suppress another tenant or parallel caller", async () => {
  const f = startupSeedFixture();
  let enter, finish;
  const entered = new Promise(resolve => { enter = resolve; });
  const blocked = new Promise(resolve => { finish = resolve; });
  const failure = new Error("Init storage failure");
  let deferred;
  f.release.executePreparedPlan = async () => {
    assert.equal(f.release.isStartupReleaseExecution("default"), true);
    assert.equal(f.release.isStartupReleaseExecution("other"), false);
    await assert.rejects(f.events.enterpriseSaveEvent({ tenant: "default", model: { tenant: "other" } }, {}));
    deferred = () => f.release.isStartupReleaseExecution("default");
    // Capture the async context to verify detached descendants cannot retain admission.
    const { AsyncResource } = require("node:async_hooks");
    const resource = new AsyncResource("deferred-startup-fixture");
    const read = deferred; deferred = () => resource.runInAsyncScope(read);
    enter(); await blocked; throw failure;
  };
  try {
    const pending = f.release.installStartupReleases({ tenant: "default", modules: ["profile"] });
    await entered;
    assert.equal(f.release.isStartupReleaseExecution("default"), false);
    await assert.rejects(f.events.enterpriseSaveEvent({ tenant: "default", model: { tenant: "default" } }, {}));
    finish(); await assert.rejects(pending, error => error === failure);
    assert.equal(deferred(), false);
  } finally { finish(); f.cleanup(); }
});
function fixture() {
  global._ = require("lodash");
  global.CONFIG = { get: key => key === "defaultTenant" ? "default" : undefined };
  const scope = { projectCode: "project", environmentCode: "projectLocal", serverCode: "platform", instanceCode: "replica1" };
  const permission = "profile.tenant.namespace.bind";
  const auth = { tenant: "default", tokenType: "service", principalType: "service", serviceId: "runtime", entCode: "platform",
    runtimeInstanceId: "replica1", runtimeScope: { ...scope, assignmentCode: "grant1" }, modules: ["profile"], permissions: [permission, "profile.enterprise.search"] };
  const grant = { code: "grant1", scopeType: "RUNTIME_DEPLOYMENT", principalType: "service", principalCode: "runtime",
    inheritanceMode: "DIRECT", tenantCode: "default", enterpriseCode: "platform", status: "ACTIVE", effect: "ALLOW",
    runtimeScope: { ...scope, modules: ["profile"], permissions: [permission, "profile.enterprise.search"] } };
  const scopeKey = "deployment_" + crypto.createHash("sha256").update(JSON.stringify([scope.projectCode, scope.environmentCode, scope.serverCode])).digest("hex");
  const module = { databaseType: "mongodb", connectionHandler: "DefaultMongoConnectionService", channels: { master: {
    base: { databaseType: "mongodb", connectionHandler: "DefaultMongoConnectionService", databaseName: "base", endpointFingerprint: "a".repeat(64) },
    destination: { databaseName: "base_tenant_a", endpointFingerprint: "a".repeat(64) },
  } } };
  const candidate = { scopeKey, binding: { version: 1, tenantCode: "tenant-a", scope: { projectCode: scope.projectCode,
    environmentCode: scope.environmentCode, serverCode: scope.serverCode }, modules: { default: structuredClone(module), profile: module } } };
  const properties = { ...database.createTenantNamespaceIntent.call({ ...database }, "tenant-a"), enterpriseProvisioning: {
    version: 1, enterpriseCode: "tenant-a", setupRequestKey: "b".repeat(64), setupRequestHash: "c".repeat(64),
    deploymentScopes: { [scopeKey]: { scope: structuredClone(candidate.binding.scope), modules: ["profile"] } } } };
  const state = { tenant: { _id: "id", code: "tenant-a", active: true, properties }, writes: 0, evidence: [], enabled: true };
  global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
  global.CONFIG = { get: key => ({ defaultTenant: "default", profileModuleName: "profile", profileTenantProvisioning: { enabled: true, permission, inventoryPermission: "profile.enterprise.search" },
    apiExposure: { categories: { profileTenantProvisioning: { enabled: state.enabled } } } })[key] };
  global.NODICS = { getInternalAuthTokens: () => ({}) };
  const owner = { ...provisioning };
  global.SERVICE = {
    DefaultLoggerService: { runSensitiveOperation: async (request, work) => work() },
    DefaultEnterpriseTenantProvisioningService: owner, DefaultTenantProvisioningGuardService: guard,
    DefaultServiceTokenService: tokenOwner, DefaultRuntimeAuthorizationService: runtime,
    DefaultDatabaseConfigurationService: database,
    DefaultAuthorizationProviderService: { authorizeToken: async request => {
      assert.equal(request.authToken, "actual-proof"); return { code: "SUC_AUTH_00000", result: structuredClone(auth) };
    } },
    DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ isSystem: true }) },
    DefaultEnterpriseTeamAdministrationService: require("../src/service/enterprise/defaultEnterpriseTeamAdministrationService"),
    DefaultEnterpriseMembershipService: require("../src/service/enterprise/defaultEnterpriseMembershipService"),
    DefaultEnterpriseRegistrationService: require("../src/service/enterprise/defaultEnterpriseRegistrationService"),
    DefaultEnterpriseManagementService: require("../src/service/enterprise/defaultEnterpriseManagementService"),
    DefaultEnterpriseService: { get: async () => ({ code: "SUC_SYS_00000", result: [{ _id: "enterprise", code: "tenant-a", tenant: "tenant-a",
      active: true, setupRequestKey: properties.enterpriseProvisioning.setupRequestKey, setupRequestHash: properties.enterpriseProvisioning.setupRequestHash }] }) },
    DefaultTenantService: {
      get: async request => {
        guard.protectRead(request);
        const response = { code: "SUC_SYS_00000", result: [structuredClone(state.tenant)] };
        guard.redact(request, response); return response;
      },
      update: async request => {
        guard.protectUpdate(request); assert.deepEqual(request.query.properties, state.tenant.properties);
        state.writes++; state.tenant.properties = structuredClone(request.model.properties);
        return { code: "SUC_SYS_00000", result: { matchedCount: 1 } };
      },
    },
    DefaultPrincipalScopeAssignmentService: { get: async request => ({ code: "SUC_SYS_00000", result: request.query.scopeType ? [structuredClone(grant)] : [] }) },
  };
  for (const name of ["DefaultEnterpriseAccessAssignmentService", "DefaultDataInstallationService", "DefaultImportRunService", "DefaultEmployeeService", "DefaultCustomerService"])
    SERVICE[name] = { get: async () => ({ code: "SUC_SYS_00000", result: name === "DefaultImportRunService" ? state.evidence : [] }) };
  const request = { tenant: "default", headers: { Authorization: "Bearer actual-proof" }, params: { tenantCode: "tenant-a" }, body: candidate };
  return { owner, state, auth, grant, candidate, request };
}
test("actual proof and fresh exact grant pin once with private CAS/readback; default role needs no default module grant", async () => {
  const f = fixture(); const result = await f.owner.bindWithProof(f.request);
  assert.deepEqual(result.properties.database.tenantNamespaceBindings[f.candidate.scopeKey], f.candidate.binding);
  assert.equal(f.state.writes, 1); await f.owner.bindWithProof(f.request); assert.equal(f.state.writes, 1);
});
test("direct forged authData, missing proof, failed token verification and disabled exposure refuse", async () => {
  const f = fixture();
  await assert.rejects(f.owner.bind({ ...f.request, authData: f.auth }));
  await assert.rejects(f.owner.bindWithProof({ ...f.request, headers: {} }));
  SERVICE.DefaultAuthorizationProviderService.authorizeToken = async () => { throw new Error("private"); };
  await assert.rejects(f.owner.bindWithProof(f.request), { code: "ERR_PROFILE_TENANT_PROVISIONING_HELD" });
  f.state.enabled = false; await assert.rejects(f.owner.bindWithProof(f.request)); assert.equal(f.state.writes, 0);
});
test("revoked grant, mismatched scope, unapproved Local module and missing permission reject", async () => {
  for (const change of [f => { f.grant.status = "INACTIVE"; }, f => { f.candidate.binding.scope.serverCode = "another"; },
    f => { f.candidate.binding.modules.inventory = structuredClone(f.candidate.binding.modules.profile); },
    f => { f.auth.permissions = []; }]) {
    const f = fixture(); change(f); await assert.rejects(f.owner.bindWithProof(f.request)); assert.equal(f.state.writes, 0);
  }
});
test("existing pin mismatch and new deployment enrollment refuse without writes", async () => {
  const f = fixture(); f.state.tenant.properties.database.tenantNamespaceBindings = {
    [f.candidate.scopeKey]: { ...f.candidate.binding, version: 2 }
  };
  await assert.rejects(f.owner.bindWithProof(f.request)); assert.equal(f.state.writes, 0);
  delete f.state.tenant.properties.database.tenantNamespaceBindings;
  delete f.state.tenant.properties.enterpriseProvisioning.deploymentScopes[f.candidate.scopeKey];
  await assert.rejects(f.owner.bindWithProof(f.request)); assert.equal(f.state.writes, 0);
});
test("two originally approved runtimes pin independently after first Init, preserving the complete first binding", async () => {
  const f = fixture();
  const second = structuredClone(f.candidate); second.binding.scope.serverCode = "commerce";
  second.scopeKey = "deployment_" + crypto.createHash("sha256")
    .update(JSON.stringify([second.binding.scope.projectCode, second.binding.scope.environmentCode, "commerce"])).digest("hex");
  f.state.tenant.properties.enterpriseProvisioning.deploymentScopes[second.scopeKey] = { scope: second.binding.scope, modules: ["profile"] };
  await f.owner.bindWithProof(f.request);
  f.state.evidence = [{ status: "CURRENT" }];
  f.auth.runtimeScope.serverCode = "commerce"; f.grant.runtimeScope.serverCode = "commerce";
  const result = await f.owner.bindWithProof({ ...f.request, body: second });
  assert.deepEqual(result.properties.database.tenantNamespaceBindings[f.candidate.scopeKey], f.candidate.binding);
  assert.deepEqual(result.properties.database.tenantNamespaceBindings[second.scopeKey], second.binding);
  assert.equal(f.state.writes, 2);
});
test("two runtime CAS race merges only acknowledged zero-match additions and preserves both immutable pins", async () => {
  const f = fixture(); const peer = structuredClone(f.candidate); peer.binding.scope.serverCode = "commerce";
  peer.scopeKey = "deployment_" + crypto.createHash("sha256")
    .update(JSON.stringify([peer.binding.scope.projectCode, peer.binding.scope.environmentCode, "commerce"])).digest("hex");
  f.state.tenant.properties.enterpriseProvisioning.deploymentScopes[peer.scopeKey] = { scope: peer.binding.scope, modules: ["profile"] };
  SERVICE.DefaultTenantService.update = async request => {
    guard.protectUpdate(request); f.state.writes++;
    if (f.state.writes === 1) {
      f.state.tenant.properties.database.tenantNamespaceBindings = { [peer.scopeKey]: peer.binding };
      return { code: "SUC_UPD_00000", result: { count: 0 } };
    }
    assert.deepEqual(request.query.properties, f.state.tenant.properties);
    f.state.tenant.properties = structuredClone(request.model.properties);
    return { code: "SUC_UPD_00000", result: { count: 1 } };
  };
  const result = await f.owner.bindWithProof(f.request);
  assert.equal(f.state.writes, 2);
  assert.deepEqual(result.properties.database.tenantNamespaceBindings[peer.scopeKey], peer.binding);
  assert.deepEqual(result.properties.database.tenantNamespaceBindings[f.candidate.scopeKey], f.candidate.binding);
});
test("cold-start inventory includes default and original approved tenants without hashes; unmarked partial creation stays HELD", async () => {
  const f = fixture();
  const originalTenant = structuredClone(f.state.tenant);
  SERVICE.DefaultTenantService.get = async request => {
    guard.protectRead(request);
    const response = { code: "SUC_SYS_00000", result: [{ code: "default", active: true, properties: {} }, structuredClone(f.state.tenant)] };
    guard.redact(request, response); return response;
  };
  SERVICE.DefaultEnterpriseService.get = async request => ({ code: "SUC_SYS_00000", count: 1, result: request.query.tenant === "default"
    ? [{ code: "platform", active: true, tenant: "default" }]
    : [{ code: "tenant-a", active: true, tenant: "tenant-a", setupRequestKey: "b".repeat(64), setupRequestHash: "c".repeat(64) }] });
  const result = await f.owner.inventoryWithProof({ ...f.request, body: {} });
  assert.deepEqual(result.result.map(row => row.code), ["platform", "tenant-a"]);
  assert.ok(result.result[1].tenant.properties.database.tenantNamespace);
  assert.equal(result.result[1].tenant.properties.enterpriseProvisioning, undefined);
  assert.deepEqual(f.state.tenant, originalTenant);
  f.auth.permissions = ["profile.enterprise.search"]; f.grant.runtimeScope.permissions = ["profile.enterprise.search"];
  assert.equal((await f.owner.inventoryWithProof({ ...f.request, body: {} })).result.length, 2);
  await assert.rejects(f.owner.bindWithProof(f.request));
  delete f.state.tenant.properties.enterpriseProvisioning;
  await assert.rejects(f.owner.inventoryWithProof({ ...f.request, body: {} }));
});

test("default-only selected inventory composes actual local ModuleService and bounded Team reader; overflow refuses", async () => {
  const f = fixture();
  const modules = require("../../../../nodics.foundation/modules/nService/src/service/module/defaultModuleService");
  const invoker = { ...modules, isLocalModuleActive: () => true, isCurrentRuntimeAuthority: () => true,
    recordInvocationResolution() {} };
  SERVICE.DefaultTenantService.get = async request => {
    guard.protectRead(request);
    const response = { code: "SUC_DBS_00000", result: [{ code: "default", active: true }] };
    guard.redact(request, response); return response;
  };
  let overflow = false;
  SERVICE.DefaultEnterpriseService.get = async request => {
    assert.equal(request.searchOptions.pageSize <= 101, true);
    assert.equal(SERVICE.DefaultEnterpriseTeamAdministrationService.ownsEnterpriseRead(request), true);
    return { code: "SUC_DBS_00000", count: overflow ? 257 : 1, result: overflow
      ? Array.from({ length: 101 }, (_, index) => ({ code: "enterprise-" + String(index).padStart(3, "0"), active: true, tenant: "default" }))
      : [{ code: "platform", active: true, tenant: "default" }] };
  };
  const command = { moduleName: "profile", serviceName: "DefaultEnterpriseTenantProvisioningService",
    operationName: "inventoryWithProof", methodName: "GET", apiName: "/internal/tenants/bootstrap",
    request: { tenant: "default", headers: f.request.headers, body: {} }, requestBody: {} };
  const result = await invoker.invokeModule(command);
  assert.deepEqual(result.result, [{ code: "platform", active: true, tenant: { code: "default", active: true, properties: {} } }]);
  overflow = true;
  await assert.rejects(invoker.invokeModule(command), { code: "ERR_PROFILE_TENANT_PROVISIONING_HELD" });
});

test("remote startup composes actual ModuleService secure transport, private HTTP controller, proof admission and JSON envelope", async () => {
  const f = fixture();
  const fs = require("node:fs"), vm = require("node:vm");
  const log = { debug() {}, warn() {}, error() {} };
  const originalGet = CONFIG.get;
  CONFIG.get = key => key === "log" ? { requestPrivacy: { qualified: true, captureMode: "disabled" } }
    : key === "profileTenantProvisioning" ? { ...originalGet(key), allowInsecureLoopback: true }
    : key === "defaultErrorCodes" ? { NodicsError: "ERR_SYS_00000" }
    : key === "defaultContentType" ? "application/json" : originalGet(key);
  global.UTILS = { ...require("lodash"), ...require("../../../../nodics.foundation/modules/nConfig/src/utils/utils"),
    ...require("../../../../nodics.foundation/modules/nCommon/src/utils/utils") };
  CLASSES.NodicsError = require("../../../../nodics.foundation/modules/nCommon/src/lib/nodicsError");
  SERVICE.DefaultStatusService = { get: code => ({ code: /^SUC_/.test(code) ? "200" : "409", message: "Fixed fixture status" }) };
  const logger = require("../../../../nodics.foundation/modules/nConfig/src/service/DefaultLoggerService");
  SERVICE.DefaultLoggerService = logger;
  SERVICE.DefaultInternalAuthenticationProviderService = { fetchInternalAuthToken: async () => ({ authToken: "actual-proof" }) };
  global.FACADE = { DefaultTenantNamespaceBindingFacade: require("../src/facade/enterprise/defaultTenantNamespaceBindingFacade") };
  const controller = require("../src/controller/enterprise/defaultTenantNamespaceBindingController");
  const secured = { ...require("../../../../nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService"), LOG: log };
  const json = { ...require("../../../../nodics.foundation/modules/nRouter/src/service/handlers/response/defaultJsonResponseHandlerService"), LOG: log };
  SERVICE.DefaultRouterOperationService = require("../../../../nodics.foundation/modules/nRouter/src/service/router/defaultRouterOperationService");
  const getTenant = SERVICE.DefaultTenantService.get;
  SERVICE.DefaultTenantService.get = async request => request.query.code ? getTenant(request) : (() => {
    guard.protectRead(request);
    const response = { code: "SUC_DBS_00000", result: [{ code: "default", active: true }] };
    guard.redact(request, response); return response;
  })();
  SERVICE.DefaultEnterpriseService.get = async request => ({ code: "SUC_DBS_00000", count: 1,
    result: request.query.tenant === "default" ? [{ code: "platform", tenant: "default", active: true }]
      : [{ _id: "enterprise", code: "tenant-a", tenant: "tenant-a", active: true, setupRequestKey: "b".repeat(64), setupRequestHash: "c".repeat(64) }] });
  let calls = 0;
  const sandbox = { module: { exports: {} }, require: name => name === "node-fetch" ? async (uri, options) => {
    calls++;
    assert.equal(options.redirect, "error");
    assert.equal(options.headers.Authorization, "Bearer actual-proof");
    const binding = options.method === "POST";
    assert.equal(new URL(uri).pathname, binding ? "/nodics/profile/v0/internal/tenants/tenant-a/namespace-bindings" : "/nodics/profile/v0/internal/tenants/bootstrap");
    const httpRequest = { headers: options.headers, body: binding ? JSON.parse(options.body) : undefined,
      params: binding ? { tenantCode: "tenant-a" } : {} };
    return logger.runRequestPrivacy(httpRequest, async () => {
      logger.resolveRequestPrivacy(httpRequest, true);
      assert.equal(logger.admitPrivateRoute(httpRequest), true);
      let status, envelope;
      const httpResponse = { setHeader: (name, value) => assert.deepEqual([name, value], ["Cache-Control", "no-store"]),
        status: code => { status = code; return httpResponse; }, json: value => { envelope = JSON.parse(JSON.stringify(value)); } };
      const request = { httpRequest, httpResponse, authToken: "actual-proof" };
      logger.inheritRequestPrivacy(request, httpRequest);
      await new Promise((resolve, reject) => secured.authorizeAuthToken(request, {}, { nextSuccess: resolve, error: (_request, _response, error) => reject(error) }));
      try { json.handleSuccess(request, httpResponse, await controller[binding ? "bind" : "inventory"](request)); }
      catch (error) { json.handleError(request, httpResponse, error); }
      return { ok: status === 200, status, json: async () => envelope };
    });
  } : require(name), CONFIG, SERVICE, CLASSES, NODICS, UTILS, URL, AbortController, setTimeout, clearTimeout, process, Buffer };
  vm.runInNewContext(fs.readFileSync(require.resolve("../../../../nodics.foundation/modules/nService/src/service/module/defaultModuleService"), "utf8"), sandbox);
  const transport = { ...sandbox.module.exports, LOG: log, isLocalModuleActive: () => false,
    resolveRuntimeOwner: async () => null, isModuleEndpointAvailable: () => true, recordInvocationResolution() {},
    getTransportConfiguration: () => ({ timeoutMs: 500, retry: { maxAttempts: 1, statuses: [], errorCodes: [] },
      circuitBreaker: { enabled: false }, connectionPool: {} }), _agents: null, _circuits: null, _diagnostics: null };
  SERVICE.DefaultModuleService = transport;
  let transportError;
  const invoke = transport.invokeModule;
  transport.invokeModule = function (options) {
    return invoke.call(this, options).catch(error => { transportError = error; throw error; });
  };
  SERVICE.DefaultRouterService = { prepareUrl: () => "http://127.0.0.1:1/nodics/profile" };
  NODICS.getServerName = () => "fixture"; NODICS.getEnvironmentName = () => "project";
  NODICS.getSelectedEnvironmentName = () => "projectLocal"; NODICS.getNodeName = () => null;
  const handler = require("../../../../nodics.foundation/modules/nService/src/service/enterprise/defaultEnterpriseHandlerService");
  try {
    assert.throws(() => transport.assertSecureTransport({ uri: "http://127.0.0.1:1/nodics/profile/v0/internal/tenants/bootstrap",
      secureTransport: { required: true, allowInsecureLoopback: true } }), { code: "ERR_AUTH_00001" });
    assert.equal(calls, 0, "missing redirect policy fails before HTTP, not inside Profile");
    assert.deepEqual(await handler.fetchEnterprise().catch(() => assert.fail(transportError?.stack || "failure before transport")), [{ code: "platform", active: true,
      tenant: { code: "default", active: true, properties: {} } }]);
    SERVICE.DefaultDatabaseConfigurationService = { ...database, buildTenantNamespaceBinding: () => f.candidate };
    const pinned = await handler.pinTenantNamespace("tenant-a").catch(() => assert.fail(transportError?.stack || "failure before transport"));
    assert.deepEqual(pinned.properties.database.tenantNamespaceBindings[f.candidate.scopeKey], f.candidate.binding);
    assert.equal(calls, 2);
    f.grant.status = "REVOKED";
    transportError = undefined;
    await assert.rejects(handler.fetchEnterprise(), { code: "ERR_TNT_PROVISIONING_HELD" });
    assert.equal(transportError.code, "ERR_PROFILE_TENANT_PROVISIONING_HELD");
    assert.equal(transportError.responseCode, "409");
    assert.equal(calls, 3, "a real remote refusal never selects local or legacy fallback");
    assert.equal(f.state.writes, 1, "rejected inventory performs no namespace mutation");
  } finally { await transport.closeTransport(); }
});

test("actual Team inventory keyset pages completely within 256; drift, truncation and nonadvancing rows refuse", async () => {
  const f = fixture();
  const records = Array.from({ length: 256 }, (_, index) => ({ code: "enterprise-" + String(index).padStart(3, "0"), active: true, tenant: "default" }));
  let mode = "valid", calls = [];
  SERVICE.DefaultEnterpriseService.get = async request => {
    assert.equal(SERVICE.DefaultEnterpriseTeamAdministrationService.ownsEnterpriseRead(request), true);
    assert.equal(request.searchOptions.pageNumber, 1);
    assert.deepEqual(request.searchOptions.sort, { code: 1 });
    assert.ok(request.searchOptions.pageSize <= 101);
    calls.push(request);
    const remaining = records.filter(row => !request.query.code || row.code > request.query.code.$gt);
    const result = remaining.slice(0, request.searchOptions.pageSize);
    if (mode === "duplicate" && request.query.code) result[0] = records[0];
    if (mode === "truncated") result.pop();
    return { code: "SUC_DBS_00000", count: mode === "missingCount" ? undefined
      : remaining.length + (mode === "drift" && request.query.code ? 1 : 0), result };
  };
  assert.deepEqual(await f.owner.inventoryEnterpriseRows("default", 256), records);
  assert.deepEqual(calls.map(request => request.searchOptions.pageSize), [101, 101, 55]);
  for (mode of ["duplicate", "truncated", "missingCount", "drift"]) {
    calls = [];
    await assert.rejects(f.owner.inventoryEnterpriseRows("default", 256), { code: "ERR_PROFILE_TENANT_PROVISIONING_HELD" });
  }
  mode = "valid";
  await assert.rejects(f.owner.inventoryEnterpriseRows("default", 255), { code: "ERR_PROFILE_TENANT_PROVISIONING_HELD" });
});
test("NEW provisioning snapshots only original approved deployment scopes from the canonical grant owner", async () => {
  const f = fixture();
  NODICS.getEnvironmentName = () => "project"; NODICS.getSelectedEnvironmentName = () => "projectLocal";
  const originalGet = CONFIG.get;
  CONFIG.get = key => key === "defaultAuthDetail" ? { entCode: "platform" } : originalGet(key);
  const captured = await f.owner.captureCreationProperties("tenant-a", { enterpriseCode: "tenant-a",
    setupRequestKey: "b".repeat(64), setupRequestHash: "c".repeat(64) });
  assert.deepEqual(captured.enterpriseProvisioning.deploymentScopes[f.candidate.scopeKey], {
    scope: f.candidate.binding.scope, modules: ["profile"]
  });
  f.grant.runtimeScope.permissions = ["profile.enterprise.search"];
  await assert.rejects(f.owner.captureCreationProperties("tenant-a", { enterpriseCode: "tenant-a",
    setupRequestKey: "b".repeat(64), setupRequestHash: "c".repeat(64) }));
});
test("FAILED import evidence and missing original provenance hold first binding", async () => {
  const f = fixture(); f.state.evidence = [{ status: "FAILED" }];
  await assert.rejects(f.owner.bindWithProof(f.request)); assert.equal(f.state.writes, 0);
  f.state.evidence = []; delete f.state.tenant.properties.enterpriseProvisioning;
  await assert.rejects(f.owner.bindWithProof(f.request)); assert.equal(f.state.writes, 0);
});
test("unknown CAS acknowledgement recognizes only identical fresh committed state without replay", async () => {
  for (const committed of [true, false]) {
    const f = fixture(); SERVICE.DefaultTenantService.update = async request => {
      guard.protectUpdate(request); f.state.writes++;
      if (committed) f.state.tenant.properties = structuredClone(request.model.properties);
      throw new Error("private driver detail");
    };
    if (committed) await f.owner.bindWithProof(f.request); else await assert.rejects(f.owner.bindWithProof(f.request));
    assert.equal(f.state.writes, 1);
  }
});
test("generic replacement, unset, rename, pipelines, upsert and protected selectors cannot erase or forge authority", async () => {
  fixture();
  for (const model of [{ properties: {} }, { $unset: { "properties.database": 1 } }, { $rename: { description: "properties.enterpriseProvisioning" } },
    { $set: { "properties.database.tenantNamespaceBindings.fake": {} } }, [{ $replaceWith: {} }]])
    assert.throws(() => guard.protectUpdate({ model, options: {} }));
  assert.throws(() => guard.protectUpdate({ model: { description: "safe" }, options: { upsert: true } }));
  assert.throws(() => guard.protectRead({ query: { "properties.enterpriseProvisioning.setupRequestKey": "value" } }));
  await assert.rejects(guard.protectSave({ model: { code: "tenant-a" }, options: {} }));
  assert.throws(() => guard.protectRemove({}));
});
test("unrelated dotted customization is permitted; serializable owner flags never admit protected mutations", () => {
  fixture(); assert.equal(guard.protectUpdate({ model: { $set: { "properties.presentation.title": "Custom" } } }), true);
  assert.throws(() => guard.protectUpdate({ authData: { isSystem: true }, privateOwner: true, model: { properties: {} } }));
});
test("private forward Init only reapplies unprotected authority Tenant fields with exact no-upsert identity", async () => {
  fixture();
  const owner = require("../../../../nodics.foundation/modules/nData/nImport/import/src/service/release/defaultDataReleaseService");
  const original = { _id: "authority-id", code: "default", properties: { database: { tenantNamespaceBindings: { preserved: true } } } };
  SERVICE.DefaultTenantService.get = async () => ({ code: "SUC_SYS_00000", result: [structuredClone(original)] });
  const request = { tenant: "default", model: { code: "default", active: true, description: "Default tenant" }, query: { code: "default" }, options: {} };
  const release = { ...owner,
    configuration: () => ({ types: { init: { enabled: true } } }),
    discoverReleases: () => [{ moduleName: "profile", releaseCode: "profile:init-v001" }],
    isDestinationCompatible: () => true, preparePlan: async () => ({ tenant: "default" }),
    operationReleases: async () => [{ status: "AVAILABLE" }],
    executePreparedPlan: () => guard.protectSave(request),
  };
  SERVICE.DefaultDataReleaseService = release;
  await assert.rejects(guard.protectSave(request));
  await release.installStartupReleases({ tenant: "default", modules: ["profile"] });
  assert.deepEqual(request.query, { code: "default", _id: "authority-id" });
  assert.equal(request.options.upsert, false);
  assert.equal(request.model.properties, undefined);
  assert.deepEqual(original.properties.database.tenantNamespaceBindings, { preserved: true });
  await assert.rejects(guard.protectSave(request));
  for (const variant of ["properties", "other-code", "other-tenant", "upsert"]) {
    const attempted = { tenant: "default", model: { code: "default", description: "Default tenant" }, options: {} };
    if (variant === "properties") attempted.model.properties = {};
    if (variant === "other-code") attempted.model.code = "tenant-a";
    if (variant === "other-tenant") attempted.tenant = "tenant-a";
    if (variant === "upsert") attempted.options.upsert = true;
    release.executePreparedPlan = () => guard.protectSave(attempted);
    await assert.rejects(release.installStartupReleases({ tenant: "default", modules: ["profile"] }));
  }
});
test("actual generated authority Tenant startup save preserves pins and refuses concurrent removal without resurrection", async (t) => {
  const oldUpper = String.prototype.toUpperCaseFirstChar;
  if (!oldUpper)
    String.prototype.toUpperCaseFirstChar = function () {
      return this[0].toUpperCase() + this.slice(1);
    };
  t.after(() => {
    if (!oldUpper) delete String.prototype.toUpperCaseFirstChar;
  });
  for (const removed of [false, true]) {
    fixture();
    CLASSES.NodicsError.enrich = (error) => error;
    const root = "../../../../nodics.foundation/modules/";
    const fs = require("node:fs"),
      vm = require("node:vm");
    const log = { debug() {}, info() {}, warn() {}, error() {} };
    const get = {
      ...require(
        root +
          "nDatabase/database/src/service/procs/get/defaultModelsGetInitializerService",
      ),
      LOG: log,
    };
    const save = {
      ...require(
        root +
          "nDatabase/database/src/service/procs/save/defaultModelSaveInitializerService",
      ),
      LOG: log,
    };
    const adapter = require(
      root + "nDatabase/mongodb/src/schemas/model",
    ).default;
    const releaseOwner = require(
      root +
        "nData/nImport/import/src/service/release/defaultDataReleaseService",
    );
    const original = {
      _id: "authority-id",
      code: "default",
      active: true,
      properties: {
        database: { tenantNamespaceBindings: { preserved: true } },
      },
    };
    const state = {
      rows: [structuredClone(original)],
      writes: 0,
      inserts: 0,
      options: undefined,
    };
    const schema = {
      ...adapter,
      schemaName: "tenant",
      rawSchema: {},
      dataBase: {
        getOptions: () => ({
          modelSaveOptions: { upsert: true, returnDocument: "after" },
        }),
      },
      findOneAndUpdate: async (query, document, options) => {
        assert.deepEqual(query, { code: "default", _id: "authority-id" });
        assert.equal(options.upsert, false);
        state.options = options;
        // The guard's fresh generated read completed before this driver boundary.
        if (removed) state.rows.splice(0);
        const row = state.rows.find(
          (item) => item._id === query._id && item.code === query.code,
        );
        if (row) {
          Object.assign(row, document.$set);
          state.writes++;
          return { ok: 1, value: structuredClone(row) };
        }
        if (options.upsert === true) {
          state.inserts++;
          state.rows.push({ ...document.$set, _id: "resurrected" });
        }
        return {
          ok: 1,
          value: null,
          lastErrorObject: { updatedExisting: false },
        };
      },
      insertOne: async () => {
        state.inserts++;
        throw new Error("Authority continuation must not insert");
      },
    };
    UTILS = { isBlank: (value) => !value || !Object.keys(value).length };
    SERVICE.DefaultInterceptorService = {
      ...require(
        root + "nCommon/src/service/interceptor/defaultInterceptorService",
      ),
      LOG: log,
    };
    SERVICE.DefaultDatabaseConfigurationService = {
      getSchemaInterceptors: () =>
        Object.fromEntries(
          ["preGet", "postGet", "preSave", "postSave"].map((trigger) => [
            trigger,
            Object.values(interceptors).filter(
              (hook) => hook.item === "tenant" && hook.trigger === trigger,
            ),
          ]),
        ),
    };
    NODICS.getModels = () => ({ TenantModel: schema });
    const step = (owner, method, request, response) =>
      new Promise((resolve, reject) =>
        owner[method](request, response, {
          nextSuccess: resolve,
          error: (_request, _response, error) => reject(error),
        }),
      );
    SERVICE.DefaultPipelineService = {
      start: async (name, request, response) => {
        if (name === "modelsGetInitializerPipeline") {
          await step(get, "applyPreInterceptors", request, response);
          response.success = {
            code: "SUC_FIND_00000",
            count: state.rows.length,
            result: structuredClone(state.rows),
          };
          await step(get, "applyPostInterceptors", request, response);
        } else {
          assert.equal(name, "modelSaveInitializerPipeline");
          await step(save, "applyPreInterceptors", request, response);
          await step(save, "saveModel", request, response);
          await step(save, "applyPostInterceptors", request, response);
        }
        return response.success;
      },
    };
    const text = fs
      .readFileSync(
        require.resolve(root + "nService/src/service/common"),
        "utf8",
      )
      .replaceAll("mdulnm", "profile")
      .replaceAll("mdlnm", "TenantModel")
      .replaceAll("schmanm", "tenant");
    const box = { exports: {} };
    vm.runInNewContext(text, { module: box, SERVICE, NODICS, CONFIG, CLASSES });
    SERVICE.DefaultTenantService = box.exports;
    const release = {
      ...releaseOwner,
      configuration: () => ({ types: { init: { enabled: true } } }),
      discoverReleases: () => [
        { moduleName: "profile", releaseCode: "profile:init-v001" },
      ],
      isDestinationCompatible: () => true,
      preparePlan: async () => ({ tenant: "default" }),
      operationReleases: async () => [{ status: "AVAILABLE" }],
      executePreparedPlan: () =>
        SERVICE.DefaultTenantService.save({
          tenant: "default",
          query: { code: "default" },
          model: { code: "default", description: "Forward authority seed" },
          options: {},
        }),
    };
    SERVICE.DefaultDataReleaseService = release;
    const pending = release.installStartupReleases({
      tenant: "default",
      modules: ["profile"],
    });
    if (removed) {
      await assert.rejects(pending, (error) => error.code === "ERR_MDL_00005");
      assert.deepEqual(state.rows, []);
      assert.equal(state.writes, 0);
    } else {
      const result = await pending;
      assert.equal(result.code, "SUC_SAVE_00000");
      assert.equal(state.rows.length, 1);
      assert.deepEqual(state.rows[0].properties, original.properties);
      assert.equal(state.writes, 1);
      assert.equal(
        result.result.properties.database.tenantNamespaceBindings,
        undefined,
      );
    }
    assert.equal(state.options.upsert, false);
    assert.equal(state.inserts, 0);
    assert.equal(release.isStartupReleaseExecution("default"), false);
  }
});
test("private write admission rejects request mutation and expires after owner invocation", async () => {
  fixture(); const request = { tenant: "default", query: { code: "tenant-a" }, model: { properties: {} } };
  SERVICE.DefaultTenantService.update = async input => { input.model.properties.forged = true; guard.protectUpdate(input); };
  await assert.rejects(guard.invoke("update", request)); assert.throws(() => guard.protectUpdate(request));
});
test("public recursive reads redact copies while bounded private reads retain pin and provenance", async () => {
  const f = fixture(); const original = structuredClone(f.state.tenant);
  const response = { result: [{ tenant: original }] }; guard.redact({}, response);
  assert.equal(response.result[0].tenant.properties.enterpriseProvisioning, undefined);
  assert.ok(original.properties.enterpriseProvisioning);
  const privateRows = await f.owner.rows("DefaultTenantService", { code: "tenant-a" });
  assert.ok(privateRows[0].properties.enterpriseProvisioning);
});
test("authorized runtime projection retains fresh namespace while excluding private creation hashes", async () => {
  const f = fixture();
  const enterprise = require("../src/service/enterprise/defaultEnterpriseService");
  const owner = { ...enterprise, retrieveEnterprise: async () => ({ code: "tenant-a", active: true,
    tenant: { code: "tenant-a", active: true, properties: {} } }) };
  const auth = { ...f.auth, tenant: "tenant-a", entCode: "tenant-a", permissions: ["profile.enterprise.search"] };
  const result = await owner.getRuntimeEnterprise({ tenant: "tenant-a", entCode: "tenant-a", authData: auth });
  assert.deepEqual(result.result[0].tenant.properties.database.tenantNamespace, f.state.tenant.properties.database.tenantNamespace);
  assert.equal(result.result[0].tenant.properties.enterpriseProvisioning, undefined);
});
test("Profile activation event carries only identity even if tenant is already provisional, without continuation or configuration", async () => {
  const f = fixture(); let published, joined = 0;
  const old = global.ENUMS;
  global.ENUMS = { TargetType: { MODULE_NODES: { key: "MODULE_NODES" } } };
  NODICS.getActiveTenants = () => ["tenant-a"];
  SERVICE.DefaultEnterpriseHandlerService = { buildEnterprise: async () => { joined++; } };
  SERVICE.DefaultEventService = { publish: async event => { published = event; return true; } };
  const owner = { ...require("../src/service/interceptors/defaultEnterpriseUpdateInterceptorService"), LOG: { debug() {}, error() {}, warn() {} } };
  try {
    await owner.triggerEnterpriseUpdateEvent({ code: "tenant-a", active: true, tenant: { code: "tenant-a", active: true },
      setupRequestKey: "private", setupContinuation: { originalHash: "private", administratorNomination: "private" } });
    assert.equal(joined, 1); assert.equal(published.event, "addEnterprise");
    assert.deepEqual(published.data.enterprise, { code: "tenant-a", active: true, tenant: { code: "tenant-a", active: true } });
  } finally { if (old === undefined) delete global.ENUMS; else global.ENUMS = old; }
});
test("route is fixed service-only private POST with capability-owned exposure, hooks and nonindexed properties", () => {
  const route = routes.profile.tenantNamespaceBindings.bind;
  assert.deepEqual(route.authTokenTypes, ["service"]); assert.equal(route.method, "POST");
  assert.equal(route.apiExposure, "profileTenantProvisioning"); assert.equal(route.requestPrivacy.sensitive, true);
  assert.equal(route.controller, "DefaultTenantNamespaceBindingController"); assert.equal(route.operation, "bind");
  assert.equal(schemas.profile.tenant.definition.properties.searchOptions.enabled, false);
  for (const trigger of ["preGet", "preSave", "preUpdate", "preRemove", "postGet", "postSave", "postUpdate"])
    assert.equal(interceptors["tenantProvisioning_" + trigger].item, "tenant");
  assert.equal(routes.profile.tenantNamespaceBindings.inventory.method, "GET");
  assert.deepEqual(routes.profile.tenantNamespaceBindings.inventory.authTokenTypes, ["service"]);
});

test("prepared inventory GET uses existing enterprise-search authority independently of namespace binding POST", () => {
  fixture();
  const router = require("../../../../nodics.foundation/modules/nRouter/src/service/router/defaultRouterService");
  const security = require("../../../../nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService");
  const prepared = {};
  const get = CONFIG.get;
  CONFIG.get = key => key === "servers" ? { options: { contextRoot: "nodics" } } : get(key);
  NODICS.addRouter = (name, definition) => { prepared[definition.operation] = definition; };
  SERVICE.DefaultRouterOperationService = { get() {}, post() {} };
  for (const [name, definition] of Object.entries(routes.profile.tenantNamespaceBindings)) {
    router.prepareRouter({ routerDef: definition, urlPrefix: "profile", moduleName: "profile", routerName: name, moduleRouter: {} });
  }
  assert.equal(prepared.inventory.url, "/nodics/profile/v0/internal/tenants/bootstrap");
  assert.deepEqual(security.getRoutePermissions(prepared.inventory), ["profile.enterprise.search"]);
  assert.deepEqual(security.getRoutePermissions(prepared.bind), ["profile.tenant.namespace.bind"]);
  const reader = { permissions: ["profile.enterprise.search"], runtimeScope: { assignmentCode: "grant" } };
  assert.equal(security.hasRoutePermission({ router: prepared.inventory, authData: reader }), true);
  assert.equal(security.hasRoutePermission({ router: prepared.bind, authData: reader }), false);
  const binder = { permissions: ["profile.tenant.namespace.bind"], runtimeScope: { assignmentCode: "grant" } };
  assert.equal(security.hasRoutePermission({ router: prepared.inventory, authData: binder }), false);
});

test("generated Tenant wrapper and actual pre/post pipeline dispatch retain private reads/CAS but redact and reject generic access", async () => {
  const f = fixture();
  const root = "../../../../nodics.foundation/modules/";
  const fs = require("node:fs"), vm = require("node:vm");
  const get = { ...require(root + "nDatabase/database/src/service/procs/get/defaultModelsGetInitializerService"), LOG: { debug() {} } };
  const update = { ...require(root + "nDatabase/database/src/service/procs/update/defaultModelsUpdateInitializerService"), LOG: { debug() {} } };
  const dispatcher = require(root + "nCommon/src/service/interceptor/defaultInterceptorService");
  const oldUpper = String.prototype.toUpperCaseFirstChar;
  if (!oldUpper) String.prototype.toUpperCaseFirstChar = function () { return this[0].toUpperCase() + this.slice(1); };
  CLASSES.NodicsError.enrich = error => error;
  SERVICE.DefaultInterceptorService = dispatcher;
  SERVICE.DefaultDatabaseConfigurationService = { ...database, getSchemaInterceptors: () =>
    Object.fromEntries(["preGet", "postGet", "preUpdate", "postUpdate"].map(trigger => [trigger,
      Object.values(interceptors).filter(hook => hook.item === "tenant" && hook.trigger === trigger)])) };
  const schema = { schemaName: "tenant", rawSchema: {}, updateItems: async request => {
    f.state.writes++; f.state.tenant.properties = structuredClone(request.model.properties);
    return { count: 1, models: [structuredClone(f.state.tenant)] };
  } };
  NODICS.getModels = () => ({ TenantModel: schema });
  const step = (owner, method, request, response) => new Promise((resolve, reject) => owner[method](request, response, {
    nextSuccess: resolve, error: (_request, _response, error) => reject(error)
  }));
  // Infrastructure/persistence are memory-only; generated owner, pipeline hook steps and dispatcher are actual source.
  SERVICE.DefaultPipelineService = { start: async (name, request, response) => {
    if (name === "modelsGetInitializerPipeline") {
      await step(get, "applyPreInterceptors", request, response);
      response.success = { code: "SUC_SYS_00000", result: [structuredClone(f.state.tenant)] };
      await step(get, "applyPostInterceptors", request, response);
    } else {
      assert.equal(name, "modelsUpdateInitializerPipeline");
      await step(update, "applyPreInterceptors", request, response);
      await step(update, "executeQuery", request, response);
      await step(update, "applyPostInterceptors", request, response);
    }
    return response.success;
  } };
  const text = fs.readFileSync(require.resolve(root + "nService/src/service/common"), "utf8")
    .replaceAll("mdulnm", "profile").replaceAll("mdlnm", "TenantModel").replaceAll("schmanm", "tenant");
  const box = { exports: {} }; vm.runInNewContext(text, { module: box, SERVICE, NODICS, CONFIG, CLASSES });
  SERVICE.DefaultTenantService = box.exports;
  try {
    const publicRows = await SERVICE.DefaultTenantService.get({ tenant: "default", query: { code: "tenant-a" } });
    assert.equal(publicRows.result[0].properties.enterpriseProvisioning, undefined);
    const privateRows = await f.owner.rows("DefaultTenantService", { code: "tenant-a" });
    assert.ok(privateRows[0].properties.enterpriseProvisioning);
    await assert.rejects(SERVICE.DefaultTenantService.update({ tenant: "default", query: { code: "tenant-a" }, model: { properties: {} } }));
    assert.equal(f.state.writes, 0);
    await f.owner.bindWithProof(f.request); assert.equal(f.state.writes, 1);
    const stored = await f.owner.rows("DefaultTenantService", { code: "tenant-a" });
    assert.deepEqual(stored[0].properties.database.tenantNamespaceBindings[f.candidate.scopeKey], f.candidate.binding);
  } finally { if (!oldUpper) delete String.prototype.toUpperCaseFirstChar; }
});
