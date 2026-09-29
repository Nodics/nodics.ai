/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module eWaste/test/eWasteReferenceRelease @description Verifies neutral source adoption through nImport with in-memory ports, independently of any customer checkout. @owner eWaste @layer test */
const assert = require('node:assert/strict');
const test = require('node:test');
const path = require('node:path');
const createHarness = require('./fixtures/referenceReleaseHarness');

test('neutral immutable release is explicit, retains its predecessor and imports without customer records', async () => {
    const state = createHarness({ eWaste: { name: 'eWaste', index: '92.71', path: path.resolve(__dirname, '..') } });
    const discovered = state.service.discoverReleases('core');
    assert.deepEqual(discovered.map(item => item.releaseCode), ['eWaste:core-reference']);
    assert.equal(discovered[0].version, '0.0.1');
    assert.equal(discovered[0].selectionPolicy, 'EXPLICIT');
    const request = { tenant: 'default', releaseRequest: {
        dataType: 'core', releaseCodes: ['eWaste:core-reference'], expectedReleases: { 'eWaste:core-reference': '0.0.1' }
    } };
    await state.service.preflight(request);
    assert.equal(state.imports.length, 0);
    await state.service.execute(request);
    assert.equal(state.models.get('wasteCategory:MOBILE_DEVICE').impactProfileCode, 'EWASTE_ENVIRONMENTAL_ESTIMATE');
    assert.equal(state.models.get('wasteItemType:LOOSE_LITHIUM_BATTERY').impactProfileCode, 'EWASTE_BATTERY_COUNT');
    assert.equal(state.models.has('wasteImpactProfile:CIRCA_EWASTE_ESTIMATE'), false);
    assert.doesNotMatch(JSON.stringify([...state.models.values()]), /CIRCA|Circa/);
    assert.equal(state.installations[0].status, 'CURRENT');
});
