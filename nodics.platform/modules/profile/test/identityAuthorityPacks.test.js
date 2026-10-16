/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module profile/test/identityAuthorityPacks @description Verifies canonical data ownership, pinned import order and absence of configuration authority without importing data. @owner profile @layer test */
"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "../../../..");
const modules = new Map();
function discover(directory) {
  const packagePath = path.join(directory, "package.json");
  if (fs.existsSync(packagePath)) {
    const metadata = JSON.parse(fs.readFileSync(packagePath));
    modules.set(metadata.name, { ...metadata, path: directory });
  }
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith(".") ||
        ["node_modules", "data", "src", "test", "llm", "config", "scripts", "coverage"].includes(entry.name)) continue;
    discover(path.join(directory, entry.name));
  }
}
for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
  if (entry.isDirectory() && entry.name.startsWith("nodics.")) discover(path.join(root, entry.name));
}
const sections = new Map();
for (const [name, owner] of modules) {
  const file = path.join(owner.path, "data/manifest.json");
  if (!fs.existsSync(file)) continue;
  const manifest = JSON.parse(fs.readFileSync(file));
  for (const code of ["permissionCatalogue", "accessGroups", "enterpriseRoles", "businessAccessGroups", "businessAccessRoles"]) {
    if (manifest.sections?.[code]) sections.set(name + ":" + code, { owner, section: manifest.sections[code] });
  }
}
const digest = value => crypto.createHash("sha256").update(value).digest("hex");
function checksum(section) {
  return digest(Object.keys(section.files).sort().map(file => file + ":" + section.files[file]).join("|") +
    (section.prerequisites?.length ? "|prerequisites:" + JSON.stringify(section.prerequisites) : ""));
}
test("owner identity packs are explicit, portable, byte-pinned and Profile administered", () => {
  assert(sections.size >= 74, "all original owner contributions remain available");
  const permissionCodes = new Set(), groupCodes = new Set(), roleCodes = new Set();
  for (const [code, { owner, section }] of sections) {
    assert.equal(section.owningDomain, owner.name, code);
    assert.equal(section.dataType, "init", code);
    assert.equal(section.sourceRoot, "init-v001", code);
    assert.equal(section.destinationRole, "PLATFORM", code);
    assert.equal(section.selectionPolicy, "EXPLICIT", code);
    assert.deepEqual(section.environmentScope, ["ALL"], code);
    assert.equal(["group", "framework"].includes(owner.nodics?.kind), false, code);
    assert(owner.nodics?.owns?.includes("data"), code);
    for (const [relative, hash] of Object.entries(section.files)) {
      const file = path.join(owner.path, "data", relative);
      assert.equal(digest(fs.readFileSync(file)), hash, file);
      const data = require(file);
      if (relative.includes("/headers/")) {
        assert.deepEqual(Object.keys(data), ["profile"]);
        for (const header of Object.values(data.profile)) assert.equal(header.options.operation, "ensureReferenceAll");
      } else if (code.endsWith(":permissionCatalogue")) {
        for (const permission of Object.values(data)) {
          assert.equal(permission.ownerModule, owner.name);
          assert(!permissionCodes.has(permission.code), permission.code);
          permissionCodes.add(permission.code);
        }
      } else {
        const codes = /:(accessGroups|businessAccessGroups)$/.test(code) ? groupCodes : roleCodes;
        for (const record of Object.values(data)) {
          assert(!codes.has(record.code), "Duplicate identity definition: " + code + ":" + record.code);
          codes.add(record.code);
          if (record.ownerModule !== undefined) assert.equal(record.ownerModule, owner.name, record.code);
        }
      }
    }
  }
  assert(permissionCodes.size >= 352, "existing permission vocabulary must not disappear during access simplification");
  const listingOwner = sections.get("eWaste:permissionCatalogue");
  const listingRecords = require(path.join(listingOwner.owner.path,
    "data/init-v001/records/identity/eWastePermissionData.js"));
  assert.deepEqual(Object.values(listingRecords).map(row => row.code), ["waste.asset.listing.intent.read"]);
});
test("prerequisite graph is acyclic and every reference pins the exact owner bytes", () => {
  const visiting = new Set(), visited = new Set();
  const visit = code => {
    assert(sections.has(code), code);
    assert(!visiting.has(code), "cycle: " + code);
    if (visited.has(code)) return;
    visiting.add(code);
    const { section } = sections.get(code);
    for (const ref of section.prerequisites || []) {
      const target = ref.moduleName + ":" + ref.sectionCode;
      assert.equal(ref.partition, ["permissionCatalogue", "enterpriseRoles", "businessAccessRoles"].includes(ref.sectionCode) ? "DEFAULT" : undefined,
        "Global definitions require explicit default-partition references; groups remain tenant-local: " + target);
      visit(target);
      assert.equal(ref.version, sections.get(target).section.version, target);
      assert.equal(ref.checksum, checksum(sections.get(target).section), target);
    }
    visiting.delete(code);
    visited.add(code);
  };
  for (const code of sections.keys()) visit(code);
  const init = JSON.parse(fs.readFileSync(path.join(modules.get("profile").path, "data/manifest.json"))).sections["init-v001"];
  assert.equal(init.version, "0.0.3", "changed installed source requires an explicit successor, not rehashed history");
  assert.deepEqual(new Set(init.prerequisites.map(ref => ref.moduleName + ":" + ref.sectionCode)), new Set(sections.keys()));
  for (const ref of init.prerequisites) {
    assert.equal(ref.checksum, checksum(sections.get(ref.moduleName + ":" + ref.sectionCode).section));
    assert.equal(ref.partition, ["permissionCatalogue", "enterpriseRoles", "businessAccessRoles"].includes(ref.sectionCode) ? "DEFAULT" : undefined);
  }
  assert(Object.keys(init.files).every(file => !file.includes("/records/groups/")));
});
test("properties no longer own permission vocabulary, business groups or assignable roles", () => {
  const auth = require(path.join(root, "nodics.foundation/modules/nAuth/config/properties"));
  assert.equal(auth.identityGovernance.permissionCatalog, undefined);
  for (const key of ["groupTargets", "servicePrincipalScopes", "runtimeDeploymentGrantPermissions",
    "servicePrincipalCodes", "administratorCodes", "administratorGroups", "serviceGroup",
    "humanDefaultGroup", "customerGroup", "reconcileMissingGroupsOnStartup"]) {
    assert.equal(auth.identityGovernance.migration[key], undefined, key);
  }
  for (const name of ["profile", "wasteCore"]) {
    const configuration = require(path.join(modules.get(name).path, "config/properties"));
    assert.equal(configuration.enterpriseManagement?.accessAssignments?.roles, undefined, name);
  }
});
