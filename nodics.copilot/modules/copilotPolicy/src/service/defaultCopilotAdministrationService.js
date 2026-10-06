/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const crypto = require("node:crypto");
const _ = require("lodash");

/** @module copilotPolicy/service/DefaultCopilotAdministrationService
 * @description Projects bounded Copilot settings and prepares permission-scoped proposals through existing runtime governance, without another configuration store.
 * @layer service @owner copilotPolicy
 * @override Customize presentation and narrow delegation; retain trusted scope, allowlisted fields, ceilings and runtime approval.
 */
module.exports = {
  /** Raises a stable non-enumerating administration error. @param {string} code Status. @returns {never} Throws. */
  fail: function (code = "ERR_CPL_00009") {
    throw new CLASSES.NodicsError(code);
  },
  /** Resolves trusted identity and independent settings permission. @param {Object} request Trusted context. @returns {Object} Scope. */
  scope: function (request) {
    const context = SERVICE.DefaultCopilotOrchestrationService.securityContext(
      request,
      CONFIG.get("copilot"),
    );
    if (
      ![context.tenant, context.enterprise, context.actor].every(
        (value) =>
          typeof value === "string" && value.trim() && value.length <= 128,
      ) ||
      !SERVICE.DefaultCopilotPolicyService.hasPermission(
        context,
        "copilot.configuration.read",
      )
    )
      this.fail("ERR_CPL_00008");
    return {
      ...context,
      superadmin: SERVICE.DefaultCopilotPolicyService.hasPermission(
        context,
        "copilot.configuration.admin",
      ),
      canManage: SERVICE.DefaultCopilotPolicyService.hasPermission(
        context,
        "copilot.configuration.manage",
      ),
    };
  },
  /** Refreshes canonical tenant properties before reading effective policy. @param {Object} request Trusted context. @returns {Promise<Object>} Configuration and revision. */
  current: async function (request) {
    const owner = SERVICE.DefaultRuntimePropertyPersistenceService;
    if (!owner || owner.policy().enabled !== true) this.fail("ERR_CPL_00010");
    const record = await owner.refresh({
      tenant: request.tenant,
      authData: request.authData,
    });
    return {
      configuration: CONFIG.get("copilot") || {},
      revision: record?.revision || null,
    };
  },
  /** Builds a bounded field descriptor without exposing credentials or endpoint configuration. @param {string} id Field id. @param {string} label Label. @param {string} kind Control kind. @param {*} value Effective value. @param {Object} extra Constraints. @returns {Object} Descriptor. */
  field: function (id, label, kind, value, extra = {}) {
    return { id, label, kind, value, ...extra };
  },
  /** Builds owner-scoped group authoring fields. @param {Object} group Definition. @param {string[]} sources Authorized choices. @returns {Array} Fields. */
  groupFields: function (group, sources) {
    return [
      this.field("code", "Group code", "text", group.code),
      this.field("name", "Group name", "text", group.name),
      this.field(
        "active",
        group.enterpriseCode
          ? "Available in this enterprise"
          : "Globally active",
        "boolean",
        group.active,
      ),
      this.field("sourceCodes", "Sources", "multiple", group.sourceCodes, {
        options: sources,
      }),
    ];
  },
  /** Computes permission-filtered sections and exact editable fields. @param {Object} configuration Effective policy. @param {Object} scope Trusted scope. @returns {Array} Safe sections. */
  sections: function (configuration, scope) {
    const sections = [];
    const policy = configuration.policy?.administration || {};
    const delegation = (policy.delegations || []).find(
      (item) =>
        item.tenantCode === scope.tenant &&
        item.enterpriseCode === scope.enterprise,
    );
    const allowed = (code) =>
      scope.canManage &&
      (scope.superadmin || delegation?.sections?.includes(code));
    const accounting = configuration.providers?.accounting;
    const enterprise = accounting?.enterprises?.find(
      (item) =>
        item.tenantCode === scope.tenant &&
        item.enterpriseCode === scope.enterprise,
    );
    if (enterprise) {
      if (scope.superadmin)
        sections.push({
          code: "provider-access",
          title: "Enterprise provider access",
          editable: allowed("provider-access"),
          fields: [
            this.field(
              "adapters",
              "Allowed providers",
              "multiple",
              enterprise.adapters,
              {
                options: [
                  ...new Set([
                    ...Object.keys(configuration.providers.adapters || {}),
                    ...enterprise.adapters,
                  ]),
                ],
              },
            ),
            this.field(
              "profiles",
              "Allowed usage profiles",
              "multiple",
              enterprise.profiles,
              {
                options: [
                  ...new Set([
                    ...Object.keys(configuration.providers.profiles || {}),
                    ...enterprise.profiles,
                  ]),
                ],
              },
            ),
          ],
        });
      sections.push({
        code: "allocations",
        title: "Recurring allocations",
        editable: allowed("allocations"),
        fields: [
          this.field(
            "enterprise",
            "Enterprise default",
            "number",
            enterprise.defaultLimit ?? enterprise.limit,
            { maximum: enterprise.limit },
          ),
          ...enterprise.users.map((user, index) =>
            this.field(
              "user." + index,
              user.principalCode,
              "number",
              user.defaultLimit ?? user.limit,
              { maximum: user.limit },
            ),
          ),
        ],
      });
      if (scope.superadmin)
        sections.push({
          code: "ceilings",
          title: "Enterprise ceilings",
          editable: allowed("ceilings"),
          fields: [
            this.field(
              "enterprise",
              "Enterprise maximum",
              "number",
              enterprise.limit,
              { maximum: accounting.tenantLimit },
            ),
            ...enterprise.users.map((user, index) =>
              this.field(
                "user." + index,
                user.principalCode,
                "number",
                user.limit,
                { maximum: accounting.tenantLimit },
              ),
            ),
          ],
        });
    }
    if (
      configuration.conversation?.auditRetention &&
      SERVICE.DefaultCopilotAuditRetentionService
    ) {
      for (const kind of ["TRANSCRIPT_ACCESS", "ACTION"]) {
        const selected =
          configuration.conversation.auditRetention.enterprisePolicies?.find(
            (item) =>
              item.tenantCode === scope.tenant &&
              item.enterpriseCode === scope.enterprise &&
              item.kind === kind,
          );
        sections.push({
          code: "audit-retention-" + kind,
          title:
            kind === "ACTION"
              ? "Action audit retention"
              : "Transcript access audit retention",
          editable:
            allowed("audit-retention") &&
            SERVICE.DefaultCopilotPolicyService.hasPermission(
              scope,
              "copilot.audit.retention.configure",
            ),
          fields: [
            this.field(
              "retentionDays",
              "Independent audit retention days",
              "number",
              selected?.retentionDays ?? 365,
              { minimum: 1, maximum: 3650 },
            ),
            this.field(
              "holdAll",
              "Preserve all audit in this category",
              "boolean",
              selected?.holdAll ?? true,
            ),
            this.field(
              "recordCodes",
              "Held audit record identifiers",
              "lines",
              selected?.recordCodes ?? [],
            ),
            this.field(
              "conversationCodes",
              "Held conversation identifiers",
              "lines",
              selected?.conversationCodes ?? [],
            ),
          ],
        });
      }
    }
    if (scope.superadmin) {
      if (configuration.workbench && configuration.core) {
        sections.push({
          code: "business-actions",
          title: "Business action controls",
          editable: allowed("business-actions"),
          fields: [
            this.field(
              "invitations",
              "New invitations to existing enterprises",
              "boolean",
              configuration.workbench.standaloneInvitationsEnabled === true,
            ),
            this.field(
              "prices",
              "New prices for existing products",
              "boolean",
              configuration.workbench.standalonePricesEnabled === true,
            ),
            this.field(
              "planning",
              "Interpret supported business requests",
              "boolean",
              configuration.core.intentPlanning?.enabled === true,
            ),
            this.field(
              "recovery",
              "Inspect original business results",
              "boolean",
              configuration.workbench.receiptRecovery?.enabled === true,
            ),
          ],
        });
      }
      if (configuration.knowledge) {
        const knowledge = configuration.knowledge;
        sections.push({
          code: "automation",
          title: "Knowledge automation",
          editable: allowed("automation"),
          fields: [
            this.field(
              "publication",
              "Atomic generation publication",
              "boolean",
              knowledge.generationPublication?.enabled === true,
            ),
            this.field(
              "incremental",
              "Reuse verified unchanged sources",
              "boolean",
              knowledge.generationPublication?.incrementalEnabled === true,
            ),
            this.field(
              "workflow",
              "Process-backed refresh",
              "boolean",
              knowledge.workflowRefresh?.enabled === true,
            ),
            this.field(
              "events",
              "Assigned source-change publishers",
              "boolean",
              knowledge.eventRefresh?.enabled === true,
            ),
            this.field(
              "recovery",
              "Reviewed pending-writer retirement",
              "boolean",
              knowledge.writerRecovery?.enabled === true,
            ),
            this.field(
              "minimumPendingAgeMs",
              "Minimum pending-writer age (milliseconds)",
              "number",
              knowledge.writerRecovery?.minimumPendingAgeMs ?? 300000,
              { minimum: 60000, maximum: 86400000 },
            ),
          ],
        });
      }
      if (SERVICE.DefaultCopilotConversationLifecycleService) {
        const lifecycle =
          SERVICE.DefaultCopilotConversationLifecycleService.policy(
            configuration.conversation,
            {
              tenantCode: scope.tenant,
              enterpriseCode: scope.enterprise,
            },
          );
        sections.push({
          code: "retention",
          title: "Retention and legal holds",
          editable: allowed("retention"),
          fields: [
            this.field(
              "retentionDays",
              "Retention days",
              "number",
              lifecycle.retentionDays,
              { maximum: 3650 },
            ),
            this.field(
              "holdAll",
              "Preserve all enterprise conversations",
              "boolean",
              lifecycle.holdAll,
            ),
            this.field(
              "conversationCodes",
              "Held conversation identifiers",
              "lines",
              lifecycle.conversationCodes,
            ),
          ],
        });
      }
      const providers = configuration.providers || {};
      const adapters = Object.entries(providers.adapters || {}).filter(
        ([, adapter]) => adapter.enabled === true,
      );
      sections.push({
        code: "provider",
        title: "Provider and model",
        editable: allowed("provider"),
        fields: [
          this.field(
            "adapter",
            "Default provider",
            "select",
            providers.default?.adapter || "",
            { options: adapters.map(([code]) => code) },
          ),
          this.field(
            "profile",
            "Usage profile",
            "select",
            providers.default?.profile || "",
            { options: Object.keys(providers.profiles || {}) },
          ),
          ...adapters.map(([code, adapter]) =>
            this.field(
              "model." + code,
              code + " model",
              "text",
              adapter.model?.name || "",
            ),
          ),
        ],
      });
      sections.push({
        code: "recording",
        title: "Conversation recording",
        editable: allowed("recording"),
        fields: [
          this.field(
            "enabled",
            "Record future turns",
            "boolean",
            configuration.conversation?.recording?.enabled === true,
          ),
        ],
      });
      Object.entries(providers.profiles || {}).forEach(
        ([name, profile], index) => {
          if (!/^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(name)) this.fail();
          if (
            [
              "temperature",
              "topP",
              "maximumOutputTokens",
              "structuredOutput",
            ].some((key) => profile[key] === undefined)
          )
            return;
          sections.push({
            code: "profile-" + index,
            title: "Model profile: " + name,
            editable: allowed("provider"),
            fields: [
              this.field(
                "temperature",
                "Temperature",
                "number",
                profile.temperature,
                { maximum: 2, step: 0.01 },
              ),
              this.field(
                "topP",
                "Sampling probability",
                "number",
                profile.topP,
                { maximum: 1, step: 0.01 },
              ),
              this.field(
                "maximumOutputTokens",
                "Maximum output tokens",
                "number",
                profile.maximumOutputTokens,
                { minimum: 1, maximum: 1048576 },
              ),
              this.field(
                "structuredOutput",
                "Structured output",
                "boolean",
                profile.structuredOutput,
              ),
            ],
          });
        },
      );
      sections.push({
        code: "delegation",
        title: "Enterprise administration",
        editable: allowed("delegation"),
        fields: [
          this.field(
            "allocations",
            "Delegate recurring allocations",
            "boolean",
            delegation?.sections?.includes("allocations") === true,
          ),
          this.field(
            "groups",
            "Delegate active group selection",
            "boolean",
            delegation?.sections?.includes("groups") === true,
          ),
          this.field(
            "group-authoring",
            "Delegate enterprise group authoring",
            "boolean",
            delegation?.sections?.includes("group-authoring") === true,
          ),
          ...(configuration.conversation?.auditRetention &&
          SERVICE.DefaultCopilotAuditRetentionService
            ? [
                this.field(
                  "audit-retention",
                  "Delegate independent audit retention policy",
                  "boolean",
                  delegation?.sections?.includes("audit-retention") === true,
                ),
              ]
            : []),
        ],
      });
    }
    const groups = configuration.knowledge?.groups;
    if (
      scope.superadmin &&
      scope.environment &&
      scope.customerProject &&
      SERVICE.DefaultCopilotPolicyService.hasPermission(
        scope,
        "copilot.knowledge.source.manage",
      ) &&
      SERVICE.DefaultCopilotPolicyService.hasPermission(
        scope,
        "copilot.knowledge.restricted.read",
      ) &&
      Object.keys(configuration.knowledge?.repositoryRoots || {}).length
    ) {
      const choices =
        SERVICE.DefaultCopilotRuntimeKnowledgeSourceService.choices(
          configuration.knowledge.repositoryRoots,
        );
      if (choices.length)
        sections.push({
          code: "new-runtime-sources",
          title: "Register runtime knowledge",
          editable: allowed("new-runtime-sources"),
          fields: [
            this.field("codePrefix", "Source code prefix", "text", ""),
            this.field(
              "partitions",
              "Runtime repository / modules",
              "multiple",
              [],
              { options: choices.map((item) => item.code) },
            ),
            this.field("sourceType", "Content type", "select", "SOURCE_CODE", {
              options: ["SOURCE_CODE", "INTERNAL_DOCUMENTATION"],
            }),
            this.field("version", "Source revision", "text", ""),
            this.field("paths", "Included paths", "lines", ["**/*"]),
            this.field("excludedPaths", "Excluded paths", "lines", []),
          ],
        });
    }
    const assignment = groups?.assignments?.find(
      (item) =>
        item.tenantCode === scope.tenant &&
        item.enterpriseCode === scope.enterprise,
    );
    if (groups?.enabled === true && assignment && allowed("group-authoring")) {
      const registry =
        SERVICE.DefaultCopilotKnowledgeRuntimeService.registry(configuration);
      const sources = registry.sources
        .filter(
          (source) =>
            assignment.allowedSourceCodes.includes(source.code) &&
            SERVICE.DefaultCopilotPolicyService.decideSourceAccess(
              source,
              scope,
              configuration.policy,
            ).allowed,
        )
        .map((source) => source.code);
      if (groups.definitions.length < 100)
        sections.push({
          code: "enterprise-new-group",
          title: "Create enterprise knowledge group",
          editable: true,
          fields: this.groupFields(
            {
              code: "",
              name: "",
              active: false,
              sourceCodes: [],
              enterpriseCode: scope.enterprise,
            },
            sources,
          ),
        });
      groups.definitions.forEach((group, index) => {
        if (
          group.tenantCode === scope.tenant &&
          group.enterpriseCode === scope.enterprise &&
          group.sourceCodes.every((code) => sources.includes(code))
        )
          sections.push({
            code: "enterprise-group-" + index,
            title: group.name,
            editable: true,
            fields: this.groupFields(group, sources),
          });
      });
    }
    if (scope.superadmin && groups) {
      const registry =
        SERVICE.DefaultCopilotKnowledgeRuntimeService.registry(configuration);
      const sourceCodes = registry.sources
        .filter(
          (source) =>
            SERVICE.DefaultCopilotPolicyService.decideSourceAccess(
              source,
              scope,
              configuration.policy,
            ).allowed,
        )
        .map((source) => source.code);
      const visibleGroups = groups.definitions.filter(
        (group) =>
          (!group.enterpriseCode ||
            (group.tenantCode === scope.tenant &&
              group.enterpriseCode === scope.enterprise)) &&
          group.sourceCodes.every((code) => sourceCodes.includes(code)),
      );
      sections.push({
        code: "group-policy",
        title: "Knowledge group policy",
        editable: allowed("group-policy"),
        fields: [
          this.field(
            "enabled",
            "Enforce enterprise group assignments",
            "boolean",
            groups.enabled,
          ),
        ],
      });
      if (groups.definitions.length < 100)
        sections.push({
          code: "new-group",
          title: "Create knowledge group",
          editable: allowed("new-group"),
          fields: this.groupFields(
            { code: "", name: "", active: false, sourceCodes: [] },
            sourceCodes,
          ),
        });
      visibleGroups
        .filter((group) => !group.enterpriseCode)
        .forEach((group) =>
          sections.push({
            code: "group-" + groups.definitions.indexOf(group),
            title: group.name,
            editable: allowed("group"),
            fields: this.groupFields(group, sourceCodes),
          }),
        );
      if (
        !assignment ||
        (assignment.allowedSourceCodes.every((code) =>
          sourceCodes.includes(code),
        ) &&
          assignment.groupCodes.every((code) =>
            visibleGroups.some((group) => group.code === code),
          ))
      )
        sections.push({
          code: "knowledge-ceilings",
          title: "Enterprise knowledge access",
          editable: allowed("knowledge-ceilings"),
          fields: [
            this.field(
              "groupCodes",
              "Allowed groups",
              "multiple",
              assignment?.groupCodes || [],
              {
                options: visibleGroups.map((group) => group.code),
              },
            ),
            this.field(
              "allowedSourceCodes",
              "Allowed sources",
              "multiple",
              assignment?.allowedSourceCodes || [],
              { options: sourceCodes },
            ),
          ],
        });
    }
    if (groups?.enabled === true && assignment)
      sections.push({
        code: "groups",
        title: "Active knowledge groups",
        editable: allowed("groups"),
        fields: [
          this.field(
            "activeGroupCodes",
            "Active groups",
            "multiple",
            assignment.activeGroupCodes ?? assignment.groupCodes,
            { options: assignment.groupCodes },
          ),
        ],
      });
    if (
      scope.superadmin &&
      SERVICE.DefaultCopilotPolicyService.hasPermission(
        scope,
        "copilot.knowledge.source.manage",
      ) &&
      configuration.knowledge?.sourceRegistry?.enabled
    ) {
      const registry =
        SERVICE.DefaultCopilotKnowledgeRuntimeService.registry(configuration);
      registry.sources.forEach((source, index) => {
        if (
          !SERVICE.DefaultCopilotPolicyService.decideSourceAccess(
            source,
            scope,
            configuration.policy,
          ).allowed
        )
          return;
        sections.push({
          code: "source-" + index,
          title: source.code,
          editable: allowed("sources"),
          fields: [
            this.field("enabled", "Source enabled", "boolean", source.enabled),
            this.field("version", "Source revision", "text", source.version),
            this.field(
              "paths",
              source.sourceType === "DATABASE"
                ? "Included collections (* for all eligible)"
                : "Included paths",
              "lines",
              source.paths,
            ),
            this.field(
              "excludedPaths",
              source.sourceType === "DATABASE"
                ? "Excluded collections"
                : "Excluded paths",
              "lines",
              source.excludedPaths,
            ),
          ],
        });
      });
    }
    if (SERVICE.DefaultCopilotRefreshAdministrationService)
      sections.push(
        ...SERVICE.DefaultCopilotRefreshAdministrationService.sections(
          configuration,
          scope,
        ),
      );
    return sections.map((section) => ({
      ...section,
      scope:
        [
          "allocations",
          "ceilings",
          "delegation",
          "groups",
          "knowledge-ceilings",
          "retention",
          "provider-access",
        ].includes(section.code) ||
        section.code.startsWith("enterprise-") ||
        section.code.startsWith("audit-retention-") ||
        section.code.startsWith("refresh-")
          ? "ENTERPRISE"
          : "TENANT_RUNTIME",
    }));
  },
  /** Returns only the current enterprise projection and bounded committed metadata. @param {Object} request Trusted context. @returns {Promise<Object>} Settings. */
  get: async function (request) {
    this.scope(request);
    const current = await this.current(request);
    const scope = this.scope(request);
    return {
      contractVersion: 1,
      enterpriseCode: scope.enterprise,
      revision: current.revision,
      presentation: {
        ...current.configuration.policy?.administration?.presentation,
      },
      canCheckProvider:
        SERVICE.DefaultCopilotProviderService?.canCheck(request) === true,
      sections: this.sections(current.configuration, scope),
      approvalRequired: true,
    };
  },
  /** Reads a bounded enterprise-origin proposal history from nDynamo without exposing patches or snapshots. @param {Object} request Trusted viewer. @returns {Promise<Object>} Metadata history. */
  history: async function (request) {
    const scope = this.scope(request);
    const query = request.query || {};
    const page = query.page === undefined ? 1 : Number(query.page);
    if (
      Object.keys(query).some((key) => key !== "page") ||
      !Number.isSafeInteger(page) ||
      page < 1 ||
      page > 1000
    )
      this.fail();
    const response =
      await SERVICE.DefaultRuntimeConfigurationActivationRequestService.getActivationRequests(
        {
          tenant: request.tenant,
          authData: request.authData,
          activationRequest: {
            moduleName: "copilotPolicy",
            configurationType: "propertyConfiguration",
            configurationCode: "tenantProperties",
            requestEnterpriseCode: scope.enterprise,
          },
          searchOptions: {
            pageSize: 25,
            pageNumber: page,
            sort: { creationTime: -1, code: 1 },
          },
        },
      );
    const rows = response?.data;
    const statuses = [
      "REQUESTED",
      "APPROVED",
      "REJECTED",
      "ACTIVATING",
      "ACTIVATED",
    ];
    if (
      !/^SUC_/.test(response?.code || "") ||
      response.metadata?.tenant !== request.tenant ||
      !Array.isArray(rows) ||
      rows.length > 25 ||
      new Set(rows.map((row) => row.code)).size !== rows.length
    )
      this.fail("ERR_CPL_00010");
    const items = rows.map((row) => {
      if (
        row.requestEnterpriseCode !== scope.enterprise ||
        row.moduleName !== "copilotPolicy" ||
        row.configurationType !== "propertyConfiguration" ||
        row.configurationCode !== "tenantProperties" ||
        ![row.code, row.requestedBy].every(
          (value) =>
            typeof value === "string" &&
            value.length > 0 &&
            value.length <= 128,
        ) ||
        !statuses.includes(row.status) ||
        !Array.isArray(row.lifecycle) ||
        !row.lifecycle.length
      )
        this.fail("ERR_CPL_00010");
      const occurredAt = row.lifecycle.at(-1)?.at;
      if (
        typeof occurredAt !== "string" ||
        !Number.isFinite(Date.parse(occurredAt))
      )
        this.fail("ERR_CPL_00010");
      return {
        code: row.code,
        requestedBy: row.requestedBy,
        status: row.status,
        occurredAt: new Date(occurredAt).toISOString(),
      };
    });
    if (this.scope(request).enterprise !== scope.enterprise)
      this.fail("ERR_CPL_00008");
    return {
      contractVersion: 1,
      enterpriseCode: scope.enterprise,
      page,
      limit: 25,
      mayHaveMore: rows.length === 25,
      items,
    };
  },
  /** Validates the exact field set against authoritative descriptors. @param {Object} section Section. @param {Object} values Submitted values. @returns {Object} Validated values. */
  validate: function (section, values) {
    if (
      !values ||
      typeof values !== "object" ||
      Array.isArray(values) ||
      Object.keys(values).length !== section.fields.length
    )
      this.fail();
    for (const field of section.fields) {
      if (!Object.hasOwn(values, field.id)) this.fail();
      const value = values[field.id];
      if (field.kind === "boolean" && typeof value !== "boolean") this.fail();
      if (
        field.kind === "number" &&
        (typeof value !== "number" ||
          !Number.isFinite(value) ||
          (field.step !== 0.01 && !Number.isSafeInteger(value)) ||
          value < (field.minimum ?? 0) ||
          value > field.maximum)
      )
        this.fail();
      if (field.kind === "select" && !field.options.includes(value))
        this.fail();
      if (
        field.kind === "text" &&
        (typeof value !== "string" ||
          !value.trim() ||
          value.length > 128 ||
          /[\u0000-\u001f]/.test(value) ||
          (field.id !== "name" &&
            !/^[A-Za-z0-9][A-Za-z0-9._:/-]{0,127}$/.test(value)))
      )
        this.fail();
      if (
        field.kind === "multiple" &&
        (!Array.isArray(value) ||
          value.length > field.options.length ||
          new Set(value).size !== value.length ||
          value.some((code) => !field.options.includes(code)))
      )
        this.fail();
      if (
        field.kind === "lines" &&
        (!Array.isArray(value) ||
          value.length > 100 ||
          new Set(value).size !== value.length ||
          value.some(
            (path) =>
              typeof path !== "string" ||
              !path.trim() ||
              path.length > 512 ||
              (["recordCodes", "conversationCodes"].includes(field.id)
                ? !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,191}$/.test(path)
                : !SERVICE.DefaultCopilotKnowledgeSourceRegistryService.validRelativePath(
                    path,
                  )),
          ))
      )
        this.fail();
    }
    return values;
  },
  /** Constructs literal owner-property changes; submitted paths and foreign enterprises are never accepted. @param {Object} configuration Effective configuration. @param {Object} scope Trusted identity. @param {string} section Section identity. @param {Object} values Validated form. @returns {Object} Literal property proposal. */
  patch: function (configuration, scope, section, values) {
    const entries = [];
    if (section === "business-actions") {
      if (!scope.superadmin) this.fail("ERR_CPL_00008");
      const proposed = _.cloneDeep(configuration);
      proposed.workbench.standaloneInvitationsEnabled = values.invitations;
      proposed.workbench.standalonePricesEnabled = values.prices;
      if (values.invitations) {
        if (!SERVICE.DefaultCopilotInvitationActionService) this.fail();
        SERVICE.DefaultCopilotInvitationActionService.target(proposed);
      }
      if (values.prices) {
        if (!SERVICE.DefaultCopilotPriceActionService) this.fail();
        SERVICE.DefaultCopilotPriceActionService.target(proposed);
      }
      entries.push(
        {
          path: "copilot.workbench.standaloneInvitationsEnabled",
          value: values.invitations,
        },
        {
          path: "copilot.workbench.standalonePricesEnabled",
          value: values.prices,
        },
        { path: "copilot.core.intentPlanning.enabled", value: values.planning },
        {
          path: "copilot.workbench.receiptRecovery.enabled",
          value: values.recovery,
        },
      );
    } else if (section === "provider-access") {
      const accounting = _.cloneDeep(configuration.providers.accounting);
      const enterprise = accounting.enterprises.find(
        (item) =>
          item.tenantCode === scope.tenant &&
          item.enterpriseCode === scope.enterprise,
      );
      enterprise.adapters = values.adapters;
      enterprise.profiles = values.profiles;
      SERVICE.DefaultCopilotUsageService.validate({
        ...accounting,
        enabled: true,
      });
      entries.push({
        path: "copilot.providers.accounting.enterprises",
        value: accounting.enterprises,
      });
    } else if (["allocations", "ceilings"].includes(section)) {
      const accounting = _.cloneDeep(configuration.providers.accounting);
      const enterprise = accounting.enterprises.find(
        (item) =>
          item.tenantCode === scope.tenant &&
          item.enterpriseCode === scope.enterprise,
      );
      const key = section === "allocations" ? "defaultLimit" : "limit";
      enterprise[key] = values.enterprise;
      enterprise.users.forEach((user, index) => {
        user[key] = values["user." + index];
      });
      SERVICE.DefaultCopilotUsageService.validate({
        ...accounting,
        enabled: true,
      });
      entries.push({
        path: "copilot.providers.accounting.enterprises",
        value: accounting.enterprises,
      });
    } else if (section === "provider") {
      entries.push(
        {
          path: "copilot.providers.default.adapter",
          value: values.adapter,
        },
        {
          path: "copilot.providers.default.profile",
          value: values.profile,
        },
      );
      for (const [key, value] of Object.entries(values))
        if (key.startsWith("model.")) {
          const adapter = key.slice(6);
          if (!/^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(adapter)) this.fail();
          entries.push({
            path: "copilot.providers.adapters." + adapter + ".model.name",
            value,
          });
        }
    } else if (/^profile-[0-9]+$/.test(section)) {
      const name = Object.keys(configuration.providers.profiles || {})[
        Number(section.slice(8))
      ];
      if (!name || !/^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(name)) this.fail();
      const profile = {
        ...configuration.providers.profiles[name],
        ...values,
      };
      SERVICE.DefaultCopilotProviderService.validateProfile(profile);
      for (const key of [
        "temperature",
        "topP",
        "maximumOutputTokens",
        "structuredOutput",
      ])
        entries.push({
          path: "copilot.providers.profiles." + name + "." + key,
          value: values[key],
        });
    } else if (section.startsWith("refresh-")) {
      entries.push(
        SERVICE.DefaultCopilotRefreshAdministrationService.patch(
          configuration,
          scope,
          section,
          values,
        ),
      );
    } else if (section === "automation") {
      if (
        !scope.superadmin ||
        ((values.incremental || values.recovery) && !values.publication) ||
        (values.events && !values.workflow)
      )
        this.fail();
      entries.push(
        {
          path: "copilot.knowledge.generationPublication.enabled",
          value: values.publication,
        },
        {
          path: "copilot.knowledge.generationPublication.incrementalEnabled",
          value: values.incremental,
        },
        {
          path: "copilot.knowledge.workflowRefresh.enabled",
          value: values.workflow,
        },
        {
          path: "copilot.knowledge.eventRefresh.enabled",
          value: values.events,
        },
        {
          path: "copilot.knowledge.writerRecovery.enabled",
          value: values.recovery,
        },
        {
          path: "copilot.knowledge.writerRecovery.minimumPendingAgeMs",
          value: values.minimumPendingAgeMs,
        },
      );
    } else if (section.startsWith("audit-retention-")) {
      if (
        !SERVICE.DefaultCopilotPolicyService.hasPermission(
          scope,
          "copilot.audit.retention.configure",
        )
      )
        this.fail();
      const kind = section.slice("audit-retention-".length);
      const current = configuration.conversation.auditRetention;
      const policies = _.cloneDeep(current.enterprisePolicies || []);
      const value = {
        tenantCode: scope.tenant,
        enterpriseCode: scope.enterprise,
        kind,
        ...values,
      };
      const index = policies.findIndex(
        (item) =>
          item.tenantCode === scope.tenant &&
          item.enterpriseCode === scope.enterprise &&
          item.kind === kind,
      );
      if (index < 0) policies.push(value);
      else policies[index] = value;
      SERVICE.DefaultCopilotAuditRetentionService.policy(
        { tenantCode: scope.tenant, enterpriseCode: scope.enterprise },
        kind,
        { ...current, enterprisePolicies: policies },
      );
      entries.push({
        path: "copilot.conversation.auditRetention.enterprisePolicies",
        value: policies,
      });
    } else if (section === "retention") {
      const policies = _.cloneDeep(
        configuration.conversation.lifecycle?.enterprisePolicies || [],
      );
      const index = policies.findIndex(
        (item) =>
          item.tenantCode === scope.tenant &&
          item.enterpriseCode === scope.enterprise,
      );
      const value = {
        tenantCode: scope.tenant,
        enterpriseCode: scope.enterprise,
        ...values,
      };
      if (index < 0) policies.push(value);
      else policies[index] = value;
      SERVICE.DefaultCopilotConversationLifecycleService.policy(
        {
          ...configuration.conversation,
          lifecycle: {
            ...configuration.conversation.lifecycle,
            enterprisePolicies: policies,
          },
        },
        { tenantCode: scope.tenant, enterpriseCode: scope.enterprise },
      );
      entries.push({
        path: "copilot.conversation.lifecycle.enterprisePolicies",
        value: policies,
      });
    } else if (section === "recording") {
      entries.push(
        {
          path: "copilot.conversation.recording.enabled",
          value: values.enabled,
        },
        {
          path: "copilot.conversation.recording.version",
          value: crypto
            .createHash("sha256")
            .update(
              JSON.stringify([configuration.conversation.recording, values]),
            )
            .digest("hex"),
        },
      );
    } else if (section === "delegation") {
      const delegations = _.cloneDeep(
        configuration.policy?.administration?.delegations || [],
      );
      const index = delegations.findIndex(
        (item) =>
          item.tenantCode === scope.tenant &&
          item.enterpriseCode === scope.enterprise,
      );
      const delegation = {
        tenantCode: scope.tenant,
        enterpriseCode: scope.enterprise,
        sections: Object.keys(values).filter((key) => values[key]),
      };
      if (index < 0) delegations.push(delegation);
      else delegations[index] = delegation;
      entries.push({
        path: "copilot.policy.administration.delegations",
        value: delegations,
      });
    } else if (
      section === "enterprise-new-group" ||
      section.startsWith("enterprise-group-")
    ) {
      const groups = _.cloneDeep(configuration.knowledge.groups);
      const assignment = groups.assignments.find(
        (item) =>
          item.tenantCode === scope.tenant &&
          item.enterpriseCode === scope.enterprise,
      );
      if (
        !assignment ||
        values.sourceCodes.some(
          (code) => !assignment.allowedSourceCodes.includes(code),
        )
      )
        this.fail("ERR_CPL_00008");
      const group = {
        code: values.code,
        name: values.name,
        active: values.active,
        sourceCodes: values.sourceCodes,
        tenantCode: scope.tenant,
        enterpriseCode: scope.enterprise,
      };
      if (section === "enterprise-new-group") {
        assignment.activeGroupCodes = assignment.activeGroupCodes ?? [
          ...assignment.groupCodes,
        ];
        groups.definitions.push(group);
        assignment.groupCodes.push(group.code);
        if (values.active) assignment.activeGroupCodes.push(group.code);
      } else {
        const index = Number(section.slice("enterprise-group-".length));
        const previous = groups.definitions[index];
        if (
          !previous ||
          previous.code !== group.code ||
          previous.tenantCode !== scope.tenant ||
          previous.enterpriseCode !== scope.enterprise
        )
          this.fail("ERR_CPL_00008");
        groups.definitions[index] = group;
      }
      SERVICE.DefaultCopilotKnowledgeGroupService.validate(
        groups,
        SERVICE.DefaultCopilotKnowledgeRuntimeService.registry(configuration),
      );
      entries.push({ path: "copilot.knowledge.groups", value: groups });
    } else if (
      section === "new-group" ||
      section.startsWith("group-") ||
      section === "knowledge-ceilings"
    ) {
      const groups = _.cloneDeep(configuration.knowledge.groups);
      if (section === "group-policy") groups.enabled = values.enabled;
      else if (section === "knowledge-ceilings") {
        let assignment = groups.assignments.find(
          (item) =>
            item.tenantCode === scope.tenant &&
            item.enterpriseCode === scope.enterprise,
        );
        if (!assignment) {
          assignment = {
            tenantCode: scope.tenant,
            enterpriseCode: scope.enterprise,
            activeGroupCodes: [],
          };
          groups.assignments.push(assignment);
        }
        assignment.activeGroupCodes = (
          assignment.activeGroupCodes ||
          assignment.groupCodes ||
          []
        ).filter((code) => values.groupCodes.includes(code));
        assignment.groupCodes = values.groupCodes;
        assignment.allowedSourceCodes = values.allowedSourceCodes;
      } else {
        const group = {
          code: values.code,
          name: values.name,
          active: values.active,
          sourceCodes: values.sourceCodes,
        };
        if (section === "new-group") groups.definitions.push(group);
        else {
          const index = Number(section.slice(6));
          if (
            !groups.definitions[index] ||
            groups.definitions[index].code !== values.code
          )
            this.fail();
          groups.definitions[index] = {
            ...groups.definitions[index],
            ...group,
          };
        }
      }
      SERVICE.DefaultCopilotKnowledgeGroupService.validate(
        groups,
        SERVICE.DefaultCopilotKnowledgeRuntimeService.registry(configuration),
      );
      entries.push({ path: "copilot.knowledge.groups", value: groups });
    } else if (section === "new-runtime-sources") {
      const choices =
        SERVICE.DefaultCopilotRuntimeKnowledgeSourceService.choices(
          configuration.knowledge.repositoryRoots,
        );
      if (
        !values.partitions.length ||
        values.partitions.length > 100 ||
        values.codePrefix.length > 40
      )
        this.fail();
      const definitions = _.cloneDeep(
        configuration.knowledge.sourceRegistry.definitions,
      );
      for (const code of values.partitions) {
        const choice = choices.find((item) => item.code === code);
        if (!choice) this.fail();
        const source = {
          code: values.codePrefix + "-" + choice.moduleName,
          repository: choice.repository,
          project: scope.customerProject,
          module: choice.moduleName,
          owner: choice.moduleName,
          runtimeModule: choice.moduleName,
          sourceType: values.sourceType,
          classification: "RESTRICTED",
          version: values.version,
          paths: values.paths,
          excludedPaths: values.excludedPaths,
          allowedExtensions:
            values.sourceType === "INTERNAL_DOCUMENTATION"
              ? [".md", ".txt"]
              : configuration.knowledge.ingestion.allowedExtensions,
          allowedChannels: ["EMPLOYEE"],
          requiredPermissions: ["copilot.knowledge.restricted.read"],
          tenantScopes: [scope.tenant],
          enterpriseScopes: [scope.enterprise],
          environmentScopes: [scope.environment],
          secretScanPolicy: "REQUIRED",
          enabled: false,
        };
        const normalized =
          SERVICE.DefaultCopilotKnowledgeSourceRegistryService.normalize(
            { ...source, enabled: true },
            configuration.knowledge.sourceRegistry,
            SERVICE.DefaultCopilotPolicyService,
          );
        SERVICE.DefaultCopilotRuntimeKnowledgeSourceService.bind(
          normalized,
          configuration.knowledge.repositoryRoots,
        );
        definitions.push(source);
      }
      SERVICE.DefaultCopilotKnowledgeRuntimeService.registry({
        ...configuration,
        knowledge: {
          ...configuration.knowledge,
          sourceRegistry: {
            ...configuration.knowledge.sourceRegistry,
            definitions,
          },
        },
      });
      entries.push({
        path: "copilot.knowledge.sourceRegistry.definitions",
        value: definitions,
      });
    } else if (section.startsWith("source-")) {
      const definitions = _.cloneDeep(
        configuration.knowledge.sourceRegistry.definitions,
      );
      const index = Number(section.slice(7));
      if (!definitions[index]) this.fail();
      definitions[index] = {
        ...definitions[index],
        enabled: values.enabled,
        version: values.version,
        paths: values.paths,
        excludedPaths: values.excludedPaths,
      };
      SERVICE.DefaultCopilotKnowledgeRuntimeService.registry({
        ...configuration,
        knowledge: {
          ...configuration.knowledge,
          sourceRegistry: {
            ...configuration.knowledge.sourceRegistry,
            definitions,
          },
        },
      });
      entries.push({
        path: "copilot.knowledge.sourceRegistry.definitions",
        value: definitions,
      });
    } else if (section === "groups") {
      const assignments = _.cloneDeep(
        configuration.knowledge.groups.assignments,
      );
      assignments.find(
        (item) =>
          item.tenantCode === scope.tenant &&
          item.enterpriseCode === scope.enterprise,
      ).activeGroupCodes = values.activeGroupCodes;
      SERVICE.DefaultCopilotKnowledgeGroupService.validate(
        { ...configuration.knowledge.groups, assignments },
        SERVICE.DefaultCopilotKnowledgeRuntimeService.registry(configuration),
      );
      entries.push({
        path: "copilot.knowledge.groups.assignments",
        value: assignments,
      });
    } else this.fail();
    return {
      $propertyPatch: { version: 1, values: entries, missingPaths: [] },
    };
  },
  /** Rebuilds one proposal from fresh policy, preserving runtime revision and safe review evidence. @param {Object} request Trusted context. @returns {Promise<Object>} Internal proposal. */
  prepare: async function (request) {
    this.scope(request);
    const current = await this.current(request);
    const scope = this.scope(request);
    const body = request.body || {};
    const authority = JSON.stringify(scope);
    if (
      body.notBefore !== undefined &&
      (typeof body.notBefore !== "string" ||
        !Number.isFinite(Date.parse(body.notBefore)) ||
        new Date(body.notBefore).toISOString() !== body.notBefore)
    )
      this.fail();
    if (
      Object.keys(body).some(
        (key) =>
          ![
            "section",
            "values",
            "revision",
            "reason",
            "previewDigest",
            "notBefore",
          ].includes(key),
      ) ||
      body.revision !== current.revision ||
      typeof body.reason !== "string" ||
      !body.reason.trim() ||
      body.reason.length > 500
    )
      this.fail("ERR_CPL_00011");
    const section = this.sections(current.configuration, scope).find(
      (item) => item.code === body.section,
    );
    if (!section?.editable) this.fail("ERR_CPL_00008");
    const values = this.validate(section, body.values);
    if (section.code === "retention")
      await SERVICE.DefaultCopilotConversationLifecycleService.validateHolds(
        request,
        { tenantCode: scope.tenant, enterpriseCode: scope.enterprise },
        values.conversationCodes,
      );
    const configuration = this.patch(
      current.configuration,
      scope,
      section.code,
      values,
    );
    const activationRequest = {
      configurationType: "propertyConfiguration",
      configurationCode: "tenantProperties",
      moduleName: "copilotPolicy",
      configuration,
      requestReason: body.reason,
      ...(body.notBefore ? { notBefore: body.notBefore } : {}),
    };
    const context = {
      tenant: request.tenant,
      authData: request.authData,
      correlationId: request.correlationId,
    };
    const owner = SERVICE.DefaultRuntimeConfigurationActivationRequestService;
    const preview = await owner.previewActivationRequest(
      context,
      activationRequest,
    );
    if (preview.persistenceRevision !== current.revision)
      this.fail("ERR_CPL_00011");
    const refreshed = await this.current(request);
    const freshScope = this.scope(request);
    const freshSection = this.sections(
      refreshed.configuration,
      freshScope,
    ).find((item) => item.code === section.code);
    if (
      refreshed.revision !== current.revision ||
      JSON.stringify(freshScope) !== authority ||
      !freshSection?.editable ||
      !_.isEqual(freshSection, section) ||
      !_.isEqual(
        this.patch(
          refreshed.configuration,
          freshScope,
          section.code,
          this.validate(freshSection, body.values),
        ),
        configuration,
      )
    )
      this.fail("ERR_CPL_00011");
    const expectedPreviewDigest = owner.createConfigurationDigest(preview);
    const changes = section.fields
      .filter(
        (field) =>
          JSON.stringify(field.value) !== JSON.stringify(values[field.id]),
      )
      .map((field) => ({
        label: field.label,
        before: field.value,
        after: values[field.id],
      }));
    if (!changes.length) this.fail();
    const digest = owner.createConfigurationDigest({
      expectedPreviewDigest,
      configuration,
      actor: scope.actor,
      enterprise: scope.enterprise,
      reason: body.reason,
      notBefore: body.notBefore || null,
    });
    return {
      context,
      activationRequest: { ...activationRequest, expectedPreviewDigest },
      review: {
        contractVersion: 1,
        enterpriseCode: scope.enterprise,
        section: section.code,
        previewDigest: digest,
        changes,
        approvalRequired: true,
      },
    };
  },
  /** Previews without writing or changing effective policy. @param {Object} request Trusted command. @returns {Promise<Object>} Safe review. */
  preview: async function (request) {
    return (await this.prepare(request)).review;
  },
  /** Submits reviewed intent for independent runtime approval; never activates or retries. @param {Object} request Trusted command. @returns {Promise<Object>} Receipt. */
  submit: async function (request) {
    const prepared = await this.prepare(request);
    if (request.body.previewDigest !== prepared.review.previewDigest)
      this.fail("ERR_CPL_00011");
    const result =
      await SERVICE.DefaultRuntimeConfigurationActivationRequestService.createActivationRequest(
        {
          ...prepared.context,
          activationRequest: prepared.activationRequest,
        },
      );
    if (
      !/^SUC_/.test(result?.code || "") ||
      !result.data?.code ||
      result.data.status !== "REQUESTED"
    )
      this.fail("ERR_CPL_00010");
    return {
      contractVersion: 1,
      enterpriseCode: prepared.review.enterpriseCode,
      code: result.data.code,
      status: result.data.status,
    };
  },
};
