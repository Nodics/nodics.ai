# commsCore contracts

Status: active Phase 1C. Communication orchestration and delivery governance. Later-loaded projects may override implementation while retaining Communication ownership, security, audit, retry, and recovery invariants.

- [Durable outcome delivery](durable-outcome-delivery.md)
- [Layered template resources](template-resources.md)

## Provider configuration ownership

Communication owns inert `communication.providerTypes` technical defaults
(provider code, implementation service and timeout). No provider type may carry
credential references or secrets. A type alone never enables a channel: the
deployment must select it under `communication.providers`, with its own
credential references and policy. Selected provider fields override defaults;
arrays replace rather than merge. Explicit providers without a type retain
their existing behavior. Unknown types and credential-bearing templates are
rejected. Domain modules own neutral default template files under `src/templates`;
customer branding and source/resource selections remain customer policy. Legacy
configured text templates remain compatible, but new markup does not belong in
properties. `communicationProviderOwnership.test.js` covers provider ownership;
`communicationTemplateResources.test.js` covers presentation layering.

## Telegram Delivery Configuration Authoring

Communication owns the reusable `telegramDelivery` runtime configuration schema
in `commsCore/config/properties.js`, under the existing
`runtimeConfigurationSchemas.runtimeRoleProfiles.ENGAGEMENT` projection. nConfig
resolves and merges active contributions, then folds the selected role; nSystem
serves the resulting schema through its existing secured APIs. BackOffice/Axis
must target the actual delivery runtime. No new schema loader, registry, route or
frontend authority is introduced. Profile identity credentials are a separate
runtime responsibility even when both consumers use the same logical bot name.

The inert default schema uses `telegram.bot.delivery`, owner `commsCore`, field
`botToken`, required sensitive string validation, the Telegram token pattern,
placeholder refusals and runtime refresh. Its path is
`runtimeConfiguration.credentials[reference].value`. It supplies no credential,
key, provider selection, grant, application enablement or capture qualification.
Schema availability allows governed preparation before business activation;
it is not evidence that delivery is enabled or safe to send. Existing route
permissions and nSystem secret-persistence prerequisite checks still apply.

An application changes only the credential binding through a later contribution.
For a role-scoped selected Telegram provider, reference its existing first
`credentialReferences` entry rather than introduce another application setting:

```js
runtimeConfigurationSchemas: {
  runtimeRoleProfiles: {
    ENGAGEMENT: {
      telegramDelivery: {
        fields: [{
          credentialReference: {
            $config: "ref",
            path: ["communication", "runtimeRoleProfiles", "ENGAGEMENT",
              "providers", "TELEGRAM", "credentialReferences", "0"]
          },
          path: ["credentials", {
            $config: "ref",
            path: ["communication", "runtimeRoleProfiles", "ENGAGEMENT",
              "providers", "TELEGRAM", "credentialReferences", "0"]
          }, "value"]
        }]
      }
    }
  }
}
```

This delta merges with the framework's role profile before projection, retaining
field code/type/pattern/sensitivity and owner metadata. It does not copy the full
schema or select a provider. Reference the actual authored policy path when a
deployment selects its provider outside a role profile. A missing reference fails
configuration resolution; never invent a credential or silently use another bot.
The default form edits one explicitly selected reference, not every allowed bot.
Additional independent bot forms or another delivery role are explicit owner
schema customizations through the same configuration hierarchy; do not infer
them from domains, environment names or caller parameters.

Keep application delivery schema copies out of modules that only run on Platform
or WCMS. Removing a duplicate declaration does not migrate/delete persisted
records, synchronize separate databases or reinterpret old credential ownership.
Confirm the new schema on the correct serving runtime after its source rebuild
and restart. Installed old Platform records remain untouched. Legacy callers
must select the delivery runtime rather than expect Platform to proxy a save.

Operator sequence: inspect the delivery runtime's schema and masked effective
status, privately provision its existing encryption prerequisite through approved
deployment configuration, rebuild/restart when necessary, then use the governed
private credential form. Inspect Profile's identity runtime independently.
Unconfigured null wrappers, missing-key saves and provider failures remain closed.
Use nConfig's canonical redacted diagnostics; never expose token/key contents.
Before delivery, separately obtain business approval and qualify capture,
recipient association, consent/suppression, grants, provider policy and transport.
No credential form or successful save opens those gates.

`telegramRuntimeConfiguration.test.js` uses the actual nConfig contribution reader,
binding resolver and role projector, plus nSystem and the real Telegram credential
owner. It covers inert defaults, two independent application bindings, inherited
field safety, non-delivery-role exclusion, absent/null credentials, missing
references and agreement between configured path and provider reads. Its synthetic
success does not send a Telegram message or qualify a deployment.
