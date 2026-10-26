/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

/** @module loyaltyProgram/test/permissionInitialization @description Proves default permission prerequisites through the canonical offline release planner. @layer test @owner loyaltyProgram */
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const createPorts = require("../../../../nodics.foundation/modules/nData/nImport/import/test/helpers/releaseExecution");

test("Platform discovers inactive Program permission and includes it in default initialization", async () => {
  const contributions = require("../../../config/properties").data.dataReleases.runtimeRoleProfiles.PLATFORM.contributions;
  const selected = contributions.filter(item => item.moduleName === "loyaltyProgram");
  assert.deepEqual(selected, [{ moduleName: "loyaltyProgram", sections: ["partnerEligibilityAdministrationPermission"] }]);
  const state = createPorts({ modules: { loyaltyProgram: { name: "loyaltyProgram", path: path.resolve(__dirname, ".."), index: "12.2" } }, runtimeRole: "PLATFORM" });
  const service = state.service;
  global.NODICS.getActiveModules = () => [];
  service.configuration().contributions = selected;
  const code = "loyaltyProgram:partnerEligibilityAdministrationPermission";
  const releases = service.discoverReleases("init");
  assert.deepEqual(releases.map(item => item.releaseCode), [code]);
  assert.equal(releases[0].version, "0.0.1");
  assert.equal(releases[0].selectionPolicy, "DEFAULT");
  const initializer = require("../../../../nodics.foundation/modules/nConfig/src/service/DefaultFrameworkInitializerService");
  const definition = initializer.defaultInitializationProfileForRole("PLATFORM", new Set(["init", "core"])).localPlatformFoundation;
  const profile = await service.buildInitializationProfile("localPlatformFoundation", definition, {});
  assert.deepEqual(profile.steps[0].releases.map(item => item.releaseCode), [code]);
  const plan = await service.preparePlan({ releaseRequest: { dataType: "init" } });
  assert.deepEqual(plan.releases.map(item => item.releaseCode), [code]);
  assert.equal(state.imports.length, 0);
  assert.equal(require("../package.json").nodics.runtime.router, false);
  assert.equal(require("../../loyaltyWallet/data/manifest.json").sections.specialAccessRoles.selectionPolicy, "EXPLICIT");
});
