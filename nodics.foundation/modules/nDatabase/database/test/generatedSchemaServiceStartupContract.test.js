/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module database/test/GeneratedSchemaServiceStartupContractTest
 * @description Verifies startup attaches generated schema service delegates
 * after rebuilding runtime models, while preserving same-name custom services.
 * @layer test
 * @owner nDatabase
 */

const assert = require('assert');

if (!String.prototype.toUpperCaseFirstChar) {
    String.prototype.toUpperCaseFirstChar = function () {
        return this.charAt(0).toUpperCase() + this.slice(1);
    };
}

global.CLASSES = {
    NodicsError: class NodicsError extends Error {
        constructor(error, message, code) {
            super(message || (error && error.message) || error || code);
            this.code = code || error;
        }
    }
};

global.UTILS = {
    createModelName: schemaName => schemaName + 'Model'
};

const profileModule = {
    rawSchema: {
        userGroup: {
            model: true,
            service: { enabled: true }
        },
        employee: {
            model: true,
            service: { enabled: true }
        },
        internalAudit: {
            model: true,
            service: { enabled: false }
        }
    },
    models: {
        default: {
            userGroupModel: { schemaName: 'userGroup' },
            employeeModel: { schemaName: 'employee' }
        }
    }
};

global.NODICS = {
    getActiveModules: () => ['profile'],
    getModule: moduleName => moduleName === 'profile' ? profileModule : undefined,
    isModuleActive: moduleName => moduleName === 'profile',
    getModels: function (moduleName, tenant) {
        assert.strictEqual(moduleName, 'profile');
        return profileModule.models[tenant] || {};
    }
};

const pipelineCalls = [];
global.SERVICE = {
    DefaultEmployeeService: {
        findByAPIKey: function () {
            return Promise.resolve({ code: 'apiAdmin' });
        }
    },
    DefaultPipelineService: {
        start: function (pipelineName, request) {
            pipelineCalls.push({ pipelineName: pipelineName, request: request });
            return Promise.resolve({ result: [] });
        }
    }
};

const modelHandler = require('../src/service/model/defaultDatabaseModelHandlerService');

modelHandler.ensureGeneratedSchemaServices().then(() => {
    assert.strictEqual(typeof global.SERVICE.DefaultUserGroupService.get, 'function');
    assert.strictEqual(typeof global.SERVICE.DefaultUserGroupService.saveAll, 'function');
    assert.strictEqual(typeof global.SERVICE.DefaultUserGroupService.update, 'function');
    assert.strictEqual(global.SERVICE.DefaultInternalAuditService, undefined);
    assert.strictEqual(typeof global.SERVICE.DefaultEmployeeService.get, 'function');
    assert.strictEqual(typeof global.SERVICE.DefaultEmployeeService.findByAPIKey, 'function');
    return global.SERVICE.DefaultUserGroupService.get({
        tenant: 'default',
        query: { code: 'adminGroup' }
    });
}).then(() => {
    assert.strictEqual(pipelineCalls[0].pipelineName, 'modelsGetInitializerPipeline');
    assert.strictEqual(pipelineCalls[0].request.moduleName, 'profile');
    assert.strictEqual(pipelineCalls[0].request.schemaModel.schemaName, 'userGroup');
    console.log('Generated schema service startup contract validated');
}).catch(error => {
    console.error(error);
    process.exit(1);
});
