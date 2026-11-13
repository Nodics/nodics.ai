# Editorial contracts

## Process definition authoring authority

Editorial owns the neutral `editorial:editorialWorkflows` release in
`data/init-v001/records/process/editorialWorkflowDefinitionData.js`. Its approval
and publication graphs contain only Editorial actions, with no customer reviewer
queue. Process installs it through `PROCESS_DEFINITION`; nImport may explicitly
select this inactive domain contribution without activating Editorial in the
Process runtime. The WCMS Staged content-type release stays independent.

The approval definition requires a rejection reason before Process completes the
task. Older pinned workflow versions keep their original policy and history.

The workflow release declares `selectionPolicy: "EXPLICIT"`. nService
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
Preserve installed receipts and version history. Release 0 ships only the Editorial-owned graphs. Changing authoring
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
optional runtime-relative partner fixtures. Kickoff reads the Editorial module’s own Init manifest and workflow graphs. Reject path traversal and symlink
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
- Readiness inspection is read-only; successful validation marks eligible authoring input READY through Editorial.
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

## Publication context configuration

Ordinary module properties select publication defaults using the existing nConfig
context binding (`name: publication`). Runtime display labels never select source
providers or versioned schema policy. Staged selects source transport; Online and
Operational do not. Missing/unknown context rejects configuration. This selection
does not supply a target connection, installed qualification, actor grant or
publication approval. Later deployment overrides retain normal inheritance.


## Publication transport placement

Publication transport uses the logical owning module and explicit destination
`publication` (Online for deployment/status/rollback; Staged for Media source
proof). The calling module must be locally active in the matching source
publication context. Physical runtime role names do not select or authorize
these calls. Preserve explicit connection selection, scoped internal tokens,
original actor/tenant evidence, operation keys and exact receipt readback;
configuration alone grants no publication or mutation authority.


## Operational action destinations

Owner-configured action targets identify the canonical implementing module and
explicit `OPERATIONAL` publication, never a physical Commerce or Process role.
Copilot coupon/notification actions target `digitalCore`; CMS approval and
Editorial action claims target `workflow`. Preserve existing owner grants,
original employee or scoped runtime credentials, execution handles, actor/receipt
bindings and uncertain-operation recovery. CMS/Editorial callbacks additionally
require local domain ownership in Staged context. Deployment overrides select
connections; framework-owned publication defaults are inherited.

## Saved authoring evidence

`editorial:init-v001` installs News/Blog content-type reference policies through
nImport. Its REFERENCE/NONE lifecycle is deliberate. The effective content-type
schema restricts authoring to Staged using the existing shared authoring policy's
`allowedStages: ['STAGED']` declaration, independently of publishable content.
Never mark this reference policy as a public article merely to admit import, nor
permit Online reference edits to bypass source policy. Normal permissions and
governed import evidence remain required. `editorialFoundationAdmission.test.js`
qualifies actual manifest discovery and destination admission with no installation
writes and confirms unchanged article/projection restrictions.

The secured validation, readiness and submission operations accept article identity
and an exact positive safe-integer business revision. A route article identity must
match the body. They load the actual tenant-scoped article, bounded localizations
for that revision and one active content-type policy through generated services
with the original actor. Missing, denied, malformed, stale, duplicate or foreign
source evidence fails closed. The current owner policy supplies required locales
and the review workflow; caller policy/copy/status/workflow fields are not authority.
These operations require the Staged publication context.

Validation changes DRAFT or CHANGES_REQUESTED to READY using a code/revision/status
predicate and exactly one acknowledged update. READY validation can inspect the
same saved copy without another transition. Review and publication states cannot
be reset by validation. Readiness is read-only and reports the inspected revision
and current article status separately from content readiness.

Submission requires the actual saved READY state. Process receives the exact
deterministic instance identity, saved name and current owner workflow. Only a
matching Process instance receipt permits the conditional READY to IN_REVIEW
update. A wrong or uncertain receipt is not success. If the article CAS fails
after Process accepts, report inspection of the exact instance; do not replay,
cancel Process or overwrite the newer article. Existing Process callbacks retain
their own claim and revision checks.

`editorialStoredAuthoringEvidence.test.js` composes the actual authoring,
validation, readiness and submission services with scoped stores and exercises
forged inputs, required-locale policy, malformed/denied/stale reads, write conflicts
and exact Process receipts. It does not by itself establish atomic draft saving or published editing; the
separate draft-command contract and composed tests below cover those boundaries.

