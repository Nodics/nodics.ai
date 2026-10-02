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
 * @module profile/test/enterpriseTenantProvisioningContract
 * @description Isolated namespace-intent/provenance and conditional-readback fixtures. No provider connections, runtime startup or persisted writes.
 * @owner profile
 * @layer test
 */
const assert = require("node:assert/strict");
const { test, beforeEach, afterEach } = require("node:test");
const source = require("../src/service/enterprise/defaultEnterpriseTenantProvisioningService");
const management = require("../src/service/enterprise/defaultEnterpriseManagementService");
const database = require("../../../../nodics.foundation/modules/nDatabase/database/src/service/config/defaultDatabaseConfigurationService");
const guard = require("../src/service/enterprise/defaultTenantProvisioningGuardService");
const key = "a".repeat(64), hash = "b".repeat(64);
let previous;
beforeEach(() => {
  previous = Object.fromEntries(["CONFIG", "SERVICE", "NODICS", "CLASSES"].map(name => [name, global[name]]));
});
afterEach(() => {
  for (const [name, value] of Object.entries(previous)) {
    if (value === undefined) delete global[name]; else global[name] = value;
  }
});

function fixture() {
  const state = { tenant: { _id: "tenant-id", code: "enterprise-a", active: true }, writes: 0, reads: [], evidence: {} };
  const enterprise = { _id: "enterprise-id", code: "enterprise-a", tenant: "enterprise-a", active: true,
    setupRequestKey: key, setupRequestHash: hash };
  global.CONFIG = { get: name => name === "defaultTenant" ? "authority" : undefined };
  global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
  global.NODICS = { getInternalAuthTokens: () => ({}), getModels: () => ({ TenantModel: { rawSchema: {} } }) };
  global.SERVICE = {
    DefaultTenantProvisioningGuardService: guard,
    DefaultLoggerService: { runSensitiveOperation: async (request, work) => work() },
    DefaultModelSaveInitializerService: { applyDefaultValues: (request, response, process) => process.nextSuccess(request, response) },
    DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ isSystem: true }) },
    DefaultDatabaseConfigurationService: { createTenantNamespaceIntent: database.createTenantNamespaceIntent },
    DefaultEnterpriseTeamAdministrationService: { readEnterpriseEnvelope: (owner, request) => owner.get(request) },
    DefaultEnterpriseService: { get: async request => {
      assert.equal(request.tenant, "authority"); return { code: "SUC_SYS_00000", result: [structuredClone(enterprise)] };
    } },
    DefaultTenantService: {
      get: async () => ({ code: "SUC_SYS_00000", result: [structuredClone(state.tenant)] }),
      update: async request => {
        assert.equal(request.query._id, "tenant-id"); assert.equal(request.options.upsert, false);
        assert.deepEqual(request.query.properties, { $exists: false });
        state.writes++; state.tenant.properties = structuredClone(request.model.properties);
        return { code: "SUC_SYS_00000", result: { matchedCount: 1 } };
      }
    }
  };
  for (const name of ["DefaultEnterpriseAccessAssignmentService", "DefaultPrincipalScopeAssignmentService",
    "DefaultDataInstallationService", "DefaultImportRunService", "DefaultEmployeeService", "DefaultCustomerService"]) {
    SERVICE[name] = { get: async request => {
      assert.equal(request.tenant, "authority"); assert.equal(request.options.skipItemCache, true);
      state.reads.push(name); return { code: "SUC_SYS_00000", result: state.evidence[name] || [] };
    } };
  }
  return { state, enterprise, owner: { ...source } };
}

test("admitted Local runtime view derives only enterprise binding and preserves explicit or nonlocal credential ownership", () => {
  const f = fixture(), original = CONFIG.get;
  CONFIG.get = name => name === "profileTenantProvisioning" ? { enabled: true } : original(name);
  SERVICE.DefaultMandatoryIdentityBootstrapService = { isLocalRuntimeCredentialBootstrapEnabled: () => true };
  const tenant = { code: "enterprise-a", properties: { enterpriseProvisioning: { enterpriseCode: "enterprise-a" } } };
  const view = f.owner.runtimeBootstrapView(tenant);
  assert.deepEqual(view.properties.defaultAuthDetail, { entCode: "enterprise-a" });
  assert.equal(Object.hasOwn(tenant.properties, "defaultAuthDetail"), false);
  assert.equal(Object.hasOwn(view.properties.defaultAuthDetail, "apiKey"), false);
  for (const explicit of [null, {}, { entCode: "operator-owned" }]) {
    const configured = { ...tenant, properties: { ...tenant.properties, defaultAuthDetail: explicit } };
    assert.equal(f.owner.runtimeBootstrapView(configured), configured);
  }
  SERVICE.DefaultMandatoryIdentityBootstrapService.isLocalRuntimeCredentialBootstrapEnabled = () => false;
  assert.equal(f.owner.runtimeBootstrapView(tenant), tenant);
  SERVICE.DefaultMandatoryIdentityBootstrapService.isLocalRuntimeCredentialBootstrapEnabled = () => true;
  CONFIG.get = original;
  assert.equal(f.owner.runtimeBootstrapView(tenant), tenant);
  assert.equal(f.state.writes, 0);
});

