/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";

/**
 * @module copilotCapability/service/DefaultCopilotOrderNotificationInspectionService
 * @description Reads one explicitly admitted order's native notification workspace or original-intent observations without selecting recipients, templates, transports, or retrying delivery.
 * @layer service
 * @owner copilotCapability
 * @override Later layers may narrow scopes and presentation. Preserve original employee authority, fixed Digital Core routes, bounded projection, and provider exclusion.
 */
module.exports = {
  /** Returns the two fixed read contracts; callers cannot supply routing. @returns {Object[]} Native operations. */
  operations: function () {
    return [
      {
        code: "commerce.orderNotification.workspace",
        path: "/orders/",
        suffix: "/notifications/workspace",
        method: "GET",
      },
      {
        code: "commerce.orderNotification.inspect",
        path: "/orders/",
        suffix: "/notifications/inspect",
        method: "POST",
      },
    ];
  },

  /** Accepts only typed inspection JSON; malformed recognized input fails before provider or transport. @param {string} message Human message. @returns {Object|null} Typed command. */
  parse: function (message) {
    if (typeof message !== "string" || !message.trim().startsWith("{"))
      return null;
    let command;
    try {
      command = JSON.parse(message);
    } catch {
      return null;
    }
    if (command?.intent !== ENUMS.copilotOrderNotificationIntent.INSPECT.value)
      return null;
    const operation = this.operations().find(
      (candidate) => candidate.code === command.operation,
    );
    const expected =
      operation?.method === "POST"
        ? "code,intent,kind,operation"
        : "code,intent,operation";
    if (
      message.length > 1024 ||
      !operation ||
      Object.keys(command).sort().join() !== expected ||
      !this.validCode(command.code) ||
      (operation.method === "POST" &&
        !["PURCHASED", "REFUNDED"].includes(command.kind))
    )
      throw new CLASSES.NodicsError("ERR_CPT_00005");
    return command;
  },

  /** Validates a literal order code without path or wildcard syntax. @param {*} code Candidate order. @returns {boolean} Whether bounded. */
  validCode: function (code) {
    return (
      typeof code === "string" &&
      /^[A-Za-z0-9][A-Za-z0-9_.:@-]{0,127}$/.test(code)
    );
  },

  /** Resolves one exact configured scope; an empty or ambiguous scope grants nothing. @param {Object} context Trusted actor. @param {Object} configuration Effective settings. @returns {Object|null} Admission. */
  admission: function (context, configuration) {
    const settings = configuration.capability?.orderNotificationInspection;
    if (
      settings?.enabled !== true ||
      context.channel !== "EMPLOYEE" ||
      !context.actor ||
      !context.tenant ||
      !context.enterprise ||
      !context.environment ||
      !SERVICE.DefaultCopilotPolicyService.hasPermission(
        context,
        "copilot.data.query",
      ) ||
      !SERVICE.DefaultCopilotPolicyService.hasPermission(
        context,
        "commerce.digital.notification.read",
      ) ||
      !/^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(settings.connectionName || "") ||
      settings.connectionName === "default" ||
      !/^[A-Z][A-Z0-9_]{0,63}$/.test(
        settings.targetAuthority?.runtimeRole || "",
      ) ||
      Object.keys(settings.targetAuthority || {}).some(
        (key) => key !== "runtimeRole",
      ) ||
      !Array.isArray(settings.scopes) ||
      settings.scopes.length > 1000
    )
      return null;
    const matches = settings.scopes.filter(
      (scope) =>
        scope?.tenant === context.tenant &&
        scope.enterprise === context.enterprise &&
        scope.environment === context.environment,
    );
    if (matches.length !== 1) return null;
    const orderCodes = matches[0].orderCodes;
    if (
      !Array.isArray(orderCodes) ||
      orderCodes.length > 100 ||
      new Set(orderCodes).size !== orderCodes.length ||
      orderCodes.some((code) => !this.validCode(code))
    )
      return null;
    return { settings, orderCodes };
  },

  /** Projects inert composer choices only; codes grant no owner access. @param {Object} context Trusted actor. @param {Object} configuration Effective settings. @returns {Object} Bounded catalogue. */
  catalogue: function (context, configuration) {
    const admitted = this.admission(context, configuration);
    const presentation = {};
    for (const key of [
      "title",
      "operation",
      "code",
      "kind",
      "submit",
      "cancel",
      "failure",
    ]) {
      const value = admitted?.settings.presentation?.[key];
      if (typeof value === "string" && value.trim() && value.length <= 200)
        presentation[key] = value;
    }
    const operations = admitted
      ? this.operations()
          .map((operation) => ({
            code: operation.code,
            label: admitted.settings.presentation?.operations?.[operation.code],
            orderCodes: admitted.orderCodes.slice(),
            kinds: operation.method === "POST" ? ["PURCHASED", "REFUNDED"] : [],
          }))
          .filter(
            (operation) =>
              operation.orderCodes.length &&
              typeof operation.label === "string" &&
              operation.label.trim() &&
              operation.label.length <= 100,
          )
      : [];
    return { operations, presentation };
  },

  /** Binds the current actor and route admission for a post-read drift check. @param {Object} command Typed command. @param {Object} request Original request. @param {Object} configuration Effective settings. @returns {Object} Immutable binding. */
  authorize: function (command, request, configuration) {
    const core = SERVICE.DefaultCopilotOrchestrationService;
    const context = core.securityContext(request, configuration);
    const admitted = this.admission(context, configuration);
    const operation = this.operations().find(
      (candidate) => candidate.code === command.operation,
    );
    if (!admitted || !operation || !admitted.orderCodes.includes(command.code))
      throw new CLASSES.NodicsError("ERR_CPT_00006");
    return structuredClone({
      actor: context.actor,
      tenant: context.tenant,
      enterprise: context.enterprise,
      environment: context.environment,
      connectionName: admitted.settings.connectionName,
      targetAuthority: admitted.settings.targetAuthority,
      operation,
      header: core.employeeExecutionHeaders(request),
    });
  },

  /** Unwraps only healthy success envelopes. @param {Object} response Native transport. @returns {Object} Native payload. */
  unwrap: function (response) {
    let value = response;
    for (let depth = 0; depth < 7; depth++) {
      if (
        !value ||
        typeof value !== "object" ||
        Array.isArray(value) ||
        value.error ||
        value.success === false ||
        value.acknowledged === false ||
        (value.code !== undefined && !/^SUC_/.test(value.code)) ||
        (value.errors !== undefined &&
          (!Array.isArray(value.errors) || value.errors.length))
      )
        throw new CLASSES.NodicsError("ERR_CPT_00007");
      if (value.data !== undefined) value = value.data;
      else if (value.result !== undefined) value = value.result;
      else return value;
    }
    throw new CLASSES.NodicsError("ERR_CPT_00007");
  },

  /** Projects owner observations without financial details, recipients or transport configuration. @param {Object} response Native result. @param {Object} command Bound input. @returns {Object} Bounded evidence. */
  project: function (response, command) {
    const value = this.unwrap(response);
    if (
      value.orderCode !== command.code ||
      !Number.isSafeInteger(value.orderRevision) ||
      value.orderRevision < 0 ||
      typeof value.financialState !== "string" ||
      value.financialState.length > 64 ||
      (command.kind !== undefined && value.kind !== command.kind)
    )
      throw new CLASSES.NodicsError("ERR_CPT_00007");
    const events = value.events || [value];
    if (!Array.isArray(events) || events.length < 1 || events.length > 2)
      throw new CLASSES.NodicsError("ERR_CPT_00007");
    const projected = events.map((event) => {
      if (
        !["PURCHASED", "REFUNDED"].includes(event.kind) ||
        typeof event.status !== "string" ||
        !event.status ||
        event.status.length > 64 ||
        (event.retryEligible !== undefined &&
          typeof event.retryEligible !== "boolean") ||
        !Array.isArray(event.outcomes) ||
        event.outcomes.length > 200
      )
        throw new CLASSES.NodicsError("ERR_CPT_00007");
      return {
        kind: event.kind,
        status: event.status,
        ...(event.retryEligible === undefined
          ? {}
          : { retryEligible: event.retryEligible }),
        outcomes: event.outcomes.map((outcome) => {
          if (
            !outcome ||
            !["EMAIL", "SMS"].includes(outcome.channel) ||
            !/^COMM_[a-f0-9]{64}$/.test(outcome.intentCode || "") ||
            typeof outcome.status !== "string" ||
            !outcome.status ||
            outcome.status.length > 64 ||
            typeof outcome.observed !== "boolean" ||
            (outcome.revision !== undefined &&
              (!Number.isSafeInteger(outcome.revision) || outcome.revision < 0))
          )
            throw new CLASSES.NodicsError("ERR_CPT_00007");
          return {
            channel: outcome.channel,
            intentCode: outcome.intentCode,
            status: outcome.status,
            observed: outcome.observed,
            ...(outcome.revision === undefined
              ? {}
              : { revision: outcome.revision }),
          };
        }),
      };
    });
    const result = {
      operation: command.operation,
      orderCode: command.code,
      orderRevision: value.orderRevision,
      financialState: value.financialState,
      featureState: value.featureState || "ACTIVE",
      observedAt: new Date().toISOString(),
      events: projected,
      limitation:
        "Notification observations are not financial outcomes. Inspection did not create or retry a message.",
    };
    if (Buffer.byteLength(JSON.stringify(result)) > 48000)
      throw new CLASSES.NodicsError("ERR_CPT_00007");
    return result;
  },

  /** Performs one fixed employee-authorized owner call and rechecks admission afterward. @param {Object} command Typed command. @param {Object} request Original request. @param {Object} configuration Effective settings. @returns {Promise<Object>} Deterministic response. */
  execute: async function (command, request, configuration) {
    const validated = this.parse(JSON.stringify(command));
    if (!validated) throw new CLASSES.NodicsError("ERR_CPT_00005");
    const binding = this.authorize(validated, request, configuration);
    let response;
    try {
      response = await SERVICE.DefaultModuleService.invokeModule({
        moduleName: "digitalCore",
        connectionName: binding.connectionName,
        targetAuthority: binding.targetAuthority,
        tenant: binding.tenant,
        local: false,
        methodName: binding.operation.method,
        apiVersion: "v0",
        maxAttempts: 1,
        apiName:
          binding.operation.path +
          encodeURIComponent(validated.code) +
          binding.operation.suffix,
        header: binding.header,
        ...(binding.operation.method === "POST"
          ? { requestBody: { kind: validated.kind } }
          : {}),
      });
    } catch {
      throw new CLASSES.NodicsError("ERR_CPT_00007");
    }
    const current = this.authorize(
      validated,
      request,
      SERVICE.DefaultCopilotOrchestrationService.configuration(),
    );
    if (JSON.stringify(binding) !== JSON.stringify(current))
      throw new CLASSES.NodicsError("ERR_CPT_00008");
    const result = this.project(response, validated);
    return {
      content:
        "Order notification inspection. No notification was created or retried.\n\n" +
        JSON.stringify(result, null, 2)
          .split("\n")
          .map((line) => "    " + line)
          .join("\n"),
    };
  },
};
