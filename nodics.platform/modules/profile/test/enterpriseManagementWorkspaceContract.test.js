/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module profile/test/enterpriseManagementWorkspaceContract @description Exercises fresh management metadata with real Profile projection and declared catalogue ports; no provider or persisted writes. @owner profile @layer test */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const fixture = require("./helpers/identityCatalogueFixture");
const source = require("../src/service/enterprise/defaultEnterpriseManagementService");
const provider = require("../src/service/defaultProfileBackofficeCapabilityService");
const baseRoles = Object.fromEntries(Object.values(require("../data/init-v001/records/identity/profileEnterpriseRoleData")).map(role => [role.code, role]));

/** Supplies only role catalogue and effective properties; the actual workspace builder remains in use. */
function setup(t, records = structuredClone(baseRoles)) {
  const previous = Object.fromEntries(["CONFIG", "SERVICE", "CLASSES"].map(key => [key, global[key]]));
  t.after(() => Object.assign(global, previous));
  const properties = fixture.properties();
  global.CONFIG = { get: key => key === "defaultEnterprise" ? "platform" : key === "defaultTenant" ? "authority" : properties[key] };
  global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message || code); this.code = code; } } };
  const owner = { ...source };
  global.SERVICE = { DefaultIdentityCatalogueService: fixture.catalogue(() => records), DefaultEnterpriseManagementService: owner };
  const request = { tenant: "business-a", query: {}, authData: { tokenType: "access", principalType: "human", loginId: "owner@example.test", entCode: "business-a", userGroups: ["adminGroup"] } };
  return { owner, request, records, properties };
}

/** Selects the existing invitation form rather than matching unrelated schema fields. */
function invitation(workspace) {
  return workspace.tabs.flatMap(tab => tab.sections).find(section => section.id === "assign-user");
}

test("base-only management projects fresh named non-area responsibilities instead of an empty business selector", async t => {
  const f = setup(t);
  const first = await f.owner.getAccessWorkspace(f.request);
  const field = invitation(first).fields.find(value => value.name === "roleCode");
  assert.equal(field.type, "SELECT");
  assert.equal(field.label, f.properties.enterpriseManagement.businessAccessPresentation.advancedLabel);
  assert.deepEqual(field.options, Object.values(baseRoles).map(role => ({ value: role.code, label: role.label })));
  assert.equal(first.businessAccess, undefined, "do not advertise an ordinary employee editor without installed business areas");
  f.records.OPERATOR.label = "Current operator responsibility";
  f.records.VIEWER.delegable = false;
  const second = invitation(await f.owner.getAccessWorkspace(f.request)).fields.find(value => value.name === "roleCode");
  assert(second.options.some(value => value.label === "Current operator responsibility"));
  assert(!second.options.some(value => value.value === "VIEWER"));
  const scoped = await f.owner.getAccessWorkspace(f.request);
  assert.equal(invitation(scoped).fields.find(value => value.name === "enterpriseCode").defaultValue, "business-a");
});

test("installed ordinary areas keep their explicit business-area/level mapping", async t => {
  const f = setup(t);
  f.records.CONTENT_VIEW = { ...f.records.VIEWER, code: "CONTENT_VIEW", businessArea: "content", businessAreaLabel: "Content", ownerModule: "cms", accessLevel: "view" };
  const workspace = await f.owner.getAccessWorkspace(f.request);
  const field = invitation(workspace).fields.find(value => value.name === "roleCode");
  assert.equal(field.type, "BUSINESS_ACCESS");
  assert.deepEqual(field.businessAccess.businessAreas[0].levels, [{ value: "view", roleCode: "CONTENT_VIEW" }]);
  assert.equal(field.options, undefined);
  const additional = workspace.tabs.find(tab => tab.id === "additional-responsibilities");
  assert.equal(additional.label, f.properties.enterpriseManagement.businessAccessPresentation.advancedLabel);
  const form = additional.sections[0];
  assert.equal(form.id, "assign-additional-user");
  assert.deepEqual(form.endpoint, invitation(workspace).endpoint);
  const choices = form.fields.find(value => value.name === "roleCode");
  assert.equal(choices.type, "SELECT");
  assert.equal(choices.businessAccess, undefined);
  assert.deepEqual(choices.options, Object.values(baseRoles).map(role => ({ value: role.code, label: role.label })));
  assert.equal(form.fields.find(value => value.name === "enterpriseCode").defaultValue, "business-a");
});

test("uninitialized role choices refuse without returning static configuration choices", async t => {
  const f = setup(t, {});
  await assert.rejects(f.owner.getAccessWorkspace(f.request), { code: "ERR_PROFILE_ENTERPRISE_SETUP_NOT_READY" });
});

test("management capability registers an inert native task rather than an uninitialized form", t => {
  setup(t);
  const item = provider.getCapability().navigation.find(value => value.id === "enterprises");
  assert.equal(item.backendWorkspace.renderer, "axis.workspace.native");
  assert.equal(item.backendWorkspace.workspaceCode, "profile.enterpriseManagement");
  assert.equal(item.backendWorkspace.viewCode, "administration");
  assert.equal(item.backendWorkspace.contractVersion, 1);
  assert.equal(item.backendWorkspace.tabs, undefined);
  assert(item.requiredPermissions.includes("profile.enterprise.create"));
});

