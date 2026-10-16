/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module profile/service/identity/DefaultIdentityCatalogueGovernanceService
 * @description Governs generated permission and role CRUD without creating another assignment authority.
 * @layer service
 * @owner profile
 * @override Preserve fresh authority reads, reference validation and existing principal-stamp propagation.
 */
const mutations = new WeakMap();
const privateReads = new WeakSet();
const referenceCreates = new WeakSet();
module.exports = {
  /** Admits authority-partition administrative operations; enterprise-local administrators cannot edit shared roles. */
  authorize: async function (request) {
    const owner = SERVICE.DefaultIdentityCatalogueService;
    if (request.tenant !== owner.tenant()) owner.fail();
    if (privateReads.has(request) || referenceCreates.has(request)) return true;
    const auth = request.authData || {};
    const enterprise = CONFIG.get("defaultEnterprise") || "default";
    if (auth.principalType !== "human" || auth.isSystem || auth.authenticationMethod !== "PASSWORD" ||
        auth.tokenType !== "access" || auth.sessionContext !== undefined || auth.runtimeScope !== undefined ||
        auth.externalIdentityLinkCode !== undefined ||
        auth.tenant !== owner.tenant() || auth.entCode !== enterprise ||
        auth.enterpriseCode !== undefined && auth.enterpriseCode !== enterprise) owner.fail();
    const membership = SERVICE.DefaultEnterpriseMembershipService;
    await membership.verifyAuthenticatedActor(request);
    const person = await membership.read("DefaultEmployeeService", owner.tenant(), { loginId: auth.loginId });
    if (!person || person.active !== true || person.disabled === true || person.registrationSuspended === true ||
        person.principalType !== "human") owner.fail();
    SERVICE.DefaultPrincipalGovernanceService.assertPlatformPrincipal(person, {
      ...request, schemaModel: { schemaName: "employee" },
    });
    const directGroups = (person.userGroups || []).map(group => typeof group === "string" ? group : group?.code);
    if (!directGroups.some(code => ["platformAdministratorUserGroup", "adminGroup", "runtimeConfigAdminUserGroup"].includes(code))) owner.fail();
    const groups = await membership.groups(owner.tenant(), person.userGroups || []);
    const groupCodes = SERVICE.DefaultAuthenticationProviderService.resolveSessionUserGroups({ userGroups: groups });
    if (groupCodes.includes("serviceAccountUserGroup")) owner.fail();
    if (!SERVICE.DefaultEnterpriseManagementService.isPlatformAdministrator({
      ...auth, userGroups: groupCodes, allUserGroupCodes: [],
    })) owner.fail();
    return true;
  },
  /** Allows fixed internal catalogue reads without exposing a caller-controlled system bypass. */
  read: async function (service, request) {
    privateReads.add(request);
    try { return await service.get(request); } finally { privateReads.delete(request); }
  },
  /** Admits tenant-local groups only through the exact release capability; global definitions stay in the authority partition. */
  authorizeSeed: async function (request, service) {
    if (!request.tenant || request.tenant !== SERVICE.DefaultIdentityCatalogueService.tenant() &&
        (!SERVICE.DefaultUserGroupService || service !== SERVICE.DefaultUserGroupService)) SERVICE.DefaultIdentityCatalogueService.fail();
    const schemaName = service === SERVICE.DefaultUserGroupService ? "userGroup"
      : service === SERVICE.DefaultPermissionService ? "permission"
      : service === SERVICE.DefaultEnterpriseRoleService ? "enterpriseRole" : "principalScopeAssignment";
    const operation = schemaName === "principalScopeAssignment" ? "ensureDeploymentAll" : "ensureReferenceAll";
    if (SERVICE.DefaultDataReleaseService?.isIdentityAuthorityReleaseExecution?.(request.tenant, schemaName, operation) === true) return true;
    return this.authorize(request);
  },
  /** Restricts import authority to one insert-only generated create, never updates of installed records. */
  createReference: async function (service, request) {
    await this.authorizeSeed(request, service);
    if (request.options?.insertOnly !== true || request.query) SERVICE.DefaultIdentityCatalogueService.fail();
    referenceCreates.add(request);
    try { return await service.save(request); } finally { referenceCreates.delete(request); }
  },
  /** Allows only the held insert-only reference create or a freshly verified Platform operator to mutate groups. */
  authorizeGroupMutation: async function (request) {
    if (referenceCreates.has(request) && request.options?.insertOnly === true && !request.query) return true;
    return this.authorize(request);
  },
  /** Reads existing generated owner records, retaining complete inventory guarantees. */
  existing: async function (request) {
    const name = request.schemaModel?.schemaName;
    if (!["permission", "enterpriseRole"].includes(name)) SERVICE.DefaultIdentityCatalogueService.fail();
    const models = [].concat(request.model || []);
    const query = request.query || { code: { $in: models.map(model => model.code) } };
    return SERVICE.DefaultIdentityCatalogueService.rows(name === "permission" ? "DefaultPermissionService" : "DefaultEnterpriseRoleService", query);
  },
  /** Validates effective updates; unsupported operators and reference-code changes fail closed. */
  effective: function (existing, model) {
    const owner = SERVICE.DefaultIdentityCatalogueService;
    if (!model || typeof model !== "object" || Array.isArray(model) ||
        Object.keys(model).some(key => key.startsWith("$") && !["$set", "$unset"].includes(key))) owner.fail();
    for (const values of [model, model.$set || {}, model.$unset || {}])
      if (Object.keys(values).some(key => key.includes("."))) owner.fail();
    const next = { ...existing, ...Object.fromEntries(Object.entries(model).filter(([key]) => !key.startsWith("$"))), ...model.$set };
    Object.keys(model.$unset || {}).forEach(key => delete next[key]);
    if (existing && (next.code !== existing.code || next.ownerModule !== existing.ownerModule)) owner.fail();
    return next;
  },
  /** Validates role references against their existing persisted owners; permission creation needs no prior catalogue. */
  validateRecord: async function (name, record) {
    const owner = SERVICE.DefaultIdentityCatalogueService;
    owner.codes([record.code], false, name === "permission");
    if (typeof record.name !== "string" || !record.name.trim() || typeof record.active !== "boolean") owner.fail();
    if (name === "permission") {
      owner.codes([record.ownerModule], false);
      if (record.code === "*" && record.ownerModule !== "profile") owner.fail();
      return;
    }
    owner.codes(record.groupCodes, false);
    owner.businessMetadata(record);
    if (record.groupCodes.includes("platformAdministratorUserGroup")) owner.fail();
    owner.codes(record.assignmentPermissions);
    if (record.scopeType !== "ENTERPRISE" || typeof record.delegable !== "boolean" ||
        record.administrationClass !== undefined && record.administrationClass !== "ENTERPRISE_ADMIN") owner.fail();
    await owner.requirePermissions(record.assignmentPermissions);
    const groups = await owner.rows("DefaultUserGroupService", { code: { $in: record.groupCodes }, active: true });
    if (groups.length !== record.groupCodes.length || new Set(groups.map(row => row.code)).size !== groups.length ||
        groups.some(row => row.active !== true || !record.groupCodes.includes(row.code))) owner.fail();
  },
  /** Permission retirement cannot leave persisted groups, role requirements or service credential scopes dangling. */
  requireUnreferenced: async function (codes) {
    const owner = SERVICE.DefaultIdentityCatalogueService;
    if (!codes.length) return;
    for (const [name, field] of [["DefaultEnterpriseRoleService", "assignmentPermissions"]])
      if ((await owner.rows(name, { [field]: { $in: codes } })).length) owner.fail();
    const stamps = SERVICE.DefaultPrincipalSecurityStampGovernanceService;
    const tenants = await owner.rows("DefaultTenantService", {});
    const partitions = new Set([owner.tenant(), ...tenants.map(row => row.code)]);
    for (const tenant of partitions) {
      for (const [name, field] of [["DefaultUserGroupService", "permissions"], ["DefaultEmployeeService", "apiKeyScopes"], ["DefaultPrincipalScopeAssignmentService", "runtimeScope.permissions"]])
        if ((await stamps.inventory(SERVICE[name], tenant, { [field]: { $in: codes } })).length) owner.fail();
    }
  },
  /** Prepares complete old/new group targets before role mutation and stamps them through the existing owner. */
  prepare: async function (request, removing = false) {
    await this.authorize(request);
    const owner = SERVICE.DefaultIdentityCatalogueService, name = request.schemaModel.schemaName;
    const previous = await this.existing(request);
    const models = [].concat(request.model || []);
    const next = removing ? [] : previous.length
      ? previous.map(record => this.effective(record, models.find(model => model.code === record.code) || models[0]))
      : models.map(model => this.effective(undefined, model));
    for (const record of next) await this.validateRecord(name, record);
    if (name === "permission") {
      await this.requireUnreferenced(previous.filter(row => removing || next.find(item => item.code === row.code)?.active !== true).map(row => row.code));
      return true;
    }
    const groups = [...new Set(previous.concat(next).flatMap(row => row.groupCodes || []))];
    if (!previous.length) { mutations.set(request, []); return true; }
    if (!groups.length) SERVICE.DefaultIdentityCatalogueService.fail();
    const tenants = await owner.rows("DefaultTenantService", {});
    const targets = [...new Set([owner.tenant(), ...tenants.map(row => row.code)])].map(tenant => ({
      tenant, model: {}, affectedMembershipGroups: groups,
    }));
    mutations.set(request, targets);
    for (const target of targets) await SERVICE.DefaultPrincipalSecurityStampGovernanceService.invalidatePreparedGroupMembers(target);
    return true;
  },
  /** Generated save/update validation hook. */
  validate: function (request) { return this.prepare(request); },
  /** Generated removal validation hook. */
  remove: function (request) { return this.prepare(request, true); },
  /** Repeats existing stamp invalidation after committed role mutations to close transition issuance. */
  finalize: async function (request) {
    const targets = mutations.get(request);
    if (request.schemaModel?.schemaName === "enterpriseRole" && !targets && request.model) SERVICE.DefaultIdentityCatalogueService.fail();
    for (const target of targets || []) await SERVICE.DefaultPrincipalSecurityStampGovernanceService.invalidatePreparedGroupMembers(target);
    mutations.delete(request);
    return true;
  },
};
