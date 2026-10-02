# commsSchema contracts

## Resource-backed message versions

`commsTemplate.sourceModules` is the explicit source allowlist for published
templates. Missing ownership never means any source. `commsTemplateVersion.resourceCode`
selects a module resource instead of inline subject/body; runtime validates the
exclusive representation and matching code, version, purpose and source before
creating an intent. Legacy text remains readable through the shared renderer.
Regenerate and install schemas before adopting core-v002/sample-v002 data releases.
No schema installation, import or queued-message rewrite is implicit in source changes.

Status: active Phase 1C. Communication schema contracts. Later-loaded projects may override implementation while retaining Communication ownership, security, audit, retry, and recovery invariants.

## Private managed verification challenge

The existing `commsVerificationChallenge` is also the persistence owner for
opt-in stored verification. Preserve disabled generic routes/BackOffice editing,
managed revision metadata, trusted binding/source, current code generation,
expiry/attempts and private proof/consumption fields. Do not introduce a second
Profile challenge schema or expose hashes through generated CRUD.

The generated concurrency owner initializes stored revision 1 from the explicit
zero creation token and increments subsequent revisions. Legacy records without
the bound-record metadata are not silently made usable. Generation and status
are authoritative; an older verifiedAt can remain history after replacement.
Invalidating proof uses a schema-valid empty string and epoch expiry rather than
null in non-nullable string/date fields. No plaintext secret/proof is stored.

Read the [verification contract](../../../commsVerification/llm/contracts/README.md)
and run its pure and persistence suites when these fields change. Schema source
must be regenerated and installed validation/route/concurrency checked in the
authorised runtime before enablement; source tests do not certify installed
schema privacy or replicated durability. No data reset/migration is implicit.


### Consumption-receipt verifier

`commsVerificationChallenge.consumedProofHash` holds a private hash of the consumed
proof solely for bounded, read-only receipt reconciliation. Keep generic routes,
BackOffice projection and event publication disabled for the challenge. Never expose
the raw proof, this verifier, or consumed operation hashes in an ordinary API result.
The field neither reactivates proof nor authorises repeated identity provisioning.
Qualify the existing schema installation/release path before runtime enablement.
