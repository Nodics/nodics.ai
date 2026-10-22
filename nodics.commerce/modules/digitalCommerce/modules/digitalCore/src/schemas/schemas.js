/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module digitalCore/src/schemas/schemas @description Defines Digital Commerce binding, entitlement, delivery, and reversal evidence. @layer schema @owner digitalCore */
const common = {
    code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'},
    tenant: { type: 'string', required: true , description: 'Identifies the runtime tenant partition that scopes this record.'},
    enterpriseCode: { type: 'string', required: false , description: 'Stores the enterprise code used for business ownership, visibility, or settlement decisions.'},
    ownerId: { type: 'string', required: false , description: 'Identifies the principal or business owner responsible for this record.'},
    status: { type: 'string', required: true , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
    revision: { type: 'int', required: true , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'},
    idempotencyKey: { type: 'string', required: false , description: 'Stores the idempotency key used to prevent duplicate processing of the same business request.'},
    correlationId: { type: 'string', required: true , description: 'Stores the correlation identifier used to trace related requests, jobs, and events.'},
    evidence: { type: 'object', required: false , description: 'Stores structured evidence that explains how this record or decision was produced.'}
};

module.exports = { digitalCore: {
    digitalBundleListingContext: { super: 'base', model: true, schemaPolicies: ['listingContext'], service: { enabled: true },
        router: { groups: { schemaOperations: true }, enabled: true }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false },
        backoffice: { operations: ['search', 'read', 'create', 'update'], concurrency: { managed: true, field: 'revision' } },
        definition: {
            code: { type: 'string', required: true, description: 'Governed bundle listing selection identity, not a Product or price authority.' },
            tenant: { type: 'string', required: true, description: 'Tenant partition.' },
            enterpriseCode: { type: 'string', required: true, description: 'Participant namespace permitted to discover this binding; not the Store merchant namespace.' },
            name: { type: 'string', required: true, description: 'Business-selected label for this exact listing combination.' },
            status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'INACTIVE'], description: 'Explicit governance state; only active records are projected.' },
            revision: { type: 'int', required: true, description: 'Managed optimistic concurrency counter.' },
            storeCode: { type: 'string', required: true, description: 'Canonical Store selection; placement is independently re-read from Product.' },
            categoryCodes: { type: 'array', required: true, description: 'Explicit Product category references, including an intentional empty selection.' },
            currency: { type: 'string', required: true, description: 'Explicit Pricing currency reference.' },
            priceBookCode: { type: 'string', required: true, description: 'Canonical Pricing book reference; never an inline price.' },
            reward: { type: 'object', required: true, description: 'Explicit Loyalty programCode and rewardTypeCode only; precision is derived from exact Loyalty owner evidence.' }
        }
    },
    digitalBundleManifest: { super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false }, definition: { ...common,
        ownerRef: { type: 'object', required: true, description: 'Canonical Profile owner; separate from acting principal.' },
        components: { type: 'array', required: true, description: 'Immutable ordered certificate and realized-carbon component selections.' },
        digest: { type: 'string', required: true, description: 'Exact manifest content fingerprint.' },
        composition: { type: 'object', required: false, description: 'Immutable reviewed follow-on gift/listing instruction; no credentials or client authority.' },
        compositionDigest: { type: 'string', required: false, description: 'Fingerprint of the original reviewed follow-on instruction.' }
    } },
    digitalBundleOperation: { super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false }, definition: { ...common,
        manifestCode: { type: 'string', required: true, description: 'Retained nonempty bundle manifest.' },
        manifestRevision: { type: 'int', required: true, description: 'Original immutable contents revision.' },
        ownerRef: { type: 'object', required: true, description: 'Original canonical owner.' },
        recipientRef: { type: 'object', required: false, description: 'Selected existing recipient or purchasing owner.' },
        purpose: { type: 'string', required: true, description: 'Listing, quantity-one purchase obligation, or pending-acceptance gift purpose.' },
        deadline: { type: 'date', required: false, description: 'Retained framework-derived gift deadline.' },
        checkpoints: { type: 'object', required: true, description: 'Confirmed owner receipts per component and phase.' },
        commandDigest: { type: 'string', required: true, description: 'Immutable original command fingerprint.' }
    } },
    digitalBundleOwnerPolicy: { super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false }, definition: { ...common,
        ownerRef: { type: 'object', required: true, description: 'Canonical Enterprise selecting gift and receipt policy.' },
        giftingEnabled: { type: 'boolean', required: true, description: 'Admission of new outgoing gifts only.' },
        receivingEnabled: { type: 'boolean', required: true, description: 'Admission of new incoming gifts only.' },
        couponPurchasingEnabled: { type: 'boolean', required: true, description: 'Admission of new coupon starts only; never redemption or original recovery.' }
    } },
    digitalProductBinding: Object.assign({ super: 'base', model: true, schemaPolicies: ['tenantOwned'], service: { enabled: true }, router: { groups: { schemaOperations: true }, enabled: true }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: Object.assign({}, common, {
        productCode: { type: 'string', required: true , description: 'Stores the product code used to classify, link, or resolve this record.'},
        variantCode: { type: 'string', required: false , description: 'Stores the variant code used to classify, link, or resolve this record.'},
        sku: { type: 'string', required: false , description: 'Stores the SKU used to identify the purchasable product or variant.'},
        digitalDeliveryType: { type: 'string', required: true , description: 'Classifies this record by digital delivery type for validation and business handling.'},
        inventoryStrategy: { type: 'string', required: true , description: 'Stores the inventory strategy value used by this record.'},
        providerOwner: { type: 'string', required: true , description: 'Identifies the provider owner responsible for fulfilling or managing this record.'},
        providerReference: { type: 'object', required: true , description: 'Stores provider-specific reference data needed to resolve this record.'}
    }) }),
    digitalEntitlement: Object.assign({ super: 'base', model: true, schemaPolicies: ['customerOwned'], service: { enabled: true }, router: { groups: { schemaOperations: true }, enabled: true }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: Object.assign({}, common, {
        participantEnterpriseCode: { type: 'string', required: false, description: 'Original purchasing participant Enterprise; distinct from merchant storage partition.' },
        ownerRef: { type: 'object', required: false, description: 'Typed CUSTOMER or ENTERPRISE purchasing owner retained for version-2 coupon rights.' },
        orderCode: { type: 'string', required: true , description: 'Stores the order code used to classify, link, or resolve this record.'},
        orderEntryCode: { type: 'string', required: false , description: 'Stores the order entry code used to classify, link, or resolve this record.'},
        cartCode: { type: 'string', required: false , description: 'Stores the cart code used to classify, link, or resolve this record.'},
        productCode: { type: 'string', required: true , description: 'Stores the product code used to classify, link, or resolve this record.'},
        sku: { type: 'string', required: false , description: 'Stores the SKU used to identify the purchasable product or variant.'},
        digitalDeliveryType: { type: 'string', required: true , description: 'Classifies this record by digital delivery type for validation and business handling.'},
        providerOwner: { type: 'string', required: true , description: 'Identifies the provider owner responsible for fulfilling or managing this record.'},
        providerCode: { type: 'string', required: true , description: 'Stores the provider code used to classify, link, or resolve this record.'},
        claimStatus: { type: 'string', required: false , description: 'Tracks whether and how this record has been claimed by the entitled party.'},
        revealPolicy: { type: 'object', required: false , description: 'Defines the reveal policy that controls how this record is handled.'},
        purchasedAt: { type: 'date', required: false , description: 'Records when the purchased event or value applies.'},
        validTo: { type: 'date', required: false, description: 'Retained purchase-derived coupon expiration, independent of catalogue launch dates.' },
        purchasePolicy: { type: 'object', required: false, description: 'Retained Promotion-owned purchase rights evidence; credentials and coupon tokens are excluded.' },
        deliveredAt: { type: 'date', required: false , description: 'Records when the delivered event or value applies.'},
        revokedAt: { type: 'date', required: false , description: 'Records when the revoked event or value applies.'}
    }) }),
    digitalDelivery: Object.assign({ super: 'base', model: true, schemaPolicies: ['customerOwned'], service: { enabled: true }, router: { groups: { schemaOperations: true }, enabled: true }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: Object.assign({}, common, {
        entitlementCode: { type: 'string', required: true , description: 'Stores the entitlement code used to classify, link, or resolve this record.'},
        orderCode: { type: 'string', required: true , description: 'Stores the order code used to classify, link, or resolve this record.'},
        deliveryType: { type: 'string', required: true , description: 'Classifies this record by delivery type for validation and business handling.'},
        providerOwner: { type: 'string', required: true , description: 'Identifies the provider owner responsible for fulfilling or managing this record.'},
        providerCode: { type: 'string', required: true , description: 'Stores the provider code used to classify, link, or resolve this record.'},
        deliveredAt: { type: 'date', required: false , description: 'Records when the delivered event or value applies.'},
        revealCount: { type: 'int', required: false , description: 'Counts how many times the protected digital value has been revealed.'},
        lastRevealedAt: { type: 'date', required: false , description: 'Records when the last revealed event or value applies.'}
    }) }),
    digitalReversal: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { groups: { schemaOperations: true }, enabled: true }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: Object.assign({}, common, {
        entitlementCode: { type: 'string', required: true , description: 'Stores the entitlement code used to classify, link, or resolve this record.'},
        orderCode: { type: 'string', required: true , description: 'Stores the order code used to classify, link, or resolve this record.'},
        requestType: { type: 'string', required: true , description: 'Classifies this record by request type for validation and business handling.'},
        policyDecision: { type: 'string', required: true , description: 'Stores the policy decision value used by this record.'},
        reasonCode: { type: 'string', required: false , description: 'Stores the reason code used to classify, link, or resolve this record.'},
        decidedAt: { type: 'date', required: true , description: 'Records when the decided event or value applies.'}
    }) })
} };

