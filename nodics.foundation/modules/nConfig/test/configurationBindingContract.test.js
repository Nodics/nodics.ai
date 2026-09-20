/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module config/test/configurationBindingContract @description Exercises declarative bindings through real nConfig contribution loading, layering, selection and rejection paths. @layer test @owner config */
const assert = require("node:assert/strict");
const test = require("node:test");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const resolver = require("../src/service/defaultConfigurationBindingService");
const initializer = require("../src/service/DefaultFrameworkInitializerService");
const composition = {
  environmentVariable: "DOMAIN_SELECTION",
  domains: [
    {
      code: "warehouse",
      frameworkGroup: "warehouse",
      projectPack: "customer.warehouse",
      productSearchContributor: { required: true },
    },
    {
      code: "shipping",
      frameworkGroup: "shipping",
      projectPack: "customer.shipping",
    },
  ],
  sharedModules: [{ module: "sharedOperations", minSelectedDomains: 2 }],
};
test("the existing nConfig load sequence resolves references and preserves later overrides without shared mutations", (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "configuration-binding-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const envRoot = path.join(root, "envs/qa"),
    serverRoot = path.join(envRoot, "jobsServer");
  const write = (file, data) => {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, "module.exports = " + JSON.stringify(data) + ";");
  };
  write(path.join(root, "config/properties.js"), {
    connectionValues: { local: { host: "127.0.0.1", port: 4500 } },
  });
  write(path.join(envRoot, "config/properties.js"), {
    log: { level: "warn" },
    frontends: [{ code: "store", port: 4321, command: "not projected" }],
    activeModules: { compositions: { business: composition } },
  });
  write(path.join(serverRoot, "config/properties.js"), {
    browserEndpoints: {
      $config: "ref",
      path: "frontends",
      fields: ["code", "port"],
    },
    connection: { $config: "ref", path: ["connectionValues", "local"] },
    sourceRoot: { $config: "path", base: "project", relative: "docs/customer" },
    project: { $config: "context", name: "projectCode" },
    activeModules: {
      modules: [
        "jobs",
        {
          $config: "composition",
          name: "business",
          field: "projectPacks",
          spread: true,
        },
      ],
    },
  });
  const node = path.join(serverRoot, "worker1");
  write(path.join(node, "config/properties.js"), {
    connection: { port: 4600 },
    log: { level: "debug" },
  });
  global.NODICS = {
    getEnvironmentPath: () => root,
    getServerRootPath: () => envRoot,
    getServerPath: () => serverRoot,
    getNodePath: () => node,
    getNodicsHome: () => path.join(root, "framework/nodics.foundation"),
    getEnvironmentName: () => "customer.application",
    getSelectedEnvironmentName: () => "qa",
    getServerName: () => "jobsServer",
    getNodeName: () => "worker1",
  };
  const actual = initializer.loadServerProperties();
  assert.deepEqual(actual.connection, { host: "127.0.0.1", port: 4600 });
  assert.equal(actual.connectionValues.local.port, 4500);
  assert.equal(actual.project, "customer.application");
  assert.equal(actual.sourceRoot, path.join(root, "docs/customer"));
  assert.deepEqual(actual.activeModules.modules, [
    "jobs",
    "customer.warehouse",
    "customer.shipping",
  ]);
  assert.equal(actual.log.level, "debug");
  let loaded = {};
  global.CONFIG = {
    getProperties: () => loaded,
    setProperties: (values) => {
      loaded = values;
    },
  };
  const instance = { ...initializer, LOG: { debug() {} } };
  for (const file of [
    path.join(root, "config/properties.js"),
    path.join(envRoot, "config/properties.js"),
    path.join(serverRoot, "config/properties.js"),
    path.join(node, "config/properties.js"),
  ])
    instance.loadConfiguration(file);
  assert.deepEqual(loaded.connection, actual.connection);
  assert.deepEqual(loaded.browserEndpoints, [{ code: "store", port: 4321 }]);
  const environmentFile = path.join(envRoot, "config/properties.js");
  const changed = require(environmentFile);
  changed.frontends[0].port = 4422;
  write(environmentFile, changed);
  delete require.cache[require.resolve(environmentFile)];
  instance.loadConfiguration(environmentFile);
  assert.deepEqual(loaded.browserEndpoints, [{ code: "store", port: 4321 }]);
  const next = instance.readPropertyContribution(path.join(serverRoot, "config/properties.js"), loaded);
  assert.deepEqual(next.browserEndpoints, [{ code: "store", port: 4422 }]);
  assert.equal(fs.existsSync(path.join(envRoot, "nodics.environment.json")), false);

});
test("environment values, explicit empty selections and conditional contributions remain declarative", () => {
  const definition = {
    activeModules: { compositions: { business: composition } },
    secret: { $config: "env", name: "SERVICE_SECRET" },
    port: { $config: "env", name: "PORT", type: "number", fallback: 4500 },
    enabled: {
      $config: "all",
      values: [
        { $config: "env", name: "ENABLED", type: "boolean", fallback: true },
        true,
      ],
    },
    modules: [
      {
        $config: "selected",
        name: "business",
        field: "domains",
        includes: "warehouse",
        value: "warehouseModule",
      },
    ],
    contributors: {
      optional: {
        $config: "selected",
        name: "business",
        field: "domains",
        includes: "shipping",
        value: { required: true },
      },
    },
  };
  const context = {
    environmentVariables: {
      DOMAIN_SELECTION: "warehouse",
      ENABLED: "false",
      PORT: "4501",
      SERVICE_SECRET: "test-secret",
    },
  };
  const actual = resolver.resolve(definition, {}, context);
  assert.equal(actual.secret, "test-secret");
  assert.equal(actual.port, 4501);
  assert.equal(actual.enabled, false);
  assert.deepEqual(actual.modules, ["warehouseModule"]);
  assert.deepEqual(actual.contributors, {});
  assert.deepEqual(
    resolver.resolveDomainComposition(
      { ...composition, emptySelections: ["none", "foundation"] },
      "foundation",
    ).domains,
    [],
  );
  assert.throws(
    () => resolver.resolveDomainComposition(composition, "commerce"),
    /Unsupported/,
  );
  assert.throws(
    () =>
      resolver.resolve(
        definition,
        {},
        { ...context, environmentVariables: { ENABLED: "maybe" } },
      ),
    /boolean/,
  );
  assert.throws(
    () =>
      resolver.resolve(
        definition,
        {},
        { ...context, environmentVariables: { PORT: "Infinity" } },
      ),
    /finite/,
  );
  assert.equal(
    definition.enabled.$config,
    "all",
    "resolution never changes authoring objects",
  );
});
test("cycles, unavailable contexts, malformed bindings and unsafe reference paths fail before use", () => {
  assert.throws(
    () =>
      resolver.resolve({
        first: { $config: "ref", path: "second" },
        second: { $config: "ref", path: "first" },
      }),
    /cycle/,
  );
  assert.throws(
    () =>
      resolver.resolve({
        value: { $config: "ref", path: ["__proto__", "polluted"] },
      }),
    /Invalid.*path/,
  );
  assert.throws(
    () => resolver.resolve({ value: { $config: "ref", path: "missing" } }),
    /unavailable/,
  );
  assert.throws(
    () =>
      resolver.resolve({ value: { $config: "script", path: "/tmp/run.js" } }),
    /Invalid.*declaration/,
  );
  assert.throws(
    () => resolver.resolve({ value: { $config: "context", name: "process" } }),
    /Unknown/,
  );
  assert.throws(
    () =>
      resolver.resolve({
        value: { $config: "env", name: "SECRET", expression: "eval()" },
      }),
    /Invalid/,
  );
  assert.throws(
    () =>
      resolver.resolve({ value: { $config: "composition", name: "missing" } }),
    /unavailable/,
  );
  assert.throws(
    () =>
      resolver.resolve([
        { $config: "env", name: "PORT", fallback: 2, spread: true },
      ]),
    /requires an array/,
  );
  assert.throws(
    () =>
      resolver.resolve({
        value: { $config: "env", name: "PORT", spread: true },
      }),
    /only permitted/,
  );
});

