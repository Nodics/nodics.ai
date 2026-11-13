/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module wasteCore/service/defaultWasteOpeningAssetContributionService @description Installs explicit opening samples through the owning generated repositories. @owner wasteCore @layer service */
const opening = require("../utils/openingSampleContribution");
module.exports = opening("wasteCore", "WASTE_OPENING_ASSETS", ["wasteAssetOwnershipEvent", "wasteAsset"], ["wasteSubmission", "wasteVerification", "wasteImpact"]);
