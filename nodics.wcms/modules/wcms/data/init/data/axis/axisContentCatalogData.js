/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module wcms/data/init/data/axis/axisContentCatalogData
 * @description Defines employee-only Axis and shared documentation content catalogs.
 * @layer data
 * @owner wcms
 */
const WCMS_FUNCTIONAL_MODULE = 'nodics.wcms';
const withWcmsOwnership = records => {
    Object.keys(records).forEach(key => {
        records[key].functionalModule = WCMS_FUNCTIONAL_MODULE;
        records[key].activationMode = 'RUNTIME_MODULE_ACTIVE';
    });
    return records;
};

module.exports = withWcmsOwnership({
    record0: {
        code: 'axisContentCatalog',
        name: 'Nodics Axis Content Catalog',
        catalogType: 'CONTENT',
        accessGroups: ['employeeUserGroup'],
        active: true
    },
    record1: {
        code: 'documentationContentCatalog',
        name: 'Nodics Documentation Content Catalog',
        catalogType: 'CONTENT',
        accessGroups: ['employeeUserGroup'],
        active: true
    }
});
