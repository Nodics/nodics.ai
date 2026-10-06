/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module copilotWorkbench/service/DefaultCopilotActionRecoveryService
 * @description Reconciles exact original native receipts and renews approval only for rows never dispatched.
 * @layer service @owner copilotWorkbench
 * @override Preserve current employee/domain access, immutable plan/target, revision CAS and no replay of uncertain or completed rows.
 */
module.exports = {
  /** Emits a content-free original-result failure. @returns {never} Throws. */
  fail: function () {
    throw new CLASSES.NodicsError("ERR_CPW_00003");
  },
  /** Restores the latest owned action from private authoritative persistence after conversation reload. @param {Object} request Already-owned conversation request. @returns {Promise<Object[]>} Bounded current confirmation. */
  history: async function (request) {
    const core = SERVICE.DefaultCopilotOrchestrationService;
    const configuration = core.configuration();
    const context = core.securityContext(request, configuration);
    if (
      configuration.workbench?.receiptRecovery?.enabled !== true ||
      context.channel !== "EMPLOYEE" ||
      !SERVICE.DefaultCopilotPolicyService.hasPermission(
        context,
        "copilot.mutation.reconcile",
      )
    )
      return [];
    if (
      !context.tenant ||
      !context.enterprise ||
      !context.actor ||
      typeof request.conversationCode !== "string" ||
      !request.conversationCode
    )
      this.fail();
    const query = {
      tenantCode: context.tenant,
      enterpriseCode: context.enterprise,
      principalCode: context.actor,
      conversationCode: request.conversationCode,
    };
    const response = await SERVICE.DefaultCopilotActionService.get({
      tenant: request.tenant,
      authData: request.authData,
      query,
      options: { skipItemCache: true },
      searchOptions: { pageSize: 1, pageNumber: 1, sort: { updatedAt: -1 } },
    });
    const values = SERVICE.DefaultModelCommandReceiptService.result(response);
    if (
      !Array.isArray(values) ||
      values.length > 1 ||
      values.some((action) =>
        Object.entries(query).some(([key, value]) => action[key] !== value),
      )
    )
      this.fail();
    const freshConfiguration = core.configuration();
    const freshContext = core.securityContext(request, freshConfiguration);
    if (
      freshConfiguration.workbench?.receiptRecovery?.enabled !== true ||
      !SERVICE.DefaultCopilotPolicyService.hasPermission(
        freshContext,
        "copilot.mutation.reconcile",
      ) ||
      JSON.stringify(freshContext) !== JSON.stringify(context)
    )
      this.fail();
    return values.map((action) => core.projectConfirmation(action, request));
  },
  /** Requires independently granted reconciliation and the current preparation/execution scope. @param {Object} request Trusted employee. @param {Object} action Owned action. @returns {Object} Current configuration and context. */
  authorize: function (request, action) {
    const core = SERVICE.DefaultCopilotOrchestrationService;
    const configuration = core.configuration();
    core.assertEnabled(configuration);
    const context = core.securityContext(request, configuration);
    const policy = SERVICE.DefaultCopilotPolicyService;
    if (
      configuration.workbench?.receiptRecovery?.enabled !== true ||
      context.channel !== "EMPLOYEE" ||
      action.tenantCode !== context.tenant ||
      action.enterpriseCode !== context.enterprise ||
      action.principalCode !== context.actor ||
      ![
        "copilot.mutation.prepare",
        "copilot.mutation.execute",
        "copilot.mutation.reconcile",
      ].every((grant) => policy.hasPermission(context, grant)) ||
      action.audit?.challenge?.planDigest !==
        policy.planDigest(action.audit?.plan)
    )
      this.fail();
    return { configuration, context };
  },
  /** Builds only fixed native inspection routes from the original immutable target and row. @param {Object} request Trusted employee. @param {Object} action Owned action. @param {Object} row Original plan row. @param {Object} configuration Current configuration. @returns {Object} Native transport and expected receipt binding. */
  target: function (request, action, row, configuration) {
    const core = SERVICE.DefaultCopilotOrchestrationService;
    const key = action.audit.plan.id + ":" + row.schema + ":" + row.record.code;
    let target,
      moduleName,
      operation,
      input,
      body,
      apiName,
      expectedResultIdentity;
    if (/^data\.record\.(create|update|delete)$/.test(action.capability)) {
      const owner = SERVICE.DefaultCopilotSchemaActionService;
      const context = owner.authorize(request, configuration, true);
      const record = owner.checked(action);
      if (
        row.schema !== "governedSchemaAction" ||
        row.record.code !== record.code
      )
        this.fail();
      owner.settings(configuration, record.sourceCode, record.schemaName);
      const database = SERVICE.DefaultCopilotDatabaseSourceService;
      const source = database.authorize(
        {
          ...request,
          sourceCode: record.sourceCode,
          securityContext: context,
        },
        configuration,
      );
      if (
        source.code !== record.sourceCode ||
        source.module !== record.moduleName ||
        source.sourcePolicyDigest !== record.sourcePolicyDigest ||
        !database.selected(source, record.schemaName)
      )
        this.fail();
      target = {
        sourceCode: record.sourceCode,
        sourcePolicyDigest: record.sourcePolicyDigest,
        moduleName: record.moduleName,
      };
      moduleName = record.moduleName;
      const kind = owner.declaration(action.capability).kind;
      operation = record.schemaName + "." + kind;
      input = record.receiptInput;
      body = {
        operation: kind,
        input: record.receiptInput,
        idempotencyKey: key,
      };
      apiName = "/" + record.schemaName.toLowerCase() + "/commands/inspect";
      expectedResultIdentity =
        kind === "create"
          ? record.code
          : kind +
            ":" +
            SERVICE.DefaultModelCommandReceiptService.digest(
              record.receiptInput.query,
            );
      input = record.receiptInput;
    } else if (
      ["commerce.product.create", "commerce.price.create"].includes(
        action.capability,
      )
    ) {
      const standalone = action.capability === "commerce.price.create";
      if (standalone)
        SERVICE.DefaultCopilotPriceActionService.authorize(
          request,
          configuration,
          true,
        );
      target = standalone
        ? SERVICE.DefaultCopilotPriceActionService.target(configuration, true)
        : core.actionTarget(configuration);
      if (
        !["product", "priceRow"].includes(row.schema) ||
        !target.connectionName ||
        (!standalone && !target.productModule) ||
        (standalone && row.schema !== "priceRow") ||
        !target.pricingModule
      )
        this.fail();
      moduleName =
        row.schema === "product" ? target.productModule : target.pricingModule;
      operation = row.schema + ".create";
      input = row.record;
      body = { model: row.record, idempotencyKey: key };
      apiName = "/" + row.schema.toLowerCase() + "/commands/inspect";
    } else if (/^process\.(definition|instance)\./.test(action.capability)) {
      const owner = SERVICE.DefaultCopilotProcessLifecycleActionService;
      owner.authorize(request, configuration, action.capability, true);
      const declaration = owner.declaration(action.capability);
      const requiredRead =
        declaration.family === "definition"
          ? "process.definition.read"
          : "process.backoffice.view";
      if (
        !SERVICE.DefaultCopilotPolicyService.hasPermission(
          core.securityContext(request, configuration),
          requiredRead,
        )
      )
        this.fail();
      target = owner.target(configuration, true);
      moduleName = "workflow";
      const command = owner.checked(action);
      const schema =
        "process" +
        declaration.family[0].toUpperCase() +
        declaration.family.slice(1);
      if (row.schema !== schema || row.record.code !== command.code)
        this.fail();
      operation = declaration.family + "." + declaration.kind;
      input = {
        [declaration.family + "Code"]: command.code,
        body: command.body,
      };
      body = { command: command.body, idempotencyKey: key };
      apiName =
        "/" +
        declaration.family +
        "s/" +
        encodeURIComponent(command.code) +
        "/commands/" +
        declaration.kind +
        "/receipt/query";
    } else if (
      [
        "process.task.claim",
        "process.task.assign",
        "process.task.complete",
        "process.task.cancel",
      ].includes(action.capability)
    ) {
      const owner = SERVICE.DefaultCopilotProcessTaskActionService;
      owner.authorize(request, configuration, action.capability, true);
      if (
        !SERVICE.DefaultCopilotPolicyService.hasPermission(
          core.securityContext(request, configuration),
          "process.backoffice.view",
        )
      )
        this.fail();
      target = owner.target(configuration, true);
      moduleName = "workflow";
      input = owner.checked(action);
      if (row.schema !== "processTask" || row.record.code !== input.taskCode)
        this.fail();
      const kind = owner.kind(action.capability);
      operation = "task." + kind;
      body = { command: input.body, idempotencyKey: key };
      apiName =
        "/tasks/" +
        encodeURIComponent(input.taskCode) +
        "/commands/" +
        kind +
        "/receipt/query";
    } else if (
      [
        "process.trigger.create",
        "process.trigger.update",
        "process.trigger.archive",
        "process.trigger.execute",
      ].includes(action.capability)
    ) {
      const owner = SERVICE.DefaultCopilotProcessTriggerActionService;
      owner.authorize(request, configuration, action.capability, true);
      if (
        !SERVICE.DefaultCopilotPolicyService.hasPermission(
          core.securityContext(request, configuration),
          "process.backoffice.view",
        )
      )
        this.fail();
      target = owner.target(configuration, true);
      moduleName = "workflow";
      input = owner.checked(action);
      if (
        row.schema !== "processTrigger" ||
        row.record.code !== input.triggerCode
      )
        this.fail();
      const kind = owner.kind(action.capability);
      operation = "trigger." + kind;
      body = { command: input.body, idempotencyKey: key };
      apiName =
        "/triggers/" +
        encodeURIComponent(input.triggerCode) +
        "/commands/" +
        kind +
        "/receipt/query";
    } else if (action.capability === "waste.collectionCentre.create") {
      const owner = SERVICE.DefaultCopilotCollectionCentreActionService;
      owner.authorize(request, configuration, true);
      target = owner.target(configuration, true);
      moduleName = target.moduleName;
      if (row.schema !== "wasteCollectionPoint") this.fail();
      owner.input(
        { operation: action.capability, centres: [row.record] },
        core.securityContext(request, configuration),
      );
      operation = row.schema + ".create";
      input = row.record;
      body = { model: row.record, idempotencyKey: key };
      apiName = "/wastecollectionpoint/commands/inspect";
    } else if (
      ["profile.enterprise.onboard", "profile.enterprise.invite"].includes(
        action.capability,
      )
    ) {
      const standalone = action.capability === "profile.enterprise.invite";
      const owner = standalone
        ? SERVICE.DefaultCopilotInvitationActionService
        : SERVICE.DefaultCopilotEnterpriseActionService;
      owner.authorize(request, configuration, true);
      target = owner.target(configuration, true);
      moduleName = target.moduleName;
      if (row.schema === "enterprise" && !standalone) {
        operation = "enterprise.create";
        input = row.record;
        body = { model: row.record, idempotencyKey: key };
        apiName = "/enterprises/commands/inspect";
      } else if (row.schema === "enterpriseAccessAssignment") {
        operation = "enterpriseAccessAssignment.invite";
        const command = {
          email: row.record.email,
          roleCode: row.record.roleCode,
          idempotencyKey: key,
        };
        input = { enterpriseCode: row.record.enterpriseCode, body: command };
        body = { command, idempotencyKey: key };
        apiName =
          "/enterprises/" +
          encodeURIComponent(row.record.enterpriseCode) +
          "/access-assignments/commands/inspect";
      } else this.fail();
    } else this.fail();
    if (
      JSON.stringify(target) !==
      JSON.stringify(action.audit.plan.executionTarget)
    )
      this.fail();
    return {
      target,
      moduleName,
      operation,
      input,
      key,
      body,
      apiName,
      ...(typeof expectedResultIdentity === "string"
        ? { expectedResultIdentity }
        : {}),
    };
  },
  /** Accepts only exact actor/intent-bound native completion, never current record existence. @param {Object} response Native envelope. @param {Object} selected Expected operation. @param {Object} action Original action. @returns {boolean} Completed original command. */
  completed: function (response, selected, action) {
    const protocol = SERVICE.DefaultModelCommandReceiptService;
    const receipt = protocol.result({ ...response, result: response?.data });
    const scope = {
      tenantCode: action.tenantCode,
      enterpriseCode: action.enterpriseCode,
      principalCode: action.principalCode,
      moduleName: selected.moduleName,
      operation: selected.operation,
    };
    if (
      receipt.contractVersion !== 1 ||
      Object.entries(scope).some(([key, value]) => receipt[key] !== value) ||
      receipt.commandCode !==
        "command-" + protocol.digest({ scope, key: selected.key }) ||
      receipt.argumentsDigest !== protocol.digest(selected.input) ||
      !["COMPLETED", "OUTCOME_UNKNOWN"].includes(receipt.state)
    )
      this.fail();
    if (receipt.state === "OUTCOME_UNKNOWN") return false;
    if (
      selected.operation !== "enterpriseAccessAssignment.invite" &&
      receipt.resultIdentity !==
        (selected.expectedResultIdentity ||
          (selected.moduleName === "workflow"
            ? selected.operation.startsWith("trigger.")
              ? selected.input.triggerCode
              : selected.operation.startsWith("task.")
                ? selected.input.taskCode
                : selected.input.code
            : selected.input.code))
    )
      this.fail();
    if (
      typeof receipt.resultIdentity !== "string" ||
      !receipt.resultIdentity ||
      receipt.resultIdentity.length > 512 ||
      receipt.resultDigest !==
        protocol.digest({
          argumentsDigest: receipt.argumentsDigest,
          resultIdentity: receipt.resultIdentity,
        })
    )
      this.fail();
    return true;
  },
  /** Reads original receipts, atomically records evidence, and never starts remaining work. @param {Object} action Owned action. @param {Object} request Explicit original inspection. @returns {Promise<Object>} Current confirmation with proven rows. */
  reconcile: async function (action, request) {
    if (action.capability === "commerce.orderNotification.retry")
      return SERVICE.DefaultCopilotOrderNotificationActionService.reconcile(
        action,
        request,
        SERVICE.DefaultCopilotOrchestrationService.configuration(),
      );
    const execution = SERVICE.DefaultCopilotActionExecutionService;
    execution.assertCurrent(action, request);
    if (!["EXECUTING", "OUTCOME_UNKNOWN"].includes(action.state)) this.fail();
    let current = this.authorize(request, action);
    const rows = execution.rows(action.audit.plan);
    const outcomes = structuredClone(action.audit.rows);
    if (
      !Array.isArray(outcomes) ||
      outcomes.length !== rows.length ||
      outcomes.some(
        (item, index) =>
          item.index !== index ||
          item.schema !== rows[index].schema ||
          item.code !== rows[index].record.code ||
          !["COMPLETED", "RUNNING", "OUTCOME_UNKNOWN", "NOT_STARTED"].includes(
            item.state,
          ),
      )
    )
      this.fail();
    const proofs = structuredClone(action.audit.nativeReceipts || {});
    for (const [index, row] of rows.entries()) {
      if (!["RUNNING", "OUTCOME_UNKNOWN"].includes(outcomes[index].state))
        continue;
      current = this.authorize(request, action);
      const selected = this.target(request, action, row, current.configuration);
      const response = await SERVICE.DefaultModuleService.invokeModule({
        ...selected.target,
        moduleName: selected.moduleName,
        tenant: request.tenant,
        local: false,
        methodName: "POST",
        maxAttempts: 1,
        apiName: selected.apiName,
        header:
          SERVICE.DefaultCopilotOrchestrationService.employeeExecutionHeaders(
            request,
          ),
        request: selected.body,
      });
      this.authorize(request, action);
      if (
        JSON.stringify(
          this.target(
            request,
            action,
            row,
            SERVICE.DefaultCopilotOrchestrationService.configuration(),
          ),
        ) !== JSON.stringify(selected)
      )
        this.fail();
      if (this.completed(response, selected, action)) {
        outcomes[index].state = "COMPLETED";
        proofs[index] = {
          commandCode: response.data.commandCode,
          resultDigest: response.data.resultDigest,
        };
      }
    }
    current = this.authorize(request, action);
    const unknown = outcomes.some((row) =>
      ["RUNNING", "OUTCOME_UNKNOWN"].includes(row.state),
    );
    const remaining = outcomes.some((row) => row.state === "NOT_STARTED");
    const state = unknown
      ? "OUTCOME_UNKNOWN"
      : remaining
        ? "AWAITING_CONFIRMATION"
        : "EXECUTED";
    const patch = {
      rows: outcomes,
      nativeReceipts: proofs,
      reconciledAt: new Date().toISOString(),
      ...(!unknown && remaining
        ? {
            challenge: SERVICE.DefaultCopilotPolicyService.createConfirmation(
              action.audit.plan,
              current.context,
            ),
            continuation: { planDigest: action.audit.challenge.planDigest },
          }
        : {}),
      ...(!unknown && !remaining
        ? {
            executedAt: new Date().toISOString(),
            result: { operationsCompleted: outcomes.length },
          }
        : {}),
    };
    const updated = await execution.transition(action, state, patch, request);
    return {
      confirmation:
        SERVICE.DefaultCopilotOrchestrationService.projectConfirmation(
          updated,
          request,
        ),
    };
  },
};
