/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');

/**
 * @module nRouter/test/openapiContractGeneration
 * @description Verifies that OpenAPI generation follows effective layered schema and router definitions, excludes inactive capabilities, preserves security metadata, rejects conflicting routes and invalid references, and emits accurate request and response contracts.
 * @layer test
 * @owner nRouter
 * @override Project modules may add focused fixtures for their layered router parameters, request bodies, responses, and schema metadata without changing this framework contract test.
 */

global.CONFIG = {
    get: function (name) {
        if (name === 'servers') return { options: { contextRoot: 'nodics' } };
        if (name === 'cache') return { routerLevelCache: {} };
        return undefined;
    }
};

global.UTILS = {
    isRouterEnabled: function () { return true; }
};

const modules = {
    sample: {
        metaData: { prefix: 'sample' },
        rawSchema: {
            item: {
                model: true,
                service: { enabled: true },
                router: { enabled: true },
                definition: {
                    code: { type: 'string', required: true, minLength: 2, example: 'ITEM-1' },
                    active: { type: 'bool', default: true },
                    tags: { type: 'array', items: { type: 'string' } }
                }
            },
            disabled: {
                model: true,
                service: { enabled: true },
                router: { enabled: false },
                definition: { code: { type: 'string' } }
            }
        }
    },
    other: {
        metaData: { prefix: 'other' },
        rawSchema: {}
    }
};

global.NODICS = {
    getModules: function () { return modules; },
    getServerName: function () { return 'sampleServer'; },
    getServerRootName: function () { return 'sampleServer'; },
    getEnvironmentName: function () { return 'sampleEnvironment'; },
    getNodeName: function () { return undefined; },
    getActiveModules: function () { return ['sample', 'other']; }
};

const generator = require('../src/service/tooling/defaultOpenapiContractGeneratorService');
const defaultOptions = generator.createOptions([]);
assert.strictEqual(defaultOptions.defaultEnvironment, undefined);
assert.strictEqual(defaultOptions.defaultServer, undefined);
const selectedOptions = generator.createOptions(['--environment=local', '--server=platformServer']);
assert.strictEqual(selectedOptions.defaultEnvironment, 'local');
assert.strictEqual(selectedOptions.defaultServer, 'platformServer');
const authProperties = require('../../nAuth/config/properties');
assert(authProperties.identityGovernance.permissionCatalog.includes('system.contract.openapi.view'));
assert(authProperties.identityGovernance.permissionCatalog.includes('system.contract.swagger.view'));

const defaultRoutes = {
    default: {
        read: {
            getById: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/schemaName/id/:id',
                method: 'GET',
                controller: 'DefaultctrlName',
                operation: 'get'
            }
        },
        write: {
            save: {
                secured: true,
                accessGroups: ['userGroup'],
                apiExposure: { category: 'sampleAuthoring' },
                key: '/schemaName',
                method: 'PUT',
                controller: 'DefaultctrlName',
                operation: 'save'
            },
            saveAll: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/schemaName/all',
                method: 'PUT',
                controller: 'DefaultctrlName',
                operation: 'saveAll'
            }
        }
    },
    common: {
        targetedAdministration: {
            options: { targetModules: ['sample'] },
            reconcile: {
                secured: true,
                accessGroups: ['userGroup'],
                apiExposure: 'sampleAdministration',
                key: '/administration/reconcile',
                method: 'POST',
                controller: 'DefaultAdministrationController',
                operation: 'reconcile'
            }
        }
    },
    sample: {
        contracts: {
            contract: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'sample.contract.view',
                permissionConfig: 'sample.contract.routePermission',
                authTokenTypes: ['service'],
                key: '/contract',
                method: 'POST',
                controller: 'DefaultContractController',
                operation: 'createContract',
                parameters: {
                    dryRun: { in: 'query', schema: { type: 'boolean' } }
                },
                help: { body: { name: 'Contract name', enabled: true } }
            },
            live: {
                secured: false,
                publicProbe: true,
                accessGroups: ['userGroup'],
                key: '/health/live',
                method: 'GET',
                controller: 'DefaultHealthController',
                operation: 'getLiveness'
            },
            apiDocumentation: {
                secured: false,
                publicAccess: true,
                accessGroups: ['userGroup'],
                apiExposure: 'openApiContract',
                key: '/contract/openapi',
                method: 'GET',
                controller: 'DefaultApiContractController',
                operation: 'getOpenApiContract'
            },
            inactive: {
                secured: true,
                active: false,
                accessGroups: ['userGroup'],
                key: '/inactive',
                method: 'GET',
                controller: 'DefaultContractController',
                operation: 'inactive'
            }
        },
        secondaryContracts: {
            contract: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/secondary-contract',
                method: 'POST',
                controller: 'DefaultContractController',
                operation: 'createSecondaryContract'
            }
        }
    }
};