The existing secured article workflow GET authorizes `editorial.workflow.read`
through the original human Staged scope, then reads the route-selected article
through the existing draft owner's unambiguous root read. Request-body workflow
or article fields cannot select another instance. Its exact saved review pointer
must match the current article's deterministic revision identity; an absent source
pointer permits inquiry of that identity for uncertain submission recovery.
Process detail must match the instance, Editorial owner, article and revision.
The source revision, status and pointer are rechecked before returning detail.
This history read does not depend on current content-type policy. Typed Process
instance absence maps to review-specific `ERR_EDT_00013` (404); authorization,
transport uncertainty and malformed or changed evidence never become absence.
No submission, claim, decision, persistence or automatic retry occurs. Preserve
these boundaries in service overrides and keep route authorization independent.

## Exact article withdrawal

The existing secured `POST /authoring/articles/:articleCode/withdraw` requires
`publicationCode` and the inspected nPublish `expectedRevision`. The article
revision and publication concurrency revision are different values, and zero
is a valid publication revision. Axis prepares a fresh exact-source inspection,
shows identity/state/revisions and requires explicit confirmation. No mutation
is sent while preparing.

Editorial reads the actual tenant-scoped article and requires its retained
publication pointer or separately verified current deployment, exact source
revision and Editorial article root to match the owning publication. A body-supplied model cannot select another route root
or replace lifecycle evidence. nPublish retains concurrency, state transitions,
target withdrawal and audit authority. Only confirmed WITHDRAWN evidence allows
a conditional article status update; the publication reference remains recorded.
If withdrawal completed but article readback failed, inspect again and explicitly
reconcile the same withdrawn publication. There is no automatic replay.

Partners may customize labels/theme through the existing Axis presentation seam
and tighten owner policy in a later-layer Editorial service. Preserve exact
article/publication correlation, original actor/tenant context, publication CAS,
retained history and failure evidence. Do not substitute the article revision for
the nPublish revision or grant persistence authority in the browser.
`editorialWithdrawalContract.test.js` covers valid/zero/stale revisions, denied
reads, wrong roots/pointers, exact retry reconciliation and article CAS failure.
Live acceptance additionally requires public detail HTTP 404, not a denied or
failed delivery request.


## Owner draft command boundary

The module README specifies the versioned draft create/workspace/save/inspect/archive
APIs. Their static secured routes and schema `aggregateOperations` are the frontend
transport authority. Article creation uses the existing Workbench create-operation
seam. Generic HTTP article update/delete and localization mutations are unavailable;
the governed localization Staged `saveAll` source-import exception remains explicit.
Neither that import seam nor generated internal writes relax human API authorization.

Save uses the existing `DefaultDatabaseTransactionService` for the Editorial root
and locales with the same opaque transaction context, original employee and tenant.
Policy and foreign Site/Author reads remain outside that copy transaction. Every
stored translation moves to the same new business revision; only changed selected
copy is patched. Failed writes, zero acknowledgements and invalid readback abort the
transaction. Existing database transactions must be enabled and qualified; no
non-atomic fallback exists. READY locales alone enter dependency/projection building.

The bounded `lastAuthoringCommand` field is private editor recovery evidence, not a
second history store. Inspection returns only evidence bound to the same original
actor, command key and starting revision. Missing evidence remains UNKNOWN.
`publicationSourceRevision` records which earlier revision the retained nPublish
pointer describes; an ordinary save cannot change publication state. Source publication
loads the actual APPROVED revision and requires a matching ONLINE receipt before its
conditional PUBLISHED update. Uncertainty after publishing requires owner inspection.
The atomic Online target and its isolated qualification are described below; native deployment acceptance remains separate.

The canonical live acceptance tool now creates and saves via owner commands, carries
the acknowledged business revision through validation/review/publication, and never
uses generic article/localization writes. Its explicit mutation/publication flags,
Process provenance checks, denied-stage stop behavior and exact delivery-404 gate
remain unchanged.


## Atomic Online publication and source ownership

Editorial's existing Online target uses the database transaction owner for the
complete site/language projection set, target-local article head, URL claims and
operation receipts. Both projection and receipt schemas opt into the existing
side-effect-free transaction contract. Receipt revisions are database-managed CAS
tokens; source revisions remain Editorial business revisions. There is no local
Staged fallback, new generic target store, new lifecycle journal or database index.
Staged must select its distinct Online transport. Existing scoped runtime admission
and target-local persistence authority remain unchanged.

