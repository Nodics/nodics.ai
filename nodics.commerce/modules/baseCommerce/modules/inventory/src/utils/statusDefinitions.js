/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module inventory/utils/statusDefinitions @description Stable Inventory authority and persistence rejection vocabulary. @layer status @owner inventory */
module.exports = {
    ERR_INVENTORY_RETURN_UNQUALIFIED: { code: '409', message: 'Inventory RETURN requires qualified shipment, receipt and disposition authority' },
    ERR_INVENTORY_RESERVATION_UNCONFIRMED: { code: '409', message: 'Inventory reservation could not be confirmed' },
    ERR_INVENTORY_OPENING_INVALID: { code: '422', message: 'Opening stock instruction is invalid' },
    ERR_INVENTORY_OPENING_UNAVAILABLE: { code: '503', message: 'Opening stock requires available atomic Inventory persistence' },
    ERR_INVENTORY_OPENING_POLICY: { code: '409', message: 'Opening stock requires the selected activated Product and warehouse policy' },
    ERR_INVENTORY_OPENING_CONFLICT: { code: '409', message: 'Opening stock conflicts with retained Inventory evidence' }
};
