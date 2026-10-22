/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const crypto = require("node:crypto");
const { isDeepStrictEqual: same } = require("node:util");
/**
 * @module digitalCore/service/defaultDigitalCommerceCouponReminderService
 * @description Selects current fixed-expiry coupon sources through the existing Process/Cron action
 * contract.
 * Inputs: Signed Process execution or private Profile callback, complete original purchase evidence and
 * inert owner policy.
 * Outputs: Current source eligibility and bounded candidates with submission outcomes, not delivery
 * acceptance.
 * Effects: Reads lifecycle/Checkout/delivery evidence and delegates reminders; registers no active job or
 * new outbox.
 * Failure behavior: Disabled sweep reads nothing; authority/source drift rejects, delivery uncertainty
 * remains explicit output.
 * Exported members: fail, settings, authority, candidates, source, sweep.
 * @owner digitalCore
 * @layer service
 * @override Override source/action members without weakening complete reads, fresh runtime admission or
 * Profile recipient authority.
 * @see ../../llm/contracts/coupon-expiry-reminders.md
 */
const configuration = require("../utils/configuration");
module.exports = {
  /**
   * Rejects incomplete source evidence without recording a successful reminder occurrence.
   * @returns {never} Always throws the bounded coupon expiry source error.
   * @remarks Effects: No occurrence, intent or source mutation.
   * Failure behavior: Throws Coupon expiry source is unconfirmed.
   * @override Keep unconfirmed source distinct from an empty eligible set.
   */
  fail: function () { throw new Error("Coupon expiry source is unconfirmed"); },
  /**
   * Validates complete owner defaults, including an explicit inert activation gate.
   * @returns {Object} Effective couponReminders policy returned by reference, including explicit enabled
   * flag.
   * @remarks Effects: Reads and validates owner numeric ranges; no schedule activation.
   * Failure behavior: Throws for missing enabled Boolean or invalid lead-time/candidate/trigger bounds.
   * @override Preserve owner definitions and valid overrides; false is not missing configuration.
   */
  settings: function () {
    const p = CONFIG.get("digitalCore")?.couponReminders;
    if (!p || typeof p.enabled !== "boolean" ||
        !["leadTimeSeconds", "maximumCandidates", "maximumTriggerAgeSeconds"].every(key =>
          configuration.integer(p[key], p.validation?.[key]))) this.fail();
    return p;
  },
  /**
   * Admits only a verified Process runtime in its exact tenant and Enterprise partition, never
   * context-provided grants.
   * @param {Object} r Original Process service request with signed tenant/Enterprise and workflow/Digital
   * claims.
   * @returns {Object} Validated tenant/enterpriseCode and cloned runtime authData.
   * @remarks Effects: Checks runtime module, permission and consistent aliases; no data read.
   * Failure behavior: Throws for human/system/foreign context or absent notification-read/workflow
   * authority.
   * @override Execution context cannot supply runtime grants or select another Enterprise.
   */
  authority: function (r) {
    const a = SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(r, "digitalCore");
    const enterpriseCode = a.enterpriseCode || a.entCode;
    if (a.principalType !== "service" || a.isSystem || a.tenant !== r.tenant || !a.modules?.includes("workflow") ||
        !a.permissions?.includes("commerce.digital.notification.read") ||
        [r.enterpriseCode, r.entCode, a.enterpriseCode, a.entCode].some(v => v !== undefined && v !== enterpriseCode)) this.fail();
    const source = SERVICE.DefaultDigitalCommerceCouponAcquisitionService;
    source.identifier(r.tenant); source.identifier(enterpriseCode);
    return { tenant: r.tenant, enterpriseCode, authData: structuredClone(a) };
  },
  /**
   * Reads committed fixed-expiry v2 units, checking both canonical lifecycle owners and exact
   * Checkout/delivery proof.
   * @param {Object} r Trusted tenant and merchant source partition for complete entitlement reads.
   * @param {number} now Epoch milliseconds defining the current eligibility window.
   * @param {Object} p Validated leadTimeSeconds and maximumCandidates policy.
   * @param {string} [entitlementCode] Optional exact persisted entitlement selector for private source
   * callback.
   * @returns {Promise<Array<Object>>} Stable occurrence/source coordinates with typed owner/order/expiry; no
   * token or contact.
   * @remarks Effects: Reads complete bounded entitlement, Promotion, Checkout and delivery evidence; no
   * consumption or dispatch.
   * Failure behavior: Rejects contradictory retained rights, timestamps, incomplete commit proof or
   * candidate overflow.
   * @override Skip NONE/used/expired/inactive units, but do not hide malformed evidence as an empty scan.
   */
  candidates: async function (r, now, p, entitlementCode) {
    const source = SERVICE.DefaultDigitalCommerceCouponAcquisitionService, lifecycle = SERVICE.DefaultDigitalCommerceEntitlementService;
    const items = await source.all("DefaultDigitalEntitlementService", r, {
      enterpriseCode: r.enterpriseCode, digitalDeliveryType: "COUPON_CODE", providerOwner: "promotion",
      ...(entitlementCode ? { code: entitlementCode } : {}),
    });
    const candidates = [];
    for (const item of items) {
      if (item.active !== true || item.status !== "ACTIVE" || item.purchasePolicy?.version !== 2 ||
          !["UNCLAIMED", "CLAIMED"].includes(item.claimStatus)) continue;
      const window = lifecycle.couponWindow(item);
      if (window.mode === "NONE" || Date.parse(window.at) <= now || Date.parse(window.at) > now + p.leadTimeSeconds * 1000) continue;
      const scope = { ...r, ownerId: item.ownerId, orderCode: item.orderCode };
      const coupon = await SERVICE.DefaultPromotionOperationService.readLifecycleCoupon(scope, item.providerCode);
      if (coupon.tenant !== r.tenant || coupon.enterpriseCode !== r.enterpriseCode || coupon.code !== item.providerCode ||
          coupon.soldTo !== item.ownerId || coupon.orderCode !== item.orderCode || coupon.productCode !== item.productCode ||
          lifecycle.couponPurchaseEntryCode(coupon) !== item.orderEntryCode || !same(coupon.purchasePolicy, item.purchasePolicy) ||
          new Date(coupon.soldAt).getTime() !== new Date(item.purchasedAt).getTime()) this.fail();
      if (coupon.active !== true || !["DELIVERED", "CLAIMED"].includes(coupon.status) ||
          !["UNCLAIMED", "CLAIMED"].includes(coupon.benefitStatus)) continue;
      if (!same(lifecycle.couponWindow(coupon), window)) this.fail();
      const checkpoint = await source.one("DefaultCheckoutCheckpointService", scope, {
        orderCode: item.orderCode, status: "COMPLETED", enterpriseCode: r.enterpriseCode, ownerId: item.ownerId,
      });
      if (checkpoint.status !== "COMPLETED" || checkpoint.evidence?.orderCode !== item.orderCode ||
          !checkpoint.evidence?.digitalDeliveryCodes?.includes(item.providerCode)) this.fail();
      const delivery = await source.one("DefaultDigitalDeliveryService", scope, {
        entitlementCode: item.code, enterpriseCode: r.enterpriseCode, ownerId: item.ownerId,
        orderCode: item.orderCode, providerCode: item.providerCode, deliveryType: "COUPON_CODE", status: "DELIVERED",
      });
      if (delivery.active !== true || !Number.isFinite(Date.parse(delivery.deliveredAt)) ||
          !Number.isFinite(Date.parse(item.purchasedAt)) || Date.parse(item.purchasedAt) > now ||
          Date.parse(delivery.deliveredAt) < Date.parse(item.purchasedAt) || Date.parse(delivery.deliveredAt) > now) this.fail();
      const ownerRef = source.typedOwner(item.purchasePolicy.originalOwnerRef);
      const occurrenceKey = "COUPON_EXPIRY_" + crypto.createHash("sha256")
        .update(JSON.stringify([r.tenant, item.code, window.at])).digest("hex");
      candidates.push({ sourceModule: "digitalCore", sourceType: "DIGITAL_COUPON_EXPIRING", sourceCode: item.code,
        enterpriseCode: r.enterpriseCode, ownerRef, orderCode: item.orderCode, expiresAt: window.at, occurrenceKey });
      if (candidates.length > p.maximumCandidates) this.fail();
    }
    return candidates;
  },
  /**
   * Private Profile callback derives current ownership from the exact persisted entitlement, never the
   * request body.
   * @param {Object} request Exact private Profile runtime callback; body has channel, enterpriseCode,
   * entitlementCode and occurrenceKey.
   * @returns {Promise<Object>} Version1 current eligible proof, with typed owner/expiry only when eligible.
   * @remarks Effects: Reads candidate twice while checking deployment grant, original privacy and
   * request/config stability.
   * Failure behavior: Rejects disabled source, missing grant, alias drift or changing lifecycle; a stable
   * noncandidate returns eligible:false.
   * @override Derive ownership from persisted entitlement; callback coordinates never authorize another
   * owner.
   */
  source: async function (request) {
    const p = structuredClone(this.settings()), input = request.body ?? request.payload ?? request.httpRequest?.body;
    const auth = SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(request, "digitalCore");
    SERVICE.DefaultLoggerService.assertSensitiveRequest(request);
    const principal = auth.entCode || auth.enterpriseCode, before = structuredClone(request.authData);
    if (!p.enabled || auth.principalType !== "service" || auth.isSystem || auth.tenant !== request.tenant ||
        !auth.modules?.includes("profile") || !auth.permissions?.includes("commerce.digital.notification.read") ||
        !input || Object.keys(input).sort().join(",") !== "channel,enterpriseCode,entitlementCode,occurrenceKey" ||
        input.channel !== "IN_APP" || !/^COUPON_EXPIRY_[a-f0-9]{64}$/.test(input.occurrenceKey)) this.fail();
    const source = SERVICE.DefaultDigitalCommerceCouponAcquisitionService;
    source.identifier(input.enterpriseCode); source.identifier(input.entitlementCode);
    const original = structuredClone(input), tenant = request.tenant, headers = structuredClone(request.httpRequest?.headers);
    const bound = () => {
      if (!same(before, request.authData) || request.tenant !== tenant || !same(p, this.settings()) ||
          !same(headers, request.httpRequest?.headers) || !same(input, original) ||
          [request.entCode, request.enterpriseCode, auth.entCode, auth.enterpriseCode, headers?.["x-enterprise-code"]]
            .some(v => v !== undefined && v !== principal) ||
          [request.tenantCode, auth.tenantCode, headers?.["x-tenant-code"]].some(v => v !== undefined && v !== tenant) ||
          [request.body, request.payload, request.httpRequest?.body].some(v => v !== undefined && !same(v, original)) ||
          Object.keys(request.query || {}).length || Object.keys(request.httpRequest?.query || {}).length) this.fail();
      const grants = Array.isArray(p.sourceCallers) ? p.sourceCallers.filter(g =>
        g.tenant === tenant && g.principalEnterpriseCode === principal && g.enterpriseCode === original.enterpriseCode &&
        g.serviceId === auth.serviceId && ["projectCode", "environmentCode", "serverCode", "instanceCode", "assignmentCode"]
          .every(k => typeof g[k] === "string" && g[k] && g[k] === auth.runtimeScope?.[k]) &&
        g.instanceCode === auth.runtimeInstanceId && g.environmentCode === NODICS.getSelectedEnvironmentName()) : [];
      if (grants.length !== 1 || (CONFIG.get("runtimeRole")?.code || CONFIG.get("runtimeRole")) !== "COMMERCE") this.fail();
    };
    bound();
    const scope = { tenant, enterpriseCode: original.enterpriseCode }, now = Date.now();
    const first = await this.candidates(scope, now, p, original.entitlementCode); bound();
    const second = await this.candidates(scope, Date.now(), p, original.entitlementCode); bound();
    if (!same(first, second)) this.fail();
    const candidate = first.find(c => c.occurrenceKey === original.occurrenceKey);
    return { contractVersion: 1, tenant, sourceModule: "digitalCore", sourceType: "DIGITAL_COUPON_EXPIRING",
      source: original, eligible: !!candidate, ...(candidate ? { ownerRef: candidate.ownerRef, expiresAt: candidate.expiresAt } : {}) };
  },
  /**
   * Process ACTION callable. Process records skips/outcomes; Communication alone owns intents, attempts and
   * retries.
   * @param {Object} request Signed Process runtime request admitted in its own tenant/Enterprise.
   * @param {Object} execution Persisted instance/context, couponExpirySweep ACTION node, fresh Cron
   * provenance and empty payload.
   * @returns {Promise<Object>} Process COMPLETED output with DISABLED/COMPLETE/UNCONFIRMED source status and
   * delivery submission outcomes.
   * @remarks Effects: When enabled, reads stable complete candidates and submits owner-proven reminders
   * through delivery service; installs no job.
   * Failure behavior: Disabled returns without source reads; invalid execution or authority/source/policy
   * drift rejects. Delivery uncertainty remains output.
   * @override Keep local ACTION provenance and bounds; Process completion is not message delivery or
   * deployment activation.
   */
  sweep: async function (request, execution) {
    const p = structuredClone(this.settings());
    if (!p.enabled) return { status: "COMPLETED", output: { sourceStatus: "DISABLED", deliveryAttempted: false, candidates: [] } };
    const r = this.authority(request), original = structuredClone(execution), context = execution?.context, now = Date.now();
    if (execution?.node?.action?.moduleName !== "digitalCore" || execution.node.action.operation !== "couponExpirySweep" ||
        execution.instance?.tenant !== r.tenant || !same(execution.instance.context, context) ||
        context?.source !== "cronjob" || context.cronJobTenant !== r.tenant ||
        !Number.isFinite(Date.parse(context.firedAt)) || Date.parse(context.firedAt) > now ||
        now - Date.parse(context.firedAt) > p.maximumTriggerAgeSeconds * 1000 ||
        Object.keys(execution.payload || {}).length) this.fail();
    SERVICE.DefaultDigitalCommerceCouponAcquisitionService.identifier(context.cronJobCode);
    const first = await this.candidates(r, now, p), second = await this.candidates(r, now, p);
    if (!same(first, second) || !same(original, execution) || !same(r, this.authority(request))) this.fail();
    const outcomes = [];
    for (const candidate of first) {
      if (!same(original, execution) || !same(r, this.authority(request)) || !same(p, this.settings())) this.fail();
      outcomes.push(await SERVICE.DefaultDigitalCouponReminderDeliveryService.notify(r, candidate));
    }
    return { status: "COMPLETED", output: { sourceStatus: outcomes.some(o => o.status === "UNCONFIRMED") ? "UNCONFIRMED" : "COMPLETE",
      observedAt: new Date(now).toISOString(), deliveryAttempted: outcomes.some(o => o.deliveryAttempted), candidates: first, outcomes } };
  },
};
