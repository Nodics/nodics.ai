/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module inventory/src/interceptors/interceptors @description Checks effective Staged policy storage before generated authoring writes. @layer interceptors @owner inventory */
module.exports = {
    warehousePublicationpreSave: { type: 'schema', item: 'warehouse', trigger: 'preSave', active: 'true', index: -30,
        handler: 'DefaultInventoryPublicationService.validateSourceAuthoring' },
    warehousePublicationpreUpdate: { type: 'schema', item: 'warehouse', trigger: 'preUpdate', active: 'true', index: -30,
        handler: 'DefaultInventoryPublicationService.validateSourceAuthoring' },
};

// Operational stores must never be persisted by a Staged policy runtime.
for (const item of ['inventoryBalance', 'inventoryMovement', 'inventoryReservation']) {
    for (const trigger of ['preSave', 'preUpdate', 'preRemove']) {
        module.exports[item + trigger] = { type: 'schema', item, trigger,
            active: 'true', index: -20,
            handler: 'DefaultInventoryOperationService.requireOperationalRuntime' };
    }
}
