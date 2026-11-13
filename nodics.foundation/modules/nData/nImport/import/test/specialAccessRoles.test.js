/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module import/test/specialAccessRoles @description Verifies advanced owner responsibilities remain neutral and independently governed. @owner import @layer test */
const test = require("node:test"), assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto");
const groups = require("../data/init-v001/records/identity/importSpecialAccessGroupData");
const roles = require("../data/init-v001/records/identity/importSpecialAccessRoleData");
const manifest = require("../data/manifest.json");
test("advanced responsibility is owner-defined, scoped, and never an ordinary business access level", () => {
  assert.equal(Object.keys(groups).length, 1);
  assert.equal(Object.keys(roles).length, 1);
  const group = groups.record0, role = roles.record0;
  assert.deepEqual(group.permissions, ["import.sample.run","import.release.view","import.release.validate"]);
  assert.deepEqual(group.parentGroups, ["employeeUserGroup"]);
  assert.deepEqual(role.groupCodes, [group.code]);
  assert.equal(role.scopeType, "ENTERPRISE");
  assert.equal(role.ownerModule, "import");
  assert.equal(role.delegable, true);
  assert.equal(role.accessLevel, undefined);
  assert.equal(role.administrationClass, undefined);
  assert.doesNotMatch(JSON.stringify({ groups, roles }), /circa|greenperks|renewworks|loopcycle/i);
});
test("independent init releases seal owner files and require base groups and permission catalogue", () => {
  for (const code of ["specialAccessGroups", "specialAccessRoles"]) {
    const section = manifest.sections[code];
    assert.equal(section.dataType, "init");
    assert.equal(section.destinationRole, "PLATFORM");
    for (const [file, checksum] of Object.entries(section.files))
      assert.equal(crypto.createHash("sha256").update(fs.readFileSync(path.join(__dirname, "../data", file))).digest("hex"), checksum, file);
  }
  assert.deepEqual(manifest.sections.specialAccessGroups.prerequisites.map(p => p.moduleName + ":" + p.sectionCode), ["profile:accessGroups", "import:permissionCatalogue"]);
  assert.deepEqual(manifest.sections.specialAccessRoles.prerequisites.map(p => p.moduleName + ":" + p.sectionCode), ["import:specialAccessGroups"]);
});

test("sample operator setup keeps the original authority and scopes the fixed Init release to one ready enterprise", async (t) => {
  const service = require("../src/service/release/defaultDataReleaseService");
  const authData = { tenant: "default", entCode: "default" };
  const enterprise = { code: "fixture", active: true, tenant: { code: "fixtureTenant", active: true } };
  const request = {
    tenant: "default", authData,
    httpRequest: { body: { enterpriseCode: "fixture", expectedVersion: "0.0.1" } },
  };
  const previous = { SERVICE: global.SERVICE, CONFIG: global.CONFIG };
  t.after(() => Object.assign(global, previous));
  global.CONFIG = { get: () => "default" };
  let ready = true;
  let allowed = true;
  global.SERVICE = {
    DefaultIdentityCatalogueGovernanceService: {
      authorize: async (original) => {
        assert.equal(original, request);
        if (!allowed) throw Error("denied");
      },
    },
    DefaultEnterpriseManagementService: {
      retrieveEnterpriseForAccess: async (code) => {
        assert.equal(code, enterprise.code);
        return { enterprise, tenantCode: "fixtureTenant" };
      },
    },
    DefaultEnterpriseHandlerService: { isEnterpriseRuntimeReady: () => ready },
  };
  const operations = [];
  const run = (mode) => async (scoped) => {
    assert.equal(scoped.authData, authData);
    assert.equal(scoped.tenant, "fixtureTenant");
    assert.deepEqual(scoped.releaseRequest, {
      dataType: "init",
      releaseCodes: ["import:specialAccessGroups"],
      expectedReleases: { "import:specialAccessGroups": "0.0.1" },
    });
    operations.push(mode);
    return { data: { tenant: scoped.tenant } };
  };
  const owner = { ...service, error: (_, message) => Error(message), preflight: run("validate"), execute: run("install") };
  assert.deepEqual((await owner.setupSampleOperator(request, false)).data, { tenant: "fixtureTenant", enterpriseCode: "fixture" });
  await owner.setupSampleOperator(request, true);
  ready = false;
  await assert.rejects(owner.setupSampleOperator(request, true), /not ready/);
  ready = true;
  allowed = false;
  await assert.rejects(owner.setupSampleOperator(request, true), /denied/);
  allowed = true;
  request.httpRequest.body.tenant = "other";
  await assert.rejects(owner.setupSampleOperator(request, true), /exact enterprise/);
  assert.deepEqual(operations, ["validate", "install"]);
});
