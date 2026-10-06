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
 * @module copilotWorkbench/service/DefaultCopilotProcessLifecycleActionService
 * @description Prepares six definition and four runtime-instance commands for full-field review, then dispatches only fixed Workflow routes under original employee authority and durable native receipts.
 * @layer service
 * @owner copilotWorkbench
 * @override Preserve bounded inputs, explicit identifiers, independent native grants, immutable review, pinned routing, one dispatch attempt, and original-result inspection.
 */
module.exports = {
  /** Rejects invalid or unsupported input without echoing content. @returns {never} Throws. */
  fail: function () {
    throw new CLASSES.NodicsError("ERR_CPW_00004");
  },

  /** Resolves a supported operation into its owner family and native permission. @param {string} operation Capability identity. @returns {Object} Fixed declaration. */
  declaration: function (operation) {
    const definitions = {
      create: "process.definition.create",
      update: "process.definition.update",
      prepare: "process.definition.update",
      validate: "process.definition.validate",
      publish: "process.definition.publish",
      delete: "process.definition.delete",
    };
    const instances = {
      start: "process.instance.start",
      cancel: "process.instance.cancel",
      retry: "process.instance.retry",
      compensate: "process.instance.compensate",
    };
    const match = /^(process\.(definition|instance))\.([a-z]+)$/.exec(
      operation || "",
    );
    const permissions = match?.[2] === "definition" ? definitions : instances;
    if (!match || !Object.hasOwn(permissions, match[3])) this.fail();
    return {
      family: match[2],
      kind: match[3],
      permission: permissions[match[3]],
    };
  },

  /** Recognizes typed JSON and exact lifecycle short forms without inventing graph, context, reason, attempt, or payload. @param {string} message Human input. @returns {Object|null} Candidate command. */
  parseIntent: function (message) {
    if (typeof message !== "string" || message.length > 16384) return null;
    try {
      const body = JSON.parse(
        message.trim().replace(/^```json\s*([\s\S]*?)\s*```$/i, "$1"),
      );
      if (
        typeof body?.operation === "string" &&
        /^process\.(definition|instance)\./.test(body.operation)
      )
        return body;
    } catch {
      /* Exact short forms below intentionally omit material fields for clarification. */
    }
    const match =
      /^(create|update|prepare|validate|publish|delete|start|cancel|retry|compensate)\s+(?:process\s+)?(definition|instance)(?:\s+([A-Za-z0-9][A-Za-z0-9._:-]{0,127}))?\s*$/i.exec(
        message.trim(),
      );
    if (!match) return null;
    const family = match[2].toLowerCase();
    const operation = "process." + family + "." + match[1].toLowerCase();
    try {
      this.declaration(operation);
    } catch {
      return { operation, invalidInput: true };
    }
    return {
      operation,
      ...(match[3] ? { [family + "Code"]: match[3] } : {}),
    };
  },

  /** Resolves explicit deployment routing. @param {Object} configuration Effective settings. @param {boolean} inspection Receipt inspection only. @returns {Object} Pinned owner target. */
  target: function (configuration, inspection = false) {
    const target = configuration.workbench?.processLifecycleTarget;
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

  /** Requires original employee scope plus independent Copilot and native grants. @param {Object} request Trusted context. @param {Object} configuration Effective settings. @param {string} operation Fixed capability. @param {boolean} execute Execution phase. @returns {Object} Security context. */
  authorize: function (request, configuration, operation, execute = false) {
    const declaration = this.declaration(operation);
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
        declaration.permission,
        ...(execute ? ["copilot.mutation.execute"] : []),
      ].some(
        (grant) =>
          !SERVICE.DefaultCopilotPolicyService.hasPermission(context, grant),
      )
    ) {
      throw new CLASSES.NodicsError("ERR_CPW_00002");
    }
    core.employeeExecutionHeaders(request);
    return context;
  },

  /** Flattens every bounded JSON leaf into review fields and rejects executable or credential-shaped content. @param {*} value JSON value. @param {string} path Review label. @param {Object[]} fields Accumulator. @param {number} depth Current depth. @returns {Object[]} Complete review fields. */
  reviewValue: function (value, path, fields = [], depth = 0) {
    if (depth > 8 || fields.length >= 240 || path.length > 180) this.fail();
    if (value && typeof value === "object") {
      const entries = Object.entries(value);
      if (
        entries.length > 80 ||
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
          (value.length > 2000 || /[\u0000-\u001f]/.test(value)))
      )
        this.fail();
      fields.push({ label: path, value: String(value) });
    }
    return fields;
  },

  /** Validates exact command fields and returns a native body or bounded clarification. @param {Object} input Employee command. @returns {Object} Native command. */
  input: function (input) {
    const declaration = this.declaration(input?.operation);
    const codeField = declaration.family + "Code";
    const extras =
      declaration.family === "definition"
        ? {
            create: ["name", "graph", "designer", "policy", "active"],
            update: ["name", "graph", "designer", "policy", "active"],
            prepare: [],
            validate: [],
            publish: [],
            delete: [],
          }[declaration.kind]
        : {
            start: ["definitionCode", "version", "name", "context"],
            cancel: ["reason"],
            retry: ["expectedAttempt", "payload"],
            compensate: ["payload"],
          }[declaration.kind];
    if (
      Object.keys(input || {}).some(
        (key) => !["operation", codeField, ...extras].includes(key),
      )
    )
      this.fail();
    const required = [
      codeField,
      ...(declaration.family === "definition" && declaration.kind === "create"
        ? ["name", "graph"]
        : []),
      ...(declaration.family === "instance" && declaration.kind === "start"
        ? ["definitionCode", "context"]
        : []),
      ...(declaration.family === "instance" && declaration.kind === "cancel"
        ? ["reason"]
        : []),
      ...(declaration.family === "instance" && declaration.kind === "retry"
        ? ["expectedAttempt"]
        : []),
    ];
    const missing = required.filter(
      (key) => input?.[key] === undefined || input[key] === "",
    );
    for (const field of [codeField, "definitionCode"])
      if (
        input?.[field] !== undefined &&
        input[field] !== "" &&
        (typeof input[field] !== "string" ||
          !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(input[field]))
      )
        this.fail();
    if (
      input?.name !== undefined &&
      (typeof input.name !== "string" ||
        !input.name.trim() ||
        input.name.length > 200)
    )
      this.fail();
    if (input?.active !== undefined && typeof input.active !== "boolean")
      this.fail();
    if (
      input?.version !== undefined &&
      (!Number.isSafeInteger(input.version) || input.version < 1)
    )
      this.fail();
    if (
      input?.expectedAttempt !== undefined &&
      (!Number.isSafeInteger(input.expectedAttempt) ||
        input.expectedAttempt < 0)
    )
      this.fail();
    if (
      input?.reason !== undefined &&
      (typeof input.reason !== "string" ||
        !input.reason.trim() ||
        input.reason.length > 1000 ||
        /[\u0000-\u001f]/.test(input.reason))
    )
      this.fail();
    for (const field of ["graph", "designer", "policy", "context", "payload"])
      if (
        input?.[field] !== undefined &&
        (!input[field] ||
          typeof input[field] !== "object" ||
          Array.isArray(input[field]))
      )
        this.fail();
    const body = Object.fromEntries(
      extras
        .filter((key) => Object.hasOwn(input, key))
        .map((key) => [key, structuredClone(input[key])]),
    );
    if (declaration.family === "definition" && declaration.kind === "create")
      body.code = input.definitionCode;
    if (declaration.family === "instance" && declaration.kind === "start")
      body.instanceCode = input.instanceCode;
    if (declaration.kind === "update" && !Object.keys(body).length)
      missing.push("at least one draft field to update");
    if (missing.length) return { state: "CLARIFICATION_REQUIRED", missing };
    this.reviewValue(body, "Command");
    if (Buffer.byteLength(JSON.stringify(body)) > 65536) this.fail();
    return { ...declaration, code: input[codeField], body };
  },

  /** Persists an immutable complete-field review without reading or mutating Process state. @param {Object} request Employee command. @param {Object} configuration Effective settings. @returns {Promise<Object>} Confirmation or clarification. */
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
      {
        label: command.family === "definition" ? "Definition" : "Instance",
        value: command.code,
      },
      { label: "Executing employee", value: context.actor },
      ...this.reviewValue(command.body, "Command"),
    ];
    const review = [];
    for (let offset = 0; offset < fields.length; offset += 20)
      review.push({
        title:
          "Process " +
          command.family +
          " " +
          command.kind +
          (offset ? " " + (offset / 20 + 1) : ""),
        fields: fields.slice(offset, offset + 20),
      });
    const plan = {
      id: "process-lifecycle-plan-" + crypto.randomUUID(),
      state: "VALIDATED",
      schema:
        "process" + command.family[0].toUpperCase() + command.family.slice(1),
      records: [{ code: command.code, command: command.body }],
      relatedRecords: {},
      executionTarget: target,
      preview: {
        summary:
          "Review every field before approval. Workflow rechecks current lifecycle, policy and permission at execution. Downstream actions can have effects beyond Process; uncertain outcomes require original-receipt inspection and are never replayed automatically. Nothing has changed yet.",
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

  /** Revalidates the immutable plan for execution and recovery. @param {Object} action Owned action. @returns {Object} Native command. */
  checked: function (action) {
    const declaration = this.declaration(action.capability);
    const plan = action.audit?.plan;
    const row = plan?.records?.[0];
    const expectedSchema =
      "process" +
      declaration.family[0].toUpperCase() +
      declaration.family.slice(1);
    if (
      plan?.schema !== expectedSchema ||
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
    if (declaration.family === "definition" && declaration.kind === "create")
      delete fields.code;
    const input = this.input({
      ...fields,
      operation: action.capability,
      [declaration.family + "Code"]: row.code,
    });
    if (
      input.state ||
      SERVICE.DefaultModelCommandReceiptService.digest(input.body) !==
        SERVICE.DefaultModelCommandReceiptService.digest(row.command)
    )
      this.fail();
    return input;
  },

  /** Dispatches one fixed owner route after durable approval and claim, forwarding original credentials and key. @param {Object} action Owned action. @param {Object} request Confirmation request. @param {Object} configuration Effective settings. @returns {Promise<Object>} Durable row result. */
  execute: async function (action, request, configuration) {
    const context = this.authorize(
      request,
      configuration,
      action.capability,
      true,
    );
    const target = this.target(configuration);
    const command = this.checked(action);
    const timeoutMs = configuration.workbench?.processLifecycleTimeoutMs;
    if (
      !Number.isSafeInteger(timeoutMs) ||
      timeoutMs < 1000 ||
      timeoutMs > 120000 ||
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
        const root =
          command.family === "definition" ? "/definitions/" : "/instances/";
        let apiName, methodName;
        if (command.family === "definition" && command.kind === "create") {
          apiName = "/definitions";
          methodName = "POST";
        } else if (command.family === "definition") {
          apiName =
            root +
            encodeURIComponent(command.code) +
            (command.kind === "delete"
              ? ""
              : "/draft" +
                (command.kind === "update" ? "" : "/" + command.kind));
          methodName =
            command.kind === "update"
              ? "PATCH"
              : command.kind === "delete"
                ? "DELETE"
                : "POST";
        } else if (command.kind === "start") {
          apiName = "/instances";
          methodName = "POST";
        } else {
          apiName =
            root + encodeURIComponent(command.code) + "/" + command.kind;
          methodName = "POST";
        }
        const invocation = {
          ...target,
          tenant: request.tenant,
          local: false,
          maxAttempts: 1,
          timeoutMs,
          apiName,
          methodName,
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
        if (command.family === "definition") {
          const code =
            data.code ||
            (command.kind === "validate" ? command.code : undefined);
          if (
            code !== command.code ||
            (command.kind === "create" && data.status !== "DRAFT") ||
            (command.kind === "prepare" && data.status !== "DRAFT") ||
            (command.kind === "validate" && data.valid !== true) ||
            (command.kind === "publish" &&
              (!Number.isSafeInteger(data.version) ||
                !/^[a-f0-9]{64}$/.test(data.checksum || ""))) ||
            (command.kind === "delete" &&
              !["DELETED_DRAFT", "DRAFT_DISCARDED", "ARCHIVED"].includes(
                data.status,
              ))
          )
            this.fail();
        } else if (command.kind === "start") {
          if (
            data.instance?.code !== command.code ||
            data.instance.startCompleted !== true ||
            !["RUNNING", "WAITING", "COMPLETED"].includes(data.instance.status)
          )
            this.fail();
        } else if (command.kind === "cancel") {
          if (data.code !== command.code || data.status !== "CANCELLED")
            this.fail();
        } else if (command.kind === "retry") {
          if (
            data.instance?.code !== command.code ||
            data.incident?.status !== "RESOLVED"
          )
            this.fail();
        } else if (
          data.instanceCode !== command.code ||
          data.compensationStatus !== "COMPLETED"
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
