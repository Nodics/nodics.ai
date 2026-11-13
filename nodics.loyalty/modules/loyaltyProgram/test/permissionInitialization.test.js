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
  const bindings = require("../../../../nodics.foundation/modules/nConfig/src/service/defaultConfigurationBindingService");
  const contributions = bindings.merge({}, require("../../../config/properties")).data.dataReleases.contributions;
  const selected = contributions.filter(item => item.moduleName === "loyaltyProgram");
  assert.deepEqual(selected, [{ moduleName: "loyaltyProgram", sections: ["partnerEligibilityAdministrationPermission"] }]);
  const profileRoot = path.resolve(__dirname, "../../../../nodics.platform/modules/profile");
  const { ContactType } = require(path.join(profileRoot, "src/utils/enums"));
  global.ENUMS = { ContactType: Object.fromEntries(ContactType.definition.map(key => [key, { key }])) };
  const schema = require(path.join(profileRoot, "src/schemas/schemas")).profile;
  const state = createPorts({ modules: {
    profile: { name: "profile", rawSchema: schema, path: profileRoot },
    loyaltyProgram: { name: "loyaltyProgram", path: path.resolve(__dirname, ".."), index: "12.2" },
  }, runtimeRole: "PLATFORM" });
  const service = state.service;
  global.NODICS.getActiveModules = () => ["profile"];
  service.configuration().contributions = selected;
  const code = "loyaltyProgram:partnerEligibilityAdministrationPermission";
  const releases = service.discoverReleases("init");
  assert.deepEqual(releases.filter(item => item.moduleName === "loyaltyProgram").map(item => item.releaseCode), [code]);
  const release = releases.find(item => item.releaseCode === code);
  assert.equal(release.selectionPolicy, "DEFAULT");
  assert.equal(service.validateDestination(release), true);
  const profile = await service.buildInitializationProfile("platformFoundation", { steps: [{ dataType: "init" }] }, {});
  assert(profile.steps[0].releases.some(item => item.releaseCode === code));
  assert.equal(state.imports.length, 0);
  assert.equal(require("../package.json").nodics.runtime.router, false);
  assert.equal(require("../../loyaltyWallet/data/manifest.json").sections.specialAccessRoles.selectionPolicy, "EXPLICIT");
});
