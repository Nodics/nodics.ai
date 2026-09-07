/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module locationMap/data/core-v001/records/location/locationMapUsageData @description Reusable Location Map usage codes for backend-driven map consumers. @layer data @owner locationMap */
module.exports = {
    record0: {
        code: 'COLLECTION_CENTRE_MAP',
        name: { en: 'Collection Centre Map' },
        surfaceCodes: ['AXIS', 'CIRCA', 'NEXUS', 'AGORA'],
        description: { en: 'Map experience for waste collection centres, drop-off points, and partner collection locations.' },
        status: 'ACTIVE',
        revision: 1
    },
    record1: {
        code: 'STORE_LOCATOR',
        name: { en: 'Store Locator' },
        surfaceCodes: ['AXIS', 'NEXUS', 'AGORA'],
        description: { en: 'Map experience for customer-facing and back-office store locator journeys.' },
        status: 'ACTIVE',
        revision: 1
    },
    record2: {
        code: 'CUSTOMER_NEAR_ME',
        name: { en: 'Customer Near Me' },
        surfaceCodes: ['CIRCA', 'NEXUS', 'AGORA'],
        description: { en: 'Map experience for customer location checks and nearby service discovery.' },
        status: 'ACTIVE',
        revision: 1
    }
};
