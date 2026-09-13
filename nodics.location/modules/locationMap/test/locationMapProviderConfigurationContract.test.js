/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module locationMap/test/locationMapProviderConfigurationContract @description Verifies Location Map owns schema-driven provider configuration and exposes only frontend-safe effective settings. @layer test @owner locationMap */
const assert = require('node:assert/strict');
const path = require('node:path');

const moduleRoot = path.resolve(__dirname, '..');
const repositoryRoot = path.resolve(moduleRoot, '../../..');
const schemas = require('../src/schemas/schemas').locationMap;
const routers = require('../src/router/routers').locationMap.internal;
const seedConfigurations = require('../data/init-v001/records/location/defaultLocationMapProviderConfigurationData');
const providers = require('../data/core-v001/records/location/locationMapProviderData');
const usages = require('../data/core-v001/records/location/locationMapUsageData');
const styles = require('../data/core-v001/records/location/locationMapStylePresetData');
const controls = require('../data/core-v001/records/location/locationMapControlPresetData');
const backofficeCapabilityData = require('../data/core-v001/records/backoffice/locationMapBackofficeCapabilityData');

assert(schemas.locationMapProvider, 'provider schema must exist');
assert(schemas.locationMapUsage, 'usage schema must exist');
assert(schemas.locationMapStylePreset, 'style preset schema must exist');
assert(schemas.locationMapControlPreset, 'control preset schema must exist');
assert(schemas.locationMapProviderConfiguration, 'provider configuration schema must exist');
assert.strictEqual(schemas.locationMapProviderConfiguration.definition.publicAccessToken.type, 'string');
assert.strictEqual(schemas.locationMapProviderConfiguration.definition.defaultCenterLatitude.type, 'number');
assert.deepStrictEqual(schemas.locationMapProviderConfiguration.definition.setupStatus.enum, ['SETUP_REQUIRED', 'ACTIVE', 'INACTIVE', 'INVALID', 'ARCHIVED']);

assert.strictEqual(providers.record0.code, 'MAPBOX');
assert.strictEqual(providers.record0.rendererCode, 'axis.location.mapbox');
assert.strictEqual(providers.record0.rendererType, 'MAPBOX_GL');
assert.strictEqual(providers.record0.requiresPublicAccessToken, true);
assert.strictEqual(providers.record0.frontendSafeTokenPrefix, 'pk.');
assert.strictEqual(providers.record1.rendererCode, 'axis.location.tile');
assert.strictEqual(providers.record1.rendererType, 'XYZ_TILE');
assert.strictEqual(usages.record0.code, 'COLLECTION_CENTRE_MAP');
assert.strictEqual(styles.record0.styleUrl, 'mapbox://styles/mapbox/streets-v12');
assert.deepStrictEqual(controls.record0.enabledControls, ['FILTERS', 'ZOOM', 'SCALE', 'GEOLOCATE', 'DIRECTIONS']);
assert.strictEqual(seedConfigurations.record0.code, 'AXIS_COLLECTION_CENTRE_MAPBOX_STREETS');
assert.strictEqual(seedConfigurations.record0.publicAccessToken, '');
assert.strictEqual(seedConfigurations.record0.setupStatus, 'SETUP_REQUIRED');
assert.strictEqual(seedConfigurations.record1.code, 'AXIS_COLLECTION_CENTRE_OSM_HOT');
assert.strictEqual(seedConfigurations.record1.providerCode, 'OSM');
assert.strictEqual(seedConfigurations.record1.publicAccessToken, '');
assert.strictEqual(seedConfigurations.record1.setupStatus, 'ACTIVE');

assert.strictEqual(routers.getEffectiveMapConfiguration.key, '/location/maps/configurations/effective');
assert.strictEqual(routers.getEffectiveMapConfiguration.permission, 'system.schema.view');
assert.deepStrictEqual(routers.getEffectiveMapConfiguration.authTokenTypes, ['access', 'service']);
assert.strictEqual(routers.getMapConfiguration.key, '/location/maps/configurations');
assert.strictEqual(routers.getMapConfiguration.method, 'GET');
assert.strictEqual(routers.getMapConfiguration.permission, 'system.schema.view');
assert.strictEqual(routers.saveMapConfiguration.key, '/location/maps/configurations');
assert.strictEqual(routers.saveMapConfiguration.method, 'PUT');
assert.strictEqual(routers.saveMapConfiguration.permission, 'system.schema.manage');
assert.strictEqual(routers.reverseGeocode.key, '/location/maps/reverse-geocode');
assert.strictEqual(routers.reverseGeocode.method, 'GET');
assert.strictEqual(routers.reverseGeocode.permission, 'system.schema.view');

