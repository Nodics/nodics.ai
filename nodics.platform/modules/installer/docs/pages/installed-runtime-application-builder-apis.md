# Installed-Runtime Application Builder APIs

Status: Current read-only implementation
Owner: Installer and Application Builder
Audience: business users, implementation partners, administrators, operators, developers, and AI tools

## Detailed Summary

The installed-runtime Application Builder APIs make a local Nodics workspace
visible, explainable, and supportable after Nodics is already present on a
machine. They do not replace the standalone first-machine installer. A new user
still starts with:

```bash
npx github:Nodics/nodics.installer
```

After a workspace exists, the Platform installer capability exposes a governed
runtime surface that Axis can discover. Current behavior is intentionally
read-only. It can report installer capability information, publish the operation
catalog, inspect workspace status and inventory, run readiness checks, preview a
setup plan, and read sanitized setup evidence. It cannot start, stop, restart,
repair, initialize, accept, update, expand, back up, roll back, clean up, or
otherwise mutate a workspace.

This distinction is important for enterprise adoption. Business and operations
teams need visibility before control. Current read-only behavior gives them safe answers to "what
is installed?", "is this workspace healthy?", "what would the setup do?", and
"what evidence can support review?" without giving runtime APIs permission to
execute commands or alter vendor and customer code.

## Business Perspective

| Area | Documentation requirement |
| --- | --- |
| Problem solved | Operators and implementation partners need a safe way to inspect a customer workspace from Axis without manually reading local files, exposing secrets, or running command-line operations. |
| Who uses it | Administrators, support teams, implementation partners, developers, and Axis Application Builder users. |
| Decisions supported | Whether the workspace looks valid, whether prerequisites are ready, which repositories are customer-owned or vendor-owned, what setup plan would be generated, and what evidence can be shared safely. |
| Runtime behavior | Current routes are available only for read-only inspection and dry-run planning. BackOffice exposes capability metadata as preview-only so Axis can discover the capability without presenting it as a mature mutating control plane. |
| Business risk | Mutating operations are withheld until command execution, audit, rollback, idempotency, evidence, support, and vendor-boundary policies are approved and tested. |

## Capability Flow

```text
Business user or support operator
  -> Axis Application Builder workspace
  -> BackOffice capability metadata
  -> Platform installer read-only APIs
  -> Installer services
  -> Workspace boundary, operation catalog, preflight, plan, evidence
  -> Sanitized response back to Axis
```

The current backend implementation is ready for this flow from the runtime API
side. Axis frontend screens are intentionally outside this backend module.

## Bootstrap And Runtime Split

```text
First machine bootstrap
  nodics.installer repository
  npx github:Nodics/nodics.installer
  creates or prepares a local workspace

Installed runtime capability
  nodics.platform/modules/installer
  exposes secured read-only APIs after Nodics is present
  publishes operation catalog and BackOffice metadata
```

The standalone bootstrap path is GitHub-facing and beginner-friendly. The
installed-runtime capability is an enterprise backend capability that powers
Axis workflows.

## Current Operations

| Operation | Method and route | Permission | State | Business value |
| --- | --- | --- | --- | --- |
| Installer information | `GET /nodics/installer/v0/info` | `installer.workspace.view` | `AVAILABLE` | Shows bootstrap command, supported standalone installer version, and capability metadata. |
| Operation catalog | `GET /nodics/installer/v0/operations` | `installer.workspace.view` | `AVAILABLE` | Lets Axis discover supported and unavailable operations without hardcoding installer behavior. |
| Workspace status | `POST /nodics/installer/v0/workspace/status` | `installer.workspace.view` | `AVAILABLE` | Confirms whether the selected path looks like a Nodics workspace and reports core markers. |
| Workspace inventory | `POST /nodics/installer/v0/workspace/inventory` | `installer.workspace.view` | `AVAILABLE` | Lists visible workspace repositories and flags protected vendor-owned roots. |
| Workspace preflight | `POST /nodics/installer/v0/workspace/preflight` | `installer.workspace.view` | `AVAILABLE` | Checks readiness signals such as runtime, workspace markers, dependency hints, and requested ports. |
| Setup-plan preview | `POST /nodics/installer/v0/setup/plan` | `installer.workspace.plan` | `AVAILABLE` | Validates user choices and returns a dry-run plan without writing files or executing commands. |
| Evidence read | `POST /nodics/installer/v0/evidence/read` | `installer.workspace.evidence.read` | `AVAILABLE` | Reads allowlisted setup evidence and redacts secrets before returning it. |

