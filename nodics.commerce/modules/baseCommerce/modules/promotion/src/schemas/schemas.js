/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module promotion/src/schemas/schemas @description Defines governed Phase 2 promotion persistence and decision evidence. @layer schema @owner promotion */
const enterpriseAssociationDefinitions = {
  enterpriseCode: {
    type: "string",
    required: false,
    description:
      "Compatibility enterprise code alias. New logic should also populate enterpriseRef, issuerEnterpriseRef, or vendorEnterpriseRef.",
  },
  enterpriseRef: {
    type: "object",
    required: false,
    description:
      "References the related enterprise record used by this record.",
  },
  issuerEnterpriseRef: {
    type: "object",
    required: false,
    description:
      "References the related issuer enterprise record used by this record.",
  },
  vendorEnterpriseRef: {
    type: "object",
    required: false,
    description:
      "References the related vendor enterprise record used by this record.",
  },
};

const enterpriseAssociationRefSchema = {
  enterpriseRef: {
    enabled: true,
    moduleName: "profile",
    schemaName: "enterprise",
    type: "one",
    propertyName: "code",
  },
  issuerEnterpriseRef: {
    enabled: true,
    moduleName: "profile",
    schemaName: "enterprise",
    type: "one",
    propertyName: "code",
  },
  vendorEnterpriseRef: {
    enabled: true,
    moduleName: "profile",
    schemaName: "enterprise",
    type: "one",
    propertyName: "code",
  },
};

function withEnterpriseAssociation(definition) {
  return Object.assign({}, enterpriseAssociationDefinitions, definition);
}

