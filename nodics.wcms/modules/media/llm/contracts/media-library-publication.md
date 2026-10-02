# Governed Media Library And Publication Initiation

## Ownership

Media owns library metadata and byte lifecycle. The existing generated
`DefaultMediaService` remains persistence authority; no new repository, registry,
schema or publication state machine is introduced. Media's existing retained
version provider delegates to nPublish and Process for approval. CMS owns its
media dependency coordination, not Media publication state. Axis renders the
module-owned `axis.workspace.backend-operations` contract already installed in
the client; it must not fall back to disabled schema APIs.

## API

All paths are relative to the authenticated Media module endpoint selected by
existing runtime routing, normally `/nodics/media/v0`. Do not hardcode a host.

| Method | Path | Input | Result under `data` |
| --- | --- | --- | --- |
| GET | `/library` | Optional `code`, `folderCode`, `status`, `pageNumber`, `pageSize` query | `{items,pageNumber,pageSize,hasMore}` |
| GET | `/library/:mediaCode` | Empty body/query | One current metadata DTO with `commands` |
| POST | `/library/publications` | `{mediaCode,versionId,publicationCode}` | `{publicationCode,mediaCode,versionId,state,revision,approvalRequired:true}` |

Use the listing's exact-code filter or inspect route to obtain the current
version before submitting a request. Page defaults are 1 and 50; page size is
1–100, page number 1–10000. `hasMore` conservatively indicates a full page;
it is not an exact total and the next page may be empty. Filters are exact
bounded identities, not raw queries, regular expressions, URLs or provider paths.
No count/search/export endpoint is added.

Only human access-token requests with matching signed tenant and nonempty
signed `authData.entCode` are admitted. Tenant/enterprise/query/transaction
contexts supplied in bodies are rejected, not merged. Reads require
`media.storage.policy.view`, using the canonical nRouter permission resolver.
Reads include the signed enterprise's records and unowned PUBLIC records. Other
enterprises' records and unowned PRIVATE/SIGNED metadata are excluded; owner
result scope is rechecked before projection. This is not a delegated-enterprise
or platform-global library permission. Customize a broader scope only through
an independently reviewed owner authorization contract, not a body flag.

DTO fields are code, bounded name/description/folder/format/MIME/extension/status/
access, valid sizeBytes, versionId, publicationRequestAvailable and commands.
No stored filename, provider code/key/path, URL, inline bytes, credentials,
checksum journal, owner proof or raw publication model is returned. DTOs are
new objects; cached/provider rows are not mutated. Responses and failures use
`Cache-Control: no-store`; provider errors are replaced with fixed
`ERR_MED_00023` without original cause, private message or driver details.

## Exact Versions And Commands

Library reads resolve the installed Media model. Ordinary unversioned records
are readable with `versionId:null`; a stored counter is not claimed as immutable
publication evidence. Versioned models must declare CURRENT read selection;
HISTORY or ambiguous metadata cannot masquerade as current. Generated reads
receive original authenticated context, fixed scope and `skipcache:true`.

`publicationRequestAvailable` and the `requestPublication` command require:

- an active READY scoped row and a valid numeric exact source version;
- all create, validate and requestApproval permissions under `publish.lifecycle`;
- `process.instance.start` and `process.definition.read` permission plus the
  original authenticated bearer propagated only from the trusted HTTP context;
- selected Media retained provider in STAGED, installed CURRENT metadata and
  the existing registered Media domain/workflow/version providers;
- installed transaction capabilities proving multi-record atomicity and context
  propagation for source retention;
- the existing Media storage facade's `publishEnabled` guard remains satisfied.

The selected existing nPublish workflow provider must expose its configured
Media policy, source-role assertion and explicit Process target. Using that
target and the original human bearer, Media reads `/definitions/:code`, then
`/definitions/:code/versions`, then rereads the definition. It requires an active
PUBLISHED Media-owned definition, an exact active PUBLISHED current version,
and an unchanged current pointer. Each lookup is single-attempt and bounded
to five seconds; at most 100 version rows are accepted. Denial, absence, draft
state, racing pointers, unsupported adapters or transport uncertainty suppress
commands before capture. No source manifest is silently installed.