test("fresh native task is bound to the original enterprise and rejects selector/public aliases", async t => {
  const f = setup(t);
  const result = await f.owner.getManagementWorkspace(f.request);
  assert.equal(result.contractVersion, 1);
  assert.equal(result.kind, "ENTERPRISE_MANAGEMENT");
  assert.equal(result.enterpriseCode, "business-a");
  assert.equal(result.workspace.renderer, "axis.workspace.backend-operations");
  for (const extra of [{ query: { enterpriseCode: "other" } }, { publicOnly: true }, { authData: { ...f.request.authData, isSystem: true } }])
    await assert.rejects(f.owner.getManagementWorkspace({ ...f.request, ...extra }));
});

test("secured management HTTP uses the fresh facade, no-store and an independent public registration route", async t => {
  const f = setup(t), previousFacade = global.FACADE;
  t.after(() => { global.FACADE = previousFacade; });
  global.FACADE = { DefaultEnterpriseManagementFacade: require("../src/facade/enterprise/defaultEnterpriseManagementFacade") };
  const controller = require("../src/controller/enterprise/defaultEnterpriseManagementController");
  const headers = [];
  const result = await controller.getManagementWorkspace({ ...f.request, httpRequest: { query: {} },
    httpResponse: { setHeader: (key, value) => headers.push([key, value]) } });
  assert.equal(result.code, "SUC_PRFL_00000");
  assert.equal(result.data.enterpriseCode, "business-a");
  assert.deepEqual(headers, [["Cache-Control", "no-store"]]);
  const routes = require("../src/router/routers").profile.loadDefaults;
  const route = routes.getEnterpriseManagementWorkspace;
  assert.equal(route.secured, true);
  assert.equal(route.method, "GET");
  assert.equal(route.key, "/enterprises/workspace");
  assert.equal(route.permission, routes.searchEnterprises.permission);
  assert.deepEqual(route.accessGroups, routes.searchEnterprises.accessGroups);
  assert.equal(routes.getPreAssignedEnterpriseAccessWorkspace.secured, false);
  assert.equal(routes.getPreAssignedEnterpriseAccessWorkspace.operation, "getPublicAccessWorkspace");
});

test("scoped enterprise administrators see staff tasks without Platform-only creation", async t => {
  const f = setup(t);
  SERVICE.DefaultEnterpriseSetupContinuationService = { workspaceDescriptor: () => ({ available: true }) };
  const own = await f.owner.getAccessWorkspace(f.request);
  assert.equal(own.setupContinuation, undefined, "Platform-only setup controls must not be offered to a scoped administrator");
  assert(!own.tabs.flatMap(tab => tab.sections).some(section =>
    section.endpoint?.method === "POST" && section.endpoint.path === "/nodics/profile/v0/enterprises"));
  assert(own.tabs.flatMap(tab => tab.sections).some(section => section.id === "enterprise-list"));
  assert(invitation(own));
  const platform = await f.owner.getAccessWorkspace({ ...f.request, tenant: CONFIG.get("defaultTenant"),
    authData: { ...f.request.authData, authenticationMethod: "PASSWORD", entCode: CONFIG.get("defaultEnterprise") } });
  assert(platform.tabs.flatMap(tab => tab.sections).some(section =>
    section.endpoint?.method === "POST" && section.endpoint.path === "/nodics/profile/v0/enterprises"));
  assert.equal(platform.setupContinuation.available, true);
  const otherProof = await f.owner.getAccessWorkspace({ ...f.request, tenant: CONFIG.get("defaultTenant"),
    authData: { ...f.request.authData, authenticationMethod: "EXTERNAL", entCode: CONFIG.get("defaultEnterprise") } });
  assert.equal(otherProof.setupContinuation, undefined);
});

test("invitation commands reject an elapsed expiry before storage and admit an explicit future expiry", async t => {
  const f = setup(t); let writes = 0;
  f.owner.retrieveEnterpriseForAccess = async () => ({ enterprise: { code: "business-a" }, tenantCode: "business-a" });
  f.owner.findRegisteredAssignment = async () => undefined;
  f.owner.findActiveAssignment = async () => undefined;
  SERVICE.DefaultEnterpriseAccessAssignmentService = { save: async request => { writes++; return { result: request.model }; } };
  const request = { ...f.request, params: { enterpriseCode: "business-a" }, body: {
    email: "invited@example.test", roleCode: "OPERATOR", idempotencyKey: "expiry-command-example", expiresAt: new Date(Date.now() - 1000).toISOString(),
  } };
  await assert.rejects(f.owner.preAssignAccessOriginal(request), /expiry.*future/);
  assert.equal(writes, 0);
  const expiresAt = new Date(Date.now() + 120000).toISOString();
  const result = await f.owner.preAssignAccessOriginal({ ...request, body: { ...request.body, expiresAt } });
  assert.equal(writes, 1); assert.equal(result.status, "PENDING");
  assert.equal(new Date(result.expiresAt).toISOString(), expiresAt);
});
