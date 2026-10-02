/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module nConfig/test/inactiveRuntimeRoleConfiguration @description Verifies explicit inactive-owner projection, role isolation, precedence and bounded discovery. @owner nConfig @layer test */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const initializer = require("../src/service/DefaultFrameworkInitializerService");
const bindings = require("../src/service/defaultConfigurationBindingService");

/** Creates an isolated declared-root owner and deployment fixture; cleanup restores runtime globals. */
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "nodics-inactive-role-"));
  const owner = path.join(root, "framework/domain/modules/presentation");
  const server = path.join(root, "project/envs/local/online");
  fs.mkdirSync(path.join(owner, "config"), { recursive: true });
  fs.mkdirSync(server, { recursive: true });
  fs.writeFileSync(path.join(owner, "package.json"), JSON.stringify({ name: "presentation", index: "1.1",
    nodics: { kind: "capability", runtimeModule: true } }));
  const source = {
    cms: {
      publication: { baselines: { shell: { rootCode: "projectSite", employeeCompositionPaths: ["/home", "/lock"] } } },
      runtimeRoleProfiles: {
        WCMS_ONLINE: { publication: { baselines: { shell: { $config: "ref", path: ["cms", "publication", "baselines", "shell"] } } } },
        WCMS_STAGED: { publication: { forbiddenStaged: true } },
      },
    },
    activeModules: { modules: ["presentation"] },
    runtimeIdentity: { remoteModules: ["must-not-leak"] },
    unrelated: { enabled: true },
  };
  fs.writeFileSync(path.join(owner, "config/properties.js"), "module.exports = " + JSON.stringify(source));
  const selector = { moduleName: "presentation", namespace: "cms", runtimeRole: "WCMS_ONLINE" };
  const metadata = { nodics: { runtimeModuleRoots: ["domain"], runtimeConfigurationContributions: [selector] } };
  const saveMetadata = () => fs.writeFileSync(path.join(server, "package.json"), JSON.stringify(metadata));
  saveMetadata();
  const old = global.NODICS;
  global.NODICS = { getRawModule: name => name === "presentation" ? { name, path: owner } : undefined,
    getActiveModules: () => ["cms"] };
  t.after(() => { global.NODICS = old; fs.rmSync(root, { recursive: true, force: true }); });
  const context = { roots: { framework: path.join(root, "framework"), project: path.join(root, "project"), server } };
  const properties = { runtimeRole: { code: "WCMS_ONLINE" }, activeModules: { modules: ["cms"] },
    runtimeIdentity: { remoteModules: ["profile"] }, cms: { publication: { enabled: true } } };
  const resolve = input => bindings.merge(initializer.readInactiveRuntimeRoleConfiguration(input || properties, context), input || properties);
  return { root, owner, metadata, saveMetadata, selector, source, properties, context, resolve };
}

test("selected inactive owner contributes only its selected namespace and role without mutation or grants", t => {
  const f = fixture(t);
  const before = structuredClone(f.properties);
  const result = f.resolve();
  assert.equal(result.cms.publication.baselines.shell.rootCode, "projectSite");
  assert.equal(result.cms.publication.forbiddenStaged, undefined);
  assert.equal(result.cms.runtimeRoleProfiles, undefined);
  assert.equal(result.unrelated, undefined);
  assert.deepEqual(result.activeModules, before.activeModules);
  assert.deepEqual(result.runtimeIdentity, before.runtimeIdentity);
  assert.deepEqual(f.properties, before);
  assert.deepEqual(NODICS.getActiveModules(), ["cms"]);
  result.cms.publication.baselines.shell.employeeCompositionPaths.push("/changed");
  assert.deepEqual(f.resolve().cms.publication.baselines.shell.employeeCompositionPaths, ["/home", "/lock"]);
});

test("absent selector and other runtime role do not leak owner configuration", t => {
  const f = fixture(t);
  assert.equal(f.resolve({ ...f.properties, runtimeRole: { code: "WCMS_STAGED" } }).cms.publication.baselines, undefined);
  delete f.metadata.nodics.runtimeConfigurationContributions;
  f.saveMetadata();
  assert.deepEqual(f.resolve(), f.properties);
});

