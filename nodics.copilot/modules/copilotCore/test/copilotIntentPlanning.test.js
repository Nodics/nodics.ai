/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @file Proves permission-filtered, usage-accounted interpretation never creates actions or business data and never accepts invented material values. */
"use strict";
const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const planner = require("../src/service/defaultCopilotIntentPlanningService");
const core = require("../src/service/defaultCopilotOrchestrationService");
let request, configuration, calls, proposal;
beforeEach(() => {
  configuration = {
    core: {
      intentPlanning: {
        enabled: true,
        clarificationMessage: "Provide missing details.",
      },
    },
    workbench: {
      enterpriseTarget: { enabled: true },
      collectionCentreTarget: { enabled: false },
    },
    providers: {
      default: { profile: "conversation" },
      profiles: { conversation: { maximumOutputTokens: 2048 } },
    },
  };
  request = {
    tenant: "tenant",
    message:
      "Create enterprise ACME named Acme Limited with administrator admin@example.invalid and no employees.",
    authData: {
      loginId: "employee",
      enterpriseCode: "ACME",
      permissions: [
        "copilot.mutation.prepare",
        "profile.enterprise.create",
        "profile.enterpriseAccess.assign",
      ],
    },
  };
  calls = [];
  proposal = {
    operation: "profile.enterprise.onboard",
    enterprise: {
      code: "ACME",
      name: "Acme Limited",
      adminEmail: "admin@example.invalid",
    },
    employees: [],
  };
  global.CONFIG = { get: () => configuration };
  global.CLASSES = { NodicsError: class extends Error {} };
  global.SERVICE = {
    DefaultCopilotInvitationActionService: require("../../copilotWorkbench/src/service/defaultCopilotInvitationActionService"),
    DefaultCopilotPriceActionService: require("../../copilotWorkbench/src/service/defaultCopilotPriceActionService"),
    DefaultCopilotOrchestrationService: core,
    DefaultCopilotRequestService: require("../src/service/defaultCopilotRequestService"),
    DefaultCopilotPolicyService: require("../../copilotPolicy/src/service/defaultCopilotPolicyService"),
    DefaultCopilotEnterpriseActionService: require("../../copilotWorkbench/src/service/defaultCopilotEnterpriseActionService"),
    DefaultCopilotCollectionCentreActionService: require("../../copilotWorkbench/src/service/defaultCopilotCollectionCentreActionService"),
    DefaultCopilotProviderService: {
      getEffectiveConfiguration:
        require("../../copilotProviders/modules/copilotProvider/src/service/defaultCopilotProviderService")
          .getEffectiveConfiguration,
      invoke: async (input, options) => {
        calls.push({ input, options });
        return {
          content: JSON.stringify(proposal),
          usage: { totalTokens: 50 },
        };
      },
    },
  };
});
/** Supplies an explicit product command without native or journal writes. */
function productProposal() {
  configuration.workbench.target = {
    productModule: "product",
    pricingModule: "pricing",
    connectionName: "owner",
  };
  request.message =
    "Create 2 products, name Test Product, codePrefix TEST, catalogVersion staged, priceBookCode BOOK, currency AED, price 12.3400, active false.";
  proposal = {
    operation: "commerce.product.create",
    count: 2,
    name: "Test Product",
    codePrefix: "TEST",
    catalogVersion: "staged",
    priceBookCode: "BOOK",
    currency: "AED",
    price: "12.3400",
    active: false,
  };
}
test("products preserve explicit quantity, exact money and inactive choice through accounted planning", async () => {
  productProposal();
  assert.deepEqual(
    (await planner.plan(request, configuration, "turn")).command,
    proposal,
  );
  assert.equal(calls[0].options.accounting.callId, "turn:intent");
  assert.match(calls[0].input.messages[0].content, /commerce.product.create/);
});
test("allowlisted selected schema updates preserve literal source, identity, revision and changed fields", async () => {
  configuration.workbench.schemaActions = {
    enabled: true,
    sources: { commerceData: ["product"] },
    timeoutMs: 30000,
  };
  request.authData.permissions = [
    "copilot.data.query",
    "copilot.mutation.prepare",
    "system.schema.manage",
  ];
  request.message =
    "Update record SKU-1 in schema product from source commerceData, revision 2, name Reviewed Product.";
  proposal = {
    operation: "data.record.update",
    sourceCode: "commerceData",
    schemaName: "product",
    identity: { code: "SKU-1", revision: 2 },
    changes: { name: "Reviewed Product" },
  };
  let validated = false;
  SERVICE.DefaultCopilotSchemaActionService = {
    declaration: (operation) => ({ kind: operation.split(".").at(-1) }),
    scope: async () => ({ descriptor: { schemaName: "product" } }),
    command: (command, descriptor) => {
      assert.deepEqual(command, proposal);
      assert.equal(descriptor.schemaName, "product");
      validated = true;
      return { code: "SKU-1" };
    },
  };
  assert.deepEqual(
    (await planner.plan(request, configuration, "turn")).command,
    proposal,
  );
  assert.equal(validated, true);
  assert.match(calls[0].input.messages[0].content, /data.record.update/);
});
test("notification retry planning advertises only a qualified owner and preserves literal order and kind", async () => {
  configuration.workbench.orderNotificationTarget = {
    enabled: true,
    moduleName: "digitalCore",
    connectionName: "commerce",
    targetAuthority: { runtimeRole: "COMMERCE" },
  };
  request.authData.permissions = [
    "copilot.mutation.prepare",
    "commerce.digital.notification.read",
    "commerce.digital.notification.retry",
  ];
  request.message =
    "Retry PURCHASED notification for order order-1 after I review it.";
  proposal = {
    operation: "commerce.orderNotification.retry",
    orderCode: "order-1",
    kind: "PURCHASED",
  };
  SERVICE.DefaultCopilotOrderNotificationActionService =
    require("../../copilotWorkbench/src/service/defaultCopilotOrderNotificationActionService");
  assert.deepEqual(
    (await planner.plan(request, configuration, "turn")).command,
    proposal,
  );
  assert.match(
    calls[0].input.messages[0].content,
    /commerce\.orderNotification\.retry/,
  );
  proposal.orderCode = "invented-order";
  assert.equal(
    (await planner.plan(request, configuration, "turn")).clarification,
    true,
  );
  configuration.workbench.orderNotificationTarget.enabled = false;
  assert.equal(await planner.plan(request, configuration, "turn"), null);
});
test("product planning refuses invented quantity, activation, numeric money, extra fields and changed native targets", async () => {
  productProposal();
  const original = structuredClone(proposal);
  for (const patch of [
    { count: 1 },
    { count: "2" },
    { active: true },
    { active: "false" },
    { price: 12.34 },
    { price: "12.34" },
    { url: "BOOK" },
    { codePrefix: "OTHER" },
  ]) {
    proposal = { ...original, ...patch };
    assert.equal(
      (await planner.plan(request, configuration, "turn")).clarification,
      true,
      JSON.stringify(patch),
    );
  }
  proposal = original;
  SERVICE.DefaultCopilotProviderService.invoke = async () => {
    delete configuration.workbench.target.productModule;
    return { content: JSON.stringify(proposal) };
  };
  assert.equal(
    (await planner.plan(request, configuration, "turn")).clarification,
    true,
  );
});
test("product input clarifies missing count and active instead of assigning implicit defaults", () => {
  productProposal();
  delete proposal.active;
  delete proposal.count;
  assert.deepEqual(
    SERVICE.DefaultCopilotRequestService.productCommandInput(proposal).missing,
    ["count", "active"],
  );
  for (const count of [0, 101, 1.5])
    assert.throws(() =>
      SERVICE.DefaultCopilotRequestService.productCommandInput({
        ...proposal,
        count,
        active: false,
      }),
    );
});
test("product-only requests do not advertise unconfigured targets or interpret delete/update as creation", async () => {
  productProposal();
  delete configuration.workbench.target;
  proposal = { ...proposal };
  assert.equal(
    (await planner.plan(request, configuration, "turn")).clarification,
    true,
  );
  const service = SERVICE.DefaultCopilotRequestService;
  for (const verb of ["Delete", "Update", "Remove", "Change"]) {
    assert.equal(
      service.assessMutationIntent(request.message.replace("Create", verb))
        .ambiguous,
      true,
    );
  }
});
test("planning respects a narrower effective provider profile without increasing its allowance", async () => {
  configuration.providers.profiles.conversation.maximumOutputTokens = 64;
  await planner.plan(request, configuration, "bounded-turn");
  assert.equal(calls[0].input.maximumOutputTokens, 64);
  configuration.providers.profiles.conversation.maximumOutputTokens = 4096;
  await planner.plan(request, configuration, "capped-turn");
  assert.equal(calls[1].input.maximumOutputTokens, 2048);
});
test("standalone invitations need no enterprise-create grant and preserve literal roles", async () => {
  configuration.workbench.standaloneInvitationsEnabled = true;
  request.authData.permissions = [
    "copilot.mutation.prepare",
    "profile.enterpriseAccess.assign",
  ];
  request.message =
    "Invite employee one@example.invalid with role VIEWER to existing enterprise ACME.";
  proposal = {
    operation: "profile.enterprise.invite",
    enterpriseCode: "ACME",
    employees: [{ email: "one@example.invalid", roleCode: "VIEWER" }],
  };
  assert.deepEqual(
    (await planner.plan(request, configuration, "turn")).command,
    proposal,
  );
  assert.doesNotMatch(
    calls[0].input.messages[0].content,
    /profile.enterprise.onboard/,
  );
  proposal.employees[0].roleCode = "ENTERPRISE_ADMIN";
  assert.equal(
    (await planner.plan(request, configuration, "turn")).clarification,
    true,
  );
});
test("standalone prices retain explicit decimal strings and never infer a missing currency", async () => {
  configuration.workbench.standalonePricesEnabled = true;
  configuration.workbench.target = {
    pricingModule: "pricing",
    connectionName: "owner",
  };
  request.message =
    "Create price PRICE-ONE for product PRODUCT-ONE in price book BOOK, amount 12.3400 AED, minimum quantity 1.";
  proposal = {
    operation: "commerce.price.create",
    prices: [
      {
        code: "PRICE-ONE",
        productCode: "PRODUCT-ONE",
        priceBookCode: "BOOK",
        unitAmount: "12.3400",
        currency: "AED",
        minQuantity: "1",
      },
    ],
  };
  assert.deepEqual(
    (await planner.plan(request, configuration, "turn")).command,
    proposal,
  );
  proposal.prices[0].currency = "USD";
  assert.equal(
    (await planner.plan(request, configuration, "turn")).clarification,
    true,
  );
  configuration.workbench.standalonePricesEnabled = false;
  assert.equal(
    (await planner.plan(request, configuration, "turn")).clarification,
    true,
  );
});
test("explicit supported prose produces a typed proposal through the existing accounting contract without any action or domain write", async () => {
  const result = await planner.plan(request, configuration, "turn");
  assert.deepEqual(result.command, proposal);
  assert.equal(result.usage.totalTokens, 50);
  assert.equal(calls[0].options.accounting.callId, "turn:intent");
  assert.equal(calls[0].options.accounting.request, request);
  assert.doesNotMatch(
    calls[0].input.messages[0].content,
    /waste.collectionCentre/,
  );
});
test("disabled mode, missing grants, ordinary questions and coupon-bearing input never invoke a provider", async () => {
  configuration.core.intentPlanning.enabled = false;
  assert.equal(await planner.plan(request, configuration, "turn"), null);
  configuration.core.intentPlanning.enabled = true;
  request.authData.permissions = ["copilot.mutation.prepare"];
  assert.equal(await planner.plan(request, configuration, "turn"), null);
  request.authData.permissions = ["*"];
  for (const message of [
    "Explain the framework",
    "Create enterprise with coupon token PRIVATE",
    "Create enterprise using password PRIVATE",
  ])
    assert.equal(
      await planner.plan({ ...request, message }, configuration, "turn"),
      null,
    );
  assert.equal(calls.length, 0);
});
test("invented values, role escalation, unknown fields and an unavailable operation become clarification", async () => {
  const original = structuredClone(proposal);
  for (const invalid of [
    {
      ...original,
      enterprise: { ...original.enterprise, code: "HALLUCINATED" },
    },
    { ...original, tenant: "tenant" },
    {
      ...original,
      employees: [
        {
          email: "admin@example.invalid",
          roleCode: "ENTERPRISE_ADMIN",
        },
      ],
    },
    { operation: "waste.collectionCentre.create", centres: [] },
    { clarification: true },
  ]) {
    proposal = invalid;
    const result = await planner.plan(request, configuration, "turn");
    assert.equal(result.clarification, true);
    assert.equal(result.command, undefined);
  }
});
test("implicit empty invitations and revocation while awaiting model output never produce a command", async () => {
  request.message = request.message.replace(" and no employees", "");
  assert.equal(
    (await planner.plan(request, configuration, "turn")).clarification,
    true,
  );
  request.message += " no employees";
  SERVICE.DefaultCopilotProviderService.invoke = async () => {
    request.authData.permissions = [];
    return { content: JSON.stringify(proposal) };
  };
  assert.equal(
    (await planner.plan(request, configuration, "turn")).clarification,
    true,
  );
});
test("provider/budget failure propagates rather than falling back to unaccounted inference", async () => {
  SERVICE.DefaultCopilotProviderService.invoke = async () => {
    throw new Error("BUDGET_EXHAUSTED");
  };
  await assert.rejects(
    planner.plan(request, configuration, "turn"),
    /BUDGET_EXHAUSTED/,
  );
});