test("explicit collection replacement and keyed changes preserve identity, nested scope and independent later layers", () => {
  const defaults = {
    sources: [
      { code: "first", paths: ["guide.md", "**/README.md"], enabled: false },
      { code: "second", paths: ["contracts.md"], enabled: false },
    ],
    legacy: ["a", "b"],
  };
  const apply = (base, change) =>
    resolver.merge(base, resolver.resolve(change, base));
  const customer = apply(defaults, {
    sources: {
      $config: "keyed",
      key: "code",
      remove: ["second"],
      entries: [
        { code: "third", paths: ["custom.md"], enabled: true },
        { code: "first", paths: { $config: "replace", value: ["guide.md"] } },
      ],
    },
    legacy: ["c"],
  });
  assert.deepEqual(
    customer.sources.map((item) => item.code),
    ["first", "third"],
  );
  assert.deepEqual(customer.sources[0], {
    code: "first",
    paths: ["guide.md"],
    enabled: false,
  });
  assert.deepEqual(
    customer.legacy,
    ["c", "b"],
    "ordinary arrays preserve compatibility",
  );
  const server = apply(customer, {
    sources: {
      $config: "replace",
      value: [customer.sources[1], customer.sources[0]],
    },
  });
  assert.deepEqual(
    server.sources.map((item) => item.code),
    ["third", "first"],
  );
  assert.deepEqual(
    apply(server, { sources: { $config: "replace", value: [] } }).sources,
    [],
  );
  const node = apply(server, {
    sources: {
      $config: "keyed",
      key: "code",
      entries: [{ code: "third", enabled: false }],
    },
  });
  assert.equal(node.sources[0].enabled, false);
  assert.equal(server.sources[0].enabled, true);
  assert.equal(defaults.sources.length, 2);
  assert.deepEqual(defaults.sources[0].paths, ["guide.md", "**/README.md"]);
  assert.deepEqual(
    apply(defaults, {
      sources: { $config: "keyed", key: "code", remove: ["absent"] },
    }),
    defaults,
  );
  const reference = apply(defaults, {
    sources: { $config: "replace", value: [] },
    copy: { $config: "ref", path: "sources" },
  });
  assert.deepEqual(reference.copy, []);
  const keyedReference = apply(defaults, {
    sources: {
      $config: "keyed",
      key: "code",
      entries: [{ code: "first", enabled: true }],
    },
    copy: { $config: "ref", path: "sources" },
  });
  assert.deepEqual(keyedReference.copy, keyedReference.sources);
  assert.deepEqual(
    keyedReference.copy.map((item) => item.code),
    ["first", "second"],
  );
});

