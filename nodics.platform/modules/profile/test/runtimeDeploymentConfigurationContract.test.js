/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module profile/test/runtimeDeploymentConfigurationContract @description Verifies explicit deployment selection and remote-only ceilings without provider access, credentials or persistence. @owner profile @layer test */
const assert = require("node:assert/strict");
const { test, beforeEach, afterEach } = require("node:test");
const bootstrap = require("../src/service/identity/defaultMandatoryIdentityBootstrapService");
const provisioning = require("../src/service/enterprise/defaultEnterpriseTenantProvisioningService");
const authDefaults = require("../../../../nodics.foundation/modules/nAuth/config/properties");
const profileDefaults = require("../config/properties");
let previous, runtimeKey;

beforeEach(() => {
  previous = Object.fromEntries(["CONFIG", "SERVICE", "NODICS", "CLASSES"].map(key => [key, global[key]]));
  runtimeKey = process.env.NODICS_RUNTIME_API_KEY;
  delete process.env.NODICS_RUNTIME_API_KEY;
});
afterEach(() => {
  for (const [key, value] of Object.entries(previous)) {
    if (value === undefined) delete global[key];
    else global[key] = value;
  }
  if (runtimeKey === undefined) delete process.env.NODICS_RUNTIME_API_KEY;
  else process.env.NODICS_RUNTIME_API_KEY = runtimeKey;
});

function fixture() {
  const state = {
    selected: true,
    environmentClass: "LOCAL",
    apiKey: "fictional-proof-for-memory-fixture-only-32-characters",
    resolved: {
      modules: ["profile"],
      properties: {
        identityGovernance: { migration: { runtimeDeploymentBootstrapEnabled: true } },
        runtimeIdentity: { instanceCode: "worker-1", remoteModules: ["commsApi"] },
        profileTenantProvisioning: { runtimeRemoteModuleExtensions: ["commsApi"] },
      },
    },
  };
  global.CONFIG = { get: key => ({
    identityGovernance: { migration: { runtimeDeploymentBootstrapEnabled: state.selected } },
    environment: { class: state.environmentClass },
    defaultAuthDetail: { apiKey: state.apiKey },
    bootstrapIdentity: { adminPassword: "fictional-password-never-installed" },
  })[key] };
  global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
  global.NODICS = { getEnvironmentName: () => "fixture.project", getSelectedEnvironmentName: () => "reviewA" };
  global.SERVICE = { DefaultMandatoryIdentityBootstrapService: {
    ...bootstrap,
    getProjectRoot: () => "/fictional/project",
    readResolvedRuntimeDeployment: coordinates => {
      assert.deepEqual(coordinates, { projectRoot: "/fictional/project", environmentCode: "reviewA", serverCode: "workerServer" });
      return state.resolved;
    },
  } };
  return {
    state,
    scope: { projectCode: "fixture.project", environmentCode: "reviewA", serverCode: "workerServer",
      instanceCode: "worker-1", modules: ["profile", "commsApi"] },
    originalModules: Object.freeze(["profile"]),
  };
}

test("framework deployment selectors are generic, default-off and carry no retired-key fallback", () => {
  assert.equal(authDefaults.identityGovernance.migration.runtimeDeploymentBootstrapEnabled, false);
  assert.equal(Object.hasOwn(authDefaults.identityGovernance.migration, "localRuntimeDeploymentGrantPermissions"), false);
  assert.deepEqual(profileDefaults.profileTenantProvisioning.runtimeRemoteModuleExtensions, []);
  assert.equal(Object.hasOwn(profileDefaults.profileTenantProvisioning, "localRuntimeRemoteModuleExtensions"), false);
});

for (const selection of [undefined, false, "true", 1, null]) {
  test("deployment bootstrap refuses a non-Boolean-true selection: " + String(selection), () => {
    const f = fixture(); f.state.selected = selection;
    assert.equal(bootstrap.isRuntimeDeploymentBootstrapEnabled(), false);
  });
}

