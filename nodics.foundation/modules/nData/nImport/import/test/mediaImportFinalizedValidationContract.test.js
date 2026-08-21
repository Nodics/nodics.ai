/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module import/test/mediaImportFinalizedValidationContract
 * @description Validates finalized nImport media validation reports and validate-only failure projection.
 * @layer test
 * @owner import
 * @override Extend when media import finalization changes validation report shape or pipeline handoff behavior.
 */
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const importService = require('../src/service/import/defaultImportService');

/**
 * Validates finalized media import validation reports and validate-only import failure projection.
 *
 * @returns {Promise<void>} Resolves after all finalized validation assertions pass.
 */
async function main() {
    let workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-media-import-validation-'));
    let dataPath = path.join(workspace, 'data');
    fs.mkdirSync(dataPath, {
        recursive: true
    });
    fs.writeFileSync(path.join(dataPath, 'tenantData.js'), [
        'module.exports = {',
        '  header: {',
        '    options: {',
        '      owningModule: "profile",',
        '      moduleName: "profile",',
        '      schemaName: "tenant",',
        '      operation: "saveAll",',
        '      genericSchemaImport: true',
        '    },',
        '    query: {',
        '      code: "$code"',
        '    }',
        '  },',
        '  models: {',
        '    goodTenant: { code: "goodTenant", active: true },',
        '    missingCodeTenant: { active: true },',
        '    unmappedTenant: { code: "unmappedTenant", active: true, externalOnly: true }',
        '  }',
        '};'
    ].join('\n'));

    global.NODICS = {
        /**
         * Provides the raw profile tenant schema used by generic schema-backed media import validation.
         *
         * @param {string} moduleName Module name requested by the import validation service.
         * @returns {Object|undefined} Synthetic module metadata for profile, otherwise undefined.
         */
        getModule: function (moduleName) {
            if (moduleName !== 'profile') return undefined;
            return {
                rawSchema: {
                    tenant: {
                        definition: {
                            code: { type: 'string', required: true },
                            active: { type: 'boolean' }
                        }
                    }
                }
            };
        }
    };

    let request = {
        tenant: 'default',
        outputPath: {
            dataPath: dataPath
        },
        importRun: {
            summary: {},
            validationErrors: []
        }
    };

    let errors = importService.validatePreparedFinalizedImport(request);

    assert.strictEqual(errors.length, 2);
    assert.strictEqual(errors[0].code, 'ERR_IMP_VALIDATE_00008');
    assert.strictEqual(errors[0].metadata.recordKey, 'missingCodeTenant');
    assert.strictEqual(errors[0].metadata.propertyName, 'code');
    assert.strictEqual(errors[0].metadata.rowNumber, 2);
    assert.ok(errors[0].message.includes('required property "code"'));
    assert.strictEqual(errors[1].code, 'ERR_IMP_VALIDATE_00009');
    assert.strictEqual(errors[1].metadata.recordKey, 'unmappedTenant');
    assert.strictEqual(errors[1].metadata.propertyName, 'externalOnly');
    assert.ok(errors[1].message.includes('not defined on selected schema "tenant"'));
    assert.ok(!errors[0].message.includes('DefaultModelQueryBuilderPipelineService'));
    assert.strictEqual(request.importRun.summary.validationErrors, 2);
    let report = importService.createPreparedFinalizedValidationReport(request, errors);
    assert.strictEqual(report.totalRecords, 3);
    assert.strictEqual(report.validRecords, 1);
    assert.strictEqual(report.invalidRecords, 2);
    assert.strictEqual(report.rows[0].status, 'VALID');
    assert.strictEqual(report.rows[1].status, 'INVALID');
    assert.strictEqual(report.rows[1].rowNumber, 2);
    assert.ok(report.rows[1].howToFix.includes('Add a valid value for "code"'));
    assert.strictEqual(report.rows[2].status, 'INVALID');
    assert.ok(report.rows[2].howToFix.includes('Remove "externalOnly"'));

    let service = Object.assign({}, importService);
    global.SERVICE = {
        DefaultMediaImportDefinitionService: {
            /**
             * Prepares a deterministic media import workspace for validate-only import assertions.
             *
             * @param {Object} mediaRequest Import request mutated with a synthetic import run.
             * @returns {Promise<Object>} Prepared import workspace paths and source metadata.
             */
            prepare: function (mediaRequest) {
                mediaRequest.importRun = {
                    runId: 'media_validation_run',
                    summary: {},
                    failures: [],
                    validationErrors: []
                };
                return Promise.resolve({
                    inputPath: { rootPath: workspace },
                    outputPath: {
                        rootPath: workspace,
                        dataPath: dataPath,
                        successPath: path.join(workspace, 'success'),
                        errorPath: path.join(workspace, 'error')
                    },
                    mediaSource: { mediaCode: 'tenant-upload' },
                    importDefinition: { code: 'tenantCsv' },
                    stagedFile: { fileName: 'tenantData.csv' }
                });
            }
        },
        DefaultPipelineService: {
            /**
             * Captures the pipeline selected by validate-only media import execution.
             *
             * @param {string} pipelineName Pipeline name requested by the import service.
             * @returns {Promise<Object>} Synthetic pipeline start response.
             */
            start: function (pipelineName) {
                assert.strictEqual(pipelineName, 'localDataImportInitializerPipeline');
                return Promise.resolve({ code: 'SUC_IMP_READY' });
            }
        }
    };

    let mediaValidation = await service.importMediaData({
        tenant: 'default',
        mediaCode: 'tenant-upload',
        definitionCode: 'tenantCsv',
        options: { validateOnly: true }
    });

    assert.strictEqual(mediaValidation.validationOnly, true);
    assert.strictEqual(mediaValidation.validationPassed, false);
    assert.strictEqual(mediaValidation.validationErrorCount, 2);
    assert.strictEqual(mediaValidation.validationErrors[0].recordKey, 'missingCodeTenant');
    assert.strictEqual(mediaValidation.validationReport.totalRecords, 3);
    assert.strictEqual(mediaValidation.validationReport.invalidRecords, 2);
    assert.strictEqual(mediaValidation.validationReport.rows[1].status, 'INVALID');
    assert.strictEqual(mediaValidation.importRun.status, 'FAILED');
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
