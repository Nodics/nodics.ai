/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module backoffice/src/router/routers
 * @description Router definition registry for this boundary.
 * @layer definition
 * @owner backoffice
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
const contracts = require('../schemas/apiContracts');


module.exports = {
    backoffice: {
        registryControl: {
            register: {
                secured: true,
                accessGroups: ['userGroup'],
                permissionConfig: 'authSecurity.internalToken.routePermission',
                apiExposure: 'serviceRegistry',
                key: '/registry/instances',
                method: 'PUT',
                controller: 'DefaultBackofficeRegistryController',
                operation: 'register',
                requestBody: { required: true, content: { 'application/json': { schema: contracts.registrationBatch } } },
                responses: { '200': { description: 'Runtime module leases registered', content: { 'application/json': {
                    schema: ({ type: 'object', required: ['code', 'data'], properties: { code: { type: 'string' }, data: { type: 'object', required: ['instanceId', 'registeredModules'], properties: {
                        instanceId: { type: 'string' }, registeredModules: { type: 'integer', minimum: 1 }
                    } } } })
                } } } }
            },
            deregister: {
                secured: true,
                accessGroups: ['userGroup'],
                permissionConfig: 'authSecurity.internalToken.routePermission',
                apiExposure: 'serviceRegistry',
                key: '/registry/instances/:instanceId',
                method: 'DELETE',
                controller: 'DefaultBackofficeRegistryController',
                operation: 'deregister'
            }
        },
        registryDiscovery: {
            availableFunctionalModules: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'backoffice.registry.view',
                authTokenTypes: ['access'],
                apiExposure: 'serviceRegistry',
                key: '/runtime/modules/available',
                method: 'GET',
                controller: 'DefaultBackofficeRegistryController',
                operation: 'availableFunctionalModules',
                help: { parameters: [{ name: 'project', in: 'query', required: true,
                    schema: { type: 'string', pattern: contracts.moduleName.pattern } }] },
                responses: { '200': { description: 'Project-scoped durable functional-module registrations', content: { 'application/json': {
                    schema: ({ type: 'object', required: ['code', 'data'], properties: { code: { type: 'string' }, data: contracts.functionalModuleCatalogueData } })
                } } } }
            },
            functionalModuleRegistrations: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'backoffice.registry.view',
                authTokenTypes: ['access'],
                apiExposure: 'serviceRegistry',
                key: '/runtime/modules/registrations',
                method: 'GET',
                controller: 'DefaultBackofficeRegistryController',
                operation: 'functionalModuleRegistrations',
                help: { parameters: [{ name: 'project', in: 'query', required: true,
                    schema: { type: 'string', pattern: contracts.moduleName.pattern } }] },
                responses: { '200': { description: 'Project-scoped registered functional modules', content: { 'application/json': {
                    schema: ({ type: 'object', required: ['code', 'data'], properties: { code: { type: 'string' }, data: contracts.functionalModuleCatalogueData } })
                } } } }
            },
            functionalModuleDetail: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'backoffice.registry.view',
                authTokenTypes: ['access'],
                apiExposure: 'serviceRegistry',
                key: '/runtime/modules/registrations/:functionalModule',
                method: 'GET',
                controller: 'DefaultBackofficeRegistryController',
                operation: 'functionalModuleDetail',
                help: { parameters: [
                    { name: 'functionalModule', in: 'path', required: true, schema: { type: 'string', pattern: contracts.moduleName.pattern } },
                    { name: 'project', in: 'query', required: true, schema: { type: 'string', pattern: contracts.moduleName.pattern } }
                ] },
                responses: { '200': { description: 'Durable functional-module registration detail', content: { 'application/json': {
                    schema: ({ type: 'object', required: ['code', 'data'], properties: { code: { type: 'string' }, data: contracts.functionalModuleRegistration } })
                } } } }
            },
            registerFunctionalModule: {
                secured: true, accessGroups: ['userGroup'], permission: 'backoffice.functionalModule.register',
                authTokenTypes: ['access'], apiExposure: 'serviceRegistry',
                key: '/runtime/modules/registrations/:functionalModule/register', method: 'POST',
                controller: 'DefaultBackofficeRegistryController', operation: 'registerFunctionalModule',
                requestBody: { required: true, content: { 'application/json': { schema: contracts.functionalModuleLifecycleDecision } } },
                responses: { '200': { description: 'Functional module registered for the project', content: { 'application/json': {
                    schema: ({ type: 'object', required: ['code', 'data'], properties: { code: { type: 'string' }, data: contracts.functionalModuleRegistration } })
                } } } }
            },
            activateFunctionalModule: {
                secured: true, accessGroups: ['userGroup'], permission: 'backoffice.functionalModule.activate',
                authTokenTypes: ['access'], apiExposure: 'serviceRegistry',
                key: '/runtime/modules/registrations/:functionalModule/activate', method: 'POST',
                controller: 'DefaultBackofficeRegistryController', operation: 'activateFunctionalModule',
                requestBody: { required: true, content: { 'application/json': { schema: contracts.functionalModuleLifecycleDecision } } },
                responses: { '200': { description: 'Registered functional module enabled for Axis', content: { 'application/json': {
                    schema: ({ type: 'object', required: ['code', 'data'], properties: { code: { type: 'string' }, data: contracts.functionalModuleRegistration } })
                } } } }
            },
            deactivateFunctionalModule: {
                secured: true, accessGroups: ['userGroup'], permission: 'backoffice.functionalModule.deactivate',
                authTokenTypes: ['access'], apiExposure: 'serviceRegistry',
                key: '/runtime/modules/registrations/:functionalModule/deactivate', method: 'POST',
                controller: 'DefaultBackofficeRegistryController', operation: 'deactivateFunctionalModule',
                requestBody: { required: true, content: { 'application/json': { schema: contracts.functionalModuleLifecycleDecision } } },
                responses: { '200': { description: 'Optional functional module disabled for Axis', content: { 'application/json': {
                    schema: ({ type: 'object', required: ['code', 'data'], properties: { code: { type: 'string' }, data: contracts.functionalModuleRegistration } })
                } } } }
            },
            deregisterFunctionalModule: {
                secured: true, accessGroups: ['userGroup'], permission: 'backoffice.functionalModule.deregister',
                authTokenTypes: ['access'], apiExposure: 'serviceRegistry',
                key: '/runtime/modules/registrations/:functionalModule/deregister', method: 'POST',
                controller: 'DefaultBackofficeRegistryController', operation: 'deregisterFunctionalModule',
                requestBody: { required: true, content: { 'application/json': { schema: contracts.functionalModuleLifecycleDecision } } },
                responses: { '200': { description: 'Optional functional module deregistered from the project', content: { 'application/json': {
                    schema: ({ type: 'object', required: ['code', 'data'], properties: { code: { type: 'string' }, data: contracts.functionalModuleRegistration } })
                } } } }
            },
            publicBootstrap: {
                secured: false,
                publicAccess: true,
                accessGroups: ['userGroup'],
                apiExposure: 'serviceRegistry',
                key: '/bootstrap/public',
                method: 'GET',
                controller: 'DefaultBackofficeRegistryController',
                operation: 'publicBootstrap',
                help: { parameters: [{ name: 'x-nodics-client-contract-version', in: 'header', required: true,
                    description: 'Positive Axis client contract version.', schema: { type: 'integer', minimum: 1 } }] },
                responses: { '200': { description: 'Low-disclosure pre-authentication Axis bootstrap', content: { 'application/json': {
                    schema: ({ type: 'object', required: ['code', 'data'], properties: { code: { type: 'string' }, data: contracts.publicBootstrapData } })
                } } } }
            },
            list: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'backoffice.registry.view',
                authTokenTypes: ['access'],
                apiExposure: 'serviceRegistry',
                key: '/registry/modules',
                method: 'GET',
                controller: 'DefaultBackofficeRegistryController',
                operation: 'list',
                responses: { '200': { description: 'Authorized client-safe module leases', content: { 'application/json': {
                    schema: ({ type: 'object', required: ['code', 'data'], properties: { code: { type: 'string' }, data: contracts.discoveryData } })
                } } } }
            },
            bootstrap: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'backoffice.bootstrap.view',
                authTokenTypes: ['access'],
                apiExposure: 'serviceRegistry',
                key: '/bootstrap',
                method: 'GET',
                controller: 'DefaultBackofficeRegistryController',
                operation: 'bootstrap',
                help: { parameters: [{ name: 'x-nodics-client-contract-version', in: 'header', required: false,
                    description: 'Positive BackOffice client contract version; defaults to the configured minimum.', schema: { type: 'integer', minimum: 1 } }] },
                responses: { '200': { description: 'Authorized BackOffice client bootstrap', content: { 'application/json': {
                    schema: ({ type: 'object', required: ['code', 'data'], properties: { code: { type: 'string' }, data: contracts.bootstrapData } })
                } } } }
            },
            diagnostics: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'backoffice.registry.diagnostics.view',
                authTokenTypes: ['access'],
                apiExposure: 'serviceRegistry',
                key: '/registry/diagnostics',
                method: 'GET',
                controller: 'DefaultBackofficeRegistryController',
                operation: 'diagnostics',
                responses: { '200': { description: 'Sanitized registry diagnostics', content: { 'application/json': {
                    schema: ({ type: 'object', required: ['code', 'data'], properties: { code: { type: 'string' }, data: contracts.diagnosticsData } })
                } } } }
            },
            adminList: {
                secured: true, accessGroups: ['userGroup'], permission: 'backoffice.registry.admin.view',
                authTokenTypes: ['access'], apiExposure: 'serviceRegistry',
                key: '/registry/admin/modules', method: 'GET', controller: 'DefaultBackofficeRegistryController', operation: 'adminList',
                help: { parameters: ['moduleName', 'capability', 'environment', 'server', 'state', 'compatibility'].map(name =>
                    ({ name: name, in: 'query', required: false, schema: { type: 'string' } })).concat([
                    { name: 'offset', in: 'query', required: false, schema: { type: 'integer', minimum: 0 } },
                    { name: 'limit', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 100 } }
                ]) }, responses: { '200': { description: 'Bounded sanitized administrative module inventory', content: { 'application/json': {
                    schema: ({ type: 'object', required: ['code', 'data'], properties: { code: { type: 'string' }, data: contracts.adminListData } })
                } } } }
            },
            adminDetail: {
                secured: true, accessGroups: ['userGroup'], permission: 'backoffice.registry.admin.view',
                authTokenTypes: ['access'], apiExposure: 'serviceRegistry',
                key: '/registry/admin/modules/:moduleName', method: 'GET', controller: 'DefaultBackofficeRegistryController', operation: 'adminDetail',
                responses: { '200': { description: 'Sanitized administrative module detail', content: { 'application/json': {
                    schema: ({ type: 'object', required: ['code', 'data'], properties: { code: { type: 'string' }, data: contracts.adminDetailData } })
                } } } }
            },
            refresh: {
                secured: true, accessGroups: ['userGroup'], permission: 'backoffice.registry.refresh',
                authTokenTypes: ['access'], apiExposure: 'serviceRegistry',
                key: '/registry/admin/modules/:moduleName/refresh', method: 'POST', controller: 'DefaultBackofficeRegistryController', operation: 'refresh',
                responses: { '202': { description: 'Existing availability and discovery observers refreshed', content: { 'application/json': {
                    schema: ({ type: 'object', required: ['code', 'data'], properties: { code: { type: 'string' }, data: contracts.refreshData } })
                } } } }
            }
        },
        axisPolicy: {
            get: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'backoffice.axis.policy.view',
                authTokenTypes: ['access'],
                apiExposure: 'serviceRegistry',
                key: '/axis/policy',
                method: 'GET',
                controller: 'DefaultBackofficeAxisPolicyController',
                operation: 'get',
                responses: { '200': { description: 'Effective client-safe Axis employee policy', content: { 'application/json': {
                    schema: ({ type: 'object', required: ['code', 'data'], properties: { code: { type: 'string' }, data: contracts.axisPolicy } })
                } } } }
            },
            update: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'backoffice.axis.policy.update',
                authTokenTypes: ['access'],
                apiExposure: 'serviceRegistry',
                key: '/axis/policy',
                method: 'PUT',
                controller: 'DefaultBackofficeAxisPolicyController',
                operation: 'update',
                requestBody: { required: true, content: { 'application/json': { schema: contracts.axisPolicyUpdate } } },
                responses: { '200': { description: 'Revision-updated persistent Axis employee policy', content: { 'application/json': {
                    schema: ({ type: 'object', required: ['code', 'data'], properties: { code: { type: 'string' }, data: contracts.axisPolicy } })
                } } } }
            }
        },
        axisInitialization: {
            initializationStatus: {
                secured: true, accessGroups: ['userGroup'], permission: 'backoffice.axis.initialization.view',
                authTokenTypes: ['access'], apiExposure: 'serviceRegistry',
                key: '/axis/initialization', method: 'GET',
                cache: { enabled: false },
                controller: 'DefaultBackofficeAxisInitializationController', operation: 'status',
                responses: { '200': { description: 'Derived Axis initialization readiness', content: { 'application/json': {
                    schema: ({ type: 'object', required: ['code', 'data'], properties: { code: { type: 'string' }, data: { type: 'object' } } })
                } } } }
            },
            initiateInitialization: {
                secured: true, accessGroups: ['runtimeConfigAdminUserGroup'], permission: 'backoffice.axis.initialization.initiate',
                authTokenTypes: ['access'], apiExposure: 'serviceRegistry',
                key: '/axis/initialization/initiate', method: 'POST',
                cache: { enabled: false },
                controller: 'DefaultBackofficeAxisInitializationController', operation: 'initiate',
                requestBody: { required: true, content: { 'application/json': { schema: {
                    type: 'object', additionalProperties: false, properties: {
                        reason: { type: 'string', maxLength: 1000 },
                        correlationId: { type: 'string', maxLength: 256 }
                    }
                } } } },
                responses: { '200': { description: 'Axis baseline submitted to normal approval', content: { 'application/json': {
                    schema: ({ type: 'object', required: ['code', 'data'], properties: { code: { type: 'string' }, data: { type: 'object' } } })
                } } } }
            }
        },
        applicationInitialization: {
            applicationInitializationProfiles: {
                secured: true, accessGroups: ['userGroup'], permission: 'backoffice.application.initialization.view',
                authTokenTypes: ['access'], apiExposure: 'serviceRegistry', cache: { enabled: false },
                key: '/applications/initialization/profiles', method: 'GET',
                controller: 'DefaultBackofficeApplicationInitializationController', operation: 'profiles'
            },
            applicationInitializationStatus: {
                secured: true, accessGroups: ['userGroup'], permission: 'backoffice.application.initialization.view',
                authTokenTypes: ['access'], apiExposure: 'serviceRegistry', cache: { enabled: false },
                key: '/applications/:profileCode/initialization', method: 'GET',
                controller: 'DefaultBackofficeApplicationInitializationController', operation: 'status'
            },
            applicationContentPackStatus: {
                secured: true, accessGroups: ['userGroup'], permission: 'backoffice.application.initialization.view',
                authTokenTypes: ['access'], apiExposure: 'serviceRegistry', cache: { enabled: false },
                key: '/applications/:profileCode/initialization/content-pack', method: 'GET',
                controller: 'DefaultBackofficeApplicationInitializationController', operation: 'contentPackStatus'
            },
            installApplicationContentPack: {
                secured: true, accessGroups: ['runtimeConfigAdminUserGroup'], permission: 'backoffice.application.initialization.initiate',
                authTokenTypes: ['access'], apiExposure: 'serviceRegistry', cache: { enabled: false },
                key: '/applications/:profileCode/initialization/content-pack/install', method: 'POST',
                controller: 'DefaultBackofficeApplicationInitializationController', operation: 'installContentPack'
            },
            initiateApplicationInitialization: {
                secured: true, accessGroups: ['runtimeConfigAdminUserGroup'], permission: 'backoffice.application.initialization.initiate',
                authTokenTypes: ['access'], apiExposure: 'serviceRegistry', cache: { enabled: false },
                key: '/applications/:profileCode/initialization/initiate', method: 'POST',
                controller: 'DefaultBackofficeApplicationInitializationController', operation: 'initiate',
                requestBody: { required: true, content: { 'application/json': { schema: {
                    type: 'object', additionalProperties: false, properties: {
                        reason: { type: 'string', maxLength: 1000 },
                        correlationId: { type: 'string', maxLength: 256 }
                    }
                } } } }
            },
            rollbackApplicationInitialization: {
                secured: true, accessGroups: ['runtimeConfigAdminUserGroup'], permission: 'backoffice.application.initialization.rollback',
                authTokenTypes: ['access'], apiExposure: 'serviceRegistry', cache: { enabled: false },
                key: '/applications/:profileCode/initialization/rollback', method: 'POST',
                controller: 'DefaultBackofficeApplicationInitializationController', operation: 'rollback'
            },
            retireApplicationInitialization: {
                secured: true, accessGroups: ['runtimeConfigAdminUserGroup'], permission: 'backoffice.application.initialization.retire',
                authTokenTypes: ['access'], apiExposure: 'serviceRegistry', cache: { enabled: false },
                key: '/applications/:profileCode/initialization/retire', method: 'POST',
                controller: 'DefaultBackofficeApplicationInitializationController', operation: 'retire'
            }
        },
        localReset: {
            localResetStatus: {
                secured: true, accessGroups: ['runtimeConfigAdminUserGroup'], permission: 'backoffice.localReset.view',
                authTokenTypes: ['access'], apiExposure: 'serviceRegistry',
                key: '/operations/local-reset', method: 'GET',
                cache: { enabled: false },
                controller: 'DefaultBackofficeLocalResetController', operation: 'status',
                responses: { '200': { description: 'Governed Local reset readiness without data inspection', content: { 'application/json': {
                    schema: ({ type: 'object', required: ['code', 'data'], properties: { code: { type: 'string' }, data: { type: 'object' } } })
                } } } }
            },
            executeLocalReset: {
                secured: true, accessGroups: ['runtimeConfigAdminUserGroup'], permission: 'backoffice.localReset.execute',
                authTokenTypes: ['access'], apiExposure: 'serviceRegistry',
                key: '/operations/local-reset', method: 'POST',
                cache: { enabled: false },
                controller: 'DefaultBackofficeLocalResetController', operation: 'execute',
                requestBody: { required: true, content: { 'application/json': { schema: {
                    type: 'object', additionalProperties: false, required: ['confirmation', 'reason'], properties: {
                        confirmation: { type: 'string', maxLength: 64 }, reason: { type: 'string', minLength: 8, maxLength: 1000 },
                        correlationId: { type: 'string', maxLength: 256 }
                    }
                } } } },
                responses: { '200': { description: 'Every configured owner acknowledged its bounded Local reset', content: { 'application/json': {
                    schema: ({ type: 'object', required: ['code', 'data'], properties: { code: { type: 'string' }, data: { type: 'object' } } })
                } } } }
            }
        },
        contractHistory: {
            current: {
                secured: true, accessGroups: ['userGroup'], permission: 'backoffice.contract.view',
                authTokenTypes: ['access'], apiExposure: 'serviceRegistry',
                key: '/contracts/:moduleName/current', method: 'GET', controller: 'DefaultBackofficeContractController', operation: 'current',
                responses: { '200': { description: 'Current durable safe contract observation', content: { 'application/json': {
                    schema: ({ type: 'object', required: ['code', 'data'], properties: { code: { type: 'string' }, data: contracts.contractCurrentData } })
                } } } }
            },
            history: {
                secured: true, accessGroups: ['userGroup'], permission: 'backoffice.contract.view',
                authTokenTypes: ['access'], apiExposure: 'serviceRegistry',
                key: '/contracts/:moduleName/history', method: 'GET', controller: 'DefaultBackofficeContractController', operation: 'history',
                help: { parameters: [{ name: 'limit', in: 'query', required: false, schema: { type: 'integer', minimum: 1 } }] },
                responses: { '200': { description: 'Bounded durable contract observation history', content: { 'application/json': {
                    schema: ({ type: 'object', required: ['code', 'data'], properties: { code: { type: 'string' }, data: contracts.contractHistoryData } })
                } } } }
            },
            compare: {
                secured: true, accessGroups: ['userGroup'], permission: 'backoffice.contract.view',
                authTokenTypes: ['access'], apiExposure: 'serviceRegistry',
                key: '/contracts/:moduleName/:hash/compare', method: 'POST', controller: 'DefaultBackofficeContractController', operation: 'compare',
                responses: { '200': { description: 'Candidate comparison with the active observation', content: { 'application/json': {
                    schema: ({ type: 'object', required: ['code', 'data'], properties: { code: { type: 'string' }, data: contracts.contractComparisonData } })
                } } } }
            },
            approve: {
                secured: true, accessGroups: ['userGroup'], permission: 'backoffice.contract.approve',
                authTokenTypes: ['access'], apiExposure: 'serviceRegistry',
                key: '/contracts/:moduleName/:hash/approve', method: 'POST', controller: 'DefaultBackofficeContractController', operation: 'approve',
                requestBody: { required: true, content: { 'application/json': { schema: contracts.contractDecision } } },
                responses: { '200': { description: 'Approved contract observation', content: { 'application/json': {
                    schema: ({ type: 'object', required: ['code', 'data'], properties: { code: { type: 'string' }, data: contracts.contractDecisionData } })
                } } } }
            },
            reject: {
                secured: true, accessGroups: ['userGroup'], permission: 'backoffice.contract.reject',
                authTokenTypes: ['access'], apiExposure: 'serviceRegistry',
                key: '/contracts/:moduleName/:hash/reject', method: 'POST', controller: 'DefaultBackofficeContractController', operation: 'reject',
                requestBody: { required: true, content: { 'application/json': { schema: contracts.contractDecision } } },
                responses: { '200': { description: 'Rejected contract observation', content: { 'application/json': {
                    schema: ({ type: 'object', required: ['code', 'data'], properties: { code: { type: 'string' }, data: contracts.contractDecisionData } })
                } } } }
            },
            rollback: {
                secured: true, accessGroups: ['userGroup'], permission: 'backoffice.contract.rollback',
                authTokenTypes: ['access'], apiExposure: 'serviceRegistry',
                key: '/contracts/:moduleName/:hash/rollback', method: 'POST', controller: 'DefaultBackofficeContractController', operation: 'rollback',
                requestBody: { required: true, content: { 'application/json': { schema: contracts.contractDecision } } },
                responses: { '200': { description: 'Rolled-back active contract observation', content: { 'application/json': {
                    schema: ({ type: 'object', required: ['code', 'data'], properties: { code: { type: 'string' }, data: contracts.contractDecisionData } })
                } } } }
            }
        }
    }
};