## Operation States

| State | Meaning | Current usage |
| --- | --- | --- |
| `AVAILABLE` | Implemented, secured, tested, and allowed in the current runtime. | Used for read-only routes only. |
| `PREVIEW` | Visible for planning or early operator review, but not approved as a mature operating surface. | Used by BackOffice metadata and navigation actions. |
| `DISABLED` | Implemented or known, but disabled by configuration, environment, or missing prerequisite. | Reserved for runtime policy or environment gating. |
| `HIDDEN` | Not visible to Axis users until the backend contract is ready. | Used before a capability passes its backend contract. |

## Technical Perspective

| Technical area | Current authority |
| --- | --- |
| Owning module | `nodics.platform/modules/installer` |
| First-machine bootstrap | `nodics.installer` repository |
| API contract | `llm/contracts/installer-api-scope-contract.md` |
| Runtime routes | `src/router/routers.js` |
| Controller | `src/controller/defaultInstallerApplicationBuilderController.js` |
| Facade | `src/facade/defaultInstallerApplicationBuilderFacade.js` |
| Operation catalog | `src/service/defaultInstallerOperationCatalogService.js` |
| Operation validation | `src/service/defaultInstallerOperationCatalogValidationService.js` |
| Workspace boundary | `src/service/defaultInstallerWorkspaceBoundaryService.js` |
| Redaction | `src/service/defaultInstallerRedactionService.js` |
| Permissions | `src/service/defaultInstallerPermissionService.js` |
| BackOffice metadata | `src/service/defaultInstallerBackofficeCapabilityService.js` |
| Contract test | `test/installerModuleContract.test.js` |

## Runtime Request Flow

```text
HTTP request
  -> secured installer router
  -> DefaultInstallerApplicationBuilderController
  -> DefaultInstallerApplicationBuilderFacade
  -> permission assertion
  -> workspace boundary validation when workspaceRoot is supplied
  -> operation-specific service
  -> response envelope and redaction
```

Workspace-sensitive operations use `POST` even when they are read-only because
the request body may include a local workspace path, requested ports, selected
accelerator, or evidence filename.

## Configuration Model

| Configuration key | Default | Purpose | Project override guidance |
| --- | --- | --- | --- |
| `installer.applicationBuilder.enabled` | `true` | Enables the installed-runtime Application Builder capability. | Disable only when a runtime must hide the entire capability. |
| `installer.applicationBuilder.apiOperationsEnabled` | `true` | Allows read-only API operation exposure. | Set false for environments that should keep the backend capability dormant. |
| `installer.applicationBuilder.mutatingOperationsEnabled` | `false` | Blocks mutating installer operations. | Keep false until governed mutation contracts are implemented and approved. |
| `installer.applicationBuilder.standaloneBootstrapRepository` | `Nodics/nodics.installer` | Declares the public bootstrap repository. | Do not override unless the bootstrap ownership model changes through an approved release decision. |
| `installer.applicationBuilder.standaloneBootstrapCommand` | `npx github:Nodics/nodics.installer` | Shows the beginner bootstrap command. | Do not change casually; it is part of the public entry contract. |
| `installer.applicationBuilder.latestVerifiedStandaloneVersion` | `0.7.2` | Reports the verified standalone bootstrap version. | Update after standalone installer release qualification. |
| `installer.applicationBuilder.protectVendorRepositories` | `nodics.ai`, `nodics.axis` | Prevents customer-workspace APIs from treating vendor roots as mutable project roots. | Add vendor-owned roots if the workspace model expands. |
| `installer.applicationBuilder.workspace.allowedRoots` | empty list | Optional runtime allowlist for valid workspace roots. | Configure in managed environments to restrict inspection to approved directories. |
| `installer.applicationBuilder.workspace.allowRequestWorkspaceRoot` | `true` | Allows the caller to pass a workspace root subject to boundary checks. | Set false when the runtime should only inspect configured roots. |
| `installer.applicationBuilder.workspace.maxEvidenceBytes` | `65536` | Limits evidence payload size. | Tune by environment, keeping support usefulness and data minimization balanced. |
| `installer.applicationBuilder.workspace.allowedEvidenceFiles` | workspace manifests and setup/preflight logs | Restricts evidence reads to known files. | Add only sanitized, support-safe files through reviewed configuration. |