test("new creation persists database-owner intent and original setup binding, never physical DB overrides", () => {
  const f = fixture();
  const properties = f.owner.propertiesForCreation("enterprise-a", {
    enterpriseCode: "enterprise-a", setupRequestKey: key, setupRequestHash: hash
  });
  assert.deepEqual(properties.database, { tenantNamespace: { version: 1, mode: "DERIVED", tenantCode: "enterprise-a" } });
  assert.equal(properties.enterpriseProvisioning.setupRequestKey, key);
  assert.equal(JSON.stringify(properties).includes("databaseName"), false);
  assert.equal(f.state.writes, 0);
});

test("ensureTenant stores intent for a genuinely new non-default tenant", async () => {
  const f = fixture(); let saved;
  SERVICE.DefaultEnterpriseTenantProvisioningService = f.owner;
  f.owner.captureCreationProperties = async (...args) => f.owner.propertiesForCreation(...args);
  SERVICE.DefaultTenantService.get = async () => ({ code: "SUC_SYS_00000", result: [] });
  SERVICE.DefaultTenantService.save = async request => { saved = request; };
  await management.ensureTenant("enterprise-a", { authData: { person: {} }, body: { idempotencyKey: "original-key" } }, "Enterprise A", {
    enterpriseCode: "enterprise-a", setupRequestKey: key, setupRequestHash: hash
  });
  assert.equal(saved.model.properties.database.tenantNamespace.tenantCode, "enterprise-a");
  assert.equal(saved.idempotencyKey, "tenant-original-key");
});

test("default tenant remains unchanged", async () => {
  const f = fixture(); f.enterprise.tenant = "authority";
  assert.equal(await f.owner.prepare(f.enterprise), "authority");
  assert.equal(f.state.writes, 0); assert.deepEqual(f.state.reads, []);
});

test("default Init Tenant seed passes actual save guard without private capture admission and reads stay redacted", async () => {
  fixture();
  const seed = require("../data/init-v001/records/enterprise/defaultTenantsData").record0;
  const header = require("../data/init-v001/headers/enterprise/defaultEnterpriseHeader").profile.defaultTenants;
  CONFIG.get = name => name === "defaultTenant" ? "default" : name === "log"
    ? { requestPrivacy: { qualified: false, captureMode: "disabled" } } : undefined;
  let privateCalls = 0, reads = 0, result;
  SERVICE.DefaultLoggerService.runSensitiveOperation = () => { privateCalls++; throw new Error("Sensitive private entry is unavailable"); };
  SERVICE.DefaultTenantService.get = async request => {
    reads++;
    assert.equal(request.tenant, "default"); assert.equal(request.options.skipItemCache, true);
    assert.equal(request.options.recursive, false); assert.equal(request.searchOptions.pageSize, 2);
    guard.protectRead(request);
    const response = { code: "SUC_DBS_00000", result: result || [] };
    guard.redact(request, response); return response;
  };
  const request = { tenant: "default", authData: { userGroups: header.options.userGroups },
    model: structuredClone(seed), query: { code: seed.code }, options: {} };
  assert.equal(await guard.protectSave(request), true);
  assert.equal(privateCalls, 0); assert.equal(reads, 1);
  result = [{ code: seed.code, properties: { custom: "visible", enterpriseProvisioning: { setupRequestHash: hash },
    database: { tenantNamespace: { mode: "DERIVED" }, tenantNamespaceBindings: { private: "pin" } } } }];
  const publicRead = await SERVICE.DefaultTenantService.get({ tenant: "default", query: { code: seed.code },
    options: { recursive: false, skipItemCache: true }, searchOptions: { pageSize: 2 } });
  assert.deepEqual(publicRead.result[0].properties, { custom: "visible", database: {} });
  assert.equal(result[0].properties.enterpriseProvisioning.setupRequestHash, hash);
  await assert.rejects(guard.protectSave(request), { code: "ERR_PROFILE_TENANT_PROVISIONING_HELD" });
  assert.equal(privateCalls, 0);
  for (const response of [{ code: "ERR_DBS_00000", result: [] }, {}, { code: "SUC_DBS_00000", result: [], errors: ["failed"] }]) {
    SERVICE.DefaultTenantService.get = async () => response;
    await assert.rejects(guard.protectSave(request), { code: "ERR_PROFILE_TENANT_PROVISIONING_HELD" });
  }
  await assert.rejects(guard.protectSave({ ...request, model: { ...request.model,
    properties: { database: { tenantNamespace: { mode: "DERIVED" } } } } }), { code: "ERR_PROFILE_TENANT_PROVISIONING_HELD" });
});

