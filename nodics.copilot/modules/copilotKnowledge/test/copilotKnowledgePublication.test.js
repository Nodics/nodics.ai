/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @file Verifies complete-generation publication and pre/post-query filtering without a real index or customer data. */
"use strict";
const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const service = require("../src/service/defaultCopilotKnowledgePublicationService");
const ingestion = require("../src/service/defaultCopilotKnowledgeIngestionService");
const retrieval = require("../src/service/defaultCopilotKnowledgeRetrievalService");
let request, manifest, calls;
const token = "12345678-1234-1234-1234-123456789abc";
beforeEach(() => {
  request = {
    indexTenant: "tenant",
    publicationEnabled: true,
    configuration: {
      enabled: true,
      indexConfigurationCode: "knowledge",
      indexName: "projection",
    },
    source: {
      code: "source",
      sourcePolicyDigest: "a".repeat(64),
      version: "v1",
      enabled: true,
      sourceType: "README",
    },
  };
  manifest = {
    pendingGeneration: {
      token,
      count: 1,
      digest: "a".repeat(64),
      at: "2026-10-03T00:00:00.000Z",
    },
    currentGeneration: null,
    obsoleteGenerations: [],
  };
  calls = [];
  global.SERVICE = {
    DefaultDiscoveryGenerationPublicationService: {
      begin: async () => structuredClone(manifest),
      startWrite: async (_scope, claimed) => claimed,
      completeWrite: async (_scope, claimed) => claimed,
      sealWriter: async (_scope, claimed) => claimed,
      acknowledged: (r) => r?.code === "SUC_SEARCH",
      count: async () => 1,
      publish: async (_r, claimed) => {
        calls.push("publish");
        manifest = {
          ...claimed,
          currentGeneration: claimed.pendingGeneration,
          pendingGeneration: null,
        };
        return structuredClone(manifest);
      },
      read: async () => structuredClone(manifest),
      cleanup: async () => structuredClone(manifest),
    },
    DefaultDiscoveryDocumentProjectionService: {
      doRefresh: async () => ({
        code: "SUC_SEARCH",
        result: { _shards: { failed: 0, successful: 1 } },
      }),
    },
  };
});
test("generation-qualified writes are visible and complete before publication; failure cannot publish partial chunks", async () => {
  const dependencies = {
    policyService: {
      decideCapabilityAccess: () => ({}),
      assertAllowed: () => {},
      deepFreeze: (value) => value,
    },
    sourceProviders: {
      README: {
        read: async () => [{ relativePath: "README.md", content: "safe" }],
      },
    },
    secretInspectionService: { inspect: () => ({ safe: true }) },
    chunkService: {
      chunk: () => [
        {
          code: "source|chunk",
          allowedChannels: ["EMPLOYEE"],
          contentDigest: "b".repeat(64),
        },
      ],
    },
    discoveryDocumentBuilderService: {
      build: (r) => ({ code: r.ownerCode, payload: r.payload }),
    },
    publicationService: service,
    discoveryProjectionService: {
      doSave: async (r) => {
        calls.push("save");
        assert.equal(r.model.payload.publicationGeneration, token);
        assert.ok(r.model.code.endsWith(token));
        return { code: "SUC_SEARCH", result: [{ code: r.model.code }] };
      },
    },
  };
  const report = await ingestion.ingestSource(request, dependencies);
  assert.deepEqual(calls, ["save", "publish"]);
  assert.equal(report.publication.evidence, "DURABLE_GENERATION");
  calls.length = 0;
  manifest.pendingGeneration = { ...manifest.currentGeneration };
  dependencies.discoveryProjectionService.doSave = async () => ({
    code: "SUC_SEARCH",
    result: [],
  });
  await assert.rejects(
    ingestion.ingestSource(request, dependencies),
    /UNCONFIRMED/,
  );
  assert.deepEqual(calls, []);
  const preview = await ingestion.ingestSource(
    { ...request, dryRun: true },
    dependencies,
  );
  assert.equal(preview.publication, undefined);
});
test("visibility failure, incomplete count and current source revocation block publication", async () => {
  const claimed = structuredClone(manifest);
  SERVICE.DefaultDiscoveryGenerationPublicationService.count = async () => 0;
  await assert.rejects(service.finish(request, claimed), /INCOMPLETE/);
  SERVICE.DefaultDiscoveryGenerationPublicationService.count = async () => 1;
  request.assertCurrent = () => {
    throw new Error("revoked");
  };
  await assert.rejects(service.finish(request, claimed), /revoked/);
  delete request.assertCurrent;
  SERVICE.DefaultDiscoveryDocumentProjectionService.doRefresh = async () => ({
    code: "SUC_SEARCH",
    result: { _shards: { failed: 1, successful: 1 } },
  });
  await assert.rejects(
    service.finish(request, claimed),
    /VISIBILITY_UNCONFIRMED/,
  );
  assert.deepEqual(calls, []);
});
test("retired completion records quiescence but cannot adopt another pending generation or dispatch again", async () => {
  const owner = SERVICE.DefaultDiscoveryGenerationPublicationService;
  const events = [];
  owner.startWrite = async (scope, claim) => {
    assert.equal(scope.guardedWrites, true);
    events.push("claim");
    return claim;
  };
  owner.completeWrite = async () => {
    events.push("complete");
    return { ...manifest, pendingGeneration: { token: "other" } };
  };
  await assert.rejects(
    service.write(request, manifest, async () => {
      events.push("physical");
    }),
    /WRITER_RETIRED/,
  );
  assert.deepEqual(events, ["claim", "physical", "complete"]);
});
test("unknown claim or physical result never records completion, and fresh revocation blocks dispatch", async () => {
  const owner = SERVICE.DefaultDiscoveryGenerationPublicationService;
  let writes = 0,
    completions = 0;
  owner.completeWrite = async (claim) => {
    completions++;
    return claim;
  };
  owner.startWrite = async () => {
    throw new Error("claim unknown");
  };
  await assert.rejects(
    service.write(request, manifest, async () => {
      writes++;
    }),
  );
  assert.equal(writes, 0);
  owner.startWrite = async (_scope, claim) => claim;
  await assert.rejects(
    service.write(request, manifest, async () => {
      writes++;
      throw new Error("provider unknown");
    }),
  );
  assert.equal(completions, 0);
  let checks = 0;
  request.assertCurrent = async () => {
    if (++checks === 2) throw new Error("revoked");
  };
  await assert.rejects(
    service.write(request, manifest, async () => {
      writes++;
    }),
    /revoked/,
  );
  assert.equal(writes, 1);
  assert.equal(completions, 0);
});
test("automatic refresh cleanup selects only published debt and keeps the current-policy guard", async () => {
  const guard = () => {};
  request.assertCurrent = guard;
  manifest.obsoleteGenerations = [{ token: "older", origin: "PUBLISHED" }];
  let cleanupOptions;
  SERVICE.DefaultDiscoveryGenerationPublicationService.cleanup = async (
    _scope,
    options,
  ) => {
    cleanupOptions = options;
    return structuredClone(manifest);
  };
  await service.finish(request, structuredClone(manifest));
  assert.equal(cleanupOptions.publishedOnly, true);
  assert.equal(cleanupOptions.assertCurrent, guard);
});
test("empty or drifted manifests exclude legacy chunks and durable status checks physical count", async () => {
  assert.equal((await service.active(request, [request.source])).size, 0);
  await SERVICE.DefaultDiscoveryGenerationPublicationService.publish(
    request,
    manifest,
  );
  assert.equal(
    (await service.active(request, [request.source])).get("source"),
    token,
  );
  assert.equal(
    (await service.inspect(request, request.source)).state,
    "PROJECTED",
  );
  SERVICE.DefaultDiscoveryGenerationPublicationService.count = async () => 0;
  assert.equal((await service.inspect(request, request.source)).state, "STALE");
  assert.equal(
    (
      await service.active(request, [
        { ...request.source, sourcePolicyDigest: "b".repeat(64) },
      ])
    ).size,
    0,
  );
});
test("progress projects acknowledged counters without private claims or publication success", async () => {
  manifest.pendingGeneration.writer = {
    version: 1,
    state: "WRITING",
    completed: 0,
    claim: "private",
  };
  const status = await service.inspect(request, request.source);
  assert.equal(status.state, "UNKNOWN");
  assert.equal(status.inspectionRequired, true);
  assert.deepEqual(status.progress, {
    phase: "WRITING",
    acknowledgedChunks: 0,
    expectedChunks: 1,
  });
  assert.ok(!JSON.stringify(status).includes("private"));
});