`publicationReadiness.workflowDefinition` reports `PUBLISHED_CURRENT`, `BLOCKED`
or `UNCONFIRMED`, with the selected code, proven version when available, workflow
owner, and an actionable blocker otherwise. The explicit native release is
`media:mediaPublicationWorkflow`; installing and publishing it remains a
separate governed operator action. Source prerequisites do not certify Online
delivery or connected installation qualification.

`publicationReadiness.blockers` names failed prerequisites with fixed safe
`code`, `owner` and `message` fields. Missing caller grants additionally list
only the fixed required permission names. `publicationReadiness.message` is a
bounded plain-text summary (at most 512 characters), never a provider exception,
path, credential or causal diagnostic. Source or caller failure makes workflow
availability `NOT_INSPECTED`: it does not claim a workflow is absent. Connected
Process read uncertainty is distinct from a successfully inspected but invalid
published definition/version. The generic client's message-path descriptor
is declared as `readSource.unavailableMessagePath:'publicationReadiness.message'`
under the approved BackOffice contract. Axis displays it only after fresh
inspection identity matches, as bounded plain text, retaining the fixed fallback
for missing, malformed or oversized values. It has no authority influence.
These diagnostics never enable commands.

Only a completed Process read returning the recognized `ERR_PROCESS_00002`
with HTTP 404 is classified as `PROCESS_MEDIA_DEFINITION_MISSING`. It names
the separately selected `media:mediaPublicationWorkflow` release; installing
Process foundation does not install this explicit contribution. Denials,
unknown 404s, routing failures and lost foreign-status diagnostics remain
`PROCESS_INSPECTION_UNCONFIRMED`, never proof of missing or approved workflow.

When retained publication is selected, `exportReferenced` pins the installed
CURRENT row's real version and canonical full retained metadata. Byte count,
SHA-256 and access/size bounds must match exactly; a second fresh read must
match the entire projection and provider locator. Races reject rather than
substitute latest metadata. No locator leaves the exported asset. Unselected
legacy export remains unversioned and never fabricates a version pin.

The POST repeats these checks and freshly rereads the row. Stale versions,
missing versions, inactive rows and ambiguous identities reject before capture.
The request accepts an integer or its canonical decimal string so the existing
generic text field can carry the version; fractions/scientific notation reject.
`publicationCode` is a bounded stable nPublish request reference, not a new
idempotency journal. Reuse it for a retry of the same asset/version. Existing
`createGoverned` capture/retry identity checks continue to protect immutable
retained bytes and concurrency. A metadata change after the fresh read does not
change the explicitly selected immutable version or permit latest-version
substitution. Provider/Process uncertainty is not compensated by Media Library;
reconcile through the existing nPublish operations and original reference.

The owner flow is controller -> library facade -> library service -> existing
storage facade -> Media version provider -> nPublish create/validate/request
approval. It never invokes approve, activate or supplies Process decisions.
The older human POST `/publication/requests` is mapped through the same library
checks, retaining its `result` envelope with the safe initiation DTO. It accepts
only the same three fields; it is not a legacy escape around the scope/version
checks. Internal trusted version-provider operations retain their existing owner
contracts and are not exposed as arbitrary browser dispatch.
Readiness consumers must not interpret an available request command, READY
metadata, or APPROVAL_PENDING as approved Online publication. Online evidence
continues to come from existing nPublish state and exact target receipts.

## Workspaces And Customization

`media-library` at `/media/library` and All Media (`media`) at `/media/items`
publish the configured listing workspace rather than a schema workbench target.
The form at `/media/publication` is `media-publication-requests`, requires all
read/create/validate/requestApproval and Process read/start navigation permissions.
Capability metadata is static across runtimes: publication navigation is ACTIVE
as a supported surface, not evidence that initiation is currently qualified.
Both workspaces declare
`ownerSelector:{runtimeRoleCode:'WCMS_STAGED',publicationRole:'STAGED'}`;
the generic Axis renderer must resolve that exact registered owner, never
silently select Online. The API always
rechecks installed readiness; navigation configuration is not qualification.

