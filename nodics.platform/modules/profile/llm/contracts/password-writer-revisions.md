# Password Writer Revisions

## Inert Schema And Shared Enforcement

The Profile Password section declares optional `revision:long`, no default,
`backoffice.concurrency.managed:false`, and `credentialRetirement.enabled:false`
with `writerCoverageQualified:false`. No existing record receives a revision and
no counter or linking operation is activated by these source declarations.
Retirement field names and the private linking owner remain fixed. Explicit
retirement enablement without managed ownership fails closed in generated CRUD.

When managed ownership is separately configured after approved migration,
`DefaultModelConcurrencyService.getCredentialWritePolicy` applies ordinary
credential guards **even while retirement itself remains disabled/unqualified**.
New generated credentials initialize at 1. Existing save/update/remove requires
the original positive revision; legacy existing rows without a revision reject,
not silently adopt token zero. Generic writes cannot introduce retirement evidence
or use a stored hash predicate. An original retired row cannot be updated,
reactivated, overwritten by save or deleted. Atomic CAS additionally binds original
active state and absence of the retirement marker, retaining the revision race.
Unrelated schemas are unchanged. Legacy Password writes retain their existing
revision mode, but must satisfy the mandatory canonical ownership guard below.

## Mandatory Canonical Ownership

`DefaultPasswordSaveInterceptorService.guardSaveOwnership` and
`guardUpdateOwnership` run at pre-write index -60, before historical exclusions.
Employee and Customer preSave/preUpdate use `guardPrincipalCredential` at the
same index before nested writes. These integrity guards apply regardless of
managed-counter or retirement qualification flags; SystemAuth and imports do not
exempt a writer. Later layers must preserve this admission and native-read contract.

An empty generated insert query is removed before a historical exclusion can
turn it into a broad upsert. A new natural-key credential save is insert-only;
an existing match cannot authorize replacement by code alone. Existing writes
require the exact immutable Password ID, unchanged login/code and fresh original
owner inventory through the existing security-stamp inventory service. CMS
replacement options, operators, broad selectors, ambiguous/shared credential
references and owner changes reject with `ERR_PROFILE_CREDENTIAL_OWNERSHIP`.
Recognized retirement exclusions are flattened into the exact selector before
hashing, retaining the caller's original legacy condition or managed revision.
No current revision is synthesized. A missing managed token and a competing
revision remain the shared concurrency owner's errors.

Principal nested credentials must match the principal login. Existing relations
cannot silently be replaced with another principal's credential. Scope-only
`authVersion` updates neither read nor hash Password; ordinary scope invalidation
still uses its existing principal/stamp owner. Hashing rechecks ownership after
other pre-write hooks, so option stripping alone is not sufficient protection.

For native authentication, `readPrincipalCredential(tenant, person, kind)` reads
only the original referenced Password ID uncached and verifies matching login,
non-retired state and exactly one matching typed Employee/Customer owner. Cached
embedded hashes and code aliases are not credential authority. Missing or
mismatched/shared rows fail closed at authentication. Canonical linked accounts
continue through the existing Membership anchor owner, not this native path.

The fix prevents future cross-owner replacement and rejects already-corrupt
references. It does not restore deleted credentials, reset passwords, replay
bootstrap or authorize runtime repair. Corrupt persisted state requires separately
approved recovery or disposable-environment reset and fresh acceptance.

Normal inactive credentials without retirement evidence are not classified as
historically retired. Generic writes retain existing authorization with an atomic
original-state fence; recovery/bootstrap/import owners additionally require active
original credentials. Only the linking owner's private retirement command can
install the marker; it uses the actual [database primitive](../../../../../nodics.foundation/modules/nDatabase/database/llm/contracts/credential-retirement.md).

## Framework Writer Inventory

