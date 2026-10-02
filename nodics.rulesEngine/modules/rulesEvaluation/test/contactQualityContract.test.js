/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/** @module rulesEvaluation/test/contactQualityContract @description Authored NOT RUN canonical quality registration fixtures; contact possession is not regulated/vendor/operator identity evidence. @layer test @owner rulesEvaluation */
const test = require("node:test");
const assert = require("node:assert/strict");
const quality = require("../src/service/defaultRuleQualityService");
const enums = require("../src/utils/enums");
test("actual Contact quality is registered without satisfying regulated/operator measurement tiers", () => {
  assert.equal(
    enums.INPUT_QUALITY.definition.CONTACT_VERIFIED,
    "CONTACT_VERIFIED",
  );
  assert.equal(quality.meets("CONTACT_VERIFIED", "CONTACT_VERIFIED"), true);
  assert.equal(quality.meets("REFERENCE_DEFAULT", "CONTACT_VERIFIED"), false);
  assert.equal(quality.meets("CONTACT_VERIFIED", "OPERATOR_VERIFIED"), false);
  assert.equal(
    quality.meets("CONTACT_VERIFIED", "VERIFIED_MEASUREMENT"),
    false,
  );
});
