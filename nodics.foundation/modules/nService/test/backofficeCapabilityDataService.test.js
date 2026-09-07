/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module nService/test/backofficeCapabilityDataService
 * @description Verifies declarative module-owned BackOffice capability data is normalized without bypassing active-module registration.
 * @layer test
 * @owner nService
 */
const assert = require('node:assert/strict');

global.SERVICE = {
    DefaultBackofficeCapabilityDefinitionService: require('../src/service/module/defaultBackofficeCapabilityDefinitionService')
};

const capabilityDataService = require('../src/service/module/defaultBackofficeCapabilityDataService');
const registrationAgent = require('../src/service/module/defaultModuleRegistrationAgentService');

const capabilityData = {
    capability: {
        capabilityId: 'sample-capability',
        displayName: 'Sample Capability',
        category: 'operations',
        icon: 'sample',
        requiredPermissions: ['sample.read'],
        discovery: {
            openApiPath: '/nodics/system/v0/contract/openapi/internal',
            contractVersion: 1
        }
    },
    defaults: {
        icon: 'sample',
        permission: 'sample.read',
        group: { id: 'sample-group', label: 'Sample Group', order: 10 },
        perspectives: ['operations'],
        contexts: ['environment', 'enterprise'],
        featureState: 'ACTIVE',
        presentation: {
            defaultColumns: ['code', 'status'],
            hiddenFields: ['correlationId'],
            forbiddenFields: ['tenant', 'tenantCode']
        }
    },
    navigation: [{
        id: 'sample-records',
        label: 'Sample Records',
        route: '/sample/records',
        moduleName: 'sampleModule',
        schemaName: 'sampleRecord',
        order: 20,
        summary: 'Inspect sample records from backend-owned data.',
        presentation: {
            defaultColumns: ['code', 'name', 'status']
        }
    }]
};

const capability = capabilityDataService.capability(capabilityData);
assert.equal(capability.capabilityId, 'sample-capability');
assert.equal(capability.navigation.length, 1);
assert.equal(capability.navigation[0].id, 'sample-records');
assert.equal(capability.navigation[0].requiredPermissions[0], 'sample.read');
assert.deepEqual(capability.navigation[0].workbenchTarget, {
    moduleName: 'sampleModule',
    schemaName: 'sampleRecord'
});
assert.deepEqual(capability.navigation[0].workbenchPresentation.defaultColumns, ['code', 'name', 'status']);
assert.deepEqual(capability.navigation[0].workbenchPresentation.hiddenFields, ['correlationId']);
assert.deepEqual(capability.navigation[0].workbenchPresentation.forbiddenFields, ['tenant', 'tenantCode']);
assert.deepEqual(capability.discovery, {
    openApiPath: '/nodics/system/v0/contract/openapi/internal',
    contractVersion: 1
});

global.CONFIG = {
    get: key => ({
        backofficeRegistration: {
            enabled: true,
            moduleName: 'backoffice',
            heartbeatIntervalMs: 10000,
            retryIntervalMs: 5000,
            maxModulesPerRegistration: 512,
            connectionName: 'default'
        },
        backofficeCapabilities: {},
        defaultTenant: 'default'
    }[key])
};
global.NODICS = {
    getActiveModules: () => ['unregisteredSampleModule'],
    getRawModule: moduleName => ({
        rawSchema: {},
        metaData: {
            version: '0.0.0',
            nodics: {
                displayName: moduleName,
                runtime: { router: false },
                owns: []
            }
        }
    }),
    getSelectedEnvironmentName: () => 'local',
    getServerName: () => 'platformServer',
    getNodeName: () => null
};

const agent = Object.assign({}, registrationAgent, {
    _backofficeCapabilityProviders: new Map()
});
assert.equal(agent.buildRegistration('unregisteredSampleModule').backoffice, undefined,
    'capability data must not bypass provider registration and active-module discovery');
agent.registerBackofficeCapabilityProvider('unregisteredSampleModule', {
    getCapability: function () {
        return capabilityDataService.capability(capabilityData);
    }
});
assert.equal(agent.buildRegistration('unregisteredSampleModule').backoffice.capabilityId, 'sample-capability');

console.log('BackOffice capability data service contract validated');
