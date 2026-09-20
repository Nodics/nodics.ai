# workflow AI Contracts

This folder contains workflow capability contracts inside `nodics.process`.

Use it for rules that coordinate workflow schemas, services, APIs, ownership boundaries, compatibility requirements, and migration decisions from the archived workflow family.

## Remote action authority

The existing `DefaultProcessRemoteActionAdapterService` persists the current
remote action in `processInstance.activeRemoteAction`. It is Process runtime
state, not a second queue, credential store or configuration registry. The
published definition, selected action allowlist and stored instance determine
the target and context. Decision protocols marked `requiresCompletedTask` read
the completed task's decision and actor; callback/request bodies cannot replace
that evidence. Task completion uses an atomic status precondition before advancing.

The adapter validates its current nAuth service credential and instance binding,
then sends only `{ instanceCode, executionCode }`. Existing nService transport
keeps explicit connection selection, remote-only dispatch and one attempt.
`process.remoteActions.maximumExecutionAgeMs` defaults to 30 seconds; target
connections and timeouts remain later-layer configuration.

`POST /instances/:instanceCode/actions/claim` is an internal Workflow capability
operation under `moduleInternal`, service-token authentication and the existing
internal route permission. Its body identifies `executionCode`, `actionKey` and
`sourceRuntimeInstanceId`. The target runtime must own the target module in the
same tenant, enterprise, project and environment. The instance must still be
running/waiting and the exact execution READY and unexpired. An atomic
READY-to-CLAIMED update grants it once and returns stored context, decision,
node, task and actor. Identifiers alone never grant execution.

Completion/failure retires the handle. Concurrent claims, wrong runtime/tenant,
wrong operation, expired handles and repeats fail. An interrupted attempt stays
bounded by expiry and follows existing Process incident/retry operations; it is
not silently reissued. A governed retry creates a fresh handle. Domains retain
idempotency against their own committed effects when a response is lost.
Process instance/task and immutable version schemas expose generic read/search
only; owning lifecycle and publication services retain their internal writes.

The focused `test/processRemoteActionAdapter.test.js` invokes the real lifecycle,
claim boundary and Editorial decision service over isolated persistence. It
covers task-policy denial, stored-decision precedence, scope failures, forged and
expired handles, concurrent task/claim races, source correlation and response
loss before retry. Actual distributed provider/HTTP acceptance is separate.
