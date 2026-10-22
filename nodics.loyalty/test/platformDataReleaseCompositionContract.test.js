/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

/** @module nodics.loyalty/test/platformDataReleaseCompositionContract @description Verifies exact Platform source-catalogue selectors without activating Loyalty capabilities. @layer test @owner nodics.loyalty */
const test = require("node:test");
const assert = require("node:assert/strict");
const properties = require("../config/properties");

test("Loyalty exposes its Enterprise reference and selected Wallet role release", () => {
  assert.deepEqual(
    properties.data.dataReleases.runtimeRoleProfiles.PLATFORM.contributions,
    [
      {
        moduleName: "loyaltyCore",
        sections: ["core-enterprise-reference"],
      },
      {
        moduleName: "loyaltyWallet",
        sections: ["specialAccessGroups", "specialAccessRoles", "participantAccessGroups"],
      },
    ],
  );
  const section = require("../modules/loyaltyWallet/data/manifest.json").sections
    .specialAccessRoles;
  assert.equal(section.version, "0.0.3");
  assert.equal(section.destinationRole, "PLATFORM");
  assert.equal(section.selectionPolicy, "EXPLICIT");
  const participantSection = require("../modules/loyaltyWallet/data/manifest.json")
    .sections.participantAccessGroups;
  assert.equal(participantSection.destinationRole, "PLATFORM");
  assert.equal(participantSection.selectionPolicy, "EXPLICIT");
});
