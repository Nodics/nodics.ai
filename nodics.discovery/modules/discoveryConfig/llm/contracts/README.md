# discoveryConfig Contracts

`discoveryConfig` owns generic index configuration, source mix, query profile, facet profile, ranking profile, and publication policy schemas.

Domain modules may reference these records, but domain-specific nouns and source providers stay outside this module.


## Qualified configuration reads

`DefaultDiscoveryConfigurationResolverService` uses fixed internal
`/internal/configuration/index` and `/internal/configuration/query-profile` reads through
`DefaultModuleService.invokeModule`. The implementing owner defines
`discovery.config.targetAuthority`: explicit publication from the existing context
binding, with optional server/environment deployment pins. No role label or
physical host name is embedded in reusable code.

Local reads preserve the existing actor context. Remote requests carry only the
bounded tenant/query/page-size body; DMS supplies the existing internal credential.
The two routes require service tokens, `discovery.config.read` and the existing
scoped runtime module grant. Generic schema routers are disabled, so marking this
module callable does not expose generated CRUD. The controller binds middleware
tenant/actor and the owner fixes CURRENT status and a one-record limit before
calling generated persistence with the original local actor. This adds no grant.
A consumer's loaded source is not proof of local state ownership: DMS respects
remoteOnly, active-module state and publication. Missing owner qualification,
authorization and transport failures propagate. Configured profile fallback is
allowed only after a successful empty lookup (or the existing no-profile-code
path), never after an owner failure. Domain callers retain their separately owned
error policies; this does not silently change those policies.

This migration does not qualify Discovery projection writes, index alias changes,
generation publication or retirement. Their stateful callers must move through
specific owner contracts before selecting a single functional runtime. Stateless
builders/planners and domain source providers may remain source-loaded. Do not
serialize private lifecycle contexts into a generic remote service executor.


Internal routes declare their `moduleInternal` exposure default here with neutral
`inheritUnknown: true` policy. Registration preserves nRouter's existing unknown
category denial or common default; it never enables a service, grants permissions
or qualifies a provider. Later explicit category overrides remain supported.
See nRouter's capability-owned exposure contract and
`apiExposureOwnershipContract.test.js` for default, denied and override evidence.
