/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/** @module profile/test/structuralRecoveryStateContract @description Injected exact-state recovery fixtures, not migration execution or index qualification. @layer test @owner profile */
const test = require("node:test");
const assert = require("node:assert/strict");
const source = require("../src/service/identity/defaultIdentityGovernanceMigrationService");
test("structural recovery distinguishes exact pre/post state and rejects intervening changes", async () => {
  global.CLASSES = { NodicsError: class extends Error {} };
  const change = {
    schema: "address",
    code: "address",
    from: { _id: "id", ownerType: "old" },
    to: { ownerType: "new" },
  };
  const row = { _id: "id", code: "address", ownerType: "old" };
  global.SERVICE = {
    DefaultAddressService: {},
    DefaultPrincipalSecurityStampGovernanceService: {
      inventory: async () => [row],
    },
  };
  const owner = { ...source };
  assert.equal(
    await owner.structuralChangeState({ tenant: "tenant" }, change),
    "BEFORE",
  );
  row.ownerType = "new";
  assert.equal(
    await owner.structuralChangeState({ tenant: "tenant" }, change),
    "AFTER",
  );
  row.ownerType = "other";
  await assert.rejects(
    owner.structuralChangeState({ tenant: "tenant" }, change),
  );
  row.ownerType = "new";
  row._id = "replacement";
  await assert.rejects(
    owner.structuralChangeState({ tenant: "tenant" }, change),
  );
});
