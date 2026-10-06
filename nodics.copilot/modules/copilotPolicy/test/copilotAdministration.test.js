/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @file Covers canonical governance delegation, scoped defaults, ceilings and stale submission. */
"use strict";
const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const owner = require("../src/service/defaultCopilotAdministrationService");
const policy = require("../src/service/defaultCopilotPolicyService");
const activation = require("../../../../nodics.foundation/modules/nDynamo/src/service/audit/defaultRuntimeConfigurationActivationRequestService");
const usage = require("../../copilotProviders/modules/copilotProvider/src/service/defaultCopilotUsageService");
let config, request, writes;
/** Installs real Knowledge policy/registry owners and the refresh proposal extension. */
function refreshFixture() {
  config.knowledge = structuredClone(
    require("../../copilotKnowledge/config/properties").copilot.knowledge,
  );
  config.knowledge.sourceRegistry.definitions = [
    {
      code: "guides",
      owner: "framework",
      module: "module",
      repository: "repo",
      project: "project",
      version: "1",
      sourceType: "README",
      classification: "INTERNAL",
      paths: ["**/*.md"],
      allowedChannels: ["EMPLOYEE"],
      requiredPermissions: ["copilot.knowledge.internal.read"],
      secretScanPolicy: "REQUIRED",
      enabled: true,
    },
  ];
  request.authData.permissions.push(
    "copilot.configuration.admin",
    "copilot.knowledge.internal.read",
    "copilot.knowledge.source.manage",
  );
  const context = SERVICE.DefaultCopilotOrchestrationService.securityContext;
  SERVICE.DefaultCopilotOrchestrationService.securityContext = (r) => ({
    ...context(r),
    customerProject: "project",
    environment: "test",
  });
  SERVICE.DefaultCopilotAdministrationService = owner;
  SERVICE.DefaultCopilotRefreshAdministrationService = require("../src/service/defaultCopilotRefreshAdministrationService");
  SERVICE.DefaultCopilotKnowledgeRuntimeService = require("../../copilotKnowledge/src/service/defaultCopilotKnowledgeRuntimeService");
  SERVICE.DefaultCopilotKnowledgeGroupService = require("../../copilotKnowledge/src/service/defaultCopilotKnowledgeGroupService");
  SERVICE.DefaultCopilotKnowledgeSourceRegistryService = require("../../copilotKnowledge/src/service/defaultCopilotKnowledgeSourceRegistryService");
  request.body = {
    section: "refresh-workflow-new",
    revision: "a".repeat(64),
    reason: "Assign reviewed refresh",
    values: {
      assigned: true,
      sourceCode: "guides",
      definitionCode: "refresh-docs",
      version: 1,
    },
  };
  return {
    tenantCode: "tenant",
    enterpriseCode: "acme",
    projectCode: "project",
    environmentCode: "test",
    sourceCode: "guides",
    definitionCode: "refresh-docs",
    version: 1,
  };
}
beforeEach(() => {
  config = {
    policy: {
      administration: {
        delegations: [
          {
            tenantCode: "tenant",
            enterpriseCode: "acme",
            sections: ["allocations", "groups"],
          },
        ],
      },
    },
    providers: {
      default: { adapter: "ollama", profile: "conversation" },
      profiles: { conversation: {} },
      adapters: {
        ollama: {
          enabled: true,
          model: { name: "local-model" },
          credential: { secretRef: "never-return" },
        },
      },
      accounting: {
        enabled: true,
        period: "MONTH",
        timezone: "UTC",
        tenantLimit: 1000,
        maximumEntries: 5000,
        maximumAttempts: 8,
        warningPercentages: [80],
        enterprises: [
          {
            tenantCode: "tenant",
            enterpriseCode: "acme",
            limit: 500,
            defaultLimit: 200,
            adapters: ["ollama"],
            profiles: ["conversation"],
            users: [
              {
                principalCode: "employee",
                limit: 100,
                defaultLimit: 80,
              },
            ],
          },
          {
            tenantCode: "other",
            enterpriseCode: "foreign",
            limit: 300,
            adapters: ["ollama"],
            profiles: ["conversation"],
            users: [],
          },
        ],
      },
    },
    conversation: { recording: { enabled: true, version: "1" } },
  };
  request = {
    tenant: "tenant",
    authData: {
      loginId: "admin",
      enterpriseCode: "acme",
      permissions: [
        "copilot.configuration.read",
        "copilot.configuration.manage",
      ],
    },
  };
  writes = [];
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code) {
        super(code);
        this.code = code;
      }
    },
  };
  global.CONFIG = { get: () => config };
  global.SERVICE = {
    DefaultCopilotPolicyService: policy,
    DefaultCopilotUsageService: usage,
    DefaultCopilotOrchestrationService: {
      securityContext: (r) => ({
        channel: "EMPLOYEE",
        tenant: r.tenant,
        enterprise: r.authData.enterpriseCode,
        actor: r.authData.loginId,
        permissions: r.authData.permissions,
        roles: [],
        groups: [],
      }),
    },
    DefaultRuntimePropertyPersistenceService: {
      policy: () => ({ enabled: true }),
      refresh: async () => ({ revision: "a".repeat(64) }),
    },
    DefaultRuntimeConfigurationActivationRequestService: {
      createConfigurationDigest: activation.createConfigurationDigest,
      previewActivationRequest: async (_r, payload) => ({
        persistenceRevision: "a".repeat(64),
        configuration: payload.configuration,
      }),
      createActivationRequest: async (r) => {
        writes.push(r);
        return {
          code: "SUC_SYS_00000",
          data: { code: "request-1", status: "REQUESTED" },
        };
      },
    },
  };
});

