/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module profile/facade/enterprise/DefaultEnterpriseManagementFacade
 * @description Provides the replaceable Profile facade boundary for enterprise management reads.
 * @layer facade
 * @owner profile
 * @override Later modules may compose additional policy while delegating persistence and projection to Profile services.
 */
module.exports = {
  /** Delegates original creation inspection to its native owner. @param {Object} request Trusted request. @returns {Promise<Object>} Receipt. */
  inspectCreationReceipt: function (request) { return SERVICE.DefaultEnterpriseCommandReceiptService.inspectCreation(request); },
  /** Delegates original invitation inspection without mutation. @param {Object} request Trusted request. @returns {Promise<Object>} Receipt. */
  inspectInvitationReceipt: function (request) { return SERVICE.DefaultEnterpriseCommandReceiptService.inspectInvitation(request); },
  /** Delegates native setup inspection through EnterpriseManagement. @param {Object} request Human operator. @returns {Promise<Object>} Safe DTO. */
  inspectEnterpriseSetup: function (request) {
    return SERVICE.DefaultEnterpriseManagementService.inspectEnterpriseSetup(
      request,
    );
  },
  /** Delegates same-intent setup continuation through EnterpriseManagement. @param {Object} request Revision-bound command. @returns {Promise<Object>} Safe outcome. */
  resumeEnterpriseSetup: function (request) {
    return SERVICE.DefaultEnterpriseManagementService.resumeEnterpriseSetup(
      request,
    );
  },
  /** Dispatches only fixed target-consent operations to the owning service. @param {Object} request Signed command. @param {string} operation Fixed controller action. @returns {Promise<Object>} Redacted state. */
  administrationConsentAction: function (request, operation) {
    const owner = SERVICE.DefaultEnterpriseAdministrationConsentService;
    if (operation === "INSPECT_COMMITTED_STAMPS")
      return owner.inspectCommittedStamps(request);
    if (operation === "REPAIR_COMMITTED_STAMPS")
      return owner.repairCommittedStamps(request);
    if (operation === "WORKSPACE") return owner.workspace(request);
    if (operation === "INSPECT_HIERARCHY")
      return owner.inspectHierarchy(request);
    if (operation === "REPARENT") return owner.reparent(request);
    if (operation === "RECOVER_HIERARCHY_SERIAL")
      return owner.recoverHierarchySerial(request);
    if (operation === "INSPECT") return owner.inspect(request);
    if (operation === "CHANGE") return owner.command(request);
    throw new CLASSES.NodicsError("ERR_PROFILE_CONSENT_FORBIDDEN");
  },
  /** Delegates fixed membership/team commands to their existing Profile owners. @param {Object} request Authenticated request. @param {string} operation Controller-owned action. @returns {Promise<Object>} Safe owner outcome. */
  membershipAction: function (request, operation) {
    if (operation === "RECOVERY_WORKSPACE")
      return SERVICE.DefaultEnterpriseTeamAdministrationService.recoveryWorkspace(
        request,
      );
    if (operation === "RETRY_NOTIFICATION")
      return SERVICE.DefaultEnterpriseNotificationService.retry(request);
    if (operation === "WITHDRAW")
      return SERVICE.DefaultEnterpriseTeamAdministrationService.withdrawInvitation(
        request,
      );
    if (operation === "RECONCILE_COMMITTED")
      return SERVICE.DefaultEnterpriseTeamAdministrationService.reconcileCommittedOperation(
        request,
      );
    if (operation === "WORKSPACE")
      return SERVICE.DefaultEnterpriseMembershipService.workspace(request);
    if (operation === "TEAM_WORKSPACE")
      return SERVICE.DefaultEnterpriseTeamAdministrationService.workspace(
        request,
      );
    if (operation === "LIST")
      return SERVICE.DefaultEnterpriseMembershipService.list(request);
    if (operation === "HANDOVER")
      return SERVICE.DefaultEnterpriseTeamAdministrationService.handover(
        request,
      );
    if (!["ACCEPT", "SUSPEND", "REVOKE", "RESUME"].includes(operation))
      throw new CLASSES.NodicsError("ERR_PROFILE_MEMBERSHIP_FORBIDDEN");
    return SERVICE.DefaultEnterpriseMembershipService.command(
      request,
      operation,
    );
  },
  /** Delegates a fixed, controller-selected public action to the existing Profile registration owner. */
  registrationAction: function (request, operation) {
    return SERVICE.DefaultEnterpriseRegistrationService.execute(
      request,
      operation,
    );
  },
  /** Delegates only the authoritative Process callback to Profile's application owner. */
  applyEmployeeApplicationDecision: function (request) {
    return SERVICE.DefaultEnterpriseApplicationReviewService.applyDecision(
      request,
    );
  },
  /** Delegates review visibility, not decisions, to the existing Profile application owner. */
  searchEmployeeApplications: function (request) {
    return SERVICE.DefaultEnterpriseApplicationService.search(request);
  },
  /** Delegates authorised review recovery to Profile, never to a browser-selected service. */
  manageEmployeeApplicationReview: function (request) {
    return SERVICE.DefaultEnterpriseApplicationReviewService.manage(request);
  },
  /** Delegates scoped application inspection without starting or deciding a review. */
  inspectEmployeeApplicationReview: function (request) {
    return SERVICE.DefaultEnterpriseApplicationReviewService.inspect(request);
  },
  /** Delegates bounded enterprise search to the authoritative Profile service. */
  search: function (request) {
    return SERVICE.DefaultEnterpriseManagementService.search(request);
  },
  /** Delegates confirmed enterprise creation to the authoritative Profile service. */
  create: function (request) {
    return SERVICE.DefaultEnterpriseManagementService.createFromModel(request);
  },
  /** Delegates bounded enterprise access-assignment search to the authoritative Profile service. */
  searchAccessAssignments: function (request) {
    return SERVICE.DefaultEnterpriseManagementService.searchAccessAssignments(
      request,
    );
  },
  /** Delegates governed enterprise access pre-assignment to the authoritative Profile service. */
  preAssignAccess: function (request) {
    return SERVICE.DefaultEnterpriseManagementService.preAssignAccess(request);
  },
  /** Delegates public access-assignment resolution to the authoritative Profile service. */
  resolvePreAssignedAccess: function (request) {
    return SERVICE.DefaultEnterpriseManagementService.resolvePreAssignedAccess(
      request,
    );
  },
  /** Delegates pre-approved enterprise employee registration to the authoritative Profile service. */
  registerPreAssignedEmployee: function (request) {
    return SERVICE.DefaultEnterpriseManagementService.registerPreAssignedEmployee(
      request,
    );
  },
  /** Delegates backend-driven workspace delivery to the authoritative Profile service. */
  getAccessWorkspace: function (request) {
    return Promise.resolve(
      SERVICE.DefaultEnterpriseManagementService.getAccessWorkspace(request),
    );
  },
};
