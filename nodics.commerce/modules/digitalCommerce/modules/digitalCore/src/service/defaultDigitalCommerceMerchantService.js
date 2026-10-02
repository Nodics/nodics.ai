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
  /** Resolves Store-owned outlet facts only under explicit qualification; caller strings are never evidence. @param {Object} request Fresh staff context. @param {Object} merchant Canonical issuer. @returns {Promise<Object>} Merchant with optional current outlet. */
  withStore: async function (request, merchant) {
    const p = this.policy().storeScope || {};
    if (p.enabled !== true) {
      if (
        request.storeCode !== undefined ||
        request.payload?.storeCode !== undefined ||
        request.query?.storeCode !== undefined
      )
        this.fail("Outlet fulfillment is unavailable");
      return merchant;
    }
    if (p.qualified !== true || !SERVICE.DefaultStoreContextService)
      this.fail("Outlet fulfillment is unavailable");
    const store = await SERVICE.DefaultStoreContextService.resolveMerchantStore(
      request,
      merchant.enterpriseCode,
    );
    return { ...merchant, store };
  },
  /** Supplies bounded live authorized Store choices; not a merchant registry or configured fallback. @param {Object} input Signed staff request. @returns {Promise<Object>} Inert outlet selection. */
  workspace: async function (input) {
    const r = await this.staff(input),
      p = this.policy().storeScope || {};
    const result = {
      storeRequired: p.enabled === true,
      storeLabel: this.policy().presentation?.storeLabel,
      pricedSourceRequired:
        CONFIG.get("promotion")?.merchantBenefits?.enabled === true,
      pricedSourceLabel: this.policy().presentation?.pricedSourceLabel,
      stores: [],
    };
    if (
      typeof result.storeLabel !== "string" ||
      !result.storeLabel ||
      result.storeLabel.length > 192
    )
      this.fail("Merchant presentation is unavailable");
    if (
      result.pricedSourceRequired &&
      (typeof result.pricedSourceLabel !== "string" ||
        !result.pricedSourceLabel.trim() ||
        result.pricedSourceLabel.length > 192)
    )
      this.fail("Priced source presentation is unavailable");
    if (!result.storeRequired) return result;
    if (p.qualified !== true || !SERVICE.DefaultStoreService)
      this.fail("Outlet fulfillment is unavailable");
    const response = await SERVICE.DefaultStoreService.get({
      tenant: r.tenant,
      authData: r.authData,
      query: { status: "ACTIVE" },
      options: { recursive: false, skipItemCache: true },
      searchOptions: { pageSize: 101, pageNumber: 1, sort: { _id: 1 } },
    });
    if (
      !response ||
      !/^SUC_/.test(response.code || "") ||
      response.success === false ||
      response.error ||
      (response.errors &&
        (!Array.isArray(response.errors) || response.errors.length)) ||
      !Array.isArray(response.result) ||
      !Number.isSafeInteger(response.count) ||
      response.count < 0 ||
      response.count > 100 ||
      response.count !== response.result.length
    )
      this.fail("Outlet inventory is unavailable");
    const seen = new Set();
    for (const store of response.result) {
      if (
        !store ||
        !store._id ||
        typeof store.code !== "string" ||
        !/^[A-Za-z0-9_.:-]{1,128}$/.test(store.code) ||
        typeof store.name !== "string" ||
        !store.name ||
        store.name.length > 256 ||
        seen.has(store.code) ||
        store.tenant !== r.tenant ||
        !Number.isSafeInteger(store.revision) ||
        store.revision < 1
      )
        this.fail("Outlet inventory is unavailable");
      seen.add(store.code);
      const ref = store.enterpriseRef,
        enterpriseCode = typeof ref === "string" ? ref : ref?.code;
      if (
        !enterpriseCode ||
        store.active === false ||
        store.status !== "ACTIVE"
      )
        continue;
      if (
        typeof ref === "object" &&
        ((ref.moduleName || ref.module || "profile") !== "profile" ||
          (ref.schemaName || ref.schema || "enterprise") !== "enterprise")
      )
        this.fail("Outlet reference is invalid");
      if (this.scoped(r, { enterpriseCode, store }))
        result.stores.push({
          code: store.code,
          name: store.name,
          revision: store.revision,
        });
    }
    return result;
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
    if (items.length !== 1 || items[0].code !== r.code)
      this.fail("The coupon entitlement is missing or ambiguous");
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
      storeCode: m.storeRef?.code,
      storeRevision: m.storeRevision,
    };
  },
  /** Applies a revisioned entitlement mutation and rereads authoritative state. */
  update: async function (r, item, patch) {
    const response = await SERVICE.DefaultDigitalEntitlementService.update({
      ...this.storage(r),
      query: {
        code: item.code,
        enterpriseCode: r.enterpriseCode,
        revision: item.revision,
      },
      model: { ...patch, code: item.code, revision: item.revision + 1 },
    });
    if (
      !response ||
      !/^SUC_/.test(response.code || "") ||
      response.success === false ||
      response.error ||
      (response.errors &&
        (!Array.isArray(response.errors) || response.errors.length)) ||
      response.result?.acknowledged !== true ||
      response.result?.matchedCount !== 1
    )
      this.fail("The entitlement mutation was not confirmed");
    const saved = await this.entitlement({ ...r, code: item.code }, false);
    if (
      saved.revision !== item.revision + 1 ||
      Object.keys(patch).some(
        (key) => JSON.stringify(saved[key]) !== JSON.stringify(patch[key]),
      )
    )
      this.fail("The entitlement changed; inspect before retrying");
    return saved;
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
          scope.scopeCode === merchant.enterpriseCode) ||
        (scope.scopeType === "STORE" &&
          scope.scopeCode === merchant.store?.code)
      );
    };
    return (
      request.scopes.scopes.some(
        (scope) =>
          match(scope) && (!merchant.store || scope.scopeType === "STORE"),
      ) && !request.scopes.deniedScopes.some(match)
    );
  },
  /** Binds a short-lived staff validation to the secret coupon hash, revision and issuing enterprise. */
  validationCode: function (
    item,
    merchant,
    expiresAt,
    principalCode,
    pricedBinding,
  ) {
    return crypto
      .createHash("sha256")
      .update(
        [
          merchant.coupon.tokenHash,
          item.code,
          item.revision,
          merchant.code,
          expiresAt,
          ...(pricedBinding ? [pricedBinding] : []),
          ...(merchant.store
            ? [merchant.store.code, merchant.store.revision, principalCode]
            : []),
        ].join("|"),
      )
      .digest("hex");
  },
  /** Binds trusted monetary evidence and its exact source handle to staff validation; browser benefit objects are never consulted. @param {Object|undefined} benefit Owner evidence. @param {string} reference Canonical source handle. @returns {string|undefined} */
  pricedBinding: function (benefit, reference) {
    if (!benefit) return undefined;
    if (benefit.sourceStage === "PRICED_CART")
      this.nativeBasketReference(reference);
    if (
      typeof reference !== "string" ||
      reference.trim() !== benefit.sourceReference
    )
      this.fail("Validate the original priced transaction reference");
    return crypto
      .createHash("sha256")
      .update(JSON.stringify({ reference: reference.trim(), benefit }))
      .digest("hex");
  },
  /** Requires the conservative native handle shared with Pricing; custom Cart identifiers outside this protocol are not silently broadened. @param {string} reference Exact basket handle. @returns {string} */
  nativeBasketReference: function (reference) {
    if (
      typeof reference !== "string" ||
      !/^CART:[A-Za-z0-9_.-]{1,114}$/.test(reference)
    )
      this.fail("Enter a valid native basket reference");
    return reference;
  },
  /** Checks the selected framework native adapter without imposing its grammar on later external providers. @returns {boolean} */
  nativePricingSelected: function () {
    const p = CONFIG.get("promotion")?.merchantBenefits;
    return (
      p?.enabled === true &&
      p.evidenceService === "DefaultPromotionPricedTransactionAdapterService"
    );
  },
  /** Reuses canonical live Profile membership and Store scope for a native priced provider, never supplied entitlement/merchant objects. @param {Object} input Signed staff context. @param {Object} original Original owner marker. @returns {Promise<Object>} Fresh bound owner authority. */
  pricedAuthority: async function (input, original) {
    const r = await this.staff(input),
      item = await this.entitlement(r, false),
      merchant = await this.withStore(r, await this.merchant(r, item)),
      marker = item.evidence?.merchantRedemption;
    if (
      !this.scoped(r, merchant) ||
      !merchant.store ||
      !marker ||
      marker.code !== original.code ||
      marker.confirmationKey !== original.confirmationKey ||
      marker.merchantReceiptReference !== original.merchantReceiptReference ||
      marker.pricedBinding !== original.pricedBinding ||
      merchant.code !== marker.merchantCode ||
      merchant.mode !== marker.mode ||
      merchant.store.code !== marker.storeRef?.code ||
      merchant.store.revision !== marker.storeRevision ||
      this.pricedBinding(
        marker.pricedBenefit,
        marker.merchantReceiptReference,
      ) !== original.pricedBinding
    )
      this.fail(
        "Priced fulfillment authority changed; inspect the original command",
      );
    return { ...r, entitlement: item, merchant, redemption: marker };
  },
  /** Validates the code already displayed in the customer's existing coupon purchase view. */
  validate: async function (input) {
    const r = await this.staff(input),
      token = r.payload?.couponToken;
    if (this.nativePricingSelected())
      this.nativeBasketReference(r.payload?.merchantReceiptReference);
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
    const item = items.length === 1 ? items[0] : undefined;
    if (!item || item.providerCode !== coupon.code)
      this.fail("The purchased coupon is missing or ambiguous");
    const m = await this.withStore(r, await this.merchant(r, item));
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
        storeCode: m.store?.code,
        targetCode:
          item.evidence?.merchantRedemption?.code || this.targetCode(r, item),
      });
    const validationExpiresAt = new Date(Date.now() + 300000).toISOString();
    return {
      ...this.summary(item, m),
      eligible: true,
      validationExpiresAt,
      validationCode: this.validationCode(
        item,
        m,
        validationExpiresAt,
        r.authData.loginId,
        this.pricedBinding(
          conditions.conditions?.benefit,
          r.payload?.merchantReceiptReference,
        ),
      ),
      storeCode: m.store?.code,
      storeRevision: m.store?.revision,
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
      const m = await this.withStore(r, await this.merchant(r, item));
      if (
        this.scoped(r, m) &&
        (!m.store ||
          item.evidence?.merchantRedemption?.storeRef?.code === m.store.code)
      )
        redemptions.push(this.summary(item, m));
    }
    return { redemptions };
  },
  /** Confirms employee fulfillment and receipt, then claims and redeems through Promotion under the original customer's ownership. */
  confirm: async function (input) {
    const r = await this.staff(input),
      key = this.command(r);
    if (this.nativePricingSelected())
      this.nativeBasketReference(r.payload?.merchantReceiptReference);
    this.assertMerchantReceiptOwner();
    let item = await this.entitlement(r, false);
    const m = await this.withStore(r, await this.merchant(r, item));
    if (!this.scoped(r, m))
      this.fail("The issuing enterprise is outside your assigned scope");
    const provider = SERVICE[m.providerService];
    if (!provider?.confirm)
      this.fail("The configured fulfillment provider is unavailable");
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
        marker.merchantReceiptReference !== receipt ||
        marker.mode !== m.mode ||
        (m.store &&
          (marker.storeRef?.code !== m.store.code ||
            marker.storeRevision !== m.store.revision)) ||
        (!m.store && marker.storeRef)
      )
        this.fail("Use the original confirmation and receipt reference");
      if (item.claimStatus === "REDEEMED") {
        const savedReceipt = await this.readMerchantReceipt(
          { ...r, ownerId: item.ownerId },
          this.merchantReceiptModel(r, item, marker, m, key),
        );
        if (!savedReceipt)
          this.fail(
            "Completed fulfillment receipt is unavailable; inspect the outcome",
          );
        return this.summary(item, m);
      }
    } else {
      const validated =
          await SERVICE.DefaultPromotionOperationService.validateMerchantCoupon(
            {
              ...r,
              ownerId: item.ownerId,
              couponCode: item.providerCode,
              productCode: item.productCode,
              storeCode: m.store?.code,
              targetCode: marker?.code || this.targetCode(r, item),
            },
          ),
        pricedBenefit = validated.conditions?.benefit,
        pricedBinding = this.pricedBinding(pricedBenefit, receipt);
      const expiry = Date.parse(r.payload.validationExpiresAt);
      if (
        !Number.isFinite(expiry) ||
        expiry <= Date.now() ||
        expiry > Date.now() + 300000 ||
        this.validationCode(
          item,
          m,
          r.payload.validationExpiresAt,
          r.authData.loginId,
          pricedBinding,
        ) !== r.payload.validationCode
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
        ...(pricedBenefit ? { pricedBenefit, pricedBinding } : {}),
        ...(m.store
          ? {
              storeRef: {
                moduleName: "store",
                schemaName: "store",
                code: m.store.code,
              },
              storeRevision: m.store.revision,
            }
          : {}),
      };
      item = await this.update(r, item, {
        evidence: { ...item.evidence, merchantRedemption: marker },
      });
      marker = item.evidence.merchantRedemption;
      if (
        marker.confirmationKey !== key ||
        marker.merchantReceiptReference !== receipt ||
        marker.pricedBinding !== pricedBinding ||
        (m.store &&
          (marker.storeRef?.code !== m.store.code ||
            marker.storeRevision !== m.store.revision))
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
    const live = await this.staff(input),
      liveMerchant = await this.withStore(
        live,
        await this.merchant(live, item),
      );
    if (
      !this.scoped(live, liveMerchant) ||
      liveMerchant.code !== m.code ||
      liveMerchant.providerService !== m.providerService ||
      liveMerchant.mode !== m.mode ||
      liveMerchant.store?.code !== m.store?.code ||
      liveMerchant.store?.revision !== m.store?.revision
    )
      this.fail("Fulfillment authority changed; inspect before retrying");
    const receiptModel = this.merchantReceiptModel(r, item, marker, m, key);
    const priorReceipt = await this.readMerchantReceipt(owner, receiptModel);
    if (!priorReceipt) {
      const receiptResult = await provider.confirm(
        { ...live, merchant: liveMerchant, entitlement: item },
        marker,
      );
      if (
        receiptResult?.fulfillmentStatus !== "COMPLETED" ||
        receiptResult.redemptionCode !== marker.code ||
        receiptResult.merchantCode !== m.code ||
        receiptResult.receiptCode !== marker.receiptCode ||
        receiptResult.merchantReceiptReference !== receipt ||
        receiptResult.mode !== m.mode ||
        (marker.pricedBenefit &&
          this.pricedBinding(receiptResult.pricedBenefit, receipt) !==
            marker.pricedBinding) ||
        (m.store &&
          (receiptResult.storeCode !== m.store.code ||
            receiptResult.storeRevision !== m.store.revision))
      )
        this.fail("Merchant fulfillment was not confirmed");
      await this.persistMerchantReceipt(owner, receiptModel);
    }
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
  /**
   * Builds receipt evidence exclusively from the original persisted instruction.
   * @param {Object} request Current admitted partition.
   * @param {Object} item Authoritative purchased entitlement.
   * @param {Object} marker Original persisted fulfillment instruction.
   * @param {Object} merchant Current authorized issuer and outlet.
   * @param {string} key Original reviewed confirmation command.
   * @returns {Object} Immutable receipt projection with stable correlation/time.
   */
  merchantReceiptModel: function (request, item, marker, merchant, key) {
    if (
      !Number.isFinite(Date.parse(marker.confirmedAt)) ||
      marker.confirmationKey !== key ||
      marker.merchantCode !== merchant.code ||
      marker.mode !== merchant.mode
    )
      this.fail("Original fulfillment evidence cannot be verified");
    return {
      code: marker.receiptCode,
      tenant: request.tenant,
      enterpriseCode: request.enterpriseCode,
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
      correlationId: marker.code,
      revealCount: 0,
      evidence: {
        enterpriseRef: marker.enterpriseRef,
        redemptionCode: marker.code,
        merchantReceiptReference: marker.merchantReceiptReference,
        confirmedBy: marker.confirmedBy,
        fulfillmentStatus: "COMPLETED",
        mode: marker.mode,
        ...(marker.pricedBenefit
          ? {
              pricedBenefit: marker.pricedBenefit,
              pricedBinding: marker.pricedBinding,
            }
          : {}),
        ...(merchant.store
          ? { storeRef: marker.storeRef, storeRevision: marker.storeRevision }
          : {}),
      },
    };
  },
  /**
   * Persists an immutable merchant receipt through the existing Digital owner
   * and requires an exact uncached readback before coupon consumption.
   * @param {Object} request Original customer and runtime context.
   * @param {Object} model Frozen receipt tied to the persisted confirmation.
   * @returns {Promise<Object>} Original saved receipt.
   * @override Later layers must preserve owner acknowledgement and replay binding.
   */
  persistMerchantReceipt: async function (request, model) {
    this.assertMerchantReceiptOwner();
    const owner = SERVICE.DefaultDigitalCommerceEntitlementService;
    if (!owner?.save || !owner.assertSaved)
      this.fail("Merchant receipt persistence is unavailable");
    const saved = await owner.save(
      SERVICE.DefaultDigitalDeliveryService,
      request,
      model,
    );
    owner.assertSaved(saved, model);
    return saved;
  },
  /**
   * Reuses only an exactly matching saved receipt on interrupted redemption replay.
   * No recorded receipt means the provider outcome remains subject to its original
   * command idempotency; a failed or ambiguous read never means absence.
   * @param {Object} request Original runtime and buyer context.
   * @param {Object} model Frozen persisted confirmation receipt.
   * @returns {Promise<Object|undefined>} Exact committed receipt or proved absence.
   */
  readMerchantReceipt: async function (request, model) {
    this.assertMerchantReceiptOwner();
    const owner = SERVICE.DefaultDigitalCommerceEntitlementService;
    const rows = await owner.readRecords(
      SERVICE.DefaultDigitalDeliveryService,
      request,
      {
        code: model.code,
        tenant: request.tenant,
        enterpriseCode: request.enterpriseCode,
      },
    );
    if (rows.length > 1) this.fail("Merchant receipt identity is ambiguous");
    if (!rows.length) return undefined;
    owner.assertSaved(rows[0], model);
    return rows[0];
  },
  /** Requires the existing generated receipt owner before acquiring a fulfillment claim. @returns {void} Available contract or refusal. */
  assertMerchantReceiptOwner: function () {
    if (
      !SERVICE.DefaultDigitalDeliveryService?.save ||
      !SERVICE.DefaultDigitalDeliveryService.get ||
      !SERVICE.DefaultDigitalCommerceEntitlementService?.save ||
      !SERVICE.DefaultDigitalCommerceEntitlementService.readRecords ||
      !SERVICE.DefaultDigitalCommerceEntitlementService.assertSaved
    )
      this.fail("Merchant receipt persistence is unavailable");
  },
};
