/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module loyaltyWallet/test/specialAccessRoles @description Verifies advanced owner responsibilities remain neutral and independently governed. @owner loyaltyWallet @layer test */
const test = require("node:test"), assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto");
const groups = require("../data/init-v001/records/identity/loyaltyWalletSpecialAccessGroupData");
const roles = require("../data/init-v001/records/identity/loyaltyWalletSpecialAccessRoleData");
const manifest = require("../data/manifest.json");
test("advanced responsibility is owner-defined, scoped, and never an ordinary business access level", () => {
  assert.equal(Object.keys(groups).length, 1);
  assert.equal(Object.keys(roles).length, 1);
  const group = groups.record0, role = roles.record0;
  assert.deepEqual(group.permissions, ["loyalty.sampleCredit.apply"]);
  assert.deepEqual(group.parentGroups, ["employeeUserGroup"]);
  assert.deepEqual(role.groupCodes, [group.code]);
  assert.equal(role.scopeType, "ENTERPRISE");
  assert.equal(role.ownerModule, "loyaltyWallet");
  assert.equal(role.delegable, true);
  assert.equal(role.accessLevel, undefined);
  assert.equal(role.administrationClass, undefined);
  assert.doesNotMatch(JSON.stringify({ groups, roles }), /circa|greenperks|renewworks|loopcycle/i);
});
test("independent init releases seal owner files and require base groups and permission catalogue", () => {
  for (const code of ["specialAccessGroups", "specialAccessRoles"]) {
    const section = manifest.sections[code];
    assert.equal(section.dataType, "init");
    assert.equal(section.destinationRole, "PLATFORM");
    for (const [file, checksum] of Object.entries(section.files))
      assert.equal(crypto.createHash("sha256").update(fs.readFileSync(path.join(__dirname, "../data", file))).digest("hex"), checksum, file);
  }
  assert.deepEqual(manifest.sections.specialAccessGroups.prerequisites.map(p => p.moduleName + ":" + p.sectionCode), ["profile:accessGroups", "loyaltyWallet:permissionCatalogue"]);
  assert.deepEqual(manifest.sections.specialAccessRoles.prerequisites.map(p => p.moduleName + ":" + p.sectionCode), ["loyaltyWallet:specialAccessGroups"]);
});
