/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module eWaste/test/fixtures/referenceReleaseHarness @description Exercises Waste reference releases through canonical nImport JS processing with in-memory persistence ports only. @owner eWaste @layer test */
const path = require('node:path');
const foundation = path.resolve(__dirname, '../../../../../../../nodics.foundation/modules');
const importer = path.join(foundation, 'nData/nImport/import');
const createPorts = require(path.join(importer, 'test/helpers/releaseExecution'));
const utility = require(path.join(importer, 'src/service/import/defaultImportUtilityService'));
const initializer = require(path.join(importer, 'src/service/system/defaultSystemDataImportInitializerService'));
const processor = require(path.join(foundation, 'nData/nImport/jsImport/src/service/init/defaultJsFileDataProcessService'));

/** Creates an isolated offline Waste scenario; only supplied owner directories are discovered. */
module.exports = function createReferenceReleaseHarness(modules) {
    const quiet = { debug() {}, info() {}, warn() {}, error() {} };
    const prep = { ...initializer, LOG: quiet };
    const js = { ...processor, LOG: quiet };
    const models = new Map();
    const writes = [];
    const invoke = (object, method, request) => new Promise((resolve, reject) => object[method](request, {}, {
        nextSuccess: resolve, error: (req, res, error) => reject(error), stop: resolve
    }));
    const state = createPorts({ modules, runtimeRole: 'WASTE', onImport: async request => {
        const dataType = request.dataReleasePlan.at(-1).dataType;
        request.inputPath = { dataType };
        request.data = {
            headerFiles: await utility.getSystemDataHeaders(request.modules, dataType, request.dataReleasePlan),
            dataFiles: await utility.getSystemDataFiles(request.modules, dataType, request.dataReleasePlan)
        };
        await invoke(prep, 'buildHeaderInstances', request);
        await invoke(prep, 'resolveFileType', request);
        await invoke(prep, 'assignDataFilesToHeader', request);
        for (const header of Object.values(request.data.headers)) {
            for (const file of Object.values(header.dataFiles)) {
                await invoke(js, 'processDataChunk', { header, files: file.list, selectionFiles: file.selectionFiles, outputPath: {} });
            }
        }
    } });
    global.UTILS = { ...require(path.join(foundation, 'nCommon/src/utils/utils')), isBlank: value => value === undefined || value === null || value === '' };
    global.CLASSES = {
        NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } },
        DataImportError: class extends Error {}
    };
    global.SERVICE.DefaultImportUtilityService = utility;
    global.SERVICE.DefaultPipelineService = { start: async (name, request) => {
        const schema = request.header.options.schemaName;
        for (const record of request.models) {
            if (!record.code) throw Error('Missing reference identity');
            const key = schema + ':' + record.code;
            models.set(key, structuredClone(record));
            writes.push({ schema, code: record.code });
        }
    } };
    state.service = { ...state.service, activeExecutions: new Map() };
    return { ...state, models, writes };
};