const document = generator.createDocument({
    rawRouters: defaultRoutes,
    rawSchema: { sample: modules.sample.rawSchema },
    options: { includeRuntimeSchemas: false },
    warnings: []
});

assert.strictEqual(generator.validateDocument(document), true);
assert.strictEqual(document.servers[0].url, '/');
assert(document.paths['/nodics/sample/v0/item/id/{id}'].get);
assert(!document.paths['/nodics/sample/v0/disabled']);
assert(!document.paths['/nodics/sample/v0/inactive']);
assert.strictEqual(document.components.schemas.sample_item.required[0], 'code');
assert.strictEqual(document.components.schemas.sample_item.properties.tags.items.type, 'string');
assert.strictEqual(document.components.schemas.sample_item.properties.code.minLength, 2);
assert.strictEqual(document.paths['/nodics/sample/v0/item'].put.requestBody.content['application/json'].schema.$ref, '#/components/schemas/sample_item');
assert.strictEqual(document.paths['/nodics/sample/v0/item/all'].put.requestBody.content['application/json'].schema.type, 'array');
assert.strictEqual(document.paths['/nodics/sample/v0/item'].put['x-nodics'].source, 'schema-generated');
assert.strictEqual(document.paths['/nodics/sample/v0/item'].put['x-nodics'].moduleName, 'sample');
assert.strictEqual(document.paths['/nodics/sample/v0/item'].put['x-nodics'].schemaName, 'item');
assert.deepStrictEqual(document.paths['/nodics/sample/v0/item'].put['x-nodics'].apiExposure, { category: 'sampleAuthoring' });
assert.strictEqual(document.paths['/nodics/sample/v0/administration/reconcile'].post['x-nodics'].apiExposure, 'sampleAdministration');
assert.strictEqual(document.paths['/nodics/sample/v0/contract/openapi'].get['x-nodics'].apiExposure, 'openApiContract');
assert.strictEqual(document.paths['/nodics/sample/v0/item'].put['x-nodics'].schemaComponentName, 'sample_item');

const configured = document.paths['/nodics/sample/v0/contract'].post;
assert.strictEqual(configured.operationId, 'sample_contracts_contract');
assert.strictEqual(document.paths['/nodics/sample/v0/secondary-contract'].post.operationId,
    'sample_secondarycontracts_contract');
assert(configured.parameters.some(parameter => parameter.name === 'dryRun' && parameter.in === 'query'));
assert.strictEqual(configured['x-nodics'].source, 'module-router');
assert.strictEqual(configured['x-nodics'].moduleName, 'sample');
assert.strictEqual(configured['x-nodics'].routerGroup, 'contracts');
assert.strictEqual(configured['x-nodics'].routerName, 'contract');
assert.strictEqual(configured['x-nodics'].permission, 'sample.contract.view');
assert.strictEqual(configured['x-nodics'].permissionConfig, 'sample.contract.routePermission');
assert.deepStrictEqual(configured['x-nodics'].authTokenTypes, ['service']);
assert.strictEqual(configured.requestBody.content['application/json'].schema.properties.enabled.type, 'boolean');
assert(configured.responses.default.$ref);
assert.strictEqual(document.paths['/nodics/sample/v0/health/live'].get['x-nodics'].publicProbe, true);
assert.strictEqual(document.paths['/nodics/sample/v0/health/live'].get.security, undefined);
assert.strictEqual(document.paths['/nodics/sample/v0/contract/openapi'].get['x-nodics'].publicAccess, true);
assert.strictEqual(document.paths['/nodics/sample/v0/contract/openapi'].get.security, undefined);
assert(document.paths['/nodics/sample/v0/administration/reconcile'].post);
assert.strictEqual(document.paths['/nodics/sample/v0/administration/reconcile'].post['x-nodics'].source, 'common-router');
assert.strictEqual(document.paths['/nodics/sample/v0/administration/reconcile'].post['x-nodics'].moduleName, 'sample');
assert.strictEqual(document.paths['/nodics/sample/v0/administration/reconcile'].post['x-nodics'].routerGroup, 'targetedAdministration');
assert(!document.paths['/nodics/other/v0/administration/reconcile']);

const bodyless = generator.createOperation({
    url: '/sample/:id', method: 'DELETE', routerName: 'bodyless', moduleName: 'sample', active: true
});
assert.strictEqual(bodyless.requestBody, undefined);

