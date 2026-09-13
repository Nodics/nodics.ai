/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module loyaltyLedger/src/schemas/schemas @description Defines append-only reward movement entries. @layer schema @owner loyaltyLedger @override Later modules may add evidence fields while preserving immutable movement semantics. */
module.exports = {
  loyaltyLedger: {
    rewardLedgerEntry: Object.assign(
      {
        super: "base",
        model: true,
        schemaPolicies: ["operational"],
        service: { enabled: true },
        router: { groups: { schemaOperations: true }, enabled: true },
        cache: { enabled: false },
        event: { enabled: false },
        search: { enabled: false },
      },
      {
        definition: {
          walletCode: {
            type: "string",
            required: true,
            description:
              "Stores the wallet code used to classify, link, or resolve this record.",
          },
          programCode: {
            type: "string",
            required: true,
            description:
              "Stores the program code used to classify, link, or resolve this record.",
          },
          rewardTypeCode: {
            type: "string",
            required: true,
            description:
              "Stores the reward type code used to classify, link, or resolve this record.",
          },
          entryType: {
            type: "string",
            required: true,
            enum: [
              "EARN",
              "RESERVE",
              "CAPTURE",
              "RELEASE",
              "EXPIRE",
              "ADJUST",
              "REVERSE",
            ],
            description:
              "Classifies this record by entry type for validation and business handling.",
          },
          amount: {
            type: "string",
            required: true,
            description: "Stores the amount value used by this record.",
          },
          availableAfter: {
            type: "string",
            required: true,
            description:
              "Stores the available after value used by this record.",
          },
          reservedAfter: {
            type: "string",
            required: true,
            description: "Stores the reserved after value used by this record.",
          },
          sourceType: {
            type: "string",
            required: true,
            description:
              "Classifies this record by source type for validation and business handling.",
          },
          sourceCode: {
            type: "string",
            required: true,
            description:
              "Stores the source code used to classify, link, or resolve this record.",
          },
          targetType: {
            type: "string",
            required: false,
            description:
              "Classifies this record by target type for validation and business handling.",
          },
          targetCode: {
            type: "string",
            required: false,
            description:
              "Stores the target code used to classify, link, or resolve this record.",
          },
          reservationCode: {
            type: "string",
            required: false,
            description:
              "Stores the reservation code used to classify, link, or resolve this record.",
          },
          redemptionCode: {
            type: "string",
            required: false,
            description:
              "Stores the redemption code used to classify, link, or resolve this record.",
          },
          reversalOfEntryCode: {
            type: "string",
            required: false,
            description:
              "Stores the reversal of entry code used to classify, link, or resolve this record.",
          },
          idempotencyKey: {
            type: "string",
            required: true,
            description:
              "Stores the idempotency key value used by this record.",
          },
          correlationId: {
            type: "string",
            required: true,
            description:
              "Stores the correlation identifier used to correlate this record.",
          },
          reasonCode: {
            type: "string",
            required: false,
            description:
              "Stores the reason code used to classify, link, or resolve this record.",
          },
          postedAt: {
            type: "date",
            required: true,
            description: "Records when the posted event or value applies.",
          },
          metadata: {
            type: "object",
            required: false,
            description:
              "Stores additional structured metadata needed by extensions without changing the core schema contract.",
          },
        },
      },
    ),
  },
};

module.exports.loyaltyLedger.rewardLedgerEntry.indexes = {
  code: {
    key: { code: 1 },
    mongodb: { enabled: true, options: { unique: true } },
  },
};
