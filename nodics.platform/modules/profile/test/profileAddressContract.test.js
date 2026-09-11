/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const assert = require('node:assert/strict');

global.ENUMS = { ContactType: { EMAIL: { key: 'EMAIL' }, PHONE: { key: 'PHONE' }, FAX: { key: 'FAX' }, PAGER: { key: 'PAGER' } } };

const profileSchemas = require('../src/schemas/schemas').profile;
const address = profileSchemas.address.definition;

[
    'countryCode',
    'latitude',
    'longitude',
    'geocodingProvider',
    'geocodingReference',
    'geocodingPrecision',
    'geocodingConfidence',
    'verificationStatus',
    'verificationSource',
    'verifiedByRef',
    'verifiedAt',
    'displayPolicy',
    'landmarkHint',
    'accessNotes'
].forEach(field => assert(address[field], `Profile address must own reusable ${field}`));

assert.strictEqual(address.latitude.type, 'number');
assert.strictEqual(address.longitude.type, 'number');
assert.strictEqual(address.countryCode.required, true);
assert.deepStrictEqual(address.verificationStatus.enum, ['UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED', 'STALE']);

assert.strictEqual(address.coordinates, undefined, 'Address must not store unlabeled coordinate arrays');
assert.strictEqual(address.locationRef, undefined, 'Profile address must not point back to Location');
assert.strictEqual(address.primaryLocationRef, undefined, 'Profile address must remain location-agnostic');

console.log('profile address contract passed');
