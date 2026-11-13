/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module loyaltyWallet/test/participantTransactionAccess @description Guards exact authority, insertion semantics and immutable source hashes. @owner loyaltyWallet @layer test */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const section = require("../data/manifest.json").sections.participantTransactionAccess;
test("exact participant authority has no inherited or administrator grants", () => {
  const group = require("../data/init-v001/records/identity/loyaltyWalletParticipantTransactionGroupData")["loyaltyRewardTransferParticipantUserGroup"];
  const role = require("../data/init-v001/records/identity/loyaltyWalletParticipantTransactionRoleData")["LOYALTY_REWARD_TRANSFER_PARTICIPANT"];
  assert.deepEqual(group.permissions, ["loyalty.rewards.transfer"]);
  assert.deepEqual(group.parentGroups, []);
  assert.deepEqual(role.groupCodes, [group.code]);
  assert.equal(role.ownerModule, "loyaltyWallet");
  assert.equal(role.scopeType, "ENTERPRISE");
  assert.equal(role.delegable, true);
  assert.equal(role.administrationClass, undefined);
  assert.deepEqual(role.assignmentPermissions, []);
});
test("explicit owner release preserves persisted definitions and pins every payload", () => {
  assert.equal(section.selectionPolicy, "EXPLICIT");
  assert.equal(section.destinationRole, "PLATFORM");
  assert.equal(section.sourceRoot, "init-v001");
  assert.equal(Object.keys(section.files).length, 4);
  for (const [file, hash] of Object.entries(section.files)) {
    const target = path.join(__dirname, "../data", file);
    assert.equal(crypto.createHash("sha256").update(fs.readFileSync(target)).digest("hex"), hash);
    if (!file.includes("/headers/")) continue;
    const header = Object.values(require(target).profile)[0];
    assert.equal(header.options.operation, "ensureReferenceAll");
    assert.ok(["userGroup", "enterpriseRole"].includes(header.options.schemaName));
  }
});

test("participant transactions declare transfer vocabulary before group creation", () => {
  const manifest = require("../data/manifest.json");
  const source = require("../../../../nodics.foundation/modules/nData/nImport/import/src/service/release/defaultDataReleaseService");
  const owner = { ...source, configuration: () => ({}) };
  for (const sectionCode of ["permissionCatalogue", "transferPermissions"]) {
    const target = manifest.sections[sectionCode];
    const reference = (section.prerequisites || [])
      .find(value => value.moduleName === "loyaltyWallet" && value.sectionCode === sectionCode);
    assert.ok(reference, sectionCode);
    assert.equal(reference.version, target.version);
    assert.equal(reference.checksum, owner.releaseFileChecksum(target.files, owner.validatePrerequisites(target.prerequisites)));
    assert.equal(reference.partition, "DEFAULT");
  }
});
