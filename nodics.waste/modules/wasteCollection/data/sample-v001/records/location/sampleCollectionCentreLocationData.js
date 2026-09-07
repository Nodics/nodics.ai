/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module wasteCollection/data/sample-v001/records/location/sampleCollectionCentreLocationData @description Location records for demo collection centres. @layer data @owner wasteCollection */
const centres = [
    ['YOU_AND_CO', 'You&Co Collection Centre', 25.025768101083198, 55.19116827649078],
    ['AVERDA_NADD_AL_HAMAR', 'Averda Recycling Center - Nadd Al Hamar', 25.2010045, 55.3808318],
    ['AVERDA_METRO_FOOTBRIDGE', 'Averda Recycling Center - Metro Footbridge', 25.2435718, 55.305911],
    ['AVERDA_AL_SAFA', 'Averda Recycling Center - Al Safa', 25.1569903, 55.2277866],
    ['AVERDA_AL_SATWA', 'Averda Recycling Center - Al Satwa', 25.2142245, 55.2741943],
    ['AVERDA_AL_RASHIDIYA', 'Averda Recycling Center - Al Rashidiya', 25.2283473, 55.3938596],
    ['AVERDA_AL_NAHDA_2', 'Averda Recycling Center - Al Nahda 2', 25.2900224, 55.3804174],
    ['AVERDA_MUHAISNAH_1', 'Averda Recycling Center - Muhaisnah 1', 25.2475664, 55.4119074],
    ['EFATE_DEIRA', 'EFATE - Deira', 25.2652343, 55.3213696],
    ['EFATE_SUSTAINABLE_CITY', 'EFATE - The Sustainable City', 25.0275287, 55.2741972],
    ['EFATE_RIGGAT_AL_BUTEEN', 'EFATE - Riggat Al Buteen', 25.2595867, 55.3188193],
    ['EFATE_DUBAI_MARINA', 'EFATE - Dubai Marina', 25.0789633, 55.1378512],
    ['EFATE_AL_QUOZ', 'EFATE - Al Quoz', 25.1534157, 55.235164],
    ['EFATE_AL_QUOZ_1', 'EFATE - Al Quoz 1', 25.1726536, 55.2435134]
];

module.exports = Object.fromEntries(centres.map((centre, index) => ['record' + index, {
    code: 'LOC_SAMPLE_COLLECTION_CENTRE_' + centre[0],
    name: { en: centre[1] },
    categoryCode: 'COLLECTION_POINT',
    typeCode: 'SAMPLE_E_WASTE_DROP_OFF',
    status: 'ACTIVE',
    latitude: centre[2],
    longitude: centre[3],
    addressRef: {
        moduleName: 'profile',
        schemaName: 'address',
        code: 'ADDR_SAMPLE_COLLECTION_CENTRE_' + centre[0]
    },
    contactRefs: [],
    capabilityCodes: ['WASTE_COLLECTION', 'E_WASTE_DROP_OFF'],
    visibility: { audiences: ['PUBLIC', 'AUTHENTICATED', 'BACKOFFICE'] },
    sourceRef: {
        moduleName: 'wasteCollection',
        schemaName: 'wasteCollectionPoint',
        code: 'WCP_SAMPLE_COLLECTION_CENTRE_' + centre[0]
    },
    operatorEnterpriseRef: {
        moduleName: 'profile',
        schemaName: 'enterprise',
        code: 'NODICS_WASTE_MANAGEMENT_CO'
    },
    quality: {
        verificationStatus: 'UNVERIFIED',
        coordinateSource: 'SANITIZED_COLLECTION_CENTRE_EXPORT'
    },
    revision: 1,
    active: true
}]));
