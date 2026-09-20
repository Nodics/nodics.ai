/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module wasteReward/src/schemas/schemas @description Defines immutable Waste reward-assessment evidence. @layer schema @owner wasteReward */
module.exports = {
    wasteReward: {
        wasteRewardAssessment: {
            backoffice: { mutationMode: 'READ_ONLY', operations: ['search', 'read'] },
            super: 'base',
            model: true,
            schemaPolicies: ['operational'],
            service: { enabled: true },
            router: { groups: { schemaOperations: true }, enabled: true },
            cache: { enabled: false },
            event: { enabled: false },
            search: { enabled: true, idPropertyName: 'code' },
            definition: {
                submissionCode: { type: 'string', required: true, description: 'Waste submission evaluated for this reward assessment.' },
                assetCode: { type: 'string', required: false, description: 'Approved Waste asset when one exists.' },
                assessmentType: { type: 'string', required: true, enum: ['ESTIMATED','CONFIRMED','RECALCULATED'], description: 'Historical calculation stage.' },
                calculatedScore: { type: 'string', required: true, description: 'Score before policy bounds.' },
                finalScore: { type: 'string', required: true, description: 'Score after policy bounds.' },
                scoreBandCode: { type: 'string', required: true, description: 'Resolved immutable reward band.' },
                rewardTypeCode: { type: 'string', required: true, description: 'Loyalty reward type identified by the resolved band.' },
                rewardAmount: { type: 'string', required: true, description: 'Fixed reward amount resolved from the score band.' },
                rewardOutcome: { type: 'object', required: true, description: 'Consumer-owned fixed outcome captured at calculation time.' },
                policyCode: { type: 'string', required: true, description: 'Effective rule policy used by the assessment.' },
                policyVersion: { type: 'int', required: true, description: 'Immutable rule policy version.' },
                policyLineage: { type: 'array', required: false, description: 'Platform/domain/enterprise/campaign policy lineage.' },
                bandSetCode: { type: 'string', required: true, description: 'Score-band set used by the assessment.' },
                bandSetVersion: { type: 'int', required: true, description: 'Immutable score-band version.' },
                propertyCatalogueCode: { type: 'string', required: true, description: 'Consumer property catalogue bound to the calculation.' },
                propertyCatalogueVersion: { type: 'string', required: true, description: 'Consumer property catalogue version.' },
                matchedRules: { type: 'array', required: false, description: 'Matched rule-group codes.' },
                skippedRules: { type: 'array', required: false, description: 'Non-matching/skipped rule-group codes.' },
                fallbackInputs: { type: 'array', required: false, description: 'Fallback property values used during evaluation.' },
                qualityExcludedInputs: { type: 'array', required: false, description: 'Inputs excluded because quality/confidence requirements were not met.' },
                calculationBreakdown: { type: 'object', required: true, description: 'Explainable generic rule evaluation evidence.' },
                inputSnapshot: { type: 'object', required: true, description: 'Bounded normalized property input snapshot used for deterministic audit.' },
                sourceImpactRef: { type: 'object', required: false, description: 'Waste impact result used by this assessment.' },
                sourceVerificationRef: { type: 'object', required: false, description: 'Waste verification result used by this assessment.' },
                sourceRevision: { type: 'int', required: true, description: 'Submission/asset revision used to build the input snapshot.' },
                calculatedAt: { type: 'date', required: true, description: 'Assessment calculation timestamp.' },
                correlationId: { type: 'string', required: false, description: 'Cross-capability correlation identifier.' },
                idempotencyKey: { type: 'string', required: true, description: 'Stable replay key for this immutable assessment.' },
                sourceHash: { type: 'string', required: true, description: 'Deterministic hash of evaluation evidence.' },
                revision: { type: 'int', required: true, default: 0, description: 'Immutable initial business revision.' },
                metadata: { type: 'object', required: false, description: 'Bounded extension metadata.' }
            }
        }
    }
};
