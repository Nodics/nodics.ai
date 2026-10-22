/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
const { isDeepStrictEqual: same } = require("node:util");

/** @module profile/service/identity/defaultProfileNotificationRecipientService @description Projects current opted-in Customer/authorized Employee inbox identities for already source-proven owners. Source wrappers retain private admission and domain proof; Communication retains its existing inbox and delivery authority. @layer service @owner profile @override Tighten selections without replacing canonical identity, persisted grants, scopes, preferences or source proof. */
module.exports = {
  /** Refuses without exposing private identity or authority diagnostics. */
  fail: function () { throw new CLASSES.NodicsError("ERR_AUTH_00003"); },
  /** Requires a canonical bounded identifier, not a contact or a destination selector. */
  identifier: function (value) {
    if (typeof value !== "string" || value !== value.trim() || !/^[A-Za-z0-9_.:@|-]{1,128}$/.test(value)) this.fail();
    return value;
  },
  /** Validates framework-defined selection properties; records, never properties, hold selected recipients. */
  policy: function (input) {
    const shared = CONFIG.get("profileNotificationRecipients");
    if (!shared || !Number.isSafeInteger(shared.maximumGroups) || shared.maximumGroups < 1 || shared.maximumGroups > 1000 ||
        !input || !Number.isSafeInteger(input.maximumRecipients) || input.maximumRecipients < 1 || input.maximumRecipients > 100 ||
        ![input.preferencesField, input.recipientsField].every(v => typeof v === "string" && v === v.trim() && /^[a-z][A-Za-z0-9]{1,127}$/.test(v)) ||
        !Array.isArray(input.capabilityCodes) || !input.capabilityCodes.length || input.capabilityCodes.length > 20 ||
        new Set(input.capabilityCodes).size !== input.capabilityCodes.length) this.fail();
    this.identifier(input.recipientPermission); input.capabilityCodes.forEach(v => this.identifier(v));
    return { ...structuredClone(input), maximumGroups: shared.maximumGroups };
  },
  /** Resolves generated records through Profile's existing private storage boundary without widening generic CRUD. */
  read: async function (service, tenant, code) {
    this.identifier(tenant); this.identifier(code);
    const row = await SERVICE.DefaultEnterpriseRegistrationService.read(service, tenant, { code });
    if (row && (row.code !== code || service !== "DefaultEnterpriseService" && row.tenant !== undefined && row.tenant !== tenant)) this.fail();
    return row;
  },
  /** Missing/inactive recipients are ineligible, never replaced with an actor, administrator or contact. */
  active: function (row) { return row?.active === true && row.disabled !== true && row.registrationSuspended !== true; },
  /** Reloads bounded group ancestry from the recipient partition and reuses existing graph/permission validation. */
  groups: async function (tenant, direct, p) {
    const catalogue = SERVICE.DefaultIdentityCatalogueService, groups = new Map();
    catalogue.codes(direct);
    let pending = [...direct];
    while (pending.length) {
      if (groups.size + pending.length > p.maximumGroups) this.fail();
      for (const code of pending) {
        const row = await this.read("DefaultUserGroupService", tenant, code);
        if (!this.active(row)) this.fail();
        catalogue.codes(row.parentGroups || []);
        groups.set(code, row);
      }
      pending = [...new Set([...groups.values()].flatMap(row => row.parentGroups || []))].filter(code => !groups.has(code));
    }
    const result = [...groups.values()];
    SERVICE.DefaultUserGroupGovernanceService.validateGraph(result, []);
    await SERVICE.DefaultUserGroupGovernanceService.validatePermissions(result);
    await catalogue.requirePermissions([p.recipientPermission]);
    return result;
  },
  /** Resolves native/linked Employee identity and accepted target membership read-only; never issues tokens or registers session stamps. */
  membershipGroups: async function (tenant, employee, enterpriseCode) {
    const member = SERVICE.DefaultEnterpriseMembershipService;
    const anchor = await member.resolve(employee, tenant, "EMPLOYEE");
    if (!anchor?.identity || !anchor.person || anchor.person.loginId !== employee.loginId) this.fail();
    const rows = await member.inventory("DefaultEnterpriseAccessAssignmentService", member.authority(), {
      enterpriseCode, "membership.identity.recordId": anchor.identity.recordId,
      "membership.identity.tenantCode": anchor.identity.tenantCode, "membership.identity.recordKind": anchor.identity.recordKind,
    });
    if (!Array.isArray(rows)) this.fail();
    if (!rows.length && !employee.authenticationIdentity) {
      if (!Array.isArray(employee.userGroups)) this.fail();
      return employee.userGroups.map(g => typeof g === "string" ? g : g?.code);
    }
    if (rows.length !== 1) this.fail();
    const { item } = await member.assignment(rows[0].code);
    if (item.status !== "REGISTERED" || item.active !== true || item.tenantCode !== tenant || item.enterpriseCode !== enterpriseCode ||
        item.membership?.phase !== "COMPLETE" || item.membership.projectionId !== member.recordId(employee._id) ||
        !same(item.membership.identity, anchor.identity) || item.membership.assignmentDigest !== member.base().assignmentDigest(item)) this.fail();
    if (item.invitationAuthority?.administrationConsent)
      await SERVICE.DefaultEnterpriseAdministrationConsentService.validateInvitation(item);
    return member.currentGroupCodes(item);
  },
  /** Requires current persisted permission grants AND matching effective allow scopes with independent deny precedence. */
  employeeAuthorized: async function (tenant, employee, enterpriseCode, p) {
    if (!this.active(employee) || employee.principalType !== "human" || employee[p.preferencesField]?.IN_APP !== true) return false;
    this.identifier(employee.code); this.identifier(employee.loginId);
    const direct = await this.membershipGroups(tenant, employee, enterpriseCode);
    const groups = await this.groups(tenant, direct, p);
    const router = SERVICE.DefaultSecuredRequestPipelineService;
    const permissions = [...new Set(groups.flatMap(g => g.permissions || []))];
    if (!router.isPermissionGranted(p.recipientPermission, permissions, router.getRouteActionAuthorizationConfig())) return false;
    // This is a local persisted-principal query, not a manufactured authenticated request or service identity.
    const effective = await SERVICE.DefaultPrincipalScopeGovernanceService.getEffectiveScopes({ tenant,
      authData: { principalType: "human", loginId: employee.loginId, code: employee.code, userGroups: groups.map(g => g.code) } });
    if (effective?.principalType !== "human" || effective.principalCode !== employee.loginId ||
        !Array.isArray(effective.scopes) || !Array.isArray(effective.deniedScopes)) this.fail();
    const matches = s => s && (!s.permissionCode || ["*", p.recipientPermission].includes(s.permissionCode)) &&
      (!s.capabilityCode || ["*", ...p.capabilityCodes].includes(s.capabilityCode)) &&
      (!s.tenantCode || s.tenantCode === tenant) && (!s.enterpriseCode || s.enterpriseCode === enterpriseCode) &&
      (s.scopeType === "GLOBAL" && s.scopeCode === "*" || s.scopeType === "TENANT" && s.scopeCode === tenant ||
        s.scopeType === "ENTERPRISE" && s.scopeCode === enterpriseCode);
    return effective.scopes.some(matches) && !effective.deniedScopes.some(matches);
  },
  /** Reads one current roster and recipient preference/authority snapshot; only explicit Employee selections represent Enterprises. */
  selectOnce: async function (tenant, ownerRef, p, authorityTenant) {
    const enterprise = ownerRef.type === "ENTERPRISE";
    const owner = await this.read(enterprise ? "DefaultEnterpriseService" : "DefaultCustomerService", enterprise ? authorityTenant : tenant, ownerRef.code);
    if (enterprise && owner && owner.tenant !== tenant) this.fail();
    if (!this.active(owner) || owner[p.preferencesField]?.IN_APP !== true) return [];
    if (!enterprise) {
      if (owner.principalType !== "customer" || owner.code.startsWith("profile-employee:")) this.fail();
      await SERVICE.DefaultEnterpriseMembershipService.resolve(owner, tenant, "CUSTOMER");
      return [owner.code];
    }
    const roster = owner[p.recipientsField];
    if (roster === undefined) return [];
    if (!Array.isArray(roster) || roster.length > p.maximumRecipients ||
        roster.some(v => !v || Object.keys(v).join(",") !== "employeeCode") ||
        new Set(roster.map(v => v.employeeCode)).size !== roster.length) this.fail();
    const result = [];
    for (const entry of roster) {
      const employee = await this.read("DefaultEmployeeService", tenant, this.identifier(entry.employeeCode));
      if (await this.employeeAuthorized(tenant, employee, ownerRef.code, p)) {
        const recipientId = "profile-employee:" + employee.code;
        if (await SERVICE.DefaultEnterpriseRegistrationService.read("DefaultCustomerService", tenant, { code: recipientId })) this.fail();
        result.push(recipientId);
      }
    }
    return result.sort();
  },
  /** Internal source-owner composition only: returns current canonical inbox IDs, not source proof, contacts, grants or message intents. */
  select: async function (request, ownerRef, policy) {
    try {
      SERVICE.DefaultLoggerService.assertSensitiveRequest(request);
      const auth = SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(request, "profile");
      const tenant = this.identifier(request.tenant), authorityTenant = this.identifier(CONFIG.get("defaultTenant"));
      if (auth.principalType !== "service" || auth.isSystem || auth.tenant !== tenant || !ownerRef ||
          Object.keys(ownerRef).sort().join(",") !== "code,type" || !["CUSTOMER", "ENTERPRISE"].includes(ownerRef.type)) this.fail();
      this.identifier(ownerRef.code);
      const p = this.policy(policy), pin = structuredClone({ auth, ownerRef, policy });
      const bound = () => {
        SERVICE.DefaultLoggerService.assertSensitiveRequest(request);
        if (request.tenant !== tenant || CONFIG.get("defaultTenant") !== authorityTenant || !same(request.authData, pin.auth) ||
            !same(ownerRef, pin.ownerRef) || !same(policy, pin.policy) || !same(this.policy(policy), p)) this.fail();
      };
      bound(); const first = await this.selectOnce(tenant, pin.ownerRef, p, authorityTenant); bound();
      const current = await this.selectOnce(tenant, pin.ownerRef, p, authorityTenant); bound();
      if (!same(first, current)) this.fail();
      return current;
    } catch (_) { this.fail(); }
  },
};
