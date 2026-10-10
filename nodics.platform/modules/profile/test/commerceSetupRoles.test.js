/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module profile/test/commerceSetupRoles @description Proves explicit least-privilege setup roles against real group governance and permission owners without live effects. @layer test @owner profile */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");
const properties = require("../config/properties");
const manifest = require("../data/manifest.json");
const governance = require("../src/service/group/defaultUserGroupGovernanceService");
const auth = require("../../../../nodics.foundation/modules/nAuth/config/properties");
const security = require("../../../../nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService");
global.CONFIG = { get: () => undefined };
global.UTILS = { isObject: () => false };
const common = ["backoffice.application.initialization.view", "backoffice.application.initialization.initiate", "axis.view", "axis.dashboard.view", "backoffice.bootstrap.view"];
const fixtures = [
  {
    role: "COMMERCE_SETUP_PUBLISHER", section: "commerceSetupPublisherRole", prefix: "commerceSetupPublisher",
    permissions: ["publish.lifecycle.create", "publish.lifecycle.view", "publish.lifecycle.validate", "publish.lifecycle.requestApproval", "commerce.product.publish", "commerce.product.read", "commerce.promotion.read", "profile.scope.read", ...common],
  },
  {
    role: "COMMERCE_COUPON_ISSUER", section: "commerceCouponIssuerRole", prefix: "commerceCouponIssuer",
    permissions: ["commerce.promotion.manage", "commerce.coupon.seller.manage", "commerce.promotion.read", "profile.scope.read", "import.sample.run", "import.release.view", "import.release.validate", ...common],
  },
];
const groups = fixtures.map(({ prefix }) => require(`../data/core-v001/records/groups/${prefix}GroupData`)[prefix]);
const invitation = Object.values(require("../src/router/routers").profile.loadDefaults)
  .find(item => item.key === "/enterprises/:enterpriseCode/access-assignments" && item.method === "POST");

for (const [index, fixture] of fixtures.entries()) {
  test(`${fixture.role} is an enterprise invitation role with exact reviewed grants`, t => {
    const group = groups[index], role = properties.enterpriseManagement.accessAssignments.roles[fixture.role];
    assert.deepEqual(role.groupCodes, index === 0 ? [group.code, "commercePublicationStarterUserGroup"] : [group.code]);
    assert.equal(role.scopeType, "ENTERPRISE");
    assert.equal(role.administrationClass, undefined);
    assert.equal(role.delegable, true);
    assert.deepEqual(role.assignmentPermissions, []);
    assert(invitation.requestBody.content["application/json"].schema.properties.roleCode.enum.includes(fixture.role));
    assert.equal(group.active, true);
    assert.deepEqual(group.parentGroups, ["employeeUserGroup"]);
    assert.deepEqual(group.permissions, fixture.permissions);
    t.mock.method(global.CONFIG, "get", key => key === "identityGovernance" ? auth.identityGovernance : undefined);
    t.mock.method(global.UTILS, "isObject", value => value !== null && typeof value === "object");
    governance.validatePermissions([group]);
    governance.validateGraph([group], [{ code: "userGroup", active: true }, { code: "employeeUserGroup", active: true, parentGroups: ["userGroup"] }]);
  });
  test(`${fixture.section} owns only its new group and immutable checksummed files`, () => {
    const release = manifest.sections[fixture.section];
    assert.equal(release.kind, "DATA_RELEASE");
    assert.equal(release.dataType, "core");
    assert.equal(release.version, "0.0.1");
    assert.equal(release.sourceRoot, "core-v001");
    assert.equal(release.destinationRole, "PLATFORM");
    assert.equal(release.selectionPolicy, "EXPLICIT");
    assert.equal(release.lifecycle, "REFERENCE");
    assert.equal(release.publicationPolicy, "NONE");
    assert.equal(release.removalPolicy, "RETAIN");
    const header = require(`../data/core-v001/headers/groups/${fixture.prefix}Header`);
    assert.deepEqual(Object.keys(header.profile), [fixture.prefix + "Group"]);
    assert.deepEqual(header.profile[fixture.prefix + "Group"], {
      options: { enabled: true, schemaName: "userGroup", operation: "saveAll", dataFilePrefix: fixture.prefix + "GroupData", userGroups: ["adminGroup"] }, query: { code: "$code" },
    });
    assert.deepEqual(Object.keys(release.files), [`core-v001/headers/groups/${fixture.prefix}Header.js`, `core-v001/records/groups/${fixture.prefix}GroupData.js`]);
    for (const [file, checksum] of Object.entries(release.files)) {
      assert.equal(createHash("sha256").update(fs.readFileSync(path.join(__dirname, "../data", file))).digest("hex"), checksum);
      for (const [section, other] of Object.entries(manifest.sections)) {
        if (section !== fixture.section) assert(!Object.hasOwn(other.files || other.generatedHashes || {}, file));
      }
    }
  });
}

