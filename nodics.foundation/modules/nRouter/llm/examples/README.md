# nRouter AI Examples

This folder contains examples that help AI agents and developers work correctly inside the `nodics.foundation/modules/nRouter` module boundary.

Prefer small examples that show proper layered customization, configuration overrides, service extension, schema/router changes, tests, and documentation updates without modifying unrelated Nodics code.

For a project-owned route contribution declaring
`apiExposure: { category: 'inventoryManagement' }`, generated OpenAPI retains
that object at `paths[path][method]['x-nodics'].apiExposure`. The request owner
resolves `apiExposure.categories.inventoryManagement.enabled`, falling back to
the configured exposure default. A disabled category rejects the request even
when the operation is present in OpenAPI. Keep route permissions, token types,
schema access and tenant checks intact. Do not add a second declaration at the
same method/path with a different exposure gate; generation must reject it.
Run `test/openapiContractGeneration.test.js` and route authorization tests when
customizing this metadata. No client-side grant can override server enforcement.

OpenAPI options retain the canonical environment/server returned by nTooling runtime metadata resolution, including short aliases. Resolve before populating runtime E/S arguments; never pass an unresolved alias into nConfig. Invalid selected servers must fail rather than fall back to a different graph.

Outbound module URLs use the existing discovered package `prefix`, matching route registration. Keep logical module identity and connection aliases unchanged; discover a remote capability source when its API prefix differs from its name.


## Extend the CORS baseline

```js
httpHardening: {
  cors: {
    allowedHeaderOverrides: { 'X-Application-Id': true },
    exposedHeaderOverrides: { ETag: true }
  }
}
```

The environment still chooses `enabled`, exact `allowedOrigins` and credential
policy separately. A later layer sets `'X-Application-Id': false` to remove it.
To clear inherited override entries, use nConfig's explicit `replace` with an
empty object. Baseline header names are matched case-insensitively; keep override
key spelling consistent across layers. Case-duplicate keys and malformed maps
reject; neither list nor map is mutated by resolution.


## Configure browser origins

An unchanged Nodics deployment needs no CORS properties. A project adds another
trusted browser origin through the existing policy, inheriting enablement and
localhost defaults from nRouter:

```js
httpHardening: {
  cors: {
    originEndpoints: {
      editor: { port: 4400 }
    }
  }
}
```

This security declaration permits `http://localhost:4400`. It contains no launch
command, repository path, readiness probe or frontend test settings. Changing it
changes API trust on the next configuration load. Frontend deployment is independent.
A later layer can set `originDefaults: { protocol: 'https', host: 'dev.example.com' }`
for structured endpoints. An endpoint can override its own host/protocol. Full
URL endpoint values instead use the host/protocol/port stated in that URL.

For another deployment, replace the local selection in that project's
`envs/<environment>/config/properties.js`:

```js
httpHardening: {
  cors: {
    enabled: true,
    originDefaults: { protocol: 'https', host: 'app.example.com' },
    originEndpoints: {
      $config: 'replace',
      value: {
        app: { port: 443 },
        editor: { host: 'editor.example.com', port: 443 }
      }
    },
    originEndpointOverrides: { $config: 'replace', value: {} },
    allowedOrigins: { $config: 'replace', value: [] },
    deniedOrigins: { $config: 'replace', value: [] }
  }
}
```

This permits `https://app.example.com` and `https://editor.example.com`.
Set `allowCredentials: true` separately if the selected browser flow needs it.
A server can set `originEndpointOverrides: { app: false }` to deny that frontend
while allowing the editor; changing the app's domain or port retains that denial.
An unknown code rejects configuration rather than silently losing the restriction.

For externally managed websites, `allowedOrigins` can hold explicit full origins.
Replace its array when removing inherited entries. If selecting only explicit
origins, also replace `originEndpoints` and `originEndpointOverrides` with empty
objects. No port wildcard or request-derived origin is needed.

nRouter enables CORS by default for the standard Nodics localhost origins: Axis 3100, Nexus 3200, Agora Apparel 3300, Electronics 3400, Telco 3500 and Circa 3600. These shared API security defaults apply independently of Platform/accelerator activation and frontend health. Environments declare only different addresses or policy; server denials and explicit disablement remain supported. nRouter never reads a frontend launch catalogue. Exact origins, header policy and route authorization remain enforced.
