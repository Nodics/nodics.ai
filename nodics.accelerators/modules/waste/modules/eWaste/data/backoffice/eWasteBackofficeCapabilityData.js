/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module eWaste/data/backoffice/eWasteBackofficeCapabilityData @description Electronics navigation owned by the eWaste accelerator, attached to the generic Waste anchor. @layer data @owner eWaste */
module.exports = {
  capability: {
    capabilityId: "ewaste-operations",
    displayName: "Electronics Waste",
    category: "sustainability",
    icon: "waste",
    requiredPermissions: ["waste.backoffice.view"],
    discovery: {
      openApiPath: "/nodics/system/v0/contract/openapi/internal",
      contractVersion: 1,
    },
  },
  defaults: {
    icon: "waste",
    permission: "waste.backoffice.view",
    perspectives: ["operations", "business"],
    contexts: ["environment", "tenant"],
    featureState: "ACTIVE",
  },
  navigation: [
    {
      id: "ewaste-operations",
      parentId: "waste-operations",
      parentModuleName: "wasteCore",
      label: "Electronics",
      route: "/waste/assets/electronics",
      order: 100,
      backendWorkspace: {
        contractVersion: 1,
        renderer: "axis.workspace.native",
        workspaceCode: "waste.review",
        viewCode: "ewaste.overview",
        title: "Electronics",
      },
      summary: "Electronic waste activity and review.",
    },
    {
      id: "ewaste-operations-submissions",
      parentId: "ewaste-operations",
      label: "Submissions",
      route: "/waste/assets/electronics/submissions",
      order: 20,
      backendWorkspace: {
        contractVersion: 1,
        renderer: "axis.workspace.native",
        workspaceCode: "waste.review",
        viewCode: "ewaste.submissions",
        title: "Electronics submissions",
      },
      summary: "Browse electronic waste submissions.",
    },
    {
      id: "ewaste-operations-review-queue",
      parentId: "ewaste-operations",
      label: "Review queue",
      route: "/waste/assets/electronics/review-queue",
      order: 30,
      backendWorkspace: {
        contractVersion: 1,
        renderer: "axis.workspace.native",
        workspaceCode: "waste.review",
        viewCode: "ewaste.reviewQueue",
        title: "Electronics review queue",
      },
      summary: "Review electronic waste awaiting a decision.",
    },
  ],
};
