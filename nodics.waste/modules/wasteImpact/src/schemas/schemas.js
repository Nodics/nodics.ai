/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteImpact/src/schemas/schemas @description Defines reusable Waste impact metric, profile, and result schemas. @layer schema @owner wasteImpact @override Partner modules may add formulas and claim rules while preserving versioned evidence. */
module.exports = { wasteImpact: {
    wasteImpactMetric: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true },
        name: { type: 'object', required: true },
        unitOfMeasure: { type: 'string', required: true },
        publicClaimAllowed: { type: 'bool', required: true, default: false },
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'DEPRECATED', 'ARCHIVED'] },
        revision: { type: 'int', required: true, default: 0 },
        metadata: { type: 'object', required: false }
    } }),
    wasteImpactProfile: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true },
        name: { type: 'object', required: true },
        categoryCode: { type: 'string', required: false },
        itemTypeCode: { type: 'string', required: false },
        materialTypeCode: { type: 'string', required: false },
        formulaType: { type: 'string', required: true, enum: ['STATIC_FACTOR', 'WEIGHT_FACTOR', 'QUANTITY_FACTOR', 'EXTERNAL_PROVIDER', 'CUSTOM_POLICY'] },
        metricRules: { type: 'array', required: false },
        effectiveFrom: { type: 'date', required: false },
        effectiveTo: { type: 'date', required: false },
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'DEPRECATED', 'ARCHIVED'] },
        revision: { type: 'int', required: true, default: 0 },
        metadata: { type: 'object', required: false }
    } }),
    wasteImpactResult: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true },
        sourceRef: { type: 'object', required: true },
        profileCode: { type: 'string', required: true },
        metrics: { type: 'array', required: true },
        calculationStatus: { type: 'string', required: true, enum: ['ESTIMATED', 'CONFIRMED', 'RECALCULATED', 'FAILED'] },
        calculatedAt: { type: 'date', required: true },
        evidenceRefs: { type: 'array', required: false },
        confidence: { type: 'string', required: false },
        formulaVersion: { type: 'string', required: false },
        correlationId: { type: 'string', required: false },
        idempotencyKey: { type: 'string', required: false },
        revision: { type: 'int', required: true, default: 0 },
        metadata: { type: 'object', required: false }
    } })
} };