## Security And Governance

Current read-only behavior protects the runtime in several ways:

- only human access tokens are accepted for installer workspace operations;
- Current permissions are `installer.workspace.view`,
  `installer.workspace.plan`, and `installer.workspace.evidence.read`;
- mutating permissions such as `installer.workspace.operate`,
  `installer.workspace.support`, and `installer.workspace.expand` are reserved
  for governed mutating operations;
- read-only services must not use shell execution;
- vendor-owned roots such as `nodics.ai` and `nodics.axis` are protected;
- evidence reads are allowlisted and redacted;
- operation catalog entries derive executability from validated state instead
  of trusting caller-controlled data.

## Customization And Extension

Customer projects can safely customize the installed-runtime behavior through
normal Nodics configuration layering. The most common enterprise customizations
are:

| Need | Supported customization |
| --- | --- |
| Restrict which workspace roots can be inspected | Set `installer.applicationBuilder.workspace.allowedRoots`. |
| Prevent callers from sending arbitrary workspace roots | Set `installer.applicationBuilder.workspace.allowRequestWorkspaceRoot` to `false` and use configured roots only. |
| Add support-safe evidence files | Extend `installer.applicationBuilder.workspace.allowedEvidenceFiles` after confirming files are redaction-safe. |
| Increase or reduce evidence size | Adjust `installer.applicationBuilder.workspace.maxEvidenceBytes`. |
| Protect additional vendor repositories | Extend `installer.applicationBuilder.protectVendorRepositories`. |

Do not customize current read-only behavior by adding command execution, writable route handlers,
unreviewed evidence files, secret-bearing responses, direct Axis filesystem
reads, or mutations under vendor-owned roots. Those changes belong in a separate
governed mutation contract.

## Governed Mutation Contract

Before any lifecycle, expansion, maintenance, or support-bundle operation becomes
executable, the governed mutation contract must define and test:

| Requirement | Why it matters |
| --- | --- |
| Command execution allowlist | Prevents arbitrary shell execution from runtime APIs. |
| Idempotency key and lease model | Avoids duplicate setup, repair, backup, or rollback actions. |
| Audit event schema | Gives operators proof of who requested what, when, and with which result. |
| Dry-run before mutation | Lets business users review operational impact before changes occur. |
| Rollback and recovery rules | Makes failures survivable and supportable. |
| Vendor-boundary checks | Keeps vendor code separate from customer-owned customization roots. |
| Sanitized evidence policy | Allows support without leaking credentials or private machine details. |
| Permission model | Separates view, plan, operate, support, and expansion responsibilities. |

## Documentation Placement

This page belongs under the published hierarchy:

```text
Nodics Documentation
  Nodics Installer and Workspace Setup
    Installed-runtime API visibility
    Workspace status, inventory, and preflight APIs
    Setup-plan preview API
    Evidence read and support hints

  Application Builder and Workspace Generation
    Installed-runtime setup-plan preview API
    Operation catalog and feature states
    Workspace allowlist and vendor-protected roots
    Redacted evidence and support hints
    Mutating execution, repair, expansion, and rollback gates
```

The public first-machine installer journey should continue to link to the
standalone `nodics.installer` documentation. The Application Builder journey
should link back here when it explains runtime API visibility, dry-run planning,
and evidence reads.

## Verification

Use the focused module gate after implementation or contract changes:

```bash
npm --prefix nodics.platform/modules/installer test
```

The contract test verifies the module composition, operation states, route
registration, permission boundaries, BackOffice metadata, redaction behavior,
workspace boundary protection, and no-mutation guarantees.
