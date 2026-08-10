/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module nodics.process/modules/workflow/modules/flowApi/src/router/routers
 * @description Secured Process API routes for definition lifecycle, runtime instances, human tasks, and audit inspection.
 * @layer router
 * @owner flowApi
 * @override Customer process overlays may add routes or narrow exposure through permission and apiExposure configuration.
 */
module.exports = {
    flowApi: {
        processDefinitions: {
            listDefinitions: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'],
                permission: 'process.definition.read', apiExposure: 'processManagement',
                key: '/definitions', method: 'GET', controller: 'DefaultProcessDefinitionController', operation: 'listDefinitions',
                help: { requestType: 'secured', message: 'List governed process definitions', method: 'GET', url: 'http://host:port/nodics/process/v0/definitions' }
            },
            getDefinition: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'],
                permission: 'process.definition.read', apiExposure: 'processManagement',
                key: '/definitions/:definitionCode', method: 'GET', controller: 'DefaultProcessDefinitionController', operation: 'getDefinition',
                help: { requestType: 'secured', message: 'Read one governed process definition', method: 'GET', url: 'http://host:port/nodics/process/v0/definitions/:definitionCode' }
            },
            createDefinition: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['runtimeConfigAdminUserGroup'],
                permission: 'process.definition.create', apiExposure: 'processManagement',
                key: '/definitions', method: 'POST', controller: 'DefaultProcessDefinitionController', operation: 'createDefinition',
                help: { requestType: 'secured', message: 'Create a draft process definition after backend graph validation', method: 'POST', url: 'http://host:port/nodics/process/v0/definitions' }
            },
            updateDraft: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['runtimeConfigAdminUserGroup'],
                permission: 'process.definition.update', apiExposure: 'processManagement',
                key: '/definitions/:definitionCode/draft', method: 'PATCH', controller: 'DefaultProcessDefinitionController', operation: 'updateDraft',
                help: { requestType: 'secured', message: 'Update only a draft process definition', method: 'PATCH', url: 'http://host:port/nodics/process/v0/definitions/:definitionCode/draft' }
            },
            validateDraft: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['runtimeConfigAdminUserGroup'],
                permission: 'process.definition.validate', apiExposure: 'processManagement',
                key: '/definitions/:definitionCode/draft/validate', method: 'POST', controller: 'DefaultProcessDefinitionController', operation: 'validateDraft',
                help: { requestType: 'secured', message: 'Validate a draft process graph without publishing', method: 'POST', url: 'http://host:port/nodics/process/v0/definitions/:definitionCode/draft/validate' }
            },
            publishDraft: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['runtimeConfigAdminUserGroup'],
                permission: 'process.definition.publish', apiExposure: 'processManagement',
                key: '/definitions/:definitionCode/draft/publish', method: 'POST', controller: 'DefaultProcessDefinitionController', operation: 'publishDraft',
                help: { requestType: 'secured', message: 'Publish a valid draft process definition as an immutable version', method: 'POST', url: 'http://host:port/nodics/process/v0/definitions/:definitionCode/draft/publish' }
            },
            prepareNextDraft: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['runtimeConfigAdminUserGroup'],
                permission: 'process.definition.update', apiExposure: 'processManagement',
                key: '/definitions/:definitionCode/draft/prepare', method: 'POST', controller: 'DefaultProcessDefinitionController', operation: 'prepareNextDraft',
                help: { requestType: 'secured', message: 'Prepare the next editable draft from the latest published process version', method: 'POST', url: 'http://host:port/nodics/process/v0/definitions/:definitionCode/draft/prepare' }
            },
            deleteOrArchive: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['runtimeConfigAdminUserGroup'],
                permission: 'process.definition.delete', apiExposure: 'processManagement',
                key: '/definitions/:definitionCode', method: 'DELETE', controller: 'DefaultProcessDefinitionController', operation: 'deleteOrArchive',
                help: { requestType: 'secured', message: 'Delete a draft definition or archive a published definition', method: 'DELETE', url: 'http://host:port/nodics/process/v0/definitions/:definitionCode' }
            },
            listVersions: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'],
                permission: 'process.definition.read', apiExposure: 'processManagement',
                key: '/definitions/:definitionCode/versions', method: 'GET', controller: 'DefaultProcessDefinitionController', operation: 'listVersions',
                help: { requestType: 'secured', message: 'List immutable published versions for one process definition', method: 'GET', url: 'http://host:port/nodics/process/v0/definitions/:definitionCode/versions' }
            }
        },
        processOperations: {
            startInstance: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'],
                permission: 'process.instance.start', apiExposure: 'processManagement',
                key: '/instances', method: 'POST', controller: 'DefaultProcessOperationsController', operation: 'startInstance',
                help: { requestType: 'secured', message: 'Start a published process definition and create the first runtime task when needed', method: 'POST', url: 'http://host:port/nodics/process/v0/instances' }
            },
            listInstances: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'],
                permission: 'process.backoffice.view', apiExposure: 'processManagement',
                key: '/instances', method: 'GET', controller: 'DefaultProcessOperationsController', operation: 'listInstances',
                help: { requestType: 'secured', message: 'List governed process runtime instances', method: 'GET', url: 'http://host:port/nodics/process/v0/instances' }
            },
            getInstance: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'],
                permission: 'process.backoffice.view', apiExposure: 'processManagement',
                key: '/instances/:instanceCode', method: 'GET', controller: 'DefaultProcessOperationsController', operation: 'getInstance',
                help: { requestType: 'secured', message: 'Read one governed process runtime instance', method: 'GET', url: 'http://host:port/nodics/process/v0/instances/:instanceCode' }
            },
            getInstanceDetail: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'],
                permission: 'process.backoffice.view', apiExposure: 'processManagement',
                key: '/instances/:instanceCode/detail', method: 'GET', controller: 'DefaultProcessOperationsController', operation: 'getInstanceDetail',
                help: { requestType: 'secured', message: 'Read process instance detail with tasks and audit timeline', method: 'GET', url: 'http://host:port/nodics/process/v0/instances/:instanceCode/detail' }
            },
            cancelInstance: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['runtimeConfigAdminUserGroup'],
                permission: 'process.instance.cancel', apiExposure: 'processManagement',
                key: '/instances/:instanceCode/cancel', method: 'POST', controller: 'DefaultProcessOperationsController', operation: 'cancelInstance',
                help: { requestType: 'secured', message: 'Cancel a running or waiting process instance', method: 'POST', url: 'http://host:port/nodics/process/v0/instances/:instanceCode/cancel' }
            },
            retryInstance: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['runtimeConfigAdminUserGroup'],
                permission: 'process.instance.retry', apiExposure: 'processManagement',
                key: '/instances/:instanceCode/retry', method: 'POST', controller: 'DefaultProcessOperationsController', operation: 'retryInstance',
                help: { requestType: 'secured', message: 'Retry the failed ACTION for a governed process incident', method: 'POST', url: 'http://host:port/nodics/process/v0/instances/:instanceCode/retry' }
            },
            compensateInstance: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['runtimeConfigAdminUserGroup'],
                permission: 'process.instance.compensate', apiExposure: 'processManagement',
                key: '/instances/:instanceCode/compensate', method: 'POST', controller: 'DefaultProcessOperationsController', operation: 'compensateInstance',
                help: { requestType: 'secured', message: 'Execute the failed node declarative domain compensation adapter', method: 'POST', url: 'http://host:port/nodics/process/v0/instances/:instanceCode/compensate' }
            },
            listIncidents: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'],
                permission: 'process.incident.read', apiExposure: 'processManagement',
                key: '/incidents', method: 'GET', controller: 'DefaultProcessOperationsController', operation: 'listIncidents',
                help: { requestType: 'secured', message: 'List Process-owned recovery incidents', method: 'GET', url: 'http://host:port/nodics/process/v0/incidents' }
            },
            getIncident: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'],
                permission: 'process.incident.read', apiExposure: 'processManagement',
                key: '/incidents/:incidentCode', method: 'GET', controller: 'DefaultProcessOperationsController', operation: 'getIncident',
                help: { requestType: 'secured', message: 'Read one Process-owned recovery incident', method: 'GET', url: 'http://host:port/nodics/process/v0/incidents/:incidentCode' }
            },
            listTasks: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'],
                permission: 'process.backoffice.view', apiExposure: 'processManagement',
                key: '/tasks', method: 'GET', controller: 'DefaultProcessOperationsController', operation: 'listTasks',
                help: { requestType: 'secured', message: 'List governed human workflow tasks', method: 'GET', url: 'http://host:port/nodics/process/v0/tasks' }
            },
            getTask: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'],
                permission: 'process.backoffice.view', apiExposure: 'processManagement',
                key: '/tasks/:taskCode', method: 'GET', controller: 'DefaultProcessOperationsController', operation: 'getTask',
                help: { requestType: 'secured', message: 'Read one governed human workflow task', method: 'GET', url: 'http://host:port/nodics/process/v0/tasks/:taskCode' }
            },
            claimTask: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'],
                permission: 'process.task.claim', apiExposure: 'processManagement',
                key: '/tasks/:taskCode/claim', method: 'POST', controller: 'DefaultProcessOperationsController', operation: 'claimTask',
                help: { requestType: 'secured', message: 'Claim an open process task', method: 'POST', url: 'http://host:port/nodics/process/v0/tasks/:taskCode/claim' }
            },
            assignTask: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['runtimeConfigAdminUserGroup'],
                permission: 'process.task.assign', apiExposure: 'processManagement',
                key: '/tasks/:taskCode/assign', method: 'POST', controller: 'DefaultProcessOperationsController', operation: 'assignTask',
                help: { requestType: 'secured', message: 'Assign or reassign an open process task', method: 'POST', url: 'http://host:port/nodics/process/v0/tasks/:taskCode/assign' }
            },
            completeTask: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'],
                permission: 'process.task.complete', apiExposure: 'processManagement',
                key: '/tasks/:taskCode/complete', method: 'POST', controller: 'DefaultProcessOperationsController', operation: 'completeTask',
                help: { requestType: 'secured', message: 'Complete a process task and advance the instance', method: 'POST', url: 'http://host:port/nodics/process/v0/tasks/:taskCode/complete' }
            },
            cancelTask: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['runtimeConfigAdminUserGroup'],
                permission: 'process.task.cancel', apiExposure: 'processManagement',
                key: '/tasks/:taskCode/cancel', method: 'POST', controller: 'DefaultProcessOperationsController', operation: 'cancelTask',
                help: { requestType: 'secured', message: 'Cancel a process task without cancelling the whole instance', method: 'POST', url: 'http://host:port/nodics/process/v0/tasks/:taskCode/cancel' }
            },
            listTriggers: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'],
                permission: 'process.backoffice.view', apiExposure: 'processManagement',
                key: '/triggers', method: 'GET', controller: 'DefaultProcessOperationsController', operation: 'listTriggers',
                help: { requestType: 'secured', message: 'List Process-owned scheduled trigger metadata while Cron owns actual jobs', method: 'GET', url: 'http://host:port/nodics/process/v0/triggers' }
            },
            createTrigger: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['runtimeConfigAdminUserGroup'],
                permission: 'process.trigger.manage', apiExposure: 'processManagement',
                key: '/triggers', method: 'POST', controller: 'DefaultProcessOperationsController', operation: 'createTrigger',
                help: { requestType: 'secured', message: 'Create Process-owned trigger metadata for a published process', method: 'POST', url: 'http://host:port/nodics/process/v0/triggers' }
            },
            updateTrigger: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['runtimeConfigAdminUserGroup'],
                permission: 'process.trigger.manage', apiExposure: 'processManagement',
                key: '/triggers/:triggerCode', method: 'PATCH', controller: 'DefaultProcessOperationsController', operation: 'updateTrigger',
                help: { requestType: 'secured', message: 'Update Process-owned trigger metadata without moving Cron job ownership', method: 'PATCH', url: 'http://host:port/nodics/process/v0/triggers/:triggerCode' }
            },
            archiveTrigger: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['runtimeConfigAdminUserGroup'],
                permission: 'process.trigger.manage', apiExposure: 'processManagement',
                key: '/triggers/:triggerCode/archive', method: 'POST', controller: 'DefaultProcessOperationsController', operation: 'archiveTrigger',
                help: { requestType: 'secured', message: 'Archive Process-owned trigger metadata', method: 'POST', url: 'http://host:port/nodics/process/v0/triggers/:triggerCode/archive' }
            },
            executeTrigger: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['runtimeConfigAdminUserGroup'],
                permission: 'process.trigger.execute', apiExposure: 'processManagement',
                key: '/triggers/:triggerCode/execute', method: 'POST', controller: 'DefaultProcessOperationsController', operation: 'executeTrigger',
                help: { requestType: 'secured', message: 'Execute an active Process trigger and start the referenced process instance', method: 'POST', url: 'http://host:port/nodics/process/v0/triggers/:triggerCode/execute' }
            },
            listAuditEvents: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'],
                permission: 'process.backoffice.view', apiExposure: 'processManagement',
                key: '/audit-events', method: 'GET', controller: 'DefaultProcessOperationsController', operation: 'listAuditEvents',
                help: { requestType: 'secured', message: 'List bounded process audit events', method: 'GET', url: 'http://host:port/nodics/process/v0/audit-events' }
            }
        }
    }
};
