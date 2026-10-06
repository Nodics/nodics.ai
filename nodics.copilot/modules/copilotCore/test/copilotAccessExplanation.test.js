/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @file Verifies safe business-journey diagnostics without domain, storage, provider or hidden-source access. */
"use strict";
const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const service = require("../src/service/defaultCopilotAccessExplanationService");
const policy = require("../../copilotPolicy/src/service/defaultCopilotPolicyService");
let context, configuration, groups;
beforeEach(() => {
  configuration = structuredClone(require("../config/properties").copilot);
  configuration.policy =
    require("../../copilotPolicy/config/properties").copilot.policy;
  configuration.knowledge = {
    retrieval: { enabled: true },
    externalLogs: { enabled: true },
  };
  configuration.workbench = { enterpriseTarget: { enabled: false } };
  configuration.conversation = {};
  context = {
    channel: "EMPLOYEE",
    tenant: "tenant",
    enterprise: "enterprise",
    actor: "employee",
    environment: "test",
    permissions: ["copilot.assistant.read"],
    roles: [],
    groups: [],
  };
  groups = { registry: { sources: [] } };
  global.SERVICE = { DefaultCopilotPolicyService: policy };
  global.CLASSES = { NodicsError: class extends Error {} };
});
test("explains independent grants without exposing configuration or enabling commands", () => {
  const result = service.explain(context, configuration, groups);
  const enterprise = result.items.find((item) => item.code === "enterprise");
  assert.equal(enterprise.state, "PERMISSION_REQUIRED");
  assert.ok(
    enterprise.missingPermissions.includes("profile.enterpriseAccess.assign"),
  );
  assert.equal(enterprise.target, undefined);
  assert.equal(enterprise.action, undefined);
  assert.equal(
    result.items.find((item) => item.code === "coupon").state,
    "PERMISSION_REQUIRED",
  );
});
test("missing source and configuration differ from owner-check-required, never ready or authorized", () => {
  context.permissions = ["*"];
  const result = service.explain(context, configuration, groups);
  assert.equal(
    result.items.find((item) => item.code === "enterprise").state,
    "CONFIGURATION_REQUIRED",
  );
  assert.equal(
    result.items.find((item) => item.code === "database").state,
    "SOURCE_REQUIRED",
  );
  assert.equal(
    result.items.find((item) => item.code === "execute").state,
    "OWNER_CHECK_REQUIRED",
  );
  assert.ok(
    result.items.every((item) => !["READY", "AUTHORIZED"].includes(item.state)),
  );
});
test("hidden or foreign sources cannot imply availability or leak their identities", () => {
  context.permissions = [
    "copilot.assistant.read",
    "copilot.data.query",
    "copilot.knowledge.restricted.read",
  ];
  groups.registry.sources = [
    {
      code: "private-other-enterprise",
      sourceType: "DATABASE",
      classification: "RESTRICTED",
      enabled: true,
      tenantScopes: ["tenant"],
      enterpriseScopes: ["other"],
      environmentScopes: ["test"],
      allowedChannels: ["EMPLOYEE"],
    },
  ];
  const result = service.explain(context, configuration, groups);
  assert.equal(
    result.items.find((item) => item.code === "database").state,
    "SOURCE_REQUIRED",
  );
  assert.doesNotMatch(JSON.stringify(result), /private-other-enterprise/);
});
test("untrusted or unscoped identity is rejected before source inspection", () => {
  for (const patch of [
    { channel: "PUBLIC" },
    { enterprise: null },
    { actor: null },
    { permissions: [] },
  ])
    assert.throws(() =>
      service.explain({ ...context, ...patch }, configuration, groups),
    );
});
test("standalone journey prerequisites distinguish invitation authority and price admission without granting owner access", () => {
  context.permissions = [
    "copilot.assistant.read",
    "copilot.mutation.prepare",
    "copilot.mutation.execute",
    "profile.enterpriseAccess.assign",
  ];
  configuration.workbench = {
    enterpriseTarget: { enabled: true },
    standaloneInvitationsEnabled: true,
    standalonePricesEnabled: false,
    target: { pricingModule: "pricing", connectionName: "private-owner" },
  };
  const result = service.explain(context, configuration, groups);
  assert.equal(
    result.items.find((item) => item.code === "invitation").state,
    "OWNER_CHECK_REQUIRED",
  );
  assert.equal(
    result.items.find((item) => item.code === "enterprise").state,
    "PERMISSION_REQUIRED",
  );
  assert.equal(
    result.items.find((item) => item.code === "price").state,
    "CONFIGURATION_REQUIRED",
  );
  assert.doesNotMatch(JSON.stringify(result), /private-owner/);
  configuration.workbench.standalonePricesEnabled = true;
  assert.equal(
    service
      .explain(context, configuration, groups)
      .items.find((item) => item.code === "price").state,
    "OWNER_CHECK_REQUIRED",
  );
});
