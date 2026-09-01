/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module partnerWasteOverlay/data/project-v001/headers/partnerWasteOverlayHeader @description Fixture project imports proving partner Waste data overlays. @layer test-fixture @owner waste */
const entry = (schemaName, dataFilePrefix) => ({
    options: { enabled: true, schemaName, operation: 'saveAll', dataFilePrefix },
    query: { code: '$code' }
});

module.exports = {
    wasteMaterial: {
        partnerWasteCategoryData: entry('wasteCategory', 'partnerWasteCategoryData')
    },
    wasteCollection: {
        partnerWasteCollectionPresetData: entry('wasteCollectionPreset', 'partnerWasteCollectionPresetData'),
        partnerWasteAcceptanceRuleData: entry('wasteCollectionAcceptanceRule', 'partnerWasteAcceptanceRuleData')
    },
    wasteImpact: {
        partnerWasteImpactProfileData: entry('wasteImpactProfile', 'partnerWasteImpactProfileData')
    }
};