test("Core turns a supported prose proposal into review and records planning usage without executing a domain command", async () => {
  configuration.api = { enabled: true };
  configuration.conversation = {};
  configuration.workbench.enterpriseTarget = {
    enabled: true,
    moduleName: "profile",
    connectionName: "profile-owner",
  };
  request.httpRequest = { headers: { authorization: "Bearer employee" } };
  const events = [],
    completions = [];
  SERVICE.DefaultCopilotIntentPlanningService = planner;
  SERVICE.DefaultCopilotWorkbenchService = require("../../copilotWorkbench/src/service/defaultCopilotWorkbenchService");
  SERVICE.DefaultCopilotActionExecutionService = require("../../copilotWorkbench/src/service/defaultCopilotActionExecutionService");
  SERVICE.DefaultCopilotActionService = {
    save: async (r) => ({ code: "SUC_DB", result: r.model }),
  };
  SERVICE.DefaultCopilotConversationService = {
    getOwned: async () => ({ code: "conversation" }),
    acceptTurn: async () => ({ code: "turn", state: "ACCEPTED" }),
    appendEvent: async (_turn, type) => events.push(type),
    complete: async (...args) => completions.push(args),
    fail: async () => assert.fail("Unexpected failure"),
  };
  const result = await core.performTurn(request);
  assert.equal(result.confirmation.operationId, "profile.enterprise.onboard");
  assert.deepEqual(events, ["CONFIRMATION_REQUIRED"]);
  assert.equal(completions[0][3].usage.totalTokens, 50);
  assert.equal(completions[0][3].finishReason, "confirmation_required");
  assert.equal(calls.length, 1);
});

