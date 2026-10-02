/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module profile/service/identity/DefaultPrincipalScopeGovernanceService
 * @description Validates and resolves tenant, enterprise, catalog, and operational scope assignments for Profile-owned principals.
 * @layer service
 * @owner profile
 * @override Project modules may extend scope types, effects, and resolver behavior through configuration and later-layer services.
 */
const scopeMutationTargets = new WeakMap();
module.exports = {
  /** Captures private old/new non-runtime scope targets and awaits pre-write invalidation. */
  prepareScopeInvalidation: async function (request, assignments) {
    const targets = assignments
      .filter((item) => item.scopeType !== "RUNTIME_DEPLOYMENT")
      .map((item) => ({
        principalType: item.principalType,
        principalCode: item.principalCode,
        groupCode: item.groupCode,
      }));
    scopeMutationTargets.set(request, targets);
    return this.invalidateScopeCredentials(request);
  },
  /** Invalidates current direct/group principals after persistence using captured private targets. */
  invalidateScopeCredentials: async function (request) {
    const targets = scopeMutationTargets.get(request);
    if (!targets)
      throw new CLASSES.NodicsError(
        "ERR_AUTH_00003",
        "Prepared scope invalidation is required",
      );
    if (!targets.length) return true;
    const stamps = SERVICE.DefaultPrincipalSecurityStampGovernanceService;
    const groups = targets.some((target) => target.principalType === "group")
      ? await stamps.inventory(
          SERVICE.DefaultUserGroupService,
          request.tenant,
          {},
        )
      : [];
    const groupCodes = [
      ...new Set(
        targets
          .filter((target) => target.principalType === "group")
          .flatMap((target) => {
            if (
              typeof target.groupCode !== "string" ||
              !target.groupCode.trim()
            )
              throw new CLASSES.NodicsError("ERR_AUTH_00003");
            return stamps.getAffectedGroupCodes(groups, target.groupCode);
          }),
      ),
    ];
    const seen = new Set(),
      membershipIds = [],
      customerIds = [];
    for (const [service, kinds, recordKind] of [
      [SERVICE.DefaultEmployeeService, ["human", "service"], "EMPLOYEE"],
      [SERVICE.DefaultCustomerService, ["customer"], "CUSTOMER"],
    ]) {
      const selectors = groupCodes.length
        ? [{ userGroups: { $in: groupCodes } }]
        : [];
      for (const target of targets) {
        if (
          !["human", "service", "customer", "group"].includes(
            target.principalType,
          )
        )
          throw new CLASSES.NodicsError("ERR_AUTH_00003");
        if (kinds.includes(target.principalType)) {
          if (
            typeof target.principalCode !== "string" ||
            !target.principalCode.trim()
          )
            throw new CLASSES.NodicsError("ERR_AUTH_00003");
          selectors.push({
            principalType: target.principalType,
            $or: [
              { loginId: target.principalCode },
              { code: target.principalCode },
            ],
          });
        }
      }
      if (!selectors.length) continue;
      for (const principal of await stamps.inventory(service, request.tenant, {
        $or: selectors,
      })) {
        const key = recordKind + ":" + String(principal._id);
        if (seen.has(key)) continue;
        seen.add(key);
        if (typeof principal.loginId !== "string" || !principal.loginId)
          throw new CLASSES.NodicsError("ERR_AUTH_00003");
        const identity = principal.authenticationIdentity;
        const linked =
          identity &&
          !(
            identity.tenantCode === request.tenant &&
            identity.recordKind === recordKind &&
            identity.recordId === String(principal._id)
          );
        if (recordKind === "EMPLOYEE")
          membershipIds.push(String(principal._id));
        if (linked) {
          if (
            recordKind === "CUSTOMER" &&
            principal.customerParticipation?.phase === "COMPLETE" &&
            SERVICE.DefaultCustomerRegistrationService
          ) {
            customerIds.push(String(principal._id));
            continue;
          }
          if (
            recordKind !== "EMPLOYEE" ||
            !SERVICE.DefaultEnterpriseMembershipService?.enabled()
          ) {
            throw new CLASSES.NodicsError(
              "ERR_AUTH_00003",
              "Linked scope invalidation requires a qualified membership owner",
            );
          }
          continue;
        }
        const result = await service.update({
          tenant: request.tenant,
          authData:
            SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
          query: { _id: principal._id },
          model: { $set: { authVersion: 1 } },
        });
        if (
          !result ||
          !/^SUC_/.test(result.code || "") ||
          result.success === false ||
          result.error ||
          (result.errors &&
            (!Array.isArray(result.errors) || result.errors.length)) ||
          result.result?.acknowledged !== true ||
          result.result?.matchedCount !== 1
        ) {
          throw new CLASSES.NodicsError(
            "ERR_AUTH_00003",
            "Scope credential invalidation did not complete",
          );
        }
      }
    }
    if (
      membershipIds.length &&
      SERVICE.DefaultEnterpriseMembershipService?.enabled()
    ) {
      await SERVICE.DefaultEnterpriseMembershipService.invalidatePrincipalMemberships(
        request.tenant,
        membershipIds,
      );
    }
    if (customerIds.length)
      await SERVICE.DefaultCustomerRegistrationService.invalidateParticipations(
        request.tenant,
        customerIds,
      );
    if (groupCodes.length && SERVICE.DefaultCustomerRegistrationService)
      await SERVICE.DefaultCustomerRegistrationService.invalidateGroupParticipations(
        request.tenant,
        groupCodes,
      );
    return true;
  },
  /** Captures the principals whose previously issued runtime credentials must expire after a scope write. */
  captureRuntimeScopePrincipals: function (request, assignments) {
    const codes = (assignments || [])
      .filter((item) => item.scopeType === "RUNTIME_DEPLOYMENT")
      .map((item) => item.principalCode);
    request.runtimeScopePrincipalCodes = [
      ...new Set([...(request.runtimeScopePrincipalCodes || []), ...codes]),
    ];
    return true;
  },
  /** Reads removed assignments before deletion, preserving the existing Profile identity authority. */
  prepareRuntimeScopeRemoval: async function (request) {
    const assignments =
      await SERVICE.DefaultPrincipalSecurityStampGovernanceService.inventory(
        SERVICE.DefaultPrincipalScopeAssignmentService,
        request.tenant,
        request.query || {},
      );
    this.captureRuntimeScopePrincipals(request, assignments);
    return this.prepareScopeInvalidation(request, assignments);
  },
  /** Invalidates service credentials after an acknowledged scope change using existing employee/stamp governance. */
  invalidateRuntimeScopeCredentials: async function (request) {
    for (const principalCode of request.runtimeScopePrincipalCodes || []) {
      // A governed reset may already have removed this principal. Only the
      // provider's private authority permits this path; prove absence and revoke
      // the shared stamp rather than pretending a zero-match update succeeded.
      if (
        SERVICE.DefaultLocalResetProviderService &&
        SERVICE.DefaultLocalResetProviderService.authorizes(request)
      ) {
        const principal = await SERVICE.DefaultEmployeeService.get({
          tenant: request.tenant,
          authData:
            SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
          query: { loginId: principalCode },
          options: { recursive: false },
        });
        if (
          !principal ||
          principal.success === false ||
          !/^SUC_/.test(principal.code || "") ||
          (principal.errors && principal.errors.length) ||
          !Array.isArray(principal.result)
        ) {
          throw new CLASSES.NodicsError(
            "ERR_AUTH_00003",
            "Runtime reset requires authoritative principal reads",
          );
        }
        if (principal.result.length === 0) {
          const revoked =
            await SERVICE.DefaultPrincipalSecurityStampService.revoke(
              request.tenant,
              principalCode,
            );
          if (!Number.isSafeInteger(revoked) || revoked < 1) {
            throw new CLASSES.NodicsError(
              "ERR_AUTH_00003",
              "Runtime reset credential revocation did not complete",
            );
          }
          continue;
        }
      }
      const result = await SERVICE.DefaultEmployeeService.update({
        tenant: request.tenant,
        authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
        query: { loginId: principalCode },
        model: { $set: { authVersion: 1 } },
      });
      if (
        !result ||
        result.success === false ||
        !/^SUC_/.test(result.code || "") ||
        (result.errors && result.errors.length) ||
        !result.result ||
        result.result.acknowledged !== true ||
        result.result.matchedCount !== 1
      )
        throw new CLASSES.NodicsError(
          "ERR_AUTH_00003",
          "Runtime scope credential invalidation did not complete",
        );
    }
    return true;
  },
  /**
   * Executes the get policy contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  getPolicy: function () {
    let policy = CONFIG.get("principalAuthorizationScopes") || {};
    if (!policy.enabled)
      throw new CLASSES.NodicsError(
        "ERR_AUTH_00003",
        "Principal authorization scopes are disabled",
      );
    [
      "principalTypes",
      "effects",
      "statuses",
      "scopeTypes",
      "inheritanceModes",
    ].forEach((key) => {
      if (!Array.isArray(policy[key]) || policy[key].length === 0) {
        throw new CLASSES.NodicsError(
          "ERR_AUTH_00003",
          "Principal authorization scope policy is incomplete: " + key,
        );
      }
    });
    return policy;
  },
  /**
   * Executes the normalize models contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  normalizeModels: function (model) {
    return Array.isArray(model) ? model : [model || {}];
  },
  /**
   * Executes the apply update contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  applyUpdate: function (existing, update) {
    let effective = Object.assign({}, existing || {});
    Object.keys(update || {})
      .filter((key) => !key.startsWith("$"))
      .forEach((key) => {
        effective[key] = update[key];
      });
    Object.assign(effective, (update && update.$set) || {});
    Object.keys((update && update.$unset) || {}).forEach((key) => {
      delete effective[key];
    });
    return effective;
  },
  /**
   * Executes the normalize string contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  normalizeString: function (value) {
    return typeof value === "string" ? value.trim() : value;
  },
  /**
   * Executes the normalize assignment contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  normalizeAssignment: function (assignment) {
    let normalized = Object.assign({}, assignment || {});
    [
      "principalType",
      "principalCode",
      "groupCode",
      "permissionCode",
      "capabilityCode",
      "scopeType",
      "scopeCode",
      "tenantCode",
      "enterpriseCode",
      "effect",
      "inheritanceMode",
      "status",
      "reasonCode",
    ].forEach((key) => {
      normalized[key] = this.normalizeString(normalized[key]);
    });
    let policy = this.getPolicy();
    normalized.effect = normalized.effect || policy.defaultEffect;
    normalized.status = normalized.status || policy.defaultStatus;
    normalized.inheritanceMode =
      normalized.inheritanceMode || policy.defaultInheritanceMode;
    return normalized;
  },
  /**
   * Executes the is blank contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  isBlank: function (value) {
    return value === undefined || value === null || value === "";
  },
  /**
   * Executes the assert listed contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  assertListed: function (policy, key, value, label) {
    if (!policy[key].includes(value)) {
      throw new CLASSES.NodicsError(
        "ERR_AUTH_00003",
        "Invalid principal authorization " + label + ": " + value,
      );
    }
  },
  /**
   * Executes the assert date order contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  assertDateOrder: function (assignment) {
    const from = this.scopeEffectiveTime(assignment.effectiveFrom);
    const to = this.scopeEffectiveTime(assignment.effectiveTo);
    if (from !== undefined && to !== undefined && from >= to) {
      throw new CLASSES.NodicsError(
        "ERR_AUTH_00003",
        "Principal authorization scope effective dates are invalid",
      );
    }
  },
  /** Validates each optional scope timestamp independently; a missing opposite bound cannot hide invalid data. */
  scopeEffectiveTime: function (value) {
    if (value === undefined || value === null) return undefined;
    const time =
      value instanceof Date
        ? value.getTime()
        : typeof value === "string" && value.trim()
          ? Date.parse(value)
          : NaN;
    if (!Number.isFinite(time)) {
      throw new CLASSES.NodicsError(
        "ERR_AUTH_00003",
        "Principal authorization scope effective dates are invalid",
      );
    }
    return time;
  },
  /**
   * Executes the validate assignment contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  validateAssignment: function (assignment) {
    let policy = this.getPolicy();
    let normalized = this.normalizeAssignment(assignment);
    this.assertListed(
      policy,
      "principalTypes",
      normalized.principalType,
      "principal type",
    );
    this.assertListed(policy, "scopeTypes", normalized.scopeType, "scope type");
    this.assertListed(policy, "effects", normalized.effect, "effect");
    this.assertListed(policy, "statuses", normalized.status, "status");
    this.assertListed(
      policy,
      "inheritanceModes",
      normalized.inheritanceMode,
      "inheritance mode",
    );
    if (this.isBlank(normalized.scopeCode))
      throw new CLASSES.NodicsError(
        "ERR_AUTH_00003",
        "Principal authorization scope code is required",
      );
    if (normalized.scopeCode.length > policy.maximumScopeCodeLength) {
      throw new CLASSES.NodicsError(
        "ERR_AUTH_00003",
        "Principal authorization scope code exceeds maximum length",
      );
    }
    if (normalized.principalType === "group") {
      if (this.isBlank(normalized.groupCode))
        throw new CLASSES.NodicsError(
          "ERR_AUTH_00003",
          "Group scope assignments require groupCode",
        );
      if (!this.isBlank(normalized.principalCode))
        throw new CLASSES.NodicsError(
          "ERR_AUTH_00003",
          "Group scope assignments must not carry principalCode",
        );
    } else if (this.isBlank(normalized.principalCode)) {
      throw new CLASSES.NodicsError(
        "ERR_AUTH_00003",
        "Principal scope assignments require principalCode",
      );
    }
    if (
      normalized.scopeType === "TENANT" &&
      this.isBlank(normalized.tenantCode)
    ) {
      throw new CLASSES.NodicsError(
        "ERR_AUTH_00003",
        "Tenant scope assignments require tenantCode",
      );
    }
    if (
      normalized.scopeType === "ENTERPRISE" &&
      this.isBlank(normalized.enterpriseCode)
    ) {
      throw new CLASSES.NodicsError(
        "ERR_AUTH_00003",
        "Enterprise scope assignments require enterpriseCode",
      );
    }
    this.assertDateOrder(normalized);
    if (normalized.scopeType === "RUNTIME_DEPLOYMENT") {
      SERVICE.DefaultRuntimeAuthorizationService.validateAssignment(normalized);
    }
    return normalized;
  },
  /**
   * Executes the validate save contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  validateSave: function (request) {
    const assignments = this.normalizeModels(request.model).map((model) =>
      this.validateAssignment(model),
    );
    this.captureRuntimeScopePrincipals(request, assignments);
    return true;
  },
  /** Captures saved/upserted scope preimages after synchronous assignment validation. */
  prepareScopeSave: async function (request) {
    const assignments = this.normalizeModels(request.model).map((model) =>
      this.validateAssignment(model),
    );
    if (
      assignments.some(
        (item) => typeof item.code !== "string" || !item.code.trim(),
      )
    ) {
      throw new CLASSES.NodicsError(
        "ERR_AUTH_00003",
        "Scope save requires stable record codes",
      );
    }
    const existing =
      await SERVICE.DefaultPrincipalSecurityStampGovernanceService.inventory(
        SERVICE.DefaultPrincipalScopeAssignmentService,
        request.tenant,
        { code: { $in: assignments.map((item) => item.code) } },
      );
    this.captureRuntimeScopePrincipals(request, existing);
    this.captureRuntimeScopePrincipals(request, assignments);
    return this.prepareScopeInvalidation(request, existing.concat(assignments));
  },
  /**
   * Executes the validate update contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  validateUpdate: function (request) {
    let updates = this.normalizeModels(request.model);
    if (
      !request.query ||
      !SERVICE.DefaultPrincipalScopeAssignmentService ||
      updates.length !== 1 ||
      Object.entries(updates[0] || {}).some(
        ([key, value]) =>
          key.includes(".") ||
          (key.startsWith("$") &&
            (!["$set", "$unset"].includes(key) ||
              !value ||
              typeof value !== "object" ||
              Array.isArray(value) ||
              Object.keys(value).some(
                (field) => field.includes(".") || field.startsWith("$"),
              ))),
      )
    )
      return Promise.reject(
        new CLASSES.NodicsError(
          "ERR_AUTH_00003",
          "Scope update requires one governed model and selector",
        ),
      );
    return SERVICE.DefaultPrincipalSecurityStampGovernanceService.inventory(
      SERVICE.DefaultPrincipalScopeAssignmentService,
      request.tenant,
      request.query,
    ).then((existing) => {
      if (existing.length === 0)
        throw new CLASSES.NodicsError(
          "ERR_AUTH_00003",
          "Principal scope assignment update requires an existing record",
        );
      const effective = existing.map((assignment) =>
        this.validateAssignment(this.applyUpdate(assignment, updates[0])),
      );
      this.captureRuntimeScopePrincipals(request, existing.concat(effective));
      return this.prepareScopeInvalidation(request, existing.concat(effective));
    });
  },
  /**
   * Executes the validate contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  validate: function (request) {
    return request && request.query
      ? this.validateUpdate(request)
      : this.validateSave(request);
  },
  /**
   * Executes the is effective contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  isEffective: function (assignment, now) {
    if (
      !assignment ||
      assignment.status !== "ACTIVE" ||
      assignment.active === false
    )
      return false;
    const time =
      now === undefined
        ? Date.now()
        : now instanceof Date
          ? now.getTime()
          : typeof now === "number"
            ? now
            : Date.parse(now);
    if (!Number.isFinite(time)) return false;
    const from = this.scopeEffectiveTime(assignment.effectiveFrom);
    const to = this.scopeEffectiveTime(assignment.effectiveTo);
    if (from !== undefined && time < from) return false;
    if (to !== undefined && time >= to) return false;
    return true;
  },
  /**
   * Executes the get principal group codes contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  getPrincipalGroupCodes: function (authData) {
    return Array.from(
      new Set(
        []
          .concat(
            (authData && authData.userGroups) || [],
            (authData && authData.allUserGroupCodes) || [],
          )
          .filter((value) => typeof value === "string" && value.trim()),
      ),
    );
  },
  /**
   * Executes the build scope key contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  buildScopeKey: function (assignment) {
    return [
      assignment.scopeType,
      assignment.scopeCode,
      assignment.permissionCode || "*",
      assignment.capabilityCode || "*",
    ].join("::");
  },
  /**
   * Executes the applies to principal contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  appliesToPrincipal: function (assignment, authData) {
    if (!assignment || !authData) return false;
    if (assignment.principalType === "group") {
      return this.getPrincipalGroupCodes(authData).includes(
        assignment.groupCode,
      );
    }
    return (
      assignment.principalType === authData.principalType &&
      (assignment.principalCode === authData.loginId ||
        assignment.principalCode === authData.code ||
        assignment.principalCode === authData.principalCode)
    );
  },
  /**
   * Executes the resolve assignments contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  resolveAssignments: function (authData, assignments, options) {
    let resolved = {};
    let denied = {};
    let now = options && options.now;
    (assignments || [])
      .filter(
        (assignment) =>
          assignment &&
          assignment.status === "ACTIVE" &&
          assignment.active !== false,
      )
      .map((assignment) => {
        // Do not drop malformed DENY records and thereby expose a matching ALLOW.
        this.assertDateOrder(assignment);
        if (!["ALLOW", "DENY"].includes(assignment.effect)) {
          throw new CLASSES.NodicsError(
            "ERR_AUTH_00003",
            "Stored principal scope effect is invalid",
          );
        }
        return this.normalizeAssignment(assignment);
      })
      .filter((assignment) => this.isEffective(assignment, now))
      .filter((assignment) => this.appliesToPrincipal(assignment, authData))
      .forEach((assignment) => {
        let key = this.buildScopeKey(assignment);
        if (assignment.effect === "DENY") {
          denied[key] = assignment;
          delete resolved[key];
        } else if (!denied[key]) {
          resolved[key] = assignment;
        }
      });
    return {
      principalCode:
        authData &&
        (authData.loginId || authData.code || authData.principalCode),
      principalType: authData && authData.principalType,
      scopeCount: Object.keys(resolved).length,
      scopes: Object.keys(resolved)
        .sort()
        .map((key) => resolved[key]),
      deniedScopes: Object.keys(denied)
        .sort()
        .map((key) => denied[key]),
    };
  },
  /**
   * Executes the get effective scopes contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  getEffectiveScopes: function (request) {
    const maximum = this.getPolicy().maximumAssignmentsPerPrincipal || 500;
    let authData = request.authData || {};
    let query = {
      status: "ACTIVE",
      $or: [
        {
          principalType: authData.principalType,
          principalCode:
            authData.loginId || authData.code || authData.principalCode,
        },
        {
          principalType: "group",
          groupCode: { $in: this.getPrincipalGroupCodes(authData) },
        },
      ],
    };
    return SERVICE.DefaultPrincipalScopeAssignmentService.get({
      tenant: request.tenant,
      authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
      query: query,
      options: { recursive: false, skipItemCache: true },
      searchOptions: { pageSize: maximum + 1, pageNumber: 1 },
    }).then((result) => {
      if (
        !result ||
        result.success === false ||
        result.error ||
        typeof result.code !== "string" ||
        !result.code.startsWith("SUC_") ||
        (result.errors &&
          (!Array.isArray(result.errors) || result.errors.length)) ||
        !Array.isArray(result.result)
      ) {
        throw new CLASSES.NodicsError(
          "ERR_AUTH_00003",
          "Principal scope resolution requires an authoritative owner read",
        );
      }
      if (result.result.length > maximum)
        throw new CLASSES.NodicsError(
          "ERR_AUTH_00003",
          "Principal scope limit exceeded",
        );
      return this.resolveAssignments(
        authData,
        (result && result.result) || [],
        request.options,
      );
    });
  },
};
