/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module editorial/config/properties
 * @description Defines generated configurable defaults for editorial.
 * @layer config
 * @owner generated
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    schemaPolicies: { editorial: {
        tenantOwned: { accessGroups: { adminGroup: 10, serviceAccountUserGroup: 10, employeeUserGroup: 10 } },
        operational: { accessGroups: { adminGroup: 10, serviceAccountUserGroup: 10, employeeUserGroup: 10 } }
    } },
    editorial: {
        workflow: { definitionCode: 'editorialApproval', requiredStatus: 'DRAFT', readyStatus: 'APPROVED', notificationIntent: 'editorial.workflow.task' },
        publication: { runtimeRole: 'STAGED', maximumDependencies: 500, versionProvider: 'DefaultEditorialPublicationVersionProviderService' },
        delivery: { defaultLimit: 20, maximumLimit: 100, cacheTtl: 30000, supportedLocales: ['en', 'ar'], supportedChannels: ['web'] },
        syndication: { maximumItems: 100 }
    },
    process: { actionAdapters: { allowedActions: [
        { moduleName: 'nodics.process', operation: 'noop', description: 'Safe Process no-op adapter' },
        { moduleName: 'editorial', operation: 'applyDecision', service: 'DefaultEditorialWorkflowAdapterService', method: 'applyProcessDecision', description: 'Apply a completed Editorial review decision with exact revision correlation' },
        { moduleName: 'editorial', operation: 'publishApproved', service: 'DefaultEditorialPublicationService', method: 'applyProcessPublication', description: 'Resume an approved Editorial release through nPublish authority' }
    ] } },
    publish: { providers: { domainAdapters: { editorial: 'DefaultEditorialPublicationAdapterService' }, versionProviders: { editorial: 'DefaultEditorialPublicationVersionProviderService' } } }
};
