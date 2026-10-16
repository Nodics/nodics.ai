/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module profile/test/identityCatalogueContract
 * @description Exercises persisted authority, generated governance and reference import without installed data.
 * @layer test @owner profile
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const catalogueSource = require("../src/service/identity/defaultIdentityCatalogueService");
const governanceSource = require("../src/service/identity/defaultIdentityCatalogueGovernanceService");
const stamps = require("../src/service/identity/defaultPrincipalSecurityStampGovernanceService");
const groups = require("../src/service/group/defaultUserGroupGovernanceService");
global.ENUMS = { ContactType: Object.fromEntries(["EMAIL", "PHONE", "FAX", "PAGER"].map(key => [key, { key }])) };
const schema = require("../src/schemas/schemas").profile;
const interceptors = require("../src/interceptors/interceptors");

test("owner-data fixtures discover the framework independently of the consuming checkout", () => {
  const { execFileSync } = require("node:child_process");
  const { tmpdir } = require("node:os");
  const helper = require.resolve("./helpers/identityCatalogueFixture");
  const expected = require(helper);
  const actual = JSON.parse(execFileSync(process.execPath, ["-e", `const fixture = require(${JSON.stringify(helper)}); process.stdout.write(JSON.stringify({ roles: fixture.roles(), permissions: fixture.records('Permission') }));`], { cwd: tmpdir(), encoding: "utf8" }));
  assert.ok(Object.keys(actual.roles).length > 0);
  assert.ok(actual.permissions.length > 0);
  assert.deepEqual(actual.roles, expected.roles());
  assert.deepEqual(actual.permissions, expected.records("Permission"));
});

/** Isolated generated-owner fixture; all reads retain real catalogue and inventory validation. */
function fixture() {
  const rows = { permission: [{ _id: "p1", code: "profile.read", name: "Read", ownerModule: "profile", active: true }],
    enterpriseRole: [{ _id: "r1", code: "VIEWER", name: "Viewer", active: true, groupCodes: ["viewer"], assignmentPermissions: [], scopeType: "ENTERPRISE", delegable: true }],
    userGroup: [{ _id: "g1", code: "viewer", active: true, permissions: ["profile.read"] }],
    tenant: [{ _id: "t1", code: "authority", active: true }, { _id: "t2", code: "business", active: true }],
    employee: [], principalScopeAssignment: [] };
  const reads = [], writes = [], invalidations = [];
  const state = { import: false, fresh: true, groups: ["adminGroup"] };
  global.CONFIG = { get: key => ({ defaultTenant: "authority", defaultEnterprise: "PLATFORM" })[key] };
  global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message || code); this.code = code; } } };
  global.UTILS = { isObject: value => value && typeof value === "object" };
  const catalogue = { ...catalogueSource }, governance = { ...governanceSource };
  const matches = (row, query) => Object.entries(query).every(([key, value]) => {
    const actual = key.split(".").reduce((item, field) => item?.[field], row);
    return value?.$in ? [].concat(actual ?? []).some(item => value.$in.includes(item)) : actual === value;
  });
  const makeOwner = name => ({
    get: async request => {
      reads.push({ name, ...request });
      if (["permission", "enterpriseRole"].includes(name)) await governance.authorize({ ...request });
      const selected = rows[name].filter(row => matches(row, request.query || {}));
      return { code: "SUC_DBS_00000", result: selected.map(row => structuredClone(row)), count: selected.length };
    },
    save: async request => {
      writes.push(request);
      assert.equal(request.options.insertOnly, true);
      if (state.beforeSave) state.beforeSave(name, request, rows);
      if (rows[name].some(row => row.code === request.model.code)) throw new Error("duplicate insert");
      rows[name].push({ _id: "new-" + request.model.code, ...structuredClone(request.model) });
      return { code: "SUC_DBS_00000", result: request.model };
    },
  });
  global.SERVICE = {
    DefaultIdentityCatalogueService: catalogue,
    DefaultIdentityCatalogueGovernanceService: governance,
    DefaultPrincipalGovernanceService: require("../src/service/identity/defaultPrincipalGovernanceService"),
    DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ isSystem: true }) },
    DefaultPrincipalSecurityStampGovernanceService: { ...stamps, invalidatePreparedGroupMembers: async request => { invalidations.push(structuredClone(request)); return true; } },
    DefaultEnterpriseManagementService: { isPlatformAdministrator: auth => auth.entCode === "PLATFORM" && auth.userGroups?.includes("adminGroup") },
    DefaultEnterpriseMembershipService: {
      verifyAuthenticatedActor: async () => { if (!state.fresh) throw new Error("stale actor"); },
      read: async () => ({ active: true, principalType: "human", userGroups: state.groups, ...state.person }),
      groups: async (tenant, values) => values,
    },
    DefaultAuthenticationProviderService: { resolveSessionUserGroups: person => person.userGroups },
    DefaultDataReleaseService: { isIdentityAuthorityReleaseExecution: tenant => state.import && tenant === (state.importTenant || "authority") },
  };
  for (const name of Object.keys(rows)) SERVICE["Default" + name[0].toUpperCase() + name.slice(1) + "Service"] = makeOwner(name);
  // Generated hooks receive the identical request object, as required by private admission.
  for (const name of ["permission", "enterpriseRole"]) {
    SERVICE["Default" + name[0].toUpperCase() + name.slice(1) + "Service"].get = async request => {
      reads.push({ name, ...request });
      await governance.authorize(request);
      const selected = rows[name].filter(row => matches(row, request.query || {}));
      return { code: "SUC_DBS_00000", result: selected.map(row => structuredClone(row)), count: selected.length };
    };
  }
  const request = { tenant: "authority", authData: { tenant: "authority", entCode: "PLATFORM", principalType: "human", authenticationMethod: "PASSWORD", tokenType: "access", loginId: "administrator", userGroups: ["adminGroup"] } };
  return { catalogue, governance, rows, reads, writes, invalidations, state, request };
}

