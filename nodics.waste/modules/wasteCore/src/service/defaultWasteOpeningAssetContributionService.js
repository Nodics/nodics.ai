/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module wasteCore/service/defaultWasteOpeningAssetContributionService @description Installs explicit opening samples through the owning generated repositories. @owner wasteCore @layer service */
const opening = require("../utils/openingSampleContribution");
module.exports = opening("wasteCore", "WASTE_OPENING_ASSETS", ["wasteAssetOwnershipEvent", "wasteAsset"], ["wasteSubmission", "wasteVerification", "wasteImpact"]);
