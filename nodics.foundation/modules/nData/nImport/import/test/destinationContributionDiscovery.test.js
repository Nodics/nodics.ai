/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nImport/test/DestinationContributionDiscovery @description Validates explicit inactive-owner contribution discovery, section selection, destination rejection, and file allowlisting. */
const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-destination-contribution-'));
const owners = {};
function owner(name, sections) {
    const ownerRoot = path.join(root, name);
    fs.mkdirSync(path.join(ownerRoot, 'data'), { recursive: true });
    Object.values(sections).forEach(section => Object.keys(section.payloads).forEach(relative => {
        const target = path.join(ownerRoot, 'data', relative);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, section.payloads[relative]);
    }));
    const manifestSections = {};
    Object.entries(sections).forEach(([code, section]) => {
        manifestSections[code] = Object.assign({
            kind: 'DATA_RELEASE', dataType: 'init', version: '0.0.0', description: code,
            owningDomain: section.owningDomain, lifecycle: 'REFERENCE', destinationRole: section.destinationRole,
            environmentScope: ['LOCAL'], sensitivity: 'INTERNAL', versioningPolicy: 'NONE',
            publicationPolicy: 'NONE', initialPublicationPolicy: 'NONE', removalPolicy: 'RETAIN',
            sourceRoot: 'init-v001',
            files: Object.fromEntries(Object.keys(section.payloads).map(relative => [relative,
                crypto.createHash('sha256').update(fs.readFileSync(path.join(ownerRoot, 'data', relative))).digest('hex')]))
        });
        delete manifestSections[code].payloads;
    });
    fs.writeFileSync(path.join(ownerRoot, 'data', 'manifest.json'), JSON.stringify({
        contractVersion: 2, module: name, sections: manifestSections
    }));
    owners[name] = { name: name, path: ownerRoot, canonicalIdentity: name, metaData: { nodics: { displayName: name } } };
}

owner('activeOwner', { init: { owningDomain: 'active.domain', destinationRole: 'PROCESS', payloads: {
    'init-v001/records/activeData.js': 'module.exports = {};\n', 'init-v001/headers/activeHeader.js': 'module.exports = {};\n'
} } });
owner('inactiveOwner', {
    processContribution: { owningDomain: 'wcms', destinationRole: 'PROCESS', payloads: {
        'init-v001/records/processData.js': 'module.exports = {};\n', 'init-v001/headers/processHeader.js': 'module.exports = {};\n'
    } },
    stagedContribution: { owningDomain: 'platform', destinationRole: 'WCMS_STAGED', payloads: {
        'init-v001/records/stagedData.js': 'module.exports = {};\n', 'init-v001/headers/stagedHeader.js': 'module.exports = {};\n'
    } }
});

let policy = { allowedContractVersions: [2], lifecycleMetadataRequired: true, destinationEnforced: true,
    allowedDestinationRoles: ['PROCESS'], contributions: [{ moduleName: 'inactiveOwner', sections: ['processContribution'] }],
    installers: { PROCESS_DEFINITION: 'DefinitionInstaller' },
    types: { init: { enabled: true, operatorExecution: true } } };
global.CONFIG = { get: key => key === 'data' ? { dataReleases: policy } : key === 'runtimeRole' ? { code: 'PROCESS' } : undefined };
global.NODICS = {
    getActiveModules: () => ['activeOwner'],
    getRawModule: name => owners[name],
    getSelectedEnvironmentName: () => 'local'
};
let installedContribution;
global.SERVICE = { DefinitionInstaller: { installContribution: async request => {
    installedContribution = request.contribution; return { installed: request.contribution.releaseCode };
} } };

const service = require('../src/service/release/defaultDataReleaseService');
(async () => {
try {
    const releases = service.discoverReleases('init');
    assert.deepStrictEqual(releases.map(item => item.releaseCode), ['activeOwner:init', 'inactiveOwner:processContribution']);
    assert.strictEqual(releases.some(item => item.sectionCode === 'stagedContribution'), false,
        'an inactive owner must expose only explicitly selected sections');
    const contribution = releases.find(item => item.releaseCode === 'inactiveOwner:processContribution');
    assert.strictEqual(service.validateDestination(contribution), true);
    assert.throws(() => service.validateDestination(Object.assign({}, contribution, { destinationRole: 'WCMS_STAGED' })),
        /not permitted for runtime destination PROCESS/);
    contribution.installer = 'PROCESS_DEFINITION';
    let installation = await service.invokeImport({ dataReleasePlan: [contribution] }, 'init');
    assert.strictEqual(installedContribution.releaseCode, 'inactiveOwner:processContribution');
    assert.strictEqual(installation.contributions[0].installed, 'inactiveOwner:processContribution');
    policy.contributions = [{ moduleName: 'inactiveOwner', sections: [] }];
    assert.throws(() => service.discoveryOwners(), /selector is invalid/);
    console.log('Destination-qualified contribution discovery validated');
} finally {
    fs.rmSync(root, { recursive: true, force: true });
}
})().catch(error => { console.error(error); process.exit(1); });
