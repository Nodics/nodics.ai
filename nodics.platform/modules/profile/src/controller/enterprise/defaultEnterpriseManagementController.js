/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module profile/controller/enterprise/DefaultEnterpriseManagementController
 * @description Maps permissioned employee enterprise-search requests to the Profile facade.
 * @layer controller
 * @owner profile
 * @override Later modules may replace response mapping while preserving the Profile-owned projection and authorization boundary.
 */
module.exports = {
  /** Inspects original enterprise creation evidence without invoking setup. @param {Object} request Trusted HTTP context. @param {Function} callback Optional callback. @returns {Promise<Object>|void} Native receipt. */
  inspectCreationReceipt: function (request, callback) {
    return this.commandReceiptInspection(request, callback, 'inspectCreationReceipt');
  },
  /** Inspects original invitation evidence without issuing another invitation. @param {Object} request Trusted HTTP context. @param {Function} callback Optional callback. @returns {Promise<Object>|void} Native receipt. */
  inspectInvitationReceipt: function (request, callback) {
    return this.commandReceiptInspection(request, callback, 'inspectInvitationReceipt');
  },
  /** Keeps receipt inspection private and preserves the verified actor. @param {Object} request Trusted request. @param {Function} callback Optional callback. @param {string} operation Fixed facade operation. @returns {Promise<Object>|void} Inert evidence. */
  commandReceiptInspection: function (request, callback, operation) {
    request.params = request.httpRequest?.params || request.params || {};
    request.httpResponse?.setHeader?.('Cache-Control', 'no-store');
    const result = Promise.resolve().then(() => FACADE.DefaultEnterpriseManagementFacade[operation](request)).then(data => ({ code: 'SUC_PRFL_00000', data }));
    return callback ? result.then(value => callback(null, value)).catch(callback) : result;
  },
  /** Maps setup inspection with no-store responses and content-free owner failures. @param {Object} request Human request. @param {Function} [callback] Nodics callback. @returns {Promise<Object>|void} Safe DTO. */
  inspectEnterpriseSetup: function (request, callback) {
    return this.setupContinuationAction(request, callback, "INSPECT");
  },
  /** Maps fixed revision-bound setup continuation, never arbitrary service dispatch. @param {Object} request Human command. @param {Function} [callback] Nodics callback. @returns {Promise<Object>|void} Safe DTO. */
  resumeEnterpriseSetup: function (request, callback) {
    return this.setupContinuationAction(request, callback, "RESUME");
  },
  /** Retains the original verified auth context while normalizing only DTO fields. @param {Object} request HTTP request. @param {Function} [callback] Nodics callback. @param {string} operation Fixed action. @returns {Promise<Object>|void} Safe response. */
  setupContinuationAction: function (request, callback, operation) {
    request.body = request.httpRequest?.body || request.body || {};
    request.query = request.httpRequest?.query || request.query || {};
    request.params = request.httpRequest?.params || request.params || {};
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    const promise = Promise.resolve()
      .then(() => {
        const facade = FACADE.DefaultEnterpriseManagementFacade;
        if (operation === "INSPECT")
          return facade.inspectEnterpriseSetup(request);
        if (operation === "RESUME")
          return facade.resumeEnterpriseSetup(request);
        throw new Error("Unavailable operation");
      })
      .then((data) => ({ code: "SUC_PRFL_00000", data }))
      .catch((error) => {
        const code =
          operation === "INSPECT"
            ? SERVICE.DefaultEnterpriseSetupContinuationService?.inspectionFailureCode?.(
                error,
              )
            : undefined;
        if (
          [
            "ERR_PROFILE_SETUP_INSPECTION_POLICY",
            "ERR_PROFILE_SETUP_INSPECTION_AUTHORIZATION",
            "ERR_PROFILE_SETUP_INSPECTION_INPUT",
            "ERR_PROFILE_SETUP_INSPECTION_READ",
            "ERR_PROFILE_SETUP_INSPECTION_ASSESSMENT",
          ].includes(code)
        )
          throw new CLASSES.NodicsError(code);
        throw new CLASSES.NodicsError(
          "ERR_PRFL_00003",
          "Enterprise setup continuation is held",
        );
      });
    return callback
      ? promise.then((value) => callback(null, value)).catch(callback)
      : promise;
  },
  /** Inspects exact committed grant stamp subjects under fresh independent recovery authority. @param {Object} request Signed target/platform request. @param {Function} [callback] Nodics callback. @returns {Promise<Object>|void} Inert repair selections. */
  inspectCommittedConsentStamps: function (request, callback) {
    return this.administrationConsentAction(
      request,
      callback,
      "INSPECT_COMMITTED_STAMPS",
    );
  },
  /** Repairs only inspected durable stamp versions, not the original access mutation or held hierarchy work. @param {Object} request Signed reviewed recovery command. @param {Function} [callback] Nodics callback. @returns {Promise<Object>|void} Redacted completed repair audit. */
  repairCommittedConsentStamps: function (request, callback) {
    return this.administrationConsentAction(
      request,
      callback,
      "REPAIR_COMMITTED_STAMPS",
    );
  },
  /** Loads an inert, versioned target administration workspace. @param {Object} request Signed target-aware request. @param {Function} callback Optional callback. @returns {Promise<Object>|void} Redacted owner workspace. */
  administrationConsentWorkspace: function (request, callback) {
    return this.administrationConsentAction(request, callback, "WORKSPACE");
  },
  /** Inspects a held hierarchy operation through fresh platform authority. @param {Object} request Signed operator request. @param {Function} callback Optional callback. @returns {Promise<Object>|void} Redacted state. */
  inspectEnterpriseHierarchy: function (request, callback) {
    return this.administrationConsentAction(
      request,
      callback,
      "INSPECT_HIERARCHY",
    );
  },
  /** Maps the reviewed platform relationship change to Profile's owner. @param {Object} request Signed operator request. @param {Function} callback Optional callback. @returns {Promise<Object>|void} Redacted outcome. */
  reparentEnterprise: function (request, callback) {
    return this.administrationConsentAction(request, callback, "REPARENT");
  },
  /** Resolves only a reviewed retained hierarchy fence through qualified platform recovery. @param {Object} request Signed exact recovery command. @param {Function} callback Optional callback. @returns {Promise<Object>|void} Redacted terminal state or refusal. */
  recoverEnterpriseHierarchy: function (request, callback) {
    return this.administrationConsentAction(
      request,
      callback,
      "RECOVER_HIERARCHY_SERIAL",
    );
  },
  /** Maps the fixed consent inspection to Profile without exposing private proof. @param {Object} request Signed target administrator. @param {Function} callback Optional callback. @returns {Promise<Object>|void} Redacted state. */
  inspectAdministrationConsent: function (request, callback) {
    return this.administrationConsentAction(request, callback, "INSPECT");
  },
  /** Maps only reviewed target-owned consent changes, never browser authority. @param {Object} request Signed target administrator. @param {Function} callback Optional callback. @returns {Promise<Object>|void} Redacted state. */
  changeAdministrationConsent: function (request, callback) {
    return this.administrationConsentAction(request, callback, "CHANGE");
  },
  /** Delegates fixed consent actions and redacts uncertain owner failures. @param {Object} request Signed request. @param {Function} callback Optional callback. @param {string} operation Fixed controller action. @returns {Promise<Object>|void} Safe owner result. */
  administrationConsentAction: function (request, callback, operation) {
    request.body = request.httpRequest?.body || request.body || {};
    request.query = request.httpRequest?.query || request.query || {};
    request.params = request.httpRequest?.params || request.params || {};
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    const promise = Promise.resolve()
      .then(() =>
        FACADE.DefaultEnterpriseManagementFacade.administrationConsentAction(
          request,
          operation,
        ),
      )
      .then((data) => ({ code: "SUC_PRFL_00000", data }))
      .catch((error) => {
        throw new CLASSES.NodicsError(
          /^ERR_PROFILE_CONSENT_(?:UNAVAILABLE|FORBIDDEN|CONFLICT)$/.test(
            error?.code || "",
          )
            ? error.code
            : "ERR_PROFILE_CONSENT_CONFLICT",
        );
      });
    return callback
      ? promise.then((result) => callback(null, result)).catch(callback)
      : promise;
  },
  /** Reconciles only a committed, reviewed team operation through the qualified platform operator owner. @param {Object} request Signed operator command. @param {Function} callback Optional callback. @returns {Promise<Object>|void} Safe recorded outcome. */
  reconcileTeamOperation: function (request, callback) {
    return this.membershipAction(request, callback, "RECONCILE_COMMITTED");
  },
  /** Reads only the admitted person's own membership task. @param {Object} request Current actor. @param {Function} callback Optional callback. @returns {Promise<Object>|void} Safe task. */
  enterpriseMembershipWorkspace: function (request, callback) {
    return this.membershipAction(request, callback, "WORKSPACE");
  },
  /** Loads the exact authenticated enterprise team task. @param {Object} request Request. @param {Function} callback Callback. @returns {Promise<Object>|void} Safe workspace. */
  enterpriseTeamWorkspace: function (request, callback) {
    return this.membershipAction(request, callback, "TEAM_WORKSPACE");
  },
  /** Maps fixed authenticated membership/team operations; private storage errors never enter HTTP responses. @param {Object} request Admitted HTTP request. @param {Function} callback Optional callback. @param {string} operation Controller-owned action. @returns {Promise<Object>|void} Safe Profile outcome. */
  membershipAction: function (request, callback, operation) {
    request.body = request.httpRequest?.body || request.body || {};
    request.query = request.httpRequest?.query || request.query || {};
    if (request.httpResponse?.setHeader)
      request.httpResponse.setHeader("Cache-Control", "no-store");
    const promise = Promise.resolve()
      .then(() =>
        FACADE.DefaultEnterpriseManagementFacade.membershipAction(
          request,
          operation,
        ),
      )
      .then((data) => ({ code: "SUC_PRFL_00000", data }))
      .catch((error) => {
        const code = error && error.code;
        throw new CLASSES.NodicsError(
          typeof code === "string" &&
            /^ERR_PROFILE_(?:MEMBERSHIP|TEAM)_[A-Z_]+$/.test(code)
            ? code
            : "ERR_PROFILE_MEMBERSHIP_STORAGE",
        );
      });
    return callback
      ? promise.then((value) => callback(null, value)).catch(callback)
      : promise;
  },
  /** Reads only memberships belonging to the fresh authenticated canonical actor. @param {Object} request Request. @param {Function} callback Callback. @returns {Promise<Object>|void} Safe list. */
  listOwnMemberships: function (request, callback) {
    return this.membershipAction(request, callback, "LIST");
  },
  /** Explicitly accepts one revision-bound invitation without issuing a session. @param {Object} request Request. @param {Function} callback Callback. @returns {Promise<Object>|void} Safe acceptance. */
  acceptMembership: function (request, callback) {
    return this.membershipAction(request, callback, "ACCEPT");
  },
  /** Suspends one governed membership, preserving the canonical person. @param {Object} request Request. @param {Function} callback Callback. @returns {Promise<Object>|void} Safe outcome. */
  suspendMembership: function (request, callback) {
    return this.membershipAction(request, callback, "SUSPEND");
  },
  /** Revokes one governed membership with current administrator safeguards. @param {Object} request Request. @param {Function} callback Callback. @returns {Promise<Object>|void} Safe outcome. */
  revokeMembership: function (request, callback) {
    return this.membershipAction(request, callback, "REVOKE");
  },
  /** Resumes one suspended membership through the serialized team owner. @param {Object} request Request. @param {Function} callback Callback. @returns {Promise<Object>|void} Safe outcome. */
  resumeMembership: function (request, callback) {
    return this.membershipAction(request, callback, "RESUME");
  },
  /** Maps only the fixed unused-invitation withdrawal command. @param {Object} request Signed current administrator. @param {Function} callback Optional callback. @returns {Promise<Object>|void} Safe outcome. */
  withdrawInvitation: function (request, callback) {
    return this.membershipAction(request, callback, "WITHDRAW");
  },
  /** Requests explicit same-event notification reconciliation. @param {Object} request Current administrator. @param {Function} callback Optional callback. @returns {Promise<Object>|void} Safe progress. */
  retryLifecycleNotification: function (request, callback) {
    return this.membershipAction(request, callback, "RETRY_NOTIFICATION");
  },
  /** Inspects only an explicit qualified operator recovery target. @param {Object} request Fresh operator. @param {Function} callback Optional callback. @returns {Promise<Object>|void} Safe operation proof. */
  enterpriseRecoveryWorkspace: function (request, callback) {
    return this.membershipAction(request, callback, "RECOVERY_WORKSPACE");
  },
  /** Transfers default designation to a current administrator, not a credential. @param {Object} request Request. @param {Function} callback Callback. @returns {Promise<Object>|void} Safe designation. */
  handoverAdministrator: function (request, callback) {
    return this.membershipAction(request, callback, "HANDOVER");
  },
  /** Maps fixed public registration actions without exposing private exception material. */
  registrationAction: function (request, callback, operation) {
    request.body =
      (request.httpRequest && request.httpRequest.body) || request.body || {};
    if (
      request.httpResponse &&
      typeof request.httpResponse.setHeader === "function"
    ) {
      request.httpResponse.setHeader("Cache-Control", "no-store");
      request.httpResponse.setHeader("Pragma", "no-cache");
    }
    const promise = Promise.resolve()
      .then(() =>
        FACADE.DefaultEnterpriseManagementFacade.registrationAction(
          request,
          operation,
        ),
      )
      .then((data) => ({ code: "SUC_PRFL_00000", data }))
      .catch((error) => {
        const code = error && error.code;
        if (
          typeof code === "string" &&
          /^ERR_PROFILE_(?:REG|APP)_[A-Z_]+$/.test(code)
        )
          throw new CLASSES.NodicsError(code);
        if (code === "ERR_CACHE_00011" || code === "ERR_COMMS_VERIFY_RATE")
          throw new CLASSES.NodicsError("ERR_PROFILE_REG_RATE");
        if (code === "ERR_CACHE_00012")
          throw new CLASSES.NodicsError("ERR_PROFILE_REG_UNAVAILABLE");
        if (code === "ERR_COMMS_VERIFY_STATE")
          throw new CLASSES.NodicsError("ERR_PROFILE_REG_VERIFY_AGAIN");
        throw new CLASSES.NodicsError("ERR_PROFILE_REG_STORAGE");
      });
    return callback
      ? promise.then((value) => callback(null, value)).catch(callback)
      : promise;
  },
  /** Accepts only a service-authenticated Process handle; redacts private callback failures. */
  applyEmployeeApplicationDecision: function (request, callback) {
    const result = Promise.resolve()
      .then(() =>
        FACADE.DefaultEnterpriseManagementFacade.applyEmployeeApplicationDecision(
          request,
        ),
      )
      .then((data) => ({ code: "SUC_PRFL_00000", data }))
      .catch(() => {
        throw new CLASSES.NodicsError("ERR_PROFILE_APP_REVIEW");
      });
    return callback
      ? result.then((value) => callback(null, value)).catch(callback)
      : result;
  },
  /** Saves a proof-bound application without registering or approving an employee. */
  applyForEnterprise: function (request, callback) {
    return this.registrationAction(request, callback, "APPLY");
  },
  /** Withdraws only the mailbox-owned pending application at its displayed revision. */
  withdrawEmployeeApplication: function (request, callback) {
    return this.registrationAction(request, callback, "WITHDRAW_APPLICATION");
  },
  /** Lists submitted applications under the existing human management boundary. */
  searchEmployeeApplications: function (request, callback) {
    if (request.httpResponse?.setHeader)
      request.httpResponse.setHeader("Cache-Control", "no-store");
    request.query =
      (request.httpRequest && request.httpRequest.query) || request.query || {};
    const result = Promise.resolve()
      .then(() =>
        FACADE.DefaultEnterpriseManagementFacade.searchEmployeeApplications(
          request,
        ),
      )
      .then((data) => ({ code: "SUC_PRFL_00000", data }))
      .catch((error) => {
        if (
          /^ERR_PROFILE_(?:REG|APP)_[A-Z_]+$/.test((error && error.code) || "")
        )
          throw new CLASSES.NodicsError(error.code);
        throw new CLASSES.NodicsError("ERR_PROFILE_APP_STORAGE");
      });
    return callback
      ? result.then((value) => callback(null, value)).catch(callback)
      : result;
  },
  /** Maps administrative recovery commands; approval decisions remain Process-owned. */
  manageEmployeeApplicationReview: function (request, callback) {
    request.body = request.httpRequest?.body || request.body || {};
    request.params = request.httpRequest?.params || request.params || {};
    if (request.httpResponse?.setHeader)
      request.httpResponse.setHeader("Cache-Control", "no-store");
    const promise = Promise.resolve()
      .then(() =>
        FACADE.DefaultEnterpriseManagementFacade.manageEmployeeApplicationReview(
          request,
        ),
      )
      .then((data) => ({ code: "SUC_PRFL_00000", data }))
      .catch(() => {
        throw new CLASSES.NodicsError("ERR_PROFILE_APP_REVIEW");
      });
    return callback
      ? promise.then((value) => callback(null, value)).catch(callback)
      : promise;
  },
  /** Reads one redacted application through its owner and prohibits browser caching. */
  inspectEmployeeApplicationReview: function (request, callback) {
    request.body = request.httpRequest?.body || request.body || {};
    request.query = request.httpRequest?.query || request.query || {};
    request.params = request.httpRequest?.params || request.params || {};
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    const promise = Promise.resolve()
      .then(() =>
        FACADE.DefaultEnterpriseManagementFacade.inspectEmployeeApplicationReview(
          request,
        ),
      )
      .then((data) => ({ code: "SUC_PRFL_00000", data }))
      .catch(() => {
        throw new CLASSES.NodicsError("ERR_PROFILE_APP_REVIEW");
      });
    return callback
      ? promise.then((value) => callback(null, value)).catch(callback)
      : promise;
  },
  /** Starts the email-first registration continuation. */
  startEmployeeRegistration: function (request, callback) {
    return this.registrationAction(request, callback, "START");
  },
  /** Verifies the code through the existing Communication owner. */
  verifyEmployeeRegistration: function (request, callback) {
    return this.registrationAction(request, callback, "VERIFY");
  },
  /** Replaces the code without blindly retrying a delivery. */
  resendEmployeeRegistration: function (request, callback) {
    return this.registrationAction(request, callback, "RESEND");
  },
  /** Reads current progress without provisioning. */
  employeeRegistrationStatus: function (request, callback) {
    return this.registrationAction(request, callback, "STATUS");
  },
  /** Searches enterprises through the bounded management facade. */
  search: function (request, callback) {
    request.query =
      (request.httpRequest && request.httpRequest.query) || request.query || {};
    let promise = FACADE.DefaultEnterpriseManagementFacade.search(request).then(
      (data) => ({ code: "SUC_PRFL_00000", data: data }),
    );
    return callback
      ? promise.then((value) => callback(null, value)).catch(callback)
      : promise;
  },
  /** Creates one enterprise through the Profile-owned management facade. */
  create: function (request, callback) {
    let promise = Promise.resolve()
      .then(() => {
        request.body =
          (request.httpRequest && request.httpRequest.body) ||
          request.body ||
          {};
        request.payload = request.body;
        const utility = SERVICE.DefaultSchemaUtilityService;
        if (!utility || typeof utility.getIdempotencyKey !== "function")
          throw new CLASSES.NodicsError(
            "ERR_DBS_00004",
            "Schema utility service is unavailable",
          );
        request.idempotencyKey = utility.getIdempotencyKey(request);
        return FACADE.DefaultEnterpriseManagementFacade.create(request);
      })
      .then((data) => ({ code: "SUC_PRFL_00000", data: data }));
    return callback
      ? promise.then((value) => callback(null, value)).catch(callback)
      : promise;
  },
  /** Lists pre-assigned enterprise access records through the Profile-owned management facade. */
  searchAccessAssignments: function (request, callback) {
    request.query =
      (request.httpRequest && request.httpRequest.query) || request.query || {};
    let promise =
      FACADE.DefaultEnterpriseManagementFacade.searchAccessAssignments(
        request,
      ).then((data) => ({ code: "SUC_PRFL_00000", data: data }));
    return callback
      ? promise.then((value) => callback(null, value)).catch(callback)
      : promise;
  },
  /** Creates one enterprise user pre-assignment through the Profile-owned management facade. */
  preAssignAccess: function (request, callback) {
    request.body =
      (request.httpRequest && request.httpRequest.body) || request.body || {};
    request.params =
      (request.httpRequest && request.httpRequest.params) ||
      request.params ||
      {};
    let promise = FACADE.DefaultEnterpriseManagementFacade.preAssignAccess(
      request,
    ).then((data) => ({ code: "SUC_PRFL_00000", data: data }));
    return callback
      ? promise.then((value) => callback(null, value)).catch(callback)
      : promise;
  },
  /** Resolves a public pre-assignment for Axis registration. */
  resolvePreAssignedAccess: function (request, callback) {
    request.query =
      (request.httpRequest && request.httpRequest.query) || request.query || {};
    let promise = Promise.resolve()
      .then(() =>
        FACADE.DefaultEnterpriseManagementFacade.resolvePreAssignedAccess(
          request,
        ),
      )
      .then((data) => ({ code: "SUC_PRFL_00000", data: data }));
    return callback
      ? promise.then((value) => callback(null, value)).catch(callback)
      : promise;
  },
  /** Completes pre-approved enterprise employee registration. */
  registerPreAssignedEmployee: function (request, callback) {
    return this.registrationAction(request, callback, "COMPLETE");
  },
  /** Returns the public backend-driven registration workspace contract. */
  getPublicAccessWorkspace: function (request, callback) {
    request.publicOnly = true;
    if (
      request.httpResponse &&
      typeof request.httpResponse.setHeader === "function"
    )
      request.httpResponse.setHeader("Cache-Control", "no-store");
    let promise = FACADE.DefaultEnterpriseManagementFacade.getAccessWorkspace(
      request,
    ).then((data) => ({ code: "SUC_PRFL_00000", data: data }));
    return callback
      ? promise.then((value) => callback(null, value)).catch(callback)
      : promise;
  },
};
