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
        }
    },
    schemaPolicies: { product: {
        operational: { accessGroups: { adminGroup: 10, commerceOperatorUserGroup: 10, serviceAccountUserGroup: 10 } },
        tenantOwned: { accessGroups: { adminGroup: 10, commerceOperatorUserGroup: 10, serviceAccountUserGroup: 10 } },
        customerOwned: { accessGroups: { adminGroup: 10, commerceOperatorUserGroup: 10, serviceAccountUserGroup: 10, customerUserGroup: 10 }, ownership: { enabled: true, ownerProperty: 'ownerId', bypassGroups: { adminGroup: true, commerceOperatorUserGroup: true, serviceAccountUserGroup: true }, subjectGroups: { customerUserGroup: true }, principalTypes: { customer: true } } }
    } }
};
