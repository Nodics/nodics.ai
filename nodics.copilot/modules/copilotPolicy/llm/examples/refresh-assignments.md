# Refresh Workflow and Publisher Assignments

## Business Outcome

An elevated administrator can select which published Process definition/version
may refresh a knowledge source, and which authenticated source publisher may
request that refresh. Axis renders the existing owner-defined settings forms.
Changes are proposals: independent runtime approval and activation remain with
nDynamo. There is no Copilot-specific assignment database or approval shortcut.

## Before Starting

- The deployment needs existing durable property governance and the Copilot
  administration API. The current employee needs configuration read, manage and
  admin permissions, plus `copilot.knowledge.source.manage` and the selected
  source's independent read permissions.
- Current tenant, enterprise, project and environment come from authenticated
  context. None can be supplied in the form or changed by a submitted property path.
- Sources must be enabled, authorized and visible through the current active
  knowledge groups. DATABASE and EXTERNAL_LOG are live-read sources, not eligible
  static refresh targets. Missing choices are not permission to widen a ceiling.
- The operator must separately install/publish the owning Process contribution and
  qualify runtime authentication, SYSTEM source access and Process/Cron permissions.
  The form does not inspect a remote definition or certify that it is installed.

## Administrator Steps

1. Open **AI & Copilot > Settings** in the intended enterprise/runtime.
2. Choose **Assign source refresh workflow**.
3. Select the knowledge source and enter the exact published Process definition
   and version from the Process owner. Leave **Assignment enabled** selected.
4. Enter the business reason and choose **Review proposal**. Check every change.
5. Submit for approval. The response is a REQUESTED governance record, not an
   activated assignment or completed refresh. Use the existing runtime governance
   workspace for independent approval/activation, then refresh effective settings.
6. Choose **Assign source event publisher** only after the workflow assignment
   is effective. Enter the exact service identity of the separately authenticated
   publisher, select the same source and pin the matching definition/version.
7. Review, submit, approve and activate that proposal through the same process.
8. Configure the external publisher through its own deployment owner. Verify one
   signed source-change event, then inspect Process attempt history and physical
   knowledge readiness separately. Start acknowledgement is not refresh completion.

```text
Source permissions and active groups
  -> scoped assignment form
  -> revision-bound proposal
  -> independent nDynamo approval/activation
  -> authenticated source event
  -> Process start and single-use claim
  -> Knowledge refresh and Discovery publication
```

## Change or Remove an Assignment

Select the existing **Refresh workflow: source** or **Event publisher: source**
section. Change the pinned values or clear **Assignment enabled**, review the
change and submit. Clearing the checkbox removes the assignment after approval;
it does not disable a source, cancel an in-flight worker or remove indexed bytes.

Remove dependent publishers before removing or repinning their workflow
assignment. The owner rejects orphaned publisher assignments. Each publisher and
source has one binding in the exact deployment scope, even across Process versions.
Foreign deployment records are preserved but never included in the form/review.
Source permission revocation removes the form rather than exposing hidden source
metadata; broader repair belongs to independently authorized runtime governance.

## Rejection and Recovery

Duplicate identities, invalid versions, hidden sources, submitted scope/paths,
delegated-only administrators and stale revisions are rejected before a proposal
is saved. Permission, source visibility and effective settings are rechecked after
asynchronous preview. A proposal cannot retain authority revoked during that read.

Editing a form invalidates its previous review. An uncertain submission must be
inspected using configuration-request history; do not repeat it automatically.
No change grants publisher credentials, permits arbitrary endpoints, enables an
automation gate, installs a definition, creates a Cron schedule or starts ingestion.
Schedules remain a separate Process/Cron provisioning workflow.

## Framework and Partner Customization

`DefaultCopilotRefreshAdministrationService` extends the existing Policy settings
owner. It reads only `knowledge.workflowRefresh.assignments` and
`knowledge.eventRefresh.publishers`; nConfig remains the effective configuration
authority. Later layers may customize labels or narrow choices while preserving
all scope and admission checks. Axis may customize presentation around its typed
settings renderer, but cannot invent fields, grants, destinations or execution.

Run `test/copilotAdministration.test.js`, Knowledge event/workflow/group tests and
Axis `test/assistant/CopilotAdministration.test.tsx`. The synthetic
`administration.visual.html` fixture is for responsive rendering and explicit
review/submission only, not signed-in or external publisher acceptance.