assert.throws(() => {
    const paths = {};
    generator.addRoute(paths, { url: '/duplicate', method: 'GET', routerName: 'first', moduleName: 'sample', controller: 'FirstController', 'x-nodics': { controller: 'FirstController' } });
    generator.addRoute(paths, { url: '/duplicate', method: 'GET', routerName: 'second', moduleName: 'sample', controller: 'SecondController', 'x-nodics': { controller: 'SecondController' } });
}, /Duplicate effective route/);

const aliases = {};
generator.addRoute(aliases, { url: '/alias', method: 'GET', routerName: 'first', moduleName: 'sample', controller: 'SharedController', operation: 'shared', 'x-nodics': { moduleName: 'one', controller: 'SharedController', operation: 'shared' } });
generator.addRoute(aliases, { url: '/alias', method: 'GET', routerName: 'second', moduleName: 'sample', controller: 'SharedController', operation: 'shared', 'x-nodics': { moduleName: 'two', controller: 'SharedController', operation: 'shared' } });
assert.strictEqual(aliases['/alias'].get['x-nodics'].duplicateDeclarations.length, 1);

// Identical transport shapes do not make different runtime exposure gates equivalent.
for (const alternate of ['differentCategory', undefined, { category: 'differentCategory' }]) {
    assert.throws(() => {
        const paths = {};
        const shared = { url: '/policy-conflict', method: 'GET', moduleName: 'sample', controller: 'SharedController', operation: 'shared' };
        generator.addRoute(paths, Object.assign({}, shared, { routerName: 'first', 'x-nodics': { apiExposure: 'sampleAuthoring' } }));
        generator.addRoute(paths, Object.assign({}, shared, { routerName: 'second', 'x-nodics': { apiExposure: alternate } }));
    }, /Duplicate effective route/);
}

assert.throws(() => generator.validateDocument({
    openapi: '3.0.3',
    info: { title: 'Invalid', version: '0' },
    paths: {
        '/one': { get: { operationId: 'same', responses: { 200: { description: 'ok' } } } },
        '/two': { get: { operationId: 'same', responses: { 200: { description: 'ok' } } } }
    }
}), /Duplicate operationId/);

assert.throws(() => generator.validateDocument({
    openapi: '3.0.3',
    info: { title: 'Invalid reference', version: '0' },
    paths: { '/one': { get: { operationId: 'one', responses: { 200: { '$ref': '#/components/responses/Missing' } } } } },
    components: { responses: {} }
}), /Unresolved local reference/);

console.log('OpenAPI generation contract validated');


// The OpenAPI child of a selected build must receive the resolver's canonical server.
{
    const fs = require('node:fs');
    const os = require('node:os');
    const path = require('node:path');
    const project = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-openapi-selection-'));
    const beforeEnv = { ...process.env };
    const beforeArgs = process.argv.slice();
    try {
        fs.writeFileSync(path.join(project, 'package.json'), JSON.stringify({ name: 'sample.project', nodics: { kind: 'application' } }));
        for (const environment of ['firstLocal', 'secondLocal']) {
            const server = path.join(project, 'envs', environment, 'platformServer');
            fs.mkdirSync(server, { recursive: true });
            fs.writeFileSync(path.join(server, 'package.json'), JSON.stringify({ name: 'platformServer', nodics: { kind: 'server', runtimeModuleRoots: [] } }));
        }
        process.env.NODICS_HOME = project;
        delete process.env.CUSTOM_HOME;
        process.env.NODICS_FRAMEWORK_ROOT = path.resolve(__dirname, '../../../..');
        for (const [environment, selector] of [['firstLocal', 'platform'], ['secondLocal', 'platformServer']]) {
            process.argv = beforeArgs.filter(value => !/^(E|S|NODE)=/.test(value));
            const options = generator.createOptions(['--env=' + environment, '--server=' + selector]);
            assert.equal(options.defaultEnvironment, environment);
            assert.equal(options.defaultServer, 'platformServer');
            assert(options.MODULE_ROOTS.includes(project));
            assert(process.argv.includes('E=' + environment));
            assert(process.argv.includes('S=platformServer'));
            assert(!process.argv.includes('S=platform'));
        }
        assert.throws(() => generator.createOptions(['--env=firstLocal', '--server=missing']), /Unknown project runtime server/);
        assert.throws(() => generator.createOptions(['--env=missingLocal', '--server=platform']), /Unknown project runtime server/);
    } finally {
        for (const key of Object.keys(process.env)) if (!(key in beforeEnv)) delete process.env[key];
        Object.assign(process.env, beforeEnv);
        process.argv = beforeArgs;
        fs.rmSync(project, { recursive: true, force: true });
    }
}
