# BackOffice AI Examples

When extending catalogue renewal, an unchanged observation writes only
`lastObservedAt` with the existing `catalogueRevision` predicate. Do not send the
previous full metadata snapshot: a different runtime may already have added new
membership without changing that administrator decision revision. Preserve fresh
canonical/legacy reads and normal reconciliation on a CAS miss. The interleaving
and administrator-race cases in `test/functionalModuleHeartbeatWrite.test.js`
demonstrate the boundary; no timeout, lease or activation change is needed.

Future examples should show safe module registration, catalogue filtering,
client-safe connection metadata, and project overrides. Examples must not
contain usable credentials, arbitrary remote URLs, or frontend executable code.

A project selects `backofficeApplicationInitialization.target.connectionName = "contentStaged"` once. One profile can override that connection and timeout; a disabled product profile requires explicit customer opt-in. A routing-only package delta waits for owner registration.

Acceptance consumers read the selected environment through nTooling, then use
`projectRuntime(profile, { role: "WCMS_STAGED" })` (or the capability's own role).
Override an ambiguous role with an explicit server selection; reuse its port and
launch descriptor rather than repeating either in environment acceptance metadata.

Operator-triggered application and remote activation imports forward the
authenticated human bearer to the configured nImport owner. Require a human
principal and bearer before execution; do not substitute the group-free runtime
credential or add administrator groups to it. Status/preflight retains the scoped
runtime credential. nImport still enforces the operator's import permission, tenant,
release governance and schema access at the destination.
## Health-only module refresh

A callable registration may publish health coordinates without an optional
`backoffice.discovery` descriptor. An authorized explicit module refresh observes
its existing readiness endpoint and acknowledges `discoveryRequested: false`.
Do not add an OpenAPI path or enable discovery to make that operation work.
When the owner contributes discovery, the same explicit refresh uses the shared
eligibility and strict native URL checks. See the composed owner regression in
`test/backofficeHealthRefreshDiscovery.test.js` and the [contract](../contracts/backoffice-governance-contracts.md#explicit-module-health-refresh).

Customize session guidance through the existing `backofficeAxisPolicy.sessionRecoveryPresentation` source fields. Keep both bounded nonempty strings; explain saved/checkpointed work and pending-action inspection. A PUT policy update must not persist a copy of these source defaults.

For repair qualification, preview one owner target, execute with a stable idempotency key, restart the dispatcher and repeat the identical request. Confirm the same durable receipt and no second provider dispatch. A conflicting key remains locked while evidence is uncertain; owner reconciliation may close only the original effect. See `test/backofficeDurableRepairEvidence.test.js`. Generic batches stay disabled.
