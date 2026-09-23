# nSystem AI Contracts

This folder contains module-specific AI/developer contracts for `nodics.foundation/modules/nSystem`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

Secured service-registry API exposure defaults to enabled for runtime registration/contract retrieval. Exposure never bypasses service-token, grant or route permissions. Standalone deployments can explicitly disable the category.

## Runtime configuration schemas and refresh propagation

Runtime configuration schemas are declared by the owning module through layered
`runtimeConfigurationSchemas` properties and served by nSystem. A schema defines
the editable paths, labels, validation, sensitivity, masking, and whether a
change is runtime-refreshable or restart-required. Custom projects should add
only genuine project-specific schema extensions or value overrides; reusable
Telegram, OpenAI, publishing, media, search, approval, assistant, and channel
configuration contracts belong to their owning framework, accelerator, or
application module.

Persisted runtime configuration records override source defaults through the
existing effective configuration layer. Updates must be validated through the
schema service, audited, masked in responses, and published as a
`runtimeConfigurationChanged` event. Runtimes that consume the changed paths
must refresh from the event when the schema marks the field refreshable. When a
field is restart-required, the event and readiness projection must say so rather
than silently relying on a page refresh or operator memory.

Cluster propagation uses the existing Nodics event/config refresh pattern:
node 1 saves the persisted value and publishes the change; every affected node
reloads the effective runtime configuration for the declared tenant/scope and
invalidates related readiness/search/assistant/publishing projections. Do not
add a second configuration bus, frontend polling authority, `.env` path, or
customer-project-specific sync table.
