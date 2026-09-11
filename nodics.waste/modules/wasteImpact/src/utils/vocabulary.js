/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteImpact/src/utils/vocabulary @description Defines provider protocol vocabulary; policy values remain layered configuration. @layer utility @owner wasteImpact */
module.exports = { wasteImpact: {
    environmentalStatuses: Object.fromEntries(require('./enums').WasteEnvironmentalIndicatorStatus.definition.map(value => [value.toLowerCase(), value])),
    externalFormula: 'EXTERNAL_PROVIDER',
    statuses: Object.fromEntries(require('../../../wasteCore/src/utils/enums').WasteImpactStatus.definition.map(value => [value.toLowerCase(), value])),
    failureModes: require('./enums').WasteImpactFailureMode.definition,
    roundingModes: require('./enums').WasteImpactRoundingMode.definition,
    missingWeightModes: require('./enums').WasteImpactMissingWeightMode.definition,
    mockProviderCode: 'MOCK_CARBON',
    mockProviderVersion: '1',
    mockFormulaVersion: 'MOCK_WEIGHT_FACTOR_V1',
    carbonUnit: 'KG_CO2E'
} };
