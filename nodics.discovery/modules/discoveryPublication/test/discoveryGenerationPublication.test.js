/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @file Proves publication isolation, CAS, explicit uncertainty recovery and exact-generation cleanup using generated-service fixtures. */
"use strict";
const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const service = require("../src/service/defaultDiscoveryGenerationPublicationService");
const runtime = require("../../discoveryRuntime/src/service/defaultDiscoveryRuntimeService");
let records, request, removed;
test("guarded retirement prevents new dispatch and requires exact acknowledged completion of an in-flight write", async () => {
  request.guardedWrites = true;
  const claim = await service.begin(request, {
    digest: "a".repeat(64),
    count: 2,
  });
  const writing = await service.startWrite(request, claim);
  const token = writing.pendingGeneration.token;
  await assert.rejects(service.sealWriter(request, writing));
  const retired = await service.abandon(request, writing.revision, token);
  assert.deepEqual(service.cleanupTokens(retired), []);
  await service.cleanup(request);
  assert.equal(removed.length, 0);
  await assert.rejects(service.startWrite(request, claim));
  const next = await service.begin(request, {
    digest: "b".repeat(64),
    count: 1,
  });
  const completed = await service.completeWrite(request, writing);
  assert.equal(completed.pendingGeneration.token, next.pendingGeneration.token);
  assert.deepEqual(service.cleanupTokens(completed), [token]);
  await assert.rejects(service.completeWrite(request, writing));
  await assert.rejects(
    service.read({ ...request, guardedWrites: false }),
    /GUARDED_WRITES_REQUIRED/,
  );
  const cleaned = await service.cleanup(request);
  assert.equal(removed.length, 1);
  assert.deepEqual(cleaned.retiredWriters, {});
  assert.equal(cleaned.pendingGeneration.token, next.pendingGeneration.token);
});
test("idle retirement is quiescent, legacy retirement is not and sealed publication forbids additional writes", async () => {
  const legacy = await service.begin(request, {
    digest: "a".repeat(64),
    count: 1,
  });
  await service.abandon(
    request,
    legacy.revision,
    legacy.pendingGeneration.token,
  );
  request.guardedWrites = true;
  const claim = await service.begin(request, {
    digest: "a".repeat(64),
    count: 1,
  });
  const retired = await service.abandon(
    request,
    claim.revision,
    claim.pendingGeneration.token,
  );
  assert.deepEqual(service.cleanupTokens(retired), [
    claim.pendingGeneration.token,
  ]);
  assert.deepEqual(service.cleanupTokens(retired, { publishedOnly: true }), []);
  const cleaned = await service.cleanup(request);
  assert.deepEqual(cleaned.obsoleteGenerations, [
    legacy.pendingGeneration.token,
  ]);
  const active = await service.begin(request, {
    digest: "a".repeat(64),
    count: 1,
  });
  await assert.rejects(service.publish(request, active));
  await assert.rejects(service.sealWriter(request, active));
  const done = await service.completeWrite(
    request,
    await service.startWrite(request, active),
  );
  const sealed = await service.sealWriter(request, done);
  await assert.rejects(service.startWrite(request, sealed));
  await service.publish(request, sealed);
});
test("lost write-claim acknowledgement leaves no dispatch authority and cannot qualify cleanup by age", async () => {
  request.guardedWrites = true;
  const claim = await service.begin(request, {
    digest: "a".repeat(64),
    count: 1,
  });
  const update = SERVICE.DefaultDiscoveryGenerationService.update;
  SERVICE.DefaultDiscoveryGenerationService.update = async (r) => {
    assert.equal(r.internalPersistence, "DURABLE_JOURNAL");
    await update(r);
    return { code: "SUC_DB", result: { matchedCount: 1, acknowledged: false } };
  };
  await assert.rejects(service.startWrite(request, claim), /UNCONFIRMED/);
  SERVICE.DefaultDiscoveryGenerationService.update = update;
  const uncertain = await service.read(request);
  const retired = await service.abandon(
    request,
    uncertain.revision,
    uncertain.pendingGeneration.token,
  );
  assert.deepEqual(service.cleanupTokens(retired), []);
  await service.cleanup(request);
  assert.equal(removed.length, 0);
});
beforeEach(() => {
  records = new Map();
  removed = [];
  request = {
    tenant: "tenant",
    indexName: "projection",
    indexConfigurationCode: "knowledge",
    ownerType: "KNOWLEDGE",
    ownerCode: "source",
  };
  global.SERVICE = {
    DefaultDiscoveryGenerationService: {
      get: async (r) => ({
        code: "SUC_DB",
        result: records.has(r.query.code)
          ? [structuredClone(records.get(r.query.code))]
          : [],
      }),
      save: async (r) => {
        if (records.has(r.model.code)) throw new Error("duplicate");
        records.set(r.model.code, structuredClone(r.model));
        return { code: "SUC_DB", result: r.model };
      },
      update: async (r) => {
        const current = records.get(r.query.code);
        const matched = current?.revision === r.query.revision;
        if (matched)
          records.set(r.query.code, {
            ...current,
            ...structuredClone(r.model),
          });
        return {
          code: "SUC_DB",
          result: { matchedCount: matched ? 1 : 0 },
        };
      },
    },
    DefaultDiscoveryRuntimeService: runtime,
    DefaultDiscoveryDocumentProjectionService: {
      doRemoveByQuery: async (r) => {
        removed.push(r);
        return {
          code: "SUC_SEARCH",
          result: {
            deleted: 4,
            version_conflicts: 0,
            failures: [],
            timed_out: false,
          },
        };
      },
    },
  };
});
test("one concurrent writer wins, current generation remains stable until publication and exact obsolete generation is removed", async () => {
  const attempts = await Promise.allSettled([
    service.begin(request, { digest: "a".repeat(64), count: 2 }),
    service.begin(request, { digest: "a".repeat(64), count: 2 }),
  ]);
  assert.equal(
    attempts.filter((result) => result.status === "fulfilled").length,
    1,
  );
  const claimed = attempts.find(
    (result) => result.status === "fulfilled",
  ).value;
  assert.equal((await service.read(request)).currentGeneration, null);
  const first = await service.publish(request, claimed);
  const next = await service.begin(request, {
    digest: "b".repeat(64),
    count: 0,
  });
  assert.equal(next.currentGeneration.token, first.currentGeneration.token);
  await assert.rejects(service.publish(request, claimed));
  await service.publish(request, next);
  const cleaned = await service.cleanup(request);
  assert.deepEqual(cleaned.obsoleteGenerations, []);
  assert.equal(removed.length, 1);
  assert.ok(
    JSON.stringify(removed[0].query).includes(first.currentGeneration.token),
  );
  assert.ok(
    !JSON.stringify(removed[0].query).includes(next.pendingGeneration.token),
  );
  assert.equal(removed[0].tenant, "tenant");
  assert.equal(removed[0].options.conflicts, "abort");
});
test("uncertain transition acknowledgement gives no publication authority; explicit abandonment fences the old writer", async () => {
  const claimed = await service.begin(request, {
    digest: "a".repeat(64),
    count: 3,
  });
  await assert.rejects(
    service.begin(request, { digest: "a".repeat(64), count: 3 }),
    /INSPECTION_REQUIRED/,
  );
  await assert.rejects(
    service.abandon(
      request,
      claimed.revision - 1,
      claimed.pendingGeneration.token,
    ),
  );
  await service.abandon(
    request,
    claimed.revision,
    claimed.pendingGeneration.token,
  );
  await assert.rejects(service.publish(request, claimed));
  const fresh = await service.begin(request, {
    digest: "a".repeat(64),
    count: 1,
  });
  const update = SERVICE.DefaultDiscoveryGenerationService.update;
  SERVICE.DefaultDiscoveryGenerationService.update = async (r) => {
    await update(r);
    return { code: "SUC_DB" };
  };
  await assert.rejects(service.publish(request, fresh), /UNCONFIRMED/);
  assert.equal(
    (await service.read(request)).currentGeneration.token,
    fresh.pendingGeneration.token,
  );
});
test("foreign or malformed persistence and contradictory deletion acknowledgements fail closed", async () => {
  const claimed = await service.begin(request, {
    digest: "a".repeat(64),
    count: 1,
  });
  const key = claimed.code;
  records.get(key).tenantCode = "other";
  await assert.rejects(service.read(request), /EVIDENCE_INVALID/);
  records.get(key).tenantCode = "tenant";
  await service.publish(request, claimed);
  const next = await service.begin(request, {
    digest: "b".repeat(64),
    count: 1,
  });
  await service.publish(request, next);
  SERVICE.DefaultDiscoveryDocumentProjectionService.doRemoveByQuery =
    async () => ({
      code: "SUC_SEARCH",
      result: {
        deleted: 1,
        timed_out: false,
        failures: [],
        version_conflicts: 1,
      },
    });
  await assert.rejects(service.cleanup(request), /CLEANUP_UNCONFIRMED/);
  assert.equal((await service.read(request)).obsoleteGenerations.length, 1);
  assert.throws(() => service.scope({ ...request, ownerCode: "*" }));
});
test("index probes require an exact hits total and reject lower-bound or malformed counts", async () => {
  const claimed = await service.begin(request, {
    digest: "a".repeat(64),
    count: 5,
  });
  SERVICE.DefaultDiscoveryDocumentProjectionService.doSearch = async (r) => {
    assert.equal(r.options.track_total_hits, true);
    return {
      code: "SUC_SEARCH",
      result: {
        timed_out: false,
        _shards: { failed: 0, successful: 1 },
        hits: { total: { value: 5, relation: "eq" }, hits: [] },
      },
    };
  };
  assert.equal(
    await service.count(request, claimed.pendingGeneration.token),
    5,
  );
  SERVICE.DefaultDiscoveryDocumentProjectionService.doSearch = async () => ({
    code: "SUC_SEARCH",
    result: { hits: { total: { value: 5, relation: "gte" }, hits: [] } },
  });
  await assert.rejects(
    service.count(request, claimed.pendingGeneration.token),
    /COUNT_UNCONFIRMED/,
  );
});

