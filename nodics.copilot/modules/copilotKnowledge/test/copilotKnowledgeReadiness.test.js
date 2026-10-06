/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @file Verifies durable, bounded and employee-scoped infrastructure knowledge readiness with real registry/publication composition and isolated physical evidence. */
"use strict";
const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const runtime = require("../src/service/defaultCopilotKnowledgeRuntimeService");
const readiness = require("../src/service/defaultCopilotKnowledgeReadinessService");
const publication = require("../src/service/defaultCopilotKnowledgePublicationService");
const policy = require("../../copilotPolicy/src/service/defaultCopilotPolicyService");
let configuration, request, physicalCount, pending, debt, reads;
beforeEach(() => {
  configuration = {
    providers: {
      enabled: true,
      default: { adapter: "local" },
      adapters: { local: { enabled: true, model: { name: "fixture" } } },
    },
    policy: require("../../copilotPolicy/config/properties").copilot.policy,
    knowledge: structuredClone(
      require("../config/properties").copilot.knowledge,
    ),
  };
  Object.assign(configuration.knowledge, {
    generationPublication: { enabled: true },
    groups: { enabled: false },
    retrieval: { enabled: true },
  });
  configuration.knowledge.sourceRegistry.definitions = [
    {
      code: "framework-readme",
      repository: "framework",
      project: "nodics",
      module: "copilotKnowledge",
      owner: "copilotKnowledge",
      version: "1",
      template: "employeeReadme",
      enabled: true,
    },
  ];
  request = {
    tenant: "tenant",
    authData: {
      loginId: "employee",
      enterpriseCode: "ACME",
      permissions: ["copilot.knowledge.internal.read"],
    },
  };
  physicalCount = 2;
  pending = false;
  debt = false;
  reads = [];
  global.CONFIG = { get: () => configuration };
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code) {
        super(code);
        this.code = code;
      }
    },
  };
  global.SERVICE = {
    DefaultCopilotKnowledgeRuntimeService: runtime,
    DefaultCopilotKnowledgeReadinessService: readiness,
    DefaultCopilotKnowledgePublicationService: publication,
    DefaultCopilotPolicyService: policy,
    DefaultCopilotOrchestrationService: require("../../copilotCore/src/service/defaultCopilotOrchestrationService"),
    DefaultCopilotKnowledgeSourceRegistryService: require("../src/service/defaultCopilotKnowledgeSourceRegistryService"),
    DefaultDiscoveryGenerationPublicationService: {
      read: async (scope) => {
        reads.push(scope);
        const source = runtime
          .registry(configuration)
          .sources.find((source) => source.code === scope.ownerCode);
        return {
          currentGeneration: {
            token: "generation",
            count: 2,
            digest: source.sourcePolicyDigest,
            at: "2026-10-03T10:00:00Z",
          },
          pendingGeneration: pending ? {} : null,
          obsoleteGenerations: debt ? [{}] : [],
        };
      },
      count: async () => physicalCount,
    },
  };
  runtime.state.reports = new Map();
  runtime.state.lastRefreshAt = null;
});
test("restart cannot erase durable readiness and a lost physical document cannot remain ready", async () => {
  const ready = await runtime.readiness(request);
  assert.equal(ready.businessStatus, "READY");
  assert.equal(ready.evidence, "DURABLE_GENERATION");
  assert.equal(ready.indexedSourceCount, 1);
  assert.equal(ready.lastRefreshAt, "2026-10-03T10:00:00Z");
  assert.equal(reads[0].tenant, "tenant");
  physicalCount = 1;
  assert.equal(
    (await runtime.readiness(request)).businessStatus,
    "NEEDS_ATTENTION",
  );
  assert.equal((await runtime.readiness(request)).indexedSourceCount, 0);
});
test("pending writers and cleanup debt are separate from a physically intact current generation", async () => {
  pending = true;
  debt = true;
  const result = await runtime.readiness(request);
  assert.equal(result.indexedSourceCount, 1);
  assert.equal(result.businessStatus, "NEEDS_ATTENTION");
  assert.equal(result.inspectionRequiredSourceCount, 1);
  assert.equal(result.cleanupPendingSourceCount, 1);
  assert.ok(
    result.blockers.every((blocker) => blocker.repair.available === false),
  );
});
test("hidden sources are not read and missing identity or revoked permission cannot leak counts", async () => {
  configuration.knowledge.sourceRegistry.definitions.push({
    ...configuration.knowledge.sourceRegistry.definitions[0],
    code: "foreign",
    requiredPermissions: ["foreign.secret.read"],
  });
  assert.equal((await runtime.readiness(request)).sourceCount, 1);
  assert.deepEqual(
    reads.map((read) => read.ownerCode),
    ["framework-readme"],
  );
  const readCount = reads.length;
  request.authData.permissions = [];
  await assert.rejects(runtime.readiness(request));
  await assert.rejects(runtime.readiness());
  assert.equal(reads.length, readCount);
});
test("more than one bounded source window never claims whole-registry readiness", async () => {
  const source = configuration.knowledge.sourceRegistry.definitions[0];
  configuration.knowledge.sourceRegistry.definitions = Array.from(
    { length: 101 },
    (_, index) => ({ ...source, code: "source-" + index }),
  );
  const result = await runtime.readiness(request);
  assert.equal(reads.length, 100);
  assert.equal(result.sourceCount, 100);
  assert.equal(result.hasMore, true);
  assert.equal(result.coverage, "AUTHORIZED_SOURCE_WINDOW");
  assert.equal(result.businessStatus, "NEEDS_ATTENTION");
});
test("revocation during a physical probe and private owner failures remain unavailable", async () => {
  SERVICE.DefaultDiscoveryGenerationPublicationService.count = async () => {
    request.authData.permissions.length = 0;
    return 2;
  };
  await assert.rejects(runtime.readiness(request), /ERR_CPK_00019/);
  request.authData.permissions = ["copilot.knowledge.internal.read"];
  SERVICE.DefaultDiscoveryGenerationPublicationService.count = async () => {
    throw new Error("private-index-location");
  };
  await assert.rejects(
    runtime.readiness(request),
    (error) => error.message === "ERR_CPK_00019",
  );
});
test("BackOffice awaits the owner result with the original request and preserves evidence boundaries", async () => {
  const backoffice = require("../../../../nodics.platform/modules/backoffice/src/service/operations/defaultBackofficeOperationalReadinessService");
  const result = await backoffice.assistantSection(request);
  assert.equal(result.businessStatus, "READY");
  assert.equal(result.summary.evidence, "DURABLE_GENERATION");
  assert.equal(result.summary.coverage, "AUTHORIZED_SOURCE_WINDOW");
  assert.equal(result.summary.indexedSourceCount, 1);
  delete SERVICE.DefaultDiscoveryGenerationPublicationService;
  const failed = await backoffice.assistantSection(request);
  assert.equal(failed.businessStatus, "NEEDS_ATTENTION");
  assert.equal(failed.summary.providerAvailable, false);
  assert.doesNotMatch(JSON.stringify(failed), /private-index|framework-readme/);
});
