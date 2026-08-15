/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
const crypto = require('node:crypto');
/** @module cart/src/service/defaultCartApiService @description Owns customer Cart lifecycle APIs and runs the Cart calculation pipeline for authoritative evidence. @layer service @owner cart */
module.exports = {
    /** Unwraps generated service responses. @param {*} response Service response. @returns {*} Unwrapped value. */
    unwrap: function (response) { return response && Object.prototype.hasOwnProperty.call(response, 'result') ? response.result : response; },
    /** Removes backend-only evidence from public customer calculation responses. @param {*} value Calculation value. @returns {*} Customer-safe clone. */
    redactCustomerCalculation: function redactCustomerCalculation(value) {
        if (Array.isArray(value)) return value.map(item => redactCustomerCalculation(item));
        if (!value || typeof value !== 'object') return value;
        const forbidden = { priceRowCode: true, warehouseCode: true, supplierCost: true, internalOnly: true, candidates: true };
        return Object.keys(value).reduce((target, key) => {
            if (!forbidden[key]) target[key] = redactCustomerCalculation(value[key]);
            return target;
        }, {});
    },

    /** Returns effective Cart defaults. @returns {Object} Cart API policy. */
    policy: function () {
        return ((CONFIG.get('cart') || {}).customerApi) || {};
    },

    /** Builds a customer-safe access denial without leaking cart ownership. @returns {Error} Access denial. */
    accessDeniedError: function () {
        return typeof CLASSES !== 'undefined' && CLASSES.NodicsError ?
            new CLASSES.NodicsError('ERR_AUTH_00003', 'current user do not have access to this resource') :
            new Error('Customer Cart not found');
    },

    /** Builds service-account authorization context for internal Product variant SKU lookup. @param {Object} request Request. @returns {Object} Service authorization data. */
    serviceAuthData: function (request) {
        return Object.assign({}, request.authData || {}, {
            tenant: request.tenant,
            loginId: 'cartSkuResolution',
            principalType: 'service',
            userGroups: ['serviceAccountUserGroup'],
            groups: ['serviceAccountUserGroup']
        });
    },

    /** Creates a stable cart code. @param {Object} request Request. @returns {string} Cart code. */
    cartCode: function (request) {
        return request.payload.cartCode || 'cart_' + crypto.createHash('sha1').update([request.tenant, request.ownerId, request.payload.storeCode || this.policy().defaultStoreCode || 'default'].join('|')).digest('hex').slice(0, 16);
    },

    /** Builds a Cart model from a customer request. @param {Object} request Request. @returns {Object} Cart model. */
    cartModel: function (request) {
        let policy = this.policy(), payload = request.payload || {};
        return {
            code: this.cartCode(request),
            tenant: request.tenant,
            ownerId: request.ownerId,
            storeCode: payload.storeCode || request.storeCode || policy.defaultStoreCode || 'agoraMainStore',
            channelCode: payload.channelCode || policy.defaultChannelCode || 'web',
            locale: payload.locale || request.locale || policy.defaultLocale || 'en',
            jurisdiction: payload.jurisdiction || policy.defaultJurisdiction || 'US',
            currency: payload.currency || policy.defaultCurrency || 'USD',
            status: 'ACTIVE',
            active: true,
            revision: 0,
            correlationId: request.correlationId || request.requestId || this.cartCode(request)
        };
    },

    /** Resolves an internal SKU from a customer-safe Product variant code when the customer request does not expose a raw SKU. @param {Object} request Request. @returns {Promise<string|undefined>} Resolved SKU. */
    resolveSku: async function (request) {
        let payload = request.payload || {};
        if (payload.sku) return payload.sku;
        if (!payload.variantCode) return undefined;
        let service = SERVICE.DefaultProductVariantService;
        if (service && typeof service.get === 'function') {
            let response = await service.get({
                tenant: request.tenant,
                authData: this.serviceAuthData(request),
                query: {
                    tenant: request.tenant,
                    code: payload.variantCode,
                    productCode: payload.productCode,
                    status: 'ACTIVE'
                },
                searchOptions: { pageSize: 1, pageNumber: 1 }
            });
            let result = this.unwrap(response);
            let variant = Array.isArray(result) ? result[0] : result;
            if (variant && variant.sku) return variant.sku;
        }
        return this.resolveSkuFromSearchProjection(request);
    },

    /** Resolves SKU from an internal Online Product search projection field that is not exposed by public PDP/PLP. @param {Object} request Request. @returns {Promise<string|undefined>} Resolved SKU. */
    resolveSkuFromSearchProjection: async function (request) {
        let payload = request.payload || {}, service = SERVICE.DefaultProductSearchProjectionService;
        if (!service || typeof service.get !== 'function' || !payload.productCode || !payload.variantCode) return undefined;
        let query = { tenant: request.tenant, productCode: payload.productCode, status: 'CURRENT' };
        if (request.storeCode) query.storeCode = request.storeCode;
        if (request.locale) query.locale = request.locale;
        let response = await service.get({
            tenant: request.tenant,
            authData: this.serviceAuthData(request),
            query,
            searchOptions: { pageSize: 5, pageNumber: 1 }
        });
        let result = this.unwrap(response);
        let projections = Array.isArray(result) ? result : result ? [result] : [];
        for (let projection of projections) {
            let sku = projection && projection.payload && projection.payload.variantSkuMap && projection.payload.variantSkuMap[payload.variantCode];
            if (sku) return sku;
        }
        return undefined;
    },

    /** Builds a Cart Entry model from a customer request. @param {Object} request Request. @returns {Promise<Object>} Entry model. */
    entryModel: async function (request) {
        let payload = request.payload || {};
        let sku = await this.resolveSku(request);
        if (!payload.productCode || !sku || !payload.quantity) throw new Error('Product, SKU or variant, and quantity are required for Cart entry');
        return {
            code: payload.entryCode || [request.cartCode, payload.productCode, sku].join('|'),
            tenant: request.tenant,
            ownerId: request.ownerId,
            cartCode: request.cartCode,
            productCode: payload.productCode,
            variantCode: payload.variantCode,
            sku: sku,
            quantity: String(payload.quantity),
            status: 'ACTIVE',
            active: true,
            revision: 0,
            correlationId: request.correlationId || request.requestId || request.cartCode
        };
    },

    /** Loads one owned Cart. @param {Object} request Request. @returns {Promise<Object>} Cart. */
    loadCart: async function (request) {
        let response = await SERVICE.DefaultCartService.get({ tenant: request.tenant, authData: request.authData, query: { tenant: request.tenant, code: request.cartCode, ownerId: request.ownerId }, pageSize: 1 });
        let result = this.unwrap(response);
        let cart = Array.isArray(result) ? result[0] : result;
        if (!cart) throw this.accessDeniedError();
        return cart;
    },

    /** Loads active entries for an owned Cart. @param {Object} request Request. @returns {Promise<Array>} Entries. */
    loadEntries: async function (request) {
        let response = await SERVICE.DefaultCartEntryService.get({ tenant: request.tenant, authData: request.authData, query: { tenant: request.tenant, cartCode: request.cartCode, ownerId: request.ownerId, status: 'ACTIVE' }, pageSize: 500 });
        let result = this.unwrap(response);
        return Array.isArray(result) ? result : result ? [result] : [];
    },

    /** Builds a customer-safe Cart response. @param {Object} request Request. @param {Object} cart Cart. @returns {Promise<Object>} Response. */
    response: async function (request, cart) {
        request.cartCode = cart.code;
        return { cart: cart, entries: await this.loadEntries(request) };
    },

    /** Creates or replaces an active Cart shell for a customer. @param {Object} request Request. @returns {Promise<Object>} Cart response. */
    create: async function (request) {
        let model = this.cartModel(request);
        let saved = await SERVICE.DefaultCartService.save({ tenant: request.tenant, authData: request.authData, model }).then(this.unwrap);
        return this.response(Object.assign({}, request, { cartCode: saved.code }), saved);
    },

    /** Reads a customer-owned Cart. @param {Object} request Request. @returns {Promise<Object>} Cart response. */
    read: async function (request) {
        return this.response(request, await this.loadCart(request));
    },

    /** Adds an active entry to a customer-owned Cart. @param {Object} request Request. @returns {Promise<Object>} Cart response. */
    addEntry: async function (request) {
        let cart = await this.loadCart(request);
        request.storeCode = request.storeCode || cart.storeCode;
        request.locale = request.locale || cart.locale;
        let entry = await this.entryModel(request);
        await SERVICE.DefaultCartEntryService.save({ tenant: request.tenant, authData: request.authData, model: entry }).then(this.unwrap);
        return this.read(request);
    },

    /** Updates quantity for an active customer-owned Cart entry. @param {Object} request Request. @returns {Promise<Object>} Cart response. */
    updateEntry: async function (request) {
        let payload = request.payload || {};
        if (!request.entryCode || !payload.quantity) throw new Error('Entry code and quantity are required');
        await this.loadCart(request);
        let model = { tenant: request.tenant, code: request.entryCode, ownerId: request.ownerId, cartCode: request.cartCode, quantity: String(payload.quantity), status: 'ACTIVE', active: true };
        if (SERVICE.DefaultCartEntryService.update) await SERVICE.DefaultCartEntryService.update({ tenant: request.tenant, authData: request.authData, query: { tenant: request.tenant, code: request.entryCode, ownerId: request.ownerId, cartCode: request.cartCode }, model }).then(this.unwrap);
        else await SERVICE.DefaultCartEntryService.save({ tenant: request.tenant, authData: request.authData, model }).then(this.unwrap);
        return this.read(request);
    },

    /** Marks a customer-owned Cart entry removed. @param {Object} request Request. @returns {Promise<Object>} Cart response. */
    removeEntry: async function (request) {
        if (!request.entryCode) throw new Error('Entry code is required');
        await this.loadCart(request);
        let model = { tenant: request.tenant, code: request.entryCode, ownerId: request.ownerId, cartCode: request.cartCode, status: 'REMOVED', active: true };
        if (SERVICE.DefaultCartEntryService.update) await SERVICE.DefaultCartEntryService.update({ tenant: request.tenant, authData: request.authData, query: { tenant: request.tenant, code: request.entryCode, ownerId: request.ownerId, cartCode: request.cartCode }, model }).then(this.unwrap);
        else await SERVICE.DefaultCartEntryService.save({ tenant: request.tenant, authData: request.authData, model }).then(this.unwrap);
        return this.read(request);
    },

    /** Starts the governed Cart calculation pipeline. @param {Object} request Tenant-scoped calculation request. @returns {Promise<Object>} Calculation response. */
    calculate: function (request) {
        return SERVICE.DefaultPipelineService.start('commerceCartCalculationPipeline', request, {}).then(result => request.internalUse === true ? result : this.redactCustomerCalculation(result));
    },
    /** Loads an owned Cart and persists an exact calculation snapshot. @param {Object} request Tenant and customer request. @returns {Promise<Object>} Stored calculation. */
    calculateDirect: async function (request) {
        const carts = await SERVICE.DefaultCartService.get({ tenant: request.tenant, authData: request.authData, query: { tenant: request.tenant, code: request.cartCode, ownerId: request.ownerId }, pageSize: 1 }).then(this.unwrap);
        const cart = Array.isArray(carts) ? carts[0] : carts;
        if (!cart) throw this.accessDeniedError();
        if (request.payload.expectedRevision !== undefined && Number(request.payload.expectedRevision) !== Number(cart.revision)) throw new Error('Cart revision conflict');
        const entriesResponse = await SERVICE.DefaultCartEntryService.get({ tenant: request.tenant, authData: request.authData, query: { tenant: request.tenant, cartCode: cart.code, ownerId: request.ownerId, status: 'ACTIVE' }, pageSize: 500 }).then(this.unwrap);
        const entries = Array.isArray(entriesResponse) ? entriesResponse : [];
        if (entries.length > Number(((CONFIG.get('commerce') || {}).operations || {}).limits.maximumCartEntries || 500)) throw new Error('Cart entry limit exceeded');
        const result = await SERVICE.DefaultCartCalculationEngineService.calculate(Object.assign({}, cart, { entries, correlationId: request.correlationId || request.requestId }), SERVICE.DefaultCommerceCalculationPortsService.create(cart));
        const sourceHash = crypto.createHash('sha256').update(JSON.stringify(result)).digest('hex');
        const model = Object.assign({}, result, { code: request.payload.calculationCode, ownerId: request.ownerId, cartRevision: cart.revision, status: 'CURRENT', active: true, revision: 0, sourceHash, calculatedAt: new Date() });
        return SERVICE.DefaultCartCalculationService.save({ tenant: request.tenant, authData: request.authData, model }).then(this.unwrap);
    }
};