The version provider declares nPublish's qualified `targetReceiptContract: 'v1'`.
Activation carries the original retained operation key, previous Online version and
previous pointer revision; revision zero represents a qualified absent pointer.
The target returns a correlated durable operation receipt, not submitted models or
update counts. Exact receipt replay is read-only and retains historical completion
independently of current visibility. UNKNOWN inspection does not prove failure.
Failures abort the whole local transaction. Concurrent first publication and URL
claims are fenced by existing unique record identity and managed pointer CAS.
Unqualified legacy CURRENT rows require explicit owner review; they are not adopted.

Rollback reaches the same Online owner and restores only the complete retained
predecessor of that exact activation. It supersedes the replacement, respects
intervening article/URL claims and refuses explicitly withdrawn predecessors.
Withdrawal affects only its exact retained activation; withdrawing an older request
cannot remove a newer Online set. Both operations retain original command receipts
in the same transaction. No automatic compensation or new approval authority exists.

Before nPublish effects, the Staged article claims a bounded `publicationIntent`
containing only contract version, exact request code and source revision. This
source-row CAS competes with draft save/archive; copy cannot change beneath a
publication request. An older publication reference remains intact. Confirmed
ONLINE plus exact source completion clears the intent and records the new reference.
Unknown outcomes retain the original intent for inspection. Explicit resume uses
that same request; nPublish FAILED recovery remains with its owning lifecycle APIs.
Never clear intent fields or force article status through database edits.

Public delivery requires active CURRENT rows under trusted tenant/site/language,
publication windows and embargo. Allowlisted inert component filters cannot replace
those predicates. Malformed/denied owner reads are unavailable evidence; ambiguous
slugs fail explicitly rather than selecting an arbitrary article.

`editorialAtomicOnlineTarget.test.js`, `editorialOnlineProjectionService.test.js`,
`editorialPublicationService.test.js` and `editorialPublicVisibility.test.js` cover
transaction failure, uncertainty, original receipt recovery, concurrent ownership,
rollback/withdrawal, source fencing and public scope using isolated model ports.
Native deployment and final fresh-start acceptance remain separate requirements.


Managed receipt creation uses the existing managed-save owner with an absent revision
selector (`revision: 0`); it must not pass ordinary `insertOnly`, which nDatabase
correctly rejects for managed schemas. Managed updates request `returnModified`
and require both one affected row and the actual canonical modified model/revision.
Projection creation retains its ordinary insert-only path. The target fixture composes
`DefaultModelConcurrencyService` and the generated save initializer before its
isolated provider primitives, preserving the distinct admission/acknowledgement
shapes rather than simulating them as identical saves.


Submitting a newer READY revision for review changes only its review status and
workflow correlation. It preserves any older `publicationCode` and
`publicationSourceRevision` in both persistence and the returned article. Review
submission neither withdraws that copy nor removes the user's route to inspect it.
The saved owner reference, not a body-supplied pointer, remains authoritative.


## Command recovery and current deployment evidence

Editorial separately opts into nPublish's `targetCommandReceiptContract: 'v1'`.
Rollback and withdrawal require the journal-derived original proof and actual
lifecycle revision. Source transport and Online target independently correlate
its key, operation, publication/root/source, activation and target hash. Original
command receipts retain exact projection codes; replay is read-only even after a
newer deployment. Qualified completion is not proof of current visibility.

Target status additionally returns `deployment: null` for verified absence or
`{ publicationCode, sourceRevision, activationKey }` correlated with its current
head, complete projections and deployment receipt. Source `getDeployment` returns
NONE, DEPLOYED (including exact version and target revision), or raises an owner
error. The authorized workspace converts unavailable/contradictory observations
to UNKNOWN without hiding saved working copy. It does not add persisted active
state or rewrite the article's latest `publicationCode`/source revision. Axis
shows deployment separately from history, including a restored earlier request.
Deployment is not public access: dates, embargo and access rules remain delivery
owner concerns. A configured optional search projection hook reads the current
qualified complete set, rather than indexing/removing a historical command result;
this does not claim a search provider is installed or externally atomic.

Withdrawal accepts the exact retained request or a separately owner-proven current
deployment of the same article. A restored selection must match actual nPublish
root/source, target version and activation key before lifecycle effects. A terminal
WITHDRAWN read can reconcile the same article without rewriting its newer draft,
review or latest publication reference. Only withdrawal of the retained request
for the current PUBLISHED source may change that source status. Stale publication
revisions fail before mutation. Archive is held while any copy is deployed or a
retained publication's deployment absence cannot be verified.

