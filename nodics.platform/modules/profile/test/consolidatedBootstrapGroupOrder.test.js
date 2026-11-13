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

test('successor Init orders module-owned group datasets after their permission and parent prerequisites', t => {
    const previous = { NODICS: global.NODICS, CLASSES: global.CLASSES, UTILS: global.UTILS, CONFIG: global.CONFIG, SERVICE: global.SERVICE };
    t.after(() => Object.entries(previous).forEach(([key, value]) => {
        if (value === undefined) delete global[key];
        else global[key] = value;
    }));
    const metadata = require('../../../../nodics.foundation/modules/nTooling/src/service/context/defaultModuleLlmContextUtilsService');
    const modules = Object.fromEntries(metadata.scanModules(path.resolve(__dirname, '../../../..')).map(module => [module.name, module]));
    const releases = require('../../../../nodics.foundation/modules/nData/nImport/import/test/helpers/releaseExecution')({ modules, runtimeRole: 'PLATFORM' }).service;
    const get = CONFIG.get;
    const authSecurity = require('../../../../nodics.foundation/modules/nAuth/config/properties').authSecurity;
    CONFIG.get = key => key === 'bootstrapIdentity' ? { source: 'test', adminPassword: 'test-admin-password-12345',
        servicePassword: 'test-service-password-12345', serviceApiKey: 'test-service-api-key-value-12345678901234567890' }
        : key === 'authSecurity' ? { ...authSecurity, bootstrapIdentity: require('../config/properties').authSecurity.bootstrapIdentity, compatibility: { ...authSecurity.compatibility, allowLocalBootstrapIdentity: true } } : get(key);
    global.NODICS.isModuleActive = () => true;
    global.CLASSES = { NodicsError: Error };
    global.UTILS = { isObject: value => value !== null && typeof value === 'object' };
    const initial = releases.inspectManifest(modules.profile, 'init', path.join(modules.profile.path, 'data/manifest.json'), manifest.sections['init-v001'], 'init-v001', true);
    const ordered = releases.resolvePrerequisiteReleases([initial], 'init').releases;
    const service = Object.assign({}, initializer, { LOG: { debug() {} } });
    const installed = new Map();
    for (const release of ordered.filter(row => row.sectionCode === 'accessGroups')) {
        const root = path.join(modules[release.moduleName].path, 'data');
        const headerFiles = Object.fromEntries(release.declaredFiles.filter(file => file.includes('/headers/')).map(file => [path.basename(file), [path.join(root, file)]]));
        const request = { data: { headerFiles } };
        let advanced = false;
        service.buildHeaderInstances(request, {}, { nextSuccess() { advanced = true; } });
        assert.equal(advanced, true);
        for (const header of Object.values(request.data.headers)) {
            assert.equal(header.options.schemaName, 'userGroup');
            assert.equal(header.options.operation, 'ensureReferenceAll');
            const file = release.declaredFiles.find(file => file.includes('/records/') && path.basename(file) === header.options.dataFilePrefix + '.js');
            assert(file, 'Every selected group header pins its owner records');
            const records = Object.values(require(path.join(root, file)));
            governance.validateGraph(records, [...installed.values()]);
            records.forEach(record => { assert(!installed.has(record.code), 'One source owner per group'); installed.set(record.code, record); });
        }
    }
    assert.deepEqual(new Set(ordered.filter(row => row.sectionCode === 'accessGroups').map(row => row.moduleName)),
        new Set(['profile', 'config']));
    const permissionCodes = new Set();
    for (const release of ordered.filter(row => /permission/i.test(row.sectionCode))) {
        for (const file of release.declaredFiles.filter(file => file.includes('/records/'))) {
            const records = require(path.join(modules[release.moduleName].path, 'data', file));
            Object.values(records).forEach(record => permissionCodes.add(record.code));
        }
    }
    const serviceAccount = Object.values(require('../data/init-v001/records/identityBootstrap/preservedServiceEmployeeData'))[0];
    for (const scope of serviceAccount.apiKeyScopes) assert(permissionCodes.has(scope), scope);
    for (const group of installed.values()) {
        for (const permission of group.permissions || []) {
            assert(permission === '*' || permissionCodes.has(permission), group.code + ' requires ' + permission);
        }
    }
    assert(installed.get('runtimeConfigAdminUserGroup').permissions.includes('copilot.configuration.admin'));
    assert(!installed.get('employeeUserGroup').permissions.includes('copilot.configuration.admin'));
    assert.equal(initial.version, '0.0.1');
    assert.equal(initial.sourceRoot, 'init-v001');
    assert(!initial.declaredFiles.some(file => file.includes('/records/groups/')));
});
