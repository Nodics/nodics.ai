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
  ["order", "accessGroups", "0.0.4"],
  ["inventory", "specialAccessRoles", "0.0.3"],
  ["digitalCore", "bundleParticipantPermissions", "0.0.1"],
  ["digitalCore", "participantAccessGroups", "0.0.1"],
];

test("Commerce exposes only its selected Platform identity releases", () => {
  assert.deepEqual(
    properties.data.dataReleases.runtimeRoleProfiles.PLATFORM.contributions,
    [
      { moduleName: "product", sections: ["accessGroups"] },
      { moduleName: "promotion", sections: ["accessGroups"] },
      { moduleName: "order", sections: ["accessGroups", "specialAccessGroups", "specialAccessRoles"] },
      { moduleName: "inventory", sections: ["specialAccessGroups", "specialAccessRoles"] },
      {
        moduleName: "digitalCore",
        sections: [
          "bundleParticipantPermissions",
          "participantAccessGroups",
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
