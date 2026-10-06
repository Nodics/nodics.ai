# Process Approval Bridge

## Ownership And Interfaces

`DefaultPublicationApprovalWorkflowService` implements the existing nPublish
workflow provider interface: `reference(publication)` and
`requestApproval(publication, request)`. Select it through
`publish.providers.workflowProviders[domain]`; do not add another provider
registry, approval lifecycle or publication store.

`DefaultPublicationApprovalCallbackService.applyDecision(request, scope)` takes
`scope: { domain, actionKey }` from a domain controller's fixed, bounded policy.
It never accepts that scope, a decision, or publication evidence in the callback
body. Its result is `{ status: 'COMPLETED', output: { publicationCode, state,
revision, targetVersion } }` for Process's existing action adapter.

Process owns definition installation, runtime admission, instances, tasks,
decisions, expiring claims, incidents and retries. nPublish owns publication
transitions and their atomic audit journal. Domain modules own graphs, action
allowlist declarations, snapshot validation and target application. Customer
layers own actual reviewer assignments and deployment connection selections.
No definition is installed implicitly by either bridge service.

## Configuration Contract

The owning integration declares inert defaults in nPublish properties and
contributes domain entries from the appropriate domain modules. The service
requires this shape; missing entries reject rather than selecting CMS:

```js
publish: {
    approvalWorkflow: {
        target: {
            connectionName: 'process',
            connectionType: 'abstract',
            runtimeRole: 'PROCESS',
            timeoutMs: 5000
        },
        domains: {
            example: {
                ownerModule: 'exampleOwner',
                definitionCode: 'examplePublicationApproval',
                actionKey: 'exampleOwner.applyPublicationDecision',
                sourceRuntimeRole: 'EXAMPLE_STAGED'
            }
        }
    }
}
```

The runtime must have `runtimeRole.publication: 'STAGED'` and the exact configured
`runtimeRole.code`. An explicit remote-only Process connection is mandatory;
`default` is rejected. Domain policy is shared capability configuration, not a
customer-specific wrapper or copied runtime implementation.

The start request uses the existing `POST /instances` API with the original
caller's bearer token and permissions. No service credential is substituted for
a missing user token. Process remains responsible for `process.instance.start`.
The deterministic instance identity binds domain, root, immutable source,
correlation, configured definition/action and pending publication revision.
Requests carry only this bounded context and the configured definition code.
The bridge does not send a transport `Idempotency-Key`: that header enrolls
Process in the separately deployment-qualified command-receipt protocol. Native
instance identity and its immutable start fingerprint provide this bridge's
replay contract even when optional command receipts are disabled. Starts remain
single-attempt; neither receipt policy nor caller authority is changed.

## Integration Prerequisites

**Do not enable this provider until the following owner contracts and
cross-owner tests are qualified together.** The bridge implementation and isolated tests
alone do not establish safe runtime integration.

1. The existing Process `startInstance` handles an explicit instance code
   idempotently without overwriting a stored instance. Exact definition/context
   replay returns existing state; a different identity rejects. Concurrent starts
   and lost responses require create-only/CAS behavior through the existing
   generated service boundary. A get-then-save or transport idempotency header
   alone is insufficient. Preserve its operational admission and caller permission
   checks. Do not create another start route or workflow repository for publishing.
   Its immutable start fingerprint and completion marker are separate from mutable
   runtime context. Historical instances without a fingerprint and interrupted
   initial entry reject replay; operators must inspect them through Process's
   existing recovery surface, never overwrite or automatically restart them.
2. The existing `claim` response additionally returns the stored instance's
   `definitionCode` and immutable `version` within `instance`. These values must
   come from the same Process instance that grants the claim, never the caller or
   context object. The bridge intentionally rejects the older response shape.
   Existing consumers remain compatible with these additive fields.
3. Domain graphs must use the existing remote action allowlist with
   `requiresCompletedTask: true`, the fixed owning module action key, the owning
   Staged callback route and explicit target role. Product may contribute a shared
   graph for its related Commerce publication domains; Media owns its graph and
   action. Process must receive the domain-owned, destination-qualified EXPLICIT
   releases through nImport's existing selection, validation and installation APIs.
   Do not rewrite CMS or Editorial definitions or silently auto-install missing
   graphs from a publication request.
4. Callback routes must be internal service-token operations and require the
   existing internal permission. Controller scope must be fixed or constrained by
   a capability-owned allowlist; never forward arbitrary request scope. The local
   runtime credential claiming Process must own the domain target module.

The Process implementations have independent replay/concurrency and claim tests.
They do not establish that a domain graph, callback or target has been installed
and qualified together. A successful replay of an already completed workflow
also does not prove transport-loss recovery during its first node entry.

