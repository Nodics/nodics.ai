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

See the [draft revisions and localized copy](llm/contracts/README.md#draft-revisions-and-localized-copy) for exact admission, failure and recovery boundaries.

## Atomic Online publication and source ownership

See the [atomic online publication and source ownership reference](llm/contracts/README.md#atomic-online-publication-and-source-ownership-reference) for exact admission, failure and recovery boundaries.

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
