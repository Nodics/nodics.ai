/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module loyaltyWallet/src/schemas/schemas @description Defines owner wallets and per-reward balance projections. @layer schema @owner loyaltyWallet @override Later modules may add governed fields while preserving ownerType/ownerCode identity and ledger-backed balances. */
module.exports = {
  loyaltyWallet: {
    loyaltyWallet: Object.assign(
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
          ownerType: {
            type: "string",
            required: true,
            enum: ["CUSTOMER", "EMPLOYEE", "ENTERPRISE", "PARTNER", "SYSTEM"],
            description:
              "Classifies the type of owner responsible for this record.",
          },
          ownerCode: {
            type: "string",
            required: true,
            description:
              "Stores the owner code used to classify, link, or resolve this record.",
          },
          status: {
            type: "string",
            required: true,
            enum: ["OPEN", "SUSPENDED", "CLOSED"],
            description:
              "Tracks the lifecycle state that controls whether this record can be used in business processes.",
          },
          openedAt: {
            type: "date",
            required: true,
            description: "Records when the opened event or value applies.",
          },
          closedAt: {
            type: "date",
            required: false,
            description: "Records when the closed event or value applies.",
          },
          revision: {
            type: "int",
            required: true,
            default: 0,
            description:
              "Tracks the business revision used for governance, review, and optimistic update checks.",
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
    loyaltyWalletRewardBalance: Object.assign(
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
          available: {
            type: "string",
            required: true,
            default: "0.00",
            description:
              "Stores the available value, using the configured default when no explicit value is provided.",
          },
          reserved: {
            type: "string",
            required: true,
            default: "0.00",
            description:
              "Stores the reserved value, using the configured default when no explicit value is provided.",
          },
          earned: {
            type: "string",
            required: true,
            default: "0.00",
            description:
              "Stores the earned value, using the configured default when no explicit value is provided.",
          },
          spent: {
            type: "string",
            required: true,
            default: "0.00",
            description:
              "Stores the spent value, using the configured default when no explicit value is provided.",
          },
          expired: {
            type: "string",
            required: true,
            default: "0.00",
            description:
              "Stores the expired value, using the configured default when no explicit value is provided.",
          },
          reversed: {
            type: "string",
            required: true,
            default: "0.00",
            description:
              "Stores the reversed value, using the configured default when no explicit value is provided.",
          },
          updatedAt: {
            type: "date",
            required: true,
            description: "Records when the updated event or value applies.",
          },
          revision: {
            type: "int",
            required: true,
            default: 0,
            description:
              "Tracks the business revision used for governance, review, and optimistic update checks.",
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

const transferRecordDefaults = {
  super: "base",
  model: true,
  schemaPolicies: ["operational"],
  service: { enabled: true },
  router: { enabled: false },
  cache: { enabled: false },
  event: { enabled: false },
  search: { enabled: false },
  backoffice: { mutationMode: "READ_ONLY", operations: ["search", "read"] },
};
const conversionRecordDefaults = {
  ...transferRecordDefaults,
  backoffice: { enabled: false },
};
module.exports.loyaltyWallet.rewardTransferOperation = {
  ...transferRecordDefaults,
  definition: {
    ownerType: {
      type: "string",
      required: true,
      description: "Canonical source owner type.",
    },
    ownerCode: {
      type: "string",
      required: true,
      description: "Canonical source owner code.",
    },
    intent: {
      type: "object",
      required: true,
      description:
        "Immutable transfer participants, exact amount, program/type and original command identity.",
    },
    result: {
      type: "object",
      required: true,
      description:
        "Confirmed debit and credit ledger references and charged fee.",
    },
    actorCode: {
      type: "string",
      required: true,
      description: "Original authorized actor, distinct from owner.",
    },
    completedAt: {
      type: "date",
      required: true,
      description: "Atomic transfer completion timestamp.",
    },
    notificationPlan: {
      type: "object",
      required: false,
      description:
        "Frozen source-bound recipient/message selections and Communication intent pointers; no delivery attempt state.",
    },
    revision: {
      type: "int",
      required: true,
      default: 0,
      description:
        "Optimistic receipt revision for notification pointers; accounting intent and result remain immutable.",
    },
  },
};
module.exports.loyaltyWallet.rewardTransferUsage = {
  ...transferRecordDefaults,
  definition: {
    ownerType: {
      type: "string",
      required: true,
      description: "Owner sharing this allowance across employees and wallets.",
    },
    ownerCode: {
      type: "string",
      required: true,
      description: "Canonical owner code.",
    },
    programCode: {
      type: "string",
      required: true,
      description: "Issuing reward program.",
    },
    rewardTypeCode: {
      type: "string",
      required: true,
      description: "Reward unit; no mixed-unit counters.",
    },
    period: {
      type: "string",
      required: true,
      description: "Recorded day and configured timezone.",
    },
    amount: {
      type: "string",
      required: true,
      description:
        "Exact completed transfer quantity excluding separately recorded fee.",
    },
    count: {
      type: "int",
      required: true,
      description: "Completed transfer count, once per original operation.",
    },
    revision: {
      type: "int",
      required: true,
      description: "Optimistic counter revision.",
    },
  },
};
module.exports.loyaltyWallet.rewardTransferPolicy = {
  ...transferRecordDefaults,
  definition: {
    ownerType: {
      type: "string",
      required: true,
      description: "Customer or Enterprise selecting participation.",
    },
    ownerCode: {
      type: "string",
      required: true,
      description: "Canonical owner code, never acting employee.",
    },
    programCode: {
      type: "string",
      required: true,
      description: "Program to which these selections apply.",
    },
    rewardTypeCode: {
      type: "string",
      required: true,
      description: "Eligible reward type.",
    },
    selections: {
      type: "object",
      required: true,
      description:
        "Validated outgoing/incoming, amount and count selections overriding framework policy.",
    },
    revision: {
      type: "int",
      required: true,
      description: "Governed policy version.",
    },
    updatedBy: {
      type: "string",
      required: true,
      description: "Authorized actor changing owner selections.",
    },
    updatedAt: {
      type: "date",
      required: true,
      description: "Governed selection change time.",
    },
  },
};
module.exports.loyaltyWallet.loyaltyPartnerRewardIntegration = {
  ...conversionRecordDefaults,
  definition: {
    partnerEnterpriseCode: {
      type: "string",
      required: true,
      description: "Canonical partner Enterprise reference.",
    },
    providerKey: {
      type: "string",
      required: true,
      description:
        "Selected qualified adapter key, never an arbitrary service name.",
    },
    revision: {
      type: "int",
      required: true,
      description: "Governed integration revision.",
    },
    status: {
      type: "string",
      required: true,
      description: "Integration lifecycle.",
      enum: ["ACTIVE", "PAUSED", "RETIRED"],
    },
    conversionEnabled: {
      type: "bool",
      required: true,
      description: "Governed per-partner conversion participation.",
    },
    sourceRewards: {
      type: "array",
      required: true,
      description: "Exact permitted programCode/rewardTypeCode pairs.",
    },
    termsReference: {
      type: "string",
      required: true,
      description: "Agreed conversion terms reference.",
    },
    termsRevision: {
      type: "string",
      required: true,
      description: "Agreed conversion terms revision.",
    },
    providerBindingReference: {
      type: "string",
      required: true,
      description: "Opaque qualified adapter binding, not credentials.",
    },
    rules: {
      type: "object",
      required: true,
      description: "Governed partner-specific rules without secret values.",
    },
  },
};
module.exports.loyaltyWallet.loyaltyPartnerRewardAccount = {
  ...conversionRecordDefaults,
  definition: {
    integrationCode: {
      type: "string",
      required: true,
      description: "Owning integration reference.",
    },
    partnerEnterpriseCode: {
      type: "string",
      required: true,
      description: "Canonical partner reference.",
    },
    ownerType: {
      type: "string",
      required: true,
      description: "Canonical participant type.",
      enum: ["CUSTOMER", "ENTERPRISE"],
    },
    ownerCode: {
      type: "string",
      required: true,
      description: "Canonical participant owner reference.",
    },
    revision: {
      type: "int",
      required: true,
      description: "Verified account binding revision.",
    },
    status: {
      type: "string",
      required: true,
      description: "Account verification state.",
      enum: ["VERIFIED", "REVOKED"],
    },
    accountReference: {
      type: "string",
      required: true,
      description: "Private opaque external account locator.",
    },
    verificationReference: {
      type: "string",
      required: true,
      description: "Account ownership verification evidence.",
    },
    validUntil: {
      type: "date",
      required: false,
      description: "Optional account verification deadline.",
    },
  },
};
module.exports.loyaltyWallet.loyaltyPartnerRewardConversionRecord = {
  ...conversionRecordDefaults,
  definition: {
    revision: {
      type: "int",
      required: true,
      description: "Conditional operation revision.",
    },
    status: {
      type: "string",
      required: true,
      description: "Durable conversion lifecycle.",
      enum: [
        "QUOTED",
        "HOLDING",
        "HELD",
        "SUBMITTED",
        "CREDIT_CONFIRMED",
        "NO_CREDIT_CONFIRMED",
        "COMPLETED",
        "REJECTED",
        "EXPIRED",
      ],
    },
    intent: {
      type: "object",
      required: true,
      description: "Immutable normalized source request.",
    },
    ownerType: {
      type: "string",
      required: true,
      description: "Canonical participant type.",
      enum: ["CUSTOMER", "ENTERPRISE"],
    },
    ownerCode: {
      type: "string",
      required: true,
      description: "Canonical participant owner reference.",
    },
    actorCode: {
      type: "string",
      required: true,
      description: "Original authorized actor.",
    },
    integration: {
      type: "object",
      required: true,
      description: "Immutable validated integration snapshot.",
    },
    account: {
      type: "object",
      required: true,
      description: "Immutable private verified account snapshot.",
    },
    sourceAmount: {
      type: "string",
      required: true,
      description: "Exact source reward quantity.",
    },
    sourceScale: {
      type: "int",
      required: true,
      description: "Canonical source reward precision.",
    },
    targetAmount: {
      type: "string",
      required: true,
      description: "Exact provider-quoted target quantity.",
    },
    targetScale: {
      type: "int",
      required: true,
      description: "Provider-qualified target unit precision.",
    },
    targetUnit: {
      type: "string",
      required: true,
      description: "External partner reward unit.",
    },
    quoteReference: {
      type: "string",
      required: true,
      description: "Provider quote evidence.",
    },
    quoteExpiresAt: {
      type: "date",
      required: true,
      description:
        "Deadline for confirming the quote, not for releasing confirmed holds.",
    },
    termsReference: {
      type: "string",
      required: true,
      description: "Frozen agreed terms reference.",
    },
    termsRevision: {
      type: "string",
      required: true,
      description: "Frozen terms revision.",
    },
    createdAt: {
      type: "date",
      required: true,
      description: "Quote creation time.",
    },
    confirmedAt: {
      type: "date",
      required: false,
      description: "Source confirmation time.",
    },
    confirmedBy: {
      type: "string",
      required: false,
      description: "Authorized confirming actor.",
    },
    reservationCode: {
      type: "string",
      required: false,
      description: "Protected source hold.",
    },
    providerEvidence: {
      type: "object",
      required: false,
      description: "Private terminal external outcome evidence.",
    },
    captureLedgerEntryCode: {
      type: "string",
      required: false,
      description: "Confirmed source debit.",
    },
    redemptionCode: {
      type: "string",
      required: false,
      description: "Canonical source redemption evidence.",
    },
    releaseLedgerEntryCode: {
      type: "string",
      required: false,
      description: "Source release after a terminal no-credit fence.",
    },
    completedAt: {
      type: "date",
      required: false,
      description: "Terminal local settlement time.",
    },
  },
};
module.exports.loyaltyWallet.rewardTestCreditOperation = {
  ...transferRecordDefaults,
  definition: {
    ownerType: {
      type: "string",
      required: true,
      enum: ["ENTERPRISE"],
      description: "Canonical test recipient type.",
    },
    ownerCode: {
      type: "string",
      required: true,
      description:
        "Existing recipient Enterprise, distinct from administrator.",
    },
    testOnly: {
      type: "bool",
      required: true,
      description: "Explicit non-production allocation marker.",
    },
    environmentCode: {
      type: "string",
      required: true,
      description: "Actual selected test environment at posting.",
    },
    intent: {
      type: "object",
      required: true,
      description:
        "Immutable wallet, program, type, amount, reason and command identity.",
    },
    scale: {
      type: "int",
      required: true,
      description: "Original governed POINT precision for exact replay.",
    },
    actor: {
      type: "object",
      required: true,
      description:
        "Original administrator identity and authority proof references.",
    },
    ledgerEntryCode: {
      type: "string",
      required: true,
      description: "Atomic canonical EARN ledger reference.",
    },
    creditedAt: {
      type: "date",
      required: true,
      description: "Original allocation time.",
    },
    revision: {
      type: "int",
      required: true,
      default: 0,
      description: "Immutable receipt revision.",
    },
  },
  backoffice: { enabled: false },
};
for (const schema of Object.values(module.exports.loyaltyWallet)) {
  schema.transaction = { enabled: true, sideEffects: "none" };
  schema.indexes = {
    code: {
      key: { code: 1 },
      mongodb: { enabled: true, options: { unique: true } },
    },
  };
}
