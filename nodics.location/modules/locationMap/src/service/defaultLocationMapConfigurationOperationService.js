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

    /** Reads layered shared-map defaults without assigning application ownership. */
    settings: function () { return SERVICE.DefaultLocationMapPresentationService.settings(); },

    /** Reads the single current row for an exact persistence scope. */
    scopedRecord: function (configs, scope) {
        const matches = configs.filter(record => record.surfaceCode === scope && record.setupStatus !== 'ARCHIVED');
        if (matches.length > 1) this.fail('ERR_LOCATION_MAP_CONFIGURATION_AMBIGUOUS', 'More than one configuration exists for this map usage and scope');
        return matches[0];
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
            stylePresetCode: this.settings().providerDefaults[provider.code]?.stylePresetCode || '',
            styleUrl: this.settings().providerDefaults[provider.code]?.styleUrl || '',
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
            attribution: this.text(provider && provider.metadata && provider.metadata.attribution || (this.settings().providerAttributions || {})[this.text(record && record.providerCode)]).replace(/[&<>"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[character]),
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
        const configured = record.status === 'ACTIVE' && record.frontendSafe !== false && setupStatus === 'ACTIVE' && Boolean(token || !providerRequiresToken) && Boolean(provider) && this.text(record.styleUrl) !== '' && renderer.rendererCode !== 'axis.location.unsupported';
        const fallbackAllowed = record.status === 'ACTIVE' && !['INACTIVE', 'INVALID', 'ARCHIVED'].includes(setupStatus) && record.frontendSafe !== false && (record.fallbackPolicy === 'ALLOW_BASIC_MAP' || (record.fallbackPolicy === 'NON_PRODUCTION_ONLY' && this.settings().allowNonProductionFallback === true));
        return {
            code: this.text(record.code),
            providerCode: this.text(record.providerCode),
            surfaceCode: 'SHARED',
            configurationScope: 'SHARED',
            contractVersion: 1,
            revision: Number(record.revision || 0),
            refreshIntervalMs: Math.max(5000, Math.min(60000, Number(this.settings().refreshIntervalMs) || 15000)),
            frontendSafe: record.frontendSafe !== false,
            presentation: SERVICE.DefaultLocationMapPresentationService.presentation(record.presentation),
            interaction: SERVICE.DefaultLocationMapPresentationService.interaction(record.interaction),
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
            configured: configured,
            fallbackAllowed: fallbackAllowed,
            status: this.text(record.status),
            rendererCode: renderer.rendererCode,
            rendererType: renderer.rendererType,
            renderDescriptor: renderer,
            fallbackRenderer: fallback ? this.renderDescriptor(fallback.record, fallback.provider) : undefined
        };
    },

    /** Applies one selection layer. A provider switch starts with its own style and credentials. */
    applySelection: function (base, override) {
        if (!override) return base;
        const code = override.providerCode || base.providerCode;
        if (code === base.providerCode) return Object.assign({}, base, override);
        const defaults = this.settings().providerDefaults[code] || {};
        return Object.assign({}, base, {
            stylePresetCode: '', styleUrl: '', publicAccessToken: '', setupStatus: undefined
        }, defaults, override);
    },

    /** Resolves a request surface, using the project selection for unscoped requests. */
    surface: function (value) {
        const surface = this.text(value) || 'SHARED';
        if (!/^[A-Z][A-Z0-9_]{0,47}$/.test(surface) || surface === 'FALLBACK') this.fail('ERR_LOCATION_MAP_CONFIGURATION_INVALID', 'Invalid map surface');
        return surface;
    },

    /** Resolves framework, project, persisted project selection, then the requested application. */
    resolvedConfiguration: function (configs, providers, usage, surface) {
        const settings = this.settings();
        const project = settings.projectOverrides?.[usage];
        const app = surface === 'SHARED' ? undefined : settings.applicationOverrides?.[surface]?.[usage];
        const savedApp = surface === 'SHARED' ? undefined : this.scopedRecord(configs, 'APP:' + surface);
        const stored = this.scopedRecord(configs, 'SHARED');
        let record = this.applySelection({
            code: 'SHARED_' + usage, usageCode: usage, status: 'ACTIVE', frontendSafe: true
        }, settings.defaultSelection);
        record = this.applySelection(record, project);
        record = this.applySelection(record, stored);
        record = this.applySelection(record, app);
        record = this.applySelection(record, savedApp);
        const provider = this.providerByCode(providers, record.providerCode);
        if (!record.setupStatus) record.setupStatus = provider?.requiresPublicAccessToken && !record.publicAccessToken ? 'SETUP_REQUIRED' : 'ACTIVE';
        const fallback = this.fallbackSelection(configs, providers, record);
        return Object.assign(this.publicProjection(record, provider, fallback), {
            providerScope: savedApp?.providerCode || app?.providerCode ? 'APPLICATION' : stored?.providerCode || project?.providerCode ? 'PROJECT' : 'FRAMEWORK',
            configurationScope: app || savedApp ? 'APPLICATION' : stored || project ? 'PROJECT' : 'FRAMEWORK',
            surfaceCode: surface
        });
    },

    /** Finds a provider metadata row by code. */
    providerByCode: function (providers, code) {
        let normalizedCode = this.text(code);
        return this.providersWithDefaults(providers).find(provider => this.text(provider.code) === normalizedCode);
    },

    /** Selects the configured fallback provider/configuration for one active map configuration. */
    fallbackSelection: function (configs, providers, preferred) {
        let fallbackProviderCode = this.text(preferred && preferred.fallbackProviderCode);
        if (!fallbackProviderCode) return undefined;
        const candidates = configs.filter(record => record.surfaceCode === 'FALLBACK' && record.frontendSafe !== false && record.status === 'ACTIVE');
        let fallbackRecord = candidates.find(record => this.text(record.providerCode) === fallbackProviderCode && this.text(record.setupStatus) === 'ACTIVE');
        if (!fallbackRecord && fallbackProviderCode === 'OSM') {
            fallbackRecord = {
                providerCode: 'OSM',
                styleUrl: this.settings().providerDefaults.OSM.styleUrl,
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
        let usageCode = this.text(source.usageCode);
        if (!usageCode) this.fail('ERR_LOCATION_MAP_USAGE_REQUIRED', 'usageCode is required');
        return {
            usageCode: usageCode,
            status: { $in: ['ACTIVE', 'DRAFT', 'INACTIVE'] }
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
                styleUrl: this.settings().providerDefaults.OSM.styleUrl,
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
                surfaceCode: this.text(request.query?.surfaceCode),
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
        let providerCode = this.requiredText(payload.providerCode, 'providerCode');
        const defaults = this.settings().defaultSelection;
        let model = {
            code: this.requiredText(payload.code, 'code'),
            providerCode: providerCode,
            surfaceCode: 'SHARED',
            usageCode: this.requiredText(payload.usageCode, 'usageCode'),
            stylePresetCode: this.text(payload.stylePresetCode || this.settings().providerDefaults[providerCode]?.stylePresetCode),
            styleUrl: this.requiredText(payload.styleUrl, 'styleUrl', this.settings().providerDefaults[providerCode]?.styleUrl),
            publicAccessToken: this.publicAccessToken({ providerCode: providerCode, publicAccessToken: payload.publicAccessToken }),
            fallbackProviderCode: this.text(payload.fallbackProviderCode),
            fallbackPolicy: this.text(payload.fallbackPolicy || 'SETUP_REQUIRED'),
            defaultCenterLatitude: this.optionalNumber(payload.defaultCenterLatitude, 'defaultCenterLatitude', -90, 90, defaults.defaultCenterLatitude),
            defaultCenterLongitude: this.optionalNumber(payload.defaultCenterLongitude, 'defaultCenterLongitude', -180, 180, defaults.defaultCenterLongitude),
            defaultZoom: this.optionalNumber(payload.defaultZoom, 'defaultZoom', 0, 24, defaults.defaultZoom),
            minimumZoom: this.optionalNumber(payload.minimumZoom, 'minimumZoom', 0, 24, defaults.minimumZoom),
            maximumZoom: this.optionalNumber(payload.maximumZoom, 'maximumZoom', 0, 24, defaults.maximumZoom),
            enabledControls: Array.isArray(payload.enabledControls) ? payload.enabledControls.filter(item => typeof item === 'string' && item.trim()).map(item => item.trim()) : defaults.enabledControls,
            setupStatus: this.text(payload.setupStatus || (providerCode === 'OSM' || payload.publicAccessToken ? 'ACTIVE' : 'SETUP_REQUIRED')),
            status: this.text(payload.status || 'ACTIVE')
        };
        if (payload.presentation !== undefined) model.presentation = SERVICE.DefaultLocationMapPresentationService.presentation(payload.presentation);
        if (payload.interaction !== undefined) model.interaction = SERVICE.DefaultLocationMapPresentationService.interaction(payload.interaction);
        model.frontendSafe = true;
        if (!['ACTIVE', 'DRAFT', 'INACTIVE'].includes(model.status)) this.fail('ERR_LOCATION_MAP_CONFIGURATION_INVALID', 'Unsupported map configuration status');
        if (!['NONE', 'SETUP_REQUIRED', 'ALLOW_BASIC_MAP', 'NON_PRODUCTION_ONLY'].includes(model.fallbackPolicy)) this.fail('ERR_LOCATION_MAP_CONFIGURATION_INVALID', 'Unsupported map fallback policy');
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
                searchOptions: { limit: 100, sort: { revision: -1, code: 1 } }
            })),
            this.providers(context)
        ]).then(results => {
            let configs = this.records(results[0]).filter(record => this.text(record.setupStatus) !== 'ARCHIVED');
            let providers = results[1];
            const surface = this.surface(request.query?.surfaceCode);
            const projection = this.resolvedConfiguration(configs, providers, query.usageCode, surface);
            const savedApp = surface === 'SHARED' ? undefined : this.scopedRecord(configs, 'APP:' + surface);
            return Object.assign(projection, {
                code: surface === 'SHARED' ? projection.code : savedApp?.code || surface + '_' + query.usageCode,
                revision: surface === 'SHARED' ? projection.revision : Number(savedApp?.revision || 0),
                providerOptions: this.providerOptions(providers)
            });
        });
    },

    /** Saves the single shared configuration for a usage through generated persistence. */
    saveConfiguration: async function (request) {
        const context = this.context(request);
        const model = this.model(request);
        const rows = this.records(await this.repository().get(Object.assign({}, context, {
            query: { usageCode: model.usageCode }, searchOptions: { limit: 100 }
        })));
        const surface = this.surface(request.payload?.surfaceCode);
        model.surfaceCode = surface === 'SHARED' ? 'SHARED' : 'APP:' + surface;
        const current = this.scopedRecord(rows, model.surfaceCode);
        const existing = rows.find(record => record.code === model.code);
        if ((current && current.code !== model.code) || (existing && existing !== current)) this.fail('ERR_LOCATION_MAP_CONFIGURATION_CONFLICT', 'Edit the existing shared configuration instead of creating a second configuration');
        if (!existing && model.code !== surface + '_' + model.usageCode) this.fail('ERR_LOCATION_MAP_CONFIGURATION_CONFLICT', 'Use the configuration code supplied for this scope and usage');
        const expected = request.payload && request.payload.expectedRevision;
        if (expected !== undefined && Number(expected) !== Number(existing?.revision || 0)) this.fail('ERR_LOCATION_MAP_REVISION_CONFLICT', 'Map configuration changed; reload it before saving');
        if (existing) {
            await this.repository().update(Object.assign({}, context, {
                query: { code: existing.code, surfaceCode: existing.surfaceCode, usageCode: model.usageCode, revision: existing.revision },
                model: Object.assign({}, model, { revision: existing.revision }),
                options: { recursive: false }
            }));
        } else {
            model.name = { en: surface + ' ' + model.usageCode };
            model.revision = 1;
            await this.repository().save(Object.assign({}, context, { query: { code: model.code, surfaceCode: model.surfaceCode, usageCode: model.usageCode }, model: model, options: { recursive: false } }));
        }
        return this.getConfiguration(Object.assign({}, request, { query: { usageCode: model.usageCode, surfaceCode: surface }, payload: {} }));
    },

    /** Exposes only opted-in, frontend-safe shared usage configuration to anonymous customers. */
    getPublicConfiguration: async function (request) {
        const usage = this.query(request).usageCode;
        if (!(this.settings().publicUsageCodes || []).includes(usage)) this.fail('ERR_LOCATION_MAP_PUBLIC_USAGE_DENIED', 'This map usage is not available publicly');
        const surface = this.surface(request.query?.surfaceCode);
        if (!this.settings().publicSurfaceCodes.includes(surface)) this.fail('ERR_LOCATION_MAP_PUBLIC_USAGE_DENIED', 'This map surface is not available publicly');
        const tenant = this.context(request).tenant;
        const configuration = await this.getEffectiveConfiguration({
            tenant: tenant,
            authData: { tenant: tenant, principalId: 'locationMapPublicRead', principalType: 'service', loginId: 'locationMapPublicRead', userGroups: ['serviceAccountUserGroup'] },
            query: { usageCode: usage, surfaceCode: surface }
        });
        if (configuration.frontendSafe === false) this.fail('ERR_LOCATION_MAP_PUBLIC_USAGE_DENIED', 'This map configuration is not available publicly');
        return configuration;
    },

    /** Resolves the active effective map provider configuration for a frontend surface and usage. */
    getEffectiveConfiguration: function (request) {
        let context = this.context(request);
        let query = this.query(request);
        return Promise.all([
            this.repository().get(Object.assign({}, context, {
                query: query,
                searchOptions: { limit: 100, sort: { revision: -1, code: 1 } }
            })),
            this.providers(context)
        ]).then(results => {
            let configs = this.records(results[0]).filter(record => this.text(record.setupStatus) !== 'ARCHIVED');
            let providers = results[1];
            return this.resolvedConfiguration(configs, providers, query.usageCode, this.surface(request.query?.surfaceCode));
        });
    }
};
