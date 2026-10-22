/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
const { isDeepStrictEqual: same } = require("node:util");
const { randomUUID } = require("node:crypto");
/**
 * @module checkoutCore/service/defaultCheckoutBundleRecoveryService
 * @description Resumes original bundle or coupon purchases through their domain owners without payment
 * execution, repricing or competing compensation.
 * @owner checkoutCore
 * @layer service
 * @remarks Checkout forward recovery retains the original captured or uncertain obligation before
 * compensation. It reuses original Digital/fulfillment owner phases under persisted lease/CAS; no
 * repricing, replacement Cart, second charge or competing refund is allowed.
 * Inputs and outputs are specified on each exported member below.
 * Effects and failures remain in the existing owner flow; missing evidence is never synthetic success.
 * Exported members: leaseMs, retain, qualify, action, completed, assertFulfillment, fulfillment,
 * result, resume.
 * @override Customize through the existing loader-visible module members, preserving private
 * authority.
 */
module.exports = {
  /**
   * Validates the implementing owner's complete takeover policy.
   * @returns {number} Validated effective original-recovery takeover lease duration.
   * @remarks Effects: Reads only Checkout-owned policy.
   * Failure behavior: Rejects missing/invalid lease configuration.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  leaseMs: function () {
    const value = CONFIG.get("checkoutCore")?.bundleRecovery?.leaseMs;
    if (!Number.isSafeInteger(value) || value <= 0 || !Number.isSafeInteger(Date.now() + value))
      throw new Error("Checkout bundle recovery lease is unavailable");
    return value;
  },
  /**
   * Retains a forward-only obligation before any generic compensation effects, including uncertain fence
   * reads.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {Object} checkpoint Owner input checkpoint; exact shape is constrained by this operation's
   * retained source contract.
   * @param {Object} units Owner input units; exact shape is constrained by this operation's retained
   * source contract.
   * @param {Object} kind Owner input kind; exact shape is constrained by this operation's retained
   * source contract.
   * @returns {Promise<Object>} Original checkpoint with persisted forward-only obligation.
   * @remarks Effects: CAS-retains kind/purchase identities before generic compensation effects.
   * Failure behavior: Rejects conflicting retained obligation or unresolved checkpoint write.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  retain: async function (request, checkpoint, units, kind) {
    if (!['BUNDLE', 'COUPON'].includes(kind)) throw new Error('Original recovery kind is required');
    const recovery = SERVICE.DefaultCheckoutCompensationRecoveryService;
    const scope = { ...request, commandCode: checkpoint.idempotencyKey };
    const existing = await recovery.rows(SERVICE.DefaultCheckoutCheckpointService, scope,
      { ownerId: request.ownerId, idempotencyKey: checkpoint.idempotencyKey });
    if (existing.length > 1) throw recovery.failure();
    if (existing.length) {
      const row = recovery.assertOwner(scope, existing[0]);
      if (row.cartCode !== request.payload.cartCode || row.evidence?.orderCode !== request.payload.orderCode ||
          row.status !== "COMPLETED" && (!same(row.evidence?.bundleForwardRecovery?.purchaseCodes, units.map(u => u.code)) ||
            row.evidence.bundleForwardRecovery.kind !== kind))
        throw recovery.failure();
      return row;
    }
    const model = { code: checkpoint.idempotencyKey, tenant: request.tenant, enterpriseCode: request.enterpriseCode,
      ownerId: request.ownerId, cartCode: request.payload.cartCode, orderCode: request.payload.orderCode,
      idempotencyKey: checkpoint.idempotencyKey, status: "COMPENSATION_REQUIRED", revision: 0,
      correlationId: checkpoint.correlationId || checkpoint.idempotencyKey,
      evidence: { ownerRef: checkpoint.ownerRef, actorRef: checkpoint.actorRef,
        participantEnterpriseCode: checkpoint.participantEnterpriseCode, merchantScope: checkpoint.merchantScope,
        orderCode: request.payload.orderCode, completed: checkpoint.completed, compensation: [],
        bundleForwardRecovery: { contractVersion: 1, kind, purchaseCodes: units.map(u => u.code), status: "READY" } } };
    const ports = SERVICE.DefaultCheckoutPlacementPortsService;
    await SERVICE.DefaultCheckoutCheckpointService.save({ tenant: request.tenant, authData: ports.serviceAuthData(request),
      model: ports.persistenceModel(model), options: { insertOnly: true, recursive: false } });
    const saved = await recovery.checkpoint(scope);
    if (!same(saved.evidence, model.evidence) || saved.cartCode !== model.cartCode || saved.orderCode !== model.orderCode)
      throw recovery.failure();
    return saved;
  },
  /**
   * Checks immutable original references and positive capture evidence without changing any owner state.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {Object} row Original persisted owner record and retained evidence.
   * @returns {Promise<Object>} Verified original scope, units and Order.
   * @remarks Effects: Read-only original financial/domain evidence inspection.
   * Failure behavior: Rejects foreign owner, changed keys, unsupported kind or unconfirmed
   * capture/obligation.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  qualify: async function (request, row) {
    this.leaseMs();
    const recovery = SERVICE.DefaultCheckoutCompensationRecoveryService, plan = row.evidence?.bundleForwardRecovery;
    recovery.assertOwner(request, row);
    if (request.auctionFunds || row.status !== "COMPENSATION_REQUIRED" || row.code !== request.commandCode ||
        row.idempotencyKey !== request.commandCode || row.enterpriseCode !== request.enterpriseCode ||
        row.orderCode !== row.evidence?.orderCode || !row.cartCode ||
        !Number.isSafeInteger(row.revision) || row.revision < 0 || !Number.isSafeInteger(row.revision + 2) ||
        !same(row.evidence.actorRef, request.actorRef) || !same(row.evidence.compensation, []) ||
        row.evidence.paymentCompensationIntent || plan?.contractVersion !== 1 ||
        !['BUNDLE', 'COUPON'].includes(plan.kind) || !["READY", "RUNNING"].includes(plan.status) ||
        !Array.isArray(plan.purchaseCodes) || !plan.purchaseCodes.length || new Set(plan.purchaseCodes).size !== plan.purchaseCodes.length ||
        plan.kind === 'BUNDLE' && plan.purchaseCodes.length !== 1 ||
        plan.status === "RUNNING" && (!Number.isSafeInteger(plan.leaseUntil) || plan.leaseUntil > Date.now())) throw recovery.failure();
    const scope = { ...request, idempotencyKey: request.commandCode,
      payload: { cartCode: row.cartCode, orderCode: row.orderCode } };
    if (plan.kind === 'COUPON') {
      const result = await SERVICE.DefaultDigitalCommerceCheckoutService.resolveCouponForwardRecovery(scope,
        { orderCode: row.orderCode, cartCode: row.cartCode, couponCodes: plan.purchaseCodes });
      if (['tenant', 'enterpriseCode', 'participantEnterpriseCode', 'ownerId', 'ownerRef', 'actorRef', 'authData', 'authorization', 'idempotencyKey']
        .some(key => !same(result.scope?.[key], scope[key])) || result.order?.code !== row.orderCode ||
        result.order.cartCode !== row.cartCode || result.scope.storeCode !== request.merchantScope?.storeCode ||
        !same(result.units?.map(u => u.code).sort(), [...plan.purchaseCodes].sort())) throw recovery.failure();
      return result;
    }
    const digital = SERVICE.DefaultDigitalBundleSettlementService;
    const unit = await digital.resolve(scope, { code: plan.purchaseCodes[0], orderCode: row.orderCode,
      checkoutIdempotencyKey: request.commandCode });
    if (unit.cartCode !== row.cartCode || unit.ownerId !== request.ownerId ||
        unit.participantEnterpriseCode !== request.participantEnterpriseCode || !same(unit.buyerRef, request.ownerRef) ||
        !same(unit.actorRef, row.evidence.actorRef) || unit.storeCode !== request.merchantScope?.storeCode)
      throw recovery.failure();
    scope.storeCode = unit.storeCode;
    scope.locale = unit.locale;
    const purchase = await digital.purchase(scope, unit);
    if (["CANCELLING", "CANCELLED"].includes(purchase.status)) throw recovery.failure();
    await digital.capture(scope, purchase);
    const order = await recovery.one(SERVICE.DefaultCommerceOrderService, scope,
      { code: row.orderCode, ownerId: request.ownerId, enterpriseCode: request.enterpriseCode,
        cartCode: row.cartCode, idempotencyKey: request.commandCode });
    if (order.promotionCode || order.couponCode || order.evidence?.reservationCodes?.length ||
        row.evidence.completed.includes('PROMOTION_COMMITTED'))
      throw recovery.failure();
    return { scope, units: [unit], order };
  },
  /**
   * Exposes an action only for a currently qualified original obligation; read failures never grant
   * authority.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {Object} row Original persisted owner record and retained evidence.
   * @returns {Promise<string|undefined>} Qualified original recovery action, otherwise undefined.
   * @remarks Effects: Read-only qualification; cannot dispatch recovery.
   * Failure behavior: Qualification failure suppresses action, never creates retry authority.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  action: async function (request, row) {
    if (!row.evidence?.bundleForwardRecovery) return undefined;
    try { await this.qualify(request, row); return row.evidence.bundleForwardRecovery.kind === 'COUPON'
      ? 'RESUME_COUPON_PURCHASE' : "RESUME_BUNDLE_PURCHASE"; }
    catch (_) { return undefined; }
  },
  /**
   * Recognizes the original command checkpoint after its in-place forward completion.
   * @param {Object} row Original persisted owner record and retained evidence.
   * @returns {boolean} Whether the same command checkpoint fully records original completion.
   * @remarks Effects: Pure retained journal/identity comparison.
   * Failure behavior: Missing/inconsistent evidence returns false.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  completed: function (row) {
    const plan = row.evidence?.bundleForwardRecovery;
    return row.status === "COMPLETED" && row.code === row.idempotencyKey && row.orderCode === row.evidence?.orderCode &&
      typeof row.orderCode === 'string' && row.orderCode.length > 0 && typeof row.cartCode === 'string' && row.cartCode.length > 0 &&
      plan?.contractVersion === 1 && ['BUNDLE', 'COUPON'].includes(plan.kind) && plan.status === "COMPLETED" &&
      Array.isArray(plan.purchaseCodes) && plan.purchaseCodes.length > 0 &&
      new Set(plan.purchaseCodes).size === plan.purchaseCodes.length && (plan.kind !== 'BUNDLE' || plan.purchaseCodes.length === 1) &&
      same(row.evidence.digitalSaleCodes, plan.purchaseCodes) && same(row.evidence.digitalDeliveryCodes, plan.purchaseCodes);
  },
  /**
   * Validates fulfillment readback against the original purchase obligation.
   * @param {Object} scope Original admitted purchaser scope and placement idempotencyKey.
   * @param {Object} order Persisted original Order code, currency and exact totalAmount.
   * @param {Object|undefined} row Exact original consignment readback.
   * @returns {Object} Unchanged matching consignment. No persistence or financial effects.
   * @throws {Error} Missing receipt or changed Order, original key, currency or amount.
   * @override Both existing-record and insert-readback paths use this effective member.
   * Preserve original obligation binding; this predicate grants no private persistence authority.
   */
  assertFulfillment: function (scope, order, row) {
    if (!row || row.orderCode !== order.code || row.idempotencyKey !== scope.idempotencyKey + ":fulfillment" ||
        row.currency !== order.currency || row.totalAmount !== order.totalAmount)
      throw SERVICE.DefaultCheckoutCompensationRecoveryService.failure();
    return row;
  },
  /**
   * Reads or creates the original fulfillment identity, rejecting conflicting retained receipts.
   * @param {Object} scope Owner input scope; exact shape is constrained by this operation's retained
   * source contract.
   * @param {Object} order Persisted original Order and owner binding.
   * @returns {Promise<Object>} Verified original fulfillment identity/receipt.
   * @remarks Effects: Reads or creates only the original consignment with insert-only semantics.
   * Failure behavior: Rejects duplicate or conflicting original Order/key/currency/amount proof.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  fulfillment: async function (scope, order) {
    const recovery = SERVICE.DefaultCheckoutCompensationRecoveryService;
    const query = { code: order.code + ":1", ownerId: scope.ownerId, enterpriseCode: scope.enterpriseCode };
    const rows = await recovery.rows(SERVICE.DefaultConsignmentService, scope, query);
    if (rows.length > 1) throw recovery.failure();
    if (rows.length) return this.assertFulfillment(scope, order, rows[0]);
    const ports = SERVICE.DefaultCheckoutPlacementPortsService;
    await SERVICE.DefaultConsignmentService.save({ tenant: scope.tenant, authData: ports.serviceAuthData(scope),
      model: ports.persistenceModel({ ...query, tenant: scope.tenant, orderCode: order.code, status: 'READY', revision: 0,
        idempotencyKey: scope.idempotencyKey + ':fulfillment', correlationId: scope.correlationId || scope.idempotencyKey,
        currency: order.currency, totalAmount: order.totalAmount }), options: { insertOnly: true, recursive: false } });
    return this.assertFulfillment(scope, order, await recovery.one(SERVICE.DefaultConsignmentService, scope, query));
  },
  /**
   * Reuses post-commit notification ownership outside financial compensation and exposes only the
   * original public binding.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {Object} row Original persisted owner record and retained evidence.
   * @returns {Promise<Object>} Original command/Cart/Order completion DTO and revision.
   * @remarks Effects: Reuses post-commit notification owner outside financial compensation.
   * Failure behavior: Notification handling follows existing owner behavior; no financial rollback is
   * introduced.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  result: async function (request, row) {
    await SERVICE.DefaultOrderPlacementService.notifyCommitted({ ...request, orderCode: row.orderCode },
      SERVICE.DefaultCheckoutPlacementPortsService.create(), row);
    return { commandCode: row.idempotencyKey, cartCode: row.cartCode, orderCode: row.orderCode,
      status: 'COMPLETED', revision: row.revision };
  },
  /**
   * Resumes idempotent domain effects under a bounded persisted lease and completes the same checkpoint.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @returns {Promise<Object>} Original command completion or current qualified recovery result.
   * @remarks Effects: Claims persisted bounded lease, resumes original domain effects and completes same
   * checkpoint.
   * Failure behavior: Rejects absent confirmation, conflicting lease/identity or unqualified owner
   * evidence; uncertainty remains recoverable.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  resume: async function (request) {
    const recovery = SERVICE.DefaultCheckoutCompensationRecoveryService;
    if (!same(request.payload, { confirmed: true })) throw recovery.failure();
    const original = await recovery.checkpoint(request);
    if (!same(original.evidence?.actorRef, request.actorRef)) throw recovery.failure();
    if (this.completed(original)) return this.result(request, original);
    const { scope, units, order } = await this.qualify(request, original);
    const codes = units.map(unit => unit.code), kind = original.evidence.bundleForwardRecovery.kind;
    let row = await recovery.transition(request, original, "COMPENSATION_REQUIRED", { ...original.evidence,
      bundleForwardRecovery: { ...original.evidence.bundleForwardRecovery, status: "RUNNING",
        attemptCode: randomUUID(), leaseUntil: Date.now() + this.leaseMs() } });
    try {
      const digital = SERVICE.DefaultDigitalCommerceCheckoutService;
      const sales = await digital.confirmSale(scope, order, units);
      if (!same(sales?.map(unit => unit.code), codes) || sales.some(unit => !['SOLD', 'DELIVERED'].includes(unit.status))) throw recovery.failure();
      await this.fulfillment(scope, order);
      const deliveries = await digital.deliver(scope, order, sales);
      if (!same(deliveries?.map(unit => unit.code), codes) || deliveries.some(unit => unit.status !== "DELIVERED")) throw recovery.failure();
      const cartClosure = await SERVICE.DefaultCheckoutPlacementPortsService.closeCart(scope);
      if (!cartClosure.cartClosed) throw recovery.failure();
      const cart = await recovery.one(SERVICE.DefaultCartService, scope,
        { code: row.cartCode, ownerId: scope.ownerId, enterpriseCode: scope.enterpriseCode });
      const entries = await recovery.rows(SERVICE.DefaultCartEntryService, scope,
        { cartCode: row.cartCode, ownerId: scope.ownerId, enterpriseCode: scope.enterpriseCode, status: 'ACTIVE' });
      if (cart.status !== 'PLACED' || cart.active !== false || entries.length) throw recovery.failure();
      const evidence = { ...row.evidence, completed: [...row.evidence.completed],
        digitalReservationCodes: codes, digitalSaleCodes: codes, digitalDeliveryCodes: codes, cartClosure,
        bundleForwardRecovery: { contractVersion: 1, kind, purchaseCodes: codes, status: "COMPLETED" } };
      delete evidence.compensation;
      for (const phase of ["ORDERED", ...(order.evidence?.considerationType === 'CERTIFICATES' ? [] : ['PAYMENT_CAPTURED']),
        "DIGITAL_SOLD", "RELEASED", "DIGITAL_DELIVERED"])
        if (!evidence.completed.includes(phase)) evidence.completed.push(phase);
      row = await recovery.transition(request, row, "COMPLETED", evidence);
      return this.result(scope, row);
    } catch (error) {
      // Never overwrite a newer lease or a terminal write whose acknowledgement was lost.
      const current = await recovery.checkpoint(request);
      if (this.completed(current)) return this.result(scope, current);
      if (current.revision === row.revision && same(current.evidence, row.evidence))
        await recovery.transition(request, current, "COMPENSATION_REQUIRED", { ...current.evidence,
          bundleForwardRecovery: { contractVersion: 1, kind, purchaseCodes: codes, status: "READY" } });
      throw error;
    }
  },
};
