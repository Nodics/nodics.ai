/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

/** @module import/test/dataReleaseTargetAdmission @description Proves owner runtime admission precedes import claims and preserves partial receipts using isolated synthetic sources. @layer test @owner import */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const promotion = require("../../../../../../nodics.commerce/modules/baseCommerce/modules/promotion/src/service/defaultPromotionOperationService");
const promotionProperties = require("../../../../../../nodics.commerce/modules/baseCommerce/modules/promotion/config/properties");
const createPorts = require("./helpers/releaseExecution");

/** Builds only temporary source and in-memory ports; no runtime/DB import executes. */
function fixture(t, schemas = ["promotion", "couponBatch"], staged = true) {
  const root = fs.mkdtempSync(
    path.join(os.tmpdir(), "nodics-target-admission-"),
  );
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const headerFile = "sample-v001/headers/exampleHeader.js";
  fs.mkdirSync(path.join(root, "data/sample-v001/headers"), {
    recursive: true,
  });
  const definitions = Object.fromEntries(
    schemas.map((schemaName, index) => [
      "target" + index,
      { options: { enabled: true, schemaName, operation: "saveAll" } },
    ]),
  );
  fs.writeFileSync(
    path.join(root, "data", headerFile),
    "module.exports = " + JSON.stringify({ promotion: definitions }) + ";\n",
  );
  const ports = createPorts({
    modules: { example: { name: "example", path: root } },
    runtimeRole: staged ? "COMMERCE_STAGED" : "COMMERCE",
  });
  const get = CONFIG.get;
  CONFIG.get = (key) =>
    key === "promotion"
      ? { publication: { runtimeRole: staged ? "STAGED" : "ONLINE" } }
      : get(key);
  get("data").dataReleases.targetValidators =
    promotionProperties.data.dataReleases.targetValidators;
  SERVICE.DefaultPromotionOperationService = promotion;
  const release = {
    releaseCode: "example:commerce",
    moduleName: "example",
    dataType: "sample",
    version: "1.0.0",
    checksum: "synthetic",
    sourceRoot: "sample-v001",
    declaredFiles: [headerFile],
    destinationRole: staged ? "COMMERCE_STAGED" : "COMMERCE",
    environmentScope: ["ALL"],
    lifecycle: staged ? "PUBLISHABLE" : "REFERENCE",
  };
  const service = {
    ...ports.service,
    discoverReleases: () => [release],
    activeExecutions: new Map(),
  };
  return {
    ...ports,
    service,
    release,
    request: {
      releaseRequest: {
        dataType: "sample",
        releaseCodes: [release.releaseCode],
      },
    },
  };
}

test("mixed Staged release rejects before validation/execution claims, retaining partial receipt evidence", async (t) => {
  const f = fixture(t);
  const retained = {
    code: "retained-partial",
    status: "FAILED",
    revision: 7,
    importRunId: "historical-run",
  };
  f.installations.push(retained);
  for (const method of ["preparePlan", "preflight", "execute"])
    await assert.rejects(
      f.service[method](f.request),
      /violates owner runtime policy/,
    );
  await assert.rejects(
    f.service.executePreparedPlan(f.request, {
      tenant: "default",
      dataType: "sample",
      releases: [f.release],
    }),
    /violates owner runtime policy/,
  );
  assert.deepEqual(f.installations, [retained]);
  assert.equal(f.imports.length, 0);
  assert.equal(f.service.activeExecutions.size, 0);
});

test("policy targets and operational targets on Online pass admission without dispatch", async (t) => {
  let f = fixture(t, ["promotion"]);
  assert.equal(await f.service.validateReleaseTargets(f.release), true);
  f = fixture(
    t,
    [
      "couponBatch",
      "coupon",
      "promotionBudgetLedger",
      "promotionRedemption",
      "discountDecision",
    ],
    false,
  );
  assert.equal(await f.service.validateReleaseTargets(f.release), true);
  assert.equal(f.imports.length, 0);
  assert.equal(f.installations.length, 0);
});

test("unavailable and nonpositive configured owners fail closed; customized owner receives metadata only", async (t) => {
  const f = fixture(t);
  delete SERVICE.DefaultPromotionOperationService;
  await assert.rejects(
    f.service.validateReleaseTargets(f.release),
    /validator is unavailable/,
  );
  for (const result of [false, undefined, { ready: true }]) {
    SERVICE.DefaultPromotionOperationService = {
      validateImportTarget: () => result,
    };
    await assert.rejects(
      f.service.validateReleaseTargets(f.release),
      /not admitted/,
    );
  }
  const seen = [];
  SERVICE.DefaultPromotionOperationService = {
    validateImportTarget: async (request) => {
      seen.push(request);
      return true;
    },
  };
  assert.equal(await f.service.validateReleaseTargets(f.release), true);
  assert.deepEqual(
    seen.map((value) => value.schemaName),
    ["promotion", "couponBatch"],
  );
  assert.deepEqual(Object.keys(seen[0]).sort(), [
    "destinationRole",
    "indexName",
    "lifecycle",
    "moduleName",
    "operation",
    "schemaName",
  ]);
  assert.equal(f.imports.length, 0);
});

test("owner admission covers every currently guarded operational schema, without weakening schema guards", () => {
  const hooks = require("../../../../../../nodics.commerce/modules/baseCommerce/modules/promotion/src/interceptors/interceptors");
  const schemas = new Set(
    Object.values(hooks)
      .filter(
        (hook) =>
          hook.handler ===
          "DefaultPromotionOperationService.requireOperationalRuntime",
      )
      .map((hook) => hook.item),
  );
  const service = { ...promotion, isStagedPolicyRuntime: () => true };
  for (const schemaName of schemas)
    assert.throws(
      () => service.validateImportTarget({ schemaName }),
      /operational mutation is forbidden/,
    );
  assert.throws(
    () => service.requireOperationalRuntime(),
    /operational mutation is forbidden/,
  );
  assert.throws(
    () =>
      service.validatePolicyAuthoring({
        model: { budget: { limit: 10, spent: 0 } },
      }),
    /excludes operational consumption/,
  );
});
