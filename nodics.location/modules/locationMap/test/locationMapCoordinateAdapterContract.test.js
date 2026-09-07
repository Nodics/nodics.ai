/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module locationMap/test/locationMapCoordinateAdapterContract @description Verifies provider coordinate arrays remain behind the Location Map adapter boundary. @layer test @owner locationMap */
const assert = require('node:assert/strict');
const adapter = require('../src/service/defaultLocationMapCoordinateAdapterService');

const domainPoint = adapter.domainPoint({ latitude: '25.2048', longitude: '55.2708' });
assert.deepStrictEqual(domainPoint, { latitude: 25.2048, longitude: 55.2708 });

const providerPosition = adapter.toProviderPosition(domainPoint);
assert.deepStrictEqual(providerPosition, [55.2708, 25.2048]);

assert.deepStrictEqual(adapter.fromProviderPosition(providerPosition), domainPoint);
assert.deepStrictEqual(adapter.toGeoJsonPoint(domainPoint), {
    type: 'Point',
    coordinates: [55.2708, 25.2048]
});
assert.deepStrictEqual(adapter.fromGeoJsonPoint({
    type: 'Point',
    coordinates: [55.2708, 25.2048]
}), domainPoint);

assert.throws(() => adapter.domainPoint({ coordinates: [55.2708, 25.2048] }), /latitude must be a number/);
assert.throws(() => adapter.fromProviderPosition([25.2048, 181]), /latitude must be a number/);

console.log('Location Map coordinate adapter contract validated');
