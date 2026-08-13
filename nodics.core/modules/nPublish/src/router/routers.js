/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nPublish/router/routers
 * @description Reserved route definition contribution for publish/version promotion APIs.
 * @layer router
 * @owner nPublish
 * @override Project modules may add later routes for customer publishing capabilities.
 */


module.exports = {
    publish: {
        publicationLifecycle: {
            create: { secured: true, accessGroups: ['runtimeConfigAdminUserGroup'], permission: 'publish.lifecycle.create', authTokenTypes: ['access'], apiExposure: 'publicationLifecycle', key: '/publications', method: 'POST', controller: 'DefaultPublicationLifecycleController', operation: 'create' },
            get: { secured: true, accessGroups: ['runtimeConfigAdminUserGroup'], permission: 'publish.lifecycle.view', authTokenTypes: ['access'], apiExposure: 'publicationLifecycle', key: '/publications/:publicationCode', method: 'GET', controller: 'DefaultPublicationLifecycleController', operation: 'get' },
            validate: { secured: true, accessGroups: ['runtimeConfigAdminUserGroup'], permission: 'publish.lifecycle.validate', authTokenTypes: ['access'], apiExposure: 'publicationLifecycle', key: '/publications/:publicationCode/validate', method: 'POST', controller: 'DefaultPublicationLifecycleController', operation: 'validate' },
            requestApproval: { secured: true, accessGroups: ['runtimeConfigAdminUserGroup'], permission: 'publish.lifecycle.requestApproval', authTokenTypes: ['access'], apiExposure: 'publicationLifecycle', key: '/publications/:publicationCode/request-approval', method: 'POST', controller: 'DefaultPublicationLifecycleController', operation: 'requestApproval' },
            approve: { secured: true, accessGroups: ['runtimeConfigAdminUserGroup'], permission: 'publish.lifecycle.approve', authTokenTypes: ['service'], apiExposure: 'publicationLifecycle', key: '/publications/:publicationCode/approve', method: 'POST', controller: 'DefaultPublicationLifecycleController', operation: 'approve' },
            reject: { secured: true, accessGroups: ['runtimeConfigAdminUserGroup'], permission: 'publish.lifecycle.reject', authTokenTypes: ['service'], apiExposure: 'publicationLifecycle', key: '/publications/:publicationCode/reject', method: 'POST', controller: 'DefaultPublicationLifecycleController', operation: 'reject' },
            activate: { secured: true, accessGroups: ['runtimeConfigAdminUserGroup'], permission: 'publish.lifecycle.activate', authTokenTypes: ['service'], apiExposure: 'publicationLifecycle', key: '/publications/:publicationCode/activate', method: 'POST', controller: 'DefaultPublicationLifecycleController', operation: 'activate' },
            retry: { secured: true, accessGroups: ['runtimeConfigAdminUserGroup'], permission: 'publish.lifecycle.retry', authTokenTypes: ['access'], apiExposure: 'publicationLifecycle', key: '/publications/:publicationCode/retry', method: 'POST', controller: 'DefaultPublicationLifecycleController', operation: 'retry' },
            rollback: { secured: true, accessGroups: ['runtimeConfigAdminUserGroup'], permission: 'publish.lifecycle.rollback', authTokenTypes: ['access'], apiExposure: 'publicationLifecycle', key: '/publications/:publicationCode/rollback', method: 'POST', controller: 'DefaultPublicationLifecycleController', operation: 'rollback' },
            withdraw: { secured: true, accessGroups: ['runtimeConfigAdminUserGroup'], permission: 'publish.lifecycle.withdraw', authTokenTypes: ['access'], apiExposure: 'publicationLifecycle', key: '/publications/:publicationCode/withdraw', method: 'POST', controller: 'DefaultPublicationLifecycleController', operation: 'withdraw' }
        },
        publicationOperations: {
            diagnostics: { secured: true, accessGroups: ['runtimeConfigAdminUserGroup'], permission: 'publish.operations.view', authTokenTypes: ['access'], apiExposure: 'publicationLifecycle', key: '/publications/operations/diagnostics', method: 'GET', controller: 'DefaultPublicationLifecycleController', operation: 'diagnostics' },
            correlation: { secured: true, accessGroups: ['runtimeConfigAdminUserGroup'], permission: 'publish.operations.view', authTokenTypes: ['access'], apiExposure: 'publicationLifecycle', key: '/publications/operations/correlations/:correlationId', method: 'GET', controller: 'DefaultPublicationLifecycleController', operation: 'correlation' },
            reconcile: { secured: true, accessGroups: ['runtimeConfigAdminUserGroup'], permission: 'publish.operations.reconcile', authTokenTypes: ['access'], apiExposure: 'publicationLifecycle', key: '/publications/operations/reconcile', method: 'POST', controller: 'DefaultPublicationLifecycleController', operation: 'reconcile' },
            recover: { secured: true, accessGroups: ['runtimeConfigAdminUserGroup'], permission: 'publish.operations.recover', authTokenTypes: ['access'], apiExposure: 'publicationLifecycle', key: '/publications/:publicationCode/recover', method: 'POST', controller: 'DefaultPublicationLifecycleController', operation: 'recover' }
        }
    }
};
