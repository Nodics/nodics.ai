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
const confirmations = new WeakMap(), delegatedActions = new WeakMap();
const validationFailures = new WeakMap();
const confirmationFailures = new WeakMap();
const merchantFailures = new WeakMap();
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
  /** Returns only a fixed stage recorded by this owner's actual validation; caller error fields grant nothing. */
  validationDiagnostic: function (error) {
    return error && typeof error === "object" ? validationFailures.get(error) : undefined;
  },
  /** Returns only the original confirmation failure's fixed stage, never caller fields or private causes. */
  confirmationDiagnostic: function (error) {
    return error && typeof error === "object" ? confirmationFailures.get(error) : undefined;
  },
  /** Returns only this owner's fixed merchant-resolution stage for the original failure object. */
  merchantFailureStage: function (error) {
    return error && typeof error === "object" ? merchantFailures.get(error) : undefined;
  },
  /** Selects Promotion's exact private issuer-to-stock owner, never changes generic enterprise scope. @param {Object} r Original context. @returns {Object|undefined} Selected owner. */
  delegation: function (r) {
    const owner = SERVICE.DefaultPromotionMerchantScopeService;
    return r.authData?.principalType === "human" && owner?.enabled() ? owner : undefined;
  },
  /** Admits only the exact token or entitlement for original issuer staff. @param {Object} r Signed staff. @param {Object} selection Exact lookup. @returns {Promise<boolean>} Private admission. */
  admitDelegation: async function (r, selection) {
    const owner = this.delegation(r);
    return owner ? owner.admitted(r) || await owner.admit(r, selection) : false;
  },
  /** Dispatches a fixed vendor mutation only within this owner's actual confirmed flow and original phase. Read admission alone is insufficient. @param {Object} r Original in-flight confirmation. @param {string} operation Fixed mutation. @param {Object} args Exact owner arguments. @returns {Promise<Object>} Mutation result. */
  delegatedAction: async function (r, operation, args) {
    const session = confirmations.get(r), phases = { update: "VALIDATED", claim: "CLAIMABLE",
      persistReceipt: "PROVIDER_ACKNOWLEDGED", redeem: "RECEIPT_CONFIRMED" };
    if (!session || session.phase !== phases[operation]) this.fail("Confirmed fulfillment phase is required");
    const command = { operation };
    delegatedActions.set(command, { request: r, session, phase: session.phase, operation, args: structuredClone(args) });
    try { return await this.delegation(r).execute(r, operation, args, command); }
    finally { delegatedActions.delete(command); }
  },
  /** Recognizes only the unchanged in-flight phase command minted by canonical confirmation. @param {Object} command Private action. @param {Object} r Original staff identity. @param {string} operation Fixed action. @param {Object} args Exact values. @returns {boolean} Admission, never a credential/context. */
  resolveDelegatedAction: function (command, r, operation, args) {
    const value = delegatedActions.get(command);
    if (!value || value.request !== r || value.operation !== operation ||
      !isDeepStrictEqual(command, { operation }) || !isDeepStrictEqual(args, value.args) ||
      confirmations.get(r) !== value.session || value.session.phase !== value.phase)
      this.fail("Confirmed fulfillment phase is required");
    return true;
  },
  /** Validates original unit rights through the exact private handoff when delegated. @param {Object} r Original signed staff. @param {Object} item Purchased entitlement. @param {Object} merchant Current outlet. @returns {Promise<Object>} Promotion validation. */
  validateCoupon: async function (r, item, merchant) {
    const owner = this.delegation(r);
    if (owner?.admitted(r)) return owner.execute(r, "validate", { item });
    return SERVICE.DefaultPromotionOperationService.validateMerchantCoupon({ ...r,
      ownerId: item.ownerId, couponCode: item.providerCode, productCode: item.productCode,
      storeCode: merchant.store?.code,
      storeRevision: merchant.store?.revision,
      targetCode: item.evidence?.merchantRedemption?.code || this.targetCode(r, item) });
  },
  /** Claims or redeems only the purchased unit and original persisted target. @param {Object} r Signed context. @param {Object} item Purchased unit. @param {string} operation Fixed lifecycle action. @returns {Promise<Object>} Owner result. */
  fulfillCoupon: async function (r, item, operation) {
    const owner = this.delegation(r);
    if (!["claim", "redeem"].includes(operation)) this.fail("Invalid fulfillment action");
    if (owner?.admitted(r)) return this.delegatedAction(r, operation, { item });
    return SERVICE.DefaultDigitalCommerceEntitlementService[operation]({ ...r, ownerId: item.ownerId,
      payload: { entitlementCode: item.code, targetCode: item.evidence.merchantRedemption.code,
        targetType: "POS", ...(operation === "redeem" ? { fulfillmentStatus: "COMPLETED" } : {}) } });
  },
  /** Reads the exact original receipt with its admitted stock owner. @param {Object} r Original signed context. @param {Object} model Original receipt. @returns {Promise<Object|undefined>} Receipt. */
  readBoundMerchantReceipt: function (r, model) {
    const owner = this.delegation(r);
    return owner?.admitted(r) ? owner.execute(r, "readReceipt", { model }) :
      this.readMerchantReceipt({ ...r, ownerId: model.ownerId }, model);
  },
  /** Persists only the exact admitted unit receipt, never a generic vendor write. @param {Object} r Original context. @param {Object} model Original receipt. @returns {Promise<Object>} Receipt. */
  persistBoundMerchantReceipt: function (r, model) {
    const owner = this.delegation(r);
    return owner?.admitted(r) ? this.delegatedAction(r, "persistReceipt", { model }) :
      this.persistMerchantReceipt({ ...r, ownerId: model.ownerId }, model);
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
    if (p.qualified !== true || !SERVICE.DefaultStoreMerchantReadService?.list)
      this.fail("Outlet fulfillment is unavailable");
    result.stores = await SERVICE.DefaultStoreMerchantReadService.list(r);
    return result;
  },
  /** Resolves trusted enterprise and customer context. */
  context: function (input, customer = false) {
    const auth = input.authData || {},
      enterpriseCode = auth.enterpriseCode || auth.entCode;
    const bounded = (value) =>
      typeof value === "string" && /^[A-Za-z0-9_.:-]{1,128}$/.test(value);
    if (
      !bounded(input.tenant) || !bounded(enterpriseCode) || this.policy().enabled !== true ||
      [input.tenantCode, auth.tenant, auth.tenantCode].some(
        (value) => value !== undefined && (!bounded(value) || value !== input.tenant),
      ) ||
      [input.enterpriseCode, input.entCode, auth.enterpriseCode, auth.entCode].some(
        (value) => value !== undefined && (!bounded(value) || value !== enterpriseCode),
      ) ||
      (auth.tokenType !== undefined && auth.tokenType !== "access")
    )
      this.fail("Merchant redemption is unavailable");
    if (customer && auth.principalType !== "customer")
      this.fail("Please sign in as a customer");
    const runtime = CONFIG.get("runtimeRole"),
      role = typeof runtime === "string" ? runtime : runtime?.code;
    if (role !== "COMMERCE")
      this.fail("Merchant fulfillment requires operational Commerce");
    return {
      ...input,
      authData: structuredClone(auth),
      ...(input.payload ? { payload: structuredClone(input.payload) } : {}),
      ...(input.query ? { query: structuredClone(input.query) } : {}),
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
    for (let n = 0; n <= 7; n++) {
      if (Array.isArray(v)) return v;
      if (
        !v || typeof v !== "object" ||
        v.error ||
        v.success === false ||
        v.acknowledged === false ||
        (v.code !== undefined && !/^SUC_/.test(v.code)) ||
        (v.errors !== undefined &&
          (!Array.isArray(v.errors) || v.errors.length))
      )
        this.fail("The issuing enterprise is unavailable");
      if (v.data === undefined && v.result === undefined) return v;
      if (n === 7) this.fail("The issuing enterprise is unavailable");
      v = v.data !== undefined ? v.data : v.result;
    }
    this.fail("The issuing enterprise is unavailable");
  },
  /** Reads an entitlement with an optional authenticated customer restriction. */
  entitlement: async function (r, owned) {
    if (!owned && await this.admitDelegation(r, { entitlementCode: r.code }))
      return this.delegation(r).execute(r, "entitlement");
    const items =
      await SERVICE.DefaultDigitalCommerceEntitlementService.listEntitlements(
        r,
        { code: r.code, ...(owned ? { ownerId: r.ownerId } : {}) },
      );
    if (items.length !== 1 || items[0].code !== r.code)
      this.fail("The coupon entitlement is missing or ambiguous");
    this.assertEntitlement(r, items[0], owned);
    return items[0];
  },
  /** Verifies exact operational identity after owner reads; a selector or successful envelope alone is not persisted scope evidence. @param {Object} r Trusted unchanged context. @param {Object} item Persisted entitlement. @param {boolean} owned Require authenticated buyer. @returns {void} Matching identity or refusal. */
  assertEntitlement: function (r, item, owned = false) {
    const identity = (value) => typeof value === "string" &&
      /^[A-Za-z0-9_.:-]{1,256}$/.test(value);
    if (
      !item || item.tenant !== r.tenant || item.enterpriseCode !==
        (this.delegation(r)?.stockEnterprise(r) || r.enterpriseCode) ||
      item.providerOwner !== "promotion" ||
      ![item.code, item.providerCode, item.productCode, item.orderCode].every(identity) ||
      typeof item.ownerId !== "string" || !item.ownerId.trim() || item.ownerId !== item.ownerId.trim() ||
      item.ownerId.length > 192 || /[\u0000-\u001f\u007f]/.test(item.ownerId) ||
      !Number.isSafeInteger(item.revision) || item.revision < 0 ||
      (owned && item.ownerId !== r.ownerId)
    )
      this.fail("The coupon entitlement is missing or ambiguous");
  },
  /** Resolves the coupon issuer through canonical Profile enterprise identity. */
  merchant: async function (r, item) {
    let stage = "RETAINED_UNIT";
    try {
      if (item.enterpriseCode !== r.enterpriseCode && r.authData?.principalType === "human")
        await this.admitDelegation(r, { entitlementCode: item.code });
      this.assertEntitlement(r, item);
      stage = "COUPON_READ";
      const coupon =
        this.delegation(r)?.admitted(r) ? await this.delegation(r).execute(r, "coupon", { item }) :
        await SERVICE.DefaultPromotionOperationService.merchantCoupon({
          ...r,
          couponCode: item.providerCode,
        });
      stage = "COUPON_BINDING";
      if (
        !coupon || coupon.code !== item.providerCode || coupon.tenant !== item.tenant ||
        coupon.enterpriseCode !== item.enterpriseCode || coupon.soldTo !== item.ownerId ||
        coupon.productCode !== item.productCode || coupon.orderCode !== item.orderCode
      )
        this.fail("The purchased coupon does not match its entitlement");
      stage = "ISSUER_REFERENCE";
      const ref = coupon.issuerEnterpriseRef || coupon.enterpriseRef;
      const code = typeof ref === "string" ? ref : ref?.code;
      if (
        typeof code !== "string" || !/^[A-Za-z0-9_.:-]{1,128}$/.test(code) ||
        (typeof ref === "object" &&
          ((ref.moduleName || ref.module || "profile") !== "profile" ||
            (ref.schemaName || ref.schema || "enterprise") !== "enterprise"))
      )
        this.fail("The coupon needs a canonical issuing enterprise");
      stage = "PROFILE_READ";
      const referenceResponse = await SERVICE.DefaultModuleService.invokeModule({
          local: false,
          moduleName: "profile",
          connectionName: "profile",
          targetAuthority: { runtimeRole: "PLATFORM" },
          tenant: r.tenant,
          request: { tenant: r.tenant },
          apiName: "/references/read",
          methodName: "POST",
          requestBody: {
            type: "enterprise",
            codes: [code],
          },
          timeoutMs: 10000,
          maxAttempts: 1,
        });
      stage = "PROFILE_RESULT";
      const response = this.unwrap(referenceResponse);
      const enterprise =
        Array.isArray(response) && response.length === 1
          ? response[0]
          : undefined;
      // Profile filters active references; Enterprise.tenant is its business Tenant relationship.
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
    } catch (error) {
      if (error && typeof error === "object") merchantFailures.set(error, stage);
      throw error;
    }
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
      ...(m.pricedBenefit?.sourceStage === "SIMULATED_ITEMS" && m.pricedBenefit.simulated === true ?
        { simulated: true, deliveryVerified: false, evidenceMode: "LOCAL_SIMULATION" } : {}),
    };
  },
  /** Applies a revisioned entitlement mutation and rereads authoritative state. */
  update: async function (r, item, patch) {
    if (this.delegation(r)?.admitted(r))
      return this.delegatedAction(r, "update", { item, patch });
    this.assertEntitlement(r, item);
    if (item.revision === Number.MAX_SAFE_INTEGER || item.status !== "ACTIVE" ||
        !["UNCLAIMED", "CLAIMED"].includes(item.claimStatus))
      this.fail("The entitlement is unavailable for a fulfillment instruction");
    const response = await SERVICE.DefaultDigitalEntitlementService.update({
      ...this.storage(r),
      query: {
        tenant: r.tenant,
        code: item.code,
        enterpriseCode: r.enterpriseCode,
        revision: item.revision,
        status: item.status,
        claimStatus: item.claimStatus,
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
      ["tenant", "enterpriseCode", "ownerId", "providerOwner", "providerCode", "productCode",
        "orderCode", "orderEntryCode", "sku", "digitalDeliveryType", "purchasedAt", "validTo", "purchasePolicy"].some(
        (key) => JSON.stringify(saved[key]) !== JSON.stringify(item[key]),
      ) ||
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
        .update((item.enterpriseCode || r.enterpriseCode) + ":" + item.code)
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
      typeof auth.loginId !== "string" || !auth.loginId.trim() ||
      auth.loginId !== auth.loginId.trim() || auth.loginId.length > 192 ||
      /[\u0000-\u001f\u007f]/.test(auth.loginId) ||
      typeof router?.isPermissionGranted !== "function" ||
      typeof router?.getGrantedPermissions !== "function" ||
      !router.isPermissionGranted(
        "commerce.coupon.pos.redeem",
        router.getGrantedPermissions(request),
        {},
      )
    )
      this.fail("Merchant confirmation is not permitted for this identity");
    if (
      typeof request.authorization !== "string" ||
      !/^Bearer [^\s\u0000-\u001f\u007f]{1,16384}$/i.test(request.authorization)
    )
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
    const value = this.unwrap(response);
    if (
      value?.principalCode !== auth.loginId ||
      (value.principalType !== undefined && value.principalType !== "human") ||
      !Array.isArray(value.scopes) ||
      !Array.isArray(value.deniedScopes) ||
      value.scopes.length + value.deniedScopes.length > 1000 ||
      (value.scopeCount !== undefined && value.scopeCount !== value.scopes.length)
    )
      this.fail("Merchant scope resolution is unavailable");
    const text = (v) => typeof v === "string" && v.length > 0 && v.length <= 128 &&
      v === v.trim() && !/[\u0000-\u001f\u007f]/.test(v);
    for (const [rows, effect] of [[value.scopes, "ALLOW"], [value.deniedScopes, "DENY"]]) {
      for (const scope of rows) {
        if (
          !scope || typeof scope !== "object" || Array.isArray(scope) ||
          !text(scope.scopeType) || !text(scope.scopeCode) ||
          ["tenantCode", "enterpriseCode", "capabilityCode", "permissionCode"].some(
            (key) => scope[key] !== undefined && scope[key] !== null &&
              scope[key] !== "" && !text(scope[key]),
          ) ||
          (scope.effect !== undefined && scope.effect !== effect) ||
          (scope.status !== undefined && scope.status !== "ACTIVE") || scope.active === false
        )
          this.fail("Merchant scope resolution is unavailable");
      }
    }
    return { ...request, scopes: structuredClone(value) };
  },
  /** Applies explicit deny-over-allow Profile scopes to the merchant's enterprise or business unit. */
  scoped: function (request, merchant) {
    const match = (scope) => {
      if (scope.tenantCode && scope.tenantCode !== request.tenant) return false;
      if (scope.enterpriseCode && scope.enterpriseCode !== merchant.enterpriseCode) return false;
      if (
        scope.capabilityCode &&
        !["*", "commerce", "digitalCore"].includes(scope.capabilityCode)
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
  /** Allows ITEM receipt handles for qualified delivery or explicitly gated LOCAL simulation; monetary handles retain their own adapter and binding. @returns {boolean} */
  itemEvidenceSelected: function () {
    const p = CONFIG.get("promotion")?.merchantBenefits;
    return p?.enabled === true && (p.qualified === true ||
      p.itemEvidenceMode === "LOCAL_SIMULATION" && SERVICE.DefaultPromotionItemBenefitService?.simulationSelected() === true) &&
      /^[A-Za-z][A-Za-z0-9_]{0,127}$/.test(p.itemEvidenceService || "") &&
      typeof SERVICE[p.itemEvidenceService]?.evaluate === "function";
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
    // The original object is the private handoff identity; do not clone it for the provider.
    r.entitlement = item;
    r.merchant = merchant;
    r.redemption = marker;
    return r;
  },
  /** Validates the code already displayed in the customer's existing coupon purchase view. */
  validate: async function (input) {
    let stage = "STAFF";
    try {
      const r = await this.staff(input),
        token = r.payload?.couponToken;
      stage = "INPUT";
      if (this.nativePricingSelected() && !this.itemEvidenceSelected())
        this.nativeBasketReference(r.payload?.merchantReceiptReference);
      if (
        typeof token !== "string" ||
        token.trim().length < 4 ||
        token.length > 256
      )
        this.fail("Enter the coupon code presented by the customer");
      stage = "ISSUER_ADMISSION";
      const delegated = await this.admitDelegation(r, { token });
      stage = "COUPON";
      const coupon = delegated ? await this.delegation(r).execute(r, "coupon") :
        await SERVICE.DefaultPromotionOperationService.merchantCoupon({
          ...r,
          couponToken: token,
        });
      stage = "ENTITLEMENT";
      const items = delegated ? [await this.delegation(r).execute(r, "entitlement")] :
        await SERVICE.DefaultDigitalCommerceEntitlementService.listEntitlements(
          r,
          { providerOwner: "promotion", providerCode: coupon.code },
        );
      const item = items.length === 1 ? items[0] : undefined;
      if (!item || item.providerCode !== coupon.code)
        this.fail("The purchased coupon is missing or ambiguous");
      this.assertEntitlement(r, item);
      stage = "MERCHANT";
      const merchant = await this.merchant(r, item);
      stage = "STORE";
      const m = await this.withStore(r, merchant);
      stage = "SCOPE";
      if (!this.scoped(r, m))
        this.fail("The issuing enterprise is outside your assigned scope");
      if (item.claimStatus === "REDEEMED")
        return {
          ...this.summary(item, m),
          eligible: false,
          reason: "ALREADY_REDEEMED",
        };
      stage = "PURCHASE_STATE";
      if (
        item.status !== "ACTIVE" ||
        !["UNCLAIMED", "CLAIMED"].includes(item.claimStatus)
      )
        this.fail("The coupon is unavailable for fulfillment");
      stage = "RIGHTS";
      const conditions = await this.validateCoupon(r, item, m);
      stage = "VALIDATION_BINDING";
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
    } catch (error) {
      if (error && typeof error === "object") validationFailures.set(error, stage);
      throw error;
    }
  },
  /** Lists only prior fulfillment requests whose issuing enterprise is within the employee's current Profile scope. */
  queue: async function (input) {
    if (SERVICE.DefaultPromotionMerchantScopeService?.enabled())
      return SERVICE.DefaultPromotionMerchantScopeService.queue(input);
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
  /** Inspects the original committed fulfillment receipt without invoking a provider or replaying redemption. @param {Object} input Current staff, entitlement and original command reference. @returns {Promise<Object>} Exact committed receipt evidence or explicitly unconfirmed state. */
  inspectReceipt: async function (input) {
    const r = await this.staff(input);
    const key = r.idempotencyKey;
    if (
      typeof key !== "string" ||
      !/^[A-Za-z0-9._:-]{8,180}$/.test(key) ||
      typeof r.payload?.merchantReceiptReference !== "string" ||
      !/^[A-Za-z0-9][A-Za-z0-9 ._:/@-]{2,119}$/.test(
        r.payload.merchantReceiptReference,
      )
    )
      this.fail("Original receipt reference is required");
    const item = await this.entitlement(r, false);
    const merchant = await this.withStore(r, await this.merchant(r, item));
    if (!this.scoped(r, merchant))
      this.fail("Receipt is outside your assigned scope");
    const marker = item.evidence?.merchantRedemption;
    if (
      !marker ||
      marker.confirmationKey !== key ||
      marker.merchantReceiptReference !== r.payload.merchantReceiptReference ||
      marker.merchantCode !== merchant.code ||
      marker.mode !== merchant.mode ||
      marker.storeRef?.code !== merchant.store?.code ||
      marker.storeRevision !== merchant.store?.revision
    )
      this.fail("Original receipt could not be verified");
    const pending = {
      contractVersion: 1,
      entitlementCode: item.code,
      state: "UNCONFIRMED",
      ...(marker.pricedBenefit?.sourceStage === "SIMULATED_ITEMS" && marker.pricedBenefit.simulated === true ?
        { simulated: true, deliveryVerified: false, evidenceMode: "LOCAL_SIMULATION" } : {}),
    };
    if (item.claimStatus !== "REDEEMED") return pending;
    const receipt = await this.readBoundMerchantReceipt(
      r,
      this.merchantReceiptModel(r, item, marker, merchant, key),
    );
    if (!receipt) return pending;
    const fresh = await this.staff(input);
    const current = await this.entitlement(fresh, false);
    const live = await this.withStore(
      fresh,
      await this.merchant(fresh, current),
    );
    if (
      !this.scoped(fresh, live) ||
      live.code !== merchant.code ||
      live.mode !== merchant.mode ||
      live.store?.code !== merchant.store?.code ||
      live.store?.revision !== merchant.store?.revision ||
      current.claimStatus !== "REDEEMED" ||
      current.revision !== item.revision ||
      JSON.stringify(current.evidence?.merchantRedemption) !==
        JSON.stringify(marker)
    )
      this.fail("Receipt authority changed during inspection");
    return {
      contractVersion: 1,
      entitlementCode: item.code,
      state: "COMPLETED",
      confirmationKey: key,
      receiptCode: receipt.code,
      merchantReceiptReference: marker.merchantReceiptReference,
      merchantCode: merchant.code,
      mode: merchant.mode,
      ...(marker.pricedBenefit?.sourceStage === "SIMULATED_ITEMS" && marker.pricedBenefit.simulated === true ?
        { simulated: true, deliveryVerified: false, evidenceMode: "LOCAL_SIMULATION" } : {}),
      ...(merchant.store
        ? {
            storeCode: merchant.store.code,
            storeRevision: merchant.store.revision,
          }
        : {}),
    };
  },
  /** Confirms employee fulfillment and receipt, then claims and redeems through Promotion under the original customer's ownership. */
  confirm: async function (input) {
    let r, stage = "AUTHORITY";
    try {
    r = await this.staff(input);
    const key = this.command(r);
    if (this.nativePricingSelected() && !this.itemEvidenceSelected())
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
      !/^[A-Za-z0-9][A-Za-z0-9 ._:/@-]{2,119}$/.test(receipt)
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
        const savedReceipt = await this.readBoundMerchantReceipt(
          r,
          this.merchantReceiptModel(r, item, marker, m, key),
        );
        if (!savedReceipt)
          this.fail(
            "Completed fulfillment receipt is unavailable; inspect the outcome",
          );
        return this.summary(item, m);
      }
    } else {
      stage = "VALIDATION";
      const validated = await this.validateCoupon(r, item, m),
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
      stage = "MARKER";
      confirmations.set(r, { phase: "VALIDATED" });
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
    stage = "CLAIM";
    confirmations.set(r, { phase: "CLAIMABLE" });
    if (item.claimStatus === "UNCLAIMED") {
      await this.fulfillCoupon(r, item, "claim");
      item = await this.entitlement(r, false);
    }
    stage = "LIVE_AUTHORITY";
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
    stage = "RECEIPT_READ";
    const receiptModel = this.merchantReceiptModel(r, item, marker, m, key);
    const priorReceipt = await this.readBoundMerchantReceipt(r, receiptModel);
    if (!priorReceipt) {
      stage = "PROVIDER";
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
      stage = "RECEIPT_WRITE";
      confirmations.get(r).phase = "PROVIDER_ACKNOWLEDGED";
      await this.persistBoundMerchantReceipt(r, receiptModel);
    }
    stage = "REDEEM";
    confirmations.get(r).phase = "RECEIPT_CONFIRMED";
    try {
      await this.fulfillCoupon(r, item, "redeem");
    } catch (error) {
      const saved = await this.entitlement(r, false);
      if (saved.claimStatus !== "REDEEMED") throw error;
    }
    stage = "READBACK";
    return this.summary(await this.entitlement(r, false), m);
    } catch (error) {
      if (error && typeof error === "object") confirmationFailures.set(error, stage);
      throw error;
    } finally { confirmations.delete(r); }
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
      enterpriseCode: item.enterpriseCode || request.enterpriseCode,
      ownerId: item.ownerId,
      entitlementCode: item.code,
      orderCode: item.orderCode,
      deliveryType: "MERCHANT_RECEIPT",
      providerOwner: "promotion",
      providerCode: item.providerCode,
      status: "DELIVERED",
      revision: 0,
      active: true,
      // Generic persistence owns created/updated; deliveredAt pins the original business event.
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
