/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const crypto = require("node:crypto");
const { isDeepStrictEqual } = require("node:util");
const { CronTime } = require("cron");

/**
 * @module cronjob/service/cronjob/DefaultCronJobScheduleDraftService
 * @description Reviews and inserts inactive schedules from scoped deployment-approved Process targets; never acquires scheduler work.
 * @layer service
 * @owner cronjob
 * @override Preserve exact authority, target allowlists, insert-only intent, strict acknowledgement and non-replaying inspection.
 */
module.exports = {
  /** Rejects with a stable owner status. @param {string} code Status key. @returns {never} Throws. */
  fail: function (code = "ERR_JOB_00009") {
    throw new CLASSES.CronJobError(code);
  },
  /** Requires a verified human and canonical lifecycle permission. @param {Object} request Trusted request. @returns {Object} Exact actor scope. */
  scope: function (request) {
    const auth = request.authData || {};
    const security = SERVICE.DefaultSecuredRequestPipelineService;
    if (
      auth.tokenType !== "access" ||
      auth.principalType !== "human" ||
      auth.isSystem ||
      typeof request.tenant !== "string" ||
      !request.tenant ||
      auth.tenant !== request.tenant ||
      typeof auth.entCode !== "string" ||
      !auth.entCode ||
      typeof auth.loginId !== "string" ||
      !auth.loginId ||
      !security ||
      !security.isPermissionGranted(
        "cronjob.lifecycle.manage",
        security.getGrantedPermissions(request),
        security.getRouteActionAuthorizationConfig(),
      )
    ) {
      this.fail("ERR_JOB_00010");
    }
    return {
      tenantCode: request.tenant,
      enterpriseCode: auth.entCode,
      actor: auth.loginId,
    };
  },
  /** Validates an inert identifier without normalization or truncation. @param {*} value Identifier. @returns {string} Validated identifier. */
  code: function (value) {
    if (
      typeof value !== "string" ||
      !/^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(value)
    )
      this.fail();
    return value;
  },
  /** Hashes an owner-built ordered review projection. @param {Object} value Projection. @returns {string} SHA256 digest. */
  digest: function (value) {
    return crypto
      .createHash("sha256")
      .update(JSON.stringify(value))
      .digest("hex");
  },
  /** Resolves bounded scoped targets, retaining no caller-selected node or handler. @param {Object} scope Verified scope. @returns {Array<Object>} Approved targets. */
  targets: function (scope) {
    const config = CONFIG.get("cronjob")?.scheduleDrafts;
    if (
      config?.enabled !== true ||
      !Array.isArray(config.targets) ||
      config.targets.length > 100
    )
      return [];
    const targets = config.targets.filter(
      (target) =>
        target?.tenantCode === scope.tenantCode &&
        target.enterpriseCode === scope.enterpriseCode,
    );
    const codes = new Set();
    return targets.map((target) => {
      this.code(target.code);
      this.code(target.runOnNode);
      this.code(target.triggerCode);
      if (
        codes.has(target.code) ||
        typeof target.label !== "string" ||
        !target.label.trim() ||
        target.label.length > 160 ||
        !Array.isArray(target.expressions) ||
        !target.expressions.length ||
        target.expressions.length > 24 ||
        new Set(target.expressions).size !== target.expressions.length
      )
        this.fail();
      codes.add(target.code);
      for (const expression of target.expressions) {
        if (
          typeof expression !== "string" ||
          !expression.trim() ||
          expression.length > 120
        )
          this.fail();
        try {
          new CronTime(expression);
        } catch {
          this.fail();
        }
      }
      const context = target.context || {};
      if (
        typeof context !== "object" ||
        Array.isArray(context) ||
        Object.keys(context).length > 16
      )
        this.fail();
      const normalized = {};
      for (const key of Object.keys(context).sort()) {
        const value = context[key];
        if (
          !/^[A-Za-z][A-Za-z0-9]{0,63}$/.test(key) ||
          /^(source|cronJobCode|cronJobTenant|scheduledExpression|firedAt|triggerCode|correlationId|instanceCode|version|tenant|entCode|authData|permissions|token|password|secret|credential)$/i.test(
            key,
          ) ||
          !(
            typeof value === "boolean" ||
            (typeof value === "number" && Number.isFinite(value)) ||
            (typeof value === "string" && value.length <= 256)
          )
        )
          this.fail();
        normalized[key] = value;
      }
      return {
        code: target.code,
        label: target.label,
        runOnNode: target.runOnNode,
        triggerCode: target.triggerCode,
        expressions: [...target.expressions],
        context: normalized,
        ...(target.sourceBinding === undefined
          ? {}
          : {
              sourceBinding: this.sourceBinding(
                target.sourceBinding,
                normalized,
              ),
            }),
      };
    });
  },
  /** Validates an optional source association against immutable approved context; association grants no source access or execution authority. @param {Object} value Deployment source binding. @param {Object} context Approved Process context. @returns {Object} Inert exact association. */
  sourceBinding: function (value, context) {
    if (
      !value ||
      typeof value !== "object" ||
      Array.isArray(value) ||
      Object.keys(value).sort().join() !==
        "moduleName,policyDigest,sourceCode" ||
      typeof value.sourceCode !== "string" ||
      !/^[A-Za-z0-9][A-Za-z0-9._-]{1,127}$/.test(value.sourceCode) ||
      typeof value.policyDigest !== "string" ||
      !/^[a-f0-9]{64}$/.test(value.policyDigest) ||
      context.sourceCode !== value.sourceCode ||
      context.expectedPolicyDigest !== value.policyDigest
    )
      this.fail();
    return {
      moduleName: this.code(value.moduleName),
      sourceCode: value.sourceCode,
      policyDigest: value.policyDigest,
    };
  },
  /** Exposes inert owner presentation and approved choices; disabled deployments return no targets. @param {Object} request Trusted context. @returns {Promise<Object>} Capability envelope. */
  capabilities: async function (request) {
    const scope = this.scope(request);
    const targets = this.targets(scope);
    return {
      code: "SUC_JOB_00000",
      data: {
        version: 1,
        enterpriseCode: scope.enterpriseCode,
        targets: targets.map(({ context, ...target }) => target),
        presentation: CONFIG.get("cronjob")?.scheduleDrafts?.presentation,
        lifecycle: {
          activationEnabled: CONFIG.get("cronjob")?.scheduleDrafts?.activationEnabled === true,
          presentation: CONFIG.get("cronjob")?.scheduleDrafts?.lifecyclePresentation,
        },
      },
    };
  },
  /** Constructs the same review at preview and commit so changed configuration cannot be silently saved. @param {Object} request Trusted context. @returns {Object} Reviewed model and digest. */
  review: function (request) {
    const scope = this.scope(request);
    const body = request.body;
    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body) ||
      Object.keys(body).some(
        (key) =>
          ![
            "code",
            "name",
            "targetCode",
            "expression",
            "reviewDigest",
            "confirmed",
          ].includes(key),
      )
    )
      this.fail();
    const code = this.code(body.code);
    if (
      typeof body.name !== "string" ||
      !body.name.trim() ||
      body.name.length > 160
    )
      this.fail();
    const target = this.targets(scope).find(
      (item) => item.code === body.targetCode,
    );
    if (!target || !target.expressions.includes(body.expression)) this.fail();
    const reviewed = {
      scope,
      code,
      name: body.name.trim(),
      target,
      expression: body.expression,
    };
    const reviewDigest = this.digest(reviewed);
    const model = {
      code,
      name: reviewed.name,
      active: false,
      runOnInit: false,
      runOnNode: target.runOnNode,
      trigger: { expression: body.expression },
      state: "NEW",
      status: "NEW",
      priority: 0,
      jobDetail: {
        processTrigger: {
          triggerCode: target.triggerCode,
          context: target.context,
        },
        scheduleDraft: {
          version: 1,
          ...scope,
          targetCode: target.code,
          reviewDigest,
        },
      },
    };
    model.jobDetail.scheduleDraft.definitionDigest =
      this.definitionDigest(model);
    return {
      model,
      data: {
        version: 1,
        enterpriseCode: scope.enterpriseCode,
        code,
        name: reviewed.name,
        targetCode: target.code,
        targetLabel: target.label,
        expression: body.expression,
        triggerCode: target.triggerCode,
        runOnNode: target.runOnNode,
        reviewDigest,
        active: false,
        runOnInit: false,
        ...(target.sourceBinding
          ? { sourceBinding: target.sourceBinding }
          : {}),
      },
    };
  },
  /** Binds the original inactive definition independently of later target configuration. @param {Object} row Persisted definition. @returns {string} Fingerprint. */
  definitionDigest: function (row) {
    return this.digest({
      code: row.code,
      name: row.name,
      active: row.active,
      runOnInit: row.runOnInit,
      runOnNode: row.runOnNode,
      trigger: row.trigger,
      state: row.state,
      status: row.status,
      priority: row.priority,
      processTrigger: row.jobDetail?.processTrigger,
    });
  },
  /** Performs a non-mutating review. @param {Object} request Trusted context. @returns {Promise<Object>} Review envelope. */
  preview: async function (request) {
    return { code: "SUC_JOB_00000", data: this.review(request).data };
  },
  /** Rejects contradictory generated acknowledgements before interpreting records. @param {*} response Generated response. @returns {*} Result payload. */
  result: function (response) {
    if (
      !/^SUC_/.test(response?.code || "") ||
      [response, response?.result].some(
        (value) =>
          !value ||
          value.error ||
          value.success === false ||
          value.acknowledged === false ||
          (value.errors !== undefined &&
            (!Array.isArray(value.errors) || value.errors.length)),
      )
    )
      this.fail("ERR_JOB_00011");
    return response.result;
  },
  /** Saves once using insert-only semantics and never activates, retries or fabricates an acknowledgement. @param {Object} request Trusted context. @returns {Promise<Object>} Confirmed inactive draft receipt. */
  create: async function (request) {
    const { model, data } = this.review(request);
    if (
      request.body.confirmed !== true ||
      request.body.reviewDigest !== data.reviewDigest
    )
      this.fail();
    if (!SERVICE.DefaultCronJobService?.save) this.fail("ERR_JOB_00002");
    try {
      const payload = this.result(
        await SERVICE.DefaultCronJobService.save({
          tenant: request.tenant,
          authData: request.authData,
          options: { insertOnly: true },
          model: { ...structuredClone(model), start: new Date() },
        }),
      );
      const row =
        Array.isArray(payload) && payload.length === 1 ? payload[0] : payload;
      this.result({ code: "SUC_JOB_00000", result: row });
      if (
        !row ||
        typeof row !== "object" ||
        Array.isArray(row) ||
        !Object.entries(model).every(([key, value]) =>
          isDeepStrictEqual(row[key], value),
        )
      )
        this.fail("ERR_JOB_00011");
      return {
        code: "SUC_JOB_00000",
        data: { ...data, outcome: "SAVED_INACTIVE" },
      };
    } catch {
      this.fail("ERR_JOB_00011");
    }
  },
  /** Inspects only the original actor-scoped receipt, even after provisioning is disabled; absence never authorizes replay. @param {Object} request Trusted context. @returns {Promise<Object>} Inactive confirmation or unresolved outcome. */
  inspect: async function (request) {
    const scope = this.scope(request);
    const body = request.body;
    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body) ||
      Object.keys(body).some((key) => !["code", "reviewDigest"].includes(key))
    )
      this.fail();
    const code = this.code(body.code);
    if (
      typeof body.reviewDigest !== "string" ||
      !/^[a-f0-9]{64}$/.test(body.reviewDigest)
    )
      this.fail();
    const query = {
      code,
      "jobDetail.scheduleDraft.version": 1,
      "jobDetail.scheduleDraft.reviewDigest": body.reviewDigest,
    };
    for (const [key, value] of Object.entries(scope))
      query[`jobDetail.scheduleDraft.${key}`] = value;
    let rows;
    try {
      rows = this.result(
        await SERVICE.DefaultCronJobService.get({
          tenant: request.tenant,
          authData: request.authData,
          query,
          options: { skipItemCache: true },
          searchOptions: { pageNumber: 1, pageSize: 2 },
        }),
      );
    } catch {
      this.fail("ERR_JOB_00011");
    }
    if (!Array.isArray(rows) || rows.length > 1) this.fail("ERR_JOB_00011");
    const row = rows[0];
    const receipt = row?.jobDetail?.scheduleDraft;
    const matches =
      row?.code === code &&
      receipt?.version === 1 &&
      receipt.reviewDigest === body.reviewDigest &&
      Object.entries(scope).every(([key, value]) => receipt[key] === value) &&
      Object.keys(row.jobDetail).length === 2 &&
      receipt.definitionDigest === this.definitionDigest(row);
    if (row) this.result({ code: "SUC_JOB_00000", result: row });
    return {
      code: "SUC_JOB_00000",
      data: {
        version: 1,
        enterpriseCode: scope.enterpriseCode,
        code,
        reviewDigest: body.reviewDigest,
        outcome:
          matches &&
          row.active === false &&
          row.runOnInit === false &&
          row.state === "NEW"
            ? "SAVED_INACTIVE"
            : "OUTCOME_UNKNOWN",
      },
    };
  },
};