/** Installs actual Workbench target validation without business transports. */
function businessControls() {
  config.core = { intentPlanning: { enabled: false } };
  config.workbench = {
    standaloneInvitationsEnabled: false,
    standalonePricesEnabled: false,
    receiptRecovery: { enabled: false },
    enterpriseTarget: {
      enabled: true,
      moduleName: "profile",
      connectionName: "private-profile",
    },
    target: { pricingModule: "pricing", connectionName: "private-commerce" },
  };
  SERVICE.DefaultCopilotInvitationActionService = require("../../copilotWorkbench/src/service/defaultCopilotInvitationActionService");
  SERVICE.DefaultCopilotEnterpriseActionService = require("../../copilotWorkbench/src/service/defaultCopilotEnterpriseActionService");
  SERVICE.DefaultCopilotPriceActionService = require("../../copilotWorkbench/src/service/defaultCopilotPriceActionService");
  SERVICE.DefaultCopilotOrchestrationService.actionTarget =
    require("../../copilotCore/src/service/defaultCopilotOrchestrationService").actionTarget;
  request.authData.permissions.push("copilot.configuration.admin");
  request.body = {
    section: "business-actions",
    revision: "a".repeat(64),
    reason: "Admit reviewed operations",
    values: { invitations: true, prices: true, planning: true, recovery: true },
  };
}

test("business controls use exact tenant-runtime boolean proposals, not native routes or direct activation", async () => {
  businessControls();
  const section = owner
    .sections(config, owner.scope(request))
    .find((item) => item.code === "business-actions");
  assert.equal(section.scope, "TENANT_RUNTIME");
  assert.equal(section.editable, true);
  assert.equal(section.fields.length, 4);
  assert.ok(
    section.fields.every(
      (field) => field.kind === "boolean" && field.value === false,
    ),
  );
  assert.doesNotMatch(
    JSON.stringify(section),
    /private-profile|private-commerce|targetAuthority/,
  );
  const review = await owner.preview(request);
  assert.equal(writes.length, 0);
  assert.equal(config.workbench.standaloneInvitationsEnabled, false);
  request.body.previewDigest = review.previewDigest;
  assert.equal((await owner.submit(request)).status, "REQUESTED");
  assert.deepEqual(
    writes[0].activationRequest.configuration.$propertyPatch.values.map(
      (item) => item.path,
    ),
    [
      "copilot.workbench.standaloneInvitationsEnabled",
      "copilot.workbench.standalonePricesEnabled",
      "copilot.core.intentPlanning.enabled",
      "copilot.workbench.receiptRecovery.enabled",
    ],
  );
  assert.equal(config.workbench.standalonePricesEnabled, false);
});

test("business control delegation never supplies elevated authority and unknown fields cannot become paths", async () => {
  businessControls();
  config.policy.administration.delegations[0].sections.push("business-actions");
  request.authData.permissions = request.authData.permissions.filter(
    (value) => value !== "copilot.configuration.admin",
  );
  assert.equal(
    owner
      .sections(config, owner.scope(request))
      .some((item) => item.code === "business-actions"),
    false,
  );
  await assert.rejects(owner.preview(request));
  request.authData.permissions.push("copilot.configuration.admin");
  request.body.values.connectionName = "caller-route";
  await assert.rejects(owner.preview(request));
  delete request.body.values.connectionName;
  request.body.values.recovery = "true";
  await assert.rejects(owner.preview(request));
  assert.equal(writes.length, 0);
});

