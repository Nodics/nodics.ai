/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module wasteImpact/config/properties
 * @description Declares layered impact-provider settings. Every later supported Nodics
 * configuration layer may override these values; no application module is required.
 * @layer config
 * @owner wasteImpact
 * @override Override only intentional deltas. The factor 1 is illustrative, not an
 * emissions coefficient. Disable the default fallback factor by setting it to null.
 */
module.exports = {
    // Inert inventory; an allowed local server must explicitly select this capability.
    localResetProvider: {
        "contributions": {
            "wasteImpact": {
                "serviceNames": {
                    "DefaultWasteImpactMetricService": true,
                    "DefaultWasteImpactProfileService": true,
                    "DefaultWasteImpactResultService": true,
                    "DefaultWasteImpactSelectionService": true
                }
            }
        }
    },

    schemaPolicies: { wasteImpact: { operational: { accessGroups: { adminGroup: 10, serviceAccountUserGroup: 10, employeeUserGroup: 10 } } } },
    wasteImpact: {
        assessments: { presentation: {
            recover: 'Finish pending assessment', title: 'Impact assessments', history: 'Assessment history', accepted: 'Accepted assessment', candidate: 'Not selected',
            reassess: 'Calculate new assessment', select: 'Accept this assessment', reason: 'Reason',
            confirmTitle: 'Confirm assessment action', confirm: 'Confirm', cancel: 'Cancel', refresh: 'Refresh assessments',
            explanation: 'A new calculation preserves previous results. Accepting an assessment changes the environmental view only; original approval rewards remain unchanged.',
            pending: 'The previous command needs recovery. Retry it with the same details.', previous: 'Previous page', next: 'Next page',
            empty: 'No saved assessment is available.', saved: 'Assessment saved. Review it before acceptance.', selected: 'Accepted assessment updated.',
            provider: 'Provider', dataset: 'Dataset version', baseline: 'Baseline', treatment: 'Treatment', weight: 'Calculation weight', factor: 'Factor', potential: 'Potential CO₂e savings', equivalent: 'Carbon equivalent (tCO₂e)', basis: 'Calculation basis', source: 'Source', region: 'Region', legacy: 'Unvalidated calculation', unavailable: 'Unavailable', loading: 'Loading assessments…'
        } },
        defaultStatus: 'ESTIMATED',
        calculation: {
            providerService: 'DefaultWasteImpactMockProviderService',
            timeoutMs: 5000,
            failureMode: 'ERROR',
            environmentalAssessment: { enabled: false, version: '1', indicators: {} },
            mock: {
                metricCode: 'ESTIMATED_CO2E_SAVED_KG',
                factorSetVersion: 'illustrative-v1',
                factors: { default: 1, itemTypes: {}, categories: {} },
                defaultWeightsKg: { default: null, itemTypes: {}, categories: {} },
                missingWeightMode: 'ESTIMATE_FROM_QUANTITY',
                precision: 3,
                roundingMode: 'HALF_UP'
            }
        }
    }
};
