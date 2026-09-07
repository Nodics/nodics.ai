/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module locationMap/src/service/defaultLocationMapConfigurationOperationService @description Resolves frontend-safe effective map provider configuration owned by Location Map. @layer service @owner locationMap */
module.exports = {
    /** Throws a Nodics-compatible error when available. */
    fail: function (code, message) {
        let error = typeof CLASSES !== 'undefined' && CLASSES.NodicsError ? new CLASSES.NodicsError(code, message) : new Error(message);
        error.code = code;
        throw error;
    },

    /** Returns the generated persistence service for map provider configuration records. */
    repository: function () {
        if (typeof SERVICE === 'undefined' || !SERVICE.DefaultLocationMapProviderConfigurationService) {
            this.fail('ERR_LOCATION_MAP_CONFIGURATION_REPOSITORY_REQUIRED', 'Location map provider configuration persistence service is required');
        }
        return SERVICE.DefaultLocationMapProviderConfigurationService;
    },

    /** Returns the generated persistence service for map provider metadata records. */
    providerRepository: function () {
        if (typeof SERVICE === 'undefined' || !SERVICE.DefaultLocationMapProviderService) {
            return undefined;
        }
        return SERVICE.DefaultLocationMapProviderService;
    },

    /** Returns built-in provider metadata that keeps core renderers available before editable provider rows are loaded. */
    builtinProviders: function () {
        return [
            {
                code: 'MAPBOX',
                name: { en: 'Mapbox' },
                providerType: 'MAPBOX',
                rendererCode: 'axis.location.mapbox',
                rendererType: 'MAPBOX_GL',
                requiresPublicAccessToken: true,
                frontendSafeTokenPrefix: 'pk.',
                endpointPolicy: {
                    connectSrc: ['https://api.mapbox.com', 'https://events.mapbox.com'],
                    imgSrc: ['https://api.mapbox.com', 'https://*.tiles.mapbox.com']
                },
                status: 'ACTIVE'
            },
            {
                code: 'OSM',
                name: { en: 'OpenStreetMap' },
                providerType: 'OSM',
                rendererCode: 'axis.location.tile',
                rendererType: 'XYZ_TILE',
                requiresPublicAccessToken: false,
                frontendSafeTokenPrefix: '',
                endpointPolicy: {
                    imgSrc: ['https://a.tile.openstreetmap.fr']
                },
                status: 'ACTIVE'
            }
        ];
    },

    /** Merges persisted provider records over built-in renderer defaults. */
    providersWithDefaults: function (providers) {
        let defaults = this.builtinProviders();
        let byCode = {};
        defaults.forEach(provider => {
            byCode[this.text(provider.code)] = Object.assign({}, provider);
        });
        (providers || []).forEach(provider => {
            let code = this.text(provider && provider.code);
            if (!code) return;
            byCode[code] = Object.assign({}, byCode[code] || {}, provider);
        });
        return Object.keys(byCode).sort().map(code => byCode[code]);
    },

    /** Builds runtime context for generated service calls. */
    context: function (request) {
        request = request || {};
        let tenant = request.tenant || request.authData && request.authData.tenant;
        if (!tenant) this.fail('ERR_LOCATION_MAP_RUNTIME_TENANT_REQUIRED', 'Runtime tenant context is required');
        return { tenant: tenant, authData: request.authData };
    },

    /** Unwraps generated responses into an array without binding to one persistence envelope. */
    records: function (response) {
        let value = response;
        for (let index = 0; index < 4 && value && typeof value === 'object' && !Array.isArray(value); index++) {
            if (value.result !== undefined) {
                value = value.result;
                continue;
            }
            if (value.data !== undefined) {
                value = value.data;
                continue;
            }
            break;
        }
        if (!value) return [];
        if (value.records && Array.isArray(value.records)) return value.records;
        if (value.items && Array.isArray(value.items)) return value.items;
        return Array.isArray(value) ? value : [value];
    },

    /** Resolves active provider metadata records when the provider schema is available. */
    providers: function (context) {
        let repository = this.providerRepository();
        if (!repository) return Promise.resolve(this.providersWithDefaults([]));
        return repository.get(Object.assign({}, context, {
            query: { status: 'ACTIVE' },
            searchOptions: { limit: 100, sort: { code: 1 } }
        })).then(response => this.providersWithDefaults(this.records(response)));
    },

    /** Returns a trimmed string value. */
    text: function (value) {
        return typeof value === 'string' ? value.trim() : '';
    },

    /** Returns an optional numeric value within a bounded range. */
    optionalNumber: function (value, field, min, max, fallback) {
        if (value === undefined || value === null || value === '') return fallback;
        let numeric = typeof value === 'number' ? value : Number(value);
        if (!Number.isFinite(numeric) || numeric < min || numeric > max) {
            this.fail('ERR_LOCATION_MAP_NUMBER_INVALID', field + ' must be a number between ' + min + ' and ' + max);
        }
        return numeric;
    },

    /** Returns a required text field, using a default when supplied. */
    requiredText: function (value, field, fallback) {
        let text = this.text(value || fallback);
        if (!text) this.fail('ERR_LOCATION_MAP_FIELD_REQUIRED', field + ' is required');
        return text;
    },

    /** Validates frontend-safe public token shape. */
    publicAccessToken: function (record) {
        let token = this.text(record && record.publicAccessToken);
        if (!token) return '';
        if (token.indexOf('sk.') === 0) this.fail('ERR_LOCATION_MAP_SECRET_TOKEN_FORBIDDEN', 'Secret map provider tokens must not be exposed to frontend clients');
        if (record.providerCode === 'MAPBOX' && token.indexOf('pk.') !== 0) {
            this.fail('ERR_LOCATION_MAP_PUBLIC_TOKEN_INVALID', 'Mapbox frontend token must start with pk.');
        }
        return token;
    },

    /** Returns the frontend renderer identity for one provider metadata row. */
    rendererCode: function (provider) {
        let providerType = this.text(provider && provider.providerType);
        let explicit = this.text(provider && provider.rendererCode);
        if (explicit) return explicit;
        if (providerType === 'MAPBOX') return 'axis.location.mapbox';
        if (providerType === 'OSM') return 'axis.location.tile';
        return 'axis.location.unsupported';
    },

    /** Returns the renderer family that Axis can match against a local adapter. */
    rendererType: function (provider) {
        let explicit = this.text(provider && provider.rendererType);
        if (explicit) return explicit;
        let providerType = this.text(provider && provider.providerType);
        if (providerType === 'MAPBOX') return 'MAPBOX_GL';
        if (providerType === 'OSM') return 'XYZ_TILE';
        return 'EXTERNAL_ADAPTER';
    },

    /** Builds a safe list of provider choices for Axis configuration screens. */
    providerOptions: function (providers) {
        return providers.map(provider => ({
            code: this.text(provider.code),
            name: provider.name || {},
            providerType: this.text(provider.providerType),
            rendererCode: this.rendererCode(provider),
            rendererType: this.rendererType(provider),
            requiresPublicAccessToken: provider.requiresPublicAccessToken === true,
            frontendSafeTokenPrefix: this.text(provider.frontendSafeTokenPrefix),
            status: this.text(provider.status)
        })).filter(provider => provider.code);
    },

    /** Builds the frontend-safe renderer descriptor for one effective provider/config pair. */
    renderDescriptor: function (record, provider) {
        let rendererType = this.rendererType(provider);
        let styleUrl = this.text(record && record.styleUrl);
        return {
            providerCode: this.text(record && record.providerCode),
            providerType: this.text(provider && provider.providerType) || this.text(record && record.providerCode),
            rendererCode: this.rendererCode(provider),
            rendererType: rendererType,
            styleUrl: styleUrl,
            tileUrlTemplate: rendererType === 'XYZ_TILE' ? styleUrl : '',
            attribution: this.text(provider && provider.metadata && provider.metadata.attribution),
            publicAccessToken: this.publicAccessToken(record),
            endpointPolicy: provider && provider.endpointPolicy || {},
            frontendSafe: record && record.frontendSafe !== false
        };
    },

    /** Converts one stored configuration record into the browser-safe contract. */
    publicProjection: function (record, provider, fallback) {
        if (!record) return undefined;
        let token = this.publicAccessToken(record);
        let setupStatus = this.text(record.setupStatus || (token ? 'ACTIVE' : 'SETUP_REQUIRED'));
        let providerRequiresToken = provider && provider.requiresPublicAccessToken === true || record.providerCode === 'MAPBOX';
        let renderer = this.renderDescriptor(record, provider);
        return {
            code: this.text(record.code),
            providerCode: this.text(record.providerCode),
            surfaceCode: this.text(record.surfaceCode),
            usageCode: this.text(record.usageCode),
            stylePresetCode: this.text(record.stylePresetCode),
            styleUrl: this.text(record.styleUrl),
            publicAccessToken: token,
            fallbackProviderCode: this.text(record.fallbackProviderCode),
            fallbackPolicy: this.text(record.fallbackPolicy || 'SETUP_REQUIRED'),
            defaultCenter: {
                latitude: Number(record.defaultCenterLatitude),
                longitude: Number(record.defaultCenterLongitude)
            },
            defaultZoom: Number(record.defaultZoom),
            minimumZoom: record.minimumZoom === undefined ? undefined : Number(record.minimumZoom),
            maximumZoom: record.maximumZoom === undefined ? undefined : Number(record.maximumZoom),
            enabledControls: Array.isArray(record.enabledControls) ? record.enabledControls.filter(item => typeof item === 'string') : [],
            setupStatus: setupStatus,
            configured: setupStatus === 'ACTIVE' && Boolean(token || !providerRequiresToken) && this.text(record.styleUrl) !== '' && renderer.rendererCode !== 'axis.location.unsupported',
            status: this.text(record.status),
            rendererCode: renderer.rendererCode,
            rendererType: renderer.rendererType,
            renderDescriptor: renderer,
            fallbackRenderer: fallback ? this.renderDescriptor(fallback.record, fallback.provider) : undefined
        };
    },

    /** Converts one stored configuration record into the editable Axis contract. */
    editableProjection: function (record, query, provider, fallback, providers) {
        let projection = this.publicProjection(record, provider, fallback);
        if (projection) return projection;
        return {
            code: 'AXIS_COLLECTION_CENTRE_MAPBOX_STREETS',
            providerCode: 'MAPBOX',
            surfaceCode: query.surfaceCode,
            usageCode: query.usageCode,
            stylePresetCode: 'MAPBOX_STREETS',
            styleUrl: 'mapbox://styles/mapbox/streets-v12',
            publicAccessToken: '',
            fallbackProviderCode: 'OSM',
            fallbackPolicy: 'SETUP_REQUIRED',
            defaultCenter: { latitude: 25.2048, longitude: 55.2708 },
            defaultZoom: 9,
            minimumZoom: 3,
            maximumZoom: 18,
            enabledControls: ['FILTERS', 'ZOOM', 'SCALE', 'GEOLOCATE', 'DIRECTIONS'],
            setupStatus: 'SETUP_REQUIRED',
            configured: false,
            status: 'ACTIVE',
            rendererCode: 'axis.location.mapbox',
            rendererType: 'MAPBOX_GL',
            renderDescriptor: {
                providerCode: 'MAPBOX',
                providerType: 'MAPBOX',
                rendererCode: 'axis.location.mapbox',
                rendererType: 'MAPBOX_GL',
                styleUrl: 'mapbox://styles/mapbox/streets-v12',
                tileUrlTemplate: '',
                attribution: '',
                publicAccessToken: '',
                endpointPolicy: {},
                frontendSafe: true
            },
            fallbackRenderer: undefined,
            providerOptions: this.providerOptions(providers || [])
        };
    },

    /** Finds a provider metadata row by code. */
    providerByCode: function (providers, code) {
        let normalizedCode = this.text(code);
        return this.providersWithDefaults(providers).find(provider => this.text(provider.code) === normalizedCode);
    },

    /** Selects the configured fallback provider/configuration for one active map configuration. */
    fallbackSelection: function (configs, providers, preferred) {
        let fallbackProviderCode = this.text(preferred && preferred.fallbackProviderCode) || 'OSM';
        let fallbackRecord = configs.find(record => this.text(record.providerCode) === fallbackProviderCode && this.text(record.setupStatus) === 'ACTIVE')
            || configs.find(record => this.text(record.providerCode) === fallbackProviderCode);
        if (!fallbackRecord && fallbackProviderCode === 'OSM') {
            fallbackRecord = {
                providerCode: 'OSM',
                styleUrl: 'https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
                publicAccessToken: '',
                frontendSafe: true
            };
        }
        let fallbackProvider = this.providerByCode(providers, fallbackProviderCode) || { code: fallbackProviderCode, providerType: fallbackProviderCode, rendererCode: fallbackProviderCode === 'OSM' ? 'axis.location.tile' : 'axis.location.unsupported', rendererType: fallbackProviderCode === 'OSM' ? 'XYZ_TILE' : 'EXTERNAL_ADAPTER', requiresPublicAccessToken: false };
        return fallbackRecord ? { record: fallbackRecord, provider: fallbackProvider } : undefined;
    },

    /** Builds a bounded query from surface and usage parameters. */
    query: function (request) {
        request = request || {};
        let source = Object.assign({}, request.query || {}, request.payload || {});
        let surfaceCode = this.text(source.surfaceCode);
        let usageCode = this.text(source.usageCode);
        if (!surfaceCode) this.fail('ERR_LOCATION_MAP_SURFACE_REQUIRED', 'surfaceCode is required');
        if (!usageCode) this.fail('ERR_LOCATION_MAP_USAGE_REQUIRED', 'usageCode is required');
        return {
            surfaceCode: surfaceCode,
            usageCode: usageCode,
            status: 'ACTIVE'
        };
    },

    /** Builds and validates a reverse geocode query without exposing provider-specific coordinates to callers. */
    reverseGeocodeQuery: function (request) {
        let source = Object.assign({}, request && request.query || {}, request && request.payload || {});
        let query = this.query(request);
        let latitude = this.optionalNumber(source.latitude, 'latitude', -90, 90, undefined);
        let longitude = this.optionalNumber(source.longitude, 'longitude', -180, 180, undefined);
        if (latitude === undefined) this.fail('ERR_LOCATION_MAP_LATITUDE_REQUIRED', 'latitude is required');
        if (longitude === undefined) this.fail('ERR_LOCATION_MAP_LONGITUDE_REQUIRED', 'longitude is required');
        return Object.assign({}, query, {
            coordinate: {
                latitude: latitude,
                longitude: longitude
            },
            locale: this.text(source.locale || request && request.authData && request.authData.locale)
        });
    },

    /** Returns a bounded URL for one provider reverse-geocode operation. */
    reverseGeocodeUrl: function (descriptor, coordinate, locale) {
        if (!descriptor) return '';
        locale = this.text(locale);
        let providerCode = this.text(descriptor.providerCode);
        if (providerCode === 'MAPBOX' && this.publicAccessToken(descriptor)) {
            let mapbox = new URL('https://api.mapbox.com/geocoding/v5/mapbox.places/' +
                String(coordinate.longitude) + ',' + String(coordinate.latitude) + '.json');
            mapbox.searchParams.set('access_token', this.publicAccessToken(descriptor));
            mapbox.searchParams.set('limit', '1');
            if (locale) mapbox.searchParams.set('language', locale);
            return mapbox.toString();
        }
        if (providerCode === 'OSM' || this.text(descriptor.rendererType) === 'XYZ_TILE') {
            let osm = new URL('https://nominatim.openstreetmap.org/reverse');
            osm.searchParams.set('format', 'jsonv2');
            osm.searchParams.set('lat', String(coordinate.latitude));
            osm.searchParams.set('lon', String(coordinate.longitude));
            osm.searchParams.set('zoom', '18');
            osm.searchParams.set('addressdetails', '1');
            if (locale) osm.searchParams.set('accept-language', locale);
            return osm.toString();
        }
        return '';
    },

    /** Extracts the first displayable string from a provider response. */
    responseText: function (value, field) {
        if (!value || typeof value !== 'object' || Array.isArray(value)) return '';
        let candidate = value[field];
        return typeof candidate === 'string' ? candidate.trim() : '';
    },

    /** Normalizes provider responses into a short address label. */
    reverseGeocodeAddress: function (providerCode, response) {
        if (providerCode === 'MAPBOX') {
            let features = response && Array.isArray(response.features) ? response.features : [];
            let first = features.find(item => item && typeof item === 'object' && !Array.isArray(item));
            return this.responseText(first, 'place_name') || this.responseText(first, 'text');
        }
        return this.responseText(response, 'display_name') ||
            this.responseText(response, 'name') ||
            this.responseText(response && response.address, 'road');
    },

    /** Runs one provider lookup through the shared Nodics transport and returns an empty result on provider failure. */
    fetchReverseGeocodeAddress: function (descriptor, coordinate, locale) {
        let moduleService = typeof SERVICE !== 'undefined' && SERVICE.DefaultModuleService;
        if (!moduleService || typeof moduleService.buildExternalRequest !== 'function' || typeof moduleService.fetch !== 'function') {
            return Promise.resolve('');
        }
        let language = this.text(locale);
        let uri = this.reverseGeocodeUrl(descriptor, coordinate, language);
        if (!uri) return Promise.resolve('');
        let providerCode = this.text(descriptor.providerCode);
        let header = {
            Accept: 'application/json',
            'User-Agent': 'Nodics Location Map'
        };
        if (language) header['Accept-Language'] = language;
        let request = moduleService.buildExternalRequest({
            uri: uri,
            methodName: 'GET',
            header: header,
            timeoutMs: 3000,
            maxAttempts: 1,
            maxResponseBytes: 32768,
            followRedirects: false
        });
        return moduleService.fetch(request)
            .then(response => this.reverseGeocodeAddress(providerCode, response))
            .catch(() => '');
    },

    /** Returns provider descriptors in preferred order with OSM as the final safe fallback. */
    reverseGeocodeDescriptors: function (configuration) {
        let descriptors = [
            configuration && configuration.renderDescriptor,
            configuration && configuration.fallbackRenderer,
            this.renderDescriptor({
                providerCode: 'OSM',
                styleUrl: 'https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
                publicAccessToken: '',
                frontendSafe: true
            }, this.providerByCode([], 'OSM'))
        ].filter(Boolean);
        let seen = {};
        return descriptors.filter(descriptor => {
            let key = [
                this.text(descriptor.providerCode),
                this.text(descriptor.rendererType),
                this.text(descriptor.styleUrl),
                this.text(descriptor.publicAccessToken)
            ].join('|');
            if (seen[key]) return false;
            seen[key] = true;
            return true;
        });
    },

    /** Resolves a customer-safe address label for a browser-provided latitude and longitude. */
    reverseGeocode: function (request) {
        let input = this.reverseGeocodeQuery(request);
        return this.getEffectiveConfiguration({
            tenant: request && request.tenant,
            authData: request && request.authData,
            query: {
                surfaceCode: input.surfaceCode,
                usageCode: input.usageCode
            }
        }).then(configuration => {
            let descriptors = this.reverseGeocodeDescriptors(configuration);
            return descriptors.reduce((promise, descriptor) => promise.then(result => {
                if (result && result.address) return result;
                return this.fetchReverseGeocodeAddress(descriptor, input.coordinate, input.locale)
                    .then(address => address ? {
                        status: 'RESOLVED',
                        address: address,
                        providerCode: this.text(descriptor.providerCode),
                        fallbackUsed: this.text(descriptor.providerCode) !== this.text(configuration.providerCode)
                    } : result);
            }), Promise.resolve(undefined)).then(result => result || {
                status: 'UNAVAILABLE',
                address: '',
                providerCode: '',
                fallbackUsed: true
            });
        });
    },

    /** Builds a persisted model from the Axis map setup form. */
    model: function (request) {
        let payload = Object.assign({}, request && request.payload || {});
        let providerCode = this.requiredText(payload.providerCode, 'providerCode', 'MAPBOX');
        let model = {
            code: this.requiredText(payload.code, 'code', 'AXIS_COLLECTION_CENTRE_MAPBOX_STREETS'),
            providerCode: providerCode,
            surfaceCode: this.requiredText(payload.surfaceCode, 'surfaceCode'),
            usageCode: this.requiredText(payload.usageCode, 'usageCode'),
            stylePresetCode: this.text(payload.stylePresetCode || 'MAPBOX_STREETS'),
            styleUrl: this.requiredText(payload.styleUrl, 'styleUrl', providerCode === 'MAPBOX' ? 'mapbox://styles/mapbox/streets-v12' : undefined),
            publicAccessToken: this.publicAccessToken({ providerCode: providerCode, publicAccessToken: payload.publicAccessToken }),
            fallbackProviderCode: this.text(payload.fallbackProviderCode || 'OSM'),
            fallbackPolicy: this.text(payload.fallbackPolicy || 'SETUP_REQUIRED'),
            defaultCenterLatitude: this.optionalNumber(payload.defaultCenterLatitude, 'defaultCenterLatitude', -90, 90, 25.2048),
            defaultCenterLongitude: this.optionalNumber(payload.defaultCenterLongitude, 'defaultCenterLongitude', -180, 180, 55.2708),
            defaultZoom: this.optionalNumber(payload.defaultZoom, 'defaultZoom', 0, 24, 9),
            minimumZoom: this.optionalNumber(payload.minimumZoom, 'minimumZoom', 0, 24, 3),
            maximumZoom: this.optionalNumber(payload.maximumZoom, 'maximumZoom', 0, 24, 18),
            enabledControls: Array.isArray(payload.enabledControls) ? payload.enabledControls.filter(item => typeof item === 'string' && item.trim()).map(item => item.trim()) : ['FILTERS', 'ZOOM', 'SCALE', 'GEOLOCATE', 'DIRECTIONS'],
            setupStatus: this.text(payload.setupStatus || (payload.publicAccessToken ? 'ACTIVE' : 'SETUP_REQUIRED')),
            status: this.text(payload.status || 'ACTIVE')
        };
        if (model.minimumZoom > model.maximumZoom) this.fail('ERR_LOCATION_MAP_ZOOM_RANGE_INVALID', 'minimumZoom must be less than or equal to maximumZoom');
        if (model.providerCode === 'MAPBOX' && model.setupStatus === 'ACTIVE' && !model.publicAccessToken) {
            this.fail('ERR_LOCATION_MAP_PUBLIC_TOKEN_REQUIRED', 'Mapbox publicAccessToken is required before setupStatus can be ACTIVE');
        }
        return model;
    },

    /** Resolves the stored editable map provider configuration for a frontend surface and usage. */
    getConfiguration: function (request) {
        let context = this.context(request);
        let query = this.query(request);
        return Promise.all([
            this.repository().get(Object.assign({}, context, {
                query: query,
                searchOptions: { limit: 10, sort: { revision: -1, code: 1 } }
            })),
            this.providers(context)
        ]).then(results => {
            let configs = this.records(results[0]).filter(record => this.text(record.setupStatus) !== 'ARCHIVED');
            let providers = results[1];
            let preferred = configs.find(record => this.text(record.setupStatus) === 'ACTIVE') || configs[0];
            let provider = this.providerByCode(providers, preferred && preferred.providerCode);
            let fallback = this.fallbackSelection(configs, providers, preferred);
            return Object.assign(this.editableProjection(preferred, query, provider, fallback, providers), {
                providerOptions: this.providerOptions(providers)
            });
        });
    },

    /** Creates or updates an editable map provider configuration. */
    saveConfiguration: function (request) {
        let context = this.context(request);
        let model = this.model(request);
        return this.repository().get(Object.assign({}, context, {
            query: { code: model.code },
            searchOptions: { limit: 1 }
        })).then(response => {
            let existing = this.records(response)[0];
            if (existing) {
                return this.repository().update(Object.assign({}, context, {
                    query: { code: model.code },
                    model: { $set: model }
                })).then(() => this.providers(context).then(providers => this.publicProjection(model, this.providerByCode(providers, model.providerCode), this.fallbackSelection([], providers, model))));
            }
            return this.repository().save(Object.assign({}, context, { model: model }))
                .then(() => this.providers(context).then(providers => this.publicProjection(model, this.providerByCode(providers, model.providerCode), this.fallbackSelection([], providers, model))));
        });
    },

    /** Resolves the active effective map provider configuration for a frontend surface and usage. */
    getEffectiveConfiguration: function (request) {
        let context = this.context(request);
        let query = this.query(request);
        return Promise.all([
            this.repository().get(Object.assign({}, context, {
                query: query,
                searchOptions: { limit: 10, sort: { revision: -1, code: 1 } }
            })),
            this.providers(context)
        ]).then(results => {
            let configs = this.records(results[0]).filter(record => this.text(record.setupStatus) !== 'ARCHIVED');
            let providers = results[1];
            let preferred = configs.find(record => this.text(record.setupStatus) === 'ACTIVE') || configs[0];
            let provider = this.providerByCode(providers, preferred && preferred.providerCode);
            let fallback = this.fallbackSelection(configs, providers, preferred);
            let projection = this.publicProjection(preferred, provider, fallback);
            if (projection) return projection;
            fallback = this.fallbackSelection([], providers, { fallbackProviderCode: 'OSM' });
            return {
                providerCode: '',
                surfaceCode: query.surfaceCode,
                usageCode: query.usageCode,
                styleUrl: '',
                publicAccessToken: '',
                fallbackProviderCode: '',
                fallbackPolicy: 'SETUP_REQUIRED',
                defaultCenter: { latitude: 25.2048, longitude: 55.2708 },
                defaultZoom: 9,
                enabledControls: [],
                setupStatus: 'SETUP_REQUIRED',
                configured: false,
                status: 'DRAFT',
                rendererCode: '',
                rendererType: '',
                renderDescriptor: undefined,
                fallbackRenderer: fallback ? this.renderDescriptor(fallback.record, fallback.provider) : undefined
            };
        });
    }
};
