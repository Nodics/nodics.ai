/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module wasteCollection/data/sample-v001/records/waste/sampleCollectionCentrePointData @description Demo collection-centre records contributed by Waste Collection. @layer data @owner wasteCollection */
const centres = [
    ['YOU_AND_CO', 'You&Co Collection Centre'],
    ['AVERDA_NADD_AL_HAMAR', 'Averda Recycling Center - Nadd Al Hamar'],
    ['AVERDA_METRO_FOOTBRIDGE', 'Averda Recycling Center - Metro Footbridge'],
    ['AVERDA_AL_SAFA', 'Averda Recycling Center - Al Safa'],
    ['AVERDA_AL_SATWA', 'Averda Recycling Center - Al Satwa'],
    ['AVERDA_AL_RASHIDIYA', 'Averda Recycling Center - Al Rashidiya'],
    ['AVERDA_AL_NAHDA_2', 'Averda Recycling Center - Al Nahda 2'],
    ['AVERDA_MUHAISNAH_1', 'Averda Recycling Center - Muhaisnah 1'],
    ['EFATE_DEIRA', 'EFATE - Deira'],
    ['EFATE_SUSTAINABLE_CITY', 'EFATE - The Sustainable City'],
    ['EFATE_RIGGAT_AL_BUTEEN', 'EFATE - Riggat Al Buteen'],
    ['EFATE_DUBAI_MARINA', 'EFATE - Dubai Marina'],
    ['EFATE_AL_QUOZ', 'EFATE - Al Quoz'],
    ['EFATE_AL_QUOZ_1', 'EFATE - Al Quoz 1'],
    ['DU_TELECOM_DIAC', 'DU Telecom - Dubai International Academic City'],
    ['DU_HQ_DUBAI_HILLS', 'DU HQ - Dubai Hills'],
    ['AL_HAWAI_RESIDENCE_BARSHA_HEIGHTS', 'Al-Hawai Residence - Barsha Heights']
];

const operatorEnterpriseRef = {
    moduleName: 'profile',
    schemaName: 'enterprise',
    code: 'NODICS_WASTE_MANAGEMENT_CO'
};

const assetOwnerEnterpriseRef = {
    moduleName: 'profile',
    schemaName: 'enterprise',
    code: 'BEAH_RECYCLING_SERVICES'
};

module.exports = Object.fromEntries(centres.map((centre, index) => ['record' + index, {
    code: 'WCP_SAMPLE_COLLECTION_CENTRE_' + centre[0],
    name: { en: centre[1] },
    collectionPointType: 'SAMPLE_E_WASTE_DROP_OFF',
    locationRef: {
        moduleName: 'locationCore',
        schemaName: 'location',
        code: 'LOC_SAMPLE_COLLECTION_CENTRE_' + centre[0]
    },
    operatorEnterpriseRef,
    assetOwnerEnterpriseRef,
    acceptanceSummary: {
        en: 'Demo e-waste drop-off point. Acceptance policy is owned by Waste Collection rules.'
    },
    operatingStatus: 'ACTIVE',
    publicVisibility: 'PUBLIC',
    serviceCapabilities: ['DROP_OFF', 'RECEIPT'],
    status: 'ACTIVE',
    revision: 1,
    active: true
}]));
