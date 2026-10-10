# Editorial contracts

## Process definition authoring authority

Editorial owns the neutral `editorial:editorialWorkflows` release in
`data/init-v001/records/process/editorialWorkflowDefinitionData.js`. Its approval
and publication graphs contain only Editorial actions, with no customer reviewer
queue. Process installs it through `PROCESS_DEFINITION`; nImport may explicitly
select this inactive domain contribution without activating Editorial in the
Process runtime. The WCMS Staged content-type release stays independent.

The future workflow release declares `selectionPolicy: "EXPLICIT"`. nService
projects it as optional USER-triggered data, and nImport excludes it from startup,
implicit profiles and module-wide selections even if Editorial is active
transitively. Select its exact release code on the PROCESS destination after
reviewing adoption evidence. Its non-publishable `initialPublicationPolicy: "NONE"`
is unchanged; the existing `editorial:init-v001` retains required Init activation.
`editorialWorkflowContribution.test.js` exercises actual registration projection.

Customer modules contribute reviewer assignment through Workflow's
`process.definitionContributions.reviewerAssignments` configuration. The generic
owner hook applies only scoped TASK-node assignees; runtime servers need no
duplicated contribution services. The framework payload is immutable and neutral;
source release checksums and effective published graph checksums remain distinct.
Changed graphs or effective customer policy require a new release version.

Existing deployment-owned releases remain historical installation evidence.
Keep their files, manifests, identities and checksums intact. Future authoring
authority does not itself change installed ownership. Use Workflow's exact
provenance adoption contract: equal graphs retain original provenance without
writes, while explicitly selected forward migration creates a new immutable
version and preserves pending instances. Customer-specific transition identities
and live checksums never belong in this module. Do not select or install the new
release automatically merely because it is present in the framework checkout.

Fresh installation, retained deployment migration and live publication acceptance
are separate evidence boundaries. The neutral release and isolated tests alone
do not retire a customer's currently selected release or prove installed-state
readiness. Customer release selection, observed version/checksum evidence and
approved execution must be supplied before live migration.

For remote qualification on the selected PROCESS runtime, use the existing
authorized `POST /nodics/import/v0/init/validate` with body:

```json
{ "releaseCodes": ["editorial:editorialWorkflows"] }
```

The route preserves `import.release.validate`, its existing `import.core.run`
permission declaration and `dataImport` exposure. No new route is needed.
Read `data.contributionPlans[0].evidence.definitions` for installed/target
provenance, published checksum, effective execution checksum and equivalence.
Before transitions are configured, expect `data.validation.ready: false` and
`contributionPlans[0].blocker`; this is evidence for review, not an install plan.
After the exact approved customer transitions are loaded, repeat the same POST
and require `validation.ready: true` and both plan actions RETAIN for equivalent
adoption. The existing `/nodics/import/v0/init/install` accepts the same selection
for approved execution under its existing `import.init.run` authority. Repeat
validate and inspect Process versions/tasks afterward, including CURRENT receipts.
An authorization denial must be resolved through the existing owner permission
policy; never elevate persistence credentials in the preflight hook.

In-process callers can also use the owner service operations:

```js
const request = {
    tenant: authorizedRequest.tenant,
    authData: authorizedRequest.authData,
    releaseRequest: {
        dataType: 'init',
        releaseCodes: ['editorial:editorialWorkflows']
    }
};
await SERVICE.DefaultProcessDefinitionContributionService.inspectRelease(request);
// After exact customer transition evidence is approved and loaded:
await SERVICE.DefaultProcessDefinitionContributionService.planRelease(request);
// Approved execution only, through the existing release owner:
await SERVICE.DefaultDataReleaseService.execute(request);
```

If Editorial is inactive, the selected customer/deployment configuration must
explicitly include `{ moduleName: 'editorial', sections: ['editorialWorkflows'] }`
in `data.dataReleases.contributions`. This only permits discovery; preserve
other configured selectors and do not activate Editorial or change EXPLICIT
selection. Confirm the effective reviewer assignment before inspecting. Obtain
source checksums from the installed API/service evidence, never from a guessed
hash or a copied example. For equivalent approval and publication definitions,
select RETAIN per definition and verify repeated planning still returns RETAIN
with the original provenance and pending versions unchanged. Installation records
the target nImport receipt even though Process retains its source history.

