/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";

/** @module copilotWorkbench/service/DefaultCopilotActionExecutionService @description Claims one approved synchronous action through generated persistence and retains bounded row outcomes without retrying uncertain domain writes. @layer service @owner copilotWorkbench @override Later implementations must preserve CAS, caller identity, immutable approval and owning-domain execution. Not a workflow engine or compensation owner. */
module.exports = {
  /** Flattens one immutable plan and rejects duplicate or unbounded command identities. @param {Object} plan Reviewed plan. @returns {Object[]} Ordered native rows. */
  rows: function (plan) {
    if (!Array.isArray(plan?.records))
      throw new CLASSES.NodicsError("ERR_CPW_00004");
    const rows = plan.records.map((record) => ({
      schema: plan.schema,
      record,
    }));
    for (const group of Object.values(plan.relatedRecords || {})) {
      if (!Array.isArray(group?.records))
        throw new CLASSES.NodicsError("ERR_CPW_00004");
      rows.push(
        ...group.records.map((record) => ({ schema: group.schema, record })),
      );
    }
    if (
      !rows.length ||
      rows.length > 200 ||
      rows.some(
        (row) =>
          typeof row.schema !== "string" ||
          typeof row.record?.code !== "string",
      ) ||
      new Set(rows.map((row) => JSON.stringify([row.schema, row.record.code])))
        .size !== rows.length
    )
      throw new CLASSES.NodicsError("ERR_CPW_00004");
    return rows;
  },
  /** Rejects a stale client revision or digest before any transition. @param {Object} action Owned action. @param {Object} input Client intent. @returns {true} Valid current intent. */
  assertCurrent: function (action, input) {
    if (
      !action.audit ||
      !Number.isSafeInteger(input.expectedRevision) ||
      input.expectedRevision !== action.audit.revision ||
      input.argumentsDigest !== action.audit.challenge.planDigest
    )
      throw new CLASSES.NodicsError("ERR_CPW_00001");
    return true;
  },
  /** Atomically persists state, revision and audit through the generated owner; ambiguous acknowledgement never authorizes execution. @param {Object} action Current action. @param {string} state Next action state. @param {Object} patch Audit delta. @param {Object} request Trusted API request. @returns {Promise<Object>} Updated action. */
  transition: async function (action, state, patch, request) {
    const auth = request.authData || {};
    if (
      !action.enterpriseCode ||
      action.enterpriseCode !== (auth.enterpriseCode || auth.entCode) ||
      action.tenantCode !== request.tenant ||
      action.principalCode !== auth.loginId ||
      !Number.isSafeInteger(action.audit.revision)
    )
      throw new CLASSES.NodicsError("ERR_CPW_00002");
    const audit = {
      ...action.audit,
      ...patch,
      revision: action.audit.revision + 1,
    };
    const next = { state, audit, updatedAt: new Date() };
    let response;
    try {
      response = await SERVICE.DefaultCopilotActionService.update({
        tenant: request.tenant,
        authData: request.authData,
        query: {
          code: action.code,
          tenantCode: action.tenantCode,
          enterpriseCode: action.enterpriseCode,
          principalCode: action.principalCode,
          state: action.state,
          "audit.revision": action.audit.revision,
        },
        model: next,
      });
    } catch (error) {
      throw new CLASSES.NodicsError("ERR_CPW_00003");
    }
    const result = response && response.result;
    if (
      !response ||
      !/^SUC_/u.test(response.code || "") ||
      response.error ||
      response.success === false ||
      response.acknowledged === false ||
      (response.errors !== undefined &&
        (!Array.isArray(response.errors) || response.errors.length)) ||
      !result ||
      result.error ||
      result.success === false ||
      result.acknowledged === false ||
      (result.errors !== undefined &&
        (!Array.isArray(result.errors) || result.errors.length)) ||
      !(
        result.matchedCount === 1 ||
        (result.matchedCount === undefined && result.modifiedCount === 1)
      )
    )
      throw new CLASSES.NodicsError("ERR_CPW_00001");
    return { ...action, ...next };
  },
  /** Accepts only one explicitly persisted domain record matching the requested identity. @param {Object} response Owning API envelope. @param {string} code Expected record code. @returns {boolean} Confirmed record result. */
  persisted: function (response, code) {
    if (
      !response ||
      !/^SUC_/u.test(response.code || "") ||
      response.error ||
      response.success === false ||
      response.acknowledged === false ||
      (response.errors !== undefined &&
        (!Array.isArray(response.errors) || response.errors.length))
    )
      return false;
    const result = response.result;
    const records = Array.isArray(result)
      ? result
      : result && typeof result === "object"
        ? [result]
        : [];
    return (
      records.length === 1 &&
      records[0]?.code === code &&
      !records[0].error &&
      records[0].success !== false &&
      records[0].acknowledged !== false &&
      (records[0].errors === undefined ||
        (Array.isArray(records[0].errors) && records[0].errors.length === 0))
    );
  },
  /** Executes ordered primary/related rows after a single atomic claim, retaining uncertain outcomes and stopping subsequent writes. @param {Object} action Owned approved action. @param {Object} input Revision/digest intent. @param {Object} context Current policy context. @param {Object} request Trusted API request. @param {Function} submit Owning domain submitter. @param {Object} policy Canonical policy owner. @returns {Promise<Object>} Safe execution outcome. */
  execute: async function (action, input, context, request, submit, policy) {
    this.assertCurrent(action, input);
    if (action.state !== "APPROVED")
      throw new CLASSES.NodicsError("ERR_CPW_00001");
    const plan = action.audit.plan;
    policy.authorizeExecution(action.audit.challenge, context, plan);
    if (!plan || plan.state !== "VALIDATED" || typeof submit !== "function")
      throw new CLASSES.NodicsError("ERR_CPW_00004");
    const rows = this.rows(plan);
    let results = rows.map((row, index) => ({
      index,
      schema: row.schema,
      code: row.record.code,
      state: "NOT_STARTED",
    }));
    if (action.audit.continuation) {
      if (
        action.audit.continuation.planDigest !== input.argumentsDigest ||
        !Array.isArray(action.audit.rows) ||
        action.audit.rows.length !== rows.length ||
        action.audit.rows.some(
          (row, index) =>
            row.index !== index ||
            row.schema !== rows[index].schema ||
            row.code !== rows[index].record.code ||
            !["COMPLETED", "NOT_STARTED"].includes(row.state),
        ) ||
        !action.audit.rows.some((row) => row.state === "NOT_STARTED")
      )
        throw new CLASSES.NodicsError("ERR_CPW_00004");
      results = structuredClone(action.audit.rows);
    } else if (action.audit.rows?.length)
      throw new CLASSES.NodicsError("ERR_CPW_00004");
    let current = await this.transition(
      action,
      "EXECUTING",
      {
        rows: structuredClone(results),
        startedAt: new Date().toISOString(),
      },
      request,
    );
    for (const [index, row] of rows.entries()) {
      if (results[index].state === "COMPLETED") continue;
      results[index].state = "RUNNING";
      current = await this.transition(
        current,
        "EXECUTING",
        { rows: structuredClone(results) },
        request,
      );
      let confirmed = false;
      try {
        const response = await submit(
          row,
          plan.id + ":" + row.schema + ":" + row.record.code,
        );
        confirmed = this.persisted(response, row.record.code);
      } catch (error) {
        /* A rejected transport promise does not establish whether the domain committed. */
      }
      results[index].state = confirmed ? "COMPLETED" : "OUTCOME_UNKNOWN";
      if (!confirmed) {
        current = await this.transition(
          current,
          "OUTCOME_UNKNOWN",
          {
            rows: structuredClone(results),
            stoppedAt: new Date().toISOString(),
          },
          request,
        );
        return {
          actionCode: action.code,
          state: "OUTCOME_UNKNOWN",
          revision: current.audit.revision,
          rows: results,
        };
      }
      current = await this.transition(
        current,
        "EXECUTING",
        { rows: structuredClone(results) },
        request,
      );
    }
    current = await this.transition(
      current,
      "EXECUTED",
      {
        rows: structuredClone(results),
        executedAt: new Date().toISOString(),
        result:
          plan.schema === "product"
            ? {
                recordsCreated: rows.length,
                productsCreated: plan.records.length,
              }
            : { operationsCompleted: rows.length },
      },
      request,
    );
    return {
      actionCode: action.code,
      state: "CONSUMED",
      revision: current.audit.revision,
      rows: results,
      result: current.audit.result,
    };
  },
};
