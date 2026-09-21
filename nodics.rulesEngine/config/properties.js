/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.rulesEngine/config/properties
 * @description Defines Rules Engine group-level framework defaults shared by child capabilities.
 * @layer config
 * @owner nodics.rulesEngine
 * @override Later framework/customer layers may narrow limits through standard Nodics configuration layering.
 */
module.exports = {
    rulesEngine: {
        limits: {
            maximumRuleGroupsPerSet: 250,
            maximumConditionsPerGroup: 50,
            maximumGroupDepth: 5,
            maximumSimulationBatchSize: 100
        }
    }
};
