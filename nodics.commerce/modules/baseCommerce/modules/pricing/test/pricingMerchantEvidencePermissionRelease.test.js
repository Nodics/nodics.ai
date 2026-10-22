/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module pricing/test/merchantEvidencePermissionRelease @description Verifies Pricing-owned merchant evidence permission definition and immutable release evidence. @owner pricing @layer test */
const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const dataRoot = path.resolve(__dirname, "../data");
const section = require(path.join(dataRoot, "manifest.json")).sections.merchantEvidencePermission;

test("Pricing owns the bounded merchant evidence permission definition", () => {
  assert.equal(section.sourceRoot, "init-v002");
  assert.equal(section.selectionPolicy, "EXPLICIT");
  const header = require(path.join(dataRoot, section.sourceRoot,
    "headers/identity/pricingMerchantEvidencePermissionHeader")).profile.pricingMerchantEvidencePermission;
  assert.equal(header.options.operation, "ensureReferenceAll");
  assert.equal(header.options.schemaName, "permission");
  const records = Object.values(require(path.join(dataRoot, section.sourceRoot,
    "records/identity/pricingMerchantEvidencePermissionData")));
  assert.deepEqual(records, [{ code: "commerce.pricing.merchant.evidence",
    name: "commerce.pricing.merchant.evidence", active: true, ownerModule: "pricing" }]);
  for (const [file, expected] of Object.entries(section.files)) {
    assert.equal(crypto.createHash("sha256").update(fs.readFileSync(path.join(dataRoot, file))).digest("hex"), expected);
  }
});