test("enablement needs configured native targets but disabling writes preserves independent recovery", async () => {
  businessControls();
  config.workbench.target.connectionName = null;
  await assert.rejects(owner.preview(request));
  config.workbench.target.connectionName = "private-commerce";
  config.workbench.enterpriseTarget.enabled = false;
  await assert.rejects(owner.preview(request));
  request.body.values.invitations = false;
  request.body.values.prices = false;
  config.workbench.target.connectionName = null;
  assert.ok((await owner.preview(request)).previewDigest);
  assert.equal(writes.length, 0);
});

test("business control revocation during governance preview and stale reviewed intent cannot submit", async () => {
  businessControls();
  const review = await owner.preview(request);
  request.body.previewDigest = review.previewDigest;
  request.body.values.planning = false;
  await assert.rejects(owner.submit(request));
  const preview =
    SERVICE.DefaultRuntimeConfigurationActivationRequestService
      .previewActivationRequest;
  SERVICE.DefaultRuntimeConfigurationActivationRequestService.previewActivationRequest =
    async (...args) => {
      const result = await preview(...args);
      request.authData.permissions = request.authData.permissions.filter(
        (value) => value !== "copilot.configuration.admin",
      );
      return result;
    };
  await assert.rejects(owner.preview(request));
  assert.equal(writes.length, 0);
});

test("independent audit policies require their own delegation and permission and preserve foreign scope", async () => {
  const audit = require("../../copilotConversation/src/service/defaultCopilotAuditRetentionService");
  SERVICE.DefaultCopilotAuditRetentionService = audit;
  const foreign = {
    tenantCode: "other",
    enterpriseCode: "foreign",
    kind: "ACTION",
    retentionDays: 365,
    holdAll: true,
    recordCodes: ["private-audit"],
    conversationCodes: [],
  };
  config.conversation.auditRetention = {
    maximumBatch: 25,
    deletionEnabled: false,
    enterprisePolicies: [foreign],
  };
  request.body = {
    section: "audit-retention-ACTION",
    revision: "a".repeat(64),
    reason: "Independent retention review",
    values: {
      retentionDays: 365,
      holdAll: true,
      recordCodes: ["held-action"],
      conversationCodes: [],
    },
  };
  let form = (await owner.get(request)).sections.find(
    (item) => item.code === request.body.section,
  );
  assert.equal(form.scope, "ENTERPRISE");
  assert.equal(form.editable, false);
  assert(!JSON.stringify(form).includes("private-audit"));
  await assert.rejects(owner.preview(request));
  config.policy.administration.delegations[0].sections.push("audit-retention");
  await assert.rejects(owner.preview(request));
  request.authData.permissions.push("copilot.audit.retention.configure");
  form = (await owner.get(request)).sections.find(
    (item) => item.code === request.body.section,
  );
  assert.equal(form.editable, true);
  const review = await owner.preview(request);
  request.body.previewDigest = review.previewDigest;
  await owner.submit(request);
  const patch =
    writes[0].activationRequest.configuration.$propertyPatch.values[0];
  assert.equal(
    patch.path,
    "copilot.conversation.auditRetention.enterprisePolicies",
  );
  assert.deepEqual(patch.value, [
    foreign,
    {
      tenantCode: "tenant",
      enterpriseCode: "acme",
      kind: "ACTION",
      ...request.body.values,
    },
  ]);
  assert.equal(config.conversation.auditRetention.deletionEnabled, false);
  request.body.values.retentionDays = 0;
  await assert.rejects(owner.preview(request));
  request.body.values.retentionDays = 365;
  request.body.values.recordCodes = ["duplicate", "duplicate"];
  await assert.rejects(owner.preview(request));
});
test("refresh assignments use governed proposals and preserve foreign deployments without exposing them", async () => {
  const row = refreshFixture();
  const foreign = {
    ...row,
    enterpriseCode: "foreign",
    definitionCode: "private-definition",
  };
  config.knowledge.workflowRefresh.assignments.push(foreign);
  const settings = await owner.get(request);
  const forms = settings.sections.filter((section) =>
    section.code.startsWith("refresh-"),
  );
  assert.equal(forms.length, 2);
  assert(forms.every((form) => form.scope === "ENTERPRISE"));
  assert(!JSON.stringify(forms).includes("private-definition"));
  const review = await owner.preview(request);
  assert.equal(writes.length, 0);
  request.body.previewDigest = review.previewDigest;
  await owner.submit(request);
  const entry =
    writes[0].activationRequest.configuration.$propertyPatch.values[0];
  assert.equal(entry.path, "copilot.knowledge.workflowRefresh.assignments");
  assert.deepEqual(entry.value, [foreign, row]);
  assert.deepEqual(config.knowledge.workflowRefresh.assignments, [foreign]);
  assert.equal(config.knowledge.workflowRefresh.enabled, false);
});

