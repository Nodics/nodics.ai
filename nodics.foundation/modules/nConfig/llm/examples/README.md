# nConfig AI Examples

This folder contains examples that help AI agents and developers work correctly inside the `nodics.foundation/modules/nConfig` module boundary.

Prefer small examples that show proper layered customization, configuration overrides, service extension, schema/router changes, tests, and documentation updates without modifying unrelated Nodics code.

A customer replaces a knowledge list with `{ $config: "replace", value: [] }`; a later node can select a different list. A keyed update names `key: "code"`, explicit entries and removals. Validate malformed identities and preserve unrelated tenants.

## One deployment value, explicit aliases

The owning server declares `servers.default.endpoint.httpPort: 5400`. A peer uses
`{ $config: 'runtime', name: 'apiServer', path: 'servers.default.endpoint' }` as
its endpoint and retains `remoteOnly: true` only when that routing choice is needed.
Optional `fields: ['httpPort']` preserves HTTP-only connections; host defaults
remain nRouter-owned. A target node may override one endpoint field. Later
consumer node/tenant changes still target `servers.<alias>.endpoint` directly.

An environment declares `frontends: { editor: { port: 3400 } }`. nRouter derives
`http://localhost:3400` and its standard headers from framework defaults. Another
deployment changes `host` or `protocol` only when required. Server denials refer
to the frontend code through `originEndpointOverrides`. No profile binding or
separate environment descriptor is involved. Explicit empty sources and disabled
CORS remain supported; neither origins nor credentials authorize a protected API.

The existing pre-start `readDeploymentConfiguration` entrypoint accepts optional
`inheritedProperties` from its owning tooling caller. Apply them before authored
project/environment/server/node contributions through the same binding and merge
sequence. This preserves explicit replacement/keyed semantics for framework-owned
tooling defaults; never merge defaults back into already-resolved collections.
This projection does not activate modules or alter runtime startup authority.
