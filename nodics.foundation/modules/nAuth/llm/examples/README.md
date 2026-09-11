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
