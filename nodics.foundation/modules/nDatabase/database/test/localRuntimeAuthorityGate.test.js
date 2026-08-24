/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module database/test/localRuntimeAuthorityGate
 * @description Verifies inactive modules cannot become local schema, model,
 * router, generated-artifact, or Schema Workbench authorities.
 * @layer test
 * @owner nDatabase
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

class NodicsError extends Error {
    constructor(code, message) {
        if (code instanceof Error) {
            super(code.message);
            this.code = code.code;
        } else {
            super(message || String(code));
            this.code = code;
        }
    }
}

const modules = {
    activeOwner: {
        metaData: { name: 'activeOwner', prefix: 'active' },
        rawSchema: undefined
    },
    inactiveOwner: {
        metaData: { name: 'inactiveOwner', prefix: 'inactive' },
        rawSchema: undefined
    }
};
const activeModules = ['activeOwner'];

global.CLASSES = { NodicsError };
global.CONFIG = {
    get: key => {
        if (key === 'accessPoints') return { readAccessPoint: 1, writeAccessPoint: 2, removeAccessPoint: 3 };
        if (key === 'schemaWorkbench') {
            return {
                discoverModelsByDefault: true,
                defaultModelOperations: ['search', 'read', 'create', 'update', 'delete'],
                defaultMutationMode: 'GENERATED_CRUD'
            };
        }
        if (key === 'servers') return { options: { contextRoot: 'nodics' } };
        if (key === 'cache') return { routerLevelCache: {} };
        return undefined;
    }
};
global.NODICS = {
    getModules: () => modules,
    getModule: moduleName => modules[moduleName],
    isModuleActive: moduleName => activeModules.includes(moduleName),
    getActiveModules: () => activeModules.slice(),
    addRouter: () => {
        throw new Error('Inactive modules must not register generated routers');
    }
};

const schemaHandler = require('../src/service/schema/defaultDatabaseSchemaHandlerService');
schemaHandler.LOG = { debug: () => {}, error: () => {} };

const mergedSchema = {
    default: {
        base: {
            model: false,
            definition: { code: { type: 'string', primary: true } }
        }
    },
    activeOwner: {
        activeThing: {
            super: 'base',
            model: true,
            service: { enabled: true },
            router: { enabled: true },
            accessGroups: { adminGroup: 10 },
            definition: { name: { type: 'string' } }
        }
    },
    inactiveOwner: {
        remoteThing: {
            super: 'base',
            model: true,
            service: { enabled: true },
            router: { enabled: true },
            accessGroups: { adminGroup: 10 },
            definition: { name: { type: 'string' } }
        }
    }
};

(async function () {
    await schemaHandler.buildDatabaseSchema(mergedSchema);
    assert(modules.activeOwner.rawSchema.activeThing, 'Active module must receive effective local rawSchema');
    assert.strictEqual(modules.activeOwner.rawSchema.activeThing.parents.includes('base'), true,
        'Default schema inheritance must remain available for active modules');
    assert.strictEqual(modules.inactiveOwner.rawSchema, undefined,
        'Inactive module must not receive local rawSchema');

    global.SERVICE = {
        DefaultDatabaseConfigurationService: {
            getRawSchema: () => mergedSchema,
            setRawSchema: () => {
                throw new Error('Inactive runtime schema must fail before raw registry mutation');
            }
        },
        DefaultFilesLoaderService: {
            mergeRuntimeSchemaFiles: () => mergedSchema
        }
    };
    await assert.rejects(() => schemaHandler.buildRuntimeSchema({
        moduleName: 'inactiveOwner',
        code: 'lateRemoteThing',
        model: true,
        definition: { code: { type: 'string' } }
    }), /inactiveOwner/);

    let modelBuildCalled = false;
    const modelHandler = require('../src/service/model/defaultDatabaseModelHandlerService');
    modelHandler.buildModels = () => {
        modelBuildCalled = true;
        return Promise.resolve(true);
    };
    await modelHandler.buildModelsForModule('default', 'inactiveOwner');
    assert.strictEqual(modelBuildCalled, false, 'Inactive module must not build local generated models');

    let routerRegistered = false;
    global.NODICS.addRouter = () => { routerRegistered = true; };
    global.UTILS = {
        isRouterEnabled: () => true,
        isBlank: value => !value || Object.keys(value).length === 0
    };
    global.SERVICE.DefaultRouterOperationService = { get: () => { routerRegistered = true; } };
    const routerService = require('../../../nRouter/src/service/router/defaultRouterService');
    routerService.activateRouters({}, modules.inactiveOwner, 'inactiveOwner', {
        default: {
            read: {
                getById: {
                    accessGroups: ['adminGroup'],
                    key: '/schemaName/id/:id',
                    method: 'GET',
                    controller: 'DefaultctrlName',
                    operation: 'get'
                }
            }
        }
    });
    assert.strictEqual(routerRegistered, false, 'Inactive module must not expose generated routers');

    modules.activeOwner.rawSchema = {};
    modules.inactiveOwner.rawSchema = mergedSchema.inactiveOwner;
    routerService.activateRouters({}, modules.activeOwner, 'activeOwner', {
        default: {
            read: {
                getById: {
                    accessGroups: ['adminGroup'],
                    key: '/schemaName/id/:id',
                    method: 'GET',
                    controller: 'DefaultctrlName',
                    operation: 'get'
                }
            }
        }
    });
    assert.strictEqual(routerRegistered, false,
        'Inactive source schemas must not expose cross-target generated routers');

    modules.activeOwner.rawSchema = mergedSchema.activeOwner;

    const workbenchService = require('../src/service/schema/defaultSchemaWorkbenchService');
    global.SERVICE.DefaultSchemaAccessHandlerService = { getAccessPoint: () => 10 };
    assert.throws(() => workbenchService.list({
        moduleName: 'inactiveOwner',
        authData: { userGroups: ['adminGroup'] }
    }), /Module schemas are not available/);

    let generatedArtifacts = 0;
    const utils = require('../../../nConfig/src/utils/utils');
    global.UTILS = Object.assign({}, utils, {
        createObject: () => {
            generatedArtifacts += 1;
            return Promise.resolve(true);
        }
    });
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-runtime-authority-'));
    await utils.schemaWalkThrough({
        currentDir: tempDir,
        type: 'service'
    });
    assert.strictEqual(generatedArtifacts, 1,
        'Generated schema artifacts must be created only for active local modules');

    console.log('Local runtime authority gate validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