The existing read/manage permissions, human access tokens, scoped target runtime
credentials, Source/Online separation, transaction owner and Process approval
remain required. No direct database CRUD, generic model mutation, new target
store, automatic compensation or browser lifecycle authority is introduced.


Verified NONE deployment on a newer non-PUBLISHED working source removes the
irrelevant withdrawal action from Axis. PUBLISHED sources may still inspect a
retained WITHDRAWN request for exact source reconciliation. A retained ROLLED_BACK
request with no deployment is readable history, not a withdrawal command. The
source/target API and permission checks remain authoritative; presentation does
not rewrite source status or publication pointers.


## Unchanged route claims during a renewed activation

A renewed activation of the same current immutable copy may retain identical
PUBLISHED route claims for the same publication. After qualifying current head
and full route/source/projection/digest identity, Editorial skips those unchanged
claim writes. The existing transaction and managed article-head CAS still fence
same-article transitions, and foreign/ambiguous route admission remains unchanged.
A new original activation retains a distinct deployment receipt and switches its
head normally. Do not manufacture claim changes with publication timestamps or
accept a zero-modified acknowledgement as a revision advance. Actual receipt
updates continue to require exact positive modified-model/revision evidence.
The same-instant composed test freezes Date and uses the actual managed
concurrency owner: valid renewal succeeds, changed immutable content rejects and
all committed state remains unchanged on rejection. No native source status or
receipt is edited to create this test condition.


The canonical Editorial Content authoring workspace declares the same existing
lifecycle actions as News and Blogs. BackOffice independently filters each action
by its existing permission; the route and backend enforcement remain unchanged.
A publication handoff opens this admitted all-types workspace filtered to the
current working article only when one qualified Staged source matches its origin.
Historical publication copy can differ from that current article. Ambiguous or
unavailable origins offer no guessed link. Customize navigation labels or owner
presentation without adding a browser registry, grants or direct persistence.
`editorialBackofficeCapability.test.js` protects canonical action parity and
permission-filtered projections; native journeys must separately qualify handoffs.


## Configured article image intake

The draft workspace optionally projects `mediaIntake` contract version 1 from
`editorial.authoring.mediaIntake`: a source-context code and bounded inert
English/Arabic copy. It contains no folder, provider, URL, credential or upload
permission. Layer the purpose/copy in module configuration; Media owns current
safe contexts, folder/format selection and file-specific policy. A missing or
incompatible purpose disables inline intake while preserving article inspection.

Axis reviews the actual image against Media APIs under the current employee and
one admitted Staged owner. One original generated media reference and SHA-256
bind the upload and subsequent read-only inspection. Only an exact positive
persisted receipt or Media's verified unchanged versioned bytes offers explicit
association with the open draft. Uncertain outcomes retain the original reference
and never resend or overwrite. A nonversioned inspection cannot prove unchanged
bytes. Selecting another actor/source retires callbacks; an upload blocks article
commands while pending. Uploading is separate from using the image, saving the
article, review and normal Media/Editorial publication. No direct database repair,
generated Media CRUD write or new storage/permission authority is introduced.

Review setup and content readiness are separate. A saved READY article still
requires its selected published Process definition. On a fresh deployment, review
the explicit `editorial:editorialWorkflows` selection in Data Exchange →
Initialization data on the Process runtime, validate its contribution plan, then
install through the ordinary nImport operation. Do not make this release implicit
or install it from an acceptance harness. Existing provenance still requires the
separate reviewed adoption/migration contract.

A typed missing Process definition returns `ERR_EDT_00009` (409), with setup
guidance; it never claims that the saved article is missing. Remote authorization
denials retain 401/403 through `ERR_EDT_00012`/`ERR_EDT_00011`. Unconfirmed transport,
malformed response and other remote failures return `ERR_EDT_00010` (502), without
echoing upstream diagnostics or replaying the command. Refresh the saved article
and inspect its deterministic review instance before another explicit submission.
Colocated Process errors retain their original authority, except the same typed
missing-definition setup projection. No open review task requires revision
inspection (409), rather than reporting an absent article. Partners may customize
these owner status messages through the ordinary later-layer status registry;
clients must not infer error kind from English wording.

