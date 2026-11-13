/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module locationMap/test/locationMapSharedConfigurationContract @description Covers project and application scopes, public read boundaries, concurrency and customization. @layer test @owner locationMap */
const test = require('node:test');
const assert = require('node:assert/strict');
const operation = require('../src/service/defaultLocationMapConfigurationOperationService');
const presentation = require('../src/service/defaultLocationMapPresentationService');
const settings = require('../config/properties');
const seed = require('./fixtures/scopedProviderConfigurations');

test('one shared usage drives every consumer and rejects unsafe or stale edits', async () => {
    const rows = structuredClone([seed.record0, seed.record1]);
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
            save: async () => { throw Error('Project save must update the selected row'); }
        }
    };
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
    const payload = Object.assign({}, rows[0], { surfaceCode: 'SHARED', presentation: custom, interaction: { wheelZoomMode: 'DISABLED' }, expectedRevision: 1 });
    const saved = await operation.saveConfiguration({ tenant: 'default', payload });
    assert.equal(saved.revision, 2);
    assert.equal(rows[0].surfaceCode, 'SHARED');
    const publicResult = await operation.getPublicConfiguration({ tenant: 'default', query: { usageCode: 'COLLECTION_CENTRE_MAP' } });
    const axisResult = await operation.getEffectiveConfiguration({ tenant: 'default', query: { usageCode: 'COLLECTION_CENTRE_MAP', surfaceCode: 'AXIS' } });
    assert.deepEqual(publicResult, { ...axisResult, surfaceCode: 'SHARED' });
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

test('empty repository, layered provider selection and scoped application writes', async () => {
    const usage = 'COLLECTION_CENTRE_MAP';
    const config = structuredClone(settings.locationMapConfiguration);
    const rows = [];
    global.CONFIG = { get: () => config };
    global.SERVICE = {
        DefaultLocationMapPresentationService: presentation,
        DefaultLocationMapConfigurationOperationService: operation,
        DefaultLocationMapProviderConfigurationService: {
            get: async ({ query }) => ({ records: rows.filter(row => row.usageCode === query.usageCode) }),
            save: async ({ model }) => { assert.ok(model.name.en); rows.push(model); }
        }
    };
    const request = surfaceCode => ({ tenant: 'default', query: { usageCode: usage, surfaceCode } });
    const read = surface => operation.getEffectiveConfiguration(request(surface));
    const fresh = await read('AXIS');
    assert.equal(fresh.configurationScope, 'FRAMEWORK');
    assert.equal(fresh.configured, true);
    assert.equal(fresh.publicAccessToken, '');
    assert.equal(fresh.stylePresetCode, 'OSM_HOT');
    assert.match(fresh.renderDescriptor.tileUrlTemplate, /openstreetmap.fr\/hot\//);
    config.projectOverrides[usage] = { providerCode: 'MAPBOX' };
    assert.equal((await read('AXIS')).configured, false);
    config.projectOverrides[usage].publicAccessToken = 'pk.project';
    config.applicationOverrides.CIRCA = { [usage]: { providerCode: 'OSM', defaultZoom: 11 } };
    const circa = await operation.getPublicConfiguration(request('CIRCA'));
    assert.equal(circa.configured, true);
    assert.equal(circa.defaultZoom, 11);
    assert.equal(circa.publicAccessToken, '');
    assert.equal(circa.configurationScope, 'APPLICATION');
    const axis = await read('AXIS');
    assert.equal(axis.configured, true);
    assert.equal(axis.publicAccessToken, 'pk.project');
    assert.equal(axis.configurationScope, 'PROJECT');
    delete config.applicationOverrides.CIRCA[usage].providerCode;
    const inherited = await read('CIRCA');
    assert.equal(inherited.providerScope, 'PROJECT');
    assert.equal(inherited.configurationScope, 'APPLICATION');
    assert.equal(inherited.defaultZoom, 11);
    assert.equal((await operation.getEffectiveConfiguration({ tenant: 'default', query: { usageCode: 'STORE_LOCATOR', surfaceCode: 'CIRCA' } })).configurationScope, 'FRAMEWORK');
    await assert.rejects(operation.getPublicConfiguration(request('AXIS')), /not available publicly/);
    const editable = await operation.getConfiguration(request('CIRCA'));
    const payload = { ...editable, defaultZoom: 12, expectedRevision: 0 };
    const saved = await operation.saveConfiguration({ tenant: 'default', payload });
    assert.equal(saved.defaultZoom, 12);
    assert.equal(rows[0].surfaceCode, 'APP:CIRCA');
    assert.deepEqual(await read('AXIS'), axis);
    await assert.rejects(operation.saveConfiguration({ tenant: 'default', payload: { ...payload, surfaceCode: 'SHARED' } }), /existing shared/);
});

test('unscoped requests use the project row and raw surface rows cannot supply a primary or fallback', async () => {
    const usageCode = 'COLLECTION_CENTRE_MAP';
    const rawAxis = { ...seed.record0, code: 'RAW_AXIS', surfaceCode: 'AXIS', defaultZoom: 15 };
    const rawTile = { ...seed.record1, code: 'RAW_TILE', surfaceCode: 'AXIS', styleUrl: 'https://ignored.example/tiles' };
    const rows = [rawAxis, rawTile];
    global.CONFIG = { get: key => settings[key] };
    global.SERVICE = {
        DefaultLocationMapPresentationService: presentation,
        DefaultLocationMapConfigurationOperationService: operation,
        DefaultLocationMapProviderConfigurationService: {
            get: async () => ({ records: rows }),
            save: async ({ model }) => rows.push(model)
        }
    };
    const request = surfaceCode => ({ tenant: 'default', query: { usageCode, surfaceCode } });
    for (const surface of [undefined, 'SHARED', 'AXIS', 'CIRCA']) {
        assert.equal((await operation.getEffectiveConfiguration(request(surface))).configurationScope, 'FRAMEWORK');
    }
    await assert.rejects(operation.saveConfiguration({ tenant: 'default', payload: { ...rawAxis, surfaceCode: undefined } }), /configuration/);
    const project = await operation.saveConfiguration({ tenant: 'default', payload: { ...seed.record0, surfaceCode: undefined } });
    assert.equal(project.configurationScope, 'PROJECT');
    assert.equal(project.surfaceCode, 'SHARED');
    assert.equal(project.fallbackRenderer.tileUrlTemplate, settings.locationMapConfiguration.providerDefaults.OSM.styleUrl);
    rows.push({ ...seed.record1, surfaceCode: 'APP:AXIS', code: 'AXIS_' + usageCode });
    assert.equal((await operation.getEffectiveConfiguration(request('AXIS'))).providerScope, 'APPLICATION');
    assert.equal((await operation.getEffectiveConfiguration(request('CIRCA'))).providerScope, 'PROJECT');
    assert.deepEqual(await operation.getConfiguration(request()), await operation.getConfiguration(request('SHARED')));
    assert.equal(rawAxis.surfaceCode, 'AXIS');
});
