/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/**
 * @module database/test/credentialRetirementPrimitiveContract
 * @description Deferred generated revision CAS and metadata-only credential retirement fixtures; not installed qualification.
 * @layer test
 * @owner database
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const source = require("../src/service/schema/defaultModelConcurrencyService");
const updateSource = require("../src/service/procs/update/defaultModelsUpdateInitializerService");
const provider = require("../../mongodb/src/schemas/model").default;

function fixture() {
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code) {
        super(code);
        this.code = code;
      }
    },
  };
  const primitive = { ...source },
    privateWrites = new WeakSet(),
    calls = [];
  const row = {
    _id: "credential-id",
    code: "credential-code",
    loginId: "person@example.test",
    active: true,
    revision: 4,
    password: "private-stored-hash",
  };
  const marker = {
    auditCode: "canonical-link-" + "a".repeat(40),
    fingerprint: "b".repeat(64),
  };
  const request = {
    tenant: "original",
    query: {
      _id: row._id,
      code: row.code,
      loginId: row.loginId,
      revision: 4,
      active: true,
      identityLinkRetirement: { $exists: false },
    },
    model: { active: false, identityLinkRetirement: marker },
    options: { recursive: false },
  };
  const matches = (query) =>
    Object.entries(query).every(([key, value]) =>
      value?.$exists === false ? row[key] === undefined : row[key] === value,
    );
  global.SERVICE = {
    DefaultModelConcurrencyService: primitive,
    DefaultCanonicalHistoricalIdentityLinkService: {
      ownsWrite: (value) => privateWrites.has(value),
    },
  };
  const model = {
    ...provider,
    primaryKey: "code",
    versioned: false,
    rawSchema: {
      definition: { revision: { type: "long" } },
      backoffice: { concurrency: { managed: true, field: "revision" } },
      credentialRetirement: {
        enabled: true,
        writerCoverageQualified: true,
        revisionField: "revision",
        credentialField: "password",
        activeField: "active",
        evidenceField: "identityLinkRetirement",
        ownerService: "DefaultCanonicalHistoricalIdentityLinkService",
      },
    },
    normalizeModelForWrite: (value) => value,
    transactionOptions: () => ({}),
    getItems: async (input) =>
      matches(input.query) ? [structuredClone(row)] : [],
    findOneAndUpdate: async (query, document, options) => {
      calls.push({ query, document, options });
      assert.equal(query.password, undefined);
      assert.equal(document.$set.password, undefined);
      assert.deepEqual(options.projection, {
        _id: 1,
        code: 1,
        loginId: 1,
        active: 1,
        revision: 1,
        identityLinkRetirement: 1,
      });
      assert.equal(options.upsert, false);
      if (!matches(query)) return { ok: 1, value: null };
      Object.assign(row, document.$set);
      return {
        ok: 1,
        value: Object.fromEntries(
          Object.keys(options.projection).map((key) => [key, row[key]]),
        ),
      };
    },
  };
  const dispatch = () =>
    new Promise((resolve, reject) => {
      request.schemaModel = model;
      privateWrites.add(request);
      const process = {
        nextSuccess: (_request, response) => {
          privateWrites.delete(request);
          resolve(response.success);
        },
        error: (_request, _response, error) => {
          privateWrites.delete(request);
          reject(error);
        },
      };
      updateSource.executeQuery.call(
        { ...updateSource, LOG: { debug: () => {} } },
        request,
        {},
        process,
      );
    });
  return {
    primitive,
    request,
    model,
    row,
    calls,
    dispatch,
    marker,
    privateWrites,
  };
}

test("actual generated dispatch reaches revision CAS with hash-free predicates and metadata-only return", async () => {
  const f = fixture(),
    receipt = await f.primitive.retireCredential(f.request, f.dispatch);
  assert.deepEqual(receipt, {
    attempted: true,
    acknowledged: true,
    revision: 5,
  });
  assert.equal(f.calls.length, 1);
  assert.equal(f.calls[0].query.revision, 4);
  assert.equal(f.row.password, "private-stored-hash");
  assert.equal(f.row.active, false);
  assert.equal(f.row.revision, 5);
  assert.equal(f.primitive.ownsCredentialRetirement(f.request), false);
  assert.equal(f.primitive.ownsCredentialRetirement({ ...f.request }), false);
});

test("a successful generated-shaped response without the actual primitive is never retirement", async () => {
  const f = fixture();
  await assert.rejects(
    f.primitive.retireCredential(f.request, async () => ({
      code: "SUC_UPDATE",
      result: { matchedCount: 1 },
    })),
    /ERR_CONCURRENCY/,
  );
  assert.equal(f.calls.length, 0);
  assert.equal(f.row.active, true);
});

test("reset wins the atomic revision race without retirement or credential overwrite", async () => {
  const f = fixture(),
    update = f.model.findOneAndUpdate;
  f.model.findOneAndUpdate = async (...args) => {
    f.row.revision++;
    f.row.password = "concurrent-reset-hash";
    return update(...args);
  };
  const receipt = await f.primitive.retireCredential(f.request, f.dispatch);
  assert.deepEqual(receipt, { attempted: true, acknowledged: false });
  assert.equal(f.row.active, true);
  assert.equal(f.row.identityLinkRetirement, undefined);
  assert.equal(f.row.password, "concurrent-reset-hash");
});

test("lost provider acknowledgement retains exact next revision/marker but reports uncertainty", async () => {
  const f = fixture(),
    update = f.model.findOneAndUpdate;
  f.model.findOneAndUpdate = async (...args) => {
    await update(...args);
    throw new Error("lost acknowledgement");
  };
  const receipt = await f.primitive.retireCredential(f.request, f.dispatch);
  assert.deepEqual(receipt, { attempted: true, acknowledged: false });
  assert.equal(f.row.revision, 5);
  assert.deepEqual(f.row.identityLinkRetirement, f.marker);
  assert.equal(f.primitive.ownsCredentialRetirement(f.request), false);
});

test("unqualified schema/writer/provider, missing token and altered owner intent fail before provider writes", async () => {
  for (const variant of [
    "unmanaged",
    "writer-unqualified",
    "unsupported-provider",
    "missing-token",
    "changed-target",
    "changed-marker",
  ]) {
    const f = fixture();
    if (variant === "unmanaged")
      f.model.rawSchema.backoffice.concurrency.managed = false;
    if (variant === "writer-unqualified")
      f.model.rawSchema.credentialRetirement.writerCoverageQualified = false;
    if (variant === "unsupported-provider")
      f.model.credentialRetirementCapabilities = () => ({
        contractVersion: 1,
        revisionCas: true,
        metadataOnlyReadback: false,
      });
    if (variant === "missing-token") delete f.request.query.revision;
    const dispatch = async () => {
      if (variant === "changed-target")
        f.request.query.code = "other-credential";
      if (variant === "changed-marker")
        f.request.model.identityLinkRetirement.fingerprint = "c".repeat(64);
      return f.dispatch();
    };
    await assert.rejects(
      f.primitive.retireCredential(f.request, dispatch),
      /ERR_CONCURRENCY/,
    );
    assert.equal(f.calls.length, 0);
    assert.equal(f.row.active, true);
  }
});

test("raw hash queries and copied/body private flags cannot obtain primitive admission", async () => {
  const f = fixture();
  f.request.query.password = "must-not-be-dispatched";
  await assert.rejects(
    f.primitive.retireCredential(f.request, f.dispatch),
    /ERR_CONCURRENCY/,
  );
  assert.equal(f.calls.length, 0);
  assert.equal(
    f.primitive.ownsCredentialRetirement({ credentialRetirement: true }),
    false,
  );
  assert.equal(
    f.primitive.credentialRetirementProjection({
      retirementProjection: { password: 1 },
    }),
    undefined,
  );
});

test("provider command errors cannot become acknowledged retirement even with plausible metadata", async () => {
  for (const failure of [
    { ok: 0 },
    { acknowledged: false },
    { writeConcernError: { code: 64 } },
    { writeErrors: [{ code: 1 }] },
  ]) {
    const f = fixture(),
      update = f.model.findOneAndUpdate;
    f.model.findOneAndUpdate = async (...args) => ({
      ...(await update(...args)),
      ...failure,
    });
    assert.deepEqual(
      await f.primitive.retireCredential(f.request, f.dispatch),
      { attempted: true, acknowledged: false },
    );
    assert.equal(f.primitive.ownsCredentialRetirement(f.request), false);
  }
});
