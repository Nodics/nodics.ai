# nSystem AI Examples

This folder contains examples that help AI agents and developers work correctly inside the `nodics.foundation/modules/nSystem` module boundary.

Prefer small examples that show proper layered customization, configuration overrides, service extension, schema/router changes, tests, and documentation updates without modifying unrelated Nodics code.

Secured service-registry API exposure defaults to enabled for runtime registration/contract retrieval. Exposure never bypasses service-token, grant or route permissions. Standalone deployments can explicitly disable the category.

A later-layer runtime may select a logical credential only after the schema's
implementing owner is active. Keep owner field metadata inherited, for example:

```js
module.exports = { runtimeConfigurationSchemas: { ownerCredential: { fields: {
    $config: 'keyed', key: 'code',
    entries: [{ code: 'botToken', credentialReference: 'deployment.identity' }]
} } } };
```

The owning module must already declare `ownerCredential` and its sensitive string
`botToken` field. This selector changes no owner, grants, schema fields or provider
enablement. In a runtime without that owner, omit the selector; an orphan partial
declaration fails admission rather than becoming a new schema.


An unconfigured deployment inherits empty schema/value/credential registries from
nSystem. It need not copy `credentials: {}` or schema defaults into its properties.
A logical credential value remains private deployment/runtime input. Configuration
status and masking do not prove provider authentication or secret persistence
readiness; the latter independently requires its selected encryption prerequisite.
