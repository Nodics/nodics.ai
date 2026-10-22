/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module wasteCarbon/test/carbonPermissionImportAcceptance @description Executes actual Carbon permission releases through the Foundation admitted import dispatch without installing grants. @owner wasteCarbon @layer test */
const test = require('node:test');
const assert = require('node:assert/strict');
const dispatch = require('../../../../nodics.foundation/modules/nData/nImport/import/src/service/process/model/defaultModelImportProcessService');

test('Carbon permission releases execute through identity-authority import dispatch and define no assignments', async t => {
    const before = { CONFIG: global.CONFIG, SERVICE: global.SERVICE, CLASSES: global.CLASSES };
    t.after(() => { for (const [key, value] of Object.entries(before)) if (value === undefined) delete global[key]; else global[key] = value; });
    global.CONFIG = { get: key => key === 'defaultTenant' ? 'authority' : undefined };
    global.CLASSES = { DataImportError: class extends Error {} };
    const observed = [];
    global.SERVICE = { DefaultDataReleaseService: { executeIdentityAuthorityOperation: async (request, operation, service) => {
        assert.equal(request.tenant, 'authority');
        assert.equal(request.header.options.operation, 'ensureReferenceAll');
        observed.push(...operation.models);
        return service.ensureReferenceAll(operation);
    } } };
    const releases = [
        ['../data/init-v001/headers/identity/wasteCarbonPermissionHeader', '../data/init-v001/records/identity/wasteCarbonPermissionData'],
        ['../data/init-v002/headers/identity/wasteCarbonFinalizationPermissionHeader', '../data/init-v002/records/identity/wasteCarbonFinalizationPermissionData'],
    ];
    for (const [headerPath, recordsPath] of releases) {
        delete require.cache[require.resolve(headerPath)];
        const header = Object.values(require(headerPath).profile)[0];
        const models = Object.values(require(recordsPath));
        const result = await dispatch.executeAdmittedSchemaOperation({ tenant: 'authority',
            header: { options: { ...header.options, moduleName: 'profile' } } },
        { tenant: 'authority', authData: { userGroups: ['adminGroup'] }, models }, {
            ensureReferenceAll: async request => ({ result: structuredClone(request.models) }),
        });
        assert.deepEqual(result.result, models);
    }
    assert.deepEqual(observed.map(record => record.code).sort(), [
        'carbon.evidence.record', 'carbon.holdings.finalize', 'carbon.holdings.read', 'carbon.holdings.release',
        'carbon.holdings.reserve', 'carbon.holdings.transfer',
    ]);
    assert.ok(observed.every(record => record.ownerModule === 'wasteCarbon' && record.active === true));
    assert.ok(observed.every(record => !Object.keys(record).some(key => /assign|principal|employee|groupCode/i.test(key))));
});
