/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module mongodb/test/localResetMaintenanceContract @description Provider-owned physical reset fixtures with injected clients only; no MongoDB connection or mutation. @owner nDatabase @layer test */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const owner = require("../src/service/maintenance/defaultMongodbLocalResetMaintenanceService");
const databaseOwner = require("../../database/src/service/config/defaultDatabaseConfigurationService");
const connectionOwner = require("../src/service/connection/defaultMongodbDatabaseConnectionHandlerService");
const lodash = require("lodash");
const options = () => ({ environment: "acmeLocal", exclusiveDeployment: true, writersExcluded: true,
  configuration: { URI: "mongodb://127.0.0.1:27017", databaseName: "acmeLocalPlatform" } });
const fixture = () => {
  const state = { collections: 2, drops: 0, closes: 0, cursorCloses: 0 };
  const db = { databaseName: "acmeLocalPlatform", command: async () => ({ isWritablePrimary: true }),
    listCollections: () => ({ async *[Symbol.asyncIterator]() { for (let i = 0; i < state.collections; i++) yield { name: "private-name" }; },
      close: async () => { state.cursorCloses++; } }),
    dropDatabase: async () => { state.drops++; state.collections = 0; return true; } };
  const client = { connect: async () => {}, db: () => db, close: async () => { state.closes++; } };
  return { state, db, client };
};
test("native exact scope and both attestations are enforced before SDK construction", () => {
  for (const change of [o => { o.exclusiveDeployment = false; }, o => { o.writersExcluded = false; },
    o => { o.configuration.databaseName = "admin"; }, o => { o.configuration.databaseName = "sharedData"; },
    o => { o.configuration.URI = "mongodb://remote.example:27017"; },
    o => { o.configuration.URI += "/?replicaSet=x&loadBalanced=true"; }, o => { o.configuration.options = { proxyHost: "remote.example" }; }]) {
    const o = options(); change(o); assert.throws(() => owner.validate(o), /RESET_MONGO_SCOPE_INVALID/);
  }
});
test("exact target requires positive inspection then acknowledged physical drop and zero-collection readback", async () => {
  const f = fixture(), held = await owner.bind(options(), f.client, f.db);
  await assert.rejects(held.drop(), /INSPECTION_REQUIRED/);
  assert.equal(f.state.drops, 0);
  assert.deepEqual(await held.inspect(), { collectionCount: 2 });
  assert.deepEqual(await held.drop(), { acknowledged: true });
  assert.deepEqual(await held.verifyEmpty(), { collectionCount: 0 });
  assert.doesNotMatch(JSON.stringify(await held.verifyEmpty()), /private-name/);
  await held.close(); await held.close(); assert.equal(f.state.closes, 1);
  await assert.rejects(held.inspect(), /CLIENT_CLOSED/);
});
test("replica/sharded/read-only topology and mismatched database binding refuse", async () => {
  for (const topology of [{ isWritablePrimary: true, setName: "replica" }, { isWritablePrimary: true, msg: "isdbgrid" },
    { isWritablePrimary: true, readOnly: true }, {}]) {
    const f = fixture(); f.db.command = async () => topology;
    await assert.rejects(owner.bind(options(), f.client, f.db), /NATIVE_TOPOLOGY_REQUIRED/);
    assert.equal(f.state.drops, 0);
  }
  const f = fixture(); f.db.databaseName = "other";
  await assert.rejects(owner.bind(options(), f.client, f.db), /BINDING_INVALID/);
});
test("bound collection inspection refuses overflow with closed cursor and zero effects", async () => {
  const f = fixture(); f.state.collections = 1001;
  const held = await owner.bind(options(), f.client, f.db);
  await assert.rejects(held.inspect(), /INSPECTION_UNCONFIRMED/);
  assert.equal(f.state.drops, 0); assert.equal(f.state.cursorCloses, 1);
});
test("unknown drop outcome and nonempty readback never imply successful reset", async () => {
  const f = fixture(), held = await owner.bind(options(), f.client, f.db);
  await held.inspect(); f.db.dropDatabase = async () => { throw new Error("secret connection detail"); };
  await assert.rejects(held.drop(), /RESET_MONGO_DROP_UNCERTAIN/);
  await assert.rejects(held.verifyEmpty(), /NOT_EMPTY/);
});
test("provider open failure attempts owned connection close without leaking original error", async () => {
  const f = fixture(); f.client.connect = async () => { throw new Error("mongodb://secret@host"); };
  await assert.rejects(({ ...owner, createClient: () => f.client }).open(options()), /RESET_MONGO_OPEN_FAILED/);
  assert.equal(f.state.closes, 1); assert.equal(f.state.drops, 0);
});

