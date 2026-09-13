/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module pricing/src/schemas/schemas @description Defines governed Phase 2 pricing persistence and decision evidence. @layer schema @owner pricing */
module.exports = {
  pricing: {
    priceBook: Object.assign(
      {
        super: "base",
        model: true,
        schemaPolicies: ["tenantOwned"],
        service: { enabled: true },
        router: { groups: { schemaOperations: true }, enabled: true },
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
          enterpriseCode: {
            type: "string",
            required: false,
            description:
              "Stores the enterprise code used to classify, link, or resolve this record.",
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
            enum: ["DRAFT", "ACTIVE", "ARCHIVED"],
            description:
              "Tracks the lifecycle state that controls whether this record can be used in business processes.",
          },
          validFrom: {
            type: "date",
            required: false,
            description: "Records when the valid from event or value applies.",
          },
          validTo: {
            type: "date",
            required: false,
            description: "Records when the valid to event or value applies.",
          },
          revision: {
            type: "int",
            required: true,
            description:
              "Tracks the business revision used for governance, review, and optimistic update checks.",
          },
        },
      },
    ),
    priceRow: Object.assign(
      {
        super: "base",
        model: true,
        schemaPolicies: ["tenantOwned"],
        service: { enabled: true },
        router: { groups: { schemaOperations: true }, enabled: true },
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
          enterpriseCode: {
            type: "string",
            required: false,
            description:
              "Stores the enterprise code used to classify, link, or resolve this record.",
          },
          priceBookCode: {
            type: "string",
            required: true,
            description:
              "Stores the price book code used to classify, link, or resolve this record.",
          },
          productCode: {
            type: "string",
            required: true,
            description:
              "Stores the product code used to classify, link, or resolve this record.",
          },
          unitAmount: {
            type: "string",
            required: true,
            description:
              "Stores the unit amount used for calculation, reporting, or settlement.",
          },
          currency: {
            type: "string",
            required: true,
            description:
              "Stores the currency code used for monetary amounts on this record.",
          },
          minQuantity: {
            type: "string",
            required: true,
            description:
              "Stores the min quantity used for validation, calculation, or operational decisions.",
          },
          validFrom: {
            type: "date",
            required: false,
            description: "Records when the valid from event or value applies.",
          },
          validTo: {
            type: "date",
            required: false,
            description: "Records when the valid to event or value applies.",
          },
          revision: {
            type: "int",
            required: true,
            description:
              "Tracks the business revision used for governance, review, and optimistic update checks.",
          },
        },
      },
    ),
    priceDecision: Object.assign(
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
          enterpriseCode: {
            type: "string",
            required: false,
            description:
              "Stores the enterprise code used to classify, link, or resolve this record.",
          },
          productCode: {
            type: "string",
            required: true,
            description:
              "Stores the product code used to classify, link, or resolve this record.",
          },
          storeCode: {
            type: "string",
            required: true,
            description:
              "Stores the store code used to classify, link, or resolve this record.",
          },
          quantity: {
            type: "string",
            required: true,
            description: "Stores the quantity value used by this record.",
          },
          unitAmount: {
            type: "string",
            required: true,
            description:
              "Stores the unit amount used for calculation, reporting, or settlement.",
          },
          totalAmount: {
            type: "string",
            required: true,
            description:
              "Stores the total amount used for calculation, reporting, or settlement.",
          },
          currency: {
            type: "string",
            required: true,
            description:
              "Stores the currency code used for monetary amounts on this record.",
          },
          priceRowCode: {
            type: "string",
            required: true,
            description:
              "Stores the price row code used to classify, link, or resolve this record.",
          },
          calculationVersion: {
            type: "string",
            required: true,
            description:
              "Stores the calculation version value used by this record.",
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
module.exports.pricing.priceRow.backoffice = {
  operations: ["search", "read", "create", "update"],
  description: "Governed product price row.",
  mutationPolicy: { lifecycle: "PUBLISHABLE", publishRequired: true },
};

/** Pricing owns private, order-bound negotiated prices. */
module.exports.pricing.priceQuote = {
  super: "base",
  model: true,
  schemaPolicies: ["operational"],
  service: {
    enabled: true,
  },
  router: { groups: { schemaOperations: true },
    enabled: true,
  },
  cache: {
    enabled: false,
  },
  event: {
    enabled: false,
  },
  search: {
    enabled: false,
  },
  indexes: {
    individual: {
      commandIdentity: {
        name: "code",
        enabled: true,
        options: {
          unique: true,
        },
      },
    },
  },
  definition: {
    code: {
      type: "string",
      required: true,
      description:
        "Stable command identity; globally unique and scoped by trusted enterprise and buyer.",
    },
    enterpriseCode: {
      type: "string",
      required: true,
      description: "Enterprise that owns the published offer and negotiation.",
    },
    productCode: {
      type: "string",
      required: true,
      description:
        "Published Product being negotiated; never a copied product record.",
    },
    storeCode: {
      type: "string",
      required: true,
      description: "Governed storefront in which the offer is valid.",
    },
    currency: {
      type: "string",
      required: true,
      description: "Currency of the exact offered amount.",
    },
    quantity: {
      type: "string",
      required: true,
      description: "Quantity covered by this accepted negotiation.",
    },
    revision: {
      type: "int",
      required: true,
      description:
        "Optimistic command revision reviewed by the acting participant.",
    },
    expiresAt: {
      type: "date",
      required: true,
      description:
        "Last instant at which the bid or its negotiated price may be accepted.",
    },
    cartCode: {
      type: "string",
      required: false,
      description: "Single customer cart permitted to use the quote.",
    },
    orderCode: {
      type: "string",
      required: false,
      description: "Single checkout order permitted to use the quote.",
    },
    correlationId: {
      type: "string",
      required: true,
      description:
        "Trace reference across Product, Pricing, Checkout and settlement.",
    },
    ownerId: {
      type: "string",
      required: true,
      description: "Customer allowed to use this private quote.",
    },
    unitAmount: {
      type: "string",
      required: true,
      description: "Exact negotiated single-unit amount selected by Pricing.",
    },
    sourceRef: {
      type: "object",
      required: true,
      description: "Auditable accepted negotiation that authorized this quote.",
    },
    commandHash: {
      type: "string",
      required: true,
      description:
        "Hash of immutable quote bindings to reject conflicting issuance.",
    },
    status: {
      type: "string",
      required: true,
      description: "ACTIVE or REVOKED; browser input cannot activate a quote.",
    },
  },
};

module.exports.pricing.priceQuote.definition.cartCode.required = true;
module.exports.pricing.priceQuote.definition.orderCode.required = true;

module.exports.pricing.priceQuote.definition.variantCode = {
  type: "string",
  required: false,
  description:
    "Agreed Product variant for new bidding quotes; omitted only by earlier quote contracts.",
};
