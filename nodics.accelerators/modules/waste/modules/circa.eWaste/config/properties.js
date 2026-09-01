/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module circa.eWaste/config/properties @description Defines reusable Circa eWaste application composition metadata without owning framework policy values. @layer config @owner circa.eWaste @override Project modules may override enabled journeys, display labels, and frontend binding names. */
module.exports = {
    circaEWaste: {
        application: {
            code: 'CIRCA_EWASTE',
            enabled: true,
            displayName: 'Nodics Circa eWaste',
            frontendModuleName: 'nodics.circa.eWaste',
            projectModuleName: 'circa.eWaste',
            requiredScenarioModules: ['eWaste', 'wasteRecycling'],
            frameworkModuleName: 'nodics.waste'
        },
        journeys: {
            submission: { enabled: true },
            approvedAsset: { enabled: true },
            marketplace: { enabled: true },
            gift: { enabled: true },
            donation: { enabled: true },
            couponRedemption: { enabled: true },
            recyclingHandoff: { enabled: true }
        }
    }
};
