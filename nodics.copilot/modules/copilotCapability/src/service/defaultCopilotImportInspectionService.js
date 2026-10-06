/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";

/**
 * @module copilotCapability/service/DefaultCopilotImportInspectionService
 * @description Reads and validates explicitly admitted nImport release plans under original employee authority without installing releases or importing media.
 * @layer service
 * @owner copilotCapability
 * @override Later layers may narrow scopes and projections. Preserve fixed owner routes, native grants, one transport attempt, post-read authorization and mutation exclusion.
 */
module.exports = {
  /** Returns fixed nImport catalogue, history and validation contracts. @returns {Object[]} Native contracts. */
  operations: function () {
    const releaseFields = [
      "releaseCode",
      "displayName",
      "moduleName",
      "dataType",
      "version",
      "installedVersion",
      "status",
      "nextAction",
      "blocked",
      "lifecycle",
      "publicationPolicy",
    ];
    return [
      ...["init", "core", "sample"].flatMap((dataType) => [
        {
          code: "import.release." + dataType + ".catalogue",
          permission: "import.release.view",
          scope: dataType + "ReleaseCodes",
          method: "GET",
          path: "/" + dataType,
          requiresCode: false,
          kind: "CATALOGUE",
          reference: "releaseCode",
          fields: releaseFields,
        },
        {
          code: "import.release." + dataType + ".validate",
          permission: "import.release.validate",
          scope: dataType + "ReleaseCodes",
          method: "POST",
          path: "/" + dataType + "/validate",
          kind: "PREFLIGHT",
          reference: "releaseCode",
          fields: releaseFields,
        },
      ]),
      {
        code: "import.profile.list",
        permission: "import.release.view",
        scope: "profileCodes",
        method: "GET",
        path: "/initialization-profiles",
        requiresCode: false,
        kind: "PROFILES",
        reference: "profileCode",
        fields: [
          "profileCode",
          "label",
          "description",
          "status",
          "blocked",
          "destinationRole",
        ],
      },
      {
        code: "import.profile.validate",
        permission: "import.release.validate",
        scope: "profileCodes",
        method: "POST",
        path: "/initialization-profiles/",
        suffix: "/validate",
        routeCode: true,
        kind: "PROFILE_PREFLIGHT",
      },
      {
        code: "import.run.history",
        permission: "import.history.view",
        scope: "historyDataTypes",
        method: "GET",
        path: "/run/history?limit=25",
        requiresCode: false,
        kind: "HISTORY",
        reference: "dataType",
        fields: [
          "runId",
          "status",
          "dataType",
          "startedAt",
          "completedAt",
          "totalRecords",
          "successfulRecords",
          "failedRecords",
          "mediaCode",
        ],
      },
    ];
  },

  /** Recognizes only an exact typed Import inspection command. @param {string} message Human message. @returns {Object|null} Valid command or unrelated input. */
  parse: function (message) {
    if (typeof message !== "string" || !message.trim().startsWith("{"))
      return null;
    let command;
    try {
      command = JSON.parse(message);
    } catch (_) {
      return null;
    }
    if (command?.intent !== ENUMS.copilotImportIntent.INSPECT.value)
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
      !operation ||
      Object.keys(command).sort().join() !== expected ||
      (operation.requiresCode !== false && !this.validCode(command.code))
    )
      throw new CLASSES.NodicsError("ERR_CPT_00005");
    return command;
  },

  /** Validates release, profile and data-type identities without path syntax. @param {*} code Candidate identity. @returns {boolean} Whether safe. */
  validCode: function (code) {
    return (
      typeof code === "string" &&
      /^[A-Za-z][A-Za-z0-9._-]{0,127}(?::[A-Za-z][A-Za-z0-9_-]{0,127})?$/.test(
        code,
      )
    );
  },

  /** Resolves one exact enterprise scope and deployment target. @param {Object} context Trusted context. @param {Object} configuration Effective configuration. @returns {Object|null} Admission. */
  admission: function (context, configuration) {
    const settings = configuration.capability?.importInspection;
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
      Object.keys(settings.targetAuthority || {}).some(
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
      "initReleaseCodes",
      "coreReleaseCodes",
      "sampleReleaseCodes",
      "profileCodes",
      "historyDataTypes",
    ]) {
      if (
        !Array.isArray(scope[key]) ||
        scope[key].length > 100 ||
        new Set(scope[key]).size !== scope[key].length ||
        scope[key].some((code) => !this.validCode(code))
      )
        return null;
    }
    if (
      scope.historyDataTypes.some(
        (dataType) =>
          !["init", "core", "sample", "media", "local"].includes(dataType),
      )
    )
      return null;
    return { settings, scope };
  },

  /** Projects current permission-filtered Import choices without granting execution. @param {Object} context Trusted context. @param {Object} configuration Effective configuration. @returns {Object} Inert composer contract. */
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
            codes: admitted.scope[operation.scope].slice(),
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

  /** Binds the original actor, scope and native target. @param {Object} command Validated command. @param {Object} request Original request. @param {Object} configuration Effective settings. @returns {Object} Immutable binding. */
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
        ? admitted.scope[operation.scope].length === 0
        : !admitted.scope[operation.scope].includes(command.code)) ||
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
      allowedCodes: admitted.scope[operation.scope].slice(),
      operation,
      header: core.employeeExecutionHeaders(request),
    });
  },

  /** Requires a healthy success envelope. @param {Object} response Native response. @returns {Object} Native data. */
  unwrap: function (response) {
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
    const envelope =
      response.code === "SUC_IMP_00000"
        ? response
        : /^SUC_/.test(response.code || "")
          ? response.data
          : null;
    if (!healthy(envelope) || envelope.code !== "SUC_IMP_00000")
      throw new CLASSES.NodicsError("ERR_CPT_00007");
    return envelope.data;
  },

  /** Selects bounded scalar fields and rejects malformed owner data. @param {Object} row Native row. @param {string[]} fields Allowed fields. @returns {Object} Projection. */
  scalarProjection: function (row, fields) {
    if (!row || typeof row !== "object" || Array.isArray(row))
      throw new CLASSES.NodicsError("ERR_CPT_00007");
    const record = {};
    for (const field of fields) {
      const value = row[field];
      if (value === undefined) continue;
      if (
        value !== null &&
        !(typeof value === "string" && value.length <= 1000) &&
        !(typeof value === "number" && Number.isFinite(value)) &&
        typeof value !== "boolean"
      )
        throw new CLASSES.NodicsError("ERR_CPT_00007");
      record[field] = value;
    }
    return record;
  },

  /** Projects list responses after filtering every foreign identity. @param {*} data Native data. @param {Object} binding Admission. @returns {Object} Result. */
  projectList: function (data, binding) {
    if (!Array.isArray(data) || data.length > 500)
      throw new CLASSES.NodicsError("ERR_CPT_00007");
    const eligible = data.filter((row) =>
      binding.allowedCodes.includes(row?.[binding.operation.reference]),
    );
    const records = eligible
      .slice(0, binding.maximumRows)
      .map((row) => this.scalarProjection(row, binding.operation.fields));
    return {
      records,
      omittedForDisplay: Math.max(0, eligible.length - records.length),
      coverage: "BOUNDED_NATIVE_RESPONSE",
    };
  },

  /** Projects a release dry-run without installer internals or hidden catalogue rows. @param {*} data Native data. @param {Object} command Command. @param {Object} binding Admission. @returns {Object} Result. */
  projectPreflight: function (data, command, binding) {
    if (
      !data ||
      typeof data !== "object" ||
      Array.isArray(data) ||
      !Array.isArray(data.releases) ||
      data.releases.length > 256 ||
      data.releases.some((row) => row?.releaseCode !== command.code)
    )
      throw new CLASSES.NodicsError("ERR_CPT_00007");
    const validation = this.scalarProjection(data.validation || {}, [
      "validationOnly",
      "importExecuted",
      "ready",
      "skipped",
      "reason",
    ]);
    if (
      validation.validationOnly !== true ||
      validation.importExecuted !== false
    )
      throw new CLASSES.NodicsError("ERR_CPT_00007");
    const dryRun = data.dryRun || {};
    return {
      records: data.releases.map((row) =>
        this.scalarProjection(row, binding.operation.fields),
      ),
      validation,
      summary: this.scalarProjection(dryRun.summary || {}, [
        "install",
        "update",
        "retry",
        "skip",
        "blocked",
        "wait",
      ]),
      coverage: "VALIDATION_ONLY",
    };
  },

  /** Projects profile validation at profile and step level. @param {*} data Native data. @param {Object} command Command. @param {Object} binding Admission. @returns {Object} Result. */
  projectProfilePreflight: function (data, command, binding) {
    if (
      !data ||
      typeof data !== "object" ||
      Array.isArray(data) ||
      data.profileCode !== command.code ||
      data.mode !== "VALIDATE" ||
      !data.profile ||
      data.profile.profileCode !== command.code ||
      !Array.isArray(data.results) ||
      data.results.length > 3
    )
      throw new CLASSES.NodicsError("ERR_CPT_00007");
    const steps = data.results.map((step) => {
      if (!step || typeof step !== "object" || Array.isArray(step))
        throw new CLASSES.NodicsError("ERR_CPT_00007");
      const validation = step.validation
        ? this.scalarProjection(step.validation, [
            "validationOnly",
            "importExecuted",
            "ready",
            "skipped",
            "reason",
          ])
        : { skipped: step.skipped === true };
      if (
        validation.validationOnly !== undefined &&
        (validation.validationOnly !== true ||
          validation.importExecuted !== false)
      )
        throw new CLASSES.NodicsError("ERR_CPT_00007");
      return {
        ...this.scalarProjection(step, ["dataType", "skipped"]),
        validation,
      };
    });
    return {
      profile: this.scalarProjection(data.profile, [
        "profileCode",
        "label",
        "description",
        "status",
        "blocked",
        "destinationRole",
      ]),
      steps,
      coverage: "VALIDATION_ONLY",
    };
  },

  /** Projects one native response according to its fixed operation. @param {Object} response Native response. @param {Object} command Command. @param {Object} binding Admission. @returns {Object} Evidence. */
  project: function (response, command, binding) {
    const data = this.unwrap(response);
    let projection;
    if (["CATALOGUE", "PROFILES", "HISTORY"].includes(binding.operation.kind))
      projection = this.projectList(data, binding);
    else if (binding.operation.kind === "PREFLIGHT")
      projection = this.projectPreflight(data, command, binding);
    else projection = this.projectProfilePreflight(data, command, binding);
    const result = {
      operation: command.operation,
      ...(command.code === undefined ? {} : { code: command.code }),
      observedAt: new Date().toISOString(),
      ...projection,
    };
    if (Buffer.byteLength(JSON.stringify(result)) > 24000)
      throw new CLASSES.NodicsError("ERR_CPT_00007");
    return result;
  },

  /** Performs one fixed employee-authorized owner call, rechecks admission and returns deterministic evidence. @param {Object} command Typed command. @param {Object} request Original request. @param {Object} configuration Effective configuration. @returns {Promise<Object>} Conversation result. */
  execute: async function (command, request, configuration) {
    const validated = this.parse(JSON.stringify(command));
    if (!validated) throw new CLASSES.NodicsError("ERR_CPT_00005");
    const binding = this.authorize(validated, request, configuration);
    const invocation = {
      moduleName: "import",
      connectionName: binding.connectionName,
      targetAuthority: binding.targetAuthority,
      tenant: binding.tenant,
      local: false,
      methodName: binding.operation.method,
      apiVersion: "v0",
      maxAttempts: 1,
      apiName:
        binding.operation.path +
        (binding.operation.routeCode === true
          ? encodeURIComponent(validated.code) +
            (binding.operation.suffix || "")
          : ""),
      header: binding.header,
      ...(binding.operation.kind === "PREFLIGHT"
        ? { requestBody: { releaseCodes: [validated.code] } }
        : {}),
    };
    let response;
    try {
      response = await SERVICE.DefaultModuleService.invokeModule(invocation);
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
    const count = result.records?.length ?? result.steps?.length ?? 1;
    return {
      content:
        "Import inspection: " +
        count +
        " bounded records shown. Validation does not install releases or import media.\n\n```json\n" +
        JSON.stringify(result, null, 2) +
        "\n```",
      metadata: {
        provider: null,
        usage: {},
        finishReason: "import_inspection",
        providerContextEligible: false,
      },
    };
  },
};
