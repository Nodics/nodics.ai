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
