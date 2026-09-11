/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module locationMap/test/locationMapSharedConfigurationContract @description Covers shared configuration migration, public read boundaries, concurrency and customization. @layer test @owner locationMap */
const test = require('node:test');
const assert = require('node:assert/strict');
const operation = require('../src/service/defaultLocationMapConfigurationOperationService');
const presentation = require('../src/service/defaultLocationMapPresentationService');
const settings = require('../config/properties');
const seed = require('../data/init-v001/records/location/defaultLocationMapProviderConfigurationData');

test('one shared usage drives every consumer and rejects unsafe or stale edits', async () => {
    const rows = [Object.assign({}, seed.record0, { surfaceCode: 'AXIS' }), Object.assign({}, seed.record1, { surfaceCode: 'AXIS' })];
    global.CONFIG = { get: key => settings[key] };
    global.SERVICE = {
        DefaultLocationMapPresentationService: presentation,
        DefaultLocationMapConfigurationOperationService: operation,
        DefaultLocationMapProviderConfigurationService: {
            get: async () => ({ records: rows }),
            update: async request => {
                const row = rows.find(row => row.code === request.query.code && row.revision === request.query.revision);
                assert(row, 'updates must retain the optimistic revision predicate');
                Object.assign(row, request.model, { revision: row.revision + 1 });
                return { updated: 1 };
            },
            save: async () => { throw Error('Migration must update the existing record'); }
        }
    };
    // An active fallback must not replace the legacy primary preference.
    const original = await operation.getEffectiveConfiguration({ tenant: 'default', query: { usageCode: 'COLLECTION_CENTRE_MAP', surfaceCode: 'CIRCA' } });
    assert.equal(original.code, seed.record0.code);
    assert.equal(original.providerCode, 'MAPBOX');
    assert.equal(original.fallbackAllowed, true);
    assert.match(original.fallbackRenderer.attribution, /OpenStreetMap/);
    const unsafe = operation.renderDescriptor(seed.record1, { providerType: 'OSM', metadata: { attribution: '<img onerror=alert(1)>' } });
    assert(!unsafe.attribution.includes('<'));
    assert(unsafe.attribution.includes('&lt;'));
    const custom = structuredClone(original.presentation);
    custom.categories[0].label = 'Device repair';
    custom.categories[0].color = '#8033aa';
    const payload = Object.assign({}, rows[0], { presentation: custom, interaction: { wheelZoomMode: 'DISABLED' }, expectedRevision: 1 });
    const saved = await operation.saveConfiguration({ tenant: 'default', payload });
    assert.equal(saved.revision, 2);
    assert.equal(rows[0].surfaceCode, 'SHARED');
    const publicResult = await operation.getPublicConfiguration({ tenant: 'default', query: { usageCode: 'COLLECTION_CENTRE_MAP' } });
    const axisResult = await operation.getEffectiveConfiguration({ tenant: 'default', query: { usageCode: 'COLLECTION_CENTRE_MAP', surfaceCode: 'AXIS' } });
    assert.deepEqual(publicResult, axisResult);
    assert.equal(publicResult.presentation.categories[0].label, 'Device repair');
    assert.equal(publicResult.interaction.wheelZoomMode, 'DISABLED');
    assert(!('metadata' in publicResult));
    assert(!('tokenReference' in publicResult));
    await assert.rejects(operation.saveConfiguration({ tenant: 'default', payload }), /changed/);
    await assert.rejects(operation.saveConfiguration({ tenant: 'default', payload: { ...payload, code: 'SECOND_SHARED' } }), /existing shared/);
    await assert.rejects(operation.getPublicConfiguration({ tenant: 'default', query: { usageCode: 'STAFF_PRIVATE_MAP' } }), /not available publicly/);
    assert.throws(() => presentation.presentation({ ...custom, categories: [{ ...custom.categories[0], color: 'url(javascript:alert(1))' }] }), /colors/);
    assert.throws(() => presentation.interaction({ wheelStep: Infinity }), /supported range/);
    const inactive = operation.publicProjection({ ...rows[0], status: 'INACTIVE' }, operation.providerByCode([], 'MAPBOX'));
    assert.equal(inactive.configured, false);
    assert.equal(inactive.fallbackAllowed, false);
});