test("typed Product conversation prepares without a model and clarifies an omitted lifecycle choice", async () => {
  productProposal();
  configuration.api = { enabled: true };
  configuration.conversation = {};
  request.httpRequest = { headers: { authorization: "Bearer employee" } };
  SERVICE.DefaultCopilotIntentPlanningService = planner;
  SERVICE.DefaultCopilotWorkbenchService = require("../../copilotWorkbench/src/service/defaultCopilotWorkbenchService");
  SERVICE.DefaultCopilotActionExecutionService = require("../../copilotWorkbench/src/service/defaultCopilotActionExecutionService");
  let saved = 0;
  SERVICE.DefaultCopilotActionService = {
    save: async (r) => {
      saved++;
      return { code: "SUC_DB", result: r.model };
    },
  };
  SERVICE.DefaultCopilotConversationService = {
    getOwned: async () => ({ code: "conversation" }),
    acceptTurn: async () => ({ code: "turn", state: "ACCEPTED" }),
    appendEvent: async () => {},
    complete: async () => {},
    fail: async () => assert.fail("Unexpected failure"),
  };
  request.message = JSON.stringify(proposal);
  assert.equal(
    (await core.performTurn(request)).confirmation.operationId,
    "commerce.product.create",
  );
  assert.equal(saved, 1);
  delete proposal.active;
  request.message = JSON.stringify(proposal);
  assert.deepEqual((await core.performTurn(request)).clarification.missing, [
    "active",
  ]);
  assert.equal(saved, 1);
  assert.equal(calls.length, 0);
});
