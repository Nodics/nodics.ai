/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @file Exercises reviewed retirement through real Discovery CAS without a running worker or index mutation. */
"use strict";
const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const recovery = require("../src/service/defaultCopilotKnowledgeWriterRecoveryService");
const cleanup = require("../src/service/defaultCopilotKnowledgeCleanupService");
const runtime = require("../src/service/defaultCopilotKnowledgeRuntimeService");
const owner = require("../../../../nodics.discovery/modules/discoveryPublication/src/service/defaultDiscoveryGenerationPublicationService");
let request, configuration, records, receipts, scope, claimed, updates;
beforeEach(async () => {
  configuration = structuredClone(require("../config/properties").copilot);
  configuration.policy = structuredClone(
    require("../../copilotPolicy/config/properties").copilot.policy,
  );
  configuration.knowledge.generationPublication.enabled = true;
  configuration.knowledge.writerRecovery.enabled = true;
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
    sourceCode: "source",
    body: {},
    authData: { loginId: "employee" },
    securityContext: {
      channel: "EMPLOYEE",
      actor: "employee",
      tenant: "tenant",
      enterprise: "enterprise",
      permissions: [
        "copilot.knowledge.internal.read",
        "copilot.knowledge.source.manage",
        "copilot.knowledge.recovery.execute",
      ],
    },
  };
  records = new Map();
  receipts = [];
  updates = 0;
  global.CLASSES = { NodicsError: class extends Error {} };
  global.CONFIG = { get: () => configuration };
  global.SERVICE = {
    DefaultCopilotKnowledgeCleanupService: cleanup,
    DefaultCopilotKnowledgeMaintenanceService: {
      save: async (r) => {
        receipts.push(structuredClone(r.model));
        return { code: "SUC_DB", result: r.model };
      },
    },
    DefaultCopilotPolicyService: require("../../copilotPolicy/src/service/defaultCopilotPolicyService"),
    DefaultCopilotKnowledgeSourceRegistryService: require("../src/service/defaultCopilotKnowledgeSourceRegistryService"),
    DefaultCopilotKnowledgeRuntimeService: {
      ...runtime,
      configuration: () => configuration,
    },
    DefaultCopilotKnowledgePublicationService: require("../src/service/defaultCopilotKnowledgePublicationService"),
    DefaultDiscoveryGenerationPublicationService: { ...owner },
    DefaultDiscoveryGenerationService: {
      get: async (r) => ({
        code: "SUC_DB",
        result: records.has(r.query.code)
          ? [structuredClone(records.get(r.query.code))]
          : [],
      }),
      save: async (r) => {
        assert.equal(records.has(r.model.code), false);
        records.set(r.model.code, structuredClone(r.model));
        return { code: "SUC_DB", result: r.model };
      },
      update: async (r) => {
        const current = records.get(r.query.code);
        const matched = current?.revision === r.query.revision;
        if (matched) {
          updates++;
          records.set(r.query.code, {
            ...current,
            ...structuredClone(r.model),
          });
        }
        return { code: "SUC_DB", result: { matchedCount: matched ? 1 : 0 } };
      },
    },
    DefaultDiscoveryDocumentProjectionService: {
      doRemoveByQuery: () => assert.fail("Retirement deleted data"),
    },
  };
  scope = recovery.authorize(request).scope;
  let published = await owner.begin(scope, {
    digest: "a".repeat(64),
    count: 2,
  });
  for (let index = 0; index < 2; index++)
    published = await owner.completeWrite(
      scope,
      await owner.startWrite(scope, published),
    );
  await owner.publish(scope, await owner.sealWriter(scope, published));
  claimed = await owner.begin(scope, { digest: "b".repeat(64), count: 3 });
  records.get(claimed.code).pendingGeneration.at = new Date(
    Date.now() - 600000,
  ).toISOString();
  claimed = await owner.read(scope);
  updates = 0;
});
/** Uses only owner-projected review values. */
function command(review) {
  return {
    ...request,
    body: {
      confirmed: true,
      expectedRevision: review.revision,
      expectedPolicyDigest: review.sourcePolicyDigest,
      reviewDigest: review.reviewDigest,
    },
  };
}
test("review is inert and hides generation identity; retirement preserves current knowledge and fences old publication", async () => {
  const review = await recovery.preview(request);
  assert.equal(review.eligible, true);
  assert.equal(review.expectedChunks, 3);
  assert.equal(updates, 0);
  assert.equal(receipts.length, 0);
  assert.ok(!JSON.stringify(review).includes(claimed.pendingGeneration.token));
  const result = await recovery.execute(command(review));
  assert.equal(result.state, "RETIRED");
  assert.equal(result.cleanupPending, true);
  const manifest = await owner.read(scope);
  assert.deepEqual(manifest.currentGeneration, claimed.currentGeneration);
  assert.equal(manifest.pendingGeneration, null);
  assert.deepEqual(manifest.publishedObsoleteGenerations, []);
  assert.deepEqual(manifest.obsoleteGenerations, [
    claimed.pendingGeneration.token,
  ]);
  await assert.rejects(owner.publish(scope, claimed));
  await assert.rejects(recovery.execute(command(review)));
  assert.equal(updates, 1);
  assert.deepEqual(
    receipts.map((r) => r.stage),
    ["WRITER_RETIREMENT_AUTHORIZED", "WRITER_RETIREMENT_COMPLETED"],
  );
});
test("disabled recovery, absent independent grant and foreign enterprise deny before manifest reads", async () => {
  SERVICE.DefaultDiscoveryGenerationPublicationService.read = () =>
    assert.fail("Denied read");
  configuration.knowledge.writerRecovery.enabled = false;
  await assert.rejects(recovery.preview(request));
  configuration.knowledge.writerRecovery.enabled = true;
  const context = structuredClone(request.securityContext);
  request.securityContext.permissions = [
    "copilot.knowledge.source.manage",
    "copilot.knowledge.internal.read",
  ];
  await assert.rejects(recovery.preview(request));
  request.securityContext = { ...context, enterprise: "foreign" };
  await assert.rejects(recovery.preview(request));
  assert.equal(updates, 0);
});
test("recent pending writers are inspectable but cannot be retired", async () => {
  records.get(claimed.code).pendingGeneration.at = new Date().toISOString();
  const review = await recovery.preview(request);
  assert.equal(review.eligible, false);
  await assert.rejects(recovery.execute(command(review)));
  assert.equal(updates, 0);
  assert.equal(receipts.length, 0);
});
test("stale revision, changed pending token, extra command fields and routing drift reject before mutation", async () => {
  const review = await recovery.preview(request);
  await assert.rejects(
    recovery.execute({
      ...command(review),
      body: { ...command(review).body, token: "forged" },
    }),
  );
  records.get(claimed.code).revision++;
  await assert.rejects(recovery.execute(command(review)));
  records.get(claimed.code).revision--;
  records.get(claimed.code).pendingGeneration.token =
    require("node:crypto").randomUUID();
  await assert.rejects(recovery.execute(command(review)));
  records.set(claimed.code, structuredClone(claimed));
  configuration.knowledge.ingestion.indexName = "other-index";
  await assert.rejects(recovery.execute(command(review)));
  assert.equal(updates, 0);
  assert.equal(receipts.length, 0);
});
test("failed authorization audit prevents retirement; lost completion acknowledgement is unknown without replay", async () => {
  const review = await recovery.preview(request);
  const save = SERVICE.DefaultCopilotKnowledgeMaintenanceService.save;
  SERVICE.DefaultCopilotKnowledgeMaintenanceService.save = async () =>
    undefined;
  await assert.rejects(recovery.execute(command(review)));
  assert.equal(updates, 0);
  SERVICE.DefaultCopilotKnowledgeMaintenanceService.save = async (r) =>
    r.model.stage === "WRITER_RETIREMENT_AUTHORIZED" ? save(r) : undefined;
  await assert.rejects(recovery.execute(command(review)), /ERR_CPK_00020/);
  assert.equal(updates, 1);
  assert.equal((await owner.read(scope)).pendingGeneration, null);
  await assert.rejects(recovery.execute(command(review)));
  assert.equal(updates, 1);
});
test("revocation during owner reread prevents CAS and hides internal errors", async () => {
  const review = await recovery.preview(request);
  const get = SERVICE.DefaultDiscoveryGenerationService.get;
  let reads = 0;
  SERVICE.DefaultDiscoveryGenerationService.get = async (r) => {
    const result = await get(r);
    if (++reads === 2) request.securityContext.permissions = [];
    return result;
  };
  await assert.rejects(recovery.execute(command(review)), /ERR_CPK_00020/);
  assert.equal(updates, 0);
});
test("two simultaneous retirements produce one acknowledged transition only", async () => {
  const review = await recovery.preview(request);
  const results = await Promise.allSettled([
    recovery.execute(command(review)),
    recovery.execute(command(review)),
  ]);
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  assert.equal(updates, 1);
});
