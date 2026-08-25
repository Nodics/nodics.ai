/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const _ = require('lodash');
const fs = require('fs');
const path = require('path');

/**
 * @module nodics.foundation/modules/nData/nImport/import/src/service/import/defaultImportUtilityService
 * @description Implements nData default import utility service business behavior and extension logic.
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

    /** Resolves active modules for legacy imports and explicitly qualified raw owners for governed destination contributions. */
    modulesForImport: function (moduleList, dataReleasePlan) {
        if (Array.isArray(dataReleasePlan) && dataReleasePlan.length > 0) {
            return Array.from(new Set(dataReleasePlan.map(release => release.moduleName)))
                .filter(moduleName => moduleList.includes(moduleName))
                .map(moduleName => NODICS.getRawModule(moduleName))
                .filter(moduleObject => moduleObject && moduleObject.path);
        }
        let modules = [];
        NODICS.getIndexedModules().forEach(moduleObject => {
            if (moduleList.includes(moduleObject.name)) modules.push(moduleObject);
        });
        return modules;
    },

    /**

     * Retrieves system data headers information.

     *

     * @param {*} moduleList Method input.

     * @param {*} dataType Method input.

     * @returns {*} Method result.

     */

    getSystemDataHeaders: function (moduleList, dataType, dataReleasePlan) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                if (!moduleList || moduleList.length == 0) {
                    reject(new CLASSES.DataImportError('ERR_IMP_00003', 'Invalid list of modules to be proccesses'));
                } else {
                    let fileList = {};
                    _self.modulesForImport(moduleList, dataReleasePlan).forEach(moduleObject => {
                        let roots = _self.releaseRoots(moduleObject, dataType, dataReleasePlan);
                        roots.forEach(dataFilesRoot => _self.getHeaderFiles(dataFilesRoot, fileList));
                    });
                    resolve(_self.filterDeclaredReleaseFiles(fileList, dataReleasePlan, 'headers'));
                }
            } catch (error) {
                reject(new CLASSES.DataImportError(error, 'while collecting system data headers'));
            }
        });
    },

    /**

     * Retrieves header files information.

     *

     * @param {*} path Method input.

     * @param {*} fileList Method input.

     * @returns {*} Method result.

     */

    getHeaderFiles: function (path, fileList) {
        if (fs.existsSync(path)) {
            let moduleFiles = {};
            UTILS.getHeaderFiles(path, moduleFiles);
            _.each(moduleFiles, (dataFile, name) => {
                if (fileList[name]) {
                    fileList[name].push(dataFile);
                } else {
                    fileList[name] = [dataFile];
                }
            });
            return fileList;
        }
    },

    /**
     * This function will return list of files from all modules grouped by file name
     * @param {*} moduleList 
     * @param {*} dataType 
     */
    getSystemDataFiles: function (moduleList, dataType, dataReleasePlan) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                if (!moduleList || moduleList.length == 0) {
                    reject(new CLASSES.DataImportError('ERR_IMP_00003', 'Invalid list of modules to be proccesses'));
                } else {
                    let fileList = {};
                    _self.modulesForImport(moduleList, dataReleasePlan).forEach(moduleObject => {
                        let roots = _self.releaseRoots(moduleObject, dataType, dataReleasePlan);
                        roots.forEach(dataFilesRoot => _self.getDataFiles(dataFilesRoot, fileList));
                    });
                    resolve(_self.filterDeclaredReleaseFiles(fileList, dataReleasePlan, 'data'));
                }
            } catch (error) {
                reject(new CLASSES.DataImportError(error, 'while collecting system data files'));
            }
        });
    },

    /**
     * Restricts governed release execution to files covered by the selected immutable manifest sections.
     * Calls outside the data-release lifecycle retain the established unfiltered behavior.
     */
    filterDeclaredReleaseFiles: function (fileList, dataReleasePlan, folderName) {
        if (!Array.isArray(dataReleasePlan) || dataReleasePlan.length === 0) return fileList;
        let byPath = {};
        _.each(fileList, (paths, name) => {
            [].concat(paths || []).forEach(file => {
                byPath[path.resolve(file)] = { name: name, file: file };
            });
        });
        let filtered = {};
        let used = new Set();
        dataReleasePlan.forEach(release => {
            let moduleObject = NODICS.getRawModule(release.moduleName);
            if (!moduleObject || !moduleObject.path) return;
            (release.declaredFiles || []).filter(file => file.split('/').includes(folderName)).forEach(file => {
                let resolved = path.resolve(moduleObject.path, 'data', file);
                let entry = byPath[resolved];
                if (!entry || used.has(resolved)) return;
                if (!filtered[entry.name]) filtered[entry.name] = [];
                filtered[entry.name].push(entry.file);
                used.add(resolved);
            });
        });
        return filtered;
    },

    /** Resolves only manifest-qualified physical roots, retaining legacy type folders for ordinary callers. */
    releaseRoots: function (moduleObject, dataType, dataReleasePlan) {
        let selected = Array.isArray(dataReleasePlan) ? dataReleasePlan.filter(release => release.moduleName === moduleObject.name) : [];
        let roots = selected.length ? selected.map(release => release.sourceRoot || release.dataType) : [dataType];
        return Array.from(new Set(roots)).map(root => path.resolve(moduleObject.path, 'data', root));
    },

    /**

     * Retrieves data files information.

     *

     * @param {*} path Method input.

     * @param {*} fileList Method input.

     * @returns {*} Method result.

     */

    getDataFiles: function (path, fileList) {
        if (fs.existsSync(path)) {
            let moduleFiles = {};
            UTILS.getDataFiles(path, moduleFiles);
            _.each(moduleFiles, (dataFile, name) => {
                if (fileList[name]) {
                    fileList[name].push(dataFile);
                } else {
                    fileList[name] = [dataFile];
                }
            });
            return fileList;
        }
    },

    /**

     * Retrieves local header files information.

     *

     * @param {*} filePath Method input.

     * @returns {*} Method result.

     */

    getLocalHeaderFiles: function (filePath) {
        let fileList = {};
        let headerBatchSize = CONFIG.get('data').headerBatchSize || 0;
        return new Promise((resolve, reject) => {
            try {
                if (fs.existsSync(filePath)) {
                    let files = fs.readdirSync(filePath);
                    if (files) {
                        for (let count = 0; count < files.length; count++) {
                            let element = files[count];
                            let file = path.join(filePath, element);
                            if (!fs.statSync(file).isDirectory()) {
                                let name = element.split('.').shift();
                                let extname = element.split('.').pop();
                                if (!UTILS.isBlank(name) && (name.endsWith('Header') || name.endsWith('Headers'))) {
                                    fileList[name + '_' + extname] = [SERVICE.DefaultFileHandlerService.moveSyncToProcessing(file)];
                                    if (headerBatchSize && headerBatchSize > 0 && Object.keys(fileList).length >= headerBatchSize) {
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
                resolve(fileList);
            } catch (error) {
                reject(new CLASSES.DataImportError(error, 'while collecting local data files'));
            }
        });
    },

    /**

     * Retrieves all frefix files information.

     *

     * @param {*} filePath Method input.

     * @param {*} fileList Method input.

     * @param {*} preFix Method input.

     * @returns {*} Method result.

     */

    getAllFrefixFiles: function (filePath, fileList, preFix) {
        let _self = this;
        if (fs.existsSync(filePath)) {
            let files = fs.readdirSync(filePath);
            if (files) {
                files.forEach(element => {
                    let file = path.join(filePath, element);
                    if (fs.statSync(file).isDirectory()) {
                        _self.getAllFrefixFiles(file, fileList, preFix);
                    } else {
                        let name = element.substring(0, element.lastIndexOf("."));
                        name = name.replace(/\./g, '');
                        let extname = element.split('.').pop();
                        if (!UTILS.isBlank(name) && (!preFix || element.startsWith(preFix)) &&
                            !name.endsWith('Header') && !name.endsWith('Headers') && !name.endsWith('processing')) {
                            fileList[name + '_' + extname] = SERVICE.DefaultFileHandlerService.moveSyncToProcessing(file);
                        }
                    }
                });
            }
        }
    },

    /**

     * Retrieves import files information.

     *

     * @param {*} filePath Method input.

     * @returns {*} Method result.

     */

    getImportFiles: function (filePath) {
        let fileList = {};
        return new Promise((resolve, reject) => {
            try {
                if (fs.existsSync(filePath)) {
                    let files = fs.readdirSync(filePath);
                    if (files) {
                        for (let count = 0; count < files.length; count++) {
                            let element = files[count];
                            let file = path.join(filePath, element);
                            if (!fs.statSync(file).isDirectory()) {
                                let name = element.split('.').shift();
                                let extname = element.split('.').pop();
                                fileList[name + '_' + extname] = SERVICE.DefaultFileHandlerService.moveSyncToProcessing(file);
                            }
                        }
                    }
                }
                resolve(fileList);
            } catch (error) {
                reject(new CLASSES.DataImportError(error, 'while collecting import files'));
            }
        });
    },

    /**

     * Validates import pending rules.

     *

     * @param {*} dataFiles Method input.

     * @returns {*} Method result.

     */

    isImportPending: function (dataFiles) {
        let pending = false;
        _.each(dataFiles, (fileObj, fileName) => {
            if (!fileObj.done || fileObj.done === false) {
                pending = true;
                return false;
            }
        });
        return pending;
    }
};
