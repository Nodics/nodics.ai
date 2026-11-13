/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

const capability = {
  enabled: true,
  capabilityId: "platform-installer",
  displayName: "Installer and Application Builder",
  category: "platform",
  icon: "settings",
  contractVersion: 0,
  minimumClientContractVersion: 0,
  roles: ["CONTROL_PLANE_PROVIDER", "FUNCTIONAL_CAPABILITY_PROVIDER"],
  requiredPermissions: ["installer.workspace.view"],
  navigation: [
    {
      id: "application-builder",
      label: "Application Builder",
      route: "/application-builder",
      icon: "settings",
      order: 60,
      group: {
        id: "publishing",
        label: "Publishing",
        order: 1700,
      },
      perspectives: ["operations"],
      contexts: ["environment", "tenant", "enterprise"],
      featureState: "PREVIEW",
      backendWorkspace: {
        contractVersion: 1,
        renderer: "axis.workspace.native",
        workspaceCode: "installer.applicationBuilder",
        viewCode: "overview",
        title: "Application Builder",
        description:
          "Inspect approved workspaces and review read-only plans; application creation remains unavailable.",
      },
      requiredPermissions: ["installer.workspace.view"],
      help: {
        summary:
          "Inspect and operate installed Nodics local setup workflows after the first-machine bootstrap exists.",
      },
      lifecycleActions: [
        {
          id: "installer-plan",
          label: "Review plan",
          intent: "READ",
          permission: "installer.workspace.plan",
          summary: "Review a read-only application plan; no build is executed.",
          featureState: "ACTIVE",
          ownerModule: "installer",
          handlerAction: "setup.plan",
          httpMethod: "POST",
          operationRoute: "/nodics/installer/v0/setup/plan",
          order: 30,
        },
        {
          id: "installer-status",
          label: "Check Status",
          intent: "READ",
          permission: "installer.workspace.view",
          summary:
            "Read installer evidence, workspace manifest, and topology status.",
          featureState: "PREVIEW",
          ownerModule: "installer",
          handlerAction: "workspace.status",
          httpMethod: "POST",
          operationRoute: "/nodics/installer/v0/workspace/status",
          order: 10,
        },
        {
          id: "installer-preflight",
          label: "Run Preflight",
          intent: "VERIFY",
          permission: "installer.workspace.view",
          summary:
            "Run local prerequisite and port checks before setup or repair.",
          featureState: "PREVIEW",
          ownerModule: "installer",
          handlerAction: "workspace.preflight",
          httpMethod: "POST",
          operationRoute: "/nodics/installer/v0/workspace/preflight",
          order: 20,
        },
      ],
    },
  ],
};

/**
 * @module installer/service/DefaultInstallerBackofficeCapabilityService
 * @description Publishes the installed-runtime Application Builder capability projection for BackOffice and future Axis UI.
 * @layer service
 * @owner installer
 * @override Enable visible navigation and operation routes only after secured installer APIs are implemented.
 */
module.exports = {
  /** Registers this module BackOffice capability provider when the runtime registry is available. */
  init: function () {
    if (global.SERVICE && SERVICE.DefaultModuleRegistrationAgentService) {
      SERVICE.DefaultModuleRegistrationAgentService.registerBackofficeCapabilityProvider(
        "installer",
        this,
      );
    }
    return Promise.resolve(true);
  },

  /** Completes provider lifecycle initialization. */
  postInit: function () {
    return Promise.resolve(true);
  },

  /** Returns this module-owned BackOffice capability contract. */
  getCapability: function () {
    const result = JSON.parse(JSON.stringify(capability));
    if (
      !require("./defaultInstallerOperationCatalogService").apiOperationsEnabled()
    ) {
      result.navigation[0].featureState = "DISABLED";
      result.navigation[0].lifecycleActions.forEach((action) => {
        action.featureState = "DISABLED";
      });
    }
    return result;
  },
};
