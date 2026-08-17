/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cms/config/properties
 * @description Reserved CMS property contribution for module-level content configuration defaults.
 * @layer config
 * @owner cms
 * @override Project modules may provide later property contributions for CMS rendering, data, and integration settings.
 */
module.exports = {
    bodyParserHandler: {
        cmsPublicationBodyParserHandler: 'DefaultCmsPublicationBodyParserHandlerService'
    },
    cms: {
        referenceLookup: { requireServiceToken: true, maximumResultCount: 1 },
        delivery: {
            defaultLocale: 'default',
            defaultChannel: 'web',
            maxDepth: 12,
            maxComponents: 500,
            cacheTtl: 30000,
            cacheResourceNames: ['resolvePublicPage', 'resolveAuthenticatedPage'],
            publicAccessGroups: ['userGroup'],
            authenticatedAccessGroups: ['userGroup'],
            authenticatedPermission: 'cms.delivery.authenticated.read'
        },
        localization: {
            enabled: true,
            supportedLocales: ['en', 'ar'],
            defaultLocale: 'en',
            fallbackLocales: ['en'],
            legacyRouteLocale: 'default',
            allowLegacySharedProperties: true,
            maximumLocalizedProperties: 100
        },
        storefrontContext: { headerName: 'x-nodics-storefront-context', moduleName: 'storefront', apiVersion: 'v0',
            apiName: '/context/introspect', bootstrapTenant: 'default', preferLocal: true, requestTimeoutMs: 1000,
            maximumAttempts: 1, maximumResponseBytes: 32768 },
        renderer: {
            keyPattern: '^[a-z][A-Za-z0-9]*(\\.[A-Za-z][A-Za-z0-9-]*)+$',
            prohibitedSchemes: ['http:', 'https:', 'javascript:', 'data:', 'file:']
        },
        mediaReference: {
            moduleName: 'media',
            apiVersion: 'v0',
            apiName: '/references/media/validate',
            preferLocal: true,
            requestTimeoutMs: 2000,
            maximumAttempts: 2,
            maximumReferencesPerComponent: 200,
            mediaTypes: ['IMAGE', 'VIDEO', 'DOCUMENT', 'FILE', 'MIXED'],
            roles: ['primary', 'background', 'thumbnail', 'icon', 'gallery', 'document', 'video', 'mobile', 'desktop'],
            localePattern: '^[A-Za-z]{2,3}(?:[-_][A-Za-z0-9]{2,8})*$'
        },
        migration: {
            version: 1,
            rendererMappings: {
                'pages/home/sampleHomePage.html': 'page.home',
                'pages/product/sampleProductDetailPage.html': 'page.product-detail',
                'pages/product/sampleProductListingPage.html': 'page.product-listing',
                'pages/cart/sampleCartDetailPage.html': 'page.cart-detail',
                'pages/components/sampleHeaderComponent.html': 'component.header'
            },
            routeMappings: [],
            identifierMappings: []
        },
        publication: {
            enabled: false,
            maximumDeploymentRequestBytes: '16mb',
            runtimeRole: 'UNASSIGNED',
            maxDependencies: 500,
            maxDepth: 12,
            maxBundleRoutes: 200,
            manifestService: 'DefaultCmsPublicationManifestOrchestrationService',
            targetTransportProvider: null,
            transactionModuleName: 'cms',
            outbox: {
                batchSize: 100,
                maximumAttempts: 10,
                leaseMs: 30000,
                startupReconciliation: true
            },
            mediaGarbageCollection: { maximumPointers: 1000, maximumProtectedManifests: 1000 },
            baselines: {},
            target: {
                moduleName: null,
                connectionName: null,
                connectionType: 'abstract',
                timeoutMs: 30000,
                maxAttempts: 3,
                maxManifestBytes: 12582912,
                supportedContractVersions: [1, 2]
            },
            rootTypes: {
                pageRoute: { schema: 'cmsPageRoute', service: 'DefaultCmsPageRouteService' },
                site: { schema: 'cmsSite', service: 'DefaultCmsSiteService', bundle: true }
            }
        }
    },
    publish: {
        providers: {
            domainAdapters: { cms: 'DefaultCmsPublicationAdapterService' },
            versionProviders: { cms: 'DefaultCmsPublicationVersionProviderService' },
            workflowProvider: 'DefaultCmsPublicationWorkflowService'
        }
    }
};