test("schemas reuse generated administrative CRUD and hooks; groups remain the permission mapping owner", () => {
  for (const name of ["permission", "enterpriseRole"]) {
    assert.deepEqual(schema[name].schemaPolicies, ["administrative"]);
    assert.equal(schema[name].router.enabled, true);
    assert.equal(schema[name].backoffice.enabled, true);
    for (const event of ["preGet", "preSave", "preUpdate", "preRemove", "postSave", "postUpdate", "postRemove"])
      assert.ok(interceptors["identityCatalogue_" + name + "_" + event]);
  }
  assert.equal(schema.enterpriseRole.definition.permissions, undefined);
});
test("fresh permission reads see persisted revocation, ignore configuration and never confer a grant", async () => {
  const f = fixture();
  assert.equal((await f.catalogue.requirePermissions(["profile.read"])).length, 1);
  f.rows.permission[0].active = false;
  await assert.rejects(f.catalogue.requirePermissions(["profile.read"]));
  await assert.rejects(f.catalogue.requirePermissions(["unknown"]));
  assert.ok(f.reads.every(read => read.options.skipItemCache === true && read.tenant === "authority"));
  assert.equal(f.writes.length, 0);
});
test("missing, duplicate and failed catalogue evidence rejects without fallback", async () => {
  const f = fixture();
  f.rows.permission.push({ ...f.rows.permission[0], _id: "duplicate" });
  await assert.rejects(f.catalogue.requirePermissions(["profile.read"]));
  SERVICE.DefaultPermissionService.get = async () => ({ code: "ERR_FAILED", result: [], count: 0 });
  await assert.rejects(f.catalogue.requirePermissions(["profile.read"]));
});
test("fresh authority inventory refuses contradictory acknowledgement even with valid active rows", async () => {
  const f = fixture();
  for (const flag of [false, "false", "true", 0, null]) for (const field of ["acknowledged", "success"]) {
    SERVICE.DefaultPermissionService.get = async () => ({ code: "SUC_READ", count: 1,
      result: structuredClone(f.rows.permission), [field]: flag });
    await assert.rejects(f.catalogue.requirePermissions(["profile.read"]), /Incomplete security inventory/);
  }
  assert.equal(f.writes.length, 0);
});
test("roles resolve asynchronously from current records and inactive roles reject", async () => {
  const f = fixture();
  assert.equal((await f.catalogue.role("VIEWER")).label, "Viewer");
  f.rows.enterpriseRole[0].groupCodes = ["narrowed"];
  f.rows.userGroup.push({ _id: "g2", code: "narrowed", active: true });
  assert.deepEqual((await f.catalogue.role("VIEWER")).groupCodes, ["narrowed"]);
  f.rows.enterpriseRole[0].active = false;
  await assert.rejects(f.catalogue.role("VIEWER"));
});
test("registry management requires fresh human Platform authority, not tenant admin or claimed system", async () => {
  const f = fixture();
  await f.governance.authorize(f.request);
  for (const override of [{ entCode: "BUSINESS" }, { principalType: "service" }, { isSystem: true }, { tenant: "business" }])
    await assert.rejects(f.governance.authorize({ ...f.request, authData: { ...f.request.authData, ...override } }));
  f.state.groups = ["enterpriseAdministrator"];
  SERVICE.DefaultAuthenticationProviderService.resolveSessionUserGroups = () => ["enterpriseAdministrator", "adminGroup"];
  await assert.rejects(f.governance.authorize(f.request));
  f.state.groups = ["adminGroup"];
  f.state.fresh = false;
  await assert.rejects(f.governance.authorize(f.request), /stale actor/);
});
test("reference import preserves narrowed and inactive records and uses insert-only generated creation", async () => {
  const f = fixture();
  f.state.import = true;
  f.rows.permission[0].active = false;
  const request = { tenant: "authority", authData: { userGroups: ["adminGroup"] }, models: [
    { code: "profile.read", name: "Source", active: true, ownerModule: "profile" },
    { code: "profile.write", name: "Write", active: true, ownerModule: "profile" },
  ] };
  const result = await f.catalogue.ensureReferenceAll(SERVICE.DefaultPermissionService, request);
  assert.deepEqual(result, { result: [{ code: "profile.read" }, { code: "profile.write" }] });
  assert.equal(f.rows.permission[0].active, false);
  assert.equal(f.rows.permission[0].name, "Read");
  assert.equal(f.writes.length, 1);
  assert.equal(f.writes[0].options.insertOnly, true);
});
test("shared group mutations require native Platform authority even for a default-partition enterprise administrator", async () => {
  const f = fixture();
  const request = { ...f.request, model: { code: "viewer", permissions: [] } };
  for (const method of ["authorize", "authorizeGroupMutation"]) {
    await f.governance[method](request);
    for (const claims of [{ sessionContext: { owner: "profile", code: "linked", version: 1 } },
      { runtimeScope: {} }, { externalIdentityLinkCode: "external-link" }, { enterpriseCode: "BUSINESS" }, { tokenType: "refresh" }])
      await assert.rejects(f.governance[method]({ ...request, authData: { ...request.authData, ...claims } }));
    for (const person of [{ authenticationIdentity: { recordId: "canonical" } },
      { registrationAssignmentCode: "enterprise-invite" }, { enterpriseCode: "BUSINESS" },
      { metadata: { enterpriseCode: "BUSINESS" } }, { apiKeyHash: "service-proof" },
      { identityLinkRetirement: true }, { disabled: true }, { registrationSuspended: true }]) {
      f.state.person = person;
      await assert.rejects(f.governance[method](request));
    }
    f.state.person = {};
    f.state.groups = ["adminGroup", "serviceAccountUserGroup"];
    await assert.rejects(f.governance[method](request));
    f.state.groups = ["adminGroup"];
  }
  assert.equal(f.writes.length, 0);
});
test("reference seed refuses failed or malformed acknowledgements before writes or success receipts", async () => {
  for (const flag of [false, "false", "true", 0, null]) {
    const f = fixture(); f.state.import = true;
    const request = { ...f.request, models: [{ code: "profile.write", name: "Write", active: true, ownerModule: "profile" }] };
    const service = SERVICE.DefaultPermissionService, get = service.get, save = service.save;
    for (const field of ["acknowledged", "success"]) {
      service.get = async () => ({ code: "SUC_READ", count: 0, result: [], [field]: flag });
      await assert.rejects(f.catalogue.ensureReferenceAll(service, request));
      assert.equal(f.writes.length, 0);
    }
    service.get = get;
    for (const outcome of [{ acknowledged: flag }, { success: flag }, { result: { acknowledged: flag } }]) {
      let attempts = 0;
      service.save = async () => { attempts++; return { code: "SUC_SAVE", ...outcome }; };
      await assert.rejects(f.catalogue.ensureReferenceAll(service, request));
      assert.equal(attempts, 1, "uncertain writes are not retried");
    }
    service.save = save;
  }
});
test("concurrent import winner is preserved and uncertain creation is not retried", async () => {
  const f = fixture();
  f.state.import = true;
  f.state.beforeSave = (name, request, rows) => rows[name].push({ _id: "winner", ...request.model, name: "Axis decision", active: false });
  await assert.rejects(f.catalogue.ensureReferenceAll(SERVICE.DefaultPermissionService, { ...f.request,
    models: [{ code: "profile.write", name: "Seed", active: true, ownerModule: "profile" }] }), /duplicate insert/);
  assert.equal(f.writes.length, 1);
  assert.equal(f.rows.permission.find(row => row.code === "profile.write").name, "Axis decision");
});
test("header groups alone cannot authorize reference import outside private owner execution", async () => {
  const f = fixture();
  await assert.rejects(f.catalogue.ensureReferenceAll(SERVICE.DefaultPermissionService, {
    tenant: "authority", authData: { userGroups: ["adminGroup"] }, models: [],
  }));
});
test("tenant-local reference groups require exact private release scope while catalogue definitions remain global", async () => {
  const f = fixture();
  f.state.import = true; f.state.importTenant = "business";
  const request = { tenant: "business", authData: { userGroups: ["adminGroup"] }, models: [
    { code: "tenantViewer", name: "Tenant viewer", active: true, permissions: ["profile.read"] },
  ] };
  await f.catalogue.ensureReferenceAll(SERVICE.DefaultUserGroupService, request);
  assert.equal(f.writes.length, 1);
  assert.equal(f.writes[0].tenant, "business");
  assert.equal(f.writes[0].options.insertOnly, true);
  f.rows.userGroup.find(row => row.code === "tenantViewer").active = false;
  await f.catalogue.ensureReferenceAll(SERVICE.DefaultUserGroupService, request);
  assert.equal(f.writes.length, 1);
  assert.equal(f.rows.userGroup.find(row => row.code === "tenantViewer").active, false);
  for (const owner of [SERVICE.DefaultPermissionService, SERVICE.DefaultEnterpriseRoleService])
    await assert.rejects(f.catalogue.ensureReferenceAll(owner, request));
  await assert.rejects(f.catalogue.ensureReferenceAll({ ...SERVICE.DefaultUserGroupService }, request));
  await assert.rejects(f.catalogue.ensureReferenceAll(SERVICE.DefaultUserGroupService, { ...request, tenant: "other" }));
  f.state.import = false;
  await assert.rejects(f.catalogue.ensureReferenceAll(SERVICE.DefaultUserGroupService, request));
  assert.equal(f.writes.length, 1);
});
test("group validation awaits catalogue and rejects hidden update operators", async () => {
  fixture();
  await groups.validatePermissions([{ permissions: ["profile.read"] }]);
  await assert.rejects(groups.validatePermissions([{ permissions: ["unknown"] }]));
  assert.throws(() => groups.applyUpdate({ code: "viewer" }, { $push: { permissions: "unknown" } }));
});
test("insert-only reference persistence selects the generated atomic insertion path", async () => {
  fixture();
  const source = require("../../../../nodics.foundation/modules/nDatabase/database/src/service/procs/save/defaultModelSaveInitializerService");
  let inserts = 0;
  const owner = { ...source, insertModel: async request => { inserts++; return request.model; }, resolveSaveMethod: () => { throw new Error("upsert path forbidden"); } };
  assert.deepEqual(await owner.persistModel({ options: { insertOnly: true }, model: { code: "new" } }), { code: "new" });
  assert.equal(inserts, 1);
});
test("permission retirement is held while referenced; it is not a backdoor runtime-grant revocation", async () => {
  const f = fixture();
  await assert.rejects(f.governance.validate({ ...f.request, schemaModel: { schemaName: "permission" }, query: { code: "profile.read" }, model: { active: false } }));
  assert.equal(f.invalidations.length, 0);
});
test("role edits stamp old and new group holders before and after persistence without assigning groups", async () => {
  const f = fixture();
  f.rows.userGroup.push({ _id: "g2", code: "other", active: true });
  const request = { ...f.request, schemaModel: { schemaName: "enterpriseRole" }, query: { code: "VIEWER" }, model: { groupCodes: ["other"] } };
  await f.governance.validate(request);
  assert.equal(f.invalidations.length, 2);
  await f.governance.finalize(request);
  assert.equal(f.invalidations.length, 4);
  assert.deepEqual(f.invalidations[0].affectedMembershipGroups, ["viewer", "other"]);
  assert.equal(f.writes.length, 0);
});

