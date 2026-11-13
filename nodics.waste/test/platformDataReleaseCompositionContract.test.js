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
const bindings = require("../../nodics.foundation/modules/nConfig/src/service/defaultConfigurationBindingService");
const properties = bindings.merge({}, require("../config/properties"));
const path = require("node:path");
const releaseService = require("../../nodics.foundation/modules/nData/nImport/import/src/service/release/defaultDataReleaseService");

test("Waste exposes Carbon and Material participant groups to Platform authority", () => {
  const contributions =
    properties.data.dataReleases.contributions;
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


test("inactive Carbon exposes its explicit finalization permission through standard Platform discovery", t => {
  const previous = global.NODICS;
  t.after(() => { if (previous === undefined) delete global.NODICS; else global.NODICS = previous; });
  const owner = { name: "wasteCarbon", path: path.resolve(__dirname, "../modules/wasteCarbon") };
  global.NODICS = { getActiveModules: () => ["profile"], getRawModule: name => name === owner.name ? owner : undefined };
  const service = Object.create(releaseService);
  service.configuration = () => ({ contributions: properties.data.dataReleases.contributions });
  service.error = (code, message) => Object.assign(new Error(message), { code });
  const release = service.discoverManifestRelease({ moduleName: owner.name, sectionCode: "transferFinalizationPermission" }, "init");
  assert.equal(release.version, "0.0.1");
  assert.equal(release.destinationRole, "PLATFORM");
  assert.equal(release.selectionPolicy, "EXPLICIT");
  assert.notEqual(service.discoveryOwners().find(item => item.moduleName === owner.name).active, true);
  assert.throws(() => service.discoverManifestRelease({ moduleName: owner.name, sectionCode: "documentation" }, "init"),
    /not selected/);
});
