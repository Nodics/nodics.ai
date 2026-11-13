/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.platform/modules/profile/src/service/interceptors/defaultEmployeeUpdateInterceptorService
 * @description Implements profile default employee update interceptor service business behavior and extension logic.
 * @layer service
 * @owner profile
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
  /** Employee creation uses the invitation owner and removal uses its governed lifecycle; ordinary public record endpoints retain history. */
  guardPublicCreation: function (request) {
    const auth = request.authData || {};
    if (request.httpRequest?.method === "PUT" && auth.tokenType === "access" && auth.principalType === "human" && !auth.isSystem)
      throw new CLASSES.NodicsError("ERR_AUTH_00003", "Create employee access through an enterprise invitation, not direct identity record creation");
    return true;
  },
  /** Refuses physical public Employee removal independently of optional Team membership qualification. */
  guardPublicRemoval: function (request) {
    const auth = request.authData || {};
    if (request.httpRequest?.method === "DELETE" && auth.tokenType === "access" && auth.principalType === "human" && !auth.isSystem)
      throw new CLASSES.NodicsError("ERR_AUTH_00003", "Employee history is retained. Change ordinary account status or use the governed Team lifecycle instead");
    return true;
  },
  /** Reuses Profile lifecycle authority before ordinary public employee patches reach stamp or persistence hooks. */
  guardPublicUpdate: function (request) { return SERVICE.DefaultEnterpriseManagementService.prepareLifecycleUpdate(request, "employee"); },
  /**
   * Executes employee pre update behavior.
   *
   * @param {*} request Method input.
   * @param {*} response Method input.
   * @returns {*} Method result.
   */
  employeePreUpdate: function (request, response) {
    return new Promise((resolve, reject) => {
      // Registration must not silently reactivate an administrator-suspended employee.
      const registration = SERVICE.DefaultEnterpriseRegistrationService;
      const model = request.model && (request.model.$set || request.model);
      if (
        model &&
        typeof model.active === "boolean" &&
        !(registration && registration.ownsProvisioningMutation(request))
      ) {
        model.registrationSuspended = model.active === false;
      }
      request.options.returnModified = request.options.returnModified || true;
      resolve(true);
    });
  },
  /**
   * Executes employee pre remove behavior.
   *
   * @param {*} request Method input.
   * @param {*} response Method input.
   * @returns {*} Method result.
   */
  employeePreRemove: function (request, response) {
    return new Promise((resolve, reject) => {
      request.options.returnModified = request.options.returnModified || true;
      resolve(true);
    });
  },
};
