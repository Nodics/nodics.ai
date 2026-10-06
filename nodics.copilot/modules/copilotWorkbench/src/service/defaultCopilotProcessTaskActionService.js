/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
const crypto = require("node:crypto");

/**
 * @module copilotWorkbench/service/DefaultCopilotProcessTaskActionService
 * @description Reviews and dispatches explicit human task commands through Workflow and the existing durable action executor. Preparation never changes a task. Uncertain commands require original receipts, never replay.
 * @layer service @owner copilotWorkbench
 * @override Preserve fixed routes, complete field review, employee grants, pinned deployment target and native lifecycle authority. Later layers may tighten bounded inputs, not introduce arbitrary API execution.
 */
module.exports = {
  /** Rejects without echoing command content. @returns {never} Throws. */
  fail: function () {
    throw new CLASSES.NodicsError("ERR_CPW_00004");
  },
  /** Recognizes fixed typed commands and explicit task verbs without guessing approval decisions. @param {string} message Employee input. @returns {Object|null} Command or unrelated input. */
  parseIntent: function (message) {
    if (typeof message !== "string" || message.length > 16384) return null;
    try {
      const body = JSON.parse(
        message.trim().replace(/^```json\s*([\s\S]*?)\s*```$/i, "$1"),
      );
      if (
        typeof body?.operation === "string" &&
        body.operation.startsWith("process.task.")
      )
        return body;
    } catch {
      /* Natural-language forms below still require exact references. */
    }
    const match =
      /^(claim|assign|complete|cancel)\s+(?:process\s+)?task(?:\s+([A-Za-z0-9][A-Za-z0-9._:-]{0,127}))?(?:\s+(to|because)\s+(.+))?\s*$/i.exec(
        message.trim(),
      );
    if (!match) return null;
    const kind = match[1].toLowerCase();
    const command = {
      operation: "process.task." + kind,
      ...(match[2] ? { taskCode: match[2] } : {}),
    };
    if (match[3]) {
      if (kind === "assign" && match[3].toLowerCase() === "to")
        command.assignee = match[4].trim();
      else if (kind === "cancel" && match[3].toLowerCase() === "because")
        command.reason = match[4].trim();
      else return { ...command, invalidInput: true };
    }
    return command;
  },
  /** Allows only explicit Workflow commands. @param {string} operation Capability identity. @returns {string} Native suffix. */
  kind: function (operation) {
    const kind =
      typeof operation === "string"
        ? operation.replace(/^process\.task\./, "")
        : "";
    if (
      operation !== "process.task." + kind ||
      !["claim", "assign", "complete", "cancel"].includes(kind)
    )
      this.fail();
    return kind;
  },
  /** Resolves deployment-owned routing, independent of read inspection admission. @param {Object} configuration Effective settings. @param {boolean} inspection Internal original-receipt read only. @returns {Object} Immutable owner target. */
  target: function (configuration, inspection = false) {
    const target = configuration.workbench?.processTaskTarget;
    if (
      (!inspection && target?.enabled !== true) ||
      target?.moduleName !== "workflow" ||
      typeof target.connectionName !== "string" ||
      target.connectionName === "default" ||
      !/^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(target.connectionName) ||
      !target.targetAuthority ||
      Object.keys(target.targetAuthority).join() !== "runtimeRole" ||
      !/^[A-Z][A-Z0-9_]{0,63}$/.test(target.targetAuthority.runtimeRole || "")
    )
      this.fail();
    return {
      moduleName: "workflow",
      connectionName: target.connectionName,
      targetAuthority: structuredClone(target.targetAuthority),
    };
  },
  /** Requires original employee identity and independent native/Copilot grants. @param {Object} request Trusted context. @param {Object} configuration Effective settings. @param {string} operation Fixed capability. @param {boolean} execute Execution phase. @returns {Object} Trusted context. */
  authorize: function (request, configuration, operation, execute = false) {
    this.kind(operation);
    const core = SERVICE.DefaultCopilotOrchestrationService;
    const context = core.securityContext(request, configuration);
    if (
      context.channel !== "EMPLOYEE" ||
      !context.actor ||
      !context.enterprise ||
      !context.tenant ||
      context.tenant !== request.tenant ||
      [
        "copilot.mutation.prepare",
        operation,
        ...(execute ? ["copilot.mutation.execute"] : []),
      ].some(
        (grant) =>
          !SERVICE.DefaultCopilotPolicyService.hasPermission(context, grant),
      )
    )
      throw new CLASSES.NodicsError("ERR_CPW_00002");
    core.employeeExecutionHeaders(request);
    return context;
  },
  /** Validates every executed field; absent decisions and references require clarification. @param {Object} body Employee input. @returns {Object} Native command or missing fields. */
  input: function (body) {
    const kind = this.kind(body?.operation);
    const extra = {
      claim: [],
      assign: ["assignee"],
      complete: ["decision"],
      cancel: ["reason"],
    }[kind];
    if (
      Object.keys(body).some(
        (key) => !["operation", "taskCode", ...extra].includes(key),
      )
    )
      this.fail();
    const missing = ["taskCode", ...extra].filter(
      (key) => body[key] === undefined || body[key] === "",
    );
    const code = (value) =>
      typeof value === "string" &&
      /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(value);
    if (
      body.taskCode !== undefined &&
      body.taskCode !== "" &&
      !code(body.taskCode)
    )
      this.fail();
    if (
      body.assignee !== undefined &&
      body.assignee !== "" &&
      !code(body.assignee)
    )
      this.fail();
    const text = (value) =>
      typeof value === "string" &&
      value.trim() &&
      value.length <= 1000 &&
      !/[\u0000-\u001f]/.test(value);
    if (body.reason !== undefined && body.reason !== "" && !text(body.reason))
      this.fail();
    if (body.decision !== undefined) {
      const decision = body.decision;
      if (
        !decision ||
        typeof decision !== "object" ||
        Array.isArray(decision) ||
        !Object.keys(decision).length ||
        Object.keys(decision).some(
          (key) =>
            ![
              "approved",
              "reason",
              "outcome",
              "transitionCode",
              "targetNodeCode",
            ].includes(key),
        ) ||
        Object.entries(decision).some(([key, value]) =>
          key === "approved"
            ? typeof value !== "boolean"
            : ["transitionCode", "targetNodeCode"].includes(key)
              ? !code(value)
              : !text(value),
        )
      )
        this.fail();
    }
    if (missing.length) return { state: "CLARIFICATION_REQUIRED", missing };
    return {
      taskCode: body.taskCode,
      body: Object.fromEntries(
        extra.map((key) => [key, structuredClone(body[key])]),
      ),
    };
  },
  /** Creates a complete immutable review, not a claim of task existence or successful future advancement. @param {Object} request Employee command. @param {Object} configuration Effective settings. @returns {Promise<Object>} Confirmation or clarification. */
  prepare: async function (request, configuration) {
    const context = this.authorize(
      request,
      configuration,
      request.body?.operation,
    );
    const target = this.target(configuration);
    const command = this.input(request.body);
    if (command.state) return { plan: command };
    const fields = [
      { label: "Operation", value: request.body.operation },
      { label: "Task", value: command.taskCode },
      { label: "Executing employee", value: context.actor },
    ];
    for (const [key, value] of Object.entries(command.body)) {
      if (key === "decision")
        for (const [field, item] of Object.entries(value))
          fields.push({ label: "Decision: " + field, value: String(item) });
      else fields.push({ label: key, value: String(value) });
    }
    const plan = {
      id: "process-task-plan-" + crypto.randomUUID(),
      state: "VALIDATED",
      schema: "processTask",
      records: [{ code: command.taskCode, command: command.body }],
      relatedRecords: {},
      executionTarget: target,
      preview: {
        summary:
          "Review this task command. Workflow verifies the task, actor and current policy at execution. Completing a task can advance its workflow; it does not guarantee that downstream actions succeed. No task has been changed yet.",
        review: [
          {
            title: "Process task " + this.kind(request.body.operation),
            fields,
          },
        ],
      },
    };
    return SERVICE.DefaultCopilotWorkbenchService.persistPrepared(
      plan,
      request.body.operation,
      request,
      context,
    );
  },
  /** Revalidates immutable stored rows for execution or original evidence inspection. @param {Object} action Owned action. @returns {Object} Native command. */
  checked: function (action) {
    const plan = action.audit?.plan;
    const row = plan?.records?.[0];
    if (
      plan?.schema !== "processTask" ||
      !Array.isArray(plan.records) ||
      plan.records.length !== 1 ||
      Object.keys(plan.relatedRecords || {}).length ||
      !row ||
      Object.keys(row).sort().join() !== "code,command" ||
      !row.command ||
      typeof row.command !== "object" ||
      Array.isArray(row.command)
    )
      this.fail();
    const input = this.input({
      ...row.command,
      operation: action.capability,
      taskCode: row.code,
    });
    if (
      input.state ||
      JSON.stringify(input.body) !== JSON.stringify(row.command)
    )
      this.fail();
    return input;
  },
  /** Dispatches one fixed owner route after durable approval and claim; never retries an uncertain response. @param {Object} action Owned action. @param {Object} request Confirmation request. @param {Object} configuration Effective settings. @returns {Promise<Object>} Durable row outcome. */
  execute: async function (action, request, configuration) {
    const context = this.authorize(
      request,
      configuration,
      action.capability,
      true,
    );
    const target = this.target(configuration);
    const command = this.checked(action);
    const kind = this.kind(action.capability);
    if (
      JSON.stringify(target) !==
      JSON.stringify(action.audit.plan.executionTarget)
    )
      this.fail();
    return SERVICE.DefaultCopilotActionExecutionService.execute(
      action,
      request,
      context,
      request,
      async (row, key) => {
        const current = CONFIG.get("copilot");
        this.authorize(request, current, action.capability, true);
        if (JSON.stringify(this.target(current)) !== JSON.stringify(target))
          this.fail();
        const invocation = {
          ...target,
          tenant: request.tenant,
          local: false,
          maxAttempts: 1,
          timeoutMs: 10000,
          apiName:
            "/tasks/" + encodeURIComponent(command.taskCode) + "/" + kind,
          methodName: "POST",
          requestBody: command.body,
          idempotencyKey: key,
          header: {
            ...SERVICE.DefaultCopilotOrchestrationService.employeeExecutionHeaders(
              request,
            ),
            "Idempotency-Key": key,
          },
        };
        SERVICE.DefaultLoggerService.inheritRequestPrivacy(invocation, request);
        const response =
          await SERVICE.DefaultModuleService.invokeModule(invocation);
        const protocol = SERVICE.DefaultModelCommandReceiptService;
        const data = protocol.result({ ...response, result: response?.data });
        const task = kind === "complete" ? data.task : data;
        if (
          task?.code !== row.record.code ||
          (kind === "claim" &&
            (task.status !== "CLAIMED" || task.assignee !== context.actor)) ||
          (kind === "assign" &&
            (!["OPEN", "CLAIMED", "ESCALATED"].includes(task.status) ||
              task.assignee !== command.body.assignee)) ||
          (kind === "complete" &&
            (task.status !== "COMPLETED" ||
              task.completedBy !== context.actor ||
              protocol.digest(task.decision) !==
                protocol.digest(command.body.decision))) ||
          (kind === "cancel" &&
            (task.status !== "CANCELLED" ||
              task.cancelledBy !== context.actor ||
              task.cancellationReason !== command.body.reason))
        )
          this.fail();
        return {
          code: "SUC_COPILOT_DOMAIN",
          result: { code: row.record.code },
        };
      },
      SERVICE.DefaultCopilotPolicyService,
    );
  },
};