These are integration requirements, not permission to bypass failed claims or
to accept the fixed CMS callback's caller-provided decision body. The bridge
does not modify Process services, routes, domain graphs or shared configuration.

## Authority And Recovery

Read-only operations diagnostics include `pending` using the existing bounded
repository selection and safe reference projection, independently of `stuck`.
This allows recovery of the original publication identity after an interrupted
client session, including records with no usable age timestamp. Pending is not
failure, approval, liveness evidence or permission to replay. Inspect the exact
publication and Process state before any explicitly selected recovery action.

### Native Requester Binding

A domain may select `requesterBinding: 'NATIVE_ACTOR'`, with `reviewNodeCode`
and `reviewPermission` in its approval workflow policy. Before the pending-state
CAS, `approvalEvidence` requires the authenticated human access principal,
matching tenant/enterprise, and the stored publication's `requestedBy` equal to
the existing publication lifecycle `getActor(request)` mapping. It takes the
requester's login ID only from authenticated `authData.loginId`, never from body
or publication input. This explicitly aligns with Process's existing login-ID
actor-policy namespace; a principal ID is not guessed to be a login ID.

The original bearer reads the selected published definition and bounded version
list, verifies its actor and typed decision policies, and rechecks the current
pointer. The atomic pending journal records `requesterBinding`, `requestedActor`,
`requestedBy`, `workflowVersion`, and the deterministic `instanceCode`. Process
starts with that explicit immutable version and content-free context. The start
response and claimed callback must match the journaled version and requester.
A generic Process start with another requester or an older version cannot grant
publication authority, even if its instance code matches. No additional registry,
principal store, body flag, service-token substitution or permission grant exists.

Retries use the committed pending journal, not a newly selected current version.
Legacy pending journals without this marker retain their original callback
context and version; they are not repinned or upgraded. They cannot silently
start a newly requester-bound cycle. New bound cycles require the native maker
and the current qualified candidate; legacy domains without the policy retain
their existing behavior. Process independently enforces the published policy's
review permission, tenant/enterprise, native requester provenance, typed approval decision
and required rejection reason. Source tests do not qualify deployed providers.
The requester may approve with the required access rights; requester binding
records provenance and does not impose separation of users.

Callbacks carry exactly `{ instanceCode, executionCode }`. The incoming principal
must be a verified Workflow runtime. The target uses its own scoped runtime
credential through nService to claim `/instances/:instanceCode/actions/claim`;
it never forwards the incoming Process credential or elevated persistence groups.
Process enforces single use, expiry, action key, source runtime and deployment
scope. The claim supplies the stored completed task decision, actor and context.

The bridge additionally checks definition/version, task/node evidence, exact
execution handle, controller domain/action, deterministic workflow reference,
tenant, enterprise, source version, root, correlation and pending revision.
Only after a valid claim and bounded source context does it acquire nAuth's
existing local system auth data to read the publication and invoke its owner.
Original principal metadata is retained; the incoming request is not modified.
Persisted source/scope mismatch rejects before any publication mutation.

Approval calls nPublish `approve`, then `activate`; rejection calls `reject` and
never deploys. Each transition retains nPublish's CAS and atomic audit journal.
A response-loss retry uses a fresh Process claim and must match the committed
decision journal, including task, node, actor, definition/version, source,
correlation and original pending revision. Only the execution handle may change.
Matching committed APPROVED/ACTIVATING state can resume activation; ONLINE and
REJECTED return their result without another transition. A later revision,
conflicting decision, missing journal or FAILED state does not inherit approval;
use the existing governed recovery and new approval cycle. No success is returned
for incomplete target application.

Operators install and verify definitions before enabling publication, review
tasks through Process, and recover transport failures through its existing
incident/retry APIs. Developers customize supported configuration and services
without weakening scope or replay contracts. Maintainers and AI tools must test
the effective later-layer implementation, not only the default bridge. Business
users receive Online only after owner activation succeeds; task completion alone
is not publication success.

## Verification Boundary

Run `node --test nodics.foundation/modules/nPublish/test/publicationApprovalBridge.test.js`
from the framework root, together with Workflow's `processStartReplay.test.js`
and `processRemoteActionAdapter.test.js`. The bridge suite exercises the real nPublish lifecycle over isolated
persistence and transport, with positive/rejection/custom-domain behavior,
caller-decision denial, scope/correlation mismatches, stale claims, committed
replay, failure and CAS concurrency. It does not claim real Process start/claim
integration, installed graph qualification, HTTP authorization or live database
atomicity. Those gates must pass before enabling the provider.
