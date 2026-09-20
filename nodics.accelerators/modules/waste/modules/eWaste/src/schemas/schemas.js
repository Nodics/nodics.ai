/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module eWaste/src/schemas/schemas @description Defines eWaste-owned reward assessment evidence while generic rule definitions remain owned by nodics.rulesEngine. @layer schema @owner eWaste */
module.exports = {
    eWaste: {
        eWasteRewardAssessment: {
            backoffice: { mutationMode: 'READ_ONLY', operations: ['search','read'] },
            super: 'base',
            model: true,
            service: { enabled: true },
            cache: { enabled: false },
            router: { groups: { schemaOperations: true }, enabled: true },
            search: { enabled: true, idPropertyName: 'code' },
            definition: {
                submissionCode: { type: 'string', required: true, description: 'Waste submission evaluated for this reward assessment.' },
                assetCode: { type: 'string', required: false, description: 'Approved asset reference when available.' },
                assessmentType: { type: 'string', required: true, enum: ['ESTIMATED','CONFIRMED','RECALCULATED'], description: 'Lifecycle stage of this immutable reward assessment.' },
                calculatedScore: { type: 'number', required: true, description: 'Raw additive score before configured bounds.' },
                finalScore: { type: 'number', required: true, description: 'Score after configured min/max bounds.' },
                scoreBandCode: { type: 'string', required: true, description: 'Resolved immutable score band.' },
                rewardTypeCode: { type: 'string', required: true, description: 'Loyalty reward type to be settled only after asset approval.' },
                rewardAmount: { type: 'string', required: true, description: 'Exact reward amount expressed as a decimal string for downstream Loyalty settlement.' },
                rewardOutcome: { type: 'object', required: true, description: 'Structured consumer-owned reward outcome resolved from the score band.' },
                policyCode: { type: 'string', required: true, description: 'Effective rule-set code used for this assessment.' },
                policyVersion: { type: 'int', required: true, description: 'Exact immutable rule-set version.' },
                policyLineage: { type: 'array', required: false, description: 'Hierarchy of policy versions contributing to the effective snapshot.' },
                bandSetCode: { type: 'string', required: true, description: 'Exact score-band-set code.' },
                bandSetVersion: { type: 'int', required: true, description: 'Exact immutable score-band-set version.' },
                propertyCatalogueCode: { type: 'string', required: true, description: 'Consumer property catalogue used for evaluation.' },
                propertyCatalogueVersion: { type: 'string', required: true, description: 'Exact property catalogue version.' },
                matchedRules: { type: 'array', required: true, description: 'Matched top-level rule-group codes.' },
                skippedRules: { type: 'array', required: true, description: 'Non-matching top-level rule-group codes.' },
                fallbackInputs: { type: 'array', required: false, description: 'Properties whose approved fallback source was used.' },
                qualityExcludedInputs: { type: 'array', required: false, description: 'Inputs excluded because they did not meet condition quality/confidence requirements.' },
                calculationBreakdown: { type: 'object', required: true, description: 'Bounded explainable rule evaluation evidence.' },
                inputSnapshot: { type: 'object', required: true, description: 'Bounded normalized input snapshot; raw images, credentials and secrets are prohibited.' },
                sourceImpactRef: { type: 'object', required: false, description: 'Impact assessment used by this reward assessment.' },
                sourceVerificationRef: { type: 'object', required: false, description: 'Verification evidence used by a confirmed assessment.' },
                sourceRevision: { type: 'int', required: false, description: 'Submission/verification business revision used for idempotent assessment identity.' },
                calculatedAt: { type: 'date', required: true, description: 'Assessment calculation timestamp.' },
                correlationId: { type: 'string', required: false, description: 'Cross-capability correlation identifier.' },
                idempotencyKey: { type: 'string', required: true, description: 'Stable assessment command identity for replay.' },
                sourceHash: { type: 'string', required: true, description: 'Deterministic rules evaluation evidence hash.' },
                revision: { type: 'int', required: true, default: 0, description: 'Immutable initial business revision.' },
                metadata: { type: 'object', required: false, description: 'Bounded extension metadata.' }
            }
        }
    }
};