test("source fingerprint ignores bookkeeping/order but includes payload, visibility and index metadata", () => {
  const first = [
    {
      code: "a",
      projectedAt: "old",
      created: "old",
      updated: "old",
      payload: { content: "safe", permissions: ["read"] },
      locale: "en",
    },
    { code: "b", payload: { content: "other" } },
  ];
  const reordered = [
    { payload: { content: "other" }, code: "b" },
    {
      code: "a",
      updated: "new",
      created: "new",
      projectedAt: "new",
      payload: { permissions: ["read"], content: "safe" },
      locale: "en",
    },
  ];
  assert.equal(service.fingerprint(first), service.fingerprint(reordered));
  for (const changed of [
    { ...first[0], payload: { content: "changed" } },
    { ...first[0], locale: "fr" },
    { ...first[0], payload: { content: "safe", permissions: ["admin"] } },
  ])
    assert.notEqual(
      service.fingerprint(first),
      service.fingerprint([changed, first[1]]),
    );
  assert.notEqual(service.fingerprint(first), service.fingerprint([]));
  assert.throws(
    () => service.fingerprint([first[0], first[0]]),
    /DOCUMENTS_INVALID/,
  );
});

test("unchanged ingestion still reads and secret-scans while skipping every projection write and writer claim", async () => {
  let scanned = 0,
    inspected = 0,
    reused = 0;
  const dependencies = {
    policyService: {
      decideCapabilityAccess: () => ({}),
      assertAllowed: () => {},
      deepFreeze: (value) => value,
    },
    sourceProviders: {
      README: {
        read: async () => {
          scanned++;
          return [{ relativePath: "README.md", content: "safe" }];
        },
      },
    },
    secretInspectionService: {
      inspect: () => {
        inspected++;
        return { safe: true };
      },
    },
    chunkService: {
      chunk: () => [
        {
          code: "chunk",
          allowedChannels: ["EMPLOYEE"],
          contentDigest: "b".repeat(64),
        },
      ],
    },
    discoveryDocumentBuilderService: {
      build: (r) => ({ code: r.ownerCode, payload: r.payload }),
    },
    publicationService: {
      unchanged: async () => {
        reused++;
        return { unchanged: true, evidence: "DURABLE_GENERATION" };
      },
      begin: () => assert.fail("Unchanged source claimed a writer"),
      finish: () => assert.fail("Unchanged source published"),
    },
    discoveryProjectionService: {
      doSave: () => assert.fail("Unchanged source rewrote chunks"),
    },
  };
  const report = await ingestion.ingestSource(
    { ...request, incrementalEnabled: true },
    dependencies,
  );
  assert.equal(report.state, "PROJECTED");
  assert.equal(report.chunksProjected, 1);
  assert.equal(report.chunksWritten, 0);
  assert.equal(scanned, 1);
  assert.equal(inspected, 1);
  assert.equal(reused, 1);
  await ingestion.ingestSource(
    { ...request, incrementalEnabled: true, dryRun: true },
    dependencies,
  );
  assert.equal(scanned, 2);
  assert.equal(inspected, 2);
  assert.equal(reused, 1);
});
test("retrieval filters active generation before querying and drops replaced generations after query", async () => {
  let reads = 0,
    searches = 0;
  const payload = {
    code: "source|chunk",
    sourceCode: "source",
    publicationOwner: "source",
    publicationGeneration: token,
  };
  const dependencies = {
    registryService: {
      buildQueryScope: () => ({
        sourceCodes: ["source"],
        sourcePolicyDigests: ["a".repeat(64)],
        classifications: ["INTERNAL"],
        channel: "EMPLOYEE",
      }),
    },
    policyService: { deepFreeze: (value) => value },
    knowledgeService: {
      buildContext: (values) => ({ evidence: values, citations: [] }),
    },
    publicationService: {
      active: async () => {
        reads++;
        return new Map([["source", reads === 1 ? token : "other"]]);
      },
    },
    discoveryRuntimeService: {
      search: async (r) => {
        searches++;
        assert.deepEqual(
          r.searchQuery.filters["payload.publicationGeneration.keyword"],
          [token],
        );
        return [{ payload }];
      },
    },
  };
  const result = await retrieval.search(
    {
      ...request,
      query: "evidence",
      registry: { sources: [request.source] },
    },
    dependencies,
  );
  assert.equal(searches, 1);
  assert.deepEqual(result.evidence, []);
  dependencies.publicationService.active = async () => new Map();
  await retrieval.search(
    {
      ...request,
      query: "evidence",
      registry: { sources: [request.source] },
    },
    dependencies,
  );
  assert.equal(searches, 1);
});

