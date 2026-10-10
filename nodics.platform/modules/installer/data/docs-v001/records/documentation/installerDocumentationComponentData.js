/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Canonical module-owned documentation CMS component records. */
module.exports = {
  "record0": {
    "code": "nodicsDocsComponentinstallerInstalledRuntimeApplicationBuilder",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "installer.installed-runtime-application-builder",
      "title": "Installed Runtime Installer and Application Builder APIs",
      "route": "/docs/framework/installer-installed-runtime-application-builder",
      "section": "nodics-installer-and-workspace-setup",
      "sectionTitle": "Nodics Installer and Workspace Setup",
      "group": "nodics-installer-and-workspace-setup",
      "groupTitle": "Nodics Installer and Workspace Setup",
      "parentId": "nodics-installer-and-workspace-setup",
      "hierarchyPath": [
        "Nodics Installer and Workspace Setup",
        "Installed Runtime Installer and Application Builder APIs"
      ],
      "hierarchyDepth": 2,
      "documentType": "reference",
      "audience": [
        "business",
        "architect",
        "administrator",
        "developer",
        "operator",
        "qa",
        "ai-tool"
      ],
      "businessAudience": [
        "administrator",
        "implementation partner",
        "support owner"
      ],
      "technicalAudience": [
        "architect",
        "developer",
        "operator",
        "qa engineer",
        "ai tool"
      ],
      "summary": "Safe read-only runtime API model for installed workspace inspection, setup planning, operation catalogue, and redacted evidence.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.5",
      "maturityState": "operational",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "framework.local-quick-start",
        "framework.local-verification-checklist",
        "platform.module-registry",
        "docs.overview"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "../../../../actionsRepo/installer-application-builder/installer-platform-api-scope-actions-2026-08-26.md",
        "package.json",
        "src/schemas",
        "src/service"
      ],
      "visualRequirements": [
        "data-flow",
        "source-map-table"
      ],
      "searchKeywords": [
        "installer",
        "application-builder",
        "workspace-readiness",
        "setup-plan",
        "evidence"
      ],
      "topicKeywords": [
        "Nodics Installer and Workspace Setup",
        "Installed Runtime APIs",
        "Application Builder"
      ],
      "headings": [
        {
          "text": "Business perspective",
          "anchor": "installerInstalledRuntimeApplicationBuilder-1-business-perspective",
          "level": 2
        },
        {
          "text": "Runtime flow",
          "anchor": "installerInstalledRuntimeApplicationBuilder-2-runtime-flow",
          "level": 2
        },
        {
          "text": "Technical perspective",
          "anchor": "installerInstalledRuntimeApplicationBuilder-3-technical-perspective",
          "level": 2
        },
        {
          "text": "Configuration and customization",
          "anchor": "installerInstalledRuntimeApplicationBuilder-4-configuration-and-customization",
          "level": 2
        },
        {
          "text": "Access and publication",
          "anchor": "installerInstalledRuntimeApplicationBuilder-5-access-and-publication",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "installerInstalledRuntimeApplicationBuilder-6-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "installerInstalledRuntimeApplicationBuilder-7-verification",
          "level": 2
        },
        {
          "text": "Installed runtime API reference",
          "anchor": "installer-api-reference",
          "level": 2
        },
        {
          "text": "Detailed Summary",
          "anchor": "installer-api-reference-1-detailed-summary",
          "level": 2
        },
        {
          "text": "Business Perspective",
          "anchor": "installer-api-reference-2-business-perspective",
          "level": 2
        },
        {
          "text": "Capability Flow",
          "anchor": "installer-api-reference-3-capability-flow",
          "level": 2
        },
        {
          "text": "Bootstrap And Runtime Split",
          "anchor": "installer-api-reference-4-bootstrap-and-runtime-split",
          "level": 2
        },
        {
          "text": "Current Operations",
          "anchor": "installer-api-reference-5-current-operations",
          "level": 2
        },
        {
          "text": "Operation States",
          "anchor": "installer-api-reference-6-operation-states",
          "level": 2
        },
        {
          "text": "Technical Perspective",
          "anchor": "installer-api-reference-7-technical-perspective",
          "level": 2
        },
        {
          "text": "Runtime Request Flow",
          "anchor": "installer-api-reference-8-runtime-request-flow",
          "level": 2
        },
        {
          "text": "Configuration Model",
          "anchor": "installer-api-reference-9-configuration-model",
          "level": 2
        },
        {
          "text": "Security And Governance",
          "anchor": "installer-api-reference-10-security-and-governance",
          "level": 2
        },
        {
          "text": "Customization And Extension",
          "anchor": "installer-api-reference-11-customization-and-extension",
          "level": 2
        },
        {
          "text": "Governed Mutation Contract",
          "anchor": "installer-api-reference-12-governed-mutation-contract",
          "level": 2
        },
        {
          "text": "Documentation Placement",
          "anchor": "installer-api-reference-13-documentation-placement",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "The installed-runtime Installer capability explains how a generated Nodics workspace can expose safe, read-only setup and Application Builder information to Axis. This is separate from the standalone `nodics.installer` package, which remains the first-machine bootstrap path before a user has the framework locally. Beginners should use this page to understand the difference between creating a workspace and inspecting a workspace that already exists."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business perspective",
          "anchor": "installerInstalledRuntimeApplicationBuilder-1-business-perspective"
        },
        {
          "kind": "paragraph",
          "text": "Enterprise teams need a guided way to understand whether a local or customer workspace is ready before they ask developers or operators to repair it. The installed-runtime capability gives Axis and administrators a backend-owned view of installer information, operation catalogue, workspace status, workspace inventory, preflight readiness, setup-plan preview, and redacted evidence. That reduces confusion because the business user can see readiness and next action guidance without receiving raw machine paths, secrets, stack traces, or unsupported commands."
        },
        {
          "kind": "table",
          "headers": [
            "Question",
            "Business answer",
            "Technical owner"
          ],
          "rows": [
            [
              "How do we create the first workspace?",
              "Use the standalone installer bootstrap package",
              "`nodics.installer` repository"
            ],
            [
              "How do we inspect an installed workspace from Axis?",
              "Use secured read-only runtime APIs",
              "Platform Installer module"
            ],
            [
              "Can Axis start or repair the machine?",
              "Not through this read-only capability",
              "Mutating operations require a separate governed contract"
            ],
            [
              "Where does setup evidence come from?",
              "From allowlisted workspace evidence and marker files",
              "Platform Installer services"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "The result is a safer operator experience. A support engineer can ask for a workspace status check, an implementation partner can preview the generated project names and selected accelerator, and an administrator can confirm whether the backend sees expected repositories and runtime markers. None of those actions should change files or execute mutating shell commands."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Runtime flow",
          "anchor": "installerInstalledRuntimeApplicationBuilder-2-runtime-flow"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "sequenceDiagram\n  participant User as Axis user\n  participant Axis as Axis UI\n  participant API as Platform Installer API\n  participant Boundary as Workspace boundary service\n  participant Evidence as Installer evidence files\n  User->>Axis: Open Installer workspace\n  Axis->>API: Request operation catalogue or readiness\n  API->>Boundary: Validate workspace root and vendor boundaries\n  Boundary-->>API: Allowlisted workspace context\n  API->>Evidence: Read bounded setup evidence\n  Evidence-->>API: Redacted status and messages\n  API-->>Axis: Safe read-only response\n  Axis-->>User: Render readiness, next action, and warnings"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Technical perspective",
          "anchor": "installerInstalledRuntimeApplicationBuilder-3-technical-perspective"
        },
        {
          "kind": "paragraph",
          "text": "The installed-runtime backend capability lives under the Platform Installer module. It owns API contracts, operation-state validation, permissions, workspace allowlist behavior, redaction, controller/facade/service boundaries, and BackOffice capability metadata for Axis discovery. The standalone installer owns npm or GitHub bootstrap behavior, local command execution before the framework exists, release tags, setup evidence writing, backups, rollback, and support-bundle creation."
        },
        {
          "kind": "paragraph",
          "text": "Current read-only API routes include installer info, operation catalogue, workspace status, workspace inventory, workspace preflight, setup-plan preview, and evidence read. POST is used for workspace-sensitive read-only checks because the request body can carry bounded workspace identity without placing local paths into query strings. Every route requires explicit permission and returns a structured response envelope with status, operation code, correlation/request identity where available, sanitized messages, and no raw secret values."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Configuration and customization",
          "anchor": "installerInstalledRuntimeApplicationBuilder-4-configuration-and-customization"
        },
        {
          "kind": "paragraph",
          "text": "Project teams may configure allowed workspace roots and selected installer visibility through backend configuration. They must not make `nodics.project.json` the Application Builder authority, create a new `nodics.solution.json` descriptor, or place customer customizations inside vendor-owned framework/frontend repositories. A project-layer extension may add a new workspace check, but it must preserve the same principles: explicit permission, no secret exposure, allowlisted path access, deterministic response shape, and no mutation from a read-only operation."
        },
        {
          "kind": "table",
          "headers": [
            "Extension need",
            "Correct approach",
            "Required validation"
          ],
          "rows": [
            [
              "Add a readiness signal",
              "Add a backend service method and response contract",
              "Permission, no-mutation, redaction, bounded payload"
            ],
            [
              "Add an Axis card",
              "Register BackOffice capability metadata and renderer contract",
              "Axis discovery, role filtering, empty/error states"
            ],
            [
              "Add mutating maintenance",
              "Define a governed mutating-operation contract first",
              "Idempotency, audit, dry-run, rollback, evidence"
            ],
            [
              "Change bootstrap package identity",
              "Treat as release-impacting installer work",
              "Explicit approval, docs update, npm/GitHub checks"
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Access and publication",
          "anchor": "installerInstalledRuntimeApplicationBuilder-5-access-and-publication"
        },
        {
          "kind": "paragraph",
          "text": "Documentation for this capability belongs under Nodics Installer and Workspace Setup, with related links to Application Builder and Workspace Generation, Axis and BackOffice Operations, Operations Monitoring and Recovery, and Security Governance and Compliance. Public pages can describe the model. Operator-only details should be authenticated or permission gated through Axis. When published, the documentation records must include page metadata, navigation nodes, dashboard summaries, search metadata, access policies, and publication state."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "installerInstalledRuntimeApplicationBuilder-6-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Mixing the standalone bootstrap package with installed-runtime APIs. They solve different parts of the journey.",
            "Letting Axis read local files directly. Axis must call backend APIs and render bounded responses only.",
            "Exposing command strings, raw stack traces, home paths, bearer tokens, passwords, API keys, or local credential values in evidence.",
            "Treating read-only readiness checks as permission-free because they do not mutate. Workspace identity and evidence still need authorization.",
            "Adding a mutating operation without idempotency, audit, dry-run preview, workspace allowlist, and rollback rules."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "installerInstalledRuntimeApplicationBuilder-7-verification"
        },
        {
          "kind": "paragraph",
          "text": "Verify the implementation by running the Installer module contract tests, Platform tests, module metadata validation, and structure audit for the installer module. Verify the documentation by running `npm run docs:check` and `npm run validate` in `nodics.docs`, then confirm the declared canonical CMS data includes both legacy CMS page/component/route records and first-class documentation product, navigation, node, dashboard, page metadata, access policy, publication state, and search metadata records."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Installed runtime API reference",
          "anchor": "installer-api-reference"
        },
        {
          "kind": "paragraph",
          "text": "Status: Current read-only implementation Owner: Installer and Application Builder Audience: business users, implementation partners, administrators, operators, developers, and AI tools"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Detailed Summary",
          "anchor": "installer-api-reference-1-detailed-summary"
        },
        {
          "kind": "paragraph",
          "text": "The installed-runtime Application Builder APIs make a local Nodics workspace visible, explainable, and supportable after Nodics is already present on a machine. They do not replace the standalone first-machine installer. A new user still starts with:"
        },
        {
          "kind": "code",
          "language": "bash",
          "text": "npx github:Nodics/nodics.installer"
        },
        {
          "kind": "paragraph",
          "text": "After a workspace exists, the Platform installer capability exposes a governed runtime surface that Axis can discover. Current behavior is intentionally read-only. It can report installer capability information, publish the operation catalog, inspect workspace status and inventory, run readiness checks, preview a setup plan, and read sanitized setup evidence. It cannot start, stop, restart, repair, initialize, accept, update, expand, back up, roll back, clean up, or otherwise mutate a workspace."
        },
        {
          "kind": "paragraph",
          "text": "This distinction is important for enterprise adoption. Business and operations teams need visibility before control. Current read-only behavior gives them safe answers to \"what is installed?\", \"is this workspace healthy?\", \"what would the setup do?\", and \"what evidence can support review?\" without giving runtime APIs permission to execute commands or alter vendor and customer code."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business Perspective",
          "anchor": "installer-api-reference-2-business-perspective"
        },
        {
          "kind": "table",
          "headers": [
            "Area",
            "Documentation requirement"
          ],
          "rows": [
            [
              "Problem solved",
              "Operators and implementation partners need a safe way to inspect a customer workspace from Axis without manually reading local files, exposing secrets, or running command-line operations."
            ],
            [
              "Who uses it",
              "Administrators, support teams, implementation partners, developers, and Axis Application Builder users."
            ],
            [
              "Decisions supported",
              "Whether the workspace looks valid, whether prerequisites are ready, which repositories are customer-owned or vendor-owned, what setup plan would be generated, and what evidence can be shared safely."
            ],
            [
              "Runtime behavior",
              "Current routes are available only for read-only inspection and dry-run planning. BackOffice exposes capability metadata as preview-only so Axis can discover the capability without presenting it as a mature mutating control plane."
            ],
            [
              "Business risk",
              "Mutating operations are withheld until command execution, audit, rollback, idempotency, evidence, support, and vendor-boundary policies are approved and tested."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Capability Flow",
          "anchor": "installer-api-reference-3-capability-flow"
        },
        {
          "kind": "code",
          "language": "text",
          "text": "Business user or support operator\n  -> Axis Application Builder workspace\n  -> BackOffice capability metadata\n  -> Platform installer read-only APIs\n  -> Installer services\n  -> Workspace boundary, operation catalog, preflight, plan, evidence\n  -> Sanitized response back to Axis"
        },
        {
          "kind": "paragraph",
          "text": "The current backend implementation is ready for this flow from the runtime API side. Axis frontend screens are intentionally outside this backend module."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Bootstrap And Runtime Split",
          "anchor": "installer-api-reference-4-bootstrap-and-runtime-split"
        },
        {
          "kind": "code",
          "language": "text",
          "text": "First machine bootstrap\n  nodics.installer repository\n  npx github:Nodics/nodics.installer\n  creates or prepares a local workspace\n\nInstalled runtime capability\n  nodics.platform/modules/installer\n  exposes secured read-only APIs after Nodics is present\n  publishes operation catalog and BackOffice metadata"
        },
        {
          "kind": "paragraph",
          "text": "The standalone bootstrap path is GitHub-facing and beginner-friendly. The installed-runtime capability is an enterprise backend capability that powers Axis workflows."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Current Operations",
          "anchor": "installer-api-reference-5-current-operations"
        },
        {
          "kind": "table",
          "headers": [
            "Operation",
            "Method and route",
            "Permission",
            "State",
            "Business value"
          ],
          "rows": [
            [
              "Installer information",
              "`GET /nodics/installer/v0/info`",
              "`installer.workspace.view`",
              "`AVAILABLE`",
              "Shows bootstrap command, supported standalone installer version, and capability metadata."
            ],
            [
              "Operation catalog",
              "`GET /nodics/installer/v0/operations`",
              "`installer.workspace.view`",
              "`AVAILABLE`",
              "Lets Axis discover supported and unavailable operations without hardcoding installer behavior."
            ],
            [
              "Workspace status",
              "`POST /nodics/installer/v0/workspace/status`",
              "`installer.workspace.view`",
              "`AVAILABLE`",
              "Confirms whether the selected path looks like a Nodics workspace and reports core markers."
            ],
            [
              "Workspace inventory",
              "`POST /nodics/installer/v0/workspace/inventory`",
              "`installer.workspace.view`",
              "`AVAILABLE`",
              "Lists visible workspace repositories and flags protected vendor-owned roots."
            ],
            [
              "Workspace preflight",
              "`POST /nodics/installer/v0/workspace/preflight`",
              "`installer.workspace.view`",
              "`AVAILABLE`",
              "Checks readiness signals such as runtime, workspace markers, dependency hints, and requested ports."
            ],
            [
              "Setup-plan preview",
              "`POST /nodics/installer/v0/setup/plan`",
              "`installer.workspace.plan`",
              "`AVAILABLE`",
              "Validates user choices and returns a dry-run plan without writing files or executing commands."
            ],
            [
              "Evidence read",
              "`POST /nodics/installer/v0/evidence/read`",
              "`installer.workspace.evidence.read`",
              "`AVAILABLE`",
              "Reads allowlisted setup evidence and redacts secrets before returning it."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Operation States",
          "anchor": "installer-api-reference-6-operation-states"
        },
        {
          "kind": "table",
          "headers": [
            "State",
            "Meaning",
            "Current usage"
          ],
          "rows": [
            [
              "`AVAILABLE`",
              "Implemented, secured, tested, and allowed in the current runtime.",
              "Used for read-only routes only."
            ],
            [
              "`PREVIEW`",
              "Visible for planning or early operator review, but not approved as a mature operating surface.",
              "Used by BackOffice metadata and navigation actions."
            ],
            [
              "`DISABLED`",
              "Implemented or known, but disabled by configuration, environment, or missing prerequisite.",
              "Reserved for runtime policy or environment gating."
            ],
            [
              "`HIDDEN`",
              "Not visible to Axis users until the backend contract is ready.",
              "Used before a capability passes its backend contract."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Technical Perspective",
          "anchor": "installer-api-reference-7-technical-perspective"
        },
        {
          "kind": "table",
          "headers": [
            "Technical area",
            "Current authority"
          ],
          "rows": [
            [
              "Owning module",
              "`nodics.platform/modules/installer`"
            ],
            [
              "First-machine bootstrap",
              "`nodics.installer` repository"
            ],
            [
              "API contract",
              "`llm/contracts/installer-api-scope-contract.md`"
            ],
            [
              "Runtime routes",
              "`src/router/routers.js`"
            ],
            [
              "Controller",
              "`src/controller/defaultInstallerApplicationBuilderController.js`"
            ],
            [
              "Facade",
              "`src/facade/defaultInstallerApplicationBuilderFacade.js`"
            ],
            [
              "Operation catalog",
              "`src/service/defaultInstallerOperationCatalogService.js`"
            ],
            [
              "Operation validation",
              "`src/service/defaultInstallerOperationCatalogValidationService.js`"
            ],
            [
              "Workspace boundary",
              "`src/service/defaultInstallerWorkspaceBoundaryService.js`"
            ],
            [
              "Redaction",
              "`src/service/defaultInstallerRedactionService.js`"
            ],
            [
              "Permissions",
              "`src/service/defaultInstallerPermissionService.js`"
            ],
            [
              "BackOffice metadata",
              "`src/service/defaultInstallerBackofficeCapabilityService.js`"
            ],
            [
              "Contract test",
              "`test/installerModuleContract.test.js`"
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Runtime Request Flow",
          "anchor": "installer-api-reference-8-runtime-request-flow"
        },
        {
          "kind": "code",
          "language": "text",
          "text": "HTTP request\n  -> secured installer router\n  -> DefaultInstallerApplicationBuilderController\n  -> DefaultInstallerApplicationBuilderFacade\n  -> permission assertion\n  -> workspace boundary validation when workspaceRoot is supplied\n  -> operation-specific service\n  -> response envelope and redaction"
        },
        {
          "kind": "paragraph",
          "text": "Workspace-sensitive operations use `POST` even when they are read-only because the request body may include a local workspace path, requested ports, selected accelerator, or evidence filename."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Configuration Model",
          "anchor": "installer-api-reference-9-configuration-model"
        },
        {
          "kind": "table",
          "headers": [
            "Configuration key",
            "Default",
            "Purpose",
            "Project override guidance"
          ],
          "rows": [
            [
              "`installer.applicationBuilder.enabled`",
              "`true`",
              "Enables the installed-runtime Application Builder capability.",
              "Disable only when a runtime must hide the entire capability."
            ],
            [
              "`installer.applicationBuilder.apiOperationsEnabled`",
              "`true`",
              "Allows read-only API operation exposure.",
              "Set false for environments that should keep the backend capability dormant."
            ],
            [
              "`installer.applicationBuilder.mutatingOperationsEnabled`",
              "`false`",
              "Blocks mutating installer operations.",
              "Keep false until governed mutation contracts are implemented and approved."
            ],
            [
              "`installer.applicationBuilder.standaloneBootstrapRepository`",
              "`Nodics/nodics.installer`",
              "Declares the public bootstrap repository.",
              "Do not override unless the bootstrap ownership model changes through an approved release decision."
            ],
            [
              "`installer.applicationBuilder.standaloneBootstrapCommand`",
              "`npx github:Nodics/nodics.installer`",
              "Shows the beginner bootstrap command.",
              "Do not change casually; it is part of the public entry contract."
            ],
            [
              "`installer.applicationBuilder.latestVerifiedStandaloneVersion`",
              "`0.7.2`",
              "Reports the verified standalone bootstrap version.",
              "Update after standalone installer release qualification."
            ],
            [
              "`installer.applicationBuilder.protectVendorRepositories`",
              "`nodics.ai`, `nodics.axis`",
              "Prevents customer-workspace APIs from treating vendor roots as mutable project roots.",
              "Add vendor-owned roots if the workspace model expands."
            ],
            [
              "`installer.applicationBuilder.workspace.allowedRoots`",
              "empty list",
              "Optional runtime allowlist for valid workspace roots.",
              "Configure in managed environments to restrict inspection to approved directories."
            ],
            [
              "`installer.applicationBuilder.workspace.allowRequestWorkspaceRoot`",
              "`true`",
              "Allows the caller to pass a workspace root subject to boundary checks.",
              "Set false when the runtime should only inspect configured roots."
            ],
            [
              "`installer.applicationBuilder.workspace.maxEvidenceBytes`",
              "`65536`",
              "Limits evidence payload size.",
              "Tune by environment, keeping support usefulness and data minimization balanced."
            ],
            [
              "`installer.applicationBuilder.workspace.allowedEvidenceFiles`",
              "workspace manifests and setup/preflight logs",
              "Restricts evidence reads to known files.",
              "Add only sanitized, support-safe files through reviewed configuration."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Security And Governance",
          "anchor": "installer-api-reference-10-security-and-governance"
        },
        {
          "kind": "paragraph",
          "text": "Current read-only behavior protects the runtime in several ways:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "only human access tokens are accepted for installer workspace operations;",
            "Current permissions are `installer.workspace.view`, `installer.workspace.plan`, and `installer.workspace.evidence.read`;",
            "mutating permissions such as `installer.workspace.operate`, `installer.workspace.support`, and `installer.workspace.expand` are reserved for governed mutating operations;",
            "read-only services must not use shell execution;",
            "vendor-owned roots such as `nodics.ai` and `nodics.axis` are protected;",
            "evidence reads are allowlisted and redacted;",
            "operation catalog entries derive executability from validated state instead of trusting caller-controlled data."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization And Extension",
          "anchor": "installer-api-reference-11-customization-and-extension"
        },
        {
          "kind": "paragraph",
          "text": "Customer projects can safely customize the installed-runtime behavior through normal Nodics configuration layering. The most common enterprise customizations are:"
        },
        {
          "kind": "table",
          "headers": [
            "Need",
            "Supported customization"
          ],
          "rows": [
            [
              "Restrict which workspace roots can be inspected",
              "Set `installer.applicationBuilder.workspace.allowedRoots`."
            ],
            [
              "Prevent callers from sending arbitrary workspace roots",
              "Set `installer.applicationBuilder.workspace.allowRequestWorkspaceRoot` to `false` and use configured roots only."
            ],
            [
              "Add support-safe evidence files",
              "Extend `installer.applicationBuilder.workspace.allowedEvidenceFiles` after confirming files are redaction-safe."
            ],
            [
              "Increase or reduce evidence size",
              "Adjust `installer.applicationBuilder.workspace.maxEvidenceBytes`."
            ],
            [
              "Protect additional vendor repositories",
              "Extend `installer.applicationBuilder.protectVendorRepositories`."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Do not customize current read-only behavior by adding command execution, writable route handlers, unreviewed evidence files, secret-bearing responses, direct Axis filesystem reads, or mutations under vendor-owned roots. Those changes belong in a separate governed mutation contract."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Governed Mutation Contract",
          "anchor": "installer-api-reference-12-governed-mutation-contract"
        },
        {
          "kind": "paragraph",
          "text": "Before any lifecycle, expansion, maintenance, or support-bundle operation becomes executable, the governed mutation contract must define and test:"
        },
        {
          "kind": "table",
          "headers": [
            "Requirement",
            "Why it matters"
          ],
          "rows": [
            [
              "Command execution allowlist",
              "Prevents arbitrary shell execution from runtime APIs."
            ],
            [
              "Idempotency key and lease model",
              "Avoids duplicate setup, repair, backup, or rollback actions."
            ],
            [
              "Audit event schema",
              "Gives operators proof of who requested what, when, and with which result."
            ],
            [
              "Dry-run before mutation",
              "Lets business users review operational impact before changes occur."
            ],
            [
              "Rollback and recovery rules",
              "Makes failures survivable and supportable."
            ],
            [
              "Vendor-boundary checks",
              "Keeps vendor code separate from customer-owned customization roots."
            ],
            [
              "Sanitized evidence policy",
              "Allows support without leaking credentials or private machine details."
            ],
            [
              "Permission model",
              "Separates view, plan, operate, support, and expansion responsibilities."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Documentation Placement",
          "anchor": "installer-api-reference-13-documentation-placement"
        },
        {
          "kind": "paragraph",
          "text": "This page belongs under the published hierarchy:"
        },
        {
          "kind": "code",
          "language": "text",
          "text": "Nodics Documentation\n  Nodics Installer and Workspace Setup\n    Installed-runtime API visibility\n    Workspace status, inventory, and preflight APIs\n    Setup-plan preview API\n    Evidence read and support hints\n\n  Application Builder and Workspace Generation\n    Installed-runtime setup-plan preview API\n    Operation catalog and feature states\n    Workspace allowlist and vendor-protected roots\n    Redacted evidence and support hints\n    Mutating execution, repair, expansion, and rollback gates"
        },
        {
          "kind": "paragraph",
          "text": "The public first-machine installer journey should continue to link to the standalone `nodics.installer` documentation. The Application Builder journey should link back here when it explains runtime API visibility, dry-run planning, and evidence reads."
        },
        {
          "kind": "paragraph",
          "text": "Use the focused module gate after implementation or contract changes:"
        },
        {
          "kind": "code",
          "language": "bash",
          "text": "npm --prefix nodics.platform/modules/installer test"
        },
        {
          "kind": "paragraph",
          "text": "The contract test verifies the module composition, operation states, route registration, permission boundaries, BackOffice metadata, redaction behavior, workspace boundary protection, and no-mutation guarantees."
        }
      ],
      "searchText": "Installed Runtime Installer and Application Builder APIs Safe read-only runtime API model for installed workspace inspection, setup planning, operation catalogue, and redacted evidence. # Installed Runtime Installer and Application Builder APIs\n\nThe installed-runtime Installer capability explains how a generated Nodics workspace can expose safe, read-only setup and Application Builder information to Axis. This is separate from the standalone `nodics.installer` package, which remains the first-machine bootstrap path before a user has the framework locally. Beginners should use this page to understand the difference between creating a workspace and inspecting a workspace that already exists.\n\n## Business perspective\n\nEnterprise teams need a guided way to understand whether a local or customer workspace is ready before they ask developers or operators to repair it. The installed-runtime capability gives Axis and administrators a backend-owned view of installer information, operation catalogue, workspace status, workspace inventory, preflight readiness, setup-plan preview, and redacted evidence. That reduces confusion because the business user can see readiness and next action guidance without receiving raw machine paths, secrets, stack traces, or unsupported commands.\n\n| Question | Business answer | Technical owner |\n| --- | --- | --- |\n| How do we create the first workspace? | Use the standalone installer bootstrap package | `nodics.installer` repository |\n| How do we inspect an installed workspace from Axis? | Use secured read-only runtime APIs | Platform Installer module |\n| Can Axis start or repair the machine? | Not through this read-only capability | Mutating operations require a separate governed contract |\n| Where does setup evidence come from? | From allowlisted workspace evidence and marker files | Platform Installer services |\n\nThe result is a safer operator experience. A support engineer can ask for a workspace status check, an implementation partner can preview the generated project names and selected accelerator, and an administrator can confirm whether the backend sees expected repositories and runtime markers. None of those actions should change files or execute mutating shell commands.\n\n## Runtime flow\n\n```mermaid\nsequenceDiagram\n  participant User as Axis user\n  participant Axis as Axis UI\n  participant API as Platform Installer API\n  participant Boundary as Workspace boundary service\n  participant Evidence as Installer evidence files\n  User->>Axis: Open Installer workspace\n  Axis->>API: Request operation catalogue or readiness\n  API->>Boundary: Validate workspace root and vendor boundaries\n  Boundary-->>API: Allowlisted workspace context\n  API->>Evidence: Read bounded setup evidence\n  Evidence-->>API: Redacted status and messages\n  API-->>Axis: Safe read-only response\n  Axis-->>User: Render readiness, next action, and warnings\n```\n\n## Technical perspective\n\nThe installed-runtime backend capability lives under the Platform Installer module. It owns API contracts, operation-state validation, permissions, workspace allowlist behavior, redaction, controller/facade/service boundaries, and BackOffice capability metadata for Axis discovery. The standalone installer owns npm or GitHub bootstrap behavior, local command execution before the framework exists, release tags, setup evidence writing, backups, rollback, and support-bundle creation.\n\nCurrent read-only API routes include installer info, operation catalogue, workspace status, workspace inventory, workspace preflight, setup-plan preview, and evidence read. POST is used for workspace-sensitive read-only checks because the request body can carry bounded workspace identity without placing local paths into query strings. Every route requires explicit permission and returns a structured response envelope with status, operation code, correlation/request identity where available, sanitized messages, and no raw secret values.\n\n## Configuration and customization\n\nProject teams may configure allowed workspace roots and selected installer visibility through backend configuration. They must not make `nodics.project.json` the Application Builder authority, create a new `nodics.solution.json` descriptor, or place customer customizations inside vendor-owned framework/frontend repositories. A project-layer extension may add a new workspace check, but it must preserve the same principles: explicit permission, no secret exposure, allowlisted path access, deterministic response shape, and no mutation from a read-only operation.\n\n| Extension need | Correct approach | Required validation |\n| --- | --- | --- |\n| Add a readiness signal | Add a backend service method and response contract | Permission, no-mutation, redaction, bounded payload |\n| Add an Axis card | Register BackOffice capability metadata and renderer contract | Axis discovery, role filtering, empty/error states |\n| Add mutating maintenance | Define a governed mutating-operation contract first | Idempotency, audit, dry-run, rollback, evidence |\n| Change bootstrap package identity | Treat as release-impacting installer work | Explicit approval, docs update, npm/GitHub checks |\n\n## Access and publication\n\nDocumentation for this capability belongs under Nodics Installer and Workspace Setup, with related links to Application Builder and Workspace Generation, Axis and BackOffice Operations, Operations Monitoring and Recovery, and Security Governance and Compliance. Public pages can describe the model. Operator-only details should be authenticated or permission gated through Axis. When published, the documentation records must include page metadata, navigation nodes, dashboard summaries, search metadata, access policies, and publication state.\n\n## Common mistakes\n\n- Mixing the standalone bootstrap package with installed-runtime APIs. They solve different parts of the journey.\n- Letting Axis read local files directly. Axis must call backend APIs and render bounded responses only.\n- Exposing command strings, raw stack traces, home paths, bearer tokens, passwords, API keys, or local credential values in evidence.\n- Treating read-only readiness checks as permission-free because they do not mutate. Workspace identity and evidence still need authorization.\n- Adding a mutating operation without idempotency, audit, dry-run preview, workspace allowlist, and rollback rules.\n\n## Verification\n\nVerify the implementation by running the Installer module contract tests, Platform tests, module metadata validation, and structure audit for the installer module. Verify the documentation by running `npm run docs:check` and `npm run validate` in `nodics.docs`, then confirm the declared canonical CMS data includes both legacy CMS page/component/route records and first-class documentation product, navigation, node, dashboard, page metadata, access policy, publication state, and search metadata records.\n\n## Installed runtime API reference\n\nStatus: Current read-only implementation Owner: Installer and Application Builder Audience: business users, implementation partners, administrators, operators, developers, and AI tools\n\n## Detailed Summary\n\nThe installed-runtime Application Builder APIs make a local Nodics workspace visible, explainable, and supportable after Nodics is already present on a machine. They do not replace the standalone first-machine installer. A new user still starts with:\n\n```bash\nnpx github:Nodics/nodics.installer\n```\n\nAfter a workspace exists, the Platform installer capability exposes a governed runtime surface that Axis can discover. Current behavior is intentionally read-only. It can report installer capability information, publish the operation catalog, inspect workspace status and inventory, run readiness checks, preview a setup plan, and read sanitized setup evidence. It cannot start, stop, restart, repair, initialize, accept, update, expand, back up, roll back, clean up, or otherwise mutate a workspace.\n\nThis distinction is important for enterprise adoption. Business and operations teams need visibility before control. Current read-only behavior gives them safe answers to \"what is installed?\", \"is this workspace healthy?\", \"what would the setup do?\", and \"what evidence can support review?\" without giving runtime APIs permission to execute commands or alter vendor and customer code.\n\n## Business Perspective\n\n| Area | Documentation requirement |\n| --- | --- |\n| Problem solved | Operators and implementation partners need a safe way to inspect a customer workspace from Axis without manually reading local files, exposing secrets, or running command-line operations. |\n| Who uses it | Administrators, support teams, implementation partners, developers, and Axis Application Builder users. |\n| Decisions supported | Whether the workspace looks valid, whether prerequisites are ready, which repositories are customer-owned or vendor-owned, what setup plan would be generated, and what evidence can be shared safely. |\n| Runtime behavior | Current routes are available only for read-only inspection and dry-run planning. BackOffice exposes capability metadata as preview-only so Axis can discover the capability without presenting it as a mature mutating control plane. |\n| Business risk | Mutating operations are withheld until command execution, audit, rollback, idempotency, evidence, support, and vendor-boundary policies are approved and tested. |\n\n## Capability Flow\n\n```text\nBusiness user or support operator\n  -> Axis Application Builder workspace\n  -> BackOffice capability metadata\n  -> Platform installer read-only APIs\n  -> Installer services\n  -> Workspace boundary, operation catalog, preflight, plan, evidence\n  -> Sanitized response back to Axis\n```\n\nThe current backend implementation is ready for this flow from the runtime API side. Axis frontend screens are intentionally outside this backend module.\n\n## Bootstrap And Runtime Split\n\n```text\nFirst machine bootstrap\n  nodics.installer repository\n  npx github:Nodics/nodics.installer\n  creates or prepares a local workspace\n\nInstalled runtime capability\n  nodics.platform/modules/installer\n  exposes secured read-only APIs after Nodics is present\n  publishes operation catalog and BackOffice metadata\n```\n\nThe standalone bootstrap path is GitHub-facing and beginner-friendly. The installed-runtime capability is an enterprise backend capability that powers Axis workflows.\n\n## Current Operations\n\n| Operation | Method and route | Permission | State | Business value |\n| --- | --- | --- | --- | --- |\n| Installer information | `GET /nodics/installer/v0/info` | `installer.workspace.view` | `AVAILABLE` | Shows bootstrap command, supported standalone installer version, and capability metadata. |\n| Operation catalog | `GET /nodics/installer/v0/operations` | `installer.workspace.view` | `AVAILABLE` | Lets Axis discover supported and unavailable operations without hardcoding installer behavior. |\n| Workspace status | `POST /nodics/installer/v0/workspace/status` | `installer.workspace.view` | `AVAILABLE` | Confirms whether the selected path looks like a Nodics workspace and reports core markers. |\n| Workspace inventory | `POST /nodics/installer/v0/workspace/inventory` | `installer.workspace.view` | `AVAILABLE` | Lists visible workspace repositories and flags protected vendor-owned roots. |\n| Workspace preflight | `POST /nodics/installer/v0/workspace/preflight` | `installer.workspace.view` | `AVAILABLE` | Checks readiness signals such as runtime, workspace markers, dependency hints, and requested ports. |\n| Setup-plan preview | `POST /nodics/installer/v0/setup/plan` | `installer.workspace.plan` | `AVAILABLE` | Validates user choices and returns a dry-run plan without writing files or executing commands. |\n| Evidence read | `POST /nodics/installer/v0/evidence/read` | `installer.workspace.evidence.read` | `AVAILABLE` | Reads allowlisted setup evidence and redacts secrets before returning it. |\n\n## Operation States\n\n| State | Meaning | Current usage |\n| --- | --- | --- |\n| `AVAILABLE` | Implemented, secured, tested, and allowed in the current runtime. | Used for read-only routes only. |\n| `PREVIEW` | Visible for planning or early operator review, but not approved as a mature operating surface. | Used by BackOffice metadata and navigation actions. |\n| `DISABLED` | Implemented or known, but disabled by configuration, environment, or missing prerequisite. | Reserved for runtime policy or environment gating. |\n| `HIDDEN` | Not visible to Axis users until the backend contract is ready. | Used before a capability passes its backend contract. |\n\n## Technical Perspective\n\n| Technical area | Current authority |\n| --- | --- |\n| Owning module | `nodics.platform/modules/installer` |\n| First-machine bootstrap | `nodics.installer` repository |\n| API contract | `llm/contracts/installer-api-scope-contract.md` |\n| Runtime routes | `src/router/routers.js` |\n| Controller | `src/controller/defaultInstallerApplicationBuilderController.js` |\n| Facade | `src/facade/defaultInstallerApplicationBuilderFacade.js` |\n| Operation catalog | `src/service/defaultInstallerOperationCatalogService.js` |\n| Operation validation | `src/service/defaultInstallerOperationCatalogValidationService.js` |\n| Workspace boundary | `src/service/defaultInstallerWorkspaceBoundaryService.js` |\n| Redaction | `src/service/defaultInstallerRedactionService.js` |\n| Permissions | `src/service/defaultInstallerPermissionService.js` |\n| BackOffice metadata | `src/service/defaultInstallerBackofficeCapabilityService.js` |\n| Contract test | `test/installerModuleContract.test.js` |\n\n## Runtime Request Flow\n\n```text\nHTTP request\n  -> secured installer router\n  -> DefaultInstallerApplicationBuilderController\n  -> DefaultInstallerApplicationBuilderFacade\n  -> permission assertion\n  -> workspace boundary validation when workspaceRoot is supplied\n  -> operation-specific service\n  -> response envelope and redaction\n```\n\nWorkspace-sensitive operations use `POST` even when they are read-only because the request body may include a local workspace path, requested ports, selected accelerator, or evidence filename.\n\n## Configuration Model\n\n| Configuration key | Default | Purpose | Project override guidance |\n| --- | --- | --- | --- |\n| `installer.applicationBuilder.enabled` | `true` | Enables the installed-runtime Application Builder capability. | Disable only when a runtime must hide the entire capability. |\n| `installer.applicationBuilder.apiOperationsEnabled` | `true` | Allows read-only API operation exposure. | Set false for environments that should keep the backend capability dormant. |\n| `installer.applicationBuilder.mutatingOperationsEnabled` | `false` | Blocks mutating installer operations. | Keep false until governed mutation contracts are implemented and approved. |\n| `installer.applicationBuilder.standaloneBootstrapRepository` | `Nodics/nodics.installer` | Declares the public bootstrap repository. | Do not override unless the bootstrap ownership model changes through an approved release decision. |\n| `installer.applicationBuilder.standaloneBootstrapCommand` | `npx github:Nodics/nodics.installer` | Shows the beginner bootstrap command. | Do not change casually; it is part of the public entry contract. |\n| `installer.applicationBuilder.latestVerifiedStandaloneVersion` | `0.7.2` | Reports the verified standalone bootstrap version. | Update after standalone installer release qualification. |\n| `installer.applicationBuilder.protectVendorRepositories` | `nodics.ai`, `nodics.axis` | Prevents customer-workspace APIs from treating vendor roots as mutable project roots. | Add vendor-owned roots if the workspace model expands. |\n| `installer.applicationBuilder.workspace.allowedRoots` | empty list | Optional runtime allowlist for valid workspace roots. | Configure in managed environments to restrict inspection to approved directories. |\n| `installer.applicationBuilder.workspace.allowRequestWorkspaceRoot` | `true` | Allows the caller to pass a workspace root subject to boundary checks. | Set false when the runtime should only inspect configured roots. |\n| `installer.applicationBuilder.workspace.maxEvidenceBytes` | `65536` | Limits evidence payload size. | Tune by environment, keeping support usefulness and data minimization balanced. |\n| `installer.applicationBuilder.workspace.allowedEvidenceFiles` | workspace manifests and setup/preflight logs | Restricts evidence reads to known files. | Add only sanitized, support-safe files through reviewed configuration. |\n\n## Security And Governance\n\nCurrent read-only behavior protects the runtime in several ways:\n\n- only human access tokens are accepted for installer workspace operations;\n- Current permissions are `installer.workspace.view`, `installer.workspace.plan`, and `installer.workspace.evidence.read`;\n- mutating permissions such as `installer.workspace.operate`, `installer.workspace.support`, and `installer.workspace.expand` are reserved for governed mutating operations;\n- read-only services must not use shell execution;\n- vendor-owned roots such as `nodics.ai` and `nodics.axis` are protected;\n- evidence reads are allowlisted and redacted;\n- operation catalog entries derive executability from validated state instead of trusting caller-controlled data.\n\n## Customization And Extension\n\nCustomer projects can safely customize the installed-runtime behavior through normal Nodics configuration layering. The most common enterprise customizations are:\n\n| Need | Supported customization |\n| --- | --- |\n| Restrict which workspace roots can be inspected | Set `installer.applicationBuilder.workspace.allowedRoots`. |\n| Prevent callers from sending arbitrary workspace roots | Set `installer.applicationBuilder.workspace.allowRequestWorkspaceRoot` to `false` and use configured roots only. |\n| Add support-safe evidence files | Extend `installer.applicationBuilder.workspace.allowedEvidenceFiles` after confirming files are redaction-safe. |\n| Increase or reduce evidence size | Adjust `installer.applicationBuilder.workspace.maxEvidenceBytes`. |\n| Protect additional vendor repositories | Extend `installer.applicationBuilder.protectVendorRepositories`. |\n\nDo not customize current read-only behavior by adding command execution, writable route handlers, unreviewed evidence files, secret-bearing responses, direct Axis filesystem reads, or mutations under vendor-owned roots. Those changes belong in a separate governed mutation contract.\n\n## Governed Mutation Contract\n\nBefore any lifecycle, expansion, maintenance, or support-bundle operation becomes executable, the governed mutation contract must define and test:\n\n| Requirement | Why it matters |\n| --- | --- |\n| Command execution allowlist | Prevents arbitrary shell execution from runtime APIs. |\n| Idempotency key and lease model | Avoids duplicate setup, repair, backup, or rollback actions. |\n| Audit event schema | Gives operators proof of who requested what, when, and with which result. |\n| Dry-run before mutation | Lets business users review operational impact before changes occur. |\n| Rollback and recovery rules | Makes failures survivable and supportable. |\n| Vendor-boundary checks | Keeps vendor code separate from customer-owned customization roots. |\n| Sanitized evidence policy | Allows support without leaking credentials or private machine details. |\n| Permission model | Separates view, plan, operate, support, and expansion responsibilities. |\n\n## Documentation Placement\n\nThis page belongs under the published hierarchy:\n\n```text\nNodics Documentation\n  Nodics Installer and Workspace Setup\n    Installed-runtime API visibility\n    Workspace status, inventory, and preflight APIs\n    Setup-plan preview API\n    Evidence read and support hints\n\n  Application Builder and Workspace Generation\n    Installed-runtime setup-plan preview API\n    Operation catalog and feature states\n    Workspace allowlist and vendor-protected roots\n    Redacted evidence and support hints\n    Mutating execution, repair, expansion, and rollback gates\n```\n\nThe public first-machine installer journey should continue to link to the standalone `nodics.installer` documentation. The Application Builder journey should link back here when it explains runtime API visibility, dry-run planning, and evidence reads.\n\nUse the focused module gate after implementation or contract changes:\n\n```bash\nnpm --prefix nodics.platform/modules/installer test\n```\n\nThe contract test verifies the module composition, operation states, route registration, permission boundaries, BackOffice metadata, redaction behavior, workspace boundary protection, and no-mutation guarantees.\n",
      "previous": {
        "title": "Local Runtime Troubleshooting",
        "route": "/docs/framework/framework-local-runtime-troubleshooting"
      },
      "next": {
        "title": "Application Builder and Workspace Generation",
        "route": "/docs/framework/builder-workspace-generation"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.platform",
        "technicalModule": "installer",
        "owner": "installer",
        "sourcePath": "data/docs-v001/records/documentation/installerDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/installerDocumentationComponentData.js",
        "wordCount": 2320,
        "checksum": "476824713e77b4dd6df9b983fa76e14279e71884d7283d4e8c711b9dc868baf9"
      },
      "slug": "installer-installed-runtime-application-builder",
      "locale": "en",
      "navigationGroup": "Installed Runtime APIs",
      "navigationGroupCode": "installed-runtime-apis",
      "navigationGroupOrder": 20,
      "navigationOrder": 10,
      "references": [
        {
          "documentId": "framework.local-quick-start",
          "owner": "nTooling"
        },
        {
          "documentId": "framework.local-verification-checklist",
          "owner": "nTooling"
        },
        {
          "documentId": "platform.module-registry",
          "owner": "backoffice"
        },
        {
          "documentId": "docs.overview",
          "owner": "nodics.docs"
        }
      ]
    },
    "active": true
  },
  "record1": {
    "code": "nodicsDocsComponentbuilderWorkspaceGeneration",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "builder.workspace-generation",
      "title": "Application Builder and Workspace Generation",
      "route": "/docs/framework/builder-workspace-generation",
      "section": "application-builder-and-workspace-generation",
      "sectionTitle": "Application Builder and Workspace Generation",
      "group": "application-builder-and-workspace-generation",
      "groupTitle": "Application Builder and Workspace Generation",
      "parentId": "application-builder-and-workspace-generation",
      "hierarchyPath": [
        "Application Builder and Workspace Generation",
        "Application Builder and Workspace Generation"
      ],
      "hierarchyDepth": 2,
      "documentType": "how-to",
      "audience": [
        "business",
        "architect",
        "administrator",
        "developer",
        "operator",
        "qa",
        "ai-tool"
      ],
      "businessAudience": [
        "business user",
        "administrator",
        "implementation partner"
      ],
      "technicalAudience": [
        "architect",
        "developer",
        "operator",
        "qa engineer",
        "ai tool"
      ],
      "summary": "How the installed runtime exposes governed workspace discovery, readiness, setup planning, and accelerator selection for Axis-driven application building.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.5",
      "maturityState": "current-read-only",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "installer.installed-runtime-application-builder",
        "framework.local-quick-start",
        "accelerators.agora-industry-templates"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "package.json",
        "src/schemas",
        "src/service"
      ],
      "visualRequirements": [
        "diagram",
        "configuration-table",
        "code-example",
        "troubleshooting-matrix"
      ],
      "searchKeywords": [
        "application-builder-and-workspace-generation",
        "workspace-generation-journey",
        "application-builder-and-workspace-generation"
      ],
      "topicKeywords": [
        "Application Builder and Workspace Generation",
        "Workspace Generation Journey",
        "Application Builder and Workspace Generation"
      ],
      "headings": [
        {
          "text": "Business context",
          "anchor": "builderWorkspaceGeneration-1-business-context",
          "level": 2
        },
        {
          "text": "Journey and ownership",
          "anchor": "builderWorkspaceGeneration-2-journey-and-ownership",
          "level": 2
        },
        {
          "text": "Data and configuration detail",
          "anchor": "builderWorkspaceGeneration-3-data-and-configuration-detail",
          "level": 2
        },
        {
          "text": "Customization and extension",
          "anchor": "builderWorkspaceGeneration-4-customization-and-extension",
          "level": 2
        },
        {
          "text": "Operations and governance",
          "anchor": "builderWorkspaceGeneration-5-operations-and-governance",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "builderWorkspaceGeneration-6-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "builderWorkspaceGeneration-7-verification",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "How the installed runtime exposes governed workspace discovery, readiness, setup planning, and accelerator selection for Axis-driven application building. This page is intentionally written for beginners, business users, developers, operators, architects, QA owners, and AI tools. It explains the business problem first, then the technical ownership model, then the exact customization and verification responsibilities so nobody has to guess where a change belongs."
        },
        {
          "kind": "paragraph",
          "text": "A customer workspace can contain several framework, storefront, Axis, Nexus, and accelerator repositories. Without a guided model, beginners miss prerequisites and operators cannot prove what will be changed. The installer runtime exposes read-only discovery, inventory, preflight, setup-plan preview, and redacted evidence APIs. Mutating workspace operations remain reserved behind stronger contracts, permissions, idempotency, and audit."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business context",
          "anchor": "builderWorkspaceGeneration-1-business-context"
        },
        {
          "kind": "paragraph",
          "text": "For a business user, this topic answers what decision can be made, which operational journey is supported, and what risk is reduced. The practical value is faster delivery without losing governance: teams can understand the current capability, decide whether it applies to their project, and know when Axis, Nexus, content catalog, workflow, or runtime services are involved."
        },
        {
          "kind": "paragraph",
          "text": "For beginners, the mental model is simple: the page title is the business capability, the table identifies who owns each part, and the diagram shows how a request or change flows. A reader should not need source-code knowledge to understand the journey, but the developer path is still available when customization is needed."
        },
        {
          "kind": "table",
          "headers": [
            "Business question",
            "Answer for this topic"
          ],
          "rows": [
            [
              "What problem does it solve?",
              "A customer workspace can contain several framework, storefront, Axis, Nexus, and accelerator repositories. Without a guided model, beginners miss prerequisites and operators cannot prove what will be changed."
            ],
            [
              "Who uses it?",
              "Business users, administrators, developers, operators, QA owners, implementation partners, and AI-assisted delivery tools."
            ],
            [
              "What changes can it support?",
              "The installer runtime exposes read-only discovery, inventory, preflight, setup-plan preview, and redacted evidence APIs. Mutating workspace operations remain reserved behind stronger contracts, permissions, idempotency, and audit."
            ],
            [
              "What must be governed?",
              "Permissions, validation, source ownership, publication state, runtime impact, audit evidence, and rollback boundaries."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Journey and ownership",
          "anchor": "builderWorkspaceGeneration-2-journey-and-ownership"
        },
        {
          "kind": "paragraph",
          "text": "The installed runtime installer module owns secured API metadata. The standalone nodics.installer package remains the first-machine bootstrap path before Nodics exists locally. This keeps the reader-facing name friendly while preserving exact source ownership for developers and AI tools. Axis may render management screens or authenticated documentation, Nexus may render public Online content, and the backend content catalog remains authoritative for navigation, pages, access policies, and publication state."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Reader[\"Business or developer request\"] --> Axis[\"Axis or Nexus view\"]\n  Axis --> Backend[\"Owning backend capability\"]\n  Backend --> Catalog[\"Content/catalog/schema/config records\"]\n  Catalog --> Runtime[\"Runtime behavior or published page\"]\n  Runtime --> Evidence[\"Audit, validation, and support evidence\"]"
        },
        {
          "kind": "table",
          "headers": [
            "Responsibility",
            "Owner",
            "Notes"
          ],
          "rows": [
            [
              "Business capability name",
              "Application Builder and Workspace Generation",
              "Used in navigation and dashboards so readers are not exposed to raw module names first."
            ],
            [
              "Source owner",
              "nodics.platform",
              "Carries exact implementation, documentation, and validation evidence."
            ],
            [
              "Technical module",
              "installer",
              "Holds the relevant schema, service, router, data, or contract detail where applicable."
            ],
            [
              "Axis experience",
              "Backend-declared workspace",
              "Axis renders metadata and actions but does not become the authority."
            ],
            [
              "Public experience",
              "Online content delivery",
              "Nexus renders only records approved for public access."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Data and configuration detail",
          "anchor": "builderWorkspaceGeneration-3-data-and-configuration-detail"
        },
        {
          "kind": "paragraph",
          "text": "Every topic must explain the data that changes behavior. Some topics are schema-driven, some are configuration-driven, some are publishable content, and some are operational records. The documentation must say which category applies before showing code. That keeps production operators and developers aligned on whether a change needs publication, restart, event propagation, approval, or only a project-layer override."
        },
        {
          "kind": "table",
          "headers": [
            "Detail area",
            "What to document",
            "Verification signal"
          ],
          "rows": [
            [
              "Model or record",
              "Type code, catalog, tenant, enterprise, state, owner, and lifecycle.",
              "Schema contract or generated model test."
            ],
            [
              "Configuration key",
              "Default value, override location, environment scope, and runtime impact.",
              "Config validation and runtime refresh evidence."
            ],
            [
              "API or event",
              "Route/event name, payload boundary, permission, idempotency, and failure mode.",
              "Route, service, event, and authorization tests."
            ],
            [
              "Publication and access",
              "Staged/Online state, access mode, roles, groups, and permissions.",
              "Content-pack validation and access-policy test."
            ]
          ]
        },
        {
          "kind": "code",
          "language": "js",
          "text": "POST /nodics/installer/v0/setup/plan\n{ \"workspaceRoot\": \"/work/acme\", \"accelerator\": \"apparel\", \"applicationName\": \"acme-commerce\" }"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and extension",
          "anchor": "builderWorkspaceGeneration-4-customization-and-extension"
        },
        {
          "kind": "paragraph",
          "text": "Developers should customize from the project layer first. A customer project may add properties, services, validators, pipelines, renderers, data packs, or provider configuration when the extension respects the owning capability. Business users may update governed records in Axis when the record is designed for administration. Framework source changes are reserved for improving the reusable product capability itself."
        },
        {
          "kind": "table",
          "headers": [
            "Customization type",
            "Recommended path",
            "Avoid"
          ],
          "rows": [
            [
              "Business label, navigation, or content area",
              "Axis-managed content catalog item with publication workflow.",
              "Hardcoding labels or page trees in the frontend."
            ],
            [
              "Runtime setting",
              "Module configuration with validation and governed runtime propagation.",
              "Editing node-local files on each server by hand."
            ],
            [
              "Domain behavior",
              "Extension service, validator, pipeline step, or provider adapter.",
              "Forking the standard module for customer-only logic."
            ],
            [
              "Public visibility",
              "Access policy with public/authenticated/role-based state.",
              "Exposing internal or draft pages through Nexus."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Operations and governance",
          "anchor": "builderWorkspaceGeneration-5-operations-and-governance"
        },
        {
          "kind": "paragraph",
          "text": "Operators need production-safe evidence, not only implementation notes. Each page must call out logging, tracing, permission checks, event propagation, data import/export, publication status, rollback behavior, and troubleshooting. If a capability affects multiple nodes, the documentation must explain how changes reach every node and how a partial failure is detected."
        },
        {
          "kind": "table",
          "headers": [
            "Operational concern",
            "Required documentation detail"
          ],
          "rows": [
            [
              "Security",
              "Authentication mode, permission code, role/group, tenant and enterprise isolation."
            ],
            [
              "Audit",
              "Actor, timestamp, source record, checksum, approval, route/event, and result."
            ],
            [
              "Resilience",
              "Retry, idempotency, compensation, fallback, cache invalidation, and rollback."
            ],
            [
              "Observability",
              "Logs, metrics, dashboard cards, health checks, and support evidence."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "builderWorkspaceGeneration-6-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Treating a friendly navigation label as the technical source owner.",
            "Writing only developer details and skipping the business decision that the page supports.",
            "Updating Axis or Nexus code when the content catalog, schema, or backend capability should own the change.",
            "Forgetting access rules for public, authenticated, role-based, group-based, or permission-based pages.",
            "Skipping diagrams, comparison tables, source maps, or troubleshooting matrices because the topic feels obvious.",
            "Changing runtime behavior without explaining production impact, cluster propagation, and rollback.",
            "Leaving CMS documentation without source evidence, validation commands, and maturity state."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "builderWorkspaceGeneration-7-verification"
        },
        {
          "kind": "paragraph",
          "text": "Verification starts with the document itself: it must include business context, technical ownership, a visual flow, data or configuration tables, customization guidance, common mistakes, and validation evidence. Developers and AI tools maintain the page directly as backend-owned CMS data and validate its declared checksums, lifecycle, navigation, access policy, publication state, and search metadata. No separate Markdown authoring source or prose generator is required."
        },
        {
          "kind": "paragraph",
          "text": "For implementation verification, run the owning module tests and any Axis or Nexus renderer tests that consume the page. Operators should confirm that production-like runtime behavior matches the documentation: permissions reject unauthorized access, Online pages do not expose Staged data, runtime changes propagate through governed events, and troubleshooting evidence is available without exposing secrets."
        }
      ],
      "searchText": "Application Builder and Workspace Generation How the installed runtime exposes governed workspace discovery, readiness, setup planning, and accelerator selection for Axis-driven application building. # Application Builder and Workspace Generation\n\nHow the installed runtime exposes governed workspace discovery, readiness, setup planning, and accelerator selection for Axis-driven application building. This page is intentionally written for beginners, business users, developers, operators, architects, QA owners, and AI tools. It explains the business problem first, then the technical ownership model, then the exact customization and verification responsibilities so nobody has to guess where a change belongs.\n\nA customer workspace can contain several framework, storefront, Axis, Nexus, and accelerator repositories. Without a guided model, beginners miss prerequisites and operators cannot prove what will be changed. The installer runtime exposes read-only discovery, inventory, preflight, setup-plan preview, and redacted evidence APIs. Mutating workspace operations remain reserved behind stronger contracts, permissions, idempotency, and audit.\n\n## Business context\n\nFor a business user, this topic answers what decision can be made, which operational journey is supported, and what risk is reduced. The practical value is faster delivery without losing governance: teams can understand the current capability, decide whether it applies to their project, and know when Axis, Nexus, content catalog, workflow, or runtime services are involved.\n\nFor beginners, the mental model is simple: the page title is the business capability, the table identifies who owns each part, and the diagram shows how a request or change flows. A reader should not need source-code knowledge to understand the journey, but the developer path is still available when customization is needed.\n\n| Business question | Answer for this topic |\n| --- | --- |\n| What problem does it solve? | A customer workspace can contain several framework, storefront, Axis, Nexus, and accelerator repositories. Without a guided model, beginners miss prerequisites and operators cannot prove what will be changed. |\n| Who uses it? | Business users, administrators, developers, operators, QA owners, implementation partners, and AI-assisted delivery tools. |\n| What changes can it support? | The installer runtime exposes read-only discovery, inventory, preflight, setup-plan preview, and redacted evidence APIs. Mutating workspace operations remain reserved behind stronger contracts, permissions, idempotency, and audit. |\n| What must be governed? | Permissions, validation, source ownership, publication state, runtime impact, audit evidence, and rollback boundaries. |\n\n## Journey and ownership\n\nThe installed runtime installer module owns secured API metadata. The standalone nodics.installer package remains the first-machine bootstrap path before Nodics exists locally. This keeps the reader-facing name friendly while preserving exact source ownership for developers and AI tools. Axis may render management screens or authenticated documentation, Nexus may render public Online content, and the backend content catalog remains authoritative for navigation, pages, access policies, and publication state.\n\n```mermaid\nflowchart LR\n  Reader[\"Business or developer request\"] --> Axis[\"Axis or Nexus view\"]\n  Axis --> Backend[\"Owning backend capability\"]\n  Backend --> Catalog[\"Content/catalog/schema/config records\"]\n  Catalog --> Runtime[\"Runtime behavior or published page\"]\n  Runtime --> Evidence[\"Audit, validation, and support evidence\"]\n```\n\n| Responsibility | Owner | Notes |\n| --- | --- | --- |\n| Business capability name | Application Builder and Workspace Generation | Used in navigation and dashboards so readers are not exposed to raw module names first. |\n| Source owner | nodics.platform | Carries exact implementation, documentation, and validation evidence. |\n| Technical module | installer | Holds the relevant schema, service, router, data, or contract detail where applicable. |\n| Axis experience | Backend-declared workspace | Axis renders metadata and actions but does not become the authority. |\n| Public experience | Online content delivery | Nexus renders only records approved for public access. |\n\n## Data and configuration detail\n\nEvery topic must explain the data that changes behavior. Some topics are schema-driven, some are configuration-driven, some are publishable content, and some are operational records. The documentation must say which category applies before showing code. That keeps production operators and developers aligned on whether a change needs publication, restart, event propagation, approval, or only a project-layer override.\n\n| Detail area | What to document | Verification signal |\n| --- | --- | --- |\n| Model or record | Type code, catalog, tenant, enterprise, state, owner, and lifecycle. | Schema contract or generated model test. |\n| Configuration key | Default value, override location, environment scope, and runtime impact. | Config validation and runtime refresh evidence. |\n| API or event | Route/event name, payload boundary, permission, idempotency, and failure mode. | Route, service, event, and authorization tests. |\n| Publication and access | Staged/Online state, access mode, roles, groups, and permissions. | Content-pack validation and access-policy test. |\n\n```js\nPOST /nodics/installer/v0/setup/plan\n{ \"workspaceRoot\": \"/work/acme\", \"accelerator\": \"apparel\", \"applicationName\": \"acme-commerce\" }\n```\n\n## Customization and extension\n\nDevelopers should customize from the project layer first. A customer project may add properties, services, validators, pipelines, renderers, data packs, or provider configuration when the extension respects the owning capability. Business users may update governed records in Axis when the record is designed for administration. Framework source changes are reserved for improving the reusable product capability itself.\n\n| Customization type | Recommended path | Avoid |\n| --- | --- | --- |\n| Business label, navigation, or content area | Axis-managed content catalog item with publication workflow. | Hardcoding labels or page trees in the frontend. |\n| Runtime setting | Module configuration with validation and governed runtime propagation. | Editing node-local files on each server by hand. |\n| Domain behavior | Extension service, validator, pipeline step, or provider adapter. | Forking the standard module for customer-only logic. |\n| Public visibility | Access policy with public/authenticated/role-based state. | Exposing internal or draft pages through Nexus. |\n\n## Operations and governance\n\nOperators need production-safe evidence, not only implementation notes. Each page must call out logging, tracing, permission checks, event propagation, data import/export, publication status, rollback behavior, and troubleshooting. If a capability affects multiple nodes, the documentation must explain how changes reach every node and how a partial failure is detected.\n\n| Operational concern | Required documentation detail |\n| --- | --- |\n| Security | Authentication mode, permission code, role/group, tenant and enterprise isolation. |\n| Audit | Actor, timestamp, source record, checksum, approval, route/event, and result. |\n| Resilience | Retry, idempotency, compensation, fallback, cache invalidation, and rollback. |\n| Observability | Logs, metrics, dashboard cards, health checks, and support evidence. |\n\n## Common mistakes\n\n- Treating a friendly navigation label as the technical source owner.\n- Writing only developer details and skipping the business decision that the page supports.\n- Updating Axis or Nexus code when the content catalog, schema, or backend capability should own the change.\n- Forgetting access rules for public, authenticated, role-based, group-based, or permission-based pages.\n- Skipping diagrams, comparison tables, source maps, or troubleshooting matrices because the topic feels obvious.\n- Changing runtime behavior without explaining production impact, cluster propagation, and rollback.\n- Leaving CMS documentation without source evidence, validation commands, and maturity state.\n\n## Verification\n\nVerification starts with the document itself: it must include business context, technical ownership, a visual flow, data or configuration tables, customization guidance, common mistakes, and validation evidence. Developers and AI tools maintain the page directly as backend-owned CMS data and validate its declared checksums, lifecycle, navigation, access policy, publication state, and search metadata. No separate Markdown authoring source or prose generator is required.\n\nFor implementation verification, run the owning module tests and any Axis or Nexus renderer tests that consume the page. Operators should confirm that production-like runtime behavior matches the documentation: permissions reject unauthorized access, Online pages do not expose Staged data, runtime changes propagate through governed events, and troubleshooting evidence is available without exposing secrets.\n",
      "previous": {
        "title": "Installed Runtime Installer and Application Builder APIs",
        "route": "/docs/framework/installer-installed-runtime-application-builder"
      },
      "next": {
        "title": "Visual Workflow Designer Contract",
        "route": "/docs/framework/process/visual-designer"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.platform",
        "technicalModule": "installer",
        "owner": "installer",
        "sourcePath": "data/docs-v001/records/documentation/installerDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/installerDocumentationComponentData.js",
        "wordCount": 1120,
        "checksum": "9ef903cbb58760f270b2a3ff791552cf76a276558188c87045403bbf1949d1b4"
      },
      "slug": "builder-workspace-generation",
      "locale": "en",
      "navigationGroup": "Workspace Generation Journey",
      "navigationGroupCode": "workspace-generation-journey",
      "navigationGroupOrder": 10,
      "navigationOrder": 10,
      "references": [
        {
          "documentId": "installer.installed-runtime-application-builder",
          "owner": "installer"
        },
        {
          "documentId": "framework.local-quick-start",
          "owner": "nTooling"
        },
        {
          "documentId": "accelerators.agora-industry-templates",
          "owner": "nodics.docs"
        }
      ]
    },
    "active": true
  }
};
