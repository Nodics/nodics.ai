/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
const crypto = require("node:crypto");
const { isDeepStrictEqual } = require("node:util");
const couponReads = new WeakMap();
const admissions = new WeakMap();
// Registration stays private: a copied context or direct helper call cannot acquire read authority.
const admission = {
  /** Refuses unsafe source evidence without private owner diagnostics. @returns {never} */
  fail: function () {
    throw new CLASSES.NodicsError("ERR_PRICING_MERCHANT_UNCONFIRMED");
  },
  /** Pins signed request coordinates without retaining bearer/header secrets. @param {Object} input Original private request. @returns {Object} Detached scope. */
  requestState: function (input) {
    const headers = input.httpRequest?.headers || {};
    return structuredClone({ tenant: input.tenant, tenantCode: input.tenantCode,
      entCode: input.entCode, enterpriseCode: input.enterpriseCode, authData: input.authData,
      payload: input.payload, query: input.query,
      headers: Object.fromEntries(["tenant", "x-tenant-code", "X-Tenant-Code", "entCode", "x-enterprise-code", "X-Enterprise-Code"]
        .map(key => [key, headers[key]])) });
  },
  /** Admits an exact body business selector separately from the unchanged signed runtime namespace. @param {Object} input Private original request. @param {Object} body Detached selectors. @param {Object} auth Verified runtime snapshot. @returns {Object} In-flight read scope only. */
  admit: function (input, body, auth) {
    const policy = CONFIG.get("pricing")?.merchantEvidence;
    const headers = input.httpRequest?.headers || {};
    if (!isDeepStrictEqual(input.authData, auth) || auth.isSystem || [input.tenantCode, auth.tenantCode, headers.tenant, headers["x-tenant-code"], headers["X-Tenant-Code"]]
      .some(value => value !== undefined && value !== input.tenant) ||
      [input.entCode, input.enterpriseCode, headers.entCode, headers["x-enterprise-code"], headers["X-Enterprise-Code"]]
        .some(value => value !== undefined && value !== auth.entCode)) this.fail();
    const enterpriseCode = body.enterpriseCode === undefined ? auth.entCode : body.enterpriseCode;
    const delegated = enterpriseCode !== auth.entCode;
    let environment, runtimeRole;
    if (delegated) {
      const selection = policy?.businessCallers;
      environment = NODICS.getSelectedEnvironmentName();
      runtimeRole = CONFIG.get("runtimeRole")?.code;
      const coordinates = ["projectCode", "environmentCode", "serverCode", "instanceCode", "assignmentCode"];
      const fields = ["tenant", "principalEnterpriseCode", "enterpriseCode", "serviceId", ...coordinates];
      const identifier = value => typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/.test(value);
      const callers = selection?.callers;
      if (selection?.enabled !== true || selection.runtimeRole !== "COMMERCE" || runtimeRole !== selection.runtimeRole ||
          !Array.isArray(callers) || !callers.length || callers.length > 100 || callers.some(grant =>
            !grant || Object.keys(grant).sort().join(",") !== [...fields].sort().join(",") ||
            fields.some(key => !identifier(grant[key]))) ||
          callers.filter(grant => grant.tenant === auth.tenant && grant.principalEnterpriseCode === auth.entCode &&
            grant.enterpriseCode === enterpriseCode && grant.serviceId === auth.serviceId &&
            coordinates.every(key => grant[key] === auth.runtimeScope?.[key]) &&
            grant.instanceCode === auth.runtimeInstanceId && grant.environmentCode === environment).length !== 1) this.fail();
    }
    const context = { tenant: input.tenant, enterpriseCode, authData: auth };
    admissions.set(context, { input, request: this.requestState(input), context: structuredClone(context),
      body: structuredClone(body), policy: structuredClone(policy), delegated, environment, runtimeRole,
      publication: structuredClone(CONFIG.get("pricing")?.publication) });
    this.admitted(context);
    return context;
  },
  /** Rejects copied scopes and request, policy, privacy or deployment drift around every awaited read. @param {Object} context Original admitted scope. @returns {void} */
  admitted: function (context) {
    const pin = admissions.get(context);
    if (!pin || !isDeepStrictEqual(context, pin.context) || !isDeepStrictEqual(this.requestState(pin.input), pin.request) ||
        !isDeepStrictEqual(CONFIG.get("pricing")?.merchantEvidence, pin.policy) ||
        !isDeepStrictEqual(CONFIG.get("pricing")?.publication, pin.publication) ||
        SERVICE.DefaultLoggerService?.hasPrivateCaptureProtection?.(pin.input) !== true ||
        pin.delegated && (NODICS.getSelectedEnvironmentName() !== pin.environment || CONFIG.get("runtimeRole")?.code !== pin.runtimeRole)) this.fail();
  },
  /** Supplies private owner persistence, never altered runtime claims or general schema access. @param {Object} context Exact admitted scope. @returns {Object} Local persistence auth. */
  ownerAuth: function (context) {
    this.admitted(context);
    if (!admissions.get(context).delegated) return context.authData;
    const auth = SERVICE.DefaultIdentityGovernanceService?.getSystemAuthData?.();
    if (auth?.isSystem !== true) this.fail();
    return structuredClone(auth);
  },
  /** Binds the buyer only after canonical coupon/outlet checks. @param {Object} context Exact scope. @param {string} buyer Canonical soldTo. @returns {void} */
  bindBuyer: function (context, buyer) {
    this.admitted(context);
    const pin = admissions.get(context);
    if (pin.buyer !== undefined && pin.buyer !== buyer) this.fail();
    pin.buyer = buyer;
  },
  /** Limits delegated generated reads to the fixed source, outlet and derived buyer basket. @param {Object} context Exact scope. @param {Object} service Fixed owner. @param {Object} query Fixed selectors. @returns {Object} Read-only persistence auth. */
  readAuth: function (context, service, query) {
    this.admitted(context);
    const pin = admissions.get(context);
    if (!pin.delegated) return context.authData;
    const cartCode = pin.body.sourceReference.slice(5), enterpriseCode = context.enterpriseCode;
    const allowed = [
      [SERVICE.DefaultCouponService, { code: pin.body.couponCode }],
      [SERVICE.DefaultStoreService, { code: pin.body.storeCode }],
      ...(pin.buyer === undefined ? [] : [
        [SERVICE.DefaultCartService, { code: cartCode, enterpriseCode, ownerId: pin.buyer, storeCode: pin.body.storeCode }],
        [SERVICE.DefaultCartEntryService, { cartCode, enterpriseCode, ownerId: pin.buyer, status: "ACTIVE" }],
      ]),
    ];
    if (!allowed.some(([owner, fixed]) => owner === service && isDeepStrictEqual(query, fixed))) this.fail();
    return this.ownerAuth(context);
  },
};
/** @module pricing/service/defaultPricingMerchantEvidenceService @description Prices a canonical coupon buyer's native merchant basket from activated Pricing policy only. This is priced intent, not external POS/payment settlement. @layer service @owner pricing @override Later layers may provide actual external POS owners; retain signed admission, canonical membership, exact money and no source fallback. */
module.exports = {
  /** Refuses unsafe source evidence without private owner diagnostics. @returns {never} */
  fail: admission.fail,
  /** Reusable fixed runtime caller binding; a permission alone never supplies a buyer. @param {Object} input Verified request. @returns {Promise<Object>} Signed authority. */
  authorize: async function (input) {
    if (
      SERVICE.DefaultLoggerService?.hasPrivateCaptureProtection?.(input) !==
      true
    )
      this.fail();
    const tenant = input.tenant;
    const state = admission.requestState(input), policy = structuredClone(CONFIG.get("pricing")?.merchantEvidence);
    const publication = structuredClone(CONFIG.get("pricing")?.publication);
    const businessSelection = input.payload?.enterpriseCode !== undefined && input.payload.enterpriseCode !== input.authData?.entCode;
    const environment = businessSelection ? NODICS.getSelectedEnvironmentName() : undefined;
    const runtimeRole = businessSelection ? CONFIG.get("runtimeRole")?.code : undefined;
    const signed = SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(
      input,
      "pricing",
    );
    const auth = structuredClone(signed);
    if (
      signed !== input.authData || auth.isSystem ||
      auth.principalType !== "service" ||
      !auth.modules.includes("promotion") ||
      !Array.isArray(auth.permissions) ||
      !auth.permissions.includes("commerce.pricing.merchant.evidence") ||
      (auth.enterpriseCode !== undefined && auth.enterpriseCode !== auth.entCode) ||
      CONFIG.get("pricing")?.merchantEvidence?.qualified !== true
    )
      this.fail();
    for (const moduleName of ["pricing", "cart", "store", "promotion"]) {
      if (!SERVICE.DefaultModuleService.isLocalModuleActive(moduleName))
        this.fail();
      await SERVICE.DefaultModuleRegistrationAgentService.assertModuleOperational(
        moduleName,
        input.tenant,
      );
      if (!isDeepStrictEqual(admission.requestState(input), state) ||
          !isDeepStrictEqual(CONFIG.get("pricing")?.merchantEvidence, policy) ||
          !isDeepStrictEqual(CONFIG.get("pricing")?.publication, publication) ||
          SERVICE.DefaultLoggerService?.hasPrivateCaptureProtection?.(input) !== true ||
          businessSelection && (NODICS.getSelectedEnvironmentName() !== environment || CONFIG.get("runtimeRole")?.code !== runtimeRole)) this.fail();
    }
    SERVICE.DefaultPromotionOperationService.requireOperationalRuntime();
    if (input.tenant !== tenant || !isDeepStrictEqual(input.authData, auth) ||
        !isDeepStrictEqual(admission.requestState(input), state) ||
        !isDeepStrictEqual(CONFIG.get("pricing")?.merchantEvidence, policy) ||
        !isDeepStrictEqual(CONFIG.get("pricing")?.publication, publication) ||
        SERVICE.DefaultLoggerService?.hasPrivateCaptureProtection?.(input) !== true) this.fail();
    return auth;
  },
  /** Reads a complete bounded uncached canonical owner result, never client totals. @param {Object} service Owner service. @param {Object} r Scope. @param {Object} query Fixed query. @returns {Promise<Array>} */
  read: async function (service, r, query) {
    admission.admitted(r);
    if (typeof service?.get !== "function") this.fail();
    const fixed = structuredClone(query);
    const result = await service.get({
      tenant: r.tenant,
      authData: admission.readAuth(r, service, query),
      query: { ...fixed, tenant: r.tenant },
      options: { recursive: false, skipItemCache: true },
      searchOptions: { pageSize: 101, limit: 101 },
    });
    admission.admitted(r);
    if (!isDeepStrictEqual(query, fixed)) this.fail();
    if (
      !/^SUC_/.test(result?.code || "") ||
      result.success === false ||
      result.error ||
      (result.errors && (!Array.isArray(result.errors) || result.errors.length))
    )
      this.fail();
    const rows = result.result;
    if (
      !Array.isArray(rows) ||
      rows.length > 100 ||
      [result.total, result.count, result.totalCount].some(
        (v) =>
          v !== undefined && (!Number.isSafeInteger(v) || v !== rows.length),
      ) ||
      rows.some(
        (row) =>
          !row ||
          row.tenant !== r.tenant ||
          !Object.keys(fixed).every((key) => row[key] === fixed[key]),
      )
    )
      this.fail();
    return structuredClone(rows);
  },
  /** Requires one exact canonical identity. @param {Object} service Owner. @param {Object} r Context. @param {Object} query Fixed selectors. @returns {Promise<Object>} */
  one: async function (service, r, query) {
    const rows = await this.read(service, r, query);
    if (rows.length !== 1) this.fail();
    return rows[0];
  },
  /** Produces a stable fingerprint of selected canonical members. @param {*} value Private evidence. @returns {string} */
  hash: function (value) {
    return crypto
      .createHash("sha256")
      .update(JSON.stringify(value))
      .digest("hex");
  },
  /** Resolves only the current fixed priced-source coupon. Delegated vendor persistence requires the existing Promotion private receipt owner, never an issuer-auth rewrite or a caller-selected vendor. @param {Object} r Exact in-flight verified runtime context. @param {string} code Original coupon selector. @returns {Promise<Object>} Canonical coupon plus original issuance binding fingerprint. */
  readCoupon: async function (r, code) {
    admission.admitted(r);
    const admitted = couponReads.get(r);
    if (!admitted || admitted.code !== code || !isDeepStrictEqual(r, admitted.context)) this.fail();
    const observed = await this.one(SERVICE.DefaultCouponService, r, { code });
    if (observed.issuerEnterpriseRef?.moduleName !== "profile" ||
        observed.issuerEnterpriseRef.schemaName !== "enterprise" ||
        observed.issuerEnterpriseRef.code !== r.enterpriseCode) this.fail();
    if (observed.enterpriseCode === undefined || observed.enterpriseCode === r.enterpriseCode) {
      if (observed.vendorEnterpriseRef !== undefined &&
          (observed.vendorEnterpriseRef.moduleName !== "profile" || observed.vendorEnterpriseRef.schemaName !== "enterprise" ||
            observed.vendorEnterpriseRef.code !== r.enterpriseCode)) this.fail();
      return { coupon: observed };
    }
    const scope = SERVICE.DefaultPromotionMerchantScopeService;
    if (!scope?.read || !scope.binding || !SERVICE.DefaultPromotionDistributionAdmissionService?.assertInstalled ||
        observed.vendorEnterpriseRef?.moduleName !== "profile" || observed.vendorEnterpriseRef.schemaName !== "enterprise" ||
        observed.vendorEnterpriseRef.code !== observed.enterpriseCode) this.fail();
    await SERVICE.DefaultPromotionDistributionAdmissionService.assertInstalled(r);
    admission.admitted(r);
    const coupon = await scope.read("DefaultCouponService", r, { tenant: r.tenant, enterpriseCode: observed.enterpriseCode, code });
    admission.admitted(r);
    if (!coupon || coupon.tenant !== r.tenant || coupon.code !== code ||
        ["enterpriseCode", "soldTo", "promotionCode", "batchCode", "productCode", "orderCode", "status", "revision"].some(key =>
          coupon[key] !== observed[key]) || !isDeepStrictEqual(coupon.issuerEnterpriseRef, observed.issuerEnterpriseRef) ||
        !isDeepStrictEqual(coupon.vendorEnterpriseRef, observed.vendorEnterpriseRef)) this.fail();
    const binding = await scope.binding(r, coupon);
    admission.admitted(r);
    if (binding?.tenant !== r.tenant || binding.issuerEnterpriseCode !== r.enterpriseCode ||
        binding.sellerEnterpriseCode !== coupon.enterpriseCode || binding.promotionCode !== coupon.promotionCode ||
        binding.batchCode !== coupon.batchCode || !/^[a-f0-9]{64}$/.test(binding.issuanceFingerprint || "")) this.fail();
    if (!isDeepStrictEqual(r, admitted.context)) this.fail();
    return { coupon, issuanceBindingFingerprint: this.hash(binding) };
  },
  /** Evaluates native CART handles without arbitrary buyer IDs, source prices or payment claims. @param {Object} input Signed runtime input. @returns {Promise<Object>} Private priced source. */
  evaluate: async function (input) {
    let readScope;
    try {
      const body = structuredClone(input.payload || {}), tenant = input.tenant;
      const state = admission.requestState(input), settings = structuredClone(CONFIG.get("pricing"));
      const auth = await this.authorize(input);
      if (input.tenant !== tenant || !isDeepStrictEqual(admission.requestState(input), state) ||
          !isDeepStrictEqual(CONFIG.get("pricing")?.merchantEvidence, settings?.merchantEvidence) ||
          !isDeepStrictEqual(CONFIG.get("pricing")?.publication, settings?.publication)) this.fail();
      if (
        !["couponCode,sourceReference,storeCode", "couponCode,enterpriseCode,sourceReference,storeCode"]
          .includes(Object.keys(body).sort().join(",")) ||
        !isDeepStrictEqual(body, input.payload) ||
        Object.keys(input.query || {}).length ||
        [input.tenant, auth.entCode, body.couponCode, body.storeCode, ...(Object.hasOwn(body, "enterpriseCode") ? [body.enterpriseCode] : [])].some(
          (v) => typeof v !== "string" || !/^[A-Za-z0-9_.:@-]{1,128}$/.test(v),
        ) ||
        !/^CART:[A-Za-z0-9_.-]{1,114}$/.test(body.sourceReference || "")
      )
        this.fail();
      const r = admission.admit(input, body, auth);
      readScope = r;
      couponReads.set(r, { code: body.couponCode, context: structuredClone(r) });
      const couponEvidence = await this.readCoupon(r, body.couponCode),
        coupon = couponEvidence.coupon,
        store = await this.one(SERVICE.DefaultStoreService, r, {
          code: body.storeCode,
        });
      if (
        coupon.active !== true ||
        !["DELIVERED", "CLAIMED"].includes(coupon.status) ||
        !Number.isFinite(Date.parse(coupon.soldAt)) ||
        Date.parse(coupon.soldAt) > Date.now() ||
        !Number.isFinite(Date.parse(coupon.validTo)) ||
        Date.parse(coupon.validTo) <= Date.now() ||
        coupon.issuerEnterpriseRef?.moduleName !== "profile" ||
        coupon.issuerEnterpriseRef?.schemaName !== "enterprise" ||
        coupon.issuerEnterpriseRef.code !== r.enterpriseCode ||
        typeof coupon.soldTo !== "string" ||
        !/^[A-Za-z0-9_.:@-]{1,128}$/.test(coupon.soldTo) ||
        store.active !== true ||
        store.status !== "ACTIVE" ||
        (typeof store.enterpriseRef === "string"
          ? store.enterpriseRef
          : store.enterpriseRef?.code) !== r.enterpriseCode ||
        (typeof store.enterpriseRef === "object" &&
          ((store.enterpriseRef.moduleName ||
            store.enterpriseRef.module ||
            "profile") !== "profile" ||
            (store.enterpriseRef.schemaName ||
              store.enterpriseRef.schema ||
              "enterprise") !== "enterprise")) ||
        !Number.isSafeInteger(store.revision) ||
        store.revision < 1
      )
        this.fail();
      admission.bindBuyer(r, coupon.soldTo);
      const cartCode = body.sourceReference.slice(5),
        query = {
          code: cartCode,
          enterpriseCode: r.enterpriseCode,
          ownerId: coupon.soldTo,
          storeCode: store.code,
        },
        cart = await this.one(SERVICE.DefaultCartService, r, query),
        entriesQuery = {
          cartCode,
          enterpriseCode: r.enterpriseCode,
          ownerId: coupon.soldTo,
          status: "ACTIVE",
        },
        entries = await this.read(
          SERVICE.DefaultCartEntryService,
          r,
          entriesQuery,
        );
      if (
        !entries.length ||
        cart.active !== true ||
        !["ACTIVE", "CALCULATED"].includes(cart.status) ||
        !Number.isSafeInteger(cart.revision) ||
        cart.revision < 0 ||
        !/^[A-Z]{3}$/.test(cart.currency || "") ||
        cart.currency !== store.defaultCurrency ||
        new Set(entries.map((row) => row.code)).size !== entries.length
      )
        this.fail();
      const exact = SERVICE.DefaultExactAmountService,
        now = new Date(),
        context = { ...r, authData: admission.ownerAuth(r), storeCode: store.code, currency: cart.currency, now };
      const publicationContext = structuredClone(context);
      const publication = SERVICE.DefaultPricingPublicationService;
      if (!publication.deliveryEnabled(context)) this.fail();
      admission.admitted(r);
      if (!isDeepStrictEqual(context, publicationContext)) this.fail();
      const records = await publication.readConfigured(context),
        books = records
          .filter(
            (row) => row.schema === "priceBook" && row.policy?.active !== false,
          )
          .map((row) => row.policy),
        rows = records
          .filter(
            (row) => row.schema === "priceRow" && row.policy?.active !== false,
          )
          .map((row) => row.policy),
        decisions = [];
      admission.admitted(r);
      if (!isDeepStrictEqual(context, publicationContext)) this.fail();
      let subtotalAmount = "0";
      for (const entry of entries.sort((a, b) =>
        a.code.localeCompare(b.code),
      )) {
        if (
          entry.active !== true ||
          !/^[A-Za-z0-9_.:@-]{1,128}$/.test(entry.code || "") ||
          !/^[A-Za-z0-9_.:@-]{1,128}$/.test(entry.productCode || "") ||
          !Number.isSafeInteger(entry.revision) ||
          entry.revision < 0 ||
          typeof entry.quantity !== "string" ||
          !/^\d{1,12}(\.\d{1,8})?$/.test(entry.quantity) ||
          exact.compare(entry.quantity, "0") <= 0 ||
          entry.priceQuoteCode ||
          entry.variantCode
        )
          this.fail();
        const request = {
            ...context,
            productCode: entry.productCode,
            quantity: entry.quantity,
            calculationVersion: "merchant-v1",
          },
          selection = SERVICE.DefaultPriceSelectionService.select(
            request,
            books,
            rows,
            exact,
          );
        if (
          !selection.selected ||
          selection.conflicts.length ||
          exact.compare(selection.selected.minQuantity || "1", "0") <= 0 ||
          typeof selection.selected.unitAmount !== "string" ||
          !/^\d{1,18}(\.\d{1,8})?$/.test(selection.selected.unitAmount) ||
          exact.compare(selection.selected.unitAmount, "0") < 0
        )
          this.fail();
        const decision = SERVICE.DefaultPricingDecisionService.decide(
          request,
          selection.selected,
          exact,
        );
        subtotalAmount = exact.add(subtotalAmount, decision.totalAmount);
        decisions.push({
          entryCode: entry.code,
          entryRevision: entry.revision,
          ...decision,
        });
      }
      if (
        !/^(0|[1-9]\d{0,17})(\.\d{1,8})?$/.test(exact.normalize(subtotalAmount))
      )
        this.fail();
      const fingerprint = this.hash({ cart, entries, couponEvidence, store, records }),
        freshCart = await this.one(SERVICE.DefaultCartService, r, query),
        freshEntries = (
          await this.read(SERVICE.DefaultCartEntryService, r, entriesQuery)
        ).sort((a, b) => a.code.localeCompare(b.code)),
        freshCouponEvidence = await this.readCoupon(r, coupon.code),
        freshStore = await this.one(SERVICE.DefaultStoreService, r, {
          code: store.code,
        }),
        freshRecords = await publication.readConfigured(context);
      admission.admitted(r);
      if (!isDeepStrictEqual(context, publicationContext)) this.fail();
      if (
        this.hash({
          cart: freshCart,
          entries: freshEntries,
          couponEvidence: freshCouponEvidence,
          store: freshStore,
          records: freshRecords,
        }) !== fingerprint
      )
        this.fail();
      return {
        contractVersion: 1,
        verified: true,
        tenant: r.tenant,
        enterpriseCode: r.enterpriseCode,
        ...(couponEvidence.issuanceBindingFingerprint ? { vendorEnterpriseCode: coupon.enterpriseCode } : {}),
        ownerId: coupon.soldTo,
        couponCode: coupon.code,
        promotionCode: coupon.promotionCode,
        storeCode: store.code,
        storeRevision: store.revision,
        sourceType: "PRICED_TRANSACTION",
        sourceStage: "PRICED_CART",
        sourceReference: body.sourceReference,
        sourceRevision: cart.revision,
        sourceHash: this.hash({
          tenant: r.tenant,
          enterpriseCode: r.enterpriseCode,
          ownerId: coupon.soldTo,
          couponCode: coupon.code,
          ...(couponEvidence.issuanceBindingFingerprint ? { vendorEnterpriseCode: coupon.enterpriseCode,
            issuanceBindingFingerprint: couponEvidence.issuanceBindingFingerprint } : {}),
          cartCode,
          cartRevision: cart.revision,
          storeCode: store.code,
          storeRevision: store.revision,
          records,
          decisions,
        }),
        currency: cart.currency,
        subtotalAmount: exact.normalize(subtotalAmount),
      };
    } catch (_) {
      this.fail();
    } finally {
      if (readScope) {
        couponReads.delete(readScope);
        admissions.delete(readScope);
      }
    }
  },
};