test("separate responsibilities never grant approval, runtime administration, identity management or Core import", () => {
  for (const group of groups) {
    assert(!group.permissions.some(permission => /^(runtime\.|profile\.(?!scope\.read$))|approve|activate|reject|refund|redeem|reveal|import\.core\.run|import\.init\.run/.test(permission)));
    assert(!group.parentGroups.some(code => /admin|runtime|viewer/i.test(code)));
  }
  assert(!groups[0].permissions.includes("commerce.promotion.manage"));
  assert(!groups[0].permissions.includes("commerce.coupon.seller.manage"));
  assert(!groups[1].permissions.some(permission => permission.startsWith("publish.")));
  assert(!groups[1].permissions.includes("commerce.product.publish"));
});

test("real domain setup permissions match publisher grants without invented publish capabilities", () => {
  for (const domain of ["product", "pricing", "tax", "inventory", "promotion"]) {
    const owner = require(`../../../../nodics.commerce/modules/baseCommerce/modules/${domain}/config/properties`);
    assert(groups[0].permissions.includes(owner.publish.setup.permissions[domain]));
  }
});

test("real nImport route policy admits issuer release reads/validation without granting Core import", () => {
  const routers = require("../../../../nodics.foundation/modules/nData/nImport/import/src/router/routers");
  const routes = Object.values(routers.import).flatMap(category => Object.values(category));
  const issuer = groups[1].permissions;
  const policy = { ...security, getRouteActionAuthorizationConfig: () => ({ enabled: true, strict: true }), getGrantedPermissions: () => issuer };
  for (const permission of ["import.release.view", "import.release.validate"]) {
    const matching = routes.filter(route => route.permission === permission);
    assert(matching.length > 0);
    for (const router of matching) assert.equal(policy.hasRoutePermission({ router, authData: {} }), true);
  }
  assert.equal(policy.hasRoutePermission({ router: { permission: "import.core.run" }, authData: {} }), false);
});

test("role installation changes no Init payload, employee assignment or onboarding qualification", () => {
  assert.equal(properties.enterpriseManagement.registration.enabled, false);
  assert.equal(properties.enterpriseManagement.registration.inventoryQualified, false);
  assert.equal(properties.enterpriseManagement.registration.assignmentClaimIndexQualified, false);
  for (const [file, checksum] of Object.entries(manifest.sections["init-v001"].files))
    assert.equal(createHash("sha256").update(fs.readFileSync(path.join(__dirname, "../data", file))).digest("hex"), checksum);
});

test("canonical activation registration keeps both packs optional and nImport selects only their own files", () => {
  const registration = require("../../../../nodics.foundation/modules/nService/src/service/module/defaultModuleRegistrationAgentService");
  const release = require("../../../../nodics.foundation/modules/nData/nImport/import/src/service/release/defaultDataReleaseService");
  const owner = { name: "profile", path: path.resolve(__dirname, "..") };
  const packages = registration.buildActivationDataPackages("profile", owner);
  for (const fixture of fixtures) {
    const item = packages.find(candidate => candidate.code === "profile:" + fixture.section);
    assert(item);
    assert.equal(item.required, false);
    assert.equal(item.trigger, "USER");
    assert.equal(item.dataType, "core");
    const files = release.currentReleaseFiles(owner, path.join(owner.path, "data"), "core-v001", manifest.sections[fixture.section].files, true);
    assert.deepEqual(files, manifest.sections[fixture.section].files);
  }
});

