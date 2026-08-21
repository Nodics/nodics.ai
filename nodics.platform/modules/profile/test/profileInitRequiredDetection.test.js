/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');

global.UTILS = {
    isArray: Array.isArray
};
global.CLASSES = {
    NodicsError: function NodicsError(code, message) {
        this.code = code;
        this.message = message;
    }
};

const profileService = require('../src/service/profile/defaultProfileService');

function createService() {
    return Object.assign({}, profileService, {
        LOG: {
            info: function () {}
        }
    });
}

function configureDatabase(collections, enterpriseResponse, employeeResponse) {
    global.SERVICE = {
        DefaultDatabaseConfigurationService: {
            getTenantDatabase: function () {
                return {
                    master: {
                        getCollectionList: function () {
                            return collections;
                        }
                    }
                };
            }
        }
    };
    global.NODICS = {
        getModels: function () {
            return {
                EnterpriseModel: {
                    getItems: function () {
                        return Promise.resolve(enterpriseResponse);
                    }
                },
                EmployeeModel: {
                    getItems: function () {
                        return Promise.resolve(employeeResponse);
                    }
                }
            };
        }
    };
    global.CONFIG = {
        get: function (key) {
            if (key === 'defaultAuthDetail') return { loginId: 'admin' };
            if (key === 'defaultTenant') return 'default';
            if (key === 'profileModuleName') return 'profile';
            return undefined;
        }
    };
}

async function isInitRequired(collections, enterpriseResponse, employeeResponse) {
    configureDatabase(collections, enterpriseResponse, employeeResponse);
    return createService().isInitRequired();
}

(async function () {
    assert.strictEqual(await isInitRequired([], undefined), true);
    assert.strictEqual(await isInitRequired(['EnterpriseModel'], { result: [{ code: 'default' }] }, { result: [{ loginId: 'admin' }] }), false);
    assert.strictEqual(await isInitRequired(['EnterpriseModel'], { result: [] }), true);
    assert.strictEqual(await isInitRequired(['EnterpriseModel'], [{ code: 'default' }], [{ loginId: 'admin' }]), false);
    assert.strictEqual(await isInitRequired(['EnterpriseModel'], [{ code: 'default' }], []), true);
})().catch(error => {
    console.error(error);
    process.exit(1);
});
