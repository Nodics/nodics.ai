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
