/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";

/** @module copilotCapability/src/service/defaultCopilotExperienceCapabilityService @description Declares channel-neutral assistance and future commerce capability contracts for domain adapters. @layer service @owner copilotCapability @override Commerce, Engagement, WCMS, Platform, and project modules contribute handlers through these descriptors. */
module.exports = {
  /** Projects permission-filtered descriptor metadata only; maturity is source readiness, never execution authority. @param {Object} context Trusted normalized context. @param {Object} policy Canonical policy owner. @returns {Object} Bounded inert catalogue. */
  catalogue: function (context, policy) {
    if (
      !context ||
      !context.tenant ||
      !context.actor ||
      !context.enterprise ||
      context.channel !== "EMPLOYEE" ||
      !policy ||
      typeof policy.decideCapabilityAccess !== "function"
    )
      throw new Error("COPILOT_CATALOGUE_CONTEXT_REQUIRED");
    const allowed = this.descriptors().filter((item) => {
      if (
        item.requiredPermissions !== undefined &&
        (!Array.isArray(item.requiredPermissions) ||
          item.requiredPermissions.length > 16 ||
          item.requiredPermissions.some(
            (grant) =>
              typeof grant !== "string" ||
              !/^[A-Za-z][A-Za-z0-9_.-]{0,127}$/.test(grant),
          ))
      )
        return false;
      return policy.decideCapabilityAccess(item, context).allowed === true;
    });
    return {
      state: "AVAILABLE",
      hasMore: allowed.length > 100,
      items: allowed.slice(0, 100).map((item) => ({
        code: item.code,
        owner: item.owner,
        permission: item.permission,
        riskClass: item.riskClass,
        mutates: item.mutates === true,
        maturity: ["IMPLEMENTED", "ADAPTER_REQUIRED", "FUTURE"].includes(
          item.maturity,
        )
          ? item.maturity
          : "ADAPTER_REQUIRED",
        execution:
          item.mutates === true
            ? "GOVERNED_CONFIRMATION_REQUIRED"
            : "CURRENT_AUTHORIZATION_REQUIRED",
      })),
    };
  },
  /** Returns standard capability descriptors with no embedded domain implementation. @returns {Object[]} Provider-neutral capability descriptors. */
  descriptors: function () {
    const risks = {
      "nodics.help.search": "INTERNAL_READ",
      "nodics.data.query": "SENSITIVE_READ",
      "nodics.data.export": "EXPORT",
      "nodics.workbench.prepare": "INTERNAL_READ",
      "nodics.workbench.execute": "CREATE",
      "experience.issue.assist": "INTERNAL_READ",
      "commerce.product.discover": "INTERNAL_READ",
      "commerce.cart.propose": "INTERNAL_READ",
      "commerce.checkout.execute": "CREATE",
    };
    return [
      ...["create", "update", "delete"].map((kind) => ({
        code: "data.record." + kind,
        owner: "database",
        permission: "system.schema.manage",
        requiredPermissions: ["copilot.data.query", "copilot.mutation.prepare"],
        riskClass: kind === "create" ? "CREATE" : kind.toUpperCase(),
        mutates: true,
        maturity: "IMPLEMENTED",
      })),
      ...[
        ["definition", "create", "process.definition.create"],
        ["definition", "update", "process.definition.update"],
        ["definition", "prepare", "process.definition.update"],
        ["definition", "validate", "process.definition.validate"],
        ["definition", "publish", "process.definition.publish"],
        ["definition", "delete", "process.definition.delete"],
        ["instance", "start", "process.instance.start"],
        ["instance", "cancel", "process.instance.cancel"],
        ["instance", "retry", "process.instance.retry"],
        ["instance", "compensate", "process.instance.compensate"],
      ].map(([family, kind, permission]) => ({
        code: "process." + family + "." + kind,
        owner: "workflow",
        permission,
        requiredPermissions: ["copilot.mutation.prepare"],
        riskClass: ["create", "start"].includes(kind) ? "CREATE" : "UPDATE",
        mutates: true,
        maturity: "IMPLEMENTED",
      })),
      ...["create", "update", "archive", "execute"].map((kind) => ({
        code: "process.trigger." + kind,
        owner: "workflow",
        permission:
          "process.trigger." + (kind === "execute" ? "execute" : "manage"),
        requiredPermissions: ["copilot.mutation.prepare"],
        riskClass:
          kind === "create" || kind === "execute" ? "CREATE" : "UPDATE",
        mutates: true,
        maturity: "IMPLEMENTED",
      })),
      ...["claim", "assign", "complete", "cancel"].map((kind) => ({
        code: "process.task." + kind,
        owner: "workflow",
        permission: "process.task." + kind,
        requiredPermissions: ["copilot.mutation.prepare"],
        riskClass: "UPDATE",
        mutates: true,
        maturity: "IMPLEMENTED",
      })),
      {
        code: "commerce.orderNotification.retry",
        owner: "digitalCore",
        permission: "commerce.digital.notification.retry",
        requiredPermissions: [
          "copilot.mutation.prepare",
          "commerce.digital.notification.read",
        ],
        riskClass: "UPDATE",
        mutates: true,
        maturity: "IMPLEMENTED",
      },
      ...(
        (typeof SERVICE !== "undefined" &&
          SERVICE.DefaultCopilotProcessInspectionService?.operations()) ||
        []
      ).map((operation) => ({
        code: operation.code,
        owner: "workflow",
        permission: operation.permission,
        requiredPermissions: ["copilot.data.query"],
        riskClass: "SENSITIVE_READ",
        mutates: false,
        maturity: "IMPLEMENTED",
      })),
      ...(
        (typeof SERVICE !== "undefined" &&
          SERVICE.DefaultCopilotImportInspectionService?.operations()) ||
        []
      ).map((operation) => ({
        code: operation.code,
        owner: "import",
        permission: operation.permission,
        requiredPermissions: ["copilot.data.query"],
        riskClass: "SENSITIVE_READ",
        mutates: false,
        maturity: "IMPLEMENTED",
      })),
      ...(
        (typeof SERVICE !== "undefined" &&
          SERVICE.DefaultCopilotRulesInspectionService?.operations()) ||
        []
      ).map((operation) => ({
        code: operation.code,
        owner: "rulesApi",
        permission: operation.permission,
        requiredPermissions: ["copilot.data.query"],
        riskClass: "SENSITIVE_READ",
        mutates: false,
        maturity: "IMPLEMENTED",
      })),
      ...(
        (typeof SERVICE !== "undefined" &&
          SERVICE.DefaultCopilotOrderNotificationInspectionService?.operations()) ||
        []
      ).map((operation) => ({
        code: operation.code,
        owner: "digitalCore",
        permission: "commerce.digital.notification.read",
        requiredPermissions: ["copilot.data.query"],
        riskClass: "SENSITIVE_READ",
        mutates: false,
        maturity: "IMPLEMENTED",
      })),
      {
        code: "nodics.help.search",
        owner: "copilotKnowledge",
        permission: "copilot.help.read",
        mutates: false,
        maturity: "IMPLEMENTED",
      },
      {
        code: "framework.modules.list",
        owner: "backoffice",
        permission: "backoffice.registry.view",
        riskClass: "INTERNAL_READ",
        mutates: false,
        maturity: "IMPLEMENTED",
      },
      {
        code: "framework.modules.count",
        owner: "backoffice",
        permission: "backoffice.registry.view",
        riskClass: "INTERNAL_READ",
        mutates: false,
        maturity: "IMPLEMENTED",
      },
      {
        code: "framework.modules.describe",
        owner: "backoffice",
        permission: "backoffice.registry.view",
        riskClass: "INTERNAL_READ",
        mutates: false,
        maturity: "IMPLEMENTED",
      },
      {
        code: "nodics.data.query",
        owner: "copilotCapability",
        permission: "copilot.data.query",
        mutates: false,
        maturity: "IMPLEMENTED",
      },
      {
        code: "nodics.data.export",
        owner: "copilotCapability",
        permission: "copilot.data.export",
        mutates: false,
        maturity: "IMPLEMENTED",
      },
      {
        code: "nodics.workbench.prepare",
        owner: "copilotWorkbench",
        permission: "copilot.mutation.prepare",
        mutates: false,
        maturity: "IMPLEMENTED",
      },
      {
        code: "nodics.workbench.execute",
        owner: "copilotWorkbench",
        permission: "copilot.mutation.execute",
        mutates: true,
        maturity: "IMPLEMENTED",
      },
      {
        code: "profile.enterprise.onboard",
        owner: "profile",
        permission: "profile.enterprise.create",
        requiredPermissions: [
          "copilot.mutation.prepare",
          "profile.enterpriseAccess.assign",
        ],
        riskClass: "ADMINISTRATIVE",
        mutates: true,
        maturity: "IMPLEMENTED",
      },
      {
        code: "commerce.product.create",
        owner: "copilotWorkbench",
        permission: "copilot.mutation.prepare",
        riskClass: "CREATE",
        mutates: true,
        maturity: "IMPLEMENTED",
      },
      {
        code: "profile.enterprise.invite",
        owner: "profile",
        permission: "profile.enterpriseAccess.assign",
        requiredPermissions: ["copilot.mutation.prepare"],
        riskClass: "ADMINISTRATIVE",
        mutates: true,
        maturity: "IMPLEMENTED",
      },
      {
        code: "commerce.price.create",
        owner: "pricing",
        permission: "copilot.mutation.prepare",
        riskClass: "CREATE",
        mutates: true,
        maturity: "IMPLEMENTED",
      },
      {
        code: "waste.collectionCentre.create",
        owner: "wasteCollection",
        permission: "copilot.mutation.prepare",
        riskClass: "CREATE",
        mutates: true,
        maturity: "IMPLEMENTED",
      },
      {
        code: "commerce.coupon.redeem",
        owner: "digitalCore",
        permission: "commerce.coupon.pos.redeem",
        requiredPermissions: ["copilot.mutation.prepare"],
        riskClass: "UPDATE",
        mutates: true,
        maturity: "IMPLEMENTED",
      },
      {
        code: "experience.issue.assist",
        owner: "engagementCopilot",
        permission: "copilot.experience.assist",
        mutates: false,
        maturity: "ADAPTER_REQUIRED",
      },
      {
        code: "commerce.product.discover",
        owner: "commerceCopilot",
        permission: "copilot.commerce.read",
        mutates: false,
        maturity: "ADAPTER_REQUIRED",
      },
      {
        code: "commerce.cart.propose",
        owner: "commerceCopilot",
        permission: "copilot.commerce.propose",
        mutates: false,
        maturity: "FUTURE",
      },
      {
        code: "commerce.checkout.execute",
        owner: "commerceCopilot",
        permission: "copilot.commerce.execute",
        mutates: true,
        maturity: "FUTURE",
      },
    ].map((item) => ({
      ...item,
      riskClass: item.riskClass || risks[item.code],
    }));
  },
};
