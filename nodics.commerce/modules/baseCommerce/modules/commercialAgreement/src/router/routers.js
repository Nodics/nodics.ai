/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module commercialAgreement/router @description Scoped agreement commands; no generic commercial CRUD. @layer router @owner commercialAgreement */
module.exports = { commercialAgreement: { management: {
    workspace: { secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup'],
        permissionConfig: 'commercialAgreement.readPermission', apiExposure: 'commerceManagement', cache: { enabled: false },
        key: '/agreements/workspace', method: 'POST', controller: 'DefaultCommercialAgreementController', operation: 'workspace' },
    search: { secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup'],
        permissionConfig: 'commercialAgreement.readPermission', apiExposure: 'commerceManagement', cache: { enabled: false },
        key: '/agreements/search', method: 'POST', controller: 'DefaultCommercialAgreementController', operation: 'search' },
    record: { secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup'],
        permissionConfig: 'commercialAgreement.writePermission', apiExposure: 'commerceManagement', cache: { enabled: false },
        key: '/agreements/record', method: 'POST', controller: 'DefaultCommercialAgreementController', operation: 'record' },
    read: { secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup'],
        permissionConfig: 'commercialAgreement.readPermission', apiExposure: 'commerceManagement', cache: { enabled: false },
        key: '/agreements/read', method: 'POST', controller: 'DefaultCommercialAgreementController', operation: 'read' }
} } };
