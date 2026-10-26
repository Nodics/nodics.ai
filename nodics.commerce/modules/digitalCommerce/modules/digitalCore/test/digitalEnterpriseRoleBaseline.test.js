/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module digitalCore/test/digitalEnterpriseRoleBaseline @description Exercises owner role data with real participation admission; no live settings or imports. @owner digitalCore @layer test */
const test = require("node:test"), assert = require("node:assert/strict");
const { setup } = require("./helpers/couponCheckoutFixture");
const participation = require("../src/service/defaultDigitalParticipationService");
const groups = Object.assign({}, ...["digitalEnterpriseParticipationGroupData", "digitalCoreParticipantReadGroupData", "digitalCoreParticipantTransactionGroupData"].map(file =>
  Object.fromEntries(Object.values(require("../data/init-v001/records/identity/" + file)).map(row => [row.code,row]))));
const permissions = Object.values(groups).flatMap(group => group.permissions);
test("settings permission is a separately pinned release completed before dependent group dispatch", () => {
  const crypto = require("node:crypto"), fs = require("node:fs"), path = require("node:path");
  const sections = require("../data/manifest.json").sections;
  const access = sections.enterpriseParticipationAccess;
  const vocabulary = sections.enterpriseParticipationPermissions;
  const ref = access.prerequisites.find(r => r.sectionCode === "enterpriseParticipationPermissions");
  assert.equal(ref.moduleName, "digitalCore"); assert.equal(ref.version, vocabulary.version);
  const hash = value => crypto.createHash("sha256").update(value).digest("hex");
  assert.equal(ref.checksum, hash(Object.keys(vocabulary.files).sort().map(f => f + ":" + vocabulary.files[f]).join("|")));
  for (const [file, expected] of Object.entries(vocabulary.files)) {
    assert.equal(hash(fs.readFileSync(path.join(__dirname, "../data", file))), expected);
    assert(!access.files[file]);
  }
  for (const section of [access, vocabulary]) for (const file of Object.keys(section.files).filter(f => f.includes("/headers/"))) {
    for (const header of Object.values(require(path.join(__dirname, "../data", file)).profile)) {
      assert.equal(header.options.operation, "ensureReferenceAll");
      assert.equal(header.options.schemaName, section === vocabulary ? "permission" : "userGroup");
    }
  }
});
test("internal capability groups cover read, transact and settings without a task-specific role", () => {
  assert.deepEqual([...permissions].sort(), ["commerce.digital.bundle.configure", "commerce.digital.bundle.manage", "commerce.digital.own.read", "commerce.digital.own.reveal"]);
  for (const group of Object.values(groups)) assert.deepEqual(group.parentGroups, []);
  assert.deepEqual(require("../data/init-v001/records/identity/digitalCoreEnterpriseRoleData").record0.groupCodes, ["commerceMerchantUserGroup"]);
  const vocabulary = require("../data/init-v001/records/identity/digitalEnterpriseParticipationPermissionData").configure;
  assert.equal(vocabulary.code, "commerce.digital.bundle.configure"); assert.equal(vocabulary.ownerModule, "digitalCore");
});
test("capability composition can inspect settings but cannot bypass Profile DENY or foreign aliases", async t => {
  const f = setup(t, "CERTIFICATES", true, "buyer-enterprise");
  f.permissions.splice(0, f.permissions.length, ...permissions);
  const request = {...f.r, enterpriseCode:"buyer-enterprise"};
  assert.equal((await participation.current(request)).ownerRef.code, "buyer-enterprise");
  f.state.denied = true;
  await assert.rejects(participation.current(request));
  f.state.denied = false;
  await assert.rejects(participation.current({...request,enterpriseCode:"foreign"}));
  f.permissions.splice(f.permissions.indexOf("commerce.digital.bundle.configure"),1);
  await assert.rejects(participation.current(request));
  assert.equal(f.participation.rows.digitalBundleOwnerPolicy.length,0);
});
