/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module product/service/defaultProductCatalogPublicationOrchestrationService
 * @description Loads persisted Product records and coordinates Product-owned search publication for one Store.
 * @layer service
 * @owner product
 * @override Later modules may add approval, batching, or category enrichment while preserving Product-owned publication and nSearch boundaries.
 */
module.exports = {
    /** Initializes the service lifecycle. @returns {Promise<boolean>} Initialization result. */
    init: function () { return Promise.resolve(true); },
    /** Completes the service lifecycle. @returns {Promise<boolean>} Initialization result. */
    postInit: function () { return Promise.resolve(true); },

    /** Returns effective Product publication policy. @returns {Object} Policy. */
    policy: function () { return ((CONFIG.get('product') || {}).publication) || {}; },

    /** Extracts records from generated service responses. @param {*} response Service response. @returns {Array} Records. */
    records: function (response) {
        if (Array.isArray(response)) return response;
        if (response && Array.isArray(response.result)) return response.result;
        if (response && response.data && Array.isArray(response.data.result)) return response.data.result;
        return [];
    },

    /** Builds a bounded query for persisted Products. @param {Object} request Nodics request. @param {Object} input Publication input. @returns {Object} Product query. */
    productQuery: function (request, input) {
        let query = { tenant: request.tenant, status: 'ACTIVE' };
        if (input.catalogVersion) query.catalogVersion = input.catalogVersion;
        if (Array.isArray(input.productCodes) && input.productCodes.length > 0) query.code = { $in: input.productCodes };
        return query;
    },

    /** Loads persisted Product records. @param {Object} request Nodics request. @param {Object} input Publication input. @returns {Promise<Array>} Products. */
    loadProducts: async function (request, input) {
        let limit = Number(this.policy().maximumBatchSize || 100);
        let response = await SERVICE.DefaultProductService.get({
            tenant: request.tenant, authData: request.authData, query: this.productQuery(request, input),
            searchOptions: { pageSize: limit + 1, pageNumber: 1 }
        });
        let products = this.records(response);
        if (products.length > limit) throw new Error('Product publication batch exceeds configured limit');
        return products;
    },

    /** Loads persisted Product localizations for selected Products. @param {Object} request Nodics request. @param {Array} products Products. @returns {Promise<Array>} Localizations. */
    loadLocalizations: async function (request, products) {
        if (products.length === 0) return [];
        let response = await SERVICE.DefaultProductLocalizationService.get({
            tenant: request.tenant, authData: request.authData,
            query: { tenant: request.tenant, productCode: { $in: products.map(product => product.code) }, status: 'READY' },
            searchOptions: { pageSize: products.length * 10, pageNumber: 1 }
        });
        return this.records(response);
    },

    /** Loads persisted Product variants for selected Products. @param {Object} request Nodics request. @param {Array} products Products. @returns {Promise<Array>} Variants. */
    loadVariants: async function (request, products) {
        if (products.length === 0) return [];
        let response = await SERVICE.DefaultProductVariantService.get({
            tenant: request.tenant, authData: request.authData,
            query: { tenant: request.tenant, productCode: { $in: products.map(product => product.code) }, status: 'ACTIVE' },
            searchOptions: { pageSize: products.length * 50, pageNumber: 1 }
        });
        return this.records(response);
    },

    /** Resolves category codes from localized classification evidence. @param {Array} localizations Product localizations. @returns {Array} Category codes. */
    categoryCodes: function (localizations) {
        let first = localizations.find(item => item.classificationValues && Array.isArray(item.classificationValues.categoryCodes));
        return first ? first.classificationValues.categoryCodes : [];
    },

    /** Publishes one Product through Product-owned search publication. @param {Object} request Nodics request. @param {Object} product Product. @param {Array} localizations Localizations. @param {Array} variants Variants. @param {string} storeCode Store code. @returns {Promise<Object>} Publication result. */
    publishOne: function (request, product, localizations, variants, storeCode) {
        return SERVICE.DefaultProductSearchPublicationService.publish(request, {
            product: product,
            localizations: localizations,
            storeCode: storeCode,
            categoryCodes: this.categoryCodes(localizations),
            variantCodes: variants.map(variant => variant.code),
            variants: variants
        });
    },

    /** Publishes persisted Products into Product search projections. @param {Object} request Nodics request. @param {Object} input Publication input. @returns {Promise<Object>} Publication summary. */
    publishSearch: async function (request, input) {
        let policy = this.policy(), storeCode = input.storeCode || policy.defaultStoreCode;
        if (!storeCode) throw new Error('Store code is required for Product search publication');
        let products = await this.loadProducts(request, input || {});
        let localizations = await this.loadLocalizations(request, products);
        let variants = await this.loadVariants(request, products);
        let results = [];
        for (let product of products) {
            let productLocalizations = localizations.filter(item => item.productCode === product.code);
            let productVariants = variants.filter(item => item.productCode === product.code);
            results.push(await this.publishOne(request, product, productLocalizations, productVariants, storeCode));
        }
        let summary = {
            tenant: request.tenant, storeCode: storeCode,
            requested: products.length,
            published: results.length,
            projectionCount: results.reduce((sum, item) => sum + ((item.projections || []).length), 0),
            products: results.map(item => ({
                productCode: item.publication.productCode,
                status: item.publication.status,
                projectionCodes: (item.projections || []).map(projection => projection.code)
            }))
        };
        if (input.includeProjectionSnapshots === true) {
            summary.projectionSnapshots = results.map(item => ({
                productCode: item.publication.productCode,
                storeCode: storeCode,
                projections: (item.projections || []).map(projection => Object.assign({}, projection))
            }));
        }
        return summary;
    },

    /** Restores evidenced Product search projections into the current runtime. @param {Object} request Nodics request. @param {Object} input Restoration input. @returns {Promise<Object>} Restoration summary. */
    restoreSearch: async function (request, input) {
        let policy = this.policy(), storeCode = input.storeCode || policy.defaultStoreCode;
        let snapshots = Array.isArray(input.projectionSnapshots) ? input.projectionSnapshots : [];
        if (!storeCode) throw new Error('Store code is required for Product search restoration');
        if (snapshots.length === 0) throw new Error('Projection snapshots are required for Product search restoration');
        if (input.replaceStore === true) {
            await SERVICE.DefaultProductSearchPublicationService.replaceStore(request, { storeCode: storeCode });
        }
        let results = [];
        for (let snapshot of snapshots) {
            let productCode = snapshot.productCode;
            let projections = Array.isArray(snapshot.projections) ? snapshot.projections : [];
            let restored = await SERVICE.DefaultProductSearchPublicationService.restore(request, {
                productCode: productCode,
                storeCode: snapshot.storeCode || storeCode,
                projections: projections
            });
            results.push({ productCode: productCode, restored: restored });
        }
        return {
            tenant: request.tenant,
            storeCode: storeCode,
            restored: results.length,
            projectionCount: results.reduce((sum, item) => sum + item.restored.length, 0),
            products: results.map(item => ({
                productCode: item.productCode,
                projectionCodes: item.restored.map(projection => projection.code)
            }))
        };
    }
};
