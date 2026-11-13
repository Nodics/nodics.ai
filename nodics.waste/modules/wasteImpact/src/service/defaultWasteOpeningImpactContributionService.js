/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module wasteImpact/service/defaultWasteOpeningImpactContributionService @description Installs explicit opening samples through the owning generated repositories. @owner wasteImpact @layer service */
const opening = require("../../../wasteCore/src/utils/openingSampleContribution");
module.exports = opening("wasteImpact", "WASTE_OPENING_IMPACT", ["wasteImpactResult"], ["wasteCore", "wasteSubmission"]);
