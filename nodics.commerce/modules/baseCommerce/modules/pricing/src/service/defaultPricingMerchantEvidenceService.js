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
/** @module pricing/service/defaultPricingMerchantEvidenceService @description Prices a canonical coupon buyer's native merchant basket from activated Pricing policy only. This is priced intent, not external POS/payment settlement. @layer service @owner pricing @override Later layers may provide actual external POS owners; retain signed admission, canonical membership, exact money and no source fallback. */
module.exports = {
  /** Refuses unsafe source evidence without private owner diagnostics. @returns {never} */
  fail: function () {
    throw new CLASSES.NodicsError("ERR_PRICING_MERCHANT_UNCONFIRMED");
  },
  /** Reusable fixed runtime caller binding; a permission alone never supplies a buyer. @param {Object} input Verified request. @returns {Promise<Object>} Signed authority. */
  authorize: async function (input) {
    if (
      SERVICE.DefaultLoggerService?.hasPrivateCaptureProtection?.(input) !==
      true
    )
      this.fail();
    const auth = SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(
      input,
      "pricing",
    );
    if (
      auth.principalType !== "service" ||
      !auth.modules.includes("promotion") ||
      !Array.isArray(auth.permissions) ||
      !auth.permissions.includes("commerce.pricing.merchant.evidence") ||
      (auth.enterpriseCode && auth.enterpriseCode !== auth.entCode) ||
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
    }
    SERVICE.DefaultPromotionOperationService.requireOperationalRuntime();
    return auth;
  },
  /** Reads a complete bounded uncached canonical owner result, never client totals. @param {Object} service Owner service. @param {Object} r Scope. @param {Object} query Fixed query. @returns {Promise<Array>} */
  read: async function (service, r, query) {
    if (typeof service?.get !== "function") this.fail();
    const result = await service.get({
      tenant: r.tenant,
      authData: r.authData,
      query: { ...query, tenant: r.tenant },
      options: { recursive: false, skipItemCache: true },
      searchOptions: { pageSize: 101, limit: 101 },
    });
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
          !Object.keys(query).every((key) => row[key] === query[key]),
      )
    )
      this.fail();
    return rows;
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
  /** Evaluates native CART handles without arbitrary buyer IDs, source prices or payment claims. @param {Object} input Signed runtime input. @returns {Promise<Object>} Private priced source. */
  evaluate: async function (input) {
    try {
      const auth = await this.authorize(input),
        body = input.payload || {};
      if (
        Object.keys(body).sort().join(",") !==
          "couponCode,sourceReference,storeCode" ||
        Object.keys(input.query || {}).length ||
        [input.tenant, auth.entCode, body.couponCode, body.storeCode].some(
          (v) => typeof v !== "string" || !/^[A-Za-z0-9_.:@-]{1,128}$/.test(v),
        ) ||
        !/^CART:[A-Za-z0-9_.-]{1,114}$/.test(body.sourceReference || "")
      )
        this.fail();
      const r = {
          tenant: input.tenant,
          enterpriseCode: auth.entCode,
          authData: auth,
        },
        coupon = await this.one(SERVICE.DefaultCouponService, r, {
          code: body.couponCode,
        }),
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
        coupon.issuerEnterpriseRef.code !== auth.entCode ||
        typeof coupon.soldTo !== "string" ||
        !/^[A-Za-z0-9_.:@-]{1,128}$/.test(coupon.soldTo) ||
        store.active !== true ||
        store.status !== "ACTIVE" ||
        (typeof store.enterpriseRef === "string"
          ? store.enterpriseRef
          : store.enterpriseRef?.code) !== auth.entCode ||
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
      const cartCode = body.sourceReference.slice(5),
        query = {
          code: cartCode,
          enterpriseCode: auth.entCode,
          ownerId: coupon.soldTo,
          storeCode: store.code,
        },
        cart = await this.one(SERVICE.DefaultCartService, r, query),
        entriesQuery = {
          cartCode,
          enterpriseCode: auth.entCode,
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
        context = { ...r, storeCode: store.code, currency: cart.currency, now };
      const publication = SERVICE.DefaultPricingPublicationService;
      if (!publication.deliveryEnabled(context)) this.fail();
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
      const fingerprint = this.hash({ cart, entries, coupon, store, records }),
        freshCart = await this.one(SERVICE.DefaultCartService, r, query),
        freshEntries = (
          await this.read(SERVICE.DefaultCartEntryService, r, entriesQuery)
        ).sort((a, b) => a.code.localeCompare(b.code)),
        freshCoupon = await this.one(SERVICE.DefaultCouponService, r, {
          code: coupon.code,
        }),
        freshStore = await this.one(SERVICE.DefaultStoreService, r, {
          code: store.code,
        }),
        freshRecords = await publication.readConfigured(context);
      if (
        this.hash({
          cart: freshCart,
          entries: freshEntries,
          coupon: freshCoupon,
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
    }
  },
};
