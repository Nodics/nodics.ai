/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module wasteCollection/data/sample-v001/records/waste/sampleCollectionCentrePointTypeData @description Collection point type used by demo collection-centre samples. @layer data @owner wasteCollection */
module.exports = {
    record0: {
        code: 'SAMPLE_E_WASTE_DROP_OFF',
        name: { en: 'Sample E-Waste Drop-Off' },
        description: { en: 'Demo collection-centre point type for public e-waste drop-off locations.' },
        baseLocationCategory: 'COLLECTION_POINT',
        capabilities: ['DROP_OFF', 'RECEIPT'],
        locationTypeCode: 'SAMPLE_E_WASTE_DROP_OFF',
        status: 'ACTIVE',
        revision: 1,
        active: true
    }
};
