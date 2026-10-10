/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

const crypto = require("node:crypto");
const { isDeepStrictEqual } = require('node:util');

/** @module digitalCore/src/service/defaultDigitalCommerceEntitlementService @description Owns Digital Commerce entitlement, delivery, reveal, and revocation evidence. @layer service @owner digitalCore */
module.exports = {
  /** Unwraps a standard result envelope while preserving raw provider values. */
  unwrap: function (response) {
    return response && Object.prototype.hasOwnProperty.call(response, "result")
      ? response.result
      : response;
  },
  /** Builds service auth for generated digital records. @param {Object} request Request. @returns {Object} Service auth. */
  serviceAuthData: function (request) {
    return Object.assign({}, request.authData || {}, {
      enterpriseCode: request.enterpriseCode,
      principalId: "digitalCommerceEntitlementService",
      code: "digitalCommerceEntitlementService",
      loginId: "digitalCommerceEntitlementService",
      principalType: "service",
      userGroups: ["serviceAccountUserGroup"],
      groups: ["serviceAccountUserGroup"],
    });
  },
  /** Applies generated-schema persistence fields. @param {Object} model Model. @returns {Object} Persistable model. */
  persistenceModel: function (model) {
    const now = new Date();
    return Object.assign({ active: true, created: now, updated: now }, model);
  },
  /** Requires successful generated evidence, without accepting fabricated local results. @param {Object} response Owner envelope. @returns {void} Evidence or rejection. */
  assertPersistence: function (response) {
    if (
      !response ||
      !/^SUC_/.test(response.code || "") ||
      response.success === false ||
      response.error ||
      (response.errors &&
        (!Array.isArray(response.errors) || response.errors.length))
    )
      throw new Error("Digital persistence was not confirmed");
  },
  /** Reads a bounded uncached owner result. @param {Object} service Generated owner. @param {Object} request Context. @param {Object} query Scoped selectors. @returns {Promise<Array>} Authoritative rows. */
  readRecords: async function (service, request, query) {
    if (!service?.get)
      throw new Error("Digital persistence owner is unavailable");
    const response = await service.get({
      tenant: request.tenant,
      authData: this.serviceAuthData(request),
      query,
      options: { recursive: false, skipItemCache: true },
      searchOptions: { pageSize: 101 },
    });
    this.assertPersistence(response);
    const rows = this.unwrap(response);
    if (!Array.isArray(rows) && !rows?.code)
      throw new Error("Digital owner returned an invalid record result");
    if (Array.isArray(rows) && rows.length > 100)
      throw new Error(
        "Digital owner result exceeds the complete-read bound; use a qualified paginated owner",
      );
    return Array.isArray(rows) ? rows : [rows];
  },
  /** Verifies persisted intended values, including normalized date evidence. @param {Object} saved Saved row. @param {Object} model Intended patch. @returns {void} Matching evidence or rejection. */
  assertSaved: function (saved, model) {
    if (
      !saved ||
      Object.keys(model).some(
        (key) => JSON.stringify(saved[key]) !== JSON.stringify(model[key]),
      )
    )
      throw new Error(
        "Digital persistence readback changed; inspect before retrying",
      );
  },
  /** Saves through a generated service when present. @param {Object} service Generated service. @param {Object} request Request. @param {Object} model Model. @returns {Promise<Object>} Saved model. */
  save: async function (service, request, model) {
    if (!service?.save || !service.get)
      throw new Error("Digital persistence owner is unavailable");
    const query = {
      code: model.code,
      tenant: request.tenant,
      ...(request.enterpriseCode
        ? { enterpriseCode: request.enterpriseCode }
        : {}),
    };
    const existing = await this.readRecords(service, request, query);
    if (existing.length > 1)
      throw new Error("Digital persistence identity is ambiguous");
    if (existing.length) {
      const immutable = {};
      for (const key of [
        "code",
        "tenant",
        "enterpriseCode",
        "ownerId",
        "orderCode",
        "orderEntryCode",
        "productCode",
        "providerOwner",
        "providerCode",
        "entitlementCode",
        "idempotencyKey",
        "purchasedAt",
        "validTo",
        "purchasePolicy",
        "requestType",
        "policyDecision",
        "reasonCode",
      ])
        if (model[key] !== undefined) immutable[key] = model[key];
      this.assertSaved(existing[0], immutable);
      return existing[0];
    }
    const intended = this.persistenceModel(model);
    this.assertPersistence(
      await service.save({
        tenant: request.tenant,
        authData: this.serviceAuthData(request),
        model: intended,
      }),
    );
    const rows = await this.readRecords(service, request, query);
    if (rows.length !== 1)
      throw new Error("Digital saved identity is missing or ambiguous");
    this.assertSaved(rows[0], intended);
    return rows[0];
  },
  /** Updates through a generated service when present. @param {Object} service Generated service. @param {Object} request Request. @param {Object} existing Existing model. @param {Object} patch Patch. @returns {Promise<Object>} Updated model. */
  update: async function (service, request, existing, patch) {
    if (
      !service?.update ||
      !Number.isSafeInteger(existing.revision) ||
      existing.revision < 0
    )
      throw new Error("Revisioned digital persistence owner is required");
    const model = Object.assign({}, patch, {
      code: existing.code,
      revision: existing.revision + 1,
      updated: new Date(),
    });
    const query = {
      tenant: request.tenant,
      code: existing.code,
      revision: existing.revision,
      status: existing.status,
    };
    if (existing.claimStatus !== undefined)
      query.claimStatus = existing.claimStatus;
    if (request.enterpriseCode) query.enterpriseCode = request.enterpriseCode;
    const response = await service.update({
      tenant: request.tenant,
      authData: this.serviceAuthData(request),
      query,
      model,
    });
    this.assertPersistence(response);
    if (
      response.result?.acknowledged !== true ||
      response.result?.matchedCount !== 1
    )
      throw new Error("Digital lifecycle write lost its revision");
    const rows = await this.readRecords(service, request, {
      tenant: request.tenant,
      code: existing.code,
      ...(request.enterpriseCode
        ? { enterpriseCode: request.enterpriseCode }
        : {}),
    });
    if (rows.length !== 1)
      throw new Error("Digital lifecycle identity is missing or ambiguous");
    this.assertSaved(rows[0], model);
    return rows[0];
  },
  /** Reads entitlement records. @param {Object} request Request. @param {Object} query Query. @returns {Promise<Array>} Entitlements. */
  listEntitlements: async function (request, query) {
    const scoped = Object.assign({}, query || {}, {
      tenant: request.tenant,
    });
    if (request.enterpriseCode) scoped.enterpriseCode = request.enterpriseCode;
    return this.readRecords(
      SERVICE.DefaultDigitalEntitlementService,
      request,
      scoped,
    );
  },
  /** Builds a customer-safe entitlement summary. @param {Object} entitlement Entitlement model. @returns {Object} Summary. */
  publicEntitlement: function (entitlement) {
    const retained = entitlement.purchasePolicy;
    const terms = retained?.terms;
    if (
      retained &&
      (retained.version !== 1 ||
        !Array.isArray(terms) ||
        terms.length > 30 ||
        terms.some((line) => typeof line !== "string" || line.length > 1000))
    )
      throw new Error("Retained coupon terms are invalid");
    return {
      code: entitlement.code,
      enterpriseCode: entitlement.enterpriseCode,
      ownerId: entitlement.ownerId,
      orderCode: entitlement.orderCode,
      orderEntryCode: entitlement.orderEntryCode,
      cartCode: entitlement.cartCode,
      productCode: entitlement.productCode,
      sku: entitlement.sku,
      status: entitlement.status,
      digitalDeliveryType: entitlement.digitalDeliveryType,
      providerOwner: entitlement.providerOwner,
      providerCode: entitlement.providerCode,
      claimStatus: entitlement.claimStatus,
      revision: entitlement.revision,
      purchasedAt: entitlement.purchasedAt,
      validTo: entitlement.validTo,
      purchaseTerms: retained ? [...terms] : undefined,
      deliveredAt: entitlement.deliveredAt,
      revokedAt: entitlement.revokedAt,
      evidence: entitlement.evidence,
    };
  },
  /** Lists customer-owned entitlements without exposing secret provider tokens. @param {Object} request Request. @returns {Promise<Object>} Entitlement response. */
  listOwn: async function (request) {
    const query = Object.assign({}, request.query || {}, {
      ownerId: request.ownerId,
    });
    // History includes completed redemption and revocation; ownership still scopes every record.
    const entitlements = await this.listEntitlements(request, query);
    return { entitlements: entitlements.map(this.publicEntitlement) };
  },
  /** Creates deterministic entitlement code for one provider unit. @param {Object} request Request. @param {Object} unit Unit. @returns {string} Entitlement code. */
  entitlementCode: function (request, unit) {
    return [
      "digitalEntitlement",
      crypto
        .createHash("sha1")
        .update(
          [
            request.tenant,
            request.enterpriseCode,
            request.ownerId,
            unit.orderCode,
            unit.providerCode,
          ].join("|"),
        )
        .digest("hex"),
    ].join(":");
  },
  /** Creates customer-owned entitlements from sold coupon units. @param {Object} request Request. @param {Object} order Order. @param {Array} sales Sold provider units. @returns {Promise<Array>} Entitlements. */
  createFromCouponSales: async function (request, order, sales) {
    const entitlements = [];
    for (const sale of sales || []) {
      if (!sale.soldAt || !Number.isFinite(Date.parse(sale.soldAt)))
        throw new Error("Original coupon purchase timestamp is required");
      const unit = {
        orderCode:
          (order && order.code) ||
          sale.orderCode ||
          (request.payload && request.payload.orderCode),
        providerCode: sale.code,
      };
      const model = {
        code: this.entitlementCode(request, unit),
        tenant: request.tenant,
        enterpriseCode: request.enterpriseCode || sale.enterpriseCode,
        ownerId: request.ownerId || sale.soldTo,
        orderCode: unit.orderCode,
        orderEntryCode: this.couponPurchaseEntryCode(sale),
        cartCode:
          sale.cartCode || (request.payload && request.payload.cartCode),
        productCode: sale.productCode,
        sku: sale.sku,
        status: "ACTIVE",
        revision: 0,
        idempotencyKey: [
          sale.idempotencyKey || request.idempotencyKey,
          "entitlement",
        ].join(":"),
        correlationId: request.correlationId,
        digitalDeliveryType: "COUPON_CODE",
        providerOwner: "promotion",
        providerCode: sale.code,
        claimStatus: sale.benefitStatus || "UNCLAIMED",
        revealPolicy: {
          ownerOnly: true,
          redactFromPublicEvidence: true,
        },
        purchasedAt: sale.soldAt,
        validTo: sale.validTo,
        purchasePolicy: sale.purchasePolicy,
        evidence: {
          promotionCode: sale.promotionCode,
          couponBatchCode: sale.batchCode,
        },
      };
      entitlements.push(
        await this.save(
          SERVICE.DefaultDigitalEntitlementService,
          request,
          model,
        ),
      );
    }
    return entitlements;
  },
  /** Records delivery evidence and updates entitlements when generated services exist. @param {Object} request Request. @param {Object} order Order. @param {Array} deliveries Provider delivery units. @returns {Promise<Array>} Delivery records. */
  recordDeliveries: async function (request, order, deliveries) {
    const records = [];
    const maximum = (CONFIG.get("digitalCore") || {})
      .maximumCouponUnitsPerCheckout;
    if (
      !Number.isSafeInteger(maximum) ||
      maximum < 1 ||
      maximum > 100 ||
      !Array.isArray(deliveries) ||
      deliveries.length > maximum ||
      !order?.code ||
      !request.tenant ||
      !request.enterpriseCode ||
      !request.ownerId ||
      new Set(deliveries.map((value) => value?.code)).size !== deliveries.length
    )
      throw new Error("Complete scoped digital delivery evidence is required");
    const verified = [];
    for (const delivery of deliveries) {
      if (
        !delivery?.code ||
        delivery.status !== "DELIVERED" ||
        delivery.orderCode !== order.code ||
        delivery.soldTo !== request.ownerId ||
        (delivery.enterpriseCode !== undefined &&
          delivery.enterpriseCode !== request.enterpriseCode) ||
        !delivery.deliveredAt ||
        !Number.isFinite(new Date(delivery.deliveredAt).getTime())
      )
        throw new Error(
          "Original provider delivery identity and time are required",
        );
      const matches = await this.listEntitlements(request, {
        providerOwner: "promotion",
        providerCode: delivery.code,
        ownerId: request.ownerId,
        orderCode: order.code,
      });
      const entitlement = matches.length === 1 ? matches[0] : undefined;
      if (
        !entitlement ||
        entitlement.tenant !== request.tenant ||
        entitlement.enterpriseCode !== request.enterpriseCode ||
        entitlement.ownerId !== request.ownerId ||
        entitlement.orderCode !== order.code ||
        entitlement.providerOwner !== "promotion" ||
        entitlement.providerCode !== delivery.code ||
        entitlement.productCode !== delivery.productCode ||
        entitlement.status !== "ACTIVE" ||
        !entitlement.code
      )
        throw new Error(
          "Digital delivery requires exactly one matching active entitlement",
        );
      verified.push({ delivery, entitlementCode: entitlement.code });
    }
    for (const { delivery, entitlementCode } of verified) {
      const model = {
        code: ["digitalDelivery", delivery.code].join(":"),
        tenant: request.tenant,
        enterpriseCode: request.enterpriseCode || delivery.enterpriseCode,
        ownerId: request.ownerId || delivery.soldTo,
        entitlementCode,
        orderCode:
          (order && order.code) ||
          delivery.orderCode ||
          (request.payload && request.payload.orderCode),
        deliveryType: "COUPON_CODE",
        providerOwner: "promotion",
        providerCode: delivery.code,
        status: "DELIVERED",
        revision: 0,
        idempotencyKey: [
          delivery.idempotencyKey || request.idempotencyKey,
          "delivery",
        ].join(":"),
        correlationId: request.correlationId,
        deliveredAt: delivery.deliveredAt,
        revealCount: 0,
        evidence: { rawTokenStored: false, revealRequiresOwner: true },
      };
      records.push(
        await this.save(SERVICE.DefaultDigitalDeliveryService, request, model),
      );
    }
    return records;
  },
  /** Rejects without disclosing payment, purchase or secret evidence. @returns {never} Fixed refusal. */
  refuseReveal: function () { throw new CLASSES.NodicsError('ERR_DIGITAL_REVEAL_FORBIDDEN'); },
  /** Resolves Promotion's original checkout entry identity; an explicit alias must agree rather than override it. @param {Object} coupon Purchased provider unit. @returns {string} Exact original entry. */
  couponPurchaseEntryCode: function (coupon) {
    const entries = [coupon?.entryCode, coupon?.orderEntryCode].filter(
      (value) => value !== undefined,
    );
    if (
      !entries.length ||
      entries.some(
        (value) =>
          typeof value !== "string" ||
          !/^[A-Za-z0-9_.:@|\-]{1,192}$/.test(value) ||
          value !== entries[0],
      )
    )
      this.refuseReveal();
    return entries[0];
  },
  /** Snapshots signed customer scope without trusting payload overrides or manufactured privacy flags. @param {Object} request Exact private entry. @returns {Object} Privately inherited trusted context. */
  revealContext: function (request) {
    const auth = request?.authData || {}, security = SERVICE.DefaultSecuredRequestPipelineService;
    const enterpriseCode = auth.enterpriseCode || auth.entCode, ownerId = auth.principalId || auth.code || auth.loginId;
    const role = CONFIG.get('runtimeRole');
    if ((typeof role === 'string' ? role : role?.code) !== 'COMMERCE' ||
        auth.tokenType !== 'access' || auth.principalType !== 'customer' ||
        [auth.tenant, enterpriseCode, ownerId].some(value => typeof value !== 'string' || !/^[A-Za-z0-9_.:@-]{1,128}$/.test(value)) ||
        [request.tenant, auth.tenant].some(value => value !== undefined && value !== auth.tenant) ||
        [request.enterpriseCode, request.entCode, auth.enterpriseCode, auth.entCode].some(value => value !== undefined && value !== enterpriseCode) ||
        (request.ownerId !== undefined && request.ownerId !== ownerId) ||
        !security?.isPermissionGranted('commerce.digital.own.reveal', security.getGrantedPermissions(request), {}) ||
        SERVICE.DefaultLoggerService?.hasPrivateCaptureProtection(request) !== true) this.refuseReveal();
    const r = { ...request, tenant: auth.tenant, enterpriseCode, ownerId, authData: structuredClone(auth),
      payload: structuredClone(request.payload || {}) };
    SERVICE.DefaultLoggerService.inheritRequestPrivacy(r, request);
    return r;
  },
  /** Reuses committed Checkout/Payment/Order/entitlement/delivery evidence for one current purchased coupon. No notification selection or new authority is introduced. @param {Object} input Private customer context. @param {Object} coupon Current coupon snapshot. @returns {Promise<Object>} Current exact entitlement. */
  authorizeCouponReveal: async function (input, coupon) {
    const r = this.revealContext(input), entitlementCode = r.entitlementCode || r.payload.entitlementCode;
    if (typeof entitlementCode !== 'string' || !/^[A-Za-z0-9_.:@-]{1,192}$/.test(entitlementCode) ||
        !coupon || coupon.code !== r.couponCode || coupon.tenant !== r.tenant || coupon.enterpriseCode !== r.enterpriseCode ||
        coupon.active !== true || coupon.soldTo !== r.ownerId || !['DELIVERED', 'CLAIMED'].includes(coupon.status) ||
        !Number.isFinite(Date.parse(coupon.soldAt)) || !Number.isFinite(Date.parse(coupon.deliveredAt)) ||
        !Number.isFinite(Date.parse(coupon.validTo)) || Date.parse(coupon.validTo) <= Date.now()) this.refuseReveal();
    const rows = await this.readRecords(SERVICE.DefaultDigitalEntitlementService, r, {
      tenant: r.tenant, enterpriseCode: r.enterpriseCode, ownerId: r.ownerId, code: entitlementCode,
    });
    if (rows.length !== 1) this.refuseReveal();
    const e = rows[0];
    if (e.code !== entitlementCode || e.tenant !== r.tenant || e.enterpriseCode !== r.enterpriseCode || e.ownerId !== r.ownerId ||
        e.active !== true || e.status !== 'ACTIVE' || e.providerOwner !== 'promotion' || e.digitalDeliveryType !== 'COUPON_CODE' ||
        e.providerCode !== coupon.code || e.orderCode !== coupon.orderCode || e.orderEntryCode !== this.couponPurchaseEntryCode(coupon) ||
        e.productCode !== coupon.productCode || Date.parse(e.purchasedAt) !== Date.parse(coupon.soldAt) ||
        Date.parse(e.validTo) !== Date.parse(coupon.validTo) ||
        !isDeepStrictEqual(e.purchasePolicy, coupon.purchasePolicy)) this.refuseReveal();
    const evidence = await SERVICE.DefaultDigitalCommerceNotificationService.evidence({ ...r, orderCode: e.orderCode }, 'PURCHASED');
    const committed = evidence.items.filter(item => item.code === e.code);
    if (evidence.kind !== 'PURCHASED' || committed.length !== 1 ||
        !isDeepStrictEqual(committed[0], e)) this.refuseReveal();
    return e;
  },
  /** Reveals a delivered entitlement through Promotion's secure owner after private customer admission. @param {Object} request Request. @returns {Promise<Object>} Reveal result. */
  reveal: async function (request) {
    request = this.revealContext(request);
    const payload = request.payload || {};
    const entitlements = await this.listEntitlements(request, {
      code: payload.entitlementCode,
      ownerId: request.ownerId,
      status: "ACTIVE",
    });
    const entitlement = entitlements[0];
    if (entitlements.length !== 1 || !entitlement || entitlement.code !== payload.entitlementCode) this.refuseReveal();
    if (entitlement.ownerId !== request.ownerId)
      this.refuseReveal();
    if (entitlement.providerOwner !== "promotion")
      this.refuseReveal();
    if (
      !SERVICE.DefaultCouponSecureRevealService ||
      typeof SERVICE.DefaultCouponSecureRevealService.reveal !== "function"
    ) {
      return {
        entitlementCode: entitlement.code,
        providerCode: entitlement.providerCode,
        status: "REVEAL_DEFERRED",
        tokenAvailable: false,
        reasonCode: "COUPON_REVEAL_PROVIDER_REQUIRED",
      };
    }
    const providerRequest = { ...request,
      entitlementCode: entitlement.code,
      couponCode: entitlement.providerCode,
    };
    SERVICE.DefaultLoggerService.inheritRequestPrivacy(providerRequest, request);
    return SERVICE.DefaultCouponSecureRevealService.reveal(providerRequest);
  },
  /** Claims a delivered coupon entitlement for a target discount application. @param {Object} request Claim request. @returns {Promise<Object>} Updated entitlement and provider coupon. */
  claim: async function (request) {
    const payload = request.payload || {};
    const entitlement = (
      await this.listEntitlements(request, {
        code: payload.entitlementCode,
        ownerId: request.ownerId,
        status: "ACTIVE",
      })
    )[0];
    if (!entitlement) throw new Error("Digital entitlement was not found");
    if (entitlement.claimStatus === "REDEEMED")
      throw new Error("Digital entitlement is already redeemed");
    if (entitlement.claimStatus === "CLAIMED") {
      if (
        entitlement.evidence?.claimTargetCode !== payload.targetCode ||
        entitlement.evidence?.claimTargetType !== (payload.targetType || "CART")
      )
        throw new Error(
          "This entitlement is already claimed for a different target",
        );
      return { entitlement };
    }
    if (
      entitlement.providerOwner !== "promotion" ||
      !SERVICE.DefaultPromotionOperationService ||
      typeof SERVICE.DefaultPromotionOperationService
        .claimPurchasedCouponCode !== "function"
    )
      throw new Error("Coupon claim provider is required");
    const coupon = await this.promotionLifecycle(request, "claim", {
        tenant: request.tenant,
        enterpriseCode: request.enterpriseCode,
        ownerId: request.ownerId,
        authData: request.authData,
        correlationId: request.correlationId,
        idempotencyKey: request.idempotencyKey,
        payload: {
          couponCode: entitlement.providerCode,
          targetCode: payload.targetCode,
          targetType: payload.targetType || "CART",
        },
      });
    const updated = await this.update(
      SERVICE.DefaultDigitalEntitlementService,
      request,
      entitlement,
      {
        claimStatus: "CLAIMED",
        evidence: Object.assign({}, entitlement.evidence, {
          claimTargetCode: payload.targetCode,
          claimTargetType: payload.targetType || "CART",
        }),
      },
    );
    return { entitlement: updated, coupon };
  },
  /** Redeems a claimed coupon entitlement after target fulfillment completion. @param {Object} request Redeem request. @returns {Promise<Object>} Updated entitlement and provider coupon. */
  redeem: async function (request) {
    const payload = request.payload || {};
    const entitlement = (
      await this.listEntitlements(request, {
        code: payload.entitlementCode,
        ownerId: request.ownerId,
        status: "ACTIVE",
      })
    )[0];
    if (!entitlement) throw new Error("Digital entitlement was not found");
    if (entitlement.claimStatus !== "CLAIMED")
      throw new Error("Digital entitlement must be claimed before redemption");
    if (payload.fulfillmentStatus && payload.fulfillmentStatus !== "COMPLETED")
      throw new Error(
        "Target fulfillment must complete before coupon redemption",
      );
    if (
      entitlement.providerOwner !== "promotion" ||
      !SERVICE.DefaultPromotionOperationService ||
      typeof SERVICE.DefaultPromotionOperationService
        .redeemClaimedCouponCode !== "function"
    )
      throw new Error("Coupon redeem provider is required");
    const coupon = await this.promotionLifecycle(request, "redeem", {
        tenant: request.tenant,
        enterpriseCode: request.enterpriseCode,
        ownerId: request.ownerId,
        authData: request.authData,
        correlationId: request.correlationId,
        idempotencyKey: request.idempotencyKey,
        payload: {
          couponCode: entitlement.providerCode,
          targetCode: payload.targetCode,
          targetType: payload.targetType || "ORDER",
        },
      });
    const updated = await this.update(
      SERVICE.DefaultDigitalEntitlementService,
      request,
      entitlement,
      {
        claimStatus: "REDEEMED",
        status: "REDEEMED",
        evidence: Object.assign({}, entitlement.evidence, {
          redeemedTargetCode: payload.targetCode,
          redeemedTargetType: payload.targetType || "ORDER",
        }),
      },
    );
    return { entitlement: updated, coupon };
  },
  /** Preserves exact private merchant child identity without transferring generic scope or credentials. @param {Object} request Original Digital command. @param {string} operation Fixed lifecycle operation. @param {Object} command Exact Promotion child. @returns {Promise<Object>} Coupon transition. */
  promotionLifecycle: async function (request, operation, command) {
    if (!["claim", "redeem"].includes(operation)) throw new Error("Invalid coupon lifecycle operation");
    const release = SERVICE.DefaultPromotionMerchantScopeService?.forwardLifecycle(request, command, operation);
    try {
      return await SERVICE.DefaultPromotionOperationService[
        operation === "claim" ? "claimPurchasedCouponCode" : "redeemClaimedCouponCode"
      ](command);
    } finally { release?.(); }
  },
  /** Calculates digital revocation policy for cancellation, return, or refund. @param {Object} entitlement Entitlement. @param {string} requestType Reversal type. @returns {Object} Policy decision. */
  revocationPolicy: function (entitlement, requestType) {
    if (entitlement?.digitalDeliveryType === "DIGITAL_OWNERSHIP" || entitlement?.providerOwner === "wasteCore")
      return { policyDecision: requestType === "RETURN" ? "BLOCKED" : "MANUAL_REVIEW", refundable: false,
        reasonCode: requestType === "RETURN" ? "DIGITAL_PRODUCTS_DO_NOT_USE_PHYSICAL_RETURN" : "DIGITAL_OWNERSHIP_REFUND_REQUIRES_DOMAIN_OWNER" };
    const claimStatus = (entitlement && entitlement.claimStatus) || "UNCLAIMED";
    if (claimStatus === "REDEEMED")
      return {
        policyDecision: "MANUAL_REVIEW",
        refundable: false,
        reasonCode: "DIGITAL_COUPON_ALREADY_REDEEMED",
      };
    if (claimStatus === "CLAIMED")
      return {
        policyDecision: "MANUAL_REVIEW",
        refundable: false,
        reasonCode: "DIGITAL_COUPON_CLAIMED",
      };
    if (requestType === "RETURN")
      return {
        policyDecision: "BLOCKED",
        refundable: false,
        reasonCode: "DIGITAL_PRODUCTS_DO_NOT_USE_PHYSICAL_RETURN",
      };
    if (entitlement.purchasePolicy) {
      const policy = entitlement.purchasePolicy.refundPolicy,
        purchased = Date.parse(entitlement.purchasedAt),
        expiry = Date.parse(entitlement.validTo);
      if (
        !policy ||
        !Number.isSafeInteger(policy.windowHours) ||
        policy.windowHours < 1 ||
        !Number.isFinite(purchased) ||
        !Number.isFinite(expiry) ||
        !Array.isArray(policy.requestTypes) ||
        !policy.requestTypes.includes(requestType) ||
        Date.now() >= expiry ||
        Date.now() >= purchased + policy.windowHours * 3600000
      )
        return {
          policyDecision: "MANUAL_REVIEW",
          refundable: false,
          reasonCode: "DIGITAL_COUPON_UNCLAIMED",
        };
    }
    return {
      policyDecision: "REVOKE_AND_REFUND",
      refundable: true,
      reasonCode: "DIGITAL_COUPON_UNCLAIMED",
    };
  },
  /** Records revocation/reversal evidence for matching order entitlements. @param {Object} request Lifecycle request. @returns {Promise<Array>} Reversal records. */
  revokeForOrderLifecycle: async function (request) {
    const entitlements = await this.listEntitlements(request, {
      orderCode:
        request.orderCode || (request.payload && request.payload.orderCode),
      ownerId: request.ownerId,
    });
    const records = [];
    for (const entitlement of entitlements) {
      const policy = this.revocationPolicy(
        entitlement,
        request.payload && request.payload.requestType,
      );
      const model = {
        code: [
          "digitalReversal",
          entitlement.code,
          request.idempotencyKey || request.requestId || Date.now(),
        ].join(":"),
        tenant: request.tenant,
        enterpriseCode: request.enterpriseCode || entitlement.enterpriseCode,
        ownerId: entitlement.ownerId,
        entitlementCode: entitlement.code,
        orderCode: entitlement.orderCode,
        requestType: request.payload && request.payload.requestType,
        policyDecision: policy.policyDecision,
        reasonCode: policy.reasonCode,
        status:
          policy.policyDecision === "REVOKE_AND_REFUND"
            ? "APPROVED"
            : policy.policyDecision,
        revision: 0,
        idempotencyKey: request.idempotencyKey,
        correlationId: request.correlationId || request.requestId,
        decidedAt: new Date(),
        evidence: {
          refundable: policy.refundable,
          claimStatus: entitlement.claimStatus,
        },
      };
      records.push(
        await this.save(SERVICE.DefaultDigitalReversalService, request, model),
      );
    }
    return records;
  },
};
