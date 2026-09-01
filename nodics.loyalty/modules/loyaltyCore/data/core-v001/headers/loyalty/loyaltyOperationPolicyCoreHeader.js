/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module loyaltyCore/data/core-v001/headers/loyaltyOperationPolicyCoreHeader @description Imports default Loyalty operation policy records. @layer data-header @owner loyaltyCore */
const entry = (schemaName, dataFilePrefix) => ({
    options: { enabled: true, schemaName, operation: 'saveAll', dataFilePrefix },
    query: { code: '$code' }
});

module.exports = {
    loyaltyCore: {
        loyaltyOperationPolicyCoreData: entry('loyaltyOperationPolicy', 'loyaltyOperationPolicyCoreData')
    }
};
