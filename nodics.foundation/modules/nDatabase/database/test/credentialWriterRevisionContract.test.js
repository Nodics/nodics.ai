/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module database/test/credentialWriterRevisionContract @description Deferred generic credential create/change/remove/import revision and retired-state fixtures; not installed coverage. @owner database @layer test */
const test = require("node:test");
const assert = require("node:assert/strict");
const source = require("../src/service/schema/defaultModelConcurrencyService");
const importer = require("../../../nData/nImport/import/src/service/process/model/defaultModelImportProcessService");

function fixture() {
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code) {
        super(code);
        this.code = code;
      }
    },
  };
  global.SERVICE = { DefaultModelConcurrencyService: { ...source } };
  const schema = {
    definition: { revision: { type: "long" } },
    backoffice: { concurrency: { managed: true, field: "revision" } },
    credentialRetirement: {
      enabled: false,
      writerCoverageQualified: false,
      revisionField: "revision",
      credentialField: "password",
      activeField: "active",
      evidenceField: "identityLinkRetirement",
    },
  };
  let row = {
    code: "credential",
    _id: "original-id",
    loginId: "person@example.test",
    active: true,
    revision: 4,
    password: "old-hash",
  };
  const calls = [];
  const matches = (query) =>
    row &&
    Object.entries(query).every(([key, value]) =>
      value?.$exists === false ? !Object.hasOwn(row, key) : row[key] === value,
    );
  let race;
  const model = {
    primaryKey: "code",
    rawSchema: schema,
    getItems: async (input) =>
      matches(input.query) ? [structuredClone(row)] : [],
    compareAndSetItem: async (input) => {
      calls.push(input);
      if (race) race(row);
      if (input.operation === "create") {
        if (row) throw Error("duplicate");
        row = { ...input.model };
        return { ...row };
      }
      if (!matches(input.query)) return null;
      if (input.operation === "remove") {
        const previous = row;
        row = undefined;
        return previous;
      }
      Object.assign(row, input.model);
      return { ...row };
    },
  };
  return {
    owner: SERVICE.DefaultModelConcurrencyService,
    model,
    schema,
    calls,
    row: () => row,
    set: (value) => {
      row = value;
    },
    race: (callback) => {
      race = callback;
    },
    request: (patch) => ({
      tenant: "original",
      schemaModel: model,
      query: { code: "credential", revision: 4 },
      model: patch || {},
    }),
  };
}

test("generic credential changes share exact revision and atomic non-retired state filters", async () => {
  const f = fixture();
  assert.equal(
    (await f.owner.execute(f.request({ password: "new-hash" }), "update"))
      .matchedCount,
    1,
  );
  assert.equal(f.row().revision, 5);
  assert.deepEqual(f.calls[0].query, {
    code: "credential",
    revision: 4,
    active: true,
    identityLinkRetirement: { $exists: false },
  });
  assert.equal(f.calls[0].query.password, undefined);
});

test("save/update/remove cannot modify or erase retired original credentials", async () => {
  for (const operation of ["save", "update", "remove"]) {
    const f = fixture();
    f.row().identityLinkRetirement = { auditCode: "original-marker" };
    f.row().active = false;
    await assert.rejects(
      f.owner.execute(
        f.request({ code: "credential", active: true, password: "new-hash" }),
        operation,
      ),
      /ERR_CONCURRENCY/,
    );
    assert.equal(f.calls.length, 0);
    assert.equal(f.row().password, "old-hash");
  }
});

test("competing retirement defeats an ordinary writer even if an unqualified writer failed to advance its revision", async () => {
  const f = fixture();
  f.race((row) => {
    row.active = false;
    row.identityLinkRetirement = { auditCode: "other-operation" };
  });
  await assert.rejects(
    f.owner.execute(f.request({ password: "new-hash" }), "update"),
    /ERR_CONCURRENCY/,
  );
  assert.equal(f.row().password, "old-hash");
});

test("reserved evidence, hash selectors and missing installed revisions reject", async () => {
  for (const variant of ["marker", "hash-selector", "missing-revision"]) {
    const f = fixture(),
      request = f.request({ password: "new-hash" });
    if (variant === "marker") request.model.identityLinkRetirement = {};
    if (variant === "hash-selector") request.query.password = "old-hash";
    if (variant === "missing-revision") delete f.row().revision;
    await assert.rejects(f.owner.execute(request, "update"), /ERR_CONCURRENCY/);
    assert.equal(f.calls.length, 0);
  }
});

test("new generated credentials initialize once and disabled legacy policy adds no guard", async () => {
  const f = fixture();
  f.set(undefined);
  const request = {
    tenant: "original",
    schemaModel: f.model,
    model: {
      code: "new",
      loginId: "new@example.test",
      active: true,
      password: "new-hash",
    },
  };
  f.owner.initializeSave(request);
  assert.equal((await f.owner.execute(request, "save")).revision, 1);
  f.schema.backoffice.concurrency.managed = false;
  assert.equal(f.owner.getCredentialWritePolicy(f.schema), undefined);
  assert.deepEqual(
    f.owner.credentialWriteConditions(
      { schemaModel: f.model, model: { identityLinkRetirement: {} } },
      { active: false },
    ),
    {},
  );
});

test("managed imports capture fresh original tokens once and reject inactive/legacy existing credentials", async () => {
  for (const variant of ["active", "inactive", "missing-revision"]) {
    const f = fixture();
    if (variant === "inactive") f.row().active = false;
    if (variant === "missing-revision") delete f.row().revision;
    const request = {
      tenant: "original",
      header: {
        rawSchema: f.schema,
        query: { code: "$code" },
        options: {
          operation: "saveAll",
          moduleName: "profile",
          schemaName: "password",
          userGroups: [],
        },
      },
    };
    let reads = 0;
    const service = {
      get: async (command) => {
        reads++;
        assert.equal(command.options.skipItemCache, true);
        return { result: [{ ...f.row() }] };
      },
    };
    if (variant !== "active") {
      await assert.rejects(
        importer.reconcileManagedRevisions.call(importer, request, service, [
          { code: "credential" },
        ]),
        /ERR_CONCURRENCY/,
      );
      continue;
    }
    const models = [{ code: "credential" }];
    await importer.reconcileManagedRevisions.call(
      importer,
      request,
      service,
      models,
    );
    assert.equal(models[0].revision, 4);
    f.row().revision = 5;
    await importer.reconcileManagedRevisions.call(
      importer,
      request,
      service,
      models,
    );
    assert.equal(models[0].revision, 4);
    assert.equal(reads, 1);
  }
});

test("configured imports refuse hash selectors and reserved evidence before any credential read", async () => {
  for (const variant of ["hash-selector", "marker-selector", "marker-model"]) {
    const f = fixture();
    const query = { code: "$code" },
      models = [{ code: "credential" }];
    if (variant === "hash-selector") query.password = "private-hash";
    if (variant === "marker-selector") query.identityLinkRetirement = {};
    if (variant === "marker-model") models[0].identityLinkRetirement = {};
    const request = {
      tenant: "original",
      header: {
        rawSchema: f.schema,
        query,
        options: {
          operation: "saveAll",
          moduleName: "profile",
          schemaName: "password",
        },
      },
    };
    let reads = 0;
    await assert.rejects(
      importer.reconcileManagedRevisions.call(
        importer,
        request,
        {
          get: async () => {
            reads++;
            return { result: [] };
          },
        },
        models,
      ),
      /ERR_CONCURRENCY/,
    );
    assert.equal(reads, 0);
  }
});