Archived article inspection is independent of the current content-type policy.
The workspace reads only an actually saved ARCHIVED root and its bounded exact
revision translations under the original employee scope, then rechecks that root.
An inactive or removed policy therefore does not erase retained history. This
read-only history response has no current required-locale readiness claim and
exposes only the existing INSPECT operation. Forged caller status/history flags
cannot select it. Other article states, copy saves, validation, review and
publication retain the active saved-policy requirement. Denied, ambiguous,
foreign-revision or oversized reads remain errors; no record, policy or receipt is
created or repaired during inquiry. Customize the existing private archivedSource
projection while retaining its owner state, scope, bound and recheck guards.

Featured images use workspace `featuredMedia` contract version 1: exact saved mediaCode, readiness/status, bounded Framework presentation and optional Media-owned dependency/handoff. Readiness is checked at validation, submit and publication before the article intent claim. Unknown, retired, inactive, private, wrong-enterprise, stale-version and missing-byte evidence blocks readiness. An independent browser preview is not qualification. Domain source selection stays Editorial-owned; physical qualification stays Media-owned.

## Draft revisions and localized copy

Use the declared owner APIs for article creation and saving; generic article
updates and generic localization mutations are unavailable to HTTP clients.
`POST /authoring/articles/create` accepts `{ model }` and an original
`Idempotency-Key`; the owner supplies DRAFT, active state and business revision 1.
Select actual authorized CMS websites, active Editorial authors and a saved active
content type. The article reference, content type and website scope stay immutable
for ordinary draft edits. Never submit lifecycle, security or publication fields
as copy.

Creation labels and guidance come from the article's existing `backoffice.fields`.
Relationship selectors share that copy through the Schema Utility projection.
Content types and authors declare their human names before stable codes in
`displayProperties`; CMS owns website naming. These are presentation choices,
not different reference identities or additional authoring permissions.

`POST /authoring/articles/workspace` accepts `{ articleCode, locale }` and returns
the exact saved root, its current-revision translations, owner language policy,
authorized operations and inert configured presentation. A missing translation is
empty copy, not another language. Read permission does not imply manage permission.
`POST /authoring/articles/save` accepts `{ article: { code, revision }, changes,
localization: { localeCode, changes } }` and an original `Idempotency-Key`. The
existing database transaction owner atomically advances the root and all stored
translations by one business revision, clears the previous review correlation,
and returns actual saved copy. An incomplete translation remains DRAFT and is
excluded from publication; required languages still block readiness. No alternate
history/version store is introduced.

Editing published copy starts a new DRAFT revision while retaining its exact
nPublish reference and publication source revision. Save does not publish or
withdraw anything. Review and publication use the saved current business revision.
Withdrawal matches the retained publication source revision; withdrawing an older
Online copy preserves a newer working draft/review state. Target withdrawal cannot
change a newer source revision's current projections.

Uncertain saves require `POST /authoring/articles/inspect-command` with the original
`articleCode`, `expectedRevision` and `commandId`. This operation reads only: UNKNOWN
is not proof a command failed, and SAVED_BUT_CHANGED is not permission to replay it.
A bounded private root receipt binds the original actor/key/payload to one command;
it is not an audit/history authority. Archive uses the declared owner API, exact
saved revision and command key, rejects in-review copy or a retained Online
publication, and preserves references and history. Existing employee permissions,
tenant/enterprise scope and Staged authority apply throughout; no system authority
is substituted for human draft writes.

Presentation may be configured through `editorial.authoring.presentation` (English
and Arabic) and the equivalent inert Axis CMS override. Partners extend existing
Editorial services/schema fields and generated model ports. Preserve original actor
scope, transaction propagation, exact acknowledgements, publication correlation,
owner permissions and import classification. `editorialDraftCommands.test.js`,
`editorialExactProjectionWithdrawal.test.js` and the canonical acceptance fixture
cover isolated positive, denied, stale, rollback and recovery cases. They do not establish native deployment acceptance. Atomic Online target checks are described below.

## Atomic Online publication and source ownership reference

Editorial's existing Online target uses the database transaction owner for the
complete site/language projection set, target-local article head, URL claims and
operation receipts. Both projection and receipt schemas opt into the existing
side-effect-free transaction contract. Receipt revisions are database-managed CAS
tokens; source revisions remain Editorial business revisions. There is no local
Staged fallback, new generic target store, new lifecycle journal or database index.
Staged must select its distinct Online transport. Existing scoped runtime admission
and target-local persistence authority remain unchanged.

