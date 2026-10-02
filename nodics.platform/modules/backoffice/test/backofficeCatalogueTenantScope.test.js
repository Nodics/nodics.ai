/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/**
 * @module backoffice/test/backofficeCatalogueTenantScope
 * @description Exercises real bootstrap, employee filtering and private project eligibility with distinct employee and catalogue tenants.
 * @layer test
 * @owner backoffice
 */
const assert = require("node:assert/strict");
const { beforeEach, test } = require("node:test");
const catalogueDefinition = require("../src/service/registry/defaultFunctionalModuleCatalogueService");
const registryDefinition = require("../src/service/registry/defaultBackofficeRegistryService");
const capabilityDefinition = require("../src/service/registry/defaultBackofficeCapabilityRegistryService");

let authorityTenant, model, rows, reads, modelReads, request, registry, catalogue;
let policyRequests, systemAuth;

beforeEach(() => {
  authorityTenant = "default";
  model = { code: "project-catalogue-model" };
  rows = [{ projectCode: "example.project", functionalModule: "nodics.platform",
    technicalModules: ["profile", "restricted"], runtimeState: "ACTIVE",
    registrationState: "REGISTERED", enabled: true }];
  reads = [];
  modelReads = [];
  policyRequests = [];
  systemAuth = Object.freeze({ principalId: "system", permissions: ["*"] });
  request = Object.freeze({
    tenant: "registered-tenant", entCode: "registered-enterprise",
    authData: Object.freeze({ tenant: "registered-tenant", entCode: "registered-enterprise",
      principalId: "employee", tokenType: "access", permissions: Object.freeze(["profile.view"]) }),
    query: Object.freeze({ tenant: "forged-tenant" }),
    headers: Object.freeze({ "x-nodics-client-contract-version": "1" }),
  });
  global.CLASSES = { NodicsError: class extends Error {
    constructor(code, message) { super(message); this.code = code; }
  } };
  global.CONFIG = { get: key => ({
    defaultTenant: authorityTenant, defaultPageSize: 1,
    backofficeRegistry: { compatibility: { registryContractVersion: 1 },
      clientSafeMetadata: ["moduleName", "backoffice", "functionalModuleIdentity"] },
  })[key] };
  global.NODICS = {
    getEnvironmentName: () => "example.project",
    getModels: (moduleName, tenant) => {
      modelReads.push({ moduleName, tenant });
      return tenant === authorityTenant ? { BackofficeFunctionalModuleRegistrationModel: model } : {};
    },
  };
  catalogue = Object.assign({}, catalogueDefinition);
  const leases = ["profile", "restricted"].map(moduleName => ({ value: {
    moduleName, functionalModuleIdentity: "nodics.platform",
    backoffice: { enabled: true, contractVersion: 1,
      requiredPermissions: [moduleName + ".view"],
      navigation: [
        { id: moduleName + "-view", route: "/" + moduleName, requiredPermissions: [moduleName + ".view"] },
        { id: moduleName + "-admin", route: "/" + moduleName + "/admin", requiredPermissions: [moduleName + ".admin"] },
      ] },
  } }));
  registry = Object.assign({}, registryDefinition, {
    expireStale: async () => {},
    getStore: () => ({ values: async () => leases }),
  });
  global.SERVICE = {
    DefaultFunctionalModuleCatalogueService: catalogue,
    DefaultBackofficeRegistryService: registry,
    DefaultBackofficeCapabilityRegistryService: Object.assign({}, capabilityDefinition),
    DefaultIdentityGovernanceService: { getSystemAuthData: () => systemAuth },
    DefaultAxisExperiencePolicyService: { getEffective: async input => {
      policyRequests.push(input);
      return { source: "DEFAULT", revision: 0 };
    } },
    DefaultPipelineService: { start: async (pipeline, input) => {
      assert.equal(pipeline, "modelsGetInitializerPipeline", "eligibility must never write");
      assert.equal(input.schemaModel, model);
      assert.equal(input.authData, systemAuth);
      assert.equal(input.tenant, authorityTenant);
      assert.deepEqual(input.query, { projectCode: "example.project" });
      reads.push(input);
      const matching = rows.filter(row => row.projectCode === input.query.projectCode);
      const { pageNumber, pageSize } = input.searchOptions;
      return { result: matching.slice((pageNumber - 1) * pageSize, pageNumber * pageSize) };
    } },
  };
});

for (const tenant of ["default", "configured-authority"]) {
  test(`bootstrap reads ${tenant} catalogue and preserves employee filtering/context`, async () => {
    authorityTenant = tenant;
    const before = JSON.stringify(request);
    const result = await registry.bootstrap(request);
    assert.deepEqual(Object.keys(result.data.modules), ["profile"]);
    assert.deepEqual(Object.keys(result.data.catalogue), ["profile"]);
    assert.deepEqual(result.data.catalogue.profile.navigation.map(item => item.id), ["profile-view"]);
    assert.deepEqual(result.data.effectiveNavigationComposition.navigation.map(item => item.id), ["profile-view"]);
    assert.equal(reads.length, 2, "read all project pages including the bounded final page");
    assert(modelReads.every(read => read.moduleName === "backoffice" && read.tenant === tenant));
    assert.equal(policyRequests.length, 1);
    assert.equal(policyRequests[0], request, "employee policy must receive the original request");
    assert.equal(JSON.stringify(request), before);
    assert.equal(catalogue.getTenant(request), "registered-tenant", "other catalogue scopes remain unchanged");
  });
}

test("unavailable authority model rejects bootstrap without employee-tenant fallback", async () => {
  model = undefined;
  await assert.rejects(() => registry.bootstrap(request), /catalogue model is unavailable/);
  assert.deepEqual(modelReads, [{ moduleName: "backoffice", tenant: "default" }]);
  assert.equal(reads.length, 0);
  assert.equal(policyRequests.length, 0);
});

test("a failed later page never returns partial bootstrap eligibility", async () => {
  const read = SERVICE.DefaultPipelineService.start;
  SERVICE.DefaultPipelineService.start = (pipeline, input) => {
    if (input.searchOptions.pageNumber === 2) throw new Error("authority read failed");
    return read(pipeline, input);
  };
  await assert.rejects(() => registry.bootstrap(request), /authority read failed/);
  assert.equal(reads.length, 1);
  assert.equal(policyRequests.length, 0);
});

test("foreign project, disabled, offline and missing registrations never authorize a capability", async () => {
  const active = { ...rows[0] };
  for (const candidates of [[], [{ ...active, projectCode: "other.project" }],
    [{ ...active, enabled: false }], [{ ...active, runtimeState: "OFFLINE" }],
    [{ ...active, registrationState: "AVAILABLE" }]]) {
    rows = candidates;
    const result = await registry.bootstrap(request);
    assert.deepEqual(result.data.modules, {});
    assert.deepEqual(result.data.catalogue, {});
    assert.equal(policyRequests.at(-1), request);
  }
});
