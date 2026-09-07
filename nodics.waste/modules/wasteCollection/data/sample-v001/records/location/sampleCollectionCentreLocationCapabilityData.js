/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module wasteCollection/data/sample-v001/records/location/sampleCollectionCentreLocationCapabilityData @description Location capabilities used by demo collection-centre samples. @layer data @owner wasteCollection */
module.exports = {
    record0: {
        code: 'WASTE_COLLECTION',
        name: { en: 'Waste Collection' },
        description: { en: 'Place supports waste collection or drop-off workflows.' },
        status: 'ACTIVE',
        revision: 1,
        active: true
    },
    record1: {
        code: 'E_WASTE_DROP_OFF',
        name: { en: 'E-Waste Drop-Off' },
        description: { en: 'Place supports electronic-waste drop-off workflows.' },
        status: 'ACTIVE',
        revision: 1,
        active: true
    }
};
