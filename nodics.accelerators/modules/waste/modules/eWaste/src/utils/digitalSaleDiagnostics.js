/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module eWaste/utils/digitalSaleDiagnostics @description Registered static diagnostics for private sale failures. Append only to preserve status identities; never include request or dependency error text. @layer utility @owner eWaste */
const messages = [
  "Digital ownership service authority is unavailable", "Digital ownership service authority changed",
  "Exact original digital ownership evidence is unavailable", "Digital-sale owner target is unavailable",
  "Digital-sale owner response failed", "Exact digital binding is required", "Digital ownership binding is unavailable",
  "Waste reverse Product binding is unavailable", "Retained Product locale proof is required",
  "Retained Product proof is required", "Retained Product proof changed", "Canonical digital-sale Store is unavailable",
  "Exact digital-sale policy is required", "Digital-sale policy is unavailable",
  "Digital-sale settlement policy is unsupported or incomplete", "Digital-sale buyer is unavailable",
  "Canonical Profile customer evidence route is unavailable", "Canonical Commerce ownership evidence route is unavailable",
  "Exact Commerce ownership evidence is unconfirmed",
  ...["OWNER", "PRIVATE_REQUEST", "SELECTORS", "AUTHORITY_DRIFT", "ASSET_SCOPE", "GENERATED_PARTITION", "GENERATED_ENVELOPE", "GENERATED_READBACK"]
    .map(gate => "Exact original digital ownership evidence is unavailable: " + gate),
  ...["CONTEXT_OWNER", "BINDING_OWNER", "CUSTOMER_OWNER", "GENERATED_READ_OWNER", "PRIVATE_OWNER"]
    .map(gate => "Exact original digital ownership evidence is unavailable: " + gate),
  ...["EVIDENCE_PRIVATE", "EVIDENCE_SELECTORS", "EVIDENCE_SNAPSHOT", "EVIDENCE_AUTHORITY",
    "EVIDENCE_PROJECTION", "EVIDENCE_EVENT", "EVIDENCE_GENERATED_CONTEXT", "EVIDENCE_GENERATED_RECORDS"]
    .map(gate => "Exact original digital ownership evidence is unavailable: " + gate),
  "Digital ownership controller operation is unavailable",
];
const codes = Object.freeze(Object.fromEntries(messages.map((message, index) =>
  [message, "ERR_EWASTE_SALE_DIAGNOSTIC_" + String(index + 1).padStart(3, "0")])));
const statuses = Object.freeze(Object.fromEntries(Object.entries(codes).map(([message, code]) =>
  [code, Object.freeze({ code: "503", message })])));
module.exports = Object.freeze({ codes, statuses });
