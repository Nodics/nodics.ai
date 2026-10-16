/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module copilotKnowledge/test/DefaultCopilotAcceptanceBootstrapService
 * @description Provisions only disposable acceptance identities through generated Profile services. Never loaded by a production module.
 * @layer test @owner copilotKnowledge
 */
module.exports = {
  /** Refuses use outside the existing disposable acceptance database contract. */
  fixture: function () {
    const fixture = CONFIG.get("copilotAcceptance");
    if (
      !fixture ||
      !/^nodics_erasure_test_[a-f0-9]{32}$/.test(fixture.databaseName)
    )
      throw new Error("Disposable Copilot acceptance scope required");
    return fixture;
  },
  /** Retains the exact acceptance scopes formerly inherited from nAuth; these are synthetic test inputs only. */
  runtimePermissions: function () {
    const fixture = this.fixture();
    if (!fixture.withAxis && !fixture.withEnterpriseActions && !fixture.withPriceActions &&
        !fixture.withGovernedSchemaActions && !fixture.withCouponActions &&
        !fixture.withRulesInspection && !fixture.withProcessInspection && !fixture.withCollectionActions)
      return ["auth.internal.token.read", "profile.enterprise.search"];
    return [
      "auth.internal.token.read",
      "auth.internal.token.read.anyTenant",
      "profile.enterprise.search",
      "profile.customer.register",
      "profile.address.reference.read",
      "profile.enterprise.reference.read",
      "location.location.read",
      "loyalty.wallet.open",
      "loyalty.wallet.read",
      "media.evidence.read",
      "media.customer.upload",
      "media.customer.read",
      "import.release.validate",
      "import.core.run",
      "publish.lifecycle.create",
      "publish.lifecycle.view",
      "publish.lifecycle.validate",
      "publish.lifecycle.requestApproval",
      ...(fixture.withEnterpriseActions ? ["profile.tenant.namespace.bind"] : []),
      ...(fixture.withRefresh ? [
        "process.instance.start.internal",
        "copilot.knowledge.source.manage",
        "copilot.knowledge.source.notify",
        "copilot.knowledge.internal.read",
      ] : []),
    ];
  },
  /** Uses the disposable Init administrator's real password and token owners; no system flag substitutes for human authority. */
  administratorRequest: async function () {
    this.fixture();
    const response = await SERVICE.DefaultAuthenticationProviderService.authenticateEmployee({
      entCode: "default",
      loginId: "admin",
      password: SERVICE.DefaultAuthSecurityService.validateBootstrapIdentity(CONFIG).adminPassword,
    });
    if (!/^SUC_/.test(response?.code || "") || !response.result?.authToken)
      throw new Error("Fixture administrator authentication failed");
    try {
      const verified = await SERVICE.DefaultAuthorizationProviderService.authorizeToken({
        authToken: response.result.authToken,
      });
      if (!/^SUC_/.test(verified?.code || "") || !verified.result)
        throw new Error("Fixture administrator authorization failed");
      const request = { tenant: "default", authData: verified.result };
      await SERVICE.DefaultIdentityCatalogueGovernanceService.authorize(request);
      return request;
    } finally {
      if (response.result.refreshToken)
        await SERVICE.DefaultAuthenticationProviderService.removeToken(
          CONFIG.get("profileModuleName") || "profile", response.result.refreshToken,
        );
    }
  },
  /** Creates exact deployment assignments through Profile, preserving installed narrowing and revocation on restart. */
  ensureRuntimeAssignments: async function (request) {
    const fixture = this.fixture();
    if (!Array.isArray(fixture.runtimeDeployments) || !fixture.runtimeDeployments.length)
      throw new Error("Explicit disposable runtime deployments required");
    const permissions = this.runtimePermissions();
    const models = fixture.runtimeDeployments.map((scope) => {
      const code = permissions.length === 2 ? "copilot_acceptance_runtime"
        : SERVICE.DefaultMandatoryIdentityBootstrapService.runtimeDeploymentGrantCode(scope.environmentCode, scope.serverCode);
      return {
        code,
        active: true,
        principalType: "service",
        principalCode: "apiAdmin",
        scopeType: "RUNTIME_DEPLOYMENT",
        scopeCode: code,
        inheritanceMode: "DIRECT",
        tenantCode: "default",
        enterpriseCode: "default",
        status: "ACTIVE",
        effect: "ALLOW",
        runtimeScope: { ...scope, permissions: [...permissions] },
      };
    });
    const result = await SERVICE.DefaultPrincipalScopeAssignmentService.ensureDeploymentAll({ ...request, models });
    if (!Array.isArray(result?.result) || result.result.length !== models.length ||
        result.result.some((row, index) => row.code !== models[index].code))
      throw new Error("Fixture runtime assignments unacknowledged");
  },
  /** Creates exact runtime grants and scoped human operators in the owned disposable database. @returns {Promise<boolean>} Completed fixture provisioning. */
  reconcile: async function () {
    const fixture = this.fixture();
    const request = await this.administratorRequest();
    await this.ensureRuntimeAssignments(request);
    const permissions = [
      "axis.view",
      "axis.dashboard.view",
      "axis.application.read",
      "backoffice.bootstrap.view",
      "backoffice.contract.view",
      "backoffice.registry.view",
      "copilot.assistant.use",
      "copilot.assistant.read",
      "copilot.assistant.cancel",
      "copilot.knowledge.internal.read",
      "copilot.knowledge.source.manage",
      "copilot.knowledge.migration.read",
      "copilot.knowledge.migration.execute",
      "copilot.knowledge.migration.erase",
    ];
    if (fixture.withOllama)
      permissions.push("copilot.provider.check", "copilot.usage.read");
    if (fixture.withRegistration)
      permissions.push(
        "backoffice.functionalModule.register",
        "backoffice.functionalModule.activate",
      );
    if (fixture.withAxis)
      permissions.push(
        "backoffice.axis.initialization.view",
        "backoffice.axis.initialization.initiate",
        "process.backoffice.view",
        "process.task.claim",
        "process.task.complete",
        "import.release.view",
        "import.release.validate",
        "import.core.run",
        "import.init.run",
      );
    for (const role of [
      "operator",
      "reader",
      "noerase",
      "nosource",
      "foreign",
      ...(fixture.withActivity ? ["reviewer", "metadata"] : []),
      ...(fixture.withGovernance ? ["manager"] : []),
      ...(fixture.withDatabase ? ["dataonly"] : []),
    ]) {
      const code = "copilot_acceptance_" + role;
      const excluded = new Set([
        ...(role === "reader"
          ? [
              "copilot.knowledge.migration.execute",
              "copilot.knowledge.migration.erase",
              "copilot.usage.read",
            ]
          : []),
        ...(role === "noerase" ? ["copilot.knowledge.migration.erase"] : []),
        ...(role === "nosource" ? ["copilot.knowledge.internal.read"] : []),
        ...(role !== "operator"
          ? [
              "backoffice.functionalModule.register",
              "backoffice.functionalModule.activate",
              "backoffice.axis.initialization.initiate",
              "process.task.claim",
              "process.task.complete",
              "import.core.run",
              "import.init.run",
            ]
          : []),
      ]);
      const groupResult = await SERVICE.DefaultUserGroupService.ensureReferenceAll({ ...request, models: [{
        code,
        name: code,
        active: true,
        parentGroups: [
          "employeeUserGroup",
          ...((fixture.withAxis ||
            fixture.withGovernance ||
            fixture.withRulesInspection ||
            fixture.withProcessInspection ||
            fixture.withEnterpriseActions) &&
          role === "operator"
            ? ["runtimeConfigAdminUserGroup"]
            : []),
        ],
        permissions: [...new Set([
          ...permissions.filter((permission) => !excluded.has(permission)),
          ...(fixture.withProcessTriggerActions && role === "operator"
            ? ["process.trigger.manage", "process.trigger.execute"]
            : []),
          ...(fixture.withProcessLifecycleActions && role === "operator"
            ? [
                "process.definition.create",
                "process.definition.update",
                "process.definition.validate",
                "process.definition.publish",
                "process.definition.delete",
                "process.instance.start",
                "process.instance.cancel",
                "process.instance.retry",
                "process.instance.compensate",
              ]
            : []),
          ...(fixture.withProcessActions && role === "operator"
            ? [
                "copilot.mutation.prepare",
                "copilot.mutation.execute",
                "copilot.mutation.reconcile",
                "process.task.claim",
                "process.task.assign",
                "process.task.complete",
                "process.task.cancel",
              ]
            : []),
          ...(fixture.withProcessInspection &&
          ["operator", "foreign"].includes(role)
            ? [
                "copilot.data.query",
                "process.definition.read",
                "process.backoffice.view",
                "process.incident.read",
              ]
            : []),
          ...(fixture.withProcessInspection && role === "operator"
            ? [
                "process.definition.create",
                "process.definition.publish",
                "process.instance.start",
              ]
            : []),
          ...(fixture.withRulesInspection &&
          ["operator", "foreign"].includes(role)
            ? [
                "copilot.data.query",
                "rules.definition.read",
                "rules.definition.audit",
                "rules.band.read",
              ]
            : []),
          ...(fixture.withRulesInspection && role === "operator"
            ? ["rules.definition.create", "rules.band.create"]
            : []),
          ...((fixture.withPriceActions ||
            fixture.withGovernedSchemaActions ||
            fixture.withCollectionActions) &&
          role === "operator"
            ? [
                "copilot.mutation.prepare",
                "copilot.mutation.execute",
                "copilot.mutation.reconcile",
                "system.schema.view",
                "system.schema.manage",
              ]
            : []),
          ...(fixture.withCollectionActions && role === "operator"
            ? [
                "location.location.create",
                "location.location.read",
                "location.location.search",
              ]
            : []),
          ...(fixture.withCouponActions &&
          ["operator", "foreign"].includes(role)
            ? [
                "copilot.mutation.prepare",
                "copilot.mutation.execute",
                "commerce.coupon.pos.redeem",
                "profile.scope.read",
              ]
            : []),
          ...(fixture.withEnterpriseActions && role === "operator"
            ? [
                "copilot.mutation.prepare",
                "copilot.mutation.execute",
                "copilot.mutation.reconcile",
                "profile.enterprise.create",
                "profile.enterprise.search",
                "profile.enterpriseAccess.assign",
                "profile.enterpriseAccess.search",
              ]
            : []),
          ...(fixture.withRuntimeKnowledge && role === "operator"
            ? ["copilot.knowledge.restricted.read"]
            : []),
          ...(fixture.withRefresh && role === "operator"
            ? ["cronjob.lifecycle.manage", "process.trigger.manage"]
            : []),
          ...(fixture.withDatabase &&
          ["operator", "dataonly", "foreign"].includes(role)
            ? [
                "copilot.data.query",
                "copilot.knowledge.restricted.read",
                "system.schema.view",
              ]
            : []),
          ...(fixture.withDatabase && role === "operator"
            ? ["profile.enterprise.search", "copilot.mutation.prepare"]
            : []),
          ...(fixture.withGovernedSchemaActions && role === "operator"
            ? [
                "copilot.data.query",
                "copilot.knowledge.restricted.read",
                "copilot.mutation.prepare",
                "copilot.mutation.execute",
                "copilot.mutation.reconcile",
                "system.schema.view",
                "system.schema.manage",
              ]
            : []),
          ...(fixture.withBudgets && role === "operator"
            ? ["copilot.budget.enterprise.manage", "copilot.budget.user.manage"]
            : []),
          ...(fixture.withReconciliation && role === "operator"
            ? ["copilot.usage.reconcile"]
            : []),
          ...(fixture.withGovernance && ["operator", "manager"].includes(role)
            ? ["copilot.configuration.read", "copilot.configuration.manage"]
            : []),
          ...(fixture.withGovernance && role === "operator"
            ? ["copilot.configuration.admin"]
            : []),
          ...(fixture.withRetention && role === "operator"
            ? [
                "copilot.activity.read",
                "copilot.activity.lifecycle.read",
                "copilot.activity.lifecycle.execute",
                "copilot.audit.retention.execute",
              ]
            : []),
          ...(fixture.withActivity &&
          ["reviewer", "metadata", "foreign"].includes(role)
            ? ["copilot.activity.read"]
            : []),
          ...(fixture.withActivity && ["reviewer", "foreign"].includes(role)
            ? ["copilot.activity.transcript.read"]
            : []),
        ])],
      }] });
      if (groupResult?.result?.length !== 1 || groupResult.result[0].code !== code)
        throw new Error("Fixture group creation unacknowledged");
      const existing = await SERVICE.DefaultEmployeeService.get({
        ...request,
        query: { code },
      });
      if (!existing || !/^SUC_/.test(existing.code))
        throw new Error("Fixture employee lookup failed");
      if (fixture.withCouponActions && role === "operator")
        await this.save(
          SERVICE.DefaultPrincipalScopeAssignmentService,
          request,
          {
            code: "copilot_acceptance_merchant",
            principalType: "human",
            principalCode: code,
            scopeType: "ENTERPRISE",
            scopeCode: "default",
            inheritanceMode: "DIRECT",
            tenantCode: "default",
            enterpriseCode: "default",
            status: "ACTIVE",
            effect: "ALLOW",
            permissionCode: "commerce.coupon.pos.redeem",
          },
        );
      if (existing.result.length) continue;
      await this.save(SERVICE.DefaultEmployeeService, request, {
        code,
        loginId: code,
        active: true,
        principalType: "human",
        identityMigrationVersion: 5,
        name: { firstName: "Copilot", lastName: role },
        userGroups: [code],
        password: { loginId: code, password: fixture.password, active: true },
      });
    }
    if (fixture.withRetention) await this.seedExpiredConversation({
      ...request,
      authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
    });
    return true;
  },
  /** Creates aged synthetic content once through generated persistence; a retained tombstone prevents resurrection on restart. */
  seedExpiredConversation: async function (request) {
    const service = SERVICE.DefaultCopilotConversationRecordService;
    const code = "acceptance-expired-conversation";
    const existing = await service.get({ ...request, query: { code } });
    if (!/^SUC_/.test(existing?.code || "") || !Array.isArray(existing.result))
      throw new Error("Expired fixture lookup failed");
    if (existing.result.length) return;
    const date = new Date(Date.now() - 7 * 86400000).toISOString();
    const scope = {
      tenantCode: "default",
      enterpriseCode: "default",
      principalCode: "copilot_acceptance_operator",
    };
    const turnCode = "acceptance-expired-turn";
    const rows = [
      [
        service,
        {
          code,
          ...scope,
          definitionCode: "default",
          channel: "INTERNAL",
          state: "CLOSED",
          lastSequence: 3,
          createdAt: date,
          updatedAt: date,
        },
      ],
      [
        SERVICE.DefaultCopilotTurnService,
        {
          code: turnCode,
          ...scope,
          conversationCode: code,
          idempotencyKey: "expired-fixture",
          state: "COMPLETED",
          acceptedAt: date,
          completedAt: date,
          recording: { enabled: true, version: "fixture" },
        },
      ],
      [
        SERVICE.DefaultCopilotMessageService,
        {
          code: "acceptance-expired-message",
          ...scope,
          conversationCode: code,
          turnCode,
          role: "user",
          content: "Synthetic expired test content",
          sequence: 1,
          createdAt: date,
        },
      ],
      [
        SERVICE.DefaultCopilotEventService,
        {
          code: "acceptance-expired-event",
          ...scope,
          conversationCode: code,
          turnCode,
          contractVersion: 1,
          eventType: "turn.completed",
          sequence: 2,
          data: {},
          createdAt: date,
        },
      ],
    ];
    for (const auditCode of [
      "acceptance-expired-audit",
      "acceptance-held-audit",
    ])
      rows.push([
        SERVICE.DefaultCopilotTranscriptAccessService,
        {
          code: auditCode,
          ...scope,
          conversationCode: code,
          purpose: "SUPPORT",
          page: 1,
          occurredAt: date,
          outcome: "READ_AUTHORIZED",
        },
      ]);
    for (const [actionCode, state] of [
      ["acceptance-expired-action", "EXECUTED"],
      ["acceptance-uncertain-action", "OUTCOME_UNKNOWN"],
    ])
      rows.push([
        SERVICE.DefaultCopilotActionService,
        {
          code: actionCode,
          ...scope,
          conversationCode: code,
          capability: "acceptance.synthetic",
          state,
          createdAt: date,
          updatedAt: date,
        },
      ]);
    for (const [owner, model] of rows) {
      const saved = await owner.save({
        ...request,
        options: { insertOnly: true },
        query: { code: model.code },
        model,
      });
      if (!/^SUC_/.test(saved?.code || "") || saved.result?.code !== model.code)
        throw new Error("Expired fixture insert unacknowledged");
    }
  },
  /** Creates the owned foreign-enterprise fixture only after the normal event transport is ready. */
  provisionRuntimeScope: async function () {
    const request = {
      tenant: "default",
      authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
    };
    const code = "copilot_acceptance_foreign";
    const existing = await SERVICE.DefaultEnterpriseService.get({
      ...request,
      query: { code },
    });
    if (
      !existing ||
      !/^SUC_/.test(existing.code) ||
      !Array.isArray(existing.result)
    )
      throw new Error("Fixture enterprise lookup failed");
    if (!existing.result.length)
      await this.save(SERVICE.DefaultEnterpriseService, request, {
        code,
        name: "Disposable foreign acceptance enterprise",
        active: true,
        tenant: "default",
      });
  },
  /** Preserves existing disposable records and creates through generated insert-only saves, including credential and security-stamp hooks. */
  save: async function (service, request, model) {
    this.fixture();
    const existing = await service.get({
      ...request,
      query: { code: model.code },
      options: { recursive: false, skipItemCache: true },
      searchOptions: { pageSize: 2, pageNumber: 1 },
    });
    if (!/^SUC_/.test(existing?.code || "") || existing.success === false || existing.error ||
        existing.errors && (!Array.isArray(existing.errors) || existing.errors.length) ||
        !Array.isArray(existing.result) || existing.count !== existing.result.length ||
        existing.result.length > 1 || existing.result.some((row) => row.code !== model.code))
      throw new Error("Fixture Profile lookup failed");
    if (existing.result.length) return;
    const response = await service.save({
      ...request,
      options: { insertOnly: true },
      model,
    });
    if (!/^SUC_/.test(response?.code || "") || response.success === false || response.error ||
        response.errors && (!Array.isArray(response.errors) || response.errors.length) || response.result?.code !== model.code)
      throw new Error("Fixture Profile save failed");
  },
};
