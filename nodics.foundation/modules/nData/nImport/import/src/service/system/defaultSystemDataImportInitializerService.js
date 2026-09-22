/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const _ = require('lodash');
const fse = require('fs-extra');
const path = require('path');

/**
 * @module nodics.foundation/modules/nData/nImport/import/src/service/system/defaultSystemDataImportInitializerService
 * @description Implements nData default system data import initializer service business behavior and extension logic.
 * @layer service
 * @owner nData
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
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
        this.LOG.debug('Validating request');
        if (!request.modules || !UTILS.isArray(request.modules) || request.modules.length <= 0) {
            process.error(request, response, new CLASSES.DataImportError('ERR_IMP_00003', 'Please validate request. Mandate property modules not have valid value'));
        } else {
            request.options = request.options || {};
            request.data = {};
            this.initImportRun(request);
            process.nextSuccess(request, response);
        }
    },

    /**

     * Executes generate run id behavior.

     *

     * @returns {*} Method result.

     */

    generateRunId: function () {
        let uniqueCode = (UTILS.generateUniqueCode && typeof UTILS.generateUniqueCode === 'function') ? UTILS.generateUniqueCode() : Date.now() + '_' + Math.floor(Math.random() * 100000);
        return 'import_' + uniqueCode;
    },

    /**

     * Retrieves default tenant information.

     *

     * @returns {*} Method result.

     */

    getDefaultTenant: function () {
        return (typeof CONFIG !== 'undefined' && CONFIG.get && CONFIG.get('defaultTenant')) || 'default';
    },

    /**

     * Initializes import run behavior for the module runtime.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    initImportRun: function (request) {
        request.importRun = request.importRun || {
            runId: this.generateRunId(),
            dataType: request.dataType,
            tenant: request.tenant || this.getDefaultTenant(),
            modules: [].concat(request.modules),
            dataReleases: request.dataReleasePlan || [],
            validationOnly: !!request.options.validateOnly,
            startedAt: new Date().toISOString(),
            finishedAt: null,
            status: 'RUNNING',
            summary: {
                headerFilesDiscovered: 0,
                dataFilesDiscovered: 0,
                enabledHeaders: 0,
                disabledHeaders: 0,
                matchedDataFiles: 0,
                unmatchedDataFiles: 0,
                headersWithoutDataFiles: 0,
                duplicateHeaders: 0,
                validationErrors: 0,
                recordsRead: 0,
                recordsFinalized: 0,
                recordsDispatched: 0,
                recordsSucceeded: 0,
                recordsFailed: 0,
                recordsSkipped: 0
            },
            headers: [],
            duplicateHeaders: [],
            dataFiles: {
                discovered: [],
                matched: [],
                unmatched: []
            },
            validationErrors: [],
            failures: []
        };
    },

    /**

     * Executes finish import run behavior.

     *

     * @param {*} request Method input.

     * @param {*} status Method input.

     * @returns {*} Method result.

     */

    finishImportRun: function (request, status) {
        if (SERVICE.DefaultImportDiagnosticsService && typeof SERVICE.DefaultImportDiagnosticsService.finalizeRun === 'function') {
            SERVICE.DefaultImportDiagnosticsService.finalizeRun(request, status);
            return;
        }
        if (request.importRun) {
            request.importRun.status = status;
            request.importRun.finishedAt = new Date().toISOString();
        }
    },

    /**

     * Updates duplicate header information.

     *

     * @param {*} request Method input.

     * @param {*} headerName Method input.

     * @param {*} owningModule Method input.

     * @param {*} headerFileName Method input.

     * @returns {*} Method result.

     */

    addDuplicateHeader: function (request, headerName, owningModule, headerFileName) {
        if (request.importRun) {
            request.importRun.summary.duplicateHeaders++;
            request.importRun.duplicateHeaders.push({
                headerName: headerName,
                owningModule: owningModule,
                headerFileName: headerFileName
            });
        }
    },

    /**

     * Runs pre-processing logic for pare input path.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    prepareInputPath: function (request, response, process) {
        this.LOG.debug('Preparing input data path');
        request.inputPath = {
            importType: 'system',
            dataType: request.dataType,
        };
        process.nextSuccess(request, response);
    },

    /**

     * Runs pre-processing logic for pare output path.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    prepareOutputPath: function (request, response, process) {
        this.LOG.debug('Preparing output data path');
        let rootPath = NODICS.getServerPath() + '/' + (CONFIG.get('data').dataDirName || 'temp') + '/import/' + request.dataType;
        request.outputPath = {
            rootPath: rootPath,
            dataPath: rootPath + '/data',
            successPath: rootPath + '/success',
            errorPath: rootPath + '/error'
        };
        process.nextSuccess(request, response);
    },

    /**

     * Executes flush output folder behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    flushOutputFolder: function (request, response, process) {
        this.LOG.debug('Cleaning output directory : ' + request.outputPath.dataPath);
        fse.remove(request.outputPath.dataPath).then(() => {
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    /**

     * Retrieves sub modules information.

     *

     * @param {*} moduleName Method input.

     * @returns {*} Method result.

     */

    getSubModules: function (moduleName) {
        let modules = [moduleName];
        let moduleObject = NODICS.getModule(moduleName);
        if (moduleObject.metaData.requiredModules && moduleObject.metaData.requiredModules.length > 0) {
            moduleObject.metaData.requiredModules.forEach(mName => {
                modules = modules.concat(this.getSubModules(mName));
            });
        }
        return modules;
    },
    /**
     * Retrieves header file list information.
     *
     * @param {*} request Method input.
     * @param {*} response Method input.
     * @param {*} process Method input.
     * @returns {*} Method result.
     */
    loadHeaderFileList: function (request, response, process) {
        this.LOG.debug('Loading list of header files from modules to be imported');
        if (request.options && request.options.recursive) {
            let moduleList = [];
            request.modules.forEach(moduleName => {
                moduleList = moduleList.concat(this.getSubModules(moduleName));
            });
            request.modules = moduleList;
            request.importRun.modules = [].concat(moduleList);
        }
        SERVICE.DefaultImportUtilityService.getSystemDataHeaders(request.modules, request.inputPath.dataType, request.dataReleasePlan).then(success => {
            request.data.headerFiles = success;
            if (request.importRun) {
                request.importRun.summary.headerFilesDiscovered = Object.keys(success || {}).length;
            }
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },


    /**


     * Retrieves data file list information.


     *


     * @param {*} request Method input.


     * @param {*} response Method input.


     * @param {*} process Method input.


     * @returns {*} Method result.


     */


    loadDataFileList: function (request, response, process) {
        this.LOG.debug('Loading list of data files from modules to be imported');
        SERVICE.DefaultImportUtilityService.getSystemDataFiles(request.modules, request.inputPath.dataType, request.dataReleasePlan).then(success => {
            request.data.dataFiles = success;
            if (request.importRun) {
                request.importRun.dataFiles.discovered = Object.keys(success || {});
                request.importRun.summary.dataFilesDiscovered = request.importRun.dataFiles.discovered.length;
            }
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    /**

     * Retrieves file type information.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    resolveFileType: function (request, response, process) {
        this.LOG.debug('Resolving file type');
        if (request.data && request.data.dataFiles) {
            _.each(request.data.dataFiles, (list, name) => {
                let fileType = list[0].substring(list[0].lastIndexOf('.') + 1, list[0].length);
                request.data.dataFiles[name] = {
                    type: fileType,
                    list: list,
                    processedRecords: []
                };
            });
        }
        process.nextSuccess(request, response);
    },

    /**

     * Builds header instances data.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    buildHeaderInstances: function (request, response, process) {
        this.LOG.debug('Generating header instances from header files');
        const definitions = {};
        const sources = {};
        _.each(request.data && request.data.headerFiles, (files, fileName) => {
            definitions[fileName] = {};
            sources[fileName] = {};
            files.forEach(file => {
                delete require.cache[require.resolve(file)];
                const contribution = require(file);
                _.each(contribution, (headers, moduleName) => _.each(headers, (header, headerName) => {
                    const key = moduleName + ':' + headerName;
                    const previous = definitions[fileName][moduleName] && definitions[fileName][moduleName][headerName];
                    for (const field of ['schemaName', 'indexName']) {
                        if (previous && previous.options && previous.options[field] && header.options &&
                            header.options[field] && previous.options[field] !== header.options[field]) {
                            throw new CLASSES.DataImportError('ERR_IMP_00003', 'A layered dataset cannot change its owning target: ' + key);
                        }
                    }
                    if (!sources[fileName][key]) sources[fileName][key] = [];
                    sources[fileName][key].push(this.getHeaderReleaseRoot(file, request));
                }));
                _.mergeWith(definitions[fileName], contribution, (current, incoming) =>
                    Array.isArray(incoming) ? _.cloneDeep(incoming) : undefined);
            });
        });
        _.each(definitions, (headerFile, headerFileName) => {
            _.each(headerFile, (moduleHeaders, moduleName) => {
                _.each(moduleHeaders, (header, sourceHeaderName) => {
                    const headerName = moduleName + ':' + sourceHeaderName;
                    const active = !NODICS.isModuleActive || NODICS.isModuleActive(moduleName);
                    if (header.options && header.options.enabled && active) {
                        request.data.headers = request.data.headers || {};
                        if (request.data.headers[headerName]) this.addDuplicateHeader(request, headerName, moduleName, headerFileName);
                        const instance = _.cloneDeep(header);
                        instance.options.moduleName = moduleName;
                        instance.options.owningModule = instance.options.owningModule || moduleName;
                        instance.options.headerFileName = headerFileName;
                        instance.options.dataFilePrefix = instance.options.dataFilePrefix || sourceHeaderName;
                        if (request.authData && Array.isArray(request.authData.userGroups) && request.authData.userGroups.length) {
                            instance.options.userGroups = request.authData.userGroups;
                        }
                        instance.options.dataHandler = instance.options.indexName ? 'indexerDataHandlerPipeline' : 'schemaDataHandlerPipeline';
                        if (instance.options.finalizeData === undefined) instance.options.finalizeData = true;
                        instance.local = instance.local || {};
                        instance.dataFiles = {};
                        instance.sourceRoots = [...new Set(sources[headerFileName][headerName])];
                        request.data.headers[headerName] = instance;
                        if (request.importRun) {
                            request.importRun.summary.enabledHeaders++;
                            request.importRun.headers.push({ headerName, owningModule: instance.options.owningModule,
                                targetModule: moduleName, schemaName: instance.options.schemaName, indexName: instance.options.indexName,
                                operation: instance.options.operation, dataFilePrefix: instance.options.dataFilePrefix,
                                headerFileName, matchedDataFiles: [] });
                        }
                    } else if (request.importRun) request.importRun.summary.disabledHeaders++;
                });
            });
        });
        process.nextSuccess(request, response);
    },

    /**
     * Resolves the declared release containing a header without broadening selected file membership.
     * Source roots only qualify file ownership; nImport retains immutable-plan filtering.
     * @param {string} file Header source file.
     * @param {Object} request Selected import request.
     * @returns {string} Owning physical release root.
     */
    getHeaderReleaseRoot: function (file, request) {
        const utility = typeof SERVICE !== 'undefined' && SERVICE.DefaultImportUtilityService;
        const roots = [];
        if (utility && typeof utility.modulesForImport === 'function' && request.modules && request.inputPath) {
            for (const owner of utility.modulesForImport(request.modules, request.dataReleasePlan)) {
                roots.push(...utility.releaseRoots(owner, request.inputPath.dataType, request.dataReleasePlan));
            }
        }
        const resolved = path.resolve(file);
        const matching = roots.filter(root => resolved.startsWith(path.resolve(root) + path.sep))
            .sort((left, right) => right.length - left.length);
        if (matching.length) return path.resolve(matching[0]);
        const marker = path.sep + 'headers' + path.sep;
        const index = resolved.lastIndexOf(marker);
        return index >= 0 ? resolved.slice(0, index) : path.dirname(resolved);
    },

    /**

     * Validates prepared import rules.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    validatePreparedImport: function (request) {
        let errors = [];
        let fileTypeProcess = (CONFIG.get('data') && CONFIG.get('data').fileTypeProcess) || {};
        _.each(request.data.headers, (headerObject, headerName) => {
            let options = headerObject.options || {};
            if (!options.schemaName && !options.indexName) {
                errors.push({
                    headerName: headerName,
                    code: 'ERR_IMP_VALIDATE_00001',
                    message: 'Header must define either schemaName or indexName'
                });
            }
            if (!options.operation) {
                errors.push({
                    headerName: headerName,
                    code: 'ERR_IMP_VALIDATE_00002',
                    message: 'Header must define import operation'
                });
            }
            let isLocalModule = !NODICS.isModuleActive || NODICS.isModuleActive(options.moduleName);
            if (options.schemaName && NODICS.getModule && NODICS.getModule(options.moduleName)) {
                let moduleObject = NODICS.getModule(options.moduleName);
                if (moduleObject.rawSchema && !moduleObject.rawSchema[options.schemaName]) {
                    errors.push({
                        headerName: headerName,
                        code: 'ERR_IMP_VALIDATE_00003',
                        message: 'Schema not found for target module',
                        moduleName: options.moduleName,
                        schemaName: options.schemaName
                    });
                }
            }
            if (isLocalModule && options.schemaName && options.operation) {
                let schemaServiceName = 'Default' + options.schemaName.toUpperCaseFirstChar() + 'Service';
                if (!SERVICE[schemaServiceName] || typeof SERVICE[schemaServiceName][options.operation] !== 'function') {
                    errors.push({
                        headerName: headerName,
                        code: 'ERR_IMP_VALIDATE_00005',
                        message: 'Target schema service operation not found',
                        serviceName: schemaServiceName,
                        operation: options.operation
                    });
                }
            }
            if (isLocalModule && options.indexName && options.operation) {
                let indexServiceName = 'Default' + options.indexName.toUpperCaseFirstChar() + 'Service';
                let indexService = SERVICE[indexServiceName] || SERVICE.DefaultSearchService;
                if (!indexService || typeof indexService[options.operation] !== 'function') {
                    errors.push({
                        headerName: headerName,
                        code: 'ERR_IMP_VALIDATE_00006',
                        message: 'Target index service operation not found',
                        serviceName: indexServiceName,
                        operation: options.operation
                    });
                }
            }
            _.each(headerObject.dataFiles, dataFile => {
                if (!fileTypeProcess[dataFile.type]) {
                    errors.push({
                        headerName: headerName,
                        code: 'ERR_IMP_VALIDATE_00004',
                        message: 'File type process not configured',
                        fileType: dataFile.type
                    });
                }
            });
        });
        request.importRun.validationErrors = errors;
        request.importRun.summary.validationErrors = errors.length;
        return errors;
    },

    /**

     * Executes assign data files to header behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    assignDataFilesToHeader: function (request, response, process) {
        this.LOG.debug('Associating data files with corresponding headers');
        if (request.data && request.data.headers) {
            let matchedFiles = {};
            const selectedFiles = Array.isArray(request.dataReleasePlan) && request.dataReleasePlan.length > 0 ? new Set(
                request.dataReleasePlan.filter(release => release.sourceOnly !== true).flatMap(release => {
                    const owner = NODICS.getRawModule(release.moduleName);
                    return (release.declaredFiles || []).map(file => path.resolve(owner.path, 'data', file));
                })) : undefined;
            _.each(request.data.headers, (headerObject, headerName) => {
                let dataPreFix = headerObject.options.dataFilePrefix || headerName;
                _.each(request.data.dataFiles, (object, fileName) => {
                    if (fileName.startsWith(dataPreFix)) {
                        const roots = headerObject.sourceRoots || [];
                        const list = object.list.filter(file => roots.some(root => path.resolve(file).startsWith(root + path.sep)));
                        const selectionFiles = selectedFiles ? list.filter(file => selectedFiles.has(path.resolve(file))) : undefined;
                        if (list.length === 0 || selectionFiles && selectionFiles.length === 0) return;
                        headerObject.dataFiles[fileName] = Object.assign({}, object, { list, selectionFiles, processedRecords: [] });
                        matchedFiles[fileName] = true;
                        if (request.importRun) {
                            let headerRun = request.importRun.headers.find(item => item.headerName === headerName);
                            if (headerRun) {
                                headerRun.matchedDataFiles.push(fileName);
                            }
                        }
                    }
                });
            });
            if (request.importRun) {
                request.importRun.dataFiles.matched = Object.keys(matchedFiles);
                request.importRun.dataFiles.unmatched = Object.keys(request.data.dataFiles || {}).filter(fileName => !matchedFiles[fileName]);
                request.importRun.summary.matchedDataFiles = request.importRun.dataFiles.matched.length;
                request.importRun.summary.unmatchedDataFiles = request.importRun.dataFiles.unmatched.length;
                request.importRun.headers.forEach(headerRun => {
                    headerRun.hasDataFiles = headerRun.matchedDataFiles.length > 0;
                });
                request.importRun.summary.headersWithoutDataFiles = request.importRun.headers.filter(headerRun => !headerRun.hasDataFiles).length;
            }
            if (request.options && request.options.validateOnly) {
                let validationErrors = this.validatePreparedImport(request);
                this.finishImportRun(request, validationErrors.length > 0 ? 'FAILED' : 'VALIDATED');
                if (validationErrors.length > 0) {
                    process.error(request, response, new CLASSES.DataImportError('ERR_IMP_VALIDATE_00000', 'Import validation failed'));
                } else {
                    process.stop(request, response, {
                        code: 'SUC_IMP_VALIDATE_00000',
                        message: 'Import validation completed successfully',
                        validationOnly: true,
                        importRun: request.importRun
                    });
                }
                return;
            }
            delete request.data.headerFiles;
            delete request.data.dataFiles;
            process.nextSuccess(request, response);
        } else {
            this.finishImportRun(request, 'NO_DATA');
            process.stop(request, response, {
                code: 'SUC_IMP_00001',
                message: 'Could not find any data to import for given modules',
                importRun: request.importRun
            });
        }
    }
};
