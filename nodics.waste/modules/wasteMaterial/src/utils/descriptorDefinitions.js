/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteMaterial/utils/descriptorDefinitions @description Stable vocabulary for evidence-based item descriptors, independent of waste family or application. @owner wasteMaterial @layer utility @override Extend policy catalogues without redefining these evidence meanings. */
module.exports = {
  imageSourceTypes: ['ITEM_PHOTOGRAPH', 'PROMOTIONAL_GRAPHIC', 'ILLUSTRATION_OR_PAINTING', 'SCREENSHOT_OR_REPHOTO', 'SUSPECTED_GENERATED', 'UNCERTAIN'],
  bases: ['OBSERVED', 'INFERRED', 'TAXONOMY_POLICY', 'OPERATOR_VERIFIED', 'OPERATOR_MEASURED', 'UNKNOWN'],
  sizeClasses: ['SMALL', 'MEDIUM', 'LARGE', 'BULKY', 'HEAVY', 'UNKNOWN'],
  recyclability: ['POTENTIAL', 'PARTIAL', 'UNKNOWN'],
  contamination: ['VISIBLE', 'NOT_VISIBLE', 'UNKNOWN'],
  hazards: ['BATTERY_PRESENT', 'SHARP_EDGES', 'VISIBLE_LEAKAGE', 'CHEMICAL_RESIDUE', 'CONTAMINATION', 'UNKNOWN'],
  materialKinds: ['MATERIAL', 'COMPONENT', 'MIXTURE'],
};
