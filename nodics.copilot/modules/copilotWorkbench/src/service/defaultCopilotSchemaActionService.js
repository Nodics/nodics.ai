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

/**
 * @module copilotWorkbench/service/DefaultCopilotSchemaActionService
 * @description Prepares and executes explicitly selected, deployment-allowlisted, single-record generated schema mutations through the current native descriptor and employee authority.
 * @layer service
 * @owner copilotWorkbench
 * @override Preserve Knowledge source/group/collection selection, exact native descriptor authority, private owner receipts, full review, one dispatch attempt, and refusal of bulk or business-owned forms.
 */
module.exports = {
  /** Rejects invalid, stale, or unsupported schema actions without echoing submitted data. @returns {never} Throws. */
  fail: function () {
    throw new CLASSES.NodicsError("ERR_CPW_00004");
  },

  /** Resolves one fixed generic record operation. @param {string} operation Capability identity. @returns {Object} Fixed declaration. */
  declaration: function (operation) {
    const kind = /^data\.record\.(create|update|delete)$/.exec(
      operation || "",
    )?.[1];
    if (!kind) this.fail();
    return {
      kind,
      descriptorOperation: kind,
      method: { create: "PUT", update: "PATCH", delete: "DELETE" }[kind],
    };
  },

  /** Recognizes typed JSON only; free prose requires the bounded intent planner. @param {string} message Human message. @returns {Object|null} Explicit schema command. */
  parseIntent: function (message) {
    if (
      typeof message !== "string" ||
      message.length > 65536 ||
      !message.trim().startsWith("{")
    )
      return null;
    try {
      const value = JSON.parse(message);
      return /^data\.record\.(create|update|delete)$/.test(
        value?.operation || "",
      )
        ? value
        : null;
    } catch {
      return null;
    }
  },

  /** Requires original employee scope plus independent Copilot and native schema grants. @param {Object} request Trusted request. @param {Object} configuration Effective settings. @param {boolean} execute Execution phase. @returns {Object} Security context. */
  authorize: function (request, configuration, execute = false) {
    const core = SERVICE.DefaultCopilotOrchestrationService;
    const context = core.securityContext(request, configuration);
    const grants = [
      "copilot.data.query",
      "copilot.mutation.prepare",
      "system.schema.manage",
      ...(execute ? ["copilot.mutation.execute"] : []),
    ];
    if (
      context.channel !== "EMPLOYEE" ||
      !context.actor ||
      !context.enterprise ||
      !context.tenant ||
      context.tenant !== request.tenant ||
      grants.some(
        (grant) =>
          !SERVICE.DefaultCopilotPolicyService.hasPermission(context, grant),
      )
    )
      throw new CLASSES.NodicsError("ERR_CPW_00002");
    core.employeeExecutionHeaders(request);
    return context;
  },

  /** Checks deployment admission for one exact source and schema; wildcard mutation enablement is forbidden. @param {Object} configuration Effective settings. @param {string} sourceCode Registered source. @param {string} schemaName Selected schema. @returns {Object} Bounded action settings. */
  settings: function (configuration, sourceCode, schemaName) {
    const settings = configuration.workbench?.schemaActions;
    const schemas = settings?.sources?.[sourceCode];
    if (
      settings?.enabled !== true ||
      !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(sourceCode || "") ||
      !/^[A-Za-z][A-Za-z0-9_-]{0,127}$/.test(schemaName || "") ||
      !Array.isArray(schemas) ||
      !schemas.length ||
      schemas.includes("*") ||
      new Set(schemas).size !== schemas.length ||
      !schemas.includes(schemaName) ||
      !Number.isSafeInteger(settings.timeoutMs) ||
      settings.timeoutMs < 1000 ||
      settings.timeoutMs > 120000
    )
      this.fail();
    return { timeoutMs: settings.timeoutMs };
  },

  /** Resolves the current selected source and fresh generated descriptor through Knowledge, never a second registry. @param {Object} request Trusted request. @param {Object} configuration Effective settings. @param {Object} input Command input. @param {boolean} execute Execution phase. @returns {Promise<Object>} Current owner scope. */
  scope: async function (request, configuration, input, execute = false) {
    const context = this.authorize(request, configuration, execute);
    const settings = this.settings(
      configuration,
      input?.sourceCode,
      input?.schemaName,
    );
    const database = SERVICE.DefaultCopilotDatabaseSourceService;
    const trusted = {
      ...request,
      sourceCode: input.sourceCode,
      securityContext: context,
    };
    const source = database.authorize(trusted, configuration);
    if (
      source.code !== input.sourceCode ||
      !database.selected(source, input.schemaName)
    )
      this.fail();
    const descriptor = (await database.descriptors(trusted, source)).find(
      (row) => row.schemaName === input.schemaName,
    );
    const declaration = this.declaration(input.operation);
    const native = descriptor?.apiOperations?.[declaration.kind];
    const expectedPath = "/" + input.schemaName.toLowerCase();
    const primary =
      descriptor?.fields?.find((field) => field.primary) ||
      descriptor?.fields?.find(
        (field) => field.name === descriptor?.displayProperty,
      );
    if (
      !descriptor ||
      descriptor.moduleName !== source.module ||
      descriptor.mutationMode !== "GENERATED_CRUD" ||
      descriptor.authoring?.authoringAllowed !== true ||
      !descriptor.operations?.includes(declaration.descriptorOperation) ||
      (declaration.kind === "create" && descriptor.form?.createOperation) ||
      native?.active !== true ||
      native.method !== declaration.method ||
      native.path !== expectedPath ||
      !/^v\d+$/.test(native.apiVersion || "") ||
      primary?.name !== "code" ||
      primary.readOnly === true ||
      primary.hidden === true ||
      primary.sensitive === true
    )
      this.fail();
    return { settings, source, descriptor, native, declaration, trusted };
  },

  /** Validates one identity against the descriptor's explicit concurrency contract. @param {Object} identity Exact identity. @param {Object} descriptor Fresh descriptor. @returns {Object} Normalized identity. */
  identity: function (identity, descriptor) {
    const concurrency = descriptor.concurrency;
    const revision =
      concurrency?.mode === "COMPARE_AND_SET" && concurrency.required === true
        ? concurrency.field
        : null;
    const allowed = ["code", ...(revision ? [revision] : [])];
    if (
      !identity ||
      typeof identity !== "object" ||
      Array.isArray(identity) ||
      Object.keys(identity).sort().join() !== allowed.sort().join() ||
      typeof identity.code !== "string" ||
      !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,191}$/.test(identity.code)
    )
      this.fail();
    if (
      revision &&
      (!Number.isSafeInteger(identity[revision]) || identity[revision] < 0)
    )
      this.fail();
    return structuredClone(identity);
  },

  /** Validates editable scalar/nested JSON fields against current descriptor metadata. @param {Object} model Submitted model. @param {Object} descriptor Fresh descriptor. @param {boolean} create Create mode. @returns {Object} Normalized model. */
  model: function (model, descriptor, create) {
    if (
      !model ||
      typeof model !== "object" ||
      Array.isArray(model) ||
      !Object.keys(model).length ||
      Object.keys(model).length > 80
    )
      this.fail();
    const fields = new Map(
      descriptor.fields
        .filter(
          (field) =>
            field &&
            typeof field.name === "string" &&
            field.readOnly !== true &&
            field.hidden !== true &&
            field.sensitive !== true,
        )
        .map((field) => [field.name, field]),
    );
    if (
      Object.keys(model).some(
        (key) =>
          !fields.has(key) ||
          /password|secret|token|authorization|credential|privatekey|apikey|__proto__|constructor|prototype/i.test(
            key,
          ),
      ) ||
      (!create &&
        (Object.hasOwn(model, "code") ||
          (descriptor.concurrency?.field &&
            Object.hasOwn(model, descriptor.concurrency.field))))
    )
      this.fail();
    if (create) {
      const missing = [...fields.values()]
        .filter((field) => field.required === true)
        .map((field) => field.name)
        .filter((name) => model[name] === undefined || model[name] === "");
      if (missing.length) return { state: "CLARIFICATION_REQUIRED", missing };
      if (
        typeof model.code !== "string" ||
        !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,191}$/.test(model.code)
      )
        this.fail();
    }
    this.reviewValue(model, "Record");
    if (Buffer.byteLength(JSON.stringify(model)) > 65536) this.fail();
    return structuredClone(model);
  },

  /** Flattens every bounded value for complete review. @param {*} value JSON value. @param {string} path Label. @param {Object[]} fields Accumulator. @param {number} depth Depth. @returns {Object[]} Review fields. */
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
        if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(key)) this.fail();
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

  /** Builds the exact generated-controller body and receipt input. @param {Object} input Command. @param {Object} descriptor Current descriptor. @returns {Object} Native command or clarification. */
  command: function (input, descriptor) {
    const declaration = this.declaration(input?.operation);
    const allowed = [
      "operation",
      "sourceCode",
      "schemaName",
      ...(declaration.kind === "create"
        ? ["model"]
        : declaration.kind === "update"
          ? ["identity", "changes"]
          : ["identity"]),
    ];
    if (Object.keys(input || {}).some((key) => !allowed.includes(key)))
      this.fail();
    const missing = ["sourceCode", "schemaName"]
      .concat(
        declaration.kind === "create"
          ? ["model"]
          : declaration.kind === "update"
            ? ["identity", "changes"]
            : ["identity"],
      )
      .filter((key) => input?.[key] === undefined || input[key] === "");
    if (missing.length) return { state: "CLARIFICATION_REQUIRED", missing };
    if (declaration.kind === "create") {
      const model = this.model(input.model, descriptor, true);
      if (model.state) return model;
      return {
        declaration,
        code: model.code,
        body: model,
        receiptInput: model,
      };
    }
    const identity = this.identity(input.identity, descriptor);
    if (declaration.kind === "delete")
      return {
        declaration,
        code: identity.code,
        body: { query: identity, options: { returnModified: false } },
        receiptInput: { query: identity },
      };
    const changes = this.model(input.changes, descriptor, false);
    return {
      declaration,
      code: identity.code,
      body: {
        query: identity,
        model: changes,
        options: { returnModified: false },
      },
      receiptInput: { query: identity, model: changes },
    };
  },

  /** Persists one exact schema mutation review. @param {Object} request Employee command. @param {Object} configuration Effective settings. @returns {Promise<Object>} Confirmation or clarification. */
  prepare: async function (request, configuration) {
    const context = this.authorize(request, configuration);
    if (!request.body || typeof request.body !== "object") this.fail();
    const scope = await this.scope(request, configuration, request.body);
    const command = this.command(request.body, scope.descriptor);
    if (command.state) return { plan: command };
    const fields = [
      { label: "Operation", value: request.body.operation },
      { label: "Knowledge source", value: scope.source.code },
      { label: "Schema", value: scope.descriptor.label },
      { label: "Executing employee", value: context.actor },
      ...this.reviewValue(command.receiptInput, "Command"),
    ];
    const review = [];
    for (let offset = 0; offset < fields.length; offset += 20)
      review.push({
        title:
          scope.descriptor.label +
          " " +
          command.declaration.kind +
          (offset ? " " + (offset / 20 + 1) : ""),
        fields: fields.slice(offset, offset + 20),
      });
    const plan = {
      id: "schema-action-plan-" + crypto.randomUUID(),
      state: "VALIDATED",
      schema: "governedSchemaAction",
      records: [
        {
          code: command.code,
          sourceCode: scope.source.code,
          sourcePolicyDigest: scope.source.sourcePolicyDigest,
          moduleName: scope.source.module,
          schemaName: request.body.schemaName,
          operation: request.body.operation,
          body: command.body,
          receiptInput: command.receiptInput,
          native: scope.native,
        },
      ],
      relatedRecords: {},
      executionTarget: {
        sourceCode: scope.source.code,
        sourcePolicyDigest: scope.source.sourcePolicyDigest,
        moduleName: scope.source.module,
      },
      preview: {
        summary:
          "Review every field before approval. The current selected source, collection, employee permission, schema policy and private command receipt are rechecked at execution. Bulk changes and business-owned forms are not available through this action. Nothing has changed yet.",
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

  /** Revalidates an immutable schema action row. @param {Object} action Owned action. @returns {Object} Stored command. */
  checked: function (action) {
    this.declaration(action.capability);
    const plan = action.audit?.plan;
    const row = plan?.records?.[0];
    if (
      plan?.schema !== "governedSchemaAction" ||
      !Array.isArray(plan.records) ||
      plan.records.length !== 1 ||
      Object.keys(plan.relatedRecords || {}).length ||
      !row ||
      row.operation !== action.capability ||
      typeof row.code !== "string" ||
      typeof row.sourceCode !== "string" ||
      typeof row.sourcePolicyDigest !== "string" ||
      typeof row.moduleName !== "string" ||
      typeof row.schemaName !== "string" ||
      !row.body ||
      !row.receiptInput ||
      !row.native
    )
      this.fail();
    return structuredClone(row);
  },

  /** Reconstructs the current command and proves it equals the approved row. @param {Object} row Stored row. @param {Object} descriptor Fresh descriptor. @returns {Object} Checked native command. */
  recheck: function (row, descriptor) {
    const declaration = this.declaration(row.operation);
    const input = {
      operation: row.operation,
      sourceCode: row.sourceCode,
      schemaName: row.schemaName,
      ...(declaration.kind === "create"
        ? { model: row.body }
        : declaration.kind === "update"
          ? { identity: row.body.query, changes: row.body.model }
          : { identity: row.body.query }),
    };
    const current = this.command(input, descriptor);
    const digest = SERVICE.DefaultModelCommandReceiptService.digest.bind(
      SERVICE.DefaultModelCommandReceiptService,
    );
    if (
      current.state ||
      digest(current.body) !== digest(row.body) ||
      digest(current.receiptInput) !== digest(row.receiptInput)
    )
      this.fail();
    return current;
  },

  /** Dispatches one fixed generated route after durable approval and fresh source/descriptor checks. @param {Object} action Owned action. @param {Object} request Confirmation request. @param {Object} configuration Effective settings. @returns {Promise<Object>} Durable row result. */
  execute: async function (action, request, configuration) {
    const context = this.authorize(request, configuration, true);
    const row = this.checked(action);
    const scope = await this.scope(
      request,
      configuration,
      {
        operation: row.operation,
        sourceCode: row.sourceCode,
        schemaName: row.schemaName,
      },
      true,
    );
    const command = this.recheck(row, scope.descriptor);
    if (
      scope.source.sourcePolicyDigest !== row.sourcePolicyDigest ||
      scope.source.module !== row.moduleName ||
      JSON.stringify(scope.native) !== JSON.stringify(row.native) ||
      JSON.stringify(action.audit.plan.executionTarget) !==
        JSON.stringify({
          sourceCode: row.sourceCode,
          sourcePolicyDigest: row.sourcePolicyDigest,
          moduleName: row.moduleName,
        })
    )
      this.fail();
    return SERVICE.DefaultCopilotActionExecutionService.execute(
      action,
      request,
      context,
      request,
      async (actionRow, key) => {
        const current = CONFIG.get("copilot");
        const fresh = await this.scope(
          request,
          current,
          {
            operation: row.operation,
            sourceCode: row.sourceCode,
            schemaName: row.schemaName,
          },
          true,
        );
        this.recheck(row, fresh.descriptor);
        if (
          fresh.source.sourcePolicyDigest !== row.sourcePolicyDigest ||
          fresh.source.module !== row.moduleName ||
          JSON.stringify(fresh.native) !== JSON.stringify(row.native)
        )
          this.fail();
        const invocation = {
          moduleName: row.moduleName,
          tenant: request.tenant,
          local: false,
          maxAttempts: 1,
          timeoutMs: fresh.settings.timeoutMs,
          apiName: row.native.path,
          apiVersion: row.native.apiVersion,
          methodName: row.native.method,
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
        const data = SERVICE.DefaultModelCommandReceiptService.result({
          ...response,
          result: response?.data ?? response?.result,
        });
        if (
          (command.declaration.kind === "create" &&
            data.code !== command.code) ||
          (command.declaration.kind !== "create" &&
            SERVICE.DefaultSchemaCommandReceiptService.affected(data) !== 1)
        )
          this.fail();
        return {
          code: "SUC_COPILOT_DOMAIN",
          result: { code: actionRow.record.code },
        };
      },
      SERVICE.DefaultCopilotPolicyService,
    );
  },
};
