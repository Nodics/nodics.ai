/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module digitalCore/utils/merchantValidationDiagnostics @description Registered fixed private validation stages. Append only to preserve status identities; never include request or remote error text. @layer utility @owner digitalCore */
const stages = ["STAFF", "INPUT", "ISSUER_ADMISSION", "COUPON", "ENTITLEMENT", "MERCHANT",
  "STORE", "SCOPE", "PURCHASE_STATE", "RIGHTS", "VALIDATION_BINDING",
  ...["STAFF", "PERSISTENCE_AUTH", "TOKEN_READ", "ENTITLEMENT_READ", "COUPON_READ",
    "COUPON_SCOPE", "SECURE_PERSISTENCE", "BATCH_READ", "ISSUANCE_BINDING", "TOKEN_MEMBERSHIP",
    "PUBLICATION_SELECTION", "ISSUER_ACTIVE", "VENDOR_ACTIVE", "CAMPAIGN_READ", "BENEFIT_SELECTION",
    "CONSENT", "OUTLET_SCOPE", "PURCHASE_BINDING", "REQUEST_INTEGRITY"].map(stage => "ISSUER_ADMISSION:" + stage),
  ...["RETAINED_UNIT", "COUPON_READ", "COUPON_BINDING", "ISSUER_REFERENCE", "PROFILE_READ", "PROFILE_RESULT"]
    .map(stage => "MERCHANT:" + stage),
  ...["COUPON_READ", "COUPON_BINDING", "CAMPAIGN", "WINDOW", "CONDITIONS", "BENEFIT",
    "PRICED_CAPTURE", "PRICED_INPUT", "PRICED_TRANSPORT", "PRICED_RESULT", "PRICED_CALCULATION",
    "PRICED_AUTHORIZATION", "PRICED_ROUTE", "PRICED_RATE", "PRICED_SOURCE", "PRICED_SECURE_TRANSPORT", "PRICED_CREDENTIAL", "PRICED_TIMEOUT"]
    .map(stage => "RIGHTS:" + stage), "RIGHTS:PRICED_ENDPOINT",
  ...["AUTHORITY", "VALIDATION", "MARKER", "CLAIM", "LIVE_AUTHORITY", "RECEIPT_READ", "PROVIDER", "RECEIPT_WRITE", "REDEEM", "READBACK"]
    .map(stage => "CONFIRM:" + stage),
  ...["AUTHORITY", "INSTRUCTION", "RIGHTS", "BINDING"].map(stage => "CONFIRM:PROVIDER:" + stage),
  ...["BUDGET_HANDOFF", "BUDGET_STOCK", "BUDGET_SECURE_PERSISTENCE", "BUDGET_PERSISTENCE", "BUDGET_REVALIDATE", "BUDGET_MUTATE",
    "BUDGET_OWNER", "BUDGET_POLICY", "BUDGET_TRANSACTION", "BUDGET_POLICY_READBACK", "BUDGET_TX_CURRENT", "BUDGET_TX_AUTHORITY",
    "BUDGET_TX_RECEIPT", "BUDGET_TX_COUPON_FENCE", "BUDGET_TX_LIMIT", "BUDGET_TX_LEDGER", "BUDGET_TX_COUNTER", "BUDGET_TX_READBACK"]
    .map(stage => "CONFIRM:REDEEM:" + stage)];
const codes = Object.freeze(Object.fromEntries(stages.map((stage, index) =>
  [stage, "ERR_DIGITAL_MERCHANT_DIAGNOSTIC_" + String(index + 1).padStart(3, "0")])));
const statuses = Object.freeze(Object.fromEntries(Object.entries(codes).map(([stage, code]) =>
  [code, Object.freeze({ code: "400", message: (stage.startsWith("CONFIRM:") ? "Merchant confirmation" : "Merchant validation") + " failed at owner stage " + stage })])));
module.exports = Object.freeze({ codes, statuses });
