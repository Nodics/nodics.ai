/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const crypto = require("node:crypto");

/** @module copilotWorkbench/service/DefaultCopilotEnterpriseActionService
 * @description Prepares explicitly supplied enterprise data and delegates confirmed creation/invitations to Profile, without creating identity or granting membership itself.
 * @layer service @owner copilotWorkbench
 * @override Preserve Profile ownership, employee credentials, reviewed target, explicit roles, atomic action claim and no uncertain replay.
 */
module.exports = {
  /** Recognizes only an explicit bounded JSON command; ordinary prose remains with the existing conversational planner. @param {string} message Human message. @returns {Object|null} Typed intent or no match. */
  parseIntent: function (message) {
    if (typeof message !== "string" || message.length > 16384) return null;
    const text = message.trim().replace(/^```json\s*([\s\S]*?)\s*```$/i, "$1");
    if (!text.startsWith("{")) return null;
    try {
      const body = JSON.parse(text);
      return body?.operation === "profile.enterprise.onboard" ? body : null;
    } catch {
      return null;
    }
  },
  /** Resolves deployment-owned routing; original receipt inspection ignores only new-write admission. @param {Object} configuration Copilot configuration. @param {boolean} inspection Internal read-only selection, never caller authority. @returns {Object} Immutable plan target. */
  target: function (configuration, inspection = false) {
    const target = configuration.workbench?.enterpriseTarget;
    if (
      !target ||
      (!inspection && target.enabled !== true) ||
      typeof target.moduleName !== "string" ||
      !/^[A-Za-z][A-Za-z0-9._-]{0,63}$/.test(target.moduleName) ||
      typeof target.connectionName !== "string" ||
      !/^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(target.connectionName)
    )
      throw new CLASSES.NodicsError("ERR_CPW_00005");
    return {
      moduleName: target.moduleName,
      connectionName: target.connectionName,
      targetAuthority: structuredClone(target.targetAuthority || null),
      apiVersion: "v0",
    };
  },
  /** Checks independent Copilot and domain grants; the Profile API still performs its authoritative role and record checks. @param {Object} request Trusted request. @param {Object} configuration Effective configuration. @param {boolean} execute Execution flag. @returns {Object} Trusted context. */
  authorize: function (request, configuration, execute = false) {
    const context = SERVICE.DefaultCopilotOrchestrationService.securityContext(
      request,
      configuration,
    );
    const grants = [
      "copilot.mutation.prepare",
      "profile.enterprise.create",
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
  /** Validates a minimal explicit command without inventing names, roles, accounts, credentials or tenant placement. @param {Object} body Human-supplied command. @returns {Object} Clarification or bounded plan data. */
  input: function (body) {
    const fail = () => {
      throw new CLASSES.NodicsError("ERR_CPW_00004");
    };
    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body) ||
      Object.keys(body).some(
        (key) => !["operation", "enterprise", "employees"].includes(key),
      ) ||
      body.operation !== "profile.enterprise.onboard"
    )
      fail();
    const enterprise = body.enterprise;
    if (
      enterprise !== undefined &&
      (!enterprise ||
        typeof enterprise !== "object" ||
        Array.isArray(enterprise) ||
        Object.keys(enterprise).some(
          (key) => !["code", "name", "adminEmail"].includes(key),
        ))
    )
      fail();
    const missing = ["code", "name", "adminEmail"]
      .filter((key) => !enterprise?.[key])
      .map((key) => "enterprise." + key);
    if (body.employees === undefined) missing.push("employees");
    if (missing.length) return { state: "CLARIFICATION_REQUIRED", missing };
    const email = (value) =>
      typeof value === "string" &&
      value.length <= 320 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    if (
      typeof enterprise.code !== "string" ||
      !/^[A-Za-z][A-Za-z0-9_-]{1,63}$/.test(enterprise.code) ||
      typeof enterprise.name !== "string" ||
      !enterprise.name.trim() ||
      enterprise.name.length > 256 ||
      /[\u0000-\u001f]/.test(enterprise.name) ||
      !email(enterprise.adminEmail) ||
      !Array.isArray(body.employees) ||
      body.employees.length > 20
    )
      fail();
    const employees = body.employees.map((item, index) => {
      if (
        !item ||
        typeof item !== "object" ||
        Array.isArray(item) ||
        Object.keys(item).some((key) => !["email", "roleCode"].includes(key)) ||
        !email(item.email) ||
        !["ENTERPRISE_ADMIN", "CONTENT_MANAGER", "OPERATOR", "VIEWER"].includes(
          item.roleCode,
        )
      )
        fail();
      return {
        code: "invitation-" + String(index + 1),
        email: item.email.trim().toLowerCase(),
        roleCode: item.roleCode,
        enterpriseCode: enterprise.code,
      };
    });
    const emails = [
      enterprise.adminEmail.trim().toLowerCase(),
      ...employees.map((item) => item.email),
    ];
    if (new Set(emails).size !== emails.length) fail();
    return {
      enterprise: {
        code: enterprise.code,
        name: enterprise.name.trim(),
        adminEmail: emails[0],
      },
      employees,
    };
  },
  /** Persists only the reviewed action, not business records; ambiguous save acknowledgement returns no confirmation. @param {Object} request Human command. @param {Object} configuration Copilot configuration. @returns {Promise<Object>} Preview and confirmation. */
  prepare: async function (request, configuration) {
    const context = this.authorize(request, configuration);
    const input = this.input(request.body);
    if (input.state === "CLARIFICATION_REQUIRED") return { plan: input };
    const target = this.target(configuration);
    SERVICE.DefaultCopilotOrchestrationService.employeeExecutionHeaders(
      request,
    );
    const plan = {
      id: "enterprise-plan-" + crypto.randomUUID(),
      state: "VALIDATED",
      schema: "enterprise",
      records: [input.enterprise],
      relatedRecords: {
        invitations: {
          schema: "enterpriseAccessAssignment",
          records: input.employees,
        },
      },
      executionTarget: target,
      preview: {
        enterprise: input.enterprise,
        invitations: input.employees.map(({ email, roleCode }) => ({
          email,
          roleCode,
        })),
        employeeActivation: "INVITEE_REGISTRATION_REQUIRED",
        validation: "PROFILE_VALIDATES_AT_EXECUTION",
      },
    };
    plan.preview.summary =
      "Create one enterprise and prepare " +
      (input.employees.length + 1) +
      " employee invitations, including the default administrator. Invitees must complete registration; no employee account is activated by this action.";
    plan.preview.review =
      SERVICE.DefaultCopilotWorkbenchService.buildReview(plan);
    return SERVICE.DefaultCopilotWorkbenchService.persistPrepared(
      plan,
      "profile.enterprise.onboard",
      request,
      context,
    );
  },
  /** Sends one fixed Profile API command and accepts only exact command-specific business evidence. @param {Object} row Reviewed row. @param {string} key Idempotency key. @param {Object} target Reviewed target. @param {Object} request Trusted context. @returns {Promise<Object>} Minimal execution acknowledgement. */
  submit: async function (row, key, target, request) {
    const enterprise = row.schema === "enterprise";
    const record = row.record;
    const response = await SERVICE.DefaultModuleService.invokeModule({
      ...target,
      tenant: request.tenant,
      local: false,
      methodName: "POST",
      maxAttempts: 1,
      idempotencyKey: key,
      apiName: enterprise
        ? "/enterprises"
        : "/enterprises/" +
          encodeURIComponent(record.enterpriseCode) +
          "/access-assignments",
      header: {
        ...SERVICE.DefaultCopilotOrchestrationService.employeeExecutionHeaders(
          request,
        ),
        "Idempotency-Key": key,
      },
      request: enterprise
        ? { model: record }
        : {
            email: record.email,
            roleCode: record.roleCode,
            idempotencyKey: key,
          },
    });
    const data = response?.data;
    const confirmed =
      /^SUC_/.test(response?.code || "") &&
      !response.error &&
      response.success !== false &&
      response.acknowledged !== false &&
      (response.errors === undefined ||
        (Array.isArray(response.errors) && response.errors.length === 0)) &&
      data &&
      !Array.isArray(data) &&
      !data.error &&
      data.success !== false &&
      data.acknowledged !== false &&
      (data.errors === undefined ||
        (Array.isArray(data.errors) && data.errors.length === 0)) &&
      typeof data.code === "string" &&
      data.code.trim().length > 0 &&
      data.code.length <= 512 &&
      (enterprise
        ? data.code === record.code
        : data.enterpriseCode === record.enterpriseCode &&
          typeof data.email === "string" &&
          data.email.toLowerCase() === record.email &&
          data.roleCode === record.roleCode &&
          data.status === "PENDING");
    if (!confirmed) throw new CLASSES.NodicsError("ERR_CPW_00003");
    return { code: "SUC_COPILOT_DOMAIN", result: { code: record.code } };
  },
  /** Rechecks target and whole-plan shape before using the existing atomic action executor. @param {Object} action Owned action. @param {Object} request Current confirmation command. @param {Object} configuration Effective configuration. @returns {Promise<Object>} Bounded outcomes. */
  execute: async function (action, request, configuration) {
    const context = this.authorize(request, configuration, true);
    const target = this.target(configuration);
    const plan = action.audit?.plan;
    if (
      action.capability !== "profile.enterprise.onboard" ||
      plan?.schema !== "enterprise" ||
      !Array.isArray(plan.records) ||
      plan.records.length !== 1 ||
      Object.keys(plan.relatedRecords || {}).join() !== "invitations" ||
      plan.relatedRecords.invitations.schema !== "enterpriseAccessAssignment" ||
      JSON.stringify(target) !== JSON.stringify(plan.executionTarget)
    )
      throw new CLASSES.NodicsError("ERR_CPW_00004");
    const checked = this.input({
      operation: action.capability,
      enterprise: plan.records[0],
      employees: plan.relatedRecords.invitations.records.map(
        ({ email, roleCode }) => ({ email, roleCode }),
      ),
    });
    if (
      JSON.stringify(checked.enterprise) !== JSON.stringify(plan.records[0]) ||
      JSON.stringify(checked.employees) !==
        JSON.stringify(plan.relatedRecords.invitations.records)
    )
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
        return this.submit(row, key, target, request);
      },
      SERVICE.DefaultCopilotPolicyService,
    );
  },
};
