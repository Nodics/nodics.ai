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
        wasteMaterialValuePolicy: {
            super: 'base', model: true,
            backoffice: { mutationMode: 'READ_ONLY', operations: ['search', 'read'], concurrency: { managed: true, field: 'revision' } },
            schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false },
            cache: { enabled: false }, event: { enabled: false }, search: { enabled: true, idPropertyName: 'code' },
            definition: {
                version: { type: 'string', required: true, description: 'Governed immutable policy version; use a new record identity for amendments.' },
                status: { type: 'string', required: true, enum: ['ACTIVE', 'INACTIVE'], description: 'Admission state for new assessments.' },
                programCode: { type: 'string', required: true, description: 'Explicit canonical Loyalty program selection.' },
                rewardTypeCode: { type: 'string', required: true, description: 'Explicit canonical Loyalty reward type.' },
                currency: { type: 'string', required: true, description: 'Monetary currency to which the recorded conversion rate applies.' },
                commercialModel: { type: 'string', required: true, enum: ['PROGRAM_FUNDED', 'CUSTOMER_SHARING'], description: 'Recorded material-value commercial model.' },
                currencyScale: { type: 'int', required: true, description: 'Exact monetary minor-unit scale.' },
                rewardScale: { type: 'int', required: true, description: 'Recorded Loyalty reward precision.' },
                basisScale: { type: 'int', required: true, description: 'Exact accepted-quantity weighting precision.' },
                contributorShare: { type: 'object', required: true, description: 'Recorded rational contributor share, never an implicit hierarchy entitlement.' },
                conversionRate: { type: 'object', required: true, description: 'Recorded rational reward units per currency unit.' },
                roundingMode: { type: 'string', required: true, enum: ['DOWN', 'HALF_UP'], description: 'Explicit allocation and conversion rounding.' },
                categories: { type: 'object', required: true, description: 'Recorded material category, quantity/weight units and attribution weights.' },
                revision: { type: 'int', required: true, default: 0, description: 'Managed governed policy record revision.' }
            }
        },
        wasteMaterialValuePaymentClaim: {
            super: 'base', model: true,
            backoffice: { mutationMode: 'READ_ONLY', operations: ['search', 'read'], concurrency: { managed: true, field: 'revision' } },
            schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false },
            cache: { enabled: false }, event: { enabled: false }, search: { enabled: true, idPropertyName: 'code' },
            definition: {
                batchCode: { type: 'string', required: true, description: 'Only batch admitted for this receipt identity.' },
                paymentRef: { type: 'object', required: true, description: 'Authoritative recycler-payment reference.' },
                revision: { type: 'int', required: true, default: 0, description: 'Managed insert-only claim revision.' }
            }
        },
        "wasteMaterialValueBatch": {
            "super": "base",
            "model": true,
            "backoffice": {
                "mutationMode": "READ_ONLY",
                "operations": [
                    "search",
                    "read"
                ],
                "concurrency": {
                    "managed": true,
                    "field": "revision"
                }
            },
            "schemaPolicies": [
                "operational"
            ],
            "service": {
                "enabled": true
            },
            "router": {
                "enabled": false
            },
            "cache": {
                "enabled": false
            },
            "event": {
                "enabled": false
            },
            "search": {
                "enabled": true,
                "idPropertyName": "code"
            },
            "definition": {
                "assessedBy": {
                    "type": "object",
                    "required": true,
                    "description": "Authenticated coordinating service principal; never the payment beneficiary."
                },
                "valuationRef": {
                    "type": "object",
                    "required": true,
                    "description": "Owner-persisted valuationRef."
                },
                "batchRef": {
                    "type": "object",
                    "required": true,
                    "description": "Owner-persisted batchRef."
                },
                "payerRef": {
                    "type": "object",
                    "required": true,
                    "description": "Owner-persisted payerRef."
                },
                "payeeRef": {
                    "type": "object",
                    "required": true,
                    "description": "Owner-persisted payeeRef."
                },
                "confirmationRef": {
                    "type": "object",
                    "required": true,
                    "description": "Owner-persisted confirmationRef."
                },
                "currency": {
                    "type": "string",
                    "required": true,
                    "description": "Owner-persisted currency."
                },
                "confirmedValue": {
                    "type": "string",
                    "required": true,
                    "description": "Owner-persisted confirmedValue."
                },
                "policy": {
                    "type": "object",
                    "required": true,
                    "description": "Owner-persisted policy."
                },
                "synthetic": {
                    "type": "boolean",
                    "required": true,
                    "description": "Owner-persisted synthetic."
                },
                "evidenceHash": {
                    "type": "string",
                    "required": true,
                    "description": "Owner-persisted evidenceHash."
                },
                "allocations": {
                    "type": "array",
                    "required": true,
                    "description": "Owner-persisted allocations."
                },
                "releases": {
                    "type": "array",
                    "required": true,
                    "description": "Owner-persisted releases."
                },
                "recordedAt": {
                    "type": "date",
                    "required": true,
                    "description": "Owner-persisted recordedAt."
                },
                "qualificationRef": {
                    "type": "object",
                    "required": true,
                    "description": "Owner-persisted qualificationRef."
                },
                "revision": {
                    "type": "int",
                    "required": true,
                    "default": 0,
                    "description": "Owner-persisted revision."
                }
            }
        },
        "wasteMaterialValueContributionClaim": {
            "super": "base",
            "model": true,
            "backoffice": {
                "mutationMode": "READ_ONLY",
                "operations": [
                    "search",
                    "read"
                ],
                "concurrency": {
                    "managed": true,
                    "field": "revision"
                }
            },
            "schemaPolicies": [
                "operational"
            ],
            "service": {
                "enabled": true
            },
            "router": {
                "enabled": false
            },
            "cache": {
                "enabled": false
            },
            "event": {
                "enabled": false
            },
            "search": {
                "enabled": true,
                "idPropertyName": "code"
            },
            "definition": {
                "batchCode": {
                    "type": "string",
                    "required": true,
                    "description": "Owner-persisted batchCode."
                },
                "evidenceHash": {
                    "type": "string",
                    "required": true,
                    "description": "Owner-persisted evidenceHash."
                },
                "contributionRef": {
                    "type": "object",
                    "required": true,
                    "description": "Owner-persisted contributionRef."
                },
                "revision": {
                    "type": "int",
                    "required": true,
                    "default": 0,
                    "description": "Owner-persisted revision."
                }
            }
        },
        wasteRewardAssessment: {
            backoffice: { mutationMode: 'READ_ONLY', operations: ['search', 'read'] },
            super: 'base',
            model: true,
            schemaPolicies: ['operational'],
            service: { enabled: true },
            router: { enabled: false },
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
