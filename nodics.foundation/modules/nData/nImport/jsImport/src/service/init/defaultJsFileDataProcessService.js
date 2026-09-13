/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const _ = require('lodash');

/**
 * @module nodics.foundation/modules/nData/nImport/jsImport/src/service/init/defaultJsFileDataProcessService
 * @description Implements nData default js file data process service business behavior and extension logic.
 * @layer service
 * @owner nData
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    /**
     * Merges JavaScript import model maps while treating arrays as complete
     * field values. Lodash's default deep merge combines arrays by index, which
     * leaves stale values behind during same-version data refreshes.
     *
     * @param {Object} current Existing merged models.
     * @param {Object} incoming Models exported by the next data file.
     * @returns {Object} Merged models.
     */
    mergeModel: function (current, incoming) {
        return _.mergeWith(current || {}, incoming || {}, function (targetValue, sourceValue) {
            if (Array.isArray(sourceValue)) {
                return _.cloneDeep(sourceValue);
            }
            return undefined;
        });
    },

    /**
     * Adds one JavaScript file export into the accumulated import map.
     *
     * Export keys identify records within the selected logical data-file dataset.
     * The same key in a later layer overrides that record even when its business
     * code changes. Different keys never merge merely because codes match.
     * Persistence identity and deletion remain controlled by the import header.
     *
     * @param {Object} current Existing merged models.
     * @param {Object} incoming Models exported by the next data file.
     * @returns {Object} Merged model map.
     */
    mergeModels: function (current, incoming) {
        if (!_.isPlainObject(incoming) || current !== undefined && !_.isPlainObject(current)) {
            throw new Error('JavaScript import records must be exported as a keyed object');
        }
        const result = current || {};
        Object.keys(incoming).forEach(key => {
            if (['__proto__', 'constructor', 'prototype'].includes(key) || !_.isPlainObject(incoming[key])) {
                throw new Error('Invalid JavaScript import record key or model: ' + key);
            }
            const existing = Object.prototype.hasOwnProperty.call(result, key) ? result[key] : {};
            result[key] = this.mergeModel(existing, incoming[key]);
        });
        return result;
    },

    /**
     * This function is used to initiate entity loader process. If there is any functionalities, required to be executed on entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to finalize entity loader process. If there is any functionalities, required to be executed after entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**

     * Validates request rules.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    validateRequest: function (request, response, process) {
        this.LOG.debug('Validating request to process JS file');
        if (!request.files || !(request.files instanceof Array) || request.files.length <= 0) {
            process.error(request, response, new CLASSES.DataImportError('ERR_DATA_00003', 'Invalid file path to read data'));
        } else if (!request.outputPath || UTILS.isBlank(request.outputPath)) {
            process.error(request, response, new CLASSES.DataImportError('ERR_DATA_00003', 'Invalid output path to write data'));
        } else {
            process.nextSuccess(request, response);
        }
    },

    /**

     * Processes data chunk behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    processDataChunk: function (request, response, process) {
        this.LOG.debug('Starting processing data chunks');
        this.handleFiles(request, response, [].concat(request.files)).then(models => {
            if (Array.isArray(request.selectionFiles)) models = this.selectSourceModels(models, request.selectionFiles);
            let dataHandler = request.header.options.dataHandler;
            if (models && Object.keys(models).length > 0) {
                request.models = [];
                Object.keys(models).forEach(key => {
                    request.models.push(models[key]);
                });
                if (SERVICE.DefaultImportDiagnosticsService) {
                    SERVICE.DefaultImportDiagnosticsService.increment(request, 'recordsRead', request.models.length);
                }
                request.outputPath.version = '0_0';
                SERVICE.DefaultPipelineService.start(dataHandler, request, {}).then(success => {
                    process.nextSuccess(request, response);
                }).catch(error => {
                    process.error(request, response, error);
                });
            } else {
                this.LOG.warn('No data foud to import in files: ' + request.files);
                process.nextSuccess(request, response);
            }
        }).catch(error => {
            process.error(request, response, new CLASSES.DataImportError(error));
        });
    },

    /**
     * Selects only keys authored by the executing delta after lower source fields merge.
     * @param {Object} models Composed keyed records.
     * @param {string[]} files Executing release files, excluding source-only baselines.
     * @returns {Object} Delta records without unrelated baseline replay.
     */
    selectSourceModels: function (models, files) {
        const selected = new Set(files.flatMap(file => Object.keys(require(file))));
        return Object.fromEntries(Object.entries(models).filter(([key]) => selected.has(key)));
    },

    /**

     * Processes files behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} files Method input.

     * @param {*} models Method input.

     * @returns {*} Method result.

     */

    handleFiles: function (request, response, files, models = {}) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (files.length > 0) {
                let file = files.shift();
                delete require.cache[require.resolve(file)];
                models = _self.mergeModels(models, require(file));
                _self.handleFiles(request, response, files, models).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(models);
            }
        });
    }
};
