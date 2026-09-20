# nAuth AI Examples

This folder contains examples that help AI agents and developers work correctly inside the `nodics.foundation/modules/nAuth` module boundary.

Prefer small examples that show proper layered customization, configuration overrides, service extension, schema/router changes, tests, and documentation updates without modifying unrelated Nodics code.

## Example: enabling strict Redis-backed auth state

A project, environment, server, or node module should enable strict auth cache
state through layered properties, not by changing `nAuth` source:

```js
module.exports = {
    cache: {
        enabled: true,
        profile: {
            channels: {
                auth: {
                    enabled: true,
                    engine: 'redis',
                    fallback: false
                }
            },
            engines: {
                redis: {
                    enabled: true,
                    distributed: true,
                    atomicConsume: true,
                    url: process.env.NODICS_AUTH_REDIS_URL
                }
            }
        }
    }
};
```

If any activation flag is disabled, strict auth startup must fail before traffic
is accepted.

A Profile-issued customer session may pass a stable opaque externalIdentityLinkCode to buildPayload. Verify preservation in a signed access token, absence from ordinary password sessions, and rejection on service/human tokens. The same code must be revalidated by Profile before refresh.

`DefaultServiceTokenService.requireRuntimePrincipal(request, moduleName)` checks
an already verified principal for service identity, exact tenant, enterprise,
bound runtime instance/scope and the required capability. It does not validate
raw JWTs: routes must still use the existing authentication/permission pipeline,
and callers checking a stored token must first use the authorization provider.
Remote business execution also requires the owning capability's current action
proof; runtime identity alone cannot authorize a caller-supplied decision.

Inherit authentication policy and bind deployment credentials through the existing
nAuth/nService contract. Keep provisioning proof separate from retained runtime
proof; preserve strict shared auth state and Profile grants. See the local contract.

Scoped runtime route admission recognizes `userGroup` and
`serviceAccountUserGroup` as base route classes. These labels do not become JWT
groups or expand permissions. nRouter still enforces the approved module, explicit
action permission, accepted token type and deployment exposure. Administrator and
human-only groups remain ineligible; later deployment policy may narrow the list.
