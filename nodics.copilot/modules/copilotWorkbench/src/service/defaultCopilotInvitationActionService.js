/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
const crypto = require("node:crypto");
/** @module copilotWorkbench/service/DefaultCopilotInvitationActionService
 * @description Reviews standalone invitations to an existing enterprise and delegates identity authority to Profile.
 * @layer service @owner copilotWorkbench
 * @override Preserve explicit enterprise, roles, employee credentials, native authorization, exact review and no uncertain replay.
 */
module.exports = {
  /** Recognizes a bounded explicit invitation command. @param {string} message Human input. @returns {Object|null} Typed command. */
  parseIntent: function (message) {
    if (typeof message !== "string" || message.length > 16384) return null;
    try {
      const body = JSON.parse(
        message.trim().replace(/^```json\s*([\s\S]*?)\s*```$/i, "$1"),
      );
      return body?.operation === "profile.enterprise.invite" ? body : null;
    } catch {
      return null;
    }
  },
  /** Reuses Profile routing, separating original inspection from new-write admission. @param {Object} configuration Effective settings. @param {boolean} inspection Internal original-receipt read only. @returns {Object} Reviewed target. */
  target: function (configuration, inspection = false) {
    if (
      !inspection &&
      configuration.workbench?.standaloneInvitationsEnabled !== true
    )
      throw new CLASSES.NodicsError("ERR_CPW_00005");
    return SERVICE.DefaultCopilotEnterpriseActionService.target(
      configuration,
      inspection,
    );
  },
  /** Requires invitation authority, never enterprise-create authority. Profile independently authorizes the destination enterprise. @param {Object} request Trusted employee request. @param {Object} configuration Effective settings. @param {boolean} execute Execution flag. @returns {Object} Context. */
  authorize: function (request, configuration, execute = false) {
    const context = SERVICE.DefaultCopilotOrchestrationService.securityContext(
      request,
      configuration,
    );
    const grants = [
      "copilot.mutation.prepare",
      "profile.enterpriseAccess.assign",
      ...(execute ? ["copilot.mutation.execute"] : []),
    ];
    if (
      context.channel !== "EMPLOYEE" ||
      !context.tenant ||
      !context.enterprise ||
      !context.actor ||
      grants.some(
        (grant) =>
          !SERVICE.DefaultCopilotPolicyService.hasPermission(context, grant),
      )
    )
      throw new CLASSES.NodicsError("ERR_CPW_00002");
    return context;
  },
  /** Validates only explicit existing-enterprise invitation data. @param {Object} body Human command. @returns {Object} Rows or missing fields. */
  input: function (body) {
    const fail = () => {
      throw new CLASSES.NodicsError("ERR_CPW_00004");
    };
    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body) ||
      body.operation !== "profile.enterprise.invite" ||
      Object.keys(body).some(
        (key) => !["operation", "enterpriseCode", "employees"].includes(key),
      )
    )
      fail();
    const missing = ["enterpriseCode", "employees"].filter(
      (key) => body[key] === undefined || body[key] === "",
    );
    if (missing.length) return { state: "CLARIFICATION_REQUIRED", missing };
    if (
      typeof body.enterpriseCode !== "string" ||
      !/^[A-Za-z][A-Za-z0-9_-]{1,63}$/.test(body.enterpriseCode) ||
      !Array.isArray(body.employees) ||
      !body.employees.length ||
      body.employees.length > 20
    )
      fail();
    const records = body.employees.map((item, index) => {
      if (
        !item ||
        typeof item !== "object" ||
        Array.isArray(item) ||
        Object.keys(item).some((key) => !["email", "roleCode"].includes(key))
      )
        fail();
      const absent = ["email", "roleCode"].filter(
        (key) => item[key] === undefined || item[key] === "",
      );
      if (absent.length) {
        missing.push(...absent.map((key) => "employees." + index + "." + key));
        return null;
      }
      if (
        typeof item.email !== "string" ||
        item.email.length > 320 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.email) ||
        !["ENTERPRISE_ADMIN", "CONTENT_MANAGER", "OPERATOR", "VIEWER"].includes(
          item.roleCode,
        )
      )
        fail();
      return {
        code: "invitation-" + String(index + 1),
        email: item.email.toLowerCase(),
        roleCode: item.roleCode,
        enterpriseCode: body.enterpriseCode,
      };
    });
    if (missing.length) return { state: "CLARIFICATION_REQUIRED", missing };
    if (new Set(records.map((row) => row.email)).size !== records.length)
      fail();
    return { records };
  },
  /** Persists review only; does not create an enterprise, invitation or employee. @param {Object} request Human request. @param {Object} configuration Effective settings. @returns {Promise<Object>} Review or clarification. */
  prepare: async function (request, configuration) {
    const context = this.authorize(request, configuration);
    const target = this.target(configuration);
    const input = this.input(request.body);
    if (input.state) return { plan: input };
    SERVICE.DefaultCopilotOrchestrationService.employeeExecutionHeaders(
      request,
    );
    const plan = {
      id: "invitation-plan-" + crypto.randomUUID(),
      state: "VALIDATED",
      schema: "enterpriseAccessAssignment",
      records: input.records,
      relatedRecords: {},
      executionTarget: target,
      preview: {
        employeeActivation: "INVITEE_REGISTRATION_REQUIRED",
        summary:
          "Prepare " +
          input.records.length +
          " employee invitations for existing enterprise " +
          request.body.enterpriseCode +
          ". Profile validates access at execution. Invitees must complete registration; no accounts are activated.",
      },
    };
    plan.preview.review =
      SERVICE.DefaultCopilotWorkbenchService.buildReview(plan);
    return SERVICE.DefaultCopilotWorkbenchService.persistPrepared(
      plan,
      "profile.enterprise.invite",
      request,
      context,
    );
  },
  /** Validates every reviewed row before claiming and rechecks authority before each single native call. @param {Object} action Owned action. @param {Object} request Current confirmation. @param {Object} configuration Effective settings. @returns {Promise<Object>} Row outcomes. */
  execute: async function (action, request, configuration) {
    const context = this.authorize(request, configuration, true);
    const target = this.target(configuration),
      plan = action.audit?.plan;
    if (
      action.capability !== "profile.enterprise.invite" ||
      plan?.schema !== "enterpriseAccessAssignment" ||
      !Array.isArray(plan.records) ||
      Object.keys(plan.relatedRecords || {}).length ||
      JSON.stringify(target) !== JSON.stringify(plan.executionTarget)
    )
      throw new CLASSES.NodicsError("ERR_CPW_00004");
    const checked = this.input({
      operation: action.capability,
      enterpriseCode: plan.records[0]?.enterpriseCode,
      employees: plan.records.map(({ email, roleCode }) => ({
        email,
        roleCode,
      })),
    });
    if (JSON.stringify(checked.records) !== JSON.stringify(plan.records))
      throw new CLASSES.NodicsError("ERR_CPW_00004");
    SERVICE.DefaultCopilotOrchestrationService.employeeExecutionHeaders(
      request,
    );
    return SERVICE.DefaultCopilotActionExecutionService.execute(
      action,
      request,
      context,
      request,
      (row, key) => {
        const current = CONFIG.get("copilot");
        this.authorize(request, current, true);
        if (JSON.stringify(this.target(current)) !== JSON.stringify(target))
          throw new CLASSES.NodicsError("ERR_CPW_00004");
        return SERVICE.DefaultCopilotEnterpriseActionService.submit(
          row,
          key,
          target,
          request,
        );
      },
      SERVICE.DefaultCopilotPolicyService,
    );
  },
};
