/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const crypto = require('node:crypto');

/** @module product/service/defaultProductLocalizedProjectionBuilderService @description Builds deterministic locale-specific Product search records. @layer service @owner product @override Later modules may replace payload projection while preserving tenant/store/locale identity. */
module.exports = {
    /** Builds one tenant, Product, Store, and locale scoped search projection. */
    build: function (request, input) {
        if (!request || !request.tenant || !input || !input.product || input.product.tenant !== request.tenant || !input.storeCode) {
            throw new Error('Tenant-scoped Product and Store are required');
        }
        let projectedAt = request.now ? new Date(request.now) : new Date();
        let resolved = SERVICE.DefaultProductLocalizationPolicyService.resolve(request, input.localizations, input.locale);
        if (!resolved.value) throw new Error('Ready Product localization is required for search projection');
        let localized = resolved.value;
        let payload = { code: input.product.code, name: localized.name, description: localized.description,
            slug: localized.slug, seo: localized.seo, localizedAttributes: localized.attributes,
            classificationValues: localized.classificationValues,
            categoryCodes: input.categoryCodes || [], variantCodes: input.variantCodes || [] };
        if (Array.isArray(input.variants) && input.variants.length > 0) {
            payload.variantSkuMap = input.variants.reduce((map, variant) => {
                if (variant && variant.code && variant.sku) map[variant.code] = variant.sku;
                return map;
            }, {});
        }
        if (input.customerSummaries && input.customerSummaries.price) payload.price = input.customerSummaries.price;
        if (input.customerSummaries && input.customerSummaries.availability) payload.availability = input.customerSummaries.availability;
        let source = { tenant: request.tenant, productCode: input.product.code, storeCode: input.storeCode,
            locale: resolved.resolvedLocale, productRevision: input.product.revision,
            localizationRevision: localized.revision, payload: payload };
        return { code: [input.product.code, input.storeCode, resolved.resolvedLocale].join('|'),
            tenant: request.tenant, productCode: input.product.code, storeCode: input.storeCode,
            locale: resolved.resolvedLocale, payload: Object.freeze(payload),
            sourceHash: crypto.createHash('sha256').update(JSON.stringify(source)).digest('hex'),
            status: 'CURRENT', projectedAt: projectedAt,
            requestedLocale: resolved.requestedLocale, fallbackUsed: resolved.fallbackUsed };
    }
};
