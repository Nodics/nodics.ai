# Communication verification contract

`commsVerification` owns reusable verification challenge mechanics; `commsSchema`
owns private challenge records and Communication Core owns delivery. Profile
retains identity, membership, approval, continuation, provisioning and sessions.

Persisted operations are opt-in internal capabilities, disabled by default.
Pure calculations are not persisted proof. Preserve trusted tenant/purpose bindings,
single-use consumption, managed concurrency, uncached acknowledgement checks and
secret-free storage. A read-only consumed-proof receipt never authorizes a second
business execution. Public registration, live providers and Axis qualification
remain separate gates.

Read [owner guidance](../../AGENTS.md) and [worked examples](../examples/README.md).
The adjacent [complete verification lifecycle contract](verification-lifecycle-contract.md)
preserves all original details, examples, policy tables, diagrams and qualification
limits. Customize only through normal later-loaded policy and service members;
do not copy the verifier, create another challenge store or weaken its invariants.
Verification commands and deferred integration gates remain in the complete guide;
this documentation-only move executes no tests or runtime operations.

## 1. Ownership, purpose and qualification level

See [1. Ownership, purpose and qualification level](verification-lifecycle-contract.md#1-ownership-purpose-and-qualification-level).

## 2. Authorised context and binding

See [2. Authorised context and binding](verification-lifecycle-contract.md#2-authorised-context-and-binding).

## 3. Policy and supported customisation

See [3. Policy and supported customisation](verification-lifecycle-contract.md#3-policy-and-supported-customisation).

## 4. State model and operation sequence

See [4. State model and operation sequence](verification-lifecycle-contract.md#4-state-model-and-operation-sequence).

### Issue

See [Issue](verification-lifecycle-contract.md#issue).

### Verify

See [Verify](verification-lifecycle-contract.md#verify).

### Consume

See [Consume](verification-lifecycle-contract.md#consume).

### Replace or cancel

See [Replace or cancel](verification-lifecycle-contract.md#replace-or-cancel).

## 5. Persistence, concurrency and fail-closed behaviour

See [5. Persistence, concurrency and fail-closed behaviour](verification-lifecycle-contract.md#5-persistence-concurrency-and-fail-closed-behaviour).

## 6. Errors and safe recovery

See [6. Errors and safe recovery](verification-lifecycle-contract.md#6-errors-and-safe-recovery).

## 7. Required integration gates still open

See [7. Required integration gates still open](verification-lifecycle-contract.md#7-required-integration-gates-still-open).

## Read-only recovery of a consumed-proof receipt

See [Read-only recovery of a consumed-proof receipt](verification-lifecycle-contract.md#read-only-recovery-of-a-consumed-proof-receipt).

## Remote owner transport

See [Remote owner transport](verification-lifecycle-contract.md#remote-owner-transport).

## Documentation

Canonical framework documentation:

- [Communication overview](../../../commsCore/data/docs-v001/records/documentation/commsCoreDocumentationComponentData.js)
- [Email and SMS templates](../../../commsCore/data/docs-v001/records/documentation/commsCoreDocumentationComponentData.js)
