/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteReward/config/properties @description Configurable defaults for Waste reward assessment persistence. @layer config @owner wasteReward */
module.exports = {
    tooling: {
        commands: {
            'acceptance:waste-material-value': {
                acceptanceContract: true, projectHome: true, handler: '@nTooling/node-script',
                script: 'src/service/acceptance/defaultWasteMaterialValueHttpAcceptanceService.mjs'
            }
        },
        acceptance: {
            wasteMaterialValueHttp: {
                timeoutMs: 10000, maximumSelectionBytes: 65536, maximumResponseBytes: 262144,
                authorizationEnvironment: 'NODICS_WASTE_MATERIAL_ACCEPTANCE_AUTHORIZATION'
            }
        }
    },
    apiExposure: { categories: { wasteMaterialValueInternal: { enabled: true }, wasteMaterialValueRead: { enabled: true } } },
    wasteMaterialValue: {
        mock: { enabled: false },
        profile: { connectionName: 'profile', targetAuthority: { runtimeRole: 'PLATFORM' }, timeoutMs: 10000 },
        evidence: { valuationProviderService: null, paymentProviderService: null, qualificationRef: null, allowSynthetic: false },
        validation: {
            decimalDigits: { minimum: 1, maximum: 100 }, operationalLimit: { minimum: 1, maximum: 100000 },
            timeoutMs: { minimum: 1, maximum: 100000 }, amountScale: { minimum: 0, maximum: 8 },
            ratioDigits: { minimum: 1, maximum: 30 },
            categoryWeightDigits: { minimum: 1, maximum: 30 }
        },
        limits: { contributionsPerBatch: 500, providerTimeoutMs: 10000, decimalDigits: 30, pageSize: 50 },
        loyalty: { moduleName: 'loyaltyApi', connectionName: 'loyalty', targetAuthority: { runtimeRole: 'LOYALTY' }, timeoutMs: 15000 }
    },
    schemaPolicies: {
        wasteReward: {
            operational: {
                accessGroups: {
                    adminGroup: 10,
                    serviceAccountUserGroup: 10,
                    employeeUserGroup: 10
                }
            }
        }
    },
    localResetProvider: {
        contributions: {
            wasteReward: {
                serviceNames: {
                    DefaultWasteRewardAssessmentService: true
                }
            }
        }
    }
};
