# Historical Linking Privacy And Retirement

The existing [membership contract](enterprise-membership.md) owns linking stages,
dual original password proof, private audit snapshots, retained evidence and
inactive final projections. This guide owns the replacement retirement boundary.

## Protected Entry

`prepare`, `commit` and `inspect` require
`DefaultLoggerService.assertSensitiveRequest(exactRequest)` **before** `takeInput`
or any proof copying. A missing/rejecting owner fails with the existing redacted
membership-unavailable error. Known proof data aliases are scrubbed on rejection
without evaluating proof accessors; frozen immutable external copies cannot be
zeroized. JSON/body/header `requestPrivacy` flags and copied envelopes confer no
entry authority. Trusted internal callers must build a detached owner request
and call `DefaultLoggerService.runSensitiveOperation(request, () => entry(request))`.
Do not turn inherited systemAuth or an ambient sensitive context into admission.

Main-owned transports must retain fixed POST DTOs, independent human platform
operator permissions, pre-body-read exact-request capture protection and private
admission propagation to the actual owner envelope. No proof URL/query selectors,
raw request dumps, secret-bearing API cache entries or unfiltered traces are
allowed. Responses are no-store and whitelist-only. Linking and Logger privacy
qualification remain false until actual deployed proxy/APM/provider/custom-layer
capture behavior is proved. Service scrubbing is defense in depth, not a substitute.

## Frozen Credential Preconditions

Both original accounts are independently proved using their original Password
and UserState owners. The fresh generated Password request must resolve an actual
qualified model supporting the
[nDatabase primitive](../../../../../nodics.foundation/modules/nDatabase/database/llm/contracts/credential-retirement.md).
Frozen audit facts add only non-secret credential `code` and original positive
`revision` to the existing immutable credential reference. Missing/zero tokens,
unsupported writers/providers and qualification drift reject before new principal
disablement. Old prepared plans lacking these fields require new review; they
cannot be adopted by guessing current credential tokens.

After the original principal is disabled, the historical password is independently
re-proved immediately before retirement. The generated update selects immutable
credential ID, code, login ID, original revision, active state and absent marker;
it never selects by plaintext or hash. The patch only disables and installs the
original audit marker. Actual generated managed CAS increments once and Mongo
returns fixed metadata without the stored hash. The original credential body is
retained at its owner and never copied into audits, results or canonical records.

## Exact Recovery

`LINK_PREPARED -> LINK_APPLYING -> LINK_DISABLED -> LINK_CREDENTIAL_RETIRED ->
LINK_COMPLETE` stays unchanged. Principal retirement, exact frozen inventory,
stage fingerprint CAS, API-key absence guards, stamp checks, expiry and explicit
recovery admission remain independent. Employee retirement keeps its existing
held Team/default/last-superadmin fence; customer linking grants no eligibility.

An already-retired original Password is recognized **only** by exact credential
identity/code/login, inactive state, original revision plus one and the original
audit code/fingerprint marker. An attempted CAS with lost acknowledgement can
advance only after this exact fresh readback. A competing reset, changed token,
wrong marker or absent evidence refuses recovery. Canonical proof remains fresh;
neither original retirement nor final replay changes the canonical credential.
Completion still leaves the historical projection inactive and disabled, grants
no access/consent, and never restores a retired Password.

## Remaining Gates

Source now includes the actual hash-free retirement primitive, not just a helper
or an attestation flag. Installed Password schema/revision inventory and complete
reset/recovery/change/remove/import framework writer support is now implemented
in [Password Writer Revisions](password-writer-revisions.md). Effective custom
writer inventory and runtime migration remain separate approved gates. Do not
enable managed counters before completing that migration and qualification. Linking
qualification, public transport, logger/APM deployment qualification and live
Team races remain unqualified. Current proof reads still handle hashes privately;
driver and argument-capture privacy must also cover those reads.

Profile's `../../test/canonicalHistoricalIdentityLinkContract.test.js` and the
nDatabase primitive fixtures are authored **not run**. They use controlled exact
privacy and provider doubles, not installed authorization or durability evidence.
Joint acceptance must exercise two proofs, wrong/copy/missing privacy admission,
reset-versus-retirement, no-match, lost acknowledgement, staged recovery and
redacted transport/log/trace output. No runtime writes or behavioral suites are
authorized by the presence of these fixtures.