const registered = [];
const repositoryCalls = [];
const externalRequests = [];
let providerRecords = [providers.record0, providers.record1];
let configurationRecords = [Object.assign({}, seedConfigurations.record0, {
    publicAccessToken: 'pk.test-public-token',
    setupStatus: 'ACTIVE'
})];
global.CONFIG = { get: key => require('../config/properties')[key] };
global.SERVICE = {
    DefaultLocationMapPresentationService: require('../src/service/defaultLocationMapPresentationService'),
    DefaultBackofficeCapabilityDefinitionService: require(path.join(repositoryRoot, 'nodics.foundation/modules/nService/src/service/module/defaultBackofficeCapabilityDefinitionService.js')),
    DefaultBackofficeCapabilityDataService: require(path.join(repositoryRoot, 'nodics.foundation/modules/nService/src/service/module/defaultBackofficeCapabilityDataService.js')),
    DefaultModuleRegistrationAgentService: {
        registerBackofficeCapabilityProvider: function (moduleName, provider) {
            registered.push({ moduleName, provider });
        }
    },
    DefaultLocationMapProviderService: {
        get: function (request) {
            repositoryCalls.push({ operation: 'provider-get', request });
            assert.strictEqual(request.tenant, 'default');
            assert.deepStrictEqual(request.query, { status: 'ACTIVE' });
            return Promise.resolve({
                records: providerRecords
            });
        }
    },
    DefaultLocationMapProviderConfigurationService: {
        get: function (request) {
            repositoryCalls.push({ operation: 'get', request });
            assert.strictEqual(request.tenant, 'default');
            if (request.query.code) {
                assert.strictEqual(request.query.code, 'AXIS_COLLECTION_CENTRE_MAPBOX_STREETS');
            } else {
                assert.deepStrictEqual(request.query, {
                    usageCode: 'COLLECTION_CENTRE_MAP',
                    ...(request.query.status ? {status: {$in:['ACTIVE','DRAFT','INACTIVE']}} : {})
                });
            }
            return Promise.resolve({
                records: configurationRecords
            });
        },
        update: function (request) {
            repositoryCalls.push({ operation: 'update', request });
            assert.strictEqual(request.tenant, 'default');
            assert.deepStrictEqual(request.query, { code: 'AXIS_COLLECTION_CENTRE_MAPBOX_STREETS', revision: configurationRecords[0].revision });
            assert.strictEqual(request.model.publicAccessToken, 'pk.updated-public-token');
            configurationRecords[0] = Object.assign({}, configurationRecords[0], request.model, {revision: (configurationRecords[0].revision || 0) + 1});
            return Promise.resolve({ updated: 1 });
        },
        save: function (request) {
            repositoryCalls.push({ operation: 'save', request });
            assert.strictEqual(request.tenant, 'default');
            return Promise.resolve({ saved: 1 });
        }
    },
    DefaultModuleService: {
        buildExternalRequest: function (request) {
            externalRequests.push({ operation: 'buildExternalRequest', request });
            return request;
        },
        fetch: function (request) {
            externalRequests.push({ operation: 'fetch', request });
            assert.strictEqual(request.methodName, 'GET');
            assert.strictEqual(request.maxAttempts, 1);
            assert.strictEqual(request.maxResponseBytes, 32768);
            assert.strictEqual(request.header['Accept-Language'], 'ar');
            return Promise.resolve({
                display_name: 'Palm Jumeirah, Dubai, United Arab Emirates'
            });
        }
    }
};

const backofficeContract = require(path.join(repositoryRoot, 'nodics.platform/modules/backoffice/src/service/contract/defaultBackofficeContractService.js'));
const provider = require('../src/service/defaultLocationMapBackofficeCapabilityService');
const capability = provider.getCapability();

assert.strictEqual(provider.capabilityData(), backofficeCapabilityData);
assert.strictEqual(backofficeCapabilityData.navigation[0].route, '/location/maps');
assert.equal(backofficeContract.validateBackofficeMetadata(capability), true);
assert.strictEqual(capability.capabilityId, 'location-map');
assert.deepStrictEqual(capability.requiredPermissions, ['system.schema.view']);
const byId = Object.fromEntries(capability.navigation.map(item => [item.id, item]));
assert.strictEqual(byId['location-map'].group.id, 'system-configuration');
assert.strictEqual(byId['location-map'].group.label, 'System Configuration');
assert.strictEqual(byId['location-map'].workbenchTarget.moduleName, 'locationMap');
assert.strictEqual(byId['location-map'].workbenchTarget.schemaName, 'locationMapProviderConfiguration');
assert.strictEqual(byId['location-map-providers'].workbenchTarget.schemaName, 'locationMapProvider');
assert.strictEqual(byId['location-map-usages'].workbenchTarget.schemaName, 'locationMapUsage');
assert.strictEqual(byId['location-map-styles'].workbenchTarget.schemaName, 'locationMapStylePreset');
assert.strictEqual(byId['location-map-controls'].workbenchTarget.schemaName, 'locationMapControlPreset');
assert.strictEqual(provider.init().then instanceof Function, true);
assert.strictEqual(registered[0].moduleName, 'locationMap');

