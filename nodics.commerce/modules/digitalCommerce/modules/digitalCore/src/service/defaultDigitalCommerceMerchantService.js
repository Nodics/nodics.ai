/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const crypto = require("node:crypto");
/** @module digitalCore/service/defaultDigitalCommerceMerchantService @description Supports enterprise employees validating customer-presented purchased coupons and confirming fulfillment in Axis. Profile enterprises and employee scopes are the merchant authority; Promotion owns coupon eligibility and redemption. @layer service @owner digitalCore @override Configure an installed fulfillment provider, never a parallel merchant registry. Future POS adapters consume the same owner operations. */
module.exports = {
  /** Resolves deployment fulfillment policy without a merchant identity catalogue. */
  policy: function () {
    return (CONFIG.get("digitalCore") || {}).merchantRedemption || {};
  },
  /** Rejects inaccessible merchant actions without leaking coupon secrets. */
  fail: function (message) {
    throw new CLASSES.NodicsError("ERR_DIGITAL_MERCHANT_INVALID", message);
  },
  /** Resolves trusted enterprise and customer context. */
  context: function (input, customer = false) {
    const auth = input.authData || {},
      enterpriseCode = auth.enterpriseCode || auth.entCode;
    if (!input.tenant || !enterpriseCode || !this.policy().enabled)
      this.fail("Merchant redemption is unavailable");
    if (customer && auth.principalType !== "customer")
      this.fail("Please sign in as a customer");
    const runtime = CONFIG.get("runtimeRole"),
      role = typeof runtime === "string" ? runtime : runtime?.code;
    if (role !== "COMMERCE")
      this.fail("Merchant fulfillment requires operational Commerce");
    return {
      ...input,
      enterpriseCode,
      ownerId: auth.principalId || auth.code || auth.loginId,
    };
  },
  /** Preserves trusted owner persistence through Digital Entitlement services. */
  storage: function (r) {
    return {
      tenant: r.tenant,
      authData:
        SERVICE.DefaultDigitalCommerceEntitlementService.serviceAuthData(r),
      options: { recursive: false, skipItemCache: true },
    };
  },
  /** Unwraps a generated owner response. */
  unwrap: function (v) {
    for (let n = 0; n < 7 && v && !Array.isArray(v); n++) {
      if (v.data !== undefined) v = v.data;
      else if (v.result !== undefined) v = v.result;
      else break;
    }
    return v;
  },
  /** Reads an entitlement with an optional authenticated customer restriction. */
  entitlement: async function (r, owned) {
    const items =
      await SERVICE.DefaultDigitalCommerceEntitlementService.listEntitlements(
        r,
        { code: r.code, ...(owned ? { ownerId: r.ownerId } : {}) },
      );
    if (!items[0]) this.fail("The coupon entitlement was not found");
    return items[0];
  },
  /** Resolves the coupon issuer through canonical Profile enterprise identity. */
  merchant: async function (r, item) {
    const coupon =
      await SERVICE.DefaultPromotionOperationService.merchantCoupon({
        ...r,
        couponCode: item.providerCode,
      });
    const ref = coupon.issuerEnterpriseRef || coupon.enterpriseRef;
    const code = typeof ref === "string" ? ref : ref?.code;
    if (
      !code ||
      (typeof ref === "object" &&
        ((ref.moduleName || ref.module || "profile") !== "profile" ||
          (ref.schemaName || ref.schema || "enterprise") !== "enterprise"))
    )
      this.fail("The coupon needs a canonical issuing enterprise");
    const response = this.unwrap(
      await SERVICE.DefaultModuleService.invokeModule({
        local: false,
        moduleName: "profile",
        connectionName: "profile",
        targetAuthority: { runtimeRole: "PLATFORM" },
        tenant: r.tenant,
        request: { tenant: r.tenant },
        apiName: "/enterprise",
        methodName: "POST",
        requestBody: {
          query: { code, active: true },
          options: { recursive: false },
          searchOptions: { pageSize: 1 },
        },
        timeoutMs: 10000,
        maxAttempts: 1,
      }),
    );
    const enterprise = Array.isArray(response) ? response[0] : response;
    if (!enterprise || enterprise.code !== code || enterprise.active === false)
      this.fail("The issuing enterprise is unavailable");
    return {
      code,
      enterpriseCode: code,
      label: typeof enterprise.name === "string" ? enterprise.name : code,
      mode: "MERCHANT_SCREEN",
      providerService:
        this.policy().providerService ||
        "DefaultDigitalCommerceMerchantScreenProviderService",
      coupon,
    };
  },
  /** Projects employee or customer receipt state without raw tokens or another customer's identity. */
  summary: function (item, merchant) {
    const m = item.evidence?.merchantRedemption || {};
    return {
      entitlementCode: item.code,
      productCode: item.productCode,
      claimStatus: item.claimStatus,
      status: item.status,
      revision: item.revision,
      merchantCode: merchant.code,
      merchantLabel: merchant.label,
      mode: merchant.mode,
      redemptionCode: m.code,
      requestedAt: m.requestedAt,
      receiptCode: item.claimStatus === "REDEEMED" ? m.receiptCode : undefined,
      merchantReceiptReference: m.merchantReceiptReference,
      confirmationKey: m.confirmationKey,
      confirmedAt: item.claimStatus === "REDEEMED" ? m.confirmedAt : undefined,
      recoveryRequired: !!m.confirmationKey && item.claimStatus !== "REDEEMED",
    };
  },
  /** Applies a revisioned entitlement mutation and rereads authoritative state. */
  update: async function (r, item, patch) {
    await SERVICE.DefaultDigitalEntitlementService.update({
      ...this.storage(r),
      query: {
        code: item.code,
        enterpriseCode: r.enterpriseCode,
        revision: item.revision,
      },
      model: { ...patch, code: item.code, revision: item.revision + 1 },
    });
    return this.entitlement({ ...r, code: item.code }, false);
  },
  /** Requires explicit review and a stable business command reference. */
  command: function (r) {
    if (
      r.payload?.confirmed !== true ||
      typeof r.idempotencyKey !== "string" ||
      !/^[A-Za-z0-9._:-]{8,180}$/.test(r.idempotencyKey)
    )
      this.fail("Review and confirm with a valid command reference");
    return r.idempotencyKey;
  },
  /** Derives the original POS fulfillment target once per entitlement. */
  targetCode: function (r, item) {
    return (
      "POS_" +
      crypto
        .createHash("sha256")
        .update(r.enterpriseCode + ":" + item.code)
        .digest("hex")
        .slice(0, 28)
        .toUpperCase()
    );
  },
  /** Preserves the existing customer claim API using only the coupon's issuing enterprise. */
  eligibleMerchants: async function (input) {
    const r = this.context(input, true),
      item = await this.entitlement(r, true),
      m = await this.merchant(r, item);
    return { merchants: [{ code: m.code, label: m.label, mode: m.mode }] };
  },
  /** Retains compatibility for customer claims; Axis can also claim and redeem a presented coupon in one approved operation. */
  claim: async function (input) {
    const r = this.context(input, true),
      key = this.command(r);
    let item = await this.entitlement(r, true);
    const m = await this.merchant(r, item);
    if (r.payload.merchantCode !== m.code)
      this.fail("The coupon belongs to a different issuing enterprise");
    const prior = item.evidence?.merchantRedemption;
    if (prior) {
      if (prior.commandKey !== key)
        this.fail("Use the existing claim reference");
      if (["CLAIMED", "REDEEMED"].includes(item.claimStatus))
        return this.summary(item, m);
    }
    if (item.status !== "ACTIVE" || item.claimStatus !== "UNCLAIMED")
      this.fail("This coupon is unavailable for claim");
    if (!prior)
      item = await this.update(r, item, {
        evidence: {
          ...item.evidence,
          merchantRedemption: {
            code: this.targetCode(r, item),
            merchantCode: m.code,
            enterpriseRef: {
              moduleName: "profile",
              schemaName: "enterprise",
              code: m.code,
            },
            commandKey: key,
            requestedAt: new Date().toISOString(),
            mode: m.mode,
          },
        },
      });
    await SERVICE.DefaultDigitalCommerceEntitlementService.claim({
      ...r,
      payload: {
        entitlementCode: item.code,
        targetCode: item.evidence.merchantRedemption.code,
        targetType: "POS",
      },
    });
    return this.summary(await this.entitlement(r, true), m);
  },
  /** Obtains effective Profile scopes for the current employee and requires the exact merchant operation grant. */
  staff: async function (input) {
    const request = this.context(input),
      auth = request.authData || {},
      router = SERVICE.DefaultSecuredRequestPipelineService;
    if (
      auth.principalType !== "human" ||
      !auth.loginId ||
      !router.isPermissionGranted(
        "commerce.coupon.pos.redeem",
        router.getGrantedPermissions(request),
        {},
      )
    )
      this.fail("Merchant confirmation is not permitted for this identity");
    if (!request.authorization)
      this.fail("The employee access token is required");
    const response = await SERVICE.DefaultModuleService.invokeModule({
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
    let value = response;
    for (let n = 0; n < 6 && value; n++) {
      if (value.data !== undefined) value = value.data;
      else if (value.result !== undefined) value = value.result;
      else break;
    }
    if (
      value?.principalCode !== auth.loginId ||
      !Array.isArray(value.scopes) ||
      !Array.isArray(value.deniedScopes)
    )
      this.fail("Merchant scope resolution is unavailable");
    return { ...request, scopes: value };
  },
  /** Applies explicit deny-over-allow Profile scopes to the merchant's enterprise or business unit. */
  scoped: function (request, merchant) {
    const match = (scope) => {
      if (scope.tenantCode && scope.tenantCode !== request.tenant) return false;
      if (
        scope.capabilityCode &&
        !["commerce", "digitalCore"].includes(scope.capabilityCode)
      )
        return false;
      if (
        scope.permissionCode &&
        !SERVICE.DefaultSecuredRequestPipelineService.isPermissionGranted(
          "commerce.coupon.pos.redeem",
          [scope.permissionCode],
          {},
        )
      )
        return false;
      return (
        (scope.scopeType === "GLOBAL" && scope.scopeCode === "*") ||
        (scope.scopeType === "TENANT" && scope.scopeCode === request.tenant) ||
        (scope.scopeType === "ENTERPRISE" &&
          scope.scopeCode === merchant.enterpriseCode)
      );
    };
    return (
      request.scopes.scopes.some(match) &&
      !request.scopes.deniedScopes.some(match)
    );
  },
  /** Binds a short-lived staff validation to the secret coupon hash, revision and issuing enterprise. */
  validationCode: function (item, merchant, expiresAt) {
    return crypto
      .createHash("sha256")
      .update(
        [
          merchant.coupon.tokenHash,
          item.code,
          item.revision,
          merchant.code,
          expiresAt,
        ].join("|"),
      )
      .digest("hex");
  },
  /** Validates the code already displayed in the customer's existing coupon purchase view. */
  validate: async function (input) {
    const r = await this.staff(input),
      token = r.payload?.couponToken;
    if (
      typeof token !== "string" ||
      token.trim().length < 4 ||
      token.length > 256
    )
      this.fail("Enter the coupon code presented by the customer");
    const coupon =
      await SERVICE.DefaultPromotionOperationService.merchantCoupon({
        ...r,
        couponToken: token,
      });
    const items =
      await SERVICE.DefaultDigitalCommerceEntitlementService.listEntitlements(
        r,
        { providerOwner: "promotion", providerCode: coupon.code },
      );
    const item = items[0];
    if (!item) this.fail("The purchased coupon is unavailable");
    const m = await this.merchant(r, item);
    if (!this.scoped(r, m))
      this.fail("The issuing enterprise is outside your assigned scope");
    if (item.claimStatus === "REDEEMED")
      return {
        ...this.summary(item, m),
        eligible: false,
        reason: "ALREADY_REDEEMED",
      };
    if (
      item.status !== "ACTIVE" ||
      !["UNCLAIMED", "CLAIMED"].includes(item.claimStatus)
    )
      this.fail("The coupon is unavailable for fulfillment");
    const conditions =
      await SERVICE.DefaultPromotionOperationService.validateMerchantCoupon({
        ...r,
        ownerId: item.ownerId,
        couponCode: item.providerCode,
        productCode: item.productCode,
        targetCode:
          item.evidence?.merchantRedemption?.code || this.targetCode(r, item),
      });
    const validationExpiresAt = new Date(Date.now() + 300000).toISOString();
    return {
      ...this.summary(item, m),
      eligible: true,
      validationExpiresAt,
      validationCode: this.validationCode(item, m, validationExpiresAt),
      conditions: conditions.conditions,
    };
  },
  /** Lists only prior fulfillment requests whose issuing enterprise is within the employee's current Profile scope. */
  queue: async function (input) {
    const r = await this.staff(input),
      items =
        await SERVICE.DefaultDigitalCommerceEntitlementService.listEntitlements(
          r,
          { "evidence.merchantRedemption.code": { $exists: true } },
        ),
      redemptions = [];
    for (const item of items) {
      const m = await this.merchant(r, item);
      if (this.scoped(r, m)) redemptions.push(this.summary(item, m));
    }
    return { redemptions };
  },
  /** Confirms employee fulfillment and receipt, then claims and redeems through Promotion under the original customer's ownership. */
  confirm: async function (input) {
    const r = await this.staff(input),
      key = this.command(r);
    let item = await this.entitlement(r, false);
    const m = await this.merchant(r, item);
    if (!this.scoped(r, m))
      this.fail("The issuing enterprise is outside your assigned scope");
    let marker = item.evidence?.merchantRedemption;
    const receipt = r.payload.merchantReceiptReference?.trim();
    if (
      typeof receipt !== "string" ||
      !/^[A-Za-z0-9][A-Za-z0-9 ._:/-]{2,119}$/.test(receipt)
    )
      this.fail("Enter the merchant transaction or receipt reference");
    if (marker?.confirmationKey) {
      if (
        marker.confirmationKey !== key ||
        marker.merchantReceiptReference !== receipt
      )
        this.fail("Use the original confirmation and receipt reference");
      if (item.claimStatus === "REDEEMED") return this.summary(item, m);
    } else {
      const expiry = Date.parse(r.payload.validationExpiresAt);
      if (
        !Number.isFinite(expiry) ||
        expiry <= Date.now() ||
        expiry > Date.now() + 300000 ||
        this.validationCode(item, m, r.payload.validationExpiresAt) !==
          r.payload.validationCode
      )
        this.fail(
          "Coupon validation is invalid or expired; validate the presented code again",
        );
      if (
        item.status !== "ACTIVE" ||
        !["UNCLAIMED", "CLAIMED"].includes(item.claimStatus) ||
        item.revision !== r.payload.expectedRevision
      )
        this.fail("The coupon changed; validate again");
      await SERVICE.DefaultPromotionOperationService.validateMerchantCoupon({
        ...r,
        ownerId: item.ownerId,
        couponCode: item.providerCode,
        productCode: item.productCode,
        targetCode: marker?.code || this.targetCode(r, item),
      });
      const code = marker?.code || this.targetCode(r, item);
      marker = {
        ...marker,
        code,
        merchantCode: m.code,
        enterpriseRef: {
          moduleName: "profile",
          schemaName: "enterprise",
          code: m.code,
        },
        mode: m.mode,
        confirmationKey: key,
        confirmedBy: r.authData.loginId,
        confirmedAt: new Date().toISOString(),
        merchantReceiptReference: receipt,
        receiptCode: "RECEIPT_" + code,
      };
      item = await this.update(r, item, {
        evidence: { ...item.evidence, merchantRedemption: marker },
      });
      marker = item.evidence.merchantRedemption;
      if (
        marker.confirmationKey !== key ||
        marker.merchantReceiptReference !== receipt
      )
        this.fail("Another fulfillment confirmation is already in progress");
    }
    const owner = { ...r, ownerId: item.ownerId };
    if (item.claimStatus === "UNCLAIMED") {
      await SERVICE.DefaultDigitalCommerceEntitlementService.claim({
        ...owner,
        payload: {
          entitlementCode: item.code,
          targetCode: marker.code,
          targetType: "POS",
        },
      });
      item = await this.entitlement(r, false);
    }
    const provider = SERVICE[m.providerService];
    if (!provider?.confirm)
      this.fail("The configured fulfillment provider is unavailable");
    const receiptResult = await provider.confirm({ ...r, merchant: m }, marker);
    if (
      receiptResult?.fulfillmentStatus !== "COMPLETED" ||
      receiptResult.redemptionCode !== marker.code ||
      receiptResult.merchantCode !== m.code ||
      receiptResult.receiptCode !== marker.receiptCode
    )
      this.fail("Merchant fulfillment was not confirmed");
    await SERVICE.DefaultDigitalDeliveryService.save({
      ...this.storage(owner),
      query: { code: marker.receiptCode, enterpriseCode: r.enterpriseCode },
      model: {
        code: marker.receiptCode,
        tenant: r.tenant,
        enterpriseCode: r.enterpriseCode,
        ownerId: item.ownerId,
        entitlementCode: item.code,
        orderCode: item.orderCode,
        deliveryType: "MERCHANT_RECEIPT",
        providerOwner: "promotion",
        providerCode: item.providerCode,
        status: "DELIVERED",
        revision: 0,
        active: true,
        created: new Date(marker.confirmedAt),
        updated: new Date(marker.confirmedAt),
        deliveredAt: new Date(marker.confirmedAt),
        idempotencyKey: key,
        correlationId: r.correlationId || marker.code,
        revealCount: 0,
        evidence: {
          enterpriseRef: marker.enterpriseRef,
          redemptionCode: marker.code,
          merchantReceiptReference: receipt,
          confirmedBy: marker.confirmedBy,
          fulfillmentStatus: "COMPLETED",
          mode: m.mode,
        },
      },
    });
    try {
      await SERVICE.DefaultDigitalCommerceEntitlementService.redeem({
        ...owner,
        payload: {
          entitlementCode: item.code,
          targetCode: marker.code,
          targetType: "POS",
          fulfillmentStatus: "COMPLETED",
        },
      });
    } catch (error) {
      const saved = await this.entitlement(r, false);
      if (saved.claimStatus !== "REDEEMED") throw error;
    }
    return this.summary(await this.entitlement(r, false), m);
  },
};
