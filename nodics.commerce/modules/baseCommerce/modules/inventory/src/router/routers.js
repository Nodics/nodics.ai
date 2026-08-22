/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module inventory/src/router/routers @description Declares internal Inventory publication ingestion APIs. @layer router @owner inventory */
module.exports = {
    inventory: {
        operator: {
            balanceAction: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup'],
                permission: 'commerce.inventory.operate', apiExposure: 'commerceManagement',
                key: '/operator/inventory/balances/:balanceCode/actions/:actionCode', method: 'POST',
                controller: 'DefaultInventoryOperationController', operation: 'balanceAction',
                help: { requestType: 'secured', message: 'Executes Inventory-owned stock operations against a selected balance.' }
            },
            restoreOperational: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup'],
                permission: 'commerce.product.publish', apiExposure: 'commercePublicationIngestion',
                key: '/internal/inventory/publication/operational/restore', method: 'POST',
                controller: 'DefaultInventoryPublicationController', operation: 'restoreOperational',
                help: { requestType: 'secured', message: 'Restores evidenced Inventory operational records into the Online Inventory boundary.' }
            }
        }
    }
};
