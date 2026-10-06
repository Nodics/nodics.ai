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
 * @module copilotWorkbench/service/DefaultCopilotProcessTriggerActionService
 * @description Prepares four fixed Workflow trigger commands with full-field review, original employee authority and the existing durable action executor. Trigger metadata never creates a Cron schedule.
 * @layer service @owner copilotWorkbench
 * @override Preserve fixed native routes, bounded inert inputs, explicit activation choices, exact target and original-result recovery. No arbitrary HTTP or scheduler authority.
 */
module.exports = {
  /** Rejects without echoing supplied content. @returns {never} Throws. */
  fail: function () {
    throw new CLASSES.NodicsError("ERR_CPW_00004");
  },
  /** Resolves one fixed trigger command. @param {string} operation Copilot identity. @returns {string} Native suffix. */
  kind: function (operation) {
    const kind =
      typeof operation === "string"
        ? operation.replace(/^process\.trigger\./, "")
        : "";
    if (
      operation !== "process.trigger." + kind ||
      !["create", "update", "archive", "execute"].includes(kind)
    )
      this.fail();
    return kind;
  },
  /** Recognizes typed trigger input and exact short forms; incomplete input clarifies. @param {string} message Human command. @returns {Object|null} Typed command or unrelated text. */
  parseIntent: function (message) {
    if (typeof message !== "string" || message.length > 16384) return null;
    try {
      const body = JSON.parse(
        message.trim().replace(/^```json\s*([\s\S]*?)\s*```$/i, "$1"),
      );
      if (
        typeof body?.operation === "string" &&
        body.operation.startsWith("process.trigger.")
      )
        return body;
    } catch {
      /* Short forms below do not infer activation or instance identity. */
    }
    const match =
      /^(create|update|archive|execute)\s+(?:process\s+)?trigger(?:\s+([A-Za-z0-9][A-Za-z0-9._:-]{0,127}))?\s*$/i.exec(
        message.trim(),
      );
    return match
      ? {
          operation: "process.trigger." + match[1].toLowerCase(),
          ...(match[2] ? { triggerCode: match[2] } : {}),
        }
      : null;
  },
  /** Resolves explicit deployment-owned Workflow routing. @param {Object} configuration Effective settings. @param {boolean} inspection Internal receipt inspection only. @returns {Object} Immutable owner target. */
  target: function (configuration, inspection = false) {
    const target = configuration.workbench?.processTriggerTarget;
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
  /** Preserves independent native trigger and Copilot permissions. @param {Object} request Trusted employee. @param {Object} configuration Effective settings. @param {string} operation Fixed identity. @param {boolean} execute Execution phase. @returns {Object} Security context. */
  authorize: function (request, configuration, operation, execute = false) {
    const kind = this.kind(operation);
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
        "process.trigger." + (kind === "execute" ? "execute" : "manage"),
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
  /** Bounds inert metadata and flattens every leaf for review, rejecting credential-like fields. @param {*} value JSON input. @param {string} path Review label. @param {Object[]} fields Accumulated review. @param {number} depth Current nesting. @returns {Object[]} Exact inert review fields. */
  reviewValue: function (value, path, fields = [], depth = 0) {
    if (depth > 5 || fields.length >= 100 || path.length > 128) this.fail();
    if (value && typeof value === "object") {
      const entries = Object.entries(value);
      if (
        entries.length > 40 ||
        (!Array.isArray(value) &&
          Object.getPrototypeOf(value) !== Object.prototype)
      )
        this.fail();
      if (!entries.length)
        fields.push({ label: path, value: Array.isArray(value) ? "[]" : "{}" });
      for (const [key, item] of entries) {
        if (
          !/^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(key) ||
          /password|secret|token|authorization|credential|privatekey|apikey|__proto__|constructor|prototype/i.test(
            key,
          )
        )
          this.fail();
        this.reviewValue(item, path + "." + key, fields, depth + 1);
      }
    } else {
      if (
        value !== null &&
        !["string", "number", "boolean"].includes(typeof value)
      )
        this.fail();
      if (
        (typeof value === "number" && !Number.isFinite(value)) ||
        (typeof value === "string" &&
          (value.length > 1000 || /[\u0000-\u001f]/.test(value)))
      )
        this.fail();
      fields.push({ label: path, value: String(value) });
    }
    return fields;
  },
  /** Validates exact command fields; activation and execution identity are never guessed. @param {Object} input Employee command. @returns {Object} Native input or clarification. */
  input: function (input) {
    const kind = this.kind(input?.operation);
    const metadata = [
      "name",
      "version",
      "triggerType",
      "cronJobCode",
      "status",
      "schedule",
      "active",
    ];
    const extras = {
      create: ["definitionCode", ...metadata],
      update: metadata,
      archive: [],
      execute: ["instanceCode", "context", "correlationId", "version"],
    }[kind];
    if (
      Object.keys(input).some(
        (key) => !["operation", "triggerCode", ...extras].includes(key),
      )
    )
      this.fail();
    const required = [
      "triggerCode",
      ...(kind === "create"
        ? ["definitionCode", "name", "triggerType", "status", "active"]
        : kind === "execute"
          ? ["instanceCode", "context"]
          : []),
    ];
    const missing = required.filter(
      (key) => input[key] === undefined || input[key] === "",
    );
    for (const field of [
      "triggerCode",
      "definitionCode",
      "cronJobCode",
      "instanceCode",
      "correlationId",
    ])
      if (
        input[field] !== undefined &&
        input[field] !== "" &&
        (typeof input[field] !== "string" ||
          !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(input[field]))
      )
        this.fail();
    if (
      (input.version !== undefined &&
        (!Number.isSafeInteger(input.version) || input.version < 1)) ||
      (input.active !== undefined && typeof input.active !== "boolean") ||
      (input.status !== undefined &&
        !["DRAFT", "ACTIVE", "PAUSED"].includes(input.status)) ||
      (input.triggerType !== undefined &&
        !["CRON", "EVENT", "MANUAL"].includes(input.triggerType)) ||
      (input.name !== undefined &&
        (typeof input.name !== "string" || !input.name.trim()))
    )
      this.fail();
    for (const key of ["schedule", "context"])
      if (
        input[key] !== undefined &&
        (!input[key] ||
          typeof input[key] !== "object" ||
          Array.isArray(input[key]))
      )
        this.fail();
    const body = Object.fromEntries(
      extras
        .filter((key) => Object.hasOwn(input, key))
        .map((key) => [key, structuredClone(input[key])]),
    );
    if (kind === "create")
      Object.assign(body, {
        code: input.triggerCode,
        ownerModule: "nodics.process",
      });
    if (kind === "update" && !Object.keys(body).length)
      missing.push("at least one trigger field to update");
    if (missing.length) return { state: "CLARIFICATION_REQUIRED", missing };
    this.reviewValue(body, "Command");
    if (JSON.stringify(body).length > 12000) this.fail();
    return { triggerCode: input.triggerCode, body };
  },
  /** Persists full-field review without reading or changing a trigger. @param {Object} request Employee command. @param {Object} configuration Effective configuration. @returns {Promise<Object>} Confirmation or clarification. */
  prepare: async function (request, configuration) {
    const context = this.authorize(
      request,
      configuration,
      request.body?.operation,
    );
    const target = this.target(configuration);
    const command = this.input(request.body);
    if (command.state) return { plan: command };
    const copy = configuration.workbench?.processTriggerPresentation;
    if (
      !copy ||
      ["title", "operation", "trigger", "actor", "command", "summary"].some(
        (key) =>
          typeof copy[key] !== "string" ||
          !copy[key].trim() ||
          copy[key].length > (key === "summary" ? 1000 : 100),
      )
    )
      this.fail();
    const fields = [
      { label: copy.operation, value: request.body.operation },
      { label: copy.trigger, value: command.triggerCode },
      { label: copy.actor, value: context.actor },
      ...this.reviewValue(command.body, copy.command),
    ];
    const review = [];
    for (let offset = 0; offset < fields.length; offset += 20)
      review.push({
        title:
          copy.title +
          " " +
          this.kind(request.body.operation) +
          (offset ? " " + (offset / 20 + 1) : ""),
        fields: fields.slice(offset, offset + 20),
      });
    const plan = {
      id: "process-trigger-plan-" + crypto.randomUUID(),
      state: "VALIDATED",
      schema: "processTrigger",
      records: [{ code: command.triggerCode, command: command.body }],
      relatedRecords: {},
      executionTarget: target,
      preview: {
        summary: copy.summary,
        review,
      },
    };
    return SERVICE.DefaultCopilotWorkbenchService.persistPrepared(
      plan,
      request.body.operation,
      request,
      context,
    );
  },
  /** Revalidates the immutable single-row plan for execution and receipt inspection. @param {Object} action Owned action. @returns {Object} Original native command. */
  checked: function (action) {
    const plan = action.audit?.plan,
      row = plan?.records?.[0];
    if (
      plan?.schema !== "processTrigger" ||
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
    const fields = structuredClone(row.command);
    if (this.kind(action.capability) === "create") {
      if (fields.code !== row.code || fields.ownerModule !== "nodics.process")
        this.fail();
      delete fields.code;
      delete fields.ownerModule;
    }
    const command = this.input({
      ...fields,
      operation: action.capability,
      triggerCode: row.code,
    });
    if (
      command.state ||
      SERVICE.DefaultModelCommandReceiptService.digest(command.body) !==
        SERVICE.DefaultModelCommandReceiptService.digest(row.command)
    )
      this.fail();
    return command;
  },
  /** Calls exactly one fixed native route after durable claim, forwarding original credentials and key. @param {Object} action Owned approved action. @param {Object} request Confirmation request. @param {Object} configuration Effective settings. @returns {Promise<Object>} Durable row outcome, never automatic retry. */
  execute: async function (action, request, configuration) {
    const context = this.authorize(
        request,
        configuration,
        action.capability,
        true,
      ),
      target = this.target(configuration),
      command = this.checked(action),
      kind = this.kind(action.capability);
    const timeoutMs = configuration.workbench?.processTriggerTimeoutMs;
    if (
      !Number.isSafeInteger(timeoutMs) ||
      timeoutMs < 1000 ||
      timeoutMs > 120000
    )
      this.fail();
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
          timeoutMs,
          apiName:
            kind === "create"
              ? "/triggers"
              : "/triggers/" +
                encodeURIComponent(command.triggerCode) +
                (kind === "update" ? "" : "/" + kind),
          methodName: kind === "update" ? "PATCH" : "POST",
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
        const trigger = kind === "execute" ? data.trigger : data;
        protocol.result({ code: response.code, result: trigger });
        if (kind === "execute") {
          protocol.result({ code: response.code, result: data.execution });
          protocol.result({
            code: response.code,
            result: data.execution.instance,
          });
        }
        if (
          response.code !==
            (kind === "execute" ? "SUC_PROCESS_00011" : "SUC_PROCESS_00010") ||
          trigger?.code !== row.record.code ||
          (kind === "archive" &&
            (trigger.status !== "ARCHIVED" || trigger.active !== false))
        )
          this.fail();
        if (
          ["create", "update"].includes(kind) &&
          Object.entries(command.body).some(
            ([field, value]) =>
              protocol.digest(trigger[field]) !== protocol.digest(value),
          )
        )
          this.fail();
        if (
          kind === "execute" &&
          (data.execution?.instance?.code !== command.body.instanceCode ||
            data.execution.instance.definitionCode !== trigger.definitionCode ||
            data.execution.instance.startCompleted !== true ||
            !["RUNNING", "WAITING", "COMPLETED"].includes(
              data.execution.instance.status,
            ))
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
