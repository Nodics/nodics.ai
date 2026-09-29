/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module tax/src/schemas/schemas @description Defines governed Phase 2 tax persistence and decision evidence. @layer schema @owner tax */
module.exports = { tax: {
    taxPolicy: Object.assign({ super: 'base', model: true, schemaPolicies: ["tenantOwned", "publicationVersioned"], service: { enabled: true }, router: { groups: { schemaOperations: true }, enabled: true }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: { code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'}, tenant: { type: 'string', required: true , description: 'Identifies the runtime tenant partition that scopes this record.'}, enterpriseCode: { type: 'string', required: false , description: 'Stores the enterprise code used to classify, link, or resolve this record.'}, jurisdiction: { type: 'string', required: true , description: 'Stores the jurisdiction value used by this record.'}, taxCode: { type: 'string', required: true , description: 'Stores the tax code used to classify, link, or resolve this record.'}, rate: { type: 'string', required: true , description: 'Stores the rate value used by this record.'}, status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'}, revision: { type: 'int', required: true , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'} } }),
    taxDecision: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { groups: { schemaOperations: true }, enabled: true }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: { code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'}, tenant: { type: 'string', required: true , description: 'Identifies the runtime tenant partition that scopes this record.'}, taxCode: { type: 'string', required: true , description: 'Stores the tax code used to classify, link, or resolve this record.'}, jurisdiction: { type: 'string', required: true , description: 'Stores the jurisdiction value used by this record.'}, taxableAmount: { type: 'string', required: true , description: 'Stores the taxable amount used for calculation, reporting, or settlement.'}, taxAmount: { type: 'string', required: true , description: 'Stores the tax amount used for calculation, reporting, or settlement.'}, currency: { type: 'string', required: true , description: 'Stores the currency code used for monetary amounts on this record.'}, rate: { type: 'string', required: true , description: 'Stores the rate value used by this record.'}, inclusive: { type: 'bool', required: true , description: 'Indicates whether inclusive applies for this record.'}, policyVersion: { type: 'string', required: true , description: 'Stores the policy version value used by this record.'}, sourceHash: { type: 'string', required: true , description: 'Stores a fingerprint of the source data used to detect changes or duplicates.'}, correlationId: { type: 'string', required: true , description: 'Stores the correlation identifier used to correlate this record.'}, decidedAt: { type: 'date', required: true , description: 'Records when the decided event or value applies.'} } })
} };
module.exports.tax.taxPolicy.backoffice = { operations: ['search', 'read', 'create', 'update'], description: 'Jurisdiction and tax-code policy.' };

/** Tax owns retained policy content; nPublish remains lifecycle authority. */
module.exports.tax.taxPolicyRelease = {
    "super": "base",
    "model": true,
    "isVersionedEnabled": false,
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
        "enabled": false
    },
    "backoffice": {
        "operations": [
            "search",
            "read"
        ],
        "concurrency": {
            "managed": true,
            "field": "revision"
        }
    },
    "indexes": {
        "individual": {
            "policyIdentity": {
                "name": "code",
                "enabled": true,
                "options": {
                    "unique": true
                }
            }
        }
    },
    "definition": {
        "code": {
            "type": "string",
            "required": true,
            "description": "Content or operation identity including trusted scope."
        },
        "tenant": {
            "type": "string",
            "required": true,
            "description": "Runtime tenant partition."
        },
        "enterpriseCode": {
            "type": "string",
            "required": true,
            "description": "Owning business enterprise."
        },
        "revision": {
            "type": "int",
            "required": true,
            "description": "Managed compare-and-set counter, not policy version."
        },
        "rootType": {
            "type": "string",
            "required": true,
            "description": "Owning source schema identity."
        },
        "rootCode": {
            "type": "string",
            "required": true,
            "description": "Owning policy root."
        },
        "payload": {
            "type": "object",
            "required": true,
            "description": "Retained exact policy-only content."
        },
        "fingerprint": {
            "type": "string",
            "required": true,
            "description": "Canonical SHA256 content identity."
        }
    }
};
/** Tax owns retained policy activation pointer; nPublish remains lifecycle authority. */
module.exports.tax.taxPolicyPointer = {
    "super": "base",
    "model": true,
    "isVersionedEnabled": false,
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
        "enabled": false
    },
    "backoffice": {
        "operations": [
            "search",
            "read"
        ],
        "concurrency": {
            "managed": true,
            "field": "revision"
        }
    },
    "indexes": {
        "individual": {
            "policyIdentity": {
                "name": "code",
                "enabled": true,
                "options": {
                    "unique": true
                }
            }
        }
    },
    "definition": {
        "code": {
            "type": "string",
            "required": true,
            "description": "Content or operation identity including trusted scope."
        },
        "tenant": {
            "type": "string",
            "required": true,
            "description": "Runtime tenant partition."
        },
        "enterpriseCode": {
            "type": "string",
            "required": true,
            "description": "Owning business enterprise."
        },
        "revision": {
            "type": "int",
            "required": true,
            "description": "Managed compare-and-set counter, not policy version."
        },
        "rootType": {
            "type": "string",
            "required": true,
            "description": "Owning source schema identity."
        },
        "rootCode": {
            "type": "string",
            "required": true,
            "description": "Owning policy root."
        },
        "version": {
            "type": "string",
            "required": false,
            "description": "Activated retained release; null before first activation."
        },
        "receiptCode": {
            "type": "string",
            "required": false,
            "description": "Receipt committed by the same pointer CAS."
        },
        "legacyCasRecovery": {
            "type": "object",
            "required": false,
            "description": "Reviewed pre-fix CAS recovery evidence, committed atomically by managed concurrency."
        }
    }
};
/** Tax owns retained policy operation evidence; nPublish remains lifecycle authority. */
module.exports.tax.taxPolicyReceipt = {
    "super": "base",
    "model": true,
    "isVersionedEnabled": false,
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
        "enabled": false
    },
    "backoffice": {
        "operations": [
            "search",
            "read"
        ],
        "concurrency": {
            "managed": true,
            "field": "revision"
        }
    },
    "indexes": {
        "individual": {
            "policyIdentity": {
                "name": "code",
                "enabled": true,
                "options": {
                    "unique": true
                }
            }
        }
    },
    "definition": {
        "code": {
            "type": "string",
            "required": true,
            "description": "Content or operation identity including trusted scope."
        },
        "tenant": {
            "type": "string",
            "required": true,
            "description": "Runtime tenant partition."
        },
        "enterpriseCode": {
            "type": "string",
            "required": true,
            "description": "Owning business enterprise."
        },
        "revision": {
            "type": "int",
            "required": true,
            "description": "Managed compare-and-set counter, not policy version."
        },
        "pointerCode": {
            "type": "string",
            "required": true,
            "description": "Scoped root pointer identity."
        },
        "operationKey": {
            "type": "string",
            "required": true,
            "description": "Pinned nPublish operation identity."
        },
        "publicationCode": {
            "type": "string",
            "required": true,
            "description": "Owning nPublish request."
        },
        "sourceVersion": {
            "type": "string",
            "required": true,
            "description": "Approved retained source release."
        },
        "targetVersion": {
            "type": "string",
            "required": true,
            "description": "Exact target release."
        },
        "previousOnlineVersion": {
            "type": "string",
            "required": false,
            "description": "Original Online version, null for first release."
        },
        "expectedRevision": {
            "type": "int",
            "required": true,
            "description": "Pointer revision before CAS."
        },
        "fingerprint": {
            "type": "string",
            "required": true,
            "description": "Target content fingerprint."
        },
        "applied": {
            "type": "bool",
            "required": true,
            "description": "Pointer CAS is durably evidenced; not an approval state."
        }
    }
};
