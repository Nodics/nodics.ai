/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module cart/src/schemas/schemas @description Defines Cart intent, entries, immutable calculation evidence, and diagnostics. @layer schema @owner cart */
const evidence = {
    code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'}, tenant: { type: 'string', required: true , description: 'Identifies the runtime tenant partition that scopes this record.'}, enterpriseCode: { type: 'string', required: false , description: 'Stores the enterprise code used for business ownership, visibility, or settlement decisions.'},
    ownerId: { type: 'string', required: true , description: 'Identifies the principal or business owner responsible for this record.'}, cartCode: { type: 'string', required: true , description: 'Stores the cart code used to classify, link, or resolve this record.'},
    revision: { type: 'int', required: true , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'}, correlationId: { type: 'string', required: true , description: 'Stores the correlation identifier used to trace related requests, jobs, and events.'}
};
module.exports = { cart: {
    cart: Object.assign({ super: 'base', model: true, schemaPolicies: ['customerOwned'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'}, tenant: { type: 'string', required: true , description: 'Identifies the runtime tenant partition that scopes this record.'}, enterpriseCode: { type: 'string', required: false , description: 'Stores the enterprise code used to classify, link, or resolve this record.'},
        ownerId: { type: 'string', required: true , description: 'Identifies the principal or business owner responsible for this record.'}, storeCode: { type: 'string', required: true , description: 'Stores the store code used to classify, link, or resolve this record.'},
        channelCode: { type: 'string', required: true , description: 'Stores the channel code used to classify, link, or resolve this record.'}, locale: { type: 'string', required: true , description: 'Stores the locale code used for language, formatting, and regional behavior.'},
        jurisdiction: { type: 'string', required: true , description: 'Stores the jurisdiction value used by this record.'}, currency: { type: 'string', required: true , description: 'Stores the currency code used for monetary amounts on this record.'},
        status: { type: 'string', required: true, enum: ['ACTIVE', 'CALCULATED', 'PLACEMENT_PENDING', 'PLACED', 'EXPIRED', 'ABANDONED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
        revision: { type: 'int', required: true , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'}, calculationCode: { type: 'string', required: false , description: 'Stores the calculation code used to classify, link, or resolve this record.'},
        totalAmount: { type: 'string', required: false , description: 'Stores the total amount used for calculation, reporting, or settlement.'}, correlationId: { type: 'string', required: true , description: 'Stores the correlation identifier used to correlate this record.'}
    } }),
    cartEntry: Object.assign({ super: 'base', model: true, schemaPolicies: ['customerOwned'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: Object.assign({}, evidence, {
        productCode: { type: 'string', required: true , description: 'Stores the product code used to classify, link, or resolve this record.'}, variantCode: { type: 'string', required: false , description: 'Stores the variant code used to classify, link, or resolve this record.'}, sku: { type: 'string', required: true , description: 'Stores the SKU used to identify the purchasable product or variant.'},
        quantity: { type: 'string', required: true , description: 'Stores the quantity value used by this record.'}, status: { type: 'string', required: true, enum: ['ACTIVE', 'REMOVED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'}
    }) }),
    cartCalculation: Object.assign({ super: 'base', model: true, schemaPolicies: ['customerOwned'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: Object.assign({}, evidence, {
        cartRevision: { type: 'int', required: true , description: 'Stores the cart revision value used by this record.'}, currency: { type: 'string', required: true , description: 'Stores the currency code used for monetary amounts on this record.'},
        subtotal: { type: 'string', required: true , description: 'Stores the subtotal value used by this record.'}, discountAmount: { type: 'string', required: true , description: 'Stores the discount amount used for calculation, reporting, or settlement.'},
        taxAmount: { type: 'string', required: true , description: 'Stores the tax amount used for calculation, reporting, or settlement.'}, totalAmount: { type: 'string', required: true , description: 'Stores the total amount used for calculation, reporting, or settlement.'},
        decisions: { type: 'object', required: true , description: 'Stores structured decision evidence produced while evaluating this record.'}, sourceHash: { type: 'string', required: true , description: 'Stores a fingerprint of the source data used to detect changes or duplicates.'},
        status: { type: 'string', required: true, enum: ['CURRENT', 'STALE', 'FAILED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
        calculatedAt: { type: 'date', required: true , description: 'Records when the calculated event or value applies.'}
    }) }),
    cartDiagnostic: Object.assign({ super: 'base', model: true, schemaPolicies: ['customerOwned'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: Object.assign({}, evidence, {
        stage: { type: 'string', required: true , description: 'Identifies the processing stage represented by this record.'}, status: { type: 'string', required: true, enum: ['FAILED', 'RECOVERED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
        errorCode: { type: 'string', required: true , description: 'Stores the error code used to classify, link, or resolve this record.'}, dependency: { type: 'string', required: false , description: 'Identifies the dependency involved in this record or diagnostic.'},
        retryable: { type: 'bool', required: true , description: 'Indicates whether the failed operation can be retried safely.'}, occurredAt: { type: 'date', required: true , description: 'Records when the occurred event or value applies.'}
    }) })
} };
module.exports.cart.cart.backoffice = { operations: ['search', 'read'], description: 'Customer cart evidence; mutations require Cart-owned operations.' };

/** Only a server-issued quote reference is accepted from the cart client; Pricing resolves every binding. */
module.exports.cart.cartEntry.definition.priceQuoteCode = {type:"string",required:false,description:"Pricing-owned private quote reference bound to this buyer, product, quantity, cart and order."};
