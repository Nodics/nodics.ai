/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module product/service/defaultProductSearchPublicationService
 * @description Coordinates Product completeness, staged evidence, persistence, and nSearch indexing for every ready locale.
 * @layer service
 * @owner product
 * @override Later modules may replace orchestration while retaining Product ownership and nSearch provider-neutral pipelines.
 */
module.exports = {
    /** Returns bounded Product search configuration selected through layered properties. */
    policy: function () {
        return SERVICE.DefaultProductLocalizationPolicyService.policy();
    },

    /** Prepares a mutable persistence model with required base metadata for generated Mongo validators. */
    persistenceModel: function (request, projection) {
        let now = request.now ? new Date(request.now) : new Date();
        return Object.assign({}, projection, {
            active: projection.active !== undefined ? projection.active : true,
            created: projection.created instanceof Date ? projection.created : now,
            updated: now
        });
    },

    /** Fails closed when nSearch reports per-document save failures inside a successful pipeline response. */
    assertSearchSaveSucceeded: function (response, model) {
        let errors = response && Array.isArray(response.errors) ? response.errors :
            response && response.result && Array.isArray(response.result.errors) ? response.result.errors : [];
        if (errors.length === 0) return;
        let detail = errors.map(error => error && (error.message || error.code) || String(error)).join('; ');
        let error = new Error('Product search projection indexing failed for ' + model.code + ': ' + detail);
        error.code = 'ERR_PRODUCT_SEARCH_INDEX_0001';
        error.errors = errors;
        throw error;
    },

    /** Resolves the active nSearch model for a provider-neutral operation. */
    searchModel: function (request, operation) {
        let indexName = request.indexName || this.policy().searchIndexName || 'productLocalized';
        let searchModel = NODICS.getSearchModel(request.moduleName || 'product', request.tenant, indexName);
        if (!searchModel || typeof searchModel[operation] !== 'function') {
            throw new Error('Product search publication requires an nSearch ' + operation + ' model for ' + indexName);
        }
        request.indexName = indexName;
        request.searchModel = searchModel;
        return searchModel;
    },

    /** Returns a minimal nSearch operation service backed by the active search model registry. */
    searchOperationService: function () {
        let self = this;
        return {
            /** Saves one Product projection through the active nSearch model pipeline. */
            doSave: function (request) {
                self.searchModel(request, 'doSave');
                return SERVICE.DefaultPipelineService.start('doSaveModelsInitializerPipeline', request, {});
            },
            /** Removes Product projections through the active nSearch model pipeline. */
            doRemoveByQuery: function (request) {
                self.searchModel(request, 'doRemoveByQuery');
                return SERVICE.DefaultPipelineService.start('doRemoveModelsByQueryInitializerPipeline', request, {});
            }
        };
    },

    /** Returns the active nSearch service boundary for provider-neutral indexing operations. */
    searchService: function () {
        if (SERVICE.DefaultSearchService && typeof SERVICE.DefaultSearchService.doSave === 'function' &&
            typeof SERVICE.DefaultSearchService.doRemoveByQuery === 'function') return SERVICE.DefaultSearchService;
        if (SERVICE.DefaultProductSearchProjectionService && typeof SERVICE.DefaultProductSearchProjectionService.doSave === 'function') {
            return SERVICE.DefaultProductSearchProjectionService;
        }
        return this.searchOperationService();
    },

    /** Publishes one Product into deterministic locale-specific persistence and nSearch projections. */
    publish: async function (request, input) {
        if (!input || !input.product || !input.storeCode) throw new Error('Product and Store are required for localized search publication');
        let staged = SERVICE.DefaultProductPublicationPolicyService.stageLocalized(request, input.product, input.localizations);
        let locales = Array.from(new Set((input.localizations || []).filter(item => item.tenant === request.tenant && item.status === 'READY')
            .map(item => SERVICE.DefaultProductLocalizationPolicyService.canonicalize(item.locale))));
        let projections = [];
        try {
            let customerSummaries = SERVICE.DefaultProductSearchEnrichmentService && typeof SERVICE.DefaultProductSearchEnrichmentService.enrich === 'function'
                ? await SERVICE.DefaultProductSearchEnrichmentService.enrich(request, input) : {};
            for (let locale of locales) {
                let projection = SERVICE.DefaultProductLocalizedProjectionBuilderService.build(request, Object.assign({}, input, {
                    locale: locale,
                    customerSummaries: customerSummaries
                }));
                let model = this.persistenceModel(request, projection);
                await SERVICE.DefaultProductSearchProjectionService.save({ tenant: request.tenant, authData: request.authData, model: model });
                this.assertSearchSaveSucceeded(await this.searchService().doSave({ tenant: request.tenant,
                    moduleName: 'product', indexName: this.policy().searchIndexName, model: model,
                    searchOptions: { analyzer: (this.policy().analyzerByLocale || {})[locale] } }), model);
                projections.push(model);
            }
        } catch (error) {
            try { await this.withdraw(request, { productCode: input.product.code, storeCode: input.storeCode }); } catch (compensationError) {
                error.compensationError = compensationError;
            }
            throw error;
        }
        return { publication: staged, projections: projections };
    },

    /** Restores a previously evidenced set of projections through the same persistence and nSearch boundary. */
    restore: async function (request, input) {
        if (!request || !request.tenant || !input || !input.productCode || !input.storeCode || !Array.isArray(input.projections)) {
            throw new Error('Tenant, Product, Store, and projections are required for search restoration');
        }
        let restored = [];
        for (let snapshot of input.projections) {
            if (snapshot.tenant !== request.tenant || snapshot.productCode !== input.productCode || snapshot.storeCode !== input.storeCode) {
                throw new Error('Search restoration projection escaped its tenant Product or Store boundary');
            }
            let model = this.persistenceModel(request, Object.assign({}, snapshot, { status: 'CURRENT',
                projectedAt: request.now ? new Date(request.now) : new Date() }));
            await SERVICE.DefaultProductSearchProjectionService.save({ tenant: request.tenant, authData: request.authData, model: model });
            this.assertSearchSaveSucceeded(await this.searchService().doSave({ tenant: request.tenant, moduleName: 'product',
                indexName: this.policy().searchIndexName, model: model, searchOptions: { analyzer: (this.policy().analyzerByLocale || {})[model.locale] } }), model);
            restored.push(model);
        }
        return restored;
    },

    /** Withdraws all current projections for one tenant and Store when a full replacement was approved. */
    replaceStore: async function (request, input) {
        if (!request || !request.tenant || !input || !input.storeCode) {
            throw new Error('Tenant and Store are required for search store replacement');
        }
        let query = { tenant: request.tenant, storeCode: input.storeCode, status: 'CURRENT' };
        await SERVICE.DefaultProductSearchProjectionService.update({ tenant: request.tenant,
            authData: request.authData, query: query, model: { status: 'WITHDRAWN' } });
        await this.searchService().doRemoveByQuery({ tenant: request.tenant, moduleName: 'product',
            indexName: this.policy().searchIndexName, query: query });
        return { status: 'WITHDRAWN', storeCode: input.storeCode };
    },

    /** Withdraws persisted and indexed projections for one tenant-scoped Product and Store. */
    withdraw: async function (request, input) {
        if (!request || !request.tenant || !input || !input.productCode || !input.storeCode) {
            throw new Error('Tenant, Product, and Store are required for search withdrawal');
        }
        let query = { tenant: request.tenant, productCode: input.productCode, storeCode: input.storeCode };
        await SERVICE.DefaultProductSearchProjectionService.update({ tenant: request.tenant,
            authData: request.authData, query: query, model: { status: 'WITHDRAWN' } });
        await this.searchService().doRemoveByQuery({ tenant: request.tenant, moduleName: 'product',
            indexName: this.policy().searchIndexName, query: query });
        return { status: 'WITHDRAWN', productCode: input.productCode, storeCode: input.storeCode };
    }
};