test("durable unchanged evidence survives service reconstruction and requires current policy, content, exact physical count and stable revision", async () => {
  const descriptor = {
    digest: "a".repeat(64),
    contentDigest: "b".repeat(64),
    count: 2,
  };
  const published = await service.publish(
    request,
    await service.begin(request, descriptor),
  );
  const restarted = { ...service, count: async () => 2 };
  let checked = 0;
  const evidence = await restarted.unchanged(request, descriptor, {
    assertCurrent: () => {
      checked++;
    },
  });
  assert.equal(
    evidence.currentGeneration.token,
    published.currentGeneration.token,
  );
  assert.equal(evidence.revision, published.revision);
  assert.equal(checked, 1);
  assert.equal(removed.length, 0);
  assert.equal(
    await restarted.unchanged(request, {
      ...descriptor,
      digest: "c".repeat(64),
    }),
    null,
  );
  assert.equal(
    await restarted.unchanged(request, {
      ...descriptor,
      contentDigest: "c".repeat(64),
    }),
    null,
  );
  assert.equal(
    await restarted.unchanged(request, { ...descriptor, count: 1 }),
    null,
  );
  restarted.count = async () => 1;
  assert.equal(await restarted.unchanged(request, descriptor), null);
  restarted.count = async () => 2;
  await assert.rejects(
    restarted.unchanged(request, descriptor, {
      assertCurrent: () => {
        throw new Error("revoked");
      },
    }),
    /revoked/,
  );
  delete records.get(published.code).currentGeneration.contentDigest;
  assert.equal(await restarted.unchanged(request, descriptor), null);
  records.get(published.code).currentGeneration.contentDigest =
    descriptor.contentDigest;
  restarted.count = async () => {
    records.get(published.code).revision++;
    return 2;
  };
  await assert.rejects(
    restarted.unchanged(request, descriptor),
    /REVIEW_STALE/,
  );
  await service.begin(request, descriptor);
  await assert.rejects(
    restarted.unchanged(request, descriptor),
    /INSPECTION_REQUIRED/,
  );
});

