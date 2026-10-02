/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/*
 * Nodics - Enterprise Micro-Services Management Framework
 * Copyright (c) 2026 Nodics. Governed by the root LICENSE.
 */
const writes = new WeakSet();
const reads = new WeakSet();
const creations = new WeakSet();
const mutationCaptures = new WeakMap();
const crypto = require("node:crypto");

/**
 * @module profile/service/enterprise/DefaultEnterpriseAdministrationConsentService
 * @description Owns bounded explicit ancestor consent on existing Enterprise records; relationships alone never grant authority.
 * @layer service
 * @owner profile
 * @override Later Profile layers may narrow ceilings and persistence while retaining canonical actors, target consent, revision fences and private evidence.
 */
module.exports = {
  /** Returns the existing canonical membership owner. @returns {Object} Effective Profile service. */
  memberships: function () {
    return SERVICE.DefaultEnterpriseMembershipService;
  },
  /** Requires a configured bounded onward depth rather than allowing automatic recursive grants. @returns {number} Maximum derived depth. */
  maximumDelegationDepth: function () {
    const depth = this.policy().maximumDelegationDepth;
    if (!Number.isSafeInteger(depth) || depth < 1 || depth > 32)
      this.fail("UNAVAILABLE");
    return depth;
  },
  /** Raises a stable redacted consent error. @param {string} suffix Defined failure category. @returns {never} Throws. */
  fail: function (suffix) {
    throw new CLASSES.NodicsError("ERR_PROFILE_CONSENT_" + suffix);
  },
  /** Requires the existing qualified nAuth deployment epoch; never allocates another version authority or accepts the disabled-owner fallback. @returns {number} Current governed authorization policy version. */
  authorizationPolicyVersion: function () {
    const owner = SERVICE.DefaultAuthSecurityService;
    if (!owner || typeof owner.getAuthorizationPolicyVersion !== "function")
      this.fail("UNAVAILABLE");
    const version = owner.getAuthorizationPolicyVersion();
    if (!Number.isSafeInteger(version) || version < 1 || version > 2147483647)
      this.fail("UNAVAILABLE");
    return version;
  },
  /** Requires independently qualified enforcement, not simply a parent association. @returns {Object} Layered policy. */
  policy: function () {
    const policy = CONFIG.get("enterpriseManagement.administrationConsent");
    if (
      !policy ||
      policy.enabled !== true ||
      policy.enforcementQualified !== true ||
      !Number.isSafeInteger(policy.maximumGrants) ||
      policy.maximumGrants < 1 ||
      policy.maximumGrants > 100 ||
      !Number.isSafeInteger(policy.maximumLifetimeDays) ||
      policy.maximumLifetimeDays < 1 ||
      policy.maximumLifetimeDays > 365 ||
      !Array.isArray(policy.allowedRoleCodes) ||
      !policy.allowedRoleCodes.length ||
      policy.allowedRoleCodes.length > 25 ||
      typeof policy.permission !== "string" ||
      !policy.permission
    )
      this.fail("UNAVAILABLE");
    this.memberships().policy();
    this.authorizationPolicyVersion();
    return policy;
  },
  /** Recognizes only transient exact in-process owner requests. @param {Object} request Generated write. @returns {boolean} Private admission. */
  ownsWrite: function (request) {
    return writes.has(request);
  },
  /** Captures the creation default once; an unconfigured positive default fails before setup writes. @param {Object} model New Enterprise model. @param {Object} request Fresh signed creation request. @returns {Promise<Object>} Private initialized owner model. */
  prepareCreation: async function (model, request) {
    const policy =
      CONFIG.get("enterpriseManagement.administrationConsent") || {};
    if (
      model.administrationConsent !== undefined ||
      model.administrationHierarchyEpoch !== undefined ||
      model.administrationHierarchyOperation !== undefined ||
      model.administrationHierarchySerialOperation !== undefined
    )
      this.fail("FORBIDDEN");
    if (![false, true].includes(policy.creationDefault))
      this.fail("UNAVAILABLE");
    if (policy.enabled === true) this.policy();
    const prepared = {
      ...model,
      administrationHierarchyEpoch: 0,
      administrationConsent: {
        version: 1,
        revision: 1,
        grants: [],
        creationDefault: policy.creationDefault,
        initializedAt: new Date().toISOString(),
      },
    };
    if (policy.creationDefault === true) {
      this.policy();
      const rights = policy.creationRights;
      if (
        !rights ||
        rights.approved !== true ||
        typeof rights.approvalReference !== "string" ||
        !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(rights.approvalReference)
      )
        this.fail("UNAVAILABLE");
      this.memberships()
        .base()
        .input(rights, [
          "approved",
          "approvalReference",
          "roleCodes",
          "actions",
          "recipients",
          "lifetimeDays",
        ]);
      const actor = await this.platformActor(request);
      const platformCode = CONFIG.get("defaultEnterprise") || "default";
      const authority = await this.sourceAuthority(
        platformCode,
        actor.identity,
      );
      if (authority.platformAdministrator !== true) this.fail("FORBIDDEN");
      const parentCode =
        SERVICE.DefaultEnterpriseService.hierarchyReferenceCode(
          model.superEnterprise,
        );
      const parent = await this.enterprise(parentCode);
      if (!parent.defaultAdminAssignmentCode) this.fail("UNAVAILABLE");
      const recipient = await this.assignmentRecipient(
        parent.defaultAdminAssignmentCode,
        parentCode,
      );
      const recipientAuthority = await this.sourceAuthority(
        parentCode,
        recipient.identity,
      );
      const ceilings = this.ceilings(rights);
      if (
        ceilings.actions.includes("MANAGE_ACCESS") &&
        recipientAuthority.accessManagementAllowed !== true
      )
        this.fail("FORBIDDEN");
      if (
        !Number.isSafeInteger(rights.lifetimeDays) ||
        rights.lifetimeDays < 1 ||
        rights.lifetimeDays > policy.maximumLifetimeDays
      )
        this.fail("CONFLICT");
      const creationParentChain = await this.relationshipForParent(
        parentCode,
        model.code,
      );
      const relationship = [
        {
          code: model.code,
          tenantCode: SERVICE.DefaultEnterpriseService.hierarchyReferenceCode(
            model.tenant,
          ),
          parentCode,
          epoch: 0,
        },
        creationParentChain[0],
      ];
      const grant = {
        code:
          "consent_" +
          this.memberships().digest([model.code, "CREATION", actor.identity]),
        revision: 1,
        status: "ACTIVE",
        sourceEnterpriseCode: parentCode,
        identity: recipient.identity,
        ...ceilings,
        relationship,
        recipientAuthority,
        grantingAuthority: authority,
        grantingEnterpriseCode: platformCode,
        creationAuthority: true,
        creationPolicy: {
          approvalReference: rights.approvalReference,
          digest: this.memberships().digest(rights),
        },
        creationParentChain,
        expiresAt: new Date(
          Date.now() + rights.lifetimeDays * 86400000,
        ).toISOString(),
        createdAt: prepared.administrationConsent.initializedAt,
        grantedBy: actor.identity,
        grantingAuthVersion: actor.person.authVersion || 1,
      };
      prepared.administrationConsent.grants.push(grant);
    }
    if (
      prepared.administrationConsent.creationDefault &&
      prepared.administrationConsent.grants.some(
        (grant) =>
          grant.recipientAuthority.authorizationPolicyVersion !==
            this.authorizationPolicyVersion() ||
          grant.grantingAuthority.authorizationPolicyVersion !==
            this.authorizationPolicyVersion(),
      )
    )
      this.fail("CONFLICT");
    creations.add(prepared);
    return prepared;
  },
  /** Admits only the framework creation owner's transient generated save after its no-existing-record checks. @param {Object} request Generated creation command. @returns {Promise<Object>} Existing owner envelope. */
  saveCreated: async function (request) {
    const state = request.model?.administrationConsent;
    if (
      !state ||
      state.version !== 1 ||
      state.revision !== 1 ||
      !creations.has(request.model) ||
      ![false, true].includes(state.creationDefault) ||
      state.grants?.length !== (state.creationDefault ? 1 : 0) ||
      request.model.administrationHierarchyEpoch !== 0
    )
      this.fail("FORBIDDEN");
    if (
      CONFIG.get("enterpriseManagement.administrationConsent")?.enabled ===
        true ||
      state.creationDefault
    )
      this.policy();
    if (state.creationDefault) {
      const actor = await this.platformActor(request),
        grant = state.grants[0];
      if (
        this.memberships().digest(actor.identity) !==
          this.memberships().digest(grant.grantedBy) ||
        this.memberships().digest(
          await this.sourceAuthority(
            grant.grantingEnterpriseCode,
            actor.identity,
          ),
        ) !== this.memberships().digest(grant.grantingAuthority) ||
        this.memberships().digest(
          await this.sourceAuthority(
            grant.sourceEnterpriseCode,
            grant.identity,
          ),
        ) !== this.memberships().digest(grant.recipientAuthority) ||
        this.memberships().digest(
          await this.relationshipForParent(
            grant.sourceEnterpriseCode,
            request.model.code,
          ),
        ) !== this.memberships().digest(grant.creationParentChain)
      )
        this.fail("CONFLICT");
    }
    writes.add(request);
    try {
      return await SERVICE.DefaultEnterpriseService.save(request);
    } finally {
      writes.delete(request);
    }
  },
  /** Captures the fresh proposed parent's bounded epoch chain before any creation writes. @param {string} parent Parent code. @param {string} child New child. @returns {Promise<Object[]>} Owner relationship evidence. */
  relationshipForParent: async function (parent, child) {
    const chain = await SERVICE.DefaultEnterpriseService.hierarchy(
        parent,
        child,
      ),
      result = [];
    for (const row of chain) {
      const record = await this.enterprise(row.code),
        epoch = record.administrationHierarchyEpoch ?? 0;
      if (
        !Number.isSafeInteger(epoch) ||
        epoch < 0 ||
        epoch >= 2147483647 ||
        record.administrationHierarchyOperation?.phase === "PENDING" ||
        SERVICE.DefaultEnterpriseService.hierarchyReferenceCode(
          record.superEnterprise,
          true,
        ) !== row.parentCode ||
        SERVICE.DefaultEnterpriseService.hierarchyReferenceCode(
          record.tenant,
        ) !== row.tenantCode
      )
        this.fail("CONFLICT");
      result.push({ ...row, epoch });
    }
    return result;
  },
  /** Admits one exact private generated read without browser-supplied authority flags. @param {Object} owner Existing generated service. @param {Object} request Owner request. @returns {Promise<Object>} Owner envelope. */
  read: async function (owner, request) {
    reads.add(request);
    try {
      return await owner.get(request);
    } finally {
      reads.delete(request);
    }
  },
  /** Strips private consent evidence from all other generated reads. @param {Object} request Generated read. @param {Object} response Pipeline response. @returns {boolean} Redacted public projection. */
  redact: function (request, response) {
    if (reads.has(request)) return true;
    const rows = response?.success?.result;
    if (Array.isArray(rows))
      response.success = {
        ...response.success,
        result: rows.map((row) => {
          if (!row || typeof row !== "object") return row;
          const projection = { ...row };
          delete projection.administrationConsent;
          delete projection.administrationHierarchyEpoch;
          delete projection.administrationHierarchyOperation;
          delete projection.administrationHierarchySerialOperation;
          return projection;
        }),
      };
    return true;
  },
  /** Reads fresh active Enterprise/Tenant dependencies through their generated owners. @param {string} code Enterprise code. @returns {Promise<Object>} Exact current record. */
  enterprise: async function (code) {
    const owner = SERVICE.DefaultEnterpriseService;
    const record = await this.recoveryRecord(code);
    if (!this.terminalHierarchy(record)) this.fail("CONFLICT");
    await owner.readHierarchyRecord(
      SERVICE.DefaultTenantService,
      owner.hierarchyReferenceCode(record.tenant),
    );
    return record;
  },
  /** Recognizes terminal cancellation only with unchanged original parent and a retained advanced epoch; incomplete graph/child evidence never becomes authority. @param {Object} record Fresh private Enterprise record. @returns {boolean} Terminal hierarchy admission. */
  terminalHierarchy: function (record) {
    const operation = record.administrationHierarchyOperation;
    if (!operation || operation.phase === "COMPLETE") return true;
    return (
      operation.phase === "CANCELLED" &&
      operation.cancelled === true &&
      Number.isSafeInteger(operation.previousEpoch) &&
      operation.previousEpoch >= 0 &&
      operation.previousEpoch < 2147483647 &&
      record.administrationHierarchyEpoch === operation.previousEpoch + 1 &&
      SERVICE.DefaultEnterpriseService.hierarchyReferenceCode(
        record.superEnterprise,
        true,
      ) === (operation.previousParent ?? undefined) &&
      Number.isFinite(Date.parse(operation.cancelledAt)) &&
      !!operation.cancelledBy &&
      typeof operation.id === "string" &&
      typeof operation.hash === "string"
    );
  },
  /** Reads the exact retained record for inspected recovery, including a held operation. @param {string} code Exact enterprise. @param {boolean} [includeInactive] Owner-only invalidation/repair admission. @returns {Promise<Object>} Fresh private record. */
  recoveryRecord: async function (code, includeInactive = false) {
    SERVICE.DefaultEnterpriseService.hierarchyReferenceCode(code);
    const owner = SERVICE.DefaultEnterpriseService;
    const request = {
      tenant: CONFIG.get("defaultTenant") || "default",
      authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
      query: { code },
      options: { recursive: false, skipItemCache: true },
      searchOptions: { pageSize: 2, pageNumber: 1 },
    };
    const execute = () => this.read(owner, request);
    const team = SERVICE.DefaultEnterpriseTeamAdministrationService;
    const rows = this.memberships().mutationRows(
      typeof team?.readEnterpriseEnvelope === "function"
        ? await team.readEnterpriseEnvelope(owner, request, execute)
        : await execute(),
    );
    if (
      rows.length !== 1 ||
      rows[0].code !== code ||
      (rows[0].active !== true &&
        !(includeInactive && rows[0].active === false))
    )
      this.fail("CONFLICT");
    return rows[0];
  },
  /** Validates bounded private consent without treating missing evidence as a grant. @param {Object} enterprise Owner record. @returns {Object} Immutable observed state. */
  state: function (enterprise) {
    const value = enterprise.administrationConsent;
    if (value === undefined) return { revision: 0, grants: [] };
    if (
      !value ||
      value.version !== 1 ||
      !Number.isSafeInteger(value.revision) ||
      value.revision < 1 ||
      !Array.isArray(value.grants) ||
      value.grants.length > 100 ||
      new Set(value.grants.map((row) => row.code)).size !== value.grants.length
    )
      this.fail("CONFLICT");
    return value;
  },
  /** Admits a fresh human platform super administrator separately from service bootstrap authority. @param {Object} request Signed request. @returns {Promise<Object>} Canonical human actor. */
  platformActor: async function (request) {
    const actor = await this.memberships().actor(request);
    const auth = request.authData || {};
    if (
      auth.principalType !== "human" ||
      auth.isSystem ||
      auth.authenticationMethod !== "PASSWORD" ||
      auth.entCode !== (CONFIG.get("defaultEnterprise") || "default") ||
      !SERVICE.DefaultEnterpriseManagementService.isPlatformAdministrator(auth)
    )
      this.fail("FORBIDDEN");
    return actor;
  },
  /** Admits the target's retained designated administrator; generic admin-group membership is insufficient. @param {Object} request Signed human command. @param {Object} enterprise Fresh target. @returns {Promise<Object>} Canonical granting actor. */
  targetActor: async function (request, enterprise) {
    const m = this.memberships();
    const actor = await m.actor(request);
    if (
      request.authData.principalType !== "human" ||
      request.authData.entCode !== enterprise.code
    )
      this.fail("FORBIDDEN");
    m.permission(request, this.policy().permission);
    actor.administrationAuthority = await this.sourceAuthority(
      enterprise.code,
      actor.identity,
    );
    return actor;
  },
  /** Requires unique bounded explicit selections; wildcard/automatic-subtree ceilings are not supported. @param {Array} values Reviewed values. @param {number} maximum Bound. @returns {string[]} Exact selections. */
  selections: function (values, maximum) {
    if (
      !Array.isArray(values) ||
      !values.length ||
      values.length > maximum ||
      values.some(
        (value) =>
          typeof value !== "string" ||
          !/^[A-Za-z0-9][A-Za-z0-9._@+-]{0,319}$/.test(value),
      ) ||
      new Set(values).size !== values.length
    )
      this.fail("CONFLICT");
    return [...values];
  },
  /** Validates an explicit typed identity locator, never an email match or browser-selected record. @param {Object} input Locator. @returns {Promise<Object>} Current credential owner. */
  recipient: async function (input) {
    const m = this.memberships();
    m.base().input(input || {}, ["tenantCode", "recordKind", "recordId"]);
    if (input?.recordKind !== "EMPLOYEE") this.fail("FORBIDDEN");
    return m.anchor(input);
  },
  /** Resolves a public assignment handle to its fresh accepted canonical administrator. @param {string} assignmentCode Public handle. @param {string} enterpriseCode Exact source. @returns {Promise<Object>} Private canonical anchor. */
  assignmentRecipient: async function (assignmentCode, enterpriseCode) {
    const m = this.memberships(),
      { item } = await m.assignment(assignmentCode);
    if (item.enterpriseCode !== enterpriseCode || item.status !== "REGISTERED")
      this.fail("FORBIDDEN");
    const person = await m.read(
      "DefaultEmployeeService",
      item.tenantCode,
      item.membership
        ? { _id: item.membership.projectionId }
        : { loginId: item.registeredLoginId },
    );
    if (
      !person ||
      person.loginId !== item.registeredLoginId ||
      (item.membership && item.membership.phase !== "COMPLETE")
    )
      this.fail("FORBIDDEN");
    const anchor = await m.resolve(person, item.tenantCode, "EMPLOYEE");
    if (
      item.membership &&
      m.digest(anchor.identity) !== m.digest(item.membership.identity)
    )
      this.fail("FORBIDDEN");
    await this.sourceAuthority(enterpriseCode, anchor.identity, assignmentCode);
    return anchor;
  },
  /** Requires explicit enterprise-super-administrator classification, never business roles or a generic permission. @param {Object} source Fresh enterprise. @param {Object} item Fresh accepted assignment. @returns {boolean} Classified administration authority. */
  classifiedAdministrator: function (source, item) {
    const classification = this.policy().administratorRoleCodes;
    if (item.code === source.defaultAdminAssignmentCode) return true;
    if (
      !Array.isArray(classification) ||
      classification.length < 1 ||
      classification.length > 25 ||
      !classification.includes(item.roleCode)
    )
      return false;
    const role = SERVICE.DefaultEnterpriseManagementService.rolePolicy(
      item.roleCode,
    );
    return (
      role.administrationClass === "ENTERPRISE_ADMIN" &&
      !item.invitationAuthority?.administrationConsent
    );
  },
  /** Resolves an actual fresh accepted designated/explicitly classified appointed administrator and its current source permissions. @param {string} code Source enterprise. @param {Object} identity Canonical recipient. @param {string} [assignmentCode] Exact selected public handle. @returns {Promise<Object>} Immutable retained source authority. */
  sourceAuthority: async function (code, identity, assignmentCode) {
    const authorizationPolicyVersion = this.authorizationPolicyVersion();
    const m = this.memberships(),
      source = await this.enterprise(code);
    const actor = await m.anchor(identity);
    if (identity.recordKind !== "EMPLOYEE") this.fail("FORBIDDEN");
    const rows = assignmentCode
      ? [(await m.assignment(assignmentCode)).item]
      : await m.inventory(
          "DefaultEnterpriseAccessAssignmentService",
          m.authority(),
          {
            enterpriseCode: code,
            status: "REGISTERED",
            $or: [
              {
                "membership.identity.tenantCode": identity.tenantCode,
                "membership.identity.recordKind": "EMPLOYEE",
                "membership.identity.recordId": identity.recordId,
              },
              {
                tenantCode: identity.tenantCode,
                registeredLoginId: actor.person.loginId,
                membership: { $exists: false },
              },
            ],
          },
        );
    const candidates = rows.filter((row) =>
      this.classifiedAdministrator(source, row),
    );
    if (candidates.length !== 1) this.fail("FORBIDDEN");
    const { item } = await m.assignment(candidates[0].code);
    if (
      item.status !== "REGISTERED" ||
      item.enterpriseCode !== code ||
      !this.classifiedAdministrator(source, item) ||
      item.tenantCode !==
        SERVICE.DefaultEnterpriseService.hierarchyReferenceCode(source.tenant)
    )
      this.fail("FORBIDDEN");
    const person = await m.read(
      "DefaultEmployeeService",
      item.tenantCode,
      item.membership
        ? { _id: item.membership.projectionId }
        : { loginId: item.registeredLoginId },
    );
    if (
      !person ||
      person.loginId !== item.registeredLoginId ||
      (item.membership && item.membership.phase !== "COMPLETE") ||
      m.digest(
        (await m.resolve(person, item.tenantCode, "EMPLOYEE")).identity,
      ) !== m.digest(identity)
    )
      this.fail("FORBIDDEN");
    const role = SERVICE.DefaultEnterpriseManagementService.rolePolicy(
      item.roleCode,
    );
    if (m.digest(role.groupCodes) !== m.digest(item.groupCodes))
      this.fail("FORBIDDEN");
    let sourceBindings;
    if (item.membership) {
      const context = await m.sessionContext(
        person,
        { ...source, tenant: { code: item.tenantCode } },
        "Employee",
      );
      if (!context) this.fail("FORBIDDEN");
      sourceBindings = context.securityBindings;
    }
    const actualGroups = (person.userGroups || []).map((group) =>
      typeof group === "string" ? group : group?.code,
    );
    if (
      !item.membership &&
      (!Array.isArray(role.groupCodes) ||
        !role.groupCodes.every((group) => actualGroups.includes(group)))
    )
      this.fail("FORBIDDEN");
    const groups = await m.groups(
      item.tenantCode,
      item.membership ? item.groupCodes : actualGroups,
    );
    if (
      ![actor.person.authVersion ?? 1, person.authVersion ?? 1].every(
        (version) => Number.isSafeInteger(version) && version >= 1,
      )
    )
      this.fail("FORBIDDEN");
    m.permission(
      {
        authData: {
          tokenType: "access",
          principalType: "human",
          tenant: item.tenantCode,
          entCode: code,
          loginId: item.registeredLoginId,
          userGroups:
            SERVICE.DefaultAuthenticationProviderService.resolveSessionUserGroups(
              { userGroups: groups },
            ),
          permissions: UTILS.getUserGroupPermissions(groups),
        },
      },
      "profile.enterpriseAccess.assign",
    );
    m.permission(
      {
        authData: {
          tokenType: "access",
          principalType: "human",
          tenant: item.tenantCode,
          entCode: code,
          loginId: item.registeredLoginId,
          userGroups:
            SERVICE.DefaultAuthenticationProviderService.resolveSessionUserGroups(
              { userGroups: groups },
            ),
          permissions: UTILS.getUserGroupPermissions(groups),
        },
      },
      this.policy().permission,
    );
    let accessManagementAllowed = false;
    if (
      typeof this.policy().accessManagementPermission === "string" &&
      this.policy().accessManagementPermission
    ) {
      try {
        m.permission(
          {
            authData: {
              tokenType: "access",
              principalType: "human",
              tenant: item.tenantCode,
              entCode: code,
              loginId: item.registeredLoginId,
              userGroups:
                SERVICE.DefaultAuthenticationProviderService.resolveSessionUserGroups(
                  { userGroups: groups },
                ),
              permissions: UTILS.getUserGroupPermissions(groups),
            },
          },
          this.policy().accessManagementPermission,
        );
        accessManagementAllowed = true;
      } catch (error) {
        if (error?.code !== "ERR_PROFILE_MEMBERSHIP_FORBIDDEN") throw error;
      }
    }
    if (this.authorizationPolicyVersion() !== authorizationPolicyVersion)
      this.fail("CONFLICT");
    return {
      code: item.code,
      revision: item.revision,
      identity,
      authorizationPolicyVersion,
      authVersion: actor.person.authVersion || 1,
      groupsDigest: m.digest(
        [...groups].sort((left, right) =>
          left.code === right.code ? 0 : left.code < right.code ? -1 : 1,
        ),
      ),
      roleDigest: m.digest(
        SERVICE.DefaultEnterpriseManagementService.rolePolicy(item.roleCode),
      ),
      projectionAuthVersion: person.authVersion || 1,
      accessManagementAllowed,
      ...(sourceBindings
        ? { sourceBindings: sourceBindings.map((binding) => ({ ...binding })) }
        : {}),
      platformAdministrator:
        code === (CONFIG.get("defaultEnterprise") || "default") &&
        SERVICE.DefaultEnterpriseManagementService.isPlatformAdministrator({
          entCode: code,
          principalType: "human",
          userGroups:
            SERVICE.DefaultAuthenticationProviderService.resolveSessionUserGroups(
              { userGroups: groups },
            ),
          permissions: UTILS.getUserGroupPermissions(groups),
        }),
    };
  },
  /** Validates explicit role/action/recipient ceilings for both direct and derived commands. @param {Object} input Reviewed policy/input. @returns {Object} Normalized bounded ceilings. */
  ceilings: function (input) {
    const policy = this.policy(),
      roleCodes = this.selections(input.roleCodes, 25),
      actions = this.selections(input.actions, 3);
    if (
      actions.some(
        (action) => !["VIEW", "INVITE", "MANAGE_ACCESS"].includes(action),
      ) ||
      (actions.includes("MANAGE_ACCESS") && policy.onwardQualified !== true)
    )
      this.fail("FORBIDDEN");
    for (const code of roleCodes) {
      const role = SERVICE.DefaultEnterpriseManagementService.rolePolicy(code);
      if (
        role.delegable !== true ||
        !policy.allowedRoleCodes.includes(code) ||
        role.administrationClass === "ENTERPRISE_ADMIN"
      )
        this.fail("FORBIDDEN");
    }
    const recipients = this.selections(input.recipients, 100).map((value) =>
      SERVICE.DefaultEnterpriseManagementService.normalizeEmail(value),
    );
    if (new Set(recipients).size !== recipients.length) this.fail("CONFLICT");
    return { roleCodes, actions, recipients };
  },
  /** Resolves explicit target context without accepting target selection from a browser authority flag. @param {Object} request Signed request with optional route parameter. @returns {Promise<Object>} Fresh active target. */
  target: function (request) {
    return this.enterprise(
      request.params?.enterpriseCode ?? request.authData?.entCode,
    );
  },
  /** Resolves direct target, independent human platform or a specifically selected MANAGE_ACCESS grant. @param {Object} request Signed actor. @param {Object} target Exact target. @param {string} [parentCode] Explicit dependent grant. @returns {Promise<Object>} Fresh command authority. */
  commandActor: async function (request, target, parentCode) {
    const m = this.memberships();
    if (request.authData?.entCode === target.code) {
      if (parentCode !== undefined) this.fail("FORBIDDEN");
      return {
        actor: await this.targetActor(request, target),
        enterpriseCode: target.code,
      };
    }
    if (
      request.authData?.entCode ===
        (CONFIG.get("defaultEnterprise") || "default") &&
      SERVICE.DefaultEnterpriseManagementService.isPlatformAdministrator(
        request.authData,
      )
    ) {
      if (parentCode !== undefined) this.fail("FORBIDDEN");
      const actor = await this.platformActor(request);
      m.permission(request, this.policy().permission);
      actor.administrationAuthority = await this.sourceAuthority(
        request.authData.entCode,
        actor.identity,
      );
      return {
        actor,
        enterpriseCode: request.authData.entCode,
        platform: true,
      };
    }
    const policy = this.policy();
    if (
      policy.onwardQualified !== true ||
      typeof policy.accessManagementPermission !== "string" ||
      !policy.accessManagementPermission
    )
      this.fail("UNAVAILABLE");
    const actor = await m.actor(request);
    if (request.authData.principalType !== "human") this.fail("FORBIDDEN");
    m.permission(request, policy.accessManagementPermission);
    const candidates = this.state(target).grants.filter(
      (grant) =>
        grant.status === "ACTIVE" &&
        grant.actions.includes("MANAGE_ACCESS") &&
        grant.sourceEnterpriseCode === request.authData.entCode &&
        m.digest(grant.identity) === m.digest(actor.identity) &&
        (parentCode === undefined || grant.code === parentCode),
    );
    if (candidates.length !== 1) this.fail("FORBIDDEN");
    const parentProof = {
      owner: "profile.administrationConsent",
      code: candidates[0].code,
      revision: candidates[0].revision,
    };
    const parent = await this.validate(target.code, parentProof);
    return {
      actor,
      enterpriseCode: request.authData.entCode,
      parent,
      parentProof,
    };
  },
  /** Captures a reviewed ancestor relationship with managed epochs so returning to an old parent cannot revive it. @param {string} target Child. @param {string} source Selected ancestor. @returns {Promise<Object[]>} Source-bounded chain evidence. */
  relationship: async function (target, source) {
    const chain = await SERVICE.DefaultEnterpriseService.hierarchy(target);
    const index = chain.findIndex((row) => row.code === source);
    if (index < 1) this.fail("FORBIDDEN");
    const evidence = [];
    for (const row of chain.slice(0, index + 1)) {
      const record = await this.enterprise(row.code);
      const epoch = record.administrationHierarchyEpoch ?? 0;
      if (!Number.isSafeInteger(epoch) || epoch < 0 || epoch >= 2147483647)
        this.fail("CONFLICT");
      if (
        SERVICE.DefaultEnterpriseService.hierarchyReferenceCode(
          record.superEnterprise,
          true,
        ) !== row.parentCode
      )
        this.fail("CONFLICT");
      evidence.push({ ...row, epoch });
    }
    return evidence;
  },
  /** Commits one inspected state through generated conditional update and exact own-command readback. @param {Object} enterprise Observed target. @param {Object} state New private state. @param {boolean} [includeInactive] Owner-only invalidation/repair admission, never activation. @returns {Promise<Object>} Fresh matching record. */
  persist: async function (enterprise, state, includeInactive = false) {
    this.policy();
    if (
      enterprise.active !== true &&
      !(includeInactive && enterprise.active === false)
    )
      this.fail("CONFLICT");
    const m = this.memberships();
    const previous = enterprise.administrationConsent;
    const command = {
      tenant: CONFIG.get("defaultTenant") || "default",
      authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
      query: {
        code: enterprise.code,
        active: enterprise.active,
        ...(previous
          ? { "administrationConsent.revision": previous.revision }
          : { administrationConsent: { $exists: false } }),
        ...(enterprise.administrationHierarchyEpoch === undefined
          ? { administrationHierarchyEpoch: { $exists: false } }
          : {
              administrationHierarchyEpoch:
                enterprise.administrationHierarchyEpoch,
            }),
        ...(enterprise.superEnterprise === undefined
          ? { superEnterprise: { $exists: false } }
          : { superEnterprise: enterprise.superEnterprise }),
        ...(previous?.stampRepair === undefined
          ? { "administrationConsent.stampRepair": { $exists: false } }
          : { "administrationConsent.stampRepair": previous.stampRepair }),
      },
      model: { administrationConsent: state },
      options: { recursive: false },
    };
    writes.add(command);
    let failure;
    try {
      const response = await SERVICE.DefaultEnterpriseService.update(command);
      m.base().assertWrite(response);
      if (response.result?.matchedCount !== 1) this.fail("CONFLICT");
    } catch (error) {
      failure = error;
    } finally {
      writes.delete(command);
    }
    const current = await this.recoveryRecord(enterprise.code, includeInactive);
    if (
      current.active !== enterprise.active ||
      m.digest(current.administrationConsent) !== m.digest(state)
    ) {
      if (failure) throw failure;
      this.fail("CONFLICT");
    }
    return current;
  },
  /** Builds a typed consent stamp key without exposing canonical identity. @param {string} target Target enterprise. @param {string} code Grant code. @returns {string} Existing security-stamp key. */
  stampKey: function (target, code) {
    return (
      "administration-consent:" + this.memberships().digest([target, code])
    );
  },
  /** Registers the current grant revision with the existing shared authority owner. @param {string} target Target enterprise. @param {Object} grant Private grant. @returns {Promise<void>} Awaited invalidation. */
  register: async function (target, grant) {
    const owner = SERVICE.DefaultPrincipalSecurityStampService,
      tenant = this.memberships().authority(),
      principalId = this.stampKey(target, grant.code);
    if (
      !owner ||
      typeof owner.register !== "function" ||
      typeof owner.validateBindings !== "function" ||
      !Number.isSafeInteger(grant.revision) ||
      grant.revision < 1
    )
      this.fail("UNAVAILABLE");
    let failure;
    try {
      await owner.register(tenant, principalId, grant.revision);
    } catch (error) {
      failure = error;
    }
    try {
      if (
        (await owner.validateBindings([
          { tenant, principalId, authVersion: grant.revision },
        ])) !== true
      )
        this.fail("CONFLICT");
    } catch (error) {
      throw failure || error;
    }
  },
  /** Reads a counted bounded inventory through existing stamp governance and exact private owner admission. @param {Object} owner Generated owner. @param {string} tenant Partition. @param {Object} query Inspected selector. @returns {Promise<Object[]>} Complete records, never a truncated list. */
  dependencyRows: async function (owner, tenant, query) {
    const stamps = SERVICE.DefaultPrincipalSecurityStampGovernanceService,
      team = SERVICE.DefaultEnterpriseTeamAdministrationService;
    if (
      !owner ||
      !stamps?.inventory ||
      (owner === SERVICE.DefaultEnterpriseService &&
        !team?.readEnterpriseEnvelope)
    )
      this.fail("UNAVAILABLE");
    const rows = await stamps.inventory(
      {
        get: async (request) => {
          const execute = () => this.read(owner, request);
          const envelope =
            owner === SERVICE.DefaultEnterpriseService
              ? await team.readEnterpriseEnvelope(owner, request, execute)
              : await execute();
          if (!Number.isSafeInteger(envelope?.count) || envelope.count > 100)
            this.fail("UNAVAILABLE");
          return envelope;
        },
      },
      tenant,
      query,
    );
    if (rows.length > 100) this.fail("UNAVAILABLE");
    return rows;
  },
  /** Resolves generated mutation ownership from framework schema metadata, not a body authority flag. @param {Object} request Generated mutation. @returns {Object} Fixed existing owner and schema. */
  mutationOwner: function (request) {
    const schema = request.schemaModel?.schemaName,
      names = {
        enterprise: "DefaultEnterpriseService",
        employee: "DefaultEmployeeService",
        password: "DefaultPasswordService",
        userGroup: "DefaultUserGroupService",
        principalScopeAssignment: "DefaultPrincipalScopeAssignmentService",
        enterpriseAccessAssignment: "DefaultEnterpriseAccessAssignmentService",
      };
    const owner = SERVICE[names[schema]];
    if (!owner || typeof request.tenant !== "string") this.fail("UNAVAILABLE");
    return { schema, owner };
  },
  /** Captures old and proposed mutation subjects, using existing group inheritance and principal owners rather than another dependency registry. @param {Object} request Generated mutation. @param {Object[]} before Fresh old records. @param {Object[]} after Fresh new records. @returns {Promise<Object>} Bounded exact dependency keys. */
  mutationDependencies: async function (request, before, after = []) {
    const { schema } = this.mutationOwner(request),
      m = this.memberships();
    const models = Array.isArray(request.model)
        ? request.model
        : [request.model || {}],
      rows = [
        ...before,
        ...after,
        ...models.map((model) => model.$set || model),
      ];
    if (models.length > 100) this.fail("UNAVAILABLE");
    const keys = {
      enterprises: [],
      assignments: [],
      identities: [],
      groups: [],
      tenant: request.tenant,
    };
    if (schema === "enterprise")
      keys.enterprises = rows
        .map((row) => row.code)
        .filter((code) => typeof code === "string");
    if (schema === "enterpriseAccessAssignment")
      keys.assignments = rows
        .map((row) => row.code)
        .filter((code) => typeof code === "string");
    let persons = schema === "employee" ? [...before, ...after] : [];
    if (schema === "password") {
      const logins = [
        ...new Set(
          rows
            .map((row) => row.loginId)
            .filter((login) => typeof login === "string"),
        ),
      ];
      const ids = [
          ...new Set(
            [...before, ...after].map((row) => row._id).filter(Boolean),
          ),
        ],
        selectors = [];
      if (logins.length) selectors.push({ loginId: { $in: logins } });
      if (ids.length) selectors.push({ password: { $in: ids } });
      if (selectors.length)
        persons = await this.dependencyRows(
          SERVICE.DefaultEmployeeService,
          request.tenant,
          { $or: selectors },
        );
    }
    if (schema === "userGroup" || schema === "principalScopeAssignment") {
      const codes = [
        ...new Set(
          rows
            .filter(
              (row) => schema === "userGroup" || row.principalType === "group",
            )
            .map((row) => (schema === "userGroup" ? row.code : row.groupCode))
            .filter((code) => typeof code === "string"),
        ),
      ];
      if (codes.length) {
        const groups = await this.dependencyRows(
          SERVICE.DefaultUserGroupService,
          request.tenant,
          {},
        );
        keys.groups = [
          ...new Set(
            codes.flatMap((code) =>
              SERVICE.DefaultPrincipalSecurityStampGovernanceService.getAffectedGroupCodes(
                groups,
                code,
              ),
            ),
          ),
        ];
      }
      if (schema === "principalScopeAssignment") {
        const codes = [
          ...new Set(
            rows
              .filter((row) => row.principalType === "human")
              .map((row) => row.principalCode)
              .filter((code) => typeof code === "string"),
          ),
        ];
        if (codes.length)
          persons = await this.dependencyRows(
            SERVICE.DefaultEmployeeService,
            request.tenant,
            { $or: [{ loginId: { $in: codes } }, { code: { $in: codes } }] },
          );
      }
    }
    for (const person of persons)
      if (person._id)
        keys.identities.push(
          m.identity(
            person.authenticationIdentity ||
              m.locator(request.tenant, "EMPLOYEE", person),
          ),
        );
    if (persons.length) {
      const ids = [
        ...new Set(
          persons
            .filter((person) => person._id)
            .map((person) => m.recordId(person._id)),
        ),
      ];
      if (ids.length)
        keys.assignments.push(
          ...(
            await this.dependencyRows(
              SERVICE.DefaultEnterpriseAccessAssignmentService,
              m.authority(),
              {
                tenantCode: request.tenant,
                "membership.projectionId": { $in: ids },
              },
            )
          ).map((row) => row.code),
        );
    }
    if (keys.groups.length)
      keys.assignments.push(
        ...(
          await this.dependencyRows(
            SERVICE.DefaultEnterpriseAccessAssignmentService,
            m.authority(),
            { tenantCode: request.tenant, groupCodes: { $in: keys.groups } },
          )
        ).map((row) => row.code),
      );
    if (keys.groups.length) {
      const native = await this.dependencyRows(
        SERVICE.DefaultEmployeeService,
        request.tenant,
        { userGroups: { $in: keys.groups } },
      );
      for (const person of native)
        keys.identities.push(
          m.identity(
            person.authenticationIdentity ||
              m.locator(request.tenant, "EMPLOYEE", person),
          ),
        );
    }
    keys.enterprises = [...new Set(keys.enterprises)];
    keys.assignments = [...new Set(keys.assignments)];
    keys.identities = [
      ...new Map(
        keys.identities.map((identity) => [m.digest(identity), identity]),
      ).values(),
    ];
    if (
      [keys.enterprises, keys.assignments, keys.identities, keys.groups].some(
        (values) => values.length > 100,
      )
    )
      this.fail("UNAVAILABLE");
    return keys;
  },
  /** Tests exact stored source dependencies without broad tenant/subtree revocation. @param {Object} target Stored target. @param {Object} grant Private grant. @param {Object} keys Captured owner subjects. @returns {boolean} Exact affected grant. */
  affectedGrant: function (target, grant, keys) {
    const m = this.memberships();
    return (
      keys.enterprises.includes(target.code) ||
      keys.enterprises.includes(grant.sourceEnterpriseCode) ||
      keys.enterprises.includes(grant.grantingEnterpriseCode) ||
      (grant.relationship || []).some((row) =>
        keys.enterprises.includes(row.code),
      ) ||
      keys.assignments.includes(grant.recipientAuthority?.code) ||
      keys.assignments.includes(grant.grantingAuthority?.code) ||
      keys.identities.some(
        (identity) =>
          m.digest(identity) === m.digest(grant.identity) ||
          m.digest(identity) === m.digest(grant.grantedBy),
      )
    );
  },
  /** Permanently revokes only captured source dependencies and their onward descendants through existing consent CAS and typed stamps. @param {Object} keys Captured old/new subjects. @param {Object} receipt Private mutation identity. @returns {Promise<void>} Awaited bounded invalidation. */
  invalidateMutationDependencies: async function (keys, receipt) {
    const targets = await this.dependencyRows(
      SERVICE.DefaultEnterpriseService,
      CONFIG.get("defaultTenant") || "default",
      { "administrationConsent.grants.status": "ACTIVE" },
    );
    for (const target of targets) {
      const state = this.state(target),
        grants = state.grants.map((grant) => ({ ...grant })),
        affected = new Set(
          grants
            .filter(
              (grant) =>
                grant.status === "ACTIVE" &&
                this.affectedGrant(target, grant, keys),
            )
            .map((grant) => grant.code),
        );
      for (let depth = 0; depth < grants.length; depth++) {
        let changed = false;
        for (const grant of grants)
          if (
            grant.status === "ACTIVE" &&
            affected.has(grant.parentProof?.code) &&
            !affected.has(grant.code)
          ) {
            affected.add(grant.code);
            changed = true;
          }
        if (!changed) break;
      }
      if (!affected.size) continue;
      if (typeof target.active !== "boolean" || state.revision >= 2147483647)
        this.fail("CONFLICT");
      for (const grant of grants)
        if (affected.has(grant.code)) {
          if (
            !Number.isSafeInteger(grant.revision) ||
            grant.revision >= 2147483647
          )
            this.fail("CONFLICT");
          grant.status = "REVOKED";
          grant.revision += 1;
          grant.revokedAt = receipt.at;
          grant.invalidation = {
            owner: "profile.administrationConsent",
            reason: "SOURCE_MUTATION",
            mutationId: receipt.id,
            schema: receipt.schema,
            at: receipt.at,
          };
        }
      await this.persist(
        target,
        { ...state, revision: state.revision + 1, grants },
        true,
      );
      for (const grant of grants.filter((grant) => affected.has(grant.code)))
        await this.register(target.code, grant);
    }
  },
  /** Captures exact transient generated mutation evidence and invalidates before source writes; failed writes never revive consent. @param {Object} request Generated pre-save/update/remove. @returns {Promise<boolean>} Awaited pre-invalidation. */
  prepareExternalMutation: async function (request) {
    if (this.ownsWrite(request)) return true;
    if (
      CONFIG.get("enterpriseManagement.administrationConsent")?.enabled !== true
    )
      return true;
    const policy = this.policy();
    if (policy.externalInvalidationQualified !== true) this.fail("UNAVAILABLE");
    // Versioned physical-row replacement is not canonical source mutation qualification.
    if (
      request.schemaModel?.versioned ||
      request.schemaModel?.rawSchema?.isVersionedEnabled
    )
      this.fail("UNAVAILABLE");
    if (mutationCaptures.has(request)) this.fail("CONFLICT");
    const { schema, owner } = this.mutationOwner(request);
    let query = request.query;
    if (
      query !== undefined &&
      (!query ||
        typeof query !== "object" ||
        Array.isArray(query) ||
        Object.keys(query).length === 0)
    )
      this.fail("CONFLICT");
    if (!query) {
      const models = Array.isArray(request.model)
          ? request.model
          : [request.model || {}],
        codes = models
          .map((model) => model.code)
          .filter((code) => typeof code === "string");
      if (!codes.length || models.length > 100) this.fail("CONFLICT");
      query = { code: { $in: codes } };
    }
    const before = await this.dependencyRows(owner, request.tenant, query),
      receipt = {
        id: crypto.randomBytes(24).toString("hex"),
        schema,
        at: new Date().toISOString(),
      };
    const keys = await this.mutationDependencies(request, before);
    mutationCaptures.set(request, {
      before,
      keys,
      receipt,
      owner,
      query,
      tenant: request.tenant,
      schema,
    });
    try {
      await this.invalidateMutationDependencies(keys, receipt);
    } catch (error) {
      mutationCaptures.delete(request);
      throw error;
    }
    return true;
  },
  /** Reconciles old/new generated mutation dependencies from exact private capture after existing principal/scope hooks; never treats caller flags as a receipt. @param {Object} request Same generated post-save/update/remove. @returns {Promise<boolean>} Awaited post-invalidation, not source-write success. */
  finalizeExternalMutation: async function (request) {
    if (this.ownsWrite(request)) return true;
    const capture = mutationCaptures.get(request);
    if (!capture) {
      if (
        CONFIG.get("enterpriseManagement.administrationConsent")?.enabled !==
        true
      )
        return true;
      this.fail("CONFLICT");
    }
    try {
      const policy = this.policy();
      if (
        policy.externalInvalidationQualified !== true ||
        request.schemaModel?.versioned ||
        request.schemaModel?.rawSchema?.isVersionedEnabled
      )
        this.fail("UNAVAILABLE");
      if (
        request.tenant !== capture.tenant ||
        request.schemaModel?.schemaName !== capture.schema
      )
        this.fail("CONFLICT");
      const ids = capture.before.map((row) => row._id).filter(Boolean);
      const after = await this.dependencyRows(
        capture.owner,
        capture.tenant,
        ids.length
          ? { $or: [{ _id: { $in: ids } }, capture.query] }
          : capture.query,
      );
      const keys = await this.mutationDependencies(
        request,
        capture.before,
        after,
      );
      await this.invalidateMutationDependencies(capture.keys, capture.receipt);
      await this.invalidateMutationDependencies(keys, capture.receipt);
      return true;
    } finally {
      mutationCaptures.delete(request);
    }
  },
  /** Admits only fresh target administration or explicit human platform authority for stamp repair; ancestors never qualify. @param {Object} request Human recovery request. @param {Object} target Exact retained target. @returns {Promise<Object>} Current repair actor. */
  stampRepairActor: async function (request, target) {
    const policy = this.policy(),
      m = this.memberships();
    if (
      policy.stampRepairQualified !== true ||
      typeof policy.stampRepairPermission !== "string" ||
      !policy.stampRepairPermission.trim()
    )
      this.fail("UNAVAILABLE");
    m.permission(request, policy.stampRepairPermission);
    const actor =
      request.authData?.entCode === target.code && target.active === true
        ? await this.targetActor(request, target)
        : await this.platformActor(request);
    return actor;
  },
  /** Proves selected revisions are committed invalidation or currently valid active authority, never a browser-supplied cache version. @param {Object} target Fresh private record. @param {string[]} codes Exact selected grants. @returns {Promise<Object[]>} Committed stamp subjects. */
  committedStampSubjects: async function (target, codes) {
    const state = this.state(target),
      subjects = [];
    for (const code of codes) {
      const grant = state.grants.find((row) => row.code === code);
      if (
        !grant ||
        !Number.isSafeInteger(grant.revision) ||
        grant.revision < 1 ||
        grant.revision > 2147483647
      )
        this.fail("CONFLICT");
      if (grant.status === "ACTIVE") {
        await this.validate(target.code, {
          owner: "profile.administrationConsent",
          code,
          revision: grant.revision,
        });
      } else if (
        grant.status !== "REVOKED" ||
        grant.revision < 2 ||
        !Number.isFinite(Date.parse(grant.revokedAt)) ||
        (!grant.revokedBy &&
          !(
            grant.invalidation?.owner === "profile.administrationConsent" &&
            grant.invalidation.reason === "SOURCE_MUTATION" &&
            /^[a-f0-9]{48}$/.test(grant.invalidation.mutationId || "")
          ))
      )
        this.fail("CONFLICT");
      subjects.push(grant);
    }
    return subjects;
  },
  /** Projects exact bounded repair-specific plain-text configuration without fallback copy or authority metadata. @returns {Object} Detached configured presentation. */
  stampRepairPresentation: function () {
    const configured = this.policy().stampRepairPresentation;
    const keys = [
      "title",
      "inspectLabel",
      "emptyMessage",
      "workingLabel",
      "reviewTitle",
      "confirmLabel",
      "cancelLabel",
      "uncertainMessage",
      "unavailableMessage",
      "recordedMessage",
      "grantLabel",
      "revisionLabel",
      "statusLabel",
    ];
    if (
      !configured ||
      typeof configured !== "object" ||
      Array.isArray(configured) ||
      Reflect.ownKeys(configured).length !== keys.length
    )
      this.fail("UNAVAILABLE");
    const entries = keys.map((key) => {
      const descriptor = Object.getOwnPropertyDescriptor(configured, key),
        value = descriptor?.value;
      if (
        !descriptor?.enumerable ||
        typeof value !== "string" ||
        !value.trim() ||
        value.length > (key === "title" ? 160 : 500)
      )
        this.fail("UNAVAILABLE");
      return [key, value];
    });
    return Object.fromEntries(entries);
  },
  /** Publishes bounded policy-presented repair inspection without private locators or requiring a live original actor/hierarchy operation. @param {Object} request Fresh target/platform inspection with exact path target. @returns {Promise<Object>} Inert committed-stamp subjects and configured plain text. */
  inspectCommittedStamps: async function (request) {
    const m = this.memberships();
    m.base().input(request.query || {}, []);
    m.base().input(request.body || {}, []);
    const code = request.params?.enterpriseCode;
    if (typeof code !== "string") this.fail("CONFLICT");
    const presentation = this.stampRepairPresentation();
    SERVICE.DefaultEnterpriseService.hierarchyReferenceCode(code);
    const target = await this.recoveryRecord(code, true);
    await this.stampRepairActor(request, target);
    const epoch = this.authorizationPolicyVersion(),
      state = this.state(target),
      grants = [];
    for (const row of state.grants) {
      let canRepair = false;
      try {
        await this.committedStampSubjects(target, [row.code]);
        canRepair = true;
      } catch (_) {
        /* Unavailable or stale subjects are never selectable authority. */
      }
      grants.push({
        code: row.code,
        revision: row.revision,
        status: row.status,
        canRepair,
      });
    }
    const current = await this.recoveryRecord(code, true);
    await this.stampRepairActor(request, current);
    if (
      this.authorizationPolicyVersion() !== epoch ||
      m.digest(this.state(current)) !== m.digest(state) ||
      current.active !== target.active
    )
      this.fail("CONFLICT");
    return {
      version: 1,
      kind: "ENTERPRISE_ADMINISTRATION_STAMP_REPAIR",
      enterpriseCode: code,
      revision: state.revision,
      grants,
      presentation,
    };
  },
  /** Repairs only committed typed stamps under fresh explicit authority, retaining completed audit without replaying grant/reparent writes or taking a fence. @param {Object} request Inspected human command. @returns {Promise<Object>} Exact redacted completed repair receipt. */
  repairCommittedStamps: async function (request) {
    const m = this.memberships(),
      input = m
        .base()
        .input(request.body || {}, [
          "enterpriseCode",
          "revision",
          "operationId",
          "grantCodes",
        ]);
    m.base().input(request.query || {}, []);
    if (typeof input.enterpriseCode !== "string") this.fail("CONFLICT");
    SERVICE.DefaultEnterpriseService.hierarchyReferenceCode(
      input.enterpriseCode,
    );
    if (
      (request.params?.enterpriseCode !== undefined &&
        request.params.enterpriseCode !== input.enterpriseCode) ||
      !Number.isSafeInteger(input.revision) ||
      input.revision < 1 ||
      input.revision > 2147483647 ||
      typeof input.operationId !== "string" ||
      !/^[A-Za-z0-9_-]{1,128}$/.test(input.operationId || "")
    )
      this.fail("CONFLICT");
    const codes = this.selections(input.grantCodes, 100),
      hash = m.digest({
        enterpriseCode: input.enterpriseCode,
        revision: input.revision,
        operationId: input.operationId,
        grantCodes: codes,
      });
    let target = await this.recoveryRecord(input.enterpriseCode, true),
      actor = await this.stampRepairActor(request, target),
      state = this.state(target);
    const epoch = this.authorizationPolicyVersion(),
      retained = state.stampRepair;
    const history = state.stampRepairHistory ?? [];
    if (
      !Array.isArray(history) ||
      history.length > 100 ||
      history.some((row) => !row || row.phase !== "COMPLETE") ||
      (retained && retained.phase !== "COMPLETE")
    )
      this.fail("CONFLICT");
    const retry = retained?.id === input.operationId;
    if (history.some((row) => row.id === input.operationId))
      this.fail("CONFLICT");
    if (!retry && retained && history.length >= 100) this.fail("CONFLICT");
    if (
      retry
        ? retained.hash !== hash ||
          retained.phase !== "COMPLETE" ||
          retained.authorizationPolicyVersion !== epoch ||
          retained.completedRevision !== state.revision
        : state.revision !== input.revision
    )
      this.fail("CONFLICT");
    const subjects = await this.committedStampSubjects(target, codes),
      versions = subjects.map((grant) => ({
        code: grant.code,
        revision: grant.revision,
      }));
    if (retry && m.digest(versions) !== m.digest(retained.grantVersions))
      this.fail("CONFLICT");
    for (const subject of subjects) {
      target = await this.recoveryRecord(input.enterpriseCode, true);
      await this.stampRepairActor(request, target);
      if (
        this.state(target).revision !== state.revision ||
        this.authorizationPolicyVersion() !== epoch ||
        m.digest(await this.committedStampSubjects(target, codes)) !==
          m.digest(subjects)
      )
        this.fail("CONFLICT");
      await this.register(target.code, subject);
    }
    target = await this.recoveryRecord(input.enterpriseCode, true);
    actor = await this.stampRepairActor(request, target);
    if (
      this.state(target).revision !== state.revision ||
      this.authorizationPolicyVersion() !== epoch ||
      m.digest(await this.committedStampSubjects(target, codes)) !==
        m.digest(subjects)
    )
      this.fail("CONFLICT");
    if (!retry) {
      if (state.revision >= 2147483647) this.fail("CONFLICT");
      const audit = {
        id: input.operationId,
        hash,
        phase: "COMPLETE",
        inspectedRevision: input.revision,
        completedRevision: state.revision + 1,
        grantVersions: versions,
        authorizationPolicyVersion: epoch,
        completedAt: new Date().toISOString(),
        completedBy: actor.identity,
      };
      target = await this.persist(
        target,
        {
          ...state,
          revision: state.revision + 1,
          stampRepair: audit,
          stampRepairHistory: retained ? [...history, retained] : [...history],
        },
        true,
      );
      state = this.state(target);
    }
    // No held repair lease exists: interruption requires another explicit fresh inspection, not access-command replay.
    await this.stampRepairActor(request, target);
    if (this.authorizationPolicyVersion() !== epoch) this.fail("CONFLICT");
    for (const subject of subjects)
      if (
        (await SERVICE.DefaultPrincipalSecurityStampService.validateBindings([
          {
            tenant: m.authority(),
            principalId: this.stampKey(target.code, subject.code),
            authVersion: subject.revision,
          },
        ])) !== true
      )
        this.fail("CONFLICT");
    const confirmed = await this.recoveryRecord(input.enterpriseCode, true);
    if (m.digest(this.state(confirmed)) !== m.digest(state))
      this.fail("CONFLICT");
    await this.stampRepairActor(request, confirmed);
    if (
      this.authorizationPolicyVersion() !== epoch ||
      m.digest(await this.committedStampSubjects(confirmed, codes)) !==
        m.digest(subjects)
    )
      this.fail("CONFLICT");
    return {
      enterpriseCode: target.code,
      revision: state.revision,
      operationId: input.operationId,
      status: "COMPLETE",
      grantCodes: codes,
    };
  },
  /** Projects only bounded operator evidence, never identities, credential data or command hashes. @param {Object} enterprise Fresh record. @returns {Object} Safe inspected consent state. */
  project: function (enterprise) {
    const state = this.state(enterprise);
    return {
      enterpriseCode: enterprise.code,
      revision: state.revision,
      grants: state.grants.map((row) => ({
        code: row.code,
        revision: row.revision,
        sourceEnterpriseCode: row.sourceEnterpriseCode,
        status:
          row.status === "ACTIVE" &&
          Number.isFinite(Date.parse(row.expiresAt)) &&
          Date.parse(row.expiresAt) <= Date.now()
            ? "EXPIRED"
            : row.status,
        actions: Array.isArray(row.actions) ? [...row.actions] : undefined,
        roleCodes: Array.isArray(row.roleCodes)
          ? [...row.roleCodes]
          : undefined,
        expiresAt: row.expiresAt,
        createdAt: row.createdAt,
        revokedAt: row.revokedAt,
      })),
    };
  },
  /** Inspects target-owned consent without authorizing any operational access. @param {Object} request Signed target administrator. @returns {Promise<Object>} Redacted current state. */
  inspect: async function (request) {
    this.policy();
    this.memberships()
      .base()
      .input(request.query || {}, []);
    const target = await this.target(request);
    const authority = await this.commandActor(request, target);
    return this.projectAuthorized(target, authority);
  },
  /** Derives row revocation capability from stored status and fresh command authority, independently of display-only expiry. @param {Object} grant Private stored grant. @param {Object} authority Admitted target/platform/parent authority. @returns {boolean} Owner-permitted row selection. */
  canRevokeGrant: function (grant, authority) {
    return (
      grant?.status === "ACTIVE" &&
      (!authority.parent || grant.parentProof?.code === authority.parent.code)
    );
  },
  /** Narrows ancestor inspection to its selected parent grant and immutable dependent grants. @param {Object} target Fresh target. @param {Object} authority Admitted command authority. @returns {Object} Safe inspected state. */
  projectAuthorized: function (target, authority) {
    const state = this.state(target),
      stored = new Map(state.grants.map((grant) => [grant.code, grant]));
    const projected = this.project(target);
    const result = {
      ...projected,
      grants: projected.grants.map((grant) => ({
        ...grant,
        canRevoke: this.canRevokeGrant(stored.get(grant.code), authority),
      })),
    };
    if (!authority.parent) return result;
    const visible = new Set([authority.parent.code]);
    for (let depth = 0; depth < this.state(target).grants.length; depth++) {
      let changed = false;
      for (const grant of this.state(target).grants)
        if (visible.has(grant.parentProof?.code) && !visible.has(grant.code)) {
          visible.add(grant.code);
          changed = true;
        }
      if (!changed) break;
    }
    return {
      ...result,
      grants: result.grants.filter((grant) => visible.has(grant.code)),
    };
  },
  /** Publishes versioned policy-owned consent controls after fresh target/source admission; never publishes canonical locators or command hashes. @param {Object} request Signed human workspace request. @returns {Promise<Object>} Bounded inert workspace DTO. */
  workspace: async function (request) {
    const policy = this.policy(),
      m = this.memberships();
    m.base().input(request.query || {}, []);
    const target = await this.target(request),
      authority = await this.commandActor(request, target);
    const presentation = policy.workspace;
    if (
      !presentation ||
      presentation.version !== 1 ||
      !presentation.presentation ||
      typeof presentation.presentation.title !== "string" ||
      presentation.presentation.title.length > 160
    )
      this.fail("UNAVAILABLE");
    const keys = [
      "title",
      "grantLabel",
      "revokeLabel",
      "sourceLabel",
      "assignmentLabel",
      "roleLabel",
      "actionLabel",
      "recipientLabel",
      "expiryLabel",
      "confirmMessage",
      "uncertainMessage",
      "emptyMessage",
    ];
    const optionalKeys = [
      "inspectLabel",
      "workingLabel",
      "reviewTitle",
      "confirmLabel",
      "cancelLabel",
      "unavailableMessage",
      "recordedMessage",
    ];
    m.base().input(presentation.presentation, [...keys, ...optionalKeys]);
    if (
      [
        ...keys,
        ...optionalKeys.filter((key) =>
          Object.prototype.hasOwnProperty.call(presentation.presentation, key),
        ),
      ].some(
        (key) =>
          typeof presentation.presentation[key] !== "string" ||
          !presentation.presentation[key].trim() ||
          presentation.presentation[key].length > 500,
      )
    )
      this.fail("UNAVAILABLE");
    const chain = await SERVICE.DefaultEnterpriseService.hierarchy(target.code);
    const sourceCodes = authority.parent
      ? [authority.parent.sourceEnterpriseCode]
      : chain.slice(1).map((row) => row.code);
    if (sourceCodes.length > 100) this.fail("UNAVAILABLE");
    const sources = [];
    let assignmentCount = 0;
    for (const code of sourceCodes) {
      await this.relationship(target.code, code);
      const enterprise = await this.enterprise(code);
      const rows = await m.inventory(
        "DefaultEnterpriseAccessAssignmentService",
        m.authority(),
        { enterpriseCode: code, status: "REGISTERED" },
      );
      if (rows.length > 100) this.fail("UNAVAILABLE");
      const assignments = [];
      for (const row of rows) {
        if (!this.classifiedAdministrator(enterprise, row)) continue;
        try {
          const recipient = await this.assignmentRecipient(row.code, code);
          assignmentCount += 1;
          if (assignmentCount > 100) this.fail("UNAVAILABLE");
          const recipientName = this.recipientName(recipient);
          const roleLabel = this.businessLabel(
            SERVICE.DefaultEnterpriseManagementService.rolePolicy(row.roleCode)
              .label,
          );
          assignments.push({
            code: row.code,
            roleCode: row.roleCode,
            ...(recipientName ? { recipientName } : {}),
            ...(roleLabel ? { roleLabel } : {}),
          });
        } catch (error) {
          if (
            ![
              "ERR_PROFILE_CONSENT_FORBIDDEN",
              "ERR_PROFILE_MEMBERSHIP_FORBIDDEN",
              "ERR_PROFILE_MEMBERSHIP_IDENTITY",
              "ERR_PROFILE_MEMBERSHIP_ASSIGNMENT",
            ].includes(error?.code)
          )
            throw error;
        }
      }
      if (assignments.length) {
        const enterpriseName = this.businessLabel(
          typeof enterprise.name === "string"
            ? enterprise.name
            : enterprise.name?.en,
        );
        sources.push({
          enterpriseCode: code,
          ...(enterpriseName ? { enterpriseName } : {}),
          assignments,
        });
      }
    }
    const state = this.state(target),
      parent = authority.parent;
    const roleCodes = (
      parent ? parent.roleCodes : policy.allowedRoleCodes
    ).filter((code) => {
      const role = SERVICE.DefaultEnterpriseManagementService.rolePolicy(code);
      return (
        role.delegable === true &&
        role.administrationClass !== "ENTERPRISE_ADMIN" &&
        policy.allowedRoleCodes.includes(code)
      );
    });
    const actions = parent
      ? parent.actions
      : [
          "VIEW",
          "INVITE",
          ...(policy.onwardQualified === true ? ["MANAGE_ACCESS"] : []),
        ];
    const depthAvailable =
      !parent || (parent.delegationDepth || 0) < this.maximumDelegationDepth();
    await this.commandActor(request, await this.target(request), parent?.code);
    if (m.digest(this.state(await this.target(request))) !== m.digest(state))
      this.fail("CONFLICT");
    const authorizedProjection = this.projectAuthorized(target, authority);
    return {
      version: 1,
      kind: "ENTERPRISE_ADMINISTRATION_CONSENT",
      enterpriseCode: target.code,
      revision: state.revision,
      presentation: { ...presentation.presentation },
      grants: authorizedProjection.grants,
      availableCommands: [
        ...(depthAvailable &&
        sources.length &&
        roleCodes.length &&
        state.grants.length < policy.maximumGrants
          ? ["GRANT"]
          : []),
        ...(authorizedProjection.grants.some(
          (grant) => grant.canRevoke === true,
        )
          ? ["REVOKE"]
          : []),
      ],
      options: {
        sources,
        roleCodes,
        actions: [...actions],
        maximumRecipients: parent ? parent.recipients.length : 100,
        ...(parent
          ? {
              parentGrantCode: parent.code,
              recipients: [...parent.recipients],
              expiresNoLaterThan: parent.expiresAt,
            }
          : {}),
        maximumLifetimeDays: policy.maximumLifetimeDays,
      },
      mutation: {
        revisionRequired: true,
        operationIdRequired: true,
        automaticRetry: false,
        recipientField: "recipientAssignmentCode",
      },
    };
  },
  /** Projects bounded business copy only, never coercing arbitrary private objects. @param {*} value Owner-read display text. @returns {string|undefined} Safe optional label. */
  businessLabel: function (value) {
    if (typeof value !== "string") return undefined;
    const label = value.trim();
    return label && label.length <= 256 && !/[\u0000-\u001f\u007f]/u.test(label)
      ? label
      : undefined;
  },
  /** Uses only the accepted recipient's existing business name, without identity/address fallbacks. @param {Object} anchor Already-authorized recipient. @returns {string|undefined} Safe optional name. */
  recipientName: function (anchor) {
    const name = anchor?.person?.name;
    if (typeof name === "string") return this.businessLabel(name);
    if (!name || typeof name !== "object" || Array.isArray(name))
      return undefined;
    const first = this.businessLabel(name.firstName);
    const last = this.businessLabel(name.lastName);
    return first && last ? this.businessLabel(first + " " + last) : undefined;
  },
  /** Grants/revokes explicit target consent with immutable reviewed command identity and bounded dependent proof. @param {Object} request Signed target/platform/consented administrator. @returns {Promise<Object>} Redacted committed state. */
  command: async function (request) {
    const policy = this.policy(),
      m = this.memberships();
    m.base().input(request.query || {}, []);
    const input = m
      .base()
      .input(request.body || {}, [
        "operation",
        "operationId",
        "revision",
        "grantCode",
        "sourceEnterpriseCode",
        "recipientAssignmentCode",
        "parentGrantCode",
        "roleCodes",
        "actions",
        "recipients",
        "expiresAt",
      ]);
    if (
      !["GRANT", "REVOKE"].includes(input.operation) ||
      typeof input.operationId !== "string" ||
      !/^[A-Za-z0-9_-]{16,128}$/.test(input.operationId || "") ||
      !Number.isSafeInteger(input.revision) ||
      input.revision < 0
    )
      this.fail("CONFLICT");
    const target = await this.target(request);
    const authority = await this.commandActor(
        request,
        target,
        input.parentGrantCode,
      ),
      actor = authority.actor,
      state = this.state(target);
    const hash = m.digest({
      input,
      actor: actor.identity,
      target: target.code,
    });
    if (state.command?.id === input.operationId) {
      if (state.command.hash !== hash) this.fail("CONFLICT");
      for (const grant of state.grants) await this.register(target.code, grant);
      return this.projectAuthorized(target, authority);
    }
    if (state.revision !== input.revision || state.revision >= 2147483647)
      this.fail("CONFLICT");
    const grants = state.grants.map((row) => ({ ...row }));
    if (input.operation === "REVOKE") {
      if (
        Object.keys(input).some(
          (key) =>
            ![
              "operation",
              "operationId",
              "revision",
              "grantCode",
              "parentGrantCode",
            ].includes(key),
        )
      )
        this.fail("CONFLICT");
      const grant = grants.find((row) => row.code === input.grantCode);
      if (!grant || grant.status !== "ACTIVE" || grant.revision >= 2147483647)
        this.fail("CONFLICT");
      if (authority.parent && grant.parentProof?.code !== authority.parent.code)
        this.fail("FORBIDDEN");
      grant.status = "REVOKED";
      grant.revision += 1;
      grant.revokedAt = new Date().toISOString();
      grant.revokedBy = actor.identity;
      const revoked = new Set([grant.code]);
      for (let depth = 0; depth < grants.length; depth++) {
        let changed = false;
        for (const dependent of grants)
          if (
            dependent.status === "ACTIVE" &&
            revoked.has(dependent.parentProof?.code)
          ) {
            if (dependent.revision >= 2147483647) this.fail("CONFLICT");
            dependent.status = "REVOKED";
            dependent.revision += 1;
            dependent.revokedAt = grant.revokedAt;
            dependent.revokedBy = actor.identity;
            dependent.invalidation = {
              reason: "SOURCE_REVOKED",
              operationId: input.operationId,
            };
            revoked.add(dependent.code);
            changed = true;
          }
        if (!changed) break;
      }
    } else {
      if (
        input.grantCode !== undefined ||
        grants.length >= policy.maximumGrants
      )
        this.fail("CONFLICT");
      if (input.identity !== undefined) this.fail("FORBIDDEN");
      const recipient = await this.assignmentRecipient(
        input.recipientAssignmentCode,
        input.sourceEnterpriseCode,
      );
      const relationship = await this.relationship(
        target.code,
        input.sourceEnterpriseCode,
      );
      const recipientAuthority = await this.sourceAuthority(
        input.sourceEnterpriseCode,
        recipient.identity,
        input.recipientAssignmentCode,
      );
      const { roleCodes, actions, recipients } = this.ceilings(input);
      if (
        actions.includes("MANAGE_ACCESS") &&
        recipientAuthority.accessManagementAllowed !== true
      )
        this.fail("FORBIDDEN");
      const expiry = new Date(input.expiresAt);
      if (
        typeof input.expiresAt !== "string" ||
        !Number.isFinite(expiry.getTime()) ||
        expiry.getTime() <= Date.now() ||
        expiry.getTime() > Date.now() + policy.maximumLifetimeDays * 86400000
      )
        this.fail("CONFLICT");
      if (
        authority.parent &&
        (input.sourceEnterpriseCode !== authority.parent.sourceEnterpriseCode ||
          roleCodes.some(
            (code) => !authority.parent.roleCodes.includes(code),
          ) ||
          actions.some(
            (action) => !authority.parent.actions.includes(action),
          ) ||
          recipients.some(
            (email) => !authority.parent.recipients.includes(email),
          ) ||
          expiry.getTime() > Date.parse(authority.parent.expiresAt) ||
          (authority.parent.delegationDepth || 0) + 1 >
            this.maximumDelegationDepth())
      )
        this.fail("FORBIDDEN");
      grants.push({
        code: "consent_" + m.digest([target.code, input.operationId]),
        revision: 1,
        status: "ACTIVE",
        sourceEnterpriseCode: input.sourceEnterpriseCode,
        identity: recipient.identity,
        roleCodes,
        actions,
        recipients,
        relationship,
        recipientAuthority,
        expiresAt: expiry.toISOString(),
        createdAt: new Date().toISOString(),
        grantedBy: actor.identity,
        grantingAuthVersion: actor.person.authVersion || 1,
        grantingEnterpriseCode: authority.enterpriseCode,
        grantingAuthority: authority.parent
          ? authority.parent.recipientAuthority
          : actor.administrationAuthority,
        platformAuthority: authority.platform === true,
        ...(authority.parentProof
          ? {
              parentProof: { ...authority.parentProof },
              delegationDepth: (authority.parent.delegationDepth || 0) + 1,
            }
          : { delegationDepth: 0 }),
      });
    }
    await this.commandActor(
      request,
      await this.target(request),
      authority.parent?.code,
    );
    if (input.operation === "GRANT") {
      const grant = grants[grants.length - 1],
        version = this.authorizationPolicyVersion();
      if (
        grant.recipientAuthority.authorizationPolicyVersion !== version ||
        grant.grantingAuthority.authorizationPolicyVersion !== version
      )
        this.fail("CONFLICT");
    }
    const saved = await this.persist(target, {
      ...state,
      version: 1,
      revision: state.revision + 1,
      grants,
      command: {
        id: input.operationId,
        hash,
        actor: actor.identity,
        at: new Date().toISOString(),
      },
    });
    if (input.operation === "GRANT") {
      const grant = grants[grants.length - 1];
      await this.validate(target.code, {
        owner: "profile.administrationConsent",
        code: grant.code,
        revision: grant.revision,
      });
    }
    for (const grant of grants) await this.register(target.code, grant);
    return this.projectAuthorized(saved, authority);
  },
  /** Revalidates retained consent dependencies without converting it into a direct grant. @param {string} targetCode Target enterprise. @param {Object} proof Exact private consent proof. @returns {Promise<Object>} Current active grant or rejection. */
  validate: async function (targetCode, proof, visited = []) {
    this.policy();
    const authorizationPolicyVersion = this.authorizationPolicyVersion();
    if (!proof || proof.owner !== "profile.administrationConsent")
      this.fail("FORBIDDEN");
    this.memberships().base().input(proof, ["owner", "code", "revision"]);
    if (
      typeof proof.code !== "string" ||
      !/^[A-Za-z0-9_-]{1,128}$/.test(proof.code) ||
      !Number.isSafeInteger(proof.revision) ||
      proof.revision < 1
    )
      this.fail("FORBIDDEN");
    if (
      !Array.isArray(visited) ||
      visited.includes(proof.code) ||
      visited.length > this.maximumDelegationDepth()
    )
      this.fail("FORBIDDEN");
    const target = await this.enterprise(targetCode),
      m = this.memberships();
    const grant = this.state(target).grants.find(
      (row) => row.code === proof.code,
    );
    if (
      !grant ||
      grant.status !== "ACTIVE" ||
      grant.revision !== proof.revision ||
      !Number.isFinite(new Date(grant.expiresAt).getTime()) ||
      new Date(grant.expiresAt).getTime() <= Date.now()
    )
      this.fail("FORBIDDEN");
    if (
      grant.recipientAuthority?.authorizationPolicyVersion !==
        authorizationPolicyVersion ||
      grant.grantingAuthority?.authorizationPolicyVersion !==
        authorizationPolicyVersion
    )
      this.fail("FORBIDDEN");
    const normalized = this.ceilings(grant);
    if (m.digest(normalized.recipients) !== m.digest(grant.recipients))
      this.fail("FORBIDDEN");
    if (
      m.digest(
        await this.relationship(targetCode, grant.sourceEnterpriseCode),
      ) !== m.digest(grant.relationship)
    )
      this.fail("FORBIDDEN");
    const grantingActor = await m.anchor(grant.grantedBy);
    if (
      (grantingActor.person.authVersion || 1) !== grant.grantingAuthVersion ||
      !grant.grantingAuthority
    )
      this.fail("FORBIDDEN");
    if (grant.parentProof) {
      if (this.policy().onwardQualified !== true) this.fail("FORBIDDEN");
      const parent = await this.validate(targetCode, grant.parentProof, [
        ...visited,
        grant.code,
      ]);
      if (
        !parent.actions.includes("MANAGE_ACCESS") ||
        grant.sourceEnterpriseCode !== parent.sourceEnterpriseCode ||
        grant.grantingEnterpriseCode !== parent.sourceEnterpriseCode ||
        m.digest(grant.grantedBy) !== m.digest(parent.identity) ||
        m.digest(grant.grantingAuthority) !==
          m.digest(parent.recipientAuthority) ||
        grant.delegationDepth !== (parent.delegationDepth || 0) + 1 ||
        grant.delegationDepth > this.maximumDelegationDepth() ||
        grant.roleCodes.some((code) => !parent.roleCodes.includes(code)) ||
        grant.actions.some((action) => !parent.actions.includes(action)) ||
        grant.recipients.some((email) => !parent.recipients.includes(email)) ||
        Date.parse(grant.expiresAt) > Date.parse(parent.expiresAt)
      )
        this.fail("FORBIDDEN");
    } else {
      const grantingEnterpriseCode = grant.grantingEnterpriseCode;
      if (
        grantingEnterpriseCode !== targetCode &&
        !(
          (grant.platformAuthority || grant.creationAuthority) &&
          grantingEnterpriseCode ===
            (CONFIG.get("defaultEnterprise") || "default")
        )
      )
        this.fail("FORBIDDEN");
      const currentAuthority = await this.sourceAuthority(
        grantingEnterpriseCode,
        grant.grantedBy,
        grant.grantingAuthority.code,
      );
      if (
        m.digest(currentAuthority) !== m.digest(grant.grantingAuthority) ||
        ((grant.platformAuthority || grant.creationAuthority) &&
          currentAuthority.platformAdministrator !== true)
      )
        this.fail("FORBIDDEN");
    }
    if (
      m.digest(
        await this.sourceAuthority(
          grant.sourceEnterpriseCode,
          grant.identity,
          grant.recipientAuthority?.code,
        ),
      ) !== m.digest(grant.recipientAuthority)
    )
      this.fail("FORBIDDEN");
    if (
      grant.actions.includes("MANAGE_ACCESS") &&
      grant.recipientAuthority.accessManagementAllowed !== true
    )
      this.fail("FORBIDDEN");
    if (this.authorizationPolicyVersion() !== authorizationPolicyVersion)
      this.fail("CONFLICT");
    return grant;
  },
  /** Resolves only current explicit VIEW targets, with a bounded complete owner inventory and no operational-data authority. @param {Object} request Signed ancestor context. @returns {Promise<string[]>} Authorized enterprise codes. */
  visibleEnterpriseCodes: async function (request) {
    this.policy();
    const m = this.memberships(),
      actor = await m.actor(request);
    if (request.authData.principalType !== "human") this.fail("FORBIDDEN");
    const rows = m.mutationRows(
      await this.read(SERVICE.DefaultEnterpriseService, {
        tenant: CONFIG.get("defaultTenant") || "default",
        authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
        query: {
          active: true,
          "administrationConsent.grants": {
            $elemMatch: {
              status: "ACTIVE",
              sourceEnterpriseCode: request.authData.entCode,
              actions: "VIEW",
              "identity.recordId": actor.identity.recordId,
              "identity.recordKind": actor.identity.recordKind,
              "identity.tenantCode": actor.identity.tenantCode,
            },
          },
        },
        options: { recursive: false, skipItemCache: true },
        searchOptions: { pageSize: 101, pageNumber: 1 },
      }),
    );
    if (rows.length > 100) this.fail("UNAVAILABLE");
    const result = [request.authData.entCode];
    for (const row of rows)
      for (const grant of this.state(row).grants) {
        if (
          grant.status !== "ACTIVE" ||
          grant.sourceEnterpriseCode !== request.authData.entCode ||
          !grant.actions.includes("VIEW") ||
          m.digest(grant.identity) !== m.digest(actor.identity)
        )
          continue;
        try {
          await this.validate(row.code, {
            owner: "profile.administrationConsent",
            code: grant.code,
            revision: grant.revision,
          });
          result.push(row.code);
        } catch (error) {
          if (error?.code !== "ERR_PROFILE_CONSENT_FORBIDDEN") throw error;
        }
      }
    return [...new Set(result)];
  },
  /** Finds exactly one current explicit invitation grant with a role/action/recipient ceiling. @param {Object} request Signed ancestor administrator. @param {string} targetCode Exact target. @param {string} roleCode Requested target responsibility. @param {string} email Requested invitation recipient. @returns {Promise<Object>} Private bounded proof, not an operational session. */
  authorizeInvitation: async function (request, targetCode, roleCode, email) {
    this.policy();
    const m = this.memberships(),
      actor = await m.actor(request);
    if (request.authData.principalType !== "human") this.fail("FORBIDDEN");
    m.permission(request, "profile.enterpriseAccess.assign");
    const target = await this.enterprise(targetCode);
    const normalizedEmail =
      SERVICE.DefaultEnterpriseManagementService.normalizeEmail(email);
    const candidates = this.state(target).grants.filter(
      (grant) =>
        grant.status === "ACTIVE" &&
        grant.sourceEnterpriseCode === request.authData.entCode &&
        m.digest(grant.identity) === m.digest(actor.identity) &&
        grant.actions.includes("INVITE") &&
        grant.roleCodes.includes(roleCode) &&
        grant.recipients.includes(normalizedEmail),
    );
    if (candidates.length !== 1) this.fail("FORBIDDEN");
    const proof = {
      owner: "profile.administrationConsent",
      code: candidates[0].code,
      revision: candidates[0].revision,
    };
    await this.validate(targetCode, proof);
    return proof;
  },
  /** Rechecks an invitation's retained ceiling at acceptance and every issued/renewed membership context. @param {Object} item Retained assignment. @returns {Promise<Object|null>} Current dependent grant. */
  validateInvitation: async function (item) {
    const proof = item.invitationAuthority?.administrationConsent;
    if (!proof) return null;
    const grant = await this.validate(item.enterpriseCode, proof);
    const m = this.memberships();
    if (
      !grant.actions.includes("INVITE") ||
      !grant.roleCodes.includes(item.roleCode) ||
      !grant.recipients.includes(item.normalizedEmail) ||
      item.invitationAuthority.enterpriseCode !== grant.sourceEnterpriseCode ||
      m.digest(item.invitationAuthority.identity) !== m.digest(grant.identity)
    )
      this.fail("FORBIDDEN");
    return grant;
  },
  /** Applies a held hierarchy operation through conditional generated writes and exact own-patch readback. @param {Object} record Current enterprise. @param {Object} predicate Inspected operation predicate. @param {Object} patch Managed fields. @returns {Promise<Object>} Fresh retained state. */
  persistHierarchy: async function (record, predicate, patch) {
    this.policy();
    const m = this.memberships(),
      command = {
        tenant: CONFIG.get("defaultTenant") || "default",
        authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
        query: { code: record.code, active: true, ...predicate },
        model: patch,
        options: { recursive: false },
      };
    writes.add(command);
    let failure;
    try {
      const response = await SERVICE.DefaultEnterpriseService.update(command);
      m.base().assertWrite(response);
      if (response.result?.matchedCount !== 1) this.fail("CONFLICT");
    } catch (error) {
      failure = error;
    } finally {
      writes.delete(command);
    }
    const saved = await this.recoveryRecord(record.code);
    if (
      Object.keys(patch).some(
        (key) => m.digest(saved[key]) !== m.digest(patch[key]),
      )
    ) {
      if (failure) throw failure;
      this.fail("CONFLICT");
    }
    return saved;
  },
  /** Serializes tree mutations on the existing platform Enterprise without another registry or timeout-based takeover. @param {Object} input Reviewed command. @param {string} hash Original actor/command hash. @returns {Promise<Object>} Global owner fence. */
  acquireHierarchySerial: async function (input, hash) {
    const record = await this.recoveryRecord(
      CONFIG.get("defaultEnterprise") || "default",
    );
    if (record.code === input.enterpriseCode) this.fail("FORBIDDEN");
    const old = record.administrationHierarchySerialOperation;
    if (old?.id === input.operationId) {
      if (old.hash !== hash || old.targetCode !== input.enterpriseCode)
        this.fail("CONFLICT");
      return old;
    }
    if (old && !["COMPLETE", "CANCELLED"].includes(old.phase))
      this.fail("CONFLICT");
    const revision = old?.revision ?? 0;
    if (
      !Number.isSafeInteger(revision) ||
      revision < 0 ||
      revision >= 2147483647
    )
      this.fail("CONFLICT");
    const operation = {
      id: input.operationId,
      hash,
      targetCode: input.enterpriseCode,
      revision: revision + 1,
      phase: "PENDING",
      at: new Date().toISOString(),
    };
    await this.persistHierarchy(
      record,
      old
        ? {
            "administrationHierarchySerialOperation.id": old.id,
            "administrationHierarchySerialOperation.revision": old.revision,
            "administrationHierarchySerialOperation.phase": old.phase,
          }
        : { administrationHierarchySerialOperation: { $exists: false } },
      { administrationHierarchySerialOperation: operation },
    );
    return operation;
  },
  /** Completes only the exact retained global fence after confirmed child completion. @param {Object} operation Original serial operation. @returns {Promise<void>} Awaited completion or retained uncertainty. */
  completeHierarchySerial: async function (operation) {
    const record = await this.recoveryRecord(
      CONFIG.get("defaultEnterprise") || "default",
    );
    const current = record.administrationHierarchySerialOperation;
    if (
      current?.id !== operation.id ||
      current.hash !== operation.hash ||
      current.revision !== operation.revision
    )
      this.fail("CONFLICT");
    if (current.phase === "COMPLETE") return;
    if (current.phase !== "PENDING") this.fail("CONFLICT");
    await this.persistHierarchy(
      record,
      {
        "administrationHierarchySerialOperation.id": operation.id,
        "administrationHierarchySerialOperation.hash": operation.hash,
        "administrationHierarchySerialOperation.revision": operation.revision,
        "administrationHierarchySerialOperation.phase": "PENDING",
      },
      {
        administrationHierarchySerialOperation: {
          ...current,
          phase: "COMPLETE",
          completedAt: new Date().toISOString(),
        },
      },
    );
  },
  /** Reparents under a retained platform operation; dependent grants are revoked before completing the relationship change. @param {Object} request Fresh platform PASSWORD authority and reviewed epoch. @returns {Promise<Object>} Redacted outcome. */
  reparent: async function (request) {
    const policy = this.policy(),
      m = this.memberships();
    if (policy.reparentQualified !== true) this.fail("UNAVAILABLE");
    const actor = await this.platformActor(request);
    m.permission(request, policy.reparentPermission);
    m.base().input(request.query || {}, []);
    const input = m
      .base()
      .input(request.body || {}, [
        "enterpriseCode",
        "parentCode",
        "epoch",
        "operationId",
      ]);
    if (
      !Number.isSafeInteger(input.epoch) ||
      input.epoch < 0 ||
      input.epoch >= 2147483647 ||
      typeof input.operationId !== "string" ||
      !/^[A-Za-z0-9_-]{16,128}$/.test(input.operationId)
    )
      this.fail("CONFLICT");
    SERVICE.DefaultEnterpriseService.hierarchyReferenceCode(
      input.enterpriseCode,
    );
    if (input.parentCode !== null)
      SERVICE.DefaultEnterpriseService.hierarchyReferenceCode(input.parentCode);
    const hash = m.digest({ input, actor: actor.identity });
    const inspected = await this.recoveryRecord(input.enterpriseCode),
      held = inspected.administrationHierarchyOperation;
    if (held?.id === input.operationId) {
      if (held.hash !== hash || !["PENDING", "COMPLETE"].includes(held.phase))
        this.fail("CONFLICT");
    } else {
      if (
        !this.terminalHierarchy(inspected) ||
        (inspected.administrationHierarchyEpoch ?? 0) !== input.epoch
      )
        this.fail("CONFLICT");
      if (input.parentCode !== null)
        await this.relationshipForParent(input.parentCode, inspected.code);
    }
    const serial = await this.acquireHierarchySerial(input, hash);
    let record = await this.recoveryRecord(input.enterpriseCode);
    let operation = record.administrationHierarchyOperation;
    if (operation?.id === input.operationId) {
      if (operation.hash !== hash) this.fail("CONFLICT");
      if (operation.cancelled === true) this.fail("CONFLICT");
      if (operation.phase === "COMPLETE") {
        await this.completeHierarchySerial(serial);
        return {
          enterpriseCode: record.code,
          parentCode: input.parentCode,
          epoch: record.administrationHierarchyEpoch,
          status: "COMPLETE",
        };
      }
      if (
        operation.phase !== "PENDING" ||
        record.administrationHierarchyEpoch !== input.epoch + 1
      )
        this.fail("CONFLICT");
    } else {
      if (
        !this.terminalHierarchy(record) ||
        (record.administrationHierarchyEpoch ?? 0) !== input.epoch
      )
        this.fail("CONFLICT");
      if (input.parentCode !== null)
        await this.relationshipForParent(input.parentCode, record.code);
      const targets = m.mutationRows(
        await this.read(SERVICE.DefaultEnterpriseService, {
          tenant: CONFIG.get("defaultTenant") || "default",
          authData:
            SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
          query: {
            "administrationConsent.grants.relationship.code": record.code,
          },
          options: { recursive: false, skipItemCache: true },
          searchOptions: { pageSize: 101, pageNumber: 1 },
        }),
      );
      if (targets.length > 100) this.fail("UNAVAILABLE");
      operation = {
        id: input.operationId,
        hash,
        actor: actor.identity,
        phase: "PENDING",
        previousEpoch: input.epoch,
        previousParent:
          SERVICE.DefaultEnterpriseService.hierarchyReferenceCode(
            record.superEnterprise,
            true,
          ) ?? null,
        nextParent: input.parentCode,
        targetCodes: targets.map((row) => row.code).sort(),
        at: new Date().toISOString(),
      };
      record = await this.persistHierarchy(
        record,
        {
          ...(record.administrationHierarchyEpoch === undefined
            ? { administrationHierarchyEpoch: { $exists: false } }
            : { administrationHierarchyEpoch: input.epoch }),
          ...(record.superEnterprise === undefined
            ? { superEnterprise: { $exists: false } }
            : { superEnterprise: record.superEnterprise }),
          ...(record.administrationHierarchyOperation
            ? {
                "administrationHierarchyOperation.id":
                  record.administrationHierarchyOperation.id,
                "administrationHierarchyOperation.phase":
                  record.administrationHierarchyOperation.phase,
              }
            : { administrationHierarchyOperation: { $exists: false } }),
        },
        {
          administrationHierarchyEpoch: input.epoch + 1,
          administrationHierarchyOperation: operation,
        },
      );
    }
    if (
      !Array.isArray(operation.targetCodes) ||
      operation.targetCodes.length > 100 ||
      new Set(operation.targetCodes).size !== operation.targetCodes.length
    )
      this.fail("CONFLICT");
    for (const code of operation.targetCodes) {
      const heldRecord = await this.recoveryRecord(record.code);
      if (
        heldRecord.administrationHierarchyEpoch !== input.epoch + 1 ||
        m.digest(heldRecord.administrationHierarchyOperation) !==
          m.digest(operation)
      )
        this.fail("CONFLICT");
      const target = await this.recoveryRecord(code),
        state = this.state(target);
      const grants = state.grants.map((grant) => ({ ...grant }));
      let changed = false;
      for (const grant of grants) {
        if (
          grant.status === "ACTIVE" &&
          grant.relationship.some(
            (row) => row.code === record.code && row.epoch === input.epoch,
          )
        ) {
          if (grant.revision >= 2147483647) this.fail("CONFLICT");
          grant.status = "REVOKED";
          grant.revision += 1;
          grant.revokedAt = operation.at;
          grant.revokedBy = actor.identity;
          grant.invalidation = {
            reason: "HIERARCHY_CHANGED",
            operationId: operation.id,
          };
          changed = true;
        }
      }
      if (changed) {
        if (state.revision >= 2147483647) this.fail("CONFLICT");
        await this.persist(target, {
          ...state,
          revision: state.revision + 1,
          grants,
        });
      }
      for (const grant of grants.filter(
        (row) => row.invalidation?.operationId === operation.id,
      ))
        await this.register(code, grant);
    }
    // Revalidate before commit; held operations are never timed out or stolen.
    if (input.parentCode !== null)
      await this.relationshipForParent(input.parentCode, record.code);
    await this.platformActor(request);
    const current = await this.recoveryRecord(record.code);
    if (
      m.digest(current.administrationHierarchyOperation) !== m.digest(operation)
    )
      this.fail("CONFLICT");
    const saved = await this.persistHierarchy(
      current,
      {
        administrationHierarchyEpoch: input.epoch + 1,
        "administrationHierarchyOperation.id": operation.id,
        "administrationHierarchyOperation.hash": operation.hash,
        "administrationHierarchyOperation.phase": "PENDING",
        ...(current.superEnterprise === undefined
          ? { superEnterprise: { $exists: false } }
          : { superEnterprise: current.superEnterprise }),
      },
      {
        superEnterprise: input.parentCode,
        administrationHierarchyOperation: {
          ...operation,
          phase: "COMPLETE",
          completedAt: new Date().toISOString(),
        },
      },
    );
    await this.completeHierarchySerial(serial);
    return {
      enterpriseCode: saved.code,
      parentCode: input.parentCode,
      epoch: saved.administrationHierarchyEpoch,
      status: "COMPLETE",
    };
  },
  /** Explicitly cancels an exact reviewed uncommitted child without rolling back epochs/rights, or completes a proven committed child; never steals/resumes another actor's operation. @param {Object} request Fresh platform PASSWORD recovery command. @returns {Promise<Object>} Redacted terminal graph state. */
  recoverHierarchySerial: async function (request) {
    const policy = this.policy(),
      m = this.memberships();
    if (
      policy.reparentQualified !== true ||
      policy.hierarchyRecoveryQualified !== true ||
      typeof policy.hierarchyRecoveryPermission !== "string" ||
      !policy.hierarchyRecoveryPermission
    )
      this.fail("UNAVAILABLE");
    const actor = await this.platformActor(request);
    m.permission(request, policy.hierarchyRecoveryPermission);
    m.base().input(request.query || {}, []);
    const input = m
      .base()
      .input(request.body || {}, ["enterpriseCode", "operationId", "revision"]);
    if (
      typeof input.operationId !== "string" ||
      !/^[A-Za-z0-9_-]{16,128}$/.test(input.operationId) ||
      !Number.isSafeInteger(input.revision)
    )
      this.fail("CONFLICT");
    const platform = await this.recoveryRecord(
        CONFIG.get("defaultEnterprise") || "default",
      ),
      serial = platform.administrationHierarchySerialOperation;
    if (
      !serial ||
      serial.id !== input.operationId ||
      serial.revision !== input.revision ||
      serial.targetCode !== input.enterpriseCode
    )
      this.fail("CONFLICT");
    if (["COMPLETE", "CANCELLED"].includes(serial.phase))
      return {
        enterpriseCode: serial.targetCode,
        revision: serial.revision,
        status: serial.phase,
      };
    if (serial.phase !== "PENDING") this.fail("CONFLICT");
    let child = await this.recoveryRecord(serial.targetCode),
      operation = child.administrationHierarchyOperation;
    if (operation?.phase === "PENDING") {
      if (
        operation.id !== serial.id ||
        operation.hash !== serial.hash ||
        !Number.isSafeInteger(operation.previousEpoch) ||
        operation.previousEpoch < 0 ||
        operation.previousEpoch >= 2147483647 ||
        child.administrationHierarchyEpoch !== operation.previousEpoch + 1 ||
        SERVICE.DefaultEnterpriseService.hierarchyReferenceCode(
          child.superEnterprise,
          true,
        ) !== (operation.previousParent ?? undefined) ||
        !Array.isArray(operation.targetCodes) ||
        operation.targetCodes.length > 100 ||
        new Set(operation.targetCodes).size !== operation.targetCodes.length
      )
        this.fail("CONFLICT");
      await this.platformActor(request);
      m.permission(request, policy.hierarchyRecoveryPermission);
      child = await this.persistHierarchy(
        child,
        {
          administrationHierarchyEpoch: operation.previousEpoch + 1,
          "administrationHierarchyOperation.id": operation.id,
          "administrationHierarchyOperation.hash": operation.hash,
          "administrationHierarchyOperation.phase": "PENDING",
          "administrationHierarchyOperation.previousEpoch":
            operation.previousEpoch,
          ...(child.superEnterprise === undefined
            ? { superEnterprise: { $exists: false } }
            : { superEnterprise: child.superEnterprise }),
        },
        {
          administrationHierarchyOperation: {
            ...operation,
            phase: "CANCELLED",
            cancelled: true,
            cancelledAt: new Date().toISOString(),
            cancelledBy: actor.identity,
            cancellationReason: "ABANDONED_BEFORE_PARENT_COMMIT",
          },
        },
      );
      operation = child.administrationHierarchyOperation;
    }
    if (operation?.id === serial.id && operation.cancelled !== true) {
      if (
        operation.hash !== serial.hash ||
        operation.phase !== "COMPLETE" ||
        SERVICE.DefaultEnterpriseService.hierarchyReferenceCode(
          child.superEnterprise,
          true,
        ) !== (operation.nextParent ?? undefined)
      )
        this.fail("CONFLICT");
      await this.platformActor(request);
      m.permission(request, policy.hierarchyRecoveryPermission);
      await this.completeHierarchySerial(serial);
      return {
        enterpriseCode: serial.targetCode,
        revision: serial.revision,
        status: "COMPLETE",
      };
    }
    if (operation?.id !== serial.id || operation.cancelled !== true) {
      if (!this.terminalHierarchy(child)) this.fail("CONFLICT");
      const cancellation = {
        id: serial.id,
        hash: serial.hash,
        actor: actor.identity,
        phase: "COMPLETE",
        cancelled: true,
        previousParent:
          SERVICE.DefaultEnterpriseService.hierarchyReferenceCode(
            child.superEnterprise,
            true,
          ) ?? null,
        nextParent:
          SERVICE.DefaultEnterpriseService.hierarchyReferenceCode(
            child.superEnterprise,
            true,
          ) ?? null,
        targetCodes: [],
        at: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        cancellationReason: "NO_CHILD_MUTATION",
      };
      // A child CAS wins against the original command's own PENDING acquisition; a graph read alone cannot prove cancellation is safe.
      await this.persistHierarchy(
        child,
        {
          ...(operation
            ? {
                "administrationHierarchyOperation.id": operation.id,
                "administrationHierarchyOperation.phase": operation.phase,
              }
            : { administrationHierarchyOperation: { $exists: false } }),
          ...(child.administrationHierarchyEpoch === undefined
            ? { administrationHierarchyEpoch: { $exists: false } }
            : {
                administrationHierarchyEpoch:
                  child.administrationHierarchyEpoch,
              }),
          ...(child.superEnterprise === undefined
            ? { superEnterprise: { $exists: false } }
            : { superEnterprise: child.superEnterprise }),
        },
        { administrationHierarchyOperation: cancellation },
      );
    } else if (operation.hash !== serial.hash || !this.terminalHierarchy(child))
      this.fail("CONFLICT");
    const cancellationRecord = await this.recoveryRecord(serial.targetCode),
      cancelledOperation = cancellationRecord.administrationHierarchyOperation;
    if (
      cancelledOperation?.id !== serial.id ||
      cancelledOperation.hash !== serial.hash ||
      cancelledOperation.cancelled !== true ||
      !this.terminalHierarchy(cancellationRecord) ||
      !["NO_CHILD_MUTATION", "ABANDONED_BEFORE_PARENT_COMMIT"].includes(
        cancelledOperation.cancellationReason,
      )
    )
      this.fail("CONFLICT");
    await this.platformActor(request);
    m.permission(request, policy.hierarchyRecoveryPermission);
    await this.persistHierarchy(
      platform,
      {
        "administrationHierarchySerialOperation.id": serial.id,
        "administrationHierarchySerialOperation.hash": serial.hash,
        "administrationHierarchySerialOperation.revision": serial.revision,
        "administrationHierarchySerialOperation.phase": "PENDING",
      },
      {
        administrationHierarchySerialOperation: {
          ...serial,
          phase: "CANCELLED",
          cancelledAt: new Date().toISOString(),
          cancelledBy: actor.identity,
          cancellationReason: cancelledOperation.cancellationReason,
        },
      },
    );
    return {
      enterpriseCode: serial.targetCode,
      revision: serial.revision,
      status: "CANCELLED",
    };
  },
  /** Inspects a retained hierarchy operation without exposing its canonical actors, target list or command hash. @param {Object} request Fresh platform request and exact target. @returns {Promise<Object>} Redacted recovery state. */
  inspectHierarchy: async function (request) {
    const policy = this.policy();
    await this.platformActor(request);
    this.memberships().permission(request, policy.reparentPermission);
    const input = this.memberships()
      .base()
      .input(request.query || {}, ["enterpriseCode"]);
    const record = await this.recoveryRecord(input.enterpriseCode),
      operation = record.administrationHierarchyOperation;
    const platform = await this.recoveryRecord(
      CONFIG.get("defaultEnterprise") || "default",
    );
    const serial = platform.administrationHierarchySerialOperation;
    return {
      enterpriseCode: record.code,
      epoch: record.administrationHierarchyEpoch ?? 0,
      parentCode:
        SERVICE.DefaultEnterpriseService.hierarchyReferenceCode(
          record.superEnterprise,
          true,
        ) ?? null,
      operation: operation
        ? {
            id: operation.id,
            phase: operation.cancelled === true ? "CANCELLED" : operation.phase,
            previousParent: operation.previousParent,
            nextParent: operation.nextParent,
            affectedTargetCount: operation.targetCodes.length,
          }
        : null,
      serialOperation: serial
        ? {
            id: serial.id,
            phase: serial.phase,
            targetCode: serial.targetCode,
            revision: serial.revision,
          }
        : null,
    };
  },
  /** Rejects public manufacturing of private consent and generic reparenting while enforcement is enabled. @param {Object} request Generated save/update/remove. @returns {boolean} Unrelated mutation only. */
  protect: function (request) {
    if (this.ownsWrite(request)) return true;
    const m = this.memberships();
    const models = Array.isArray(request.model)
      ? request.model
      : [request.model || {}];
    const enabled =
      CONFIG.get("enterpriseManagement.administrationConsent.enabled") === true;
    for (const model of models) {
      if (
        m
          .paths(model)
          .some((path) =>
            [
              "administrationConsent",
              "administrationHierarchyEpoch",
              "administrationHierarchyOperation",
              "administrationHierarchySerialOperation",
              ...(enabled ? ["superEnterprise", "subEnterprises"] : []),
            ].some((key) => path === key || path.startsWith(key + ".")),
          )
      )
        this.fail("FORBIDDEN");
    }
    return true;
  },
  /** Rejects generic save/upsert replacing an already governed Enterprise record. @param {Object} request Generated save. @returns {Promise<boolean>} Safe unmanaged creation only. */
  protectSave: async function (request) {
    this.protect(request);
    if (this.ownsWrite(request)) return true;
    const models = Array.isArray(request.model)
      ? request.model
      : [request.model || {}];
    for (const model of models) {
      if (!model.code) this.fail("CONFLICT");
      const rows = this.memberships().mutationRows(
        await this.read(SERVICE.DefaultEnterpriseService, {
          tenant: request.tenant,
          authData:
            SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
          query: { code: model.code },
          options: { recursive: false, skipItemCache: true },
          searchOptions: { pageSize: 2, pageNumber: 1 },
        }),
      );
      if (
        rows.length > 1 ||
        rows.some((row) => row.administrationConsent !== undefined)
      )
        this.fail("FORBIDDEN");
    }
    return true;
  },
  /** Blocks generic deletion of retained consent evidence rather than silently losing history. @param {Object} request Generated removal. @returns {Promise<boolean>} Unmanaged deletion only. */
  protectRemove: async function (request) {
    const rows = this.memberships().mutationRows(
      await this.read(SERVICE.DefaultEnterpriseService, {
        tenant: request.tenant,
        authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
        query: request.query || {},
        options: { recursive: false, skipItemCache: true },
        searchOptions: { pageSize: 101, pageNumber: 1 },
      }),
    );
    if (
      rows.length > 100 ||
      rows.some((row) => row.administrationConsent !== undefined)
    )
      this.fail("FORBIDDEN");
    request.query = {
      ...(request.query || {}),
      administrationConsent: { $exists: false },
    };
    return true;
  },
};
