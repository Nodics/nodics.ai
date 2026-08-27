/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../../../../../../');
const dataTypes = ['init', 'core', 'sample'];

function walk(dir, matcher, result = []) {
    if (!fs.existsSync(dir)) {
        return result;
    }
    fs.readdirSync(dir).forEach(entry => {
        let fullPath = path.join(dir, entry);
        if (fs.statSync(fullPath).isDirectory()) {
            if (['.git', 'node_modules', 'generated'].includes(entry)) {
                return;
            }
            walk(fullPath, matcher, result);
        } else if (!matcher || matcher(fullPath, entry)) {
            result.push(fullPath);
        }
    });
    return result;
}

function collectBackendModules() {
    let rootPackage = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));
    let modules = [];
    (rootPackage.workspaces || []).forEach(workspaceName => {
        walk(path.join(repoRoot, workspaceName), (filePath, fileName) => {
            if (fileName !== 'package.json') {
                return false;
            }
            let packageJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            if (packageJson.nodics && packageJson.nodics.loadableByNodicsModuleLoader !== false) {
                modules.push({
                    name: packageJson.name,
                    path: path.dirname(filePath)
                });
            }
            return false;
        });
    });
    return modules;
}

function getActiveDataTypeRoots(activeModules) {
    let result = [];
    activeModules.forEach(moduleObject => {
        dataTypes.forEach(dataType => {
            let moduleDataRoot = path.join(moduleObject.path, 'data');
            let roots = [dataType];
            if (fs.existsSync(moduleDataRoot)) {
                roots = roots.concat(fs.readdirSync(moduleDataRoot)
                    .filter(entry => new RegExp('^' + dataType + '-v\\d{3}$').test(entry))
                    .sort());
            }
            roots.forEach(rootName => {
                let dataRoot = path.join(moduleDataRoot, rootName);
                if (!fs.existsSync(dataRoot)) return;
                result.push({
                    moduleName: moduleObject.name,
                    dataType: dataType,
                    dataRoot: dataRoot
                });
            });
        });
    });
    return result;
}

function getHeaderFiles(dataRoot) {
    return walk(dataRoot, (_filePath, fileName) => {
        let baseName = fileName.substring(0, fileName.lastIndexOf('.'));
        return baseName.endsWith('Header') || baseName.endsWith('Headers');
    });
}

function getDataFileKeys(dataRoot) {
    return walk(dataRoot, (filePath, fileName) => {
        let relativeSegments = path.relative(dataRoot, filePath).split(path.sep);
        if (!relativeSegments.includes('data') && !relativeSegments.includes('records')) {
            return false;
        }
        let baseName = fileName.split('.').shift();
        return baseName && !baseName.endsWith('Header') && !baseName.endsWith('Headers');
    }).map(filePath => {
        let fileName = path.basename(filePath);
        return fileName.split('.').shift() + '_' + fileName.split('.').pop();
    });
}

function getEnabledHeaders(headerFiles) {
    let headers = [];
    headerFiles.forEach(headerFile => {
        let headerExport = require(headerFile);
        Object.keys(headerExport).forEach(moduleName => {
            Object.keys(headerExport[moduleName]).forEach(headerName => {
                let header = headerExport[moduleName][headerName];
                if (header.options && header.options.enabled) {
                    headers.push({
                        file: headerFile,
                        moduleName: moduleName,
                        headerName: headerName,
                        dataFilePrefix: header.options.dataFilePrefix || headerName
                    });
                }
            });
        });
    });
    return headers;
}

let failures = [];
let scannedRoots = [];
let activeModules = collectBackendModules();
let activeDataTypeRoots = getActiveDataTypeRoots(activeModules);

activeDataTypeRoots.forEach(dataTypeRoot => {
    let headerFiles = getHeaderFiles(dataTypeRoot.dataRoot);
    let dataFileKeys = getDataFileKeys(dataTypeRoot.dataRoot);
    let enabledHeaders = getEnabledHeaders(headerFiles);
    if (headerFiles.length > 0 || dataFileKeys.length > 0) {
        scannedRoots.push(dataTypeRoot.dataRoot.replace(repoRoot + path.sep, ''));
    }
    enabledHeaders.forEach(header => {
        let matched = dataFileKeys.some(fileKey => fileKey.startsWith(header.dataFilePrefix));
        if (!matched) {
            failures.push([
                dataTypeRoot.moduleName,
                dataTypeRoot.dataRoot.replace(repoRoot + path.sep, ''),
                header.file.replace(repoRoot + path.sep, ''),
                header.moduleName + '.' + header.headerName,
                header.dataFilePrefix
            ].join(' | '));
        }
    });
});

assert(scannedRoots.length > 0, 'Expected to find core or sample data roots');
assert.deepStrictEqual(failures, []);
