/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

/** @module nodics.commerce/test/platformDataReleaseCompositionContract @description Verifies exact Platform source-catalogue selectors without activating Commerce capabilities. @layer test @owner nodics.commerce */
const test = require("node:test");
const assert = require("node:assert/strict");
const properties = require("../config/properties");

const releases = [
  ["product", "accessGroups", "0.0.4"],
  ["promotion", "accessGroups", "0.0.4"],
  ["promotion", "permissionCatalogue", "0.0.3"],
  ["order", "accessGroups", "0.0.4"],
  ["inventory", "specialAccessRoles", "0.0.3"],
  ["digitalCore", "permissionCatalogue", "0.0.2"],
  ["digitalCore", "bundleParticipantPermissions", "0.0.1"],
  ["digitalCore", "participantAccessGroups", "0.0.1"],
];

test("Commerce exposes only its selected Platform identity releases", () => {
  assert.deepEqual(
    properties.data.dataReleases.runtimeRoleProfiles.PLATFORM.contributions,
    [
      { moduleName: "product", sections: ["accessGroups", "enterpriseRoles"] },
      { moduleName: "promotion", sections: ["accessGroups", "enterpriseRoles", "businessAccessRoles", "permissionCatalogue"] },
      { moduleName: "order", sections: ["accessGroups", "specialAccessGroups", "specialAccessRoles", "participantReadAccess", "participantTransactionAccess", "permissionCatalogue", "enterpriseRoles"] },
      { moduleName: "cart", sections: ["participantTransactionAccess", "permissionCatalogue"] },
      { moduleName: "checkoutCore", sections: ["participantTransactionAccess", "permissionCatalogue"] },
      { moduleName: "bidding", sections: ["participantTransactionAccess", "permissionCatalogue"] },
      { moduleName: "inventory", sections: ["specialAccessGroups", "specialAccessRoles"] },
      {
        moduleName: "digitalCore",
        sections: [
          "permissionCatalogue",
          "bundleParticipantPermissions",
          "participantAccessGroups",
          "participantReadAccess",
          "participantTransactionAccess",
          "enterpriseParticipationAccess",
          "enterpriseRoles",
        ],
      },
    ],
  );
  assert.deepEqual(
    properties.data.dataReleases.runtimeRoleProfiles.PROCESS.contributions.map(
      (entry) => entry.moduleName,
    ),
    ["product", "pricing", "promotion", "inventory", "tax"],
  );
  for (const [moduleName, sectionCode, version] of releases) {
    const modulePath =
      moduleName === "order"
        ? "../modules/checkout/modules/order"
        : moduleName === "digitalCore"
          ? "../modules/digitalCommerce/modules/digitalCore"
          : "../modules/baseCommerce/modules/" + moduleName;
    const section = require(modulePath + "/data/manifest.json").sections[
      sectionCode
    ];
    assert.equal(section.version, version, moduleName);
    assert.equal(section.destinationRole, "PLATFORM", moduleName);
    assert.equal(section.selectionPolicy, "EXPLICIT", moduleName);
  }
});

// Exercise nImport discovery with Promotion inactive, matching the Waste detached-owner contract.
test("inactive Promotion exposes its catalogue through standard Platform discovery", t => {
  const path = require("node:path");
  const releaseService = require("../../nodics.foundation/modules/nData/nImport/import/src/service/release/defaultDataReleaseService");
  const previous = global.NODICS;
  t.after(() => { if (previous === undefined) delete global.NODICS; else global.NODICS = previous; });
  const owner = { name: "promotion", path: path.resolve(__dirname, "../modules/baseCommerce/modules/promotion") };
  global.NODICS = { getActiveModules: () => ["profile"], getRawModule: name => name === owner.name ? owner : undefined };
  const service = Object.create(releaseService);
  service.configuration = () => ({ contributions: properties.data.dataReleases.runtimeRoleProfiles.PLATFORM.contributions });
  service.error = (code, message) => Object.assign(new Error(message), { code });
  const release = service.discoverManifestRelease({ moduleName: owner.name, sectionCode: "permissionCatalogue" }, "init");
  assert.equal(release.version, "0.0.3");
  assert.equal(release.sourceRoot, "init-v001");
  assert.equal(release.destinationRole, "PLATFORM");
  assert.equal(release.selectionPolicy, "EXPLICIT");
  assert.notEqual(service.discoveryOwners().find(item => item.moduleName === owner.name).active, true);
  assert.throws(() => service.discoverManifestRelease({ moduleName: owner.name, sectionCode: "acquisitionRefreshSchedule" }, "init"), /not selected/);
});


test("inactive Digital exposes its reminder permission catalogue on Platform", t => {
  const path = require("node:path");
  const releaseService = require("../../nodics.foundation/modules/nData/nImport/import/src/service/release/defaultDataReleaseService");
  const previous = global.NODICS;
  t.after(() => { if (previous === undefined) delete global.NODICS; else global.NODICS = previous; });
  const owner = { name: "digitalCore", path: path.resolve(__dirname, "../modules/digitalCommerce/modules/digitalCore") };
  global.NODICS = { getActiveModules: () => ["profile"], getRawModule: name => name === owner.name ? owner : undefined };
  const service = Object.create(releaseService);
  service.configuration = () => ({ contributions: properties.data.dataReleases.runtimeRoleProfiles.PLATFORM.contributions });
  service.error = (code, message) => Object.assign(new Error(message), { code });
  const release = service.discoverManifestRelease({ moduleName: owner.name, sectionCode: "permissionCatalogue" }, "init");
  assert.equal(release.version, "0.0.2");
  assert.notEqual(service.discoveryOwners().find(item => item.moduleName === owner.name).active, true);
});
