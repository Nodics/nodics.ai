# vService AI Examples

This folder contains examples that help AI agents and developers work correctly inside the `nodics.foundation/modules/nService/vService` module boundary.

Prefer small examples that show proper layered customization, configuration overrides, service extension, schema/router changes, tests, and documentation updates without modifying unrelated Nodics code.

## Customize Persistence Selection Safely

1. Keep generated authorization, ownership, defaults and validators intact.
2. Place a provider-method selector override in the later framework variant's
   existing save/update service, using the normal active-module hierarchy.
3. Override `resolveSaveMethod(request)` or `resolveUpdateMethod(request)` to
   return a method implemented by the effective model. For example, a qualified
   provider extension may return `saveAuditedVersionItems` for its own versioned
   model and `saveItems` for ordinary models. Missing methods must reject.
4. Retain inherited `persistModel`/`persistUpdates` and their private admission.
   Do not implement a new raw write or copy the durable-journal checks.
5. When extending `resolveReadMethod`, call `this.assertReadSafety(request)`
   before selecting a provider method. Do not infer capabilities from a mode
   string or retry an ordinary read after a rejected private protocol.
6. Run `test/managedMutationLayerContract.test.js`, read/save response tests and
   the database insert-only/durable-journal suites. The customization cases prove
   selector overrides remain effective while private guards still reject.

```text
Generated access and validation
  -> variant response adapter
  -> database private admission
       -> insert-only journal / exact conditional journal / retirement owner
       -> managed concurrency owner
       -> effective provider selector -> ordinary or versioned provider
  -> original response envelope
```

After an uncertain write, inspect through the original domain receipt contract.
Changing a provider selector cannot repair historical overwritten evidence or
authorize resubmission. This example changes no deployment settings or grants.
