/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
const service = require('../src/service/process/model/defaultModelImportProcessService');

function request(overrides) {
    return Object.assign({
        tenant: 'default',
        importRun: {
            contentPackCode: 'kickoffDocumentation',
            contentPackVersion: '0.6.2'
        },
        header: {
            rawSchema: {
                isVersionedEnabled: true
            },
            query: {
                code: '$code'
            },
            options: {
                schemaName: 'cmsComponent',
                userGroups: ['employeeUserGroup']
            }
        }
    }, overrides || {});
}

async function validatesGovernedReleaseUsesNextStoredRevision() {
    let observed;
    const models = [{ code: 'documentation', versionId: 0 }];
    const result = await service.reconcileContentPackVersions(request(), {
        get: function (input) {
            observed = input;
            return Promise.resolve({
                result: [{ code: 'documentation', versionId: 4 }]
            });
        }
    }, models);

    assert.strictEqual(observed.query.code, 'documentation');
    assert.deepStrictEqual(observed.searchOptions, {
        limit: 1,
        sort: { versionId: -1 }
    });
    assert.strictEqual(result[0].versionId, 5);
}

async function validatesFirstInstallPreservesPortableInitialRevision() {
    const models = [{ code: 'new-documentation', versionId: 0 }];
    const result = await service.reconcileContentPackVersions(request(), {
        get: function () {
            return Promise.resolve({ result: [] });
        }
    }, models);
    assert.strictEqual(result[0].versionId, 0);
}

async function validatesOrdinaryImportsRetainStrictCallerRevision() {
    let reads = 0;
    const ordinaryRequest = request({ importRun: { runId: 'ordinary-import' } });
    const models = [{ code: 'ordinary', versionId: 0 }];
    const result = await service.reconcileContentPackVersions(ordinaryRequest, {
        get: function () {
            reads += 1;
            return Promise.resolve({ result: [{ versionId: 7 }] });
        }
    }, models);
    assert.strictEqual(reads, 0);
    assert.strictEqual(result[0].versionId, 0);
}

validatesGovernedReleaseUsesNextStoredRevision()
    .then(validatesFirstInstallPreservesPortableInitialRevision)
    .then(validatesOrdinaryImportsRetainStrictCallerRevision)
    .then(() => {
        console.log('Content-pack version reconciliation validated');
    })
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
