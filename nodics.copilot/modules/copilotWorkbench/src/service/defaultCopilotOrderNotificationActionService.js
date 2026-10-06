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
 * @module copilotWorkbench/service/DefaultCopilotOrderNotificationActionService
 * @description Prepares one original notification retry from a fresh Digital Core workspace and executes one fixed owner command under the original employee.
 * @layer service
 * @owner copilotWorkbench
 * @override Preserve fixed routing, current order revision, frozen intent identities, explicit confirmation, one dispatch attempt, and inspection-only uncertain recovery.
 */
module.exports = {
  /** Rejects without exposing private owner or transport details. @returns {never} Throws. */
  fail: function () {
    throw new CLASSES.NodicsError("ERR_CPW_00004");
  },

  /** Recognizes typed retry input and an exact short form without inventing order or kind. @param {string} message Human request. @returns {Object|null} Candidate. */
  parseIntent: function (message) {
    if (typeof message !== "string" || message.length > 4096) return null;
    try {
      const body = JSON.parse(
        message.trim().replace(/^```json\s*([\s\S]*?)\s*```$/i, "$1"),
      );
      if (body?.operation === "commerce.orderNotification.retry") return body;
    } catch {
      /* The bounded short form below still requires both material values. */
    }
    const match =
      /^retry\s+(PURCHASED|REFUNDED)\s+notification\s+for\s+order\s+([A-Za-z0-9][A-Za-z0-9_.:@-]{0,127})\s*$/i.exec(
        message.trim(),
      );
    return match
      ? {
          operation: "commerce.orderNotification.retry",
          orderCode: match[2],
          kind: match[1].toUpperCase(),
        }
      : null;
  },

  /** Resolves only an explicitly qualified Commerce runtime. @param {Object} configuration Effective settings. @returns {Object} Fixed target. */
  target: function (configuration) {
    const target = configuration.workbench?.orderNotificationTarget;
    if (
      target?.enabled !== true ||
      target.moduleName !== "digitalCore" ||
      typeof target.connectionName !== "string" ||
      target.connectionName === "default" ||
      !/^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(target.connectionName) ||
      target.targetAuthority?.runtimeRole !== "COMMERCE" ||
      Object.keys(target.targetAuthority || {}).some(
        (key) => key !== "runtimeRole",
      )
    )
      this.fail();
    return {
      moduleName: "digitalCore",
      connectionName: target.connectionName,
      targetAuthority: structuredClone(target.targetAuthority),
    };
  },

  /** Requires independent Copilot and Digital Core grants in the current actor scope. @param {Object} request Trusted request. @param {Object} configuration Effective settings. @param {boolean} execute Execution phase. @returns {Object} Current scope. */
  authorize: function (request, configuration, execute = false) {
    const core = SERVICE.DefaultCopilotOrchestrationService;
    const context = core.securityContext(request, configuration);
    if (
      context.channel !== "EMPLOYEE" ||
      !context.actor ||
      !context.tenant ||
      !context.enterprise ||
      context.tenant !== request.tenant ||
      [
        "copilot.mutation.prepare",
        "commerce.digital.notification.read",
        "commerce.digital.notification.retry",
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

  /** Validates only one order and one fixed event kind. @param {Object} input Candidate command. @returns {Object} Bounded command. */
  input: function (input) {
    if (
      !input ||
      typeof input !== "object" ||
      Array.isArray(input) ||
      Object.keys(input).sort().join() !== "kind,operation,orderCode" ||
      input.operation !== "commerce.orderNotification.retry" ||
      typeof input.orderCode !== "string" ||
      !/^[A-Za-z0-9][A-Za-z0-9_.:@-]{0,127}$/.test(input.orderCode) ||
      !["PURCHASED", "REFUNDED"].includes(input.kind)
    )
      this.fail();
    return {
      operation: input.operation,
      orderCode: input.orderCode,
      kind: input.kind,
    };
  },

  /** Unwraps only a positive native envelope. @param {Object} response Transport value. @returns {Object} Owner payload. */
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
        this.fail();
      if (value.data !== undefined) value = value.data;
      else if (value.result !== undefined) value = value.result;
      else return value;
    }
    this.fail();
  },

  /** Calls one adapter-owned native route with original credentials and no retry. @param {Object} request Employee request. @param {Object} target Fixed runtime. @param {string} apiName Fixed route. @param {string} methodName HTTP method. @param {Object|undefined} body Fixed body. @returns {Promise<Object>} Native payload. */
  invoke: async function (request, target, apiName, methodName, body) {
    try {
      const invocation = {
        ...target,
        tenant: request.tenant,
        local: false,
        apiName,
        methodName,
        apiVersion: "v0",
        maxAttempts: 1,
        timeoutMs: 10000,
        header:
          SERVICE.DefaultCopilotOrchestrationService.employeeExecutionHeaders(
            request,
          ),
        ...(body === undefined ? {} : { requestBody: body }),
      };
      SERVICE.DefaultLoggerService.inheritRequestPrivacy(invocation, request);
      return this.unwrap(
        await SERVICE.DefaultModuleService.invokeModule(invocation),
      );
    } catch {
      this.fail();
    }
  },

  /** Extracts the exact eligible original intent set from a fresh owner workspace. @param {Object} workspace Owner DTO. @param {Object} command Typed command. @returns {Object} Bound revision and digest. */
  eligible: function (workspace, command) {
    const event = workspace?.events?.find(
      (candidate) => candidate?.kind === command.kind,
    );
    const retry = workspace?.commands?.find(
      (candidate) => candidate?.id === "retry",
    );
    if (
      workspace?.contractVersion !== 1 ||
      workspace.workspaceCode !== "commerce.orderNotifications" ||
      workspace.viewCode !== "orderNotifications.detail" ||
      workspace.featureState !== "ACTIVE" ||
      workspace.orderCode !== command.orderCode ||
      !Number.isSafeInteger(workspace.orderRevision) ||
      workspace.orderRevision < 0 ||
      event?.retryEligible !== true ||
      !Array.isArray(event.outcomes) ||
      event.outcomes.length < 1 ||
      event.outcomes.length > 200 ||
      retry?.enabled !== true ||
      !Array.isArray(retry.eligibleKinds) ||
      !retry.eligibleKinds.includes(command.kind)
    )
      this.fail();
    const intentCodes = event.outcomes
      .filter(
        (outcome) =>
          outcome?.observed === true &&
          ["ACCEPTED", "RETRY_PENDING", "DELIVERING"].includes(outcome.status),
      )
      .map((outcome) => outcome.intentCode);
    if (
      !intentCodes.length ||
      new Set(intentCodes).size !== intentCodes.length ||
      intentCodes.some(
        (code) => typeof code !== "string" || !/^COMM_[a-f0-9]{64}$/.test(code),
      )
    )
      this.fail();
    return {
      orderRevision: workspace.orderRevision,
      intentCount: intentCodes.length,
      intentDigest: SERVICE.DefaultModelCommandReceiptService.digest(
        intentCodes.slice().sort(),
      ),
      intentCodes,
    };
  },

  /** Prepares a complete immutable retry review after a fresh owner eligibility read. @param {Object} request Typed command. @param {Object} configuration Effective settings. @returns {Promise<Object>} Confirmation. */
  prepare: async function (request, configuration) {
    const command = this.input(request.body);
    const context = this.authorize(request, configuration);
    const target = this.target(configuration);
    const workspace = await this.invoke(
      request,
      target,
      "/orders/" +
        encodeURIComponent(command.orderCode) +
        "/notifications/workspace",
      "GET",
    );
    const eligible = this.eligible(workspace, command);
    const fresh = CONFIG.get("copilot");
    this.authorize(request, fresh);
    if (JSON.stringify(target) !== JSON.stringify(this.target(fresh)))
      this.fail();
    const plan = {
      id: "order-notification-retry-plan-" + crypto.randomUUID(),
      state: "VALIDATED",
      schema: "orderNotificationRetry",
      records: [
        {
          code: command.orderCode,
          kind: command.kind,
          expectedRevision: eligible.orderRevision,
          intentCount: eligible.intentCount,
          intentDigest: eligible.intentDigest,
        },
      ],
      relatedRecords: {},
      executionTarget: target,
      preview: {
        summary:
          "Retry only the existing frozen notification intent after Digital Core rechecks the current order, financial evidence, revision and delivery state. A retry request is not proof of delivery. An uncertain response is inspected and never replayed automatically.",
        review: [
          {
            title: "Order notification retry",
            fields: [
              { label: "Order", value: command.orderCode },
              { label: "Event", value: command.kind },
              {
                label: "Order revision",
                value: String(eligible.orderRevision),
              },
              {
                label: "Eligible original intents",
                value: String(eligible.intentCount),
              },
              { label: "Executing employee", value: context.actor },
            ],
          },
        ],
      },
    };
    return SERVICE.DefaultCopilotWorkbenchService.persistPrepared(
      plan,
      command.operation,
      request,
      context,
    );
  },

  /** Validates the immutable one-row plan before execution or inspection. @param {Object} action Owned action. @returns {Object} Plan row. */
  checked: function (action) {
    const plan = action.audit?.plan;
    const row = plan?.records?.[0];
    if (
      action.capability !== "commerce.orderNotification.retry" ||
      plan?.schema !== "orderNotificationRetry" ||
      plan.state !== "VALIDATED" ||
      !Array.isArray(plan.records) ||
      plan.records.length !== 1 ||
      Object.keys(plan.relatedRecords || {}).length ||
      !row ||
      Object.keys(row).sort().join() !==
        "code,expectedRevision,intentCount,intentDigest,kind" ||
      !/^[A-Za-z0-9][A-Za-z0-9_.:@-]{0,127}$/.test(row.code || "") ||
      !["PURCHASED", "REFUNDED"].includes(row.kind) ||
      !Number.isSafeInteger(row.expectedRevision) ||
      row.expectedRevision < 0 ||
      !Number.isSafeInteger(row.intentCount) ||
      row.intentCount < 1 ||
      row.intentCount > 200 ||
      !/^[a-f0-9]{64}$/.test(row.intentDigest || "")
    )
      this.fail();
    return row;
  },

  /** Executes one fixed retry after fresh eligibility/digest/revision validation. @param {Object} action Owned action. @param {Object} request Approval request. @param {Object} configuration Effective settings. @returns {Promise<Object>} Durable action result. */
  execute: async function (action, request, configuration) {
    const context = this.authorize(request, configuration, true);
    const target = this.target(configuration);
    const record = this.checked(action);
    if (
      JSON.stringify(action.audit.plan.executionTarget) !==
      JSON.stringify(target)
    )
      this.fail();
    return SERVICE.DefaultCopilotActionExecutionService.execute(
      action,
      request,
      context,
      request,
      async (row) => {
        const current = CONFIG.get("copilot");
        this.authorize(request, current, true);
        if (JSON.stringify(target) !== JSON.stringify(this.target(current)))
          this.fail();
        const workspace = await this.invoke(
          request,
          target,
          "/orders/" +
            encodeURIComponent(record.code) +
            "/notifications/workspace",
          "GET",
        );
        const eligible = this.eligible(workspace, {
          orderCode: record.code,
          kind: record.kind,
        });
        if (
          eligible.orderRevision !== record.expectedRevision ||
          eligible.intentCount !== record.intentCount ||
          eligible.intentDigest !== record.intentDigest
        )
          this.fail();
        const owner = await this.invoke(
          request,
          target,
          "/orders/" + encodeURIComponent(record.code) + "/notifications/retry",
          "POST",
          {
            kind: record.kind,
            expectedRevision: record.expectedRevision,
            confirmed: true,
          },
        );
        if (
          owner.status !== "REQUESTED" ||
          !Array.isArray(owner.outcomes) ||
          owner.outcomes.length < 1 ||
          owner.outcomes.length > eligible.intentCodes.length
        )
          this.fail();
        const returned = owner.outcomes.map((outcome) => outcome?.intentCode);
        if (
          new Set(returned).size !== returned.length ||
          returned.some((code) => !eligible.intentCodes.includes(code)) ||
          owner.outcomes.some(
            (outcome) =>
              typeof outcome.status !== "string" ||
              !outcome.status ||
              outcome.status.length > 64,
          )
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

  /** Inspects current original-intent evidence after uncertainty without claiming command completion or replaying retry. @param {Object} action Owned uncertain action. @param {Object} request Current employee. @param {Object} configuration Effective settings. @returns {Promise<Object>} Inspection-only evidence. */
  reconcile: async function (action, request, configuration) {
    this.authorize(request, configuration, true);
    SERVICE.DefaultCopilotActionExecutionService.assertCurrent(action, request);
    const target = this.target(configuration);
    const record = this.checked(action);
    if (
      !["EXECUTING", "OUTCOME_UNKNOWN"].includes(action.state) ||
      JSON.stringify(action.audit.plan.executionTarget) !==
        JSON.stringify(target)
    )
      this.fail();
    const owner = await this.invoke(
      request,
      target,
      "/orders/" + encodeURIComponent(record.code) + "/notifications/inspect",
      "POST",
      { kind: record.kind },
    );
    const current = CONFIG.get("copilot");
    this.authorize(request, current, true);
    if (
      JSON.stringify(target) !== JSON.stringify(this.target(current)) ||
      owner.orderCode !== record.code ||
      owner.kind !== record.kind ||
      !Number.isSafeInteger(owner.orderRevision) ||
      !Array.isArray(owner.outcomes) ||
      owner.outcomes.length > 200
    )
      this.fail();
    return {
      confirmation:
        SERVICE.DefaultCopilotOrchestrationService.projectConfirmation(action),
      receiptState: "UNCONFIRMED",
      inspection: {
        orderCode: record.code,
        kind: record.kind,
        status:
          typeof owner.status === "string" && owner.status.length <= 64
            ? owner.status
            : "UNCONFIRMED",
        observed: owner.outcomes.filter((outcome) => outcome?.observed === true)
          .length,
      },
    };
  },
};
