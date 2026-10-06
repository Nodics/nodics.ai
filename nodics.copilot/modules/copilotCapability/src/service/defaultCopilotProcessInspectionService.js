/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";

/**
 * @module copilotCapability/service/DefaultCopilotProcessInspectionService
 * @description Reads explicitly admitted workflow metadata through native employee APIs, without claiming tasks, starting processes or disclosing execution context.
 * @layer service @owner copilotCapability
 * @override Later layers may narrow admission and projections. Preserve original credentials, fixed GET contracts, bounded identity checks and provider exclusion.
 */
module.exports = {
  /** Returns fixed workflow read contracts and scalar result fields. No request may choose transport or field names. @returns {Object[]} Native read contracts. */
  operations: function () {
    const definitionFields = [
      "code",
      "name",
      "status",
      "currentVersion",
      "draftRevision",
      "version",
      "definitionCode",
      "publishedAt",
    ];
    const instanceFields = [
      "code",
      "definitionCode",
      "version",
      "status",
      "currentNode",
      "incidentCode",
      "failureCode",
      "compensationStatus",
      "startedAt",
      "completedAt",
    ];
    const taskFields = [
      "code",
      "name",
      "instanceCode",
      "nodeCode",
      "status",
      "dueAt",
    ];
    const incidentFields = [
      "code",
      "instanceCode",
      "definitionCode",
      "nodeCode",
      "status",
      "errorCode",
      "attempt",
      "maximumAttempts",
      "nextRetryAt",
    ];
    const triggerFields = [
      "code",
      "name",
      "definitionCode",
      "version",
      "triggerType",
      "status",
      "active",
      "ownerModule",
      "lastExecutedAt",
    ];
    return [
      {
        code: "process.definition.list",
        permission: "process.definition.read",
        codes: "definitionCodes",
        path: "/definitions",
        requiresCode: false,
        reference: "code",
        multiple: true,
        fields: definitionFields,
      },
      {
        code: "process.definition.inspect",
        permission: "process.definition.read",
        codes: "definitionCodes",
        path: "/definitions/",
        suffix: "",
        reference: "code",
        fields: definitionFields,
      },
      {
        code: "process.definition.versions",
        permission: "process.definition.read",
        codes: "definitionCodes",
        path: "/definitions/",
        suffix: "/versions",
        reference: "definitionCode",
        multiple: true,
        fields: definitionFields,
      },
      {
        code: "process.instance.list",
        permission: "process.backoffice.view",
        codes: "instanceCodes",
        path: "/instances",
        requiresCode: false,
        reference: "code",
        multiple: true,
        fields: instanceFields,
      },
      {
        code: "process.instance.inspect",
        permission: "process.backoffice.view",
        codes: "instanceCodes",
        path: "/instances/",
        suffix: "",
        reference: "code",
        fields: instanceFields,
      },
      {
        code: "process.instance.detail",
        permission: "process.backoffice.view",
        codes: "instanceCodes",
        path: "/instances/",
        suffix: "/detail",
        reference: "code",
        detail: true,
        fields: instanceFields,
        taskFields,
        activityFields: [
          "instanceCode",
          "definitionCode",
          "eventType",
          "outcome",
          "createdAt",
        ],
      },
      {
        code: "process.instance.tasks",
        permission: "process.backoffice.view",
        codes: "instanceCodes",
        path: "/tasks?limit=25&instanceCode=",
        suffix: "",
        reference: "instanceCode",
        multiple: true,
        fields: taskFields,
      },
      {
        code: "process.instance.activity",
        permission: "process.backoffice.view",
        codes: "instanceCodes",
        path: "/audit-events?limit=25&instanceCode=",
        suffix: "",
        reference: "instanceCode",
        multiple: true,
        fields: [
          "instanceCode",
          "definitionCode",
          "eventType",
          "outcome",
          "createdAt",
        ],
      },
      {
        code: "process.instance.incidents",
        permission: "process.incident.read",
        codes: "instanceCodes",
        path: "/incidents?limit=25&instanceCode=",
        suffix: "",
        reference: "instanceCode",
        multiple: true,
        fields: incidentFields,
      },
      {
        code: "process.trigger.list",
        permission: "process.trigger.read",
        codes: "triggerCodes",
        path: "/triggers",
        requiresCode: false,
        reference: "code",
        multiple: true,
        envelope: "SUC_PROCESS_00010",
        fields: triggerFields,
      },
      {
        code: "process.task.inspect",
        permission: "process.backoffice.view",
        codes: "taskCodes",
        path: "/tasks/",
        suffix: "",
        reference: "code",
        fields: taskFields,
      },
      {
        code: "process.incident.inspect",
        permission: "process.incident.read",
        codes: "incidentCodes",
        path: "/incidents/",
        suffix: "",
        reference: "code",
        fields: incidentFields,
      },
    ];
  },
  /** Validates exact typed input; recognized invalid commands must never reach a model. @param {string} message Human message. @returns {Object|null} Valid command or unrelated input. */
  parse: function (message) {
    if (typeof message !== "string" || !message.trim().startsWith("{"))
      return null;
    let command;
    try {
      command = JSON.parse(message);
    } catch (_) {
      return null;
    }
    if (command?.intent !== ENUMS.copilotProcessIntent.INSPECT.value)
      return null;
    const operation = this.operations().find(
      (candidate) => candidate.code === command.operation,
    );
    const expected =
      operation?.requiresCode === false
        ? "intent,operation"
        : "code,intent,operation";
    if (
      message.length > 1024 ||
      Object.keys(command).sort().join() !== expected ||
      !operation ||
      (operation.requiresCode !== false && !this.validCode(command.code))
    )
      throw new CLASSES.NodicsError("ERR_CPT_00005");
    return command;
  },
  /** Validates a bounded native identity without accepting wildcard or path syntax. @param {*} code Candidate identity. @returns {boolean} Whether safe. */
  validCode: function (code) {
    return (
      typeof code === "string" &&
      /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(code)
    );
  },
  /** Resolves one exact deployment/enterprise binding; empty selections stay empty. @param {Object} context Trusted context. @param {Object} configuration Effective settings. @returns {Object|null} Admitted settings and scope. */
  admission: function (context, configuration) {
    const settings = configuration.capability?.processInspection;
    if (
      !settings ||
      settings.enabled !== true ||
      context.channel !== "EMPLOYEE" ||
      !context.actor ||
      !context.tenant ||
      !context.enterprise ||
      !context.environment ||
      !SERVICE.DefaultCopilotPolicyService.hasPermission(
        context,
        "copilot.data.query",
      ) ||
      !/^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(settings.connectionName || "") ||
      !/^[A-Z][A-Z0-9_]{0,63}$/.test(
        settings.targetAuthority?.runtimeRole || "",
      ) ||
      Object.keys(settings.targetAuthority).some(
        (key) => key !== "runtimeRole",
      ) ||
      !Number.isInteger(settings.maximumRows) ||
      settings.maximumRows < 1 ||
      settings.maximumRows > 25 ||
      !Array.isArray(settings.scopes) ||
      settings.scopes.length > 1000
    )
      return null;
    const matches = settings.scopes.filter(
      (scope) =>
        scope &&
        scope.tenant === context.tenant &&
        scope.enterprise === context.enterprise &&
        scope.environment === context.environment,
    );
    if (matches.length !== 1) return null;
    const scope = matches[0];
    for (const key of [
      "definitionCodes",
      "instanceCodes",
      "taskCodes",
      "incidentCodes",
      "triggerCodes",
    ]) {
      if (
        !Array.isArray(scope[key]) ||
        scope[key].length > 100 ||
        new Set(scope[key]).size !== scope[key].length ||
        scope[key].some((code) => !this.validCode(code))
      )
        return null;
    }
    return { settings, scope };
  },
  /** Projects current permission-filtered choices, not routing or execution authority. @param {Object} context Trusted context. @param {Object} configuration Effective configuration. @returns {Object} Inert composer data. */
  catalogue: function (context, configuration) {
    const admitted = this.admission(context, configuration);
    const operations = admitted
      ? this.operations()
          .filter((operation) =>
            SERVICE.DefaultCopilotPolicyService.hasPermission(
              context,
              operation.permission,
            ),
          )
          .map((operation) => ({
            code: operation.code,
            label: admitted.settings.presentation?.operations?.[operation.code],
            codes: admitted.scope[operation.codes].slice(),
            requiresCode: operation.requiresCode !== false,
          }))
          .filter(
            (operation) =>
              operation.codes.length &&
              typeof operation.label === "string" &&
              operation.label.trim() &&
              operation.label.length <= 100,
          )
      : [];
    const presentation = {};
    for (const key of [
      "title",
      "operation",
      "code",
      "submit",
      "cancel",
      "failure",
    ]) {
      const value = admitted?.settings.presentation?.[key];
      if (typeof value === "string" && value.trim() && value.length <= 200)
        presentation[key] = value;
    }
    return { operations, presentation };
  },
  /** Binds the original human identity and native target for the post-read recheck. @param {Object} command Validated command. @param {Object} request Original request. @param {Object} configuration Effective settings. @returns {Object} Immutable binding snapshot. */
  authorize: function (command, request, configuration) {
    const core = SERVICE.DefaultCopilotOrchestrationService;
    const context = core.securityContext(request, configuration);
    const admitted = this.admission(context, configuration);
    const operation = this.operations().find(
      (candidate) => candidate.code === command.operation,
    );
    if (
      !admitted ||
      !operation ||
      (operation.requiresCode === false
        ? admitted.scope[operation.codes].length === 0
        : !admitted.scope[operation.codes].includes(command.code)) ||
      !SERVICE.DefaultCopilotPolicyService.hasPermission(
        context,
        operation.permission,
      )
    )
      throw new CLASSES.NodicsError("ERR_CPT_00006");
    return structuredClone({
      actor: context.actor,
      tenant: context.tenant,
      enterprise: context.enterprise,
      environment: context.environment,
      connectionName: admitted.settings.connectionName,
      targetAuthority: admitted.settings.targetAuthority,
      maximumRows: admitted.settings.maximumRows,
      allowedCodes: admitted.scope[operation.codes].slice(),
      operation,
      header: core.employeeExecutionHeaders(request),
    });
  },
  /** Rejects negative acknowledgements, malformed native envelopes and every foreign row before bounded scalar projection. @param {Object} response Native response. @param {Object} command Requested identity. @param {Object} binding Admitted contract. @returns {Object} Minimized evidence. */
  project: function (response, command, binding) {
    const healthy = (value) =>
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      !value.error &&
      value.success !== false &&
      value.acknowledged !== false &&
      (value.errors === undefined ||
        (Array.isArray(value.errors) && value.errors.length === 0));
    if (!healthy(response)) throw new CLASSES.NodicsError("ERR_CPT_00007");
    const expectedEnvelope = binding.operation.envelope || "SUC_PROCESS_00000";
    const envelope =
      response.code === expectedEnvelope
        ? response
        : /^SUC_/.test(response.code || "")
          ? response.data
          : null;
    if (!healthy(envelope) || envelope.code !== expectedEnvelope)
      throw new CLASSES.NodicsError("ERR_CPT_00007");
    if (binding.operation.detail === true)
      return this.projectDetail(envelope.data, command, binding);
    const rows = binding.operation.multiple ? envelope.data : [envelope.data];
    if (!Array.isArray(rows) || rows.length > 200)
      throw new CLASSES.NodicsError("ERR_CPT_00007");
    const records = [];
    let eligibleCount = 0;
    for (const row of rows) {
      if (
        binding.operation.requiresCode === false &&
        !binding.allowedCodes.includes(row?.[binding.operation.reference])
      )
        continue;
      eligibleCount++;
      if (
        !row ||
        typeof row !== "object" ||
        Array.isArray(row) ||
        (binding.operation.requiresCode === false
          ? !binding.allowedCodes.includes(row[binding.operation.reference])
          : row[binding.operation.reference] !== command.code)
      )
        throw new CLASSES.NodicsError("ERR_CPT_00007");
      const record = {};
      for (const field of binding.operation.fields) {
        const value = row[field];
        if (
          value === undefined ||
          (field === "name" &&
            value &&
            typeof value === "object" &&
            !Array.isArray(value))
        )
          continue;
        if (
          value !== null &&
          !(typeof value === "string" && value.length <= 512) &&
          !(typeof value === "number" && Number.isFinite(value)) &&
          typeof value !== "boolean"
        )
          throw new CLASSES.NodicsError("ERR_CPT_00007");
        record[field] = value;
      }
      if (records.length < binding.maximumRows) records.push(record);
    }
    const result = {
      operation: command.operation,
      ...(command.code === undefined ? {} : { code: command.code }),
      observedAt: new Date().toISOString(),
      records,
      omittedForDisplay: eligibleCount - records.length,
      coverage: binding.operation.multiple
        ? "BOUNDED_NATIVE_RESPONSE"
        : "CURRENT_SUMMARY",
    };
    while (Buffer.byteLength(JSON.stringify(result)) > 24000) {
      if (!result.records.length)
        throw new CLASSES.NodicsError("ERR_CPT_00007");
      result.records.pop();
      result.omittedForDisplay++;
    }
    return result;
  },
  /** Projects the fixed instance-detail aggregate while excluding decisions, contexts and actor metadata. @param {Object} value Native detail. @param {Object} command Bound command. @param {Object} binding Current admission. @returns {Object} Minimized aggregate. */
  projectDetail: function (value, command, binding) {
    const scalar = (value) =>
      value === null ||
      (typeof value === "string" && value.length <= 512) ||
      (typeof value === "number" && Number.isFinite(value)) ||
      typeof value === "boolean";
    const pick = (row, fields, reference, code) => {
      if (
        !row ||
        typeof row !== "object" ||
        Array.isArray(row) ||
        row[reference] !== code
      )
        throw new CLASSES.NodicsError("ERR_CPT_00007");
      return Object.fromEntries(
        fields
          .filter((field) => row[field] !== undefined)
          .map((field) => {
            if (!scalar(row[field]))
              throw new CLASSES.NodicsError("ERR_CPT_00007");
            return [field, row[field]];
          }),
      );
    };
    if (
      !value ||
      typeof value !== "object" ||
      Array.isArray(value) ||
      !Array.isArray(value.tasks) ||
      !Array.isArray(value.auditEvents) ||
      value.tasks.length > 200 ||
      value.auditEvents.length > 200
    )
      throw new CLASSES.NodicsError("ERR_CPT_00007");
    const result = {
      operation: command.operation,
      code: command.code,
      observedAt: new Date().toISOString(),
      instance: pick(
        value.instance,
        binding.operation.fields,
        "code",
        command.code,
      ),
      tasks: value.tasks
        .map((row) =>
          pick(row, binding.operation.taskFields, "instanceCode", command.code),
        )
        .slice(0, binding.maximumRows),
      auditEvents: value.auditEvents
        .map((row) =>
          pick(
            row,
            binding.operation.activityFields,
            "instanceCode",
            command.code,
          ),
        )
        .slice(0, binding.maximumRows),
      omittedForDisplay: {
        tasks: Math.max(0, value.tasks.length - binding.maximumRows),
        auditEvents: Math.max(
          0,
          value.auditEvents.length - binding.maximumRows,
        ),
      },
      coverage: "CURRENT_DETAIL",
    };
    if (Buffer.byteLength(JSON.stringify(result)) > 24000)
      throw new CLASSES.NodicsError("ERR_CPT_00007");
    return result;
  },
  /** Performs one employee-authorized GET, rechecks current admission, and returns deterministic metadata with no model or workflow mutation. @param {Object} command Typed command. @param {Object} request Original request. @param {Object} configuration Effective settings. @returns {Promise<Object>} Inert conversation answer. */
  execute: async function (command, request, configuration) {
    const validated = this.parse(JSON.stringify(command));
    if (!validated) throw new CLASSES.NodicsError("ERR_CPT_00005");
    const binding = this.authorize(validated, request, configuration);
    let response;
    try {
      response = await SERVICE.DefaultModuleService.invokeModule({
        moduleName: "workflow",
        connectionName: binding.connectionName,
        targetAuthority: binding.targetAuthority,
        tenant: binding.tenant,
        local: false,
        methodName: "GET",
        apiVersion: "v0",
        maxAttempts: 1,
        apiName:
          binding.operation.requiresCode === false
            ? binding.operation.path
            : binding.operation.path +
              encodeURIComponent(validated.code) +
              binding.operation.suffix,
        header: binding.header,
      });
    } catch (_) {
      throw new CLASSES.NodicsError("ERR_CPT_00007");
    }
    const current = this.authorize(
      validated,
      request,
      SERVICE.DefaultCopilotOrchestrationService.configuration(),
    );
    if (JSON.stringify(binding) !== JSON.stringify(current))
      throw new CLASSES.NodicsError("ERR_CPT_00008");
    const result = this.project(response, validated, binding);
    const recordCount = result.records
      ? result.records.length
      : 1 + result.tasks.length + result.auditEvents.length;
    return {
      content:
        "Process inspection: " +
        recordCount +
        " metadata records shown. Lists are bounded, not total counts. No task decision or process execution was performed.\n\n" +
        JSON.stringify(result, null, 2)
          .split("\n")
          .map((line) => "    " + line)
          .join("\n"),
    };
  },
};
