/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module profile/test/businessAccessLevels @description Tests explicit owner mappings and fresh business presentation without live imports. @owner profile @layer test */
const test = require("node:test");
const assert = require("node:assert/strict");
const catalogueSource = require("../src/service/identity/defaultIdentityCatalogueService");
const managementSource = require("../src/service/enterprise/defaultEnterpriseManagementService");
const fixture = require("./helpers/identityCatalogueFixture");
const properties = require("../config/properties");
const catalogue = () => ({ ...catalogueSource, fail() { throw new Error("Invalid catalogue"); } });

test("owner-defined business levels are complete, unique and do not infer special roles", () => {
  const owner = catalogue(), roles = fixture.roles();
  const areas = owner.businessAreas(roles);
  assert.deepEqual(areas.map(area => area.code), ["content", "orders", "products", "promotions", "waste"]);
  for (const area of areas) {
    assert.equal(area.scopeType, "ENTERPRISE");
    assert.deepEqual(area.levels.map(level => level.value), ["view", "edit", "fullControl"]);
    for (const level of area.levels) assert.equal(roles[level.roleCode].ownerModule, area.ownerModule);
  }
  assert.ok(!areas.flatMap(area => area.levels).some(level => ["ENTERPRISE_ADMIN", "WASTE_APPROVER", "COMMERCE_REFUND_REVIEWER", "COMMERCE_SETUP_PUBLISHER"].includes(level.roleCode)));
  assert.deepEqual(owner.businessAreas({ mystery: { code: "read_update_admin", active: true, delegable: true, groupCodes: ["adminGroup"] } }), []);
});

test("partial metadata, conflicting owners, duplicate levels and administrator mappings reject", () => {
  const owner = catalogue(), role = fixture.roles().PRODUCT_VIEW;
  for (const change of [{ accessLevel: "approve" }, { ownerModule: "" }, { businessAreaLabel: "" }, { scopeType: "GLOBAL" }, { administrationClass: "ENTERPRISE_ADMIN" }])
    assert.throws(() => owner.businessAreas({ a: { ...role, ...change } }), /Invalid/);
  assert.throws(() => owner.businessAreas({ a: role, b: { ...role, code: "duplicate" } }), /Invalid/);
  assert.throws(() => owner.businessAreas({ a: role, b: { ...role, code: "edit", accessLevel: "edit", ownerModule: "other" } }), /Invalid/);
  const narrowed = { ...role, active: false };
  assert.deepEqual(owner.businessAreas({ narrowed }), []);
  assert.equal(owner.businessAreas({ custom: { ...role, businessArea: "product" } })[0].code, "product");
});

test("standard groups use known explicit permissions with no privileged ancestry or special authority", () => {
  const permissions = new Set(fixture.records("Permission").map(row => row.code));
  const groups = Object.fromEntries(fixture.records("UserGroup").concat(fixture.records("BusinessAccessGroup")).map(row => [row.code, row]));
  const forbidden = new Set(["*", "profile.enterpriseAccess.assign", "profile.enterprise.create", "commerce.promotion.approve", "commerce.refund.execute", "commerce.refund.exception.adjudicate", "waste.review.approve", "cms.publication.emergencyOverride", "documentation.approve", "documentation.publish", "publish.lifecycle.approve", "publish.lifecycle.activate", "loyalty.sampleCredit.apply", "import.sample.run"]);
  const expand = (code, seen = new Set()) => {
    assert.ok(groups[code], code);
    assert.ok(!["adminGroup", "platformAdministratorUserGroup", "axisViewerUserGroup"].includes(code), code);
    assert.ok(!seen.has(code));
    const group = groups[code];
    return [...(group.permissions || []), ...(group.parentGroups || []).flatMap(parent => expand(parent, new Set([...seen, code])))];
  };
  for (const role of fixture.records("BusinessAccessRole")) {
    for (const permission of role.groupCodes.flatMap(code => expand(code))) {
      assert.ok(permissions.has(permission), permission);
      assert.ok(!forbidden.has(permission), role.code + ": " + permission);
    }
    const group = groups[role.groupCodes[0]];
    if (role.accessLevel === "view") assert.ok(!group.permissions.some(code => ["commerce.product.publish", "commerce.promotion.manage", "commerce.coupon.seller.manage", "commerce.lifecycle.act", "documentation.draft.create", "documentation.draft.update", "cms.backoffice.manage", "waste.asset.create", "waste.marketplace.moderate"].includes(code)));
  }
});

test("workspace derives fresh area choices, clears legacy role options and preserves public registration", async () => {
  let roles = fixture.roles();
  global.CONFIG = { get: key => key === "enterpriseManagement" ? properties.enterpriseManagement : undefined };
  global.SERVICE = {
    DefaultIdentityCatalogueService: { ...catalogue(), roles: async () => structuredClone(roles) },
    DefaultEnterpriseRegistrationService: { workspace: () => ({ public: true }) },
  };
  const service = { ...managementSource, authorize: () => {}, error: message => new Error(message) };
  const first = await service.getAccessWorkspace({ authData: {} });
  const fields = first.tabs.flatMap(tab => tab.sections.flatMap(section => section.fields || []));
  const roleField = fields.find(field => field.name === "roleCode");
  assert.equal(roleField.type, "BUSINESS_ACCESS");
  assert.equal(roleField.options, undefined);
  assert.equal(roleField.businessAccess.businessAreas.length, 5);
  delete roles.PRODUCT_EDIT;
  const fresh = await service.getAccessWorkspace({ authData: {} });
  assert.deepEqual(fresh.businessAccess.businessAreas.find(area => area.code === "products").levels.map(level => level.value), ["view", "fullControl"]);
  assert.deepEqual(await service.getAccessWorkspace({ publicOnly: true }), { public: true });
});
