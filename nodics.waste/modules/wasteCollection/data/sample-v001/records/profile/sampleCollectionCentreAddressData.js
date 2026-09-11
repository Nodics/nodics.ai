/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module wasteCollection/data/sample-v001/records/profile/sampleCollectionCentreAddressData @description Profile address records for demo collection centres. @layer data @owner wasteCollection */
const centres = [
    ['YOU_AND_CO', 'You&Co - Dubai Production City - Dubai', 25.025768101083198, 55.19116827649078],
    ['AVERDA_NADD_AL_HAMAR', '34 14B St - Nadd Al Hamar - Dubai', 25.2010045, 55.3808318],
    ['AVERDA_METRO_FOOTBRIDGE', '68V4+C9F - Metro Footbridge - Al Karama - Dubai', 25.2435718, 55.305911],
    ['AVERDA_AL_SAFA', '62 18C St - Al Safa - Al Safa 2 - Dubai', 25.1569903, 55.2277866],
    ['AVERDA_AL_SATWA', '677F+MMP - 308th Rd - Al Satwa - Dubai', 25.2142245, 55.2741943],
    ['AVERDA_AL_RASHIDIYA', '63 49C St - Al Rashidiya - Dubai', 25.2283473, 55.3938596],
    ['AVERDA_AL_NAHDA_2', '304 19A St - Al Nahda - Al Nahda 2 - Dubai', 25.2900224, 55.3804174],
    ['AVERDA_MUHAISNAH_1', '27 33rd St - Muhaisnah - Muhaisnah 1 - Dubai', 25.2475664, 55.4119074],
    ['EFATE_DEIRA', 'Al Rigga Rd - Deira - Dubai', 25.2652343, 55.3213696],
    ['EFATE_SUSTAINABLE_CITY', 'The Sustainable City - Dubai', 25.0275287, 55.2741972],
    ['EFATE_RIGGAT_AL_BUTEEN', 'Al Gurg Tower 2 - 1 Baniyas Rd - Deira - Riggat Al Buteen - Dubai', 25.2595867, 55.3188193],
    ['EFATE_DUBAI_MARINA', 'King Salman Bin Abdulaziz Al Saud St - Dubai Marina - Dubai', 25.0789633, 55.1378512],
    ['EFATE_AL_QUOZ', '8th Street - next to Aramtec - Al Quoz - Al Quoz Industrial Area 1 - Dubai', 25.1534157, 55.235164],
    ['EFATE_AL_QUOZ_1', 'Mezzanine Floor Galadari Automobiles - Sheikh Zayed Rd - Al Quoz 1 - Dubai', 25.1726536, 55.2435134],
    ['DU_TELECOM_DIAC', 'DU Telecom, Dubai International Academic City, Dubai Emirate, United Arab Emirates', 25.124214, 55.410174, 'USER_PROVIDED'],
    ['DU_HQ_DUBAI_HILLS', 'DU HQ, Business Park Building - 2, Dubai Hills - Dubai', 25.1066875, 55.2408125, 'USER_PROVIDED'],
    ['AL_HAWAI_RESIDENCE_BARSHA_HEIGHTS', 'Al-Hawai Residence, Barsha Heights, Dubai', 25.0981741, 55.1757884, 'USER_PROVIDED']
];

module.exports = Object.fromEntries(centres.map((centre, index) => ['record' + index, {
    code: 'ADDR_SAMPLE_COLLECTION_CENTRE_' + centre[0],
    type: 'COLLECTION_POINT',
    isPrimery: true,
    active: true,
    addressLine1: centre[1],
    city: 'Dubai',
    state: 'Dubai',
    postalCode: '00000',
    countryCode: 'AE',
    latitude: centre[2],
    longitude: centre[3],
    geocodingProvider: centre[4] || 'SANITIZED_COLLECTION_CENTRE_EXPORT',
    geocodingPrecision: 'POINT',
    geocodingConfidence: 0.6,
    verificationStatus: 'UNVERIFIED',
    verificationSource: centre[4] || 'SANITIZED_COLLECTION_CENTRE_EXPORT',
    displayPolicy: { publicVisibility: 'PUBLIC', redaction: 'NONE' }
}]));
