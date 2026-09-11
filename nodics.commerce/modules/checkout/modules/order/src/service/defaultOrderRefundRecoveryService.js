/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
const crypto = require("node:crypto");
/** @module order/service/defaultOrderRefundRecoveryService @description Connects moderator-approved full refunds to the existing Order lifecycle processor, original Payment capture and configured owner reversal ports with persistent recovery checkpoints. @layer service @owner order @override Deployments enable bounded policies and register owner ports through CONFIG; clients cannot choose providers, identities, amounts or ledger references. */
module.exports = {
  /** Reads the deployment refund policy. */
  policy: function () {
    return (CONFIG.get("order") || {}).refunds || {};
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
    return SERVICE.DefaultOrderDisputeService.rows(v);
  },
  /** Builds trusted owner persistence without accepting a browser-supplied storage scope. */
  storage: function (r) {
    return SERVICE.DefaultOrderDisputeService.storage(r);
  },
  /** Reads one canonical refund record. */
  record: async function (r) {
    return this.rows(
      await SERVICE.DefaultOrderLifecycleRequestService.get({
        ...this.storage(r),
        query: {
          code: r.refundCode,
          enterpriseCode: r.enterpriseCode,
          requestType: "REFUND",
        },
      }),
    )[0];
  },
  /** Loads the customer case and original enterprise-owned order before policy evaluation. */
  load: async function (input) {
    const request = await this.context(input),
      caseRow = (
        await SERVICE.DefaultOrderDisputeService.records(request, {
          code: request.code,
        })
      )[0];
    if (!caseRow) throw new Error("The purchase review was not found");
    if (
      !["REFUND", "CANCELLATION"].includes(caseRow.evidence.requestedResolution)
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
      !this.policy().orderCodePrefixes?.some((p) => order.code.startsWith(p))
    )
      throw new Error("This order is outside the refund policy");
    const r = {
      ...request,
      orderCode: order.code,
      ownerId: order.ownerId,
      totalAmount: order.totalAmount,
      currency: order.currency,
      caseRow,
      order,
    };
    r.refundCode = this.refundCode(r);
    r.entries = await SERVICE.DefaultOrderOperationService.entries(
      r,
      order.code,
    );
    return r;
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
    if (provider === "digitalCore")
      return SERVICE.DefaultDigitalCommerceRefundService[phase]({
        ...r,
        ...body,
      });
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
    if (existing)
      return {
        ...existing.evidence.plan,
        eligible: existing.status !== "COMPLETED",
        recovery: true,
        approvalReason: existing.evidence.approval.reason,
        refundCode: r.refundCode,
        status: existing.status,
      };
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
      provider = this.policy().defaultOwnerPort;
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
      return await this.plan(r);
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
    return this.record(r);
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
      await this.caseProjection(r, row);
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
    const run = async (name, operation) => {
      row = await this.record(r);
      if (row.evidence.steps[name]) return row.evidence.steps[name];
      const value = await operation();
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
              if (payment.status !== "REFUND_SUCCEEDED")
                throw new Error("Payment refund requires reconciliation");
              return {
                status: payment.status,
                transactionCode: payment.transaction.code,
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
      const order = this.rows(
        await SERVICE.DefaultCommerceOrderService.get({
          ...this.storage(r),
          query: { code: r.orderCode, enterpriseCode: r.enterpriseCode },
        }),
      )[0];
      if (order.evidence?.refundCode !== r.refundCode)
        throw new Error("The order refund lock changed");
      if (order.status !== "REFUNDED")
        await SERVICE.DefaultCommerceOrderService.update({
          ...this.storage(r),
          query: {
            code: order.code,
            enterpriseCode: r.enterpriseCode,
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
      row = await this.record(r);
      row = await this.update(r, row, { status: "COMPLETED" });
      await this.caseProjection(r, row);
      return this.result(row);
    } catch (error) {
      row = await this.record(r);
      row = await this.update(r, row, {
        status: "RECONCILIATION_REQUIRED",
        evidence: {
          ...row.evidence,
          lastError: String(error.message).slice(0, 500),
        },
      });
      await this.caseProjection(r, row);
      return this.result(row);
    }
  },
  /** Updates the original customer review with linked execution progress, never reporting completion before owners finish. */
  caseProjection: async function (r, row) {
    const caseRow = (
      await SERVICE.DefaultOrderDisputeService.records(r, {
        code: r.caseRow.code,
      })
    )[0];
    await SERVICE.DefaultOrderLifecycleRequestService.update({
      ...this.storage(r),
      query: {
        code: caseRow.code,
        enterpriseCode: r.enterpriseCode,
        revision: caseRow.revision,
      },
      model: {
        code: caseRow.code,
        revision: caseRow.revision + 1,
        status:
          row.status === "COMPLETED" ? "REFUNDED" : "REFUND_RECONCILIATION",
        evidence: { ...caseRow.evidence, refund: this.result(row) },
      },
    });
  },
  /** Projects refund amount, progress and linked references for customer and moderator history. */
  result: function (row) {
    return {
      refundCode: row.code,
      status: row.status,
      amount: row.evidence.plan.amount,
      currency: row.evidence.plan.currency,
      steps: Object.keys(row.evidence.steps),
      message:
        row.status === "COMPLETED"
          ? "Refund and reversals completed."
          : "Refund recovery is required. Retry the original approved case.",
      reason: row.status === "COMPLETED" ? undefined : row.evidence.lastError,
    };
  },
};
