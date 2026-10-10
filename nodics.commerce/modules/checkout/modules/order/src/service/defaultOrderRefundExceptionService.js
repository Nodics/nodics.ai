/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
const crypto = require("node:crypto");
const { isDeepStrictEqual } = require("node:util");
/** @module order/service/defaultOrderRefundExceptionService @description Audits exact Local unused-coupon missing-policy exceptions without altering purchase terms or executing finance. @layer service @owner order */
module.exports = {
  /** Produces a fixed safe refusal, without retaining dependency errors. */
  fail: function () { throw new CLASSES.NodicsError("ERR_ORDER_REFUND_EXCEPTION"); },
  /** Requires affirmative generated and Mongo acknowledgements at every envelope layer. */
  assertWrite: function (value) {
    if (typeof value?.code !== "string" || !/^SUC_/.test(value.code)) this.fail();
    for (let n = 0; n < 8; n++) {
      if (!value || typeof value !== "object" || value.error || value.success === false || value.acknowledged === false ||
          (value.errors !== undefined && (!Array.isArray(value.errors) || value.errors.length)) ||
          ("code" in value && (typeof value.code !== "string" || !/^SUC_/.test(value.code)))) this.fail();
      if (Object.hasOwn(value, "result")) value = value.result;
      else if (Object.hasOwn(value, "data")) value = value.data;
      else { if (value.acknowledged !== true || value.matchedCount !== 1) this.fail(); return; }
    }
    this.fail();
  },
  /** Hashes normalized owner evidence independently of BSON prototypes and property order. */
  digest: function (value) {
    const normalize = value => value instanceof Date ? value.toISOString() : Array.isArray(value) ? value.map(normalize) :
      value && typeof value === "object" ? Object.fromEntries(Object.keys(value).sort().map(key => [key, normalize(value[key])])) : value;
    return crypto.createHash("sha256").update(JSON.stringify(normalize(structuredClone(value)))).digest("hex");
  },
  /** Requires exact metadata-owned Local classification and explicitly selected environment, never a name suffix. */
  settings: function () {
    const policy = (CONFIG.get("order") || {}).refunds || {}, config = policy.policyExceptions || {};
    const role = CONFIG.get("runtimeRole"), environment = CONFIG.get("environment");
    const name = NODICS.getSelectedEnvironmentName?.() || NODICS.getEnvironmentName?.();
    if (policy.enabled !== true || config.enabled !== true || environment?.class !== "LOCAL" ||
        (typeof role === "string" ? role : role?.code) !== "COMMERCE" ||
        !Array.isArray(config.environmentNames) || !config.environmentNames.length || config.environmentNames.length > 16 ||
        config.environmentNames.some(value => typeof value !== "string" || !value || value.includes("*")) ||
        !config.environmentNames.includes(name) || !Array.isArray(config.approvals) || !config.approvals.length || config.approvals.length > 16) this.fail();
    return { config, name };
  },
  /** Requires bounded generated SUC/count evidence; foreign or truncated rows never establish absence. */
  rows: async function (service, r, query) {
    const response = await service?.get?.({ ...SERVICE.DefaultOrderDisputeService.storage(r),
      query: { ...query, tenant: r.tenant }, options: { recursive: false, skipItemCache: true }, searchOptions: { pageSize: 3, pageNumber: 1 } });
    if (!response || typeof response.code !== "string" || !/^SUC_/.test(response.code) || response.error ||
        response.success === false || response.acknowledged === false ||
        (response.errors !== undefined && (!Array.isArray(response.errors) || response.errors.length)) ||
        !Array.isArray(response.result) || response.result.length > 1 || response.count !== response.result.length ||
        [response.total, response.totalCount].some(n => n !== undefined && n !== response.result.length)) this.fail();
    const read = (row, key) => key.split(".").reduce((value, part) => value?.[part], row);
    if (response.result.some(row => !row || typeof row !== "object" || Array.isArray(row) ||
      Object.entries({ ...query, tenant: r.tenant }).some(([key, value]) => !isDeepStrictEqual(read(row, key), value)))) this.fail();
    return response.result;
  },
  /** Refreshes Profile exceptional authority while preserving normal staff review and every scoped DENY. */
  load: async function (input, phase) {
    this.settings();
    const r = await SERVICE.DefaultOrderRefundRecoveryService.load(input), auth = r.authData || {};
    const permissions = ["commerce.dispute.review", "commerce.refund.exception.adjudicate"];
    if (!["adjudicate", "preview"].includes(phase)) permissions.push("commerce.refund.execute");
    const router = SERVICE.DefaultSecuredRequestPipelineService;
    if (auth.principalType !== "human" || !auth.loginId || auth.loginId === r.ownerId ||
        [input.tenant, auth.tenant].some(value => value !== undefined && value !== r.tenant) ||
        [auth.entCode, auth.enterpriseCode, input.enterpriseCode].some(value => value !== undefined && value !== r.enterpriseCode) ||
        permissions.some(permission => !router.isPermissionGranted(permission, router.getGrantedPermissions(r), {}))) this.fail();
    let scope = await SERVICE.DefaultModuleService.invokeModule({ local: false, moduleName: "profile", connectionName: "profile",
      targetAuthority: { runtimeRole: "PLATFORM" }, apiName: "/identity/scopes/me", methodName: "GET",
      tenant: r.tenant, request: { tenant: r.tenant }, header: { Authorization: r.authorization, "X-Enterprise-Code": r.enterpriseCode },
      timeoutMs: 10000, maxAttempts: 1 });
    for (let n = 0; n < 8; n++) {
      if (!scope || typeof scope !== "object" || scope.error || scope.success === false || scope.acknowledged === false ||
          (scope.errors !== undefined && (!Array.isArray(scope.errors) || scope.errors.length)) ||
          ("code" in scope && (typeof scope.code !== "string" || !/^SUC_/.test(scope.code)))) this.fail();
      if (Object.hasOwn(scope, "result")) scope = scope.result;
      else if (Object.hasOwn(scope, "data")) scope = scope.data;
      else break;
    }
    if (scope?.principalCode !== auth.loginId || !Array.isArray(scope.scopes) || !Array.isArray(scope.deniedScopes)) this.fail();
    for (const permission of permissions) {
      const matches = s => s && (!s.tenantCode || s.tenantCode === r.tenant) &&
        (!s.capabilityCode || ["commerce", "order"].includes(s.capabilityCode)) &&
        (!s.permissionCode || router.isPermissionGranted(permission, [s.permissionCode], {})) &&
        ((s.scopeType === "GLOBAL" && s.scopeCode === "*") || (s.scopeType === "TENANT" && s.scopeCode === r.tenant) ||
          (s.scopeType === "ENTERPRISE" && s.scopeCode === r.enterpriseCode));
      if (!scope.scopes.some(matches) || scope.deniedScopes.some(matches)) this.fail();
    }
    const cases = await this.rows(SERVICE.DefaultOrderLifecycleRequestService, r,
      { code: r.caseRow.code, enterpriseCode: r.enterpriseCode, requestType: "DISPUTE" });
    const caseRow = cases[0];
    if (!caseRow || caseRow.ownerId !== r.ownerId || caseRow.orderCode !== r.orderCode ||
        caseRow.evidence?.requestedResolution !== "REFUND" || !Number.isSafeInteger(caseRow.revision) || caseRow.revision < 0) this.fail();
    const orders = await this.rows(SERVICE.DefaultCommerceOrderService, r,
      { code: r.orderCode, enterpriseCode: r.enterpriseCode, ownerId: r.ownerId });
    const order = orders[0];
    if (!order || !["PLACED", "COMPLETED", "FULFILLED", "REFUND_PENDING", "REFUNDED"].includes(order.status)) this.fail();
    const entries = await this.rows(SERVICE.DefaultCommerceOrderEntryService, r,
      { orderCode: r.orderCode, enterpriseCode: r.enterpriseCode, ownerId: r.ownerId });
    if (entries.length !== 1 || String(entries[0].quantity) !== "1") this.fail();
    return { ...r, caseRow, order, entries, totalAmount: order.totalAmount, currency: order.currency };
  },
  /** Revalidates exact deployment pins, original capture and Digital-owned immutable unit/policy evidence. */
  evidence: async function (r, phase) {
    const { config, name } = this.settings();
    const selectionHash = this.digest({ config, name });
    const fields = ["tenant", "enterpriseCode", "ownerId", "orderCode", "caseCode", "amount", "currency", "entitlementCode", "couponCode"];
    if (config.approvals.some(pin => !pin || Object.keys(pin).length !== fields.length ||
      fields.some(key => !Object.hasOwn(pin, key) || typeof pin[key] !== "string" || !pin[key] || pin[key].includes("*")))) this.fail();
    const unit = await SERVICE.DefaultDigitalCommerceRefundService.exceptionCandidate(r, phase);
    const pins = { tenant: r.tenant, enterpriseCode: r.enterpriseCode, ownerId: r.ownerId, orderCode: r.orderCode,
      caseCode: r.caseRow.code, amount: SERVICE.DefaultExactAmountService.normalize(r.totalAmount), currency: r.currency,
      entitlementCode: unit.entitlementCode, couponCode: unit.couponCode };
    if (config.approvals.filter(pin => isDeepStrictEqual({ ...pin, amount: SERVICE.DefaultExactAmountService.normalize(pin.amount) }, pins)).length !== 1) this.fail();
    const captureRows = await this.rows(SERVICE.DefaultPaymentTransactionEntryService, r,
      { orderCode: r.orderCode, "evidence.operation": "CAPTURE" });
    const raw = captureRows[0];
    if (!raw || raw.enterpriseCode !== r.enterpriseCode || raw.ownerId !== r.ownerId || raw.status !== "CAPTURED") this.fail();
    const capture = await SERVICE.DefaultPaymentRefundExecutionService.orderCapture(r);
    if (capture.captureCode !== raw.code || SERVICE.DefaultExactAmountService.compare(capture.amount, r.totalAmount) !== 0 || capture.currency !== r.currency ||
        capture.providerCode !== "loyalty-reward-points" || capture.methodCode !== "LOYALTY_REWARD") this.fail();
    if (this.digest(this.settings()) !== selectionHash) this.fail();
    return { contractVersion: 1, kind: "LOCAL_UNUSED_COUPON_MISSING_REFUND_POLICY", environmentName: name, ...pins,
      productCode: unit.productCode, sku: unit.sku, policyHash: unit.policyHash,
      captureHash: this.digest({ ...capture, amount: SERVICE.DefaultExactAmountService.normalize(capture.amount) }) };
  },
  /** Checks retained immutable adjudication and returns only its bounded approval reference. */
  validate: async function (input, phase) {
    const r = await this.load(input, phase), evidence = await this.evidence(r, phase), audit = r.caseRow.evidence.refundPolicyException;
    const expected = { ...evidence, commandKey: audit?.commandKey, reason: audit?.reason, by: audit?.by, at: audit?.at, expectedRevision: audit?.expectedRevision };
    if (!audit || !isDeepStrictEqual(audit, expected) || typeof audit.commandKey !== "string" ||
        !/^[A-Za-z0-9._:-]{8,180}$/.test(audit.commandKey) || typeof audit.reason !== "string" || audit.reason.length < 10 ||
        typeof audit.by !== "string" || !audit.by || !Number.isFinite(Date.parse(audit.at)) ||
        !Number.isSafeInteger(audit.expectedRevision) || audit.expectedRevision < 0) this.fail();
    const reference = { commandKey: audit.commandKey, policyHash: audit.policyHash, captureHash: audit.captureHash };
    const records = await this.rows(SERVICE.DefaultOrderLifecycleRequestService, r,
      { code: r.refundCode, enterpriseCode: r.enterpriseCode, requestType: "REFUND" });
    if (records.length && (!isDeepStrictEqual(records[0].evidence?.approval?.policyException, reference) ||
        records[0].ownerId !== r.ownerId || records[0].orderCode !== r.orderCode || records[0].evidence?.caseCode !== r.caseRow.code ||
        records[0].evidence?.plan?.provider !== "digitalCore")) this.fail();
    return reference;
  },
  /** Records one immutable reviewed exception on the original SUBMITTED case; never executes refund effects. */
  adjudicate: async function (input) {
    try {
      const p = input.payload;
      if (!p || typeof p !== "object" || Array.isArray(p) ||
          Object.keys(p).some(key => !["confirmed", "reason", "expectedRevision", "idempotencyKey"].includes(key)) || p.confirmed !== true ||
          typeof p.reason !== "string" || p.reason.trim().length < 10 || p.reason.length > 2000 ||
          !Number.isSafeInteger(p.expectedRevision) || p.expectedRevision < 0 ||
          typeof input.idempotencyKey !== "string" || !/^[A-Za-z0-9._:-]{8,180}$/.test(input.idempotencyKey) ||
          (p.idempotencyKey !== undefined && p.idempotencyKey !== input.idempotencyKey)) this.fail();
      const r = await this.load(input, "adjudicate"), original = r.caseRow;
      const evidence = await this.evidence(r, "adjudicate"), prior = original.evidence.refundPolicyException;
      if (original.status !== "SUBMITTED" || r.order.evidence?.refundCode ||
          (await this.rows(SERVICE.DefaultOrderLifecycleRequestService, r,
            { code: r.refundCode, enterpriseCode: r.enterpriseCode, requestType: "REFUND" })).length) this.fail();
      if (prior) {
        if (prior.commandKey !== input.idempotencyKey || prior.reason !== p.reason.trim() || prior.expectedRevision !== p.expectedRevision ||
            prior.by !== r.authData.loginId || !isDeepStrictEqual(prior, { ...evidence, commandKey: prior.commandKey,
              reason: prior.reason, by: prior.by, at: prior.at, expectedRevision: prior.expectedRevision })) this.fail();
        return { caseCode: original.code, status: original.status, revision: original.revision, exceptionCommandKey: prior.commandKey };
      }
      if (original.revision !== p.expectedRevision || !Number.isSafeInteger(original.revision + 1)) this.fail();
      const audit = { ...evidence, commandKey: input.idempotencyKey, reason: p.reason.trim(), by: r.authData.loginId,
        at: new Date().toISOString(), expectedRevision: p.expectedRevision };
      const model = { code: original.code, revision: original.revision + 1, evidence: { ...original.evidence, refundPolicyException: audit } };
      const ack = await SERVICE.DefaultOrderLifecycleRequestService.update({ ...SERVICE.DefaultOrderDisputeService.storage(r),
        query: { tenant: r.tenant, enterpriseCode: r.enterpriseCode, ownerId: r.ownerId, orderCode: r.orderCode,
          code: original.code, requestType: "DISPUTE", status: "SUBMITTED", revision: original.revision, evidence: original.evidence },
        model, options: { recursive: false, upsert: false, returnModified: false } });
      this.assertWrite(ack);
      const saved = (await this.rows(SERVICE.DefaultOrderLifecycleRequestService, r,
        { code: original.code, enterpriseCode: r.enterpriseCode, ownerId: r.ownerId, orderCode: r.orderCode, requestType: "DISPUTE" }))[0];
      const expected = { ...original, ...model };
      if (!saved || ["code", "tenant", "enterpriseCode", "ownerId", "orderCode", "requestType", "status", "revision", "evidence"].some(key =>
        !isDeepStrictEqual(structuredClone(saved[key]), structuredClone(expected[key])))) this.fail();
      return { caseCode: saved.code, status: saved.status, revision: saved.revision, exceptionCommandKey: audit.commandKey };
    } catch (_) { this.fail(); }
  },
};
