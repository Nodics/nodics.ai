/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
const path = require('path');
const repositoryRoot = path.resolve(__dirname, '../../../..');

// @nodics-capability-behavior @nodics-area profile
let configValues = {
    defaultTenant: 'masterTenant',
    defaultErrorCodes: {
        NodicsError: 'ERR_SYS_00000'
    }
};

global.CONFIG = {
    get: function (key) {
        return configValues[key];
    }
};

global.ENUMS = {
    ContactType: {
        EMAIL: { key: 'EMAIL' },
        PHONE: { key: 'PHONE' },
        FAX: { key: 'FAX' },
        PAGER: { key: 'PAGER' }
    }
};

global.SERVICE = {
    DefaultIdentityGovernanceService: {
        getSystemAuthData: function () {
            return { isSystem: true, userGroups: ['serviceAccountUserGroup'], permissions: [] };
        }
    },
    DefaultStatusService: {
        get: function (code) {
            return {
                code: 500,
                message: 'Status message for ' + code
            };
        }
    }
};

global.UTILS = {
    isBlank: function (value) {
        return value === undefined || value === null || value === '' ||
            (Array.isArray(value) && value.length === 0) ||
            (value !== null && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0);
    },
    isObject: function (value) {
        return value !== null && typeof value === 'object' && !Array.isArray(value);
    },
    extractFromError: function (error, message, defaultCode) {
        return {
            code: defaultCode,
            name: error.name,
            responseCode: global.SERVICE.DefaultStatusService.get(defaultCode).code,
            message: message ? error.message + ' : ' + message : error.message,
            stack: error.stack
        };
    },
    extractFromMessage: function (message, defaultCode) {
        return {
            code: defaultCode,
            responseCode: global.SERVICE.DefaultStatusService.get(defaultCode).code,
            message: message
        };
    }
};

global.CLASSES = {
    NodicsError: require(path.join(repositoryRoot, 'nodics.foundation/modules/nCommon/src/lib/nodicsError'))
};

const enterpriseService = require('../src/service/enterprise/defaultEnterpriseService');
const profileSchemas = require('../src/schemas/schemas');
const bootstrapUserGroups = require('../data/init-v001/records/groups/defaultBootstrapUserGroupsData');

(async function () {
    let getCalls = [];
    let enterprise = {
        code: 'electronics',
        active: true,
        tenant: { code: 'electronicsTenant', active: true }
    };
    let service = Object.assign({}, enterpriseService, {
        get: function (request) {
            getCalls.push(request);
            return Promise.resolve({
                result: [enterprise]
            });
        }
    });

    let result = await service.retrieveEnterprise('electronics');
    assert.strictEqual(result, enterprise);
    assert.deepStrictEqual(getCalls, [{
        tenant: 'masterTenant',
        authData: { isSystem: true, userGroups: ['serviceAccountUserGroup'], permissions: [] },
        options: {
            recursive: true
        },
        query: {
            code: 'electronics'
        }
    }]);

    configValues.defaultTenant = undefined;
    getCalls = [];
    result = await service.retrieveEnterprise('healthcare');
    assert.strictEqual(result, enterprise);
    assert.strictEqual(getCalls[0].tenant, 'default');
    assert.deepStrictEqual(getCalls[0].query, { code: 'healthcare' });

    let blankCodeError;
    try {
        await service.retrieveEnterprise('');
    } catch (error) {
        blankCodeError = error;
    }
    assert(blankCodeError instanceof global.CLASSES.NodicsError);
    assert.strictEqual(blankCodeError.code, 'ERR_PRFL_00003');

    let noEnterpriseService = Object.assign({}, enterpriseService, {
        get: function () {
            return Promise.resolve({
                result: []
            });
        }
    });

    let notFoundError;
    try {
        await noEnterpriseService.retrieveEnterprise('missing');
    } catch (error) {
        notFoundError = error;
    }
    assert(notFoundError instanceof global.CLASSES.NodicsError);
    assert.strictEqual(notFoundError.code, 'ERR_PRFL_00003');
    assert(notFoundError.message.includes('missing'));

    let enterpriseSchema = profileSchemas.profile.enterprise;
    assert.strictEqual(enterpriseSchema.definition.tenant.required, true,
        'Enterprise must keep tenant as required scope');
    assert.strictEqual(enterpriseSchema.definition.roleCodes.type, 'array',
        'Enterprise records expose role codes for business association metadata');
    assert.strictEqual(enterpriseSchema.definition.roleCodes.searchOptions.enabled, true,
        'Enterprise role codes support business graph traversal');
    assert.strictEqual(enterpriseSchema.definition.capabilityScopes.type, 'array',
        'Enterprise records expose capability-scoped role metadata');
    assert.strictEqual(enterpriseSchema.indexes.individual.entTenant.name, 'tenant',
        'Enterprise tenant index supports tenant-scoped lookup');
    assert.notStrictEqual(
        enterpriseSchema.indexes.individual.entTenant.options &&
        enterpriseSchema.indexes.individual.entTenant.options.unique,
        true,
        'Tenant must not be unique because one tenant can own multiple enterprises'
    );
    assert(bootstrapUserGroups.record1.permissions.includes('waste.collectionCentre.search'),
        'Default admin group can read Waste collection-centre search for Axis maps');
    assert(bootstrapUserGroups.record3.permissions.includes('waste.collectionCentre.search'),
        'Default customer group can read public Waste collection-centre search');

    const runtimeAuth = { tokenType: 'service', runtimeScope: { instanceCode: 'worker-1' },
        modules: ['profile'], permissions: ['profile.enterprise.search'], entCode: 'electronics', tenant: 'electronicsTenant' };
    const runtimeRequest = { entCode: 'electronics', tenant: 'electronicsTenant', authData: runtimeAuth };
    let runtimeLookups = 0;
    const runtimeService = { ...enterpriseService, retrieveEnterprise: async code => {
        runtimeLookups++; assert.strictEqual(code, 'electronics');
        return { code, active: true, privateRecord: 'excluded', contacts: ['excluded'],
            tenant: { code: 'electronicsTenant', active: true, properties: { deploymentSetting: true }, privateRecord: 'excluded' } };
    } };
    assert.deepStrictEqual(await runtimeService.getRuntimeEnterprise(runtimeRequest), {
        code: 'SUC_FIND_00000', result: [{ code: 'electronics', active: true,
            tenant: { code: 'electronicsTenant', active: true, properties: { deploymentSetting: true } } }]
    });
    for (const rejected of [
        { ...runtimeRequest, entCode: 'another-enterprise' }, { ...runtimeRequest, tenant: 'another-tenant' },
        { ...runtimeRequest, authData: { ...runtimeAuth, permissions: [] } },
        { ...runtimeRequest, authData: { ...runtimeAuth, modules: ['inventory'] } },
        { ...runtimeRequest, authData: { ...runtimeAuth, tokenType: 'access' } }
    ]) await assert.rejects(runtimeService.getRuntimeEnterprise(rejected), error => error.code === 'ERR_AUTH_00003');
    assert.strictEqual(runtimeLookups, 1, 'Denied scope must not perform a privileged record lookup');
    for (const tenant of [{ code: 'another-tenant', active: true }, { code: 'electronicsTenant', active: false }]) {
        runtimeService.retrieveEnterprise = async () => ({ code: 'electronics', active: true, tenant });
        await assert.rejects(runtimeService.getRuntimeEnterprise(runtimeRequest), error => error.code === 'ERR_AUTH_00003');
    }
    console.log('Profile enterprise service capability behavior validated');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
