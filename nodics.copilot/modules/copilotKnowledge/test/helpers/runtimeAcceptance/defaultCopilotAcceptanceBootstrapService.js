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
  /** Creates an exact runtime grant and scoped human operators in the owned disposable database. @returns {Promise<boolean>} Completed fixture provisioning. */
  reconcile: async function () {
    const fixture = CONFIG.get("copilotAcceptance");
    if (
      !fixture ||
      !/^nodics_erasure_test_[a-f0-9]{32}$/.test(fixture.databaseName)
    )
      throw new Error("Disposable Copilot acceptance scope required");
    const request = {
      tenant: "default",
      authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
    };
    if (
      !fixture.withAxis &&
      !fixture.withEnterpriseActions &&
      !fixture.withPriceActions &&
      !fixture.withGovernedSchemaActions &&
      !fixture.withCouponActions &&
      !fixture.withRulesInspection &&
      !fixture.withProcessInspection &&
      !fixture.withCollectionActions
    )
      await this.save(SERVICE.DefaultPrincipalScopeAssignmentService, request, {
        code: "copilot_acceptance_runtime",
        principalType: "service",
        principalCode: "apiAdmin",
        scopeType: "RUNTIME_DEPLOYMENT",
        scopeCode: "copilot_acceptance_runtime",
        inheritanceMode: "DIRECT",
        tenantCode: "default",
        enterpriseCode: "default",
        status: "ACTIVE",
        effect: "ALLOW",
        runtimeScope: {
          projectCode: NODICS.getEnvironmentName(),
          environmentCode: NODICS.getSelectedEnvironmentName(),
          serverCode: NODICS.getServerName(),
          instanceCode: "copilot-acceptance",
          modules: NODICS.getActiveModules(),
          permissions: [
            "auth.internal.token.read",
            "profile.enterprise.search",
          ],
        },
      });
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
      await this.save(SERVICE.DefaultUserGroupService, request, {
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
        permissions: [
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
        ],
      });
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
    if (fixture.withRetention) await this.seedExpiredConversation(request);
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
  /** Uses the owning generated save lifecycle, including credential and security-stamp hooks. @param {Object} service Profile service. @param {Object} request System fixture context. @param {Object} model Owned fixture record. @returns {Promise<void>} Acknowledged save. */
  save: async function (service, request, model) {
    const response = await service.save({
      ...request,
      query: { code: model.code },
      model,
    });
    if (!response || !/^SUC_/.test(response.code))
      throw new Error("Fixture Profile save failed");
  },
};
