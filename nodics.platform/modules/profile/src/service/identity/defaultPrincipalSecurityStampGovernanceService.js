/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module profile/service/identity/DefaultPrincipalSecurityStampGovernanceService
 * @description Advances principal security stamps for direct principal, password, and group-membership changes.
 * @layer service
 * @owner profile
 * @override Project modules may replace stamp propagation with an external IAM invalidation mechanism.
 */
const projectionMutationTargets = new WeakMap();
module.exports = {
  /** Reads a complete bounded security inventory; partial or changing inventories fail closed. */
  inventory: async function (service, tenant, query) {
    const policy = CONFIG.get("identityGovernance.securityStampInventory") || {
      pageSize: 100,
      maximumPages: 100,
    };
    if (
      !Number.isSafeInteger(policy.pageSize) ||
      policy.pageSize < 1 ||
      policy.pageSize > 1000 ||
      !Number.isSafeInteger(policy.maximumPages) ||
      policy.maximumPages < 1 ||
      policy.maximumPages > 1000
    ) {
      throw new CLASSES.NodicsError(
        "ERR_AUTH_00003",
        "Invalid security inventory limits",
      );
    }
    const rows = [],
      seen = new Set();
    let total;
    for (let pageNumber = 1; pageNumber <= policy.maximumPages; pageNumber++) {
      const response = await service.get({
        tenant,
        authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
        query,
        options: { recursive: false, skipItemCache: true },
        searchOptions: {
          pageSize: policy.pageSize,
          pageNumber,
          sort: { _id: 1 },
        },
      });
      if (
        !response ||
        !/^SUC_/.test(response.code || "") ||
        response.success === false ||
        response.error ||
        (response.errors &&
          (!Array.isArray(response.errors) || response.errors.length)) ||
        !Array.isArray(response.result) ||
        response.result.length > policy.pageSize ||
        !Number.isSafeInteger(response.count) ||
        response.count < 0 ||
        (total !== undefined && total !== response.count)
      ) {
        throw new CLASSES.NodicsError(
          "ERR_AUTH_00003",
          "Incomplete security inventory",
        );
      }
      total = response.count;
      for (const row of response.result) {
        if (!row || !row._id || seen.has(String(row._id)))
          throw new CLASSES.NodicsError(
            "ERR_AUTH_00003",
            "Unstable security inventory",
          );
        seen.add(String(row._id));
        rows.push(row);
      }
      if (rows.length > total) throw new CLASSES.NodicsError("ERR_AUTH_00003");
      if (rows.length === total) return rows;
      if (response.result.length < policy.pageSize)
        throw new CLASSES.NodicsError(
          "ERR_AUTH_00003",
          "Truncated security inventory",
        );
    }
    throw new CLASSES.NodicsError(
      "ERR_AUTH_00003",
      "Security inventory exceeds configured limit",
    );
  },
  /** Resolves the generated principal service for the effective schema. */
  getPrincipalService: function (request) {
    let schemaName = request.schemaModel && request.schemaModel.schemaName;
    if (schemaName === "employee") return SERVICE.DefaultEmployeeService;
    if (schemaName === "customer") return SERVICE.DefaultCustomerService;
    return undefined;
  },
  /** Resolves every persisted principal affected by the update query and prepares one new stamp. */
  preparePrincipalUpdate: function (request) {
    request.model = request.model || {};
    if (
      Array.isArray(request.model) ||
      typeof request.model !== "object" ||
      Object.entries(request.model).some(
        ([operator, values]) =>
          operator.startsWith("$") &&
          operator !== "$set" &&
          values &&
          Object.keys(values).some(
            (key) => key === "authVersion" || key.startsWith("authVersion."),
          ),
      )
    ) {
      return Promise.reject(
        new CLASSES.NodicsError(
          "ERR_AUTH_00003",
          "Security stamp requires one governed update model",
        ),
      );
    }
    let service = this.getPrincipalService(request);
    if (!service)
      return Promise.reject(
        new CLASSES.NodicsError(
          "ERR_AUTH_00003",
          "Principal schema could not be resolved for security-stamp update",
        ),
      );
    return this.inventory(service, request.tenant, request.query || {}).then(
      async (principals) => {
        if (principals.length === 0)
          throw new CLASSES.NodicsError(
            "ERR_AUTH_00003",
            "Security-stamp update requires an existing principal",
          );
        request.securityStampTargets = principals
          .map((principal) => principal.loginId)
          .filter(Boolean);
        const kind =
          request.schemaModel.schemaName === "customer"
            ? "CUSTOMER"
            : "EMPLOYEE";
        request.identityStampTargets = principals.map(
          (principal) => "identity:" + kind + ":" + String(principal._id),
        );
        const privateParticipation =
          SERVICE.DefaultCustomerRegistrationService?.ownsParticipationWrite(
            request,
          );
        projectionMutationTargets.set(
          request,
          privateParticipation
            ? []
            : principals
                .filter(
                  (principal) =>
                    principal.authenticationIdentity &&
                    !(
                      principal.authenticationIdentity.tenantCode ===
                        request.tenant &&
                      principal.authenticationIdentity.recordKind === kind &&
                      principal.authenticationIdentity.recordId ===
                        String(principal._id)
                    ),
                )
                .map((principal) => ({ kind, id: String(principal._id) })),
        );
        if (principals.some((principal) => !principal._id))
          throw new CLASSES.NodicsError("ERR_AUTH_00003");
        if (request.securityStampTargets.length !== principals.length)
          throw new CLASSES.NodicsError(
            "ERR_AUTH_00003",
            "Every security-stamp target requires a stable loginId",
          );
        const minimum = principals.reduce(
          (value, principal) =>
            Math.max(value, Number(principal.authVersion || 0) + 1),
          1,
        );
        let version =
          await SERVICE.DefaultPrincipalSecurityStampService.reserveVersion(
            request.tenant,
            minimum,
          );
        if (
          !Number.isInteger(version) ||
          version < minimum ||
          version > 2147483647
        )
          throw new CLASSES.NodicsError(
            "ERR_AUTH_00003",
            "Principal security stamp exceeds persisted integer range",
          );
        if (Object.keys(request.model).some((key) => key.startsWith("$"))) {
          request.model.$set = request.model.$set || {};
          request.model.$set.authVersion = version;
        } else request.model.authVersion = version;
        request.securityStampVersion = version;
        return true;
      },
    );
  },
  /** Registers prepared principal stamps only after persistence succeeds. */
  registerPreparedPrincipalUpdate: function (request) {
    let targets = (request.securityStampTargets || []).concat(
      request.identityStampTargets || [],
    );
    let version = request.securityStampVersion;
    if (targets.length === 0 || version === undefined)
      return Promise.reject(
        new CLASSES.NodicsError(
          "ERR_AUTH_00003",
          "Prepared security-stamp targets are required after principal update",
        ),
      );
    return targets
      .reduce(
        (promise, principalId) =>
          promise.then(() =>
            SERVICE.DefaultPrincipalSecurityStampService.register(
              request.tenant,
              principalId,
              version,
            ),
          ),
        Promise.resolve(),
      )
      .then(async () => {
        const projections = projectionMutationTargets.get(request) || [];
        const employees = projections
          .filter((item) => item.kind === "EMPLOYEE")
          .map((item) => item.id);
        const customers = projections
          .filter((item) => item.kind === "CUSTOMER")
          .map((item) => item.id);
        if (employees.length)
          await SERVICE.DefaultEnterpriseMembershipService.invalidatePrincipalMemberships(
            request.tenant,
            employees,
          );
        if (customers.length)
          await SERVICE.DefaultCustomerRegistrationService.invalidateParticipations(
            request.tenant,
            customers,
          );
        return true;
      });
  },
  /** Invalidates original-account proofs before removal; a failed delete does not restore old sessions. */
  preparePrincipalRemoval: async function (request) {
    const preparation = {
      tenant: request.tenant,
      schemaModel: request.schemaModel,
      query: request.query,
      model: {},
    };
    await this.preparePrincipalUpdate(preparation);
    await this.registerPreparedPrincipalUpdate(preparation);
    return true;
  },
  /** Resolves one password owner and advances only that principal. */
  bumpLoginId: async function (request) {
    const model =
        (request.model && (request.model.$set || request.model)) || {},
      query = request.query || {};
    const selector = query._id
      ? { _id: query._id }
      : model._id
        ? { _id: model._id }
        : query.code
          ? { code: query.code }
          : model.code
            ? { code: model.code }
            : query.loginId
              ? { loginId: query.loginId }
              : model.loginId
                ? { loginId: model.loginId }
                : null;
    if (!selector)
      throw new CLASSES.NodicsError(
        "ERR_AUTH_00003",
        "Password mutation requires an exact credential reference",
      );
    const system = SERVICE.DefaultIdentityGovernanceService.getSystemAuthData();
    const read = async (service, lookup) => {
      const response = await service.get({
        tenant: request.tenant,
        authData: system,
        query: lookup,
        options: { recursive: false, skipItemCache: true },
        searchOptions: { pageSize: 2, pageNumber: 1 },
      });
      if (
        !response ||
        !/^SUC_/.test(response.code || "") ||
        response.success === false ||
        response.error ||
        (response.errors &&
          (!Array.isArray(response.errors) || response.errors.length)) ||
        !Array.isArray(response.result) ||
        response.result.length > 1 ||
        (Number.isSafeInteger(response.count) &&
          response.count > response.result.length)
      ) {
        throw new CLASSES.NodicsError(
          "ERR_AUTH_00003",
          "Credential invalidation requires authoritative unambiguous reads",
        );
      }
      return response.result;
    };
    const credentials = await read(SERVICE.DefaultPasswordService, selector);
    if (credentials.length !== 1 || !credentials[0]._id)
      throw new CLASSES.NodicsError("ERR_AUTH_00003");
    const matches = [];
    for (const [service, kind] of [
      [SERVICE.DefaultEmployeeService, "EMPLOYEE"],
      [SERVICE.DefaultCustomerService, "CUSTOMER"],
    ]) {
      for (const principal of await read(service, {
        password: credentials[0]._id,
      })) {
        const binding = principal.authenticationIdentity;
        const canonical =
          !binding ||
          (binding.tenantCode === request.tenant &&
            binding.recordKind === kind &&
            binding.recordId === String(principal._id));
        if (canonical && principal._id) matches.push({ service, principal });
      }
    }
    if (matches.length !== 1)
      throw new CLASSES.NodicsError(
        "ERR_AUTH_00003",
        "Credential must have exactly one canonical owner",
      );
    const match = matches[0];
    const response = await match.service.update({
      tenant: request.tenant,
      authData: system,
      query: { _id: match.principal._id },
      model: { $set: { authVersion: 1 } },
    });
    if (
      !response ||
      !/^SUC_/.test(response.code || "") ||
      response.success === false ||
      response.error ||
      (response.errors &&
        (!Array.isArray(response.errors) || response.errors.length)) ||
      response.result?.acknowledged !== true ||
      response.result?.matchedCount !== 1
    )
      throw new CLASSES.NodicsError("ERR_AUTH_00003");
    return true;
  },
  /** Returns the changed group and every group inheriting from it. */
  getAffectedGroupCodes: function (groups, changedCode) {
    let affected = new Set([changedCode]);
    let changed = true;
    while (changed) {
      changed = false;
      (groups || []).forEach((group) => {
        let parents = (group.parentGroups || []).map((parent) =>
          UTILS.isObject(parent) ? parent.code : parent,
        );
        if (
          !affected.has(group.code) &&
          parents.some((parent) => affected.has(parent))
        ) {
          affected.add(group.code);
          changed = true;
        }
      });
    }
    return Array.from(affected);
  },
  /** Invalidates current group descendants before mutation, including code changes and removals. */
  bumpGroupMembers: function (request) {
    return this.inventory(
      SERVICE.DefaultUserGroupService,
      request.tenant,
      {},
    ).then(async (groups) => {
      const changed = await this.inventory(
        SERVICE.DefaultUserGroupService,
        request.tenant,
        request.query || {},
      );
      if (!changed.length || changed.some((group) => !group.code))
        throw new CLASSES.NodicsError(
          "ERR_AUTH_00003",
          "Group mutation requires existing groups",
        );
      let affectedGroups = Array.from(
        new Set(
          changed.flatMap((group) =>
            this.getAffectedGroupCodes(groups, group.code),
          ),
        ),
      );
      request.affectedMembershipGroups = affectedGroups;
      return this.invalidatePreparedGroupMembers(request);
    });
  },
  /** Re-invalidates captured and renamed group descendants after persistence to close transition issuance. */
  invalidatePreparedGroupMembers: async function (request) {
    if (
      !Array.isArray(request.affectedMembershipGroups) ||
      !request.affectedMembershipGroups.length
    ) {
      throw new CLASSES.NodicsError(
        "ERR_AUTH_00003",
        "Prepared group invalidation targets are required",
      );
    }
    const groups = await this.inventory(
      SERVICE.DefaultUserGroupService,
      request.tenant,
      {},
    );
    const models = Array.isArray(request.model)
      ? request.model
      : [request.model || {}];
    const codes = request.affectedMembershipGroups.concat(
      models
        .map((model) => (model.$set || model).code)
        .filter((code) => typeof code === "string"),
    );
    const affectedGroups = Array.from(
      new Set(
        codes.flatMap((code) => this.getAffectedGroupCodes(groups, code)),
      ),
    );
    request.affectedMembershipGroups = affectedGroups;
    let system = SERVICE.DefaultIdentityGovernanceService.getSystemAuthData();
    let find = (service) =>
      this.inventory(service, request.tenant, {
        userGroups: { $in: affectedGroups },
      });
    return Promise.all([
      find(SERVICE.DefaultEmployeeService),
      find(SERVICE.DefaultCustomerService),
    ])
      .then((results) => {
        let principals = results[0]
          .map((principal) => ({
            service: SERVICE.DefaultEmployeeService,
            principal: principal,
          }))
          .concat(
            results[1].map((principal) => ({
              service: SERVICE.DefaultCustomerService,
              principal: principal,
            })),
          );
        return principals.reduce(
          (promise, item) =>
            promise.then(async () => {
              const response = await item.service.update({
                tenant: request.tenant,
                authData: system,
                query: { _id: item.principal._id },
                model: { $set: { authVersion: 1 } },
              });
              if (
                !response ||
                !/^SUC_/.test(response.code || "") ||
                response.success === false ||
                response.error ||
                (response.errors &&
                  (!Array.isArray(response.errors) ||
                    response.errors.length)) ||
                response.result?.acknowledged !== true ||
                response.result?.matchedCount !== 1
              )
                throw new CLASSES.NodicsError("ERR_AUTH_00003");
            }),
          Promise.resolve(),
        );
      })
      .then(async () => {
        if (SERVICE.DefaultEnterpriseMembershipService)
          await SERVICE.DefaultEnterpriseMembershipService.invalidateGroupMemberships(
            request.tenant,
            request.affectedMembershipGroups,
          );
        if (SERVICE.DefaultCustomerRegistrationService)
          await SERVICE.DefaultCustomerRegistrationService.invalidateGroupParticipations(
            request.tenant,
            request.affectedMembershipGroups,
          );
        return true;
      });
  },
};
