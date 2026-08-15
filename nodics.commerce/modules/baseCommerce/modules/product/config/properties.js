/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module product/config/properties @description Defines Commerce capability and schema access policies. @layer config @owner product */
module.exports = {
    product: {
        enabled: true,
        localization: {
            supportedLocales: ['en', 'ar'],
            defaultLocale: 'en',
            fallbackLocales: ['en'],
            requiredLocales: ['en', 'ar'],
            requiredProductFields: ['name'],
            requiredCategoryFields: ['name'],
            requiredVariantFields: [],
            allowLegacySharedText: true,
            maximumLocalizedFields: 100,
            maximumBatchSize: 100,
            searchIndexName: 'productLocalized',
            searchCacheTtlSeconds: 300,
            analyzerByLocale: {
                en: 'standard',
                ar: 'arabic'
            }
        },
        discovery: {
            defaultStoreCode: 'defaultStore',
            defaultLocale: 'en',
            maximumPageSize: 100,
            defaultPageSize: 24,
            allowTenantQuery: false,
            searchIndexName: 'productLocalized',
            rankingFailureBehavior: 'omit',
            cardFields: ['productCode', 'name', 'slug', 'summary', 'categoryCodes', 'variantCodes', 'seo', 'localizedAttributes', 'price', 'availability'],
            detailFields: ['productCode', 'name', 'slug', 'summary', 'description', 'categoryCodes', 'variantCodes', 'seo', 'localizedAttributes', 'mediaText', 'price', 'availability'],
            filterableFields: ['categoryCodes'],
            exposedSorts: ['relevance', 'name-asc', 'name-desc']
        },
        publication: {
            defaultStoreCode: 'defaultStore',
            maximumBatchSize: 100,
            searchEnrichment: {
                pricing: { enabled: true, serviceName: 'DefaultCustomerPriceSummaryService', defaultCurrency: 'USD', defaultQuantity: '1', missingBehavior: 'omit' },
                inventory: { enabled: true, serviceName: 'DefaultCustomerAvailabilitySummaryService', missingBehavior: 'omit' }
            }
        }
    },
    schemaPolicies: { product: {
        operational: { accessGroups: { adminGroup: 10, commerceOperatorUserGroup: 10, serviceAccountUserGroup: 10 } },
        tenantOwned: { accessGroups: { adminGroup: 10, commerceOperatorUserGroup: 10, serviceAccountUserGroup: 10 } },
        customerOwned: { accessGroups: { adminGroup: 10, commerceOperatorUserGroup: 10, serviceAccountUserGroup: 10, customerUserGroup: 10 }, ownership: { enabled: true, ownerProperty: 'ownerId', bypassGroups: { adminGroup: true, commerceOperatorUserGroup: true, serviceAccountUserGroup: true }, subjectGroups: { customerUserGroup: true }, principalTypes: { customer: true } } }
    } }
};
