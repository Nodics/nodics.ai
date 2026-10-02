# Private Credential Retirement

## Ownership And Admission

`DefaultModelConcurrencyService.retireCredential(request, dispatch)` wraps the
existing generated update, not a second credential store or direct provider path.
`dispatch` must call the actual generated Password update with that exact request.
Authorization, tenant model preparation, validators, interceptors, cache/event
effects and normal failure handling remain owned by the generated pipeline.
Private WeakMaps identify the exact request and the exact provider CAS input;
copied objects and enumerable body/options flags confer no admission.

The effective model must declare `credentialRetirement` with `enabled:true`,
`writerCoverageQualified:true`, `revisionField:'revision'`,
`credentialField:'password'`, `activeField:'active'`,
`evidenceField:'identityLinkRetirement'`, and the exact private mutation owner
`ownerService:'DefaultCanonicalHistoricalIdentityLinkService'`. That owner must
recognize the exact transient generated request through `ownsWrite`.

Existing `backoffice.concurrency` must explicitly be managed with a declared
int/long `revision`. The unversioned prepared model must use primary key `code`
and expose actual `compareAndSetItem` plus `credentialRetirementCapabilities()`
reporting contractVersion 1, revisionCas and metadataOnlyReadback true. A capability
declaration is not installed writer-coverage evidence. Unsupported/custom providers
fail closed until they implement and qualify the same semantics.

## Exact Primitive

The original query contains only immutable `_id`, `code`, `loginId`, original
positive safe `revision`, `active:true` and absent `identityLinkRetirement`.
The patch contains only `active:false` and the exact `{auditCode,fingerprint}`
marker. No plaintext or stored hash is in the retirement predicate or patch.
The wrapper freezes the original tenant/query/patch intent; generated `_id`
conversion is allowed, but changing another target, token or marker rejects.
Missing/zero/overflowing original revisions reject; this command never adopts
generic legacy-token-zero behavior or manufactures a counter.

`DefaultModelsUpdateInitializerService.executeQuery` detects only the active
private command and calls `executeCredentialRetirement`. It cannot fall through
to unversioned `updateItems` when model qualification is missing. The existing
managed `execute(...,'update')` performs the actual scoped provider revision CAS,
increments once, never upserts, and retains the stored credential body untouched.
A reset advancing the same revision defeats retirement; a later reset must
respect inactive/retired state under its own qualified owner contract.

The actual Mongo `compareAndSetItem` obtains a fixed metadata-only projection
from the exact private CAS input. Returned fields are `_id`, `code`, `loginId`,
`active`, `revision`, and `identityLinkRetirement`, never `password`. Callers
cannot select this projection using flags. The primitive verifies the exact next
revision, inactive state, unchanged identity and original marker before claiming
acknowledgement. Ordinary generated CAS behavior is unchanged.

## Failure And Recovery

The wrapper returns only `{attempted,acknowledged,revision?}`. A successful-looking
generated response without the actual primitive is rejected. Failure before the
provider CAS attempt is rejected, not treated as lost acknowledgement. Failure
after an attempt is uncertainty, not proof of persistence or permission to retry
blindly. The business owner must freshly reconcile exact original identity,
inactive state, original revision plus one and the original marker through its
private generated reader. Missing/different evidence fails closed. WeakMap
admissions end on settlement, including failure.

This is one-record optimistic concurrency, **not** an atomic multi-record link
or crash-durable journal. Profile's existing private staged audit and held Team
fence own link recovery. There is no compensation restoring credentials.

## Installation And Customization

Default enablement and writer qualification remain false. Before opting a live
Password schema into managed counters, owners must migrate original records to
positive revisions and adapt **every** create/reset/recovery/change/remove/import
writer to original-token CAS and retired-state guards. Merely adding this policy
or enabling a linking route does not establish that coverage. Schema/config,
framework writer source support is described in
[Password Writer Revisions](../../../../../../nodics.platform/modules/profile/llm/contracts/password-writer-revisions.md).
Runtime migration and deployed/custom writer inventory remain separately approved
gates; source support is not installed writer qualification.

Later layers may strengthen validation or supply another supporting provider;
they may not bypass private admission, revision/identity fencing, generated
authorization or metadata-only return. Privacy qualification also covers proof
reads, driver/APM capture and upstream raw bodies; hash-free retirement does not
eliminate the private stored-hash reads needed for original password proof.

Fixtures: `../../test/credentialRetirementPrimitiveContract.test.js` covers actual
generated dispatch and Mongo CAS projection with controlled provider doubles,
reset races, lost acknowledgements, fake success, altered intent and unsupported
models. These fixtures are authored **not run**; live concurrency, effective
custom layers and privacy capture remain joint acceptance gates.
