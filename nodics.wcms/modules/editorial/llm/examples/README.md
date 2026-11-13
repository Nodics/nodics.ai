# Editorial examples

An article becomes workflow-ready only when its master fields, site and author assignments, publication window, and required ready localizations pass validation. Phase 2 readiness is evidence only and never starts a Process workflow.

Save the article and translations, then validate using the saved code and revision.
If News/Blog policies are missing after a fresh start, open Data Exchange,
Initialization data and validate/install Editorial foundations through its normal
release operation. Do not insert a policy into the database or supply one in the
validation body. Installation does not approve or publish an article.
If the current News policy requires English and Arabic, a client payload with an
empty required-locale list cannot waive Arabic. Missing saved Arabic copy remains
blocked. After saving the required translations, validate again, then submit the
saved READY revision. A stale revision requires a refresh. If Process accepted
`editorial-story-r3` but the article changed before IN_REVIEW was confirmed, inspect
that exact Process instance and the saved article; do not press Submit again to
resolve uncertainty.

A separate Workflow runtime selects `editorial.applyDecision` and connects `process.remoteActions.targets.editorial.connectionName` to its Staged content peer. The Editorial callback correlates the stored article revision and workflow instance; a mismatched instance fails before writing.

## Internal callback and retry

A reviewer uses the normal review API. Process completes the task only after its
approval policy passes, then sends `{ instanceCode, executionCode }` with its
runtime credential. Editorial claims that execution using its own service
identity and applies the exact stored decision. Sending an access token and an
`APPROVE` body directly to the callback is rejected before persistence.

If approval committed but the HTTP response was lost, retry the Process incident.
The fresh claim resolves the same domain decision receipt without a second
article mutation. A repeated old handle, different workflow/revision or an
unapproved publication fails. Later configuration may change connection aliases;
it cannot replace Process approval with customer-supplied callback fields.

After the Process claim succeeds and its source context is valid, the callback uses nAuth's existing internal system auth data for the bounded domain persistence request. Preserve the original principal metadata and keep this request local; never grant those groups to the incoming runtime token or acquire persistence authority before a successful claim. The existing schema policy, exact revision/instance checks and nPublish owner still apply.

The existing Online publication target likewise requires a scoped Editorial runtime principal and the Online role before using internal auth data for its target-local persistence. Incoming runtime claims remain unchanged.


## Save one language through the draft owner

After reading the declared workspace, send one original command to the declared
save API (all identifiers and revisions below are illustrative):

```json
{
  "article": { "code": "business-story", "revision": 2 },
  "commandId": "original-command-reference",
  "changes": { "internalName": "Updated working title" },
  "localization": { "localeCode": "en", "changes": { "title": "Updated public title" } }
}
```

Use the same `Idempotency-Key` as `commandId`. Require the actual SAVED_DRAFT
receipt for revision 3 and matching saved copy; do not merge an update count with
the submitted values. If uncertain, call the declared inspection API with
`{ "articleCode": "business-story", "expectedRevision": 2, "commandId": "original-command-reference" }`.
UNKNOWN and SAVED_BUT_CHANGED do not authorize replay. Preserve the open draft until
inspection and an explicit user decision to load current saved copy. Do not change
permissions, use system auth, or write root/localization rows directly to repair it.


## Inspect an uncertain bilingual publication

Suppose an approved revision has English and Arabic copy and its publication
response is lost. Refresh the saved article. If `publicationIntent` remains,
inspect its exact nPublish request; do not edit, archive, create another publication
code or clear the descriptor. Explicit resume uses the original request. If nPublish
reports FAILED, use its governed recovery and then resume source completion. A target
inspection may report original COMMITTED while `isCurrent` is false because a later
publication replaced it. Historical completion does not prove current public delivery.

An interrupted second-language deployment must retain the complete prior set.
Rollback restores both retained languages atomically or leaves the replacement
untouched. If another article acquired a released URL, rollback is refused rather
than displacing it. Withdrawal of an older request preserves any newer Online copy.
Always verify the actual public result separately, including embargo/publication
windows and the expected 404 after a confirmed current withdrawal. No example
requires direct database inserts, updates or manual receipt rewrites.

Managed receipt examples use the existing generated managed-save contract and its
absent revision selector. Ordinary `insertOnly` is for unversioned, unmanaged
projection records; never weaken database admission to make it work on receipts.
Require modified-model evidence for receipt CAS, not an update count alone.


Submitting a newer READY revision for review changes only its review status and
workflow correlation. It preserves any older `publicationCode` and
`publicationSourceRevision` in both persistence and the returned article. Review
submission neither withdraws that copy nor removes the user's route to inspect it.
The saved owner reference, not a body-supplied pointer, remains authoritative.


After rolling back request revision 2 to deployed source revision 1, the article
may retain request 2 in its history. Refresh its workspace: the separate DEPLOYED
evidence must identify the earlier request 1. Inspect that request and explicitly
confirm its current publication revision to withdraw the restored copy. The owner
rechecks deployment/activation identity and preserves the newer article and
request 2 reference. Verify public delivery separately; DEPLOYED does not override
embargo/windows. If deployment is UNKNOWN, keep working copy available and hold
archive; do not relabel the latest request as Online or rewrite stored pointers.

If original rollback/withdrawal completion is uncertain, inspect the actual
nPublish state and use its authorized original-command retry. FAILED activation
still requires existing validation/approval semantics. Never reuse a lifecycle
revision as a new target key or infer failure from a timed-out HTTP response.


For a new approved activation cycle of an identical retained version, qualify its
current head and retain matching same-publication route claims unchanged. Store
the distinct original activation receipt and switch the head under its managed
CAS. Never change a publication timestamp merely to force modifiedCount1 or treat
an unchanged managed update as a new revision. Changed immutable payload/access
intent must still reject atomically, including when every operation has the same
clock instant.


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


### Review an article image without publication shortcuts

Open an editable saved article, choose an image and review its Media policy.
Confirm the reviewed upload once, then explicitly use the confirmed image and
save the draft. Check that the saved revision references that exact Media code.
If the response is lost, inspect the displayed original upload reference; an
absent, changed, denied or nonversioned inspection holds the outcome and sends
no replacement upload. Keep the reference for owner-led recovery. Normal Media
and article validation/review/publication remain necessary for public delivery.
Customize `editorial.authoring.mediaIntake.contextCode` and its EN/AR presentation;
configure actual storage policies with Media. Never map a customer folder in Axis.

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
