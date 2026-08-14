# nLocalization examples

Resolve a trusted local policy through `DefaultLocalizationClientService.resolveContext({ tenant, site, requestedLocale, source, policy })`. In a full runtime, configure `localization.client.providerService` to the active localization authority provider and omit the local policy from ordinary callers.

Use `DefaultLocalizationScopeService.bundleKey(...)` only to derive a complete partition identity. The caller or authority owns the cache and published bundle.
