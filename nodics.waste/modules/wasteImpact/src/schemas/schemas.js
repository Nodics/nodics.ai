/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteImpact/src/schemas/schemas @description Defines reusable Waste impact metric, profile, and result schemas. @layer schema @owner wasteImpact @override Partner modules may add formulas and claim rules while preserving versioned evidence. */


module.exports = { wasteImpact: {
    wasteImpactSelection: Object.assign({ super: 'base', model: true, backoffice: { mutationMode: 'READ_ONLY' }, schemaPolicies: ['operational'], service: { enabled: true }, router: { groups: { schemaOperations: true }, enabled: true }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true, description: 'Immutable acceptance command identity.' },
        assetCode: { type: 'string', required: true, description: 'Asset whose accepted assessment changed.' },
        assessmentRef: { type: 'object', required: true, description: 'Explicitly accepted saved assessment.' },
        previousAssessmentRef: { type: 'object', required: false, description: 'Previously accepted assessment, retained for audit.' },
        selectedAt: { type: 'date', required: true, description: 'Time of explicit acceptance.' },
        selectedBy: { type: 'string', required: true, description: 'Authenticated employee who accepted the assessment.' },
        reason: { type: 'string', required: true, description: 'Operator explanation for acceptance.' },
        sourceAssetRevision: { type: 'int', required: true, description: 'Asset revision reviewed before acceptance.' },
        idempotencyKey: { type: 'string', required: true, description: 'Original acceptance command reference.' },
        revision: { type: 'int', required: true, default: 0, description: 'Initial immutable event revision.' },
        metadata: { type: 'object', required: false, description: 'Command fingerprint for replay validation.' }
    }, refSchema: { assessmentRef: {"enabled":true,"moduleName":"wasteImpact","schemaName":"wasteImpactResult","type":"one","propertyName":"code"}, previousAssessmentRef: {"enabled":true,"moduleName":"wasteImpact","schemaName":"wasteImpactResult","type":"one","propertyName":"code"} } }),
    wasteImpactMetric: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { groups: { schemaOperations: true }, enabled: true }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'},
        name: { type: 'object', required: true , description: 'Stores the business display name shown to administrators and related user journeys.'},
        unitOfMeasure: { type: 'string', required: true , description: 'Stores the unit of measure value used by this record.'},
        publicClaimAllowed: { type: 'bool', required: true, default: false , description: 'Indicates whether public claim allowed applies for this record.'},
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'DEPRECATED', 'ARCHIVED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
        revision: { type: 'int', required: true, default: 0 , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'},
        metadata: { type: 'object', required: false , description: 'Stores additional structured metadata needed by extensions without changing the core schema contract.'}
    } }),
    wasteImpactProfile: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { groups: { schemaOperations: true }, enabled: true }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'},
        name: { type: 'object', required: true , description: 'Stores the business display name shown to administrators and related user journeys.'},
        categoryCode: { type: 'string', required: false , description: 'Stores the category code used to classify, link, or resolve this record.'},
        itemTypeCode: { type: 'string', required: false , description: 'Stores the item type code used to classify, link, or resolve this record.'},
        materialTypeCode: { type: 'string', required: false , description: 'Stores the material type code used to classify, link, or resolve this record.'},
        formulaType: { type: 'string', required: true, enum: ['STATIC_FACTOR', 'WEIGHT_FACTOR', 'QUANTITY_FACTOR', 'EXTERNAL_PROVIDER', 'CUSTOM_POLICY'] , description: 'Classifies this record by formula type for validation and business handling.'},
        metricRules: { type: 'array', required: false , description: 'Lists the metric rules associated with this record.'},
        effectiveFrom: { type: 'date', required: false , description: 'Defines when this record becomes effective for business use.'},
        effectiveTo: { type: 'date', required: false , description: 'Defines when this record stops being effective for business use.'},
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'DEPRECATED', 'ARCHIVED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
        revision: { type: 'int', required: true, default: 0 , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'},
        metadata: { type: 'object', required: false , description: 'Stores additional structured metadata needed by extensions without changing the core schema contract.'}
    } }),
    wasteImpactResult: Object.assign({ super: 'base', model: true, backoffice: { mutationMode: 'READ_ONLY' }, schemaPolicies: ['operational'], service: { enabled: true }, router: { groups: { schemaOperations: true }, enabled: true }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'},
        sourceRef: { type: 'object', required: true , description: 'References the related source record used by this record.'},
        profileCode: { type: 'string', required: true , description: 'Stores the profile code used to classify, link, or resolve this record.'},
        metrics: { type: 'array', required: true , description: 'Lists the metrics associated with this record.'},
        calculationStatus: { type: 'string', required: true, enum: ['ESTIMATED', 'CONFIRMED', 'RECALCULATED', 'FAILED'] , description: 'Selects the calculation status value used to drive validation, filtering, and business behavior.'},
        calculatedAt: { type: 'date', required: true , description: 'Records when the calculated event or value applies.'},
        evidenceRefs: { type: 'array', required: false , description: 'Lists related evidence records used by this record.'},
        confidence: { type: 'string', required: false , description: 'Stores the confidence value used by this record.'},
        formulaVersion: { type: 'string', required: false , description: 'Stores the formula version value used by this record.'},
        correlationId: { type: 'string', required: false , description: 'Stores the correlation identifier used to correlate this record.'},
        idempotencyKey: { type: 'string', required: false , description: 'Stores the idempotency key value used by this record.'},
        revision: { type: 'int', required: true, default: 0 , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'},
        metadata: { type: 'object', required: false , description: 'Stores additional structured metadata needed by extensions without changing the core schema contract.'}
    }, refSchema: {
        evidenceRefs: {"enabled":true,"moduleName":"wasteSubmission","schemaName":"wasteEvidence","type":"many","propertyName":"code"}
    } })
} };
