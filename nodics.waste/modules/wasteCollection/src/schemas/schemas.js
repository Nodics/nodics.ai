/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteCollection/src/schemas/schemas @description Defines reusable Waste collection-point and acceptance-rule schemas. @layer schema @owner wasteCollection @override Partner modules may extend collection rules and source references without moving location ownership into Waste. */
module.exports = { wasteCollection: {
    wasteCollectionPointType: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { groups: { schemaOperations: true }, enabled: true }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'},
        name: { type: 'object', required: true , description: 'Stores the business display name shown to administrators and related user journeys.'},
        description: { type: 'object', required: false , description: 'Explains the business purpose, usage, or administrative meaning of this record.'},
        baseLocationCategory: { type: 'string', required: false , description: 'Stores the base location category value used by this record.'},
        capabilities: { type: 'array', required: false , description: 'Lists the capabilities associated with this record.'},
        defaultReceiptPolicyCode: { type: 'string', required: false , description: 'Stores the default receipt policy code used to classify, link, or resolve this record.'},
        defaultVerificationPolicyCode: { type: 'string', required: false , description: 'Stores the default verification policy code used to classify, link, or resolve this record.'},
        locationTypeCode: { type: 'string', required: false , description: 'Stores the location type code used to classify, link, or resolve this record.'},
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'DEPRECATED', 'ARCHIVED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
        revision: { type: 'int', required: true, default: 0 , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'},
        metadata: { type: 'object', required: false , description: 'Stores additional structured metadata needed by extensions without changing the core schema contract.'}
    } }),
    wasteCollectionPoint: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { groups: { schemaOperations: true }, enabled: true }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'},
        name: { type: 'object', required: true , description: 'Stores the business display name shown to administrators and related user journeys.'},
        collectionPointType: { type: 'string', required: true , description: 'Classifies this record by collection point type for validation and business handling.'},
        locationRef: { type: 'object', required: true , description: 'References the related location record used by this record.'},
        operatorEnterpriseRef: { type: 'object', required: true , description: 'References the related operator enterprise record used by this record.'},
        assetOwnerEnterpriseRef: { type: 'object', required: false , description: 'References the related asset owner enterprise record used by this record.'},
        hostPlaceRef: { type: 'object', required: false , description: 'References the related host place record used by this record.'},
        acceptanceSummary: { type: 'object', required: false , description: 'Summarizes acceptance information for quick review and administration.'},
        receiptPolicyCode: { type: 'string', required: false , description: 'Stores the receipt policy code used to classify, link, or resolve this record.'},
        verificationPolicyCode: { type: 'string', required: false , description: 'Stores the verification policy code used to classify, link, or resolve this record.'},
        capacityProfile: { type: 'object', required: false , description: 'Stores the capacity profile that guides behavior for this record.'},
        operatingStatus: { type: 'string', required: true, enum: ['ACTIVE', 'TEMPORARILY_CLOSED', 'FULL', 'MAINTENANCE', 'INACTIVE'] , description: 'Selects the operating status value used to drive validation, filtering, and business behavior.'},
        publicVisibility: { type: 'string', required: true, enum: ['PRIVATE', 'BACKOFFICE', 'AUTHENTICATED', 'PUBLIC'] , description: 'Selects the public visibility value used to drive validation, filtering, and business behavior.'},
        serviceCapabilities: { type: 'array', required: false , description: 'Lists the service capabilities associated with this record.'},
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'DEPRECATED', 'ARCHIVED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
        revision: { type: 'int', required: true, default: 0 , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'},
        metadata: { type: 'object', required: false , description: 'Stores additional structured metadata needed by extensions without changing the core schema contract.'}
    }, refSchema: {
        locationRef: { enabled: true, moduleName: 'locationCore', schemaName: 'location', type: 'one', propertyName: 'code' },
        operatorEnterpriseRef: { enabled: true, moduleName: 'profile', schemaName: 'enterprise', type: 'one', propertyName: 'code' },
        assetOwnerEnterpriseRef: { enabled: true, moduleName: 'profile', schemaName: 'enterprise', type: 'one', propertyName: 'code' },
        hostPlaceRef: { enabled: true, moduleName: 'locationCore', schemaName: 'location', type: 'one', propertyName: 'code' }
    } }),
    wasteCollectionAcceptanceRule: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { groups: { schemaOperations: true }, enabled: true }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'},
        collectionPointCode: { type: 'string', required: false , description: 'Stores the collection point code used to classify, link, or resolve this record.'},
        collectionPointType: { type: 'string', required: false , description: 'Classifies this record by collection point type for validation and business handling.'},
        ownerProgramCode: { type: 'string', required: false , description: 'Stores the owner program code used to classify, link, or resolve this record.'},
        familyCode: { type: 'string', required: false , description: 'Stores the family code used to classify, link, or resolve this record.'},
        categoryCode: { type: 'string', required: false , description: 'Stores the category code used to classify, link, or resolve this record.'},
        itemTypeCode: { type: 'string', required: false , description: 'Stores the item type code used to classify, link, or resolve this record.'},
        materialTypeCode: { type: 'string', required: false , description: 'Stores the material type code used to classify, link, or resolve this record.'},
        conditionGrades: { type: 'array', required: false , description: 'Lists the condition grades associated with this record.'},
        minQuantity: { type: 'int', required: false , description: 'Stores the min quantity used for validation, calculation, or operational decisions.'},
        maxQuantity: { type: 'int', required: false , description: 'Stores the max quantity used for validation, calculation, or operational decisions.'},
        minWeight: { type: 'string', required: false , description: 'Stores the min weight used for validation, calculation, or operational decisions.'},
        maxWeight: { type: 'string', required: false , description: 'Stores the max weight used for validation, calculation, or operational decisions.'},
        requiresPreApproval: { type: 'bool', required: true, default: false , description: 'Indicates whether pre approval applies for this record.'},
        requiresReceipt: { type: 'bool', required: true, default: false , description: 'Indicates whether receipt applies for this record.'},
        decision: { type: 'string', required: true, enum: ['ACCEPT', 'REJECT'] , description: 'Selects the decision value used to drive validation, filtering, and business behavior.'},
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'DEPRECATED', 'ARCHIVED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
        effectiveFrom: { type: 'date', required: false , description: 'Defines when this record becomes effective for business use.'},
        effectiveTo: { type: 'date', required: false , description: 'Defines when this record stops being effective for business use.'},
        revision: { type: 'int', required: true, default: 0 , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'},
        metadata: { type: 'object', required: false , description: 'Stores additional structured metadata needed by extensions without changing the core schema contract.'}
    } }),
    wasteCollectionPreset: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { groups: { schemaOperations: true }, enabled: true }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'},
        name: { type: 'object', required: true , description: 'Stores the business display name shown to administrators and related user journeys.'},
        collectionPointType: { type: 'string', required: true , description: 'Classifies this record by collection point type for validation and business handling.'},
        receiptPolicyCode: { type: 'string', required: false , description: 'Stores the receipt policy code used to classify, link, or resolve this record.'},
        verificationPolicyCode: { type: 'string', required: false , description: 'Stores the verification policy code used to classify, link, or resolve this record.'},
        evidencePolicyCode: { type: 'string', required: false , description: 'Stores the evidence policy code used to classify, link, or resolve this record.'},
        impactProfileCode: { type: 'string', required: false , description: 'Stores the impact profile code used to classify, link, or resolve this record.'},
        acceptanceRuleCodes: { type: 'array', required: false , description: 'Lists acceptance rule codes used to classify, link, or resolve this record.'},
        serviceCapabilities: { type: 'array', required: false , description: 'Lists the service capabilities associated with this record.'},
        operatingMode: { type: 'string', required: true, enum: ['DROP_OFF', 'BIN', 'INSPECTION', 'AGGREGATION', 'PROCESSING', 'CUSTOM'] , description: 'Selects the operating mode value used to drive validation, filtering, and business behavior.'},
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'DEPRECATED', 'ARCHIVED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
        revision: { type: 'int', required: true, default: 0 , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'},
        metadata: { type: 'object', required: false , description: 'Stores additional structured metadata needed by extensions without changing the core schema contract.'}
    } }),
    wasteReceiptPolicy: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { groups: { schemaOperations: true }, enabled: true }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'},
        name: { type: 'object', required: true , description: 'Stores the business display name shown to administrators and related user journeys.'},
        receiptRequired: { type: 'bool', required: true, default: false , description: 'Indicates whether receipt is required for this record.'},
        measuredWeightRequired: { type: 'bool', required: true, default: false , description: 'Indicates whether measured weight is required for this record.'},
        measuredQuantityRequired: { type: 'bool', required: true, default: false , description: 'Indicates whether measured quantity is required for this record.'},
        requiredEvidenceTypes: { type: 'array', required: false , description: 'Lists the evidence types required by this record.'},
        discrepancyHandling: { type: 'string', required: true, enum: ['ALLOW_WITH_REASON', 'REVIEW_REQUIRED', 'REJECT'] , description: 'Selects the discrepancy handling value used to drive validation, filtering, and business behavior.'},
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'DEPRECATED', 'ARCHIVED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
        revision: { type: 'int', required: true, default: 0 , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'},
        metadata: { type: 'object', required: false , description: 'Stores additional structured metadata needed by extensions without changing the core schema contract.'}
    } })
} };