## Canonical Editorial Acceptance

The capability-owned live journey requires literal `execute: true` and
`approvePublications: true` (CLI: `--execute --approve-publications`).
Imports and `--help` perform no operations. Customer layers retain the site and
runtime-relative Process contribution fixtures. Reject path traversal and symlink
escapes; verify installed contribution code, release version, graph, checksum
and current published version before authoring. Never install definitions or
repair permissions from acceptance.

Preserve authoring, READY validation, correlated Process approval, APPROVED
readback, ONLINE publication, listing/detail, structured data, RSS, sitemap and
WITHDRAWN evidence. Article readback and publication must match the journey's
identities; publication must include a safe-integer revision before withdrawal.
Withdrawal succeeds only when detail returns HTTP 404;
authorization and server failures are failures. Every API denial stops the suite.
Run `node --test nodics.wcms/modules/editorial/test/editorialLiveJourneyAcceptance.test.mjs`
from the framework root for isolated evidence; this does not qualify a deployment.

- News and Blog are initial `editorialContentType` records, not runtime modules.
- `editorialArticle` is the aggregate root; localized copy lives in `editorialArticleLocalization`.
- Validation and readiness are side-effect free.
- Process executes workflow and task state; Editorial contributes one allow-listed revision-correlated action adapter.
- Cron remains scheduler authority through Process trigger metadata.
- nPublish owns validation, activation, rollback, and withdrawal transitions; Editorial supplies domain and version adapters.
- Online projections and publication receipts permit secured canonical schema inspection only; their read-only authoring metadata rejects every generated mutation. Public clients continue through sanitized Editorial delivery services.
- Axis discovers authoring workspaces from `DefaultEditorialBackofficeCapabilityService`.
- Nexus renderer keys are allow-listed executable frontend contracts; customer/project data packs own CMS composition records.

## Remote workflow callbacks

`POST /workflow/actions/applyDecision` and `POST /workflow/actions/publishApproved`
are internal operations under `moduleInternal`, service-token authentication and
`authSecurity.internalToken.routePermission`. Human authoring/review APIs keep
their existing employee permissions; a workflow submitter cannot call these
internal callbacks directly.

The callback carries exactly `{ instanceCode, executionCode }`. nAuth's existing
service-token owner checks the verified principal's Workflow capability, tenant
and runtime scope. Editorial uses its own runtime credential through nService to
claim the current action from Process; the Process caller credential is not
forwarded. `editorial.workflow.actionAuthority` owns the default `process`
connection, abstract connection type, PROCESS runtime role and five-second
claim timeout. Deployments override that selection through existing layers.

Only Process's stored claim response supplies the article revision, decision,
actor and node. Editorial loads the actual article and requires exact workflow
correlation. An IN_REVIEW decision uses an optimistic state predicate and stores
Editorial decision evidence for retry. An identical committed decision is not
applied again. Publication loads the actual approved article and calls nPublish;
a published retry reads the existing nPublish state and does not publish again.
Neither a supplied article status nor matching identifiers authorize mutation.

Missing/forged/stale handles, wrong capability/tenant/enterprise/environment,
wrong source runtime, concurrent claims, replay, unapproved publication and
changed article state fail closed. Transport uncertainty is not success; use
Process's existing incident/retry path and the domain's existing commit evidence.
Tests use the real controller, Process lifecycle/claim and domain services with
isolated stores; this evidence does not claim live deployment acceptance.

After the Process claim succeeds and its source context is valid, the callback uses nAuth's existing internal system auth data for the bounded domain persistence request. Preserve the original principal metadata and keep this request local; never grant those groups to the incoming runtime token or acquire persistence authority before a successful claim. The existing schema policy, exact revision/instance checks and nPublish owner still apply.

The existing Online publication target likewise requires a scoped Editorial runtime principal and the Online role before using internal auth data for its target-local persistence. Incoming runtime claims remain unchanged.