test("real publication orchestration replaces shortened and deleted content and preserves another source", async () => {
  const owner = require("../../../../nodics.discovery/modules/discoveryPublication/src/service/defaultDiscoveryGenerationPublicationService");
  const manifests = new Map();
  const documents = new Map();
  SERVICE.DefaultDiscoveryGenerationPublicationService = owner;
  SERVICE.DefaultDiscoveryRuntimeService = require("../../../../nodics.discovery/modules/discoveryRuntime/src/service/defaultDiscoveryRuntimeService");
  SERVICE.DefaultDiscoveryGenerationService = {
    get: async (r) => ({
      code: "SUC_DB",
      result: manifests.has(r.query.code)
        ? [structuredClone(manifests.get(r.query.code))]
        : [],
    }),
    save: async (r) => {
      if (manifests.has(r.model.code)) throw new Error("duplicate");
      manifests.set(r.model.code, structuredClone(r.model));
      return { code: "SUC_DB", result: r.model };
    },
    update: async (r) => {
      const current = manifests.get(r.query.code);
      const matched = current?.revision === r.query.revision;
      if (matched)
        manifests.set(r.query.code, {
          ...current,
          ...structuredClone(r.model),
        });
      return {
        code: "SUC_DB",
        result: { matchedCount: matched ? 1 : 0 },
      };
    },
  };
  const matches = (model, query) =>
    query.bool.filter.every((filter) => {
      const [key, value] = Object.entries(filter.term)[0];
      if (key.startsWith("payload."))
        return model.payload[key.split(".")[1]] === value;
      return model[key] === value;
    });
  SERVICE.DefaultDiscoveryDocumentProjectionService.doSearch = async (r) => ({
    code: "SUC_SEARCH",
    result: {
      timed_out: false,
      _shards: { failed: 0, successful: 1 },
      hits: {
        total: {
          value: [...documents.values()].filter((model) =>
            matches(model, r.query),
          ).length,
          relation: "eq",
        },
        hits: [],
      },
    },
  });
  SERVICE.DefaultDiscoveryDocumentProjectionService.doRemoveByQuery = async (
    r,
  ) => {
    let deleted = 0;
    for (const [code, model] of documents)
      if (matches(model, r.query)) {
        documents.delete(code);
        deleted++;
      }
    return {
      code: "SUC_SEARCH",
      result: {
        deleted,
        timed_out: false,
        version_conflicts: 0,
        failures: [],
      },
    };
  };
  const publish = async (input, contents) => {
    const projections = contents.map((content, index) => ({
      code: input.source.code + "|" + index,
      tenant: input.indexTenant,
      indexConfigurationCode: input.configuration.indexConfigurationCode,
      ownerType: "COPILOT_KNOWLEDGE",
      payload: { content },
    }));
    let claim = await service.begin(input, projections);
    for (const model of projections)
      claim = await service.write(input, claim, async () => {
        documents.set(model.code, model);
      });
    return service.finish(input, claim);
  };
  const other = { ...request, source: { ...request.source, code: "other" } };
  await publish(other, ["preserved"]);
  const first = await publish(request, ["old-long-chunk", "deleted-file"]);
  const second = await publish(request, ["shortened"]);
  assert.notEqual(first.generation, second.generation);
  assert.deepEqual(
    [...documents.values()].map((model) => model.payload.content).sort(),
    ["preserved", "shortened"],
  );
  await publish(request, []);
  assert.deepEqual(
    [...documents.values()].map((model) => model.payload.content),
    ["preserved"],
  );
  assert.equal(
    (await service.inspect(request, request.source)).state,
    "PROJECTED",
  );
  assert.equal((await service.inspect(other, other.source)).state, "PROJECTED");
});
