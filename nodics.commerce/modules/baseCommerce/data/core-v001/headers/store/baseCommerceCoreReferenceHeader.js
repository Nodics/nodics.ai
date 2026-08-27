/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module baseCommerce/data/core-v001/headers/baseCommerceCoreReferenceHeader @description Imports operational Commerce reference records required before Axis capability activation. @layer data-header @owner baseCommerce */
const entry = (schemaName, dataFilePrefix) => ({
    options: { enabled: true, schemaName, operation: 'saveAll', dataFilePrefix },
    query: { code: '$code', tenant: '$tenant' }
});

module.exports = {
    store: {
        baseCommerceStoreData: entry('store', 'baseCommerceStoreData'),
        baseCommerceSalesChannelData: entry('salesChannel', 'baseCommerceSalesChannelData'),
        baseCommercePointOfServiceData: entry('pointOfService', 'baseCommercePointOfServiceData')
    }
};
