/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.wcms/config/properties
 * @description Defines default nodics.wcms configuration used during module startup and layering.
 * @layer config
 * @owner nodics.wcms
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    apiExposure: {
        categories: {
            dataImport: {
                enabled: true
            },
            dataExport: {
                enabled: true
            },
            mediaManagement: {
                enabled: true
            },
            mediaDelivery: {
                enabled: true
            },
            cmsAuthoring: {
                enabled: true
            }
        }
    },
    cms: {
        designerAuthoring: {
            maximumReferenceLookupItems: 100,
            requireNavigationForPublish: false,
            draftDefaults: {
                catalogCode: 'documentationContentCatalog',
                siteCode: 'axisDocumentationSite',
                templateCode: 'articleTemplate',
                pageTypeCode: 'documentationPageType',
                pageRenderer: 'axis.documentationPage',
                routePath: '/docs/home',
                slots: ['navigation', 'article', 'relatedResources']
            },
            componentKinds: [
                { label: 'Hero banner', typeCode: 'heroBannerComponentType', renderer: 'axis.heroBanner' },
                { label: 'Rich text', typeCode: 'richTextComponentType', renderer: 'axis.richText' },
                { label: 'Image card', typeCode: 'imageCardComponentType', renderer: 'axis.imageCard' },
                { label: 'Media gallery', typeCode: 'mediaGalleryComponentType', renderer: 'axis.mediaGallery' },
                { label: 'Call to action', typeCode: 'callToActionComponentType', renderer: 'axis.callToAction' },
                { label: 'Documentation article', typeCode: 'documentationArticleComponentType', renderer: 'axis.documentationArticle' },
                { label: 'Dashboard widget', typeCode: 'dashboardWidgetComponentType', renderer: 'axis.dashboardWidget' }
            ]
        }
    },
    data: {
        contentPacks: {
            enabled: true,
            packs: {
                nodicsDocumentation: {
                    source: {
                        type: 'LOCAL_SIBLING',
                        repositoryName: 'nodics.docs',
                        contentPath: 'data/core',
                        manifestPath: 'data/manifest.json',
                        manifestSection: 'documentation'
                    }
                },
                axisDocumentation: {
                    source: {
                        type: 'LOCAL_SIBLING',
                        repositoryName: 'nodics.platform',
                        contentPath: 'modules/axis/data/core',
                        manifestPath: 'modules/axis/data/manifest.json',
                        manifestSection: 'documentation'
                    }
                },
                customerProjectDocumentation: {
                    source: {
                        type: 'LOCAL_PROJECT',
                        contentPath: 'data/core',
                        manifestPath: 'data/manifest.json',
                        manifestSection: 'documentation'
                    },
                    presentation: {
                        title: 'Customer project documentation',
                        unavailableMessage: 'Customer project documentation has not been installed for this environment.',
                        disabledMessage: 'Documentation imports are not enabled for this environment.',
                        importAction: 'Import customer project documentation',
                        updateAction: 'Update customer project documentation',
                        retryAction: 'Retry import'
                    }
                }
            }
        }
    },
    wcmsStartupImport: {
        enabled: true,
        importInitDataOnReady: true,
        timeoutMs: 60000,
        source: 'nodics.wcms.runtimeReady'
    }
};
