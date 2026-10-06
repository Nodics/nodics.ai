/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module import/test/importSingleUpdateDispatch @description Exercises partial updates through the generated service without converting them to credential-bearing saves. @layer test @owner import */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const definition = require("../src/service/process/model/defaultModelImportProcessService");

/** Builds a focused dispatch fixture preserving the real import operation boundary. */
function fixture(operation, execute) {
  global.SERVICE = {};
  global.CLASSES = { DataImportError: class extends Error {
    constructor(code, message) { super(message); this.code = code; }
  } };
  return {
    owner: {
      ...definition,
      normalizeModelsForSchema: (_header, models) => models,
      ensureLocalSchemaService: async () => ({ [operation]: execute }),
      reconcileContentPackVersions: async (_request, _service, models) => models,
      reconcileManagedRevisions: async (_request, _service, models) => models,
      isGovernedContentPackRun: () => false,
    },
    request: {
      tenant: "test-tenant",
      options: { returnModified: true },
      header: { options: { operation, moduleName: "profile", schemaName: "customer", userGroups: ["adminGroup"] }, query: { code: "existing-customer" } },
    },
  };
}

test("single update forwards model and exact selector to the generated owner", async () => {
  const model = { ownerId: "sample@example.test", ownerType: "customer" };
  const f = fixture("update", async (request) => {
    assert.deepEqual(request.model, model);
    assert.deepEqual(request.query, { code: "existing-customer" });
    assert.equal(request.tenant, "test-tenant");
    assert.equal(request.options.returnModified, true);
    assert.equal(request.model.password, undefined);
    return { result: [model] };
  });
  assert.deepEqual(await f.owner.insertLocalSchemaModel(f.request, [model]), [model]);
});

test("single update rejects ambiguous multiple models before calling the owner", async () => {
  let calls = 0;
  const f = fixture("update", async () => { calls++; return {}; });
  await assert.rejects(f.owner.insertLocalSchemaModel(f.request, [{ code: "a" }, { code: "b" }]), { code: "ERR_IMP_00003" });
  assert.equal(calls, 0);
});

test("update resolves import selectors and unwraps the generated update receipt", async () => {
  const model = { code: "existing-customer", ownerId: "sample@example.test" };
  const f = fixture("update", async (request) => {
    assert.deepEqual(request.query, { code: model.code });
    assert.equal(request.options.returnModified, true);
    return { result: { matchedCount: 1, modifiedCount: 0, models: [model] } };
  });
  f.request.header.query = { code: "$code" };
  f.request.options = {};
  assert.deepEqual(await f.owner.insertLocalSchemaModel(f.request, [model]), [model]);
});

test("update does not report an unmatched receipt as imported", async () => {
  const f = fixture("update", async () => ({ result: { matchedCount: 0, modifiedCount: 0, models: [] } }));
  await assert.rejects(f.owner.insertLocalSchemaModel(f.request, [{ code: "missing" }]), { code: "ERR_IMP_00001" });
});

test("update rejects unresolved and empty selectors before dispatch", async () => {
  for (const query of [{ code: "$missing" }, {}]) {
    let calls = 0;
    const f = fixture("update", async () => { calls++; return {}; });
    f.request.header.query = query;
    await assert.rejects(f.owner.insertLocalSchemaModel(f.request, [{ code: "a" }]), { code: "ERR_IMP_00003" });
    assert.equal(calls, 0);
  }
});

test("saveAll retains its complete models contract", async () => {
  const models = [{ code: "a" }, { code: "b" }];
  const f = fixture("saveAll", async (request) => {
    assert.deepEqual(request.models, models);
    assert.equal(request.model, undefined);
    return { result: models };
  });
  assert.deepEqual(await f.owner.insertLocalSchemaModel(f.request, models), models);
});
