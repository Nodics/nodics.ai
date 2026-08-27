/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module axis/data/init-v001/records/axis/axisContentCatalogData
 * @description Defines employee-only Axis and shared documentation content catalogs.
 * @layer data
 * @owner axis
 */
const AXIS_FUNCTIONAL_MODULE = 'nodics.platform';
const withAxisOwnership = records => {
    Object.keys(records).forEach(key => {
        records[key].functionalModule = AXIS_FUNCTIONAL_MODULE;
        records[key].activationMode = 'PLATFORM_ACTIVE';
    });
    return records;
};

module.exports = withAxisOwnership({
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