test("publisher assignment requires its matching workflow and removing a referenced workflow is rejected", async () => {
  const row = refreshFixture();
  request.body.section = "refresh-publisher-new";
  request.body.values.publisherId = "source-publisher";
  await assert.rejects(owner.preview(request));
  config.knowledge.workflowRefresh.assignments = [row];
  const review = await owner.preview(request);
  request.body.previewDigest = review.previewDigest;
  await owner.submit(request);
  const publishers =
    writes[0].activationRequest.configuration.$propertyPatch.values[0].value;
  assert.deepEqual(publishers, [{ ...row, publisherId: "source-publisher" }]);
  config.knowledge.eventRefresh.publishers = publishers;
  request.body = {
    ...request.body,
    section: "refresh-workflow-0",
    values: {
      assigned: false,
      sourceCode: row.sourceCode,
      definitionCode: row.definitionCode,
      version: 1,
    },
  };
  await assert.rejects(owner.preview(request));
  request.body.section = "refresh-publisher-0";
  request.body.values.publisherId = "source-publisher";
  const removal = await owner.preview(request);
  assert.deepEqual(removal.changes, [
    { label: "Assignment enabled", before: true, after: false },
  ]);
});

test("duplicates, foreign indices, unknown sources and arbitrary request fields cannot create refresh authority", async () => {
  const row = refreshFixture();
  config.knowledge.workflowRefresh.assignments = [row];
  await assert.rejects(owner.preview(request));
  config.knowledge.workflowRefresh.assignments = [
    { ...row, environmentCode: "production" },
  ];
  request.body.section = "refresh-workflow-0";
  await assert.rejects(owner.preview(request));
  request.body.section = "refresh-workflow-new";
  for (const values of [
    { ...request.body.values, sourceCode: "hidden" },
    { ...request.body.values, environmentCode: "production" },
    { ...request.body.values, version: 1.5 },
    { ...request.body.values, definitionCode: "https://untrusted" },
  ]) {
    const original = request.body.values;
    request.body.values = values;
    await assert.rejects(owner.preview(request));
    request.body.values = original;
  }
  assert.equal(writes.length, 0);
});

test("refresh forms require independent source grants, elevated management and active group visibility", async () => {
  refreshFixture();
  config.knowledge.groups = {
    enabled: true,
    definitions: [],
    assignments: [
      {
        tenantCode: "tenant",
        enterpriseCode: "acme",
        groupCodes: [],
        activeGroupCodes: [],
        allowedSourceCodes: ["guides"],
      },
    ],
  };
  assert.equal(
    (await owner.get(request)).sections.some((section) =>
      section.code.startsWith("refresh-"),
    ),
    false,
  );
  config.knowledge.groups.enabled = false;
  request.authData.permissions = request.authData.permissions.filter(
    (p) => p !== "copilot.knowledge.source.manage",
  );
  await assert.rejects(owner.preview(request));
  request.authData.permissions.push("copilot.knowledge.source.manage");
  request.authData.permissions = request.authData.permissions.filter(
    (p) => p !== "copilot.configuration.admin",
  );
  config.policy.administration.delegations[0].sections.push(
    "refresh-workflow-new",
  );
  await assert.rejects(owner.preview(request));
});

test("authority revocation during asynchronous review prevents proposal submission", async () => {
  refreshFixture();
  const preview =
    SERVICE.DefaultRuntimeConfigurationActivationRequestService
      .previewActivationRequest;
  SERVICE.DefaultRuntimeConfigurationActivationRequestService.previewActivationRequest =
    async (...args) => {
      const response = await preview(...args);
      request.authData.permissions = request.authData.permissions.filter(
        (p) => p !== "copilot.configuration.manage",
      );
      return response;
    };
  await assert.rejects(owner.submit(request));
  assert.equal(writes.length, 0);
});

test("source revocation and publisher ambiguity reject without submitting configuration", async () => {
  const row = refreshFixture();
  config.knowledge.workflowRefresh.assignments = [row, { ...row, version: 2 }];
  config.knowledge.eventRefresh.publishers = [
    { ...row, publisherId: "publisher" },
  ];
  request.body.section = "refresh-publisher-new";
  request.body.values = {
    assigned: true,
    sourceCode: row.sourceCode,
    definitionCode: row.definitionCode,
    version: 2,
    publisherId: "publisher",
  };
  await assert.rejects(owner.preview(request));
  request.body.values.publisherId = "new-publisher";
  const preview =
    SERVICE.DefaultRuntimeConfigurationActivationRequestService
      .previewActivationRequest;
  SERVICE.DefaultRuntimeConfigurationActivationRequestService.previewActivationRequest =
    async (...args) => {
      const result = await preview(...args);
      config.knowledge.sourceRegistry.definitions[0].enabled = false;
      return result;
    };
  await assert.rejects(owner.submit(request));
  assert.equal(writes.length, 0);
});
test("delegated settings contain only own enterprise and no provider secrets", async () => {
  const result = await owner.get(request);
  assert.deepEqual(
    result.sections.map((section) => section.code),
    ["allocations"],
  );
  assert.equal(result.sections[0].editable, true);
  assert.equal(JSON.stringify(result).includes("foreign"), false);
  assert.equal(JSON.stringify(result).includes("never-return"), false);
});

