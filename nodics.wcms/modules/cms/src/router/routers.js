/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cms/router/routers
 * @description Reserved CMS route contribution for custom CMS APIs beyond generated schema routes.
 * @layer router
 * @owner cms
 * @override Project modules may add, remove, or replace CMS routes through governed router hierarchy contributions.
 */
module.exports = {
  cms: {
    cmsDesignerComposition: {
        getAuthoringModel: { secured: true, accessGroups: ['userGroup'], permission: 'cms.backoffice.view',
            apiExposure: 'cmsAuthoring', key: '/designer/composition/model', method: 'GET',
            controller: 'DefaultCmsDesignerCompositionController', operation: 'getAuthoringModel' },
        validateDraftComposition: { secured: true, accessGroups: ['userGroup'], permission: 'cms.backoffice.manage',
            apiExposure: 'cmsAuthoring', key: '/designer/composition/validate', method: 'POST',
            controller: 'DefaultCmsDesignerCompositionController', operation: 'validateDraftComposition' },
        saveDraftComposition: { secured: true, accessGroups: ['userGroup'], permission: 'cms.backoffice.manage',
            apiExposure: 'cmsAuthoring', key: '/designer/composition/draft', method: 'PUT',
            controller: 'DefaultCmsDesignerCompositionController', operation: 'saveDraftComposition' },
        addSection: { secured: true, accessGroups: ['userGroup'], permission: 'cms.backoffice.manage',
            apiExposure: 'cmsAuthoring', key: '/designer/composition/sections', method: 'POST',
            controller: 'DefaultCmsDesignerCompositionController', operation: 'addSection' },
        updateSection: { secured: true, accessGroups: ['userGroup'], permission: 'cms.backoffice.manage',
            apiExposure: 'cmsAuthoring', key: '/designer/composition/sections', method: 'PUT',
            controller: 'DefaultCmsDesignerCompositionController', operation: 'updateSection' },
        deleteSection: { secured: true, accessGroups: ['userGroup'], permission: 'cms.backoffice.manage',
            apiExposure: 'cmsAuthoring', key: '/designer/composition/sections/delete', method: 'POST',
            controller: 'DefaultCmsDesignerCompositionController', operation: 'deleteSection' },
        reorderSection: { secured: true, accessGroups: ['userGroup'], permission: 'cms.backoffice.manage',
            apiExposure: 'cmsAuthoring', key: '/designer/composition/sections/reorder', method: 'POST',
            controller: 'DefaultCmsDesignerCompositionController', operation: 'reorderSection' },
        addComponent: { secured: true, accessGroups: ['userGroup'], permission: 'cms.backoffice.manage',
            apiExposure: 'cmsAuthoring', key: '/designer/composition/components', method: 'POST',
            controller: 'DefaultCmsDesignerCompositionController', operation: 'addComponent' },
        updateComponent: { secured: true, accessGroups: ['userGroup'], permission: 'cms.backoffice.manage',
            apiExposure: 'cmsAuthoring', key: '/designer/composition/components', method: 'PUT',
            controller: 'DefaultCmsDesignerCompositionController', operation: 'updateComponent' },
        deleteComponent: { secured: true, accessGroups: ['userGroup'], permission: 'cms.backoffice.manage',
            apiExposure: 'cmsAuthoring', key: '/designer/composition/components/delete', method: 'POST',
            controller: 'DefaultCmsDesignerCompositionController', operation: 'deleteComponent' },
        reorderComponent: { secured: true, accessGroups: ['userGroup'], permission: 'cms.backoffice.manage',
            apiExposure: 'cmsAuthoring', key: '/designer/composition/components/reorder', method: 'POST',
            controller: 'DefaultCmsDesignerCompositionController', operation: 'reorderComponent' },
        associateMedia: { secured: true, accessGroups: ['userGroup'], permission: 'cms.backoffice.manage',
            apiExposure: 'cmsAuthoring', key: '/designer/composition/media', method: 'POST',
            controller: 'DefaultCmsDesignerCompositionController', operation: 'associateMedia' },
        detachMedia: { secured: true, accessGroups: ['userGroup'], permission: 'cms.backoffice.manage',
            apiExposure: 'cmsAuthoring', key: '/designer/composition/media/delete', method: 'POST',
            controller: 'DefaultCmsDesignerCompositionController', operation: 'detachMedia' },
        assignRoute: { secured: true, accessGroups: ['userGroup'], permission: 'cms.backoffice.manage',
            apiExposure: 'cmsAuthoring', key: '/designer/composition/route', method: 'PUT',
            controller: 'DefaultCmsDesignerCompositionController', operation: 'assignRoute' },
        assignNavigation: { secured: true, accessGroups: ['userGroup'], permission: 'cms.backoffice.manage',
            apiExposure: 'cmsAuthoring', key: '/designer/composition/navigation', method: 'PUT',
            controller: 'DefaultCmsDesignerCompositionController', operation: 'assignNavigation' },
        validatePublishReadiness: { secured: true, accessGroups: ['userGroup'], permission: 'cms.backoffice.manage',
            apiExposure: 'cmsAuthoring', key: '/designer/composition/publish-readiness', method: 'POST',
            controller: 'DefaultCmsDesignerCompositionController', operation: 'validatePublishReadiness' },
        submitForPublication: { secured: true, accessGroups: ['userGroup'], permission: 'cms.backoffice.manage',
            apiExposure: 'cmsAuthoring', key: '/designer/composition/publication-request', method: 'POST',
            controller: 'DefaultCmsDesignerCompositionController', operation: 'submitForPublication' }
    },
    cmsMigration: {
        previewMigration: { secured: true, accessGroups: ['runtimeConfigAdminUserGroup'], permission: 'cms.migration.preview', key: '/migration/preview', method: 'POST', controller: 'DefaultCmsMigrationController', operation: 'previewMigration' },
        applyMigration: { secured: true, accessGroups: ['runtimeConfigAdminUserGroup'], permission: 'cms.migration.apply', key: '/migration/apply', method: 'POST', controller: 'DefaultCmsMigrationController', operation: 'applyMigration' },
        rollbackMigration: { secured: true, accessGroups: ['runtimeConfigAdminUserGroup'], permission: 'cms.migration.rollback', key: '/migration/rollback', method: 'POST', controller: 'DefaultCmsMigrationController', operation: 'rollbackMigration' }
    },
    cmsDelivery: {
        resolvePublicPage: {
            secured: false,
            publicAccess: true,
            accessGroups: ['userGroup'],
            key: '/delivery/pages/resolve',
            method: 'GET',
            controller: 'DefaultCmsDeliveryController',
            operation: 'resolvePage',
            cache: { enabled: true, ttl: 30000 },
            help: {
                requestType: 'public',
                message: 'Resolve an Online CMS page graph by site, path, locale, and channel.',
                method: 'GET',
                url: 'http://host:port/nodics/cms/delivery/pages/resolve?site=siteCode&path=/home&locale=en&channel=web'
            }
        },
        resolveAuthenticatedPage: {
            secured: true,
            accessGroups: ['userGroup'],
            permissionConfig: 'cms.delivery.authenticatedPermission',
            key: '/delivery/pages/resolve/authenticated',
            method: 'GET',
            controller: 'DefaultCmsDeliveryController',
            operation: 'resolvePage',
            cache: { enabled: true, ttl: 30000 },
            help: {
                requestType: 'secured',
                message: 'Resolve an authenticated CMS page graph within the authorized tenant context.',
                method: 'GET',
                url: 'http://host:port/nodics/cms/delivery/pages/resolve/authenticated?site=siteCode&path=/account&locale=en&channel=web'
            }
        },
        resolveStorefrontPage: {
            secured: false,
            publicAccess: true,
            accessGroups: ['userGroup'],
            apiExposure: 'cmsDelivery',
            key: '/delivery/storefront/pages/resolve',
            method: 'GET',
            controller: 'DefaultCmsDeliveryController',
            operation: 'resolveStorefrontPage',
            cache: { enabled: false },
            help: { requestType: 'public', message: 'Resolve one Online CMS page from an opaque Storefront context.',
                parameters: [{ name: 'x-nodics-storefront-context', in: 'header', required: true,
                    description: 'Opaque short-lived context handle issued by Storefront.', schema: { type: 'string' } },
                { name: 'path', in: 'query', required: true, schema: { type: 'string' } }] },
            responses: { '200': { description: 'Storefront-bound Online CMS page graph' },
                '401': { description: 'Storefront context is missing, inactive, expired, or unavailable' },
                '404': { description: 'Published CMS route or content is unavailable' } }
        }
    },
    cmsReference: {
        resolveSite: {
            secured: true, authTokenTypes: ['service'], accessGroups: ['userGroup'],
            permissionConfig: 'authSecurity.internalToken.routePermission', apiExposure: 'moduleInternal',
            key: '/references/sites/resolve', method: 'POST', controller: 'DefaultCmsSiteReferenceController', operation: 'resolve',
            requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', additionalProperties: false,
                required: ['cmsSiteCode'], properties: { cmsSiteCode: { type: 'string', minLength: 1, maxLength: 128 } } } } } },
            responses: { '200': { description: 'Bounded active CMS Site reference projection' } }
        }
    },
    cmsPublicationTarget: {
        deployPublication: {
            secured: true, authTokenTypes: ['service'], accessGroups: ['userGroup'], permissionConfig: 'authSecurity.internalToken.routePermission',
            apiExposure: 'moduleInternal', key: '/publication/target/deploy', method: 'POST',
            bodyParserHandler: 'cmsPublicationBodyParserHandler',
            controller: 'DefaultCmsPublicationTargetController', operation: 'deploy'
        },
        getPublicationStatus: {
            secured: true, authTokenTypes: ['service'], accessGroups: ['userGroup'], permissionConfig: 'authSecurity.internalToken.routePermission',
            apiExposure: 'moduleInternal', key: '/publication/target/status', method: 'POST',
            controller: 'DefaultCmsPublicationTargetController', operation: 'getStatus'
        },
        verifyPublicationOnline: {
            secured: true, authTokenTypes: ['service'], accessGroups: ['userGroup'], permissionConfig: 'authSecurity.internalToken.routePermission',
            apiExposure: 'moduleInternal', key: '/publication/target/verify-online', method: 'POST',
            controller: 'DefaultCmsPublicationTargetController', operation: 'verifyOnline'
        },
        detectPublicationCollisions: {
            secured: true, authTokenTypes: ['service'], accessGroups: ['userGroup'], permissionConfig: 'authSecurity.internalToken.routePermission',
            apiExposure: 'moduleInternal', key: '/publication/target/collisions', method: 'POST',
            controller: 'DefaultCmsPublicationTargetController', operation: 'detectCollisions'
        },
        getPublicationSupportBundle: {
            secured: true, authTokenTypes: ['service'], accessGroups: ['userGroup'], permissionConfig: 'authSecurity.internalToken.routePermission',
            apiExposure: 'moduleInternal', key: '/publication/target/support-bundle', method: 'POST',
            controller: 'DefaultCmsPublicationTargetController', operation: 'supportBundle'
        },
        reconcilePublicationEvidence: {
            secured: true, authTokenTypes: ['service'], accessGroups: ['userGroup'], permissionConfig: 'authSecurity.internalToken.routePermission',
            apiExposure: 'moduleInternal', key: '/publication/target/reconcile', method: 'POST',
            controller: 'DefaultCmsPublicationTargetController', operation: 'reconcile'
        },
        collectPublishedMediaGarbage: {
            secured: true, authTokenTypes: ['service'], accessGroups: ['userGroup'], permissionConfig: 'authSecurity.internalToken.routePermission',
            apiExposure: 'moduleInternal', key: '/publication/target/media/collect', method: 'POST',
            controller: 'DefaultCmsPublicationTargetController', operation: 'collectMediaGarbage'
        },
        rollbackPublication: {
            secured: true, authTokenTypes: ['service'], accessGroups: ['userGroup'], permissionConfig: 'authSecurity.internalToken.routePermission',
            apiExposure: 'moduleInternal', key: '/publication/target/rollback', method: 'POST',
            controller: 'DefaultCmsPublicationTargetController', operation: 'rollback'
        },
        withdrawPublication: {
            secured: true, authTokenTypes: ['service'], accessGroups: ['userGroup'], permissionConfig: 'authSecurity.internalToken.routePermission',
            apiExposure: 'moduleInternal', key: '/publication/target/withdraw', method: 'POST',
            controller: 'DefaultCmsPublicationTargetController', operation: 'withdraw'
        }
    },
    cmsPublicationProcess: {
        applyDecision: {
            secured: true, authTokenTypes: ['service'], accessGroups: ['userGroup'],
            permissionConfig: 'authSecurity.internalToken.routePermission', apiExposure: 'moduleInternal',
            key: '/publication/process/decision', method: 'POST',
            controller: 'DefaultCmsPublicationProcessController', operation: 'applyDecision'
        }
    },
    cmsPublicationBaseline: {
        status: {
            secured: true, authTokenTypes: ['service'], accessGroups: ['userGroup'],
            permissionConfig: 'authSecurity.internalToken.routePermission', apiExposure: 'moduleInternal',
            key: '/publication/baselines/:baselineCode', method: 'GET',
            controller: 'DefaultCmsPublicationBaselineController', operation: 'status'
        },
        initiate: {
            secured: true, authTokenTypes: ['service'], accessGroups: ['userGroup'],
            permissionConfig: 'authSecurity.internalToken.routePermission', apiExposure: 'moduleInternal',
            key: '/publication/baselines/:baselineCode/initiate', method: 'POST',
            controller: 'DefaultCmsPublicationBaselineController', operation: 'initiate',
            requestBody: { required: true, content: { 'application/json': { schema: {
                type: 'object', additionalProperties: false, required: ['requestedBy'], properties: {
                    requestedBy: { type: 'string', minLength: 1, maxLength: 256 },
                    reason: { type: 'string', maxLength: 1000 },
                    correlationId: { type: 'string', maxLength: 256 },
                    catalogCode: { type: 'string', maxLength: 128 },
                    forceRefresh: { type: 'boolean' }
                }
            } } } }
        },
        rollback: {
            secured: true, authTokenTypes: ['service'], accessGroups: ['userGroup'],
            permissionConfig: 'authSecurity.internalToken.routePermission', apiExposure: 'moduleInternal',
            key: '/publication/baselines/:baselineCode/rollback', method: 'POST',
            controller: 'DefaultCmsPublicationBaselineController', operation: 'rollback'
        },
        retire: {
            secured: true, authTokenTypes: ['service'], accessGroups: ['userGroup'],
            permissionConfig: 'authSecurity.internalToken.routePermission', apiExposure: 'moduleInternal',
            key: '/publication/baselines/:baselineCode/retire', method: 'POST',
            controller: 'DefaultCmsPublicationBaselineController', operation: 'retire'
        }
    }
  }
};
