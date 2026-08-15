/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module pricing/src/router/routers @description Declares internal Pricing publication ingestion APIs. @layer router @owner pricing */
module.exports = {
    pricing: {
        operator: {
            restoreOperational: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup'],
                permission: 'commerce.product.publish', apiExposure: 'commercePublicationIngestion',
                key: '/internal/pricing/publication/operational/restore', method: 'POST',
                controller: 'DefaultPricingPublicationController', operation: 'restoreOperational',
                help: { requestType: 'secured', message: 'Restores evidenced Pricing operational records into the Online Pricing boundary.' }
            }
        }
    }
};
