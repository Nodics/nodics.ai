/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module promotion/utils/statusDefinitions @description Defines actionable campaign validity failures for merchant redemption. @layer utility @owner promotion */
module.exports = {
  SUC_PROMOTION_SETUP_00001: { code: "200", message: "Promotion setup instructions were verified and applied" },
  ERR_PROMOTION_SETUP_INVALID: { code: "422", message: "An explicit immutable Promotion setup contribution is required" },
  ERR_PROMOTION_SETUP_TOKEN_OWNER_REQUIRED: { code: "409", message: "Generated coupon issuance requires a qualified private token retention owner" },
  ERR_PROMOTION_SECURE_ISSUANCE_UNCONFIRMED: { code: '409', message: 'Secure coupon issuance or retained evidence could not be confirmed' },
  ERR_PROMOTION_ISSUANCE_TRANSACTION_REQUIRED: { code: '409', message: 'Secure coupon issuance requires qualified atomic transactions' },
  ERR_PROMOTION_ISSUANCE_SCHEMA_REQUIRED: { code: '409', message: 'Secure coupon issuance requires protected non-versioned schemas' },
  ERR_PROMOTION_ISSUANCE_HOOKS_REQUIRED: { code: '409', message: 'Secure coupon issuance requires installed private lifecycle guards' },
  ERR_PROMOTION_ISSUANCE_INDEX_REQUIRED: { code: '409', message: 'Secure coupon issuance requires installed unconditional unique indexes' },
  ERR_PROMOTION_ISSUANCE_ENTERPRISE_REQUIRED: { code: '409', message: 'Secure coupon issuance requires exact reviewed issuer and vendor enterprise references' },
  ERR_PROMOTION_BUDGET_ADMISSION_UNCONFIRMED: {
    code: "409",
    message: "First-use promotion budget admission could not be confirmed",
  },
  ERR_PROMOTION_BUDGET_LEDGER_UNCONFIRMED: {
    code: "409",
    message: "Promotion budget ledger read evidence could not be confirmed",
  },
  ERR_PROMOTION_BUDGET_ADMISSION_FORBIDDEN: {
    code: "403",
    message: "Authenticated promotion budget management authority is required",
  },
  ERR_PROMOTION_BUDGET_ADMISSION_INVALID: {
    code: "422",
    message: "A pinned first-use promotion budget instruction is required",
  },
  ERR_PROMOTION_BENEFIT_UNCONFIRMED: {
    code: "409",
    message: "Authoritative coupon benefit could not be confirmed",
  },
  ERR_PROMOTION_POS_INVALID: {
    code: "409",
    message: "The coupon is unavailable for merchant fulfillment",
  },
  ERR_PROMOTION_SELLER_UNCONFIRMED: {
    code: "409",
    message: "Issuer seller authorization could not be confirmed",
  },
};
