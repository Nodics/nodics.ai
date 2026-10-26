/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module digitalCore/utils/statusDefinitions @description Stable merchant authorization and fulfillment failures. @layer config @owner digitalCore */
module.exports = {
  ERR_DIGITAL_CARBON_CREDENTIAL: { code: "503", message: "Carbon component unconfirmed at CREDENTIAL." },
  ERR_DIGITAL_CARBON_TARGET: { code: "503", message: "Carbon component unconfirmed at TARGET." },
  ERR_DIGITAL_CARBON_AUTHORIZATION: { code: "503", message: "Carbon component unconfirmed at AUTHORIZATION." },
  ERR_DIGITAL_CARBON_TRANSPORT: { code: "503", message: "Carbon component unconfirmed at TRANSPORT." },
  ERR_DIGITAL_CARBON_EVIDENCE: { code: "503", message: "Carbon component unconfirmed at EVIDENCE." },
  ERR_DIGITAL_CARBON_HOLDINGS: { code: "503", message: "Carbon component unconfirmed at HOLDINGS." },
  ERR_DIGITAL_COUPON_SOURCE_GATES: { code: "409", message: "Coupon acquisition source proof is unconfirmed at GATES" },
  ERR_DIGITAL_COUPON_SOURCE_AUTH: { code: "409", message: "Coupon acquisition source proof is unconfirmed at AUTH" },
  ERR_DIGITAL_COUPON_SOURCE_ALLOCATION: { code: "409", message: "Coupon acquisition source proof is unconfirmed at ALLOCATION" },
  ERR_DIGITAL_COUPON_SOURCE_GRANT: { code: "409", message: "Coupon acquisition source proof is unconfirmed at GRANT" },
  ERR_DIGITAL_COUPON_SOURCE_COUPON: { code: "409", message: "Coupon acquisition source proof is unconfirmed at COUPON" },
  ERR_DIGITAL_COUPON_SOURCE_ALLOCATION_BINDING: { code: "409", message: "Coupon acquisition source proof is unconfirmed at ALLOCATION_BINDING" },
  ERR_DIGITAL_COUPON_SOURCE_COMMAND: { code: "409", message: "Coupon acquisition source proof is unconfirmed at COMMAND" },
  ERR_DIGITAL_COUPON_SOURCE_PHASE: { code: "409", message: "Coupon acquisition source proof is unconfirmed at PHASE" },
  ERR_DIGITAL_COUPON_SOURCE_CONSIDERATION: { code: "409", message: "Coupon acquisition source proof is unconfirmed at CONSIDERATION" },
  ERR_DIGITAL_COUPON_SOURCE_FAILURE_PROOF: { code: "409", message: "Coupon acquisition source proof is unconfirmed at FAILURE_PROOF" },
  ERR_DIGITAL_COUPON_SOURCE_READBACK: { code: "409", message: "Coupon acquisition source proof is unconfirmed at READBACK" },
  ERR_DIGITAL_BUNDLE_OWNER_UNAVAILABLE: { code: '503', message: 'The bundle component owner service is not available' },
  ERR_DIGITAL_BUNDLE_INPUT: { code: '400', message: 'A valid nonempty bundle with distinct eligible components is required' },
  ERR_DIGITAL_BUNDLE_UNAVAILABLE: { code: '409', message: 'A bundle component is unavailable or has changed; refresh your holdings' },
  ERR_DIGITAL_COUPON_RECOVERY_INSPECTION: { code: '409', message: 'Original coupon recovery evidence could not be confirmed' },
  ...require("./merchantValidationDiagnostics").statuses,
  ERR_DIGITAL_OWNERSHIP_EVIDENCE: { code: "403", message: "Exact ownership evidence or binding admission could not be confirmed" },
  ERR_DIGITAL_REVEAL_FORBIDDEN: { code: '403', message: 'Authenticated committed digital reveal is unavailable for this scope' },
  ERR_DIGITAL_MERCHANT_INVALID: {
    code: "400",
    message: "Merchant redemption could not be confirmed",
  },
  ERR_DIGITAL_NOTIFICATION_UNCONFIRMED: {
    code: "409",
    message: "Committed notification evidence could not be confirmed",
  },
  ERR_DIGITAL_REMINDER_PRIVACY: { code: "503", message: "Coupon reminder private entry could not be qualified" },
  ERR_DIGITAL_REMINDER_INPUT: { code: "400", message: "Coupon reminder execution input could not be confirmed" },
  ERR_DIGITAL_REMINDER_AUTHORITY: { code: "403", message: "Coupon reminder runtime authority could not be confirmed" },
  ERR_DIGITAL_REMINDER_POLICY: { code: "503", message: "Coupon reminder action policy could not be confirmed" },
  ERR_DIGITAL_REMINDER_CLAIM_TRANSPORT: { code: "503", message: "Coupon reminder Process claim transport did not complete" },
  ERR_DIGITAL_REMINDER_CLAIM_PROOF: { code: "409", message: "Coupon reminder Process claim proof could not be confirmed" },
  ERR_DIGITAL_REMINDER_SOURCE: { code: "409", message: "Coupon reminder source sweep did not complete" },
  ERR_DIGITAL_REMINDER_CLAIM_CREDENTIAL: { code: "503", message: "Internal service credential is unavailable for coupon reminder claim" },
  ERR_DIGITAL_REMINDER_CLAIM_ENDPOINT: { code: "503", message: "Process endpoint is unavailable for coupon reminder claim" },
  ERR_DIGITAL_REMINDER_CLAIM_HTTP_NOT_FOUND: { code: "503", message: "Process claim endpoint returned not found" },
  ERR_DIGITAL_REMINDER_CLAIM_HTTP_AUTHORITY: { code: "503", message: "Process claim endpoint refused service admission" },
  ERR_DIGITAL_REMINDER_CLAIM_HTTP_CONFLICT: { code: "503", message: "Process claim endpoint refused the execution state" },
  ERR_DIGITAL_REMINDER_CLAIM_HTTP_SERVER: { code: "503", message: "Process claim endpoint returned a server failure" },
  ERR_DIGITAL_REMINDER_CLAIM_NETWORK: { code: "503", message: "Process claim network transport was unavailable" },
  ERR_DIGITAL_REMINDER_CLAIM_LOCAL: { code: "503", message: "Coupon reminder claim failed before transport completion" },
};
