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
/** @module copilotWorkbench/service/DefaultCopilotPriceActionService
 * @description Prepares standalone price rows for existing products through the native Pricing authoring API.
 * @layer service @owner copilotWorkbench
 * @override Preserve decimal strings, complete review, native schema authorization, employee transport and no automatic publication or replay.
 */
module.exports = {
  /** Recognizes only explicit bounded price-row commands. @param {string} message Human input. @returns {Object|null} Typed command. */
  parseIntent: function (message) {
    if (typeof message !== "string" || message.length > 16384) return null;
    try {
      const body = JSON.parse(
        message.trim().replace(/^```json\s*([\s\S]*?)\s*```$/i, "$1"),
      );
      return body?.operation === "commerce.price.create" ? body : null;
    } catch {
      return null;
    }
  },
  /** Uses Pricing routing; original inspection ignores only new-write admission. @param {Object} configuration Effective settings. @param {boolean} inspection Internal original-receipt read only. @returns {Object} Bound native target. */
  target: function (configuration, inspection = false) {
    const target =
      SERVICE.DefaultCopilotOrchestrationService.actionTarget(configuration);
    if (
      (!inspection &&
        configuration.workbench?.standalonePricesEnabled !== true) ||
      typeof target.pricingModule !== "string" ||
      !/^[A-Za-z][A-Za-z0-9._-]{0,63}$/.test(target.pricingModule) ||
      typeof target.connectionName !== "string" ||
      !/^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(target.connectionName)
    )
      throw new CLASSES.NodicsError("ERR_CPW_00005");
    return target;
  },
  /** Requires Copilot authority; Pricing retains schema write, record and authoring-policy checks. @param {Object} request Trusted employee. @param {Object} configuration Effective settings. @param {boolean} execute Execution flag. @returns {Object} Context. */
  authorize: function (request, configuration, execute = false) {
    const context = SERVICE.DefaultCopilotOrchestrationService.securityContext(
      request,
      configuration,
    );
    if (
      context.channel !== "EMPLOYEE" ||
      !context.tenant ||
      !context.enterprise ||
      !context.actor ||
      [
        "copilot.mutation.prepare",
        ...(execute ? ["copilot.mutation.execute"] : []),
      ].some(
        (grant) =>
          !SERVICE.DefaultCopilotPolicyService.hasPermission(context, grant),
      )
    )
      throw new CLASSES.NodicsError("ERR_CPW_00002");
    return context;
  },
  /** Accepts bounded exact decimal strings and references; never guesses money, currency or quantity. @param {Object} body Human command. @returns {Object} Rows or missing fields. */
  input: function (body) {
    const fail = () => {
      throw new CLASSES.NodicsError("ERR_CPW_00004");
    };
    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body) ||
      body.operation !== "commerce.price.create" ||
      Object.keys(body).some((key) => !["operation", "prices"].includes(key))
    )
      fail();
    if (body.prices === undefined)
      return { state: "CLARIFICATION_REQUIRED", missing: ["prices"] };
    if (
      !Array.isArray(body.prices) ||
      !body.prices.length ||
      body.prices.length > 20
    )
      fail();
    const fields = [
      "code",
      "priceBookCode",
      "productCode",
      "unitAmount",
      "currency",
      "minQuantity",
    ];
    const missing = [];
    const records = body.prices.map((row, index) => {
      if (
        !row ||
        typeof row !== "object" ||
        Array.isArray(row) ||
        Object.keys(row).some((key) => !fields.includes(key))
      )
        fail();
      fields.forEach((key) => {
        if (row[key] === undefined || row[key] === "")
          missing.push("prices." + index + "." + key);
      });
      for (const key of fields) {
        if (row[key] === undefined || row[key] === "") continue;
        if (typeof row[key] !== "string" || row[key].length > 128) fail();
        if (
          ["code", "priceBookCode", "productCode"].includes(key) &&
          !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(row[key])
        )
          fail();
        if (key === "currency" && !/^[A-Z]{3}$/.test(row[key])) fail();
        if (
          ["unitAmount", "minQuantity"].includes(key) &&
          (!/^\d{1,24}(?:\.\d{1,12})?$/.test(row[key]) ||
            (key === "minQuantity" && !/[1-9]/.test(row[key])))
        )
          fail();
      }
      return {
        code: row.code,
        priceBookCode: row.priceBookCode,
        productCode: row.productCode,
        unitAmount: row.unitAmount,
        currency: row.currency,
        minQuantity: row.minQuantity,
        revision: 1,
      };
    });
    if (missing.length) return { state: "CLARIFICATION_REQUIRED", missing };
    if (new Set(records.map((row) => row.code)).size !== records.length) fail();
    return { records };
  },
  /** Saves only the reviewed proposal, with every executed field visible. @param {Object} request Human command. @param {Object} configuration Effective settings. @returns {Promise<Object>} Review or clarification. */
  prepare: async function (request, configuration) {
    const context = this.authorize(request, configuration),
      target = this.target(configuration);
    const input = this.input(request.body);
    if (input.state) return { plan: input };
    SERVICE.DefaultCopilotOrchestrationService.employeeExecutionHeaders(
      request,
    );
    const plan = {
      id: "price-plan-" + crypto.randomUUID(),
      state: "VALIDATED",
      schema: "priceRow",
      records: input.records,
      relatedRecords: {},
      executionTarget: target,
      preview: {
        summary:
          "Create " +
          input.records.length +
          " price rows using the supplied product and price-book identifiers. Reference existence has not been verified. Pricing enforces native schema permissions and authoring policy at execution. This does not create products, activate price books or publish prices.",
      },
    };
    plan.preview.review =
      SERVICE.DefaultCopilotWorkbenchService.buildReview(plan);
    return SERVICE.DefaultCopilotWorkbenchService.persistPrepared(
      plan,
      "commerce.price.create",
      request,
      context,
    );
  },
  /** Revalidates the complete reviewed plan and uses the existing atomic executor. @param {Object} action Owned action. @param {Object} request Confirmation command. @param {Object} configuration Effective settings. @returns {Promise<Object>} Row outcomes. */
  execute: async function (action, request, configuration) {
    const context = this.authorize(request, configuration, true),
      target = this.target(configuration),
      plan = action.audit?.plan;
    if (
      action.capability !== "commerce.price.create" ||
      plan?.schema !== "priceRow" ||
      !Array.isArray(plan.records) ||
      Object.keys(plan.relatedRecords || {}).length ||
      JSON.stringify(target) !== JSON.stringify(plan.executionTarget)
    )
      throw new CLASSES.NodicsError("ERR_CPW_00004");
    const checked = this.input({
      operation: action.capability,
      prices: plan.records.map(
        ({
          code,
          priceBookCode,
          productCode,
          unitAmount,
          currency,
          minQuantity,
        }) => ({
          code,
          priceBookCode,
          productCode,
          unitAmount,
          currency,
          minQuantity,
        }),
      ),
    });
    if (JSON.stringify(checked.records) !== JSON.stringify(plan.records))
      throw new CLASSES.NodicsError("ERR_CPW_00004");
    const core = SERVICE.DefaultCopilotOrchestrationService;
    core.employeeExecutionHeaders(request);
    return SERVICE.DefaultCopilotActionExecutionService.execute(
      action,
      request,
      context,
      request,
      (row, key) => {
        const current = CONFIG.get("copilot");
        this.authorize(request, current, true);
        if (JSON.stringify(this.target(current)) !== JSON.stringify(target))
          throw new CLASSES.NodicsError("ERR_CPW_00004");
        return core.createOwnedSchemaRecord(
          request,
          target,
          target.pricingModule,
          row.schema,
          row.record,
          key,
        );
      },
      SERVICE.DefaultCopilotPolicyService,
    );
  },
};
