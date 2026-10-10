# Exact-Plan Setup Observation

## Status And Authority

Implemented, disabled by default, and not native-qualified by local tests.
See the [native review recipe](../examples/setup-observation-native-review.md)
for destination-derived release pins and explicit deployment adoption.
`POST /publications/setup/observe` accepts service tokens only, the
`serviceAccountUserGroup` route class and `publish.setup.observe`. nAuth recognizes
that permission but grants it to no default group. The normal router must verify
signature, expiry, security stamp, deployment module scope and exposure first.
The service independently requires the original non-system service principal,
explicit signed permission (a wildcard alone is insufficient), exact tenant and
one reviewed caller/plan allowlist entry. Existing generated schema-owner checks
run under a private child persistence context obtained from canonical
`DefaultIdentityGovernanceService.getSystemAuthData()` only after exact admission.
The external signed principal, groups and permissions are never modified. This
context reaches only fixed read-only source/target/installation/Media/CMS methods;
no lifecycle, installer, repair or financial action is reachable.

Configure only after reviewing the concrete deployment and source plan:

```js
publish: { setup: { observation: {
  enabled: false,
  maximumPlanBytes: 524288,
  maximumSourceBytes: 8388608,
  maximumSourcePayloadBytes: 4194304,
  profilePlans: { application: 'reviewed-plan' },
  targetObservers: {
    product: 'DefaultProductPublicationVersionProviderService',
    pricing: 'DefaultPricingPublicationService',
    inventory: 'DefaultInventoryPublicationService',
    tax: 'DefaultTaxPublicationService',
    promotion: 'DefaultPromotionPublicationService'
  },
  plans: { 'reviewed-plan': {
    moduleName: 'application.owner', path: 'config/setup-observation.json',
    checksum: '<sha256 of exact JSON file bytes>', revision: 1
  } },
  callers: { platform: {
    tenant: '<tenant>', enterpriseCode: '<service home enterprise>',
    serviceId: '<signed service identity>', projectCode: '<project>',
    environmentCode: '<environment>', serverCode: '<caller server>',
    instanceCode: '<instance>', assignmentCode: '<approved assignment>',
    plans: ['reviewed-plan']
  } }
} } }
```

Caller coordinates match the signed `runtimeScope` and `runtimeInstanceId`, not
headers. Destination server/runtimeRole and active environment must also match.
The service home enterprise remains unchanged. A separate target enterprise is
read only from the approved local stage; it is never rewritten into `authData`.
No automatic deployment assignment, group, permission or token grant occurs.
`targetObservers` is an explicit target-local hook selection, not an evidence
store or source publishing registration. Only select hooks for active domain
modules on the reviewed serving runtime. TARGET never requires source version
providers, domain adapters or workflows; SOURCE retains those existing checks.

## Reviewed Plan

The UTF-8 JSON plan has `contractVersion:1`, `code`, positive `revision`, `tenant`,
`profileCode`, `baselineCode`, `profileDigest`, `stages` and optional `baseline`.
On Platform, the configured module must own the profile. File reads are bounded, checksummed,
module-confined, symlink-rejecting and fenced by descriptor/inode/size/time checks.
Plans contain reviewed read authority, not observed READY state or copied receipts.

`profileDigest` is the observer's canonical SHA-256 of the entire effective profile
(profile plus target defaults) on the coordinating Platform graph. BackOffice
checks that digest and all current required BEFORE/AFTER descriptors before and
after dispatch. Remote graphs can discover partial or no BackOffice profiles;
they never compare those profiles or require a copied Platform configuration.
They validate exact locally approved plan bytes, tenant, receiving server/role
and their own source/target/receipt identities. There is no historical prerequisite
count. Each stage contains:

