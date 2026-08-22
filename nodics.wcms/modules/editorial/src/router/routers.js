/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module editorial/src/router/routers
 * @description Router definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = { editorial: { editorialAuthoring: {
    validate: { secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup'], permission: 'editorial.backoffice.manage', apiExposure: 'editorialAuthoring', key: '/authoring/articles/validate', method: 'POST', controller: 'DefaultEditorialAuthoringController', operation: 'validate' },
    evaluateReadiness: { secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup'], permission: 'editorial.backoffice.manage', apiExposure: 'editorialAuthoring', key: '/authoring/articles/readiness', method: 'POST', controller: 'DefaultEditorialAuthoringController', operation: 'evaluateReadiness' },
    submit: { secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup'], permission: 'editorial.workflow.submit', apiExposure: 'editorialAuthoring', key: '/authoring/articles/:articleCode/submit', method: 'POST', controller: 'DefaultEditorialAuthoringController', operation: 'submit' },
    approve: { secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup'], permission: 'editorial.workflow.submit', apiExposure: 'editorialAuthoring', key: '/authoring/articles/:articleCode/approve', method: 'POST', controller: 'DefaultEditorialAuthoringController', operation: 'approve' },
    reject: { secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup'], permission: 'editorial.workflow.submit', apiExposure: 'editorialAuthoring', key: '/authoring/articles/:articleCode/reject', method: 'POST', controller: 'DefaultEditorialAuthoringController', operation: 'reject' },
    inspectWorkflow: { secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup'], permission: 'editorial.workflow.read', apiExposure: 'editorialAuthoring', key: '/authoring/articles/:articleCode/workflow', method: 'GET', controller: 'DefaultEditorialAuthoringController', operation: 'inspectWorkflow' },
    publish: { secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup'], permission: 'editorial.publish.execute', apiExposure: 'editorialAuthoring', key: '/authoring/articles/:articleCode/publish', method: 'POST', controller: 'DefaultEditorialAuthoringController', operation: 'publish' },
    schedule: { secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup'], permission: 'editorial.publish.schedule', apiExposure: 'editorialAuthoring', key: '/authoring/articles/:articleCode/schedule', method: 'POST', controller: 'DefaultEditorialAuthoringController', operation: 'schedule' },
    withdraw: { secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup'], permission: 'editorial.publish.withdraw', apiExposure: 'editorialAuthoring', key: '/authoring/articles/:articleCode/withdraw', method: 'POST', controller: 'DefaultEditorialAuthoringController', operation: 'withdraw' }
}, editorialDelivery: {
    list: { secured: false, publicAccess: true, accessGroups: ['userGroup'], apiExposure: 'editorialPublic', key: '/delivery/articles', method: 'GET', controller: 'DefaultEditorialDeliveryController', operation: 'list', cache: { enabled: false } },
    structured: { secured: false, publicAccess: true, accessGroups: ['userGroup'], apiExposure: 'editorialPublic', key: '/delivery/articles/structured', method: 'GET', controller: 'DefaultEditorialDeliveryController', operation: 'structured', cache: { enabled: false } },
    featured: { secured: false, publicAccess: true, accessGroups: ['userGroup'], apiExposure: 'editorialPublic', key: '/delivery/articles/featured', method: 'GET', controller: 'DefaultEditorialDeliveryController', operation: 'featured', cache: { enabled: false } },
    byType: { secured: false, publicAccess: true, accessGroups: ['userGroup'], apiExposure: 'editorialPublic', key: '/delivery/types/:contentTypeCode/articles', method: 'GET', controller: 'DefaultEditorialDeliveryController', operation: 'byType', cache: { enabled: false } },
    byTaxonomy: { secured: false, publicAccess: true, accessGroups: ['userGroup'], apiExposure: 'editorialPublic', key: '/delivery/taxonomy/:taxonomyCode/articles', method: 'GET', controller: 'DefaultEditorialDeliveryController', operation: 'byTaxonomy', cache: { enabled: false } },
    byAuthor: { secured: false, publicAccess: true, accessGroups: ['userGroup'], apiExposure: 'editorialPublic', key: '/delivery/authors/:authorCode/articles', method: 'GET', controller: 'DefaultEditorialDeliveryController', operation: 'byAuthor', cache: { enabled: false } },
    bySeries: { secured: false, publicAccess: true, accessGroups: ['userGroup'], apiExposure: 'editorialPublic', key: '/delivery/series/:seriesCode/articles', method: 'GET', controller: 'DefaultEditorialDeliveryController', operation: 'bySeries', cache: { enabled: false } },
    detail: { secured: false, publicAccess: true, accessGroups: ['userGroup'], apiExposure: 'editorialPublic', key: '/delivery/articles/:slug', method: 'GET', controller: 'DefaultEditorialDeliveryController', operation: 'detail', cache: { enabled: false } },
    rss: { secured: false, publicAccess: true, accessGroups: ['userGroup'], apiExposure: 'editorialPublic', key: '/delivery/rss', method: 'GET', controller: 'DefaultEditorialDeliveryController', operation: 'rss', cache: { enabled: false } },
    sitemap: { secured: false, publicAccess: true, accessGroups: ['userGroup'], apiExposure: 'editorialPublic', key: '/delivery/sitemap', method: 'GET', controller: 'DefaultEditorialDeliveryController', operation: 'sitemap', cache: { enabled: false } }
}, editorialPublicationTarget: {
    deploy: { secured: true, authTokenTypes: ['service'], accessGroups: ['userGroup'], permissionConfig: 'authSecurity.internalToken.routePermission', apiExposure: 'moduleInternal', key: '/publication/target/deploy', method: 'POST', controller: 'DefaultEditorialPublicationTargetController', operation: 'deploy', cache: { enabled: false } },
    status: { secured: true, authTokenTypes: ['service'], accessGroups: ['userGroup'], permissionConfig: 'authSecurity.internalToken.routePermission', apiExposure: 'moduleInternal', key: '/publication/target/status', method: 'POST', controller: 'DefaultEditorialPublicationTargetController', operation: 'status', cache: { enabled: false } },
    rollback: { secured: true, authTokenTypes: ['service'], accessGroups: ['userGroup'], permissionConfig: 'authSecurity.internalToken.routePermission', apiExposure: 'moduleInternal', key: '/publication/target/rollback', method: 'POST', controller: 'DefaultEditorialPublicationTargetController', operation: 'rollback', cache: { enabled: false } },
    withdraw: { secured: true, authTokenTypes: ['service'], accessGroups: ['userGroup'], permissionConfig: 'authSecurity.internalToken.routePermission', apiExposure: 'moduleInternal', key: '/publication/target/withdraw', method: 'POST', controller: 'DefaultEditorialPublicationTargetController', operation: 'withdraw', cache: { enabled: false } }
}}};
