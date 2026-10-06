/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @file Exercises real Copilot, Discovery and Elasticsearch retirement owners with isolated persistence and provider transport. No live index is modified. */
"use strict";
const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const { isDeepStrictEqual } = require("node:util");
const migration = require("../src/service/defaultCopilotKnowledgeMigrationService");
const statusDefinitions = require("../src/utils/statusDefinitions");
const runtime = require("../src/service/defaultCopilotKnowledgeRuntimeService");
const discovery = require("../../../../nodics.discovery/modules/discoveryPublication/src/service/defaultDiscoveryIndexRetirementService");
const elastic = require("../../../../nodics.foundation/modules/nSearch/elastic/src/service/defaultElasticIndexRetirementService");
const elasticModel =
  require("../../../../nodics.foundation/modules/nSearch/elastic/src/schemas/elasticSearchModel").default;
const receipt = require("../../../../nodics.foundation/modules/nDatabase/database/src/service/schema/defaultModelCommandReceiptService");
const durableUpdate = require("../../../../nodics.foundation/modules/nDatabase/database/src/service/procs/update/defaultModelsUpdateInitializerService");
let configuration,
  request,
  rows,
  oldModel,
  newModel,
  blocked,
  barrierCalls,
  uuid,
  manifest,
  count,
  indices,
  lostBlock,
  lostSave,
  lostCompletion,
  failBlock;
let connection,
  removed,
  deleteCalls,
  invalidated,
  autoCreate,
  lostDelete,
  denyDelete;
