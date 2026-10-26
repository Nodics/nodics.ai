/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module cart/test/participantTransactionAccess @description Guards exact authority, insertion semantics and immutable source hashes. @owner cart @layer test */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const section = require("../data/manifest.json").sections.participantTransactionAccess;
test("exact participant authority has no inherited or administrator grants", () => {
  const group = require("../data/init-v001/records/identity/cartParticipantTransactionGroupData")["commerceOwnCartParticipantUserGroup"];
  const role = require("../data/init-v001/records/identity/cartParticipantTransactionRoleData")["COMMERCE_OWN_CART_PARTICIPANT"];
  assert.deepEqual(group.permissions, ["commerce.cart.own"]);
  assert.deepEqual(group.parentGroups, []);
  assert.deepEqual(role.groupCodes, [group.code]);
  assert.equal(role.ownerModule, "cart");
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
