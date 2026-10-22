/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteCarbon/schemas @description Generated tenant-isolated lot storage. A lot is the atomic allocation and transfer boundary; generic mutations are disabled. @owner wasteCarbon @layer schema */
module.exports = {
    "wasteCarbon": {
        "wasteCarbonAllocationClaim": {
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
                "lotCode": {
                    "type": "string",
                    "required": true,
                    "description": "Owner-persisted lotCode."
                },
                "allocationRef": {
                    "type": "object",
                    "required": true,
                    "description": "Owner-persisted allocationRef."
                },
                "fingerprint": {
                    "type": "string",
                    "required": true,
                    "description": "Owner-persisted fingerprint."
                },
                "revision": {
                    "type": "int",
                    "required": true,
                    "default": 0,
                    "description": "Owner-persisted revision."
                }
            }
        },
        "wasteCarbonLot": {
            "super": "base",
            "model": true,
            "backoffice": {
                "mutationMode": "READ_ONLY",
                "concurrency": { "managed": true, "field": "revision" },
                "operations": [
                    "search",
                    "read"
                ]
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
                "evidenceRef": {
                    "type": "object",
                    "required": true,
                    "description": "Owner-persisted evidenceRef evidence."
                },
                "issuanceRef": {
                    "type": "object",
                    "required": true,
                    "description": "Owner-persisted issuanceRef evidence."
                },
                "providerRef": {
                    "type": "object",
                    "required": true,
                    "description": "Owner-persisted providerRef evidence."
                },
                "programRef": {
                    "type": "object",
                    "required": true,
                    "description": "Owner-persisted programRef evidence."
                },
                "unitOfMeasure": {
                    "type": "string",
                    "required": true,
                    "description": "Owner-persisted unitOfMeasure evidence."
                },
                "scale": {
                    "type": "int",
                    "required": true,
                    "description": "Owner-persisted scale evidence."
                },
                "issuedQuantity": {
                    "type": "string",
                    "required": true,
                    "description": "Owner-persisted issuedQuantity evidence."
                },
                "state": {
                    "type": "string",
                    "required": true,
                    "description": "Owner-persisted state evidence."
                },
                "synthetic": {
                    "type": "boolean",
                    "required": true,
                    "description": "Owner-persisted synthetic evidence."
                },
                "allocations": {
                    "type": "array",
                    "required": true,
                    "description": "Owner-persisted allocations evidence."
                },
                "operations": {
                    "type": "array",
                    "required": true,
                    "description": "Owner-persisted operations evidence."
                },
                "prospectiveEvidence": {
                    "type": "array",
                    "required": false,
                    "description": "Owner-persisted prospectiveEvidence evidence."
                },
                "qualificationRef": {
                    "type": "object",
                    "required": true,
                    "description": "Owner-persisted qualificationRef evidence."
                },
                "updatedAt": {
                    "type": "date",
                    "required": true,
                    "description": "Owner-persisted updatedAt evidence."
                },
                "revision": {
                    "type": "int",
                    "required": true,
                    "default": 0,
                    "description": "Owner-persisted revision evidence."
                }
            }
        }
    }
};