module.exports.digitalCore.digitalEntitlement.backoffice = { operations: ['search', 'read'], description: 'Customer-owned digital product entitlement.' };
for (const name of ['digitalBundleManifest', 'digitalBundleOperation']) {
    module.exports.digitalCore[name].backoffice = { mutationMode: 'READ_ONLY', concurrency: { managed: true, field: 'revision' } };
}
module.exports.digitalCore.digitalDelivery.backoffice = { operations: ['search', 'read'], description: 'Digital delivery evidence.' };

module.exports.digitalCore.digitalParticipationCommand = { super: 'base', model: true, schemaPolicies: ['operational'],
    service: { enabled: true }, router: { enabled: false }, definition: { ...common,
        commandDigest: { type: 'string', required: true, description: 'Immutable original settings or new-start command fingerprint.' }
    } };
for (const name of ['digitalBundleOwnerPolicy', 'digitalParticipationCommand']) {
    Object.assign(module.exports.digitalCore[name], {
        transaction: { enabled: true, sideEffects: 'none' },
        cache: { enabled: false }, event: { enabled: false }, search: { enabled: false },
        readProtection: { owner: 'DefaultDigitalParticipationService' },
        indexes: { individual: { participationIdentity: { name: 'code', enabled: true, options: { unique: true } } } },
        backoffice: { operations: [], mutationMode: 'READ_ONLY' },
    });
}
