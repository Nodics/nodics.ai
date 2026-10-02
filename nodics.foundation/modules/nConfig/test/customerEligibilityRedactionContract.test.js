/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/** @module nConfig/test/customerEligibilityRedactionContract @description Authored NOT RUN mandatory eligibility audit masking fixtures with existing baseline preservation and attempted disabling. @layer test @owner nConfig */
const test = require("node:test");
const assert = require("node:assert/strict");
const logger = require("../src/service/DefaultLoggerService");
const properties = require("../config/properties");
test("decision audit masking is appended to defaults and non-removable baseline", () => {
  assert.ok(
    properties.log.redaction.sensitiveKeys.includes(
      "customerEligibilityDecision",
    ),
  );
  const effective = logger.resolveRedactionConfig({
    enabled: false,
    sensitiveKeys: [],
  });
  assert.equal(effective.enabled, true);
  for (const key of [
    "customerEligibilityDecision",
    "password",
    "authorization",
    "refreshToken",
  ])
    assert.ok(effective.sensitiveKeys.includes(key));
});