const service = require('../src/service/defaultLocationMapConfigurationOperationService');
service.getEffectiveConfiguration({
    tenant: 'default',
    query: { surfaceCode: 'AXIS', usageCode: 'COLLECTION_CENTRE_MAP' },
    authData: { userGroups: ['employeeUserGroup'] }
}).then(result => {
    assert.strictEqual(result.configured, true);
    assert.strictEqual(result.publicAccessToken, 'pk.test-public-token');
    assert.strictEqual(result.providerCode, 'MAPBOX');
    assert.strictEqual(result.rendererCode, 'axis.location.mapbox');
    assert.strictEqual(result.rendererType, 'MAPBOX_GL');
    assert.strictEqual(result.renderDescriptor.rendererCode, 'axis.location.mapbox');
    assert.strictEqual(result.renderDescriptor.rendererType, 'MAPBOX_GL');
    assert.strictEqual(result.fallbackRenderer.providerCode, 'OSM');
    assert.strictEqual(result.fallbackRenderer.rendererCode, 'axis.location.tile');
    assert.strictEqual(result.styleUrl, 'mapbox://styles/mapbox/streets-v12');
    assert.strictEqual(result.defaultCenter.latitude, 25.2048);
    assert(!Object.prototype.hasOwnProperty.call(result, 'tokenReference'), 'tokenReference must not be exposed');
    return service.getConfiguration({
        tenant: 'default',
        query: { surfaceCode: 'AXIS', usageCode: 'COLLECTION_CENTRE_MAP' }
    });
}).then(result => {
    assert.strictEqual(result.code, 'AXIS_COLLECTION_CENTRE_MAPBOX_STREETS');
    assert.strictEqual(result.configured, true);
    assert.strictEqual(result.providerOptions.length, 2);
    assert.strictEqual(result.providerOptions[0].rendererCode, 'axis.location.mapbox');
    return service.saveConfiguration({
        tenant: 'default',
        payload: Object.assign({}, seedConfigurations.record0, {
            publicAccessToken: 'pk.updated-public-token',
            setupStatus: 'ACTIVE'
        })
    });
}).then(result => {
    assert.strictEqual(result.publicAccessToken, 'pk.updated-public-token');
    assert(repositoryCalls.some(call => call.operation === 'update'), 'saveConfiguration must update an existing configuration');

    assert.throws(() => service.publicAccessToken({ providerCode: 'MAPBOX', publicAccessToken: 'sk.secret' }), /Secret map provider tokens/);
    assert.throws(() => service.publicAccessToken({ providerCode: 'MAPBOX', publicAccessToken: 'bad-token' }), /must start with pk/);
    assert.throws(() => service.model({
        payload: Object.assign({}, seedConfigurations.record0, {
            setupStatus: 'ACTIVE',
            publicAccessToken: ''
        })
    }), /publicAccessToken is required/);
    providerRecords = [];
    configurationRecords = [Object.assign({}, seedConfigurations.record1, {
        surfaceCode: 'SHARED',
        setupStatus: 'ACTIVE',
        status: 'ACTIVE'
    })];
    return service.getEffectiveConfiguration({
        tenant: 'default',
        query: { surfaceCode: 'AXIS', usageCode: 'COLLECTION_CENTRE_MAP' },
        authData: { userGroups: ['employeeUserGroup'] }
    });
}).then(result => {
    assert.strictEqual(result.configured, true);
    assert.strictEqual(result.providerCode, 'OSM');
    assert.strictEqual(result.rendererCode, 'axis.location.tile');
    assert.strictEqual(result.rendererType, 'XYZ_TILE');
    assert.strictEqual(result.renderDescriptor.tileUrlTemplate, 'https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png');
    return service.reverseGeocode({
        tenant: 'default',
        query: {
            surfaceCode: 'AXIS',
            usageCode: 'COLLECTION_CENTRE_MAP',
            locale: 'ar',
            latitude: 25.12429,
            longitude: 55.41021
        },
        authData: { userGroups: ['employeeUserGroup'] }
    });
}).then(result => {
    assert.strictEqual(result.status, 'RESOLVED');
    assert.strictEqual(result.address, 'Palm Jumeirah, Dubai, United Arab Emirates');
    assert.strictEqual(result.providerCode, 'OSM');
    assert.strictEqual(result.fallbackUsed, false);
    assert(externalRequests.some(call => call.operation === 'fetch'), 'reverse geocode must use the shared Nodics external transport');
    assert(externalRequests.some(call => call.request.uri && call.request.uri.includes('nominatim.openstreetmap.org/reverse')), 'OSM reverse geocode URL must be used for the OSM renderer');
    assert(externalRequests.some(call => call.request.uri && call.request.uri.includes('accept-language=ar')), 'OSM reverse geocode URL must request the selected Axis locale');
    console.log('Location Map provider configuration contract validated');
}).catch(error => {
    console.error(error);
    process.exitCode = 1;
});
