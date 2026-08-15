/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module tax/src/router/routers @description Declares internal Tax publication ingestion APIs. @layer router @owner tax */
module.exports = {
    tax: {
        operator: {
            restoreOperational: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup'],
                permission: 'commerce.product.publish', apiExposure: 'commercePublicationIngestion',
                key: '/internal/tax/publication/operational/restore', method: 'POST',
                controller: 'DefaultTaxPublicationController', operation: 'restoreOperational',
                help: { requestType: 'secured', message: 'Restores evidenced Tax operational policy records into the Online Tax boundary.' }
            }
        }
    }
};
