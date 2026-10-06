/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module copilotCapability/test/copilotOperationCatalogue @description Checks permission-filtered, bounded and non-executable catalogue projection. @layer test @owner copilotCapability */
const test = require("node:test");
const assert = require("node:assert/strict");
const catalogue = require("../src/service/defaultCopilotExperienceCapabilityService");
const policy = require("../../copilotPolicy/src/service/defaultCopilotPolicyService");
const context = {
  channel: "EMPLOYEE",
  tenant: "t",
  enterprise: "e",
  actor: "employee",
  permissions: ["backoffice.registry.view"],
  roles: [],
  groups: [],
};

test("catalogue only exposes permissioned descriptors and retains source maturity", () => {
  assert.deepEqual(
    catalogue.catalogue(context, policy).items.map((item) => item.code),
    [
      "framework.modules.list",
      "framework.modules.count",
      "framework.modules.describe",
    ],
  );
  const all = catalogue.catalogue(
    { ...context, permissions: ["*"] },
    policy,
  ).items;
  assert.ok(all.every((item) => item.riskClass && !item.handler));
  assert.equal(
    all.find((item) => item.code === "commerce.checkout.execute").maturity,
    "FUTURE",
  );
  assert.equal(
    all.find((item) => item.code === "nodics.workbench.execute").execution,
    "GOVERNED_CONFIRMATION_REQUIRED",
  );
  assert.throws(() =>
    catalogue.catalogue({ ...context, enterprise: null }, policy),
  );
  assert.throws(() => catalogue.catalogue(context, null));
});

test("later-layer descriptors retain tenant restrictions, bounds and inert projection", () => {
  const descriptor = {
    code: "custom",
    owner: "domain",
    permission: "backoffice.registry.view",
    riskClass: "INTERNAL_READ",
    maturity: "IMPLEMENTED",
    handler: () => {
      throw new Error("must not execute");
    },
    secret: "hidden",
  };
  const extension = {
    ...catalogue,
    descriptors: () => [
      { ...descriptor, code: "other-tenant", tenantScopes: ["other"] },
      ...Array.from({ length: 101 }, (_, i) => ({
        ...descriptor,
        code: `custom-${i}`,
      })),
    ],
  };
  const result = extension.catalogue(context, policy);
  assert.equal(result.items.length, 100);
  assert.equal(result.hasMore, true);
  assert.doesNotMatch(JSON.stringify(result), /other-tenant|hidden|handler/);
});

test("implemented command adapters are discoverable only with all preparation grants", () => {
  const codes = (permissions) =>
    catalogue.catalogue({ ...context, permissions }, policy).items;
  const all = codes([
    "*",
    "copilot.mutation.prepare",
    "profile.enterpriseAccess.assign",
  ]);
  for (const code of [
    "commerce.product.create",
    "profile.enterprise.onboard",
    "profile.enterprise.invite",
    "commerce.price.create",
    "waste.collectionCentre.create",
    "commerce.coupon.redeem",
    "process.task.claim",
    "process.task.assign",
    "process.task.complete",
    "process.task.cancel",
  ]) {
    const item = all.find((item) => item.code === code);
    assert.equal(item.maturity, "IMPLEMENTED");
    assert.equal(item.execution, "GOVERNED_CONFIRMATION_REQUIRED");
    assert.equal(item.mutates, true);
    assert.equal(item.requiredPermissions, undefined);
  }
  assert.equal(
    codes(["profile.enterprise.create"]).some(
      (item) => item.code === "profile.enterprise.onboard",
    ),
    false,
  );
  const invitationsOnly = codes([
    "profile.enterpriseAccess.assign",
    "copilot.mutation.prepare",
  ]);
  assert.equal(
    invitationsOnly.some((item) => item.code === "profile.enterprise.invite"),
    true,
  );
  assert.equal(
    invitationsOnly.some((item) => item.code === "profile.enterprise.onboard"),
    false,
  );
  assert.equal(
    codes(["*"]).some((item) => item.code === "profile.enterprise.onboard"),
    false,
  );
  assert.equal(
    codes(["profile.enterprise.create", "copilot.mutation.prepare"]).some(
      (item) => item.code === "profile.enterprise.onboard",
    ),
    false,
  );
  assert.equal(
    codes([
      "profile.enterprise.create",
      "copilot.mutation.prepare",
      "profile.enterpriseAccess.assign",
    ]).some((item) => item.code === "profile.enterprise.onboard"),
    true,
  );
  assert.equal(
    codes(["commerce.coupon.pos.redeem"]).some(
      (item) => item.code === "commerce.coupon.redeem",
    ),
    false,
  );
  assert.equal(
    codes(["commerce.coupon.pos.redeem", "copilot.mutation.prepare"]).some(
      (item) => item.code === "commerce.coupon.redeem",
    ),
    true,
  );
});

test("task descriptors require independent preparation and exact native authority", () => {
  const taskCodes = (permissions) =>
    catalogue
      .catalogue({ ...context, permissions }, policy)
      .items.filter((item) => item.code.startsWith("process.task."));
  assert.deepEqual(taskCodes(["copilot.mutation.prepare"]), []);
  assert.deepEqual(taskCodes(["process.task.claim"]), []);
  assert.deepEqual(
    taskCodes(["copilot.mutation.prepare", "process.task.claim"]).map(
      (item) => item.code,
    ),
    ["process.task.claim"],
  );
});

test("malformed extension grants fail closed without becoming executable catalogue fields", () => {
  const descriptor = catalogue
    .descriptors()
    .find((item) => item.code === "framework.modules.list");
  for (const requiredPermissions of [
    null,
    "permission",
    [null],
    ["*"],
    [""],
    Array(17).fill("permission"),
  ]) {
    const extension = {
      ...catalogue,
      descriptors: () => [{ ...descriptor, requiredPermissions }],
    };
    assert.deepEqual(
      extension.catalogue({ ...context, permissions: ["*"] }, policy).items,
      [],
    );
  }
});
