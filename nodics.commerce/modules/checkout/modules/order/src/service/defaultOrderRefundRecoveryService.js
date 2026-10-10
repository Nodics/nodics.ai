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
const exceptionPhases = new WeakMap();
/** @module order/service/defaultOrderRefundRecoveryService @description Connects moderator-approved full refunds to the existing Order lifecycle processor, original Payment capture and configured owner reversal ports with persistent recovery checkpoints. @layer service @owner order @override Deployments enable bounded policies and register owner ports through CONFIG; clients cannot choose providers, identities, amounts or ledger references. */
module.exports = {
  /** Reads the deployment refund policy. */
  policy: function () {
    return (CONFIG.get("order") || {}).refunds || {};
  },
  /** Requests refund messaging only after fresh completion evidence; communication failure cannot alter refund progress. @param {Object} r Owner context. @param {Object} row Refund checkpoint. @returns {Promise<void>} Independent notification attempt. */
  notifyCompleted: async function (r, row) {
    if (
      row?.status !== "COMPLETED" ||
      row.evidence?.plan?.provider !== "digitalCore"
    )
      return;
    try {
      await SERVICE.DefaultDigitalCommerceNotificationService?.request(
        r,
        "REFUNDED",
      );
    } catch (_) {
      /* A completed refund is never rolled back for delivery failure. */
    }
  },
  /** Reuses Order's current Profile staff-scope checks and requires operational Commerce. */
  context: async function (input) {
    const role = CONFIG.get("runtimeRole"),
      code = typeof role === "string" ? role : role?.code;
    if (!this.policy().enabled || code !== "COMMERCE")
      throw new Error("Refund execution is unavailable in this runtime");
    return SERVICE.DefaultOrderDisputeService.staff(input);
  },
  /** Creates a stable full-refund identity per enterprise and order, independent of how many review cases are submitted. */
  refundCode: function (r) {
    return (
      "ORDER_REFUND_" +
      crypto
        .createHash("sha256")
        .update([r.tenant, r.enterpriseCode, r.orderCode].join("|"))
        .digest("hex")
        .slice(0, 32)
        .toUpperCase()
    );
  },
  /** Unwraps generated records using Order's existing persistence contract. */
  rows: function (v) {
    let value = v;
    for (let n = 0; n < 8 && !Array.isArray(value); n++) {
      if (!value || value.error || value.success === false || value.code?.startsWith("ERR_"))
        throw new Error("Refund owner evidence read failed");
      if (value.result !== undefined) value = value.result;
      else if (value.data !== undefined) value = value.data;
      else throw new Error("Refund owner evidence read is unconfirmed");
    }
    if (!Array.isArray(value)) throw new Error("Refund owner evidence read is malformed");
    return SERVICE.DefaultOrderDisputeService.rows(v);
  },
  /** Requires an explicit successful phase, not merely a truthy response or error envelope. */
  checkpointReady: function (name, value) {
    if (!value || value.error || value.success === false || value.code?.startsWith("ERR_")) return false;
    const statuses = { PREPARE: ["PREPARED", "COMPLETED"], SETTLE: ["SETTLED", "COMPLETED"],
      PAYMENT: ["REFUND_SUCCEEDED"], COMPLETE: ["COMPLETED"] };
    return statuses[name]?.includes(value.status) === true && (name !== "PAYMENT" || !!value.transactionCode);
  },
  /** Reads the exact Order scope for lock and completion readback. */
  orderState: async function (r) {
    const rows = this.rows(await SERVICE.DefaultCommerceOrderService.get({
      ...this.storage(r), query: { code: r.orderCode, enterpriseCode: r.enterpriseCode, ownerId: r.ownerId },
      options: { recursive: false, skipItemCache: true },
    }));
    if (rows.length !== 1 || rows[0].code !== r.orderCode || rows[0].ownerId !== r.ownerId ||
      rows[0].enterpriseCode !== r.enterpriseCode || (rows[0].tenant && rows[0].tenant !== r.tenant))
      throw new Error("Scoped refund Order lock evidence is unavailable");
    return rows[0];
  },
  /** Builds trusted owner persistence without accepting a browser-supplied storage scope. */
  storage: function (r) {
    return SERVICE.DefaultOrderDisputeService.storage(r);
  },
  /** Reads one canonical refund record. */
  record: async function (r) {
    const rows = this.rows(
      await SERVICE.DefaultOrderLifecycleRequestService.get({
        ...this.storage(r),
        query: {
          code: r.refundCode,
          enterpriseCode: r.enterpriseCode,
          requestType: "REFUND",
        },
      }),
    );
    if (rows.length > 1 || (rows[0] && (rows[0].code !== r.refundCode || rows[0].tenant !== r.tenant ||
      rows[0].enterpriseCode !== r.enterpriseCode || rows[0].ownerId !== r.ownerId || rows[0].orderCode !== r.orderCode ||
      rows[0].requestType !== "REFUND")))
      throw new Error("Scoped refund approval evidence requires manual reconciliation");
    return rows[0];
  },
  /** Loads the customer case and original enterprise-owned order before policy evaluation. */
  load: async function (input) {
    const request = await this.context(input),
      caseRow = (
        await SERVICE.DefaultOrderDisputeService.records(request, {
          code: request.code,
        })
      )[0];
    if (!caseRow || caseRow.code !== request.code || caseRow.enterpriseCode !== request.enterpriseCode ||
      caseRow.requestType !== "DISPUTE" || (caseRow.tenant && caseRow.tenant !== request.tenant))
      throw new Error("The scoped purchase review was not found");
    if (
      !["REFUND", "CANCELLATION", "RETURN"].includes(caseRow.evidence.requestedResolution)
    )
      throw new Error("This case requires manual dispute resolution");
    const order = this.rows(
      await SERVICE.DefaultCommerceOrderService.get({
        ...this.storage(request),
        query: {
          code: caseRow.orderCode,
          enterpriseCode: request.enterpriseCode,
          ownerId: caseRow.ownerId,
        },
        options: { recursive: false, skipItemCache: true },
      }),
    )[0];
    if (
      !order ||
      order.code !== caseRow.orderCode || order.ownerId !== caseRow.ownerId ||
      order.enterpriseCode !== request.enterpriseCode || (order.tenant && order.tenant !== request.tenant)
    )
      throw new Error("This order is outside the refund policy");
    const storeCode = await SERVICE.DefaultOrderDisputeService.policyAdmission(request, order, this.policy());
    const r = {
      ...request,
      orderCode: order.code,
      ownerId: order.ownerId,
      totalAmount: order.totalAmount,
      currency: order.currency,
      caseRow,
      order,
      storeCode,
    };
    r.refundCode = this.refundCode(r);
    r.entries = await SERVICE.DefaultOrderOperationService.entries(
      r,
      order.code,
    );
    return r;
  },
  /** Revalidates signed staff scope and persisted approval before Payment can use Order authority. No caller amount, capture or approval flags are trusted. */
  paymentAuthority: async function (input, execution = false) {
    const r = await this.load(input);
    const authority = {
      tenant: r.tenant, enterpriseCode: r.enterpriseCode, ownerId: r.ownerId,
      orderCode: r.orderCode, totalAmount: r.totalAmount, currency: r.currency,
      refundCode: r.refundCode, allowExecution: false,
    };
    if (!execution) return authority;
    const router = SERVICE.DefaultSecuredRequestPipelineService;
    if (!router.isPermissionGranted("commerce.refund.execute", router.getGrantedPermissions(r), {}))
      throw new Error("Refund execution permission is required");
    const row = await this.record(r), evidence = row?.evidence;
    if (!row || row.code !== r.refundCode || row.ownerId !== r.ownerId || row.orderCode !== r.orderCode ||
      row.enterpriseCode !== r.enterpriseCode || row.tenant !== r.tenant ||
      !["APPROVED", "EXECUTING", "RECONCILIATION_REQUIRED", "COMPLETED"].includes(row.status) ||
      evidence?.caseCode !== r.caseRow.code || !evidence.approval?.by ||
      evidence.approval.commandKey !== r.idempotencyKey ||
      evidence.approval.reason !== input.payload?.reason?.trim() || input.payload?.confirmed !== true ||
      !evidence.plan?.originalCapture || evidence.plan.amount !== r.totalAmount || evidence.plan.currency !== r.currency ||
      (execution !== "PREFLIGHT" && (!this.checkpointReady("PREPARE", evidence.steps?.PREPARE) || !this.checkpointReady("SETTLE", evidence.steps?.SETTLE))) ||
      r.order.evidence?.refundCode !== r.refundCode || !["REFUND_PENDING", "REFUNDED"].includes(r.order.status))
      throw new Error("Scoped persisted refund approval, original capture and settled owner checkpoints are required");
    if (r.caseRow.evidence?.refundPolicyException)
      await SERVICE.DefaultOrderRefundExceptionService.validate(r, "payment");
    return { ...authority, allowExecution: true, completed: row.status === "COMPLETED" || r.order.status === "REFUNDED",
      originalCapture: evidence.plan.originalCapture,
      approvalCommandKey: evidence.approval.commandKey };
  },
  /** Rechecks current Profile scope, original case, persisted reviewed physical plan and Order lock for each physical effect. */
  physicalAuthority: async function (input, execution = false) {
    const r = await this.load(input);
    if (!["CANCELLATION", "RETURN"].includes(r.caseRow.evidence.requestedResolution))
      throw new Error("Physical reversal requires an explicit cancellation or return review");
    if (!r.storeCode || r.order.evidence?.storeCode !== r.storeCode || this.policy().storeCodes?.[r.storeCode] !== true ||
      this.policy().ownerByStore?.[r.storeCode] !== undefined && this.policy().ownerByStore[r.storeCode] !== "fulfillmentCore")
      throw new Error("Retained Store physical owner selection is unavailable or changed");
    if (!execution) return r;
    const row = await this.record(r), e = row?.evidence;
    if (!row || !["APPROVED", "EXECUTING", "RECONCILIATION_REQUIRED", "COMPLETED"].includes(row.status) ||
      e?.caseCode !== r.caseRow.code || e.plan?.provider !== "fulfillmentCore" ||
      e.plan.amount !== r.totalAmount || e.plan.currency !== r.currency || !e.plan.originalCapture ||
      typeof e.approval?.by !== "string" || !e.approval.by ||
      typeof e.approval.commandKey !== "string" || !e.approval.commandKey ||
      typeof e.approval.reason !== "string" || e.approval.reason.length < 10 ||
      r.order.evidence?.refundCode !== r.refundCode || !["REFUND_PENDING", "REFUNDED"].includes(r.order.status))
      throw new Error("Original reviewed physical approval and scoped Order lock are required");
    return { ...r, physicalApproval: row, physicalPlan: e.plan.domain };
  },
  /** Validates only an exact live private Order-to-Digital phase object; never accepts caller exception flags. */
  exceptionAuthority: async function (input, phase) {
    const admission = exceptionPhases.get(input);
    if (!admission) return undefined;
    if (admission.phase !== phase || ["tenant", "enterpriseCode", "ownerId", "orderCode", "refundCode"].some(key =>
      input[key] !== admission.scope[key])) throw new CLASSES.NodicsError("ERR_ORDER_REFUND_EXCEPTION");
    return SERVICE.DefaultOrderRefundExceptionService.validate(admission.source, phase);
  },
  /** Calls only deployment-configured owner ports, retaining one stable refund reference across all phases. */
  owner: async function (r, provider, phase, extra = {}) {
    const body = {
      orderCode: r.orderCode,
      ownerId: r.ownerId,
      enterpriseCode: r.enterpriseCode,
      totalAmount: r.totalAmount,
      currency: r.currency,
      entries: r.entries,
      refundCode: r.refundCode,
      correlationId: r.correlationId,
      ...extra,
    };
    if (provider === "digitalCore") {
      const context = { ...r, ...body };
      if (r.caseRow.evidence?.refundPolicyException) exceptionPhases.set(context, { phase, source: r,
        scope: Object.fromEntries(["tenant", "enterpriseCode", "ownerId", "orderCode", "refundCode"].map(key => [key, context[key]])) });
      try { return await SERVICE.DefaultDigitalCommerceRefundService[phase](context); }
      finally { exceptionPhases.delete(context); }
    }
    if (r.caseRow.evidence?.refundPolicyException) throw new CLASSES.NodicsError("ERR_ORDER_REFUND_EXCEPTION");
    if (provider === "fulfillmentCore") {
      const owner = SERVICE.DefaultPhysicalOrderReversalService;
      if (typeof owner?.[phase] !== "function") throw new Error("Physical reversal owner is unavailable");
      return owner[phase](r);
    }
    const target = this.policy().ownerPorts?.[provider];
    if (!target)
      throw new Error("The configured reversal owner is unavailable");
    let v = await SERVICE.DefaultModuleService.invokeModule({
      local: false,
      tenant: r.tenant,
      request: { tenant: r.tenant },
      moduleName: target.moduleName,
      connectionName: target.connectionName,
      targetAuthority: target.targetAuthority,
      apiName: target.apiPrefix + "/" + phase,
      methodName: "POST",
      requestBody: body,
      header: {
        "X-Enterprise-Code": r.enterpriseCode,
        "Idempotency-Key": r.refundCode,
        "X-Correlation-Id": r.correlationId || r.refundCode,
      },
      timeoutMs: 30000,
      maxAttempts: 1,
    });
    for (let n = 0; n < 7 && v; n++) {
      if (v.data !== undefined) v = v.data;
      else if (v.result !== undefined) v = v.result;
      else break;
    }
    return v;
  },
  /** Calculates a fresh, read-only full-refund plan from payment and domain owners. */
  plan: async function (r) {
    const existing = await this.record(r);
    if (existing) {
      if (existing.evidence.caseCode !== r.caseRow.code)
        return { eligible: false, reason: "REFUND_APPROVED_UNDER_ANOTHER_CASE" };
      const commandKey = existing.evidence.approval.commandKey;
      if (typeof commandKey !== "string" || !/^[A-Za-z0-9._:-]{8,180}$/.test(commandKey))
        throw new Error("Original refund command reference requires reconciliation");
      return {
        ...existing.evidence.plan,
        eligible: existing.status !== "COMPLETED",
        recovery: true,
        approvalReason: existing.evidence.approval.reason,
        approvalCommandKey: commandKey,
        refundCode: r.refundCode,
        status: existing.status,
      };
    }
    if (
      r.caseRow.status !== "SUBMITTED" ||
      !["PLACED", "COMPLETED", "FULFILLED"].includes(r.order.status)
    )
      return { eligible: false, reason: "ORDER_OR_CASE_NOT_REFUNDABLE" };
    const capture =
      await SERVICE.DefaultPaymentRefundExecutionService.orderCapture(r);
    let provider = "digitalCore",
      domain = await this.owner(r, provider, "preview");
    if (domain.reason === "NO_DIGITAL_ENTITLEMENT") {
      const pinnedStore = r.order.evidence?.storeCode === r.storeCode ? r.storeCode : undefined;
      provider = this.policy().ownerByStore?.[pinnedStore] ||
        (pinnedStore && this.policy().storeCodes?.[pinnedStore] === true &&
          r.order.evidence?.reservationCodes?.length && SERVICE.DefaultPhysicalOrderReversalService
          ? "fulfillmentCore" : this.policy().defaultOwnerPort);
      if (!provider)
        return { eligible: false, reason: "NO_AUTOMATIC_REVERSAL_OWNER" };
      domain = await this.owner(r, provider, "preview");
    }
    if (!domain.eligible) return domain;
    const plan = {
      provider,
      amount: capture.amount,
      currency: capture.currency,
      captureCode: capture.captureCode,
      originalCapture: capture,
      domain,
      orderRevision: r.order.revision,
    };
    return {
      eligible: true,
      ...plan,
      previewToken: crypto
        .createHash("sha256")
        .update(JSON.stringify(plan))
        .digest("hex"),
      refundCode: r.refundCode,
    };
  },
  /** Returns only reviewable effect summaries; original capture/provider credentials remain server-owned. */
  preview: async function (input) {
    const r = await this.load(input);
    try {
      const plan = { ...await this.plan(r) };
      delete plan.originalCapture;
      return plan;
    } catch (error) {
      return { eligible: false, reason: error.message };
    }
  },
  /** Persists progress with a revision guard and verifies the intended phase survived concurrent updates. */
  update: async function (r, row, patch) {
    await SERVICE.DefaultOrderLifecycleRequestService.update({
      ...this.storage(r),
      query: {
        code: row.code,
        enterpriseCode: r.enterpriseCode,
        revision: row.revision,
      },
      model: { code: row.code, revision: row.revision + 1, ...patch },
    });
    const current = await this.record(r);
    if (!current || current.revision !== row.revision + 1 ||
      Object.entries(patch).some(([key, value]) => !isDeepStrictEqual(current[key], value)))
      throw new Error("Refund checkpoint persistence requires reconciliation");
    return current;
  },
  /** Approves one reviewed refund, locks the order, and resumes the existing lifecycle processor through idempotent owner ports. */
  execute: async function (input) {
    const r = await this.load(input),
      p = input.payload || {},
      router = SERVICE.DefaultSecuredRequestPipelineService;
    if (
      !router.isPermissionGranted(
        "commerce.refund.execute",
        router.getGrantedPermissions(r),
        {},
      )
    )
      throw new Error("Refund execution permission is required");
    if (
      p.confirmed !== true ||
      typeof p.reason !== "string" ||
      p.reason.trim().length < 10 ||
      p.reason.length > 2000 ||
      typeof r.idempotencyKey !== "string" ||
      !/^[A-Za-z0-9._:-]{8,180}$/.test(r.idempotencyKey)
    )
      throw new Error(
        "Review and confirm the refund with a reason and stable command reference",
      );
    if (r.caseRow.evidence?.refundPolicyException)
      await SERVICE.DefaultOrderRefundExceptionService.validate(r, "execute");
    let row = await this.record(r);
    if (row) {
      if (
        row.evidence.caseCode !== r.caseRow.code ||
        row.evidence.approval.commandKey !== r.idempotencyKey ||
        row.evidence.approval.reason !== p.reason.trim()
      )
        throw new Error(
          "This order already has a refund; use its original case and command reference",
        );
    } else {
      if (r.caseRow.revision !== p.expectedRevision)
        throw new Error("The case changed; reload before approving");
      const plan = await this.plan(r);
      if (!plan.eligible || plan.previewToken !== p.previewToken)
        throw new Error(
          "Refund eligibility changed; preview again before approval",
        );
      const model = {
        code: r.refundCode,
        tenant: r.tenant,
        enterpriseCode: r.enterpriseCode,
        ownerId: r.ownerId,
        orderCode: r.orderCode,
        requestType: "REFUND",
        status: "APPROVED",
        active: true,
        revision: 0,
        created: new Date(),
        updated: new Date(),
        occurredAt: new Date(),
        correlationId: r.correlationId || r.refundCode,
        idempotencyKey: r.refundCode,
        evidence: {
          caseCode: r.caseRow.code,
          plan,
          approval: {
            by: r.authData.loginId,
            at: new Date().toISOString(),
            reason: p.reason.trim(),
            commandKey: r.idempotencyKey,
            ...(plan.domain?.policyException ? { policyException: plan.domain.policyException } : {}),
          },
          steps: {},
        },
      };
      try {
        await SERVICE.DefaultOrderLifecycleRequestService.save({
          ...this.storage(r),
          model,
        });
      } catch (error) {
        row = await this.record(r);
        if (!row) throw error;
      }
      row = await this.record(r);
      if (row.evidence.approval.commandKey !== r.idempotencyKey)
        throw new Error("Another moderator already approved this refund");
    }
    if (row.status === "COMPLETED") {
      try { await this.paymentAuthority(input, true); }
      catch (_) { throw new CLASSES.NodicsError("ERR_ORDER_REFUND_REPLAY_AUTHORITY"); }
      if (r.order.status !== "REFUNDED" || !this.checkpointReady("PAYMENT", row.evidence.steps.PAYMENT) ||
        !this.checkpointReady("COMPLETE", row.evidence.steps.COMPLETE))
        throw new CLASSES.NodicsError("ERR_ORDER_REFUND_REPLAY_STATE");
      await this.caseProjection(r, row);
      await this.notifyCompleted(r, row);
      return this.result(row);
    }
    if (
      r.order.evidence?.refundCode &&
      r.order.evidence.refundCode !== r.refundCode
    )
      throw new Error("The order belongs to another refund");
    if (!r.order.evidence?.refundCode) {
      await SERVICE.DefaultCommerceOrderService.update({
        ...this.storage(r),
        query: {
          code: r.orderCode,
          ownerId: r.ownerId,
          enterpriseCode: r.enterpriseCode,
          revision: r.order.revision,
        },
        model: {
          code: r.orderCode,
          revision: r.order.revision + 1,
          status: "REFUND_PENDING",
          evidence: { ...r.order.evidence, refundCode: r.refundCode },
        },
      });
    }
    const locked = await this.orderState(r);
    if (!["REFUND_PENDING", "REFUNDED"].includes(locked.status) || locked.evidence?.refundCode !== r.refundCode ||
      locked.totalAmount !== r.totalAmount || locked.currency !== r.currency)
      throw new Error("Order refund lock persistence requires reconciliation before owner execution");
    if (locked.status === "REFUNDED" && ["PREPARE", "SETTLE", "PAYMENT", "COMPLETE"].some(name =>
      !this.checkpointReady(name, row.evidence.steps[name])))
      throw new Error("Refunded order requires original completed owner evidence");
    const run = async (name, operation) => {
      if (r.caseRow.evidence?.refundPolicyException)
        await SERVICE.DefaultOrderRefundExceptionService.validate(r, name.toLowerCase());
      row = await this.record(r);
      if (row.evidence.steps[name]) {
        if (!this.checkpointReady(name, row.evidence.steps[name]))
          throw new Error("Existing " + name + " checkpoint requires manual reconciliation");
        return row.evidence.steps[name];
      }
      const value = await operation();
      if (!this.checkpointReady(name, value)) {
        const error = new Error(name + " owner did not confirm success");
        error.refundRecovery = { phase: name, status: value?.status || "UNCONFIRMED" };
        throw error;
      }
      row = await this.record(r);
      row = await this.update(r, row, {
        status: "EXECUTING",
        evidence: {
          ...row.evidence,
          steps: { ...row.evidence.steps, [name]: value },
        },
      });
      return value;
    };
    const provider = row.evidence.plan.provider;
    try {
      if (typeof SERVICE.DefaultPaymentRefundExecutionService.preflightOrder !== "function")
        throw new Error("Original-capture financial preflight owner is unavailable");
      const preflight = await SERVICE.DefaultPaymentRefundExecutionService.preflightOrder(r);
      if (preflight?.eligible !== true || preflight.captureCode !== row.evidence.plan.captureCode ||
        preflight.amount !== row.evidence.plan.amount || preflight.currency !== row.evidence.plan.currency)
        throw new Error("Original-capture financial preflight did not confirm the approved intent");
      await SERVICE.DefaultOrderLifecycleService.process(
        { ...r, idempotencyKey: r.refundCode },
        {
          find: async () => null,
          evaluatePolicy: async () => ({
            eligible: true,
            requiresApproval: false,
          }),
          fulfillmentIntent: () =>
            run("PREPARE", () => this.owner(r, provider, "prepare")),
          inventoryDisposition: () =>
            run("SETTLE", () => this.owner(r, provider, "settle")),
          paymentIntent: () =>
            run("PAYMENT", async () => {
              const payment =
                await SERVICE.DefaultPaymentRefundExecutionService.refundOrder(
                  r,
                );
              if (payment.status !== "REFUND_SUCCEEDED") {
                const error = new Error("Payment refund requires reconciliation");
                error.refundRecovery = { phase: "PAYMENT", status: payment.status,
                  transactionCode: payment.transaction?.code, reconciliationCode: payment.reconciliation?.code };
                throw error;
              }
              return {
                status: payment.status,
                transactionCode: payment.transaction.code,
                ...(payment.sandbox === true && payment.sandboxMode === "LOCAL_SANDBOX_DEMO" &&
                  payment.maturity === "OFFLINE_CONFORMANCE" ? {
                    sandbox: true, sandboxMode: payment.sandboxMode, maturity: payment.maturity,
                  } : {}),
              };
            }),
          complete: async () => {
            await run("COMPLETE", () =>
              this.owner(r, provider, "complete", {
                settlement: row.evidence.steps.SETTLE,
              }),
            );
            return { status: "COMPLETED" };
          },
        },
      );
      const order = await this.orderState(r);
      if (order.evidence?.refundCode !== r.refundCode)
        throw new Error("The order refund lock changed");
      if (order.status !== "REFUNDED")
        await SERVICE.DefaultCommerceOrderService.update({
          ...this.storage(r),
          query: {
            code: order.code,
            enterpriseCode: r.enterpriseCode,
            ownerId: r.ownerId,
            revision: order.revision,
          },
          model: {
            code: order.code,
            revision: order.revision + 1,
            status: "REFUNDED",
            evidence: {
              ...order.evidence,
              refundCompletedAt: new Date().toISOString(),
            },
          },
        });
      const completedOrder = await this.orderState(r);
      if (completedOrder.status !== "REFUNDED" || completedOrder.evidence?.refundCode !== r.refundCode)
        throw new Error("Order refund completion persistence requires reconciliation");
      row = await this.record(r);
      row = await this.update(r, row, { status: "COMPLETED" });
      await this.caseProjection(r, row);
      await this.notifyCompleted(r, row);
      return this.result(row);
    } catch (error) {
      row = await this.record(r);
      row = await this.update(r, row, {
        status: "RECONCILIATION_REQUIRED",
        evidence: {
          ...row.evidence,
          lastError: String(error.message).slice(0, 500),
          lastFailure: error.refundRecovery || { status: "UNCONFIRMED", nextAction: "MANUAL_RECONCILIATION" },
        },
      });
      await this.caseProjection(r, row);
      return this.result(row);
    }
  },
  /** Projects original progress once; identical completed replay is read-only and stale progress requires confirmed original-case CAS. */
  caseProjection: async function (r, row) {
    const fail = gate => { throw new CLASSES.NodicsError("ERR_ORDER_REFUND_PROJECTION_" + gate); };
    const confirmed = (response, gate) => {
      if (!response || !/^SUC_/.test(response.code || "") || response.error || response.success === false ||
          response.acknowledged === false || response.errors && (!Array.isArray(response.errors) || response.errors.length)) fail(gate);
      return response.result;
    };
    if (row?.code !== r.refundCode || row.tenant !== r.tenant || row.enterpriseCode !== r.enterpriseCode ||
        row.ownerId !== r.ownerId || row.orderCode !== r.orderCode || row.requestType !== "REFUND" ||
        row.evidence?.caseCode !== r.caseRow?.code) fail("BINDING");
    const query = { tenant: r.tenant, code: r.caseRow.code, enterpriseCode: r.enterpriseCode,
      ownerId: r.ownerId, orderCode: r.orderCode, requestType: "DISPUTE" };
    const read = async (gate = "READ") => {
      let response;
      try {
        response = await SERVICE.DefaultOrderLifecycleRequestService.get({ ...this.storage(r), query: { ...query },
          options: { recursive: false, skipItemCache: true }, searchOptions: { pageSize: 2, pageNumber: 1 } });
      } catch (_) { fail(gate); }
      const records = confirmed(response, gate);
      if (!Array.isArray(records) || records.length !== 1 || response.count !== 1 ||
          [response.total, response.totalCount].some(value => value !== undefined && value !== 1) ||
          !Object.entries(query).every(([key, value]) => records[0]?.[key] === value) ||
          !Number.isSafeInteger(records[0].revision) || records[0].revision < 0 ||
          records[0].evidence?.requestedResolution !== r.caseRow.evidence?.requestedResolution) fail(gate);
      return records[0];
    };
    const caseRow = await read(), refund = this.result(row), previous = { ...caseRow.evidence.refund };
    // Generated JSON/BSON persistence may omit an undefined optional reason.
    if (refund.reason === undefined) delete refund.reason;
    if (previous.reason === undefined) delete previous.reason;
    const status = row.status === "COMPLETED" ? "REFUNDED" : "REFUND_RECONCILIATION";
    if (row.status === "COMPLETED" && caseRow.status === status && isDeepStrictEqual(previous, refund)) return caseRow;
    if (!Number.isSafeInteger(caseRow.revision + 1)) fail("WRITE");
    const model = { code: caseRow.code, revision: caseRow.revision + 1, status,
      evidence: { ...caseRow.evidence, refund } };
    let response;
    try {
      response = await SERVICE.DefaultOrderLifecycleRequestService.update({ ...this.storage(r),
        options: { recursive: false, skipItemCache: true }, query: { ...query, revision: caseRow.revision }, model });
    } catch (_) { fail("WRITE"); }
    const result = confirmed(response, "WRITE");
    if (!result || result.error || result.success === false || result.acknowledged !== true ||
        ("code" in result && !/^SUC_/.test(result.code || "")) ||
        result.errors && (!Array.isArray(result.errors) || result.errors.length) ||
        result.matchedCount !== 1 || result.modifiedCount !== 1 || result.upsertedCount > 0 || result.upsertedId != null) fail("WRITE");
    const stored = await read("READBACK");
    if (stored.revision !== model.revision || stored.status !== model.status || !isDeepStrictEqual(stored.evidence, model.evidence)) fail("READBACK");
    return stored;
  },
  /** Projects refund amount, progress and linked references for customer and moderator history. */
  result: function (row) {
    const capture = row.evidence.plan.originalCapture;
    const sandbox = capture?.sandboxMode === "LOCAL_SANDBOX_DEMO" && capture.maturity === "OFFLINE_CONFORMANCE";
    return {
      refundCode: row.code,
      status: row.status,
      amount: row.evidence.plan.amount,
      currency: row.evidence.plan.currency,
      steps: Object.keys(row.evidence.steps),
      ...(sandbox ? { sandbox: true, sandboxMode: capture.sandboxMode, maturity: capture.maturity } : {}),
      message:
        row.status === "COMPLETED"
          ? (sandbox ? "Offline sandbox refund and reversals completed; no external money moved." : "Refund and reversals completed.")
          : (sandbox ? "Offline sandbox refund recovery is required. Retry the original approved case." : "Refund recovery is required. Retry the original approved case."),
      reason: row.status === "COMPLETED" ? undefined : row.evidence.lastError,
    };
  },
};