test("explicit generic selection still requires an existing private proof", () => {
  const f = fixture();
  for (const key of [undefined, "", "short", 42]) {
    f.state.apiKey = key;
    assert.equal(bootstrap.isRuntimeDeploymentBootstrapEnabled(), false);
  }
});

test("generic grant formatter preserves existing persisted runtime identities", () => {
  assert.equal(bootstrap.runtimeDeploymentGrantCode("kickoffLocal", "commerceStagedServer"), "kickoff-local-commerce-staged-runtime-deployment");
  assert.equal(bootstrap.runtimeDeploymentGrantCode("reviewA", "workerServer"), "review-a-worker-runtime-deployment");
});

test("explicit remote-only deployment adoption preserves the original module ceiling", () => {
  const f = fixture(), before = JSON.stringify(f.originalModules);
  provisioning.assertRuntimeRemoteModuleExtensions(f.scope, f.originalModules);
  assert.equal(JSON.stringify(f.originalModules), before);
  assert.deepEqual(f.scope.modules, ["profile", "commsApi"]);
});

for (const [name, change] of [
  ["current selection disabled", f => { f.state.selected = false; }],
  ["target selection disabled", f => { f.state.resolved.properties.identityGovernance.migration.runtimeDeploymentBootstrapEnabled = false; }],
  ["target selection missing", f => { delete f.state.resolved.properties.identityGovernance; }],
  ["target selection malformed", f => { f.state.resolved.properties.identityGovernance.migration.runtimeDeploymentBootstrapEnabled = "true"; }],
  ["retired allowlist only", f => { f.state.resolved.properties.profileTenantProvisioning = { localRuntimeRemoteModuleExtensions: ["commsApi"] }; }],
  ["adoption absent", f => { f.state.resolved.properties.profileTenantProvisioning.runtimeRemoteModuleExtensions = []; }],
  ["duplicate adoption", f => { f.state.resolved.properties.profileTenantProvisioning.runtimeRemoteModuleExtensions = ["commsApi", "commsApi"]; }],
  ["sparse adoption", f => { f.state.resolved.properties.profileTenantProvisioning.runtimeRemoteModuleExtensions = new Array(1); }],
  ["oversized adoption", f => { f.state.resolved.properties.profileTenantProvisioning.runtimeRemoteModuleExtensions = Array.from({ length: 513 }, (_, i) => "module" + i); }],
  ["remote declaration absent", f => { f.state.resolved.properties.runtimeIdentity.remoteModules = []; }],
  ["duplicate remote declaration", f => { f.state.resolved.properties.runtimeIdentity.remoteModules = ["commsApi", "commsApi"]; }],
  ["sparse remote declaration", f => { f.state.resolved.properties.runtimeIdentity.remoteModules = new Array(1); }],
  ["sparse active module declaration", f => { f.state.resolved.modules = new Array(1); }],
  ["active module growth", f => { f.state.resolved.modules.push("commsApi"); }],
  ["different replica", f => { f.state.resolved.properties.runtimeIdentity.instanceCode = "worker-2"; }],
  ["different project", f => { f.scope.projectCode = "foreign.project"; }],
  ["different environment", f => { f.scope.environmentCode = "foreignA"; }],
  ["duplicate requested module", f => { f.scope.modules.push("commsApi"); }],
  ["sparse original module ceiling", f => { f.originalModules = new Array(1); }],
  ["sparse requested module", f => { f.scope.modules = new Array(1); }],
  ["unapproved requested module", f => { f.scope.modules.push("anotherModule"); }],
]) {
  test("remote-only deployment adoption refuses " + name + " without changing original evidence", () => {
    const f = fixture(); change(f); const original = JSON.stringify(f.originalModules);
    assert.throws(() => provisioning.assertRuntimeRemoteModuleExtensions(f.scope, f.originalModules), { code: "ERR_PROFILE_TENANT_PROVISIONING_HELD" });
    assert.equal(JSON.stringify(f.originalModules), original);
  });
}
