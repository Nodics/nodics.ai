# redisCache AI Examples

This folder contains examples that help AI agents and developers work correctly inside the `nodics.foundation/modules/nCache/redisCache` module boundary.

Prefer small examples that show proper layered customization, configuration overrides, service extension, schema/router changes, tests, and documentation updates without modifying unrelated Nodics code.

Enable Redis while inheriting the provider prefix and connection defaults:

```js
module.exports = {
    cache: { default: { engines: { redis: { enabled: true } } } }
};
```

A deployment requiring a distinct namespace adds only its intentional
`cache.default.engines.redis.options.prefix` override.
