/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

/** @module nodics.waste/test/platformDataReleaseCompositionContract @description Verifies Platform source-catalogue placement for Waste-owned participant access groups without activating Waste capabilities. @layer test @owner nodics.waste */
const test = require("node:test");
const assert = require("node:assert/strict");
const properties = require("../config/properties");

test("Waste exposes Carbon and Material participant groups to Platform authority", () => {
  const contributions =
    properties.data.dataReleases.runtimeRoleProfiles.PLATFORM.contributions;
  assert(contributions.some((entry) =>
    entry.moduleName === "wasteCarbon" &&
    entry.sections.includes("participantAccessGroups")));
  assert(contributions.some((entry) =>
    entry.moduleName === "wasteReward" &&
    entry.sections.includes("participantAccessGroups")));
  for (const owner of ["wasteCarbon", "wasteReward"]) {
    const section = require(`../modules/${owner}/data/manifest.json`).sections
      .participantAccessGroups;
    assert.equal(section.destinationRole, "PLATFORM");
    assert.equal(section.selectionPolicy, "EXPLICIT");
  }
});
