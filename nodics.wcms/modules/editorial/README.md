# Editorial

Generic authoring follows effective schema publication metadata and the existing
runtime role: publishable sources are Staged-only; publication projections and
receipts are read-only to Workbench/generated HTTP CRUD. Owning publication and
approved import services retain their governed paths. Project customization and
failure cases are documented in
`nodics.foundation/modules/nDatabase/database/llm/contracts/schema-authoring-authority.md`
and the canonical Foundation schema-data-modeling guide.

Editorial is the WCMS-owned backend capability for News, Blog, and future governed article types. It owns authoring records, localization, authors, taxonomy, series, corrections, validation, and readiness evidence.

Phases 0–7 add Process-owned review, nPublish orchestration, Cron-backed scheduling metadata, immutable Online projections, bounded delivery, discovery hooks, and standard Nexus renderer contracts while preserving each owning authority.

Authoring endpoints include owner draft creation, workspace inspection, atomic draft saving, original-command inspection, archive, validation, readiness, workflow submission/inspection, scheduling, and withdrawal. Public delivery includes bounded listing, detail, structured projection, RSS, and sitemap routes. Readiness inspection is read-only. Successful validation marks a DRAFT or CHANGES_REQUESTED article READY through the owning authoring service.

Validation, readiness and review submission resolve the saved exact article revision,
its saved localizations and the current active content-type policy on Staged under
the original actor and tenant. Save edits before validating. Body-supplied copy,
status, locale policy and workflow selection cannot replace owner evidence.
Readiness includes the inspected article revision and status; it does not start
review. READY and IN_REVIEW transitions require an exact conditional update
acknowledgement. If Process accepted a review but the article changed, inspect
`editorial-<articleCode>-r<revision>` before taking another action; never infer
success or automatically replay submission.

Editorial owns editorial truth and readiness. Process owns workflow execution and task state. CMS owns page/component composition, Media owns binaries, and Nexus owns customer-facing renderer implementations.

News and Blog policies come from the governed `editorial:init-v001` reference
release, displayed as Editorial foundations in Initialization data. Content-type
policy is Staged-only reference data, not a public article projection. Its schema
declares `mutationPolicy.allowedStages: ['STAGED']`; articles and translations
retain publication-required source metadata and Online projections stay read-only.
Validate/install the foundation through Data Exchange before dependent authoring.
Missing or inactive saved policy blocks validation and review rather than trusting
a browser-provided policy.

This capability declares an inert model-service inventory for [governed Local reset](../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).

Remote workflow callbacks accept only scoped Workflow runtime credentials and opaque execution handles. Claim the current action from Process before using its context; never accept caller-supplied decisions. Editorial enforces exact revision/instance correlation, optimistic decision mutation and publication through nPublish. Human authoring permissions stay on the existing authoring APIs. See `llm/contracts/README.md`.

After the Process claim succeeds and its source context is valid, the callback uses nAuth's existing internal system auth data for the bounded domain persistence request. Preserve the original principal metadata and keep this request local; never grant those groups to the incoming runtime token or acquire persistence authority before a successful claim. The existing schema policy, exact revision/instance checks and nPublish owner still apply.

The existing Online publication target likewise requires a scoped Editorial runtime principal and the Online role before using internal auth data for its target-local persistence. Incoming runtime claims remain unchanged.

## Exact article withdrawal

The existing secured `POST /authoring/articles/:articleCode/withdraw` requires
`publicationCode` and the inspected nPublish `expectedRevision`. The article
revision and publication concurrency revision are different values, and zero
is a valid publication revision. Axis prepares a fresh exact-source inspection,
shows identity/state/revisions and requires explicit confirmation. No mutation
is sent while preparing.

Editorial reads the actual tenant-scoped article and requires its current
publication pointer, exact source revision and Editorial article root to match
the owning publication. A body-supplied model cannot select another route root
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


Rollback/withdrawal response loss uses the original nPublish journal command and
immutable target receipt across later FAILED revisions. The workspace separately
reports current deployment (DEPLOYED/NONE/UNKNOWN), preserving the article's
latest publication history. Axis can inspect and withdraw an earlier restored
copy while keeping newer working copy; archive requires verified absence. See
[command recovery and deployment evidence](llm/contracts/README.md#command-recovery-and-current-deployment-evidence).


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

The secured article workflow GET resolves the current saved article under the
original employee's `editorial.workflow.read` authority. A caller-supplied
workflow reference is never a selector. Inspection follows the exact saved review
reference, or the source-derived deterministic revision identity when submission
was not confirmed. It correlates Process context and rechecks the article before
returning evidence. A typed missing Process instance reports review-specific
`ERR_EDT_00013` (404); denied and uncertain reads retain their existing status.
Inspection never starts, claims, completes or repairs a workflow. The composed
`editorialWorkflowInspection.test.js` covers the actual controller/facade path,
saved source scope, forged pointers, changed revisions and remote/colocated reads.

## Featured image readiness

The saved article workspace includes Framework-owned EN/AR `featuredMedia` guidance and an inert link to the exact authorized Media review workspace. Save a changed selection before inspecting it. Validation, workflow submission and publication require the referenced image to be active, public, READY and to match the immutable Media version, verified physical bytes and current activated pointer. The article revision and image metadata are rechecked before effect. A visible preview is not publication proof. No image is automatically approved or published. A user holding the permissions for all stages may perform them. Legal hold is preserved.
