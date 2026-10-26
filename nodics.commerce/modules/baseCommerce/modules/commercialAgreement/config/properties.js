/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module commercialAgreement/config/properties @description Complete agreement mechanics defaults, never business selections. @layer config @owner commercialAgreement */
module.exports = {
    tooling: {
        commands: {
            'acceptance:commercial-agreement': {
                acceptanceContract: true,
                projectHome: true,
                handler: '@nTooling/node-script',
                script: 'src/service/acceptance/defaultCommercialAgreementAcceptanceService.mjs'
            }
        }
    },
    commercialAgreement: {
        // Bounds are positive safe integers within validation.maximumConfiguredBound.
        // Workspace page size cannot exceed maximumPageSize; no service fallback.
        maximumVersions: 500,
        maximumBenefits: 100,
        maximumSelectedProducts: 1000,
        maximumRecordBytes: 1048576,
        maximumPageSize: 100,
        readPermission: 'commerce.agreement.read',
        writePermission: 'commerce.agreement.manage',
        enterpriseReference: {
            connectionName: 'profile',
            apiVersion: 'v0',
            targetAuthority: { runtimeRole: 'PLATFORM' },
            timeoutMs: 30000,
            validation: { timeoutMs: { minimum: 1, maximum: 60000 } }
        },
        // Catalogue sources may be detached from the operational Agreement runtime.
        // Deployments select REMOTE only when Product/Pricing authoring lives elsewhere.
        catalogueReferences: {
            mode: 'LOCAL',
            connectionName: 'commerceStaged',
            apiVersion: 'v0',
            targetAuthority: { runtimeRole: 'COMMERCE_STAGED' },
            timeoutMs: 30000,
            validation: { timeoutMs: { minimum: 1, maximum: 60000 } }
        },
        workspace: { pageSize: 25 },
        acceptance: { requestTimeoutMs: 30000, maximumAgreements: 50 },
        validation: {
            identifierPattern: '^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$',
            maximumTextLength: 8192,
            maximumConfiguredBound: 10000000
        }
    },
    schemaPolicies: { commercialAgreement: { operational: { accessGroups: { serviceAccountUserGroup: 10 } } } },
    apiExposure: { categories: { commerceManagement: { enabled: true } } }
};
