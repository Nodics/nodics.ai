/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

const root = path.resolve(__dirname, '../../../..');
const platformPackage = require(path.join(root, 'nodics.platform/package.json'));
const modulePackage = require(path.resolve(__dirname, '../package.json'));
const lifecycle = require(path.resolve(__dirname, '../nodics.js'));
const properties = require(path.resolve(__dirname, '../config/properties.js'));
const operationCatalog = require(path.resolve(__dirname, '../src/service/defaultInstallerOperationCatalogService.js'));
const backofficeProvider = require(path.resolve(__dirname, '../src/service/defaultInstallerBackofficeCapabilityService.js'));
const contract = require(path.join(root, 'nodics.platform/modules/backoffice/src/service/contract/defaultBackofficeContractService.js'));

assert(platformPackage.requiredModules.includes('installer'),
    'nodics.platform must compose the installed-runtime installer capability');

assert.equal(modulePackage.name, 'installer');
assert.equal(modulePackage.nodics.kind, 'capability');
assert.equal(modulePackage.nodics.runtimeModule, true);
assert.equal(modulePackage.nodics.loadableByNodicsModuleLoader, true);
assert.equal(modulePackage.nodics.runtime.router, false,
    'installer APIs must stay disabled until the secured runtime contract is implemented');
assert.equal(modulePackage.nodics.runtime.web, false,
    'installer must not contain Axis frontend or browser source');
assert(modulePackage.nodics.owns.includes('service'));
assert(modulePackage.nodics.owns.includes('test'));
assert(modulePackage.nodics.owns.includes('llm'));

assert.equal(properties.installer.applicationBuilder.standaloneBootstrapRepository, 'Nodics/nodics.installer');
assert.equal(properties.installer.applicationBuilder.standaloneBootstrapCommand,
    'npx github:Nodics/nodics.installer');
assert.equal(properties.installer.applicationBuilder.latestVerifiedStandaloneVersion, '0.7.2');
assert.equal(properties.installer.applicationBuilder.apiOperationsEnabled, false);
assert.deepEqual(properties.installer.applicationBuilder.protectVendorRepositories, [
    'nodics.ai',
    'nodics.axis'
]);

const operations = operationCatalog.listOperations();
assert(operations.some(operation => operation.code === 'workspace-status' && operation.mutating === false));
assert(operations.some(operation => operation.code === 'repair' && operation.mutating === true));
assert.equal(operationCatalog.apiOperationsEnabled(), false);

const capability = backofficeProvider.getCapability();
assert.equal(capability.capabilityId, 'platform-installer');
assert(capability.roles.includes('CONTROL_PLANE_PROVIDER'));
assert(contract.validateBackofficeMetadata(capability),
    'installer must publish valid BackOffice metadata for future Axis discovery');
assert(capability.navigation.every(entry => entry.featureState === 'HIDDEN'),
    'installer navigation must remain hidden until secured operation APIs are implemented');
assert(capability.navigation[0].lifecycleActions.every(action => action.featureState === 'HIDDEN'));

global.SERVICE = {
    DefaultModuleRegistrationAgentService: {
        registrations: [],
        registerBackofficeCapabilityProvider: function (moduleName, provider) {
            this.registrations.push({ moduleName, provider });
        }
    }
};

backofficeProvider.init();
assert.equal(global.SERVICE.DefaultModuleRegistrationAgentService.registrations[0].moduleName, 'installer');
assert.equal(global.SERVICE.DefaultModuleRegistrationAgentService.registrations[0].provider, backofficeProvider);

Promise.resolve()
    .then(() => lifecycle.init())
    .then(result => assert.equal(result, true))
    .then(() => lifecycle.postInit())
    .then(result => assert.equal(result, true))
    .then(() => console.log('Installer platform module contract validated'));
