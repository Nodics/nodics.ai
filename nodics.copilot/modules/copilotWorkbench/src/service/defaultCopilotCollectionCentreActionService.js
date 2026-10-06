/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const crypto = require("node:crypto");

/** @module copilotWorkbench/service/DefaultCopilotCollectionCentreActionService
 * @description Prepares explicit collection-point records and delegates confirmed commands to Waste using the original employee credential.
 * @layer service @owner copilotWorkbench
 * @override Preserve canonical references, current enterprise, full-field review, immutable target, owner validation and no uncertain replay.
 */
module.exports = {
  /** Recognizes the bounded explicit command without interpreting reference content as authority. @param {string} message Human input. @returns {Object|null} Command or no match. */
  parseIntent: function (message) {
    if (typeof message !== "string" || message.length > 32768) return null;
    try {
      const body = JSON.parse(
        message.trim().replace(/^```json\s*([\s\S]*?)\s*```$/i, "$1"),
      );
      return body?.operation === "waste.collectionCentre.create" ? body : null;
    } catch {
      return null;
    }
  },
  /** Requires independent preparation/execution authority in an employee enterprise context. @param {Object} request Trusted request. @param {Object} configuration Effective configuration. @param {boolean} execute Execution phase. @returns {Object} Trusted scope. */
  authorize: function (request, configuration, execute = false) {
    const context = SERVICE.DefaultCopilotOrchestrationService.securityContext(
      request,
      configuration,
    );
    if (
      context.channel !== "EMPLOYEE" ||
      !context.tenant ||
      context.tenant !== request.tenant ||
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
    SERVICE.DefaultCopilotOrchestrationService.employeeExecutionHeaders(
      request,
    );
    return context;
  },
  /** Binds Waste routing; original inspection ignores only new-write admission. @param {Object} configuration Effective configuration. @param {boolean} inspection Internal original-receipt read only. @returns {Object} Reviewed routing. */
  target: function (configuration, inspection = false) {
    const target = configuration.workbench?.collectionCentreTarget;
    if (
      (!inspection && target?.enabled !== true) ||
      target?.moduleName !== "wasteCollection" ||
      typeof target.connectionName !== "string" ||
      !/^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(target.connectionName)
    )
      throw new CLASSES.NodicsError("ERR_CPW_00005");
    return {
      moduleName: target.moduleName,
      connectionName: target.connectionName,
      targetAuthority: structuredClone(target.targetAuthority || null),
    };
  },
  /** Validates the bounded command and all nested fields without inventing business values. @param {Object} body Human command. @param {Object} context Trusted scope. @returns {Object} Clarification or normalized records. */
  input: function (body, context) {
    const fail = () => {
      throw new CLASSES.NodicsError("ERR_CPW_00004");
    };
    const object = (value) =>
      value && typeof value === "object" && !Array.isArray(value);
    const code = (value) =>
      typeof value === "string" &&
      /^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(value);
    if (
      !object(body) ||
      body.operation !== "waste.collectionCentre.create" ||
      Object.keys(body).some((key) => !["operation", "centres"].includes(key))
    )
      fail();
    if (body.centres === undefined)
      return { state: "CLARIFICATION_REQUIRED", missing: ["centres"] };
    if (
      !Array.isArray(body.centres) ||
      !body.centres.length ||
      body.centres.length > 20
    )
      fail();
    const required = [
      "code",
      "name",
      "collectionPointType",
      "locationRef",
      "operatorEnterpriseRef",
      "operatingStatus",
      "publicVisibility",
      "status",
    ];
    const missing = [];
    const records = body.centres.map((record, index) => {
      if (
        !object(record) ||
        Object.keys(record).some(
          (key) => ![...required, "revision"].includes(key),
        )
      )
        fail();
      for (const key of required)
        if (
          record[key] === undefined ||
          record[key] === null ||
          record[key] === ""
        )
          missing.push("centres." + index + "." + key);
      if (missing.some((key) => key.startsWith("centres." + index + ".")))
        return null;
      if (
        !code(record.code) ||
        !code(record.collectionPointType) ||
        !object(record.name) ||
        !Object.keys(record.name).length ||
        Object.keys(record.name).length > 10 ||
        Object.entries(record.name).some(
          ([locale, value]) =>
            !/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8}){0,2}$/.test(locale) ||
            typeof value !== "string" ||
            !value.trim() ||
            value.length > 256 ||
            /[\u0000-\u001f]/.test(value),
        ) ||
        ![
          "ACTIVE",
          "TEMPORARILY_CLOSED",
          "FULL",
          "MAINTENANCE",
          "INACTIVE",
        ].includes(record.operatingStatus) ||
        !["PRIVATE", "BACKOFFICE", "AUTHENTICATED", "PUBLIC"].includes(
          record.publicVisibility,
        ) ||
        !["DRAFT", "ACTIVE", "INACTIVE", "DEPRECATED", "ARCHIVED"].includes(
          record.status,
        ) ||
        (record.revision !== undefined && record.revision !== 0)
      )
        fail();
      for (const [key, module, schema] of [
        ["locationRef", "locationCore", "location"],
        ["operatorEnterpriseRef", "profile", "enterprise"],
      ]) {
        const ref = record[key];
        if (
          !object(ref) ||
          Object.keys(ref).sort().join() !== "code,module,schema" ||
          ref.module !== module ||
          ref.schema !== schema ||
          !code(ref.code)
        )
          fail();
      }
      if (record.operatorEnterpriseRef.code !== context.enterprise)
        throw new CLASSES.NodicsError("ERR_CPW_00002");
      return {
        code: record.code,
        name: Object.fromEntries(
          Object.entries(record.name).sort(([a], [b]) => a.localeCompare(b)),
        ),
        collectionPointType: record.collectionPointType,
        locationRef: {
          module: "locationCore",
          schema: "location",
          code: record.locationRef.code,
        },
        operatorEnterpriseRef: {
          module: "profile",
          schema: "enterprise",
          code: record.operatorEnterpriseRef.code,
        },
        operatingStatus: record.operatingStatus,
        publicVisibility: record.publicVisibility,
        status: record.status,
        revision: 0,
      };
    });
    if (missing.length) return { state: "CLARIFICATION_REQUIRED", missing };
    if (new Set(records.map((record) => record.code)).size !== records.length)
      fail();
    return { records };
  },
  /** Flattens every executed nested field into inert owner-configured review text. @param {Object[]} records Normalized records. @param {Object} configuration Effective owner copy. @returns {Object[]} Review sections. */
  review: function (records, configuration) {
    const copy = configuration.workbench?.collectionCentreReview;
    const text = (value) => {
      if (typeof value !== "string" || !value.trim() || value.length > 160)
        throw new CLASSES.NodicsError("ERR_CPW_00004");
      return value;
    };
    return records.map((record) => ({
      title: text(copy?.title),
      fields: Object.entries(record).flatMap(([key, value]) =>
        typeof value === "object"
          ? Object.entries(value).map(([field, entry]) => ({
              label:
                key === "name"
                  ? text(copy.fields.name) + " (" + field + ")"
                  : text(copy.fields[key + "." + field]),
              value: String(entry),
            }))
          : [{ label: text(copy.fields[key]), value: String(value) }],
      ),
    }));
  },
  /** Persists a digest-bound preview; no Waste records are created during preparation. @param {Object} request Human command. @param {Object} configuration Effective configuration. @returns {Promise<Object>} Review and confirmation. */
  prepare: async function (request, configuration) {
    const context = this.authorize(request, configuration);
    const input = this.input(request.body, context);
    if (input.state) return { plan: input };
    const plan = {
      id: "collection-plan-" + crypto.randomUUID(),
      state: "VALIDATED",
      schema: "wasteCollectionPoint",
      records: input.records,
      relatedRecords: {},
      executionTarget: this.target(configuration),
      preview: {
        summary:
          "Create " +
          input.records.length +
          " collection centres in the current enterprise. Waste validates each record at execution; no locations or enterprises are created.",
        validation: "WASTE_VALIDATES_AT_EXECUTION",
        review: this.review(input.records, configuration),
      },
    };
    return SERVICE.DefaultCopilotWorkbenchService.persistPrepared(
      plan,
      "waste.collectionCentre.create",
      request,
      context,
    );
  },
  /** Performs one owner API create and rejects contradictory or mismatched acknowledgements. @param {Object} row Reviewed row. @param {string} key Idempotency key. @param {Object} target Reviewed routing. @param {Object} request Employee request. @returns {Promise<Object>} Minimal confirmed result. */
  submit: async function (row, key, target, request) {
    const response =
      await SERVICE.DefaultCopilotOrchestrationService.createOwnedSchemaRecord(
        request,
        target,
        target.moduleName,
        row.schema,
        row.record,
        key,
      );
    if (
      !SERVICE.DefaultCopilotActionExecutionService.persisted(
        response,
        row.record.code,
      )
    )
      throw new CLASSES.NodicsError("ERR_CPW_00003");
    return {
      code: "SUC_COPILOT_DOMAIN",
      result: { code: row.record.code },
    };
  },
  /** Revalidates immutable shape, enterprise and target before the existing atomic executor. @param {Object} action Owned action. @param {Object} request Confirmation command. @param {Object} configuration Current configuration. @returns {Promise<Object>} Per-record outcome. */
  execute: async function (action, request, configuration) {
    const context = this.authorize(request, configuration, true);
    const target = this.target(configuration);
    const plan = action.audit?.plan;
    if (
      action.capability !== "waste.collectionCentre.create" ||
      plan?.schema !== "wasteCollectionPoint" ||
      Object.keys(plan.relatedRecords || {}).length ||
      JSON.stringify(target) !== JSON.stringify(plan.executionTarget)
    )
      throw new CLASSES.NodicsError("ERR_CPW_00004");
    const checked = this.input(
      { operation: action.capability, centres: plan.records },
      context,
    );
    if (
      checked.state ||
      JSON.stringify(checked.records) !== JSON.stringify(plan.records)
    )
      throw new CLASSES.NodicsError("ERR_CPW_00004");
    return SERVICE.DefaultCopilotActionExecutionService.execute(
      action,
      request,
      context,
      request,
      (row, key) => {
        const current = CONFIG.get("copilot");
        const fresh = this.authorize(request, current, true);
        this.input(
          { operation: action.capability, centres: [row.record] },
          fresh,
        );
        if (JSON.stringify(this.target(current)) !== JSON.stringify(target))
          throw new CLASSES.NodicsError("ERR_CPW_00004");
        return this.submit(row, key, target, request);
      },
      SERVICE.DefaultCopilotPolicyService,
    );
  },
};
