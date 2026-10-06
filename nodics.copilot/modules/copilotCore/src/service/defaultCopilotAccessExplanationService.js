/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

/** @module copilotCore/service/DefaultCopilotAccessExplanationService
 * @description Composes non-authoritative business journey diagnostics from current grants and already scoped knowledge metadata, without invoking or registering tools.
 * @layer service @owner copilotCore
 * @override Customize inert presentation; never treat diagnostic states as domain access, operational readiness or execution authority.
 */
module.exports = {
  /** Projects initial prerequisites only; every actual read or action retains its owning API authorization and validation. @param {Object} context Trusted employee scope. @param {Object} configuration Effective Copilot configuration. @param {Object} groups Already policy-narrowed source registry. @returns {Object} Safe business journey explanations. */
  explain: function (context, configuration, groups) {
    const policy = SERVICE.DefaultCopilotPolicyService;
    if (
      context?.channel !== "EMPLOYEE" ||
      !context.tenant ||
      !context.enterprise ||
      !context.actor ||
      !policy.hasPermission(context, "copilot.assistant.read")
    )
      throw new CLASSES.NodicsError("ERR_CPK_00014");
    const copy = configuration.core?.conversationContext?.journeys;
    if (!copy) throw new CLASSES.NodicsError("ERR_CPK_00014");
    const text = (value) => {
      if (typeof value !== "string" || !value.trim() || value.length > 1000)
        throw new CLASSES.NodicsError("ERR_CPK_00014");
      return value;
    };
    const sources = (groups.registry?.sources || []).filter(
      (source) =>
        source.enabled &&
        policy.decideSourceAccess(source, context, configuration.policy)
          .allowed,
    );
    const live = (source) =>
      source.tenantScopes?.includes(context.tenant) &&
      source.enterpriseScopes?.includes(context.enterprise) &&
      source.environmentScopes?.includes(context.environment);
    const hasSource = (type) =>
      sources.some((source) => source.sourceType === type && live(source));
    const definitions = [
      ...["create", "update", "delete"].map((kind) => ({
        code: "schema" + kind[0].toUpperCase() + kind.slice(1),
        permissions: [
          "copilot.data.query",
          "copilot.mutation.prepare",
          "copilot.mutation.execute",
          "system.schema.manage",
        ],
        source: hasSource("DATABASE"),
        configured:
          configuration.workbench?.schemaActions?.enabled === true &&
          Object.values(
            configuration.workbench?.schemaActions?.sources || {},
          ).some((schemas) => Array.isArray(schemas) && schemas.length > 0),
      })),
      ...[
        ["definitionCreate", "process.definition.create"],
        ["definitionUpdate", "process.definition.update"],
        ["definitionPrepare", "process.definition.update"],
        ["definitionValidate", "process.definition.validate"],
        ["definitionPublish", "process.definition.publish"],
        ["definitionDelete", "process.definition.delete"],
        ["instanceStart", "process.instance.start"],
        ["instanceCancel", "process.instance.cancel"],
        ["instanceRetry", "process.instance.retry"],
        ["instanceCompensate", "process.instance.compensate"],
      ].map(([code, permission]) => ({
        code,
        permissions: [
          "copilot.mutation.prepare",
          "copilot.mutation.execute",
          permission,
        ],
        configured:
          configuration.workbench?.processLifecycleTarget?.enabled === true,
      })),
      ...["create", "update", "archive", "execute"].map((kind) => ({
        code: "trigger" + kind[0].toUpperCase() + kind.slice(1),
        permissions: [
          "copilot.mutation.prepare",
          "copilot.mutation.execute",
          "process.trigger." + (kind === "execute" ? "execute" : "manage"),
        ],
        configured:
          configuration.workbench?.processTriggerTarget?.enabled === true,
      })),
      ...["claim", "assign", "complete", "cancel"].map((kind) => ({
        code: "task" + kind[0].toUpperCase() + kind.slice(1),
        permissions: [
          "copilot.mutation.prepare",
          "copilot.mutation.execute",
          "process.task." + kind,
        ],
        configured:
          configuration.workbench?.processTaskTarget?.enabled === true,
      })),
      {
        code: "knowledge",
        permissions: ["copilot.knowledge.internal.read"],
        source: sources.some(
          (source) => !["DATABASE", "EXTERNAL_LOG"].includes(source.sourceType),
        ),
        configured: configuration.knowledge?.retrieval?.enabled === true,
      },
      {
        code: "database",
        permissions: ["copilot.data.query"],
        source: hasSource("DATABASE"),
      },
      {
        code: "logs",
        permissions: ["copilot.logs.read"],
        source: hasSource("EXTERNAL_LOG"),
        configured: configuration.knowledge?.externalLogs?.enabled === true,
      },
      { code: "prepare", permissions: ["copilot.mutation.prepare"] },
      {
        code: "execute",
        permissions: ["copilot.mutation.prepare", "copilot.mutation.execute"],
      },
      {
        code: "enterprise",
        permissions: [
          "copilot.mutation.prepare",
          "copilot.mutation.execute",
          "profile.enterprise.create",
          "profile.enterpriseAccess.assign",
        ],
        configured: configuration.workbench?.enterpriseTarget?.enabled === true,
      },
      {
        code: "transcript",
        permissions: [
          "copilot.activity.read",
          "copilot.activity.transcript.read",
        ],
        configured:
          configuration.conversation?.transcriptInspection?.enabled === true,
      },
      {
        code: "invitation",
        permissions: [
          "copilot.mutation.prepare",
          "copilot.mutation.execute",
          "profile.enterpriseAccess.assign",
        ],
        configured:
          configuration.workbench?.standaloneInvitationsEnabled === true &&
          configuration.workbench?.enterpriseTarget?.enabled === true,
      },
      {
        code: "price",
        permissions: ["copilot.mutation.prepare", "copilot.mutation.execute"],
        configured:
          configuration.workbench?.standalonePricesEnabled === true &&
          Boolean(
            configuration.workbench?.target?.pricingModule &&
            configuration.workbench?.target?.connectionName,
          ),
      },
      {
        code: "recordedSearch",
        permissions: [
          "copilot.activity.read",
          "copilot.activity.transcript.read",
          "copilot.activity.content.search",
        ],
        configured:
          configuration.conversation?.transcriptInspection?.enabled === true &&
          configuration.conversation?.recordedSearch?.enabled === true,
      },
      {
        code: "retention",
        permissions: [
          "copilot.activity.read",
          "copilot.activity.lifecycle.read",
        ],
      },
      {
        code: "coupon",
        permissions: [
          "copilot.mutation.prepare",
          "copilot.mutation.execute",
          "commerce.coupon.pos.redeem",
        ],
        configured: configuration.workbench?.couponTarget?.enabled === true,
      },
      {
        code: "collectionCentre",
        permissions: ["copilot.mutation.prepare", "copilot.mutation.execute"],
        configured:
          configuration.workbench?.collectionCentreTarget?.enabled === true,
      },
    ];
    return {
      contractVersion: 1,
      title: text(copy.title),
      notice: text(copy.notice),
      items: definitions.map((item) => {
        const missing = item.permissions.filter(
          (permission) => !policy.hasPermission(context, permission),
        );
        const state =
          item.implemented === false
            ? "ADAPTER_REQUIRED"
            : missing.length
              ? "PERMISSION_REQUIRED"
              : item.configured === false
                ? "CONFIGURATION_REQUIRED"
                : item.source === false
                  ? "SOURCE_REQUIRED"
                  : "OWNER_CHECK_REQUIRED";
        return {
          code: item.code,
          label: text(copy.labels[item.code]),
          state,
          stateLabel: text(copy.states[state]),
          reason: text(copy.reasons[state]),
          nextStep: text(copy.steps[item.code]),
          missingPermissions: missing,
        };
      }),
    };
  },
};
