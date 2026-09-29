/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.foundation/modules/nDatabase/database/test/schemaIndexServiceContract
 * @description Verifies schema index maintenance fans out across active tenants, master/test channels, modules, and schema-scoped model lookups.
 * @layer test
 * @owner nDatabase
 * @override Database provider modules may override index creation, but schema index maintenance must preserve module, tenant, channel, and schema scoping.
 */

const assert = require('assert');

global.CLASSES = {
    NodicsError: class NodicsError extends Error {
        constructor(code, message) {
            super(message || code);
            this.code = code;
        }
    }
};

global.UTILS = {
    createModelName: function (schemaName) {
        return schemaName + 'Model';
    }
};

const modelRegistry = {
    profile: {
        default: {
            master: {
                tenantModel: { name: 'profile.default.master.tenant' },
                addressModel: { name: 'profile.default.master.address' }
            },
            test: {
                tenantModel: { name: 'profile.default.test.tenant' }
            }
        },
        tenantB: {
            master: {
                tenantModel: { name: 'profile.tenantB.master.tenant' }
            },
            test: {}
        }
    },
    catalog: {
        default: {
            master: {
                productModel: { name: 'catalog.default.master.product' }
            },
            test: {}
        },
        tenantB: {
            master: {},
            test: {
                productModel: { name: 'catalog.tenantB.test.product' }
            }
        }
    }
};

const indexCalls = [];

global.NODICS = {
    isModuleActive: moduleName => ['profile', 'catalog'].includes(moduleName),
    getActiveTenants: function () {
        return ['default', 'tenantB'];
    },
    getModules: function () {
        return {
            profile: {},
            catalog: {}
        };
    },
    getModels: function (moduleName, tenant, channel) {
        return modelRegistry[moduleName] &&
            modelRegistry[moduleName][tenant] &&
            modelRegistry[moduleName][tenant][channel];
    }
};

global.SERVICE = {
    DefaultDatabaseModelHandlerService: {
        createIndexes: function (model) {
            indexCalls.push(model.name);
            return Promise.resolve({ model: model.name, indexed: true });
        }
    }
};

const service = require('../src/service/schema/defaultSchemaIndexService');