/** Composes real release planning/execution and Profile hooks; only storage and import transport are offline ports. */
function releaseFixture(t, tenantGroupsOnly = false) {
  const fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto");
  const root = fs.mkdtempSync(path.join(require("node:os").tmpdir(), "profile-authority-release-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const f = fixture(), profileServices = SERVICE;
  f.rows.permission.length = 0; f.rows.enterpriseRole.length = 0; f.rows.userGroup.length = 0;
  const importRoot = "../../../../nodics.foundation/modules/nData/nImport/import";
  const modules = { profile: { name: "profile", path: root, index: "10" } };
  const releaseState = require(importRoot + "/test/helpers/releaseExecution")({ modules, runtimeRole: "PLATFORM" });
  Object.assign(SERVICE, profileServices, { DefaultDataReleaseService: releaseState.service });
  const originalGet = CONFIG.get;
  CONFIG.get = key => key === "defaultTenant" ? "authority" : key === "defaultEnterprise" ? "PLATFORM" : originalGet(key);
  const releaseOwner = releaseState.service;
  releaseOwner.configuration().types.init.operatorExecution = true;
  const manifest = { contractVersion: 2, module: "profile", sections: {} };
  const sourceRows = new Map(), order = [];
  const add = (sectionCode, schemaName, models, prerequisites, selectionPolicy = "EXPLICIT") => {
    const header = "init-v001/headers/" + sectionCode + "Header.js", records = "init-v001/records/" + sectionCode + "Data.js";
    const sources = {
      [header]: "module.exports = " + JSON.stringify({ profile: { [sectionCode]: { options: {
        enabled: true, schemaName, operation: "ensureReferenceAll", dataFilePrefix: sectionCode, userGroups: ["adminGroup"],
      }, query: { code: "$code" } } } }) + ";\n",
      [records]: "module.exports = " + JSON.stringify(Object.fromEntries(models.map((row, index) => ["record" + index, row]))) + ";\n",
    };
    for (const [file, bytes] of Object.entries(sources)) {
      fs.mkdirSync(path.dirname(path.join(root, "data", file)), { recursive: true });
      fs.writeFileSync(path.join(root, "data", file), bytes);
    }
    const section = manifest.sections[sectionCode] = { kind: "DATA_RELEASE", dataType: "init", sourceRoot: "init-v001",
      version: "0.0.2", selectionPolicy, owningDomain: "profile", lifecycle: "REFERENCE", destinationRole: "PLATFORM",
      environmentScope: ["ALL"], sensitivity: "INTERNAL", versioningPolicy: "NONE", publicationPolicy: "NONE",
      initialPublicationPolicy: "NONE", removalPolicy: "RETAIN", prerequisites,
      files: Object.fromEntries(Object.entries(sources).map(([file, bytes]) => [file, crypto.createHash("sha256").update(bytes).digest("hex")])) };
    fs.writeFileSync(path.join(root, "data/manifest.json"), JSON.stringify(manifest));
    sourceRows.set(sectionCode, { schemaName, models });
    const inspected = releaseOwner.inspectManifest(modules.profile, "init", path.join(root, "data/manifest.json"), section, sectionCode, true);
    return { moduleName: "profile", sectionCode, version: inspected.version, checksum: inspected.checksum };
  };
  if (tenantGroupsOnly) {
    f.rows.permission.push({ _id: "p1", code: "profile.read", name: "Read", ownerModule: "profile", active: true });
    add("accessGroups", "userGroup", [{ code: "viewer", name: "Viewer", active: true, permissions: ["profile.read"] }], [], "DEFAULT");
  } else {
    const permission = add("permissionCatalogue", "permission", [{ code: "profile.read", name: "Read", ownerModule: "profile", active: true }], []);
    const group = add("accessGroups", "userGroup", [{ code: "viewer", name: "Viewer", active: true, permissions: ["profile.read"] }], [permission]);
    add("enterpriseRoles", "enterpriseRole", [{ code: "VIEWER", name: "Viewer", active: true, groupCodes: ["viewer"],
      scopeType: "ENTERPRISE", delegable: true, assignmentPermissions: ["profile.read"] }], [group], "DEFAULT");
  }
  const persistence = require("../../../../nodics.foundation/modules/nDatabase/database/src/service/procs/save/defaultModelSaveInitializerService");
  for (const name of ["permission", "userGroup", "enterpriseRole"]) {
    const service = SERVICE["Default" + name[0].toUpperCase() + name.slice(1) + "Service"];
    service.ensureReferenceAll = async request => {
      assert.equal(releaseOwner.isIdentityAuthorityReleaseExecution(request.tenant, name, "ensureReferenceAll"), true);
      assert.equal(releaseOwner.isIdentityAuthorityReleaseExecution("foreign", name, "ensureReferenceAll"), false);
      assert.equal(releaseOwner.isIdentityAuthorityReleaseExecution(request.tenant, name, "saveAll"), false);
      for (const other of ["permission", "userGroup", "enterpriseRole"].filter(value => value !== name)) {
        const otherService = SERVICE["Default" + other[0].toUpperCase() + other.slice(1) + "Service"];
        await assert.rejects(f.governance.authorizeSeed(request, otherService));
      }
      return f.catalogue.ensureReferenceAll(service, request);
    };
    const save = service.save;
    service.save = async request => {
      request.schemaModel = { schemaName: name };
      if (name === "userGroup") await groups.validate(request); else await f.governance.validate(request);
      const result = await persistence.persistModel.call({ ...persistence, insertModel: save,
        resolveSaveMethod: () => { throw new Error("reference import must never upsert"); } }, request);
      if (name !== "userGroup") await f.governance.finalize(request);
      return result;
    };
  }
  SERVICE.DefaultImportService.importInitData = async request => {
    releaseState.imports.push(request);
    const release = request.dataReleasePlan.find(row => !row.sourceOnly);
    const source = sourceRows.get(release.sectionCode);
    assert.equal(releaseOwner.isIdentityAuthorityReleaseExecution(request.tenant), false);
    assert.equal(releaseOwner.isIdentityAuthorityReleaseExecution("foreign"), false);
    const operation = { tenant: request.tenant, authData: { userGroups: ["adminGroup"] }, models: structuredClone(source.models) };
    const service = SERVICE["Default" + source.schemaName[0].toUpperCase() + source.schemaName.slice(1) + "Service"];
    request.importRun = { runId: "offline-" + order.length };
    releaseOwner.bindOperationMetadataRun(request);
    const dispatch = require(importRoot + "/src/service/process/model/defaultModelImportProcessService");
    const result = await dispatch.executeAdmittedSchemaOperation({ tenant: request.tenant, importRun: request.importRun,
      header: { options: { moduleName: "profile", schemaName: source.schemaName, operation: "ensureReferenceAll", dataFilePrefix: release.sectionCode } },
    }, operation, service);
    assert.equal(releaseOwner.isIdentityAuthorityReleaseExecution(request.tenant), false);
    order.push(release.sectionCode);
    Object.assign(request.importRun, { status: "COMPLETED", summary: { recordsSucceeded: result.result.length, recordsFailed: 0 } });
    return result;
  };
  const request = { tenant: "authority", releaseRequest: { dataType: "init", releaseCodes: ["profile:enterpriseRoles"] } };
  return { ...f, ...releaseState, request, order, releaseOwner };
}

test("actual fresh Init execution supplies and expires catalogue admission through Profile hooks", async t => {
  const f = releaseFixture(t);
  assert.equal(f.releaseOwner.isIdentityAuthorityReleaseExecution("authority"), false);
  await f.releaseOwner.installStartupReleases({ tenant: "authority", modules: ["profile"] });
  assert.deepEqual(f.order, ["permissionCatalogue", "accessGroups", "enterpriseRoles"]);
  assert.equal(f.writes.length, 3);
  assert.ok(f.writes.every(row => row.options.insertOnly === true));
  assert.equal((await f.catalogue.role("VIEWER")).active, true);
  assert.equal(f.releaseOwner.isIdentityAuthorityReleaseExecution("authority"), false);
  const receipts = structuredClone(f.installations);
  await f.releaseOwner.installStartupReleases({ tenant: "authority", modules: ["profile"] });
  assert.deepEqual(f.installations, receipts);
  assert.equal(f.writes.length, 3);
});

test("actual operator-selected migration preserves inactive installed definitions and historical receipts", async t => {
  const f = releaseFixture(t);
  f.rows.permission.push({ _id: "p1", code: "profile.read", name: "Axis name", ownerModule: "profile", active: false });
  f.rows.userGroup.push({ _id: "g1", code: "viewer", name: "Axis group", active: false, permissions: [] });
  f.rows.enterpriseRole.push({ _id: "r1", code: "VIEWER", name: "Axis role", active: false, groupCodes: ["viewer"], assignmentPermissions: [], scopeType: "ENTERPRISE", delegable: false });
  const definitions = structuredClone(f.rows);
  const receipt = { code: "testEnvironment:authority:profile:legacy:init", tenant: "authority", environment: "testEnvironment",
    moduleName: "profile", releaseCode: "profile:legacy", dataType: "init", status: "CURRENT", version: "0.0.1", checksum: "1".repeat(64) };
  f.installations.push(receipt);
  await assert.rejects(f.releaseOwner.installStartupReleases({ tenant: "authority", modules: ["profile"] }), /operator-selected/);
  assert.equal(f.imports.length, 0);
  await f.releaseOwner.execute(f.request);
  assert.deepEqual(f.rows, definitions);
  assert.equal(f.writes.length, 0);
  assert.deepEqual(f.installations[0], receipt);
  assert.equal(f.releaseOwner.isIdentityAuthorityReleaseExecution("authority"), false);
});

test("actual tenant Init admits local groups but reads permission vocabulary only from the authority partition", async t => {
  const f = releaseFixture(t, true);
  await f.releaseOwner.installStartupReleases({ tenant: "business", modules: ["profile"] });
  assert.deepEqual(f.order, ["accessGroups"]);
  assert.equal(f.writes.length, 1);
  assert.equal(f.writes[0].tenant, "business");
  assert.ok(f.reads.some(read => read.name === "permission"));
  assert.ok(f.reads.filter(read => read.name === "permission").every(read => read.tenant === "authority"));
  assert.equal(f.releaseOwner.isIdentityAuthorityReleaseExecution("business", "userGroup", "ensureReferenceAll"), false);
});