test("automation proposes fixed tenant-runtime gates without activating or exposing publisher routing", async () => {
  config.knowledge = {
    generationPublication: { enabled: false, incrementalEnabled: false },
    workflowRefresh: {
      enabled: false,
      actionAuthority: { targetModule: "private-peer" },
    },
    eventRefresh: {
      enabled: false,
      publishers: [{ publisherId: "private-publisher" }],
    },
    writerRecovery: { enabled: false, minimumPendingAgeMs: 300000 },
  };
  request.authData.permissions.push("copilot.configuration.admin");
  const section = (await owner.get(request)).sections.find(
    (item) => item.code === "automation",
  );
  assert.equal(section.scope, "TENANT_RUNTIME");
  assert.doesNotMatch(
    JSON.stringify(section),
    /private-peer|private-publisher/,
  );
  request.body = {
    section: "automation",
    revision: "a".repeat(64),
    reason: "Prepare controlled source refresh",
    values: {
      publication: true,
      incremental: true,
      workflow: true,
      events: true,
      recovery: true,
      minimumPendingAgeMs: 600000,
    },
  };
  request.body.previewDigest = (await owner.preview(request)).previewDigest;
  assert.equal(writes.length, 0);
  assert.equal((await owner.submit(request)).status, "REQUESTED");
  assert.equal(writes.length, 1);
  const changes =
    writes[0].activationRequest.configuration.$propertyPatch.values;
  assert.deepEqual(
    changes.map((entry) => entry.path),
    [
      "copilot.knowledge.generationPublication.enabled",
      "copilot.knowledge.generationPublication.incrementalEnabled",
      "copilot.knowledge.workflowRefresh.enabled",
      "copilot.knowledge.eventRefresh.enabled",
      "copilot.knowledge.writerRecovery.enabled",
      "copilot.knowledge.writerRecovery.minimumPendingAgeMs",
    ],
  );
  assert.equal(config.knowledge.eventRefresh.enabled, false);
  assert.equal(config.knowledge.writerRecovery.minimumPendingAgeMs, 300000);
});

test("automation rejects delegated access, inconsistent gates, unsafe ages and submitted paths", async () => {
  config.knowledge = {};
  config.policy.administration.delegations[0].sections.push("automation");
  request.body = {
    section: "automation",
    revision: "a".repeat(64),
    reason: "Prepare refresh",
    values: {
      publication: true,
      incremental: true,
      workflow: true,
      events: true,
      recovery: true,
      minimumPendingAgeMs: 300000,
    },
  };
  assert.equal(
    (await owner.get(request)).sections.some(
      (item) => item.code === "automation",
    ),
    false,
  );
  await assert.rejects(owner.preview(request));
  request.authData.permissions.push("copilot.configuration.admin");
  for (const invalid of [
    { publication: false },
    { workflow: false },
    { minimumPendingAgeMs: 59999 },
    { minimumPendingAgeMs: 86400001 },
    { minimumPendingAgeMs: 60000.5 },
    { events: "true" },
    { "copilot.knowledge.eventRefresh.publishers": [] },
  ]) {
    const values = request.body.values;
    request.body.values = { ...values, ...invalid };
    await assert.rejects(owner.preview(request));
    request.body.values = values;
  }
  request.body.previewDigest = (await owner.preview(request)).previewDigest;
  request.authData.permissions.pop();
  await assert.rejects(owner.submit(request));
  assert.equal(writes.length, 0);
});

test("profile tuning is bounded, elevated and proposed through owner paths only", async () => {
  config.providers.profiles.conversation = {
    temperature: 0.2,
    topP: 0.9,
    maximumOutputTokens: 2048,
    structuredOutput: false,
  };
  SERVICE.DefaultCopilotProviderService = require("../../copilotProviders/modules/copilotProvider/src/service/defaultCopilotProviderService");
  request.body = {
    section: "profile-0",
    revision: "a".repeat(64),
    reason: "Tune test profile",
    values: {
      temperature: 0.15,
      topP: 0.95,
      maximumOutputTokens: 1024,
      structuredOutput: true,
    },
  };
  await assert.rejects(owner.preview(request));
  request.authData.permissions.push("copilot.configuration.admin");
  const review = await owner.preview(request);
  assert.equal(
    review.changes.find((item) => item.label === "Temperature").after,
    0.15,
  );
  assert.equal(writes.length, 0);
  assert.equal(config.providers.profiles.conversation.temperature, 0.2);
  request.body.values.temperature = 3;
  await assert.rejects(owner.preview(request));
  request.body.values.temperature = 0.2;
  request.body.values.maximumOutputTokens = 0;
  await assert.rejects(owner.preview(request));
});

