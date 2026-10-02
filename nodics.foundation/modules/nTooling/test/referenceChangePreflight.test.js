/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/** @module nTooling/test/referenceChangePreflight @description Inert supplied-snapshot checks, never live source authority or imports. @layer test @owner nTooling */
const test = require("node:test");
const assert = require("node:assert/strict");
const owner = require("../src/service/project/defaultProjectDataManifestService");
test("reference preflight preserves revisions and keeps approval/live revalidation required", () => {
  const inventory = {
    moduleName: "example",
    schemaName: "place",
    tenantCode: "tenant",
    count: 1,
    items: [{ code: "original", revision: 3 }],
  };
  const change = {
    code: "original",
    revision: 3,
    enterpriseRef: {
      moduleName: "profile",
      schemaName: "enterprise",
      code: "approved-target",
    },
  };
  const before = JSON.stringify(inventory);
  const result = owner.preflightReferenceChanges({
    inventory,
    changes: [change],
  });
  assert.equal(result.effects, false);
  assert.equal(result.requiresBusinessApproval, true);
  assert.equal(result.requiresLiveRevalidation, true);
  assert.equal(JSON.stringify(inventory), before);
  for (const changes of [
    [change, change],
    [{ ...change, revision: 2 }],
    [{ ...change, code: "replacement" }],
  ])
    assert.throws(() =>
      owner.preflightReferenceChanges({ inventory, changes }),
    );
  assert.throws(() =>
    owner.preflightReferenceChanges({
      inventory: { ...inventory, count: 2 },
      changes: [change],
    }),
  );
});