test("collection declarations reject ambiguity before changing effective configuration", () => {
  const inherited = { entries: [{ code: "one", enabled: false }] };
  const apply = (change) =>
    resolver.merge(inherited, resolver.resolve({ entries: change }, inherited));
  for (const declaration of [
    { $config: "replace", value: "not a collection" },
    { $config: "keyed", key: "__proto__" },
    {
      $config: "keyed",
      key: "code",
      entries: [{ code: "one" }, { code: "one" }],
    },
    {
      $config: "keyed",
      key: "code",
      entries: [{ code: "one" }],
      remove: ["one"],
    },
    { $config: "keyed", key: "code", entries: [{ label: "missing identity" }] },
    { $config: "keyed", key: "code", remove: ["one", "one"] },
  ])
    assert.throws(() => apply(declaration), /[Cc]onfiguration/);
  assert.throws(
    () =>
      resolver.merge(
        { entries: [{ code: "one" }, { code: "one" }] },
        resolver.resolve({ entries: { $config: "keyed", key: "code" } }),
      ),
    /identities/,
  );
  assert.deepEqual(inherited, { entries: [{ code: "one", enabled: false }] });
});

test("normal, external and tenant configuration use the same explicit collection merge", (t) => {
  const root = fs.mkdtempSync(
    path.join(os.tmpdir(), "configuration-collection-"),
  );
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const Config = require("../bin/config");
  const config = new Config();
  global.CONFIG = config;
  global.NODICS = {
    getNodicsHome: () => root,
    getActiveTenants: () => ["alpha", "beta"],
  };
  config.setProperties({ methods: ["standard", "pickup"] });
  const file = path.join(root, "properties.js");
  fs.writeFileSync(
    file,
    "module.exports = " +
      JSON.stringify({ methods: { $config: "replace", value: ["courier"] } }) +
      ";",
  );
  const instance = { ...initializer, LOG: { debug() {} } };
  instance.loadConfiguration(file);
  assert.deepEqual(config.get("methods"), ["courier"]);
  config.setProperties({ methods: ["standard", "pickup"] }, "alpha");
  config.setProperties({ methods: ["standard", "pickup"] }, "beta");
  instance.loadExternalProperties([file], "alpha");
  assert.deepEqual(config.get("methods", "alpha"), ["courier"]);
  assert.deepEqual(config.get("methods", "beta"), ["standard", "pickup"]);
  config.changeTenantProperties(
    { methods: { $config: "replace", value: [] } },
    "alpha",
  );
  assert.deepEqual(config.get("methods", "alpha"), []);
  assert.deepEqual(config.get("methods", "beta"), ["standard", "pickup"]);
  config.setProperties({ methods: [{ code: "one" }] }, "alpha");
  config.setProperties({ methods: "invalid collection" }, "beta");
  assert.throws(
    () =>
      config.changeTenantProperties({
        methods: { $config: "keyed", key: "code", entries: [{ code: "two" }] },
      }),
    /inherited array/,
  );
  assert.deepEqual(
    config.get("methods", "alpha"),
    [{ code: "one" }],
    "validation precedes all tenant updates",
  );
});