test("history binds current enterprise before query and projects no configurations or reasons", async () => {
  const row = {
    code: "request-a",
    requestEnterpriseCode: "acme",
    moduleName: "copilotPolicy",
    configurationType: "propertyConfiguration",
    configurationCode: "tenantProperties",
    requestedBy: "admin",
    status: "ACTIVATED",
    lifecycle: [{ at: "2026-10-03T00:00:00.000Z" }],
    configuration: { secret: "hidden" },
    requestReason: "private",
  };
  SERVICE.DefaultRuntimeConfigurationActivationRequestService.getActivationRequests =
    async (input) => {
      assert.equal(input.activationRequest.requestEnterpriseCode, "acme");
      assert.equal(input.authData, request.authData);
      return {
        code: "SUC_TEST",
        data: [row],
        metadata: { tenant: "tenant" },
      };
    };
  const value = await owner.history(request);
  assert.equal(value.items[0].status, "ACTIVATED");
  assert.doesNotMatch(JSON.stringify(value), /hidden|private|configuration/);
  row.requestEnterpriseCode = "other";
  await assert.rejects(owner.history(request));
});
test("reviewed defaults submit to existing approval owner without activating or altering foreign entries", async () => {
  request.body = {
    section: "allocations",
    revision: "a".repeat(64),
    values: { enterprise: 150, "user.0": 0 },
    reason: "Reduce next available default",
  };
  const review = await owner.preview(request);
  assert.equal(writes.length, 0);
  assert.equal(review.changes.length, 2);
  request.body.previewDigest = review.previewDigest;
  const result = await owner.submit(request);
  assert.equal(result.status, "REQUESTED");
  assert.equal(writes.length, 1);
  const entries =
    writes[0].activationRequest.configuration.$propertyPatch.values[0].value;
  assert.equal(entries[0].users[0].defaultLimit, 0);
  assert.deepEqual(entries[1], config.providers.accounting.enterprises[1]);
  assert.equal(config.providers.accounting.enterprises[0].defaultLimit, 200);
  assert.equal(writes[0].httpRequest, undefined);
});
test("revoked delegation, altered values, foreign scope and stale revisions fail before persistence", async () => {
  request.body = {
    section: "allocations",
    revision: "a".repeat(64),
    values: { enterprise: 150, "user.0": 0 },
    reason: "Review",
  };
  request.body.previewDigest = (await owner.preview(request)).previewDigest;
  request.body.values.enterprise = 160;
  await assert.rejects(owner.submit(request), /ERR_CPL_00011/);
  config.policy.administration.delegations = [];
  await assert.rejects(owner.preview(request), /ERR_CPL_00008/);
  request.body.revision = null;
  await assert.rejects(owner.preview(request), /ERR_CPL_00011/);
  assert.equal(writes.length, 0);
});
test("ceilings and provider settings require independent administrator grant", async () => {
  request.body = {
    section: "provider",
    revision: "a".repeat(64),
    values: {
      adapter: "ollama",
      profile: "conversation",
      "model.ollama": "another-model",
    },
    reason: "Local model",
  };
  await assert.rejects(owner.preview(request), /ERR_CPL_00008/);
  request.authData.permissions.push("copilot.configuration.admin");
  const result = await owner.preview(request);
  assert.equal(result.changes[0].after, "another-model");
  request.body.values["model.ollama"] = "https://secret@example.com";
  await assert.rejects(owner.preview(request), /ERR_CPL_00009/);
});
test("boundaries reject ceilings, unknown keys and unavailable durable governance", async () => {
  request.body = {
    section: "allocations",
    revision: "a".repeat(64),
    values: { enterprise: 501, "user.0": 80 },
    reason: "Invalid",
  };
  await assert.rejects(owner.preview(request), /ERR_CPL_00009/);
  request.body.values.enterprise = 100;
  request.body.configuration = { bypass: true };
  await assert.rejects(owner.preview(request), /ERR_CPL_00011/);
  SERVICE.DefaultRuntimePropertyPersistenceService.policy = () => ({
    enabled: false,
  });
  await assert.rejects(owner.get(request), /ERR_CPL_00010/);
});

