/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module profile/test/helpers/bootstrapReleaseExecution @description Executes immutable offline Init headers through nImport's real bounded operation capability. @owner profile @layer test */
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const foundation = '../../../../../nodics.foundation/modules/';
const dispatcher = require(foundation + 'nData/nImport/import/src/service/process/model/defaultModelImportProcessService');
module.exports = async function executeBootstrapRelease(schemaName, tenant, work, { startup = false, importDispatch = false } = {}) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'profile-bootstrap-capability-'));
    const prior = { CONFIG: global.CONFIG, NODICS: global.NODICS, SERVICE: global.SERVICE };
    const options = { enabled: true, schemaName, operation: 'ensureBootstrapAll', dataFilePrefix: 'seed' };
    const files = { 'init-v001/headers/seedHeader.js': 'module.exports = ' + JSON.stringify({ profile: { seed: { options } } }) + ';',
        'init-v001/records/seedData.js': 'module.exports = { seed: { code: "seed" } };' };
    try {
        for (const [file, bytes] of Object.entries(files)) {
            fs.mkdirSync(path.dirname(path.join(root, 'data', file)), { recursive: true });
            fs.writeFileSync(path.join(root, 'data', file), bytes);
        }
        fs.writeFileSync(path.join(root, 'data/manifest.json'), JSON.stringify({ contractVersion: 2, module: 'seedOwner', sections: { seed: {
            kind: 'DATA_RELEASE', dataType: 'init', sourceRoot: 'init-v001', version: '1.0.0', destinationRole: 'PLATFORM', owningDomain: 'profile',
            lifecycle: 'REFERENCE', environmentScope: ['ALL'], sensitivity: 'INTERNAL', versioningPolicy: 'NONE', publicationPolicy: 'NONE',
            initialPublicationPolicy: 'NONE', removalPolicy: 'RETAIN', files: Object.fromEntries(Object.entries(files).map(([file, bytes]) =>
                [file, crypto.createHash('sha256').update(bytes).digest('hex')])) } } }));
        const state = require(foundation + 'nData/nImport/import/test/helpers/releaseExecution')({ modules: { seedOwner: { name: 'seedOwner', path: root } }, runtimeRole: 'PLATFORM' });
        const config = global.CONFIG;
        global.CONFIG = { get: key => config.get(key) ?? prior.CONFIG?.get(key) };
        global.NODICS = { ...prior.NODICS, ...global.NODICS };
        global.SERVICE = { ...prior.SERVICE, ...global.SERVICE, DefaultDataReleaseService: state.service };
        const ownerName = 'Default' + schemaName[0].toUpperCase() + schemaName.slice(1) + 'Service';
        let result;
        SERVICE.DefaultImportService.importInitData = async input => {
            input.importRun = { runId: 'offline-run', status: 'COMPLETED', summary: { recordsSucceeded: 1, recordsFailed: 0 } };
            state.service.bindOperationMetadataRun(input);
            const model = { tenant, importRun: input.importRun, header: { options: { ...options, moduleName: 'profile' } } };
            if (importDispatch) result = await work(model);
            else {
                const owner = SERVICE[ownerName], original = owner.ensureBootstrapAll;
                owner.ensureBootstrapAll = async () => { owner.ensureBootstrapAll = original; return work(model); };
                try { result = await dispatcher.executeAdmittedSchemaOperation(model, { tenant }, owner); }
                finally { owner.ensureBootstrapAll = original; }
            }
            return { code: 'SUC_IMP_00000' };
        };
        if (startup) await state.service.installStartupReleases({ tenant });
        else await state.service.execute({ tenant, authData: { isSystem: true }, releaseRequest: { dataType: 'init', releaseCodes: ['seedOwner:seed'] } });
        return result;
    } finally {
        prior.SERVICE.DefaultDataReleaseService = global.SERVICE.DefaultDataReleaseService;
        Object.assign(global, prior);
        fs.rmSync(root, { recursive: true, force: true });
    }
};
