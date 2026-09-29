# commsSchema contracts

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