The version provider declares nPublish's qualified `targetReceiptContract: 'v1'`.
Activation carries the original retained operation key, previous Online version and
previous pointer revision; revision zero represents a qualified absent pointer.
The target returns a correlated durable operation receipt, not submitted models or
update counts. Exact receipt replay is read-only and retains historical completion
independently of current visibility. UNKNOWN inspection does not prove failure.
Failures abort the whole local transaction. Concurrent first publication and URL
claims are fenced by existing unique record identity and managed pointer CAS.
Unqualified legacy CURRENT rows require explicit owner review; they are not adopted.

Rollback reaches the same Online owner and restores only the complete retained
predecessor of that exact activation. It supersedes the replacement, respects
intervening article/URL claims and refuses explicitly withdrawn predecessors.
Withdrawal affects only its exact retained activation; withdrawing an older request
cannot remove a newer Online set. Both operations retain original command receipts
in the same transaction. No automatic compensation or new approval authority exists.

Before nPublish effects, the Staged article claims a bounded `publicationIntent`
containing only contract version, exact request code and source revision. This
source-row CAS competes with draft save/archive; copy cannot change beneath a
publication request. An older publication reference remains intact. Confirmed
ONLINE plus exact source completion clears the intent and records the new reference.
Unknown outcomes retain the original intent for inspection. Explicit resume uses
that same request; nPublish FAILED recovery remains with its owning lifecycle APIs.
Never clear intent fields or force article status through database edits.

Public delivery requires active CURRENT rows under trusted tenant/site/language,
publication windows and embargo. Allowlisted inert component filters cannot replace
those predicates. Malformed/denied owner reads are unavailable evidence; ambiguous
slugs fail explicitly rather than selecting an arbitrary article.

`editorialAtomicOnlineTarget.test.js`, `editorialOnlineProjectionService.test.js`,
`editorialPublicationService.test.js` and `editorialPublicVisibility.test.js` cover
transaction failure, uncertainty, original receipt recovery, concurrent ownership,
rollback/withdrawal, source fencing and public scope using isolated model ports.
Native deployment and final fresh-start acceptance remain separate requirements.


Managed receipt creation uses the existing managed-save owner with an absent revision
selector (`revision: 0`); it must not pass ordinary `insertOnly`, which nDatabase
correctly rejects for managed schemas. Managed updates request `returnModified`
and require both one affected row and the actual canonical modified model/revision.
Projection creation retains its ordinary insert-only path. The target fixture composes
`DefaultModelConcurrencyService` and the generated save initializer before its
isolated provider primitives, preserving the distinct admission/acknowledgement
shapes rather than simulating them as identical saves.


Submitting a newer READY revision for review changes only its review status and
workflow correlation. It preserves any older `publicationCode` and
`publicationSourceRevision` in both persistence and the returned article. Review
submission neither withdraws that copy nor removes the user's route to inspect it.
The saved owner reference, not a body-supplied pointer, remains authoritative.


Rollback/withdrawal response loss uses the original nPublish journal command and
immutable target receipt across later FAILED revisions. The workspace separately
reports current deployment (DEPLOYED/NONE/UNKNOWN), preserving the article's
latest publication history. Axis can inspect and withdraw an earlier restored
copy while keeping newer working copy; archive requires verified absence. See
[command recovery and deployment evidence](README.md#command-recovery-and-current-deployment-evidence).


When deployment absence is verified for a newer draft/review revision, Axis omits
irrelevant withdrawal controls while retaining publication history. A published
source with a retained terminal request may inspect its history for reconciliation;
a rolled-back request with no deployed copy offers no failing withdrawal
confirmation. Publication operator controls stay in the owning request workspace.


Renewing an already-current identical immutable copy retains unchanged qualified
route claims and switches the original deployment receipt/head through the same
managed transaction. It does not force a timestamp edit or weaken no-op/CAS
acknowledgement rules; same-instant managed-owner tests cover this boundary.


The canonical Editorial Content authoring workspace declares the same existing
lifecycle actions as News and Blogs. BackOffice independently filters each action
by its existing permission; the route and backend enforcement remain unchanged.
A publication handoff opens this admitted all-types workspace filtered to the
current working article only when one qualified Staged source matches its origin.
Historical publication copy can differ from that current article. Ambiguous or
unavailable origins offer no guessed link. Customize navigation labels or owner
presentation without adding a browser registry, grants or direct persistence.
`editorialBackofficeCapability.test.js` protects canonical action parity and
permission-filtered projections; native journeys must separately qualify handoffs.