test("empty published sources support verified unchanged evidence and malformed fingerprint never persists", async () => {
  const descriptor = {
    digest: "a".repeat(64),
    contentDigest: "b".repeat(64),
    count: 0,
  };
  const published = await service.publish(
    request,
    await service.begin(request, descriptor),
  );
  const inspecting = { ...service, count: async () => 0 };
  assert.equal(
    (await inspecting.unchanged(request, descriptor)).currentGeneration.token,
    published.currentGeneration.token,
  );
  await assert.rejects(
    service.begin(request, { ...descriptor, contentDigest: "invalid" }),
  );
  assert.equal((await service.read(request)).pendingGeneration, null);
});

test("reviewed cleanup removes only proven published origins and rejects stale review before any deletion", async () => {
  const first = await service.begin(request, {
    digest: "a".repeat(64),
    count: 1,
  });
  await service.publish(request, first);
  const abandoned = await service.begin(request, {
    digest: "b".repeat(64),
    count: 1,
  });
  await service.abandon(
    request,
    abandoned.revision,
    abandoned.pendingGeneration.token,
  );
  const second = await service.begin(request, {
    digest: "c".repeat(64),
    count: 1,
  });
  const published = await service.publish(request, second);
  await assert.rejects(
    service.cleanup(request, {
      publishedOnly: true,
      expectedRevision: published.revision - 1,
    }),
  );
  assert.equal(removed.length, 0);
  let checks = 0;
  const result = await service.cleanup(request, {
    publishedOnly: true,
    expectedRevision: published.revision,
    assertCurrent: () => {
      checks++;
    },
  });
  assert.equal(checks, 1);
  assert.equal(removed.length, 1);
  assert.ok(
    JSON.stringify(removed[0].query).includes(first.pendingGeneration.token),
  );
  assert.deepEqual(result.obsoleteGenerations, [
    abandoned.pendingGeneration.token,
  ]);
  assert.deepEqual(result.publishedObsoleteGenerations, []);
});
