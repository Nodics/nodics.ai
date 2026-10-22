/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module profile/test/runtimeEvidencePermissionRelease @description Verifies Profile-owned runtime evidence permission definitions and immutable release evidence. @owner profile @layer test */
const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const dataRoot = path.resolve(__dirname, "../data");
const section = require(path.join(dataRoot, "manifest.json")).sections.runtimeEvidencePermissions;

test("Profile owns bounded customer evidence and tenant namespace permission definitions", () => {
  assert.equal(section.sourceRoot, "init-v003");
  assert.equal(section.selectionPolicy, "EXPLICIT");
  assert.equal(section.destinationRole, "PLATFORM");
  const header = require(path.join(dataRoot, section.sourceRoot,
    "headers/identity/profileRuntimeEvidencePermissionHeader")).profile.profileRuntimeEvidencePermission;
  assert.equal(header.options.operation, "ensureReferenceAll");
  assert.equal(header.options.schemaName, "permission");
  const records = Object.values(require(path.join(dataRoot, section.sourceRoot,
    "records/identity/profileRuntimeEvidencePermissionData")));
  assert.deepEqual(records.map(record => record.code).sort(), [
    "profile.customer.reference.read",
    "profile.tenant.namespace.bind",
  ]);
  assert(records.every(record => record.ownerModule === "profile" && record.active === true));
  for (const [file, expected] of Object.entries(section.files)) {
    assert.equal(crypto.createHash("sha256").update(fs.readFileSync(path.join(dataRoot, file))).digest("hex"), expected);
  }
});
