/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module backoffice/test/applicationPreparationReceipts
 * @description Preserves bounded owner receipts and stops setup after a failed import group.
 * @layer test
 * @owner backoffice
 */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const service = require("../src/service/defaultBackofficeApplicationInitializationService");
const step = (code, targetServer) => ({
  code,
  targetServer,
  targetRuntimeRole: "STAGED",
  type: "DATA_RELEASE",
  dataType: "core",
  status: "NOT_INSTALLED",
  version: "1.0.0",
});
test("preserves completed, failed and unattempted groups without replaying or reaching CMS", async () => {
  const owner = Object.create(service);
  const steps = [step("first", "a"), step("second", "b"), step("third", "c")];
  const calls = [];
  owner.prepareMediaAssets = async () => {};
  owner.preparationGroups = () =>
    steps.map((item) => ({ ...item, steps: [item] }));
  owner.invokeDataReleaseOperation = async (mode, group) => {
    calls.push([mode, group.targetServer]);
    if (group.targetServer === "b")
      throw Object.assign(new Error("private record payload Bearer secret"), {
        code: "ERR_IMP_00010",
        record: { password: "secret" },
      });
    return {
      releases: [
        {
          releaseCode: "first",
          status: "CURRENT",
          importRun: "run-1",
          path: "/private/file",
        },
      ],
    };
  };
  owner.preparationStatus = async () => ({
    status: "ACTION_REQUIRED",
    steps: steps.map((item) => ({
      ...item,
      status: item.code === "second" ? "FAILED" : item.status,
      releaseReceipt: {
        releaseCode: item.code,
        status: item.code === "second" ? "FAILED" : item.status,
      },
    })),
  });
  const result = await owner.prepareApplication(
    { code: "site" },
    {},
    { status: "ACTION_REQUIRED", steps },
  );
  assert.deepEqual(calls, [
    ["execute", "a"],
    ["execute", "b"],
  ]);
  assert.deepEqual(
    result.groupReceipts.map((item) => item.status),
    ["COMPLETE", "FAILED", "NOT_ATTEMPTED"],
  );
  assert.equal(result.status, "BLOCKED");
  assert.equal(result.operationFailure.failureCode, "ERR_IMP_00010");
  assert.equal(result.operationFailure.automaticRetry, false);
  assert.equal(result.groupReceipts[0].releases[0].importRun, "run-1");
  assert.equal(result.groupReceipts[1].releases[0].status, "FAILED");
  assert.doesNotMatch(JSON.stringify(result), /secret|Bearer|private|password/);
});
test("projects only existing owner receipt fields and rejects unbounded values", () => {
  assert.deepEqual(
    service.preparationReleaseReceipt({
      releaseCode: "release",
      lastRunId: "import_123",
      status: "FAILED",
      path: "/private",
      version: "Bearer secret",
      importedRows: [{ password: "secret" }],
    }),
    { releaseCode: "release", status: "FAILED", lastRunId: "import_123" },
  );
});
test("failed preparation returns the blocked operation projection, not publication or another attempt", async () => {
  const owner = Object.create(service);
  const failed = {
    status: "BLOCKED",
    steps: [],
    groupReceipts: [{ status: "FAILED" }],
    operationFailure: { failureCode: "ERR_IMP_00010" },
  };
  owner.profile = () => ({ code: "site" });
  owner.human = () => "operator";
  owner.preparationStatus = async () => ({
    status: "ACTION_REQUIRED",
    steps: [],
  });
  owner.prepareApplication = async () => failed;
  owner.blockedProjection = (_profile, preparation) => ({
    readiness: "BLOCKED",
    allowedActions: [],
    preparation,
  });
  owner.status = async () => {
    throw new Error("Must not query publication after failed preparation");
  };
  const result = await owner.prepareCapability("site", {});
  assert.equal(result.readiness, "BLOCKED");
  assert.deepEqual(result.allowedActions, []);
  assert.equal(result.preparation, failed);
  assert.equal(result.preparationOperation.attempted, true);
});
test("failed import history review precedes unstarted imports and never offers a retry executor", () => {
  const owner = Object.create(service);
  const result = owner.capabilityBlockers({
    preparation: {
      steps: [
        step("first", "a"),
        {
          ...step("failed", "b"),
          status: "FAILED",
          releaseReceipt: {
            releaseCode: "failed",
            status: "FAILED",
            lastRunId: "prior-run",
          },
        },
      ],
    },
  });
  assert.equal(result[0].code, "IMPORT_FAILED");
  assert.equal(result[0].action, "Review import history");
  assert.equal(result[0].repair.action, "REVIEW_IMPORT_HISTORY");
  assert.equal(result[0].repair.operation, undefined);
  assert.equal(result[0].repair.available, false);
  assert.equal(result[0].releaseReceipt.lastRunId, "prior-run");
});