test("migration refusal uses its own bounded recovery message", () => {
  assert.throws(() => migration.fail(), /ERR_CPK_00025/);
  assert.equal(statusDefinitions.ERR_CPK_00025.code, "503");
  assert.match(statusDefinitions.ERR_CPK_00025.message, /original operation/);
  assert.doesNotMatch(
    statusDefinitions.ERR_CPK_00025.message,
    /Pending refresh/,
  );
});
test("shared inspection messages describe retirement and erasure without confusing their outcomes", () => {
  const copy = require("../config/properties").copilot.knowledge.legacyMigration
    .presentation;
  assert.match(copy.unavailable, /Original operation evidence/);
  assert.match(copy.notStarted, /No original operation/);
  assert.doesNotMatch(copy.unavailable + copy.notStarted, /retirement/i);
  assert.match(copy.notStarted, /does not authorize retrying/);
});
/** Matches isolated generated persistence, including erasure CAS, without a real database. */
function matches(row, query) {
  return Object.entries(query).every(([key, value]) => {
    const actual = key.split(".").reduce((item, part) => item?.[part], row);
    return value === null ? actual == null : isDeepStrictEqual(actual, value);
  });
}
beforeEach(() => {
  configuration = structuredClone(require("../config/properties").copilot);
  configuration.policy = structuredClone(
    require("../../copilotPolicy/config/properties").copilot.policy,
  );
  configuration.knowledge.generationPublication.enabled = true;
  configuration.knowledge.legacyMigration.enabled = true;
  configuration.knowledge.legacyMigration.plans.move = {
    label: "Retire old knowledge",
    tenantCode: "tenant",
    enterpriseCode: "enterprise",
    legacyIndexName: "legacyKnowledge",
    sourceCodes: ["source"],
  };
  configuration.knowledge.sourceRegistry.definitions = [
    {
      code: "source",
      repository: "repo",
      project: "project",
      module: "module",
      owner: "module",
      version: "v1",
      sourceType: "README",
      classification: "INTERNAL",
      paths: ["README.md"],
      allowedChannels: ["EMPLOYEE"],
      requiredPermissions: ["copilot.knowledge.internal.read"],
      enterpriseScopes: ["enterprise"],
      secretScanPolicy: "REQUIRED",
      enabled: true,
    },
  ];
  request = {
    tenant: "tenant",
    migrationCode: "move",
    body: {},
    authData: { loginId: "employee" },
    securityContext: {
      channel: "EMPLOYEE",
      tenant: "tenant",
      enterprise: "enterprise",
      actor: "employee",
      permissions: [
        "copilot.knowledge.internal.read",
        "copilot.knowledge.source.manage",
        "copilot.knowledge.migration.read",
        "copilot.knowledge.migration.execute",
      ],
    },
  };
  rows = new Map();
  blocked = false;
  barrierCalls = 0;
  uuid = "immutable_index_uuid_123";
  count = 2;
  lostBlock = false;
  lostSave = false;
  lostCompletion = false;
  failBlock = false;
  removed = false;
  deleteCalls = 0;
  invalidated = true;
  autoCreate = false;
  lostDelete = false;
  denyDelete = false;
  indices = {
    get: async (input, options) => {
      assert.equal(options.maxRetries, 0);
      assert.equal(input.index, "legacy-physical");
      assert.equal(input.expand_wildcards, "none");
      if (removed)
        throw Object.assign(new Error("missing index"), {
          meta: {
            statusCode: 404,
            body: {
              error: { type: "index_not_found_exception", index: input.index },
            },
          },
        });
      return {
        "legacy-physical": {
          aliases: {},
          settings: {
            "index.uuid": uuid,
            "index.blocks.write": String(blocked),
          },
        },
      };
    },
    addBlock: async (input, options) => {
      assert.equal(options.maxRetries, 0);
      assert.equal(input.index, "legacy-physical");
      assert.equal(input.block, "write");
      barrierCalls++;
      blocked = true;
      if (lostBlock) throw new Error("response lost");
      return {
        acknowledged: true,
        shards_acknowledged: !failBlock,
        indices: [{ name: input.index, blocked: true }],
      };
    },
    delete: async (input, options) => {
      assert.equal(options.maxRetries, 0);
      assert.equal(input.index, "legacy-physical");
      assert.equal(input.expand_wildcards, "none");
      deleteCalls++;
      if (!denyDelete) removed = true;
      if (lostDelete) throw new Error("delete response lost");
      return { acknowledged: !denyDelete };
    },
  };
  connection = {
    indices,
    security: {
      getApiKey: async ({ id }) => ({ api_keys: [{ id, invalidated }] }),
    },
    cluster: {
      getSettings: async () => ({
        persistent: { "action.auto_create_index": autoCreate },
      }),
    },
  };
  oldModel = {
    indexDef: {
      indexName: "legacy-physical",
      retirement: {
        dedicated: true,
        immutablePhysicalName: true,
        ownerType: "COPILOT_KNOWLEDGE",
        tenantCode: "tenant",
        enterpriseCode: "enterprise",
        erasure: {
          writerInventoryComplete: true,
          writerCredentialMode: "API_KEY_ONLY",
          writerApiKeyIds: ["old_writer_key"],
        },
      },
    },
    searchEngine: { getConnection: () => connection },
  };
  elasticModel.defineDefaultIndexRetirement(oldModel);
  newModel = { indexDef: { indexName: "replacement-physical" } };
  global.CLASSES = { NodicsError: class extends Error {} };
  global.CONFIG = { get: () => configuration };
  global.SERVICE = {
    DefaultElasticIndexRetirementService: elastic,
    DefaultModelCommandReceiptService: receipt,
    DefaultCopilotKnowledgeMigrationService: migration,
    DefaultCopilotKnowledgeRuntimeService: {
      ...runtime,
      configuration: () => configuration,
    },
    DefaultCopilotKnowledgeCleanupService: require("../src/service/defaultCopilotKnowledgeCleanupService"),
    DefaultCopilotKnowledgePublicationService: require("../src/service/defaultCopilotKnowledgePublicationService"),
    DefaultCopilotKnowledgeSourceRegistryService: require("../src/service/defaultCopilotKnowledgeSourceRegistryService"),
    DefaultCopilotPolicyService: require("../../copilotPolicy/src/service/defaultCopilotPolicyService"),
    DefaultDiscoveryIndexRetirementService: discovery,
    DefaultDiscoveryDocumentProjectionService: {
      getSearchModel: (input) =>
        input.indexName === "legacyKnowledge" ? oldModel : newModel,
    },
    DefaultDiscoveryGenerationPublicationService: {
      read: async () => structuredClone(manifest),
      count: async () => count,
    },
    DefaultDiscoveryIndexRetirementReceiptService: {
      get: async (input) => {
        assert.equal(input.internalPersistence, "DURABLE_JOURNAL");
        return {
          code: "SUC_DB",
          result: [...rows.values()]
            .filter((row) => matches(row, input.query))
            .map((row) => structuredClone(row)),
        };
      },
      save: async (input) => {
        assert.equal(input.options.insertOnly, true);
        assert.equal(input.internalPersistence, "DURABLE_JOURNAL");
        if (rows.has(input.model.code)) throw new Error("duplicate key");
        input.model._id = { nativeInsertIdentity: "provider-added" };
        rows.set(input.model.code, structuredClone(input.model));
        if (lostSave) throw new Error("claim response lost");
        return { code: "SUC_DB", result: input.model };
      },
      update: async (input) => {
        const result = await durableUpdate.updateDurableJournal({
          ...input,
          schemaModel: {
            rawSchema: {
              router: { enabled: false },
              cache: { enabled: false },
              event: { enabled: false },
            },
            persistenceCapabilities: () => ({
              contractVersion: 1,
              durableJournal: true,
              primaryMajorityReadback: true,
            }),
            compareAndSetItem: async ({ query, model }) => {
              const row = rows.get(query.code);
              if (!row || !matches(row, query)) return null;
              const updated = { ...row, ...structuredClone(model) };
              rows.set(row.code, updated);
              return updated;
            },
          },
        });
        if (lostCompletion) throw new Error("completion response lost");
        return { code: "SUC_DB", result };
      },
    },
  };
  manifest = {
    revision: 4,
    pendingGeneration: null,
    currentGeneration: {
      digest:
        migration.authorize(request).selections[0].source.sourcePolicyDigest,
      token: "11111111-1111-4111-8111-111111111111",
      count: 2,
      writer: { state: "SEALED", completed: 2 },
    },
  };
});
/** Builds only the reviewed public command, never provider topology. */
function command(review) {
  return {
    ...request,
    body: { confirmed: true, reviewDigest: review.reviewDigest },
  };
}
test("native barrier follows verified replacement and durable claim; original inspection works with writes disabled", async () => {
  const review = await migration.preview(request);
  assert.equal(review.sourceCount, 1);
  assert.equal(rows.size, 0);
  assert.equal(barrierCalls, 0);
  assert.ok(!JSON.stringify(review).includes(uuid));
  const result = await migration.execute(command(review));
  assert.equal(result.state, "RETIRED");
  assert.equal(result.physicalCleanupComplete, false);
  assert.equal(result.retainedLegacyData, true);
  configuration.knowledge.legacyMigration.enabled = false;
  assert.equal((await migration.inspect(request)).state, "RETIRED");
  await assert.rejects(migration.execute(command(review)));
  assert.equal(barrierCalls, 1);
});
test("absent grants, foreign scope, aliases, unqualified shared indexes and disabled commands never write", async () => {
  configuration.knowledge.legacyMigration.enabled = false;
  await assert.rejects(migration.preview(request));
  configuration.knowledge.legacyMigration.enabled = true;
  const grants = request.securityContext.permissions;
  request.securityContext.permissions = [];
  await assert.rejects(migration.preview(request));
  request.securityContext.permissions = grants;
  configuration.knowledge.legacyMigration.plans.move.enterpriseCode = "foreign";
  assert.equal(migration.inventory(request), null);
  await assert.rejects(migration.preview(request));
  configuration.knowledge.legacyMigration.plans.move.enterpriseCode =
    "enterprise";
  oldModel.indexDef.retirement.dedicated = false;
  await assert.rejects(migration.preview(request));
  oldModel.indexDef.retirement.dedicated = true;
  const get = indices.get;
  indices.get = async (input, options) => {
    const result = await get(input, options);
    result["legacy-physical"].aliases = { live: {} };
    return result;
  };
  await assert.rejects(migration.preview(request));
  assert.equal(barrierCalls, 0);
});
test("incomplete, stale, unsealed or same-physical-index replacement fails closed", async () => {
  count = 1;
  await assert.rejects(migration.preview(request));
  count = 2;
  manifest.pendingGeneration = {};
  await assert.rejects(migration.preview(request));
  manifest.pendingGeneration = null;
  manifest.currentGeneration.writer.state = "WRITING";
  await assert.rejects(migration.preview(request));
  manifest.currentGeneration.writer.state = "SEALED";
  const digest = manifest.currentGeneration.digest;
  manifest.currentGeneration.digest = "f".repeat(64);
  await assert.rejects(migration.preview(request));
  manifest.currentGeneration.digest = digest;
  newModel.indexDef.indexName = "legacy-physical";
  await assert.rejects(migration.preview(request));
  assert.equal(rows.size, 0);
  assert.equal(barrierCalls, 0);
});
test("replacement revision, UUID, policy and extra browser fields invalidate an old review", async () => {
  const review = await migration.preview(request);
  manifest.revision++;
  await assert.rejects(migration.execute(command(review)));
  manifest.revision--;
  const original = uuid;
  uuid = "new_immutable_uuid_456";
  await assert.rejects(migration.execute(command(review)));
  uuid = original;
  configuration.knowledge.sourceRegistry.definitions[0].version = "v2";
  await assert.rejects(migration.execute(command(review)));
  configuration.knowledge.sourceRegistry.definitions[0].version = "v1";
  await assert.rejects(
    migration.execute({
      ...command(review),
      body: { ...command(review).body, index: "forged" },
    }),
  );
  assert.equal(barrierCalls, 0);
});
test("concurrent original commands produce one barrier across the global private index claim", async () => {
  const review = await migration.preview(request);
  const results = await Promise.allSettled([
    migration.execute(command(review)),
    migration.execute(command(review)),
  ]);
  assert.equal(
    results.filter((result) => result.status === "fulfilled").length,
    1,
  );
  assert.equal(barrierCalls, 1);
  assert.equal(rows.size, 1);
});
test("lost claim or shard acknowledgement remains uncertain and never replays", async () => {
  const review = await migration.preview(request);
  lostSave = true;
  await assert.rejects(migration.execute(command(review)));
  assert.equal(barrierCalls, 0);
  assert.equal((await migration.inspect(request)).state, "OUTCOME_UNKNOWN");
  lostSave = false;
  await assert.rejects(migration.execute(command(review)));
  assert.equal(barrierCalls, 0);
});
test("provider timeout and partial shard acknowledgement cannot be reconstructed from block metadata", async () => {
  const review = await migration.preview(request);
  lostBlock = true;
  await assert.rejects(migration.execute(command(review)));
  assert.equal(blocked, true);
  assert.equal((await migration.inspect(request)).state, "OUTCOME_UNKNOWN");
  await assert.rejects(migration.execute(command(review)));
  assert.equal(barrierCalls, 1);
});
test("failed shard barrier is not a completed retirement", async () => {
  const review = await migration.preview(request);
  failBlock = true;
  await assert.rejects(migration.execute(command(review)));
  assert.equal((await migration.inspect(request)).state, "OUTCOME_UNKNOWN");
});
test("lost durable completion response is recovered by read-only original inspection", async () => {
  const review = await migration.preview(request);
  lostCompletion = true;
  await assert.rejects(migration.execute(command(review)));
  assert.equal((await migration.inspect(request)).state, "RETIRED");
  assert.equal(barrierCalls, 1);
  blocked = false;
  assert.equal((await migration.inspect(request)).state, "OUTCOME_UNKNOWN");
});
test("revoked authority after claim prevents dispatch, and foreign actors cannot inspect original evidence", async () => {
  const review = await migration.preview(request);
  const save = SERVICE.DefaultDiscoveryIndexRetirementReceiptService.save;
  SERVICE.DefaultDiscoveryIndexRetirementReceiptService.save = async (
    input,
  ) => {
    const result = await save(input);
    request.securityContext.permissions = [];
    return result;
  };
  await assert.rejects(migration.execute(command(review)));
  assert.equal(barrierCalls, 0);
  request.securityContext.permissions = [
    "copilot.knowledge.internal.read",
    "copilot.knowledge.source.manage",
    "copilot.knowledge.migration.read",
  ];
  request.securityContext.actor = "other";
  request.authData.loginId = "other";
  await assert.rejects(migration.inspect(request));
});
/** Qualifies a synthetic retired original; no real index or credential is modified. */
async function retired() {
  await migration.execute(command(await migration.preview(request)));
  configuration.knowledge.legacyMigration.erasureEnabled = true;
  request.securityContext.permissions.push("copilot.knowledge.migration.erase");
}
test("separate erasure review records exact one-shot removal and remains inspectable after disabling writes", async () => {
  await retired();
  const review = await migration.previewErasure(request);
  assert.equal(review.state, "REVIEWED");
  assert.ok(!JSON.stringify(review).includes("old_writer_key"));
  const result = await migration.erase(command(review));
  assert.equal(result.state, "ERASED");
  assert.equal(result.physicalCleanupComplete, true);
  assert.equal(result.retainedLegacyData, false);
  configuration.knowledge.legacyMigration.enabled = false;
  configuration.knowledge.legacyMigration.erasureEnabled = false;
  assert.equal((await migration.inspectErasure(request)).state, "ERASED");
  await assert.rejects(migration.erase(command(review)));
  assert.equal(deleteCalls, 1);
});
test("erasure requires its independent grant, gate, complete revoked writer inventory and disabled automatic creation", async () => {
  await retired();
  const policy = oldModel.indexDef.retirement.erasure;
  configuration.knowledge.legacyMigration.erasureEnabled = false;
  await assert.rejects(migration.previewErasure(request));
  configuration.knowledge.legacyMigration.erasureEnabled = true;
  request.securityContext.permissions.pop();
  await assert.rejects(migration.previewErasure(request));
  request.securityContext.permissions.push("copilot.knowledge.migration.erase");
  invalidated = false;
  await assert.rejects(migration.previewErasure(request));
  invalidated = true;
  autoCreate = true;
  await assert.rejects(migration.previewErasure(request));
  autoCreate = false;
  policy.writerInventoryComplete = false;
  await assert.rejects(migration.previewErasure(request));
  policy.writerInventoryComplete = true;
  policy.writerApiKeyIds = [];
  await assert.rejects(migration.previewErasure(request));
  policy.writerApiKeyIds = ["old_writer_key"];
  connection.security.getApiKey = async () => ({ api_keys: [] });
  await assert.rejects(migration.previewErasure(request));
  assert.equal(deleteCalls, 0);
});
test("erasure denies stale reviews, changed UUID, revoked source permission and browser-supplied topology", async () => {
  await retired();
  const review = await migration.previewErasure(request);
  manifest.revision++;
  await assert.rejects(migration.erase(command(review)));
  manifest.revision--;
  uuid = "other_immutable_uuid_456";
  await assert.rejects(migration.erase(command(review)));
  uuid = "immutable_index_uuid_123";
  await assert.rejects(
    migration.erase({
      ...command(review),
      body: { ...command(review).body, index: "other" },
    }),
  );
  request.securityContext.permissions = ["copilot.knowledge.migration.erase"];
  await assert.rejects(migration.erase(command(review)));
  assert.equal(deleteCalls, 0);
});
test("erasure claims exclude concurrent deletes and never infer completion from absent bytes after response loss", async () => {
  await retired();
  const review = await migration.previewErasure(request);
  lostDelete = true;
  await Promise.allSettled([
    migration.erase(command(review)),
    migration.erase(command(review)),
  ]);
  assert.equal(deleteCalls, 1);
  assert.equal(
    (await migration.inspectErasure(request)).state,
    "OUTCOME_UNKNOWN",
  );
  assert.equal(
    (await migration.inspectErasure(request)).retainedLegacyData,
    null,
  );
  await assert.rejects(migration.erase(command(review)));
  assert.equal(deleteCalls, 1);
});
test("lost erasure completion acknowledgement is recoverable by original evidence and not by replay", async () => {
  await retired();
  const review = await migration.previewErasure(request);
  const update = SERVICE.DefaultDiscoveryIndexRetirementReceiptService.update;
  SERVICE.DefaultDiscoveryIndexRetirementReceiptService.update = async (
    input,
  ) => {
    const result = await update(input);
    if (input.model.erasure?.state === "ERASED") throw new Error("ack lost");
    return result;
  };
  await assert.rejects(migration.erase(command(review)));
  assert.equal((await migration.inspectErasure(request)).state, "ERASED");
  await assert.rejects(migration.erase(command(review)));
  assert.equal(deleteCalls, 1);
});
test("revocation at erasure claim and recreated index never report removal", async () => {
  await retired();
  const review = await migration.previewErasure(request);
  const update = SERVICE.DefaultDiscoveryIndexRetirementReceiptService.update;
  SERVICE.DefaultDiscoveryIndexRetirementReceiptService.update = async (
    input,
  ) => {
    const result = await update(input);
    invalidated = false;
    return result;
  };
  await assert.rejects(migration.erase(command(review)));
  assert.equal(deleteCalls, 0);
  assert.equal(
    (await migration.inspectErasure(request)).state,
    "OUTCOME_UNKNOWN",
  );
  removed = false;
  uuid = "recreated_index_uuid_789";
  await assert.rejects(migration.inspectErasure(request));
});
test("lost erasure claim acknowledgement prevents deletion and repeat execution", async () => {
  await retired();
  const review = await migration.previewErasure(request);
  lostCompletion = true;
  await assert.rejects(migration.erase(command(review)));
  assert.equal(deleteCalls, 0);
  lostCompletion = false;
  assert.equal(
    (await migration.inspectErasure(request)).state,
    "OUTCOME_UNKNOWN",
  );
  await assert.rejects(migration.erase(command(review)));
});
test("negative deletion acknowledgement and generic 404 never prove erasure", async () => {
  await retired();
  const review = await migration.previewErasure(request);
  denyDelete = true;
  await assert.rejects(migration.erase(command(review)));
  assert.equal(
    (await migration.inspectErasure(request)).state,
    "OUTCOME_UNKNOWN",
  );
  indices.get = async () => {
    throw Object.assign(new Error("proxy missing"), {
      meta: { statusCode: 404 },
    });
  };
  await assert.rejects(migration.inspectErasure(request));
  assert.equal(deleteCalls, 1);
});
test("completed erasure rejects a changed physical binding even when the new name is absent", async () => {
  await retired();
  await migration.erase(command(await migration.previewErasure(request)));
  oldModel.indexDef.indexName = "another-physical";
  indices.get = async ({ index }) => {
    throw Object.assign(new Error("missing"), {
      meta: {
        statusCode: 404,
        body: { error: { type: "index_not_found_exception", index } },
      },
    });
  };
  await assert.rejects(migration.inspectErasure(request));
  assert.equal(deleteCalls, 1);
});
test("native erasure refuses a provider connection changed during the final owner guard", async () => {
  await retired();
  await assert.rejects(
    oldModel.eraseRetiredIndex({
      expectedUUID: uuid,
      assertCurrent: async () => {
        connection = { ...connection };
      },
    }),
  );
  assert.equal(deleteCalls, 0);
  assert.equal(removed, false);
});
