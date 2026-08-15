/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module customerList/src/schemas/schemas @description Defines customer-owned wishlist and compare list records. @layer schema @owner customerList */
module.exports = { customerList: {
    customerList: Object.assign({ super: 'base', model: true, schemaPolicies: ['customerOwned'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: { code: { type: 'string', required: true }, tenant: { type: 'string', required: true }, ownerId: { type: 'string', required: true }, listType: { type: 'string', required: true, enum: ['WISHLIST', 'COMPARE'] }, storeCode: { type: 'string', required: true }, locale: { type: 'string', required: true }, status: { type: 'string', required: true, enum: ['ACTIVE', 'ARCHIVED'] }, revision: { type: 'int', required: true } } }),
    customerListEntry: Object.assign({ super: 'base', model: true, schemaPolicies: ['customerOwned'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: { code: { type: 'string', required: true }, tenant: { type: 'string', required: true }, ownerId: { type: 'string', required: true }, listCode: { type: 'string', required: true }, listType: { type: 'string', required: true, enum: ['WISHLIST', 'COMPARE'] }, productCode: { type: 'string', required: true }, variantCode: { type: 'string', required: false }, status: { type: 'string', required: true, enum: ['ACTIVE', 'REMOVED'] }, revision: { type: 'int', required: true } } })
} };
