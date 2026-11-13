/*
    Nodics - Enterprice Micro-Services Management Framework
    Copyright (c) 2026 Nodics All rights reserved.
    Governed by the root LICENSE or a separate written agreement with Nodics.
 */
"use strict";
/** @module eWaste/test/eWasteInactiveIntegrationConfiguration @description Tests actual inactive namespace discovery/merge and functional publication resolution; temporary metadata only, no runtime activation or servers. @layer test @owner eWaste */
const test = require("node:test"), assert = require("node:assert/strict"), fs = require("node:fs"), os = require("node:os"), path = require("node:path");
const root = path.resolve(__dirname, "../../../../../..");
const load = file => require(path.join(root, file));
const initializer = load("nodics.foundation/modules/nConfig/src/service/DefaultFrameworkInitializerService");
const bindings = load("nodics.foundation/modules/nConfig/src/service/defaultConfigurationBindingService");
const resolver = load("nodics.foundation/modules/nService/src/service/module/defaultRuntimeRegistryResolverService");
const contribution = require("../config/properties");
function fixture(t) {
  const server = fs.mkdtempSync(path.join(os.tmpdir(), "ewaste-inactive-integration-"));
  const previous = { _: global._, NODICS: global.NODICS };
  global._ = require("lodash");
  global.NODICS = { getActiveModules: () => ["product", "digitalCore"] };
  t.after(() => { Object.assign(global, previous); fs.rmSync(server, { recursive: true, force: true }); });
  const metadata = { nodics: { runtimeModuleRoots: ["nodics.accelerators/modules/waste/modules/eWaste"], runtimeConfigurationContributions: [] } };
  const configuration = { activeModules: { modules: ["product", "digitalCore"] }, runtimeIdentity: { remoteModules: ["profile"] },
    runtimeRole: { code: "UNRELATED", publication: "STAGED" } };
  const select = namespaces => {
    metadata.nodics.runtimeConfigurationContributions = namespaces.map(namespace => ({ moduleName: "eWaste", namespace }));
    fs.writeFileSync(path.join(server, "package.json"), JSON.stringify(metadata));
    return initializer.readInactiveModuleConfiguration(configuration, { roots: { framework: root, server } });
  };
  return { configuration, select };
}
test("explicit eWaste namespace selection supplies only inert integration descriptors, never activation or grants", t => {
  const f = fixture(t), before = structuredClone(f.configuration);
  assert.deepEqual(f.select([]), {});
  for (const namespace of ["product", "digitalCore"]) {
    const selected = f.select([namespace]);
    assert.deepEqual(Object.keys(selected), [namespace]);
    assert.equal(selected[namespace].runtimeRoleProfiles, undefined);
    assert.deepEqual(selected[namespace], contribution[namespace]);
  }
  const selected = f.select(["product", "digitalCore"]);
  const defaults = { product: load("nodics.commerce/modules/baseCommerce/modules/product/config/properties").product,
    digitalCore: load("nodics.commerce/modules/digitalCommerce/modules/digitalCore/config/properties").digitalCore };
  const merged = bindings.merge(bindings.merge(defaults, selected), f.configuration);
  assert.equal(merged.product.marketplaceAuthoring.intentSource.moduleName, "eWaste");
  assert.deepEqual(merged.product.marketplaceAuthoring.intentSource.targetAuthority, { publication: "OPERATIONAL" });
  assert.equal(merged.product.marketplaceAuthoring.enabled, false);
  assert.equal(merged.product.marketplaceAuthoring.intentSource.connectionName, null);
  assert.equal(merged.digitalCore.digitalOwnership.owner.moduleName, "eWaste");
  assert.equal(merged.digitalCore.digitalOwnership.owner.apiPrefix, "/internal/digital-sales");
  assert.equal(merged.digitalCore.digitalOwnership.enabled, false);
  assert.equal(merged.digitalCore.digitalOwnership.qualified, false);
  assert.equal(merged.digitalCore.digitalOwnership.owner.connectionName, null);
  assert.equal(merged.digitalCore.ownershipEvidence.bindingAdmission.apiName, "/internal/digital-listings/plan");
  assert.equal(merged.digitalCore.ownershipEvidence.bindingAdmission.enabled, false);
  assert.equal(merged.digitalCore.ownershipEvidence.bindingAdmission.connectionName, null);
  assert.deepEqual(merged.digitalCore.ownershipEvidence.callers, []);
  assert.deepEqual(merged.activeModules, before.activeModules); assert.deepEqual(merged.runtimeIdentity, before.runtimeIdentity);
  assert.deepEqual(f.configuration, before); assert.deepEqual(NODICS.getActiveModules(), ["product", "digitalCore"]);
  const override = bindings.merge(merged, { product: { marketplaceAuthoring: { intentSource: { connectionName: "reviewed-source" } } },
    digitalCore: { ownershipEvidence: { callers: { $config: "replace", value: [] } } } });
  assert.equal(override.product.marketplaceAuthoring.intentSource.connectionName, "reviewed-source");
  assert.deepEqual(override.digitalCore.ownershipEvidence.callers, []);
  assert.equal(override.digitalCore.digitalOwnership.enabled, false);
  assert.equal(contribution.product.marketplaceAuthoring.intentSource.connectionName, undefined);
});
test("operational eWaste resolution is independent of display code and cannot select staged/online or foreign exact server", t => {
  const f = fixture(t), selected = f.select(["product"]);
  const options = { moduleName: "eWaste", targetAuthority: selected.product.marketplaceAuthoring.intentSource.targetAuthority };
  const owner = { moduleName: "eWaste", server: "selected-owner", projectCode: "project", environment: "unit",
    endpoint: "https://source.invalid/nodics/eWaste", state: "UP", clientCallable: true, runtimeRole: { code: "ARBITRARY", publication: "OPERATIONAL" } };
  const staged = { ...owner, server: "staged", runtimeRole: { publication: "STAGED" } };
  const online = { ...owner, server: "online", runtimeRole: { publication: "ONLINE" } };
  assert.equal(resolver.resolveFromOwners(options, [staged, online, owner]).server, "selected-owner");
  assert.equal(resolver.resolveFromOwners(options, [staged, online]), undefined);
  assert.equal(resolver.resolveFromOwners({ ...options, targetAuthority: { publication: "OPERATIONAL", server: "foreign" } }, [owner]), undefined);
  assert.throws(() => resolver.resolveFromOwners(options, [owner, { ...owner, server: "duplicate-owner" }]), /Ambiguous/);
});
