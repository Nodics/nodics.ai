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
const platformAdoptionWrites = new WeakMap();
module.exports = {
  /** Recognizes only the held exact additive Employee command; public flags and copied requests confer no authority. */
  ownsPlatformAdministratorAdoption: function (request) {
    const proof = platformAdoptionWrites.get(request);
    if (!proof || !request.model || Object.keys(request.model).some(key => !['userGroups', 'authVersion'].includes(key))) return false;
    return proof === JSON.stringify([request.tenant, request.authData, request.query, request.options, request.model.userGroups]);
  },
  /**
   * Reads a fresh native Platform employee and the installed full-access definition for review.
   * @param {Object} request Authenticated owner request with exact target { code, loginId }.
   * @returns {Promise<Object>} Internal snapshot and public review; no writes or credential changes.
   */
  platformAdministratorAdoptionState: async function (request) {
    SERVICE.DefaultLoggerService.assertSensitiveRequest(request);
    const fail = () => { throw new CLASSES.NodicsError("ERR_AUTH_00003", "Platform administrator adoption evidence is invalid or changed"); };
    const target = request?.target;
    if (!target || Object.getPrototypeOf(target) !== Object.prototype ||
        Object.keys(target).sort().join('|') !== 'code|loginId' ||
        [target.code, target.loginId].some(value => typeof value !== 'string' || !value || value.length > 320)) fail();
    await SERVICE.DefaultIdentityCatalogueGovernanceService.authorize(request);
    const read = async (service, query) => {
      const response = await service.get({ tenant: request.tenant, authData: request.authData, query,
        options: { recursive: false, skipItemCache: true }, searchOptions: { pageSize: 2, pageNumber: 1 } });
      if (!/^SUC_/.test(response?.code || '') || response.success === false || response.error ||
          response.errors && (!Array.isArray(response.errors) || response.errors.length) ||
          response.count !== 1 || !Array.isArray(response.result) || response.result.length !== 1 || !response.result[0]._id) fail();
      return response.result[0];
    };
    const person = await read(this, { $or: [{ code: target.code }, { loginId: target.loginId }] });
    SERVICE.DefaultPrincipalGovernanceService.assertPlatformPrincipal(person, { ...request, schemaModel: { schemaName: 'employee' } });
    if (person.code !== target.code || person.loginId !== target.loginId || person.active !== true || person.disabled || person.registrationSuspended ||
        !person.password || typeof person.password !== 'string' && typeof person.password.toHexString !== 'function' ||
        !Array.isArray(person.userGroups) || person.userGroups.some(code => typeof code !== 'string') ||
        new Set(person.userGroups).size !== person.userGroups.length ||
        person.authVersion !== undefined && (!Number.isInteger(person.authVersion) || person.authVersion < 1)) fail();
    const group = await read(SERVICE.DefaultUserGroupService, { code: 'platformAdministratorUserGroup', active: true });
    if (group.code !== 'platformAdministratorUserGroup' || group.active !== true ||
        !Array.isArray(group.permissions) || !group.permissions.includes('*')) fail();
    await SERVICE.DefaultIdentityCatalogueService.requirePermissions(['*']);
    const enterprise = await read(SERVICE.DefaultEnterpriseService, { code: CONFIG.get('defaultEnterprise') || 'default', active: true });
    if (enterprise.active !== true || enterprise.code !== (CONFIG.get('defaultEnterprise') || 'default') ||
        (typeof enterprise.tenant === 'string' ? enterprise.tenant : enterprise.tenant?.code) !== request.tenant) fail();
    const next = [...person.userGroups];
    if (!next.includes(group.code)) next.push(group.code);
    const reviewFingerprint = require('crypto').createHash('sha256')
      .update(JSON.stringify({ tenant: request.tenant, person, group, enterprise })).digest('hex');
    return { person, next, review: { code: person.code, loginId: person.loginId, tenant: request.tenant,
      enterpriseCode: enterprise.code, userGroups: [...person.userGroups], nextUserGroups: next,
      authVersion: person.authVersion || 1, reviewFingerprint } };
  },
  /** Returns a credential-free, no-write review for the exact existing-account adoption command. */
  inspectPlatformAdministratorAdoption: async function (request) {
    return (await this.platformAdministratorAdoptionState(request)).review;
  },
  /**
   * Adds only the reviewed Platform group through generated Employee update and stamp hooks.
   * @param {Object} request Fresh human owner request, target, confirmed:true and reviewed fingerprint.
   * @returns {Promise<Object>} Code-only outcome. Drift, ambiguous writes or failed stamp/readback reject without retry.
   */
  adoptPlatformAdministrator: async function (request) {
    const fail = () => { throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Platform administrator adoption requires fresh review or committed-write inspection'); };
    if (request?.confirmed !== true || !/^[a-f0-9]{64}$/.test(request.reviewFingerprint || '')) fail();
    const { person, next, review } = await this.platformAdministratorAdoptionState(request);
    if (request.reviewFingerprint !== review.reviewFingerprint) fail();
    if (next.length === person.userGroups.length) return { code: person.code, changed: false };
    const retained = value => value === undefined ? { $exists: false } : value;
    await SERVICE.DefaultIdentityCatalogueGovernanceService.authorize(request);
    const event = { eventType: 'identity.platform_administrator.adoption', tenant: request.tenant,
      entCode: review.enterpriseCode, principalId: String(person._id), requestId: review.reviewFingerprint,
      reasonCode: 'PLATFORM_ADMINISTRATOR_ADOPTION', source: { owner: 'DefaultEmployeeService',
        actorLoginId: request.authData.loginId, targetCode: person.code, targetLoginId: person.loginId } };
    const audit = async outcome => {
      if (typeof SERVICE.DefaultAuthAuditService?.record !== 'function' ||
          !await SERVICE.DefaultAuthAuditService.record({ ...event, outcome })) fail();
    };
    await audit('REQUESTED');
    const command = { tenant: request.tenant, authData: request.authData,
      query: { _id: person._id, code: person.code, loginId: person.loginId, active: true,
        principalType: 'human', password: person.password, userGroups: person.userGroups,
        disabled: retained(person.disabled), registrationSuspended: retained(person.registrationSuspended),
        authVersion: retained(person.authVersion), authenticationIdentity: retained(person.authenticationIdentity),
        identityLinkRetirement: retained(person.identityLinkRetirement), registrationAssignmentCode: retained(person.registrationAssignmentCode),
        enterpriseCode: retained(person.enterpriseCode), metadata: retained(person.metadata),
        apiKey: retained(person.apiKey), apiKeyHash: retained(person.apiKeyHash) },
      model: { userGroups: next }, options: { returnModified: true, explain: false, snapshot: false } };
    SERVICE.DefaultLoggerService.inheritRequestPrivacy(command, request);
    platformAdoptionWrites.set(command, JSON.stringify([command.tenant, command.authData, command.query, command.options, command.model.userGroups]));
    let result;
    try { result = await this.update(command); }
    finally { platformAdoptionWrites.delete(command); }
    if (!/^SUC_/.test(result?.code || '') || result.success === false || result.error ||
        result.errors && (!Array.isArray(result.errors) || result.errors.length) ||
        result.result?.acknowledged !== true || result.result.matchedCount !== 1) fail();
    const current = await this.get({ tenant: request.tenant, authData: request.authData,
      query: { _id: person._id }, options: { recursive: false, skipItemCache: true },
      searchOptions: { pageSize: 2, pageNumber: 1 } });
    const row = current?.result?.[0];
    if (!/^SUC_/.test(current?.code || '') || current.success === false || current.error ||
        current.errors && (!Array.isArray(current.errors) || current.errors.length) ||
        current.count !== 1 || !Array.isArray(current.result) || current.result.length !== 1 ||
        String(row?._id) !== String(person._id) || row.code !== person.code || row.loginId !== person.loginId ||
        row.active !== true || row.disabled || row.registrationSuspended || row.principalType !== 'human' || row.authenticationIdentity ||
        row.registrationAssignmentCode || row.identityLinkRetirement ||
        String(row.password) !== String(person.password) ||
        JSON.stringify(row.userGroups) !== JSON.stringify(next) ||
        JSON.stringify(row.metadata) !== JSON.stringify(person.metadata) || row.enterpriseCode !== person.enterpriseCode ||
        !Number.isInteger(row.authVersion) || row.authVersion <= (person.authVersion || 1)) fail();
    await audit('SUCCESS');
    return { code: person.code, changed: true };
  },
  /** Preserves installed bootstrap identities; only private nImport Init may create missing records. */
  ensureBootstrapAll: function (request) {
    return SERVICE.DefaultMandatoryIdentityBootstrapService.ensureBootstrapAll(this, "employee", request);
  },
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
    const roles = await SERVICE.DefaultIdentityCatalogueService.roles();
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
