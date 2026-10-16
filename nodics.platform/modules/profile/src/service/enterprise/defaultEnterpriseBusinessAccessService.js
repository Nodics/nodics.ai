/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const crypto = require("node:crypto");
const employeeWrites = new WeakMap();

/**
 * @module profile/service/enterprise/DefaultEnterpriseBusinessAccessService
 * @description Edits explicit business-area assignments through existing Employee and membership owners; no parallel permission store.
 * @layer service
 * @owner profile
 * @override Contribute area definitions through governed module data. Preserve exact enterprise placement, review, CAS, audit and session invalidation.
 */
module.exports = {
  /** Rejects without reflecting identity or credential material. */
  fail: function () { throw new CLASSES.NodicsError("ERR_PROFILE_TEAM_CONFLICT"); },
  /** Uses the existing Profile digest for exact review and private-write bindings. */
  digest: function (value) { return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex"); },
  /** Admits only fresh human administrators in their authenticated enterprise; never accepts a target partition from input. */
  context: async function (request) {
    const auth = request.authData || {}, m = SERVICE.DefaultEnterpriseMembershipService;
    if (auth.principalType !== "human" || auth.authenticationMethod !== "PASSWORD" || auth.isSystem || auth.runtimeScope || !auth.entCode) this.fail();
    await m.verifyAuthenticatedActor(request);
    m.permission(request, "profile.enterpriseAccess.assign");
    const target = await SERVICE.DefaultEnterpriseTeamAdministrationService.enterpriseForAccess(auth.entCode);
    if (target.enterprise.code !== auth.entCode || target.enterprise.active !== true || target.tenantCode !== auth.tenant) this.fail();
    const catalogue = SERVICE.DefaultIdentityCatalogueService;
    const roles = await catalogue.roles(), areas = catalogue.businessAreas(roles);
    // A group shared between areas would make area-specific removal ambiguous.
    const groupAreas = new Map();
    for (const area of areas) for (const level of area.levels) for (const group of roles[level.roleCode].groupCodes) {
      if (groupAreas.has(group) && groupAreas.get(group) !== area.code) this.fail();
      groupAreas.set(group, area.code);
    }
    if (groupAreas.size) {
      const groups = await m.groups(target.tenantCode, [...groupAreas.keys()]);
      const secured = SERVICE.DefaultSecuredRequestPipelineService;
      const inherited = secured.getEffectiveUserGroupCodes(groups);
      if (inherited.some(code => ["platformAdministratorUserGroup", "adminGroup", "runtimeConfigAdminUserGroup", "serviceAccountUserGroup"].includes(code)) ||
          secured.getHydratedGroupPermissions(groups).some(permission => permission.includes("*"))) this.fail();
    }
    return { ...target, roles, areas, groupAreas };
  },
  /** Reads through generated owners and refuses incomplete or unbounded inventories. */
  rows: async function (serviceName, request, tenant, query) {
    const prepared = SERVICE.DefaultEnterpriseMembershipService.base().prepareReadQuery(serviceName, tenant, query);
    const result = await SERVICE[serviceName].get({ tenant, authData: request.authData, query: prepared,
      options: { recursive: false, skipItemCache: true }, searchOptions: { pageSize: 101, pageNumber: 1 } });
    if (!/^SUC_/.test(result?.code || "") || result.error ||
        result.success !== undefined && result.success !== true ||
        result.acknowledged !== undefined && result.acknowledged !== true ||
        result.errors !== undefined && result.errors !== null && (!Array.isArray(result.errors) || result.errors.length) ||
        !Array.isArray(result.result) || result.result.length > 100 || result.count !== result.result.length) this.fail();
    return result.result;
  },
  /** Resolves current native employees and accepted membership projections without leaking canonical identity locators. */
  inventory: async function (request, context) {
    const m = SERVICE.DefaultEnterpriseMembershipService, code = context.enterprise.code;
    const assignments = await this.rows("DefaultEnterpriseAccessAssignmentService", request, m.authority(),
      { enterpriseCode: code, tenantCode: context.tenantCode, status: "REGISTERED", active: true });
    const people = await this.rows("DefaultEmployeeService", request, context.tenantCode, {
      principalType: "human", active: true, $or: [
        { "metadata.enterpriseCode": code }, { enterpriseCode: code },
        { registrationAssignmentCode: { $in: assignments.map(item => item.code) } },
        { _id: { $in: assignments.filter(item => item.membership?.phase === "COMPLETE").map(item =>
          m.recordId(item.membership.projectionId)) } },
      ],
    });
    const seen = new Set();
    return people.filter(person => !person.disabled && !person.registrationSuspended).map(person => {
      if (!person.code || seen.has(person.code) || person.active !== true ||
          !person._id || person.principalType !== "human") this.fail();
      seen.add(person.code);
      const linked = assignments.filter(item => item.membership?.phase === "COMPLETE" &&
        String(item.membership.projectionId) === String(person._id));
      if (linked.length > 1 || person.authenticationIdentity && linked.length !== 1) this.fail();
      const assignment = linked[0];
      if (assignment) m.policy();
      const declared = person.metadata?.enterpriseCode || person.enterpriseCode;
      if (declared && declared !== code || person.metadata?.enterpriseCode && person.enterpriseCode &&
          person.metadata.enterpriseCode !== person.enterpriseCode) this.fail();
      if (!assignment && !declared && !assignments.some(item => item.code === person.registrationAssignmentCode)) this.fail();
      const groupCodes = assignment ? this.membershipGroups(assignment) : person.userGroups;
      if (!Array.isArray(groupCodes) || groupCodes.some(group => typeof group !== "string") || new Set(groupCodes).size !== groupCodes.length) this.fail();
      return { person, assignment, groupCodes };
    });
  },
  /** Returns current membership groups while retaining immutable original invitation and registration fields. */
  membershipGroups: function (item) {
    const access = item.membership?.businessAccess;
    if (!access) return item.groupCodes;
    if (access.version !== 1 || !Array.isArray(access.groupCodes) || !access.groupCodes.length ||
        access.groupCodes.length > 100 || access.groupCodes.some(code => typeof code !== "string" || !code) ||
        new Set(access.groupCodes).size !== access.groupCodes.length ||
        !/^[A-Za-z0-9_-]{16,128}$/.test(access.operationId || "")) this.fail();
    return access.groupCodes;
  },
  /** Projects exact area assignments, distinguishing retained advanced groups from ordinary level choices. */
  projection: function (target, context) {
    const selections = context.areas.map(area => {
      const matching = area.levels.filter(level => context.roles[level.roleCode].groupCodes.every(group => target.groupCodes.includes(group)));
      if (matching.length > 1) this.fail();
      return { businessArea: area.code, accessLevel: matching[0]?.value || "noAccess" };
    });
    return { employeeCode: target.person.code, loginId: target.person.loginId,
      name: typeof target.person.name === "string" ? target.person.name :
        [target.person.name?.firstName, target.person.name?.lastName].filter(Boolean).join(" ") || target.person.loginId,
      ...(target.assignment ? { assignmentCode: target.assignment.code } : {}), selections,
      otherGroupCodes: target.groupCodes.filter(code => !context.groupAreas.has(code)),
      reviewFingerprint: this.digest({ person: target.person, assignment: target.assignment,
        groups: target.groupCodes, roles: context.roles, enterprise: context.enterprise, tenant: context.tenantCode }) };
  },
  /** Returns the bounded employee editor with inert persisted role choices; query selectors are not authority. */
  workspace: async function (request) {
    if (Object.keys(request.query || {}).length) this.fail();
    const context = await this.context(request), targets = await this.inventory(request, context);
    return { contractVersion: 1, enterpriseCode: context.enterprise.code,
      businessAccess: { contractVersion: 1, businessAreas: context.areas,
        presentation: CONFIG.get("enterpriseManagement").businessAccessPresentation },
      employees: targets.map(target => this.projection(target, context)) };
  },
  /** Validates an exact, bounded area-change command before persistence or an operation fence. */
  input: function (body) {
    if (!body || Object.getPrototypeOf(body) !== Object.prototype ||
        Object.keys(body).sort().join(",") !== "changes,employeeCode,operationId,reviewFingerprint" ||
        typeof body.employeeCode !== "string" || !body.employeeCode || body.employeeCode.length > 192 ||
        !/^[a-f0-9]{64}$/.test(body.reviewFingerprint || "") || !/^[A-Za-z0-9_-]{16,128}$/.test(body.operationId || "") ||
        !Array.isArray(body.changes) || !body.changes.length || body.changes.length > 100) this.fail();
    const seen = new Set();
    for (const change of body.changes) {
      if (!change || Object.getPrototypeOf(change) !== Object.prototype ||
          Object.keys(change).sort().join(",") !== "accessLevel,businessArea" ||
          typeof change.businessArea !== "string" || seen.has(change.businessArea) ||
          !["noAccess", "view", "edit", "fullControl"].includes(change.accessLevel)) this.fail();
      seen.add(change.businessArea);
    }
    return body;
  },
  /** Computes only explicitly selected level changes, preserving other areas and all advanced responsibilities. */
  nextGroups: function (target, context, changes) {
    let next = [...target.groupCodes];
    for (const change of changes) {
      const area = context.areas.find(item => item.code === change.businessArea);
      const level = area?.levels.find(item => item.value === change.accessLevel);
      if (!area || change.accessLevel !== "noAccess" && !level) this.fail();
      next = next.filter(group => context.groupAreas.get(group) !== area.code);
      if (level) next.push(...context.roles[level.roleCode].groupCodes);
    }
    return [...new Set(next.length ? next : ["employeeUserGroup"])];
  },
  /** Binds one native Employee group-only write; this never admits credentials, activation, enterprise or scope changes. */
  ownsEmployeeWrite: function (request) {
    const proof = employeeWrites.get(request);
    return Boolean(proof && request.model && Object.keys(request.model).every(key => ["userGroups", "authVersion"].includes(key)) &&
      proof === this.digest([request.tenant, request.authData, request.query, request.options, request.model.userGroups]));
  },
  /** Writes a security audit through nAuth and refuses an unavailable audit owner. */
  audit: async function (request, input, outcome) {
    if (typeof SERVICE.DefaultAuthAuditService?.record !== "function" || !await SERVICE.DefaultAuthAuditService.record({
      eventType: "identity.business_access.change", tenant: request.tenant, entCode: request.authData.entCode,
      requestId: input.operationId, outcome, reasonCode: "BUSINESS_ACCESS_CHANGE",
      source: { owner: "DefaultEnterpriseBusinessAccessService", actorLoginId: request.authData.loginId,
        employeeCode: input.employeeCode, areas: input.changes.map(change => change.businessArea) },
    })) this.fail();
  },
  /** Applies one reviewed multi-area change using existing owner CAS and stamp hooks; uncertain results are never replayed automatically. */
  change: async function (request) {
    const input = this.input(request.body), context = await this.context(request);
    const previous = context.enterprise.teamOperation;
    if (previous?.id === input.operationId) {
      const team = SERVICE.DefaultEnterpriseTeamAdministrationService;
      if (previous.operation !== "BUSINESS_ACCESS" || !team.reviewedRecoveryOperation(context.enterprise) ||
          Object.keys(input).some(key => this.digest(input[key]) !== this.digest(previous.input[key]))) this.fail();
      const lease = await team.begin(request, "BUSINESS_ACCESS", previous.input, context.enterprise.code);
      if (lease.teamOperation.phase === "COMPLETE") {
        if (lease.teamOperation.outcome?.errorCode) this.fail();
        return team.outcome(lease.teamOperation.outcome);
      }
      const current = await team.assignment(previous.input.assignmentCode);
      if (!team.committedRecoveryMatches(lease, current.item, lease.teamOperation)) this.fail();
      const verified = await team.repairCommittedAssignment(request, lease, current.item);
      await this.audit(request, input, "SUCCESS");
      return team.finish(lease, { employeeCode: input.employeeCode, changed: true, revision: verified.item.revision });
    }
    const targets = await this.inventory(request, context), target = targets.find(item => item.person.code === input.employeeCode);
    if (!target || this.projection(target, context).reviewFingerprint !== input.reviewFingerprint) this.fail();
    const next = this.nextGroups(target, context, input.changes);
    await SERVICE.DefaultEnterpriseMembershipService.groups(context.tenantCode, next);
    if (this.digest(next) === this.digest(target.groupCodes)) return { employeeCode: target.person.code, changed: false };
    const fresh = await this.context(request);
    if (this.digest(fresh.roles) !== this.digest(context.roles) || this.digest(fresh.enterprise) !== this.digest(context.enterprise)) this.fail();
    await this.audit(request, input, "REQUESTED");
    if (target.assignment) {
      const team = SERVICE.DefaultEnterpriseTeamAdministrationService, m = SERVICE.DefaultEnterpriseMembershipService;
      const lease = await team.begin(request, "BUSINESS_ACCESS", { ...input, assignmentCode: target.assignment.code,
        revision: target.assignment.revision, nextGroupCodes: next }, context.enterprise.code);
      let current;
      try {
        current = await team.assignment(target.assignment.code);
        if (current.item.revision !== target.assignment.revision ||
            this.digest(current.item) !== this.digest(target.assignment)) this.fail();
        await m.administrator(request, context.enterprise.code);
      } catch (error) {
        await team.finish(lease, { errorCode: "ERR_PROFILE_TEAM_CONFLICT" });
        throw error;
      }
      const saved = await m.write(current.item, { membership: { ...current.item.membership,
        businessAccess: { version: 1, groupCodes: next, operationId: input.operationId }, lastTeamOperation: input.operationId } });
      await this.audit(request, input, "SUCCESS");
      return team.finish(lease, { employeeCode: target.person.code, changed: true, revision: saved.revision });
    }
    const person = target.person, retained = value => value === undefined ? { $exists: false } : value;
    await SERVICE.DefaultEnterpriseMembershipService.verifyAuthenticatedActor(request);
    SERVICE.DefaultEnterpriseMembershipService.permission(request, "profile.enterpriseAccess.assign");
    const command = { tenant: context.tenantCode, authData: request.authData,
      query: { _id: person._id, code: person.code, loginId: person.loginId, principalType: "human", active: true,
        password: person.password, userGroups: person.userGroups, authVersion: retained(person.authVersion),
        metadata: retained(person.metadata), enterpriseCode: retained(person.enterpriseCode),
        authenticationIdentity: retained(person.authenticationIdentity), registrationAssignmentCode: retained(person.registrationAssignmentCode),
        disabled: retained(person.disabled), registrationSuspended: retained(person.registrationSuspended) },
      model: { userGroups: next }, options: { returnModified: true, explain: false, snapshot: false } };
    // A last/default administrator's privileged groups remain byte-for-byte present.
    if (target.groupCodes.some(group => !context.groupAreas.has(group) && !next.includes(group))) this.fail();
    employeeWrites.set(command, this.digest([command.tenant, command.authData, command.query, command.options, command.model.userGroups]));
    let result;
    try { result = await SERVICE.DefaultEmployeeService.update(command); }
    finally { employeeWrites.delete(command); }
    if (!/^SUC_/.test(result?.code || "") ||
        result.success !== undefined && result.success !== true ||
        result.acknowledged !== undefined && result.acknowledged !== true || result.error ||
        result.errors !== undefined && (!Array.isArray(result.errors) || result.errors.length) ||
        result.result?.acknowledged !== true || result.result.matchedCount !== 1) this.fail();
    const checked = await this.rows("DefaultEmployeeService", request, context.tenantCode, { code: person.code, loginId: person.loginId });
    if (checked.length !== 1 || ["_id", "code", "loginId", "principalType", "active", "metadata", "enterpriseCode", "authenticationIdentity", "registrationAssignmentCode", "disabled", "registrationSuspended"].some(key =>
        this.digest(checked[0][key] ?? null) !== this.digest(person[key] ?? null)) || this.digest(checked[0].userGroups) !== this.digest(next) ||
        this.digest(checked[0].password ?? null) !== this.digest(person.password ?? null) || !Number.isSafeInteger(checked[0].authVersion) ||
        checked[0].authVersion <= Number(person.authVersion || 1)) this.fail();
    await this.audit(request, input, "SUCCESS");
    return { employeeCode: person.code, changed: true };
  },
};