Workspace endpoint descriptors use `/nodics/media/v0/library` and
`/nodics/media/v0/library/publications`: the native generic renderer resolves
absolute paths against the selected origin, not against its module prefix.
Projects changing the configured API prefix must override these descriptor
leaves consistently; no host or credentials are embedded in metadata.

The generic form uses FIELDS transport, `mediaCode`, decimal-text `versionId`
and an IDEMPOTENCY field named `publicationCode`. It does not use MODEL transport
or accept arbitrary publication-domain/root/source-version bodies. Optional
`mediaCode`/`versionId` URL context only prefills the form; it is not authority.
The listing declares a bounded `rowNavigation` action to `/media/publication`,
passing only the selected row's code as `mediaCode`. The form's `readSource`
performs a fresh GET `/nodics/media/v0/library/{mediaCode}` with no query/body,
then resolves and freezes its required `mediaCode`/`versionId` fields from the
inspected record. No identifier copying or version from a stale list is needed.
The generic Axis renderer must find exactly one returned `requestPublication`
command matching the fixed POST method and both inspected code/version fields
before enabling submission. A denied, changed or failed inspection clears stale
eligibility. Returned command paths are not executable routing authority.
The operator must explicitly submit the form; navigation and inspection never
POST, grant permissions, install workflows or approve/activate publication.

Override desired presentation leaves in `media.library.workspace` and
`media.library.publicationWorkspace` through existing module/project/runtime
configuration. Preserve fixed owner endpoints, DTO field names, permissions,
version semantics and strict BackOffice workspace validation. Mergeable service,
facade and controller exports remain replaceable through normal hierarchy.
Do not copy them into Kickoff or add a project-level publication implementation.

## Verification And Deployment

The explicit `media:mediaPublicationWorkflow` release advances from `1.0.0`
to `1.0.1` using the SAME `mediaPublicationApproval` definition code. The existing
Process installer prepares a successor draft and publishes a new immutable
numeric version (v2 when v1 is already installed). The original `init-v002`
payload and running v1 instances remain unchanged; a fresh installation may
publish the new policy as its first numeric version. Never infer release
qualification from numeric version 2 alone, borrow CMS approval, or install a
parallel Media workflow code.

The successor declares native `actorPolicy` requiring
`publish.lifecycle.approve`, enterprise context `enterpriseCode`, and requester
context `requestedBy`. `mediaReview.policy.decisionContract` supplies the exact
seven-field APPROVAL contract with required rejection reason, maximum 1000
characters. The existing nPublish actor mapping verifies the stored maker;
authenticated login ID is journaled with the pending publication revision and
selected immutable Process version. Neither body requester nor service fallback
can supply it. Process enforces a different native reviewer; no approval grant
is added. Existing reviewer assignments remain the supported customization path.

Library readiness verifies the current published candidate's actual actor and
decision policies. Legacy v1 and policy overrides that weaken these guards are
blocked for NEW requests with `PROCESS_MEDIA_DECISION_POLICY_REQUIRED`.
Operators explicitly select this release on the Process destination, validate,
then install/update through Axis. Existing v1 tasks require separately governed
Process recovery, not generic completion, automatic retirement or repinning.

Run `node --test nodics.wcms/modules/media/test/mediaLibraryContract.test.js`
from the framework root. Isolated fixtures cover projection/privacy, tenant and
enterprise denial, injection/page bounds, ambiguous/provider failures, true
CURRENT model prerequisite, missing operation grants, stale version rejection,
real Media createGoverned delegation, stable reference retry, no automatic
approval/activation, callbacks and strict BackOffice metadata validation.

This source does not enable schema APIs, version policy or publication providers;
it does not import workflow/data, backfill metadata, restart runtimes or certify
connected storage/Process/target transport. Retained-provider defaults remain
off. Main owns runtime selection and CMS dependency coordination; BackOffice
owns refreshed registry/permission projection; Axis owns route presentation and
the joint visual acceptance. Canonical framework product documentation may be
promoted by its documentation owner; that shared source is outside this batch.
