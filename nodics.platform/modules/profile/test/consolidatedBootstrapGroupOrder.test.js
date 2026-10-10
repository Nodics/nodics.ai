/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module profile/test/consolidatedBootstrapGroupOrder @description Exercises consolidated Init header ordering against Profile parent-group governance on an empty installation. @layer test @owner profile */
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const manifest = require('../data/manifest.json');
const initializer = require('../../../../nodics.foundation/modules/nData/nImport/import/src/service/system/defaultSystemDataImportInitializerService');
const governance = require('../src/service/group/defaultUserGroupGovernanceService');

test('consolidated Init has one complete group dataset with bootstrap parents and every preserved grant', t => {
    const previous = { NODICS: global.NODICS, CLASSES: global.CLASSES, UTILS: global.UTILS };
    t.after(() => Object.entries(previous).forEach(([key, value]) => {
        if (value === undefined) delete global[key];
        else global[key] = value;
    }));
    global.NODICS = { isModuleActive: () => true };
    global.CLASSES = { NodicsError: Error };
    global.UTILS = { isObject: value => value !== null && typeof value === 'object' };
    const root = path.resolve(__dirname, '../data');
    const headerFiles = {};
    for (const relative of Object.keys(manifest.sections['init-v001'].files).sort()) {
        if (!relative.includes('/headers/groups/')) continue;
        headerFiles[path.basename(relative)] = [path.join(root, relative)];
    }
    const request = { data: { headerFiles } };
    const service = Object.assign({}, initializer, { LOG: { debug() {} } });
    let advanced = false;
    service.buildHeaderInstances(request, {}, { nextSuccess() { advanced = true; } });
    assert.equal(advanced, true);
    const headers = Object.values(request.data.headers);
    assert.equal(headers[0].options.dataFilePrefix, 'defaultBootstrapUserGroupsData');
    assert.equal(headers.length, 1);
    const installed = new Map();
    for (const header of headers) {
        const records = Object.values(require(path.join(root, 'init-v001/records/groups', header.options.dataFilePrefix)));
        governance.validateGraph(records, [...installed.values()]);
        records.forEach(record => installed.set(record.code, record));
    }
    assert.equal(installed.size, 27);
    assert(installed.get('runtimeConfigAdminUserGroup').permissions.includes('copilot.configuration.admin'));
    assert(!installed.get('employeeUserGroup').permissions.includes('copilot.configuration.admin'));
    for (const name of ['runtimeConfigurationUserGroupsData', 'runtimeConfigurationUpdateUserGroupsData', 'serviceAccountCircaUserGroupsData', 'backofficeCircaUserGroupsData']) {
        for (const record of Object.values(require(path.join(root, 'init-v001/records/groups', name)))) {
            const actual = installed.get(record.code);
            assert.deepEqual(
                { ...actual, permissions: [...(actual.permissions || [])].sort() },
                { ...record, permissions: [...(record.permissions || [])].sort() }
            );
        }
    }
});
