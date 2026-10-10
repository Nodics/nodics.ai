/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
'use strict';
/** @module fulfillmentCore/utils/enums @description Physical owner command lifecycle vocabulary. @layer utils @owner fulfillmentCore */
module.exports = {
    PhysicalFulfillmentStatus: {
        _options: { name: 'PhysicalFulfillmentStatus', ignoreCase: false, freez: true },
        definition: ['READY', 'DISPATCH_PENDING', 'SHIPPED', 'CANCELLATION_PENDING', 'RETURN_PENDING', 'WAITING_RECEIPT', 'CANCELLED', 'RETURNED']
    }
};
