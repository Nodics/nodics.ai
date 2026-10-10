/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
'use strict';
/** @module fulfillmentCore/utils/statusDefinitions @description Stable physical and ITEM evidence owner rejection responses. @layer status @owner fulfillmentCore */
module.exports = {
    ERR_FULFILLMENT_PHYSICAL_UNCONFIRMED: { code: '409', message: 'Physical operation requires qualified original owner evidence or reconciliation' },
    ERR_FULFILLMENT_ITEM_DELIVERY_UNCONFIRMED: { code: '409', message: 'Authenticated original Shipment allocation evidence is unavailable or invalid' }
};