| Path                                   | Actual writer and configured contract                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Enterprise employee/admin registration | `DefaultEnterpriseRegistrationService.provisionOwned` uses insert-only deterministic Password generated save, never an overwrite. Fresh credential and completion re-ack now validate actual configured policy and positive token before adoption. Existing conflicting/inactive originals refuse.                                                                                                                                                                                                                                                                                                                            |
| Customer registration                  | `DefaultCustomerRegistrationService` supplies a nested new Password; `DefaultModelService.saveNestedModels` dispatches generated `saveAll`. No credential update or separate customer persistence path was found. New managed child credentials initialize once; an existing child update must carry its original revision.                                                                                                                                                                                                                                                                                                   |
| Generic Employee/User creation         | The existing `user.refSchema.password` saves nested objects through the same generated child lifecycle. Reference-only descriptors stay references and do not write Password. Ordinary unrelated Employee changes remain unchanged.                                                                                                                                                                                                                                                                                                                                                                                           |
| Local administrator bootstrap repair   | `DefaultMandatoryIdentityBootstrapService.reconcileLocalAdministratorCredential` freshly inventories configured administrators and resolves the original Password owner in both legacy and managed modes. Matching proof is a zero-write result. Repair uses generated update against the exact original ID, unchanged login/code and either original hash or managed revision, with active/absence filters and no upsert. It requires exactly one matched receipt and fresh readback (including the next managed revision). It never relinks Employee, creates a natural-code replacement or reactivates a retired original. |
| Password recovery/reset                | `DefaultEmployeeRecoveryService.complete` uses the fresh original credential and actual prepared model policy. Configured selectors are hash-free and revision-fenced; the private consumed continuation stores only credential ID/code/original revision. `confirmReset` requires that exact next revision, active original and matching proof before stamp/completion. Pre-write same-password and competing-version states cannot fake a reset receipt. Unmanaged reset retains its old conditional hash predicate.                                                                                                        |
| Administrative/general password change | Generated `DefaultPasswordService.save/update` uses the shared managed pipeline. The existing Password preSave/preUpdate interceptor still hashes plaintext. Configured updates require an explicit original code/revision and plain patch; no new change-password facade or authority is introduced.                                                                                                                                                                                                                                                                                                                         |
| Generic removal                        | Generated remove delegates to the same managed CAS with original token and non-retired state. Token-free convenience removers, bulk mutation, operators and dotted changes do not acquire implicit tokens or bypass the managed contract; unsupported selections refuse.                                                                                                                                                                                                                                                                                                                                                      |
| Local/remote/release/file imports      | `DefaultModelImportProcessService` reconciles managed `saveAll` tokens through fresh uncached generated reads, retains first snapshots across retries, rejects inactive or unmigrated original credentials, then uses ordinary generated save. Runtime fallback services and nested imports also invoke those pipelines. Source rows do not own technical revision values.                                                                                                                                                                                                                                                    |
| Historical linking                     | `DefaultCanonicalHistoricalIdentityLinkService` uses the private actual generated retirement primitive with exact original token, marker and recovery stages. It never uses the ordinary change/reset path as retirement admission.                                                                                                                                                                                                                                                                                                                                                                                           |
| Governed Local reset                   | Separately authorized environment destruction uses the existing opaque reset authority. This is not a generic credential remover, linking recovery or retired-account reactivation. Preserve that independent reset contract; no body flag substitutes for its authority.                                                                                                                                                                                                                                                                                                                                                     |

Direct-source inventory covered framework `src/**/*.js` owners across module
groups, exact `DefaultPasswordService` references, Password refSchemas, generated
save/update/remove dispatch, runtime import service generation and managed-import
reconciliation. Authentication, Membership, Consent, customer participation,
security stamps and migration assessment contain Password reads; they are not
additional credential writers. Source data contributes through the same import
and nested-save paths. This inventory is not an installed custom-writer audit.

## Owner Helpers And Recovery Limits

Reference Employee data may select `DefaultEmployeeService.ensureReferenceAll`
instead of `saveAll`. The bounded batch reads code/login conflicts uncached
through the generated service under the original import authority. An exact
active native Employee is a zero-write acknowledgement: source passwords, groups
and profile values are never reapplied. Inactive, linked, service, ambiguous and
conflicting identities reject. New records use generated insert-only save with
all credential guards intact; uncertain writes are not retried in the operation.
Only record codes leave the method. Later layers must preserve these rules.
This helper does not grant membership, reset credentials or reconcile access.
The focused fixture is `../../test/employeeReferenceImport.test.js`.

