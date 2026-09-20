# BackOffice AI Examples

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
