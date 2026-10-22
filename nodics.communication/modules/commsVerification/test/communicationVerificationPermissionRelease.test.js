/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module commsVerification/test/permissionRelease @description Verifies Communication Verification-owned execute permission definition and immutable release evidence. @owner commsVerification @layer test */
const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const moduleRoot = path.resolve(__dirname, "..");
const dataRoot = path.join(moduleRoot, "data");
const section = require(path.join(dataRoot, "manifest.json")).sections.verificationExecutePermission;

test("Communication Verification owns its private command permission definition", () => {
  assert(require(path.join(moduleRoot, "package.json")).nodics.owns.includes("data"));
  assert.equal(section.sourceRoot, "init-v001");
  assert.equal(section.selectionPolicy, "EXPLICIT");
  const header = require(path.join(dataRoot, section.sourceRoot,
    "headers/identity/commsVerificationExecutePermissionHeader")).profile.commsVerificationExecutePermission;
  assert.equal(header.options.operation, "ensureReferenceAll");
  assert.equal(header.options.schemaName, "permission");
  const records = Object.values(require(path.join(dataRoot, section.sourceRoot,
    "records/identity/commsVerificationExecutePermissionData")));
  assert.deepEqual(records, [{ code: "communication.verification.execute",
    name: "communication.verification.execute", active: true, ownerModule: "commsVerification" }]);
  for (const [file, expected] of Object.entries(section.files)) {
    assert.equal(crypto.createHash("sha256").update(fs.readFileSync(path.join(dataRoot, file))).digest("hex"), expected);
  }
});
