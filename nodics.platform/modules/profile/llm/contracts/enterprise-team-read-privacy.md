# Enterprise Team Read Privacy

Owner: existing Profile Team, Membership and Registration services. This is
item 27 source coverage, not behavioral or installed-release qualification.
Read privacy is mandatory even when all mutation qualification flags are false.
No new registry, datastore, tenant authority, route or system-auth exception exists.

## Exact Private Reader

Team exports:

```js
ownsEnterpriseRead(request);
readEnterpriseEnvelope(owner, request, execute);
enterpriseReader();
readEnterprise(tenant, query);
enterpriseForAccess(code);
assignment(code, history);
redactEnterprise(request, response);
validateEnterprisePublicRows(rows);
```

The private WeakMap holds only one unchanged generated Enterprise request object
while its read executes. The digest binds tenant/query/options/pagination. Clone,
changed selector, copied system credentials, body flag, missing scope and another
owner cannot obtain Team-private fields. Admission always clears in finally,
including failure. Tenant reads never receive Team admission.

Private request shape requires a nonempty owner-resolved tenant, owner-built
query, recursive:false, skipItemCache:true, first page and safe page size 1..101.
Team exact reads use two rows and the existing strict Profile envelope parser;
ambiguity rejects. Generic guard inventories retain their separately qualified
complete-count bounds. Removal retains its 101-row overflow refusal. Public
projection has separate bounds; a large public query does not become private.

Every Team enterprise authority, lease/readback/recovery/workspace/save/remove
path now explicitly uses this scope. Team assignment calls pass an explicit
reader; ordinary Membership assignment/read calls do not. Registration's
`current` provisioning path selects Team's explicit access reader. Public
registration enterprise labels and identity inventory need no Team evidence.

Membership exports `enterprise(code, reader)` and extends
`assignment(code, history, enterpriseReader)`. Only trusted internal code may
provide the callback; a nonfunction rejects. An explicitly requested private
reader that is not invoked by Management rejects instead of silently accepting
redacted evidence. This detects incomplete shared integration; it is not a
fallback or qualification flag.

## Shared Integration

Main owns these shared changes; Consent's owner owns its admission/redaction.
The callback interface is `(owner, request, executeConsentRead)`. Keep the exact
bounded generated request and every existing envelope/active/hierarchy check.

```js
// Management.retrieveEnterpriseForAccess(enterpriseCode, privateReader)
if (privateReader !== undefined && typeof privateReader !== "function")
  throw this.error("Enterprise reader is invalid");
const enterprise = await owner.readHierarchyRecord(owner, code, privateReader);
// Tenant read is unchanged: NEVER forward privateReader to it.

// EnterpriseService.readHierarchyRecord(owner, code, privateReader)
const execute = () =>
  consent && owner === SERVICE.DefaultEnterpriseService
    ? consent.read(owner, request)
    : owner.get(request);
const response =
  privateReader && owner === SERVICE.DefaultEnterpriseService
    ? await privateReader(owner, request, execute)
    : await execute();
// Preserve all subsequent existing validation.
```

Do not add Team admission to general hierarchy reads, Management service calls,
Membership.read or generic Consent.read. Compose scopes only at designated owner
paths. Consent.recoveryRecord's exact fresh Enterprise read additionally composes:

```js
await team.readEnterpriseEnvelope(owner, request, () =>
  consent.read(owner, request),
);
```

This preserves Consent recovery/creation parent default-administrator
classification without exposing the nomination in general generated reads.
Both scope owners keep independent markers and finally cleanup. Team admission
does not bypass Consent redaction; Consent admission does not bypass Team redaction.

Management.prepareDefaultAdministrator must receive private designation before
its existing nomination comparisons. Initial creation retains the acknowledged
internal save outcome; the reviewed retry get now selects Team.readEnterpriseEnvelope
with recursive:false, skipItemCache:true and page size two. These designated paths
preserve the pointer without admitting general create/form reloads. An owner may
add a fresh exact nomination lookup after `if (!nomination) return;`:

```js
enterprise = (
  await SERVICE.DefaultEnterpriseTeamAdministrationService.enterpriseForAccess(
    enterprise?.code,
  )
).enterprise;
```

Keep caller authorization, nomination role/email/pointer checks, tenant checks,
idempotency hash and invitation ownership unchanged. Never pass a redacted public
retry row into the nomination comparison, and never expose the private pointer
through configurable Management projections. Main excludes Team/Consent and
assignment-proof evidence even if projectedFields requests them.

Install `DefaultEnterpriseTeamAdministrationService.redactEnterprise` on
Enterprise postGet at index 41, preserving Consent's earlier redaction and shape.
There is no activation/qualification condition on public privacy or private reads.
The shared callback, designated owner migrations and redactor must land together.

## Public Projection

Team removes `teamOperation`, `teamRevision` and `defaultAdminAssignmentCode`
from canonical result arrays and pipeline success.result arrays, including nested
plain populated records. It preserves envelope/count/other fields. It deep-clones
rows with the existing lodash dependency and replaces the success envelope rather
than mutating shared/cached provider rows or cached success containers.

Validation runs before cloning. Successful generated get results must be arrays
of plain records; unsupported result shapes fail closed with the stable redacted
UNAVAILABLE error. Budgets are at most 1000 root records, 50000 traversed own
properties/binary bytes and depth 32. Cycles reject. These checks prevent an
unbounded clone/traversal even when the mutation guard is disabled.

Unsupported provider classes, proxies, maps, custom toJSON functions, accessors, symbols
on ordinary containers and non-enumerable record properties reject; no accessor
or custom serializer is called to infer safety. Normal exact Date, Buffer and
the installed MongoDB ObjectId scalar prototypes are preserved only with their
expected own storage shape and no extra properties. Invalid dates, adorned scalar
instances, unknown BSON classes and subclasses reject instead of skipping hidden
or custom-serialized private evidence. ObjectId storage is restricted to its
installed driver's expected 12-byte scalar keys. Buffers have no extra properties,
are individually bounded and participate in the total traversal budget.

## Deferred Acceptance

`enterpriseTeamReadPrivacy.test.js` authors public system-shaped reads with
qualification false; nested/cache-safe projection and typed scalar preservation;
exact private scope and finally cleanup; clone/changed-request refusal; explicit
Team versus ordinary Membership access; independent Consent/Tenant composition;
Registration.current access; save/remove default-admin protection; unsupported
provider/custom serializer/scalar-adornment/shape/cycle/budget negatives.

Its shared Management/Consent callback implementations are controlled fixture
substitutes, not installed acceptance. Existing registration/workspace fixtures
also use explicit isolated owner substitutes; they do not prove real hierarchy or
Tenant reads. Actual generated postGet ordering, mutation/readback, initial/retry
nomination, consent recovery/default classification, cache invariants and provider
scalar formats remain joint behavioral acceptance. No tests are run in this batch.
All mutation qualification defaults remain false.

Later layers may tighten private selectors or public projection bounds through
the effective exported receiver, but must preserve exact-request admission,
independent Consent scope, fresh Tenant validation, fail-closed shapes and cached
row safety. Never copy Team internals into a customer project or grant a body flag.
