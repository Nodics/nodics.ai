# Governed Property Read Fences

This private, default-disabled prerequisite holds one already committed tenant
property revision while an admitted framework owner performs its operation. It
does not execute that operation, grant access, enable Copilot deletion or qualify
a deployment for destructive maintenance.

## Preparation

1. Configure and validate existing governed-property persistence and its unique
   identity index. No fence can be acquired against absent committed state.
   Set `runtimePropertyGovernance.persistence.requireDurableJournal: true` only
   with the qualified generated/provider protocol. All governed reads and writes,
   including fence acquisition/release, then use journaled-majority writes and
   primary-majority readback. Ordinary mode cannot acquire or release fences.
2. Keep `runtimePropertyGovernance.readFence.enabled` false until the consuming
   owner has a documented operation journal, terminal evidence and recovery path.
3. Add an explicit keyed owner admission in deployment configuration. Do not
   expose admission, tokens or acquire/release methods through a browser API.
4. Verify all property writers use this owner and qualify database durability and
   failover behavior independently. Ordinary generated CAS is not proof of
   journaled-majority durability or distributed rollout acceptance.

## Private Owner Sequence

1. Review current committed properties and retain their exact revision.
2. Persist the consumer's operation identity using that consumer's canonical store.
3. Call `DefaultRuntimePropertyReadFenceService.acquire` with the trusted request
   and exactly `{ ownerModule, operationCode, revision }`.
4. Acquisition atomically matches the existing revision and absence of a fence,
   then checks readback. Any conflict or uncertain acknowledgement stops progress.
5. Retain the private returned token only in the owning recovery context. Never
   include it in logs, prompts, ordinary API responses or business review text.
6. Execute only the independently authorized, qualified consumer operation.
7. Prove that operation's terminal state before calling `release` with the exact
   original actor, owner, operation, revision and token.

```text
Review revision -> acquire CAS -> consumer operation -> terminal evidence -> release CAS
                       |
                       +--> property commits reject while held
```

## Uncertainty and Recovery

An acquire response can be lost after the write. `inspect` reads only the exact
original binding; it does not acquire again or declare the consumer complete.
An existing fence has no timeout, automatic takeover or administrative force-unlock
in this contract. A release acknowledgement alone never proves the consumer's
outcome. Lost release acknowledgements require inspection, not repeated mutation.
Disabling new acquisition does not prohibit inspecting/releasing an existing
matching fence. Persistence must remain available for either operation.

The existing governed-value record carries the optional fence. Property revision,
approved values, sequence and audit do not change on acquire/release. Every normal
property commit rejects an observed fence and atomically excludes a fence acquired
after its refresh. First commits use explicit insert-only saves to avoid replacing
a competing committed/fenced record.

Run `test/runtimePropertyPersistence.test.js`, `runtimeActivationConcurrency.test.js`
and nDatabase's insert-only-save contract. Local doubles test races, failed/lost
acknowledgements, restart preservation, exact release and unchanged property audit;
they do not prove storage-provider failover safety. Destructive consumers remain
disabled until their own persistence, deployment and recovery contract is complete.
