/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
const { isDeepStrictEqual } = require("node:util");
const failures = new WeakMap();
/** @module promotion/service/defaultPromotionPricedTransactionAdapterService @description Resolves canonical native basket pricing via the Pricing owner and computes only retained coupon monetary rights. @layer service @owner promotion @override Later layers may select a true POS evidence owner; never accept buyer amounts or remove source membership. */
module.exports = {
  /** Returns a fixed owner-minted stage only for the original private failure. */
  failureStage: function (error) { return error && typeof error === "object" ? failures.get(error) : undefined; },
  /** Normalizes private failures without provider diagnostics. @returns {never} */
  fail: function () {
    throw new CLASSES.NodicsError("ERR_PROMOTION_BENEFIT_UNCONFIRMED");
  },
  /** Reads a priced native source using fixed transport and validates every returned identity. @param {Object} r Canonical Promotion input, never direct HTTP. @returns {Promise<Object>} Bound exact benefit evidence. */
  evaluate: async function (r) {
    try {
      const privateRequest = { tenant: r.tenant };
      const snapshot = structuredClone(r), policy = structuredClone(CONFIG.get("promotion")?.merchantBenefits?.pricedSource);
      if (
        typeof SERVICE.DefaultLoggerService?.runSensitiveOperation !==
        "function"
      )
        this.fail();
      return await SERVICE.DefaultLoggerService.runSensitiveOperation(
        privateRequest,
        () => {
          if (!isDeepStrictEqual(r, snapshot) ||
              !isDeepStrictEqual(CONFIG.get("promotion")?.merchantBenefits?.pricedSource, policy)) this.fail();
          return this.evaluatePrivate(r, privateRequest);
        },
      );
    } catch (error) {
      const failure = new CLASSES.NodicsError("ERR_PROMOTION_BENEFIT_UNCONFIRMED");
      failures.set(failure, failures.get(error) || "PRICED_CAPTURE");
      throw failure;
    }
  },
  /** Processes source and monetary proof only inside an admitted private operation. @param {Object} r Trusted Promotion terms. @param {Object} privateRequest Protected request. @returns {Promise<Object>} */
  evaluatePrivate: async function (r, privateRequest) {
    let stage = "PRICED_INPUT";
    try {
      const original = r, snapshot = structuredClone(r);
      r = snapshot;
      if (
        privateRequest.tenant !== r.tenant ||
        SERVICE.DefaultLoggerService?.hasPrivateCaptureProtection?.(
          privateRequest,
        ) !== true
      )
        this.fail();
      const p = CONFIG.get("promotion")?.merchantBenefits?.pricedSource;
      const policy = structuredClone(p);
      if (
        p?.qualified !== true ||
        !/^[A-Za-z][A-Za-z0-9_.-]{0,127}$/.test(p.connectionName || "") ||
        !Number.isSafeInteger(p.timeoutMilliseconds) ||
        p.timeoutMilliseconds < 1 ||
        p.timeoutMilliseconds > 60000 ||
        (p.allowInsecureLoopback !== undefined &&
          typeof p.allowInsecureLoopback !== "boolean") ||
        !Number.isSafeInteger(r.promotionRevision) ||
        r.promotionRevision < 0 ||
        r.issuerEnterpriseRef?.moduleName !== "profile" ||
        r.issuerEnterpriseRef.schemaName !== "enterprise" ||
        r.issuerEnterpriseRef.code !== r.enterpriseCode ||
        r.vendorEnterpriseRef !== undefined &&
          (r.vendorEnterpriseRef.moduleName !== "profile" || r.vendorEnterpriseRef.schemaName !== "enterprise" ||
            typeof r.vendorEnterpriseRef.code !== "string" || !/^[A-Za-z0-9_.:-]{1,128}$/.test(r.vendorEnterpriseRef.code)) ||
        [
          r.tenant,
          r.enterpriseCode,
          r.ownerId,
          r.couponCode,
          r.promotionCode,
          r.storeCode,
        ].some(
          (v) => typeof v !== "string" || !/^[A-Za-z0-9_.:@-]{1,128}$/.test(v),
        ) ||
        !/^CART:[A-Za-z0-9_.-]{1,114}$/.test(r.merchantReceiptReference || "")
      )
        this.fail();
      stage = "PRICED_TRANSPORT";
      let value = await SERVICE.DefaultModuleService.invokeModule({
        local: false,
        moduleName: "pricing",
        connectionName: p.connectionName,
        tenant: r.tenant,
        request: privateRequest,
        targetAuthority: { runtimeRole: "COMMERCE" },
        methodName: "POST",
        apiName: "/internal/merchant/priced-transaction",
        requestBody: {
          enterpriseCode: r.enterpriseCode,
          couponCode: r.couponCode,
          storeCode: r.storeCode,
          sourceReference: r.merchantReceiptReference,
        },
        requireInternalAuth: true,
        timeoutMs: p.timeoutMilliseconds,
        maxResponseBytes: 16384,
        maxAttempts: 1,
        followRedirects: false,
        secureTransport: {
          required: true,
          allowInsecureLoopback: p.allowInsecureLoopback === true,
        },
      });
      stage = "PRICED_RESULT";
      if (!isDeepStrictEqual(original, snapshot) ||
          !isDeepStrictEqual(CONFIG.get("promotion")?.merchantBenefits?.pricedSource, policy) ||
          privateRequest.tenant !== r.tenant ||
          SERVICE.DefaultLoggerService?.hasPrivateCaptureProtection?.(privateRequest) !== true) this.fail();
      for (let depth = 0; depth < 7 && value; depth++) {
        if (
          value.success === false ||
          value.error ||
          /^ERR_/.test(value.code || "") ||
          (value.errors &&
            (!Array.isArray(value.errors) || value.errors.length))
        )
          this.fail();
        if (value.data !== undefined) value = value.data;
        else if (value.result !== undefined) value = value.result;
        else break;
      }
      if (
        value?.contractVersion !== 1 ||
        value.verified !== true ||
        value.sourceType !== "PRICED_TRANSACTION" ||
        value.sourceStage !== "PRICED_CART" ||
        [
          "tenant",
          "enterpriseCode",
          "ownerId",
          "couponCode",
          "promotionCode",
          "storeCode",
        ].some((key) => value[key] !== r[key]) ||
        value.sourceReference !== r.merchantReceiptReference ||
        r.vendorEnterpriseRef?.code !== undefined && r.vendorEnterpriseRef.code !== r.enterpriseCode &&
          value.vendorEnterpriseCode !== r.vendorEnterpriseRef.code ||
        value.vendorEnterpriseCode !== undefined && value.vendorEnterpriseCode !== (r.vendorEnterpriseRef?.code || r.enterpriseCode) ||
        !/^[a-f0-9]{64}$/.test(value.sourceHash || "") ||
        !Number.isSafeInteger(value.sourceRevision) ||
        value.sourceRevision < 0 ||
        !Number.isSafeInteger(value.storeRevision) ||
        value.storeRevision < 1 ||
        !/^[A-Z]{3}$/.test(value.currency || "")
      )
        this.fail();
      stage = "PRICED_CALCULATION";
      const discountAmount =
        SERVICE.DefaultPromotionMerchantBenefitService.calculate(
          value.subtotalAmount,
          r.benefitTerms,
        );
      return {
        ...value,
        eligible: true,
        promotionRevision: r.promotionRevision,
        discountAmount,
      };
    } catch (error) {
      if (stage === "PRICED_TRANSPORT") {
        const remote = error?.metadata?.remoteHttpFailure;
        if ([401, 403].includes(remote?.httpStatus)) stage = "PRICED_AUTHORIZATION";
        else if (remote?.httpStatus === 404) stage = "PRICED_ROUTE";
        else if (remote?.httpStatus === 429) stage = "PRICED_RATE";
        else if (remote?.code === "ERR_PRICING_MERCHANT_UNCONFIRMED") stage = "PRICED_SOURCE";
        else if (error?.code === "ERR_AUTH_00001") stage = "PRICED_SECURE_TRANSPORT";
        else if (error?.metadata?.runtimeInvocationDiagnostic?.failureCode === "REMOTE_ENDPOINT_UNAVAILABLE") stage = "PRICED_ENDPOINT";
        else if (error?.code === "ERR_TNT_00002") stage = "PRICED_CREDENTIAL";
        else if (["ETIMEDOUT", "ESOCKETTIMEDOUT"].includes(error?.code) ||
          ["ETIMEDOUT", "ESOCKETTIMEDOUT"].includes(error?.metadata?.transportFailure?.code)) stage = "PRICED_TIMEOUT";
      }
      const failure = new CLASSES.NodicsError("ERR_PROMOTION_BENEFIT_UNCONFIRMED");
      failures.set(failure, stage);
      throw failure;
    }
  },
};
