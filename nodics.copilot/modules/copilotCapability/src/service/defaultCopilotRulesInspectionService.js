/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

/** @module copilotCapability/service/DefaultCopilotRulesInspectionService
 * @description Inspects explicitly scoped Rules metadata through fixed native GET operations under the original employee credential.
 * @layer service @owner copilotCapability
 * @override Preserve exact scope admission, native authorization, fixed transport, bounded inert projections and exclusion from provider context.
 */
module.exports = {
  /** Returns native read contracts, never browser-selected routing or mutation handlers. @returns {Array<Object>} Fixed operation descriptors. */
  operations: function () {
    return [
      {
        code: "rules.definition.list",
        permission: "rules.definition.read",
        kind: "rule",
        scopeKey: "ruleCodes",
        path: "/definitions",
        envelope: "RULE_SET_LIST",
        multiple: true,
        requiresCode: false,
        reference: "code",
      },
      {
        code: "rules.definition.inspect",
        permission: "rules.definition.read",
        kind: "rule",
        scopeKey: "ruleCodes",
        path: "/definitions/",
        suffix: "",
        envelope: "RULE_SET_DETAIL",
        multiple: false,
      },
      {
        code: "rules.definition.versions",
        permission: "rules.definition.read",
        kind: "rule",
        scopeKey: "ruleCodes",
        path: "/definitions/",
        suffix: "/versions",
        envelope: "RULE_SET_VERSIONS",
        multiple: true,
        reference: "ruleSetCode",
      },
      {
        code: "rules.definition.audit",
        permission: "rules.definition.audit",
        kind: "rule",
        scopeKey: "ruleCodes",
        path: "/definitions/",
        suffix: "/audit",
        envelope: "RULE_SET_AUDIT",
        multiple: true,
        reference: "ruleSetCode",
      },
      {
        code: "rules.band.list",
        permission: "rules.band.read",
        kind: "band",
        scopeKey: "bandCodes",
        path: "/band-sets",
        envelope: "SCORE_BAND_SET_LIST",
        multiple: true,
        requiresCode: false,
        reference: "code",
      },
      {
        code: "rules.band.inspect",
        permission: "rules.band.read",
        kind: "band",
        scopeKey: "bandCodes",
        path: "/band-sets/",
        suffix: "",
        envelope: "SCORE_BAND_SET_DETAIL",
        multiple: false,
      },
      {
        code: "rules.band.versions",
        permission: "rules.band.read",
        kind: "band",
        scopeKey: "bandCodes",
        path: "/band-sets/",
        suffix: "/versions",
        envelope: "SCORE_BAND_SET_VERSIONS",
        multiple: true,
        reference: "bandSetCode",
      },
      {
        code: "rules.property.catalogue",
        permission: "rules.definition.read",
        kind: "property",
        scopeKey: "propertyProviderCodes",
        path: "/property-catalogues/",
        suffix: "",
        envelope: "RULE_PROPERTY_CATALOGUE",
        multiple: false,
        catalogue: true,
      },
    ];
  },
  /** Recognizes typed inspections and rejects additional authority fields without falling through to a model. @param {string} message Human input. @returns {Object|null} Valid command or unrelated prose. */
  parse: function (message) {
    if (typeof message !== "string" || !message.trim().startsWith("{"))
      return null;
    let command;
    try {
      command = JSON.parse(message);
    } catch (_) {
      return null;
    }
    if (command?.intent !== ENUMS.copilotRulesIntent.INSPECT.value) return null;
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
      (operation.requiresCode !== false &&
        (typeof command.code !== "string" ||
          !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(command.code)))
    )
      throw new CLASSES.NodicsError("ERR_CPT_00001");
    return command;
  },
  /** Resolves exactly one current tenant/enterprise/environment binding and validates configured routing. @param {Object} context Trusted identity. @param {Object} configuration Effective Copilot settings. @returns {Object|null} Admitted settings or unavailable. */
  admission: function (context, configuration) {
    const settings = configuration.capability?.rulesInspection;
    const policy = SERVICE.DefaultCopilotPolicyService;
    if (
      !settings ||
      settings.enabled !== true ||
      context.channel !== "EMPLOYEE" ||
      !context.actor ||
      !context.tenant ||
      !context.enterprise ||
      !context.environment ||
      !policy.hasPermission(context, "copilot.data.query") ||
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
    for (const key of ["ruleCodes", "bandCodes", "propertyProviderCodes"]) {
      if (
        !Array.isArray(scope[key]) ||
        scope[key].length > 100 ||
        new Set(scope[key]).size !== scope[key].length ||
        scope[key].some(
          (code) =>
            typeof code !== "string" ||
            !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(code),
        )
      )
        return null;
    }
    return { settings, scope };
  },
  /** Projects only currently allowed operation/code choices; catalogue visibility does not authorize execution. @param {Object} context Trusted identity. @param {Object} configuration Effective settings. @returns {Object} Inert composer context. */
  catalogue: function (context, configuration) {
    const admitted = this.admission(context, configuration);
    const operations = admitted
      ? this.operations()
          .filter((row) =>
            SERVICE.DefaultCopilotPolicyService.hasPermission(
              context,
              row.permission,
            ),
          )
          .map((row) => ({
            code: row.code,
            label: admitted.settings.presentation?.operations?.[row.code],
            codes: admitted.scope[row.scopeKey].slice(),
            requiresCode: row.requiresCode !== false,
          }))
          .filter(
            (row) =>
              row.codes.length &&
              typeof row.label === "string" &&
              row.label.trim() &&
              row.label.length <= 100,
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
  /** Authorizes a command and captures immutable routing and scope for post-read drift checks. @param {Object} command Valid command. @param {Object} request Original employee request. @param {Object} configuration Effective settings. @returns {Object} Native binding. */
  authorize: function (command, request, configuration) {
    const core = SERVICE.DefaultCopilotOrchestrationService;
    const context = core.securityContext(request, configuration);
    const admitted = this.admission(context, configuration);
    const operation = this.operations().find(
      (row) => row.code === command.operation,
    );
    if (
      !admitted ||
      !operation ||
      !SERVICE.DefaultCopilotPolicyService.hasPermission(
        context,
        operation.permission,
      ) ||
      (operation.requiresCode === false
        ? admitted.scope[operation.scopeKey].length === 0
        : !admitted.scope[operation.scopeKey].includes(command.code))
    )
      throw new CLASSES.NodicsError("ERR_CPT_00002");
    const header = core.employeeExecutionHeaders(request);
    return structuredClone({
      actor: context.actor,
      tenant: context.tenant,
      enterprise: context.enterprise,
      environment: context.environment,
      connectionName: admitted.settings.connectionName,
      targetAuthority: admitted.settings.targetAuthority,
      maximumRows: admitted.settings.maximumRows,
      allowedCodes: admitted.scope[operation.scopeKey].slice(),
      operation,
      header,
    });
  },
  /** Accepts only the exact owner envelope and identity-bound scalar rows, excluding definitions, actors and free-form audit payloads. @param {Object} response Native response. @param {Object} command Requested identity. @param {Object} binding Authorized contract. @returns {Object} Bounded metadata. */
  project: function (response, command, binding) {
    const invalid = () => {
      throw new CLASSES.NodicsError("ERR_CPT_00003");
    };
    const healthy = (value) =>
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      !value.error &&
      value.success !== false &&
      value.acknowledged !== false &&
      (value.errors === undefined ||
        (Array.isArray(value.errors) && !value.errors.length));
    if (!healthy(response)) invalid();
    const envelope = /^SUC_/.test(response.code || "")
      ? response.data
      : response;
    if (!healthy(envelope) || envelope.code !== binding.operation.envelope)
      invalid();
    if (binding.operation.catalogue === true)
      return this.projectCatalogue(envelope.data, command, binding);
    const rows = binding.operation.multiple ? envelope.data : [envelope.data];
    if (!Array.isArray(rows) || rows.length > 200) invalid();
    const fields =
      command.operation === "rules.definition.audit"
        ? [
            "ruleSetCode",
            "eventType",
            "outcome",
            "draftRevision",
            "version",
            "createdAt",
          ]
        : [
            "code",
            "ruleSetCode",
            "bandSetCode",
            "name",
            "status",
            "consumerModule",
            "policyType",
            "outcomeType",
            "scopeType",
            "scopeCode",
            "currentVersion",
            "draftRevision",
            "revision",
            "version",
            "publishedAt",
            "effectiveFrom",
            "effectiveTo",
          ];
    // Validate all returned identities before truncating so an owner mismatch is never hidden by a display bound.
    const admittedRows = rows.filter((row) =>
      binding.operation.requiresCode === false
        ? binding.allowedCodes.includes(row?.[binding.operation.reference])
        : true,
    );
    for (const row of admittedRows) {
      if (
        !row ||
        typeof row !== "object" ||
        Array.isArray(row) ||
        (binding.operation.requiresCode === false
          ? !binding.allowedCodes.includes(row[binding.operation.reference])
          : row[binding.operation.reference || "code"] !== command.code)
      )
        invalid();
      for (const field of fields) {
        const value = row[field];
        // Native names can be localized objects; omit them rather than choosing a language or exposing nested fields.
        if (
          field === "name" &&
          value &&
          typeof value === "object" &&
          !Array.isArray(value)
        )
          continue;
        if (
          value !== undefined &&
          value !== null &&
          !(typeof value === "string" && value.length <= 512) &&
          !(typeof value === "number" && Number.isFinite(value))
        )
          invalid();
      }
    }
    return {
      operation: command.operation,
      ...(command.code === undefined ? {} : { code: command.code }),
      observedAt: new Date().toISOString(),
      records: admittedRows
        .slice(0, binding.maximumRows)
        .map((row) =>
          Object.fromEntries(
            fields
              .filter(
                (key) =>
                  row[key] !== undefined &&
                  !(key === "name" && row[key] && typeof row[key] === "object"),
              )
              .map((key) => [key, row[key]]),
          ),
        ),
      omittedForDisplay: Math.max(0, admittedRows.length - binding.maximumRows),
      coverage: binding.operation.multiple
        ? "BOUNDED_NATIVE_RESPONSE"
        : "CURRENT_SUMMARY",
    };
  },
  /** Projects a bounded property catalogue without executable provider code or arbitrary nested metadata. @param {Object} value Native catalogue envelope data. @param {Object} command Typed provider selection. @param {Object} binding Current admission. @returns {Object} Minimized property metadata. */
  projectCatalogue: function (value, command, binding) {
    const catalogue = value?.catalogue;
    if (
      !catalogue ||
      typeof catalogue !== "object" ||
      Array.isArray(catalogue) ||
      catalogue.providerCode !== command.code ||
      typeof catalogue.code !== "string" ||
      !catalogue.code ||
      catalogue.code.length > 128 ||
      !["string", "number"].includes(typeof catalogue.version) ||
      typeof catalogue.consumerModule !== "string" ||
      !catalogue.consumerModule ||
      catalogue.consumerModule.length > 128 ||
      !Array.isArray(catalogue.properties) ||
      catalogue.properties.length > 200 ||
      !Array.isArray(value.operators) ||
      value.operators.length > 100 ||
      value.operators.some(
        (operator) =>
          typeof operator !== "string" ||
          !/^[A-Z][A-Z0-9_]{0,63}$/.test(operator),
      )
    )
      throw new CLASSES.NodicsError("ERR_CPT_00003");
    const properties = catalogue.properties.map((property) => {
      if (
        !property ||
        typeof property !== "object" ||
        Array.isArray(property) ||
        typeof property.code !== "string" ||
        !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(property.code) ||
        typeof property.displayName !== "string" ||
        !property.displayName ||
        property.displayName.length > 256 ||
        typeof property.dataType !== "string" ||
        !/^[A-Z][A-Z0-9_]{0,63}$/.test(property.dataType) ||
        !Array.isArray(property.allowedOperators) ||
        property.allowedOperators.length > 50 ||
        property.allowedOperators.some(
          (operator) => !value.operators.includes(operator),
        ) ||
        (property.allowedValues !== undefined &&
          (!Array.isArray(property.allowedValues) ||
            property.allowedValues.length > 100 ||
            property.allowedValues.some(
              (item) =>
                !["string", "number", "boolean"].includes(typeof item) ||
                (typeof item === "string" && item.length > 256) ||
                (typeof item === "number" && !Number.isFinite(item)),
            )))
      )
        throw new CLASSES.NodicsError("ERR_CPT_00003");
      return {
        code: property.code,
        displayName: property.displayName,
        dataType: property.dataType,
        allowedOperators: property.allowedOperators.slice(),
        ...(property.allowedValues === undefined
          ? {}
          : { allowedValues: property.allowedValues.slice() }),
        ...(typeof property.unit === "string" && property.unit.length <= 64
          ? { unit: property.unit }
          : {}),
      };
    });
    const result = {
      operation: command.operation,
      code: command.code,
      observedAt: new Date().toISOString(),
      catalogue: {
        code: catalogue.code,
        version: String(catalogue.version),
        providerCode: catalogue.providerCode,
        consumerModule: catalogue.consumerModule,
        properties: properties.slice(0, binding.maximumRows),
        omittedForDisplay: Math.max(0, properties.length - binding.maximumRows),
      },
      operators: value.operators.slice(),
      coverage: "BOUNDED_NATIVE_RESPONSE",
    };
    if (Buffer.byteLength(JSON.stringify(result)) > 24000)
      throw new CLASSES.NodicsError("ERR_CPT_00003");
    return result;
  },
  /** Makes one native GET with original credentials, rechecks admission and returns inert metadata without model execution. @param {Object} command Typed inspection. @param {Object} request Original request. @param {Object} configuration Effective settings at turn admission. @returns {Promise<Object>} Deterministic answer. */
  execute: async function (command, request, configuration) {
    const validated = this.parse(JSON.stringify(command));
    if (!validated) throw new CLASSES.NodicsError("ERR_CPT_00001");
    const binding = this.authorize(validated, request, configuration);
    let response;
    try {
      response = await SERVICE.DefaultModuleService.invokeModule({
        moduleName: "rulesApi",
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
      throw new CLASSES.NodicsError("ERR_CPT_00003");
    }
    const current = this.authorize(
      validated,
      request,
      SERVICE.DefaultCopilotOrchestrationService.configuration(),
    );
    if (JSON.stringify(binding) !== JSON.stringify(current))
      throw new CLASSES.NodicsError("ERR_CPT_00004");
    const result = this.project(response, validated, binding);
    while (Buffer.byteLength(JSON.stringify(result)) > 24000) {
      if (!result.records.length)
        throw new CLASSES.NodicsError("ERR_CPT_00003");
      result.records.pop();
      result.omittedForDisplay++;
    }
    return {
      content:
        "Rules inspection: " +
        (result.records?.length || result.catalogue?.properties?.length || 0) +
        " metadata records shown. Version and activity results are bounded, not total counts.\n\n" +
        JSON.stringify(result, null, 2)
          .split("\n")
          .map((line) => "    " + line)
          .join("\n"),
    };
  },
};
