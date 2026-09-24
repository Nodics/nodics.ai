/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module import/test/dataReleaseReadinessRepairService @description Proves nImport owner repair provider delegates readiness repair to data-release authority. @layer test @owner import */
const assert = require("node:assert/strict");
const test = require("node:test");
const provider = require("../src/service/release/defaultDataReleaseReadinessRepairService");

function repair(overrides) {
  return Object.assign(
    {
      dryRun: true,
      operation: "dataRelease.install",
      action: "PREPARE_CAPABILITY",
      idempotencyKey: "idem-1",
      correlationId: "corr-1",
      targetIdentifiers: { releaseCode: "profile:core-v001" },
      context: { dataType: "core", expectedVersion: "1.0.0" },
    },
    overrides || {},
  );
}

function request() {
  return {
    tenant: "default",
    authData: { loginId: "admin", permissions: ["permission.import"] },
  };
}

test("reports provider capability from the canonical data release service", () => {
  const previousService = global.SERVICE;
  global.SERVICE = {
    DefaultDataReleaseService: {
      preflight: async () => ({}),
      execute: async () => ({}),
    },
  };
  const capability = provider.repairCapability();
  assert.equal(capability.ownerModule, "import");
  assert.equal(capability.providerCode, "dataReleaseReadinessRepairProvider");
  assert.equal(capability.lifecycleState, "READY");
  assert.equal(capability.available, true);
  assert(capability.supportedOperations.some((item) => item.action === "UPDATE_RELEASE"));
  global.SERVICE = previousService;
});

test("dry-run delegates to nImport preflight and maps the business result", async () => {
  const previousService = global.SERVICE;
  let captured;
  global.SERVICE = {
    DefaultDataReleaseService: {
      preflight: async (operationRequest) => {
        captured = operationRequest;
        return {
          code: "SUC_IMP_00000",
          data: {
            dataType: "core",
            releases: [{ releaseCode: "profile:core-v001" }],
            dryRun: {
              summary: { install: 1, update: 0, retry: 0, skip: 0, wait: 0, blocked: 0 },
              messages: ["Dry-run validated the selected release plan. No data was imported."],
              publicationFollowUps: [{ releaseCode: "profile:core-v001" }],
            },
          },
        };
      },
      execute: async () => {
        throw new Error("execute should not be called for dry-run");
      },
    },
  };
  const result = await provider.executeRepair(repair(), request());
  assert.equal(captured.releaseRequest.dataType, "core");
  assert.deepEqual(captured.releaseRequest.releaseCodes, ["profile:core-v001"]);
  assert.equal(captured.releaseRequest.expectedReleases["profile:core-v001"], "1.0.0");
  assert.equal(result.state, "DRY_RUN");
  assert.equal(result.changedCount, 1);
  assert.equal(result.blockersRemaining, 0);
  assert.deepEqual(result.targetIdentifiers, { releaseCode: "profile:core-v001" });
  assert(result.refreshScopes.includes("publishing"));
  assert.equal(result.policy.approvalRequired, false);
  global.SERVICE = previousService;
});

test("execution delegates to nImport execute and returns receipt-friendly evidence", async () => {
  const previousService = global.SERVICE;
  let called = false;
  global.SERVICE = {
    DefaultDataReleaseService: {
      preflight: async () => {
        throw new Error("preflight should not be called for execution");
      },
      execute: async () => {
        called = true;
        return {
          code: "SUC_IMP_00000",
          data: {
            dataType: "core",
            releases: [{ releaseCode: "profile:core-v001" }],
            importRun: "run-100",
          },
        };
      },
    },
  };
  const result = await provider.executeRepair(repair({ dryRun: false }), request());
  assert.equal(called, true);
  assert.equal(result.state, "COMPLETED");
  assert.equal(result.changedCount, 1);
  assert.equal(result.evidenceReference, "run-100");
  assert.equal(result.retryPolicy.safeToRetry, false);
  global.SERVICE = previousService;
});

test("status refresh remains validation-only even when the caller is not in dry-run mode", async () => {
  const previousService = global.SERVICE;
  let preflightCalls = 0;
  global.SERVICE = {
    DefaultDataReleaseService: {
      preflight: async () => {
        preflightCalls += 1;
        return {
          data: {
            releases: [{ releaseCode: "profile:core-v001" }],
            dryRun: { summary: { install: 0, update: 0, retry: 0, skip: 1, wait: 0, blocked: 0 } },
          },
        };
      },
      execute: async () => {
        throw new Error("status refresh must not execute import");
      },
    },
  };
  const result = await provider.executeRepair(
    repair({ dryRun: false, operation: "dataRelease.status", action: "REFRESH_READINESS" }),
    request(),
  );
  assert.equal(preflightCalls, 1);
  assert.equal(result.state, "DRY_RUN");
  assert.equal(result.skippedCount, 1);
  global.SERVICE = previousService;
});

test("infers release data type from discovered releases when context omits it", async () => {
  const previousService = global.SERVICE;
  let captured;
  global.SERVICE = {
    DefaultDataReleaseService: {
      discoverReleases: (dataType) =>
        dataType === "sample"
          ? [{ releaseCode: "circa.ewaste:sample-v001", dataType: "sample" }]
          : [],
      preflight: async (operationRequest) => {
        captured = operationRequest;
        return { data: { releases: [], dryRun: { summary: { blocked: 0, wait: 0 } } } };
      },
      execute: async () => ({}),
    },
  };
  await provider.executeRepair(
    repair({
      targetIdentifiers: { releaseCode: "circa.ewaste:sample-v001" },
      context: {},
    }),
    request(),
  );
  assert.equal(captured.releaseRequest.dataType, "sample");
  global.SERVICE = previousService;
});

test("returns governed guidance when target identity or source repair is missing", async () => {
  const previousService = global.SERVICE;
  global.SERVICE = {
    DefaultDataReleaseService: {
      discoverReleases: () => [],
      preflight: async () => {
        const error = new Error("Requested data release manifest is invalid; repair manifest before installation");
        error.code = "ERR_IMP_00003";
        throw error;
      },
      execute: async () => ({}),
    },
  };
  let missing = await provider.executeRepair(repair({ targetIdentifiers: {}, context: {} }), request());
  assert.equal(missing.state, "VALIDATION_FAILED");
  let unavailable = await provider.executeRepair(
    repair({ targetIdentifiers: { releaseCode: "missing:core-v001" }, context: {} }),
    request(),
  );
  assert.equal(unavailable.state, "TARGET_NOT_FOUND");
  let sourceRepair = await provider.executeRepair(repair(), request());
  assert.equal(sourceRepair.state, "SOURCE_REPAIR_REQUIRED");
  assert.equal(sourceRepair.retryPolicy.safeToRetry, false);
  assert.match(sourceRepair.nextAction, /release validation pipeline/);
  global.SERVICE = previousService;
});
