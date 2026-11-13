/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

/**
 * @module installer/config/properties
 * @description Reserves layered defaults for installed-runtime Application Builder governance.
 * @layer config
 * @owner installer
 * @override Customer projects may override allowlists and operation policy through normal Nodics configuration layering.
 */
module.exports = {
  installer: {
    applicationBuilder: {
      enabled: true,
      apiOperationsEnabled: true,
      mutatingOperationsEnabled: false,
      buildExecution: { enabled: false, experienceRoot: null, frontendCode: null, allowedPresets: [] },
      standaloneBootstrapRepository: "Nodics/nodics.installer",
      standaloneBootstrapCommand: "npx github:Nodics/nodics.installer",
      latestVerifiedStandaloneVersion: "0.7.2",
      protectVendorRepositories: ["nodics.ai", "nodics.axis"],
      evidenceDirectoryName: ".nodics-installer",
      workspaceManifestName: ".nodics-workspace.json",
      workspaceIdentityName: ".nodics-installer-identity.json",
      workspaceLockName: ".nodics-installer-lock.json",
      planning: {
        supportedAccelerators: ["apparel", "electronics", "telco"],
        defaultAccelerator: "apparel",
        defaultEnvironment: "local",
        nameMaxLength: 128,
      },
      presentation: {
        introduction:
          "Inspect an approved workspace and review a dry-run application plan.",
        preview: "Planning preview",
        reserved:
          "Application creation is not available. Execution requires an owner-qualified build, audit and rollback contract. Reviewing this plan creates no files or application data.",
        prerequisite:
          "An administrator must select an approved workspace before planning is available.",
        formTitle: "Prepare a dry-run plan",
        workspaceRoot: "Approved workspace folder",
        applicationName: "Application name",
        companySiteName: "Company site name (optional)",
        accelerator: "Application family",
        environment: "Environment",
        plan: "Review plan",
        refresh: "Refresh Builder availability",
        planTitle: "Reviewed plan",
        vendorRepositories: "Required vendor repositories",
        customerProjects: "Proposed customer projects",
        firstEnvironment: "First environment",
        dryRun: "Dry run only — nothing was created or installed.",
      },
      workspace: {
        allowedRoots: [],
        allowRequestWorkspaceRoot: true,
        maxEvidenceBytes: 65536,
        portProbeTimeoutMs: 250,
        allowedEvidenceFiles: [
          ".nodics-workspace.json",
          ".nodics-installer-identity.json",
          ".nodics-installer-lock.json",
          "summary.json",
          "setup.log",
          "preflight.log",
        ],
      },
    },
  },
  apiExposure: {
    categories: {
      installerManagement: {
        enabled: true,
      },
    },
  },
};
