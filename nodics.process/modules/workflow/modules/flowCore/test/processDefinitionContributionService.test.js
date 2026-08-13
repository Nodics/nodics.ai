/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module flowCore/test/ProcessDefinitionContributionService @description Validates fresh install, idempotent replay, upgrade, ownership conflict, and same-version drift rejection. */
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

class NodicsError extends Error { constructor(code, message) { super(message); this.code = code; } }
global.CLASSES = { NodicsError: NodicsError };
global.CONFIG = { get: key => key === 'process' ? { definitionContributions: { maximumDefinitionsPerContribution: 2 } } : undefined };
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-process-contribution-'));
const relative = 'init/data/process/definition.js';
fs.mkdirSync(path.join(root, 'data', path.dirname(relative)), { recursive: true });
fs.writeFileSync(path.join(root, 'data', relative), `module.exports = { definitions: [{
  code: 'cmsPublicationApproval', name: 'CMS Publication Approval', ownerModule: 'cms',
  graph: { nodes: [{ code: 'start', type: 'START' }, { code: 'end', type: 'END' }],
    transitions: [{ code: 'done', source: 'start', target: 'end' }] }
}] };\n`);
global.NODICS = { getRawModule: name => name === 'cms' ? { path: root } : undefined };

const records = new Map();
let published = 0;
let prepared = 0;
global.SERVICE = {
    DefaultProcessGraphValidationService: { assertValidGraph: graph => ({ valid: Boolean(graph) }) },
    DefaultProcessDefinitionLifecycleService: {
        findDefinition: async (request, code) => records.get(code),
        createDefinition: async request => { records.set(request.processDefinition.code,
            Object.assign({}, request.processDefinition, { status: 'DRAFT', currentVersion: 0 })); },
        prepareNextDraft: async request => { prepared++; records.get(request.definitionCode).status = 'DRAFT'; },
        updateDraft: async request => { Object.assign(records.get(request.definitionCode), request.processDefinition); },
        publishDraft: async request => { let record = records.get(request.definitionCode); record.status = 'PUBLISHED';
            record.currentVersion++; published++; return { data: { code: record.code, version: record.currentVersion } }; }
    }
};
const service = require('../src/service/definition/defaultProcessDefinitionContributionService');
const contribution = version => ({ moduleName: 'cms', releaseCode: 'cms:cmsPublicationApproval', version: version,
    checksum: version === '1.0.0' ? 'a'.repeat(64) : 'b'.repeat(64), owningDomain: 'cms', destinationRole: 'PROCESS',
    installer: 'PROCESS_DEFINITION', declaredFiles: [relative] });

(async () => {
    let installed = await service.installContribution({ contribution: contribution('1.0.0'), tenant: 'default' });
    assert.strictEqual(installed.data.definitions[0].version, 1);
    assert.strictEqual(published, 1);
    let replay = await service.installContribution({ contribution: contribution('1.0.0'), tenant: 'default' });
    assert.strictEqual(replay.data.definitions[0].status, 'CURRENT');
    assert.strictEqual(published, 1);
    await service.installContribution({ contribution: contribution('1.1.0'), tenant: 'default' });
    assert.strictEqual(prepared, 1);
    assert.strictEqual(published, 2);
    let record = records.get('cmsPublicationApproval');
    record.contributionCode = 'other:definition';
    await assert.rejects(service.installContribution({ contribution: contribution('1.2.0') }), /owned by another contribution/);
    record.contributionCode = 'cms:cmsPublicationApproval';
    record.contributionVersion = '1.1.0';
    record.contributionChecksum = 'c'.repeat(64);
    await assert.rejects(service.installContribution({ contribution: contribution('1.1.0') }), /changed without a version change/);
    console.log('Process definition contribution installation validated');
})().finally(() => fs.rmSync(root, { recursive: true, force: true })).catch(error => { console.error(error); process.exit(1); });
