/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description BackOffice documentation 0.0.2 successor; prior released payloads remain immutable. */
module.exports = {
  "record0": {
    "code": "nodicsDocsComponentplatformModuleRegistry",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "platform.module-registry",
      "title": "Functional module registry",
      "route": "/docs/framework/platform-module-registry",
      "section": "capability-registry-and-lifecycle-management",
      "sectionTitle": "Capability Registry and Lifecycle Management",
      "group": "capability-registry-and-lifecycle-management",
      "groupTitle": "Capability Registry and Lifecycle Management",
      "parentId": "capability-registry-and-lifecycle-management",
      "hierarchyPath": [
        "Capability Registry and Lifecycle Management",
        "Functional module registry"
      ],
      "hierarchyDepth": 2,
      "documentType": "contract",
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
      "summary": "Durable project registration and runtime observation rules.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "STAGED",
      "version": "0.16.20",
      "maturityState": "operational",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "platform.overview",
        "foundation.overview",
        "framework.local-quick-start"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "package.json",
        "src/schemas",
        "src/service"
      ],
      "visualRequirements": [
        "architecture-diagram",
        "source-map-table",
        "code-example"
      ],
      "searchKeywords": [
        "capability-registry-and-lifecycle-management",
        "functional-module-registry",
        "functional-module-registry"
      ],
      "topicKeywords": [
        "Capability Registry and Lifecycle Management",
        "Functional Module Registry",
        "Functional module registry"
      ],
      "headings": [
        {
          "text": "Why the registry exists",
          "anchor": "platformModuleRegistry-1-why-the-registry-exists",
          "level": 2
        },
        {
          "text": "Lifecycle states",
          "anchor": "platformModuleRegistry-2-lifecycle-states",
          "level": 2
        },
        {
          "text": "Mandatory versus optional modules",
          "anchor": "platformModuleRegistry-3-mandatory-versus-optional-modules",
          "level": 2
        },
        {
          "text": "Business value",
          "anchor": "platformModuleRegistry-4-business-value",
          "level": 2
        },
        {
          "text": "Business example: deciding to enable Process automation",
          "anchor": "platformModuleRegistry-5-business-example-deciding-to-enable-process-automation",
          "level": 2
        },
        {
          "text": "Developer model",
          "anchor": "platformModuleRegistry-6-developer-model",
          "level": 2
        },
        {
          "text": "API and UI contract expectations",
          "anchor": "platformModuleRegistry-7-api-and-ui-contract-expectations",
          "level": 2
        },
        {
          "text": "DevOps and operator model",
          "anchor": "platformModuleRegistry-8-devops-and-operator-model",
          "level": 2
        },
        {
          "text": "What the registry must not do",
          "anchor": "platformModuleRegistry-9-what-the-registry-must-not-do",
          "level": 2
        },
        {
          "text": "Security and audit expectations",
          "anchor": "platformModuleRegistry-10-security-and-audit-expectations",
          "level": 2
        },
        {
          "text": "Verification checklist",
          "anchor": "platformModuleRegistry-11-verification-checklist",
          "level": 2
        },
        {
          "text": "Acceptance scenarios",
          "anchor": "platformModuleRegistry-12-acceptance-scenarios",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "platformModuleRegistry-13-common-mistakes",
          "level": 2
        },
        {
          "text": "Required data completion before activation",
          "anchor": "platformModuleRegistry-14-required-data-completion-before-activation",
          "level": 2
        },
        {
          "text": "Runtime identity, activation and protected work",
          "anchor": "platformModuleRegistry-15-runtime-identity-activation-and-protected-work",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "The functional module registry is the Platform/BackOffice contract that tells Axis which high-level Nodics capabilities are known, registered, active, and safe to show to business users. It is intentionally focused on functional modules such as `nodics.foundation`, `nodics.platform`, `nodics.wcms`, and `nodics.process`, not every small technical module inside those groups."
        },
        {
          "kind": "paragraph",
          "text": "For a beginner, the registry is like the application control panel. It does not download code and it does not hot-load a server process. It records the project decision that a live capability is allowed to participate in the project. Runtime servers still need to start with the right module graph."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Why the registry exists",
          "anchor": "platformModuleRegistry-1-why-the-registry-exists"
        },
        {
          "kind": "paragraph",
          "text": "Without a registry, Axis would have to guess from menus, routes, package names, or server responses which modules are safe for a project. That creates messy behavior: a link may appear before the backend is ready, an operator may repeat the same setup after every restart, or a customer may see technical modules that only developers understand."
        },
        {
          "kind": "paragraph",
          "text": "The registry separates two different facts:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "runtime observation: a server is currently running and has reported a capability;",
            "project registration: the project has durably accepted that capability."
          ]
        },
        {
          "kind": "paragraph",
          "text": "Restarting a server renews its runtime observation. It should not ask the operator to register the same module again."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Lifecycle states",
          "anchor": "platformModuleRegistry-2-lifecycle-states"
        },
        {
          "kind": "paragraph",
          "text": "Optional functional modules move through a small lifecycle. The current Axis module registry page follows this model."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "stateDiagram-v2\n  [*] --> Available: runtime observes optional module\n  Available --> RegisteredInactive: register\n  RegisteredInactive --> RegisteredActive: activate\n  RegisteredActive --> RegisteredInactive: deactivate\n  RegisteredInactive --> Available: deregister\n  RegisteredActive --> Available: deactivate then deregister"
        },
        {
          "kind": "table",
          "headers": [
            "State",
            "Beginner meaning",
            "Axis action"
          ],
          "rows": [
            [
              "Available",
              "A live server has reported the module, but the project has not accepted it.",
              "Show Register."
            ],
            [
              "Registered inactive",
              "The project accepted the module but has not enabled it for use.",
              "Show Activate or Deregister."
            ],
            [
              "Registered active",
              "The module is accepted and enabled.",
              "Show Deactivate."
            ],
            [
              "Deregistered",
              "The project removed its durable acceptance while the runtime may still observe it.",
              "Move back to Available."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Core, Platform, and WCMS are mandatory for the local Axis journey. They should not be treated like optional modules that a business user can deregister from the same screen. Process is optional, so it can be observed, registered, activated, deactivated, and deregistered while exposing workflow and cronjob technical modules."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Mandatory versus optional modules",
          "anchor": "platformModuleRegistry-3-mandatory-versus-optional-modules"
        },
        {
          "kind": "paragraph",
          "text": "The registry should stay business-readable. A business user should not need to understand every technical module that helped Core or WCMS start."
        },
        {
          "kind": "table",
          "headers": [
            "Module type",
            "Example",
            "User lifecycle"
          ],
          "rows": [
            [
              "Mandatory foundation",
              "Core, Platform, WCMS",
              "Installed and active by runtime contract; not deregisterable from Axis."
            ],
            [
              "Optional functional capability",
              "Process",
              "Register, activate, deactivate, deregister."
            ],
            [
              "Technical module",
              "`cronjob`, `media`, `profile` internals",
              "Not shown as separate business registry cards unless exposed by an owning functional module."
            ],
            [
              "Customer extension",
              "customer Platform extension",
              "Customizes the standard identity; does not create a new displayed Platform name by default."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Mandatory does not mean “hardcoded in Axis.” It means the current reference BackOffice experience depends on those capabilities. Axis still discovers the effective state from backend contracts, but it should not offer destructive business actions that would remove the foundation required for login, registry visibility, and WCMS-backed presentation."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business value",
          "anchor": "platformModuleRegistry-4-business-value"
        },
        {
          "kind": "paragraph",
          "text": "For business users, the registry reduces confusion. Axis can show “Platform,” “WCMS,” or “Process” as understandable capabilities instead of exposing dozens of technical internals such as validators, routers, cache providers, import processors, or individual schema modules."
        },
        {
          "kind": "paragraph",
          "text": "For a partner, this also protects adoption cost. A project can start with the mandatory capabilities, then add optional capabilities when there is a business reason. The decision is recorded in the database, so the project does not need manual reconfiguration after every restart."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business example: deciding to enable Process automation",
          "anchor": "platformModuleRegistry-5-business-example-deciding-to-enable-process-automation"
        },
        {
          "kind": "paragraph",
          "text": "A small customer may start with login, content, media, and documentation only. After a few weeks, the business asks for nightly cleanup of temporary media, scheduled export retries, and approval workflows. Process becomes useful. The project team starts `processServer`, Axis sees `nodics.process` as available, and an authorized administrator registers and activates it."
        },
        {
          "kind": "paragraph",
          "text": "The business decision is visible and reversible:"
        },
        {
          "kind": "ordered-list",
          "items": [
            "Before registration, Process is observed but not accepted by the project.",
            "After registration, the project remembers that Process is part of its accepted capability set.",
            "After activation, workflow and cronjob operations can become available according to permissions and data import state.",
            "Deactivation pauses the capability without forgetting the registration.",
            "Deregistration removes project intent while the runtime may still be technically live."
          ]
        },
        {
          "kind": "paragraph",
          "text": "That lifecycle is safer than silently enabling features because a server happened to start."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Developer model",
          "anchor": "platformModuleRegistry-6-developer-model"
        },
        {
          "kind": "paragraph",
          "text": "Developers should not confuse registry state with code availability. Package dependencies and repository checkout decide which source is available. Environment/server `extends` configuration decides which modules load in a runtime. The registry records project authorization for a functional module that the runtime has already observed."
        },
        {
          "kind": "paragraph",
          "text": "That means a module can be visible as available only after a server starts and reports it. If `processServer` is not running, Platform cannot honestly present Process as a live optional capability. If Process is running but deregistered, Axis should show it under available modules with the Register action."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Dependency[\"Package dependency<br/>code exists\"] --> ServerGraph[\"Server extends graph<br/>runtime loads\"]\n  ServerGraph --> Observation[\"Runtime observation<br/>module is live\"]\n  Observation --> Registration[\"Project registration<br/>module is accepted\"]\n  Registration --> Activation[\"Activation<br/>module is usable\"]\n  Activation --> Axis[\"Axis visibility<br/>authorized UI appears\"]"
        },
        {
          "kind": "paragraph",
          "text": "Each step answers a different question. Code existing on disk does not mean a server loaded it. A server loading it does not mean the project accepted it. A project accepting it does not mean a user has permission to operate it."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "API and UI contract expectations",
          "anchor": "platformModuleRegistry-7-api-and-ui-contract-expectations"
        },
        {
          "kind": "paragraph",
          "text": "The registry API must give Axis enough information to render without guessing:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "functional module code and display name;",
            "mandatory or optional classification;",
            "observed runtime servers;",
            "current registration state;",
            "current activation state;",
            "active technical modules for explanation, not as primary business toggles;",
            "available actions for the current user and state;",
            "last observation and catalogue revision;",
            "safe status or error messages."
          ]
        },
        {
          "kind": "paragraph",
          "text": "Axis should update its local state immediately after register, activate, deactivate, or deregister operations. A browser refresh must not be required to reveal the next valid action. If an operation fails, Axis should retain the previous known state and show the backend error."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "DevOps and operator model",
          "anchor": "platformModuleRegistry-8-devops-and-operator-model"
        },
        {
          "kind": "paragraph",
          "text": "Operators should monitor both sides of the contract. A registered module that has no live runtime observation may indicate a stopped server, network issue, or broken health path. A live runtime observation for an unregistered optional module means the server is up, but the project has not accepted the capability."
        },
        {
          "kind": "paragraph",
          "text": "In production, audit events should capture who registered, activated, deactivated, or deregistered a module. Those actions affect what Axis exposes and what business users can operate, so they should be treated as governed administrative changes."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "What the registry must not do",
          "anchor": "platformModuleRegistry-9-what-the-registry-must-not-do"
        },
        {
          "kind": "paragraph",
          "text": "The registry must not become a package manager. It should not clone repositories, rewrite server `extends`, or silently enable server categories. It also must not expose every technical module as a business toggle. Technical module loading remains a framework/runtime concern; functional module lifecycle is the BackOffice-facing control."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Security and audit expectations",
          "anchor": "platformModuleRegistry-10-security-and-audit-expectations"
        },
        {
          "kind": "paragraph",
          "text": "Functional-module lifecycle operations change what employees can see and use, so they are administrative actions. A production-ready registry should record:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "who performed the operation;",
            "enterprise and tenant context;",
            "previous state and next state;",
            "runtime evidence used during the decision;",
            "timestamp and correlation identity;",
            "safe failure reason when an operation is rejected."
          ]
        },
        {
          "kind": "paragraph",
          "text": "Axis should display the resulting state, but the backend must remain the audit authority. Browser state alone is not evidence that a module was registered, activated, deactivated, or deregistered."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification checklist",
          "anchor": "platformModuleRegistry-11-verification-checklist"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Start Platform, WCMS, and Process from a fresh database.",
            "Confirm Core, Platform, and WCMS are registered and active by default.",
            "Confirm Process appears as available when its runtime is live.",
            "Register Process and verify it moves to registered inactive or active according to the operation response.",
            "Activate, deactivate, and deregister Process without refreshing the browser.",
            "Confirm deregistered Process returns to available while processServer remains observed.",
            "Restart servers and confirm durable registration state is preserved."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Acceptance scenarios",
          "anchor": "platformModuleRegistry-12-acceptance-scenarios"
        },
        {
          "kind": "table",
          "headers": [
            "Scenario",
            "Expected result"
          ],
          "rows": [
            [
              "Fresh database with Platform and WCMS only",
              "Core, Platform, and WCMS are active; Process is not shown as live."
            ],
            [
              "processServer starts",
              "Process appears as available optional module with workflow and cronjob technical modules."
            ],
            [
              "User registers Process",
              "Process moves out of available list and shows the next valid state without page refresh."
            ],
            [
              "User activates Process",
              "Process shows active and exposes active-state actions without page refresh."
            ],
            [
              "User deactivates Process",
              "Process remains registered but inactive."
            ],
            [
              "User deregisters Process",
              "Process returns to available if the runtime is still observed."
            ],
            [
              "Servers restart",
              "Mandatory state and registered optional state persist from database."
            ],
            [
              "processServer stops",
              "Registered state remains, but runtime observation should show unavailable or stale according to the API contract."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "platformModuleRegistry-13-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Treating `nodics.kickoff` as a functional module just because it starts servers.",
            "Renaming Platform to a customer name when a customer extension only customizes Platform behavior.",
            "Showing technical modules as first-class registry cards for business users.",
            "Assuming deregistration stops a process. It changes project state; process lifecycle is still an operator/runtime concern."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Required data completion before activation",
          "anchor": "platformModuleRegistry-14-required-data-completion-before-activation"
        },
        {
          "kind": "paragraph",
          "text": "When a capability declares required data releases, activation preflights them through nImport. Releases already current need no replay. Releases not installed, updated or previously failed are executed through the existing importer. Every required release must then be confirmed `CURRENT` before activation continues. A running, queued, missing or non-executable result blocks activation."
        },
        {
          "kind": "paragraph",
          "text": "For example, if Core import is still running when an administrator activates a capability, the activation receipt remains running and activation is refused. Wait for the owning import run to complete, inspect failures if present, then retry against the current catalogue revision. A refresh, accepted request or empty response is not import completion. This rule preserves the existing catalogue revision and runtime/readiness checks; it adds no new importer."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Runtime identity, activation and protected work",
          "anchor": "platformModuleRegistry-15-runtime-identity-activation-and-protected-work"
        },
        {
          "kind": "paragraph",
          "text": "A runtime declares what it wants to host; Profile decides what its authenticated service principal may host. Profile uses the existing `principalScopeAssignment` record with `scopeType: RUNTIME_DEPLOYMENT`. Each replica has a distinct principal, retained API-key proof and `runtimeIdentity.instanceCode`. The approved record binds tenant, enterprise, project, environment, server, instance, module names and explicit permissions. A business registration does not grant runtime identity."
        },
        {
          "kind": "paragraph",
          "text": "An operator may author a grant through the existing governed Profile data/API path. This example is an approval record, not a startup header or automatic self-enrollment request:"
        },
        {
          "kind": "code",
          "language": "json",
          "text": "{\n  \"code\": \"warehouse-jobs-01\",\n  \"principalType\": \"service\",\n  \"principalCode\": \"warehouse-jobs-01\",\n  \"scopeType\": \"RUNTIME_DEPLOYMENT\",\n  \"scopeCode\": \"warehouse-jobs-01\",\n  \"tenantCode\": \"warehouse\",\n  \"enterpriseCode\": \"warehouseOperator\",\n  \"inheritanceMode\": \"DIRECT\",\n  \"status\": \"ACTIVE\",\n  \"effect\": \"ALLOW\",\n  \"runtimeScope\": {\n    \"projectCode\": \"warehouse\",\n    \"environmentCode\": \"production\",\n    \"serverCode\": \"jobsServer\",\n    \"instanceCode\": \"warehouse-jobs-01\",\n    \"modules\": [\"cronjob\", \"workflow\"],\n    \"permissions\": [\"auth.internal.token.read\", \"process.instance.start\"]\n  }\n}"
        },
        {
          "kind": "paragraph",
          "text": "The module and permission arrays must describe the actual selected deployment, including its announced dependencies and required operations. The example is intentionally incomplete for a full server. Confirm permission names from the effective owning routers. The principal itself must hold every permission in the grant. Wildcard/group permissions do not propagate into the issued runtime JWT. A matching DENY, expired grant, mismatched coordinate or several matching ALLOW records rejects issuance. One service principal cannot represent multiple active instances."
        },
        {
          "kind": "paragraph",
          "text": "Provision the service principal and hashed API key through Profile's existing identity pipeline. For the first Profile authority, place approved records in trusted deployment initializer data; an existing authority can use its privileged management flow. Keep raw proof in deployment secret storage and resolve it via declarative environment/secret configuration. Do not commit it in a data pack or copy another replica's proof. Existing customer bootstrap admin credentials do not automatically become deployment approvals. A deployment must provision its records and runtime identity before adopting scoped startup."
        },
        {
          "kind": "paragraph",
          "text": "`defaultAuthDetail` supplies the instance's tenant-scoped proof and enterprise. `runtimeIdentity.instanceCode` supplies its explicit identity. Local and remote Profile issuance use the same authorization owner, including the initial authority startup. Tenant initialization awaits governed Init release completion before identity reconciliation and token issuance. A local Profile host has no direct token-issuance shortcut. Restart reuses securely retained proof and rechecks the grant; it does not repeat business registration. This built-in path uses Profile API-key authentication. It does not implement a single-use enrollment-grant provider."
        },
        {
          "kind": "paragraph",
          "text": "Credentials default to five minutes and cannot outlive their assignment. One asynchronous renewal loop refreshes before expiry with bounded concurrency and jitter/backoff; shutdown waits for in-flight renewal. Grant changes invalidate old credentials through Profile's existing principal update and shared security stamp. Atomic allocation prevents two Profile instances from choosing the same version, and atomic version writes prevent a stale issuer from reversing a revocation. Strict auth cache configuration requires a shared engine with atomic consume and atomic version writes, with local fallback disabled."
        },
        {
          "kind": "paragraph",
          "text": "Registration responses project activation from the existing functional catalogue. The registration agent refreshes this projection through its existing batched heartbeat. The default operational-state lifetime is 30 seconds, configurable from one to 60 seconds on both authority and runtime; the runtime uses the shorter lifetime. A failed heartbeat does not extend the last response. Deactivation therefore has bounded propagation, rather than an instantaneous cross-process promise. Expired or absent state denies new protected work."
        },
        {
          "kind": "paragraph",
          "text": "Cronjob checks this state and current JWT expiry/revocation/stamp immediately before invoking a job target. It forwards the verified runtime identity to a Process handoff and local target. A loaded schedule remains manageable while the business capability is inactive. New targets stop; an already-admitted job finishes or follows its existing recovery/cancellation contract. This performs existing authentication-cache checks per execution, without adding a Profile or registry HTTP round trip for each job. Performance acceptance must measure that cost; source-level tests are not throughput or production availability evidence."
        },
        {
          "kind": "paragraph",
          "text": "Process also checks its local `workflow` operational state before creating a new instance, including a start requested by Cronjob. Caller permissions and audit identity remain intact. Existing instances retain their task completion, cancellation and recovery rules after business deactivation."
        },
        {
          "kind": "paragraph",
          "text": "For HTTP calls, nRouter checks the requested module against the credential. Runtime tokens do not carry identity groups. Their base route eligibility comes from `authSecurity.internalToken.runtimeAccessGroups` (default `userGroup`), and explicit action permissions must match the approved token list. Restricted-group and human-only routes remain restricted. Legacy routes without an action permission require approved module scope and an eligible base access group; domain ownership and mutation checks still apply."
        },
        {
          "kind": "paragraph",
          "text": "Operator-triggered application and remote activation imports preserve the authenticated human bearer through configured nImport routes. Service callers or missing bearers cannot execute setup imports. Read-only preflight retains the bounded runtime token; destination permission, tenant and schema-access enforcement remains authoritative."
        }
      ],
      "searchText": "Functional module registry Durable project registration and runtime observation rules. # Functional module registry\n\nThe functional module registry is the Platform/BackOffice contract that tells Axis which high-level Nodics capabilities are known, registered, active, and safe to show to business users. It is intentionally focused on functional modules such as `nodics.foundation`, `nodics.platform`, `nodics.wcms`, and `nodics.process`, not every small technical module inside those groups.\n\nFor a beginner, the registry is like the application control panel. It does not download code and it does not hot-load a server process. It records the project decision that a live capability is allowed to participate in the project. Runtime servers still need to start with the right module graph.\n\n## Why the registry exists\n\nWithout a registry, Axis would have to guess from menus, routes, package names, or server responses which modules are safe for a project. That creates messy behavior: a link may appear before the backend is ready, an operator may repeat the same setup after every restart, or a customer may see technical modules that only developers understand.\n\nThe registry separates two different facts:\n\n- runtime observation: a server is currently running and has reported a capability;\n- project registration: the project has durably accepted that capability.\n\nRestarting a server renews its runtime observation. It should not ask the operator to register the same module again.\n\n## Lifecycle states\n\nOptional functional modules move through a small lifecycle. The current Axis module registry page follows this model.\n\n```mermaid\nstateDiagram-v2\n  [*] --> Available: runtime observes optional module\n  Available --> RegisteredInactive: register\n  RegisteredInactive --> RegisteredActive: activate\n  RegisteredActive --> RegisteredInactive: deactivate\n  RegisteredInactive --> Available: deregister\n  RegisteredActive --> Available: deactivate then deregister\n```\n\n| State | Beginner meaning | Axis action |\n| --- | --- | --- |\n| Available | A live server has reported the module, but the project has not accepted it. | Show Register. |\n| Registered inactive | The project accepted the module but has not enabled it for use. | Show Activate or Deregister. |\n| Registered active | The module is accepted and enabled. | Show Deactivate. |\n| Deregistered | The project removed its durable acceptance while the runtime may still observe it. | Move back to Available. |\n\nCore, Platform, and WCMS are mandatory for the local Axis journey. They should not be treated like optional modules that a business user can deregister from the same screen. Process is optional, so it can be observed, registered, activated, deactivated, and deregistered while exposing workflow and cronjob technical modules.\n\n## Mandatory versus optional modules\n\nThe registry should stay business-readable. A business user should not need to understand every technical module that helped Core or WCMS start.\n\n| Module type | Example | User lifecycle |\n| --- | --- | --- |\n| Mandatory foundation | Core, Platform, WCMS | Installed and active by runtime contract; not deregisterable from Axis. |\n| Optional functional capability | Process | Register, activate, deactivate, deregister. |\n| Technical module | `cronjob`, `media`, `profile` internals | Not shown as separate business registry cards unless exposed by an owning functional module. |\n| Customer extension | customer Platform extension | Customizes the standard identity; does not create a new displayed Platform name by default. |\n\nMandatory does not mean “hardcoded in Axis.” It means the current reference BackOffice experience depends on those capabilities. Axis still discovers the effective state from backend contracts, but it should not offer destructive business actions that would remove the foundation required for login, registry visibility, and WCMS-backed presentation.\n\n## Business value\n\nFor business users, the registry reduces confusion. Axis can show “Platform,” “WCMS,” or “Process” as understandable capabilities instead of exposing dozens of technical internals such as validators, routers, cache providers, import processors, or individual schema modules.\n\nFor a partner, this also protects adoption cost. A project can start with the mandatory capabilities, then add optional capabilities when there is a business reason. The decision is recorded in the database, so the project does not need manual reconfiguration after every restart.\n\n## Business example: deciding to enable Process automation\n\nA small customer may start with login, content, media, and documentation only. After a few weeks, the business asks for nightly cleanup of temporary media, scheduled export retries, and approval workflows. Process becomes useful. The project team starts `processServer`, Axis sees `nodics.process` as available, and an authorized administrator registers and activates it.\n\nThe business decision is visible and reversible:\n\n1. Before registration, Process is observed but not accepted by the project.\n2. After registration, the project remembers that Process is part of its accepted capability set.\n3. After activation, workflow and cronjob operations can become available according to permissions and data import state.\n4. Deactivation pauses the capability without forgetting the registration.\n5. Deregistration removes project intent while the runtime may still be technically live.\n\nThat lifecycle is safer than silently enabling features because a server happened to start.\n\n## Developer model\n\nDevelopers should not confuse registry state with code availability. Package dependencies and repository checkout decide which source is available. Environment/server `extends` configuration decides which modules load in a runtime. The registry records project authorization for a functional module that the runtime has already observed.\n\nThat means a module can be visible as available only after a server starts and reports it. If `processServer` is not running, Platform cannot honestly present Process as a live optional capability. If Process is running but deregistered, Axis should show it under available modules with the Register action.\n\n```mermaid\nflowchart LR\n  Dependency[\"Package dependency<br/>code exists\"] --> ServerGraph[\"Server extends graph<br/>runtime loads\"]\n  ServerGraph --> Observation[\"Runtime observation<br/>module is live\"]\n  Observation --> Registration[\"Project registration<br/>module is accepted\"]\n  Registration --> Activation[\"Activation<br/>module is usable\"]\n  Activation --> Axis[\"Axis visibility<br/>authorized UI appears\"]\n```\n\nEach step answers a different question. Code existing on disk does not mean a server loaded it. A server loading it does not mean the project accepted it. A project accepting it does not mean a user has permission to operate it.\n\n## API and UI contract expectations\n\nThe registry API must give Axis enough information to render without guessing:\n\n- functional module code and display name;\n- mandatory or optional classification;\n- observed runtime servers;\n- current registration state;\n- current activation state;\n- active technical modules for explanation, not as primary business toggles;\n- available actions for the current user and state;\n- last observation and catalogue revision;\n- safe status or error messages.\n\nAxis should update its local state immediately after register, activate, deactivate, or deregister operations. A browser refresh must not be required to reveal the next valid action. If an operation fails, Axis should retain the previous known state and show the backend error.\n\n## DevOps and operator model\n\nOperators should monitor both sides of the contract. A registered module that has no live runtime observation may indicate a stopped server, network issue, or broken health path. A live runtime observation for an unregistered optional module means the server is up, but the project has not accepted the capability.\n\nIn production, audit events should capture who registered, activated, deactivated, or deregistered a module. Those actions affect what Axis exposes and what business users can operate, so they should be treated as governed administrative changes.\n\n## What the registry must not do\n\nThe registry must not become a package manager. It should not clone repositories, rewrite server `extends`, or silently enable server categories. It also must not expose every technical module as a business toggle. Technical module loading remains a framework/runtime concern; functional module lifecycle is the BackOffice-facing control.\n\n## Security and audit expectations\n\nFunctional-module lifecycle operations change what employees can see and use, so they are administrative actions. A production-ready registry should record:\n\n- who performed the operation;\n- enterprise and tenant context;\n- previous state and next state;\n- runtime evidence used during the decision;\n- timestamp and correlation identity;\n- safe failure reason when an operation is rejected.\n\nAxis should display the resulting state, but the backend must remain the audit authority. Browser state alone is not evidence that a module was registered, activated, deactivated, or deregistered.\n\n## Verification checklist\n\n- Start Platform, WCMS, and Process from a fresh database.\n- Confirm Core, Platform, and WCMS are registered and active by default.\n- Confirm Process appears as available when its runtime is live.\n- Register Process and verify it moves to registered inactive or active according to the operation response.\n- Activate, deactivate, and deregister Process without refreshing the browser.\n- Confirm deregistered Process returns to available while processServer remains observed.\n- Restart servers and confirm durable registration state is preserved.\n\n## Acceptance scenarios\n\n| Scenario | Expected result |\n| --- | --- |\n| Fresh database with Platform and WCMS only | Core, Platform, and WCMS are active; Process is not shown as live. |\n| processServer starts | Process appears as available optional module with workflow and cronjob technical modules. |\n| User registers Process | Process moves out of available list and shows the next valid state without page refresh. |\n| User activates Process | Process shows active and exposes active-state actions without page refresh. |\n| User deactivates Process | Process remains registered but inactive. |\n| User deregisters Process | Process returns to available if the runtime is still observed. |\n| Servers restart | Mandatory state and registered optional state persist from database. |\n| processServer stops | Registered state remains, but runtime observation should show unavailable or stale according to the API contract. |\n\n## Common mistakes\n\n- Treating `nodics.kickoff` as a functional module just because it starts servers.\n- Renaming Platform to a customer name when a customer extension only customizes Platform behavior.\n- Showing technical modules as first-class registry cards for business users.\n- Assuming deregistration stops a process. It changes project state; process lifecycle is still an operator/runtime concern.\n\n## Required data completion before activation\n\nWhen a capability declares required data releases, activation preflights them through nImport. Releases already current need no replay. Releases not installed, updated or previously failed are executed through the existing importer. Every required release must then be confirmed `CURRENT` before activation continues. A running, queued, missing or non-executable result blocks activation.\n\nFor example, if Core import is still running when an administrator activates a capability, the activation receipt remains running and activation is refused. Wait for the owning import run to complete, inspect failures if present, then retry against the current catalogue revision. A refresh, accepted request or empty response is not import completion. This rule preserves the existing catalogue revision and runtime/readiness checks; it adds no new importer.\n\n## Runtime identity, activation and protected work\n\nA runtime declares what it wants to host; Profile decides what its authenticated service principal may host. Profile uses the existing `principalScopeAssignment` record with `scopeType: RUNTIME_DEPLOYMENT`. Each replica has a distinct principal, retained API-key proof and `runtimeIdentity.instanceCode`. The approved record binds tenant, enterprise, project, environment, server, instance, module names and explicit permissions. A business registration does not grant runtime identity.\n\nAn operator may author a grant through the existing governed Profile data/API path. This example is an approval record, not a startup header or automatic self-enrollment request:\n\n```json\n{\n  \"code\": \"warehouse-jobs-01\",\n  \"principalType\": \"service\",\n  \"principalCode\": \"warehouse-jobs-01\",\n  \"scopeType\": \"RUNTIME_DEPLOYMENT\",\n  \"scopeCode\": \"warehouse-jobs-01\",\n  \"tenantCode\": \"warehouse\",\n  \"enterpriseCode\": \"warehouseOperator\",\n  \"inheritanceMode\": \"DIRECT\",\n  \"status\": \"ACTIVE\",\n  \"effect\": \"ALLOW\",\n  \"runtimeScope\": {\n    \"projectCode\": \"warehouse\",\n    \"environmentCode\": \"production\",\n    \"serverCode\": \"jobsServer\",\n    \"instanceCode\": \"warehouse-jobs-01\",\n    \"modules\": [\"cronjob\", \"workflow\"],\n    \"permissions\": [\"auth.internal.token.read\", \"process.instance.start\"]\n  }\n}\n```\n\nThe module and permission arrays must describe the actual selected deployment, including its announced dependencies and required operations. The example is intentionally incomplete for a full server. Confirm permission names from the effective owning routers. The principal itself must hold every permission in the grant. Wildcard/group permissions do not propagate into the issued runtime JWT. A matching DENY, expired grant, mismatched coordinate or several matching ALLOW records rejects issuance. One service principal cannot represent multiple active instances.\n\nProvision the service principal and hashed API key through Profile's existing identity pipeline. For the first Profile authority, place approved records in trusted deployment initializer data; an existing authority can use its privileged management flow. Keep raw proof in deployment secret storage and resolve it via declarative environment/secret configuration. Do not commit it in a data pack or copy another replica's proof. Existing customer bootstrap admin credentials do not automatically become deployment approvals. A deployment must provision its records and runtime identity before adopting scoped startup.\n\n`defaultAuthDetail` supplies the instance's tenant-scoped proof and enterprise. `runtimeIdentity.instanceCode` supplies its explicit identity. Local and remote Profile issuance use the same authorization owner, including the initial authority startup. Tenant initialization awaits governed Init release completion before identity reconciliation and token issuance. A local Profile host has no direct token-issuance shortcut. Restart reuses securely retained proof and rechecks the grant; it does not repeat business registration. This built-in path uses Profile API-key authentication. It does not implement a single-use enrollment-grant provider.\n\nCredentials default to five minutes and cannot outlive their assignment. One asynchronous renewal loop refreshes before expiry with bounded concurrency and jitter/backoff; shutdown waits for in-flight renewal. Grant changes invalidate old credentials through Profile's existing principal update and shared security stamp. Atomic allocation prevents two Profile instances from choosing the same version, and atomic version writes prevent a stale issuer from reversing a revocation. Strict auth cache configuration requires a shared engine with atomic consume and atomic version writes, with local fallback disabled.\n\nRegistration responses project activation from the existing functional catalogue. The registration agent refreshes this projection through its existing batched heartbeat. The default operational-state lifetime is 30 seconds, configurable from one to 60 seconds on both authority and runtime; the runtime uses the shorter lifetime. A failed heartbeat does not extend the last response. Deactivation therefore has bounded propagation, rather than an instantaneous cross-process promise. Expired or absent state denies new protected work.\n\nCronjob checks this state and current JWT expiry/revocation/stamp immediately before invoking a job target. It forwards the verified runtime identity to a Process handoff and local target. A loaded schedule remains manageable while the business capability is inactive. New targets stop; an already-admitted job finishes or follows its existing recovery/cancellation contract. This performs existing authentication-cache checks per execution, without adding a Profile or registry HTTP round trip for each job. Performance acceptance must measure that cost; source-level tests are not throughput or production availability evidence.\n\nProcess also checks its local `workflow` operational state before creating a new instance, including a start requested by Cronjob. Caller permissions and audit identity remain intact. Existing instances retain their task completion, cancellation and recovery rules after business deactivation.\n\nFor HTTP calls, nRouter checks the requested module against the credential. Runtime tokens do not carry identity groups. Their base route eligibility comes from `authSecurity.internalToken.runtimeAccessGroups` (default `userGroup`), and explicit action permissions must match the approved token list. Restricted-group and human-only routes remain restricted. Legacy routes without an action permission require approved module scope and an eligible base access group; domain ownership and mutation checks still apply.\n\nOperator-triggered application and remote activation imports preserve the authenticated human bearer through configured nImport routes. Service callers or missing bearers cannot execute setup imports. Read-only preflight retains the bounded runtime token; destination permission, tenant and schema-access enforcement remains authoritative.\n",
      "previous": {
        "title": "Architecture Decision Guide",
        "route": "/docs/framework/framework-architecture-decision-guide"
      },
      "next": {
        "title": "Foundation overview",
        "route": "/docs/framework/foundation-overview"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.platform",
        "technicalModule": "backoffice",
        "owner": "backoffice",
        "sourcePath": "data/docs-v001/records/documentation/backofficeDocumentationRelease002ComponentData.js",
        "path": "data/docs-v001/records/documentation/backofficeDocumentationRelease002ComponentData.js",
        "wordCount": 2395,
        "checksum": "f979521d9e9607718ea5566c54f25059252ee37294c2c43c717b6b5c8efa458f"
      },
      "slug": "platform-module-registry",
      "locale": "en",
      "navigationGroup": "Functional Module Registry",
      "navigationGroupCode": "functional-module-registry",
      "navigationGroupOrder": 10,
      "navigationOrder": 10,
      "references": [
        {
          "documentId": "platform.overview",
          "owner": "profile"
        },
        {
          "documentId": "foundation.overview",
          "owner": "nodics.docs"
        },
        {
          "documentId": "framework.local-quick-start",
          "owner": "nTooling"
        }
      ]
    },
    "active": true
  },
  "record1": {
    "code": "nodicsDocsComponentaxisBusinessCustomization",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "axis.business-customization",
      "title": "Business Customization in Axis",
      "route": "/docs/framework/axis-business-customization",
      "section": "business-customization-in-axis",
      "sectionTitle": "Business Customization in Axis",
      "group": "business-customization-in-axis",
      "groupTitle": "Business Customization in Axis",
      "parentId": "business-customization-in-axis",
      "hierarchyPath": [
        "Business Customization in Axis",
        "Business Customization in Axis"
      ],
      "hierarchyDepth": 2,
      "documentType": "customization",
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
      "summary": "How Axis lets authorized users manage navigation, content areas, documentation pages, runtime configuration, and capability-specific business data.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "STAGED",
      "version": "0.16.5",
      "maturityState": "operational",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "docs.overview",
        "process.visual-designer",
        "wcms.overview"
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
        "business-customization-in-axis",
        "axis-customization-workspace",
        "business-customization-in-axis"
      ],
      "topicKeywords": [
        "Business Customization in Axis",
        "Axis Customization Workspace",
        "Business Customization in Axis"
      ],
      "headings": [
        {
          "text": "Business context",
          "anchor": "axisBusinessCustomization-1-business-context",
          "level": 2
        },
        {
          "text": "Journey and ownership",
          "anchor": "axisBusinessCustomization-2-journey-and-ownership",
          "level": 2
        },
        {
          "text": "Data and configuration detail",
          "anchor": "axisBusinessCustomization-3-data-and-configuration-detail",
          "level": 2
        },
        {
          "text": "Customization and extension",
          "anchor": "axisBusinessCustomization-4-customization-and-extension",
          "level": 2
        },
        {
          "text": "Operations and governance",
          "anchor": "axisBusinessCustomization-5-operations-and-governance",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "axisBusinessCustomization-6-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "axisBusinessCustomization-7-verification",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "How Axis lets authorized users manage navigation, content areas, documentation pages, runtime configuration, and capability-specific business data. This page is intentionally written for beginners, business users, developers, operators, architects, QA owners, and AI tools. It explains the business problem first, then the technical ownership model, then the exact customization and verification responsibilities so nobody has to guess where a change belongs."
        },
        {
          "kind": "paragraph",
          "text": "Enterprise users need controlled customization without asking developers to change source code for every navigation label, content area, page sequence, approval rule, or runtime business setting. Axis presents backend-owned content, profile, BackOffice, schema, CMS, and process data through governed workspaces. Every meaningful change remains subject to permission, validation, publication, and audit rules."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business context",
          "anchor": "axisBusinessCustomization-1-business-context"
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
              "Enterprise users need controlled customization without asking developers to change source code for every navigation label, content area, page sequence, approval rule, or runtime business setting."
            ],
            [
              "Who uses it?",
              "Business users, administrators, developers, operators, QA owners, implementation partners, and AI-assisted delivery tools."
            ],
            [
              "What changes can it support?",
              "Axis presents backend-owned content, profile, BackOffice, schema, CMS, and process data through governed workspaces. Every meaningful change remains subject to permission, validation, publication, and audit rules."
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
          "anchor": "axisBusinessCustomization-2-journey-and-ownership"
        },
        {
          "kind": "paragraph",
          "text": "BackOffice publishes capability metadata, Profile owns access, CMS owns content records, nPublish owns publication lifecycle, and Axis renders the management experience without becoming the source of truth. This keeps the reader-facing name friendly while preserving exact source ownership for developers and AI tools. Axis may render management screens or authenticated documentation, Nexus may render public Online content, and the backend content catalog remains authoritative for navigation, pages, access policies, and publication state."
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
              "Business Customization in Axis",
              "Used in navigation and dashboards so readers are not exposed to raw module names first."
            ],
            [
              "Source owner",
              "nodics.platform",
              "Carries exact implementation, documentation, and validation evidence."
            ],
            [
              "Technical module",
              "backoffice",
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
          "anchor": "axisBusinessCustomization-3-data-and-configuration-detail"
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
          "text": "axisNavigationNode: { label: \"Documentation\", targetType: \"contentCatalog\", publishable: true, permission: \"documentation.navigation.update\" }"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and extension",
          "anchor": "axisBusinessCustomization-4-customization-and-extension"
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
          "anchor": "axisBusinessCustomization-5-operations-and-governance"
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
          "anchor": "axisBusinessCustomization-6-common-mistakes"
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
          "anchor": "axisBusinessCustomization-7-verification"
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
      "searchText": "Business Customization in Axis How Axis lets authorized users manage navigation, content areas, documentation pages, runtime configuration, and capability-specific business data. # Business Customization in Axis\n\nHow Axis lets authorized users manage navigation, content areas, documentation pages, runtime configuration, and capability-specific business data. This page is intentionally written for beginners, business users, developers, operators, architects, QA owners, and AI tools. It explains the business problem first, then the technical ownership model, then the exact customization and verification responsibilities so nobody has to guess where a change belongs.\n\nEnterprise users need controlled customization without asking developers to change source code for every navigation label, content area, page sequence, approval rule, or runtime business setting. Axis presents backend-owned content, profile, BackOffice, schema, CMS, and process data through governed workspaces. Every meaningful change remains subject to permission, validation, publication, and audit rules.\n\n## Business context\n\nFor a business user, this topic answers what decision can be made, which operational journey is supported, and what risk is reduced. The practical value is faster delivery without losing governance: teams can understand the current capability, decide whether it applies to their project, and know when Axis, Nexus, content catalog, workflow, or runtime services are involved.\n\nFor beginners, the mental model is simple: the page title is the business capability, the table identifies who owns each part, and the diagram shows how a request or change flows. A reader should not need source-code knowledge to understand the journey, but the developer path is still available when customization is needed.\n\n| Business question | Answer for this topic |\n| --- | --- |\n| What problem does it solve? | Enterprise users need controlled customization without asking developers to change source code for every navigation label, content area, page sequence, approval rule, or runtime business setting. |\n| Who uses it? | Business users, administrators, developers, operators, QA owners, implementation partners, and AI-assisted delivery tools. |\n| What changes can it support? | Axis presents backend-owned content, profile, BackOffice, schema, CMS, and process data through governed workspaces. Every meaningful change remains subject to permission, validation, publication, and audit rules. |\n| What must be governed? | Permissions, validation, source ownership, publication state, runtime impact, audit evidence, and rollback boundaries. |\n\n## Journey and ownership\n\nBackOffice publishes capability metadata, Profile owns access, CMS owns content records, nPublish owns publication lifecycle, and Axis renders the management experience without becoming the source of truth. This keeps the reader-facing name friendly while preserving exact source ownership for developers and AI tools. Axis may render management screens or authenticated documentation, Nexus may render public Online content, and the backend content catalog remains authoritative for navigation, pages, access policies, and publication state.\n\n```mermaid\nflowchart LR\n  Reader[\"Business or developer request\"] --> Axis[\"Axis or Nexus view\"]\n  Axis --> Backend[\"Owning backend capability\"]\n  Backend --> Catalog[\"Content/catalog/schema/config records\"]\n  Catalog --> Runtime[\"Runtime behavior or published page\"]\n  Runtime --> Evidence[\"Audit, validation, and support evidence\"]\n```\n\n| Responsibility | Owner | Notes |\n| --- | --- | --- |\n| Business capability name | Business Customization in Axis | Used in navigation and dashboards so readers are not exposed to raw module names first. |\n| Source owner | nodics.platform | Carries exact implementation, documentation, and validation evidence. |\n| Technical module | backoffice | Holds the relevant schema, service, router, data, or contract detail where applicable. |\n| Axis experience | Backend-declared workspace | Axis renders metadata and actions but does not become the authority. |\n| Public experience | Online content delivery | Nexus renders only records approved for public access. |\n\n## Data and configuration detail\n\nEvery topic must explain the data that changes behavior. Some topics are schema-driven, some are configuration-driven, some are publishable content, and some are operational records. The documentation must say which category applies before showing code. That keeps production operators and developers aligned on whether a change needs publication, restart, event propagation, approval, or only a project-layer override.\n\n| Detail area | What to document | Verification signal |\n| --- | --- | --- |\n| Model or record | Type code, catalog, tenant, enterprise, state, owner, and lifecycle. | Schema contract or generated model test. |\n| Configuration key | Default value, override location, environment scope, and runtime impact. | Config validation and runtime refresh evidence. |\n| API or event | Route/event name, payload boundary, permission, idempotency, and failure mode. | Route, service, event, and authorization tests. |\n| Publication and access | Staged/Online state, access mode, roles, groups, and permissions. | Content-pack validation and access-policy test. |\n\n```js\naxisNavigationNode: { label: \"Documentation\", targetType: \"contentCatalog\", publishable: true, permission: \"documentation.navigation.update\" }\n```\n\n## Customization and extension\n\nDevelopers should customize from the project layer first. A customer project may add properties, services, validators, pipelines, renderers, data packs, or provider configuration when the extension respects the owning capability. Business users may update governed records in Axis when the record is designed for administration. Framework source changes are reserved for improving the reusable product capability itself.\n\n| Customization type | Recommended path | Avoid |\n| --- | --- | --- |\n| Business label, navigation, or content area | Axis-managed content catalog item with publication workflow. | Hardcoding labels or page trees in the frontend. |\n| Runtime setting | Module configuration with validation and governed runtime propagation. | Editing node-local files on each server by hand. |\n| Domain behavior | Extension service, validator, pipeline step, or provider adapter. | Forking the standard module for customer-only logic. |\n| Public visibility | Access policy with public/authenticated/role-based state. | Exposing internal or draft pages through Nexus. |\n\n## Operations and governance\n\nOperators need production-safe evidence, not only implementation notes. Each page must call out logging, tracing, permission checks, event propagation, data import/export, publication status, rollback behavior, and troubleshooting. If a capability affects multiple nodes, the documentation must explain how changes reach every node and how a partial failure is detected.\n\n| Operational concern | Required documentation detail |\n| --- | --- |\n| Security | Authentication mode, permission code, role/group, tenant and enterprise isolation. |\n| Audit | Actor, timestamp, source record, checksum, approval, route/event, and result. |\n| Resilience | Retry, idempotency, compensation, fallback, cache invalidation, and rollback. |\n| Observability | Logs, metrics, dashboard cards, health checks, and support evidence. |\n\n## Common mistakes\n\n- Treating a friendly navigation label as the technical source owner.\n- Writing only developer details and skipping the business decision that the page supports.\n- Updating Axis or Nexus code when the content catalog, schema, or backend capability should own the change.\n- Forgetting access rules for public, authenticated, role-based, group-based, or permission-based pages.\n- Skipping diagrams, comparison tables, source maps, or troubleshooting matrices because the topic feels obvious.\n- Changing runtime behavior without explaining production impact, cluster propagation, and rollback.\n- Leaving CMS documentation without source evidence, validation commands, and maturity state.\n\n## Verification\n\nVerification starts with the document itself: it must include business context, technical ownership, a visual flow, data or configuration tables, customization guidance, common mistakes, and validation evidence. Developers and AI tools maintain the page directly as backend-owned CMS data and validate its declared checksums, lifecycle, navigation, access policy, publication state, and search metadata. No separate Markdown authoring source or prose generator is required.\n\nFor implementation verification, run the owning module tests and any Axis or Nexus renderer tests that consume the page. Operators should confirm that production-like runtime behavior matches the documentation: permissions reject unauthorized access, Online pages do not expose Staged data, runtime changes propagate through governed events, and troubleshooting evidence is available without exposing secrets.\n",
      "previous": {
        "title": "Visual Workflow Designer Contract",
        "route": "/docs/framework/process/visual-designer"
      },
      "next": {
        "title": "Platform overview",
        "route": "/docs/framework/platform-overview"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.platform",
        "technicalModule": "backoffice",
        "owner": "backoffice",
        "sourcePath": "data/docs-v001/records/documentation/backofficeDocumentationRelease002ComponentData.js",
        "path": "data/docs-v001/records/documentation/backofficeDocumentationRelease002ComponentData.js",
        "wordCount": 1114,
        "checksum": "da21a71ed638245a3fe525784a0c52e85ae8ff0d85b64a012c70f35068542953"
      },
      "slug": "axis-business-customization",
      "locale": "en",
      "navigationGroup": "Axis Customization Workspace",
      "navigationGroupCode": "axis-customization-workspace",
      "navigationGroupOrder": 10,
      "navigationOrder": 10,
      "references": [
        {
          "documentId": "docs.overview",
          "owner": "nodics.docs"
        },
        {
          "documentId": "process.visual-designer",
          "owner": "workflow"
        },
        {
          "documentId": "wcms.overview",
          "owner": "wcms"
        }
      ]
    },
    "active": true
  },
  "record2": {
    "code": "nodicsDocsComponentapplicationsAxisSetupErrorContracts",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "applications.axis-setup-error-contracts",
      "title": "Axis Setup and User-Safe Error Contracts",
      "route": "/docs/framework/applications-axis-setup-error-contracts",
      "section": "axis-and-backoffice-operations",
      "sectionTitle": "Axis and BackOffice Operations",
      "group": "axis-and-backoffice-operations",
      "groupTitle": "Axis and BackOffice Operations",
      "parentId": "axis-and-backoffice-operations",
      "hierarchyPath": [
        "Axis and BackOffice Operations",
        "Axis Setup and User-Safe Error Contracts"
      ],
      "hierarchyDepth": 2,
      "documentType": "contract",
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
      "summary": "How Axis presents setup, retry, blocker, and initialization errors with safe business messages while preserving technical evidence for operators.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "STAGED",
      "version": "0.0.2",
      "maturityState": "operational",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "axis.business-customization",
        "platform.module-registry",
        "framework.fresh-schema-setup-journey",
        "applications.suite",
        "promotion.campaigns-coupon-issuance",
        "cart.customer-intent-calculation",
        "digital.purchase-delivery-reveal",
        "inventory.stock-management"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "src/service/defaultBackofficeApplicationInitializationService.js",
        "src/service/availability/defaultBackofficeAvailabilityService.js",
        "src/service/registry/defaultBackofficeCapabilityRegistryService.js",
        "test/backofficeApplicationInitializationContract.test.js",
        "../../../../nodics.exp/nodics.axis/package.json",
        "package.json",
        "src/schemas",
        "src/service",
        "test/applicationPreparationOrder.test.js",
        "test/applicationPreparationReceipts.test.js",
        "src/controller/defaultBackofficeApplicationInitializationController.js",
        "src/router/routers.js",
        "llm/contracts/governed-application-setup.md",
        "test/applicationContributionReadiness.test.js"
      ],
      "visualRequirements": [
        "lifecycle-state-diagram",
        "table",
        "troubleshooting-matrix",
        "diagram"
      ],
      "searchKeywords": [
        "axis",
        "setup",
        "accelerator",
        "safe-error",
        "backoffice",
        "after-publication",
        "governed-publications",
        "current-baseline-reuse",
        "signed-operator",
        "afterPublicationStepCode",
        "selectionRequired",
        "selectableStepCodes",
        "AUTHORITY_PENDING",
        "aggregate-observation",
        "fresh-recovery"
      ],
      "topicKeywords": [
        "Axis and BackOffice Operations",
        "Setup and Accelerators",
        "User-Safe Error Contracts",
        "after-publication",
        "governed-publications",
        "current-baseline-reuse",
        "signed-operator",
        "aggregate-only-observation",
        "fresh-recovery"
      ],
      "headings": [
        {
          "text": "Source map",
          "anchor": "applicationsAxisSetupErrorContracts-1-source-map",
          "level": 2
        },
        {
          "text": "State model",
          "anchor": "applicationsAxisSetupErrorContracts-2-state-model",
          "level": 2
        },
        {
          "text": "Error contract",
          "anchor": "applicationsAxisSetupErrorContracts-3-error-contract",
          "level": 2
        },
        {
          "text": "Setup flow",
          "anchor": "applicationsAxisSetupErrorContracts-4-setup-flow",
          "level": 2
        },
        {
          "text": "Customization and extension guidance",
          "anchor": "applicationsAxisSetupErrorContracts-5-customization-and-extension-guidance",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "applicationsAxisSetupErrorContracts-6-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "applicationsAxisSetupErrorContracts-7-verification",
          "level": 2
        },
        {
          "text": "Preparation phases and an already Online baseline",
          "anchor": "axis-setup-publication-phases",
          "level": 2
        },
        {
          "text": "Safe deferred setup diagnostics and recovery",
          "anchor": "axis-deferred-setup-recovery",
          "level": 2
        },
        {
          "text": "Customize and verify phased setup",
          "anchor": "axis-setup-phase-customization",
          "level": 2
        },
        {
          "text": "Select one signed operator stage",
          "anchor": "axis-signed-operator-selection",
          "level": 2
        },
        {
          "text": "Read selection metadata without losing pending authority",
          "anchor": "axis-selection-and-authority-pending",
          "level": 2
        },
        {
          "text": "Aggregate-only exact-plan observation",
          "anchor": "axis-aggregate-read-observation",
          "level": 2
        },
        {
          "text": "Verify selected-stage recovery",
          "anchor": "axis-selected-stage-verification",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Axis is the business-facing backoffice journey for setup, governance, and operation. It should help a business user initialize accelerators, inspect status, retry failed work, and navigate to the right owner without exposing raw framework exceptions. Axis is not the authority for catalogs, pages, media, products, prices, inventory, or documentation data. It consumes BackOffice capability metadata and runtime evidence, then presents a safe operator experience. For beginners, select the intended application profile and read its business status before choosing an action. Follow only enabled backend-declared repair actions, preserving the displayed release and approval references. If a blocker has no executable action, use its safe message and authorized technical evidence to reach the named owner; repeatedly clicking retry is not a repair procedure."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Source map",
          "anchor": "applicationsAxisSetupErrorContracts-1-source-map"
        },
        {
          "kind": "table",
          "headers": [
            "Owner operation",
            "Framework source and boundary"
          ],
          "rows": [
            [
              "Setup projection and repairs",
              "`nodics.platform/modules/backoffice/src/service/defaultBackofficeApplicationInitializationService.js`: `capabilityBusinessStatus`, `capabilityRepairProjection`, `invoke`."
            ],
            [
              "Authenticated setup routes",
              "`nodics.platform/modules/backoffice/src/router/routers.js`: initialization status and mutation routes; permissions and human-administrator checks remain backend-owned."
            ],
            [
              "Backend error contract",
              "Canonical guide `foundation.error-handling-status-codes`; stable public messages are distinct from authorized diagnostic evidence. Axis frontend installation is a separate application concern, not a framework-owned source path."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "State model",
          "anchor": "applicationsAxisSetupErrorContracts-2-state-model"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TD\n  Facts[\"Readiness, preparation, publication, Media\"] --> Mapper[\"BackOffice capabilityBusinessStatus\"]\n  Mapper --> Pending[\"NOT_PREPARED / PREPARING\"]\n  Mapper --> Approval[\"APPROVAL_REQUIRED / APPROVAL_IN_PROGRESS\"]\n  Mapper --> Ready[\"PREPARED_STAGED / ONLINE / RETIRED\"]\n  Mapper --> Attention[\"NEEDS_ATTENTION\"]\n  Attention --> Repairs[\"Backend-declared repairActions, not universal Retry\"]"
        },
        {
          "kind": "paragraph",
          "text": "The diagram names backend businessStatus values, not frontend lifecycle authority. `capabilityBusinessStatus` applies guards in order: missing projection, unqualified Media dependencies, or preparation outside CURRENT/RUNNING yields NEEDS_ATTENTION before readiness is considered. Then RETIRED maps to RETIRED; READY without publication.state ONLINE maps to NEEDS_ATTENTION; READY with confirmed ONLINE maps to ONLINE unless releaseStatus is UPDATE_AVAILABLE, which maps to NEEDS_ATTENTION. PUBLICATION_PENDING maps to APPROVAL_IN_PROGRESS, IMPORTED to APPROVAL_REQUIRED, IMPORTING to PREPARING, NOT_IMPORTED to NOT_PREPARED, and ROLLED_BACK to PREPARED_STAGED; remaining cases need attention. A publication label alone therefore cannot establish Online readiness."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Error contract",
          "anchor": "applicationsAxisSetupErrorContracts-3-error-contract"
        },
        {
          "kind": "table",
          "headers": [
            "Blocker / safe operator message",
            "Allowed action and replay precondition",
            "Authorized evidence"
          ],
          "rows": [
            [
              "INVALID_MANIFEST / Application release needs repair.",
              "`source.releaseManifest.repair` is a non-executable owner handoff. Fix the selected release, then refresh readiness; repeated initialization does not repair source.",
              "Profile, release item, validation failure, correlation; no raw exception in primary UI."
            ],
            [
              "READINESS_VALIDATION_BLOCKED / Setup prerequisites need attention.",
              "REVIEW_SETUP_PREREQUISITES is unavailable as automatic repair. Resolve validation findings before another governed setup attempt.",
              "Validation result and required owner; preserve current release binding."
            ],
            [
              "READINESS_UNAVAILABLE or READINESS_UNKNOWN / Setup status could not be checked.",
              "REFRESH_READINESS via applicationInitialization.status is read-only and available. For READINESS_RATE_LIMITED wait before refresh; do not initiate publication to probe health.",
              "Bounded target diagnostic, failure code and correlation; infrastructure addresses belong only in authorized support detail."
            ],
            [
              "MODULE_INACTIVE or RUNTIME_UNAVAILABLE / Required capability is unavailable.",
              "moduleRegistry.activate or runtimeTopology.restoreRuntime is an unavailable automatic repair, with confirmation required for owner-managed change. Restore and reread status.",
              "Module, runtime role, owner availability; action metadata is not a frontend executable URL."
            ],
            [
              "MEDIA_DEPENDENCY_* / Required media is not ready.",
              "MEDIA_MISSING/MEDIA_UNPUBLISHED may offer prepareCapability; VERSION_UNPINNED requires confirmed initialization. Other retained-publication repair requires owner inspection and confirmation, automatic:false.",
              "Exact Media version/checksum/manifest, dependency status, qualification; never substitute any latest asset."
            ],
            [
              "UPDATE_AVAILABLE / A newer application release needs review.",
              "Inspect VERSION_MISMATCH and current import/publication lineage. Do not overwrite an active import or bypass approval.",
              "Installed and selected versions, import run, publication revision and state."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "The safe message expresses impact and next action; error code, bounded failure detail and correlation remain secondary authorized evidence. `available:false` repair metadata describes an owner handoff, not a button Axis may execute. Honor repairActions, requiresConfirmation, automatic and permissions from the latest DTO. Refresh after repair; only replay an available owner operation against the same selected profile/release once its blockers are resolved. This guide describes backend source contracts, not verified Axis browser behavior."
        },
        {
          "kind": "paragraph",
          "text": "Use `Error Handling and Status Codes` for the backend contract behind these states. The owning backend module defines the stable status code, HTTP status, public message, localization metadata, and safe evidence. Axis consumes the normalized setup DTO and displays the business-safe outcome."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Setup flow",
          "anchor": "applicationsAxisSetupErrorContracts-4-setup-flow"
        },
        {
          "kind": "code",
          "language": "text",
          "text": "1. Read the profile-owned initialization status with the original authenticated BackOffice request.\n2. Inspect readiness, preparation, publication and exact Media qualification together.\n3. Present businessStatus and safe blockers; restrict diagnostics by audience.\n4. Use only available backend-declared actions; obtain required human confirmation.\n5. For an unscoped profile, require every required publication CURRENT before operational contributions. For a scoped profile, select one owned AFTER_PUBLICATION stage: all publications for that signed operator must be CURRENT before its selected DATA_RELEASE, even while foreign stages keep aggregate readiness BLOCKED.\n6. Refresh exact profile status after effects; HTTP success, an installed receipt or an Online CMS baseline alone is not whole-application READY."
        },
        {
          "kind": "paragraph",
          "text": "Configuration matters, but it should be expressed as capability metadata and runtime health, not frontend assumptions. When a release version is required, BackOffice must validate it before dispatching work. When a content catalog is missing, the response should identify the missing catalog in technical evidence and phrase the UI message as a setup problem that needs data repair."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and extension guidance",
          "anchor": "applicationsAxisSetupErrorContracts-5-customization-and-extension-guidance"
        },
        {
          "kind": "paragraph",
          "text": "Developers can extend setup by adding new BackOffice capability providers, initialization targets, evidence fields, and status mappers. Keep the mapper near the owning backend service so Axis does not duplicate business rules. Business users can customize through Axis only when a capability exposes a governed operation. Operators can add observability by carrying request ids, profile code, baseline code, target runtime, release folder, import run id, and publication code through the response."
        },
        {
          "kind": "paragraph",
          "text": "New frontend panels should consume a normalized setup DTO. They should not parse exception text. If a new backend error code is introduced, the owning service should also define the safe headline, business detail, severity, recoverability, retry action, and evidence payload."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "applicationsAxisSetupErrorContracts-6-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Rendering raw error codes as the main business message.",
            "Letting Axis infer data ownership from component names.",
            "Making retry buttons available when the backend says the capability is blocked by configuration or missing data.",
            "Hiding technical evidence from administrators and operators.",
            "Returning a generic internal error when the backend can identify a missing release, catalog, module, or target runtime."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "applicationsAxisSetupErrorContracts-7-verification"
        },
        {
          "kind": "paragraph",
          "text": "Test setup with a fresh schema and intentionally broken data. Confirm that Axis shows friendly setup states, BackOffice logs keep technical evidence, retry behavior is gated by capability state, and production-facing users never see stack traces or unknown framework codes. Run the BackOffice application initialization tests and the Axis live smoke checks after each setup contract change."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Preparation phases and an already Online baseline",
          "anchor": "axis-setup-publication-phases"
        },
        {
          "kind": "paragraph",
          "text": "An application can have a published CMS baseline while its business setup is still incomplete. Think of opening the shop display before the stock intake and campaign admission have finished: the display can be Online without the whole offering being ready. BackOffice projects the profile-owned facts; Axis displays them and invokes only the currently authorized actions. No frontend label grants publication, Inventory or Promotion authority."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TD\n  Before[\"BEFORE data CURRENT; Media metadata SOURCE_READY admitted\"] --> CMS[\"CMS READY / ONLINE and exact Media qualified\"]\n  CMS --> Mode{\"Scoped operator stages?\"}\n  Mode -->|no| Global[\"Every required publication CURRENT\"]\n  Global --> Legacy[\"Existing unscoped operational setup\"]\n  Mode -->|yes| Select[\"Explicit one owned afterPublicationStepCode\"]\n  Select --> Type{\"Selected stage type\"}\n  Type -->|GOVERNED_PUBLICATIONS| Submit[\"Submit only this owner plan; normal review\"]\n  Type -->|DATA_RELEASE| Own{\"All same-operator publications CURRENT?\"}\n  Own -->|no| Wait[\"Owner review; no operational write\"]\n  Own -->|yes| Install[\"Singleton owner preflight and selected install\"]\n  Submit --> Fresh[\"Fresh CMS / Media / all-stage status\"]\n  Install --> Fresh\n  Legacy --> Fresh\n  Fresh --> Foreign[\"Foreign AUTHORITY_PENDING or exact-plan read-only proof\"]\n  Foreign --> Complete{\"Every required stage freshly CURRENT?\"}\n  Complete -->|no| Block[\"Aggregate BLOCKED / incomplete; local action may remain available\"]\n  Complete -->|yes| Ready[\"Readiness READY; existing businessStatus mapper\"]"
        },
        {
          "kind": "paragraph",
          "text": "normalizePreparationStep accepts BEFORE_PUBLICATION and AFTER_PUBLICATION. Media manifests are before publication; GOVERNED_PUBLICATIONS are after publication. Required BEFORE DATA_RELEASE installation must be CURRENT; owner-admitted BEFORE MEDIA_ASSET_MANIFEST metadata may be SOURCE_READY while aggregate preparation.status is CURRENT. That metadata does not verify stored bytes or Online activation. Separately, CMS must report READY with publication.state ONLINE, qualified exact Media and a non-invalid release before deferred owner work is admitted. Unscoped profiles retain the all-required-publications barrier. Scoped profiles instead require every publication belonging to the original signed operator CURRENT before that operator's operational DATA_RELEASE; foreign pending stages do not deny this local admission and do not become CURRENT. Fixed secured nPublish /publications/setup/status and /submit validate exact intended membership. Submission requests normal governed review and never approves on behalf of an independent approver."
        },
        {
          "kind": "table",
          "headers": [
            "Fresh evidence",
            "Meaning for Axis",
            "Permitted next step"
          ],
          "rows": [
            [
              "CMS Online; deferred owner publication NOT_INSTALLED",
              "Offering setup still needs a declared owner submission.",
              "For a scoped profile use the available INITIALIZE with exactly the owned publication stage selector. Unscoped profiles keep existing INITIALIZE; normal approval is still required."
            ],
            [
              "Owner publication REVIEW_REQUIRED / VALIDATION_BLOCKED",
              "The owning publication or prerequisite needs review.",
              "Show the safe blocker; resolve through the owner, not a fabricated success flag."
            ],
            [
              "Owner publication RUNNING",
              "Work or approval remains pending.",
              "Refresh and inspect; do not repeatedly submit to probe health."
            ],
            [
              "Scoped operator publications CURRENT; its selected DATA_RELEASE actionable (or all publications CURRENT for an unscoped profile)",
              "The original operator may install its one declared operational contribution; foreign stages may keep the aggregate BLOCKED.",
              "Fresh owner preflight, explicit selected INITIALIZE and confirmation, then fresh status and original group receipts."
            ],
            [
              "Foreign AUTHORITY_PENDING",
              "No fresh authorized foreign proof; not an import failure, optional stage or CURRENT receipt.",
              "Keep the stage visible. Use that operator's own authorized session for actions, or separately adopted exact-plan aggregate observation for reads only."
            ],
            [
              "Required contribution UNKNOWN or failed validation",
              "No complete operational readiness proof.",
              "Retain bounded ownerBlocker/failureCode and resolve the source/owner prerequisite."
            ],
            [
              "All required BEFORE data CURRENT and owner-admitted BEFORE Media SOURCE_READY; required AFTER stages CURRENT plus separate CMS/Media qualification",
              "Only then can the application be READY.",
              "Use current backend mapping/actions; browser and provider acceptance remain separate."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "When an unscoped baseline is already READY/ONLINE/CURRENT and no explicit refresh or unpinned-Media repair is required, initiate can reuse it instead of requesting another CMS approval. A selected scoped AFTER action only reads the existing baseline and ignores forceRefresh for CMS; it cannot prepare BEFORE data, upload Media or request another CMS approval. Without a selector a scoped initialize never submits or installs AFTER stages, although independently authorized normal BEFORE/CMS initialization retains its lifecycle. Actionable deferred work can offer INITIALIZE even while aggregate readiness is BLOCKED. capabilityBusinessStatus still checks Media/preparation before its existing readiness mapping: do not relabel the aggregate ONLINE from a successful selected write or treat an IMPORTED/APPROVAL_REQUIRED label as proof that only CMS approval is missing."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Safe deferred setup diagnostics and recovery",
          "anchor": "axis-deferred-setup-recovery"
        },
        {
          "kind": "paragraph",
          "text": "Expose the safe headline and bounded technical code to the appropriate audience. runtimeDiagnostic may identify a fixed phase, target module and safe failureCode; contribution ownerBlocker identifies its readiness refusal. Neither is permission to display raw provider errors, private publicationPlan, paths, credentials or retained intent. A transport error is not proof of an empty owner result. Disabled repair metadata remains a handoff, not an executable Axis action."
        },
        {
          "kind": "ordered-list",
          "items": [
            "Read fresh profile status with the original authenticated human; retain profile, baseline, correlation, selected release identity and current phase evidence.",
            "Resolve required BEFORE preparation and normal CMS/Media approvals first. selectionRequired:false and selectableStepCodes:[] before those gates is not permission for a selected AFTER write; narrow Commerce groups cannot bootstrap CMS.",
            "After admission, inspect preparation.selectionRequired and selectableStepCodes together with all required steps and allowedActions. For scoped setup, choose exactly one currently actionable same-operator code; an empty list is an honest owner handoff or no available stage, not a bulk retry.",
            "Submit a selected GOVERNED_PUBLICATIONS stage through its owner and let normal independent review finish. Before selecting a DATA_RELEASE, reread all of that operator's publication roots as CURRENT, then let nImport perform the singleton current preflight with the original human authority. Foreign AUTHORITY_PENDING does not block this local admission or prove foreign completion.",
            "After effects, refresh CMS, exact Media and full preparation membership; retain group/import receipts, selected code, exact release/version/checksum and owner publication revision/workflow references. HTTP success and SOURCE_READY do not prove installed CURRENT or whole-profile READY.",
            "After timeout, ambiguous result, partial failure or changed source/plan, preserve original receipts and correlation. Restore the specific owner, reread its current revisions and status, then authorize only a still-actionable original selected stage. Do not blindly retry, reset receipts, mint replacement intake keys, force approval or change identities to manufacture proof."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customize and verify phased setup",
          "anchor": "axis-setup-phase-customization"
        },
        {
          "kind": "paragraph",
          "text": "A project can declare its existing profile dataPackages and required phases using supported DATA_RELEASE, MEDIA_ASSET_MANIFEST and GOVERNED_PUBLICATIONS shapes. For example, keep catalog and Media preparation before the baseline, add an owner-reviewed Commerce publication plan after it, then an explicitly selected operational intake on COMMERCE. Reuse the profile service, fixed owner transport and normal authorization; never add an Axis registry or frontend dependency executor. Keep publicationPlan private and validate required target/runtime identities."
        },
        {
          "kind": "paragraph",
          "text": "Test absence of deferred writes before CMS/Media qualification, exact publication membership, pending/review/failed owner states, current-baseline reuse, actionable INITIALIZE, contribution blockers and fresh post-execution status. Verify partial success is retained and malformed/foreign owner evidence fails closed. Run Axis browser loading, confirmation, disabled-action and safe-message acceptance separately. Source contracts and Local sandbox receipts do not qualify Card payments, physical shipment or a production provider."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Select one signed operator stage",
          "anchor": "axis-signed-operator-selection"
        },
        {
          "kind": "paragraph",
          "text": "A scoped profile declares operatorEnterpriseCode on each required AFTER_PUBLICATION step, with unique release codes and at most 256 required stages. BEFORE steps cannot carry that field; mixing scoped and unscoped required AFTER steps rejects. The field is an exact enterprise restriction, not an identity, permission grant or Profile scope. The existing POST /applications/:profileCode/initialization/initiate accepts afterPublicationStepCode naming exactly one configured required AFTER stage. Arrays, optional/unknown/BEFORE stages, duplicates and foreign selections reject before owner calls; prepare, content-pack install, reconcile, rollback and retire reject selection. Status may carry the selector for inspection, never execution."
        },
        {
          "kind": "code",
          "language": "json",
          "text": "{\n  \"afterPublicationStepCode\": \"partner:issuerBudget\",\n  \"reason\": \"Reviewed original issuer budget\",\n  \"correlationId\": \"original-issuer-budget-request\"\n}"
        },
        {
          "kind": "paragraph",
          "text": "This is a shape-only example, not an installed release or grant. Replace the illustrative code only with an exact backend-declared actionable code in the reviewed profile. The request must retain a signed human access token, principal, matching routed/signed tenant, exact signed operator enterprise and agreeing tenant/enterprise aliases, plus the original bounded Bearer. Customer, refresh, service and system principals refuse. Do not send an enterprise override, bearer replacement, plan, target, release version or qualification in the body. Controller projection carries only this selector and existing reason/correlation/forceRefresh inputs; selected AFTER work ignores forceRefresh for CMS."
        },
        {
          "kind": "paragraph",
          "text": "The initiate route admits runtimeConfigAdminUserGroup plus the narrow commerceSetupPublisherUserGroup and commerceCouponIssuerUserGroup, still with backoffice.application.initialization.initiate and access-token authentication. assertInitiationScope resolves inherited groups before owner reads. Narrow group admission requires the matching explicit signed-operator AFTER selector, even against a legacy profile or a fresh/pending CMS baseline; it never grants ordinary BEFORE/CMS bootstrap. Independently held runtime administrator authority retains its own lifecycle. nPublish, nImport and domain owners separately enforce their current grants, Profile scope, source, consent, budgets and issuance prerequisites. A selector cannot approve consent or combine budget and issuance into one batch."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Read selection metadata without losing pending authority",
          "anchor": "axis-selection-and-authority-pending"
        },
        {
          "kind": "paragraph",
          "text": "Read phase and type as well as status. Required BEFORE DATA_RELEASE receipts must prove installed CURRENT. BEFORE MEDIA_ASSET_MANIFEST can return owner-admitted SOURCE_READY from fresh persisted CURRENT metadata (or its exact reviewed shared observation), allowing aggregate preparation.status CURRENT. Its metadata read explicitly reports storedBytesVerified:false and does not publish or verify physical bytes. CMS must separately be READY/ONLINE with exact mediaDependencies.qualified=true. Do not label healthy before-publication Media metadata a blocker merely because its individual status is SOURCE_READY. This exception is not operational completion: AFTER SOURCE_READY never proves installed CURRENT, and whole readiness still needs every required AFTER stage's fresh CURRENT evidence."
        },
        {
          "kind": "table",
          "headers": [
            "Backend observation",
            "Safe operator meaning",
            "Next action and boundary"
          ],
          "rows": [
            [
              "BEFORE incomplete, CMS pending/non-Online or Media unqualified; selectionRequired:false, selectableStepCodes:[]",
              "Prerequisites are not admitted for deferred work.",
              "Normal authorized BEFORE/CMS initialization may remain available without a selector; a direct selected AFTER call still enforces all gates."
            ],
            [
              "After admission; selectionRequired:true and bounded selectableStepCodes",
              "One explicit stage must be chosen for scoped AFTER mutation. Only actionable owned NOT_INSTALLED, UPDATE_AVAILABLE or FAILED stages appear.",
              "Intersect fresh allowedActions and source-backed stage metadata with current permissions; never infer a bulk action. Own DATA_RELEASE entries require all own publications CURRENT."
            ],
            [
              "selectionRequired:true with an empty selectableStepCodes list",
              "No stage is currently actionable for this operator, or owner evidence refuses.",
              "Inspect RUNNING, review and owner blockers; refresh read-only status. Do not invent a selector or switch signed enterprise aliases."
            ],
            [
              "Required foreign stage AUTHORITY_PENDING",
              "Awaiting separately authorized evidence, not failed installation and not CURRENT.",
              "Keep every required stage in preparation.steps. Foreign human owners are not queried/submitted with this operator's bearer."
            ],
            [
              "Selected local stage succeeds while aggregate readiness BLOCKED",
              "Local admission and whole-profile readiness are different decisions.",
              "Retain original singleton receipts; inspect all remaining stages. INITIALIZE can remain available for another explicit owned stage without implying READY."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "For a publication selector only that stage reaches nPublish /submit; other same-operator publications are status-only. For a DATA_RELEASE selector only that release reaches singleton validation/execution after fresh same-operator publication admission. Unselected initialization never writes AFTER stages. Installation triggers a fresh full invocation to recheck CMS/Media and owner status without automatic write retry, preserving groupReceipts and operation diagnostics. An AFTER SOURCE_READY observation is not installed CURRENT."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Aggregate-only exact-plan observation",
          "anchor": "axis-aggregate-read-observation"
        },
        {
          "kind": "paragraph",
          "text": "An ordinary human setup view cannot prove a foreign operator's completion. Without separately adopted observation authority, foreign required stages remain AUTHORITY_PENDING even if a colleague or browser remembers success. The existing exact-plan service observer is disabled by default and requires explicit reviewed deployment/profile adoption; its implementation is not evidence that a policy, service assignment, grant or token is installed. Preserve the original human view permission and request; never impersonate the foreign operator or add financial grants to a viewer."
        },
        {
          "kind": "paragraph",
          "text": "When explicitly enabled, Platform validates the complete current effective profile and every required descriptor before and after dispatch. The fixed nPublish /publications/setup/observe path requires a verified short-lived revocable service principal and exact tenant, deployment assignment, destination, plan code/revision/checksum, profile/baseline, stage, enterprise and canonical runtime binding. The module-confined owner plan binds the exact publication roots, source membership/revisions and installed module/release/version/payload identity. Publication source/target/source checks reject operation or digest drift; installation observation freshly checks original exact receipts and declared source bytes. Missing, denied, malformed, changed, ambiguous or unavailable evidence is non-CURRENT, with bounded allowlisted reasonCode (unknown failures ERR_BOF_00083), never raw owner messages or source payloads."
        },
        {
          "kind": "paragraph",
          "text": "The same explicitly adopted authority may observe required shared BEFORE installation/Media and the selected scoped CMS baseline; it derives the current prerequisites and cannot bypass failed shared proof. Aggregate proof affects only aggregate readiness. It cannot submit publications, install data, select a stage, approve, create wallets, spend budgets or issue coupons. The selected local action still needs the original signed operator, explicit singleton selector and fresh domain preflight. Each aggregate request rereads owner evidence; no remembered browser result or cross-request CURRENT cache is authority. Sequential reads are not a global transaction, and minimal installed-release observation is not current financial/business qualification."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verify selected-stage recovery",
          "anchor": "axis-selected-stage-verification"
        },
        {
          "kind": "paragraph",
          "text": "Extend the existing profile only in approved project-owned layered config/properties.js using the supported dataPackages shape: for example a required AFTER_PUBLICATION GOVERNED_PUBLICATIONS partner:issuerPublication followed by DATA_RELEASE partner:issuerBudget, both scoped to the existing exact operatorEnterpriseCode, with their owner-declared target server/runtime and release identity. Keep the plan in its canonical module-owned data and select one code from fresh backend metadata. A second foreign operator remains a separate signed stage. Do not copy a framework profile, expose private publicationPlan, add a parallel loader, change owner permissions or weaken publication/Media gates. The existing initialization and setup-observation contracts, not this illustrative pair, define admissible declarations."
        },
        {
          "kind": "unordered-list",
          "items": [
            "Run applicationContributionReadiness.test.js with existing preparation-order/receipt tests: wrong tenant, principal, alias, bearer, foreign/optional/unknown selector and narrow-group omission must reject before owner calls.",
            "Test pre-admission false/empty selection metadata and normal authorized BEFORE/CMS recovery; admitted true/empty must not offer a fabricated bulk retry.",
            "Test own-current plus foreign AUTHORITY_PENDING: exactly one owned DATA_RELEASE installs, other stages remain visible and aggregate remains incomplete. Test each publication root, current owner preflight, no consent bypass and no other AFTER write.",
            "Test disabled/denied/mismatched/revoked exact-plan observer, source/target operation drift and a second read after owner state changes. Observation must make no publication/import/financial writes and never replace local admission.",
            "After timeout or partial installation retain original group receipts, diagnostic and exact release keys, recover the owner and refresh all gates before a confirmed still-actionable stage. Test that stale CURRENT, HTTP success and SOURCE_READY cannot close readiness.",
            "Run separate Axis browser confirmation, loading/disabled-action and safe-message acceptance plus native signed-deployment/read qualification. Source tests and installed-release observation do not prove business end-to-end completion, Card payment, shipment or provider acceptance."
          ]
        }
      ],
      "searchText": "Axis Setup and User-Safe Error Contracts How Axis presents setup, retry, blocker, and initialization errors with safe business messages while preserving technical evidence for operators. # Axis Setup and User-Safe Error Contracts\n\nAxis is the business-facing backoffice journey for setup, governance, and operation. It should help a business user initialize accelerators, inspect status, retry failed work, and navigate to the right owner without exposing raw framework exceptions. Axis is not the authority for catalogs, pages, media, products, prices, inventory, or documentation data. It consumes BackOffice capability metadata and runtime evidence, then presents a safe operator experience. For beginners, select the intended application profile and read its business status before choosing an action. Follow only enabled backend-declared repair actions, preserving the displayed release and approval references. If a blocker has no executable action, use its safe message and authorized technical evidence to reach the named owner; repeatedly clicking retry is not a repair procedure.\n\n## Source map\n\n| Owner operation | Framework source and boundary |\n| --- | --- |\n| Setup projection and repairs | `nodics.platform/modules/backoffice/src/service/defaultBackofficeApplicationInitializationService.js`: `capabilityBusinessStatus`, `capabilityRepairProjection`, `invoke`. |\n| Authenticated setup routes | `nodics.platform/modules/backoffice/src/router/routers.js`: initialization status and mutation routes; permissions and human-administrator checks remain backend-owned. |\n| Backend error contract | Canonical guide `foundation.error-handling-status-codes`; stable public messages are distinct from authorized diagnostic evidence. Axis frontend installation is a separate application concern, not a framework-owned source path. |\n\n## State model\n\n```mermaid\nflowchart TD\n  Facts[\"Readiness, preparation, publication, Media\"] --> Mapper[\"BackOffice capabilityBusinessStatus\"]\n  Mapper --> Pending[\"NOT_PREPARED / PREPARING\"]\n  Mapper --> Approval[\"APPROVAL_REQUIRED / APPROVAL_IN_PROGRESS\"]\n  Mapper --> Ready[\"PREPARED_STAGED / ONLINE / RETIRED\"]\n  Mapper --> Attention[\"NEEDS_ATTENTION\"]\n  Attention --> Repairs[\"Backend-declared repairActions, not universal Retry\"]\n```\n\nThe diagram names backend businessStatus values, not frontend lifecycle authority. `capabilityBusinessStatus` applies guards in order: missing projection, unqualified Media dependencies, or preparation outside CURRENT/RUNNING yields NEEDS_ATTENTION before readiness is considered. Then RETIRED maps to RETIRED; READY without publication.state ONLINE maps to NEEDS_ATTENTION; READY with confirmed ONLINE maps to ONLINE unless releaseStatus is UPDATE_AVAILABLE, which maps to NEEDS_ATTENTION. PUBLICATION_PENDING maps to APPROVAL_IN_PROGRESS, IMPORTED to APPROVAL_REQUIRED, IMPORTING to PREPARING, NOT_IMPORTED to NOT_PREPARED, and ROLLED_BACK to PREPARED_STAGED; remaining cases need attention. A publication label alone therefore cannot establish Online readiness.\n\n## Error contract\n\n| Blocker / safe operator message | Allowed action and replay precondition | Authorized evidence |\n| --- | --- | --- |\n| INVALID_MANIFEST / Application release needs repair. | `source.releaseManifest.repair` is a non-executable owner handoff. Fix the selected release, then refresh readiness; repeated initialization does not repair source. | Profile, release item, validation failure, correlation; no raw exception in primary UI. |\n| READINESS_VALIDATION_BLOCKED / Setup prerequisites need attention. | REVIEW_SETUP_PREREQUISITES is unavailable as automatic repair. Resolve validation findings before another governed setup attempt. | Validation result and required owner; preserve current release binding. |\n| READINESS_UNAVAILABLE or READINESS_UNKNOWN / Setup status could not be checked. | REFRESH_READINESS via applicationInitialization.status is read-only and available. For READINESS_RATE_LIMITED wait before refresh; do not initiate publication to probe health. | Bounded target diagnostic, failure code and correlation; infrastructure addresses belong only in authorized support detail. |\n| MODULE_INACTIVE or RUNTIME_UNAVAILABLE / Required capability is unavailable. | moduleRegistry.activate or runtimeTopology.restoreRuntime is an unavailable automatic repair, with confirmation required for owner-managed change. Restore and reread status. | Module, runtime role, owner availability; action metadata is not a frontend executable URL. |\n| MEDIA_DEPENDENCY_* / Required media is not ready. | MEDIA_MISSING/MEDIA_UNPUBLISHED may offer prepareCapability; VERSION_UNPINNED requires confirmed initialization. Other retained-publication repair requires owner inspection and confirmation, automatic:false. | Exact Media version/checksum/manifest, dependency status, qualification; never substitute any latest asset. |\n| UPDATE_AVAILABLE / A newer application release needs review. | Inspect VERSION_MISMATCH and current import/publication lineage. Do not overwrite an active import or bypass approval. | Installed and selected versions, import run, publication revision and state. |\n\nThe safe message expresses impact and next action; error code, bounded failure detail and correlation remain secondary authorized evidence. `available:false` repair metadata describes an owner handoff, not a button Axis may execute. Honor repairActions, requiresConfirmation, automatic and permissions from the latest DTO. Refresh after repair; only replay an available owner operation against the same selected profile/release once its blockers are resolved. This guide describes backend source contracts, not verified Axis browser behavior.\n\nUse `Error Handling and Status Codes` for the backend contract behind these states. The owning backend module defines the stable status code, HTTP status, public message, localization metadata, and safe evidence. Axis consumes the normalized setup DTO and displays the business-safe outcome.\n\n## Setup flow\n\n```text\n1. Read the profile-owned initialization status with the original authenticated BackOffice request.\n2. Inspect readiness, preparation, publication and exact Media qualification together.\n3. Present businessStatus and safe blockers; restrict diagnostics by audience.\n4. Use only available backend-declared actions; obtain required human confirmation.\n5. For an unscoped profile, require every required publication CURRENT before operational contributions. For a scoped profile, select one owned AFTER_PUBLICATION stage: all publications for that signed operator must be CURRENT before its selected DATA_RELEASE, even while foreign stages keep aggregate readiness BLOCKED.\n6. Refresh exact profile status after effects; HTTP success, an installed receipt or an Online CMS baseline alone is not whole-application READY.\n```\n\nConfiguration matters, but it should be expressed as capability metadata and runtime health, not frontend assumptions. When a release version is required, BackOffice must validate it before dispatching work. When a content catalog is missing, the response should identify the missing catalog in technical evidence and phrase the UI message as a setup problem that needs data repair.\n\n## Customization and extension guidance\n\nDevelopers can extend setup by adding new BackOffice capability providers, initialization targets, evidence fields, and status mappers. Keep the mapper near the owning backend service so Axis does not duplicate business rules. Business users can customize through Axis only when a capability exposes a governed operation. Operators can add observability by carrying request ids, profile code, baseline code, target runtime, release folder, import run id, and publication code through the response.\n\nNew frontend panels should consume a normalized setup DTO. They should not parse exception text. If a new backend error code is introduced, the owning service should also define the safe headline, business detail, severity, recoverability, retry action, and evidence payload.\n\n## Common mistakes\n\n- Rendering raw error codes as the main business message.\n- Letting Axis infer data ownership from component names.\n- Making retry buttons available when the backend says the capability is blocked by configuration or missing data.\n- Hiding technical evidence from administrators and operators.\n- Returning a generic internal error when the backend can identify a missing release, catalog, module, or target runtime.\n\n## Verification\n\nTest setup with a fresh schema and intentionally broken data. Confirm that Axis shows friendly setup states, BackOffice logs keep technical evidence, retry behavior is gated by capability state, and production-facing users never see stack traces or unknown framework codes. Run the BackOffice application initialization tests and the Axis live smoke checks after each setup contract change.\n\n## Preparation phases and an already Online baseline\n\nAn application can have a published CMS baseline while its business setup is still incomplete. Think of opening the shop display before the stock intake and campaign admission have finished: the display can be Online without the whole offering being ready. BackOffice projects the profile-owned facts; Axis displays them and invokes only the currently authorized actions. No frontend label grants publication, Inventory or Promotion authority.\n\n```mermaid\nflowchart TD\n  Before[\"BEFORE data CURRENT; Media metadata SOURCE_READY admitted\"] --> CMS[\"CMS READY / ONLINE and exact Media qualified\"]\n  CMS --> Mode{\"Scoped operator stages?\"}\n  Mode -->|no| Global[\"Every required publication CURRENT\"]\n  Global --> Legacy[\"Existing unscoped operational setup\"]\n  Mode -->|yes| Select[\"Explicit one owned afterPublicationStepCode\"]\n  Select --> Type{\"Selected stage type\"}\n  Type -->|GOVERNED_PUBLICATIONS| Submit[\"Submit only this owner plan; normal review\"]\n  Type -->|DATA_RELEASE| Own{\"All same-operator publications CURRENT?\"}\n  Own -->|no| Wait[\"Owner review; no operational write\"]\n  Own -->|yes| Install[\"Singleton owner preflight and selected install\"]\n  Submit --> Fresh[\"Fresh CMS / Media / all-stage status\"]\n  Install --> Fresh\n  Legacy --> Fresh\n  Fresh --> Foreign[\"Foreign AUTHORITY_PENDING or exact-plan read-only proof\"]\n  Foreign --> Complete{\"Every required stage freshly CURRENT?\"}\n  Complete -->|no| Block[\"Aggregate BLOCKED / incomplete; local action may remain available\"]\n  Complete -->|yes| Ready[\"Readiness READY; existing businessStatus mapper\"]\n```\n\nnormalizePreparationStep accepts BEFORE_PUBLICATION and AFTER_PUBLICATION. Media manifests are before publication; GOVERNED_PUBLICATIONS are after publication. Required BEFORE DATA_RELEASE installation must be CURRENT; owner-admitted BEFORE MEDIA_ASSET_MANIFEST metadata may be SOURCE_READY while aggregate preparation.status is CURRENT. That metadata does not verify stored bytes or Online activation. Separately, CMS must report READY with publication.state ONLINE, qualified exact Media and a non-invalid release before deferred owner work is admitted. Unscoped profiles retain the all-required-publications barrier. Scoped profiles instead require every publication belonging to the original signed operator CURRENT before that operator's operational DATA_RELEASE; foreign pending stages do not deny this local admission and do not become CURRENT. Fixed secured nPublish /publications/setup/status and /submit validate exact intended membership. Submission requests normal governed review and never approves on behalf of an independent approver.\n\n| Fresh evidence | Meaning for Axis | Permitted next step |\n| --- | --- | --- |\n| CMS Online; deferred owner publication NOT_INSTALLED | Offering setup still needs a declared owner submission. | For a scoped profile use the available INITIALIZE with exactly the owned publication stage selector. Unscoped profiles keep existing INITIALIZE; normal approval is still required. |\n| Owner publication REVIEW_REQUIRED / VALIDATION_BLOCKED | The owning publication or prerequisite needs review. | Show the safe blocker; resolve through the owner, not a fabricated success flag. |\n| Owner publication RUNNING | Work or approval remains pending. | Refresh and inspect; do not repeatedly submit to probe health. |\n| Scoped operator publications CURRENT; its selected DATA_RELEASE actionable (or all publications CURRENT for an unscoped profile) | The original operator may install its one declared operational contribution; foreign stages may keep the aggregate BLOCKED. | Fresh owner preflight, explicit selected INITIALIZE and confirmation, then fresh status and original group receipts. |\n| Foreign AUTHORITY_PENDING | No fresh authorized foreign proof; not an import failure, optional stage or CURRENT receipt. | Keep the stage visible. Use that operator's own authorized session for actions, or separately adopted exact-plan aggregate observation for reads only. |\n| Required contribution UNKNOWN or failed validation | No complete operational readiness proof. | Retain bounded ownerBlocker/failureCode and resolve the source/owner prerequisite. |\n| All required BEFORE data CURRENT and owner-admitted BEFORE Media SOURCE_READY; required AFTER stages CURRENT plus separate CMS/Media qualification | Only then can the application be READY. | Use current backend mapping/actions; browser and provider acceptance remain separate. |\n\nWhen an unscoped baseline is already READY/ONLINE/CURRENT and no explicit refresh or unpinned-Media repair is required, initiate can reuse it instead of requesting another CMS approval. A selected scoped AFTER action only reads the existing baseline and ignores forceRefresh for CMS; it cannot prepare BEFORE data, upload Media or request another CMS approval. Without a selector a scoped initialize never submits or installs AFTER stages, although independently authorized normal BEFORE/CMS initialization retains its lifecycle. Actionable deferred work can offer INITIALIZE even while aggregate readiness is BLOCKED. capabilityBusinessStatus still checks Media/preparation before its existing readiness mapping: do not relabel the aggregate ONLINE from a successful selected write or treat an IMPORTED/APPROVAL_REQUIRED label as proof that only CMS approval is missing.\n\n## Safe deferred setup diagnostics and recovery\n\nExpose the safe headline and bounded technical code to the appropriate audience. runtimeDiagnostic may identify a fixed phase, target module and safe failureCode; contribution ownerBlocker identifies its readiness refusal. Neither is permission to display raw provider errors, private publicationPlan, paths, credentials or retained intent. A transport error is not proof of an empty owner result. Disabled repair metadata remains a handoff, not an executable Axis action.\n\n1. Read fresh profile status with the original authenticated human; retain profile, baseline, correlation, selected release identity and current phase evidence.\n2. Resolve required BEFORE preparation and normal CMS/Media approvals first. selectionRequired:false and selectableStepCodes:[] before those gates is not permission for a selected AFTER write; narrow Commerce groups cannot bootstrap CMS.\n3. After admission, inspect preparation.selectionRequired and selectableStepCodes together with all required steps and allowedActions. For scoped setup, choose exactly one currently actionable same-operator code; an empty list is an honest owner handoff or no available stage, not a bulk retry.\n4. Submit a selected GOVERNED_PUBLICATIONS stage through its owner and let normal independent review finish. Before selecting a DATA_RELEASE, reread all of that operator's publication roots as CURRENT, then let nImport perform the singleton current preflight with the original human authority. Foreign AUTHORITY_PENDING does not block this local admission or prove foreign completion.\n5. After effects, refresh CMS, exact Media and full preparation membership; retain group/import receipts, selected code, exact release/version/checksum and owner publication revision/workflow references. HTTP success and SOURCE_READY do not prove installed CURRENT or whole-profile READY.\n6. After timeout, ambiguous result, partial failure or changed source/plan, preserve original receipts and correlation. Restore the specific owner, reread its current revisions and status, then authorize only a still-actionable original selected stage. Do not blindly retry, reset receipts, mint replacement intake keys, force approval or change identities to manufacture proof.\n\n## Customize and verify phased setup\n\nA project can declare its existing profile dataPackages and required phases using supported DATA_RELEASE, MEDIA_ASSET_MANIFEST and GOVERNED_PUBLICATIONS shapes. For example, keep catalog and Media preparation before the baseline, add an owner-reviewed Commerce publication plan after it, then an explicitly selected operational intake on COMMERCE. Reuse the profile service, fixed owner transport and normal authorization; never add an Axis registry or frontend dependency executor. Keep publicationPlan private and validate required target/runtime identities.\n\nTest absence of deferred writes before CMS/Media qualification, exact publication membership, pending/review/failed owner states, current-baseline reuse, actionable INITIALIZE, contribution blockers and fresh post-execution status. Verify partial success is retained and malformed/foreign owner evidence fails closed. Run Axis browser loading, confirmation, disabled-action and safe-message acceptance separately. Source contracts and Local sandbox receipts do not qualify Card payments, physical shipment or a production provider.\n\n## Select one signed operator stage\n\nA scoped profile declares operatorEnterpriseCode on each required AFTER_PUBLICATION step, with unique release codes and at most 256 required stages. BEFORE steps cannot carry that field; mixing scoped and unscoped required AFTER steps rejects. The field is an exact enterprise restriction, not an identity, permission grant or Profile scope. The existing POST /applications/:profileCode/initialization/initiate accepts afterPublicationStepCode naming exactly one configured required AFTER stage. Arrays, optional/unknown/BEFORE stages, duplicates and foreign selections reject before owner calls; prepare, content-pack install, reconcile, rollback and retire reject selection. Status may carry the selector for inspection, never execution.\n\n```json\n{\n  \"afterPublicationStepCode\": \"partner:issuerBudget\",\n  \"reason\": \"Reviewed original issuer budget\",\n  \"correlationId\": \"original-issuer-budget-request\"\n}\n```\n\nThis is a shape-only example, not an installed release or grant. Replace the illustrative code only with an exact backend-declared actionable code in the reviewed profile. The request must retain a signed human access token, principal, matching routed/signed tenant, exact signed operator enterprise and agreeing tenant/enterprise aliases, plus the original bounded Bearer. Customer, refresh, service and system principals refuse. Do not send an enterprise override, bearer replacement, plan, target, release version or qualification in the body. Controller projection carries only this selector and existing reason/correlation/forceRefresh inputs; selected AFTER work ignores forceRefresh for CMS.\n\nThe initiate route admits runtimeConfigAdminUserGroup plus the narrow commerceSetupPublisherUserGroup and commerceCouponIssuerUserGroup, still with backoffice.application.initialization.initiate and access-token authentication. assertInitiationScope resolves inherited groups before owner reads. Narrow group admission requires the matching explicit signed-operator AFTER selector, even against a legacy profile or a fresh/pending CMS baseline; it never grants ordinary BEFORE/CMS bootstrap. Independently held runtime administrator authority retains its own lifecycle. nPublish, nImport and domain owners separately enforce their current grants, Profile scope, source, consent, budgets and issuance prerequisites. A selector cannot approve consent or combine budget and issuance into one batch.\n\n## Read selection metadata without losing pending authority\n\nRead phase and type as well as status. Required BEFORE DATA_RELEASE receipts must prove installed CURRENT. BEFORE MEDIA_ASSET_MANIFEST can return owner-admitted SOURCE_READY from fresh persisted CURRENT metadata (or its exact reviewed shared observation), allowing aggregate preparation.status CURRENT. Its metadata read explicitly reports storedBytesVerified:false and does not publish or verify physical bytes. CMS must separately be READY/ONLINE with exact mediaDependencies.qualified=true. Do not label healthy before-publication Media metadata a blocker merely because its individual status is SOURCE_READY. This exception is not operational completion: AFTER SOURCE_READY never proves installed CURRENT, and whole readiness still needs every required AFTER stage's fresh CURRENT evidence.\n\n| Backend observation | Safe operator meaning | Next action and boundary |\n| --- | --- | --- |\n| BEFORE incomplete, CMS pending/non-Online or Media unqualified; selectionRequired:false, selectableStepCodes:[] | Prerequisites are not admitted for deferred work. | Normal authorized BEFORE/CMS initialization may remain available without a selector; a direct selected AFTER call still enforces all gates. |\n| After admission; selectionRequired:true and bounded selectableStepCodes | One explicit stage must be chosen for scoped AFTER mutation. Only actionable owned NOT_INSTALLED, UPDATE_AVAILABLE or FAILED stages appear. | Intersect fresh allowedActions and source-backed stage metadata with current permissions; never infer a bulk action. Own DATA_RELEASE entries require all own publications CURRENT. |\n| selectionRequired:true with an empty selectableStepCodes list | No stage is currently actionable for this operator, or owner evidence refuses. | Inspect RUNNING, review and owner blockers; refresh read-only status. Do not invent a selector or switch signed enterprise aliases. |\n| Required foreign stage AUTHORITY_PENDING | Awaiting separately authorized evidence, not failed installation and not CURRENT. | Keep every required stage in preparation.steps. Foreign human owners are not queried/submitted with this operator's bearer. |\n| Selected local stage succeeds while aggregate readiness BLOCKED | Local admission and whole-profile readiness are different decisions. | Retain original singleton receipts; inspect all remaining stages. INITIALIZE can remain available for another explicit owned stage without implying READY. |\n\nFor a publication selector only that stage reaches nPublish /submit; other same-operator publications are status-only. For a DATA_RELEASE selector only that release reaches singleton validation/execution after fresh same-operator publication admission. Unselected initialization never writes AFTER stages. Installation triggers a fresh full invocation to recheck CMS/Media and owner status without automatic write retry, preserving groupReceipts and operation diagnostics. An AFTER SOURCE_READY observation is not installed CURRENT.\n\n## Aggregate-only exact-plan observation\n\nAn ordinary human setup view cannot prove a foreign operator's completion. Without separately adopted observation authority, foreign required stages remain AUTHORITY_PENDING even if a colleague or browser remembers success. The existing exact-plan service observer is disabled by default and requires explicit reviewed deployment/profile adoption; its implementation is not evidence that a policy, service assignment, grant or token is installed. Preserve the original human view permission and request; never impersonate the foreign operator or add financial grants to a viewer.\n\nWhen explicitly enabled, Platform validates the complete current effective profile and every required descriptor before and after dispatch. The fixed nPublish /publications/setup/observe path requires a verified short-lived revocable service principal and exact tenant, deployment assignment, destination, plan code/revision/checksum, profile/baseline, stage, enterprise and canonical runtime binding. The module-confined owner plan binds the exact publication roots, source membership/revisions and installed module/release/version/payload identity. Publication source/target/source checks reject operation or digest drift; installation observation freshly checks original exact receipts and declared source bytes. Missing, denied, malformed, changed, ambiguous or unavailable evidence is non-CURRENT, with bounded allowlisted reasonCode (unknown failures ERR_BOF_00083), never raw owner messages or source payloads.\n\nThe same explicitly adopted authority may observe required shared BEFORE installation/Media and the selected scoped CMS baseline; it derives the current prerequisites and cannot bypass failed shared proof. Aggregate proof affects only aggregate readiness. It cannot submit publications, install data, select a stage, approve, create wallets, spend budgets or issue coupons. The selected local action still needs the original signed operator, explicit singleton selector and fresh domain preflight. Each aggregate request rereads owner evidence; no remembered browser result or cross-request CURRENT cache is authority. Sequential reads are not a global transaction, and minimal installed-release observation is not current financial/business qualification.\n\n## Verify selected-stage recovery\n\nExtend the existing profile only in approved project-owned layered config/properties.js using the supported dataPackages shape: for example a required AFTER_PUBLICATION GOVERNED_PUBLICATIONS partner:issuerPublication followed by DATA_RELEASE partner:issuerBudget, both scoped to the existing exact operatorEnterpriseCode, with their owner-declared target server/runtime and release identity. Keep the plan in its canonical module-owned data and select one code from fresh backend metadata. A second foreign operator remains a separate signed stage. Do not copy a framework profile, expose private publicationPlan, add a parallel loader, change owner permissions or weaken publication/Media gates. The existing initialization and setup-observation contracts, not this illustrative pair, define admissible declarations.\n\n- Run applicationContributionReadiness.test.js with existing preparation-order/receipt tests: wrong tenant, principal, alias, bearer, foreign/optional/unknown selector and narrow-group omission must reject before owner calls.\n- Test pre-admission false/empty selection metadata and normal authorized BEFORE/CMS recovery; admitted true/empty must not offer a fabricated bulk retry.\n- Test own-current plus foreign AUTHORITY_PENDING: exactly one owned DATA_RELEASE installs, other stages remain visible and aggregate remains incomplete. Test each publication root, current owner preflight, no consent bypass and no other AFTER write.\n- Test disabled/denied/mismatched/revoked exact-plan observer, source/target operation drift and a second read after owner state changes. Observation must make no publication/import/financial writes and never replace local admission.\n- After timeout or partial installation retain original group receipts, diagnostic and exact release keys, recover the owner and refresh all gates before a confirmed still-actionable stage. Test that stale CURRENT, HTTP success and SOURCE_READY cannot close readiness.\n- Run separate Axis browser confirmation, loading/disabled-action and safe-message acceptance plus native signed-deployment/read qualification. Source tests and installed-release observation do not prove business end-to-end completion, Card payment, shipment or provider acceptance.\n",
      "previous": {
        "title": "Nexus Data and Content Guide",
        "route": "/docs/framework/applications-nexus-data-content-guide"
      },
      "next": {
        "title": "CMS Source Map and Authoring Contract",
        "route": "/docs/framework/wcms-cms-source-map-authoring-contract"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.platform",
        "technicalModule": "backoffice",
        "owner": "backoffice",
        "sourcePath": "data/docs-v001/records/documentation/backofficeDocumentationRelease002ComponentData.js",
        "path": "data/docs-v001/records/documentation/backofficeDocumentationRelease002ComponentData.js",
        "wordCount": 3468,
        "checksum": "7fb31e7cc0c723abdaa8f5876bd76b58454f7db5428b3c602ebc5b5998d43cde"
      },
      "slug": "applications-axis-setup-error-contracts",
      "locale": "en",
      "navigationGroup": "Setup and Accelerators",
      "navigationGroupCode": "setup-and-accelerators",
      "navigationGroupOrder": 20,
      "navigationOrder": 10,
      "references": [
        {
          "documentId": "axis.business-customization",
          "owner": "backoffice"
        },
        {
          "documentId": "platform.module-registry",
          "owner": "backoffice"
        },
        {
          "documentId": "framework.fresh-schema-setup-journey",
          "owner": "nTooling"
        },
        {
          "documentId": "applications.suite",
          "owner": "nodics.docs"
        },
        {
          "documentId": "promotion.campaigns-coupon-issuance",
          "owner": "promotion"
        },
        {
          "documentId": "cart.customer-intent-calculation",
          "owner": "cart"
        },
        {
          "documentId": "digital.purchase-delivery-reveal",
          "owner": "digitalCore"
        },
        {
          "documentId": "inventory.stock-management",
          "owner": "inventory",
          "anchor": "inventory-opening-stock-packs"
        }
      ]
    },
    "active": true
  },
  "record3": {
    "code": "nodicsDocsComponentplatformModuleRegistryJourney",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "platform.module-registry-journey",
      "title": "Module Registry Journey",
      "route": "/docs/framework/platform-module-registry-journey",
      "section": "capability-registry-and-lifecycle-management",
      "sectionTitle": "Capability Registry and Lifecycle Management",
      "group": "capability-registry-and-lifecycle-management",
      "groupTitle": "Capability Registry and Lifecycle Management",
      "parentId": "capability-registry-and-lifecycle-management",
      "hierarchyPath": [
        "Capability Registry and Lifecycle Management",
        "Module Registry Journey"
      ],
      "hierarchyDepth": 2,
      "documentType": "operations",
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
      "summary": "How installed modules become registered, activated, dependency-checked, and visible to Axis as governed business capabilities.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "STAGED",
      "version": "0.16.7",
      "maturityState": "operational",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "platform.module-registry",
        "applications.axis-setup-error-contracts",
        "framework.module-loading-service-precedence"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "package.json",
        "src/service/registry/defaultBackofficeCapabilityRegistryService.js",
        "src/service/registry/defaultBackofficeRegistryStoreService.js",
        "src/service/discovery/defaultBackofficeDiscoveryService.js",
        "test/backofficeRegistryRouteContract.test.js",
        "src/service/registry/defaultFunctionalModuleCatalogueService.js",
        "src/service/registry/defaultBackofficeRegistryService.js",
        "test/navigationModuleAvailability.test.js",
        "../../../nodics.waste/modules/wasteCore/src/service/defaultWasteBackofficeCapabilityService.js",
        "src/schemas",
        "src/service"
      ],
      "visualRequirements": [
        "diagram",
        "table",
        "code-example",
        "troubleshooting-matrix"
      ],
      "searchKeywords": [
        "module-registry",
        "backoffice",
        "activation",
        "dependency",
        "axis"
      ],
      "topicKeywords": [
        "Capability Registry and Lifecycle Management",
        "Module Registry Foundations",
        "Module Registry Journey"
      ],
      "headings": [
        {
          "text": "Source map",
          "anchor": "platformModuleRegistryJourney-1-source-map",
          "level": 2
        },
        {
          "text": "Lifecycle",
          "anchor": "platformModuleRegistryJourney-2-lifecycle",
          "level": 2
        },
        {
          "text": "Registry contract",
          "anchor": "platformModuleRegistryJourney-3-registry-contract",
          "level": 2
        },
        {
          "text": "Dependency and activation rules",
          "anchor": "platformModuleRegistryJourney-4-dependency-and-activation-rules",
          "level": 2
        },
        {
          "text": "Customization and extension guidance",
          "anchor": "platformModuleRegistryJourney-5-customization-and-extension-guidance",
          "level": 2
        },
        {
          "text": "Read the registry without confusing its states",
          "anchor": "platformModuleRegistryJourney-6-read-the-registry-without-confusing-its-states",
          "level": 2
        },
        {
          "text": "Axis administrator walkthrough",
          "anchor": "platformModuleRegistryJourney-7-axis-administrator-walkthrough",
          "level": 2
        },
        {
          "text": "Example: unavailable target, independent action",
          "anchor": "platformModuleRegistryJourney-8-example-unavailable-target-independent-action",
          "level": 3
        },
        {
          "text": "Customize and extend safely",
          "anchor": "platformModuleRegistryJourney-9-customize-and-extend-safely",
          "level": 2
        },
        {
          "text": "Narrow an existing provider in a project overlay",
          "anchor": "platformModuleRegistryJourney-10-narrow-an-existing-provider-in-a-project-overlay",
          "level": 3
        },
        {
          "text": "Tune catalogue page size without changing eligibility",
          "anchor": "platformModuleRegistryJourney-11-tune-catalogue-page-size-without-changing-eligibility",
          "level": 3
        },
        {
          "text": "Non-customizable security and ownership",
          "anchor": "platformModuleRegistryJourney-12-non-customizable-security-and-ownership",
          "level": 3
        },
        {
          "text": "Troubleshooting and recovery",
          "anchor": "platformModuleRegistryJourney-13-troubleshooting-and-recovery",
          "level": 2
        },
        {
          "text": "Repeatable acceptance examples",
          "anchor": "platformModuleRegistryJourney-14-repeatable-acceptance-examples",
          "level": 2
        },
        {
          "text": "Revision conflict during activation",
          "anchor": "platformModuleRegistryJourney-15-revision-conflict-during-activation",
          "level": 3
        },
        {
          "text": "Implementation handoff",
          "anchor": "platformModuleRegistryJourney-16-implementation-handoff",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "platformModuleRegistryJourney-17-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "platformModuleRegistryJourney-18-verification",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "The Module Registry journey explains how Nodics turns installed modules into visible, governed business capabilities. Axis can show a module, dependency, activation, and setup state, but BackOffice owns the registry contract and the backend modules own their schemas, data, routes, and services. For beginners, think of the registry as the map that tells Axis what exists, what is active, what is blocked, and which action is allowed next."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Source map",
          "anchor": "platformModuleRegistryJourney-1-source-map"
        },
        {
          "kind": "table",
          "headers": [
            "Area",
            "Source location"
          ],
          "rows": [
            [
              "BackOffice module package",
              "`package.json`"
            ],
            [
              "Capability registry service",
              "`src/service/registry/defaultBackofficeCapabilityRegistryService.js`"
            ],
            [
              "Registry store",
              "`src/service/registry/defaultBackofficeRegistryStoreService.js`"
            ],
            [
              "Discovery service",
              "`src/service/discovery/defaultBackofficeDiscoveryService.js`"
            ],
            [
              "Registry route tests",
              "`test/backofficeRegistryRouteContract.test.js`"
            ],
            [
              "Functional lifecycle and complete paging",
              "`src/service/registry/defaultFunctionalModuleCatalogueService.js`"
            ],
            [
              "Effective navigation and target availability",
              "`src/service/registry/defaultBackofficeRegistryService.js`"
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Lifecycle",
          "anchor": "platformModuleRegistryJourney-2-lifecycle"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TD\n  Installed[\"Installed package\"] --> Discovered[\"Discovered module\"]\n  Discovered --> Registered[\"Registered capability\"]\n  Registered --> Activated[\"Activated presentation and required data\"]\n  Activated --> Visible[\"Axis visible\"]\n  Registered --> Blocked[\"Dependency blocked\"]\n  Blocked --> Activated"
        },
        {
          "kind": "paragraph",
          "text": "The business problem is confidence: an administrator needs to know whether a capability is ready before asking a team to use it. Developers need a reliable place to expose module metadata without giving Axis direct ownership of source contracts. Operators need dependency evidence, activation state, and recovery actions before production use."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Registry contract",
          "anchor": "platformModuleRegistryJourney-3-registry-contract"
        },
        {
          "kind": "paragraph",
          "text": "Each capability should expose stable identity, display metadata, owner module, dependency requirements, runtime role, route availability, allowed actions, and health state. BackOffice normalizes this into Axis-friendly data. Axis should render sections, cards, badges, disabled actions, and setup messages from that contract instead of hardcoding module rules."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "// Existing module-owned navigation contract, published through getCapability().\nconst navigationItem = {\n  id: 'enterprises',\n  label: 'Enterprises',\n  route: '/profile/enterprises',\n  workbenchTarget: { moduleName: 'profile', schemaName: 'enterprise' },\n  requiredPermissions: ['profile.enterprise.read']\n};"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Dependency and activation rules",
          "anchor": "platformModuleRegistryJourney-4-dependency-and-activation-rules"
        },
        {
          "kind": "paragraph",
          "text": "Required modules represent local runtime dependencies. Remote runtime needs, such as Online publication targets, should be represented separately as target availability or integration readiness. This distinction matters in production because a module can be locally active while its publication target is unavailable. Business users should see the impact. Developers should see the owner and missing dependency. Operators should see a retry or repair path."
        },
        {
          "kind": "paragraph",
          "text": "Nodics should not introduce a second sequencing framework for functional modules when the runtime already has one. BackOffice should project the functional module's package `index` as `moduleIndex`, and Axis should use that value for stable visual ordering. The project environment should use existing `nodics.extends` metadata to load local module groups in dependency order. Existing backend activation-data configuration remains available for genuine whole-module prerequisites. Do not use it to block an entire optional group because one feature calls another module. The standard Accelerators umbrella does not require Commerce and Discovery; selected industry groups retain their actual inheritance. Likewise, Location is not a whole-Waste activation gate."
        },
        {
          "kind": "paragraph",
          "text": "BackOffice evaluates the publishing module and `workbenchTarget.moduleName` against authorized availability. Lifecycle actions use their existing `ownerModule`. Missing targets disable the affected item or action and supply an explanation through `help.summary` or action `summary`; unrelated actions remain usable. Recompute this after published menu overrides, so saved presentation never freezes a module's old availability."
        },
        {
          "kind": "paragraph",
          "text": "Internal integrations remain enforced by the owning API/provider. For example, an approval-required operation cannot succeed without its approval authority, even if the rest of its module is available. Declared partial read enrichment may degrade; required references and mutations never silently succeed."
        },
        {
          "kind": "paragraph",
          "text": "Use the existing metadata and service override paths, not a new dependency catalogue or configuration layer. Keep package indexes for loading, runtime leases for observed availability, and human registration/activation for presentation enablement. None is a substitute for target API permissions."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and extension guidance",
          "anchor": "platformModuleRegistryJourney-5-customization-and-extension-guidance"
        },
        {
          "kind": "paragraph",
          "text": "Developers can add new capability providers, discovery adapters, registry fields, and readiness checks. Keep activation logic in BackOffice or the owning module service. Customer projects can add metadata for their modules without changing Axis navigation code. AI tools should update registry tests whenever they add a new capability status, dependency type, or user action."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Read the registry without confusing its states",
          "anchor": "platformModuleRegistryJourney-6-read-the-registry-without-confusing-its-states"
        },
        {
          "kind": "paragraph",
          "text": "An administrator should read registration, enablement, runtime health and data readiness separately. A healthy process can advertise an optional module that the business has not chosen to activate. Conversely, a registered module can retain its records while all its observed instances are offline."
        },
        {
          "kind": "table",
          "headers": [
            "Observation",
            "Meaning",
            "Next useful action"
          ],
          "rows": [
            [
              "Available for registration",
              "Discovered functional capability is not yet registered in this scope.",
              "Review ownership, prerequisites and activation-data impact before Register."
            ],
            [
              "Registered but disabled",
              "Registration exists; business presentation is not enabled.",
              "Review activation readiness and permissions."
            ],
            [
              "Runtime ACTIVE with Disabled presentation",
              "Runtime observation and administrator choice differ; this is possible.",
              "Do not interpret runtime health as activation."
            ],
            [
              "Required",
              "Protected foundation of the standard experience.",
              "Do not use optional-module removal to bypass foundational requirements."
            ],
            [
              "Blocked",
              "A prerequisite has failed in the relevant lifecycle.",
              "Read the named blocker and owner, not only the blocker count."
            ],
            [
              "No observed runtime",
              "No currently usable observation establishes availability.",
              "Inspect Module Health and the responsible deployment."
            ],
            [
              "Feature disabled with a target reason",
              "A particular owner/target is unavailable.",
              "Restore that owner or choose an independent operation."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "The standard protected roots are Foundation, Platform and WCMS. Process and Localization are optional, but an operation requiring their authority still fails closed. A change from protected to optional preserves an existing registration and its enabled state; it does not uninstall or disable it."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Axis administrator walkthrough",
          "anchor": "platformModuleRegistryJourney-7-axis-administrator-walkthrough"
        },
        {
          "kind": "paragraph",
          "text": "Prerequisites: an authenticated employee in the intended project and tenant, permissions for the chosen registry action, a connected BackOffice, and a disposable test environment for activation or failure exercises. Ordinary business users need access only to their assigned operations, not registry administration. Never share an administrator session to make an example work."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TD\n  registry[\"Module Registry\"] --> inspect[\"Expand module\"]\n  inspect --> evidence[\"Review evidence\"]\n  evidence --> blocked[\"Action blocked?\"]\n  blocked -->|\"Yes\"| reason[\"Read reason\"]\n  reason --> repair[\"Repair and refresh\"]\n  repair --> evidence\n  blocked -->|\"No\"| register[\"Register if needed\"]\n  register --> activation[\"Review activation\"]\n  activation --> navigation[\"Verify operation\"]"
        },
        {
          "kind": "paragraph",
          "text": "This screen flow is the visual companion to the steps below. It represents the implemented journey, not a screenshot of a particular tenant. Labels and counts can differ with the authorized project, installed modules and release."
        },
        {
          "kind": "ordered-list",
          "items": [
            "Open **System & Integrations**, then **Module Registry**. Confirm the intended environment before any mutation.",
            "Expand the module. Read the registration state, enabled/disabled state, observed servers, technical members and activation-data status independently.",
            "For an available optional module, review **Register**. Registration and activation are distinct operations; do not assume one authorizes the other.",
            "When blocked, identify the named prerequisite and its current state. A whole-module prerequisite must be genuine; a single optional remote feature is not a reason to force an unrelated business group to activate.",
            "After successful registration, review the allowed activation action and its data impact. Execute only in the intended scope with the required authority.",
            "Refresh and inspect navigation. An inactive module should not reappear from an old published menu. An enabled publisher may still contain a disabled target-dependent action.",
            "Open the relevant business operation and verify its API outcome. Navigation presence is useful evidence, but not proof that create, save, approve or publish completed successfully."
          ]
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Example: unavailable target, independent action",
          "anchor": "platformModuleRegistryJourney-8-example-unavailable-target-independent-action"
        },
        {
          "kind": "paragraph",
          "text": "Suppose a module-owned page has a read target and two declared lifecycle actions. The save action is owned by that same target; a second action belongs to a different module. If only the second action's owner is unavailable, the page and save action stay available, subject to their existing permissions. BackOffice marks the second action disabled and supplies its reason. If the page's required target disappears, the page itself is disabled."
        },
        {
          "kind": "paragraph",
          "text": "This metadata fragment illustrates the existing contract. `recordOwner` and `approvalOwner` are placeholders for real technical module identities, not new functional modules to install or literal production configuration:"
        },
        {
          "kind": "code",
          "language": "js",
          "text": "const item = {\n  id: 'project-records',\n  featureState: 'ACTIVE',\n  workbenchTarget: { moduleName: 'recordOwner', schemaName: 'record' },\n  lifecycleActions: [\n    { id: 'save', ownerModule: 'recordOwner', featureState: 'ACTIVE' },\n    { id: 'approve', ownerModule: 'approvalOwner', featureState: 'ACTIVE' }\n  ]\n};"
        },
        {
          "kind": "paragraph",
          "text": "Add these fields to an actual provider's existing, validated navigation/action contract. This fragment deliberately omits API bindings, route, labels and permissions; it is not a complete executable capability provider. The backend uses the publishing module, `workbenchTarget.moduleName`, and action `ownerModule`. It does not discover every secondary integration hidden inside an arbitrary API implementation. Those integrations remain service-owned."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customize and extend safely",
          "anchor": "platformModuleRegistryJourney-9-customize-and-extend-safely"
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Narrow an existing provider in a project overlay",
          "anchor": "platformModuleRegistryJourney-10-narrow-an-existing-provider-in-a-project-overlay"
        },
        {
          "kind": "paragraph",
          "text": "Example outcome: a project wants to label the Waste collection-centre entry **Collection Sites**, without renaming Waste, changing references, or editing Axis code. Start with an existing project module loaded after Waste Core on the runtime that publishes its capability. Its ownership metadata must allow the service contribution, and its local composition must select the provider being extended. A new file in an unselected module has no effect."
        },
        {
          "kind": "paragraph",
          "text": "Place the following method override at `modules/<projectModule>/src/service/defaultWasteBackofficeCapabilityService.js`. The filename preserves the existing service identity. Inherited lifecycle, `capabilityData()` and `buildCapability()` methods remain framework-owned:"
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  getCapability: function () {\n    const effective = this.buildCapability(this.capabilityData());\n    return Object.assign({}, effective, {\n      navigation: effective.navigation.map(item =>\n        item.id === 'waste-collection-centres'\n          ? Object.assign({}, item, { label: 'Collection Sites' })\n          : item\n      )\n    });\n  }\n};"
        },
        {
          "kind": "paragraph",
          "text": "This is a method-level example, not a full module scaffold. Keep the module's standard copyright, JSDoc, package metadata and tests when adopting it. The override changes only the label in a fresh projection. It preserves IDs, permissions, workbench targets, parent relationships, action owners and registration under the framework functional identity."
        },
        {
          "kind": "ordered-list",
          "items": [
            "Confirm the effective service is the merged project provider, using the normal runtime service/load evidence rather than requiring framework source files directly from the project.",
            "Test the provider with and without the project override. Only the selected label should differ. Repeated calls must not mutate shared source data.",
            "Test an unauthorized user and an unavailable target: the custom label must not make either case usable.",
            "If a governed published menu already overrides this label, it can still take presentation precedence. Review that menu through the normal publication journey; do not bypass it with hardcoded Axis navigation.",
            "For rollback, remove the project method override, rebuild/restart its owning runtime and refresh discovery. Restore any separately published label change through the owning publication lifecycle, not a database edit."
          ]
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Tune catalogue page size without changing eligibility",
          "anchor": "platformModuleRegistryJourney-11-tune-catalogue-page-size-without-changing-eligibility"
        },
        {
          "kind": "paragraph",
          "text": "The existing `backofficeFunctionalModuleCatalogue.eligibilityPageSize` property defaults to 256. Set it in the normal project/server configuration layer hosting BackOffice; use the worked 128-record example in Modular Architecture and Ownership. This controls backend page size, not the maximum number of modules shown. A project with 513 catalogue records must still return all scoped records. Smaller pages trade more requests for smaller per-request payloads; the final aggregate still occupies memory. This is not streaming or a guarantee of unbounded catalogue size."
        },
        {
          "kind": "paragraph",
          "text": "Custom discovery and provider adapters must preserve project, tenant and authorization context on every page. A failed later page is not an empty final page. Never reconcile all unseen records as offline from an incomplete read."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Non-customizable security and ownership",
          "anchor": "platformModuleRegistryJourney-12-non-customizable-security-and-ownership"
        },
        {
          "kind": "paragraph",
          "text": "Projects cannot use a saved menu to restore a missing provider, replace backend authorization with a frontend flag, or auto-enable a disabled registration on a heartbeat. The same requirements apply after published navigation overrides. New module-owned navigation must be supplied by the authorized provider before it is eligible for published presentation; arbitrary saved IDs are not a way to create business capabilities."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Troubleshooting and recovery",
          "anchor": "platformModuleRegistryJourney-13-troubleshooting-and-recovery"
        },
        {
          "kind": "table",
          "headers": [
            "Symptom",
            "Check",
            "Safe correction and proof"
          ],
          "rows": [
            [
              "Optional module is healthy but absent from left navigation",
              "Registration, enabled state and employee permissions.",
              "Complete the authorized lifecycle or assign proper access; do not add static menu entries."
            ],
            [
              "Target action is disabled",
              "Named target/owner, authorized readiness, provider configuration.",
              "Restore the required owner and refresh; test the actual API afterward."
            ],
            [
              "Blocked only because an unrelated optional group is missing",
              "Existing activation-data prerequisites and real local composition.",
              "Correct the owning project metadata if the dependency is artificial; retain genuine prerequisites."
            ],
            [
              "Old menu still appears after deactivation",
              "Current effective navigation versus saved presentation.",
              "Refresh backend projection and verify source-provider eligibility; do not erase business data."
            ],
            [
              "Some modules disappear from a large catalogue",
              "Page-size settings, full-page traversal, failed later requests.",
              "Fix the failed scoped read; verify last-page records and reconciliation."
            ],
            [
              "One runtime replaces another runtime's technical members",
              "Live lease set and aggregate functional identity.",
              "Verify union of active observations and pruning of expired members."
            ],
            [
              "Recovery did not activate a module",
              "Persisted disabled state.",
              "Expected behavior: activation remains an explicit administrator decision."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Capture correlation identifiers, module identity and sanitized backend errors. Do not include bearer tokens, employee secrets or unrelated customer records in support screenshots. A lease view describes observed instances, not a complete inventory of every process an operator intended to deploy."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Repeatable acceptance examples",
          "anchor": "platformModuleRegistryJourney-14-repeatable-acceptance-examples"
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Revision conflict during activation",
          "anchor": "platformModuleRegistryJourney-15-revision-conflict-during-activation"
        },
        {
          "kind": "paragraph",
          "text": "`catalogueRevision` is the optimistic token for an administrator decision, not a counter of heartbeats. Changing runtime membership or an observation timestamp does not invalidate a decision. Changing registration, enablement, protection, registered version or the advertised activation-package policy does. An activation also checks runtime presence at its final conditional write, so a runtime lost during import cannot produce a successful enablement."
        },
        {
          "kind": "paragraph",
          "text": "Example: Commerce Online and Commerce Staged advertise the same release code. Their different target servers are separate observations, not alternating replacements of one package. After both observations arrive, repeated heartbeats converge. A target's successful import receipt cannot satisfy another target's failed import. Historical receipts are matched only to their recorded target."
        },
        {
          "kind": "paragraph",
          "text": "If another administrator changes the module while activation is in progress, the action still fails its revision check. Axis refreshes the catalogue and clears the old success message; it does not silently retry a mutation. Review the current registration and activation receipts before retrying. An import can have completed before a final decision conflict, so a failed activation is not proof that all data operations rolled back."
        },
        {
          "kind": "paragraph",
          "text": "For project customization, the existing `backofficeFunctionalModuleActivationData.modules[functionalModule].dataPackages` descriptors override observed descriptors for the same release code. Put a verified target in the BackOffice-hosting project configuration, not in Axis. Retain the real release code accepted by nImport. If a project intentionally requires multiple targets for one release, supply those target-specific descriptors in that existing array. Do not invent another routing file. Removing the override restores observed routing; review the resulting plan and rerun readiness before activation. Configuration rollback does not undo imports."
        },
        {
          "kind": "paragraph",
          "text": "Verify alternating heartbeats, two target-specific receipts, project routing precedence, runtime loss during import and two administrators using the same revision:"
        },
        {
          "kind": "code",
          "language": "bash",
          "text": "node --test nodics.platform/modules/backoffice/test/functionalModuleConcurrency.test.js"
        },
        {
          "kind": "paragraph",
          "text": "Run these non-live tests from the framework root:"
        },
        {
          "kind": "code",
          "language": "bash",
          "text": "node --test nodics.platform/modules/backoffice/test/navigationModuleAvailability.test.js\nnode --test nodics.platform/modules/backoffice/test/functionalModuleLifecyclePagination.test.js"
        },
        {
          "kind": "paragraph",
          "text": "For a project overlay, add tests for unchanged framework identity, the renamed label, retained permission requirements, missing/restored targets, and unchanged shared provider data. Exercise paging at 0, 1, page-size, page-size plus 1 and multiple pages. Include two runtimes contributing different technical members."
        },
        {
          "kind": "paragraph",
          "text": "For browser qualification, run the administrator walkthrough with a permitted user and a restricted user in an isolated environment. Record registration, activation, independent-operation and rejected-operation results separately. Do not mutate the user's live installation merely to capture a failure screen. No source-only test or screenshot proves every business operation was qualified."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Implementation handoff",
          "anchor": "platformModuleRegistryJourney-16-implementation-handoff"
        },
        {
          "kind": "paragraph",
          "text": "When a new module is added, the handoff should include package metadata, runtime role, visible capability name, dependency list, health signal, setup actions, and documentation page references. That makes the registry useful to business users who need a clear journey, developers who need extension points, operators who need production readiness, and QA owners who need repeatable acceptance checks."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "platformModuleRegistryJourney-17-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Treating frontend menu entries as module activation evidence.",
            "Mixing local required modules with remote API target availability.",
            "Hiding dependency failures behind a generic setup error.",
            "Adding registry fields without route and service tests.",
            "Letting a business action appear enabled before required capability checks pass."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "platformModuleRegistryJourney-18-verification"
        },
        {
          "kind": "paragraph",
          "text": "Run BackOffice registry, discovery, capability, and availability tests. Then use an isolated test environment, initialize module data, open Axis, and confirm the registry view shows active, blocked, and unavailable states with safe messages. Test optional targets absent, present, lost and restored without resetting business records. Include more than one catalogue page and multiple runtime instances: all lifecycle listings and lease reconciliation must read complete pages, and one instance must not erase another instance's technical members. Production readiness requires business clarity, developer source traceability, operator evidence, and repeatable QA checks."
        }
      ],
      "searchText": "Module Registry Journey How installed modules become registered, activated, dependency-checked, and visible to Axis as governed business capabilities. # Module Registry Journey\n\nThe Module Registry journey explains how Nodics turns installed modules into visible, governed business capabilities. Axis can show a module, dependency, activation, and setup state, but BackOffice owns the registry contract and the backend modules own their schemas, data, routes, and services. For beginners, think of the registry as the map that tells Axis what exists, what is active, what is blocked, and which action is allowed next.\n\n## Source map\n\n| Area | Source location |\n| --- | --- |\n| BackOffice module package | `package.json` |\n| Capability registry service | `src/service/registry/defaultBackofficeCapabilityRegistryService.js` |\n| Registry store | `src/service/registry/defaultBackofficeRegistryStoreService.js` |\n| Discovery service | `src/service/discovery/defaultBackofficeDiscoveryService.js` |\n| Registry route tests | `test/backofficeRegistryRouteContract.test.js` |\n| Functional lifecycle and complete paging | `src/service/registry/defaultFunctionalModuleCatalogueService.js` |\n| Effective navigation and target availability | `src/service/registry/defaultBackofficeRegistryService.js` |\n\n## Lifecycle\n\n```mermaid\nflowchart TD\n  Installed[\"Installed package\"] --> Discovered[\"Discovered module\"]\n  Discovered --> Registered[\"Registered capability\"]\n  Registered --> Activated[\"Activated presentation and required data\"]\n  Activated --> Visible[\"Axis visible\"]\n  Registered --> Blocked[\"Dependency blocked\"]\n  Blocked --> Activated\n```\n\nThe business problem is confidence: an administrator needs to know whether a capability is ready before asking a team to use it. Developers need a reliable place to expose module metadata without giving Axis direct ownership of source contracts. Operators need dependency evidence, activation state, and recovery actions before production use.\n\n## Registry contract\n\nEach capability should expose stable identity, display metadata, owner module, dependency requirements, runtime role, route availability, allowed actions, and health state. BackOffice normalizes this into Axis-friendly data. Axis should render sections, cards, badges, disabled actions, and setup messages from that contract instead of hardcoding module rules.\n\n```js\n// Existing module-owned navigation contract, published through getCapability().\nconst navigationItem = {\n  id: 'enterprises',\n  label: 'Enterprises',\n  route: '/profile/enterprises',\n  workbenchTarget: { moduleName: 'profile', schemaName: 'enterprise' },\n  requiredPermissions: ['profile.enterprise.read']\n};\n```\n\n## Dependency and activation rules\n\nRequired modules represent local runtime dependencies. Remote runtime needs, such as Online publication targets, should be represented separately as target availability or integration readiness. This distinction matters in production because a module can be locally active while its publication target is unavailable. Business users should see the impact. Developers should see the owner and missing dependency. Operators should see a retry or repair path.\n\nNodics should not introduce a second sequencing framework for functional modules when the runtime already has one. BackOffice should project the functional module's package `index` as `moduleIndex`, and Axis should use that value for stable visual ordering. The project environment should use existing `nodics.extends` metadata to load local module groups in dependency order. Existing backend activation-data configuration remains available for genuine whole-module prerequisites. Do not use it to block an entire optional group because one feature calls another module. The standard Accelerators umbrella does not require Commerce and Discovery; selected industry groups retain their actual inheritance. Likewise, Location is not a whole-Waste activation gate.\n\nBackOffice evaluates the publishing module and `workbenchTarget.moduleName` against authorized availability. Lifecycle actions use their existing `ownerModule`. Missing targets disable the affected item or action and supply an explanation through `help.summary` or action `summary`; unrelated actions remain usable. Recompute this after published menu overrides, so saved presentation never freezes a module's old availability.\n\nInternal integrations remain enforced by the owning API/provider. For example, an approval-required operation cannot succeed without its approval authority, even if the rest of its module is available. Declared partial read enrichment may degrade; required references and mutations never silently succeed.\n\nUse the existing metadata and service override paths, not a new dependency catalogue or configuration layer. Keep package indexes for loading, runtime leases for observed availability, and human registration/activation for presentation enablement. None is a substitute for target API permissions.\n\n## Customization and extension guidance\n\nDevelopers can add new capability providers, discovery adapters, registry fields, and readiness checks. Keep activation logic in BackOffice or the owning module service. Customer projects can add metadata for their modules without changing Axis navigation code. AI tools should update registry tests whenever they add a new capability status, dependency type, or user action.\n\n## Read the registry without confusing its states\n\nAn administrator should read registration, enablement, runtime health and data readiness separately. A healthy process can advertise an optional module that the business has not chosen to activate. Conversely, a registered module can retain its records while all its observed instances are offline.\n\n| Observation | Meaning | Next useful action |\n| --- | --- | --- |\n| Available for registration | Discovered functional capability is not yet registered in this scope. | Review ownership, prerequisites and activation-data impact before Register. |\n| Registered but disabled | Registration exists; business presentation is not enabled. | Review activation readiness and permissions. |\n| Runtime ACTIVE with Disabled presentation | Runtime observation and administrator choice differ; this is possible. | Do not interpret runtime health as activation. |\n| Required | Protected foundation of the standard experience. | Do not use optional-module removal to bypass foundational requirements. |\n| Blocked | A prerequisite has failed in the relevant lifecycle. | Read the named blocker and owner, not only the blocker count. |\n| No observed runtime | No currently usable observation establishes availability. | Inspect Module Health and the responsible deployment. |\n| Feature disabled with a target reason | A particular owner/target is unavailable. | Restore that owner or choose an independent operation. |\n\nThe standard protected roots are Foundation, Platform and WCMS. Process and Localization are optional, but an operation requiring their authority still fails closed. A change from protected to optional preserves an existing registration and its enabled state; it does not uninstall or disable it.\n\n## Axis administrator walkthrough\n\nPrerequisites: an authenticated employee in the intended project and tenant, permissions for the chosen registry action, a connected BackOffice, and a disposable test environment for activation or failure exercises. Ordinary business users need access only to their assigned operations, not registry administration. Never share an administrator session to make an example work.\n\n```mermaid\nflowchart TD\n  registry[\"Module Registry\"] --> inspect[\"Expand module\"]\n  inspect --> evidence[\"Review evidence\"]\n  evidence --> blocked[\"Action blocked?\"]\n  blocked -->|\"Yes\"| reason[\"Read reason\"]\n  reason --> repair[\"Repair and refresh\"]\n  repair --> evidence\n  blocked -->|\"No\"| register[\"Register if needed\"]\n  register --> activation[\"Review activation\"]\n  activation --> navigation[\"Verify operation\"]\n```\n\nThis screen flow is the visual companion to the steps below. It represents the implemented journey, not a screenshot of a particular tenant. Labels and counts can differ with the authorized project, installed modules and release.\n\n1. Open **System & Integrations**, then **Module Registry**. Confirm the intended environment before any mutation.\n2. Expand the module. Read the registration state, enabled/disabled state, observed servers, technical members and activation-data status independently.\n3. For an available optional module, review **Register**. Registration and activation are distinct operations; do not assume one authorizes the other.\n4. When blocked, identify the named prerequisite and its current state. A whole-module prerequisite must be genuine; a single optional remote feature is not a reason to force an unrelated business group to activate.\n5. After successful registration, review the allowed activation action and its data impact. Execute only in the intended scope with the required authority.\n6. Refresh and inspect navigation. An inactive module should not reappear from an old published menu. An enabled publisher may still contain a disabled target-dependent action.\n7. Open the relevant business operation and verify its API outcome. Navigation presence is useful evidence, but not proof that create, save, approve or publish completed successfully.\n\n### Example: unavailable target, independent action\n\nSuppose a module-owned page has a read target and two declared lifecycle actions. The save action is owned by that same target; a second action belongs to a different module. If only the second action's owner is unavailable, the page and save action stay available, subject to their existing permissions. BackOffice marks the second action disabled and supplies its reason. If the page's required target disappears, the page itself is disabled.\n\nThis metadata fragment illustrates the existing contract. `recordOwner` and `approvalOwner` are placeholders for real technical module identities, not new functional modules to install or literal production configuration:\n\n```js\nconst item = {\n  id: 'project-records',\n  featureState: 'ACTIVE',\n  workbenchTarget: { moduleName: 'recordOwner', schemaName: 'record' },\n  lifecycleActions: [\n    { id: 'save', ownerModule: 'recordOwner', featureState: 'ACTIVE' },\n    { id: 'approve', ownerModule: 'approvalOwner', featureState: 'ACTIVE' }\n  ]\n};\n```\n\nAdd these fields to an actual provider's existing, validated navigation/action contract. This fragment deliberately omits API bindings, route, labels and permissions; it is not a complete executable capability provider. The backend uses the publishing module, `workbenchTarget.moduleName`, and action `ownerModule`. It does not discover every secondary integration hidden inside an arbitrary API implementation. Those integrations remain service-owned.\n\n## Customize and extend safely\n\n### Narrow an existing provider in a project overlay\n\nExample outcome: a project wants to label the Waste collection-centre entry **Collection Sites**, without renaming Waste, changing references, or editing Axis code. Start with an existing project module loaded after Waste Core on the runtime that publishes its capability. Its ownership metadata must allow the service contribution, and its local composition must select the provider being extended. A new file in an unselected module has no effect.\n\nPlace the following method override at `modules/<projectModule>/src/service/defaultWasteBackofficeCapabilityService.js`. The filename preserves the existing service identity. Inherited lifecycle, `capabilityData()` and `buildCapability()` methods remain framework-owned:\n\n```js\nmodule.exports = {\n  getCapability: function () {\n    const effective = this.buildCapability(this.capabilityData());\n    return Object.assign({}, effective, {\n      navigation: effective.navigation.map(item =>\n        item.id === 'waste-collection-centres'\n          ? Object.assign({}, item, { label: 'Collection Sites' })\n          : item\n      )\n    });\n  }\n};\n```\n\nThis is a method-level example, not a full module scaffold. Keep the module's standard copyright, JSDoc, package metadata and tests when adopting it. The override changes only the label in a fresh projection. It preserves IDs, permissions, workbench targets, parent relationships, action owners and registration under the framework functional identity.\n\n1. Confirm the effective service is the merged project provider, using the normal runtime service/load evidence rather than requiring framework source files directly from the project.\n2. Test the provider with and without the project override. Only the selected label should differ. Repeated calls must not mutate shared source data.\n3. Test an unauthorized user and an unavailable target: the custom label must not make either case usable.\n4. If a governed published menu already overrides this label, it can still take presentation precedence. Review that menu through the normal publication journey; do not bypass it with hardcoded Axis navigation.\n5. For rollback, remove the project method override, rebuild/restart its owning runtime and refresh discovery. Restore any separately published label change through the owning publication lifecycle, not a database edit.\n\n### Tune catalogue page size without changing eligibility\n\nThe existing `backofficeFunctionalModuleCatalogue.eligibilityPageSize` property defaults to 256. Set it in the normal project/server configuration layer hosting BackOffice; use the worked 128-record example in Modular Architecture and Ownership. This controls backend page size, not the maximum number of modules shown. A project with 513 catalogue records must still return all scoped records. Smaller pages trade more requests for smaller per-request payloads; the final aggregate still occupies memory. This is not streaming or a guarantee of unbounded catalogue size.\n\nCustom discovery and provider adapters must preserve project, tenant and authorization context on every page. A failed later page is not an empty final page. Never reconcile all unseen records as offline from an incomplete read.\n\n### Non-customizable security and ownership\n\nProjects cannot use a saved menu to restore a missing provider, replace backend authorization with a frontend flag, or auto-enable a disabled registration on a heartbeat. The same requirements apply after published navigation overrides. New module-owned navigation must be supplied by the authorized provider before it is eligible for published presentation; arbitrary saved IDs are not a way to create business capabilities.\n\n## Troubleshooting and recovery\n\n| Symptom | Check | Safe correction and proof |\n| --- | --- | --- |\n| Optional module is healthy but absent from left navigation | Registration, enabled state and employee permissions. | Complete the authorized lifecycle or assign proper access; do not add static menu entries. |\n| Target action is disabled | Named target/owner, authorized readiness, provider configuration. | Restore the required owner and refresh; test the actual API afterward. |\n| Blocked only because an unrelated optional group is missing | Existing activation-data prerequisites and real local composition. | Correct the owning project metadata if the dependency is artificial; retain genuine prerequisites. |\n| Old menu still appears after deactivation | Current effective navigation versus saved presentation. | Refresh backend projection and verify source-provider eligibility; do not erase business data. |\n| Some modules disappear from a large catalogue | Page-size settings, full-page traversal, failed later requests. | Fix the failed scoped read; verify last-page records and reconciliation. |\n| One runtime replaces another runtime's technical members | Live lease set and aggregate functional identity. | Verify union of active observations and pruning of expired members. |\n| Recovery did not activate a module | Persisted disabled state. | Expected behavior: activation remains an explicit administrator decision. |\n\nCapture correlation identifiers, module identity and sanitized backend errors. Do not include bearer tokens, employee secrets or unrelated customer records in support screenshots. A lease view describes observed instances, not a complete inventory of every process an operator intended to deploy.\n\n## Repeatable acceptance examples\n\n### Revision conflict during activation\n\n`catalogueRevision` is the optimistic token for an administrator decision, not a counter of heartbeats. Changing runtime membership or an observation timestamp does not invalidate a decision. Changing registration, enablement, protection, registered version or the advertised activation-package policy does. An activation also checks runtime presence at its final conditional write, so a runtime lost during import cannot produce a successful enablement.\n\nExample: Commerce Online and Commerce Staged advertise the same release code. Their different target servers are separate observations, not alternating replacements of one package. After both observations arrive, repeated heartbeats converge. A target's successful import receipt cannot satisfy another target's failed import. Historical receipts are matched only to their recorded target.\n\nIf another administrator changes the module while activation is in progress, the action still fails its revision check. Axis refreshes the catalogue and clears the old success message; it does not silently retry a mutation. Review the current registration and activation receipts before retrying. An import can have completed before a final decision conflict, so a failed activation is not proof that all data operations rolled back.\n\nFor project customization, the existing `backofficeFunctionalModuleActivationData.modules[functionalModule].dataPackages` descriptors override observed descriptors for the same release code. Put a verified target in the BackOffice-hosting project configuration, not in Axis. Retain the real release code accepted by nImport. If a project intentionally requires multiple targets for one release, supply those target-specific descriptors in that existing array. Do not invent another routing file. Removing the override restores observed routing; review the resulting plan and rerun readiness before activation. Configuration rollback does not undo imports.\n\nVerify alternating heartbeats, two target-specific receipts, project routing precedence, runtime loss during import and two administrators using the same revision:\n\n```bash\nnode --test nodics.platform/modules/backoffice/test/functionalModuleConcurrency.test.js\n```\n\nRun these non-live tests from the framework root:\n\n```bash\nnode --test nodics.platform/modules/backoffice/test/navigationModuleAvailability.test.js\nnode --test nodics.platform/modules/backoffice/test/functionalModuleLifecyclePagination.test.js\n```\n\nFor a project overlay, add tests for unchanged framework identity, the renamed label, retained permission requirements, missing/restored targets, and unchanged shared provider data. Exercise paging at 0, 1, page-size, page-size plus 1 and multiple pages. Include two runtimes contributing different technical members.\n\nFor browser qualification, run the administrator walkthrough with a permitted user and a restricted user in an isolated environment. Record registration, activation, independent-operation and rejected-operation results separately. Do not mutate the user's live installation merely to capture a failure screen. No source-only test or screenshot proves every business operation was qualified.\n\n## Implementation handoff\n\nWhen a new module is added, the handoff should include package metadata, runtime role, visible capability name, dependency list, health signal, setup actions, and documentation page references. That makes the registry useful to business users who need a clear journey, developers who need extension points, operators who need production readiness, and QA owners who need repeatable acceptance checks.\n\n## Common mistakes\n\n- Treating frontend menu entries as module activation evidence.\n- Mixing local required modules with remote API target availability.\n- Hiding dependency failures behind a generic setup error.\n- Adding registry fields without route and service tests.\n- Letting a business action appear enabled before required capability checks pass.\n\n## Verification\n\nRun BackOffice registry, discovery, capability, and availability tests. Then use an isolated test environment, initialize module data, open Axis, and confirm the registry view shows active, blocked, and unavailable states with safe messages. Test optional targets absent, present, lost and restored without resetting business records. Include more than one catalogue page and multiple runtime instances: all lifecycle listings and lease reconciliation must read complete pages, and one instance must not erase another instance's technical members. Production readiness requires business clarity, developer source traceability, operator evidence, and repeatable QA checks.\n",
      "previous": {
        "title": "Documentation Publishing Runbook",
        "route": "/docs/framework/docs-documentation-publishing-runbook"
      },
      "next": {
        "title": "Commerce Search Guide",
        "route": "/docs/framework/commerce-search-guide"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.platform",
        "technicalModule": "backoffice",
        "owner": "backoffice",
        "sourcePath": "data/docs-v001/records/documentation/backofficeDocumentationRelease002ComponentData.js",
        "path": "data/docs-v001/records/documentation/backofficeDocumentationRelease002ComponentData.js",
        "wordCount": 2675,
        "checksum": "490628f6294594e5ac0ecb5132ea3c40af96cf044fd2d404b7f8cb8b57535261"
      },
      "slug": "platform-module-registry-journey",
      "locale": "en",
      "navigationGroup": "Module Registry Foundations",
      "navigationGroupCode": "module-registry-foundations",
      "navigationGroupOrder": 10,
      "navigationOrder": 20,
      "references": [
        {
          "documentId": "platform.module-registry",
          "owner": "backoffice"
        },
        {
          "documentId": "applications.axis-setup-error-contracts",
          "owner": "backoffice"
        },
        {
          "documentId": "framework.module-loading-service-precedence",
          "owner": "config"
        }
      ]
    },
    "active": true
  }
};