/** Builds protected read observations with actual namespace/fingerprint owners and injected read-only native collections. */
async function registeredFixture(t, mutate = () => {}, explicitName) {
  const prior = Object.fromEntries(["_", "CONFIG", "NODICS", "CLASSES", "SERVICE"].map(key => [key, global[key]]));
  t.after(() => {
    for (const [key, value] of Object.entries(prior)) {
      if (value === undefined) delete global[key]; else global[key] = value;
    }
  });
  const input = { ...options(), project: "acme.project", registeredTenants: ["alpha"] };
  const base = { default: { options: { databaseType: "mongodb" }, mongodb: {
    options: { connectionHandler: "DefaultMongodbDatabaseConnectionHandlerService" }, master: input.configuration,
    test: { URI: input.configuration.URI, databaseName: "testLocal" },
  } }, profile: {} };
  let tenant;
  global._ = lodash;
  global.CONFIG = { get: (key, code) => key === "defaultTenant" ? "default" : key === "database" ? code === "alpha" ? tenant : base : undefined };
  global.NODICS = { getModules: () => ({ profile: {} }), getActiveTenants: () => ["default", "alpha"], getEnvironmentName: () => input.project,
    getSelectedEnvironmentName: () => input.environment, getServerName: () => "platformServer" };
  global.CLASSES = { NodicsError: Error };
  global.SERVICE = { DefaultDatabaseConfigurationService: databaseOwner, DefaultMongodbDatabaseConnectionHandlerService: connectionOwner };
  tenant = lodash.merge({}, base, databaseOwner.createTenantNamespaceIntent("alpha").database);
  if (explicitName) tenant.profile = { mongodb: { master: { databaseName: explicitName } } };
  const candidate = databaseOwner.buildTenantNamespaceBinding("alpha");
  const rows = [{ _id: "tenant-native-id", code: "alpha", active: true, revision: 3,
    properties: { database: { ...databaseOwner.createTenantNamespaceIntent("alpha").database,
      tenantNamespaceBindings: { [candidate.scopeKey]: candidate.binding } } } }];
  mutate(rows);
  const state = { reads: 0, cursorCloses: 0, clientCloses: 0, writes: 0 };
  const readOwner = { ...owner, createClient: () => ({ connect: async () => {}, close: async () => { state.clientCloses++; },
    db: () => ({ command: async () => ({ isWritablePrimary: true }), collection: name => ({ find: (query, configuration) => {
      state.reads++;
      assert.equal(configuration.readPreference, "primary");
      assert.ok(configuration.projection["properties.database"] || name === "EnterpriseModel");
      assert.equal(query.code || query.tenant, "alpha");
      return { limit: bound => { assert.ok(bound <= 33); return {
        toArray: async () => name === "TenantModel" ? rows : [{ _id: "enterprise-native-id", code: "alpha-enterprise", tenant: "alpha", active: true }],
        close: async () => { state.cursorCloses++; },
      }; } };
    } }) }),
  }) };
  const receipt = await readOwner.readRegisteredTenantBindings(input);
  const targets = [];
  for (const [moduleName, module] of Object.entries(candidate.binding.modules)) {
    const destination = databaseOwner.resolveTenantDatabaseConfiguration(moduleName, "alpha");
    const source = databaseOwner.resolveTenantDatabaseConfiguration(moduleName, "default");
    for (const channel of Object.keys(module.channels)) targets.push({ tenantCode: "alpha", serverCode: "platformServer",
      moduleName, channel, candidate: structuredClone(candidate), configuration: destination[channel], baseConfiguration: source[channel] });
  }
  return { input, receipt, targets, state, readOwner };
}

test("registered selection reads only exact protected provenance and always closes bounded cursors/client", async t => {
  const f = await registeredFixture(t);
  assert.equal(f.state.reads, 2);
  assert.equal(f.state.cursorCloses, 2);
  assert.equal(f.state.clientCloses, 1);
  assert.equal(Object.isFrozen(f.receipt.tenants[0].properties.database), true);
  assert.equal(owner.isRegisteredTenantObservation(f.receipt, f.input), true);
  assert.equal(owner.isRegisteredTenantObservation(structuredClone(f.receipt), f.input), false);
  assert.equal(owner.isRegisteredTenantObservation(f.receipt, { ...f.input, project: "other" }), false);
  assert.equal(owner.isRegisteredTenantObservation(f.receipt, { ...f.input, environment: "otherLocal" }), false);
  assert.equal(owner.isRegisteredTenantObservation(f.receipt, { ...f.input, registeredTenants: ["unknown"] }), false);
});

