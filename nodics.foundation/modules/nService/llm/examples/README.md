# nService AI Examples

This folder contains examples that help AI agents and developers work correctly inside the `nodics.foundation/modules/nService` module boundary.

Prefer small examples that show proper layered customization, configuration overrides, service extension, schema/router changes, tests, and documentation updates without modifying unrelated Nodics code.

For topology customization, override the smallest member of
`DefaultModulesConfigurationService` in a later module. For example, override
`normalizeModuleConfiguration` to enrich provider-derived node metadata while
retaining atomic preparation, then prove the effective override with a focused
project test. Do not create another topology container or mutate `CONFIG`.

A separate runtime can request protected remote APIs through explicit
`runtimeIdentity.remoteModules` (for example `['profile', 'inventory']`).
The provider adds these bounded codes to its active-module request. This does
not activate source modules or establish local ownership. Every requested code
still requires the same Profile deployment grant and route permission. Configure
remote endpoints through the existing server topology, including its abstract
endpoint; an endpoint alone never grants capability access. Missing remote scope
fails during protected calls rather than silently broadening the credential.

For an Inventory runtime with remote Profile, request `remoteModules: ['profile']`
under `runtimeIdentity`; approve that same module and `profile.enterprise.search`
through Profile's deployment assignment. Set the shared authentication namespace
on both runtimes to the active `auth` module and enable its distributed auth
channel with fallback disabled. Retain separate per-instance proof. Runtime
bootstrap reads the existing `/enterprise/get` capability; it cannot enumerate
another enterprise or bypass schema access using an empty group list.

A registry lease endpoint already names its canonical module API path and is preserved, including a prefix different from the logical module name. An origin-only endpoint uses the existing discovered package prefix or module name. Credentials, logical ownership and target-authority filtering remain unchanged.

Inherit authentication policy and bind deployment credentials through the existing
nAuth/nService contract. Keep provisioning proof separate from retained runtime
proof; preserve strict shared auth state and Profile grants. See the local contract.
