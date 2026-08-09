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
 * @description Secured Process API routes for definition CRUD, validation, version publication, archive/delete, and version inspection.
 * @layer router
 * @owner flowApi
 * @override Customer process overlays may add routes or narrow exposure through permission and apiExposure configuration.
 */
module.exports = {
    process: {
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
        }
    }
};
