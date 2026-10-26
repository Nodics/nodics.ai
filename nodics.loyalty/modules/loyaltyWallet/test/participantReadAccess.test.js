/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module loyaltyWallet/test/participantReadAccess @description Prevents inherited or mutable authority in the Enterprise reader release. @owner loyaltyWallet @layer test */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const group =
  require("../data/init-v001/records/identity/loyaltyWalletParticipantReadGroupData").loyaltyWalletReaderUserGroup;
const role =
  require("../data/init-v001/records/identity/loyaltyWalletParticipantReadRoleData").LOYALTY_WALLET_READER;
test("reader grants exactly the approved capability without inherited authority", () => {
  assert.deepEqual(group.permissions, ["loyalty.wallet.read"]);
  assert.deepEqual(group.parentGroups, []);
  assert.deepEqual(role.groupCodes, [group.code]);
  assert.equal(role.scopeType, "ENTERPRISE");
  assert.equal(role.ownerModule, "loyaltyWallet");
  assert.equal(role.delegable, true);
  assert.equal(role.administrationClass, undefined);
  assert.deepEqual(role.assignmentPermissions, []);
});
test("explicit insert-preserve release has exact checksums and no assignment payload", () => {
  const section = require("../data/manifest.json").sections
    .participantReadAccess;
  assert.equal(section.selectionPolicy, "EXPLICIT");
  assert.equal(section.destinationRole, "PLATFORM");
  assert.equal(section.sourceRoot, "init-v001");
  assert.equal(Object.keys(section.files).length, 4);
  for (const [file, hash] of Object.entries(section.files)) {
    const target = path.join(__dirname, "../data", file);
    assert.equal(
      crypto.createHash("sha256").update(fs.readFileSync(target)).digest("hex"),
      hash,
    );
    if (!file.includes("/headers/")) continue;
    const header = Object.values(require(target).profile)[0];
    assert.equal(header.options.operation, "ensureReferenceAll");
    assert.ok(
      ["userGroup", "enterpriseRole"].includes(header.options.schemaName),
    );
  }
});