- `code`, canonical deployment `server`, `descriptor` from `stepIdentity(currentStep)`, and reviewed
  `enterpriseCode`; an operator-scoped stage must match `operatorEnterpriseCode`.
  The descriptor retains the authored connection alias. BackOffice checks the
  separate `server` against its existing `applicationTargetBinding` resolver;
  targets compare it directly to their actual server code, never guessed suffixes.
- DATA_RELEASE: `release` with exact `moduleName`, `releaseCode`, `sectionCode`,
  `dataType`, `version`, `checksum`, `sourceRoot`, `declaredFiles`, `installer`,
  `owningDomain`, `lifecycle`, `destinationRole`, `environmentScope`, retaining
  absent optional metadata as absent. nImport owns discovery and byte snapshots.
- GOVERNED_PUBLICATIONS: the descriptor contains the current `publicationPlan`
  (exact domain/rootType/rootCode/sourceVersion and source member references).
  `online:{server,runtimeRole}` identifies the actual serving destination.
  Optional `publications` entries narrow a code by observed `revision`,
  `targetVersion`, `operationKey`, `previousOnlineVersion`; none are required for
  bootstrap. No publication must already exist to inspect shared BEFORE stages.
- MEDIA_ASSET_MANIFEST: `manifest:{moduleName,path,checksum}` pins current source
  bytes; `assets` contains the reviewed exact Media-owned readiness descriptors.
  Original service enterprise must equal this shared Media scope. Metadata proof
  is not physical byte or Online activation proof.

Optional `baseline` contains `server`, `runtimeRole`, `enterpriseCode`, and
`descriptorDigest` of `DefaultCmsPublicationBaselineService.descriptor(code)`.
Optional `publication` hard pins can include its code/revision/root/source/target.
CMS's canonical descriptor determines publication identity when those pins are
absent. Legacy shared CMS journals and nImport installation receipts do not always
carry enterprise fields: the reviewed exact configured baseline/release grants
the read scope, and any returned contradictory tenant/enterprise is rejected.
Missing enterprise metadata is not presented as a signed foreign human claim.

## Bootstrap Review Recipe

The pure, non-routed helper
`DefaultPublicationSetupObservationService.describePlan(profileCode, tenant, code, revision)`
returns review material from current effective configuration and fresh canonical
nImport discovery. It performs no network calls, writes, installs or grants.
It resolves canonical stage servers through the existing BackOffice binding when
available, otherwise leaves them `null`. It intentionally leaves shared enterprise scope as `null`, Online destinations
and Media descriptors unselected. Destination-only releases absent from Platform
discovery are left `null`; obtain each exact pin with
`describeRelease(stage.code, stage.descriptor.dataType)` on that destination's
own canonical configuration graph. Review those against current owner configuration,
add the baseline descriptor digest, and bind the approved JSON bytes in `plans`.
An incomplete draft is not accepted authority. No final random activation key is
needed. Source version/config/release changes require explicit plan review and a
new checksum/revision; observation never edits or refreshes its own allowlist.

This helper is not a generator command, readiness registry or publication action.
The maintainer persists only reviewed input authority through ordinary project
source/config change control. Installed immutable Init/core/sample packs are not
edited, copied or regenerated by this feature.

## Request And Evidence

Closed request DTO:
`{contractVersion:1,planCode,checksum,revision,stageCode,mode}`.
Modes are `INSTALLATION`, `MEDIA`, `SOURCE`, `TARGET`, `BASELINE`.
TARGET additionally requires bounded `operations:[{code,operationKey}]` for each
configured root, obtained from the source read. These are lookup selectors only,
not approval or receipt claims. Target owners reread their actual pointer/receipt.

