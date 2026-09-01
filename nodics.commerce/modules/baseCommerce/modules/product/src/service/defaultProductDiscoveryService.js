/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module product/service/defaultProductDiscoveryService
 * @description Projects Product search projections into discovery Home, PLP/Search, and PDP responses across caller contexts.
 * @layer service
 * @owner product
 * @override Later modules may alter card/detail projection fields through configuration or service override while preserving Product-only data ownership.
 */
module.exports = {
    /** Initializes the service lifecycle. @returns {Promise<boolean>} Initialization result. */
    init: function () { return Promise.resolve(true); },
    /** Completes the service lifecycle. @returns {Promise<boolean>} Initialization result. */
    postInit: function () { return Promise.resolve(true); },

    /** Returns the effective Product discovery policy. @returns {Object} Policy. */
    policy: function () { return ((CONFIG.get('product') || {}).discovery) || {}; },

    /** Builds service-account authorization context for internal Discovery configuration lookup. @param {Object} request Request. @returns {Object} Service authorization data. */
    serviceAuthData: function (request) {
        return Object.assign({}, request.authData || {}, {
            entCode: request.entCode || request.enterprise && request.enterprise.code || request.authData && request.authData.entCode,
            tenant: request.tenant,
            loginId: 'productDiscovery',
            principalType: 'service',
            userGroups: ['serviceAccountUserGroup'],
            groups: ['serviceAccountUserGroup']
        });
    },

    /** Returns a bounded integer option. @param {*} value Candidate value. @param {number} fallback Fallback. @param {number} minimum Minimum. @param {number} maximum Maximum. @returns {number} Bounded number. */
    boundedInteger: function (value, fallback, minimum, maximum) {
        let next = Number(value || fallback);
        if (!Number.isInteger(next) || next < minimum) return fallback;
        return Math.min(next, maximum);
    },

    /** Resolves the Discovery index configuration requested by the storefront or layered defaults. @param {Object} request Request. @returns {Promise<Object|undefined>} Index configuration. */
    indexConfiguration: async function (request) {
        if (request.indexConfiguration) return request.indexConfiguration;
        if (!SERVICE.DefaultDiscoveryConfigurationResolverService || typeof SERVICE.DefaultDiscoveryConfigurationResolverService.resolveIndexConfiguration !== 'function') return undefined;
        try {
            return await SERVICE.DefaultDiscoveryConfigurationResolverService.resolveIndexConfiguration({
                tenant: request.tenant,
                ownerType: 'PRODUCT',
                indexCode: request.query && (request.query.indexCode || request.query.indexConfigurationCode),
                storeCode: request.storeCode,
                locale: request.locale,
                authData: this.serviceAuthData(request)
            });
        } catch (error) {
            if (this.policy().configurationFailureBehavior === 'error') throw error;
            return undefined;
        }
    },

    /** Builds response metadata proving Product discovery is served from governed Discovery/search configuration. @param {Object} request Request. @param {Object|undefined} configuration Index configuration. @returns {Object} Metadata. */
    discoveryMetadata: function (request, configuration) {
        let policy = this.policy();
        return {
            source: request.discoveryServedFrom || 'SEARCH_INDEX',
            flow: ['DATA_FOLDER', 'COMMERCE_STAGED', 'COMMERCE_ONLINE', 'SEARCH_INDEX', 'STOREFRONT_API'],
            indexConfigurationCode: configuration && configuration.code || request.query && (request.query.indexCode || request.query.indexConfigurationCode),
            sourceMixCode: configuration && configuration.sourceMixCode,
            fieldMappingCode: configuration && configuration.fieldMappingCode,
            queryProfileCode: configuration && configuration.queryProfileCode,
            facetProfileCode: configuration && configuration.facetProfileCode,
            rankingProfileCode: configuration && configuration.rankingProfileCode || request.query && request.query.rankingProfileCode,
            indexName: configuration && configuration.indexName || policy.searchIndexName || 'productLocalized',
            storeCode: request.storeCode,
            locale: request.locale
        };
    },

    /** Builds the tenant, Store, locale, category, text, and status filter for projection search. @param {Object} request Nodics request. @returns {Object} Provider-neutral query. */
    query: function (request) {
        let input = request.query || {}, query = {
            tenant: request.tenant,
            storeCode: request.storeCode,
            locale: request.locale,
            status: 'CURRENT'
        };
        if (input.categoryCode || input.collectionCode) query['payload.categoryCodes'] = input.categoryCode || input.collectionCode;
        if (input.domainCode) query['payload.classificationValues.domain'] = input.domainCode;
        if (request.productCode) query.productCode = request.productCode;
        if (input.q) query.text = String(input.q).trim();
        return query;
    },

    /** Builds bounded search options. @param {Object} request Nodics request. @returns {Object} Search options. */
    searchOptions: function (request) {
        let policy = this.policy(), input = request.query || {}, maximum = Number(policy.maximumPageSize || 100);
        if (SERVICE.DefaultDiscoveryQueryBuilderService && typeof SERVICE.DefaultDiscoveryQueryBuilderService.options === 'function') {
            return SERVICE.DefaultDiscoveryQueryBuilderService.options(request, {
                pageSizeLimit: maximum,
                sorts: [
                    { code: 'name-asc', sort: { 'payload.name': 1 } },
                    { code: 'name-desc', sort: { 'payload.name': -1 } }
                ]
            });
        }
        return {
            pageSize: this.boundedInteger(input.pageSize || input.limit, Number(policy.defaultPageSize || 24), 1, maximum),
            pageNumber: this.boundedInteger(input.page, 1, 1, 10000),
            sort: this.sort(input.sort)
        };
    },

    /** Maps public sort aliases to provider-neutral sort instructions. @param {string} requested Requested sort. @returns {Object|undefined} Sort. */
    sort: function (requested) {
        if (requested === 'name-asc') return { 'payload.name': 1 };
        if (requested === 'name-desc') return { 'payload.name': -1 };
        return undefined;
    },

    /** Executes the Product search projection query through generated nSearch behavior when available. @param {Object} request Nodics request. @param {Object} query Query. @param {Object} searchOptions Search options. @returns {Promise<Array>} Projection records. */
    search: async function (request, query, searchOptions) {
        let service = SERVICE.DefaultProductSearchProjectionService;
        if (!service) throw new Error('Product search projection service is unavailable');
        let policy = this.policy();
        let searchRequest = {
            tenant: request.tenant, authData: this.serviceAuthData(request), moduleName: 'product',
            indexName: request.indexConfiguration && request.indexConfiguration.indexName || policy.searchIndexName || 'productLocalized',
            query: query, searchOptions: searchOptions, options: {}
        };
        if (typeof service.doSearch === 'function') {
            let records = this.records(await service.doSearch(searchRequest));
            records = await this.completePartialPageFromProjectionStore(request, searchRequest, query, records, searchOptions);
            if (records.length > 0 || policy.projectionStoreFallback === false) return records;
        }
        let searchIndexRecords = await this.searchIndexRecords(searchRequest);
        if (searchIndexRecords.length > 0 || policy.projectionStoreFallback === false) return searchIndexRecords;
        request.discoveryServedFrom = 'PROJECTION_STORE_FALLBACK';
        let records = await this.projectionStoreRecords(Object.assign({}, searchRequest, {
            query: this.projectionStoreQuery(query),
            searchOptions: query.text ? this.textSearchFallbackOptions(searchOptions) : searchOptions
        }));
        return query.text ? this.paginateRecords(this.filterByText(records, query.text), searchOptions) : records;
    },

    /** Uses the projection store when the search adapter returns a shorter page than requested. @param {Object} request Nodics request. @param {Object} searchRequest Search request. @param {Object} query Search query. @param {Array} records Search records. @param {Object} searchOptions Search options. @returns {Promise<Array>} Complete page candidates. */
    completePartialPageFromProjectionStore: async function (request, searchRequest, query, records, searchOptions) {
        let requestedPageSize = Number(searchOptions && searchOptions.pageSize || searchOptions && searchOptions.limit || 0);
        if (!Array.isArray(records) || records.length === 0 || !requestedPageSize || records.length >= requestedPageSize) return records;
        if (((CONFIG.get('product') || {}).discovery || {}).projectionStoreFallback === false) return records;
        let fallbackRecords = await this.projectionStoreRecords(Object.assign({}, searchRequest, {
            query: this.projectionStoreQuery(query),
            searchOptions: query.text ? this.textSearchFallbackOptions(searchOptions) : searchOptions
        }));
        if (query.text) fallbackRecords = this.paginateRecords(this.filterByText(fallbackRecords, query.text), searchOptions);
        if (fallbackRecords.length <= records.length) return records;
        request.discoveryServedFrom = 'PROJECTION_STORE_FALLBACK';
        return fallbackRecords;
    },

    /** Expands only fallback text-search candidates before in-memory public text filtering. @param {Object} options Original page options. @returns {Object} Candidate options. */
    textSearchFallbackOptions: function (options) {
        let policy = this.policy(), maximum = Number(policy.textSearchFallbackCandidateLimit || policy.maximumPageSize || 100);
        return Object.assign({}, options || {}, { pageSize: maximum, limit: maximum, pageNumber: 1, page: 1 });
    },

    /** Applies the original public page window after fallback text filtering. @param {Array} records Candidate records. @param {Object} options Original page options. @returns {Array} Paged records. */
    paginateRecords: function (records, options) {
        let pageSize = this.boundedInteger(options && (options.pageSize || options.limit), Number(this.policy().defaultPageSize || 24), 1, Number(this.policy().maximumPageSize || 100));
        let pageNumber = this.boundedInteger(options && (options.pageNumber || options.page), 1, 1, 10000);
        let start = (pageNumber - 1) * pageSize;
        return (records || []).slice(start, start + pageSize);
    },

    /** Reads Product projections through the active nSearch model registry when generated service search is unavailable or empty. @param {Object} request Search request. @returns {Promise<Array>} Records. */
    searchIndexRecords: async function (request) {
        let searchModel = global.NODICS && typeof NODICS.getSearchModel === 'function'
            ? NODICS.getSearchModel(request.moduleName || 'product', request.tenant, request.indexName || 'productLocalized') : undefined;
        if (!searchModel || typeof searchModel.doSearch !== 'function') return [];
        let searchRequest = Object.assign({}, request, { searchModel: searchModel });
        if (SERVICE.DefaultPipelineService && typeof SERVICE.DefaultPipelineService.start === 'function') {
            return this.records(await SERVICE.DefaultPipelineService.start('doSearchModelInitializerPipeline', searchRequest, {}));
        }
        return this.records(await searchModel.doSearch(searchRequest));
    },

    /** Returns whether a projection contains a public text-search term. @param {Object} projection Product projection. @param {string} term Search term. @returns {boolean} Match result. */
    textMatches: function (projection, term) {
        let payload = projection && projection.payload || {}, localizedAttributes = payload.localizedAttributes || {};
        let values = [
            projection && projection.productCode, payload.code, payload.name, payload.description, payload.slug,
            payload.seo && payload.seo.title, payload.seo && payload.seo.description
        ].concat(
            payload.categoryCodes || [],
            payload.collectionCodes || [],
            payload.variantCodes || [],
            Object.keys(localizedAttributes).map(key => localizedAttributes[key]),
            this.collectTextValues(payload.classificationValues),
            this.collectTextValues(payload.fulfillment),
            this.collectTextValues(payload.availability)
        );
        let normalized = String(term || '').trim().toLowerCase();
        return !!normalized && values.filter(value => value !== undefined && value !== null)
            .some(value => String(value).toLowerCase().includes(normalized));
    },
    /** Recursively collects public scalar search values from projected metadata. @param {*} value Candidate value. @returns {Array} Text values. */
    collectTextValues: function (value) {
        if (value === undefined || value === null) return [];
        if (['string', 'number', 'boolean'].includes(typeof value)) return [value];
        if (Array.isArray(value)) return value.flatMap(item => this.collectTextValues(item));
        if (typeof value === 'object') return Object.keys(value).flatMap(key => this.collectTextValues(value[key]));
        return [];
    },

    /** Filters projection-store fallback records by public product text. @param {Array} records Projection records. @param {string} term Search term. @returns {Array} Filtered records. */
    filterByText: function (records, term) {
        return (records || []).filter(record => this.textMatches(record, term));
    },

    /** Converts exact nSearch keyword filters back to persisted projection fields for fallback reads. @param {Object} query nSearch query. @returns {Object} Mongo projection query. */
    projectionStoreQuery: function (query) {
        let mapped = {};
        Object.keys(query || {}).forEach(key => {
            if (key === 'text') return;
            let target = key.endsWith('.keyword') ? key.slice(0, -8) : key;
            mapped[target] = query[key];
        });
        return mapped;
    },

    /** Reads published Product search projections from the owned projection store as a bounded fallback when nSearch is empty. @param {Object} request Read request. @returns {Promise<Array>} Projection records. */
    projectionStoreRecords: async function (request) {
        let options = request.searchOptions || {}, pageSize = this.boundedInteger(options.pageSize || options.limit, Number(this.policy().defaultPageSize || 24), 1, Number(this.policy().maximumPageSize || 100));
        let pageNumber = this.boundedInteger(options.pageNumber || options.page, 1, 1, 10000);
        let pagedRequest = Object.assign({}, request, {
            pageSize: pageSize,
            pageNumber: pageNumber,
            searchOptions: Object.assign({}, options, { pageSize: pageSize, pageNumber: pageNumber })
        });
        let generatedRecords = [];
        let bestRecords = [];
        if (SERVICE.DefaultProductSearchProjectionService && typeof SERVICE.DefaultProductSearchProjectionService.get === 'function') {
            let response = await SERVICE.DefaultProductSearchProjectionService.get(pagedRequest);
            generatedRecords = this.records(response);
            bestRecords = generatedRecords;
            if (generatedRecords.length > 0 && generatedRecords.length >= pageSize) return generatedRecords;
        }
        let models = [request.schemaModel, this.projectionStoreModel(request), this.rawProjectionStoreModel(request)].filter(Boolean);
        for (let model of models) {
            let records = await this.readProjectionStoreModelRecords(model, request.query || {}, options, pageNumber, pageSize);
            if (records.length >= pageSize) return records;
            if (records.length > bestRecords.length) bestRecords = records;
        }
        return bestRecords;
    },

    /** Reads one Product projection-store model or collection using common pagination semantics. @param {Object|Array} model Model or collection handle. @param {Object} query Projection query. @param {Object} options Search options. @param {number} pageNumber Page number. @param {number} pageSize Page size. @returns {Promise<Array>} Records. */
    readProjectionStoreModelRecords: async function (model, query, options, pageNumber, pageSize) {
        let bestRecords = [];
        if (!model) return bestRecords;
        if (Array.isArray(model)) return model;
        if (typeof model.find === 'function') {
            let cursor = model.find(query);
            let records = await this.readProjectionCursor(cursor, options, pageNumber, pageSize);
            if (records.length > bestRecords.length) bestRecords = records;
        }
        if (model.collection && typeof model.collection.find === 'function') {
            let cursor = model.collection.find(query);
            let records = await this.readProjectionCursor(cursor, options, pageNumber, pageSize);
            if (records.length > bestRecords.length) bestRecords = records;
        }
        return bestRecords;
    },

    /** Applies sorting and pagination to a Mongoose or native Mongo cursor and resolves records. @param {*} cursor Cursor. @param {Object} options Search options. @param {number} pageNumber Page number. @param {number} pageSize Page size. @returns {Promise<Array>} Records. */
    readProjectionCursor: async function (cursor, options, pageNumber, pageSize) {
        if (!cursor) return [];
        if (options.sort && typeof cursor.sort === 'function') cursor = cursor.sort(options.sort);
        if (typeof cursor.skip === 'function') cursor = cursor.skip((pageNumber - 1) * pageSize);
        if (typeof cursor.limit === 'function') cursor = cursor.limit(pageSize);
        if (typeof cursor.lean === 'function') cursor = cursor.lean();
        if (typeof cursor.exec === 'function') {
            let records = await cursor.exec();
            if (Array.isArray(records)) return records;
        }
        if (cursor && typeof cursor.then === 'function') {
            let records = await cursor;
            if (Array.isArray(records)) return records;
        }
        if (cursor && typeof cursor.toArray === 'function') {
            let records = await cursor.toArray();
            if (Array.isArray(records)) return records;
        }
        return Array.isArray(cursor) ? cursor : [];
    },

    /** Resolves the Product search projection model from runtime model registry or database handle. @param {Object} request Read request. @returns {Object|undefined} Model or collection handle. */
    projectionStoreModel: function (request) {
        let moduleName = request.moduleName || 'product', tenant = request.tenant;
        if (global.NODICS && typeof NODICS.getModels === 'function') {
            let models = NODICS.getModels(moduleName, tenant) || {};
            if (models.ProductSearchProjectionModel) return models.ProductSearchProjectionModel;
        }
        if (!SERVICE.DefaultDatabaseConfigurationService || typeof SERVICE.DefaultDatabaseConfigurationService.getTenantDatabase !== 'function') return undefined;
        let database = SERVICE.DefaultDatabaseConfigurationService.getTenantDatabase(moduleName, tenant);
        let master = database && (database.master || database.default || database);
        let connection = master && typeof master.getConnection === 'function' ? master.getConnection() : undefined;
        return connection && typeof connection.collection === 'function' ? connection.collection('ProductSearchProjectionModel') : undefined;
    },

    /** Resolves the native Product projection-store collection so generated model caps cannot truncate customer browse pages. @param {Object} request Read request. @returns {Object|undefined} Collection handle. */
    rawProjectionStoreModel: function (request) {
        if (!SERVICE.DefaultDatabaseConfigurationService || typeof SERVICE.DefaultDatabaseConfigurationService.getTenantDatabase !== 'function') return undefined;
        let moduleName = request.moduleName || 'product', tenant = request.tenant;
        let database = SERVICE.DefaultDatabaseConfigurationService.getTenantDatabase(moduleName, tenant);
        let master = database && (database.master || database.default || database);
        let connection = master && typeof master.getConnection === 'function' ? master.getConnection() : undefined;
        return connection && typeof connection.collection === 'function' ? connection.collection('ProductSearchProjectionModel') : undefined;
    },

    /** Extracts records from generated service, nSearch, or adapter result shapes. @param {*} response Service response. @returns {Array} Records. */
    records: function (response) {
        if (Array.isArray(response)) return response;
        if (response && Array.isArray(response.result)) return response.result;
        if (response && response.data && Array.isArray(response.data)) return response.data;
        if (response && response.data && Array.isArray(response.data.result)) return response.data.result;
        let hits = this.findHits(response, 0);
        if (hits) {
            return hits.hits.map(hit => hit._source || hit.source || hit);
        }
        return [];
    },

    /** Finds an Elasticsearch-compatible hits envelope within wrapped nSearch pipeline responses. @param {*} value Candidate value. @param {number} depth Current recursion depth. @returns {Object|undefined} Hits envelope. */
    findHits: function (value, depth) {
        if (!value || depth > 6 || typeof value !== 'object') return undefined;
        if (value.hits && Array.isArray(value.hits.hits)) return value.hits;
        for (let key of ['result', 'data', 'body', 'response', 'payload']) {
            let found = this.findHits(value[key], depth + 1);
            if (found) return found;
        }
        return undefined;
    },

    /** Whitelists customer-safe price fields. @param {Object} price Indexed price summary. @returns {Object|undefined} Price summary. */
    price: function (price) {
        if (!price) return undefined;
        return { currency: price.currency, unitAmount: price.unitAmount };
    },

    /** Whitelists customer-safe availability fields. @param {Object} availability Indexed availability summary. @returns {Object|undefined} Availability summary. */
    availability: function (availability) {
        if (!availability) return undefined;
        return { available: availability.available === true, status: availability.status };
    },

    /** Resolves the configured media delivery authority exposed to browser clients. @returns {string} Delivery base URL. */
    mediaDeliveryBaseUrl: function () {
        let value = this.policy().mediaDeliveryBaseUrl || '/nodics/media/v0/content';
        return String(value).replace(/\/+$/g, '');
    },

    /** Builds a public/session-scoped media delivery URL without exposing provider storage coordinates. @param {string} mediaCode Media code. @returns {string|undefined} Delivery URL. */
    mediaDeliveryUrl: function (mediaCode) {
        return mediaCode ? this.mediaDeliveryBaseUrl() + '/' + encodeURIComponent(mediaCode) : undefined;
    },

    /** Resolves a client-safe product media descriptor. @param {*} candidate Media code or descriptor. @param {string} role Role. @param {string|undefined} altText Alternate text. @returns {Object|undefined} Media descriptor. */
    mediaDescriptor: function (candidate, role, altText) {
        if (!candidate) return undefined;
        if (typeof candidate === 'string') {
            if (/^https?:\/\//.test(candidate) || candidate.charAt(0) === '/') {
                return { role: role, url: candidate, deliveryUrl: candidate, publicUrl: candidate, altText: altText };
            }
            return {
                code: candidate,
                mediaCode: candidate,
                role: role,
                deliveryUrl: this.mediaDeliveryUrl(candidate),
                publicUrl: this.mediaDeliveryUrl(candidate),
                altText: altText
            };
        }
        if (typeof candidate !== 'object') return undefined;
        let code = candidate.mediaCode || candidate.code;
        let directUrl = candidate.deliveryUrl || candidate.publicUrl || candidate.url || candidate.image;
        let descriptor = {
            code: code,
            mediaCode: code,
            role: candidate.role || role,
            name: candidate.name,
            description: candidate.description,
            formatCode: candidate.formatCode,
            mimeType: candidate.mimeType,
            sizeBytes: candidate.sizeBytes,
            extension: candidate.extension,
            access: candidate.access,
            businessPurpose: candidate.businessPurpose,
            ownerType: candidate.ownerType,
            ownerReference: candidate.ownerReference,
            deliveryUrl: directUrl || this.mediaDeliveryUrl(code),
            publicUrl: candidate.publicUrl || directUrl || this.mediaDeliveryUrl(code),
            altText: candidate.altText || altText
        };
        Object.keys(descriptor).forEach(key => descriptor[key] === undefined && delete descriptor[key]);
        return descriptor.deliveryUrl || descriptor.mediaCode ? descriptor : undefined;
    },

    /** Resolves customer-safe product media metadata and render URLs. @param {Object} payload Indexed product payload. @returns {Object} Media projection. */
    media: function (payload) {
        let productMedia = payload.media || {};
        let primary = this.mediaDescriptor(productMedia.primary || productMedia.primaryImage, 'primary', productMedia.primaryAlt || payload.name);
        let secondary = this.mediaDescriptor(productMedia.secondary || productMedia.secondaryImage, 'secondary', productMedia.primaryAlt || payload.name);
        let gallery = (productMedia.gallery || [])
            .map(item => this.mediaDescriptor(item, 'gallery', productMedia.primaryAlt || payload.name))
            .filter(Boolean);
        if (primary && !gallery.some(item => item.mediaCode && item.mediaCode === primary.mediaCode)) gallery.unshift(primary);
        if (secondary && !gallery.some(item => item.mediaCode && item.mediaCode === secondary.mediaCode)) gallery.push(secondary);
        return {
            primary: primary,
            secondary: secondary,
            gallery: gallery
        };
    },

    /** Resolves the primary customer-safe product visual URL. @param {Object} payload Indexed product payload. @returns {string|undefined} Product visual URL. */
    image: function (payload) {
        let primary = this.media(payload).primary;
        return primary && primary.deliveryUrl;
    },

    /** Resolves the customer-safe product visual gallery URLs. @param {Object} payload Indexed product payload. @returns {Array} Product visual gallery. */
    gallery: function (payload) {
        return this.media(payload).gallery.map(item => item.deliveryUrl).filter(Boolean);
    },

    /** Projects one search projection into a customer-safe card. @param {Object} projection Product search projection. @returns {Object} Card. */
    card: function (projection) {
        let payload = projection.payload || {};
        return {
            productCode: projection.productCode || payload.code,
            name: payload.name,
            slug: payload.slug,
            summary: payload.description,
            categoryCodes: payload.categoryCodes || [],
            variantCodes: payload.variantCodes || [],
            seo: payload.seo,
            localizedAttributes: payload.localizedAttributes || {},
            media: this.media(payload),
            price: this.price(payload.price),
            availability: this.availability(payload.availability),
            apparel: payload.apparel,
            electronics: payload.electronics,
            telco: payload.telco
        };
    },

    /** Projects one search projection into a customer-safe PDP detail. @param {Object} projection Product search projection. @returns {Object} Detail. */
    detailProjection: function (projection) {
        let card = this.card(projection), payload = projection.payload || {};
        return Object.assign({}, card, {
            description: payload.description,
            variants: payload.variants || [],
            relatedProductCodes: payload.relatedProductCodes || []
        });
    },

    /** Builds customer-safe facet summaries from returned Product cards. @param {Array} products Product cards. @returns {Object} Facet summary. */
    facets: function (products) {
        let categories = new Map(), availability = new Map();
        (products || []).forEach(product => {
            (product.categoryCodes || []).forEach(code => categories.set(code, (categories.get(code) || 0) + 1));
            let status = product.availability && product.availability.status;
            if (status) availability.set(status, (availability.get(status) || 0) + 1);
        });
        return {
            categories: Array.from(categories.entries()).map(entry => ({ code: entry[0], count: entry[1] })),
            availability: Array.from(availability.entries()).map(entry => ({ code: entry[0], count: entry[1] }))
        };
    },

    /** Applies optional Commerce Search ranking without exposing rule internals. @param {Object} request Request. @param {Array} products Product cards. @returns {Promise<Array>} Ranked cards. */
    rank: async function (request, products) {
        let service = SERVICE.DefaultCommerceSearchRankingService;
        if (!service || typeof service.rank !== 'function') return products;
        try {
            return await service.rank(request, products);
        } catch (error) {
            if (((CONFIG.get('product') || {}).discovery || {}).rankingFailureBehavior === 'error') throw error;
            return products;
        }
    },

    /** Lists customer-safe Product cards. @param {Object} request Nodics request. @returns {Promise<Object>} Product card response. */
    list: async function (request) {
        request.indexConfiguration = await this.indexConfiguration(request);
        let searchOptions = this.searchOptions(request), records = await this.search(request, this.query(request), searchOptions);
        let products = records.map(this.card.bind(this));
        return {
            tenant: request.tenant, storeCode: request.storeCode, locale: request.locale,
            page: searchOptions.pageNumber, pageSize: searchOptions.pageSize,
            products: await this.rank(request, products),
            facets: this.facets(products),
            discovery: this.discoveryMetadata(request, request.indexConfiguration)
        };
    },

    /** Resolves one customer-safe Product detail. @param {Object} request Nodics request. @returns {Promise<Object>} Product detail response. */
    detail: async function (request) {
        if (!request.productCode || !/^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(String(request.productCode))) {
            throw new Error('Product code is invalid');
        }
        request.indexConfiguration = await this.indexConfiguration(request);
        let records = await this.search(request, this.query(request), { limit: 2, pageSize: 2, pageNumber: 1 });
        if (records.length !== 1) {
            let error = new Error('Product is unavailable');
            error.statusCode = records.length === 0 ? 404 : 409;
            throw error;
        }
        let product = this.detailProjection(records[0]);
        return {
            tenant: request.tenant, storeCode: request.storeCode, locale: request.locale,
            product: product,
            relatedProducts: [],
            discovery: this.discoveryMetadata(request, request.indexConfiguration)
        };
    }
};