test("property projections are independent, bounded and reject missing or unsafe selections", () => {
  const profile = {
    urls: { editor: "https://editor.example", shop: "https://shop.example" },
    frontends: [{ code: "editor", port: 4300, command: "ignored" }],
  };
  const context = {};
  const read = (binding) =>
    resolver.resolve({ value: { $config: "ref", ...binding } }, profile, context)
      .value;
  assert.deepEqual(read({ path: "urls", fields: ["editor"] }), {
    editor: "https://editor.example",
  });
  const ports = read({ path: "frontends", fields: ["code", "port"] });
  ports[0].port = 4500;
  assert.equal(profile.frontends[0].port, 4300);
  assert.throws(() => read({ path: "missing" }), /unavailable/);
  assert.throws(
    () => read({ path: "urls", fields: ["absent"] }),
    /unavailable/,
  );
  assert.throws(
    () => read({ path: "frontends", fields: ["absent"] }),
    /unavailable/,
  );
  assert.throws(
    () => read({ path: "urls", fields: ["editor", "editor"] }),
    /distinct/,
  );
  assert.throws(
    () => read({ path: "urls", fields: ["__proto__"] }),
    /reference/,
  );
  assert.throws(() => read({ path: "constructor.prototype" }), /reference/);
  assert.throws(
    () => read({ path: "urls", expression: "anything" }),
    /declaration/,
  );
  assert.throws(
    () => resolver.resolve({ value: { $config: "ref", path: "urls" } }),
    /unavailable/,
  );
  assert.throws(() => resolver.resolve({ value: { $config: "profile", path: "urls" } }), /declaration/);
  profile.unsafe = JSON.parse('{"__proto__":{"polluted":true}}');
  assert.throws(() => read({ path: "unsafe" }), /Unsafe configuration property key/);
  profile.deep = {};
  let cursor = profile.deep;
  for (let i = 0; i < 70; i++) {
    cursor.next = {};
    cursor = cursor.next;
  }
  assert.throws(() => read({ path: "deep" }), /bounded/);
});