`DefaultPasswordSaveInterceptorService.managedPolicy(tenant)` resolves the prepared
`PasswordModel` from the existing configured Profile module owner. It never
infers counter ownership from the presence of a `revision` property. Missing
prepared models/owners reject. `mutationQuery(tenant, freshRecord)` returns either
an exact hash-free original-token selector or undefined in legacy mode. Existing
active state, identity fields and bounded positive next revision are mandatory.
SystemAuth does not exempt a writer from generated state/revision checks.

Managed recovery stores its original mutation metadata before consuming proof or
attempting persistence. A lost response is reconciled by fresh original readback
and proof, never a blind second password write. Disabling managed policy during
that attempt does not convert its receipt into legacy recovery. Bootstrap rejects
uncertain or malformed acknowledgements; it does not guess a saved reference or
auto-retry with a newer token. Registration remains insert-only with deterministic
checkpoint reconciliation and does not manufacture a migration token for an old
credential.

## Customization And Installation Gates

Later Profile layers may tighten policy or override these exported owners while
preserving original-reference/token fencing, retired-state rejection, generated
authorization and private recovery. Later providers must implement actual atomic
CAS. Custom direct/raw database writers are not supported credential lifecycle
extensions; inventory and migrate them through owning generated operations.

Framework writer support is now source-authored. Installed activation still needs
approved downtime/migration scope, positive original-record revisions, effective
indexes/provider behavior and **every deployed custom or override writer** covered
by the shared contract. No source change here performs runtime migration, enables
managed counters, changes qualification or declares all 37 items accepted.
Credential proof and ordinary reset writes still require qualified log/APM/privacy
controls; stored hashes in private reads are not public transport material.

### Cache And Bootstrap Authority

Bootstrap owner reads use `recursive:false, skipItemCache:true`; administrator
selection is a complete, counted security inventory rather than a cached populated
Employee. Native Employee/Customer password login and refresh explicitly preserve
those options through the selected `findByLoginId` owner. The fresh envelope must
contain exactly one matching login and a persisted principal ID. Native groups
are resolved separately from current group codes through the existing Membership
group reader with cache bypass; stale virtual permissions are not retained. Linked
projections do not turn projection groups into authority: their existing canonical
anchor/context owner still resolves credential and group authority.

Existing generated get cache lookup and population honor `skipItemCache`; this
does not flush a Redis namespace or silently substitute a cached principal after a
failed provider read. Native credentials still require one exact typed principal
owner with matching original reference and login. A populated retained relation is
accepted only by its exact `_id`, never by code or an embedded hash. Missing,
shared, retired, wrong-owner and unacknowledged originals fail closed.

An orphan credential left by an earlier rejected bootstrap is not adopted,
deleted, or relinked by this repair. Reconciliation of persisted orphan state and
runtime restart require separate explicit operator authorization and live evidence.

Focused fixtures are `../../test/passwordOwnershipPipelineContract.test.js`,
`../../test/passwordWriterRevisionContract.test.js`,
`../../test/employeeRecoveryContract.test.js`, and
`../../../../foundation/nDatabase/database/test/credentialWriterRevisionContract.test.js`.
They cover configured/legacy policy, fresh original bootstrap identity, recovery
next-revision receipts, generic create/change/remove, retired and competing state,
and retained import snapshots. The ownership fixture exercises real generated
wrappers, nested traversal, bulk/single save pipelines, historical exclusion hooks,
scope/stamp owners and managed concurrency against in-memory providers. Other
fixtures in that file cover the actual generated bootstrap update pipeline,
matching-proof zero writes, exact legacy ownership, bad acknowledgements, fresh
Employee/Customer finder transport and explicit generated cache bypass. Other
validation/cache/event infrastructure is explicitly stubbed; this is not installed
provider or live import acceptance. Focused source fixtures were executed on
2026-10-01; installed concurrency, deployed overrides, end-to-end flows and privacy
capture remain separate acceptance gates. Static checks are not behavioral
qualification.
