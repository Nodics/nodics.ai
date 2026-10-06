/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
const commands = new Set();

/** @module cronjob/service/cronjob/DefaultCronJobScheduleLifecycleService
 * @description Reviews, records and inspects explicit lifecycle commands for approved schedule drafts through the existing Cron runtime.
 * @layer service @owner cronjob
 * @override Preserve actor/scope, immutable review, exact CAS, current target qualification and no automatic command replay.
 */
module.exports = {
  /** Resolves the existing draft contract owner. @returns {Object} Owner. */
  drafts: function () {
    return SERVICE.DefaultCronJobScheduleDraftService;
  },
  /** Rejects uncertain or invalid lifecycle evidence with an inert owner status. @returns {never} Throws. */
  fail: function () {
    this.drafts().fail("ERR_JOB_00011");
  },
  /** Reads one actor-owned original draft without cache and rejects broad or forged results. @param {Object} request Trusted request. @returns {Promise<Object>} Private scope and job. */
  read: async function (request) {
    const owner = this.drafts();
    const scope = owner.scope(request);
    const code = owner.code(request.body?.code);
    const rows = owner.result(
      await SERVICE.DefaultCronJobService.get({
        tenant: request.tenant,
        authData: request.authData,
        query: {
          code,
          "jobDetail.scheduleDraft.tenantCode": scope.tenantCode,
          "jobDetail.scheduleDraft.enterpriseCode": scope.enterpriseCode,
          "jobDetail.scheduleDraft.actor": scope.actor,
        },
        options: { skipItemCache: true },
        searchOptions: { pageNumber: 1, pageSize: 2 },
      }),
    );
    if (!Array.isArray(rows) || rows.length !== 1) this.fail();
    const row = rows[0];
    owner.result({ code: "SUC_JOB_00000", result: row });
    const receipt = row.jobDetail?.scheduleDraft;
    if (
      row.code !== code ||
      receipt?.version !== 1 ||
      !/^[a-f0-9]{64}$/.test(receipt.definitionDigest || "") ||
      Object.entries(scope).some(([key, value]) => receipt[key] !== value) ||
      row.runOnInit !== false ||
      row.runOnNode !== CONFIG.get("nodeId") ||
      row.tempNode ||
      Object.keys(row.jobDetail).some(
        (key) =>
          !["processTrigger", "scheduleDraft", "scheduleLifecycle"].includes(
            key,
          ),
      )
    )
      this.fail();
    const lifecycle = row.jobDetail.scheduleLifecycle;
    if (!lifecycle && row.active !== false) this.fail();
    if (
      lifecycle &&
      (!Number.isSafeInteger(lifecycle.revision) ||
        lifecycle.revision < 1 ||
        !["ACTIVATE", "DEACTIVATE"].includes(lifecycle.intent) ||
        lifecycle.actor !== scope.actor ||
        !/^[a-f0-9]{64}$/.test(lifecycle.reviewDigest || ""))
    )
      this.fail();
    if (JSON.stringify(owner.scope(request)) !== JSON.stringify(scope))
      this.fail();
    return { scope, row, lifecycle, revision: lifecycle?.revision || 0 };
  },
  /** Fingerprints definition content independently of runtime state and current lifecycle receipt. @param {Object} row Job. @returns {string} Fingerprint. */
  definitionDigest: function (row) {
    return this.drafts().definitionDigest({
      ...row,
      active: false,
      state: "NEW",
      status: "NEW",
    });
  },
  /** Reviews current configuration and published Process evidence; deactivation does not require the target to remain enabled. @param {Object} request Exact lifecycle review input. @returns {Promise<Object>} Private reviewed selection. */
  prepare: async function (request) {
    const selected = await this.read(request);
    const { row, lifecycle, revision, scope } = selected;
    const intent = request.body?.intent;
    if (
      !["ACTIVATE", "DEACTIVATE"].includes(intent) ||
      request.body.expectedRevision !== revision ||
      (lifecycle &&
        !["ACTIVE", "INACTIVE", "DISPATCHING"].includes(lifecycle.state))
    )
      this.fail();
    let target = null,
      published = null;
    if (intent === "ACTIVATE") {
      if (
        CONFIG.get("cronjob")?.scheduleDrafts?.activationEnabled !== true ||
        row.active !== false ||
        lifecycle?.state === "DISPATCHING" ||
        (row.emails !== undefined &&
          (!Array.isArray(row.emails) || row.emails.length)) ||
        this.definitionDigest(row) !==
          row.jobDetail.scheduleDraft.definitionDigest
      )
        this.fail();
      target = this.drafts()
        .targets(scope)
        .find((item) => item.code === row.jobDetail.scheduleDraft.targetCode);
      if (
        !target ||
        target.runOnNode !== row.runOnNode ||
        !target.expressions.includes(row.trigger?.expression) ||
        target.triggerCode !== row.jobDetail.processTrigger?.triggerCode ||
        JSON.stringify(target.context) !==
          JSON.stringify(row.jobDetail.processTrigger.context)
      )
        this.fail();
      published =
        await SERVICE.DefaultProcessRuntimeLifecycleService.inspectScheduleTrigger(
          request,
          target.triggerCode,
        );
      if (published.cronJobCode && published.cronJobCode !== row.code)
        this.fail();
      await SERVICE.DefaultCronJobService.assertOperational(request.tenant);
    } else if (row.active !== true || !lifecycle) this.fail();
    const reviewDigest = this.drafts().digest({
      scope,
      code: row.code,
      revision,
      intent,
      definitionDigest: this.definitionDigest(row),
      start: row.start ?? null,
      end: row.end ?? null,
      emails: row.emails ?? null,
      target,
      published,
    });
    return { ...selected, intent, target, published, reviewDigest };
  },
  /** Returns a non-mutating review with no scheduler acquisition. @param {Object} request Current revision and intent. @returns {Promise<Object>} Review. */
  preview: async function (request) {
    if (
      Object.keys(request.body || {})
        .sort()
        .join() !== "code,expectedRevision,intent"
    )
      this.fail();
    const value = await this.prepare(request);
    return {
      code: "SUC_JOB_00000",
      data: {
        version: 1,
        enterpriseCode: value.scope.enterpriseCode,
        code: value.row.code,
        revision: value.revision,
        intent: value.intent,
        reviewDigest: value.reviewDigest,
        definitionCode: value.published?.definitionCode || null,
        processVersion: value.published?.version || null,
      },
    };
  },
  /** Conditionally writes lifecycle evidence on the original Cron record; counts are not execution proof. @param {Object} request Trusted request. @param {Object} value Selected job. @param {Object} operation Next receipt. @param {Object} patch Job changes. @returns {Promise<void>} Exact update acknowledgement. */
  transition: async function (request, value, operation, patch = {}) {
    const row = value.row;
    const result = this.drafts().result(
      await SERVICE.DefaultCronJobService.update({
        tenant: request.tenant,
        authData: request.authData,
        query: {
          code: row.code,
          active: row.active,
          jobDetail: row.jobDetail,
          trigger: row.trigger,
          runOnNode: row.runOnNode,
          runOnInit: false,
          name: row.name,
          priority: row.priority,
          start: row.start ?? null,
          end: row.end ?? null,
          emails: row.emails ?? null,
        },
        model: {
          ...patch,
          jobDetail: { ...row.jobDetail, scheduleLifecycle: operation },
        },
      }),
    );
    if (result.matchedCount !== 1 || result.acknowledged === false) this.fail();
  },
  /** Projects current local runtime evidence without confusing a lifecycle success string with an active timer. @param {Object} value Scoped persisted job. @returns {Object} Inert receipt. */
  project: function (value) {
    const { row, lifecycle, scope, revision } = value;
    const job =
      SERVICE.DefaultCronJobRuntimeService.jobPool?.[scope.tenantCode]?.[
        row.code
      ];
    const exact =
      job &&
      this.definitionDigest(job.getDefinition()) ===
        this.definitionDigest(row) &&
      ["start", "end", "emails"].every(
        (key) =>
          JSON.stringify(job.getDefinition()[key] ?? null) ===
          JSON.stringify(row[key] ?? null),
      );
    const timer = job?.getCronJob?.();
    const active =
      exact &&
      job.getDefinition().jobDetail?.scheduleLifecycle?.reviewDigest ===
        lifecycle?.reviewDigest &&
      job.isActive() === true &&
      (timer?.running === true || timer?.isActive === true);
    const inactive =
      !job ||
      (exact &&
        job.isActive() === false &&
        timer?.running !== true &&
        timer?.isActive !== true);
    if (!lifecycle && !inactive) this.fail();
    return {
      code: "SUC_JOB_00000",
      data: {
        version: 1,
        enterpriseCode: scope.enterpriseCode,
        code: row.code,
        revision,
        intent: lifecycle?.intent || null,
        reviewDigest: lifecycle?.reviewDigest || null,
        state:
          lifecycle?.state === "ACTIVE" && row.active === true && active
            ? "ACTIVE"
            : lifecycle?.state === "INACTIVE" &&
                row.active === false &&
                inactive
              ? "INACTIVE"
              : lifecycle
                ? "OUTCOME_UNKNOWN"
                : "SAVED_INACTIVE",
      },
    };
  },
  /** Inspects the original receipt only; never resends a command after acknowledgement loss. @param {Object} request Job identity. @returns {Promise<Object>} Current evidence. */
  inspect: async function (request) {
    if (Object.keys(request.body || {}).join() !== "code") this.fail();
    return this.project(await this.read(request));
  },
  /** Finalizes only proven original runtime evidence after response loss; never acquires or starts work. @param {Object} request Job and observed revision. @returns {Promise<Object>} Retained receipt or unknown evidence. */
  reconcile: async function (request) {
    if (
      Object.keys(request.body || {})
        .sort()
        .join() !== "code,expectedRevision"
    )
      this.fail();
    const value = await this.read(request);
    if (
      value.revision !== request.body.expectedRevision ||
      value.lifecycle?.state !== "DISPATCHING"
    )
      this.fail();
    const completed = {
      ...value.lifecycle,
      state: value.lifecycle.intent === "ACTIVATE" ? "ACTIVE" : "INACTIVE",
      completedAt: new Date().toISOString(),
    };
    const observed = this.project({ ...value, lifecycle: completed });
    if (observed.data.state !== completed.state) return this.project(value);
    await this.transition(request, value, completed);
    return this.inspect({ ...request, body: { code: value.row.code } });
  },
  /** Records confirmed intent before one runtime dispatch; ambiguous outcomes retain the receipt and cannot start again. @param {Object} request Explicit reviewed command. @returns {Promise<Object>} Observed runtime receipt. */
  execute: async function (request) {
    const scope = this.drafts().scope(request);
    const key = JSON.stringify([
      scope.tenantCode,
      this.drafts().code(request.body?.code),
    ]);
    // The persisted CAS is authority; this local exclusion prevents a stop racing an in-flight timer start on its owning node.
    if (commands.has(key)) this.fail();
    commands.add(key);
    try {
      return await this.executeOnce(request);
    } finally {
      commands.delete(key);
    }
  },
  /** Performs the single locally serialized dispatch after durable review/CAS. @param {Object} request Original command. @returns {Promise<Object>} Runtime receipt. */
  executeOnce: async function (request) {
    if (
      Object.keys(request.body || {})
        .sort()
        .join() !== "code,confirmed,expectedRevision,intent,reviewDigest" ||
      request.body.confirmed !== true
    )
      this.fail();
    let value = await this.prepare(request);
    const reviewed = value;
    if (value.reviewDigest !== request.body.reviewDigest) this.fail();
    const operation = {
      revision: value.revision + 1,
      actor: value.scope.actor,
      intent: value.intent,
      state: "DISPATCHING",
      reviewDigest: value.reviewDigest,
      occurredAt: new Date().toISOString(),
      previous: value.lifecycle
        ? {
            revision: value.lifecycle.revision,
            intent: value.lifecycle.intent,
            reviewDigest: value.lifecycle.reviewDigest,
            completedAt: value.lifecycle.completedAt,
          }
        : null,
    };
    await this.transition(request, value, operation, {
      active: value.intent === "ACTIVATE",
    });
    value = await this.read(request);
    if (JSON.stringify(value.lifecycle) !== JSON.stringify(operation))
      this.fail();
    const runtime = SERVICE.DefaultCronJobRuntimeService;
    try {
      if (operation.intent === "ACTIVATE") {
        await SERVICE.DefaultCronJobService.assertOperational(request.tenant);
        if (CONFIG.get("cronjob")?.scheduleDrafts?.activationEnabled !== true)
          this.fail();
        const target = this.drafts()
          .targets(value.scope)
          .find(
            (item) =>
              item.code === value.row.jobDetail.scheduleDraft.targetCode,
          );
        if (
          !target ||
          JSON.stringify(target) !== JSON.stringify(reviewed.target) ||
          JSON.stringify(
            await SERVICE.DefaultProcessRuntimeLifecycleService.inspectScheduleTrigger(
              request,
              target.triggerCode,
            ),
          ) !== JSON.stringify(reviewed.published)
        )
          this.fail();
        const existing = runtime.jobPool?.[request.tenant]?.[value.row.code];
        if (existing) {
          if (
            existing.isActive() ||
            existing.isRunning() ||
            this.definitionDigest(existing.getDefinition()) !==
              this.definitionDigest(value.row)
          )
            this.fail();
          await runtime.removeJob(request.tenant, value.row.code);
        }
        await runtime.createJob(NODICS.getInternalAuthToken(request.tenant), {
          ...structuredClone(value.row),
          tenant: request.tenant,
        });
        await runtime.startJob(request.tenant, value.row.code);
      } else await runtime.stopJob(request.tenant, value.row.code);
      value = await this.read(request);
      if (JSON.stringify(value.lifecycle) !== JSON.stringify(operation))
        this.fail();
      const completed = {
        ...operation,
        state: operation.intent === "ACTIVATE" ? "ACTIVE" : "INACTIVE",
        completedAt: new Date().toISOString(),
      };
      const observed = this.project({ ...value, lifecycle: completed });
      if (observed.data.state !== completed.state) this.fail();
      await this.transition(request, value, completed);
      return await this.inspect({ ...request, body: { code: value.row.code } });
    } catch {
      this.fail();
    }
  },
};