test("later-layer role narrowing reaches the existing Profile role resolver without changing source defaults", t => {
  const management = require("../src/service/enterprise/defaultEnterpriseManagementService");
  const roles = properties.enterpriseManagement.accessAssignments.roles;
  const narrowed = { ...roles, COMMERCE_COUPON_ISSUER: { ...roles.COMMERCE_COUPON_ISSUER, delegable: false } };
  t.mock.method(global.CONFIG, "get", key => key === "enterpriseManagement" ? { ...properties.enterpriseManagement, accessAssignments: { ...properties.enterpriseManagement.accessAssignments, roles: narrowed } } : undefined);
  assert.equal(management.rolePolicy("COMMERCE_COUPON_ISSUER").delegable, false);
  assert.deepEqual(management.rolePolicy("COMMERCE_SETUP_PUBLISHER").groupCodes, [groups[0].code, "commercePublicationStarterUserGroup"]);
  assert.equal(roles.COMMERCE_COUPON_ISSUER.delegable, true);
  assert.deepEqual(narrowed.COMMERCE_COUPON_ISSUER.groupCodes, roles.COMMERCE_COUPON_ISSUER.groupCodes);
});

test("documented Employee HTTP PATCH uses plain fields and the real generated model guard rejects service operators", t => {
  const utility = require("../../../../nodics.foundation/modules/nDatabase/database/src/service/schema/defaultSchemaUtilityService");
  const previousEnums = global.ENUMS;
  t.after(() => { global.ENUMS = previousEnums; });
  const Enum = require("../../../../nodics.foundation/modules/nConfig/bin/enum");
  const contactType = require("../src/utils/enums").ContactType;
  global.ENUMS = { ...previousEnums, ContactType: new Enum(contactType.definition, contactType._options) };
  const schemas = require("../src/schemas/schemas").profile;
  const schema = {
    ...schemas.employee,
    definition: { ...schemas.user.definition, ...schemas.employee.definition },
    refSchema: { ...schemas.user.refSchema, ...schemas.employee.refSchema },
  };
  const owner = {
    ...utility,
    resolveSchemaModule: moduleName => {
      assert.equal(moduleName, "profile");
      return { moduleName, moduleObject: { rawSchema: { employee: schema } } };
    },
  };
  const previousClasses = global.CLASSES;
  t.after(() => { global.CLASSES = previousClasses; });
  global.CLASSES = { NodicsError: class extends Error {
    constructor(code, message) { super(message); this.code = code; }
  } };
  const guide = fs.readFileSync(path.join(__dirname, "../llm/contracts/commerce-setup-roles.md"), "utf8");
  const example = guide.match(/```json\s*\n([\s\S]*?)\n\s*```/);
  assert(example, "Employee PATCH must retain a parseable JSON example");
  const body = JSON.parse(example[1]), original = structuredClone(body);
  assert.deepEqual(body.query, { code: "employee-code", loginId: "immutable-login", userGroups: ["original-group"] });
  const request = { moduleName: "profile", tenant: "testTenant", authData: { principalType: "human" } };
  assert.deepEqual(owner.buildGeneratedMutationModel(body.model, request, "employee"), {
    userGroups: ["original-group", "commerceSetupPublisherUserGroup", "commercePublicationStarterUserGroup"],
  });
  assert.deepEqual(body, original);
  for (const model of [{ $set: body.model }, { "userGroups.0": groups[0].code }]) {
    assert.throws(() => owner.buildGeneratedMutationModel(model, request, "employee"), error =>
      error.code === "ERR_DBS_00003" && error.message === "Schema HTTP mutation models require plain fields");
  }
});
