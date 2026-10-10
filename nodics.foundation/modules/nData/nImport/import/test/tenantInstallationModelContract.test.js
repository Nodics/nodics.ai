/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';

/**
 * @module import/test/tenantInstallationModelContract
 * @description Exercises real model preparation and release receipt lookup for a new tenant with isolated provider doubles; no database connections or persisted writes.
 * @owner import
 * @layer test
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const schemas = require('../src/schemas/schemas').import;
const builder = require('../../../../nDatabase/database/src/service/model/defaultDatabaseModelHandlerService');
const releases = require('../src/service/release/defaultDataReleaseService');

test('new tenant receives installation/history models before release lookup, without broadening the definition catalogue', async () => {
    const tenant = 'new-enterprise', module = { rawSchema: schemas };
    const built = [];
    global.NODICS = { getActiveModules: () => ['import'], isModuleActive: () => true, getModule: () => module };
    global.UTILS = { createModelName: name => name[0].toUpperCase() + name.slice(1) + 'Model' };
    global.SERVICE = {
        DefaultDatabaseConfigurationService: { getTenantDatabase: () => ({ master: { getOptions: () => ({ modelHandler: 'FixtureModelOwner' }) } }) },
        FixtureModelOwner: { prepareDatabaseOptions: async () => {}, retrieveModel: async options => {
            built.push(options.modelName); return { tenant: options.tntCode, name: options.modelName };
        } },
        DefaultDataInstallationService: { get: async request => {
            assert.equal(request.tenant, tenant);
            assert.equal(module.models[tenant].master.DataInstallationModel.tenant, tenant);
            return { code: 'SUC_DBS_00000', result: [] };
        } }
    };
    const owner = { ...builder, registerModelMiddleWare() {} };
    await owner.buildModelsForTenant(tenant);
    assert.deepEqual(built.sort(), ['DataInstallationModel', 'ImportRunModel']);
    assert.equal(module.models[tenant].master.ImportDefinitionModel, undefined);
    assert.deepEqual(await releases.getInstallations(tenant), []);
    await owner.buildModelsForTenant('default');
    assert.ok(module.models.default.master.ImportDefinitionModel);
    assert.notEqual(module.models.default.master.DataInstallationModel, module.models[tenant].master.DataInstallationModel);
});
