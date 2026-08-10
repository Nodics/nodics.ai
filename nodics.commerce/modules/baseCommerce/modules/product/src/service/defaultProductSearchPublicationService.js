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

    /** Publishes one Product into deterministic locale-specific persistence and nSearch projections. */
    publish: async function (request, input) {
        if (!input || !input.product || !input.storeCode) throw new Error('Product and Store are required for localized search publication');
        let staged = SERVICE.DefaultProductPublicationPolicyService.stageLocalized(request, input.product, input.localizations);
        let locales = Array.from(new Set((input.localizations || []).filter(item => item.tenant === request.tenant && item.status === 'READY')
            .map(item => SERVICE.DefaultProductLocalizationPolicyService.canonicalize(item.locale))));
        let projections = [];
        try {
            for (let locale of locales) {
                let projection = SERVICE.DefaultProductLocalizedProjectionBuilderService.build(request, Object.assign({}, input, { locale: locale }));
                await SERVICE.DefaultProductSearchProjectionService.save({ tenant: request.tenant, authData: request.authData, model: projection });
                await SERVICE.DefaultProductSearchProjectionService.doSave({ tenant: request.tenant,
                    moduleName: 'product', indexName: this.policy().searchIndexName, model: projection,
                    searchOptions: { analyzer: (this.policy().analyzerByLocale || {})[locale] } });
                projections.push(projection);
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
            let model = Object.assign({}, snapshot, { status: 'CURRENT', projectedAt: request.now || new Date().toISOString() });
            await SERVICE.DefaultProductSearchProjectionService.save({ tenant: request.tenant, authData: request.authData, model: model });
            await SERVICE.DefaultProductSearchProjectionService.doSave({ tenant: request.tenant, moduleName: 'product',
                indexName: this.policy().searchIndexName, model: model,
                searchOptions: { analyzer: (this.policy().analyzerByLocale || {})[model.locale] } });
            restored.push(model);
        }
        return restored;
    },

    /** Withdraws persisted and indexed projections for one tenant-scoped Product and Store. */
    withdraw: async function (request, input) {
        if (!request || !request.tenant || !input || !input.productCode || !input.storeCode) {
            throw new Error('Tenant, Product, and Store are required for search withdrawal');
        }
        let query = { tenant: request.tenant, productCode: input.productCode, storeCode: input.storeCode };
        await SERVICE.DefaultProductSearchProjectionService.update({ tenant: request.tenant,
            authData: request.authData, query: query, model: { status: 'WITHDRAWN' } });
        await SERVICE.DefaultProductSearchProjectionService.doRemoveByQuery({ tenant: request.tenant,
            moduleName: 'product', indexName: this.policy().searchIndexName, query: query });
        return { status: 'WITHDRAWN', productCode: input.productCode, storeCode: input.storeCode };
    }
};
