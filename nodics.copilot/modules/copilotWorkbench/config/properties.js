/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module copilotWorkbench/config/properties
 * @description Defines generated configurable defaults for copilotWorkbench.
 * @layer config
 * @owner generated
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
  copilot: {
    workbench: {
      receiptRecovery: {
        enabled: false,
        label: "Inspect original business results",
        continuation:
          "Completed rows are preserved. Review and approve the remaining unstarted rows before continuing.",
      },
      maximumRecordsPerPlan: 100,
      standaloneInvitationsEnabled: false,
      standalonePricesEnabled: false,
      processTaskTarget: {
        enabled: false,
        moduleName: "workflow",
        connectionName: null,
        targetAuthority: null,
      },
      processTriggerTarget: {
        enabled: false,
        moduleName: "workflow",
        connectionName: null,
        targetAuthority: null,
      },
      processLifecycleTarget: {
        enabled: false,
        moduleName: "workflow",
        connectionName: null,
        targetAuthority: null,
      },
      processLifecycleTimeoutMs: 30000,
      schemaActions: {
        enabled: false,
        sources: {},
        timeoutMs: 30000,
      },
      processTriggerTimeoutMs: 10000,
      processTriggerPresentation: {
        title: "Process trigger",
        operation: "Operation",
        trigger: "Trigger",
        actor: "Executing employee",
        command: "Command",
        summary:
          "Review the exact trigger command. Workflow checks current lifecycle and permissions at execution. Trigger metadata does not create a Cron schedule. Execute starts a workflow and can perform downstream domain actions; an acknowledgement is not proof that every later step completed. Nothing has changed yet.",
      },
      requireValidation: true,
      requireConfirmation: true,
      apiOnlyExecution: true,
      couponTarget: {
        enabled: false,
        moduleName: "digitalCore",
        connectionName: null,
        targetAuthority: { runtimeRole: "COMMERCE" },
      },
      orderNotificationTarget: {
        enabled: false,
        moduleName: "digitalCore",
        connectionName: null,
        targetAuthority: { runtimeRole: "COMMERCE" },
      },
      couponPresentation: {
        redeemTab: "Redeem",
        redemptionsTab: "Redemption activity",
        refreshRedemptions: "Refresh activity",
        emptyRedemptions: "No redemption activity is available.",
        recoveryRequired: "Original receipt review required",
        product: "Product",
        status: "Status",
        inspect: "Check original receipt",
        reload: "Reload action",
        resume: "Open existing action",
        actionReference: "Action reference",
        unconfirmed:
          "Commerce has not confirmed the original redemption. Do not repeat fulfillment.",
        open: "Redeem a coupon",
        title: "Coupon fulfillment",
        coupon: "Customer coupon code",
        receipt: "Transaction or receipt reference",
        prepare: "Validate and review",
        close: "Close",
        unavailable:
          "Coupon fulfillment is unavailable. Check permissions, owner configuration and the original receipt before trying another command.",
        approve: "Approve reviewed fulfillment",
        execute: "Confirm fulfilled benefit and redeem",
        reject: "Reject",
        expired:
          "Validation expired. Validate the coupon again before a new review.",
        completed: "Commerce confirmed redemption.",
        secureMessage:
          "Use the secure coupon fulfillment form to validate the code, review the benefit and explicitly confirm redemption. No coupon code from this message was sent to a model or saved in this conversation.",
      },
      enterpriseTarget: {
        enabled: false,
        moduleName: null,
        connectionName: null,
        targetAuthority: null,
      },
      collectionCentreTarget: {
        enabled: false,
        moduleName: "wasteCollection",
        connectionName: null,
        targetAuthority: null,
      },
      collectionCentreReview: {
        title: "Collection centre",
        fields: {
          code: "Code",
          name: "Name",
          collectionPointType: "Collection type",
          "locationRef.module": "Location module",
          "locationRef.schema": "Location schema",
          "locationRef.code": "Location code",
          "operatorEnterpriseRef.module": "Operator module",
          "operatorEnterpriseRef.schema": "Operator schema",
          "operatorEnterpriseRef.code": "Operator enterprise",
          operatingStatus: "Operating status",
          publicVisibility: "Visibility",
          status: "Lifecycle status",
          revision: "Revision",
        },
      },
    },
  },
};
