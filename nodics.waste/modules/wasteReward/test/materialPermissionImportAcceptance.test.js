/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module wasteReward/test/materialPermissionImportAcceptance @description Executes the actual Material-value permission release through Foundation admitted import dispatch without installing grants. @owner wasteReward @layer test */
const test = require('node:test');
const assert = require('node:assert/strict');
const dispatch = require('../../../../nodics.foundation/modules/nData/nImport/import/src/service/process/model/defaultModelImportProcessService');

test('Material-value permission release executes through identity-authority import dispatch and defines no assignments', async t => {
    const before = { CONFIG: global.CONFIG, SERVICE: global.SERVICE, CLASSES: global.CLASSES };
    t.after(() => { for (const [key, value] of Object.entries(before)) if (value === undefined) delete global[key]; else global[key] = value; });
    global.CONFIG = { get: key => key === 'defaultTenant' ? 'authority' : undefined };
    global.CLASSES = { DataImportError: class extends Error {} };
    const headerPath = '../data/init-v001/headers/identity/wasteRewardPermissionHeader';
    delete require.cache[require.resolve(headerPath)];
    const header = Object.values(require(headerPath).profile)[0];
    const models = Object.values(require('../data/init-v001/records/identity/wasteRewardPermissionData'));
    let admitted = false;
    global.SERVICE = { DefaultDataReleaseService: { executeIdentityAuthorityOperation: async (request, operation, service) => {
        admitted = true;
        assert.equal(request.tenant, 'authority');
        assert.equal(request.header.options.operation, 'ensureReferenceAll');
        return service.ensureReferenceAll(operation);
    } } };
    const result = await dispatch.executeAdmittedSchemaOperation({ tenant: 'authority',
        header: { options: { ...header.options, moduleName: 'profile' } } },
    { tenant: 'authority', authData: { userGroups: ['adminGroup'] }, models }, {
        ensureReferenceAll: async request => ({ result: structuredClone(request.models) }),
    });
    assert.equal(admitted, true);
    assert.deepEqual(result.result, models);
    assert.deepEqual(models.map(record => record.code).sort(), [
        'waste.materialValue.assess', 'waste.materialValue.read', 'waste.materialValue.release',
    ]);
    assert.ok(models.every(record => record.ownerModule === 'wasteReward' && record.active === true));
    assert.ok(models.every(record => !Object.keys(record).some(key => /assign|principal|employee|groupCode/i.test(key))));
});