test("canonical property validation accepts required scan metadata but still rejects credential-shaped values", () => {
  const preview = require("../../../../nodics.foundation/modules/nDynamo/src/service/audit/defaultRuntimeConfigurationPreviewService");
  const knowledge = require("../../copilotKnowledge/config/properties");
  CONFIG.get = (key) =>
    key === "runtimePropertyGovernance"
      ? {
          ...knowledge.runtimePropertyGovernance,
          persistence: { enabled: true },
        }
      : config;
  const patch = {
    copilot: {
      knowledge: {
        sourceRegistry: {
          definitions: [{ secretScanPolicy: "REQUIRED" }],
        },
      },
    },
  };
  assert.doesNotThrow(() => preview.validatePropertyConfiguration(patch));
  patch.copilot.knowledge.sourceRegistry.definitions[0].secretScanPolicy =
    "secret-value";
  assert.throws(() => preview.validatePropertyConfiguration(patch));
  assert.throws(() =>
    preview.validatePropertyConfiguration({
      other: { secretScanPolicy: "REQUIRED" },
    }),
  );
  assert.throws(() =>
    preview.validatePropertyConfiguration({
      copilot: {
        knowledge: {
          sourceRegistry: {
            definitions: [{ credential: "REQUIRED" }],
          },
        },
      },
    }),
  );
});

test("runtime owner refuses a changed expected preview before saving a proposal", async () => {
  let saved = false;
  const service = {
    ...activation,
    prepareRequestPayload: async (_r, payload) => payload,
    previewActivationRequest: async () => ({ changedPaths: ["other"] }),
    persistRequestModel: async () => {
      saved = true;
    },
  };
  await assert.rejects(
    service.createActivationRequest({
      activationRequest: { expectedPreviewDigest: "a".repeat(64) },
    }),
  );
  assert.equal(saved, false);
});

test("group authoring and source exclusion use real owner validation and retain unrelated definitions", async () => {
  const knowledge = require("../../copilotKnowledge/config/properties");
  config.knowledge = structuredClone(knowledge.copilot.knowledge);
  config.knowledge.sourceRegistry.definitions = [
    {
      code: "guides",
      owner: "framework",
      module: "module",
      repository: "repo",
      project: "project",
      version: "1",
      sourceType: "README",
      classification: "INTERNAL",
      paths: ["**/*.md"],
      allowedChannels: ["EMPLOYEE"],
      requiredPermissions: ["copilot.knowledge.internal.read"],
      secretScanPolicy: "REQUIRED",
      enabled: true,
    },
  ];
  request.authData.permissions.push(
    "copilot.configuration.admin",
    "copilot.knowledge.internal.read",
    "copilot.knowledge.source.manage",
  );
  SERVICE.DefaultCopilotKnowledgeRuntimeService = require("../../copilotKnowledge/src/service/defaultCopilotKnowledgeRuntimeService");
  SERVICE.DefaultCopilotKnowledgeGroupService = require("../../copilotKnowledge/src/service/defaultCopilotKnowledgeGroupService");
  SERVICE.DefaultCopilotKnowledgeSourceRegistryService = require("../../copilotKnowledge/src/service/defaultCopilotKnowledgeSourceRegistryService");
  const preview = require("../../../../nodics.foundation/modules/nDynamo/src/service/audit/defaultRuntimeConfigurationPreviewService");
  CONFIG.get = (key) =>
    key === "runtimePropertyGovernance"
      ? knowledge.runtimePropertyGovernance
      : config;
  CONFIG.getProperties = () => ({ copilot: config });
  SERVICE.DefaultRuntimeConfigurationActivationRequestService.previewActivationRequest =
    async (r, payload) => ({
      ...preview.createPropertyPreview({ ...payload, tenant: r.tenant }),
      persistenceRevision: "a".repeat(64),
    });
  request.body = {
    section: "new-group",
    revision: "a".repeat(64),
    values: {
      code: "support",
      name: "Customer support",
      active: true,
      sourceCodes: ["guides"],
    },
    reason: "Organize support knowledge",
  };
  const review = await owner.preview(request);
  assert.equal(review.changes.length, 4);
  request.body = {
    section: "source-0",
    revision: "a".repeat(64),
    values: {
      enabled: true,
      version: "1",
      paths: ["**/*.md"],
      excludedPaths: ["private"],
    },
    reason: "Exclude private content",
  };
  const exclusions = await owner.preview(request);
  assert.deepEqual(exclusions.changes, [
    { label: "Excluded paths", before: [], after: ["private"] },
  ]);
  request.body.previewDigest = exclusions.previewDigest;
  await owner.submit(request);
  const result =
    writes[0].activationRequest.configuration.$propertyPatch.values[0].value;
  assert.equal(result[0].secretScanPolicy, "REQUIRED");
  assert.deepEqual(result[0].excludedPaths, ["private"]);
  request.body.values.paths = ["../private"];
  await assert.rejects(owner.preview(request));
  config.knowledge.groups = {
    enabled: true,
    definitions: [],
    assignments: [
      {
        tenantCode: "tenant",
        enterpriseCode: "acme",
        groupCodes: [],
        activeGroupCodes: [],
        allowedSourceCodes: ["guides"],
      },
    ],
  };
  config.policy.administration.delegations[0].sections.push("group-authoring");
  request.authData.permissions = request.authData.permissions.filter(
    (value) => value !== "copilot.configuration.admin",
  );
  request.body = {
    section: "enterprise-new-group",
    revision: "a".repeat(64),
    values: {
      code: "acme-support",
      name: "Support team",
      active: true,
      sourceCodes: ["guides"],
    },
    reason: "Organize approved enterprise sources",
  };
  const enterpriseReview = await owner.preview(request);
  request.body.previewDigest = enterpriseReview.previewDigest;
  await owner.submit(request);
  const scoped =
    writes.at(-1).activationRequest.configuration.$propertyPatch.values[0]
      .value;
  assert.equal(scoped.definitions[0].enterpriseCode, "acme");
  assert.deepEqual(scoped.assignments[0].activeGroupCodes, ["acme-support"]);
  scoped.assignments.push({
    tenantCode: "tenant",
    enterpriseCode: "other",
    groupCodes: ["acme-support"],
    allowedSourceCodes: ["guides"],
  });
  assert.throws(() =>
    SERVICE.DefaultCopilotKnowledgeGroupService.validate(
      scoped,
      SERVICE.DefaultCopilotKnowledgeRuntimeService.registry(config),
    ),
  );
  request.body.values.sourceCodes = ["unassigned"];
  await assert.rejects(owner.preview(request));
  request.body.values.sourceCodes = ["guides"];
  config.policy.administration.delegations[0].sections = [];
  await assert.rejects(owner.preview(request));
});

