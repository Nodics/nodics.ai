/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
const crypto = require("node:crypto");
const { AsyncLocalStorage } = require("node:async_hooks");
const executionAdmission = new AsyncLocalStorage();
/**
 * @module import/service/release/DefaultDataReleaseExecutionService
 * @description Durable, operator-driven checkpoints for one immutable nImport release plan.
 * @layer service
 * @owner import
 * @override Preserve exact source, actor, destination, atomic claims and no implicit replay.
 */
module.exports = {
  /** Initializes the execution owner without starting import work. */
  init: async function () {
    return true;
  },
  /** Completes initialization without claiming an execution. */
  postInit: async function () {
    return true;
  },
  /** Creates the canonical typed import admission error. */
  fail: function (message) {
    return SERVICE.DefaultDataReleaseService.error("ERR_IMP_00003", message);
  },
  /** Hashes a serializable immutable execution identity. */
  hash: function (value) {
    return crypto
      .createHash("sha256")
      .update(JSON.stringify(value))
      .digest("hex");
  },
  /** Native admission is repeated on every continuation; stored evidence never grants permission. */
  scope: function (request, write) {
    const auth = request.authData || {},
      type = request.releaseRequest?.dataType || request.dataType;
    const principal =
      auth.principalId || auth.loginId || auth.userId || auth.code;
    if (
      auth.principalType !== "human" ||
      auth.tokenType !== "access" ||
      auth.isSystem === true ||
      !principal ||
      !request.tenant ||
      !["init", "core", "sample"].includes(type)
    )
      throw this.fail("Native employee and explicit import scope are required");
    if (
      write &&
      !SERVICE.DefaultDataReleaseService.clientActions(request, type).includes(
        "install",
      )
    )
      throw this.fail("Current actor cannot continue this import type");
    const binding = {
      tenant: request.tenant,
      project: NODICS.getEnvironmentName(),
      environment: NODICS.getSelectedEnvironmentName(),
      server: NODICS.getServerName(),
      principal: String(principal),
      enterprise: auth.enterpriseCode || auth.entCode || "",
      dataType: type,
    };
    return { ...binding, key: this.hash(binding) };
  },
  /** Internal model access follows native admission, with no caller-selected schema or persistence. */
  persistence: function (scope) {
    const identity = SERVICE.DefaultIdentityGovernanceService;
    if (typeof identity?.getSystemAuthData !== "function")
      throw this.fail("Import execution persistence authority is unavailable");
    return {
      tenant: scope.tenant,
      authData: identity.getSystemAuthData(),
      options: { recursive: false, skipItemCache: true },
    };
  },
  /** Resolves the generated execution-record owner with all required persistence operations. */
  store: function () {
    const service = SERVICE.DefaultDataReleaseExecutionRecordService;
    if (
      !service ||
      ["get", "save", "update"].some(
        (key) => typeof service[key] !== "function",
      )
    )
      throw this.fail("Durable import execution owner is unavailable");
    return service;
  },
  /** Requalified descriptors retain private source authority; only immutable identities are stored. */
  identity: function (plan) {
    return {
      dataType: plan.dataType,
      tenant: plan.tenant,
      releases: plan.releases.map((item) => ({
        releaseCode: item.releaseCode,
        version: item.version,
        checksum: item.checksum,
      })),
      referenceReleases:
        SERVICE.DefaultDataReleaseService.publicReferenceReleases(plan),
    };
  },
  /** Accepts only an unambiguous generated-owner read response. */
  rows: function (response) {
    if (
      !response ||
      !Array.isArray(response.result) ||
      response.result.length > 1
    )
      throw this.fail("Import execution readback is unconfirmed");
    return response.result;
  },
  /** Reads and validates one execution in the exact actor and runtime scope. */
  load: async function (scope, code, required = true) {
    if (!/^releaseExecution_[a-f0-9]{64}$/.test(code || ""))
      throw this.fail("Invalid import execution identity");
    const rows = this.rows(
      await this.store().get({
        ...this.persistence(scope),
        query: { code, scopeKey: scope.key },
        searchOptions: { limit: 2 },
      }),
    );
    const row = rows[0];
    if (!row && !required) return undefined;
    if (
      !row ||
      row.scopeKey !== scope.key ||
      !Number.isSafeInteger(row.revision) ||
      row.revision < 1 ||
      !Array.isArray(row.steps) ||
      !row.plan ||
      row.planHash !== this.hash(row.plan) ||
      !["READY", "RUNNING", "COMPLETED", "UNCERTAIN"].includes(row.status)
    )
      throw this.fail(
        "Import execution is unavailable in the current actor and destination scope",
      );
    return row;
  },
  /** Acknowledges a CAS only after exact generated-owner readback, never from a local patch. */
  checkpoint: async function (scope, row, patch) {
    const saved = await this.store().update({
      ...this.persistence(scope),
      query: { code: row.code, scopeKey: scope.key, revision: row.revision },
      model: { ...patch, updatedAt: new Date().toISOString() },
    });
    if (saved?.result?.matchedCount !== 1)
      throw this.fail(
        "Import continuation was claimed elsewhere; inspect its receipt without replay",
      );
    const current = await this.load(scope, row.code);
    if (
      current.revision !== row.revision + 1 ||
      Object.keys(patch).some(
        (key) =>
          !require("node:util").isDeepStrictEqual(current[key], patch[key]),
      )
    )
      throw this.fail(
        "Import checkpoint acknowledgement is unconfirmed; inspect the recorded execution",
      );
    return current;
  },
  /** Returns the existing original-actor receipt during validation without creating work. */
  find: async function (request, plan) {
    if (
      request.authData?.principalType !== "human" ||
      request.authData?.tokenType !== "access"
    )
      return undefined;
    const scope = this.scope(request, false),
      planHash = this.hash(this.identity(plan));
    const row = await this.load(
      scope,
      "releaseExecution_" + this.hash([scope.key, planHash]),
      false,
    );
    return row ? this.project(row) : undefined;
  },
  /** Creates an insert-only plan receipt; a retried start resolves the same scoped identity. */
  begin: async function (request, plan) {
    const owner = SERVICE.DefaultDataReleaseService,
      scope = this.scope(request, true);
    if (scope.tenant !== plan.tenant || scope.dataType !== plan.dataType)
      throw this.fail("Import plan scope differs from the current operator");
    const identity = this.identity(plan),
      planHash = this.hash(identity),
      code = "releaseExecution_" + this.hash([scope.key, planHash]);
    if (
      request.releaseRequest?.executionCode &&
      request.releaseRequest.executionCode !== code
    )
      throw this.fail(
        "Recorded execution does not match this actor, destination or reviewed source",
      );
    const existing = await this.load(scope, code, false);
    if (existing) return { scope, row: existing };
    const preview = await owner.preflight(request, plan);
    if (preview.data?.validation?.ready !== true)
      throw this.fail("Import preview is blocked; review the owner findings");
    const releases = preview.data.releases;
    if (
      releases.some(
        (item) =>
          !["CURRENT", "NOT_INSTALLED", "UPDATE_AVAILABLE"].includes(
            item.status,
          ),
      )
    )
      throw this.fail(
        "Import execution requires a current or unattempted exact release; inspect earlier failures separately",
      );
    const steps = releases.map((item) => ({
      releaseCode: item.releaseCode,
      version: item.version,
      checksum: item.checksum,
      status: item.status === "CURRENT" ? "SKIPPED" : "PENDING",
      runId: item.lastRunId || null,
    }));
    const model = {
      code,
      active: true,
      scopeKey: scope.key,
      requestedBy: scope.principal,
      dataType: plan.dataType,
      plan: identity,
      planHash,
      steps,
      status: steps.every((item) => item.status === "SKIPPED")
        ? "COMPLETED"
        : "READY",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    try {
      await this.store().save({
        ...this.persistence(scope),
        // Revision zero means create-only for the existing managed model contract.
        query: { code, scopeKey: scope.key, revision: 0 },
        model,
      });
    } catch (error) {
      const stored = await this.load(scope, code, false);
      if (!stored) throw error;
    }
    const row = await this.load(scope, code);
    if (row.planHash !== planHash)
      throw this.fail("Recorded import plan differs from the reviewed source");
    return { scope, row };
  },
  /** Read-only receipt inspection cannot continue or retry a release. */
  inspect: async function (request) {
    const scope = this.scope(request, false);
    return {
      code: "SUC_IMP_00000",
      data: this.project(await this.load(scope, request.executionCode)),
    };
  },
  /** Lists original-actor plans in this runtime, so reload needs no browser-stored authority. */
  list: async function (request) {
    const scope = this.scope(request, false);
    const limit =
      SERVICE.DefaultDataReleaseService.configuration()
        .continuationHistoryLimit;
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100)
      throw this.fail("Import continuation history limit is invalid");
    const response = await this.store().get({
      ...this.persistence(scope),
      query: { scopeKey: scope.key },
      searchOptions: { limit, sort: { createdAt: -1 } },
    });
    if (!Array.isArray(response?.result) || response.result.length > limit)
      throw this.fail("Import execution history is unconfirmed");
    const rows = await Promise.all(
      response.result.map((row) => this.load(scope, row.code)),
    );
    return {
      code: "SUC_IMP_00000",
      data: rows.map((row) => ({
        ...this.project(row),
        canContinue:
          ["READY", "RUNNING", "UNCERTAIN"].includes(row.status) &&
          SERVICE.DefaultDataReleaseService.clientActions(
            request,
            scope.dataType,
          ).includes("install"),
      })),
    };
  },
  /** Projects bounded execution progress without exposing stored authority. */
  project: function (row) {
    return {
      code: row.code,
      planHash: row.planHash,
      revision: row.revision,
      status: row.status,
      dataType: row.dataType,
      requestedBy: row.requestedBy,
      steps: row.steps,
      releaseCodes: row.plan.releases.map((item) => item.releaseCode),
      expectedReleases: Object.fromEntries(
        row.plan.releases.map((item) => [item.releaseCode, item.version]),
      ),
      completed: row.steps.filter((item) =>
        ["COMPLETED", "SKIPPED"].includes(item.status),
      ).length,
      total: row.steps.length,
      automaticRetry: false,
      nextAction:
        row.status === "COMPLETED"
          ? "Preparation is complete. Review the next publication stage."
          : ["RUNNING", "UNCERTAIN"].includes(row.status)
            ? "Inspect this execution and the import receipt. Do not repeat the import."
            : "Continue the recorded preparation when ready.",
    };
  },
  /** Reconciles only exact successful installation receipts. Unknown writes never become retries. */
  reconcile: async function (scope, row, plan) {
    const owner = SERVICE.DefaultDataReleaseService,
      receipts = await owner.getInstallations(scope.tenant);
    const current = row.steps.find((step) => step.status === "RUNNING");
    if (!current) return row;
    const release = plan.releases.find(
      (item) => item.releaseCode === current.releaseCode,
    );
    const receipt = receipts.find(
      (item) => item.code === owner.installationCode(scope.tenant, release),
    );
    if (
      !receipt ||
      receipt.status !== "CURRENT" ||
      receipt.executionId !== row.code ||
      receipt.version !== current.version ||
      receipt.checksum !== current.checksum
    )
      return row;
    const steps = row.steps.map((step) =>
      step === current
        ? { ...step, status: "COMPLETED", runId: receipt.runId || null }
        : step,
    );
    return this.checkpoint(scope, row, {
      steps,
      status: steps.every((step) =>
        ["COMPLETED", "SKIPPED"].includes(step.status),
      )
        ? "COMPLETED"
        : "READY",
    });
  },
  /** Executes one next immutable release, with intent persisted before calling the existing importer. */
  continue: async function (request, plan) {
    const owner = SERVICE.DefaultDataReleaseService;
    const { scope, row: begun } = await this.begin(request, plan);
    if (begun.planHash !== this.hash(this.identity(plan)))
      throw this.fail(
        "Reviewed import source changed; do not continue this execution",
      );
    let row = await this.reconcile(scope, begun, plan);
    // Reconciliation is a separate acknowledgement step and never dispatches more work.
    if (row !== begun || row.status !== "READY")
      return this.response(row, plan);
    const step = row.steps.find((item) => item.status === "PENDING");
    if (!step) throw this.fail("Import execution has no pending release");
    const release = plan.releases.find(
      (item) => item.releaseCode === step.releaseCode,
    );
    const steps = row.steps.map((item) =>
      item === step ? { ...item, status: "RUNNING" } : item,
    );
    row = await this.checkpoint(scope, row, { status: "RUNNING", steps });
    const onePlan = { ...plan, releases: [release] };
    const admission = { active: true, plan: onePlan, executionId: row.code };
    try {
      await executionAdmission.run(admission, () =>
        owner.executePreparedPlan(request, onePlan),
      );
    } catch (error) {
      const reconciled = await this.reconcile(scope, row, plan);
      if (reconciled !== row) return this.response(reconciled, plan);
      row = await this.checkpoint(scope, row, { status: "UNCERTAIN" });
      return this.response(row, plan);
    } finally {
      admission.active = false;
    }
    row = await this.reconcile(scope, row, plan);
    return this.response(row, plan);
  },
  /** Private execution binding cannot be supplied in an HTTP body or serialized plan. */
  executionIdentity: function (plan) {
    const admission = executionAdmission.getStore();
    return admission?.active === true && admission.plan === plan
      ? admission.executionId
      : undefined;
  },
  /** Wraps the public execution projection in the normal import response contract. */
  response: async function (row, plan) {
    return {
      code: "SUC_IMP_00000",
      data: {
        dataType: plan.dataType,
        tenant: plan.tenant,
        releases: await SERVICE.DefaultDataReleaseService.operationReleases(
          plan,
          "AVAILABLE",
        ),
        ...(plan.requestSelection ? { selection: plan.requestSelection } : {}),
        referenceReleases:
          SERVICE.DefaultDataReleaseService.publicReferenceReleases(plan),
        execution: this.project(row),
      },
    };
  },
};