test("registered derived master/test destinations are admitted only inside one-use awaited scope", async t => {
  const f = await registeredFixture(t);
  let leaked, wrapper;
  await owner.withRegisteredTenantTargets(f.receipt, f.input, f.targets, async wrap => {
    wrapper = wrap;
    for (const target of f.targets) await wrap(target.configuration, async request => {
      assert.equal(owner.validate(request).databaseName, target.configuration.databaseName);
      assert.throws(() => owner.validate({ ...request }), /RESET_MONGO_SCOPE_INVALID/);
      leaked = request;
    });
    await assert.rejects(wrap(f.targets[0].baseConfiguration, () => {}), /PROOF_REQUIRED/);
    await assert.rejects(wrap({ ...f.targets[0].configuration, databaseName: "extra" }, () => {}), /PROOF_REQUIRED/);
  });
  assert.throws(() => owner.validate(leaked), /RESET_MONGO_SCOPE_INVALID/);
  await assert.rejects(wrapper(f.targets[0].configuration, () => {}), /PROOF_REQUIRED/);
  await assert.rejects(owner.withRegisteredTenantTargets(f.receipt, f.input, f.targets, () => {}), /PROOF_REQUIRED/);
  assert.equal(f.state.writes, 0);
});

for (const [name, alter] of [
  ["wrong project", f => { f.input.project = "wrong.project"; }],
  ["wrong environment", f => { f.input.environment = "wrongLocal"; }],
  ["unregistered tenant", f => { f.targets[0].tenantCode = "unknown"; }],
  ["changed pin", f => { f.targets[0].candidate.binding.modules.default.channels.master.destination.databaseName = "changed"; }],
  ["changed endpoint", f => { f.targets[0].configuration.URI = "mongodb://127.0.0.1:27018"; }],
  ["changed base", f => { f.targets[0].baseConfiguration.databaseName = "wrongBase"; }],
  ["changed destination", f => { f.targets[0].configuration.databaseName = "wrongDestination"; }],
  ["extra target", f => { f.targets.push({ ...f.targets[0], moduleName: "extra" }); }],
  ["missing channel", f => { f.targets.pop(); }],
  ["copied proof", f => { f.receipt = structuredClone(f.receipt); }],
]) test(`registered reset refuses ${name} before callback or effects`, async t => {
  const f = await registeredFixture(t);
  alter(f);
  let called = false;
  await assert.rejects(owner.withRegisteredTenantTargets(f.receipt, f.input, f.targets, () => { called = true; }));
  assert.equal(called, false);
  assert.equal(f.state.writes, 0);
});

test("inactive or duplicate registered tenant refuses observation and closes native read resources", async t => {
  await assert.rejects(registeredFixture(t, rows => { rows[0].active = false; }), /REGISTERED_TENANT_REQUIRED/);
  await assert.rejects(registeredFixture(t, rows => { rows.push(structuredClone(rows[0])); }), /TENANT_READ_INVALID/);
});

test("held derived target cannot drop after private invocation completes, but can still close its owned client", async t => {
  const f = await registeredFixture(t);
  const injected = fixture();
  injected.db.databaseName = f.targets[0].configuration.databaseName;
  let held;
  await owner.withRegisteredTenantTargets(f.receipt, f.input, f.targets, async wrap => {
    await wrap(f.targets[0].configuration, async request => {
      held = await owner.bind(request, injected.client, injected.db);
      await held.inspect();
    });
  });
  await assert.rejects(held.drop(), /RESET_MONGO_SCOPE_INVALID/);
  assert.equal(injected.state.drops, 0);
  await held.close();
  assert.equal(injected.state.closes, 1);
});

test("protected provenance refuses oversized tenant metadata before recording admission", async t => {
  await assert.rejects(registeredFixture(t, rows => {
    rows[0].properties.database.unexpectedPayload = "x".repeat(1048576);
  }), /RESET_TENANT_READ_BOUND_EXCEEDED/);
});

