/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.platform/modules/profile/src/service/customer/defaultCustomerService
 * @description Implements profile default customer service business behavior and extension logic.
 * @layer service
 * @owner profile
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
const { isDeepStrictEqual } = require("node:util");
module.exports = {
  /** Preserves installed bootstrap identities; only private nImport Init may create missing records. */
  ensureBootstrapAll: function (request) {
    return SERVICE.DefaultMandatoryIdentityBootstrapService.ensureBootstrapAll(this, "customer", request);
  },
  /** Projects only the signed customer's current business identity; callers cannot select another account. */
  currentIdentity: async function (request) {
    const fail = () => {
      throw new CLASSES.NodicsError("ERR_AUTH_00003");
    };
    const empty = (value) =>
      value === undefined ||
      (value &&
        Object.getPrototypeOf(value) === Object.prototype &&
        Reflect.ownKeys(value).length === 0);
    const auth = request.authData,
      tenant = request.tenant;
    if (
      !auth ||
      auth.principalType !== "customer" ||
      auth.tokenType !== "access" ||
      auth.isSystem ||
      auth.tenant !== tenant ||
      !auth.loginId ||
      !auth.entCode ||
      [
        request.query,
        request.body,
        request.payload,
        request.httpRequest?.query,
        request.httpRequest?.body,
      ].some((value) => !empty(value))
    )
      fail();
    SERVICE.DefaultLoggerService.assertSensitiveRequest(request);
    const pin = structuredClone(auth);
    const bound = () => {
      if (
        !isDeepStrictEqual(request.authData, pin) ||
        request.tenant !== tenant ||
        [request.tenantCode, pin.tenantCode].some(
          (value) => value !== undefined && value !== tenant,
        ) ||
        [
          pin.enterpriseCode,
          request.enterpriseCode,
          request.entCode,
          request.httpRequest?.headers?.["x-enterprise-code"],
        ].some((value) => value !== undefined && value !== pin.entCode)
      )
        fail();
    };
    bound();
    await SERVICE.DefaultEnterpriseMembershipService.verifyAuthenticatedActor(
      request,
    );
    bound();
    const customer = await this.findByLoginId({
      tenant,
      loginId: pin.loginId,
      options: { recursive: false, skipItemCache: true },
    });
    bound();
    if (
      customer?.active !== true ||
      customer.loginId !== pin.loginId ||
      typeof customer.code !== "string" ||
      !customer.code.trim() ||
      customer.code.length > 191 ||
      (customer.tenant !== undefined && customer.tenant !== tenant)
    )
      fail();
    return {
      contractVersion: 1,
      tenant,
      enterpriseCode: pin.entCode,
      customer: { code: customer.code, loginId: customer.loginId },
    };
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
        .then(async (customers) => {
          const fresh =
            request.options?.skipItemCache === true &&
            request.options?.recursive === false;
          if (
            fresh &&
            (!/^SUC_/.test(customers?.code || "") ||
              customers.success === false ||
              customers.error ||
              (customers.errors &&
                (!Array.isArray(customers.errors) ||
                  customers.errors.length)) ||
              customers.count !== 1 ||
              !Array.isArray(customers.result) ||
              customers.result[0]?.loginId !== request.loginId ||
              !customers.result[0]?._id)
          )
            throw new CLASSES.NodicsError("ERR_AUTH_00001");
          if (customers.result.length !== 1) {
            reject(
              new CLASSES.NodicsError("ERR_PRFL_00003", "Invalid login id"),
            );
          } else {
            let customer = customers.result[0];
            if (fresh && !customer.authenticationIdentity) {
              const owner = SERVICE.DefaultEnterpriseMembershipService;
              if (typeof owner?.groups !== "function")
                throw new CLASSES.NodicsError("ERR_AUTH_00001");
              const groups = await owner.groups(
                request.tenant,
                customer.userGroups,
              );
              customer = {
                ...customer,
                userGroups: groups,
                userGroupCodes: UTILS.getUserGroupCodes(groups),
                userGroupPermissions: UTILS.getUserGroupPermissions(groups),
              };
            }
            resolve(customer);
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
  /**
   * Validates customer exist rules.
   *
   * @param {*} request Method input.
   * @returns {*} Method result.
   */
  isCustomerExist: function (request) {
    return new Promise((resolve, reject) => {
      this.get({
        tenant: request.tenant,
        authData:
          request.authData ||
          SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
        options: {
          recursive: false,
        },
        query: {
          loginId: request.loginId,
        },
      })
        .then((customers) => {
          if (customers.result.length > 1) {
            reject(
              new CLASSES.NodicsError("ERR_PRFL_00003", "Invalid login id"),
            );
          } else if (customers.result.length < 1) {
            reject(
              new CLASSES.NodicsError("ERR_PRFL_00005", "Customer not exist"),
            );
          } else {
            resolve({
              code: "SUC_PRFL_00002",
            });
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
  /** Adds reviewed reference groups to existing native customers without replaying credentials. */
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
          response.count !== response.result.length || response.result.length > maximum) fail();
      return response.result;
    };
    const reference = (value) => typeof value === "string" ? value :
      typeof value?.toHexString === "function" ? value.toHexString() : undefined;
    const models = request?.models;
    if (!key(request?.tenant) || !Array.isArray(models) || models.length < 1 || models.length > 100 ||
        !plain(request.authData) || !Array.isArray(request.authData.userGroups) ||
        !request.authData.userGroups.length) fail();
    const identities = new Set(), logins = new Set(), requiredGroups = new Set();
    const instructions = models.map((model) => {
      if (!plain(model) || Object.keys(model).sort().join("|") !==
          "code|expectedGroupCodes|groupCodes|loginId" || !key(model.code) ||
          !key(model.loginId, 320) || !codes(model.expectedGroupCodes) || !codes(model.groupCodes) ||
          identities.has(model.code) || logins.has(model.loginId) ||
          model.groupCodes.some((group) => model.expectedGroupCodes.includes(group))) fail();
      identities.add(model.code);
      logins.add(model.loginId);
      model.expectedGroupCodes.forEach((group) => requiredGroups.add(group));
      model.groupCodes.forEach((group) => requiredGroups.add(group));
      return { ...model, expectedGroupCodes: [...model.expectedGroupCodes], groupCodes: [...model.groupCodes] };
    });
    const read = async (service, query, maximum) => rows(await service.get({
      tenant: request.tenant, authData: request.authData, query,
      options: { recursive: false, skipItemCache: true },
      searchOptions: { pageSize: maximum + 1, pageNumber: 1 },
    }), maximum);
    if (typeof SERVICE.DefaultUserGroupService?.get !== "function") fail();
    const groups = await read(SERVICE.DefaultUserGroupService,
      { code: { $in: [...requiredGroups] }, active: true }, requiredGroups.size);
    if (groups.length !== requiredGroups.size ||
        new Set(groups.map((group) => group.code)).size !== groups.length ||
        groups.some((group) => group.active !== true || !requiredGroups.has(group.code))) fail();
    const customerRead = async (instruction) => {
      const records = await read(this,
        { $or: [{ code: instruction.code }, { loginId: instruction.loginId }] }, 1);
      if (records.length !== 1) fail();
      const record = records[0];
      if (!record?._id || record.code !== instruction.code || record.loginId !== instruction.loginId ||
          record.active !== true || record.disabled || record.registrationSuspended ||
          record.authenticationIdentity || record.principalType !== "customer" ||
          record.apiKey || record.apiKeyHash || !codes(record.userGroups) || !reference(record.password) ||
          (record.authVersion !== undefined && (!Number.isInteger(record.authVersion) ||
            record.authVersion < 0 || record.authVersion >= 2147483647))) fail();
      return { ...record, userGroups: [...record.userGroups] };
    };
    const prepared = [];
    for (const instruction of instructions) {
      const original = await customerRead(instruction);
      const desired = [...instruction.expectedGroupCodes, ...instruction.groupCodes];
      const current = JSON.stringify(original.userGroups);
      if (current !== JSON.stringify(instruction.expectedGroupCodes) && current !== JSON.stringify(desired)) fail();
      prepared.push({ instruction, original, desired });
    }
    const result = [];
    for (const { instruction, original, desired } of prepared) {
      if (JSON.stringify(original.userGroups) !== JSON.stringify(desired)) {
        const retained = (value) => value === undefined ? { $exists: false } : value;
        const updated = await this.update({
          tenant: request.tenant, authData: request.authData,
          query: {
            _id: original._id, code: original.code, loginId: original.loginId,
            active: true, principalType: "customer", userGroups: original.userGroups,
            password: original.password, authVersion: retained(original.authVersion),
            authenticationIdentity: retained(original.authenticationIdentity),
            disabled: retained(original.disabled), registrationSuspended: retained(original.registrationSuspended),
          },
          model: { userGroups: desired }, options: { returnModified: true },
        });
        if (!success(updated) || updated.result?.acknowledged !== true ||
            updated.result.matchedCount !== 1) fail();
        const current = await customerRead(instruction);
        if (String(current._id) !== String(original._id) ||
            reference(current.password) !== reference(original.password) ||
            JSON.stringify(current.userGroups) !== JSON.stringify(desired) ||
            current.principalType !== original.principalType ||
            current.authVersion === undefined || current.authVersion <= (original.authVersion || 0)) fail();
      }
      result.push({ code: instruction.code });
    }
    return { result };
  },
  /**
   * Registers a bounded batch with fresh explicit placement and private per-record import admission; existing matching identities are preserved.
   * @param {Object} request Original admitted batch or existing trusted registration context.
   * @returns {Promise<Object>} Registered or existing Customer code results.
   */
  signUpAll: async function (request) {
    const models = request.models || [];
    if (!Array.isArray(models) || models.length > 100)
      throw new CLASSES.NodicsError(
        "ERR_PRFL_00003",
        "A bounded customer batch is required",
      );
    const registration = SERVICE.DefaultCustomerRegistrationService;
    if (
      typeof registration?.resolveRegistrationPlacement !== "function" ||
      typeof registration.withRegistrationPlacement !== "function" ||
      typeof registration.withRegistrationBatchPlacement !== "function"
    )
      throw new CLASSES.NodicsError("ERR_PROFILE_MEMBERSHIP_UNAVAILABLE");
    return registration.withRegistrationBatchPlacement(request, async () => {
      const result = [];
      for (const model of models) {
        await registration.resolveRegistrationPlacement(request);
        const response = await this.get({
          tenant: request.tenant,
          authData: request.authData,
          query: { loginId: model.loginId },
          options: { recursive: false },
        });
        const existing = response && response.result && response.result[0];
        if (existing) {
          if (model.code && existing.code !== model.code)
            throw new CLASSES.NodicsError(
              "ERR_PRFL_00003",
              "Customer login is already registered under a different identity",
            );
          result.push({ code: existing.code });
        } else {
          const child = Object.assign({}, request, {
            model: Object.assign({}, model),
          });
          await registration.withRegistrationPlacement(
            request,
            child,
            (current) => this.signUp(current),
          );
          result.push({ code: model.code });
        }
      }
      return { result: result };
    });
  },

  /** Runs the customer registration pipeline with this composed service available to its existing extension steps. */
  signUp: function (request) {
    let _self = this;
    request.defaultCustomerService = _self;
    return new Promise((resolve, reject) => {
      SERVICE.DefaultPipelineService.start(
        "customerRegistrationHandlerPipeline",
        request,
        {},
      )
        .then((success) => {
          resolve(success);
        })
        .catch((error) => {
          reject(new CLASSES.NodicsError(error, null, "ERR_PRFL_00006"));
        });
    });
  },
};