test("unused retained creation without original deployment snapshot holds before any persistence", async () => {
  for (const properties of [undefined, {}]) {
    const f = fixture();
    if (properties !== undefined) f.state.tenant.properties = properties;
    await assert.rejects(f.owner.prepare(f.enterprise), { code: "ERR_PROFILE_TENANT_PROVISIONING_HELD" });
    assert.equal(f.state.writes, 0); assert.deepEqual(f.state.reads, []);
    assert.deepEqual(f.state.tenant.properties, properties);
  }
});

test("ANY Init receipt or run, including FAILED, holds without configuration writes", async () => {
  for (const service of ["DefaultDataInstallationService", "DefaultImportRunService"]) {
    for (const status of ["FAILED", "RUNNING", "CURRENT", "COMPLETED"]) {
      const f = fixture(); f.state.evidence[service] = [{ status }];
      await assert.rejects(f.owner.prepare(f.enterprise), { code: "ERR_PROFILE_TENANT_PROVISIONING_HELD" });
      assert.equal(f.state.writes, 0);
    }
  }
});

test("membership, grants, identity origins and lost request binding do not authorize relocation", async () => {
  for (const service of ["DefaultEnterpriseAccessAssignmentService", "DefaultPrincipalScopeAssignmentService",
    "DefaultEmployeeService", "DefaultCustomerService"]) {
    const f = fixture(); f.state.evidence[service] = [{ _id: "used" }];
    await assert.rejects(f.owner.prepare(f.enterprise), { code: "ERR_PROFILE_TENANT_PROVISIONING_HELD" });
    assert.equal(f.state.writes, 0);
  }
  const f = fixture(); delete f.enterprise.setupRequestKey;
  await assert.rejects(f.owner.prepare(f.enterprise), { code: "ERR_PROFILE_TENANT_PROVISIONING_HELD" });
  assert.equal(f.state.writes, 0);
});

test("existing original namespace and deployment snapshot are read without replacement", async () => {
  const f = fixture();
  f.state.tenant.properties = f.owner.propertiesForCreation("enterprise-a", {
    enterpriseCode: "enterprise-a", setupRequestKey: key, setupRequestHash: hash
  });
  f.state.tenant.properties.enterpriseProvisioning.deploymentScopes = { original: { scope: {
    projectCode: "originalProject", environmentCode: "originalEnvironment", serverCode: "originalServer"
  }, modules: ["profile"] } };
  assert.deepEqual((await f.owner.prepare(f.enterprise)).properties, f.state.tenant.properties);
  assert.equal(f.state.writes, 0);
});

test("current approved grants cannot mint a missing historical creation snapshot", async () => {
  const f = fixture();
  f.owner.captureCreationProperties = async () => { throw new Error("must not recapture current grants"); };
  SERVICE.DefaultPrincipalScopeAssignmentService.get = async () => { throw new Error("must not infer historical scope"); };
  SERVICE.DefaultTenantService.update = async () => { f.state.writes++; throw new Error("must not persist"); };
  await assert.rejects(f.owner.prepare(f.enterprise), { code: "ERR_PROFILE_TENANT_PROVISIONING_HELD" });
  assert.equal(f.state.writes, 0); assert.equal(f.state.tenant.properties, undefined);
});

test("existing explicit policy is not rewritten; malformed reads or namespace provenance refuse", async () => {
  const f = fixture(); f.state.tenant.properties = { database: { profile: { configuredByOwner: true } } };
  assert.deepEqual((await f.owner.prepare(f.enterprise)).properties, f.state.tenant.properties);
  assert.equal(f.state.writes, 0);
  SERVICE.DefaultTenantService.get = async () => ({ result: [] });
  await assert.rejects(f.owner.prepare(f.enterprise), { code: "ERR_PROFILE_TENANT_PROVISIONING_HELD" });
});