Publication SOURCE reads the exact generated nPublish request, original retained
source membership and approved activation journal/receipt. Unperformed roots are
non-current. Only legacy Product journals with an absent tenant/enterprise stamp may use
the registered Product owner's `getPublicationEnterprise(publication,request)`;
its sealed root must match the exact tenant/root/source and reviewed enterprise.
Explicit wrong/null/empty stamps and absent financial stamps never fall back.
No journal is backfilled. An exact uncached final journal reread fences owner
inspection against concurrent changes. TARGET reuses `observeSetupTarget(publication,request)` on registered
owners, returning actual `{version,revision,receipt}` without preparation, receipt
settling, repair or mutation. BackOffice compares publication/root/source/target/
operation/predecessor identities across SOURCE, TARGET and a second SOURCE read.
Financial action grants are neither checked nor widened for this read authority.
For the four typed financial policy owners only, a persisted absent predecessor
is projected as `null` after the owner proves its applied receipt against the
actual pointer, with matching reviewed tenant/enterprise, source fingerprint and
`expectedRevision + 1 === target.revision`. Missing or malformed evidence and
explicit foreign predecessors never acquire this normalization. No receipt is
rewritten or settled by observation; arbitrary target owners do not get this rule.

INSTALLATION rereads canonical nImport release discovery, every declared byte and
an exact bounded uncached generated installation receipt. CURRENT requires matching
version/checksum, successful status and a valid execution ID. Canonical typed
installers can finish without an import run; `runId` remains optional and is never
manufactured. The response's `checksum` is always the exact reviewed plan hash;
`releaseChecksum` carries the separate release hash. Plan/deployment response
bindings are sealed after owner output. This proves an exact
installed release, not current spending capacity, coupon eligibility, consent,
budget counters or financial/customer action authorization. Local selected owner
preflight remains unchanged and can still refuse. It does not invoke an installer.
The observer's separate source budgets are passed only to a private nImport
snapshot-reader instance; global installer bounds are unchanged. Budgets must be
positive safe integers, at most 64 MiB total / 16 MiB per payload, with payload no
larger than total. Default read budgets are 8 MiB / 4 MiB. They include the source
identity manifest and may require explicit reviewed narrowing or increase.

BASELINE reuses canonical CMS status, checks its exact generated publication and
approved journal, current Online CMS pointer and owner Media dependency proof.
Shared BEFORE readiness uses INSTALLATION/MEDIA without borrowing a human's
global import/core/CMS/upload permissions. Missing, denied, changed or ambiguous
evidence is never READY. All observations are repeated and policy/plan bytes
are rechecked before return; Platform separately rechecks its effective profile.
There is no cross-request evidence cache or store;
sequential observations do not provide a distributed transaction.

BackOffice `AUTHORITY_PENDING` observation failures include only an allowlisted
`reasonCode` from local binding, observation, authentication, router or tenant
errors. Unknown codes map to `ERR_BOF_00083`; messages, stacks, remote metadata
and credentials are never projected. This adds no diagnostic route or authority.

## Execution Isolation And Qualification

BackOffice uses proof only for readiness. Explicit local AFTER selection, original
human identity/enterprise, singleton dispatch and existing owner permissions still
govern writes. Unselected AFTER never submits or installs. Shared service proof
cannot initialize CMS, install BEFORE, impersonate another issuer, approve,
activate, prepare budgets or issue coupons. Default-disabled behavior is unchanged.

The capability must participate explicitly on every receiving runtime and Platform
before the route/service/default configuration exists. Activating `publish` does
not itself enable observation or grant permission. Target-only domains additionally
need the reviewed `targetObservers` map, not Staged source/workflow registration.

Local tests cover positive proof, no-publication bootstrap, current configuration,
wrong principal/deployment/tenant/enterprise/plan/source/revision, confinement,
fresh changes, permission non-granting and no write dispatch. Group-free signed
principal fixtures exercise actual generated `checkAccess` and all five Commerce
source/target descendant read methods under canonical private persistence context.
The explicit-project graph test loads all ten native source configurations and
tests target-only hook resolution with empty source registries; it writes no config.
These do not establish native signature/stamp admission, database/provider calls, service
deployment policy adoption or live financial qualification. Main owns the explicit
native grant/configuration, later build/restart and live acceptance.