test("stripped shallow/deep copies of a tenant request cannot downgrade to a grammar-valid base target", async t => {
  const f = await registeredFixture(t, () => {}, "acmeLocalExplicitTenant");
  const target = f.targets.find(row => row.configuration.databaseName === "acmeLocalExplicitTenant");
  let stripped;
  await owner.withRegisteredTenantTargets(f.receipt, f.input, f.targets, async wrap => {
    await wrap(target.configuration, request => {
      assert.equal(owner.validate(request).databaseName, "acmeLocalExplicitTenant");
      for (const copy of [{ ...request }, structuredClone(request)]) {
        delete copy.registeredTenants;
        assert.throws(() => owner.validate(copy), /RESET_MONGO_SCOPE_INVALID/);
        stripped = copy;
      }
    });
  });
  assert.throws(() => owner.validate(stripped), /RESET_MONGO_SCOPE_INVALID/);
  const injected = fixture();
  let opens = 0;
  await assert.rejects(({ ...owner, createClient: () => { opens++; return injected.client; } }).open(stripped), /RESET_MONGO_SCOPE_INVALID/);
  assert.equal(opens, 0);
  assert.equal(injected.state.drops, 0);
  assert.equal(owner.validate(options()).databaseName, "acmeLocalPlatform");
});

/** Supplies exact source replica-set intent and a loopback-only writable primary hello, never a caller qualification flag. */
function replicaFixture() {
  const f = fixture();
  const input = options();
  input.configuration.URI += "/?replicaSet=acmeReplica";
  const hello = { isWritablePrimary: true, setName: "acmeReplica", me: "127.0.0.1:27017",
    primary: "127.0.0.1:27017", hosts: ["127.0.0.1:27017", "127.0.0.1:27018"] };
  f.db.command = async () => hello;
  return { ...f, input, hello };
}

test("exact local replica-set intent requires fresh local writable member proof and rechecks before drop", async () => {
  const f = replicaFixture();
  const held = await owner.bind(f.input, f.client, f.db);
  await held.inspect();
  f.hello.hosts.push("127.0.0.1:27019");
  await assert.rejects(held.drop(), /RESET_MONGO_TOPOLOGY_CHANGED/);
  assert.equal(f.state.drops, 0);
  f.hello.hosts.pop();
  assert.deepEqual(await held.drop(), { acknowledged: true });
  await held.close();
});

for (const [name, alter] of [
  ["remote host", f => { f.hello.hosts.push("remote.example:27017"); }],
  ["remote passive", f => { f.hello.passives = ["remote.example:27017"]; }],
  ["remote arbiter", f => { f.hello.arbiters = ["remote.example:27017"]; }],
  ["foreign set", f => { f.hello.setName = "foreign"; }],
  ["secondary", f => { f.hello.isWritablePrimary = false; }],
  ["sharded router", f => { f.hello.msg = "isdbgrid"; }],
  ["foreign primary", f => { f.hello.primary = "127.0.0.1:27018"; }],
  ["missing membership", f => { delete f.hello.hosts; }],
  ["oversized membership", f => { f.hello.hosts = Array.from({ length: 17 }, (_, index) => "127.0.0.1:" + (27017 + index)); }],
]) test(`local replica-set refuses ${name} before reset effects`, async () => {
  const f = replicaFixture();
  alter(f);
  await assert.rejects(owner.bind(f.input, f.client, f.db));
  assert.equal(f.state.drops, 0);
});

test("local endpoint parser rejects extra topology/auth options, multiple seeds, sockets and remote endpoints", () => {
  for (const URI of ["mongodb://127.0.0.1:27017/?replicaSet=a&replicaSet=b", "mongodb://127.0.0.1:27017/?loadBalanced=true",
    "mongodb://127.0.0.1:27017/?replicaSet=x&proxyHost=remote.example", "mongodb://127.0.0.1:27017,remote.example:27017/?replicaSet=x",
    "mongodb://remote.example:27017/?replicaSet=x", "mongodb+srv://remote.example/", "mongodb://%2Ftmp%2Fsocket/?replicaSet=x"])
    assert.throws(() => owner.validateLocalEndpointConfiguration({ URI }), /RESET_MONGO_SCOPE_INVALID/);
  assert.throws(() => owner.validateLocalEndpointConfiguration({ URI: "mongodb://127.0.0.1:27017/?replicaSet=x", options: { replicaSet: "other" } }));
});

test("hello-only installed inspection closes its client, emits count-only proof and never calls drop", async () => {
  const f = replicaFixture();
  const selected = { ...owner, createClient: () => f.client };
  const receipt = await selected.inspectLocalTopology(f.input.configuration);
  assert.deepEqual(receipt, { topology: "LOCAL_REPLICA_SET", memberCount: 2, writablePrimary: true,
    loopbackMembersOnly: true, independentExclusivityProof: false, effects: 0 });
  assert.equal(f.state.closes, 1);
  assert.equal(f.state.drops, 0);
  assert.doesNotMatch(JSON.stringify(receipt), /acmeReplica|mongodb:|127\.0/);
});
