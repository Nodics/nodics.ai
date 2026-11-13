/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module eWaste/data/core-v001/records/location/eWasteDropOffTypeData @description Provides reusable locationType vocabulary. @layer data @owner eWaste */
module.exports = {
    record0: {
        code: 'E_WASTE_DROP_OFF',
        categoryCode: 'COLLECTION_POINT',
        name: { en: 'E-Waste Drop-Off' },
        description: { en: 'Map location type for public e-waste drop-off points.' },
        defaultCapabilityCodes: ['WASTE_COLLECTION', 'E_WASTE_DROP_OFF'],
        registrationSource: {
            moduleName: 'wasteCollection',
            schemaName: 'wasteCollectionPointType',
            code: 'E_WASTE_DROP_OFF'
        },
        status: 'ACTIVE',
        revision: 1,
        active: true
    }
};
