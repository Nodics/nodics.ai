/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module wasteCollection/data/sample-v001/records/location/sampleCollectionCentreLocationCategoryData @description Location category used by demo collection-centre samples. @layer data @owner wasteCollection */
module.exports = {
    record0: {
        code: 'COLLECTION_POINT',
        name: { en: 'Collection Point' },
        description: { en: 'Reusable physical place where materials can be dropped off or received.' },
        defaultCapabilityCodes: ['WASTE_COLLECTION'],
        status: 'ACTIVE',
        revision: 1,
        active: true
    }
};
