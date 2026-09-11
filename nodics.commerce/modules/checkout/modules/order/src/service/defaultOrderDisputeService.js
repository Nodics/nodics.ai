/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
const crypto = require("node:crypto");
/** @module order/service/defaultOrderDisputeService @description Records customer-reviewed cancellation, refund and dispute requests in the canonical Order lifecycle store for manual review, with scoped operator resolution and no automatic money or ownership reversal. @layer service @owner order @override A deployment may configure eligible order prefixes; a future automatic reversal provider must coordinate all owning domains before changing this manual policy. */
module.exports = {
  /** Resolves deployment-specific manual review availability. */
  policy: function () {
    return (CONFIG.get("order") || {}).disputes || {};
  },
  /** Rejects invalid or inaccessible requests without exposing other orders. */
  fail: function (message) {
    throw new CLASSES.NodicsError("ERR_ORDER_DISPUTE_INVALID", message);
  },
  /** Applies authenticated enterprise and Commerce principal context only. */
  context: function (input) {
    const auth = input.authData || {},
      enterpriseCode = auth.enterpriseCode || auth.entCode,
      ownerId = auth.principalId || auth.code || auth.loginId;
    if (!this.policy().enabled || !input.tenant || !enterpriseCode || !ownerId)
      this.fail("Order review is unavailable");
    return { ...input, enterpriseCode, ownerId, orderCode: input.code };
  },
  /** Uses the canonical Order lifecycle service identity for owner-bounded records. */
  storage: function (request) {
    return {
      tenant: request.tenant,
      authData:
        SERVICE.DefaultOrderLifecycleOperationService.serviceAuthData(request),
      options: { recursive: false, skipItemCache: true },
    };
  },
  /** Unwraps generated store results without treating update counts as records. */
  rows: function (value) {
    for (let n = 0; n < 7 && value && !Array.isArray(value); n++) {
      if (value.data !== undefined) value = value.data;
      else if (value.result !== undefined) value = value.result;
      else break;
    }
    return Array.isArray(value) ? value : value?.code ? [value] : [];
  },
  /** Reads only manual dispute records within the authenticated enterprise. */
  records: async function (request, query) {
    return this.rows(
      await SERVICE.DefaultOrderLifecycleRequestService.get({
        ...this.storage(request),
        query: {
          ...query,
          enterpriseCode: request.enterpriseCode,
          requestType: "DISPUTE",
        },
        searchOptions: { pageSize: 100, pageNumber: 1 },
      }),
    );
  },
  /** Projects the case and decision without unrelated order or payment evidence. */
  project: function (row) {
    return {
      code: row.code,
      orderCode: row.orderCode,
      status: row.status,
      revision: row.revision,
      requestedResolution: row.evidence.requestedResolution,
      comment: row.evidence.customerComment,
      createdAt: row.occurredAt,
      decision: row.evidence.decision,
      policy: "MANUAL_REVIEW",
      automaticReversal: false,
      refund: row.evidence.refund,
    };
  },
  /** Authorizes a completed customer-owned order under the configured deployment policy. */
  order: async function (request) {
    if (request.authData.principalType !== "customer")
      this.fail("Please sign in as a customer");
    if (
      !this.policy().orderCodePrefixes?.some((prefix) =>
        request.code?.startsWith(prefix),
      )
    )
      this.fail("This order is outside the review policy");
    const order = await SERVICE.DefaultOrderOperationService.read({
      ...request,
      query: {},
    });
    const value = order.order || order;
    if (!value?.code || value.ownerId !== request.ownerId)
      this.fail("The order was not found");
    return value;
  },
  /** Lists the customer's case history after rechecking order ownership. */
  listOwn: async function (input) {
    const request = this.context(input);
    await this.order(request);
    return {
      cases: (
        await this.records(request, {
          orderCode: request.code,
          ownerId: request.ownerId,
        })
      ).map(this.project),
    };
  },
  /** Persists one immutable, explicitly confirmed manual review request with deterministic idempotency. */
  create: async function (input) {
    const request = this.context(input),
      p = request.payload || {},
      key = request.idempotencyKey;
    await this.order(request);
    if (
      p.confirmed !== true ||
      typeof key !== "string" ||
      !/^[A-Za-z0-9._:-]{8,180}$/.test(key) ||
      !["CANCELLATION", "REFUND", "DISPUTE"].includes(p.requestedResolution) ||
      typeof p.comment !== "string" ||
      p.comment.trim().length < 10 ||
      p.comment.length > 2000
    )
      this.fail(
        "Review the request and provide a reason of 10 to 2000 characters",
      );
    const code =
      "ORDER_REVIEW_" +
      crypto
        .createHash("sha256")
        .update(
          [request.tenant, request.enterpriseCode, request.ownerId, key].join(
            "|",
          ),
        )
        .digest("hex")
        .slice(0, 32)
        .toUpperCase();
    let row = (
      await this.records(request, { code, ownerId: request.ownerId })
    )[0];
    const same = (row) =>
      row.orderCode === request.code &&
      row.evidence.requestedResolution === p.requestedResolution &&
      row.evidence.customerComment === p.comment.trim();
    if (row) {
      if (!same(row))
        this.fail("This request reference belongs to different details");
      return this.project(row);
    }
    const model = {
      tenant: request.tenant,
      created: new Date(),
      updated: new Date(),
      code,
      enterpriseCode: request.enterpriseCode,
      ownerId: request.ownerId,
      orderCode: request.code,
      requestType: "DISPUTE",
      status: "SUBMITTED",
      revision: 0,
      active: true,
      idempotencyKey: key,
      correlationId: request.correlationId || code,
      occurredAt: new Date(),
      evidence: {
        requestedResolution: p.requestedResolution,
        customerComment: p.comment.trim(),
        policy: "MANUAL_REVIEW",
        automaticReversal: false,
      },
    };
    try {
      await SERVICE.DefaultOrderLifecycleRequestService.save({
        ...this.storage(request),
        model,
      });
    } catch (error) {
      row = (
        await this.records(request, { code, ownerId: request.ownerId })
      )[0];
      if (!row) throw error;
      if (!same(row))
        this.fail("This request reference belongs to different details");
    }
    return this.project(
      row ||
        (await this.records(request, { code, ownerId: request.ownerId }))[0],
    );
  },
  /** Resolves current employee grants and enterprise scope through Profile. */
  staff: async function (input) {
    const request = this.context(input),
      auth = request.authData,
      router = SERVICE.DefaultSecuredRequestPipelineService;
    if (
      auth.principalType !== "human" ||
      !auth.loginId ||
      !request.authorization ||
      !router.isPermissionGranted(
        "commerce.dispute.review",
        router.getGrantedPermissions(request),
        {},
      )
    )
      this.fail("Order review is not permitted");
    let scope = await SERVICE.DefaultModuleService.invokeModule({
      local: false,
      moduleName: "profile",
      connectionName: "profile",
      targetAuthority: { runtimeRole: "PLATFORM" },
      apiName: "/identity/scopes/me",
      methodName: "GET",
      tenant: request.tenant,
      request: { tenant: request.tenant },
      header: {
        Authorization: request.authorization,
        "X-Enterprise-Code": request.enterpriseCode,
      },
      timeoutMs: 10000,
      maxAttempts: 1,
    });
    for (let n = 0; n < 7 && scope; n++) {
      if (scope.data !== undefined) scope = scope.data;
      else if (scope.result !== undefined) scope = scope.result;
      else break;
    }
    if (
      scope?.principalCode !== auth.loginId ||
      !Array.isArray(scope.scopes) ||
      !Array.isArray(scope.deniedScopes)
    )
      this.fail("Profile scope resolution is unavailable");
    const matches = (s) => {
      if (s.tenantCode && s.tenantCode !== request.tenant) return false;
      if (s.capabilityCode && !["commerce", "order"].includes(s.capabilityCode))
        return false;
      if (
        s.permissionCode &&
        !router.isPermissionGranted(
          "commerce.dispute.review",
          [s.permissionCode],
          {},
        )
      )
        return false;
      return (
        (s.scopeType === "GLOBAL" && s.scopeCode === "*") ||
        (s.scopeType === "TENANT" && s.scopeCode === request.tenant) ||
        (s.scopeType === "ENTERPRISE" && s.scopeCode === request.enterpriseCode)
      );
    };
    if (!scope.scopes.some(matches) || scope.deniedScopes.some(matches))
      this.fail("Order review is outside your assigned scope");
    return request;
  },
  /** Lists enterprise-bounded cases for an authorized moderator. */
  queue: async function (input) {
    const request = await this.staff(input);
    return { cases: (await this.records(request, {})).map(this.project) };
  },
  /** Records a reviewed manual outcome without issuing refunds or reversing asset and reward transfers. */
  resolve: async function (input) {
    const request = await this.staff(input),
      p = request.payload || {},
      key = request.idempotencyKey;
    let row = (await this.records(request, { code: request.code }))[0];
    if (!row) this.fail("The review request was not found");
    if (row.ownerId === request.ownerId)
      this.fail("A different employee must review the request");
    if (
      p.confirmed !== true ||
      typeof key !== "string" ||
      !/^[A-Za-z0-9._:-]{8,180}$/.test(key) ||
      !["RESOLVED", "REJECTED"].includes(p.outcome) ||
      typeof p.reason !== "string" ||
      p.reason.trim().length < 10 ||
      p.reason.length > 2000
    )
      this.fail("Review the outcome and provide a resolution reason");
    if (row.evidence.decision?.commandKey === key) {
      if (
        row.status !== p.outcome ||
        row.evidence.decision.reason !== p.reason.trim()
      )
        this.fail("This decision reference belongs to another outcome");
      return this.project(row);
    }
    if (row.status !== "SUBMITTED" || row.revision !== p.expectedRevision)
      this.fail("This case changed; reload before deciding");
    await SERVICE.DefaultOrderLifecycleRequestService.update({
      ...this.storage(request),
      query: {
        code: row.code,
        enterpriseCode: request.enterpriseCode,
        revision: row.revision,
        status: "SUBMITTED",
      },
      model: {
        code: row.code,
        revision: row.revision + 1,
        status: p.outcome,
        evidence: {
          ...row.evidence,
          decision: {
            commandKey: key,
            by: request.authData.loginId,
            at: new Date().toISOString(),
            reason: p.reason.trim(),
            outcome: p.outcome,
          },
        },
      },
    });
    return this.project((await this.records(request, { code: row.code }))[0]);
  },
};
