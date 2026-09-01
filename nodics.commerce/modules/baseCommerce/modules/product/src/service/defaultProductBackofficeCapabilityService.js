/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics source-available software. See root LICENSE. */
/** @module product/service/DefaultProductBackofficeCapabilityService @description Publishes Product-owned BackOffice catalogue and localization workspaces. @layer service @owner product */
module.exports = {
    /** Registers the Product BackOffice capability provider. */
    init: function () { SERVICE.DefaultModuleRegistrationAgentService.registerBackofficeCapabilityProvider('product', this); return Promise.resolve(true); },
    /** Completes provider lifecycle initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns the Product-owned BackOffice capability contract. */
    getCapability: function () {
        let definitions = SERVICE.DefaultBackofficeCapabilityDefinitionService;
        let item = (id, parentId, label, route, schemaName, order, summary, presentation, featureState) => definitions.workbench({
            id: id, parentId: parentId, label: label, route: route, moduleName: 'product', schemaName: schemaName,
            order: order, permission: id === 'catalog-and-products' ? 'commerce.catalog.read' : 'commerce.product.read',
            summary: summary, presentation: presentation, featureState: featureState,
            group: id === 'catalog-and-products' ? { id: 'products-merchandising', label: 'Products & Merchandising', order: 500 } : undefined
        });
        let node = (id, label, order, summary, featureState) => definitions.workbench({
            id: id, label: label, route: '/commerce/catalog#' + id, moduleName: 'product', schemaName: 'product',
            order: order, permission: 'commerce.product.read', summary: summary, featureState: featureState || 'DISABLED',
            group: { id: 'products-merchandising', label: 'Products & Merchandising', order: 500 },
            presentation: { defaultColumns: ['code', 'name', 'status', 'catalogVersion', 'revision'] }
        });
        return definitions.capability({ capabilityId: 'commerce-product', displayName: 'Catalog & Products', category: 'commerce', icon: 'commerce', navigation: [
            item('catalog-and-products', undefined, 'Product Workspace', '/commerce/catalog', 'product', 500, 'Review all products, create products, attention states, review readiness, publishing readiness, published products, and archived products.', { defaultColumns: ['code', 'name', 'productType', 'fulfillmentStrategy', 'status', 'catalogVersion', 'revision'], editableFields: ['code', 'name', 'productType', 'fulfillmentStrategy', 'digitalDeliveryType', 'status', 'catalogVersion', 'revision'], forbiddenFields: ['tenant', 'enterpriseCode'] }),
            node('product-information', 'Product Information', 510, 'Manage products, variants, localization, relationships, bundles where supported, and product lifecycle.', 'ACTIVE'),
            node('categories-classification', 'Categories & Classification', 520, 'Manage categories, assignments, classification, attributes, groups, variant definitions, units, and allowed values.'),
            node('catalogs-assortments', 'Catalogs & Assortments', 530, 'Manage product catalogs, versions, assortments, categories, assignments, stores, channels, and previews.'),
            node('product-pricing', 'Pricing', 540, 'Manage price books, product prices, quantity tiers, schedules, currency/channel prices, conflicts, and decision audit.', 'ACTIVE'),
            node('tax-configuration', 'Tax Configuration', 550, 'Manage tax policies, tax codes, jurisdictions, product tax assignment, and decision audit.', 'ACTIVE'),
            node('product-readiness', 'Product Readiness', 560, 'Review completeness, missing category/price/tax/media/localization/assortment/search/publication readiness.', 'ACTIVE'),
            item('products', 'product-information', 'Products', '/commerce/catalog/products', 'product', 511, 'Manage product identity, variants, categories, and staged publication.', { defaultColumns: ['code', 'name', 'productType', 'fulfillmentStrategy', 'status', 'catalogVersion', 'revision'], editableFields: ['code', 'name', 'productType', 'fulfillmentStrategy', 'digitalDeliveryType', 'status', 'catalogVersion', 'revision'], forbiddenFields: ['tenant', 'enterpriseCode'] }),
            item('product-localizations', 'products', 'Product Languages', '/commerce/catalog/products/languages', 'productLocalization', 121, 'Manage Product-owned localized names, descriptions, SEO, attributes, media text, and readiness.', { defaultColumns: ['productCode', 'locale', 'name', 'status', 'revision'], fixedFilters: [] }),
            item('category-localizations', 'products', 'Category Languages', '/commerce/catalog/categories/languages', 'categoryLocalization', 122, 'Manage localized Category presentation while retaining one shared hierarchy.', { defaultColumns: ['categoryCode', 'locale', 'name', 'status', 'revision'], fixedFilters: [] }),
            item('variant-localizations', 'products', 'Variant Languages', '/commerce/catalog/variants/languages', 'productVariantLocalization', 123, 'Manage localized Variant presentation while retaining one shared SKU identity.', { defaultColumns: ['productCode', 'variantCode', 'locale', 'status', 'revision'], fixedFilters: [] }),
            item('product-search-locales', 'products', 'Localized Search Status', '/commerce/catalog/products/search-locales', 'productSearchProjection', 124, 'Inspect deterministic Store-and-locale Product search projection status.', { defaultColumns: ['productCode', 'storeCode', 'locale', 'status', 'sourceHash', 'projectedAt'], fixedFilters: [] }),
            item('make-product-sellable', 'product-readiness', 'Make Product Sellable', '/commerce/catalog/readiness', 'product', 561, 'Guide product basics, variants, localization, price, tax, stock authority, search visibility, and publishability without moving domain ownership into Axis.', { defaultColumns: ['code', 'name', 'status', 'catalogVersion', 'revision'] })
        ] });
    }
};
