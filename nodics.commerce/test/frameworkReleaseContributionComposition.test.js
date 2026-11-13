/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module commerce/test/frameworkReleaseContributionComposition @description Qualifies selected cross-group source composition and destination ownership without runtime writes. @layer test @owner nodics.commerce */
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const bindings = require('../../nodics.foundation/modules/nConfig/src/service/defaultConfigurationBindingService');
const discovery = require('../../nodics.foundation/modules/nConfig/src/utils/utils');
const base = require('../../nodics.foundation/modules/nData/nImport/import/src/service/release/defaultDataReleaseService');
const authoring = require('../../nodics.foundation/modules/nDatabase/database/src/service/schema/defaultSchemaAuthoringPolicyService');
const groups = ['nodics.commerce', 'nodics.loyalty', 'nodics.wcms', 'nodics.waste', 'nodics.rulesEngine', 'nodics.platform/modules/axis'];
const expectedCounts = [33, 8, 2, 6, 1, 2];
const properties = groups.map(group => require(path.join(root, group, 'config/properties')));
const compose = values => values.reduce((result, next) => bindings.merge(result, next),
    { data: { dataReleases: structuredClone(require('../../nodics.foundation/modules/nData/nImport/import/config/properties').data.dataReleases) } });
const records = [], owners = {};
for (const group of groups) discovery.collectModuleRecords(path.join(root, group), records, null);
discovery.indexModuleRecords(records, owners);
const schemas = names => Object.fromEntries(names.map(name => [name, { model: true }]));
const modules = {
    profile: { rawSchema: schemas(['permission', 'userGroup', 'enterpriseRole', 'enterprise', 'address']) },
    workflow: { rawSchema: schemas(['processDefinition']) },
    locationType: { rawSchema: schemas(['locationCategory', 'locationCapability', 'locationType']) },
    locationCore: { rawSchema: schemas(['location']) },
    catalog: { rawSchema: schemas(['catalog']) },
    cms: { rawSchema: Object.fromEntries(['cmsSite', 'cmsTypeCode', 'cmsTypeCode2Renderer', 'cmsSlotDefinition',
        'cmsPageTemplate', 'cmsComponent', 'cmsPage', 'cmsPageRoute'].map(name => [name,
        { model: true, backoffice: { lifecycle: 'PUBLISHABLE' } }])) }
};
function fixture(t, host, publication = 'OPERATIONAL') {
    const previous = Object.fromEntries(['CONFIG', 'NODICS', 'SERVICE'].map(key => [key, global[key]]));
    t.after(() => { for (const [key, value] of Object.entries(previous)) {
        if (value === undefined) delete global[key]; else global[key] = value;
    } });
    const config = compose(properties);
    config.runtimeRole = { code: 'DESCRIPTIVE_ONLY', publication };
    config.environment = { class: 'LOCAL' };
    const active = host === 'location' ? ['locationCore', 'locationType'] : host === 'cms' ? ['cms', 'catalog'] : [host];
    global.CONFIG = { get: key => config[key] };
    global.NODICS = { getActiveModules: () => active.slice(), getModule: name => active.includes(name) ? modules[name] : undefined,
        getRawModule: name => owners[name], getSelectedEnvironmentName: () => 'isolated', getServerName: () => 'selected' };
    global.SERVICE = { DefaultSchemaAuthoringPolicyService: authoring,
        DefaultDataInstallationService: { get() { throw Error('receipt read forbidden'); } },
        DefaultImportService: { importInitData() { throw Error('import forbidden'); } } };
    if (host === 'workflow') {
        config.data.dataReleases.installers.PROCESS_DEFINITION = 'SelectedProcessInstaller';
        SERVICE.SelectedProcessInstaller = {
            preflightContribution() { throw Error('installer preflight forbidden'); },
            installContribution() { throw Error('installer execution forbidden'); }
        };
    }
    const service = { ...base, error: (code, message) => Object.assign(new Error(message), { code }) };
    const selected = config.data.dataReleases.contributions.flatMap(entry => entry.sections.map(sectionCode => {
        const manifest = require(path.join(owners[entry.moduleName].path, 'data/manifest.json'));
        const release = service.discoverManifestRelease({ moduleName: entry.moduleName, sectionCode }, manifest.sections[sectionCode].dataType);
        return { release, manifest: manifest.sections[sectionCode] };
    }));
    return { config, service, selected, active };
}