module.exports = {
  promotion: {
    promotion: Object.assign(
      {
        super: "base",
        model: true,
        schemaPolicies: ["tenantOwned"],
        service: { enabled: true },
        router: { enabled: false },
        cache: { enabled: false },
        event: { enabled: false },
        search: { enabled: false },
      },
      {
        definition: withEnterpriseAssociation({
          code: {
            type: "string",
            required: true,
            description:
              "Uniquely identifies this record for references, APIs, imports, and business administration.",
          },
          tenant: {
            type: "string",
            required: true,
            description:
              "Identifies the runtime tenant partition that scopes this record.",
          },
          name: {
            type: "string",
            required: true,
            description:
              "Stores the business display name shown to administrators and related user journeys.",
          },
          status: {
            type: "string",
            required: true,
            enum: [
              "DRAFT",
              "SUBMITTED",
              "APPROVED",
              "SCHEDULED",
              "ACTIVE",
              "SUSPENDED",
              "ARCHIVED",
            ],
            description:
              "Tracks the lifecycle state that controls whether this record can be used in business processes.",
          },
          priority: {
            type: "int",
            required: true,
            description:
              "Stores the priority used to order or resolve this record against competing records.",
          },
          conditions: {
            type: "object",
            required: true,
            description:
              "Stores the structured conditions that determine when this record applies.",
          },
          actions: {
            type: "object",
            required: true,
            description:
              "Stores the structured actions this record can apply during business processing.",
          },
          budget: {
            type: "object",
            required: false,
            description:
              "Stores the budget controls used to govern financial exposure for this record.",
          },
          approval: {
            type: "object",
            required: false,
            description:
              "Stores approval evidence and review state for this record.",
          },
          analytics: {
            type: "object",
            required: false,
            description:
              "Stores analytics attributes used for reporting and performance review.",
          },
          validFrom: {
            type: "date",
            required: false,
            description: "Defines the starting valid boundary for this record.",
          },
          validTo: {
            type: "date",
            required: false,
            description: "Defines the ending valid boundary for this record.",
          },
          revision: {
            type: "int",
            required: true,
            description:
              "Tracks the business revision used for governance, review, and optimistic update checks.",
          },
        }),
        refSchema: enterpriseAssociationRefSchema,
      },
    ),
    couponBatch: Object.assign(
      {
        super: "base",
        model: true,
        schemaPolicies: ["tenantOwned"],
        service: { enabled: true },
        router: { enabled: false },
        cache: { enabled: false },
        event: { enabled: false },
        search: { enabled: false },
      },
      {
        definition: withEnterpriseAssociation({
          code: {
            type: "string",
            required: true,
            description:
              "Uniquely identifies this record for references, APIs, imports, and business administration.",
          },
          tenant: {
            type: "string",
            required: true,
            description:
              "Identifies the runtime tenant partition that scopes this record.",
          },
          promotionCode: {
            type: "string",
            required: true,
            description:
              "Stores the promotion code used to classify, link, or resolve this record.",
          },
          status: {
            type: "string",
            required: true,
            enum: [
              "DRAFT",
              "GENERATED",
              "RESERVED",
              "ACTIVE",
              "RELEASED",
              "EXPIRED",
            ],
            description:
              "Tracks the lifecycle state that controls whether this record can be used in business processes.",
          },
          issuedCount: {
            type: "int",
            required: true,
            description:
              "Stores the issued count used for validation, calculation, or operational decisions.",
          },
          reservedCount: {
            type: "int",
            required: true,
            description:
              "Stores the reserved count used for validation, calculation, or operational decisions.",
          },
          tokenHashPolicy: {
            type: "string",
            required: true,
            description:
              "Defines the token hash policy that controls how this record is handled.",
          },
          sourceReference: {
            type: "string",
            required: false,
            description:
              "Stores the external or upstream source reference for this record.",
          },
          revision: {
            type: "int",
            required: true,
            description:
              "Tracks the business revision used for governance, review, and optimistic update checks.",
          },
        }),
        refSchema: enterpriseAssociationRefSchema,
      },
    ),
    coupon: Object.assign(
      {
        super: "base",
        model: true,
        schemaPolicies: ["tenantOwned"],
        service: { enabled: true },
        router: { enabled: false },
        cache: { enabled: false },
        event: { enabled: false },
        search: { enabled: false },
      },
      {
        definition: withEnterpriseAssociation({
          code: {
            type: "string",
            required: true,
            description:
              "Uniquely identifies this record for references, APIs, imports, and business administration.",
          },
          tenant: {
            type: "string",
            required: true,
            description:
              "Identifies the runtime tenant partition that scopes this record.",
          },
          promotionCode: {
            type: "string",
            required: true,
            description:
              "Stores the promotion code used to classify, link, or resolve this record.",
          },
          batchCode: {
            type: "string",
            required: false,
            description:
              "Stores the batch code used to classify, link, or resolve this record.",
          },
          tokenHash: {
            type: "string",
            required: true,
            description:
              "Stores the protected hash used to validate the token without exposing its raw value.",
          },
          status: {
            type: "string",
            required: true,
            enum: [
              "ACTIVE",
              "AVAILABLE",
              "RESERVED",
              "SOLD",
              "DELIVERED",
              "CLAIMED",
              "REDEEMED",
              "CANCELLED",
              "REFUNDED",
              "SUSPENDED",
              "EXPIRED",
            ],
            description:
              "Tracks the lifecycle state that controls whether this record can be used in business processes.",
          },
          saleStatus: {
            type: "string",
            required: false,
            description: "Stores the sale status value used by this record.",
          },
          benefitStatus: {
            type: "string",
            required: false,
            description: "Stores the benefit status value used by this record.",
          },
          maxUses: {
            type: "int",
            required: true,
            description:
              "Stores the maximum number of times this record may be used.",
          },
          usedCount: {
            type: "int",
            required: true,
            description:
              "Stores the used count used for validation, calculation, or operational decisions.",
          },
          reservedFor: {
            type: "string",
            required: false,
            description: "Stores the reserved for value used by this record.",
          },
          soldTo: {
            type: "string",
            required: false,
            description:
              "Identifies the customer or principal this record was sold to.",
          },
          orderCode: {
            type: "string",
            required: false,
            description:
              "Stores the order code used to classify, link, or resolve this record.",
          },
          cartCode: {
            type: "string",
            required: false,
            description:
              "Stores the cart code used to classify, link, or resolve this record.",
          },
          entryCode: {
            type: "string",
            required: false,
            description:
              "Stores the entry code used to classify, link, or resolve this record.",
          },
          productCode: {
            type: "string",
            required: false,
            description:
              "Stores the product code used to classify, link, or resolve this record.",
          },
          sku: {
            type: "string",
            required: false,
            description:
              "Stores the SKU used to identify the purchasable product or variant.",
          },
          idempotencyKey: {
            type: "string",
            required: false,
            description:
              "Stores the idempotency key used to prevent duplicate processing of the same business request.",
          },
          reservedAt: {
            type: "date",
            required: false,
            description: "Records when the reserved event or value applies.",
          },
          reservedUntil: {
            type: "date",
            required: false,
            description: "Stores the reserved until value used by this record.",
          },
          soldAt: {
            type: "date",
            required: false,
            description: "Records when the sold event or value applies.",
          },
          deliveredAt: {
            type: "date",
            required: false,
            description: "Records when the delivered event or value applies.",
          },
          claimedAt: {
            type: "date",
            required: false,
            description: "Records when the claimed event or value applies.",
          },
          redeemedAt: {
            type: "date",
            required: false,
            description: "Records when the redeemed event or value applies.",
          },
          revokedAt: {
            type: "date",
            required: false,
            description: "Records when the revoked event or value applies.",
          },
          revision: {
            type: "int",
            required: true,
            description:
              "Tracks the business revision used for governance, review, and optimistic update checks.",
          },
        }),
        refSchema: enterpriseAssociationRefSchema,
      },
    ),
    promotionBudgetLedger: Object.assign(
      {
        super: "base",
        model: true,
        schemaPolicies: ["operational"],
        service: { enabled: true },
        router: { enabled: false },
        cache: { enabled: false },
        event: { enabled: false },
        search: { enabled: false },
      },
      {
        definition: {
          code: {
            type: "string",
            required: true,
            description:
              "Uniquely identifies this record for references, APIs, imports, and business administration.",
          },
          tenant: {
            type: "string",
            required: true,
            description:
              "Identifies the runtime tenant partition that scopes this record.",
          },
          promotionCode: {
            type: "string",
            required: true,
            description:
              "Stores the promotion code used to classify, link, or resolve this record.",
          },
          mutationType: {
            type: "string",
            required: true,
            enum: ["COMMIT", "RELEASE", "RECONCILE"],
            description:
              "Classifies this record by mutation type for validation and business handling.",
          },
          amount: {
            type: "string",
            required: true,
            description: "Stores the amount value used by this record.",
          },
          beforeSpent: {
            type: "string",
            required: true,
            description: "Stores the before spent value used by this record.",
          },
          afterSpent: {
            type: "string",
            required: true,
            description: "Stores the after spent value used by this record.",
          },
          targetCode: {
            type: "string",
            required: false,
            description:
              "Stores the target code used to classify, link, or resolve this record.",
          },
          idempotencyKey: {
            type: "string",
            required: true,
            description:
              "Stores the idempotency key value used by this record.",
          },
          actorId: {
            type: "string",
            required: false,
            description:
              "Stores the actor identifier used to correlate this record.",
          },
          correlationId: {
            type: "string",
            required: false,
            description:
              "Stores the correlation identifier used to correlate this record.",
          },
          occurredAt: {
            type: "date",
            required: true,
            description: "Records when the occurred event or value applies.",
          },
        },
      },
    ),
    promotionRedemption: Object.assign(
      {
        super: "base",
        model: true,
        schemaPolicies: ["operational"],
        service: { enabled: true },
        router: { enabled: false },
        cache: { enabled: false },
        event: { enabled: false },
        search: { enabled: false },
      },
      {
        definition: withEnterpriseAssociation({
          code: {
            type: "string",
            required: true,
            description:
              "Uniquely identifies this record for references, APIs, imports, and business administration.",
          },
          tenant: {
            type: "string",
            required: true,
            description:
              "Identifies the runtime tenant partition that scopes this record.",
          },
          promotionCode: {
            type: "string",
            required: true,
            description:
              "Stores the promotion code used to classify, link, or resolve this record.",
          },
          couponCode: {
            type: "string",
            required: false,
            description:
              "Stores the coupon code used to classify, link, or resolve this record.",
          },
          orderCode: {
            type: "string",
            required: false,
            description:
              "Stores the order code used to classify, link, or resolve this record.",
          },
          cartCode: {
            type: "string",
            required: false,
            description:
              "Stores the cart code used to classify, link, or resolve this record.",
          },
          ownerId: {
            type: "string",
            required: true,
            description:
              "Identifies the principal or business owner responsible for this record.",
          },
          targetType: {
            type: "string",
            required: true,
            enum: ["CART", "ENTRY", "DELIVERY", "ORDER"],
            description:
              "Classifies this record by target type for validation and business handling.",
          },
          targetCode: {
            type: "string",
            required: true,
            description:
              "Stores the target code used to classify, link, or resolve this record.",
          },
          discountAmount: {
            type: "string",
            required: true,
            description:
              "Stores the discount amount used for calculation, reporting, or settlement.",
          },
          currency: {
            type: "string",
            required: true,
            description:
              "Stores the currency code used for monetary amounts on this record.",
          },
          status: {
            type: "string",
            required: true,
            enum: ["APPLIED", "REVERSED", "RECONCILIATION_REQUIRED"],
            description:
              "Tracks the lifecycle state that controls whether this record can be used in business processes.",
          },
          decisionCode: {
            type: "string",
            required: false,
            description:
              "Stores the decision code used to classify, link, or resolve this record.",
          },
          idempotencyKey: {
            type: "string",
            required: true,
            description:
              "Stores the idempotency key used to prevent duplicate processing of the same business request.",
          },
          reversalReasonCode: {
            type: "string",
            required: false,
            description:
              "Stores the reversal reason code used to classify, link, or resolve this record.",
          },
          correlationId: {
            type: "string",
            required: true,
            description:
              "Stores the correlation identifier used to trace related requests, jobs, and events.",
          },
          revision: {
            type: "int",
            required: true,
            description:
              "Tracks the business revision used for governance, review, and optimistic update checks.",
          },
          appliedAt: {
            type: "date",
            required: true,
            description: "Records when the applied event or value applies.",
          },
          reversedAt: {
            type: "date",
            required: false,
            description: "Records when the reversed event or value applies.",
          },
        }),
        refSchema: enterpriseAssociationRefSchema,
      },
    ),
    discountDecision: Object.assign(
      {
        super: "base",
        model: true,
        schemaPolicies: ["operational"],
        service: { enabled: true },
        router: { enabled: false },
        cache: { enabled: false },
        event: { enabled: false },
        search: { enabled: false },
      },
      {
        definition: {
          code: {
            type: "string",
            required: true,
            description:
              "Uniquely identifies this record for references, APIs, imports, and business administration.",
          },
          tenant: {
            type: "string",
            required: true,
            description:
              "Identifies the runtime tenant partition that scopes this record.",
          },
          promotionCode: {
            type: "string",
            required: true,
            description:
              "Stores the promotion code used to classify, link, or resolve this record.",
          },
          targetType: {
            type: "string",
            required: true,
            enum: ["CART", "ENTRY", "DELIVERY"],
            description:
              "Classifies this record by target type for validation and business handling.",
          },
          targetCode: {
            type: "string",
            required: true,
            description:
              "Stores the target code used to classify, link, or resolve this record.",
          },
          discountAmount: {
            type: "string",
            required: true,
            description:
              "Stores the discount amount used for calculation, reporting, or settlement.",
          },
          currency: {
            type: "string",
            required: true,
            description:
              "Stores the currency code used for monetary amounts on this record.",
          },
          reasonCode: {
            type: "string",
            required: true,
            description:
              "Stores the reason code used to classify, link, or resolve this record.",
          },
          ruleVersion: {
            type: "string",
            required: true,
            description: "Stores the rule version value used by this record.",
          },
          sourceHash: {
            type: "string",
            required: true,
            description:
              "Stores a fingerprint of the source data used to detect changes or duplicates.",
          },
          correlationId: {
            type: "string",
            required: true,
            description:
              "Stores the correlation identifier used to correlate this record.",
          },
          decidedAt: {
            type: "date",
            required: true,
            description: "Records when the decided event or value applies.",
          },
        },
      },
    ),
  },
};
module.exports.promotion.promotion.backoffice = {
  operations: ["search", "read", "create", "update"],
  description: "Promotion rule master data.",
};

/** Locks purchased coupon benefits to their reviewed fulfillment target. */
module.exports.promotion.coupon.definition.claimTargetCode = {
  type: "string",
  required: false,
  description:
    "Immutable fulfillment binding recorded when the purchased coupon benefit is claimed or redeemed.",
};
module.exports.promotion.coupon.definition.claimTargetType = {
  type: "string",
  required: false,
  description:
    "Immutable fulfillment binding recorded when the purchased coupon benefit is claimed or redeemed.",
};
module.exports.promotion.coupon.definition.redeemedTargetCode = {
  type: "string",
  required: false,
  description:
    "Immutable fulfillment binding recorded when the purchased coupon benefit is claimed or redeemed.",
};
module.exports.promotion.coupon.definition.redeemedTargetType = {
  type: "string",
  required: false,
  description:
    "Immutable fulfillment binding recorded when the purchased coupon benefit is claimed or redeemed.",
};

module.exports.promotion.coupon.definition.refundReference = {
  type: "string",
  required: false,
  description:
    "Identifies the approved Order refund that exclusively revoked this purchased coupon.",
};

module.exports.promotion.coupon.definition.status.enum.push(
  "REFUND_PENDING",
  "REVOKED",
);
