/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module inventory/src/schemas/schemas @description Defines governed Phase 2 inventory persistence and decision evidence. @layer schema @owner inventory */
module.exports = { inventory: {
    warehouse: Object.assign({ super: 'base', model: true, schemaPolicies: ["tenantOwned", "publicationVersioned"], service: { enabled: true }, router: { groups: { schemaOperations: true }, enabled: true }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { backoffice: { operations: ['search', 'read', 'create', 'update'], description: 'Warehouse master data and sourcing priority.' }, definition: { code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'}, tenant: { type: 'string', required: true , description: 'Identifies the runtime tenant partition that scopes this record.'}, enterpriseCode: { type: 'string', required: false , description: 'Stores the enterprise code used to classify, link, or resolve this record.'}, name: { type: 'string', required: true , description: 'Stores the business display name shown to administrators and related user journeys.'}, status: { type: 'string', required: true, enum: ['ACTIVE', 'INACTIVE'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'}, priority: { type: 'int', required: true , description: 'Stores the numeric priority used by this record.'}, revision: { type: 'int', required: true , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'} } }),
    inventoryBalance: Object.assign({ super: 'base', model: true, schemaPolicies: ['tenantOwned'], service: { enabled: true }, router: { groups: { schemaOperations: true }, enabled: true }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { backoffice: { operations: ['search', 'read'], description: 'Derived stock balance by warehouse and SKU. Mutations require Inventory-owned operations.' }, definition: { code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'}, tenant: { type: 'string', required: true , description: 'Identifies the runtime tenant partition that scopes this record.'}, enterpriseCode: { type: 'string', required: false , description: 'Stores the enterprise code used to classify, link, or resolve this record.'}, warehouseCode: { type: 'string', required: true , description: 'Stores the warehouse code used to classify, link, or resolve this record.'}, sku: { type: 'string', required: true , description: 'Stores the SKU used to identify the purchasable product or variant.'}, inventoryStrategy: { type: 'string', required: false , description: 'Stores the inventory strategy value used by this record.'}, digitalDeliveryType: { type: 'string', required: false , description: 'Classifies this record by digital delivery type for validation and business handling.'}, couponBatchCode: { type: 'string', required: false , description: 'Stores the coupon batch code used to classify, link, or resolve this record.'}, promotionCode: { type: 'string', required: false , description: 'Stores the promotion code used to classify, link, or resolve this record.'}, onHand: { type: 'string', required: true , description: 'Stores the on hand value used by this record.'}, reserved: { type: 'string', required: true , description: 'Stores the reserved value used by this record.'}, allocated: { type: 'string', required: true , description: 'Stores the allocated value used by this record.'}, available: { type: 'string', required: true , description: 'Stores the available value used by this record.'}, revision: { type: 'int', required: true , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'} } }),
    inventoryReservation: Object.assign({ super: 'base', model: true, schemaPolicies: ['tenantOwned'], service: { enabled: true }, router: { groups: { schemaOperations: true }, enabled: true }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { backoffice: { operations: ['search', 'read'], description: 'Reservation evidence owned by Inventory lifecycle services.' }, definition: { code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'}, tenant: { type: 'string', required: true , description: 'Identifies the runtime tenant partition that scopes this record.'}, enterpriseCode: { type: 'string', required: false , description: 'Stores the enterprise code used to classify, link, or resolve this record.'}, warehouseCode: { type: 'string', required: true , description: 'Stores the warehouse code used to classify, link, or resolve this record.'}, sku: { type: 'string', required: true , description: 'Stores the SKU used to identify the purchasable product or variant.'}, ownerType: { type: 'string', required: true, enum: ['CART', 'ORDER'] , description: 'Classifies the type of owner responsible for this record.'}, ownerCode: { type: 'string', required: true , description: 'Stores the owner code used to classify, link, or resolve this record.'}, quantity: { type: 'string', required: true , description: 'Stores the quantity value used by this record.'}, status: { type: 'string', required: true, enum: ['ACTIVE', 'CONSUMED', 'RELEASED', 'EXPIRED'] , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'}, expiresAt: { type: 'date', required: false , description: 'Records when the expires event or value applies.'}, idempotencyKey: { type: 'string', required: true , description: 'Stores the idempotency key value used by this record.'}, correlationId: { type: 'string', required: true , description: 'Stores the correlation identifier used to correlate this record.'} } }),
    inventoryMovement: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { groups: { schemaOperations: true }, enabled: true }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { backoffice: { operations: ['search', 'read'], description: 'Append-only stock movement evidence.' }, definition: { code: { type: 'string', required: true , description: 'Uniquely identifies this record for references, APIs, imports, and business administration.'}, tenant: { type: 'string', required: true , description: 'Identifies the runtime tenant partition that scopes this record.'}, warehouseCode: { type: 'string', required: true , description: 'Stores the warehouse code used to classify, link, or resolve this record.'}, sku: { type: 'string', required: true , description: 'Stores the SKU used to identify the purchasable product or variant.'}, quantity: { type: 'string', required: true , description: 'Stores the quantity value used by this record.'}, movementType: { type: 'string', required: true, enum: ['RECEIPT', 'RESERVE', 'RELEASE', 'ALLOCATE', 'SHIP', 'RETURN', 'ADJUST'] , description: 'Classifies this record by movement type for validation and business handling.'}, referenceCode: { type: 'string', required: true , description: 'Stores the reference code used to classify, link, or resolve this record.'}, balanceRevision: { type: 'int', required: true , description: 'Stores the numeric balance revision used by this record.'}, occurredAt: { type: 'date', required: true , description: 'Records when the occurred event or value applies.'}, correlationId: { type: 'string', required: true , description: 'Stores the correlation identifier used to correlate this record.'} } })
} };

// Opening receipts and checkout holds change stock and movement evidence atomically.
for (const name of ['inventoryBalance', 'inventoryMovement', 'inventoryReservation']) {
    module.exports.inventory[name].isVersionedEnabled = false;
    module.exports.inventory[name].transaction = { enabled: true, sideEffects: 'none' };
    module.exports.inventory[name].indexes = {
        individual: { stockIdentity: { name: 'code', enabled: true, options: { unique: true } } }
    };
}
Object.assign(module.exports.inventory.inventoryReservation.definition, {
    ownerId: { type: 'string', required: false, description: 'Signed customer who acquired the Inventory-owned hold.' },
    balanceCode: { type: 'string', required: false, description: 'Exact stock balance atomically changed by this hold.' },
    expectedBalanceRevision: { type: 'int', required: false, description: 'Observed stock revision at original acquisition.' },
    revision: { type: 'int', required: false, description: 'Managed reservation lifecycle revision.' }
});
Object.assign(module.exports.inventory.inventoryReservation.definition, {
    returnedQuantity: { type: 'string', required: false, description: 'Exact cumulative owner-inspected quantity returned against the original shipment.' },
    evidence: { type: 'object', required: false, description: 'Retained dispatch or reviewed reversal identities and their immutable stock movements.' }
});
module.exports.inventory.inventoryMovement.definition.evidence = {
    type: 'object', required: false, description: 'Original reviewed shipment, return receipt, inspection and disposition bindings.'
};
module.exports.inventory.inventoryBalance.indexes.composite = {
    tenant: { name: 'tenant', enabled: true, options: { unique: true } },
    enterpriseCode: { name: 'enterpriseCode', enabled: true, options: { unique: true } },
    warehouseCode: { name: 'warehouseCode', enabled: true, options: { unique: true } },
    sku: { name: 'sku', enabled: true, options: { unique: true } }
};
module.exports.inventory.inventoryMovement.definition.enterpriseCode = {
    type: 'string', required: false, description: 'Business enterprise responsible for this stock movement.'
};
module.exports.inventory.inventoryOpeningReceiptRecord = {
    super: 'base', model: true, isVersionedEnabled: false, schemaPolicies: ['operational'],
    service: { enabled: true }, router: { enabled: false }, cache: { enabled: false },
    event: { enabled: false }, search: { enabled: false }, backoffice: { enabled: false },
    transaction: { enabled: true, sideEffects: 'none' },
    indexes: { individual: { openingIdentity: { name: 'code', enabled: true, options: { unique: true } } } },
    definition: {
        code: { type: 'string', required: true, description: 'Inventory-owned scope and intake identity.' },
        tenant: { type: 'string', required: true, description: 'Runtime partition containing the receipt and stock.' },
        enterpriseCode: { type: 'string', required: true, description: 'Authenticated stock-owning enterprise.' },
        warehouseCode: { type: 'string', required: true, description: 'Activated receiving warehouse.' },
        sku: { type: 'string', required: true, description: 'Activated Product variant SKU.' },
        quantity: { type: 'string', required: true, description: 'Original positive whole-unit receipt quantity.' },
        referenceCode: { type: 'string', required: true, description: 'Pack-owned intake reference, not a fabricated movement snapshot.' },
        intentDigest: { type: 'string', required: true, description: 'Exact immutable pack identity and original intake fingerprint.' },
        balanceCode: { type: 'string', required: true, description: 'Atomically created initial Inventory balance.' },
        movementCode: { type: 'string', required: true, description: 'Atomically retained first-receipt movement.' },
        actorId: { type: 'string', required: true, description: 'Authenticated original receiving operator.' }
    }
};

// Only first-receipt storage admits the bounded human group; generic HTTP mutations remain disabled.
for (const name of ['inventoryBalance', 'inventoryMovement', 'inventoryOpeningReceiptRecord']) {
    module.exports.inventory[name].schemaPolicies.push('openingReceiptHuman');
}

/** Inventory owns retained policy content; nPublish remains lifecycle authority. */
module.exports.inventory.inventoryPolicyRelease = {
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
/** Inventory owns retained policy activation pointer; nPublish remains lifecycle authority. */
module.exports.inventory.inventoryPolicyPointer = {
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
/** Inventory owns retained policy operation evidence; nPublish remains lifecycle authority. */
module.exports.inventory.inventoryPolicyReceipt = {
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