test('all six ordinary contributions compose without positional replacement or duplicated owners', () => {
    const before = JSON.stringify(properties);
    properties.forEach((value, index) => {
        assert.equal(value.data.dataReleases.runtimeRoleProfiles, undefined);
        const list = compose([value]).data.dataReleases.contributions;
        assert.equal(list.reduce((sum, item) => sum + item.sections.length, 0), expectedCounts[index]);
    });
    for (const values of [properties, properties.slice().reverse()]) {
        const list = compose(values).data.dataReleases.contributions;
        assert.equal(list.length, 21);
        assert.equal(new Set(list.map(item => item.moduleName)).size, 21);
        assert.equal(list.reduce((sum, item) => sum + item.sections.length, 0), 52);
    }
    assert.equal(JSON.stringify(properties), before);
});

for (const host of ['profile', 'workflow', 'location', 'cms', 'unrelated']) {
    test('manifest targets admit only the selected ' + host + ' destination', t => {
        const f = fixture(t, host, host === 'cms' ? 'STAGED' : 'OPERATIONAL');
        let admitted = 0;
        for (const { release, manifest } of f.selected) {
            assert.equal(release.invalidManifest, undefined);
            assert.equal(release.selectionPolicy, manifest.selectionPolicy || 'DEFAULT');
            assert.equal(release.version, manifest.version);
            const targets = release.installer ? [] : f.service.releaseDestinationTargets(release);
            assert(release.installer || targets.length, release.releaseCode + ' needs real targets');
            const expected = release.installer ? host === 'workflow' :
                targets.every(target => f.active.includes(target.moduleName));
            assert.equal(f.service.isDestinationCompatible(release), expected, release.releaseCode);
            if (expected) { admitted++; assert.equal(f.service.validateDestination(release), true); }
            else assert.throws(() => f.service.validateDestination(release), /destination|Staged/);
            if (!f.active.includes(release.moduleName))
                assert.notEqual(f.service.discoveryOwners().find(item => item.moduleName === release.moduleName).active, true);
        }
        assert.equal(admitted, { profile: 41, workflow: 8, location: 1, cms: 2, unrelated: 0 }[host]);
    });
}

test('CMS Online cannot admit either Axis release or inherit the retired empty role allowance', t => {
    const f = fixture(t, 'cms', 'ONLINE');
    assert.equal(f.config.data.dataReleases.allowedDestinationRoles, undefined);
    for (const { release } of f.selected.filter(item => item.release.moduleName === 'axis')) {
        assert.equal(f.service.isDestinationCompatible(release), false);
        assert.throws(() => f.service.validateDestination(release), /Staged/);
    }
});

test('source discovery does not select inactive releases for startup or enable owner modules', async t => {
    const f = fixture(t, 'profile');
    const before = f.active.slice();
    assert.deepEqual(await f.service.installStartupReleases({ tenant: 'default', modules: before }),
        { skipped: true, reason: 'NO_INIT_RELEASES' });
    assert.deepEqual(f.active, before);
    assert.deepEqual(f.config.data.dataReleases.initializationProfiles, {});
    assert.deepEqual(f.config.data.dataReleases.types.init.startupProfileSelections, []);
});

test('customer keyed selection can narrow Axis exactly and remove an inherited source without positional tails', t => {
    const f = fixture(t, 'profile');
    const selected = bindings.merge(f.config, { data: { dataReleases: { contributions: {
        $config: 'keyed', key: 'moduleName', entries: [{ moduleName: 'axis',
            sections: { $config: 'replace', value: ['axisBaseline'] } }], remove: ['product']
    } } } });
    assert.deepEqual(selected.data.dataReleases.contributions.find(item => item.moduleName === 'axis').sections, ['axisBaseline']);
    assert.equal(selected.data.dataReleases.contributions.some(item => item.moduleName === 'product'), false);
    assert.deepEqual(f.config.data.dataReleases.contributions.find(item => item.moduleName === 'axis').sections, ['axisBaseline', 'core-v001']);
});

test('offline property projection resolves the same bounded list through actual nConfig bindings', () => {
    const layers = properties.map((value, index) => ({ properties: value,
        directory: path.join(root, groups[index], 'config') }));
    const projected = bindings.resolveLayeredProperty(layers, ['data', 'dataReleases', 'contributions'], {});
    assert.deepEqual(projected, compose(properties).data.dataReleases.contributions);
    assert(projected.every(entry => Array.isArray(entry.sections)));
});
