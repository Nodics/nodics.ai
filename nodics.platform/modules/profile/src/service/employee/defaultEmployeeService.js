/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.platform/modules/profile/src/service/employee/defaultEmployeeService
 * @description Implements profile default employee service business behavior and extension logic.
 * @layer service
 * @owner profile
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
  /** Adds reviewed reference-release roles to existing native employees through normal owner updates. */
  addReferenceGroupsAll: async function (request) {
    const fail = () => {
      throw new CLASSES.NodicsError("ERR_PROFILE_CREDENTIAL_OWNERSHIP");
    };
    const plain = (value) => value && Object.getPrototypeOf(value) === Object.prototype;
    const key = (value, maximum = 192) => typeof value === "string" &&
      value.length > 0 && value.length <= maximum && value.trim() === value;
    const codes = (value) => Array.isArray(value) && value.length > 0 &&
      value.length <= 100 && value.every((item) => key(item)) &&
      new Set(value).size === value.length;
    const success = (response) => /^SUC_/.test(response?.code || "") &&
      response.success !== false && !response.error &&
      (!response.errors || (Array.isArray(response.errors) && !response.errors.length));
    const rows = (response, maximum) => {
      if (!success(response) || !Array.isArray(response.result) ||
          response.count !== response.result.length || response.result.length > maximum)
        fail();
      return response.result;
    };
    const reference = (value) => typeof value === "string" ? value :
      typeof value?.toHexString === "function" ? value.toHexString() : undefined;
    const models = request?.models;
    if (!key(request?.tenant) || !Array.isArray(models) || models.length > 100 ||
        !plain(request.authData) || !Array.isArray(request.authData.userGroups) ||
        !request.authData.userGroups.length) fail();
    const roles = CONFIG.get("enterpriseManagement")?.accessAssignments?.roles;
    if (!plain(roles)) fail();
    const identities = new Set(), logins = new Set(), requiredGroups = new Set();
    const instructions = models.map((model) => {
      if (!plain(model) || Object.keys(model).sort().join("|") !==
          "code|enterpriseCode|groupCodes|loginId|roleCodes" ||
          !key(model.code) || !key(model.loginId, 320) || !key(model.enterpriseCode) ||
          !codes(model.roleCodes) || !codes(model.groupCodes) ||
          identities.has(model.code) || logins.has(model.loginId)) fail();
      identities.add(model.code);
      logins.add(model.loginId);
      const resolved = new Set();
      for (const roleCode of model.roleCodes) {
        const role = Object.hasOwn(roles, roleCode) && roles[roleCode];
        if (!plain(role) || role.delegable !== true || role.scopeType !== "ENTERPRISE" ||
            role.administrationClass || !codes(role.groupCodes)) fail();
        role.groupCodes.forEach((group) => resolved.add(group));
      }
      const serviceGroup = CONFIG.get("identityGovernance")?.principalPolicy?.serviceGroup;
      if (resolved.size !== model.groupCodes.length || model.groupCodes.some((group) =>
          !resolved.has(group) || ["adminGroup", "runtimeConfigAdminUserGroup", serviceGroup].includes(group)))
        fail();
      model.groupCodes.forEach((group) => requiredGroups.add(group));
      return { ...model, roleCodes: [...model.roleCodes], groupCodes: [...model.groupCodes] };
    });
    const read = async (service, query, maximum) => rows(await service.get({
      tenant: request.tenant, authData: request.authData, query,
      options: { recursive: false, skipItemCache: true },
      searchOptions: { pageSize: maximum + 1, pageNumber: 1 },
    }), maximum);
    if (typeof SERVICE.DefaultUserGroupService?.get !== "function" ||
        typeof SERVICE.DefaultEnterpriseService?.get !== "function") fail();
    if (requiredGroups.size) {
      const groups = await read(SERVICE.DefaultUserGroupService,
        { code: { $in: [...requiredGroups] }, active: true }, requiredGroups.size);
      if (groups.length !== requiredGroups.size ||
          new Set(groups.map((group) => group.code)).size !== groups.length ||
          groups.some((group) => group.active !== true || !requiredGroups.has(group.code))) fail();
    }
    const snapshot = (record, instruction) => {
      if (!record?._id || record.code !== instruction.code || record.loginId !== instruction.loginId ||
          record.active !== true || record.authenticationIdentity ||
          (record.principalType !== undefined && record.principalType !== "human") ||
          record.apiKey || record.apiKeyHash || !codes(record.userGroups) ||
          !reference(record.password) || record.metadata?.enterpriseCode !== instruction.enterpriseCode ||
          (record.enterpriseCode !== undefined && record.enterpriseCode !== instruction.enterpriseCode) ||
          (record.authVersion !== undefined && (!Number.isInteger(record.authVersion) ||
            record.authVersion < 0 || record.authVersion >= 2147483647))) fail();
      return { ...record, userGroups: [...record.userGroups], metadata: { ...record.metadata } };
    };
    const employeeRead = async (instruction) => {
      const records = await read(this,
        { $or: [{ code: instruction.code }, { loginId: instruction.loginId }] }, 1);
      if (records.length !== 1) fail();
      return snapshot(records[0], instruction);
    };
    // Complete all prerequisite reads before the first mutation; the batch is resumable, not transactional.
    const prepared = [], enterprises = new Set();
    for (const instruction of instructions) {
      const original = await employeeRead(instruction);
      if (!enterprises.has(instruction.enterpriseCode)) {
        const masters = await read(SERVICE.DefaultEnterpriseService,
          { code: instruction.enterpriseCode, active: true }, 1);
        if (masters.length !== 1 || !masters[0]._id || masters[0].active !== true ||
            masters[0].code !== instruction.enterpriseCode) fail();
        enterprises.add(instruction.enterpriseCode);
      }
      const next = [...original.userGroups,
        ...instruction.groupCodes.filter((group) => !original.userGroups.includes(group))];
      prepared.push({ instruction, original, next });
    }
    const result = [];
    for (const { instruction, original, next } of prepared) {
      if (next.length !== original.userGroups.length) {
        const query = {
          _id: original._id, code: original.code, loginId: original.loginId, active: true,
          userGroups: original.userGroups, password: original.password,
          authVersion: original.authVersion === undefined ? { $exists: false } : original.authVersion,
          authenticationIdentity: original.authenticationIdentity === undefined ?
            { $exists: false } : original.authenticationIdentity,
          principalType: original.principalType === undefined ? { $exists: false } : original.principalType,
          "metadata.enterpriseCode": instruction.enterpriseCode,
          enterpriseCode: original.enterpriseCode === undefined ? { $exists: false } : original.enterpriseCode,
        };
        const updated = await this.update({
          tenant: request.tenant, authData: request.authData, query,
          model: { userGroups: next }, options: { returnModified: true },
        });
        if (!success(updated) || updated.result?.acknowledged !== true ||
            updated.result.matchedCount !== 1) fail();
        const current = await employeeRead(instruction);
        if (String(current._id) !== String(original._id) ||
            reference(current.password) !== reference(original.password) ||
            JSON.stringify(current.userGroups) !== JSON.stringify(next) ||
            current.principalType !== original.principalType ||
            current.authVersion === undefined || current.authVersion <= (original.authVersion || 0)) fail();
      }
      result.push({ code: instruction.code });
    }
    return { result };
  },
  /**
   * Ensures bounded reference employees without rewriting existing identities or credentials.
   * Existing accounts must match both immutable source keys and remain active native employees.
   * @param {Object} request Authorized nImport batch; generated reads/writes retain its authority.
   * @returns {Promise<Object>} Code-only acknowledgements, never credentials or persisted principals.
   */
  ensureReferenceAll: async function (request) {
    const fail = () => {
      throw new CLASSES.NodicsError("ERR_PROFILE_CREDENTIAL_OWNERSHIP");
    };
    const models = request?.models;
    if (!Array.isArray(models) || models.length > 100 || !request.tenant)
      fail();
    const codes = new Set();
    const logins = new Set();
    for (const model of models) {
      if (
        !model ||
        Object.getPrototypeOf(model) !== Object.prototype ||
        typeof model.code !== "string" ||
        !model.code ||
        model.code.length > 192 ||
        typeof model.loginId !== "string" ||
        !model.loginId ||
        model.loginId.length > 320 ||
        model._id ||
        model.authenticationIdentity ||
        model.principalType === "service" ||
        codes.has(model.code) ||
        logins.has(model.loginId)
      )
        fail();
      codes.add(model.code);
      logins.add(model.loginId);
    }
    const result = [];
    for (const model of models) {
      const existing = await this.get({
        tenant: request.tenant,
        authData: request.authData,
        query: { $or: [{ code: model.code }, { loginId: model.loginId }] },
        options: { recursive: false, skipItemCache: true },
        searchOptions: { pageSize: 2, pageNumber: 1 },
      });
      if (
        !/^SUC_/.test(existing?.code || "") ||
        existing.success === false ||
        existing.error ||
        (existing.errors &&
          (!Array.isArray(existing.errors) || existing.errors.length)) ||
        !Array.isArray(existing.result) ||
        existing.count !== existing.result.length ||
        existing.result.length > 1
      )
        fail();
      if (existing.result.length) {
        const original = existing.result[0];
        if (
          !original._id ||
          original.code !== model.code ||
          original.loginId !== model.loginId ||
          original.active !== true ||
          original.authenticationIdentity ||
          original.principalType === "service"
        )
          fail();
        // A source upgrade is not password reset, account reactivation or permission reconciliation.
      } else {
        const saved = await this.save({
          tenant: request.tenant,
          authData: request.authData,
          model: { ...model },
          options: { insertOnly: true },
        });
        if (
          !/^SUC_/.test(saved?.code || "") ||
          saved.success === false ||
          saved.error ||
          (saved.errors &&
            (!Array.isArray(saved.errors) || saved.errors.length)) ||
          !saved.result ||
          Array.isArray(saved.result) ||
          saved.result.code !== model.code ||
          !saved.result._id
        )
          fail();
      }
      result.push({ code: model.code });
    }
    return { result };
  },
  /**

     * Retrieves by login id information.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

  findByLoginId: function (request) {
    return new Promise((resolve, reject) => {
      this.get({
        tenant: request.tenant,
        authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
        options: {
          recursive: request.options?.recursive !== false,
          skipItemCache: request.options?.skipItemCache === true,
        },
        searchOptions: { pageSize: 2, pageNumber: 1 },
        query: {
          loginId: request.loginId,
        },
      })
        .then(async (employees) => {
          const fresh =
            request.options?.skipItemCache === true &&
            request.options?.recursive === false;
          if (
            fresh &&
            (!/^SUC_/.test(employees?.code || "") ||
              employees.success === false ||
              employees.error ||
              (employees.errors &&
                (!Array.isArray(employees.errors) ||
                  employees.errors.length)) ||
              employees.count !== 1 ||
              !Array.isArray(employees.result) ||
              employees.result[0]?.loginId !== request.loginId ||
              !employees.result[0]?._id)
          )
            throw new CLASSES.NodicsError("ERR_AUTH_00001");
          if (employees.result.length !== 1) {
            reject(
              new CLASSES.NodicsError(
                "ERR_PRFL_00003",
                "Invalid login id: " + request.loginId,
              ),
            );
          } else {
            let employee = employees.result[0];
            if (fresh && !employee.authenticationIdentity) {
              const owner = SERVICE.DefaultEnterpriseMembershipService;
              if (typeof owner?.groups !== "function")
                throw new CLASSES.NodicsError("ERR_AUTH_00001");
              const groups = await owner.groups(
                request.tenant,
                employee.userGroups,
              );
              employee = {
                ...employee,
                userGroups: groups,
                userGroupCodes: UTILS.getUserGroupCodes(groups),
                userGroupPermissions: UTILS.getUserGroupPermissions(groups),
              };
            }
            resolve(employee);
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  /**

     * Retrieves by apikey information.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

  findByAPIKey: function (request) {
    return new Promise((resolve, reject) => {
      let policy =
        (CONFIG.get("authSecurity") && CONFIG.get("authSecurity").apiKey) || {};
      let apiKeyHash;
      try {
        apiKeyHash = SERVICE.DefaultAPIKeyCredentialService.digest(
          request.apiKey,
        );
      } catch (error) {
        reject(error);
        return;
      }
      let find = (query) =>
        this.get({
          tenant: request.tenant,
          authData:
            SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
          options: {
            recursive: true,
          },
          query: Object.assign({ active: true }, query),
        });
      find({ apiKeyHash: apiKeyHash })
        .then((employees) => {
          if (
            employees.result.length === 0 &&
            policy.allowLegacyPlaintextLookup === true
          ) {
            return find({ apiKey: request.apiKey });
          }
          return employees;
        })
        .then((employees) => {
          if (employees.result.length !== 1) {
            reject(new CLASSES.NodicsError("ERR_PRFL_00003", "Invalid apiKey"));
          } else {
            let employee = employees.result[0];
            let status = employee.apiKeyStatus || "active";
            let expired =
              employee.apiKeyExpiresAt &&
              new Date(employee.apiKeyExpiresAt).getTime() <= Date.now();
            let invalidPrincipal =
              employee.principalType !== "service" &&
              !(
                employee.principalType === undefined &&
                policy.allowLegacyHumanPrincipals === true
              );
            if (
              invalidPrincipal ||
              status !== "active" ||
              expired ||
              (policy.requireScopes === true &&
                (!employee.apiKeyScopes || employee.apiKeyScopes.length === 0))
            ) {
              reject(
                new CLASSES.NodicsError(
                  "ERR_PRFL_00003",
                  "API key is inactive, expired, or outside policy",
                ),
              );
            } else {
              resolve(employee);
            }
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
};