test("ordinary loading never resolves server properties or binding context without selectors", t => {
  const f = fixture(t);
  const loaded = [];
  const loader = Object.assign({}, initializer, {
    loadServerProperties: () => assert.fail("unselected runtime must not resolve server properties"),
    getPropertyBindingContext: () => assert.fail("unselected runtime must not resolve binding context"),
    loadModuleConfiguration: (name, file) => loaded.push({ name, file }),
  });
  global.NODICS = { getServerPath: () => f.context.roots.server,
    getIndexedModules: () => new Map([["1", { name: "ordinary" }]]) };
  for (const selectors of [undefined, []]) {
    f.metadata.nodics.runtimeConfigurationContributions = selectors;
    f.saveMetadata();
    loader.loadConfigurations();
  }
  assert.deepEqual(loaded, Array(2).fill({ name: "ordinary", file: "/config/properties.js" }));
});

test("later authored values and explicit empty collections override selected defaults", t => {
  const f = fixture(t);
  const ordinary = structuredClone(f.properties);
  ordinary.cms.publication.baselines = { shell: { employeeCompositionPaths: [] } };
  assert.deepEqual(f.resolve(ordinary).cms.publication.baselines.shell.employeeCompositionPaths, ["/home", "/lock"],
    "a bare empty array retains canonical positional inheritance; disabling requires explicit replacement");
  for (const paths of [[], ["/custom"]]) {
    const input = structuredClone(f.properties);
    input.cms.publication.baselines = { shell: { employeeCompositionPaths: { $config: "replace", value: paths } } };
    const result = f.resolve(input);
    assert.deepEqual(result.cms.publication.baselines.shell.employeeCompositionPaths, paths);
    assert.equal(result.cms.publication.baselines.shell.rootCode, "projectSite");
  }
});

for (const [name, change] of [
  ["file path", f => { f.selector.file = "/tmp/injected.js"; }],
  ["traversal", f => { f.selector.moduleName = "../presentation"; }],
  ["URL", f => { f.selector.moduleName = "https://example.test/policy.js"; }],
  ["wrong value type", f => { f.selector.moduleName = ["presentation"]; }],
  ["activation namespace", f => { f.selector.namespace = "activeModules"; }],
  ["identity namespace", f => { f.selector.namespace = "runtimeIdentity"; }],
  ["unknown owner", f => { f.selector.moduleName = "missing"; }],
  ["missing selected profile", f => { f.selector.runtimeRole = f.properties.runtimeRole.code = "MISSING"; }],
  ["duplicate namespace role", f => { f.metadata.nodics.runtimeConfigurationContributions.push({ ...f.selector }); }],
  ["unbounded selectors", f => { f.metadata.nodics.runtimeConfigurationContributions = Array(33).fill(f.selector); }],
  ["undeclared root", f => { f.metadata.nodics.runtimeModuleRoots = []; }],
]) test(`rejects ${name}`, t => {
  const f = fixture(t); change(f); f.saveMetadata();
  assert.throws(() => f.resolve(), /runtime configuration|Runtime configuration|Ambiguous runtime/);
});

test("unselected roles do not resolve unavailable owners or execute their configuration", t => {
  const f = fixture(t);
  f.metadata.nodics.runtimeConfigurationContributions.push({ moduleName: "unavailable", namespace: "cms", runtimeRole: "WCMS_STAGED" });
  f.saveMetadata();
  assert.equal(f.resolve().cms.publication.baselines.shell.rootCode, "projectSite");
});

test("offline discovery does not depend on or mutate the current global module map", t => {
  const f = fixture(t);
  global.NODICS = undefined;
  assert.equal(f.resolve().cms.publication.baselines.shell.rootCode, "projectSite");
  assert.equal(global.NODICS, undefined);
});

test("a discovered owner's properties symlink cannot escape the declared discovery root", t => {
  const f = fixture(t);
  const file = path.join(f.owner, "config/properties.js");
  const external = path.join(f.root, "outside.js");
  fs.writeFileSync(external, "throw new Error('must not execute');");
  fs.unlinkSync(file);
  fs.symlinkSync(external, file);
  assert.throws(() => f.resolve(), /outside declared discovery roots/);
});
