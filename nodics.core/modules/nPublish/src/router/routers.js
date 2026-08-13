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
const operation = (key, method, name, permission, tokenType = 'access') => ({
    secured: true,
    accessGroups: ['runtimeConfigAdminUserGroup'],
    permission: permission,
    authTokenTypes: [tokenType],
    apiExposure: 'publicationLifecycle',
    key: key,
    method: method,
    controller: 'DefaultPublicationLifecycleController',
    operation: name
});

module.exports = {
    publish: {
        publicationLifecycle: {
            create: operation('/publications', 'POST', 'create', 'publish.lifecycle.create'),
            get: operation('/publications/:publicationCode', 'GET', 'get', 'publish.lifecycle.view'),
            validate: operation('/publications/:publicationCode/validate', 'POST', 'validate', 'publish.lifecycle.validate'),
            requestApproval: operation('/publications/:publicationCode/request-approval', 'POST', 'requestApproval', 'publish.lifecycle.requestApproval'),
            approve: operation('/publications/:publicationCode/approve', 'POST', 'approve', 'publish.lifecycle.approve', 'service'),
            reject: operation('/publications/:publicationCode/reject', 'POST', 'reject', 'publish.lifecycle.reject', 'service'),
            activate: operation('/publications/:publicationCode/activate', 'POST', 'activate', 'publish.lifecycle.activate', 'service'),
            retry: operation('/publications/:publicationCode/retry', 'POST', 'retry', 'publish.lifecycle.retry'),
            rollback: operation('/publications/:publicationCode/rollback', 'POST', 'rollback', 'publish.lifecycle.rollback'),
            withdraw: operation('/publications/:publicationCode/withdraw', 'POST', 'withdraw', 'publish.lifecycle.withdraw')
        },
        publicationOperations: {
            diagnostics: operation('/publications/operations/diagnostics', 'GET', 'diagnostics', 'publish.operations.view'),
            correlation: operation('/publications/operations/correlations/:correlationId', 'GET', 'correlation', 'publish.operations.view'),
            reconcile: operation('/publications/operations/reconcile', 'POST', 'reconcile', 'publish.operations.reconcile'),
            recover: operation('/publications/:publicationCode/recover', 'POST', 'recover', 'publish.operations.recover')
        }
    }
};
