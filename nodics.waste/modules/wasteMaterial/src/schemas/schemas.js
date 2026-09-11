/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteMaterial/src/schemas/schemas @description Defines reusable Waste taxonomy and policy-reference schemas. @layer schema @owner wasteMaterial @override Accelerator and partner modules may extend taxonomy records and seed domain-specific categories without changing framework source. */
module.exports = { wasteMaterial: {
    wasteFamily: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'},
        name: { type: 'object', required: true , description: 'Stores the business display name shown to administrators and related user journeys.'},
        description: { type: 'object', required: false , description: 'Explains the business purpose, usage, or administrative meaning of this record.'},
        defaultIconCode: { type: 'string', required: false , description: 'Stores the default icon code used to classify, link, or resolve this record.'},
        complianceProfileCode: { type: 'string', required: false , description: 'Stores the compliance profile code used to classify, link, or resolve this record.'},
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'DEPRECATED', 'ARCHIVED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
        sortOrder: { type: 'int', required: false , description: 'Stores the numeric sort order used by this record.'},
        effectiveFrom: { type: 'date', required: false , description: 'Defines when this record becomes effective for business use.'},
        effectiveTo: { type: 'date', required: false , description: 'Defines when this record stops being effective for business use.'},
        revision: { type: 'int', required: true, default: 0 , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'},
        metadata: { type: 'object', required: false , description: 'Stores additional structured metadata needed by extensions without changing the core schema contract.'}
    } }),
    wasteCategory: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'},
        familyCode: { type: 'string', required: true , description: 'Stores the family code used to classify, link, or resolve this record.'},
        name: { type: 'object', required: true , description: 'Stores the business display name shown to administrators and related user journeys.'},
        description: { type: 'object', required: false , description: 'Explains the business purpose, usage, or administrative meaning of this record.'},
        itemTypeCodes: { type: 'array', required: false , description: 'Lists item type codes used to classify, link, or resolve this record.'},
        materialTypeCodes: { type: 'array', required: false , description: 'Lists material type codes used to classify, link, or resolve this record.'},
        evidencePolicyCode: { type: 'string', required: false , description: 'Stores the evidence policy code used to classify, link, or resolve this record.'},
        impactProfileCode: { type: 'string', required: false , description: 'Stores the impact profile code used to classify, link, or resolve this record.'},
        hazardFlags: { type: 'array', required: false , description: 'Lists the hazard flags associated with this record.'},
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'DEPRECATED', 'ARCHIVED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
        effectiveFrom: { type: 'date', required: false , description: 'Defines when this record becomes effective for business use.'},
        effectiveTo: { type: 'date', required: false , description: 'Defines when this record stops being effective for business use.'},
        revision: { type: 'int', required: true, default: 0 , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'},
        metadata: { type: 'object', required: false , description: 'Stores additional structured metadata needed by extensions without changing the core schema contract.'}
    } }),
    wasteItemType: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'},
        categoryCode: { type: 'string', required: true , description: 'Stores the category code used to classify, link, or resolve this record.'},
        name: { type: 'object', required: true , description: 'Stores the business display name shown to administrators and related user journeys.'},
        description: { type: 'object', required: false , description: 'Explains the business purpose, usage, or administrative meaning of this record.'},
        requiresBrand: { type: 'bool', required: true, default: false , description: 'Indicates whether brand applies for this record.'},
        requiresModel: { type: 'bool', required: true, default: false , description: 'Indicates whether model applies for this record.'},
        requiresSerial: { type: 'bool', required: true, default: false , description: 'Indicates whether serial applies for this record.'},
        requiresWeight: { type: 'bool', required: true, default: false , description: 'Indicates whether weight applies for this record.'},
        requiresQuantity: { type: 'bool', required: true, default: true , description: 'Indicates whether quantity applies for this record.'},
        allowedConditionGrades: { type: 'array', required: false , description: 'Lists the allowed condition grades associated with this record.'},
        evidencePolicyCode: { type: 'string', required: false , description: 'Stores the evidence policy code used to classify, link, or resolve this record.'},
        impactProfileCode: { type: 'string', required: false , description: 'Stores the impact profile code used to classify, link, or resolve this record.'},
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'DEPRECATED', 'ARCHIVED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
        revision: { type: 'int', required: true, default: 0 , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'},
        metadata: { type: 'object', required: false , description: 'Stores additional structured metadata needed by extensions without changing the core schema contract.'}
    } }),
    wasteMaterialType: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'},
        materialKind: { type: 'string', required: false, enum: ['MATERIAL', 'COMPONENT', 'MIXTURE'], description: 'Distinguishes a substance from a component or mixture without implying a measured composition.' },
        parentMaterialCode: { type: 'string', required: false, description: 'Optional canonical parent material reference for extensible material classification.' },
        familyCode: { type: 'string', required: false , description: 'Stores the family code used to classify, link, or resolve this record.'},
        name: { type: 'object', required: true , description: 'Stores the business display name shown to administrators and related user journeys.'},
        hazardClass: { type: 'string', required: false , description: 'Stores the hazard class value used by this record.'},
        unitOfMeasure: { type: 'string', required: true, enum: ['EACH', 'KG', 'GRAM', 'LITER', 'CUBIC_METER'] , description: 'Selects the unit of measure value used to drive validation, filtering, and business behavior.'},
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'DEPRECATED', 'ARCHIVED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
        revision: { type: 'int', required: true, default: 0 , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'},
        metadata: { type: 'object', required: false , description: 'Stores additional structured metadata needed by extensions without changing the core schema contract.'}
    } }),
    wasteConditionGrade: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'},
        name: { type: 'object', required: true , description: 'Stores the business display name shown to administrators and related user journeys.'},
        description: { type: 'object', required: false , description: 'Explains the business purpose, usage, or administrative meaning of this record.'},
        sortOrder: { type: 'int', required: false , description: 'Stores the numeric sort order used by this record.'},
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'DEPRECATED', 'ARCHIVED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
        revision: { type: 'int', required: true, default: 0 , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'},
        metadata: { type: 'object', required: false , description: 'Stores additional structured metadata needed by extensions without changing the core schema contract.'}
    } }),
    wasteEvidencePolicy: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'},
        ownerModule: { type: 'string', required: false , description: 'Stores the owner module value used by this record.'},
        categoryCode: { type: 'string', required: false , description: 'Stores the category code used to classify, link, or resolve this record.'},
        itemTypeCode: { type: 'string', required: false , description: 'Stores the item type code used to classify, link, or resolve this record.'},
        requiredEvidenceTypes: { type: 'array', required: false , description: 'Lists the evidence types required by this record.'},
        requiredFields: { type: 'array', required: false , description: 'Indicates whether fields applies for this record.'},
        minimumPhotoCount: { type: 'int', required: false , description: 'Stores the minimum photo count used for validation, calculation, or operational decisions.'},
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'DEPRECATED', 'ARCHIVED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
        revision: { type: 'int', required: true, default: 0 , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'},
        metadata: { type: 'object', required: false , description: 'Stores additional structured metadata needed by extensions without changing the core schema contract.'}
    } })
} };
