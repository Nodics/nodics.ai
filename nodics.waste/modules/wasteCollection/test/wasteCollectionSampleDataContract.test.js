/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module wasteCollection/test/wasteCollectionSampleDataContract @description Verifies collection-centre samples stay linked and split by runtime authority. @layer test @owner wasteCollection */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const moduleRoot = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(moduleRoot, 'data/manifest.json'), 'utf8'));
const packageJson = JSON.parse(fs.readFileSync(path.join(moduleRoot, 'package.json'), 'utf8'));
const addressHeader = require('../data/sample-v001/headers/profile/sampleCollectionCentreAddressHeader');
const locationHeader = require('../data/sample-v001/headers/location/sampleCollectionCentreLocationHeader');
const pointHeader = require('../data/sample-v001/headers/waste/sampleCollectionCentrePointHeader');
const addresses = require('../data/sample-v001/records/profile/sampleCollectionCentreAddressData');
const locationCategories = require('../data/sample-v001/records/location/sampleCollectionCentreLocationCategoryData');
const locationCapabilities = require('../data/sample-v001/records/location/sampleCollectionCentreLocationCapabilityData');
const locationTypes = require('../data/sample-v001/records/location/sampleCollectionCentreLocationTypeData');
const locations = require('../data/sample-v001/records/location/sampleCollectionCentreLocationData');
const pointTypes = require('../data/sample-v001/records/waste/sampleCollectionCentrePointTypeData');
const points = require('../data/sample-v001/records/waste/sampleCollectionCentrePointData');

function values(records) {
    return Object.keys(records).sort().map(key => records[key]);
}

assert(packageJson.nodics.owns.includes('data'), 'wasteCollection must declare sample data ownership');
assert.equal(manifest.sections['sample-profile-addresses'].destinationRole, 'PLATFORM');
assert.equal(manifest.sections['sample-locations'].destinationRole, 'LOCATION');
assert.equal(manifest.sections['sample-collection-points'].destinationRole, 'WASTE');

assert.equal(addressHeader.profile.sampleCollectionCentreAddressData.options.moduleName, 'profile');
assert.equal(addressHeader.profile.sampleCollectionCentreAddressData.options.schemaName, 'address');
assert.equal(locationHeader.locationType.sampleCollectionCentreLocationCategoryData.options.schemaName, 'locationCategory');
assert.equal(locationHeader.locationType.sampleCollectionCentreLocationCapabilityData.options.schemaName, 'locationCapability');
assert.equal(locationHeader.locationType.sampleCollectionCentreLocationTypeData.options.schemaName, 'locationType');
assert.equal(locationHeader.locationCore.sampleCollectionCentreLocationData.options.moduleName, 'locationCore');
assert.equal(locationHeader.locationCore.sampleCollectionCentreLocationData.options.schemaName, 'location');
assert.equal(pointHeader.wasteCollection.sampleCollectionCentrePointData.options.moduleName, 'wasteCollection');
assert.equal(pointHeader.wasteCollection.sampleCollectionCentrePointData.options.schemaName, 'wasteCollectionPoint');

const addressRecords = values(addresses);
const locationRecords = values(locations);
const pointRecords = values(points);
assert.equal(addressRecords.length, 17);
assert.equal(locationRecords.length, 17);
assert.equal(pointRecords.length, 17);
assert.equal(values(locationCategories).length, 1);
assert.equal(values(locationCapabilities).length, 2);
assert.equal(values(locationTypes).length, 1);
assert.equal(values(pointTypes).length, 1);
assert.equal(locationTypes.record0.code, 'SAMPLE_E_WASTE_DROP_OFF');
assert.equal(pointTypes.record0.code, 'SAMPLE_E_WASTE_DROP_OFF');

const addressCodes = new Set(addressRecords.map(record => record.code));
const locationCodes = new Set(locationRecords.map(record => record.code));

addressRecords.forEach(record => {
    assert.equal(record.countryCode, 'AE');
    assert.equal(typeof record.latitude, 'number');
    assert.equal(typeof record.longitude, 'number');
    assert.equal(record.tenant, undefined);
    assert.equal(Array.isArray(record.coordinates), false);
});

locationRecords.forEach(record => {
    assert.equal(record.status, 'ACTIVE');
    assert.equal(typeof record.latitude, 'number');
    assert.equal(typeof record.longitude, 'number');
    assert.equal(record.tenant, undefined);
    assert.equal(Array.isArray(record.coordinates), false);
    assert(addressCodes.has(record.addressRef.code), record.code + ' must reference a seeded Profile address');
    assert.equal(record.sourceRef.moduleName, 'wasteCollection');
    assert.equal(record.sourceRef.schemaName, 'wasteCollectionPoint');
    assert.equal(record.sourceRef.tenant, undefined);
});

pointRecords.forEach(record => {
    assert.equal(record.collectionPointType, 'SAMPLE_E_WASTE_DROP_OFF');
    assert.equal(record.tenant, undefined);
    assert.equal(record.locationRef.moduleName, 'locationCore');
    assert.equal(record.locationRef.schemaName, 'location');
    assert(locationCodes.has(record.locationRef.code), record.code + ' must reference a seeded Location record');
    assert.equal(record.operatorEnterpriseRef.moduleName, 'profile');
    assert.equal(record.operatorEnterpriseRef.schemaName, 'enterprise');
    assert.equal(record.operatorEnterpriseRef.code, 'NODICS_WASTE_MANAGEMENT_CO');
    assert.equal(record.assetOwnerEnterpriseRef.moduleName, 'profile');
    assert.equal(record.assetOwnerEnterpriseRef.schemaName, 'enterprise');
    assert.equal(record.assetOwnerEnterpriseRef.code, 'BEAH_RECYCLING_SERVICES');
});

console.log('Waste Collection sample data contract validated');
