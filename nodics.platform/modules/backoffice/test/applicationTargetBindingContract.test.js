/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module backoffice/test/applicationTargetBindingContract
 * @description Verifies deployment-declared aliases against exact runtime lease authority.
 * @layer test
 * @owner backoffice
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { test, beforeEach, afterEach } = require("node:test");
const owner = require("../src/service/defaultBackofficeApplicationInitializationService");
const resolver = require("../../../../nodics.foundation/modules/nService/src/service/module/defaultRuntimeRegistryResolverService");
const router = require("../../../../nodics.foundation/modules/nRouter/src/service/router/defaultRouterService");
let root;
let previous;
function server(code, aliases = [], retired = false) {
  const directory = path.join(root, code);
  fs.mkdirSync(path.join(directory, "config"), { recursive: true });
  fs.writeFileSync(
    path.join(directory, "package.json"),
    JSON.stringify({
      nodics: {
        kind: "server",
        runtimeModule: true,
        runtimeAliases: aliases,
        retired,
      },
    }),
  );
  fs.writeFileSync(
    path.join(directory, "config/properties.js"),
    "module.exports = {activeModules:{modules:[]}};",
  );
}
beforeEach(() => {
  previous = Object.fromEntries(
    ["NODICS", "SERVICE", "CLASSES"].map((key) => [key, global[key]]),
  );
  root = fs.mkdtempSync(path.join(os.tmpdir(), "bo-target-binding-"));
  server("wcmsStagedServer", ["authoring"]);
  global.NODICS = {
    getServerRootPath: () => root,
    getRawModule: () => ({ metaData: { prefix: "import" } }),
  };
  const urls = {
    wcmsStaged: "https://staged.example.test",
    wcmsStagedServer: "https://staged.example.test",
    authoring: "https://staged.example.test",
  };
  const realRouter = Object.assign(Object.create(router), {
    LOG: { error() {} },
    getModuleServerConfig: (name) => ({
      getOptions: () => ({ contextRoot: "nodics" }),
      getAbstractEndpoint: () => urls[name],
    }),
    getURL: (endpoint) => {
      if (!endpoint) throw new Error("Missing endpoint");
      return endpoint;
    },
  });
  global.SERVICE = { DefaultRouterService: realRouter };
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code, message) {
        super(message);
        this.code = code;
      }
    },
  };
});
afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
  for (const [key, value] of Object.entries(previous)) {
    if (value === undefined) delete global[key];
    else global[key] = value;
  }
});
const bind = (name) =>
  owner.applicationTargetBinding(name, "WCMS_STAGED", "import");
const lease = {
  moduleName: "import",
  server: "wcmsStagedServer",
  endpoint: "https://staged.example.test/nodics/import",
  state: "UP",
  runtimeRole: { code: "WCMS_STAGED", publication: "STAGED" },
};
test("canonical binding qualifies both exact live leases and connection-bearing snapshots", () => {
  const wrong = {
    moduleName: "import",
    connectionName: "wcmsStaged",
    targetAuthority: {
      server: "wcmsStaged",
      runtimeRole: { code: "WCMS_STAGED" },
    },
  };
  assert.equal(resolver.ownerMatches(wrong, lease), false);
  const options = { moduleName: "import", ...bind("wcmsStaged") };
  assert.equal(options.connectionName, "wcmsStagedServer");
  assert.equal(resolver.ownerMatches(options, lease), true);
  assert.equal(
    resolver.ownerMatches(options, {
      ...lease,
      connectionName: "wcmsStagedServer",
    }),
    true,
  );
  assert.equal(
    resolver.ownerMatches(options, {
      ...lease,
      runtimeRole: { code: "WCMS_ONLINE", publication: "ONLINE" },
    }),
    false,
  );
});
test("explicit metadata aliases use the same declared owner, not guessed suffix authority", () => {
  assert.deepEqual(bind("authoring"), bind("wcmsStagedServer"));
  assert.throws(() => bind("missingStaged"), /one declared deployment server/);
});

test("runtime dependency uses actual canonical alias binding independently of another runtime's held batch", () => {
  const profile = {
    target: { moduleName: "cms", connectionName: "wcmsStaged", runtimeRole: "WCMS_STAGED" },
  };
  const dependency = owner.capabilityDependencies(profile, {
    readiness: "BLOCKED",
    preparation: { steps: [
      { type: "DATA_RELEASE", targetServer: "platformServer", targetRuntimeRole: "PLATFORM", status: "VALIDATION_BLOCKED" },
      { type: "DATA_RELEASE", targetServer: "wcmsStaged", targetRuntimeRole: "WCMS_STAGED", status: "NOT_INSTALLED" },
    ] },
  })[0];
  assert.equal(dependency.server, "wcmsStagedServer");
  assert.equal(dependency.status, "AVAILABLE");
  assert.equal(owner.capabilityDependencies(profile, {
    readiness: "READY", preparation: { steps: [] },
  })[0].status, "UNKNOWN");
});
test("ambiguous declared aliases fail closed", () => {
  server("otherServer", ["authoring"]);
  assert.throws(() => bind("authoring"), /one declared deployment server/);
});
test("retired deployments cannot introduce alias authority", () => {
  server("oldServer", ["authoring"], true);
  assert.equal(bind("authoring").targetAuthority.server, "wcmsStagedServer");
});
test("different configured alias endpoints cannot be silently canonicalized", () => {
  global.SERVICE.DefaultRouterService = {
    prepareUrl: (options) =>
      options.connectionName === "authoring"
        ? "https://other.example.test"
        : lease.endpoint,
  };
  assert.throws(() => bind("authoring"), /differs/);
});
test("two failed router URL resolutions are not equivalent endpoint evidence", () => {
  global.SERVICE.DefaultRouterService = { prepareUrl: () => "" };
  assert.throws(() => bind("authoring"), /differs/);
});
