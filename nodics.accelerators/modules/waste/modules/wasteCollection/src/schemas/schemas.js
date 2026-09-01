/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteCollection/src/schemas/schemas @description Defines reusable Waste collection-point and acceptance-rule schemas. @layer schema @owner wasteCollection @override Partner modules may extend collection rules and source references without moving location ownership into Waste. */
module.exports = { wasteCollection: {
    wasteCollectionPoint: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true },
        name: { type: 'object', required: true },
        collectionPointType: { type: 'string', required: true, enum: ['RECYCLING_BIN', 'RECYCLING_DROP_OFF', 'REPAIR_WORKSHOP', 'TRADE_IN_STORE', 'COLLECTION_WAREHOUSE', 'PROCESSING_FACILITY', 'MOBILE_COLLECTION_EVENT'] },
        locationRef: { type: 'object', required: false },
        operatorEnterpriseRef: { type: 'object', required: false },
        hostPlaceRef: { type: 'object', required: false },
        acceptanceSummary: { type: 'object', required: false },
        receiptPolicyCode: { type: 'string', required: false },
        verificationPolicyCode: { type: 'string', required: false },
        capacityProfile: { type: 'object', required: false },
        operatingStatus: { type: 'string', required: true, enum: ['ACTIVE', 'TEMPORARILY_CLOSED', 'FULL', 'MAINTENANCE', 'INACTIVE'] },
        publicVisibility: { type: 'string', required: true, enum: ['PRIVATE', 'BACKOFFICE', 'AUTHENTICATED', 'PUBLIC'] },
        serviceCapabilities: { type: 'array', required: false },
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'DEPRECATED', 'ARCHIVED'] },
        revision: { type: 'int', required: true, default: 0 },
        metadata: { type: 'object', required: false }
    } }),
    wasteCollectionAcceptanceRule: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true },
        collectionPointCode: { type: 'string', required: false },
        collectionPointType: { type: 'string', required: false },
        ownerProgramCode: { type: 'string', required: false },
        familyCode: { type: 'string', required: false },
        categoryCode: { type: 'string', required: false },
        itemTypeCode: { type: 'string', required: false },
        materialTypeCode: { type: 'string', required: false },
        conditionGrades: { type: 'array', required: false },
        minQuantity: { type: 'int', required: false },
        maxQuantity: { type: 'int', required: false },
        minWeight: { type: 'string', required: false },
        maxWeight: { type: 'string', required: false },
        requiresPreApproval: { type: 'bool', required: true, default: false },
        requiresReceipt: { type: 'bool', required: true, default: false },
        decision: { type: 'string', required: true, enum: ['ACCEPT', 'REJECT'] },
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'DEPRECATED', 'ARCHIVED'] },
        effectiveFrom: { type: 'date', required: false },
        effectiveTo: { type: 'date', required: false },
        revision: { type: 'int', required: true, default: 0 },
        metadata: { type: 'object', required: false }
    } })
} };
