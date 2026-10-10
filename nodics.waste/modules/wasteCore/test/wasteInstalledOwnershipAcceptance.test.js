/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module wasteCore/test/wasteInstalledOwnershipAcceptance
 * @description Source boundary tests for the read-only installed-owner preflight. Provider doubles do not establish native installation or financial proof.
 * @layer test @owner wasteCore
 */
const test = require("node:test"), assert = require("node:assert/strict");
const { inspectOwnershipPersistence } = require("./helpers/installedOwnerAcceptance");
const transfer = require("../src/service/defaultWasteAssetTransferOperationService");

function fixture(t) {
  const globals = Object.fromEntries(["CONFIG", "NODICS", "SERVICE", "UTILS"].map(key => [key, global[key]]));
  const optIn = process.env.NODICS_WASTE_INSTALLED_ACCEPTANCE;
  t.after(() => {
    for (const [key, value] of Object.entries(globals)) if (value === undefined) delete global[key]; else global[key] = value;
    if (optIn === undefined) delete process.env.NODICS_WASTE_INSTALLED_ACCEPTANCE;
    else process.env.NODICS_WASTE_INSTALLED_ACCEPTANCE = optIn;
  });
  process.env.NODICS_WASTE_INSTALLED_ACCEPTANCE = "1";
  const calls = [], settings = { runtimeRole: "WASTE", environment: { class: "LOCAL" },
    eWaste: { marketplace: { digitalOwnership: { enabled: false, qualified: false } } } };
  const hello = { isWritablePrimary: true, setName: "local", hosts: ["127.0.0.1:27017"] };
  const database = { getRUI: () => "mongodb://127.0.0.1:27017",
    getConnection: () => ({ command: async value => { calls.push(value); return hello; } }) };
  const indexes = { versioned: false, indexes: [{ unique: true, key: { code: 1 } }] };
  const models = Object.fromEntries(["wasteAsset", "wasteAssetOwnershipEvent"].map(schema => [schema, {
    moduleName: "wasteCore", schemaName: schema, versioned: false, primaryKey: "code", compareAndSetItem() {},
    dataBase: database, rawSchema: { field: schema === "wasteAsset" ? "revision" : undefined },
  }]));
  global.CONFIG = { get: key => settings[key] };
  global.UTILS = { createModelName: value => value };
  global.NODICS = { getServerState: () => "ready", getModels: (module, tenant) => {
    assert.equal(module, "wasteCore"); assert.equal(tenant, "test_tenant"); return models;
  } };
  global.SERVICE = { DefaultWasteAssetTransferOperationService: transfer,
    DefaultDatabaseModelHandlerService: { inspectIndexes: async model => { calls.push({ schema: model.schemaName }); return indexes; } },
    DefaultModelConcurrencyService: { getField: schema => schema.field } };
  return { calls, settings, hello, database, models, indexes };
}

test("installed preflight reuses real owner prerequisites with flags off, reads only and returns no provider details", async t => {
  const f = fixture(t), before = structuredClone(f.settings);
  const result = await inspectOwnershipPersistence({ tenant: "test_tenant" });
  assert.deepEqual(f.calls, [{ hello: 1 }, { schema: "wasteAsset" }, { schema: "wasteAssetOwnershipEvent" }]);
  assert.deepEqual(f.settings, before);
  assert.deepEqual(result.schemas, [{ schema: "wasteAsset", uniqueIdentity: true, compareAndSet: true, revisionField: "revision" },
    { schema: "wasteAssetOwnershipEvent", uniqueIdentity: true, compareAndSet: true, revisionField: null }]);
  for (const key of ["signedTransportProven", "saleRefundProven", "productionQualified", "integrationFlagsChanged"]) assert.equal(result[key], false);
  assert.equal(JSON.stringify(result).includes("mongodb"), false);
});
test("opt-in, LOCAL role, ready runtime and exact tenant refuse before provider reads", async t => {
  const f = fixture(t);
  delete process.env.NODICS_WASTE_INSTALLED_ACCEPTANCE;
  await assert.rejects(inspectOwnershipPersistence({ tenant: "test_tenant" }), /opt-in/);
  process.env.NODICS_WASTE_INSTALLED_ACCEPTANCE = "1";
  f.settings.environment.class = "PRODUCTION";
  await assert.rejects(inspectOwnershipPersistence({ tenant: "test_tenant" }), /LOCAL/);
  f.settings.environment.class = "LOCAL"; f.settings.runtimeRole = "COMMERCE";
  await assert.rejects(inspectOwnershipPersistence({ tenant: "test_tenant" }), /LOCAL/);
  f.settings.runtimeRole = "WASTE"; NODICS.getServerState = () => "building";
  await assert.rejects(inspectOwnershipPersistence({ tenant: "test_tenant" }), /ready/);
  NODICS.getServerState = () => "ready";
  await assert.rejects(inspectOwnershipPersistence({ tenant: "foreign tenant" }), /tenant/);
  assert.equal(f.calls.length, 0);
});
test("foreign generated owner and remote/credentialed providers refuse", async t => {
  const f = fixture(t);
  f.models.wasteAsset.moduleName = "other";
  await assert.rejects(inspectOwnershipPersistence({ tenant: "test_tenant" }), /generated/);
  f.models.wasteAsset.moduleName = "wasteCore";
  for (const uri of ["mongodb://remote:27017", "mongodb://user:secret@127.0.0.1:27017", "mongodb://127.0.0.1:65536"]) {
    f.database.getRUI = () => uri;
    await assert.rejects(inspectOwnershipPersistence({ tenant: "test_tenant" }), /loopback/);
  }
  assert.equal(f.calls.length, 0);
});
test("nonunique index, absent CAS and wrong revision owner refuse without writes", async t => {
  const f = fixture(t);
  f.indexes.indexes[0].unique = false;
  await assert.rejects(inspectOwnershipPersistence({ tenant: "test_tenant" }), /unconfirmed/);
  f.indexes.indexes[0].unique = true;
  delete f.models.wasteAsset.compareAndSetItem;
  await assert.rejects(inspectOwnershipPersistence({ tenant: "test_tenant" }), /unconfirmed/);
  f.models.wasteAsset.compareAndSetItem = () => {};
  f.models.wasteAsset.rawSchema.field = "wrong";
  await assert.rejects(inspectOwnershipPersistence({ tenant: "test_tenant" }), /unconfirmed/);
  assert.ok(f.calls.every(value => value.hello === 1 || value.schema));
});
test("CAS-only inspection does not impose an unsupported multi-record transaction prerequisite", async t => {
  const f = fixture(t);
  delete f.hello.setName; delete f.hello.hosts;
  assert.equal((await inspectOwnershipPersistence({ tenant: "test_tenant" })).readOnly, true);
});
test("remote replica members and private provider failures are refused without disclosure", async t => {
  const f = fixture(t);
  f.hello.hosts.push("remote:27017");
  await assert.rejects(inspectOwnershipPersistence({ tenant: "test_tenant" }), /unconfirmed/);
  f.database.getConnection = () => ({ command: async () => { throw new Error("private-database-name private-record-value"); } });
  await assert.rejects(inspectOwnershipPersistence({ tenant: "test_tenant" }), error => !error.message.includes("private"));
});