test("runtime registration uses loaded partitions and trusted scope, stays disabled and never ingests", async (t) => {
  const fs = require("node:fs"),
    os = require("node:os"),
    path = require("node:path");
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "copilot-register-"));
  const previous = global.NODICS;
  t.after(() => {
    global.NODICS = previous;
    fs.rmSync(root, { recursive: true, force: true });
  });
  global.NODICS = {
    getIndexedModules: () =>
      new Map([[1, { name: "sample", path: root, index: 1 }]]),
  };
  config.knowledge = structuredClone(
    require("../../copilotKnowledge/config/properties").copilot.knowledge,
  );
  config.knowledge.repositoryRoots = { repo: root };
  SERVICE.DefaultCopilotRuntimeKnowledgeSourceService = require("../../copilotKnowledge/src/service/defaultCopilotRuntimeKnowledgeSourceService");
  SERVICE.DefaultCopilotKnowledgeSourceRegistryService = require("../../copilotKnowledge/src/service/defaultCopilotKnowledgeSourceRegistryService");
  SERVICE.DefaultCopilotKnowledgeRuntimeService = require("../../copilotKnowledge/src/service/defaultCopilotKnowledgeRuntimeService");
  const original = SERVICE.DefaultCopilotOrchestrationService.securityContext;
  SERVICE.DefaultCopilotOrchestrationService.securityContext = (r) => ({
    ...original(r),
    environment: "test",
    customerProject: "project",
  });
  request.authData.permissions.push(
    "copilot.configuration.admin",
    "copilot.knowledge.source.manage",
    "copilot.knowledge.restricted.read",
  );
  request.body = {
    section: "new-runtime-sources",
    revision: "a".repeat(64),
    reason: "Register approved runtime modules",
    values: {
      codePrefix: "runtime",
      partitions: ["repo/sample"],
      sourceType: "SOURCE_CODE",
      version: "commit-one",
      paths: ["src"],
      excludedPaths: [],
    },
  };
  const review = await owner.preview(request);
  request.body.previewDigest = review.previewDigest;
  await owner.submit(request);
  const source =
    writes[0].activationRequest.configuration.$propertyPatch.values[0].value.at(
      -1,
    );
  assert.equal(source.runtimeModule, "sample");
  assert.equal(source.enabled, false);
  assert.deepEqual(source.enterpriseScopes, ["acme"]);
  assert.deepEqual(source.environmentScopes, ["test"]);
  assert.equal(source.classification, "RESTRICTED");
  assert.ok(!JSON.stringify(source).includes(root));
  request.body.values.partitions = ["repo/inactive"];
  await assert.rejects(owner.preview(request));
});
