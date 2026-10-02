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
module.exports = {
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
