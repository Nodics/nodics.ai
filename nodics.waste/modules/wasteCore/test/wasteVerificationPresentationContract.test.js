/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

/** @module wasteCore/test/wasteVerificationPresentationContract @description Proves policy-neutral verification presentation through owner action availability under same-actor and separate-actor policies. @owner wasteCore @layer test @override Effective later-layer presentation remains separate from permission and decision policy. */
const { test, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const defaults = require("../config/properties").waste.operations;
const access = require("../src/service/defaultWasteOperationalAccessService");
const genericKeys = [
  "verifyExplanation",
  "verifySaved",
  "verificationRequired",
];
let operations, previousConfig, previousService;

beforeEach(() => {
  previousConfig = global.CONFIG;
  previousService = global.SERVICE;
  operations = structuredClone(defaults);
  global.CONFIG = {
    get: (key) => (key === "waste" ? { operations } : undefined),
  };
  global.SERVICE = {
    DefaultSecuredRequestPipelineService: {
      getGrantedPermissions: () => [
        "waste.review.queue.read",
        "waste.verification.record",
        "waste.review.approve",
      ],
      isPermissionGranted: (permission, grants) => grants.includes(permission),
    },
  };
});

afterEach(() => {
  global.CONFIG = previousConfig;
  global.SERVICE = previousService;
});

for (const requireVerification of [false, true]) {
  for (const requireDifferentApprover of [false, true]) {
    test(`generic presentation is neutral with verification=${requireVerification}, different approver=${requireDifferentApprover}`, async () => {
      Object.assign(operations, {
        requireVerification,
        requireDifferentApprover,
      });
      const result = await access.describe({
        authData: { principalType: "human", loginId: "reviewer" },
      });
      assert.equal(result.requireVerification, requireVerification);
      assert.equal(result.requireDifferentApprover, requireDifferentApprover);
      assert.equal(result.canVerify, true);
      assert.equal(result.canApprove, true);
      for (const key of genericKeys) {
        assert.equal(typeof result.presentation[key], "string");
        assert.doesNotMatch(
          result.presentation[key],
          /independent|different employee|another employee/i,
          `${key} must not imply a separate-actor policy`,
        );
      }
      assert.match(
        result.presentation.verifyExplanation,
        /does not create an asset or issue rewards/i,
      );
      assert.equal(
        result.presentation.differentApproverRequired,
        "Another employee must make the final decision.",
      );
    });
  }
}

test("default authority flags remain unchanged", () => {
  assert.equal(defaults.requireScopes, false);
  assert.equal(defaults.requireVerification, false);
  assert.equal(defaults.requireDifferentApprover, false);
});

test("review context delegates vocabulary to the implementing review owner when loaded", async () => {
  global.SERVICE.DefaultWasteReviewWorkspaceService = require("../../wasteVerification/src/service/defaultWasteReviewWorkspaceService");
  const result = await access.describe({
    authData: { principalType: "human", loginId: "reviewer" },
  });
  assert.deepEqual(
    result.reviewWorkspace.descriptorOptions,
    require("../../wasteMaterial/src/utils/descriptorDefinitions"),
  );
  assert.equal(result.canVerify, true);
  delete global.SERVICE.DefaultWasteReviewWorkspaceService;
  assert.deepEqual(
    (
      await access.describe({
        authData: { principalType: "human", loginId: "reviewer" },
      })
    ).reviewWorkspace,
    {},
  );
});

test("later-layer presentation does not change action permissions or actor policy", async () => {
  operations.presentation.verifySaved =
    "Verified facts saved for final review.";
  operations.requireVerification = true;
  const result = await access.describe({
    authData: { principalType: "human", loginId: "reviewer" },
  });
  assert.equal(
    result.presentation.verifySaved,
    operations.presentation.verifySaved,
  );
  assert.equal(result.requireVerification, true);
  assert.equal(result.requireDifferentApprover, false);
  assert.equal(result.canVerify, true);
  assert.equal(result.canApprove, true);
});
