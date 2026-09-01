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
        code: { type: 'string', required: true },
        name: { type: 'object', required: true },
        description: { type: 'object', required: false },
        defaultIconCode: { type: 'string', required: false },
        complianceProfileCode: { type: 'string', required: false },
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'DEPRECATED', 'ARCHIVED'] },
        sortOrder: { type: 'int', required: false },
        effectiveFrom: { type: 'date', required: false },
        effectiveTo: { type: 'date', required: false },
        revision: { type: 'int', required: true, default: 0 },
        metadata: { type: 'object', required: false }
    } }),
    wasteCategory: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true },
        familyCode: { type: 'string', required: true },
        name: { type: 'object', required: true },
        description: { type: 'object', required: false },
        itemTypeCodes: { type: 'array', required: false },
        materialTypeCodes: { type: 'array', required: false },
        evidencePolicyCode: { type: 'string', required: false },
        impactProfileCode: { type: 'string', required: false },
        hazardFlags: { type: 'array', required: false },
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'DEPRECATED', 'ARCHIVED'] },
        effectiveFrom: { type: 'date', required: false },
        effectiveTo: { type: 'date', required: false },
        revision: { type: 'int', required: true, default: 0 },
        metadata: { type: 'object', required: false }
    } }),
    wasteItemType: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true },
        categoryCode: { type: 'string', required: true },
        name: { type: 'object', required: true },
        description: { type: 'object', required: false },
        requiresBrand: { type: 'bool', required: true, default: false },
        requiresModel: { type: 'bool', required: true, default: false },
        requiresSerial: { type: 'bool', required: true, default: false },
        requiresWeight: { type: 'bool', required: true, default: false },
        requiresQuantity: { type: 'bool', required: true, default: true },
        allowedConditionGrades: { type: 'array', required: false },
        evidencePolicyCode: { type: 'string', required: false },
        impactProfileCode: { type: 'string', required: false },
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'DEPRECATED', 'ARCHIVED'] },
        revision: { type: 'int', required: true, default: 0 },
        metadata: { type: 'object', required: false }
    } }),
    wasteMaterialType: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true },
        familyCode: { type: 'string', required: false },
        name: { type: 'object', required: true },
        hazardClass: { type: 'string', required: false },
        unitOfMeasure: { type: 'string', required: true, enum: ['EACH', 'KG', 'GRAM', 'LITER', 'CUBIC_METER'] },
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'DEPRECATED', 'ARCHIVED'] },
        revision: { type: 'int', required: true, default: 0 },
        metadata: { type: 'object', required: false }
    } }),
    wasteConditionGrade: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true },
        name: { type: 'object', required: true },
        description: { type: 'object', required: false },
        sortOrder: { type: 'int', required: false },
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'DEPRECATED', 'ARCHIVED'] },
        revision: { type: 'int', required: true, default: 0 },
        metadata: { type: 'object', required: false }
    } }),
    wasteEvidencePolicy: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true },
        ownerModule: { type: 'string', required: false },
        categoryCode: { type: 'string', required: false },
        itemTypeCode: { type: 'string', required: false },
        requiredEvidenceTypes: { type: 'array', required: false },
        requiredFields: { type: 'array', required: false },
        minimumPhotoCount: { type: 'int', required: false },
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'DEPRECATED', 'ARCHIVED'] },
        revision: { type: 'int', required: true, default: 0 },
        metadata: { type: 'object', required: false }
    } })
} };
