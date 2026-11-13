/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module digitalCore/test/digitalParticipantAccessRelease @description Verifies capability-owned Digital participant authority releases. @owner digitalCore @layer test */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");

const dataRoot = path.resolve(__dirname, "../data");
const manifest = require("../data/manifest.json");
const permissions = require("../data/init-v001/records/identity/digitalBundleParticipantPermissionData");
const groups = require("../data/init-v001/records/identity/digitalBundleParticipantUserGroupData");

test("Digital owns an explicit participant permission and access-group release", () => {
  const permissionRelease = manifest.sections.bundleParticipantPermissions;
  const groupRelease = manifest.sections.participantAccessGroups;
  assert.equal(permissionRelease.selectionPolicy, "EXPLICIT");
  assert.equal(groupRelease.selectionPolicy, "EXPLICIT");
  assert.equal(permissionRelease.destinationRole, "PLATFORM");
  assert.equal(groupRelease.destinationRole, "PLATFORM");
  assert.equal(
    permissions.digitalBundleManagePermission.code,
    "commerce.digital.bundle.manage",
  );
  assert.deepEqual(
    groups.digitalBundleCustomerUserGroup.permissions,
    ["commerce.digital.bundle.manage"],
  );
  assert.deepEqual(
    groups.digitalBundleCustomerUserGroup.parentGroups,
    ["customerUserGroup"],
  );
  for (const release of [permissionRelease, groupRelease])
    for (const [file, checksum] of Object.entries(release.files))
      assert.equal(
        crypto
          .createHash("sha256")
          .update(fs.readFileSync(path.join(dataRoot, file)))
          .digest("hex"),
        checksum,
        file,
      );
});

test("participant transactions declare their permission vocabulary before group creation", () => {
  const source = require("../../../../../../nodics.foundation/modules/nData/nImport/import/src/service/release/defaultDataReleaseService");
  const owner = { ...source, configuration: () => ({}) };
  for (const sectionCode of ["permissionCatalogue", "bundleParticipantPermissions"]) {
    const target = manifest.sections[sectionCode];
    const reference = (manifest.sections.participantTransactionAccess.prerequisites || [])
      .find(value => value.moduleName === "digitalCore" && value.sectionCode === sectionCode);
    assert.ok(reference, sectionCode);
    assert.equal(reference.version, target.version);
    assert.equal(reference.checksum, owner.releaseFileChecksum(target.files, owner.validatePrerequisites(target.prerequisites)));
    assert.equal(reference.partition, "DEFAULT");
  }
});
