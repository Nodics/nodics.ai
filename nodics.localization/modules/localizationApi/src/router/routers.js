/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module localizationApi/src/router/routers
 * @description Router definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = { localizationApi: { localization: {
    runtimeBundle: { secured: false, publicAccess: true, accessGroups: ['userGroup'], apiExposure: 'localizationPublic', key: '/localization/bundles/:locale', method: 'GET', controller: 'DefaultLocalizationApiController', operation: 'getRuntimeBundle' },
    importContribution: { secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'], permission: 'localization.registry.import', apiExposure: 'localizationManagement', key: '/localization/contributions/import', method: 'POST', controller: 'DefaultLocalizationApiController', operation: 'importContribution' },
    exportPackage: { secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'], permission: 'localization.registry.export', apiExposure: 'localizationManagement', key: '/localization/translations/export/:locale', method: 'POST', controller: 'DefaultLocalizationApiController', operation: 'exportPackage' },
    coverage: { secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'], permission: 'localization.operations.read', apiExposure: 'localizationManagement', key: '/localization/operations/coverage', method: 'POST', controller: 'DefaultLocalizationApiController', operation: 'coverage' },
    queue: { secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'], permission: 'localization.operations.read', apiExposure: 'localizationManagement', key: '/localization/operations/queue', method: 'POST', controller: 'DefaultLocalizationApiController', operation: 'queue' },
    sideBySide: { secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'], permission: 'localization.operations.read', apiExposure: 'localizationManagement', key: '/localization/operations/side-by-side', method: 'POST', controller: 'DefaultLocalizationApiController', operation: 'sideBySide' },
    analytics: { secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'], permission: 'localization.operations.read', apiExposure: 'localizationManagement', key: '/localization/operations/analytics', method: 'POST', controller: 'DefaultLocalizationApiController', operation: 'analytics' },
    saveDraft: { secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'], permission: 'localization.value.edit', apiExposure: 'localizationManagement', key: '/localization/values/draft', method: 'POST', controller: 'DefaultLocalizationApiController', operation: 'saveDraft' },
    submitReview: { secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'], permission: 'localization.value.review', apiExposure: 'localizationManagement', key: '/localization/values/review', method: 'POST', controller: 'DefaultLocalizationApiController', operation: 'submitReview' },
    approve: { secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'], permission: 'localization.value.approve', apiExposure: 'localizationManagement', key: '/localization/values/approve', method: 'POST', controller: 'DefaultLocalizationApiController', operation: 'approve' },
    suggest: { secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'], permission: 'localization.value.edit', apiExposure: 'localizationManagement', key: '/localization/values/suggest', method: 'POST', controller: 'DefaultLocalizationApiController', operation: 'suggest' },
    buildRelease: { secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'], permission: 'localization.release.build', apiExposure: 'localizationManagement', key: '/localization/releases/build', method: 'POST', controller: 'DefaultLocalizationApiController', operation: 'buildRelease' },
    publishRelease: { secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'], permission: 'localization.release.publish', apiExposure: 'localizationManagement', key: '/localization/releases/:version/publish', method: 'POST', controller: 'DefaultLocalizationApiController', operation: 'publishRelease' },
    rollbackRelease: { secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'], permission: 'localization.release.rollback', apiExposure: 'localizationManagement', key: '/localization/publications/:publicationCode/rollback', method: 'POST', controller: 'DefaultLocalizationApiController', operation: 'rollbackRelease' }
} } };