(async function run() {
    let result = await service.updateSchemaIndexes('profile', 'tenant');
    assert.deepStrictEqual(indexCalls, [
        'profile.default.master.tenant',
        'profile.default.test.tenant',
        'profile.tenantB.master.tenant'
    ]);
    assert.deepStrictEqual(result.map(item => item.model), indexCalls);

    indexCalls.length = 0;
    result = await service.updateModuleIndexes('profile');
    assert.deepStrictEqual(indexCalls, [
        'profile.default.master.tenant',
        'profile.default.master.address',
        'profile.default.test.tenant',
        'profile.tenantB.master.tenant'
    ]);
    assert.strictEqual(result.length, 4);

    indexCalls.length = 0;
    result = await service.updateModulesIndexes();
    assert.deepStrictEqual(indexCalls, [
        'profile.default.master.tenant',
        'profile.default.master.address',
        'profile.default.test.tenant',
        'profile.tenantB.master.tenant',
        'catalog.default.master.product',
        'catalog.tenantB.test.product'
    ]);
    assert.strictEqual(result.length, 6);

    await assert.rejects(() => service.updateSchemaIndexes('profile', 'missing'), error => {
        assert.strictEqual(error.code, 'ERR_DBS_00000');
        assert(error.message.includes('missing'));
        return true;
    });

    indexCalls.length = 0;
    const inspected = [];
    const identityPolicy = require('../../../nAuth/config/properties').identityGovernance;
    let effectiveIdentityPolicy = identityPolicy;
    global.CONFIG = { get: key => key === 'identityGovernance' ? effectiveIdentityPolicy : undefined };
    SERVICE.DefaultIdentityGovernanceService = require('../../../nAuth/src/service/identity/defaultIdentityGovernanceService');
    SERVICE.DefaultSecuredRequestPipelineService = {
        getEffectiveUserGroupCodes: groups => groups,
        getGrantedPermissions: request => request.authData.permissions || [],
        isPermissionGranted: (permission, granted) => granted.includes(permission)
    };
    SERVICE.DefaultDatabaseModelHandlerService.inspectIndexes = async model => {
        inspected.push(model.name);
        return { indexes: [], recordCount: 0, missingVersionCount: 0 };
    };
    const request = { tenant: 'default', channel: 'test', authData: {
        principalType: 'human', loginId: 'operator', tenant: 'tenantB',
        userGroups: ['adminGroup'], permissions: ['system.schema.view']
    } };
    const evidence = await service.inspectSchemaIndexes(request, 'profile', 'tenant');
    assert.deepStrictEqual(inspected, ['profile.tenantB.master.tenant']);
    assert.strictEqual(evidence.data.tenant, 'tenantB');
    assert.strictEqual(evidence.data.migrationAuthorized, false);
    assert.deepStrictEqual(indexCalls, [], 'inspection must not rebuild any index');
    for (const patch of [{ principalType: 'service' }, { userGroups: [] }, { permissions: [] }, { tenant: '' }]) {
        await assert.rejects(service.inspectSchemaIndexes({ authData: { ...request.authData, ...patch } }, 'profile', 'tenant'),
            { code: 'ERR_DBS_00004' });
    }
    await assert.rejects(service.inspectSchemaIndexes(request, '../profile', 'tenant'), { code: 'ERR_DBS_00003' });
    await assert.rejects(service.inspectSchemaIndexes(request, 'catalog', 'missing'), { code: 'ERR_DBS_00004' });
    await assert.rejects(service.inspectSchemaIndexes(request, 'inactive', 'tenant'), { code: 'ERR_DBS_00004' });
    await assert.rejects(service.inspectSchemaIndexes({ authData: { ...request.authData, tenant: 'inactive' } }, 'profile', 'tenant'),
        { code: 'ERR_DBS_00004' });
    assert.strictEqual(inspected.length, 1, 'denied or unavailable inspections never reach a provider');
    effectiveIdentityPolicy = { administrativeGroups: ['inspectionAdministrators'] };
    await assert.rejects(service.inspectSchemaIndexes(request, 'profile', 'tenant'), { code: 'ERR_DBS_00004' });
    const customRequest = { authData: { ...request.authData, userGroups: ['inspectionAdministrators'] } };
    await service.inspectSchemaIndexes(customRequest, 'profile', 'tenant');
    await assert.rejects(service.inspectSchemaIndexes({ authData: { ...customRequest.authData, permissions: [] } }, 'profile', 'tenant'),
        { code: 'ERR_DBS_00004' });
    for (const policy of [{}, { administrativeGroups: [] }]) {
        effectiveIdentityPolicy = policy;
        await assert.rejects(service.inspectSchemaIndexes(customRequest, 'profile', 'tenant'), { code: 'ERR_DBS_00004' });
    }
    effectiveIdentityPolicy = identityPolicy;
    const routes = require('../src/router/routers').common.schemaIndexes.inspectSchemaIndexes;
    assert.strictEqual(routes.method, 'GET');
    assert.deepStrictEqual(routes.authTokenTypes, ['access']);
    assert.deepStrictEqual(routes.accessGroups, ['adminGroup']);
    const facade = require('../src/facade/schema/defaultSchemaIndexFacade');
    const controller = require('../src/controller/schema/defaultSchemaIndexController');
    SERVICE.DefaultSchemaIndexService = service;
    global.FACADE = { DefaultSchemaIndexFacade: facade };
    const controllerRequest = { ...request, httpRequest: { params: { owner: 'profile', schema: 'tenant' } } };
    assert.strictEqual((await controller.inspectSchemaIndexes(controllerRequest)).data.tenant, 'tenantB');
    await new Promise((resolve, reject) => controller.inspectSchemaIndexes(controllerRequest,
        (error, result) => error ? reject(error) : resolve(assert.strictEqual(result.data.channel, 'master'))));
    const handler = require('../src/service/model/defaultDatabaseModelHandlerService');
    const selectedModel = { dataBase: { getOptions: () => ({ modelHandler: 'SelectedProvider' }) } };
    SERVICE.SelectedProvider = { inspectIndexes: async model => { assert.strictEqual(model, selectedModel); return { recordCount: 7 }; } };
    assert.strictEqual((await handler.inspectIndexes(selectedModel)).recordCount, 7);
    delete SERVICE.SelectedProvider;
    await assert.rejects(handler.inspectIndexes(selectedModel), { code: 'ERR_DBS_00004' });
    console.log('Schema index service contract validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
